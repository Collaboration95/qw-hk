/* Pack "pan" (carry) · one long panorama, and a camera that glides along it from slide to slide. window.Pack.pan.

   Pack.pan.scene({ width, sky(p), planes: [{ depth, draw(c), live(c), tick(node, t, still, cam, p, view) }], lift, entry, printT })
     width    panorama length at depth 1, px (stops run 0 … width − 1920). Default scene: Pack.pan.country().
     sky(p)   CSS background of the sky behind every plane at journey progress p (0 at x = 0, 1 at the far end),
              so the colour journey follows the camera (dawn → dusk).
     planes   back to front. depth 0 = fixed (the sky), 1 = moves with the camera (the road), > 1 = foreground that
              passes faster. draw(c) returns SVG markup for the plane's still picture, rendered once to an image
              shared by every slide; c = { w, h, m, depth, W, rand, uid } (draw over x −m … w + m, y 0 … h;
              h = 1080 + 260 so a zoom never shows an edge). live(c) returns SVG markup for the plane's moving
              parts (cloned into each slide), tick() moves them on the one clock (still = print / reduced motion).
     skyTop(p) the colour(s) behind the headline zone at p (default: the whole sky): each slide's --ink-auto is
              re-picked from it, because the text sits on the sky, not on --field (inkFromSky: false to keep the engine's)
     lift     how much the camera pulls back mid-glide on long moves (default .06), entry: px the very first arrival
              glides in from (default 700; 0 = none), printT: the clock time print shows (default 14).
   Pack.pan.stop(id, { x, y = 0, zoom = 1 })   the view on slide `id`: x = the left edge at depth 1, y = crane (px,
     + = look lower), zoom ≥ 1 (a dolly in: near planes grow more than far ones). The slide needs nothing else; the
     view (<div class="cy-pan">) is created as its first child and fills it edge to edge, behind the content.
   Pack.pan.country({ field, brand, brand2, sky, ink, width, seed, turbines }) the bundled scene: a road through
     layered country from first light to dusk, its whole palette derived from the deck's --field / --brand / --brand-2
     (or these options). Each slide's --ink-auto is re-picked from its own sky (scene({ inkFromSky: false }) to stop).

   Motion (taste.md §11, the carry exception): content cuts; on a FORWARD step from a slide with a stop the camera
   glides from where it is to the new stop (≤ 1.15 s, smootherstep, depth parallax between planes, a slight pull-back
   on long moves). First arrival (fresh load, or from a slide without a stop): a short establishing move (from
   `entry` px to the left, a little higher and closer, settling onto the stop). Backward, jumps,
   reduced motion and print: the view is simply there. Each slide holds its own view of the panorama, so print shows
   every slide at its own stop; the plane pictures are shared images, so a slide costs a few DOM nodes. */
;(() => {
  const PK = (window.Pack = window.Pack || {})
  if (PK.pan) return
  const VW = 1920, VH = 1080, M = 480, EXTRA = 260, AY = 640
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const smoother = p => p * p * p * (p * (p * 6 - 15) + 10)
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const NS = 'http://www.w3.org/2000/svg'
  /* ---------- colour: parse, contrast, mix in OKLab ---------- */
  const cx0 = document.createElement('canvas').getContext('2d')
  const rgb = s => { if (!s) return null; s = String(s).trim(); cx0.fillStyle = '#010203'; cx0.fillStyle = s; const v = cx0.fillStyle; if (v === '#010203' && !/^#010203$/i.test(s)) return null; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)); const m = v.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  const COLOR_RE = /#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch|oklab|lab|lch|color)a?\([^()]*\)/gi
  const avg = s => { const cs = (String(s || '').match(COLOR_RE) || [s]).map(rgb).filter(Boolean); return cs.length ? [0, 1, 2].map(j => cs.reduce((a, c) => a + c[j], 0) / cs.length) : null }
  const lin = c => (c /= 255) <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
  const lum = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2])
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) }
  const lab = c => { const [r, g, b] = c.map(lin), l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), q = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b); return [.2104542553 * l + .793617785 * m - .0040720468 * q, 1.9779984951 * l - 2.428592205 * m + .4505937099 * q, .0259040371 * l + .7827717662 * m - .808675766 * q] }
  const srgb = c => 255 * (c <= .0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - .055)
  const unlab = ([L, a, b]) => { const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, q = (L - .0894841775 * a - 1.291485548 * b) ** 3; return [4.0767416621 * l - 3.3077115913 * m + .2309699292 * q, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * q, -.0041960863 * l - .7034186147 * m + 1.707614701 * q].map(v => clamp(srgb(Math.max(0, v)), 0, 255)) }
  const mixc = (a, b, t) => { const A = lab(a), B = lab(b); return unlab(A.map((v, i) => v + (B[i] - v) * t)) }
  const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  /* push a colour toward the ink until it reads on the field */
  const guard = (c, field, ink, min = 2.2) => { let t = 0, o = c; while (contrast(o, field) < min && t < 1) { t += .12; o = mixc(c, ink, t) } return o }
  const shift = (c, dL, hue, ck = 1) => { const [L, a, b] = lab(c), h = hue * Math.PI / 180; return unlab([clamp(L + dL, 0, 1), (a * Math.cos(h) - b * Math.sin(h)) * ck, (a * Math.sin(h) + b * Math.cos(h)) * ck]) }
  const chroma = c => { const [, a, b] = lab(c); return Math.hypot(a, b) }
  /* turn a colour's hue part of the way toward a target hue (OKLab degrees: red 30, yellow 100, green 145, blue 265,
     violet 300) along the shorter arc, so a dusk drifts violet from any field instead of turning green from yellow */
  const toward = (c, dL, hue, frac, ck = 1) => { const [, a, b] = lab(c), h = Math.atan2(b, a) * 180 / Math.PI; let d = ((hue - h) % 360 + 540) % 360 - 180; return shift(c, dL, d * frac, ck) }
  let spec = null, B = null, uidN = 0
  const stops = {}, views = {}
  let curId = null, cam = null, glide = null

  function build() {
    if (B) return B
    if (!spec) spec = country()
    spec.prepare?.(document.getElementById(Object.keys(stops)[0]))
    const W = spec.width ?? 9600
    const planes = spec.planes.map((pl, k) => {
      const d = pl.depth, w = Math.round(VW + (W - VW) * d), h = VH + EXTRA
      const c = { w, h, m: M, depth: d, W, k, rand: rng((spec.seed ?? 7) * 1009 + k * 7919) }
      const body = pl.draw ? pl.draw(c) : ''
      const src = body ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="${NS}" width="${w + 2 * M}" height="${h}" viewBox="${-M} 0 ${w + 2 * M} ${h}">${body}</svg>`) : null
      return { pl, d, w, h, c, src }
    })
    return (B = { W, planes, travel: Math.max(1, W - VW) })
  }
  const norm = s => ({ x: s?.x ?? 0, y: s?.y ?? 0, z: Math.max(1, s?.zoom ?? 1) })

  function mount(id) {
    const v = views[id]
    if (v.planes) return v
    const { planes } = build()
    v.sky = document.createElement('div'); v.sky.className = 'cy-pan-sky'; v.root.append(v.sky)
    v.planes = planes.map(P => {
      const el = document.createElement('div')
      el.className = 'cy-pan-plane'; el.style.width = P.w + 2 * M + 'px'; el.style.height = P.h + 'px'
      if (P.src) { const img = document.createElement('img'); img.src = P.src; img.alt = ''; img.width = P.w + 2 * M; img.height = P.h; img.decoding = 'sync'; el.append(img) }
      let live = null
      if (P.pl.live) {
        live = document.createElementNS(NS, 'svg')
        live.setAttribute('width', P.w + 2 * M); live.setAttribute('height', P.h); live.setAttribute('viewBox', `${-M} 0 ${P.w + 2 * M} ${P.h}`)
        live.innerHTML = P.pl.live({ ...P.c, uid: 'cyp' + (++uidN) })
        el.append(live)
      }
      v.root.append(el)
      return { el, d: P.d, live, pl: P.pl }
    })
    /* the text sits on this slide's own sky, not on --field: re-pick --ink-auto from the sky at this stop */
    const p0 = clamp(norm(stops[id]).x / B.travel), sk = spec.skyTop ? spec.skyTop(p0) : spec.sky?.(p0), ink = sk && window.Deck?.inkOn?.(sk)
    if (ink && spec.inkFromSky !== false) v.el.style.setProperty('--ink-auto', ink)
    return v
  }
  function apply(v, c, t, still) {
    const p = clamp(c.x / B.travel), moved = !v.cam || v.cam.x !== c.x || v.cam.y !== c.y || v.cam.z !== c.z
    if (moved) {
      if (spec.sky && (!v.cam || v.p !== p)) v.sky.style.background = spec.sky(p)
      for (const P of v.planes) {
        const s = 1 + (c.z - 1) * P.d, tx = VW / 2 - (c.x * P.d + VW / 2 + M) * s, ty = AY - (c.y * P.d + AY) * s
        P.el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${s.toFixed(5)})`
      }
      v.cam = { ...c }; v.p = p
    }
    for (const P of v.planes) if (P.live && P.pl.tick) P.pl.tick(P.live, t, still, c, p, v)
  }

  const isStep = (el, ctx) => {
    if (ctx.from == null) return false
    const list = [...document.querySelectorAll('section.slide')]
    return list.indexOf(el) === list.indexOf(document.getElementById('s' + ctx.from)) + 1
  }
  const now = () => performance.now() / 1000
  function enter(el, ctx) {
    const id = el.id, v = mount(id), to = norm(stops[id]), step = isStep(el, ctx), prev = step ? stops['s' + ctx.from] : null
    curId = id
    v.root.classList.add('cy-pan-on')
    let from = null
    if (ctx.play && step && prev) from = cam ? { ...cam } : norm(prev)
    else if (ctx.play && (ctx.from == null || step) && (spec.entry ?? 700) > 0)   /* an establishing move: from a little left, higher and closer */
      from = { x: Math.max(-M * .5, to.x - (spec.entry ?? 700)), y: to.y - 70, z: to.z + .1 }
    if (from && (from.x !== to.x || from.y !== to.y || from.z !== to.z)) {
      const dist = Math.abs(to.x - from.x) + Math.abs(to.y - from.y) + Math.abs(to.z - from.z) * 2400
      glide = { id, from, to, t0: now(), dur: clamp(.5 + dist / 3600 * .62, .55, 1.15), lift: (spec.lift ?? .06) * clamp(dist / 3000) }
      cam = { ...from }
    } else { glide = null; cam = { ...to } }
    apply(v, cam, now(), false)
  }
  function at(gl, t) {
    const q = clamp((t - gl.t0) / gl.dur), e = smoother(q), f = gl.from, o = gl.to
    return { x: f.x + (o.x - f.x) * e, y: f.y + (o.y - f.y) * e, z: f.z + (o.z - f.z) * e - gl.lift * Math.sin(Math.PI * e), done: q >= 1 }
  }
  function tick(id, t, still) {
    const v = views[id]
    if (still) { if (Deck.PRINT || Deck.current()?.id === id) { mount(id); apply(v, norm(stops[id]), t, true) } return }
    if (curId !== id || !v.planes) return
    if (glide && glide.id === id) {
      const c = at(glide, Math.max(glide.t0, t))
      if (c.done) { glide = null; cam = { ...norm(stops[id]) } } else cam = { x: c.x, y: c.y, z: c.z }
    }
    apply(v, cam, t, false)
  }
  function stop(id, o = {}) {
    const el = document.getElementById(id)
    if (!el) { console.warn(`pan: no #${id}`); return }
    stops[id] = o
    let root = el.querySelector(':scope>.cy-pan')
    if (!root) { root = document.createElement('div'); root.className = 'cy-pan'; root.setAttribute('aria-hidden', 'true'); el.prepend(root) }
    views[id] = { root, el }
    Deck.on(id, {
      enter: (e, ctx) => enter(e, ctx),
      leave: () => { if (glide?.id === id) { cam = at(glide, now()); glide = null } views[id].root.classList.remove('cy-pan-on') },
      final: () => { mount(id); apply(views[id], norm(stops[id]), spec?.printT ?? 14, true) },
    })
    Deck.clock(root, (t, _, still) => tick(id, t, still), { printT: 14 })
    if (!warmT && !Deck.PRINT) warmT = setTimeout(() => {   /* build the plane pictures early and decode them once */
      (window.requestIdleCallback || (f => setTimeout(f, 0)))(() => { for (const P of build().planes) if (P.src) { const i = new Image(); i.src = P.src; i.decode?.().catch(() => {}) } })
    }, 200)
  }
  let warmT = 0

  /* ================= the bundled scene: a road through layered country, first light → dusk ================= */
  const mix = (a, b, t) => hex(mixc(rgb(a), rgb(b), t))
  const ramp = (st, p) => { let i = 0; while (i < st.length - 2 && p > st[i + 1][0]) i++; const a = st[i], b = st[i + 1], t = clamp((p - a[0]) / (b[0] - a[0])); return a.slice(1).map((c, j) => mix(c, b[j + 1], t)) }
  const noise = R => { const g = new Float32Array(1024); for (let i = 0; i < 1024; i++) g[i] = R(); return x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return g[i & 1023] * (1 - u) + g[(i + 1) & 1023] * u } }
  const fbm = (n, x, oct) => { let s = 0, a = 1, f = 1, t = 0; for (let o = 0; o < oct; o++) { s += a * n(x * f + o * 31.7); t += a; a *= .5; f *= 2.07 } return s / t }
  const f1 = v => v.toFixed(1)
  function ridgePath(c, yf, step = 10) {
    let d = `M${-c.m} ${c.h}`
    for (let x = -c.m; x <= c.w + c.m; x += step) d += `L${x} ${f1(yf(x))}`
    return d + `L${c.w + c.m} ${c.h}Z`
  }
  function ridgeLine(c, yf, step = 10) {
    let d = ''
    for (let x = -c.m; x <= c.w + c.m; x += step) d += (d ? 'L' : 'M') + `${x} ${f1(yf(x))}`
    return d
  }
  const conifer = (x, y, h, w) => `M${f1(x)} ${f1(y - h)}L${f1(x + w * .36)} ${f1(y - h * .52)}L${f1(x + w * .2)} ${f1(y - h * .52)}L${f1(x + w * .5)} ${f1(y - h * .1)}L${f1(x + w * .08)} ${f1(y - h * .1)}L${f1(x + w * .08)} ${f1(y + 2)}L${f1(x - w * .08)} ${f1(y + 2)}L${f1(x - w * .08)} ${f1(y - h * .1)}L${f1(x - w * .5)} ${f1(y - h * .1)}L${f1(x - w * .2)} ${f1(y - h * .52)}L${f1(x - w * .36)} ${f1(y - h * .52)}Z`

  function country(o = {}) {
    const W = o.width ?? 9600
    /* the palette is derived when the scene is built: from o.field / o.brand / o.brand2, else from the first stop's
       section (--field, --brand, --brand-2). The sky keeps the field's own lightness side all the way (a light
       field gives a pastel journey, a dark one a night-blue journey); warm = the livelier of the two brand colours
       lights the horizon, the sun and the windows; the terrain is the field's hue, darkened, in translucent layers
       so each layer picks up the sky behind it. */
    let SKY = null, ink = '#160E3C', K = null
    const prepare = el => {
      if (K) return
      const cs = el ? getComputedStyle(el) : null, v = k => cs?.getPropertyValue(k).trim()
      const F = avg(o.field) || avg(v('--field')) || avg(v('--f0')) || [43, 57, 138]
      const b1 = rgb(o.brand) || rgb(v('--brand')) || [255, 178, 122], b2 = rgb(o.brand2) || rgb(v('--brand-2')) || [255, 210, 122]
      const score = c => chroma(c) + .3 * lab(c)[0], warm = score(b1) >= score(b2) ? b1 : b2
      const dark = lum(F) < .3, Lf = lab(F)[0]
      const keep = c => { const [L, a, b] = lab(c); return unlab([dark ? Math.min(L, Math.max(Lf + .1, .52)) : Math.max(L, Math.min(Lf - .08, .74)), a, b]) }
      const S = (dL, hue, frac, ck) => keep(toward(F, dL, hue, frac, ck))
      const st = [
        [0, S(-.05, 330, .22, 1.05), null, mixc(S(.14, 0, 0, .9), warm, .5)],     /* first light: a little pinker */
        [.3, S(.03, 240, .2, 1.1), S(.08, 240, .14, 1), mixc(S(.18, 0, 0, .8), warm, .32)],   /* morning: a little bluer */
        [.6, S(0, 0, 0, 1), keep(mixc(F, warm, .22)), mixc(S(.12, 0, 0, .9), warm, .62)],   /* golden hour: the field itself */
        [.84, S(-.06, 340, .3, 1.05), null, keep(mixc(F, warm, .78))],   /* sunset */
        [1, S(dark ? -.17 : -.07, 290, .45, .85), S(dark ? -.1 : -.03, 300, .35, .9), mixc(S(-.04, 320, .3, .9), warm, .3)],   /* dusk: toward violet */
      ].map(r => [r[0], r[1], r[2] || keep(mixc(r[1], warm, .2)), r[3]])
      SKY = o.sky ?? st.map(r => [r[0], ...r.slice(1).map(hex)])
      const [Li, ai, bi] = lab(F), inkC = unlab([dark ? .17 : clamp(Li - .5, .22, .45), ai * .8, bi * .8])
      ink = o.ink ?? hex(inkC)
      const duskTop = rgb(SKY[SKY.length - 1][1])
      K = { dark, warm: hex(warm), sun: hex(mixc(warm, [255, 246, 220], .55)), sunLow: hex(mixc(warm, [255, 236, 210], .25)),
        glow: hex(mixc(warm, [255, 244, 214], .6)), win: hex(mixc(warm, [255, 226, 160], .45)), rim: hex(mixc(warm, [255, 255, 255], .55)),
        dash: hex(mixc(warm, [255, 255, 255], .55)), post: hex(mixc([255, 255, 255], F, .1)), band: hex(mixc(warm, [255, 80, 60], .4)),
        sky: dark ? hex(mixc([255, 255, 255], F, .12)) : hex(mixc(inkC, F, .15)), stars: lum(duskTop) < .2 ? .9 : 0, a: dark ? 1 : 1.12 }
    }
    const R0 = rng(o.seed ?? 3), nz = [noise(R0), noise(R0), noise(R0), noise(R0), noise(R0), noise(R0)]
    /* ridge heights per plane (plane coordinates) */
    const farY = x => 585 - 150 * Math.pow(fbm(nz[0], x / 900, 5), 1.6) * 1.9 + 40 * Math.sin(x / 1400)
    const far2Y = x => 560 - 120 * fbm(nz[5], x / 1300 + 9, 4) * 1.6
    const midY = x => 735 - 95 * fbm(nz[1], x / 620, 4) * 1.5 + 18 * Math.sin(x / 520)
    const nearY = x => 812 - 70 * fbm(nz[2], x / 500, 3) * 1.4 + 10 * Math.sin(x / 300)
    const gY = x => 872 + 5 * Math.sin(x / 410) + 3 * Math.sin(x / 133)
    const fgY = x => 1046 - 30 * Math.pow(fbm(nz[3], x / 160, 3), 2) * 2.2
    const A = (a) => `fill="${ink}" fill-opacity="${Math.min(.97, a * K.a).toFixed(3)}"`
    const turbines = o.turbines ?? [1170, 1320, 3290, 3450, 3640, 5330, 5490]
    return {
      width: W, seed: o.seed ?? 3, lift: .06, entry: 700, printT: 14, prepare,
      sky: p => { const [a, b, c] = ramp(SKY, p); return `linear-gradient(180deg,${a} 0%,${b} 42%,${c} 74%,${c} 100%)` },
      skyTop: p => { const [a, b] = ramp(SKY, p); return `${a} ${a} ${b}` },   /* what the headline zone sits on */
      planes: [
        { /* the sky's own furniture: stars that come out at dusk, the sun arcing across the whole journey, a rare meteor */
          depth: 0,
          live: c => {
            const R = rng(91), st = []
            for (let i = 0; i < 130; i++) { const x = R() * 1920, y = Math.pow(R(), 1.4) * 620, r = .6 + R() * R() * 1.6; st.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r.toFixed(2)}"${i < 14 ? ` class="tw" data-k="${(R() * 6.3).toFixed(2)}"` : ''}/>`) }
            return `<defs><radialGradient id="${c.uid}g"><stop offset="0" stop-color="${K.glow}" stop-opacity=".75"/><stop offset=".18" stop-color="${K.glow}" stop-opacity=".32"/><stop offset="1" stop-color="${K.warm}" stop-opacity="0"/></radialGradient>
              <linearGradient id="${c.uid}m" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient></defs>
              <g class="stars" fill="#fff" opacity="0">${st.join('')}</g>
              <line class="met" x1="0" y1="0" x2="160" y2="0" stroke="url(#${c.uid}m)" stroke-width="2" stroke-linecap="round" opacity="0"/>
              <g class="sun"><circle r="380" fill="url(#${c.uid}g)"/><circle class="disc" r="44" fill="${K.sun}"/></g>`
          },
          tick(node, t, still, cam, p) {
            const S = node.__s || (node.__s = { stars: node.querySelector('.stars'), tw: [...node.querySelectorAll('.tw')], sun: node.querySelector('.sun'), disc: node.querySelector('.disc'), met: node.querySelector('.met'), p: -1 })
            if (S.p !== p) {
              S.p = p
              /* the sun arcs across the whole journey: a glow behind the hills at first light, a disc by mid-morning,
                 back to a glow at dusk (the hills are translucent, so a low disc would ghost through them) */
              const h = Math.sin(Math.PI * clamp(p * 1.02)), sx = 1300 + 460 * p, sy = 740 - 490 * h
              S.sun.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) scale(${(1.25 - .35 * h).toFixed(3)})`)
              S.disc.setAttribute('fill', mix(K.sunLow, K.sun, clamp(h * 1.4)))
              S.disc.setAttribute('opacity', sstep(.5, .78, h).toFixed(3))
              S.stars.setAttribute('opacity', (sstep(.7, .96, p) * K.stars).toFixed(3))
            }
            if (p > .7) {
              for (const s of S.tw) s.setAttribute('opacity', (.35 + .65 * Math.abs(Math.sin(t * 1.3 + +s.dataset.k))).toFixed(2))
              const m = still ? 9 : (t % 23) / .7   /* a meteor once every 23 s, high on the right, gone in .7 s */
              if (m < 1) S.met.setAttribute('transform', `translate(${f1(1300 + m * 420)} ${f1(120 + m * 130)}) rotate(17)`)
              S.met.setAttribute('opacity', m < 1 ? (Math.sin(Math.PI * m) * sstep(.8, .95, p)).toFixed(2) : 0)
            }
          },
        },
        { /* clouds: soft, slow, drifting on the one clock */
          depth: .07,
          live: c => {
            const R = rng(17), cl = []
            for (let i = 0; i < 16; i++) {
              const x = -c.m + R() * (c.w + 2 * c.m), y = 270 + R() * 220, s = .6 + R() * .9, puffs = []
              for (let j = 0; j < 5; j++) puffs.push(`<ellipse cx="${f1((j - 2) * 58 * s + (R() - .5) * 30)}" cy="${f1(-Math.sin(j / 4 * Math.PI) * 26 * s + R() * 10)}" rx="${f1((70 + R() * 50) * s)}" ry="${f1((26 + R() * 18) * s)}"/>`)
              cl.push(`<g data-x="${f1(x)}" data-y="${f1(y)}" data-v="${(3 + R() * 5).toFixed(2)}" opacity="${(.14 + R() * .14).toFixed(2)}">${puffs.join('')}</g>`)
            }
            return `<defs><radialGradient id="${c.uid}c"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><g fill="url(#${c.uid}c)">${cl.join('')}</g>`
          },
          tick(node, t) {
            const L = node.__c || (node.__c = [...node.querySelectorAll('g[data-x]')].map(g => ({ g, x: +g.dataset.x, y: +g.dataset.y, v: +g.dataset.v })))
            const span = node.viewBox.baseVal.width, x0 = node.viewBox.baseVal.x
            for (const k of L) k.g.setAttribute('transform', `translate(${f1(x0 + ((k.x - x0 + t * k.v) % span + span) % span)} ${k.y})`)
          },
        },
        { /* the far ranges, fading into haze */
          depth: .14,
          draw: c => `<path d="${ridgePath(c, far2Y, 14)}" ${A(.09)}/><path d="${ridgePath(c, farY, 8)}" ${A(.15)}/>
            <path d="${ridgeLine(c, farY, 8)}" fill="none" stroke="${K.rim}" stroke-opacity=".2" stroke-width="1.6"/>`,
        },
        { /* mist, then the rolling mid hills with their small groves */
          depth: .3,
          draw: c => {
            const R = c.rand, trees = []
            for (let x = -c.m; x < c.w + c.m; x += 5 + R() * 9) if (fbm(nz[4], x / 700, 2) > .56) trees.push(conifer(x, midY(x) + 4, 11 + R() * 11, 8 + R() * 5))
            return `<defs><linearGradient id="mi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFEFE4" stop-opacity="0"/><stop offset=".5" stop-color="#FFEFE4" stop-opacity=".2"/><stop offset="1" stop-color="#FFEFE4" stop-opacity="0"/></linearGradient></defs>
              <rect x="${-c.m}" y="600" width="${c.w + 2 * c.m}" height="190" fill="url(#mi)"/>
              <path d="${ridgePath(c, midY)}" ${A(.27)}/><path d="${trees.join('')}" ${A(.27)}/>`
          },
        },
        { /* the near hills: groves of conifers and a few wind turbines (rotors in live) */
          depth: .55,
          draw: c => {
            const R = c.rand, trees = []
            for (let x = -c.m; x < c.w + c.m; x += 9 + R() * 16) if (fbm(nz[4], x / 520 + 40, 2) > .57) trees.push(conifer(x, nearY(x) + 5, 24 + R() * 30, 15 + R() * 9))
            const masts = turbines.map((x, i) => { const y = nearY(x) + 2, hh = 150 + (i % 3) * 22; return `M${x - 3.2} ${y}L${x - 1.4} ${y - hh}L${x + 1.4} ${y - hh}L${x + 3.2} ${y}Z` }).join('')
            return `<path d="${ridgePath(c, nearY)}" ${A(.44)}/><path d="${trees.join('')}" ${A(.44)}/><path d="${masts}" fill="${K.sky}" fill-opacity=".6"/>`
          },
          live: () => turbines.map((x, i) => {
            const y = nearY(x) + 2 - (150 + (i % 3) * 22), b = 'M0 0C4.5-8 3.5-44 0-74C-2-44-3.5-8 0 0Z'
            return `<g transform="translate(${x} ${f1(y)})"><g class="rot" data-v="${i === 4 ? 31 : 52 + (i * 7) % 15}" data-o="${i * 47}" fill="${K.sky}" fill-opacity=".75"><path d="${b}"/><path d="${b}" transform="rotate(120)"/><path d="${b}" transform="rotate(240)"/></g><circle r="4.2" fill="${K.sky}" fill-opacity=".85"/></g>`
          }).join(''),
          tick(node, t) {   /* one turbine turns slower than the others */
            const L = node.__r || (node.__r = [...node.querySelectorAll('.rot')])
            for (const g of L) g.setAttribute('transform', `rotate(${((t * +g.dataset.v + +g.dataset.o) % 360).toFixed(1)})`)
          },
        },
        { /* the road plane: ground, road, dashes, milestones, telegraph poles and sagging wires, three landmarks */
          depth: 1,
          draw: c => {
            const R = c.rand, poles = [], wires = [], posts = [], birds = []
            const P0 = 160, PS = 620
            for (let x = P0 - PS; x < c.w + c.m; x += PS) {
              const y = gY(x) + 6
              poles.push(`M${x - 3.5} ${y}L${x - 2.5} ${y - 278}L${x + 2.5} ${y - 278}L${x + 3.5} ${y}Z M${x - 34} ${y - 262}h68v6h-68Z`)
              for (const dx of [-28, 28]) {
                const x1 = x + dx, x2 = x + PS + dx, yy = y - 258, sag = 34
                wires.push(`M${x1} ${yy}Q${f1((x1 + x2) / 2)} ${yy + sag * 2} ${x2} ${yy}`)
                if (R() < .35) { const u = .2 + R() * .6, bx = x1 + (x2 - x1) * u, by = yy + sag * 2 * 2 * u * (1 - u) * 1 - 1; birds.push(`<ellipse cx="${f1(bx)}" cy="${f1(by - 5)}" rx="5" ry="4.2"/><circle cx="${f1(bx + 4)}" cy="${f1(by - 9)}" r="2.8"/><path d="M${f1(bx - 4)} ${f1(by - 4)}l-7 5 1 1z"/>`) }
              }
            }
            for (let x = 80; x < c.w + c.m; x += 960) posts.push(`<rect x="${x}" y="${f1(gY(x) + 8)}" width="9" height="26" rx="2" fill="${K.post}" fill-opacity=".8"/><rect x="${x}" y="${f1(gY(x) + 12)}" width="9" height="5" fill="${K.band}" fill-opacity=".9"/>`)
            const dash = []
            for (let x = -c.m; x < c.w + c.m; x += 100) dash.push(`M${x} 933h46v4h-46Z`)
            /* landmarks: an oak by the road (first light), a farmhouse with a smoking chimney (golden hour), a barn and silo (dusk) */
            const oak = (x, y) => `<path d="M${x - 7} ${y}L${x - 5} ${y - 70}L${x + 5} ${y - 70}L${x + 8} ${y}Z" ${A(.9)}/><g ${A(.9)}>${[[0, -120, 70], [-52, -96, 48], [50, -98, 52], [-20, -150, 46], [26, -146, 44], [0, -80, 40]].map(([a, b, r]) => `<circle cx="${x + a}" cy="${y + b}" r="${r}"/>`).join('')}</g>`
            const house = (x, y) => `<g ${A(.92)}><path d="M${x} ${y}V${y - 82}L${x + 76} ${y - 132}L${x + 152} ${y - 82}V${y}Z"/><rect x="${x + 104}" y="${y - 140}" width="16" height="40"/></g>
              <rect x="${x + 24}" y="${y - 62}" width="26" height="24" rx="2" fill="${K.win}" fill-opacity=".92"/><rect x="${x + 100}" y="${y - 62}" width="26" height="24" rx="2" fill="${K.win}" fill-opacity=".35"/>`
            const barn = (x, y) => `<g ${A(.94)}><path d="M${x} ${y}V${y - 96}L${x + 40} ${y - 140}H${x + 150}L${x + 190} ${y - 96}V${y}Z"/><path d="M${x + 210} ${y}V${y - 170}Q${x + 238} ${y - 196} ${x + 266} ${y - 170}V${y}Z"/></g>
              <rect x="${x + 36}" y="${y - 74}" width="24" height="22" rx="2" fill="${K.win}" fill-opacity=".9"/>`
            return `<path d="${ridgePath(c, gY, 16)}" ${A(.74)}/>
              <rect x="${-c.m}" y="908" width="${c.w + 2 * c.m}" height="54" fill="#fff" fill-opacity=".055"/>
              <rect x="${-c.m}" y="906" width="${c.w + 2 * c.m}" height="2.5" fill="${K.dash}" fill-opacity=".24"/>
              <rect x="${-c.m}" y="961" width="${c.w + 2 * c.m}" height="2" fill="${K.dash}" fill-opacity=".12"/>
              <path d="${dash.join('')}" fill="${K.dash}" fill-opacity=".55"/>
              ${oak(1560, gY(1560) + 2)}${house(5230, gY(5230) + 2)}${barn(8960, gY(8960) + 2)}
              <path d="${poles.join('')}" ${A(.95)}/><path d="${wires.join('')}" fill="none" stroke="${ink}" stroke-opacity=".7" stroke-width="1.6"/>
              <g ${A(.95)}>${birds.join('')}</g>${posts.join('')}`
          },
          live: c => {
            const puffs = Array.from({ length: 7 }, (_, k) => `<circle data-k="${k}" r="8"/>`).join('')
            return `<defs><radialGradient id="${c.uid}s"><stop offset="0" stop-color="#F6EEFF"/><stop offset=".6" stop-color="#F6EEFF" stop-opacity=".6"/><stop offset="1" stop-color="#F6EEFF" stop-opacity="0"/></radialGradient></defs>
              <g class="smoke" fill="url(#${c.uid}s)" transform="translate(5342 ${f1(gY(5230) + 2 - 142)})">${puffs}</g>
              <rect class="late" x="${8960 + 128}" y="${f1(gY(8960) + 2 - 74)}" width="24" height="22" rx="2" fill="${K.win}" opacity="0"/>`
          },
          tick(node, t, still) {
            const S = node.__s || (node.__s = { p: [...node.querySelectorAll('.smoke circle')], late: node.querySelector('.late') })
            for (const c of S.p) {   /* chimney smoke: each puff grows, drifts with the wind and thins as it rises */
              const f = ((t * .16 + +c.dataset.k / S.p.length) % 1 + 1) % 1
              c.setAttribute('cx', f1(f * 70 + Math.sin(f * 6 + +c.dataset.k) * 7)); c.setAttribute('cy', f1(-f * 170))
              c.setAttribute('r', f1(10 + f * 34)); c.setAttribute('opacity', (.5 * Math.pow(1 - f, 1.5) * Math.min(1, f * 7)).toFixed(3))
            }
            S.late.setAttribute('opacity', (sstep(6, 8, still ? 14 : t) * .9).toFixed(2))   /* one barn window lights late */
          },
        },
        { /* the foreground: grass and bushes that sweep past fastest */
          depth: 1.4,
          draw: c => {
            const R = c.rand, bush = []
            let d = `M${-c.m} ${c.h}`
            for (let x = -c.m; x <= c.w + c.m; x += 7) d += `L${x} ${f1(fgY(x) - (R() < .3 ? 6 + R() * 16 : R() * 5))}`
            d += `L${c.w + c.m} ${c.h}Z`
            for (let x = -c.m + 200; x < c.w + c.m; x += 500 + R() * 900) { const y = fgY(x) + 8, s = .7 + R() * .8; bush.push([[0, 0, 46], [-40, 12, 34], [42, 10, 36], [12, -26, 32]].map(([a, b, r]) => `<circle cx="${f1(x + a * s)}" cy="${f1(y + b * s)}" r="${f1(r * s)}"/>`).join('')) }
            return `<g ${A(.9)}><path d="${d}"/>${bush.join('')}</g>`
          },
        },
      ],
    }
  }

  PK.pan = {
    scene(o) { if (!spec) spec = o },
    stop, country,
    get width() { return build().W },
  }
})()
