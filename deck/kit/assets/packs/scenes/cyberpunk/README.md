# Neon rain (scenes/cyberpunk)

A rain-soaked neon city seen from an elevated street: hazy megatowers, a monorail on its beam, flying cars on two
sky lanes, a holo billboard with a koi, and down on the wet pavement a noodle stall, a vending machine with a cat,
people under umbrellas and puddles full of reflected signs. Saturated magenta, violet and teal; never near-black.
Drawn entirely in code by `lib/cyberpunk.js` (SVG planes, one canvas for rain, one for steam).

## When to use it

- Developer tools, AI, security, gaming, crypto, nightlife, delivery: products that want energy and edge.
- Walk `data-tod` from 0 (dusk, coral smog) through .5 (magenta night) to 1 (3 am, teal smog, heavy rain) for a
  night that deepens across the deck.
- Not for: wellness, family, finance-trust or anything that should feel calm and daylit. Not when the product's own
  app is a dark neon UI (the demo hand-off must change colour; try `scenes/saturday` or `scenes/harbour`).

## Install

```
node scripts/use-pack.mjs scenes/cyberpunk <deck> --into 2      # once per slide, then set data-tod
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-cyberpunk` div | 0 dusk · .5 night · 1 three in the morning; changing it redraws |
| `--brand` | the section (or `:root`) | the koi on the holo billboard |
| `--brand-2` | the section | the billboard's panel, ring and glow |
| `--field` | set **by** the scene | the violet sky behind the headline zone, so `--ink-auto` is right |

The top-left third is open sky with thinned rain; white headlines read at every tod. Signs, stall and people live
at the bottom edges; the billboard sits high on the right.

## Make it the product's own

- Put the product's mark on the holo billboard instead of the koi (`koi` in the script: any SVG drawn around 0,0,
  about 60 px wide). It keeps the swim, the turn and the 20 s glitch.
- Rename a sign: the tube font covers A B C E H I K L M N O P R S T U 2 4. Keep words short (3 to 6 letters).

## Tiny details

See `item.json` → `details` (20). The ones people notice second: the T that buzzes out of step, rain visible only in
the lamp's cone, the cat's tail, the drip from the cable, the patrol car.

## Runtime

One `Deck.clock` per scene; everything is a function of `t`. Per frame: ~40 SVG attributes, a full-frame rain canvas
(up to ~370 short strokes) and a small steam canvas. Print / reduced motion: a composed still at `PRINT_T` (2.2 s,
monorail mid-frame).
