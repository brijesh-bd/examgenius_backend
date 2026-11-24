// Curated outline — Medieval Indian History (c. 750 – 1761).
//
// STATUS: DRAFT, awaiting review. Not served to students until `status`
// is set to 'approved' (admins can preview drafts).
//
// Unit: `general_awareness.history.medieval` (syllabus.js topicUnits).
// The History subject is part of General Awareness in: RRB NTPC, RRB Group D,
// RRB ALP, RRB JE, SSC CGL, SSC CHSL, SSC MTS, SSC GD, SSC CPO. The Banking
// syllabi in this app have no History subject, so it is not attached there.
//
// scope: 'common'   — asked across Railway and SSC papers.
//        'extended' — depth seen mainly in SSC CGL/CHSL/CPO and RRB NTPC/JE;
//                     relevance for RRB Group D, SSC MTS and SSC GD is
//                     uncertain (verify against each notification).
//
// Syllabus references (for verification, not fact sources):
//   RRB CEN notifications (NTPC, Group D, ALP, JE) — General Awareness:
//     "History of India and Indian National Movement".
//   SSC CGL / CHSL / MTS / GD / CPO notifications — General Awareness:
//     "History" (CGL/CHSL/CPO), "Indian history" (MTS/GD).
//   NCERT Class 7 "Our Pasts – II"; NCERT Class 12 "Themes in Indian
//   History – Part II"; Satish Chandra, "History of Medieval India".
//
// Each leaf section carries its coverage checklist (concepts, facts,
// comparisons, MCQ minimum) → manifests via data/manifests/fromOutline.js.

const s = (id, title, concepts, extra = {}) => ({ id, title, concepts, ...extra });
const sub = (id, title, children) => ({ id, title, children });

export const medievalIndiaOutline = {
  unitId: 'general_awareness.history.medieval',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Medieval Indian History',
  sourceRefs: [
    { title: 'RRB CEN notifications (NTPC, Group D, ALP, JE): General Awareness syllabus' },
    { title: 'SSC CGL, CHSL, MTS, GD, CPO notifications: General Awareness syllabus' },
    { title: 'NCERT Class 7, Our Pasts – II' },
    { title: 'NCERT Class 12, Themes in Indian History – Part II' },
    { title: 'Satish Chandra, History of Medieval India' },
  ],
  chapters: [
    {
      id: 'early_medieval',
      title: 'Early Medieval India (c. 750 – 1200)',
      description: 'Regional kingdoms after Harsha, the tripartite struggle, the Cholas and the early Arab and Turkish invasions.',
      weight: 'medium',
      scope: 'common',
      objectives: ['Explain the tripartite struggle for Kannauj', 'Describe Chola administration and naval power', 'Sequence the Arab and Turkish invasions'],
      timeline: ['712 Arab conquest of Sindh', '1000–1027 Raids of Mahmud of Ghazni', '1191 First Battle of Tarain', '1192 Second Battle of Tarain'],
      personalities: ['Dharmapala', 'Nagabhata II', 'Rajaraja I', 'Rajendra I', 'Mahmud of Ghazni', 'Prithviraj Chauhan', 'Muhammad Ghori'],
      mcqFocus: 'Dynasty–founder–capital matching; Chola temples; battle–year pairs.',
      sections: [
        s('tripartite', 'Tripartite struggle: Palas, Pratiharas and Rashtrakutas', [
          'tripartite struggle', 'Kannauj', 'Palas|Pala dynasty', 'Pratiharas|Gurjara-Pratiharas', 'Rashtrakutas', '~Dharmapala', '~Vikramashila', '~Kailasa temple|Kailasanatha temple',
        ], { comparisons: ['Palas vs Pratiharas vs Rashtrakutas (region, founder, notable ruler)'] }),
        s('rajputs', 'Rajput kingdoms', ['Rajput', 'Chauhans|Chahamanas', 'Paramaras', '~Chandelas|Khajuraho', '~Solankis|Chalukyas of Gujarat'], { mcqs: 4 }),
        sub('cholas', 'The Cholas', [
          s('rulers', 'Chola rulers and expansion', ['Vijayalaya', 'Rajaraja I|Rajaraja Chola', 'Rajendra I|Rajendra Chola', 'Gangaikonda Cholapuram', '~naval expedition|Srivijaya'], { facts: ['Thanjavur'] }),
          s('administration', 'Chola administration, village assemblies and temples', ['ur', 'sabha', 'Uttaramerur inscription|Uttaramerur', 'Brihadeshwara temple|Brihadisvara', '~nadu', '~bronze sculpture|Nataraja']),
        ]),
        s('invasions', 'Arab and Turkish invasions', [
          'Muhammad bin Qasim', 'Sindh', 'Mahmud of Ghazni', 'Somnath', 'Muhammad Ghori|Muhammad of Ghor', 'Battle of Tarain|Tarain', 'Prithviraj Chauhan', '~Al-Biruni|Kitab-ul-Hind',
        ], { facts: ['712', '1192'] }),
      ],
    },
    {
      id: 'delhi_sultanate',
      title: 'The Delhi Sultanate (1206 – 1526)',
      description: 'The five dynasties of the Sultanate, their rulers, reforms, administration and architecture.',
      weight: 'high',
      scope: 'common',
      objectives: ['Name the five dynasties in order with key rulers', 'Explain Alauddin Khalji’s market reforms and Muhammad bin Tughlaq’s experiments', 'Describe the iqta system'],
      timeline: ['1206 Qutbuddin Aibak', '1236 Razia Sultan', '1290 Khalji dynasty', '1320 Tughlaq dynasty', '1398 Timur’s invasion', '1451 Lodi dynasty', '1526 First Battle of Panipat'],
      personalities: ['Qutbuddin Aibak', 'Iltutmish', 'Razia Sultan', 'Balban', 'Alauddin Khalji', 'Muhammad bin Tughlaq', 'Firoz Shah Tughlaq', 'Ibrahim Lodi', 'Amir Khusrau'],
      mcqFocus: 'Dynasty order; ruler–reform matching; monuments and builders.',
      sections: [
        sub('dynasties', 'Dynasties of the Sultanate', [
          s('mamluk', 'Mamluk (Slave) dynasty: Aibak, Iltutmish, Razia, Balban', [
            'Mamluk|Slave dynasty', 'Qutbuddin Aibak|Aibak', 'Iltutmish', 'Razia Sultan|Razia', 'Balban', '~Chahalgani|Turkan-i-Chahalgani', '~sijda|paibos', 'Qutub Minar',
          ]),
          s('khalji', 'Khalji dynasty: Alauddin Khalji', ['Khalji dynasty|Khaljis', 'Alauddin Khalji', 'market reforms|market control', 'Mongol invasions|Mongols', '~Malik Kafur', '~dagh|chehra', 'Alai Darwaza'], { mcqs: 6 }),
          s('tughlaq', 'Tughlaq dynasty: Muhammad bin Tughlaq and Firoz Shah', [
            'Tughlaq dynasty|Tughlaqs', 'Ghiyasuddin Tughlaq', 'Muhammad bin Tughlaq', 'token currency', 'Daulatabad|transfer of capital', 'Firoz Shah Tughlaq', '~Ibn Battuta', '~Timur',
          ]),
          s('sayyid_lodi', 'Sayyid and Lodi dynasties', ['Sayyid dynasty|Sayyids', 'Lodi dynasty|Lodis', 'Bahlul Lodi', 'Sikandar Lodi|Agra', 'Ibrahim Lodi', 'First Battle of Panipat|Panipat'], { facts: ['1526'], mcqs: 4 }),
        ]),
        s('administration', 'Sultanate administration, iqta and economy', ['iqta', 'muqti|iqtadar', 'kharaj|land revenue', 'jaziya', '~diwan-i-arz', '~wazir'], { comparisons: ['Sultanate departments (diwan) and their functions'] }),
        s('culture', 'Sultanate architecture, literature and society', ['Indo-Islamic architecture', 'true arch|arch and dome', 'Qutub Minar', 'Alai Darwaza', 'Amir Khusrau', '~Tughlaqabad', '~Persian'], { comparisons: ['Monument — builder — dynasty'] }),
      ],
    },
    {
      id: 'vijayanagara_bahmani',
      title: 'Vijayanagara and Bahmani Kingdoms',
      description: 'The rival Deccan powers from 1336/1347 to the Battle of Talikota and the Deccan sultanates.',
      weight: 'high',
      scope: 'common',
      objectives: ['Describe the founding and peak of Vijayanagara', 'Explain the Bahmani kingdom and its break-up', 'Recall the Battle of Talikota'],
      timeline: ['1336 Vijayanagara founded', '1347 Bahmani kingdom founded', '1509–1529 Krishnadeva Raya', '1565 Battle of Talikota'],
      personalities: ['Harihara and Bukka', 'Krishnadeva Raya', 'Alauddin Hasan Bahman Shah', 'Mahmud Gawan'],
      mcqFocus: 'Founders and years; Krishnadeva Raya’s works; Hampi; foreign travellers.',
      sections: [
        s('vijayanagara', 'Vijayanagara Empire: dynasties, Krishnadeva Raya, administration', [
          'Vijayanagara', 'Harihara|Bukka', 'Sangama dynasty|Sangama', 'Krishnadeva Raya', 'Hampi', 'nayankara|nayaka', '~Amuktamalyada', '~Tuluva dynasty', '~amaram|amara-nayaka',
        ], { facts: ['1336', 'Tungabhadra'] }),
        s('bahmani', 'Bahmani kingdom and the Deccan sultanates', ['Bahmani', 'Alauddin Hasan Bahman Shah|Hasan Gangu', 'Gulbarga', 'Mahmud Gawan', 'Deccan sultanates|Bijapur', '~Golconda|Ahmadnagar', '~Gol Gumbaz'], { facts: ['1347'] }),
        s('talikota', 'Battle of Talikota and its consequences', ['Battle of Talikota|Talikota', 'Rakshasi-Tangadi|Rakshasa-Tangadi', '~Rama Raya', 'Deccan sultanates'], { facts: ['1565'], mcqs: 4 }),
        s('travellers', 'Foreign travellers in medieval South India', ['Abdur Razzaq', 'Nicolo Conti|Niccolò de’ Conti', 'Domingo Paes|Paes', '~Fernao Nuniz|Nuniz', '~Afanasy Nikitin|Nikitin'], { comparisons: ['Traveller — country — ruler/kingdom visited'], mcqs: 4 }),
      ],
    },
    {
      id: 'bhakti_sufi',
      title: 'Bhakti and Sufi Movements; Sikhism',
      description: 'Devotional traditions, Sufi orders and the Sikh Gurus.',
      weight: 'high',
      scope: 'common',
      objectives: ['Match bhakti saints with regions and works', 'Explain Sufi silsilas and major shrines', 'List the Sikh Gurus and key events'],
      timeline: ['c. 6th–9th c. Alvars and Nayanars', '1469 Guru Nanak born', '1604 Adi Granth compiled', '1699 Khalsa founded'],
      personalities: ['Ramanuja', 'Kabir', 'Mirabai', 'Tulsidas', 'Chaitanya', 'Namdev', 'Shankaradeva', 'Moinuddin Chishti', 'Nizamuddin Auliya', 'Guru Nanak', 'Guru Gobind Singh'],
      mcqFocus: 'Saint–region–work matching; silsila–founder–place; Guru–event matching.',
      sections: [
        s('bhakti_south', 'Bhakti in South India: Alvars, Nayanars and Acharyas', ['Alvars', 'Nayanars', 'Ramanuja|Vishishtadvaita', 'Shankaracharya|Advaita', '~Madhvacharya|Dvaita', '~Basavanna|Virashaiva|Lingayat']),
        s('bhakti_north', 'Bhakti saints of North and East India', ['Kabir', 'Mirabai', 'Tulsidas|Ramcharitmanas', 'Surdas', 'Chaitanya|Chaitanya Mahaprabhu', 'Namdev', '~Shankaradeva|Sankardev', '~Tukaram', '~Ramananda'], { comparisons: ['Saint — region — sect/teaching — work'], mcqs: 8 }),
        s('sufi', 'Sufism: silsilas and major saints', ['Sufi|Sufism', 'silsila', 'Chishti', 'Suhrawardi', 'Moinuddin Chishti|Ajmer', 'Nizamuddin Auliya', '~khanqah', '~Naqshbandi', '~Qadiri'], { comparisons: ['Silsila — founder in India — centre'] }),
        s('sikhism', 'Guru Nanak and the Sikh Gurus', ['Guru Nanak', 'Guru Arjan Dev|Adi Granth', 'Guru Tegh Bahadur', 'Guru Gobind Singh', 'Khalsa', '~Guru Angad|Gurmukhi', '~Golden Temple|Harmandir Sahib'], { facts: ['1699'] }),
      ],
    },
    {
      id: 'mughal_empire',
      title: 'The Mughal Empire (1526 – 1707) and Sur Interregnum',
      description: 'Mughal rulers from Babur to Aurangzeb, Sher Shah Suri, and the major battles and policies.',
      weight: 'high',
      scope: 'common',
      objectives: ['Sequence the Mughal emperors and their key events', 'Explain Akbar’s policies and Sher Shah’s reforms', 'Recall major battles with years'],
      timeline: ['1526 First Battle of Panipat', '1527 Battle of Khanwa', '1539 Battle of Chausa', '1540 Battle of Kannauj', '1556 Second Battle of Panipat', '1576 Battle of Haldighati', '1679 Jaziya reimposed', '1707 Death of Aurangzeb'],
      personalities: ['Babur', 'Humayun', 'Sher Shah Suri', 'Akbar', 'Bairam Khan', 'Jahangir', 'Nur Jahan', 'Shah Jahan', 'Aurangzeb'],
      mcqFocus: 'Battle–year–parties; emperor–event matching; autobiographies and court chroniclers.',
      sections: [
        s('babur_humayun', 'Babur and Humayun', ['Babur', 'First Battle of Panipat|Panipat', 'Battle of Khanwa|Khanwa', 'Rana Sanga', 'Baburnama|Tuzuk-i-Baburi', 'Humayun', '~Humayun-nama|Gulbadan Begum'], { facts: ['1526', '1527'] }),
        s('sher_shah', 'Sher Shah Suri and the Sur interregnum', ['Sher Shah Suri|Sher Shah', 'Battle of Chausa|Chausa', 'Battle of Kannauj|Kannauj', 'rupiya', 'Grand Trunk Road|Sadak-e-Azam', '~sarai', '~Hemu'], { facts: ['1539', '1540'] }),
        sub('akbar', 'Akbar', [
          s('reign', 'Akbar: conquests and battles', ['Akbar', 'Second Battle of Panipat', 'Bairam Khan', 'Hemu', 'Battle of Haldighati|Haldighati', 'Maharana Pratap', '~Fatehpur Sikri|Buland Darwaza'], { facts: ['1556', '1576'] }),
          s('policies', 'Akbar’s religious and administrative policies', ['Sulh-i-kul|sulh-i-kul', 'Ibadat Khana', 'Din-i-Ilahi|Tauhid-i-Ilahi', 'abolition of jaziya|jaziya', 'Navaratnas|nine jewels', '~Abul Fazl', '~Birbal|Tansen'], { mcqs: 6 }),
        ]),
        s('jahangir_shahjahan', 'Jahangir and Shah Jahan', ['Jahangir', 'Nur Jahan', 'Thomas Roe|Sir Thomas Roe', 'Shah Jahan', 'Taj Mahal', 'Peacock Throne|Takht-i-Taus', '~Tuzuk-i-Jahangiri', '~Red Fort|Shahjahanabad']),
        s('aurangzeb', 'Aurangzeb and the Deccan', ['Aurangzeb', 'jaziya', 'Deccan wars|Deccan', 'Guru Tegh Bahadur', '~Bibi ka Maqbara', '~Fatawa-i-Alamgiri'], { facts: ['1679', '1707'] }),
        s('decline', 'Later Mughals and decline of the empire', ['later Mughals', 'Nadir Shah', 'Peacock Throne', '~Bahadur Shah I', '~Farrukhsiyar|farman', 'decline'], { facts: ['1739'], mcqs: 4 }),
      ],
    },
    {
      id: 'mughal_administration_culture',
      title: 'Mughal Administration, Economy and Culture',
      description: 'Mansabdari, revenue systems, architecture, painting and literature.',
      weight: 'high',
      scope: 'extended',
      objectives: ['Explain the mansabdari and jagirdari systems', 'Describe Todar Mal’s revenue system', 'Identify Mughal monuments, painting schools and chronicles'],
      timeline: ['1580 Dahsala system', '1595 Ain-i-Akbari completed (c.)', '1632–1653 Taj Mahal built (c.)'],
      personalities: ['Raja Todar Mal', 'Abul Fazl', 'Mir Sayyid Ali', 'Abdus Samad', 'Bishandas', 'Ustad Mansur'],
      mcqFocus: 'Zat/sawar; zabt/dahsala; book–author; monument–emperor.',
      sections: [
        s('mansabdari', 'Mansabdari and jagirdari systems', ['mansabdari|mansabdar', 'zat', 'sawar', 'jagir|jagirdari', '~khalisa', '~dagh'], { comparisons: ['Zat vs sawar'] }),
        s('revenue', 'Land revenue: zabt and the dahsala system', ['Raja Todar Mal|Todar Mal', 'zabt', 'dahsala', '~polaj|parauti', '~zamindar'], { mcqs: 4 }),
        s('architecture_painting', 'Mughal architecture and painting', ['Humayun’s Tomb|Humayun\'s Tomb', 'Fatehpur Sikri', 'Taj Mahal', 'Red Fort', 'Mughal painting|miniature', '~Ustad Mansur', '~Hamzanama'], { comparisons: ['Monument — emperor — place'] }),
        s('literature', 'Mughal literature and chronicles', ['Ain-i-Akbari', 'Akbarnama', 'Abul Fazl', 'Baburnama', 'Tuzuk-i-Jahangiri', '~Badshahnama|Abdul Hamid Lahori', '~Dara Shikoh|Majma-ul-Bahrain'], { comparisons: ['Book — author — emperor'], mcqs: 6 }),
      ],
    },
    {
      id: 'marathas',
      title: 'The Marathas',
      description: 'Shivaji, Maratha administration, the Peshwas and the Third Battle of Panipat.',
      weight: 'high',
      scope: 'common',
      objectives: ['Describe Shivaji’s rise and administration', 'Explain the rise of the Peshwas', 'Explain the Third Battle of Panipat'],
      timeline: ['1665 Treaty of Purandar', '1674 Shivaji crowned at Raigad', '1713 Balaji Vishwanath Peshwa', '1761 Third Battle of Panipat'],
      personalities: ['Shivaji', 'Sambhaji', 'Tarabai', 'Balaji Vishwanath', 'Baji Rao I', 'Balaji Baji Rao', 'Ahmad Shah Abdali'],
      mcqFocus: 'Ashtapradhan posts; chauth/sardeshmukhi; treaty and battle years.',
      sections: [
        s('shivaji', 'Shivaji and the rise of Maratha power', ['Shivaji', 'Treaty of Purandar|Purandar', 'Raigad', 'Afzal Khan', '~Jai Singh', '~Sambhaji'], { facts: ['1674'] }),
        s('administration', 'Maratha administration: Ashtapradhan, chauth and sardeshmukhi', ['Ashtapradhan', 'Peshwa', 'chauth', 'sardeshmukhi', '~Sumant|Amatya'], { comparisons: ['Ashtapradhan post — function'], mcqs: 6 }),
        s('peshwas', 'The Peshwas and Maratha expansion', ['Balaji Vishwanath', 'Baji Rao I', 'Balaji Baji Rao|Nana Saheb Peshwa', 'Maratha confederacy|confederacy', '~Holkar|Scindia|Gaekwad|Bhonsle']),
        s('panipat_iii', 'Third Battle of Panipat', ['Third Battle of Panipat', 'Ahmad Shah Abdali|Ahmad Shah Durrani', 'Sadashivrao Bhau', '~Vishwasrao'], { facts: ['1761'], mcqs: 4 }),
      ],
    },
    {
      id: 'regional_powers_18c',
      title: 'Regional Powers of the 18th Century',
      description: 'Successor states after Mughal decline. Mysore and Punjab are continued in Modern History (British expansion).',
      weight: 'medium',
      scope: 'extended',
      seeAlso: ['general_awareness.history.modern#british_expansion'],
      objectives: ['Identify the successor states and their founders'],
      timeline: ['c. 1717 Murshid Quli Khan becomes Nawab of Bengal', '1722 Saadat Khan governor of Awadh', '1724 Asaf Jah establishes Hyderabad', '1799 Ranjit Singh takes Lahore'],
      personalities: ['Murshid Quli Khan', 'Saadat Khan Burhan-ul-Mulk', 'Nizam-ul-Mulk Asaf Jah', 'Hyder Ali', 'Ranjit Singh'],
      mcqFocus: 'State — founder matching.',
      sections: [
        s('successor_states', 'Bengal, Awadh and Hyderabad', ['Murshid Quli Khan|Bengal', 'Saadat Khan|Awadh', 'Nizam-ul-Mulk|Asaf Jah', 'Hyderabad', '~Alivardi Khan'], { comparisons: ['State — founder — year'], mcqs: 4 }),
        s('mysore_punjab_rajputs', 'Mysore, the Sikhs and the Rajputs', ['Hyder Ali|Mysore', 'Ranjit Singh', 'misls|misl', '~Sawai Jai Singh|Jantar Mantar'], { mcqs: 4 }),
      ],
    },
    {
      id: 'revision',
      title: 'Medieval India — Revision',
      description: 'Frequently tested tables and chronology.',
      weight: 'high',
      scope: 'common',
      objectives: ['Revise the highest-frequency medieval facts in tables'],
      sections: [
        s('battles', 'Important battles (table)', ['Battle of Tarain|Tarain', 'First Battle of Panipat', 'Battle of Khanwa|Khanwa', 'Battle of Haldighati|Haldighati', 'Battle of Talikota|Talikota', 'Third Battle of Panipat'], { comparisons: ['Battle — year — between — result'], mcqs: 8 }),
        s('books_travellers', 'Books, authors and foreign travellers (table)', ['Al-Biruni', 'Ibn Battuta|Rihla', 'Amir Khusrau', 'Ain-i-Akbari', 'Baburnama', 'Abdur Razzaq', '~Francois Bernier|Bernier', '~Marco Polo'], { comparisons: ['Book/traveller — author/country — period'], mcqs: 8 }),
        s('chronology', 'Chronology of dynasties and rulers', ['Delhi Sultanate', 'Mughal', 'Vijayanagara', 'Bahmani', 'Marathas'], { comparisons: ['Dynasty — founder — period'], mcqs: 6 }),
      ],
    },
  ],
};
