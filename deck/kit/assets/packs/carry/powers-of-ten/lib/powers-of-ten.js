/* Pack "powers-of-ten" (carry) · one continuous zoom. Every slide is a view of ONE world at its own scale, and a
   forward step flies the camera from the last view to the new one (≤ 1.2 s): a log-scale zoom about the point the two
   views share, the finer picture fading in with feathered edges, the scale caption re-measuring itself on the way.
   window.Pack["powers-of-ten"] (below: P). Harvested from a finished deck (orbit → region → plot → one cell).

   P.world({ paint(g, cam, c), sample(x, y, detail), unit, px })   the deck's world, painted at any camera.
       cam = { s, x0, y0 }: s = px per world unit, (x0, y0) = the world point under the top-left pixel.
       c = { pal, world, W, H }: pal derives from --field / --brand / --brand-2 of the FIRST view's section.
       sample(x, y, detail) → [r, g, b], the colour at a world point, drawn to `detail` units (used by P.cells). unit = metres per world unit, for
       the scale caption (default 1000: km). px: true keeps the picture crisp (cells) while it is scaled.
       With no call, the bundled world is used, P.coast(): a fractal coast where every power of ten adds an octave
       of detail, so the coastline is really there at every scale.
   P.view(id, cam, { paint, frame, scrim, printT, px })   slide `id` looks at the world through cam ({ s, x0, y0 },
       or P.at(x, y, s, cx, cy)). paint(g, cam, c) replaces the world for this view's still picture (P.cells for the
       bottom of the zoom); frame(g, t, k) draws what moves over it on the one clock (k.since = s since a forward
       arrival, Infinity at rest; k.still = print / reduced motion). scrim (0 … .6, default .28): a soft shade under
       the headline zone. The canvas (<canvas class="cy-powers-of-ten">) becomes the slide's first child, edge to
       edge, behind the content. A `.cy-powers-of-ten-bar` element in the slide becomes its scale caption.
   P.chain('sA>sB', { via: [view or level ids], dur })   override one move; P.chain('sA>sB', false) cuts instead.
       By default every forward step between two views moves; a move wider than ×12 gets in-between levels painted
       from the world (one per ×8 or so), so nothing pops.
   P.level(id, cam, { paint })   a named in-between picture for chains. P.cells(g, cam, c, { size, gap }) paints the
       world as cells of `size` units (nearest sample at each centre). P.clouds(g, t, { speed, alpha }) drifts
       soft cloud shadows across a frame. P.at / P.toScreen / P.bar(el, s) helpers.
   P.world() returns the world in use (creating the bundled coast if none was set); P.world().coastPoint(angle, detail)
       finds a point on the bundled coast's outer shoreline, a good place to zoom into.
   P.entry = 5   zoom factor of the establishing dive on a first arrival (from a slide without a view); 0 = none.

   Motion (taste.md §11, the carry exception): content cuts; the picture moves. Backward, jumps, reduced motion and
   print show each slide's own view. Print rasterises every canvas to a JPEG so map-heavy PDFs stay small. Each
   slide's --ink-auto is re-picked from the world's sea colour, because the headline sits on the map. */
;(() => {
  const PK = (window.Pack = window.Pack || {})
  const W = 1920, H = 1080, D = window.Deck, PRINT = D.PRINT, REDUCE = D.REDUCE
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
  const views = {}, order = [], LEVELS = {}, CHAINS = {}, AUTO = {}
  let WORLD = null, PAL = null, ready = false
  const waiting = []

  /* ---------- palette: the whole world derives from the first view's --field / --brand / --brand-2 ---------- */
  const COLOR_RE = /#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch|oklab|lab|lch|color)a?\([^()]*\)/gi
  const px1 = mk(1, 1).getContext('2d', { willReadFrequently: true })
  const rgbOf = s => { if (!s) return null; px1.clearRect(0, 0, 1, 1); px1.fillStyle = '#010203'; px1.fillStyle = s; if (px1.fillStyle === '#010203' && !/#010203/i.test(s)) return null; px1.fillRect(0, 0, 1, 1); const d = px1.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]] }
  const mix = (a, b, t) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t)
  const css = (c, a = 1) => `rgba(${c.map(v => Math.round(clamp(v, 0, 255))).join(',')},${a})`
  const lum = ([r, g, b]) => { const f = c => (c /= 255) <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) }
  function palette(el) {
    const cs = getComputedStyle(el || document.documentElement)
    const pick = (k, d) => { const v = cs.getPropertyValue(k).trim(), m = v.match(COLOR_RE); return rgbOf(m ? m[0] : v) || rgbOf(d) }
    const field = pick('--field', '#173a6b'), brand = pick('--brand', '#ffb36b'), brand2 = pick('--brand-2', '#7fe0c0')
    // the sea is the field pushed away from its ink, so the headline (which sits on the sea) reads at any brand
    const darkField = lum(field) < .32, K = darkField ? [4, 8, 20] : [255, 255, 255]
    const sea = mix(field, K, darkField ? .28 : .22), deep = mix(field, K, darkField ? .55 : .06)
    const shallow = mix(sea, brand2, .3), lo = mix(brand2, sea, .3), lo2 = mix(lo, mix(brand, deep, .5), .45), hi = mix(brand, [255, 255, 255], .28)
    const coast = mix(brand, [255, 255, 255], .6), scrimC = darkField ? mix(deep, [0, 0, 0], .2) : mix(sea, [255, 255, 255], .5)
    return { field, brand, brand2, sea, deep, shallow, lo, lo2, hi, coast, scrimC, dark: darkField, ink: D.inkOn?.(css(sea)) || (darkField ? '#FFFFFF' : '#14161E') }
  }

  /* ---------- the bundled world: a fractal coast (value-noise fBm, one octave per halving of scale) ---------- */
  function coast(o = {}) {
    const seed = o.seed ?? 11, L0 = o.wave ?? 2400, R = o.radius ?? 2100
    const hash = (i, j, k) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k + seed, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
    const noise = (x, y, k) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), a = hash(i, j, k), b = hash(i + 1, j, k), c = hash(i, j + 1, k), d = hash(i + 1, j + 1, k); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
    const ROT = Array.from({ length: 24 }, (_, k) => [Math.cos(k * 1.13 + .4), Math.sin(k * 1.13 + .4)])
    const PERS = o.roughness ?? .56, NORM = (1 - PERS) / .5 * .9
    let TEX = 0   // the second channel of the last elev() call: ground texture, with detail at every scale too
    // elevation at (x, y) with octaves down to wavelength `minWave` units; < 0 is sea. A coarse domain warp first, so
    // the island is not a blob; then one rotated octave per halving of scale (a genuinely fractal shoreline)
    const elev = (x, y, minWave) => {
      const wx = x + R * .42 * (noise(x / (R * 1.1) + 3.1, y / (R * 1.1) - 7.7, 101) - .5) * 2, wy = y + R * .42 * (noise(x / (R * 1.1) - 5.3, y / (R * 1.1) + 2.9, 102) - .5) * 2
      let e = 0, t = 0, amp = .5, L = L0
      for (let k = 0; k < 24 && L >= minWave; k++, amp *= PERS, L *= .5) {
        const [c, s] = ROT[k], u = (wx * c - wy * s) / L, v = (wx * s + wy * c) / L
        e += amp * (noise(u + k * 17.3, v - k * 9.1, k) - .5) * 2
        if (k > 1) t += amp * (noise(v - k * 5.7, u + k * 3.3, k + 50) - .5) * 2
      }
      TEX = t * NORM * 2.2
      const r = Math.hypot(wx / 1.25, wy) / R
      return e * NORM + .3 - .9 * r * r
    }
    const ramp = (pal, e, tex) => {
      if (e < 0) { const t = clamp(-e / .55); let c = mix(pal.sea, pal.deep, Math.pow(t, .7)); if (e > -.035) c = mix(c, pal.shallow, (1 - (-e / .035)) * .7); return c }
      const c = mix(pal.lo, pal.hi, smooth(0, .55, e))
      return mix(c, pal.lo2, smooth(-.05, .3, tex) * .6 * (1 - smooth(.3, .6, e)))   // patches of darker ground
    }
    const octs = mw => Math.max(1, Math.log2(L0 / mw))
    function paint(g, cam, c, q = 2) {
      const w = Math.ceil(W / q), h = Math.ceil(H / q), upp = q / cam.s, minWave = upp * 2.2
      const E = new Float32Array((w + 1) * (h + 1)), X = new Float32Array((w + 1) * (h + 1))
      for (let j = 0; j <= h; j++) for (let i = 0; i <= w; i++) { const n = j * (w + 1) + i; E[n] = elev(cam.x0 + (i - .5) * upp, cam.y0 + (j - .5) * upp, minWave); X[n] = TEX }
      const img = new ImageData(w, h), d = img.data, sh = L0 / upp / octs(minWave) * .22
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const n = (j + 1) * (w + 1) + i + 1, e = E[n], eL = E[n - 1], eU = E[n - w - 1]
        let col = ramp(c.pal, e, X[n])
        // hillshade from the north-west, gentle on the sea
        const k = 1 + clamp(((eL - e) + (eU - e)) * sh, -.28, .28) * (e < 0 ? .2 : 1)
        col = col.map(v => v * k)
        // contours: every .08 on land (a shade darker), every .12 at sea (a touch lighter)
        if (e >= 0 && Math.floor(e / .08) !== Math.floor(eL / .08)) col = col.map(v => v * .86)
        if (e < 0 && Math.floor(e / .12) !== Math.floor(eU / .12)) col = mix(col, c.pal.shallow, .22)
        // the coastline itself, bright
        if ((e >= 0) !== (eL >= 0) || (e >= 0) !== (eU >= 0)) col = mix(col, c.pal.coast, .85)
        const o4 = (j * w + i) * 4; d[o4] = col[0]; d[o4 + 1] = col[1]; d[o4 + 2] = col[2]; d[o4 + 3] = 255
      }
      const tmp = mk(w, h); tmp.getContext('2d').putImageData(img, 0, 0)
      g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(tmp, 0, 0, w * q, h * q); g.restore()
    }
    /* the colour at one world point, with detail down to `detail` units and the same hillshade (P.cells uses it) */
    const sample = (x, y, detail) => {
      const e = elev(x, y, detail), tex = TEX, eL = elev(x - detail, y, detail), eU = elev(x, y - detail, detail)
      const k = 1 + clamp(((eL - e) + (eU - e)) * L0 / detail / octs(detail) * .22, -.22, .22) * (e < 0 ? .2 : 1)
      return ramp(PAL, e, tex).map(v => v * k)
    }
    /* a point on the outer coastline: come in from the open sea along `angle` until the first land, at `detail` */
    const CP = {}
    const coastPoint = (angle = .55, detail = .375) => CP[angle + ':' + detail] || (CP[angle + ':' + detail] = findCoast(angle, detail))
    const findCoast = (angle, detail) => {
      const dx = Math.cos(angle) * 1.25, dy = Math.sin(angle)
      for (let r = R * 1.8; r > 0; r -= detail) if (elev(dx * r, dy * r, detail) >= 0) return [dx * r, dy * r]
      return [0, 0]
    }
    return { paint, sample, unit: 1000, elev, coastPoint, px: false }
  }

  /* ---------- views and levels ---------- */
  const ctxOf = () => ({ pal: PAL, world: WORLD, W, H })
  function view(id, cam, o = {}) {
    const el = document.getElementById(id)
    const v = { ...o, id, el, s: cam.s, x0: cam.x0, y0: cam.y0, arrived: -Infinity }
    if (el) {
      v.canvas = el.querySelector(':scope>canvas.cy-powers-of-ten') || el.insertBefore(Object.assign(mk(), { className: 'cy-powers-of-ten' }), el.firstChild)
      v.canvas.setAttribute('aria-hidden', 'true'); v.g = v.canvas.getContext('2d'); v.bar = el.querySelector('.cy-powers-of-ten-bar')
      D.clock(v.canvas, (t, _, still) => tick(v, t, still), { printT: o.printT ?? 14 })
    }
    views[id] = v; order.push(id)
    if (ready) build(v)
    return v
  }
  function build(v) {
    v.base = mk(); const g = v.base.getContext('2d'); g.imageSmoothingEnabled = !v.px
    ;(v.paint || WORLD.paint)(g, v, ctxOf())
    if (v.bar) bar(v.bar, v.s)
    if (v.el) v.el.style.setProperty('--ink-auto', PAL.ink)
  }
  const paintLevel = (cam, paint, q = 3) => { const img = mk(), g = img.getContext('2d'); (paint ? paint(g, cam, ctxOf()) : WORLD.paint(g, cam, ctxOf(), q)); return { ...cam, img } }
  function level(id, cam, o = {}) { const f = () => { LEVELS[id] = paintLevel(cam, o.paint) }; ready ? f() : waiting.push(f) }
  function cells(g, cam, c, o = {}) {
    const size = o.size ?? 1, gap = o.gap ?? 1, s = cam.s, px = size * s
    g.fillStyle = css(c.pal.deep); g.fillRect(0, 0, W, H)
    const i0 = Math.floor(cam.x0 / size), j0 = Math.floor(cam.y0 / size)
    for (let j = j0; j <= j0 + H / px + 1; j++) for (let i = i0; i <= i0 + W / px + 1; i++) {
      const x = (i * size - cam.x0) * s, y = (j * size - cam.y0) * s
      const k = 1 + (hashC(i, j) - .5) * (o.jitter ?? .1)
      g.fillStyle = css((c.world.sample || WORLD.sample)((i + .5) * size, (j + .5) * size, size * .5).map(v => v * k)); g.fillRect(Math.round(x), Math.round(y), Math.ceil(px) - gap, Math.ceil(px) - gap)
    }
  }
  const hashC = (i, j) => { let h = Math.imul(i, 73856093) ^ Math.imul(j, 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
  /* drifting cloud shadows (ambient): one pre-blurred sheet, two slide-widths long, slid on the one clock */
  let CLOUD = null
  function clouds(g, t, o = {}) {
    if (!CLOUD) {
      CLOUD = mk(W * 2, H); const c = CLOUD.getContext('2d'); let r = 23
      const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647
      c.filter = 'blur(26px)'; c.fillStyle = '#000'
      for (let k = 0; k < 26; k++) { const x = rnd() * W * 2, y = rnd() * H, w = 90 + rnd() * 240; for (let q = 0; q < 5; q++) for (const dx of [0, -W * 2, W * 2]) { c.beginPath(); c.ellipse(x + dx + (rnd() - .5) * w, y + (rnd() - .5) * w * .4, w * (.4 + rnd() * .5), w * (.18 + rnd() * .2), 0, 0, Math.PI * 2); c.fill() } }
    }
    const off = (t * (o.speed ?? 8)) % (W * 2)
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.alpha ?? .14
    g.drawImage(CLOUD, -off, 0); g.drawImage(CLOUD, W * 2 - off, 0); g.restore()
  }
  const toScreen = (cam, x, y) => [(x - cam.x0) * cam.s, (y - cam.y0) * cam.s]
  const at = (x, y, s, cx = W / 2, cy = H / 2) => ({ s, x0: x - cx / s, y0: y - cy / s })

  /* ---------- the scale caption: a round length on a 1-2-5 series, the bar drawn to it ---------- */
  function bar(el, s) {
    const mpp = (WORLD?.unit ?? 1000) / s, want = 230 * mpp, p = Math.pow(10, Math.floor(Math.log10(want)))
    const L = [5, 2, 1].map(f => f * p).find(v => v <= want) || p
    const lab = L >= 1000 ? (L / 1000).toLocaleString('en-US') + ' km' : L >= 1 ? L.toLocaleString('en-US') + ' m' : Math.round(L * 100) + ' cm'
    el.style.setProperty('--bw', (L / mpp).toFixed(1) + 'px')
    const b = el.querySelector('b') || el.appendChild(document.createElement('b')); if (b.textContent !== lab) b.textContent = lab
  }

  /* ---------- the camera move ---------- */
  const FEATHER = mk(), TMP = mk(), TMP2 = mk(), SNAP = mk()
  { const g = FEATHER.getContext('2d'); g.filter = 'blur(70px)'; g.fillStyle = '#fff'; g.fillRect(150, 130, W - 300, H - 260) }
  const feathered = src => { const g = TMP.getContext('2d'); g.globalCompositeOperation = 'copy'; g.drawImage(src, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(FEATHER, 0, 0); g.globalCompositeOperation = 'source-over'; return TMP }
  const soft = img => { const c = mk(); c.getContext('2d').drawImage(feathered(img), 0, 0); return c }
  // the camera at progress e of a move from A to B: log scale, and the centre slides so the shared point stays put
  const camAt = (A, B, e) => {
    const s = A.s * Math.pow(B.s / A.s, e), mA = 1 / A.s, mB = 1 / B.s, m = 1 / s
    const w = Math.abs(mA - mB) > 1e-12 ? (mA - m) / (mA - mB) : e
    const cAx = A.x0 + W / 2 * mA, cAy = A.y0 + H / 2 * mA, cBx = B.x0 + W / 2 * mB, cBy = B.y0 + H / 2 * mB
    return { s, x0: cAx + (cBx - cAx) * w - W / 2 * m, y0: cAy + (cBy - cAy) * w - H / 2 * m }
  }
  // in-between levels for a wide move, painted from the world (cached per pair)
  function autoLevels(A, B, key) {
    if (AUTO[key]) return AUTO[key]
    const R = Math.max(A.s, B.s) / Math.min(A.s, B.s), n = R > 12 ? Math.ceil(Math.log(R) / Math.log(8)) - 1 : 0, out = []
    for (let k = 1; k <= n; k++) out.push(paintLevel(camAt(A, B, k / (n + 1))))
    return (AUTO[key] = out)
  }
  const entryLevel = B => AUTO['entry>' + B.id] || (AUTO['entry>' + B.id] = paintLevel(at(B.x0 + W / 2 / B.s, B.y0 + H / 2 / B.s, B.s / P.entry)))
  let T = null
  function start(A, B, t, via, dur) {
    const sg = SNAP.getContext('2d'); sg.drawImage(A.canvas || A.img, 0, 0)
    const snap = { s: A.s, x0: A.x0, y0: A.y0, img: SNAP, px: A.px, snap: true }; snap.soft = soft(SNAP)
    const live = { s: B.s, x0: B.x0, y0: B.y0, live: B, px: B.px }
    const mids = via.map(l => ({ ...l, soft: l.soft || (l.soft = soft(l.img || l.base)), img: l.img || l.base }))
    T = { A: snap, B: live, lv: [snap, ...mids, live].sort((a, b) => a.s - b.s), t0: t, dur, to: B.id }
  }
  function drawMove(g, t) {
    const p = clamp((t - T.t0) / T.dur), e = ease(p), A = T.A, B = T.B, cam = camAt(A, B, e), s = cam.s
    frameOf(B.live, t, false)                        // the arriving picture runs its own arrival story under the move
    TMP2.getContext('2d').drawImage(B.live.canvas, 0, 0)
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = css(PAL.deep); g.fillRect(0, 0, W, H)
    const L = T.lv, rects = L.map(l => { const k = s / l.s; return { k, x: (l.x0 - cam.x0) * s, y: (l.y0 - cam.y0) * s, w: W * k, h: H * k } })
    // finer levels fade in by scale; the arriving picture also by time (short moves); the departing one fades out by the end
    const alpha = (l, i) => { if (i === 0) return 1; let a = smooth(.26, .78, rects[i].k); if (l.live) a = Math.min(a, smooth(0, .45, p)); if (l.snap) a = Math.min(a, 1 - smooth(.5, .92, p)); return a }
    let first = 0
    for (let i = L.length - 1; i > 0; i--) { const r = rects[i]; if (alpha(L[i], i) >= 1 && r.x <= 0 && r.y <= 0 && r.x + r.w >= W && r.y + r.h >= H) { first = i; break } }
    for (let i = first; i < L.length; i++) {
      const l = L[i], r = rects[i], a = i === first ? 1 : alpha(l, i)
      if (a <= .002 || r.w < 8) continue
      const small = r.k < 1.02 && i !== first
      g.imageSmoothingEnabled = !(l.px && r.k > 1.05); g.globalAlpha = a
      g.drawImage(l.live ? (small ? feathered(TMP2) : TMP2) : (small ? l.soft : l.img), r.x, r.y, r.w, r.h)
    }
    g.globalAlpha = 1; g.imageSmoothingEnabled = true
    scrim(g, .4 * (1 - p * p))                         // whatever flies under it, the headline zone stays calm
    if (B.live.bar) bar(B.live.bar, p >= 1 ? B.live.s : s)
    if (p >= 1) T = null
  }
  function scrim(g, a) {
    if (a <= 0) return
    const gr = g.createRadialGradient(560, 130, 40, 560, 130, 1150)
    gr.addColorStop(0, css(PAL.scrimC, a)); gr.addColorStop(.55, css(PAL.scrimC, a * .45)); gr.addColorStop(1, css(PAL.scrimC, 0))
    g.save(); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore()
  }
  function frameOf(v, t, still) {
    const g = v.g; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = true
    g.drawImage(v.base, 0, 0)
    v.frame?.(g, t, { since: still ? Infinity : t - v.arrived, still, t })
    scrim(g, v.scrim ?? .28)
  }
  function tick(v, t, still) {
    if (!ready || !v.base) return
    if (T && T.to === v.id && !still) { drawMove(v.g, t); return }
    frameOf(v, t, still)
  }

  /* ---------- navigation: forward steps between views fly; a first arrival dives in ---------- */
  D.onChange((el, ctx) => {
    const B = views[el.id]; T = null
    if (!B) return
    const now = performance.now() / 1000
    B.arrived = ctx.play ? now : -Infinity
    if (B.bar) bar(B.bar, B.s)
    if (!ready || !ctx.play || ctx.jump || REDUCE) return
    const fromId = ctx.from == null ? null : 's' + ctx.from, A = fromId && views[fromId], key = fromId + '>' + el.id, ch = CHAINS[key]
    if (ch === false) return
    if (A) {
      const via = ch?.via ? ch.via.map(k => LEVELS[k] || views[k]).filter(Boolean) : autoLevels(A, B, key)
      start(A, B, now, via, ch?.dur ?? (via.length ? 1.15 : 1.0))
    } else if (P.entry > 1) {
      start(entryLevel(B), B, now, [], 1.1)
    }
  })

  function boot() {
    if (ready) return
    WORLD = WORLD || coast()
    PAL = palette(views[order[0]]?.el)
    ready = true
    for (const f of waiting.splice(0)) f()
    for (const id of order) build(views[id])
    const now = performance.now() / 1000
    for (const v of Object.values(views)) if (v.arrived > -Infinity) v.arrived = now
    if (PRINT || REDUCE) for (const v of Object.values(views)) if (v.canvas) frameOf(v, v.printT ?? 14, true)
    if (PRINT) { for (const v of Object.values(views)) if (v.canvas) { const im = new Image(); im.className = 'cy-powers-of-ten'; im.alt = ''; im.src = v.canvas.toDataURL('image/jpeg', .88); v.canvas.replaceWith(im) } return }
    // paint the in-between levels while nothing is moving, so the first move does not hitch
    const ids = [...document.querySelectorAll('section.slide')].map(s => s.id), jobs = []
    ids.forEach((id, i) => {
      const A = views[ids[i - 1]], B = views[id]
      if (B && A && CHAINS[A.id + '>' + id] == null) jobs.push(() => autoLevels(A, B, A.id + '>' + id))
      if (B && !A && P.entry > 1) jobs.push(() => entryLevel(B))
    })
    const idle = window.requestIdleCallback || (f => setTimeout(f, 60))
    const run = () => { const j = jobs.shift(); if (j) { j(); idle(run) } }
    idle(run)
  }
  queueMicrotask(() => Promise.resolve(document.fonts?.ready).then(boot))

  const P = PK['powers-of-ten'] = {
    entry: 5,
    /* P.world(o) sets the deck's world; P.world() returns it (the bundled coast if none was set) */
    world(o) { if (o) WORLD = { unit: 1000, ...o }; return WORLD || (WORLD = coast()) },
    view, level, cells, clouds, at, toScreen, coast,
    bar: (el, s) => bar(el, s),
    chain(key, o) { CHAINS[key] = o },
    get palette() { return PAL },
    when(f) { ready ? f() : waiting.push(f) },
    isReady: () => ready,
    mix, css, smooth, clamp,
  }
})()
