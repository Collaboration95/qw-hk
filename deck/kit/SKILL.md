---
name: pitch-deck
description: Builds a pitch deck (HTML slides, PDF, script, FAQ, appendix) in the user's approved style, aiming for a first draft close to final. Use for hackathon pitches or any slide deck once the product exists. Triggers - "make the slides", "pitch deck", "presentation", "demo slides".
argument-hint: "[project dir or brief.md] [minutes]"
---

# Pitch deck

The user's decks took ~3 hours of feedback each. This skill starts where the approved finals ended. The rules
are in `references/taste.md` in this skill's folder: read it fully before writing any copy or CSS. When sources
disagree, the newer, better deck wins: tftf final > Click > Prompt Fu = Common Grounds.

Optimised for hackathon pitches. Outside hackathons, the user supplies the context; run the same steps.

## Models

- Design and copy lanes: use only the designated design provider (Opus 5.5, or Fable 5.2 for critique). **Never use Codex or GPT models for
  designing or writing copy.** In Codex, delegate design lanes to the designated provider through T3 `delegate_task`
  or its command-line agent in noninteractive mode. If delegation is unavailable, report it and stop.
- Capture, asset gathering and fact checks may use cheaper models from the same provider (Sonnet, Haiku).
- Spend freely on quality; the user prefers more parallel lanes to more feedback rounds.

## Steps

### 1. Gather (no questions yet)
- Read the context: `brief.md` or any event/brief docs, `hack/` files if present, README, specs, judging
  criteria, organiser material. Open the running product (localhost, server, HTML) headlessly.
- Collect the product's world: mark, wordmark, colours, characters, art, video frames, concept renders, motion
  already in the product, the best screens at real device size (`references/look.md`, "Absorb the product").
- Start `pitch/BRIEF.md` in the project (format in `references/companions.md`).

### 2. What are we optimising for?
- Fill the "must know" table in `references/story.md`. If the optimisation target, the slot or the ethos is not
  visible in the files, ask ONE batch of at most 6 numbered questions now, with lettered options and a
  recommended pick each; include 2–3 drafted ethos lines to choose from. Ask nothing the files answer.
- 80/20: ask early, ask once, then build. Never stop to ask again before showing decks.

### 3. Spine and claims
- Write the ethos line, the claims inventory (every number with its source), and the spine: one headline per
  slide, its job, its one visual, and the spoken path (`references/story.md`, arc and copy rules).
- Fact-check lane: trace every number and claim; cut what cannot be traced or explained in one breath; mark
  simulated data. Caveats move to notes and script, dense proof to the appendix.
- Check the spine against the rules before any lane starts: headlines ≤ ~10 words and one line at 92 px, each
  number on one slide only, no labels, no caveats on slides. Lanes inherit every spine mistake four times.
- If the step-2 batch was asked, show the spine with it so one answer settles both. Otherwise go on.
- Capture shared assets once (real screens at device size, brand files) into `pitch/shared/` for all lanes.

### 4. Build 3–4 different decks in parallel
- Write the world bible and the diversity matrix in BRIEF.md (`references/look.md`): 3–4 directions that are
  different answers to "what world is this pitch set in?", each with its own reveal, carry device, type,
  components and layout. No two rows share more than two cells. A deck that looks like a reference deck with new
  colours fails, however polished.
- Browse the packs (`assets/packs/`, gallery at `assets/packs/gallery/index.html`) and name in each row the
  reveal, scene and stories it starts from, or "invent".
- Brief each lane with `references/variant-brief.md` filled in (its direction, the others in one line each).
  Each lane scaffolds its own folder `pitch/v1` … `pitch/v4` with `scripts/new-deck.mjs`, builds from the
  engine, exports, reads its own `out/sheet.png` and fixes against taste.md before returning.
- Parallel lanes: use the designated coding agent’s `Agent` tool or T3 `delegate_task`, with Opus in either case.

### 5. Compare and critique
- `node scripts/export.mjs --compare pitch/v1 pitch/v2 pitch/v3 pitch/v4 --out pitch/compare` → filmstrip.
- One critic pass (Fable or Opus, fresh context, given taste.md and the golden sheets, not your opinion):
  rank the variants, list concrete fixes per slide, and fail any lane that reads as a re-skin of another lane or
  of a golden deck. Apply the fixes that are rule violations in each lane. The ranking is advisory: in hr-2026
  the user's favourite was the critic's last (the data-born point field).
- Show the user the filmstrip (`pitch/compare/compare.png`), each deck's local link, one line per direction,
  and your recommendation. Expect them to override it; do not argue for your pick.

### 6. Converge and ship
- Merge onto the pick (one lane, so fixes stay consistent), taking any slides the user liked from the others.
- Export (PNGs, PDF, lint clean), publish (`references/companions.md`, "Publish"), and write
  `pitch/script.txt`, `pitch/faq.txt`, the appendix and the notes.
- Hand over: live URL with `?v=N`, local `index.html` path, PDF path, script and FAQ paths, the keys.

### 7. Feedback rounds
- Log every feedback item in `pitch/BRIEF.md` (F1, F2 …) and address all of them each round; say which are done.
- Render headlessly; never open windows on the user's machine. Near the deadline, push straight; skip PRs.
- When the deck is final, append what changed and why to `taste-log.md` in this skill's folder (dated,
  one line per lesson, with the user's words). Promote a lesson into `references/taste.md` once it repeats.
- Harvest: copy any new reveal, scene, story or carry device into `assets/packs/` (CONTRACT.md format) and run
  `node scripts/pack-gallery.mjs --export` so the shelf grows with every deck.

## Engine

`assets/engine/src` is a port of the tftf finals deck: 1920 × 1080 stage, click/→/Space next, 0–9 jumps,
0 = empty intro, `n` notes, `f` fullscreen, nav pill outside the stage, arrival primitives, marker loop,
`.phone` / `.browser` frames, drift and parallax layers, count-up, appendix cards, print = final state.

| Script | Does |
|---|---|
| `scripts/new-deck.mjs <dir> [--title T] [--bare]` | scaffold `src/` from the engine |
| `scripts/build.mjs <dir> [--watch]` | `src/` → one self-contained `index.html` (fonts, images inlined; no requests) |
| `scripts/export.mjs <dir> [--strict]` | build, then `out/NN.png`, `out/sheet.png`, `out/deck.pdf`, `out/lint.txt` (taste lint) |
| `scripts/export.mjs <dir> --motion` | also `out/motion/NN-a.png` (0.3 s) and `NN-b.png` (1.6 s) after arrival |
| `scripts/export.mjs --compare <dirs…> --out <dir>` | filmstrip of several decks |
| `scripts/use-pack.mjs <kind>/<name> <deck> [--as N \| --into N] [--word W]` | install a pack item (reveal, scene, story, carry) |
| `scripts/pack-gallery.mjs [--only …] [--out dir] [--export]` | build the browsable gallery of every pack item |

Deck-wide code, styles and data go in `src/lib/*.js` / `*.css` / `*.json` (inlined after the engine; JSON →
`window.DATA[name]`). Ambient life runs on one clock (`Deck.clock(el, fn, { printT })`); layers that carry
across slides listen to `Deck.onChange`.
Domain strings the lint flags on purpose go in `src/deck.json` `"lintAllow"`. Painted scenery: start from
`assets/recipes/painted-scenes.mjs` (layered SVG hills, clouds, mist, grain). Keep the PDF ≤ ~5 MB (submission
limits); if filtered SVG scenes bloat it, rasterise them to JPG for print.

Export needs `playwright-core` (or `playwright`) resolvable from the project or cwd and a local Chrome:
`npm i --no-save playwright-core`. The lint catches labels, dates, caveat words, 3-line runs, tiny text,
unframed phone screenshots, white fields and too many markers; it cannot judge taste, so still read the sheet.

## Files in this skill

- `references/taste.md` — the rules (read fully, every time)
- `references/story.md` — optimisation target, arc, copy rules with real before → after
- `references/look.md` — where the look comes from, directions, effects menu
- `references/companions.md` — script, FAQ, appendix, notes, hub doc, publish
- `references/golden.md` + `references/golden/*.jpg` — the reference decks, ranked
- `references/variant-brief.md` — the brief for each design lane
- `assets/packs/` — reveals, scenes, stories, carry devices (`CONTRACT.md`, gallery)
- `evidence/` — the mined threads behind the rules (read only when revising taste.md)
- `taste-log.md` — dated lessons from each new deck
- `evals/` — backtests
