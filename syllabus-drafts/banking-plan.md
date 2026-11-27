# Banking syllabus: PYQ mapping, database and implementation plan

Companion to `banking-coverage.md`, which is generated and holds Parts 1–8. This file covers Parts 9–10 and the build plan. Written by hand on 2026-11-27.

## Checklist

| # | Item | State |
|---|---|---|
| 1 | IBPS RRB Officer Scale-II (IT): Professional Knowledge (GATE CS, 10 sections, plus 18 Banking-IT chapters) | Done. **Draft:** the notification prints no section table |
| 2 | Scale-II remaining subjects: Reasoning, Quant, English/Hindi, GA, Banking Awareness, Computer | Done (draft) |
| 3 | IBPS SO IT: Prelims (English, Reasoning, Quant), Mains (Professional Knowledge) | Done (sections official: CRP SPL-XV) |
| 4 | IBPS PO: Prelims, Mains, Descriptive (CRP PO/MT-XVI) | Done |
| 5 | IBPS Clerk: Prelims, Mains (CRP CSA-XV; no Computer section) | Done |
| 6 | IBPS RRB PO / RRB Clerk: Prelims, Mains with English-or-Hindi option and Computer Knowledge (CRP RRBs-XIV) | Done |
| 7 | SBI PO: Prelims, Mains, Descriptive (CRPD/PO/2026-27/09) | Done |
| 8 | SBI Clerk: Prelims, Mains; LLPT listed but not practised | Done |
| 9 | Current affairs feed (Year → Month → Week → Category → Event) | **Pending.** This is dated content, not syllabus (see below) |
| 10 | PYQ ingestion | **Pending.** No PYQs are stored, and none will be invented |
| 11 | Mock tests per stage | **Pending.** Next roadmap phase |
| 12 | Flutter: stage tabs on Preparation | **Pending.** The API is ready: `GET /exams/:id/pattern` |

Still to verify:
- CRP CSA-XVI and RRBs-XV (not found).
- CRP SPL-XVI (exists, but the PDF was not opened).
- The previous SBI cycles. Cycle differences are recorded only for IBPS PO.

## Part 9 — PYQ and mock test mapping

**PYQs.** None are stored. IBPS and SBI do not publish official question papers, so a PYQ may only be stored if all of these hold:
- It comes from an attributable source: an official answer key, or a memory-based paper the team licenses.
- It is tagged `sourceType: 'pyq_official' | 'pyq_memory_based'`, `examId`, `stage`, `year` and `shift`.
- It is reviewed by a person before it is published.

The AI must never label a generated question as a PYQ. Proposed collection `previous_year_questions`:

```json
{ "_id": "pyq:ibps_po:2025:prelims:s1:q14", "examId": "ibps_po", "stage": "prelims", "year": 2025, "shift": 1,
  "nodeIds": ["bq.number_series.missing_series.difference_based.second_difference"],
  "question": {"en": "…", "hi": "…"}, "options": ["…"], "correctIndex": 2, "explanation": "…",
  "sourceType": "pyq_memory_based", "sourceRef": "…", "reviewStatus": "approved", "difficulty": "medium" }
```

PYQs map to the same `nodeId`s as practice questions. Frequency per chapter and per stage can then be computed rather than typed in by hand.

**Mock tests.** A mock is generated from `GET /exams/:id/pattern`:
- One section per official section, using the official question count and time.
- Questions are drawn from the chapters mapped to that stage (`stages` on each mapping).

Proposed `mock_tests` document:

```json
{ "_id": "mock:ibps_po:prelims:v1", "examId": "ibps_po", "stage": "prelims", "patternSource": "ibps_po_xvi",
  "sections": [{ "name": "English Language", "subjectIds": ["english"], "questions": 30, "marks": 30, "minutes": 20 }],
  "negativeMarking": 0.25, "status": "draft" }
```

SBI Prelims prints no per-section marks, so its mock uses the 100-mark total only.

## Part 10 — Database architecture

The normalised design already exists for Railway and SSC. Banking reuses it; nothing is duplicated.

| Requested entity | Where it lives | Notes |
|---|---|---|
| exams | `src/data/examCatalog.js` (served by `GET /exams`) | New: `ibps_rrb_so_it` |
| exam_stages, papers | `BANK_PATTERNS` in `syllabusTrees/bankExams.js` (served by `GET /exams/:id/pattern`) | Stage → section with official question, mark and time figures |
| subjects, chapters, topics, subtopics, micro_topics | `syllabus_nodes`: one document per master node, `nodeType` = chapter/topic/subtopic/concept | Stable ids `<prefix>.<slug path>`, `parentId`, `displayOrder`, `isActive`, `contentHash`, version history in `syllabus_node_history` |
| exam_syllabus_mappings | `syllabus_exam_nodes`: one document per exam × node | `status`, `sourceReferences`, `difficulty`, **`stages`** (new) |
| exam_sources | `BANK_SOURCES` (URL, page, `checkedOn`) | Sources are referenced by id from each mapping |
| difficulty_levels | Generation parameter (easy/medium/hard; notes basic/exam/advanced) plus a default per exam | Applies to every node, so it is not stored per node |
| question_banks | The existing question bank (questions carry `nodeId`) | Unchanged |
| previous_year_questions, mock_tests | Proposed above | Not built |

Example documents, produced by `npm run syllabus`:

```json
{ "_id": "professional_it:pk.dbms.normalisation.normal_forms", "syllabusId": "professional_it", "subjectId": "professional_it",
  "nodeId": "pk.dbms.normalisation.normal_forms", "parentId": "pk.dbms.normalisation", "nodeType": "concept",
  "titleEn": "1NF, 2NF, 3NF, BCNF", "titleHi": "1NF, 2NF, 3NF, BCNF", "questionPatterns": ["conceptual", "numerical"],
  "displayOrder": 2, "isActive": true }
{ "_id": "ibps_so_it:pk.dbms.normalisation.normal_forms", "examId": "ibps_so_it", "nodeId": "pk.dbms.normalisation.normal_forms",
  "status": "supplementary", "sourceReferences": ["ibps_spl_xv"], "stages": ["mains"], "difficulty": "hard", "isActive": true }
```

A topic shared by several exams (for example `bq.interest.compound_interest.ci_si_difference`) is **one** `syllabus_nodes` document and one `syllabus_exam_nodes` document per exam.

## Build plan (small, testable steps)

1. **Done.** Libraries, mapping, `/exams/:id/pattern`, tests (`test/bank.test.js`) and the Flutter node prefixes.
2. **Sync the database.** Run `npm run syllabus` in `examgenius_backend`. It is idempotent and adds the new nodes and mappings.
3. **Stage filter in the API.** Add `?stage=prelims` to `GET /syllabus/:examId/:subjectId/tree`. This filters chapters by `entry.stages`. Add a test that Prelims never returns GA.
4. **Flutter Preparation.** Add Prelims / Mains / Descriptive chips that read `/exams/:id/pattern` and pass the stage to the tree request. Add strings to both ARBs, plus a widget test.
5. **Chapter-wise generation.** This already works for any node id: `selectedNodeIds`. The scheme for each exam now reaches the AI prompt (`BANK_SCHEMES`).
6. **Mock tests.** Build the engine from the pattern, one timed section per official section, with ¼ negative marking.
7. **Performance and completion tracking.** Extend `learning_progress` to node ids. Completion % = completed leaves ÷ `conceptCount` per stage.
8. **Current affairs.** Add a separate dated collection `current_affairs_items` with `{date, week, category, event, explanation, examRelevance: [examId]}`. It is curated with a review step and linked to `ga.current_affairs` and `ba.*` nodes. It does not belong in the syllabus tree.
