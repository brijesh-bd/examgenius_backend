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
    // Per-model request timeout.
    timeoutMs: Number(env.AI_TIMEOUT_MS ?? 40_000),
    // When every model fails, serve labelled sample questions instead of an error.
    fallbackToSamples: (env.AI_FALLBACK_TO_SAMPLES ?? 'true') === 'true',
    maxQuestionsPerRequest: Number(env.AI_MAX_QUESTIONS ?? 30),
    generationsPerHour: Number(env.AI_GENERATIONS_PER_HOUR ?? 20),
  },
  practice: {
    // Countdown given to the student per question.
    secondsPerQuestion: Number(env.SECONDS_PER_QUESTION ?? 60),
    correctMark: 1,
    negativeMark: 0.25,
  },
};

/** Gemini live mode is on when a key is configured. */
export const aiMode = (cfg = config) => (cfg.ai.geminiApiKey ? 'live' : 'preview');
