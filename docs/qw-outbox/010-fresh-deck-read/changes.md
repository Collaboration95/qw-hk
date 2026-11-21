# Changes from first-pass to registered claims (Job 010)

## Overlap and misses (step 3 cross-check)

Rules (workspace `fresh-rules`) returned **5 claims** (c1-c5) and **3 unlinked** sentences.

- Overlap (rules found, I found): slide 2 Headline (overall-yoy), slide 3 Service customers (services-yoy threshold), slide 5 Jobs (employment), slide 5 Unemployment, slide 6 July estimate (manufacturing, dated). = 5.
- Rules claims I missed: **none**. All 5 rules claims were in my first-pass.
- My first-pass claims the rules missed:
  1. **Slide 2 speaker note** "After seasonal adjustment, real GDP rose 1.4% from the first quarter to the second." (sg-gdp-overall-qoq, 1.4). The rules never surfaced it because the engine's `slide_blocks` does not scan speaker notes at all (see documents.py). It is a real checkable figure but **cannot be registered** through `rp register`. Kept as a manual note only.
  2. **Slide 3 Factory customers** "Manufacturing outpaced services on year-on-year growth in the second quarter." Rules flagged it *unlinked* ("No unique series match") because it references two series with no number. I registered it as a **comparison** claim (manufacturing 12.5 > services 4.9, with reference).
  3. **Slide 4 table** "Construction output contracted from the March quarter on a seasonally adjusted basis." Rules flagged it *unlinked* (qualitative "contracted", no number). I registered it as a **direction/down** claim (construction-qoq, -2.5).
- Rules unlinked that I also rejected: "Our freight scenario allows for a 7% rise in spot haulage quotes by September." Rules had no series match; I rejected it as a forward planning scenario with no official archive series. Agreement.

## Fixes applied to my list before registering

- Registered 7 claims (the 5 rules-confirmed + the comparison + the construction direction claim).
- The speaker-note GDP QoQ claim (first-pass #2) was **dropped from registration** purely because the tool cannot anchor speaker notes; recorded here and in REPORT.md so it stays visible.
- Assertion types set deliberately for clean verdicts: c1 = level (sentence carries 5.9); employment = direction/up (sentence carries no PERCENT/PERSONS token, so a `level` predicate would return needs_review); unemployment = level (carries 2.0%); comparison and construction carry no embedded number so `value_cited` is the archived figure, not a sentence figure.
- No sentence text was changed; all strings are exact from the deck.
