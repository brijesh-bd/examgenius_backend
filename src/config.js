import crypto from 'node:crypto';
import 'dotenv/config';

const env = process.env;
const isProduction = env.NODE_ENV === 'production';

if (isProduction && !env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

const list = (v, fallback) =>
  (v ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const config = {
  port: Number(env.PORT ?? 3000),
  isProduction,
  // Dev fallback: random per boot, so tokens stop working after a restart.
  // Set JWT_SECRET in .env to keep students logged in across restarts.
  jwtSecret: env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  jwtExpiresIn: env.JWT_EXPIRES_IN ?? '30d',
  mongo: {
    uri: env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017',
    db: env.MONGODB_DB ?? 'examgenius',
  },
  ai: {
    // Google AI Studio (Gemini). Empty → preview mode (sample question bank).
    geminiApiKey: env.GEMINI_API_KEY ?? '',
    // First model is preferred; the rest are tried when it is overloaded.
    geminiModels: [
      ...list(env.GEMINI_MODEL, 'gemini-3.8-flash'),
      ...list(env.GEMINI_FALLBACK_MODELS, 'gemini-3.5-flash-lite,gemini-3.5-flash,gemini-flash-lite-latest'),
    ].filter((m, i, all) => all.indexOf(m) === i),
    // AI Study Notes: own model order. Primary first; Flash-Lite is never
    // used for notes (too shallow) and is removed with a warning.
    // Primary only by default: gemini-3.5-flash stays OFF as a fallback until
    // its availability and note quality are verified and approved. Enable it
    // explicitly with GEMINI_NOTES_MODELS=gemini-3.8-flash,gemini-3.5-flash.
    notesModels: list(env.GEMINI_NOTES_MODELS, list(env.GEMINI_MODEL, 'gemini-3.8-flash')[0])
      .filter((m, i, all) => all.indexOf(m) === i)
      .filter((m) => {
        if (!/lite/i.test(m)) return true;
        console.warn(`GEMINI_NOTES_MODELS: ${m} ignored — Flash-Lite is not used for study notes`);
        return false;
      }),
    // Per-model request timeout.
    timeoutMs: Number(env.AI_TIMEOUT_MS ?? 40_000),
    // When every model fails, serve labelled sample questions instead of an error.
    fallbackToSamples: (env.AI_FALLBACK_TO_SAMPLES ?? 'true') === 'true',
    maxQuestionsPerRequest: Number(env.AI_MAX_QUESTIONS ?? 30),
    generationsPerHour: Number(env.AI_GENERATIONS_PER_HOUR ?? 20),
    // AI Study Notes have their own hourly limit (separate from questions).
    notesPerHour: Number(env.AI_NOTES_PER_HOUR ?? 20),
  },
  notes: {
    // Show curated outlines that are still drafts (for review in dev only).
    showDraftOutlines: env.NOTES_SHOW_DRAFT_OUTLINES === 'true',
  },
  practice: {
    // Countdown given to the student per question.
    secondsPerQuestion: Number(env.SECONDS_PER_QUESTION ?? 60),
    correctMark: 1,
    negativeMark: 0.25,
  },
  // Free vs Pro. Limits are enforced on the server; the app only displays them.
  plans: {
    free: {
      setsPerDay: Number(env.FREE_SETS_PER_DAY ?? 2),
      maxQuestionsPerSet: Number(env.FREE_MAX_QUESTIONS_PER_SET ?? 10),
      // Every generated set is saved to the Library automatically, so saved
      // sets are unlimited by default. Set FREE_MAX_SAVED to cap them again.
      maxSaved: env.FREE_MAX_SAVED ? Number(env.FREE_MAX_SAVED) : null,
      freshAi: false,
    },
    pro: {
      // Fair use: generous, but caps a runaway AI bill.
      questionsPerDay: Number(env.PRO_QUESTIONS_PER_DAY ?? 300),
      maxQuestionsPerSet: Number(env.PRO_MAX_QUESTIONS_PER_SET ?? 30),
      freshAi: true,
    },
    trialDays: Number(env.TRIAL_DAYS ?? 7),
    // Shown on the Plans screen (prices include GST). Payment is not wired yet.
    offers: [
      { id: "pro_monthly", months: 1, priceInr: 99 },
      { id: "pro_quarterly", months: 3, priceInr: 249 },
      { id: "pro_yearly", months: 12, priceInr: 499, popular: true },
    ],
  },
};

/** Gemini live mode is on when a key is configured. */
export const aiMode = (cfg = config) => (cfg.ai.geminiApiKey ? 'live' : 'preview');
