# Surface

A tiled pool wall, the waterline across it. First press: a ring of caustic light ripples out across the tiles, then
the word rises from under the water and up through the surface. Under water it is refracted (bent, shifted, tinted);
in the air it is crisp; rings spread where it breaks through, a few drops fall back, a last wobble settles. ~2.25 s.
Born in the v4 "Poolrooms" lane of the liminal-spaces talk (2026-11-20), where the same wall then carries across the
deck as the camera sinks.

**Use it for** pools, swimming, spas, travel by the sea, hydration, ocean or climate products, wellness, dreamcore or
liminal-space talks; a "coming up for air" launch.
**Avoid it for** dry, technical or urgent products (security, finance infra), and dark brands that need a night field
(the air above the line wants a light, saturated aqua; set `--field` darker and the ink flips to white, which works
but loses the chlorine light).

## Adapt it
- `--field` (the dry wall), `--brand` (water at the surface), `--brand-2` (the deep water): on the section or once as
  `--deck-brand` / `--deck-brand-2` in theme.css. Ink is the engine's `--ink-auto` on `--field`.
- `--rv-wl` moves the waterline; the word rests 130 px above it. Long names shrink to fit 1600 px (`--rv-fs`).
- To carry the wall across a deck (the camera sinking a little each slide), see the v4 deck's `src/lib/10-pool.js`:
  `pitch/v4` in the 2026-11-20 liminal-spaces scratch folder.

## Params
`--field`, `--brand`, `--brand-2`, `--rv-wl`, `--rv-fs`, `__WORD__`. No mark (the word is the whole lockup).

## Tiny details
See `item.json` `details`. Not yet run through `pack-gallery.mjs --fuzz 6`.
