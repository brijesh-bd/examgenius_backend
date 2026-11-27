import crypto from 'node:crypto';

import { CONTENT_VERSION } from './notesGenerator.js';

/**
 * AI Study Notes (`study_notes`), per student.
 *  - Every query filters by `userId` (ownership is checked on every request).
 *  - `category` is stored on every note and list queries require it, so
 *    Railway / SSC / Banking notes never mix.
 *  - Generating the same topic again creates a NEW note; nothing is overwritten.
 *  - Only `personalNote` and `bookmarked` can change after creation.
 */
export class NotesStore {
  constructor({ studyNotes }) {
    this.notes = studyNotes;
  }

  findByRequestKey(userId, requestKey) {
    if (!requestKey) return null;
    return this.notes.findOne({ userId, requestKey });
  }

  /** This student's latest note for the same notes-cache key (topic × language × versions). */
  findByCacheKey(userId, cacheKey) {
    if (!cacheKey) return null;
    return this.notes.findOne({ userId, cacheKey }, { sort: { createdAt: -1 } });
  }

  find(userId, id) {
    return this.notes.findOne({ _id: id, userId });
  }

  /** Saves a generated note. A retried request (same requestKey) returns the saved one. */
  async create({ userId, requestKey = null, exam, subject, topic, parentTopic = null, unitName = null, language, level, sections, content, model, extra = {} }) {
    const now = new Date();
    const note = {
      _id: crypto.randomUUID(),
      userId,
      requestKey,
      category: exam.categoryId,
      examId: exam.id,
      examName: exam.name,
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      topicName: topic.name,
      // Unit of a broad topic (learning path); null for a whole topic.
      parentTopicId: parentTopic?.id ?? null,
      parentTopicName: parentTopic?.name ?? null,
      unitName,
      language,
      explanationLevel: level,
      sections,
      generatedContent: content,
      generationModel: model ?? null,
      contentVersion: CONTENT_VERSION,
      bookmarked: false,
      personalNote: '',
      ...extra,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.notes.insertOne(note);
      return { note, created: true };
    } catch (err) {
      if (err?.code === 11000 && requestKey) {
        const existing = await this.findByRequestKey(userId, requestKey);
        if (existing) return { note: existing, created: false };
      }
      throw err;
    }
  }

  async list(userId, { category, examId, subjectId, topicId, language, level, bookmarked, hasPersonalNote, from, to, q, sort, page, pageSize }) {
    const filter = { userId, category };
    if (examId) filter.examId = examId;
    if (subjectId) filter.subjectId = subjectId;
    if (topicId) filter.topicId = topicId;
    if (language) filter.language = language;
    if (level) filter.explanationLevel = level;
    if (bookmarked !== undefined) filter.bookmarked = bookmarked;
    if (hasPersonalNote === true) filter.personalNote = { $nin: ['', null] };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ topicName: rx }, { subjectName: rx }, { examName: rx }, { personalNote: rx }];
    }
    const total = await this.notes.countDocuments(filter);
    const items = await this.notes
      .find(filter, { projection: { generatedContent: 0 } })
      .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    return { items, total, page, pageSize, hasMore: page * pageSize < total };
  }

  /** Filter options for one category, from this student's own notes only. */
  async facets(userId, category) {
    const [row] = await this.notes
      .aggregate([
        { $match: { userId, category } },
        {
          $facet: {
            exams: [{ $group: { _id: '$examId', name: { $first: '$examName' } } }, { $sort: { name: 1 } }],
            subjects: [
              { $group: { _id: '$subjectId', name: { $first: '$subjectName' }, examIds: { $addToSet: '$examId' } } },
              { $sort: { name: 1 } },
            ],
            topics: [
              {
                $group: {
                  _id: '$topicId',
                  name: { $first: '$topicName' },
                  subjectId: { $first: '$subjectId' },
                  examIds: { $addToSet: '$examId' },
                },
              },
              { $sort: { name: 1 } },
            ],
          },
        },
      ])
      .toArray();
    const named = ({ _id, ...rest }) => ({ id: _id, ...rest });
    return {
      exams: (row?.exams ?? []).map(named),
      subjects: (row?.subjects ?? []).map(named),
      topics: (row?.topics ?? []).map(named),
    };
  }

  /** This student's latest saved note for one outline section (any version). */
  findSectionNote(userId, { unitId, chapterId, sectionId, language, mode }) {
    const filter = { userId, outlineUnitId: unitId, chapterId, sectionId };
    if (language) filter.language = language;
    if (mode) filter.learningMode = mode;
    return this.notes.findOne(filter, { sort: { createdAt: -1 } });
  }

  countSectionVersions(userId, { unitId, chapterId, sectionId, language, mode }) {
    return this.notes.countDocuments({ userId, outlineUnitId: unitId, chapterId, sectionId, language, learningMode: mode });
  }

  /** Latest note per section of one outline for this student (no content). */
  async sectionNotes(userId, unitId, language, mode) {
    const rows = await this.notes
      .find({ userId, outlineUnitId: unitId, language, learningMode: mode }, { projection: { generatedContent: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    const latest = new Map();
    for (const r of rows) {
      const k = `${r.chapterId}.${r.sectionId}`;
      if (!latest.has(k)) latest.set(k, { id: r._id, versions: 0 });
      latest.get(k).versions++;
    }
    return latest;
  }

  /** Map topicId → { latestId, count } of this student's notes for one exam. */
  async statsByTopic(userId, examId, topicIds) {
    const rows = await this.notes
      .aggregate([
        { $match: { userId, examId, topicId: { $in: topicIds } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$topicId', latestId: { $first: '$_id' }, count: { $sum: 1 } } },
      ])
      .toArray();
    return new Map(rows.map((r) => [r._id, { latestId: r.latestId, count: r.count }]));
  }

  /** Note counts per category (for the Library home). */
  async summary(userId) {
    const rows = await this.notes
      .aggregate([{ $match: { userId } }, { $group: { _id: '$category', notes: { $sum: 1 } } }])
      .toArray();
    return {
      total: rows.reduce((n, r) => n + r.notes, 0),
      categories: rows.map((r) => ({ category: r._id, notes: r.notes })),
    };
  }

  /** Changes only the student's own fields; returns the updated note or null. */
  async update(userId, id, { personalNote, bookmarked }) {
    const $set = { updatedAt: new Date() };
    if (personalNote !== undefined) $set.personalNote = personalNote;
    if (bookmarked !== undefined) $set.bookmarked = bookmarked;
    return this.notes.findOneAndUpdate({ _id: id, userId }, { $set }, { returnDocument: 'after' });
  }

  async delete(userId, id) {
    const r = await this.notes.deleteOne({ _id: id, userId });
    return r.deletedCount === 1;
  }
}

/** API shape. List items omit the (large) content. */
export function toPublicNote(n, { withContent = true } = {}) {
  return {
    id: n._id,
    category: n.category,
    examId: n.examId,
    examName: n.examName,
    subjectId: n.subjectId,
    subjectName: n.subjectName,
    topicId: n.topicId,
    topicName: n.topicName,
    parentTopicId: n.parentTopicId ?? null,
    parentTopicName: n.parentTopicName ?? null,
    unitName: n.unitName ?? null,
    language: n.language,
    explanationLevel: n.explanationLevel,
    sections: n.sections ?? [],
    generationModel: n.generationModel,
    contentVersion: n.contentVersion,
    bookmarked: Boolean(n.bookmarked),
    personalNote: n.personalNote ?? '',
    // Outline section notes (null for single-topic notes).
    kind: n.kind ?? 'topic',
    outlineUnitId: n.outlineUnitId ?? null,
    chapterId: n.chapterId ?? null,
    sectionId: n.sectionId ?? null,
    chapterTitle: n.chapterTitle ?? null,
    sectionTitle: n.sectionTitle ?? null,
    learningMode: n.learningMode ?? null,
    sectionVersion: n.sectionVersion ?? null,
    sourceType: n.sourceType ?? 'ai_generated',
    sourceReferences: n.sourceReferences ?? [],
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    ...(withContent && n.generatedContent ? { content: n.generatedContent } : {}),
  };
}
