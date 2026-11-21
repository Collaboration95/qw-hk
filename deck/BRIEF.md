# Recall Press pitch deck · BRIEF

Written by Claude (story, claims, design direction). Built by QwenWork with the kit in `deck/kit/` (the owner's pitch-deck engine and rules). Copy comes ONLY from this file. Numbers come ONLY from the claims table. If something does not fit, leave it out and say so in the report. Never invent copy, quotes, users or numbers.

## 1. Must know

| | |
|---|---|
| Optimisation target | QwenWork Hackathon judging: Innovation 25 · Feasibility & viability 25 · Use of QwenWork 20 · Demo 15 · Hashmeta website 15. Judges want "the engine of the product, not a checkbox" and "a workflow that runs end to end on real inputs" |
| Slot | 3-minute pitch (top-10 finals, 11 Dec) and slides reused inside the 3-minute demo video. Intro + 6 slides + appendix, about 400 spoken words |
| Ethos | **A slide that comes with its next correction.** (slide 1 argues it; the close repeats it) |
| Golden demo run | Q3 2025 manufacturing: the members' briefing said "stalled"; the official figure was revised; the map brings the editor back to slide four with a sourced replacement: "grew 5.0%" |
| Audience | Business and AI judges, not economists. Plain words. Every term a non-economist understands |
| Must say | QwenWork does the reading, the nightly check and the delivery. Revisionpedia is the public directory on Hashmeta |
| Must not say | Competitor names. Prize. "AI-powered". Any customer, revenue or user that does not exist |

## 2. Claims inventory (the only numbers allowed)

| ID | Claim | Source | Slide |
|---|---|---|---|
| C1 | Q1 2025 manufacturing, quarter on quarter: first reported −4.9%, now +0.6% (a contraction became growth) | site/revision-highlights.md §1 | 1 |
| C2 | Q3 2025 manufacturing, year on year: 0.0% (14 Oct 2025) → 5.0% (21 Nov 2025) | web/examples/replays/2025-11-21.html | 3 |
| C3 | 57 of 60 recorded quarters changed after first release | site/revision-highlights.md line 3 | 5 |
| C4 | One revision, two different editorial answers: the deck is now wrong, the board paper's dated statement is still true | map 2025-11-21 | 3 (as picture, no number) |
| C5 | 40 unseen claims: 28 right, 9 handed to the agent with a reason, 0 confidently wrong | docs/HARDENING.md | appendix only |
| C6 | 2 live web pages found still quoting superseded figures (lags 6 and 57 days) | qwenwork-out/02-stale-census/stale-census-memo.md | appendix only |
| C7 | Next scheduled GDP release: 24 Nov 2026, 08:00 SGT | data/release-calendar.json | notes/script only |

Each number appears on one slide only. Caveats (sample documents were written by the founder; no paying customer yet; replayed history) go in speaker notes and the appendix, never on a slide.

## 3. Spine

| # | Headline (exact) | Job | One dominant visual | Spoken |
|---|---|---|---|---|
| 0 | (empty, then reveal) | brand moment | split-flap board lands on RECALL PRESS | yes |
| 1 | **Official figures change. Published slides keep the old story.** | felt two-sided tension + what it is | left: a vintage board for one quarter, −4.9% flipping to +0.6%; right: a slide card saying "Manufacturing shrank in Q1", the word "shrank" circled by the marker. One-line answer under it: "Recall Press brings the editor back to the exact sentence." | yes |
| 2 | **Every published number gets a recall address.** | the idea in one picture | one official figure tile at left; three red threads run from it to three document cards (members' deck, sales brief, board paper), each thread ending on one highlighted sentence | yes |
| 3 | **One revision. Four documents. Two different answers.** | the demo / golden run | the real map screenshot (deck/shared/map-2025-11-21.png) in a `.browser` frame, cropped to the hero band + the document list; beside it a before → after sentence card: "Manufacturing ~~stalled~~ → grew 5.0% year on year in Q3 2025." and a green "still true" tag on the board paper | yes |
| 4 | **QwenWork reads, checks nightly and hands back the fix.** | how it works (roles) | a role pipeline of four stations with self-drawing line: Skill reads the slide → Nightly task checks the official data → Agent judges each sentence → Page map + corrected deck. Keyword chips only | yes |
| 5 | **57 of 60 quarters changed after first release.** | proof / reach | big count-up "57 / 60" at left; right: Revisionpedia record page (deck/shared/revisionpedia-mfg-q3.png) in a `.browser` frame, rising | yes |
| 6 | **A slide that comes with its next correction.** | close / bookend | the split-flap board from slide 0 small at top showing RECALL PRESS; two "What's next" items as board rows: "Pilot with a briefing editor" · "Live on the next GDP release"; big QR (≥ 420 px) to the live Revisionpedia URL (placeholder `QR_URL` until Claude supplies it) | yes |
| 9 | **Appendix** | Q&A tiles | numbered tiles: "How accurate is the reading?" (C5) · "What about dated statements?" (C4) · "Is anyone still quoting old numbers?" (C6) · "Where does the data come from?" (SingStat via data.gov.sg, Singapore Open Data Licence; MTI releases) · "What is real and what is replayed?" (real releases and engine; replayed history; founder-written sample documents) · "Who pays?" (recurring briefing editors, per-publication coverage; price unvalidated) | fallback |

Spoken word budget about 400 words total; speaker notes in `<aside class="notes">` with Say/Do on each spoken slide.

## 4. World bible

- **Place**: a Singapore release morning. 08:00, the statistics release lands; an editor's members' briefing already went out last month.
- **Hour and weather**: pre-dawn to morning. November monsoon: low cloud, a wet sheen, the light coming up warm.
- **Objects**: a departure-board style "vintage board" (each row a dated reading of the same quarter), slide cards, board-paper cards, red recall threads, a small recall stamp.
- **Actors at the edge**: a far MRT train crossing the bottom on one clock; rain streaks thinning as the deck goes on; one office window that lights late; a pigeon on the board's rod.
- **The data's own shape**: vintages, a list of dated readings of the same figure. The board IS the data.
- **Verbs**: flaps flip, threads pull taut, a word is struck and replaced, a stamp presses.

## 5. Direction (one lane): "Release morning"

| World | Colour journey | Reveal | Carry device | Type | Components | Layout |
|---|---|---|---|---|---|---|
| a release board on a Singapore morning | the brand's navy-plum (#272846 → #4a3550, from the product's hero band) at slide 0, lifting through deep teal-blue to a warm peach dawn (#f2b58f accent family) by slide 6; never white, never off-white (the app is off-white, the deck must not be) | `reveals/split-flap` with `--word "RECALL PRESS"`, wall = navy-plum | the vintage board persists along the top edge, its rows flipping on each forward change (≤ 1.2 s) while the content cuts | one serif display face for headlines (Fraunces or Source Serif 4 via @fontsource, woff2 copied into src/assets/fonts), Geist for body, tabular numerals | cards with depth: off-black flap rows for numbers; warm paper-tint document cards with soft tinted shadow (cards, not fields); red recall thread | headline top-left, 92–110 px serif 800; visual fills the right two-thirds |

Accent: one warm peach-orange (#f2a67a range) for the marker and the replacement figure; struck "before" text faded. Ink is computed with the engine's `--ink-auto` / `Deck.inkOn`.

Detail ledger (`deck/v1/DETAILS.md`): at least 15 small touches from the world bible above.

## 6. Hard rules (from deck/kit/references/taste.md, the ones most often broken)

1. Headlines exactly as in the spine. No eyebrows, kickers, pills, page numbers, logos in corners, dates on slides.
2. Never three continuous lines of text anywhere. Keywords, arrows, chips.
3. Nothing under 22 px; card text ≥ 28 px.
4. Every web screen in the engine's `.browser` frame.
5. Marker (`.mk`) used 1–3 times in the whole deck: slide 1 "shrank", optionally slide 3 "two".
6. Each slide: one arrival story ≤ 1.5 s, readable on the first frame, then rest. No clicks inside slides.
7. No emoji, no sparkle icons, no three identical icon cards, no generic gradients.
8. PDF ≤ 5 MB.
