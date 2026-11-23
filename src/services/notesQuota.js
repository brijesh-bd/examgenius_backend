/**
 * Hourly AI Study Notes quota per student. Only SUCCESSFUL new AI
 * generations are recorded; cached sections and failed attempts are free.
 * Separate from question generation and from Free plan daily sets.
 */
export class NotesQuota {
  constructor({ aiGenerationLog }, { perHour }) {
    this.log = aiGenerationLog;
    this.perHour = perHour;
  }

  async used(userId, now = new Date()) {
    return this.log.countDocuments({ userId, kind: 'notes', at: { $gt: new Date(now.getTime() - 3_600_000) } });
  }

  /** Throws a 429-style error when the hour's quota is used up. */
  async check(userId) {
    const used = await this.used(userId);
    if (used >= this.perHour) {
      const err = new Error('Hourly notes limit reached. Please try again later.');
      err.status = 429;
      err.code = 'NOTES_HOURLY';
      throw err;
    }
    return used;
  }

  record(userId, detail = {}) {
    return this.log.insertOne({ userId, kind: 'notes', at: new Date(), ...detail });
  }
}
