# Companions: script, FAQ, appendix, notes, hub doc

Produce all of these with the chosen deck unless the user says otherwise. Plain text files, no markdown tables.

## Script (`pitch/script.txt`)

- In the user's voice: plain spoken sentences, first person plural ("we"), no analogies, no captions.
  About 130–140 words per minute of slot (≈ 400 words for 3 minutes). Never caption-length fragments
  ("235 words… very weird, very short captions"); never a wall to memorise.
- Open: "Hi, we're [team], and this is [product]." Then the problem in full sentences, then "[Product] is a
  [category word] for [who]." Then straight to the demo.
- Sections labelled by slide, each with a cue: `(slide 1, done by 0:30)`. During the demo, narrate what is on
  screen element by element with `(point at "28 sources · 17 read · 1 bought")` cues.
- Feature mentions are keywords ("with escrow, pay on delivery and verifiable receipts"), not explanations.
- End with: `IF YOU'RE RUNNING LONG` (what to skip) and `KEYS` (1–N slides, appendix key, 0 intro).
- Do not repeat the slide text; the script adds what the slide shows without saying.
- If the user rewrites a passage, diff it against yours and copy its register for the rest.

## FAQ (`pitch/faq.txt`)

- The 8–12 questions judges will ask, each with a short sequence (numbered steps of how it works) and a
  one-line answer. Buzzwords are fine if true. Each points to its appendix card number.

## Appendix (last slide, `appendix` class)

- One page of numbered tiles, named by the number or the question: "1,000 purchases re-checked",
  "What if the writer never delivers?", "Is this real money?", "Architecture", "Links".
- Each card: one self-drawing diagram, at most three short lines, the source. More diagrams, less text.
- Keys 1–9, 0, −, = open cards; Esc closes. Never in the spoken path.

## Speaker notes (`<aside class="notes">` per slide)

- `<b>Say</b>` the exact lines for that slide, `<b>Do</b>` the live-demo action when there is one
  ("On the live phone: tap 'Reorder toothpaste', hold on the trace 2 s, then Ship it → Undo").
- Notes may hold the technical detail and caveats the slide dropped.

## Hub doc (`pitch/BRIEF.md`)

One file every lane reads: optimisation target, slot, ethos, golden demo run with its real values, claims
inventory with sources, spine (headline per slide + visual), spoken path, asset list, links (live deck,
local file, PDF, app), and a numbered feedback tracker (F1, F2 …) with status. Copy on slides comes from here;
lanes may not add claims or numbers that are not in it.

## Publish

- Default: GitHub Pages under `/slides/` (or the repo's existing Pages site). Give the cache-busted URL
  (`…/slides/?v=N`) and the local `index.html` path. If the repo is private or Pages is off, give the local file
  and the PDF and ask once where to host.
- Check the QR target loads without signing in before handover.
- README: put the one-line hook and the live link at the top when the user asks for README work.
