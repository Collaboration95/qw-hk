# Strike list

Before → after as an act. A faded card lists what people juggle today; a marker pen strikes each item through
with a hand-drawn line, one by one, each row dimming a beat later. A dashed slot waits on the right; one bright
card drops into it with a squash, its shadow catching up, the board inside comes alive and a check stamps its
corner. ~1.4 s on a forward arrival, then it rests.

**Suits** consolidation and replacement claims: "four tools become one", "no more forms", a workflow that
collapses into one step. **Not for** a slide where the before items are still kept (a struck item the claim keeps is
a bug), or more than five items.

## Re-skin it

- **Copy**: the `h2` is the claim; the rows are bare keywords (no sentences). The after card's title is two to four
  words.
- **Rows**: each `.st-strike-list-row` holds a 64 × 64 line glyph (`.st-strike-list-glyph`, stroke only), a word and
  its strike. Set `--i` 0…n-1 in order; strikes run 0.2 s apart, so 5 rows end at ~1.1 s (move the card's delay
  `.82s` later by 0.2 s for a fifth row). Each strike path can wobble its own way.
- **After card**: replace the board drawing (`.st-strike-list-board`) with a small drawing of the product (a phone
  screen in `.phone`, a receipt, a single form). Keep the check and the faces only if they are true of it.
- **Colours**: `--field` is the desk; everything on it (words, glyphs, strikes, the ghost card, the arrow, the slot)
  is drawn in `--ink-auto`; `--brand` is the pen, the mark tile and the check (`--on-brand` ink); `--brand-2` the pen
  band and chips. The bright card's header is `__MARK__` + `__WORD__`.

## Timing

Strikes at 0.12, 0.32, 0.52, 0.72 s (0.17 s each) · rows dim 0.18 s later · arrow 0.88 s · card drops 0.82 s, lands
1.05 s, settles 1.25 s · chips 1.08 s · check 1.2 s · rest 1.4 s. Resting CSS is the final state.

## Tiny details

See `item.json`: the riding pen and its ink dots, wavy overshooting strikes, the late dimming, the sagging card,
the waiting slot, the squash and catching shadow, the chip that moves columns, the faces, the stamp ring, the
coffee ring.
