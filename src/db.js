import { MongoClient } from 'mongodb';

/**
 * Connects to MongoDB and prepares the collections + indexes used by the API.
 *
 * Collections:
 *   users     – accounts (password stored as bcrypt hash only)
 *   sessions  – generated tests, INCLUDING the answer key (never sent to the app
 *               before submission)
 *   results   – scored attempts (one per session)
 *   saved     – practice sets a student saved (one per result per student)
 *   questionBank – validated AI questions reused across students (cost saver)
 *   usage     – per-student daily counters (_id = "<userId>:<YYYY-MM-DD IST>")
 */
export async function connectDb({ uri, db: dbName }) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(dbName);

  const collections = {
    users: db.collection('users'),
    sessions: db.collection('sessions'),
    results: db.collection('results'),
    saved: db.collection('saved'),
    questionBank: db.collection('questionBank'),
    usage: db.collection('usage'),
    // My Learning Library (services/libraryStore.js)
    practiceSets: db.collection('practice_sets'),
    practiceAttempts: db.collection('practice_attempts'),
    bookmarks: db.collection('bookmarks'),
    userNotes: db.collection('user_notes'),
    mistakeQuestions: db.collection('mistake_questions'),
    studyNotes: db.collection('study_notes'),
    learningProgress: db.collection('learning_progress'),
    sectionCache: db.collection('section_cache'),
    // Generation lease + last outcome per shared section (services/sectionJobs.js).
    sectionJobs: db.collection('section_jobs'),
    aiGenerationLog: db.collection('ai_generation_log'),
  };

  await Promise.all([
    collections.users.createIndex({ mobile: 1 }, { unique: true }),
    collections.users.createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $type: 'string' } } },
    ),
    collections.sessions.createIndex({ userId: 1, createdAt: -1 }),
    collections.results.createIndex({ sessionId: 1 }, { unique: true }),
    collections.results.createIndex({ userId: 1, completedAt: -1 }),
    collections.saved.createIndex({ userId: 1, resultId: 1 }, { unique: true }),
    collections.saved.createIndex({ userId: 1, savedAt: -1 }),
    collections.questionBank.createIndex({ topicId: 1, difficulty: 1, language: 1 }),
    collections.questionBank.createIndex({ fingerprint: 1 }, { unique: true }),
    // Library. requestKey: a retried generate request never creates a 2nd set.
    collections.practiceSets.createIndex(
      { userId: 1, requestKey: 1 },
      { unique: true, partialFilterExpression: { requestKey: { $type: 'string' } } },
    ),
    collections.practiceSets.createIndex({ userId: 1, category: 1, createdAt: -1 }),
    collections.practiceSets.createIndex({ userId: 1, category: 1, examId: 1 }),
    collections.practiceSets.createIndex({ userId: 1, createdAt: -1 }),
    collections.practiceAttempts.createIndex({ userId: 1, setId: 1, completedAt: -1 }),
    collections.practiceAttempts.createIndex({ userId: 1, completedAt: -1 }),
    collections.bookmarks.createIndex({ userId: 1, setId: 1, questionId: 1 }, { unique: true }),
    collections.bookmarks.createIndex({ userId: 1, category: 1, createdAt: -1 }),
    collections.userNotes.createIndex({ userId: 1, setId: 1, questionId: 1 }, { unique: true }),
    collections.userNotes.createIndex({ userId: 1, category: 1, updatedAt: -1 }),
    collections.mistakeQuestions.createIndex({ userId: 1, setId: 1, questionId: 1 }, { unique: true }),
    collections.studyNotes.createIndex(
      { userId: 1, requestKey: 1 },
      { unique: true, partialFilterExpression: { requestKey: { $type: 'string' } } },
    ),
    collections.studyNotes.createIndex({ userId: 1, category: 1, createdAt: -1 }),
    collections.studyNotes.createIndex({ userId: 1, examId: 1, topicId: 1, createdAt: -1 }),
    collections.learningProgress.createIndex({ userId: 1, examId: 1, itemId: 1 }, { unique: true }),
    collections.learningProgress.createIndex({ userId: 1, examId: 1, subjectId: 1 }),
    collections.sectionCache.createIndex({ key: 1, rev: -1 }, { unique: true }),
    collections.sectionCache.createIndex({ unitId: 1, status: 1 }),
    collections.sectionCache.createIndex({ key: 1, status: 1, rev: -1 }),
    collections.sectionJobs.createIndex({ state: 1, leaseUntil: 1 }),
    collections.aiGenerationLog.createIndex({ userId: 1, kind: 1, at: -1 }),
    // Quota entries are only needed for the last hour; keep a day for audits.
    collections.aiGenerationLog.createIndex({ at: 1 }, { expireAfterSeconds: 86_400 }),
    collections.studyNotes.createIndex({ userId: 1, outlineUnitId: 1, chapterId: 1, sectionId: 1, language: 1, learningMode: 1, createdAt: -1 }),
    collections.studyNotes.createIndex({ userId: 1, category: 1, examId: 1, topicId: 1 }),
    collections.mistakeQuestions.createIndex({ userId: 1, category: 1, resolved: 1, lastWrongAt: -1 }),
  ]);

  return { client, db, ...collections };
}
