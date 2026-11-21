# Job 002 · rebuild one slide, then publish the deck as a QW Page

The deck already exists at `deck/v1` (built from `deck/BRIEF.md` with the engine in `deck/kit`). Your job is narrow: replace the four identical icon cards on slide 4 with four real artifact cards, export, and publish the deck. Change NOTHING else in the deck.

## A. Rebuild `deck/v1/src/slides/04-pipeline.html`

Keep exactly: the `<section class="slide" id="s4">` wrapper, the `<h2 data-enter>` headline text "QwenWork reads, checks nightly and hands back the fix.", the red `.line` thread SVG, the `.rider`, the `<aside class="notes">` block, and the `#s4{--field:var(--f4)}` rule. Keep the 4-column `.stations` grid and the `pop` arrival classes with their `--t` delays (.12, .42, .72, 1.02).

Replace the content of each `.st` card. Delete the `.ic` icon tiles entirely. Each card becomes: a bold role word (keep `<b>`: Skill / Nightly task / Agent / Page) on top, then ONE small real artifact below it, styled as a mini object from the deck's world. Use exactly this text, nothing more:

1. **Skill**: a dark code tile (same dark gradient as the old `.ic` tiles, 20 px radius, monospace 26 px, ink #F3ECDC) showing two lines:
   `name: recall-press`
   `reads .pptx .docx .md`
2. **Nightly task**: a mini split-flap row (reuse the classes in `deck/v1/src/lib/10-flap.css`; look at `01-tension.html` for an example) reading `09:00` with a small caption under it, 26 px: `every night · SGT`
3. **Agent**: a paper verdict slip (warm paper colour like the document cards on slide 2) with a 28 px serif line `Manufacturing stalled` where "stalled" has the struck style used on slide 3 (`.strike`), then a small red pill `Now wrong`
4. **Page**: the existing image `assets/map-crop.jpg` inside a tiny `.browser` frame (see engine `base.css` for `.browser`), width filling the card, keep the `.hot` class on this card

Rules: no text under 22 px; no new colours (use the CSS variables already in `deck/v1/src/theme.css`: `--ink`, `--ink-2`, `--accent`, `--thread`, `--navy`); prefix every new class with `#s4`; each card keeps the same height; nothing may overlap the headline or the red thread line at y = 502 px (move the stations grid `top` if needed, the thread must still pass behind the cards' top edge).

## B. Export and check

From `deck/`: `node kit/scripts/export.mjs v1` then `node kit/scripts/export.mjs v1 --motion`.
Open `deck/v1/out/04.png` and `deck/v1/out/motion/04-b.png`. Check: all four artifacts readable, no overlap, lint clean (`deck/v1/out/lint.txt`). Fix and re-export until it passes (at most 3 rounds).

## C. Publish

Publish `deck/v1/index.html` (it is self-contained) as a QW Page named "Recall Press pitch". Open the public URL and confirm the first slide loads.

## Outputs

- `docs/qw-outbox/002-deck-slide4-and-page/REPORT.md`: what you changed, the check results, lint output, the public Page URL.
- Copy `deck/v1/out/04.png` to `docs/qw-outbox/002-deck-slide4-and-page/04.png`.
