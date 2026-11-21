# Point field (carry)

The product's real data points as one field of thousands of dots that rearranges into every slide's figure: the
cloud of records, then the product's mark and name made of those same records, then a histogram where every bar is
its own records. Slide content cuts instantly. On a forward step the points swarm from where they are to their new
places (≤ 1.2 s). This is a product-agnostic version of the hr-2026 v4 field, the one deck the user liked.

**Use it** when the product has rows: users, cells, orders, commits, events, sensors. Real data makes it land:
"every dot is one X". **Don't use it** when the data is a handful of items (use cards), or when a fake cloud would
stand in for data the product doesn't have. Say "simulated" in the notes if it is.

## Install

```sh
node scripts/use-pack.mjs carry/point-field <deck> --as 2 --word "Name" --mark leaf   # slide.html = demo 2 (cloud → lockup)
# the other demo slides (cloud, bars): copy with their numbers filled in
S=<skill dir>; D=<deck>
sed -e 's/__N__/1/g' -e 's/__WORD__/Name/g' $S/assets/packs/carry/point-field/demo/01-cloud.html > $D/src/slides/01-cloud.html
sed -e 's/__N__/3/g' -e 's/__WORD__/Name/g' $S/assets/packs/carry/point-field/demo/03-bars.html  > $D/src/slides/03-bars.html
```

Each field slide is any engine slide that calls `PF.slide(id, …)`. The canvas is created as the slide's first child
if the slide has none. `slide.html` alone shows the device: on a fresh load, the cloud condenses into the lockup.

## Make it the product's

- **Data**: call `PF.config({ points })` before the first slide script that reads points. The top of the first
  field slide's script works, or a `src/lib/zz-field.js`. Rows are `[{u, v, k, w}]` (0…1, v down),
  `[{x, y, k, w}]` or `[[x, y, k, w]]` (any range, y up, fitted into `home` keeping aspect). `k` = category
  (palette index), `w` = any value. Put the extraction script in the deck's `tools/` and the JSON in `src/lib/`
  (it becomes `window.DATA[name]`). 2,000 to 6,000 points read best.
- **Colours**: by default the palette is derived per slide from `--field`, `--brand`, `--brand-2` and the engine's
  `--ink-auto`: `[0 ink tint, 1 brand, 2 brand-2, 3 their mix, 4 brand→ink, 5 ink]`. Each colour is pushed toward
  the ink until it reads on the field, so a cream, yellow, red or near-black field all work. The demo slides set
  defaults for the three variables. Delete those lines to inherit the deck's. `PF.config({ palette: [...] })`
  pins your own colours. `PF.palette(id)` returns a slide's colours for `under`/`over` drawing.
- **Mark and name**: `<svg class="mark" viewBox="0 0 24 24">…stroke paths…</svg>` in the slide (hidden), then
  `PF.fig.lockup(markEl, 'Name', { box })`, `PF.fig.mark(markEl, { box })` or `PF.fig.text('Name', { box })`.
  Names of 1 to 12+ characters, with spaces or "&", fit the box. A long name wraps to two lines when that reads
  bigger, and the dot radius follows the pitch, so dots never merge.
- **Text** on field slides: `color: var(--ink-auto)`.

## API (window.Pack['point-field'])

- `PF.slide(id, { place(p, o, i), under(g, P, t), over(g, P, t), breathe, sweep })`: `place` sets `o.x, o.y, o.r,
  o.a, o.c, o.d` (delay ≤ .3 s). `p = { i, u, v, k, w, h, h2, h3, d }`, where `h*` are stable hashes and `d` is
  the source row. `P` = arrival progress (1 at rest and in print).
- `PF.fill(fig, { r, a, c, d, order, only, pick, spare, style })` returns a `place`:
  - `r`, `a`, `c` are numbers or `(p, g, s) => …`. `g` = slot group (letter, bar, ring part, 0 = the mark in a lockup).
  - `d`: `'random' | 'wave-x' | 'wave-y' | 'center' | n | fn`.
  - `order`: `'near'` (Hilbert: the cloud flows into the shape), `'random'` (a true swarm, speckled colour), `'x'`,
    `'y'`, `'angle'`, `'data'`.
  - `spare`: `'dust' | 'hide' | 'sink'`.
- Figures, under `PF.fig.*`:
  - `scatter({ box })` is the data as it is.
  - `grid({ x, y, cols, rows, pitch })`.
  - `layers({ cx, cy, w, count, gap, tilt, of })` stacks oblique sheets. `fig.sheet(g, k)` traces one sheet.
  - `bars({ x, y, values, cols, pitch, gap, rows })` and `histogram({ x, y, bins, of, cols, pitch, gap, sort })`.
    Each point stacks into its own bin. `fig.geo()` returns `[{x, top, n}]` for labels.
  - `text`, `mark` and `lockup` (above).
  - `shape(draw(g), { box, count | pitch })` samples any canvas drawing.
  - `polygon(points, …)`.
  - `ring({ cx, cy, r, thick, parts, pitch, gapDeg })` is a dot donut.
- `breathe: { amp: .75, rate: .28, pulse: .07 }` or `false`.
- `sweep: { every: 9, dur: 1.8, angle: 14, width: 150, gain: .85, phase, color }`, or `null` (the default).
- `PF.config({ home, dur, spread, stragglers, curl, dust })` tunes motion.
- `PF.refresh()` after changing data.

## Motion rules

The motion follows the carry exception in taste.md §11:
- **Forward step from a field slide**: every point travels from where it is now (mid-flight positions included),
  eased and staggered. About 3% are stragglers. Everything is done by 1.2 s.
- **First arrival** (a fresh load, or coming from a slide without the field): the points condense out of their own
  faint cloud.
- **Back, jumps (0–9, Home/End), print and reduced motion**: the final state, at once.
- Ambient life (breathing, sweep) runs on `Deck.clock`.

## Tiny details

See `item.json` `details`.
