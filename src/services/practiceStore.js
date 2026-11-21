import crypto from 'node:crypto';

/**
 * Practice sessions, results and saved sets in MongoDB.
 *
 * A session document holds the full questions INCLUDING correctIndex and
 * explanations. `toPublicSession` strips those before anything is sent to the
 * app, so answers are only revealed in the scored result.
 */
export class PracticeStore {
  constructor({ sessions, results, saved }, practiceConfig) {
    this.sessions = sessions;
    this.results = results;
    this.saved = saved;
    this.cfg = practiceConfig;
  }

  // ── Sessions ──────────────────────────────────────────────────────────────

  async createSession({ userId, exam, subjects, topics, difficulty, requestedCount, questions, isPreview, retryOf = null }) {
    const session = {
      _id: crypto.randomUUID(),
      userId,
      examId: exam.id,
      examName: exam.name,
      subjects,
      topics,
      difficulty,
      requestedCount,
      isPreview,
      retryOf,
      timeLimitSeconds: questions.length ? questions.length * this.cfg.secondsPerQuestion : null,
      questions,
      createdAt: new Date(),
    };
    await this.sessions.insertOne(session);
    return session;
  }

  findSession(userId, sessionId) {
    return this.sessions.findOne({ _id: sessionId, userId });
  }

  // ── Results ───────────────────────────────────────────────────────────────

  findResultBySession(userId, sessionId) {
    return this.results.findOne({ sessionId, userId });
  }

  findResult(userId, resultId) {
    return this.results.findOne({ _id: resultId, userId });
  }

  /** Scores and stores once per session; a repeat submit returns the first result. */
  async submit(session, { answers, timeTakenSeconds, autoSubmitted }) {
    const existing = await this.findResultBySession(session.userId, session._id);
    if (existing) return existing;

    const result = {
      _id: `res_${session._id}`,
      userId: session.userId,
      ...scoreSession(session, answers, this.cfg),
      timeTakenSeconds: Math.max(0, Math.round(timeTakenSeconds)),
      autoSubmitted: Boolean(autoSubmitted),
      completedAt: new Date(),
    };
    try {
      await this.results.insertOne(result);
    } catch (err) {
      // Two submits raced: the unique index on sessionId kept the first one.
      if (err?.code === 11000) return this.findResultBySession(session.userId, session._id);
      throw err;
    }
    return result;
  }

  /** Per-topic totals across all of a student's results (weak-topic practice). */
  topicStats(userId) {
    return this.results
      .aggregate([
        { $match: { userId } },
        { $unwind: "$topicStats" },
        {
          $group: {
            _id: "$topicStats.topicId",
            topicName: { $last: "$topicStats.topicName" },
            total: { $sum: "$topicStats.total" },
            correct: { $sum: "$topicStats.correct" },
          },
        },
        { $project: { _id: 0, topicId: "$_id", topicName: 1, total: 1, correct: 1 } },
      ])
      .toArray();
  }

  recentResults(userId, limit = 50) {
    return this.results.find({ userId }).sort({ completedAt: -1 }).limit(limit).toArray();
  }

  // ── Saved practice ────────────────────────────────────────────────────────

  /** Idempotent per (student, result). */
  async save(userId, result) {
    const doc = { _id: `saved_${result._id}`, userId, resultId: result._id, savedAt: new Date() };
    try {
      await this.saved.insertOne(doc);
      return doc;
    } catch (err) {
      if (err?.code === 11000) return this.saved.findOne({ userId, resultId: result._id });
      throw err;
    }
  }

  async listSaved(userId) {
    const saved = await this.saved.find({ userId }).sort({ savedAt: -1 }).toArray();
    const results = await this.results
      .find({ _id: { $in: saved.map((s) => s.resultId) }, userId })
      .toArray();
    const byId = new Map(results.map((r) => [r._id, r]));
    return saved.filter((s) => byId.has(s.resultId)).map((s) => ({ saved: s, result: byId.get(s.resultId) }));
  }

  async isSaved(userId, resultId) {
    return (await this.saved.countDocuments({ userId, resultId }, { limit: 1 })) > 0;
  }

  countSaved(userId) {
    return this.saved.countDocuments({ userId });
  }

  async deleteSaved(userId, id) {
    const { deletedCount } = await this.saved.deleteOne({ _id: id, userId });
    return deletedCount > 0;
  }
}

// ── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Marking: +correctMark per correct, −negativeMark per incorrect, 0 skipped.
 * Accuracy = correct ÷ attempted. Unknown ids / out-of-range options are ignored.
 */
export function scoreSession(session, answers, { correctMark = 1, negativeMark = 0.25 } = {}) {
  let correct = 0;
  let incorrect = 0;
  const topicTotals = new Map();
  const reviews = [];

  for (const q of session.questions) {
    let picked = answers?.[q.id];
    if (!Number.isInteger(picked) || picked < 0 || picked >= q.options.length) picked = null;
    const ok = picked === q.correctIndex;
    if (picked !== null) ok ? correct++ : incorrect++;

    const t = topicTotals.get(q.topicId) ?? { topicId: q.topicId, topicName: q.topicName, total: 0, correct: 0 };
    t.total++;
    if (ok) t.correct++;
    topicTotals.set(q.topicId, t);

    reviews.push({
      questionId: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      selectedIndex: picked,
      explanation: q.explanation,
      formula: q.formula ?? null,
      steps: q.steps ?? [],
      concept: q.concept ?? null,
      tip: q.tip ?? null,
      wrongReason: picked !== null && !ok ? (q.wrongReasons?.[picked] ?? null) : null,
    });
  }

  const total = session.questions.length;
  const attempted = correct + incorrect;
  return {
    sessionId: session._id,
    examName: session.examName,
    subjects: session.subjects,
    topics: session.topics,
    difficulty: session.difficulty,
    total,
    correct,
    incorrect,
    unattempted: total - attempted,
    score: correct * correctMark - incorrect * negativeMark,
    maxScore: total * correctMark,
    accuracy: attempted === 0 ? 0 : correct / attempted,
    reviews,
    topicStats: [...topicTotals.values()],
  };
}

// ── Public JSON shapes (match the app's fromJson) ──────────────────────────

/** Session for the app: NO correctIndex / explanation. */
export function toPublicSession(s) {
  return {
    sessionId: s._id,
    examId: s.examId,
    examName: s.examName,
    subjects: s.subjects,
    topics: s.topics,
    difficulty: s.difficulty,
    requestedCount: s.requestedCount,
    timeLimitSeconds: s.timeLimitSeconds,
    isPreview: s.isPreview,
    questions: s.questions.map((q) => ({
      id: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      question: q.question,
      options: q.options,
    })),
  };
}

export function toPublicResult(r) {
  return {
    resultId: r._id,
    sessionId: r.sessionId,
    examName: r.examName,
    subjects: r.subjects,
    topics: r.topics,
    difficulty: r.difficulty,
    total: r.total,
    correct: r.correct,
    incorrect: r.incorrect,
    unattempted: r.unattempted,
    score: r.score,
    maxScore: r.maxScore,
    accuracy: r.accuracy,
    timeTakenSeconds: r.timeTakenSeconds,
    completedAt: new Date(r.completedAt).toISOString(),
    autoSubmitted: r.autoSubmitted,
    reviews: r.reviews,
    topicStats: r.topicStats,
  };
}

export function toPublicSaved({ saved, result }) {
  return {
    id: saved._id,
    savedAt: new Date(saved.savedAt).toISOString(),
    result: toPublicResult(result),
  };
}
