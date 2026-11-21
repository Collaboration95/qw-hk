# Magnify

The needle in the haystack. A dense map of ~10,000 cells; a magnifying glass (the product, in `--brand`) glides
in over it, its shadow a beat behind, its handle swinging with the inertia. Inside the lens the map is 3.6× closer,
and two cells that look like all the others outside it glow ember as the lens reaches them, the second a beat late.
The lens overshoots, settles, rings close around both cells and the product's mark pops on the rim. The embers keep
a faint flicker. ~1.45 s on a forward arrival, then it rests.

**Suits** detection, monitoring, inspection, fraud, defects, search: "finds the two bad cells in 10,000".
**Not for** claims about many findings (a heat map is better), or when the haystack is not visual at all.

## Re-skin it

- **Copy**: the `h2` carries the claim and its one number; keep it to two short lines (the column is 900 px).
- **The map**: `drawMap` paints `COLS × ROWS` cells of `CELL` px from a seeded noise (`val`): streets, a river. Make it
  the product's haystack (solar panels, a sensor grid, server racks, log lines as rows). `HOT` holds the two cells.
- **Brand**: `--brand` is the rim, handle and the mark badge (`__MARK__`, `--on-brand` ink); `--brand-2` tints the map
  (`--st-magnify-lo/hi/bg` are mixes of it); `--st-magnify-ember` is the find.

## Runtime

The map is drawn once; the lens view (~120 tiles on a 600 × 600 canvas) is redrawn only while the lens moves (one
rAF for 1.45 s on a forward arrival). ←, print, reduced motion and `final` draw the rest pose. The flicker is a CSS
`amb-` keyframe on the glow, on the engine's clock.

## Tiny details

See `item.json`: a real 10,000-cell map with streets and a river, cells hidden outside the glass, tiles with gaps
inside it, heat that follows the lens with one late cell, the ambient flicker, closing rings, the spring settle, the
lagging shadow, the swinging handle, the sliding reflection, the double rim, the mark on the rim.
