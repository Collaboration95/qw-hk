# Orbit (scenes/orbit)

Earth from low orbit: the curved limb across the lower right, clouds and coastlines drifting under you, satellites
crossing the stars, and a space station in the right third. `data-tod` moves the sun, from the day side through
the terminator (a sunset band on the limb) to the night side with city lights, airglow and an aurora. Drawn in code
by `lib/orbit.js` (a procedural planet texture, canvas planes) and `lib/orbit.css`.

## When to use it

- Anything planetary or networked: climate, logistics, satellites and data, global payments, connectivity, "the
  whole world at once". Tod .5 is the hero frame for a vision slide; tod 1 suits a "while you sleep" slide.
- Not for intimate, local or playful products: it is vast and quiet.

## Install

```
node scripts/use-pack.mjs scenes/orbit <deck> --into 4      # once per slide, then set data-tod
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-orbit` div | 0 day side (sun glint) · .5 terminator and sunset on the limb · 1 night side |
| `data-seed` | the div | another planet (continents, clouds, cities); keep one seed across a deck |
| `data-print-t` | the div | clock time of the print still (default 40) |
| `--brand` / `--brand-2` | the section | the aurora's rays and their tops (default green and magenta) |
| `--field` | set **by** the scene | the space colour behind the headline zone, so `--ink-auto` is right |

Space is deep indigo and violet at every tod, never black, so white headlines and cards read. The planet holds the
lower right; the top-left and the centre are open sky.

## Make it the product's own

- `--brand` on the aurora is the single brand accent; it shows from about tod .6.
- The satellites are the `sats` list in `orbit.js` (start, end, crossing time, cycle, kind); add or remove rows for a
  "network" slide.

## Tiny details

See `item.json` → `details` (16). The ones people notice second: a satellite flaring once mid-pass, satellites
going out as they slide into Earth's shadow, the station's panel glinting every 11 s, lightning in night-side storms.

## Runtime

One `Deck.clock` per scene. The planet texture is generated once per seed (about 0.1 s) and cached; the surface is
resampled at a third of full size every second frame, about 1.3 ms a frame at 1920 × 1080. Print and reduced motion
get a composed still at `printT`.
