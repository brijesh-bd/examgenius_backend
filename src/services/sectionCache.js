/**
 * Shared, validated study-section content (`section_cache`), reused by every
 * student who opens the same section with the same identity (all part of
 * the key): unit/chapter/section, language, learning mode, syllabus,
 * outline, manifest, prompt and content-schema versions.
 *
 * Holds NO personal data: no userId, progress, bookmarks or personal notes.
 *
 * Status of an entry (only checked content is ever stored):
 *   published               passed every automatic check; served to students
 *                           (review: 'auto' — AI-checked, not human-reviewed)
 *   approved                human-reviewed; served to students
 *   ready_for_review        made from a DRAFT outline/manifest (admin preview);
 *                           never served to students
 *   rejected_lower_quality  a regeneration that scored below the entry being
 *                           served; kept for audit, never served
 *   invalidated             withdrawn (e.g. after a correction)
 * Failed / incomplete generations are NOT stored here (see section_jobs).
 */
export const STUDENT_STATUSES = ['published', 'approved'];
export const PREVIEW_STATUSES = ['published', 'approved', 'ready_for_review'];

/** Higher is better: coverage first, then MCQs, then depth. */
export function qualityScore(quality) {
  const cov = quality?.coverage;
  const ratio = cov ? cov.concepts.covered / Math.max(1, cov.concepts.required) : 1;
  return [ratio, quality?.checks?.mcqs?.value ?? 0, quality?.words ?? 0];
}

const better = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
};

export class SectionCache {
  constructor({ sectionCache }) {
    this.cache = sectionCache;
  }

  static key({
    unitId,
    chapterId,
    sectionId,
    language,
    mode,
    outlineVersion,
    promptVersion,
    syllabusVersion = 1,
    manifestVersion = 0,
    schemaVersion = 1,
  }) {
    return [
      unitId,
      chapterId,
      sectionId,
      language,
      mode,
      `s${syllabusVersion}`,
      `o${outlineVersion}`,
      `m${manifestVersion}`,
      `p${promptVersion}`,
      `c${schemaVersion}`,
    ].join('|');
  }

  /** Latest servable revision for a key (students: published/approved). */
  current(key, { statuses = STUDENT_STATUSES } = {}) {
    return this.cache.findOne({ key, status: { $in: statuses } }, { sort: { rev: -1 } });
  }

  /** Keys (of [keys]) that have servable content. */
  async servableKeys(keys, { statuses = STUDENT_STATUSES } = {}) {
    const rows = await this.cache
      .find({ key: { $in: keys }, status: { $in: statuses } }, { projection: { key: 1 } })
      .toArray();
    return new Set(rows.map((r) => r.key));
  }

  /**
   * Stores a new revision. Never overwrites: a regeneration that scores
   * below the entry currently served is stored as rejected_lower_quality and
   * the existing entry is returned instead (good content is never replaced
   * by worse). Returns the entry to serve.
   */
  async put(key, { content, quality, model, unitId, status = 'published', meta = {} }) {
    const servedStatuses = status === 'ready_for_review' ? PREVIEW_STATUSES : STUDENT_STATUSES;
    const served = await this.current(key, { statuses: servedStatuses });
    const latest = await this.cache.findOne({ key }, { sort: { rev: -1 }, projection: { rev: 1 } });
    const rev = (latest?.rev ?? 0) + 1;
    const lower = Boolean(served) && better(qualityScore(served.quality), qualityScore(quality));
    const doc = {
      _id: `${key}#r${rev}`,
      key,
      rev,
      unitId,
      status: lower ? 'rejected_lower_quality' : status,
      review: status === 'approved' ? 'human' : 'auto',
      content,
      quality,
      model,
      ...meta,
      createdAt: new Date(),
    };
    try {
      await this.cache.insertOne(doc);
    } catch (err) {
      // Same revision written concurrently: keep the other one.
      if (err?.code === 11000) return this.current(key, { statuses: servedStatuses });
      throw err;
    }
    return lower ? served : doc;
  }

  /** Stops serving cached content (e.g. after a correction). Returns count. */
  async invalidate({ unitId, key }) {
    const filter = { status: { $in: PREVIEW_STATUSES }, ...(key ? { key } : { unitId }) };
    const r = await this.cache.updateMany(filter, { $set: { status: 'invalidated', invalidatedAt: new Date() } });
    return r.modifiedCount;
  }
}
