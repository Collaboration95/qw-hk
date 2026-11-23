# 021 · Film D final-cut support — REPORT

Job: `docs/qw-inbox/021-film-d-final.md`
Claimed: 2026-11-23 18:23:06 +0800 · Completed: 2026-11-23 (same day)
Everything saved under `docs/qw-outbox/021-film-d-final/` (media in `media/`, working frames/scripts in `work/`).
Nothing deleted, committed, pushed or published. `hack/video/` was only read, never edited or run.

## What was done
- Watched `hack/video/out/D.mp4` (78.0 s, 9 shots) via 2 s frame sampling + vision review; read `D/narration.txt`,
  `README.md`, `d-timeline.mjs`, `d-scenes.mjs`, `d-motion.js`. The three illustration beats are `d-readings`
  (night still life, 6 s hold), `d-correction` (macro print, 4 s hold) and `d-wave` (glass, 4 s hold); all hard-cut.
- Part 1: two 8 s 1080p image-to-video takes per beat from the exact Job 020 stills (different camera moves).
- Part 2: one 8 s 1080p end-card take, regenerated once (first attempt had legible text — see Failures).
- Part 3: `contact-sheet.png` (1968×3328, 8 rows × first/middle/last frame), ranking and trims below.

## Credit balance (checked before every generation)
| Checkpoint | Remaining | Note |
|---|---:|---|
| Before job | 2,777.3948 | plan 9,500 |
| After macro-t1 | 2,539.7906 | |
| After macro-t2 | 2,230.0223 | |
| After glass-t1 | 2,002.0412 | lowest point |
| After glass-t2 | 3,775.0817 | plan top-up 9,500 → 11,500 landed mid-job (+2,000) |
| After night-t1 | 3,546.7138 | |
| After night-t2 | 3,321.1421 | |
| After end-card-t1 | 3,016.5209 | |
| After end-card-t2 | 2,697.7010 | final |

**Spent on this job: 2,079.6938 credits.** Never went below the 900 floor (lowest 2,002.04).

## Models and why
Job 020 measured seedance-2.0 at ~40 credits/s; seven 8 s 1080p takes on seedance alone (~2,200) would have
breached the 900 floor from the 2,777 baseline. So: **happy-horse-1.0** (measured here ~28–30 credits/s) for the
five takes where it animates light/pigment well, **seedance-2.0** for the macro benchmark take and both end-card
takes (new scene, photorealism priority). All clips: image-to-video from the Job 020 stills except the end cards
(text-to-video). All outputs **1920×1080, 24 fps, 8.04 s, no audio**. 8 s chosen (low end of the 8–10 s range)
for budget and pacing.

## Files and cost per asset (usage-diff, each measured in isolation)
| File | Model | Move | Credits |
|---|---|---|---:|
| `media/macro-print-t1.mp4` | happy-horse-1.0 i2v | sideways drift, pigment depositing | 237.6042 |
| `media/macro-print-t2.mp4` | seedance-2.0 i2v | slow push-in | 309.7683 |
| `media/glass-t1.mp4` | happy-horse-1.0 i2v | slow orbital drift right | 227.9811 |
| `media/glass-t2.mp4` | happy-horse-1.0 i2v | slow pull-back | 226.9595 |
| `media/night-still-life-t1.mp4` | happy-horse-1.0 i2v | slow push-in, glow up | 228.3679 |
| `media/night-still-life-t2.mp4` | happy-horse-1.0 i2v | slow lateral arc right | 225.5717 |
| `media/end-card-t1.mp4` | seedance-2.0 t2v | red sweep (rejected: legible text 0–2 s) | 304.6212 |
| `media/end-card-t2.mp4` | seedance-2.0 t2v | red sweep, clean settle (keeper) | 318.8199 |
| **Total** | | | **2,079.6938** |

Also: `contact-sheet.png`, `CLAIMED`, `DONE`, `work/` (watch frames, per-take first/mid/last + 1 fps frames,
`make_sheet.py`). Router downloads land at the workspace root (host-controlled); copies were placed in `media/`
and the originals kept (nothing deleted).

## Prompts (verbatim, abridged only where noted)
- **macro-t1** (image `p1-macro-print-a.png`): "Extreme macro top-down view of textured off-white paper with a
  thick black printed line running diagonally. The granular red pencil strike slowly draws itself further along
  the black line: dry crimson pigment granules appear progressively as the stroke extends toward the end of the
  printed line, tiny pigment flecks settling onto the paper fibers. The camera drifts very slowly sideways along
  the line, shallow depth of field, soft diffused light, subtle specular glints on the wax pigment. One slow
  continuous unbroken take, no cuts, no people, no hands, no readable text, no logos. Photorealistic macro
  photography, calm editorial mood."
- **macro-t2** (same still): same scene, but "a clear leading edge of dry crimson pigment advances steadily along
  the black line toward its far end… the already-drawn portion stays exactly as it is… camera pushes in very
  slowly toward the middle of the stroke…" (same prohibitions).
- **glass-t1** (image `p2-glass.png`): "Translucent glass document cards floating in pitch-black space, connected
  by thin luminous lines. The red-orange glow slowly spreads from the central glowing document along the
  connecting lines to the neighboring glass documents, one after another… glass forms stay rigid and solid, no
  melting. Very slow orbital camera drift to the right… One continuous slow unbroken take, no cuts, no people,
  no hands, no readable text, no logos. Cinematic, calm, editorial."
- **glass-t2** (same still): "The camera pulls back very slowly and steadily, revealing more of the dark glass
  network. As it pulls back, a gentle wave of warm red light travels gradually from the central glowing document
  outward along the thin luminous connections, reaching one neighboring glass card after another…" (same
  prohibitions).
- **night-t1** (image `p1-night-still-life-b.png`): "Night still-life of a printed bar chart on textured paper
  under a single warm spotlight, a wooden pencil lying beside it. The tall red bar slowly glows up: its saturated
  red light gradually intensifies and softly blooms… black bars, pencil and folded paper stay perfectly still.
  The camera pushes in very slowly toward the red bar, chiaroscuro lighting…" (same prohibitions).
- **night-t2** (same still): "The camera slides very slowly in a gentle lateral arc to the right around the chart…
  the red bar's glow rises gradually from matte printed red to a luminous warm red…" (same prohibitions).
- **end-card-t1**: "Calm editorial still-life, photorealistic. Warm off-white paper documents lying together on a
  wooden desk… a printed slide-deck page with a simple bar chart, a stapled report, and a short memo… All printed
  marks are soft illegible gray smudges… A soft warm red light passes slowly across the papers from left to right…
  each document settles back to clean crisp off-white paper… Very slow gentle push-in… no cuts, no people, no
  hands, no readable text, no logos. Warm paper palette #FAF8F4 with a single soft red accent…"
- **end-card-t2**: same concept, hardened: "Three loose paper documents… Every printed mark is a soft abstract
  gray smudge or blurred line — absolutely no words, no letters, no numbers, nothing readable anywhere… no
  binder, no rings…" (rest as t1).

## Ranking and recommended trims (source seconds; verified against 1 fps frame reviews)
### Beat 1 · macro print (`d-correction`)
1. **macro-print-t1** — trim **start 4.0, length 4**. The only take where the strike visibly happens on camera
   (pigment deposits and intensifies along the line). Seconds 0–2 are soft/motion-blurred; 4–8 is sharp, smooth
   drift, granular wax reads clearly.
2. macro-print-t2 — trim **start 1.0, length 4**. Clean, steady push-in, photorealistic, but the strike is static
   (Ken Burns on the still). Use as an alternative hold, not the "strike" moment.

### Beat 2 · glass documents (`d-wave`)
1. **glass-t1** — trim **start 1.0, length 4**. Close orbital drift; the red light clearly travels the connection
   and ignites the next document. Rigid glass, clean bokeh. After ~5 s the subject drifts toward frame edge.
2. glass-t2 — trim **start 2.0, length 4**. Pull-back reveals the network while red cascades to several nodes;
   better as an establishing variant. After ~6 s the cards get small and the spread reads less clearly.

### Beat 3 · night still life (`d-readings`)
1. **night-still-life-t1** — trim **start 2.0, length 4**. The glow blooms convincingly from matte red to a light
   source; props stationary; matches the "slow push" note exactly. After ~6 s the push-in gets too tight and
   edges soften.
2. night-still-life-t2 — trim **start 3.0, length 4**. Lateral arc with parallax; glow peak at 3–6 s. Avoid
   7–8 s: pencil tip and paper fold morph slightly.

### End card
1. **end-card-t2** — trim **start 4.0, length 4**. No legible text anywhere; sweep tail + all three sheets settled
   clean. Minor morph at 3–4 s (cleaning outpaces the light on the left sheet) sits just before the window.
2. end-card-t1 — trim **start 4.0, length 3** only if needed. Rejected as primary: legible hallucinated text
   ("Paradigm…") at 0–2 s and a content-glitch at 2–4 s.

**Editor note:** trims are 3–4 s as requested. `d-timeline.mjs` currently holds macro/glass at 4 s (fits exactly)
but `d-readings` at 6 s — a 4 s trim there would freeze 2 s (over the 1 s tail-freeze rule). Either extend the
night window (e.g. night-t1 start 1, length 6) or shorten the `d-readings` hold; that edit belongs to the
`hack/video/` owner and was not made here.

## QC
- No people, hands or logos in any take. No legible text in any kept take (end-card-t1's 0–2 s text is the one
  violation; that take is retained for reference only and ranked second).
- All takes are single continuous shots, no cuts; motion slow and smooth in the recommended windows.
- Glass stays rigid; chart/pencil stationary in the night takes' recommended windows.

## Failures / deviations (all recovered)
1. **seedance macro-t2 kept the strike static** — the first frame already contains the completed strike, so the
   model preserved it (Ken Burns push-in). happy-horse t1 animates pigment deposition instead; neither shows a
   literal pencil tip (hands are prohibited). t1 is the closest achievable to "the strike happens on camera".
2. **end-card-t1 legible text + glitch** → regenerated once as end-card-t2 with a hardened no-text prompt; clean.
3. Transient `media_read` "protection context changed" error on one review — recovered by retry (same as Job 020).
4. This ffmpeg build rejects `-vsync`; used `-fps_mode vfr`. An earlier `&&` chain short-circuited on that error
   before the first `cp`; re-ran the copy (no data loss).
5. night-t2 pencil/fold morph at 7–8 s and macro-t1 softness at 0–2 s — handled by trims, not regeneration.

## Assumptions
- 8 s takes (range allowed 8–10 s); seedance outputs 8.04 s at 24 fps, happy-horse likewise here.
- Contact-sheet frames are exact source frames n=0 / 96 / 191 (t≈0 / 4.0 / 7.96 s).
- Model mix driven by the 900 floor at the original balance; the mid-job +2,000 top-up was not spent on upgrades.
- Router download location is host-controlled (workspace root); `media/` holds the job copies.