# v3 fix round 1 (from a blind Opus critic; scores: clarity 7, copy 6, hierarchy 5, craft 6, mocks 7, phone 5, trust 4, ship 4)

Orchestrator decisions are marked **[decision]**. They override the critic where they conflict.

## 1. Make every number agree (trust: the biggest problem)
- All figures says "56 of 60 figures now differ"; home/Figures say "57/60 revised". Use "57 of 60 revised at least once"
  everywhere; explain 56 only once on All figures ("56 still differ from their first estimate").
- Figures index GDP YoY row: grey "Unchanged" dot for Q4 '25 but "6 of 6 revised". Make the glyph match the data
  (revised, then back to the first value).
- Agent timeline says "8 indicators"; elsewhere 10. Use the true number for that deck, or drop the count.
- How it works: "Services · QoQ · Q1 2025 · Advance estimate, 14 Oct 2025" is impossible (Q1 advance is in April).
  Recheck every release name/date in the mocks against `site/collections/revisions.json`.
- One checked date sitewide (footer only): "Checked 22 Nov 2026". Remove "accessed 19 Nov 2026" ×4 on Sources.

## 2. The agent run mock (keep it: the owner asked for the QwenWork workflow window)
- The fixes arrive months after the release (10 Feb / 14 Apr releases, caught 21 Nov), which contradicts the promise.
  **[decision]** Show the run as what the product does on a release day: one run per release, timestamped the day the
  release came out (e.g. "14 Apr 2026 · Advance GDP estimates published → Slide 4 now wrong → corrected PPTX ready").
  The release dates and values must be real; the deck is the sample deck. Title the window with the deck name and a
  quiet "Example" tag so it is honest without a provenance line.
- **[decision]** Keep one small "runs on QwenWork" (owner asked for it) but drop the "Completed" pill and the
  "Scheduled run · …" line.
- Replace "The agent links each sentence…" with plain copy (e.g. "We link each sentence to its official figure and
  recheck it the day a new release lands.").

## 3. Section headlines: Linear's two-column header pattern
- Short H2 on the left (≈48px, weight 500–600, tracking ≈ −0.02em), one 18–20px grey sentence on the right. No
  two-tone display paragraphs, no back-to-back "Every…" openers.
- Hero display: less weight / less negative tracking so letters stop touching.
- Repeated CTA pairs: home shows "Send a deck" + "See a real correction" three times. Keep the hero pair and one
  closing "Send a deck" only.

## 4. Brands **[decision]**
- One product brand in copy: **Recall Press**. "Revisionpedia" stays only as the name of the free figures library
  (nav item "Figures" can stay; the figures section/mocks may say "Revisionpedia" once, e.g. the history band's
  window title). Remove "Revisionpedia is the free site behind Recall Press" sentence-style explanation.

## 5. Hero
- **[decision, superseded by §11]** Keep the headline general ("Official numbers change. Your deck should too."). The subline may name
  the reader in general terms (people who quote official figures in decks and briefings), not Singapore.
- Scope link: make it clear and specific, e.g. "Live today for 10 Singapore indicators →".
- "See a real correction" vs About "sample slides": rename to "See an example correction" (it is a real run on a
  sample deck).

## 6. Phone + charts
- Home grid at 390: sticky label column needs an opaque background, right hairline, higher z-index (orange cell
  borders bleed behind it).
- Every step chart: reserve a right gutter so "10.5% now"/"12.9% now" stay inside the card; axis/value text must not
  render below 11px on phone (use HTML labels or a separate phone viewBox).
- Indicator page: all six quarter charts share one y-axis scale; label it.
- Mock window titles wrap or shorten instead of truncating ("Q3 2...").

## 7. Figure page
- Show the release table open under the chart (date · value · release · change); keep ≤ 7 KB per page.
- First estimate shown grey and unstruck: "First estimate 0.0%, 14 Oct 2025".
- Replace the bare "14 Oct 2025 → 14 Oct 2026" with "9 releases · latest 14 Oct 2026".
- Label the values on the steps that changed.

## 8. Figures index / All figures
- Replace the 6px dot plot with the home grid's cell pattern (value per cell, accent when the change flips the
  sentence, first estimate small/struck in the cell). Fix clipped glyphs.
- Drop "All 60" from the footer (keep the page reachable from Figures).
- Rename the "Headline flipped" legend to plain words, e.g. "Changed the sentence" / "Changed the number" /
  "Never changed". Legend swatches must not look like toggles.

## 9. Send a deck page
- The visible form is the hand-written rawHtml block in the live cover page (see `site/v2/port/cover.json`).
  **[decision]** Rewrite that block's markup in `cover.json` keeping `form[data-payload-form-id="1"]` and the
  existing field `name`s that the submit script posts (inspect it first; do not invent new field names). Make it:
  Email (required) · Link to your deck (map onto an existing text field) · Anything we should check? (optional).
  Hide or drop Organisation, Publication, "Indicator or record (e.g. sg-…)", the "What would you like?" select and the
  consent line if the submit script tolerates their absence; otherwise keep them as hidden inputs with sensible
  defaults. Button: "Send deck". At 390 the form comes directly under the H1.
- Write the field mapping you used into NOTES-v3.md so the orchestrator can mirror it in `update_form`.

## 10. Smaller copy
- About: drop "A one-person company."; say "Independent, based in Singapore." once. Don't repeat "Independent, not
  government" in three places: footer once is enough.
- Sources: humanise the Title Case dataset names ("Employment change by sector, quarterly").
- Remove three identical tag cards on How it works ("Crossed zero / Crossed a round number / Small move"); show the
  idea as one visual instead. Drop the → bullet on every band.
- Vary the mock chrome: not all seven mocks need traffic lights; fragments can be borderless panels.

## Not taken
- Customer logos / "used by": nothing real exists. Do not add.

## 11. OWNER UPDATE (overrides everything above where it conflicts)
Owner, verbatim gist: "The first line should be like 'the documents you refer to change' / 'your document references
the docs'. 'Official numbers': we don't know what the hell that means. The documents that your document references
change. Keep it much shorter. Generally landing pages are a white theme (Linear is an outlier). Light mode, with a
tinge of a gradient. I'm fine if it looks like another YC website."

- **Headline line 1 = the things your document cites change.** Plain words a first-time visitor gets instantly:
  sources, reports, releases, the docs you cite. Candidates: "Your sources change. Your deck should too." ·
  "The sources you cite get revised." · "What your deck cites will change." Line 2 is free. Pick the clearest; no
  "official numbers" in the headline. Subline (one line) makes it concrete: a report, release or dataset you cited is
  revised → we find the sentence it broke and send the fix.
- Apply the same "sources / the docs you cite" framing to section headlines, meta titles and How it works.
- **Light theme.** White/near-white page, near-black ink, hairline grey borders, one subtle soft gradient tinge
  (e.g. a faint warm or cool wash behind the hero and product window; not purple-blue, no blobs, no gradient text).
  Clean YC-startup landing page feel: crisp Inter, product window as hero with a soft shadow, generous whitespace.
  Keep the one accent colour for corrections (strike + new value), tuned for contrast ≥ 4.5:1 on white.
- Mock windows become light app UI (light chrome, white panels), still crisp and dense like real software.
- Every page (home, how, figure, indicator, figures, all, about, sources, cover, header, footer) moves to light.
