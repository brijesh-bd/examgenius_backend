// Integration tests against a real local MongoDB, in a separate database
// (examgenius_test) that is dropped before and after the run.
//   npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { UserStore } from '../src/services/userStore.js';
import { PracticeStore, scoreSession } from '../src/services/practiceStore.js';
import { QuestionBank, fingerprint } from '../src/services/questionBank.js';
import { SubscriptionService, istDate, nextIstMidnight } from '../src/services/subscription.js';
import { LibraryStore } from '../src/services/libraryStore.js';
import { NotesStore } from '../src/services/notesStore.js';
import { LearningProgressStore } from '../src/services/learningProgressStore.js';
import { SectionCache } from '../src/services/sectionCache.js';
import { SectionJobs } from '../src/services/sectionJobs.js';
import { NotesQuota } from '../src/services/notesQuota.js';
import { GeminiJsonClient } from '../src/services/geminiClient.js';
import { checkSection, QUALITY_RULES } from '../src/services/sectionGenerator.js';
import { ancientIndiaOutline } from '../src/data/outlines/ancient_india.js';
import { validateNoteContent, UnavailableNotesGenerator } from '../src/services/notesGenerator.js';
import {
  FallbackGenerator,
  GeminiQuestionGenerator,
  SampleQuestionGenerator,
  AiServiceError,
  GenerationError,
  isValidQuestion,
  splitSteps,
} from '../src/services/questionGenerator.js';
import { examCatalog } from '../src/data/examCatalog.js';
import { examSubjects } from '../src/data/syllabus.js';
import { sampleQuestionBank } from '../src/data/sampleQuestions.js';

const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const plans = (free) => ({
  free: { setsPerDay: 2, aiSetsPerDay: 1, maxQuestionsPerSet: 10, maxSaved: 10, customCount: false, ...free },
  pro: { questionsPerDay: 300, aiSetsPerDay: null, maxQuestionsPerSet: 40, customCount: true },
  trialDays: 7,
  offers: [{ id: 'pro_yearly', months: 12, priceInr: 499, popular: true }],
});
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  notes: { showDraftOutlines: true },
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 40, generationsPerHour: 500, notesPerHour: 500 },
  practice: { secondsPerQuestion: 60, correctMark: 1, negativeMark: 0.25 },
  // Main app: generous limits so the flow tests are not about quotas.
  plans: plans({ setsPerDay: 1000, aiSetsPerDay: null, maxQuestionsPerSet: 30, maxSaved: 1000 }),
};
// Strict app (same DB): real Free limits, saved cap of 1, fake "AI" generator.
const strictConfig = { ...config, plans: plans({ maxSaved: 1 }) };

/** Stands in for Gemini: unique valid questions, counts how often it is called. */
class FakeAi {
  calls = 0;
  failNext = false;
  #seq = 0;
  async generate({ topics, difficulty, count }) {
    this.calls++;
    if (this.failNext) {
      this.failNext = false;
      throw new AiServiceError('busy', true);
    }
    const questions = Array.from({ length: count }, (_, i) => {
      const n = this.#seq++;
      return {
        id: `fake_${n}`,
        topicId: topics[i % topics.length].id,
        difficulty,
        question: `Fake AI question number ${n}?`,
        options: [`${n}a`, `${n}b`, `${n}c`, `${n}d`],
        correctIndex: n % 4,
        explanation: 'Because.',
        steps: [],
      };
    });
    return { questions, isPreview: false, model: 'fake' };
  }
}

let server;
let base;
let strictServer;
let strictBase;
let db;
const fakeAi = new FakeAi();

/** Stands in for Gemini notes. */
/** A section long enough to pass the quality rules of [mode]. */
function goodSection(mode, tag = 'x') {
  const para = Array.from({ length: 260 }, (_, i) => `w${i}`).join(' ');
  return {
    overview: `Overview ${tag}`,
    explanation: Array.from({ length: 5 }, (_, i) => ({ heading: `H${i}`, body: `${tag} ${para}` })),
    concepts: [{ term: 'Term', definition: 'Definition' }],
    examples: [],
    flowcharts: [],
    graphs: [],
    formulas: [],
    tables: [{ title: 'Sites', headers: ['Site', 'State'], rows: [['Lothal', 'Gujarat']] }],
    codeExamples: [],
    tips: ['Tip'],
    mistakes: ['Mistake'],
    keyPoints: ['Point'],
    quickRevision: ['Rev'],
    mcqs: Array.from({ length: 8 }, (_, i) => ({ question: `Q${i}?`, options: ['a', 'b', 'c', 'd'], correctIndex: 1, explanation: 'b' })),
    nextTopics: ['AI invented topic'],
    timeline: [{ period: 'c. 2600 BCE', event: 'Mature Harappan phase' }],
    keyFacts: Array.from({ length: 12 }, (_, i) => `Fact ${i}: ${para.split(' ').slice(0, 30).join(' ')}`),
  };
}

/** Stands in for Gemini section generation; validates like the real one. */
const fakeSections = {
  calls: 0,
  failNext: null,
  async generate({ section, mode }) {
    this.calls++;
    if (this.failNext) {
      const e = this.failNext;
      this.failNext = null;
      throw e;
    }
    const { content, quality } = checkSection(goodSection(mode, section.id), mode);
    return { content, quality, model: 'fake-section' };
  },
};

const fakeNotes = {
  calls: 0,
  fail: false,
  async generate({ topic, sections }) {
    this.calls++;
    if (this.fail) throw new GenerationError('The AI notes were incomplete. Please try again.');
    return {
      model: 'fake-notes',
      content: {
        overview: `About ${topic.name}.`,
        explanation: [{ heading: 'Idea', body: 'Body text.' }],
        mcqs: [
          { question: 'Q?', options: ['a', 'b', 'c', 'd'], correctIndex: 1, explanation: 'b' },
          { question: 'Broken?', options: ['a'], correctIndex: 0, explanation: '' },
        ],
        graphs: [{ title: 'g', xLabel: 'x', yLabel: 'y', points: [{ x: 1, y: 2 }], caption: '' }],
        nextTopics: ['Next'],
        tips: sections.includes('tips') ? ['Tip'] : ['should be dropped'],
      },
    };
  },
};
const services = (cfg, generator) => ({
  config: cfg,
  users: new UserStore(db.users),
  practice: new PracticeStore(db, cfg.practice),
  questionGenerator: generator,
  bank: new QuestionBank(db.questionBank, db.sessions),
  subscription: new SubscriptionService(db, cfg.plans),
  library: new LibraryStore(db),
  notes: new NotesStore(db),
  progress: new LearningProgressStore(db),
  sectionCache: new SectionCache(db),
  sectionJobs: new SectionJobs(db),
  notesQuota: new NotesQuota(db, { perHour: cfg.ai.notesPerHour ?? 20 }),
  sectionGenerator: fakeSections,
  notesGenerator: fakeNotes,
});
const listen = async (app) => {
  const s = app.listen(0);
  await new Promise((r) => s.once('listening', r));
  return [s, `http://127.0.0.1:${s.address().port}/api/v1`];
};
before(async () => {
  const fresh = await connectDb({ uri: MONGO_URI, db: 'examgenius_test' });
  await fresh.db.dropDatabase();
  await fresh.client.close();
  db = await connectDb({ uri: MONGO_URI, db: 'examgenius_test' }); // recreate indexes
  [server, base] = await listen(createApp(services(config, new SampleQuestionGenerator())));
  [strictServer, strictBase] = await listen(createApp(services(strictConfig, fakeAi)));
});
after(async () => {
  server.close();
  strictServer.close();
  await db.db.dropDatabase();
  await db.client.close();
});

async function call(method, path, body, token, root = base) {
  const res = await fetch(root + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const student = {
  name: 'Asha Verma',
  mobile: '9876543210',
  email: 'Asha@Example.com',
  password: 'password123',
  targetExamId: 'rrb_ntpc',
};

let token;

test('health', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.aiMode, 'preview');
});

test('register stores the user in MongoDB with a hashed password', async () => {
  const r = await call('POST', '/auth/register', student);
  assert.equal(r.status, 201);
  assert.ok(r.body.token);
  assert.equal(r.body.user.email, 'asha@example.com');
  assert.equal(r.body.user.passwordHash, undefined);
  const doc = await db.users.findOne({ mobile: student.mobile });
  assert.ok(doc.passwordHash.startsWith('$2'));
  assert.notEqual(doc.passwordHash, student.password);
  token = r.body.token;
  // Admin: the outline tests below preview DRAFT outlines (students cannot).
  await db.users.updateOne({ mobile: student.mobile }, { $set: { role: 'admin' } });
});

test('duplicate mobile or email is rejected', async () => {
  assert.equal((await call('POST', '/auth/register', student)).status, 409);
  const sameEmail = { ...student, mobile: '9123456780', email: 'asha@example.com' };
  assert.equal((await call('POST', '/auth/register', sameEmail)).status, 409);
});

test('login with mobile or email; wrong password fails', async () => {
  const byMobile = await call('POST', '/auth/login', { identifier: student.mobile, password: student.password });
  assert.equal(byMobile.status, 200);
  const byEmail = await call('POST', '/auth/login', { identifier: 'ASHA@example.com', password: student.password });
  assert.equal(byEmail.status, 200);
  assert.equal(byEmail.body.user.id, byMobile.body.user.id);
  const legacy = await call('POST', '/auth/login', { mobile: student.mobile, password: student.password });
  assert.equal(legacy.status, 200);
  const bad = await call('POST', '/auth/login', { identifier: student.mobile, password: 'wrongpass' });
  assert.equal(bad.status, 401);
});

test('forgot password answers the same for known and unknown accounts', async () => {
  const known = await call('POST', '/auth/forgot-password', { identifier: student.mobile });
  const unknown = await call('POST', '/auth/forgot-password', { identifier: 'nobody@example.com' });
  assert.equal(known.status, 202);
  assert.deepEqual(known.body, unknown.body);
  assert.equal((await call('POST', '/auth/forgot-password', { identifier: 'abc' })).status, 400);
});

test('protected routes need a valid token', async () => {
  assert.equal((await call('GET', '/auth/me')).status, 401);
  assert.equal((await call('GET', '/auth/me', undefined, 'garbage')).status, 401);
  const me = await call('GET', '/auth/me', undefined, token);
  assert.equal(me.body.user.name, student.name);
});

test('catalog and syllabus', async () => {
  const cats = await call('GET', '/exams');
  assert.equal(cats.body.categories.length, examCatalog.length);
  const syl = await call('GET', '/exams/rrb_ntpc/syllabus');
  assert.equal(syl.status, 200);
  assert.ok(syl.body.subjects.length > 0);
  assert.equal((await call('GET', '/exams/nope/syllabus')).status, 404);
});

const generate = (body = {}) =>
  call(
    'POST',
    '/questions/generate',
    { examId: 'rrb_ntpc', topicIds: ['quant.time_work'], difficulty: 'medium', count: 5, source: 'ai', ...body },
    token,
  );

test('generate returns a session WITHOUT answers; answer key stays in MongoDB', async () => {
  const r = await generate();
  assert.equal(r.status, 201);
  assert.ok(r.body.sessionId);
  assert.ok(r.body.questions.length > 0);
  assert.equal(r.body.timeLimitSeconds, r.body.questions.length * 60);
  assert.equal(r.body.isPreview, true);
  for (const q of r.body.questions) {
    assert.equal(q.correctIndex, undefined);
    assert.equal(q.explanation, undefined);
    assert.ok(q.topicName);
  }
  const stored = await db.sessions.findOne({ _id: r.body.sessionId });
  assert.ok(stored.questions.every((q) => Number.isInteger(q.correctIndex)));
});

test('generate validates exam and topics', async () => {
  assert.equal((await generate({ examId: 'nope' })).status, 404);
  assert.equal((await generate({ topicIds: ['reasoning.nope'] })).status, 400);
  assert.equal((await generate({ count: 999 })).status, 400);
});

test('submit scores on the server, is idempotent, and reveals answers only now', async () => {
  const s = (await generate()).body;
  const stored = await db.sessions.findOne({ _id: s.sessionId });
  const [first, second, ...rest] = stored.questions;
  const answers = {
    [first.id]: first.correctIndex, // correct
    [second.id]: (second.correctIndex + 1) % 4, // wrong
  };
  const r = await call('POST', `/practice/${s.sessionId}/submit`, { answers, timeTakenSeconds: 75 }, token);
  assert.equal(r.status, 200);
  assert.equal(r.body.correct, 1);
  assert.equal(r.body.incorrect, 1);
  assert.equal(r.body.unattempted, rest.length);
  assert.equal(r.body.score, 0.75);
  assert.equal(r.body.accuracy, 0.5);
  assert.equal(r.body.timeTakenSeconds, 75);
  assert.equal(r.body.reviews[0].correctIndex, first.correctIndex);
  assert.ok(r.body.reviews[0].explanation);

  const again = await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 1 }, token);
  assert.equal(again.body.resultId, r.body.resultId);
  assert.equal(again.body.correct, 1); // first result kept
});

test('another student cannot submit or read my test', async () => {
  const s = (await generate()).body;
  const other = await call('POST', '/auth/register', { ...student, mobile: '9000000001', email: null });
  const r = await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 1 }, other.body.token);
  assert.equal(r.status, 404);
});

test('retry creates a new session with only the chosen questions', async () => {
  const s = (await generate()).body;
  const result = (await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 5 }, token)).body;
  const pick = [s.questions[0].id];
  const r = await call('POST', '/practice/retry', { resultId: result.resultId, questionIds: pick }, token);
  assert.equal(r.status, 201);
  assert.notEqual(r.body.sessionId, s.sessionId);
  assert.equal(r.body.questions.length, 1);
  assert.equal(r.body.questions[0].question, s.questions[0].question);
  assert.equal(r.body.questions[0].correctIndex, undefined);
  // Original result unchanged.
  const original = await call('GET', `/practice/results/${result.resultId}`, undefined, token);
  assert.equal(original.body.unattempted, s.questions.length);
});

test('save, list, delete saved practice (idempotent save)', async () => {
  const s = (await generate()).body;
  const result = (await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 5 }, token)).body;
  const a = await call('POST', '/practice/saved', { resultId: result.resultId }, token);
  const b = await call('POST', '/practice/saved', { resultId: result.resultId }, token);
  assert.equal(a.status, 201);
  assert.equal(a.body.id, b.body.id);
  assert.equal(a.body.result.resultId, result.resultId);

  const list = await call('GET', '/practice/saved', undefined, token);
  assert.equal(list.body.items.filter((i) => i.result.resultId === result.resultId).length, 1);

  assert.equal((await call('DELETE', `/practice/saved/${a.body.id}`, undefined, token)).status, 204);
  assert.equal((await call('DELETE', `/practice/saved/${a.body.id}`, undefined, token)).status, 404);
  assert.equal((await call('POST', '/practice/saved', { resultId: 'nope' }, token)).status, 404);
});

test('dashboard summary reflects real results', async () => {
  const r = await call('GET', '/dashboard/summary', undefined, token);
  assert.equal(r.status, 200);
  assert.ok(r.body.testsTaken >= 3);
  assert.ok(r.body.generations >= 3);
  assert.ok(r.body.recentResults.length > 0);
});

// ── My Learning Library ──────────────────────────────────────────────────────

test('library: every generation is saved with category, ids, language — no answers leave the server', async () => {
  const s = (await generate({ language: 'hi' })).body;
  assert.ok(s.setId);
  const set = await db.practiceSets.findOne({ _id: s.setId });
  assert.equal(set.category, 'railway');
  assert.equal(set.examId, 'rrb_ntpc');
  assert.deepEqual(set.subjects.map((x) => x.id), ['quant']);
  assert.deepEqual(set.topics.map((t) => t.id), ['quant.time_work']);
  assert.equal(set.topics[0].subjectId, 'quant');
  assert.equal(set.language, 'hi');
  assert.equal(set.questionCount, s.questions.length);
  assert.ok(set.questions.every((q) => Number.isInteger(q.correctIndex) && q.explanation));

  const list = await call('GET', '/library/sets?category=railway', undefined, token);
  assert.equal(list.status, 200);
  const card = list.body.items.find((i) => i.id === s.setId);
  assert.ok(card);
  assert.equal(card.questions, undefined);
  assert.equal(card.stats.attempts, 0);
  const detail = await call('GET', `/library/sets/${s.setId}`, undefined, token);
  assert.equal(detail.body.questions, undefined);
});

test('library: a retried generate request (same requestKey) does not create a duplicate', async () => {
  const before = await db.practiceSets.countDocuments({});
  const a = await generate({ requestKey: 'req-key-0001' });
  const b = await generate({ requestKey: 'req-key-0001' });
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.equal(a.body.setId, b.body.setId);
  assert.equal(a.body.sessionId, b.body.sessionId);
  assert.equal(await db.practiceSets.countDocuments({}), before + 1);
});

test('library: each submit is a separate attempt; Practice Again reuses the original questions', async () => {
  const s = (await generate()).body;
  const stored = await db.sessions.findOne({ _id: s.sessionId });
  const allRight = Object.fromEntries(stored.questions.map((q) => [q.id, q.correctIndex]));

  await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 10 }, token);
  // Repeated submit of the same test is not a second attempt.
  await call('POST', `/practice/${s.sessionId}/submit`, { answers: allRight, timeTakenSeconds: 10 }, token);
  let card = (await call('GET', `/library/sets/${s.setId}`, undefined, token)).body;
  assert.equal(card.stats.attempts, 1);
  assert.equal(card.stats.latestScore, 0);

  const again = await call('POST', `/library/sets/${s.setId}/start`, undefined, token);
  assert.equal(again.status, 201);
  assert.notEqual(again.body.sessionId, s.sessionId);
  assert.equal(again.body.setId, s.setId);
  assert.deepEqual(again.body.questions.map((q) => q.question), s.questions.map((q) => q.question));
  assert.equal(again.body.questions[0].correctIndex, undefined);
  // Scored on the server against the stored key (client sends answers only).
  const r2 = await call('POST', `/practice/${again.body.sessionId}/submit`, { answers: allRight, timeTakenSeconds: 20 }, token);
  assert.equal(r2.body.correct, s.questions.length);

  card = (await call('GET', `/library/sets/${s.setId}`, undefined, token)).body;
  assert.equal(card.stats.attempts, 2);
  assert.equal(card.stats.latestScore, s.questions.length);
  assert.equal(card.stats.bestScore, s.questions.length);
  assert.equal(card.stats.latestResultId, r2.body.resultId);
  const attempts = await db.practiceAttempts.find({ setId: s.setId }).sort({ attemptNo: 1 }).toArray();
  assert.deepEqual(attempts.map((a) => a.attemptNo), [1, 2]);
  assert.deepEqual(attempts.map((a) => a.score), [0, s.questions.length]);

  // Partial retries are not attempts of the whole set.
  const retry = await call('POST', '/practice/retry', { resultId: r2.body.resultId, questionIds: [s.questions[0].id] }, token);
  assert.equal(retry.body.setId, null);
});

test('library: categories never mix; filters, search, sort and facets', async () => {
  const ssc = (await generate({ examId: 'ssc_cgl', topicIds: ['quant.percentage'], difficulty: 'hard' })).body;
  const railway = await call('GET', '/library/sets?category=railway&pageSize=50', undefined, token);
  assert.ok(railway.body.items.every((i) => i.category === 'railway'));
  assert.ok(!railway.body.items.some((i) => i.id === ssc.setId));
  const sscList = await call('GET', '/library/sets?category=ssc', undefined, token);
  assert.deepEqual(sscList.body.items.map((i) => i.id), [ssc.setId]);

  const q = (qs) => call('GET', `/library/sets?category=railway&${qs}`, undefined, token);
  assert.equal((await q('difficulty=hard')).body.total, 0);
  assert.ok((await q('topicId=quant.time_work')).body.total > 0);
  assert.equal((await q('examId=rrb_group_d')).body.total, 0);
  assert.ok((await q('q=time')).body.total > 0);
  assert.equal((await q('q=zzz(')).body.total, 0); // regex-safe
  const latest = (await q('sort=latest')).body.items.map((i) => i.createdAt);
  assert.deepEqual(latest, [...latest].sort().reverse());

  const facets = (await call('GET', '/library/facets?category=railway', undefined, token)).body;
  assert.deepEqual(facets.exams.map((e) => e.id), ['rrb_ntpc']);
  assert.equal(facets.topics[0].subjectId, 'quant');

  assert.equal((await call('GET', '/library/sets?category=nope', undefined, token)).status, 400);
  assert.equal((await call('GET', '/library/sets', undefined, token)).status, 400);
});

test('library: summary totals; other students see nothing; delete removes the set and its attempts', async () => {
  const sum = (await call('GET', '/library/summary', undefined, token)).body;
  assert.equal(sum.totalSets, await db.practiceSets.countDocuments({}));
  assert.ok(sum.totalQuestions >= sum.totalSets);
  assert.ok(sum.categories.some((c) => c.category === 'ssc' && c.sets === 1));
  assert.ok(sum.recent.length > 0 && sum.recent[0].questions === undefined);

  const s = (await generate()).body;
  await call('POST', `/practice/${s.sessionId}/submit`, { answers: {}, timeTakenSeconds: 1 }, token);
  const other = (await call('POST', '/auth/register', { ...student, mobile: '9000000077', email: null })).body.token;
  assert.equal((await call('GET', `/library/sets/${s.setId}`, undefined, other)).status, 404);
  assert.equal((await call('POST', `/library/sets/${s.setId}/start`, undefined, other)).status, 404);
  assert.equal((await call('DELETE', `/library/sets/${s.setId}`, undefined, other)).status, 404);
  assert.equal((await call('GET', '/library/summary', undefined, other)).body.totalSets, 0);

  assert.equal((await call('DELETE', `/library/sets/${s.setId}`, undefined, token)).status, 204);
  assert.equal((await call('GET', `/library/sets/${s.setId}`, undefined, token)).status, 404);
  assert.equal(await db.practiceAttempts.countDocuments({ setId: s.setId }), 0);
  assert.equal((await call('DELETE', `/library/sets/${s.setId}`, undefined, token)).status, 404);
  assert.equal((await call('GET', '/library/summary')).status, 401);
});

// ── Pure units ───────────────────────────────────────────────────────────────

test('scoreSession marking and invalid answers', () => {
  const session = {
    _id: 's',
    examName: 'E',
    subjects: [],
    topics: [],
    difficulty: 'easy',
    questions: [
      { id: 'a', topicId: 't', topicName: 'T', question: 'q', options: ['1', '2', '3', '4'], correctIndex: 0, explanation: 'x' },
      { id: 'b', topicId: 't', topicName: 'T', question: 'q', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'x', wrongReasons: [null, null, 'mistake C', null] },
      { id: 'c', topicId: 't', topicName: 'T', question: 'q', options: ['1', '2', '3', '4'], correctIndex: 2, explanation: 'x' },
    ],
  };
  const r = scoreSession(session, { a: 0, b: 2, c: 9, zzz: 1 });
  assert.equal(r.correct, 1);
  assert.equal(r.incorrect, 1);
  assert.equal(r.unattempted, 1);
  assert.equal(r.score, 0.75);
  assert.equal(r.reviews[1].wrongReason, 'mistake C');
  assert.equal(r.reviews[2].selectedIndex, null);
});

test('every catalog exam has a syllabus and samples are valid', () => {
  for (const c of examCatalog) for (const e of c.exams) assert.ok(examSubjects[e.id], e.id);
  for (const q of sampleQuestionBank) assert.ok(isValidQuestion(q, new Set([q.topicId])), q.id);
});

test('splitSteps', () => {
  assert.deepEqual(splitSteps('A = 1. B = 2.'), ['A = 1.', 'B = 2.']);
  assert.deepEqual(splitSteps('Only one.'), []);
});

// ── Gemini generator (fake fetch, no network) ───────────────────────────────

const request = {
  exam: { id: 'rrb_ntpc', name: 'RRB NTPC' },
  topics: [{ id: 'quant.time_work', name: 'Time & Work', subjectName: 'Maths' }],
  difficulty: 'medium',
  count: 2,
  language: 'en',
};
const ok = (questions) => ({
  ok: true,
  status: 200,
  json: async () => ({
    candidates: [{ content: { parts: [{ text: JSON.stringify({ questions }) }] }, finishReason: 'STOP' }],
  }),
});
const fail = (status) => ({ ok: false, status, json: async () => ({ error: { message: `fail ${status}` } }) });
const goodQ = {
  topicId: 'quant.time_work',
  question: 'Q?',
  options: ['6', '7', '8', '9'],
  correctIndex: 2,
  explanation: 'Because.',
  formula: 'W = R × T',
  steps: ['One.', 'Two.'],
  concept: 'Rates add.',
  tip: 'Use LCM.',
  wrongReasons: ['a', 'b', '', 'd'],
};
const quiet = { warn() {}, error() {} };

test('Gemini: falls back to the next model when overloaded; drops invalid questions', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return calls.length === 1 ? fail(503) : ok([goodQ, { ...goodQ, options: ['1', '1', '2', '3'] }]);
  };
  const gen = new GeminiQuestionGenerator(
    { geminiApiKey: 'k', geminiModels: ['m1', 'm2'], timeoutMs: 1000 },
    fetchImpl,
    quiet,
  );
  const r = await gen.generate(request);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /models\/m2:generateContent/);
  assert.equal(r.model, 'm2');
  assert.equal(r.questions.length, 1);
  assert.equal(r.questions[0].formula, 'W = R × T');
  assert.deepEqual(r.questions[0].wrongReasons, ['a', 'b', null, 'd']);
  assert.equal(r.isPreview, false);
});

test('Gemini: bad key is not retried; busy everywhere falls back to samples', async () => {
  const badKey = new GeminiQuestionGenerator(
    { geminiApiKey: 'k', geminiModels: ['m1', 'm2'], timeoutMs: 1000 },
    async () => fail(403),
    quiet,
  );
  await assert.rejects(badKey.generate(request), (e) => e instanceof AiServiceError && !e.retryable);

  const busy = new GeminiQuestionGenerator(
    { geminiApiKey: 'k', geminiModels: ['m1'], timeoutMs: 1000 },
    async () => fail(503),
    quiet,
  );
  const r = await new FallbackGenerator(busy, new SampleQuestionGenerator(), quiet).generate(request);
  assert.equal(r.isPreview, true);
  assert.ok(r.questions.length > 0);
});

test('Gemini questions: quota exhausted (429) — one call, no model switch, no samples', async () => {
  const calls = [];
  const logs = [];
  const quotaBody = {
    error: {
      status: 'RESOURCE_EXHAUSTED',
      message: 'You exceeded your current quota',
      details: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ quotaMetric: 'generate_content_free_tier_requests', quotaId: 'PerDay' }] },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '120s' },
      ],
    },
  };
  const live = new GeminiQuestionGenerator(
    { geminiApiKey: 'k', geminiModels: ['m1', 'm2'], timeoutMs: 1000 },
    async (url) => {
      calls.push(url);
      return { ok: false, status: 429, json: async () => quotaBody };
    },
    { warn: (m) => logs.push(m), error: (m) => logs.push(m) },
  );
  const err = await new FallbackGenerator(live, new SampleQuestionGenerator(), quiet).generate(request).catch((e) => e);
  assert.ok(err instanceof AiServiceError && err.quotaExhausted, 'no sample questions served');
  assert.equal(calls.length, 1, 'no retry, no next model');
  assert.equal(err.retryAfterSeconds, 120);
  assert.equal(err.quota.model, 'm1');
  assert.ok(logs.some((m) => m.includes('quota exhausted') && m.includes('generate_content_free_tier_requests')));
});

// ── Question bank + Free / Pro limits (strict app, fake AI) ─────────────────

const strict = (method, path, body, token) => call(method, path, body, token, strictBase);
const reg = async (mobile) =>
  (await strict('POST', '/auth/register', { name: `Student ${mobile}`, mobile, password: 'password123', targetExamId: 'ssc_cgl' })).body.token;
const gen = (token, body = {}) =>
  strict('POST', '/questions/generate', { examId: 'ssc_cgl', topicIds: ['quant.percentage'], difficulty: 'hard', count: 5, ...body }, token);

test('bank source: stored questions only — never AI; repeats allowed; 409 when too few', async () => {
  const a = await reg('8000000001');
  const b = await reg('8000000002');
  const before = fakeAi.calls;

  // A generates with AI → 5 questions enter the shared bank.
  const first = await gen(a, { source: 'ai' });
  assert.equal(first.status, 201);
  assert.equal(first.body.isPreview, false);
  assert.equal(first.body.questionSource, 'ai');
  assert.equal(fakeAi.calls, before + 1);
  assert.equal(await db.questionBank.countDocuments({ topicId: 'quant.percentage', difficulty: 'hard' }), 5);

  // B practises from the bank: same questions, no AI call, no answers leak.
  const avail = await strict('GET', '/questions/bank/availability?examId=ssc_cgl&topicIds=quant.percentage&difficulty=hard', undefined, b);
  assert.deepEqual(avail.body, { available: 5, unseen: 5 });
  const forB = await gen(b);
  assert.equal(forB.status, 201);
  assert.equal(forB.body.questionSource, 'bank');
  assert.equal(fakeAi.calls, before + 1);
  assert.deepEqual(forB.body.questions.map((q) => q.question).sort(), first.body.questions.map((q) => q.question).sort());
  assert.equal(forB.body.questions[0].correctIndex, undefined);

  // A has seen all 5: the bank still serves them (repeats), never AI.
  const againA = await gen(a);
  assert.equal(againA.status, 201);
  assert.equal(fakeAi.calls, before + 1);

  // Asking for more than the bank holds: refused up front, nothing counted.
  const c = await reg('8000000008');
  const tooMany = await gen(c, { count: 6 });
  assert.equal(tooMany.status, 409);
  assert.equal(tooMany.body.code, 'BANK_INSUFFICIENT');
  assert.equal(tooMany.body.details.available, 5);
  assert.equal(tooMany.body.details.requested, 6);
  assert.equal(tooMany.body.details.aiAvailableNow, true, 'offers the permitted alternative');
  assert.equal(fakeAi.calls, before + 1, 'no silent AI top-up');
  assert.equal((await strict('GET', '/subscription', undefined, c)).body.usageToday.sets, 0);
});

test('free: 2 sets/day in total, at most 1 of them AI', async () => {
  // 1 bank + 1 AI = allowed; a third set = DAILY_SETS.
  const t = await reg('8000000003');
  assert.equal((await gen(t)).status, 201);
  assert.equal((await gen(t, { source: 'ai' })).status, 201);
  const third = await gen(t);
  assert.equal(third.status, 403);
  assert.equal(third.body.code, 'DAILY_SETS');
  assert.equal(third.body.details.max, 2);
  assert.ok(Date.parse(third.body.details.resetsAt) > Date.now());
  const status = (await strict('GET', '/subscription', undefined, t)).body;
  assert.equal(status.tier, 'free');
  assert.deepEqual(status.usageToday, { sets: 2, aiSets: 1, questions: 10 });
  assert.deepEqual(status.remainingToday, { sets: 0, aiSets: 0, questions: null });
  assert.equal(status.limits.aiSetsPerDay, 1);
  assert.equal(status.limits.customCount, false);

  // 2 AI sets = not allowed (the second is refused, the first still counts).
  const u = await reg('8000000009');
  assert.equal((await gen(u, { source: 'ai' })).status, 201);
  const secondAi = await gen(u, { source: 'ai' });
  assert.equal(secondAi.status, 403);
  assert.equal(secondAi.body.code, 'DAILY_AI_SETS');
  // …but a bank set is still allowed (2 in total).
  assert.equal((await gen(u)).status, 201);

  // 2 bank sets = allowed.
  const v = await reg('8000000010');
  assert.equal((await gen(v)).status, 201);
  assert.equal((await gen(v)).status, 201);
  assert.equal((await gen(v)).body.code, 'DAILY_SETS');
});

test('free: set size limit; legacy `fresh` = AI source; nothing counted when refused', async () => {
  const t = await reg('8000000004');
  for (const count of [5, 10]) {
    const ok = await gen(t, { count: Math.min(count, 5) });
    assert.equal(ok.status, 201);
  }
  const big = await gen(t, { count: 20 });
  assert.equal(big.status, 403);
  assert.equal(big.body.code, 'SET_SIZE');
  assert.equal(big.body.details.max, 10);
  assert.equal((await strict('GET', '/subscription', undefined, t)).body.usageToday.sets, 2);

  const w = await reg('8000000011');
  const legacy = await gen(w, { fresh: true });
  assert.equal(legacy.status, 201);
  assert.equal(legacy.body.questionSource, 'ai');
});

test('a plan without AI credits: AI_NOT_IN_PLAN, no usage', async () => {
  const subs = new SubscriptionService(db, plans({ aiSetsPerDay: 0 }));
  const u = await db.users.findOne({ mobile: '8000000011' });
  await assert.rejects(subs.reserveGeneration(u, { count: 5, source: 'ai' }), (e) => e.code === 'AI_NOT_IN_PLAN');
});

test('duplicate taps: same requestKey → one set, counted once', async () => {
  const t = await reg('8000000012');
  const body = { source: 'ai', requestKey: 'dup-key-0001' };
  const [x, y] = await Promise.all([gen(t, body), gen(t, body)]);
  assert.equal(x.status, 201);
  assert.equal(y.status, 201);
  assert.equal(x.body.sessionId, y.body.sessionId);
  const usage = (await strict('GET', '/subscription', undefined, t)).body.usageToday;
  assert.equal(usage.sets, 1);
  assert.equal(usage.aiSets, 1);
});

test('a failed AI call gives the quota back (set and AI credit)', async () => {
  const t = await reg('8000000005');
  fakeAi.failNext = true;
  const r = await gen(t, { source: 'ai', topicIds: ['quant.ratio_proportion'] });
  assert.equal(r.status, 503);
  const usage = (await strict('GET', '/subscription', undefined, t)).body.usageToday;
  assert.equal(usage.sets, 0);
  assert.equal(usage.aiSets, 0);
});

test('trial / Pro: up to 40 questions, no 2-set cap, AI sets without a separate cap', async () => {
  const t = await reg('8000000006');
  const s0 = (await strict('GET', '/subscription', undefined, t)).body;
  assert.equal(s0.trialAvailable, true);
  assert.equal(s0.limits.maxQuestionsPerSet, 10);

  const s1 = (await strict('POST', '/subscription/trial', undefined, t)).body;
  assert.equal(s1.tier, 'pro');
  assert.equal(s1.source, 'trial');
  assert.equal(s1.trialAvailable, false);
  assert.equal(s1.limits.maxQuestionsPerSet, 40);
  assert.equal(s1.limits.customCount, true);
  assert.equal(s1.limits.aiSetsPerDay, null);
  const days = (Date.parse(s1.expiresAt) - Date.now()) / 86_400_000;
  assert.ok(days > 6.9 && days <= 7);
  assert.equal((await strict('POST', '/subscription/trial', undefined, t)).status, 409);

  for (const count of [10, 20, 30, 40]) {
    assert.equal((await gen(t, { source: 'ai', count })).status, 201, `${count} questions`);
  }
  assert.equal((await gen(t, { source: 'ai', count: 41 })).status, 400);
  const usage = (await strict('GET', '/subscription', undefined, t)).body;
  assert.equal(usage.usageToday.questions, 100);
  assert.equal(usage.remainingToday.questions, 200);
  assert.equal(usage.remainingToday.sets, null);
});

test('Pro fair use: 300 questions/day → DAILY_QUESTIONS', async () => {
  const subs = new SubscriptionService(db, plans());
  const u = { _id: 'fair-use-user', plan: { tier: 'pro', expiresAt: new Date(Date.now() + 86_400_000) } };
  for (let i = 0; i < 7; i++) await subs.reserveGeneration(u, { count: 40, source: 'ai' });
  await assert.rejects(subs.reserveGeneration(u, { count: 40, source: 'bank' }), (e) => e.code === 'DAILY_QUESTIONS');
  await subs.reserveGeneration(u, { count: 20, source: 'bank' }); // exactly 300
});

test('expired Pro: Free limits apply immediately', async () => {
  let now = new Date();
  const subs = new SubscriptionService(db, plans(), () => now);
  const u = { _id: 'expiring-user', plan: { tier: 'pro', expiresAt: new Date(now.getTime() + 1000) } };
  await subs.reserveGeneration(u, { count: 30, source: 'ai' });
  now = new Date(now.getTime() + 2000);
  await assert.rejects(subs.reserveGeneration(u, { count: 30, source: 'bank' }), (e) => e.code === 'SET_SIZE');
  const st = await subs.status(u);
  assert.equal(st.tier, 'free');
  assert.equal(st.limits.maxQuestionsPerSet, 10);
});

test('daily limits reset at the student\'s local midnight; tz changes are rate-limited', async () => {
  // 2026-11-21 20:00 UTC = 22 Nov 01:30 in India, but still 21 Nov in New York.
  const now = new Date('2026-11-21T20:00:00Z');
  const subs = new SubscriptionService(db, plans(), () => now);
  const india = { _id: 'tz-india' };
  const ny = { _id: 'tz-ny', tzOffsetMinutes: -300 };
  assert.match((await subs.reserveGeneration(india, { count: 5, source: 'bank' }))._id, /2026-11-22$/);
  assert.match((await subs.reserveGeneration(ny, { count: 5, source: 'bank' }))._id, /2026-11-21$/);
  assert.equal(await subs.resetsAt(ny), '2026-11-22T05:00:00.000Z');

  // PATCH /auth/me stores the offset; a second change within 24 h is ignored.
  const t = await reg('8000000013');
  const set1 = await strict('PATCH', '/auth/me', { tzOffsetMinutes: -300 }, t);
  assert.equal(set1.status, 200);
  assert.equal((await strict('GET', '/subscription', undefined, t)).body.tzOffsetMinutes, -300);
  await strict('PATCH', '/auth/me', { tzOffsetMinutes: 840 }, t);
  assert.equal((await strict('GET', '/subscription', undefined, t)).body.tzOffsetMinutes, -300);
  assert.equal((await strict('PATCH', '/auth/me', { tzOffsetMinutes: 5000 }, t)).status, 400);
});

test('Last Practice config is stored on the account and restored', async () => {
  const t = await reg('8000000014');
  assert.deepEqual((await strict('GET', '/practice/last-config?examId=ssc_cgl', undefined, t)).body, { config: null });
  assert.equal((await gen(t, { difficulty: 'hard', count: 5, language: 'en' })).status, 201);
  const { config: cfg } = (await strict('GET', '/practice/last-config?examId=ssc_cgl', undefined, t)).body;
  assert.equal(cfg.examId, 'ssc_cgl');
  assert.deepEqual(cfg.topicIds, ['quant.percentage']);
  assert.deepEqual(cfg.subjectIds, ['quant']);
  assert.equal(cfg.difficulty, 'hard');
  assert.equal(cfg.count, 5);
  assert.equal(cfg.language, 'en');
  assert.equal(cfg.source, 'bank');
  assert.equal(cfg.mode, 'topics');
  // Latest across exams when no exam is given.
  assert.equal((await strict('GET', '/practice/last-config', undefined, t)).body.config.examId, 'ssc_cgl');
  // A refused set does not overwrite it.
  assert.equal((await gen(t, { count: 20 })).status, 403);
  assert.equal((await strict('GET', '/practice/last-config?examId=ssc_cgl', undefined, t)).body.config.count, 5);
});

test('quick practice: mixed set across the exam syllabus, no topics needed', async () => {
  const t = await reg('8000000015');
  const r = await gen(t, { mode: 'quick', topicIds: [], source: 'ai', count: 8, difficulty: 'medium' });
  assert.equal(r.status, 201);
  assert.equal(r.body.questions.length, 8);
  const subjects = new Set(examSubjects.ssc_cgl.map((s) => s.name));
  assert.ok(r.body.subjects.length >= 2, 'mixes subjects');
  assert.ok(r.body.subjects.every((s) => subjects.has(s)));
  assert.equal((await gen(t, { mode: 'topics', topicIds: [] })).status, 400);
});

test('free: saved practice cap; re-saving the same result is still allowed', async () => {
  const t = await reg('8000000007');
  const s1 = (await gen(t)).body;
  const s2 = (await gen(t)).body;
  const r1 = (await strict('POST', `/practice/${s1.sessionId}/submit`, { answers: {}, timeTakenSeconds: 1 }, t)).body;
  const r2 = (await strict('POST', `/practice/${s2.sessionId}/submit`, { answers: {}, timeTakenSeconds: 1 }, t)).body;
  assert.equal((await strict('POST', '/practice/saved', { resultId: r1.resultId }, t)).status, 201);
  assert.equal((await strict('POST', '/practice/saved', { resultId: r1.resultId }, t)).status, 201);
  const blocked = await strict('POST', '/practice/saved', { resultId: r2.resultId }, t);
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.code, 'SAVED_LIMIT');
});

test('grantPro extends from the current expiry; expired Pro falls back to Free', async () => {
  let now = new Date('2026-11-21T10:00:00Z');
  const subs = new SubscriptionService(db, strictConfig.plans, () => now);
  const u = await db.users.findOne({ mobile: '8000000001' });
  await subs.grantPro(u._id, 30);
  const once = await db.users.findOne({ _id: u._id });
  await subs.grantPro(u._id, 30);
  const twice = await db.users.findOne({ _id: u._id });
  assert.equal(twice.plan.expiresAt - once.plan.expiresAt, 30 * 86_400_000);
  assert.equal(subs.isPro(twice), true);
  now = new Date(twice.plan.expiresAt.getTime() + 1000);
  assert.equal(subs.isPro(twice), false);
});

test('IST day boundaries and fingerprints', () => {
  assert.equal(istDate(new Date('2026-11-21T18:29:00Z')), '2026-11-21'); // 23:59 IST
  assert.equal(istDate(new Date('2026-11-21T18:31:00Z')), '2026-11-22'); // 00:01 IST
  assert.equal(nextIstMidnight(new Date('2026-11-21T10:00:00Z')).toISOString(), '2026-11-21T18:30:00.000Z');
  const q = { question: '  What is 2+2? ', options: ['4', '3', '5', '6'] };
  assert.equal(fingerprint('en', q), fingerprint('en', { question: 'what is 2+2?', options: ['6', '5', '4', '3'] }));
  assert.notEqual(fingerprint('en', q), fingerprint('hi', q));
});

test('topic stats aggregate across results', async () => {
  const r = await call('GET', '/practice/topic-stats', undefined, token);
  assert.equal(r.status, 200);
  const tw = r.body.topics.find((t) => t.topicId === 'quant.time_work');
  assert.ok(tw);
  assert.ok(tw.total >= tw.correct && tw.total > 0);
  assert.equal(tw.topicName, 'Time & Work');
});

// ── AI Study Notes ──────────────────────────────────────────────────────────

test('notes: generate validates, saves automatically, never overwrites', async () => {
  const topicId = examSubjects.rrb_ntpc[0].topics[0].id;
  const req = { examId: 'rrb_ntpc', topicId, language: 'en', level: 'exam', sections: ['explanation', 'mcqs', 'graphs'] };

  const unauth = await call('POST', '/notes/generate', req);
  assert.equal(unauth.status, 401);
  const badTopic = await call('POST', '/notes/generate', { ...req, topicId: 'nope.x' }, token);
  assert.equal(badTopic.status, 400);

  const a = await call('POST', '/notes/generate', { ...req, requestKey: 'notes-key-0001' }, token);
  assert.equal(a.status, 201);
  assert.equal(a.body.category, 'railway');
  assert.equal(a.body.topicId, topicId);
  assert.equal(a.body.contentVersion, 1);
  assert.equal(a.body.generationModel, 'fake-notes');
  assert.equal(a.body.content.mcqs.length, 1, 'broken MCQ dropped');
  assert.equal(a.body.content.graphs.length, 0, 'one-point graph dropped');
  assert.deepEqual(a.body.content.tips, [], 'unrequested section dropped');

  // Retry with the same key → same note, no second AI call.
  const calls = fakeNotes.calls;
  const again = await call('POST', '/notes/generate', { ...req, requestKey: 'notes-key-0001' }, token);
  assert.equal(again.body.id, a.body.id);
  assert.equal(fakeNotes.calls, calls);

  // Same topic again → a new note; the first is untouched.
  const b = await call('POST', '/notes/generate', req, token);
  assert.notEqual(b.body.id, a.body.id);
  assert.equal((await call('GET', `/notes/${a.body.id}`, undefined, token)).status, 200);

  // Failure → error, nothing saved.
  const before = (await call('GET', '/notes?category=railway', undefined, token)).body.total;
  fakeNotes.fail = true;
  const failed = await call('POST', '/notes/generate', req, token);
  fakeNotes.fail = false;
  assert.equal(failed.status, 502);
  assert.equal((await call('GET', '/notes?category=railway', undefined, token)).body.total, before);
});

test('notes: list per category, search, bookmark, personal note, delete, ownership', async () => {
  const list = await call('GET', '/notes?category=railway', undefined, token);
  assert.equal(list.status, 200);
  assert.ok(list.body.items.length >= 2);
  assert.equal(list.body.items[0].content, undefined, 'list omits content');
  assert.equal((await call('GET', '/notes?category=banking', undefined, token)).body.total, 0);
  assert.equal((await call('GET', '/notes', undefined, token)).status, 400, 'category required');

  const id = list.body.items[0].id;
  const p = await call('PATCH', `/notes/${id}`, { bookmarked: true, personalNote: 'remember the shortcut' }, token);
  assert.equal(p.status, 200);
  assert.equal(p.body.bookmarked, true);
  const marked = await call('GET', '/notes?category=railway&bookmarked=true', undefined, token);
  assert.deepEqual(marked.body.items.map((n) => n.id), [id]);
  const found = await call('GET', '/notes?category=railway&q=shortcut', undefined, token);
  assert.deepEqual(found.body.items.map((n) => n.id), [id]);

  // Another student can't see, change or delete it.
  const other = await call('POST', '/auth/register', { ...student, mobile: '9123456780', email: 'other.notes@example.com' });
  const t2 = other.body.token;
  await db.users.updateOne({ mobile: '9123456780' }, { $set: { role: 'admin' } }); // previews drafts later
  assert.equal((await call('GET', `/notes/${id}`, undefined, t2)).status, 404);
  assert.equal((await call('PATCH', `/notes/${id}`, { bookmarked: false }, t2)).status, 404);
  assert.equal((await call('DELETE', `/notes/${id}`, undefined, t2)).status, 404);

  assert.equal((await call('DELETE', `/notes/${id}`, undefined, token)).status, 204);
  assert.equal((await call('GET', `/notes/${id}`, undefined, token)).status, 404);
});

test('notes: content validation and no-key generator', async () => {
  assert.throws(() => validateNoteContent({ overview: '' }), GenerationError);
  assert.throws(() => validateNoteContent({ overview: 'x' }), GenerationError);
  const c = validateNoteContent(
    {
      overview: 'x',
      tables: [{ title: 't', headers: ['a', 'b'], rows: [['1', '2'], ['only one']] }],
      graphs: [{ title: 'g', points: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 'bad', y: 1 }] }],
    },
    ['formulas', 'graphs'],
  );
  assert.equal(c.tables[0].rows.length, 1);
  assert.deepEqual(c.graphs[0].points.map((p) => p.x), [1, 2]);
  await assert.rejects(new UnavailableNotesGenerator().generate(), AiServiceError);
});

test('notes and question generation have separate hourly limits', async () => {
  const cfg = { ...config, ai: { ...config.ai, generationsPerHour: 1, notesPerHour: 1 } };
  const [s, root] = await listen(createApp(services(cfg, new SampleQuestionGenerator())));
  try {
    const reg = await call('POST', '/auth/register', { ...student, mobile: '9000011111', email: 'limits@example.com' }, undefined, root);
    const t = reg.body.token;
    const topicId = examSubjects.rrb_ntpc[0].topics[0].id;
    const q = { examId: 'rrb_ntpc', topicIds: [topicId], difficulty: 'easy', count: 5, source: 'ai' };
    const n = { examId: 'rrb_ntpc', topicId, sections: ['explanation'] };

    assert.equal((await call('POST', '/questions/generate', q, t, root)).status, 201);
    assert.equal((await call('POST', '/questions/generate', q, t, root)).status, 429);
    // Questions limit used up — notes still allowed (own counter).
    assert.equal((await call('POST', '/notes/generate', n, t, root)).status, 201);
    assert.equal((await call('POST', '/notes/generate', n, t, root)).status, 429);
  } finally {
    s.close();
  }
});

test('notes: summary and facets are per student and per category', async () => {
  const topics = examSubjects.ssc_cgl.flatMap((s) => s.topics);
  for (const [topicId, language] of [[topics[0].id, 'en'], [topics[1].id, 'hi']]) {
    const r = await call('POST', '/notes/generate', { examId: 'ssc_cgl', topicId, language, sections: ['explanation'] }, token);
    assert.equal(r.status, 201);
  }
  const sum = await call('GET', '/notes/summary', undefined, token);
  assert.equal(sum.status, 200);
  const ssc = sum.body.categories.find((c) => c.category === 'ssc');
  assert.equal(ssc.notes, 2);
  assert.equal(sum.body.total, sum.body.categories.reduce((n, c) => n + c.notes, 0));

  const f = await call('GET', '/notes/facets?category=ssc', undefined, token);
  assert.deepEqual(f.body.exams.map((e) => e.id), ['ssc_cgl']);
  assert.equal(f.body.topics.length, 2);
  assert.ok(f.body.topics.every((t) => t.subjectId && t.examIds.includes('ssc_cgl')));
  // Railway facets never include SSC exams.
  const rf = await call('GET', '/notes/facets?category=railway', undefined, token);
  assert.ok(rf.body.exams.every((e) => e.id !== 'ssc_cgl'));
  // Filters: language + level + topic.
  const hi = await call('GET', '/notes?category=ssc&language=hi&level=exam', undefined, token);
  assert.equal(hi.body.total, 1);
  const byTopic = await call('GET', `/notes?category=ssc&topicId=${encodeURIComponent(topics[0].id)}`, undefined, token);
  assert.equal(byTopic.body.total, 1);

  // Another student sees none of it.
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  const os = await call('GET', '/notes/summary', undefined, other.body.token);
  assert.equal(os.body.total, 0);
  assert.equal((await call('GET', '/notes/facets?category=ssc', undefined, other.body.token)).body.exams.length, 0);
});

test('notes: hasPersonalNote filter', async () => {
  const topicId = examSubjects.rrb_ntpc[0].topics[1].id;
  const n = await call('POST', '/notes/generate', { examId: 'rrb_ntpc', topicId, sections: ['explanation'] }, token);
  await call('PATCH', `/notes/${n.body.id}`, { personalNote: 'my own words' }, token);
  const r = await call('GET', '/notes?category=railway&hasPersonalNote=true', undefined, token);
  assert.ok(r.body.items.some((x) => x.id === n.body.id));
  assert.ok(r.body.items.every((x) => x.personalNote));
});

test('library: practice history lists attempts, owner only', async () => {
  const topicId = examSubjects.rrb_ntpc[0].topics[0].id;
  const s = await call('POST', '/questions/generate', { examId: 'rrb_ntpc', topicIds: [topicId], difficulty: 'easy', count: 3, source: 'ai' }, token);
  assert.equal(s.status, 201);
  const answers = s.body.questions.map((q) => ({ questionId: q.id, selectedIndex: 0 }));
  for (let i = 0; i < 2; i++) {
    const session = i === 0 ? s.body : (await call('POST', `/library/sets/${s.body.setId}/start`, {}, token)).body;
    const sub = await call('POST', `/practice/${session.sessionId}/submit`, { answers: Object.fromEntries(session.questions.map((q) => [q.id, 0])), timeTakenSeconds: 30 }, token);
    assert.equal(sub.status, 200, JSON.stringify(sub.body));
  }
  void answers;
  const h = await call('GET', `/library/sets/${s.body.setId}/attempts`, undefined, token);
  assert.equal(h.status, 200);
  assert.equal(h.body.items.length, 2);
  assert.ok(h.body.items[0].resultId);
  assert.equal(h.body.items[0].answers, undefined, 'history carries no answers');
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  assert.equal((await call('GET', `/library/sets/${s.body.setId}/attempts`, undefined, other.body.token)).status, 404);
});

// ── Learning path ───────────────────────────────────────────────────────────

test('learning path: units for broad topics, syllabus-based next topics', async () => {
  const p = await call('GET', '/learning-path/ibps_so_it/professional_it', undefined, token);
  assert.equal(p.status, 200);
  assert.equal(p.body.category, 'banking');
  const ids = p.body.items.map((i) => i.id);
  // Data Structures is split into ordered units; no duplicate items.
  assert.ok(ids.includes('professional_it.data_structures.linked_lists'));
  assert.ok(!ids.includes('professional_it.data_structures'));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(p.body.completed, 0);
  assert.equal(p.body.currentId, ids[0]);
  assert.equal(p.body.items[0].status, 'current');
  assert.equal(p.body.items[1].status, 'upcoming');

  // Notes for a unit: next topics are the following real path items.
  const unitId = 'professional_it.data_structures.stacks_queues';
  const n = await call('POST', '/notes/generate', { examId: 'ibps_so_it', topicId: unitId, sections: ['explanation'] }, token);
  assert.equal(n.status, 201);
  assert.equal(n.body.topicName, 'Data Structures: Stacks & Queues');
  assert.equal(n.body.parentTopicId, 'professional_it.data_structures');
  assert.equal(n.body.unitName, 'Stacks & Queues');
  const at = ids.indexOf(unitId);
  assert.deepEqual(n.body.content.nextTopics.map((t) => t.id), ids.slice(at + 1, at + 4));
  assert.ok(n.body.content.nextTopics.every((t) => t.name));

  // A whole broad topic is still allowed; its next topic is after its last unit.
  const whole = await call('POST', '/notes/generate', { examId: 'ibps_so_it', topicId: 'professional_it.data_structures', sections: ['explanation'] }, token);
  assert.equal(whole.status, 201);
  assert.equal(whole.body.content.nextTopics[0].id, ids[ids.findLastIndex((i) => i.startsWith('professional_it.data_structures.')) + 1]);

  // Unknown unit / topic from another subject are rejected.
  assert.equal((await call('POST', '/notes/generate', { examId: 'ibps_so_it', topicId: 'professional_it.data_structures.nope', sections: ['explanation'] }, token)).status, 400);
  assert.equal((await call('GET', '/learning-path/ibps_so_it/nope', undefined, token)).status, 404);
  assert.equal((await call('GET', '/learning-path/rrb_ntpc/professional_it', undefined, token)).status, 404);

  // Path shows the note on its item.
  const p2 = await call('GET', '/learning-path/ibps_so_it/professional_it', undefined, token);
  const item = p2.body.items.find((i) => i.id === unitId);
  assert.equal(item.latestNoteId, n.body.id);
  assert.equal(item.notesCount, 1);
});

test('learning path: completion progress per student, restored on return', async () => {
  // Reasoning has no curated outline, so items complete directly.
  const base = '/learning-path/ibps_po';
  const first = (await call('GET', `${base}/reasoning`, undefined, token)).body.items;
  const [a, b] = [first[0].id, first[1].id];

  const r1 = await call('PUT', `${base}/items/${a}`, { completed: true }, token);
  assert.equal(r1.status, 200);
  assert.equal(r1.body.completed, 1);
  assert.equal(r1.body.items[0].status, 'completed');
  assert.equal(r1.body.currentId, b);
  // Idempotent.
  assert.equal((await call('PUT', `${base}/items/${a}`, { completed: true }, token)).body.completed, 1);

  // Restored on a fresh read.
  const again = await call('GET', `${base}/reasoning`, undefined, token);
  assert.equal(again.body.completed, 1);
  assert.ok(again.body.items[0].completedAt);

  // Another student has their own progress and cannot change mine.
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  const theirs = await call('GET', `${base}/reasoning`, undefined, other.body.token);
  assert.equal(theirs.body.completed, 0);
  assert.equal(theirs.body.items[0].latestNoteId, null, 'never sees my notes');

  // Un-complete; invalid items rejected.
  assert.equal((await call('PUT', `${base}/items/${a}`, { completed: false }, token)).body.completed, 0);
  assert.equal((await call('PUT', '/learning-path/ibps_so_it/items/professional_it.data_structures', { completed: true }, token)).status, 404, 'broad topic is not a path item');
  assert.equal((await call('PUT', `${base}/items/quant.nope`, { completed: true }, token)).status, 404);
  assert.equal((await call('PUT', `${base}/items/${a}`, { completed: 'yes' }, token)).status, 400);
  assert.equal((await call('PUT', `${base}/items/${a}`, { completed: true })).status, 401);
});

// ── Gemini client policy ────────────────────────────────────────────────────

function fakeGemini(script) {
  const seen = [];
  const fetchImpl = async (url) => {
    const model = url.split('/models/')[1].split(':')[0];
    seen.push(model);
    const step = script.shift();
    if (step === 'timeout') {
      const e = new Error('aborted');
      e.name = 'AbortError';
      throw e;
    }
    const [status, body] = step;
    return { ok: status === 200, status, json: async () => body };
  };
  return { fetchImpl, seen };
}
const okResp = (obj, finishReason = 'STOP') => [200, { candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(obj) }] } }] }];

test('gemini client: one retry for transient errors, then fallback; logged', async () => {
  const logs = [];
  const log = { warn: (m) => logs.push(m), error: (m) => logs.push(m) };
  const { fetchImpl, seen } = fakeGemini([[503, { error: { status: 'UNAVAILABLE' } }], [503, {}], okResp({ a: 1 })]);
  const c = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl, log, sleep: async () => {} });
  const r = await c.generate({ models: ['primary', 'backup'], label: 't', systemPrompt: '', prompt: '', schema: {} });
  assert.deepEqual(seen, ['primary', 'primary', 'backup']);
  assert.equal(r.model, 'backup');
  assert.equal(r.fallbackFrom, 'primary');
  assert.ok(logs.some((m) => m.includes('primary attempt 1') && m.includes('503')));
  assert.ok(logs.some((m) => m.includes('fallback result: backup (instead of primary) succeeded')));
});

test('gemini client: permanent errors are not retried; 404 skips to next model', async () => {
  const bad = fakeGemini([[401, { error: { status: 'UNAUTHENTICATED' } }], okResp({})]);
  const c1 = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: bad.fetchImpl, log: quiet, sleep: async () => {} });
  await assert.rejects(c1.generate({ models: ['a', 'b'], label: 't', systemPrompt: '', prompt: '', schema: {} }), AiServiceError);
  assert.deepEqual(bad.seen, ['a'], 'no retry, no fallback on a bad key');

  const missing = fakeGemini([[404, { error: { status: 'NOT_FOUND' } }], okResp({ x: 1 })]);
  const c2 = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: missing.fetchImpl, log: quiet, sleep: async () => {} });
  const r = await c2.generate({ models: ['gone', 'b'], label: 't', systemPrompt: '', prompt: '', schema: {} });
  assert.deepEqual(missing.seen, ['gone', 'b']);
  assert.equal(r.model, 'b');
});

test('gemini client: cut-off output is never used; timeout retried', async () => {
  const g = fakeGemini([okResp({ part: 1 }, 'MAX_TOKENS'), 'timeout']);
  const c = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: g.fetchImpl, log: quiet, sleep: async () => {} });
  await assert.rejects(c.generate({ models: ['m'], label: 't', systemPrompt: '', prompt: '', schema: {} }));
  assert.deepEqual(g.seen, ['m', 'm']);
});

test('section quality checks per mode', () => {
  assert.ok(checkSection(goodSection('complete'), 'complete').quality.passed);
  const thin = { ...goodSection('complete'), explanation: [{ heading: 'h', body: 'short' }], keyFacts: ['one'] };
  assert.throws(() => checkSection(thin, 'complete'), (e) => e.checks.keyFacts.ok === false && e.checks.words.ok === false);
  const noMcq = { ...goodSection('complete'), mcqs: [] };
  assert.throws(() => checkSection(noMcq, 'complete'), /mcqs 0\/6/);
  assert.ok(checkSection(noMcq, 'detailed').quality.passed, 'detailed mode needs no MCQs');
  assert.equal(QUALITY_RULES.complete.minMcqs, 6);
  // Server never trusts AI next-topic suggestions.
  assert.deepEqual(checkSection(goodSection('quick'), 'quick').content.nextTopics, []);
});

// ── Outline sections, shared cache, quota, progress ─────────────────────────

test('outline: sections, shared cache across students, quota counts only new AI', async () => {
  const unit = 'general_awareness.history.ancient';
  const base = `/notes/outlines/ssc_cgl/${unit}`;
  const o = await call('GET', `${base}?language=en&mode=complete`, undefined, token);
  assert.equal(o.status, 200);
  assert.equal(o.body.status, 'draft');
  assert.equal(o.body.total, (await import('../src/data/outlines/index.js')).findOutline(unit, { includeDrafts: true }).chapters.reduce((n, c) => n + c.sections.length, 0));
  assert.equal(o.body.coverageComplete, false);
  assert.deepEqual(o.body.continue, { chapterId: 'sources', sectionId: 'literary' });
  assert.equal((await call('GET', `/notes/outlines/ssc_cgl/quant.mensuration.circles`, undefined, token)).body.code, 'NO_OUTLINE');
  assert.equal((await call('GET', `/notes/outlines/ibps_po/${unit}`, undefined, token)).status, 404, 'not in Banking syllabus');

  const req = { examId: 'ssc_cgl', unitId: unit, chapterId: 'indus_valley', sectionId: 'major_sites', language: 'en', mode: 'complete' };
  const before = fakeSections.calls;
  const a = await call('POST', '/notes/sections/generate', req, token);
  assert.equal(a.status, 201);
  assert.equal(a.body.source, 'ai');
  assert.equal(a.body.kind, 'section');
  assert.equal(a.body.sectionTitle, 'Major sites: location, discoveries and unique features');
  assert.equal(a.body.learningMode, 'complete');
  assert.equal(a.body.sourceType, 'ai_generated');
  assert.equal(a.body.content.keyFacts.length, 12);
  assert.ok(a.body.content.nextTopics.every((t) => t.id), 'next topics from syllabus path');
  assert.equal(fakeSections.calls, before + 1);

  // Same student again → their saved copy, no AI.
  const again = await call('POST', '/notes/sections/generate', req, token);
  assert.equal(again.body.source, 'saved');
  assert.equal(again.body.id, a.body.id);

  // Another student → shared cache: own record, no AI call, no quota.
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  const t2 = other.body.token;
  const b = await call('POST', '/notes/sections/generate', req, t2);
  assert.equal(b.status, 201);
  assert.equal(b.body.source, 'cache');
  assert.notEqual(b.body.id, a.body.id, 'own study-note record');
  assert.equal(b.body.personalNote, '');
  assert.equal(fakeSections.calls, before + 1);

  // Hindi or another mode is a different cache entry.
  const hi = await call('POST', '/notes/sections/generate', { ...req, language: 'hi' }, t2);
  assert.equal(hi.body.source, 'ai');

  // Personal data stays private: my personal note is not in the other copy.
  await call('PATCH', `/notes/${a.body.id}`, { personalNote: 'mine', bookmarked: true }, token);
  const theirs = await call('GET', `/notes/${b.body.id}`, undefined, t2);
  assert.equal(theirs.body.personalNote, '');
  assert.equal(theirs.body.bookmarked, false);
  assert.equal((await call('GET', `/notes/${a.body.id}`, undefined, t2)).status, 404);

  // Regenerate → new AI version; previous version kept.
  const r = await call('POST', '/notes/sections/generate', { ...req, regenerate: true }, token);
  assert.equal(r.body.source, 'ai');
  assert.equal(r.body.sectionVersion, 2);
  assert.equal((await call('GET', `/notes/${a.body.id}`, undefined, token)).status, 200);
});

test('quota exhausted: 503 AI_QUOTA_EXHAUSTED, nothing saved, not counted', async () => {
  const unit = 'general_awareness.history.ancient';
  const req = { examId: 'ssc_cgl', unitId: unit, chapterId: 'vedic', sectionId: 'later_vedic', language: 'en', mode: 'quick' };
  const quotaBefore = await db.aiGenerationLog.countDocuments({});
  const notesBefore = await db.studyNotes.countDocuments({});
  fakeSections.failNext = Object.assign(new AiServiceError('HTTP 429 RESOURCE_EXHAUSTED', true), { quotaExhausted: true, retryAfterSeconds: 3600 });
  const r = await call('POST', '/notes/sections/generate', req, token);
  assert.equal(r.status, 503);
  assert.equal(r.body.code, 'AI_QUOTA_EXHAUSTED');
  assert.equal(r.body.details.retryAfterSeconds, 3600);
  assert.equal(await db.aiGenerationLog.countDocuments({}), quotaBefore, 'not counted');
  assert.equal(await db.studyNotes.countDocuments({}), notesBefore, 'nothing saved');
});

test('outline: failures are recorded, free, and retryable; progress and coverage', async () => {
  const unit = 'general_awareness.history.ancient';
  const req = { examId: 'ssc_cgl', unitId: unit, chapterId: 'vedic', sectionId: 'aryans', language: 'en', mode: 'complete' };
  const quotaBefore = await db.aiGenerationLog.countDocuments({});
  fakeSections.failNext = Object.assign(new GenerationError('The generated section was incomplete (words 10/1100).'), { transient: true });
  const f = await call('POST', '/notes/sections/generate', req, token);
  assert.equal(f.status, 502);
  assert.equal(await db.aiGenerationLog.countDocuments({}), quotaBefore, 'failure is not counted');
  let o = await call('GET', `/notes/outlines/ssc_cgl/${unit}?mode=complete`, undefined, token);
  const sec = o.body.chapters.find((c) => c.id === 'vedic').sections.find((s) => s.id === 'aryans');
  assert.equal(sec.state, 'failed');
  assert.match(sec.error, /incomplete/);

  // Retry succeeds → generated; failure cleared.
  assert.equal((await call('POST', '/notes/sections/generate', req, token)).status, 201);
  o = await call('GET', `/notes/outlines/ssc_cgl/${unit}?mode=complete`, undefined, token);
  assert.equal(o.body.chapters.find((c) => c.id === 'vedic').sections.find((s) => s.id === 'aryans').state, 'generated');

  // Cannot mark an ungenerated section complete.
  const notYet = await call('PUT', '/notes/sections/progress', { ...req, sectionId: 'early_vedic', completed: true }, token);
  assert.equal(notYet.status, 409);
  assert.equal(notYet.body.code, 'SECTION_NOT_GENERATED');

  const p = await call('PUT', '/notes/sections/progress', { ...req, completed: true }, token);
  assert.equal(p.status, 200);
  const vedic = p.body.chapters.find((c) => c.id === 'vedic');
  assert.equal(vedic.completed, 1);
  assert.equal(vedic.complete, false, 'chapter not complete until every section is');
  assert.equal(p.body.coverageComplete, false);

  // The unit cannot be marked complete on the learning path until all sections are.
  const unitDone = await call('PUT', `/learning-path/ssc_cgl/items/${unit}`, { completed: true }, token);
  assert.equal(unitDone.status, 409);
  assert.equal(unitDone.body.code, 'COVERAGE_INCOMPLETE');

  // Progress is per student.
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  const theirs = await call('GET', `/notes/outlines/ssc_cgl/${unit}?mode=complete`, undefined, other.body.token);
  assert.equal(theirs.body.completed, 0);
});

test('notes quota: only successful new generations count; cache is free', async () => {
  const cfg = { ...config, ai: { ...config.ai, notesPerHour: 1 } };
  const [srv, root] = await listen(createApp(services(cfg, new SampleQuestionGenerator())));
  try {
    const reg = await call('POST', '/auth/register', { ...student, mobile: '9000022222', email: 'quota@example.com' }, undefined, root);
    const t = reg.body.token;
    await db.users.updateOne({ mobile: '9000022222' }, { $set: { role: 'admin' } }); // draft outline preview
    const unit = 'general_awareness.history.ancient';
    const req = { examId: 'ssc_cgl', unitId: unit, chapterId: 'gupta', sectionId: 'samudragupta', language: 'en', mode: 'quick' };
    fakeSections.failNext = new GenerationError('bad');
    assert.equal((await call('POST', '/notes/sections/generate', req, t, root)).status, 502);
    assert.equal((await call('POST', '/notes/sections/generate', req, t, root)).status, 201, 'failure did not use the quota');
    const next = { ...req, sectionId: 'chandragupta_ii' };
    const blocked = await call('POST', '/notes/sections/generate', next, t, root);
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.code, 'NOTES_HOURLY');
    // A section already in the shared cache is still served when the quota is used up.
    const cached = await call('POST', '/notes/sections/generate', { ...req, chapterId: 'indus_valley', sectionId: 'major_sites', mode: 'complete' }, t, root);
    assert.equal(cached.status, 201);
    assert.equal(cached.body.source, 'cache');
  } finally {
    srv.close();
  }
});

test('section cache: invalidation stops serving; new revision created', async () => {
  const cache = new SectionCache(db);
  const key = SectionCache.key({ unitId: 'u', chapterId: 'c', sectionId: 's', language: 'en', mode: 'quick', outlineVersion: 1, promptVersion: 1 });
  const r1 = await cache.put(key, { content: { a: 1 }, quality: {}, model: 'm', unitId: 'u' });
  assert.equal(r1.rev, 1);
  const r2 = await cache.put(key, { content: { a: 2 }, quality: {}, model: 'm', unitId: 'u' });
  assert.equal((await cache.current(key)).rev, 2);
  assert.equal(await cache.invalidate({ unitId: 'u' }), 2);
  assert.equal(await cache.current(key), null);
  assert.ok(await db.sectionCache.findOne({ _id: r2._id }), 'kept, not deleted');
});

test('gemini client: quota exhausted (429) is logged, never retried, no model switch', async () => {
  const quota = [429, {
    error: {
      status: 'RESOURCE_EXHAUSTED',
      message: 'You exceeded your current quota',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
          violations: [{ quotaMetric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests', quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier', quotaValue: '250' }],
        },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '72364s' },
      ],
    },
  }];
  for (const delay of ['72364s', '3s']) {
    const body = structuredClone(quota[1]);
    body.error.details[1].retryDelay = delay;
    const g = fakeGemini([[429, body], okResp({ ok: 1 })]);
    const logs = [];
    const log = { warn: (m) => logs.push(m), error: (m) => logs.push(m) };
    const c = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: g.fetchImpl, log, sleep: async () => {} });
    const err = await c.generate({ models: ['primary', 'backup'], label: 't', systemPrompt: '', prompt: '', schema: {} }).catch((e) => e);
    assert.ok(err instanceof AiServiceError && err.quotaExhausted);
    assert.deepEqual(g.seen, ['primary'], `no retry, no fallback (retryDelay ${delay})`);
    assert.equal(err.retryAfterSeconds, Number.parseFloat(delay));
    assert.equal(err.quota.model, 'primary');
    assert.equal(err.quota.geminiStatus, 'RESOURCE_EXHAUSTED');
    assert.equal(err.quota.violations[0].id, 'GenerateRequestsPerDayPerProjectPerModel-FreeTier');
    assert.ok(logs.some((m) => m.includes('quota exhausted') && m.includes('generate_content_free_tier_requests')));
  }
});

test('draft outlines: map to real syllabus topics, unique ids, nothing published', async () => {
  const { OUTLINES, findOutline } = await import('../src/data/outlines/index.js');
  const { learningItems } = await import('../src/services/examService.js');
  // Every path item id of every exam/subject.
  const pathIds = new Set();
  for (const [examId, subjects] of Object.entries(examSubjects)) {
    for (const s of subjects) for (const i of learningItems(examId, s.id).items) pathIds.add(i.id);
  }
  for (const o of OUTLINES) {
    assert.equal(o.status, 'draft', `${o.title} must stay a draft until approved`);
    assert.equal(findOutline(o.unitId ?? o.chapters[0].topicId), null, 'drafts are hidden from students');
    const chapterIds = o.chapters.map((c) => c.id);
    assert.equal(new Set(chapterIds).size, chapterIds.length, `${o.title}: duplicate chapter id`);
    for (const c of o.chapters) {
      const target = c.topicId ?? o.unitId;
      assert.ok(pathIds.has(target), `${o.title} › ${c.title}: ${target} is not a syllabus learning item`);
      const ids = c.sections.map((x) => x.id);
      assert.equal(new Set(ids).size, ids.length, `${o.title} › ${c.title}: duplicate section id`);
      for (const x of c.sections) assert.ok(!x.origin || ['curated', 'recommended'].includes(x.origin));
    }
  }
  // Current affairs cannot be AI-generated.
  const r = await call('POST', '/notes/sections/generate', { examId: 'ibps_po', unitId: 'banking_awareness.current_affairs', chapterId: 'current_affairs', sectionId: 'national' }, token);
  assert.equal(r.status, 409);
  assert.equal(r.body.code, 'VERIFIED_SOURCE_REQUIRED');
  // A multi-topic outline shows only the chapters of the opened topic.
  const rbi = await call('GET', '/notes/outlines/ibps_po/banking_awareness.rbi_monetary_policy', undefined, token);
  assert.deepEqual(rbi.body.chapters.map((c) => c.id), ['rbi', 'monetary_policy', 'regulators']);
  // Not attached where the exam syllabus lacks the subject.
  assert.equal((await call('GET', '/notes/outlines/ibps_so_it/banking_awareness.rbi_monetary_policy', undefined, token)).status, 404);
});

// ── Phase A: universal syllabus tree ────────────────────────────────────────

test('tree: every exam builds a valid recursive tree; topic/unit ids unchanged', async () => {
  const { buildExamTree, validateTree, walkTree } = await import('../src/services/syllabusTree.js');
  const { learningItems } = await import('../src/services/examService.js');
  for (const c of examCatalog) {
    for (const e of c.exams) {
      for (const includeDrafts of [false, true]) {
        const tree = buildExamTree(e.id, { includeDrafts });
        assert.deepEqual(validateTree(tree), [], `${e.id} (drafts ${includeDrafts})`);
        assert.equal(tree.type, 'exam');
        assert.equal(tree.categoryId, c.id);
        // Subjects and topics are exactly the existing syllabus, in order.
        assert.deepEqual(tree.children.map((s) => s.id), examSubjects[e.id].map((s) => s.id));
        for (const [i, s] of tree.children.entries()) {
          assert.deepEqual(s.children.map((t) => t.id), examSubjects[e.id][i].topics.map((t) => t.id));
          // Path items (topics or units) keep their existing ids.
          const pathIds = learningItems(e.id, s.id).items.map((x) => x.id);
          const treeIds = [];
          walkTree(s, (n) => {
            if (n.type === 'unit' || (n.type === 'topic' && !n.children.some((k) => k.type === 'unit'))) treeIds.push(n.id);
          });
          assert.deepEqual(treeIds, pathIds, `${e.id}/${s.id}`);
        }
      }
    }
  }
});

test('tree: section ids equal the existing progress keys and open via the section API', async () => {
  const { buildExamTree, treeSections } = await import('../src/services/syllabusTree.js');
  const { findOutline, outlineSections } = await import('../src/data/outlines/index.js');
  const tree = buildExamTree('ssc_cgl', { subjectId: 'general_awareness', includeDrafts: true });
  const sections = treeSections(tree);
  const unit = 'general_awareness.history.ancient';
  const expected = outlineSections(findOutline(unit, { includeDrafts: true })).map(
    ({ chapter, section }) => `${unit}#${chapter.id}.${section.id}`,
  );
  assert.deepEqual(sections.filter((s) => s.ref.unitId === unit).map((s) => s.id), expected);
  const s = sections[0];
  assert.deepEqual(Object.keys(s.ref).sort(), ['chapterId', 'sectionId', 'unitId']);
});

test('tree: shared subjects/topics across exams, exam-specific structure', async () => {
  const { buildExamTree, examsSharing } = await import('../src/services/syllabusTree.js');
  const rrb = buildExamTree('rrb_ntpc').children.find((s) => s.id === 'quant');
  const ssc = buildExamTree('ssc_cgl').children.find((s) => s.id === 'quant');
  assert.equal(rrb.name, 'Mathematics');
  assert.equal(ssc.name, 'Quantitative Aptitude');
  assert.notDeepEqual(rrb.children.map((t) => t.id), ssc.children.map((t) => t.id));
  // The same topic node is shared, with its exam mapping.
  const pct = rrb.children.find((t) => t.id === 'quant.percentage');
  assert.ok(pct.exams.includes('rrb_ntpc') && pct.exams.includes('ssc_cgl'));
  assert.deepEqual(examsSharing('professional_it.dbms.sql'), ['ibps_so_it']);
});

test('recursive outlines: nested subtopics flatten to leaf sections; bad structure rejected', async () => {
  const { normalizeOutline, validateOutline } = await import('../src/data/outlines/index.js');
  const o = normalizeOutline({
    unitId: 'general_awareness.history.ancient',
    status: 'draft',
    version: 1,
    title: 'Fixture',
    chapters: [
      {
        id: 'mauryas',
        title: 'Mauryan Empire',
        sections: [
          { id: 'background', title: 'Background' },
          {
            id: 'ashoka',
            title: 'Ashoka',
            children: [
              { id: 'kalinga', title: 'Kalinga War' },
              { id: 'dhamma', title: 'Dhamma', children: [{ id: 'edicts', title: 'Edicts' }] },
            ],
          },
        ],
      },
    ],
  });
  const ch = o.chapters[0];
  assert.deepEqual(ch.sections.map((s) => s.id), ['background', 'ashoka.kalinga', 'ashoka.dhamma.edicts']);
  assert.deepEqual(ch.sections[2].path, ['Ashoka', 'Dhamma']);
  assert.equal(ch.children[1].type, 'subtopic');
  assert.equal(ch.children[1].children[1].children[0].id, 'ashoka.dhamma.edicts');

  const base = { unitId: 'x', status: 'draft', version: 1, title: 'Bad' };
  assert.throws(() => validateOutline({ ...base, chapters: [{ id: 'a', title: 'A', sections: [] }] }), /no sections/);
  assert.throws(
    () => validateOutline({ ...base, chapters: [{ id: 'a', title: 'A', sections: [{ id: 's', title: 'S' }, { id: 's', title: 'T' }] }] }),
    /duplicate section id/,
  );
  assert.throws(() => validateOutline({ ...base, chapters: [{ id: 'A-1', title: 'A', sections: [{ id: 's', title: 'S' }] }] }), /bad chapter id/);
  assert.throws(() => validateOutline({ ...base, status: 'published', chapters: [] }), /status/);
});

test('drafts: hidden from students everywhere; admins see them only in preview', async () => {
  const s = await call('POST', '/auth/register', { ...student, mobile: '9123456799', email: 'plain.student@example.com' });
  const st = s.body.token;
  const unit = 'general_awareness.history.ancient';

  // Student: no draft sections in the tree, no outline, no generation.
  const tree = await call('GET', '/syllabus/tree/ssc_cgl?subjectId=general_awareness', undefined, st);
  assert.equal(tree.status, 200);
  assert.equal(tree.body.children[0].stats.sections, 0);
  assert.equal(JSON.stringify(tree.body).includes('"draft"'), false);
  assert.equal((await call('GET', `/notes/outlines/ssc_cgl/${unit}`, undefined, st)).status, 404);
  const gen = await call('POST', '/notes/sections/generate', { examId: 'ssc_cgl', unitId: unit, chapterId: 'vedic', sectionId: 'aryans' }, st);
  assert.equal(gen.status, 404);
  const path = await call('GET', '/learning-path/ssc_cgl/general_awareness', undefined, st);
  assert.equal(path.body.items.find((i) => i.id === unit).hasOutline, false);

  // Admin: drafts appear (labelled) in preview.
  await db.users.updateOne({ mobile: '9123456799' }, { $set: { role: 'admin' } });
  const preview = await call('GET', '/syllabus/tree/ssc_cgl?subjectId=general_awareness&preview=1', undefined, st);
  const ancient = preview.body.children[0].children.find((t) => t.id === 'general_awareness.history').children.find((u) => u.id === unit);
  assert.equal(ancient.outlineStatus, 'draft');
  assert.ok(ancient.children.length > 0);
  assert.ok(ancient.children.every((c) => c.status === 'draft'));
});

test('tree API: content readiness and student progress are separate; next section', async () => {
  const unit = 'general_awareness.history.ancient';
  const base = '/syllabus/tree/ssc_cgl?subjectId=general_awareness&mode=complete&preview=1';
  const t = await call('GET', base, undefined, token);
  assert.equal(t.status, 200);
  const find = (root, id) => {
    let hit = null;
    const go = (n) => {
      if (n.id === id) hit = n;
      (n.children ?? []).forEach(go);
    };
    go(root);
    return hit;
  };
  // Earlier outline tests generated (cache) and completed vedic.aryans for this student.
  const aryans = find(t.body, `${unit}#vedic.aryans`);
  assert.equal(aryans.content, 'ready');
  assert.equal(aryans.progress, 'completed');
  const later = find(t.body, `${unit}#vedic.early_vedic`);
  assert.equal(later.progress, 'not_started');
  const unitNode = find(t.body, unit);
  assert.ok(unitNode.stats.sections > unitNode.stats.completed);
  assert.ok(unitNode.stats.ready >= 1);
  assert.ok(t.body.next);

  // Another student: same shared content readiness, own (empty) progress.
  const other = await call('POST', '/auth/login', { identifier: 'other.notes@example.com', password: student.password });
  const t2 = await call('GET', base, undefined, other.body.token);
  assert.equal(find(t2.body, `${unit}#vedic.aryans`).content, 'ready');
  assert.equal(find(t2.body, `${unit}#vedic.aryans`).progress, 'not_started');
  assert.equal((await call('GET', '/syllabus/tree/nope', undefined, token)).status, 404);
  assert.equal((await call('GET', '/syllabus/tree/ssc_cgl?subjectId=nope', undefined, token)).status, 404);
});

test('backward compatibility: outline response keeps the flat chapters[].sections[] shape', async () => {
  const o = await call('GET', '/notes/outlines/ssc_cgl/general_awareness.history.ancient?mode=complete', undefined, token);
  assert.equal(o.status, 200);
  const ch = o.body.chapters[0];
  // Every field released apps read is still there (new fields are additive).
  for (const k of ['complete', 'completed', 'generated', 'id', 'sections', 'title', 'total', 'weight']) assert.ok(k in ch, k);
  for (const k of ['cached', 'error', 'id', 'noteId', 'origin', 'state', 'title', 'versions']) assert.ok(k in ch.sections[0], k);
});

// ── Phase B: coverage manifests ─────────────────────────────────────────────

const ASHOKA = 'general_awareness.history.ancient#mauryan.ashoka.edicts';
const fc = (id, name, aliases = [], level = 'core') => ({ id, name, aliases, level });
/** Test fixture (not editorial data): one manifest covering all of Ashoka. */
const ASHOKA_MANIFEST = {
  version: 1,
  status: 'draft',
  sources: [],
  objectives: ['Describe the Kalinga War, Dhamma and the edicts'],
  concepts: [
    fc('ashoka', 'Ashoka'),
    fc('kalinga_war', 'Kalinga War', ['Kalinga']),
    fc('dhamma', 'Dhamma'),
    fc('dhamma_mahamattas', 'Dhamma Mahamattas', ['Dhamma Mahamatras'], 'detail'),
    fc('rock_edicts', 'Major Rock Edicts', ['Rock Edicts', 'Rock Edict']),
    fc('pillar_edicts', 'Pillar Edicts', ['Pillar Edict']),
    fc('minor_rock_edicts', 'Minor Rock Edicts', ['Minor Rock Edict'], 'detail'),
    fc('brahmi', 'Brahmi', ['Brahmi script']),
    fc('kharosthi', 'Kharosthi', [], 'detail'),
    fc('james_prinsep', 'James Prinsep', ['Prinsep']),
    fc('third_council', 'Third Buddhist Council', ['Third Council', 'Moggaliputta Tissa']),
    fc('missions', 'Mahendra', ['Sanghamitra', 'Mahinda'], 'detail'),
    fc('devanampiya', 'Devanampiya Piyadasi', ['Devanampiya', 'Piyadasi', 'Priyadarshi']),
  ],
  blocks: ['explanation', 'timeline', 'table', 'keyFacts', 'tips', 'mistakes', 'revision', 'mcqs'],
  comparisons: ['Major Rock Edicts vs Minor Rock Edicts vs Pillar Edicts (content, examples, locations)'],
  facts: ['Maski', 'Sarnath'],
  examples: [],
  mcqs: { min: 8 },
};

/** Content that covers the Ashoka manifest fully (complete mode). */
function ashokaContent() {
  return {
    overview: 'Ashoka, called Devanampiya Piyadasi in his inscriptions, ruled the Mauryan Empire.',
    explanation: [
      { heading: 'Kalinga War', body: 'The Kalinga War of about 261 BCE caused great loss of life and changed Ashoka deeply.' },
      { heading: 'Dhamma', body: 'Dhamma was a moral code; Dhamma Mahamattas were appointed to spread it across the empire.' },
      { heading: 'Edicts', body: 'Major Rock Edicts, Minor Rock Edicts and Pillar Edicts were mostly written in Brahmi, some in Kharosthi.' },
      { heading: 'Decipherment', body: 'James Prinsep deciphered the Brahmi script in 1837, opening the edicts to historians.' },
      { heading: 'Buddhism', body: 'The Third Buddhist Council met at Pataliputra; Mahendra and Sanghamitra went to Sri Lanka.' },
    ],
    tables: [{ title: 'Edicts', headers: ['Type', 'Example'], rows: [['Minor Rock Edict', 'Maski'], ['Pillar Edict', 'Sarnath']] }],
    timeline: [{ period: 'c. 261 BCE', event: 'Kalinga War' }],
    keyFacts: ['The Maski edict names the king as Ashoka.', 'The Sarnath pillar carries the Lion Capital.'],
    tips: ['Remember which edicts mention Kalinga.'],
    mistakes: ['Do not confuse Rock Edicts with Pillar Edicts.'],
    quickRevision: ['Ashoka adopted Buddhism after the war.'],
    mcqs: ['capital', 'script', 'council', 'war year', 'title', 'missionary', 'decipherer', 'edict site'].map((topic) => ({
      question: `Which option correctly identifies the Ashokan ${topic} asked about here?`,
      options: ['a', 'b', 'c', 'd'],
      correctIndex: 0,
      explanation: 'e',
    })),
  };
}

const findNode = (root, id) => {
  let hit = null;
  const go = (n) => {
    if (n.id === id) hit = n;
    (n.children ?? []).forEach(go);
  };
  go(root);
  return hit;
};

test('manifests: valid, point at real outline sections, all drafts', async () => {
  const { MANIFESTS, manifestReport, findManifest } = await import('../src/data/manifests/index.js');
  const { manifestProblems } = await import('../src/services/coverage.js');
  const report = manifestReport();
  assert.deepEqual(report.orphans, []);
  assert.equal(report.withManifest, Object.keys(MANIFESTS).length);
  assert.equal(report.approved, 0, 'nothing approved without review');
  for (const [id, m] of Object.entries(MANIFESTS)) assert.deepEqual(manifestProblems(m), [], id);
  assert.equal(findManifest(ASHOKA), null, 'drafts are not used for students');
  assert.ok(ASHOKA_MANIFEST);

  assert.ok(manifestProblems({ version: 1, status: 'live', objectives: [], concepts: [] }).length >= 3);
  const dup = manifestProblems({
    version: 1,
    status: 'draft',
    objectives: ['o'],
    concepts: [{ id: 'a', name: 'A' }, { id: 'a', name: 'B' }],
    blocks: ['poem'],
  });
  assert.ok(dup.some((p) => p.includes('duplicate concept')));
  assert.ok(dup.some((p) => p.includes('unknown block')));
});

test('coverage: complete content passes; missing concepts, blocks, MCQs and duplicates are reported', async () => {
  const { findManifest } = await import('../src/data/manifests/index.js');
  const { checkCoverage } = await import('../src/services/coverage.js');
  const m = ASHOKA_MANIFEST;

  const full = checkCoverage(ashokaContent(), m, 'complete');
  assert.equal(full.passed, true, JSON.stringify(full));
  assert.equal(full.verification, 'unverified', 'no trusted source → never "verified"');

  // A 200 OK from the AI is not "complete": drop concepts and blocks.
  const thin = ashokaContent();
  thin.explanation = thin.explanation.filter((e) => e.heading !== 'Decipherment' && e.heading !== 'Buddhism');
  thin.timeline = [];
  thin.mcqs = thin.mcqs.slice(0, 3);
  const r = checkCoverage(thin, m, 'complete');
  assert.equal(r.passed, false);
  assert.deepEqual(r.concepts.missing.sort(), ['james_prinsep', 'missions', 'third_council']);
  assert.deepEqual(r.blocks.missing, ['timeline']);
  assert.deepEqual(r.mcqs, { min: 8, count: 3, ok: false });

  // Quick Revision: only core concepts, no MCQs, quick blocks only.
  const quick = checkCoverage(thin, m, 'quick');
  assert.ok(!quick.concepts.missing.includes('missions'), 'detail concept not required in quick');
  assert.ok(quick.concepts.missing.includes('james_prinsep'), 'core concept still required');
  assert.equal(quick.mcqs.min, 0);
  assert.ok(!quick.blocks.required.includes('mcqs'));

  // Aliases count; case and punctuation are ignored.
  const alias = ashokaContent();
  alias.explanation[0] = { heading: 'War', body: 'The war in KALINGA, c. 261 BCE, changed him.' };
  assert.ok(!checkCoverage(alias, m, 'complete').concepts.missing.includes('kalinga_war'));

  // Duplicated paragraphs fail the check.
  const dup = ashokaContent();
  dup.keyFacts.push('Dhamma was a moral code; Dhamma Mahamattas were appointed to spread it across the empire!');
  const d = checkCoverage(dup, m, 'complete');
  assert.equal(d.duplicates, 1);
  assert.equal(d.passed, false);
});

test('coverage helpers: text normalisation; prompt for missing concepts only', async () => {
  const { normalizeText, manifestPrompt } = await import('../src/services/coverage.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  assert.equal(normalizeText('  Boyce–Codd (BCNF)! '), ' boyce codd bcnf ');
  const m = ASHOKA_MANIFEST;
  const only = manifestPrompt(m, 'complete', ['james_prinsep']);
  assert.match(only, /James Prinsep/);
  assert.doesNotMatch(only, /Kalinga War/);
});

test('tree + admin report: draft manifests only in admin preview', async () => {
  const preview = await call('GET', '/syllabus/tree/ssc_cgl?subjectId=general_awareness&preview=1', undefined, token);
  const sec = findNode(preview.body, ASHOKA);
  assert.equal(sec.manifest.status, 'draft');
  assert.ok(sec.manifest.objectives.length > 0);
  assert.equal(findNode(preview.body, 'general_awareness.history.ancient#vedic.aryans').manifest, null, 'no manifest yet');

  const report = await call('GET', '/admin/manifests/report', undefined, token);
  assert.equal(report.status, 200);
  assert.equal(report.body.sections, 369); // incl. Medieval, Modern and Freedom Struggle drafts
  const s = await call('POST', '/auth/register', { ...student, mobile: '9123456711', email: 'plain2@example.com' });
  assert.equal((await call('GET', '/admin/manifests/report', undefined, s.body.token)).status, 403);
});

// ── Phase C: subject templates, prompt v2, schema v2 ───────────────────────

test('templates: every syllabus subject has a fitting template; blocks fit the subject', async () => {
  const { templateFor, blocksFor } = await import('../src/data/contentTemplates.js');
  const subjectIds = new Set(Object.values(examSubjects).flat().map((s) => s.id));
  for (const id of subjectIds) assert.notEqual(templateFor(id).id, 'general', `${id} has no template`);
  assert.equal(templateFor('general_awareness', 'general_awareness.history.ancient').id, 'history_gk');
  assert.equal(templateFor('general_awareness', 'general_awareness.economy').id, 'banking');

  const history = blocksFor(templateFor('general_awareness'), 'complete');
  assert.ok(history.includes('timeline') && !history.includes('sql') && !history.includes('derivation'));
  const it = blocksFor(templateFor('professional_it'), 'complete');
  assert.ok(it.includes('sql') && it.includes('code') && it.includes('diagram') && !it.includes('timeline'));
  const maths = blocksFor(templateFor('quant'), 'complete');
  assert.ok(maths.includes('derivation') && maths.includes('formulas') && !maths.includes('timeline'));
  assert.ok(blocksFor(templateFor('english'), 'complete').includes('practice'));

  // Modes differ by depth/coverage, not just length.
  const quick = blocksFor(templateFor('general_awareness'), 'quick');
  assert.deepEqual(quick, ['definitions', 'table', 'keyFacts', 'revision', 'timeline']);
  const detailed = blocksFor(templateFor('general_awareness'), 'detailed');
  assert.ok(detailed.includes('examples') && !detailed.includes('mcqs'));
  assert.ok(history.includes('mcqs') && history.includes('mistakes') && history.includes('tips'));
});

test('prompt v2: subject template, mode, nested path and manifest concepts', async () => {
  const { buildSectionPrompt, SECTION_PROMPT_VERSION } = await import('../src/services/sectionGenerator.js');
  const { findOutline } = await import('../src/data/outlines/index.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  assert.equal(SECTION_PROMPT_VERSION, 2);
  const exam = { id: 'ssc_cgl', name: 'SSC CGL' };

  const ancient = findOutline('general_awareness.history.ancient', { includeDrafts: true });
  const mauryan = ancient.chapters.find((c) => c.id === 'mauryan');
  const ashoka = mauryan.sections.find((s) => s.id === 'ashoka.edicts');
  const p = buildSectionPrompt({
    exam,
    subject: { id: 'general_awareness', name: 'General Awareness' },
    outline: ancient,
    chapter: mauryan,
    section: { ...ashoka, path: ['Later reigns'] },
    language: 'en',
    mode: 'complete',
    manifest: ASHOKA_MANIFEST,
  });
  assert.match(p, /Section to write: Later reigns › Major inscriptions and edicts/);
  assert.match(p, /timeline \(period\/year/);
  assert.match(p, /Debated:/);
  assert.match(p, /James Prinsep/);
  assert.match(p, /coveredConcepts/);
  assert.match(p, /mcqs \(8-10/);
  assert.doesNotMatch(p, /sqlExamples/);

  const quick = buildSectionPrompt({
    exam,
    subject: { id: 'general_awareness', name: 'General Awareness' },
    outline: ancient,
    chapter: mauryan,
    section: ashoka,
    language: 'hi',
    mode: 'quick',
  });
  assert.doesNotMatch(quick, /mcqs \(8-10/);
  assert.doesNotMatch(quick, /SYLLABUS COVERAGE/);
  assert.match(quick, /Hindi/);

  const it = findOutline('professional_it.dbms.sql', { includeDrafts: true });
  const sql = buildSectionPrompt({
    exam: { id: 'ibps_so_it', name: 'IBPS SO IT' },
    subject: { id: 'professional_it', name: 'Professional Knowledge' },
    outline: it,
    chapter: it.chapters[0],
    section: it.chapters[0].sections[1],
    language: 'en',
    mode: 'complete',
  });
  assert.match(sql, /sqlExamples/);
  assert.match(sql, /EXACT expected output/);
  assert.doesNotMatch(sql, /timeline \(period/);
});

test('schema v2: new blocks are sanitised; coverage attached when a manifest is given', async () => {
  const { checkSection, SECTION_SCHEMA } = await import('../src/services/sectionGenerator.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  for (const k of ['objectives', 'relatedConcepts', 'furtherLearning', 'sqlExamples', 'derivations', 'practice', 'coveredConcepts']) {
    assert.ok(SECTION_SCHEMA.properties[k], k);
  }
  const raw = {
    ...goodSection('complete'),
    objectives: ['Understand joins', '  '],
    sqlExamples: [
      { query: 'SELECT name FROM emp', input: 'emp(name)', output: { headers: ['name'], rows: [['Asha'], ['x', 'extra']] }, explanation: 'All names' },
      { query: '', output: { headers: [], rows: [] } },
    ],
    derivations: [{ formula: 'A = P(1 + r)^n', steps: ['Year 1: P(1 + r)'] }, { formula: 'no steps', steps: [] }],
    practice: [{ question: 'Fix: He go home.', answer: 'He goes home (subject-verb agreement).' }, { question: 'q only' }],
    coveredConcepts: ['Ashoka'],
  };
  const plain = checkSection(raw, 'complete');
  assert.deepEqual(plain.content.objectives, ['Understand joins']);
  assert.equal(plain.content.sqlExamples.length, 1);
  assert.deepEqual(plain.content.sqlExamples[0].output.rows, [['Asha']], 'malformed row dropped');
  assert.equal(plain.content.derivations.length, 1);
  assert.equal(plain.content.practice.length, 1);
  assert.equal(plain.quality.schemaVersion, 2);
  assert.equal(plain.quality.coverage, null);

  const withManifest = checkSection(raw, 'complete', { manifest: ASHOKA_MANIFEST, templateId: 'history_gk' });
  assert.equal(withManifest.quality.template, 'history_gk');
  assert.equal(withManifest.quality.coverage.passed, false, 'generic text does not cover Ashoka');
  assert.ok(withManifest.quality.coverage.concepts.missing.includes('kalinga_war'));
});

test('prompt v2 changes the shared cache identity (old v1 entries are not served)', async () => {
  const { SECTION_PROMPT_VERSION } = await import('../src/services/sectionGenerator.js');
  const key = SectionCache.key({ unitId: 'u', chapterId: 'c', sectionId: 's', language: 'en', mode: 'complete', outlineVersion: 1, promptVersion: SECTION_PROMPT_VERSION });
  assert.ok(key.split('|').includes('p2'), key);
});

// ── Phase D: completeness check, targeted repair, statuses, jobs ───────────

/** Distinct filler paragraphs (no accidental duplicates). */
const filler = (n, tag) =>
  Array.from({ length: n }, (_, i) => ({
    heading: `Part ${tag}${i}`,
    body: Array.from({ length: 240 }, (_, j) => `${tag}${i}x${j}`).join(' '),
  }));

/** Raw AI output for the Ashoka section, minus the headings in [drop]. */
function ashokaRaw(drop = []) {
  const a = ashokaContent();
  return {
    ...a,
    concepts: [{ term: 'Dhamma', definition: 'Ashoka’s moral code' }],
    examples: [],
    flowcharts: [],
    graphs: [],
    formulas: [],
    codeExamples: [],
    keyPoints: ['Ashoka ruled from Pataliputra'],
    nextTopics: [],
    explanation: [...a.explanation.filter((e) => !drop.includes(e.heading)), ...filler(5, 'f')],
    keyFacts: [...a.keyFacts, ...Array.from({ length: 10 }, (_, i) => `Distinct fact ${i} ${'q'.repeat(i + 1)} about edicts`)],
  };
}

const ashokaRequest = async (mode = 'complete') => {
  const { findManifest } = await import('../src/data/manifests/index.js');
  const { findOutline } = await import('../src/data/outlines/index.js');
  const outline = findOutline('general_awareness.history.ancient', { includeDrafts: true });
  const chapter = outline.chapters.find((c) => c.id === 'mauryan');
  return {
    exam: { id: 'ssc_cgl', name: 'SSC CGL' },
    subject: { id: 'general_awareness', name: 'General Awareness' },
    outline,
    chapter,
    section: chapter.sections.find((s) => s.id === 'ashoka.edicts'),
    language: 'en',
    mode,
    manifest: ASHOKA_MANIFEST,
  };
};

/** Scripted AI: each call returns the next raw object, validated like Gemini's client. */
function scriptedAi(responses) {
  const prompts = [];
  return {
    prompts,
    call: async ({ prompt, validate }) => {
      prompts.push(prompt);
      const raw = responses[Math.min(prompts.length - 1, responses.length - 1)];
      return { json: validate(raw), model: 'fake' };
    },
  };
}

test('repair: missing concepts are requested alone, merged, re-checked → passes', async () => {
  const { generateWithRepair } = await import('../src/services/sectionGenerator.js');
  const supplement = {
    explanation: [
      { heading: 'Decipherment', body: 'James Prinsep deciphered the Brahmi script in 1837, opening the edicts to historians.' },
      { heading: 'Buddhism', body: 'The Third Buddhist Council met at Pataliputra; Mahendra and Sanghamitra went to Sri Lanka.' },
      // Repeats existing text: must not be duplicated by the merge.
      { heading: 'Dhamma', body: 'Dhamma was a moral code; Dhamma Mahamattas were appointed to spread it across the empire.' },
    ],
  };
  const ai = scriptedAi([ashokaRaw(['Decipherment', 'Buddhism']), supplement]);
  const r = await generateWithRepair(await ashokaRequest(), { call: ai.call, templateId: 'history_gk' });
  assert.equal(ai.prompts.length, 2, 'one generation + one repair');
  assert.equal(r.repairAttempts, 1);
  assert.equal(r.quality.coverage.passed, true);
  assert.equal(r.quality.coverageBasis, 'manifest');
  assert.equal(r.content.explanation.filter((e) => e.heading === 'Dhamma').length, 1, 'no duplicate after merge');
  // The repair prompt asks only for what was missing.
  assert.match(ai.prompts[1], /James Prinsep/);
  assert.match(ai.prompts[1], /Third Buddhist Council/);
  assert.doesNotMatch(ai.prompts[1], /MUST COVER[^\n]*Kalinga War/);
});

test('repair: at most two attempts, then CONTENT_INCOMPLETE (never endless)', async () => {
  const { generateWithRepair, ContentIncompleteError, MAX_REPAIR_ATTEMPTS } = await import('../src/services/sectionGenerator.js');
  assert.equal(MAX_REPAIR_ATTEMPTS, 2);
  const useless = { explanation: [{ heading: 'Again', body: 'Some unrelated text that does not name the missing scholar at all here.' }] };
  const ai = scriptedAi([ashokaRaw(['Decipherment']), useless]);
  await assert.rejects(
    generateWithRepair(await ashokaRequest(), { call: ai.call }),
    (e) => e instanceof ContentIncompleteError && e.code === 'CONTENT_INCOMPLETE' && e.repairAttempts === 2 && e.coverage.concepts.missing.includes('james_prinsep'),
  );
  assert.equal(ai.prompts.length, 3, '1 generation + 2 repairs');
});

test('repair: no manifest → structural checks only (labelled), no repair calls', async () => {
  const { generateWithRepair } = await import('../src/services/sectionGenerator.js');
  const req = { ...(await ashokaRequest()), manifest: null };
  const ai = scriptedAi([ashokaRaw(['Decipherment', 'Buddhism'])]);
  const r = await generateWithRepair(req, { call: ai.call });
  assert.equal(ai.prompts.length, 1);
  assert.equal(r.quality.coverageBasis, 'structure_only');
  assert.equal(r.quality.coverage, null);
});

test('merge: supplements append without duplicating questions or paragraphs', async () => {
  const { mergeSupplement } = await import('../src/services/sectionGenerator.js');
  const base = { overview: 'O', explanation: [{ heading: 'A', body: 'Alpha text.' }], mcqs: [{ question: 'Q1?' }], keyFacts: ['F1'] };
  const m = mergeSupplement(base, {
    overview: 'ignored',
    explanation: [{ heading: 'A2', body: 'alpha TEXT' }, { heading: 'B', body: 'Beta.' }],
    mcqs: [{ question: 'q1' }, { question: 'Q2?' }],
    keyFacts: ['F2'],
  });
  assert.equal(m.overview, 'O');
  assert.deepEqual(m.explanation.map((e) => e.heading), ['A', 'B']);
  assert.deepEqual(m.mcqs.map((q) => q.question), ['Q1?', 'Q2?']);
  assert.deepEqual(m.keyFacts, ['F1', 'F2']);
});

test('cache: never downgraded; review-only content hidden from students; versioned key', async () => {
  const { STUDENT_STATUSES, PREVIEW_STATUSES } = await import('../src/services/sectionCache.js');
  const cache = new SectionCache(db);
  const key = SectionCache.key({ unitId: 'u2', chapterId: 'c', sectionId: 's', language: 'en', mode: 'complete', outlineVersion: 3, promptVersion: 2, syllabusVersion: 1, manifestVersion: 4, schemaVersion: 2 });
  assert.equal(key, 'u2|c|s|en|complete|s1|o3|m4|p2|c2');
  const good = { coverage: { concepts: { covered: 10, required: 10 } }, checks: { mcqs: { value: 9 } }, words: 1500 };
  const worse = { coverage: { concepts: { covered: 10, required: 10 } }, checks: { mcqs: { value: 6 } }, words: 1500 };
  const first = await cache.put(key, { content: { v: 1 }, quality: good, model: 'm', unitId: 'u2' });
  assert.equal(first.status, 'published');
  assert.equal(first.review, 'auto');
  const second = await cache.put(key, { content: { v: 2 }, quality: worse, model: 'm', unitId: 'u2' });
  assert.equal(second._id, first._id, 'the better entry keeps being served');
  assert.equal((await db.sectionCache.findOne({ key, rev: 2 })).status, 'rejected_lower_quality');
  assert.deepEqual((await cache.current(key)).content, { v: 1 });

  const rk = `${key}-review`;
  await cache.put(rk, { content: { v: 1 }, quality: good, model: 'm', unitId: 'u2', status: 'ready_for_review' });
  assert.equal(await cache.current(rk, { statuses: STUDENT_STATUSES }), null);
  assert.ok(await cache.current(rk, { statuses: PREVIEW_STATUSES }));
});

test('jobs: one lease per section across servers; expired leases are taken over', async () => {
  let now = new Date('2026-11-24T10:00:00Z');
  const jobs = new SectionJobs(db, () => now);
  const key = `job-test-${Date.now()}`;
  assert.equal(await jobs.acquire(key, 'server-a'), true);
  assert.equal(await jobs.acquire(key, 'server-b'), false, 'held by server-a');
  await jobs.finish(key, 'server-a', { state: 'incomplete', error: 'missing x', missing: { concepts: ['x'] }, repairAttempts: 2 });
  const j = await jobs.get(key);
  assert.equal(j.state, 'incomplete');
  assert.equal(j.repairAttempts, 2);
  assert.equal(await jobs.acquire(key, 'server-b'), true, 'free again after finishing');
  // server-b crashes: its lease expires and another server may take over.
  now = new Date(now.getTime() + 6 * 60_000);
  assert.equal((await jobs.states([key])).get(key).state, 'failed');
  assert.equal(await jobs.acquire(key, 'server-c'), true);
});

test('API: incomplete after repairs → 422, nothing cached or counted, status + retry; review-only status', async () => {
  const { ContentIncompleteError } = await import('../src/services/sectionGenerator.js');
  const unit = 'general_awareness.history.ancient';
  const req = { examId: 'ssc_cgl', unitId: unit, chapterId: 'gupta', sectionId: 'culture', language: 'en', mode: 'detailed' };
  const statusUrl = `/notes/sections/status?examId=ssc_cgl&unitId=${unit}&chapterId=gupta&sectionId=culture&mode=detailed&preview=1`;
  const quotaBefore = await db.aiGenerationLog.countDocuments({});
  const cacheBefore = await db.sectionCache.countDocuments({});
  fakeSections.failNext = new ContentIncompleteError(
    { concepts: { missing: ['ajanta'] }, facts: { missing: [] }, blocks: { missing: ['table'] }, mcqs: { ok: true, count: 0, min: 0 }, duplicates: 0 },
    2,
  );
  const r = await call('POST', '/notes/sections/generate?preview=1', req, token);
  assert.equal(r.status, 422);
  assert.equal(r.body.code, 'CONTENT_INCOMPLETE');
  assert.deepEqual(r.body.details.missingConcepts, ['ajanta']);
  assert.equal(r.body.details.repairAttempts, 2);
  assert.equal(await db.sectionCache.countDocuments({}), cacheBefore, 'invalid content never cached');
  assert.equal(await db.aiGenerationLog.countDocuments({}), quotaBefore, 'not counted');

  const st = await call('GET', statusUrl, undefined, token);
  assert.equal(st.body.status, 'incomplete');
  assert.deepEqual(st.body.missing.concepts, ['ajanta']);
  assert.equal(st.body.canRetry, true);
  const o = await call('GET', `/notes/outlines/ssc_cgl/${unit}?mode=detailed&preview=1`, undefined, token);
  assert.equal(o.body.chapters.find((c) => c.id === 'gupta').sections.find((s) => s.id === 'culture').contentStatus, 'incomplete');

  // Retry succeeds. Made from a DRAFT outline → ready_for_review (admin only).
  const ok = await call('POST', '/notes/sections/generate?preview=1', req, token);
  assert.equal(ok.status, 201);
  assert.equal(ok.body.contentStatus, 'ready_for_review');
  assert.equal(ok.body.review, 'auto');
  assert.equal(ok.body.verification, 'unverified');
  assert.equal((await call('GET', statusUrl, undefined, token)).body.status, 'ready');
  assert.equal(await db.aiGenerationLog.countDocuments({}), quotaBefore + 1, 'one job counts once');
});

test('API: another server generating the same section → 202 generating (no second AI call)', async () => {
  const unit = 'general_awareness.history.ancient';
  const key = SectionCache.key({ unitId: unit, chapterId: 'gupta', sectionId: 'science', language: 'en', mode: 'detailed', syllabusVersion: 1, outlineVersion: 2, manifestVersion: 0, promptVersion: 2, schemaVersion: 2 });
  const jobs = new SectionJobs(db);
  assert.equal(await jobs.acquire(key, 'other-server'), true);
  const calls = fakeSections.calls;
  const r = await call('POST', '/notes/sections/generate?preview=1', { examId: 'ssc_cgl', unitId: unit, chapterId: 'gupta', sectionId: 'science', mode: 'detailed' }, token);
  assert.equal(r.status, 202);
  assert.equal(r.body.status, 'generating');
  assert.equal(fakeSections.calls, calls);
  await jobs.finish(key, 'other-server', { state: 'failed', error: 'test' });
});

// ── Phase E: modes by depth and coverage, not word count ───────────────────

test('modes: with a manifest, a short but complete section passes; without one, the word floor applies', async () => {
  const { checkSection } = await import('../src/services/sectionGenerator.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  const m = ASHOKA_MANIFEST;
  const raw = {
    ...ashokaContent(),
    concepts: [{ term: 'Dhamma', definition: 'moral code' }],
    keyFacts: ['Fact one about Maski edict.', 'Fact two about Sarnath pillar.', 'Fact three about Brahmi script use.'],
    examples: [],
    flowcharts: [],
    graphs: [],
    formulas: [],
    codeExamples: [],
    keyPoints: ['Point'],
    nextTopics: [],
  };
  // ~250 words: far below the old 1100-word floor, but fully covers the manifest.
  const r = checkSection(raw, 'complete', { manifest: m });
  assert.equal(r.quality.coverage.passed, true, JSON.stringify(r.quality.coverage));
  assert.ok(r.quality.words < 1100);
  // Without a manifest the structural floor (words, key facts) still applies.
  assert.throws(() => checkSection(raw, 'complete'), /incomplete \(words/);
});

test('modes: comparison tables and worked examples are required in Detailed/Complete, not in Quick', async () => {
  const { checkCoverage } = await import('../src/services/coverage.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  const nf = findManifest('professional_it.dbms.normalization#dbms_normalization.normal_forms', { includeDrafts: true });
  assert.equal(nf.comparisons.length, 1);
  assert.equal(nf.examples.length, 1);
  const content = {
    explanation: [{ heading: 'Forms', body: '1NF 2NF 3NF BCNF prime attribute super key lossless dependency preserving' }],
    concepts: [{ term: 'BCNF', definition: 'Boyce-Codd' }],
    examples: [],
    tables: [],
    keyFacts: ['k'],
    quickRevision: ['r'],
    mistakes: ['m'],
    mcqs: [],
  };
  const detailed = checkCoverage(content, nf, 'detailed');
  assert.deepEqual(detailed.comparisons, { required: 1, count: 0, ok: false });
  assert.deepEqual(detailed.examples, { required: 1, count: 0, ok: false });
  assert.equal(detailed.passed, false);
  const quick = checkCoverage(content, nf, 'quick');
  assert.equal(quick.comparisons.required, 0);
  assert.equal(quick.examples.required, 0);
});

test('modes: repair prompt asks for the missing comparison table and example', async () => {
  const { buildRepairPrompt } = await import('../src/services/sectionGenerator.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  const nf = findManifest('professional_it.dbms.normalization#dbms_normalization.normal_forms', { includeDrafts: true });
  const coverage = {
    concepts: { missing: [] },
    facts: { missing: [] },
    blocks: { missing: [] },
    mcqs: { ok: true, count: 8, min: 8 },
    comparisons: { required: 1, count: 0, ok: false },
    examples: { required: 1, count: 0, ok: false },
    duplicates: 0,
  };
  const p = buildRepairPrompt(
    { manifest: nf, mode: 'detailed', section: { title: '1NF, 2NF, 3NF and BCNF' }, language: 'en' },
    { explanation: [], concepts: [] },
    coverage,
  );
  assert.match(p, /comparison tables \(in "tables"\): 1NF vs 2NF vs 3NF vs BCNF/);
  assert.match(p, /worked examples .*Normalise one un-normalised table to BCNF/);
});

test('modes API: default Complete; blocks differ by mode and subject', async () => {
  const r = await call('GET', '/notes/modes?subjectId=professional_it', undefined, token);
  assert.equal(r.status, 200);
  assert.equal(r.body.default, 'complete');
  assert.equal(r.body.template, 'computer');
  const byId = Object.fromEntries(r.body.modes.map((m) => [m.id, m]));
  assert.deepEqual(byId.quick.conceptLevels, ['core']);
  assert.equal(byId.quick.mcqs, false);
  assert.ok(byId.detailed.blocks.includes('sql') && !byId.detailed.blocks.includes('mcqs'));
  assert.ok(byId.complete.blocks.includes('mcqs') && byId.complete.blocks.includes('sql'));
  const gk = await call('GET', '/notes/modes?subjectId=general_awareness', undefined, token);
  assert.ok(gk.body.modes.find((m) => m.id === 'complete').blocks.includes('timeline'));
  // Section APIs default to Complete Exam Preparation.
  const o = await call('GET', '/notes/outlines/ssc_cgl/general_awareness.history.ancient?preview=1', undefined, token);
  assert.equal(o.body.mode, 'complete');
});

// ── Phase G: progress roll-ups and revision recommendations ────────────────

test('progress: opened-but-unfinished sections are in progress; roll-ups at every level', async () => {
  const unit = 'general_awareness.history.ancient';
  // Open (generate) a section without completing it.
  const open = await call(
    'POST',
    '/notes/sections/generate?preview=1',
    { examId: 'ssc_cgl', unitId: unit, chapterId: 'sangam', sectionId: 'kingdoms', mode: 'complete' },
    token,
  );
  assert.equal(open.status, 201);
  const t = await call('GET', '/syllabus/tree/ssc_cgl?subjectId=general_awareness&preview=1', undefined, token);
  const kingdoms = findNode(t.body, `${unit}#sangam.kingdoms`);
  assert.equal(kingdoms.progress, 'in_progress', 'opened, not marked complete');
  assert.equal(kingdoms.stats.inProgress, 1);
  const unitNode = findNode(t.body, unit);
  assert.equal(unitNode.progress, 'in_progress');
  assert.ok(unitNode.stats.completed >= 1 && unitNode.stats.inProgress >= 1);
  // Subject roll-up counts path items (topics/units) too.
  const subject = t.body.children[0];
  assert.ok(subject.stats.items > 0);
  assert.equal(subject.stats.items, findNode(t.body, 'general_awareness.history').stats.items + subject.children.filter((x) => x.id !== 'general_awareness.history').reduce((n, x) => n + x.stats.items, 0));

  const r = await call('GET', '/learning/recommendations/ssc_cgl?subjectId=general_awareness&preview=1', undefined, token);
  assert.equal(r.status, 200);
  assert.ok(r.body.continue.some((c) => c.sectionId === 'kingdoms'));
  const history = r.body.subjects[0].topics.find((x) => x.id === 'general_awareness.history');
  assert.ok(history.chapters.length > 0, 'chapter-level progress');
  assert.ok(history.chapters.some((c) => c.sectionsInProgress === 1));
});

test('recommendations: revise topics come from real practice results, not from AI generation', async () => {
  const reg = await call('POST', '/auth/register', { ...student, mobile: '9123456722', email: 'reviser@example.com' });
  const t = reg.body.token;

  // Nothing practised yet → nothing to revise.
  const empty = await call('GET', '/learning/recommendations/ssc_cgl?subjectId=quant', undefined, t);
  assert.deepEqual(empty.body.revise, []);
  assert.ok(empty.body.next, 'a next step is always suggested');

  // A practice test answered all wrong → weak topics.
  // Two sets, so topics reach the 2-attempt minimum.
  for (let i = 0; i < 2; i++) {
    const s = await call('POST', '/questions/generate', { examId: 'ssc_cgl', topicIds: ['quant.percentage'], difficulty: 'medium', count: 5, source: 'ai' }, t);
    assert.equal(s.status, 201);
    const wrong = await call('POST', `/practice/${s.body.sessionId}/submit`, { answers: {}, timeTakenSeconds: 30 }, t);
    assert.equal(wrong.status, 200);
  }

  const r = await call('GET', '/learning/recommendations/ssc_cgl?subjectId=quant', undefined, t);
  assert.ok(r.body.revise.length > 0);
  for (const x of r.body.revise) {
    assert.ok(x.accuracy < 0.6);
    assert.ok(x.attempted >= 2);
    assert.ok(x.topicId.startsWith('quant.'), 'only this subject');
    assert.equal(x.action, 'study_notes', 'not studied yet → study first');
  }
  // Studied (marked complete) but still weak → revise the notes.
  const weak = r.body.revise[0].topicId;
  assert.equal((await call('PUT', `/learning-path/ssc_cgl/items/${weak}`, { completed: true }, t)).status, 200);
  const after = await call('GET', '/learning/recommendations/ssc_cgl?subjectId=quant', undefined, t);
  assert.equal(after.body.revise.find((x) => x.topicId === weak).action, 'revise_notes');
  assert.equal(after.body.subjects[0].itemsCompleted, 1);
  assert.equal((await call('GET', '/learning/recommendations/nope', undefined, t)).status, 404);
});

// ── History outlines: Medieval, Modern, Freedom Struggle (drafts) ──────────

test('history outlines: drafts, nested, every section has a checklist, cross-references resolve', async () => {
  const { OUTLINES, findOutline } = await import('../src/data/outlines/index.js');
  const { findManifest } = await import('../src/data/manifests/index.js');
  const { buildExamTree, examsSharing } = await import('../src/services/syllabusTree.js');
  const units = ['medieval', 'modern', 'freedom_struggle'].map((u) => `general_awareness.history.${u}`);
  for (const unit of units) {
    const o = OUTLINES.find((x) => x.unitId === unit);
    assert.ok(o, unit);
    assert.equal(o.status, 'draft', `${unit} must stay a draft`);
    assert.equal(findOutline(unit), null, 'hidden from students');
    assert.ok(o.sourceRefs.length >= 3, 'syllabus references listed');
    for (const c of o.chapters) {
      assert.ok(c.description && c.objectives?.length && ['common', 'extended'].includes(c.scope), `${unit}#${c.id}`);
      for (const ref of c.seeAlso ?? []) {
        const [refUnit, refChapter] = ref.split('#');
        if (refChapter) {
          const target = findOutline(refUnit, { includeDrafts: true });
          assert.ok(target?.chapters.some((x) => x.id === refChapter), `${unit}#${c.id} → ${ref}`);
        } else {
          assert.ok(examsSharing(refUnit).length > 0, `${ref} is a syllabus unit`);
        }
      }
      for (const sec of c.sections) {
        const m = findManifest(`${unit}#${c.id}.${sec.id}`, { includeDrafts: true });
        assert.ok(m && m.concepts.length >= 3, `${unit}#${c.id}.${sec.id} has a checklist`);
        assert.equal(m.status, 'draft');
        assert.deepEqual(m.sources, [], 'syllabus refs are not fact sources');
      }
    }
  }
  // Attached wherever the exam has History; never to Banking.
  assert.deepEqual(examsSharing('general_awareness.history.freedom_struggle').sort(), ['rrb_alp', 'rrb_group_d', 'rrb_je', 'rrb_ntpc', 'ssc_cgl', 'ssc_chsl', 'ssc_cpo', 'ssc_gd', 'ssc_mts'].sort());
  const ibps = buildExamTree('ibps_po', { includeDrafts: true });
  assert.equal(JSON.stringify(ibps).includes('freedom_struggle'), false);
  // Boundary: the Revolt of 1857 is only in Freedom Struggle.
  const modern = findOutline('general_awareness.history.modern', { includeDrafts: true });
  assert.equal(modern.chapters.some((c) => c.id === 'revolt_1857'), false);
});
