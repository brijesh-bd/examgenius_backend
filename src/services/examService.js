import { examCatalog } from '../data/examCatalog.js';
import { examSubjects } from '../data/syllabus.js';

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
