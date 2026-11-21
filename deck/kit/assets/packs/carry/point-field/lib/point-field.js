/* Pack "point-field" (carry) · the product's real data points as one field that rearranges into every slide's figure.
   Generalised from the hr-2026 v4 point field (the user's pick). window.Pack['point-field'], short name PF below.

   PF.config({ points, n, palette, home, seed, dur, spread, stragglers, curl, breathe, sweep, dust })   optional, once
     points   [{u, v, k, w}] (u, v in 0…1, v down) or [{x, y, k, w}] / [[x, y, k, w]] (any range, y up; fitted
              into `home` keeping aspect). k = category (palette index), w = any value. Default: 3,000 synthetic
              records in five clusters (replace them with the product's own rows: a JSON in src/lib/ → window.DATA).
     palette  colours by index (o.c). Default (null): derived per slide from the section's --brand, --brand-2,
              --ink-auto and --field: [0 ink tint (the majority), 1 brand, 2 brand-2, 3 their mix, 4 brand→ink,
              5 ink], each pushed toward the ink until it reads on the field. PF.palette(id) returns it.
     home     {x, y, w, h}: the box the data's own (u, v) layout fills.
   PF.slide(id, { place(p, o, i), under(g, P, t), over(g, P, t), breathe, sweep })   one per field slide
     place() sets o.x, o.y (stage px), o.r (radius), o.a (alpha), o.c (palette index), o.d (delay s, ≤ .3) for
     point p (p = { i, u, v, k, w, h, h2, h3, d: the source row }). Defaults: the point's home, faint dust.
     under/over draw on the same canvas below/above the points; P = arrival progress 0…1 (1 at rest and in print).
     The canvas (<canvas class="cy-pf">) is created as the slide's first child if the slide has none.
   PF.fill(fig, { r, a, c, d, order, only, pick, spare, style }) → a place() that pours points into a figure's slots.
     r, a, c: number or (p, g, s) => value (g = the slot's group: bar, letter, ring part). r defaults to .42 × the
     figure's pitch (dots never merge, whatever the name's length). c defaults to p.k, so
     every point keeps its category colour from slide to slide. d: 'random' (default) | 'wave-x' | 'wave-y' |
     'center' | number | fn. order: 'near' (default: Hilbert order, the cloud flows into the shape) | 'x' | 'y' |
     'angle' | 'random' | 'data'. only(p) → false keeps p out; pick(p) → lower goes first; spare: 'dust' | 'hide' | 'sink'.
   PF.fig.*  figures (slot lists, computed lazily, cached):
     scatter({ box })                     every point at its own data position (the data as it is)
     grid({ x, y, cols, rows, pitch })    a block of dots, row by row from the top-left
     layers({ cx, cy, w, count, gap, tilt, of(p) → sheet }) oblique sheets stacked bottom-up; fig.sheet(g, k) traces one
     bars({ x, y, values, cols, pitch, gap, rows })   dot columns standing on baseline y; fig.geo() → [{x, top, n}]
     histogram({ x, y, of(p) → bin, bins, cols, pitch, gap, rows, sort })  each point stacks into its own bin
     text(str, { box: {x, y, w, h}, size (max), weight, font, wrap, count (max) | pitch, minPitch })  the name in dots,
                                          fitted to the box: 1 to 12+ characters, spaces, "&"; wraps to two lines
                                          when that reads bigger; g = letter index; fig.layout() → lines, size, box
     mark(svgOrMarkup, { box, markStroke })  the product's mark (stroke paths in a 24 × 24 viewBox, __MARK__)
     lockup(svgOrMarkup, str, { box, … })    mark + name side by side, fitted; g = 0 mark, 1 + letter index name
     shape(draw(g), { box, count | pitch })  any canvas drawing (a Path2D of the product's mark) sampled into dots
     polygon([[x, y], …], { count | pitch })   ring({ cx, cy, r, thick, parts: [.5, .3, .2], pitch, gapDeg })
   PF.points() · PF.refresh() (after data or fonts change) · PF.palette · PF.hash(i)

   Motion (references/taste.md §11, the carry exception): content cuts; on a FORWARD step from the previous slide
   every point travels from where it is to its new place on a slightly curved path: eased, staggered by o.d, a few
   stragglers land last, all done by 1.2 s. First arrival (fresh load, or coming from a slide without the field):
   the points condense out of their own faint data cloud. Backward, jumps (0–9, Home/End), reduced motion and
   print: drawn straight in the final state. Ambient life on Deck.clock: a faint breathing jitter (each point drifts
   ≤ 1 px and pulses its radius out of step) and an optional sweep (a band of light that passes once every `every`
   seconds, catching only the points). One canvas per slide at 1920 × 1080; only the showing one holds a backing store. */
;(() => {
  const PK = (window.Pack = window.Pack || {})
  if (PK['point-field']) return
  const TAU = Math.PI * 2, VW = 1920, VH = 1080, END = 1.2
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const hash = i => { let x = Math.imul(i ^ 0x9E3779B9, 0x85EBCA6B); x ^= x >>> 13; x = Math.imul(x, 0xC2B2AE35); x ^= x >>> 16; return (x >>> 0) / 4294967296 }
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const gauss = R => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()) }
  const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
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
  const palettes = {}
  function paletteOf(id) {
    if (cfg.palette) return cfg.palette
    const P = palettes[id]
    if (P && P.ver === version) return P.c
    const el = document.getElementById(id), cs = el ? getComputedStyle(el) : null, v = k => cs?.getPropertyValue(k).trim()
    const field = avg(v('--field')) || avg(v('--f0')) || [27, 51, 102]
    const ink = rgb(v('--ink-auto')) || rgb(window.Deck?.inkOn?.(hex(field))) || (lum(field) < .18 ? [255, 255, 255] : [20, 22, 30])
    const brand = rgb(v('--brand')) || [255, 138, 76], brand2 = rgb(v('--brand-2')) || [126, 240, 181]
    const g = c => hex(guard(c, field, ink))
    const c = [g(mixc(ink, field, .22)), g(brand), g(brand2), g(mixc(brand, brand2, .5)), g(mixc(brand, ink, .45)), hex(ink)]
    c.sweep = lum(field) < .3 ? '#FFFFFF' : g(mixc(brand2, ink, .2))
    palettes[id] = { ver: version, c }
    return c
  }
  const easeSoft = p => -(Math.cos(Math.PI * p) - 1) / 2
  const easeOut = p => 1 - Math.pow(1 - p, 3)   /* first arrival: the cloud condenses at once, then settles */

  const cfg = {
    n: 3000, points: null, seed: 11,
    palette: null,   /* null: derived per slide from --brand, --brand-2, --ink-auto and --field (see paletteOf) */
    home: { x: 70, y: 90, w: 1780, h: 900 },
    dur: .8, spread: .26, stragglers: .03, curl: .16,
    breathe: { amp: .75, rate: .28, pulse: .07 },
    sweep: null,
    dust: { r: 1.5, a: .13 },
  }
  let version = 0, PTS = null

  /* ---------- the points ---------- */
  function synth(n, R) {
    /* five overlapping clusters along a soft arc (an embedding of records), 46/24/15/9/6 %, plus loose outliers */
    const C = [[.27, .56, .12, .085, -.5, .46], [.52, .40, .095, .07, .4, .24], [.70, .63, .075, .06, -.2, .15], [.44, .76, .06, .045, .9, .09], [.85, .37, .05, .04, 0, .06]]
    const out = []
    for (let i = 0; i < n; i++) {
      let r = R(), k = 0
      while (k < C.length - 1 && r > C[k][5]) { r -= C[k][5]; k++ }
      const [cx, cy, sx, sy, th] = C[k], loose = R() < .05
      let u, v
      do {
        const a = gauss(R) * sx * (loose ? 2.4 : 1), b = gauss(R) * sy * (loose ? 2.4 : 1)
        u = cx + a * Math.cos(th) - b * Math.sin(th); v = cy + a * Math.sin(th) + b * Math.cos(th)
      } while (u < .02 || u > .98 || v < .03 || v > .97)
      out.push({ u, v, k, w: Math.exp(gauss(R) * .6) })
    }
    return out
  }
  function points() {
    if (PTS) return PTS
    const R = rng(cfg.seed)
    const raw = (cfg.points || synth(cfg.n, R)).map(q => Array.isArray(q) ? { x: q[0], y: q[1], k: q[2], w: q[3] } : q)
    const uv = raw.every(q => q.u != null && q.v != null)
    let fit = null
    if (!uv) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (const q of raw) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y) }
      const hb = cfg.home, s = Math.min(hb.w / (x1 - x0 || 1), hb.h / (y1 - y0 || 1))
      fit = q => [.5 + (q.x - (x0 + x1) / 2) * s / hb.w, .5 - (q.y - (y0 + y1) / 2) * s / hb.h]
    }
    PTS = raw.map((q, i) => {
      const [u, v] = uv ? [+q.u, +q.v] : fit(q)
      return { i, u, v, k: q.k | 0, w: q.w ?? 1, h: hash(i + 1), h2: hash(i + 9001), h3: hash(i + 31337), d: q }
    })
    alloc(PTS.length)
    return PTS
  }
  const homeX = p => cfg.home.x + p.u * cfg.home.w, homeY = p => cfg.home.y + p.v * cfg.home.h

  /* ---------- live state: where every point is now (base, without the ambient jitter) ---------- */
  let N = 0, X, Y, R_, A, K, SX, SY, SR, SA, SK
  function alloc(n) {
    N = n
    X = new Float32Array(n); Y = new Float32Array(n); R_ = new Float32Array(n); A = new Float32Array(n); K = new Uint8Array(n)
    SX = new Float32Array(n); SY = new Float32Array(n); SR = new Float32Array(n); SA = new Float32Array(n); SK = new Uint8Array(n)
  }
  function seedState() {   /* the faint data cloud the field condenses out of on a first arrival */
    const P = points()
    for (let i = 0; i < N; i++) { const p = P[i]; X[i] = homeX(p); Y[i] = homeY(p); R_[i] = cfg.dust.r; A[i] = cfg.dust.a; K[i] = p.k }
  }

  /* ---------- per-slide targets ---------- */
  const layouts = {}, cache = {}, canvases = {}
  function targets(id) {
    const c = cache[id]
    if (c && c.ver === version) return c
    const L = layouts[id], P = points(), n = P.length, o = {}
    const T = { ver: version, x: new Float32Array(n), y: new Float32Array(n), r: new Float32Array(n), a: new Float32Array(n), c: new Uint8Array(n),
      d: new Float32Array(n), u: new Float32Array(n), cv: new Float32Array(n), soft: new Uint8Array(n) }
    const nc = (cfg.palette || paletteOf(id)).length
    for (let i = 0; i < n; i++) {
      const p = P[i]
      o.x = homeX(p); o.y = homeY(p); o.r = cfg.dust.r; o.a = cfg.dust.a; o.c = p.k; o.d = p.h * cfg.spread
      L.place(p, o, i)
      T.x[i] = o.x; T.y[i] = o.y; T.r[i] = Math.max(0, o.r); T.a[i] = clamp(o.a); T.c[i] = ((o.c | 0) % nc + nc) % nc
      let d = clamp(+o.d || 0, 0, .3), du = cfg.dur * (.88 + .16 * p.h3)
      if (p.h2 < cfg.stragglers) { d = .3 + p.h3 * .1; du = END - d; T.soft[i] = 1 }   /* a few stragglers land last */
      T.d[i] = d; T.u[i] = Math.min(du, END - d)
      T.cv[i] = (p.h3 - .5) * 2 * cfg.curl
    }
    return (cache[id] = T)
  }

  /* ---------- paint ---------- */
  const buckets = new Map(), glow = new Map()
  const bucket = (m, key) => { let b = m.get(key); if (!b) m.set(key, b = []); return b }
  let JX = null, JY = null, JR = null
  function paint(id, s, t, still) {
    const cv = canvases[id], L = layouts[id]
    if (!cv || !L) return
    if (cv.width !== VW) { cv.width = VW; cv.height = VH }
    const g = cv.getContext('2d'), T = targets(id), Pl = paletteOf(id)
    if (!JX || JX.length !== N) { JX = new Float32Array(N); JY = new Float32Array(N); JR = new Float32Array(N) }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, VW, VH)
    const rest = s === Infinity, P = rest ? 1 : clamp(s / END)
    L.under?.(g, P, t)
    const br = still ? null : (L.breathe === undefined ? cfg.breathe : L.breathe)
    buckets.forEach(b => { b.length = 0 })
    for (let i = 0; i < N; i++) {
      let x, y, r, a, c
      if (rest) { x = T.x[i]; y = T.y[i]; r = T.r[i]; a = T.a[i]; c = T.c[i] }
      else {
        const q = clamp((s - T.d[i]) / T.u[i]), e = T.soft[i] ? easeSoft(q) : condense ? easeOut(q) : ease(q)
        const dx = T.x[i] - SX[i], dy = T.y[i] - SY[i], bow = T.cv[i] * Math.sin(Math.PI * e)
        x = SX[i] + dx * e - dy * bow; y = SY[i] + dy * e + dx * bow
        r = SR[i] + (T.r[i] - SR[i]) * e; a = SA[i] + (T.a[i] - SA[i]) * e; c = e < .5 ? SK[i] : T.c[i]
      }
      X[i] = x; Y[i] = y; R_[i] = r; A[i] = a; K[i] = c
      if (br) {
        const p = PTS[i], w = br.rate * TAU * (.6 + .8 * p.h3)
        x += br.amp * Math.sin(t * w + p.h * TAU); y += br.amp * Math.cos(t * w * .83 + p.h2 * TAU)
        r *= 1 + br.pulse * Math.sin(t * w * .7 + p.h3 * TAU)
      }
      JX[i] = x; JY[i] = y; JR[i] = r
      if (a < .02 || r <= .15 || x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue
      bucket(buckets, c * 32 + Math.round(a * 31)).push(i)
    }
    buckets.forEach((b, key) => {
      if (!b.length) return
      g.globalAlpha = (key & 31) / 31; g.fillStyle = Pl[key >> 5]; g.beginPath()
      for (const i of b) { g.moveTo(JX[i] + JR[i], JY[i]); g.arc(JX[i], JY[i], JR[i], 0, TAU) }
      g.fill()
    })
    /* the sweep: a band of light that passes once every `every` s, catching the points (not the field) */
    const sw = still ? null : (L.sweep === undefined ? cfg.sweep : L.sweep)
    if (sw) {
      const every = sw.every ?? 9, dur = sw.dur ?? 1.8, tau = ((t + (sw.phase ?? 0)) % every + every) % every
      if (tau < dur) {
        const th = (sw.angle ?? 14) * Math.PI / 180, ca = Math.cos(th), sa = Math.sin(th), wd = sw.width ?? 150
        const s0 = Math.min(0, VH * sa) - wd * 2, s1 = VW * ca + Math.max(0, VH * sa) + wd * 2
        const cpos = s0 + (s1 - s0) * easeSoft(tau / dur), gain = sw.gain ?? .85
        glow.forEach(b => { b.length = 0 })
        for (let i = 0; i < N; i++) {
          if (A[i] < .02) continue
          const z = (JX[i] * ca + JY[i] * sa - cpos) / wd
          if (z < -2.2 || z > 2.2) continue
          const I = Math.exp(-z * z) * gain * Math.sqrt(A[i])
          if (I > .04) bucket(glow, Math.round(I * 12)).push(i)
        }
        g.fillStyle = sw.color ?? Pl.sweep ?? '#FFFFFF'
        glow.forEach((b, lv) => {
          if (!b.length) return
          g.globalAlpha = Math.min(1, lv / 12); g.beginPath()
          const k = 1 + .35 * lv / 12
          for (const i of b) { const r = JR[i] * k; g.moveTo(JX[i] + r, JY[i]); g.arc(JX[i], JY[i], r, 0, TAU) }
          g.fill()
        })
      }
    }
    g.globalAlpha = 1
    L.over?.(g, P, t)
  }

  /* ---------- navigation ---------- */
  let curId = null, T0 = -1, dirty = false, condense = false
  const slidesList = () => [...document.querySelectorAll('section.slide')]
  const isStep = (el, ctx) => {
    if (ctx.from == null) return false
    const list = slidesList(), prev = document.getElementById('s' + ctx.from)
    return list.indexOf(el) === list.indexOf(prev) + 1
  }
  const now = () => performance.now() / 1000
  const release = id => { const cv = canvases[id]; if (cv && !Deck.PRINT) { cv.width = 0; cv.height = 0 } }
  function enter(el, ctx) {
    const id = el.id
    points()
    const prevId = curId
    if (prevId && prevId !== id) release(prevId)
    curId = id
    const T = targets(id)
    const step = isStep(el, ctx), fromField = step && !!layouts['s' + ctx.from]
    if (ctx.play && (step || ctx.from == null)) {   /* a forward step, or the first arrival of a fresh load */
      condense = !fromField
      if (condense) seedState()   /* first arrival, or coming from a slide without the field: condense out of the data cloud */
      SX.set(X); SY.set(Y); SR.set(R_); SA.set(A); SK.set(K)
      T0 = now(); paint(id, 0, T0, false)
    } else {
      X.set(T.x); Y.set(T.y); R_.set(T.r); A.set(T.a); K.set(T.c)
      T0 = -1; paint(id, Infinity, now(), !ctx.animate)
    }
    dirty = true
  }
  function tick(id, t, still) {
    if (still) { if (Deck.PRINT || Deck.current()?.id === id) { points(); paint(id, Infinity, t, true) } return }
    if (curId !== id) return
    const L = layouts[id], br = L.breathe === undefined ? cfg.breathe : L.breathe, sw = L.sweep === undefined ? cfg.sweep : L.sweep
    if (T0 >= 0) {
      const s = Math.max(0, t - T0)
      if (s >= END + .02) { T0 = -1; paint(id, Infinity, t, false); dirty = !!(br || sw); return }
      paint(id, s, t, false); return
    }
    if (br || sw || dirty) { paint(id, Infinity, t, false); dirty = false }
  }

  function slide(id, L) {
    const el = document.getElementById(id)
    if (!el) { console.warn(`point-field: no #${id}`); return }
    let cv = el.querySelector(':scope>canvas.cy-pf')
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'cy-pf'; cv.setAttribute('aria-hidden', 'true'); el.prepend(cv) }
    cv.width = 0; cv.height = 0
    canvases[id] = cv; layouts[id] = L
    Deck.on(id, {
      enter: (e, ctx) => enter(e, ctx),
      leave: () => { if (curId === id) T0 = -1; release(id) },
      final: () => { points(); paint(id, Infinity, 12, true) },
    })
    Deck.clock(cv, (t, _, still) => tick(id, t, still), { printT: 12 })
    if (!warmT && !Deck.PRINT) warmT = setTimeout(warm, 300)
  }
  /* after start, compute every field slide's targets in idle slices, so no forward step pays for its first layout */
  let warmT = 0
  function warm() {
    const ids = Object.keys(layouts), idle = window.requestIdleCallback || (f => setTimeout(f, 30))
    const next = () => { const id = ids.shift(); if (!id) return; try { points(); targets(id) } catch (e) { console.warn('point-field:', id, e) } idle(next) }
    idle(next)
  }
  function refresh() {
    version++
    if (Deck.PRINT) { for (const id in layouts) paint(id, Infinity, 12, true); return }
    if (curId && layouts[curId]) {
      const T = targets(curId)
      if (T0 < 0) { X.set(T.x); Y.set(T.y); R_.set(T.r); A.set(T.a); K.set(T.c); paint(curId, Infinity, now(), !!Deck.REDUCE) }
    }
  }

  /* ---------- figures ---------- */
  const lazy = (make, fontDep) => {
    let S = null, v = -1
    const fig = { slots() { if (!S || v !== version) { S = make(); v = version; if (fontDep) fontDep(S) } return S } }
    return fig
  }
  const own = n => ({ own: true, n, x: new Float32Array(n).fill(NaN), y: new Float32Array(n).fill(NaN), g: new Uint16Array(n) })
  const list = (xs, ys, gs, pitch) => ({ own: false, n: xs.length, x: Float32Array.from(xs), y: Float32Array.from(ys), g: Uint16Array.from(gs), pitch })

  const fig = {
    scatter(o = {}) {
      return lazy(() => {
        const P = points(), S = own(P.length), b = o.box || cfg.home
        P.forEach((p, i) => { S.x[i] = b.x + p.u * b.w; S.y[i] = b.y + p.v * b.h })
        return S
      })
    },
    grid(o) {
      return lazy(() => {
        const xs = [], ys = [], gs = [], p = o.pitch ?? 10
        for (let r = 0; r < o.rows; r++) for (let c = 0; c < o.cols; c++) { xs.push(o.x + (c + .5) * p); ys.push(o.y + (r + .5) * p); gs.push(0) }
        return list(xs, ys, gs, p)
      })
    },
    layers(o) {
      const cx = o.cx ?? 520, cy = o.cy ?? 900, w = o.w ?? 640, n = o.count ?? 12, gap = o.gap ?? 22, tilt = o.tilt ?? 1
      const plane = (u, v, k) => [cx + (u - .5) * w * .84 - (v - .5) * w * .30, cy - k * gap + (u - .5) * w * .07 * tilt + (v - .5) * w * .10 * tilt]
      const f = lazy(() => {
        const P = points(), S = own(P.length)
        P.forEach((p, i) => { const k = o.of ? o.of(p) : Math.floor(p.h * n); if (k == null || k < 0) return; const [x, y] = plane(p.u, p.v, k); S.x[i] = x; S.y[i] = y; S.g[i] = k })
        return S
      })
      f.plane = plane
      f.sheet = (g, k) => { g.beginPath(); [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([u, v], j) => { const [x, y] = plane(u, v, k); j ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath() }
      return f
    },
    bars(o) {
      const cols = o.cols ?? 12, p = o.pitch ?? 8, gap = o.gap ?? 60, rows = o.rows ?? 60
      const mx = o.max ?? Math.max(...o.values), bw = cols * p
      const geo = o.values.map((v, b) => { const n = Math.max(v > 0 ? 1 : 0, Math.round(v / mx * rows)) * cols; return { x: o.x + b * (bw + gap) + bw / 2, left: o.x + b * (bw + gap), w: bw, n, top: o.y - Math.ceil(n / cols) * p } })
      const f = lazy(() => {
        const xs = [], ys = [], gs = []
        geo.forEach((b, k) => { for (let j = 0; j < b.n; j++) { xs.push(b.left + (j % cols + .5) * p); ys.push(o.y - (Math.floor(j / cols) + .5) * p); gs.push(k) } })
        return list(xs, ys, gs, p)
      })
      f.geo = () => geo
      return f
    },
    histogram(o) {
      const cols = o.cols ?? 10, p = o.pitch ?? 8, gap = o.gap ?? 50, rows = o.rows ?? Infinity
      let geo = null
      const f = lazy(() => {
        const P = points(), S = own(P.length), nb = o.bins, fill = new Int32Array(nb), bw = cols * p
        S.pitch = p
        const order = P.slice().sort(o.sort ? (a, b) => o.sort(a) - o.sort(b) : (a, b) => a.h - b.h)
        for (const q of order) {
          const b = o.of(q)
          if (b == null || b < 0 || b >= nb) continue
          const j = fill[b]
          if (j >= rows * cols) continue
          fill[b]++
          S.x[q.i] = o.x + b * (bw + gap) + (j % cols + .5) * p; S.y[q.i] = o.y - (Math.floor(j / cols) + .5) * p; S.g[q.i] = b
        }
        geo = [...fill].map((n, b) => ({ x: o.x + b * (bw + gap) + bw / 2, left: o.x + b * (bw + gap), w: bw, n, top: o.y - Math.ceil(n / cols) * p }))
        return S
      })
      f.geo = () => { f.slots(); return geo }
      return f
    },
    shape(draw, o = {}) { return lazy(() => sample(draw, o)) },
    polygon(pts, o = {}) {
      const xs = pts.map(q => q[0]), ys = pts.map(q => q[1])
      const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
      return lazy(() => sample(g => { g.beginPath(); pts.forEach(([x, y], j) => j ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill() }, { ...o, box }))
    },
    /* the name in dots: fitted into box {x, y, w, h} (or centred on x, y at size), one line or two (wraps at the
       space nearest the middle when that gives a much bigger size); g = letter index */
    text(str, o = {}) { return glyphs(str, null, o) },
    /* the product's mark (stroke paths in a 24 × 24 viewBox: an <svg class="mark"> element or its markup), fitted into box */
    mark(m, o = {}) { return glyphs('', m, o) },
    /* mark + name side by side, fitted into box; g = 0 for the mark, 1 + letter index for the name */
    lockup(m, str, o = {}) { return glyphs(str, m, o) },
    ring(o) {
      const cx = o.cx ?? 960, cy = o.cy ?? 540, r = o.r ?? 300, th = o.thick ?? 80, p = o.pitch ?? 9
      const parts = o.parts ?? [1], sum = parts.reduce((a, b) => a + b, 0), gap = (o.gapDeg ?? (parts.length > 1 ? 4 : 0)) * Math.PI / 180
      const start = (o.start ?? -90) * Math.PI / 180, cum = []
      parts.reduce((a, b, j) => (cum[j] = (a + b) / sum, a + b), 0)
      return lazy(() => {
        const xs = [], ys = [], gs = []
        for (let rr = r - th / 2 + p / 2, row = 0; rr <= r + th / 2; rr += p * .866, row++) {
          const n = Math.floor(TAU * rr / p)
          for (let j = 0; j < n; j++) {
            const f = (j + (row % 2) * .5) / n, a = f * TAU
            let k = 0; while (k < cum.length - 1 && f > cum[k]) k++
            const lo = k ? cum[k - 1] : 0
            if (parts.length > 1 && (a - lo * TAU < gap / 2 || cum[k] * TAU - a < gap / 2)) continue
            xs.push(cx + rr * Math.cos(start + a)); ys.push(cy + rr * Math.sin(start + a)); gs.push(k)
          }
        }
        return list(xs, ys, gs, p)
      })
    },
  }
  /* ---------- glyphs: text, mark and lockup, all fitted to a box ---------- */
  const meas = document.createElement('canvas').getContext('2d')
  const fontOf = (o, size) => `${o.weight ?? 800} ${size}px ${o.font ?? getComputedStyle(document.body).fontFamily}`
  const setFont = (g, o, size) => { g.font = fontOf(o, size); g.letterSpacing = `${(o.tracking ?? -.02) * size}px` }
  const markPaths = m => {
    if (!m) return []
    const ds = typeof m === 'string' ? [...m.matchAll(/\sd="([^"]+)"/g)].map(x => x[1]) : [...m.querySelectorAll('path')].map(p => p.getAttribute('d'))
    return ds.filter(Boolean).map(d => { try { return new Path2D(d) } catch { return null } }).filter(Boolean)
  }
  function layout(str, mark, o) {
    const S0 = 100, box = o.box || { x: (o.x ?? 960) - (o.maxW ?? 1560) / 2, y: (o.y ?? 540) - (o.size ?? 420) * .55, w: o.maxW ?? 1560, h: (o.size ?? 420) * 1.1 }
    const hasMark = markPaths(mark).length > 0, cands = [str ? [str] : []]
    const sp = [...str.matchAll(/ /g)].map(x => x.index)
    if (sp.length && o.wrap !== false) { const mid = str.length / 2, k = sp.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a); cands.push([str.slice(0, k), str.slice(k + 1)]) }
    setFont(meas, o, S0)
    const cap = meas.measureText('H').actualBoundingBoxAscent, lead = S0 * (o.leading ?? 1)
    let best = null
    for (const lines of cands) {
      const ms = lines.map(l => meas.measureText(l)), tw = lines.length ? Math.max(...ms.map(m => m.width)) : 0
      const asc = lines.length ? Math.max(cap, ms[0].actualBoundingBoxAscent) : 0, desc = lines.length ? ms[ms.length - 1].actualBoundingBoxDescent : 0
      const th = lines.length ? asc + (lines.length - 1) * lead + desc : 0
      const msz = hasMark ? (lines.length ? Math.max(cap * (o.markScale ?? 1.3), cap + (lines.length - 1) * lead) : S0) : 0, gap = hasMark && lines.length ? cap * .3 : 0
      const W = msz + gap + tw, H = Math.max(th, msz)
      let k = Math.min(box.w / W, box.h / H) * (o.fill ?? 1)
      if (o.size) k = Math.min(k, o.size / S0)
      const score = k * (lines.length > 1 ? .8 : 1)
      if (!best || score > best.score) best = { score, k, lines, ms, tw, asc, th, msz, gap, W, H }
    }
    const L = best, k = L.k, size = S0 * k, x0 = box.x + (box.w - L.W * k) / 2, yMid = box.y + box.h / 2
    const mk = hasMark ? { x: x0, y: yMid - L.msz * k / 2, s: L.msz * k } : null
    const tx = x0 + (L.msz + L.gap) * k, top = yMid - L.th * k / 2
    const lines = L.lines.map((l, j) => ({ str: l, x: tx + (L.tw - L.ms[j].width) * k / 2, base: top + (L.asc + j * (o.leading ?? 1) * S0) * k }))
    return { size, mark: mk, lines, box: { x: x0, y: Math.min(top, mk ? mk.y : top), w: L.W * k, h: L.H * k } }
  }
  function glyphs(str, mark, o) {
    let info = null
    const f = lazy(() => {
      const Lo = layout(str, mark, o), paths = markPaths(mark)
      info = Lo
      const edges = Lo.lines.map(l => { setFont(meas, o, Lo.size); return [...l.str].map((_, j) => l.x + meas.measureText(l.str.slice(0, j + 1)).width) })
      const group = (x, y) => {
        if (Lo.mark && x <= Lo.mark.x + Lo.mark.s + 2) return 0
        let li = 0; Lo.lines.forEach((l, j) => { if (Math.abs(y - (l.base - Lo.size * .35)) < Math.abs(y - (Lo.lines[li].base - Lo.size * .35))) li = j })
        let j = 0, before = 0; for (let q = 0; q < li; q++) before += Lo.lines[q].str.length
        const e = edges[li] || []; while (j < e.length - 1 && x > e[j]) j++
        return (Lo.mark ? 1 : 0) + before + j
      }
      const pad = Lo.size * .12
      return sample(g => {
        setFont(g, o, Lo.size); g.textBaseline = 'alphabetic'
        for (const l of Lo.lines) g.fillText(l.str, l.x, l.base)
        if (Lo.mark) {
          g.save(); g.translate(Lo.mark.x, Lo.mark.y); g.scale(Lo.mark.s / 24, Lo.mark.s / 24)
          g.lineWidth = o.markStroke ?? 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#000'
          for (const p of paths) g.stroke(p)
          if (o.markFill) for (const p of paths) g.fill(p)
          g.restore()
        }
      }, { ...o, group, box: { x: Lo.box.x - pad, y: Lo.box.y - pad, w: Lo.box.w + pad * 2, h: Lo.box.h + pad * 2 } })
    }, () => {
      const fs = fontOf(o, 100)
      if (!str || !document.fonts || document.fonts.check(fs)) return
      document.fonts.load(fs).then(() => { if (document.fonts.check(fs)) refresh() })
    })
    f.box = () => { f.slots(); return info.box }
    f.layout = () => { f.slots(); return info }
    return f
  }

  /* raster sampling: draw at 1:1 on a scratch canvas, read alpha on a hex lattice; count → pick the pitch */
  function sample(draw, o) {
    const b = o.box || { x: 0, y: 0, w: VW, h: VH }, bw = Math.max(1, Math.ceil(b.w)), bh = Math.max(1, Math.ceil(b.h))
    const c = document.createElement('canvas'); c.width = bw; c.height = bh
    const g = c.getContext('2d', { willReadFrequently: true })
    g.translate(-b.x, -b.y); g.fillStyle = '#000'; draw(g)
    const D = g.getImageData(0, 0, bw, bh).data, on = (x, y) => { x |= 0; y |= 0; return x >= 0 && y >= 0 && x < bw && y < bh && D[(y * bw + x) * 4 + 3] > 120 }
    let p = o.pitch
    if (!p) {
      let ink = 0
      for (let y = 0; y < bh; y += 2) for (let x = 0; x < bw; x += 2) if (on(x, y)) ink += 4
      p = Math.max(o.minPitch ?? 6, Math.sqrt(ink / ((o.count ?? Math.round(points().length * .7)) * .866)))
    }
    const xs = [], ys = [], gs = [], jit = (o.jitter ?? .1) * p
    let row = 0
    for (let y = p / 2; y < bh; y += p * .866, row++) for (let x = (row % 2 ? p : p / 2); x < bw; x += p) {
      if (!on(x, y)) continue
      const k = xs.length
      const X = b.x + x + (hash(k * 2 + 7) - .5) * jit, Y = b.y + y + (hash(k * 2 + 8) - .5) * jit
      xs.push(X); ys.push(Y); gs.push(o.group ? o.group(X, Y) : 0)
    }
    return list(xs, ys, gs, p)
  }

  /* ---------- fill: pour the points into a figure ---------- */
  function hilbert(x, y) {
    const n = 1024; let X = Math.min(n - 1, Math.max(0, x * n | 0)), Y = Math.min(n - 1, Math.max(0, y * n | 0)), d = 0
    for (let s = n >> 1; s > 0; s >>= 1) {
      const rx = (X & s) > 0 ? 1 : 0, ry = (Y & s) > 0 ? 1 : 0
      d += s * s * ((3 * rx) ^ ry)
      if (ry === 0) { if (rx === 1) { X = n - 1 - X; Y = n - 1 - Y } const t = X; X = Y; Y = t }
    }
    return d
  }
  const norm = (xs, ys) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (let i = 0; i < xs.length; i++) { x0 = Math.min(x0, xs[i]); x1 = Math.max(x1, xs[i]); y0 = Math.min(y0, ys[i]); y1 = Math.max(y1, ys[i]) }
    return [(v => (v - x0) / (x1 - x0 || 1)), (v => (v - y0) / (y1 - y0 || 1))]
  }
  const val = (v, dflt, p, g, s) => v == null ? dflt : typeof v === 'function' ? v(p, g, s) : v
  function fill(f, opt = {}) {
    let map = null, S = null, box = null, mv = -1
    const build = () => {
      S = f.slots(); mv = version
      const P = points(), n = P.length
      map = new Int32Array(n).fill(-1)
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (let s = 0; s < S.n; s++) if (S.x[s] === S.x[s]) { x0 = Math.min(x0, S.x[s]); x1 = Math.max(x1, S.x[s]); y0 = Math.min(y0, S.y[s]); y1 = Math.max(y1, S.y[s]) }
      box = { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R: Math.hypot(x1 - x0, y1 - y0) / 2 || 1 }
      if (S.own) { for (let i = 0; i < n; i++) if (S.x[i] === S.x[i] && (!opt.only || opt.only(P[i]))) map[i] = i; return }
      let who = P.filter(p => !opt.only || opt.only(p))
      who.sort(opt.pick ? (a, b) => opt.pick(a) - opt.pick(b) : (a, b) => a.h - b.h)
      const m = Math.min(who.length, S.n)
      who = who.slice(0, m)
      let slots = Array.from({ length: S.n }, (_, s) => s)
      if (S.n > m) slots = slots.sort((a, b) => hash(a + 777) - hash(b + 777)).slice(0, m)
      const ord = opt.order ?? 'near'
      if (ord !== 'data') {
        const [fu, fv] = norm(who.map(p => p.u), who.map(p => p.v)), [fx, fy] = norm(slots.map(s => S.x[s]), slots.map(s => S.y[s]))
        const kp = ord === 'x' ? p => p.u + p.v * 1e-3 : ord === 'y' ? p => p.v + p.u * 1e-3 : ord === 'random' ? p => p.h3
          : ord === 'angle' ? p => Math.atan2(fv(p.v) - .5, fu(p.u) - .5) : p => hilbert(fu(p.u), fv(p.v))
        const ks = ord === 'x' ? s => S.x[s] + S.y[s] * 1e-3 : ord === 'y' ? s => S.y[s] + S.x[s] * 1e-3 : ord === 'random' ? s => hash(s + 4242)
          : ord === 'angle' ? s => Math.atan2(fy(S.y[s]) - .5, fx(S.x[s]) - .5) : s => hilbert(fx(S.x[s]), fy(S.y[s]))
        const kw = new Map(who.map(p => [p, kp(p)])), kk = new Map(slots.map(s => [s, ks(s)]))
        who.sort((a, b) => kw.get(a) - kw.get(b)); slots.sort((a, b) => kk.get(a) - kk.get(b))
      }
      who.forEach((p, j) => { map[p.i] = slots[j] })
    }
    const delay = (p, s, x, y) => {
      const d = opt.d ?? 'random'
      if (typeof d === 'number') return d
      if (typeof d === 'function') return d(p, S.g[s], s)
      if (d === 'wave-x') return (x - box.x0) / (box.x1 - box.x0 || 1) * .28 + p.h * .04
      if (d === 'wave-y') return (box.y1 - y) / (box.y1 - box.y0 || 1) * .28 + p.h * .04
      if (d === 'center') return Math.hypot(x - box.cx, y - box.cy) / box.R * .26 + p.h * .04
      return p.h * cfg.spread
    }
    const place = (p, o, i) => {
      if (!map || mv !== version) build()
      const s = map[i]
      if (s < 0) {
        const sp = opt.spare ?? 'dust'
        o.x = homeX(p); o.y = homeY(p); o.r = cfg.dust.r; o.a = sp === 'dust' ? cfg.dust.a : 0; o.d = p.h * cfg.spread
        if (sp === 'sink') o.y = VH + 60
        return
      }
      const g = S.g[s]
      o.x = S.x[s]; o.y = S.y[s]
      o.r = val(opt.r, S.pitch ? S.pitch * .42 : 3, p, g, s); o.a = val(opt.a, 1, p, g, s); o.c = val(opt.c, p.k, p, g, s)
      o.d = delay(p, s, o.x, o.y)
      opt.style?.(p, o, g, s)
    }
    return place
  }

  PK['point-field'] = {
    config(o) { if (PTS && (o.points || o.n || o.seed)) { PTS = null; version++ } Object.assign(cfg, o); if (o.home) cfg.home = { ...cfg.home, ...o.home } },
    slide, fill, fig, points, refresh, hash,
    palette: id => paletteOf(id),
    home: p => [homeX(p), homeY(p)],
  }
})()
