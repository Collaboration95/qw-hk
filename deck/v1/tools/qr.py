# Regenerate the closing QR: PYTHONPATH=<dir with segno> python3 tools/qr.py [url]
import sys, segno
url = sys.argv[1] if len(sys.argv) > 1 else "https://revisionpedia.geo.hashmeta.tech"
segno.make(url, error="m", micro=False).save("src/assets/qr.svg", scale=10, border=0, dark="#272846", light=None)
print("qr ->", url)
p = "src/assets/qr.svg"; s = open(p).read()
import re
w = re.search(r'width="(\d+)"', s).group(1)
s = s.replace(f'width="{w}" height="{w}"', f'viewBox="0 0 {w} {w}"', 1)
open(p, "w").write(s)
