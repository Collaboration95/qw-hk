# Constellation

A dusk sky: stars twinkling, the field's own colour glowing low on the horizon behind a dark ridge with a small
observatory. The first press brings up the mark's stars a little brighter than the rest, then lines draw star to
star (stopping short of each star, like a star chart) until the mark is drawn; each star flares as its line
arrives, and the wordmark rises in beneath it. At rest the sky twinkles, the observatory window glows, and every
19 s a shooting star crosses. ~1.9 s. Canvas, one loop (the deck clock). Print and reduced motion show the chart.

**Use it for** space, AI and research, networks and graph products, maps and discovery, education: anything about
connecting points into a pattern.
**Avoid it for** loud consumer or retail brands, data products that need a denser, busier picture (use swarm-word),
and decks whose app is itself a dark starry UI.

## Adapt it
- **Brand**: `--field` is the sky by day; an overlay shades it to dusk, so light, dark, saturated, cream and
  gradient fields all give a readable night sky with their colour on the horizon. `--brand` is the accent star if it
  reads on the dusk sky (3:1), else `--brand-2`. Lines, stars and the wordmark take ink computed from the shaded sky.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box. Each stroke is sampled,
  simplified to its corners, and the corners become stars (at most ~10 per stroke); a zero-length stroke (a dot)
  becomes the accent star. Geometric marks with clear corners read best; very curly marks become polygons.
- **Size and place**: `S` (constellation size, 450 px), `CX`/`CY` (its centre), `--const-fs` and `.rv-const-word`
  `top` for the wordmark.
- **Timing**: `E0`/`EW` (when lines draw), `WT` (when the word rises), `END`.

## Tiny details
Dusk-shaded field with a brand-coloured afterglow · 300 field stars, thinning toward the glow, each on its own
twinkle · a few coloured stars · strokes reduced to corners, shared corners merged · the mark's stars appear first ·
lines stop short of each star · diffraction flares as lines arrive · a dot becomes the accent star · no field star
sits on a line · the word rises out of a blur · a ridge with an observatory and a flickering window · breathing
stars at rest · a shooting star every 19 s.
