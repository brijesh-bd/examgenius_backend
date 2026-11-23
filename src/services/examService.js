import { examCatalog } from '../data/examCatalog.js';
import { examSubjects, topicUnits } from '../data/syllabus.js';

export function listCategories() {
  return examCatalog;
}

export function findExam(examId) {
  for (const category of examCatalog) {
    const exam = category.exams.find((e) => e.id === examId);
    if (exam) return exam;
  }
  return null;
}

export function getSyllabus(examId) {
  const subjects = examSubjects[examId];
  return subjects ? { examId, subjects } : null;
}

/** Map of topicId → { topic, subject } for one exam's syllabus. */
export function topicIndex(examId) {
  const index = new Map();
  for (const subject of examSubjects[examId] ?? []) {
    for (const topic of subject.topics) index.set(topic.id, { topic, subject });
  }
  return index;
}

// ── Learning path (AI Study Notes) ──────────────────────────────────────────

/**
 * Ordered learning items of one subject: each topic in syllabus order, or —
 * for broad topics — its curated units. Built from the existing syllabus;
 * nothing is stored or duplicated.
 * Item: { id, name, topicId, topicName, unitName|null }
 */
export function learningItems(examId, subjectId) {
  const subject = (examSubjects[examId] ?? []).find((s) => s.id === subjectId);
  if (!subject) return null;
  const items = [];
  for (const topic of subject.topics) {
    const units = topicUnits[topic.id];
    if (!units) {
      items.push({ id: topic.id, name: topic.name, topicId: topic.id, topicName: topic.name, unitName: null });
      continue;
    }
    for (const [slug, unitName] of Object.entries(units)) {
      items.push({
        id: `${topic.id}.${slug}`,
        name: unitName,
        topicId: topic.id,
        topicName: topic.name,
        unitName,
      });
    }
  }
  return { subject: { id: subject.id, name: subject.name }, items };
}

/** A topic or unit id of this exam → its subject, topic and path position. */
export function findLearningItem(examId, itemId) {
  const subjectId = itemId.split('.')[0];
  const path = learningItems(examId, subjectId);
  if (!path) return null;
  // A whole topic that has units is still a valid (broad) notes target.
  const topic = (examSubjects[examId] ?? [])
    .find((s) => s.id === subjectId)
    ?.topics.find((t) => t.id === itemId);
  const index = path.items.findIndex((i) => i.id === itemId);
  if (index < 0 && !topic) return null;
  const item =
    index >= 0
      ? path.items[index]
      : { id: topic.id, name: topic.name, topicId: topic.id, topicName: topic.name, unitName: null };
  // Next items: after this unit, or after the last unit of this topic.
  const after = index >= 0 ? index : path.items.findLastIndex((i) => i.topicId === itemId);
  return { subject: path.subject, item, next: path.items.slice(after + 1, after + 4), path };
}
