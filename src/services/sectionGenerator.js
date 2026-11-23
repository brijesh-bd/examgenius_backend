import { GenerationError, AiServiceError } from './questionGenerator.js';
import { GeminiJsonClient, isLiteModel } from './geminiClient.js';
import { RESPONSE_SCHEMA, validateNoteContent } from './notesGenerator.js';

/**
 * Section-by-section study notes (curated outline → one AI call per section).
 *
 * Bump SECTION_PROMPT_VERSION whenever the prompt, schema or quality rules
 * change: it is part of the shared cache key, so older cached sections stop
 * being served automatically (they are kept, not deleted).
 */
export const SECTION_PROMPT_VERSION = 1;

export const LEARNING_MODES = ['quick', 'detailed', 'complete'];

/** Which content parts each mode asks for (validated with these). */
const MODE_SECTIONS = {
  quick: ['definitions', 'formulas', 'tips', 'keyPoints', 'revision'],
  detailed: ['explanation', 'definitions', 'examples', 'stepByStep', 'diagrams', 'formulas', 'tips', 'mistakes', 'keyPoints', 'revision'],
  complete: ['explanation', 'definitions', 'examples', 'stepByStep', 'diagrams', 'formulas', 'tips', 'mistakes', 'keyPoints', 'revision', 'mcqs'],
};

/** Minimum quality per mode. A section failing any rule is never cached or saved. */
export const QUALITY_RULES = {
  quick: { minWords: 250, minKeyFacts: 8, minExplanation: 0, minMcqs: 0 },
  detailed: { minWords: 900, minKeyFacts: 8, minExplanation: 3, minMcqs: 0 },
  complete: { minWords: 1100, minKeyFacts: 10, minExplanation: 3, minMcqs: 6 },
};

const MODE_GUIDE = {
  quick: 'QUICK REVISION: concise. Key facts, short revision tables, a short timeline if historical. About 400-600 words.',
  detailed: 'DETAILED LEARNING: full explanation in 4-8 sub-sections, examples, timelines and tables. About 1200-1800 words.',
  complete:
    'COMPLETE EXAM PREPARATION: everything in detailed learning, plus comparisons, frequently tested facts, common mistakes and 8-10 exam-style MCQs with explanations. About 1300-2000 words.',
};

/** Subject-specific depth instructions (by subject id of the syllabus). */
function subjectGuide(subjectId) {
  if (['general_awareness', 'banking_awareness'].includes(subjectId)) {
    return `This is a GENERAL AWARENESS / HISTORY / POLITY / ECONOMY section. Where relevant include: background, chronological development,
important dates, rulers and dynasties, personalities, places with their PRESENT-DAY location (state), archaeological discoveries,
books and authors, inscriptions and their significance, administration, economy, society, religion, art and architecture,
important terms, causes and consequences, comparisons, and frequently tested facts.
Put dated events in "timeline" (period/year → event). Put one-line exam facts in "keyFacts".
Use only well-established facts. If historians/archaeologists disagree, say so and prefix the point with "Debated:".
If a date is approximate, write "c." (circa). Never invent dates, names, sites or numbers.`;
  }
  if (subjectId === 'general_science') {
    return 'This is a SCIENCE section: definitions, laws, SI units, formulas, examples from daily life, discoveries and scientists, and frequently tested facts.';
  }
  if (['professional_it', 'computer', 'technical'].includes(subjectId)) {
    return 'This is a TECHNICAL section: precise definitions, how it works, algorithms or steps, complexity where relevant, comparison tables, short code or worked examples, applications.';
  }
  if (subjectId === 'quant') {
    return 'This is a MATHEMATICS section: formulas, shortcuts, and several fully worked step-by-step examples of exam difficulty.';
  }
  return 'Explain the concepts, rules and patterns with many solved exam-style examples.';
}

export function buildSectionPrompt({ exam, subject, unitName, outline, chapter, section, language, mode }) {
  const siblings = chapter.sections.map((s) => (s.id === section.id ? `* ${s.title}  <-- THIS SECTION` : `- ${s.title}`)).join('\n');
  const lang =
    language === 'hi'
      ? 'Write all text in Hindi (Devanagari). Keep proper nouns, dates, numbers and technical terms accurate; add the English term in brackets where students need it.'
      : 'Write all text in clear English.';
  return `Exam: ${exam.name}
Subject: ${subject.name}
Topic: ${outline.title}${unitName ? ` (${unitName})` : ''}
Chapter: ${chapter.title}
Section to write: ${section.title}

The chapter is studied section by section. Its sections are:
${siblings}
Write ONLY the marked section, in full exam depth. Do not repeat material that belongs to the other sections; mention them only to connect ideas.

Mode: ${MODE_GUIDE[mode]}
${subjectGuide(subject.id)}

Fill: overview, explanation (sub-sections with headings), concepts (key terms), examples, tables (comparisons, lists of sites/rulers/books where useful),
timeline (when the section has dates), keyFacts (one-line frequently tested facts), tips, mistakes, keyPoints, quickRevision${mode === 'complete' ? ', mcqs (8-10, 4 options each, correctIndex 0-3, explanation)' : ''}.
Leave flowcharts/graphs/codeExamples empty unless they genuinely help this section.

${lang}`;
}

const str = { type: 'STRING' };
const SECTION_SCHEMA = {
  ...RESPONSE_SCHEMA,
  properties: {
    ...RESPONSE_SCHEMA.properties,
    timeline: {
      type: 'ARRAY',
      items: { type: 'OBJECT', properties: { period: str, event: str }, required: ['period', 'event'] },
    },
    keyFacts: { type: 'ARRAY', items: str },
  },
  required: [...RESPONSE_SCHEMA.required, 'timeline', 'keyFacts'],
};

const wordCount = (v) =>
  typeof v === 'string'
    ? v.split(/\s+/).filter(Boolean).length
    : Array.isArray(v)
      ? v.reduce((n, x) => n + wordCount(x), 0)
      : v && typeof v === 'object'
        ? Object.values(v).reduce((n, x) => n + wordCount(x), 0)
        : 0;

/**
 * Validates one generated section and checks it against the mode's quality
 * rules. Returns { content, quality } or throws GenerationError with the
 * failed checks (nothing is cached or saved in that case).
 */
export function checkSection(raw, mode) {
  const sections = MODE_SECTIONS[mode];
  const content = validateNoteContent(raw, sections);
  const clean = (s, n) => (typeof s === 'string' ? s.trim().slice(0, n) : '');
  content.timeline = (Array.isArray(raw?.timeline) ? raw.timeline : [])
    .slice(0, 40)
    .map((t) => ({ period: clean(t?.period, 80), event: clean(t?.event, 400) }))
    .filter((t) => t.period && t.event);
  content.keyFacts = (Array.isArray(raw?.keyFacts) ? raw.keyFacts : [])
    .slice(0, 40)
    .map((s) => clean(s, 400))
    .filter(Boolean);
  content.nextTopics = []; // the server fills next sections from the outline

  const rules = QUALITY_RULES[mode];
  const words = wordCount(content);
  const checks = {
    words: { value: words, min: rules.minWords, ok: words >= rules.minWords },
    keyFacts: { value: content.keyFacts.length, min: rules.minKeyFacts, ok: content.keyFacts.length >= rules.minKeyFacts },
    explanation: { value: content.explanation.length, min: rules.minExplanation, ok: content.explanation.length >= rules.minExplanation },
    mcqs: { value: content.mcqs.length, min: rules.minMcqs, ok: content.mcqs.length >= rules.minMcqs },
    overview: { value: content.overview ? 1 : 0, min: 1, ok: Boolean(content.overview) },
  };
  const failed = Object.entries(checks).filter(([, c]) => !c.ok);
  if (failed.length) {
    const err = new GenerationError(
      `The generated section was incomplete (${failed.map(([k, c]) => `${k} ${c.value}/${c.min}`).join(', ')}).`,
    );
    err.transient = true; // a second try usually passes
    err.checks = checks;
    throw err;
  }
  return { content, quality: { passed: true, words, checks, rulesVersion: SECTION_PROMPT_VERSION } };
}

const SECTION_SYSTEM_PROMPT = `You are a senior author of study material for Indian government recruitment exams (RRB, SSC, IBPS, SBI, RBI).
You write original, accurate, exam-oriented study notes as JSON matching the schema.
Rules:
- Accuracy first. Never invent facts, dates, names, numbers or sources. Mark disputed interpretations with "Debated:".
- Cover the requested section completely at exam depth; do not shorten by skipping important sub-points.
- Original explanations only; never reproduce textbook passages.
- Plain text (no markdown symbols like ** or #).`;

export function createSectionGenerator(aiConfig, { fetchImpl = fetch, log = console } = {}) {
  if (!aiConfig.geminiApiKey) {
    return {
      async generate() {
        throw new AiServiceError('AI Study Notes are not available: the server has no AI key configured.', false);
      },
    };
  }
  const models = (aiConfig.notesModels ?? []).filter((m) => !isLiteModel(m));
  const client = new GeminiJsonClient({
    apiKey: aiConfig.geminiApiKey,
    timeoutMs: Math.max(aiConfig.timeoutMs, 120_000),
    fetchImpl,
    log,
  });
  return {
    models,
    async generate(request) {
      const { json, model, fallbackFrom } = await client.generate({
        models,
        label: `notes-section ${request.section.id}`,
        systemPrompt: SECTION_SYSTEM_PROMPT,
        prompt: buildSectionPrompt(request),
        schema: SECTION_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 32_768,
        validate: (raw) => checkSection(raw, request.mode),
      });
      return { ...json, model, fallbackFrom };
    },
  };
}
