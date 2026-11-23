# 021 · Film D: final-cut support (longer illustration takes and review)

Work only inside this project folder. Create `docs/qw-outbox/021-film-d-final/CLAIMED` first. Save everything under
`docs/qw-outbox/021-film-d-final/` (media in `media/`). Do not delete, commit, push or publish anything. Do not edit or
run anything under `hack/video/` (another editor is rendering it now); only read it.

## The film
Film D (`hack/video/out/D.mp4`, ~80 s, 9 shots, hard cuts) is the submission film for Recall Press. Its build system
is `hack/video/` (`build.mjs`, `d-timeline.mjs`, `d-scenes.mjs`, `d-motion.js`, `film-d.css`; README.md explains the
build). Watch it first (extract a frame every 2 s with ffmpeg) and read `hack/video/D/narration.txt`.
The owner's notes: the generated-illustration shots cut away too fast, which makes the cuts feel jarring. Each
illustration beat needs to stay on screen longer (about 3–4 s), so it needs longer, slower takes.

## 1 · Longer takes of the three illustration beats (1080p, 8–10 s each, slow continuous motion, no cuts)
Use image-to-video from these existing stills so the look matches exactly:
- `docs/qw-outbox/020-film-illustrations/media/p1-macro-print-a.png`: the red pencil line drawing slowly across the
  printed line (the strike happens on camera).
- `docs/qw-outbox/020-film-illustrations/media/p2-glass.png`: the glass documents in the dark; red light spreading from
  one document to the next, slowly.
- `docs/qw-outbox/020-film-illustrations/media/p1-night-still-life-b.png`: the red bar glowing up; slow push.
Make 2 takes of each (different camera moves). No people, no hands, no legible text, no logos.

## 2 · One new end-card take (1080p, 8 s)
Warm off-white paper documents (a slide deck, a report, a memo) lying together on a desk; a soft red light passes
across them and each one settles back to clean paper — "every document current again". Calm, editorial.

## 3 · Review
Make `contact-sheet.png` of all new takes (first, middle, last frame each). In REPORT.md rank the best take per beat
and give the trim (start, length) that holds best for 3–4 s.

## Budget
Stop generating if the Credit Balance falls below 900. Write REPORT.md (models, prompts, cost per asset, files,
ranking, failures), then create DONE.
