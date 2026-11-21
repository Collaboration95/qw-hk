# Recall Press hardening results

19 November 2026 · local macOS · Python 3.14.7

Five new sample publications contained 40 labelled claims. The frozen rules surfaced **37**, gave **28 correct verdicts**, left **9** for an agent with a reason, and silently missed **3**. There were **zero confident errors** and zero extra candidates. All five dated statements in the batch kept their original wording.

## What the score measures

A claim counts as found when registration returns its exact sentence, either linked to an observation or flagged for review. A correct automatic verdict must also match the labelled series, period, original figure and dated or current stance. A sentence absent from both lists counts as missed. The benchmark scores the deterministic rules in a fresh local workspace for each publication. An agent could recover additional claims when reading the original.

| Sample publication | Claims | Found | Correct verdicts | Confident errors | Left for agent | Missed |
|---|---:|---:|---:|---:|---:|---:|
| Autumn floor briefing, PowerPoint | 8 | 6 | 6 | 0 | 0 | 2 |
| Midyear planning minutes, Word | 8 | 8 | 5 | 0 | 3 | 0 |
| Labour correspondence, Markdown | 8 | 7 | 6 | 0 | 1 | 1 |
| Winter reading notes, Word | 8 | 8 | 6 | 0 | 2 | 0 |
| Margin notes on a release, Markdown | 8 | 8 | 5 | 0 | 3 | 0 |
| **Total** | **40** | **37** | **28** | **0** | **9** | **3** |

Automatic verdict coverage was 28/40 (70%). The confident-error rate was 0/28 verdicts. The explicit deferral rate was 9/40 (22.5%). All nine deferrals were unlinked candidates with reasons. Of the 28 issued verdicts, seven called for a correction, 14 called for a number update, five preserved a dated statement and two found no change. The scorer also ran draft generation and map rendering for each document. [Claim-by-claim results](../tests/fixtures/hardening-score.json)

Three deferrals have a determinate answer in the key. The rules held a services threshold phrased with “during,” GDP growing “at a 4.2% annual pace,” and GDP growth between two bounds. Six other deferrals need more evidence. The three silent misses were:

- “A weak order book masked what was effectively a standstill for factories.”
- “Manufacturing and services seemed neck and neck in Q3 2025.”
- “第二季度的就业人数有所增加。”

The rules and renderer were frozen **before** writing the five sample documents and the answer key. The generator and scorer were written by the same tester. The score comes from one pass over the new documents with no subsequent tuning. The rules file had SHA-256 `6663a9952346d017ca919c82bd523d01784b46fcfddcf0f12111742d7fdd52bc` before and after scoring. The generator includes the publication dates, check dates and expected links. [Generator and answer key](../tests/hardening_batch.py) · [Sample publications](../samples/hardening/)

## Eight hardening rounds

The starting suite passed 32 tests. Each round introduced new inputs, exercised them before repairs, and ended with the full public suite and all five historical demo replays.

| Round | New inputs and observed failure | Repair or verification | Suite passed |
|---|---|---|---:|
| 1 · Verdicts and missed claims | Of 27 language cases, 10 drew confident errors, seven went undetected, six were deferred and four were right. “At the time” and “In October MTI said” both drew a rewrite. An uncertain bound was treated as a firm one. | Recognize dated attributions, explicit zero growth, quarter spellings and calendar month ranges. Surface negations, hedges, multiple figures, fiscal periods, mixed bases and uncertain units for review. | 59 |
| 2 · Office reading, formatting and crashes | A soft break on slide 60 stopped every draft. The reader skipped notes and chart captions. Word hid a tracked qualifier and a footnote. Rewriting a document also reserialized unrelated package parts. Empty and corrupt decks produced unhelpful errors. | Read Office text runs, tables and supported note parts directly. Keep complex regions for review. Write just the changed part. Return distinct messages for empty and unreadable decks. | 64 |
| 3 · Revisions, duplicates and refresh failures | Two concurrent checks and repeat registration passed. A quiet map hid an earlier Skip. A reverted figure appeared as a dated statement. An interrupted response and incomplete official metadata escaped the refresh adapter. | Carry the earlier Skip into the quiet summary, give reversions an accurate label, and explain interrupted or incomplete source responses. A relocated bundle also ran with site packages disabled. | 71 |
| 4 · Missing documents and map layout | Review-only publications could disappear. The empty map lacked a next step. A long title expanded the phone layout to 1,001 pixels. With 12 or 40 documents, selecting the last one could leave its card offscreen on desktop. | Keep review-only registrations and their reasons visible on both map types. Handle zero documents directly, wrap titles, bound the publication list and bring the selected card into view. | 73 |
| 5 · Wrong subject, unit and exactness | Fourteen of 21 scope checks failed. The rules accepted manufacturing orders and nominal GDP against real output. They treated “grew by exactly 5.7%” as a number update and mistook an unchanged growth rate for unchanged output. | Check the whole clause and the named measure before issuing a verdict. Require support for exact amounts, the period and the basis of comparison. | 94 |
| 6 · Release identity | Five of nine checks failed. Matching the number first let a later survey stand in for the first estimate. A claim that a sector ranked first could pass on the strength of attribution alone. An undated “MTI said” drew a rewrite. | Resolve the named release first. Check the predicate against that edition. Surface unsupported rankings and unclear attributions. | 103 |
| 7 · Editor decisions and messages | A pending review hid the decision export for another fix in the same document. Verifying one occurrence of repeated wording hid the other. A malformed claim produced only a field name. | Count actionable documents independently of badge priority. Match reviewed text by location and offset. Name the missing fields and explain the next action. | 107 |
| 8 · Fresh confirmation | Eight new sentences and a slide sentence split across two paragraphs covered inclusive bounds, second-vintage registration, attribution, hedges and layout. | All nine checks passed on first execution. Froze the rules. | 116 |

The separate acceptance suite for the existing unseen cases and publication passed **4/4** after the freeze. All five historical replays completed again after bundling the new samples.

## File, browser and runtime evidence

**Office.** Generated a 60-slide presentation with styled runs, a soft break, a table, a chart title and speaker notes. Generated a Word document with tracked insertion text, a table and a genuine linked footnote. For the corrected Office fixtures the tests checked ZIP integrity, parsed every XML and relationship part, compared the package member lists, and required exactly one changed XML part. After undoing just the numeric edit and the new source element, canonical XML matched the original. Independent Python Office readers reopened the drafts. [Office regressions](../tests/test_hardening_office.py)

A temporary, signature-checked LibreOffice 26.8.3.1 reader opened the corrected files and exported a one-page Word PDF and a 60-page presentation PDF. Extracted PDF text showed 5.9% and the dated source on the edited page and slide 60. The tracked qualifier, footnote and chart caption retained their 5.7% readings. All eight PowerPoint drafts from the five replay dates also converted and contained their source lines. An earlier Pages export attempt timed out. [Word PDF](../web/examples/hardening/word-sample.pdf) · [Presentation PDF, correction on slide 60](../web/examples/hardening/slides-sample.pdf)

**Map.** Inspected eight screenshots from local headless Google Chrome at 1920×1080 and 390×844, with 0, 1, 12 and 40 publications. Titles included an uninterrupted 108-character word. All eight pages fit the viewport width. For each populated page, choosing the final publication revealed its card, exposed its embedded download and exported the Skip decision for that claim. [Desktop captures](../web/examples/hardening/1920.jpg) · [Phone captures](../web/examples/hardening/390.jpg)

**State and live adapter.** Re-registering three separate originals with identical text kept three claims. Two competing CLI processes issued one correction per document and saved one issuing run. Skipping a correction produced an identifiable earlier decision on the next quiet map. A subsequent replay moved the last observed manufacturing figure from 5.0% to 4.6%. A separate temporary fixture covered 0→5→0→5, including a document already citing 5. The suite also checks repeat quiet runs for file writes.

The network tests used a temporary archive and injected responses at the HTTP transport. A transient 429 respected a two-second delay. Persistent 429s respected two three-second delays before stopping. Disconnection, a truncated response and incomplete metadata each stopped the refresh. These failures arrived **after** a valid changed reading from another dataset. Every archive file kept its original hash and the in-memory archive matched disk. This is failure-path evidence from the real adapter using injected responses. [Workflow regressions](../tests/test_hardening_workflow.py)

**Skill.** Rebuilt the distributable with its sync script. From a temporary copy, a fresh Python 3.14 virtual environment created without pip registered both a deck and a Word paper, replayed the November 2025 release, created the corrected deck and rendered its downloadable map. Imports independently confirmed that python-pptx, python-docx and lxml were absent. Desktop scheduling, Mail and hosted publication remain separate acceptance checks.

## Remaining limits

- A reader still needs to inspect the whole original. Idiomatic comparisons, pronouns, implicit subjects and non-English text can evade even the review queue. The batch missed 3/40 outright.
- Fiscal calendars, qualitative thresholds, rankings and comparisons involving an unspecified peer need more evidence. Numberless tables and figures rendered as images need manual reading. The Office reader exposes rich-text chart captions, speaker notes, footnotes and tracked paragraphs for review. It does not edit those regions.
- Implicit GDP basis follows the archived aliases. Check the basis in the original when a publisher omits it. A quiet result refers to linked official observations and can coexist with unresolved sentences.
- File evidence covers the generated Office structures and replay publications. The chrome captures cover two screen sizes. The frozen sample is small and locally authored.

## Reproducing the local checks

From the repository root:

```sh
tests/.venv/bin/python -m pytest tests -q -p no:cacheprovider
./demo.sh
out=$(mktemp -d)
PYTHONPATH=. tests/.venv/bin/python tests/test_hardening_map.py "$out"
node tests/map_viewports.mjs "$out"
```

The published score and sample files are retained. For a new independent replay of the same benchmark, run `PYTHONPATH=. tests/.venv/bin/python tests/hardening_batch.py score` and keep the resulting JSON separately.
