# Design lane brief (fill in and send one per lane)

You are building ONE complete variant of a pitch deck. Other lanes build other directions from the same spine.
Work only in your folder. Do not open windows on the user's machine; render headlessly.

## Read first (in this order)
1. `<skill>/references/taste.md` — the rules. They are not suggestions; each one cost the user a feedback round.
2. `<skill>/references/golden.md` and every image in `<skill>/references/golden/` — the bar for craft. Do not
   copy their look: a deck that looks like tftf with new colours has failed.
3. `<skill>/references/look.md` — absorbing the product, the families, packs, tiny details, effects menu.
4. `<project>/pitch/BRIEF.md` — optimisation target, ethos, claims, spine, world bible, your row of the
   diversity matrix, assets. Copy comes from here only.
5. `<skill>/assets/packs/CONTRACT.md` and the pack folders — parts you may install and then make your own.

## Your direction
**<Direction name>**: <world, colour journey, reveal, carry device, type, component grammar, layout grammar>
(your row of the diversity matrix), and what from the product's world it absorbs.
Make it unmistakably different from the other lanes: <the other rows, one line each>.

## What your deck must have
- Its own reveal, born from your world and the product (never the stock `tile-draw`).
- An arrival micro-story on every spoken slide that shows its claim (≤ 1.5 s, then rest).
- Ambient life on one clock: actors at the edge of attention (`Deck.clock`, `@keyframes amb-*`, `scenes/` pack).
- A carry device that continues across slides, if your direction has one.
- Its own type, components and layout from your row; the content rules in taste.md stay fixed.
- `DETAILS.md` in your folder: at least 15 tiny considered details (slide · detail · why it fits the product).

## Build
- Scaffold: `node <skill>/scripts/new-deck.mjs <project>/pitch/<vN> --title "<Product>" --bare`, then replace
  `00-intro.html` with your reveal (`use-pack.mjs reveals/<x> <deck> --as 0 --force --word <Product>` or your own).
- Write `src/theme.css` (journey fields --f0…, accent, fonts) and one `src/slides/NN-name.html` per spine slide
  (examples of the patterns are in `<skill>/assets/engine/src/slides/`). Assets go in `src/assets/`.
- Slide numbers follow the spine so 0–9 jump correctly; the appendix is the last number.
- Put `<aside class="notes">` with Say/Do on every spoken slide.
- Iterate with `node <skill>/scripts/build.mjs <dir> --watch` and `node <skill>/scripts/export.mjs <dir>`.

## Before you return
1. `export.mjs` passes with no problems. Fix every lint line or justify it in one sentence.
2. Read `out/sheet.png`. Check against taste.md: headline-only story makes sense; no labels or chrome; no
   white fields; one continuous journey; every phone framed; nothing under 22 px; no 3-line runs; marker 1–3
   times; each slide has one dominant visual that shows the idea; the slide 1 tension is felt and two-sided.
3. Run `export.mjs <dir> --motion` and read a few `out/motion/NN-a.png` / `NN-b.png` pairs: the arrival story
   must be readable at 0.3 s and finished at 1.6 s.
4. Render scripts for data visuals live in `<dir>/tools/`, outputs in `src/assets/`. Domain strings the lint
   flags on purpose (a regulatory date, "17/17") go in `src/deck.json` `"lintAllow"`; do not reword real claims
   to dodge the lint. Prefix your own class names per slide (`#sN .map`), the engine owns the bare names.
5. If you invented a reveal, scene, story or carry device another product could use, save a copy in
   `<skill>/assets/packs/<kind>/<name>/` in the pack format (CONTRACT.md) with the product specifics made params.
6. Return: the folder path, `out/sheet.png` path, one paragraph on the direction, the five details you are
   proudest of, and any copy you could not fit within the rules (never silently invent copy or numbers).
