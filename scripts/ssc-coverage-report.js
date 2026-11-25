// Writes syllabus-drafts/ssc-coverage.md from the live syllabus data (never edited by hand).
//   node scripts/ssc-coverage-report.js
import fs from 'node:fs';
import { examCatalog } from '../src/data/examCatalog.js';
import { getSyllabus } from '../src/services/examService.js';
import { SSC_SCHEMES, SSC_SOURCES, syllabusFor } from '../src/data/syllabusTrees/index.js';

const out = ['# SSC syllabus coverage (generated from src/data/syllabusTrees)', '',
  'Status: **official** = named in the cited SSC notice; **supplementary** = practice detail added below an official heading. Figure-only items are hidden from practice (text MCQ only) and listed separately.', ''];
out.push('## Sources', '', '| Id | Notice | URL | Section |', '|---|---|---|---|');
for (const [id, s] of Object.entries(SSC_SOURCES)) out.push(`| ${id} | ${s.title} | ${s.url} | ${s.ref} |`);
const totals = { official: 0, supplementary: 0, hidden: 0 };
for (const exam of examCatalog.find((c) => c.id === 'ssc').exams) {
  out.push('', `## ${exam.name} (\`${exam.id}\`)`, '', `Pattern: ${SSC_SCHEMES[exam.id]}`, '');
  for (const subject of getSyllabus(exam.id).subjects) {
    const t = syllabusFor(exam.id, subject.id);
    const counts = { official: 0, supplementary: 0 };
    const rows = [];
    const hidden = [];
    for (const n of t.nodes.values()) {
      const mapped = t.entry?.(exam.id, n.chapterSlug);
      if (!mapped) continue;
      if (mapped.topics && n.nodeType !== 'chapter' && !mapped.topics.includes(n.topicSlug)) continue;
      if (n.hidden) { hidden.push(n.titleEn); continue; }
      const st = t.status(exam.id, n.nodeId);
      counts[st] = (counts[st] ?? 0) + 1;
      const depth = { chapter: 0, topic: 1, subtopic: 2, concept: 3 }[n.nodeType];
      rows.push(`| ${'— '.repeat(depth)}${n.titleEn} | ${n.nodeType} | ${st} | ${t.sources(exam.id, n.nodeId).join(', ')} | implemented |`);
    }
    totals.official += counts.official ?? 0;
    totals.supplementary += counts.supplementary ?? 0;
    totals.hidden += hidden.length;
    out.push(`### ${subject.name} — ${counts.official ?? 0} official, ${counts.supplementary ?? 0} supplementary`, '',
      '| Node | Level | Status | Source | Implementation |', '|---|---|---|---|---|', ...rows, '');
    if (hidden.length) out.push(`Hidden (needs a figure): ${[...new Set(hidden)].join('; ')}`, '');
  }
}
out.splice(4, 0, `Totals (all SSC exams, counted per exam): ${totals.official} official, ${totals.supplementary} supplementary, ${totals.hidden} figure-only items hidden.`, '');
fs.writeFileSync('syllabus-drafts/ssc-coverage.md', out.join('\n'));
console.log('written', totals);
