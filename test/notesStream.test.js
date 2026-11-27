// Streamed AI Study Notes (SSE): events, shared cache, saved notes,
// regenerate, joining a running generation, disconnect + resume, errors,
// and the Gemini stream client's fallback rules. Fake AI; needs MongoDB.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { UserStore } from '../src/services/userStore.js';
import { PracticeStore } from '../src/services/practiceStore.js';
import { QuestionBank } from '../src/services/questionBank.js';
import { SubscriptionService } from '../src/services/subscription.js';
import { LibraryStore } from '../src/services/libraryStore.js';
import { NotesStore } from '../src/services/notesStore.js';
import { LearningProgressStore } from '../src/services/learningProgressStore.js';
import { SectionCache } from '../src/services/sectionCache.js';
import { SectionJobs } from '../src/services/sectionJobs.js';
import { NotesQuota } from '../src/services/notesQuota.js';
import { NotesCache } from '../src/services/notesCache.js';
import { NOTE_SECTIONS, NOTES_PROMPT_VERSION, completeSystemPrompt, completeUserPrompt, previewNoteContent, validateNoteContent } from '../src/services/notesGenerator.js';
import { GeminiJsonClient, streamJson } from '../src/services/geminiClient.js';
import { parsePartialJson } from '../src/services/partialJson.js';
import { AiServiceError, GenerationError } from '../src/services/questionGenerator.js';

const body = 'Work is done when a force moves its point of application through a displacement. '.repeat(8);
const fullContent = () => ({
  overview: 'Work, energy and power.',
  explanation: Array.from({ length: 6 }, (_, i) => ({ heading: `Part ${i + 1}`, body })),
  concepts: [{ term: 'Work', definition: 'W = F s cosθ' }],
  examples: [{ title: 'Ex', problem: 'F = 10 N, s = 2 m', steps: ['W = 10 × 2'], answer: '20 J' }],
  flowcharts: [], graphs: [], tables: [], codeExamples: [],
  formulas: [{ name: 'Work', expression: 'W = F s cosθ', meaning: 'F force, s displacement' }],
  tips: ['t'], mistakes: ['m'], keyPoints: ['k'], quickRevision: ['r'],
  mcqs: Array.from({ length: 8 }, (_, i) => ({ question: `Q${i}?`, options: ['a', 'b', 'c', 'd'], correctIndex: 0, explanation: 'a' })),
  nextTopics: ['AI suggestion (replaced)'],
});

// ── Pure: partial JSON, preview, prompt split, cache key ────────────────────
test('partial JSON: every prefix of a real answer is readable; preview keeps well-formed items', () => {
  const text = JSON.stringify(fullContent());
  let unreadable = 0;
  for (let i = 20; i <= text.length; i += 7) if (parsePartialJson(text.slice(0, i)) === null) unreadable++;
  assert.equal(unreadable, 0);
  assert.deepEqual(parsePartialJson(text), fullContent());
  const half = previewNoteContent(parsePartialJson(text.slice(0, Math.floor(text.length * 0.4))));
  assert.ok(half.overview && half.explanation.length >= 1 && half.mcqs.length === 0, 'MCQs only once complete');
  assert.equal(previewNoteContent(parsePartialJson('{"over')), null);
});

test('prompt: static system prefix per subject; request-specific part only in the user message', () => {
  const sys = completeSystemPrompt('GENERAL SCIENCE guide');
  assert.equal(sys, completeSystemPrompt('GENERAL SCIENCE guide'), 'identical prefix → cacheable');
  assert.ok(sys.includes('Cover EVERY subtopic') && sys.includes('GENERAL SCIENCE guide'));
  const user = completeUserPrompt({ exam: { name: 'RRB Group D' }, subject: { name: 'GS' }, topic: { name: 'Work' }, language: 'hi', scope: '- Work\n  - Zero work' });
  assert.ok(user.includes('- Zero work') && user.includes('कार्य (Work)'));
  assert.ok(!user.includes('Cover EVERY subtopic'), 'guide is not repeated per request');
  assert.ok(!sys.includes('RRB Group D'), 'no request data in the cached prefix');
});

test('cache key changes with language, syllabus version and prompt version', () => {
  const k = (x = {}) => NotesCache.key({ examId: 'rrb_group_d', targetId: 'gs.physics.work_energy', language: 'en', syllabusVersion: 1, ...x });
  assert.equal(k(), k());
  assert.notEqual(k(), k({ language: 'hi' }));
  assert.notEqual(k(), k({ syllabusVersion: 2 }));
  assert.notEqual(k(), k({ examId: 'rrb_alp' }));
  assert.equal(NOTES_PROMPT_VERSION, 2);
});

// ── Gemini stream client ─────────────────────────────────────────────────────
const sseResponse = (chunks, { status = 200, breakAfter = null, eol = '\n' } = {}) => {
  const enc = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream({
    pull(ctl) {
      if (breakAfter !== null && i === breakAfter) return ctl.error(new Error('socket hang up'));
      if (i >= chunks.length) return ctl.close();
      ctl.enqueue(enc.encode(`data: ${JSON.stringify(chunks[i++])}${eol}${eol}`));
    },
  });
  return new Response(stream, { status, headers: { 'content-type': 'text/event-stream' } });
};
const textChunks = (text, n = 5, finish = 'STOP') => {
  const size = Math.ceil(text.length / n);
  return Array.from({ length: n }, (_, i) => ({
    candidates: [{ content: { parts: [{ text: text.slice(i * size, (i + 1) * size) }] }, ...(i === n - 1 ? { finishReason: finish } : {}) }],
    ...(i === n - 1 ? { usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 5000, cachedContentTokenCount: 0 } } : {}),
  }));
};
const client = (responses) => {
  const seen = [];
  const c = new GeminiJsonClient({
    apiKey: 'k',
    timeoutMs: 5000,
    log: { warn() {}, error() {} },
    fetchImpl: async (url) => {
      seen.push(url.split('/models/')[1].split(':')[0]);
      const r = responses.shift();
      return typeof r === 'function' ? r() : r;
    },
  });
  return { c, seen };
};
const overloaded = () => new Response(JSON.stringify({ error: { status: 'UNAVAILABLE', message: 'high demand' } }), { status: 503 });

test('stream client: chunks arrive progressively; usage and time to first token recorded', async () => {
  const text = JSON.stringify(fullContent());
  const { c } = client([sseResponse(textChunks(text))]);
  const seenLengths = [];
  const r = await streamJson(c, { models: ['m1'], label: 't', systemPrompt: '', prompt: '', schema: {}, onText: (t) => seenLengths.push(t.length) });
  assert.equal(seenLengths.length, 5);
  assert.ok(seenLengths.every((n, i) => i === 0 || n > seenLengths[i - 1]));
  assert.deepEqual(r.json, fullContent());
  assert.equal(r.usage.candidatesTokenCount, 5000);
  assert.ok(r.ttfbMs !== null && r.aiMs >= r.ttfbMs);
});

test('stream client: CRLF-separated events (as Gemini sends them) are read', async () => {
  const text = JSON.stringify(fullContent());
  const { c } = client([sseResponse(textChunks(text), { eol: '\r\n' })]);
  const r = await streamJson(c, { models: ['m1'], label: 't', systemPrompt: '', prompt: '', schema: {} });
  assert.deepEqual(r.json, fullContent());
});

test('stream client: fallback only BEFORE output; interrupted / cut-off output is final (no second paid call)', async () => {
  const text = JSON.stringify(fullContent());
  // Overloaded before any output → next model.
  let x = client([overloaded(), sseResponse(textChunks(text))]);
  assert.equal((await streamJson(x.c, { models: ['m1', 'm2'], label: 't', systemPrompt: '', prompt: '', schema: {} })).model, 'm2');
  assert.deepEqual(x.seen, ['m1', 'm2']);
  // Broken after output started → AI_INTERRUPTED-type error, m2 never called.
  x = client([sseResponse(textChunks(text), { breakAfter: 2 }), sseResponse(textChunks(text))]);
  const err = await streamJson(x.c, { models: ['m1', 'm2'], label: 't', systemPrompt: '', prompt: '', schema: {} }).catch((e) => e);
  assert.ok(err instanceof GenerationError && err.interrupted && err.partial);
  assert.deepEqual(x.seen, ['m1']);
  // MAX_TOKENS → never saved, not retried.
  x = client([sseResponse(textChunks(text, 4, 'MAX_TOKENS')), sseResponse(textChunks(text))]);
  const cut = await streamJson(x.c, { models: ['m1', 'm2'], label: 't', systemPrompt: '', prompt: '', schema: {} }).catch((e) => e);
  assert.match(cut.message, /cut off/);
  assert.deepEqual(x.seen, ['m1']);
});

// ── HTTP (SSE) ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const DB = 'examgenius_test_notes_stream';
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  notes: {},
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 40, generationsPerHour: 500, notesPerHour: 500 },
  practice: { secondsPerQuestion: 60, correctMark: 1, negativeMark: 0.25 },
  plans: {
    free: { setsPerDay: 1000, aiSetsPerDay: null, maxQuestionsPerSet: 30, maxSaved: 1000, customCount: false },
    pro: { questionsPerDay: 300, aiSetsPerDay: null, maxQuestionsPerSet: 40, customCount: true },
    trialDays: 7,
    offers: [],
  },
};

/** Streams 3 partials, then the full content; `gate` holds it mid-way. */
const fake = {
  calls: 0,
  gate: null,
  failNext: null,
  requests: [],
  async generateStream(req, { onPartial }) {
    this.calls++;
    this.requests.push(req);
    if (this.failNext) {
      const e = this.failNext;
      this.failNext = null;
      throw e;
    }
    const full = fullContent();
    onPartial(previewNoteContent({ overview: full.overview }));
    onPartial(previewNoteContent({ overview: full.overview, explanation: full.explanation.slice(0, 2) }));
    if (this.gate) await this.gate;
    onPartial(previewNoteContent({ ...full, mcqs: [] }));
    return { content: validateNoteContent(full, NOTE_SECTIONS, { coverage: 'complete' }), model: 'fake', usage: { promptTokenCount: 1, candidatesTokenCount: 2 }, ttfbMs: 5, aiMs: 20 };
  },
};

let db;
let server;
let base;
const tokens = {};
before(async () => {
  const fresh = await connectDb({ uri: MONGO_URI, db: DB });
  await fresh.db.dropDatabase();
  await fresh.client.close();
  db = await connectDb({ uri: MONGO_URI, db: DB });
  const app = createApp({
    config,
    users: new UserStore(db.users),
    practice: new PracticeStore(db, config.practice),
    questionGenerator: { generate: async () => ({ questions: [], isPreview: true }) },
    bank: new QuestionBank(db.questionBank, db.sessions),
    subscription: new SubscriptionService(db, config.plans),
    library: new LibraryStore(db),
    notes: new NotesStore(db),
    progress: new LearningProgressStore(db),
    sectionCache: new SectionCache(db),
    sectionJobs: new SectionJobs(db),
    notesQuota: new NotesQuota(db, { perHour: 500 }),
    sectionGenerator: { generate: async () => { throw new Error('unused'); } },
    notesGenerator: fake,
    notesCache: new NotesCache(db),
  });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
  for (const [n, mobile] of [['a', '9300000001'], ['b', '9300000002'], ['c', '9300000003']]) {
    const r = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Stream Tester', mobile, password: 'password123', targetExamId: 'rrb_group_d' }),
    });
    tokens[n] = (await r.json()).token;
  }
});
after(async () => {
  server?.close();
  await db.db.dropDatabase();
  await db.client.close();
});

/** Opens the stream and collects events until it ends (or `stopAfter` says stop). */
async function stream(user, payload, { stopAfter = null } = {}) {
  const ctl = new AbortController();
  const res = await fetch(`${base}/notes/generate/stream`, {
    method: 'POST',
    signal: ctl.signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tokens[user]}` },
    body: JSON.stringify(payload),
  });
  if (!res.headers.get('content-type')?.startsWith('text/event-stream')) return { status: res.status, json: await res.json(), events: [] };
  const events = [];
  let aborted = false;
  const dec = new TextDecoder();
  let buf = '';
  try {
    for await (const bytes of res.body) {
      buf += dec.decode(bytes, { stream: true });
      let cut;
      while ((cut = buf.indexOf('\n\n')) >= 0) {
        const raw = buf.slice(0, cut);
        buf = buf.slice(cut + 2);
        const name = /^event: (.+)$/m.exec(raw)?.[1];
        const data = /^data: (.+)$/m.exec(raw)?.[1];
        if (name) events.push({ name, data: JSON.parse(data) });
        if (stopAfter?.(events)) {
          aborted = true;
          ctl.abort();
          return { status: res.status, events, aborted };
        }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
  return { status: res.status, events, aborted };
}
const NODE = 'gs.physics.work_energy';
const req = (key, extra = {}) => ({ examId: 'rrb_group_d', nodeId: NODE, language: 'en', requestKey: key, ...extra });
const names = (r) => r.events.map((e) => (e.name === 'status' ? `status:${e.data.stage}` : e.name));
const done = (r) => r.events.find((e) => e.name === 'done')?.data;

test('first request streams: checking → generating → partials → saving → done; saved + cached + counted once', async () => {
  const quota = await db.aiGenerationLog.countDocuments({});
  const r = await stream('a', req('stream-key-a-0001'));
  assert.deepEqual(names(r).filter((n, i, a) => n !== 'partial' || a[i - 1] !== 'partial'), ['status:checking', 'status:generating', 'partial', 'status:saving', 'done']);
  assert.ok(r.events.filter((e) => e.name === 'partial').length >= 3);
  const partials = r.events.filter((e) => e.name === 'partial').map((e) => e.data.content.explanation.length);
  assert.ok(partials.at(-1) > partials[0], 'content grows');
  const d = done(r);
  assert.equal(d.source, 'ai');
  assert.equal(d.note.content.explanation.length, 6);
  assert.deepEqual(d.note.content.nextTopics.map((t) => typeof t.id), d.note.content.nextTopics.map(() => 'string'), 'next topics from the syllabus');
  assert.ok(d.timing.totalMs >= 0 && d.timing.dbMs >= 0 && d.timing.aiMs === 20);
  const saved = await db.studyNotes.findOne({ _id: d.note.id });
  assert.equal(saved.coverage, 'complete');
  assert.ok(saved.cacheKey);
  assert.ok(await db.notesCache.findOne({ _id: saved.cacheKey }));
  assert.equal(await db.aiGenerationLog.countDocuments({}), quota + 1);
  assert.equal(fake.calls, 1);
});

test('another student, same topic: served from the shared cache at once (no AI call, not counted)', async () => {
  const quota = await db.aiGenerationLog.countDocuments({});
  const r = await stream('b', req('stream-key-b-0001'));
  assert.deepEqual(names(r), ['status:checking', 'done']);
  assert.equal(done(r).source, 'cache');
  assert.equal(fake.calls, 1);
  assert.equal(await db.aiGenerationLog.countDocuments({}), quota);
  assert.equal(await db.studyNotes.countDocuments({ cacheKey: { $exists: true } }), 2, 'own Library copy');
  // Same student again (new request) → their saved note, no new copy.
  const again = await stream('b', req('stream-key-b-0002'));
  assert.equal(done(again).source, 'saved');
  assert.equal(done(again).note.id, done(r).note.id);
});

test('regenerate skips saved/cached copies and replaces the shared copy', async () => {
  const r = await stream('b', req('stream-key-b-regen', { regenerate: true }));
  assert.equal(done(r).source, 'ai');
  assert.equal(fake.calls, 2);
  assert.notEqual(done(r).note.id, (await db.studyNotes.findOne({ requestKey: 'stream-key-b-0001' }))._id);
});

test('two students start the same new topic together: ONE AI call, the second joins the stream', async () => {
  let release;
  fake.gate = new Promise((r) => (release = r));
  const before = fake.calls;
  const p1 = stream('a', req('join-a-0001', { language: 'hi' }));
  await new Promise((r) => setTimeout(r, 80));
  const p2 = stream('c', req('join-c-0001', { language: 'hi' }));
  await new Promise((r) => setTimeout(r, 80));
  release();
  const [r1, r2] = await Promise.all([p1, p2]);
  fake.gate = null;
  assert.equal(fake.calls, before + 1);
  assert.deepEqual([done(r1).source, done(r2).source].sort(), ['ai', 'joined']);
  const joined = [r1, r2].find((r) => done(r).source === 'joined');
  assert.equal(joined.events.find((e) => e.name === 'status' && e.data.stage === 'generating').data.joined, true);
  assert.ok(joined.events.some((e) => e.name === 'partial'), 'joiner sees the text written so far');
  assert.notEqual(done(r1).note.id, done(r2).note.id, 'each student gets their own note');
});

test('app disconnects mid-stream: generation finishes and saves; reconnect with the same key returns it', async () => {
  let release;
  fake.gate = new Promise((r) => (release = r));
  const before = fake.calls;
  const payload = req('drop-a-0001', { nodeId: 'gs.physics.motion' });
  const first = await stream('a', payload, { stopAfter: (ev) => ev.some((e) => e.name === 'partial') });
  assert.ok(first.aborted);
  release();
  fake.gate = null;
  // Give the server a moment to finish and save.
  for (let i = 0; i < 50 && !(await db.studyNotes.findOne({ requestKey: 'drop-a-0001' })); i++) await new Promise((r) => setTimeout(r, 20));
  const resumed = await stream('a', payload);
  assert.deepEqual(names(resumed), ['status:checking', 'done']);
  assert.equal(done(resumed).source, 'saved');
  assert.equal(fake.calls, before + 1, 'no second generation');
});

test('AI failure → error event with a specific code; nothing saved; invalid ids → 400 before streaming', async () => {
  const notesBefore = await db.studyNotes.countDocuments({});
  fake.failNext = new AiServiceError('HTTP 503 UNAVAILABLE: high demand', true);
  const r = await stream('c', req('fail-c-0001', { nodeId: 'gs.physics.light' }));
  const err = r.events.find((e) => e.name === 'error');
  assert.equal(err.data.code, 'AI_OVERLOADED');
  fake.failNext = Object.assign(new GenerationError('The AI stream was interrupted. Nothing was saved.'), { interrupted: true });
  const r2 = await stream('c', req('fail-c-0002', { nodeId: 'gs.physics.light' }));
  assert.equal(r2.events.find((e) => e.name === 'error').data.code, 'AI_INTERRUPTED');
  assert.equal(await db.studyNotes.countDocuments({}), notesBefore);
  const bad = await stream('c', req('fail-c-0003', { nodeId: 'gs.nope' }));
  assert.equal(bad.status, 400);
  assert.equal(bad.json.code, 'INVALID_NODES');
});
