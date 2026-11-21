# Recall Press — Media Generation Cost Report

QwenWork run dated 2026-11-19. Credits measured from the QwenWork usage panel
(`qwenwork.usage`) before/after each asset. Plan: 4500 credits.

## Environment

- ffmpeg 9.0.2 (libx264, libmp3lame, AAC) — all cutting/fades/encoding done locally, 0 credits
- Python 3.9.6
- No text-to-speech model is available in this session (audio models are music-only:
  minimax-music-2.5/2.6/3.0). Narration fallback: macOS `say` (Samantha, en_US), slowed 10%
  with ffmpeg `atempo` for a calmer pace. Free, local, but clearly synthetic — replace for the final.

## Models available in this task

| Capability | Model | Max length | Max resolution | Notes |
|---|---|---|---|---|
| Video | happy-horse-1.0 | 15 s (min 4) | 1080p | No audio, no aspect-ratio param |
| Video | seedance-2.0 | 15 s (min 4) | 4K | Optional generated audio |
| Image | open-image-2 | — | 4K (custom sizes, multiples of 16) | Used for all stills |
| Image | banana-image-2 | — | 4K (fixed aspect ratios) | Backup; submission failed during outage |
| Music | minimax-music-2.5/2.6/3.0 | ~5 min | — | Not used (no music requested) |
| Speech | none | — | — | macOS `say` used instead |

Router catalog also lists wan3.0-video / wan3.0-video-prime (2–30 s, 1080p) and
qwen-image-3.0/-pro, but they are not exposed by this session's media tools.

## Per-asset costs (measured)

| # | Asset | Model | Spec | Render time | Credits |
|---|---|---|---|---|---|
| 1 | Opening shot `recall-press-opening-14s.mp4` | happy-horse-1.0 | 14.1 s, 1920×1080, H.264 | ~5 min 04 s | **392.0** |
| 2 | Transition (a) figure 0.0%→5.0% `recall-press-transition-figure-6s.mp4` | happy-horse-1.0 | 6.1 s, 1920×1080 | ~2 min 04 s | **168.0** |
| 3 | Transition (b) map lighting up `recall-press-transition-map-6s.mp4` | seedance-2.0 | 6.1 s, 1280×720 | ~2 min 39 s | **95.3** |
| 4 | Hero `recall-press-hero-1600x900.png` | open-image-2 | 2048×1152 → 1600×900 (lanczos) | ~1 min 12 s | **18.4** |
| 5 | Social `recall-press-social-1200x630.png` | open-image-2 | 2048×1152 → crop/scale 1200×630 | ~1 min 10 s | **48.8*** |
| 6 | Square mark `recall-press-mark-1024.png` | open-image-2 | 1024×1024 | ~1 min 43 s | **22.3** |
| 7 | Narration `recall-press-narration.mp3` | macOS `say` (Samantha) + ffmpeg | 43.7 s, MP3 ~192 kbps VBR | seconds | **0** |
| 8 | Draft cut `recall-press-draft-50s.mp4` | ffmpeg (local) | 50.0 s, 1920×1080, H.264 + AAC 192k, 0.6 s crossfades | ~30 s encode | **0** |

\* The 48.8-credit interval for the social image includes two upstream-rejected submissions
(open-image-2 and banana-image-2 both returned `failed_dependency` during a brief outage;
retry succeeded minutes later). The successful image alone likely cost ~18–22 credits,
consistent with the other stills; rejected submissions may have been billed.

**Total consumed: 744.8 credits** (4500 → 3755.2 remaining, 83%).

## Derived unit prices

- happy-horse-1.0 @1080p: **28 credits/second** (392/14 and 168/6 both agree)
- seedance-2.0 @720p: **~15.9 credits/second** (95.3/6)
- open-image-2 (high quality): **~18–22 credits/image**
- Local ffmpeg / macOS say: **0 credits**

## Estimate: final 3-minute video with 6–8 generated clips

Assume 6–8 clips averaging ~10 s = 60–80 s of generated video; the remaining 100–120 s
covered by stills with slow zooms, title cards and fades (all free via ffmpeg).

| Option | Generated video | Stills (4–6) | Narration | Total estimate |
|---|---|---|---|---|
| A. Seedance 720p, upscaled to 1080p locally | 60–80 s × 15.9 ≈ 950–1270 | ~80–130 | 0 (local) | **~1030–1400 credits** |
| B. HappyHorse 1080p native | 60–80 s × 28 ≈ 1680–2240 | ~80–130 | 0 (local) | **~1760–2370 credits** |
| C. Mixed (recommended) | 1–2 hero shots @1080p HappyHorse (~280–560) + 5–6 clips @720p Seedance (~800–950) | ~80–130 | 0 (local) | **~1160–1640 credits** |

All options fit comfortably in the 3755 credits remaining.

## Recommendation — cheapest way to make it look good

1. **Use Seedance 720p for most clips and upscale with ffmpeg lanczos to 1080p.**
   At ~15.9 vs 28 credits/s that's ~43% cheaper, and for calm, abstract, editorial
   footage (paper, ink, light lines) the upscale is barely distinguishable.
2. **Spend 1080p only on the 1–2 hero shots** (the opening desk shot is the money shot).
3. **Fill half the runtime with stills + slow Ken Burns zooms and crossfades** — free,
   and on-brand for a document-centric product. Reuse the hero/social/mark already paid for.
4. **Keep narration local for drafts (0 credits)**, but budget a re-record for the final:
   the macOS voice is audibly synthetic. No premium TTS is exposed in this session;
   a human read or an external TTS would be the single biggest quality upgrade.
5. **Reuse today's assets in the final cut** — the opening, both transitions and all three
   stills are already paid for, shaving ~695 credits off any final-video option.
6. Generate clips at their final needed length (pricing is per second); avoid generating
   15 s and trimming to 6.

## Files

All deliverables are in this folder:
- recall-press-opening-14s.mp4
- recall-press-transition-figure-6s.mp4
- recall-press-transition-map-6s.mp4
- recall-press-hero-1600x900.png
- recall-press-social-1200x630.png
- recall-press-mark-1024.png
- recall-press-narration.mp3
- recall-press-draft-50s.mp4
- media-costs.md