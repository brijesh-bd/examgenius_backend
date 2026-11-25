/**
 * Source register for the Railway Mathematics hierarchy.
 *
 * Every entry is a page that was ACTUALLY retrieved on RETRIEVED_ON. Topic
 * lists are recorded as the page showed them. No official RRB notification
 * text could be retrieved (see FAILED_SOURCES), so nothing in this hierarchy
 * is official yet. When a CEN PDF is checked, add it here with
 * type 'official' and list the chapter slugs it names: index.js upgrades
 * those chapters automatically.
 */
export const RETRIEVED_ON = '2026-11-25';

const CORE = [
  'number_system', 'decimals_fractions', 'lcm_hcf', 'ratio_proportion', 'percentage', 'mensuration_2d',
  'mensuration_3d', 'time_work', 'time_speed_distance', 'interest', 'profit_loss', 'algebra', 'geometry',
  'trigonometry', 'statistics',
];
const GDAJ = ['bodmas_simplification', 'square_cube_root', 'ages', 'calendar_clock', 'pipes_cisterns'];

export const SOURCES = [
  {
    id: 'oliveboard_ntpc_maths',
    name: 'Oliveboard',
    type: 'supplementary',
    title: 'RRB NTPC Maths Syllabus, Check Topics for CBT 1 and 2',
    url: 'https://www.oliveboard.in/rrb-ntpc-maths-syllabus/',
    exams: ['rrb_ntpc'],
    chapters: CORE,
    note: 'Graduate and Undergraduate share one list; other subtopics described as preparation extensions.',
  },
  {
    id: 'testbook_ntpc',
    name: 'Testbook',
    type: 'supplementary',
    title: 'RRB NTPC Syllabus 2026 for CBT 1 & 2, Download Syllabus PDF',
    url: 'https://testbook.com/rrb-ntpc/syllabus-exam-pattern',
    exams: ['rrb_ntpc'],
    chapters: [...CORE, 'average', 'trains', 'boats_streams', 'partnership'],
    note: 'Sub-rows mention Average, Relative Speeds, "Boats, Trains, etc.", Partnerships, Dishonest/Successive Dealings.',
  },
  {
    id: 'adda247_ntpc_topics',
    name: 'Adda247',
    type: 'supplementary',
    title: 'RRB NTPC 2026 Exam Important Topics, Check CBT 1 Subject-wise Topic List',
    url: 'https://www.adda247.com/exams/railway/rrb-ntpc-2026-important-topics',
    exams: ['rrb_ntpc'],
    chapters: [...CORE, 'bodmas_simplification', 'data_interpretation'],
    note: 'Important-topics page (not a syllabus page); content obtained as a paraphrase only.',
  },
  {
    id: 'oliveboard_group_d_maths',
    name: 'Oliveboard',
    type: 'supplementary',
    title: 'RRB Group D Maths Syllabus 2026-27, Download PDF',
    url: 'https://www.oliveboard.in/rrb-group-d-maths-syllabus/',
    exams: ['rrb_group_d'],
    chapters: [...CORE, ...GDAJ, 'average', 'data_interpretation'],
    note: 'Cites CEN 09/2025; overview table also adds Simplification, Average, Data Interpretation.',
  },
  {
    id: 'testbook_group_d',
    name: 'Testbook',
    type: 'supplementary',
    title: 'RRB Group D Syllabus 2026, Subject Wise Syllabus PDF Download',
    url: 'https://testbook.com/rrb-group-d/syllabus',
    exams: ['rrb_group_d'],
    chapters: [...CORE, ...GDAJ],
  },
  {
    id: 'adda247_group_d',
    name: 'Adda247',
    type: 'supplementary',
    title: 'RRB Group D Syllabus 2026, Check Subject Wise Syllabus Official PDF',
    url: 'https://www.adda247.com/jobs/rrb-rrc-group-d-syllabus',
    exams: ['rrb_group_d'],
    chapters: [...CORE, ...GDAJ],
  },
  {
    id: 'testbook_alp',
    name: 'Testbook',
    type: 'supplementary',
    title: 'RRB ALP Syllabus and Exam Pattern 2026, PDF Download (CBT 1, CBT 2, CBAT)',
    url: 'https://testbook.com/rrb-alp/syllabus-exam-pattern',
    exams: ['rrb_alp'],
    chapters: [...CORE, ...GDAJ],
  },
  {
    id: 'adda247_alp',
    name: 'Adda247',
    type: 'supplementary',
    title: 'RRB ALP Syllabus 2026, Exam Pattern (CBT 1, CBT 2, CBAT), Download PDF',
    url: 'https://www.adda247.com/jobs/rrb-alp-syllabus',
    exams: ['rrb_alp'],
    chapters: [...CORE, ...GDAJ],
  },
  {
    id: 'testbook_je',
    name: 'Testbook',
    type: 'supplementary',
    title: 'RRB JE Syllabus 2026 for CBT 1, 2 and Technical Abilities, PDF Download',
    url: 'https://testbook.com/rrb-je/syllabus',
    exams: ['rrb_je'],
    chapters: [...CORE, ...GDAJ.filter((c) => c !== 'square_cube_root')],
    note: 'Square Root not shown on this page (conflict with Adda247 and Oliveboard JE pages).',
  },
  {
    id: 'adda247_je',
    name: 'Adda247',
    type: 'supplementary',
    title: 'RRB JE Syllabus 2026, CBT 1 & CBT 2 Exam Pattern, Subject-Wise Topics & PDF',
    url: 'https://www.adda247.com/rrb-je/syllabus',
    exams: ['rrb_je'],
    chapters: [...CORE, ...GDAJ],
  },
  {
    id: 'oliveboard_je_maths',
    name: 'Oliveboard',
    type: 'supplementary',
    title: 'RRB JE Maths Syllabus 2026, Check Topic Wise Syllabus',
    url: 'https://www.oliveboard.in/blog/rrb-je-maths-syllabus/',
    exams: ['rrb_je'],
    chapters: [...CORE, ...GDAJ],
  },
].map((s) => ({ ...s, retrievedOn: RETRIEVED_ON }));

/** Sources that could not be used — kept visible, never silently dropped. */
export const FAILED_SOURCES = [
  { url: 'https://www.rrb.iitk.ac.in/sathee-railway-exams/rrb-exams/rrb-ntpc/rrb-details/syllabus-of-exam', reason: 'TLS certificate expired' },
  { url: 'https://sathee.iitk.ac.in/sathee-railway-exams/rrb-exams/rrb-group-d/rrb-details/syllabus-of-exam', reason: 'Page rendered no content' },
  { url: 'https://www.rrbcdg.gov.in/', reason: 'TLS certificate hostname mismatch' },
  { url: 'https://www.rrbchennai.gov.in/', reason: 'TLS hostname mismatch; rrb.indianrailways.gov.in/chennai lists CEN endpoints that were not opened' },
  { url: '(official CEN notification PDFs)', reason: 'Not found/opened — no official text available for verification' },
].map((s) => ({ ...s, triedOn: RETRIEVED_ON }));
