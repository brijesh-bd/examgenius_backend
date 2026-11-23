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
  free: { setsPerDay: 2, maxQuestionsPerSet: 10, maxSaved: 10, freshAi: false, ...free },
  pro: { questionsPerDay: 300, maxQuestionsPerSet: 30, freshAi: true },
  trialDays: 7,
  offers: [{ id: 'pro_yearly', months: 12, priceInr: 499, popular: true }],
});
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  notes: { showDraftOutlines: true },
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 30, generationsPerHour: 500, notesPerHour: 500 },
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
    const q = { examId: 'rrb_ntpc', topicIds: [topicId], difficulty: 'easy', count: 5 };
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
  const s = await call('POST', '/questions/generate', { examId: 'rrb_ntpc', topicIds: [topicId], difficulty: 'easy', count: 3 }, token);
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
  assert.equal(o.body.total, ancientIndiaOutline.chapters.reduce((n, c) => n + c.sections.length, 0));
  assert.equal(o.body.coverageComplete, false);
  assert.deepEqual(o.body.continue, { chapterId: 'sources', sectionId: 'literary' });
  assert.equal((await call('GET', `/notes/outlines/ssc_cgl/general_awareness.history.modern`, undefined, token)).body.code, 'NO_OUTLINE');
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

test('gemini client: a daily quota (long retryDelay) is not retried; next model used', async () => {
  const quota = [429, { error: { status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded', details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '72364s' }] } }];
  const g = fakeGemini([quota, okResp({ ok: 1 })]);
  const c = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: g.fetchImpl, log: quiet, sleep: async () => {} });
  const r = await c.generate({ models: ['primary', 'backup'], label: 't', systemPrompt: '', prompt: '', schema: {} });
  assert.deepEqual(g.seen, ['primary', 'backup']);
  assert.equal(r.fallbackFrom, 'primary');
  // A short rate-limit delay is retried once on the same model.
  const brief = [429, { error: { details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '3s' }] } }];
  const g2 = fakeGemini([brief, okResp({ ok: 1 })]);
  const c2 = new GeminiJsonClient({ apiKey: 'k', timeoutMs: 1000, fetchImpl: g2.fetchImpl, log: quiet, sleep: async () => {} });
  const r2 = await c2.generate({ models: ['primary', 'backup'], label: 't', systemPrompt: '', prompt: '', schema: {} });
  assert.deepEqual(g2.seen, ['primary', 'primary']);
  assert.equal(r2.fallbackFrom, null);
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
