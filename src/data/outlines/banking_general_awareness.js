// Curated outline — General Awareness for Banking exams.
//                                                 STATUS: DRAFT (not served).
//
// Attached to existing topics of the Banking "General Awareness" subject:
// banking_awareness.static_gk, banking_awareness.government_schemes,
// banking_awareness.current_affairs. Exams: Mains of IBPS PO, IBPS Clerk,
// IBPS RRB PO/Clerk, SBI PO, SBI Clerk (verify per notification).
//
// Current affairs: the outline gives only the STRUCTURE. Its content changes
// every month and must come from a dated, verified source — AI models do not
// know recent events reliably, so these sections are flagged
// `requiresVerifiedSource` and must not be generated from the AI alone.

export const bankingGeneralAwarenessOutline = {
  id: 'banking_general_awareness',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'General Awareness (Banking)',
  chapters: [
    // ── banking_awareness.static_gk ──
    {
      id: 'world',
      topicId: 'banking_awareness.static_gk',
      title: 'World: Countries, Capitals and Currencies',
      weight: 'high',
      sections: [
        { id: 'capitals_currencies', title: 'Countries, capitals and currencies' },
        { id: 'parliaments', title: 'Parliaments and important places of countries', origin: 'recommended' },
      ],
    },
    {
      id: 'india',
      topicId: 'banking_awareness.static_gk',
      title: 'India: States and Geography Facts',
      weight: 'high',
      sections: [
        { id: 'states', title: 'States and union territories: capitals, folk dances, festivals' },
        { id: 'parks_dams', title: 'National parks, wildlife sanctuaries, dams and power plants' },
        { id: 'airports_ports', title: 'Airports, ports and stadiums' },
      ],
    },
    {
      id: 'organisations',
      topicId: 'banking_awareness.static_gk',
      title: 'Organisations and Headquarters',
      weight: 'high',
      sections: [
        { id: 'bank_hq', title: 'Banks: headquarters and taglines' },
        { id: 'indian_bodies', title: 'Indian organisations and their headquarters' },
        { id: 'international_bodies', title: 'International organisations and their headquarters' },
      ],
    },
    {
      id: 'misc',
      topicId: 'banking_awareness.static_gk',
      title: 'Important Days, Books, Awards and Sports',
      weight: 'medium',
      sections: [
        { id: 'days', title: 'Important national and international days' },
        { id: 'awards', title: 'Major awards and their fields' },
        { id: 'sports', title: 'Sports: trophies, terms and venues' },
        { id: 'firsts', title: 'Firsts in India' },
      ],
    },
    // ── banking_awareness.government_schemes ──
    {
      id: 'inclusion_security',
      topicId: 'banking_awareness.government_schemes',
      title: 'Financial Inclusion and Social Security Schemes',
      weight: 'high',
      sections: [
        { id: 'inclusion', title: 'PMJDY and other financial inclusion schemes' },
        { id: 'insurance_pension', title: 'PMJJBY, PMSBY, Atal Pension Yojana' },
        { id: 'credit', title: 'Credit schemes: MUDRA, Stand-Up India, PM SVANidhi, KCC' },
      ],
    },
    {
      id: 'sector_schemes',
      topicId: 'banking_awareness.government_schemes',
      title: 'Sector Schemes',
      weight: 'medium',
      sections: [
        { id: 'agri_rural', title: 'Agriculture and rural development schemes' },
        { id: 'housing_infra', title: 'Housing, sanitation and infrastructure schemes' },
        { id: 'women_youth', title: 'Women, child, skill and start-up schemes' },
      ],
    },
    // ── banking_awareness.current_affairs ──
    {
      id: 'current_affairs',
      topicId: 'banking_awareness.current_affairs',
      title: 'Current Affairs (structure only)',
      weight: 'high',
      requiresVerifiedSource: true,
      sections: [
        { id: 'banking_economy', title: 'Banking and economy news' },
        { id: 'national', title: 'National news and appointments' },
        { id: 'international', title: 'International news and summits' },
        { id: 'awards_sports', title: 'Awards, sports and obituaries' },
        { id: 'reports_indices', title: 'Reports and rankings' },
      ],
    },
  ],
};
