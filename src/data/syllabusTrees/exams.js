/**
 * Exam-wise mapping of the shared libraries (reviewed coverage, 2026-11-25).
 *
 * Per exam → subject → chapter: `status` and the sources naming it. Status:
 *   'official'   — confirmed in a CEN PDF in sources/cen/  (none yet)
 *   'unverified' — named for this exam by a retrieved coaching page
 *   'draft'      — not named by any retrieved source (our breakdown / coaching extra)
 * Everything BELOW a chapter is 'draft' unless listed in `verifiedTopics`.
 * `topics` (optional) restricts a chapter to some of its topics for this exam.
 * `difficulty` is the exam's automatic practice level (no student selector).
 */
import { SM_MAPPING } from './stationMaster.js';

const U = (sources, extra = {}) => ({ status: 'unverified', sources, ...extra });
const D = (extra = {}) => ({ status: 'draft', sources: [], ...extra });

// Reasoning headings shared by Group D, ALP, JE and both Technician grades.
const REASONING_STANDARD = (src) => ({
  analogy: U(src),
  classification: U(src),
  number_series: U(src),
  alphabet_series: U(src),
  coding_decoding: U(src),
  math_operations: U(src),
  blood_relations: U(src),
  direction_distance: U(src),
  order_ranking: D(),
  syllogism: U(src),
  venn: U(src),
  statements: U(src),
  analytical: U(src),
  data_sufficiency: U(src),
  data_interpretation: U(src),
  decision_making: U(src),
  jumbling: U(src),
  similarities: U(src),
  calendar_clock: D(),
});

const SCIENCE_10TH = (src) => ({ physics: U(src), chemistry: U(src), biology: U(src) });

export const EXAM_SYLLABUS = {
  rrb_ntpc: {
    difficulty: 'medium',
    subjects: {
      quant: 'railway_math',
      reasoning: {
        analogy: U(['adda247_ntpc', 'testbook_ntpc']),
        classification: D({ note: 'Testbook only' }),
        number_series: U(['adda247_ntpc', 'testbook_ntpc']),
        alphabet_series: U(['adda247_ntpc', 'testbook_ntpc']),
        coding_decoding: U(['adda247_ntpc', 'testbook_ntpc']),
        math_operations: U(['adda247_ntpc', 'testbook_ntpc']),
        blood_relations: U(['adda247_ntpc'], { note: '"Relationships"' }),
        direction_distance: D({ note: 'Testbook only' }),
        order_ranking: D({ note: 'Testbook only' }),
        syllogism: U(['adda247_ntpc', 'testbook_ntpc']),
        venn: U(['adda247_ntpc', 'testbook_ntpc']),
        statements: U(['adda247_ntpc', 'testbook_ntpc'], { topics: ['conclusion', 'course_action', 'inference'] }),
        analytical: U(['adda247_ntpc', 'testbook_ntpc'], { note: 'Puzzle + Analytical Reasoning' }),
        data_sufficiency: U(['adda247_ntpc', 'testbook_ntpc']),
        decision_making: U(['adda247_ntpc', 'testbook_ntpc']),
        jumbling: U(['adda247_ntpc', 'testbook_ntpc']),
        similarities: U(['adda247_ntpc']),
        maps_graphs: U(['adda247_ntpc', 'testbook_ntpc']),
        calendar_clock: D({ note: 'Testbook only' }),
        non_verbal: D({ note: 'Testbook only' }),
      },
      general_awareness: {
        history: U(['adda247_ntpc', 'testbook_ntpc']),
        geography: U(['adda247_ntpc', 'testbook_ntpc']),
        polity: U(['adda247_ntpc', 'testbook_ntpc']),
        economy: U(['adda247_ntpc', 'testbook_ntpc']),
        art_culture: U(['adda247_ntpc', 'testbook_ntpc']),
        static_gk: U(['adda247_ntpc', 'testbook_ntpc']),
        science_tech: U(['adda247_ntpc', 'testbook_ntpc']),
        general_science: U(['adda247_ntpc', 'testbook_ntpc'], { note: 'General Science is part of GA for NTPC' }),
        current_affairs: U(['adda247_ntpc', 'testbook_ntpc']),
      },
    },
  },
  rrb_group_d: {
    difficulty: 'easy',
    subjects: {
      quant: 'railway_math',
      reasoning: { ...REASONING_STANDARD(['adda247_group_d', 'oliveboard_group_d']), non_verbal: D({ note: 'Oliveboard only' }) },
      general_science: SCIENCE_10TH(['adda247_group_d', 'oliveboard_group_d']),
      general_awareness: {
        current_affairs: U(['adda247_group_d', 'oliveboard_group_d']),
        science_tech: U(['adda247_group_d', 'oliveboard_group_d']),
        art_culture: U(['adda247_group_d', 'oliveboard_group_d']),
        static_gk: U(['adda247_group_d', 'oliveboard_group_d']),
        economy: U(['adda247_group_d', 'oliveboard_group_d']),
        history: D({ note: 'Oliveboard only' }),
        geography: D({ note: 'Oliveboard only' }),
        polity: D({ note: 'Oliveboard only' }),
      },
    },
  },
  rrb_alp: {
    difficulty: 'medium',
    subjects: {
      quant: 'railway_math',
      reasoning: REASONING_STANDARD(['adda247_alp', 'pw_alp_cbt2']),
      general_science: SCIENCE_10TH(['adda247_alp']),
    },
  },
  rrb_je: {
    difficulty: 'medium',
    subjects: {
      quant: 'railway_math',
      reasoning: REASONING_STANDARD(['adda247_je']),
      general_awareness: {
        current_affairs: U(['adda247_je']),
        geography: U(['adda247_je']),
        history: U(['adda247_je']),
        art_culture: U(['adda247_je']),
        polity: U(['adda247_je']),
        economy: U(['adda247_je']),
        static_gk: U(['adda247_je'], { note: 'sports' }),
        science_tech: U(['adda247_je']),
      },
      general_science: SCIENCE_10TH(['adda247_je']),
    },
  },
  rrb_tech_gr1_signal: {
    difficulty: 'medium',
    subjects: {
      quant: 'railway_math',
      reasoning: REASONING_STANDARD(['testbook_technician']),
      general_awareness: {
        current_affairs: U(['testbook_technician']),
        geography: U(['testbook_technician']),
        history: U(['testbook_technician']),
        art_culture: U(['testbook_technician']),
        polity: U(['testbook_technician']),
        economy: U(['testbook_technician']),
        static_gk: U(['testbook_technician'], { note: 'sports' }),
        science_tech: U(['testbook_technician']),
      },
    },
  },
  // CEN 08/2026 (sources/cen/examsDocuments.pdf): the CEN's own CBT sections.
  rrb_station_master: {
    difficulty: 'medium',
    subjects: { ...SM_MAPPING },
  },
  rrb_tech_gr3: {
    difficulty: 'easy',
    subjects: {
      quant: 'railway_math',
      reasoning: REASONING_STANDARD(['testbook_technician']),
      general_awareness: {
        current_affairs: U(['testbook_technician']),
        science_tech: U(['testbook_technician']),
        art_culture: U(['testbook_technician']),
        static_gk: U(['testbook_technician'], { note: 'sports, personalities' }),
        economy: U(['testbook_technician']),
        polity: D({ note: '"political developments"' }),
      },
      general_science: {
        physics: U(['testbook_technician'], {
          topics: ['units', 'motion', 'work_energy', 'heat', 'electricity', 'machines', 'safety'],
          note: 'Basic physics/engineering only; no Chemistry or Biology',
        }),
      },
    },
  },
};

export const SUBJECT_NAMES = {
  quant: { en: 'Mathematics', hi: 'गणित' },
  reasoning: { en: 'General Intelligence & Reasoning', hi: 'सामान्य बुद्धिमत्ता और तर्क' },
  general_awareness: { en: 'General Awareness', hi: 'सामान्य जागरूकता' },
  general_science: { en: 'General Science', hi: 'सामान्य विज्ञान' },
};

/** Retrieved coaching pages (2026-11-25). Official CEN PDFs: none yet. */
export const TREE_SOURCES = {
  cen_08_2026: {
    name: 'RRB',
    type: 'official',
    title: 'Centralised Employment Notice (CEN) No. 08/2026 — Station Master',
    file: 'sources/cen/examsDocuments.pdf',
    ref: 'para 15.1 Computer Based Test (CBT), Syllabus For CBT (page 21)',
    checkedOn: '2026-11-25',
  },
  adda247_ntpc: { name: 'Adda247', type: 'coaching', url: 'https://www.adda247.com/jobs/rrb-ntpc-syllabus', title: 'RRB NTPC Syllabus 2026 (Graduate and Undergraduate)' },
  testbook_ntpc: { name: 'Testbook', type: 'coaching', url: 'https://testbook.com/rrb-ntpc/syllabus', title: 'RRB NTPC Syllabus 2026 for CBT 1 & 2', cen: 'CEN 06/2026, 07/2026 (as cited by the page)' },
  adda247_group_d: { name: 'Adda247', type: 'coaching', url: 'https://www.adda247.com/jobs/rrb-group-d-syllabus', title: 'RRB Group D Syllabus 2026' },
  oliveboard_group_d: { name: 'Oliveboard', type: 'coaching', url: 'https://www.oliveboard.in/blog/rrb-group-d-syllabus-2025/', title: 'RRB Group D Syllabus 2026-27', cen: 'CEN 09/2025 (as cited)' },
  adda247_alp: { name: 'Adda247', type: 'coaching', url: 'https://www.adda247.com/jobs/rrb-alp-syllabus', title: 'RRB ALP Syllabus 2026' },
  pw_alp_cbt2: { name: 'PW', type: 'coaching', url: 'https://www.pw.live/railway/exams/rrb-alp-cbt-2-syllabus', title: 'RRB ALP CBT 2 Syllabus', cen: 'CEN 01/2026 (as cited)' },
  adda247_je: { name: 'Adda247', type: 'coaching', url: 'https://www.adda247.com/rrb-je/syllabus', title: 'RRB JE Syllabus 2026', cen: 'CEN 04/2026 (as cited)' },
  testbook_technician: { name: 'Testbook', type: 'coaching', url: 'https://testbook.com/rrb-technician/syllabus-exam-pattern', title: 'RRB Technician Syllabus and Exam Pattern 2026' },
};
