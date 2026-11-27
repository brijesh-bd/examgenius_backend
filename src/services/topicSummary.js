import { AiServiceError, GenerationError } from './questionGenerator.js';
import { GeminiJsonClient } from './geminiClient.js';

/**
 * Topic Summary (AI Study Notes): a SHORT overview of what a selected
 * syllabus topic covers, shown before the student generates full notes.
 * One shared copy per exam × topic × language (collection topic_summaries),
 * so selecting a topic again — by anyone — costs no AI call. Never full notes.
 */
export const SUMMARY_VERSION = 1;

const obj = (properties, required = Object.keys(properties)) => ({ type: 'OBJECT', properties, required });
const str = { type: 'STRING' };
const strList = { type: 'ARRAY', items: str };

export const SUMMARY_SCHEMA = obj({
  covers: str,
  keyConcepts: strList,
  definitions: { type: 'ARRAY', items: obj({ term: str, definition: str }) },
  formulas: { type: 'ARRAY', items: obj({ name: str, expression: str }) },
  principles: strList,
  examFocus: strList,
});

const SYSTEM_PROMPT = `You summarise one syllabus topic for an Indian government-exam student BEFORE they study it.
Be accurate and brief. Stay inside the given syllabus scope. Never invent facts.
Leave formulas empty when the topic has none. Plain text, no markdown.`;

export function buildSummaryPrompt({ exam, subject, path, scope, language }) {
  return `Exam: ${exam.name}
Subject: ${subject.name}
Topic: ${path}
Syllabus scope:
${scope}

Give: covers (2-3 sentences: what this topic covers), keyConcepts (4-8 items to study),
definitions (2-5 most important, one line each), formulas (only if the topic has them, with plain-text expressions),
principles (important laws / rules / principles, 0-5), examFocus (3-6 exam-oriented areas commonly tested).
${language === 'hi' ? 'Write in Hindi (Devanagari); keep the English technical term in brackets where useful.' : 'Write in clear English.'}`;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const strings = (v, n, max = 240) => (Array.isArray(v) ? v.map((x) => clean(x, max)).filter(Boolean).slice(0, n) : []);

/** Keeps well-formed parts; throws GenerationError when unusable. */
export function checkSummary(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const out = {
    covers: clean(r.covers, 800),
    keyConcepts: strings(r.keyConcepts, 10),
    definitions: (Array.isArray(r.definitions) ? r.definitions : [])
      .map((d) => ({ term: clean(d?.term, 120), definition: clean(d?.definition, 400) }))
      .filter((d) => d.term && d.definition)
      .slice(0, 6),
    formulas: (Array.isArray(r.formulas) ? r.formulas : [])
      .map((f) => ({ name: clean(f?.name, 120), expression: clean(f?.expression, 200) }))
      .filter((f) => f.expression)
      .slice(0, 8),
    principles: strings(r.principles, 6, 300),
    examFocus: strings(r.examFocus, 8),
  };
  if (!out.covers || out.keyConcepts.length < 2) throw new GenerationError('The topic summary was incomplete. Please try again.');
  return out;
}

export function createSummaryGenerator(aiConfig, { fetchImpl = fetch, log = console } = {}) {
  if (!aiConfig.geminiApiKey) {
    return {
      async generate() {
        throw new AiServiceError('AI Study Notes are not available: the server has no AI key configured.', false);
      },
    };
  }
  // A short answer: the question models (incl. Flash-Lite) are fast and cheap enough.
  const models = aiConfig.geminiModels ?? [];
  const client = new GeminiJsonClient({ apiKey: aiConfig.geminiApiKey, timeoutMs: Math.max(aiConfig.timeoutMs, 45_000), fetchImpl, log });
  return {
    async generate(request) {
      const { json, model } = await client.generate({
        models,
        label: 'topic-summary',
        systemPrompt: SYSTEM_PROMPT,
        prompt: buildSummaryPrompt(request),
        schema: SUMMARY_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 4096,
        validate: checkSummary,
      });
      return { summary: json, model };
    },
  };
}

export class TopicSummaryStore {
  constructor({ topicSummaries }) {
    this.col = topicSummaries;
  }

  static key({ examId, id, language }) {
    return `${examId}:${id}:${language}:v${SUMMARY_VERSION}`;
  }

  async get(key) {
    return this.col.findOne({ _id: key });
  }

  /** First writer wins (two students at once never produce two copies). */
  async put(key, doc) {
    const now = new Date();
    await this.col.updateOne({ _id: key }, { $setOnInsert: { ...doc, createdAt: now } }, { upsert: true });
    return this.get(key);
  }
}
