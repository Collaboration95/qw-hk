# Conveyor

Everything is checked; only the odd one is held. Five parcels roll in on a belt and pass under a scanner arch. The
beam flares as each one crosses and a teal check pops over each parcel that passes. The odd one (a crate) turns the
beam amber, a scan line sweeps down it, and an amber `Hold` tag pops up on a string; the lamp on the arch blinks
twice and stays amber. The belt eases to a stop and the parcels tip forward with the inertia. After rest the belt
keeps a slow ambient crawl. ~1.45 s, CSS only.

**Suits** screening and review claims: fraud and risk checks, QA, content moderation, compliance, "we read every
invoice and only flag the odd one". **Not for** a slide that needs the reviewer's view (show the product instead).

## Re-skin it

- **Copy**: rewrite the `h2`; the tag `.st-conveyor-chipt` is one word.
- **Parcels**: each `.st-conveyor-item` is drawn with its bottom at y = 0 (a front face, a top face, a side face,
  tape, a label). Swap them for the product's items (invoices, messages, claims, photos); keep the held one third.
- **Timing**: the keyframes were generated from one belt profile (`s(t) = 760·(1−(1−t/1.2)^1.7)`); the beam
  windows and pop delays come from where each parcel's edges cross x = 1000. If you move parcels, keep the five
  rest x positions or recompute those windows.
- **Colours**: the machine lives in its own hall card (tinted by `--brand`), so it reads on any `--field`; the beam
  and checks are tints of `--brand`, the held crate is `--brand-2`, the flag stays amber. `__MARK__` sits on the
  scanner housing; the headline uses `--ink-auto`.

## Timing

0–1.2 s the belt runs and eases to a stop · beam flares at 0.07–0.24 s and 0.32–0.49 s · amber 0.57–0.91 s · checks
pop at 0.26 s and 0.51 s · tag pops at 0.93 s · lamp blinks from 0.57 s · inertia tip 1.2–1.45 s. Ambient after rest:
treads crawl and spokes turn (`amb-` keyframes on the engine clock).

## Tiny details

See `item.json`: the shared belt profile, travelling treads and spokes, out-of-step jiggle, the inertia tip, beam
flares timed to each parcel, checks on exit, the amber scan line, the tag on a string left swinging, the blinking
lamp, the fragile glyph and stamp, the hall racks.
