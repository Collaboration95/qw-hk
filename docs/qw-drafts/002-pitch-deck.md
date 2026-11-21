# Job 002 · build the pitch deck (v1)

Build the Recall Press pitch deck with the owner's deck engine. The story, copy, numbers and design direction are already decided in `deck/BRIEF.md`; your job is to build it faithfully and well. Work only inside `deck/`. Never open windows; render headlessly. Never invent copy or numbers.

## Read first, in this order (do not skip)
1. `deck/BRIEF.md` (all of it). This is your only source of copy and numbers.
2. `deck/kit/references/taste.md` (all of it). These rules are strict.
3. `deck/kit/SKILL.md` section "Engine" and `deck/kit/references/variant-brief.md`.
4. `deck/kit/assets/engine/src/slides/*.html`, `base.css`, `deck.js` (learn the class names: `.browser`, `.mk`, `.count[data-to]`, `.strike`, `path.draw`, `Deck.seq`, `Deck.clock`, `Deck.onChange`, notes asides).
5. `deck/kit/assets/packs/CONTRACT.md`, `deck/kit/assets/packs/reveals/split-flap/README.md`, `deck/kit/assets/packs/carry/traveller/README.md`.
6. Look at the images in `deck/kit/references/golden/` (the quality bar; do NOT copy their look) and `deck/shared/*.png` (real product screens you will use).

## Build steps
1. `cd deck && node kit/scripts/new-deck.mjs v1 --title "Recall Press" --bare`
2. `node kit/scripts/use-pack.mjs reveals/split-flap v1 --as 0 --force --word "RECALL PRESS"` then set its wall `--field` to the BRIEF's navy-plum and `--brand` to the peach accent.
3. Write `v1/src/theme.css`: fields `--f0`…`--f6` following the BRIEF colour journey (navy-plum → deep teal-blue → warm peach dawn; each slide's top continues the previous slide's bottom; never white or off-white), `--accent`, fonts. Fonts: `npm i --no-save @fontsource/fraunces @fontsource/geist-sans` (or Source Serif 4 if Fraunces fails) and copy the needed woff2 files into `v1/src/assets/fonts/`, with `@font-face` in theme.css. No network font links.
4. One file per spine slide: `v1/src/slides/01-tension.html`, `02-address.html`, `03-demo.html`, `04-how.html`, `05-proof.html`, `06-close.html`, `09-appendix.html`. Headline text EXACTLY as in the BRIEF spine. Each slide: one dominant visual as described in the spine, one arrival story ≤ 1.5 s, speaker notes `<aside class="notes">` with Say (the spoken words, ~60 words) and Do.
5. Copy the needed screens from `deck/shared/` into `v1/src/assets/` (crop with a small script in `v1/tools/` if needed; keep the deck under 5 MB).
6. The carry device: a slim vintage board along the top edge whose rows flip on each forward slide change (≤ 1.2 s). If this is too hard, build it static first and report it.
7. Ambient life on one clock (`Deck.clock`): a far MRT train along the bottom, thinning rain, one late window. Small, low, slow.
8. Slide 6 QR: generate a QR PNG for the text `https://revisionpedia.geo.hashmeta.tech` with python (`pip install qrcode` or `segno`) into `v1/src/assets/qr.png`, at least 420 px on the slide. The owner’s agent may change the URL later.
9. `node kit/scripts/export.mjs v1` then `node kit/scripts/export.mjs v1 --motion`.

## Self-check loop (do at least 2 rounds)
Open `v1/out/sheet.png` and the motion frames and check every item; fix and re-export:
- Read only the headlines in order: does the talk make sense? Are they exactly the BRIEF's?
- No eyebrows/labels/pills/page numbers/dates/logos in corners. No white or off-white field. Colour journey continuous across the sheet.
- No text under 22 px; nothing with 3+ continuous lines; marker used 1–3 times total.
- Every screen in a `.browser` frame; screenshots cropped to the part that carries the claim and readable.
- Each number appears on only one slide (check against BRIEF claims table).
- `out/lint.txt` clean, or each remaining line justified in one sentence.
- PDF ≤ 5 MB.

## Outputs
- `deck/v1/` (src, index.html, out/), `deck/v1/DETAILS.md` (≥ 15 details: slide · detail · why).
- `docs/qw-outbox/002-pitch-deck/REPORT.md`: what you built, each self-check item PASS/FAIL, anything from the BRIEF you could not do and why, lint output, PDF size, paths to sheet.png and index.html.
- Copy `deck/v1/out/sheet.png` to `docs/qw-outbox/002-pitch-deck/sheet.png`.
