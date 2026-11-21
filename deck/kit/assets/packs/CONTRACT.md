# Pack contract

Packs are pick-and-go parts for decks: a lane picks one, installs it with `scripts/use-pack.mjs`, then makes it
the product's own (its mark, its colours, its objects). Every item must work in the engine unchanged, look
finished on its own, and show that someone cared about the tiny things.

## Kinds

| Folder | Is | Installed as |
|---|---|---|
| `reveals/<name>` | the intro: empty field, first press plays the brand reveal, next press leaves | `use-pack reveals/x <deck> --as 0 --force --word Name` |
| `scenes/<name>` | an ambient world behind the content: layered, parallax, tiny actors on one clock, a time-of-day knob | `use-pack scenes/x <deck> --into N` (once per slide, with that slide's `data-tod`) |
| `stories/<name>` | a per-slide arrival story (the bot hits the paywall): ≤ 1.5 s, then rests | `use-pack stories/x <deck> --as N`, then rewrite its copy |
| `carry/<name>` | a device that carries across slides (a point swarm that reforms, a camera along one panorama, one object travelling) | lib + a demo slide pair; read its README |

## Files in an item folder

- `item.json` (required): `{ "title", "kind", "mood": [..], "suits": "one line: which products, which pitches",
  "tech": "svg+css | canvas | svg+js", "duration": seconds (reveals, stories), "params": { "--var": "meaning" },
  "details": ["every tiny considered detail, one per line"], "tods": [0.1, 0.5, 0.9] (scenes: gallery shows each) }`
- `README.md` (required): what it shows, when to use it and when not, how to adapt it to a product (mark, colours,
  objects), the params, and its tiny details.
- `slide.html` (reveals, stories, carry demos): one complete slide in the engine format (see
  `assets/engine/src/slides/00-intro.html`): one `<section class="slide" id="s__N__">`, a `<style>` with every
  selector scoped to `#s__N__`, a `<script>` that registers hooks with `Deck.on('s__N__', …)`. `__WORD__` is the
  product name. A mark is an inline `<svg class="mark">` with a comment saying how to swap in the real one.
- `part.html` (scenes): one fragment that becomes the first child of a slide: `<div class="sc-<name>"
  data-tod="0.5" aria-hidden="true">…</div>`. It fills the slide edge to edge (absolute, inset 0, z-index -1 or
  lower, `pointer-events:none`) and sets the field colour itself, so the slide needs nothing else.
- `lib/<name>.js`, `lib/<name>.css` (optional): installed into the deck's `src/lib/`. Name files after the item.
- `assets/<name>/…` (optional): installed as `src/assets/<name>/`. Refer to them as `../assets/<name>/file`
  from lib CSS and slides. Prefer drawing in code (inline SVG, canvas) over files; nothing over 200 KB.

Prefix every class and global with the item: `.rv-<name>`, `.sc-<name>`, `.st-<name>`, `.cy-<name>`,
`window.Pack["<name>"]`. The engine owns bare names (`.card`, `.phone`, `.drift`, `.mk`, …).

## Brand params and visibility (every reveal and story must survive any brand)

- Name: `__WORD__` (1 to 12+ characters, spaces and "&"; long names must shrink to fit, never overflow or wrap
  badly). Mark: `__MARK__`, stroke paths with `pathLength="1"` in a 24 × 24 viewBox (`<svg class="mark"
  viewBox="0 0 24 24">__MARK__</svg>`); draw, fill (thick stroke), sample or stamp it as the reveal needs.
- Colours come from CSS vars on the section, with defaults in your scoped style: `--field` (the field, may be a
  gradient), `--brand`, `--brand-2`. Write brand defaults as `--brand: var(--deck-brand, <your default>)` and
  `--brand-2: var(--deck-brand-2, <default>)` so a deck sets its brand once in `theme.css` (`:root{--deck-brand:…}`);
  a value declared on the section would otherwise always beat the theme. Derive tints from them (`color-mix(in oklab, var(--brand) 40%, …)`) rather
  than hard-coding a palette.
- Never pick ink by hand. The engine sets `--ink-auto` (readable on `--field`) and `--on-brand` (readable on
  `--brand`) on every slide; anything drawn on another colour uses `Deck.inkOn(colour)`. Dark ink on a dark field
  is the bug this rule exists for.
- Prove it: `pack-gallery.mjs --fuzz 6` renders each reveal and story six more times with random names, marks and
  palettes from `_fuzz/fuzz.json` (light, dark, saturated, gradient, cream, near-black). Every variant must read
  at a glance and still look designed.

## Runtime rules (the engine's contract, `assets/engine/src/deck.js` header)

- Slide changes are instant. Arrival motion only on a forward arrival (`ctx.play` in `enter`, or `.slide.play`
  CSS). Resting state = the final state; print (`?print=1`) and reduced motion show it with no motion.
- Reveals: `steps: 1`; empty on arrival; the first press plays (≤ 2.4 s); `enter` with `ctx.from === 1` (coming
  back) shows it done; `final()` shows it done. Copy the hook block from `00-intro.html`.
- Stories: readable at 0.3 s, finished by 1.5 s, no loops. Ambient secondary life after it rests is fine.
- Ambient life (scenes, idle actors) runs on ONE clock that navigation never resets:
  `Deck.clock(el, (t, el, still) => …, { printT })` (t in seconds since load; called only while el's slide shows;
  print and reduced motion call it once with `printT` and `still = true`), or CSS `@keyframes amb-*` (infinite,
  the engine pins their start to load). Pick `printT` so the still frame looks composed (the train mid-screen).
- Cross-slide devices: `Deck.onChange((el, ctx) => …)` after every change; `Deck.current()`; each slide still
  draws its own final state for print (print shows all slides at once).
- Parallax: children of `.parallax` with `data-depth` (0…1) follow the pointer; scenes can use it.
- No network: no external fonts, images or scripts. Fonts: the deck's (`var(--f)`, Geist by default).
- SVG ids (gradients, masks, filters, clip paths) are page-wide: suffix every id with `-__N__` so two copies of an
  item in one deck (the gallery's fuzz copies, a story used twice) never share them.
- `transform-box: fill-box` on SVG also moves the origin of `transform="… scale()"` attributes; give such groups
  `transform-box: view-box` or animate a wrapper.
- Performance: smooth on a laptop at 1920 × 1080. Canvas at most 1920 × 1080 backing store, one rAF loop (the
  clock), no per-frame DOM thrash. Pause nothing manually: the clock only runs the showing slide.

## Taste (from `references/taste.md`; read it)

- Every item is a mood, not a widget. It should make a viewer feel a place, an hour, a material.
- Tiny considered details are the point: steam that thins as it rises, a skateboarder who ollies once every
  40 seconds, one window that lights late, a neon letter that flickers out of step, a stamp that leaves a faint
  ring. List every one in `item.json` `details`.
- Scenes are backgrounds: the headline and white cards must stay readable on them. Keep the top-left third calm
  (headline zone) and put actors low, far or small. Motion at the edge of attention, never competing.
- Never a white or paper field. Coloured, saturated or painted; every tod value gives a good field.
- No emoji, no clip-art, no generic gradients with no source. Drawn shapes with intent: silhouettes, layered
  hills, pixel art, cut paper, line art, light. Grain and atmosphere (mist, haze, depth fade) sell depth.
- Reveals belong to a kind of product. Say which in `suits`, and never make one that only re-skins tile-draw.

## Check before you return

1. `node scripts/pack-gallery.mjs --only <kind>/<name>,… --out <your work dir> --fuzz 6 --export` builds and renders with no
   problems (page errors, requests, overflow fail it). Read `out/sheet.png` and the `out/motion/NN-a.png`,
   `NN-b.png` frames for every item. Fix what looks cheap.
2. `node scripts/use-pack.mjs <kind>/<name> <scratch deck> --as N` (or `--into N`) works on a deck made with
   `scripts/new-deck.mjs <scratch deck> --bare`, and `scripts/build.mjs` builds it.
