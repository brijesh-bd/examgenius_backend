import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

import { aiMode } from './config.js';
import { findExam, getSyllabus, listCategories, topicIndex } from './services/examService.js';
import { toPublicUser } from './services/userStore.js';
import { toPublicResult, toPublicSaved, toPublicSession } from './services/practiceStore.js';
import { AiServiceError, GenerationError } from './services/questionGenerator.js';

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
export function createApp({ config, users, practice, questionGenerator, logRequests = false }) {
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
      return { id, name: entry.topic.name, subjectName: entry.subject.name };
    });

    const generated = await questionGenerator.generate({
      exam,
      topics,
      difficulty: body.difficulty,
      count: body.count,
      language: body.language ?? 'en',
    });

    const names = new Map(topics.map((t) => [t.id, t.name]));
    const session = await practice.createSession({
      userId: req.user._id,
      exam,
      subjects: [...new Set(topics.map((t) => t.subjectName))],
      topics: topics.map((t) => t.name),
      difficulty: body.difficulty,
      requestedCount: body.count,
      isPreview: generated.isPreview,
      questions: generated.questions.map((q) => ({
        ...q,
        topicName: names.get(q.topicId) ?? index.get(q.topicId)?.topic.name ?? q.topicId,
      })),
    });

    await users.incrementStats(req.user._id, {
      generations: 1,
      questionsGenerated: session.questions.length,
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
    res.json(toPublicResult(await practice.submit(session, body)));
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

  api.get('/practice/saved', requireAuth, async (req, res) => {
    const items = await practice.listSaved(req.user._id);
    res.json({ items: items.map(toPublicSaved) });
  });

  api.post('/practice/saved', requireAuth, async (req, res) => {
    const { resultId } = z.object({ resultId: z.string() }).parse(req.body);
    const result = await practice.findResult(req.user._id, resultId);
    if (!result) throw httpError(404, 'Result not found');
    const saved = await practice.save(req.user._id, result);
    res.status(201).json(toPublicSaved({ saved, result }));
  });

  api.delete('/practice/saved/:id', requireAuth, async (req, res) => {
    const deleted = await practice.deleteSaved(req.user._id, req.params.id);
    if (!deleted) throw httpError(404, 'Saved practice not found');
    res.status(204).end();
  });

  // ── Errors ────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid request' });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    if (err.status && err.expose !== false && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
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

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
