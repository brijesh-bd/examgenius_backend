/**
 * SSC exam-wise syllabus mapping (official SSC notices, retrieved 2026-11-25).
 * For each exam → subject → chapter:
 *   status        'official' when the notice names the chapter/heading
 *   verifiedTopics topics the notice names → 'official'
 *   topics        restricts the chapter to those topics for this exam
 *   childStatus   everything else below → 'supplementary' practice detail
 * Nothing from one notice is copied into another exam: every list below is
 * that exam's own paragraph. Item names follow the notice wording.
 */

/** Official SSC notices (source of every 'official' status here). */
export const SSC_SOURCES = {
  ssc_cgl_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Combined Graduate Level Examination, 2026 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf',
    ref: 'Para 13.8–13.11 (scheme pp. 24–30; syllabus pp. 30–35)',
  },
  ssc_chsl_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Combined Higher Secondary (10+2) Level Examination, 2026 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2026.pdf',
    ref: 'Para 13.8–13.11 (pp. 16–23)',
  },
  ssc_mts_2025: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination, 2025 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_mts_2025.pdf',
    ref: 'Para 14, 14.6 (pp. 19–21)',
  },
  ssc_gd_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Constable (GD) in CAPFs, SSF and Rifleman (GD) in Assam Rifles Examination, 2026 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/notice_01122025.pdf',
    ref: 'Para 12.1 (pp. 15–16)',
  },
  ssc_cpo_2025: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Sub-Inspector in Delhi Police and CAPFs Examination, 2025 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_capf_2025.pdf',
    ref: 'Para 12, 12.8 (pp. 15–17)',
  },
  ssc_je_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Junior Engineer Examination, 2026 — Notice',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_je_2026.pdf',
    ref: 'Para 13 scheme (pp. 20–23), Para 14 syllabus (pp. 23–28)',
  },
  ssc_steno_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: "Stenographer Grade 'C' & 'D' Examination, 2026 — Notice",
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_steno_2026.pdf',
    ref: 'Para 13–15 (pp. 18–20)',
  },
  ssc_sp_xiv_2026: {
    name: 'Staff Selection Commission',
    type: 'official',
    title: 'Selection Posts Phase-XIV/2026 — Advertisement',
    url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_RHQ_2026_phase_xiv.pdf',
    ref: 'Para 15, 15.9.1–15.9.3 (pp. 18–20)',
  },
};

const S = 'supplementary';
/** Official chapter: every listed topic official, other topics supplementary. */
const off = (src, topics = null, extra = {}) => ({
  status: 'official',
  sources: [src],
  ...(topics ? { topics, verifiedTopics: topics } : {}),
  childStatus: S,
  ...extra,
});
/** Whole chapter printed verbatim (library written from that notice). */
const verbatim = (src) => ({ status: 'official', sources: [src], verifiedAll: true });
const sup = (src, topics = null) => ({ status: S, sources: [src], ...(topics ? { topics } : {}), childStatus: S });
const chapters = (list, src) => Object.fromEntries(list.map((c) => [c, off(src)]));

// ── Reasoning item lists, per notice ────────────────────────────────────────
const CGL_REASONING = [
  'semantic_analogy', 'number_analogy', 'figural_analogy', 'semantic_classification', 'number_classification',
  'figural_classification', 'semantic_series', 'number_series', 'figural_series', 'problem_solving',
  'word_building', 'coding_decoding', 'numerical_operations', 'symbolic_operations', 'trends',
  'space_orientation', 'space_visualization', 'venn_diagrams', 'drawing_inferences', 'punched_hole',
  'pattern_folding', 'indexing', 'address_matching', 'date_city_matching', 'centre_codes',
  'small_capital_coding', 'embedded_figures', 'critical_thinking', 'emotional_intelligence',
  'social_intelligence', 'similarities_differences', 'statement_conclusion', 'syllogistic_reasoning',
  'decision_making', 'relationship_concepts', 'arithmetical_reasoning', 'visual_memory',
  'discrimination_observation', 'non_verbal_series',
];
const CHSL_REASONING = [
  'semantic_analogy', 'symbolic_operations', 'number_analogy', 'trends', 'figural_analogy', 'space_orientation',
  'semantic_classification', 'venn_diagrams', 'number_classification', 'drawing_inferences',
  'figural_classification', 'punched_hole', 'semantic_series', 'pattern_folding', 'number_series',
  'embedded_figures', 'figural_series', 'critical_thinking', 'problem_solving', 'emotional_intelligence',
  'word_building', 'social_intelligence', 'coding_decoding', 'numerical_operations',
];
const MTS_REASONING = [
  'alpha_numeric_series', 'coding_decoding', 'semantic_analogy', 'number_analogy', 'following_directions',
  'similarities_differences', 'jumbling', 'problem_solving', 'non_verbal_diagrams', 'age_calculations',
  'calendar_clock',
];
const GD_REASONING = [
  'semantic_analogy', 'number_analogy', 'similarities_differences', 'space_visualization', 'space_orientation',
  'visual_memory', 'discrimination_observation', 'relationship_concepts', 'arithmetical_reasoning',
  'figural_classification', 'number_series', 'non_verbal_series', 'coding_decoding',
];
const JE_REASONING = [
  'semantic_analogy', 'number_analogy', 'similarities_differences', 'space_visualization', 'problem_solving',
  'decision_making', 'visual_memory', 'discrimination_observation', 'relationship_concepts',
  'arithmetical_reasoning', 'semantic_classification', 'figural_classification', 'number_series',
];
const STENO_REASONING = [...JE_REASONING, 'non_verbal_series'];
const SP_MATRIC_REASONING = [
  'similarities_differences', 'space_visualization', 'problem_solving', 'decision_making', 'visual_memory',
  'relationship_concepts', 'discrimination_observation', 'figural_classification', 'number_series',
  'non_verbal_series', 'arithmetical_reasoning',
];

// ── Quantitative item lists, per notice ─────────────────────────────────────
const Q = {
  number_systems: ['whole_numbers', 'decimals_fractions', 'relationship_numbers'],
  arithmetic: ['percentage', 'ratio_proportion', 'square_roots', 'averages', 'interest_simple', 'interest_compound', 'profit_loss', 'discount', 'partnership', 'mixture_alligation', 'time_distance', 'time_work'],
  algebra: ['identities_surds', 'linear_graphs'],
  geometry: ['triangle_centres', 'congruence_similarity', 'circle_chords_tangents'],
  mensuration: ['plane_figures', 'solids'],
  trigonometry: ['trig_ratios', 'standard_identities', 'complementary_angles', 'heights_distances'],
};
const quantFrom = (src, lists) =>
  Object.fromEntries(Object.entries(lists).map(([chapter, topics]) => [chapter, off(src, topics)]));
// CGL Tier-I (13.10) + Tier-II (13.11): union.
const CGL_QUANT = quantFrom('ssc_cgl_2026', {
  ...Q,
  trigonometry: [...Q.trigonometry, 'degree_radian'],
  statistics: ['statistical_charts', 'central_tendency', 'standard_deviation', 'probability'],
});
// CPO Paper-I and Selection Post graduation level = CGL Tier-I list (no mean/SD/probability).
const tier1Quant = (src) =>
  quantFrom(src, { ...Q, trigonometry: [...Q.trigonometry, 'degree_radian'], statistics: ['statistical_charts'] });
// CHSL Tier-I (statistical charts) + Tier-II (statistics and probability).
const CHSL_QUANT = quantFrom('ssc_chsl_2026', {
  ...Q,
  statistics: ['statistical_charts', 'central_tendency', 'standard_deviation', 'probability'],
});
const MTS_QUANT = quantFrom('ssc_mts_2025', {
  number_systems: ['integers_whole', 'lcm_hcf', 'decimals_fractions', 'relationship_numbers', 'bodmas'],
  arithmetic: ['percentage', 'ratio_proportion', 'time_work', 'direct_inverse', 'averages', 'interest_simple', 'profit_loss', 'discount', 'time_distance', 'square_roots'],
  geometry: ['lines_angles'],
  mensuration: ['area_perimeter_basic'],
  statistics: ['tables_graphs'],
});
// GD: "Mensuration" and "Interest" are named only as headings.
const GD_QUANT = {
  number_systems: off('ssc_gd_2026', ['whole_numbers', 'decimals_fractions', 'relationship_numbers']),
  arithmetic: off('ssc_gd_2026', ['percentage', 'ratio_proportion', 'averages', 'interest_simple', 'interest_compound', 'profit_loss', 'discount', 'time_distance', 'ratio_time', 'time_work']),
  mensuration: { ...off('ssc_gd_2026'), topics: ['plane_figures', 'solids', 'area_perimeter_basic'] },
};
const SP_MATRIC_QUANT = {
  ...GD_QUANT,
  number_systems: off('ssc_sp_xiv_2026', ['whole_numbers', 'decimals_fractions', 'relationship_numbers']),
  arithmetic: off('ssc_sp_xiv_2026', ['percentage', 'ratio_proportion', 'averages', 'interest_simple', 'interest_compound', 'profit_loss', 'discount', 'time_distance', 'ratio_time', 'time_work']),
  mensuration: { ...off('ssc_sp_xiv_2026'), topics: ['plane_figures', 'solids', 'area_perimeter_basic'] },
  statistics: off('ssc_sp_xiv_2026', ['tables_graphs']),
};
const SP_HSC_QUANT = quantFrom('ssc_sp_xiv_2026', {
  ...Q,
  geometry: ['elementary_figures', ...Q.geometry],
  statistics: ['tables_graphs', 'statistical_charts'],
});

// ── English, per notice (library topics in english.js) ──────────────────────
const EN_ALL = {
  vocabulary: ['synonyms', 'antonyms', 'one_word', 'idioms', 'spelling', 'usage'],
  grammar: ['error_detection', 'sentence_improvement', 'fill_blanks', 'voice', 'narration'],
  sentence_structure: ['rearrangement'],
  comprehension: ['reading', 'cloze'],
};
const englishFrom = (src, verified) =>
  Object.fromEntries(
    Object.keys(EN_ALL).map((c) => [
      c,
      verified[c]?.length ? { ...off(src), verifiedTopics: verified[c] } : sup(src),
    ]),
  );
// Basic notices: "vocabulary, grammar, sentence structure, synonyms, antonyms and correct usage".
const EN_BASIC = { vocabulary: ['synonyms', 'antonyms', 'usage'], grammar: [], sentence_structure: [] };
const basicEnglish = (src, extra = {}) => {
  const m = englishFrom(src, { ...EN_BASIC, ...extra });
  // grammar and sentence structure are named as headings.
  m.grammar = { ...off(src), verifiedTopics: extra.grammar ?? [] };
  m.sentence_structure = { ...off(src), verifiedTopics: extra.sentence_structure ?? [] };
  return m;
};

// ── General Awareness, per notice (library chapters in generalAwareness.js) ─
const GA_SSC = (src, { polity = true, sports = false, extra = [] } = {}) => ({
  ...chapters(['history', 'art_culture', 'geography', 'economy', 'science_tech', 'current_affairs', 'general_science', ...extra], src),
  // CGL/CHSL say "General Policy"; CPO/GD/Steno/SP/JE "General Polity (Indian Constitution)".
  polity: polity ? off(src) : sup(src),
  static_gk: sports ? { ...sup(src), verifiedTopics: ['sports'] } : sup(src),
});

const verbatimAll = (lib, src) => Object.fromEntries(lib.map((c) => [c, verbatim(src)]));
const JE_CIVIL_CH = ['engineering_mechanics', 'solid_mechanics', 'structural_analysis', 'materials_management', 'estimating', 'concrete_structures', 'steel_structures', 'surveying', 'soil_mechanics', 'fluid_hydraulics', 'hydrology_irrigation', 'environmental', 'transportation'];
const JE_ELECTRICAL_CH = ['fundamentals', 'magnetic_circuits', 'ac_fundamentals', 'measurement', 'machines', 'special_machines', 'power_systems', 'estimation_costing', 'utilization', 'basic_electronics', 'power_electronics'];
const JE_MECHANICAL_CH = ['engineering_mechanics', 'strength_materials', 'theory_machines', 'machine_design', 'materials', 'thermal', 'fluid_machinery', 'industrial', 'manufacturing', 'metrology', 'advanced_manufacturing'];
const COMPUTER_CH = ['computer_basics', 'software', 'internet_email', 'networking_security'];
const STATISTICS_CH = ['data_presentation', 'central_tendency', 'dispersion', 'moments', 'correlation_regression', 'probability_theory', 'distributions', 'sampling', 'inference', 'anova', 'time_series', 'index_numbers'];

const fe = (src) => ({ accounts: off(src, null, { verifiedAll: true }), economics_governance: off(src, null, { verifiedAll: true }) });

export const SSC_EXAM_SYLLABUS = {
  ssc_cgl: {
    difficulty: 'hard',
    subjects: {
      quant: CGL_QUANT,
      reasoning: chapters(CGL_REASONING, 'ssc_cgl_2026'),
      english: englishFrom('ssc_cgl_2026', EN_ALL),
      general_awareness: GA_SSC('ssc_cgl_2026', { polity: true }),
      computer: verbatimAll(COMPUTER_CH, 'ssc_cgl_2026'),
      statistics: verbatimAll(STATISTICS_CH, 'ssc_cgl_2026'),
      finance_economics: fe('ssc_cgl_2026'),
    },
  },
  ssc_chsl: {
    difficulty: 'medium',
    subjects: {
      quant: CHSL_QUANT,
      reasoning: chapters(CHSL_REASONING, 'ssc_chsl_2026'),
      english: englishFrom('ssc_chsl_2026', EN_ALL),
      general_awareness: GA_SSC('ssc_chsl_2026', { polity: true }),
      computer: verbatimAll(COMPUTER_CH, 'ssc_chsl_2026'),
    },
  },
  ssc_mts: {
    difficulty: 'easy',
    subjects: {
      quant: MTS_QUANT,
      reasoning: chapters(MTS_REASONING, 'ssc_mts_2025'),
      english: basicEnglish('ssc_mts_2025', { comprehension: ['reading'] }),
      // Social Studies (History, Geography, Art & Culture, Civics, Economics),
      // General Science and Environmental Studies up to 10th Standard.
      general_awareness: {
        ...chapters(['history', 'geography', 'art_culture', 'polity', 'economy', 'general_science'], 'ssc_mts_2025'),
        geography: { ...off('ssc_mts_2025'), verifiedTopics: ['environment'] },
      },
    },
  },
  ssc_gd: {
    difficulty: 'easy',
    subjects: {
      quant: GD_QUANT,
      reasoning: chapters(GD_REASONING, 'ssc_gd_2026'),
      // "English/Hindi: ability to understand basic English/Hindi and basic comprehension".
      english: { ...englishFrom('ssc_gd_2026', { comprehension: ['reading'] }) },
      general_awareness: GA_SSC('ssc_gd_2026', { sports: true }),
    },
  },
  ssc_cpo: {
    difficulty: 'hard',
    subjects: {
      quant: tier1Quant('ssc_cpo_2025'),
      reasoning: chapters(CGL_REASONING, 'ssc_cpo_2025'),
      // Paper-I English Comprehension + Paper-II list.
      english: englishFrom('ssc_cpo_2025', {
        vocabulary: ['synonyms', 'antonyms', 'spelling', 'idioms'],
        grammar: ['error_detection', 'fill_blanks'],
        sentence_structure: ['completion'],
        comprehension: ['reading'],
      }),
      general_awareness: GA_SSC('ssc_cpo_2025'),
    },
  },
  ssc_je: {
    difficulty: 'medium',
    subjects: {
      reasoning: chapters(JE_REASONING, 'ssc_je_2026'),
      general_awareness: GA_SSC('ssc_je_2026'),
      je_civil: verbatimAll(JE_CIVIL_CH, 'ssc_je_2026'),
      je_electrical: verbatimAll(JE_ELECTRICAL_CH, 'ssc_je_2026'),
      je_mechanical: verbatimAll(JE_MECHANICAL_CH, 'ssc_je_2026'),
    },
  },
  ssc_steno: {
    difficulty: 'medium',
    subjects: {
      reasoning: chapters(STENO_REASONING, 'ssc_steno_2026'),
      general_awareness: GA_SSC('ssc_steno_2026', { sports: true }),
      english: basicEnglish('ssc_steno_2026'),
    },
  },
  ssc_sp_matric: {
    difficulty: 'easy',
    subjects: {
      reasoning: chapters(SP_MATRIC_REASONING, 'ssc_sp_xiv_2026'),
      general_awareness: GA_SSC('ssc_sp_xiv_2026', { sports: true }),
      quant: SP_MATRIC_QUANT,
      english: basicEnglish('ssc_sp_xiv_2026'),
    },
  },
  ssc_sp_hsc: {
    difficulty: 'medium',
    subjects: {
      reasoning: chapters(CHSL_REASONING, 'ssc_sp_xiv_2026'),
      general_awareness: GA_SSC('ssc_sp_xiv_2026'),
      quant: SP_HSC_QUANT,
      english: englishFrom('ssc_sp_xiv_2026', EN_ALL),
    },
  },
  ssc_sp_grad: {
    difficulty: 'hard',
    subjects: {
      reasoning: chapters(CGL_REASONING, 'ssc_sp_xiv_2026'),
      general_awareness: GA_SSC('ssc_sp_xiv_2026'),
      quant: tier1Quant('ssc_sp_xiv_2026'),
      // "ability to understand correct English, basic comprehension and writing ability".
      english: basicEnglish('ssc_sp_xiv_2026', { comprehension: ['reading'] }),
    },
  },
};

/** Exam scheme (papers / tiers / sections) — shown in the coverage report. */
export const SSC_SCHEMES = {
  ssc_cgl: 'Tier-I: Reasoning, GA, Quant, English (25 Q each). Tier-II Paper-I: Mathematical Abilities, Reasoning, English, GA, Computer Knowledge (qualifying), DEST. Paper-II Statistics (JSO). Paper-III Finance & Economics (AAO).',
  ssc_chsl: 'Tier-I: English, General Intelligence, Quant, GA (25 Q each). Tier-II: Maths, Reasoning, English, GA, Computer Knowledge; Skill/Typing test.',
  ssc_mts: 'Session-I: Numerical & Mathematical Ability, Reasoning (no negative). Session-II: GA, English. Havaldar: PET/PST.',
  ssc_gd: 'One CBE: Reasoning, GK & GA, Elementary Mathematics, English/Hindi (20 Q each). PET/PST.',
  ssc_cpo: 'Paper-I: Reasoning, GK, Quant, English Comprehension (50 Q each). Paper-II: English Language & Comprehension (200 Q).',
  ssc_je: 'Paper-I: Reasoning 50, GA 50, one engineering part 100 (Civil/Electrical/Mechanical). Paper-II: the same engineering part.',
  ssc_steno: 'CBE: Reasoning 50, GA 50, English 100. Skill test (dictation/transcription, qualifying — not practised in the app).',
  ssc_sp_matric: 'Selection Post Matriculation-level CBE: Reasoning, GA, Quant, English (25 Q each).',
  ssc_sp_hsc: 'Selection Post 10+2-level CBE: Reasoning, GA, Quant, English (25 Q each).',
  ssc_sp_grad: 'Selection Post Graduation-level CBE: Reasoning, GA, Quant (10th std), English (25 Q each).',
};
