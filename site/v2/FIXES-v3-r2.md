# v3 fix round 2 (blind Opus critic on the light build: clarity 8, copy 7, hierarchy 7, craft 7, mocks 7, phone 6, trust 6, ship 6)

Orchestrator decisions are marked **[decision]** and win.

## MUST
1. **Charts are not plotted by date** (figure page, home history band, How step, indicator cards). The latest release
   (14 Oct 2026) sits ~2/3 along an axis that ends later; earlier points are pulled left. Plot every release at its
   true date on a linear time scale from first estimate to latest release; the "now" dot sits exactly at the axis end
   label. No line running past it. One baseline label only ("0.0%", drop the stray "0").
2. **Indicator charts are squashed**: the shared scale's top maps to only ~half the plot height. Map scale max → plot
   top, min → baseline. Delete the "One scale for all six charts: 0.0% to 18.8%" line; show the scale as two small axis
   labels on the first card only.
3. **Unexplained grid marks**: delete the corner dots on grid cells (fill already says "number changed"); remove the
   10px struck first estimates from the Figures page grid (All figures shows them). Legend squares 12px.
4. **Orphans / closing band**: one closing band pattern on every page (home's: headline left, button right on the
   subline's baseline). Break after "deck." in "Send one deck. We watch every source in it."; `text-wrap: balance` on
   all h1/h2; no single-word last lines at 1440 or 390.

## NICE (do them all)
5. **Hero app window bottom**: remove the faded empty ~90px under slide 6; close the window ~16px under row 6 with a real
   bottom border; sidebar footer ("Watching 2 decks") either normal quiet grey or deleted.
6. **One meaning per word and colour**:
   - Legend everywhere: "Words change" / "Number only" / "Never revised" (match How page chips).
   - Home grid row labels "year on year" / "quarter on quarter" (not "annual"/"quarterly").
   - Accent red only for "Words change" cells, the strike + new value in the sentence, and "Now wrong". Latest values
     and change amounts in ink/grey. Make the release tables consistent across home card and figure page.
7. **Leftover slop**:
   - "Revisionpedia › Manufacturing › Q3 2025" → "Figures › Manufacturing › Q3 2025".
   - **[decision]** Keep the single small "runs on QwenWork" in the run window (owner asked for it). Keep ONE quiet
     "Example" tag on the run window only; delete the other "Example" pills (How step 4, Send a deck) and replace with
     nothing or a plain caption under the mock if honesty needs it.
   - Delete "One run per new release". "still growth" → "still growing". Replace jargon "crossed zero" with plain words.
   - Rewrite "Each sentence a revised source broke, the new figure with its dated release, and a corrected PPTX." as
     short keyword rows.
   - Send a deck: button "Send a deck"; email placeholder; "We reply to this email only." → "We reply within two
     working days."
   - **[decision]** About: no named person (owner's privacy). Leave it.
   - Home: "Live today for 10 Singapore indicators →" and "All 10 indicators →" go to the same page: keep the hero one;
     change the grid's link to "All 60 figures →" pointing at the All figures page, or drop it.
8. **Phone**:
   - Hero buttons full width at 390.
   - Figure page table under 480px: 3 columns, date on a grey second line under the release name.
   - Figure page chart at 390: label first, highest and latest values.
   - Footer links in 2 columns × 3 rows at 390.
   - Header at 390: a small menu (details/summary, no JS framework) with How it works, Figures, About; keep the
     "Send a deck" button visible.
9. **How it works slide thumbnails** are grey placeholder lines: make them look like real tiny slides (a title line in
   real words, a number), or drop thumbnails.
