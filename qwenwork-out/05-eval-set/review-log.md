# Review log — eval-set-150

**Case:** eval-150 · registered 2025-10-20 · check date 2025-11-21
**Headline revision:** manufacturing YoY Q3 2025, 0.0% (14 Oct advance estimate) → 5.0% (21 Nov Economic Survey). The same release also revised overall GDP Q3 (2.9 → 4.2), services Q3 (3.5 → 3.9), construction Q3 (3.1 → 3.6), and made small restatements to Q1/Q2 and to the seasonally adjusted quarter-on-quarter series. All values in the set come from the attached series files; none were invented.

## Method

1. **Author pass.** 150 sentences were written across the 11 required categories and labelled against the 14 Oct vs 21 Nov vintages. Every cited figure was machine-checked against the series files (one intentional exception: c148 has no period, see below).
2. **Independent reviewer pass.** A separate reviewer agent received **only** the 150 sentences (`claim_id` + `sentence`), the eight series files, the vintage table, and the shared labelling rules. It did **not** see the author's labels, statuses, reasons, or category tags. It independently labelled all 150 sentences and wrote `reviewer-labels.json`.
3. **Comparison and resolution.** Labels were compared claim-by-claim on `status`. Disagreements were adjudicated against the series data and the labelling rules; the resolved label is what ships in `eval-set-150.json`.

## Agreement rate before resolution

**148 / 150 = 98.7%.** Two disagreements (c136, c148). Both were medium-confidence calls by the reviewer; neither reviewer nor author flagged any low-confidence label.

## Disagreements and resolutions

### c136 — "Services grew roughly 3.5% year-on-year in Q3 2025."
- **Author:** `now_wrong` — 3.9% is no longer "roughly 3.5%".
- **Reviewer:** `needs_human` — "roughly 3.5%" vs revised 3.9% is a borderline approximation tolerance.
- **Resolution: `needs_human` (reviewer upheld).** The drift is 0.4 pp. The set already treats the parallel case c138 ("about 3%" vs revised 3.6%, drift 0.6 pp) as `needs_human`, and both passes agreed on c138. Keeping c136 as `now_wrong` while c138 is `needs_human` would apply two different tolerance thresholds to the same linguistic construction. The consistent rule adopted: approximations with drift ≤ 0.1 pp stay true (c135, "about 5%" vs 5.1%); drift ≥ ~1 pp is clearly wrong (c137, "nearly 3%" vs 4.2%); intermediate drift is a human tolerance judgement. Final label: `needs_human`.

### c148 — "Manufacturing is flat."
- **Author:** `needs_human` — no period stated; the claim cannot be tied to a specific observation.
- **Reviewer:** `now_wrong` — bare present-tense "is flat" read against the latest Q3 data (5.0% YoY) is falsified.
- **Resolution: `needs_human` (author upheld).** The reviewer's reading requires silently supplying "in Q3 2025". The sentence could equally be a timeless generalisation or refer to the current quarter (Q4 2025, no official data at the check date). The harness cannot resolve the period from the sentence alone, which is exactly the condition `needs_human` exists for. The reviewer's interpretation is recorded as plausible; if the author's intended period is confirmed as Q3 2025, the label would become `now_wrong`. Final label: `needs_human`, `period: null`.

## Reviewer concerns on agreed labels (no change, recorded for transparency)

The reviewer marked these medium-confidence but agreed with the author; the labels stand:

| Claim | Sentence (abridged) | Label | Reviewer note |
|---|---|---|---|
| c054 | "We expect manufacturing to remain flat for the rest of 2025." | needs_human | "Remain" presupposes Q3 flatness, which is now falsified; but the forecast target (Q4) has no data, so the sentence as a whole stays unverifiable. |
| c057 | "In October, we expected manufacturing to stay flat through year-end." | still_true | Dated historical report of an expectation, not a live forecast. |
| c063 | "Economists said manufacturing stalled in Q3 2025." | needs_human | Past-tense attribution with no release anchor; timing/endorsement unverifiable from series alone. |
| c089 / c093 | Speaker notes asserting flat Q3 | now_wrong | Notes are instructions rather than assertions, but their unanchored flat-Q3 premise is falsified, so they must be flagged. |
| c138 | "Construction expanded about 3% year-on-year in Q3 2025." | needs_human | 3.6% vs "about 3%": borderline tolerance (see c136 resolution). |
| c145 | "Manufacturing grew faster in Q2 2025 than in Q3." | still_true | Ordering survives by only 0.1 pp after revision (5.1% > 5.0%) — a near-flip that a future vintage could break. |

The reviewer also noted a classification convention it applied independently and which matches the author's: comparisons resting entirely on unchanged values (c033, c106) are `unaffected`, while comparisons involving revised values whose ordering survives (c034–c038, c145) are `still_true`.

## Final label distribution (after resolution)

| Status | Count |
|---|---|
| now_wrong | 64 |
| still_true | 36 |
| unaffected | 35 |
| needs_human | 15 |
| **Total** | **150** |

## Category coverage

| Category | Count | Claim IDs |
|---|---|---|
| Paraphrases of "flat" | 14 | c001–c014 |
| Numeric restatements (0%, nil, zero per cent, 0.0 pp, …) | 12 | c015–c026 |
| Comparisons | 12 (+c144–c146) | c027–c038 |
| Dated statements that stay true | 14 (+c147) | c039–c052 |
| Forecasts and expectations | 10 | c053–c062 |
| Attributed or hedged claims | 10 | c063–c072 |
| Two+ figures, only one revised | 12 | c073–c084 |
| Chart titles, table captions, speaker notes | 12 | c085–c096 |
| Negations and double negatives | 10 | c097–c106 |
| Look-alike series (PMI, IIP, NODX, other countries) | 12 | c107–c118 |
| Manufacturing mentioned, no statistical claim | 10 | c119–c128 |
| Extra coverage (unchanged values, approximations, q-o-q, hard cases) | 22 | c129–c150 |

Every required category has at least eight sentences.

## Assumptions

1. **Check semantics.** The 21 Nov 2025 check compares each cited vintage against the latest vintage published on or before 2025-11-21 (the 21 Nov Economic Survey). Vintages published in 2026 are ignored.
2. **Scope of the revision.** Although the scenario highlights manufacturing, the attached files show the 21 Nov survey also revised overall GDP, services and construction for Q3 2025 and restated several Q1/Q2 and q-o-q figures. Sentences citing those stale values are labelled `now_wrong` accordingly; no value outside the files was used.
3. **Registration accuracy.** Every current-stance sentence was accurate against the 14 Oct 2025 vintage when the publication registered on 20 Oct 2025.
4. **Exact figures.** An exact numeric citation is `now_wrong` if the official value changed at all, even by 0.1 pp (c024, c025, c081, c082, c084, c150). The `revision_threshold` field in the series files is treated as a detector materiality hint, not a truth condition.
5. **Approximation tolerance.** Drift ≤ 0.1 pp keeps "about/roughly" true (c135); drift ≥ ~1 pp breaks it (c137); intermediate drift (0.4–0.6 pp) is `needs_human` (c136, c138). This rule was fixed during resolution of c136.
6. **Dated statements.** Anchoring phrases ("as first reported in October", "according to the advance estimate", "the flash estimate showed", an explicit release date, or a caption labelled "advance estimates") make a sentence a report of a vintage; it is `still_true` if it quotes that vintage accurately.
7. **Attributions.** Attributions explicitly anchored to the October release are `still_true`; unanchored attributions and hedges ("economists said", "it is widely believed", "sources say") are `needs_human`, because the series cannot verify who said what or whether the author endorses the claim.
8. **Forecasts.** Present-tense expectations about a period whose actual outturn is known and contradictory are `now_wrong` (c055). Forecasts about Q4 2025 or later are `needs_human` (no official data at the check date). Dated reports of past expectations are `still_true` (c057, c061).
9. **Out-of-scope sentences.** Look-alike series (PMI, IIP, NODX, other countries' manufacturing) and non-statistical sentences carry `series_id/period/value_cited/vintage_cited = null`, stance `current` (look-alikes) or `not_a_claim`, assertion type `out_of_scope` or `none`, and status `unaffected`. Look-alike sentences are deliberately qualitative so that no official value is invented for an untracked series.
10. **Multi-figure sentences.** `series_id/period/value_cited` identify the primary (revised) figure; the second figure is recorded in `assertion.detail`. If any clause is falsified, the whole sentence is `now_wrong`.
11. **Direction/comparison claims without numerals.** `value_cited` is the official value the claim rests on, following A.json's a1 ("stalled" → 0.0).
12. **Forecasts' vintage.** `vintage_cited` is null for pure forecasts (no official vintage is cited); `value_cited` is 0.0 only where the expectation is "flat", otherwise null.
13. **c148** carries `period: null` because the sentence states no period; this is the only claim whose period cannot be resolved, and it is labelled `needs_human`.
14. **Schema.** The JSON mirrors A.json exactly (`case_id`, `title`, `registered_on`, `claims[]`, `checks[].expected[]`). Category tags live in this log, not as extra JSON fields, so the harness loads the file unchanged.
15. **Reviewer independence.** The second reviewer was a separate agent session given only the sentences, the series files and the shared labelling rules — never the author's labels. Agreement was computed on `status` only.