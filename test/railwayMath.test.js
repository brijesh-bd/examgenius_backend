// Railway Mathematics hierarchy, APIs and question validation.
// No MongoDB needed: the syllabus routes are pure, and generation scope is
// tested through the generator with a fake Gemini response.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import {
  NODES,
  RAILWAY_EXAM_IDS,
  chapters,
  childIds,
  examChapters,
  isApplicable,
  leafIds,
  nodeVerification,
  researchReport,
  resolveSelection,
  searchNodes,
  validateHierarchy,
} from '../src/data/railwayMath/index.js';
import { SOURCES } from '../src/data/railwayMath/sources.js';
import { mappingDocuments, nodeDocuments } from '../src/services/syllabusStore.js';
import {
  GeminiQuestionGenerator,
  GenerationError,
  SampleQuestionGenerator,
  checkAnswerConsistency,
  filterQuestions,
} from '../src/services/questionGenerator.js';
import { buildNotesPrompt } from '../src/services/notesGenerator.js';

// ── Hierarchy ───────────────────────────────────────────────────────────────

test('hierarchy is structurally valid (ids, parents, titles, patterns)', () => {
  assert.deepEqual(validateHierarchy(), []);
  for (const n of NODES.values()) {
    if (n.parentId !== 'rm') assert.ok(NODES.has(n.parentId), `${n.nodeId} parent exists`);
    assert.ok(n.nodeId.startsWith(`${n.parentId}.`), `${n.nodeId} id extends its parent id`);
    assert.ok(childIds(n.parentId).includes(n.nodeId));
  }
});

test('node ids are stable and deterministic', async () => {
  const again = await import(`../src/data/railwayMath/index.js?again=${Date.now()}`);
  assert.deepEqual([...again.NODES.keys()], [...NODES.keys()]);
  // Known ids other data depends on must never change.
  for (const id of [
    'rm.number_system.divisibility.rules.by_3',
    'rm.number_system.divisibility.rules.by_11',
    'rm.trains.crossing.stationary.crossing_platform',
    'rm.interest.compound_interest.ci.half_yearly',
  ]) {
    assert.ok(NODES.has(id), id);
  }
  const docs = nodeDocuments();
  assert.equal(new Set(docs.map((d) => d._id)).size, docs.length);
  assert.deepEqual(nodeDocuments().map((d) => d.contentHash), docs.map((d) => d.contentHash));
});

test('covers every master chapter with real depth', () => {
  const slugs = chapters().map((c) => c.slug);
  for (const s of [
    'number_system', 'bodmas_simplification', 'decimals_fractions', 'lcm_hcf', 'ratio_proportion', 'percentage',
    'average', 'profit_loss', 'interest', 'time_work', 'pipes_cisterns', 'time_speed_distance', 'trains',
    'boats_streams', 'ages', 'algebra', 'geometry', 'mensuration_2d', 'mensuration_3d', 'trigonometry',
    'statistics', 'data_interpretation', 'square_cube_root', 'calendar_clock', 'mixture_alligation',
    'partnership', 'approximation',
  ]) {
    assert.ok(slugs.includes(s), s);
    assert.ok(leafIds(`rm.${s}`).length >= 4, `${s} has concepts`);
  }
  const div = childIds('rm.number_system.divisibility.rules').map((id) => NODES.get(id).titleEn);
  for (const n of [2, 3, 4, 5, 6, 8, 9, 10, 11]) assert.ok(div.includes(`Divisibility by ${n}`));
});

test('reasoning number series is not part of Mathematics', () => {
  for (const n of NODES.values()) assert.doesNotMatch(n.titleEn, /series/i, n.nodeId);
});

test('every node has a verification status; nothing is OFFICIAL without official evidence', () => {
  const official = SOURCES.some((s) => s.type === 'official');
  for (const n of NODES.values()) {
    const v = nodeVerification(n.nodeId);
    assert.ok(['official', 'unverified', 'draft'].includes(v.verificationStatus));
    if (!official) assert.notEqual(v.verificationStatus, 'official');
    if (n.nodeType !== 'chapter') assert.notEqual(v.verificationStatus, 'unverified');
  }
  const report = researchReport();
  assert.equal(report.problems.length, 0);
  assert.ok(report.failedSources.length > 0, 'failed sources stay visible');
});

// ── Exam applicability ──────────────────────────────────────────────────────

test('exam applicability follows the evidence', () => {
  assert.deepEqual(RAILWAY_EXAM_IDS, ['rrb_ntpc', 'rrb_group_d', 'rrb_alp', 'rrb_je', 'rrb_tech_gr1_signal', 'rrb_tech_gr3']);
  // NTPC lists Calendar & Clock under Reasoning.
  assert.equal(isApplicable('rrb_ntpc', 'rm.calendar_clock'), false);
  assert.equal(isApplicable('rrb_ntpc', 'rm.calendar_clock.clock.clock.angle_between_hands'), false);
  for (const e of ['rrb_group_d', 'rrb_alp', 'rrb_je']) assert.equal(isApplicable(e, 'rm.calendar_clock'), true);
  for (const e of RAILWAY_EXAM_IDS) assert.equal(isApplicable(e, 'rm.percentage'), true);
  assert.equal(examChapters('ssc_cgl'), null);
  // Database mapping: one document per exam × included node, unique.
  const maps = mappingDocuments().filter((m) => m.subjectId === 'quant');
  assert.equal(new Set(maps.map((m) => m._id)).size, maps.length);
  assert.ok(!maps.some((m) => m.examId === 'rrb_ntpc' && m.nodeId.startsWith('rm.calendar_clock')));
  assert.ok(maps.every((m) => ['official', 'unverified', 'draft'].includes(m.status) && m.status !== 'official'));
  assert.ok(chapters().length > 0);
});

// ── Selection resolution ────────────────────────────────────────────────────

test('parent selection expands to concepts without duplicates', () => {
  const r = resolveSelection('rrb_ntpc', [
    'rm.number_system.divisibility',
    'rm.number_system.divisibility.rules.by_3', // already inside the topic
    'rm.number_system.divisibility',
  ]);
  assert.deepEqual(r.invalid, []);
  assert.deepEqual(r.selectedIds, ['rm.number_system.divisibility']);
  assert.equal(r.conceptIds.length, new Set(r.conceptIds).size);
  assert.deepEqual(r.conceptIds, leafIds('rm.number_system.divisibility'));
});

test('invalid and out-of-exam node ids are reported', () => {
  const r = resolveSelection('rrb_ntpc', ['rm.nope', 'quant.percentage', 'rm.calendar_clock', 'rm.percentage.basics']);
  assert.deepEqual(r.invalid, ['rm.nope', 'quant.percentage', 'rm.calendar_clock']);
  assert.ok(r.conceptIds.length > 0);
});

test('search matches English and Hindi titles within the exam', () => {
  assert.ok(searchNodes('rrb_je', 'divisibility by 11').some((h) => h.nodeId.endsWith('by_11')));
  assert.ok(searchNodes('rrb_je', 'विभाज्यता').length > 0);
  assert.equal(searchNodes('rrb_ntpc', 'Calendar').some((h) => h.nodeId.startsWith('rm.calendar_clock')), false);
  assert.deepEqual(searchNodes('rrb_je', '   '), []);
});

// ── HTTP API (no database involved) ─────────────────────────────────────────

let server;
let base;
before(async () => {
  const app = createApp({ config: { jwtSecret: 'x', ai: { maxQuestionsPerRequest: 40, generationsPerHour: 10 }, practice: {} } });
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => server?.close());

const get = async (path) => {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.json() };
};

test('GET railway exams and chapters', async () => {
  const exams = await get('/syllabus/railway/exams');
  assert.equal(exams.status, 200);
  assert.deepEqual(exams.body.exams.map((e) => e.id), RAILWAY_EXAM_IDS);
  const ntpc = await get('/syllabus/railway/rrb_ntpc/math');
  assert.equal(ntpc.status, 200);
  assert.equal(ntpc.body.subjectId, 'quant');
  assert.ok(ntpc.body.chapters.every((c) => c.titleEn && c.titleHi && c.nodeType === 'chapter'));
  assert.ok(!ntpc.body.chapters.some((c) => c.nodeId === 'rm.calendar_clock'));
  // Internal research data is not exposed to students.
  assert.ok(!JSON.stringify(ntpc.body).includes('verificationStatus'));
  assert.equal((await get('/syllabus/railway/ssc_cgl/math')).status, 404);
});

test('GET children, tree, search, applicability', async () => {
  const kids = await get('/syllabus/railway/rrb_je/math/nodes/rm.number_system/children');
  assert.equal(kids.status, 200);
  assert.ok(kids.body.children.some((c) => c.nodeId === 'rm.number_system.divisibility'));
  assert.equal((await get('/syllabus/railway/rrb_je/math/nodes/rm.unknown/children')).status, 404);
  assert.equal((await get('/syllabus/railway/rrb_je/math/nodes/DROP%20TABLE/children')).status, 400);
  const tree = await get('/syllabus/railway/rrb_alp/math/tree?nodeId=rm.trains');
  assert.equal(tree.body.nodes[0].children.length, childIds('rm.trains').length);
  const search = await get('/syllabus/railway/rrb_group_d/math/search?q=pipes');
  assert.ok(search.body.results.length > 0);
  assert.equal((await get('/syllabus/railway/rrb_group_d/math/search?q=')).status, 400);
  const app = await get('/syllabus/railway/rrb_ntpc/math/applicability');
  assert.equal(app.body.chapters.find((c) => c.chapterId === 'rm.calendar_clock').applicable, false);
});

test('POST resolve expands and rejects invalid ids', async () => {
  const post = (body) =>
    fetch(`${base}/syllabus/railway/rrb_ntpc/math/resolve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  const ok = await (await post({ nodeIds: ['rm.lcm_hcf.methods', 'rm.lcm_hcf.methods.methods.division_method'] })).json();
  assert.deepEqual(ok.conceptIds, leafIds('rm.lcm_hcf.methods'));
  const bad = await post({ nodeIds: ['rm.calendar_clock'] });
  assert.equal(bad.status, 400);
  assert.deepEqual((await bad.json()).details.invalid, ['rm.calendar_clock']);
});

// ── Question generation scope + validation ──────────────────────────────────

const scopedTopics = [
  {
    id: 'quant.number_system',
    name: 'Number System',
    subjectName: 'Mathematics',
    concepts: [
      { nodeId: 'rm.number_system.divisibility.rules.by_3', name: 'Divisibility by 3', path: 'Divisibility', patterns: ['Find the missing digit'] },
    ],
  },
];
const q = (over = {}) => ({
  topicId: 'quant.number_system',
  nodeId: 'rm.number_system.divisibility.rules.by_3',
  question: 'Which digit in place of * makes 52*4 divisible by 3?',
  options: ['1', '2', '4', '5'],
  correctIndex: 0,
  explanation: '5 + 2 + 4 = 11; 11 + 1 = 12 is divisible by 3, so the digit is 1.',
  steps: [],
  concept: 'Divisibility by 3',
  tip: 'Add digits',
  wrongReasons: ['', 'x', 'y', 'z'],
  ...over,
});

test('generation keeps only in-scope, consistent, unique questions', () => {
  const kept = filterQuestions(
    [
      q(),
      q({ nodeId: 'rm.number_system.divisibility.rules.by_9', question: 'Out of scope?' }), // other concept
      q({ nodeId: undefined, question: 'No node?' }),
      q(), // duplicate
      q({ question: 'Wrong key?', correctIndex: 2, explanation: 'Sum 11 + 1 = 12, so the digit is 1.' }),
      q({ question: 'Repeated options?', options: ['1', '1', '4', '5'] }),
    ],
    scopedTopics,
  );
  assert.equal(kept.length, 1);
  assert.equal(kept[0].nodeId, 'rm.number_system.divisibility.rules.by_3');
});

test('answer consistency check', () => {
  assert.deepEqual(checkAnswerConsistency({ options: ['12', '15', '18', '20'], correctIndex: 1, explanation: '3 × 5 = 15.', steps: [] }), []);
  assert.ok(checkAnswerConsistency({ options: ['12', '15', '18', '20'], correctIndex: 1, explanation: '3 × 6 = 18.', steps: [] }).length > 0);
  assert.deepEqual(
    checkAnswerConsistency({ options: ['₹1,200', '₹1,500', '₹1,800', '₹2,000'], correctIndex: 0, explanation: 'SI = 10000 × 4 × 3 / 100 = ₹1,200', steps: [] }),
    [],
  );
  assert.deepEqual(checkAnswerConsistency({ options: ['Mumbai', 'Delhi', 'Pune', 'Agra'], correctIndex: 0, explanation: 'Fact.', steps: [] }), []);
});

test('Gemini generator: concept prompt, nodeId on questions, top-up after rejects', async () => {
  const calls = [];
  const responses = [
    { questions: [q(), q({ question: 'Bad key?', correctIndex: 3 })] },
    { questions: [q({ question: 'Which digit makes 71*2 divisible by 3?', explanation: '7 + 1 + 2 = 10; 10 + 2 = 12, digit 2.', options: ['2', '3', '4', '6'] })] },
  ];
  const fetchImpl = async (_url, init) => {
    calls.push(JSON.parse(init.body).contents[0].parts[0].text);
    const json = responses[calls.length - 1];
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }] }) };
  };
  const gen = new GeminiQuestionGenerator({ geminiApiKey: 'k', geminiModels: ['m'], timeoutMs: 1000 }, fetchImpl, {});
  const out = await gen.generate({ exam: { id: 'rrb_ntpc', name: 'RRB NTPC' }, topics: scopedTopics, difficulty: 'medium', count: 2, language: 'en' });
  assert.match(calls[0], /nodeId rm\.number_system\.divisibility\.rules\.by_3/);
  assert.match(calls[0], /Find the missing digit/);
  assert.equal(calls.length, 2, 'one top-up call for the rejected question');
  assert.equal(out.questions.length, 2);
  assert.ok(out.questions.every((x) => x.nodeId === 'rm.number_system.divisibility.rules.by_3' && x.validation.status === 'passed'));
});

test('sample generator never serves unscoped questions for a concept request', async () => {
  await assert.rejects(
    new SampleQuestionGenerator().generate({ topics: scopedTopics, difficulty: 'medium', count: 5 }),
    GenerationError,
  );
});

test('study notes prompt is limited to the selected concept', () => {
  const prompt = buildNotesPrompt({
    exam: { name: 'RRB JE' },
    subject: { name: 'Mathematics' },
    topic: { name: 'Number System › Divisibility by 11' },
    concept: { path: 'Number System › Divisibility › Divisibility Rules › Divisibility by 11', patterns: ['Find the missing digit'] },
    language: 'hi',
    level: 'exam',
    sections: ['formulas'],
  });
  assert.match(prompt, /ONE syllabus concept/);
  assert.match(prompt, /Find the missing digit/);
  assert.match(prompt, /common mistakes/);
  assert.match(prompt, /Hindi/);
});
