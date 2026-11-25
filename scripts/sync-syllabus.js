// Mirrors every hierarchical syllabus (all subjects, all exam mappings) into
// MongoDB and writes the coverage report.
//   npm run syllabus                     → validate + report + sync
//   npm run syllabus -- --report-only    (no database needed)
// Idempotent; never deletes (removed nodes → isActive:false, old versions → history).
import fs from 'node:fs';
import path from 'node:path';

import { coverageReport, validateAll, TREE_SOURCES } from '../src/data/syllabusTrees/index.js';
import { researchReport } from '../src/data/railwayMath/index.js';

const problems = validateAll();
if (problems.length) {
  console.error('Syllabus problems — fix before syncing:\n' + problems.join('\n'));
  process.exit(1);
}

const out = path.resolve('reports/syllabus-coverage.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  JSON.stringify({ generatedAt: new Date().toISOString(), coverage: coverageReport(), sources: TREE_SOURCES, mathResearch: researchReport() }, null, 2),
);
console.log(`Report: ${out}`);

if (!process.argv.includes('--report-only')) {
  const { config } = await import('../src/config.js');
  const { connectDb } = await import('../src/db.js');
  const { SyllabusStore } = await import('../src/services/syllabusStore.js');
  const db = await connectDb(config.mongo);
  try {
    console.log('Synced:', await new SyllabusStore(db.db).sync());
  } finally {
    await db.client.close();
  }
}
