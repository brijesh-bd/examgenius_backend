import * as math from '../railwayMath/index.js';
import { TreeSyllabus } from './engine.js';
import { EXAM_SYLLABUS, SUBJECT_NAMES, TREE_SOURCES } from './exams.js';
import { REASONING } from './reasoning.js';
import { GENERAL_AWARENESS } from './generalAwareness.js';
import { GENERAL_SCIENCE } from './generalScience.js';
import { SM_LOGICAL, SM_MENTAL, SM_SCIENCE_MATH } from './stationMaster.js';
import { ENGLISH } from './english.js';
import { SSC_COMPUTER, SSC_FINANCE_ECONOMICS, SSC_QUANT, SSC_REASONING, SSC_STATISTICS } from './sscLibraries.js';
import { JE_CIVIL, JE_ELECTRICAL, JE_MECHANICAL } from './sscJe.js';
import { SSC_EXAM_SYLLABUS, SSC_SCHEMES, SSC_SOURCES } from './sscExams.js';

/**
 * Registry of hierarchical syllabi: (examId, subjectId) → tree.
 * Every subject exposes the same interface (TreeSyllabus), so the API,
 * question generation, notes and the app treat all subjects alike.
 * Railway Mathematics keeps its own data module (built earlier) behind an
 * adapter; its per-exam mapping is deferred.
 */

/** Railway and SSC mappings are kept apart; a library is mapped only from the sets given. */
const RAILWAY = EXAM_SYLLABUS;
const SSC = SSC_EXAM_SYLLABUS;
const ALL_EXAMS = { ...RAILWAY, ...SSC };
const mappingFor = (subjectId, sets) =>
  Object.fromEntries(
    sets.flatMap((set) =>
      Object.entries(set)
        .filter(([, e]) => e.subjects[subjectId] && typeof e.subjects[subjectId] === 'object')
        .map(([examId, e]) => [examId, e.subjects[subjectId]]),
    ),
  );
const difficulty = Object.fromEntries(Object.entries(ALL_EXAMS).map(([id, e]) => [id, e.difficulty]));

const make = (syllabusId, prefix, subjectId, text, sets = [RAILWAY]) =>
  new TreeSyllabus({ syllabusId, prefix, subjectId, text, mapping: mappingFor(subjectId, sets), difficulty });

/** Railway Mathematics behind the same interface. */
class MathAdapter {
  syllabusId = math.RAILWAY_MATH_SYLLABUS_ID;
  prefix = math.ROOT_ID;
  subjectId = math.MATH_SUBJECT_ID;
  get nodes() {
    return math.NODES;
  }
  examIds() {
    return Object.keys(RAILWAY).filter((e) => RAILWAY[e].subjects.quant === 'railway_math' && math.isRailwayExam(e));
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
    const c = { chapters: 0, topics: 0, subtopics: 0, concepts: 0, status: { official: 0, supplementary: 0, unverified: 0, draft: 0 } };
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
  // Shared library; Railway and SSC exams each keep their own mapping.
  // (syllabusId kept from v1 so database ids stay stable.)
  make('railway_general_awareness', 'ga', 'general_awareness', GENERAL_AWARENESS, [RAILWAY, SSC]),
  make('railway_general_science', 'gs', 'general_science', GENERAL_SCIENCE),
  // Station Master (CEN 08/2026): the CEN's own sections, verbatim.
  make('station_master_science_math', 'smb', 'sm_science_math', SM_SCIENCE_MATH),
  make('station_master_logical', 'sml', 'sm_logical', SM_LOGICAL),
  make('station_master_mental', 'smr', 'sm_mental', SM_MENTAL),
  // SSC (official SSC notices; see sscExams.js).
  make('ssc_quant', 'sq', 'quant', SSC_QUANT, [SSC]),
  make('ssc_reasoning', 'sr', 'reasoning', SSC_REASONING, [SSC]),
  make('english', 'en', 'english', ENGLISH, [SSC]),
  make('ssc_computer', 'ck', 'computer', SSC_COMPUTER, [SSC]),
  make('ssc_statistics', 'st', 'statistics', SSC_STATISTICS, [SSC]),
  make('ssc_finance_economics', 'fe', 'finance_economics', SSC_FINANCE_ECONOMICS, [SSC]),
  make('ssc_je_civil', 'jc', 'je_civil', JE_CIVIL, [SSC]),
  make('ssc_je_electrical', 'jl', 'je_electrical', JE_ELECTRICAL, [SSC]),
  make('ssc_je_mechanical', 'jm', 'je_mechanical', JE_MECHANICAL, [SSC]),
];

export { SUBJECT_NAMES, TREE_SOURCES, EXAM_SYLLABUS, SSC_EXAM_SYLLABUS, SSC_SOURCES, SSC_SCHEMES };

/** The tree of one exam's subject, or null when it has none. */
export function syllabusFor(examId, subjectId) {
  return SYLLABI.find((s) => s.subjectId === subjectId && s.hasExam(examId)) ?? null;
}

/**
 * Tree for a node id (by prefix). Two trees can share a library (e.g. the
 * Mathematics outline for Railway and SSC), so pass the exam when known.
 */
export function syllabusOfNode(nodeId, examId = null) {
  const prefix = String(nodeId).split('.')[0];
  const all = SYLLABI.filter((s) => s.prefix === prefix);
  return (examId && all.find((s) => s.hasExam(examId))) || all[0] || null;
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
  return Object.keys(ALL_EXAMS).map((examId) => ({
    examId,
    difficulty: difficulty[examId],
    subjects: SYLLABI.filter((s) => s.hasExam(examId)).map((s) => ({ subjectId: s.subjectId, ...s.counts(examId) })),
  }));
}
