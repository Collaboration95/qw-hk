# Two accounts

Two records of the same thing disagree on one line. An invoice slides in from the left and a bank record from the
right, turned a little, shadows catching up. Lines draw between the matching fields with a dot landing at each end;
the amount line draws dashed in the alert colour, both amounts light up and pulse, and the two swapped digits are
underlined. A question chip with the product's mark drops onto the mismatch, squashes and swings to rest.
~1.4 s on a forward arrival, then it rests.

**Suits** reconciliation, audit, matching, anomaly detection, "we catch the one line that does not match".
**Not for** more than one mismatch, or documents the audience cannot read at a glance (keep four short rows).

## Re-skin it

- **Copy**: the `h2` is the claim; the titles name the two sources; labels and values are short. The differing
  characters go in `<u>`.
- **Brand**: `--brand` fills the chip (ink is `--on-brand`, the mark is `__MARK__`); `--brand-2` draws the match
  lines and the invoice glyph; `--st-two-accounts-alert` is the mismatch colour.
- **Geometry**: the line endpoints were computed for the two documents' boxes and tilts (left 130,350 / −2°,
  right 1150,372 / +1.6°, rows at 238, 334, 430, 526 px). If you move a document, move its lines (or regenerate).

## Timing

0–0.62 s documents in · 0.42–0.98 s lines draw, dots pop · 0.78 s amounts pulse · 0.92 s chip drops, lands 1.17 s ·
1.02 s digits underline · rest 1.45 s. Resting CSS is the final state.

## Tiny details

See `item.json`: opposite slide-ins with overshoot, late shadows, the paperclip and the unfolding dog-ear, lines in
order with landing dots, the dashed alert line, the double pulse, the underlined swapped digits, the chip with the
mark that squashes and swings, its growing shadow.
