/* scenes/rain-window · looking out of a café window on a rainy evening (pack item, see its README.md).
   Every .sc-rain-window in the deck is drawn here. Back to front: the street beyond (blurred, bokeh, wet road), rain on
   the outside of the glass (drops that slide, pause, merge and wipe the mist of small droplets), the inside of the glass
   (the café's lamps reflected, the name in mirrored gold leaf, condensation thick at the edges with drips running down
   it), the sill with a steaming cup. data-tod 0…1: 0 blue hour, 0.5 evening, 1 late night (fewer cars, the last tram,
   stronger reflections because it is darker outside). The drops are a simulation stepped by the engine's one clock
   (Deck.clock): it pauses off-slide and carries on where it was, never restarts. */
;(() => {
  const OV = 24, W = 1920, H = 1080, PW = W + 2 * OV, PH = H + 2 * OV
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const lerp = (a, b, f) => a + (b - a) * f
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const mixc = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]
  const col = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const cx1 = canvas(1, 1).getContext('2d')
  const rgbOf = v => { if (!v) return null; cx1.fillStyle = '#010203'; cx1.fillStyle = v; const o = cx1.fillStyle; if (o === '#010203') return null; if (o[0] === '#') return hex(o); const m = o.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  const setField = (root, c) => { const s = root.closest('section.slide'); if (!s) return; const v = `rgb(${c.map(x => x | 0)})`; s.style.setProperty('--field', v); const ink = window.Deck?.inkOn?.(v); if (ink) s.style.setProperty('--ink-auto', ink) }
  const brandOf = (root, k) => rgbOf(getComputedStyle(root.closest('section.slide') || root).getPropertyValue(k).trim())
  // a canvas over the whole plane (scene coords, overscan included), at scale s
  const layer = (parent, s = 1, cls) => { const c = canvas(Math.round(PW * s), Math.round(PH * s)); if (cls) c.className = cls; parent.appendChild(c); const g = c.getContext('2d'); g.setTransform(s, 0, 0, s, OV * s, OV * s); return g }
  const wipe = g => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.restore() }
  const disc = (rgb, rim = .78) => { const s = 64, c = canvas(s, s), g = c.getContext('2d'), gd = g.createRadialGradient(32, 32, 0, 32, 32, 32)   // a bokeh disc: flat, a brighter rim, soft edge
    gd.addColorStop(0, col(rgb, .55)); gd.addColorStop(.78, col(rgb, .62)); gd.addColorStop(.9, col(rgb, rim)); gd.addColorStop(1, col(rgb, 0)); g.fillStyle = gd; g.fillRect(0, 0, s, s); return c }
  const soft = rgb => { const s = 64, c = canvas(s, s), g = c.getContext('2d'), gd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    gd.addColorStop(0, col(rgb, 1)); gd.addColorStop(.25, col(rgb, .5)); gd.addColorStop(1, col(rgb, 0)); g.fillStyle = gd; g.fillRect(0, 0, s, s); return c }

  const STOPS = [
    [0, { sky0: '#22356a', sky1: '#3d4f86', glow: '#c98a78', facade: '#1e2346', road: '#262c4e', fog: '#c9d3ec', lit: .55, cars: 1, refl: .28, neon: .65 }],
    [.5, { sky0: '#1d2257', sky1: '#2e2a66', glow: '#93557e', facade: '#191a3e', road: '#1f2145', fog: '#cfcde6', lit: .48, cars: .8, refl: .42, neon: .9 }],
    [1, { sky0: '#1b1848', sky1: '#261d55', glow: '#6a3b72', facade: '#151434', road: '#1b1a3c', fog: '#d8cfe2', lit: .3, cars: .45, refl: .58, neon: 1 }],
  ].map(([t, o]) => [t, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? hex(v) : v]))])
  const PAL = tod => { const i = tod > .5 ? 1 : 0, [t0, A] = STOPS[i], [t1, B] = STOPS[i + 1], f = clamp((tod - t0) / (t1 - t0)), o = {}; for (const k in A) o[k] = typeof A[k] === 'number' ? lerp(A[k], B[k], f) : mixc(A[k], B[k], f); return o }
  const WARM = [255, 200, 130], SODIUM = [255, 166, 84], WHITE = [255, 240, 220], RED = [255, 60, 70], GREEN = [70, 255, 140], AMBER = [255, 180, 60]
  const LAMPS = [[260, 410], [980, 430], [1700, 405]]

  function init(root) {
    const par = root.querySelector('.parallax') || root.appendChild(Object.assign(document.createElement('div'), { className: 'parallax' }))
    const plane = (k, d) => { let e = root.querySelector('.rw-' + k); if (!e) { e = document.createElement('div'); e.className = 'rw-' + k; e.dataset.depth = d; par.appendChild(e) } return e }
    const L = { street: plane('street', .04), glass: plane('glass', .1), sill: plane('sill', .22) }
    const seed = +(root.dataset.seed || 11), R = rng(seed * 91 + 1)
    const word = (w => !w || w.includes('__') ? 'Café' : w)(root.dataset.word)
    const NEON = brandOf(root, '--brand') || [255, 92, 168]          // the neon sign across the street wears the brand
    const G = {
      street: layer(L.street, .5),
      micro: layer(L.glass, 1), drops: layer(L.glass, 1),
      inside: layer(L.glass, .5, 'rw-in'), fog: layer(L.glass, .5, 'rw-fog'),
      sill: layer(L.sill, 1), steam: layer(L.sill, .5),
    }
    const S0 = canvas(PW / 2, PH / 2), s0 = S0.getContext('2d')
    const FOG0 = canvas(PW / 2, PH / 2), fg0 = FOG0.getContext('2d')
    const TR = canvas(PW / 2, PH / 2), tr = TR.getContext('2d'); tr.setTransform(.5, 0, 0, .5, OV / 2, OV / 2)
    const SP = { lamp: disc(SODIUM), warm: disc(WARM, .8), white: disc(WHITE, .95), red: disc(RED), green: disc(GREEN), amber: disc(AMBER), neon: disc(NEON), softW: soft(WHITE), softR: soft(RED), softG: soft(GREEN), softA: soft(AMBER), softB: soft([160, 200, 255]) }
    const dropShade = (() => { const s = 96, c = canvas(s, s), g = c.getContext('2d')
      let gd = g.createRadialGradient(48, 56, 30, 48, 48, 48); gd.addColorStop(0, 'rgba(10,10,30,0)'); gd.addColorStop(.85, 'rgba(10,10,30,.32)'); gd.addColorStop(1, 'rgba(10,10,30,.55)'); g.fillStyle = gd; g.beginPath(); g.arc(48, 48, 48, 0, 7); g.fill()
      gd = g.createRadialGradient(34, 30, 2, 40, 36, 30); gd.addColorStop(0, 'rgba(255,255,255,.55)'); gd.addColorStop(.5, 'rgba(255,255,255,.12)'); gd.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gd; g.beginPath(); g.arc(48, 48, 46, 0, 7); g.fill()
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(34, 28, 6, 4, -.6, 0, 7); g.fill()
      gd = g.createLinearGradient(0, 70, 0, 96); gd.addColorStop(0, 'rgba(255,240,220,0)'); gd.addColorStop(1, 'rgba(255,240,220,.35)'); g.fillStyle = gd; g.beginPath(); g.arc(48, 48, 46, .3, Math.PI - .3); g.fill()
      return c })()
    const micro = (() => { const s = 16, c = canvas(s, s), g = c.getContext('2d'), gd = g.createRadialGradient(7, 6, 0, 8, 8, 8)
      gd.addColorStop(0, 'rgba(255,255,255,.55)'); gd.addColorStop(.45, 'rgba(200,210,240,.18)'); gd.addColorStop(.8, 'rgba(10,10,30,.3)'); gd.addColorStop(1, 'rgba(10,10,30,0)'); g.fillStyle = gd; g.fillRect(0, 0, s, s); return c })()

    const UMB = [[46, 34, 70], [92, 40, 66]].map(c => { const s = canvas(100, 130), g = s.getContext('2d'); g.filter = 'blur(5px)'; g.fillStyle = col(c, .8)
      g.beginPath(); g.ellipse(50, 38, 38, 22, 0, Math.PI, 0); g.fill(); g.fillRect(48, 36, 3, 14); g.beginPath(); g.ellipse(50, 66, 13, 18, 0, 0, 7); g.fill(); g.fillRect(40, 70, 20, 44); return s })
    let TRAM
    function paintTram() {   // the tram: livery, lit windows with a few passengers, a pantograph; blurred like the rest of the street
      const c = canvas(650, 150), g = c.getContext('2d'), last = tod > .85; g.scale(.5, .5); g.translate(40, 40)
      g.fillStyle = col(mixc(P.facade, [30, 40, 60], .4)); g.beginPath(); g.moveTo(60, 50); g.lineTo(1200, 50); g.lineTo(1200, 230); g.lineTo(10, 230); g.lineTo(0, 120); g.closePath(); g.fill()
      g.fillStyle = col(mixc([40, 140, 140], P.facade, .45)); g.fillRect(10, 175, 1190, 30)
      const T = rng(seed + 5)
      for (let k = 0; k < 11; k++) { const x = 70 + k * 102, on = !last || k % 3 === 0; g.fillStyle = col(on ? [255, 214, 150] : [70, 70, 100], on ? .95 : .7); g.fillRect(x, 70, 80, 90)
        if (on && !last && T() < .55) { g.fillStyle = col([60, 40, 50], .8); g.beginPath(); g.ellipse(x + 20 + T() * 40, 128, 16, 22, 0, 0, 7); g.fill(); g.fillRect(x + 6 + T() * 40, 140, 34, 20) } }
      g.strokeStyle = col(P.facade); g.lineWidth = 6; g.beginPath(); g.moveTo(560, 50); g.lineTo(600, -30); g.lineTo(660, -30); g.moveTo(700, 50); g.lineTo(600, -30); g.stroke()
      const B = canvas(650, 150), bg = B.getContext('2d'); bg.filter = 'blur(5px)'; bg.drawImage(c, 0, 0); TRAM = B
    }
    let tod = -1, P
    /* ---------- the street beyond: painted once per hour, then blurred like a lens wide open ---------- */
    function paintStreet() {
      const g = s0; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S0.width, S0.height); g.setTransform(.5, 0, 0, .5, OV / 2, OV / 2)
      const T = rng(seed * 7 + 3)
      let gd = g.createLinearGradient(0, 0, 0, 560); gd.addColorStop(0, col(P.sky0)); gd.addColorStop(.6, col(P.sky1)); gd.addColorStop(1, col(P.glow))
      g.fillStyle = gd; g.fillRect(-OV, -OV, PW, 800)
      // buildings across the street, lit windows (warm, a few cool, one TV-blue)
      let x = -OV
      while (x < W + OV) {
        const bw = 180 + T() * 220, top = 250 + T() * 110, fc = mixc(P.facade, P.sky1, T() * .18)
        g.fillStyle = col(fc); g.fillRect(x, top, bw + 2, 800 - top)
        if (T() < .4) { g.fillRect(x + bw * .2, top - 26, 16, 26); g.fillRect(x + bw * .7, top - 12, 40, 12) }
        for (let y = top + 34; y < 520; y += 58) for (let wx = x + 22; wx < x + bw - 30; wx += 52) {
          const r = T(); if (r > P.lit) continue
          const c = r < .04 ? [140, 180, 255] : r < .12 ? [220, 230, 255] : mixc(WARM, [255, 230, 170], T())
          g.fillStyle = col(c, .75 + T() * .25); g.fillRect(wx, y, 26, 34)
        }
        x += bw
      }
      // shopfronts at street level: warm windows, a striped awning, the neon sign, a pharmacy cross
      g.fillStyle = col(mixc(P.facade, [0, 0, 0], .2)); g.fillRect(-OV, 540, PW, 230)
      for (const [sx, sw, c] of [[-10, 330, WARM], [420, 300, [255, 220, 170]], [820, 380, WARM], [1300, 260, [210, 230, 255]], [1640, 320, WARM]]) {
        g.fillStyle = col(c, .85); g.fillRect(sx, 600, sw, 150)
        g.fillStyle = col(P.facade, .7); for (let k = sx + 60; k < sx + sw; k += 80) g.fillRect(k, 600, 8, 150)
      }
      for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? 'rgba(230,80,70,.9)' : 'rgba(250,240,225,.9)'; g.fillRect(820 + k * 32, 560, 32, 36) }
      g.save(); g.font = `800 64px ${getComputedStyle(root).fontFamily}`; g.textAlign = 'center'; g.shadowColor = col(NEON); g.shadowBlur = 30; g.fillStyle = col(mixc(NEON, [255, 255, 255], .35), P.neon); g.fillText('OPEN', 545, 590); g.restore()
      // the wet road: the shopfronts and windows smeared downward in reflection
      gd = g.createLinearGradient(0, 760, 0, 1104); gd.addColorStop(0, col(mixc(P.road, P.glow, .25))); gd.addColorStop(1, col(P.road)); g.fillStyle = gd; g.fillRect(-OV, 760, PW, 400)
      g.save(); g.globalAlpha = .45; g.translate(0, 760 * 2 + 20); g.scale(1, -1.15); g.drawImage(S0, 0, 600 / 2 + OV / 2 - 2, S0.width, 170 / 2, -OV, 600 / 1.15 - 120, PW, 170); g.restore()
      g.fillStyle = col(mixc(P.road, [255, 255, 255], .12)); g.fillRect(-OV, 760, PW, 8)
      for (const [lx] of LAMPS) { g.fillStyle = col(P.facade); g.fillRect(lx - 5, 420, 10, 340) }
      g.globalCompositeOperation = 'lighter'
      for (const [lx] of LAMPS) { gd = g.createLinearGradient(0, 780, 0, 1100); gd.addColorStop(0, col(SODIUM, .55)); gd.addColorStop(1, col(SODIUM, 0)); g.fillStyle = gd; g.fillRect(lx - 16, 780, 32, 320) }   // long reflections on the wet road
      gd = g.createLinearGradient(0, 790, 0, 1060); gd.addColorStop(0, col(NEON, .3 * P.neon)); gd.addColorStop(1, col(NEON, 0)); g.fillStyle = gd; g.fillRect(470, 790, 150, 270)
      g.globalCompositeOperation = 'source-over'
      // blur everything like the far side of a wide-open lens
      const B = canvas(S0.width, S0.height), bg = B.getContext('2d'); bg.filter = 'blur(9px)'; bg.drawImage(S0, 0, 0)
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S0.width, S0.height); g.drawImage(B, 0, 0); g.setTransform(.5, 0, 0, .5, OV / 2, OV / 2)
      // light that stays round: street lamps and their long reflections, bright windows as bokeh
      g.globalCompositeOperation = 'lighter'
      for (const [lx, ly] of LAMPS) g.drawImage(SP.lamp, lx - 46, ly - 46, 92, 92)
      for (let i = 0; i < 12; i++) { const bx = T() * W, by = 360 + T() * 180, r = 8 + T() * 16; if (bx < 1150 && by < 380) continue; g.globalAlpha = .14 + T() * .2; g.drawImage(T() < .7 ? SP.warm : SP.white, bx - r, by - r, 2 * r, 2 * r) }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
    }
    /* ---------- the inside of the glass: lamps reflected, mirrored gold leaf, condensation ---------- */
    function paintInside() {
      const g = G.inside; wipe(g)
      const k = P.refl
      for (const [lx, ly] of [[1560, 120], [1728, 160], [1868, 104]]) {
        g.strokeStyle = col([255, 210, 160], .25 * k); g.lineWidth = 2; g.beginPath(); g.moveTo(lx, -OV); g.lineTo(lx, ly - 20); g.stroke()
        let gd = g.createRadialGradient(lx, ly, 0, lx, ly, 120); gd.addColorStop(0, col([255, 214, 150], .5 * k)); gd.addColorStop(.18, col([255, 190, 120], .22 * k)); gd.addColorStop(1, col([255, 170, 110], 0)); g.fillStyle = gd; g.fillRect(lx - 120, ly - 120, 240, 240)
        g.fillStyle = col([255, 236, 200], .7 * k); g.beginPath(); g.ellipse(lx, ly - 4, 16, 9, 0, Math.PI, 0); g.fill()
      }
      let gd = g.createLinearGradient(0, 640, 0, 1080); gd.addColorStop(0, col([255, 190, 130], 0)); gd.addColorStop(1, col([255, 190, 130], .18 * k)); g.fillStyle = gd; g.fillRect(-OV, 640, PW, 460)
      // the café's name in gold leaf on the inside of the pane: we read it backwards
      g.save(); g.translate(1600, 330); g.scale(-1, 1)
      const fam = getComputedStyle(root).fontFamily, fs = Math.min(84, 980 / Math.max(4, word.length))
      g.font = `800 ${fs}px ${fam}`; g.textAlign = 'center'; g.textBaseline = 'middle'
      gd = g.createLinearGradient(0, -fs / 2, 0, fs / 2); gd.addColorStop(0, 'rgba(255,226,150,.7)'); gd.addColorStop(.5, 'rgba(214,160,72,.62)'); gd.addColorStop(1, 'rgba(255,214,130,.7)')
      g.lineWidth = 3; g.strokeStyle = 'rgba(90,50,20,.45)'; g.strokeText(word, 0, 0); g.fillStyle = gd; g.fillText(word, 0, 0)
      g.font = `600 22px ${fam}`; g.fillStyle = 'rgba(240,200,120,.5)'; g.fillText('C O F F E E   ·   B R E A D', 0, fs * .72)
      g.restore()
      // condensation: thick at the bottom edge and the corners, a breath across the middle
      const f = fg0; f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, FOG0.width, FOG0.height)
      const id = f.createImageData(FOG0.width, FOG0.height), d = id.data, fogc = mixc(P.fog, [255, 214, 180], .2), T = rng(seed * 3 + 9)
      const noise = new Float32Array(64 * 36); for (let i = 0; i < noise.length; i++) noise[i] = T()
      const nz = (x, y) => { const X = x / 16, Y = y / 16, xi = X | 0, yi = Y | 0, u = X - xi, v = Y - yi, a = noise[(yi % 36) * 64 + xi % 64], b = noise[(yi % 36) * 64 + (xi + 1) % 64], c = noise[((yi + 1) % 36) * 64 + xi % 64], e = noise[((yi + 1) % 36) * 64 + (xi + 1) % 64]; return lerp(lerp(a, b, u), lerp(c, e, u), v) }
      for (let y = 0; y < FOG0.height; y++) for (let x = 0; x < FOG0.width; x++) {
        const X = x * 2 - OV, Y = y * 2 - OV, edgeB = sm(760, 1010, Y), corner = Math.max(sm(560, 0, Math.hypot(X - W, Y)) , sm(420, 0, Math.hypot(X, Y - H)) * .8, sm(380, 0, Math.hypot(X - W, Y - H)))
        const n = nz(x, y) * .6 + nz(x * 3.1, y * 3.1) * .4, a = clamp(.05 + edgeB * .62 * (.65 + .5 * n) + corner * .35 * (.6 + .6 * n) + sm(.72, .9, n) * .05)
        const o = (y * FOG0.width + x) * 4; d[o] = fogc[0]; d[o + 1] = fogc[1]; d[o + 2] = fogc[2]; d[o + 3] = a * 150
      }
      f.putImageData(id, 0, 0)
    }
    /* ---------- the sill, the cup, a little plant (inside, warm) ---------- */
    function paintSill() {
      const g = G.sill; wipe(g)
      const warm = mixc([150, 92, 58], [90, 60, 70], sm(.3, 1, tod)), top = 1004
      let gd = g.createLinearGradient(0, top, 0, top + 30); gd.addColorStop(0, col(mixc(warm, [255, 210, 160], .35))); gd.addColorStop(1, col(warm)); g.fillStyle = gd; g.fillRect(-OV, top, PW, 30)
      gd = g.createLinearGradient(0, top + 30, 0, H + OV); gd.addColorStop(0, col(mixc(warm, [30, 20, 30], .45))); gd.addColorStop(1, col(mixc(warm, [20, 14, 26], .7))); g.fillStyle = gd; g.fillRect(-OV, top + 30, PW, 120)
      g.strokeStyle = col(mixc(warm, [40, 20, 20], .35), .5); g.lineWidth = 1
      const T = rng(seed + 77); for (let i = 0; i < 14; i++) { const y = top + 4 + T() * 24; g.beginPath(); g.moveTo(-OV, y); for (let x = -OV; x < W + OV + 60; x += 60) g.lineTo(x, y + Math.sin(x / 140 + i) * 2); g.stroke() }
      g.fillStyle = 'rgba(255,240,220,.5)'; g.fillRect(-OV, top - 2, PW, 2)       // a bead of water where the glass meets the wood
      for (let i = 0; i < 40; i++) { const x = T() * W; g.fillStyle = 'rgba(255,245,230,.55)'; g.beginPath(); g.arc(x, top - 2, 1.5 + T() * 2, 0, 7); g.fill() }
      // the cup and saucer
      const cx = 1560, cy = top + 8
      g.fillStyle = 'rgba(20,10,20,.28)'; g.beginPath(); g.ellipse(cx + 6, cy + 6, 86, 12, 0, 0, 7); g.fill()
      gd = g.createLinearGradient(cx - 80, 0, cx + 80, 0); gd.addColorStop(0, '#d9d2cc'); gd.addColorStop(.35, '#f6f1ea'); gd.addColorStop(1, '#a89ea6'); g.fillStyle = gd
      g.beginPath(); g.ellipse(cx, cy, 78, 11, 0, 0, 7); g.fill()
      g.beginPath(); g.moveTo(cx - 46, cy - 76); g.bezierCurveTo(cx - 46, cy - 20, cx - 30, cy - 4, cx, cy - 4); g.bezierCurveTo(cx + 30, cy - 4, cx + 46, cy - 20, cx + 46, cy - 76); g.closePath(); g.fill()
      g.lineWidth = 9; g.strokeStyle = gd; g.beginPath(); g.ellipse(cx + 44, cy - 50, 17, 19, 0, -1.45, 1.45); g.stroke()
      g.fillStyle = '#5a3424'; g.beginPath(); g.ellipse(cx, cy - 76, 46, 8, 0, 0, 7); g.fill(); g.fillStyle = '#c08a5a'; g.beginPath(); g.ellipse(cx - 6, cy - 77, 20, 3.5, 0, 0, 7); g.fill()
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy - 76, 46, 8, 0, Math.PI * .1, Math.PI * .9, true); g.stroke()
      // a small trailing plant in a clay pot
      const px = 1790
      gd = g.createLinearGradient(px - 40, 0, px + 40, 0); gd.addColorStop(0, '#a85a3c'); gd.addColorStop(.4, '#d07a52'); gd.addColorStop(1, '#7a3e2c'); g.fillStyle = gd
      g.beginPath(); g.moveTo(px - 40, top - 64); g.lineTo(px + 40, top - 64); g.lineTo(px + 30, top + 6); g.lineTo(px - 30, top + 6); g.fill(); g.fillRect(px - 44, top - 72, 88, 12)
      const leaf = (x, y, a, s) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(s * .5, -s * .5, s, -s * .2, s * 1.2, 0); g.bezierCurveTo(s, s * .3, s * .5, s * .4, 0, 0); g.fill(); g.restore() }
      for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 + (T() - .5) * 2.6, r = 20 + T() * 60; g.fillStyle = col(mixc([70, 140, 80], [40, 80, 60], T()), 1); leaf(px + Math.cos(a) * r * .5, top - 72 + Math.sin(a) * r * .6, a, 26 + T() * 12) }
      g.strokeStyle = '#3f6e48'; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 34, top - 70); g.bezierCurveTo(px + 70, top - 60, px + 62, top - 10, px + 52, top + 26); g.stroke()   // one strand trails over the rim
      for (let i = 0; i < 5; i++) { const u = i / 4, lx = px + 34 + Math.sin(u * 2.6) * 32, ly = top - 66 + u * 90; g.fillStyle = '#4f9a5e'; leaf(lx, ly, i % 2 ? .3 : 2.6, 16 - i) }
    }

    /* ---------- rain on the outside: a small simulation on the one clock ---------- */
    const drops = [], drips = [], SLIDE = 12   // drops bigger than this run; smaller ones cling
    const calmTL = (x, y) => x < 1150 && y < 330          // keep the headline zone quiet
    const spawn = (big) => {
      for (let k = 0; k < 6; k++) {
        const x = R() * W, y = R() * 1000
        if (calmTL(x, y) && R() < .85) continue
        const r = big ? 5.5 + R() ** 1.4 * 10 : 1.6 + R() * 3
        const hit = drops.find(o => (o.x - x) ** 2 + (o.y - y) ** 2 < (o.r + r) ** 2)    // rain landing on a drop feeds it
        if (hit) { hit.r = Math.min(20, Math.cbrt(hit.r ** 3 + r ** 3)); if (hit.r > SLIDE && hit.stuck > 2) hit.stuck = R() * .5; return }
        drops.push({ x, y, r, vy: 0, stuck: R() * 4, acc: 0, wob: R() * 9 }); return
      }
    }
    for (let i = 0; i < 110; i++) spawn(true)
    const sprinkle = n => { const g = G.micro; for (let i = 0; i < n; i++) { const x = R() * W, y = R() * 1000; if (calmTL(x, y) && R() < .85) continue; const s = 2 + R() ** 3 * 6; g.globalAlpha = .5 + R() * .5; g.drawImage(micro, x - s / 2, y - s / 2, s, s) } g.globalAlpha = 1 }
    sprinkle(4200)
    let simT = null, rain = 0
    function step(dt) {
      rain += dt * 5
      while (rain > 1) { rain--; spawn(R() < .4) }
      sprinkle(Math.round(dt * 60))
      const g = G.micro; g.globalCompositeOperation = 'destination-out'
      for (const d of drops) {
        if (d.r < SLIDE) continue                                     // small drops cling
        if (d.stuck > 0) { d.stuck -= dt; continue }
        d.vy = Math.min(d.vy + 520 * dt, 40 + d.r * 22); d.y += d.vy * dt; d.x += Math.sin(d.y / 23 + d.wob) * .25
        if (R() < dt * 1.1) { d.stuck = .15 + R() * 1.6; d.vy = 0 }  // stick-slip: it catches on the glass and waits
        g.beginPath(); g.arc(d.x, d.y, d.r * .95, 0, 7); g.fill()      // wipe the mist where it runs
        d.acc += d.vy * dt
        if (d.acc > 18 + R() * 30) { d.acc = 0; d.r *= .985; drops.push({ x: d.x + (R() - .5) * 2, y: d.y - d.r * 1.3, r: d.r * (.2 + R() * .14), vy: 0, stuck: 99, acc: 0, wob: 0 }) }   // a trail of beads behind it
        for (const o of drops) {                                     // it swallows whatever it touches
          if (o === d || o.r === 0) continue
          const dx = o.x - d.x, dy = o.y - d.y, rr = (o.r + d.r) * .8
          if (dx * dx + dy * dy < rr * rr) { d.r = Math.min(20, Math.cbrt(d.r ** 3 + o.r ** 3)); o.r = 0; if (o.vy > d.vy) d.vy = o.vy }
        }
      }
      g.globalCompositeOperation = 'source-over'
      for (let i = drops.length - 1; i >= 0; i--) if (drops[i].r === 0 || drops[i].y > 1040) drops.splice(i, 1)
      while (drops.length > 190) { const i = drops.findIndex(d => d.r < 3); drops.splice(i >= 0 ? i : 0, 1) }
      // condensation drips on the inside: a bead forms in the fog band and runs down to the sill, clearing a line
      if (R() < dt / 7) drips.push({ x: 60 + R() * (W - 120), y: 780 + R() * 120, v: 0, stuck: .5 })
      tr.globalCompositeOperation = 'source-over'; tr.fillStyle = 'rgba(0,0,0,1)'
      for (const d of drips) { if (d.stuck > 0) { d.stuck -= dt; continue } d.v = Math.min(d.v + 60 * dt, 46); d.y += d.v * dt; if (R() < dt * .8) d.stuck = .3 + R(); tr.beginPath(); tr.arc(d.x + Math.sin(d.y / 30) * 2, d.y, 5, 0, 7); tr.fill() }
      for (let i = drips.length - 1; i >= 0; i--) if (drips[i].y > 1004) drips.splice(i, 1)
    }
    let fadeAcc = 0
    function fadeTrails(dt) { fadeAcc += dt; if (fadeAcc < .3) return; fadeAcc = 0; tr.save(); tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'destination-out'; tr.fillStyle = 'rgba(0,0,0,.035)'; tr.fillRect(0, 0, TR.width, TR.height); tr.restore() }
    for (let i = 0; i < 700; i++) { step(1 / 30); fadeTrails(1 / 30) }       // warm the glass up: 23 s of rain before anyone looks

    /* ---------- per frame ---------- */
    const cars = Array.from({ length: 7 }, (_, i) => ({ dir: i % 3 === 2 ? -1 : 1, ph: R() * 40, per: 26 + R() * 30, dur: 5 + R() * 3, lane: i % 3 === 2 ? 0 : 1, on: R() }))
    function drawStreet(t) {
      const g = G.street; wipe(g); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(S0, 0, 0); g.restore()
      g.globalCompositeOperation = 'lighter'
      // the traffic light down the street: red 12 s, green 10 s, amber 3 s; its colour runs down the wet road
      const ph = t % 25, tl = ph < 12 ? SP.red : ph < 22 ? SP.green : SP.amber, tc = ph < 12 ? RED : ph < 22 ? GREEN : AMBER
      g.drawImage(tl, 1446, 470, 44, 44)
      g.globalAlpha = .5; g.drawImage(ph < 12 ? SP.softR : ph < 22 ? SP.softG : SP.softA, 1440, 780, 56, 290); g.globalAlpha = 1
      // the pharmacy cross blinks its pattern: on, on, off
      if (((t * 1.4) | 0) % 3 !== 2) { g.globalAlpha = .8; g.drawImage(SP.green, 1352, 520, 34, 34); g.globalAlpha = 1 }
      // cars: headlights one way on the near lane, tail lights the other, each with a streak on the wet road
      for (const c of cars) {
        if (c.on > P.cars) continue
        const u = ((t + c.ph) % c.per) / c.dur
        if (u > 1) continue
        const x = c.dir > 0 ? lerp(-200, W + 200, u) : lerp(W + 200, -200, u), y = c.lane ? 800 : 772, r = c.lane ? 30 : 18
        const sp = c.dir > 0 ? SP.white : SP.red, st = c.dir > 0 ? WHITE : RED
        for (const dx of [0, c.lane ? 70 : 44]) {
          g.drawImage(sp, x + dx - r, y - r, 2 * r, 2 * r)
          g.globalAlpha = .45; g.drawImage(c.dir > 0 ? SP.softW : SP.softR, x + dx - r * .7, y + r * .3, r * 1.4, 260); g.globalAlpha = 1
        }
        g.globalAlpha = .4; g.drawImage(c.dir > 0 ? SP.softW : SP.softR, x - 80, y - 60, 230, 120); g.globalAlpha = 1
      }
      // the tram, every 52 s: a long row of warm windows gliding by, one blue spark at the wire
      const tu = ((t + 30) % 52) / 9
      if (tu < 1) {
        const tx = lerp(W + 100, -1400, tu)
        g.globalCompositeOperation = 'source-over'; g.drawImage(TRAM, tx - 40, 520, 1300, 300)
        g.globalCompositeOperation = 'lighter'; g.drawImage(SP.white, tx - 6, 700, 56, 56); g.globalAlpha = .35; g.drawImage(SP.softW, tx - 30, 760, 110, 300); g.globalAlpha = 1
        const spark = ((t + 30) % 52) > 3.4 && ((t + 30) % 52) < 3.55
        if (spark) { g.drawImage(SP.softB, tx + 520, 470, 140, 140); g.drawImage(SP.softB, tx + 560, 510, 60, 60) }
      }
      // umbrellas: two passers-by, dark against the shop light
      g.globalCompositeOperation = 'source-over'
      for (const [ph2, per, v, k] of [[0, 34, 60, 0], [17, 41, -45, 1]]) {
        const u = ((t + ph2) % per) * v, x = v > 0 ? u - 100 : W + 100 + u
        if (x < -150 || x > W + 150) continue
        g.drawImage(UMB[k], x - 100, 560 + Math.sin(t * 5 + k) * 3, 200, 260)     // a passer-by under an umbrella, bobbing with each step
      }
      // rain, visible only where a lamp lights it
      g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.6
      for (const [lx, ly] of LAMPS) for (let i = 0; i < 22; i++) {
        const h = (i * 97 + lx) % 200, x = lx - 90 + (i * 53 % 180), y = ly - 80 + ((t * 900 + h * 7) % 260), a = (1 - Math.abs(x - lx) / 100) * .35
        if (a <= 0) continue
        g.strokeStyle = col(SODIUM, a); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 26); g.stroke()
      }
      g.globalCompositeOperation = 'source-over'
    }
    function drawDrops() {
      const g = G.drops; wipe(g)
      const src = G.street.canvas
      for (const d of drops) {
        if (d.r < 2.2) { g.globalAlpha = .8; g.drawImage(micro, d.x - d.r * 1.2, d.y - d.r * 1.2, d.r * 2.4, d.r * 2.4); g.globalAlpha = 1; continue }
        const r = d.r, ry = r * (d.stuck > 0 || d.vy < 5 ? 1.05 : 1.22)
        g.save(); g.beginPath(); g.ellipse(d.x, d.y, r, ry, 0, 0, 7); g.clip()
        const sw = r * 5, sx = (d.x + OV) / 2 - sw / 4, sy = (d.y + OV) / 2 - sw / 4      // a drop is a lens: a wide patch of street, upside down
        g.translate(d.x, d.y); g.scale(1, -1); g.drawImage(src, sx, sy, sw / 2, sw / 2, -r, -ry, 2 * r, 2 * ry)
        g.restore()
        g.drawImage(dropShade, d.x - r, d.y - ry, 2 * r, 2 * ry)
      }
    }
    function drawFog() {
      const g = G.fog; wipe(g); g.save(); g.setTransform(1, 0, 0, 1, 0, 0)
      g.drawImage(FOG0, 0, 0); g.globalCompositeOperation = 'destination-out'; g.drawImage(TR, 0, 0); g.restore()
    }
    function drawSteam(t) {
      const g = G.steam; wipe(g)
      for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) {
        const f = i / 26, life = (t * .3 + k * .33 + f) % 1, y = 922 - life * 300, x = 1556 + k * 10 - 12 + Math.sin(life * 7 + t * .8 + k * 2) * (8 + life * 26)
        const a = Math.sin(Math.PI * life) ** .7 * .2 * (1 - life * .6), r = 7 + life * 30
        const gd = g.createRadialGradient(x, y, 0, x, y, r); gd.addColorStop(0, `rgba(255,248,240,${a})`); gd.addColorStop(1, 'rgba(255,248,240,0)'); g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r)
      }
    }
    function frame(t, el, still) {
      const want = clamp(+root.dataset.tod || 0)
      if (want !== tod) { tod = want; P = PAL(tod); root.style.background = col(P.sky1); setField(root, mixc(P.sky0, P.fog, .1)); paintStreet(); paintInside(); paintSill(); paintTram() }
      if (!still) { const dt = simT == null ? 0 : clamp(t - simT, 0, .05); simT = t; if (dt > 0) { step(dt); fadeTrails(dt) } }
      drawStreet(t); drawDrops(); drawFog(); drawSteam(t)
    }
    const printT = +(root.dataset.printT || 26.5)  // 26.5 s: the tram is passing behind the rain
    Deck.clock(root, frame, { printT })
    frame(printT, root, true)
  }

  document.querySelectorAll('.sc-rain-window').forEach(init)
  ;(window.Pack = window.Pack || {})['rain-window'] = { init }
})()
