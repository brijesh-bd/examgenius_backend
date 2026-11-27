/**
 * Banking exam-wise and stage-wise mapping (IBPS / SBI), verified 2026-11-27
 * against the official notifications in BANK_SOURCES.
 *
 * What the notifications print: stages and SECTION names (with questions,
 * marks, time). They print NO topic syllabus. Therefore:
 *   - sections (BANK_PATTERNS) are official, with the figures as printed;
 *   - every chapter below a section is 'supplementary' (recommended
 *     coverage), with the notification as its source;
 *   - IBPS RRB Officer Scale-II (IT) prints no section table → 'draft'.
 * Each chapter entry carries `stages`: the stage(s) it is prepared for, so
 * Prelims, Mains and single-exam coverage never mix.
 * Professional Knowledge (IT) uses the GATE CS 2026 sections as its baseline
 * (product decision, not an IBPS statement).
 */
import { BANKING_IT_CHAPTERS, GATE_CHAPTERS } from './professionalIt.js';

export const BANK_SOURCES = {
  ibps_po_xvi: {
    name: 'IBPS', type: 'official', title: 'CRP PO/MT-XVI — Detailed Notification',
    url: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf',
    ref: 'D. Structure of Examination (pp. 11–12)', checkedOn: '2026-11-27',
  },
  ibps_po_xv: {
    name: 'IBPS', type: 'official', title: 'CRP PO/MT-XV — Detailed Notification (previous cycle)',
    url: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XV.pdf',
    ref: 'p. 11', checkedOn: '2026-11-27',
  },
  ibps_csa_xv: {
    name: 'IBPS', type: 'official', title: 'CRP CSA-XV (Customer Service Associates) — Detailed Notification',
    url: 'https://www.ibps.in/wp-content/uploads/DetailedNotification_CRP_CSA_XV_Final_for_Website_12.9.2025.pdf',
    ref: 'p. 13', checkedOn: '2026-11-27',
  },
  ibps_rrb_xiv: {
    name: 'IBPS', type: 'official', title: 'CRP RRBs-XIV — Detailed Notification',
    url: 'https://www.ibps.in/wp-content/uploads/CRP-RRBs-XIV_Final_AD-19.9.25.pdf',
    ref: 'D. Online Examination Structure (pp. 15–16)', checkedOn: '2026-11-27',
  },
  ibps_spl_xv: {
    name: 'IBPS', type: 'official', title: 'CRP SPL-XV (Specialist Officers) — Detailed Notification',
    url: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification-CRP-SPL-XV_15.7.25.pdf',
    ref: 'p. 12 (read from a mirror copy; ibps.in link failed with an SSL error)', checkedOn: '2026-11-27',
  },
  sbi_po_2026: {
    name: 'State Bank of India', type: 'official', title: 'CRPD/PO/2026-27/09 — Probationary Officers',
    url: 'http://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf', ref: 'p. 6', checkedOn: '2026-11-27',
  },
  sbi_ja_2026: {
    name: 'State Bank of India', type: 'official', title: 'CRPD/CR/2026-27/17 — Junior Associates (Customer Support & Sales)',
    url: 'https://sbi.bank.in/webfiles/uploads/files_2627/08/JA_2026_Detailed_Advt_Eng.pdf', ref: 'pp. 4–5', checkedOn: '2026-11-27',
  },
  gate_cs_2026: {
    name: 'IIT Guwahati (GATE 2026)', type: 'reference', title: 'GATE 2026 Syllabus — Computer Science and Information Technology (CS)',
    url: 'https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/CS_2026_Syllabus.pdf', checkedOn: '2026-11-27',
  },
};

// ── Official patterns (figures exactly as printed; null = not printed) ──────
const sec = (name, subjectIds, questions, marks, minutes) => ({ name, subjectIds, questions, marks, minutes });

export const BANK_PATTERNS = {
  ibps_rrb_so_it: {
    source: 'ibps_rrb_xiv',
    verified: false,
    note: 'CRP RRBs-XIV states only "a Single Level Examination for Officers Scale II and Officers Scale III", followed by a Common Interview. No section table is printed, so the subjects below are draft coverage, not an official pattern.',
    stages: [
      { id: 'single', name: 'Single Level Examination', sections: [] },
      { id: 'interview', name: 'Common Interview', sections: [] },
    ],
  },
  ibps_so_it: {
    source: 'ibps_spl_xv',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('English Language', ['english'], 50, 25, 40),
        sec('Reasoning', ['reasoning'], 50, 50, 40),
        sec('Quantitative Aptitude', ['quant'], 50, 50, 40),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [sec('Professional Knowledge', ['professional_it'], 60, 60, 45)] },
      { id: 'interview', name: 'Interview', sections: [] },
    ],
  },
  ibps_po: {
    source: 'ibps_po_xvi',
    verified: true,
    changes: 'XVI vs XV Mains: 145 → 170 questions; GA 50 → 60 marks; English 40 → 20 marks (source ibps_po_xv).',
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('English Language', ['english'], 30, 30, 20),
        sec('Quantitative Aptitude', ['quant'], 35, 30, 20),
        sec('Reasoning Ability', ['reasoning'], 35, 40, 20),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [
        sec('Reasoning', ['reasoning'], 40, 60, 45),
        sec('General/ Economy/ Banking Awareness / Digital/ Financial Awareness including RBI circulars', ['general_awareness', 'banking_awareness', 'computer'], 50, 60, 35),
        sec('English Language', ['english'], 40, 20, 35),
        sec('Data Analysis & Interpretation', ['quant'], 40, 60, 45),
      ] },
      { id: 'descriptive', name: 'Descriptive Paper (Essay and Comprehension)', sections: [sec('Essay and Comprehension', ['english'], 2, 25, 30)] },
      { id: 'interview', name: 'Personality Test and Interview', sections: [] },
    ],
  },
  ibps_clerk: {
    source: 'ibps_csa_xv',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('English Language', ['english'], 30, 30, 20),
        sec('Numerical Ability', ['quant'], 35, 35, 20),
        sec('Reasoning Ability', ['reasoning'], 35, 35, 20),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [
        sec('General/ Financial Awareness', ['general_awareness', 'banking_awareness'], 40, 50, 20),
        sec('General English', ['english'], 40, 40, 35),
        sec('Reasoning Ability', ['reasoning'], 40, 60, 35),
        sec('Quantitative Aptitude', ['quant'], 35, 50, 30),
      ] },
    ],
  },
  ibps_rrb_po: {
    source: 'ibps_rrb_xiv',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('Reasoning', ['reasoning'], 40, 40, 25),
        sec('Quantitative Aptitude', ['quant'], 40, 40, 20),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [
        sec('Reasoning', ['reasoning'], 40, 50, 30),
        sec('Computer Knowledge', ['computer'], 40, 20, 15),
        sec('General Awareness', ['general_awareness', 'banking_awareness'], 40, 40, 15),
        sec('English Language or Hindi Language (candidate opts one)', ['english', 'hindi'], 40, 40, 30),
        sec('Quantitative Aptitude', ['quant'], 40, 50, 30),
      ] },
      { id: 'interview', name: 'Common Interview', sections: [] },
    ],
  },
  ibps_rrb_clerk: {
    source: 'ibps_rrb_xiv',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('Reasoning', ['reasoning'], 40, 40, 25),
        sec('Numerical Ability', ['quant'], 40, 40, 20),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [
        sec('Reasoning', ['reasoning'], 40, 50, 30),
        sec('Computer Knowledge', ['computer'], 40, 20, 15),
        sec('General Awareness', ['general_awareness', 'banking_awareness'], 40, 40, 15),
        sec('English Language or Hindi Language (candidate opts one)', ['english', 'hindi'], 40, 40, 30),
        sec('Numerical Ability', ['quant'], 40, 50, 30),
      ] },
    ],
  },
  sbi_po: {
    source: 'sbi_po_2026',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Phase-I: Preliminary Examination', note: '100 marks in total; per-section marks not printed.', sections: [
        sec('English Language', ['english'], 40, null, 20),
        sec('Quantitative Aptitude', ['quant'], 30, null, 20),
        sec('Reasoning Ability', ['reasoning'], 30, null, 20),
      ] },
      { id: 'mains', name: 'Phase-II: Main Examination (Objective)', sections: [
        sec('Reasoning & Computer Aptitude', ['reasoning', 'computer'], 40, 60, 50),
        sec('Data Analysis & Interpretation', ['quant'], 30, 60, 45),
        sec('General Awareness / Economy / Banking Knowledge', ['general_awareness', 'banking_awareness'], 60, 60, 45),
        sec('English Language', ['english'], 40, 20, 40),
      ] },
      { id: 'descriptive', name: 'Phase-II: Descriptive Test (Communication Skills)', sections: [sec('Emails, Situation Analysis, Report / Précis Writing', ['english'], 3, 30, 30)] },
      { id: 'interview', name: 'Phase-III: Psychometric Test, Group Exercise and Interview', sections: [] },
    ],
  },
  sbi_clerk: {
    source: 'sbi_ja_2026',
    verified: true,
    stages: [
      { id: 'prelims', name: 'Preliminary Examination', sections: [
        sec('English Language', ['english'], 30, 30, 20),
        sec('Numerical Ability', ['quant'], 35, 35, 20),
        sec('Reasoning Ability', ['reasoning'], 35, 35, 20),
      ] },
      { id: 'mains', name: 'Main Examination', sections: [
        sec('General/ Financial Awareness', ['general_awareness', 'banking_awareness'], 50, 50, 35),
        sec('General English', ['english'], 40, 40, 35),
        sec('Quantitative Aptitude', ['quant'], 50, 50, 45),
        sec('Reasoning Ability & Computer Aptitude', ['reasoning', 'computer'], 50, 60, 45),
      ] },
      { id: 'language_test', name: 'Local Language Proficiency Test', note: 'Only for candidates who did not study the local language in Class 10/12. Not practised in the app.', sections: [] },
    ],
  },
};

// ── Chapter mapping helpers ─────────────────────────────────────────────────
const S = 'supplementary';
/** Chapters as recommended coverage of an official section, for the given stages. */
const rec = (src, stages, slugs) =>
  Object.fromEntries(slugs.map((c) => [c, { status: S, sources: [src], childStatus: S, stages }]));
const draft = (stages, slugs) =>
  Object.fromEntries(slugs.map((c) => [c, { status: 'draft', sources: [], childStatus: 'draft', stages }]));
/** Merge stage lists when a chapter appears in several stages. */
const merge = (...maps) => {
  const out = {};
  for (const m of maps) for (const [k, v] of Object.entries(m)) {
    out[k] = out[k] ? { ...out[k], stages: [...new Set([...out[k].stages, ...v.stages])] } : v;
  }
  return out;
};
const P = ['prelims'];
const M = ['mains'];
const PM = ['prelims', 'mains'];

const ARITHMETIC = [
  'percentage', 'ratio_proportion', 'average', 'profit_loss', 'interest', 'partnership', 'mixtures_alligation',
  'time_work', 'pipes_cisterns', 'time_speed_distance', 'ages', 'mensuration', 'probability', 'permutation_combination',
];
const QUANT_CLERK_PRE = ['simplification', 'approximation', 'number_series', 'quadratic_equations', 'data_interpretation', 'number_system', ...ARITHMETIC];
const QUANT_PO_PRE = ['simplification', 'approximation', 'number_series', 'quadratic_equations', 'data_interpretation', ...ARITHMETIC];
const QUANT_DI_MAINS = ['data_interpretation', 'data_sufficiency', 'quantity_comparison', 'number_series', 'quadratic_equations', ...ARITHMETIC];

const REASONING_PRE = ['inequality', 'syllogism', 'coding_decoding', 'blood_relations', 'direction_sense', 'order_ranking', 'alphanumeric_series', 'seating_arrangement', 'puzzles', 'miscellaneous'];
const REASONING_MAINS = [...REASONING_PRE, 'input_output', 'data_sufficiency', 'logical_reasoning'];

const ENGLISH_OBJ = ['vocabulary', 'grammar', 'sentence_structure', 'comprehension', 'bank_formats'];
// No History: not named by IBPS/SBI (product rule: History outlines never attach to Banking).
const GA = ['current_affairs', 'static_gk', 'economy', 'polity', 'geography', 'science_tech'];
const BANKING_GA = ['banking_history', 'rbi', 'regulation', 'products_services', 'payment_systems', 'financial_system', 'public_finance', 'government_schemes'];
const COMPUTER_ALL = ['fundamentals', 'software', 'ms_office', 'dbms', 'networking', 'security', 'digital_banking', 'abbreviations'];

/** Standard IBPS/SBI subject map: quant chapters per stage, GA etc. in Mains. */
const bankExam = (src, { quantPre, quantMains, englishPre = true, computer = null, hindi = false, descriptive = false }) => ({
  quant: merge(rec(src, P, quantPre), rec(src, M, quantMains)),
  reasoning: merge(rec(src, P, REASONING_PRE), rec(src, M, REASONING_MAINS)),
  english: {
    ...rec(src, englishPre ? PM : M, ENGLISH_OBJ),
    ...(descriptive ? rec(src, ['descriptive'], ['descriptive']) : {}),
  },
  general_awareness: rec(src, M, GA),
  banking_awareness: rec(src, M, BANKING_GA),
  ...(computer ? { computer: rec(src, M, computer) } : {}),
  ...(hindi ? { hindi: rec(src, M, ['shabd_vichar', 'shabd_rachna', 'shabd_bhandar', 'vakya', 'gadyansh']) } : {}),
});


export const BANK_EXAM_SYLLABUS = {
  // Work order requested: RRB Scale-II IT first (draft: no official pattern).
  ibps_rrb_so_it: {
    difficulty: 'hard',
    subjects: {
      professional_it: draft(['single'], [...GATE_CHAPTERS, ...BANKING_IT_CHAPTERS]),
      reasoning: draft(['single'], REASONING_MAINS),
      quant: draft(['single'], QUANT_DI_MAINS),
      english: draft(['single'], ENGLISH_OBJ),
      hindi: draft(['single'], ['shabd_vichar', 'shabd_rachna', 'shabd_bhandar', 'vakya', 'gadyansh']),
      general_awareness: draft(['single'], GA),
      banking_awareness: draft(['single'], BANKING_GA),
      computer: draft(['single'], COMPUTER_ALL),
    },
  },
  ibps_so_it: {
    difficulty: 'hard',
    subjects: {
      english: rec('ibps_spl_xv', P, ENGLISH_OBJ),
      reasoning: rec('ibps_spl_xv', P, REASONING_MAINS),
      quant: rec('ibps_spl_xv', P, QUANT_DI_MAINS),
      professional_it: rec('ibps_spl_xv', M, [...GATE_CHAPTERS, ...BANKING_IT_CHAPTERS]),
    },
  },
  // "Digital" awareness is named inside the PO Mains GA section → digital banking only.
  ibps_po: { difficulty: 'medium', subjects: bankExam('ibps_po_xvi', { quantPre: QUANT_PO_PRE, quantMains: QUANT_DI_MAINS, computer: ['digital_banking', 'security'], descriptive: true }) },
  ibps_clerk: { difficulty: 'easy', subjects: bankExam('ibps_csa_xv', { quantPre: QUANT_CLERK_PRE, quantMains: QUANT_CLERK_PRE }) },
  // RRB Prelims has no English; Mains: English OR Hindi, plus Computer Knowledge.
  ibps_rrb_po: { difficulty: 'medium', subjects: bankExam('ibps_rrb_xiv', { quantPre: QUANT_PO_PRE, quantMains: QUANT_DI_MAINS, englishPre: false, computer: COMPUTER_ALL, hindi: true }) },
  ibps_rrb_clerk: { difficulty: 'easy', subjects: bankExam('ibps_rrb_xiv', { quantPre: QUANT_CLERK_PRE, quantMains: QUANT_CLERK_PRE, englishPre: false, computer: COMPUTER_ALL, hindi: true }) },
  sbi_po: { difficulty: 'hard', subjects: bankExam('sbi_po_2026', { quantPre: QUANT_PO_PRE, quantMains: QUANT_DI_MAINS, computer: COMPUTER_ALL, descriptive: true }) },
  sbi_clerk: { difficulty: 'medium', subjects: bankExam('sbi_ja_2026', { quantPre: QUANT_CLERK_PRE, quantMains: QUANT_CLERK_PRE, computer: COMPUTER_ALL }) },
};

/** One-line pattern for the AI question prompt (like SSC_SCHEMES). */
export const BANK_SCHEMES = Object.fromEntries(
  Object.entries(BANK_PATTERNS).map(([id, p]) => [
    id,
    p.verified
      ? p.stages
          .filter((s) => s.sections.length)
          .map((s) => `${s.name}: ${s.sections.map((x) => `${x.name}${x.questions ? ` (${x.questions} Q)` : ''}`).join(', ')}`)
          .join('. ')
      : p.note,
  ]),
);

/** Stage → sections → chapters for one exam (paper-wise hierarchy). */
export function examPattern(examId, chaptersOf) {
  const p = BANK_PATTERNS[examId];
  if (!p) return null;
  const subjects = BANK_EXAM_SYLLABUS[examId]?.subjects ?? {};
  const inStage = (subjectId, stage) =>
    Object.entries(subjects[subjectId] ?? {}).filter(([, e]) => e.stages?.includes(stage)).map(([slug]) => slug);
  return {
    examId,
    verified: p.verified,
    note: p.note ?? null,
    changes: p.changes ?? null,
    source: { id: p.source, ...BANK_SOURCES[p.source] },
    stages: p.stages.map((s) => ({
      ...s,
      sections: (s.sections.length || s.id !== 'single' ? s.sections : [{ name: 'Draft coverage', subjectIds: Object.keys(subjects), questions: null, marks: null, minutes: null }])
        .map((x) => ({
          ...x,
          status: p.verified ? 'official' : 'draft',
          subjects: x.subjectIds.map((id) => ({ subjectId: id, chapters: chaptersOf(examId, id, inStage(id, s.id)) })),
        })),
    })),
  };
}
