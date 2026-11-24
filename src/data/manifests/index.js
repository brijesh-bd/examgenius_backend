import { manifestProblems } from '../../services/coverage.js';
import { OUTLINES, outlineSections } from '../outlines/index.js';
import ancientIndiaMauryan from './ancient_india_mauryan.js';
import dbms from './dbms.js';
import { manifestsFromOutline } from './fromOutline.js';

/**
 * Coverage manifests keyed by section id — the syllabus tree / progress id
 * `<unitId>#<chapterId>.<sectionId>`. Kept apart from the outlines so the
 * editorial work (what a section must teach) can be reviewed on its own.
 *
 * A manifest is only used for students once its status is 'approved'
 * (and its outline is approved). Drafts are visible in admin preview.
 */
// History outlines (Medieval, Modern, Freedom Struggle) carry their
// checklists on the sections; manifests are built from them.
const HISTORY_UNITS = [
  'general_awareness.history.medieval',
  'general_awareness.history.modern',
  'general_awareness.history.freedom_struggle',
];
const SOURCES = [
  ancientIndiaMauryan,
  dbms,
  ...OUTLINES.filter((o) => HISTORY_UNITS.includes(o.unitId)).map((o) => manifestsFromOutline(o, outlineSections)),
];

export const MANIFESTS = (() => {
  const all = {};
  for (const src of SOURCES) {
    for (const [id, m] of Object.entries(src)) {
      if (all[id]) throw new Error(`duplicate manifest for ${id}`);
      const problems = manifestProblems(m);
      if (problems.length) throw new Error(`manifest ${id}: ${problems.join('; ')}`);
      all[id] = Object.freeze(m);
    }
  }
  return Object.freeze(all);
})();

/** Every outline section id, for checking manifests point at real sections. */
function allSectionIds() {
  const ids = new Set();
  for (const o of OUTLINES) {
    for (const { chapter, section } of outlineSections(o)) {
      ids.add(`${chapter.topicId ?? o.unitId}#${chapter.id}.${section.id}`);
    }
  }
  return ids;
}

/** The manifest of one section (approved only, unless includeDrafts). */
export function findManifest(sectionId, { includeDrafts = false } = {}) {
  const m = MANIFESTS[sectionId];
  if (!m) return null;
  return m.status === 'approved' || includeDrafts ? m : null;
}

/**
 * Editorial progress: how many outline sections have a manifest, by status,
 * plus manifests that point at no section (typos / renamed sections).
 */
export function manifestReport() {
  const sections = allSectionIds();
  const ids = Object.keys(MANIFESTS);
  return {
    sections: sections.size,
    withManifest: ids.filter((id) => sections.has(id)).length,
    approved: ids.filter((id) => sections.has(id) && MANIFESTS[id].status === 'approved').length,
    draft: ids.filter((id) => sections.has(id) && MANIFESTS[id].status === 'draft').length,
    orphans: ids.filter((id) => !sections.has(id)),
  };
}
