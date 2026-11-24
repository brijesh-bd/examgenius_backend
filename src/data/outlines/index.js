import { ancientIndiaOutline } from './ancient_india.js';
import { bankingAwarenessOutline } from './banking_awareness.js';
import { financialAwarenessOutline } from './financial_awareness.js';
import { bankingGeneralAwarenessOutline } from './banking_general_awareness.js';
import { professionalItOutline } from './professional_it.js';
import { medievalIndiaOutline } from './medieval_india.js';
import { modernIndiaOutline } from './modern_india.js';
import { freedomStruggleOutline } from './freedom_struggle.js';

/**
 * Curated outlines on top of the existing syllabus.
 *
 * An outline either attaches as a whole to one learning unit (`unitId`), or
 * spans several syllabus topics/units: then every chapter names its
 * `topicId`, and a student opening that topic sees only those chapters.
 * No topic records are duplicated.
 *
 * Nesting: chapter → sections, where any section may have `children`
 * (a subtopic) to any depth. Leaves are the learning sections that get
 * content. `normalizeOutline` keeps the nested tree in `chapter.children`
 * and a flat, ordered `chapter.sections` of leaves (id = path joined by
 * "."), so existing routes, progress keys and app builds keep working.
 *
 * Visibility: only `status: 'approved'` outlines reach students; a chapter
 * or section may also carry its own `status: 'draft'` and is then hidden
 * from students inside an approved outline. Drafts are visible to admins
 * in preview only, and notes are never generated for students from them.
 */
const RAW_OUTLINES = [
  ancientIndiaOutline,
  bankingAwarenessOutline,
  financialAwarenessOutline,
  bankingGeneralAwarenessOutline,
  professionalItOutline,
  medievalIndiaOutline,
  modernIndiaOutline,
  freedomStruggleOutline,
];

const ID_RE = /^[a-z0-9_]+$/;

/** Throws when an outline breaks the structure rules (checked at startup and in tests). */
export function validateOutline(outline) {
  const where = outline.title ?? outline.unitId ?? outline.id;
  if (!['approved', 'draft'].includes(outline.status)) throw new Error(`${where}: status must be approved or draft`);
  if (!Number.isInteger(outline.version) || outline.version < 1) throw new Error(`${where}: version must be a positive integer`);
  if (!outline.unitId && !outline.chapters.every((c) => c.topicId)) {
    throw new Error(`${where}: needs unitId, or a topicId on every chapter`);
  }
  const chapterIds = new Set();
  for (const c of outline.chapters) {
    if (!ID_RE.test(c.id)) throw new Error(`${where}: bad chapter id "${c.id}"`);
    const scope = `${c.topicId ?? outline.unitId}#${c.id}`;
    if (chapterIds.has(scope)) throw new Error(`${where}: duplicate chapter id "${c.id}"`);
    chapterIds.add(scope);
    const walk = (nodes, path) => {
      if (!Array.isArray(nodes) || nodes.length === 0) throw new Error(`${where} › ${path}: has no sections`);
      const ids = new Set();
      for (const n of nodes) {
        if (!ID_RE.test(n.id ?? '')) throw new Error(`${where} › ${path}: bad section id "${n.id}"`);
        if (ids.has(n.id)) throw new Error(`${where} › ${path}: duplicate section id "${n.id}"`);
        ids.add(n.id);
        if (!n.title) throw new Error(`${where} › ${path}.${n.id}: missing title`);
        if (n.children) walk(n.children, `${path}.${n.id}`);
      }
    };
    walk(c.sections, c.id);
  }
  return outline;
}

/** Adds `children` (nested tree) and flat leaf `sections` to every chapter. */
export function normalizeOutline(outline) {
  validateOutline(outline);
  const chapters = outline.chapters.map((c) => {
    const leaves = [];
    const toNode = (n, parentPath, titles) => {
      const id = parentPath ? `${parentPath}.${n.id}` : n.id;
      const { children, ...rest } = n;
      if (children) {
        return {
          ...rest,
          id,
          type: 'subtopic',
          children: children.map((k) => toNode(k, id, [...titles, n.title])),
        };
      }
      const leaf = { ...rest, id, type: 'section', path: titles };
      leaves.push(leaf);
      return leaf;
    };
    const children = c.sections.map((n) => toNode(n, '', []));
    return { ...c, children, sections: leaves };
  });
  return { ...outline, chapters };
}

export const OUTLINES = RAW_OUTLINES.map(normalizeOutline);

const visible = (node) => node.status !== 'draft';

/** Removes draft chapters/subtopics/sections (for students). */
function withoutDraftNodes(outline) {
  const prune = (nodes) =>
    nodes.filter(visible).flatMap((n) => {
      if (!n.children) return [n];
      const children = prune(n.children);
      return children.length ? [{ ...n, children }] : [];
    });
  const chapters = outline.chapters.filter(visible).flatMap((c) => {
    const children = prune(c.children);
    if (!children.length) return [];
    const leaves = [];
    const collect = (nodes) => nodes.forEach((n) => (n.children ? collect(n.children) : leaves.push(n)));
    collect(children);
    return [{ ...c, children, sections: leaves }];
  });
  return { ...outline, chapters };
}

/**
 * The (part of an) outline that covers one learning unit / topic.
 * includeDrafts: admin preview only.
 */
export function findOutline(unitId, { includeDrafts = false } = {}) {
  for (const outline of OUTLINES) {
    if (outline.status !== 'approved' && !includeDrafts) continue;
    let found = null;
    if (outline.unitId === unitId) found = outline;
    else {
      const chapters = outline.chapters.filter((c) => c.topicId === unitId);
      if (chapters.length) found = { ...outline, unitId, chapters };
    }
    if (!found) continue;
    if (includeDrafts) return found;
    const pruned = withoutDraftNodes(found);
    if (pruned.chapters.length) return pruned;
  }
  return null;
}

/** Ordered [{ chapter, section }] (leaf sections) of an outline. */
export function outlineSections(outline) {
  return outline.chapters.flatMap((chapter) => chapter.sections.map((section) => ({ chapter, section })));
}
