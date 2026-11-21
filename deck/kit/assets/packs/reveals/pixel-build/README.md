# Pixel build

A dithered arcade dusk. The first press stacks the mark out of chunky blocks row by row on a 15 fps sprite clock, the wordmark fizzles in pixel by pixel in a bitmap face, and a tiny critter hops across the word and onto the last block, which squashes under it. ~2.3 s. Reduced motion and print show the final lockup.

**Use it for** games, creator and dev tools with a playful streak, kids and education, indie consumer apps, hackathon projects that want to feel handmade and fun.
**Avoid it for** serious B2B, finance, health, legal or anything where playful reads as unserious. Marks with fine detail lose it at 12 x 12; check the stacked result.

## Adapt it
- **Brand**: `--field` (the sky; it is dithered into bands and the ranges come from its stops), `--brand` (the blocks), `--brand-2` (the critter and an accent stroke). Set them on the `<section>` or once in `theme.css` as `--deck-brand` / `--deck-brand-2`.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 x 24 box, rasterised to a 12 x 12 block grid at load. A small last stroke becomes accent blocks. Simple, bold marks rasterise best.
- **Word**: set in the built-in bitmap face; the wordmark uses the engine's `--ink-auto`. Long names shrink the face to fit.
- **Critter**: drawn as a sprite in the script; recolour it with `--brand-2` or swap its pixel map for the product's mascot.

## Params
- `--field`: the sky gradient; it is dithered into bands and the pixel ranges are built from its stops
- `--brand`: the blocks of the mark (with light and dark bevel tints)
- `--brand-2`: the critter, and the blocks of the mark's last stroke when it is a small accent
- `__MARK__`: stroke paths in a 24 x 24 box, rasterised to a 12 x 12 block grid; an empty mark falls back to a block tile with the first letter
- `__WORD__`: set in a hand-drawn bitmap face that shrinks to fit

## Tiny details
the whole reveal runs on a 15 fps sprite clock, so motion steps like a real 8-bit game · blocks drop row by row from the bottom of the mark up, like a stacking game · each block lands with a two-frame squash · the bottom row kicks up pixel dust · the wordmark fizzles in pixel by pixel in a hand-drawn bitmap face, not a font · the word's drop shadow arrives one frame late · a tiny critter fizzles in on the last letter, hops across the word and lands on the mark's last block · the block squashes under the critter's weight · the critter blinks once it has settled · the sky is dithered into bands, with pixel ranges on the horizon built from the field's own stops · a dark sky gets pixel stars, a lit one three flat pixel clouds · the mark is rasterised at load, so any line mark becomes chunky pixel art with close strokes kept apart · a small last stroke (a dot, a slash) is picked out in the accent colour.
