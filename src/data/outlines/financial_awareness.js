// Curated outline — Financial Awareness.          STATUS: DRAFT (not served).
//
// Attached to the existing topic `banking_awareness.financial_awareness`.
// Exams: IBPS Clerk & SBI Clerk Mains ("General / Financial Awareness"),
// IBPS PO & SBI PO Mains ("General / Economy / Banking Awareness"),
// IBPS RRB PO/Clerk Mains (General Awareness). Verify per notification.
//
// Government schemes live in their own topic (banking_awareness.
// government_schemes, see banking_general_awareness.js) and are NOT repeated
// here. Priority sector lending is in Banking Awareness.

export const financialAwarenessOutline = {
  id: 'financial_awareness',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Financial Awareness',
  chapters: [
    {
      id: 'economy_basics',
      topicId: 'banking_awareness.financial_awareness',
      title: 'Indian Economy: Basic Concepts',
      weight: 'high',
      sections: [
        { id: 'national_income', title: 'National income: GDP, GNP, NNP, GVA and how they are measured' },
        { id: 'inflation', title: 'Inflation: CPI, WPI, types, causes and control' },
        { id: 'sectors', title: 'Sectors of the economy and key indicators' },
        { id: 'money_supply', title: 'Money supply measures (M0–M4)' },
      ],
    },
    {
      id: 'fiscal',
      topicId: 'banking_awareness.financial_awareness',
      title: 'Budget, Fiscal Policy and Taxation',
      weight: 'high',
      sections: [
        { id: 'budget', title: 'Union Budget: components, revenue and capital accounts' },
        { id: 'deficits', title: 'Fiscal, revenue and primary deficit; FRBM Act' },
        { id: 'gst', title: 'GST: structure, GST Council, rates framework' },
        { id: 'direct_taxes', title: 'Direct taxes and tax terms' },
        { id: 'finance_commission', title: 'Finance Commission and Centre–State finances', origin: 'recommended' },
      ],
    },
    {
      id: 'markets',
      topicId: 'banking_awareness.financial_awareness',
      title: 'Financial Markets',
      weight: 'high',
      sections: [
        { id: 'money_market', title: 'Money market: call money, T-bills, CPs, CDs, repo market' },
        { id: 'capital_market', title: 'Capital market: primary and secondary markets, IPO, FPO' },
        { id: 'exchanges', title: 'Stock exchanges, indices (Sensex, Nifty), depositories' },
        { id: 'mutual_funds', title: 'Mutual funds, bonds and debentures, ETFs' },
        { id: 'forex', title: 'Foreign exchange: exchange rates, FDI, FPI, balance of payments' },
      ],
    },
    {
      id: 'insurance_pension',
      topicId: 'banking_awareness.financial_awareness',
      title: 'Insurance and Pension',
      weight: 'medium',
      sections: [
        { id: 'insurance', title: 'Insurance sector: IRDAI, life and general insurance, key terms' },
        { id: 'pension', title: 'Pension: PFRDA, NPS and its features' },
      ],
    },
    {
      id: 'international',
      topicId: 'banking_awareness.financial_awareness',
      title: 'International Financial Institutions',
      weight: 'medium',
      sections: [
        { id: 'imf_wb', title: 'IMF and World Bank Group: structure, functions, headquarters' },
        { id: 'regional', title: 'ADB, AIIB, New Development Bank' },
        { id: 'others', title: 'WTO, BIS, FATF and other bodies' },
        { id: 'reports', title: 'Important reports and indices and who publishes them', origin: 'recommended' },
      ],
    },
  ],
};
