# Alpine (scenes/alpine)

A ski slope in the Alps: a far range and craggy main peaks, a forest ridge with an open snowfield where a skier
zigzags down, a chairlift climbing the right-hand slope, and a chalet with chimney smoke in the foreground, all under
gentle snowfall. Drawn in code by `lib/alpine.js` (SVG planes, one canvas for snow, one for smoke).

## When to use it

- Travel, outdoor, sport, wellness, booking and seasonal products; pitches about reaching a peak or a winter launch.
- Walk `data-tod` from 0 (bright afternoon, saturated blue) through .5 (alpenglow) to 1 (stars, moon, lit chalet).
- Not for: summer products, or products whose app is white and icy-blue (the demo must change colour).

## Install

```
node scripts/use-pack.mjs scenes/alpine <deck> --into 5      # once per slide, then set data-tod
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-alpine` div | 0 afternoon · .5 alpenglow · 1 night; changing it redraws |
| `--brand` | the section (or `:root`) | the skier's jacket, the skis by the door, the summit flag, some riders |
| `--brand-2` | the section | the sled, the night groomer, some riders |
| `--field` | set **by** the scene | the sky behind the headline zone, so `--ink-auto` is right |

The top-left is open sky (peaks rise only on the right half); snowfall thins there, so white headlines read at
every tod. The mid snowfield is calm space for cards; actors live on the far slope, the lift on the right, the
chalet at the bottom left.

## Tiny details

See `item.json` → `details` (16). The ones people notice second: the empty chair swinging, the skier's fading trace,
the groomer at night, the satellite, the pine shedding its snow.

## Runtime

One `Deck.clock` per scene; everything is a function of `t`. Per frame: ~25 SVG attributes, a full-frame snow
canvas (300 soft sprites) and a small smoke canvas. Print / reduced motion: a composed still at `PRINT_T` (17 s).
