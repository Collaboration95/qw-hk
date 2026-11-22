import json, re, time, urllib.request, html, sys
from pathlib import Path
SITE="https://revisionpedia.geo.hashmeta.tech"
def get(u):
    req=urllib.request.Request(u+("&" if "?" in u else "?")+"v=%d"%time.time(),headers={"User-Agent":"Mozilla/5.0 verify"})
    return urllib.request.urlopen(req,timeout=30).read().decode()
def text(h):
    h=re.sub(r'<(script|style)[^>]*>.*?</\1>','',h,flags=re.S)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).strip()
for i in range(30):
    if 'Your deck updates itself' in get(SITE+"/"): break
    time.sleep(10)
bad=[]; ok=0
for f in sorted(Path('payload3').glob('*.json')):
    d=json.load(open(f)); slug=d['slug']; url=SITE+("/" if slug=="home" else "/"+slug.strip('/')+"/")
    try: live=get(url)
    except Exception as e: bad.append((slug,str(e))); continue
    lt=text(live)
    for b in d['layout']:
        if b.get('containerWidth')=='none': continue
        t=text(b['html'])
        # compare a sample of chunks
        words=t.split(); chunks=[' '.join(words[k:k+8]) for k in range(0,len(words),40)]
        miss=[c for c in chunks if c not in lt]
        if miss: bad.append((slug,miss[:2])); break
    else: ok+=1
print('ok',ok,'bad',len(bad))
for b in bad[:10]: print(b)
