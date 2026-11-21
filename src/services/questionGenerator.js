import crypto from 'node:crypto';

import { sampleQuestionBank } from '../data/sampleQuestions.js';

/**
 * A generator takes a validated request:
 *   { exam: {id,name}, topics: [{id,name,subjectName}], difficulty, count, language }
 * and resolves to { questions: Question[], isPreview: boolean }.
 * Question = { id, topicId, difficulty, question, options[4], correctIndex,
 *              explanation, formula?, steps[], concept?, tip?, wrongReasons? }
 */
export function createQuestionGenerator(aiConfig, { fetchImpl = fetch, log = console } = {}) {
  if (!aiConfig.geminiApiKey) return new SampleQuestionGenerator();
  const live = new GeminiQuestionGenerator(aiConfig, fetchImpl, log);
  return aiConfig.fallbackToSamples ? new FallbackGenerator(live, new SampleQuestionGenerator(), log) : live;
}

// ── Preview mode ────────────────────────────────────────────────────────────

/** Serves the bundled bank: exact topics first, then same subject, same level. */
export class SampleQuestionGenerator {
  constructor(bank = sampleQuestionBank) {
    this.bank = bank;
  }

  async generate({ topics, difficulty, count }) {
    const topicIds = new Set(topics.map((t) => t.id));
    const subjects = new Set(topics.map((t) => subjectOf(t.id)));
    const atLevel = this.bank.filter((q) => q.difficulty === difficulty);
    const exact = atLevel.filter((q) => topicIds.has(q.topicId));
    const related = atLevel.filter(
      (q) => !topicIds.has(q.topicId) && subjects.has(subjectOf(q.topicId)),
    );
    const questions = [...exact, ...related].slice(0, count).map((q) => ({
      ...q,
      // Fresh ids so a question can appear in many sessions independently.
      id: crypto.randomUUID(),
      steps: mathSubjects.has(subjectOf(q.topicId)) ? splitSteps(q.explanation) : [],
    }));
    return { questions, isPreview: true };
  }
}

const subjectOf = (topicId) => topicId.split('.')[0];
const mathSubjects = new Set(['quant', 'math', 'maths', 'arithmetic']);

/** "A. B. C." → ["A.", "B.", "C."] (only when there are 2+ sentences). */
export function splitSteps(text) {
  const parts = text
    .split(/(?<=[.;])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length < 2 ? [] : parts;
}

// ── Live AI: Google Gemini ──────────────────────────────────────────────────

const LEVEL_GUIDE = {
  easy: 'the easier questions that appear in the actual paper — direct application of one concept, solvable in under 30 seconds by a prepared candidate',
  medium: 'the typical question in the actual paper — two steps or a common trap, solvable in 45–60 seconds',
  hard: 'the toughest questions seen in recent actual papers — multi-step, close distractors, still solvable in about 90 seconds without a calculator',
};

const SYSTEM_PROMPT = `You are a senior paper setter for Indian government recruitment exams (RRB, SSC, IBPS, SBI).
You write original multiple-choice questions that match the real exam's pattern, syllabus and standard — the same style, wording and number ranges candidates see in the actual paper and in previous year papers.

Rules for every question:
- Exactly 4 options, all distinct and plausible; exactly one is correct. Wrong options should reflect common mistakes.
- correctIndex is the 0-based index of the correct option. Randomise its position across questions.
- Work out the answer yourself before writing the options, and double-check every calculation. A wrong answer key is the worst possible error.
- explanation: why the correct answer is right, in simple language a student can follow (1–4 sentences).
- For mathematics / reasoning: give "formula" (the key formula, or "" if none) and "steps" (the step-by-step working, 2–6 short steps, include a shortcut method as the last step when one exists). For factual subjects (history, general awareness, polity, science) leave "formula" as "" and "steps" empty; keep the explanation short and factual.
- concept: one sentence naming the underlying concept.
- tip: one practical learning or exam tip.
- wrongReasons: exactly 4 strings, one per option in order; for each WRONG option say briefly why it is wrong (the common mistake behind it); for the correct option use "".
- Use ₹ for money and Indian context where natural. No questions that depend on images or diagrams.
- For current affairs topics, stick to stable facts and avoid events whose details may have changed.
- Never repeat a question; vary the sub-concepts within each topic.
- topicId must be one of the topic ids given in the request.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          topicId: { type: 'STRING' },
          question: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          correctIndex: { type: 'INTEGER' },
          explanation: { type: 'STRING' },
          formula: { type: 'STRING' },
          steps: { type: 'ARRAY', items: { type: 'STRING' } },
          concept: { type: 'STRING' },
          tip: { type: 'STRING' },
          wrongReasons: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['topicId', 'question', 'options', 'correctIndex', 'explanation', 'steps', 'concept', 'tip', 'wrongReasons'],
      },
    },
  },
  required: ['questions'],
};

/** HTTP statuses worth trying another model for (overload / rate limit / server). */
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

export class GeminiQuestionGenerator {
  constructor({ geminiApiKey, geminiModels, timeoutMs }, fetchImpl = fetch, log = console) {
    this.apiKey = geminiApiKey;
    this.models = geminiModels;
    this.timeoutMs = timeoutMs;
    this.fetch = fetchImpl;
    this.log = log;
  }

  buildPrompt({ exam, topics, difficulty, count, language }) {
    const topicList = topics.map((t) => `- ${t.id}: ${t.name} (${t.subjectName})`).join('\n');
    const lang =
      language === 'hi'
        ? 'Write the question, options, explanation, steps, concept, tip and wrongReasons in Hindi (Devanagari script). Keep numbers, formulas and proper nouns as usual.'
        : 'Write everything in clear, simple English.';
    return `Exam: ${exam.name}
Difficulty: ${difficulty} — ${LEVEL_GUIDE[difficulty]}.
Number of questions: ${count}
Spread the questions evenly across these syllabus topics:
${topicList}

${lang}
Write ${count} exam-level questions for ${exam.name}.`;
  }

  async generate(request) {
    const prompt = this.buildPrompt(request);
    let lastError = null;
    for (const model of this.models) {
      try {
        const raw = await this.#call(model, prompt);
        const questions = this.#validate(raw, request);
        if (questions.length === 0) throw new GenerationError('No valid questions were generated. Please try again.');
        return { questions, isPreview: false, model };
      } catch (err) {
        lastError = err;
        if (err instanceof AiServiceError && !err.retryable) throw err; // bad key etc.
        this.log.warn?.(`Gemini ${model} failed (${err.message}); trying next model`);
      }
    }
    throw lastError instanceof AiServiceError || lastError instanceof GenerationError
      ? lastError
      : new AiServiceError('AI is busy right now. Please try again shortly.', true);
  }

  async #call(model, prompt) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    let res;
    try {
      res = await this.fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          signal: ctl.signal,
          headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: RESPONSE_SCHEMA,
              temperature: 0.7,
            },
          }),
        },
      );
    } catch (err) {
      throw new AiServiceError(err.name === 'AbortError' ? 'AI request timed out' : 'AI network error', true);
    } finally {
      clearTimeout(timer);
    }

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body?.error?.message ?? `HTTP ${res.status}`;
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        this.log.error?.(`Gemini rejected the request (${res.status}): ${msg} — check GEMINI_API_KEY / model`);
        throw new AiServiceError('AI service is not configured correctly.', false);
      }
      throw new AiServiceError(msg, RETRYABLE.has(res.status) || res.status === 404);
    }

    const candidate = body?.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      throw new GenerationError('The AI declined this request. Try different topics.');
    }
    const text = (candidate.content?.parts ?? []).map((p) => p.text ?? '').join('');
    try {
      return JSON.parse(text);
    } catch {
      throw new GenerationError('The AI response could not be read. Please try again.');
    }
  }

  #validate(raw, { topics, difficulty, count }) {
    const allowed = new Set(topics.map((t) => t.id));
    return (raw?.questions ?? [])
      .filter((q) => isValidQuestion(q, allowed))
      .slice(0, count)
      .map((q) => ({
        id: crypto.randomUUID(),
        topicId: q.topicId,
        difficulty,
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
        correctIndex: q.correctIndex,
        explanation: q.explanation.trim(),
        formula: q.formula?.trim() ? q.formula.trim() : null,
        steps: Array.isArray(q.steps) ? q.steps.map((s) => String(s).trim()).filter(Boolean) : [],
        concept: q.concept?.trim() || null,
        tip: q.tip?.trim() || null,
        wrongReasons:
          Array.isArray(q.wrongReasons) && q.wrongReasons.length === 4
            ? q.wrongReasons.map((s) => (String(s).trim() ? String(s).trim() : null))
            : null,
      }));
  }
}

/** Tries live AI; if it fails for a retryable reason, serves labelled samples. */
export class FallbackGenerator {
  constructor(primary, fallback, log = console) {
    this.primary = primary;
    this.fallback = fallback;
    this.log = log;
  }

  async generate(request) {
    try {
      return await this.primary.generate(request);
    } catch (err) {
      if (err instanceof AiServiceError && !err.retryable) throw err;
      this.log.warn?.(`Live AI unavailable (${err.message}); serving sample questions`);
      return this.fallback.generate(request);
    }
  }
}

/** Drops malformed questions so the app never shows a broken MCQ. */
export function isValidQuestion(q, allowedTopicIds) {
  return (
    q &&
    typeof q.question === 'string' &&
    typeof q.explanation === 'string' &&
    Array.isArray(q.options) &&
    allowedTopicIds.has(q.topicId) &&
    q.question.trim().length > 0 &&
    q.explanation.trim().length > 0 &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === 'string' && o.trim().length > 0) &&
    new Set(q.options.map((o) => o.trim().toLowerCase())).size === 4 &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3
  );
}

export class GenerationError extends Error {}

/** AI provider problem. retryable=false means configuration (e.g. bad key). */
export class AiServiceError extends Error {
  constructor(message, retryable) {
    super(message);
    this.retryable = retryable;
  }
}
