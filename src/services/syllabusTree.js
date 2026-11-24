import { examCatalog } from '../data/examCatalog.js';
import { examSubjects, topicUnits, SYLLABUS_VERSION } from '../data/syllabus.js';
import { findOutline } from '../data/outlines/index.js';
import { findManifest } from '../data/manifests/index.js';

/**
 * One recursive syllabus tree, BUILT from the existing data — nothing is
 * copied or re-keyed:
 *
 *   category → exam → subject → topic → [unit] → chapter → [subtopic…] → section
 *
 *   category / exam   data/examCatalog.js         ids: railway, rrb_ntpc
 *   subject / topic   data/syllabus.js            ids: quant, quant.percentage
 *   unit              syllabus.js topicUnits      id:  <topicId>.<unit>
 *   chapter…section   data/outlines/*.js          ids: <unitId>#<chapter>[.<sub>…].<section>
 *
 * Topic and unit ids are the ones practice, the question bank, progress and
 * notes already use. Chapter/section ids equal the existing progress keys.
 * A subject keeps its id across exams, but each exam has its own topic list
 * (e.g. Railway "Mathematics" vs SSC "Quantitative Aptitude"), so the tree
 * is always built per exam; `exams` on a topic/unit lists every exam that
 * shares it.
 */

export const NODE_TYPES = ['category', 'exam', 'subject', 'topic', 'unit', 'chapter', 'subtopic', 'section'];

/** Optional per-node metadata passed through when the data provides it. */
const META = [
  'description',
  'weight',
  'difficulty',
  'objectives',
  'requiredConcepts',
  'sourceRefs',
  'origin',
  'version',
  // History outlines: exam scope, cross-references, chapter timeline/personalities.
  'scope',
  'seeAlso',
  'timeline',
  'personalities',
  'mcqFocus',
];
const meta = (src) => Object.fromEntries(META.filter((k) => src?.[k] != null).map((k) => [k, src[k]]));

/** topic/unit id → exam ids whose syllabus includes it (shared content). */
const EXAMS_BY_ITEM = (() => {
  const map = new Map();
  const add = (id, examId) => (map.get(id) ?? map.set(id, []).get(id)).push(examId);
  for (const [examId, subjects] of Object.entries(examSubjects)) {
    for (const s of subjects) {
      for (const t of s.topics) {
        add(t.id, examId);
        for (const slug of Object.keys(topicUnits[t.id] ?? {})) add(`${t.id}.${slug}`, examId);
      }
    }
  }
  return map;
})();

export const examsSharing = (itemId) => EXAMS_BY_ITEM.get(itemId) ?? [];

function node(type, id, name, parentId, order, extra = {}) {
  return { id, type, name, parentId, order, status: 'approved', ...extra, children: extra.children ?? [] };
}

/** Outline chapters (with nested subtopics/sections) under a topic/unit node. */
function outlineNodes(unitId, parentId, includeDrafts) {
  const outline = findOutline(unitId, { includeDrafts });
  if (!outline) return { outline: null, chapters: [] };
  const toNode = (n, chapterId, parent, order) => {
    const id = `${unitId}#${chapterId}.${n.id}`;
    const base = {
      ...meta(n),
      status: n.status === 'draft' || outline.status === 'draft' ? 'draft' : 'approved',
    };
    if (n.children) {
      return node('subtopic', id, n.title, parent, order, {
        ...base,
        children: n.children.map((k, i) => toNode({ ...k, id: k.id }, chapterId, id, i + 1)),
      });
    }
    const m = findManifest(id, { includeDrafts });
    return node('section', id, n.title, parent, order, {
      ...base,
      // Coverage contract summary (approved manifests only for students).
      manifest: m
        ? { status: m.status, version: m.version, objectives: m.objectives, concepts: m.concepts.length }
        : null,
      // What the app needs to open the section (existing section API).
      ref: { unitId, chapterId, sectionId: n.id },
    });
  };
  const chapters = outline.chapters.map((c, i) => {
    const id = `${unitId}#${c.id}`;
    return node('chapter', id, c.title, parentId, i + 1, {
      ...meta(c),
      status: c.status === 'draft' || outline.status === 'draft' ? 'draft' : 'approved',
      requiresVerifiedSource: Boolean(c.requiresVerifiedSource),
      children: c.children.map((n, j) => toNode(n, c.id, id, j + 1)),
    });
  });
  return { outline, chapters };
}

/**
 * The exam's tree (optionally one subject). includeDrafts = admin preview:
 * draft outlines/nodes appear with status 'draft'; students never see them.
 */
export function buildExamTree(examId, { subjectId = null, includeDrafts = false } = {}) {
  const category = examCatalog.find((c) => c.exams.some((e) => e.id === examId));
  const exam = category?.exams.find((e) => e.id === examId);
  const subjects = examSubjects[examId];
  if (!exam || !subjects) return null;

  const examNode = node('exam', exam.id, exam.name, category.id, category.exams.indexOf(exam) + 1, {
    categoryId: category.id,
    syllabusVersion: SYLLABUS_VERSION,
  });
  examNode.children = subjects
    .map((s, si) => ({ s, order: si + 1 }))
    .filter(({ s }) => subjectId == null || s.id === subjectId)
    .map(({ s, order }) => {
      const subjectNode = node('subject', s.id, s.name, exam.id, order, meta(s));
      subjectNode.children = s.topics.map((t, ti) => {
        const topicNode = node('topic', t.id, t.name, s.id, ti + 1, { ...meta(t), exams: examsSharing(t.id) });
        const units = topicUnits[t.id];
        if (units) {
          topicNode.children = Object.entries(units).map(([slug, unitName], ui) => {
            const unitId = `${t.id}.${slug}`;
            const unitNode = node('unit', unitId, unitName, t.id, ui + 1, { exams: examsSharing(unitId) });
            const { outline, chapters } = outlineNodes(unitId, unitId, includeDrafts);
            unitNode.children = chapters;
            if (outline) Object.assign(unitNode, { outlineVersion: outline.version, outlineStatus: outline.status });
            return unitNode;
          });
        } else {
          const { outline, chapters } = outlineNodes(t.id, t.id, includeDrafts);
          topicNode.children = chapters;
          if (outline) Object.assign(topicNode, { outlineVersion: outline.version, outlineStatus: outline.status });
        }
        return topicNode;
      });
      return subjectNode;
    });
  return examNode;
}

/** Depth-first walk: fn(node, parent). */
export function walkTree(root, fn, parent = null) {
  fn(root, parent);
  for (const c of root.children ?? []) walkTree(c, fn, root);
}

/** Leaf sections of a (sub)tree, in order. */
export function treeSections(root) {
  const out = [];
  walkTree(root, (n) => n.type === 'section' && out.push(n));
  return out;
}

/**
 * Structural checks: unique ids, parent links, 1..n ordering, allowed
 * parent→child types. Returns a list of problems (empty = valid).
 */
export function validateTree(root) {
  const problems = [];
  const seen = new Set();
  const allowed = {
    category: ['exam'],
    exam: ['subject'],
    subject: ['topic'],
    topic: ['unit', 'chapter'],
    unit: ['chapter'],
    chapter: ['subtopic', 'section'],
    subtopic: ['subtopic', 'section'],
    section: [],
  };
  walkTree(root, (n, parent) => {
    if (!NODE_TYPES.includes(n.type)) problems.push(`${n.id}: unknown type ${n.type}`);
    if (seen.has(n.id)) problems.push(`duplicate id ${n.id}`);
    seen.add(n.id);
    if (parent) {
      if (n.parentId !== parent.id) problems.push(`${n.id}: parentId ${n.parentId} ≠ ${parent.id}`);
      if (!allowed[parent.type]?.includes(n.type)) problems.push(`${n.id}: ${n.type} cannot be under ${parent.type}`);
    }
    const orders = (n.children ?? []).map((c) => c.order);
    if (orders.some((o, i) => o !== i + 1)) problems.push(`${n.id}: children not ordered 1..n`);
    if (n.type === 'subtopic' && !n.children.length) problems.push(`${n.id}: empty subtopic`);
  });
  return problems;
}
