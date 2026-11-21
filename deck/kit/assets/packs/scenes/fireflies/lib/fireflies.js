/* scenes/fireflies · a forest glade from late dusk into moonlit night (pack item, see its README.md).
   Every .sc-fireflies in the deck is drawn here. data-tod 0…1 picks the hour (0 late dusk with an apricot afterglow,
   0.5 blue hour, 1 moonlit night with shafts through the canopy); data-seed reshuffles the trees and the flies.
   Static planes repaint only when data-tod changes; the flies, the deer, the owl, the bat and the dust motes run on
   the engine's one clock (Deck.clock), so coming back to a slide never restarts them. Fog drifts on @keyframes amb-*. */
;(() => {
  const OV = 24, W = 1920, H = 1080
  /* ---------- helpers ---------- */
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const lerp = (a, b, f) => a + (b - a) * f
  const toL = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4, toS = c => c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055
  const rgb2ok = ([r, g, b]) => { r = toL(r / 255); g = toL(g / 255); b = toL(b / 255)
    const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b)
    return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s] }
  const ok2rgb = ([L, a, b]) => { const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3
    return [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s].map(c => Math.round(clamp(toS(c)) * 255)) }
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const mix = (a, b, f) => { const A = rgb2ok(a), B = rgb2ok(b); return ok2rgb([lerp(A[0], B[0], f), lerp(A[1], B[1], f), lerp(A[2], B[2], f)]) }
  const col = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
  const palette = stops => {
    stops = stops.map(([t, o]) => [t, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? hex(v) : v]))])
    return tod => {
      let i = 0; while (i < stops.length - 2 && tod > stops[i + 1][0]) i++
      const [t0, A] = stops[i], [t1, B] = stops[i + 1], f = clamp((tod - t0) / (t1 - t0)), o = {}
      for (const k in A) o[k] = typeof A[k] === 'number' ? lerp(A[k], B[k], f) : mix(A[k], B[k], f)
      return o
    }
  }
  const hash = (x, y, s) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1440662683); h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296 }
  const vnoise = (x, y, s, px) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    const w = i => px ? ((i % px) + px) % px : i
    const a = hash(w(xi), yi, s), b = hash(w(xi + 1), yi, s), c = hash(w(xi), yi + 1, s), d = hash(w(xi + 1), yi + 1, s)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  const fbm = (x, y, s, oct = 4, px = 0) => { let v = 0, A = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += A * vnoise(x * f, y * f, s + i * 17, px * f); n += A; A *= .5; f *= 2 } return v / n }
  const cx1 = document.createElement('canvas').getContext('2d')
  const rgbOf = v => { if (!v) return null; cx1.fillStyle = '#010203'; cx1.fillStyle = v; const o = cx1.fillStyle; if (o === '#010203') return null; if (o[0] === '#') return [1, 3, 5].map(i => parseInt(o.slice(i, i + 2), 16)); const m = o.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  // the slide's --field follows the sky behind the headline, so the engine's --ink-auto stays right at every hour
  const setField = (root, c) => { const s = root.closest('section.slide'); if (!s) return; const v = `rgb(${c.map(x => x | 0)})`; s.style.setProperty('--field', v); const ink = window.Deck?.inkOn?.(v); if (ink) s.style.setProperty('--ink-auto', ink) }
  const brandOf = (root, k) => rgbOf(getComputedStyle(root.closest('section.slide') || root).getPropertyValue(k).trim())
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  // a canvas covering scene rect (x0, y0, w, h) inside a plane div (planes overscan by OV for the parallax)
  const band = (parent, x0, y0, w, h, s = 1) => {
    const c = canvas(Math.round(w * s), Math.round(h * s))
    c.style.cssText = `left:${x0 + OV}px;top:${y0 + OV}px;width:${w}px;height:${h}px`
    parent.appendChild(c)
    const g = c.getContext('2d'); g.setTransform(s, 0, 0, s, -x0 * s, -y0 * s); return g
  }
  const wipe = g => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.restore() }
  let grainURL
  const grain = () => grainURL ??= (() => {
    const c = canvas(200, 200), g = c.getContext('2d'), d = g.createImageData(200, 200), R = rng(9)
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (R() + R() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
    g.putImageData(d, 0, 0); return c.toDataURL()
  })()
  let fogURL
  const fogMask = () => fogURL ??= (() => {   // tileable wisps: 480 × 60, stretched to 1920 × 240
    const w = 480, h = 60, c = canvas(w, h), g = c.getContext('2d'), d = g.createImageData(w, h)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = fbm(x / 60, y / 22, 5, 5, 8), env = Math.sin(Math.PI * y / (h - 1)) ** 1.6
      d.data[(y * w + x) * 4 + 3] = 255 * clamp(sm(.36, .78, n) * env * 1.15)
    }
    g.putImageData(d, 0, 0); return c.toDataURL()
  })()

  /* ---------- the hour ---------- */
  const PAL = palette([
    [0, { sky0: '#2b3d78', sky1: '#6b5c9e', sky2: '#f0a387', glow: '#ffc49b', far: '#6f6197', mid: '#3a3569', near: '#1e1b40', fog: '#d2a9c3', meadow: '#7a6a93', rim: '#f0bca6', moon: '#ffd2a6',
      glowA: 1, starA: .12, moonA: .75, beamA: 0, flies: .35, mush: 0, eye: .35, fogA: .55, rimA: .55, halo: .25 }],
    [.35, { sky0: '#1f2b68', sky1: '#45458b', sky2: '#b06e99', glow: '#e99aa9', far: '#4b4b86', mid: '#2b2a5f', near: '#171638', fog: '#9488bc', meadow: '#555589', rim: '#c0a8d6', moon: '#f8e4c8',
      glowA: .6, starA: .5, moonA: .85, beamA: 0, flies: .75, mush: .25, eye: .65, fogA: .5, rimA: .45, halo: .4 }],
    [.7, { sky0: '#18235a', sky1: '#2b3978', sky2: '#56629f', glow: '#8d90c9', far: '#35427c', mid: '#1f2657', near: '#121539', fog: '#7082ba', meadow: '#41538a', rim: '#aec1ea', moon: '#f6f3e4',
      glowA: .22, starA: .85, moonA: 1, beamA: .55, flies: .95, mush: .8, eye: .9, fogA: .48, rimA: .7, halo: .7 }],
    [1, { sky0: '#141e50', sky1: '#223272', sky2: '#405d9a', glow: '#7f9dd2', far: '#2d3f76', mid: '#1b2453', near: '#0f1436', fog: '#6380b8', meadow: '#3c5994', rim: '#bcd2f6', moon: '#fbf9ee',
      glowA: .08, starA: 1, moonA: 1, beamA: 1, flies: 1, mush: 1, eye: 1, fogA: .46, rimA: .85, halo: .85 }],
  ])
  // the moon rises out of the clearing at dusk and stands right of the headline by night
  const moonAt = tod => { const e = sm(0, 1, tod) ** .85; return [lerp(1372, 1590, e), lerp(612, 250, e), lerp(40, 30, sm(0, .6, tod))] }
  const RAYS = [[.30, .035], [.44, .05], [.58, .03], [.7, .06], [.86, .04]]   // moon shafts: angle left of straight down, half-width (rad)

  /* ---------- silhouettes (each shape its own Path2D so overlaps never punch holes) ---------- */
  function spruce(x, y, h, w, R) {      // drooping tiers, jagged
    const p = new Path2D(), n = Math.max(6, Math.min(20, Math.round(h / 15))), side = s => {
      const pts = []
      for (let i = 1; i <= n; i++) {
        const f = i / n, yy = y - h + h * f * .93, half = w / 2 * (.1 + .9 * f ** .85) * (.8 + R() * .4)
        pts.push([x + s * half, yy + h / n * (.35 + R() * .3)], [x + s * half * (.28 + R() * .12), yy + h / n * .05])
      }
      pts.push([x + s * w * .1, y + 4])
      return pts
    }
    const r = side(1), l = side(-1).reverse()
    p.moveTo(x, y - h - 4)
    for (const q of r) p.lineTo(q[0], q[1])
    for (const q of l) p.lineTo(q[0], q[1])
    p.closePath(); return p
  }
  function crown(x, y, h, w, R) {       // a broadleaf: a lumpy crown of many small clumps over a short trunk
    const p = new Path2D()
    p.rect(x - w * .03, y - h * .5, w * .06, h * .5 + 4)
    const cy = y - h * .64, n = 26 + (R() * 10 | 0)
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, d = .35 + .65 * R() ** .5, cx = x + Math.cos(a) * w * .4 * d, yy = cy + Math.sin(a) * h * .3 * d, r = w * (.07 + R() * .08) * (1.25 - d * .4)
      p.moveTo(cx + r, yy); p.arc(cx, yy, r, 0, Math.PI * 2)
    }
    p.moveTo(x + w * .25, cy); p.ellipse(x, cy, w * .3, h * .22, 0, 0, Math.PI * 2)
    return p
  }
  function bush(x, y, w, h, R) {        // a dome of small leaf clumps, no stem
    const p = new Path2D()
    for (let i = 0; i < 34; i++) { const a = Math.PI * (1 + R()), d = R() ** .45, cx = x + Math.cos(a) * w * .5 * d, cy = y + Math.sin(a) * h * d, r = 5 + R() * 11 * (1.2 - d * .5); p.moveTo(cx + r, cy); p.arc(cx, cy, r, 0, Math.PI * 2) }
    p.moveTo(x + w * .5, y); p.ellipse(x, y, w * .5, h * .7, 0, Math.PI, 0); p.rect(x - w * .5, y - 1, w, 8)
    return p
  }
  function treeline(x0, x1, base, lo, hi, R, gap, broad = .15) {   // a band of trees as a list of paths
    const out = []
    let x = x0
    while (x < x1) {
      const inGap = gap && x > gap[0] && x < gap[1]
      if (!inGap) {
        const h = lo + (hi - lo) * R() ** 1.3, w = h * (.36 + R() * .14)
        out.push(R() < broad ? crown(x, base + 6, h * .8, h * .8, R) : spruce(x, base + 6, h, w, R))
      }
      x += inGap ? 22 : 14 + R() * 26
    }
    return out
  }
  function undergrowth(x0, x1, top, R, bump = 16) {   // a lumpy bush line that hides the trunks' feet
    const p = new Path2D()
    p.moveTo(x0, top + 80)
    for (let x = x0; x <= x1; x += 9) p.lineTo(x, top - Math.abs(Math.sin(x / 23 + R() * .6)) * bump - R() * 5 + Math.sin(x / 140) * 6 + (1 - sm(x0, x0 + 70, x) * sm(x1, x1 - 70, x)) * 110)   // ends slope away
    p.lineTo(x1, top + 400); p.lineTo(x0, top + 400); p.closePath(); return p
  }
  function fern(g, x, y, len, dir, R) { // a filled frond: arching stem, leaflets tapering to a curled tip
    const n = 15, pts = [], a0 = dir > 0 ? .55 + R() * .5 : Math.PI - .55 - R() * .5, bend = dir > 0 ? -1.15 : 1.15
    for (let i = 0; i <= n; i++) { const f = i / n, a = a0 + bend * f * f; pts.push([x + Math.cos(a0 + bend * f * f * .5) * len * f, y - Math.sin(a0 + bend * f * f * .5) * len * f + f * f * len * .2]) }
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.lineWidth = 2; g.stroke()
    for (let i = 1; i < n; i++) {
      const [px, py] = pts[i], [qx, qy] = pts[i + 1], d = Math.atan2(qy - py, qx - px), f = i / n, l = len * .17 * (1 - f * .7) * (i < 3 ? .6 : 1)
      for (const s of [-1, 1]) { const a = d + s * 1.05; g.beginPath(); g.ellipse(px + Math.cos(a) * l * .55, py + Math.sin(a) * l * .55, l * .62, l * .22, a, 0, Math.PI * 2); g.fill() }
    }
  }
  function blade(g, x, y, l, bend, w = 1.8) { g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x + bend * .4, y - l * .6, x + bend, y - l); g.quadraticCurveTo(x + bend * .4 + w * .4, y - l * .6, x + w, y); g.fill() }

  /* ---------- one scene ---------- */
  function init(root) {
    const par = root.querySelector('.parallax') || root.appendChild(Object.assign(document.createElement('div'), { className: 'parallax' }))
    const plane = (k, d) => { let e = root.querySelector('.ff-' + k); if (!e) { e = document.createElement('div'); e.className = 'ff-' + k; e.dataset.depth = d; par.appendChild(e) } return e }
    const L = { sky: plane('sky', .02), far: plane('far', .05), fogFar: plane('fog-far', .08), mid: plane('mid', .13), beams: plane('beams', .18), fogNear: plane('fog-near', .2), life: plane('life', .24), near: plane('near', .34), front: plane('front', .42) }
    for (const k of ['fogFar', 'fogNear']) { L[k].classList.add('ff-fog'); if (!L[k].firstElementChild) L[k].appendChild(document.createElement('i')); L[k].firstElementChild.style.setProperty('--ff-mask', `url(${fogMask()})`) }
    let gr = root.querySelector('.ff-grain'); if (!gr) { gr = document.createElement('i'); gr.className = 'ff-grain'; root.appendChild(gr) }
    gr.style.backgroundImage = `url(${grain()})`
    const seed = +(root.dataset.seed || 7)
    const glowCss = getComputedStyle(root).getPropertyValue('--ff-glow').trim()
    const glowRGB = /^#[0-9a-f]{6}$/i.test(glowCss) ? hex(glowCss) : [206, 255, 104]
    const MU = brandOf(root, '--brand') || [120, 255, 226], MU2 = mix(MU, [255, 255, 255], .4)   // the glowing caps take the brand colour

    const G = {
      sky: band(L.sky, -OV, -OV, W + 2 * OV, 760),
      far: band(L.far, -OV, 470, W + 2 * OV, 340),
      mid: band(L.mid, -OV, 380, W + 2 * OV, 724),
      deer: band(L.mid, 1100, 640, 460, 170),
      midFront: band(L.mid, 1060, 560, 540, 300),
      beams: band(L.beams, -OV, -OV, W + 2 * OV, H + 2 * OV, .5),
      life: band(L.life, -OV, 160, W + 2 * OV, 944),
      near: band(L.near, -OV, -OV, W + 2 * OV, H + 2 * OV),
      owl: band(L.near, 1590, 330, 110, 130),
      front: band(L.front, -OV, 700, W + 2 * OV, 404),
    }

    /* the cast, fixed by the seed */
    const R = rng(seed * 131 + 3)
    const flies = []
    const zone = (n, x0, x1, y0, y1, z0, z1) => { for (let i = 0; i < n; i++) flies.push({
      x: lerp(x0, x1, R()), y: lerp(y0, y1, R() ** .8), z: lerp(z0, z1, R()),
      ax: 14 + R() * 44, ay: 6 + R() * 18, wx: .05 + R() * .16, wy: .07 + R() * .2, px: R() * 9, py: R() * 9,
      per: 3.4 + R() * 5, ph: R(), dbl: R() < .25, kind: (k => k < .36 ? 'sync' : k < .56 ? 'glow' : 'flash')(R()), jit: (R() - .5) * .22, on: R(), lit: R() }) }
    zone(14, 1190, 1470, 690, 790, .2, .35)    // over the far meadow: small, dim
    zone(70, 260, 1880, 650, 930, .4, .75)     // the glade
    zone(8, 1450, 1880, 450, 640, .3, .5)      // up among the trees
    zone(26, 120, 1900, 860, 1050, .75, 1)     // low over the ferns
    flies.forEach(f => { if (f.x < 900 && f.y < 770) f.y += 130 })   // keep the headline side calm
    const fronts = [{ x: 1580, y: 900, r: 70, ph: .1, per: 9.5 }, { x: 420, y: 985, r: 92, ph: .55, per: 12 }, { x: 1180, y: 1030, r: 56, ph: .8, per: 8 }]
    const resting = { x: 1712, y: 920 }          // the one that landed on a fern: low, slow glow
    const motes = Array.from({ length: 54 }, () => ({ a: .26 + R() * .66, r: 120 + R() * 820, s: .8 + R() * 1.4, v: 2 + R() * 5, ph: R() * 9 }))
    const blinkSeeds = Array.from({ length: 64 }, () => R())

    /* sprites */
    const glow = (() => { const s = 96, c = canvas(s, s), g = c.getContext('2d'), gd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2), [r, gg, b] = glowRGB
      gd.addColorStop(0, 'rgba(255,255,244,1)'); gd.addColorStop(.07, `rgba(${Math.min(255, r + 40)},255,${Math.min(255, b + 90)},1)`); gd.addColorStop(.16, `rgba(${r},${gg},${b},.7)`)
      gd.addColorStop(.34, `rgba(${r},${gg},${b},.26)`); gd.addColorStop(.62, `rgba(${r},${gg},${b},.08)`); gd.addColorStop(1, `rgba(${r},${gg},${b},0)`)
      g.fillStyle = gd; g.fillRect(0, 0, s, s); return c })()
    const bokeh = (() => { const s = 128, c = canvas(s, s), g = c.getContext('2d'), gd = g.createRadialGradient(s / 2, s / 2, s * .2, s / 2, s / 2, s / 2), [r, gg, b] = glowRGB
      gd.addColorStop(0, `rgba(${r},${gg},${b},.22)`); gd.addColorStop(.86, `rgba(${r},${gg},${b},.34)`); gd.addColorStop(.95, `rgba(${r},${gg},${b},.2)`); gd.addColorStop(1, `rgba(${r},${gg},${b},0)`)
      g.fillStyle = gd; g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, 7); g.fill(); return c })()

    let tod = -1, P, moon
    const fillAll = (g, paths, style) => { g.fillStyle = style; for (const p of paths) g.fill(p) }
    const rimAll = (g, paths, dx, dy, style, blur = 1.2) => { g.save(); g.translate(dx, dy); g.filter = `blur(${blur}px)`; g.fillStyle = style; for (const p of paths) g.fill(p); g.restore(); g.filter = 'none' }
    function paint() {
      P = PAL(tod); moon = moonAt(tod)
      root.style.setProperty('--ff-fog', col(P.fog))
      root.style.setProperty('--ff-fog-a', P.fogA.toFixed(2))
      root.style.background = col(P.sky1)
      setField(root, mix(P.sky0, P.sky1, .4))
      const [mx, my, mr] = moon, T = rng(seed * 977 + 1), TR = rng(seed * 31 + 5)
      const rdx = lerp(-2.2, 2, sm(.2, .8, tod)), rdy = -1.5   // rim light from the afterglow (west) or the moon (east)

      /* sky: three-stop gradient, afterglow low in the west, stars, the moon */
      let g = G.sky; wipe(g)
      let gd = g.createLinearGradient(0, 0, 0, 720); gd.addColorStop(0, col(P.sky0)); gd.addColorStop(.48, col(P.sky1)); gd.addColorStop(.86, col(P.sky2)); gd.addColorStop(1, col(P.sky2))
      g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, 760)
      g.save(); g.scale(1.6, .62)   // the afterglow: a wide low ellipse in the west, where the sun went down
      gd = g.createRadialGradient(260 / 1.6, 700 / .62, 0, 260 / 1.6, 700 / .62, 640); gd.addColorStop(0, col(P.glow, .85 * P.glowA)); gd.addColorStop(.45, col(P.glow, .3 * P.glowA)); gd.addColorStop(1, col(P.glow, 0))
      g.fillStyle = gd; g.fillRect(-OV / 1.6, -OV / .62, (W + 2 * OV) / 1.6, 760 / .62); g.restore()
      for (let i = 0; i < 360; i++) {
        const x = T() * W, y = T() ** 1.25 * 640, m = T() ** 3, a = P.starA * (.25 + .75 * m) * (1 - sm(380, 640, y) * .85) * (1 - sm(260, 60, Math.hypot(x - mx, y - my)) * .9)
        const c = T() < .2 ? [255, 226, 200] : T() < .3 ? [200, 220, 255] : [244, 244, 255]
        if (a < .02) continue
        g.fillStyle = col(c, a); const s = .7 + m * 1.6; g.fillRect(x, y, s, s)
      }
      gd = g.createRadialGradient(mx, my, mr * .8, mx, my, mr * 9); gd.addColorStop(0, col(P.moon, .3 * P.halo)); gd.addColorStop(.25, col(P.moon, .09 * P.halo)); gd.addColorStop(1, col(P.moon, 0))
      g.fillStyle = gd; g.fillRect(mx - mr * 9, my - mr * 9, mr * 18, mr * 18)
      g.save(); g.globalAlpha = P.moonA; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fillStyle = col(P.moon); g.fill(); g.clip()
      g.filter = 'blur(2.5px)'
      for (let i = 0; i < 7; i++) { const a = T() * 7, d = T() * mr * .6; g.beginPath(); g.arc(mx + Math.cos(a) * d - mr * .15, my + Math.sin(a) * d - mr * .1, mr * (.14 + T() * .2), 0, 7); g.fillStyle = col(mix(P.moon, P.sky1, .45), .16); g.fill() }
      g.filter = 'none'
      gd = g.createRadialGradient(mx - mr * .4, my - mr * .4, 0, mx, my, mr * 1.1); gd.addColorStop(0, 'rgba(255,255,255,.18)'); gd.addColorStop(1, 'rgba(0,0,0,.06)'); g.fillStyle = gd; g.fillRect(mx - mr, my - mr, 2 * mr, 2 * mr)
      g.restore()

      /* far: two rows of hazy trees, the further one almost sky */
      g = G.far; wipe(g); g.filter = 'blur(1.4px)'
      let rowA = treeline(-40, W + 40, 682, 40, 96, TR, null, .1)
      gd = g.createLinearGradient(0, 580, 0, 700); gd.addColorStop(0, col(mix(P.far, P.sky2, .3))); gd.addColorStop(1, col(mix(P.far, P.fog, .6)))
      fillAll(g, rowA, gd); g.fillStyle = gd; g.fillRect(-OV, 686, W + 2 * OV, 130)
      g.filter = 'blur(.8px)'
      const rowB = treeline(-40, W + 40, 712, 70, 160, TR, null, .2)
      gd = g.createLinearGradient(0, 560, 0, 730); gd.addColorStop(0, col(P.far)); gd.addColorStop(1, col(mix(P.far, P.fog, .45)))
      fillAll(g, rowB, gd); g.fillStyle = gd; g.fillRect(-OV, 712, W + 2 * OV, 100)
      g.filter = 'none'

      /* mid treeline with the clearing; the meadow catches the moon */
      g = G.mid; wipe(g)
      const midT = treeline(-40, W + 40, 772, 150, 330, TR, [1160, 1500], .16)
      const ug = [undergrowth(-OV, 1180, 752, TR), undergrowth(1480, W + OV, 752, TR)]
      g.fillStyle = col(mix(P.mid, P.fog, .06)); g.fill(undergrowth(-OV - 80, 1200, 668, TR, 30)); g.fill(undergrowth(1460, W + OV + 80, 668, TR, 30))   // the dark between the trunks
      rimAll(g, midT, rdx * .6, rdy * .8, col(P.rim, P.rimA * .26), 1.4)
      gd = g.createLinearGradient(0, 440, 0, 800); gd.addColorStop(0, col(P.mid)); gd.addColorStop(1, col(mix(P.mid, P.fog, .2)))
      fillAll(g, midT, gd)
      const groundC = col(mix(P.mid, P.fog, .14))
      g.fillStyle = groundC; g.fillRect(-OV, 790, W + 2 * OV, 330)
      gd = g.createLinearGradient(0, 712, 0, 800); gd.addColorStop(0, col(mix(P.meadow, P.fog, .25))); gd.addColorStop(1, groundC)
      g.fillStyle = gd; g.beginPath(); g.moveTo(1100, 808); g.bezierCurveTo(1170, 760, 1230, 734, 1300, 728); g.bezierCurveTo(1360, 722, 1380, 716, 1420, 720); g.bezierCurveTo(1480, 728, 1520, 760, 1580, 808); g.fill()
      g.fillStyle = col(mix(P.meadow, P.mid, .3))
      for (let i = 0; i < 300; i++) { const x = 1150 + TR() * 380, y = 728 + TR() * 76, l = 3 + TR() * 7; if (y < 722 + Math.abs(x - 1360) * .22) continue; blade(g, x, y, l, (TR() - .5) * 4, .7) }
      gd = g.createLinearGradient(0, 730, 0, 800); gd.addColorStop(0, col(mix(P.mid, P.near, .2))); gd.addColorStop(1, groundC)
      fillAll(g, ug, gd)

      /* bushes and two spruces at the clearing's edges, in front of the deer */
      g = G.midFront; wipe(g)
      const edge = [spruce(1128, 806, 200, 74, TR), spruce(1548, 806, 236, 86, TR)]
      for (const [bx, by, bw, bh] of [[1160, 812, 150, 70], [1530, 812, 160, 82], [1226, 818, 90, 40], [1462, 818, 70, 34]]) edge.push(bush(bx, by, bw, bh, TR))
      rimAll(g, edge, rdx * .7, rdy * .8, col(P.rim, P.rimA * .34), 1.2)
      fillAll(g, edge, col(mix(P.mid, P.near, .3)))
      gd = g.createLinearGradient(0, 786, 0, 826); gd.addColorStop(0, col(mix(P.mid, P.fog, .14), 0)); gd.addColorStop(1, col(mix(P.mid, P.fog, .14)))
      g.fillStyle = gd; g.fillRect(1060, 786, 540, 80)   // the bushes stand in the ground haze, no cut-out feet

      /* moonlight shafts fanning down-left from the moon through the misty air */
      g = G.beams; wipe(g)
      if (P.beamA > .01) {
        g.filter = 'blur(12px)'; g.globalCompositeOperation = 'lighter'
        for (const [a, w] of RAYS) {
          gd = g.createRadialGradient(mx, my, mr * 1.5, mx, my, 1100); gd.addColorStop(0, col(P.moon, 0)); gd.addColorStop(.12, col(P.moon, .13 * P.beamA)); gd.addColorStop(.5, col(P.moon, .06 * P.beamA)); gd.addColorStop(1, col(P.moon, 0))
          g.fillStyle = gd; g.beginPath(); g.moveTo(mx, my)
          g.lineTo(mx - Math.sin(a - w) * 1200, my + Math.cos(a - w) * 1200); g.lineTo(mx - Math.sin(a + w) * 1200, my + Math.cos(a + w) * 1200); g.fill()
        }
        g.filter = 'none'; g.globalCompositeOperation = 'source-over'
      }

      /* near: trunks at the edges, the owl's branch, a leafy overhang in the corner, the forest floor */
      g = G.near; wipe(g)
      const trunk = new Path2D()
      trunk.moveTo(1842, -OV); trunk.bezierCurveTo(1846, 300, 1860, 700, 1900, 1000); trunk.lineTo(1690, 1000); trunk.bezierCurveTo(1734, 700, 1742, 300, 1748, -OV); trunk.closePath()
      const branch = new Path2D()
      branch.moveTo(1752, 452); branch.bezierCurveTo(1700, 448, 1640, 444, 1576, 447); branch.lineTo(1570, 443); branch.bezierCurveTo(1640, 434, 1700, 432, 1752, 432); branch.closePath()
      branch.moveTo(1606, 442); branch.quadraticCurveTo(1580, 430, 1560, 432); branch.lineTo(1561, 429); branch.quadraticCurveTo(1585, 426, 1610, 438); branch.closePath()
      const leaves = []
      for (let i = 0; i < 170; i++) {   // the overhang: small clumps thick in the corner, ragged at the edge
        const u = TR(), x = lerp(1640, W + 30, u ** .55), edgeY = lerp(10, 190, sm(1640, W, x)) * (.9 + .2 * TR()), y = lerp(-30, edgeY, TR() ** .5), r = 9 + TR() * 20
        const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); leaves.push(p)
      }
      for (let i = 0; i < 7; i++) {      // sprigs hanging from the overhang
        const x = 1700 + TR() * 220, y0 = lerp(40, 170, sm(1640, W, x)), l = 30 + TR() * 50, p = new Path2D()
        p.rect(x, y0, 1.6, l)
        for (let k = 0; k < 4; k++) { const yy = y0 + l * (.3 + k * .2), s = k % 2 ? 1 : -1; p.moveTo(x, yy); p.ellipse(x + s * 6, yy + 3, 7, 3, s * .6, 0, Math.PI * 2) }
        leaves.push(p)
      }
      const left = new Path2D(); left.moveTo(-OV, -OV); left.lineTo(26, -OV); left.bezierCurveTo(32, 400, 46, 760, 88, 1000); left.lineTo(-OV, 1000); left.closePath()
      const floor = new Path2D(), fy = x => 958 + Math.sin(x / 210) * 18 + Math.sin(x / 67 + 2) * 7 - sm(1560, 1700, x) * 30
      floor.moveTo(-OV, H + OV); for (let x = -OV; x <= W + OV; x += 24) floor.lineTo(x, fy(x)); floor.lineTo(W + OV, H + OV); floor.closePath()
      rimAll(g, [trunk, branch, ...leaves], rdx * 1.3, rdy * 1.2, col(P.rim, P.rimA * .45), 1.6)
      const ink = col(P.near)
      fillAll(g, [trunk, branch, ...leaves, left, floor], ink)
      gd = g.createLinearGradient(1740, 0, 1900, 0); gd.addColorStop(0, col(P.rim, 0)); gd.addColorStop(.85, col(P.rim, .05 * P.rimA)); gd.addColorStop(1, col(P.rim, 0))
      g.fillStyle = gd; g.fill(trunk)   // a breath of moonlight down the trunk's lit side
      g.save(); g.clip(trunk); g.strokeStyle = col(P.rim, .045 * P.rimA + .015); g.lineWidth = 2
      for (let i = 0; i < 22; i++) { const u = TR(), x = lerp(1752, 1840, u), y0 = TR() * 900, l = 40 + TR() * 160; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 3, y0 + l * .3, x - 3, y0 + l * .6, x + (y0 / 1000) * (u - .5) * 60, y0 + l); g.stroke() }
      g.restore()
      g.fillStyle = g.strokeStyle = ink; g.lineCap = 'round'
      for (let i = 0; i < 30; i++) { const x = TR() * (W + 40) - 20; fern(g, x, fy(x) + 10, 50 + TR() * 80, TR() < .5 ? 1 : -1, TR) }
      for (let i = 0; i < 260; i++) { const x = TR() * (W + 40) - 20; blade(g, x, fy(x) + 6, 10 + TR() * 30, (TR() - .5) * 16) }
      /* glowing caps at the foot of the big trunk (bioluminescent; only once it is dark) */
      if (P.mush > .02) for (const [x, r] of [[1676, 7], [1690, 5], [1664, 4.5], [1888, 6], [1874, 4]]) {
        const y = fy(x) + 2
        gd = g.createRadialGradient(x, y, 0, x, y, r * 4); gd.addColorStop(0, col(MU, .24 * P.mush)); gd.addColorStop(1, col(MU, 0))
        g.fillStyle = gd; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8)
        g.fillStyle = ink; g.fillRect(x - 1, y - 1, 2, r * 1.3)
        g.fillStyle = col(MU2, .85 * P.mush); g.beginPath(); g.ellipse(x, y - 1, r, r * .55, 0, Math.PI, 0); g.fill()
      }
    }

    /* actors, all on the one clock */
    const flash = u => u < 0 ? 0 : u < .14 ? (u / .14) ** 1.5 : Math.exp(-(u - .14) / .42)   // J-curve: fast on, slow off
    function flyI(f, t) {
      if (f.kind === 'glow') { const u = ((t / (f.per * 1.3) + f.ph) % 1); return sm(0, .25, u) * (1 - sm(.4, .62, u)) * .85 }   // long slow glowers
      if (f.kind === 'sync') {   // loose synchrony: a burst every 13 s ripples left → right across the glade
        const burst = t % 13 - f.x / 1500 * 1.8 - f.jit
        let I = 0
        for (let k = 0; k < 4; k++) I = Math.max(I, flash(burst - k * .62))
        return I
      }
      const u = ((t / f.per + f.ph) % 1) * f.per
      return Math.max(flash(u), f.dbl ? flash(u - .45) * .8 : 0)
    }
    function drawDeer(g, t) {
      wipe(g)
      const s = (t + 41) % 97    // one crossing every 97 s, ~30 s long, with a pause to graze
      if (s > 31) return
      const walk1 = 11, graze = 6.5, walk2 = 11
      let x, moving, gz = 0, look = 0
      if (s < walk1) { x = lerp(1150, 1330, s / walk1); moving = true }
      else if (s < walk1 + graze) { x = 1330; moving = false; const u = s - walk1; gz = sm(0, .8, u) * (1 - sm(4.2, 5.2, u)); look = sm(5, 5.6, u) }
      else { const u = s - walk1 - graze; x = lerp(1330, 1530, u / walk2); moving = u < walk2; look = 1 - sm(0, .8, u) }
      const ph = moving ? s * 4.6 : 0
      g.save(); g.translate(x, 778); g.scale(1.12, 1.12)
      const hx = lerp(lerp(30, 31, look), 33, gz), hy = lerp(-64, -9, gz)
      const legs = [[14, 0, 1], [10, Math.PI, 1], [-16, Math.PI, -1], [-20, 0, -1]].map(([lx, o, front]) => {
        const sw = moving ? Math.sin(ph + o) * .34 : 0, lift = moving ? Math.max(0, Math.cos(ph + o)) * .9 : 0
        const kx = lx + Math.sin(sw) * 13 + (front > 0 ? 0 : -3), ky = -29 + Math.cos(sw) * 14
        const fx = kx + Math.sin(sw + front * lift * .8) * 15 * (front > 0 ? 1 : 1), fy = Math.min(0, ky + Math.cos(sw + lift) * 15)
        return [lx, kx, ky, fx, fy]
      })
      const shape = () => {
        g.beginPath()
        g.moveTo(-27, -36); g.bezierCurveTo(-21, -47, 4, -46, 15, -44)                                  // rump → back → withers
        g.bezierCurveTo(lerp(22, 26, gz), lerp(-50, -34, gz), hx - 6, hy + 2, hx - 2, hy - 1)            // back of the neck
        g.lineTo(hx + 4, hy + 5)
        g.bezierCurveTo(lerp(27, 30, gz), lerp(-46, -22, gz), lerp(26, 27, gz), lerp(-36, -28, gz), 23, -30)   // throat → chest
        g.bezierCurveTo(14, -22, -8, -22, -21, -27); g.bezierCurveTo(-28, -29, -30, -33, -27, -36); g.closePath(); g.fill()
        g.beginPath(); g.ellipse(hx + 3, hy + 1, 8.5, 4.2, lerp(.25, 1.2, gz), 0, 7); g.fill()
        g.beginPath(); g.ellipse(hx - 3 - look * 2, hy - 7, 2.2, 5.4, -.55 + look * .35, 0, 7); g.fill()
        g.beginPath(); g.ellipse(hx + 1 + look * 1.5, hy - 8, 2, 5, .25 - look * .35, 0, 7); g.fill()
        g.lineCap = 'round'; g.lineJoin = 'round'
        for (const [lx, kx, ky, fx, fy] of legs) { g.lineWidth = 4; g.beginPath(); g.moveTo(lx, -34); g.lineTo(kx, ky); g.stroke(); g.lineWidth = 2.2; g.beginPath(); g.moveTo(kx, ky); g.lineTo(fx, fy); g.stroke() }
      }
      const rdx = lerp(-2.2, 2, sm(.2, .8, tod))
      g.save(); g.translate(Math.sign(rdx) * .9, -.9); g.fillStyle = g.strokeStyle = col(P.rim, P.rimA * .6); shape(); g.restore()
      g.fillStyle = g.strokeStyle = col(mix(P.mid, P.near, .45)); shape()
      const flick = (s * 1.7 % 5) < .35 ? 1 : 0     // the white tail flags up now and then
      g.fillStyle = col(mix(P.rim, [240, 236, 230], .5), .5 + .35 * flick); g.beginPath(); g.ellipse(-27, -40 - flick * 3, 2.6, 5, -.5 - flick * .6, 0, 7); g.fill()
      g.fillStyle = col(P.near, .28); g.beginPath(); g.ellipse(-2, 1, 30, 3, 0, 0, 7); g.fill()   // its shadow on the grass
      g.fillStyle = col(mix(P.meadow, P.mid, .35))
      for (let i = 0; i < 26; i++) { const bx = -34 + i * 2.8, l = 3 + (i * 7.3 % 5); blade(g, bx, 3, l, ((i * 3.1) % 3) - 1.5) }   // grass in front of the hooves
      g.restore()
    }
    function drawOwl(g, t, still) {
      wipe(g)
      const x = 1640, y = 440, ink = col(mix(P.near, P.mid, .2))
      // the head swivels away and back every 37 s; blinks every few seconds, one slow sleepy blink in five
      const ht = t % 37, turn = still ? 0 : sm(0, .5, ht) * (1 - sm(3.2, 3.8, ht)) * (ht < 4 ? 1 : 0), hx = x + turn * 3
      const bi = Math.floor(t / 4.3), bt = t % 4.3, b0 = blinkSeeds[bi % 64] * 2.5, slow = bi % 5 === 3, dur = slow ? .7 : .16
      const close = !still && bt > b0 && bt < b0 + dur ? Math.sin(Math.PI * (bt - b0) / dur) : 0
      const lag = !still && bt > b0 + .05 && bt < b0 + .05 + dur ? Math.sin(Math.PI * (bt - b0 - .05) / dur) : 0   // the right eye a beat behind
      const sh = () => {
        g.beginPath(); g.ellipse(x, y - 24, 14.5, 23, 0, 0, 7); g.fill()
        g.beginPath(); g.moveTo(x - 7, y - 4); g.lineTo(x - 1, y + 9); g.lineTo(x + 4, y - 4); g.fill()
        g.beginPath(); g.ellipse(hx, y - 50, 14.5, 12.5, 0, 0, 7); g.fill()
        g.beginPath(); g.moveTo(hx - 13, y - 55); g.lineTo(hx - 12 + turn * 3, y - 69); g.lineTo(hx - 5, y - 60); g.fill()
        g.beginPath(); g.moveTo(hx + 13, y - 55); g.lineTo(hx + 12 + turn * 3, y - 69); g.lineTo(hx + 5, y - 60); g.fill()
      }
      g.save(); g.translate(1.5, -1.2); g.filter = 'blur(.8px)'; g.fillStyle = col(P.rim, P.rimA * .7); sh(); g.restore(); g.filter = 'none'
      g.fillStyle = ink; sh()
      g.strokeStyle = col(P.rim, .12 * P.rimA); g.lineWidth = 1.2; g.beginPath(); g.arc(hx - 6 * (1 - turn), y - 50, 6.5, 0, 7); g.arc(hx + 6 * (1 - turn), y - 50, 6.5, 0, 7); g.stroke()
      if (turn < .9) {
        const ew = 1 - turn, e = P.eye
        for (const [dx, c] of [[-6, close], [6, lag]]) {
          const ex = hx + dx * ew + turn * 7, ey = y - 50, open = 1 - c
          const gd = g.createRadialGradient(ex, ey, 0, ex, ey, 12); gd.addColorStop(0, `rgba(255,190,90,${.35 * e * open})`); gd.addColorStop(1, 'rgba(255,190,90,0)')
          g.fillStyle = gd; g.fillRect(ex - 12, ey - 12, 24, 24)
          g.fillStyle = `rgba(255,${180 + 30 * e | 0},${80 + 20 * e | 0},${.55 + .45 * e})`; g.beginPath(); g.ellipse(ex, ey, 3.8 * ew + .4, Math.max(.3, 3.8 * open), 0, 0, 7); g.fill()
          if (open > .4) { g.fillStyle = 'rgba(20,10,10,.9)'; g.beginPath(); g.arc(ex + turn * 1.2, ey, 1.5, 0, 7); g.fill() }
        }
        g.fillStyle = col(mix(P.near, [255, 200, 120], .3), .8); g.beginPath(); g.moveTo(hx + turn * 6, y - 46); g.lineTo(hx - 1.6 + turn * 6, y - 42); g.lineTo(hx + 1.6 + turn * 6, y - 42); g.fill()
      }
    }
    function drawBat(g, t) {
      if (tod > .62) return       // bats belong to dusk
      const s = t % 23
      if (s > 7) return
      const u = s / 7, x = lerp(1960, 1150, u), y = 300 + Math.sin(u * 19) * 24 + Math.sin(u * 7.3) * 40 - u * 50, f = Math.sin(t * 34), z = 7
      g.fillStyle = col(mix(P.near, P.sky0, .2), .9)
      g.beginPath(); g.moveTo(x - z * 1.4, y - f * z * .8); g.quadraticCurveTo(x - z * .6, y - 2, x, y + 1); g.quadraticCurveTo(x + z * .6, y - 2, x + z * 1.4, y - f * z * .8); g.quadraticCurveTo(x + z * .5, y + 1 + f, x, y + 3); g.quadraticCurveTo(x - z * .5, y + 1 + f, x - z * 1.4, y - f * z * .8); g.fill()
    }
    function frame(t, el, still) {
      const want = clamp(+root.dataset.tod || 0)
      if (want !== tod) { tod = want; paint() }
      let g = G.life; wipe(g)
      g.globalCompositeOperation = 'lighter'
      for (const f of flies) {
        if (f.on > P.flies) continue
        const x = f.x + Math.sin(t * f.wx + f.px) * f.ax + Math.sin(t * f.wx * 2.3 + f.py) * f.ax * .3
        const y = f.y + Math.sin(t * f.wy + f.py) * f.ay - Math.max(0, Math.sin(t * .05 + f.px)) * 10
        const I = still ? (f.lit < .45 ? .3 + .7 * (f.lit / .45) ** .7 : 0) : flyI(f, t)
        const r = 13 + f.z * 30, a = (.05 + .95 * I) * (.45 + .55 * f.z)
        if (a < .02) continue
        g.globalAlpha = a; g.drawImage(glow, x - r, y - r, 2 * r, 2 * r)
      }
      g.globalAlpha = (.5 + .25 * Math.sin(t * .9)) * P.flies; g.drawImage(glow, resting.x - 18, resting.y - 18, 36, 36)
      if (P.beamA > .01) {             // dust drifting in the moonlight, visible only inside the shafts
        const [mx, my] = moon
        g.fillStyle = col(P.moon)
        for (const m of motes) {
          const r = 120 + (m.r + t * m.v) % 820, a = m.a + Math.sin(t * .1 + m.ph) * .02, x = mx - Math.sin(a) * r, y = my + Math.cos(a) * r
          let k = 0; for (const [ra, rw] of RAYS) k = Math.max(k, 1 - Math.abs(a - ra) / rw)
          const al = P.beamA * clamp(k * 1.4) * (1 - r / 1000) * .5 * (.6 + .4 * Math.sin(t * 1.3 + m.ph))
          if (al < .02) continue
          g.globalAlpha = al; g.fillRect(x, y, m.s, m.s)
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
      drawBat(g, t)
      drawDeer(G.deer, t)
      drawOwl(G.owl, t, still)
      g = G.front; wipe(g); g.globalCompositeOperation = 'lighter'
      if (P.flies > .5) for (const b of fronts) {   // flies so close they are out of focus: big soft discs
        const u = ((t / b.per + b.ph) % 1) * b.per, I = still ? 0 : flash(u - 1) * .55
        if (I < .02) continue
        const x = b.x + Math.sin(t * .13 + b.ph * 9) * 50, y = b.y + Math.sin(t * .17 + b.ph * 5) * 24
        g.globalAlpha = I; g.drawImage(bokeh, x - b.r, y - b.r, b.r * 2, b.r * 2)
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
    }
    const printT = +(root.dataset.printT || 69)   // 69 s: the deer is mid-clearing, head down, grazing
    Deck.clock(root, frame, { printT })
    frame(printT, root, true)
  }

  document.querySelectorAll('.sc-fireflies').forEach(init)
  ;(window.Pack = window.Pack || {}).fireflies = { init, palette: PAL }
})()
