// Quick check that your GEMINI_API_KEY works, without the app:
//   npm run try-generate                                (RRB NTPC, Time & Work, medium, 3)
//   npm run try-generate -- ssc_cgl quant.algebra hard 5 hi
import { aiMode, config } from '../src/config.js';
import { findExam, topicIndex } from '../src/services/examService.js';
import { GeminiQuestionGenerator, SampleQuestionGenerator } from '../src/services/questionGenerator.js';

const [examId = 'rrb_ntpc', topicId = 'quant.time_work', difficulty = 'medium', count = '3', language = 'en'] =
  process.argv.slice(2);

const exam = findExam(examId);
const entry = topicIndex(examId).get(topicId);
if (!exam || !entry) {
  console.error(`Unknown exam "${examId}" or topic "${topicId}"`);
  process.exit(1);
}

// No sample fallback here: we want to see whether live AI really works.
const generator =
  aiMode() === 'live' ? new GeminiQuestionGenerator(config.ai) : new SampleQuestionGenerator();
console.log(
  aiMode() === 'live'
    ? `Calling Gemini (${config.ai.geminiModels.join(' → ')})…`
    : 'No GEMINI_API_KEY set — preview mode.',
);
const started = Date.now();
const { questions, isPreview, model } = await generator.generate({
  exam,
  topics: [{ id: topicId, name: entry.topic.name, subjectName: entry.subject.name }],
  difficulty,
  count: Number(count),
  language,
});

questions.forEach((q, i) => {
  console.log(`\nQ${i + 1}. ${q.question}`);
  q.options.forEach((o, j) => console.log(`   ${'ABCD'[j]}. ${o}${j === q.correctIndex ? '   ✔' : ''}`));
  console.log(`   → ${q.explanation}`);
  if (q.formula) console.log(`   Formula: ${q.formula}`);
  q.steps?.forEach((s, k) => console.log(`   ${k + 1}) ${s}`));
});
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\n${questions.length} questions in ${secs}s${isPreview ? ' (preview)' : ` via ${model}`}`);
