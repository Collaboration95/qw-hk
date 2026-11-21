# Headlamp at first light

Pre-dawn on a tree plantation under karst towers. Far workers' headlamps stop tree by tree along the rows, a
satellite crosses, and a drop of latex gathers at a tapping cut and falls into the cup. The name is hidden in the
mist. On the first press the near worker's headlamp clicks on with a stutter. The beam starts on the fresh cut of
the tree beside them, then swings up across the mist and finds the letters one by one. First light rises behind
the karst and the stars fade. The mist lifts off the name, the mark draws itself, and the headlamp clicks off
because it is light enough now. The reveal takes about 2.3 s. Print and reduced motion show the finished lockup at
first light.

First made for Plotline (EUDR plot checks on rubber in Surat Thani), deck `hack_roll/pitch/v6`. In that deck the
sky and land come from a full-panorama canvas. This pack draws them in SVG so that it stands alone.

**Use it for** agriculture, forestry, supply-chain traceability, land and climate data, and field-work products.
It also fits any pitch whose story starts before dawn or in the field.
**Avoid it for** urban, finance or developer-tool decks. It is also a poor fit for decks whose next slide is bright
daylight with no transition, because the reveal promises a day.

## Adapt it
- **Brand**: set `--field` (the sky, any colour or gradient), `--brand` and `--brand-2` on the `<section>`.
  - The sky is always shaded to pre-dawn, so the name always reads.
  - The name is cream ink with 12% of `--brand` mixed in, so even a navy or black brand stays light.
  - `--brand-2` tints the first light and the land.
- **Mark**: `__MARK__` (use-pack `--mark`) takes stroke paths with `pathLength="1"` in a 24 × 24 box. The paths
  draw one after another. For a dot, use a zero-length path (`M15 4h.01`).
- **Word**: set in the deck font, weight 800, at `--hl-fs` (212 px). Long names shrink so that mark and name fit
  in 1640 px.
- **World**:
  - The karst ridge, canopy, rows, leaf litter and stars are drawn once from seeded generators in the script; change the seeds or ranges to reshape them.
  - For a non-karst place, change the `ridge()` call to lower and wider settings to get hills.
  - For a crop that is not tapped, drop the tapping panel (`.cut`, `.latex`, `.spout`, `.cup`, `.drop`) and keep the bare trunks.
- **Beam**: it starts at the fresh cut on the third near tree (`cut`) and ends just left of the mark. The lamp sits at `L`.

## Tiny details
- The headlamp clicks on and off with a stutter.
- The beam starts on the fresh tapping cut.
- The letters are found while still blurred, then the mist lifts off them.
- First light rises behind the karst, the stars fade, and the morning star goes last.
- The mark draws stroke after stroke.
- Far headlamps stop at each tree with a faint cone on the trunk, then turn at the end of the row and work back, bobbing with each step.
- A steady, unblinking satellite crosses every 47 s.
- The near trees carry a real tapping panel: healed cuts, renewed bark, a fresh cut at 25° with latex along it, a spout, and a cup on a wire.
- About every 9 s, a drop of latex falls into a cup, each tree out of step with the others.
- The karst has spires, sheer blocks and domes, with a ragged forest fringe.
- Low mist drifts at the feet of the karst.
- Orange-red leaf litter covers the ground.
