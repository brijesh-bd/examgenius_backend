// Exam-specific hierarchical syllabi for every subject (no database needed).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { EXAM_SYLLABUS, SYLLABI, coverageReport, syllabusFor, syllabusOfNode, validateAll } from '../src/data/syllabusTrees/index.js';
import { getSyllabus } from '../src/services/examService.js';
import { mappingDocuments, nodeDocuments } from '../src/services/syllabusStore.js';

const RAILWAY = ['rrb_ntpc', 'rrb_group_d', 'rrb_alp', 'rrb_je', 'rrb_tech_gr1_signal', 'rrb_tech_gr3'];

test('all libraries and mappings validate; only CEN-verified exams have official nodes', () => {
  assert.deepEqual(validateAll(), []);
  for (const r of coverageReport()) {
    for (const s of r.subjects) {
      if (r.examId === 'rrb_station_master') assert.equal(s.status.unverified + s.status.draft, 0, s.subjectId);
      else if (r.examId.startsWith('ssc_')) assert.equal(s.status.unverified + s.status.draft, 0, `${r.examId}/${s.subjectId}: SSC is official or supplementary`);
      else assert.equal(s.status.official, 0, `${r.examId}/${s.subjectId}`);
    }
  }
});

test('Station Master follows CEN 08/2026 sections exactly', () => {
  assert.deepEqual(getSyllabus('rrb_station_master').subjects.map((s) => s.id), ['sm_science_math', 'sm_logical', 'sm_mental']);
  const sci = syllabusFor('rrb_station_master', 'sm_science_math');
  for (const id of ['smb.basic_science_math.mathematics.arithmetic_progression', 'smb.basic_science_math.mathematics.probability', 'smb.data_analysis.data_sufficiency']) {
    assert.equal(sci.status('rrb_station_master', id), 'official', id);
    assert.deepEqual(sci.sources('rrb_station_master', id), ['cen_08_2026']);
  }
  const log = syllabusFor('rrb_station_master', 'sm_logical');
  assert.ok(log.getNode('sml.logical_reasoning.binary_logic'));
  assert.ok(log.getNode('sml.reading_comprehension.main_idea'));
  assert.deepEqual(syllabusFor('rrb_station_master', 'sm_mental').chapters('rrb_station_master').map((c) => c.slug), ['analogy', 'series_completion', 'coding_decoding', 'ranking_arrangement']);
  // Shared Railway libraries are not mapped to Station Master.
  for (const s of ['quant', 'reasoning', 'general_awareness', 'general_science']) assert.equal(syllabusFor('rrb_station_master', s), null, s);
  // Station Master nodes never appear for other exams.
  assert.equal(syllabusFor('rrb_ntpc', 'sm_mental'), null);
});

test('each exam shows only its applicable subjects', () => {
  const ids = (e) => getSyllabus(e).subjects.map((s) => s.id);
  assert.ok(!ids('rrb_ntpc').includes('general_science'), 'NTPC: science is inside GA');
  assert.ok(!ids('rrb_alp').includes('general_awareness'), 'ALP: no GA');
  assert.ok(!ids('rrb_tech_gr1_signal').includes('general_science'));
  assert.ok(ids('rrb_tech_gr3').includes('general_science'));
  for (const e of RAILWAY) {
    for (const s of Object.keys(EXAM_SYLLABUS[e].subjects)) assert.ok(ids(e).includes(s), `${e} lists ${s}`);
  }
});

test('every exam loads its own tree; NTPC-only chapters do not leak', () => {
  const rr = (e) => syllabusFor(e, 'reasoning');
  for (const e of RAILWAY) assert.ok(rr(e).chapters(e).length > 10, e);
  assert.equal(rr('rrb_ntpc').isApplicable('rrb_ntpc', 'rr.maps_graphs'), true);
  for (const e of ['rrb_group_d', 'rrb_alp', 'rrb_je']) assert.equal(rr(e).isApplicable(e, 'rr.maps_graphs'), false, e);
  // NTPC statements: conclusion / course of action only.
  assert.equal(rr('rrb_ntpc').isApplicable('rrb_ntpc', 'rr.statements.argument'), false);
  assert.equal(rr('rrb_je').isApplicable('rrb_je', 'rr.statements.argument'), true);
  // NTPC GA contains general science; other exams' GA does not.
  assert.equal(syllabusFor('rrb_ntpc', 'general_awareness').isApplicable('rrb_ntpc', 'ga.general_science'), true);
  assert.equal(syllabusFor('rrb_je', 'general_awareness').isApplicable('rrb_je', 'ga.general_science'), false);
  // Technician Gr-III science: basic physics only.
  const gs3 = syllabusFor('rrb_tech_gr3', 'general_science');
  assert.equal(gs3.isApplicable('rrb_tech_gr3', 'gs.physics.electricity.ohm_law'), true);
  assert.equal(gs3.isApplicable('rrb_tech_gr3', 'gs.physics.light'), false);
  assert.equal(gs3.isApplicable('rrb_tech_gr3', 'gs.chemistry'), false);
  assert.equal(syllabusFor('rrb_ntpc', 'general_science'), null);
});

test('figure-based nodes are hidden from selection', () => {
  const t = syllabusFor('rrb_group_d', 'reasoning');
  assert.equal(t.isApplicable('rrb_group_d', 'rr.analogy.figure'), false);
  assert.equal(t.isApplicable('rrb_group_d', 'rr.non_verbal.figures.paper_folding'), false);
  assert.equal(t.isApplicable('rrb_group_d', 'rr.non_verbal.mirror.text_mirror'), true);
  assert.ok(!t.leafIds('rrb_group_d', 'rr.analogy').some((id) => id.includes('figure')));
});

test('selection: parent covers descendants, no duplicates, invalid ids reported', () => {
  const t = syllabusFor('rrb_je', 'reasoning');
  const r = t.resolve('rrb_je', ['rr.number_series', 'rr.number_series.task.missing_term', 'rr.maps_graphs', 'zz.x']);
  assert.deepEqual(r.selectedIds, ['rr.number_series']);
  assert.deepEqual(r.invalid, ['rr.maps_graphs', 'zz.x']);
  assert.equal(new Set(r.conceptIds).size, r.conceptIds.length);
  assert.deepEqual(t.resolve('rrb_je', ['rr.number_series.task.missing_term']).conceptIds, ['rr.number_series.task.missing_term']);
});

test('search works at every level, English and Hindi, within the exam', () => {
  const ga = syllabusFor('rrb_je', 'general_awareness');
  const types = (q) => ga.search('rrb_je', q).map((h) => h.nodeType);
  assert.ok(types('history').includes('chapter'));
  assert.ok(types('mauryan').includes('subtopic'));
  assert.ok(types('ashoka').includes('concept'));
  assert.ok(ga.search('rrb_je', 'अशोक').length > 0);
  assert.equal(syllabusFor('rrb_group_d', 'reasoning').search('rrb_group_d', 'maps').length, 0);
});

test('difficulty is automatic per exam', () => {
  assert.equal(syllabusFor('rrb_group_d', 'reasoning').difficulty('rrb_group_d'), 'easy');
  assert.equal(syllabusFor('rrb_ntpc', 'reasoning').difficulty('rrb_ntpc'), 'medium');
  assert.equal(syllabusFor('rrb_tech_gr3', 'quant').difficulty('rrb_tech_gr3'), 'easy');
});

test('stable ids; database documents are unique and deterministic', () => {
  assert.equal(syllabusOfNode('rr.analogy.number.powers.square').subjectId, 'reasoning');
  assert.equal(syllabusOfNode('gs.biology.physiology.digestive').subjectId, 'general_science');
  assert.ok(syllabusFor('rrb_group_d', 'general_science').getNode('gs.biology.physiology.digestive'));
  const docs = nodeDocuments();
  assert.equal(new Set(docs.map((d) => d._id)).size, docs.length);
  assert.deepEqual(nodeDocuments().map((d) => d.contentHash), docs.map((d) => d.contentHash));
  const maps = mappingDocuments();
  assert.equal(new Set(maps.map((m) => m._id)).size, maps.length);
  assert.ok(maps.every((m) => (m.status === 'official') === (m.classification === 'official')));
  assert.ok(maps.filter((m) => m.status === 'official').every((m) => m.examId === 'rrb_station_master' || m.examId.startsWith('ssc_')));
  assert.equal(SYLLABI.length, 16);
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

test('GET subjects marks which have trees', async () => {
  const r = await get('/syllabus/rrb_alp/subjects');
  assert.equal(r.status, 200);
  const by = Object.fromEntries(r.body.subjects.map((s) => [s.id, s]));
  assert.equal(by.reasoning.hasTree, true);
  assert.ok(by.reasoning.conceptCount > 50);
  assert.equal(by.general_awareness, undefined);
  assert.equal((await get('/syllabus/nope/subjects')).status, 404);
});

test('GET tree / children / search for any subject; statuses visible; old math paths work', async () => {
  const t = await get('/syllabus/rrb_group_d/general_science/tree');
  assert.equal(t.status, 200);
  assert.equal(t.body.difficulty, 'easy');
  assert.equal(t.body.hasOfficial, false);
  assert.deepEqual(t.body.nodes.map((n) => n.nodeId), ['gs.physics', 'gs.chemistry', 'gs.biology']);
  assert.ok(t.body.nodes.every((n) => n.status === 'unverified' && n.children.every((c) => c.status === 'draft')));
  const kids = await get('/syllabus/rrb_je/reasoning/nodes/rr.analogy/children');
  assert.ok(kids.body.children.some((c) => c.nodeId === 'rr.analogy.number'));
  assert.ok(!kids.body.children.some((c) => c.nodeId === 'rr.analogy.figure'));
  assert.equal((await get('/syllabus/rrb_ntpc/general_science/tree')).status, 404);
  assert.equal((await get('/syllabus/rrb_je/reasoning/search?q=coding')).body.results[0].nodeId, 'rr.coding_decoding');
  assert.equal((await get('/syllabus/railway/rrb_je/math/tree')).status, 200);
  assert.equal((await get('/syllabus/rrb_je/quant/tree')).status, 200);
});

test('GET Station Master tree carries official status', async () => {
  const t = await get('/syllabus/rrb_station_master/sm_mental/tree');
  assert.equal(t.status, 200);
  assert.equal(t.body.hasOfficial, true);
  assert.ok(t.body.nodes.every((n) => n.status === 'official'));
  assert.equal((await get('/syllabus/rrb_station_master/sm_logical/nodes/sml.logical_reasoning/children')).status, 200);
});
