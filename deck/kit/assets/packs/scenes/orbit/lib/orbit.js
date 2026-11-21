/* scenes/orbit · Earth from orbit (pack item, see its README.md). Every .sc-orbit in the deck is drawn here.
   data-tod 0…1 moves the sun: 0 the day side (ocean glint, cloud swirls), 0.5 the terminator crossing the view with a
   sunset band on the limb, 1 the night side (city lights, airglow, an aurora sliver, lightning in the storms).
   The ground drifts toward the horizon on the engine's one clock (Deck.clock) together with the satellites, the station,
   the meteor and the aurora, so returning to a slide never restarts them. Space stays deep indigo, never black. */
;(() => {
  const OV = 24, W = 1920, H = 1080
  /* ---------- helpers ---------- */
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const lerp = (a, b, f) => a + (b - a) * f
  const gauss = x => Math.exp(-x * x)
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const mixc = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
  const cx1 = document.createElement('canvas').getContext('2d')
  const rgbOf = v => { if (!v) return null; cx1.fillStyle = '#010203'; cx1.fillStyle = v; const o = cx1.fillStyle; if (o === '#010203') return null; if (o[0] === '#') return [1, 3, 5].map(i => parseInt(o.slice(i, i + 2), 16)); const m = o.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  // the slide's --field follows the sky behind the headline, so the engine's --ink-auto stays right at every hour
  const setField = (root, c) => { const s = root.closest('section.slide'); if (!s) return; const v = `rgb(${c.map(x => x | 0)})`; s.style.setProperty('--field', v); const ink = window.Deck?.inkOn?.(v); if (ink) s.style.setProperty('--ink-auto', ink) }
  const brandOf = (root, k) => rgbOf(getComputedStyle(root.closest('section.slide') || root).getPropertyValue(k).trim())
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const band = (parent, x0, y0, w, h, s = 1) => {
    const c = canvas(Math.round(w * s), Math.round(h * s))
    c.style.cssText = `left:${x0 + OV}px;top:${y0 + OV}px;width:${w}px;height:${h}px`
    parent.appendChild(c)
    const g = c.getContext('2d'); g.setTransform(s, 0, 0, s, -x0 * s, -y0 * s); return g
  }
  const wipe = g => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.restore() }
  // fast periodic value noise (period px cells in x) and fbm
  const PERM = new Uint8Array(512), VAL = new Float32Array(256)
  { const R = rng(2024); for (let i = 0; i < 256; i++) { PERM[i] = i; VAL[i] = R() } for (let i = 255; i > 0; i--) { const j = R() * (i + 1) | 0, t = PERM[i]; PERM[i] = PERM[j]; PERM[j] = t } for (let i = 0; i < 256; i++) PERM[i + 256] = PERM[i] }
  const vn = (x, y, s, px) => {
    const xf0 = Math.floor(x), yf0 = Math.floor(y), xf = x - xf0, yf = y - yf0, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    const x0 = ((xf0 % px) + px) % px, x1 = (x0 + 1) % px, y0 = (yf0 + s) & 255, y1 = (y0 + 1) & 255
    const a = VAL[PERM[PERM[x0 & 255] + y0]], b = VAL[PERM[PERM[x1 & 255] + y0]], c = VAL[PERM[PERM[x0 & 255] + y1]], d = VAL[PERM[PERM[x1 & 255] + y1]]
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  const fbm = (x, y, s, oct, px) => { let v = 0, A = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += A * vn(x * f, y * f, s + i * 31, px * f); n += A; A *= .5; f *= 2 } return v / n }
  let grainURL
  const grain = () => grainURL ??= (() => {
    const c = canvas(200, 200), g = c.getContext('2d'), d = g.createImageData(200, 200), R = rng(9)
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (R() + R() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
    g.putImageData(d, 0, 0); return c.toDataURL()
  })()

  /* ---------- the planet: one tileable texture (60° of longitude, ±30° of latitude), made once per seed ---------- */
  const TW = 1024, TH = 768, LON = Math.PI / 3, LAT = Math.PI / 6
  const earths = {}
  function earth(seed) {
    if (earths[seed]) return earths[seed]
    const t0 = performance.now()
    const day = new Uint8ClampedArray(TW * TH * 3), night = new Uint8ClampedArray(TW * TH * 3), water = new Uint8ClampedArray(TW * TH), cloud = new Uint8ClampedArray(TW * TH)
    const PX = 6, s = seed * 7 & 255
    const deep = [16, 50, 110], shallow = [38, 118, 170], desert = [176, 148, 98], green = [78, 108, 58], olive = [122, 132, 76], snow = [236, 240, 246], cl = [246, 248, 255]
    for (let v = 0; v < TH; v++) for (let u = 0; u < TW; u++) {
      const x = u / TW * PX, y = v / TH * PX, i = v * TW + u
      const w = (fbm(x * .5, y * .5, s + 5, 2, PX / 2) - .5) * 1.4
      const c = fbm(x + w, y + w * .7, s, 5, PX)
      const land = sm(.5, .515, c), coast = 1 - sm(.0, .06, Math.abs(c - .5))
      const d = fbm(x * 2, y * 2, s + 13, 2, PX * 2), ridge = 1 - Math.abs(fbm(x * 4, y * 4, s + 17, 2, PX * 4) * 2 - 1)
      let g = mixc(mixc(green, olive, sm(.42, .55, d)), desert, sm(.55, .68, d))
      g = mixc(g, [96, 80, 62], sm(.5, .95, ridge) * .28 * sm(.52, .6, c)); g = mixc(g, snow, sm(.66, .74, c) * sm(.6, .7, d) * .5)
      const sea = mixc(deep, shallow, sm(.4, .5, c) * .8)
      let surf = mixc(sea, g, land)
      const cw = (fbm(x * 1, y * 1, s + 41, 2, PX) - .5) * 2.2
      const cc = fbm(x * 2 + cw, y * 3 - cw * .6, s + 23, 5, PX * 2)
      const ca = clamp(sm(.5, .72, cc) * .96 + sm(.62, .7, fbm(x * 8 + cw, y * 3, s + 29, 2, PX * 8)) * .25 * sm(.4, .55, cc))
      const dc = mixc(surf, cl, ca)
      day[i * 3] = dc[0]; day[i * 3 + 1] = dc[1]; day[i * 3 + 2] = dc[2]
      const city = land * sm(.58, .8, fbm(x * 7, y * 7, s + 51, 3, PX * 7)) * (.35 + .65 * coast) * (1 - ca * .75)
      night[i * 3] = 14 + city * 255 + ca * 24; night[i * 3 + 1] = 18 + city * 170 + ca * 26; night[i * 3 + 2] = 52 + city * 80 + ca * 58
      water[i] = (1 - land) * (1 - ca) * 255; cloud[i] = ca * 255
    }
    const R = rng(seed * 13 + 1), cities = []
    for (let k = 0; k < 60000 && cities.length < 340; k++) {
      const u = R() * TW | 0, v = R() * TH | 0, i = v * TW + u
      if (night[i * 3] > 120 && cloud[i] < 140) cities.push([(u / TW) * LON, (v / TH - .5) * 2 * LAT, .4 + R() * .6])
    }
    if (window.__obDebug) console.warn('orbit texture ms', (performance.now() - t0).toFixed(0))
    return earths[seed] = { day, night, water, cloud, cities }
  }

  /* ---------- the hour ---------- */
  const STOPS = [
    [0, { sp0: '#1c1852', sp1: '#2a2570', sp2: '#3e3f92', starA: .45, mw: .35 }],
    [.5, { sp0: '#181348', sp1: '#251c62', sp2: '#3b2a7c', starA: .75, mw: .6 }],
    [1, { sp0: '#150f40', sp1: '#1f1758', sp2: '#2e216c', starA: 1, mw: .9 }],
  ].map(([t, o]) => [t, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? hex(v) : v]))])
  const PAL = tod => { let i = tod > .5 ? 1 : 0; const [t0, A] = STOPS[i], [t1, B] = STOPS[i + 1], f = clamp((tod - t0) / (t1 - t0)), o = {}; for (const k in A) o[k] = typeof A[k] === 'number' ? lerp(A[k], B[k], f) : mixc(A[k], B[k], f); return o }
  const sunAt = tod => { const th = lerp(.2, 3.08, tod), v = [Math.sin(th), .25 - .45 * tod * tod, Math.cos(th)], n = Math.hypot(...v); return v.map(c => c / n) }
  // disc on screen: a big circle whose crest sits right of centre, so the limb rises gently from the left
  const RS = 3000, CX = 1180, CY = 742 + 3000, LIMB = x => CY - Math.sqrt(Math.max(0, RS * RS - (x - CX) ** 2))
  const OMEGA = .0028          // rad/s: the ground's drift toward the horizon (a 60° texture repeat every ~6 min)
  const DAYL = [150, 214, 255], GLOW = [70, 136, 255], DUSK = [255, 150, 80], RED = [255, 84, 96], NIGHTL = [96, 78, 196], AIR = [150, 255, 130]
  const limbColour = l => l > .18 ? DAYL : l > .02 ? mixc(DUSK, DAYL, sm(.02, .18, l)) : l > -.08 ? mixc(RED, DUSK, sm(-.08, .02, l)) : mixc(NIGHTL, RED, sm(-.2, -.08, l))

  function init(root) {
    const par = root.querySelector('.parallax') || root.appendChild(Object.assign(document.createElement('div'), { className: 'parallax' }))
    const plane = (k, d) => { let e = root.querySelector('.ob-' + k); if (!e) { e = document.createElement('div'); e.className = 'ob-' + k; e.dataset.depth = d; par.appendChild(e) } return e }
    const L = { space: plane('space', .015), sats: plane('sats', .03), earth: plane('earth', .07), station: plane('station', .2) }
    let gr = root.querySelector('.ob-grain'); if (!gr) { gr = document.createElement('i'); gr.className = 'ob-grain'; root.appendChild(gr) }
    gr.style.backgroundImage = `url(${grain()})`
    const seed = +(root.dataset.seed || 3), E = earth(seed)
    const Y0 = 600   // earth band top (room for the glow and the aurora above the limb)
    const G = {
      space: band(L.space, -OV, -OV, W + 2 * OV, H + 2 * OV),
      sats: band(L.sats, -OV, -OV, W + 2 * OV, 1000),
      earth: band(L.earth, -OV, Y0, W + 2 * OV, H + OV - Y0),
      atmo: band(L.earth, -OV, Y0, W + 2 * OV, H + OV - Y0),
      fx: band(L.earth, -OV, Y0, W + 2 * OV, H + OV - Y0),
      station: band(L.station, 1000, 160, 944, 520),
    }
    G.atmo.canvas.classList.add('ob-atmo')
    /* low-res surface: one quarter resolution, smoothed up into the crisp-edged disc */
    const Q = 3, LW = Math.ceil((W + 2 * OV) / Q), LH = Math.ceil((H + OV - Y0) / Q)
    const low = canvas(LW, LH), lg = low.getContext('2d'), img = lg.createImageData(LW, LH), D = img.data
    const N = LW * LH, U = new Float32Array(N), V = new Float32Array(N), KD = new Float32Array(N), KN = new Float32Array(N), AR = new Float32Array(N), AG = new Float32Array(N), AB = new Float32Array(N), SP = new Float32Array(N), IN = new Uint8Array(N)
    const NX = new Float32Array(N), NY = new Float32Array(N), NZ = new Float32Array(N)
    for (let j = 0; j < LH; j++) for (let i = 0; i < LW; i++) {
      const k = j * LW + i, x = -OV + (i + .5) * Q, y = Y0 + (j + .5) * Q, nx = (x - CX) / RS, ny = (CY - y) / RS, r2 = nx * nx + ny * ny
      if (r2 >= 1.0004) continue
      const nz = Math.sqrt(Math.max(0, 1 - r2)); IN[k] = 1; NX[k] = nx; NY[k] = ny; NZ[k] = nz
      const lat = Math.asin(clamp(nx, -1, 1)), lon = Math.atan2(ny, nz)
      U[k] = (lon / LON) * TW; V[k] = clamp((lat / LAT * .5 + .5) * (TH - 1), 0, TH - 1.001)
    }
    const R = rng(seed * 71 + 9)
    const sats = [   // x0,y0 → x1,y1, crossing seconds, cycle seconds, phase, kind
      { a: [1480, -30], b: [1960, 430], dur: 58, cyc: 131, ph: 8, kind: 'flare' },
      { a: [1080, -30], b: [1960, 560], dur: 46, cyc: 97, ph: 40, kind: 'swath' },
      { a: [520, 760], b: [1960, 360], dur: 70, cyc: 163, ph: 90, kind: 'plain' },
      { a: [1960, 300], b: [1150, 720], dur: 52, cyc: 119, ph: 70, kind: 'tumble' },
      { a: [1500, -30], b: [1960, 260], dur: 34, cyc: 83, ph: 20, kind: 'plain' },
    ]
    const AU = brandOf(root, '--brand') || [110, 255, 170], AU2 = brandOf(root, '--brand-2') || [210, 90, 210]   // the aurora can wear the brand
    const AUR = canvas(170, 100)     // the aurora is drawn at quarter size and smoothed up: soft for free
    let aurG
    const aurGrad = ag => aurG ??= (() => { const gd = ag.createRadialGradient(CX, CY, RS, CX, CY, RS + 140)
      gd.addColorStop(0, col(AU, .9)); gd.addColorStop(.12, col(AU, .6)); gd.addColorStop(.45, col(mixc(AU, [80, 200, 200], .25), .22)); gd.addColorStop(.75, col(AU2, .16)); gd.addColorStop(1, col(AU2, 0)); return gd })()
    const storms = Array.from({ length: 24 }, () => ({ x: R(), y: R(), p: 3 + R() * 6, ph: R() * 10 }))
    let tod = -1, P, S, sprite, nightK, tick = 0
    function paint() {
      P = PAL(tod); S = sunAt(tod)
      root.style.background = col(P.sp1)
      setField(root, mixc(P.sp0, P.sp1, .26))
      /* per-pixel light, haze and glint for the low-res surface (only the texture scrolls per frame) */
      const H2 = [S[0], S[1], S[2] + 1], hn = Math.hypot(...H2); H2[0] /= hn; H2[1] /= hn; H2[2] /= hn
      for (let k = 0; k < N; k++) {
        if (!IN[k]) continue
        const l = NX[k] * S[0] + NY[k] * S[1] + NZ[k] * S[2], nz = NZ[k]
        const dayK = sm(-.06, .3, l), nightK2 = 1 - sm(-.12, .04, l), tw = gauss((l - .01) / .07)
        const haze = (1 - nz) ** 2.4, rim = sm(.82, 1, 1 - nz)
        const hz = mixc([22, 26, 80], mixc([110, 170, 255], [255, 150, 110], tw * .6), dayK)
        KD[k] = dayK * (.55 + .45 * clamp(l * 1.6)) * (1 - haze * .75); KN[k] = nightK2 * (1 - haze * .5)
        AR[k] = hz[0] * haze * .9 + tw * 54 + rim * dayK * 40; AG[k] = hz[1] * haze * .9 + tw * 20 + rim * dayK * 60; AB[k] = hz[2] * haze * .9 + tw * 34 + rim * dayK * 80
        const sp = Math.max(0, NX[k] * H2[0] + NY[k] * H2[1] + nz * H2[2]); SP[k] = dayK * (sp ** 70 * 240 + sp ** 8 * 26)
      }
      nightK = 1 - sm(-.1, .1, (S[0] * 0 + S[1] * .95 + S[2] * .3))   // how night the view is overall
      /* space: indigo field, a faint nebula, the Milky Way top right, stars (fewer by day: the bright Earth stops them down) */
      const T = rng(seed * 977 + 1)
      let g = G.space; wipe(g)
      let gd = g.createLinearGradient(0, 0, 0, 900); gd.addColorStop(0, col(P.sp0)); gd.addColorStop(.6, col(P.sp1)); gd.addColorStop(1, col(P.sp2))
      g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, H + 2 * OV)
      gd = g.createRadialGradient(1500, 200, 0, 1500, 200, 900); gd.addColorStop(0, col([120, 70, 170], .16)); gd.addColorStop(1, col([120, 70, 170], 0)); g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, H)
      gd = g.createRadialGradient(300, 520, 0, 300, 520, 800); gd.addColorStop(0, col([40, 110, 160], .12)); gd.addColorStop(1, col([40, 110, 160], 0)); g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, H)
      const mw = canvas(240, 135), mg = mw.getContext('2d'), md = mg.createImageData(240, 135)
      for (let y = 0; y < 135; y++) for (let x = 0; x < 240; x++) {
        const X = x * 8, Y = y * 8, d = ((X - 1300) * .59 + (Y + 50) * -.81), along = ((X - 1300) * .81 + (Y + 50) * .59)
        const band = gauss(d / 130) * sm(-200, 200, along) * (1 - sm(700, 1100, along))
        const n = fbm(x / 18, y / 18, 77, 4, 64), rift = sm(.5, .62, fbm(x / 5 + 3, y / 14, 81, 3, 64)) * gauss((d + 10) / 18) * .6
        const a = band * sm(.3, .8, n) * (1 - rift * .9), o = (y * 240 + x) * 4
        md.data[o] = 200; md.data[o + 1] = 170; md.data[o + 2] = 255; md.data[o + 3] = a * 120 * P.mw
      }
      mg.putImageData(md, 0, 0); g.save(); g.filter = 'blur(10px)'; g.drawImage(mw, 0, 0, 1920, 1080); g.restore()
      for (let i = 0; i < 1400; i++) {
        let x = T() * W, y = T() * 1000
        const inBand = T() < .35, m = T() ** 4
        if (inBand) { const a = T() * 900 - 100, d = (T() - .5) * 220; x = 1300 + a * .81 + d * .59; y = -50 + a * .59 - d * .81 }
        if (y > LIMB(x) - 4) continue
        const al = P.starA * (.15 + .85 * m) * (inBand ? .7 : 1) * (1 - sm(.5, 1, (y - 500) / 400) * (1 - nightK) * .6)
        if (al < .03) continue
        g.fillStyle = col(T() < .15 ? [255, 214, 190] : T() < .3 ? [190, 210, 255] : [246, 246, 255], al)
        const s = .6 + m * 1.9; g.fillRect(x, y, s, s)
        if (m > .55) { gd = g.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, 7); gd.addColorStop(0, col([220, 220, 255], al * .35)); gd.addColorStop(1, col([220, 220, 255], 0)); g.fillStyle = gd; g.fillRect(x - 7, y - 7, 15, 15) }
      }
      /* atmosphere: glow above the limb coloured by the light at each point, the bright line, airglow on the night side */
      g = G.atmo; wipe(g)
      const a0 = -Math.PI / 2 - .5, a1 = -Math.PI / 2 + .3
      const conic = (fn) => { const c = g.createConicGradient(0, CX, CY); for (let i = 0; i <= 64; i++) { const a = a0 + (a1 - a0) * i / 64, an = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); const [rgb, al] = fn(Math.cos(a), -Math.sin(a)); c.addColorStop(an / (2 * Math.PI), col(rgb, al)) } return c }
      const lightAt = (nx, ny) => nx * S[0] + ny * S[1]
      const glowC = conic((nx, ny) => { const l = lightAt(nx, ny); return [limbColour(l), l > -.08 ? .9 : lerp(.35, .9, sm(-.3, -.08, l))] })
      const off = canvas(W + 2 * OV, H + OV - Y0), og = off.getContext('2d'); og.translate(OV, -Y0)
      og.fillStyle = glowC; og.beginPath(); og.arc(CX, CY, RS + 90, 0, 7); og.arc(CX, CY, RS - 40, 0, 7, true); og.fill()
      og.globalCompositeOperation = 'destination-in'
      gd = og.createRadialGradient(CX, CY, RS - 40, CX, CY, RS + 90)
      const r0 = 40 / 130; gd.addColorStop(0, 'rgba(0,0,0,0)'); gd.addColorStop(r0 - .1, 'rgba(0,0,0,.25)'); gd.addColorStop(r0, 'rgba(0,0,0,1)'); gd.addColorStop(r0 + .08, 'rgba(0,0,0,.45)'); gd.addColorStop(r0 + .3, 'rgba(0,0,0,.12)'); gd.addColorStop(1, 'rgba(0,0,0,0)')
      og.fillStyle = gd; og.fillRect(-OV, Y0, W + 2 * OV, H)
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore()
      g.save(); g.filter = 'blur(1px)'; g.lineWidth = 3
      g.strokeStyle = conic((nx, ny) => { const l = lightAt(nx, ny); return [mixc(limbColour(l), [255, 255, 255], l > .02 ? .45 : .1), l > -.08 ? .95 : .35] })
      g.beginPath(); g.arc(CX, CY, RS + 1, a0, a1); g.stroke()
      g.lineWidth = 3.5; g.strokeStyle = conic((nx, ny) => [AIR, .55 * (1 - sm(-.12, .02, lightAt(nx, ny)))])
      g.beginPath(); g.arc(CX, CY, RS + 9, a0, a1); g.stroke()
      g.restore()
      /* the station sprite, lit by the sun or in Earth's shadow */
      sprite = station(Math.max(0, S[2] * .6 + S[0] * .5 + .3) * (1 - sm(.62, .85, tod) * .85))
    }
    function station(lit) {    // drawn at 3× then shrunk: a truss, eight solar wings, radiators, a cross of modules
      const c = canvas(540, 252), g = c.getContext('2d'); g.translate(270, 126); g.scale(3, 3)
      const panel = mixc([26, 28, 72], [150, 108, 70], lit * .8), sheen = mixc([60, 60, 120], [255, 214, 150], lit), body = mixc([44, 44, 92], [232, 232, 236], lit), dim = mixc([34, 34, 80], [168, 170, 184], lit), rad = mixc([40, 42, 92], [246, 248, 255], lit)
      g.fillStyle = col(body); g.fillRect(-62, -1, 124, 2); g.fillStyle = col(dim); for (let x = -60; x < 60; x += 4) g.fillRect(x, -1.4, .6, 2.8)
      for (const sx of [-54, -42, 42, 54]) for (const up of [true, false]) {
        const y0 = up ? -33 : 3, gd = g.createLinearGradient(sx - 5, y0, sx + 5, y0 + 30)
        gd.addColorStop(0, col(panel)); gd.addColorStop(.55, col(mixc(panel, sheen, .35))); gd.addColorStop(1, col(panel))
        g.fillStyle = gd; g.fillRect(sx - 4.6, y0, 4.2, 30); g.fillRect(sx + .4, y0, 4.2, 30)
        g.fillStyle = col([10, 10, 40], .35); for (let k = 1; k < 10; k++) g.fillRect(sx - 4.6, y0 + k * 3, 9.2, .35)
        g.fillStyle = col(dim); g.fillRect(sx - .4, up ? y0 : 1, .8, 32)
      }
      g.fillStyle = col(rad); for (const sx of [-22, -15, 12, 19]) g.fillRect(sx, 2.5, 3.2, 12)
      g.fillStyle = col(body); g.beginPath(); g.roundRect(-14, -3.2, 28, 6.4, 3); g.roundRect(-3.2, -12, 6.4, 24, 3); g.roundRect(-20, -2.2, 7, 4.4, 2); g.fill()
      g.fillStyle = col([0, 0, 40], .22); g.fillRect(-14, 1, 28, 2.2)
      g.fillStyle = col(mixc(body, [255, 255, 255], .5), .8); g.fillRect(-13, -3, 26, .8)
      return c
    }
    const satPos = (s, t) => { const u = ((t + s.ph) % s.cyc) / s.dur; return u > 1 ? null : [lerp(s.a[0], s.b[0], u), lerp(s.a[1], s.b[1], u), u] }
    function frame(t, el, still) {
      const want = clamp(+root.dataset.tod || 0)
      if (want !== tod) { tod = want; paint() }
      /* the ground: the texture slides toward the horizon (lon grows), lit per pixel */
      const { day, night, water } = E, shift = (t * OMEGA / LON) * TW
      if (still || (++tick & 1)) {      // the ground moves a few px a second: 30 updates a second is plenty
      for (let k = 0; k < N; k++) {
        const o = k * 4
        if (!IN[k]) { D[o + 3] = 0; continue }
        let u = U[k] - shift; u -= Math.floor(u / TW) * TW
        const u0 = u | 0, f = u - u0, u1 = u0 + 1 === TW ? 0 : u0 + 1, vv = V[k], v0 = vv | 0, e = vv - v0
        const r0 = v0 * TW, r1 = r0 + TW, a = (r0 + u0) * 3, b = (r0 + u1) * 3, c = (r1 + u0) * 3, d = (r1 + u1) * 3
        const w00 = (1 - f) * (1 - e), w10 = f * (1 - e), w01 = (1 - f) * e, w11 = f * e, kd = KD[k], kn = KN[k]
        const sp = SP[k] * (water[r0 + u0] * w00 + water[r0 + u1] * w10 + water[r1 + u0] * w01 + water[r1 + u1] * w11) / 255
        D[o] = kd * (day[a] * w00 + day[b] * w10 + day[c] * w01 + day[d] * w11) + kn * (night[a] * w00 + night[b] * w10 + night[c] * w01 + night[d] * w11) + AR[k] + sp
        D[o + 1] = kd * (day[a + 1] * w00 + day[b + 1] * w10 + day[c + 1] * w01 + day[d + 1] * w11) + kn * (night[a + 1] * w00 + night[b + 1] * w10 + night[c + 1] * w01 + night[d + 1] * w11) + AG[k] + sp
        D[o + 2] = kd * (day[a + 2] * w00 + day[b + 2] * w10 + day[c + 2] * w01 + day[d + 2] * w11) + kn * (night[a + 2] * w00 + night[b + 2] * w10 + night[c + 2] * w01 + night[d + 2] * w11) + AB[k] + sp * .9
        D[o + 3] = 255
      }
      lg.putImageData(img, 0, 0)
      }
      let g = G.earth; wipe(g)
      g.save(); g.beginPath(); g.arc(CX, CY, RS, 0, 7); g.clip(); g.imageSmoothingQuality = 'high'
      g.drawImage(low, -OV, Y0, LW * Q, LH * Q)
      /* crisp city lights on the night side, riding the same drift */
      if (tod > .3) {
        g.globalCompositeOperation = 'lighter'
        const rot = t * OMEGA
        for (const [lo, la, b] of E.cities) for (const kk of [0, 1]) {
          const lon = lo + rot % LON + kk * LON, cl = Math.cos(la), nx = Math.sin(la), ny = cl * Math.sin(lon), nz = cl * Math.cos(lon)
          if (nz < .02) continue
          const l = nx * S[0] + ny * S[1] + nz * S[2], dark = 1 - sm(-.1, .05, l)
          if (dark < .05) continue
          const x = CX + nx * RS, y = CY - ny * RS
          if (y < Y0 || x < -OV || x > W + OV) continue
          g.fillStyle = col([255, 196, 120], dark * b * sm(0, .2, nz) * .9); g.fillRect(x - .7, y - .5, 1.6 + nz, 1.1 + nz * .8)
        }
        g.globalCompositeOperation = 'source-over'
      }
      g.restore()
      /* lightning, the meteor and the aurora: on their own layer, one clock */
      g = G.fx; wipe(g); g.globalCompositeOperation = 'lighter'
      if (nightK > .2 || tod > .45) for (const st of storms) {
        const u = (t + st.ph) % st.p
        if (u > .5 && !(still && st.ph < 2)) continue
        const x = lerp(120, 1500, st.x), y = lerp(LIMB(x) + 60, 1060, st.y ** .8)
        const nx = (x - CX) / RS, ny = (CY - y) / RS, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), l = nx * S[0] + ny * S[1] + nz * S[2]
        if (l > -.05) continue
        const I = still ? .6 : (u < .06 ? 1 : u < .12 ? .2 : u < .2 ? .8 : Math.exp(-(u - .2) / .08)) * (1 - sm(-.05, .05, l))
        const r = 26 * (.5 + nz)
        const gd = g.createRadialGradient(x, y, 0, x, y, r); gd.addColorStop(0, col([220, 230, 255], .55 * I)); gd.addColorStop(.3, col([150, 170, 255], .2 * I)); gd.addColorStop(1, col([120, 140, 255], 0))
        g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r)
      }
      const mt = (t + 17) % 61           // a meteor burns up below us once a minute
      if (mt < .9 && !still) {
        const u = mt / .9, x = lerp(1380, 1180, u), y = LIMB(x) + lerp(60, 110, u), al = Math.sin(Math.PI * u)
        const gd = g.createLinearGradient(x, y, x + 90, y - 30); gd.addColorStop(0, col([210, 255, 220], .9 * al)); gd.addColorStop(1, col([120, 255, 180], 0))
        g.strokeStyle = gd; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90, y - 30); g.stroke()
        g.fillStyle = col([255, 255, 240], al); g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill()
      }
      const aur = sm(.5, .85, tod)
      if (aur > .01) {                    // an aurora sliver standing on the limb toward the pole (left): soft rays that fold and travel
        const ag = AUR.getContext('2d'); ag.setTransform(1, 0, 0, 1, 0, 0); ag.clearRect(0, 0, AUR.width, AUR.height); ag.setTransform(1 / 4, 0, 0, 1 / 4, 40 / 4, -700 / 4)
        ag.globalCompositeOperation = 'lighter'; ag.strokeStyle = aurGrad(ag); ag.lineWidth = 9
        for (let i = 0; i < 70; i++) {
          const f = i / 70, a = -Math.PI / 2 - .43 + f * .2, env = Math.sin(Math.PI * f), hgt = (50 + 70 * (.5 + .5 * Math.sin(f * 19 + t * .5)) * (.6 + .4 * Math.sin(f * 6 - t * .23))) * env ** .5
          ag.globalAlpha = aur * (.3 + .7 * (.5 + .5 * Math.sin(f * 47 + t * 1.3))) * env ** 1.4 * .55
          ag.beginPath(); ag.moveTo(CX + Math.cos(a) * (RS + 4), CY + Math.sin(a) * (RS + 4)); ag.lineTo(CX + Math.cos(a) * (RS + 4 + hgt), CY + Math.sin(a) * (RS + 4 + hgt)); ag.stroke()
        }
        g.globalAlpha = 1; g.drawImage(AUR, -40, 700, AUR.width * 4, AUR.height * 4)
      }
      g.globalCompositeOperation = 'source-over'
      /* satellites: points of sunlight on different inclinations */
      g = G.sats; wipe(g); g.globalCompositeOperation = 'lighter'
      for (const s of sats) {
        const p = satPos(s, still ? s.ph * .2 + 30 : t)
        if (!p) continue
        const [x, y, u] = p
        let b = .75
        if (s.kind === 'tumble') b = .35 + .45 * Math.abs(Math.sin(t * 2.4))                        // a spent rocket stage, tumbling
        if (s.kind === 'flare') b = .7 + 3 * gauss((u - .55) / .025)                      // the mirror-flat antenna catches the sun once
        if (tod > .6 && s.kind !== 'swath') b *= 1 - sm(.62, .7, u) * sm(.6, .8, tod)               // it slides into Earth's shadow and goes out
        b *= sm(0, .05, u) * (1 - sm(.95, 1, u))
        if (b < .02) continue
        if (s.kind === 'swath') {     // an imaging satellite: its faint sensor swath trails behind it
          const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], n = Math.hypot(dx, dy), tx = -dx / n, ty = -dy / n
          const gd = g.createLinearGradient(x, y, x + tx * 220, y + ty * 220); gd.addColorStop(0, col([150, 200, 255], .16 * b)); gd.addColorStop(1, col([150, 200, 255], 0))
          g.fillStyle = gd; g.beginPath(); g.moveTo(x, y); g.lineTo(x + tx * 220 - ty * 16, y + ty * 220 + tx * 16); g.lineTo(x + tx * 220 + ty * 16, y + ty * 220 - tx * 16); g.fill()
        }
        const r = 2 + Math.min(b, 1.2) * 3 + Math.max(0, b - 1.2) * 2.5, gd = g.createRadialGradient(x, y, 0, x, y, r * 2.2); gd.addColorStop(0, col([255, 252, 240], Math.min(1, b))); gd.addColorStop(.35, col([200, 220, 255], .35 * Math.min(1, b))); gd.addColorStop(1, col([200, 220, 255], 0))
        g.fillStyle = gd; g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4)
      }
      g.globalCompositeOperation = 'source-over'
      /* the station: drifts across the right, panels glint now and then, nav lights blink */
      g = G.station; wipe(g)
      const st = still ? .5 : ((t + 120) % 300) / 230
      if (st <= 1) {
        const x = lerp(2010, 1080, st), y = lerp(250, 470, st) + Math.sin(st * 3) * 10, ang = -.16 + st * .05
        g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(sprite, -90, -42, 180, 84)
        const gl = (t % 11.3), lit = 1 - sm(.62, .85, tod) * .9
        if (gl < .7 && !still && lit > .3) {
          const I = Math.sin(Math.PI * gl / .7) * lit, gx = -54, gy = -20
          const gd = g.createRadialGradient(gx, gy, 0, gx, gy, 26); gd.addColorStop(0, col([255, 250, 230], .9 * I)); gd.addColorStop(.2, col([255, 230, 180], .35 * I)); gd.addColorStop(1, col([255, 230, 180], 0))
          g.globalCompositeOperation = 'lighter'; g.fillStyle = gd; g.fillRect(gx - 26, gy - 26, 52, 52)
          g.strokeStyle = col([255, 250, 230], .5 * I); g.lineWidth = .8; g.beginPath(); g.moveTo(gx - 30 * I, gy); g.lineTo(gx + 30 * I, gy); g.moveTo(gx, gy - 18 * I); g.lineTo(gx, gy + 18 * I); g.stroke()
          g.globalCompositeOperation = 'source-over'
        }
        const bl = (t % 2) < .12 || still
        if (bl) { g.globalCompositeOperation = 'lighter'; for (const [lx, c] of [[-62, [255, 60, 60]], [62, [80, 255, 120]]]) { const gd = g.createRadialGradient(lx, 0, 0, lx, 0, 6); gd.addColorStop(0, col(c, .95)); gd.addColorStop(1, col(c, 0)); g.fillStyle = gd; g.fillRect(lx - 6, -6, 12, 12) } g.globalCompositeOperation = 'source-over' }
        g.restore()
      }
    }
    const printT = +(root.dataset.printT || 40)
    Deck.clock(root, frame, { printT })
    frame(printT, root, true)
  }

  document.querySelectorAll('.sc-orbit').forEach(init)
  ;(window.Pack = window.Pack || {}).orbit = { init }
})()
