/**
 * Subject content templates for section-by-section notes.
 *
 * One COMMON framework (overview, objectives, explanation, definitions,
 * examples, tables, mistakes, tips, key facts, revision, related concepts,
 * MCQs, further learning) plus a template per SUBJECT FAMILY that says which
 * extra blocks matter and how to write them. Blocks that do not fit a
 * family are never requested (no SQL in History, no timeline in Maths).
 *
 * Block names are the coverage block names (services/coverage.js BLOCKS).
 */

export const COMMON_BLOCKS = [
  'objectives',
  'explanation',
  'definitions',
  'examples',
  'table',
  'mistakes',
  'tips',
  'keyFacts',
  'revision',
  'related',
  'mcqs',
  'further',
];

export const TEMPLATES = {
  history_gk: {
    id: 'history_gk',
    label: 'History / General Awareness',
    blocks: ['timeline'],
    guide: `GENERAL AWARENESS / HISTORY / POLITY / GEOGRAPHY. Where relevant include: background, chronology, important dates and events,
dynasties and rulers, personalities, places with their PRESENT-DAY location (state/country), books and authors, inscriptions and
sources with their significance, administration, economy, society, religion, art and architecture, causes and consequences,
comparison tables, and frequently tested facts.
Put dated events in "timeline" (period/year → event), one-line exam facts in "keyFacts".
Use only well-established facts. If historians or archaeologists disagree, present the main views and prefix the point with "Debated:".
Write "c." (circa) for approximate dates. Never invent dates, names, sites, numbers or sources.`,
  },
  banking: {
    id: 'banking',
    label: 'Banking / Financial Awareness',
    blocks: ['timeline'],
    guide: `BANKING / FINANCIAL AWARENESS. Cover: banking terminology with precise definitions, RBI functions and monetary policy
instruments, banking products and operations, relevant Acts and regulations with their important provisions and years, institutions
and their heads only where stable, and comparison tables (e.g. instrument vs purpose).
RATES, LIMITS AND OFFICE-HOLDERS CHANGE: do not state a current repo rate, CRR, SLR, insurance limit or name of a current office-holder
as fact. Explain the concept and write "check the latest RBI/Government notification" instead of a number, unless the number is
historical and dated (e.g. "In 1969, 14 banks were nationalised").`,
  },
  science: {
    id: 'science',
    label: 'General Science',
    blocks: ['formulas', 'diagram'],
    guide: `GENERAL SCIENCE. Cover definitions, laws and principles, SI units, formulas with the meaning of each symbol, examples from daily
life, important discoveries and scientists, simple process diagrams as step lists, and frequently tested facts.`,
  },
  computer: {
    id: 'computer',
    label: 'Computer Science / IT',
    blocks: ['diagram', 'steps', 'code', 'sql'],
    guide: `COMPUTER SCIENCE / IT (technical exam depth). Cover: architecture and working principles, precise definitions, diagrams and
flowcharts as ordered step lists ("flowcharts"), algorithms as numbered steps, worked examples, complexity analysis where relevant,
comparison tables, and technical exam-style questions.
For database/SQL sections put each query in "sqlExamples" with small sample input, the EXACT expected output table and a short
explanation; the output must be what the query really returns on that input. Other code goes in "codeExamples".`,
  },
  maths: {
    id: 'maths',
    label: 'Mathematics / Quantitative Aptitude',
    blocks: ['formulas', 'derivation', 'steps'],
    guide: `MATHEMATICS / QUANTITATIVE APTITUDE. Cover: definitions, every formula with the meaning of each symbol, derivations of the key
formulas where they aid understanding ("derivations"), shortcuts and tricks with when they apply, and solved examples from BASIC to
ADVANCED covering the different exam question patterns, each with a full step-by-step solution and the final answer. Check every
calculation.`,
  },
  reasoning: {
    id: 'reasoning',
    label: 'Reasoning',
    blocks: ['steps'],
    guide: `REASONING. Explain the question types, the rules/patterns behind them and a reliable method for each, then solve several
exam-style examples step by step from easy to hard, and list common traps.`,
  },
  english: {
    id: 'english',
    label: 'English Language',
    blocks: ['practice'],
    guide: `ENGLISH LANGUAGE. Cover: the grammar rules with their exceptions, sentence structures, correct vs incorrect examples
(show the incorrect sentence, the correction and the rule), vocabulary and usage, and practice exercises with answers
("practice": question → answer with a one-line reason).`,
  },
  general: {
    id: 'general',
    label: 'General',
    blocks: [],
    guide: 'Explain the concepts, rules and patterns clearly with several solved exam-style examples.',
  },
};

/** Subject id (syllabus) → template family. Topic id refines mixed subjects. */
export function templateFor(subjectId, topicId = '') {
  if (subjectId === 'banking_awareness') return TEMPLATES.banking;
  if (subjectId === 'general_awareness') {
    return /\.(economy|banking)/.test(topicId) ? TEMPLATES.banking : TEMPLATES.history_gk;
  }
  if (subjectId === 'general_science') return TEMPLATES.science;
  if (['professional_it', 'computer', 'technical'].includes(subjectId)) return TEMPLATES.computer;
  if (subjectId === 'quant') return TEMPLATES.maths;
  if (subjectId === 'reasoning') return TEMPLATES.reasoning;
  if (subjectId === 'english') return TEMPLATES.english;
  return TEMPLATES.general;
}

/**
 * Learning modes differ by DEPTH and COVERAGE, not by word count:
 *  quick    — the facts you revise the night before: definitions, formulas,
 *             key facts, revision tables/timeline; core concepts only.
 *  detailed — full understanding: explanations, worked examples,
 *             comparisons, important concepts; all concepts.
 *  complete — everything in detailed + subject-specific material, common
 *             mistakes, tips, important facts, MCQs and revision (default).
 */
export const MODE_BLOCKS = {
  quick: new Set(['definitions', 'formulas', 'table', 'timeline', 'keyFacts', 'revision']),
  detailed: new Set([
    'objectives',
    'explanation',
    'definitions',
    'examples',
    'steps',
    'diagram',
    'table',
    'timeline',
    'formulas',
    'derivation',
    'code',
    'sql',
    'practice',
    'keyFacts',
    'revision',
    'related',
  ]),
  complete: null, // every block of the template
};

export const MODE_GUIDE = {
  quick:
    'QUICK REVISION: only what a student revises before the exam — crisp definitions, formulas, one-line key facts, and revision tables/timeline. Core concepts only; no long explanations.',
  detailed:
    'DETAILED LEARNING: build full understanding — explain every concept with sub-sections, worked examples, comparisons and the important concepts. Cover ALL listed concepts.',
  complete:
    'COMPLETE EXAM PREPARATION: complete syllabus coverage of this section — detailed explanations, basic-to-advanced examples, all subject-specific material, common mistakes, exam tips, important facts, 8-10 exam-style MCQs with explanations, and revision material.',
};

/** The blocks to request for a template in a mode (template order). */
export function blocksFor(template, mode) {
  const all = [...COMMON_BLOCKS, ...template.blocks];
  const allowed = MODE_BLOCKS[mode];
  return allowed ? all.filter((b) => allowed.has(b)) : all;
}
