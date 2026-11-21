# Look: building the visual system and the variants

## Absorb the product; never re-skin a reference

The look is not chosen from a menu. It is found in the product. A deck that could belong to another product has
failed, however polished it is ("these all seem slight remasking of the research agent slides").

1. **Inventory the product's world.** Logo and mark, wordmark font, brand colours, characters or mascot,
   illustrations, launch video frames, concept renders, the app's best screens, motion already in the product
   (a site's dot swarm, a loading animation). Look in the repo (`design/`, `brand/`, `public/`, `assets/`,
   `site/`, `video/`), the running app, and any existing deck, video or post. Capture screens at real device size,
   headlessly, into `pitch/shared/`.
2. **Write the world bible** in `pitch/BRIEF.md` before any lane starts. Answer from the product's domain, not
   from design trends:
   - *Place*: where does this product's problem physically happen? (Plotline: rubber and oil-palm plots under
     limestone karst in Surat Thani; a satellite overhead; a customs desk in Europe.)
   - *Hour and weather* that fit the story's feeling (pre-dawn tapping, monsoon afternoon, a Saturday evening).
   - *Objects and materials* (latex cups, stamped forms, satellite swaths, a ledger, a departure board).
   - *Actors* that could live in the background (a tapper's headlamp, a long-tail boat, a freight train, a
     skateboarder, a satellite crossing).
   - *The data's own shape* (cells, points, layers, logs, receipts): it can be the visual itself.
   - *Verbs*: what moves, and how (cells collapse, stamps press, trains carry, swarms reform).
3. **Derive 3–4 directions from the bible**, each a different answer to "what world is this pitch set in?". Fill
   the diversity matrix below; no two lanes may share a cell in more than two columns.

### Diversity matrix (fill in BRIEF.md, one row per lane)

| Lane | World (where) | Colour journey | Reveal | Carry device | Type | Component grammar | Layout grammar |
|---|---|---|---|---|---|---|---|
| e.g. v5 | the region's own cells | teal → indigo as the survey deepens | the cells swarm into the wordmark | point swarm reforms each slide | Geist + mono numerals | luminous cards, data chips | the visual is the full slide; headline over it |
| e.g. v7 | a customs desk | kraft and forest-green board | a rubber stamp presses the mark | one manila tag travels | a stencil display face | paper tags, stamps, pins and string | objects laid on a desk, headline set like a form |

- **Reveal**: born from the product or its world (the data assembles into the name, a stamp, a scan swath, a
  train arriving with the letters). The pack's `tile-draw` (tftf) is never the default.
- **Carry device**: what continues across slides (a swarm that reforms, a camera along one panorama, a sky that
  deepens, one object that travels). The user loved the hr-2026 v4 point field that rearranges every slide.
- **Type**: one display face may join Geist when the world asks for it (OFL fonts from npm `@fontsource/<name>`,
  woff2 copied into `src/assets/fonts/`, `@font-face` in `theme.css`; never a network link).
- **Component grammar**: what a "card" is in this world (a white card with depth, a paper tag, a HUD reticle, a
  signboard, a departure-board row). Cards always have depth and read from 8 m.
- **Layout grammar**: where things sit. Headline top-left over a right-hand card stack is tftf's grammar; use it
  only if the world calls for it.

### Families (starting points; instantiate each from the bible, never generically)

| Family | The idea | Product-born example |
|---|---|---|
| **Data-born** | the product's real data is the visual and the motion | hr-2026 v4: the region's cells as a point field that rearranges into each slide's figure (the user's pick) |
| **Place journey** | one real place from the product's domain; each slide is a stop or an hour | tftf: an evening deepening; Plotline: plot → road → railway → port at the hours a rubber day runs |
| **Product world** | the product's own art: characters, game map, video frames | Prompt Fu, Common Grounds (zero revisions) |
| **Tactile** | a material from the domain: paper, stamps, cut-paper diorama, chalk, felt | EUDR as a customs desk: forms, stamps, pins and string |
| **Scale journey** | one continuous zoom (powers of ten) from far to near and back | orbit → region → plot → one cell → back out to every tile |
| **Signal** | saturated brand colour per section, colour coded by meaning | Click: one gradient per intent, phones that rise and wiggle |
| **Night city** | neon, rain, reflections, flying traffic (only when the app is not dark) | a consumer or gaming product at night |
| **Instrument** | the mechanism as a live, luminous diagram | tokens flowing through the real pipeline |

Default set: one Data-born or Product world lane, one Place journey, one Tactile or Scale journey, one wild card.

## Packs: pick one off the shelf, then make it the product's

`assets/packs/` holds ready parts (`CONTRACT.md` explains them; open `assets/packs/gallery/index.html` to browse):

- `reveals/`: intro reveals (stamp, swarm-word, split-flap, neon, terminal, constellation, pixel-build, grow, scan,
  fold, fill, train, headlamp, tile-draw), each saying which products it suits.
- `scenes/`: ambient worlds with tiny actors on one clock and a time-of-day knob (`data-tod`): a mellow Saturday
  evening city with distant skateboarders and a steam train along the bottom, a cyberpunk night, a harbour, an
  alpine slope, fireflies in a forest, orbit, a pixel town, rain on a window, a desert road …
- `stories/`: per-slide arrival stories (an actor hits a wall, a stack squeezes into a block, two accounts
  disagree, a scale tips …).
- `carry/`: devices that continue across slides (point-field swarm, pan along a panorama, traveller object,
  powers-of-ten zoom).

Install with `node scripts/use-pack.mjs <kind>/<name> <deck> --as N` (slides) or `--into N` (scene layers). A pack
item is a starting point: change its objects, colours and timing until it belongs to the product. When a lane
invents something reusable, save a copy into `assets/packs/` in the same format (the shelf grows with each deck).

## Tiny considered details (the user's bar)

"I want the end user to realize that even the teeny tiny things (like the bots hitting the paywall animation)
was thought of and considered." Every deck keeps a detail ledger (`DETAILS.md` in its folder): at least 15
details, each tied to the product. Examples of the grain wanted: steam that thins as it rises; a skateboarder who
ollies once every 40 seconds; one window that lights late; a neon letter that flickers out of step; a stamp that
leaves a faint ring; the two lost cells flicker like embers once; a satellite crosses the sky on the same clock on
every slide; the amber question chip lands with a small bounce and its shadow catches up. Details live at the
edge of attention: small, low, far or slow. They never compete with the headline.

## The fixed parts (every lane)

- Engine: `assets/engine` (1920 × 1080 stage, nav outside the stage, 0–9 jumps, notes, print, marker,
  primitives, `Deck.clock`, `Deck.onChange`).
- Nothing under 22 px; headline 84–122 px, 800 weight (or the display face's heaviest), one claim per slide.
- Phone screens in `.phone`, web screens in `.browser` (restyle the frame colour to the world if needed).
- Slide 0 is an empty field; the first press plays the reveal.
- One marker device (`.mk` loop, or the world's own equivalent: a stamp ring, a pin), 1–3 uses in the deck.
- A close with a big QR to the live product when the audience can try it.

## Effects menu (pick per variant; every effect must show the idea, not decorate)

| Effect | Use for | Engine |
|---|---|---|
| Brand reveal | intro, born from the product | `reveals/` pack, or invent one |
| Marker loop | the felt word, 1–3 per deck | `.mk` |
| Runner hits a wall | a blocked actor (paywall, friction) | `.run` + `.bump` + `.stamp` |
| Strike-through | before → after | `.strike` with `--t` steps |
| Phone rise + wiggle | app screens arriving | `.phone.wiggle` with `--r` |
| Wall of screens | "a new screen every time": many renders tilted behind a veil | static images, slow `.drift` |
| Count-up | the hero number | `.count[data-to]` |
| Self-drawing line | pipelines, flows, money and key crossing | `path.draw` + `Deck.seq` |
| State sequence | Locked → Paid → Unlocked → Checked | `Deck.seq` 0.4 s apart, settle in `rest()` |
| Ambient drift | clouds, streaks, a town, particles | `.drift > i` with `--img`, `--t`, `--d` |
| Pointer parallax | layered scenes on the title and close | `.parallax > [data-depth]` |
| Point swarm | data made of points that reform every slide (hr-2026 v4, the user's pick) | `carry/` pack or a canvas in `src/lib/`; static final state for print |
| Ambient actors | trains, skateboarders, boats, satellites, rain: life at the edge of attention | `scenes/` pack, `Deck.clock` |

Canvas or swarm visuals: print stacks every slide at once, so give each slide its own canvas and draw its final
frame in the `final()` / `rest()` hooks; animate only when `ctx.play`. Shared canvas code lives in `src/lib/`.
Painted scenes: adapt `assets/recipes/painted-scenes.mjs` rather than starting from nothing. Hatching means
"unknown" in many data products: check the product's legend before using a pattern decoratively.

Rules: arrival motion ≤ 1.5 s, no loops except ambient; readable on frame one; no in-slide clicks; resting CSS is
the final state (print and reduced motion show it); slide content changes instantly. A carry device (a swarm
reforming, a camera gliding along a panorama) may move for ≤ 1.2 s on a forward change while the content cuts.

## Data as the visual

When the product has real data (rasters, JSON, logs), draw the slide visual from it rather than mock it: the real
cells, the real loss years, the real answer. Put the render script in the deck folder at `tools/` (never only in
a scratch folder) and its outputs in `src/assets/`, so the visual can be regenerated when the data changes.
Downsample to what reads at 1920 × 1080; keep the inlined deck under ~5 MB.

## Ink on light fields

Saturated light hues (lime, amber, mint, yellow, apricot) take dark ink; deep hues take white. Set it per slide
with `color:` on the section (and `--marker` if the loop would vanish). Never black on saturated orange or red;
on those, white at 800 weight and ≥ 84 px is fine even where strict 4.5:1 fails (Click's red slides).

## Colour checks

- Filmstrip the whole deck (`export.mjs --compare` or `out/sheet.png`): no jumps, no white fields.
- Body text on a field ≥ 4.5:1; large headlines follow "Ink on light fields". Never black on saturated orange.
- The demo app's background colour does not appear as a slide field.
