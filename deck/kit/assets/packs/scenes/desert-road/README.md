# Desert road (scenes/desert-road)

A two-lane highway across the desert: mesas and buttes on the horizon, a mile-long freight crossing the far plain,
a radio mast on a butte, a water tower with the town's name, telephone poles, saguaros and a barbed-wire fence in
the foreground. `data-tod` runs from a hot golden afternoon (heat shimmer, a mirage) through sunset and the evening
star to a night with the Milky Way. Drawn in code by `lib/desert-road.js` (canvas planes) and `lib/desert-road.css`.

## When to use it

- Long-haul and patient products: logistics, freight, travel, energy, rural connectivity, field tools, anything
  about distance or "the long game". Tod .5 (sunset) is the hero frame.
- Walk `data-tod` across the deck so the day ends as the pitch does.
- Not for dense urban, playful or kids' products.

## Install

```
node scripts/use-pack.mjs scenes/desert-road <deck> --into 4 --word "Acme"      # --word paints the water tower
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-desert-road` div | 0 golden afternoon · .5 sunset · 1 night; changing it repaints the planes |
| `data-word` | the div | the name on the water tower (any length, shrinks to fit; default "MESA") |
| `data-seed` | the div | reshuffles the freight cars, the scrub and the stars |
| `data-print-t` | the div | clock time of the print still (default 30: the freight mid-screen) |
| `--brand` | the section | the water tower's tank; the word on it takes ink from `Deck.inkOn` |
| `--field` | set **by** the scene | the sky behind the headline zone, so `--ink-auto` is right |

The sky in the top-left is a deep blue, orange or violet at every tod, so a 92 px white headline reads. The road
and the freight hold the horizon band; the open sky above is calm for cards.

## Make it the product's own

- `--brand` on the water tower plus `--word` is the one branded object; it sits by the road at centre left.
- The freight, cars, hawk, coyote and tumbleweed are separate blocks in `drawFar()`, `drawRoad()` and
  `drawLife()`; remove one for a calmer slide.

## Tiny details

See `item.json` → `details` (16). The ones people notice second: the end-of-train marker blinking red at night,
the heat shimmer that bends the horizon, every third car being a truck with amber markers, the coyote lifting its
muzzle every 40 s.

## Runtime

One `Deck.clock` per scene; static planes are painted once per tod, and per frame only the train, road traffic,
mast lamp, shimmer and animals are redrawn (about 0.3 ms a frame at 1920 × 1080). Print and reduced motion get a
composed still at `printT`, with no shimmer and no tumbleweed.
