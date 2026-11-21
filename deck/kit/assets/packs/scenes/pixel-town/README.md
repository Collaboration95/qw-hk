# Pixel town (scenes/pixel-town)

A cosy pixel-art town, like a game's title screen: dithered sky, far mountains with a windmill and a balloon, a row
of houses with a bakery and a clock tower, a cat on a roof, villagers, and a bus that stops, picks someone up and
drives on with the product's name on its side. Drawn in code by `lib/pixel-town.js` at 4 px art pixels, with
`lib/pixel-town.css` (crisp scaling, a faint CRT scanline).

## When to use it

- Games, local and community products, delivery, transit, small-business tools, anything "your neighbourhood".
- Walk `data-tod` from 0 (sunny afternoon) through .5 (golden sunset) to 1 (night, lit windows) for a day that
  passes across the deck; the clock tower shows the matching hour.
- Not for serious enterprise or health pitches.

## Install

```
node scripts/use-pack.mjs scenes/pixel-town <deck> --into 4 --word "Acme"      # --word puts the name on the bus
```

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-pixel-town` div | 0 afternoon · .5 sunset · 1 night; changing it repaints the planes |
| `data-word` | the div | the name on the bus's side panel (A–Z, 0–9; trimmed to fit 32 art px, about 7 letters) |
| `data-seed` | the div | reshuffles which windows light when, curtains, trees and stars |
| `data-print-t` | the div | clock time of the print still (default 43: the bus at the stop, door open) |
| `--brand` / `--brand-2` | the section | the bus body and its name panel; the panel's ink comes from `Deck.inkOn` |
| `--field` | set **by** the scene | the sky behind the headline zone, so `--ink-auto` is right |

The sky in the top-left is a deep, saturated blue, orange or indigo at every tod (the day sky is darker than a real
one on purpose), so white headlines read. The town sits along the bottom third; the sky above the rooftops is calm
for cards.

## Make it the product's own

- `--brand` on the bus is where eyes land; the name panel is the second colour.
- Long names are trimmed to the panel; use a short form of the name.

## Tiny details

See `item.json` → `details` (18). The ones people notice second: the waiting passenger looking up and down the
street, the window flickering blue with a TV, the cat's stretch every 23 s, the clock showing the hour for the tod.

## Runtime

One `Deck.clock` per scene; every motion snaps to whole art pixels and sprites step through two frames. Static
planes are painted once per tod. Print and reduced motion get a composed still at `printT`.
