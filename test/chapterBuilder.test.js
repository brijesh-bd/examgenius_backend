// Chapter Builder: AI chapter index (Phase 1) → admin review → part-by-part
// learning (Phase 2/4) → LEARNING_COMPLETED. Fake AI; needs MongoDB.
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
import { AiOutlineStore } from '../src/services/aiOutlineStore.js';
import { checkSection, buildSectionPrompt } from '../src/services/sectionGenerator.js';
import { buildIndexPrompt, checkIndex, syllabusScope } from '../src/services/outlineGenerator.js';
import { findOutline, setAiOutlines } from '../src/data/outlines/index.js';
import { GenerationError } from '../src/services/questionGenerator.js';

// ── Pure: validation rules ──────────────────────────────────────────────────
const rawIndex = () => ({
  title: 'Percentage',
  overview: 'Percentage for bank exams. See page 12 of the book.',
  objectives: ['Convert fractions', 'Solve successive change'],
  revisionPlan: ['Revise fraction table', 'Timed practice'],
  chapters: [
    { id: 'Basics!', title: 'Basics', description: 'Foundations', parts: [
      { id: 'fraction_percent', title: 'Fraction–Percentage Conversion', level: 'basic', concepts: ['1/8 = 12.5%'], includes: ['formulas'] },
      { id: 'change', title: 'Percentage Increase / Decrease', level: 'basic', concepts: ['change'], includes: ['solved problems'] },
    ] },
    { id: 'applications', title: 'Applications', description: '', parts: [
      { id: 'successive', title: 'Successive Percentage Change', level: 'advanced', concepts: ['a+b+ab/100'], includes: ['shortcuts'] },
      { id: 'dup', title: 'percentage increase / decrease', level: 'intermediate', concepts: [], includes: [] },
      { id: 'population', title: 'Population and Depreciation', level: 'basic', concepts: ['growth'], includes: [] },
    ] },
  ],
});

test('checkIndex: snake_case ids, duplicates dropped, page references removed, order flagged, draft', () => {
  const { outline, warnings } = checkIndex(rawIndex(), { unitId: 'quant.percentage' });
  assert.equal(outline.status, 'draft');
  assert.equal(outline.source, 'ai');
  assert.equal(outline.chapters[0].id, 'basics');
  assert.equal(outline.chapters.flatMap((c) => c.sections).length, 4, 'case-insensitive duplicate part dropped');
  assert.ok(!/page\s*12/i.test(outline.overview));
  assert.ok(warnings.some((w) => w.includes('page reference')));
  assert.ok(warnings.some((w) => w.includes('Population and Depreciation')), 'advanced → basic step flagged');
  assert.throws(() => checkIndex({ chapters: [] }, { unitId: 'x' }), GenerationError);
});

test('syllabus scope: verified tree nodes of that exam and stage feed the index prompt', () => {
  const scope = syllabusScope('ibps_po', 'quant', 'quant.percentage');
  assert.ok(scope.some((l) => l.nodeId === 'bq.percentage.applications.successive'));
  assert.ok(scope.every((l) => l.status === 'supplementary'));
  assert.deepEqual(syllabusScope('ibps_po', 'quant', 'quant.data_sufficiency', { stage: 'prelims' }), [], 'DS is Mains-only');
  const prompt = buildIndexPrompt({
    exam: { name: 'IBPS PO' }, subject: { name: 'Quantitative Aptitude' },
    item: { topicName: 'Percentage' }, stage: 'prelims', scope,
  });
  assert.ok(prompt.includes('Successive Percentage Change [supplementary]'));
  assert.ok(prompt.includes('stage: prelims'));
  const { warnings } = checkIndex({ ...rawIndex() }, { unitId: 'quant.percentage', scope });
  assert.ok(warnings.some((w) => w.startsWith('scope items not named')), 'missing scope reported');
});

test('part plan reaches the section prompt only for AI parts (curated prompts unchanged)', () => {
  const base = { exam: { name: 'X' }, subject: { id: 'quant', name: 'Q' }, outline: { unitId: 'quant.percentage', title: 'P' }, language: 'en', mode: 'complete' };
  const curated = { id: 's', title: 'S' };
  const ai = { id: 's', title: 'S', level: 'advanced', concepts: ['a+b+ab/100'], includes: ['shortcuts'] };
  const p1 = buildSectionPrompt({ ...base, chapter: { title: 'C', sections: [curated] }, section: curated });
  const p2 = buildSectionPrompt({ ...base, chapter: { title: 'C', sections: [ai] }, section: ai });
  assert.ok(!p1.includes("THIS PART'S PLAN"));
  assert.ok(p2.includes('a+b+ab/100') && p2.includes('Level: advanced') && p2.includes('knowledge check'));
});

// ── HTTP flow ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const DB = 'examgenius_test_chapter_builder';
const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  notes: { showDraftOutlines: true },
  ai: { geminiApiKey: '', geminiModels: [], maxQuestionsPerRequest: 40, generationsPerHour: 500, notesPerHour: 500 },
  practice: { secondsPerQuestion: 60, correctMark: 1, negativeMark: 0.25 },
  plans: {
    free: { setsPerDay: 1000, aiSetsPerDay: null, maxQuestionsPerSet: 30, maxSaved: 1000, customCount: false },
    pro: { questionsPerDay: 300, aiSetsPerDay: null, maxQuestionsPerSet: 40, customCount: true },
    trialDays: 7,
    offers: [],
  },
};

const para = 'Percentage means per hundred and is used to compare quantities on a common base in every bank exam question. '.repeat(30);
const sectionContent = (mode) => ({
  overview: 'Overview of the part.',
  objectives: ['Understand the idea'],
  explanation: [1, 2, 3, 4].map((i) => ({ heading: `H${i}`, body: para })),
  concepts: [{ term: 'Percent', definition: 'Per hundred' }],
  examples: [{ problem: '20% of 50?', steps: ['50 × 20/100'], answer: '10' }],
  stepByStep: [], diagrams: [], flowcharts: [], graphs: [], tables: [], codeExamples: [],
  formulas: [{ name: 'Percent', expression: 'x/y × 100', meaning: 'x part, y whole' }],
  tips: ['Use fractions'], mistakes: ['Wrong base'], keyPoints: ['Base matters'], quickRevision: ['x/y × 100'],
  mcqs: Array.from({ length: 8 }, (_, i) => ({ question: `Q${i}?`, options: ['a', 'b', 'c', 'd'], correctIndex: 1, explanation: 'b' })),
  nextTopics: [], timeline: [],
  keyFacts: Array.from({ length: 12 }, (_, i) => `Fact ${i}: ${para.split(' ').slice(0, 20).join(' ')}`),
});
const fakeSections = {
  calls: 0,
  async generate({ section, mode }) {
    this.calls++;
    const { content, quality } = checkSection(sectionContent(mode, section.id), mode);
    return { content, quality, model: 'fake-section' };
  },
};
const fakeIndex = {
  calls: 0,
  async generate({ item, scope }) {
    this.calls++;
    return { ...checkIndex(rawIndex(), { unitId: item.id, scope }), model: 'fake-index' };
  },
};

let db;
let server;
let base;
let store;
before(async () => {
  const fresh = await connectDb({ uri: MONGO_URI, db: DB });
  await fresh.db.dropDatabase();
  await fresh.client.close();
  db = await connectDb({ uri: MONGO_URI, db: DB });
  store = new AiOutlineStore(db);
  await store.refresh();
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
    sectionGenerator: fakeSections,
    notesGenerator: { generate: async () => { throw new Error('unused'); } },
    aiOutlines: store,
    outlineGenerator: fakeIndex,
  });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  server?.close();
  setAiOutlines([]);
  await db.db.dropDatabase();
  await db.client.close();
});

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}
const register = async (mobile, email) =>
  (await call('POST', '/auth/register', { name: 'Test User', mobile, email, password: 'password123', targetExamId: 'ibps_po' })).body.token;

test('index → pending review → approve → learn part by part → LEARNING_COMPLETED', async () => {
  const student = await register('9100000001', 's1@example.com');
  const admin = await register('9100000002', 'a1@example.com');
  await db.users.updateOne({ mobile: '9100000002' }, { $set: { role: 'admin' } });
  const unit = 'quant.percentage';

  // No outline yet.
  assert.equal((await call('GET', `/notes/outlines/ibps_po/${unit}`, undefined, student)).body.code, 'NO_OUTLINE');

  // Phase 1: index built once, saved as a draft; the student cannot open it.
  const made = await call('POST', `/notes/outlines/ibps_po/${unit}/index`, { stage: 'prelims' }, student);
  assert.equal(made.status, 201);
  assert.equal(made.body.status, 'pending_review');
  assert.equal(made.body.totalParts, 4);
  assert.equal(made.body.outline, undefined, 'students do not get the unreviewed index');
  const again = await call('POST', `/notes/outlines/ibps_po/${unit}/index`, {}, student);
  assert.equal(again.status, 200);
  assert.equal(fakeIndex.calls, 1, 'never generated twice');
  assert.equal((await call('GET', `/notes/outlines/ibps_po/${unit}`, undefined, student)).body.code, 'OUTLINE_PENDING_REVIEW');
  assert.equal(findOutline(unit), null, 'hidden from students');

  // Review queue (admins only) → approve.
  assert.equal((await call('GET', '/admin/outlines', undefined, student)).status, 403);
  const queue = await call('GET', '/admin/outlines', undefined, admin);
  assert.deepEqual(queue.body.items.map((d) => d._id), [unit]);
  assert.ok(queue.body.items[0].validationWarnings.length > 0);
  assert.equal((await call('POST', `/admin/outlines/${unit}/review`, { action: 'approve' }, admin)).body.status, 'approved');

  // Phase 2/4: one part at a time, continue points at the next incomplete part.
  let o = (await call('GET', `/notes/outlines/ibps_po/${unit}`, undefined, student)).body;
  assert.equal(o.source, 'ai_reviewed');
  assert.equal(o.total, 4);
  assert.equal(o.completionStatus, 'NOT_STARTED');
  assert.deepEqual(o.revisionPlan, ['Revise fraction table', 'Timed practice']);
  const before = fakeSections.calls;
  for (let i = 0; i < o.total; i++) {
    const next = o.continue;
    assert.ok(next, `part ${i + 1} to continue`);
    const req = { examId: 'ibps_po', unitId: unit, chapterId: next.chapterId, sectionId: next.sectionId, language: 'en', mode: 'complete' };
    assert.equal((await call('POST', '/notes/sections/generate', req, student)).status, 201);
    assert.equal(fakeSections.calls, before + i + 1, 'only the requested part is generated');
    assert.equal((await call('PUT', '/notes/sections/progress', { ...req, completed: true }, student)).status, 200);
    o = (await call('GET', `/notes/outlines/ibps_po/${unit}`, undefined, student)).body;
    if (i < o.total - 1) assert.equal(o.completionStatus, 'IN_PROGRESS');
  }
  assert.equal(o.completionStatus, 'LEARNING_COMPLETED');
  assert.equal(o.coverageComplete, true);
  assert.equal(o.continue, null, 'no extra parts after completion');
});

test('rejected index can be rebuilt; bad edits are refused; unknown topic 404', async () => {
  const admin = await register('9100000003', 'a2@example.com');
  await db.users.updateOne({ mobile: '9100000003' }, { $set: { role: 'admin' } });
  const unit = 'quant.average';
  assert.equal((await call('POST', `/notes/outlines/ibps_po/${unit}/index`, {}, admin)).status, 201);
  const bad = await call('POST', `/admin/outlines/${unit}/review`, { action: 'approve', outline: { chapters: [{ id: 'Bad Id', sections: [] }] } }, admin);
  assert.equal(bad.status, 400);
  assert.equal((await call('POST', `/admin/outlines/${unit}/review`, { action: 'reject', comment: 'too shallow' }, admin)).body.status, 'rejected');
  const rebuilt = await call('POST', `/notes/outlines/ibps_po/${unit}/index`, {}, admin);
  assert.equal(rebuilt.status, 201);
  assert.equal((await store.get(unit)).version, 2);
  assert.equal((await call('POST', '/notes/outlines/ibps_po/quant.nope/index', {}, admin)).status, 404);
  // A curated outline is never replaced by an AI index.
  const curated = await call('POST', '/notes/outlines/ssc_cgl/general_awareness.history.ancient/index', {}, admin);
  assert.equal(curated.body.source, 'curated');
});
