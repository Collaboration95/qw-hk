"""Render slide 4 of a .pptx to PNG using python-pptx geometry + PIL.
No LibreOffice on this Mac; this draws the actual shapes/text with the deck's
fonts, sizes, colours and positions (word-wrap approximated)."""
import sys
from pptx import Presentation
from PIL import Image, ImageDraw, ImageFont

SCALE = 150 / 914400  # px per EMU (150 dpi)
FONT_DIRS = ["/System/Library/Fonts/Supplemental/", "/Library/Fonts/"]

def font_path(name, bold):
    import os
    cands = {
        ("Arial", True): ["Arial Bold.ttf"],
        ("Arial", False): ["Arial.ttf"],
        ("Georgia", True): ["Georgia Bold.ttf"],
        ("Georgia", False): ["Georgia.ttf"],
    }.get((name, bold), [f"{name}.ttf"])
    for d in FONT_DIRS:
        for c in cands:
            p = d + c
            if os.path.exists(p):
                return p
    return None

def wrap(draw, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines

def render(pptx_path, out_path, slide_index=3):
    p = Presentation(pptx_path)
    W = int(p.slide_width * SCALE); H = int(p.slide_height * SCALE)
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    for sh in p.slides[slide_index].shapes:
        x, y = sh.left * SCALE, sh.top * SCALE
        w, h = sh.width * SCALE, sh.height * SCALE
        try:
            if sh.fill.type == 1:
                d.rectangle([x, y, x + w, y + h], fill="#" + str(sh.fill.fore_color.rgb))
        except Exception:
            pass
        if not sh.has_text_frame:
            continue
        ty = y
        for para in sh.text_frame.paragraphs:
            text = "".join(r.text for r in para.runs)
            if not text.strip():
                continue
            r0 = para.runs[0].font
            name = r0.name or "Arial"
            bold = bool(r0.bold)
            pt = (r0.size.pt if r0.size else 18)
            px = int(pt * 150 / 72)
            fp = font_path(name, bold)
            font = ImageFont.truetype(fp, px) if fp else ImageFont.load_default(px)
            try:
                col = "#" + str(r0.color.rgb)
            except Exception:
                col = "#000000"
            lines = wrap(d, text, font, w)
            lh = int(px * 1.25)
            for ln in lines:
                tw = d.textlength(ln, font=font)
                tx = x
                if str(para.alignment) == "RIGHT (3)":
                    tx = x + w - tw
                elif str(para.alignment) == "CENTER (2)":
                    tx = x + (w - tw) / 2
                d.text((tx, ty), ln, font=font, fill=col)
                ty += lh
            ty += int(px * 0.3)
    img.save(out_path)
    print("wrote", out_path, img.size)

if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])