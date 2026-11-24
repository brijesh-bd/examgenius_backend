// Coverage manifests — Ancient Indian History › Mauryan Empire (outline v2,
// nested: subtopics "founding" and "ashoka" contain learning sections).
//
// STATUS: DRAFT, written for review. Concepts follow standard school/
// competitive-exam coverage of the topic (NCERT-level history as commonly
// tested in Railway/SSC GK). Check against the official syllabus and a
// standard text before approving. No trusted source is attached yet, so
// generated facts are reported as "unverified".

const c = (id, name, aliases = [], level = 'core') => ({ id, name, aliases, level });
const U = 'general_awareness.history.ancient#mauryan';
const base = { version: 1, status: 'draft', sources: [], comparisons: [], facts: [], examples: [] };

export default {
  [`${U}.background`]: {
    ...base,
    objectives: ['Explain how Magadha became the leading power and how the Nanda dynasty ended'],
    concepts: [
      c('magadha', 'Magadha'),
      c('nandas', 'Nanda dynasty', ['Nandas', 'Dhana Nanda']),
      c('pataliputra', 'Pataliputra'),
      c('alexander', 'Alexander', ['Greek invasion'], 'detail'),
    ],
    blocks: ['explanation', 'timeline', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.sources`]: {
    ...base,
    objectives: ['Identify literary, foreign and archaeological sources for Mauryan history'],
    concepts: [
      c('arthashastra', 'Arthashastra'),
      c('indica', 'Indica', ['Megasthenes']),
      c('edicts', 'edicts', ['inscriptions']),
      c('mudrarakshasa', 'Mudrarakshasa', ['Vishakhadatta']),
      c('buddhist_texts', 'Dipavamsa', ['Mahavamsa', 'Divyavadana'], 'detail'),
      c('puranas', 'Puranas', [], 'detail'),
      c('junagadh', 'Junagadh', ['Rudradaman', 'Sudarshana lake'], 'detail'),
    ],
    blocks: ['explanation', 'table', 'keyFacts', 'revision', 'mcqs'],
    comparisons: ['Source — author — type — what it tells us'],
    mcqs: { min: 6 },
  },
  [`${U}.founding.chandragupta`]: {
    ...base,
    objectives: [
      'Explain how Chandragupta Maurya founded the Mauryan Empire',
      'Recall the war and treaty with Seleucus and the arrival of Megasthenes',
    ],
    concepts: [
      c('founding', 'Chandragupta Maurya', ['Chandragupta']),
      c('nanda_overthrow', 'Nanda dynasty', ['Dhana Nanda', 'Nandas']),
      c('seleucus', 'Seleucus Nicator', ['Seleucus']),
      c('megasthenes', 'Megasthenes'),
      c('extent', 'empire', ['extent of the empire']),
      c('jainism_end', 'Jainism', ['Bhadrabahu', 'Shravanabelagola'], 'detail'),
    ],
    blocks: ['explanation', 'timeline', 'keyFacts', 'revision', 'mcqs'],
    facts: ['Pataliputra'],
    mcqs: { min: 6 },
  },
  [`${U}.founding.chanakya`]: {
    ...base,
    objectives: ['Describe Chanakya’s role and the main ideas of the Arthashastra'],
    concepts: [
      c('chanakya', 'Chanakya', ['Kautilya', 'Vishnugupta']),
      c('arthashastra', 'Arthashastra'),
      c('saptanga', 'Saptanga', ['seven limbs of the state'], 'detail'),
      c('statecraft', 'statecraft', ['administration', 'espionage', 'spies']),
      c('mandala', 'Mandala', ['circle of states'], 'detail'),
    ],
    blocks: ['explanation', 'table', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.bindusara`]: {
    ...base,
    objectives: ['Recall Bindusara’s reign, titles and foreign contacts'],
    concepts: [
      c('bindusara', 'Bindusara'),
      c('amitraghata', 'Amitraghata', ['Amitrochates']),
      c('deimachus', 'Deimachus', [], 'detail'),
      c('ajivika', 'Ajivika', ['Ajivikas'], 'detail'),
      c('taxila_revolt', 'Taxila', [], 'detail'),
    ],
    blocks: ['explanation', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.ashoka.kalinga`]: {
    ...base,
    objectives: ['Describe the Kalinga War and how it changed Ashoka’s policy'],
    concepts: [
      c('ashoka', 'Ashoka'),
      c('kalinga_war', 'Kalinga War', ['Kalinga']),
      c('casualties', 'Rock Edict XIII', ['Rock Edict 13', 'thirteenth rock edict']),
      c('dhammavijaya', 'Dhammavijaya', ['conquest by Dhamma'], 'detail'),
      c('war_date', '261 BCE', ['261 BC', 'c. 261', '262 BCE'], 'detail'),
    ],
    blocks: ['explanation', 'timeline', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.ashoka.dhamma`]: {
    ...base,
    objectives: ['Explain Ashoka’s Dhamma, the officials who spread it and the missions abroad'],
    concepts: [
      c('dhamma', 'Dhamma'),
      c('dhamma_mahamattas', 'Dhamma Mahamattas', ['Dhamma Mahamatras', 'Dhammamahamatta']),
      c('third_council', 'Third Buddhist Council', ['Third Council', 'Moggaliputta Tissa']),
      c('missions', 'Mahendra', ['Sanghamitra', 'Mahinda']),
      c('tolerance', 'tolerance', ['religious tolerance'], 'detail'),
    ],
    blocks: ['explanation', 'keyFacts', 'tips', 'mistakes', 'revision', 'mcqs'],
    mcqs: { min: 6 },
  },
  [`${U}.ashoka.edicts`]: {
    ...base,
    objectives: ['Classify Ashoka’s edicts and name major inscriptions, scripts and sites'],
    concepts: [
      c('rock_edicts', 'Major Rock Edicts', ['Rock Edicts', 'Rock Edict']),
      c('minor_rock_edicts', 'Minor Rock Edicts', ['Minor Rock Edict']),
      c('pillar_edicts', 'Pillar Edicts', ['Pillar Edict']),
      c('brahmi', 'Brahmi', ['Brahmi script']),
      c('kharosthi', 'Kharosthi', [], 'detail'),
      c('james_prinsep', 'James Prinsep', ['Prinsep']),
      c('devanampiya', 'Devanampiya Piyadasi', ['Devanampiya', 'Piyadasi', 'Priyadarshi']),
    ],
    blocks: ['explanation', 'table', 'keyFacts', 'mistakes', 'revision', 'mcqs'],
    comparisons: ['Major Rock Edicts vs Minor Rock Edicts vs Pillar Edicts (content, examples, locations)'],
    facts: ['Maski', 'Sarnath'],
    mcqs: { min: 6 },
  },
  [`${U}.administration`]: {
    ...base,
    objectives: ['Describe the Mauryan central, provincial and local administration'],
    concepts: [
      c('centralised', 'centralised administration', ['centralized administration', 'central administration']),
      c('mantriparishad', 'Mantriparishad', ['council of ministers']),
      c('provinces', 'provinces', ['Tosali', 'Ujjayini', 'Suvarnagiri', 'Taxila']),
      c('officials', 'Samaharta', ['Sannidhata', 'Rajukas', 'Pradeshika'], 'detail'),
      c('espionage', 'spies', ['espionage', 'Gudhapurushas'], 'detail'),
      c('army', 'army', ['military']),
      c('city_admin', 'city administration', ['municipal administration'], 'detail'),
    ],
    blocks: ['explanation', 'table', 'keyFacts', 'revision', 'mcqs'],
    comparisons: ['Mauryan officials and their functions'],
    mcqs: { min: 6 },
  },
  [`${U}.economy`]: {
    ...base,
    objectives: ['Describe Mauryan agriculture, taxation, trade and coinage'],
    concepts: [
      c('agriculture', 'agriculture'),
      c('revenue', 'land revenue', ['Bhaga', 'taxes', 'taxation']),
      c('state_control', 'state control', ['state monopoly', 'superintendents'], 'detail'),
      c('trade', 'trade', ['trade routes', 'Uttarapatha']),
      c('guilds', 'guilds', ['shrenis']),
      c('punch_marked', 'punch-marked coins', ['punch marked coins']),
    ],
    blocks: ['explanation', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.art`]: {
    ...base,
    objectives: ['Distinguish court art and popular art of the Mauryan period with examples'],
    concepts: [
      c('pillars', 'Ashokan pillars', ['pillars', 'monolithic pillars']),
      c('sarnath_capital', 'Sarnath Lion Capital', ['Lion Capital']),
      c('mauryan_polish', 'Mauryan polish', ['polish']),
      c('stupas', 'stupa', ['stupas', 'Sanchi']),
      c('barabar', 'Barabar caves', ['Barabar']),
      c('yakshi', 'Didarganj Yakshi', ['Yakshi', 'Yaksha'], 'detail'),
      c('court_popular', 'court art', ['popular art', 'folk art'], 'detail'),
    ],
    blocks: ['explanation', 'table', 'keyFacts', 'revision', 'mcqs'],
    comparisons: ['Court art vs popular art'],
    facts: ['National Emblem'],
    mcqs: { min: 6 },
  },
  [`${U}.decline`]: {
    ...base,
    objectives: ['Explain the causes of the decline of the Mauryan Empire'],
    concepts: [
      c('weak_successors', 'weak successors', ['later Mauryas']),
      c('brihadratha', 'Brihadratha'),
      c('pushyamitra', 'Pushyamitra Shunga', ['Pushyamitra']),
      c('finance', 'financial crisis', ['economic', 'treasury'], 'detail'),
      c('theories', 'Brahmanical reaction', ['Haraprasad Shastri', 'Romila Thapar'], 'detail'),
      // Dates for the end of the dynasty differ by source: accept the common ones.
      c('end_date', '185 BCE', ['185 BC', '184 BCE', '187 BCE', '187 BC', 'c. 185'], 'detail'),
    ],
    blocks: ['explanation', 'keyFacts', 'revision', 'mcqs'],
    mcqs: { min: 4 },
  },
  [`${U}.exam_facts`]: {
    ...base,
    objectives: ['Revise the most frequently tested Mauryan facts in one place'],
    concepts: [
      c('founder', 'Chandragupta Maurya'),
      c('capital', 'Pataliputra'),
      c('megasthenes', 'Megasthenes'),
      c('kautilya', 'Kautilya', ['Chanakya']),
      c('kalinga', 'Kalinga'),
      c('prinsep', 'James Prinsep'),
      c('last_ruler', 'Brihadratha'),
    ],
    blocks: ['table', 'keyFacts', 'revision', 'mcqs'],
    comparisons: ['Ruler — key facts — period'],
    mcqs: { min: 8 },
  },
};
