# Crossing

An exchange where neither side goes first. A buyer and a seller stand at their stalls; both wind up and throw at
once. The coin arcs one way and the key the other, on mirrored curves that meet exactly mid-air, where a flash
leaves the product's mark as a small seal. Each lands in the other's hand (the hand dips with the weight), the
dotted trails stay, and both look at what they caught. ~1.45 s on a forward arrival, then it rests.

**Suits** exchanges, marketplaces, escrow, atomic settlement, pay-per-access, "payment and delivery at the same
moment". **Not for** one-way flows (use a pipeline) or more than two parties.

## Re-skin it

- **Copy**: the `h2` is the claim; the two captions name the roles (Agent / Writer, Rider / Driver).
- **The things**: the coin (`.st-crossing-coin`) and the key (`.st-crossing-key`) can be any two objects (a file and
  a badge, data and credit); keep each under 100 px and centred on its group origin.
- **Brand**: `--brand` is the seller's shirt, the key and the seal behind `__MARK__` (`--on-brand` ink); `--brand-2`
  is the buyer's shirt. Skin and hair tones are fixed per person; change them in the two head groups.
- **Motion**: `B`, `S` (hands), `C1`, `C2` (the coin's arc; the key's is mirrored), `T0`, `T1` in the script.

## Runtime

`enter` with `ctx.play` runs one 1.5 s rAF; ←, print, reduced motion and `final` call `pose(END)`. The markup is the
final pose.

## Tiny details

See `item.json`: the wind-up, the mirrored arcs that meet exactly, the flash and the seal that stays, the flipping
coin and tumbling key, trails that stay, travelling floor shadows, the dipping hands, eyes that follow, heads that
tilt to look, planked stalls.
