/**
 * AI Study Notes learning path progress (`learning_progress`), per student.
 * One record per completed item (topic or unit) of an exam. Topic names and
 * order always come from the syllabus, so only completion is stored here.
 * Every query filters by `userId`.
 */
export class LearningProgressStore {
  constructor({ learningProgress }) {
    this.progress = learningProgress;
  }

  /** Map itemId → completedAt for the given items of one exam. */
  async completed(userId, examId, itemIds) {
    const rows = await this.progress
      .find({ userId, examId, itemId: { $in: itemIds } }, { projection: { itemId: 1, completedAt: 1 } })
      .toArray();
    return new Map(rows.map((r) => [r.itemId, r.completedAt]));
  }

  /** Section states of one outline: Map sectionItemId → { state, ... }. */
  async sectionStates(userId, examId, unitId) {
    const prefix = unitId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '#';
    const rows = await this.progress.find({ userId, examId, itemId: { $regex: `^${prefix}` } }).toArray();
    return new Map(rows.map((r) => [r.itemId, r]));
  }

  /** state 'completed' | 'failed' | null (clear). A failure never replaces a completion. */
  async setSectionState(userId, { category, examId, subjectId, unitId, sectionItemId, state, error = null }) {
    const base = { userId, examId, itemId: sectionItemId };
    if (state === null) {
      await this.progress.deleteOne(base);
      return;
    }
    if (state === 'failed') {
      try {
        await this.progress.updateOne(
          { ...base, state: { $ne: 'completed' } },
          { $set: { kind: 'section', category, subjectId, topicId: unitId, state, error, failedAt: new Date() } },
          { upsert: true },
        );
      } catch (err) {
        if (err?.code !== 11000) throw err; // already completed: keep it
      }
      return;
    }
    await this.progress.updateOne(
      base,
      {
        $set: { kind: 'section', category, subjectId, topicId: unitId, state, completedAt: new Date(), updatedAt: new Date() },
        $unset: { error: '', failedAt: '' },
      },
      { upsert: true },
    );
  }

  /** Clears a previous failure after a successful generation. */
  clearSectionFailure(userId, examId, sectionItemId) {
    return this.progress.deleteOne({ userId, examId, itemId: sectionItemId, state: 'failed' });
  }

  /** Marks an item completed (idempotent) or not completed. */
  async set(userId, { category, examId, subjectId, topicId, itemId, completed }) {
    if (!completed) {
      await this.progress.deleteOne({ userId, examId, itemId });
      return;
    }
    await this.progress.updateOne(
      { userId, examId, itemId },
      {
        $setOnInsert: { completedAt: new Date() },
        $set: { category, subjectId, topicId, updatedAt: new Date() },
      },
      { upsert: true },
    );
  }
}
