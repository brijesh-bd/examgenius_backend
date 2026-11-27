import crypto from 'node:crypto';

import { SYLLABI } from '../data/syllabusTrees/index.js';

const VERSION = 2;

/**
 * MongoDB mirror of every hierarchical syllabus (source of truth:
 * src/data/syllabusTrees + src/data/railwayMath, reviewed in git). The API
 * serves the in-memory data; these collections make it queryable/joinable.
 *
 *   syllabus_nodes        one doc per library node, _id "<syllabusId>:<nodeId>"
 *   syllabus_exam_nodes   one doc per exam × node: status, sources, difficulty, stages
 *   syllabus_node_history previous version of a node whenever its content changes
 *   syllabus_sync_log     one entry per sync run
 *
 * sync() is idempotent and never deletes: removed nodes/mappings become
 * isActive=false. (syllabus_exam_map from v1 is left untouched.)
 */
export class SyllabusStore {
  constructor(db) {
    this.nodes = db.collection('syllabus_nodes');
    this.examNodes = db.collection('syllabus_exam_nodes');
    this.history = db.collection('syllabus_node_history');
    this.log = db.collection('syllabus_sync_log');
  }

  async ensureIndexes() {
    await Promise.all([
      this.nodes.createIndex({ syllabusId: 1, nodeId: 1 }, { unique: true }),
      this.nodes.createIndex({ syllabusId: 1, parentId: 1, displayOrder: 1 }),
      this.nodes.createIndex({ subjectId: 1, nodeType: 1 }),
      this.examNodes.createIndex({ examId: 1, subjectId: 1, nodeId: 1 }, { unique: true }),
      this.examNodes.createIndex({ examId: 1, subjectId: 1, parentId: 1, displayOrder: 1 }),
      this.examNodes.createIndex({ status: 1 }),
      this.history.createIndex({ syllabusId: 1, nodeId: 1, archivedAt: -1 }),
    ]);
  }

  async sync({ now = new Date() } = {}) {
    await this.ensureIndexes();
    const result = { inserted: 0, updated: 0, unchanged: 0, deactivated: 0, mappings: 0, mappingsDeactivated: 0 };
    const existing = new Map((await this.nodes.find({}).toArray()).map((d) => [d._id, d]));
    const ops = [];
    for (const doc of nodeDocuments()) {
      const old = existing.get(doc._id);
      existing.delete(doc._id);
      if (old && old.contentHash === doc.contentHash && old.isActive) {
        result.unchanged++;
        continue;
      }
      if (old) {
        await this.history.insertOne({ ...old, _id: crypto.randomUUID(), archivedAt: now });
        result.updated++;
      } else {
        result.inserted++;
      }
      ops.push({
        updateOne: { filter: { _id: doc._id }, update: { $set: { ...doc, updatedAt: now }, $setOnInsert: { createdAt: now } }, upsert: true },
      });
    }
    for (const old of existing.values()) {
      if (!old.isActive) continue;
      ops.push({ updateOne: { filter: { _id: old._id }, update: { $set: { isActive: false, updatedAt: now } } } });
      result.deactivated++;
    }
    if (ops.length) await this.nodes.bulkWrite(ops, { ordered: false });

    const maps = mappingDocuments();
    const keep = new Set(maps.map((m) => m._id));
    const mapOps = maps.map((m) => ({
      updateOne: { filter: { _id: m._id }, update: { $set: { ...m, updatedAt: now }, $setOnInsert: { createdAt: now } }, upsert: true },
    }));
    for (const d of await this.examNodes.find({ isActive: true }, { projection: { _id: 1 } }).toArray()) {
      if (keep.has(d._id)) continue;
      mapOps.push({ updateOne: { filter: { _id: d._id }, update: { $set: { isActive: false, updatedAt: now } } } });
      result.mappingsDeactivated++;
    }
    if (mapOps.length) await this.examNodes.bulkWrite(mapOps, { ordered: false });
    result.mappings = maps.length;

    await this.log.insertOne({ _id: crypto.randomUUID(), version: VERSION, at: now, ...result });
    return result;
  }
}

/** Library node documents (exam-independent). Pure. */
export function nodeDocuments() {
  return SYLLABI.flatMap((s) =>
    [...s.nodes.values()].map((n) => {
      const content = {
        syllabusId: s.syllabusId,
        subjectId: s.subjectId,
        nodeId: n.nodeId,
        parentId: n.parentId,
        nodeType: n.nodeType,
        titleEn: n.titleEn,
        titleHi: n.titleHi,
        displayName: n.titleEn,
        description: null,
        questionPatterns: n.patterns ?? [],
        textMcqPossible: !n.hidden,
        legacyTopicId: n.legacyTopicId ?? n.practiceTopicId ?? null,
        displayOrder: n.displayOrder,
        syllabusVersion: VERSION,
        isActive: true,
      };
      const contentHash = crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
      return { _id: `${s.syllabusId}:${n.nodeId}`, ...content, contentHash };
    }),
  );
}

/** Exam × node mapping documents (only nodes the exam includes). Pure. */
export function mappingDocuments() {
  const out = [];
  for (const s of SYLLABI) {
    for (const examId of s.examIds()) {
      for (const n of s.nodes.values()) {
        if (!s.isApplicable(examId, n.nodeId)) continue;
        out.push({
          _id: `${examId}:${n.nodeId}`,
          examId,
          subjectId: s.subjectId,
          syllabusId: s.syllabusId,
          nodeId: n.nodeId,
          parentId: n.parentId,
          displayOrder: n.displayOrder,
          classification: s.status(examId, n.nodeId) === 'official' ? 'official' : 'additional_practice',
          status: s.status(examId, n.nodeId),
          sourceReferences: s.sources(examId, n.nodeId),
          notificationReference: (n.chapterSlug && s.entry?.(examId, n.chapterSlug)?.ref) ?? null,
          difficulty: s.difficulty(examId),
          // Exam stages (banking: prelims / mains / descriptive / single); [] = not staged.
          stages: (n.chapterSlug && s.entry?.(examId, n.chapterSlug)?.stages) ?? [],
          isActive: true,
        });
      }
    }
  }
  return out;
}
