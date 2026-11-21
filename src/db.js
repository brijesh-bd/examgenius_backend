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
  ]);

  return { client, db, ...collections };
}
