# Grow

A ground line under an open sky. The first press drops a seed; it lands with a puff of dust, bounces, splits, roots and sends up a stem, and the mark's own strokes grow out of it as vines with pale growing tips and leaves budding along the way. A runner creeps under the soil and each letter of the name sprouts as it passes. ~2.3 s. Reduced motion and print show the final lockup.

**Use it for** climate and agritech, food, gardening, wellbeing, community, education and any product about growth over time (savings, habits, learning).
**Avoid it for** fast, technical or security products, nightlife, and marks that are filled shapes rather than lines (they need strokes to grow).

## Adapt it
- **Brand**: `--field` (the sky; soil, grass, roots and dust are mixed from it), `--brand` (seed, stem, vines), `--brand-2` (leaves, grass). Set them on the `<section>` or once in `theme.css` as `--deck-brand` / `--deck-brand-2`. A brand that matches the field is pushed toward the readable ink.
- **Mark**: `__MARK__` (use-pack `--mark`): stroke paths in a 24 x 24 box. The seed lands under the lowest point; every other stroke is reached through the growing plant, with a tendril where there is a gap.
- **Word**: `var(--ink-auto)`, sprouting letter by letter. Long names shrink to fit 1560 px (`--rv-fs`).
- **Ground**: `--rv-y` moves the ground line (the name's baseline).

## Params
- `--field`: the sky; soil, grass, roots and dust are mixed from it
- `--brand`: seed, stem and vines (pushed toward the ink if it would vanish on the field)
- `--brand-2`: leaves and grass
- `--rv-fs`: name size (shrinks to fit 1560 px)
- `--rv-y`: the ground line, which is the name's baseline
- `__MARK__`: stroke paths in a 24 x 24 box; each stroke grows as a vine, dots pop like buds

## Tiny details
the seed tumbles out of the sky with gravity and lands with a squash · a puff of dust skims the ground from the first landing only · it bounces once, then splits; the husk halves stay at the foot of the plant · a root goes down with two side roots while a short stem goes up · the mark's own strokes grow out of the stem as vines at one speed, both ways from where they start · closed shapes grow both ways round from their lowest point · pale growing tips lead every vine · a stroke that does not touch the rest is reached by a thin tendril that withers once it has grown · dots in the mark pop like buds as the nearest vine passes · leaves bud along the vines on the side away from the mark's centre · the first leaf opens underside-first and turns over · the last leaf keeps a dew drop that catches the light once · a runner creeps under the ground line, putting down rootlets, and each letter sprouts from the soil as it passes · letters spring up with a small wobble, alternating left and right · after the reveal the leaves sway in a slow draught · the soil is kept far enough from the ink that descenders stay readable.
