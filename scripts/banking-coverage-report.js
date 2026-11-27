// Writes syllabus-drafts/banking-coverage.md from the live syllabus data (never edited by hand).
//   npm run banking-coverage
import fs from 'node:fs';
import { examCatalog } from '../src/data/examCatalog.js';
import { getSyllabus } from '../src/services/examService.js';
import { BANK_EXAM_SYLLABUS, BANK_PATTERNS, BANK_SOURCES, syllabusFor } from '../src/data/syllabusTrees/index.js';

const EXAMS = examCatalog.find((c) => c.id === 'banking').exams;
// Work order: Scale-II IT first, then SO IT, then the rest.
const ORDER = ['ibps_rrb_so_it', 'ibps_so_it', 'ibps_po', 'ibps_clerk', 'ibps_rrb_po', 'ibps_rrb_clerk', 'sbi_po', 'sbi_clerk'];
const exams = ORDER.map((id) => EXAMS.find((e) => e.id === id)).filter(Boolean);
const name = (id) => EXAMS.find((e) => e.id === id)?.name ?? id;
const num = (v) => (v == null ? '—' : v);
const LEVEL = { chapter: 'Chapter', topic: 'Topic', subtopic: 'Subtopic', concept: 'Micro-topic' };
const out = [];
const h = (...l) => out.push(...l);

h('# Banking syllabus hierarchy (generated from src/data/syllabusTrees)', '',
  'Banking → Exam → Stage/Paper → Section → Subject → Chapter → Topic → Subtopic → Micro-topic.', '',
  `Verified against official notifications on ${BANK_SOURCES.ibps_po_xvi.checkedOn}. Regenerate with \`npm run banking-coverage\`; do not edit by hand.`, '',
  '**Status legend.** *official* = printed in the cited notification (stages, section names, questions, marks, time). ',
  '*supplementary* = recommended coverage below an official section (IBPS and SBI print no topic list). ',
  '*draft* = no official section table exists (IBPS RRB Officer Scale-II IT).', '');

h('## Sources', '', '| Id | Notification | URL | Where | Checked |', '|---|---|---|---|---|');
for (const [id, s] of Object.entries(BANK_SOURCES)) h(`| ${id} | ${s.title} | ${s.url} | ${s.ref ?? '—'} | ${s.checkedOn} |`);

// PART 1
h('', '## Part 1 — Banking exam master list', '', '| # | Exam | Id | Cycle (source) | Stages | Pattern verified | Default practice level |', '|---|---|---|---|---|---|---|');
exams.forEach((e, i) => {
  const p = BANK_PATTERNS[e.id];
  h(`| ${i + 1} | ${e.name} | \`${e.id}\` | ${BANK_SOURCES[p.source].title} | ${p.stages.map((s) => s.name).join(' → ')} | ${p.verified ? 'yes' : '**no**'} | ${BANK_EXAM_SYLLABUS[e.id].difficulty} |`);
});

// PART 2 + 3
h('', '## Part 2 and 3 — Exam-wise and paper-wise hierarchy, with each paper\'s subjects', '');
for (const e of exams) {
  const p = BANK_PATTERNS[e.id];
  h(`### ${e.name}`, '');
  if (p.note) h(`> ${p.note}`, '');
  if (p.changes) h(`Cycle difference: ${p.changes}`, '');
  for (const st of p.stages) {
    h(`**${st.name}**${st.note ? ` — ${st.note}` : ''}`, '');
    if (!st.sections.length) {
      h(st.id === 'single' ? '- Draft coverage: ' + Object.keys(BANK_EXAM_SYLLABUS[e.id].subjects).join(', ') : '- No objective sections (not practised in the app).', '');
      continue;
    }
    h('| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |', '|---|---|---|---|---|---|');
    for (const x of st.sections) {
      const chapters = x.subjectIds.flatMap((sid) =>
        Object.entries(BANK_EXAM_SYLLABUS[e.id].subjects[sid] ?? {})
          .filter(([, v]) => v.stages.includes(st.id))
          .map(([slug]) => syllabusFor(e.id, sid)?.getNode(`${syllabusFor(e.id, sid).prefix}.${slug}`)?.titleEn ?? slug));
      h(`| ${x.name} | ${num(x.questions)} | ${num(x.marks)} | ${num(x.minutes)} | ${x.subjectIds.join(', ')} | ${chapters.join('; ')} |`);
    }
    h('');
  }
}

// PART 4–6: each shared library once, full depth.
h('## Part 4, 5 and 6 — Subject-wise hierarchy (chapter → topic → subtopic → micro-topic)', '',
  'Each library is stored once and shared by every exam that maps it. **Difficulty:** every node can be practised and studied at all three levels; the level is chosen at generation time (practice: easy/medium/hard; study notes: basic/exam/advanced). Each exam also has a default level (Part 1). ',
  'Levels mean: **Basic** = definitions and single-step questions; **Intermediate** = exam-level, multi-step; **Advanced** = high-difficulty, combined concepts and new patterns. ',
  '**Question categories** come from each node\'s patterns (conceptual, numerical, trace, design, and so on).', '');
const seen = new Set();
const anyExam = (t) => t.examIds().find((x) => ORDER.includes(x));
for (const e of exams) {
  for (const subj of getSyllabus(e.id).subjects) {
    const t = syllabusFor(e.id, subj.id);
    if (!t || seen.has(t.syllabusId)) continue;
    seen.add(t.syllabusId);
    const ex = anyExam(t);
    const nodes = [...t.nodes.values()].filter((n) => !n.hidden && ORDER.some((x) => t.isApplicable(x, n.nodeId)));
    const count = (k) => nodes.filter((n) => n.nodeType === k).length;
    h(`### ${subj.name} — \`${t.syllabusId}\` (prefix \`${t.prefix}\`)`, '',
      `${count('chapter')} chapters, ${count('topic')} topics, ${count('subtopic')} subtopics, ${count('concept')} micro-topics (banking-mapped nodes only).`, '',
      '| Node | Level | Id | Question categories |', '|---|---|---|---|');
    for (const n of nodes) {
      const depth = { chapter: 0, topic: 1, subtopic: 2, concept: 3 }[n.nodeType];
      h(`| ${'— '.repeat(depth)}${n.nodeType === 'chapter' ? `**${n.titleEn}**` : n.titleEn} (${n.titleHi}) | ${LEVEL[n.nodeType]} | \`${n.nodeId}\` | ${n.nodeType === 'chapter' ? '' : n.patterns.join(', ')} |`);
    }
    h('');
    void ex;
  }
}

// PART 7
h('## Part 7 — Common topic mapping across exams', '', 'Cell = stages in which the chapter is mapped (P = Prelims, M = Mains, D = Descriptive, S = Single exam). Empty = not in that exam.', '');
const short = { prelims: 'P', mains: 'M', descriptive: 'D', single: 'S' };
for (const sid of ['quant', 'reasoning', 'english', 'hindi', 'general_awareness', 'banking_awareness', 'computer', 'professional_it']) {
  const t = exams.map((e) => syllabusFor(e.id, sid)).find(Boolean);
  if (!t) continue;
  const slugs = [...new Set(exams.flatMap((e) => Object.keys(BANK_EXAM_SYLLABUS[e.id].subjects[sid] ?? {})))];
  h(`### ${sid}`, '', `| Chapter | ${exams.map((e) => e.name).join(' | ')} |`, `|---|${exams.map(() => '---').join('|')}|`);
  for (const slug of slugs) {
    const title = t.getNode(`${t.prefix}.${slug}`)?.titleEn ?? slug;
    h(`| ${title} | ${exams.map((e) => (BANK_EXAM_SYLLABUS[e.id].subjects[sid]?.[slug]?.stages ?? []).map((s) => short[s]).join('+')).join(' | ')} |`);
  }
  h('');
}

// PART 8
h('## Part 8 — Official syllabus versus supplementary audit', '',
  '| Exam | Official (from notification) | Supplementary / draft (our coverage) |', '|---|---|---|');
for (const e of exams) {
  const p = BANK_PATTERNS[e.id];
  const official = p.verified ? p.stages.filter((s) => s.sections.length).map((s) => `${s.name}: ${s.sections.map((x) => x.name).join(', ')}`).join('<br>') : 'Stages only ("Single Level Examination", Common Interview). No section table.';
  let nodes = 0;
  for (const sid of Object.keys(BANK_EXAM_SYLLABUS[e.id].subjects)) nodes += Object.values(syllabusFor(e.id, sid).counts(e.id)).filter((v) => typeof v === 'number').reduce((a, b) => a + b, 0);
  h(`| ${e.name} | ${official} | All ${nodes} chapter-to-micro-topic nodes are ${p.verified ? 'supplementary (recommended coverage)' : 'draft'}. |`);
}
h('', 'Not official anywhere: the GATE CS baseline for Professional Knowledge, and every Banking-IT chapter. These are a product decision for IT Officer preparation. History is deliberately not mapped to Banking.', '');

fs.writeFileSync('syllabus-drafts/banking-coverage.md', out.join('\n'));
console.log('written', out.length, 'lines');
