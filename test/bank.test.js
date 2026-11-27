// Banking examinations (IBPS / SBI): catalogue, stage-wise mapping, official
// patterns, Professional Knowledge (GATE CS baseline), isolation. No database.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { examCatalog } from '../src/data/examCatalog.js';
import { getSyllabus } from '../src/services/examService.js';
import {
  BANK_EXAM_SYLLABUS, BANK_PATTERNS, BANK_SOURCES, bankExamPattern, syllabusFor, validateAll,
} from '../src/data/syllabusTrees/index.js';
import { BANKING_IT_CHAPTERS, GATE_CHAPTERS } from '../src/data/syllabusTrees/professionalIt.js';

const BANK = ['ibps_po', 'ibps_clerk', 'ibps_rrb_po', 'ibps_rrb_clerk', 'ibps_so_it', 'ibps_rrb_so_it', 'sbi_po', 'sbi_clerk'];
const subjects = (e) => getSyllabus(e).subjects.map((s) => s.id);
const stagesOf = (e, s, slug) => BANK_EXAM_SYLLABUS[e].subjects[s]?.[slug]?.stages ?? [];

test('banking catalogue: every exam has a syllabus, a pattern and a tree per mapped subject', () => {
  const ids = examCatalog.find((c) => c.id === 'banking').exams.map((e) => e.id);
  assert.deepEqual([...ids].sort(), [...BANK].sort());
  for (const e of BANK) {
    assert.ok(BANK_PATTERNS[e], `${e} pattern`);
    for (const s of Object.keys(BANK_EXAM_SYLLABUS[e].subjects)) {
      assert.ok(subjects(e).includes(s), `${e} lists ${s}`);
      assert.ok(syllabusFor(e, s), `${e}/${s} has a tree`);
    }
  }
  assert.deepEqual(validateAll(), []);
});

test('Professional Knowledge only for the IT officer exams; complete GATE CS sections', () => {
  for (const e of BANK) {
    const it = ['ibps_so_it', 'ibps_rrb_so_it'].includes(e);
    assert.equal(subjects(e).includes('professional_it'), it, e);
  }
  const pk = syllabusFor('ibps_so_it', 'professional_it');
  const chapters = pk.chapters('ibps_so_it').map((c) => c.slug);
  assert.deepEqual(chapters, [...GATE_CHAPTERS, ...BANKING_IT_CHAPTERS]);
  assert.equal(GATE_CHAPTERS.length, 10);
  // Spot-check GATE topic lines are present down to micro-concepts.
  for (const id of ['pk.compiler_design.optimisation.liveness', 'pk.computer_networks.network_layer.arp_dhcp_icmp',
    'pk.coa.io_interface.dma', 'pk.engineering_mathematics.linear_algebra.lu', 'pk.theory_of_computation.turing.undecidable']) {
    assert.ok(pk.isApplicable('ibps_so_it', id), id);
  }
  // SO IT: Professional Knowledge is Mains only; English/Reasoning/Quant Prelims only.
  assert.deepEqual(stagesOf('ibps_so_it', 'professional_it', 'dbms'), ['mains']);
  assert.deepEqual(stagesOf('ibps_so_it', 'quant', 'data_interpretation'), ['prelims']);
});

test('Computer Knowledge only where the notification names it', () => {
  assert.ok(!subjects('ibps_clerk').includes('computer'), 'CSA-XV has no Computer section');
  for (const e of ['ibps_rrb_po', 'ibps_rrb_clerk', 'sbi_po', 'sbi_clerk']) assert.ok(subjects(e).includes('computer'), e);
  // IBPS PO: only the "Digital" part of the Mains GA section.
  assert.deepEqual(Object.keys(BANK_EXAM_SYLLABUS.ibps_po.subjects.computer).sort(), ['digital_banking', 'security']);
});

test('stages never mix: Prelims has no GA; RRB has Hindi option and no Prelims English', () => {
  for (const e of ['ibps_po', 'ibps_clerk', 'ibps_rrb_po', 'ibps_rrb_clerk', 'sbi_po', 'sbi_clerk']) {
    for (const s of ['general_awareness', 'banking_awareness', 'computer', 'hindi']) {
      for (const [slug, entry] of Object.entries(BANK_EXAM_SYLLABUS[e].subjects[s] ?? {})) {
        assert.ok(!entry.stages.includes('prelims'), `${e}/${s}/${slug} not in Prelims`);
      }
    }
  }
  assert.ok(subjects('ibps_rrb_po').includes('hindi') && !subjects('ibps_po').includes('hindi'));
  assert.deepEqual(stagesOf('ibps_rrb_clerk', 'english', 'grammar'), ['mains']);
  assert.deepEqual(stagesOf('ibps_clerk', 'english', 'grammar'), ['prelims', 'mains']);
  // Descriptive only where a descriptive paper exists.
  assert.deepEqual(stagesOf('ibps_po', 'english', 'descriptive'), ['descriptive']);
  assert.deepEqual(stagesOf('sbi_clerk', 'english', 'descriptive'), []);
});

test('official figures match the notifications; nothing marked official below a section', () => {
  const sum = (e, stage, k) => BANK_PATTERNS[e].stages.find((s) => s.id === stage).sections.reduce((n, x) => n + (x[k] ?? 0), 0);
  assert.equal(sum('ibps_po', 'prelims', 'marks'), 100);
  assert.equal(sum('ibps_po', 'mains', 'questions'), 170);
  assert.equal(sum('ibps_po', 'mains', 'marks'), 200);
  assert.equal(sum('ibps_clerk', 'mains', 'questions'), 155);
  assert.equal(sum('ibps_rrb_po', 'mains', 'marks'), 200);
  assert.equal(sum('sbi_po', 'mains', 'questions'), 170);
  assert.equal(sum('sbi_clerk', 'mains', 'questions'), 190);
  assert.equal(sum('ibps_so_it', 'prelims', 'marks'), 125);
  // RRB Scale-II prints no table: not verified, everything draft.
  assert.equal(BANK_PATTERNS.ibps_rrb_so_it.verified, false);
  const pk = syllabusFor('ibps_rrb_so_it', 'professional_it');
  assert.equal(pk.status('ibps_rrb_so_it', 'pk.dbms'), 'draft');
  // Chapters are recommended coverage (IBPS/SBI print no topics), each with its notice as source.
  for (const e of BANK.filter((x) => x !== 'ibps_rrb_so_it')) {
    for (const chapters of Object.values(BANK_EXAM_SYLLABUS[e].subjects)) {
      for (const entry of Object.values(chapters)) {
        assert.equal(entry.status, 'supplementary');
        assert.ok(entry.sources.every((s) => BANK_SOURCES[s]?.type === 'official'));
      }
    }
  }
});

test('shared master topics: one node, several exams; no History for Banking', () => {
  const bq = syllabusFor('ibps_po', 'quant');
  assert.equal(bq, syllabusFor('sbi_clerk', 'quant'), 'same library object');
  assert.ok(bq.isApplicable('ibps_po', 'bq.interest.compound_interest.ci_si_difference'));
  assert.ok(bq.isApplicable('sbi_clerk', 'bq.interest.compound_interest.ci_si_difference'));
  for (const e of BANK) assert.ok(!syllabusFor(e, 'general_awareness')?.isApplicable(e, 'ga.history'), e);
});

let server;
let base;
before(async () => {
  const app = createApp({ config: { jwtSecret: 'x', ai: { maxQuestionsPerRequest: 40, generationsPerHour: 10 }, practice: {} } });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => server?.close());

test('GET /exams/:id/pattern: stage → section → subject → chapters', async () => {
  const res = await fetch(`${base}/exams/ibps_rrb_po/pattern`);
  assert.equal(res.status, 200);
  const p = await res.json();
  assert.equal(p.source.id, 'ibps_rrb_xiv');
  assert.deepEqual(p.stages.map((s) => s.id), ['prelims', 'mains', 'interview']);
  const mains = p.stages[1];
  const computer = mains.sections.find((s) => s.name === 'Computer Knowledge');
  assert.deepEqual([computer.questions, computer.marks, computer.minutes], [40, 20, 15]);
  assert.ok(computer.subjects[0].chapters.length > 0);
  const prelimsQuant = p.stages[0].sections.find((s) => s.subjectIds.includes('quant')).subjects[0].chapters;
  assert.ok(prelimsQuant.some((c) => c.nodeId === 'bq.simplification'));
  assert.equal(bankExamPattern('rrb_ntpc'), null);
  assert.equal((await fetch(`${base}/exams/rrb_ntpc/pattern`)).status, 404);
  const draft = await (await fetch(`${base}/exams/ibps_rrb_so_it/pattern`)).json();
  assert.equal(draft.verified, false);
  assert.equal(draft.stages[0].sections[0].status, 'draft');
});
