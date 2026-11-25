import crypto from 'node:crypto';

/**
 * Shared bank of validated AI questions (`questionBank` collection).
 *
 * Every question Gemini generates is stored once and reused for other
 * students, so most practice sets cost nothing. Students are not served
 * questions they have already seen in their own recent tests.
 */
export class QuestionBank {
  /**
   * @param {import('mongodb').Collection} bank
   * @param {import('mongodb').Collection} sessions
   */
  constructor(bank, sessions) {
    this.bank = bank;
    this.sessions = sessions;
  }

  /** Bank ids this student met in their last [limit] tests. */
  async seenBy(userId, limit = 300) {
    const rows = await this.sessions
      .find({ userId }, { projection: { 'questions.bankId': 1 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    const ids = new Set();
    for (const s of rows) for (const q of s.questions ?? []) if (q.bankId) ids.add(q.bankId);
    return [...ids];
  }

  /**
   * Up to [count] unseen AI questions for these topics/level/language,
   * spread across the requested topics as evenly as the bank allows.
   */
  async pick({ topicIds, nodeIds = null, difficulty, language, count, excludeIds = [] }) {
    if (count <= 0) return [];
    const base = { difficulty, language, source: 'ai', _id: { $nin: excludeIds } };
    // Concept-scoped sets only use questions tagged with one of those concepts.
    if (nodeIds) base.nodeId = { $in: nodeIds };
    const perTopic = Math.ceil(count / topicIds.length);
    const picked = [];
    for (const topicId of topicIds) {
      const rows = await this.bank
        .aggregate([{ $match: { ...base, topicId } }, { $sample: { size: perTopic } }])
        .toArray();
      picked.push(...rows);
    }
    // Top up from any requested topic if some topics were thin.
    if (picked.length < count) {
      const have = picked.map((q) => q._id);
      const more = await this.bank
        .aggregate([
          { $match: { ...base, topicId: { $in: topicIds }, _id: { $nin: [...excludeIds, ...have] } } },
          { $sample: { size: count - picked.length } },
        ])
        .toArray();
      picked.push(...more);
    }
    shuffle(picked);
    return picked.slice(0, count).map(fromBankDoc);
  }

  /**
   * Stored questions matching the filters: `total`, and `unseen` (not in
   * this student's recent tests). Used to check a bank set BEFORE creating it.
   */
  async availability({ topicIds, nodeIds = null, difficulty, language, seenIds = [] }) {
    const match = { difficulty, language, source: 'ai', topicId: { $in: topicIds } };
    if (nodeIds) match.nodeId = { $in: nodeIds };
    const [total, seen] = await Promise.all([
      this.bank.countDocuments(match),
      seenIds.length ? this.bank.countDocuments({ ...match, _id: { $in: seenIds } }) : 0,
    ]);
    return { total, unseen: total - seen };
  }

  /**
   * A full bank set: unseen questions first; when those run out, questions
   * the student has met before (never more than the bank holds).
   */
  async pickSet({ topicIds, nodeIds = null, difficulty, language, count, seenIds = [] }) {
    const fresh = await this.pick({ topicIds, nodeIds, difficulty, language, count, excludeIds: seenIds });
    if (fresh.length >= count) return fresh;
    const again = await this.pick({
      topicIds,
      nodeIds,
      difficulty,
      language,
      count: count - fresh.length,
      excludeIds: fresh.map((q) => q.bankId),
    });
    return [...fresh, ...again];
  }

  /**
   * Stores AI questions (skipping duplicates) and returns them with their
   * `bankId`, ready to put into a session.
   */
  async add(questions, { examId, language, model }) {
    const now = new Date();
    const docs = questions.map((q) => ({
      _id: crypto.randomUUID(),
      fingerprint: fingerprint(language, q),
      source: 'ai',
      examId,
      language,
      model: model ?? null,
      topicId: q.topicId,
      nodeId: q.nodeId ?? null,
      validation: q.validation ?? null,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      formula: q.formula ?? null,
      steps: q.steps ?? [],
      concept: q.concept ?? null,
      tip: q.tip ?? null,
      wrongReasons: q.wrongReasons ?? null,
      createdAt: now,
    }));
    if (docs.length) {
      try {
        await this.bank.insertMany(docs, { ordered: false });
      } catch (err) {
        // Duplicate fingerprints are expected (same question generated twice).
        if (err?.code !== 11000 && !err?.writeErrors?.every?.((e) => e.code === 11000)) throw err;
      }
    }
    return docs.map((d, i) => ({ ...questions[i], bankId: d._id }));
  }

  count(filter = {}) {
    return this.bank.countDocuments(filter);
  }
}

/** Same question text + options in the same language = same question. */
export function fingerprint(language, q) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto
    .createHash('sha256')
    .update([language, norm(q.question), ...q.options.map(norm).sort()].join('|'))
    .digest('hex');
}

function fromBankDoc(d) {
  return {
    id: crypto.randomUUID(), // per-session id; bankId links back to the bank
    bankId: d._id,
    topicId: d.topicId,
    nodeId: d.nodeId ?? null,
    validation: d.validation ?? null,
    difficulty: d.difficulty,
    question: d.question,
    options: d.options,
    correctIndex: d.correctIndex,
    explanation: d.explanation,
    formula: d.formula,
    steps: d.steps,
    concept: d.concept,
    tip: d.tip,
    wrongReasons: d.wrongReasons,
  };
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
