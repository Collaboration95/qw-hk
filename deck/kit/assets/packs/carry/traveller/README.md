# Traveller (carry)

One object carries the story across the deck: a paper plane by default, or a parcel or a ball. It rests at a spot
on each slide. On a forward change it travels from the previous slide's spot to the new one while the content cuts.
- First comes a tiny anticipation: it pulls back and noses up.
- Then an arc, banking along the path. It turns round with a quick flip when the next spot is behind it.
- It overshoots and settles, leaving a dotted trail that fades by 1.2 s.

Its shadow follows on the ground below, smaller and fainter the higher it flies. At rest it hovers. Print shows it
at every slide's spot.

**Use it** when the product moves something: a message, a parcel, a document, a request, a handoff. Let it land
on the thing that matters on each slide (the card, the person, the result). **Don't use it** as decoration on a deck
whose story isn't a journey, and don't park it over the headline.

## Install

```sh
node scripts/use-pack.mjs carry/traveller <deck> --as 1 --word "Name"    # slide.html = demo 1 (thrown in, rests high right)
S=<skill dir>; D=<deck>
sed -e 's/__N__/2/g' $S/assets/packs/carry/traveller/demo/02-find.html > $D/src/slides/02-find.html
sed -e 's/__N__/3/g' $S/assets/packs/carry/traveller/demo/03-land.html > $D/src/slides/03-land.html
```

Any slide joins with one line, `Pack.traveller.spot('sN', { x, y, ground })`. The overlay (`<div class="cy-tr">`,
z-index 30, never catching clicks) is created on the slide.

## Make it the product's

- **Colours**: per slide from `--brand` (the paper, the box or the ball), `--brand-2` (accent: tape, stripes) and
  `--field` (fold shading and shadow). The paper is pushed toward `--ink-auto` when it would vanish on the field.
  The colours are set as `--cy-tr-paper`, `-hi`, `-far`, `-fold`, `-fold-2`, `-crease`, `-accent`, `-trail` and
  `-shadow` on the overlay, so your own object can use them (`style="fill:var(--cy-tr-paper)"`).
  `object({ color })` pins the paper colour.
- **Your own object**: `Pack.traveller.object({ svg: '<g>…</g>', kind: 'fly' | 'hop' | 'roll', sh: [rx, ry] })`.
  Draw it around (0, 0), facing +x, about 170 px wide. `{id}` in the markup becomes the slide id, for unique
  gradient ids.
  - Presets: `'plane'` (fly), `'parcel'` (hop: leans into each hop, squashes on landing, kicks up dust), `'ball'`
    (roll: rotates by the distance rolled, overshoots and rolls back).
- **Spots**: `{ x, y }` is the object's centre in stage px.
  - `ground` is the surface the shadow falls on. Give it a card's top edge and the shadow lands on the card.
  - `rot` is the resting angle, `scale` the size.
  - `face: 1 | -1` sets the resting direction. The default is the way it arrived, which print uses too.
  - `lift` is the arc height. Descending flights arc less by default.
  - `loop: true` adds one loop-the-loop on the way there. Save it for the happy slide.

## Motion rules

The motion follows the carry exception in taste.md §11:
- **Forward step from a slide with a spot**: it travels from its live pose, so mid-flight presses continue smoothly.
  The flight is done by 1.15 s.
- **First arrival** (a fresh load, or from a slide without a spot): it is thrown in from off the lower left.
- **Back, jumps, print and reduced motion**: it rests at its spot.

The idle hover runs on `Deck.clock` and eases in after landing, so it never jumps.

## Tiny details

See `item.json` `details`.
