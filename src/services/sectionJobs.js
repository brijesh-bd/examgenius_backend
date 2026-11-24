/**
 * Generation jobs per shared section (`section_jobs`, _id = cache key).
 *
 * - A short LEASE lock makes sure only one server/process generates a given
 *   section at a time (safe with several backend instances). A crashed
 *   worker's lease simply expires.
 * - The job remembers the last outcome for that section so the app can show
 *   an accurate status and a retry option:
 *     generating | validation_failed | incomplete | failed | done
 * - Failure status lives here, not in the shared cache: invalid content is
 *   never cached or published.
 */
export const JOB_LEASE_MS = 5 * 60_000;

export class SectionJobs {
  constructor({ sectionJobs }, clock = () => new Date()) {
    this.jobs = sectionJobs;
    this.now = clock;
  }

  /**
   * Takes the lease for [key]. Returns true when this caller may generate;
   * false while another worker holds an unexpired lease.
   */
  async acquire(key, owner, meta = {}) {
    const now = this.now();
    const until = new Date(now.getTime() + JOB_LEASE_MS);
    try {
      const r = await this.jobs.findOneAndUpdate(
        { _id: key, $or: [{ state: { $ne: 'generating' } }, { leaseUntil: { $lt: now } }] },
        {
          $set: { state: 'generating', owner, leaseUntil: until, startedAt: now, ...meta },
          $inc: { attempts: 1 },
        },
        { upsert: true, returnDocument: 'after' },
      );
      return r?.owner === owner;
    } catch (err) {
      // Upsert collided with a held lease (duplicate _id) = someone else generates.
      if (err?.code === 11000) return false;
      throw err;
    }
  }

  /** Releases the lease with the outcome. */
  async finish(key, owner, { state, error = null, missing = null, repairAttempts = 0 }) {
    await this.jobs.updateOne(
      { _id: key, owner },
      {
        $set: {
          state,
          error: error ? String(error).slice(0, 500) : null,
          missing,
          repairAttempts,
          leaseUntil: null,
          finishedAt: this.now(),
        },
      },
    );
  }

  get(key) {
    return this.jobs.findOne({ _id: key });
  }

  /** Job states for many keys (outline / tree views). */
  async states(keys) {
    const rows = await this.jobs.find({ _id: { $in: keys } }, { projection: { state: 1, leaseUntil: 1, missing: 1, error: 1 } }).toArray();
    const now = this.now();
    return new Map(
      rows.map((r) => [
        r._id,
        // An expired lease is not "generating" any more.
        r.state === 'generating' && r.leaseUntil && r.leaseUntil < now ? { ...r, state: 'failed' } : r,
      ]),
    );
  }
}
