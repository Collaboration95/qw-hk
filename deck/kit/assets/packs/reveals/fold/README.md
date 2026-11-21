# Fold

A self-healing cutting mat. The first press drops a folded square of paper onto it, all four corners tucked to the centre and the coloured side out. The corners open one after another, each turning in the light and casting a softening shadow, and the inside shows the mark printed on it; the creases stay. Then the wordmark opens out like an accordion and a glint runs along a crease. ~2.3 s. Reduced motion and print show the final lockup.

**Use it for** design tools, packaging and print, paper goods, makers and maker spaces, architecture, studios, gifting: anything about craft and careful construction.
**Avoid it for** AI, data and infra products (use a swarm or scan), nightlife and dark-mode worlds, and fast or aggressive brands; the motion is patient and tidy.

## Adapt it
- **Brand**: `--field` (the mat), `--brand` (the paper's outside), `--brand-2` (tints the pale inside). Set them on the `<section>` or once in `theme.css` as `--deck-brand` / `--deck-brand-2`. An outside that matches the mat is pushed toward the readable ink; on a pale mat the inside switches to a deeper colour so the sheet still stands off it.
- **Mark**: `__MARK__` (use-pack `--mark`): stroke paths in a 24 x 24 box, printed at 58 % of the sheet. Ink is `--brand` if it reads on the inside (3:1), else a darker brand, `--brand-2`, or `Deck.inkOn`.
- **Word**: `var(--ink-auto)`. Long names shrink the row to 1600 px (`--rv-fs`, `--rv-s`).
- **A different fold**: the flaps are the four corner triangles (`.rv-fold-flap[data-k]`, clip-paths and `REST` angles in the script); drop a flap to leave one corner open.

## Params
- `--field`: the cutting mat; its grid lines are mixed from the readable ink
- `--brand`: the paper's coloured outside (seen while folded)
- `--brand-2`: tints the pale inside the mark is printed on
- `--rv-fs`: wordmark size (shrinks for long names)
- `--rv-s`: sheet size (shrinks a little for long names)
- `--rv-y`: the row's centre line
- `__MARK__`: stroke paths in a 24 x 24 box, printed on the inside of the sheet

## Tiny details
the folded sheet drops onto the mat on a cushion of air: tilt and height spring out, with a small slide · its shadow on the mat starts wide and soft and tightens as it lands · it arrives as a blintz: all four corners tucked to the centre, coloured side out, so the print is hidden · the corners open one after another, each turning toward the light · each corner darkens or brightens as its face turns to or from a top-left light · a corner's shadow on the sheet is sharp while it is folded and softens and fades as it lifts · each corner overshoots flat, then springs back to a few degrees of lift: creased paper never lies quite flat again · the mark is printed once on the sheet and copied onto each corner, so it is whole the moment they open · the four creases stay in the paper as a dark valley with a bright lip · the sheet's shadow on the mat grows its corners back as they open · the wordmark opens out like an accordion from a folded stack, panel by panel, faces alternately lit and shaded · a glint runs along one crease at the end · the mat has a 1 cm and 5 cm grid, two 45° guide lines, a protractor circle and a ruler along the bottom edge · soft-light grain and a corner light falloff on the mat · the print ink is the brand if it reads on the inside, else the engine's readable ink.
