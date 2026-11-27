// Redesigned AI Study Notes: complete-coverage notes, topic summaries
// (shared cache), specific AI error codes. Fake AI; needs MongoDB.
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
import { NOTE_SECTIONS, buildNotesPrompt, validateNoteContent } from '../src/services/notesGenerator.js';
import { TopicSummaryStore, checkSummary } from '../src/services/topicSummary.js';
import { AiServiceError, GenerationError } from '../src/services/questionGenerator.js';
import { templateFor } from '../src/data/contentTemplates.js';

const body = 'Work is done when a force moves its point of application through a displacement. '.repeat(8);
const fullContent = (n = 6) => ({
  overview: 'Work, energy and power for RRB exams.',
  explanation: Array.from({ length: n }, (_, i) => ({ heading: `Part ${i + 1}`, body })),
  concepts: [{ term: 'Work', definition: 'W = F·s·cosθ' }],
  examples: [{ title: 'Ex', problem: 'F = 10 N, s = 2 m', steps: ['W = 10 × 2'], answer: '20 J' }],
  flowcharts: [], graphs: [], tables: [], codeExamples: [],
  formulas: [{ name: 'Work', expression: 'W = F s cosθ', meaning: 'F force (N), s displacement (m)' }],
  tips: ['θ = 90° → zero work'], mistakes: ['Forgetting cosθ'], keyPoints: ['SI unit joule'], quickRevision: ['W = Fs cosθ'],
  mcqs: Array.from({ length: 8 }, (_, i) => ({ question: `Q${i}?`, options: ['a', 'b', 'c', 'd'], correctIndex: 0, explanation: 'a' })),
  nextTopics: ['Energy'],
});

// ── Pure ────────────────────────────────────────────────────────────────────
test('complete notes: thin or cut-down answers are rejected, standard notes unchanged', () => {
  assert.ok(validateNoteContent(fullContent(), NOTE_SECTIONS, { coverage: 'complete' }));
  assert.throws(() => validateNoteContent(fullContent(2), NOTE_SECTIONS, { coverage: 'complete' }), GenerationError);
  assert.throws(() => validateNoteContent({ ...fullContent(), mcqs: [] }, NOTE_SECTIONS, { coverage: 'complete' }), GenerationError);
  assert.ok(validateNoteContent(fullContent(2), NOTE_SECTIONS), 'standard has no floor');
  // Complete keeps more material than standard.
  const many = { ...fullContent(16), examples: Array.from({ length: 10 }, () => fullContent().examples[0]) };
  assert.equal(validateNoteContent(many, NOTE_SECTIONS, { coverage: 'complete' }).explanation.length, 16);
  assert.equal(validateNoteContent(many, NOTE_SECTIONS).explanation.length, 10);
  assert.equal(validateNoteContent(many, NOTE_SECTIONS, { coverage: 'complete' }).examples.length, 10);
});

test('complete prompt: syllabus scope, subject guide, no difficulty level; science inside GA', () => {
  const p = buildNotesPrompt({
    exam: { name: 'RRB NTPC' }, subject: { name: 'General Awareness' }, topic: { name: 'Physics › Work' },
    concept: { path: 'General Science › Physics › Work', patterns: ['numerical'] },
    language: 'hi', level: 'exam', sections: NOTE_SECTIONS, coverage: 'complete',
    subjectGuide: 'GENERAL SCIENCE guide', scope: '- Work\n  - Positive work\n  - Zero work',
  });
  assert.ok(p.includes('- Zero work') && p.includes('GENERAL SCIENCE guide') && p.includes('Cover EVERY subtopic'));
  assert.ok(!p.includes('Level:'), 'no difficulty level');
  assert.ok(p.includes('कार्य (Work)'), 'Hindi keeps English technical terms');
  assert.ok(p.includes('never quote or invent a specific past question'));
  assert.equal(templateFor('general_awareness', 'ga.general_science.physics').id, 'science');
  assert.equal(templateFor('general_awareness', 'ga.history').id, 'history_gk');
});

test('topic summary validation', () => {
  assert.throws(() => checkSummary({ covers: '', keyConcepts: [] }), GenerationError);
  const s = checkSummary({ covers: 'Work and energy', keyConcepts: ['a', 'b'], definitions: [{ term: 'W', definition: '' }], formulas: [], principles: [], examFocus: [] });
  assert.deepEqual(s.definitions, [], 'incomplete definitions dropped');
});

// ── HTTP ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const DB = 'examgenius_test_notes_redesign';
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

const fakeNotes = {
  calls: [],
  failNext: null,
  async generate(req) {
    this.calls.push(req);
    if (this.failNext) {
      const e = this.failNext;
      this.failNext = null;
      throw e;
    }
    return { content: fullContent(), model: 'fake-notes' };
  },
};
const fakeSummary = {
  calls: 0,
  async generate({ language }) {
    this.calls++;
    return { summary: checkSummary({ covers: language === 'hi' ? 'कार्य' : 'Work', keyConcepts: ['Positive work', 'Zero work'] }), model: 'fake' };
  },
};

let db;
let server;
let base;
let token;
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
    notesGenerator: fakeNotes,
    topicSummaries: new TopicSummaryStore(db),
    summaryGenerator: fakeSummary,
  });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
  token = (await call('POST', '/auth/register', { name: 'Test User', mobile: '9200000001', email: 'n1@example.com', password: 'password123', targetExamId: 'rrb_ntpc' })).body.token;
});
after(async () => {
  server?.close();
  await db.db.dropDatabase();
  await db.client.close();
});

async function call(method, path, payload, auth = token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const NODE = 'ga.general_science';

test('complete notes for a syllabus node: all sections, sub-tree scope, saved once, labelled complete', async () => {
  const req = { examId: 'rrb_ntpc', nodeId: NODE, language: 'en', coverage: 'complete', requestKey: 'complete-key-0001' };
  const r = await call('POST', '/notes/generate', req);
  assert.equal(r.status, 201);
  const sent = fakeNotes.calls.at(-1);
  assert.equal(sent.coverage, 'complete');
  assert.deepEqual(sent.sections, NOTE_SECTIONS, 'no section picker: everything');
  assert.ok(sent.scope.split('\n').length > 3, 'the whole sub-tree is in scope');
  assert.ok(sent.subjectGuide.startsWith('GENERAL SCIENCE'));
  const saved = await db.studyNotes.findOne({ _id: r.body.id });
  assert.equal(saved.coverage, 'complete');
  assert.equal(saved.syllabusNodeId, NODE);
  // Retried request (e.g. after a timeout) → the same note, no second AI call.
  const calls = fakeNotes.calls.length;
  const again = await call('POST', '/notes/generate', req);
  assert.equal(again.body.id, r.body.id);
  assert.equal(fakeNotes.calls.length, calls);
  // Invalid node → 400 before any AI call.
  assert.equal((await call('POST', '/notes/generate', { ...req, nodeId: 'ga.nope', requestKey: 'complete-key-0002' })).status, 400);
  assert.equal(fakeNotes.calls.length, calls);
});

test('AI failures return specific codes; nothing saved or counted', async () => {
  const before = await db.studyNotes.countDocuments({});
  const quota = await db.aiGenerationLog.countDocuments({});
  const cases = [
    [new AiServiceError('HTTP 503 UNAVAILABLE: This model is currently experiencing high demand.', true), 503, 'AI_OVERLOADED'],
    [new AiServiceError('timed out after 180000ms', true), 503, 'AI_TIMEOUT'],
    [new GenerationError('The AI response was cut off before it finished.'), 502, 'AI_TRUNCATED'],
    [new GenerationError('The AI notes did not cover the whole topic. Nothing was saved; please try again.'), 502, 'AI_INCOMPLETE'],
    [new AiServiceError('AI Study Notes are not available: the server has no AI key configured.', false), 503, 'AI_NOT_CONFIGURED'],
  ];
  for (const [err, status, code] of cases) {
    fakeNotes.failNext = err;
    const r = await call('POST', '/notes/generate', { examId: 'rrb_ntpc', nodeId: NODE, coverage: 'complete', requestKey: `fail-${code}-0001` });
    assert.equal(r.status, status, code);
    assert.equal(r.body.code, code);
  }
  assert.equal(await db.studyNotes.countDocuments({}), before);
  assert.equal(await db.aiGenerationLog.countDocuments({}), quota);
});

test('topic summary: generated once per exam × topic × language, then served from cache', async () => {
  const first = await call('POST', '/notes/topic-summary', { examId: 'rrb_ntpc', nodeId: NODE, language: 'en' });
  assert.equal(first.status, 200);
  assert.equal(first.body.source, 'ai');
  assert.deepEqual(first.body.summary.keyConcepts, ['Positive work', 'Zero work']);
  const second = await call('POST', '/notes/topic-summary', { examId: 'rrb_ntpc', nodeId: NODE, language: 'en' });
  assert.equal(second.body.source, 'cache');
  assert.equal(fakeSummary.calls, 1);
  const hi = await call('POST', '/notes/topic-summary', { examId: 'rrb_ntpc', nodeId: NODE, language: 'hi' });
  assert.equal(hi.body.summary.covers, 'कार्य');
  assert.equal(fakeSummary.calls, 2);
  assert.equal((await call('POST', '/notes/topic-summary', { examId: 'rrb_ntpc', nodeId: 'ga.nope' })).status, 400);
  assert.equal((await call('POST', '/notes/topic-summary', { examId: 'rrb_ntpc', nodeId: NODE }, null)).status, 401);
  assert.equal(await db.studyNotes.countDocuments({ syllabusNodeId: NODE, coverage: { $exists: false } }), 0, 'a summary never creates a note');
});

test('a retry while the first request is still generating joins it: one AI call, one note, one quota entry', async () => {
  let release;
  const gate = new Promise((r) => (release = r));
  const slow = fakeNotes.generate.bind(fakeNotes);
  fakeNotes.generate = async (req) => {
    await gate;
    return slow(req);
  };
  try {
    const calls = fakeNotes.calls.length;
    const quota = await db.aiGenerationLog.countDocuments({});
    const req = { examId: 'rrb_ntpc', nodeId: NODE, coverage: 'complete', requestKey: 'inflight-key-0001' };
    const first = call('POST', '/notes/generate', req);
    await new Promise((r) => setTimeout(r, 50));
    const retry = call('POST', '/notes/generate', req);
    await new Promise((r) => setTimeout(r, 50));
    release();
    const [a, b] = await Promise.all([first, retry]);
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);
    assert.equal(a.body.id, b.body.id);
    assert.equal(fakeNotes.calls.length, calls + 1, 'one AI call');
    assert.equal(await db.studyNotes.countDocuments({ requestKey: 'inflight-key-0001' }), 1);
    assert.equal(await db.aiGenerationLog.countDocuments({}), quota + 1, 'counted once');
  } finally {
    delete fakeNotes.generate;
  }
});
