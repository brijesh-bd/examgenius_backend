// Curated outline — Modern Indian History (c. 1498 – 1947): the COLONIAL
// STATE, ECONOMY AND SOCIETY.
//
// STATUS: DRAFT, awaiting review. Not served to students until approved.
// Unit: `general_awareness.history.modern`. Exams: same as all History units
// (RRB NTPC, Group D, ALP, JE; SSC CGL, CHSL, MTS, GD, CPO); not Banking.
//
// BOUNDARY with Indian Freedom Struggle (`…history.freedom_struggle`):
//   Modern History  = arrival of Europeans, British conquest and expansion,
//                     Governors-General, Company-era Acts (1773–1853),
//                     land revenue and economic impact, education and press,
//                     social and religious reform, and the peasant/tribal
//                     uprisings that were NOT part of the organised
//                     national movement.
//   Freedom Struggle = the Revolt of 1857 onward: rise of nationalism, INC,
//                     all phases of the national movement, Crown-era
//                     constitutional reforms (1858–1947), independence and
//                     partition.
//   Overlaps are cross-referenced with `seeAlso` instead of duplicated:
//     reform movements → Freedom Struggle "rise of nationalism";
//     drain of wealth (economic critique) → Freedom Struggle moderates;
//     Acts 1773–1853 here; Acts 1858–1947 in Freedom Struggle; Constitution
//     making in Polity (`general_awareness.polity.making_constitution`).
//
// scope: 'common' / 'extended' as in the Medieval outline.
// Syllabus references: RRB CEN and SSC notifications (General Awareness);
// NCERT Class 8 "Our Pasts – III"; NCERT Class 12 "Themes in Indian History
// – Part III"; Bipan Chandra, "History of Modern India" (old NCERT);
// Sekhar Bandyopadhyay, "From Plassey to Partition".

const s = (id, title, concepts, extra = {}) => ({ id, title, concepts, ...extra });
const sub = (id, title, children) => ({ id, title, children });

export const modernIndiaOutline = {
  unitId: 'general_awareness.history.modern',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Modern Indian History',
  sourceRefs: [
    { title: 'RRB CEN notifications (NTPC, Group D, ALP, JE): General Awareness syllabus' },
    { title: 'SSC CGL, CHSL, MTS, GD, CPO notifications: General Awareness syllabus' },
    { title: 'NCERT Class 8, Our Pasts – III' },
    { title: 'NCERT Class 12, Themes in Indian History – Part III' },
    { title: 'Bipan Chandra, History of Modern India' },
    { title: 'Sekhar Bandyopadhyay, From Plassey to Partition' },
  ],
  chapters: [
    {
      id: 'europeans',
      title: 'Advent of the Europeans',
      description: 'Portuguese, Dutch, English, Danish and French trading companies and the Anglo-French rivalry.',
      weight: 'high',
      scope: 'common',
      objectives: ['Sequence the arrival of European powers', 'Explain the Carnatic Wars and the end of French ambitions'],
      timeline: ['1498 Vasco da Gama reaches Calicut', '1510 Albuquerque captures Goa', '1600 English East India Company chartered', '1602 Dutch VOC formed', '1664 French East India Company', '1746–1763 Carnatic Wars', '1760 Battle of Wandiwash'],
      personalities: ['Vasco da Gama', 'Afonso de Albuquerque', 'Thomas Roe', 'Joseph François Dupleix', 'Robert Clive'],
      mcqFocus: 'Company–year–first factory matching; Carnatic war battles.',
      sections: [
        s('portuguese', 'The Portuguese', ['Vasco da Gama', 'Calicut', 'Zamorin', 'Afonso de Albuquerque|Albuquerque', 'Goa', '~Francisco de Almeida|Blue Water Policy', '~cartaz'], { facts: ['1498', '1510'] }),
        s('dutch_english_french', 'The Dutch, English, Danes and French', ['Dutch|VOC', 'English East India Company|East India Company', 'Surat', 'French East India Company|French', 'Pondicherry', '~Danes|Tranquebar', '~Masulipatnam'], { comparisons: ['Company — year — first factory — main centre'], facts: ['1600'] }),
        s('carnatic_wars', 'Anglo-French rivalry: the Carnatic Wars', ['Carnatic Wars', 'Dupleix', 'Battle of Wandiwash|Wandiwash', '~Treaty of Aix-la-Chapelle', '~Robert Clive|Arcot'], { facts: ['1760'], mcqs: 4 }),
      ],
    },
    {
      id: 'british_expansion',
      title: 'Expansion of British Power',
      description: 'Conquest of Bengal, wars with Mysore, the Marathas and the Sikhs, and the policies used to annex states.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.medieval#regional_powers_18c'],
      objectives: ['Explain Plassey and Buxar and the grant of Diwani', 'Sequence the Anglo-Mysore, Anglo-Maratha and Anglo-Sikh wars', 'Explain subsidiary alliance and doctrine of lapse'],
      timeline: ['1757 Battle of Plassey', '1764 Battle of Buxar', '1765 Treaty of Allahabad (Diwani)', '1767–1799 Anglo-Mysore Wars', '1775–1818 Anglo-Maratha Wars', '1845–1849 Anglo-Sikh Wars', '1856 Annexation of Awadh'],
      personalities: ['Siraj-ud-Daulah', 'Mir Jafar', 'Mir Qasim', 'Robert Clive', 'Hyder Ali', 'Tipu Sultan', 'Ranjit Singh', 'Lord Wellesley', 'Lord Dalhousie'],
      mcqFocus: 'Battle–year–parties; war–treaty matching; policy–Governor-General.',
      sections: [
        sub('bengal', 'Conquest of Bengal', [
          s('plassey', 'Battle of Plassey', ['Battle of Plassey|Plassey', 'Siraj-ud-Daulah', 'Mir Jafar', 'Robert Clive|Clive', '~Black Hole', '~farman of 1717|dastak'], { facts: ['1757'] }),
          s('buxar_diwani', 'Battle of Buxar, Diwani and dual government', ['Battle of Buxar|Buxar', 'Mir Qasim', 'Shuja-ud-Daulah', 'Shah Alam II', 'Treaty of Allahabad', 'Diwani', 'dual government|dual system'], { facts: ['1764', '1765'] }),
        ]),
        s('mysore', 'Anglo-Mysore Wars: Hyder Ali and Tipu Sultan', ['Anglo-Mysore Wars', 'Hyder Ali', 'Tipu Sultan', 'Treaty of Seringapatam|Seringapatam', 'Treaty of Mangalore', '~Srirangapatna'], { comparisons: ['War — years — Governor-General — treaty/result'], facts: ['1799'] }),
        s('marathas', 'Anglo-Maratha Wars', ['Anglo-Maratha Wars', 'Treaty of Salbai|Salbai', 'Treaty of Bassein|Bassein', 'Peshwa', '~Baji Rao II', '~Nana Phadnavis'], { comparisons: ['War — years — treaty'], facts: ['1818'] }),
        s('punjab', 'Ranjit Singh and the Anglo-Sikh Wars', ['Ranjit Singh', 'Anglo-Sikh Wars', 'Treaty of Amritsar|Amritsar', 'annexation of Punjab|Punjab', '~Treaty of Lahore', '~Duleep Singh|Koh-i-Noor'], { facts: ['1849'] }),
        s('policies', 'Subsidiary alliance and doctrine of lapse', ['subsidiary alliance', 'Lord Wellesley|Wellesley', 'doctrine of lapse', 'Lord Dalhousie|Dalhousie', 'Satara|Jhansi', 'annexation of Awadh|Awadh'], { comparisons: ['Policy — Governor-General — states affected'] }),
      ],
    },
    {
      id: 'governors_general',
      title: 'Governors-General and Viceroys',
      description: 'Major Governors-General (1773–1858) and Viceroys (1858–1947) with the events of their tenure.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.freedom_struggle#revision'],
      objectives: ['Match Governors-General/Viceroys with the key events and reforms of their time'],
      timeline: ['1773 Warren Hastings first Governor-General of Bengal', '1833 Bentinck first Governor-General of India', '1858 Canning first Viceroy', '1947 Mountbatten last Viceroy'],
      personalities: ['Warren Hastings', 'Lord Cornwallis', 'Lord Wellesley', 'Lord William Bentinck', 'Lord Dalhousie', 'Lord Canning', 'Lord Lytton', 'Lord Ripon', 'Lord Curzon', 'Lord Mountbatten'],
      mcqFocus: 'Person–event pairs; "first" and "last" questions.',
      sections: [
        s('company_era', 'Governors-General of the Company era (1773–1858)', ['Warren Hastings', 'Lord Cornwallis|Cornwallis', 'Lord Wellesley|Wellesley', 'Lord William Bentinck|Bentinck', 'Lord Dalhousie|Dalhousie', '~Lord Hastings', '~Lord Auckland'], { comparisons: ['Governor-General — tenure — key events'], mcqs: 8 }),
        s('viceroys', 'Viceroys under the Crown (1858–1947)', ['Lord Canning|Canning', 'Lord Lytton|Lytton', 'Lord Ripon|Ripon', 'Lord Curzon|Curzon', 'Lord Irwin|Irwin', 'Lord Mountbatten|Mountbatten', '~Lord Mayo', '~Lord Linlithgow|Lord Wavell'], { comparisons: ['Viceroy — tenure — key events'], mcqs: 8 }),
      ],
    },
    {
      id: 'company_acts',
      title: 'Constitutional Development under the Company (1773–1853)',
      description: 'Acts of Parliament regulating the East India Company. Crown-era Acts (1858 onward) are in Freedom Struggle; Constitution making is in Polity.',
      weight: 'medium',
      scope: 'extended',
      seeAlso: ['general_awareness.history.freedom_struggle#constitutional_reforms', 'general_awareness.polity.making_constitution'],
      objectives: ['State the main provisions of each Company-era Act'],
      timeline: ['1773 Regulating Act', '1784 Pitt’s India Act', '1813 Charter Act', '1833 Charter Act', '1853 Charter Act'],
      mcqFocus: 'Act–provision matching.',
      sections: [
        s('regulating_pitts', 'Regulating Act 1773 and Pitt’s India Act 1784', ['Regulating Act', 'Governor-General of Bengal', 'Supreme Court at Calcutta|Supreme Court', 'Pitt’s India Act|Pitt\'s India Act', 'Board of Control', '~dual control'], { facts: ['1773', '1784'] }),
        s('charter_acts', 'Charter Acts of 1813, 1833 and 1853', ['Charter Act of 1813|1813', 'Charter Act of 1833|1833', 'Governor-General of India', 'Charter Act of 1853|1853', '~open competition|civil services', '~trade monopoly'], { comparisons: ['Charter Act — key provisions'] }),
      ],
    },
    {
      id: 'economy_impact',
      title: 'Economic Impact of British Rule',
      description: 'Land revenue settlements, commercialisation, deindustrialisation, railways and famines. The nationalist critique (drain theory) is cross-referenced to Freedom Struggle.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.freedom_struggle#rise_nationalism'],
      objectives: ['Compare the three land revenue systems', 'Explain deindustrialisation and the drain of wealth', 'Recall the first railway and telegraph'],
      timeline: ['1793 Permanent Settlement', '1820 Ryotwari (Madras)', '1822/1833 Mahalwari', '1853 First railway, Bombay–Thane', '1876–1878 Great Famine'],
      personalities: ['Lord Cornwallis', 'Thomas Munro', 'Holt Mackenzie', 'Dadabhai Naoroji', 'R. C. Dutt'],
      mcqFocus: 'Settlement–region–Governor-General; railway firsts.',
      sections: [
        s('land_revenue', 'Land revenue systems: Permanent Settlement, Ryotwari, Mahalwari', ['Permanent Settlement|zamindari', 'Lord Cornwallis|Cornwallis', 'Ryotwari', 'Thomas Munro|Munro', 'Mahalwari', '~Holt Mackenzie'], { comparisons: ['System — year — region — who paid'], facts: ['1793'], mcqs: 8 }),
        s('deindustrialisation_drain', 'Commercialisation, deindustrialisation and drain of wealth', ['deindustrialisation|deindustrialization', 'commercialisation of agriculture|commercialization', 'drain of wealth|drain theory', 'Dadabhai Naoroji', '~R. C. Dutt|Economic History of India', '~indigo'], { mcqs: 6 }),
        s('railways_famines', 'Railways, communication and famines', ['railways|railway', 'Bombay|Thane', 'telegraph', 'postal system|postage', 'famine', '~Famine Commission'], { facts: ['1853'], mcqs: 4 }),
      ],
    },
    {
      id: 'education_press',
      title: 'Education and the Press',
      description: 'Development of modern education and the press under British rule.',
      weight: 'medium',
      scope: 'extended',
      objectives: ['Sequence the education policies', 'Recall early newspapers and press laws'],
      timeline: ['1780 Hicky’s Bengal Gazette', '1813 Charter Act education grant', '1835 Macaulay’s Minute', '1854 Wood’s Despatch', '1857 Universities of Calcutta, Bombay, Madras', '1878 Vernacular Press Act'],
      personalities: ['Thomas Babington Macaulay', 'Charles Wood', 'James Augustus Hicky', 'Lord Lytton'],
      mcqFocus: 'Policy–year; first newspaper; press acts and repeal.',
      sections: [
        s('education', 'Education policy: from 1813 to Wood’s Despatch and after', ['Macaulay’s Minute|Macaulay', 'Wood’s Despatch|Wood\'s Despatch', 'universities', 'Hunter Commission', '~Orientalist|Anglicist', '~Sadler Commission'], { comparisons: ['Policy/commission — year — recommendation'], facts: ['1835', '1854'] }),
        s('press', 'Growth of the press and press laws', ['Hicky’s Bengal Gazette|Bengal Gazette', 'Vernacular Press Act', 'Lord Lytton|Lytton', '~Lord Ripon|repeal', '~Metcalfe'], { facts: ['1878'], mcqs: 4 }),
      ],
    },
    {
      id: 'reform_movements',
      title: 'Social and Religious Reform Movements',
      description: 'Nineteenth-century reformers and organisations. Their role in the rise of nationalism is covered in Freedom Struggle.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.freedom_struggle#rise_nationalism'],
      objectives: ['Match reformers with organisations, years and causes', 'Recall the laws linked to reform (sati, widow remarriage)'],
      timeline: ['1828 Brahmo Samaj', '1829 Sati abolished', '1856 Widow Remarriage Act', '1867 Prarthana Samaj', '1873 Satyashodhak Samaj', '1875 Arya Samaj', '1875 Theosophical Society (New York)', '1897 Ramakrishna Mission'],
      personalities: ['Raja Ram Mohan Roy', 'Ishwar Chandra Vidyasagar', 'Swami Dayanand Saraswati', 'Swami Vivekananda', 'Jyotiba Phule', 'Savitribai Phule', 'Sir Syed Ahmad Khan', 'Annie Besant', 'Sree Narayana Guru'],
      mcqFocus: 'Organisation–founder–year matching (very frequent).',
      sections: [
        sub('hindu_reform', 'Reform among Hindus', [
          s('brahmo', 'Raja Ram Mohan Roy and the Brahmo Samaj', ['Raja Ram Mohan Roy', 'Brahmo Samaj|Brahmo Sabha', 'abolition of sati|sati', 'Lord William Bentinck|Bentinck', '~Debendranath Tagore', '~Keshab Chandra Sen'], { facts: ['1828', '1829'] }),
          s('vidyasagar_prarthana', 'Vidyasagar, Prarthana Samaj and widow remarriage', ['Ishwar Chandra Vidyasagar|Vidyasagar', 'widow remarriage|Widow Remarriage Act', 'Prarthana Samaj', '~M. G. Ranade|Ranade', '~Atmaram Pandurang'], { facts: ['1856'] }),
          s('arya_ramakrishna', 'Arya Samaj and the Ramakrishna Mission', ['Dayanand Saraswati|Swami Dayanand', 'Arya Samaj', 'Satyarth Prakash', 'Swami Vivekananda|Vivekananda', 'Ramakrishna Mission', '~shuddhi', '~Chicago|Parliament of Religions'], { facts: ['1875', '1897'] }),
        ]),
        s('lower_caste', 'Movements against caste: Phule, Narayana Guru and others', ['Jyotiba Phule|Jyotirao Phule', 'Satyashodhak Samaj', 'Savitribai Phule', 'Sree Narayana Guru|Narayana Guru', '~Gulamgiri', '~Periyar|Self-Respect Movement'], { facts: ['1873'] }),
        s('muslim_parsi_sikh', 'Muslim, Parsi and Sikh reform; Theosophical Society', ['Sir Syed Ahmad Khan|Syed Ahmad Khan', 'Aligarh', 'Theosophical Society', 'Annie Besant', '~Rahnumai Mazdayasnan Sabha', '~Singh Sabha', '~Deoband'], { comparisons: ['Organisation — founder — year — place'], mcqs: 8 }),
      ],
    },
    {
      id: 'early_resistance',
      title: 'Peasant and Tribal Uprisings (outside the organised national movement)',
      description: 'Civil, peasant and tribal revolts from the late 18th to the early 20th century. The Revolt of 1857 is covered in Freedom Struggle.',
      weight: 'medium',
      scope: 'extended',
      seeAlso: ['general_awareness.history.freedom_struggle#revolt_1857'],
      objectives: ['Match uprisings with region, leader and period'],
      timeline: ['1763–1800 Sanyasi–Fakir rebellion', '1817 Paika rebellion', '1855–1856 Santhal rebellion', '1859–1860 Indigo revolt', '1875 Deccan riots', '1899–1900 Munda Ulgulan'],
      personalities: ['Sidhu and Kanhu', 'Birsa Munda', 'Bakshi Jagabandhu', 'Titu Mir'],
      mcqFocus: 'Uprising–region–leader matching.',
      sections: [
        s('tribal', 'Tribal uprisings', ['Santhal rebellion|Santhal', 'Sidhu|Kanhu', 'Birsa Munda|Ulgulan', 'Kol uprising|Kol', '~Khasi|Bhil', '~Paika rebellion|Paika'], { comparisons: ['Uprising — region — leader — years'] }),
        s('peasant', 'Peasant and civil uprisings', ['Sanyasi rebellion|Sanyasi', 'Indigo revolt|Indigo', 'Deccan riots', '~Pabna', '~Wahabi|Titu Mir', '~Moplah|Mappila'], { comparisons: ['Movement — region — cause — years'] }),
      ],
    },
    {
      id: 'revision',
      title: 'Modern India — Revision',
      description: 'High-frequency tables and chronology of the colonial period.',
      weight: 'high',
      scope: 'common',
      objectives: ['Revise the most tested colonial-era facts in tables'],
      sections: [
        s('battles_treaties', 'Battles and treaties (table)', ['Battle of Plassey|Plassey', 'Battle of Buxar|Buxar', 'Treaty of Allahabad', 'Treaty of Seringapatam|Seringapatam', 'Treaty of Salbai|Salbai', 'Treaty of Amritsar'], { comparisons: ['Battle/treaty — year — parties — result'], mcqs: 8 }),
        s('firsts', 'Firsts and frequently tested facts', ['Warren Hastings', 'Lord William Bentinck|Bentinck', 'Lord Canning|Canning', 'railway|railways', 'Hicky’s Bengal Gazette|Bengal Gazette'], { comparisons: ['First … — person/event — year'], mcqs: 8 }),
      ],
    },
  ],
};
