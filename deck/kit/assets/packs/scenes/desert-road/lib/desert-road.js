/* scenes/desert-road · a desert highway from late afternoon into night (pack item, see its README.md).
   Every .sc-desert-road in the deck is drawn here. Back to front: sky (sun, evening star, stars, Milky Way), far mesas
   with the freight train crawling along the horizon (both shimmer in the heat while the sun is up), mid buttes with a
   radio mast, the highway with its poles and cars, the near desert with saguaros, a fence and a tumbleweed.
   data-tod 0…1: 0 golden late afternoon, 0.5 sunset, 1 night. Everything moves on the engine's one clock (Deck.clock). */
;(() => {
  const OV = 24, W = 1920, H = 1080, HZ = 705
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
  const band = (parent, x0, y0, w, h, s = 1) => {
    const c = canvas(Math.round(w * s), Math.round(h * s)); c.style.cssText = `left:${x0 + OV}px;top:${y0 + OV}px;width:${w}px;height:${h}px`; parent.appendChild(c)
    const g = c.getContext('2d'); g.setTransform(s, 0, 0, s, -x0 * s, -y0 * s); return g
  }
  const off = (x0, y0, w, h) => { const c = canvas(w, h), g = c.getContext('2d'); g.translate(-x0, -y0); return g }
  const wipe = g => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.restore() }
  let grainURL
  const grain = () => grainURL ??= (() => { const c = canvas(200, 200), g = c.getContext('2d'), d = g.createImageData(200, 200), R = rng(9)
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (R() + R() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } g.putImageData(d, 0, 0); return c.toDataURL() })()

  const STOPS = [
    [0, { sky0: '#21508f', sky1: '#5584b6', sky2: '#e3b06e', sky3: '#f5cf8a', far: '#c79a8c', mid: '#a4594a', near: '#7c4a38', plant: '#4c4a30', rim: '#ffd9a0', road: '#5a4a4a', starA: 0, rimA: .55, heat: 1 }],
    [.5, { sky0: '#272a6c', sky1: '#71468c', sky2: '#e0716a', sky3: '#ffb15a', far: '#80507e', mid: '#5c3152', near: '#3c2140', plant: '#2c1a34', rim: '#ff9a5a', road: '#3a2a44', starA: .35, rimA: .8, heat: .25 }],
    [1, { sky0: '#141a48', sky1: '#232b64', sky2: '#3a3c7c', sky3: '#5a4a88', far: '#2c2c5c', mid: '#20204a', near: '#16163a', plant: '#0f1030', rim: '#8aa0e0', road: '#1e1e42', starA: 1, rimA: .35, heat: 0 }],
  ].map(([t, o]) => [t, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? hex(v) : v]))])
  const PAL = tod => { const i = tod > .5 ? 1 : 0, [t0, A] = STOPS[i], [t1, B] = STOPS[i + 1], f = clamp((tod - t0) / (t1 - t0)), o = {}; for (const k in A) o[k] = typeof A[k] === 'number' ? lerp(A[k], B[k], f) : mixc(A[k], B[k], f); return o }
  const ROAD = x => 846 - x * .018     // the highway: nearly level, a little higher on the right
  const MAST = [1452, 652]

  function init(root) {
    const par = root.querySelector('.parallax') || root.appendChild(Object.assign(document.createElement('div'), { className: 'parallax' }))
    const plane = (k, d) => { let e = root.querySelector('.dr-' + k); if (!e) { e = document.createElement('div'); e.className = 'dr-' + k; e.dataset.depth = d; par.appendChild(e) } return e }
    const L = { sky: plane('sky', .02), far: plane('far', .05), mid: plane('mid', .1), near: plane('near', .22) }
    let gr = root.querySelector('.dr-grain'); if (!gr) { gr = document.createElement('i'); gr.className = 'dr-grain'; root.appendChild(gr) }
    gr.style.backgroundImage = `url(${grain()})`
    const seed = +(root.dataset.seed || 4)
    const SIGN = brandOf(root, '--brand')
    const G = {
      sky: band(L.sky, -OV, -OV, W + 2 * OV, HZ + 40), birds: band(L.sky, 1150, 200, 520, 260),
      far: band(L.far, -OV, 520, W + 2 * OV, 210),
      mid: band(L.mid, -OV, 420, W + 2 * OV, 500), road: band(L.mid, -OV, 740, W + 2 * OV, 140), mast: band(L.mid, MAST[0] - 60, 400, 120, 120), coyote: band(L.mid, 230, 500, 160, 90),
      near: band(L.near, -OV, 440, W + 2 * OV, H + OV - 440), weed: band(L.near, -OV, 860, W + 2 * OV, H + OV - 860),
    }
    const FAR = off(-OV, 520, W + 2 * OV, 210), TMP = off(-OV, 520, W + 2 * OV, 210)
    const R = rng(seed * 53 + 5)
    // the freight: two locomotives, then a long string of boxcars, tankers, hoppers and double-stacks
    const consist = [{ k: 'loco' }, { k: 'loco' }]
    for (let i = 0; i < 46; i++) consist.push({ k: ['box', 'tank', 'hopper', 'stack', 'stack', 'box'][R() * 6 | 0], c: [[150, 70, 50], [190, 150, 70], [110, 110, 120], [60, 90, 140], [160, 60, 60], [90, 120, 90]][R() * 6 | 0] })
    const stars = Array.from({ length: 520 }, () => { const m = R() ** 3; return [R() * W, R() ** 1.3 * (HZ - 20), m, R()] })
    const weed = (() => { const s = 80, c = canvas(s, s), g = c.getContext('2d'); g.translate(40, 40); g.lineWidth = 1.4; g.lineCap = 'round'
      for (let i = 0; i < 70; i++) { const a = R() * 7, r = 8 + R() * 26; g.strokeStyle = `rgba(${150 + R() * 60 | 0},${110 + R() * 50 | 0},${70 + R() * 30 | 0},.85)`; g.beginPath(); g.arc((R() - .5) * 14, (R() - .5) * 14, r, a, a + 1 + R() * 2); g.stroke() }
      return c })()
    let tod = -1, P

    /* ---------- silhouettes ---------- */
    function mesa(g, x, w, top, base, R2, talus = .25) {   // flat top, steep cliff, a talus skirt; returns nothing, fills a path
      const p = new Path2D(), cl = w * .08
      p.moveTo(x - w * talus, base); p.quadraticCurveTo(x - cl * .5, base - (base - top) * .3, x, top + (base - top) * .35)
      p.lineTo(x + cl * .3, top + 6); p.lineTo(x + cl, top)
      for (let xx = x + cl; xx < x + w - cl; xx += 14) p.lineTo(xx, top + (R2() - .5) * 3)
      p.lineTo(x + w - cl, top); p.lineTo(x + w - cl * .3, top + 8); p.lineTo(x + w, top + (base - top) * .4)
      p.quadraticCurveTo(x + w + cl * .5, base - (base - top) * .25, x + w + w * talus, base); p.closePath(); return p
    }
    function saguaro(x, base, h, arms) {               // a trunk and arms that elbow out and turn up: stroked, round-capped
      const w = h * .085, trunk = new Path2D(), arm = new Path2D()
      trunk.moveTo(x, base + 4); trunk.lineTo(x, base - h + w / 2)
      for (const [side, at, len, up] of arms) { const ay = base - h * at, ex = x + side * len; arm.moveTo(x, ay); arm.arcTo(ex, ay, ex, ay - up, w * .9); arm.lineTo(ex, ay - up) }
      return { trunk, arm, w }
    }
    function strokePlant(g, s, style) { g.strokeStyle = style; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = s.w; g.stroke(s.trunk); g.lineWidth = s.w * .78; g.stroke(s.arm) }
    function bush(p, x, y, w, R2) { for (let i = 0; i < 9; i++) { const a = Math.PI * (1 + R2()), d = R2() ** .5, r = w * (.12 + R2() * .14); p.moveTo(x + Math.cos(a) * w * .45 * d + r, y + Math.sin(a) * w * .3 * d); p.arc(x + Math.cos(a) * w * .45 * d, y + Math.sin(a) * w * .3 * d, r, 0, 7) } }

    function paint() {
      P = PAL(tod)
      root.style.background = col(P.sky1)
      setField(root, mixc(P.sky0, P.sky1, .3))
      const T = rng(seed * 977 + 3), sunU = sm(0, .55, tod), sx = lerp(1520, 1240, sunU), sy = lerp(330, HZ - 10, sunU ** 1.2), sunA = 1 - sm(.55, .66, tod)
      /* sky */
      let g = G.sky; wipe(g)
      let gd = g.createLinearGradient(0, 0, 0, HZ); gd.addColorStop(0, col(P.sky0)); gd.addColorStop(.42, col(P.sky1)); gd.addColorStop(.82, col(P.sky2)); gd.addColorStop(1, col(P.sky3))
      g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, HZ + 64)
      gd = g.createRadialGradient(sx, Math.min(sy, HZ), 0, sx, Math.min(sy, HZ), 900); gd.addColorStop(0, col(P.sky3, .55 * (1 - sm(.6, .9, tod)))); gd.addColorStop(.35, col(P.sky2, .2 * (1 - sm(.6, .9, tod)))); gd.addColorStop(1, col(P.sky2, 0))
      g.fillStyle = gd; g.fillRect(-OV, -OV, W + 2 * OV, HZ + 64)
      if (P.starA > .02) {   // stars come out brightest first; a faint Milky Way rises from the horizon on the right
        g.save(); g.globalAlpha = .3 * sm(.7, 1, tod); g.filter = 'blur(30px)'
        for (let i = 0; i < 30; i++) { const u = T(), x = lerp(1250, 2000, u) + (T() - .5) * 140, y = lerp(HZ - 60, -40, u) + (T() - .5) * 100; g.fillStyle = `rgba(${200 + T() * 40 | 0},${180 + T() * 30 | 0},255,${.12 + T() * .25})`; g.beginPath(); g.ellipse(x, y, 50 + T() * 70, 26 + T() * 30, -.95, 0, 7); g.fill() }
        g.globalAlpha = .5 * sm(.7, 1, tod); g.filter = 'blur(8px)'; g.strokeStyle = col(P.sky0, .6); g.lineWidth = 16; g.beginPath(); g.moveTo(1340, HZ - 120); g.bezierCurveTo(1500, 420, 1640, 300, 1960, 60); g.stroke()   // its dark dust lane
        g.restore()
        for (let i = 0; i < 260; i++) { const u = T(), x = lerp(1250, 2000, u) + (T() - .5) * 220, y = lerp(HZ - 60, -40, u) + (T() - .5) * 160; g.fillStyle = col([236, 230, 255], .5 * T() * sm(.7, 1, tod)); g.fillRect(x, y, 1, 1) }
        for (const [x, y, m, c] of stars) {
          const on = sm(.45 + (1 - m) * .5, .5 + (1 - m) * .5, tod), a = on * (.25 + .75 * m) * (1 - sm(HZ - 160, HZ, y) * .7)
          if (a < .03) continue
          g.fillStyle = col(c < .15 ? [255, 214, 190] : c < .3 ? [196, 214, 255] : [246, 246, 255], a); const s = .7 + m * 1.8; g.fillRect(x, y, s, s)
        }
      }
      const venus = sm(.32, .45, tod) * (1 - sm(.92, 1, tod) * .3)   // the evening star: first light in the sky after sunset
      if (venus > .01) { const vx = 1130, vy = 480; gd = g.createRadialGradient(vx, vy, 0, vx, vy, 14); gd.addColorStop(0, col([255, 252, 236], venus)); gd.addColorStop(.25, col([255, 244, 220], .5 * venus)); gd.addColorStop(1, col([255, 244, 220], 0)); g.fillStyle = gd; g.fillRect(vx - 14, vy - 14, 28, 28) }
      if (sunA > .01) {
        const sr = lerp(46, 64, sunU), sc = mixc([255, 246, 214], [255, 150, 80], sunU)
        gd = g.createRadialGradient(sx, sy, sr * .6, sx, sy, sr * 6); gd.addColorStop(0, col(sc, .5 * sunA)); gd.addColorStop(.2, col(sc, .15 * sunA)); gd.addColorStop(1, col(sc, 0)); g.fillStyle = gd; g.fillRect(sx - sr * 6, sy - sr * 6, sr * 12, sr * 12)
        g.fillStyle = col(sc, sunA); g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill()
        if (sunU > .6) for (const [dy, h] of [[-sr * .2, 4], [sr * .25, 6]]) { g.fillStyle = col(P.sky2, .55); g.fillRect(sx - sr * 2, sy + dy, sr * 4, h) }   // thin cloud bands across the setting sun
      }
      if (tod > .7) { const mx = 1640, my = 200, a = sm(.7, .85, tod); gd = g.createRadialGradient(mx, my, 10, mx, my, 160); gd.addColorStop(0, col([230, 230, 255], .22 * a)); gd.addColorStop(1, col([230, 230, 255], 0)); g.fillStyle = gd; g.fillRect(mx - 160, my - 160, 320, 320)
        g.save(); g.beginPath(); g.arc(mx, my, 20, 0, 7); g.clip(); g.fillStyle = col([250, 246, 226], a); g.fillRect(mx - 20, my - 20, 40, 40); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(mx - 9, my - 4, 19, 0, 7); g.fill(); g.restore() }   // a crescent moon
      /* far mesas: hazy, close to the sky colour; rim-lit toward the sun */
      g = FAR; g.clearRect(-OV, 520, W + 2 * OV, 210)
      const RM = rng(seed * 11 + 1), farC = mixc(P.far, P.sky3, .25)
      const fars = [mesa(g, 120, 360, 610, HZ + 4, RM), mesa(g, 980, 60, 590, HZ + 4, RM, .5), mesa(g, 1090, 46, 604, HZ + 4, RM, .55), mesa(g, 1520, 330, 628, HZ + 4, RM), mesa(g, 640, 170, 660, HZ + 4, RM, .4)]
      g.save(); g.translate(2, -1); g.fillStyle = col(P.rim, P.rimA * .35); for (const p of fars) g.fill(p); g.restore()
      gd = g.createLinearGradient(0, 590, 0, HZ + 4); gd.addColorStop(0, col(farC)); gd.addColorStop(1, col(mixc(farC, P.sky3, .35))); g.fillStyle = gd; for (const p of fars) g.fill(p)
      g.fillStyle = col(mixc(farC, P.mid, .2)); g.fillRect(-OV, HZ, W + 2 * OV, 30)
      /* mid: a butte on the left, a ridge on the right carrying the radio mast, the highway with its poles */
      g = G.mid; wipe(g)
      const RD = rng(seed * 19 + 7), midC = P.mid
      const left = mesa(g, -60, 330, 556, 800, RD, .4), right = new Path2D()
      right.moveTo(1180, 800); for (let x = 1180; x <= W + OV; x += 20) right.lineTo(x, 660 + 40 * Math.exp(-(((x - 1450) / 120) ** 2)) * -1 + Math.sin(x / 90) * 8 + sm(1180, 1320, x) * 0 + (x < 1300 ? (1300 - x) * .7 : 0)); right.lineTo(W + OV, 800); right.closePath()
      g.save(); g.translate(3, -2); g.fillStyle = col(P.rim, P.rimA * .5); g.fill(left); g.fill(right); g.restore()
      gd = g.createLinearGradient(0, 556, 0, 820); gd.addColorStop(0, col(midC)); gd.addColorStop(1, col(mixc(midC, P.far, .35))); g.fillStyle = gd; g.fill(left); g.fill(right)
      gd = g.createLinearGradient(0, HZ, 0, 900); gd.addColorStop(0, col(mixc(P.far, P.mid, .5))); gd.addColorStop(1, col(mixc(P.mid, P.near, .5))); g.fillStyle = gd; g.fillRect(-OV, HZ + 20, W + 2 * OV, 400)
      // the mast: lattice, guy wires, its lamp is drawn per frame
      const [mx, my] = MAST, mh = 186
      g.strokeStyle = col(mixc(P.plant, P.mid, .2)); g.lineWidth = 1.2
      g.beginPath(); g.moveTo(mx - 5, my); g.lineTo(mx, my - mh); g.lineTo(mx + 5, my)
      for (let y = my - 8; y > my - mh; y -= 10) { const w = 5 * (y - (my - mh)) / mh; g.moveTo(mx - w, y); g.lineTo(mx + w * .8, y - 10) }
      g.stroke(); g.lineWidth = .7; g.strokeStyle = col(mixc(P.plant, P.mid, .3), .7)
      for (const [ax, ay] of [[mx - 90, my + 4], [mx + 80, my + 2], [mx - 40, my + 6]]) { g.beginPath(); g.moveTo(mx, my - mh * .7); g.quadraticCurveTo((mx + ax) / 2, (my - mh * .7 + ay) / 2 + 10, ax, ay); g.stroke() }
      if (P.rimA > .4 && tod < .7) { g.strokeStyle = col(P.rim, .4); g.beginPath(); g.moveTo(mx + 1, my); g.lineTo(mx + 1, my - mh); g.stroke() }   // the low sun catches one leg
      // highway: asphalt, a faded centre line, a shoulder; poles on the far side with sagging wires
      g.fillStyle = col(P.road); g.beginPath(); g.moveTo(-OV, ROAD(-OV) - 14); g.lineTo(W + OV, ROAD(W + OV) - 14); g.lineTo(W + OV, ROAD(W + OV) + 14); g.lineTo(-OV, ROAD(-OV) + 14); g.fill()
      g.strokeStyle = col(mixc(P.road, [255, 220, 120], .45), .8); g.lineWidth = 1.6; g.setLineDash([22, 26]); g.beginPath(); g.moveTo(-OV, ROAD(-OV)); g.lineTo(W + OV, ROAD(W + OV)); g.stroke(); g.setLineDash([])
      g.strokeStyle = col(mixc(P.road, P.sky3, .35), .6); g.lineWidth = 1; g.beginPath(); g.moveTo(-OV, ROAD(-OV) + 13); g.lineTo(W + OV, ROAD(W + OV) + 13); g.stroke()
      const poles = []; for (let x = 60; x < W + 200; x += 250) poles.push(x)
      g.strokeStyle = col(mixc(P.plant, P.mid, .1)); g.lineWidth = 2.4
      for (const x of poles) { const y = ROAD(x) - 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 84); g.moveTo(x - 12, y - 78); g.lineTo(x + 12, y - 78); g.stroke() }
      g.lineWidth = .8; g.strokeStyle = col(mixc(P.plant, P.mid, .2), .8)
      for (let i = 0; i < poles.length - 1; i++) for (const dx of [-10, 10]) { const a = poles[i], b = poles[i + 1], ya = ROAD(a) - 96, yb = ROAD(b) - 96; g.beginPath(); g.moveTo(a + dx, ya); g.quadraticCurveTo((a + b) / 2 + dx, (ya + yb) / 2 + 16, b + dx, yb); g.stroke() }
      // a water tower by the road: the town's name (or the brand) painted on its tank
      { const x = 760, y = ROAD(760) - 18, tc = SIGN ? mixc(SIGN, P.mid, .35) : mixc([200, 190, 170], P.mid, .45)
        g.strokeStyle = col(mixc(P.plant, P.mid, .1)); g.lineWidth = 2; g.beginPath(); for (const dx of [-18, -6, 6, 18]) { g.moveTo(x + dx * .6, y - 70); g.lineTo(x + dx, y) } g.moveTo(x - 16, y - 30); g.lineTo(x + 16, y - 30); g.stroke()
        gd = g.createLinearGradient(x - 26, 0, x + 26, 0); gd.addColorStop(0, col(mixc(tc, [0, 0, 0], .25))); gd.addColorStop(.6, col(tc)); gd.addColorStop(1, col(mixc(tc, P.rim, P.rimA * .3))); g.fillStyle = gd
        g.beginPath(); g.roundRect(x - 26, y - 112, 52, 44, 4); g.fill(); g.beginPath(); g.moveTo(x - 29, y - 111); g.quadraticCurveTo(x, y - 126, x + 29, y - 111); g.fill()
        g.fillStyle = col([0, 0, 0], .15); g.fillRect(x - 26, y - 96 + 18, 52, 3); g.strokeStyle = col(mixc(P.plant, P.mid, .1)); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 32, y - 70); g.lineTo(x + 32, y - 70); g.stroke()   // a band and the catwalk
        const name = (w => !w || w.includes('__') ? 'MESA' : w.toUpperCase())(root.dataset.word), fs = Math.min(13, 70 / Math.max(3, name.length) * 1.4)
        g.font = `800 ${fs}px ${getComputedStyle(root).fontFamily}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col(window.Deck?.inkOn?.(col(tc)) === '#14161E' ? [30, 24, 30] : [250, 244, 232], .8); g.fillText(name, x, y - 90, 46) }
      /* near: the desert floor, scrub, rocks, saguaros, a fence */
      g = G.near; wipe(g)
      const RN = rng(seed * 29 + 3), ground = new Path2D()
      ground.moveTo(-OV, H + OV); for (let x = -OV; x <= W + OV; x += 30) ground.lineTo(x, 900 + Math.sin(x / 260) * 14 + Math.sin(x / 90 + 1) * 5); ground.lineTo(W + OV, H + OV); ground.closePath()
      gd = g.createLinearGradient(0, 880, 0, H); gd.addColorStop(0, col(mixc(P.near, P.mid, .3))); gd.addColorStop(1, col(mixc(P.near, [10, 6, 20], .35))); g.fillStyle = gd; g.fill(ground)
      const plants = new Path2D(), cacti = [saguaro(1660, 960, 470, [[-1, .56, 62, 120], [1, .66, 50, 96], [1, .42, 44, 56]]), saguaro(250, 905, 190, [[1, .55, 28, 50], [-1, .45, 24, 36]]), saguaro(1180, 880, 96, [[-1, .5, 16, 26]])]
      for (let i = 0; i < 16; i++) { const x = RN() * W, y = 912 + RN() * 140; bush(plants, x, y + Math.sin(x / 260) * 14, 18 + RN() * 34 * (y - 880) / 160, RN) }
      for (let i = 0; i < 14; i++) { const x = RN() * W, y = 915 + RN() * 150, r = 5 + RN() * 12; plants.moveTo(x + r, y); plants.ellipse(x, y, r, r * .55, 0, Math.PI, 0) }
      g.save(); g.translate(3, -2); g.fillStyle = col(P.rim, P.rimA * .55); g.fill(plants); for (const c of cacti) strokePlant(g, c, col(P.rim, P.rimA * .55)); g.restore()
      g.fillStyle = col(P.plant); g.fill(plants); for (const c of cacti) strokePlant(g, c, col(P.plant))
      g.strokeStyle = col(P.plant); g.lineWidth = 1.3; g.lineCap = 'round'
      for (let i = 0; i < 22; i++) { const x = RN() * W, y = 918 + RN() * 140 + Math.sin(x / 260) * 14, n = 7 + RN() * 6 | 0, hh = 14 + RN() * 26 * (y - 880) / 160; g.beginPath(); for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k / (n - 1) - .5) * 1.8; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * hh, y + Math.sin(a) * hh) } g.stroke() }   // creosote: twiggy, not round
      g.strokeStyle = col(mixc(P.plant, P.near, .3)); g.lineWidth = 3
      for (let x = 30; x < 1100; x += 120) { const y = 935 + Math.sin(x / 260) * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 56); g.stroke() }
      g.lineWidth = .8; for (const dy of [-46, -30, -16]) { g.beginPath(); for (let x = 30; x < 1100; x += 120) { const y = 935 + Math.sin(x / 260) * 10 + dy; x === 30 ? g.moveTo(x, y) : g.quadraticCurveTo(x - 60, y + 4, x, y) } g.stroke() }   // barbed wire, sagging a little between posts
    }

    /* ---------- per frame ---------- */
    function drawTrain(g, t, still) {
      const sp = 22, len = consist.length * 25, cyc = (W + len + 300) / sp + 40, u = still ? 52 : (t + 60) % cyc, head = -200 + u * sp, y = HZ + 1
      const ink = col(mixc(mixc(P.far, P.mid, .55), [20, 14, 30], .2)), dayK = 1 - sm(.35, .65, tod)
      let x = head
      for (const c of consist) {
        const w = c.k === 'loco' ? 30 : 23
        if (x > -40 && x - w < W + 40) {
          const body = c.k === 'loco' ? mixc([190, 160, 80], P.far, .45) : mixc(c.c, P.far, .5)
          g.fillStyle = dayK > .05 ? col(mixc(mixc(body, P.far, .2), mixc(P.far, P.mid, .55), 1 - dayK)) : ink
          if (c.k === 'tank') { g.beginPath(); g.roundRect(x - w, y - 8, w - 2, 6, 3); g.fill() }
          else if (c.k === 'hopper') { g.beginPath(); g.moveTo(x - w, y - 9); g.lineTo(x - 2, y - 9); g.lineTo(x - 5, y - 2); g.lineTo(x - w + 3, y - 2); g.fill() }
          else if (c.k === 'stack') { g.fillRect(x - w, y - 7, w - 2, 5); g.fillStyle = dayK > .05 ? col(mixc(mixc(body, [200, 190, 170], .3), P.far, .4)) : ink; g.fillRect(x - w, y - 11, w - 2, 4) }
          else if (c.k === 'loco') { g.fillRect(x - w, y - 10, w - 2, 8); g.fillRect(x - 8, y - 13, 6, 3) }
          else g.fillRect(x - w, y - 10, w - 2, 8)
          g.fillStyle = ink; g.fillRect(x - w, y - 2, w - 2, 2)
        }
        x -= w + 2
      }
      const tail = x + 2
      if (tod > .45) {   // the headlight reaches ahead; the end-of-train light blinks red
        const a = sm(.45, .7, tod), gd = g.createLinearGradient(head, 0, head + 160, 0); gd.addColorStop(0, col([255, 240, 200], .5 * a)); gd.addColorStop(1, col([255, 240, 200], 0))
        g.fillStyle = gd; g.beginPath(); g.moveTo(head, y - 9); g.lineTo(head + 160, y - 16); g.lineTo(head + 160, y + 2); g.lineTo(head, y - 5); g.fill()
        g.fillStyle = col([255, 250, 220], a); g.fillRect(head - 1, y - 9, 2, 2)
        if (still || (t % 1.3) < .2) { const gl = g.createRadialGradient(tail, y - 6, 0, tail, y - 6, 7); gl.addColorStop(0, col([255, 60, 50], a)); gl.addColorStop(1, col([255, 60, 50], 0)); g.fillStyle = gl; g.fillRect(tail - 7, y - 13, 14, 14) }
      }
      if (dayK > .1) for (let i = 0; i < 6; i++) { const age = ((t * .8 + i / 6) % 1), px = head - 24 - age * 70, py = y - 14 - age * 16, r = 3 + age * 9; g.fillStyle = col(mixc([200, 190, 190], P.sky3, .4), .25 * (1 - age) * dayK); g.beginPath(); g.arc(px, py, r, 0, 7); g.fill() }   // exhaust drifting back from the locomotives
    }
    function drawFar(t, still) {
      const heat = P.heat * (still ? 0 : 1)
      const tg = heat > .02 ? TMP : G.far
      wipe(tg); tg.drawImage(FAR.canvas, -OV, 520)
      drawTrain(tg, t, still)
      if (heat > .02) {   // heat shimmer: each row of the horizon band slips sideways a little, faster near the ground
        const g = G.far; wipe(g); g.save(); g.setTransform(1, 0, 0, 1, 0, 0)
        const c = TMP.canvas, hh = c.height
        for (let y = 0; y < hh; y += 2) { const k = sm(80, hh - 10, y), dx = (Math.sin(y * .42 + t * 7.3) + Math.sin(y * .17 - t * 4.1) * .6) * 1.8 * heat * k; g.drawImage(c, 0, y, c.width, 2, dx, y, c.width, 2) }
        g.restore()
        // a mirage: the sky laid along the horizon like water
        const gd = g.createLinearGradient(0, HZ - 4, 0, HZ + 14); gd.addColorStop(0, col(P.sky3, 0)); gd.addColorStop(.4, col(P.sky3, .5 * heat)); gd.addColorStop(1, col(P.sky3, 0))
        g.fillStyle = gd; for (let x = -OV; x < W + OV; x += 40) g.fillRect(x, HZ - 4 + Math.sin(x * .05 + t * 2) * 1.5, 40, 18)
      }
    }
    function drawRoad(t, still) {
      const g = G.road; wipe(g)
      const night = sm(.4, .7, tod), C = 25, n = Math.floor((t + 10) / C), u = still ? .42 : ((t + 10) % C) / 15
      if (u > 1) return
      const dir = n % 2 ? -1 : 1, truck = n % 3 === 2, x = dir > 0 ? lerp(-140, W + 140, u) : lerp(W + 140, -140, u), y = ROAD(x) + (dir > 0 ? 6 : -5), len = truck ? 70 : 34
      const body = n % 4 === 1 ? [220, 214, 200] : [180, 60, 50], dayK = 1 - night
      if (dayK > .1) for (let i = 0; i < 10; i++) { const a = ((t * 1.4 + i / 10) % 1), px = x - dir * (len / 2 + a * 120), r = 6 + a * 22; g.fillStyle = col(mixc([214, 180, 140], P.sky3, .3), .22 * (1 - a) * dayK); g.beginPath(); g.arc(px, y - 6 - a * 10, r, 0, 7); g.fill() }   // a plume of dust kicked up behind
      g.fillStyle = dayK > .2 ? col(mixc(body, P.mid, .35)) : col(mixc(P.road, [0, 0, 0], .3))
      g.beginPath(); g.roundRect(x - len / 2, y - 10, len, 8, 2); g.fill(); g.fillRect(x + dir * len * (truck ? .28 : .05) - 7, y - 15, 14, 6)
      if (night > .05) {   // headlights throw a beam down the road; tail lights glow red; a truck's marker lights run along its trailer
        const fx = x + dir * len / 2, gd = g.createLinearGradient(fx, 0, fx + dir * 260, 0); gd.addColorStop(0, col([255, 244, 210], .5 * night)); gd.addColorStop(1, col([255, 244, 210], 0))
        g.fillStyle = gd; g.beginPath(); g.moveTo(fx, y - 7); g.lineTo(fx + dir * 260, y - 16); g.lineTo(fx + dir * 260, y + 8); g.lineTo(fx, y - 3); g.fill()
        for (const [px, c, r] of [[fx, [255, 250, 230], 9], [x - dir * len / 2, [255, 50, 40], 6]]) { const gl = g.createRadialGradient(px, y - 5, 0, px, y - 5, r); gl.addColorStop(0, col(c, night)); gl.addColorStop(1, col(c, 0)); g.fillStyle = gl; g.fillRect(px - r, y - 5 - r, 2 * r, 2 * r) }
        if (truck) for (let k = 0; k < 5; k++) { g.fillStyle = col([255, 176, 60], night); g.fillRect(x - len / 2 + 6 + k * 14, y - 11, 2, 2) }
      }
    }
    function drawMast(t, still) {
      const g = G.mast; wipe(g)
      const [mx, my] = MAST, x = mx, y = my - 186, night = tod > .45
      // aviation light: a white strobe by day, a slow red pulse by night
      const I = still ? 1 : night ? sm(0, .3, t % 2.4) * (1 - sm(1.2, 1.8, t % 2.4)) : ((t % 1.6) < .08 ? 1 : 0)
      if (I < .02) return
      const c = night ? [255, 60, 50] : [255, 255, 255], r = night ? 16 : 10, gd = g.createRadialGradient(x, y, 0, x, y, r)
      gd.addColorStop(0, col(c, I)); gd.addColorStop(.25, col(c, .45 * I)); gd.addColorStop(1, col(c, 0)); g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r)
    }
    function drawLife(t, still) {
      let g = G.birds; wipe(g)
      if (tod < .5) {   // a hawk circling high on a thermal
        const a = t * .32, x = 1400 + Math.cos(a) * 90, y = 320 + Math.sin(a) * 30, bank = Math.sin(a) * .5
        g.fillStyle = col(mixc(P.mid, P.sky1, .3), .85); g.save(); g.translate(x, y); g.rotate(bank * .3)
        g.beginPath(); g.moveTo(-15, -2); g.quadraticCurveTo(-6, -5 + bank * 3, 0, 0); g.quadraticCurveTo(6, -5 - bank * 3, 15, -2); g.quadraticCurveTo(6, -1, 0, 3); g.quadraticCurveTo(-6, -1, -15, -2); g.fill(); g.restore()
      }
      g = G.coyote; wipe(g)
      if (tod > .62) {  // a coyote on the butte: sits, and every 40 s lifts its head to the sky
        const howl = !still && (t % 40) > 36, ink = col(mixc(P.mid, P.near, .4)), x = 300, y = 557
        g.fillStyle = ink; g.save(); g.translate(x, y); g.scale(1.25, 1.25)
        g.beginPath(); g.moveTo(-12, 0); g.bezierCurveTo(-14, -10, -8, -18, 0, -20)                       // haunch → back
        if (howl) { g.lineTo(3, -30); g.lineTo(5, -40); g.lineTo(7, -39); g.lineTo(8, -31); g.lineTo(6, -24) }   // muzzle to the sky
        else { g.lineTo(4, -27); g.lineTo(6, -32); g.lineTo(8, -28); g.lineTo(15, -25); g.lineTo(15, -23); g.lineTo(8, -21) }   // ears up, snout level
        g.lineTo(7, -12); g.lineTo(8, 0); g.lineTo(5, 0); g.lineTo(4, -9); g.lineTo(-2, -6); g.lineTo(-4, 0); g.closePath(); g.fill()
        g.beginPath(); g.moveTo(-11, -2); g.quadraticCurveTo(-24, 0, -27, -6); g.quadraticCurveTo(-20, -2, -10, -6); g.fill(); g.restore()   // the brush of a tail
      }
      g = G.weed; wipe(g)
      const u = still ? -1 : ((t + 20) % 47) / 9      // a tumbleweed rolls through every 47 s
      if (u >= 0 && u <= 1) {
        const x = lerp(-80, W + 80, u), hop = Math.abs(Math.sin(u * 15)) * 34 * (1 - u * .4), y = 975 - hop, r = 30
        g.fillStyle = col([20, 10, 20], .2 * (1 - hop / 50)); g.beginPath(); g.ellipse(x, 1000, r * .9, 6, 0, 0, 7); g.fill()
        g.save(); g.translate(x, y); g.rotate(u * 26); g.globalAlpha = .9; g.drawImage(weed, -r - 10, -r - 10, 2 * r + 20, 2 * r + 20); g.restore()
      }
    }
    function frame(t, el, still) {
      const want = clamp(+root.dataset.tod || 0)
      if (want !== tod) { tod = want; paint() }
      drawFar(t, still); drawRoad(t, still); drawMast(t, still); drawLife(t, still)
    }
    const printT = +(root.dataset.printT || 30)
    Deck.clock(root, frame, { printT })
    frame(printT, root, true)
  }

  document.querySelectorAll('.sc-desert-road').forEach(init)
  ;(window.Pack = window.Pack || {})['desert-road'] = { init }
})()
