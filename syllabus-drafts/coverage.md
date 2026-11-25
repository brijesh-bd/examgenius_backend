# DRAFT — Railway exam-wise syllabus coverage (for review)

## 0. Revised exam-wise subject mapping (decision 1: follow the sources)

Only these subjects appear for each exam. Changes vs. today's app are marked.

| Exam | Subjects shown | Change vs. current app |
|---|---|---|
| RRB NTPC | Mathematics · Reasoning · General Awareness (science = a GA topic) | **remove** separate General Science |
| RRB Group D | Mathematics · Reasoning · General Science · General Awareness | none |
| RRB ALP | Mathematics · Reasoning (Mental Ability) · General Science | **remove** General Awareness; Basic Science & Engg pending (extra_subjects.md) |
| RRB JE | Mathematics · Reasoning · General Awareness · General Science (CBT-1; CBT-2 Physics & Chemistry as a stage of the same subject) | technical subject unchanged; Computers / Environment pending |
| RRB Technician Gr-I Signal | Mathematics · Reasoning · General Awareness | **new exam**; Computers + Basic Science & Engg pending |
| RRB Technician Gr-III | Mathematics · Reasoning · General Awareness · General Science (basic physics/engineering only) | **new exam** |

Existing saved practice / notes for removed subjects stay in the Library; the subjects are only hidden from new Preparation.

## Complete hierarchy examples (one path per subject, ids stable)

```
Railway › RRB NTPC › General Intelligence & Reasoning
  › Analogy (rr.analogy)                                        unverified
    › Number Analogy (rr.analogy.number)                          draft
      › Powers (rr.analogy.number.powers)                         draft
        › Square-based analogy                                    draft · difficulty medium

Railway › RRB Group D › General Intelligence & Reasoning
  › Number Series › Question type › Wrong term                    unverified › draft › draft · easy

Railway › RRB Group D › General Science
  › Physics (gs.physics) › Force & laws of motion › Newton's laws   unverified › unverified › draft · easy

Railway › RRB JE › General Awareness
  › History › Modern India › Freedom struggle › Quit India         unverified › draft › draft › draft · medium

Railway › RRB NTPC › General Awareness
  › General Science (inside GA) › Biology › Human physiology › Digestive system   unverified › draft › draft · medium

Railway › RRB Technician Gr-III › General Science
  › Physics › Electricity › Ohm's law                              unverified › unverified › draft · easy

Railway › RRB ALP › Mathematics
  › Time & Work › Combined work › Working together                 (existing rm.* tree, relabelled unverified/draft)
```

Official verification: **pending** — the CEN 08/2026 (Station Master) PDF was not found in the
project, Desktop/Downloads/Documents or Google Drive. When available it verifies NTPC only.

Researched 2026-11-25. **No official RRB text could be opened** (TLS errors,
DNS failure, refused connections, 401/302 — listed at the end), so **no node is
`official`**. Status meanings used here:

| Status | Meaning |
|---|---|
| `official` | Confirmed in a CEN PDF in `sources/cen/` — **none yet** |
| `unverified` | Named for that exam by at least one retrieved coaching page |
| `draft` | Our breakdown below a named heading, or not named by any source |

Libraries (shared concepts, written once): `reasoning.md`, `general_awareness.md`,
`general_science.md`, `mathematics.md`. This file says which parts each exam uses.

## 1. Exam × subject (as the retrieved pages describe the pattern)

| Exam | Maths | Reasoning | General Awareness | General Science | Other subjects (out of this phase) |
|---|---|---|---|---|---|
| NTPC CBT-1 / CBT-2 | 30 / 35 Q | 30 / 35 Q | 40 / 50 Q | **inside GA** (10th CBSE) — no separate section | — |
| Group D | 25 Q | 30 Q | 20 Q (GA & CA) | 25 Q (Phy/Chem/Life Sc., 10th) | — |
| ALP CBT-1 (2026 pattern) | ✓ | ✓ (Mental Ability) | **removed** (older guides still list it) | ✓ | — |
| ALP CBT-2 Part A | ✓ | ✓ | — | — | Basic Science & Engineering |
| JE CBT-1 | 30 Q | 25 Q | 15 Q | 30 Q | — |
| JE CBT-2 (non-technical) | — | — | 15 Q | Physics & Chemistry 15 Q | Computers 10 · Environment & Pollution 10 |
| Technician Gr-I Signal | 20 Q (Class-10 algebra/geometry style) | 15 Q | 10 Q | **none** | Computers 20 · Basic Science & Engg 35 |
| Technician Gr-III | 25 Q (arithmetic style) | 25 Q | 10 Q | 40 Q — **units, energy, heat, basic electricity, simple machines, safety, environment, IT literacy; no Chemistry/Biology** | — |

Sources: Adda247 NTPC/Group D/ALP/JE pages, Testbook NTPC/Technician, Oliveboard Group D/JE, PW ALP CBT-2 (URLs in §5).

**Conflicts with the current app catalogue — need your decision:**
1. App gives **NTPC a separate General Science subject**; sources place science inside GA.
2. App gives **ALP a General Awareness subject**; 2026-pattern pages say GA was removed from ALP CBT-1.
3. **Technician Gr-I and Gr-III are not in the app**; their subjects differ (Gr-I has no General Science; Gr-III's "General Science" is basic physics/engineering, not the Group D-style science).
4. ALP CBT-1 science on Adda247 includes Class 11–12-style items (thermodynamics, surface chemistry, modern physics) while Group D is 10th level.

## 2. Reasoning — chapter availability per exam

Official-style heading list (same wording on Adda247 for Group D, ALP, JE; Testbook for both Technician grades):
*Analogies · Alphabetical & Number Series · Coding-Decoding · Mathematical Operations · Relationships · Syllogism · Jumbling · Venn Diagram · Data Interpretation & Sufficiency · Conclusions & Decision Making · Similarities & Differences · Analytical Reasoning · Classification · Directions · Statement – Arguments & Assumptions.*
NTPC list (Adda247): *Analogies · Completion of Number & Alphabetical Series · Coding-Decoding · Mathematical Operations · Similarities & Differences · Relationships · Analytical Reasoning · Syllogism · Jumbling · Venn Diagrams · Puzzle · Data Sufficiency · Statement-Conclusion · Statement-Courses of Action · Decision Making · Maps · Interpretation of Graphs.*

U = unverified (named for the exam) · D = draft (only implied / coaching extra) · — = not included

| Chapter (library id) | NTPC | Group D | ALP | JE | Tech I | Tech III |
|---|---|---|---|---|---|---|
| Analogy | U | U | U | U | U | U |
| Classification | D¹ | U | U | U | U | U |
| Number Series | U | U | U | U | U | U |
| Alphabet Series | U | U | U | U | U | U |
| Coding-Decoding | U | U | U | U | U | U |
| Mathematical Operations | U | U | U | U | U | U |
| Blood Relations (= "Relationships") | U | U | U | U | U | U |
| Direction & Distance | D¹ | U | U | U | U | U |
| Order & Ranking | D¹ | D | D | D | D | D |
| Syllogism | U | U | U | U | U | U |
| Venn Diagrams | U | U | U | U | U | U |
| Statement & Conclusion | U | U² | U² | U² | U² | U² |
| Statement & Assumption / Arguments | D | U | U | U | U | U |
| Statement & Course of Action | U | D | D | D | D | D |
| Analytical Reasoning / Puzzles / Seating | U | U | U | U | U | U |
| Data Sufficiency | U | U | U | U | U | U |
| Decision Making | U | U | U | U | U | U |
| Jumbling | U | U | U | U | U | U |
| Similarities & Differences | U | U | U | U | U | U |
| Maps & Graph Interpretation | U | — | — | — | — | — |
| Calendar & Clock (reasoning style) | D¹ | D | D | D | D | D |
| Data Interpretation (reasoning list) | — | U | U | U | U | U |
| Non-verbal (figure parts hidden) | D¹ | D³ | — | — | — | — |
| Misc (word formation, dictionary order) | D¹ | D³ | D | D | D | D |

¹ Testbook NTPC only. ² "Conclusions" heading. ³ Oliveboard Group D only.
**ALP:** same chapters for CBT-1 and CBT-2 Part A per both pages → one mapping, stage tag `cbt1+cbt2a`.
Every subtopic / micro-concept under these chapters is `draft`.

**Automatic difficulty (decision 1, default proposal — draft):** Group D, Tech III → easy; ALP, Tech I → medium; NTPC, JE → medium (hard reserved for multi-step puzzles/syllogism possibility cases). To be adjusted after review; not exposed to students.

## 3. General Awareness — topic availability per exam

| Topic | NTPC | Group D | ALP | JE (CBT-1/2) | Tech I | Tech III |
|---|---|---|---|---|---|---|
| Current Affairs | U | U | — | U | U | U |
| History (incl. freedom struggle) | U | D⁴ | — | U | U | D |
| Geography (India & world) | U | D⁴ | — | U (India) | U | — |
| Polity & Constitution | U | D⁴ | — | U | U | D (political developments) |
| Economy | U | U (economics) | — | U | U | U (economic affairs) |
| Art & Culture | U | U | — | U | U | U |
| Static GK (sports, awards, books, days, personalities) | U | U | — | U (sports) | U (sports) | U |
| Environment | U | D | — | U | U | — |
| Science & Tech developments (space, nuclear) | U | U | — | U | U | U |
| Basics of Computers | U (inside GA) | — | — | separate CBT-2 subject | separate subject | — |
| Transport, govt schemes, PSUs, UN bodies, abbreviations, flora & fauna | U | D | — | — | — | — |
| Railways current affairs | D³ | D³ | — | — | — | — |

⁴ Listed on Oliveboard only; Adda247 lists Group D GA as current affairs.

## 4. General Science — topic availability per exam

| Area | NTPC (inside GA) | Group D | ALP CBT-1 | JE CBT-1 | JE CBT-2 Phy & Chem | Tech III |
|---|---|---|---|---|---|---|
| Physics (10th level chapters) | U | U | U | U | U (+ modern physics, semiconductors) | U (units, energy, heat, electricity only) |
| Chemistry | U | U | U (+ organic, solutions, surface chem.) | U | U (+ polymers, metallurgy, green chemistry) | — |
| Biology / Life Sciences | U | U | U (human body systems) | U | — | — |
| Simple machines, occupational safety, environment education, IT literacy | — | — | — | — | — | U |

Tech I: no General Science (Basic Science & Engineering instead — outside this phase).
Chapter-level rows inside each area are `draft` unless the source named them (e.g. Group D Physics chapters are named by Adda247 → `unverified`).

## 5. Mathematics

Tree unchanged (`mathematics.md`). New: **Tech I** draws on Class-10 items not in the arithmetic tree (quadratic equations, arithmetic progression, coordinate geometry, similar triangles) — 3 chapters to add later, `draft`. **Tech III** matches the Group D-style list.

## 6. Sources

Retrieved (coaching, all `unverified`; text obtained as paraphrase):
- Adda247 — RRB NTPC Syllabus 2026 — https://www.adda247.com/jobs/rrb-ntpc-syllabus
- Testbook — RRB NTPC Syllabus 2026 for CBT 1 & 2 — https://testbook.com/rrb-ntpc/syllabus (cites CEN 06/2026, 07/2026)
- Adda247 — RRB Group D Syllabus 2026 — https://www.adda247.com/jobs/rrb-group-d-syllabus
- Oliveboard — RRB Group D Syllabus 2026-27 — https://www.oliveboard.in/blog/rrb-group-d-syllabus-2025/ (cites CEN 09/2025)
- Adda247 — RRB ALP Syllabus 2026 — https://www.adda247.com/jobs/rrb-alp-syllabus
- PW — RRB ALP CBT 2 Syllabus — https://www.pw.live/railway/exams/rrb-alp-cbt-2-syllabus (cites CEN 01/2026; not one of the three named platforms)
- Adda247 — RRB JE Syllabus 2026 — https://www.adda247.com/rrb-je/syllabus (cites CEN 04/2026)
- Oliveboard — RRB JE syllabus blog — https://www.oliveboard.in/blog/rrb-je-syllabus/ (pattern only)
- Testbook — RRB Technician Syllabus 2026 — https://testbook.com/rrb-technician/syllabus-exam-pattern
- Earlier phase (Maths): 11 Adda247/Testbook/Oliveboard pages in `src/data/railwayMath/sources.js`.

Failed (official): rrbcdg.gov.in CEN 05/2024 PDF (TLS mismatch) · rrbahmedabad.gov.in CEN 05/2024 PDF (connection refused) · rrbbhopal.gov.in CEN 02/2025 PDF (DNS) · rrbchennai.gov.in (302 → not opened) · rrb.iitk.ac.in SATHEE (expired certificate) · a third-party Technician PDF (401).

## 7. Missing or uncertain — to settle with the CEN PDFs

1. Whether NTPC science is a GA topic (sources) or a subject (app).
2. ALP CBT-1 — GA removed? science level (10th vs 11–12)?
3. Technician notification number (CEN 02/2025 seen only in search titles) and exact subject lists for Gr-I vs Gr-III.
4. Order & Ranking, Calendar & Clock, non-verbal, word formation — named only by coaching pages.
5. NTPC "Classification" and "Directions" — not in the official-style NTPC list (likely within "Analytical Reasoning"/"Relationships").
6. Group D GA breadth (Adda247: current affairs only vs Oliveboard: full static GA).
7. Basic Science & Engineering, Computers, Environment & Pollution — subjects outside this phase's four; trees not drafted (Computers library is drafted in `general_awareness.md` for reuse).
