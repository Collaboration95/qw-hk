# Panorama camera (carry)

The deck declares one long panorama, five slide-widths of layered SVG drawn by callbacks, and each slide names its
stop. On a forward change the camera glides from the previous stop to the new one (≤ 1.15 s, smootherstep). Planes
move at their own depth: far ranges barely move, the road moves with the camera, the foreground sweeps past. Long
moves pull back slightly mid-glide, and the sky and sun change with the distance travelled. Slide content cuts. The
bundled scene, `Pack.pan.country()`, is a road through layered country from first light to dusk, with turbines,
telegraph wires, a farmhouse with smoke, a barn whose window lights late, and stars at dusk.

**Use it** for a journey: travel, logistics, mobility, climate, a user's day, a before → after that is a distance.
3 to 6 stops, about one slide-width apart. **Don't use it** for dense data slides (the landscape competes), or for
more than ~7 stops (the glides start to feel like a ride).

## Install

```sh
node scripts/use-pack.mjs carry/pan <deck> --as 1 --word "Name"     # slide.html = demo 1 (first light, x = 0)
S=<skill dir>; D=<deck>
sed -e 's/__N__/2/g' -e 's/__WORD__/Name/g' $S/assets/packs/carry/pan/demo/02-gold.html > $D/src/slides/02-gold.html
sed -e 's/__N__/3/g' -e 's/__WORD__/Name/g' $S/assets/packs/carry/pan/demo/03-dusk.html > $D/src/slides/03-dusk.html
```

Any slide joins the journey with one line, `Pack.pan.stop('sN', { x, zoom })`. The view (`<div class="cy-pan">`) is
created as the slide's first child, fills the slide and paints its own sky, so the slide needs no field.

## Make it the product's

- **Colours**: the whole palette derives from the first stop's `--field`, `--brand` and `--brand-2`, or from
  `Pack.pan.scene(Pack.pan.country({ field, brand, brand2 }))`. The sky keeps the field's lightness side all the
  way: a light field gives a pastel journey, a dark one a night-blue journey. The hue drifts pinker at first light,
  bluer in the morning and violet at dusk. "Warm" is the livelier brand colour, and it lights the horizon, the sun
  and the windows. Terrain is the field's hue darkened, in translucent layers. Each slide's `--ink-auto` is
  re-picked from its own sky at its stop, so headlines use `color: var(--ink-auto)` and stay readable. White cards
  are fine on top.
- **Your own world**: pass a whole scene, for example a city skyline for delivery, a river for supply chains or a
  timeline street:
  ```js
  Pack.pan.scene({ width: 9600, sky: p => `linear-gradient(…)`, skyTop: p => '#123 #234',
    planes: [{ depth: .1, draw: c => '<path …/>' }, { depth: 1, draw: c => …, live: c => …, tick: (node, t, still, cam, p) => … }] })
  ```
  - `draw(c)` returns SVG for x from `-c.m` to `c.w + c.m`, y from 0 to `c.h`. It is rendered once to an image
    shared by every slide.
  - `live` and `tick` are the plane's moving parts on the one clock. `still` means print or reduced motion.
- `scene()` must run before `Deck.start` (any slide script or a lib file). The first call wins. With no call, the
  country scene is used.

## API (window.Pack.pan)

- `stop(id, { x, y = 0, zoom = 1 })`: x = the view's left edge at depth 1, from 0 to width − 1920. y is a crane
  offset. zoom ≥ 1 dollies in, and near planes grow more than far ones.
- `scene({ width, sky(p), skyTop(p), planes, lift = .06, entry = 700, inkFromSky = true })`.
- `country({ width = 9600, seed, turbines: [x…], field, brand, brand2, sky, ink })`.

## Motion rules

The motion follows the carry exception in taste.md §11:
- **Forward step from a slide with a stop**: the camera glides from its live position, so a press mid-glide
  continues from where the camera is.
- **First arrival** (a fresh load, or from a slide without a stop): a small establishing move, from `entry` px to
  the left, a little higher and closer.
- **Back, jumps, print and reduced motion**: the view simply is at its stop.

Each slide holds its own view, so print shows every stop. The plane pictures are shared data-URI SVG images, built
and decoded in idle time after start. Only the showing view is promoted for compositing.

## Tiny details

See `item.json` `details`.
