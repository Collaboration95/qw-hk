# 020 working notes

## Credit balance
- BEFORE (2026-11-23 16:11 +0800): plan 9500 total, used 4536.7868, remaining 4963.2132 (52% aggregate)
- Budget floor: 2500 remaining

## Media models available this session
Premium built-in tools (qwenwork_image_generate / video_generate / music_generate):
- Images: open-image-2 (generate/edit; custom sizes multiples of 16, sides<=3840, 655360..8294400 px; quality low/medium/high/auto; n 1-4; png/jpeg/webp), banana-image-2 (generate/edit; fixed ratios incl 16:9; 1K/2K/4K; web_search)
- Video: seedance-2.0 (text/image/first-last/reference; 480p/720p/1080p/4k; 4-15s; audio optional), happy-horse-1.0 (text/image; 720p/1080p; 4-15s; no audio, no aspect_ratio)
- Music: minimax-music-2.5 (MP3, auto-lyrics)
- Speech/voice: NONE (no TTS model in session; music-only audio)

Router catalog additionally lists: banana-image-2-lite (1K), qwen-image-3.0 / 3.0-pro (generate/edit, up to 6 per request), wan3.0-video / wan3.0-video-prime (2-30s, up to 1080p), minimax-music-2.6 / 3.0.

Known costs (from prior sessions, verified by usage diff): seedance-2.0 720p ~15.9 credits/s; happy-horse-1.0 1080p ~28 credits/s. 1080p seedance and image costs measured per asset below via usage diffs.

## Asset cost log (usage diff before/after each asset)
- p1-night-still-life-a.png (open-image-2, high, 2048x1152): 22.56 credits (used 4536.7868 -> 4559.3468)
- p1-night-still-life-b.png + p1-night-still-life.mp4 (seedance-2.0 i2v 1080p 6s): combined 265.83 (4559.3468 -> 4825.1732); image ~22.56 => clip ~243.27 (~40.5 credits/s at 1080p)
- Balance after direction 1: 4674.83. Projection for all 20 assets: ~2746 remaining (above 2500 floor, monitored per asset).
- Clip specs verified: 1920x1080, 24 fps, 6.04 s, no audio.
- open-image-2 high 2048x1152 still = 22.56 credits each (measured).
- seedance-2.0 i2v 1080p 6s clip ~= 221-243 credits (night 243.27, riso 221.58 measured).
- Balance checkpoints: after dir1 4674.83; after macro stills 4127.25 (macro clip pending then).
- network-1.mp4 / network-2.mp4: 1920x1080, 30 fps, 10.00 s, deterministic seek verified (identical bytes on re-seek), no credit cost (local render).
- AFTER (final): remaining 2846.8056, used 6653.1944; job spend 2116.4076. Above 2500 floor.
