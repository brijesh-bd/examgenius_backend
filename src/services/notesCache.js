import crypto from 'node:crypto';

import { CONTENT_VERSION, NOTES_PROMPT_VERSION } from './notesGenerator.js';

/**
 * Shared cache of COMPLETE study notes (collection notes_cache). AI notes for
 * a syllabus node are the same for every student, so the first generation
 * is reused by everyone; each student still gets their own Library note
 * (personal note, bookmark, progress stay per student).
 *
 * Key = exam × syllabus node/topic × language × coverage × prompt version ×
 * content version × syllabus version. A new prompt or syllabus version means
 * a new key, so stale notes are never served (old entries are kept).
 */
export class NotesCache {
  constructor({ notesCache }) {
    this.col = notesCache;
  }

  static key({ examId, targetId, language, coverage = 'complete', syllabusVersion }) {
    const parts = { examId, targetId, language, coverage, syllabusVersion, prompt: NOTES_PROMPT_VERSION, content: CONTENT_VERSION };
    return crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 40);
  }

  get(key) {
    return this.col.findOne({ _id: key });
  }

  /** Latest generation wins (a regenerate replaces the shared copy). */
  async put(key, doc) {
    const now = new Date();
    await this.col.replaceOne({ _id: key }, { ...doc, _id: key, promptVersion: NOTES_PROMPT_VERSION, updatedAt: now }, { upsert: true });
  }
}
