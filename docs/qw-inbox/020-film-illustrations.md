# 020 · Illustrations and motion variants for the Recall Press films

Work only inside this project folder. Create `docs/qw-outbox/020-film-illustrations/CLAIMED` first. Save everything
under `docs/qw-outbox/020-film-illustrations/` (media in `media/`). Do not delete, commit, push or publish anything.

## What the films are about
Recall Press keeps a published deck current. A briefing slide says "Manufacturing stalled year on year in Q3 2025"
(true on 14 Oct 2025, official figure 0.0%). The figure is revised to 5.0%, later 4.6%. The slide is now wrong; a board
paper that quotes "the October estimate" is still true. Recall Press rewrites the slide, the editor approves, and the
deck is updated. Line: "Your sources change. Your deck updates itself."

Look: warm off-white paper (#FAF8F4), ink #111110, one accent red #C93A1B used only for the moment something changes.
Magazine, not website: bold crops, big shapes, things that bleed off the frame, strong light. **No people, no faces,
no hands.** **No legible words or numbers inside generated images** (they come out garbled; we add type ourselves). No
logos.

## Before you start
List every media model you can use in this session (image, video, speech/voice, music), with limits and cost per
second or per image. Read the Credit Balance before and after; write both in the report.

## Part 1 · Film A illustrations, four art directions (more drastic than before)
The film already uses `qwenwork-out/08-media/recall-press-opening-14s.mp4` (a report open on a desk under a lamp).
The owner likes it; go further. For each direction make **2 stills (1920×1080)** and **1 clip (6 s, 1080p, slow
deliberate camera move)**:
1. **Night still life**: a printed bar chart on a desk, hard low raking light, deep shadow, one bar glowing red.
2. **Paper collage / risograph**: cut-paper bars and torn paper, halftone grain, only black, off-white and red.
3. **Extreme macro print**: ink on paper, a red pencil line striking through a printed line (no readable text).
4. **Industrial dusk**: a semiconductor-fab or factory interior or port cranes at blue hour, cinematic, no people;
   for "manufacturing".

## Part 2 · Film B, "the change travels through the files"
Film B is about **files, not people**: one source document is connected to the documents that cite it, and those
connect to more documents. When the source changes colour, the change **races along the connections** and each
connected document changes colour in turn. Make **4 clips (6 s, 1080p)** and **1 still each (1920×1080)**, one per look:
1. **Pinboard**: paper documents pinned on a dark board, joined by thread; a light pulse runs along the threads, each
   paper turns from grey to warm red as it arrives.
2. **Flat graphic, top-down**: minimal off-white document shapes on warm white, thin ink lines between them; a red
   pulse spreads outward through the network.
3. **Clay / isometric**: soft clay file icons on a grid joined by tubes; a colour wave travels through them.
4. **Glass in the dark**: luminous document cards floating in dark space, linked by light; the change ripples out.

## Part 3 · Two coded motion designs of the same idea (Qwen4-Max)
Write two self-contained HTML files, `network-1.html` and `network-2.html` (1920×1080, 10 s, Inter or system sans,
the colours above). One source file node in the middle-left; 5–7 document nodes linked to it (members' briefing .pptx,
board paper .docx, client note .pptx, investor update .docx, internal memo .md, newsletter .docx), some linked to each
other. At 2 s the source turns red; pulses race along each link with slight different speeds; each document flips to
red ("now wrong") on arrival, then settles to ink with a small check ("updated") one by one; the last 2 s hold the
whole network updated. Make the two designs clearly different (e.g. a tidy column layout vs an organic web). Each file
must expose `window.seek(seconds)` that draws the exact state at that time (no real-time clock), and play normally on
open. Then render each to `media/network-1.mp4`, `network-2.mp4` (playwright or a browser screenshot loop + ffmpeg,
30 fps) if you can; otherwise say so.

## Part 4 · Review your own outputs
Make `contact-sheet.png` (every still and the middle frame of every clip, labelled by part and number). Then rank, in
REPORT.md, the best two for Part 1 and the best two for Part 2 with one line why, and anything that came out wrong
(garbled text, people, ugly artefacts).

## Budget
Stop generating if the Credit Balance falls below 2,500. If a model fails, retry once, then use the other model.
Write `REPORT.md` (models, prompts, cost per asset, files, ranking, failures), then create `DONE`.
