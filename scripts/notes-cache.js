// Shared AI Study Notes section cache — maintenance.
//   npm run notes-cache -- stats
//   npm run notes-cache -- invalidate <unitId>        e.g. general_awareness.history.ancient
//   npm run notes-cache -- invalidate-key "<cache key>"
// Invalidated entries stop being served (the next student regenerates);
// they are kept for audit, never deleted. Students' own saved notes are
// not touched.
import { config } from '../src/config.js';
import { connectDb } from '../src/db.js';
import { SectionCache } from '../src/services/sectionCache.js';

const [cmd, arg] = process.argv.slice(2);
const db = await connectDb(config.mongo);
const cache = new SectionCache(db);
try {
  if (cmd === 'invalidate' && arg) {
    console.log(`Invalidated ${await cache.invalidate({ unitId: arg })} cached sections of ${arg}`);
  } else if (cmd === 'invalidate-key' && arg) {
    console.log(`Invalidated ${await cache.invalidate({ key: arg })} entries`);
  } else if (cmd === 'stats') {
    const rows = await db.sectionCache
      .aggregate([{ $group: { _id: { unitId: '$unitId', status: '$status' }, n: { $sum: 1 } } }, { $sort: { '_id.unitId': 1 } }])
      .toArray();
    for (const r of rows) console.log(`${r._id.unitId}  ${r._id.status}  ${r.n}`);
    if (!rows.length) console.log('Cache is empty.');
  } else {
    console.log('Usage: npm run notes-cache -- stats | invalidate <unitId> | invalidate-key "<key>"');
    process.exitCode = 1;
  }
} finally {
  await db.client.close();
}
