// Mirrors the Flutter app's syllabus (lib/features/question_generator/data).

/**
 * Bump when topics or units change (ids must stay stable: practice, the
 * question bank, progress and notes all refer to them). Part of the shared
 * notes cache identity.
 */
export const SYLLABUS_VERSION = 1;
const _subject = (id, name, topics) => ({
  id,
  name,
  topics: Object.entries(topics).map(([slug, topicName]) => ({ id: `${id}.${slug}`, name: topicName })),
});

const _arithmetic = {
  'percentage': 'Percentage',
  'ratio_proportion': 'Ratio & Proportion',
  'average': 'Average',
  'profit_loss': 'Profit & Loss',
  'simple_compound_interest': 'Simple & Compound Interest',
  'time_work': 'Time & Work',
  'time_speed_distance': 'Time, Speed & Distance',
};

const _basicNumbers = {
  'number_system': 'Number System',
  'lcm_hcf': 'LCM & HCF',
  'decimals_fractions': 'Decimals & Fractions',
  'simplification': 'Simplification',
};

const _quantSsc = _subject('quant', 'Quantitative Aptitude', {
  'number_system': 'Number System',
  'simplification': 'Simplification',
  ..._arithmetic,
  'mixtures_alligation': 'Mixture & Alligation',
  'mensuration': 'Mensuration (2D & 3D)',
  'algebra': 'Algebra',
  'geometry': 'Geometry',
  'trigonometry': 'Trigonometry',
  'data_interpretation': 'Data Interpretation',
});

const _quantRailway = _subject('quant', 'Mathematics', {
  ..._basicNumbers,
  ..._arithmetic,
  'pipes_cisterns': 'Pipes & Cisterns',
  'age_problems': 'Problems on Ages',
  'mensuration': 'Mensuration',
  'algebra': 'Elementary Algebra',
  'geometry': 'Geometry',
  'trigonometry': 'Trigonometry',
  'statistics': 'Elementary Statistics',
  'data_interpretation': 'Data Interpretation',
});

const _quantBasic = _subject('quant', 'Numerical Aptitude', {
  ..._basicNumbers,
  ..._arithmetic,
  'mensuration': 'Mensuration',
});

const _quantBanking = _subject('quant', 'Quantitative Aptitude', {
  'simplification': 'Simplification & Approximation',
  'number_series': 'Number Series',
  'quadratic_equations': 'Quadratic Equations',
  'data_interpretation': 'Data Interpretation',
  ..._arithmetic,
  'mixtures_alligation': 'Mixture & Alligation',
  'mensuration': 'Mensuration',
  'probability': 'Probability',
  'permutation_combination': 'Permutation & Combination',
  'data_sufficiency': 'Data Sufficiency',
});

const _reasoningGeneral = _subject('reasoning', 'General Intelligence & Reasoning', {
  'analogy': 'Analogy',
  'classification': 'Classification (Odd One Out)',
  'number_letter_series': 'Number & Letter Series',
  'coding_decoding': 'Coding-Decoding',
  'blood_relations': 'Blood Relations',
  'direction_sense': 'Direction Sense',
  'order_ranking': 'Order & Ranking',
  'syllogism': 'Syllogism',
  'venn_diagrams': 'Venn Diagrams',
  'statement_conclusion': 'Statement & Conclusion',
  'calendar_clock': 'Calendar & Clock',
  'mathematical_operations': 'Mathematical Operations',
  'seating_arrangement': 'Seating Arrangement',
  'non_verbal': 'Non-Verbal (Mirror, Water Image, Paper Folding)',
});

const _reasoningBanking = _subject('reasoning', 'Reasoning Ability', {
  'puzzles': 'Puzzles',
  'seating_arrangement': 'Seating Arrangement',
  'syllogism': 'Syllogism',
  'inequality': 'Inequality',
  'coding_decoding': 'Coding-Decoding',
  'blood_relations': 'Blood Relations',
  'direction_sense': 'Direction Sense',
  'order_ranking': 'Order & Ranking',
  'alphanumeric_series': 'Alphanumeric Series',
  'input_output': 'Input-Output',
  'statement_conclusion': 'Statement, Assumption & Conclusion',
  'data_sufficiency': 'Data Sufficiency',
});

const _generalAwareness = _subject('general_awareness', 'General Awareness', {
  'history': 'History',
  'polity': 'Indian Polity & Constitution',
  'geography': 'Geography',
  'economy': 'Indian Economy',
  'art_culture': 'Art & Culture',
  'static_gk': 'Static GK',
  'current_affairs': 'Current Affairs',
  'sports': 'Sports',
  'awards_honours': 'Awards & Honours',
  'books_authors': 'Books & Authors',
  'government_schemes': 'Government Schemes',
  'science_technology': 'Science & Technology',
});

const _generalScience = _subject('general_science', 'General Science', {
  'physics': 'Physics',
  'chemistry': 'Chemistry',
  'biology': 'Biology (Life Sciences)',
});

const _english = _subject('english', 'English Language', {
  'reading_comprehension': 'Reading Comprehension',
  'cloze_test': 'Cloze Test',
  'error_spotting': 'Error Spotting',
  'fill_blanks': 'Fill in the Blanks',
  'sentence_improvement': 'Sentence Improvement',
  'synonyms': 'Synonyms',
  'antonyms': 'Antonyms',
  'idioms_phrases': 'Idioms & Phrases',
  'one_word_substitution': 'One Word Substitution',
  'active_passive': 'Active & Passive Voice',
  'direct_indirect': 'Direct & Indirect Speech',
  'spelling': 'Spelling Correction',
  'para_jumbles': 'Para Jumbles',
});

const _computer = _subject('computer', 'Computer Knowledge', {
  'fundamentals': 'Computer Fundamentals',
  'memory': 'Memory & Storage',
  'ms_office': 'MS Office',
  'internet_networking': 'Internet & Networking',
  'operating_system': 'Operating System',
  'security': 'Cyber Security',
});

const _bankingAwareness = _subject('banking_awareness', 'General / Banking Awareness', {
  'banking_terms': 'Banking Terms & Services',
  'rbi_monetary_policy': 'RBI & Monetary Policy',
  'acts_regulations': 'Banking Acts & Regulations',
  'financial_awareness': 'Financial Awareness',
  'government_schemes': 'Government Schemes',
  'current_affairs': 'Current Affairs',
  'static_gk': 'Static GK',
});

const _professionalIt = _subject('professional_it', 'Professional Knowledge (IT)', {
  'dbms': 'DBMS',
  'data_structures': 'Data Structures',
  'networking': 'Computer Networks',
  'operating_system': 'Operating System',
  'software_engineering': 'Software Engineering',
  'web_technology': 'Web Technology',
  'security': 'Information Security',
});

const _technicalAlp = _subject('technical', 'Basic Science & Engineering', {
  'units_measurements': 'Units & Measurements',
  'basic_electricity': 'Basic Electricity',
  'work_power_energy': 'Work, Power & Energy',
  'levers_pulleys': 'Levers & Simple Machines',
  'engineering_drawing': 'Engineering Drawing',
  'heat_temperature': 'Heat & Temperature',
});

const _technicalJe = _subject('technical', 'Technical Abilities', {
  'basic_electricity': 'Basic Electrical Engineering',
  'units_measurements': 'Units & Measurements',
  'engineering_mechanics': 'Engineering Mechanics',
  'materials': 'Engineering Materials',
  'engineering_drawing': 'Engineering Drawing',
  'environment': 'Environment & Pollution Control',
});

const _sscStandard = [_quantSsc, _reasoningGeneral, _english, _generalAwareness];
const _sscBasic = [_reasoningGeneral, _generalAwareness, _quantBasic, _english];
const _bankStandard = [_reasoningBanking, _quantBanking, _english, _bankingAwareness, _computer];

export const examSubjects = {
  // Railway subject lists follow the exam-wise coverage (syllabus-drafts/coverage.md):
  // NTPC has General Science inside GA; ALP CBT-1 has no GA (2026 pattern).
  'rrb_ntpc': [_quantRailway, _reasoningGeneral, _generalAwareness],
  'rrb_group_d': [_quantRailway, _reasoningGeneral, _generalScience, _generalAwareness],
  'rrb_alp': [_quantRailway, _reasoningGeneral, _generalScience, _technicalAlp],
  'rrb_je': [_quantRailway, _reasoningGeneral, _generalAwareness, _generalScience, _technicalJe],
  'rrb_tech_gr1_signal': [_quantRailway, _reasoningGeneral, _generalAwareness],
  'rrb_tech_gr3': [_quantRailway, _reasoningGeneral, _generalAwareness, _generalScience],
  'ssc_cgl': [..._sscStandard, _computer],
  'ssc_chsl': [..._sscStandard, _computer],
  'ssc_mts': _sscBasic,
  'ssc_gd': _sscBasic,
  'ssc_cpo': _sscStandard,
  'ibps_po': _bankStandard,
  'ibps_clerk': _bankStandard,
  'ibps_rrb_po': _bankStandard,
  'ibps_rrb_clerk': _bankStandard,
  'sbi_po': _bankStandard,
  'sbi_clerk': _bankStandard,
  'ibps_so_it': [_reasoningBanking, _english, _quantBanking, _professionalIt],
};

// ── Learning units ──────────────────────────────────────────────────────────
// Broad topics are split into smaller, ordered units for the AI Study Notes
// learning path. Keyed by the existing topic id (no topic is duplicated); a
// unit id is `<topicId>.<unitSlug>`. Topics not listed here are one unit.
// Practice question generation keeps using the topic level only.
export const topicUnits = {
  'professional_it.data_structures': {
    basics_complexity: 'Basics & Time Complexity',
    arrays_strings: 'Arrays & Strings',
    linked_lists: 'Linked Lists',
    stacks_queues: 'Stacks & Queues',
    trees_bst: 'Trees & Binary Search Trees',
    heaps: 'Heaps & Priority Queues',
    graphs: 'Graphs & Traversals',
    hashing: 'Hashing',
    sorting_searching: 'Sorting & Searching',
  },
  'professional_it.dbms': {
    basics_architecture: 'DBMS Basics & Architecture',
    er_model: 'ER Model',
    relational_model: 'Relational Model & Keys',
    sql: 'SQL',
    normalization: 'Normalization',
    transactions: 'Transactions & Concurrency',
    indexing: 'Indexing & File Organization',
  },
  'professional_it.networking': {
    osi_tcpip: 'OSI & TCP/IP Models',
    physical_datalink: 'Physical & Data Link Layer',
    network_layer: 'Network Layer & IP Addressing',
    transport_layer: 'Transport Layer (TCP & UDP)',
    application_layer: 'Application Layer Protocols',
    devices_topologies: 'Network Devices & Topologies',
  },
  'professional_it.operating_system': {
    basics_types: 'OS Basics & Types',
    processes_threads: 'Processes & Threads',
    cpu_scheduling: 'CPU Scheduling',
    synchronization_deadlock: 'Synchronization & Deadlocks',
    memory_management: 'Memory Management & Paging',
    file_systems: 'File Systems & Disk Scheduling',
  },
  'professional_it.software_engineering': {
    sdlc_models: 'SDLC Models',
    requirements: 'Requirements Engineering',
    design: 'Software Design',
    testing: 'Software Testing',
    maintenance_metrics: 'Maintenance & Metrics',
  },
  'professional_it.web_technology': {
    html_css: 'HTML & CSS',
    javascript: 'JavaScript Basics',
    http_web: 'HTTP & How the Web Works',
    server_side: 'Server-side & Databases',
    xml_json: 'XML & JSON',
  },
  'professional_it.security': {
    basics_threats: 'Security Basics & Threats',
    cryptography: 'Cryptography',
    network_security: 'Network Security & Firewalls',
    authentication: 'Authentication & Access Control',
    malware_attacks: 'Malware & Common Attacks',
  },
  'computer.fundamentals': {
    history_generations: 'History & Generations',
    hardware: 'Hardware & Input/Output Devices',
    software: 'Software Types',
    number_systems: 'Number Systems',
    abbreviations: 'Important Abbreviations',
  },
  'quant.mensuration': {
    plane_figures: '2D: Triangles, Quadrilaterals & Polygons',
    circles: '2D: Circles',
    cuboid_cube: '3D: Cube & Cuboid',
    cylinder_cone_sphere: '3D: Cylinder, Cone & Sphere',
  },
  'quant.algebra': {
    identities: 'Algebraic Identities',
    linear_equations: 'Linear Equations',
    polynomials: 'Polynomials & Factorisation',
    surds_indices: 'Surds & Indices',
  },
  'quant.geometry': {
    lines_angles: 'Lines & Angles',
    triangles: 'Triangles & Congruence',
    similarity: 'Similarity of Triangles',
    circles: 'Circles: Chords & Tangents',
    quadrilaterals: 'Quadrilaterals & Polygons',
    coordinate: 'Coordinate Geometry',
  },
  'quant.trigonometry': {
    ratios: 'Trigonometric Ratios & Standard Angles',
    identities: 'Trigonometric Identities',
    heights_distances: 'Heights & Distances',
  },
  'quant.data_interpretation': {
    tables: 'Tabular DI',
    bar_graphs: 'Bar Graphs',
    line_graphs: 'Line Graphs',
    pie_charts: 'Pie Charts',
    mixed: 'Mixed & Caselet DI',
  },
  'general_awareness.history': {
    ancient: 'Ancient India',
    medieval: 'Medieval India',
    modern: 'Modern India & British Rule',
    freedom_struggle: 'Indian Freedom Struggle',
  },
  'general_awareness.polity': {
    making_constitution: 'Making of the Constitution & Preamble',
    rights_duties: 'Fundamental Rights, Duties & DPSP',
    union_executive: 'President, PM & Union Executive',
    parliament: 'Parliament',
    judiciary: 'Judiciary',
    state_local: 'State Government & Local Bodies',
    constitutional_bodies: 'Constitutional Bodies & Amendments',
  },
  'general_awareness.geography': {
    physical_india: 'Physical Geography of India',
    rivers_climate: 'Rivers, Climate & Soils of India',
    resources_agriculture: 'Resources & Agriculture',
    world_geography: 'World Geography',
    solar_system: 'Solar System & Earth',
  },
  'general_awareness.economy': {
    basics: 'Basic Concepts (GDP, Inflation)',
    planning: 'Planning & Economic Reforms',
    budget_taxation: 'Budget & Taxation',
    money_banking: 'Money & Banking',
    sectors: 'Agriculture, Industry & Services',
  },
  'general_science.physics': {
    motion_laws: 'Motion & Laws of Motion',
    work_energy_gravitation: 'Work, Energy & Gravitation',
    heat_thermodynamics: 'Heat & Thermodynamics',
    light_optics: 'Light & Optics',
    sound_waves: 'Sound & Waves',
    electricity_magnetism: 'Electricity & Magnetism',
  },
  'general_science.chemistry': {
    matter_atom: 'Matter & Atomic Structure',
    periodic_table: 'Periodic Table & Bonding',
    acids_bases_salts: 'Acids, Bases & Salts',
    metals_nonmetals: 'Metals & Non-metals',
    carbon_compounds: 'Carbon & Its Compounds',
    everyday_chemistry: 'Chemistry in Everyday Life',
  },
  'general_science.biology': {
    cell: 'Cell & Cell Division',
    human_systems: 'Human Body Systems',
    nutrition_diseases: 'Nutrition & Diseases',
    genetics_evolution: 'Genetics & Evolution',
    plants: 'Plant Kingdom & Life Processes',
    ecology: 'Ecology & Environment',
  },
};
