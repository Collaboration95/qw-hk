# Fireflies (scenes/fireflies)

A forest glade from late dusk into moonlit night. Rows of trees fade into mist, a clearing opens in the middle
distance, and fireflies flash over the meadow. A deer crosses the clearing, an owl sits on a branch, and the moon
rises out of the clearing. Drawn in code by `lib/fireflies.js` (canvas planes) and `lib/fireflies.css` (fog drift,
the breathing of the moon shafts, grain).

## When to use it

- Products about attention, sleep, calm, nature, community, or small signals adding up: a sync, a swarm, a network
  that lights up together. The synchronised flash ripple is a quiet metaphor for "many small things in step".
- Walk `data-tod` from 0 (apricot afterglow) through .5 (blue hour) to 1 (moonlight shafts) for an evening that
  passes across the deck.
- Not for loud, fast or enterprise pitches, or a deck that must feel bright and daytime.

## Install

```
node scripts/use-pack.mjs scenes/fireflies <deck> --into 4      # once per slide, then set data-tod
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-fireflies` div | 0 late dusk · .5 blue hour · 1 moonlit night; changing it repaints the planes |
| `data-seed` | the div | reshuffles the trees and the flies; keep one seed across a deck so it stays one place |
| `data-print-t` | the div | clock time of the print still (default 69: the deer is mid-clearing, grazing) |
| `--ff-glow` | the div | firefly colour as `#rrggbb` (default `#ceff68`); a brand accent works |
| `--brand` | the section | the bioluminescent mushrooms at the foot of the big trunk (default cyan) |
| `--field` | set **by** the scene | the sky behind the headline zone for this tod, so `--ink-auto` and `Deck.inkOn()` pick white |

The top-left sky is a saturated apricot, blue or indigo at every tod, never white and never flat black, so a 92 px
white headline reads. The trees frame the left and right edges; the clearing in the centre stays calm for cards.

## Make it the product's own

- Set `--ff-glow` to the brand colour for the flies and `--brand` for the mushrooms; the rest stays natural.
- The deer, owl and bat are drawn by `drawDeer()`, `drawOwl()` and `drawBat()`; drop a call in `frame()` for a calmer
  slide.

## Tiny details

See `item.json` → `details` (19). The ones people notice second: the flash ripple that crosses the glade every
13 s, the owl's right eye blinking a beat late, the one firefly resting on a fern, the deer lifting its head to look
at you.

## Runtime

One `Deck.clock` per scene and two `@keyframes amb-*` (fog, shafts). Static planes are painted once per tod; per
frame only the fireflies, deer, owl and bat are redrawn. Print and reduced motion get a composed still at `printT`
with no out-of-focus flies.
