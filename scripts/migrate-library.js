// One-time: copy tests generated before the Library existed into it.
//   npm run migrate-library
// Each old full test (not a partial retry) becomes a practice set, and its
// result becomes attempt #1. Safe to run again: already-linked sessions are
// skipped. Only adds data; nothing existing is changed except `setId` on the
// old session.
import crypto from 'node:crypto';

import { config } from '../src/config.js';
import { connectDb } from '../src/db.js';
import { findExam, topicIndex } from '../src/services/examService.js';
import { LibraryStore } from '../src/services/libraryStore.js';

const db = await connectDb(config.mongo);
const library = new LibraryStore(db);
let sets = 0;
let attempts = 0;
let skipped = 0;
try {
  const cursor = db.sessions.find({ retryOf: null, setId: null }).sort({ createdAt: 1 });
  for await (const session of cursor) {
    const exam = findExam(session.examId);
    if (!exam || !session.questions?.length) {
      skipped++;
      continue;
    }
    const index = topicIndex(exam.id);
    const topicIds = [...new Set(session.questions.map((q) => q.topicId))];
    const topics = topicIds.map((id) => {
      const e = index.get(id);
      return { id, name: e?.topic.name ?? session.questions.find((q) => q.topicId === id)?.topicName ?? id, subjectId: e?.subject.id ?? null };
    });
    const subjects = new Map();
    for (const id of topicIds) {
      const e = index.get(id);
      if (e) subjects.set(e.subject.id, e.subject.name);
    }

    const setId = crypto.randomUUID();
    const { set } = await library.createSet({
      id: setId,
      userId: session.userId,
      exam,
      subjects: [...subjects].map(([id, name]) => ({ id, name })),
      topics,
      difficulty: session.difficulty,
      language: session.questions[0]?.language ?? 'en',
      questions: session.questions,
      sessionId: session._id,
      isPreview: session.isPreview,
    });
    // Keep the original creation time so the Library sorts correctly.
    await db.practiceSets.updateOne({ _id: set._id }, { $set: { createdAt: session.createdAt } });
    await db.sessions.updateOne({ _id: session._id }, { $set: { setId } });
    sets++;

    const result = await db.results.findOne({ sessionId: session._id, userId: session.userId });
    if (result) {
      await library.recordAttempt(set, result);
      attempts++;
    }
  }
  console.log(`Library migration: ${sets} sets, ${attempts} attempts added, ${skipped} skipped.`);
} finally {
  await db.client.close();
}
