// Curated outline — Banking Awareness.            STATUS: DRAFT (not served).
//
// Exams (Banking awareness is tested in MAINS, not prelims — verify against
// each year's notification):
//   IBPS PO, SBI PO        → "General / Economy / Banking Awareness"
//   IBPS Clerk, SBI Clerk  → "General / Financial Awareness"
//   IBPS RRB PO / Clerk    → "General Awareness"
// IBPS SO (IT Officer) is not attached: its app syllabus has no Banking
// Awareness subject (Professional Knowledge instead).
//
// Chapters map to existing syllabus topics (`topicId`), nothing duplicated.
// Section origin: 'curated' (default) = common in these exams' syllabi;
// 'recommended' = additional, useful but not a confirmed requirement.
// Rates and numbers that change (repo rate, CRR, insurance limits…) must be
// taken from the latest RBI/Government sources at generation time.

export const bankingAwarenessOutline = {
  id: 'banking_awareness',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Banking Awareness',
  chapters: [
    // ── banking_awareness.banking_terms ("Banking Terms & Services") ──
    {
      id: 'banking_system',
      topicId: 'banking_awareness.banking_terms',
      title: 'Indian Banking System',
      weight: 'high',
      sections: [
        { id: 'history', title: 'History of banking in India and bank nationalisation (1969, 1980)' },
        { id: 'structure', title: 'Structure: scheduled/non-scheduled, commercial, cooperative and Regional Rural Banks' },
        { id: 'differentiated_banks', title: 'Small Finance Banks, Payments Banks and Local Area Banks' },
        { id: 'mergers', title: 'Bank mergers and consolidation of public sector banks' },
        { id: 'nbfcs', title: 'NBFCs, NBFC-MFIs and how they differ from banks' },
      ],
    },
    {
      id: 'products',
      topicId: 'banking_awareness.banking_terms',
      title: 'Bank Accounts, Deposits and Loans',
      weight: 'high',
      sections: [
        { id: 'accounts', title: 'Types of accounts and deposits: savings, current, fixed, recurring' },
        { id: 'kyc', title: 'KYC, CKYC and account opening norms' },
        { id: 'loans', title: 'Loans and advances: types, secured/unsecured, retail and corporate credit' },
        { id: 'psl', title: 'Priority Sector Lending: categories and targets' },
        { id: 'negotiable_instruments', title: 'Cheques, demand drafts and other negotiable instruments' },
      ],
    },
    {
      id: 'payments',
      topicId: 'banking_awareness.banking_terms',
      title: 'Payment Systems and Digital Banking',
      weight: 'high',
      sections: [
        { id: 'neft_rtgs_imps', title: 'NEFT, RTGS and IMPS' },
        { id: 'upi_npci', title: 'NPCI and its products: UPI, RuPay, AePS, NACH, BBPS, FASTag' },
        { id: 'cards_cts', title: 'Cards, ATMs (white-label ATMs) and Cheque Truncation System' },
        { id: 'cbdc', title: 'Digital rupee (CBDC) and digital payment security' },
      ],
    },
    {
      id: 'concepts',
      topicId: 'banking_awareness.banking_terms',
      title: 'Important Banking Terms and Concepts',
      weight: 'high',
      sections: [
        { id: 'npa', title: 'NPAs: classification, provisioning and resolution' },
        { id: 'capital', title: 'Capital adequacy, CAR/CRAR and Basel norms' },
        { id: 'financial_inclusion', title: 'Financial inclusion: PMJDY, BC model, banking outlets' },
        { id: 'glossary', title: 'Banking glossary: frequently asked terms' },
        { id: 'bancassurance', title: 'Bancassurance, wealth management and other services', origin: 'recommended' },
      ],
    },
    // ── banking_awareness.rbi_monetary_policy ──
    {
      id: 'rbi',
      topicId: 'banking_awareness.rbi_monetary_policy',
      title: 'Reserve Bank of India',
      weight: 'high',
      sections: [
        { id: 'history', title: 'Establishment (1935), nationalisation (1949) and organisation' },
        { id: 'functions', title: 'Functions: banker to government and banks, currency issue, regulator' },
        { id: 'subsidiaries', title: 'RBI subsidiaries and bodies (DICGC, BRBNM, ReBIT and others)' },
        { id: 'currency', title: 'Currency management: notes, coins, printing presses and mints' },
      ],
    },
    {
      id: 'monetary_policy',
      topicId: 'banking_awareness.rbi_monetary_policy',
      title: 'Monetary Policy',
      weight: 'high',
      sections: [
        { id: 'mpc', title: 'Monetary Policy Committee and inflation targeting framework' },
        { id: 'quantitative', title: 'Quantitative tools: CRR, SLR, repo, reverse repo, SDF, MSF, bank rate, OMO' },
        { id: 'qualitative', title: 'Qualitative tools and the Liquidity Adjustment Facility' },
        { id: 'transmission', title: 'Policy transmission, MCLR and external benchmark lending rates' },
      ],
    },
    {
      id: 'regulators',
      topicId: 'banking_awareness.rbi_monetary_policy',
      title: 'Financial Regulators and Development Institutions',
      weight: 'medium',
      sections: [
        { id: 'regulators', title: 'SEBI, IRDAI, PFRDA: roles and powers' },
        { id: 'dfis', title: 'NABARD, SIDBI, EXIM Bank, NHB, MUDRA, NaBFID' },
      ],
    },
    // ── banking_awareness.acts_regulations ──
    {
      id: 'laws',
      topicId: 'banking_awareness.acts_regulations',
      title: 'Banking Laws',
      weight: 'high',
      sections: [
        { id: 'rbi_br_acts', title: 'RBI Act 1934 and Banking Regulation Act 1949' },
        { id: 'ni_act', title: 'Negotiable Instruments Act 1881 (including cheque dishonour)' },
        { id: 'recovery', title: 'SARFAESI Act 2002, DRTs and the Insolvency and Bankruptcy Code 2016' },
        { id: 'pmla_fema', title: 'PMLA 2002, FEMA 1999 and the Payment and Settlement Systems Act 2007' },
        { id: 'deposit_insurance', title: 'Deposit insurance (DICGC Act 1961)' },
      ],
    },
    {
      id: 'regulation',
      topicId: 'banking_awareness.acts_regulations',
      title: 'Prudential Regulation and Customer Protection',
      weight: 'medium',
      sections: [
        { id: 'pca', title: 'Prompt Corrective Action framework' },
        { id: 'ombudsman', title: 'RBI Integrated Ombudsman Scheme and grievance redress' },
        { id: 'fraud_cyber', title: 'Bank frauds, cyber security and customer liability rules', origin: 'recommended' },
      ],
    },
  ],
};
