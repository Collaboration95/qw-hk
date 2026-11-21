# Harbour (scenes/harbour)

A working harbour from dawn to night: a headland with a lighthouse, a container port where a gantry crane lifts
boxes off a docked ship, sailboats, a ferry crossing, buoys, a wooden pier with a dinghy, and a fishing boat in the
foreground. Drawn in code by `lib/harbour.js` (SVG planes, one canvas for water glints).

## When to use it

- Logistics, shipping, supply chain, travel, climate and ocean products, marketplaces that move goods.
- Walk `data-tod` from 0 (dawn) through .5 (bright, saturated day) to 1 (night: lighthouse, buoys) for a day that
  passes across the deck. The crane is a quiet metaphor for "moving things reliably".
- Not for: night-only or edgy products (use `scenes/cyberpunk`), or a deck whose app is a blue maritime UI.

## Install

```
node scripts/use-pack.mjs scenes/harbour <deck> --into 4      # once per slide, then set data-tod
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-harbour` div | 0 dawn · .25 morning · .5 day · .75 golden hour · 1 night; changing it redraws |
| `--brand` | the section (or `:root`) | a sail, lighthouse stripes, ferry band and funnel, the crane's box, the fishing boat's stripe |
| `--brand-2` | the section | the cranes, a second sail, the dinghy |
| `--field` | set **by** the scene | the sky behind the headline zone, so `--ink-auto` is right |

The sky in the top-left is a saturated blue or violet at every tod, so white headlines read. The port sits on the
horizon at the centre right; the pier and fishing boat hold the bottom corners; the open sea between is calm space
for cards.

## Make it the product's own

- Brand colours go on the crane's box and the ferry first: that is where eyes land.
- The ferry, sails and crane cycle are separate blocks in the frame function; slow them or remove one for a calmer
  slide.

## Tiny details

See `item.json` → `details` (18). The ones people notice second: the box swaying on its cables, the lighthouse flash
when the beam faces you, the gull on the pier turning its head, the buoys blinking on different beats.

## Runtime

One `Deck.clock` per scene; everything is a function of `t`. Per frame: ~30 SVG attributes and a small glint canvas.
Print / reduced motion: a composed still at `PRINT_T` (15 s: ferry mid-harbour, the crane carrying its box).
