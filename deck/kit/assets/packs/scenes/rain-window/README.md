# Rain window (scenes/rain-window)

A café window on a rainy evening. You are inside, warm, looking out through wet glass at a blurred street: shop
lights, a traffic light, cars, a tram, passers-by under umbrellas. Drops cling, grow, run and merge on the pane;
condensation fogs the corners; the café's name is on the glass in mirrored gold leaf; a coffee steams on the sill.
Drawn in code by `lib/rain-window.js` (a drop simulation and canvas planes) and `lib/rain-window.css`.

## When to use it

- Products about focus, reading, writing, music, cafés and cities, remote work, "the quiet hour".
- Walk `data-tod` from 0 (blue hour) through .5 (evening) to 1 (late night: fewer cars, the last tram).
- Not for sunny, outdoor or high-energy pitches.

## Install

```
node scripts/use-pack.mjs scenes/rain-window <deck> --into 4 --word "Acme"      # --word puts the name on the glass
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-rain-window` div | 0 blue hour · .5 evening · 1 late night; changing it repaints the street |
| `data-word` | the div | the café's name in mirrored gold leaf (any length, shrinks to fit; default "Café") |
| `data-seed` | the div | reshuffles the buildings, the lit windows and the rain |
| `data-print-t` | the div | clock time of the print still (default 26.5: the tram is passing) |
| `--brand` | the section | the neon sign across the street and its reflection on the wet road |
| `--field` | set **by** the scene | the street colour behind the headline zone, so `--ink-auto` is right |

The headline corner gets fewer drops and less mist, and the street behind it is a deep blue or violet at every tod,
so a 92 px white headline reads. Cards sit on the blurred street, which is calm by design.

## Make it the product's own

- `--brand` on the neon sign is the single accent; the gold leaf carries the name.
- The street (`paintStreet()`), the tram (`paintTram()`, every 52 s in `drawStreet()`) and the sill (`paintSill()`)
  are separate functions; swap the shopfronts or the cup without touching the rain.

## Tiny details

See `item.json` → `details` (17). The ones people notice second: each drop showing the street upside down, a
running drop wiping a clean path that mists over again, the traffic light's colour running down the wet road, the
pharmacy cross blinking on, on, off.

## Runtime

One `Deck.clock` per scene. The glass is warmed up with 23 s of simulated rain before the first frame. Blurred
layers are drawn at half size; about 0.6 ms a frame at 1920 × 1080. Print and reduced motion get a composed still
at `printT`.
