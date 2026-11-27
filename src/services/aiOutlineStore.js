import { setAiOutlines, validateOutline, normalizeOutline } from '../data/outlines/index.js';

/**
 * AI-built chapter indexes (Chapter Builder Phase 1), one per learning item:
 *   _id = unitId; status draft → approved | rejected; outline = curated shape.
 * Approved and draft indexes are pushed into the outline registry (so
 * findOutline, progress, cache and continue all work unchanged); students
 * only ever see 'approved' ones (findOutline's own rule). Rejected ones are
 * kept for audit and can be regenerated.
 */
export const AI_OUTLINE_STATUSES = ['draft', 'approved', 'rejected'];

export class AiOutlineStore {
  constructor({ aiOutlines }) {
    this.col = aiOutlines;
  }

  /** Reloads draft + approved indexes into the registry (startup and after changes). */
  async refresh() {
    const docs = await this.col.find({ status: { $in: ['draft', 'approved'] } }).toArray();
    const ok = [];
    for (const d of docs) {
      try {
        ok.push(validateOutline({ ...d.outline, status: d.status, version: d.version }));
      } catch {
        // A broken stored index never breaks startup; it stays out of the registry.
      }
    }
    setAiOutlines(ok);
    return ok.length;
  }

  get(unitId) {
    return this.col.findOne({ _id: unitId });
  }

  list({ status = 'draft', limit = 50 } = {}) {
    return this.col.find({ status }).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  /** Saves a new draft (or replaces a rejected one). Never overwrites a draft/approved index. */
  async saveDraft(unitId, { outline, warnings, model, examId, stage, createdBy }) {
    normalizeOutline(outline); // throws on structure errors
    const existing = await this.get(unitId);
    if (existing && existing.status !== 'rejected') return { doc: existing, created: false };
    const now = new Date();
    const doc = {
      _id: unitId,
      status: 'draft',
      version: (existing?.version ?? 0) + 1,
      outline,
      validationWarnings: warnings,
      model,
      examId,
      stage: stage ?? null,
      createdBy,
      createdAt: now,
      updatedAt: now,
      review: null,
    };
    await this.col.replaceOne({ _id: unitId }, doc, { upsert: true });
    await this.refresh();
    return { doc, created: true };
  }

  /** Admin review: approve or reject (optionally with an edited outline). */
  async review(unitId, { action, reviewer, outline = null, comment = null }) {
    const existing = await this.get(unitId);
    if (!existing) return null;
    const next = outline ? { ...outline, unitId, source: 'ai' } : existing.outline;
    normalizeOutline({ ...next, status: 'draft', version: existing.version });
    const status = action === 'approve' ? 'approved' : 'rejected';
    // A new approved version bumps the version so cached parts of an edited index are not reused.
    const version = outline ? existing.version + 1 : existing.version;
    await this.col.updateOne(
      { _id: unitId },
      { $set: { status, outline: next, version, updatedAt: new Date(), review: { by: reviewer, at: new Date(), action, comment } } },
    );
    await this.refresh();
    return this.get(unitId);
  }
}
