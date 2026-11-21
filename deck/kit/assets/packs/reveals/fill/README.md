# Fill

The wordmark and the mark are glassware. The first press draws their outlines glyph by glyph, then liquid rises inside them from below: the surface tilts, two ripples cross it, bubbles climb and pop with a tiny ring, and it settles on one level line across mark and word with a meniscus highlight, then breathes. ~2.3 s. Reduced motion and print show the final lockup.

**Use it for** drinks and food, energy, health and hydration, fintech (balances, savings goals, top-ups), progress and quota products.
**Avoid it for** products where a half-full look reads as incomplete (security, compliance), and very thin or condensed type, where the glass gets too narrow to read the liquid.

## Adapt it
- **Brand**: `--field`, `--brand` (the liquid), `--brand-2` (its depth tint). Set them on the `<section>` or once in `theme.css` as `--deck-brand` / `--deck-brand-2`.
- **Mark**: `__MARK__` (use-pack `--mark`): stroke paths in a 24 x 24 box; each stroke becomes a tube that fills with the word.
- **Word**: outlines in the engine's `--ink-auto`. Long names shrink to fit (`--rv-fs`); `--rv-base` moves the baseline.
- **Level**: `finalLevel()` in the script sets the rest level (above the x-height, below the caps); raise it to fill tall letters too.

## Params
- `--field`: the field behind the glass
- `--brand`: the liquid
- `--brand-2`: the liquid's depth tint
- `--rv-fs`: wordmark size (shrinks for long names)
- `--rv-base`: the baseline
- `__MARK__`: stroke paths in a 24 x 24 box; each stroke becomes a tube that fills with the rest

## Tiny details
the outlines draw first, glyph by glyph, like glass being blown · the drawn outline hands over to a seamless glass ring, so overlapping contours never show seams · liquid rises inside mark and word together from below · the surface tilts back and forth as it rises and two ripples cross it, decaying · a few bubbles climb the strokes, wobble and pop at the surface with a tiny ring · it settles on one level line across mark and word: lowercase full, tall letters keep their empty tops · a meniscus highlight runs along the surface · the liquid is lighter at the top and deeper below, toward the depth tint · a soft glow of the liquid colour sits behind the lockup · after it settles the level breathes gently · film grain on the field.
