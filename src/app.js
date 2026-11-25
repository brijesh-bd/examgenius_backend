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
import { SectionCache, STUDENT_STATUSES, PREVIEW_STATUSES } from './services/sectionCache.js';
import { SYLLABUS_VERSION } from './data/syllabus.js';
import { LEARNING_MODES, SECTION_PROMPT_VERSION, SECTION_SCHEMA_VERSION } from './services/sectionGenerator.js';
import { findOutline, outlineSections } from './data/outlines/index.js';
import { buildExamTree, walkTree } from './services/syllabusTree.js';
import { findManifest, manifestReport } from './data/manifests/index.js';
import { MODE_GUIDE, blocksFor, templateFor } from './data/contentTemplates.js';
import { LimitError } from './services/subscription.js';
import { examCatalog } from './data/examCatalog.js';
import { examTreeSubjects, syllabusFor, syllabusOfNode } from './data/syllabusTrees/index.js';

/** Bump when a syllabus tree changes in a way clients should refetch. */
const SYLLABUS_TREES_VERSION = 2;

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
  sectionJobs,
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
    const body = z
      .object({
        targetExamId: z.string().optional(),
        // Device UTC offset in minutes: daily limits reset at local midnight.
        tzOffsetMinutes: z.number().int().optional(),
      })
      .parse(req.body);
    let user = req.user;
    if (body.targetExamId != null) {
      if (!findExam(body.targetExamId)) throw httpError(400, 'Unknown targetExamId');
      user = await users.update(user._id, { targetExamId: body.targetExamId });
    }
    if (body.tzOffsetMinutes != null) user = await subscription.setTimezone(user, body.tzOffsetMinutes);
    res.json({ user: toPublicUser(user) });
  });

  // ── Exams & syllabus ──────────────────────────────────────────────────────
  api.get('/exams', (_req, res) => res.json({ categories: listCategories() }));

  api.get('/exams/:examId/syllabus', (req, res) => {
    const syllabus = getSyllabus(req.params.examId);
    if (!syllabus) throw httpError(404, 'Syllabus not found');
    res.json(syllabus);
  });

  // ── Hierarchical syllabus (any subject with a concept tree) ───────────────
  // Shared concept libraries + exam-wise mapping (src/data/syllabusTrees).
  // Ids are stable and shared by practice and AI Study Notes. Each node
  // carries its status for this exam: official | unverified | draft.
  const treeOf = (examId, subjectId) => {
    const exam = findExam(examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const tree = syllabusFor(exam.id, subjectId);
    if (!tree) throw httpError(404, 'This subject has no syllabus tree for this exam');
    return { exam, tree };
  };
  const treeBase = (exam, tree) => ({
    examId: exam.id,
    examName: exam.name,
    subjectId: tree.subjectId,
    syllabusId: tree.syllabusId,
    syllabusVersion: SYLLABUS_TREES_VERSION,
    difficulty: tree.difficulty(exam.id),
    hasOfficial: [...tree.nodes.keys()].some((id) => tree.status(exam.id, id) === 'official'),
  });
  const NodeIdParam = z.string().regex(/^[a-z]{2}(\.[a-z0-9_]+){1,4}$/, 'Invalid node id');
  const SubjectParam = z.string().regex(/^[a-z_]{2,40}$/, 'Invalid subject');

  // Subjects of an exam, and which of them have a concept tree.
  api.get('/syllabus/:examId/subjects', (req, res) => {
    const exam = findExam(req.params.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const trees = new Set(examTreeSubjects(exam.id));
    res.json({
      examId: exam.id,
      subjects: (getSyllabus(exam.id)?.subjects ?? []).map((s) => {
        const tree = trees.has(s.id) ? syllabusFor(exam.id, s.id) : null;
        return {
          id: s.id,
          name: s.name,
          hasTree: Boolean(tree),
          chapterCount: tree ? tree.chapters(exam.id).length : 0,
          conceptCount: tree ? tree.chapters(exam.id).reduce((n, c) => n + tree.leafIds(exam.id, c.nodeId).length, 0) : 0,
        };
      }),
    });
  });

  const sendTree = (req, res, examId, subjectId) => {
    const { exam, tree } = treeOf(examId, SubjectParam.parse(subjectId));
    const { nodeId } = z.object({ nodeId: NodeIdParam.optional() }).parse(req.query);
    const nodes = tree.tree(exam.id, nodeId ?? null);
    if (!nodes) throw httpError(404, 'Node not found in this exam');
    res.json({ ...treeBase(exam, tree), nodes });
  };
  const sendChildren = (req, res, examId, subjectId) => {
    const { exam, tree } = treeOf(examId, SubjectParam.parse(subjectId));
    const nodeId = NodeIdParam.parse(req.params.nodeId);
    if (!tree.isApplicable(exam.id, nodeId)) throw httpError(404, 'Node not found in this exam');
    res.json({
      ...treeBase(exam, tree),
      nodeId,
      children: tree.childIds(exam.id, nodeId).map((id) => tree.publicNode(exam.id, tree.getNode(id))),
    });
  };
  const sendSearch = (req, res, examId, subjectId) => {
    const { exam, tree } = treeOf(examId, SubjectParam.parse(subjectId));
    const q = z
      .object({ q: z.string().trim().min(1).max(60), limit: z.coerce.number().int().min(1).max(50).default(20) })
      .parse(req.query);
    res.json({ ...treeBase(exam, tree), query: q.q, results: tree.search(exam.id, q.q, { limit: q.limit }) });
  };
  const sendResolve = (req, res, examId, subjectId) => {
    const { exam, tree } = treeOf(examId, SubjectParam.parse(subjectId));
    const { nodeIds } = z.object({ nodeIds: z.array(z.string().max(120)).min(1).max(400) }).parse(req.body);
    const r = tree.resolve(exam.id, nodeIds);
    if (r.invalid.length) throw Object.assign(httpError(400, 'Unknown syllabus nodes', 'INVALID_NODES'), { details: { invalid: r.invalid } });
    res.json({ ...treeBase(exam, tree), selectedIds: r.selectedIds, conceptIds: r.conceptIds });
  };

  // Railway Mathematics paths from the previous release (kept for old builds).
  api.get('/syllabus/railway/exams', (_req, res) => {
    const exams = examCatalog.find((c) => c.id === 'railway')?.exams ?? [];
    res.json({
      exams: exams
        .filter((e) => syllabusFor(e.id, 'quant'))
        .map((e) => ({ ...e, subjectId: 'quant', chapterCount: syllabusFor(e.id, 'quant').chapters(e.id).length })),
    });
  });
  api.get('/syllabus/railway/:examId/math', (req, res) => {
    const { exam, tree } = treeOf(req.params.examId, 'quant');
    res.json({ ...treeBase(exam, tree), chapters: tree.chapters(exam.id).map((n) => tree.publicNode(exam.id, n)) });
  });
  api.get('/syllabus/railway/:examId/math/nodes/:nodeId/children', (req, res) => sendChildren(req, res, req.params.examId, 'quant'));
  api.get('/syllabus/railway/:examId/math/tree', (req, res) => sendTree(req, res, req.params.examId, 'quant'));
  api.get('/syllabus/railway/:examId/math/search', (req, res) => sendSearch(req, res, req.params.examId, 'quant'));
  api.post('/syllabus/railway/:examId/math/resolve', (req, res) => sendResolve(req, res, req.params.examId, 'quant'));
  api.get('/syllabus/railway/:examId/math/applicability', (req, res) => {
    const { exam, tree } = treeOf(req.params.examId, 'quant');
    res.json({
      ...treeBase(exam, tree),
      chapters: [...tree.nodes.values()]
        .filter((n) => n.nodeType === 'chapter')
        .map((c) => ({ chapterId: c.nodeId, titleEn: c.titleEn, titleHi: c.titleHi, applicable: tree.isApplicable(exam.id, c.nodeId) })),
    });
  });

  // Generic paths (declared after the railway aliases so "railway" is not an exam id).
  api.get('/syllabus/:examId/:subjectId/tree', (req, res) => sendTree(req, res, req.params.examId, req.params.subjectId));
  api.get('/syllabus/:examId/:subjectId/nodes/:nodeId/children', (req, res) =>
    sendChildren(req, res, req.params.examId, req.params.subjectId),
  );
  api.get('/syllabus/:examId/:subjectId/search', (req, res) => sendSearch(req, res, req.params.examId, req.params.subjectId));
  api.post('/syllabus/:examId/:subjectId/resolve', (req, res) => sendResolve(req, res, req.params.examId, req.params.subjectId));

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

  // ── Practice sets: Question Bank or AI → practice session ─────────────────
  // source 'bank': stored questions only — never AI; refused up front (409
  //   BANK_INSUFFICIENT) when the filters do not have enough questions.
  // source 'ai':   a full set generated by Gemini (counts as ONE AI set).
  // Older app builds send `fresh` instead: true = 'ai', otherwise 'bank'.
  const GenerateBody = z
    .object({
      examId: z.string(),
      examName: z.string().optional(),
      // 'quick': mixed set across the exam's subjects (no topics needed).
      mode: z.enum(['topics', 'quick']).default('topics'),
      topicIds: z.array(z.string()).max(60).default([]),
      // Railway Mathematics concept selection (exact syllabus node ids).
      // Parents are expanded to their concepts; questions stay in that scope.
      subjectId: z.string().max(40).optional(),
      selectedNodeIds: z.array(z.string().max(120)).max(400).default([]),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      count: z.number().int().min(1).max(config.ai.maxQuestionsPerRequest).default(10),
      level: z.literal('exam').optional(),
      language: z.enum(['en', 'hi']).optional(),
      source: z.enum(['bank', 'ai']).optional(),
      fresh: z.boolean().optional(),
      // Unique per generate tap: a retried request returns the set already saved.
      requestKey: z.string().min(8).max(100).optional(),
    })
    .refine((b) => b.mode === 'quick' || b.topicIds.length > 0 || b.selectedNodeIds.length > 0, {
      message: 'Select at least one topic',
    });

  /**
   * Concept scope of a node selection (any subject with a tree) → practice
   * topics. Each topic carries its concepts ({nodeId, name, path, patterns});
   * chapters sharing a practice topic are merged. One subject per request.
   */
  function conceptTopics(exam, nodeIds, language = 'en', subjectId = null) {
    const subject = subjectId ?? syllabusOfNode(nodeIds[0])?.subjectId;
    const tree = subject ? syllabusFor(exam.id, subject) : null;
    if (!tree) throw httpError(400, `${exam.name} has no concept-level syllabus for this subject`, 'INVALID_NODES');
    const r = tree.resolve(exam.id, nodeIds);
    if (r.invalid.length) {
      throw Object.assign(httpError(400, `Not in the ${exam.name} syllabus: ${r.invalid.slice(0, 5).join(', ')}`, 'INVALID_NODES'), {
        details: { invalid: r.invalid },
      });
    }
    const subjectName = getSyllabus(exam.id)?.subjects.find((s) => s.id === tree.subjectId)?.name ?? tree.subjectId;
    const title = (n) => (language === 'hi' ? n.titleHi : n.titleEn);
    const byTopic = new Map();
    for (const [chapterId, conceptIds] of r.byChapter) {
      const pt = tree.practiceTopic(exam.id, chapterId);
      const t = byTopic.get(pt.id) ?? { id: pt.id, names: [], subjectId: tree.subjectId, subjectName, concepts: [] };
      t.names.push(tree.getNode(chapterId).titleEn);
      for (const cid of conceptIds) {
        const path = tree.pathOf(cid);
        t.concepts.push({
          nodeId: cid,
          name: title(path.at(-1)),
          path: path.slice(0, -1).map((p) => p.titleEn).join(' › '),
          patterns: path.at(-1).patterns ?? [],
          // Chapter → … → concept ids, stored with every question.
          syllabusPath: path.map((p) => p.nodeId),
        });
      }
      byTopic.set(pt.id, t);
    }
    return {
      tree,
      selectedNodeIds: r.selectedIds,
      difficulty: tree.difficulty(exam.id),
      topics: [...byTopic.values()].map(({ names, ...t }) => ({ ...t, name: [...new Set(names)].join(' / ') })),
    };
  }

  const sourceOf = (b) => b?.source ?? (b?.fresh === true ? 'ai' : 'bank');

  // AI safety limit (requests per hour), separate from plan credits: counts
  // AI requests only; one request = one generation however many questions.
  const generateLimiter = rateLimit({
    windowMs: 60 * 60_000,
    limit: config.ai.generationsPerHour,
    keyGenerator: (req) => req.user._id,
    skip: (req) => sourceOf(req.body) !== 'ai',
    message: { error: 'Hourly generation limit reached. Please try again later.', code: 'AI_HOURLY_LIMIT' },
  });

  /** Topics of the request; quick mode = the exam's syllabus across subjects. */
  function practiceTopics(exam, body, source) {
    const index = topicIndex(exam.id);
    const toTopic = (id, entry) => ({
      id,
      name: entry.topic.name,
      subjectId: entry.subject.id,
      subjectName: entry.subject.name,
    });
    if (body.mode === 'quick') {
      const all = [...index].map(([id, entry]) => toTopic(id, entry));
      if (source === 'bank') return all; // the bank spreads picks across all topics
      // AI: a few topics drawn round-robin from every subject (balanced mix).
      const bySubject = new Map();
      for (const t of all) {
        if (!bySubject.has(t.subjectId)) bySubject.set(t.subjectId, []);
        bySubject.get(t.subjectId).push(t);
      }
      const pools = [...bySubject.values()].map((ts) => ts.sort(() => Math.random() - 0.5));
      const picked = [];
      const want = Math.min(8, all.length);
      for (let i = 0; picked.length < want; i++) {
        const pool = pools[i % pools.length];
        if (pool.length) picked.push(pool.pop());
      }
      return picked;
    }
    return [...new Set(body.topicIds)].map((id) => {
      const entry = index.get(id);
      if (!entry) throw httpError(400, `Topic ${id} is not in the ${exam.name} syllabus`);
      return toTopic(id, entry);
    });
  }

  /** Can this student switch to an AI set right now (for the 409 offer)? */
  async function aiAlternative(user) {
    const s = await subscription.status(user);
    const included = s.limits.aiSetsPerDay !== 0;
    return {
      aiIncluded: included,
      aiRemainingToday: s.remainingToday.aiSets,
      setsRemainingToday: s.remainingToday.sets,
      aiAvailableNow: included && s.remainingToday.aiSets !== 0 && s.remainingToday.sets !== 0,
    };
  }

  function bankInsufficient(available, requested, alternative) {
    const err = httpError(
      409,
      `Only ${available} stored question${available === 1 ? '' : 's'} match your selection (you asked for ${requested}).`,
      'BANK_INSUFFICIENT',
    );
    return Object.assign(err, { details: { available, requested, ...alternative } });
  }

  // How many stored questions match (checked before starting a bank set).
  api.get('/questions/bank/availability', requireAuth, async (req, res) => {
    const q = z
      .object({
        examId: z.string(),
        mode: z.enum(['topics', 'quick']).default('topics'),
        topicIds: z.string().optional(),
        nodeIds: z.string().max(8000).optional(),
        subjectId: z.string().max(40).optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
        language: z.enum(['en', 'hi']).default('en'),
      })
      .parse(req.query);
    const exam = findExam(q.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const topicIds = (q.topicIds ?? '').split(',').filter(Boolean);
    const nodeIds = (q.nodeIds ?? '').split(',').filter(Boolean);
    if (q.mode === 'topics' && topicIds.length === 0 && nodeIds.length === 0) throw httpError(400, 'Select at least one topic');
    const scope = q.mode === 'topics' && nodeIds.length ? conceptTopics(exam, nodeIds, 'en', q.subjectId ?? null) : null;
    const topics = scope ? scope.topics : practiceTopics(exam, { mode: q.mode, topicIds }, 'bank');
    const avail = await bank.availability({
      topicIds: topics.map((t) => t.id),
      nodeIds: scope ? topics.flatMap((t) => t.concepts.map((c) => c.nodeId)) : null,
      difficulty: scope ? scope.difficulty : q.difficulty,
      language: q.language,
      seenIds: await bank.seenBy(req.user._id),
    });
    res.json({ available: avail.total, unseen: avail.unseen });
  });

  // Last Practice: the latest configuration per exam, stored on the user
  // (cross-device). Not an attempt — attempts stay in practice sessions.
  api.get('/practice/last-config', requireAuth, (req, res) => {
    const { examId } = z.object({ examId: z.string().optional() }).parse(req.query);
    const all = req.user.lastPractice ?? {};
    const latest = Object.values(all).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    res.json({ config: (examId != null ? all[examId] : latest) ?? null });
  });

  // Requests in progress per user+requestKey: a concurrent duplicate (double
  // tap) waits for the first one and gets the same set, without reserving.
  const inflightSets = new Map();

  api.post('/questions/generate', requireAuth, generateLimiter, async (req, res) => {
    const body = GenerateBody.parse(req.body);
    const source = sourceOf(body);
    const exam = findExam(body.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const scoped = body.selectedNodeIds.length > 0 && body.mode !== 'quick';
    const scope = scoped ? conceptTopics(exam, body.selectedNodeIds, body.language ?? 'en', body.subjectId ?? null) : null;
    // Concept practice: level comes from the exam's syllabus (no student selector).
    const difficulty = scope ? scope.difficulty : body.difficulty;
    const topics = scope ? scope.topics : practiceTopics(exam, body, source);
    const topicIds = topics.map((t) => t.id);
    const conceptIds = scope ? topics.flatMap((t) => t.concepts.map((c) => c.nodeId)) : null;
    // Plan rules first (set size, AI included) — before any bank lookup.
    subscription.assertAllowed(req.user, { count: body.count, source });

    const replay = async () => {
      const previous = await library.findByRequestKey(req.user._id, body.requestKey);
      return previous ? practice.findSession(req.user._id, previous.sessionId) : null;
    };
    const flightKey = body.requestKey ? `${req.user._id}:${body.requestKey}` : null;
    if (flightKey && inflightSets.has(flightKey)) {
      await inflightSets.get(flightKey);
      const s = await replay();
      if (s) return res.status(201).json(toPublicSession(s));
    }
    // Registered synchronously (no await since the check) so a concurrent
    // duplicate always sees it.
    if (flightKey && !inflightSets.has(flightKey)) {
      let done;
      const flight = new Promise((resolve) => (done = resolve));
      inflightSets.set(flightKey, flight);
      res.on('close', () => {
        if (inflightSets.get(flightKey) === flight) inflightSets.delete(flightKey);
        done();
      });
    }
    // Retried request (network drop, double tap): same set, no new quota used.
    const earlier = await replay();
    if (earlier) return res.status(201).json(toPublicSession(earlier));

    const language = body.language ?? 'en';

    // Bank: make sure the full set exists BEFORE using a daily set.
    const seenIds = source === 'bank' ? await bank.seenBy(req.user._id) : [];
    if (source === 'bank') {
      const avail = await bank.availability({ topicIds, nodeIds: conceptIds, difficulty: difficulty, language, seenIds });
      if (avail.total < body.count) throw bankInsufficient(avail.total, body.count, await aiAlternative(req.user));
    }

    // Plan check + atomic reservation (daily sets, AI sets, questions, set size).
    const reservation = await subscription.reserveGeneration(req.user, { count: body.count, source });

    let questions;
    let isPreview = false;
    let aiCount = 0;
    let bankCount = 0;
    let model = null;
    try {
      if (source === 'bank') {
        questions = await bank.pickSet({ topicIds, nodeIds: conceptIds, difficulty: difficulty, language, count: body.count, seenIds });
        // Never a silently smaller set (e.g. the bank changed in between).
        if (questions.length < body.count) {
          throw bankInsufficient(questions.length, body.count, await aiAlternative(req.user));
        }
        bankCount = questions.length;
      } else {
        const generated = await questionGenerator.generate({
          exam,
          topics,
          difficulty: difficulty,
          count: body.count,
          language,
        });
        isPreview = generated.isPreview && generated.questions.length > 0;
        questions = generated.isPreview
          ? generated.questions
          : await bank.add(generated.questions, { examId: exam.id, language, model: generated.model });
        aiCount = generated.isPreview ? 0 : questions.length;
        model = generated.model ?? null;
      }
    } catch (err) {
      await subscription.release(reservation);
      throw err;
    }
    if (questions.length === 0) {
      await subscription.release(reservation);
    } else if (questions.length < body.count) {
      // AI produced fewer valid questions: the set counts, unused questions are refunded.
      await subscription.release(reservation, { unusedQuestions: body.count - questions.length, refundSet: false });
    }

    const index = topicIndex(exam.id);
    const byId = new Map(topics.map((t) => [t.id, t]));
    // Quick sets list only the topics that actually appear in the set.
    const usedTopics =
      body.mode === 'quick'
        ? [...new Set(questions.map((q) => q.topicId))].map((id) => byId.get(id)).filter(Boolean)
        : topics;
    const setId = questions.length ? crypto.randomUUID() : null;
    const session = await practice.createSession({
      setId,
      userId: req.user._id,
      exam,
      subjects: [...new Set(usedTopics.map((t) => t.subjectName))],
      topics: usedTopics.map((t) => t.name),
      difficulty: difficulty,
      requestedCount: body.count,
      isPreview,
      questionSource: source,
      questions: questions.map((q) => ({
        ...q,
        ...(scope && q.nodeId ? { subjectId: scope.tree.subjectId, syllabusPath: scope.tree.pathOf(q.nodeId).map((n) => n.nodeId) } : {}),
        topicName: byId.get(q.topicId)?.name ?? index.get(q.topicId)?.topic.name ?? q.topicId,
      })),
    });

    // My Learning Library: every successful set is saved automatically.
    if (setId) {
      const subjectsById = new Map(usedTopics.map((t) => [t.subjectId, t.subjectName]));
      const { set, created } = await library.createSet({
        id: setId,
        userId: req.user._id,
        requestKey: body.requestKey ?? null,
        exam,
        subjects: [...subjectsById].map(([id, name]) => ({ id, name })),
        topics: usedTopics.map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId })),
        difficulty: difficulty,
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

      // Last Practice (per exam, on the account — restores on any device).
      await users.update(req.user._id, {
        [`lastPractice.${exam.id}`]: {
          examId: exam.id,
          mode: body.mode,
          subjectIds: [...new Set(topics.map((t) => t.subjectId))],
          topicIds: body.mode === 'quick' ? [] : topicIds,
          selectedNodeIds: scope ? scope.selectedNodeIds : [],
          difficulty: difficulty,
          count: body.count,
          language,
          source,
          updatedAt: new Date().toISOString(),
        },
      });
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
    // A syllabus topic/unit, or (Railway Mathematics) an exact concept node id.
    topicId: z.string().optional(),
    nodeId: z.string().max(120).optional(),
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
    if (body.nodeId) return conceptNotes(req, res, exam, body);
    if (!body.topicId) throw httpError(400, 'Select a topic');
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

  /**
   * Notes for one syllabus-tree node of any subject (concept, or a parent for
   * an overview). Same node ids as practice; nothing is kept in a second tree.
   */
  async function conceptNotes(req, res, exam, body) {
    const tree = syllabusOfNode(body.nodeId);
    if (!tree || !tree.hasExam(exam.id) || !tree.isApplicable(exam.id, body.nodeId)) {
      throw httpError(400, `${body.nodeId} is not in the ${exam.name} syllabus`, 'INVALID_NODES');
    }
    const previous = await notes.findByRequestKey(req.user._id, body.requestKey);
    if (previous) return res.status(201).json(toPublicNote(previous));
    await notesQuota.check(req.user._id);

    const path = tree.pathOf(body.nodeId);
    const node = path.at(-1);
    const chapter = path[0];
    const sections = [...new Set(body.sections)];
    const subjectName = getSyllabus(exam.id)?.subjects.find((s) => s.id === tree.subjectId)?.name ?? tree.subjectId;
    const subject = { id: tree.subjectId, name: subjectName };
    const title = (n) => (body.language === 'hi' ? n.titleHi : n.titleEn);
    const topic = { id: node.nodeId, name: path.map(title).join(' › ') };
    const leaves = tree.leafIds(exam.id, node.nodeId);
    const { content, model } = await notesGenerator.generate({
      exam,
      subject,
      topic,
      concept: {
        path: path.map((p) => p.titleEn).join(' › '),
        patterns: [...new Set(leaves.flatMap((id) => tree.getNode(id).patterns ?? []))].slice(0, 12),
        covers: leaves.length > 1 ? leaves.slice(0, 20).map((id) => tree.getNode(id).titleEn) : [],
      },
      language: body.language,
      level: body.level,
      sections,
    });
    const checked = validateNoteContent(content, sections);
    // Next: the following sibling nodes in syllabus order (real node ids).
    const siblings = tree.childIds(exam.id, node.parentId);
    checked.nextTopics = siblings
      .slice(siblings.indexOf(node.nodeId) + 1, siblings.indexOf(node.nodeId) + 4)
      .map((id) => ({ id, name: title(tree.getNode(id)) }));
    const { note } = await notes.create({
      userId: req.user._id,
      requestKey: body.requestKey ?? null,
      exam,
      subject,
      topic,
      parentTopic: path.length > 1 ? { id: chapter.nodeId, name: title(chapter) } : null,
      unitName: null,
      language: body.language,
      level: body.level,
      sections,
      content: checked,
      model,
      extra: { syllabusNodeId: node.nodeId, syllabusId: tree.syllabusId, syllabusPath: path.map((p) => p.nodeId), syllabusVersion: SYLLABUS_TREES_VERSION },
    });
    await notesQuota.record(req.user._id, { topicId: node.nodeId });
    res.status(201).json(toPublicNote(note));
  }

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

  // Declared before /notes/:id ("modes" is not a note id).
  // Learning modes and what each includes for a subject (app explanations).
  // Complete Exam Preparation is the default everywhere.
  api.get('/notes/modes', requireAuth, (req, res) => {
    const { subjectId } = z.object({ subjectId: z.string().optional() }).parse(req.query);
    const template = templateFor(subjectId ?? '');
    res.json({
      default: 'complete',
      template: template.id,
      modes: LEARNING_MODES.map((id) => ({
        id,
        guide: MODE_GUIDE[id],
        blocks: blocksFor(template, id),
        conceptLevels: id === 'quick' ? ['core'] : ['core', 'detail'],
        mcqs: id === 'complete',
      })),
    });
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

  // ── Admin preview ─────────────────────────────────────────────────────────
  // Admins: ADMIN_USER_IDS or role 'admin' on the user. Drafts (outlines and
  // draft nodes) are shown ONLY to admins, with ?preview=1 (or, in
  // development, NOTES_SHOW_DRAFT_OUTLINES=true). Students never see them.
  const adminIds = new Set(config.adminUserIds ?? []);
  const isAdmin = (user) => user?.role === 'admin' || adminIds.has(user?._id);
  const draftsFor = (req) =>
    isAdmin(req.user) && (req.query?.preview === '1' || Boolean(config.notes?.showDraftOutlines));

  // Editorial progress of coverage manifests (admins only).
  api.get('/admin/manifests/report', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) throw httpError(403, 'Admins only', 'ADMIN_ONLY');
    res.json(manifestReport());
  });

  // ── Learning path (AI Study Notes) ──────────────────────────────────────────
  // Ordered topics/units of one subject with this student's progress and notes.
  async function buildPath(userId, exam, path, includeDrafts = false) {
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
      return { ...i, order: index + 1, status, completedAt, latestNoteId: s?.latestId ?? null, notesCount: s?.count ?? 0,
        hasOutline: findOutline(i.id, { includeDrafts }) !== null };
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
    res.json(await buildPath(req.user._id, exam, path, draftsFor(req)));
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
    const outline = findOutline(found.item.id, { includeDrafts: draftsFor(req) });
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
    res.json(await buildPath(req.user._id, exam, found.path, draftsFor(req)));
  });

  // ── Outline sections (curated outline → section-by-section notes) ─────────
  const LangMode = {
    language: z.enum(['en', 'hi']).default('en'),
    mode: z.enum(LEARNING_MODES).default('complete'),
  };

  function resolveOutline(req, examId, unitId) {
    const exam = findExam(examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const found = findLearningItem(exam.id, unitId);
    if (!found || found.item.id !== unitId) throw httpError(404, 'Topic not found in this exam');
    const outline = findOutline(unitId, { includeDrafts: draftsFor(req) });
    if (!outline) throw httpError(404, 'No outline for this topic yet', 'NO_OUTLINE');
    return { exam, found, outline, preview: draftsFor(req) };
  }

  const sectionItemId = (unitId, chapterId, sectionId) => `${unitId}#${chapterId}.${sectionId}`;
  const cacheKeyOf = (outline, chapterId, sectionId, language, mode, preview = false) =>
    SectionCache.key({
      unitId: outline.unitId,
      chapterId,
      sectionId,
      language,
      mode,
      syllabusVersion: SYLLABUS_VERSION,
      outlineVersion: outline.version,
      manifestVersion: findManifest(sectionItemId(outline.unitId, chapterId, sectionId), { includeDrafts: preview })?.version ?? 0,
      promptVersion: SECTION_PROMPT_VERSION,
      schemaVersion: SECTION_SCHEMA_VERSION,
    });

  /** Content status of a section for students/admins (shared, not per student). */
  const contentStatusOf = (key, servable, jobs) => {
    if (servable.has(key)) return 'ready';
    const job = jobs.get(key);
    if (!job || job.state === 'done') return 'not_generated';
    return job.state; // generating | incomplete | validation_failed | failed
  };

  /** Outline with this student's section states, chapter progress and coverage. */
  async function outlineView(userId, { exam, outline, preview = false }, language, mode) {
    const all = outlineSections(outline);
    const keyOf = (chapter, section) => cacheKeyOf(outline, chapter.id, section.id, language, mode, preview);
    const keys = all.map(({ chapter, section }) => keyOf(chapter, section));
    const [states, mine, cached, jobs] = await Promise.all([
      progress.sectionStates(userId, exam.id, outline.unitId),
      notes.sectionNotes(userId, outline.unitId, language, mode),
      sectionCache.servableKeys(keys, { statuses: preview ? PREVIEW_STATUSES : STUDENT_STATUSES }),
      sectionJobs.states(keys),
    ]);
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
          // Subtopic titles above this section (nested outlines); [] when flat.
          path: section.path ?? [],
          origin: section.origin ?? outline.origin,
          state,
          noteId: note?.id ?? null,
          versions: note?.versions ?? 0,
          cached: cached.has(keyOf(chapter, section)),
          // Shared content status (ready / generating / incomplete / …),
          // separate from this student's own progress in `state`.
          contentStatus: contentStatusOf(keyOf(chapter, section), cached, jobs),
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
    const ctx = resolveOutline(req, req.params.examId, req.params.unitId);
    res.json(await outlineView(req.user._id, ctx, language, mode));
  });

  /**
   * The exam's tree decorated for one student: CONTENT readiness (shared)
   * and the student's PROGRESS, rolled up at every level:
   *   stats.sections / ready / completed / inProgress — outline sections
   *   stats.items / itemsCompleted — learning-path items (topics, units)
   * A section is in_progress when the student opened it (has a saved copy)
   * but has not marked it complete; generating content never counts as
   * studying it.
   */
  async function decoratedTree(req, exam, q) {
    const preview = draftsFor(req);
    const tree = buildExamTree(exam.id, { subjectId: q.subjectId ?? null, includeDrafts: preview });
    const userId = req.user._id;

    const outlined = [];
    const items = []; // path items: units, and topics without units
    walkTree(tree, (n) => {
      if (n.outlineVersion != null) outlined.push(n);
      if ((n.type === 'unit' || n.type === 'topic') && !n.children.some((c) => c.type === 'unit')) items.push(n.id);
    });
    const itemSet = new Set(items);
    const [itemDone, perUnit] = await Promise.all([
      progress.completed(userId, exam.id, items),
      Promise.all(
        outlined.map(async (n) => {
          const outline = findOutline(n.id, { includeDrafts: preview });
          const keys = outlineSections(outline).map(({ chapter, section }) =>
            cacheKeyOf(outline, chapter.id, section.id, q.language, q.mode, preview),
          );
          const [states, cached, jobs, mine] = await Promise.all([
            progress.sectionStates(userId, exam.id, n.id),
            sectionCache.servableKeys(keys, { statuses: preview ? PREVIEW_STATUSES : STUDENT_STATUSES }),
            sectionJobs.states(keys),
            notes.sectionNotes(userId, n.id, q.language, q.mode),
          ]);
          return { outline, states, cached, jobs, mine };
        }),
      ),
    ]);
    const sectionInfo = new Map();
    for (const { outline, states, cached, jobs, mine } of perUnit) {
      for (const { chapter, section } of outlineSections(outline)) {
        const id = `${outline.unitId}#${chapter.id}.${section.id}`;
        const done = states.get(id)?.state === 'completed';
        sectionInfo.set(id, {
          content: contentStatusOf(cacheKeyOf(outline, chapter.id, section.id, q.language, q.mode, preview), cached, jobs),
          progress: done ? 'completed' : mine.has(`${chapter.id}.${section.id}`) ? 'in_progress' : 'not_started',
        });
      }
    }

    let next = null;
    const inProgress = [];
    const decorate = (n) => {
      if (n.type === 'section') {
        Object.assign(n, sectionInfo.get(n.id) ?? { content: 'not_generated', progress: 'not_started' });
        n.stats = {
          sections: 1,
          ready: n.content === 'ready' ? 1 : 0,
          completed: n.progress === 'completed' ? 1 : 0,
          inProgress: n.progress === 'in_progress' ? 1 : 0,
          items: 0,
          itemsCompleted: 0,
        };
        if (n.progress === 'in_progress') inProgress.push({ id: n.id, name: n.name, ...n.ref });
        if (!next && n.progress !== 'completed' && n.status === 'approved') next = { type: 'section', id: n.id, name: n.name, ...n.ref };
        return n.stats;
      }
      const stats = { sections: 0, ready: 0, completed: 0, inProgress: 0, items: 0, itemsCompleted: 0 };
      for (const c of n.children) {
        const s = decorate(c);
        for (const k of Object.keys(stats)) stats[k] += s[k];
      }
      if (itemSet.has(n.id)) {
        stats.items += 1;
        if (itemDone.has(n.id)) {
          stats.itemsCompleted += 1;
          n.progress = 'completed';
        } else {
          n.progress = stats.completed + stats.inProgress > 0 ? 'in_progress' : 'not_started';
          if (!next && !n.children.length) next = { type: n.type, id: n.id, name: n.name };
        }
      }
      n.stats = stats;
      return stats;
    };
    decorate(tree);
    return { tree, next, inProgress };
  }

  // ── Syllabus tree ─────────────────────────────────────────────────────────
  // Subject → topic → [unit] → chapter → [subtopic…] → section for one exam,
  // with CONTENT readiness (shared cache) and STUDENT progress kept apart.
  api.get('/syllabus/tree/:examId', requireAuth, async (req, res) => {
    const q = z
      .object({ subjectId: z.string().optional(), preview: z.string().optional(), ...LangMode })
      .parse(req.query);
    const exam = findExam(req.params.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const { tree, next } = await decoratedTree(req, exam, q);
    if (q.subjectId && tree.children.length === 0) throw httpError(404, 'Subject not found in this exam');
    res.json({ ...tree, language: q.language, mode: q.mode, next });
  });

  /** Same rule as the app's Weak Topics practice: < 60 % with ≥ 2 attempts. */
  const WEAK_ACCURACY = 0.6;
  const WEAK_MIN_ATTEMPTS = 2;

  // ── Learning progress + recommendations ───────────────────────────────────
  // Progress per subject/topic/chapter, what to study next, sections left
  // half-done, and topics to REVISE based on the student's real practice
  // results (never on AI generation).
  api.get('/learning/recommendations/:examId', requireAuth, async (req, res) => {
    const q = z
      .object({ subjectId: z.string().optional(), preview: z.string().optional(), ...LangMode })
      .parse(req.query);
    const exam = findExam(req.params.examId);
    if (!exam) throw httpError(404, 'Unknown exam');
    const [{ tree, next, inProgress }, stats] = await Promise.all([
      decoratedTree(req, exam, q),
      practice.topicStats(req.user._id),
    ]);
    if (q.subjectId && tree.children.length === 0) throw httpError(404, 'Subject not found in this exam');

    const topics = new Map();
    walkTree(tree, (n) => n.type === 'topic' && topics.set(n.id, n));
    const revise = stats
      .filter((t) => topics.has(t.topicId) && t.total >= WEAK_MIN_ATTEMPTS && t.correct / t.total < WEAK_ACCURACY)
      .map((t) => {
        const node = topics.get(t.topicId);
        const studied = node.stats.completed > 0 || node.stats.itemsCompleted > 0;
        return {
          topicId: t.topicId,
          name: node.name,
          subjectId: node.parentId,
          accuracy: Math.round((t.correct / t.total) * 100) / 100,
          attempted: t.total,
          // Studied but still weak → revise the notes; not studied → learn it first.
          action: studied ? 'revise_notes' : 'study_notes',
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const level = (n) => ({
      id: n.id,
      name: n.name,
      sections: n.stats.sections,
      sectionsCompleted: n.stats.completed,
      sectionsInProgress: n.stats.inProgress,
      contentReady: n.stats.ready,
      items: n.stats.items,
      itemsCompleted: n.stats.itemsCompleted,
    });
    res.json({
      examId: exam.id,
      subjects: tree.children.map((s) => ({
        ...level(s),
        topics: s.children.map((t) => {
          const chapters = [];
          walkTree(t, (n) => n.type === 'chapter' && chapters.push(level(n)));
          return { ...level(t), chapters };
        }),
      })),
      next,
      continue: inProgress.slice(0, 5),
      revise,
    });
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
    const ctx = resolveOutline(req, body.examId, body.unitId);
    const { exam, found, outline } = ctx;
    const chapter = outline.chapters.find((c) => c.id === body.chapterId);
    const section = chapter?.sections.find((s) => s.id === body.sectionId);
    if (!section) throw httpError(404, 'Section not found in this outline');
    const unapproved = outline.status !== 'approved' || chapter.status === 'draft' || section.status === 'draft';
    if (unapproved && !isAdmin(req.user)) {
      throw httpError(403, 'This outline is not approved yet.', 'OUTLINE_NOT_APPROVED');
    }
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

    const preview = ctx.preview;
    const key = cacheKeyOf(outline, chapter.id, section.id, body.language, body.mode, preview);
    const itemId = sectionItemId(outline.unitId, chapter.id, section.id);
    const statuses = preview ? PREVIEW_STATUSES : STUDENT_STATUSES;
    let entry = body.regenerate ? null : await sectionCache.current(key, { statuses });
    let source = 'cache';
    if (!entry) {
      await notesQuota.check(userId);
      const shared = !body.regenerate && inflight.get(key);
      try {
        if (shared) {
          entry = await shared; // someone else's in-flight generation: free
        } else {
          // One generator per section across ALL servers (lease in section_jobs).
          const owner = crypto.randomUUID();
          if (!(await sectionJobs.acquire(key, owner, { unitId: outline.unitId }))) {
            return res.status(202).json({ status: 'generating', retryAfterSeconds: 10 });
          }
          // Coverage contract (approved; drafts only in admin preview).
          const manifest = findManifest(itemId, { includeDrafts: preview });
          const job = (async () => {
            try {
              const g = await sectionGenerator.generate({
                exam,
                subject: found.subject,
                unitName: found.item.unitName,
                outline,
                chapter,
                section,
                language: body.language,
                mode: body.mode,
                manifest,
              });
              // Passed every automatic check → published (AI-checked, not
              // human-reviewed). From a draft outline/manifest → review only.
              const status = unapproved || manifest?.status === 'draft' ? 'ready_for_review' : 'published';
              const stored = await sectionCache.put(key, {
                content: g.content,
                quality: g.quality,
                model: g.model,
                unitId: outline.unitId,
                status,
                meta: {
                  versions: {
                    syllabus: SYLLABUS_VERSION,
                    outline: outline.version,
                    manifest: manifest?.version ?? 0,
                    prompt: SECTION_PROMPT_VERSION,
                    schema: SECTION_SCHEMA_VERSION,
                  },
                  coverageBasis: g.quality.coverageBasis ?? (manifest ? 'manifest' : 'structure_only'),
                  verification: g.quality.coverage?.verification ?? 'unverified',
                  sourceRefs: manifest?.sources ?? [],
                  repairAttempts: g.repairAttempts ?? 0,
                },
              });
              await sectionJobs.finish(key, owner, { state: 'done', repairAttempts: g.repairAttempts ?? 0 });
              return stored;
            } catch (err) {
              await sectionJobs.finish(key, owner, {
                state:
                  err.code === 'CONTENT_INCOMPLETE'
                    ? 'incomplete'
                    : err instanceof GenerationError
                      ? 'validation_failed'
                      : 'failed',
                error: err.message,
                missing: err.coverage
                  ? { concepts: err.coverage.concepts.missing, facts: err.coverage.facts.missing, blocks: err.coverage.blocks.missing }
                  : null,
                repairAttempts: err.repairAttempts ?? 0,
              });
              throw err;
            }
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
    res.status(201).json({
      ...toPublicNote(note),
      source,
      contentStatus: entry.status,
      review: entry.review ?? 'auto',
      coverageBasis: entry.coverageBasis ?? entry.quality?.coverageBasis ?? 'structure_only',
      verification: entry.verification ?? 'unverified',
    });
  });

  // Shared generation status of one section (for "Generating…" / retry).
  api.get('/notes/sections/status', requireAuth, async (req, res) => {
    const q = z
      .object({ examId: z.string(), unitId: z.string(), chapterId: z.string(), sectionId: z.string(), ...LangMode })
      .parse(req.query);
    const ctx = resolveOutline(req, q.examId, q.unitId);
    const chapter = ctx.outline.chapters.find((c) => c.id === q.chapterId);
    const section = chapter?.sections.find((x) => x.id === q.sectionId);
    if (!section) throw httpError(404, 'Section not found in this outline');
    const key = cacheKeyOf(ctx.outline, chapter.id, section.id, q.language, q.mode, ctx.preview);
    const statuses = ctx.preview ? PREVIEW_STATUSES : STUDENT_STATUSES;
    const [entry, jobs] = await Promise.all([sectionCache.current(key, { statuses }), sectionJobs.states([key])]);
    const job = jobs.get(key);
    res.json({
      status: entry ? 'ready' : !job || job.state === 'done' ? 'not_generated' : job.state,
      contentStatus: entry?.status ?? null,
      review: entry?.review ?? null,
      missing: entry ? null : (job?.missing ?? null),
      error: entry ? null : (job?.error ?? null),
      canRetry: !entry && Boolean(job) && job.state !== 'generating',
    });
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
    const ctx = resolveOutline(req, body.examId, body.unitId);
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
      return res.status(err.status).json({
        error: err.message,
        ...(err.code ? { code: err.code } : {}),
        ...(err.details ? { details: err.details } : {}),
      });
    }
    if (err instanceof GenerationError && err.code === 'CONTENT_INCOMPLETE') {
      return res.status(422).json({
        error: err.message,
        code: 'CONTENT_INCOMPLETE',
        details: {
          missingConcepts: err.coverage.concepts.missing,
          missingFacts: err.coverage.facts.missing,
          missingBlocks: err.coverage.blocks.missing,
          mcqs: err.coverage.mcqs,
          repairAttempts: err.repairAttempts,
        },
      });
    }
    if (err instanceof GenerationError) {
      return res.status(502).json({ error: err.message });
    }
    if (err instanceof AiServiceError && err.quotaExhausted) {
      // Gemini quota used up: nothing was saved and nothing was counted.
      return res.status(503).json({
        error: 'The AI service has reached its usage limit. Please try again later.',
        code: 'AI_QUOTA_EXHAUSTED',
        details: { retryAfterSeconds: err.retryAfterSeconds ?? null },
      });
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
