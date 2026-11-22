# v3 fix round 3 (final polish before publish). Critic: clarity 8, copy 7, hierarchy 7, craft 7, mocks 8, phone 7, trust 6, ship 6

Orchestrator decisions marked **[decision]** win. Keep changes surgical; do not redesign.

1. **MUST: "Words change" reads as broken English** (home stat, grid legends, How chips, All-figures legend).
   - Stat: "18 / 60" with label "now make the sentence wrong".
   - Legend everywhere: "Sentence now wrong · Number changed · Never revised".
   - How chips: "Sentence wrong" / "Number only". All-figures legend: "Red: sentence now wrong".
2. **[decision] Hero subhead stays general** (owner wants the general claim). No change.
3. **Grid (home + Figures) reads as a wall of pills.** No cell borders. "Number changed" = ink text, no fill;
   "Sentence now wrong" = accent text on a ~6% accent tint, no border; "Never revised" = muted grey text. Give the
   Manufacturing Q3 2025 cell (the one the caption names) a 1.5px ink outline. At 390 start the horizontal scroll so
   that cell is visible.
4. **Mock chrome.** **[decision]** Keep "runs on QwenWork" and the one "Example" tag in the run window (owner asked).
   Window traffic-light dots only on the hero app window; other mocks get a plain header bar.
5. **Repeated closing band.** Page-specific closer line on How, Indicator, Figures, All figures and About (the Figure
   page's "Quoted this figure?" is the model). Home keeps "Send one deck. We watch every source in it." Send page:
   delete "We reply within two working days." under the button (said 3×; keep it once), and give the header
   "Send a deck" button an active/current state on that page.
6. **Spacing.** Halve the dead gap below "All 60 figures →" / the indicator cards before the closing divider. Closing
   band: button left-aligned under the "Pilot:" line, 24px below it (no stranded far-right button).
7. **Sample deck rows.** **[decision]** Do not rename slides (they mirror the real sample deck). Slides without
   figures: muted "Title" / "Text only" instead of repeating "No figures".
8. **Indicator + phone details.** Indicator page: one line "All charts on one scale, 0–18.8%" under the subhead,
   remove per-card axis labels; move the Q3 card's "0.0%" label left of the start dot so it stops colliding with the
   red step. Hide keyboard hints (↵, S, ⌘K) below 640px. Phone hero mock: let slide 3's sentence wrap, never cut
   off mid-word.
9. Smaller copy: "MTI, SingStat and MOM releases date each earlier number." → plain ("Every earlier number links to
   its release."). "Employment counts in thousands are shown in people." → delete or rewrite plainly. About's
   "Figures and sources are real and public. Sample slides are written for demonstration." → "Figures and sources are
   public. The example deck is a sample."
