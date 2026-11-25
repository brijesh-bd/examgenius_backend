import { topicIndex } from '../../services/examService.js';

/**
 * Generic hierarchical syllabus: ONE shared concept library per subject +
 * an exam-wise mapping. Used for every subject that has a concept tree, so
 * no subject has its own code or UI.
 *
 * Library format, one node per line (depth from the tag; any node may be a leaf):
 *   C slug | English | Hindi | legacyTopicId|-     chapter
 *   T slug | English | Hindi [| fig]               topic
 *   S slug | English | Hindi [| fig]               subtopic
 *   M slug | English | Hindi [| fig]               micro-concept
 * Ids = `<prefix>.<slug path>` (stable). `fig` = needs a figure → hidden
 * (text-MCQ practice only).
 *
 * Mapping: examId → { chapterSlug: { status, sources, topics?, note? } }.
 * A node belongs to an exam only through its chapter's entry (and `topics`).
 */
export const STATUSES = ['official', 'unverified', 'draft'];
const TYPES = { C: 'chapter', T: 'topic', S: 'subtopic', M: 'concept' };
const DEPTH = { chapter: 0, topic: 1, subtopic: 2, concept: 3 };
const norm = (s) => String(s).toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();

export class TreeSyllabus {
  constructor({ syllabusId, prefix, subjectId, text, mapping, difficulty = {} }) {
    Object.assign(this, { syllabusId, prefix, subjectId, mapping, difficultyByExam: difficulty });
    this.nodes = new Map();
    this.children = new Map([[prefix, []]]);
    this.problems = [];
    const stack = [];
    for (const [i, raw] of text.split('\n').entries()) {
      const line = raw.trim();
      if (!line) continue;
      const type = TYPES[line[0]];
      if (!type || line[1] !== ' ') {
        this.problems.push(`line ${i + 1}: unknown entry`);
        continue;
      }
      const [slug, titleEn, titleHi, extra] = line.slice(2).split('|').map((s) => s.trim());
      const depth = DEPTH[type];
      // Nearest shallower node: a micro-concept may sit directly under a topic.
      let parent = null;
      for (let d = depth - 1; d >= 0 && !parent; d--) parent = stack[d] ?? null;
      stack.length = depth;
      if (depth && !parent) {
        this.problems.push(`line ${i + 1}: ${slug} has no parent`);
        continue;
      }
      const parentId = parent ? parent.nodeId : prefix;
      const nodeId = `${parentId}.${slug}`;
      if (this.nodes.has(nodeId)) this.problems.push(`duplicate id ${nodeId}`);
      const siblings = this.children.get(parentId);
      const node = {
        nodeId,
        parentId,
        nodeType: type,
        slug,
        titleEn,
        titleHi,
        chapterSlug: parent ? parent.chapterSlug : slug,
        topicSlug: depth === 1 ? slug : depth > 1 ? parent.topicSlug : null,
        displayOrder: siblings.length + 1,
        // A figure parent hides its whole branch.
        hidden: extra === 'fig' || Boolean(parent?.hidden),
        legacyTopicId: type === 'chapter' && extra && extra !== '-' ? extra : null,
        patterns: [],
      };
      this.nodes.set(nodeId, node);
      siblings.push(nodeId);
      this.children.set(nodeId, []);
      stack[depth] = node;
    }
  }

  examIds() {
    return Object.keys(this.mapping);
  }

  hasExam(examId) {
    return Boolean(this.mapping[examId]);
  }

  entry(examId, chapterSlug) {
    return this.mapping[examId]?.[chapterSlug] ?? null;
  }

  getNode(id) {
    return this.nodes.get(id) ?? null;
  }

  isApplicable(examId, id) {
    const n = this.getNode(id);
    if (!n || n.hidden) return false;
    const e = this.entry(examId, n.chapterSlug);
    if (!e) return false;
    return !e.topics || n.nodeType === 'chapter' || e.topics.includes(n.topicSlug);
  }

  childIds(examId, id) {
    return (this.children.get(id) ?? []).filter((c) => this.isApplicable(examId, c));
  }

  /** Applicable leaves under a node, in order. */
  leafIds(examId, id) {
    if (!this.isApplicable(examId, id)) return [];
    const kids = this.childIds(examId, id);
    return kids.length ? kids.flatMap((c) => this.leafIds(examId, c)) : [id];
  }

  pathOf(id) {
    const out = [];
    for (let n = this.getNode(id); n; n = this.getNode(n.parentId)) out.unshift(n);
    return out;
  }

  chapters(examId) {
    return this.childIds(examId, this.prefix).map((id) => this.getNode(id));
  }

  /** official / unverified / draft for this exam (below chapter: draft). */
  status(examId, id) {
    const n = this.getNode(id);
    const e = n && this.entry(examId, n.chapterSlug);
    if (!e) return null;
    if (n.nodeType === 'chapter') return e.status;
    return e.verifiedTopics?.includes(n.topicSlug) && n.nodeType === 'topic' ? e.status : 'draft';
  }

  sources(examId, id) {
    const n = this.getNode(id);
    return (n && this.entry(examId, n.chapterSlug)?.sources) ?? [];
  }

  difficulty(examId) {
    return this.difficultyByExam[examId] ?? 'medium';
  }

  /** Practice topic used for Library / bank / weak-topic stats. */
  practiceTopic(examId, chapterId) {
    const c = this.getNode(chapterId);
    const legacy = c.legacyTopicId && topicIndex(examId).get(c.legacyTopicId);
    return legacy ? { id: c.legacyTopicId, name: legacy.topic.name } : { id: c.nodeId, name: c.titleEn };
  }

  publicNode(examId, n, { withCounts = true } = {}) {
    const out = {
      nodeId: n.nodeId,
      parentId: n.parentId,
      nodeType: n.nodeType,
      titleEn: n.titleEn,
      titleHi: n.titleHi,
      displayOrder: n.displayOrder,
      isSelectable: true,
      hasChildren: this.childIds(examId, n.nodeId).length > 0,
      status: this.status(examId, n.nodeId),
    };
    if (n.patterns.length) out.questionPatterns = n.patterns;
    if (withCounts && out.hasChildren) out.conceptCount = this.leafIds(examId, n.nodeId).length;
    return out;
  }

  tree(examId, fromId = null) {
    const build = (n) => ({
      ...this.publicNode(examId, n),
      children: this.childIds(examId, n.nodeId).map((id) => build(this.getNode(id))),
    });
    if (fromId) return this.isApplicable(examId, fromId) ? [build(this.getNode(fromId))] : null;
    return this.chapters(examId).map(build);
  }

  search(examId, query, { limit = 30 } = {}) {
    const q = norm(query);
    if (!q) return [];
    const hits = [];
    for (const n of this.nodes.values()) {
      if (!this.isApplicable(examId, n.nodeId)) continue;
      const en = norm(n.titleEn);
      const hi = norm(n.titleHi);
      const score = en.startsWith(q) || hi.startsWith(q) ? 0 : en.includes(q) || hi.includes(q) ? 1 : -1;
      if (score >= 0) hits.push({ score, depth: DEPTH[n.nodeType], n });
    }
    hits.sort((a, b) => a.score - b.score || a.depth - b.depth);
    return hits.slice(0, limit).map(({ n }) => ({
      ...this.publicNode(examId, n, { withCounts: false }),
      path: this.pathOf(n.nodeId).map((p) => ({ nodeId: p.nodeId, titleEn: p.titleEn, titleHi: p.titleHi })),
    }));
  }

  /** Selection → concepts (parents expanded, duplicates removed, invalid ids reported). */
  resolve(examId, nodeIds) {
    const invalid = [];
    const selected = [];
    for (const id of new Set(nodeIds)) (this.isApplicable(examId, id) ? selected : invalid).push(id);
    const set = new Set(selected);
    const effective = selected.filter((id) => !this.pathOf(id).slice(0, -1).some((a) => set.has(a.nodeId)));
    const conceptIds = [...new Set(effective.flatMap((id) => this.leafIds(examId, id)))];
    const byChapter = new Map();
    for (const id of conceptIds) {
      const c = this.pathOf(id)[0].nodeId;
      (byChapter.get(c) ?? byChapter.set(c, []).get(c)).push(id);
    }
    return { conceptIds, selectedIds: effective, invalid, byChapter };
  }

  /** Structural + mapping problems (empty = valid). */
  validate() {
    const problems = [...this.problems];
    const seen = new Map();
    for (const n of this.nodes.values()) {
      if (!n.titleEn || !n.titleHi) problems.push(`${n.nodeId}: missing English or Hindi title`);
      if (!/^[a-z0-9_]+$/.test(n.slug)) problems.push(`${n.nodeId}: slug must be snake_case`);
      const key = `${n.parentId}|${norm(n.titleEn)}`;
      if (seen.has(key)) problems.push(`${n.nodeId}: duplicate title under ${n.parentId}`);
      seen.set(key, n.nodeId);
    }
    for (const [examId, chapters] of Object.entries(this.mapping)) {
      for (const [slug, e] of Object.entries(chapters)) {
        const c = this.getNode(`${this.prefix}.${slug}`);
        if (!c) problems.push(`${examId}: unknown chapter ${slug}`);
        if (!STATUSES.includes(e.status)) problems.push(`${examId}.${slug}: bad status ${e.status}`);
        if (e.status === 'official' && !e.sources?.some((s) => s.startsWith('cen_'))) {
          problems.push(`${examId}.${slug}: official without a CEN source`);
        }
        for (const t of e.topics ?? []) if (!this.getNode(`${this.prefix}.${slug}.${t}`)) problems.push(`${examId}.${slug}: unknown topic ${t}`);
      }
    }
    return problems;
  }

  counts(examId) {
    const c = { chapters: 0, topics: 0, subtopics: 0, concepts: 0, status: { official: 0, unverified: 0, draft: 0 } };
    for (const n of this.nodes.values()) {
      if (!this.isApplicable(examId, n.nodeId)) continue;
      c[{ chapter: 'chapters', topic: 'topics', subtopic: 'subtopics', concept: 'concepts' }[n.nodeType]]++;
      c.status[this.status(examId, n.nodeId)]++;
    }
    return c;
  }
}
