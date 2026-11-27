# Banking syllabus hierarchy (generated from src/data/syllabusTrees)

Banking → Exam → Stage/Paper → Section → Subject → Chapter → Topic → Subtopic → Micro-topic.

Verified against official notifications on 2026-11-27. Regenerate with `npm run banking-coverage`; do not edit by hand.

**Status legend.** *official* = printed in the cited notification (stages, section names, questions, marks, time). 
*supplementary* = recommended coverage below an official section (IBPS and SBI print no topic list). 
*draft* = no official section table exists (IBPS RRB Officer Scale-II IT).

## Sources

| Id | Notification | URL | Where | Checked |
|---|---|---|---|---|
| ibps_po_xvi | CRP PO/MT-XVI — Detailed Notification | https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf | D. Structure of Examination (pp. 11–12) | 2026-11-27 |
| ibps_po_xv | CRP PO/MT-XV — Detailed Notification (previous cycle) | https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XV.pdf | p. 11 | 2026-11-27 |
| ibps_csa_xv | CRP CSA-XV (Customer Service Associates) — Detailed Notification | https://www.ibps.in/wp-content/uploads/DetailedNotification_CRP_CSA_XV_Final_for_Website_12.9.2025.pdf | p. 13 | 2026-11-27 |
| ibps_rrb_xiv | CRP RRBs-XIV — Detailed Notification | https://www.ibps.in/wp-content/uploads/CRP-RRBs-XIV_Final_AD-19.9.25.pdf | D. Online Examination Structure (pp. 15–16) | 2026-11-27 |
| ibps_spl_xv | CRP SPL-XV (Specialist Officers) — Detailed Notification | https://www.ibps.in/wp-content/uploads/Detailed-Notification-CRP-SPL-XV_15.7.25.pdf | p. 12 (read from a mirror copy; ibps.in link failed with an SSL error) | 2026-11-27 |
| sbi_po_2026 | CRPD/PO/2026-27/09 — Probationary Officers | http://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf | p. 6 | 2026-11-27 |
| sbi_ja_2026 | CRPD/CR/2026-27/17 — Junior Associates (Customer Support & Sales) | https://sbi.bank.in/webfiles/uploads/files_2627/08/JA_2026_Detailed_Advt_Eng.pdf | pp. 4–5 | 2026-11-27 |
| gate_cs_2026 | GATE 2026 Syllabus — Computer Science and Information Technology (CS) | https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/CS_2026_Syllabus.pdf | — | 2026-11-27 |

## Part 1 — Banking exam master list

| # | Exam | Id | Cycle (source) | Stages | Pattern verified | Default practice level |
|---|---|---|---|---|---|---|
| 1 | IBPS RRB Officer Scale-II (IT) | `ibps_rrb_so_it` | CRP RRBs-XIV — Detailed Notification | Single Level Examination → Common Interview | **no** | hard |
| 2 | IBPS SO IT Officer | `ibps_so_it` | CRP SPL-XV (Specialist Officers) — Detailed Notification | Preliminary Examination → Main Examination → Interview | yes | hard |
| 3 | IBPS PO | `ibps_po` | CRP PO/MT-XVI — Detailed Notification | Preliminary Examination → Main Examination → Descriptive Paper (Essay and Comprehension) → Personality Test and Interview | yes | medium |
| 4 | IBPS Clerk | `ibps_clerk` | CRP CSA-XV (Customer Service Associates) — Detailed Notification | Preliminary Examination → Main Examination | yes | easy |
| 5 | IBPS RRB PO | `ibps_rrb_po` | CRP RRBs-XIV — Detailed Notification | Preliminary Examination → Main Examination → Common Interview | yes | medium |
| 6 | IBPS RRB Clerk | `ibps_rrb_clerk` | CRP RRBs-XIV — Detailed Notification | Preliminary Examination → Main Examination | yes | easy |
| 7 | SBI PO | `sbi_po` | CRPD/PO/2026-27/09 — Probationary Officers | Phase-I: Preliminary Examination → Phase-II: Main Examination (Objective) → Phase-II: Descriptive Test (Communication Skills) → Phase-III: Psychometric Test, Group Exercise and Interview | yes | hard |
| 8 | SBI Clerk | `sbi_clerk` | CRPD/CR/2026-27/17 — Junior Associates (Customer Support & Sales) | Preliminary Examination → Main Examination → Local Language Proficiency Test | yes | medium |

## Part 2 and 3 — Exam-wise and paper-wise hierarchy, with each paper's subjects

### IBPS RRB Officer Scale-II (IT)

> CRP RRBs-XIV states only "a Single Level Examination for Officers Scale II and Officers Scale III", followed by a Common Interview. No section table is printed, so the subjects below are draft coverage, not an official pattern.

**Single Level Examination**

- Draft coverage: professional_it, reasoning, quant, english, hindi, general_awareness, banking_awareness, computer

**Common Interview**

- No objective sections (not practised in the app).

### IBPS SO IT Officer

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| English Language | 50 | 25 | 40 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Reasoning | 50 | 50 | 40 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning |
| Quantitative Aptitude | 50 | 50 | 40 | quant | Data Interpretation; Data Sufficiency; Quantity Comparison; Number Series; Quadratic Equations; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Professional Knowledge | 60 | 60 | 45 | professional_it | Engineering Mathematics; Digital Logic; Computer Organization and Architecture; Programming and Data Structures; Algorithms; Theory of Computation; Compiler Design; Operating Systems; Database Management Systems; Computer Networks; Java and Object-Oriented Programming; Software Engineering; Web Technologies; Information Security; Cryptography; Cyber Security; Core Banking Solutions; ATM and Card Technology; UPI, IMPS, NEFT and RTGS; NPCI and Payment Systems; Cloud Computing; Data Warehousing and Data Mining; Artificial Intelligence and Machine Learning; IT Governance and Audit; IT Risk Management; Banking IT Infrastructure; Disaster Recovery and Business Continuity; Emerging Banking Technologies |

**Interview**

- No objective sections (not practised in the app).

### IBPS PO

Cycle difference: XVI vs XV Mains: 145 → 170 questions; GA 50 → 60 marks; English 40 → 20 marks (source ibps_po_xv).

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| English Language | 30 | 30 | 20 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Quantitative Aptitude | 35 | 30 | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |
| Reasoning Ability | 35 | 40 | 20 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning | 40 | 60 | 45 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning |
| General/ Economy/ Banking Awareness / Digital/ Financial Awareness including RBI circulars | 50 | 60 | 35 | general_awareness, banking_awareness, computer | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes; Digital Banking Technology; Cyber Security |
| English Language | 40 | 20 | 35 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Data Analysis & Interpretation | 40 | 60 | 45 | quant | Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination; Data Sufficiency; Quantity Comparison |

**Descriptive Paper (Essay and Comprehension)**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Essay and Comprehension | 2 | 25 | 30 | english | Descriptive English |

**Personality Test and Interview**

- No objective sections (not practised in the app).

### IBPS Clerk

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| English Language | 30 | 30 | 20 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Numerical Ability | 35 | 35 | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |
| Reasoning Ability | 35 | 35 | 20 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| General/ Financial Awareness | 40 | 50 | 20 | general_awareness, banking_awareness | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes |
| General English | 40 | 40 | 35 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Reasoning Ability | 40 | 60 | 35 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning |
| Quantitative Aptitude | 35 | 50 | 30 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |

### IBPS RRB PO

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning | 40 | 40 | 25 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |
| Quantitative Aptitude | 40 | 40 | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning | 40 | 50 | 30 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning |
| Computer Knowledge | 40 | 20 | 15 | computer | Computer Fundamentals; Software and Operating Systems; MS Office; Database Basics; Networking and Internet; Cyber Security; Digital Banking Technology; Computer Abbreviations |
| General Awareness | 40 | 40 | 15 | general_awareness, banking_awareness | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes |
| English Language or Hindi Language (candidate opts one) | 40 | 40 | 30 | english, hindi | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats; Word Classes (Shabd Vichar); Word Formation; Vocabulary; Sentence; Comprehension |
| Quantitative Aptitude | 40 | 50 | 30 | quant | Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination; Data Sufficiency; Quantity Comparison |

**Common Interview**

- No objective sections (not practised in the app).

### IBPS RRB Clerk

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning | 40 | 40 | 25 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |
| Numerical Ability | 40 | 40 | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning | 40 | 50 | 30 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning |
| Computer Knowledge | 40 | 20 | 15 | computer | Computer Fundamentals; Software and Operating Systems; MS Office; Database Basics; Networking and Internet; Cyber Security; Digital Banking Technology; Computer Abbreviations |
| General Awareness | 40 | 40 | 15 | general_awareness, banking_awareness | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes |
| English Language or Hindi Language (candidate opts one) | 40 | 40 | 30 | english, hindi | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats; Word Classes (Shabd Vichar); Word Formation; Vocabulary; Sentence; Comprehension |
| Numerical Ability | 40 | 50 | 30 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |

### SBI PO

**Phase-I: Preliminary Examination** — 100 marks in total; per-section marks not printed.

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| English Language | 40 | — | 20 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Quantitative Aptitude | 30 | — | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |
| Reasoning Ability | 30 | — | 20 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |

**Phase-II: Main Examination (Objective)**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Reasoning & Computer Aptitude | 40 | 60 | 50 | reasoning, computer | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning; Computer Fundamentals; Software and Operating Systems; MS Office; Database Basics; Networking and Internet; Cyber Security; Digital Banking Technology; Computer Abbreviations |
| Data Analysis & Interpretation | 30 | 60 | 45 | quant | Number Series; Quadratic Equations; Data Interpretation; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination; Data Sufficiency; Quantity Comparison |
| General Awareness / Economy / Banking Knowledge | 60 | 60 | 45 | general_awareness, banking_awareness | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes |
| English Language | 40 | 20 | 40 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |

**Phase-II: Descriptive Test (Communication Skills)**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| Emails, Situation Analysis, Report / Précis Writing | 3 | 30 | 30 | english | Descriptive English |

**Phase-III: Psychometric Test, Group Exercise and Interview**

- No objective sections (not practised in the app).

### SBI Clerk

**Preliminary Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| English Language | 30 | 30 | 20 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Numerical Ability | 35 | 35 | 20 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |
| Reasoning Ability | 35 | 35 | 20 | reasoning | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous |

**Main Examination**

| Section (as printed) | Questions | Marks | Minutes | Subjects in app | Chapters |
|---|---|---|---|---|---|
| General/ Financial Awareness | 50 | 50 | 35 | general_awareness, banking_awareness | Current Affairs; Static GK; Indian Economy; Indian Polity and Constitution; Geography; Science and Technology Developments; Banking History and Structure; Reserve Bank of India; Banking Regulation; Banking Products and Services; Payment Systems; Indian Financial System; Budget and Economic Survey; Government Schemes |
| General English | 40 | 40 | 35 | english | Vocabulary; Grammar; Sentence Structure; Comprehension; Banking Question Formats |
| Quantitative Aptitude | 50 | 50 | 45 | quant | Simplification; Approximation; Number Series; Quadratic Equations; Data Interpretation; Number System; Percentage; Ratio and Proportion; Average; Profit and Loss; Simple and Compound Interest; Partnership; Mixture and Alligation; Time and Work; Pipes and Cisterns; Time, Speed and Distance; Problems on Ages; Mensuration; Probability; Permutation and Combination |
| Reasoning Ability & Computer Aptitude | 50 | 60 | 45 | reasoning, computer | Inequality; Syllogism; Coding-Decoding; Blood Relations; Direction and Distance; Order and Ranking; Alphanumeric Series; Seating Arrangement; Puzzles; Miscellaneous; Input-Output; Data Sufficiency; Logical (Verbal) Reasoning; Computer Fundamentals; Software and Operating Systems; MS Office; Database Basics; Networking and Internet; Cyber Security; Digital Banking Technology; Computer Abbreviations |

**Local Language Proficiency Test** — Only for candidates who did not study the local language in Class 10/12. Not practised in the app.

- No objective sections (not practised in the app).

## Part 4, 5 and 6 — Subject-wise hierarchy (chapter → topic → subtopic → micro-topic)

Each library is stored once and shared by every exam that maps it. **Difficulty:** every node can be practised and studied at all three levels; the level is chosen at generation time (practice: easy/medium/hard; study notes: basic/exam/advanced). Each exam also has a default level (Part 1). 
Levels mean: **Basic** = definitions and single-step questions; **Intermediate** = exam-level, multi-step; **Advanced** = high-difficulty, combined concepts and new patterns. 
**Question categories** come from each node's patterns (conceptual, numerical, trace, design, and so on).

### Professional Knowledge (IT) — `professional_it` (prefix `pk`)

28 chapters, 79 topics, 5 subtopics, 261 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Engineering Mathematics** (इंजीनियरिंग गणित) | Chapter | `pk.engineering_mathematics` |  |
| — Discrete Mathematics (असतत गणित) | Topic | `pk.engineering_mathematics.discrete_math` | conceptual, numerical |
| — — Propositional and First-order Logic (प्रस्तावात्मक और प्रथम-क्रम तर्क) | Subtopic | `pk.engineering_mathematics.discrete_math.propositional_logic` | conceptual, numerical |
| — — — Connectives, Truth Tables, Tautology (संयोजक, सत्यता सारणी, पुनरुक्ति) | Micro-topic | `pk.engineering_mathematics.discrete_math.propositional_logic.connectives` | conceptual, numerical |
| — — — Logical Equivalence and Normal Forms (तार्किक तुल्यता और सामान्य रूप) | Micro-topic | `pk.engineering_mathematics.discrete_math.propositional_logic.equivalence` | conceptual, numerical |
| — — — Predicates and Quantifiers (विधेय और परिमाणक) | Micro-topic | `pk.engineering_mathematics.discrete_math.propositional_logic.quantifiers` | conceptual, numerical |
| — — — Rules of Inference (अनुमान के नियम) | Micro-topic | `pk.engineering_mathematics.discrete_math.propositional_logic.inference_rules` | conceptual, numerical |
| — — Sets, Relations and Functions (समुच्चय, संबंध और फलन) | Subtopic | `pk.engineering_mathematics.discrete_math.sets_relations` | conceptual, numerical |
| — — — Set Operations and Power Set (समुच्चय संक्रियाएँ और घात समुच्चय) | Micro-topic | `pk.engineering_mathematics.discrete_math.sets_relations.set_operations` | conceptual, numerical |
| — — — Reflexive, Symmetric, Transitive; Equivalence Relations (स्वतुल्य, सममित, संक्रामक; तुल्यता संबंध) | Micro-topic | `pk.engineering_mathematics.discrete_math.sets_relations.relation_properties` | conceptual, numerical |
| — — — Injective, Surjective, Bijective; Composition (एकैकी, आच्छादक, एकैकी-आच्छादक; संयोजन) | Micro-topic | `pk.engineering_mathematics.discrete_math.sets_relations.functions` | conceptual, numerical |
| — — — Partial Orders and Lattices (आंशिक क्रम और जालक) | Micro-topic | `pk.engineering_mathematics.discrete_math.sets_relations.posets_lattices` | conceptual, numerical |
| — — Monoids and Groups (मोनॉइड और समूह) | Subtopic | `pk.engineering_mathematics.discrete_math.monoids_groups` | conceptual, numerical |
| — — — Group Axioms, Subgroups, Cyclic Groups (समूह अभिगृहीत, उपसमूह, चक्रीय समूह) | Micro-topic | `pk.engineering_mathematics.discrete_math.monoids_groups.group_axioms` | conceptual, numerical |
| — — Graph Theory (ग्राफ सिद्धांत) | Subtopic | `pk.engineering_mathematics.discrete_math.graph_theory` | conceptual, numerical |
| — — — Connectivity, Paths and Cycles (संयोजकता, पथ और चक्र) | Micro-topic | `pk.engineering_mathematics.discrete_math.graph_theory.connectivity` | conceptual, numerical |
| — — — Matching (मिलान) | Micro-topic | `pk.engineering_mathematics.discrete_math.graph_theory.matching` | conceptual, numerical |
| — — — Graph Colouring and Chromatic Number (ग्राफ रंगाई और वर्णिक संख्या) | Micro-topic | `pk.engineering_mathematics.discrete_math.graph_theory.colouring` | conceptual, numerical |
| — — — Euler and Hamiltonian Graphs; Planarity (ऑयलर और हैमिल्टनी ग्राफ; समतलता) | Micro-topic | `pk.engineering_mathematics.discrete_math.graph_theory.euler_hamilton` | conceptual, numerical |
| — — Combinatorics (संयोजिकी) | Subtopic | `pk.engineering_mathematics.discrete_math.combinatorics` | conceptual, numerical |
| — — — Counting, Permutations and Combinations (गणना, क्रमचय और संचय) | Micro-topic | `pk.engineering_mathematics.discrete_math.combinatorics.counting` | conceptual, numerical |
| — — — Recurrence Relations (पुनरावृत्ति संबंध) | Micro-topic | `pk.engineering_mathematics.discrete_math.combinatorics.recurrence` | conceptual, numerical |
| — — — Generating Functions (जनक फलन) | Micro-topic | `pk.engineering_mathematics.discrete_math.combinatorics.generating_functions` | conceptual, numerical |
| — — — Pigeonhole and Inclusion–Exclusion (कबूतरखाना और समावेश–अपवर्जन) | Micro-topic | `pk.engineering_mathematics.discrete_math.combinatorics.pigeonhole_ie` | conceptual, numerical |
| — Linear Algebra (रैखिक बीजगणित) | Topic | `pk.engineering_mathematics.linear_algebra` | conceptual, numerical |
| — — — Matrices and Determinants (आव्यूह और सारणिक) | Micro-topic | `pk.engineering_mathematics.linear_algebra.matrices` | conceptual, numerical |
| — — — Systems of Linear Equations; Rank (रैखिक समीकरण निकाय; कोटि) | Micro-topic | `pk.engineering_mathematics.linear_algebra.linear_systems` | conceptual, numerical |
| — — — Eigenvalues and Eigenvectors (आइगेन मान और आइगेन सदिश) | Micro-topic | `pk.engineering_mathematics.linear_algebra.eigen` | conceptual, numerical |
| — — — LU Decomposition (एलयू अपघटन) | Micro-topic | `pk.engineering_mathematics.linear_algebra.lu` | conceptual, numerical |
| — Calculus (कलन) | Topic | `pk.engineering_mathematics.calculus` | numerical |
| — — — Limits, Continuity and Differentiability (सीमा, सांतत्य और अवकलनीयता) | Micro-topic | `pk.engineering_mathematics.calculus.limits_continuity` | numerical |
| — — — Maxima and Minima (उच्चिष्ठ और निम्निष्ठ) | Micro-topic | `pk.engineering_mathematics.calculus.maxima_minima` | numerical |
| — — — Mean Value Theorem (माध्य मान प्रमेय) | Micro-topic | `pk.engineering_mathematics.calculus.mean_value` | numerical |
| — — — Integration (समाकलन) | Micro-topic | `pk.engineering_mathematics.calculus.integration` | numerical |
| — Probability and Statistics (प्रायिकता और सांख्यिकी) | Topic | `pk.engineering_mathematics.probability_statistics` | numerical |
| — — — Random Variables (यादृच्छिक चर) | Micro-topic | `pk.engineering_mathematics.probability_statistics.random_variables` | numerical |
| — — — Uniform, Normal, Exponential, Poisson, Binomial (समान, सामान्य, घातांकी, प्वासों, द्विपद बंटन) | Micro-topic | `pk.engineering_mathematics.probability_statistics.distributions` | numerical |
| — — — Mean, Median, Mode and Standard Deviation (माध्य, माध्यिका, बहुलक और मानक विचलन) | Micro-topic | `pk.engineering_mathematics.probability_statistics.mean_median_mode` | numerical |
| — — — Conditional Probability and Bayes' Theorem (सप्रतिबंध प्रायिकता और बेज़ प्रमेय) | Micro-topic | `pk.engineering_mathematics.probability_statistics.conditional_bayes` | numerical |
| **Digital Logic** (डिजिटल लॉजिक) | Chapter | `pk.digital_logic` |  |
| — Boolean Algebra (बूलियन बीजगणित) | Topic | `pk.digital_logic.boolean_algebra` | conceptual, numerical |
| — — — Boolean Laws and De Morgan (बूलियन नियम और डी मॉर्गन) | Micro-topic | `pk.digital_logic.boolean_algebra.laws` | conceptual, numerical |
| — — — Minimisation and K-maps (न्यूनीकरण और के-मैप) | Micro-topic | `pk.digital_logic.boolean_algebra.minimisation` | conceptual, numerical |
| — — — SOP / POS and Universal Gates (एसओपी / पीओएस और सार्वभौमिक गेट) | Micro-topic | `pk.digital_logic.boolean_algebra.sop_pos` | conceptual, numerical |
| — Combinational Circuits (संयोजी परिपथ) | Topic | `pk.digital_logic.combinational` | conceptual, trace |
| — — — Half / Full Adders and Subtractors (अर्ध / पूर्ण योजक और व्यवकलक) | Micro-topic | `pk.digital_logic.combinational.adders` | conceptual, trace |
| — — — Multiplexers, Decoders, Encoders (मल्टीप्लेक्सर, डिकोडर, एनकोडर) | Micro-topic | `pk.digital_logic.combinational.mux_decoder` | conceptual, trace |
| — — — Comparators and Code Converters (तुलनित्र और कोड परिवर्तक) | Micro-topic | `pk.digital_logic.combinational.comparators` | conceptual, trace |
| — Sequential Circuits (अनुक्रमिक परिपथ) | Topic | `pk.digital_logic.sequential` | conceptual, trace |
| — — — Latches and Flip-flops (SR, JK, D, T) (लैच और फ्लिप-फ्लॉप) | Micro-topic | `pk.digital_logic.sequential.flip_flops` | conceptual, trace |
| — — — Counters (Synchronous / Asynchronous) (गणक (समकालिक / असमकालिक)) | Micro-topic | `pk.digital_logic.sequential.counters` | conceptual, trace |
| — — — Shift Registers (शिफ्ट रजिस्टर) | Micro-topic | `pk.digital_logic.sequential.registers` | conceptual, trace |
| — — — Finite State Machines (Moore / Mealy) (परिमित अवस्था मशीन (मूर / मीली)) | Micro-topic | `pk.digital_logic.sequential.fsm` | conceptual, trace |
| — Number Representations and Arithmetic (संख्या निरूपण और अंकगणित) | Topic | `pk.digital_logic.number_representation` | numerical |
| — — — Number Bases and Conversion (संख्या आधार और रूपांतरण) | Micro-topic | `pk.digital_logic.number_representation.bases` | numerical |
| — — — 1's / 2's Complement; Signed Numbers (1 / 2 का पूरक; चिह्नित संख्याएँ) | Micro-topic | `pk.digital_logic.number_representation.complements` | numerical |
| — — — Fixed and Floating Point (IEEE 754) (स्थिर और चल बिंदु (आईईईई 754)) | Micro-topic | `pk.digital_logic.number_representation.fixed_float` | numerical |
| **Computer Organization and Architecture** (कंप्यूटर संगठन और वास्तुकला) | Chapter | `pk.coa` |  |
| — Machine Instructions and Addressing Modes (मशीन निर्देश और पता मोड) | Topic | `pk.coa.machine_instructions` | conceptual, numerical |
| — — — Instruction Formats (निर्देश प्रारूप) | Micro-topic | `pk.coa.machine_instructions.instruction_formats` | conceptual, numerical |
| — — — Addressing Modes (पता मोड) | Micro-topic | `pk.coa.machine_instructions.addressing_modes` | conceptual, numerical |
| — — — RISC vs CISC (रिस्क बनाम सिस्क) | Micro-topic | `pk.coa.machine_instructions.isa` | conceptual, numerical |
| — ALU, Data-path and Control Unit (एएलयू, डेटा-पथ और नियंत्रण इकाई) | Topic | `pk.coa.alu_datapath` | conceptual |
| — — — Data-path Design (डेटा-पथ डिज़ाइन) | Micro-topic | `pk.coa.alu_datapath.datapath` | conceptual |
| — — — Hardwired and Microprogrammed Control (हार्डवायर्ड और माइक्रोप्रोग्राम्ड नियंत्रण) | Micro-topic | `pk.coa.alu_datapath.control` | conceptual |
| — Instruction Pipelining (निर्देश पाइपलाइनिंग) | Topic | `pk.coa.pipelining` | numerical, conceptual |
| — — — Pipeline Stages, Speed-up and Throughput (पाइपलाइन चरण, गति-वृद्धि और थ्रूपुट) | Micro-topic | `pk.coa.pipelining.pipeline_speedup` | numerical, conceptual |
| — — — Pipeline Hazards (Structural, Data, Control) (पाइपलाइन खतरे (संरचनात्मक, डेटा, नियंत्रण)) | Micro-topic | `pk.coa.pipelining.hazards` | numerical, conceptual |
| — — — Forwarding and Branch Prediction (फ़ॉरवर्डिंग और ब्रांच पूर्वानुमान) | Micro-topic | `pk.coa.pipelining.forwarding_branch` | numerical, conceptual |
| — Memory Hierarchy (मेमोरी पदानुक्रम) | Topic | `pk.coa.memory_hierarchy` | numerical |
| — — — Cache: Direct, Associative, Set-associative (कैश: प्रत्यक्ष, साहचर्य, समुच्चय-साहचर्य) | Micro-topic | `pk.coa.memory_hierarchy.cache_mapping` | numerical |
| — — — Hit Ratio and Average Access Time (हिट अनुपात और औसत अभिगम समय) | Micro-topic | `pk.coa.memory_hierarchy.cache_performance` | numerical |
| — — — Write-through and Write-back (राइट-थ्रू और राइट-बैक) | Micro-topic | `pk.coa.memory_hierarchy.write_policies` | numerical |
| — — — Main Memory Organisation (मुख्य मेमोरी संगठन) | Micro-topic | `pk.coa.memory_hierarchy.main_memory` | numerical |
| — — — Secondary Storage (Disk Access Time) (द्वितीयक भंडारण (डिस्क अभिगम समय)) | Micro-topic | `pk.coa.memory_hierarchy.secondary_storage` | numerical |
| — I/O Interface (आई/ओ इंटरफ़ेस) | Topic | `pk.coa.io_interface` | conceptual, numerical |
| — — — Interrupt and Polling (व्यवधान और पोलिंग) | Micro-topic | `pk.coa.io_interface.interrupts` | conceptual, numerical |
| — — — DMA Mode (डीएमए मोड) | Micro-topic | `pk.coa.io_interface.dma` | conceptual, numerical |
| **Programming and Data Structures** (प्रोग्रामिंग और डेटा संरचनाएँ) | Chapter | `pk.programming_ds` |  |
| — Programming in C (सी में प्रोग्रामिंग) | Topic | `pk.programming_ds.c_programming` | trace, conceptual |
| — — — Data Types, Operators and Precedence (डेटा प्रकार, संचालक और वरीयता) | Micro-topic | `pk.programming_ds.c_programming.data_types_operators` | trace, conceptual |
| — — — Control Flow and Loops (नियंत्रण प्रवाह और लूप) | Micro-topic | `pk.programming_ds.c_programming.control_flow` | trace, conceptual |
| — — — Functions, Scope and Storage Classes (फ़ंक्शन, स्कोप और भंडारण वर्ग) | Micro-topic | `pk.programming_ds.c_programming.functions_scope` | trace, conceptual |
| — — — Recursion (पुनरावर्तन) | Micro-topic | `pk.programming_ds.c_programming.recursion` | trace, conceptual |
| — — — Parameter Passing (पैरामीटर पासिंग) | Micro-topic | `pk.programming_ds.c_programming.parameter_passing` | trace, conceptual |
| — — — Pointers, Arrays and Strings (पॉइंटर, ऐरे और स्ट्रिंग) | Micro-topic | `pk.programming_ds.c_programming.pointers` | trace, conceptual |
| — — — Structures and Dynamic Memory (संरचनाएँ और गतिशील मेमोरी) | Micro-topic | `pk.programming_ds.c_programming.structures_dynamic` | trace, conceptual |
| — Arrays, Stacks, Queues and Linked Lists (ऐरे, स्टैक, क्यू और लिंक्ड लिस्ट) | Topic | `pk.programming_ds.linear_ds` | trace, conceptual |
| — — — Arrays (Row / Column Major) (ऐरे (पंक्ति / स्तंभ प्रधान)) | Micro-topic | `pk.programming_ds.linear_ds.arrays` | trace, conceptual |
| — — — Stacks and Expression Evaluation (स्टैक और व्यंजक मूल्यांकन) | Micro-topic | `pk.programming_ds.linear_ds.stacks` | trace, conceptual |
| — — — Queues, Circular Queues, Deques (क्यू, वृत्ताकार क्यू, डेक) | Micro-topic | `pk.programming_ds.linear_ds.queues` | trace, conceptual |
| — — — Singly, Doubly and Circular Linked Lists (एकल, द्वि और वृत्ताकार लिंक्ड लिस्ट) | Micro-topic | `pk.programming_ds.linear_ds.linked_lists` | trace, conceptual |
| — Trees (वृक्ष) | Topic | `pk.programming_ds.trees` | trace, numerical |
| — — — Binary Trees and Traversals (द्विआधारी वृक्ष और ट्रैवर्सल) | Micro-topic | `pk.programming_ds.trees.binary_trees` | trace, numerical |
| — — — Binary Search Trees (द्विआधारी खोज वृक्ष) | Micro-topic | `pk.programming_ds.trees.bst` | trace, numerical |
| — — — Balanced Trees (AVL) (संतुलित वृक्ष (एवीएल)) | Micro-topic | `pk.programming_ds.trees.avl` | trace, numerical |
| — — — Binary Heaps (द्विआधारी हीप) | Micro-topic | `pk.programming_ds.trees.heaps` | trace, numerical |
| — Graphs (ग्राफ) | Topic | `pk.programming_ds.graphs_ds` | conceptual |
| — — — Adjacency Matrix and List (आसन्नता आव्यूह और सूची) | Micro-topic | `pk.programming_ds.graphs_ds.representation` | conceptual |
| — Hashing (हैशिंग) | Topic | `pk.programming_ds.hashing` | numerical |
| — — — Hash Functions (हैश फ़ंक्शन) | Micro-topic | `pk.programming_ds.hashing.hash_functions` | numerical |
| — — — Collision Resolution (Chaining, Open Addressing) (टकराव समाधान (चेनिंग, ओपन एड्रेसिंग)) | Micro-topic | `pk.programming_ds.hashing.collisions` | numerical |
| **Algorithms** (एल्गोरिदम) | Chapter | `pk.algorithms` |  |
| — Analysis of Algorithms (एल्गोरिदम का विश्लेषण) | Topic | `pk.algorithms.analysis` | numerical, conceptual |
| — — — Asymptotic Notation (O, Ω, Θ) (असंपाती संकेतन) | Micro-topic | `pk.algorithms.analysis.asymptotic` | numerical, conceptual |
| — — — Worst, Average and Best Case (सबसे खराब, औसत और सर्वोत्तम स्थिति) | Micro-topic | `pk.algorithms.analysis.worst_average` | numerical, conceptual |
| — — — Solving Recurrences (Master Theorem) (पुनरावृत्ति हल करना (मास्टर प्रमेय)) | Micro-topic | `pk.algorithms.analysis.recurrences` | numerical, conceptual |
| — Searching and Sorting (खोज और छँटाई) | Topic | `pk.algorithms.searching_sorting` | trace, numerical |
| — — — Linear and Binary Search (रैखिक और द्विआधारी खोज) | Micro-topic | `pk.algorithms.searching_sorting.binary_search` | trace, numerical |
| — — — Bubble, Insertion, Selection Sort (बबल, इंसर्शन, सिलेक्शन सॉर्ट) | Micro-topic | `pk.algorithms.searching_sorting.comparison_sorts` | trace, numerical |
| — — — Merge, Quick and Heap Sort (मर्ज, क्विक और हीप सॉर्ट) | Micro-topic | `pk.algorithms.searching_sorting.merge_quick_heap` | trace, numerical |
| — — — Counting and Radix Sort (काउंटिंग और रेडिक्स सॉर्ट) | Micro-topic | `pk.algorithms.searching_sorting.linear_sorts` | trace, numerical |
| — Algorithm Design Techniques (एल्गोरिदम डिज़ाइन तकनीकें) | Topic | `pk.algorithms.design_techniques` | design, trace |
| — — — Greedy (Huffman, Activity Selection, Fractional Knapsack) (लालची (हफ़मैन, गतिविधि चयन, भिन्नात्मक नैपसैक)) | Micro-topic | `pk.algorithms.design_techniques.greedy` | design, trace |
| — — — Dynamic Programming (LCS, 0/1 Knapsack, Matrix Chain) (गतिशील प्रोग्रामिंग) | Micro-topic | `pk.algorithms.design_techniques.dynamic_programming` | design, trace |
| — — — Divide and Conquer (विभाजन और विजय) | Micro-topic | `pk.algorithms.design_techniques.divide_conquer` | design, trace |
| — Graph Algorithms (ग्राफ एल्गोरिदम) | Topic | `pk.algorithms.graph_algorithms` | trace, numerical |
| — — — BFS and DFS (बीएफ़एस और डीएफ़एस) | Micro-topic | `pk.algorithms.graph_algorithms.traversals` | trace, numerical |
| — — — Minimum Spanning Trees (Prim, Kruskal) (न्यूनतम विस्तृत वृक्ष (प्रिम, क्रुस्कल)) | Micro-topic | `pk.algorithms.graph_algorithms.mst` | trace, numerical |
| — — — Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall) (लघुतम पथ) | Micro-topic | `pk.algorithms.graph_algorithms.shortest_paths` | trace, numerical |
| — — — Topological Sort and Connected Components (सांस्थितिक छँटाई और संयोजित घटक) | Micro-topic | `pk.algorithms.graph_algorithms.topological` | trace, numerical |
| **Theory of Computation** (संगणना का सिद्धांत) | Chapter | `pk.theory_of_computation` |  |
| — Regular Languages (नियमित भाषाएँ) | Topic | `pk.theory_of_computation.regular` | conceptual, trace |
| — — — Regular Expressions (नियमित व्यंजक) | Micro-topic | `pk.theory_of_computation.regular.regex` | conceptual, trace |
| — — — DFA and NFA; Conversion (डीएफ़ए और एनएफ़ए; रूपांतरण) | Micro-topic | `pk.theory_of_computation.regular.finite_automata` | conceptual, trace |
| — — — DFA Minimisation (डीएफ़ए न्यूनीकरण) | Micro-topic | `pk.theory_of_computation.regular.minimisation` | conceptual, trace |
| — — — Pumping Lemma (Regular) (पम्पिंग लेम्मा (नियमित)) | Micro-topic | `pk.theory_of_computation.regular.pumping_regular` | conceptual, trace |
| — — — Closure Properties (संवृत गुणधर्म) | Micro-topic | `pk.theory_of_computation.regular.closure_regular` | conceptual, trace |
| — Context-free Languages (संदर्भ-मुक्त भाषाएँ) | Topic | `pk.theory_of_computation.context_free` | conceptual, trace |
| — — — Context-free Grammars and Ambiguity (संदर्भ-मुक्त व्याकरण और अस्पष्टता) | Micro-topic | `pk.theory_of_computation.context_free.cfg` | conceptual, trace |
| — — — Push-down Automata (पुश-डाउन ऑटोमेटा) | Micro-topic | `pk.theory_of_computation.context_free.pda` | conceptual, trace |
| — — — CNF and GNF (सीएनएफ़ और जीएनएफ़) | Micro-topic | `pk.theory_of_computation.context_free.normal_forms` | conceptual, trace |
| — — — Pumping Lemma (CFL) and Closure (पम्पिंग लेम्मा (सीएफ़एल) और संवृतता) | Micro-topic | `pk.theory_of_computation.context_free.pumping_cfl` | conceptual, trace |
| — Turing Machines and Undecidability (ट्यूरिंग मशीन और अनिर्णेयता) | Topic | `pk.theory_of_computation.turing` | conceptual |
| — — — Turing Machines (ट्यूरिंग मशीन) | Micro-topic | `pk.theory_of_computation.turing.tm` | conceptual |
| — — — Recursive and Recursively Enumerable Languages (पुनरावर्ती और पुनरावर्ती गणनीय भाषाएँ) | Micro-topic | `pk.theory_of_computation.turing.decidability` | conceptual |
| — — — Undecidable Problems (अनिर्णेय समस्याएँ) | Micro-topic | `pk.theory_of_computation.turing.undecidable` | conceptual |
| **Compiler Design** (संकलक डिज़ाइन) | Chapter | `pk.compiler_design` |  |
| — Lexical Analysis (शाब्दिक विश्लेषण) | Topic | `pk.compiler_design.lexical` | conceptual, trace |
| — — — Tokens, Lexemes and Patterns (टोकन, लेक्सीम और पैटर्न) | Micro-topic | `pk.compiler_design.lexical.tokens` | conceptual, trace |
| — Parsing (पार्सिंग) | Topic | `pk.compiler_design.parsing` | trace, numerical |
| — — — FIRST and FOLLOW Sets (FIRST और FOLLOW समुच्चय) | Micro-topic | `pk.compiler_design.parsing.first_follow` | trace, numerical |
| — — — Top-down (LL(1)) Parsing (टॉप-डाउन (LL(1)) पार्सिंग) | Micro-topic | `pk.compiler_design.parsing.ll1` | trace, numerical |
| — — — Bottom-up Parsing (SLR, CLR, LALR) (बॉटम-अप पार्सिंग) | Micro-topic | `pk.compiler_design.parsing.lr_parsing` | trace, numerical |
| — — — Shift-Reduce and Reduce-Reduce Conflicts (शिफ्ट-रिड्यूस और रिड्यूस-रिड्यूस विरोध) | Micro-topic | `pk.compiler_design.parsing.conflicts` | trace, numerical |
| — Syntax-directed Translation (वाक्य-रचना निर्देशित अनुवाद) | Topic | `pk.compiler_design.sdt` | conceptual, trace |
| — — — S- and L-attributed Definitions (S- और L-गुणित परिभाषाएँ) | Micro-topic | `pk.compiler_design.sdt.sdd` | conceptual, trace |
| — Runtime Environments (रनटाइम वातावरण) | Topic | `pk.compiler_design.runtime` | conceptual |
| — — — Activation Records and Stack Allocation (सक्रियण रिकॉर्ड और स्टैक आवंटन) | Micro-topic | `pk.compiler_design.runtime.activation_records` | conceptual |
| — Intermediate Code Generation (मध्यवर्ती कोड निर्माण) | Topic | `pk.compiler_design.intermediate_code` | trace |
| — — — Three-address Code (त्रि-पता कोड) | Micro-topic | `pk.compiler_design.intermediate_code.three_address` | trace |
| — Local Optimisation and Data-flow Analysis (स्थानीय अनुकूलन और डेटा-प्रवाह विश्लेषण) | Topic | `pk.compiler_design.optimisation` | conceptual, trace |
| — — — Basic Blocks and Flow Graphs (मूल खंड और प्रवाह ग्राफ) | Micro-topic | `pk.compiler_design.optimisation.basic_blocks` | conceptual, trace |
| — — — Constant Propagation (स्थिरांक प्रसार) | Micro-topic | `pk.compiler_design.optimisation.constant_propagation` | conceptual, trace |
| — — — Liveness Analysis (जीवंतता विश्लेषण) | Micro-topic | `pk.compiler_design.optimisation.liveness` | conceptual, trace |
| — — — Common Sub-expression Elimination (सामान्य उप-व्यंजक निष्कासन) | Micro-topic | `pk.compiler_design.optimisation.cse` | conceptual, trace |
| **Operating Systems** (ऑपरेटिंग सिस्टम) | Chapter | `pk.operating_systems` |  |
| — System Calls, Processes and Threads (सिस्टम कॉल, प्रक्रियाएँ और थ्रेड) | Topic | `pk.operating_systems.processes` | conceptual |
| — — — System Calls (सिस्टम कॉल) | Micro-topic | `pk.operating_systems.processes.system_calls` | conceptual |
| — — — Process States and PCB (प्रक्रिया अवस्थाएँ और पीसीबी) | Micro-topic | `pk.operating_systems.processes.process_states` | conceptual |
| — — — Threads and Context Switching (थ्रेड और संदर्भ परिवर्तन) | Micro-topic | `pk.operating_systems.processes.threads` | conceptual |
| — — — Inter-process Communication (अंतर-प्रक्रिया संचार) | Micro-topic | `pk.operating_systems.processes.ipc` | conceptual |
| — CPU Scheduling (सीपीयू शेड्यूलिंग) | Topic | `pk.operating_systems.scheduling` | numerical |
| — — — FCFS, SJF, SRTF (एफ़सीएफ़एस, एसजेएफ़, एसआरटीएफ़) | Micro-topic | `pk.operating_systems.scheduling.fcfs_sjf` | numerical |
| — — — Round Robin and Priority (राउंड रॉबिन और प्राथमिकता) | Micro-topic | `pk.operating_systems.scheduling.rr_priority` | numerical |
| — — — Waiting, Turnaround and Response Time (प्रतीक्षा, टर्नअराउंड और प्रतिक्रिया समय) | Micro-topic | `pk.operating_systems.scheduling.scheduling_metrics` | numerical |
| — Concurrency and Synchronisation (समवर्तिता और समकालिकता) | Topic | `pk.operating_systems.synchronisation` | conceptual, trace |
| — — — Critical Section Problem (क्रिटिकल सेक्शन समस्या) | Micro-topic | `pk.operating_systems.synchronisation.critical_section` | conceptual, trace |
| — — — Semaphores and Mutex (सेमाफ़ोर और म्यूटेक्स) | Micro-topic | `pk.operating_systems.synchronisation.semaphores` | conceptual, trace |
| — — — Producer–Consumer, Readers–Writers, Dining Philosophers (उत्पादक–उपभोक्ता, पाठक–लेखक, भोजन करते दार्शनिक) | Micro-topic | `pk.operating_systems.synchronisation.classic_problems` | conceptual, trace |
| — Deadlock (गतिरोध) | Topic | `pk.operating_systems.deadlock` | numerical, conceptual |
| — — — Necessary Conditions and RAG (आवश्यक शर्तें और आरएजी) | Micro-topic | `pk.operating_systems.deadlock.conditions` | numerical, conceptual |
| — — — Banker's Algorithm (Avoidance) (बैंकर एल्गोरिदम (परिहार)) | Micro-topic | `pk.operating_systems.deadlock.bankers` | numerical, conceptual |
| — — — Detection and Recovery (पहचान और पुनर्प्राप्ति) | Micro-topic | `pk.operating_systems.deadlock.detection_recovery` | numerical, conceptual |
| — Memory Management and Virtual Memory (मेमोरी प्रबंधन और आभासी मेमोरी) | Topic | `pk.operating_systems.memory_management` | numerical |
| — — — Paging and Page Tables (पेजिंग और पेज टेबल) | Micro-topic | `pk.operating_systems.memory_management.paging` | numerical |
| — — — Segmentation (सेगमेंटेशन) | Micro-topic | `pk.operating_systems.memory_management.segmentation` | numerical |
| — — — TLB and Effective Access Time (टीएलबी और प्रभावी अभिगम समय) | Micro-topic | `pk.operating_systems.memory_management.tlb` | numerical |
| — — — Page Replacement (FIFO, LRU, Optimal) (पेज प्रतिस्थापन) | Micro-topic | `pk.operating_systems.memory_management.page_replacement` | numerical |
| — — — Thrashing and Working Set (थ्रैशिंग और वर्किंग सेट) | Micro-topic | `pk.operating_systems.memory_management.thrashing` | numerical |
| — File Systems (फ़ाइल सिस्टम) | Topic | `pk.operating_systems.file_systems` | conceptual, numerical |
| — — — Contiguous, Linked and Indexed Allocation (सन्निहित, लिंक्ड और अनुक्रमित आवंटन) | Micro-topic | `pk.operating_systems.file_systems.allocation` | conceptual, numerical |
| — — — Disk Scheduling (डिस्क शेड्यूलिंग) | Micro-topic | `pk.operating_systems.file_systems.disk_scheduling` | conceptual, numerical |
| **Database Management Systems** (डेटाबेस प्रबंधन प्रणाली) | Chapter | `pk.dbms` |  |
| — ER Model (ईआर मॉडल) | Topic | `pk.dbms.er_model` | design, conceptual |
| — — — Entities, Attributes and Relationships (संस्थाएँ, गुण और संबंध) | Micro-topic | `pk.dbms.er_model.entities` | design, conceptual |
| — — — Cardinality and Participation (कार्डिनैलिटी और भागीदारी) | Micro-topic | `pk.dbms.er_model.cardinality` | design, conceptual |
| — — — ER to Relational Mapping (ईआर से संबंधपरक मानचित्रण) | Micro-topic | `pk.dbms.er_model.er_to_relational` | design, conceptual |
| — Relational Model, Algebra and Calculus (संबंधपरक मॉडल, बीजगणित और कलन) | Topic | `pk.dbms.relational_model` | trace, conceptual |
| — — — Super, Candidate, Primary and Foreign Keys (सुपर, उम्मीदवार, प्राथमिक और विदेशी कुंजियाँ) | Micro-topic | `pk.dbms.relational_model.keys` | trace, conceptual |
| — — — Relational Algebra (संबंधपरक बीजगणित) | Micro-topic | `pk.dbms.relational_model.relational_algebra` | trace, conceptual |
| — — — Tuple Relational Calculus (टपल संबंधपरक कलन) | Micro-topic | `pk.dbms.relational_model.tuple_calculus` | trace, conceptual |
| — SQL (एसक्यूएल) | Topic | `pk.dbms.sql` | trace, design |
| — — — DDL and DML (डीडीएल और डीएमएल) | Micro-topic | `pk.dbms.sql.ddl_dml` | trace, design |
| — — — Joins (जॉइन) | Micro-topic | `pk.dbms.sql.joins` | trace, design |
| — — — Group By, Having and Aggregates (ग्रुप बाय, हैविंग और समुच्चय फलन) | Micro-topic | `pk.dbms.sql.aggregates` | trace, design |
| — — — Nested and Correlated Subqueries (नेस्टेड और सहसंबद्ध उपप्रश्न) | Micro-topic | `pk.dbms.sql.subqueries` | trace, design |
| — — — Views, Constraints and Triggers (व्यू, प्रतिबंध और ट्रिगर) | Micro-topic | `pk.dbms.sql.views_constraints` | trace, design |
| — Integrity Constraints and Normal Forms (अखंडता प्रतिबंध और सामान्य रूप) | Topic | `pk.dbms.normalisation` | conceptual, numerical |
| — — — Functional Dependencies and Closure (फलनात्मक निर्भरताएँ और संवरक) | Micro-topic | `pk.dbms.normalisation.fd` | conceptual, numerical |
| — — — 1NF, 2NF, 3NF, BCNF (1NF, 2NF, 3NF, BCNF) | Micro-topic | `pk.dbms.normalisation.normal_forms` | conceptual, numerical |
| — — — Lossless and Dependency-preserving Decomposition (हानिरहित और निर्भरता-संरक्षी अपघटन) | Micro-topic | `pk.dbms.normalisation.decomposition` | conceptual, numerical |
| — File Organisation and Indexing (फ़ाइल संगठन और अनुक्रमण) | Topic | `pk.dbms.indexing` | numerical |
| — — — B and B+ Trees (बी और बी+ वृक्ष) | Micro-topic | `pk.dbms.indexing.bplus_trees` | numerical |
| — — — Primary, Clustered and Secondary Indexes (प्राथमिक, क्लस्टर्ड और द्वितीयक अनुक्रमणिकाएँ) | Micro-topic | `pk.dbms.indexing.index_types` | numerical |
| — Transactions and Concurrency Control (लेनदेन और समवर्तिता नियंत्रण) | Topic | `pk.dbms.transactions` | conceptual, trace |
| — — — ACID Properties (एसिड गुणधर्म) | Micro-topic | `pk.dbms.transactions.acid` | conceptual, trace |
| — — — Conflict and View Serialisability (विरोध और दृश्य क्रमबद्धता) | Micro-topic | `pk.dbms.transactions.serialisability` | conceptual, trace |
| — — — Two-phase Locking and Timestamps (द्वि-चरण लॉकिंग और टाइमस्टैम्प) | Micro-topic | `pk.dbms.transactions.locking` | conceptual, trace |
| — — — Recoverability and Recovery (पुनर्प्राप्ति योग्यता और पुनर्प्राप्ति) | Micro-topic | `pk.dbms.transactions.recovery` | conceptual, trace |
| **Computer Networks** (कंप्यूटर नेटवर्क) | Chapter | `pk.computer_networks` |  |
| — Layering Concepts (परत अवधारणाएँ) | Topic | `pk.computer_networks.layering` | conceptual |
| — — — OSI and TCP/IP Protocol Stacks (ओएसआई और टीसीपी/आईपी स्टैक) | Micro-topic | `pk.computer_networks.layering.osi_tcpip` | conceptual |
| — — — Packet, Circuit and Virtual-circuit Switching (पैकेट, सर्किट और आभासी-सर्किट स्विचिंग) | Micro-topic | `pk.computer_networks.layering.switching` | conceptual |
| — Data Link Layer (डेटा लिंक परत) | Topic | `pk.computer_networks.data_link` | numerical, conceptual |
| — — — Framing (फ़्रेमिंग) | Micro-topic | `pk.computer_networks.data_link.framing` | numerical, conceptual |
| — — — Error Detection (CRC, Checksum) (त्रुटि पहचान) | Micro-topic | `pk.computer_networks.data_link.error_detection` | numerical, conceptual |
| — — — Medium Access Control (CSMA/CD, Aloha) (माध्यम अभिगम नियंत्रण) | Micro-topic | `pk.computer_networks.data_link.mac` | numerical, conceptual |
| — — — Ethernet and Bridging (ईथरनेट और ब्रिजिंग) | Micro-topic | `pk.computer_networks.data_link.ethernet_bridging` | numerical, conceptual |
| — — — Sliding Window, Go-Back-N, Selective Repeat (स्लाइडिंग विंडो) | Micro-topic | `pk.computer_networks.data_link.flow_control` | numerical, conceptual |
| — Network Layer (नेटवर्क परत) | Topic | `pk.computer_networks.network_layer` | numerical |
| — — — Shortest Path, Flooding, Distance Vector, Link State (रूटिंग प्रोटोकॉल) | Micro-topic | `pk.computer_networks.network_layer.routing` | numerical |
| — — — IPv4, Fragmentation (आईपीवी4, विखंडन) | Micro-topic | `pk.computer_networks.network_layer.ipv4` | numerical |
| — — — IP Addressing, CIDR and Subnetting (आईपी पता, सीआईडीआर और सबनेटिंग) | Micro-topic | `pk.computer_networks.network_layer.subnetting` | numerical |
| — — — ARP, DHCP, ICMP and NAT (एआरपी, डीएचसीपी, आईसीएमपी और एनएटी) | Micro-topic | `pk.computer_networks.network_layer.arp_dhcp_icmp` | numerical |
| — Transport Layer (परिवहन परत) | Topic | `pk.computer_networks.transport_layer` | numerical, conceptual |
| — — — UDP and TCP (यूडीपी और टीसीपी) | Micro-topic | `pk.computer_networks.transport_layer.udp_tcp` | numerical, conceptual |
| — — — Flow Control and Congestion Control (प्रवाह और भीड़ नियंत्रण) | Micro-topic | `pk.computer_networks.transport_layer.tcp_flow` | numerical, conceptual |
| — — — Sockets (सॉकेट) | Micro-topic | `pk.computer_networks.transport_layer.sockets` | numerical, conceptual |
| — Application Layer (अनुप्रयोग परत) | Topic | `pk.computer_networks.application_layer` | conceptual |
| — — — DNS, SMTP, HTTP, FTP, Email (डीएनएस, एसएमटीपी, एचटीटीपी, एफ़टीपी, ईमेल) | Micro-topic | `pk.computer_networks.application_layer.app_protocols` | conceptual |
| **Java and Object-Oriented Programming** (जावा और वस्तु-उन्मुख प्रोग्रामिंग) | Chapter | `pk.java_oop` |  |
| — OOP Concepts (ओओपी अवधारणाएँ) | Topic | `pk.java_oop.oop_concepts` | conceptual, trace |
| — — — Classes, Objects and Encapsulation (क्लास, ऑब्जेक्ट और एनकैप्सुलेशन) | Micro-topic | `pk.java_oop.oop_concepts.encapsulation` | conceptual, trace |
| — — — Inheritance (इनहेरिटेंस) | Micro-topic | `pk.java_oop.oop_concepts.inheritance` | conceptual, trace |
| — — — Polymorphism (Overloading, Overriding) (बहुरूपता) | Micro-topic | `pk.java_oop.oop_concepts.polymorphism` | conceptual, trace |
| — — — Abstraction and Interfaces (अमूर्तता और इंटरफ़ेस) | Micro-topic | `pk.java_oop.oop_concepts.abstraction` | conceptual, trace |
| — Java Language (जावा भाषा) | Topic | `pk.java_oop.java` | trace |
| — — — JVM, JDK and JRE (जेवीएम, जेडीके और जेआरई) | Micro-topic | `pk.java_oop.java.jvm` | trace |
| — — — Exception Handling (अपवाद प्रबंधन) | Micro-topic | `pk.java_oop.java.exceptions` | trace |
| — — — Collections Framework (कलेक्शंस फ़्रेमवर्क) | Micro-topic | `pk.java_oop.java.collections` | trace |
| — — — Multithreading (मल्टीथ्रेडिंग) | Micro-topic | `pk.java_oop.java.multithreading` | trace |
| — — — C++ OOP Features (Constructors, Virtual Functions) (सी++ ओओपी विशेषताएँ) | Micro-topic | `pk.java_oop.java.cpp_basics` | trace |
| **Software Engineering** (सॉफ़्टवेयर इंजीनियरिंग) | Chapter | `pk.software_engineering` |  |
| — SDLC Models (एसडीएलसी मॉडल) | Topic | `pk.software_engineering.sdlc` | conceptual |
| — — — Waterfall, Spiral, Prototype, V-model (वॉटरफ़ॉल, स्पाइरल, प्रोटोटाइप, वी-मॉडल) | Micro-topic | `pk.software_engineering.sdlc.waterfall_spiral` | conceptual |
| — — — Agile, Scrum and DevOps (एजाइल, स्क्रम और डेवऑप्स) | Micro-topic | `pk.software_engineering.sdlc.agile` | conceptual |
| — Requirements and Design (आवश्यकताएँ और डिज़ाइन) | Topic | `pk.software_engineering.requirements_design` | conceptual |
| — — — SRS and UML Diagrams (एसआरएस और यूएमएल आरेख) | Micro-topic | `pk.software_engineering.requirements_design.srs` | conceptual |
| — — — Coupling and Cohesion (युग्मन और संसंजन) | Micro-topic | `pk.software_engineering.requirements_design.coupling_cohesion` | conceptual |
| — Software Testing (सॉफ़्टवेयर परीक्षण) | Topic | `pk.software_engineering.testing` | conceptual, numerical |
| — — — Unit, Integration, System, Acceptance (इकाई, एकीकरण, प्रणाली, स्वीकृति) | Micro-topic | `pk.software_engineering.testing.testing_levels` | conceptual, numerical |
| — — — Black-box and White-box Testing (ब्लैक-बॉक्स और व्हाइट-बॉक्स परीक्षण) | Micro-topic | `pk.software_engineering.testing.black_white_box` | conceptual, numerical |
| — — — Cyclomatic Complexity (साइक्लोमैटिक जटिलता) | Micro-topic | `pk.software_engineering.testing.cyclomatic` | conceptual, numerical |
| — Estimation and Maintenance (आकलन और रखरखाव) | Topic | `pk.software_engineering.project_management` | numerical |
| — — — COCOMO and Function Points (कोकोमो और फ़ंक्शन पॉइंट) | Micro-topic | `pk.software_engineering.project_management.cocomo` | numerical |
| — — — Maintenance and Configuration Management (रखरखाव और कॉन्फ़िगरेशन प्रबंधन) | Micro-topic | `pk.software_engineering.project_management.maintenance` | numerical |
| **Web Technologies** (वेब प्रौद्योगिकियाँ) | Chapter | `pk.web_technologies` |  |
| — HTML, CSS and JavaScript (एचटीएमएल, सीएसएस और जावास्क्रिप्ट) | Topic | `pk.web_technologies.frontend` | conceptual, trace |
| — — — HTML Elements and Forms (एचटीएमएल तत्व और फ़ॉर्म) | Micro-topic | `pk.web_technologies.frontend.html` | conceptual, trace |
| — — — CSS Selectors and Box Model (सीएसएस चयनकर्ता और बॉक्स मॉडल) | Micro-topic | `pk.web_technologies.frontend.css` | conceptual, trace |
| — — — JavaScript and DOM (जावास्क्रिप्ट और डॉम) | Micro-topic | `pk.web_technologies.frontend.javascript_dom` | conceptual, trace |
| — Web Servers and Services (वेब सर्वर और सेवाएँ) | Topic | `pk.web_technologies.backend_web` | conceptual |
| — — — HTTP Methods, Status Codes and Cookies (एचटीटीपी विधियाँ, स्थिति कोड और कुकी) | Micro-topic | `pk.web_technologies.backend_web.http_methods` | conceptual |
| — — — XML and JSON (एक्सएमएल और जेसन) | Micro-topic | `pk.web_technologies.backend_web.xml_json` | conceptual |
| — — — REST and SOAP Web Services (रेस्ट और सोप वेब सेवाएँ) | Micro-topic | `pk.web_technologies.backend_web.rest_soap` | conceptual |
| — — — Server-side Scripting (Servlets, JSP, PHP) (सर्वर-साइड स्क्रिप्टिंग) | Micro-topic | `pk.web_technologies.backend_web.server_side` | conceptual |
| **Information Security** (सूचना सुरक्षा) | Chapter | `pk.information_security` |  |
| — Security Principles (सुरक्षा सिद्धांत) | Topic | `pk.information_security.principles` | conceptual |
| — — — Confidentiality, Integrity, Availability (गोपनीयता, अखंडता, उपलब्धता) | Micro-topic | `pk.information_security.principles.cia` | conceptual |
| — — — Authentication, Authorisation and MFA (प्रमाणीकरण, प्राधिकरण और एमएफ़ए) | Micro-topic | `pk.information_security.principles.authentication` | conceptual |
| — — — Access Control Models (अभिगम नियंत्रण मॉडल) | Micro-topic | `pk.information_security.principles.access_control` | conceptual |
| — Network Security (नेटवर्क सुरक्षा) | Topic | `pk.information_security.network_security` | conceptual |
| — — — Firewalls, IDS and IPS (फ़ायरवॉल, आईडीएस और आईपीएस) | Micro-topic | `pk.information_security.network_security.firewalls` | conceptual |
| — — — VPN, SSL/TLS and IPSec (वीपीएन, एसएसएल/टीएलएस और आईपीसेक) | Micro-topic | `pk.information_security.network_security.vpn_ssl` | conceptual |
| **Cryptography** (क्रिप्टोग्राफ़ी) | Chapter | `pk.cryptography` |  |
| — Symmetric Cryptography (सममित क्रिप्टोग्राफ़ी) | Topic | `pk.cryptography.symmetric` | conceptual, numerical |
| — — — Classical Ciphers (शास्त्रीय सिफ़र) | Micro-topic | `pk.cryptography.symmetric.classical_ciphers` | conceptual, numerical |
| — — — DES and AES (डीईएस और एईएस) | Micro-topic | `pk.cryptography.symmetric.des_aes` | conceptual, numerical |
| — Public-key Cryptography (सार्वजनिक-कुंजी क्रिप्टोग्राफ़ी) | Topic | `pk.cryptography.asymmetric` | numerical, conceptual |
| — — — RSA (आरएसए) | Micro-topic | `pk.cryptography.asymmetric.rsa` | numerical, conceptual |
| — — — Diffie–Hellman Key Exchange (डिफ़ी–हेलमैन कुंजी विनिमय) | Micro-topic | `pk.cryptography.asymmetric.diffie_hellman` | numerical, conceptual |
| — Hashing, MAC and Digital Signatures (हैशिंग, मैक और डिजिटल हस्ताक्षर) | Topic | `pk.cryptography.integrity` | conceptual |
| — — — SHA and MD5 (एसएचए और एमडी5) | Micro-topic | `pk.cryptography.integrity.hash` | conceptual |
| — — — Digital Certificates and PKI (डिजिटल प्रमाणपत्र और पीकेआई) | Micro-topic | `pk.cryptography.integrity.pki` | conceptual |
| **Cyber Security** (साइबर सुरक्षा) | Chapter | `pk.cyber_security` |  |
| — Cyber Attacks (साइबर हमले) | Topic | `pk.cyber_security.attacks` | conceptual |
| — — — Malware and Ransomware (मैलवेयर और रैंसमवेयर) | Micro-topic | `pk.cyber_security.attacks.malware` | conceptual |
| — — — SQL Injection, XSS and CSRF (एसक्यूएल इंजेक्शन, एक्सएसएस और सीएसआरएफ़) | Micro-topic | `pk.cyber_security.attacks.web_attacks` | conceptual |
| — — — DoS / DDoS (डॉस / डीडॉस) | Micro-topic | `pk.cyber_security.attacks.dos` | conceptual |
| — — — Phishing and Social Engineering (फ़िशिंग और सोशल इंजीनियरिंग) | Micro-topic | `pk.cyber_security.attacks.social_engineering` | conceptual |
| — Cyber Law and Response (साइबर कानून और प्रतिक्रिया) | Topic | `pk.cyber_security.cyber_governance` | conceptual |
| — — — IT Act, 2000 (आईटी अधिनियम, 2000) | Micro-topic | `pk.cyber_security.cyber_governance.it_act` | conceptual |
| — — — CERT-In and Incident Response (सर्ट-इन और घटना प्रतिक्रिया) | Micro-topic | `pk.cyber_security.cyber_governance.cert_in` | conceptual |
| — — — RBI Cyber Security Framework for Banks (बैंकों के लिए आरबीआई साइबर सुरक्षा ढाँचा) | Micro-topic | `pk.cyber_security.cyber_governance.rbi_cyber` | conceptual |
| **Core Banking Solutions** (कोर बैंकिंग समाधान) | Chapter | `pk.core_banking` |  |
| — CBS Architecture (सीबीएस वास्तुकला) | Topic | `pk.core_banking.cbs` | conceptual |
| — — — Centralised Banking and CBS Modules (केंद्रीकृत बैंकिंग और सीबीएस मॉड्यूल) | Micro-topic | `pk.core_banking.cbs.cbs_concept` | conceptual |
| — — — Common CBS Platforms (सामान्य सीबीएस प्लेटफ़ॉर्म) | Micro-topic | `pk.core_banking.cbs.finacle_flexcube` | conceptual |
| — — — Channel and Middleware Integration (चैनल और मिडलवेयर एकीकरण) | Micro-topic | `pk.core_banking.cbs.channels_integration` | conceptual |
| **ATM and Card Technology** (एटीएम और कार्ड प्रौद्योगिकी) | Chapter | `pk.atm_cards` |  |
| — Cards (कार्ड) | Topic | `pk.atm_cards.cards` | conceptual |
| — — — Debit, Credit and Prepaid Cards (डेबिट, क्रेडिट और प्रीपेड कार्ड) | Micro-topic | `pk.atm_cards.cards.card_types` | conceptual |
| — — — EMV Chip and Contactless (NFC) (ईएमवी चिप और संपर्क रहित (एनएफ़सी)) | Micro-topic | `pk.atm_cards.cards.emv` | conceptual |
| — — — Card Tokenisation (कार्ड टोकनाइज़ेशन) | Micro-topic | `pk.atm_cards.cards.tokenisation` | conceptual |
| — ATM Network (एटीएम नेटवर्क) | Topic | `pk.atm_cards.atm` | conceptual |
| — — — ATM Switch and Interoperability (एटीएम स्विच और अंतरसंचालनीयता) | Micro-topic | `pk.atm_cards.atm.atm_switch` | conceptual |
| — — — POS and Payment Gateways (पीओएस और भुगतान गेटवे) | Micro-topic | `pk.atm_cards.atm.pos` | conceptual |
| **UPI, IMPS, NEFT and RTGS** (यूपीआई, आईएमपीएस, एनईएफ़टी और आरटीजीएस) | Chapter | `pk.payment_systems` |  |
| — Retail Payment Systems (खुदरा भुगतान प्रणालियाँ) | Topic | `pk.payment_systems.retail_payments` | conceptual |
| — — — UPI Architecture (यूपीआई वास्तुकला) | Micro-topic | `pk.payment_systems.retail_payments.upi` | conceptual |
| — — — IMPS (आईएमपीएस) | Micro-topic | `pk.payment_systems.retail_payments.imps` | conceptual |
| — — — NEFT (एनईएफ़टी) | Micro-topic | `pk.payment_systems.retail_payments.neft` | conceptual |
| — — — RTGS (आरटीजीएस) | Micro-topic | `pk.payment_systems.retail_payments.rtgs` | conceptual |
| — — — ISO 20022 and SWIFT Messaging (आईएसओ 20022 और स्विफ़्ट संदेश) | Micro-topic | `pk.payment_systems.retail_payments.iso_messaging` | conceptual |
| **NPCI and Payment Systems** (एनपीसीआई और भुगतान प्रणालियाँ) | Chapter | `pk.npci` |  |
| — NPCI Products (एनपीसीआई उत्पाद) | Topic | `pk.npci.npci_products` | conceptual |
| — — — RuPay (रुपे) | Micro-topic | `pk.npci.npci_products.rupay` | conceptual |
| — — — NACH and AePS (एनएसीएच और एईपीएस) | Micro-topic | `pk.npci.npci_products.nach_aeps` | conceptual |
| — — — BBPS and NETC FASTag (बीबीपीएस और फ़ास्टैग) | Micro-topic | `pk.npci.npci_products.bbps_fastag` | conceptual |
| — — — Payment and Settlement Systems Act, 2007 (भुगतान और निपटान प्रणाली अधिनियम, 2007) | Micro-topic | `pk.npci.npci_products.pss_act` | conceptual |
| **Cloud Computing** (क्लाउड कंप्यूटिंग) | Chapter | `pk.cloud_computing` |  |
| — Service and Deployment Models (सेवा और परिनियोजन मॉडल) | Topic | `pk.cloud_computing.cloud_models` | conceptual |
| — — — IaaS, PaaS, SaaS (आईएएएस, पीएएएस, एसएएएस) | Micro-topic | `pk.cloud_computing.cloud_models.iaas_paas_saas` | conceptual |
| — — — Public, Private, Hybrid and Community Cloud (सार्वजनिक, निजी, हाइब्रिड और सामुदायिक क्लाउड) | Micro-topic | `pk.cloud_computing.cloud_models.deployment` | conceptual |
| — — — Virtualisation and Containers (आभासीकरण और कंटेनर) | Micro-topic | `pk.cloud_computing.cloud_models.virtualisation` | conceptual |
| **Data Warehousing and Data Mining** (डेटा वेयरहाउसिंग और डेटा माइनिंग) | Chapter | `pk.data_warehousing` |  |
| — Data Warehousing (डेटा वेयरहाउसिंग) | Topic | `pk.data_warehousing.warehousing` | conceptual |
| — — — ETL (ईटीएल) | Micro-topic | `pk.data_warehousing.warehousing.etl` | conceptual |
| — — — OLAP, Star and Snowflake Schema (ओएलएपी, स्टार और स्नोफ़्लेक स्कीमा) | Micro-topic | `pk.data_warehousing.warehousing.olap` | conceptual |
| — Data Mining (डेटा माइनिंग) | Topic | `pk.data_warehousing.mining` | conceptual, numerical |
| — — — Association Rules (Apriori) (साहचर्य नियम (एप्रियोरी)) | Micro-topic | `pk.data_warehousing.mining.association` | conceptual, numerical |
| — — — Classification and Clustering (वर्गीकरण और क्लस्टरिंग) | Micro-topic | `pk.data_warehousing.mining.classification_clustering` | conceptual, numerical |
| — — — Big Data and Hadoop (बिग डेटा और हडूप) | Micro-topic | `pk.data_warehousing.mining.big_data` | conceptual, numerical |
| **Artificial Intelligence and Machine Learning** (कृत्रिम बुद्धिमत्ता और मशीन लर्निंग) | Chapter | `pk.ai_ml` |  |
| — AI Basics (एआई की मूल बातें) | Topic | `pk.ai_ml.ai_basics` | conceptual |
| — — — Search Strategies (खोज रणनीतियाँ) | Micro-topic | `pk.ai_ml.ai_basics.search` | conceptual |
| — — — Knowledge Representation (ज्ञान निरूपण) | Micro-topic | `pk.ai_ml.ai_basics.knowledge_representation` | conceptual |
| — Machine Learning (मशीन लर्निंग) | Topic | `pk.ai_ml.ml` | conceptual, numerical |
| — — — Supervised Learning (Regression, Classification) (पर्यवेक्षित अधिगम) | Micro-topic | `pk.ai_ml.ml.supervised` | conceptual, numerical |
| — — — Unsupervised Learning (अपर्यवेक्षित अधिगम) | Micro-topic | `pk.ai_ml.ml.unsupervised` | conceptual, numerical |
| — — — Neural Networks and Deep Learning (तंत्रिका नेटवर्क और डीप लर्निंग) | Micro-topic | `pk.ai_ml.ml.neural_networks` | conceptual, numerical |
| — — — Model Evaluation (Accuracy, Precision, Recall) (मॉडल मूल्यांकन) | Micro-topic | `pk.ai_ml.ml.evaluation` | conceptual, numerical |
| — — — AI in Banking (Fraud Detection, Credit Scoring, Chatbots) (बैंकिंग में एआई) | Micro-topic | `pk.ai_ml.ml.banking_ai` | conceptual, numerical |
| **IT Governance and Audit** (आईटी शासन और ऑडिट) | Chapter | `pk.it_governance` |  |
| — Governance Frameworks (शासन ढाँचे) | Topic | `pk.it_governance.frameworks` | conceptual |
| — — — COBIT and ITIL (कोबिट और आईटीआईएल) | Micro-topic | `pk.it_governance.frameworks.cobit_itil` | conceptual |
| — — — ISO/IEC 27001 (आईएसओ/आईईसी 27001) | Micro-topic | `pk.it_governance.frameworks.iso_27001` | conceptual |
| — IS Audit (आईएस ऑडिट) | Topic | `pk.it_governance.audit` | conceptual |
| — — — IS Audit Process and Controls (आईएस ऑडिट प्रक्रिया और नियंत्रण) | Micro-topic | `pk.it_governance.audit.audit_process` | conceptual |
| — — — RBI IT Governance Directions (आरबीआई आईटी शासन निर्देश) | Micro-topic | `pk.it_governance.audit.rbi_it_governance` | conceptual |
| **IT Risk Management** (आईटी जोखिम प्रबंधन) | Chapter | `pk.it_risk` |  |
| — Risk Assessment (जोखिम आकलन) | Topic | `pk.it_risk.risk` | conceptual |
| — — — Identify, Assess, Mitigate, Monitor (पहचान, आकलन, शमन, निगरानी) | Micro-topic | `pk.it_risk.risk.risk_process` | conceptual |
| — — — Outsourcing and Vendor Risk (आउटसोर्सिंग और विक्रेता जोखिम) | Micro-topic | `pk.it_risk.risk.vendor_risk` | conceptual |
| — — — Data Protection (DPDP Act, 2023) (डेटा संरक्षण (डीपीडीपी अधिनियम, 2023)) | Micro-topic | `pk.it_risk.risk.data_privacy` | conceptual |
| **Banking IT Infrastructure** (बैंकिंग आईटी अवसंरचना) | Chapter | `pk.banking_infrastructure` |  |
| — Data Centres and Networks (डेटा सेंटर और नेटवर्क) | Topic | `pk.banking_infrastructure.infrastructure` | conceptual |
| — — — Data Centre Tiers (डेटा सेंटर टियर) | Micro-topic | `pk.banking_infrastructure.infrastructure.data_centre` | conceptual |
| — — — Branch Networks, SD-WAN and INFINET (शाखा नेटवर्क, एसडी-वैन और इन्फ़िनेट) | Micro-topic | `pk.banking_infrastructure.infrastructure.bank_networks` | conceptual |
| — — — Security Operations Centre (सुरक्षा संचालन केंद्र) | Micro-topic | `pk.banking_infrastructure.infrastructure.soc` | conceptual |
| **Disaster Recovery and Business Continuity** (आपदा पुनर्प्राप्ति और व्यवसाय निरंतरता) | Chapter | `pk.disaster_recovery` |  |
| — BCP and DR (बीसीपी और डीआर) | Topic | `pk.disaster_recovery.bcp_dr` | conceptual, numerical |
| — — — RPO and RTO (आरपीओ और आरटीओ) | Micro-topic | `pk.disaster_recovery.bcp_dr.rpo_rto` | conceptual, numerical |
| — — — Hot, Warm and Cold Sites; Near-DR (हॉट, वार्म और कोल्ड साइट; नियर-डीआर) | Micro-topic | `pk.disaster_recovery.bcp_dr.dr_sites` | conceptual, numerical |
| — — — Backup Strategies and RAID (बैकअप रणनीतियाँ और रेड) | Micro-topic | `pk.disaster_recovery.bcp_dr.backup` | conceptual, numerical |
| **Emerging Banking Technologies** (उभरती बैंकिंग प्रौद्योगिकियाँ) | Chapter | `pk.emerging_technologies` |  |
| — Fintech and New Technologies (फ़िनटेक और नई प्रौद्योगिकियाँ) | Topic | `pk.emerging_technologies.fintech` | conceptual |
| — — — Blockchain and DLT (ब्लॉकचेन और डीएलटी) | Micro-topic | `pk.emerging_technologies.fintech.blockchain` | conceptual |
| — — — Central Bank Digital Currency (केंद्रीय बैंक डिजिटल मुद्रा) | Micro-topic | `pk.emerging_technologies.fintech.cbdc` | conceptual |
| — — — Open Banking, APIs and Account Aggregators (ओपन बैंकिंग, एपीआई और अकाउंट एग्रीगेटर) | Micro-topic | `pk.emerging_technologies.fintech.open_banking` | conceptual |
| — — — IoT and Robotic Process Automation (आईओटी और आरपीए) | Micro-topic | `pk.emerging_technologies.fintech.iot_rpa` | conceptual |
| — — — RegTech and Regulatory Sandbox (रेगटेक और नियामक सैंडबॉक्स) | Micro-topic | `pk.emerging_technologies.fintech.regtech` | conceptual |

### Reasoning Ability — `bank_reasoning` (prefix `br`)

13 chapters, 25 topics, 0 subtopics, 47 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Inequality** (असमानता) | Chapter | `br.inequality` |  |
| — Direct Inequality (प्रत्यक्ष असमानता) | Topic | `br.inequality.direct` | which conclusion follows |
| — — — Chained Statements (श्रृंखलाबद्ध कथन) | Micro-topic | `br.inequality.direct.direct_chain` | which conclusion follows |
| — — — Either–Or Cases (या तो–या स्थिति) | Micro-topic | `br.inequality.direct.either_or` | which conclusion follows |
| — Coded Inequality (कूटबद्ध असमानता) | Topic | `br.inequality.coded` |  |
| — — — Decoding Symbols (प्रतीकों का कूटवाचन) | Micro-topic | `br.inequality.coded.symbol_decoding` |  |
| — Reverse and Input-based Inequality (उलटी और इनपुट आधारित असमानता) | Topic | `br.inequality.reverse` |  |
| — — — Fill the Sign (चिह्न भरें) | Micro-topic | `br.inequality.reverse.fill_sign` |  |
| **Syllogism** (न्याय निगमन) | Chapter | `br.syllogism` |  |
| — Statements and Conclusions (कथन और निष्कर्ष) | Topic | `br.syllogism.basic` | which conclusion follows |
| — — — All / Some / No (सभी / कुछ / कोई नहीं) | Micro-topic | `br.syllogism.basic.all_some_no` | which conclusion follows |
| — — — Possibility Cases (संभावना की स्थितियाँ) | Micro-topic | `br.syllogism.basic.possibility` | which conclusion follows |
| — Only a Few / Only (केवल कुछ / केवल) | Topic | `br.syllogism.only_few` |  |
| — — — Only a Few Cases (केवल कुछ की स्थितियाँ) | Micro-topic | `br.syllogism.only_few.only_few_cases` |  |
| — Reverse Syllogism (उलटा न्याय निगमन) | Topic | `br.syllogism.reverse_syllogism` |  |
| — — — Find the Statements (कथन ज्ञात करें) | Micro-topic | `br.syllogism.reverse_syllogism.find_statements` |  |
| **Coding-Decoding** (कूटलेखन-कूटवाचन) | Chapter | `br.coding_decoding` |  |
| — Letter Coding (अक्षर कूटलेखन) | Topic | `br.coding_decoding.letter_coding` | find the code |
| — — — Letter Shift Coding (अक्षर विस्थापन कूटलेखन) | Micro-topic | `br.coding_decoding.letter_coding.shift_coding` | find the code |
| — — — Reverse / Opposite Coding (उलटा / विपरीत कूटलेखन) | Micro-topic | `br.coding_decoding.letter_coding.reverse_coding` | find the code |
| — Word / Sentence Coding (शब्द / वाक्य कूटलेखन) | Topic | `br.coding_decoding.sentence_coding` |  |
| — — — Sentence (Chinese) Coding (वाक्य (चीनी) कूटलेखन) | Micro-topic | `br.coding_decoding.sentence_coding.chinese_coding` |  |
| — New-pattern Coding (नए पैटर्न का कूटलेखन) | Topic | `br.coding_decoding.new_coding` |  |
| — — — Number and Symbol Coding (संख्या और प्रतीक कूटलेखन) | Micro-topic | `br.coding_decoding.new_coding.number_symbol` |  |
| **Blood Relations** (रक्त संबंध) | Chapter | `br.blood_relations` |  |
| — Family Tree (पारिवारिक वृक्ष) | Topic | `br.blood_relations.family_tree` | how is X related to Y |
| — — — Direct Relations (प्रत्यक्ष संबंध) | Micro-topic | `br.blood_relations.family_tree.direct_relation` | how is X related to Y |
| — — — Coded Relations (कूटबद्ध संबंध) | Micro-topic | `br.blood_relations.family_tree.coded_relation` | how is X related to Y |
| — — — Family-based Puzzles (परिवार आधारित पहेलियाँ) | Micro-topic | `br.blood_relations.family_tree.puzzle_relation` | how is X related to Y |
| **Direction and Distance** (दिशा और दूरी) | Chapter | `br.direction_sense` |  |
| — Direction and Shortest Distance (दिशा और न्यूनतम दूरी) | Topic | `br.direction_sense.distance` | find direction or distance |
| — — — Shortest Distance (Pythagoras) (न्यूनतम दूरी (पाइथागोरस)) | Micro-topic | `br.direction_sense.distance.pythagoras` | find direction or distance |
| — — — Point-based Direction (बिंदु आधारित दिशा) | Micro-topic | `br.direction_sense.distance.point_based` | find direction or distance |
| — — — Shadow-based Direction (छाया आधारित दिशा) | Micro-topic | `br.direction_sense.distance.shadow` | find direction or distance |
| **Order and Ranking** (क्रम और रैंकिंग) | Chapter | `br.order_ranking` |  |
| — Position in a Row (पंक्ति में स्थान) | Topic | `br.order_ranking.position` | find the position |
| — — — Total Number of Persons (कुल व्यक्ति) | Micro-topic | `br.order_ranking.position.total_persons` | find the position |
| — — — Height / Weight Comparison (ऊँचाई / भार तुलना) | Micro-topic | `br.order_ranking.position.comparison_ranking` | find the position |
| **Alphanumeric Series** (अक्षरांकीय श्रृंखला) | Chapter | `br.alphanumeric_series` |  |
| — Letter–Number–Symbol Series (अक्षर–संख्या–प्रतीक श्रृंखला) | Topic | `br.alphanumeric_series.element_series` | count or position of elements |
| — — — Immediately Preceded / Followed (तुरंत पहले / बाद में) | Micro-topic | `br.alphanumeric_series.element_series.preceded_followed` | count or position of elements |
| — — — Letter Word Formation (अक्षरों से शब्द निर्माण) | Micro-topic | `br.alphanumeric_series.element_series.word_formation` | count or position of elements |
| **Seating Arrangement** (बैठक व्यवस्था) | Chapter | `br.seating_arrangement` |  |
| — Linear Arrangement (रैखिक व्यवस्था) | Topic | `br.seating_arrangement.linear` | arrangement set (3–5 questions) |
| — — — Single Row (North / South) (एक पंक्ति (उत्तर / दक्षिण)) | Micro-topic | `br.seating_arrangement.linear.single_row` | arrangement set (3–5 questions) |
| — — — Double Row Facing (आमने-सामने दो पंक्तियाँ) | Micro-topic | `br.seating_arrangement.linear.double_row` | arrangement set (3–5 questions) |
| — — — Unknown Number of Persons (व्यक्तियों की अज्ञात संख्या) | Micro-topic | `br.seating_arrangement.linear.unknown_persons` | arrangement set (3–5 questions) |
| — Circular Arrangement (वृत्ताकार व्यवस्था) | Topic | `br.seating_arrangement.circular` |  |
| — — — Facing the Centre / Outside (केंद्र / बाहर की ओर मुख) | Micro-topic | `br.seating_arrangement.circular.facing_centre` |  |
| — — — Mixed Facing (मिश्रित मुख) | Micro-topic | `br.seating_arrangement.circular.mixed_facing` |  |
| — Square / Rectangular / Polygon Table (वर्गाकार / आयताकार / बहुभुज मेज़) | Topic | `br.seating_arrangement.polygon` |  |
| — — — Corners and Middles of Sides (कोने और भुजाओं के मध्य) | Micro-topic | `br.seating_arrangement.polygon.corner_side` |  |
| **Puzzles** (पहेलियाँ) | Chapter | `br.puzzles` |  |
| — Floor and Flat Puzzles (मंज़िल और फ्लैट पहेलियाँ) | Topic | `br.puzzles.floor` | puzzle set (3–5 questions) |
| — — — Floor-based (मंज़िल आधारित) | Micro-topic | `br.puzzles.floor.floor_based` | puzzle set (3–5 questions) |
| — — — Floor + Flat (मंज़िल + फ्लैट) | Micro-topic | `br.puzzles.floor.floor_flat` | puzzle set (3–5 questions) |
| — Box Puzzles (बॉक्स पहेलियाँ) | Topic | `br.puzzles.box` |  |
| — — — Stacked Boxes (एक के ऊपर एक बॉक्स) | Micro-topic | `br.puzzles.box.stacked_boxes` |  |
| — Scheduling Puzzles (समय-सारणी पहेलियाँ) | Topic | `br.puzzles.scheduling` |  |
| — — — Day / Month / Year (दिन / माह / वर्ष) | Micro-topic | `br.puzzles.scheduling.day_month` |  |
| — — — Date-based (तारीख आधारित) | Micro-topic | `br.puzzles.scheduling.date_based` |  |
| — Categorised and Comparison Puzzles (वर्गीकृत और तुलना पहेलियाँ) | Topic | `br.puzzles.categorised` |  |
| — — — Multiple Parameters (अनेक मानदंड) | Micro-topic | `br.puzzles.categorised.parameters` |  |
| — — — Comparison-based (तुलना आधारित) | Micro-topic | `br.puzzles.categorised.comparison_puzzle` |  |
| **Input-Output** (इनपुट-आउटपुट) | Chapter | `br.input_output` |  |
| — Machine Input (मशीन इनपुट) | Topic | `br.input_output.machine` | find the step |
| — — — Word / Number Shifting (शब्द / संख्या विस्थापन) | Micro-topic | `br.input_output.machine.shifting` | find the step |
| — — — Arithmetic Operations on Numbers (संख्याओं पर अंकगणितीय संक्रियाएँ) | Micro-topic | `br.input_output.machine.arithmetic_io` | find the step |
| **Data Sufficiency** (आँकड़ा पर्याप्तता) | Chapter | `br.data_sufficiency` |  |
| — Reasoning DS (तर्क DS) | Topic | `br.data_sufficiency.ds_reasoning` | is the data sufficient |
| — — — Arrangement / Blood Relation / Direction DS (व्यवस्था / रक्त संबंध / दिशा DS) | Micro-topic | `br.data_sufficiency.ds_reasoning.ds_arrangement` | is the data sufficient |
| **Logical (Verbal) Reasoning** (तार्किक (शाब्दिक) तर्क) | Chapter | `br.logical_reasoning` |  |
| — Statement-based (कथन आधारित) | Topic | `br.logical_reasoning.statement_based` | which follows |
| — — — Statement and Assumption (कथन और पूर्वधारणा) | Micro-topic | `br.logical_reasoning.statement_based.assumption` | which follows |
| — — — Statement and Conclusion (कथन और निष्कर्ष) | Micro-topic | `br.logical_reasoning.statement_based.conclusion` | which follows |
| — — — Course of Action (कार्यवाही) | Micro-topic | `br.logical_reasoning.statement_based.course_action` | which follows |
| — — — Strong and Weak Arguments (मजबूत और कमजोर तर्क) | Micro-topic | `br.logical_reasoning.statement_based.argument` | which follows |
| — Critical Reasoning (आलोचनात्मक तर्क) | Topic | `br.logical_reasoning.critical` |  |
| — — — Strengthen / Weaken (मजबूत / कमजोर करना) | Micro-topic | `br.logical_reasoning.critical.strengthen_weaken` |  |
| — — — Inference (अनुमान) | Micro-topic | `br.logical_reasoning.critical.inference` |  |
| — — — Cause and Effect (कारण और प्रभाव) | Micro-topic | `br.logical_reasoning.critical.cause_effect` |  |
| **Miscellaneous** (विविध) | Chapter | `br.miscellaneous` |  |
| — Odd Pair and Meaningful Words (असंगत युग्म और सार्थक शब्द) | Topic | `br.miscellaneous.odd_pair` | find the answer |
| — — — Meaningful Word Formation (सार्थक शब्द निर्माण) | Micro-topic | `br.miscellaneous.odd_pair.meaningful_words` | find the answer |
| — — — Number-based (Digits) (संख्या आधारित (अंक)) | Micro-topic | `br.miscellaneous.odd_pair.number_based` | find the answer |

### Quantitative Aptitude — `bank_quant` (prefix `bq`)

22 chapters, 41 topics, 4 subtopics, 87 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Simplification** (सरलीकरण) | Chapter | `bq.simplification` |  |
| — BODMAS and Order of Operations (BODMAS और संक्रियाओं का क्रम) | Topic | `bq.simplification.bodmas` | find the value, missing number |
| — — — Brackets and Operators (कोष्ठक और संक्रियाएँ) | Micro-topic | `bq.simplification.bodmas.brackets` | find the value, missing number |
| — — — Fractions and Decimals (भिन्न और दशमलव) | Micro-topic | `bq.simplification.bodmas.fractions_decimals` | find the value, missing number |
| — Powers, Squares, Cubes and Roots (घात, वर्ग, घन और मूल) | Topic | `bq.simplification.powers_roots` |  |
| — — — Square and Cube Roots (वर्गमूल और घनमूल) | Micro-topic | `bq.simplification.powers_roots.square_roots` |  |
| — — — Laws of Indices (घातांक के नियम) | Micro-topic | `bq.simplification.powers_roots.indices` |  |
| — Percentage- and Fraction-based Simplification (प्रतिशत और भिन्न आधारित सरलीकरण) | Topic | `bq.simplification.percentage_based` |  |
| — — — Percent of a Number (किसी संख्या का प्रतिशत) | Micro-topic | `bq.simplification.percentage_based.percent_of` |  |
| **Approximation** (सन्निकटन) | Chapter | `bq.approximation` |  |
| — Rounding and Nearest Value (पूर्णांकन और निकटतम मान) | Topic | `bq.approximation.rounding` | approximate value |
| — — — Decimal Rounding (दशमलव पूर्णांकन) | Micro-topic | `bq.approximation.rounding.decimal_rounding` | approximate value |
| — — — Approximate Square Roots (अनुमानित वर्गमूल) | Micro-topic | `bq.approximation.rounding.root_approx` | approximate value |
| — — — Approximate Percentages (अनुमानित प्रतिशत) | Micro-topic | `bq.approximation.rounding.percent_approx` | approximate value |
| **Number Series** (संख्या श्रृंखला) | Chapter | `bq.number_series` |  |
| — Missing Number Series (लुप्त संख्या श्रृंखला) | Topic | `bq.number_series.missing_series` | find the missing term |
| — — Difference-based (अंतर आधारित) | Subtopic | `bq.number_series.missing_series.difference_based` | find the missing term |
| — — — First Difference (प्रथम अंतर) | Micro-topic | `bq.number_series.missing_series.difference_based.first_difference` | find the missing term |
| — — — Second / Third Difference (द्वितीय / तृतीय अंतर) | Micro-topic | `bq.number_series.missing_series.difference_based.second_difference` | find the missing term |
| — — Multiplication / Division-based (गुणा / भाग आधारित) | Subtopic | `bq.number_series.missing_series.multiplication_based` | find the missing term |
| — — — ×n ± k Pattern (×n ± k पैटर्न) | Micro-topic | `bq.number_series.missing_series.multiplication_based.mixed_operation` | find the missing term |
| — — Squares, Cubes and Primes (वर्ग, घन और अभाज्य) | Subtopic | `bq.number_series.missing_series.power_based` | find the missing term |
| — — — Square / Cube ± n (वर्ग / घन ± n) | Micro-topic | `bq.number_series.missing_series.power_based.square_cube_series` | find the missing term |
| — — — Prime Number Series (अभाज्य संख्या श्रृंखला) | Micro-topic | `bq.number_series.missing_series.power_based.prime_series` | find the missing term |
| — — Alternate and Two-series (एकांतर और दो-श्रृंखला) | Subtopic | `bq.number_series.missing_series.alternate` | find the missing term |
| — — — Alternate Series (एकांतर श्रृंखला) | Micro-topic | `bq.number_series.missing_series.alternate.alternate_series` | find the missing term |
| — Wrong Number Series (गलत संख्या श्रृंखला) | Topic | `bq.number_series.wrong_series` | find the wrong term |
| — — — Find the Wrong Term (गलत पद ज्ञात करें) | Micro-topic | `bq.number_series.wrong_series.wrong_term` | find the wrong term |
| — New-pattern Series (नए पैटर्न की श्रृंखला) | Topic | `bq.number_series.new_pattern` | missing term in a statement-based series |
| — — — Series with Statements / Two Rows (कथन / दो पंक्तियों वाली श्रृंखला) | Micro-topic | `bq.number_series.new_pattern.statement_series` | missing term in a statement-based series |
| **Quadratic Equations** (द्विघात समीकरण) | Chapter | `bq.quadratic_equations` |  |
| — Finding Roots (मूल ज्ञात करना) | Topic | `bq.quadratic_equations.roots` | compare x and y |
| — — — Factorisation Method (गुणनखंड विधि) | Micro-topic | `bq.quadratic_equations.roots.factorisation` | compare x and y |
| — — — Sign Method (Shortcut) (चिह्न विधि (शॉर्टकट)) | Micro-topic | `bq.quadratic_equations.roots.sign_method` | compare x and y |
| — Comparison of Roots (x vs y) (मूलों की तुलना (x बनाम y)) | Topic | `bq.quadratic_equations.comparison` |  |
| — — — Linear and Square-root Equations (रैखिक और वर्गमूल समीकरण) | Micro-topic | `bq.quadratic_equations.comparison.linear_vs_quadratic` |  |
| — — — x > y, x < y, x = y or no relation (x > y, x < y, x = y या कोई संबंध नहीं) | Micro-topic | `bq.quadratic_equations.comparison.relation_cases` |  |
| **Percentage** (प्रतिशत) | Chapter | `bq.percentage` |  |
| — Percentage Basics (प्रतिशत की मूल बातें) | Topic | `bq.percentage.basics` | word problem |
| — — — Fraction–Percentage Conversion (भिन्न–प्रतिशत रूपांतरण) | Micro-topic | `bq.percentage.basics.fraction_percent` | word problem |
| — — — Percentage Increase / Decrease (प्रतिशत वृद्धि / कमी) | Micro-topic | `bq.percentage.basics.percent_change` | word problem |
| — Applications (अनुप्रयोग) | Topic | `bq.percentage.applications` |  |
| — — — Successive Percentage Change (क्रमिक प्रतिशत परिवर्तन) | Micro-topic | `bq.percentage.applications.successive` |  |
| — — — Population and Depreciation (जनसंख्या और मूल्यह्रास) | Micro-topic | `bq.percentage.applications.population` |  |
| — — — Price–Consumption–Expenditure (मूल्य–उपभोग–व्यय) | Micro-topic | `bq.percentage.applications.expenditure` |  |
| — — — Elections, Marks and Income (चुनाव, अंक और आय) | Micro-topic | `bq.percentage.applications.elections_exams` |  |
| **Ratio and Proportion** (अनुपात और समानुपात) | Chapter | `bq.ratio_proportion` |  |
| — Ratio (अनुपात) | Topic | `bq.ratio_proportion.ratio` | word problem |
| — — — Compound and Duplicate Ratio (मिश्र और द्विगुण अनुपात) | Micro-topic | `bq.ratio_proportion.ratio.compound_ratio` | word problem |
| — — — Change in Ratio (अनुपात में परिवर्तन) | Micro-topic | `bq.ratio_proportion.ratio.ratio_change` | word problem |
| — Proportion and Variation (समानुपात और विचरण) | Topic | `bq.ratio_proportion.proportion` |  |
| — — — Mean, Third and Fourth Proportional (माध्य, तृतीय और चतुर्थ समानुपाती) | Micro-topic | `bq.ratio_proportion.proportion.mean_third` |  |
| — — — Direct and Inverse Variation (प्रत्यक्ष और प्रतिलोम विचरण) | Micro-topic | `bq.ratio_proportion.proportion.direct_inverse` |  |
| — Coins, Salaries and Distribution (सिक्के, वेतन और वितरण) | Topic | `bq.ratio_proportion.coins_salary` |  |
| — — — Distribution in a Ratio (अनुपात में वितरण) | Micro-topic | `bq.ratio_proportion.coins_salary.distribution` |  |
| **Average** (औसत) | Chapter | `bq.average` |  |
| — Simple Average (साधारण औसत) | Topic | `bq.average.simple_average` | word problem |
| — — — Replacement and Inclusion (प्रतिस्थापन और समावेश) | Micro-topic | `bq.average.simple_average.replacement` | word problem |
| — — — Consecutive Numbers (क्रमागत संख्याएँ) | Micro-topic | `bq.average.simple_average.consecutive` | word problem |
| — Weighted Average (भारित औसत) | Topic | `bq.average.weighted_average` |  |
| — — — Combined Group Average (संयुक्त समूह औसत) | Micro-topic | `bq.average.weighted_average.group_average` |  |
| — — — Runs, Marks and Age Averages (रन, अंक और आयु औसत) | Micro-topic | `bq.average.weighted_average.cricket_marks` |  |
| **Profit and Loss** (लाभ और हानि) | Chapter | `bq.profit_loss` |  |
| — Cost Price and Selling Price (क्रय मूल्य और विक्रय मूल्य) | Topic | `bq.profit_loss.cp_sp` | word problem |
| — — — Profit / Loss Percentage (लाभ / हानि प्रतिशत) | Micro-topic | `bq.profit_loss.cp_sp.profit_percent` | word problem |
| — — — Two Articles at the Same SP (समान विक्रय मूल्य पर दो वस्तुएँ) | Micro-topic | `bq.profit_loss.cp_sp.same_sp` | word problem |
| — Marked Price and Discount (अंकित मूल्य और छूट) | Topic | `bq.profit_loss.discount` |  |
| — — — Successive Discounts (क्रमिक छूट) | Micro-topic | `bq.profit_loss.discount.successive_discount` |  |
| — — — Dishonest Dealer / False Weights (बेईमान विक्रेता / गलत बाट) | Micro-topic | `bq.profit_loss.discount.dishonest` |  |
| **Simple and Compound Interest** (साधारण और चक्रवृद्धि ब्याज) | Chapter | `bq.interest` |  |
| — Simple Interest (साधारण ब्याज) | Topic | `bq.interest.simple_interest` | find interest, find rate or time |
| — — — SI Formula and Rate / Time (साधारण ब्याज सूत्र और दर / समय) | Micro-topic | `bq.interest.simple_interest.si_basic` | find interest, find rate or time |
| — Compound Interest (चक्रवृद्धि ब्याज) | Topic | `bq.interest.compound_interest` |  |
| — — — Annual, Half-yearly and Quarterly Compounding (वार्षिक, अर्धवार्षिक और त्रैमासिक चक्रवृद्धि) | Micro-topic | `bq.interest.compound_interest.ci_annual` |  |
| — — — Difference between CI and SI (चक्रवृद्धि और साधारण ब्याज का अंतर) | Micro-topic | `bq.interest.compound_interest.ci_si_difference` |  |
| — — — Instalments (किश्तें) | Micro-topic | `bq.interest.compound_interest.instalments` |  |
| — — — Growth and Depreciation (वृद्धि और मूल्यह्रास) | Micro-topic | `bq.interest.compound_interest.growth_depreciation` |  |
| **Partnership** (साझेदारी) | Chapter | `bq.partnership` |  |
| — Profit Sharing (लाभ का बँटवारा) | Topic | `bq.partnership.profit_share` | word problem |
| — — — Simple Partnership (साधारण साझेदारी) | Micro-topic | `bq.partnership.profit_share.simple_partnership` | word problem |
| — — — Capital for Different Periods (भिन्न अवधियों की पूँजी) | Micro-topic | `bq.partnership.profit_share.compound_partnership` | word problem |
| — — — Working and Sleeping Partner (सक्रिय और निष्क्रिय साझेदार) | Micro-topic | `bq.partnership.profit_share.working_partner` | word problem |
| **Mixture and Alligation** (मिश्रण और एलीगेशन) | Chapter | `bq.mixtures_alligation` |  |
| — Rule of Alligation (एलीगेशन नियम) | Topic | `bq.mixtures_alligation.alligation` | word problem |
| — — — Mean Price of a Mixture (मिश्रण का माध्य मूल्य) | Micro-topic | `bq.mixtures_alligation.alligation.mean_price` | word problem |
| — — — Ratio of Mixing (मिलाने का अनुपात) | Micro-topic | `bq.mixtures_alligation.alligation.ratio_mixing` | word problem |
| — Repeated Replacement (बार-बार प्रतिस्थापन) | Topic | `bq.mixtures_alligation.replacement` |  |
| — — — Removal and Replacement of Liquid (द्रव का निष्कासन और प्रतिस्थापन) | Micro-topic | `bq.mixtures_alligation.replacement.removal_replacement` |  |
| **Time and Work** (समय और कार्य) | Chapter | `bq.time_work` |  |
| — Work and Efficiency (कार्य और दक्षता) | Topic | `bq.time_work.work_efficiency` | word problem |
| — — — LCM (Total Work) Method (LCM (कुल कार्य) विधि) | Micro-topic | `bq.time_work.work_efficiency.lcm_method` | word problem |
| — — — Alternate Days and Leaving Midway (एकांतर दिन और बीच में छोड़ना) | Micro-topic | `bq.time_work.work_efficiency.alternate_days` | word problem |
| — — — Men, Women and Children (पुरुष, महिलाएँ और बच्चे) | Micro-topic | `bq.time_work.work_efficiency.men_women_children` | word problem |
| — — — Work and Wages (कार्य और मजदूरी) | Micro-topic | `bq.time_work.work_efficiency.wages` | word problem |
| **Pipes and Cisterns** (नल और टंकी) | Chapter | `bq.pipes_cisterns` |  |
| — Inlet and Outlet Pipes (भरने और खाली करने वाले नल) | Topic | `bq.pipes_cisterns.inlet_outlet` | word problem |
| — — — Leaks (रिसाव) | Micro-topic | `bq.pipes_cisterns.inlet_outlet.leak` | word problem |
| — — — Alternate Opening (बारी-बारी से खोलना) | Micro-topic | `bq.pipes_cisterns.inlet_outlet.alternate_opening` | word problem |
| **Time, Speed and Distance** (समय, चाल और दूरी) | Chapter | `bq.time_speed_distance` |  |
| — Speed Basics (चाल की मूल बातें) | Topic | `bq.time_speed_distance.speed_basics` | word problem |
| — — — Average Speed (औसत चाल) | Micro-topic | `bq.time_speed_distance.speed_basics.average_speed` | word problem |
| — — — Relative Speed (सापेक्ष चाल) | Micro-topic | `bq.time_speed_distance.speed_basics.relative_speed` | word problem |
| — Problems on Trains (रेलगाड़ी पर प्रश्न) | Topic | `bq.time_speed_distance.trains` |  |
| — — — Crossing a Pole / Platform / Train (खंभा / प्लेटफॉर्म / रेलगाड़ी पार करना) | Micro-topic | `bq.time_speed_distance.trains.train_platform` |  |
| — Boats and Streams (नाव और धारा) | Topic | `bq.time_speed_distance.boats_streams` |  |
| — — — Upstream and Downstream (धारा के विपरीत और अनुकूल) | Micro-topic | `bq.time_speed_distance.boats_streams.upstream_downstream` |  |
| — Races and Circular Tracks (दौड़ और वृत्ताकार पथ) | Topic | `bq.time_speed_distance.races` |  |
| — — — Head Start and Meeting Point (आगे से शुरुआत और मिलने का बिंदु) | Micro-topic | `bq.time_speed_distance.races.head_start` |  |
| **Problems on Ages** (आयु संबंधी प्रश्न) | Chapter | `bq.ages` |  |
| — Ages with Ratios (अनुपात सहित आयु) | Topic | `bq.ages.age_ratio` | word problem |
| — — — Present, Past and Future Ages (वर्तमान, भूत और भविष्य आयु) | Micro-topic | `bq.ages.age_ratio.present_past_future` | word problem |
| **Mensuration** (क्षेत्रमिति) | Chapter | `bq.mensuration` |  |
| — 2D Figures (2D आकृतियाँ) | Topic | `bq.mensuration.two_d` | find area or perimeter |
| — — — Rectangle, Square and Path (आयत, वर्ग और पथ) | Micro-topic | `bq.mensuration.two_d.rectangle_square` | find area or perimeter |
| — — — Triangle (त्रिभुज) | Micro-topic | `bq.mensuration.two_d.triangle` | find area or perimeter |
| — — — Circle and Sector (वृत्त और त्रिज्यखंड) | Micro-topic | `bq.mensuration.two_d.circle` | find area or perimeter |
| — 3D Solids (3D ठोस) | Topic | `bq.mensuration.three_d` | find volume or surface area |
| — — — Cuboid and Cube (घनाभ और घन) | Micro-topic | `bq.mensuration.three_d.cuboid_cube` | find volume or surface area |
| — — — Cylinder, Cone and Sphere (बेलन, शंकु और गोला) | Micro-topic | `bq.mensuration.three_d.cylinder_cone_sphere` | find volume or surface area |
| **Probability** (प्रायिकता) | Chapter | `bq.probability` |  |
| — Basic Probability (मूल प्रायिकता) | Topic | `bq.probability.basic_probability` | find the probability |
| — — — Coins and Dice (सिक्के और पासे) | Micro-topic | `bq.probability.basic_probability.coins_dice` | find the probability |
| — — — Playing Cards (ताश के पत्ते) | Micro-topic | `bq.probability.basic_probability.cards` | find the probability |
| — — — Balls from Bags (थैलों से गेंदें) | Micro-topic | `bq.probability.basic_probability.balls_bags` | find the probability |
| **Permutation and Combination** (क्रमचय और संचय) | Chapter | `bq.permutation_combination` |  |
| — Permutation (Arrangements) (क्रमचय (व्यवस्था)) | Topic | `bq.permutation_combination.arrangements` | number of ways |
| — — — Arranging Letters of a Word (शब्द के अक्षरों की व्यवस्था) | Micro-topic | `bq.permutation_combination.arrangements.word_arrangement` | number of ways |
| — — — Circular Arrangements (वृत्ताकार व्यवस्था) | Micro-topic | `bq.permutation_combination.arrangements.circular_permutation` | number of ways |
| — Combination (Selections) (संचय (चयन)) | Topic | `bq.permutation_combination.selections` |  |
| — — — Committees and Groups (समितियाँ और समूह) | Micro-topic | `bq.permutation_combination.selections.committee` |  |
| **Data Interpretation** (आँकड़ा व्याख्या) | Chapter | `bq.data_interpretation` |  |
| — DI Types (DI के प्रकार) | Topic | `bq.data_interpretation.di_types` | calculation from data, percentage and ratio from data |
| — — — Table DI (तालिका DI) | Micro-topic | `bq.data_interpretation.di_types.table_di` | calculation from data, percentage and ratio from data |
| — — — Bar Graph DI (बार ग्राफ DI) | Micro-topic | `bq.data_interpretation.di_types.bar_di` | calculation from data, percentage and ratio from data |
| — — — Line Graph DI (रेखा ग्राफ DI) | Micro-topic | `bq.data_interpretation.di_types.line_di` | calculation from data, percentage and ratio from data |
| — — — Pie Chart DI (पाई चार्ट DI) | Micro-topic | `bq.data_interpretation.di_types.pie_di` | calculation from data, percentage and ratio from data |
| — — — Mixed / Combined DI (मिश्रित / संयुक्त DI) | Micro-topic | `bq.data_interpretation.di_types.mixed_di` | calculation from data, percentage and ratio from data |
| — — — Caselet (Paragraph) DI (केसलेट (अनुच्छेद) DI) | Micro-topic | `bq.data_interpretation.di_types.caselet_di` | calculation from data, percentage and ratio from data |
| — — — Missing-data DI (लुप्त आँकड़ा DI) | Micro-topic | `bq.data_interpretation.di_types.missing_di` | calculation from data, percentage and ratio from data |
| — Arithmetic-based DI (अंकगणित आधारित DI) | Topic | `bq.data_interpretation.arithmetic_di` |  |
| — — — Profit, Speed and Work Data Sets (लाभ, चाल और कार्य आँकड़े) | Micro-topic | `bq.data_interpretation.arithmetic_di.arithmetic_di_sets` |  |
| **Data Sufficiency** (आँकड़ा पर्याप्तता) | Chapter | `bq.data_sufficiency` |  |
| — Two-statement DS (दो-कथन DS) | Topic | `bq.data_sufficiency.two_statement` | is the data sufficient |
| — — — Arithmetic DS (अंकगणित DS) | Micro-topic | `bq.data_sufficiency.two_statement.ds_arithmetic` | is the data sufficient |
| — Three-statement DS (तीन-कथन DS) | Topic | `bq.data_sufficiency.three_statement` |  |
| — — — Which Statement is Not Necessary (कौन-सा कथन आवश्यक नहीं) | Micro-topic | `bq.data_sufficiency.three_statement.ds_which_redundant` |  |
| **Quantity Comparison** (मात्रा तुलना) | Chapter | `bq.quantity_comparison` |  |
| — Quantity I vs Quantity II (मात्रा I बनाम मात्रा II) | Topic | `bq.quantity_comparison.compare` | compare two quantities |
| — — — Arithmetic-based Quantities (अंकगणित आधारित मात्राएँ) | Micro-topic | `bq.quantity_comparison.compare.arithmetic_quantities` | compare two quantities |
| — — — Equation-based Quantities (समीकरण आधारित मात्राएँ) | Micro-topic | `bq.quantity_comparison.compare.equation_quantities` | compare two quantities |
| **Number System** (संख्या पद्धति) | Chapter | `bq.number_system` |  |
| — Divisibility and Remainders (विभाज्यता और शेषफल) | Topic | `bq.number_system.divisibility` | find the number |
| — — — HCF and LCM (महत्तम और लघुत्तम समापवर्त्य) | Micro-topic | `bq.number_system.divisibility.hcf_lcm` | find the number |
| — — — Unit Digit (इकाई अंक) | Micro-topic | `bq.number_system.divisibility.unit_digit` | find the number |

### English Language — `english` (prefix `en`)

6 chapters, 24 topics, 0 subtopics, 39 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Vocabulary** (शब्दावली) | Chapter | `en.vocabulary` |  |
| — Synonyms (पर्यायवाची) | Topic | `en.vocabulary.synonyms` |  |
| — — — Word Synonyms (शब्द के पर्यायवाची) | Micro-topic | `en.vocabulary.synonyms.synonym_word` |  |
| — — — Synonyms in Context (संदर्भ में पर्यायवाची) | Micro-topic | `en.vocabulary.synonyms.synonym_context` |  |
| — Antonyms (विलोम) | Topic | `en.vocabulary.antonyms` |  |
| — — — Word Antonyms (शब्द के विलोम) | Micro-topic | `en.vocabulary.antonyms.antonym_word` |  |
| — — — Antonyms in Context (संदर्भ में विलोम) | Micro-topic | `en.vocabulary.antonyms.antonym_context` |  |
| — One Word Substitution (एक शब्द प्रतिस्थापन) | Topic | `en.vocabulary.one_word` |  |
| — — — One Word for a Phrase (वाक्यांश के लिए एक शब्द) | Micro-topic | `en.vocabulary.one_word.one_word_sub` |  |
| — Idioms and Phrases (मुहावरे और वाक्यांश) | Topic | `en.vocabulary.idioms` |  |
| — — — Meaning of Idioms and Phrases (मुहावरों और वाक्यांशों का अर्थ) | Micro-topic | `en.vocabulary.idioms.idiom_meaning` |  |
| — Spelling (वर्तनी) | Topic | `en.vocabulary.spelling` |  |
| — — — Correctly / Incorrectly Spelt Words (सही / गलत वर्तनी वाले शब्द) | Micro-topic | `en.vocabulary.spelling.spelling_correct` |  |
| — Word Usage (शब्द प्रयोग) | Topic | `en.vocabulary.usage` |  |
| — — — Homonyms and Confusable Words (समानध्वनि और भ्रमित करने वाले शब्द) | Micro-topic | `en.vocabulary.usage.homonyms` |  |
| — — — Collocations (सहप्रयोग) | Micro-topic | `en.vocabulary.usage.collocations` |  |
| **Grammar** (व्याकरण) | Chapter | `en.grammar` |  |
| — Error Detection (Spot the Error) (त्रुटि पहचान) | Topic | `en.grammar.error_detection` |  |
| — — — Subject–Verb Agreement (कर्ता–क्रिया सामंजस्य) | Micro-topic | `en.grammar.error_detection.subject_verb` |  |
| — — — Tenses (काल) | Micro-topic | `en.grammar.error_detection.tenses` |  |
| — — — Articles (आर्टिकल) | Micro-topic | `en.grammar.error_detection.articles` |  |
| — — — Prepositions (पूर्वसर्ग) | Micro-topic | `en.grammar.error_detection.prepositions` |  |
| — — — Pronouns (सर्वनाम) | Micro-topic | `en.grammar.error_detection.pronouns` |  |
| — — — Adjectives and Adverbs (विशेषण और क्रियाविशेषण) | Micro-topic | `en.grammar.error_detection.adjectives_adverbs` |  |
| — — — Conjunctions (संयोजक) | Micro-topic | `en.grammar.error_detection.conjunctions` |  |
| — — — Modals (सहायक क्रियाएँ (मोडल)) | Micro-topic | `en.grammar.error_detection.modals` |  |
| — — — Nouns (संज्ञा) | Micro-topic | `en.grammar.error_detection.nouns` |  |
| — Sentence Improvement (वाक्य सुधार) | Topic | `en.grammar.sentence_improvement` |  |
| — — — Improve the Underlined Part (रेखांकित भाग में सुधार) | Micro-topic | `en.grammar.sentence_improvement.improve_phrase` |  |
| — Fill in the Blanks (रिक्त स्थान भरें) | Topic | `en.grammar.fill_blanks` |  |
| — — — Grammar-based Blank (व्याकरण आधारित रिक्त स्थान) | Micro-topic | `en.grammar.fill_blanks.grammar_blank` |  |
| — — — Vocabulary-based Blank (शब्दावली आधारित रिक्त स्थान) | Micro-topic | `en.grammar.fill_blanks.vocabulary_blank` |  |
| — Active and Passive Voice (कर्तृवाच्य और कर्मवाच्य) | Topic | `en.grammar.voice` |  |
| — — — Voice Conversion (वाच्य परिवर्तन) | Micro-topic | `en.grammar.voice.voice_change` |  |
| — Direct and Indirect Speech (प्रत्यक्ष और अप्रत्यक्ष कथन) | Topic | `en.grammar.narration` |  |
| — — — Narration Conversion (कथन परिवर्तन) | Micro-topic | `en.grammar.narration.narration_change` |  |
| **Sentence Structure** (वाक्य संरचना) | Chapter | `en.sentence_structure` |  |
| — Sentence Rearrangement (Para Jumbles) (वाक्य पुनर्व्यवस्था) | Topic | `en.sentence_structure.rearrangement` |  |
| — — — Arrange Sentences in a Paragraph (अनुच्छेद में वाक्य व्यवस्था) | Micro-topic | `en.sentence_structure.rearrangement.para_jumble` |  |
| — — — Arrange Parts of a Sentence (वाक्य के भागों की व्यवस्था) | Micro-topic | `en.sentence_structure.rearrangement.parts_jumble` |  |
| — Sentence Completion (वाक्य पूर्ति) | Topic | `en.sentence_structure.completion` |  |
| — — — Complete the Sentence (वाक्य पूर्ण करें) | Micro-topic | `en.sentence_structure.completion.complete_sentence` |  |
| **Comprehension** (बोधगम्यता) | Chapter | `en.comprehension` |  |
| — Reading Comprehension (पठन बोध) | Topic | `en.comprehension.reading` |  |
| — — — Main Idea and Title (मुख्य विचार और शीर्षक) | Micro-topic | `en.comprehension.reading.main_idea` |  |
| — — — Factual / Detail Questions (तथ्यात्मक प्रश्न) | Micro-topic | `en.comprehension.reading.detail` |  |
| — — — Inference and Tone (अनुमान और स्वर) | Micro-topic | `en.comprehension.reading.inference` |  |
| — — — Vocabulary in the Passage (गद्यांश में शब्दावली) | Micro-topic | `en.comprehension.reading.vocab_in_passage` |  |
| — Cloze Test (क्लोज़ टेस्ट) | Topic | `en.comprehension.cloze` |  |
| — — — Cloze Passage (क्लोज़ गद्यांश) | Micro-topic | `en.comprehension.cloze.cloze_passage` |  |
| **Banking Question Formats** (बैंकिंग प्रश्न प्रारूप) | Chapter | `en.bank_formats` |  |
| — Word Swap (शब्द अदला-बदली) | Topic | `en.bank_formats.word_swap` | identify the words to swap |
| — — — Swap a Pair of Words (शब्द युग्म की अदला-बदली) | Micro-topic | `en.bank_formats.word_swap.swap_pair` | identify the words to swap |
| — Phrase Replacement (वाक्यांश प्रतिस्थापन) | Topic | `en.bank_formats.phrase_replacement` |  |
| — — — Replace the Bold Phrase (मोटे वाक्यांश का प्रतिस्थापन) | Micro-topic | `en.bank_formats.phrase_replacement.replace_phrase` |  |
| — Connectors and Sentence Joining (संयोजक और वाक्य जोड़ना) | Topic | `en.bank_formats.connectors` |  |
| — — — Join Two Sentences (दो वाक्य जोड़ें) | Micro-topic | `en.bank_formats.connectors.join_sentences` |  |
| — Odd Sentence Out (असंगत वाक्य) | Topic | `en.bank_formats.odd_sentence` |  |
| — — — Find the Odd Sentence (असंगत वाक्य ज्ञात करें) | Micro-topic | `en.bank_formats.odd_sentence.odd_one` |  |
| — Word Usage (Same Word, Different Senses) (शब्द प्रयोग (एक शब्द, अनेक अर्थ)) | Topic | `en.bank_formats.word_usage` |  |
| — — — Correct Usage in Sentences (वाक्यों में सही प्रयोग) | Micro-topic | `en.bank_formats.word_usage.usage_sentences` |  |
| — Column-based Sentence Matching (स्तंभ आधारित वाक्य मिलान) | Topic | `en.bank_formats.column_matching` |  |
| — — — Match Sentence Parts (वाक्य भागों का मिलान) | Micro-topic | `en.bank_formats.column_matching.match_columns` |  |
| **Descriptive English** (वर्णनात्मक अंग्रेज़ी) | Chapter | `en.descriptive` |  |
| — Essay Writing (निबंध लेखन) | Topic | `en.descriptive.essay` | descriptive writing |
| — — — Essay Structure and Topics (निबंध संरचना और विषय) | Micro-topic | `en.descriptive.essay.essay_structure` | descriptive writing |
| — Letter Writing (पत्र लेखन) | Topic | `en.descriptive.letter` |  |
| — — — Formal Letters (औपचारिक पत्र) | Micro-topic | `en.descriptive.letter.formal_letter` |  |
| — Précis and Paragraph Writing (सारांश और अनुच्छेद लेखन) | Topic | `en.descriptive.precis` |  |

### Hindi Language — `bank_hindi` (prefix `hl`)

5 chapters, 19 topics, 0 subtopics, 12 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Word Classes (Shabd Vichar)** (शब्द विचार) | Chapter | `hl.shabd_vichar` |  |
| — Noun (संज्ञा) | Topic | `hl.shabd_vichar.sangya` | identify, correct form |
| — — — Types of Noun (संज्ञा के भेद) | Micro-topic | `hl.shabd_vichar.sangya.sangya_bhed` | identify, correct form |
| — Pronoun (सर्वनाम) | Topic | `hl.shabd_vichar.sarvanam` |  |
| — — — Types of Pronoun (सर्वनाम के भेद) | Micro-topic | `hl.shabd_vichar.sarvanam.sarvanam_bhed` |  |
| — Adjective (विशेषण) | Topic | `hl.shabd_vichar.visheshan` |  |
| — — — Types of Adjective (विशेषण के भेद) | Micro-topic | `hl.shabd_vichar.visheshan.visheshan_bhed` |  |
| — Verb (क्रिया) | Topic | `hl.shabd_vichar.kriya` |  |
| — — — Types of Verb (क्रिया के भेद) | Micro-topic | `hl.shabd_vichar.kriya.kriya_bhed` |  |
| — Gender and Number (लिंग और वचन) | Topic | `hl.shabd_vichar.ling_vachan` |  |
| — — — Gender (लिंग) | Micro-topic | `hl.shabd_vichar.ling_vachan.ling` |  |
| — — — Number (वचन) | Micro-topic | `hl.shabd_vichar.ling_vachan.vachan` |  |
| — Tense (काल) | Topic | `hl.shabd_vichar.kaal` |  |
| **Word Formation** (शब्द रचना) | Chapter | `hl.shabd_rachna` |  |
| — Sandhi (संधि) | Topic | `hl.shabd_rachna.sandhi` | sandhi-vichhed, identify the type |
| — — — Vowel Sandhi (स्वर संधि) | Micro-topic | `hl.shabd_rachna.sandhi.swar_sandhi` | sandhi-vichhed, identify the type |
| — — — Consonant Sandhi (व्यंजन संधि) | Micro-topic | `hl.shabd_rachna.sandhi.vyanjan_sandhi` | sandhi-vichhed, identify the type |
| — — — Visarga Sandhi (विसर्ग संधि) | Micro-topic | `hl.shabd_rachna.sandhi.visarg_sandhi` | sandhi-vichhed, identify the type |
| — Compounds (समास) | Topic | `hl.shabd_rachna.samas` |  |
| — — — Types of Samas (समास के भेद) | Micro-topic | `hl.shabd_rachna.samas.samas_bhed` |  |
| — Prefixes (उपसर्ग) | Topic | `hl.shabd_rachna.upsarg` |  |
| — Suffixes (प्रत्यय) | Topic | `hl.shabd_rachna.pratyay` |  |
| **Vocabulary** (शब्द भंडार) | Chapter | `hl.shabd_bhandar` |  |
| — Synonyms (पर्यायवाची) | Topic | `hl.shabd_bhandar.paryayvachi` | choose the correct word |
| — Antonyms (विलोम) | Topic | `hl.shabd_bhandar.vilom` |  |
| — One Word Substitution (अनेक शब्दों के लिए एक शब्द) | Topic | `hl.shabd_bhandar.anek_shabd` |  |
| — Idioms (मुहावरे) | Topic | `hl.shabd_bhandar.muhavare` |  |
| — Proverbs (लोकोक्तियाँ) | Topic | `hl.shabd_bhandar.lokoktiyan` |  |
| **Sentence** (वाक्य) | Chapter | `hl.vakya` |  |
| — Sentence Correction (वाक्य शुद्धि) | Topic | `hl.vakya.vakya_shuddhi` | find the error |
| — — — Error Detection (अशुद्धि पहचान) | Micro-topic | `hl.vakya.vakya_shuddhi.ashuddhi` | find the error |
| — Sentence Rearrangement (वाक्य क्रम व्यवस्था) | Topic | `hl.vakya.vakya_kram` |  |
| — Fill in the Blanks (रिक्त स्थान पूर्ति) | Topic | `hl.vakya.riktsthan` |  |
| **Comprehension** (गद्यांश) | Chapter | `hl.gadyansh` |  |
| — Unseen Passage (अपठित गद्यांश) | Topic | `hl.gadyansh.apathit` | questions on the passage |
| — — — Cloze Test (Hindi) (क्लोज़ टेस्ट (हिंदी)) | Micro-topic | `hl.gadyansh.apathit.cloze_hindi` | questions on the passage |

### General Awareness — `railway_general_awareness` (prefix `ga`)

6 chapters, 21 topics, 0 subtopics, 57 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Geography** (भूगोल) | Chapter | `ga.geography` |  |
| — Physical Geography (World) (भौतिक भूगोल (विश्व)) | Topic | `ga.geography.physical_world` |  |
| — — — Universe and Solar System (ब्रह्मांड और सौरमंडल) | Micro-topic | `ga.geography.physical_world.solar_system` |  |
| — — — Earth's Structure and Rocks (पृथ्वी की संरचना और चट्टानें) | Micro-topic | `ga.geography.physical_world.earth_structure` |  |
| — — — Landforms (स्थलरूप) | Micro-topic | `ga.geography.physical_world.landforms` |  |
| — — — Atmosphere and Climate (वायुमंडल और जलवायु) | Micro-topic | `ga.geography.physical_world.atmosphere` |  |
| — — — Oceans (महासागर) | Micro-topic | `ga.geography.physical_world.oceans` |  |
| — India: Physical (भारत: भौतिक) | Topic | `ga.geography.india_physical` |  |
| — — — Physiographic Divisions (भौतिक विभाग) | Micro-topic | `ga.geography.india_physical.physiography` |  |
| — — — Rivers and Drainage (नदियाँ और अपवाह) | Micro-topic | `ga.geography.india_physical.rivers` |  |
| — — — Climate and Monsoon (जलवायु और मानसून) | Micro-topic | `ga.geography.india_physical.monsoon` |  |
| — — — Soils and Natural Vegetation (मृदा और प्राकृतिक वनस्पति) | Micro-topic | `ga.geography.india_physical.soils_vegetation` |  |
| — India: Economic (भारत: आर्थिक) | Topic | `ga.geography.india_economic` |  |
| — — — Agriculture and Crops (कृषि और फसलें) | Micro-topic | `ga.geography.india_economic.agriculture` |  |
| — — — Minerals and Energy Resources (खनिज और ऊर्जा संसाधन) | Micro-topic | `ga.geography.india_economic.minerals_energy` |  |
| — — — Industries (उद्योग) | Micro-topic | `ga.geography.india_economic.industries` |  |
| — India: Human (भारत: मानव) | Topic | `ga.geography.india_human` |  |
| — — — Population and Census (जनसंख्या और जनगणना) | Micro-topic | `ga.geography.india_human.population` |  |
| — — — Transport (Railways, Roads, Ports, Airports) (परिवहन (रेल, सड़क, बंदरगाह, हवाई अड्डे)) | Micro-topic | `ga.geography.india_human.transport` |  |
| — World: Regional (विश्व: क्षेत्रीय) | Topic | `ga.geography.world_regional` |  |
| — — — Countries, Capitals and Currencies (देश, राजधानियाँ और मुद्राएँ) | Micro-topic | `ga.geography.world_regional.countries_capitals` |  |
| — — — Major Rivers, Mountains, Deserts (प्रमुख नदियाँ, पर्वत, मरुस्थल) | Micro-topic | `ga.geography.world_regional.world_features` |  |
| — Environment and Ecology (पर्यावरण और पारिस्थितिकी) | Topic | `ga.geography.environment` |  |
| — — — Biodiversity, Flora and Fauna (जैव विविधता, वनस्पति और जीव) | Micro-topic | `ga.geography.environment.biodiversity` |  |
| — — — National Parks and Sanctuaries (राष्ट्रीय उद्यान और अभयारण्य) | Micro-topic | `ga.geography.environment.protected_areas` |  |
| — — — Environmental Issues and Climate Change (पर्यावरणीय मुद्दे और जलवायु परिवर्तन) | Micro-topic | `ga.geography.environment.climate_change` |  |
| **Indian Polity and Constitution** (भारतीय राजव्यवस्था और संविधान) | Chapter | `ga.polity` |  |
| — Constitution (संविधान) | Topic | `ga.polity.constitution` |  |
| — — — Making, Sources and Preamble (निर्माण, स्रोत और प्रस्तावना) | Micro-topic | `ga.polity.constitution.making` |  |
| — — — Fundamental Rights, DPSP, Duties (मौलिक अधिकार, नीति निदेशक तत्व, कर्तव्य) | Micro-topic | `ga.polity.constitution.rights_duties` |  |
| — — — Important Amendments, Articles, Schedules (महत्वपूर्ण संशोधन, अनुच्छेद, अनुसूचियाँ) | Micro-topic | `ga.polity.constitution.amendments` |  |
| — Government (सरकार) | Topic | `ga.polity.government` |  |
| — — — Union Executive (संघ कार्यपालिका) | Micro-topic | `ga.polity.government.union_executive` |  |
| — — — Parliament (संसद) | Micro-topic | `ga.polity.government.parliament` |  |
| — — — State Government (राज्य सरकार) | Micro-topic | `ga.polity.government.state_government` |  |
| — — — Panchayati Raj and Municipalities (पंचायती राज और नगरपालिकाएँ) | Micro-topic | `ga.polity.government.local_government` |  |
| — Judiciary (न्यायपालिका) | Topic | `ga.polity.judiciary` |  |
| — — — Supreme Court and High Courts (सर्वोच्च न्यायालय और उच्च न्यायालय) | Micro-topic | `ga.polity.judiciary.courts` |  |
| — Constitutional and Statutory Bodies (संवैधानिक और वैधानिक निकाय) | Topic | `ga.polity.bodies` |  |
| — — — Election Commission and Elections (निर्वाचन आयोग और चुनाव) | Micro-topic | `ga.polity.bodies.election_commission` |  |
| — — — CAG, UPSC, Finance Commission and Others (CAG, UPSC, वित्त आयोग और अन्य) | Micro-topic | `ga.polity.bodies.other_bodies` |  |
| **Indian Economy** (भारतीय अर्थव्यवस्था) | Chapter | `ga.economy` |  |
| — Basic Concepts (मूल अवधारणाएँ) | Topic | `ga.economy.basics` |  |
| — — — GDP, GNP and National Income (GDP, GNP और राष्ट्रीय आय) | Micro-topic | `ga.economy.basics.national_income` |  |
| — — — Inflation (मुद्रास्फीति) | Micro-topic | `ga.economy.basics.inflation` |  |
| — — — Sectors of the Economy (अर्थव्यवस्था के क्षेत्र) | Micro-topic | `ga.economy.basics.sectors` |  |
| — Planning (योजना) | Topic | `ga.economy.planning` |  |
| — — — Five-Year Plans and NITI Aayog (पंचवर्षीय योजनाएँ और नीति आयोग) | Micro-topic | `ga.economy.planning.niti_aayog` |  |
| — Banking and Finance (बैंकिंग और वित्त) | Topic | `ga.economy.banking` |  |
| — — — RBI and Monetary Policy (RBI और मौद्रिक नीति) | Micro-topic | `ga.economy.banking.rbi` |  |
| — — — Budget and Taxation (GST) (बजट और कराधान (GST)) | Micro-topic | `ga.economy.banking.budget_tax` |  |
| — External Sector (बाह्य क्षेत्र) | Topic | `ga.economy.external` |  |
| — — — Foreign Trade (विदेशी व्यापार) | Micro-topic | `ga.economy.external.trade` |  |
| — — — WTO, IMF, World Bank (WTO, IMF, विश्व बैंक) | Micro-topic | `ga.economy.external.world_bodies` |  |
| — Government Schemes and PSUs (सरकारी योजनाएँ और सार्वजनिक उपक्रम) | Topic | `ga.economy.schemes` |  |
| — — — Flagship Government Programmes (प्रमुख सरकारी कार्यक्रम) | Micro-topic | `ga.economy.schemes.flagship` |  |
| — — — Important PSUs and Organisations (प्रमुख सार्वजनिक उपक्रम और संगठन) | Micro-topic | `ga.economy.schemes.psus` |  |
| **Static GK** (स्थिर सामान्य ज्ञान) | Chapter | `ga.static_gk` |  |
| — People and Awards (व्यक्ति और पुरस्कार) | Topic | `ga.static_gk.people_awards` |  |
| — — — Famous Personalities (प्रसिद्ध व्यक्तित्व) | Micro-topic | `ga.static_gk.people_awards.personalities` |  |
| — — — Awards and Honours (पुरस्कार और सम्मान) | Micro-topic | `ga.static_gk.people_awards.awards` |  |
| — — — Books and Authors (पुस्तकें और लेखक) | Micro-topic | `ga.static_gk.people_awards.books` |  |
| — Facts (तथ्य) | Topic | `ga.static_gk.facts` |  |
| — — — Firsts and Superlatives (प्रथम और सर्वोच्च) | Micro-topic | `ga.static_gk.facts.firsts` |  |
| — — — Important Days (महत्वपूर्ण दिवस) | Micro-topic | `ga.static_gk.facts.days` |  |
| — — — Abbreviations (संक्षिप्त रूप) | Micro-topic | `ga.static_gk.facts.abbreviations` |  |
| — — — UN and International Organisations (संयुक्त राष्ट्र और अंतर्राष्ट्रीय संगठन) | Micro-topic | `ga.static_gk.facts.organisations` |  |
| — — — Inventions and Discoveries (आविष्कार और खोजें) | Micro-topic | `ga.static_gk.facts.inventions` |  |
| — Sports (खेल) | Topic | `ga.static_gk.sports` |  |
| — — — Trophies, Venues and Terms (ट्रॉफी, स्थल और शब्दावली) | Micro-topic | `ga.static_gk.sports.trophies_venues` |  |
| **Science and Technology Developments** (विज्ञान और प्रौद्योगिकी विकास) | Chapter | `ga.science_tech` |  |
| — Space and Nuclear Programmes (अंतरिक्ष और परमाणु कार्यक्रम) | Topic | `ga.science_tech.space_nuclear` |  |
| — — — Indian Space Programme (भारतीय अंतरिक्ष कार्यक्रम) | Micro-topic | `ga.science_tech.space_nuclear.space` |  |
| — — — Nuclear Programme (परमाणु कार्यक्रम) | Micro-topic | `ga.science_tech.space_nuclear.nuclear` |  |
| — Basics of Computers (GA) (कंप्यूटर की मूल बातें (सामान्य जागरूकता)) | Topic | `ga.science_tech.computers_basic` |  |
| — — — Computer and Applications Basics (कंप्यूटर और अनुप्रयोग मूल बातें) | Micro-topic | `ga.science_tech.computers_basic.computer_basics` |  |
| **Current Affairs** (समसामयिकी) | Chapter | `ga.current_affairs` |  |
| — Categories (श्रेणियाँ) | Topic | `ga.current_affairs.categories` |  |
| — — — National (राष्ट्रीय) | Micro-topic | `ga.current_affairs.categories.national` |  |
| — — — International (अंतर्राष्ट्रीय) | Micro-topic | `ga.current_affairs.categories.international` |  |
| — — — Economy and Business (अर्थव्यवस्था और व्यापार) | Micro-topic | `ga.current_affairs.categories.economy_business` |  |
| — — — Science and Technology (विज्ञान और प्रौद्योगिकी) | Micro-topic | `ga.current_affairs.categories.sci_tech` |  |
| — — — Sports Events (खेल आयोजन) | Micro-topic | `ga.current_affairs.categories.sports_events` |  |
| — — — Awards and Appointments (पुरस्कार और नियुक्तियाँ) | Micro-topic | `ga.current_affairs.categories.appointments` |  |

### General / Banking Awareness — `bank_awareness` (prefix `ba`)

8 chapters, 19 topics, 0 subtopics, 53 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Banking History and Structure** (बैंकिंग इतिहास और संरचना) | Chapter | `ba.banking_history` |  |
| — History of Indian Banking (भारतीय बैंकिंग का इतिहास) | Topic | `ba.banking_history.history` | fact-based |
| — — — Nationalisation (1969, 1980) (राष्ट्रीयकरण (1969, 1980)) | Micro-topic | `ba.banking_history.history.nationalisation` | fact-based |
| — — — Bank Mergers and Consolidation (बैंक विलय और समेकन) | Micro-topic | `ba.banking_history.history.mergers` | fact-based |
| — Structure of Banks (बैंकों की संरचना) | Topic | `ba.banking_history.structure` |  |
| — — — Scheduled Commercial Banks (PSB, Private, Foreign) (अनुसूचित वाणिज्यिक बैंक (सरकारी, निजी, विदेशी)) | Micro-topic | `ba.banking_history.structure.commercial_banks` |  |
| — — — Regional Rural Banks (क्षेत्रीय ग्रामीण बैंक) | Micro-topic | `ba.banking_history.structure.rrbs` |  |
| — — — Cooperative Banks (सहकारी बैंक) | Micro-topic | `ba.banking_history.structure.cooperative_banks` |  |
| — — — Payments Banks and Small Finance Banks (भुगतान बैंक और लघु वित्त बैंक) | Micro-topic | `ba.banking_history.structure.payments_small_finance` |  |
| **Reserve Bank of India** (भारतीय रिज़र्व बैंक) | Chapter | `ba.rbi` |  |
| — RBI — Establishment and Functions (आरबीआई — स्थापना और कार्य) | Topic | `ba.rbi.rbi_basics` | fact-based, concept-based |
| — — — Functions of the RBI (आरबीआई के कार्य) | Micro-topic | `ba.rbi.rbi_basics.rbi_functions` | fact-based, concept-based |
| — — — Governors and Leadership (गवर्नर और नेतृत्व) | Micro-topic | `ba.rbi.rbi_basics.rbi_governors` | fact-based, concept-based |
| — Monetary Policy (मौद्रिक नीति) | Topic | `ba.rbi.monetary_policy` |  |
| — — — Monetary Policy Committee (मौद्रिक नीति समिति) | Micro-topic | `ba.rbi.monetary_policy.mpc` |  |
| — — — Repo, Reverse Repo, SDF, MSF, Bank Rate (रेपो, रिवर्स रेपो, एसडीएफ, एमएसएफ, बैंक दर) | Micro-topic | `ba.rbi.monetary_policy.policy_rates` |  |
| — — — CRR and SLR (सीआरआर और एसएलआर) | Micro-topic | `ba.rbi.monetary_policy.reserve_ratios` |  |
| — — — Open Market Operations and LAF (खुले बाज़ार की क्रियाएँ और एलएएफ) | Micro-topic | `ba.rbi.monetary_policy.omo` |  |
| — — — Inflation Targeting (मुद्रास्फीति लक्ष्यीकरण) | Micro-topic | `ba.rbi.monetary_policy.inflation_targeting` |  |
| **Banking Regulation** (बैंकिंग विनियमन) | Chapter | `ba.regulation` |  |
| — Banking Acts (बैंकिंग अधिनियम) | Topic | `ba.regulation.acts` | fact-based |
| — — — Banking Regulation Act, 1949 (बैंकिंग विनियमन अधिनियम, 1949) | Micro-topic | `ba.regulation.acts.br_act` | fact-based |
| — — — RBI Act, 1934 (आरबीआई अधिनियम, 1934) | Micro-topic | `ba.regulation.acts.rbi_act` | fact-based |
| — — — Negotiable Instruments Act, 1881 (परक्राम्य लिखत अधिनियम, 1881) | Micro-topic | `ba.regulation.acts.ni_act` | fact-based |
| — — — SARFAESI Act and IBC (सरफेसी अधिनियम और दिवाला संहिता) | Micro-topic | `ba.regulation.acts.sarfaesi` | fact-based |
| — Prudential Norms (विवेकपूर्ण मानदंड) | Topic | `ba.regulation.prudential` |  |
| — — — Basel I, II and III Norms (बेसल I, II और III मानदंड) | Micro-topic | `ba.regulation.prudential.basel` |  |
| — — — Capital Adequacy (CRAR) (पूँजी पर्याप्तता (सीआरएआर)) | Micro-topic | `ba.regulation.prudential.crar` |  |
| — — — NPA Classification and Provisioning (एनपीए वर्गीकरण और प्रावधान) | Micro-topic | `ba.regulation.prudential.npa` |  |
| — — — Prompt Corrective Action (त्वरित सुधारात्मक कार्रवाई) | Micro-topic | `ba.regulation.prudential.pca` |  |
| — KYC and AML (केवाईसी और एएमएल) | Topic | `ba.regulation.compliance` |  |
| — — — Know Your Customer (अपने ग्राहक को जानें) | Micro-topic | `ba.regulation.compliance.kyc` |  |
| — — — Anti-Money Laundering and PMLA (धन-शोधन निवारण और पीएमएलए) | Micro-topic | `ba.regulation.compliance.aml` |  |
| — Customer Protection (ग्राहक संरक्षण) | Topic | `ba.regulation.customer_protection` |  |
| — — — RBI Integrated Ombudsman Scheme (आरबीआई एकीकृत लोकपाल योजना) | Micro-topic | `ba.regulation.customer_protection.ombudsman` |  |
| — — — Deposit Insurance (DICGC) (जमा बीमा (डीआईसीजीसी)) | Micro-topic | `ba.regulation.customer_protection.dicgc` |  |
| **Banking Products and Services** (बैंकिंग उत्पाद और सेवाएँ) | Chapter | `ba.products_services` |  |
| — Deposit Accounts (जमा खाते) | Topic | `ba.products_services.deposits` | concept-based |
| — — — Savings and Current Accounts (बचत और चालू खाते) | Micro-topic | `ba.products_services.deposits.casa` | concept-based |
| — — — Fixed and Recurring Deposits (सावधि और आवर्ती जमा) | Micro-topic | `ba.products_services.deposits.term_deposits` | concept-based |
| — Loans and Advances (ऋण और अग्रिम) | Topic | `ba.products_services.loans` |  |
| — — — Retail, MSME and Agricultural Loans (खुदरा, एमएसएमई और कृषि ऋण) | Micro-topic | `ba.products_services.loans.loan_types` |  |
| — — — Priority Sector Lending (प्राथमिकता क्षेत्र ऋण) | Micro-topic | `ba.products_services.loans.psl` |  |
| — — — MCLR and External Benchmark Rates (एमसीएलआर और बाहरी बेंचमार्क दरें) | Micro-topic | `ba.products_services.loans.mclr_ebr` |  |
| — Banking Instruments (बैंकिंग लिखत) | Topic | `ba.products_services.instruments` |  |
| — — — Cheques, Drafts and CTS (चेक, ड्राफ्ट और सीटीएस) | Micro-topic | `ba.products_services.instruments.cheques` |  |
| — — — Common Banking Terms (सामान्य बैंकिंग शब्दावली) | Micro-topic | `ba.products_services.instruments.terms` |  |
| — Financial Inclusion (वित्तीय समावेशन) | Topic | `ba.products_services.inclusion` |  |
| — — — PMJDY and Inclusion Schemes (पीएमजेडीवाई और समावेशन योजनाएँ) | Micro-topic | `ba.products_services.inclusion.jan_dhan` |  |
| — — — Business Correspondents (व्यवसाय प्रतिनिधि) | Micro-topic | `ba.products_services.inclusion.business_correspondents` |  |
| **Payment Systems** (भुगतान प्रणालियाँ) | Chapter | `ba.payment_systems` |  |
| — Electronic Payment Systems (इलेक्ट्रॉनिक भुगतान प्रणालियाँ) | Topic | `ba.payment_systems.systems` | concept-based, fact-based |
| — — — NEFT and RTGS (एनईएफटी और आरटीजीएस) | Micro-topic | `ba.payment_systems.systems.neft_rtgs` | concept-based, fact-based |
| — — — IMPS and UPI (आईएमपीएस और यूपीआई) | Micro-topic | `ba.payment_systems.systems.imps_upi` | concept-based, fact-based |
| — — — NPCI and its Products (RuPay, NACH, AePS, BBPS) (एनपीसीआई और उसके उत्पाद) | Micro-topic | `ba.payment_systems.systems.npci` | concept-based, fact-based |
| — — — e-Rupee (CBDC) (ई-रुपया (सीबीडीसी)) | Micro-topic | `ba.payment_systems.systems.cbdc` | concept-based, fact-based |
| **Indian Financial System** (भारतीय वित्तीय प्रणाली) | Chapter | `ba.financial_system` |  |
| — Financial Markets (वित्तीय बाज़ार) | Topic | `ba.financial_system.markets` | concept-based |
| — — — Money Market Instruments (T-bills, CP, CD, Call Money) (मुद्रा बाज़ार लिखत) | Micro-topic | `ba.financial_system.markets.money_market` | concept-based |
| — — — Capital Market (Primary, Secondary, IPO) (पूँजी बाज़ार (प्राथमिक, द्वितीयक, आईपीओ)) | Micro-topic | `ba.financial_system.markets.capital_market` | concept-based |
| — — — Government Securities and Bonds (सरकारी प्रतिभूतियाँ और बॉन्ड) | Micro-topic | `ba.financial_system.markets.gsec` | concept-based |
| — — — Mutual Funds (म्यूचुअल फंड) | Micro-topic | `ba.financial_system.markets.mutual_funds` | concept-based |
| — Regulators and Institutions (नियामक और संस्थाएँ) | Topic | `ba.financial_system.regulators` |  |
| — — — SEBI (सेबी) | Micro-topic | `ba.financial_system.regulators.sebi` |  |
| — — — IRDAI and PFRDA (आईआरडीएआई और पीएफआरडीए) | Micro-topic | `ba.financial_system.regulators.irdai_pfrda` |  |
| — — — NABARD, SIDBI, EXIM Bank, NHB (नाबार्ड, सिडबी, एक्ज़िम बैंक, एनएचबी) | Micro-topic | `ba.financial_system.regulators.dfis` |  |
| — — — IMF, World Bank, ADB, AIIB, NDB (आईएमएफ, विश्व बैंक, एडीबी, एआईआईबी, एनडीबी) | Micro-topic | `ba.financial_system.regulators.international` |  |
| — Insurance and Pension (बीमा और पेंशन) | Topic | `ba.financial_system.insurance_pension` |  |
| — — — Life and General Insurance (जीवन और सामान्य बीमा) | Micro-topic | `ba.financial_system.insurance_pension.insurance` |  |
| — — — NPS and APY (एनपीएस और एपीवाई) | Micro-topic | `ba.financial_system.insurance_pension.pension` |  |
| **Budget and Economic Survey** (बजट और आर्थिक सर्वेक्षण) | Chapter | `ba.public_finance` |  |
| — Union Budget (केंद्रीय बजट) | Topic | `ba.public_finance.budget` | fact-based |
| — — — Fiscal, Revenue and Primary Deficit (राजकोषीय, राजस्व और प्राथमिक घाटा) | Micro-topic | `ba.public_finance.budget.deficits` | fact-based |
| — — — Direct Taxes and GST (प्रत्यक्ष कर और जीएसटी) | Micro-topic | `ba.public_finance.budget.taxation` | fact-based |
| — Economic Survey (आर्थिक सर्वेक्षण) | Topic | `ba.public_finance.survey` |  |
| — — — Key Economic Indicators (प्रमुख आर्थिक संकेतक) | Micro-topic | `ba.public_finance.survey.indicators` |  |
| **Government Schemes** (सरकारी योजनाएँ) | Chapter | `ba.government_schemes` |  |
| — Financial and Social Schemes (वित्तीय और सामाजिक योजनाएँ) | Topic | `ba.government_schemes.schemes` | fact-based |
| — — — MUDRA, Stand-Up India, PM SVANidhi (मुद्रा, स्टैंड-अप इंडिया, पीएम स्वनिधि) | Micro-topic | `ba.government_schemes.schemes.credit_schemes` | fact-based |
| — — — PMJJBY and PMSBY (पीएमजेजेबीवाई और पीएमएसबीवाई) | Micro-topic | `ba.government_schemes.schemes.insurance_schemes` | fact-based |

### Computer Knowledge — `bank_computer` (prefix `bc`)

8 chapters, 17 topics, 0 subtopics, 28 micro-topics (banking-mapped nodes only).

| Node | Level | Id | Question categories |
|---|---|---|---|
| **Computer Fundamentals** (कंप्यूटर की मूल बातें) | Chapter | `bc.fundamentals` |  |
| — History and Generations (इतिहास और पीढ़ियाँ) | Topic | `bc.fundamentals.history` | fact-based |
| — — — Generations of Computers (कंप्यूटर की पीढ़ियाँ) | Micro-topic | `bc.fundamentals.history.generations` | fact-based |
| — — — Types of Computers (कंप्यूटर के प्रकार) | Micro-topic | `bc.fundamentals.history.types` | fact-based |
| — Hardware (हार्डवेयर) | Topic | `bc.fundamentals.hardware` |  |
| — — — CPU, ALU and Control Unit (सीपीयू, एएलयू और नियंत्रण इकाई) | Micro-topic | `bc.fundamentals.hardware.cpu` |  |
| — — — Input and Output Devices (इनपुट और आउटपुट डिवाइस) | Micro-topic | `bc.fundamentals.hardware.io_devices` |  |
| — Memory and Storage (मेमोरी और भंडारण) | Topic | `bc.fundamentals.memory` |  |
| — — — RAM, ROM and Cache (रैम, रोम और कैश) | Micro-topic | `bc.fundamentals.memory.primary_memory` |  |
| — — — Secondary Storage (द्वितीयक भंडारण) | Micro-topic | `bc.fundamentals.memory.secondary_storage` |  |
| — — — Memory Units (मेमोरी इकाइयाँ) | Micro-topic | `bc.fundamentals.memory.units` |  |
| — Number System (संख्या पद्धति) | Topic | `bc.fundamentals.number_system` | conversion |
| — — — Binary, Octal, Decimal, Hexadecimal (द्विआधारी, अष्टाधारी, दशमलव, षोडशाधारी) | Micro-topic | `bc.fundamentals.number_system.conversions` | conversion |
| **Software and Operating Systems** (सॉफ़्टवेयर और ऑपरेटिंग सिस्टम) | Chapter | `bc.software` |  |
| — Types of Software (सॉफ़्टवेयर के प्रकार) | Topic | `bc.software.software_types` | concept-based |
| — — — System and Application Software (सिस्टम और एप्लिकेशन सॉफ़्टवेयर) | Micro-topic | `bc.software.software_types.system_application` | concept-based |
| — — — Programming Languages and Translators (प्रोग्रामिंग भाषाएँ और अनुवादक) | Micro-topic | `bc.software.software_types.languages` | concept-based |
| — Operating Systems (ऑपरेटिंग सिस्टम) | Topic | `bc.software.os` |  |
| — — — Functions and Types of OS (ओएस के कार्य और प्रकार) | Micro-topic | `bc.software.os.os_functions` |  |
| — — — Windows and Linux Basics (विंडोज़ और लिनक्स की मूल बातें) | Micro-topic | `bc.software.os.windows_linux` |  |
| **MS Office** (एमएस ऑफ़िस) | Chapter | `bc.ms_office` |  |
| — MS Word (एमएस वर्ड) | Topic | `bc.ms_office.word` | shortcut keys, feature-based |
| — MS Excel (एमएस एक्सेल) | Topic | `bc.ms_office.excel` |  |
| — — — Formulas and Functions (सूत्र और फ़ंक्शन) | Micro-topic | `bc.ms_office.excel.formulas` |  |
| — MS PowerPoint (एमएस पावरपॉइंट) | Topic | `bc.ms_office.powerpoint` |  |
| — Keyboard Shortcuts (कीबोर्ड शॉर्टकट) | Topic | `bc.ms_office.shortcuts` |  |
| **Database Basics** (डेटाबेस की मूल बातें) | Chapter | `bc.dbms` |  |
| — DBMS Concepts (डीबीएमएस अवधारणाएँ) | Topic | `bc.dbms.db_concepts` | concept-based |
| — — — Keys and Relations (कुंजियाँ और संबंध) | Micro-topic | `bc.dbms.db_concepts.keys` | concept-based |
| — — — Basic SQL (मूल एसक्यूएल) | Micro-topic | `bc.dbms.db_concepts.sql_basics` | concept-based |
| **Networking and Internet** (नेटवर्किंग और इंटरनेट) | Chapter | `bc.networking` |  |
| — Network Basics (नेटवर्क की मूल बातें) | Topic | `bc.networking.network_basics` | concept-based |
| — — — LAN, MAN and WAN (लैन, मैन और वैन) | Micro-topic | `bc.networking.network_basics.lan_wan` | concept-based |
| — — — Topologies (टोपोलॉजी) | Micro-topic | `bc.networking.network_basics.topology` | concept-based |
| — — — Hub, Switch, Router, Modem (हब, स्विच, राउटर, मॉडेम) | Micro-topic | `bc.networking.network_basics.devices` | concept-based |
| — — — OSI and TCP/IP Models (ओएसआई और टीसीपी/आईपी मॉडल) | Micro-topic | `bc.networking.network_basics.osi` | concept-based |
| — Internet (इंटरनेट) | Topic | `bc.networking.internet` |  |
| — — — HTTP, FTP, SMTP, DNS (एचटीटीपी, एफ़टीपी, एसएमटीपी, डीएनएस) | Micro-topic | `bc.networking.internet.protocols` |  |
| — — — Web Browsers and E-mail (वेब ब्राउज़र और ई-मेल) | Micro-topic | `bc.networking.internet.web_email` |  |
| **Cyber Security** (साइबर सुरक्षा) | Chapter | `bc.security` |  |
| — Threats (ख़तरे) | Topic | `bc.security.threats` | concept-based |
| — — — Virus, Worm, Trojan, Ransomware (वायरस, वर्म, ट्रोजन, रैंसमवेयर) | Micro-topic | `bc.security.threats.malware` | concept-based |
| — — — Phishing, Vishing and Social Engineering (फ़िशिंग, विशिंग और सोशल इंजीनियरिंग) | Micro-topic | `bc.security.threats.phishing` | concept-based |
| — Protection (सुरक्षा उपाय) | Topic | `bc.security.protection` |  |
| — — — Firewall and Antivirus (फ़ायरवॉल और एंटीवायरस) | Micro-topic | `bc.security.protection.firewall_antivirus` |  |
| — — — Encryption and Digital Signatures (एन्क्रिप्शन और डिजिटल हस्ताक्षर) | Micro-topic | `bc.security.protection.encryption_basics` |  |
| **Digital Banking Technology** (डिजिटल बैंकिंग प्रौद्योगिकी) | Chapter | `bc.digital_banking` |  |
| — Digital Channels (डिजिटल चैनल) | Topic | `bc.digital_banking.channels` | concept-based |
| — — — Internet and Mobile Banking (इंटरनेट और मोबाइल बैंकिंग) | Micro-topic | `bc.digital_banking.channels.internet_mobile_banking` | concept-based |
| — — — ATMs and Cards (एटीएम और कार्ड) | Micro-topic | `bc.digital_banking.channels.atm_cards` | concept-based |
| — — — Cloud Computing Basics (क्लाउड कंप्यूटिंग की मूल बातें) | Micro-topic | `bc.digital_banking.channels.cloud_basics` | concept-based |
| **Computer Abbreviations** (कंप्यूटर संक्षिप्ताक्षर) | Chapter | `bc.abbreviations` |  |
| — Common Abbreviations (सामान्य संक्षिप्ताक्षर) | Topic | `bc.abbreviations.common` | full form |

## Part 7 — Common topic mapping across exams

Cell = stages in which the chapter is mapped (P = Prelims, M = Mains, D = Descriptive, S = Single exam). Empty = not in that exam.

### quant

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Data Interpretation | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Data Sufficiency | S | P | M |  | M |  | M |  |
| Quantity Comparison | S | P | M |  | M |  | M |  |
| Number Series | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Quadratic Equations | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Percentage | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Ratio and Proportion | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Average | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Profit and Loss | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Simple and Compound Interest | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Partnership | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Mixture and Alligation | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Time and Work | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Pipes and Cisterns | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Time, Speed and Distance | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Problems on Ages | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Mensuration | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Probability | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Permutation and Combination | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Simplification |  |  | P | P+M | P | P+M | P | P+M |
| Approximation |  |  | P | P+M | P | P+M | P | P+M |
| Number System |  |  |  | P+M |  | P+M |  | P+M |

### reasoning

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Inequality | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Syllogism | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Coding-Decoding | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Blood Relations | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Direction and Distance | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Order and Ranking | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Alphanumeric Series | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Seating Arrangement | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Puzzles | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Miscellaneous | S | P | P+M | P+M | P+M | P+M | P+M | P+M |
| Input-Output | S | P | M | M | M | M | M | M |
| Data Sufficiency | S | P | M | M | M | M | M | M |
| Logical (Verbal) Reasoning | S | P | M | M | M | M | M | M |

### english

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Vocabulary | S | P | P+M | P+M | M | M | P+M | P+M |
| Grammar | S | P | P+M | P+M | M | M | P+M | P+M |
| Sentence Structure | S | P | P+M | P+M | M | M | P+M | P+M |
| Comprehension | S | P | P+M | P+M | M | M | P+M | P+M |
| Banking Question Formats | S | P | P+M | P+M | M | M | P+M | P+M |
| Descriptive English |  |  | D |  |  |  | D |  |

### hindi

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Word Classes (Shabd Vichar) | S |  |  |  | M | M |  |  |
| Word Formation | S |  |  |  | M | M |  |  |
| Vocabulary | S |  |  |  | M | M |  |  |
| Sentence | S |  |  |  | M | M |  |  |
| Comprehension | S |  |  |  | M | M |  |  |

### general_awareness

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Current Affairs | S |  | M | M | M | M | M | M |
| Static GK | S |  | M | M | M | M | M | M |
| Indian Economy | S |  | M | M | M | M | M | M |
| Indian Polity and Constitution | S |  | M | M | M | M | M | M |
| Geography | S |  | M | M | M | M | M | M |
| Science and Technology Developments | S |  | M | M | M | M | M | M |

### banking_awareness

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Banking History and Structure | S |  | M | M | M | M | M | M |
| Reserve Bank of India | S |  | M | M | M | M | M | M |
| Banking Regulation | S |  | M | M | M | M | M | M |
| Banking Products and Services | S |  | M | M | M | M | M | M |
| Payment Systems | S |  | M | M | M | M | M | M |
| Indian Financial System | S |  | M | M | M | M | M | M |
| Budget and Economic Survey | S |  | M | M | M | M | M | M |
| Government Schemes | S |  | M | M | M | M | M | M |

### computer

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Computer Fundamentals | S |  |  |  | M | M | M | M |
| Software and Operating Systems | S |  |  |  | M | M | M | M |
| MS Office | S |  |  |  | M | M | M | M |
| Database Basics | S |  |  |  | M | M | M | M |
| Networking and Internet | S |  |  |  | M | M | M | M |
| Cyber Security | S |  | M |  | M | M | M | M |
| Digital Banking Technology | S |  | M |  | M | M | M | M |
| Computer Abbreviations | S |  |  |  | M | M | M | M |

### professional_it

| Chapter | IBPS RRB Officer Scale-II (IT) | IBPS SO IT Officer | IBPS PO | IBPS Clerk | IBPS RRB PO | IBPS RRB Clerk | SBI PO | SBI Clerk |
|---|---|---|---|---|---|---|---|---|
| Engineering Mathematics | S | M |  |  |  |  |  |  |
| Digital Logic | S | M |  |  |  |  |  |  |
| Computer Organization and Architecture | S | M |  |  |  |  |  |  |
| Programming and Data Structures | S | M |  |  |  |  |  |  |
| Algorithms | S | M |  |  |  |  |  |  |
| Theory of Computation | S | M |  |  |  |  |  |  |
| Compiler Design | S | M |  |  |  |  |  |  |
| Operating Systems | S | M |  |  |  |  |  |  |
| Database Management Systems | S | M |  |  |  |  |  |  |
| Computer Networks | S | M |  |  |  |  |  |  |
| Java and Object-Oriented Programming | S | M |  |  |  |  |  |  |
| Software Engineering | S | M |  |  |  |  |  |  |
| Web Technologies | S | M |  |  |  |  |  |  |
| Information Security | S | M |  |  |  |  |  |  |
| Cryptography | S | M |  |  |  |  |  |  |
| Cyber Security | S | M |  |  |  |  |  |  |
| Core Banking Solutions | S | M |  |  |  |  |  |  |
| ATM and Card Technology | S | M |  |  |  |  |  |  |
| UPI, IMPS, NEFT and RTGS | S | M |  |  |  |  |  |  |
| NPCI and Payment Systems | S | M |  |  |  |  |  |  |
| Cloud Computing | S | M |  |  |  |  |  |  |
| Data Warehousing and Data Mining | S | M |  |  |  |  |  |  |
| Artificial Intelligence and Machine Learning | S | M |  |  |  |  |  |  |
| IT Governance and Audit | S | M |  |  |  |  |  |  |
| IT Risk Management | S | M |  |  |  |  |  |  |
| Banking IT Infrastructure | S | M |  |  |  |  |  |  |
| Disaster Recovery and Business Continuity | S | M |  |  |  |  |  |  |
| Emerging Banking Technologies | S | M |  |  |  |  |  |  |

## Part 8 — Official syllabus versus supplementary audit

| Exam | Official (from notification) | Supplementary / draft (our coverage) |
|---|---|---|
| IBPS RRB Officer Scale-II (IT) | Stages only ("Single Level Examination", Common Interview). No section table. | All 910 chapter-to-micro-topic nodes are draft. |
| IBPS SO IT Officer | Preliminary Examination: English Language, Reasoning, Quantitative Aptitude<br>Main Examination: Professional Knowledge | All 657 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| IBPS PO | Preliminary Examination: English Language, Quantitative Aptitude, Reasoning Ability<br>Main Examination: Reasoning, General/ Economy/ Banking Awareness / Digital/ Financial Awareness including RBI circulars, English Language, Data Analysis & Interpretation<br>Descriptive Paper (Essay and Comprehension): Essay and Comprehension | All 480 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| IBPS Clerk | Preliminary Examination: English Language, Numerical Ability, Reasoning Ability<br>Main Examination: General/ Financial Awareness, General English, Reasoning Ability, Quantitative Aptitude | All 457 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| IBPS RRB PO | Preliminary Examination: Reasoning, Quantitative Aptitude<br>Main Examination: Reasoning, Computer Knowledge, General Awareness, English Language or Hindi Language (candidate opts one), Quantitative Aptitude | All 551 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| IBPS RRB Clerk | Preliminary Examination: Reasoning, Numerical Ability<br>Main Examination: Reasoning, Computer Knowledge, General Awareness, English Language or Hindi Language (candidate opts one), Numerical Ability | All 546 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| SBI PO | Phase-I: Preliminary Examination: English Language, Quantitative Aptitude, Reasoning Ability<br>Phase-II: Main Examination (Objective): Reasoning & Computer Aptitude, Data Analysis & Interpretation, General Awareness / Economy / Banking Knowledge, English Language<br>Phase-II: Descriptive Test (Communication Skills): Emails, Situation Analysis, Report / Précis Writing | All 521 chapter-to-micro-topic nodes are supplementary (recommended coverage). |
| SBI Clerk | Preliminary Examination: English Language, Numerical Ability, Reasoning Ability<br>Main Examination: General/ Financial Awareness, General English, Quantitative Aptitude, Reasoning Ability & Computer Aptitude | All 510 chapter-to-micro-topic nodes are supplementary (recommended coverage). |

Not official anywhere: the GATE CS baseline for Professional Knowledge, and every Banking-IT chapter. These are a product decision for IT Officer preparation. History is deliberately not mapped to Banking.
