import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

import { aiMode } from './config.js';
import { findExam, findLearningItem, getSyllabus, learningItems, listCategories, topicIndex } from './services/examService.js';
import { toPublicUser } from './services/userStore.js';
import { toPublicSet } from './services/libraryStore.js';
import { toPublicResult, toPublicSaved, toPublicSession } from './services/practiceStore.js';
import { AiServiceError, GenerationError } from './services/questionGenerator.js';
import { NOTE_LEVELS, NOTE_SECTIONS, validateNoteContent } from './services/notesGenerator.js';
import { toPublicNote } from './services/notesStore.js';
import { SectionCache } from './services/sectionCache.js';
import { LEARNING_MODES, SECTION_PROMPT_VERSION } from './services/sectionGenerator.js';
import { findOutline, outlineSections } from './data/outlines/index.js';
import { LimitError } from './services/subscription.js';

const mobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const identifier = z
  .string()
  .trim()
  .refine(
    (v) => /^[6-9]\d{9}$/.test(v) || /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v),
    'Enter a valid email or 10-digit mobile number',
  );

const RegisterBody = z.object({
  name: z.string().trim().min(2).max(80),
  mobile,
  email: z.email().optional().nullable(),
  password: z.string().min(8).max(128),
  targetExamId: z.string(),
});

// `identifier` (email or mobile); `mobile` kept for older app builds.
const LoginBody = z
  .object({
    identifier: identifier.optional(),
    mobile: mobile.optional(),
    password: z.string().min(1),
  })
  .refine((b) => b.identifier || b.mobile, 'Enter your email or mobile number');

/**
 * Builds the Express app. Dependencies are injected so tests can use a test
 * database and a fake generator. Express 5 forwards rejected promises from
 * async handlers to the error handler.
 */
export function createApp({
  config,
  users,
  practice,
  questionGenerator,
  bank,
  subscription,
  library,
  notes,
  notesGenerator,
  progress,
  sectionCache,
  notesQuota,
  sectionGenerator,
  logRequests = false,
}) {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '200kb' }));

  // One line per request: "POST /api/v1/auth/login 200 85ms" (server only, not tests).
  if (logRequests) {
    app.use((req, res, next) => {
      const t = Date.now();
      res.on("finish", () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - t}ms`));
      next();
    });
  }

  const api = express.Router();
  app.use('/api/v1', api);

  // ── Health ────────────────────────────────────────────────────────────────
  api.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      aiMode: aiMode(config),
      models: config.ai.geminiApiKey ? config.ai.geminiModels : [],
    });
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 50 });

  const issueToken = (user) =>
    jwt.sign({ sub: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  api.post('/auth/register', authLimiter, async (req, res) => {
    const body = RegisterBody.parse(req.body);
    if (!findExam(body.targetExamId)) throw httpError(400, 'Unknown targetExamId');
    if (await users.findByMobile(body.mobile)) {
      throw httpError(409, 'This mobile number is already registered');
    }
    if (body.email && (await users.findByEmail(body.email))) {
      throw httpError(409, 'This email is already registered');
    }
    const user = await users.create({
      name: body.name,
      mobile: body.mobile,
      email: body.email ?? null,
      targetExamId: body.targetExamId,
      passwordHash: await bcrypt.hash(body.password, 10),
    });
    res.status(201).json({ token: issueToken(user), user: toPublicUser(user) });
  });

  api.post('/auth/login', authLimiter, async (req, res) => {
    const body = LoginBody.parse(req.body);
    const user = await users.findByIdentifier(body.identifier ?? body.mobile);
    const ok = user && (await bcrypt.compare(body.password, user.passwordHash));
    if (!ok) throw httpError(401, 'Invalid email/mobile or password');
    res.json({ token: issueToken(user), user: toPublicUser(user) });
  });

  // No email/SMS provider is configured yet: always answer the same way so the
  // endpoint cannot be used to discover which accounts exist.
  api.post('/auth/forgot-password', authLimiter, async (req, res) => {
    const { identifier: id } = z.object({ identifier }).parse(req.body);
    const user = await users.findByIdentifier(id);
    if (user) {
      console.info(`Password reset requested for user ${user._id} (no delivery provider configured)`);
    }
    res.status(202).json({ status: 'sent' });
  });

  const requireAuth = async (req, _res, next) => {
    const header = req.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    try {
      const { sub } = jwt.verify(token ?? '', config.jwtSecret);
      req.user = await users.findById(sub);
    } catch {
      req.user = null;
    }
    if (!req.user) throw httpError(401, 'Please log in again');
    next();
  };

  api.get('/auth/me', requireAuth, (req, res) => res.json({ user: toPublicUser(req.user) }));

  api.patch('/auth/me', requireAuth, async (req, res) => {
    const { targetExamId } = z.object({ targetExamId: z.string() }).parse(req.body);
    if (!findExam(targetExamId)) throw httpError(400, 'Unknown targetExamId');
    res.json({ user: toPublicUser(await users.update(req.user._id, { targetExamId })) });
  });

  // ── Exams & syllabus ──────────────────────────────────────────────────────
  api.get('/exams', (_req, res) => res.json({ categories: listCategories() }));

  api.get('/exams/:examId/syllabus', (req, res) => {
    const syllabus = getSyllabus(req.params.examId);
    if (!syllabus) throw httpError(404, 'Syllabus not found');
    res.json(syllabus);
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  api.get('/dashboard/summary', requireAuth, async (req, res) => {
    const results = await practice.recentResults(req.user._id, 100);
    const attempted = results.reduce((n, r) => n + r.correct + r.incorrect, 0);
    const correct = results.reduce((n, r) => n + r.correct, 0);
    const pct = (r) => (r.maxScore ? Math.max(0, r.score) / r.maxScore : 0);
    const stats = req.user.stats ?? {};
    res.json({
      targetExamId: req.user.targetExamId,
      questionsGenerated: stats.questionsGenerated ?? 0,
      generations: stats.generations ?? 0,
      testsTaken: results.length,
      accuracy: attempted === 0 ? 0 : correct / attempted,
      avgScore: results.length === 0 ? 0 : (results.reduce((s, r) => s + pct(r), 0) / results.length) * 100,
      recentResults: results.slice(0, 3).map((r) => ({
        testName: `${r.examName} · ${r.subjects.join(', ')}`,
        score: r.score,
        maxScore: r.maxScore,
        accuracy: r.accuracy,
        takenAt: new Date(r.completedAt).toISOString(),
        questionCount: r.total,
      })),
      unreadNotifications: 0,
    });
  });

  // ── AI question generation → practice session ─────────────────────────────
  const GenerateBody = z.object({
    examId: z.string(),
    examName: z.string().optional(),
    topicIds: z.array(z.string()).min(1).max(40),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    count: z.number().int().min(1).max(config.ai.maxQuestionsPerRequest),
    level: z.literal('exam').optional(),
    language: z.enum(['en', 'hi']).optional(),
    // Pro: skip the bank and generate brand-new questions with AI.
    fresh: z.boolean().optional(),
    // Unique per generate tap: a retried request returns the set already saved.
    requestKey: z.string().min(8).max(100).optional(),
  });

  const generateLimiter = rateLimit({
    windowMs: 60 * 60_000,
    limit: config.ai.generationsPerHour,
    keyGenerator: (req) => req.user._id,
    message: { error: 'Hourly generation limit reached. Please try again later.' },
  });

  api.post('/questions/generate', requireAuth, generateLimiter, async (req, res) => {
    const body = GenerateBody.parse(req.body);
    const exam = findExam(body.examId);
    if (!exam) throw httpError(404, 'Unknown exam');

    const index = topicIndex(exam.id);
    const topics = [...new Set(body.topicIds)].map((id) => {
      const entry = index.get(id);
      if (!entry) throw httpError(400, `Topic ${id} is not in the ${exam.name} syllabus`);
      return { id, name: entry.topic.name, subjectId: entry.subject.id, subjectName: entry.subject.name };
    });

    // Retried request (network drop, double tap): same set, no new quota used.
    const previous = await library.findByRequestKey(req.user._id, body.requestKey);
    if (previous) {
      const s = await practice.findSession(req.user._id, previous.sessionId);
      if (s) return res.status(201).json(toPublicSession(s));
    }

    const language = body.language ?? 'en';
    const fresh = Boolean(body.fresh);

    // Plan check + atomic reservation of today's quota (Free: sets/day; Pro: fair use).
    const reservation = await subscription.reserveGeneration(req.user, { count: body.count, fresh });

    let questions;
    let isPreview = false;
    let aiCount = 0;
    let bankCount = 0;
    let model = null;
    try {
      // 1) Question bank first (free to serve), skipping what this student has seen.
      const fromBank = fresh
        ? []
        : await bank.pick({
            topicIds: topics.map((t) => t.id),
            difficulty: body.difficulty,
            language,
            count: body.count,
            excludeIds: await bank.seenBy(req.user._id),
          });
      bankCount = fromBank.length;

      // 2) AI only for the shortfall; new AI questions go into the bank.
      let generatedQs = [];
      const missing = body.count - fromBank.length;
      if (missing > 0) {
        const generated = await questionGenerator.generate({
          exam,
          topics,
          difficulty: body.difficulty,
          count: missing,
          language,
        });
        isPreview = generated.isPreview && generated.questions.length > 0;
        generatedQs = generated.isPreview
          ? generated.questions
          : await bank.add(generated.questions, { examId: exam.id, language, model: generated.model });
        aiCount = generated.isPreview ? 0 : generatedQs.length;
        model = generated.model ?? null;
      }
      questions = [...fromBank, ...generatedQs];
    } catch (err) {
      await subscription.release(reservation);
      throw err;
    }
    if (questions.length === 0) {
      await subscription.release(reservation);
    } else if (questions.length < body.count) {
      await subscription.release(reservation, {
        unusedQuestions: body.count - questions.length,
        refundSet: false,
      });
    }

    const names = new Map(topics.map((t) => [t.id, t.name]));
    const setId = questions.length ? crypto.randomUUID() : null;
    const session = await practice.createSession({
      setId,
      userId: req.user._id,
      exam,
      subjects: [...new Set(topics.map((t) => t.subjectName))],
      topics: topics.map((t) => t.name),
      difficulty: body.difficulty,
      requestedCount: body.count,
      isPreview,
      questions: questions.map((q) => ({
        ...q,
        topicName: names.get(q.topicId) ?? index.get(q.topicId)?.topic.name ?? q.topicId,
      })),
    });

    // My Learning Library: every successful generation is saved automatically.
    if (setId) {
      const subjectsById = new Map(topics.map((t) => [t.subjectId, t.subjectName]));
      const { set, created } = await library.createSet({
        id: setId,
        userId: req.user._id,
        requestKey: body.requestKey ?? null,
        exam,
        subjects: [...subjectsById].map(([id, name]) => ({ id, name })),
        topics: topics.map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId })),
        difficulty: body.difficulty,
        language,
        questions: session.questions,
        sessionId: session._id,
        model,
        source: { bank: bankCount, ai: aiCount },
        isPreview,
      });
      if (!created) {
        // A parallel duplicate request won the race: answer with its test.
        await subscription.release(reservation);
        const s = await practice.findSession(req.user._id, set.sessionId);
        return res.status(201).json(toPublicSession(s));
      }
    }

    await users.incrementStats(req.user._id, {
      generations: 1,
      questionsGenerated: aiCount,
    });
    res.status(201).json(toPublicSession(session));
  });

  // ── Practice: submit, retry, saved ────────────────────────────────────────
  const SubmitBody = z.object({
    answers: z.record(z.string(), z.number().int().min(0).max(9)),
    timeTakenSeconds: z.number().min(0).max(24 * 3600),
    autoSubmitted: z.boolean().optional(),
  });

  api.post('/practice/:sessionId/submit', requireAuth, async (req, res) => {
    const body = SubmitBody.parse(req.body);
    const session = await practice.findSession(req.user._id, req.params.sessionId);
    if (!session) throw httpError(404, 'Test not found');
    const result = await practice.submit(session, body);
    // Full test of a Library set → a new attempt in its history (idempotent).
    if (session.setId) {
      const set = await library.findSet(req.user._id, session.setId);
      if (set) await library.recordAttempt(set, result);
    }
    res.json(toPublicResult(result));
  });

  api.get('/practice/results/:resultId', requireAuth, async (req, res) => {
    const result = await practice.findResult(req.user._id, req.params.resultId);
    if (!result) throw httpError(404, 'Result not found');
    res.json(toPublicResult(result));
  });

  const RetryBody = z.object({
    resultId: z.string(),
    questionIds: z.array(z.string()).min(1).max(200),
  });

  api.post('/practice/retry', requireAuth, async (req, res) => {
    const body = RetryBody.parse(req.body);
    const result = await practice.findResult(req.user._id, body.resultId);
    if (!result) throw httpError(404, 'Result not found');
    const original = await practice.findSession(req.user._id, result.sessionId);
    if (!original) throw httpError(404, 'Original test not found');

    const ids = new Set(body.questionIds);
    const questions = original.questions
      .filter((q) => ids.has(q.id))
      // New ids: the retry is a separate attempt; the original stays unchanged.
      .map((q) => ({ ...q, id: crypto.randomUUID() }));
    if (questions.length === 0) throw httpError(400, 'None of those questions are in this result');

    const session = await practice.createSession({
      userId: req.user._id,
      exam: { id: original.examId, name: original.examName },
      subjects: original.subjects,
      topics: original.topics,
      difficulty: original.difficulty,
      requestedCount: questions.length,
      isPreview: original.isPreview,
      questions,
      retryOf: result._id,
    });
    res.status(201).json(toPublicSession(session));
  });

  api.get('/practice/topic-stats', requireAuth, async (req, res) => {
    res.json({ topics: await practice.topicStats(req.user._id) });
  });

  api.get('/practice/saved', requireAuth, async (req, res) => {
    const items = await practice.listSaved(req.user._id);
    res.json({ items: items.map(toPublicSaved) });
  });

  api.post('/practice/saved', requireAuth, async (req, res) => {
    const { resultId } = z.object({ resultId: z.string() }).parse(req.body);
    const result = await practice.findResult(req.user._id, resultId);
    if (!result) throw httpError(404, 'Result not found');
    // Re-saving the same result is always allowed (idempotent); new saves count.
    if (!(await practice.isSaved(req.user._id, resultId))) {
      await subscription.assertCanSave(req.user, await practice.countSaved(req.user._id));
    }
    const saved = await practice.save(req.user._id, result);
    res.status(201).json(toPublicSaved({ saved, result }));
  });

  api.delete('/practice/saved/:id', requireAuth, async (req, res) => {
    const deleted = await practice.deleteSaved(req.user._id, req.params.id);
    if (!deleted) throw httpError(404, 'Saved practice not found');
    res.status(204).end();
  });

  // ── My Learning Library ───────────────────────────────────────────────────
  const categoryIds = () => new Set(listCategories().map((c) => c.id));
  const Category = z.string().refine((c) => categoryIds().has(c), 'Unknown category');
  const isoDate = z.iso.datetime({ offset: true }).or(z.iso.date());

  const ListQuery = z.object({
    category: Category,
    examId: z.string().max(60).optional(),
    subjectId: z.string().max(60).optional(),
    topicId: z.string().max(100).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    language: z.enum(['en', 'hi']).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    q: z.string().trim().max(80).optional(),
    sort: z.enum(['latest', 'oldest']).default('latest'),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  });

  api.get('/library/summary', requireAuth, async (req, res) => {
    const s = await library.summary(req.user._id);
    res.json({ ...s, recent: s.recent.map(toPublicSet) });
  });

  api.get('/library/sets', requireAuth, async (req, res) => {
    const q = ListQuery.parse(req.query);
    const page = await library.listSets(req.user._id, q);
    res.json({ ...page, items: page.items.map(toPublicSet) });
  });

  api.get('/library/facets', requireAuth, async (req, res) => {
    const { category } = z.object({ category: Category }).parse(req.query);
    res.json(await library.facets(req.user._id, category));
  });

  api.get('/library/sets/:id', requireAuth, async (req, res) => {
    const set = await library.findSet(req.user._id, req.params.id);
    if (!set) throw httpError(404, 'Practice set not found');
    res.json(toPublicSet(set));
  });

  api.delete('/library/sets/:id', requireAuth, async (req, res) => {
    if (!(await library.deleteSet(req.user._id, req.params.id))) {
      throw httpError(404, 'Practice set not found');
    }
    res.status(204).end();
  });

  // Practice History: every scored attempt of a set, newest first.
  api.get('/library/sets/:id/attempts', requireAuth, async (req, res) => {
    const set = await library.findSet(req.user._id, req.params.id);
    if (!set) throw httpError(404, 'Practice set not found');
    const items = await library.listAttempts(req.user._id, set._id);
    res.json({
      items: items.map((a) => ({
        id: a._id,
        resultId: a.resultId,
        attemptNo: a.attemptNo,
        total: a.total,
        correct: a.correct,
        incorrect: a.incorrect,
        unattempted: a.unattempted,
        score: a.score,
        maxScore: a.maxScore,
        accuracy: a.accuracy,
        timeTakenSeconds: a.timeTakenSeconds,
        completedAt: a.completedAt,
      })),
    });
  });

  // Practice Again: a new test (no answers) with the set's original questions;
  // its submit becomes the next attempt in the set's history.
  api.post('/library/sets/:id/start', requireAuth, async (req, res) => {
    const set = await library.findSet(req.user._id, req.params.id);
    if (!set) throw httpError(404, 'Practice set not found');
    const session = await practice.createSession({
      setId: set._id,
      userId: req.user._id,
      exam: { id: set.examId, name: set.examName },
      subjects: set.subjects.map((s) => s.name),
      topics: set.topics.map((t) => t.name),
      difficulty: set.difficulty,
      requestedCount: set.questionCount,
      isPreview: set.isPreview,
      questions: set.questions,
    });
    res.status(201).json(toPublicSession(session));
  });

  // ── AI Study Notes ────────────────────────────────────────────────────────
  // Own hourly limit, separate from question generation; no Free daily sets used.
  // Notes quota (AI_NOTES_PER_HOUR): only successful NEW AI generations count;
  // cached sections and failed attempts are free. Separate from questions.
  const NotesBody = z.object({
    examId: z.string(),
    topicId: z.string(),
    language: z.enum(['en', 'hi']).default('en'),
    level: z.enum(NOTE_LEVELS).default('exam'),
    sections: z.array(z.enum(NOTE_SECTIONS)).min(1).max(NOTE_SECTIONS.length),
    requestKey: z.string().trim().min(8).max(100).optional(),
  });

  // Generates notes with Gemini, validates them and saves them automatically.
  // 201 only after the note is stored in MongoDB.
  api.post('/notes/generate', requireAuth, async (req, res) => {
    const body = NotesBody.parse(req.body);
    const exam = findExam(body.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    // A syllabus topic, or a curated unit of a broad topic.
    const found = findLearningItem(exam.id, body.topicId);
    if (!found) throw httpError(400, `Topic ${body.topicId} is not in the ${exam.name} syllabus`);

    const previous = await notes.findByRequestKey(req.user._id, body.requestKey);
    if (previous) return res.status(201).json(toPublicNote(previous));

    await notesQuota.check(req.user._id);
    const sections = [...new Set(body.sections)];
    const { item } = found;
    const subject = found.subject;
    const isUnit = item.unitName !== null;
    const topic = { id: item.id, name: isUnit ? `${item.topicName}: ${item.unitName}` : item.name };
    const { content, model } = await notesGenerator.generate({
      exam,
      subject,
      topic,
      unitOf: isUnit
        ? {
            topicName: item.topicName,
            otherUnits: found.path.items.filter((i) => i.topicId === item.topicId && i.id !== item.id).map((i) => i.name),
          }
        : null,
      language: body.language,
      level: body.level,
      sections,
    });
    // Never store unchecked AI output. "What to study next" always comes from
    // the syllabus path (real topic ids), never from the AI.
    const checked = validateNoteContent(content, sections);
    checked.nextTopics = found.next.map((n) => ({ id: n.id, name: n.unitName ? `${n.topicName}: ${n.unitName}` : n.name }));
    const { note } = await notes.create({
      userId: req.user._id,
      requestKey: body.requestKey ?? null,
      exam,
      subject,
      topic,
      parentTopic: isUnit ? { id: item.topicId, name: item.topicName } : null,
      unitName: isUnit ? item.unitName : null,
      language: body.language,
      level: body.level,
      sections,
      content: checked,
      model,
    });
    await notesQuota.record(req.user._id, { topicId: item.id });
    res.status(201).json(toPublicNote(note));
  });

  const NotesQuery = z.object({
    category: Category,
    examId: z.string().max(60).optional(),
    subjectId: z.string().max(80).optional(),
    topicId: z.string().max(120).optional(),
    language: z.enum(['en', 'hi']).optional(),
    level: z.enum(NOTE_LEVELS).optional(),
    bookmarked: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    hasPersonalNote: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    q: z.string().trim().max(80).optional(),
    sort: z.enum(['latest', 'oldest']).default('latest'),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  });

  api.get('/notes', requireAuth, async (req, res) => {
    const page = await notes.list(req.user._id, NotesQuery.parse(req.query));
    res.json({ ...page, items: page.items.map((n) => toPublicNote(n, { withContent: false })) });
  });

  // Declared before /notes/:id so "summary" / "facets" are not read as ids.
  api.get('/notes/summary', requireAuth, async (req, res) => {
    res.json(await notes.summary(req.user._id));
  });

  api.get('/notes/facets', requireAuth, async (req, res) => {
    const { category } = z.object({ category: Category }).parse(req.query);
    res.json(await notes.facets(req.user._id, category));
  });

  api.get('/notes/:id', requireAuth, async (req, res) => {
    const note = await notes.find(req.user._id, req.params.id);
    if (!note) throw httpError(404, 'Note not found');
    res.json(toPublicNote(note));
  });

  const NotePatch = z
    .object({ personalNote: z.string().max(5000).optional(), bookmarked: z.boolean().optional() })
    .refine((b) => b.personalNote !== undefined || b.bookmarked !== undefined, 'Nothing to update');

  api.patch('/notes/:id', requireAuth, async (req, res) => {
    const note = await notes.update(req.user._id, req.params.id, NotePatch.parse(req.body));
    if (!note) throw httpError(404, 'Note not found');
    res.json(toPublicNote(note));
  });

  api.delete('/notes/:id', requireAuth, async (req, res) => {
    if (!(await notes.delete(req.user._id, req.params.id))) throw httpError(404, 'Note not found');
    res.status(204).end();
  });

  // ── Learning path (AI Study Notes) ──────────────────────────────────────────
  // Ordered topics/units of one subject with this student's progress and notes.
  async function buildPath(userId, exam, path) {
    const ids = path.items.map((i) => i.id);
    const [done, stats] = await Promise.all([
      progress.completed(userId, exam.id, ids),
      notes.statsByTopic(userId, exam.id, ids),
    ]);
    let currentId = null;
    const items = path.items.map((i, index) => {
      const completedAt = done.get(i.id) ?? null;
      let status = 'upcoming';
      if (completedAt) status = 'completed';
      else if (currentId === null) {
        currentId = i.id; // first not-completed item in order
        status = 'current';
      }
      const s = stats.get(i.id);
      return { ...i, order: index + 1, status, completedAt, latestNoteId: s?.latestId ?? null, notesCount: s?.count ?? 0 };
    });
    return {
      examId: exam.id,
      examName: exam.name,
      category: exam.categoryId,
      subjectId: path.subject.id,
      subjectName: path.subject.name,
      total: items.length,
      completed: items.filter((i) => i.status === 'completed').length,
      currentId,
      items,
    };
  }

  api.get('/learning-path/:examId/:subjectId', requireAuth, async (req, res) => {
    const exam = findExam(req.params.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const path = learningItems(exam.id, req.params.subjectId);
    if (!path) throw httpError(404, 'Subject not found in this exam');
    res.json(await buildPath(req.user._id, exam, path));
  });

  api.put('/learning-path/:examId/items/:itemId', requireAuth, async (req, res) => {
    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
    const exam = findExam(req.params.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const found = findLearningItem(exam.id, req.params.itemId);
    // Only items that are on the path (a topic, or a unit of a broad topic).
    if (!found || !found.path.items.some((i) => i.id === req.params.itemId)) {
      throw httpError(404, 'Topic not found in this exam');
    }
    const outline = findOutline(found.item.id, { includeDrafts: config.notes?.showDraftOutlines });
    if (completed && outline) {
      const states = await progress.sectionStates(req.user._id, exam.id, outline.unitId);
      const all = outlineSections(outline);
      const done = all.filter(({ chapter, section }) => states.get(`${outline.unitId}#${chapter.id}.${section.id}`)?.state === 'completed').length;
      if (done < all.length) {
        throw httpError(409, `Complete all sections first (${done} of ${all.length} done).`, 'COVERAGE_INCOMPLETE');
      }
    }
    await progress.set(req.user._id, {
      category: exam.categoryId,
      examId: exam.id,
      subjectId: found.subject.id,
      topicId: found.item.topicId,
      itemId: found.item.id,
      completed,
    });
    res.json(await buildPath(req.user._id, exam, found.path));
  });

  // ── Outline sections (curated outline → section-by-section notes) ─────────
  const LangMode = {
    language: z.enum(['en', 'hi']).default('en'),
    mode: z.enum(LEARNING_MODES).default('complete'),
  };

  function resolveOutline(examId, unitId) {
    const exam = findExam(examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const found = findLearningItem(exam.id, unitId);
    if (!found || found.item.id !== unitId) throw httpError(404, 'Topic not found in this exam');
    const outline = findOutline(unitId, { includeDrafts: config.notes?.showDraftOutlines });
    if (!outline) throw httpError(404, 'No outline for this topic yet', 'NO_OUTLINE');
    return { exam, found, outline };
  }

  const sectionItemId = (unitId, chapterId, sectionId) => `${unitId}#${chapterId}.${sectionId}`;
  const cacheKeyOf = (outline, chapterId, sectionId, language, mode) =>
    SectionCache.key({
      unitId: outline.unitId,
      chapterId,
      sectionId,
      language,
      mode,
      outlineVersion: outline.version,
      promptVersion: SECTION_PROMPT_VERSION,
    });

  /** Outline with this student's section states, chapter progress and coverage. */
  async function outlineView(userId, { exam, outline }, language, mode) {
    const all = outlineSections(outline);
    const keys = all.map(({ chapter, section }) => cacheKeyOf(outline, chapter.id, section.id, language, mode));
    const [states, mine, cachedRows] = await Promise.all([
      progress.sectionStates(userId, exam.id, outline.unitId),
      notes.sectionNotes(userId, outline.unitId, language, mode),
      sectionCache.cache.find({ key: { $in: keys }, status: 'active' }, { projection: { key: 1 } }).toArray(),
    ]);
    const cached = new Set(cachedRows.map((r) => r.key));
    let next = null;
    const chapters = outline.chapters.map((chapter) => {
      const sections = chapter.sections.map((section) => {
        const p = states.get(sectionItemId(outline.unitId, chapter.id, section.id));
        const note = mine.get(`${chapter.id}.${section.id}`);
        const state = p?.state === 'completed' ? 'completed' : note ? 'generated' : p?.state === 'failed' ? 'failed' : 'pending';
        if (!next && state !== 'completed') next = { chapterId: chapter.id, sectionId: section.id };
        return {
          id: section.id,
          title: section.title,
          origin: section.origin ?? outline.origin,
          state,
          noteId: note?.id ?? null,
          versions: note?.versions ?? 0,
          cached: cached.has(cacheKeyOf(outline, chapter.id, section.id, language, mode)),
          error: state === 'failed' ? (p?.error ?? null) : null,
        };
      });
      const completed = sections.filter((s) => s.state === 'completed').length;
      return {
        id: chapter.id,
        title: chapter.title,
        weight: chapter.weight ?? null,
        sections,
        completed,
        generated: sections.filter((s) => s.state === 'completed' || s.state === 'generated').length,
        total: sections.length,
        // Complete only when EVERY planned section has passed checks and been read.
        complete: completed === sections.length,
      };
    });
    const total = all.length;
    const completed = chapters.reduce((n, c) => n + c.completed, 0);
    return {
      examId: exam.id,
      unitId: outline.unitId,
      title: outline.title,
      status: outline.status,
      origin: outline.origin,
      version: outline.version,
      language,
      mode,
      chapters,
      total,
      completed,
      generated: chapters.reduce((n, c) => n + c.generated, 0),
      // Never claimed as complete unless every outline section is completed.
      coverageComplete: completed === total,
      continue: next,
    };
  }

  api.get('/notes/outlines/:examId/:unitId', requireAuth, async (req, res) => {
    const { language, mode } = z.object(LangMode).parse(req.query);
    const ctx = resolveOutline(req.params.examId, req.params.unitId);
    res.json(await outlineView(req.user._id, ctx, language, mode));
  });

  // Concurrent requests for the same uncached section share one AI call.
  const inflight = new Map();

  const SectionBody = z.object({
    examId: z.string(),
    unitId: z.string(),
    chapterId: z.string(),
    sectionId: z.string(),
    ...LangMode,
    regenerate: z.boolean().optional(),
    requestKey: z.string().trim().min(8).max(100).optional(),
  });

  // Opens a section: the student's saved copy → shared cache (free) → new AI
  // generation (counts toward AI_NOTES_PER_HOUR only when it succeeds).
  api.post('/notes/sections/generate', requireAuth, async (req, res) => {
    const body = SectionBody.parse(req.body);
    const ctx = resolveOutline(body.examId, body.unitId);
    const { exam, found, outline } = ctx;
    const chapter = outline.chapters.find((c) => c.id === body.chapterId);
    const section = chapter?.sections.find((s) => s.id === body.sectionId);
    if (!section) throw httpError(404, 'Section not found in this outline');
    // e.g. current affairs: content must come from a dated, verified source.
    if (chapter.requiresVerifiedSource) {
      throw httpError(409, 'This section needs a verified source and cannot be generated by AI alone.', 'VERIFIED_SOURCE_REQUIRED');
    }
    const userId = req.user._id;
    const where = { unitId: outline.unitId, chapterId: chapter.id, sectionId: section.id, language: body.language, mode: body.mode };

    const previous = await notes.findByRequestKey(userId, body.requestKey);
    if (previous) return res.status(201).json({ ...toPublicNote(previous), source: 'saved' });
    if (!body.regenerate) {
      const saved = await notes.findSectionNote(userId, where);
      if (saved) return res.json({ ...toPublicNote(saved), source: 'saved' });
    }

    const key = cacheKeyOf(outline, chapter.id, section.id, body.language, body.mode);
    const itemId = sectionItemId(outline.unitId, chapter.id, section.id);
    let entry = body.regenerate ? null : await sectionCache.current(key);
    let source = 'cache';
    if (!entry) {
      await notesQuota.check(userId);
      const shared = !body.regenerate && inflight.get(key);
      try {
        if (shared) {
          entry = await shared; // someone else's in-flight generation: free
        } else {
          const job = (async () => {
            const g = await sectionGenerator.generate({
              exam,
              subject: found.subject,
              unitName: found.item.unitName,
              outline,
              chapter,
              section,
              language: body.language,
              mode: body.mode,
            });
            return sectionCache.put(key, { content: g.content, quality: g.quality, model: g.model, unitId: outline.unitId });
          })();
          if (!body.regenerate) inflight.set(key, job);
          try {
            entry = await job;
          } finally {
            if (inflight.get(key) === job) inflight.delete(key);
          }
          source = 'ai';
          await notesQuota.record(userId, { unitId: outline.unitId, sectionItemId: itemId });
        }
      } catch (err) {
        await progress.setSectionState(userId, {
          category: exam.categoryId,
          examId: exam.id,
          subjectId: found.subject.id,
          unitId: outline.unitId,
          sectionItemId: itemId,
          state: 'failed',
          error: String(err.message).slice(0, 300),
        });
        throw err;
      }
    }
    await progress.clearSectionFailure(userId, exam.id, itemId);

    // The student's own copy (never shared). Next topics = next path units.
    const content = {
      ...entry.content,
      nextTopics: found.next.map((n) => ({ id: n.id, name: n.unitName ? `${n.topicName}: ${n.unitName}` : n.name })),
    };
    const version = (await notes.countSectionVersions(userId, where)) + 1;
    const { note } = await notes.create({
      userId,
      requestKey: body.requestKey ?? null,
      exam,
      subject: found.subject,
      topic: { id: outline.unitId, name: section.title },
      parentTopic: { id: found.item.topicId, name: `${outline.title} › ${chapter.title}` },
      unitName: found.item.unitName,
      language: body.language,
      level: 'exam',
      sections: [],
      content,
      model: entry.model,
      extra: {
        kind: 'section',
        outlineUnitId: outline.unitId,
        outlineVersion: outline.version,
        chapterId: chapter.id,
        sectionId: section.id,
        chapterTitle: chapter.title,
        sectionTitle: section.title,
        learningMode: body.mode,
        sectionVersion: version,
        cacheId: entry._id,
        sourceType: 'ai_generated',
        sourceReferences: [],
        quality: entry.quality,
      },
    });
    res.status(201).json({ ...toPublicNote(note), source });
  });

  const SectionProgressBody = z.object({
    examId: z.string(),
    unitId: z.string(),
    chapterId: z.string(),
    sectionId: z.string(),
    completed: z.boolean(),
    ...LangMode,
  });

  // Mark a section read. Only a section the student has a validated note for.
  api.put('/notes/sections/progress', requireAuth, async (req, res) => {
    const body = SectionProgressBody.parse(req.body);
    const ctx = resolveOutline(body.examId, body.unitId);
    const { exam, found, outline } = ctx;
    const chapter = outline.chapters.find((c) => c.id === body.chapterId);
    const section = chapter?.sections.find((s) => s.id === body.sectionId);
    if (!section) throw httpError(404, 'Section not found in this outline');
    const userId = req.user._id;
    if (body.completed) {
      const saved = await notes.findSectionNote(userId, { unitId: outline.unitId, chapterId: chapter.id, sectionId: section.id });
      if (!saved) throw httpError(409, 'Generate this section before marking it complete.', 'SECTION_NOT_GENERATED');
    }
    await progress.setSectionState(userId, {
      category: exam.categoryId,
      examId: exam.id,
      subjectId: found.subject.id,
      unitId: outline.unitId,
      sectionItemId: sectionItemId(outline.unitId, chapter.id, section.id),
      state: body.completed ? 'completed' : null,
    });
    res.json(await outlineView(userId, ctx, body.language, body.mode));
  });

  // ── Subscription (Free / Pro) ─────────────────────────────────────────────
  api.get('/subscription', requireAuth, async (req, res) => {
    res.json(await subscription.status(req.user));
  });

  api.post('/subscription/trial', requireAuth, async (req, res) => {
    const user = await subscription.startTrial(req.user);
    if (!user) throw httpError(409, 'Free trial already used');
    res.json(await subscription.status(user));
  });

  // ── Errors ────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof LimitError) {
      // `code` lets the app show the right upgrade prompt.
      return res.status(403).json({ error: err.message, code: err.code, details: err.details });
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid request' });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    if (err.status && err.expose !== false && err.status < 500) {
      return res.status(err.status).json({ error: err.message, ...(err.code ? { code: err.code } : {}) });
    }
    if (err instanceof GenerationError) {
      return res.status(502).json({ error: err.message });
    }
    if (err instanceof AiServiceError) {
      return res.status(503).json({
        error: err.retryable ? 'AI is busy right now. Please try again shortly.' : err.message,
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}

function httpError(status, message, code) {
  return Object.assign(new Error(message), { status, ...(code ? { code } : {}) });
}
