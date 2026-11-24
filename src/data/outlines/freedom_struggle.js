// Curated outline — Indian Freedom Struggle (1857 – 1947): the ORGANISED
// NATIONAL MOVEMENT.
//
// STATUS: DRAFT, awaiting review. Not served to students until approved.
// Unit: `general_awareness.history.freedom_struggle`. Exams: same as all
// History units (RRB NTPC, Group D, ALP, JE; SSC CGL, CHSL, MTS, GD, CPO);
// not Banking. RRB notifications name "Indian National Movement" explicitly.
//
// BOUNDARY with Modern Indian History (`…history.modern`): see the header of
// modern_india.js. This outline starts with the Revolt of 1857 and covers
// the national movement, Crown-era constitutional reforms (1858–1947),
// independence and partition. Social reform, the economic impact of British
// rule and pre-1857/tribal uprisings stay in Modern History (cross-
// referenced with `seeAlso`). The making of the Constitution (Constituent
// Assembly) is in Polity.
//
// scope: 'common' / 'extended' as in the Medieval outline.
// Syllabus references: RRB CEN and SSC notifications (General Awareness);
// NCERT Class 8 "Our Pasts – III"; NCERT Class 12 "Themes in Indian History
// – Part III"; Bipan Chandra et al., "India’s Struggle for Independence";
// Bipan Chandra, "History of Modern India" (old NCERT).

const s = (id, title, concepts, extra = {}) => ({ id, title, concepts, ...extra });
const sub = (id, title, children) => ({ id, title, children });

export const freedomStruggleOutline = {
  unitId: 'general_awareness.history.freedom_struggle',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Indian Freedom Struggle',
  sourceRefs: [
    { title: 'RRB CEN notifications (NTPC, Group D, ALP, JE): "History of India and Indian National Movement"' },
    { title: 'SSC CGL, CHSL, MTS, GD, CPO notifications: General Awareness syllabus' },
    { title: 'NCERT Class 8, Our Pasts – III' },
    { title: 'NCERT Class 12, Themes in Indian History – Part III' },
    { title: 'Bipan Chandra et al., India’s Struggle for Independence' },
  ],
  chapters: [
    {
      id: 'revolt_1857',
      title: 'The Revolt of 1857',
      description: 'Causes, centres and leaders, suppression and consequences of the revolt.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.modern#early_resistance', 'general_awareness.history.modern#british_expansion'],
      objectives: ['Explain the causes of the revolt', 'Match centres with leaders and British commanders', 'State the consequences, including the Government of India Act 1858'],
      timeline: ['29 March 1857 Mangal Pandey at Barrackpore', '10 May 1857 Meerut', '1858 Queen’s Proclamation and Government of India Act'],
      personalities: ['Mangal Pandey', 'Bahadur Shah Zafar', 'Rani Lakshmibai', 'Nana Saheb', 'Tantia Tope', 'Begum Hazrat Mahal', 'Kunwar Singh', 'Lord Canning'],
      mcqFocus: 'Centre–leader–British officer matching (very frequent).',
      sections: [
        s('causes', 'Causes of the revolt', ['political causes|doctrine of lapse', 'economic causes', 'social and religious causes', 'military causes', 'greased cartridges|Enfield rifle'], { mcqs: 6 }),
        s('centres_leaders', 'Centres, leaders and the course of the revolt', ['Mangal Pandey', 'Meerut', 'Bahadur Shah Zafar|Bahadur Shah II', 'Rani Lakshmibai|Jhansi', 'Nana Saheb|Kanpur', 'Begum Hazrat Mahal|Lucknow', 'Kunwar Singh', 'Tantia Tope'], { comparisons: ['Centre — Indian leader — British officer'], facts: ['1857'], mcqs: 8 }),
        s('consequences', 'Suppression, nature and consequences', ['Government of India Act 1858|Act of 1858', 'Queen’s Proclamation|Queen Victoria', 'Viceroy', 'Lord Canning|Canning', '~first war of independence|V. D. Savarkar', '~end of the Company'], { facts: ['1858'] }),
      ],
    },
    {
      id: 'rise_nationalism',
      title: 'Rise of Nationalism and the Indian National Congress',
      description: 'Factors behind nationalism, early political associations, the founding of the INC and the Moderate phase (1885–1905).',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.history.modern#reform_movements', 'general_awareness.history.modern#economy_impact'],
      objectives: ['Explain the factors behind modern nationalism', 'Recall the founding of the INC', 'Describe the Moderates’ methods and the drain theory'],
      timeline: ['1876 Indian Association', '1885 First INC session, Bombay', '1901 Poverty and Un-British Rule in India'],
      personalities: ['A. O. Hume', 'W. C. Bonnerjee', 'Dadabhai Naoroji', 'Gopal Krishna Gokhale', 'Surendranath Banerjee', 'Pherozeshah Mehta'],
      mcqFocus: 'First session details; association–founder; Moderate leaders.',
      sections: [
        s('factors_associations', 'Factors behind nationalism and early associations', ['nationalism', 'Indian Association', 'Surendranath Banerjee', 'Poona Sarvajanik Sabha', '~British Indian Association', '~Madras Mahajan Sabha', '~Ilbert Bill'], { comparisons: ['Association — founder — year — place'] }),
        s('inc_founding', 'Founding of the Indian National Congress', ['Indian National Congress|INC', 'A. O. Hume|Allan Octavian Hume', 'W. C. Bonnerjee', 'Bombay', '~safety valve', '~Gokuldas Tejpal'], { facts: ['1885'], mcqs: 6 }),
        s('moderates', 'The Moderates and the drain theory', ['Moderates', 'Dadabhai Naoroji', 'Gopal Krishna Gokhale|Gokhale', 'drain theory|drain of wealth', 'petitions|constitutional methods', '~Poverty and Un-British Rule in India'], {}),
      ],
    },
    {
      id: 'extremist_swadeshi',
      title: 'Partition of Bengal, Swadeshi and the Extremists (1905–1911)',
      description: 'Partition of Bengal, the Swadeshi movement, the Surat split, the Muslim League and early revolutionaries.',
      weight: 'high',
      scope: 'common',
      objectives: ['Explain the partition of Bengal and the Swadeshi response', 'Compare Moderates and Extremists', 'Recall the Surat split, Muslim League and Morley–Minto reforms'],
      timeline: ['1905 Partition of Bengal', '1906 Muslim League founded', '1907 Surat split', '1909 Morley–Minto Reforms', '1911 Partition annulled; capital to Delhi announced', '1913 Ghadar Party'],
      personalities: ['Lord Curzon', 'Bal Gangadhar Tilak', 'Lala Lajpat Rai', 'Bipin Chandra Pal', 'Aurobindo Ghosh', 'Khudiram Bose', 'Lala Har Dayal'],
      mcqFocus: 'Lal–Bal–Pal; Surat 1907; revolutionary groups and founders.',
      sections: [
        s('partition_swadeshi', 'Partition of Bengal and the Swadeshi movement', ['Partition of Bengal', 'Lord Curzon|Curzon', 'Swadeshi', 'boycott', 'national education', '~Bande Mataram'], { facts: ['1905', '1911'] }),
        s('extremists_surat', 'Extremists and the Surat split', ['Extremists', 'Bal Gangadhar Tilak|Tilak', 'Lala Lajpat Rai', 'Bipin Chandra Pal', 'Lal-Bal-Pal|Lal Bal Pal', 'Surat split|Surat'], { comparisons: ['Moderates vs Extremists (goals, methods, leaders)'], facts: ['1907'] }),
        s('league_morley_minto', 'Muslim League and the Morley–Minto Reforms', ['Muslim League|All India Muslim League', 'Dhaka', 'Aga Khan', 'Morley-Minto Reforms|Indian Councils Act 1909', 'separate electorates'], { facts: ['1906', '1909'] }),
        s('revolutionaries_1', 'Revolutionary activities (first phase) and the Ghadar Party', ['Khudiram Bose', 'Anushilan Samiti', 'Ghadar Party|Ghadar', 'Lala Har Dayal', '~Abhinav Bharat|Savarkar', '~Alipore Bomb Case|Aurobindo', '~Komagata Maru'], { mcqs: 6 }),
      ],
    },
    {
      id: 'home_rule_rowlatt',
      title: 'Home Rule, Lucknow Pact and Jallianwala Bagh (1914–1919)',
      description: 'The national movement during the First World War up to the Rowlatt Act and Jallianwala Bagh.',
      weight: 'high',
      scope: 'common',
      objectives: ['Explain the Home Rule Leagues and Lucknow Pact', 'Recall the August Declaration and Montagu–Chelmsford reforms', 'Describe the Rowlatt Act and Jallianwala Bagh massacre'],
      timeline: ['1916 Home Rule Leagues', '1916 Lucknow Pact', '1917 August (Montagu) Declaration', '1919 Rowlatt Act', '13 April 1919 Jallianwala Bagh', '1919 Government of India Act'],
      personalities: ['Bal Gangadhar Tilak', 'Annie Besant', 'Reginald Dyer', 'Michael O’Dwyer', 'Udham Singh'],
      mcqFocus: 'Dates; Home Rule leaders; Hunter Committee; returned honours.',
      sections: [
        s('home_rule_lucknow', 'Home Rule Leagues and the Lucknow Pact', ['Home Rule League|Home Rule', 'Tilak', 'Annie Besant', 'Lucknow Pact', '~reunion of Congress|Moderates and Extremists'], { facts: ['1916'] }),
        s('rowlatt_jallianwala', 'Rowlatt Act and the Jallianwala Bagh massacre', ['Rowlatt Act', 'Rowlatt Satyagraha', 'Jallianwala Bagh', 'General Dyer|Reginald Dyer', 'Hunter Committee', '~Rabindranath Tagore|knighthood', '~Udham Singh'], { facts: ['13 April 1919'], mcqs: 8 }),
      ],
    },
    {
      id: 'gandhian_era',
      title: 'The Gandhian Era (1917–1942)',
      description: 'Gandhi’s early satyagrahas and the three mass movements, with the events between them.',
      weight: 'high',
      scope: 'common',
      objectives: ['Sequence Gandhi’s movements with causes, events and outcomes', 'Explain the Simon Commission, Nehru Report and Round Table Conferences', 'Explain the Poona Pact and Quit India'],
      timeline: ['1917 Champaran', '1918 Kheda and Ahmedabad', '1920 Non-Cooperation', '1922 Chauri Chaura', '1928 Simon Commission in India', '1929 Lahore: Purna Swaraj', '12 March–6 April 1930 Dandi March', '1931 Gandhi–Irwin Pact', '1932 Poona Pact', '8 August 1942 Quit India resolution'],
      personalities: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Ali brothers', 'C. R. Das', 'Motilal Nehru', 'Lala Lajpat Rai', 'B. R. Ambedkar', 'Lord Irwin'],
      mcqFocus: 'Movement–year–cause–withdrawal; INC session decisions; pacts.',
      sections: [
        s('early_satyagrahas', 'Early satyagrahas: Champaran, Kheda and Ahmedabad', ['Champaran', 'indigo|tinkathia', 'Kheda', 'Ahmedabad mill strike|Ahmedabad', '~Rajkumar Shukla', '~Sardar Patel|Vallabhbhai Patel', '~South Africa'], { comparisons: ['Satyagraha — year — issue'], facts: ['1917'] }),
        sub('non_cooperation', 'Non-Cooperation and Khilafat', [
          s('movement', 'The Non-Cooperation and Khilafat movements', ['Non-Cooperation Movement|Non-Cooperation', 'Khilafat Movement|Khilafat', 'Ali brothers|Shaukat Ali', 'boycott', 'Nagpur session', '~Tilak Swaraj Fund'], { facts: ['1920'] }),
          s('chauri_chaura', 'Chauri Chaura and the withdrawal', ['Chauri Chaura', 'withdrawal|withdrew', 'Gorakhpur'], { facts: ['1922'], mcqs: 4 }),
        ]),
        s('swaraj_simon', 'Swaraj Party, Simon Commission and Nehru Report', ['Swaraj Party|Swarajists', 'C. R. Das|Chittaranjan Das', 'Motilal Nehru', 'Simon Commission', 'Lala Lajpat Rai', 'Nehru Report', '~Jinnah’s Fourteen Points|Fourteen Points'], { facts: ['1928'] }),
        sub('civil_disobedience', 'Civil Disobedience', [
          s('purna_swaraj_dandi', 'Purna Swaraj and the Dandi March', ['Purna Swaraj', 'Lahore session', 'Dandi March|Salt Satyagraha', 'Civil Disobedience Movement|Civil Disobedience', '~Dharasana|Sarojini Naidu', '~Khudai Khidmatgar|Khan Abdul Ghaffar Khan'], { facts: ['1929', '1930'] }),
          s('pacts_rtc', 'Gandhi–Irwin Pact, Round Table Conferences and Poona Pact', ['Gandhi-Irwin Pact|Gandhi–Irwin Pact|Delhi Pact', 'Round Table Conference', 'Communal Award|Ramsay MacDonald', 'Poona Pact', 'B. R. Ambedkar|Ambedkar'], { comparisons: ['Round Table Conference — year — Congress participation'], facts: ['1931', '1932'] }),
        ]),
        s('quit_india', 'Quit India Movement', ['Quit India Movement|Quit India', 'Do or Die', 'Gowalia Tank|August Kranti Maidan', '~parallel governments|Ballia|Satara|Tamluk', '~Aruna Asaf Ali', '~Usha Mehta|Congress Radio'], { facts: ['1942'], mcqs: 6 }),
      ],
    },
    {
      id: 'revolutionaries',
      title: 'Revolutionary Nationalism (second phase)',
      description: 'HRA/HSRA, Bhagat Singh and his associates, and revolutionary action in Bengal.',
      weight: 'high',
      scope: 'common',
      objectives: ['Match revolutionary events with leaders and years'],
      timeline: ['1925 Kakori train action', '1928 HSRA formed; Saunders shot', '1929 Central Legislative Assembly bombing', '1930 Chittagong armoury raid', '23 March 1931 Bhagat Singh, Rajguru and Sukhdev executed'],
      personalities: ['Ram Prasad Bismil', 'Ashfaqulla Khan', 'Chandrashekhar Azad', 'Bhagat Singh', 'Batukeshwar Dutt', 'Surya Sen'],
      mcqFocus: 'Event–year–revolutionary matching.',
      sections: [
        s('hra_hsra', 'HRA, Kakori and the HSRA', ['Hindustan Republican Association|HRA', 'Kakori', 'Ram Prasad Bismil', 'Ashfaqulla Khan', 'Hindustan Socialist Republican Association|HSRA', 'Chandrashekhar Azad'], { facts: ['1925'] }),
        s('bhagat_singh', 'Bhagat Singh and his associates', ['Bhagat Singh', 'Rajguru', 'Sukhdev', 'Batukeshwar Dutt', 'Central Legislative Assembly|Assembly bombing', 'Lahore Conspiracy Case', '~Saunders'], { facts: ['1931'], mcqs: 6 }),
        s('bengal', 'Revolutionaries in Bengal: the Chittagong armoury raid', ['Chittagong armoury raid|Chittagong', 'Surya Sen|Masterda', '~Pritilata Waddedar', '~Kalpana Datta'], { facts: ['1930'], mcqs: 4 }),
      ],
    },
    {
      id: 'constitutional_reforms',
      title: 'Constitutional Reforms under the Crown (1858–1947)',
      description: 'Acts and reforms from 1858 to 1947. Company-era Acts are in Modern History; Constitution making is in Polity.',
      weight: 'high',
      scope: 'extended',
      seeAlso: ['general_awareness.history.modern#company_acts', 'general_awareness.polity.making_constitution'],
      objectives: ['State the key provisions of each Act from 1858 to 1947'],
      timeline: ['1858 Government of India Act', '1861 Indian Councils Act', '1892 Indian Councils Act', '1909 Indian Councils Act (Morley–Minto)', '1919 Government of India Act (Montagu–Chelmsford)', '1935 Government of India Act', '1947 Indian Independence Act'],
      mcqFocus: 'Act–provision (dyarchy, separate electorates, provincial autonomy, federation).',
      sections: [
        s('acts_1858_1909', 'Acts of 1858, 1861, 1892 and 1909', ['Government of India Act 1858|Act of 1858', 'Secretary of State for India|Secretary of State', 'Indian Councils Act 1861|1861', 'portfolio system', 'Indian Councils Act 1892|1892', 'Morley-Minto Reforms|Indian Councils Act 1909', 'separate electorates'], { comparisons: ['Act — year — key provisions'] }),
        s('acts_1919_1935', 'Montagu–Chelmsford Reforms (1919) and the Government of India Act 1935', ['Montagu-Chelmsford Reforms|Montagu–Chelmsford|Government of India Act 1919', 'dyarchy|diarchy', 'bicameral', 'Government of India Act 1935|Act of 1935', 'provincial autonomy', 'federation|All-India Federation', '~Federal Court|Reserve Bank of India'], { comparisons: ['1919 Act vs 1935 Act'], mcqs: 8 }),
      ],
    },
    {
      id: 'ww2_ina',
      title: 'Second World War, Subhas Chandra Bose and the INA',
      description: 'Offers and missions during the war, Bose and the Indian National Army, and post-war upsurge.',
      weight: 'high',
      scope: 'common',
      objectives: ['Explain the August Offer, Individual Satyagraha and Cripps Mission', 'Describe Bose, the Forward Bloc and the INA', 'Recall the INA trials and RIN mutiny'],
      timeline: ['1939 Forward Bloc', '1940 August Offer', '1940 Individual Satyagraha', '1942 Cripps Mission', '1943 Azad Hind government (Singapore)', '1945 INA trials (Red Fort)', '1946 RIN mutiny'],
      personalities: ['Subhas Chandra Bose', 'Rash Behari Bose', 'Mohan Singh', 'Captain Lakshmi Sahgal', 'Stafford Cripps', 'Vinoba Bhave'],
      mcqFocus: 'Year–event; INA leaders; Rani of Jhansi Regiment.',
      sections: [
        s('wartime_politics', 'August Offer, Individual Satyagraha and the Cripps Mission', ['August Offer', 'Linlithgow|Lord Linlithgow', 'Individual Satyagraha', 'Vinoba Bhave', 'Cripps Mission|Stafford Cripps', '~post-dated cheque'], { facts: ['1940', '1942'] }),
        s('bose_ina', 'Subhas Chandra Bose and the Indian National Army', ['Subhas Chandra Bose|Netaji', 'Forward Bloc', 'Indian National Army|Azad Hind Fauj|INA', 'Azad Hind', 'Rash Behari Bose', 'Rani of Jhansi Regiment|Lakshmi Sahgal', '~Mohan Singh', '~Delhi Chalo'], { facts: ['1943'], mcqs: 8 }),
        s('postwar_upsurge', 'INA trials and the RIN mutiny', ['INA trials|Red Fort trials', 'Royal Indian Navy mutiny|RIN mutiny|naval mutiny', 'Bombay', '~Bhulabhai Desai'], { facts: ['1946'], mcqs: 4 }),
      ],
    },
    {
      id: 'independence_partition',
      title: 'Towards Independence and Partition (1945–1947)',
      description: 'From the Shimla Conference to the Indian Independence Act, partition and the integration of states.',
      weight: 'high',
      scope: 'common',
      seeAlso: ['general_awareness.polity.making_constitution'],
      objectives: ['Sequence the events from 1945 to August 1947', 'Explain the Cabinet Mission and Mountbatten Plan', 'Describe integration of princely states'],
      timeline: ['1945 Wavell Plan and Shimla Conference', '1946 Cabinet Mission', '16 August 1946 Direct Action Day', '2 September 1946 Interim Government', '3 June 1947 Mountbatten Plan', 'July 1947 Indian Independence Act', '15 August 1947 Independence'],
      personalities: ['Lord Wavell', 'Lord Mountbatten', 'Jawaharlal Nehru', 'Muhammad Ali Jinnah', 'Sardar Vallabhbhai Patel', 'V. P. Menon', 'Cyril Radcliffe'],
      mcqFocus: 'Plan–year–content; boundary commission; integration of states.',
      sections: [
        s('wavell_cabinet', 'Wavell Plan, Cabinet Mission and the Interim Government', ['Wavell Plan|Shimla Conference', 'Cabinet Mission', 'Direct Action Day', 'Interim Government', '~Pethick-Lawrence|A. V. Alexander'], { facts: ['1946'] }),
        s('mountbatten_partition', 'Mountbatten Plan, Indian Independence Act and partition', ['Mountbatten Plan|3 June Plan', 'Indian Independence Act', 'partition', 'Radcliffe Line|Cyril Radcliffe', '~Boundary Commission'], { facts: ['15 August 1947'], mcqs: 6 }),
        s('integration', 'Integration of princely states', ['princely states', 'Sardar Vallabhbhai Patel|Sardar Patel', 'V. P. Menon', 'Instrument of Accession', '~Junagadh|Hyderabad|Kashmir', '~Operation Polo'], { mcqs: 4 }),
      ],
    },
    {
      id: 'other_streams',
      title: 'Other Streams of the National Movement',
      description: 'Women, workers and peasants, depressed classes and the nationalist press.',
      weight: 'medium',
      scope: 'extended',
      seeAlso: ['general_awareness.history.modern#reform_movements'],
      objectives: ['Recall organisations of workers, peasants and depressed classes', 'Match nationalist newspapers with founders'],
      timeline: ['1920 AITUC', '1927 Mahad Satyagraha', '1936 All India Kisan Sabha'],
      personalities: ['Sarojini Naidu', 'Aruna Asaf Ali', 'N. M. Joshi', 'Lala Lajpat Rai', 'Sahajanand Saraswati', 'B. R. Ambedkar'],
      mcqFocus: 'Organisation–founder–year; newspaper–founder.',
      sections: [
        s('women_workers_peasants', 'Women, workers and peasants in the movement', ['Sarojini Naidu', 'AITUC|All India Trade Union Congress', 'All India Kisan Sabha|Kisan Sabha', 'Bardoli Satyagraha|Bardoli', '~Tebhaga', '~Eka movement'], { comparisons: ['Organisation/movement — year — leader'] }),
        s('depressed_classes', 'Depressed classes and Dr B. R. Ambedkar', ['B. R. Ambedkar|Ambedkar', 'Mahad Satyagraha|Mahad', 'Bahishkrit Hitakarini Sabha', 'Harijan Sevak Sangh', '~Poona Pact'], { mcqs: 4 }),
        s('press', 'Nationalist newspapers and journals', ['Kesari', 'Young India', 'Harijan', 'Amrita Bazar Patrika', 'The Hindu', '~Indian Mirror', '~Bombay Chronicle'], { comparisons: ['Newspaper — founder/editor — language'], mcqs: 6 }),
      ],
    },
    {
      id: 'revision',
      title: 'Freedom Struggle — Revision',
      description: 'INC sessions, slogans, personalities and chronology.',
      weight: 'high',
      scope: 'common',
      objectives: ['Revise the most tested national-movement facts in tables'],
      sections: [
        s('inc_sessions', 'Important INC sessions and presidents (table)', ['first session|Bombay', 'Surat', 'Lucknow', 'Lahore session|Purna Swaraj', 'Karachi session|Fundamental Rights', '~Haripura|Tripuri'], { comparisons: ['Year — place — president — significance'], mcqs: 8 }),
        s('slogans_personalities', 'Slogans, titles and personalities', ['Swaraj is my birthright', 'Do or Die', 'Inquilab Zindabad', 'Jai Hind', 'Delhi Chalo', '~Lokmanya|Deshbandhu|Netaji'], { comparisons: ['Slogan/title — person'], mcqs: 8 }),
        s('chronology', 'Chronology of the national movement', ['1857', '1885', '1905', '1919', '1920', '1930', '1942', '1947'], { comparisons: ['Year — event'], mcqs: 8 }),
      ],
    },
  ],
};
