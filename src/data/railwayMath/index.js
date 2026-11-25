import { examCatalog } from '../examCatalog.js';
import { examSubjects } from '../syllabus.js';
import { HIERARCHY } from './hierarchy.js';
import { SOURCES, FAILED_SOURCES, RETRIEVED_ON } from './sources.js';

/**
 * Railway Mathematics syllabus: ONE shared hierarchy (chapter → topic →
 * subtopic → concept, question patterns on concepts) plus per-exam
 * applicability (which chapters each Railway exam includes, with evidence).
 * Practice and AI Study Notes both use these node ids.
 */
export const RAILWAY_MATH_SYLLABUS_ID = 'railway_math';
export const RAILWAY_MATH_VERSION = 1;
export const MATH_SUBJECT_ID = 'quant';
export const ROOT_ID = 'rm';

export const STATUSES = ['official', 'unverified', 'draft'];

// Railway exams whose syllabus has a Mathematics subject (Station Master's
// CEN sections are mapped separately in syllabusTrees/stationMaster.js).
export const RAILWAY_EXAMS = (examCatalog.find((c) => c.id === 'railway')?.exams ?? []).filter((e) =>
  (examSubjects[e.id] ?? []).some((s) => s.id === 'quant'),
);
export const RAILWAY_EXAM_IDS = RAILWAY_EXAMS.map((e) => e.id);

/** Chapters deliberately NOT applicable to an exam (with the reason). */
const EXCLUSIONS = {
  rrb_ntpc: {
    calendar_clock: 'NTPC lists Calendar & Clock under General Intelligence & Reasoning, not Mathematics.',
  },
};

const TYPE_BY_TAG = { C: 'chapter', T: 'topic', S: 'subtopic', M: 'concept' };
const DEPTH = { chapter: 0, topic: 1, subtopic: 2, concept: 3 };

function parse(text) {
  const nodes = new Map();
  const stack = [];
  const children = new Map([[ROOT_ID, []]]);
  const problems = [];
  for (const [lineNo, raw] of text.split('\n').entries()) {
    const line = raw.trim();
    if (!line) continue;
    const tag = line[0];
    const type = TYPE_BY_TAG[tag];
    if (!type || line[1] !== ' ') {
      problems.push(`line ${lineNo + 1}: unknown entry "${line.slice(0, 30)}"`);
      continue;
    }
    const [slug, titleEn, titleHi, a, b] = line.slice(2).split('|').map((s) => s.trim());
    const depth = DEPTH[type];
    stack.length = depth;
    const parent = depth === 0 ? null : stack[depth - 1];
    if (depth > 0 && !parent) {
      problems.push(`line ${lineNo + 1}: ${type} ${slug} has no parent`);
      continue;
    }
    const parentId = parent ? parent.nodeId : ROOT_ID;
    const nodeId = `${parentId}.${slug}`;
    if (nodes.has(nodeId)) problems.push(`duplicate node id ${nodeId}`);
    const siblings = children.get(parentId);
    const node = {
      nodeId,
      parentId,
      nodeType: type,
      slug,
      titleEn,
      titleHi,
      chapterId: depth === 0 ? nodeId : parent.chapterId,
      displayOrder: siblings.length + 1,
      isSelectable: true,
      isActive: true,
    };
    if (type === 'chapter') {
      node.practiceTopicId = a && a !== '-' ? a : nodeId;
      node.coverage = b;
    }
    if (type === 'subtopic' || type === 'concept') {
      const own = (a ?? '').split(';').map((s) => s.trim()).filter(Boolean);
      node.patterns = own.length ? own : (parent.patterns ?? []);
    }
    nodes.set(nodeId, node);
    siblings.push(nodeId);
    children.set(nodeId, []);
    stack[depth] = node;
  }
  return { nodes, children, problems };
}

const parsed = parse(HIERARCHY);
export const NODES = parsed.nodes;
const CHILDREN = parsed.children;
export const PARSE_PROBLEMS = parsed.problems;

export const childIds = (id) => CHILDREN.get(id) ?? [];
export const getNode = (id) => NODES.get(id) ?? null;
export const chapters = () => childIds(ROOT_ID).map(getNode);

/** All concept (leaf) ids under a node, in display order. */
export function leafIds(id) {
  const n = getNode(id);
  if (!n) return [];
  if (n.nodeType === 'concept') return [id];
  return childIds(id).flatMap(leafIds);
}

/** Ancestors from chapter down to the node itself. */
export function pathOf(id) {
  const out = [];
  for (let n = getNode(id); n; n = getNode(n.parentId)) out.unshift(n);
  return out;
}

// ── Applicability and verification ──────────────────────────────────────────

function chapterEvidence(examId, chapter) {
  const listing = SOURCES.filter((s) => s.exams.includes(examId) && s.chapters.includes(chapter.slug));
  const official = listing.filter((s) => s.type === 'official');
  const supplementary = listing.filter((s) => s.type !== 'official');
  const excluded = EXCLUSIONS[examId]?.[chapter.slug];
  if (excluded) return { applicable: false, status: null, official, supplementary, notes: excluded };
  if (official.length) {
    return { applicable: true, status: 'official', official, supplementary, notes: 'Listed in the official notification.' };
  }
  if (supplementary.length) {
    const names = [...new Set(supplementary.map((s) => s.name))];
    return {
      applicable: true,
      status: 'unverified',
      official,
      supplementary,
      notes: `Listed by ${names.join(', ')} (${supplementary.length} page${supplementary.length > 1 ? 's' : ''}). Official notification text not retrieved.`,
    };
  }
  if (chapter.coverage === 'extra') {
    return {
      applicable: true,
      status: 'draft',
      official,
      supplementary,
      notes: 'Not named by any retrieved source; offered as practice extension of a listed chapter.',
    };
  }
  return {
    applicable: true,
    status: 'draft',
    official,
    supplementary,
    notes:
      chapter.coverage === 'gdaj'
        ? 'Listed for Group D/ALP/JE but not in the retrieved lists for this exam; kept because questions of this type appear within listed chapters. Needs official confirmation.'
        : 'Sub-area of a listed chapter; not named for this exam by any retrieved page.',
  };
}

/** examId → Map(chapterId → evidence). */
const APPLICABILITY = new Map(
  RAILWAY_EXAM_IDS.map((examId) => [examId, new Map(chapters().map((c) => [c.nodeId, chapterEvidence(examId, c)]))]),
);

export const isRailwayExam = (examId) => APPLICABILITY.has(examId);

export function chapterApplicability(examId, chapterId) {
  return APPLICABILITY.get(examId)?.get(chapterId) ?? null;
}

export function applicableExamIds(nodeId) {
  const n = getNode(nodeId);
  if (!n) return [];
  return RAILWAY_EXAM_IDS.filter((e) => chapterApplicability(e, n.chapterId)?.applicable);
}

export function isApplicable(examId, nodeId) {
  const n = getNode(nodeId);
  return Boolean(n && chapterApplicability(examId, n.chapterId)?.applicable);
}

const RANK = Object.fromEntries(STATUSES.map((s, i) => [s, i]));

/** Exam-independent node status: chapters = best evidence; below = decomposition. */
export function nodeVerification(nodeId) {
  const n = getNode(nodeId);
  if (!n) return null;
  const evidence = RAILWAY_EXAM_IDS.map((e) => chapterApplicability(e, n.chapterId)).filter((x) => x?.applicable);
  const best = evidence.map((x) => x.status).sort((a, b) => RANK[a] - RANK[b])[0] ?? 'draft';
  const refs = [...new Set(evidence.flatMap((x) => [...x.official, ...x.supplementary].map((s) => s.id)))];
  if (n.nodeType === 'chapter') {
    return {
      verificationStatus: best,
      sourceType: best === 'official' ? 'official' : refs.length ? 'supplementary' : 'editorial',
      sourceReferences: refs,
      officialReference: evidence.flatMap((x) => x.official.map((s) => s.id))[0] ?? null,
      verificationDate: RETRIEVED_ON,
      verificationNotes: 'Chapter evidence per exam: see applicability.',
    };
  }
  // Retrieved sources list chapters (occasionally a sub-row), never micro
  // concepts: descendants are an editorial breakdown that needs human review.
  return {
    verificationStatus: 'draft',
    sourceType: 'editorial',
    sourceReferences: [],
    officialReference: null,
    verificationDate: RETRIEVED_ON,
    verificationNotes: 'Editorial breakdown of the parent chapter; not individually named by any retrieved source.',
  };
}

// ── Student-facing views ────────────────────────────────────────────────────

/** Public node (no internal verification data). */
export function publicNode(n, { withCounts = true } = {}) {
  const out = {
    nodeId: n.nodeId,
    parentId: n.parentId,
    nodeType: n.nodeType,
    titleEn: n.titleEn,
    titleHi: n.titleHi,
    displayOrder: n.displayOrder,
    isSelectable: n.isSelectable,
    hasChildren: childIds(n.nodeId).length > 0,
  };
  if (n.patterns && n.nodeType === 'concept') out.questionPatterns = n.patterns;
  if (withCounts && n.nodeType !== 'concept') out.conceptCount = leafIds(n.nodeId).length;
  return out;
}

export function examChapters(examId) {
  if (!isRailwayExam(examId)) return null;
  return chapters().filter((c) => isApplicable(examId, c.nodeId));
}

/** Nested tree for one exam (optionally from one node down). */
export function examTree(examId, fromId = null) {
  if (!isRailwayExam(examId)) return null;
  const build = (n) => ({ ...publicNode(n), children: childIds(n.nodeId).map((id) => build(getNode(id))) });
  if (fromId) {
    if (!isApplicable(examId, fromId)) return null;
    return build(getNode(fromId));
  }
  return examChapters(examId).map(build);
}

const norm = (s) => String(s).toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();

/** Title search (English or Hindi) within an exam's applicable nodes. */
export function searchNodes(examId, query, { limit = 30 } = {}) {
  if (!isRailwayExam(examId)) return null;
  const q = norm(query);
  if (!q) return [];
  const hits = [];
  for (const n of NODES.values()) {
    if (!isApplicable(examId, n.nodeId)) continue;
    const en = norm(n.titleEn);
    const hi = norm(n.titleHi);
    const score = en.startsWith(q) || hi.startsWith(q) ? 0 : en.includes(q) || hi.includes(q) ? 1 : -1;
    if (score >= 0) hits.push({ score, depth: DEPTH[n.nodeType], n });
  }
  hits.sort((a, b) => a.score - b.score || a.depth - b.depth);
  return hits.slice(0, limit).map(({ n }) => ({
    ...publicNode(n, { withCounts: false }),
    path: pathOf(n.nodeId).map((p) => ({ nodeId: p.nodeId, titleEn: p.titleEn, titleHi: p.titleHi })),
  }));
}

/**
 * Resolves a student's selection for an exam: parents expand to their
 * concepts, duplicates are removed, ids that are unknown or not part of the
 * exam are reported as invalid.
 * → { conceptIds, selectedIds, invalid, byChapter: Map(chapterId → conceptIds) }
 */
export function resolveSelection(examId, nodeIds) {
  const invalid = [];
  const selected = [];
  for (const id of new Set(nodeIds)) {
    if (!isApplicable(examId, id)) invalid.push(id);
    else selected.push(id);
  }
  // A node whose ancestor is also selected adds nothing.
  const set = new Set(selected);
  const effective = selected.filter((id) => !pathOf(id).slice(0, -1).some((a) => set.has(a.nodeId)));
  const conceptIds = [...new Set(effective.flatMap(leafIds))];
  const byChapter = new Map();
  for (const id of conceptIds) {
    const c = getNode(id).chapterId;
    (byChapter.get(c) ?? byChapter.set(c, []).get(c)).push(id);
  }
  return { conceptIds, selectedIds: effective, invalid, byChapter };
}

// ── Quality checks + research report ────────────────────────────────────────

const REASONING_SERIES = /\b(wrong|missing|odd one).*series|number series|letter series|alpha.?numeric/i;

/** Structural and content problems; empty = valid. */
export function validateHierarchy() {
  const problems = [...PARSE_PROBLEMS];
  const titlesByParent = new Map();
  for (const n of NODES.values()) {
    if (!n.titleEn || !n.titleHi) problems.push(`${n.nodeId}: missing English or Hindi title`);
    if (!/^[a-z0-9_]+$/.test(n.slug)) problems.push(`${n.nodeId}: slug must be snake_case`);
    if (REASONING_SERIES.test(n.titleEn)) problems.push(`${n.nodeId}: number/letter series belong to Reasoning`);
    if (n.nodeType !== 'concept' && childIds(n.nodeId).length === 0) problems.push(`${n.nodeId}: ${n.nodeType} has no children`);
    if (n.nodeType === 'concept' && !(n.patterns?.length)) problems.push(`${n.nodeId}: concept without question patterns`);
    const key = `${n.parentId}|${norm(n.titleEn)}`;
    if (titlesByParent.has(key)) problems.push(`${n.nodeId}: duplicate title under ${n.parentId}`);
    titlesByParent.set(key, n.nodeId);
  }
  for (const c of chapters()) {
    if (!['core', 'gdaj', 'part', 'extra'].includes(c.coverage)) problems.push(`${c.nodeId}: unknown coverage ${c.coverage}`);
    if (!RAILWAY_EXAM_IDS.some((e) => isApplicable(e, c.nodeId))) problems.push(`${c.nodeId}: applies to no exam`);
  }
  for (const s of SOURCES) {
    for (const slug of s.chapters) if (!getNode(`${ROOT_ID}.${slug}`)) problems.push(`source ${s.id}: unknown chapter ${slug}`);
  }
  return problems;
}

/** Same English title in two different places (kept, but reported). */
export function duplicateTitles() {
  const byTitle = new Map();
  for (const n of NODES.values()) {
    const k = `${n.nodeType}|${norm(n.titleEn)}`;
    (byTitle.get(k) ?? byTitle.set(k, []).get(k)).push(n.nodeId);
  }
  return [...byTitle.values()].filter((ids) => ids.length > 1);
}

export function counts() {
  const by = { chapter: 0, topic: 0, subtopic: 0, concept: 0 };
  const status = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let patterns = 0;
  for (const n of NODES.values()) {
    by[n.nodeType]++;
    status[nodeVerification(n.nodeId).verificationStatus]++;
    if (n.nodeType === 'concept') patterns += n.patterns.length;
  }
  return { chapters: by.chapter, topics: by.topic, subtopics: by.subtopic, concepts: by.concept, questionPatterns: patterns, byStatus: status };
}

export function researchReport() {
  return {
    syllabusId: RAILWAY_MATH_SYLLABUS_ID,
    version: RAILWAY_MATH_VERSION,
    generatedFrom: 'src/data/railwayMath',
    counts: counts(),
    exams: RAILWAY_EXAMS.map((e) => ({
      examId: e.id,
      name: e.name,
      chapters: chapters().map((c) => {
        const ev = chapterApplicability(e.id, c.nodeId);
        return {
          chapterId: c.nodeId,
          title: c.titleEn,
          applicable: ev.applicable,
          status: ev.status,
          sources: [...ev.official, ...ev.supplementary].map((s) => s.id),
          notes: ev.notes,
        };
      }),
    })),
    sources: SOURCES,
    failedSources: FAILED_SOURCES,
    conflicts: [
      'RRB JE: Testbook omits Square Root; Adda247 and Oliveboard include it (kept, unverified).',
      'Oliveboard Group D page headline cites CEN 08/2024 while the body cites CEN 09/2025.',
      'Adda247 NTPC page is an "important topics" list (includes Data Interpretation and Simplification) rather than a syllabus.',
      'Calendar & Clock: Mathematics for Group D/ALP/JE, Reasoning for NTPC (excluded from NTPC Mathematics).',
    ],
    duplicateTitles: duplicateTitles(),
    problems: validateHierarchy(),
    limitations: [
      'No official RRB CEN notification text was retrieved; no node is official.',
      'Topic/subtopic/concept levels are an editorial breakdown (draft), not taken from a source list.',
      'Question patterns are English only (used in AI prompts); node titles are bilingual.',
      'Exams not in the app catalogue (RRB Technician, RPF, NTPC UG/Graduate split) are not mapped.',
    ],
  };
}
