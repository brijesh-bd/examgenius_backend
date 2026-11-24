import { GenerationError, AiServiceError } from './questionGenerator.js';
import { GeminiJsonClient, isLiteModel } from './geminiClient.js';
import { RESPONSE_SCHEMA, validateNoteContent } from './notesGenerator.js';
import { MODE_GUIDE, blocksFor, templateFor } from '../data/contentTemplates.js';
import { checkCoverage, manifestPrompt } from './coverage.js';

/**
 * Section-by-section study notes (curated outline → one AI call per section).
 *
 * Bump SECTION_PROMPT_VERSION whenever the prompt, schema or quality rules
 * change: it is part of the shared cache key, so older cached sections stop
 * being served automatically (they are kept, not deleted).
 *   v1 — common blocks + subject hint.
 *   v2 — subject templates, depth-based modes, manifest concepts, schema v2
 *        (objectives, related concepts, further learning, SQL with output,
 *        derivations, practice exercises, self-reported concept coverage).
 */
export const SECTION_PROMPT_VERSION = 2;

/** Shape of the stored section content (part of the cache identity later). */
export const SECTION_SCHEMA_VERSION = 2;

export const LEARNING_MODES = ['quick', 'detailed', 'complete'];

/** Which legacy content parts each mode keeps (validateNoteContent). */
const MODE_SECTIONS = {
  quick: ['definitions', 'formulas', 'tips', 'keyPoints', 'revision'],
  detailed: ['explanation', 'definitions', 'examples', 'stepByStep', 'diagrams', 'formulas', 'tips', 'mistakes', 'keyPoints', 'revision'],
  complete: ['explanation', 'definitions', 'examples', 'stepByStep', 'diagrams', 'formulas', 'tips', 'mistakes', 'keyPoints', 'revision', 'mcqs'],
};

/**
 * Minimum structure per mode (a floor against empty/broken output). Depth
 * and syllabus coverage are judged against the coverage manifest, not words.
 */
export const QUALITY_RULES = {
  quick: { minWords: 250, minKeyFacts: 8, minExplanation: 0, minMcqs: 0 },
  detailed: { minWords: 900, minKeyFacts: 8, minExplanation: 3, minMcqs: 0 },
  complete: { minWords: 1100, minKeyFacts: 10, minExplanation: 3, minMcqs: 6 },
};

/**
 * With a coverage manifest, completeness is judged by coverage (concepts,
 * facts, blocks, comparisons, examples, MCQs) — word counts drop to a
 * minimal sanity floor so a mode is defined by depth, not length.
 */
export const MANIFEST_FLOOR = {
  quick: { minWords: 100, minKeyFacts: 5, minExplanation: 0, minMcqs: 0 },
  detailed: { minWords: 200, minKeyFacts: 3, minExplanation: 2, minMcqs: 0 },
  complete: { minWords: 200, minKeyFacts: 3, minExplanation: 2, minMcqs: 0 },
};

/** What each block asks the model to fill (schema field in brackets). */
const BLOCK_PROMPT = {
  objectives: 'objectives (3-6 learning objectives)',
  explanation: 'explanation (sub-sections, each with a heading and a full body)',
  definitions: 'concepts (key terms with precise definitions)',
  examples: 'examples (worked examples: problem, steps, answer)',
  table: 'tables (comparison / summary tables)',
  mistakes: 'mistakes (common mistakes and misconceptions)',
  tips: 'tips (exam tips and tricks)',
  keyFacts: 'keyFacts (one-line frequently tested facts)',
  revision: 'quickRevision and keyPoints (revision bullets)',
  related: 'relatedConcepts (connected concepts in other sections/topics)',
  mcqs: 'mcqs (8-10 exam-style questions, 4 options each, correctIndex 0-3, explanation)',
  further: 'furtherLearning (what to study next and how to practise)',
  timeline: 'timeline (period/year → event, in chronological order)',
  formulas: 'formulas (name, expression, meaning of every symbol)',
  diagram: 'flowcharts (diagrams/processes as ordered steps)',
  steps: 'step-by-step methods inside examples or flowcharts',
  code: 'codeExamples (short code with a caption)',
  sql: 'sqlExamples (query, sample input description, exact output table, explanation)',
  derivation: 'derivations (formula and the derivation steps)',
  practice: 'practice (exercise question → answer with reason)',
};

export function buildSectionPrompt({ exam, subject, unitName, outline, chapter, section, language, mode, manifest = null }) {
  const template = templateFor(subject.id, outline.unitId ?? '');
  const blocks = blocksFor(template, mode);
  const siblings = chapter.sections
    .map((s) => (s.id === section.id ? `* ${s.title}  <-- THIS SECTION` : `- ${s.title}`))
    .join('\n');
  const lang =
    language === 'hi'
      ? 'Write all text in Hindi (Devanagari). Keep proper nouns, dates, numbers, formulas, SQL and technical terms accurate; add the English term in brackets where students need it.'
      : 'Write all text in clear English.';
  const path = section.path?.length ? `${section.path.join(' › ')} › ` : '';
  return `Exam: ${exam.name}
Subject: ${subject.name}
Topic: ${outline.title}${unitName ? ` (${unitName})` : ''}
Chapter: ${chapter.title}
Section to write: ${path}${section.title}

The chapter is studied section by section. Its sections are:
${siblings}
Write ONLY the marked section, completely. Do not repeat material that belongs to the other sections; mention them only to connect ideas.

Mode: ${MODE_GUIDE[mode]}

${template.guide}
${manifest ? `\nSYLLABUS COVERAGE FOR THIS SECTION:\n${manifestPrompt(manifest, mode)}\nList in "coveredConcepts" the names of the concepts you covered.\n` : ''}
Fill always: overview. Fill these blocks: ${blocks.map((b) => BLOCK_PROMPT[b]).join('; ')}.
Leave every other array empty (do not force blocks that do not fit this subject).

${lang}`;
}

const str = { type: 'STRING' };
const strList = { type: 'ARRAY', items: str };
const obj = (properties, required = Object.keys(properties)) => ({ type: 'OBJECT', properties, required });

export const SECTION_SCHEMA = {
  ...RESPONSE_SCHEMA,
  properties: {
    ...RESPONSE_SCHEMA.properties,
    timeline: { type: 'ARRAY', items: obj({ period: str, event: str }) },
    keyFacts: strList,
    objectives: strList,
    relatedConcepts: strList,
    furtherLearning: strList,
    sqlExamples: {
      type: 'ARRAY',
      items: obj({
        query: str,
        input: str,
        output: obj({ headers: strList, rows: { type: 'ARRAY', items: strList } }),
        explanation: str,
      }),
    },
    derivations: { type: 'ARRAY', items: obj({ formula: str, steps: strList }) },
    practice: { type: 'ARRAY', items: obj({ question: str, answer: str }) },
    coveredConcepts: strList,
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

const clean = (s, n) => (typeof s === 'string' ? s.trim().slice(0, n) : '');
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const strings = (v, n, len) => arr(v, n).map((s) => clean(s, len)).filter(Boolean);

/** Sanitises the schema v2 blocks (caps sizes, drops broken items). */
function v2Blocks(raw) {
  return {
    timeline: arr(raw?.timeline, 40)
      .map((t) => ({ period: clean(t?.period, 80), event: clean(t?.event, 400) }))
      .filter((t) => t.period && t.event),
    keyFacts: strings(raw?.keyFacts, 40, 400),
    objectives: strings(raw?.objectives, 8, 300),
    relatedConcepts: strings(raw?.relatedConcepts, 12, 200),
    furtherLearning: strings(raw?.furtherLearning, 8, 300),
    sqlExamples: arr(raw?.sqlExamples, 8)
      .map((q) => {
        const headers = strings(q?.output?.headers, 8, 80);
        // A row with the wrong number of cells is wrong output: drop it, never trim it.
        const rows = arr(q?.output?.rows, 20)
          .filter((r) => Array.isArray(r) && r.length === headers.length)
          .map((r) => r.map((c) => clean(String(c ?? ''), 200)));
        return { query: clean(q?.query, 2000), input: clean(q?.input, 1500), output: { headers, rows }, explanation: clean(q?.explanation, 1000) };
      })
      .filter((q) => q.query),
    derivations: arr(raw?.derivations, 6)
      .map((d) => ({ formula: clean(d?.formula, 300), steps: strings(d?.steps, 15, 500) }))
      .filter((d) => d.formula && d.steps.length),
    practice: arr(raw?.practice, 15)
      .map((p) => ({ question: clean(p?.question, 800), answer: clean(p?.answer, 800) }))
      .filter((p) => p.question && p.answer),
    // The model's own claim; never trusted alone (checked against the manifest).
    coveredConcepts: strings(raw?.coveredConcepts, 60, 200),
  };
}

/**
 * Validates one generated section and checks the structural floor for the
 * mode. With a manifest, the coverage report is attached to `quality`
 * (enforced from Phase D). Returns { content, quality } or throws
 * GenerationError (nothing is cached or saved in that case).
 */
export function checkSection(raw, mode, { manifest = null, templateId = null } = {}) {
  return assessSection(sanitizeSection(raw, mode), mode, { manifest, templateId });
}

/** Cleans one raw AI section (or a repair supplement). */
export function sanitizeSection(raw, mode) {
  const content = { ...validateNoteContent(raw, MODE_SECTIONS[mode]), ...v2Blocks(raw) };
  content.nextTopics = []; // the server fills next sections from the outline
  return content;
}

/**
 * Cleans a repair SUPPLEMENT: it has no overview and may even be empty
 * (an unusable repair just counts as a failed attempt — it never aborts).
 */
export function sanitizeSupplement(raw, mode) {
  let base = {};
  try {
    base = validateNoteContent({ ...(raw ?? {}), overview: 'supplement' }, MODE_SECTIONS[mode]);
  } catch {
    base = {};
  }
  const { overview: _ignored, nextTopics: _none, ...rest } = base;
  return { ...rest, ...v2Blocks(raw) };
}

/** Structural floor + coverage report for already-clean content. */
export function assessSection(content, mode, { manifest = null, templateId = null, repairAttempts = 0 } = {}) {
  const rules = manifest ? MANIFEST_FLOOR[mode] : QUALITY_RULES[mode];
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
  return {
    content,
    quality: {
      passed: true,
      words,
      checks,
      rulesVersion: SECTION_PROMPT_VERSION,
      schemaVersion: SECTION_SCHEMA_VERSION,
      template: templateId,
      // Without a manifest only the structural floor applies (labelled).
      coverageBasis: manifest ? 'manifest' : 'structure_only',
      coverage: manifest ? checkCoverage(content, manifest, mode) : null,
      repairAttempts,
    },
  };
}

// ── Targeted repair ─────────────────────────────────────────────────────────

/** At most this many repair calls per generation job (never endless). */
export const MAX_REPAIR_ATTEMPTS = 2;

/** Thrown when content still misses manifest coverage after repairs. */
export class ContentIncompleteError extends GenerationError {
  constructor(coverage, repairAttempts) {
    const parts = [
      coverage.concepts.missing.length ? `concepts: ${coverage.concepts.missing.join(', ')}` : '',
      coverage.facts.missing.length ? `facts: ${coverage.facts.missing.join(', ')}` : '',
      coverage.blocks.missing.length ? `blocks: ${coverage.blocks.missing.join(', ')}` : '',
      coverage.mcqs.ok ? '' : `mcqs ${coverage.mcqs.count}/${coverage.mcqs.min}`,
      coverage.comparisons?.ok === false ? `comparison tables ${coverage.comparisons.count}/${coverage.comparisons.required}` : '',
      coverage.examples?.ok === false ? `worked examples ${coverage.examples.count}/${coverage.examples.required}` : '',
      coverage.duplicates ? `${coverage.duplicates} duplicated passages` : '',
    ].filter(Boolean);
    super(`The section is still incomplete after ${repairAttempts} repair attempt(s) (${parts.join('; ')}).`);
    this.code = 'CONTENT_INCOMPLETE';
    this.coverage = coverage;
    this.repairAttempts = repairAttempts;
  }
}

/** Prompt asking ONLY for what the coverage report says is missing. */
export function buildRepairPrompt(request, content, coverage) {
  const { manifest, mode, section } = request;
  const existing = [
    ...content.explanation.map((e) => e.heading),
    ...content.concepts.map((c) => c.term),
  ]
    .filter(Boolean)
    .slice(0, 40)
    .join('; ');
  const wantBlocks = coverage.blocks.missing.map((b) => BLOCK_PROMPT[b]).filter(Boolean);
  const moreMcqs = coverage.mcqs.ok ? 0 : coverage.mcqs.min - coverage.mcqs.count + 2;
  return `You wrote study notes for the section "${section.title}". They are incomplete.
The notes already contain these sub-sections and terms: ${existing || '(none)'}.

Write ONLY the missing material below as SUPPLEMENTARY content in the same JSON schema. Do not repeat or rephrase anything
already covered; leave every array empty that is not needed.
${coverage.concepts.missing.length ? manifestPrompt(manifest, mode, coverage.concepts.missing) : ''}
${coverage.facts.missing.length ? `Include these exam facts: ${coverage.facts.missing.join('; ')}.` : ''}
${wantBlocks.length ? `Add these blocks: ${wantBlocks.join('; ')}.` : ''}
${moreMcqs > 0 ? `Add ${moreMcqs} NEW exam-style MCQs (different from any existing question).` : ''}
${coverage.comparisons?.ok === false ? `Add these comparison tables (in "tables"): ${(manifest.comparisons ?? []).join('; ')}.` : ''}
${coverage.examples?.ok === false ? `Add these worked examples (in "examples", with steps and answer): ${(manifest.examples ?? []).join('; ')}.` : ''}
${coverage.duplicates ? 'Do not duplicate passages.' : ''}
Use the exact concept names given. Put each missing concept in its own explanation sub-section with a heading.
${request.language === 'hi' ? 'Write all text in Hindi (Devanagari).' : 'Write all text in clear English.'}`;
}

const sameText = (a, b) => normalize(a) === normalize(b);
const normalize = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Merges a repair supplement into the content: appends new items to each
 * block, skipping items that repeat existing text (dedupe by normalised
 * text). The original overview and order are kept.
 */
export function mergeSupplement(content, supplement) {
  const merged = { ...content };
  const keyOf = {
    explanation: (x) => x.body,
    concepts: (x) => x.term,
    examples: (x) => x.problem || x.title,
    flowcharts: (x) => x.title,
    formulas: (x) => x.expression,
    tables: (x) => x.title + JSON.stringify(x.rows),
    codeExamples: (x) => x.code,
    mcqs: (x) => x.question,
    timeline: (x) => `${x.period} ${x.event}`,
    sqlExamples: (x) => x.query,
    derivations: (x) => x.formula,
    practice: (x) => x.question,
  };
  for (const [field, value] of Object.entries(supplement)) {
    if (!Array.isArray(value) || field === 'nextTopics') continue;
    const existing = Array.isArray(content[field]) ? content[field] : [];
    const key = keyOf[field] ?? ((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
    const add = value.filter((v) => !existing.some((e) => sameText(key(e), key(v))));
    merged[field] = [...existing, ...add];
  }
  if (!merged.overview && supplement.overview) merged.overview = supplement.overview;
  return merged;
}

const SECTION_SYSTEM_PROMPT = `You are a senior author of study material for Indian government recruitment exams (RRB, SSC, IBPS, SBI, RBI).
You write original, accurate, exam-oriented study notes as JSON matching the schema.
Rules:
- Accuracy first. Never invent facts, dates, names, numbers, outputs or sources. Mark disputed interpretations with "Debated:".
- Cover the requested section completely at the requested depth; never skip listed concepts.
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
      const template = templateFor(request.subject.id, request.outline.unitId ?? '');
      return generateWithRepair(request, {
        templateId: template.id,
        call: ({ prompt, validate, label }) =>
          client.generate({
            models,
            label,
            systemPrompt: SECTION_SYSTEM_PROMPT,
            prompt,
            schema: SECTION_SCHEMA,
            temperature: 0.3,
            maxOutputTokens: 32_768,
            validate,
          }),
      });
    },
  };
}

/**
 * One generation JOB: the first call, then — when a manifest is given and
 * coverage fails — at most MAX_REPAIR_ATTEMPTS targeted calls asking only
 * for the missing material, merged and re-checked each time.
 * Resolves to { content, quality, model, repairAttempts } or throws
 * ContentIncompleteError (nothing may be cached/published then).
 * `call` = one AI call ({ prompt, validate, label }) → { json, model }.
 */
export async function generateWithRepair(request, { call, templateId = null }) {
  const { mode, manifest = null } = request;
  const first = await call({
    label: `notes-section ${request.section.id}`,
    prompt: buildSectionPrompt(request),
    validate: (raw) => checkSection(raw, mode, { manifest, templateId }),
  });
  let { content, quality } = first.json;
  const model = first.model;
  let repairAttempts = 0;
  while (manifest && !quality.coverage.passed && repairAttempts < MAX_REPAIR_ATTEMPTS) {
    repairAttempts++;
    const coverage = quality.coverage;
    const repair = await call({
      label: `notes-section ${request.section.id} repair ${repairAttempts}`,
      prompt: buildRepairPrompt(request, content, coverage),
      validate: (raw) => sanitizeSupplement(raw, mode),
    });
    content = mergeSupplement(content, repair.json);
    ({ quality } = assessSection(content, mode, { manifest, templateId, repairAttempts }));
  }
  if (manifest && !quality.coverage.passed) throw new ContentIncompleteError(quality.coverage, repairAttempts);
  return { content, quality: { ...quality, repairAttempts }, model, repairAttempts };
}
