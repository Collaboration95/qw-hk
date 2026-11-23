# 020 · Illustrations and motion variants for the Recall Press films — REPORT

Job: `docs/qw-inbox/020-film-illustrations.md`
Claimed: 2026-11-23 16:11:08 +0800 · Completed: 2026-11-23 (same day)
Everything saved under `docs/qw-outbox/020-film-illustrations/` (media in `media/`). Nothing deleted, committed, pushed or published.

## Credit balance
- **Before:** 4,963.2132 remaining (plan 9,500; used 4,536.7868) — read 16:11 +0800.
- **After:** 2,846.8056 remaining (used 6,653.1944) — read after the last clip.
- **Spent on this job:** 2,116.4076 credits. Stayed above the 2,500 floor throughout; monitored before each expensive clip.

## Media models available this session (with limits & cost)
Premium built-in tools (`qwenwork_image_generate` / `video_generate` / `music_generate`), plus the router catalog:

| Capability | Model | Limits | Cost (measured / known) |
|---|---|---|---|
| Image | **open-image-2** (used) | generate/edit; custom sizes multiples of 16, sides ≤3840, 0.66–8.3 MP; quality low/med/high/auto; n 1–4; png/jpeg/webp | **22.56 credits** per high 2048×1152 still (measured) |
| Image | banana-image-2 / -lite | fixed ratios incl 16:9; 1K/2K/4K (lite 1K); web_search; edit ≤14 refs | not used |
| Image | qwen-image-3.0 / 3.0-pro (router) | generate/edit; up to 6 per request | not used |
| Video | **seedance-2.0** (used) | text/image/first-last/reference; 480p–4k; 4–15 s; audio optional | **~221–243 credits** per 1080p 6 s i2v clip (measured; ~40 credits/s) |
| Video | happy-horse-1.0 | text/image; 720p/1080p; 4–15 s; no audio, no aspect_ratio | ~28 credits/s (prior session) — fallback, not needed |
| Video | wan3.0-video / -prime (router) | text/keyframes/ref; 2–30 s; ≤1080p | not used |
| Music | minimax-music-2.5 (tool) / 2.6 / 3.0 (router) | MP3, auto-lyrics, ~5 min | not needed |
| Speech/voice | **none** | no TTS model in session (audio models are music-only) | n/a |

All stills used **open-image-2**; all generated clips used **seedance-2.0** (image-to-video). No model failed, so no fallback to the other model was required.

## Files delivered
### Part 1 — Film A illustrations, four art directions (2 stills + 1 clip each)
| Direction | Stills (1920×1080) | Clip (1080p, 6 s, slow move) |
|---|---|---|
| 1 Night still life | `media/p1-night-still-life-a.png`, `-b.png` | `media/p1-night-still-life.mp4` |
| 2 Paper collage / risograph | `media/p1-risograph-a.png`, `-b.png` | `media/p1-risograph.mp4` |
| 3 Extreme macro print | `media/p1-macro-print-a.png`, `-b.png` | `media/p1-macro-print.mp4` |
| 4 Industrial dusk | `media/p1-industrial-dusk-a.png` (fab), `-b.png` (port cranes) | `media/p1-industrial-dusk.mp4` |

### Part 2 — Film B "the change travels through the files" (1 still + 1 clip per look)
| Look | Still (1920×1080) | Clip (1080p, 6 s) |
|---|---|---|
| 1 Pinboard | `media/p2-pinboard.png` | `media/p2-pinboard.mp4` |
| 2 Flat graphic top-down | `media/p2-flat-graphic.png` | `media/p2-flat-graphic.mp4` |
| 3 Clay / isometric | `media/p2-clay.png` | `media/p2-clay.mp4` |
| 4 Glass in the dark | `media/p2-glass.png` | `media/p2-glass.mp4` |

### Part 3 — two coded motion designs (Qwen4-Max session, rendered locally)
- `network-1.html` — tidy column layout (orthogonal ink connectors, rectangular cards).
- `network-2.html` — organic web (curved bowed links, rotated circular paper discs).
- Both: 1920×1080, 10 s, Inter/system sans, palette #FAF8F4 / #111110 / #C93A1B. One source node centre-left + 6 document nodes (members' briefing .pptx, board paper .docx, client note .pptx, investor update .docx, internal memo .md, newsletter .docx), some cross-linked. At 2 s source turns red; pulses race along each link at different speeds; each doc flips red ("now wrong") on arrival then settles to ink + check ("updated") one by one; last 2 s hold the whole network updated.
- Both expose `window.seek(seconds)` drawing the exact state (no real-time clock) and autoplay on open. **Determinism verified:** re-seeking to 4.0 s produced byte-identical screenshots.
- Rendered to `media/network-1.mp4`, `media/network-2.mp4` — 1920×1080, **30 fps, 10.00 s** (playwright-core + cached Chromium screenshot loop + ffmpeg). **0 credits** (local render).

### Part 4
- `contact-sheet.png` (2000×2026) — all 12 stills + the middle frame of all 10 clips, labelled by part and number.

## Cost per asset (usage-diff attribution)
Images are exactly **22.56** each (12 stills = 270.72). Clips measured individually where isolated; the rest are batch-attributed averages (noted).

| Asset | Credits |
|---|---|
| p1-night-still-life-a / -b | 22.56 each |
| p1-night-still-life.mp4 | 243.27 (measured) |
| p1-risograph-a / -b | 22.56 each |
| p1-risograph.mp4 | 221.58 (measured) |
| p1-macro-print-a / -b | 22.56 each |
| p1-macro-print.mp4 | 222.77 (measured) |
| p1-industrial-dusk-a / -b | 22.56 each |
| p1-industrial-dusk.mp4 | ~232.67 (batch avg) |
| p2-pinboard.png / .mp4 | 22.56 / ~232.67 (batch avg) |
| p2-flat-graphic.png / .mp4 | 22.56 / ~232.67 (batch avg) |
| p2-clay.png / .mp4 | 22.56 / ~230.04 (batch avg) |
| p2-glass.png / .mp4 | 22.56 / ~230.04 (batch avg) |
| network-1.mp4 / network-2.mp4 | 0 (local render) |
| **Total** | **2,116.41** |

## Ranking (Part 4 review)
**Best two Part 1 art directions**
1. **Risograph (P1.2)** — most authentically "magazine, not website": halftone grain, torn cut-paper bars and misregistration feel like real print; the single red torn bar is a bold, tactile change-moment.
2. **Extreme macro print (P1.3)** — the red pencil strike-through across an illegible printed line is the most literal, sophisticated picture of "a sentence is now wrong"; monumental scale, pure ink/red/paper palette.

**Best two Part 2 looks**
1. **Pinboard (P2.1)** — the investigation-board aesthetic (physical red thread, pinned paper, raking light) grounds "the change travels through the files" in a real, editorial object; propagation reads clearly.
2. **Clay / isometric (P2.3)** — soft matte clay folders + tubes feel premium and tactile (editorial claymation), and the colour wave through the tubes is the easiest network to read at a glance.

## QC / what came out wrong
- **No legible words or numbers, no people/faces/hands, no logos** in any still or clip (verified by vision review of every full-res still and clip frames). Chart/paper markings are intentional illegible smudges.
- **No ugly artefacts** found; textures (grain, halftone, pigment, clay) are intentional.
- **All Part 2 clips show the change spreading** (some nodes red, some not, mid-clip). The glass clip looked near-static in the small contact-sheet thumbnail, but full frames at t=1/3/5 s confirm red cards/light visibly increase — it does propagate.
- **"Glass in the dark" uses a black background by design** — the spec explicitly requested "luminous document cards floating in dark space." A reviewer flagged it as off-brand vs the warm-paper look; it is per spec, not an error, but it is the one look that departs from the off-white palette (kept as requested).

## Failures / deviations (all recovered, no extra credit cost)
1. Two transient `media_task wait` errors ("protection context changed") on the risograph and glass clips — recovered by `status` + retrying `wait`; no regeneration.
2. One transient write error on `network-2.html` ("protected credential restoration failed") — retried successfully.
3. One race condition: the pinboard clip was submitted before its still finished resizing → ENOENT security-boundary error. Fixed by completing the resize first, then resubmitting (not a model failure).
4. Playwright executable mismatch (`chromium_headless_shell-1255` absent) — pointed `executablePath` at the cached `1248` build; renders succeeded.

## Assumptions
- Stills generated at **2048×1152** (16:9, sides multiples of 16) then Lanczos-downscaled to exactly **1920×1080**, because open-image-2 requires multiples of 16 and 1080 is not one.
- Clips made via **image-to-video from each direction's still** (Part 1 still A; Part 2 the look's still) for visual consistency; 1080p, 6 s, 16:9, no audio. seedance outputs 24 fps / 6.04 s.
- Part 2 stills depict the **moment of change** (source red, others neutral) so the clip animates the spread from that first frame.
- Budget floor handled as "monitor and stop if balance falls below 2,500"; finished at 2,846.81, so all assets completed.
- Part 3 rendered locally (playwright-core + cached Chromium + ffmpeg, 30 fps); no credits. Speech/voice unavailable (music-only audio models) and not needed.