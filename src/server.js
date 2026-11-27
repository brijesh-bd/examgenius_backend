import { aiMode, config } from './config.js';
import { createApp } from './app.js';
import { connectDb } from './db.js';
import { UserStore } from './services/userStore.js';
import { PracticeStore } from './services/practiceStore.js';
import { createQuestionGenerator } from './services/questionGenerator.js';
import { QuestionBank } from './services/questionBank.js';
import { SubscriptionService } from './services/subscription.js';
import { LibraryStore } from './services/libraryStore.js';
import { NotesStore } from './services/notesStore.js';
import { LearningProgressStore } from './services/learningProgressStore.js';
import { SectionCache } from './services/sectionCache.js';
import { SectionJobs } from './services/sectionJobs.js';
import { NotesQuota } from './services/notesQuota.js';
import { createSectionGenerator } from './services/sectionGenerator.js';
import { createNotesGenerator } from './services/notesGenerator.js';
import { AiOutlineStore } from './services/aiOutlineStore.js';
import { createOutlineGenerator } from './services/outlineGenerator.js';
import { TopicSummaryStore, createSummaryGenerator } from './services/topicSummary.js';
import { NotesCache } from './services/notesCache.js';

let db;
try {
  db = await connectDb(config.mongo);
} catch (err) {
  console.error(`Could not connect to MongoDB at ${config.mongo.uri}: ${err.message}`);
  console.error('Start MongoDB (Windows: services.msc → "MongoDB Server" → Start) and try again.');
  process.exit(1);
}

// AI chapter indexes (draft/approved) join the outline registry before serving.
const aiOutlines = new AiOutlineStore(db);
await aiOutlines.refresh();

const app = createApp({
  config,
  users: new UserStore(db.users),
  practice: new PracticeStore(db, config.practice),
  questionGenerator: createQuestionGenerator(config.ai),
  bank: new QuestionBank(db.questionBank, db.sessions),
  subscription: new SubscriptionService(db, config.plans),
  library: new LibraryStore(db),
  notes: new NotesStore(db),
  progress: new LearningProgressStore(db),
  sectionCache: new SectionCache(db),
  sectionJobs: new SectionJobs(db),
  notesQuota: new NotesQuota(db, { perHour: config.ai.notesPerHour }),
  sectionGenerator: createSectionGenerator(config.ai),
  notesGenerator: createNotesGenerator(config.ai),
  aiOutlines,
  outlineGenerator: createOutlineGenerator(config.ai),
  topicSummaries: new TopicSummaryStore(db),
  notesCache: new NotesCache(db),
  summaryGenerator: createSummaryGenerator(config.ai),
  logRequests: true,
});

// 0.0.0.0 so a phone on the same Wi-Fi (or the Android emulator) can reach it.
const server = app.listen(config.port, '0.0.0.0', () => {
  const mode =
    aiMode() === 'live'
      ? `LIVE AI (Gemini: ${config.ai.geminiModels.join(' → ')}${config.ai.fallbackToSamples ? ', samples if busy' : ''})`
      : 'PREVIEW (sample questions; set GEMINI_API_KEY for live AI)';
  console.log(`ExamGenius API on http://localhost:${config.port}/api/v1`);
  console.log(`MongoDB: ${config.mongo.uri}/${config.mongo.db}`);
  console.log(`AI: ${mode}`);
  if (aiMode() === 'live') console.log(`AI Study Notes models: ${config.ai.notesModels.join(' → ')}`);
});

const shutdown = async () => {
  server.close();
  await db.client.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
