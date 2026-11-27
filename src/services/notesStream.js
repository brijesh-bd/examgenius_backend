import { NOTE_SECTIONS } from './notesGenerator.js';
import { NotesCache } from './notesCache.js';

/**
 * POST /notes/generate/stream — complete AI Study Notes as Server-Sent Events.
 *
 * Events (each `event: <name>\ndata: <json>\n\n`):
 *   status  {stage: checking | generating | saving, joined?}
 *   partial {content}        readable part of the answer so far (throttled)
 *   done    {source: saved | cache | ai | joined, note, timing}
 *   error   {code, error}    nothing was saved or counted
 *
 * Order: this request's saved note (requestKey) → the student's saved note
 * for the same cache key → the shared notes cache → join a generation of the
 * same topic already running → ONE new streamed generation. The note is
 * saved even if the app disconnects; reconnecting with the same requestKey
 * returns it (or joins the still-running generation). `regenerate: true`
 * skips the saved/cached copies.
 */
export function registerNotesStream(api, deps) {
  const { requireAuth, findExam, resolveNotesTarget, parseBody, notes, notesQuota, notesGenerator, notesCache, toPublicNote, aiErrorInfo, log = console } = deps;
  /** cacheKey → { promise, listeners, lastPartial } — one AI generation per topic at a time. */
  const jobs = new Map();

  function startJob(cacheKey, exam, target, language) {
    const job = { listeners: new Set(), lastPartial: null };
    job.promise = (async () => {
      // Start on the next tick, after the starting request attached its listener.
      await null;
      const r = await notesGenerator.generateStream(
        {
          exam,
          subject: target.subject,
          topic: target.topic,
          concept: target.concept,
          language,
          scope: target.scope,
          subjectGuide: target.subjectGuide,
          coverage: 'complete',
          sections: NOTE_SECTIONS,
        },
        {
          onPartial: (content) => {
            job.lastPartial = content;
            for (const l of job.listeners) l(content);
          },
        },
      );
      // "Study next" always comes from the syllabus (real ids), never the AI.
      const content = { ...r.content, nextTopics: target.nextTopics };
      const t = Date.now();
      if (notesCache) {
        await notesCache.put(cacheKey, {
          examId: exam.id,
          targetId: target.targetId,
          language,
          coverage: 'complete',
          syllabusVersion: target.syllabusVersion,
          content,
          model: r.model,
          usage: r.usage ?? null,
          createdAt: new Date(),
        });
      }
      return { ...r, content, cacheWriteMs: Date.now() - t };
    })();
    job.promise.catch(() => {}).finally(() => jobs.delete(cacheKey));
    jobs.set(cacheKey, job);
    return job;
  }

  api.post('/notes/generate/stream', requireAuth, async (req, res) => {
    const body = parseBody(req.body ?? {});
    const regenerate = req.body?.regenerate === true;
    const exam = findExam(body.examId);
    if (!exam) throw Object.assign(new Error('Unknown exam'), { status: 404 });
    // Invalid syllabus ids fail here as a normal JSON 400, before streaming.
    const target = resolveNotesTarget(exam, body);
    const userId = req.user._id;
    const language = body.language;

    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    });
    res.flushHeaders?.();
    let closed = false;
    res.on('close', () => (closed = true));
    const send = (event, data) => {
      if (!closed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    // Keeps proxies and mobile networks from dropping a quiet connection.
    const ping = setInterval(() => !closed && res.write(': ping\n\n'), 15_000);

    const started = Date.now();
    const timing = { dbMs: 0, aiMs: null, ttfbMs: null };
    const db = async (fn) => {
      const t = Date.now();
      try {
        return await fn();
      } finally {
        timing.dbMs += Date.now() - t;
      }
    };
    const cacheKey = NotesCache.key({
      examId: exam.id,
      targetId: target.targetId,
      language,
      coverage: 'complete',
      syllabusVersion: target.syllabusVersion,
    });
    const save = (content, model) =>
      notes.create({
        userId,
        requestKey: body.requestKey ?? null,
        exam,
        subject: target.subject,
        topic: target.topic,
        parentTopic: target.parentTopic,
        unitName: target.unitName,
        language,
        level: 'exam',
        sections: NOTE_SECTIONS,
        content,
        model,
        extra: { ...target.extra, coverage: 'complete', cacheKey },
      });
    const finish = (note, source, usage = null) => {
      timing.totalMs = Date.now() - started;
      send('done', { source, note: toPublicNote(note), timing });
      const u = usage ?? {};
      log.log?.(
        `[notes-stream] ${exam.id} ${target.targetId} ${language} source=${source} total=${timing.totalMs}ms` +
          ` ai=${timing.aiMs ?? '-'}ms ttfb=${timing.ttfbMs ?? '-'}ms db=${timing.dbMs}ms` +
          ` tokens in=${u.promptTokenCount ?? '-'} out=${u.candidatesTokenCount ?? '-'} cached=${u.cachedContentTokenCount ?? 0} thoughts=${u.thoughtsTokenCount ?? 0}`,
      );
    };

    try {
      send('status', { stage: 'checking' });
      const previous = await db(() => notes.findByRequestKey(userId, body.requestKey));
      if (previous) return finish(previous, 'saved');
      if (!regenerate) {
        const own = await db(() => notes.findByCacheKey(userId, cacheKey));
        if (own) return finish(own, 'saved');
        const shared = notesCache ? await db(() => notesCache.get(cacheKey)) : null;
        if (shared) {
          const { note } = await db(() => save(shared.content, shared.model));
          return finish(note, 'cache');
        }
      }
      await db(() => notesQuota.check(userId));

      let job = jobs.get(cacheKey);
      const joined = Boolean(job);
      if (!job) job = startJob(cacheKey, exam, target, language);
      send('status', { stage: 'generating', joined });
      if (job.lastPartial) send('partial', { content: job.lastPartial });
      const listener = (content) => send('partial', { content });
      job.listeners.add(listener);
      let result;
      try {
        result = await job.promise;
      } finally {
        job.listeners.delete(listener);
      }
      timing.aiMs = result.aiMs;
      timing.ttfbMs = result.ttfbMs;
      timing.dbMs += result.cacheWriteMs ?? 0;

      send('status', { stage: 'saving' });
      const { note, created } = await db(() => save(result.content, result.model));
      // Only the request that started the AI call is counted; joiners got it free.
      if (created && !joined) {
        await db(() =>
          notesQuota.record(userId, {
            topicId: target.targetId,
            stream: true,
            model: result.model,
            aiMs: result.aiMs,
            ttfbMs: result.ttfbMs,
            usage: result.usage ?? null,
          }),
        );
      }
      return finish(note, joined ? 'joined' : 'ai', result.usage);
    } catch (err) {
      const ai = aiErrorInfo(err);
      const out = ai
        ? ai.body
        : { error: err.status ? err.message : 'Something went wrong', code: err.code ?? (err.status === 429 ? 'NOTES_HOURLY' : 'SERVER_ERROR') };
      if (!ai && !err.status) log.error?.(err);
      log.log?.(`[notes-stream] ${exam.id} ${target.targetId} ${language} failed after ${Date.now() - started}ms: ${out.code}`);
      send('error', out);
    } finally {
      clearInterval(ping);
      res.end();
    }
  });
}
