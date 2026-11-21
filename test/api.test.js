// Integration tests against a real local MongoDB, in a separate database
// (examgenius_test) that is dropped before and after the run.
//   npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { UserStore } from '../src/services/userStore.js';
import { PracticeStore, scoreSession } from '../src/services/practiceStore.js';
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
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 30, generationsPerHour: 50 },
  practice: { secondsPerQuestion: 60, correctMark: 1, negativeMark: 0.25 },
};

let server;
let base;
let db;
before(async () => {
  const fresh = await connectDb({ uri: MONGO_URI, db: 'examgenius_test' });
  await fresh.db.dropDatabase();
  await fresh.client.close();
  db = await connectDb({ uri: MONGO_URI, db: 'examgenius_test' }); // recreate indexes
  const app = createApp({
    config,
    users: new UserStore(db.users),
    practice: new PracticeStore(db, config.practice),
    questionGenerator: new SampleQuestionGenerator(),
  });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  server.close();
  await db.db.dropDatabase();
  await db.client.close();
});

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
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
