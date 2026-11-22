# 018 · Report — Film and slide ideas for the Recall Press submission

## What I read

- `docs/qw-inbox/018-film-ideas.md` — the job spec.
- `site/v2/src/` — `home-01-hero.html` (Recall desk window, flag card, source chips),
  `home-02-run.html` (agent run log), `home-03-history.html`, `home-04-grid.html`
  (10 indicators × 6 quarters grid), `system.css` (v3 light system: paper `#FFFFFF`,
  warm wash `#FFFBF8`, ink `#111110`, quiet `#5B5953`, dim `#6B6862`, accent red `#C93A1B`,
  Inter, ease `cubic-bezier(.22,1,.36,1)`); screenshots in `site/v2/out/v3/*.png`.
- `context/taste/README.md` — the owner's three reference decks and preferences.
- `deck/v1/` — the first pitch deck (old story and look); `deck/kit/references/taste.md` —
  the slide rules (headlines are the pitch, 4–10 words, full sentences ending with a period,
  one dominant visual per slide, one hero number as before → after, honesty in notes not chrome).
- `README.md` section "One revision, two answers" (the two-verdict table and the figure-history
  chart), plus the Proof table (60 tracked / 57 revised / 18 sentence-breaking; blind read 5/7
  then 8/8; 132 automated tests).
- `docs/submission/description.md` — product line, live links, the honest sequence
  (first blind read registered 7 of 8 and matched 5/7; Job 016 matched 8/8; missed cron slots;
  founder-written samples; no paying customer).
- `qwenwork-out/08-media/` — earlier media (opening, transitions, narration) and
  `media-costs.md` (local renders 0 credits; generated video ~16–28 credits/s).

## What I made (all in `docs/qw-outbox/018-film-ideas/`)

1. **`STORYBOARD.md`** (step 2, completed in the earlier session of this job) — three submission
   films, each ~10 shots, hard cuts, slide-style motion graphics inside each shot, the light v3
   look, all ≤ 2:45:
   - **Film A · "One revision, two answers."** — the judgment story: one revision breaks the
     briefing sentence and leaves the board-paper sentence true. 10 shots, 136 s (2:16).
   - **Film B · "The deck that kept itself current."** — one registered deck followed through
     seven months of releases, told through the agent's own run log. 10 shots, 138 s (2:18).
   - **Film C · "Most figures change after you cite them."** — data-first cold open: the 60-cell
     grid, 57 revised, 18 sentence-breaking, then zoom into one cell, one sentence, one correction.
     10 shots, 138 s (2:18).
   Every number comes from the project files (0.0% → 5.0% → 4.9% → 5.3% → 4.6%; services
   0.6% → 0.7%; 60 / 57 / 18; 6 slides; watched since 20 Oct 2025; 8 claims, 8/8 verdicts).
   Honesty is carried in every film: the editor approves every change; sample decks are
   founder-written; figures and dates are real releases.
2. **`shot-01.html`** (step 3, completed in the earlier session) — Film A's opening shot as a
   single self-contained 1920×1080 HTML file: the slide-4 sentence with "stalled" struck and
   "grew 4.6%" written in, dated MTI source chips, one 6-second looping CSS animation
   (rest → strike → write → source lands → hold → reset), colours/Inter/ease from `system.css`,
   markup adapted from `home-01-hero.html`, reduced-motion fallback, scales to fit the preview.
3. **`SLIDES.md`** (step 4, this session) — ten pitch-deck headlines, each a full sentence of
   4–10 words ending with a period (no topic titles), each with the one visual that proves it,
   built from real artifacts (hero flag card, run log, 60-cell grid, before/after slide,
   Revisionpedia figure page). Includes the headline read-through (the pitch in ten lines),
   per-slide proof sources, and the honest qualifiers placed in speaker notes per taste rule 3.
4. **`REPORT.md`** (this file) and **`DONE`** (step 5).

## Which film I pick

**Film A, "One revision, two answers."** It leads with judgment — the one thing a blind
find-and-replace tool cannot do — in a single frame (shot 4: one revision, two verdicts,
"changing it would introduce an error"), matching the README's own lead story. It fits the
owner's taste (two-sided tension early, real artifacts on screen, proof before claims, honesty
spoken). And it is the cheapest to make well: shots 1, 5, 6, 7, 8, 9 are CSS motion on markup
that already exists in `site/v2/src/` — local renders cost 0 credits versus ~16–28 credits/s
for generated video. Film B is the strongest runner-up (run log as plot) but waits ~40 s for the
two-answers moment; Film C has the best cold open but risks reading as a data report.

## Verification (self-test before handover)

- `SLIDES.md`: programmatic check — exactly 10 headlines; every headline 4–10 words and ends
  with a period; all pass (7, 8, 6, 7, 7, 5, 7, 7, 7, 7 words).
- Every number in `SLIDES.md` and `STORYBOARD.md` traced to README (Proof table, figure-history
  chart, two-verdict table), `docs/submission/description.md`, or `site/v2/src/` markup.
  Nothing invented; no new URLs beyond those already in the project files.
- `shot-01.html` re-read this session: 1920×1080 frame, one 6 s loop, `system.css` palette and
  Inter, reduced-motion fallback present.
- Spec constraints: three films × ~10 shots, hard cuts, ≤ 2:45 (2:16 / 2:18 / 2:18); output
  confined to this outbox folder; nothing committed, pushed, deleted or published.

## Assumptions

- Steps 2–3 were already complete and correct per the continuation instruction; I read them
  for context and did not redo or modify them.
- "Ten slide headlines" targets the 6–7 minute pitch sizing in taste.md (~10 slides); a note
  in SLIDES.md explains folding slides 5 and 9 into the demo/appendix for the 3-minute version.
- The 8/8 headline (slide 8) uses the README's own framing — first blind read 5/7, re-run after
  two rule fixes 8/8 — with the honest sequence spoken in notes, so the slide claim is defensible.
- Slide visuals reuse existing markup/media rather than new renders, keeping production at
  0 credits and on-brand.

## Failures

None. All steps of job 018 are complete.

## Follow-up · Pitch bookends and strongest film for judges

Created `slide-title.html` and `slide-close.html` as standalone 1920×1080 HTML slides with viewport-fit scaling, inline CSS/JavaScript, and no external dependencies. Both use the palette, Inter font stack, window bar, sidebar and deck-row grammar from `site/v2/src/system.css` and `home-01-hero.html`. Inter is not embedded; the system font fallback applies when it is not installed. The explicitly requested light product palette takes precedence over the general taste preference for coloured deck backgrounds.

- **Title:** “Your sources change. Your deck stands still.” A large cropped Recall desk window holds the stale manufacturing sentence while its source changes from 0.0% to 4.6%; review is pending and the deck remains unchanged.
- **Close:** “Your sources change. Your deck updates itself.” The matching window settles on the corrected sentence, dated April source and updated PPTX, explicitly after editor approval. This is an illustrative founder-written sample state, not evidence of a newly executed correction.
- Both have short, non-looping entrances with reduced-motion support. Browser rendering has not been verified; the checks for this follow-up are source-level, not a visual approval.

### Judges’ pick: Film A, “One revision, two answers.”

Film A is the strongest judging story because its central contrast demonstrates contextual judgment, not merely a number replacement: the same revision makes the briefing wrong while the historically attributed board-paper sentence stays true. A judge can understand both the value and the risk of a naive alternative in one paired visual. It then turns that distinction into an observable workflow: exact sentence, dated evidence, editor approval and an editable PowerPoint. That gives the film a clear problem, differentiated mechanism and tangible output.

Film B is the runner-up for showing the QwenWork workflow, but its release-by-release chronology is less immediate and risks overstating unattended reliability. Film C establishes the breadth of the problem well, but its grid-first opening can make the submission feel like a data directory rather than an editorial automation product. Film A can use those existing log and grid shots as supporting proof without letting either become the main story.

Before producing Film A, distinguish the historical replay from demonstrated live automation. The submission description records missed slots and manual Run now checks, so “every release” must not be presented as proven uninterrupted operation. Likewise, any 8/8 result must be described as the re-run on the reused claim list after fixes, not fresh blind validation. Retain the spoken founder-written-samples qualifier and make approval visible before the closing corrected-deck state. These are production cautions; the existing STORYBOARD.md and shot-01.html were not changed.
