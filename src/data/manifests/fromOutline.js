/**
 * Builds coverage manifests from checklists written directly on outline
 * sections (used by the History outlines), so the editorial data lives in
 * one reviewable place. A section opts in with:
 *
 *   { id, title,
 *     concepts: ['Name|alias|alias', '~Detail concept|alias'],  // '~' = detail level
 *     facts?: ['must-appear fact'],
 *     comparisons?: ['table to include'],
 *     objectives?: ['…'],                // default derived from the title
 *     mcqs?: 6 }                         // Complete-mode minimum (default 6)
 *
 * Manifests are drafts and carry no fact sources (`sources: []`): the
 * outline's syllabus references are for syllabus verification, not proof of
 * facts — so generated facts stay "unverified".
 */
const toId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'concept';

export function parseConcept(spec) {
  const detail = spec.startsWith('~');
  const [name, ...aliases] = (detail ? spec.slice(1) : spec).split('|').map((s) => s.trim());
  return { id: toId(name), name, aliases, level: detail ? 'detail' : 'core' };
}

/** Manifests keyed by section id for every leaf of [outline] with a checklist. */
export function manifestsFromOutline(outline, outlineSections) {
  const out = {};
  for (const { chapter, section } of outlineSections(outline)) {
    if (!section.concepts?.length) continue;
    const unitId = chapter.topicId ?? outline.unitId;
    const concepts = [];
    const seen = new Set();
    for (const spec of section.concepts) {
      const c = parseConcept(spec);
      let id = c.id;
      for (let i = 2; seen.has(id); i++) id = `${c.id}_${i}`;
      seen.add(id);
      concepts.push({ ...c, id });
    }
    const comparisons = section.comparisons ?? [];
    out[`${unitId}#${chapter.id}.${section.id}`] = {
      version: 1,
      status: 'draft',
      objectives: section.objectives ?? [`Explain ${section.title} at exam level and recall the frequently tested facts`],
      concepts,
      blocks: ['explanation', 'timeline', ...(comparisons.length ? ['table'] : []), 'keyFacts', 'revision', 'mcqs'],
      comparisons,
      facts: section.facts ?? [],
      examples: [],
      mcqs: { min: section.mcqs ?? 6 },
      sources: [],
    };
  }
  return out;
}
