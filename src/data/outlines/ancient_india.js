// Curated outline — Ancient Indian History.
//
// STATUS: DRAFT, awaiting review. Not served to students until `status`
// is set to 'approved'.
//
// Attaches to the existing learning unit `general_awareness.history.ancient`
// ("Ancient India", unit of History in syllabus.js). That subject appears in:
// RRB NTPC, RRB Group D, RRB ALP, RRB JE, SSC CGL, SSC CHSL, SSC MTS, SSC GD,
// SSC CPO. The Banking syllabi in this app have no History subject (Static GK
// only), so this outline is not attached to Banking exams.
//
// Every chapter/section below is CURATED (written for review, mapped to the
// syllabus). AI-suggested extra sections, if ever added, are stored
// separately with origin 'ai_suggested' and labelled in the app.
//
// Ids: chapter `<unitId>.<chapter>`, section `<chapterId>.<section>`.
// `weight`: how often the area is tested in Railway/SSC GK (high/medium/low),
// used to order revision, never to hide content.

export const ancientIndiaOutline = {
  unitId: 'general_awareness.history.ancient',
  status: 'draft',
  version: 2, // v2: Mauryan Empire chapter nested into subtopics
  origin: 'curated',
  title: 'Ancient Indian History',
  chapters: [
    {
      id: 'sources',
      title: 'Sources of Ancient Indian History',
      weight: 'medium',
      sections: [
        { id: 'literary', title: 'Literary sources: religious and secular texts' },
        { id: 'foreign_accounts', title: 'Foreign accounts: Megasthenes, Fa-Hien, Hiuen Tsang and others' },
        { id: 'archaeological', title: 'Archaeological sources: coins, monuments, inscriptions' },
      ],
    },
    {
      id: 'prehistoric',
      title: 'Prehistoric India',
      weight: 'medium',
      sections: [
        { id: 'palaeolithic', title: 'Palaeolithic Age: phases, tools and sites' },
        { id: 'mesolithic', title: 'Mesolithic Age: microliths and rock paintings (Bhimbetka)' },
        { id: 'neolithic', title: 'Neolithic Age: agriculture and sites (Mehrgarh, Burzahom)' },
        { id: 'chalcolithic', title: 'Chalcolithic cultures: Ahar, Malwa, Jorwe' },
      ],
    },
    {
      id: 'indus_valley',
      title: 'Indus Valley (Harappan) Civilization',
      weight: 'high',
      sections: [
        { id: 'discovery', title: 'Discovery, excavation, archaeologists and dating' },
        { id: 'major_sites', title: 'Major sites: location, discoveries and unique features' },
        { id: 'town_planning', title: 'Town planning: grid, drainage, citadel, Great Bath, granaries' },
        { id: 'economy', title: 'Economy: agriculture, trade, crafts, weights and measures, metallurgy' },
        { id: 'society_culture', title: 'Society and culture: food, dress, ornaments, occupations' },
        { id: 'religion', title: 'Religion: Mother Goddess, Pashupati seal, burial practices' },
        { id: 'art', title: 'Art: seals, pottery, bronze (Dancing Girl), sculpture, beads' },
        { id: 'script', title: 'Script: features, seals, decipherment status' },
        { id: 'decline', title: 'Decline: major theories and evidence' },
      ],
    },
    {
      id: 'vedic',
      title: 'Vedic Civilization',
      weight: 'high',
      sections: [
        { id: 'aryans', title: 'Origin of the Aryans: theories' },
        { id: 'vedic_literature', title: 'Vedic literature: Vedas, Brahmanas, Aranyakas, Upanishads, Vedangas' },
        { id: 'early_vedic', title: 'Early (Rig) Vedic period: polity, society, economy, religion' },
        { id: 'later_vedic', title: 'Later Vedic period: polity, varna, economy, religion' },
        { id: 'early_vs_later', title: 'Early vs Later Vedic: comparison' },
      ],
    },
    {
      id: 'mahajanapadas',
      title: 'Mahajanapadas and the Rise of Magadha',
      weight: 'high',
      sections: [
        { id: 'sixteen', title: 'The 16 Mahajanapadas and their capitals' },
        { id: 'republics', title: 'Republics (Ganasanghas) vs monarchies' },
        { id: 'haryanka', title: 'Haryanka dynasty: Bimbisara, Ajatashatru, Udayin' },
        { id: 'shishunaga', title: 'Shishunaga dynasty' },
        { id: 'nanda', title: 'Nanda dynasty: Mahapadma Nanda, Dhana Nanda' },
        { id: 'magadha_rise', title: 'Causes of the rise of Magadha' },
        { id: 'persian_greek', title: 'Persian and Greek (Alexander) invasions and impact' },
      ],
    },
    {
      id: 'religious_movements',
      title: 'Religious Movements: Buddhism and Jainism',
      weight: 'high',
      sections: [
        { id: 'background', title: 'Causes of the new religious movements' },
        { id: 'buddhism', title: 'Buddhism: life of Buddha, teachings, Sangha' },
        { id: 'buddhist_councils', title: 'Buddhist councils and sects (Hinayana, Mahayana, Vajrayana)' },
        { id: 'buddhist_texts', title: 'Buddhist literature and sites' },
        { id: 'jainism', title: 'Jainism: Mahavira, Tirthankaras, Triratna, teachings' },
        { id: 'jain_councils', title: 'Jain councils, sects (Digambara, Svetambara) and texts' },
        { id: 'comparison', title: 'Buddhism vs Jainism: comparison' },
        { id: 'other_sects', title: 'Other sects: Ajivikas and others' },
      ],
    },
    {
      id: 'mauryan',
      title: 'Mauryan Empire',
      weight: 'high',
      // Nested (v2): subtopics with learning sections under them.
      sections: [
        { id: 'background', title: 'Historical background: Magadha and the end of the Nandas' },
        { id: 'sources', title: 'Sources: Indica, Arthashastra, edicts and literature' },
        {
          id: 'founding',
          title: 'Chandragupta Maurya and Chanakya',
          children: [
            { id: 'chandragupta', title: 'Chandragupta Maurya: rise, conquests and the Seleucid treaty' },
            { id: 'chanakya', title: 'Chanakya and the Arthashastra' },
          ],
        },
        { id: 'bindusara', title: 'Bindusara' },
        {
          id: 'ashoka',
          title: 'Ashoka',
          children: [
            { id: 'kalinga', title: 'The Kalinga War and its impact' },
            { id: 'dhamma', title: 'Dhamma: policy, officials and missions' },
            { id: 'edicts', title: 'Major inscriptions and edicts' },
          ],
        },
        { id: 'administration', title: 'Mauryan administration' },
        { id: 'economy', title: 'Mauryan economy' },
        { id: 'art', title: 'Mauryan art and architecture: pillars, stupas, caves' },
        { id: 'decline', title: 'Decline of the Mauryan Empire' },
        { id: 'exam_facts', title: 'Important examination facts' },
      ],
    },
    {
      id: 'post_mauryan',
      title: 'Post-Mauryan Period',
      weight: 'high',
      sections: [
        { id: 'shunga_kanva', title: 'Shunga and Kanva dynasties' },
        { id: 'indo_greeks', title: 'Indo-Greeks, Shakas and Parthians' },
        { id: 'kushans', title: 'Kushan Empire: Kanishka, Fourth Buddhist Council' },
        { id: 'satavahanas', title: 'Satavahana dynasty' },
        { id: 'kharavela', title: 'Kharavela and Kalinga (Hathigumpha inscription)' },
        { id: 'art_schools', title: 'Art schools: Gandhara, Mathura, Amaravati' },
        { id: 'trade', title: 'Trade, guilds and contact with Rome' },
      ],
    },
    {
      id: 'sangam',
      title: 'Sangam Age',
      weight: 'medium',
      sections: [
        { id: 'sangams', title: 'The three Sangams and Sangam literature' },
        { id: 'kingdoms', title: 'Chera, Chola and Pandya kingdoms' },
        { id: 'society', title: 'Sangam polity, society and economy' },
      ],
    },
    {
      id: 'gupta',
      title: 'Gupta Empire',
      weight: 'high',
      sections: [
        { id: 'early_rulers', title: 'Origin, Sri Gupta, Chandragupta I' },
        { id: 'samudragupta', title: 'Samudragupta: conquests, Allahabad Prashasti' },
        { id: 'chandragupta_ii', title: 'Chandragupta II (Vikramaditya), Navaratnas, Fa-Hien' },
        { id: 'later_guptas', title: 'Kumaragupta, Skandagupta and decline (Huna invasions)' },
        { id: 'administration', title: 'Gupta administration, economy and society' },
        { id: 'culture', title: 'Gupta art, architecture and literature' },
        { id: 'science', title: 'Science and mathematics: Aryabhata, Varahamihira, Brahmagupta' },
      ],
    },
    {
      id: 'post_gupta',
      title: 'Post-Gupta Period',
      weight: 'medium',
      sections: [
        { id: 'vakatakas', title: 'Vakatakas and Maitrakas' },
        { id: 'harsha', title: 'Harshavardhana: reign, Hiuen Tsang, Kannauj and Prayag assemblies' },
        { id: 'chalukyas_pallavas', title: 'Chalukyas of Badami and Pallavas' },
        { id: 'temple_architecture', title: 'Early temple architecture: Nagara, Dravida, Vesara' },
      ],
    },
    {
      id: 'art_literature_science',
      title: 'Ancient Indian Art, Literature and Science',
      weight: 'medium',
      sections: [
        { id: 'architecture', title: 'Stupas, chaityas, viharas and rock-cut caves' },
        { id: 'sanskrit_literature', title: 'Sanskrit literature: epics, Puranas, Kalidasa and others' },
        { id: 'texts_authors', title: 'Important books and authors (table)' },
        { id: 'science_math', title: 'Science, mathematics and medicine: Sushruta, Charaka, zero, decimal' },
      ],
    },
    {
      id: 'revision',
      title: 'Exam Revision: Inscriptions, Sites and Chronology',
      weight: 'high',
      sections: [
        { id: 'inscriptions', title: 'Important inscriptions and their significance' },
        { id: 'sites', title: 'Important archaeological sites: state and discoveries' },
        { id: 'timeline', title: 'Chronology of dynasties and rulers' },
        { id: 'firsts', title: 'Frequently tested facts and firsts' },
      ],
    },
  ],
};
