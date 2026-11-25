// LIVE Gemini integration check (real API calls — not part of `npm test`).
//   npm run gemini-live            (max 8 requests; LIVE_MAX_REQUESTS to lower)
// Uses the key and models from .env unchanged. The key is never printed: only
// model names, HTTP statuses, timings and validation results are reported.
// Checks marked LOCAL make no request (they re-use live output or stubs).
import { config } from '../src/config.js';
import {
  FallbackGenerator,
  GeminiQuestionGenerator,
  GenerationError,
  SampleQuestionGenerator,
  checkAnswerConsistency,
  filterQuestions,
  isValidQuestion,
} from '../src/services/questionGenerator.js';
import { createNotesGenerator } from '../src/services/notesGenerator.js';

const CAP = Math.min(8, Number(process.env.LIVE_MAX_REQUESTS ?? 8));
if (!config.ai.geminiApiKey) {
  console.error('No GEMINI_API_KEY configured — live check not run.');
  process.exit(2);
}

const calls = [];
/** Real fetch with a hard request cap; records model/status/time only. */
async function countedFetch(url, init) {
  if (calls.length >= CAP) throw Object.assign(new Error(`request cap (${CAP}) reached`), { capReached: true });
  const model = String(url).match(/models\/([^:]+)/)?.[1] ?? '?';
  const entry = { n: calls.length + 1, model, status: null, ms: 0 };
  calls.push(entry);
  const t = Date.now();
  try {
    const res = await fetch(url, init);
    entry.status = res.status;
    return res;
  } catch (err) {
    entry.status = err.name === 'AbortError' ? 'timeout' : 'network-error';
    throw err;
  } finally {
    entry.ms = Date.now() - t;
  }
}

const quiet = { warn: () => {}, error: () => {}, info: () => {} };
const results = [];
const record = (name, kind, ok, details) => {
  results.push({ name, kind, ok, ...details });
  console.log(`${ok ? 'PASS' : 'FAIL'} [${kind}] ${name}${details?.note ? ` — ${details.note}` : ''}`);
};
const errInfo = (e) => ({ error: e.constructor?.name, message: String(e.message).slice(0, 160), quota: Boolean(e.quotaExhausted), retryable: e.retryable ?? null });

const exam = { id: 'rrb_group_d', name: 'RRB Group D' };
const live = new GeminiQuestionGenerator(config.ai, countedFetch, quiet);
let sampleOfLive = null;

// 1. LIVE — plain topic-level generation.
try {
  const r = await live.generate({
    exam,
    topics: [{ id: 'quant.percentage', name: 'Percentage', subjectName: 'Mathematics' }],
    difficulty: 'easy',
    count: 3,
    language: 'en',
  });
  sampleOfLive = r.questions[0];
  const valid = r.questions.every((q) => isValidQuestion(q, new Set(['quant.percentage'])) && checkAnswerConsistency(q).length === 0);
  record('question generation (3 × Percentage, en)', 'LIVE', !r.isPreview && r.questions.length > 0 && valid, {
    model: r.model,
    returned: r.questions.length,
    note: `${r.questions.length}/3 valid questions from ${r.model}, isPreview=${r.isPreview}`,
  });
} catch (e) {
  record('question generation (3 × Percentage, en)', 'LIVE', false, { ...errInfo(e), note: e.message });
}

// 2. LIVE — concept-scoped generation (one micro-concept).
try {
  const concept = { nodeId: 'rr.number_series.task.missing_term', name: 'Missing Term', path: 'Number Series › Question Type', patterns: [] };
  const r = await live.generate({
    exam,
    topics: [{ id: 'reasoning.number_letter_series', name: 'Number Series', subjectName: 'General Intelligence & Reasoning', concepts: [concept] }],
    difficulty: 'easy',
    count: 3,
    language: 'en',
  });
  const scoped = r.questions.every((q) => q.nodeId === concept.nodeId);
  record('concept-scoped generation (Number Series › Missing Term)', 'LIVE', r.questions.length > 0 && scoped, {
    model: r.model,
    returned: r.questions.length,
    note: `${r.questions.length}/3 kept, all tagged ${concept.nodeId}: ${scoped}`,
  });
} catch (e) {
  record('concept-scoped generation (Number Series › Missing Term)', 'LIVE', false, { ...errInfo(e), note: e.message });
}

// 3. LIVE — Hindi output.
try {
  const r = await live.generate({
    exam,
    topics: [{ id: 'general_awareness.history', name: 'History', subjectName: 'General Awareness' }],
    difficulty: 'easy',
    count: 2,
    language: 'hi',
  });
  const devanagari = r.questions.every((q) => /[ऀ-ॿ]/.test(q.question));
  record('Hindi generation (2 × History)', 'LIVE', r.questions.length > 0 && devanagari, {
    model: r.model,
    note: `${r.questions.length}/2 questions, Devanagari text: ${devanagari}`,
  });
} catch (e) {
  record('Hindi generation (2 × History)', 'LIVE', false, { ...errInfo(e), note: e.message });
}

// 4. LOCAL — invalid / incomplete responses are rejected (mutations of a live question).
{
  const base = sampleOfLive ?? { topicId: 'quant.percentage', question: 'Q?', options: ['10', '20', '30', '40'], correctIndex: 1, explanation: '2 × 10 = 20.', steps: [] };
  const topics = [{ id: 'quant.percentage' }];
  const bad = {
    'three options': { ...base, options: base.options.slice(0, 3) },
    'duplicate options': { ...base, options: [base.options[0], base.options[0], base.options[2], base.options[3]] },
    'index out of range': { ...base, correctIndex: 4 },
    'empty explanation': { ...base, explanation: '' },
    'unknown topic': { ...base, topicId: 'quant.unknown' },
    'missing question': { ...base, question: undefined },
  };
  const rejected = Object.entries(bad).filter(([, q]) => filterQuestions([q], topics).length === 0).map(([k]) => k);
  const scopedTopics = [{ id: 'quant.percentage', concepts: [{ nodeId: 'rm.a' }] }];
  const outOfScope = filterQuestions([{ ...base, nodeId: 'rm.other' }], scopedTopics).length === 0;
  record('invalid/incomplete AI output rejected', 'LOCAL', rejected.length === Object.keys(bad).length && outOfScope, {
    note: `${rejected.length}/${Object.keys(bad).length} malformed variants rejected; out-of-scope concept rejected: ${outOfScope}`,
  });
}

// 5. LIVE — timeout handling (first configured model only, 1 ms timeout).
{
  const before = calls.length;
  const t = new GeminiQuestionGenerator({ ...config.ai, geminiModels: config.ai.geminiModels.slice(0, 1), timeoutMs: 1 }, countedFetch, quiet);
  try {
    await t.generate({ exam, topics: [{ id: 'quant.percentage', name: 'Percentage', subjectName: 'Mathematics' }], difficulty: 'easy', count: 1, language: 'en' });
    record('timeout surfaces as a retryable AI error', 'LIVE', false, { note: 'request unexpectedly succeeded' });
  } catch (e) {
    const ok = e.retryable === true && /timed out/i.test(e.message);
    record('timeout surfaces as a retryable AI error', 'LIVE', ok, { ...errInfo(e), note: `${e.message} (requests used: ${calls.length - before})` });
  }
}

// 6. LIVE — study notes generation (validated by validateNoteContent).
try {
  const notes = createNotesGenerator(config.ai, { fetchImpl: countedFetch, log: quiet });
  const { content, model } = await notes.generate({
    exam,
    subject: { id: 'quant', name: 'Mathematics' },
    topic: { id: 'rm.percentage.change.increase_decrease.successive_change', name: 'Percentage › Successive Percentage Change' },
    concept: { path: 'Percentage › Percentage Change › Successive Percentage Change', patterns: ['Find the final value'] },
    language: 'en',
    level: 'basic',
    sections: ['explanation', 'formulas'],
  });
  record('study notes generation (one concept)', 'LIVE', Boolean(content?.overview), {
    model,
    note: `overview ${content?.overview?.length ?? 0} chars, ${content?.explanation?.length ?? 0} explanation blocks, ${content?.formulas?.length ?? 0} formulas`,
  });
} catch (e) {
  record('study notes generation (one concept)', 'LIVE', false, { ...errInfo(e), note: e.capReached ? 'skipped: request cap reached' : e.message });
}

// 7. LOCAL — no sample questions passed off as live questions.
{
  const failing = { generate: async () => { throw Object.assign(new Error('busy'), { retryable: true }); } };
  const fb = new FallbackGenerator(failing, new SampleQuestionGenerator(), quiet);
  const r = await fb.generate({ exam, topics: [{ id: 'quant.percentage', name: 'Percentage', subjectName: 'Mathematics' }], difficulty: 'easy', count: 2, language: 'en' });
  let conceptRefused = false;
  try {
    await new SampleQuestionGenerator().generate({ topics: [{ id: 'quant.percentage', concepts: [{ nodeId: 'rm.x' }] }], difficulty: 'easy', count: 2 });
  } catch (e) {
    conceptRefused = e instanceof GenerationError;
  }
  record('fallback samples are flagged isPreview; concept practice never uses samples', 'LOCAL', r.isPreview === true && conceptRefused, {
    note: `fallback isPreview=${r.isPreview}; concept request refused=${conceptRefused}`,
  });
}

// 8. Quota / rate limit: never provoked on purpose (would burn quota).
{
  const q = calls.filter((c) => c.status === 429);
  console.log(
    q.length
      ? `INFO [LIVE] quota/rate-limit: ${q.length} real HTTP 429 response(s) observed — see request log`
      : 'INFO [LIVE] quota/rate-limit: no 429 occurred; behaviour covered only by mocked tests (test/api.test.js)',
  );
}

console.log(`\nRequests used: ${calls.length}/${CAP}`);
for (const c of calls) console.log(`  #${c.n} ${c.model} → ${c.status} (${c.ms} ms)`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
