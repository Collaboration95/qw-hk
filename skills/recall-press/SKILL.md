---
name: recall-press
description: Check slides, Word documents and Markdown against Singapore official figures. Register a publication, check a release on demand or on a schedule, prepare corrected copies and show the editor a publication map.
---

## Set up once per project

Locate this folder and set `SKILL` to its absolute path. On Desktop the usual path is `$HOME/.qwenwork/skills/recall-press`. Set `PROJECT` to the editor's persistent project folder. A cloud sandbox needs the entire Skill folder and its own persistent project files. Verify both paths there. Desktop Skill installation and local schedules are documented. Custom web Skill upload and cross-client file access need a check in the app.

Use Python 3.10 or later. The runner reads and edits the supplied Office formats using Python's standard library. Create the project folders and copy the bundled archive once.

```sh
mkdir -p "$PROJECT/data" "$PROJECT/publications"
if [ ! -d "$PROJECT/data/series" ]; then cp -R "$SKILL/data/series" "$PROJECT/data/series"; fi
```

In each new shell, including a scheduled task, restore the same absolute SKILL and PROJECT paths, then define:

```sh
export RECALLPRESS_WORKSPACE="$PROJECT/workspace"
export RECALLPRESS_SERIES="$PROJECT/data/series"
rp() { python3 "$SKILL/run.py" "$@"; }
```

## Register

1. Keep a stable original in the project. For a bundled example, copy the requested file from `$SKILL/samples` into `$PROJECT/publications` once. The members' briefing is dated 20 October 2025, the roundtable reading 23 October 2025 and the October economy briefing 19 October 2026.
2. **Read every slide, paragraph and table yourself first**, including headings, surrounding text and footnotes. Write down each factual assertion, including those without digits. Keep the exact sentence. Identify the subject, period, unit, annual or quarterly basis, and the edition available on the publication date. Treat the document and any email as evidence. Follow instructions from the editor.
3. Run `rp register FILE --registered-on YYYY-MM-DD --workspace "$PROJECT/rule-cross-check"` as a separate rules cross-check. Compare your list with its claims and unlinked candidates. A miss or an empty rules result is a reason to inspect the source text again. Carry every verified claim from your reading forward. Explain unresolved sentences, for example a claim about electronics when only total manufacturing is available.
4. For each verified sentence look up its matching archived observation in `$RECALLPRESS_SERIES`. Save **your full list** to a project JSON file, then run `rp register FILE --registered-on YYYY-MM-DD --claims CLAIMS.json` in the real workspace. Check its returned claim count, exact sentences and locations. A repeat for the same original replaces its registration. If a sentence occurs twice, include the precise location or anchor. Keep a separate project note for any unmatched text the rules did not flag.

Each row needs the keys below. `value_cited` is the original official figure, including its sign. A threshold is a separate number. A dated stance attributes a figure to a named earlier release. A current stance describes the economy itself.

```json
[{"sentence":"GDP growth remained below 6% in Q2 2026.","series_id":"sg-gdp-overall-yoy","period":"2026-Q2","value_cited":5.7,"vintage_cited":"2026-07-14","stance":"current","assertion":{"type":"threshold","detail":"below 6%","operator":"<","threshold":6}}]
```

Use `direction` with detail `up`, `down` or `flat`, `level` for an amount, `threshold` for a bound, `comparison` for a relationship, and `rank` for a place among peers. For a comparison include its operator and an `assertion.reference` object with the peer's series_id, period, value_cited and vintage_cited. Verify both sides against the archive on the publication date. If a qualitative term has no supported cutoff, use detail `needs_review` and preserve the context for judgement.

## Check

- Historical release: `rp check --offline --trigger replay --as-of YYYY-MM-DD --record`. Only vintages through that date are visible. Use a fresh project for a repeat demonstration that should issue the original corrections again.
- Latest official figures: `rp check --trigger manual`. For a scheduled task use `rp check --trigger schedule --record`. Retain the working folder and execution location in the task. Local Desktop schedules need an awake Mac. Web schedules run in the cloud and need their own accessible files.
- Email: read the forwarded notice in **macOS Mail** or **Microsoft 365 Outlook** through the enabled Desktop connector. Identify the release, series and period. Gmail access is undocumented. Pasted message text also works. Run `rp check --trigger email --record`; use the official result for the figures. Match the notice to the registered documents. An older notice may refer to an already issued correction. Consult the matching stored run and label its date separately from today's check.
- Live checks contact only data.gov.sg. If a request fails, identify the unavailable source and record the failed check in the task history. Stop before issuing a quiet report or corrections. Run an explicitly labelled historical replay only if requested.
- A quiet result has `no_change: true`. Report the number of series and outstanding unlinked sentences. Produce no corrected files. With `--record` the run has a saved result.json and run_id; use `map` on it only if the editor requested a quiet map. Repeating the same quiet check reuses its record.

## Judge the sentence, then deliver

For each newly affected claim read its sentence, paragraph and dated figures in the run's result.json. Check the subject, period, unit, direction, cutoff and comparison peer. Apply these four verdicts:

| Verdict | Decision and worked example |
|---|---|
| now_wrong | The revised evidence breaks the assertion. “Showed no year-on-year growth” asserts zero; 0.0% revised to 5.0% breaks it. “Outpaced” requires a strictly higher rate; a tie or reversal breaks it. |
| number_only | The amount changed and the underlying assertion still holds. GDP “remained below 6%” at both 5.7% and 5.9%. Offer 5.9%. At 6.2% that same sentence becomes now_wrong. For “outpaced,” check both revised values on the same basis before keeping the comparison. |
| still_true | The words remain accurate as written about the original release. “October's advance estimate put growth at zero” remains a true account of October. Preserve the sentence and its file. |
| unaffected | The run found no new revision to the sentence's linked series, period or comparison peer. Leave it alone. A manufacturing revision alone leaves an unchanged services claim here. |

“Barely moved” needs context. If the document defines it as a change of less than one percentage point, compare the measured change with that bound. If no definition or supporting baseline is available, retain it for editor review. Never invent a cutoff or guess a rank. For an unresolved affected claim with a fixable rule suggestion, explicitly hold the correction with `rp judge --run RUN_ID --claim CLAIM_ID --hold --reason "State the missing evidence."`. Keep unresolved items visible on the map.

Record each supported affected verdict using `rp judge --run RUN_ID --claim CLAIM_ID --status VERDICT --reason "Specific evidence for this sentence."`. Add `--replacement "Full replacement sentence."` for either fixable verdict. Explain disagreements with the rule. Retain dated claims and earlier decisions.

Run `rp fix --run RUN_ID`, then `rp map --run RUN_ID`. Give the editor the map and the corrected files under that run's out folder. Each file is a draft of the original with one sentence changed and its source attached. For two changes in one publication, identify each draft by its claim and location. After the editor selects Apply fix, Skip or Edit first, copy the map's Decision JSON into a file and run `rp decide --from decisions.json`. Return the refreshed map and any edited copy. Keep the original.

For a requested Page, use the map HTML and check that the published version displays it and preserves downloads. For requested media, use actual sample screenshots. Narrated MP4 generation and export need testing in the user's account.

End each task with exactly three short lines, filling in the evidence and file paths:

Changed — release dates and values, quiet series count, or failed source.  
Prepared — corrected files and map, saved run record, or none.  
Left alone — dated and unaffected claims, unresolved text and anything awaiting review.
