// SSC examinations: catalogue, exam-wise mapping, official coverage audit,
// provenance, isolation and generation scope. No database needed.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { examCatalog } from '../src/data/examCatalog.js';
import { getSyllabus } from '../src/services/examService.js';
import { SSC_EXAM_SYLLABUS, SSC_SOURCES, syllabusFor, validateAll } from '../src/data/syllabusTrees/index.js';
import { mappingDocuments, nodeDocuments } from '../src/services/syllabusStore.js';
import { GeminiQuestionGenerator } from '../src/services/questionGenerator.js';

const SSC = ['ssc_cgl', 'ssc_chsl', 'ssc_mts', 'ssc_gd', 'ssc_cpo', 'ssc_je', 'ssc_steno', 'ssc_sp_matric', 'ssc_sp_hsc', 'ssc_sp_grad'];
const subjects = (e) => getSyllabus(e).subjects.map((s) => s.id);
const tree = (e, s) => syllabusFor(e, s);
const official = (e, s, id) => tree(e, s)?.status(e, id) === 'official';

test('SSC catalogue lists every examination with a syllabus and a tree per subject', () => {
  const ssc = examCatalog.find((c) => c.id === 'ssc').exams.map((e) => e.id);
  assert.deepEqual(ssc, SSC);
  for (const e of SSC) {
    assert.ok(getSyllabus(e), e);
    for (const s of Object.keys(SSC_EXAM_SYLLABUS[e].subjects)) assert.ok(subjects(e).includes(s), `${e} lists ${s}`);
    for (const s of subjects(e)) assert.ok(tree(e, s), `${e}/${s} has a tree`);
  }
  assert.deepEqual(validateAll(), []);
});

test('exam-specific subjects (no identical lists)', () => {
  assert.ok(subjects('ssc_cgl').includes('computer') && subjects('ssc_cgl').includes('statistics') && subjects('ssc_cgl').includes('finance_economics'));
  assert.ok(subjects('ssc_chsl').includes('computer') && !subjects('ssc_chsl').includes('statistics'));
  assert.ok(!subjects('ssc_gd').includes('computer') && !subjects('ssc_mts').includes('computer'));
  assert.deepEqual(subjects('ssc_je'), ['reasoning', 'general_awareness', 'je_civil', 'je_electrical', 'je_mechanical']);
  assert.deepEqual(subjects('ssc_steno'), ['reasoning', 'general_awareness', 'english']);
  assert.ok(!subjects('ssc_je').includes('quant') && !subjects('ssc_steno').includes('quant'));
});

test('coverage audit: every item named in each notice is present and official', () => {
  const must = {
    ssc_cgl: {
      quant: ['sq.arithmetic.mixture_alligation', 'sq.algebra.linear_graphs', 'sq.geometry.circle_chords_tangents', 'sq.mensuration.solids', 'sq.trigonometry.degree_radian', 'sq.statistics.probability', 'sq.statistics.standard_deviation'],
      reasoning: ['sr.semantic_analogy', 'sr.indexing', 'sr.address_matching', 'sr.date_city_matching', 'sr.centre_codes', 'sr.small_capital_coding', 'sr.critical_thinking', 'sr.emotional_intelligence', 'sr.social_intelligence', 'sr.word_building', 'sr.trends'],
      english: ['en.vocabulary.synonyms', 'en.vocabulary.spelling', 'en.grammar.voice', 'en.grammar.narration', 'en.sentence_structure.rearrangement', 'en.comprehension.cloze', 'en.comprehension.reading'],
      computer: ['ck.computer_basics.ports', 'ck.software.ms_excel', 'ck.internet_email.e_banking', 'ck.networking_security.threats'],
      statistics: ['st.moments', 'st.anova', 'st.index_numbers'],
      finance_economics: ['fe.economics_governance.cag', 'fe.accounts.basic_accounting.bills_ledgers'],
    },
    ssc_mts: {
      quant: ['sq.number_systems.integers_whole', 'sq.number_systems.lcm_hcf', 'sq.number_systems.bodmas', 'sq.arithmetic.direct_inverse', 'sq.geometry.lines_angles', 'sq.mensuration.area_perimeter_basic', 'sq.statistics.tables_graphs', 'sq.arithmetic.square_roots'],
      reasoning: ['sr.alpha_numeric_series', 'sr.following_directions', 'sr.jumbling', 'sr.age_calculations', 'sr.calendar_clock'],
      general_awareness: ['ga.history', 'ga.polity', 'ga.general_science', 'ga.geography.environment'],
    },
    ssc_gd: { quant: ['sq.arithmetic.ratio_time', 'sq.mensuration'], reasoning: ['sr.relationship_concepts', 'sr.arithmetical_reasoning'], general_awareness: ['ga.polity', 'ga.static_gk.sports'] },
    ssc_cpo: { english: ['en.sentence_structure.completion', 'en.grammar.error_detection'], quant: ['sq.trigonometry.degree_radian'] },
    ssc_je: { je_civil: ['jc.surveying.levelling', 'jc.transportation.traffic'], je_electrical: ['jl.power_electronics.dc_dc'], je_mechanical: ['jm.thermal.ic_engines'] },
    ssc_sp_matric: { quant: ['sq.statistics.tables_graphs', 'sq.arithmetic.ratio_time'] },
    ssc_sp_hsc: { quant: ['sq.geometry.elementary_figures', 'sq.statistics.statistical_charts'] },
  };
  for (const [e, bySubject] of Object.entries(must)) {
    for (const [s, ids] of Object.entries(bySubject)) for (const id of ids) assert.ok(official(e, s, id), `${e}/${s}: ${id} official`);
  }
});

test('no copying between exams: items appear only where their notice lists them', () => {
  assert.equal(tree('ssc_mts', 'reasoning').isApplicable('ssc_mts', 'sr.indexing'), false);
  assert.equal(tree('ssc_cgl', 'reasoning').isApplicable('ssc_cgl', 'sr.following_directions'), false);
  assert.equal(tree('ssc_cgl', 'quant').isApplicable('ssc_cgl', 'sq.geometry.lines_angles'), false);
  assert.equal(tree('ssc_cpo', 'quant').isApplicable('ssc_cpo', 'sq.statistics.probability'), false); // CPO = CGL Tier-I list
  assert.equal(tree('ssc_chsl', 'quant').isApplicable('ssc_chsl', 'sq.trigonometry.degree_radian'), false);
  assert.equal(tree('ssc_mts', 'general_awareness').isApplicable('ssc_mts', 'ga.current_affairs'), false);
  // Railway reasoning/maths trees never serve SSC, and vice versa.
  assert.equal(tree('ssc_cgl', 'reasoning').prefix, 'sr');
  assert.equal(tree('rrb_ntpc', 'reasoning').prefix, 'rr');
  assert.equal(tree('rrb_ntpc', 'quant').prefix, 'rm');
  assert.equal(tree('ssc_cgl', 'quant').prefix, 'sq');
});

test('JE disciplines are separate trees with no shared nodes', () => {
  const ids = (s) => new Set(tree('ssc_je', s).nodes.keys());
  const [c, e, m] = [ids('je_civil'), ids('je_electrical'), ids('je_mechanical')];
  for (const id of c) assert.ok(!e.has(id) && !m.has(id));
  for (const id of e) assert.ok(!m.has(id));
  assert.equal(tree('ssc_je', 'je_civil').resolve('ssc_je', ['jl.machines']).invalid.length, 1);
});

test('figure-only items are hidden; official vs supplementary is explicit', () => {
  const r = tree('ssc_cgl', 'reasoning');
  for (const id of ['sr.figural_analogy', 'sr.embedded_figures', 'sr.punched_hole', 'sr.space_visualization']) assert.equal(r.isApplicable('ssc_cgl', id), false, id);
  assert.equal(r.status('ssc_cgl', 'sr.number_series.question_type.missing_term'), 'supplementary');
  assert.equal(tree('ssc_gd', 'english').status('ssc_gd', 'en.vocabulary'), 'supplementary');
  assert.equal(tree('ssc_gd', 'english').status('ssc_gd', 'en.comprehension'), 'official');
});

test('provenance: every SSC official mapping cites an ssc.gov.in notice', () => {
  for (const s of Object.values(SSC_SOURCES)) assert.match(s.url, /^https:\/\/ssc\.gov\.in\//);
  const maps = mappingDocuments().filter((m) => m.examId.startsWith('ssc_'));
  assert.ok(maps.length > 1000);
  for (const m of maps) {
    assert.ok(m.sourceReferences.every((r) => SSC_SOURCES[r]), `${m._id} cites ${m.sourceReferences}`);
    assert.ok(['official', 'supplementary'].includes(m.status), m._id);
  }
  // Seeds are deterministic (idempotent upserts by stable _id).
  assert.deepEqual(nodeDocuments().map((d) => d._id), nodeDocuments().map((d) => d._id));
});

test('generation prompt: exam pattern, concept scope, no PYQ claim (fake Gemini)', async () => {
  let prompt = '';
  let system = '';
  const fetchImpl = async (_u, init) => {
    const body = JSON.parse(init.body);
    prompt = body.contents[0].parts[0].text;
    system = body.systemInstruction.parts[0].text;
    const q = { topicId: 'reasoning.analogy', nodeId: 'sr.semantic_analogy', question: 'Doctor : Hospital :: Teacher : ?', options: ['School', 'Book', 'Chalk', 'Student'], correctIndex: 0, explanation: 'A teacher works in a school.', steps: [], concept: 'c', tip: 't', wrongReasons: ['', 'a', 'b', 'c'] };
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ questions: [q] }) }] } }] }) };
  };
  const gen = new GeminiQuestionGenerator({ geminiApiKey: 'k', geminiModels: ['m'], timeoutMs: 1000 }, fetchImpl, {});
  const out = await gen.generate({
    exam: { id: 'ssc_cgl', name: 'SSC CGL', scheme: 'Tier-I: Reasoning, GA, Quant, English' },
    topics: [{ id: 'reasoning.analogy', name: 'Semantic Analogy', subjectName: 'Reasoning', concepts: [{ nodeId: 'sr.semantic_analogy', name: 'Semantic Analogy', path: '', patterns: [] }] }],
    difficulty: 'hard',
    count: 1,
    language: 'en',
  });
  assert.match(prompt, /Exam pattern \(official notice\): Tier-I/);
  assert.match(prompt, /nodeId sr\.semantic_analogy/);
  assert.match(system, /Never claim or imply that a question is from a previous year/);
  assert.match(system, /plain-text table/);
  assert.equal(out.questions[0].nodeId, 'sr.semantic_analogy');
});

// ── HTTP ─────────────────────────────────────────────────────────────────────
let server;
let base;
before(async () => {
  const app = createApp({ config: { jwtSecret: 'x', ai: { maxQuestionsPerRequest: 40, generationsPerHour: 10 }, practice: {} } });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => server?.close());
const get = async (p) => {
  const res = await fetch(base + p);
  return { status: res.status, body: await res.json() };
};

test('SSC syllabus APIs: subjects, trees, search, resolve; railway alias refuses SSC', async () => {
  const subs = await get('/syllabus/ssc_je/subjects');
  assert.ok(subs.body.subjects.every((s) => s.hasTree));
  const t = await get('/syllabus/ssc_mts/quant/tree');
  assert.equal(t.status, 200);
  assert.equal(t.body.hasOfficial, true);
  assert.equal(t.body.difficulty, 'easy');
  const s = await get('/syllabus/ssc_cgl/reasoning/search?q=address');
  assert.equal(s.body.results[0].nodeId, 'sr.address_matching');
  const r = await fetch(`${base}/syllabus/ssc_cgl/quant/resolve`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nodeIds: ['sq.arithmetic', 'sq.arithmetic.discount', 'sq.geometry.lines_angles'] }),
  });
  assert.equal(r.status, 400); // lines_angles is MTS-only
  assert.equal((await get('/syllabus/railway/ssc_cgl/math')).status, 404);
  assert.equal((await get('/syllabus/ssc_je/je_civil/nodes/jc.surveying/children')).status, 200);
});
