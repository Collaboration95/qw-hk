# 018 · Ten slide headlines for the Recall Press pitch deck

Rules applied (`deck/kit/references/taste.md`): every headline is a plain claim in full words,
4–10 words, ending with a period — no topic titles, no chrome. Read only the headlines in order
and the pitch makes sense. Each slide has ONE dominant visual that proves the claim, built from
real artifacts (`site/v2/src/`, README media, Revisionpedia pages). Every number is real and
traceable; honest qualifiers live in speaker notes, not on the slide.

---

## 1. Your sources change. Your deck stands still.

**Visual:** the slide-4 sentence large and frozen — "Manufacturing stalled year on year in Q3 2025" —
while beneath it the figure's five dated readings step past: 0.0% (14 Oct 2025) → 5.0% (21 Nov) →
4.9% (2 Jan 2026) → 5.3% (10 Feb) → 4.6% (14 Apr). The chart moves; the sentence never does.
*Proof: README "One revision, two answers" + figure-history chart (`docs/media/figure-history.png`).*
*Notes say: the briefing is a founder-written sample; the readings are real MTI releases.*

## 2. Most official figures change after you cite them.

**Visual:** the 10 × 6 grid (10 indicators × 6 quarters) from `home-04-grid.html`; 57 cells flip to
the changed tint in one sweep. One hero number lands: **57 / 60**.
*Proof: README Proof table — 60 tracked, 57 revised (`site/collections/revisions.json`).*
*Notes say: 18 of the 57 changed enough to break a sentence that quoted them.*

## 3. One revision gets two different answers.

**Visual:** two document cards side by side, one red thread from a single figure node onto both.
Left: members' briefing, "Manufacturing stalled…" — verdict card **Now wrong**. Right: board paper,
"As first reported in the October advance estimate… flat" — verdict card **Still true**.
*Proof: README two-row verdict table, 21 Nov 2025 revision.*
*Notes say: changing the still-true sentence would introduce an error — this is judgment, not find-and-replace.*

## 4. Recall Press updates decks when sources change.

**Visual:** before → after of slide 4 (`docs/media/before-after.png`): "stalled" struck through,
"grew 4.6%" written in; the April 2026 source chip lands beneath the original October footer,
which stays. One warm marker on the felt word.
*Proof: README before/after figure; corrected slide cites 4.6%, 14 Apr 2026, keeps the October footer.*
*Notes say: this is the plain category — a watch service for the figures your documents cite.*

## 5. Every linked sentence carries its dated source.

**Visual:** two sentences lift out of a slide thumbnail; threads connect each to a series, a quarter
and a dated release chip (MTI · Advance GDP estimates · 14 Oct 2025 · quoted 0.0%). A third sentence
stays unlinked, held with a one-word reason.
*Proof: `home-01-hero.html` source chips; description.md — each linked sentence gets series, quarter, dated release.*

## 6. The editor approves every change.

**Visual:** the Recall desk flag card from `home-01-hero.html`: the rewrite, its dated source, and
**Approve ↵** pressed by a cursor; the row settles to "Updated for you". Beside it, the board-paper
card reads "Still true" and is visibly untouched.
*Proof: hero markup; description.md — the editor applies, skips or edits every proposal.*

## 7. QwenWork rechecks every sentence on every release.

**Visual:** the agent run log from `home-02-run.html` as a downward timeline: 20 Oct 2025 deck
received → 21 Nov sentence now wrong → 2 Jan, 10 Feb, 14 Apr numbers changed → 14 Apr updated
`members-briefing-2025q3.pptx` ready. Bar: "runs on QwenWork".
*Proof: run-log markup; README run.gif timeline (Oct 2025 → Apr 2026).*
*Notes say: missed slots needed Run now; the owner's automation now starts Desktop tasks — said, not shown.*

## 8. The second reading matched all eight verdicts.

**Visual:** one before → after hero number: **5/7 → 8/8**. Eight claim cards flip face-up (one is a
table cell, one a speaker note); eight verdict checks land on the after side.
*Proof: README Proof table — first blind read 5 of 7; after two rule fixes, re-run on the same claim
list matched 8 of 8 (Job 016, `docs/qw-results/RESULTS.md`).*
*Notes say: the deck was independently written; the first reading registered 7 of 8 — honest sequence, spoken.*

## 9. Every figure has a free public page.

**Visual:** a Revisionpedia figure page in a browser frame: "Manufacturing growth, year on year ·
Q3 2025", big **4.6%**, "First estimate 0.0%, 14 Oct 2025", the release list with a dated source on
every row.
*Proof: live page — revisionpedia.geo.hashmeta.tech/revisions/sg-gdp-manufacturing-yoy-2025-q3/ (README link).*
*Notes say: 60 records, 10 indicators, all free; built on Hashmeta.*

## 10. Your sources change. Your deck updates itself.

**Visual:** the end band: the product line large, the press mark, and the Recall desk window with
the updated deck row settled — the real product as the closing picture.
*Proof: the live desk (j3jvce39.qwenwork.page) and the product line from description.md.*
*Notes say: the decks shown are founder-written samples; every figure and date is from a real release;
no paying customer yet — the next step is one editor with one real slide before a GDP release.*

---

## Headline read-through (the pitch in ten lines)

1. Your sources change. Your deck stands still.
2. Most official figures change after you cite them.
3. One revision gets two different answers.
4. Recall Press updates decks when sources change.
5. Every linked sentence carries its dated source.
6. The editor approves every change.
7. QwenWork rechecks every sentence on every release.
8. The second reading matched all eight verdicts.
9. Every figure has a free public page.
10. Your sources change. Your deck updates itself.

Sizing: ten slides fits a 6–7 minute talk (~30 s per slide, taste.md "Sizing"); for the 3-minute
pitch, slides 5 and 9 fold into the demo and the appendix. Honesty qualifiers (founder-written
samples, first-read 5/7, missed cron slots, no paying customer) are all in speaker notes, never
on the slide face — except where a claim would otherwise be false.