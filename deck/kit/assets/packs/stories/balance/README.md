# Balance

Cost against value on a beam scale. The heavy iron weight ($2,400) tips the cost side down; it slides off, lands
on the floor with a thud and stays there. A small coin ($24) drops into the pan, spinning, clinks and bounces; the
beam swings over to the value side (a gem on a velvet cushion), overshoots and settles; the pans swing on their
strings and their floor shadows follow their height. A glint crosses the gem at the end. ~1.45 s, then it rests.

**Suits** pricing, unit economics, "the same result for a fraction of the cost", a cheaper or lighter way to the
same outcome. **Not for** claims where value also changes (use two numbers instead), or when the prices are not real.

## Re-skin it

- **Copy**: the `h2` names the trade; the two prices are the only other text (`.st-balance-wt`, `.st-balance-coint`).
  Keep them real and short (`$2,400` → `$24`, `40 h` → `2 h`).
- **Objects**: the weight, the coin and the gem are plain SVG groups. The gem can become what the product delivers (a
  parcel, a report, a trophy, a phone); keep its bottom at y = 182 of the right pan.
- **Colours**: `--field`; the scale, strings and iron are mixed from `--ink-auto` (dark wood on light fields, pale
  ash on dark ones) and the weight's price flips to stay readable; `--brand` is the gem, `--brand-2` the needle and
  cushion. The floor and spotlight are tints, so any field works.
- **Physics**: `T0` / `T1` (start and rest tilt), `LEAVE` (weight leaves), `COIN` (coin lands), `LAND` (weight lands)
  in the script; the springs run once into a 240 Hz table, so every arrival is identical.

## Runtime

`enter` with `ctx.play` runs one 1.5 s rAF; anything else (←, print, reduced motion, `final`) calls `pose(END)`.
The markup itself is the final pose. No CSS keyframes except the glint.

## Tiny details

See `item.json`: the weight that stays on the floor, the thud and dust, the kicking pan, the damped beam, pendulum
pans, the spinning coin and its clink ring, the dip when the coin lands, shadows that follow height, the dial needle,
the giving cushion, the late glint.
