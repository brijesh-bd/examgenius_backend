# Review round 3 — for approval (no data/code changed yet)

Status key: **O** official (confirmed in a CEN PDF in `sources/cen/`) · **U** unverified (named by a
coaching page) · **D** draft (not named by any source) · **—** not included.

## A. CEN 08/2026 — Station Master (`sources/cen/examsDocuments.pdf`)

Verified by reading the PDF text (46 pages; syllabus = para 15.1, pages 21–22):
single-stage CBT, 100 questions, 120 min, −1/3, then CBAT (70 : 30 merit). The notice says
"topics listed above are illustrative and not necessarily exhaustive".

| CEN section (marks) | Topics as printed in the CEN |
|---|---|
| Basic Science & Mathematics (30) | Number System, Ratio & Proportions, Averages, Percentages, Profit, Loss & Discounts, Time, Speed, Distance, Power & Work, Algebra, Linear Equations, Arithmetic Progression, LCM, HCF, Geometry and Trigonometry, Area & Volumes, Probability and Statistics (basic level); Units, Measurements, Mass Weight and Density, Work Power, Energy, Kinetic Energy, Friction, Speed, Velocity, Relative Velocity, Heat and Temperature, Basic Electricity, Levers and Simple Machines |
| Data Analysis & Interpretation (30) | Multi-source data analysis — text, tabular and graphical data (charts, graphs, scatter plot, pie chart, statistical curve distribution), Venn Diagrams, Data Sufficiency, Data Arrangement |
| Logical Reasoning (part of Logical Capability, 20) | Binary Logic, Syllogism, Clocks & Calendars, Assumptions, Blood Relations, Family Tree, logic-based puzzles |
| Reading Comprehension (part of Logical Capability) | English passages (History, Society, Literature, Science, Environment, Abstract, Mythology, Technology, Culture): main idea, supporting idea, application, logical structure & style |
| Mental Reasoning (20) | Analogy, Series Completion, Coding-Decoding, Ranking and Arrangements |

Station Master is **not in the app catalogue**. Proposal (needs your approval — new exam = scope change):
add exam `rrb_station_master` with the CEN's own three sections as subjects, mapped onto the shared libraries:

| Proposed subject | Library nodes reused | Status | New nodes needed |
|---|---|---|---|
| Basic Science, Mathematical & Analytical Capability | Maths chapters listed above; GS Physics: units, motion (speed/velocity/relative velocity), force (friction), work & energy, heat, electricity, simple machines; Reasoning: data interpretation, Venn, data sufficiency | **O** at chapter/topic level for named items | Maths: Arithmetic Progression, Probability (basic); DI: scatter plot / statistical distribution, multi-source data |
| Logical Capability | Reasoning: syllogism, calendar & clock, statement–assumption, blood relations, puzzles | **O** for named items | Binary Logic; Reading Comprehension (English) |
| Mental Reasoning | Reasoning: analogy, number & alphabet series, coding-decoding, order & ranking, seating arrangement | **O** for named items | — |

Everything below a named heading stays **D**. NTPC is **not** verified by this CEN; NTPC stays U/D
until its own CEN (e.g. CEN 06/2026 / 07/2026 as cited by Testbook) is provided.

## B. Mathematics — exam-wise coverage (revised proposal)

| Chapter | NTPC | Group D | ALP | JE | Tech Gr-I Signal | Tech Gr-III | Station Master* |
|---|---|---|---|---|---|---|---|
| Number System (incl. rational/irrational) | U | U | U | U | U | U | O |
| BODMAS & Simplification | U | U | U | U | U | U | D |
| Decimals & Fractions | U | U | U | U | — | U | D |
| LCM & HCF | U | U | U | U | — | U | O |
| Ratio & Proportion | U | U | U | U | — | U | O |
| Percentage | U | U | U | U | — | U | O |
| Average | U | U | D | D | — | D | O |
| Profit & Loss (incl. discount) | U | U | U | U | — | U | O |
| Simple & Compound Interest | U | U | U | U | — | U | — |
| Time & Work | U | U | U | U | — | U | O ("Power & Work") |
| Pipes & Cisterns | D | U | U | U | — | U | — |
| Time, Speed & Distance | U | U | U | U | — | U | O |
| Problems on Trains / Boats & Streams | U | D | D | D | — | D | D |
| Problems on Ages | D | U | U | U | — | U | — |
| Algebra (identities, linear equations) | U | U | U | U | U | U | O |
| **NEW topic: Quadratic Equations** (under Algebra) | D | D | D | D | U | — | D |
| **NEW chapter: Arithmetic Progression** | — | — | — | — | U | — | O |
| Geometry (incl. similar triangles, Pythagoras, coordinate basics) | U | U | U | U | U | U | O |
| Mensuration 2D / 3D (area, surface area, volume) | U | U | U | U | U (surface area & volume) | U | O |
| Trigonometry (incl. heights & distances) | U | U | U | U | U | U | O |
| Elementary Statistics | U | U | U | U | — | U | O |
| **NEW chapter: Probability (basic)** | — | — | — | — | — | — | O |
| Data Interpretation | U | U | D | D | — | — | (in DI subject) |
| Square & Cube Root | D | U | U | U | — | U | — |
| Calendar & Clock | — | U | U | U | — | U | (Logical Capability) |
| Mixture & Alligation / Approximation | D | D | D | D | — | D | — |
| Partnership | U | D | D | D | — | D | — |

\* Only if Station Master is approved as an exam. Tech Gr-I/Gr-III **U** = Testbook Technician page
(Gr-I list: number system, rational & irrational, BODMAS, quadratic equations, arithmetic progression,
similar triangles, Pythagoras, coordinate geometry, trigonometric ratios, heights & distances, surface
area & volume; Gr-III list = Group D-style arithmetic). Gr-I chapters not on its list become **—**
(hidden), instead of today's "everything draft".
Within the existing chapters, Gr-I uses only the matching topics (e.g. Geometry → triangles theorems +
coordinate; Number System → types of numbers).

## C. Three additional subjects (not student-facing until approved)

| Subject | Exams | Source | Classification | Proposed hierarchy (chapters) | Status |
|---|---|---|---|---|---|
| Basic Science & Engineering | ALP CBT-2 Part A; Tech Gr-I Signal | Adda247 ALP, PW ALP CBT-2, Testbook Technician (coaching). Station Master CEN covers the physics part under its Maths section, not as this subject | Exam-specific | Engineering drawing & measurement · Units, mass, density · Work, power, energy · Speed & velocity · Heat & temperature · Basic electricity · Levers & simple machines · Occupational safety · Environment education · IT literacy · *(Gr-I only)* Electronics & measurement (digital electronics, microprocessors, CRO, transducers) | U chapters, D below |
| Basics of Computers & Applications | JE CBT-2 (10 Q); Tech Gr-I Signal (20 Q) | Adda247 JE, Testbook Technician | Exam-specific (also a GA topic for NTPC) | Architecture · I/O & storage · Data representation · Operating systems · MS Office · Internet, email & browsers · Networking · Viruses & security | U chapters, D below |
| Basics of Environment & Pollution Control | JE CBT-2 (10 Q) | Adda247 JE | Exam-specific | Environment & ecosystems · Pollution types & effects · Control strategies · Waste management · Global warming, acid rain, ozone | U chapters, D below |

Note: the ALP and JE *technical* subjects already exist in the app as flat topic lists and are unchanged.

## D. Gemini — current state

Live generation: **NOT TESTED**. The backend has a Gemini key configured (`.env`) and models
`gemini-3.8-flash → gemini-3.5-flash-lite → gemini-3.5-flash → gemini-flash-lite-latest`.
Billing tier of that key is unknown to me. No paid model has been enabled.
