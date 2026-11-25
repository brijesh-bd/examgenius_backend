import { AiServiceError, GenerationError } from './questionGenerator.js';
import { GeminiJsonClient, isLiteModel } from './geminiClient.js';

/**
 * AI Study Notes. A generator takes
 *   { exam: {id,name}, subject: {id,name}, topic: {id,name}, language, level, sections[] }
 * and resolves to { content: NoteContent, model }.
 *
 * NoteContent (contentVersion 1) — every list may be empty:
 *   overview: string
 *   explanation: [{ heading, body }]
 *   concepts: [{ term, definition }]
 *   examples: [{ title, problem, steps[], answer }]
 *   flowcharts: [{ title, steps[] }]
 *   graphs: [{ title, xLabel, yLabel, points: [{x,y}], caption }]
 *   formulas: [{ name, expression, meaning }]
 *   tables: [{ title, headers[], rows[][] }]
 *   codeExamples: [{ language, code, caption }]
 *   tips[], mistakes[], keyPoints[], quickRevision[]
 *   mcqs: [{ question, options[4], correctIndex, explanation }]
 *   nextTopics[]
 */
export const CONTENT_VERSION = 1;

/** Section switches the app can send (Create Notes screen). */
export const NOTE_SECTIONS = [
  'explanation',
  'definitions',
  'examples',
  'stepByStep',
  'diagrams',
  'graphs',
  'formulas',
  'tips',
  'mistakes',
  'keyPoints',
  'revision',
  'mcqs',
];
export const NOTE_LEVELS = ['basic', 'exam', 'advanced'];

const LEVEL_GUIDE = {
  basic: 'Beginner: simple words, build from zero, more examples, no assumed knowledge',
  exam: 'Exam standard: exactly what this exam asks, with shortcuts and typical question patterns',
  advanced: 'Advanced: deeper reasoning, tricky cases and higher-difficulty applications',
};

const SECTION_GUIDE = {
  explanation: 'explanation: 3-6 sub-sections ({heading, body}) that explain the concept fully, step by step',
  definitions: 'concepts: key terms with precise definitions',
  examples: 'examples: 2-4 real-life or exam-style examples',
  stepByStep: 'examples: give every example numbered solution steps (steps[]) and a final answer',
  diagrams: 'flowcharts: ONLY if a process/decision/classification is genuinely clearer as a flow; each step is short text',
  graphs: 'graphs: ONLY if the topic is mathematical/data-based and a line graph truly helps; give 3-12 accurate numeric points',
  formulas: 'formulas (name, expression in plain text like "SI = P × R × T / 100", meaning) and tables (comparison or data tables) where relevant',
  tips: 'tips: exam tricks and shortcuts',
  mistakes: 'mistakes: common mistakes students make and how to avoid them',
  keyPoints: 'keyPoints: important facts that are frequently asked in this exam',
  revision: 'quickRevision: 6-12 one-line revision bullets',
  mcqs: 'mcqs: 5 exam-style MCQs, 4 options each, correctIndex 0-3, a short explanation',
};

export const SYSTEM_PROMPT = `You are an expert teacher and author of study material for Indian government recruitment exams (RRB, SSC, IBPS, SBI).
Write accurate, syllabus-focused study notes as JSON matching the schema.
Rules:
- Facts, formulas and numbers must be correct. Never invent data.
- Do not add decorative or irrelevant diagrams or graphs: leave flowcharts/graphs empty when they would not help.
- Mathematics: show formulas and fully worked step-by-step examples.
- Technical topics (computers, science): use comparison tables and short code examples only when truly useful.
- Plain text only (no markdown symbols like ** or #).
- Leave any section that was not requested as an empty list.`;

const str = { type: 'STRING' };
const strList = { type: 'ARRAY', items: str };
const obj = (properties, required = Object.keys(properties)) => ({ type: 'OBJECT', properties, required });

export const RESPONSE_SCHEMA = obj({
  overview: str,
  explanation: { type: 'ARRAY', items: obj({ heading: str, body: str }) },
  concepts: { type: 'ARRAY', items: obj({ term: str, definition: str }) },
  examples: { type: 'ARRAY', items: obj({ title: str, problem: str, steps: strList, answer: str }) },
  flowcharts: { type: 'ARRAY', items: obj({ title: str, steps: strList }) },
  graphs: {
    type: 'ARRAY',
    items: obj({
      title: str,
      xLabel: str,
      yLabel: str,
      points: { type: 'ARRAY', items: obj({ x: { type: 'NUMBER' }, y: { type: 'NUMBER' } }) },
      caption: str,
    }),
  },
  formulas: { type: 'ARRAY', items: obj({ name: str, expression: str, meaning: str }) },
  tables: { type: 'ARRAY', items: obj({ title: str, headers: strList, rows: { type: 'ARRAY', items: strList } }) },
  codeExamples: { type: 'ARRAY', items: obj({ language: str, code: str, caption: str }) },
  tips: strList,
  mistakes: strList,
  keyPoints: strList,
  quickRevision: strList,
  mcqs: {
    type: 'ARRAY',
    items: obj({ question: str, options: strList, correctIndex: { type: 'INTEGER' }, explanation: str }),
  },
  nextTopics: strList,
});

export function buildNotesPrompt({ exam, subject, topic, unitOf = null, concept = null, language, level, sections }) {
  const wanted = sections.map((s) => `- ${SECTION_GUIDE[s]}`).join('\n');
  const lang =
    language === 'hi'
      ? 'Write all text in Hindi (Devanagari script). Keep numbers, formulas, code and proper nouns as usual.'
      : 'Write all text in clear, simple English.';
  return `Exam: ${exam.name}
Subject: ${subject.name}
Topic: ${topic.name}${unitOf ? `
This is ONE learning unit of the broad topic "${unitOf.topicName}". Explain only this unit in full depth; the other units (${unitOf.otherUnits.join(', ')}) are studied separately.` : ''}${concept ? `
This is ONE syllabus concept (${concept.path}). Write notes ONLY for this syllabus node: its definitions and key facts, every formula with what each symbol means (if any), worked examples${concept.patterns?.length ? `, these question patterns: ${concept.patterns.join('; ')}` : ''}${concept.covers?.length ? `, covering: ${concept.covers.join('; ')}` : ''}, and the common mistakes students make. Do not cover other parts of the chapter.` : ''}
Level: ${LEVEL_GUIDE[level]}

Always include: overview (4-6 sentences) and nextTopics (3-5 related topics to study next).
Include these sections:
${wanted}

${lang}`;
}

export function createNotesGenerator(aiConfig, { fetchImpl = fetch, log = console } = {}) {
  // No key → no notes. We never serve placeholder notes as if they were real.
  if (!aiConfig.geminiApiKey) return new UnavailableNotesGenerator();
  return new GeminiNotesGenerator(aiConfig, fetchImpl, log);
}

export class UnavailableNotesGenerator {
  async generate() {
    throw new AiServiceError('AI Study Notes are not available: the server has no AI key configured.', false);
  }
}

export class GeminiNotesGenerator {
  constructor({ geminiApiKey, notesModels, timeoutMs }, fetchImpl = fetch, log = console) {
    // Study notes never use Flash-Lite models (config already filters them).
    this.models = (notesModels ?? []).filter((m) => !isLiteModel(m));
    // Notes are long; give each model more time than a question set.
    this.client = new GeminiJsonClient({
      apiKey: geminiApiKey,
      timeoutMs: Math.max(timeoutMs, 90_000),
      fetchImpl,
      log,
    });
  }

  async generate(request) {
    const { json, model } = await this.client.generate({
      models: this.models,
      label: 'notes',
      systemPrompt: SYSTEM_PROMPT,
      prompt: buildNotesPrompt(request),
      schema: RESPONSE_SCHEMA,
      maxOutputTokens: 32_768,
      validate: (raw) => validateNoteContent(raw, request.sections),
    });
    return { content: json, model };
  }
}

// ── Validation ──────────────────────────────────────────────────────────────

const clean = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v, max = 40) => (Array.isArray(v) ? v.slice(0, max) : []);
const strings = (v, maxItems = 20, maxLen = 600) => list(v, maxItems).map((s) => clean(s, maxLen)).filter(Boolean);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Keeps only well-formed parts of the AI response (caps sizes, drops broken
 * items, removes sections that were not requested). Throws GenerationError
 * when nothing usable is left, so nothing broken is ever saved.
 */
export function validateNoteContent(raw, sections = NOTE_SECTIONS) {
  const on = new Set(sections);
  const want = (key, value) => (on.has(key) ? value : []);
  const r = raw && typeof raw === 'object' ? raw : {};

  const examples = list(r.examples, 6)
    .map((e) => ({
      title: clean(e?.title, 200),
      problem: clean(e?.problem, 1500),
      steps: on.has('stepByStep') || on.has('examples') ? strings(e?.steps, 15, 500) : [],
      answer: clean(e?.answer, 500),
    }))
    .filter((e) => e.problem || e.title);

  const graphs = list(r.graphs, 3)
    .map((g) => ({
      title: clean(g?.title, 200),
      xLabel: clean(g?.xLabel, 60),
      yLabel: clean(g?.yLabel, 60),
      points: list(g?.points, 24)
        .map((p) => ({ x: num(p?.x), y: num(p?.y) }))
        .filter((p) => p.x !== null && p.y !== null)
        .sort((a, b) => a.x - b.x),
      caption: clean(g?.caption, 400),
    }))
    .filter((g) => g.points.length >= 2);

  const tables = list(r.tables, 5)
    .map((t) => {
      const headers = strings(t?.headers, 6, 80);
      const rows = list(t?.rows, 20)
        .map((row) => list(row, headers.length).map((c) => clean(String(c ?? ''), 200)))
        .filter((row) => row.length === headers.length && row.some(Boolean));
      return { title: clean(t?.title, 200), headers, rows };
    })
    .filter((t) => t.headers.length >= 2 && t.rows.length >= 1);

  const mcqs = list(r.mcqs, 10)
    .map((q) => ({
      question: clean(q?.question, 800),
      options: strings(q?.options, 4, 300),
      correctIndex: q?.correctIndex,
      explanation: clean(q?.explanation, 1200),
    }))
    .filter(
      (q) =>
        q.question &&
        q.options.length === 4 &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3,
    );

  const content = {
    overview: clean(r.overview, 3000),
    explanation: want(
      'explanation',
      list(r.explanation, 10)
        .map((s) => ({ heading: clean(s?.heading, 200), body: clean(s?.body, 4000) }))
        .filter((s) => s.body),
    ),
    concepts: want(
      'definitions',
      list(r.concepts, 20)
        .map((c) => ({ term: clean(c?.term, 200), definition: clean(c?.definition, 1000) }))
        .filter((c) => c.term && c.definition),
    ),
    examples: on.has('examples') || on.has('stepByStep') ? examples : [],
    flowcharts: want(
      'diagrams',
      list(r.flowcharts, 3)
        .map((f) => ({ title: clean(f?.title, 200), steps: strings(f?.steps, 12, 200) }))
        .filter((f) => f.steps.length >= 2),
    ),
    graphs: want('graphs', graphs),
    formulas: want(
      'formulas',
      list(r.formulas, 20)
        .map((f) => ({ name: clean(f?.name, 200), expression: clean(f?.expression, 400), meaning: clean(f?.meaning, 600) }))
        .filter((f) => f.expression),
    ),
    tables: want('formulas', tables),
    codeExamples: list(r.codeExamples, 4)
      .map((c) => ({ language: clean(c?.language, 30), code: clean(c?.code, 3000), caption: clean(c?.caption, 300) }))
      .filter((c) => c.code),
    tips: want('tips', strings(r.tips)),
    mistakes: want('mistakes', strings(r.mistakes)),
    keyPoints: want('keyPoints', strings(r.keyPoints)),
    quickRevision: want('revision', strings(r.quickRevision, 20, 300)),
    mcqs: want('mcqs', mcqs),
    nextTopics: strings(r.nextTopics, 6, 120),
  };

  const hasBody = Object.entries(content).some(
    ([k, v]) => Array.isArray(v) && k !== 'nextTopics' && v.length > 0,
  );
  if (!content.overview || !hasBody) {
    throw new GenerationError('The AI notes were incomplete. Please try again.');
  }
  return content;
}
