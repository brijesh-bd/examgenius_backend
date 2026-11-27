import { GenerationError, AiServiceError } from './questionGenerator.js';
import { GeminiJsonClient, isLiteModel } from './geminiClient.js';
import { syllabusFor } from '../data/syllabusTrees/index.js';

/**
 * Chapter Builder, Phase 1: an AI-built CHAPTER INDEX (outline) for a
 * learning item that has no curated outline. Only the index is generated
 * here, never part content; parts are generated one at a time by the
 * existing section pipeline (sectionGenerator) after an admin approves the
 * index.
 *
 * The index is the same shape as a curated outline (chapters → sections,
 * where "Part" = one leaf section), so progress, cache, continue and
 * completion all work unchanged.
 */
export const INDEX_PROMPT_VERSION = 1;

export const LIMITS = { minChapters: 2, maxChapters: 8, minParts: 2, maxPartsPerChapter: 8, maxParts: 40 };
export const PART_LEVELS = ['basic', 'intermediate', 'advanced'];

const ID_RE = /^[a-z0-9_]+$/;
// "page 12", "pg. 4", "p. 33", "pp. 10-12": no invented page references.
const PAGE_RE = /\b(?:pages?|pg\.?|pp?\.)\s*\d+/i;

const obj = (properties, required = Object.keys(properties)) => ({ type: 'OBJECT', properties, required });
const str = { type: 'STRING' };
const strList = { type: 'ARRAY', items: str };

export const INDEX_SCHEMA = obj({
  title: str,
  overview: str,
  objectives: strList,
  chapters: {
    type: 'ARRAY',
    items: obj({
      id: str,
      title: str,
      description: str,
      parts: {
        type: 'ARRAY',
        items: obj({
          id: str,
          title: str,
          level: { type: 'STRING', enum: PART_LEVELS },
          concepts: strList,
          includes: strList,
        }),
      },
    }),
  },
  revisionPlan: strList,
});

const SYSTEM_PROMPT = `You are an expert competitive-exam teacher and syllabus architect for Indian government exams.
You design the CHAPTER INDEX for one topic: an ordered list of finite learning parts, basic to advanced.
Rules:
- Stay inside the given syllabus scope. Never add unrelated concepts.
- Output the index only. No detailed explanations.
- Never cite textbook page numbers or claim a specific source.
- ids are snake_case (a-z, 0-9, _), unique.
- Plain text (no markdown).`;

/**
 * Verified syllabus scope of a learning item for one exam: the concept-tree
 * nodes whose chapter belongs to this item (via legacy topic id), with their
 * official/supplementary status and exam stages. [] when the subject has no tree.
 */
export function syllabusScope(examId, subjectId, topicId, { stage = null } = {}) {
  const tree = syllabusFor(examId, subjectId);
  if (!tree?.chapters) return [];
  const chapters = tree.chapters(examId).filter((c) => {
    const legacy = c.legacyTopicId ?? `${subjectId}.${c.slug}`;
    if (legacy !== topicId) return false;
    const stages = tree.entry?.(examId, c.slug)?.stages;
    return !stage || !stages || stages.includes(stage);
  });
  const lines = [];
  const walk = (id, depth) => {
    const n = tree.getNode(id);
    lines.push({ nodeId: id, depth, title: n.titleEn, status: tree.status(examId, id), stages: tree.entry?.(examId, n.chapterSlug)?.stages ?? [] });
    for (const c of tree.childIds(examId, id)) walk(c, depth + 1);
  };
  for (const c of chapters) walk(c.nodeId, 0);
  return lines;
}

export function buildIndexPrompt({ exam, subject, item, stage = null, scope = [], templateHint = '' }) {
  const scopeText = scope.length
    ? scope.map((l) => `${'  '.repeat(l.depth)}- ${l.title} [${l.status}]`).join('\n')
    : '(no detailed syllabus tree; use the topic name and standard exam coverage only)';
  return `Exam: ${exam.name}${stage ? ` — stage: ${stage}` : ''}
Subject: ${subject.name}
Topic: ${item.topicName}${item.unitName ? ` › ${item.unitName}` : ''}

Syllabus scope (verified tree for this exam; [official] = named by the notification, [supplementary] = recommended coverage):
${scopeText}

Build the chapter index:
- ${LIMITS.minChapters}-${LIMITS.maxChapters} chapters, each with 1-${LIMITS.maxPartsPerChapter} parts; at most ${LIMITS.maxParts} parts in total.
- Order every part from basic to advanced (level: basic, intermediate, advanced).
- Each part: the concepts it covers (3-8 short items) and what it includes, chosen to fit the subject${templateHint ? ` (${templateHint})` : ''}: e.g. formulas, solved problems, shortcuts, important facts, timeline, articles, examples, comparisons, revision.
- Every concept in the scope must appear in exactly one part; no part repeats another.
- objectives: 3-6 learning objectives. overview: 2-4 sentences. revisionPlan: 3-6 final revision steps.`;
}

/**
 * Validates and normalises an AI index into a curated-outline shape.
 * Throws GenerationError when unusable. Returns { outline, warnings }.
 */
export function checkIndex(raw, { unitId, scope = [] }) {
  const warnings = [];
  const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const stripPages = (s, where) => {
    if (!PAGE_RE.test(s)) return s;
    warnings.push(`removed a page reference in ${where}`);
    return clean(s.replace(new RegExp(PAGE_RE.source, 'gi'), ''));
  };
  const slug = (s, fallback) => {
    const id = clean(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
    return ID_RE.test(id) ? id : fallback;
  };
  const uniq = (id, used) => {
    let out = id;
    for (let i = 2; used.has(out); i++) out = `${id}_${i}`;
    used.add(out);
    return out;
  };

  const rawChapters = Array.isArray(raw?.chapters) ? raw.chapters : [];
  const chapterIds = new Set();
  const seenParts = new Set();
  let total = 0;
  const chapters = [];
  for (const [ci, c] of rawChapters.entries()) {
    if (chapters.length >= LIMITS.maxChapters) {
      warnings.push(`dropped chapters after ${LIMITS.maxChapters}`);
      break;
    }
    const title = stripPages(clean(c?.title), `chapter ${ci + 1}`);
    if (!title) continue;
    const partIds = new Set();
    const sections = [];
    for (const [pi, p] of (Array.isArray(c.parts) ? c.parts : []).entries()) {
      const ptitle = stripPages(clean(p?.title), `${title} part ${pi + 1}`);
      if (!ptitle) continue;
      const key = ptitle.toLowerCase();
      if (seenParts.has(key)) {
        warnings.push(`dropped duplicate part "${ptitle}"`);
        continue;
      }
      if (sections.length >= LIMITS.maxPartsPerChapter || total >= LIMITS.maxParts) {
        warnings.push(`dropped part "${ptitle}" (limit)`);
        continue;
      }
      seenParts.add(key);
      total++;
      sections.push({
        id: uniq(slug(p.id || ptitle, `part_${pi + 1}`), partIds),
        title: ptitle,
        level: PART_LEVELS.includes(p.level) ? p.level : 'intermediate',
        concepts: (p.concepts ?? []).map(clean).filter(Boolean).slice(0, 12),
        includes: (p.includes ?? []).map(clean).filter(Boolean).slice(0, 10),
      });
    }
    if (!sections.length) continue;
    chapters.push({
      id: uniq(slug(c.id || title, `chapter_${ci + 1}`), chapterIds),
      title,
      description: stripPages(clean(c.description), title),
      sections,
    });
  }
  if (chapters.length < LIMITS.minChapters && total < LIMITS.minParts) {
    throw new GenerationError('The AI chapter index was incomplete. Please try again.');
  }

  // Basic → advanced: flag (not reorder) a part that steps back down.
  const order = chapters.flatMap((c) => c.sections);
  for (let i = 1; i < order.length; i++) {
    if (PART_LEVELS.indexOf(order[i].level) < PART_LEVELS.indexOf(order[i - 1].level) - 1) {
      warnings.push(`"${order[i].title}" (${order[i].level}) comes after "${order[i - 1].title}" (${order[i - 1].level})`);
    }
  }
  // Scope coverage: every leaf of the verified scope should be named somewhere.
  const text = JSON.stringify(chapters).toLowerCase();
  const leaves = scope.filter((l, i) => !scope[i + 1] || scope[i + 1].depth <= l.depth);
  const missing = leaves.filter((l) => !text.includes(l.title.toLowerCase().split(/[(/,]/)[0].trim()));
  if (missing.length) warnings.push(`scope items not named in the index: ${missing.slice(0, 10).map((l) => l.title).join('; ')}`);

  return {
    outline: {
      unitId,
      status: 'draft',
      version: 1,
      source: 'ai',
      title: clean(raw?.title) || unitId,
      overview: stripPages(clean(raw?.overview), 'overview'),
      objectives: (raw?.objectives ?? []).map(clean).filter(Boolean).slice(0, 8),
      revisionPlan: (raw?.revisionPlan ?? []).map(clean).filter(Boolean).slice(0, 8),
      sourceRefs: [],
      chapters,
    },
    warnings,
  };
}

export function createOutlineGenerator(aiConfig, { fetchImpl = fetch, log = console } = {}) {
  if (!aiConfig.geminiApiKey) {
    return {
      async generate() {
        throw new AiServiceError('AI Study Notes are not available: the server has no AI key configured.', false);
      },
    };
  }
  const models = (aiConfig.notesModels ?? []).filter((m) => !isLiteModel(m));
  const client = new GeminiJsonClient({ apiKey: aiConfig.geminiApiKey, timeoutMs: Math.max(aiConfig.timeoutMs, 60_000), fetchImpl, log });
  return {
    models,
    async generate(request) {
      const { json, model } = await client.generate({
        models,
        label: `chapter-index ${request.item.id}`,
        systemPrompt: SYSTEM_PROMPT,
        prompt: buildIndexPrompt(request),
        schema: INDEX_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 8192,
        validate: (raw) => checkIndex(raw, { unitId: request.item.id, scope: request.scope }),
      });
      return { ...json, model };
    },
  };
}
