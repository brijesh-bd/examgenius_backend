/**
 * Shared, validated study-section content (`section_cache`), reused by every
 * student who opens the same section with the same language, learning mode,
 * outline version and prompt version (all part of the key).
 *
 * Holds NO personal data: no userId, progress, bookmarks or personal notes.
 * Only content that passed the quality checks is stored. Regenerating adds a
 * new revision (older ones are kept); invalidation marks entries so they stop
 * being served.
 */
export class SectionCache {
  constructor({ sectionCache }) {
    this.cache = sectionCache;
  }

  static key({ unitId, chapterId, sectionId, language, mode, outlineVersion, promptVersion }) {
    return [unitId, chapterId, sectionId, language, mode, `o${outlineVersion}`, `p${promptVersion}`].join('|');
  }

  /** Latest active revision for a key, or null. */
  current(key) {
    return this.cache.findOne({ key, status: 'active' }, { sort: { rev: -1 } });
  }

  async put(key, { content, quality, model, unitId }) {
    const latest = await this.cache.findOne({ key }, { sort: { rev: -1 }, projection: { rev: 1 } });
    const rev = (latest?.rev ?? 0) + 1;
    const doc = { _id: `${key}#r${rev}`, key, rev, unitId, status: 'active', content, quality, model, createdAt: new Date() };
    try {
      await this.cache.insertOne(doc);
    } catch (err) {
      // Same revision written concurrently: keep the other one.
      if (err?.code === 11000) return this.current(key);
      throw err;
    }
    return doc;
  }

  /** Stops serving cached content (e.g. after a correction). Returns count. */
  async invalidate({ unitId, key }) {
    const filter = { status: 'active', ...(key ? { key } : { unitId }) };
    const r = await this.cache.updateMany(filter, { $set: { status: 'invalidated', invalidatedAt: new Date() } });
    return r.modifiedCount;
  }
}
