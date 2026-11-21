# Powers of ten (carry)

One continuous zoom across slides. The deck has one world, and each slide is a view of it at its own scale: the
whole island, one stretch of coast, then one cell. On a forward change the camera dives from the last view to the
new one (≤ 1.2 s). The zoom is logarithmic and centred on the point the two views share. A move wider than ×12
passes through in-between levels painted from the same world, so the coastline gains detail all the way down and
nothing pops. The scale caption re-measures itself on the way (km, then m, then cm), and viewfinder brackets lock
onto what the next slide will show. Slide content cuts, and only the picture moves. Back moves, jumps, print and
reduced motion land directly on each slide's own view.

The bundled world, `P.coast()`, is a fractal island: every halving of scale adds one octave of noise, so there
really is a shoreline at every power of ten. At the bottom, `P.cells` turns the world into crisp measured cells.

**Use it** when the story is a change of scale: maps, geo, climate, satellites, data at many resolutions, a fleet
down to one vehicle, a codebase down to one line, "from everything to the one thing that matters". 3 to 5 views,
each 8× to 30× closer than the last. **Don't use it** for side-by-side comparisons, dense data slides (the map
competes) or a story that moves sideways rather than in. For a sideways journey, use `carry/pan`.

## Install

```sh
node scripts/use-pack.mjs carry/powers-of-ten <deck> --demo --word "Name"   # lib + demo/01-whole, 02-stretch, 03-cell
# or one slide only: --as N installs slide.html (= demo 1)
```

`P = Pack['powers-of-ten']`. A slide joins the zoom with one `P.view(...)` call. Its canvas becomes the slide's
first child, fills the slide edge to edge and sits behind the content, so the slide needs no field.

## API (window.Pack['powers-of-ten'])

- `view(id, cam, { paint, frame, scrim = .28, px, printT = 14 })`: slide `id` looks through
  `cam = { s, x0, y0 }` (s = px per world unit, (x0, y0) = the world point under the top-left pixel), or
  `P.at(x, y, s, cx, cy)` (world point (x, y) at screen (cx, cy)). `paint(g, cam, ctx)` replaces the world for this
  view's still picture. `frame(g, t, k)` draws what moves on the one clock (`k.since` = seconds since a forward
  arrival, Infinity at rest; `k.still` = print or reduced motion). `px: true` keeps the picture crisp while it
  scales. A `.cy-powers-of-ten-bar` element in the slide becomes its scale caption.
- `world({ paint(g, cam, ctx), sample(x, y, detail) → [r, g, b], unit = 1000 })`: the deck's own world, painted at any
  camera. `unit` = metres per world unit, for the caption. `world()` with no argument returns the world in use.
  The bundled one adds `coastPoint(angle, detail)` (a point on its outer shoreline) and `elev(x, y, detail)`.
- `chain('sA>sB', { via: [level or view ids], dur })` overrides one move. `chain('sA>sB', false)` cuts it.
- `level(id, cam, { paint })`: a named in-between picture to use in `via`.
- `entry = 5`: zoom factor of the establishing dive on a first arrival (from a slide without a view). 0 = none.
- Helpers: `cells(g, cam, ctx, { size, gap, jitter })`, `clouds(g, t, { speed, alpha })`, `toScreen(cam, x, y)`,
  `bar(el, s)`, `palette`, `when(fn)`, `mix`, `css`, `smooth`, `clamp`.
- CSS: `<div class="cy-powers-of-ten-vf" style="--t:.9"><i></i></div>` gives viewfinder brackets that lock on `--t` s
  after a forward arrival (`--c`, `--l`, `--w` set colour, arm length and stroke). `<div class="cy-powers-of-ten-bar"><i></i><b></b></div>`
  gives the scale caption.

## Make it the product's

- **Colours**: the whole palette derives from the FIRST view's `--field`, `--brand` and `--brand-2` (demo 1 sets
  them as `--brand: var(--deck-brand, …)`; delete the line to inherit the deck's theme). The sea is the field
  pushed away from its ink. The shallows and land come from `--brand-2`, the high ground and coastline from
  `--brand`. Each view's `--ink-auto` is re-picked from the sea, so headlines use `color: var(--ink-auto)` and read
  on any brand, light or dark.
- **Your own world**: pass `P.world({ paint, sample, unit })` in a lib file or the first slide's script, before
  `Deck.start`. A city: blocks, then a street, then one building. A codebase: a treemap, then a file, then one line.
  A fleet: a country, then a depot, then one vehicle. `paint` must work at any camera. Coarse views are fine if a
  finer view adds detail (that is the whole effect).
- **The bottom of the zoom**: replace `P.cells` in demo 3 with the product's own unit (a pixel, a plot, a seat, a
  line of code) and its `frame` with the arrival moment (the demo's target cell glows once and a ring opens).
- **Where to zoom**: the demos aim at `world.coastPoint(.55)`. Change the angle to pick another stretch of coast.
  Demo 3 steps inland to the first land cell. Keep each slide's bracket on the next view's centre.
- **Brackets**: they are positioned by hand from the next view's camera (demo 1 computes it with `toScreen`). Draw
  them a little larger than the true next frame so they read at a glance.

## Motion rules

The carry exception in taste.md §11: content cuts, and the picture moves.
- **Forward step between two views**: a dive (1.0 s, or 1.15 s with in-between levels). The arriving view's own
  `frame` runs under the move, so its arrival story starts during the dive. The headline zone gets a soft scrim in
  the sea colour while imagery flies under it.
- **First arrival** (a fresh load or from a slide without a view): an establishing dive from `entry`× further out.
- **Back, jumps, print and reduced motion**: the slide simply shows its own view. Print rasterises each canvas
  to a JPEG at rest, so every slide prints its own view and the PDF stays small.

In-between levels and entry dives are painted in idle time after start, so the first move does not hitch.

## Tiny details

See `item.json` `details`.
