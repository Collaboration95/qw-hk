# Recall Press — build spec (v0, 19 Nov 2026)

Hackathon entry, Track 1 (Business Operations & Automation). Submission due Mon 23 Nov 2026 23:59 SGT.
This file is the contract between build lanes. Change it only by agreement with the orchestrator.

## 1. The product in one line
**A slide that comes with its next correction.** An editor registers a slide or paragraph once. When the official figure behind it is revised, an agent works out which sentences are now wrong, which are still true, and delivers the replacement slide and sentence.

Belief: when agents turn one statistic into dozens of documents, published facts need a recall address.

## 2. The one flow (everything else is hidden)
1. **Register** — the editor hands over a document (.pptx, .docx, .md). Each statistical claim is found and linked to an official series, period and the figure as it stood on the day (its "vintage").
2. **Trigger** — either a scheduled nightly run, or the editor forwards a release email and asks "which of my documents need updating?".
3. **Check** — fetch the current official figures, keep every vintage, compare with what each registered claim cited.
4. **Judge** — per claim, one of four verdicts:
   - `now_wrong`: the revision reverses or breaks what the sentence asserts ("stalled" → grew 5.0%; "stayed under 6%" → 6.2%).
   - `number_only`: the figure moved but the assertion still holds (5.7% → 5.9% under "strong growth"). Offer the updated number; do not call the sentence wrong.
   - `still_true`: a dated statement ("as first reported in October, output was flat") stays correct after revision. Must never be rewritten.
   - `unaffected`: the series or period did not change.
5. **Fix** — for `now_wrong` and `number_only`: a replacement sentence and an edited copy of the original file with only that text changed, source line and vintage date attached. The original is always kept.
6. **Map** — one screen: the changed figure at the top, every registered document underneath, coloured by verdict, each with three controls only: **Apply fix / Skip / Edit first**.
7. **Quiet night** — when nothing changed, the run records "checked N series, no revision" and produces no new files and no duplicates.

## 3. Hard rules
- Real inputs only for the statistics: openly licensed data.gov.sg tables (Singapore Open Data Licence) and dated official releases as evidence. Record agency, dataset, URL, access date, licence for every figure. Do not schedule scraping of agency websites whose terms forbid monitoring; schedule only the data.gov.sg API. Respect its rate limits (back off on 429).
- The registered documents in the demo are our own sample publications, labelled as samples. Never present an invented customer.
- A historical replay must be labelled as a replay with its real dates. Nothing simulated may be shown as live.
- Never rewrite a `still_true` claim. Never issue a second correction for the same revision (idempotent).
- The product must run inside QwenWork: the logic ships as a **Skill** (a `SKILL.md` folder with bundled Python scripts) that a QwenWork agent session or scheduled task runs. So: Python standard library plus `python-pptx` and `python-docx` only; no servers, no databases, no network calls other than data.gov.sg; state lives in plain JSON files in a workspace folder. The judgement in step 4 is made by the agent running the Skill (the Skill tells it how and requires a reason per verdict); the scripts supply a deterministic rule-based verdict as a floor and as a check on the agent.
- No secrets in the repo. No personal names or email addresses in outbound requests.
- Do not commit or push; the orchestrator handles git.

## 4. Layout and ownership
| Path | Owner lane | Contents |
|---|---|---|
| `data/` | Data | `series/*.json` vintage archives, `SOURCES.md`, `cases/*.json` answer-key cases |
| `tools/` | Data | fetch/verify scripts for the archives |
| `recallpress/` | Engine | Python package and CLI |
| `skills/recall-press/` | Engine | `SKILL.md` + bundled scripts (may vendor or symlink `recallpress/`) |
| `tests/` | Engine | automated tests run against `data/cases` |
| `samples/` | Surface | sample publications (pptx/docx/md), clearly labelled |
| `web/` | Surface | the map (single self-contained HTML renderer), assets |
| `workspace/` | runtime | created at run time; git-ignored |

## 5. File contracts
`data/series/<series_id>.json`
```json
{"series_id":"sg-gdp-manufacturing-yoy","title":"Manufacturing, real GDP growth, year on year","unit":"%",
 "source":{"agency":"...","dataset":"...","dataset_url":"...","api_resource_id":"...","licence":"Singapore Open Data Licence v1.0"},
 "observations":[{"period":"2025-Q3","vintages":[
   {"value":0.0,"published":"2025-10-14","release":"Advance estimate","url":"...","quote":"short verbatim","accessed":"2026-11-19"},
   {"value":5.0,"published":"2025-11-21","release":"Economic Survey Q3 2025","url":"...","quote":"...","accessed":"2026-11-19"}]}]}
```
`workspace/register.json`
```json
{"documents":[{"document_id":"members-briefing-2025q3","title":"...","path":"...","registered":"2025-10-20"}],
 "claims":[{"claim_id":"c1","document_id":"...","location":"slide 4, title","sentence":"Manufacturing stalled in Q3.",
   "series_id":"sg-gdp-manufacturing-yoy","period":"2025-Q3","value_cited":0.0,"vintage_cited":"2025-10-14",
   "stance":"current","assertion":{"type":"direction","detail":"flat"}}]}
```
`stance` is `current` or `dated`. `assertion.type` is one of `direction`, `threshold`, `level`, `comparison`, `rank`.

`workspace/runs/<run_id>/result.json`
```json
{"run_id":"2025-11-22T02-00","started":"...","finished":"...","trigger":"schedule|email|manual|replay",
 "as_of":"2025-11-22","replay":true,"series_checked":8,
 "changes":[{"series_id":"...","period":"2025-Q3","old":0.0,"new":5.0,"old_published":"2025-10-14","new_published":"2025-11-21","url":"..."}],
 "verdicts":[{"claim_id":"c1","status":"now_wrong","reason":"...","decided_by":"rule|agent",
   "replacement_sentence":"...","replacement_file":"runs/<run_id>/out/members-briefing-2025q3.pptx","decision":"pending|applied|skipped"}],
 "no_change":false}
```
`workspace/runs/<run_id>/map.html` — the map for that run, self-contained.

## 6. CLI (the Skill calls these)
```
python -m recallpress register <file> [--workspace DIR] [--registered-on DATE]
python -m recallpress check [--as-of DATE] [--offline] [--workspace DIR] [--trigger schedule|email|manual|replay]
python -m recallpress judge --run RUN_ID --claim CLAIM_ID --status ... --reason "..."   # agent records its verdict
python -m recallpress fix --run RUN_ID
python -m recallpress map --run RUN_ID
python -m recallpress decide --run RUN_ID --claim CLAIM_ID apply|skip
```
`--as-of DATE` replays history from the archive: only vintages published on or before DATE are visible. `--offline` uses `data/series` only; without it, `check` refreshes from the data.gov.sg API first and appends any new vintage to the archive.

## 7. Demo cases that must pass (answer key lives in `data/cases/`)
- **A. Manufacturing, Q3 2025**: first reported flat, revised to 5.0% growth. A "stalled" headline → `now_wrong`; "as first reported in October" → `still_true`; an unrelated services claim → `unaffected`.
- **B. GDP, Q2 2026**: 5.7% → 5.9% → 6.2%. "Growth stayed under 6%" → `number_only` at the second vintage, `now_wrong` at the third.
- **C. Quiet night**: as-of a date with no new vintage → `no_change: true`, no files written, run twice gives the same state.
- **D. Unseen document**: a fresh sample with at least four claims across two series, never used during development of the rules.
All figures in A and B must be re-verified against the sources before use; if a figure does not check out, replace the case with one that does and say so in `data/SOURCES.md`.
