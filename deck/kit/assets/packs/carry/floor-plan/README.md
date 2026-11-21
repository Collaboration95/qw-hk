# Floor plan (carry)

One endless architectural floor plan, walked by a "you are here" dot. Every slide looks at the same seeded world
through its own window. On a forward step the window glides from the previous slide's view to this one (≤ 1.1 s)
while the content cuts, and the dot walks there along a Manhattan route. The doors on its route swing open as
the dot reaches them. Past `backX` the generator turns into endless, randomly segmented rooms: smaller, half-built,
with pillars and dashed ceiling lights. Built for the liminal-spaces talk (v3), where the plan turned amber at
the Backrooms and the dot noclipped through a wall.

**Use it** when the story is a walk: places, buildings, navigation, levels, "one room further". **Don't use it**
for products with no spatial idea; it will read as decoration.

## Install

```sh
node scripts/use-pack.mjs carry/floor-plan <deck> --as 1
```

Copy `slide.html` once per slide (change `s__N__` and the `you` spot). The lib files go to `src/lib/` (load order:
`floor-plan.js` must come before the slide scripts, which it does in lib/).

## Make it yours

- **Views**: `Plan.config({ views: [[0,0],[1500,140],…] })` before the first `Plan.slide`. Neighbouring views about
  1500 px apart overlap a little, so you see the room you came from.
- **Colours**: set `--ln` (lines) and `--accent` (dot, footsteps) on each section. The canvas reads them, so a
  colour journey across slides just works.
- **Content**: mark DOM content `data-keep` (26 px padding) or `data-keep="0"` (flush, for rooms drawn as DOM
  with their own walls) and the walls stop at it. Use `quiet: [[x,y,w,h]]` for open halls.
- **Reveal**: `Plan.wall()` a hall with a door `{ id }`, then drive `Plan.reveal(id, t)` from your intro's
  rAF: the walls grow outward from the dot like a compass sweep and the door swings open.
- **Emphasis**: `<span class="rev" data-rev="1">word</span>` with `floor-plan-rev.js` draws a revision cloud
  and its delta.

## Params and details

See `item.json`.
