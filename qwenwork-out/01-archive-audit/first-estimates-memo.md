# How often Singapore's first estimates move

**PARTIAL AUDIT | Members' quarterly briefing | Evidence observed 2026-11-19**

## Three Findings

1. **A contraction headline can become growth.** Overall GDP QoQ for 2025-Q1 moved from -0.8% in its confirmed advance estimate to 0.6% in the latest verified dated publication, a 1.4 percentage-point change and a negative-to-positive sign crossing. Brief directional headlines as provisional. CSV evidence: `GDP-584a52dbf1d1a2ad`, `GDP-dd5f8f00c3b2ac1f`.
2. **Sector growth can be substantially restated.** Manufacturing YoY for 2025-Q2 moved from 5.5% to 10.5%, a 5 percentage-point change between the confirmed advance and latest verified dated values. The inherited GDP findings identify IIP rebasing as restatement context; avoid treating later values as merely a final-quarter adjustment. CSV evidence: `GDP-6a63a2f67891f1d0`, `GDP-92acca0ebdbd799c`.
3. **Small labour changes can cross a briefing cutoff.** Overall SA unemployment for 2026-Q2 moved from 2% to 1.9%. It changed from not below to below the illustrative 2% cutoff, despite an absolute move of only 0.1 percentage point. CSV evidence: `LAB-abc70113593d12e5`, `LAB-372247ac52cb175f`.

## What the Evidence Answers

There is no defensible single full-window first-estimate frequency from this collection. Missing original early releases and nonexhaustive subsequent restatements prevent that claim. The accompanying JSON gives per-series conditional revised shares, absolute mean/max moves, sign-category changes and cutoff crossings, with paired CSV row IDs for every included period. Confirmed-first comparisons are kept separate from earliest-verified-to-latest comparisons: an early historical comparator is never called first publication. Employment is survey total including MDWs; it is not interchangeable with MOM excluding-MDW headlines, and confirmed original employment firsts are not established here.

## Briefing Rule

State the series, reference quarter, release date and whether the value is an advance, a later dated restatement or a current snapshot. Use dated-only comparisons for the headline; show snapshot sensitivity separately. The current API's observed_on is an audit observation date, not a dated agency publication. Main comparisons require two distinct dated vintages and give each eligible period equal weight, including unchanged periods. A separate sensitivity permits a dated value plus snapshot and changes the denominator explicitly. Illustrative original cutoffs remain in the JSON alongside the requested growth and unemployment cutoffs. Do not pool series or extrapolate these conditional frequencies to all first estimates.
