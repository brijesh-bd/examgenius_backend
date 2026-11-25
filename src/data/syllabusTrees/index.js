import * as math from '../railwayMath/index.js';
import { TreeSyllabus } from './engine.js';
import { EXAM_SYLLABUS, SUBJECT_NAMES, TREE_SOURCES } from './exams.js';
import { REASONING } from './reasoning.js';
import { GENERAL_AWARENESS } from './generalAwareness.js';
import { GENERAL_SCIENCE } from './generalScience.js';

/**
 * Registry of hierarchical syllabi: (examId, subjectId) → tree.
 * Every subject exposes the same interface (TreeSyllabus), so the API,
 * question generation, notes and the app treat all subjects alike.
 * Railway Mathematics keeps its own data module (built earlier) behind an
 * adapter; its per-exam mapping is deferred.
 */

const mappingFor = (subjectId) =>
  Object.fromEntries(
    Object.entries(EXAM_SYLLABUS)
      .filter(([, e]) => e.subjects[subjectId] && typeof e.subjects[subjectId] === 'object')
      .map(([examId, e]) => [examId, e.subjects[subjectId]]),
  );
const difficulty = Object.fromEntries(Object.entries(EXAM_SYLLABUS).map(([id, e]) => [id, e.difficulty]));

const make = (syllabusId, prefix, subjectId, text) =>
  new TreeSyllabus({ syllabusId, prefix, subjectId, text, mapping: mappingFor(subjectId), difficulty });

/** Railway Mathematics behind the same interface. */
class MathAdapter {
  syllabusId = math.RAILWAY_MATH_SYLLABUS_ID;
  prefix = math.ROOT_ID;
  subjectId = math.MATH_SUBJECT_ID;
  get nodes() {
    return math.NODES;
  }
  examIds() {
    return Object.keys(EXAM_SYLLABUS).filter((e) => EXAM_SYLLABUS[e].subjects.quant && math.isRailwayExam(e));
  }
  hasExam(examId) {
    return this.examIds().includes(examId);
  }
  getNode(id) {
    return math.getNode(id);
  }
  isApplicable(examId, id) {
    return this.hasExam(examId) && math.isApplicable(examId, id);
  }
  childIds(examId, id) {
    return math.childIds(id).filter((c) => this.isApplicable(examId, c));
  }
  leafIds(examId, id) {
    return this.isApplicable(examId, id) ? math.leafIds(id) : [];
  }
  pathOf(id) {
    return math.pathOf(id);
  }
  chapters(examId) {
    return this.hasExam(examId) ? math.examChapters(examId) : [];
  }
  status(examId, id) {
    const n = math.getNode(id);
    if (!n || !this.isApplicable(examId, id)) return null;
    return n.nodeType === 'chapter' ? math.chapterApplicability(examId, id).status : 'draft';
  }
  sources(examId, id) {
    const n = math.getNode(id);
    const ev = n && math.chapterApplicability(examId, n.chapterId);
    return ev ? [...ev.official, ...ev.supplementary].map((s) => s.id) : [];
  }
  difficulty(examId) {
    return difficulty[examId] ?? 'medium';
  }
  practiceTopic(_examId, chapterId) {
    const c = math.getNode(chapterId);
    return { id: c.practiceTopicId, name: c.titleEn };
  }
  publicNode(examId, n, opts) {
    return { ...math.publicNode(n, opts), status: this.status(examId, n.nodeId) };
  }
  tree(examId, fromId = null) {
    if (!this.hasExam(examId)) return null;
    const t = math.examTree(examId, fromId);
    if (!t) return null;
    const tag = (x) => ({ ...x, status: this.status(examId, x.nodeId), children: x.children.map(tag) });
    return (Array.isArray(t) ? t : [t]).map(tag);
  }
  search(examId, q, opts) {
    return this.hasExam(examId) ? math.searchNodes(examId, q, opts).map((h) => ({ ...h, status: this.status(examId, h.nodeId) })) : null;
  }
  resolve(examId, ids) {
    if (!this.hasExam(examId)) return { conceptIds: [], selectedIds: [], invalid: [...new Set(ids)], byChapter: new Map() };
    return math.resolveSelection(examId, ids);
  }
  validate() {
    return math.validateHierarchy();
  }
  counts(examId) {
    const c = { chapters: 0, topics: 0, subtopics: 0, concepts: 0, status: { official: 0, unverified: 0, draft: 0 } };
    for (const n of math.NODES.values()) {
      if (!this.isApplicable(examId, n.nodeId)) continue;
      c[{ chapter: 'chapters', topic: 'topics', subtopic: 'subtopics', concept: 'concepts' }[n.nodeType]]++;
      c.status[this.status(examId, n.nodeId)]++;
    }
    return c;
  }
}

export const SYLLABI = [
  new MathAdapter(),
  make('railway_reasoning', 'rr', 'reasoning', REASONING),
  make('railway_general_awareness', 'ga', 'general_awareness', GENERAL_AWARENESS),
  make('railway_general_science', 'gs', 'general_science', GENERAL_SCIENCE),
];

export { SUBJECT_NAMES, TREE_SOURCES, EXAM_SYLLABUS };

/** The tree of one exam's subject, or null when it has none. */
export function syllabusFor(examId, subjectId) {
  return SYLLABI.find((s) => s.subjectId === subjectId && s.hasExam(examId)) ?? null;
}

/** Tree for a node id (by prefix). */
export function syllabusOfNode(nodeId) {
  const prefix = String(nodeId).split('.')[0];
  return SYLLABI.find((s) => s.prefix === prefix) ?? null;
}

export const hasTrees = (examId) => SYLLABI.some((s) => s.hasExam(examId));

export function examTreeSubjects(examId) {
  return SYLLABI.filter((s) => s.hasExam(examId)).map((s) => s.subjectId);
}

export function validateAll() {
  return SYLLABI.flatMap((s) => s.validate().map((p) => `${s.syllabusId}: ${p}`));
}

/** Per exam × subject counts (coverage report). */
export function coverageReport() {
  return Object.keys(EXAM_SYLLABUS).map((examId) => ({
    examId,
    difficulty: difficulty[examId],
    subjects: SYLLABI.filter((s) => s.hasExam(examId)).map((s) => ({ subjectId: s.subjectId, ...s.counts(examId) })),
  }));
}
