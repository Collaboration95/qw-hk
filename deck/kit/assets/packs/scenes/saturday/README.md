# Saturday evening (scenes/saturday)

A river city on a slow Saturday, from 5 pm to blue hour. A far hazy skyline, the city bank with a promenade of
tiny people, a river that mirrors it all, and a steam train puffing across a brick viaduct along the bottom.
Everything is drawn in code (SVG + two small canvases) by `lib/saturday.js`; nothing is an image.

## When to use it

- Products about people, places and weekends: local discovery, food, travel, transit, social, community, maps.
- Decks that want warmth and a sense of life: walk `data-tod` forward one step per slide (0, .15, .3 … 1) and the
  sun sets across the pitch. Same city, same windows, same order; only the light changes.
- Not for: dark or neon products (use `scenes/cyberpunk`), finance or enterprise decks that need austerity, or a
  deck whose app is a purple dusk itself (the demo hand-off must change colour).

## Install

```
node scripts/use-pack.mjs scenes/saturday <deck> --into 3      # once per slide, then set that slide's data-tod
```

It installs `src/lib/saturday.js` and `src/lib/saturday.css` and inserts
`<div class="sc-saturday" data-tod="0.5" aria-hidden="true"></div>` as the slide's first child. Nothing else needed:
the scene sets its own field and fills the slide edge to edge behind the content.

## Params

| Param | Where | Meaning |
|---|---|---|
| `data-tod` | the `.sc-saturday` div | 0 late afternoon · .5 sunset · 1 blue hour. Any value; changing it redraws. |
| `--brand` | the section (or `:root` in theme.css) | the kite, the tour boat's flag, one moored dinghy |
| `--brand-2` | the section | the kite's second panel, every fourth ferris-wheel cabin |
| `--field` | set **by** the scene | the sky colour behind the headline zone for that tod, so `--ink-auto` is right |

White headlines read at every tod (the top-left sky stays a saturated blue, violet or indigo). The top-left third
is open sky; actors live low (the promenade at y≈770, the river, the viaduct) or far (birds, kite, ferris wheel on
the right). White cards in the centre cover only buildings and sky.

## Make it the product's own

- Tint with `--brand` / `--brand-2` (kite, flag, dinghy, cabins).
- The train is the hero actor. For a transit or logistics product, keep it; for others, it is still the thing
  people remember. Its timing (`PERIOD`, `V`, `PH` at the top of the train block) puts it mid-river in the print
  still (`PRINT_T`).
- Swap a landmark in `farCity()` / `midCity()` for the product's city (the TV tower, dome and twin towers are
  generic on purpose).

## Tiny details

See `item.json` → `details` (26 of them). The ones people notice second: the semaphore drops before the train
appears, the birds leave the wire as the loco nears, the skater's ollie every 40 s, the late window, the clock
tower that reads the slide's hour, the kite gone home after dark and bats instead of birds.

## Runtime

One `Deck.clock` per scene element; every actor is a pure function of `t`, so a train mid-crossing is still
mid-crossing after navigation. Static planes are drawn once; per frame only ~50 small SVG attributes and two small
canvases (steam, river glints) change. Print and reduced motion get one composed still at `PRINT_T` (7.8 s).
