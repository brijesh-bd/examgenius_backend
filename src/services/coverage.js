import { MODE_BLOCKS } from '../data/contentTemplates.js';

/**
 * Coverage manifests: WHAT a learning section must teach, independent of
 * how many words the AI writes. Generated content is checked against the
 * manifest; a successful AI response is never "complete" by itself.
 *
 * Manifest (one per leaf section, data/manifests/*.js):
 * {
 *   version: 1,
 *   status: 'draft' | 'approved',      // drafts are for review, never shown to students
 *   objectives: [string],              // learning objectives (shown to students)
 *   concepts: [{                       // the syllabus coverage contract
 *     id: 'kalinga_war',
 *     name: 'Kalinga War',
 *     aliases: ['Kalinga'],            // other wordings that count as covering it
 *     level: 'core' | 'detail',        // core: every mode; detail: detailed + complete
 *   }],
 *   blocks: ['explanation', 'timeline', 'table', ...],   // expected content blocks (see BLOCKS)
 *   comparisons: [string],             // comparison tables the section should contain
 *   facts: [string],                   // must-know exam facts (checked like concepts)
 *   examples: [string],                // examples / worked problems expected
 *   mcqs: { min: 6 },                  // Complete Exam Preparation only
 *   sources: [{ title, url? }],        // trusted references (empty = facts unverified)
 * }
 *
 * The check is deliberately mechanical and honest about its limits: it
 * detects MISSING concepts/blocks and DUPLICATED material reliably; it does
 * not judge depth or prove facts. `verification` is 'unverified' unless the
 * manifest lists trusted sources (and even then only "sources listed").
 */

export const BLOCKS = {
  explanation: (c) => (c.explanation?.length ?? 0) > 0,
  definitions: (c) => (c.concepts?.length ?? 0) > 0,
  examples: (c) => (c.examples?.length ?? 0) > 0,
  steps: (c) => (c.flowcharts?.length ?? 0) > 0 || (c.examples ?? []).some((e) => e.steps?.length),
  diagram: (c) => (c.flowcharts?.length ?? 0) > 0,
  table: (c) => (c.tables?.length ?? 0) > 0,
  timeline: (c) => (c.timeline?.length ?? 0) > 0,
  formulas: (c) => (c.formulas?.length ?? 0) > 0,
  code: (c) => (c.codeExamples?.length ?? 0) > 0,
  keyFacts: (c) => (c.keyFacts?.length ?? 0) > 0,
  tips: (c) => (c.tips?.length ?? 0) > 0,
  mistakes: (c) => (c.mistakes?.length ?? 0) > 0,
  revision: (c) => (c.quickRevision?.length ?? 0) > 0 || (c.keyPoints?.length ?? 0) > 0,
  mcqs: (c) => (c.mcqs?.length ?? 0) > 0,
  // Section schema v2 blocks.
  objectives: (c) => (c.objectives?.length ?? 0) > 0,
  related: (c) => (c.relatedConcepts?.length ?? 0) > 0,
  further: (c) => (c.furtherLearning?.length ?? 0) > 0,
  sql: (c) => (c.sqlExamples?.length ?? 0) > 0,
  derivation: (c) => (c.derivations?.length ?? 0) > 0,
  practice: (c) => (c.practice?.length ?? 0) > 0,
};

/** Is block [b] part of mode [mode]? (Same rule the generator uses.) */
const inMode = (b, mode) => MODE_BLOCKS[mode] == null || MODE_BLOCKS[mode].has(b);

const ID_RE = /^[a-z0-9_]+$/;

/** Problems with a manifest's structure ([] = valid). */
export function manifestProblems(m) {
  const p = [];
  if (!Number.isInteger(m?.version) || m.version < 1) p.push('version must be a positive integer');
  if (!['draft', 'approved'].includes(m?.status)) p.push('status must be draft or approved');
  if (!Array.isArray(m?.objectives) || m.objectives.length === 0) p.push('needs objectives');
  if (!Array.isArray(m?.concepts) || m.concepts.length === 0) p.push('needs concepts');
  const ids = new Set();
  for (const c of m?.concepts ?? []) {
    if (!ID_RE.test(c.id ?? '')) p.push(`bad concept id "${c.id}"`);
    if (ids.has(c.id)) p.push(`duplicate concept id "${c.id}"`);
    ids.add(c.id);
    if (!c.name) p.push(`concept ${c.id}: missing name`);
    if (c.level && !['core', 'detail'].includes(c.level)) p.push(`concept ${c.id}: level must be core or detail`);
    if (c.aliases && !Array.isArray(c.aliases)) p.push(`concept ${c.id}: aliases must be a list`);
  }
  for (const b of m?.blocks ?? []) if (!BLOCKS[b]) p.push(`unknown block "${b}"`);
  if (m?.mcqs != null && !(Number.isInteger(m.mcqs.min) && m.mcqs.min >= 0)) p.push('mcqs.min must be a whole number');
  for (const s of m?.sources ?? []) if (!s?.title) p.push('every source needs a title');
  return p;
}

// ── Text helpers ────────────────────────────────────────────────────────────

/** Lower-case, accents folded, punctuation → spaces, single-spaced. */
export function normalizeText(s) {
  return ` ${String(s ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()} `;
}

/** Every string inside the content (all blocks), for concept matching. */
export function contentText(content) {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(content);
  return normalizeText(out.join(' \n '));
}

/** A concept/fact counts as covered when its name or any alias appears as a phrase. */
const mentions = (text, phrases) => phrases.some((ph) => {
  const n = normalizeText(ph);
  return n.trim().length > 0 && text.includes(n);
});

/** Paragraph-level units that should not repeat. */
function units(content) {
  const out = [];
  for (const e of content.explanation ?? []) if (e?.body) out.push(e.body);
  for (const k of ['keyFacts', 'keyPoints', 'quickRevision', 'tips', 'mistakes']) {
    for (const s of content[k] ?? []) if (typeof s === 'string') out.push(s);
  }
  for (const q of content.mcqs ?? []) if (q?.question) out.push(q.question);
  return out;
}

const wordSet = (s) => new Set(normalizeText(s).trim().split(' ').filter((w) => w.length > 2));

/** Near-identical paragraphs/facts/questions (Jaccard ≥ 0.85 on words, ≥ 6 words). */
export function findDuplicates(content) {
  const list = units(content).map((u) => ({ text: u, words: wordSet(u) })).filter((u) => u.words.size >= 6);
  const dups = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i].words;
      const b = list[j].words;
      let inter = 0;
      for (const w of a) if (b.has(w)) inter++;
      if (inter / (a.size + b.size - inter) >= 0.85) dups.push([list[i].text, list[j].text]);
    }
  }
  return dups;
}

/**
 * Quality report for one generated section against its manifest.
 * `passed` only when every required concept, fact and block for the mode is
 * present, the MCQ minimum is met (complete mode) and nothing is duplicated.
 */
export function checkCoverage(content, manifest, mode = 'complete') {
  const text = contentText(content);
  const required = manifest.concepts.filter((c) => mode !== 'quick' || (c.level ?? 'core') === 'core');
  const missingConcepts = required.filter((c) => !mentions(text, [c.name, ...(c.aliases ?? [])])).map((c) => c.id);
  // Must-know facts are required in every mode (Quick Revision is mostly facts).
  const facts = manifest.facts ?? [];
  const missingFacts = facts.filter((f) => !mentions(text, [f]));
  const blocks = (manifest.blocks ?? []).filter((b) => inMode(b, mode));
  const missingBlocks = blocks.filter((b) => !BLOCKS[b](content));
  const mcqMin = mode === 'complete' ? (manifest.mcqs?.min ?? 0) : 0;
  const mcqCount = (content.mcqs ?? []).length;
  const duplicates = findDuplicates(content);
  // Depth (Detailed / Complete): the comparison tables and worked examples
  // the manifest expects. Quick Revision is facts-only and skips these.
  const deep = mode !== 'quick';
  const comparisons = {
    required: deep ? (manifest.comparisons ?? []).length : 0,
    count: (content.tables ?? []).length,
  };
  comparisons.ok = comparisons.count >= comparisons.required;
  const examples = {
    required: deep ? (manifest.examples ?? []).length : 0,
    count: (content.examples ?? []).length + (content.sqlExamples ?? []).length,
  };
  examples.ok = examples.count >= examples.required;
  const passed =
    missingConcepts.length === 0 &&
    missingFacts.length === 0 &&
    missingBlocks.length === 0 &&
    mcqCount >= mcqMin &&
    comparisons.ok &&
    examples.ok &&
    duplicates.length === 0;
  return {
    manifestVersion: manifest.version,
    mode,
    concepts: { required: required.length, covered: required.length - missingConcepts.length, missing: missingConcepts },
    facts: { required: facts.length, missing: missingFacts },
    blocks: { required: blocks, missing: missingBlocks },
    mcqs: { min: mcqMin, count: mcqCount, ok: mcqCount >= mcqMin },
    comparisons,
    examples,
    duplicates: duplicates.length,
    // Honest: no fact checking happens here.
    verification: (manifest.sources ?? []).length ? 'sources_listed' : 'unverified',
    passed,
  };
}

/** Manifest concepts as the AI prompt should see them (for generation/repair). */
export function manifestPrompt(manifest, mode, onlyConceptIds = null) {
  const concepts = manifest.concepts
    .filter((c) => mode !== 'quick' || (c.level ?? 'core') === 'core')
    .filter((c) => !onlyConceptIds || onlyConceptIds.includes(c.id));
  return [
    `MUST COVER every one of these concepts (use these exact names in the text): ${concepts.map((c) => c.name).join('; ')}.`,
    manifest.facts?.length ? `Include these exam facts: ${manifest.facts.join('; ')}.` : '',
    manifest.comparisons?.length ? `Include comparison tables: ${manifest.comparisons.join('; ')}.` : '',
    manifest.examples?.length ? `Include examples: ${manifest.examples.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
