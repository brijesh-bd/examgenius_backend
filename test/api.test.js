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
import {
  FallbackGenerator,
  GeminiQuestionGenerator,
  SampleQuestionGenerator,
  AiServiceError,
  isValidQuestion,
  splitSteps,
} from '../src/services/questionGenerator.js';
import { examCatalog } from '../src/data/examCatalog.js';
import { examSubjects } from '../src/data/syllabus.js';
import { sampleQuestionBank } from '../src/data/sampleQuestions.js';

const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const plans = (free) => ({
  free: { setsPerDay: 2, maxQuestionsPerSet: 10, maxSaved: 10, freshAi: false, ...free },
  pro: { questionsPerDay: 300, maxQuestionsPerSet: 30, freshAi: true },
  trialDays: 7,
  offers: [{ id: 'pro_yearly', months: 12, priceInr: 499, popular: true }],
});
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 30, generationsPerHour: 500 },
  practice: { secondsPerQuestion: 60, correctMark: 1, negativeMark: 0.25 },
  // Main app: generous limits so the flow tests are not about quotas.
  plans: plans({ setsPerDay: 1000, maxQuestionsPerSet: 30, maxSaved: 1000 }),
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
const services = (cfg, generator) => ({
  config: cfg,
  users: new UserStore(db.users),
  practice: new PracticeStore(db, cfg.practice),
  questionGenerator: generator,
  bank: new QuestionBank(db.questionBank, db.sessions),
  subscription: new SubscriptionService(db, cfg.plans),
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
    { examId: 'rrb_ntpc', topicIds: ['quant.time_work'], difficulty: 'medium', count: 5, ...body },
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

// ── Question bank + Free / Pro limits (strict app, fake AI) ─────────────────

const strict = (method, path, body, token) => call(method, path, body, token, strictBase);
const reg = async (mobile) =>
  (await strict('POST', '/auth/register', { name: `Student ${mobile}`, mobile, password: 'password123', targetExamId: 'ssc_cgl' })).body.token;
const gen = (token, body = {}) =>
  strict('POST', '/questions/generate', { examId: 'ssc_cgl', topicIds: ['quant.percentage'], difficulty: 'hard', count: 5, ...body }, token);

test('bank: AI questions are stored once and reused for other students; seen ones are skipped', async () => {
  const a = await reg('8000000001');
  const b = await reg('8000000002');
  const before = fakeAi.calls;

  const first = await gen(a);
  assert.equal(first.status, 201);
  assert.equal(first.body.isPreview, false);
  assert.equal(fakeAi.calls, before + 1); // bank empty → AI
  assert.equal(await db.questionBank.countDocuments({ topicId: 'quant.percentage', difficulty: 'hard' }), 5);

  const forB = await gen(b);
  assert.equal(fakeAi.calls, before + 1); // served entirely from the bank — no AI cost
  assert.deepEqual(
    forB.body.questions.map((q) => q.question).sort(),
    first.body.questions.map((q) => q.question).sort(),
  );
  assert.equal(forB.body.questions[0].correctIndex, undefined); // still no answer leak

  const againA = await gen(a);
  assert.equal(fakeAi.calls, before + 2); // A has seen all 5 → new ones generated
  const seen = new Set(first.body.questions.map((q) => q.question));
  assert.ok(againA.body.questions.every((q) => !seen.has(q.question)));
});

test('free: 2 sets per day, then 403 DAILY_SETS with reset time', async () => {
  const t = await reg('8000000003');
  assert.equal((await gen(t)).status, 201);
  assert.equal((await gen(t)).status, 201);
  const third = await gen(t);
  assert.equal(third.status, 403);
  assert.equal(third.body.code, 'DAILY_SETS');
  assert.equal(third.body.details.max, 2);
  assert.ok(Date.parse(third.body.details.resetsAt) > Date.now());
  const status = (await strict('GET', '/subscription', undefined, t)).body;
  assert.equal(status.tier, 'free');
  assert.deepEqual(status.usageToday, { sets: 2, questions: 10 });
});

test('free: set size and fresh AI are Pro-only', async () => {
  const t = await reg('8000000004');
  const big = await gen(t, { count: 20 });
  assert.equal(big.status, 403);
  assert.equal(big.body.code, 'SET_SIZE');
  assert.equal(big.body.details.max, 10);
  const fresh = await gen(t, { fresh: true });
  assert.equal(fresh.body.code, 'FRESH_AI_PRO');
  // Rejected requests used no quota.
  assert.equal((await strict('GET', '/subscription', undefined, t)).body.usageToday.sets, 0);
});

test('a failed AI call gives the quota back', async () => {
  const t = await reg('8000000005');
  fakeAi.failNext = true;
  const r = await gen(t, { topicIds: ['quant.ratio_proportion'] }); // empty bank topic → AI → fails
  assert.equal(r.status, 503);
  assert.equal((await strict('GET', '/subscription', undefined, t)).body.usageToday.sets, 0);
});

test('trial: once per account, unlocks Pro (bigger sets, fresh AI)', async () => {
  const t = await reg('8000000006');
  const s0 = (await strict('GET', '/subscription', undefined, t)).body;
  assert.equal(s0.trialAvailable, true);
  assert.equal(s0.limits.maxQuestionsPerSet, 10);

  const s1 = (await strict('POST', '/subscription/trial', undefined, t)).body;
  assert.equal(s1.tier, 'pro');
  assert.equal(s1.source, 'trial');
  assert.equal(s1.trialAvailable, false);
  const days = (Date.parse(s1.expiresAt) - Date.now()) / 86_400_000;
  assert.ok(days > 6.9 && days <= 7);
  assert.equal((await strict('POST', '/subscription/trial', undefined, t)).status, 409);

  assert.equal((await gen(t, { count: 20 })).status, 201);
  const callsBefore = fakeAi.calls;
  const fresh = await gen(t, { fresh: true }); // bank has these, but fresh forces AI
  assert.equal(fresh.status, 201);
  assert.equal(fakeAi.calls, callsBefore + 1);
  for (let i = 0; i < 3; i++) assert.equal((await gen(t)).status, 201); // no 2-set cap
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
