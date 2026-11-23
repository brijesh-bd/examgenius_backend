import crypto from 'node:crypto';

/**
 * My Learning Library: every generated question set (`practice_sets`) and every
 * scored attempt on it (`practice_attempts`), per student.
 *
 * Rules:
 *  - Every query filters by `userId` — a student can never read another's data.
 *  - `category` (railway / ssc / banking …) is stored on every record and list
 *    queries require it, so categories never mix.
 *  - A set keeps the full questions INCLUDING answers; they leave the server
 *    only after the student has attempted the set at least once.
 *  - Attempts are append-only: each submit is a new record with the next
 *    attemptNo; nothing is overwritten.
 */
export class LibraryStore {
  constructor({ practiceSets, practiceAttempts, bookmarks, userNotes, mistakeQuestions }) {
    this.sets = practiceSets;
    this.attempts = practiceAttempts;
    this.bookmarks = bookmarks;
    this.notes = userNotes;
    this.mistakes = mistakeQuestions;
  }

  // ── Sets ──────────────────────────────────────────────────────────────────

  findByRequestKey(userId, requestKey) {
    if (!requestKey) return null;
    return this.sets.findOne({ userId, requestKey });
  }

  findSet(userId, setId) {
    return this.sets.findOne({ _id: setId, userId });
  }

  /**
   * Saves a freshly generated set. With a `requestKey`, a retried request
   * returns the set already saved instead of creating a duplicate
   * (`{ set, created: false }`).
   */
  async createSet({
    id = crypto.randomUUID(),
    userId,
    requestKey = null,
    exam,
    subjects,
    topics,
    difficulty,
    language,
    questions,
    sessionId,
    model = null,
    source = null,
    isPreview = false,
  }) {
    const set = {
      _id: id,
      userId,
      requestKey,
      category: exam.categoryId,
      examId: exam.id,
      examName: exam.name,
      subjects, // [{ id, name }]
      topics, // [{ id, name, subjectId }]
      difficulty,
      language,
      questionCount: questions.length,
      questions,
      sessionId, // the first test created from this set
      model,
      source, // { bank, ai }
      isPreview,
      stats: { attempts: 0 },
      createdAt: new Date(),
    };
    try {
      await this.sets.insertOne(set);
      return { set, created: true };
    } catch (err) {
      if (err?.code === 11000 && requestKey) {
        return { set: await this.findByRequestKey(userId, requestKey), created: false };
      }
      throw err;
    }
  }

  /** Deletes a set and everything linked to it. */
  async deleteSet(userId, setId) {
    const { deletedCount } = await this.sets.deleteOne({ _id: setId, userId });
    if (!deletedCount) return false;
    await Promise.all(
      [this.attempts, this.bookmarks, this.notes, this.mistakes].map((c) => c.deleteMany({ userId, setId })),
    );
    return true;
  }

  /**
   * One page of a category's sets. Filters: examId, subjectId, topicId,
   * difficulty, language, from/to (ISO dates), q (search in exam / subject /
   * topic names), sort latest|oldest.
   */
  async listSets(userId, f) {
    const query = { userId, category: f.category };
    if (f.examId) query.examId = f.examId;
    if (f.subjectId) query['subjects.id'] = f.subjectId;
    if (f.topicId) query['topics.id'] = f.topicId;
    if (f.difficulty) query.difficulty = f.difficulty;
    if (f.language) query.language = f.language;
    if (f.from || f.to) {
      query.createdAt = {};
      if (f.from) query.createdAt.$gte = new Date(f.from);
      if (f.to) query.createdAt.$lte = new Date(f.to);
    }
    if (f.q) {
      const rx = new RegExp(escapeRegex(f.q.trim()), 'i');
      query.$or = [{ examName: rx }, { 'subjects.name': rx }, { 'topics.name': rx }];
    }
    const total = await this.sets.countDocuments(query);
    const items = await this.sets
      .find(query, { projection: { questions: 0 } })
      .sort({ createdAt: f.sort === 'oldest' ? 1 : -1, _id: 1 })
      .skip((f.page - 1) * f.pageSize)
      .limit(f.pageSize)
      .toArray();
    return { items, total, page: f.page, pageSize: f.pageSize };
  }

  /** Exams / subjects / topics present in a category, for the filter chips. */
  async facets(userId, category) {
    const rows = await this.sets
      .aggregate([
        { $match: { userId, category } },
        {
          $facet: {
            exams: [{ $group: { _id: '$examId', name: { $first: '$examName' } } }, { $sort: { name: 1 } }],
            subjects: [
              { $unwind: '$subjects' },
              { $group: { _id: '$subjects.id', name: { $first: '$subjects.name' }, examIds: { $addToSet: '$examId' } } },
              { $sort: { name: 1 } },
            ],
            topics: [
              { $unwind: '$topics' },
              {
                $group: {
                  _id: '$topics.id',
                  name: { $first: '$topics.name' },
                  subjectId: { $first: '$topics.subjectId' },
                  examIds: { $addToSet: '$examId' },
                },
              },
              { $sort: { name: 1 } },
            ],
          },
        },
      ])
      .toArray();
    const { exams, subjects, topics } = rows[0];
    const id = ({ _id, ...rest }) => ({ id: _id, ...rest });
    return { exams: exams.map(id), subjects: subjects.map(id), topics: topics.map(id) };
  }

  /** Totals for the Library dashboard. */
  async summary(userId, recentLimit = 5) {
    const [byCategory, bookmarks, notes, mistakes, recent] = await Promise.all([
      this.sets
        .aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$category',
              sets: { $sum: 1 },
              questions: { $sum: '$questionCount' },
              attempted: { $sum: { $cond: [{ $gt: ['$stats.attempts', 0] }, 1, 0] } },
            },
          },
        ])
        .toArray(),
      this.bookmarks.countDocuments({ userId }),
      this.notes.countDocuments({ userId }),
      this.mistakes.countDocuments({ userId, resolved: { $ne: true } }),
      this.sets
        .find({ userId }, { projection: { questions: 0 } })
        .sort({ createdAt: -1 })
        .limit(recentLimit)
        .toArray(),
    ]);
    const categories = byCategory.map(({ _id, ...c }) => ({ category: _id, ...c }));
    return {
      totalSets: categories.reduce((n, c) => n + c.sets, 0),
      totalQuestions: categories.reduce((n, c) => n + c.questions, 0),
      bookmarks,
      notes,
      mistakes,
      categories,
      recent,
    };
  }

  // ── Attempts ──────────────────────────────────────────────────────────────

  /**
   * Records a scored result as a new attempt on its set. Idempotent per
   * result (a repeated submit does not add a second attempt).
   */
  /** Attempts of one set, newest first (append-only history). */
  listAttempts(userId, setId) {
    return this.attempts.find({ userId, setId }).sort({ completedAt: -1 }).limit(100).toArray();
  }

  async recordAttempt(set, result) {
    const attempt = {
      _id: `att_${result._id}`,
      userId: set.userId,
      setId: set._id,
      resultId: result._id,
      sessionId: result.sessionId,
      category: set.category,
      examId: set.examId,
      attemptNo: null,
      total: result.total,
      correct: result.correct,
      incorrect: result.incorrect,
      unattempted: result.unattempted,
      score: result.score,
      maxScore: result.maxScore,
      accuracy: result.accuracy,
      timeTakenSeconds: result.timeTakenSeconds,
      completedAt: result.completedAt,
    };
    try {
      await this.attempts.insertOne(attempt);
    } catch (err) {
      if (err?.code === 11000) return this.attempts.findOne({ _id: attempt._id });
      throw err;
    }
    const updated = await this.sets.findOneAndUpdate(
      { _id: set._id, userId: set.userId },
      {
        $inc: { 'stats.attempts': 1 },
        $max: { 'stats.bestScore': result.score },
        $set: {
          'stats.latestScore': result.score,
          'stats.latestMaxScore': result.maxScore,
          'stats.latestAccuracy': result.accuracy,
          'stats.latestResultId': result._id,
          'stats.lastAttemptAt': result.completedAt,
        },
      },
      { returnDocument: 'after', projection: { 'stats.attempts': 1 } },
    );
    attempt.attemptNo = updated?.stats.attempts ?? 1;
    await this.attempts.updateOne({ _id: attempt._id }, { $set: { attemptNo: attempt.attemptNo } });
    return attempt;
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Public JSON shapes ─────────────────────────────────────────────────────

/** Library card: metadata + attempt stats, never the questions. */
export function toPublicSet(s) {
  const st = s.stats ?? {};
  return {
    id: s._id,
    category: s.category,
    examId: s.examId,
    examName: s.examName,
    subjects: s.subjects,
    topics: s.topics,
    difficulty: s.difficulty,
    language: s.language,
    questionCount: s.questionCount,
    isPreview: Boolean(s.isPreview),
    createdAt: new Date(s.createdAt).toISOString(),
    stats: {
      attempts: st.attempts ?? 0,
      latestScore: st.latestScore ?? null,
      latestMaxScore: st.latestMaxScore ?? null,
      latestAccuracy: st.latestAccuracy ?? null,
      latestResultId: st.latestResultId ?? null,
      bestScore: st.bestScore ?? null,
      lastAttemptAt: st.lastAttemptAt ? new Date(st.lastAttemptAt).toISOString() : null,
    },
  };
}
