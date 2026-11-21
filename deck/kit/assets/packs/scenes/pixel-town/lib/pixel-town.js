/* scenes/pixel-town · a cosy pixel-art town, like a game's title screen (pack item, see its README.md).
   Every .sc-pixel-town in the deck is drawn here, on a 480 × 270 art-pixel grid shown at 4× (image-rendering:pixelated).
   data-tod 0…1: 0 a sunny afternoon, 0.5 a golden sunset, 1 night (windows lit one by one, lamps on, stars).
   data-word puts the product's name on the bus's side panel (its route sign stays the route).
   Motion snaps to whole art pixels and sprites step through 2-frame cycles, all on the engine's one clock (Deck.clock). */
;(() => {
  const OV = 6, AW = 480, AH = 270, CW = AW + 2 * OV, CH = AH + 2 * OV
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const lerp = (a, b, f) => a + (b - a) * f
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const mixc = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]
  const css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16)
  const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '-': '000000111000000', ' ': '000000000000000', '.': '000000000000010' }
  const WIDE = { M: '1000111011101011000110001', W: '1000110001101011101110001', N: '1001110110111001', Q: '01101001100110110111' }   // 5-wide M/W, 4-wide N/Q
  const gw = ch => WIDE[ch] ? WIDE[ch].length / 5 : 3
  const textW = s => [...s].reduce((a, ch) => a + gw(ch) + 1, -1)
  const cx1 = document.createElement('canvas').getContext('2d')
  const rgbOf = v => { if (!v) return null; cx1.fillStyle = '#010203'; cx1.fillStyle = v; const o = cx1.fillStyle; if (o === '#010203') return null; if (o[0] === '#') return hex(o); const m = o.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')
  // the slide's --field follows the sky behind the headline, so the engine's --ink-auto stays right at every hour
  const setField = (root, c) => { const s = root.closest('section.slide'); if (!s) return; const v = css(c); s.style.setProperty('--field', v); const ink = window.Deck?.inkOn?.(v); if (ink) s.style.setProperty('--ink-auto', ink) }
  const text = (g, s, x, y, c) => { g.fillStyle = c; let cx = x; for (const ch of s) { const w = gw(ch), f = WIDE[ch] || FONT[ch] || FONT[' ']; for (let k = 0; k < w * 5; k++) if (f[k] === '1') g.fillRect(cx + k % w, y + (k / w | 0), 1, 1); cx += w + 1 } }

  /* ---------- the hour: sky bands, light on the town ---------- */
  const SKY = [
    [0, ['#2458ad', '#2b66bb', '#3675c6', '#4f8fd6', '#73ade4', '#a3cfee']],
    [.5, ['#3a3b8c', '#5c4a9c', '#9a5aa0', '#d86f86', '#f39a6a', '#ffc977']],
    [1, ['#161d55', '#1c2663', '#233072', '#2b3b80', '#35488e', '#42559a']],
  ].map(([t, a]) => [t, a.map(hex)])
  const TINT = [[0, [1, 1, 1], [0, 0, 0]], [.5, [1.02, .8, .74], [14, 0, 12]], [1, [.36, .38, .62], [6, 8, 26]]]
  const at = (stops, tod) => { const i = tod > .5 ? 1 : 0, [t0, a] = stops[i], [t1, b] = stops[i + 1], f = clamp((tod - t0) / (t1 - t0)); return [a, b, f] }
  const skyAt = tod => { const [a, b, f] = at(SKY, tod); return a.map((c, i) => mixc(c, b[i], f)) }
  const tintAt = tod => { const i = tod > .5 ? 1 : 0, A = TINT[i], B = TINT[i + 1], f = clamp((tod - A[0]) / (B[0] - A[0])); return [mixc(A[1], B[1], f), mixc(A[2], B[2], f)] }

  /* ---------- the town, house by house ---------- */
  const HOUSES = [
    { x: 0, w: 34, top: 160, wall: '#4fa3a5', roof: '#c0504d', kind: 'gable', peak: 144, chim: 24, wins: [[5, 170], [19, 170], [5, 188], [19, 188], [5, 205]], door: 20 },
    { x: 34, w: 44, top: 176, wall: '#b5654a', roof: '#4a4e69', kind: 'mansard', brick: true, chim: 40, wins: [[6, 184], [22, 184], [6, 202], [30, 202]], door: 18 },
    { x: 80, w: 54, top: 182, wall: '#f1e0b8', roof: '#8b5a43', kind: 'flat', bakery: true, chim: 120 },
    { x: 136, w: 58, top: 168, wall: '#5d7fb8', roof: '#9c3f48', kind: 'gable', peak: 148, dormer: 158, siding: true, wins: [[8, 176], [24, 176], [40, 176], [8, 196], [40, 196]], door: 25 },
    { x: 206, w: 44, top: 178, wall: '#e8c35a', roof: '#c06a3c', kind: 'hip', peak: 166, round: true, wins: [[6, 186], [26, 186], [6, 204]], door: 27 },
    { x: 256, w: 56, top: 142, wall: '#8a7aa8', roof: '#5b5078', kind: 'flat', tank: true, grid: [4, 4, 150, 17], door: 24 },
    { x: 314, w: 50, top: 172, wall: '#5f9e76', roof: '#3f5f6a', kind: 'flat', cafe: true, wins: [[6, 180], [20, 180], [34, 180]] },
    { x: 366, w: 50, top: 174, wall: '#e08a4f', roof: '#7a3f3a', kind: 'gable', peak: 156, siding: true, round: true, wins: [[7, 186], [33, 186], [7, 204]], door: 30 },
    { x: 418, w: 30, top: 130, wall: '#b9a58a', roof: '#4e5a7a', kind: 'tower', peak: 108 },
    { x: 448, w: 40, top: 170, wall: '#d98b9b', roof: '#6d4a6a', kind: 'gable', peak: 154, wins: [[6, 180], [24, 180], [6, 200]], door: 24 },
  ]
  const GROUND = 222

  function init(root) {
    const par = root.querySelector('.parallax') || root.appendChild(Object.assign(document.createElement('div'), { className: 'parallax' }))
    const plane = (k, d) => { let e = root.querySelector('.pt-' + k); if (!e) { e = document.createElement('div'); e.className = 'pt-' + k; e.dataset.depth = d; par.appendChild(e) } return e }
    const L = { sky: plane('sky', .02), far: plane('far', .06), town: plane('town', .14), front: plane('front', .26) }
    const mk = parent => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; parent.appendChild(c); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.translate(OV, OV); return g }
    const G = { sky: mk(L.sky), far: mk(L.far), town: mk(L.town), front: mk(L.front) }
    const off = () => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d'); g.translate(OV, OV); return g }
    const C = { sky: off(), far: off(), town: off(), front: off() }
    const seed = +(root.dataset.seed || 5), word = (w => { if (!w || w.includes('__')) return ''; w = w.toUpperCase().replace(/[^A-Z0-9 .-]/g, ''); while (w.length > 1 && textW(w) > 32) w = w.slice(0, -1); return w.trim() })(root.dataset.word)
    const R = rng(seed * 101 + 7)
    const sec = root.closest('section.slide') || root, scs = getComputedStyle(sec)
    const brand = rgbOf(scs.getPropertyValue('--brand').trim()), brand2 = rgbOf(scs.getPropertyValue('--brand-2').trim())
    const BUS = brand ? toHex(brand) : '#e8573f', BUS2 = brand ? toHex(brand.map(v => v * .86)) : '#d24a35', PANEL = brand2 ? toHex(brand2) : '#2f6fb3'
    const PANEL_INK = window.Deck?.inkOn?.(PANEL) === '#14161E' ? '#1a1c26' : '#fff4d8'
    // fixed cast
    const stars = Array.from({ length: 90 }, () => [R() * AW | 0, R() * 120 | 0, R(), R() * 20])
    const clouds = [[30, 12, 46, 1.1], [190, 62, 30, .7], [330, 78, 38, .9], [430, 68, 24, .55]].map(([x, y, w, v]) => ({ x, y, w, v, bumps: Array.from({ length: 5 }, () => 3 + R() * 5 | 0) }))
    const windows = []   // [x, y, threshold, kind]
    const walkers = [
      { x: 0, v: 11, dir: 1, shirt: '#d9534f', hair: '#3b2a20', h: 10, extra: 'bread' },
      { x: 160, v: 8, dir: -1, shirt: '#4a7bd1', hair: '#e8c070', h: 10, extra: 'dog' },
      { x: 300, v: 6, dir: 1, shirt: '#7d6a9e', hair: '#d8d8d8', h: 9, extra: 'cane' },
      { x: 420, v: 13, dir: -1, shirt: '#3fa36b', hair: '#2a1e18', h: 8, extra: 'kid' },
      { x: 90, v: 10, dir: -1, shirt: '#e0a03a', hair: '#5a3a2a', h: 10, extra: 'hat', night: true },
    ]
    let tod = -1, sky, tint, tn = new Map()
    const T = h => { let v = tn.get(h); if (!v) { const c = hex(h); v = css([c[0] * tint[0][0] + tint[1][0], c[1] * tint[0][1] + tint[1][1], c[2] * tint[0][2] + tint[1][2]].map(x => clamp(x, 0, 255))); tn.set(h, v) } return v }
    const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h) }
    const dark = (h, k = .75) => { const c = hex(h); return '#' + c.map(v => Math.round(v * k).toString(16).padStart(2, '0')).join('') }
    const light = (h, k = .25) => { const c = hex(h); return '#' + c.map(v => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0')).join('') }

    function paint() {
      sky = skyAt(tod); tint = tintAt(tod); tn = new Map()
      root.style.background = css(sky[2])
      setField(root, mixc(sky[1], sky[2], .1))
      /* sky: six bands, ordered-dithered into each other like a 16-colour title screen */
      let g = C.sky; g.clearRect(-OV, -OV, CW, CH)
      const id = g.createImageData(CW, CH), d = id.data, top = 0, bot = 168
      for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
        const v = clamp((y - OV - top) / (bot - top)) * (sky.length - 1), b = Math.min(sky.length - 2, v | 0), f = v - b
        const c = f > BAYER[(y & 3) * 4 + (x & 3)] ? sky[b + 1] : sky[b], o = (y * CW + x) * 4
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255
      }
      g.putImageData(id, 0, 0)
      const sun = tod < .72, sx = lerp(420, 392, sm(0, .55, tod)) | 0, sy = lerp(36, 128, sm(0, .55, tod)) | 0
      if (sun) {   // the sun sinks behind the mountains; at sunset two cloud stripes cross its face
        const sc = mixc([255, 240, 150], [255, 150, 70], sm(.2, .55, tod)), r = lerp(9, 13, sm(.2, .55, tod)) | 0
        for (let y = -r - 4; y <= r + 4; y++) for (let x = -r - 4; x <= r + 4; x++) {
          const dd = Math.hypot(x, y); if (dd > r + 4) continue
          if (dd <= r) rect(g, sx + x, sy + y, 1, 1, css(sc))
          else if (BAYER[((sy + y) & 3) * 4 + ((sx + x) & 3)] < .5 - (dd - r) / 10) rect(g, sx + x, sy + y, 1, 1, css(mixc(sc, sky[2], .45)))
        }
        if (tod > .35) for (const yy of [sy - 2, sy + 3]) rect(g, sx - r - 6, yy, 2 * r + 12, 1, css(mixc(sky[3], [120, 60, 120], .3)))
      } else {     // a crescent moon
        const mx = 428, my = 34
        for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) if (Math.hypot(x, y) <= 7 && Math.hypot(x + 4, y - 2) > 6.2) rect(g, mx + x, my + y, 1, 1, '#f7f0cf')
      }
      /* far: mountains with snowcaps, then green hills with a windmill (its blades turn on the clock) */
      g = C.far; g.clearRect(-OV, -OV, CW, CH)
      const ridge = (base, amp, f, ph, col, top2) => {
        g.fillStyle = col
        for (let x = -OV; x < AW + OV; x++) {
          const h = base - amp * (.5 + .5 * Math.sin(x * f + ph)) - amp * .4 * Math.abs(Math.sin(x * f * 2.7 + ph * 2)) | 0; g.fillRect(x, h, 1, 200)
          if (top2 && h < top2) { const dpt = Math.min(7, (top2 - h) * .9 | 0); g.fillStyle = T('#eef0f8'); for (let y = 0; y < dpt + 2; y++) if (y < dpt || BAYER[((h + y) & 3) * 4 + (x & 3)] < .5) g.fillRect(x, h + y, 1, 1); g.fillStyle = col }
        }
      }
      ridge(150, 26, .021, 1.2, T('#9b93c9'), 125)
      ridge(166, 12, .034, 3.1, T('#7f8fc0'))
      g.fillStyle = T('#5e9a5a')
      for (let x = -OV; x < AW + OV; x++) { const h = 178 - 18 * Math.exp(-(((x - 214) / 38) ** 2)) - 6 * Math.sin(x * .05) | 0; g.fillRect(x, h, 1, 200) }
      for (let x = -OV; x < AW + OV; x++) for (let y = 160; y < 200; y++) if (BAYER[(y & 3) * 4 + (x & 3)] < (y - 160) / 60) { g.fillStyle = T('#4c8650'); g.fillRect(x, y, 1, 1) }
      const RT = rng(seed * 7 + 3)
      for (let i = 0; i < 26; i++) { const x = RT() * AW | 0, y = 178 - 18 * Math.exp(-(((x - 214) / 38) ** 2)) - 6 * Math.sin(x * .05) | 0; rect(g, x, y - 3, 3, 3, T('#3f7346')); rect(g, x + 1, y - 4, 1, 1, T('#3f7346')) }
      rect(g, 212, 146, 4, 13, T('#e9e2d0')); rect(g, 213, 144, 2, 2, T('#b5574b')); rect(g, 215, 146, 1, 13, T('#c2b9a3')); rect(g, 213, 155, 2, 4, T('#6d5a4a'))
      /* town: houses drawn base-coloured, then lit for the hour; windows switch on by their own thresholds */
      g = C.town; g.clearRect(-OV, -OV, CW, CH)
      windows.length = 0
      const R2 = rng(seed * 13 + 1)
      for (const h of HOUSES) house(g, h, R2)
      // pavement, kerb, road with dashes
      rect(g, -OV, GROUND, CW, 8, T('#a9a2a8')); for (let x = -OV; x < AW + OV; x += 6) rect(g, x, GROUND + 3 + (x / 6 & 1) * 2, 1, 1, T('#8f8890'))
      rect(g, -OV, GROUND, CW, 1, T('#6e6870')); rect(g, -OV, GROUND + 7, CW, 1, T('#ccc6cc')); rect(g, -OV, GROUND + 8, CW, 1, T('#5c5660'))
      rect(g, -OV, GROUND + 9, CW, 20, T('#4a4752')); for (let x = -OV; x < AW + OV; x += 14) rect(g, x, GROUND + 18, 7, 1, T('#d9cf9a'))
      for (let x = -OV; x < AW + OV; x += 3) if ((x * 7 % 5) < 1) rect(g, x, GROUND + 10 + (x * 3 % 17), 1, 1, T('#55525e'))
      // bus stop: shelter, sign, bench
      rect(g, 333, 204, 24, 1, T('#3f4a5a')); rect(g, 333, 204, 1, 18, T('#3f4a5a')); rect(g, 356, 204, 1, 18, T('#3f4a5a'))
      rect(g, 334, 205, 22, 13, 'rgba(170,210,230,.28)'); rect(g, 337, 216, 16, 2, T('#7a5a3a'))
      rect(g, 360, 196, 1, 26, T('#55606e')); rect(g, 357, 192, 7, 6, T('#e8b13a')); rect(g, 359, 194, 3, 2, T('#2a3a5a'))
      // street lamps
      for (const lx of [64, 232, 402]) { rect(g, lx, 198, 1, 24, T('#3c3f4e')); rect(g, lx - 1, 196, 3, 2, T('#3c3f4e')); rect(g, lx - 1, 221, 3, 1, T('#3c3f4e')) }
      // a round tree in front of the apartment block
      const tree = (x, y, r, c1, c2) => { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) rect(g, x + xx, y + yy, 1, 1, T((xx + yy > r * .4 || BAYER[((y + yy) & 3) * 4 + ((x + xx) & 3)] < (xx + yy) / (2 * r)) ? c2 : c1)); rect(g, x, y + r, 2, GROUND - y - r, T('#6a4a34')) }
      tree(262, 196, 9, '#5aa65a', '#3e7d48'); tree(198, 205, 5, '#6ab160', '#47884a')
      // apply the hour's light to everything drawn so far, then add the lights that ignore it
      lightUp(g)
      const night = sm(.5, .8, tod)
      for (const [x, y, th, kind] of windows) {
        if (kind === 'tv' || kind === 'late') continue
        if (kind === 'shop' || kind === 'shop2') { if (tod > th) { const [w2, h2] = kind === 'shop' ? [34, 15] : [26, 16]; g.fillStyle = 'rgba(255,204,110,.42)'; g.fillRect(x, y, w2, h2); g.fillStyle = 'rgba(255,236,170,.5)'; g.fillRect(x, y, w2, 1) } continue }
        if (tod > th) { rect(g, x, y, 4, 5, '#ffd36a'); rect(g, x, y, 4, 1, '#fff0a6'); if (kind === 'plant') { rect(g, x + 1, y + 3, 2, 2, '#3a5a2a'); rect(g, x + 1, y + 2, 1, 1, '#4a7a34') } if (kind === 'person') { rect(g, x + 2, y + 2, 2, 3, '#7a4a3a'); rect(g, x + 2, y + 1, 2, 1, '#5a3a2a') } }
        else if (tod < .45) rect(g, x, y, 1, 1, 'rgba(255,255,255,.55)')
      }
      if (night > .02) for (const lx of [64, 232, 402]) {
        rect(g, lx - 1, 197, 3, 1, '#fff2b0')
        for (let y = 199; y < GROUND + 8; y++) for (let x = lx - 10; x <= lx + 10; x++) { const k = 1 - Math.abs(x - lx) / (4 + (y - 199) * .5); if (k > 0 && BAYER[(y & 3) * 4 + (x & 3)] < k * .55 * night) { g.fillStyle = 'rgba(255,214,120,.35)'; g.fillRect(x, y, 1, 1) } }
      }
      if (tod > .6) text(g, 'BAKERY', 80 + 26 - 11, 188, '#ffe08a')   // the bakery's sign glows
      /* front: a hedge with flowers and a fence along the near side of the road */
      g = C.front; g.clearRect(-OV, -OV, CW, CH)
      const RF = rng(seed * 17 + 5)
      for (let x = -OV; x < AW + OV; x++) { const h = 252 + Math.round(2 * Math.sin(x * .3) + Math.sin(x * .11) + (RF() < .3 ? -1 : 0)); rect(g, x, h, 1, 30, '#3f7d46'); if (RF() < .25) rect(g, x, h + 2 + (RF() * 4 | 0), 1, 1, '#2f6238') }
      for (let i = 0; i < 46; i++) { const x = RF() * AW | 0, y = 252 + (RF() * 8 | 0); rect(g, x, y, 1, 1, ['#ffb3c8', '#ffe27a', '#f7f2ff', '#ff8a7a'][RF() * 4 | 0]) }
      for (let x = 150; x < 300; x += 5) { rect(g, x, 244, 2, 10, '#efe6d6'); rect(g, x, 243, 1, 1, '#efe6d6') } rect(g, 150, 247, 150, 1, '#d8ccb8')
      rect(g, 312, 242, 6, 5, '#d0453c'); rect(g, 314, 247, 2, 7, '#6a4a3a'); rect(g, 313, 243, 4, 1, '#b8392f')   // a postbox
      lightUp(g)
      // grass tufts that will sway are drawn per frame
    }
    function lightUp(g) {   // multiply the layer by the hour's light (pixel art keeps its flat colours, just warmer or bluer)
      const id = g.getImageData(0, 0, CW, CH), d = id.data, [m, a] = tint
      for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { d[i] = d[i] * m[0] + a[0]; d[i + 1] = d[i + 1] * m[1] + a[1]; d[i + 2] = d[i + 2] * m[2] + a[2] }
      g.putImageData(id, 0, 0)
    }
    function house(g, h, R2) {
      const { x, w, top } = h, wall = h.wall, roof = h.roof, sh = dark(wall, .8)
      rect(g, x, top, w, GROUND - top, wall); rect(g, x + w - 2, top, 2, GROUND - top, sh); rect(g, x, top, 1, GROUND - top, light(wall, .12))
      if (h.brick) for (let y = top + 2; y < GROUND; y += 3) { rect(g, x, y, w, 1, dark(wall, .86)); for (let xx = x + ((y / 3 & 1) * 3); xx < x + w; xx += 6) rect(g, xx, y - 2, 1, 2, dark(wall, .9)) }
      if (h.siding) for (let y = top + 2; y < GROUND; y += 2) rect(g, x, y, w - 2, 1, dark(wall, .93))
      // roofs
      if (h.kind === 'gable' || h.kind === 'hip') {
        const ph = top - h.peak
        for (let i = 0; i <= ph; i++) { const y = h.peak + i, half = (w / 2 + 2) * i / ph, inset = h.kind === 'hip' ? 4 * (1 - i / ph) : 0; rect(g, x + w / 2 - half - inset | 0, y, half * 2 + inset * 2 | 0, 1, i % 3 === 2 ? dark(roof, .82) : roof) }
        rect(g, x - 2, top, w + 4, 1, dark(roof, .6)); rect(g, x, top + 1, w, 1, dark(wall, .7))
      } else if (h.kind === 'mansard') {
        for (let i = 0; i < 10; i++) rect(g, x + 4 - (i * .4 | 0), top - 10 + i, w - 8 + (i * .8 | 0), 1, i % 3 === 2 ? dark(roof, .8) : roof)
        rect(g, x - 1, top, w + 2, 1, dark(roof, .6))
        for (const dx of [10, 26]) { rect(g, x + dx, top - 8, 6, 7, light(roof, .15)); rect(g, x + dx + 1, top - 6, 4, 4, '#2a3550'); windows.push([x + dx + 1, top - 6, .55 + R2() * .4, 'w']) }
      } else if (h.kind === 'flat') {
        rect(g, x - 1, top - 3, w + 2, 3, roof); rect(g, x - 1, top, w + 2, 1, dark(roof, .7))
      } else if (h.kind === 'tower') {
        const ph = top - h.peak
        for (let i = 0; i <= ph; i++) { const half = (w / 2 + 1) * i / ph; rect(g, x + w / 2 - half | 0, h.peak + i, half * 2 | 0, 1, i % 4 === 3 ? dark(roof, .8) : roof) }
        rect(g, x + w / 2, h.peak - 6, 1, 6, '#3a3a48'); rect(g, x + w / 2 - 2, h.peak - 5, 5, 1, '#3a3a48'); rect(g, x + w / 2 + 2, h.peak - 6, 2, 1, '#3a3a48')
        for (let y = top + 4; y < GROUND; y += 5) rect(g, x, y, w - 2, 1, dark(wall, .9))
        // clock face (its hands are drawn per frame, showing the hour of data-tod)
        for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) { const dd = Math.hypot(xx, yy); if (dd <= 6) rect(g, x + 15 + xx, 142 + yy, 1, 1, dd > 5 ? '#6a5a40' : '#f4ecd4') }
        rect(g, x + 11, 162, 8, 12, '#3b3550'); rect(g, x + 12, 163, 6, 10, '#2a2a44'); windows.push([x + 13, 165, .5, 'w'])
        rect(g, x + 10, 196, 10, 26, dark(wall, .55)); rect(g, x + 11, 197, 8, 25, '#5a3a2a')
      }
      if (h.dormer) { const dx = x + w / 2 - 4 | 0; rect(g, dx, h.dormer - 1, 9, 1, dark(roof, .6)); rect(g, dx + 1, h.dormer, 7, 8, light(wall, .1)); rect(g, dx + 2, h.dormer + 2, 5, 5, '#2a3550'); windows.push([dx + 2, h.dormer + 2, .62, 'w']) }
      if (h.round) { const cx = x + w / 2 | 0, cy = top - 6; for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) if (xx * xx + yy * yy <= 5) rect(g, cx + xx, cy + yy, 1, 1, '#2a3550'); windows.push([cx - 1, cy - 1, .9, 'round']) }
      if (h.chim) { rect(g, h.chim, (h.peak ?? top) + (h.kind === 'gable' ? 4 : -8), 5, 12, '#8a4a3a'); rect(g, h.chim - 1, (h.peak ?? top) + (h.kind === 'gable' ? 3 : -9), 7, 2, '#5a3a32') }
      const win = (wx, wy, th, kind = 'w') => {
        rect(g, wx - 1, wy - 1, 6, 7, light(wall, .35)); rect(g, wx, wy, 4, 5, '#2a3550'); rect(g, wx - 1, wy + 5, 6, 1, dark(wall, .65)); rect(g, wx + 2, wy, 1, 5, light(wall, .35))
        if (R2() < .35) { rect(g, wx, wy, 1, 5, '#c85a6a'); rect(g, wx + 3, wy, 1, 5, '#c85a6a') }
        windows.push([wx, wy, th, kind])
      }
      for (const [dx, wy] of h.wins || []) win(x + dx, wy, .5 + R2() * .45, R2() < .15 ? 'plant' : R2() < .15 ? 'person' : 'w')
      if (h.grid) { const [cols, rows, y0, dy] = h.grid; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = r * cols + c; win(x + 6 + c * 13, y0 + r * dy, .48 + R2() * .5, k === 9 ? 'tv' : k === 6 ? 'late' : R2() < .15 ? 'person' : 'w') } rect(g, x + 6, y0 + rows * dy - 3, 44, 1, dark(wall, .7)) }
      if (h.tank) { rect(g, x + 36, top - 12, 12, 9, '#7a6a58'); rect(g, x + 35, top - 13, 14, 2, '#5a4a40'); rect(g, x + 38, top - 3, 1, 3, '#4a3a30'); rect(g, x + 45, top - 3, 1, 3, '#4a3a30'); rect(g, x + 12, top - 14, 1, 11, '#3a3a48'); rect(g, x + 8, top - 12, 9, 1, '#3a3a48'); rect(g, x + 9, top - 9, 7, 1, '#3a3a48') }
      if (h.door) { rect(g, x + h.door - 1, GROUND - 13, 8, 13, dark(wall, .6)); rect(g, x + h.door, GROUND - 12, 6, 12, dark(h.roof, .9)); rect(g, x + h.door + 4, GROUND - 6, 1, 1, '#e8c060') }
      if (h.bakery) {
        rect(g, x + 6, 186, 40, 8, '#6a3f2e'); rect(g, x + 7, 187, 38, 6, '#8a5a3a'); text(g, 'BAKERY', x + 26 - 11, 188, '#f4dca0')
        for (let i = 0; i < 44; i++) rect(g, x + 4 + i, 196, 1, 5, (i / 4 | 0) % 2 ? '#f4efe8' : '#d64545'); for (let i = 0; i < 44; i += 4) rect(g, x + 4 + i, 201, 2, 1, (i / 4 | 0) % 2 ? '#f4efe8' : '#d64545')
        rect(g, x + 6, 203, 34, 15, '#2a3550'); rect(g, x + 5, 202, 36, 1, '#c9b48a'); rect(g, x + 5, 218, 36, 1, '#c9b48a')
        for (const [bx, by, bw] of [[9, 213, 7], [18, 214, 6], [26, 213, 8], [12, 209, 6], [24, 209, 5]]) { rect(g, x + bx, by, bw, 3, '#d9a25a'); rect(g, x + bx + 1, by, bw - 2, 1, '#f0c47a') }
        rect(g, x + 44, 205, 6, 17, '#7a4a32'); rect(g, x + 48, 213, 1, 1, '#e8c060')
        windows.push([x + 6, 203, .55, 'shop'])
      }
      if (h.cafe) {
        rect(g, x + 4, 194, 42, 6, '#2f4f44'); text(g, 'CAFE', x + 25 - 7, 195, '#f2e6c8'); rect(g, x + 6, 202, 26, 16, '#2a3550'); rect(g, x + 36, 205, 7, 17, '#3a2a24')
        windows.push([x + 6, 202, .5, 'shop2'])
      }
    }

    /* ---------- actors (all snapped to whole art pixels) ---------- */
    function person(g, x, y, p, frame, face) {   // a 5-wide, 8–10-tall villager with a 2-frame walk
      const h = p.h, top = y - h
      rect(g, x + 1, top, 3, 3, T('#f0c6a0')); rect(g, x + 1, top, 3, 1, T(p.hair)); rect(g, x + (face > 0 ? 1 : 3), top + 1, 1, 1, T(p.hair))
      if (p.extra === 'hat') { rect(g, x, top - 1, 5, 1, T('#3a3a5a')); rect(g, x + 1, top - 2, 3, 1, T('#3a3a5a')) }
      rect(g, x + 1, top + 3, 3, h - 6, T(p.shirt)); rect(g, x + (face > 0 ? 3 : 1), top + 4, 1, h - 8, T(dark(p.shirt, .8)))
      const ly = y - 3
      if (frame) { rect(g, x + 1, ly, 1, 3, T('#3a3a52')); rect(g, x + 3, ly, 1, 2, T('#3a3a52')) } else { rect(g, x + 2, ly, 1, 3, T('#3a3a52')); rect(g, x + 1, ly + 1, 1, 2, T('#3a3a52')) }
      if (p.extra === 'bread') { rect(g, x + (face > 0 ? 4 : -1), top + 3, 1, 5, T('#e0a85a')); rect(g, x + (face > 0 ? 4 : -1), top + 3, 1, 1, T('#f0c880')) }
      if (p.extra === 'cane') rect(g, x + (face > 0 ? 5 : -1), top + 4, 1, h - 4, T('#6a4a32'))
    }
    function dog(g, x, y, frame, face) { rect(g, x, y - 4, 5, 2, T('#b07a4a')); rect(g, x + (face > 0 ? 4 : -1), y - 6, 2, 2, T('#b07a4a')); rect(g, x + (face > 0 ? 5 : -1), y - 6, 1, 1, T('#3a2a20')); rect(g, x + (face > 0 ? -1 : 5), y - 5 - frame, 1, 1, T('#b07a4a')); rect(g, x + (frame ? 0 : 1), y - 2, 1, 2, T('#7a5030')); rect(g, x + (frame ? 4 : 3), y - 2, 1, 2, T('#7a5030')) }
    function bus(g, x, y, t, doorOpen, moving, night) {   // 46 × 18, two-tone, lit windows at night, wheels with a 2-frame spin
      rect(g, x, y + 2, 46, 13, T(BUS)); rect(g, x, y + 9, 46, 6, T('#f0e2c2')); rect(g, x + 1, y, 44, 2, T(BUS2)); rect(g, x, y + 15, 46, 1, T('#3a3440'))
      for (let i = 0; i < 6; i++) { const wx = x + 7 + i * 6; rect(g, wx, y + 4, 5, 5, night ? '#ffd36a' : T('#9fd0ee')); if (!night) rect(g, wx, y + 4, 2, 1, T('#e8f6ff')); if (night && (i * 7 + 3) % 4 === 0) rect(g, wx + 1, y + 6, 2, 3, '#7a4a3a') }
      rect(g, x + 1, y + 4, 5, 6, night ? '#ffe08a' : T('#9fd0ee')); rect(g, x + 1, y + 3, 5, 1, T('#2a2a3a')); text(g, '7', x + 2, y - 5 + 4, night ? '#ffcf5a' : T('#ffcf5a'))
      if (word) { const tw = textW(word), px0 = x + 25 - (tw + 4) / 2 | 0; rect(g, px0, y + 9, tw + 4, 6, T(PANEL)); text(g, word, px0 + 2, y + 9, PANEL_INK) }   // the product's name rides on the side
      const dw = doorOpen ? 0 : 1; rect(g, x + 2, y + 10, 4, 5, doorOpen ? T('#3a3440') : T(BUS2)); if (dw) rect(g, x + 4, y + 10, 1, 5, T(dark(BUS2, .8)))
      for (const wx of [x + 8, x + 35]) { rect(g, wx, y + 14, 5, 4, T('#26222c')); rect(g, wx + 1, y + 15, 3, 2, T('#8a8a96')); rect(g, wx + ((moving && (t * 8 | 0) % 2) ? 1 : 3), y + 16, 1, 1, T('#26222c')) }
      rect(g, x, y + 12, 1, 2, night ? '#fff6c0' : T('#f6e4a0')); rect(g, x + 45, y + 12, 1, 2, '#ff4a3a')
      if (night) for (let k = 1; k < 18; k++) for (let yy = 0; yy < 3 + k / 4; yy++) if (BAYER[((y + 12 + yy) & 3) * 4 + ((x - k) & 3)] < .45 - k / 40) { g.fillStyle = 'rgba(255,240,170,.5)'; g.fillRect(x - k, y + 12 + yy - (k / 8 | 0), 1, 1) }
    }
    function smoke(g, cx, cy, t, rate, life, dens) {   // puffs rise a pixel at a time, drift with the breeze and dissolve
      const n = Math.floor(t / rate)
      for (let i = 0; i < life / rate; i++) {
        const age = (t % rate) + i * rate, k = n - i, up = age * 4.6 | 0, x = cx + (age * 2.4 + Math.sin(age * 1.1 + k) * 1.2) | 0, y = cy - up, r = Math.min(4, 1.6 + age * .5) | 0, fade = sm(.4, 1, age / life)
        for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const d2 = xx * xx + yy * yy; if (d2 > r * r + 1) continue; if (BAYER[((y + yy) & 3) * 4 + ((x + xx) & 3)] < fade * dens + (d2 > (r - 1) * (r - 1) ? .25 : 0)) continue; rect(g, x + xx, y + yy, 1, 1, T(yy > r / 2 || xx > r / 2 ? '#cfcadd' : '#f4f0f8')) }
      }
    }
    function frame(t, el, still) {
      const want = clamp(+root.dataset.tod || 0)
      if (want !== tod) { tod = want; paint() }
      const night = tod > .62
      /* sky: clouds, a balloon by day, a V of birds, twinkling stars by night */
      let g = G.sky; g.clearRect(-OV, -OV, CW, CH); g.drawImage(C.sky.canvas, -OV, -OV)
      if (tod > .55) for (const [x, y, r, ph] of stars) { if (y > 118) continue; const tw = ((t + ph) * 1.3 | 0) % 7 === 0; rect(g, x, y, 1, 1, tw ? 'rgba(255,255,255,.35)' : r > .85 ? '#fff6d8' : 'rgba(230,236,255,.8)'); if (r > .93 && !tw) { rect(g, x - 1, y, 1, 1, 'rgba(230,236,255,.35)'); rect(g, x + 1, y, 1, 1, 'rgba(230,236,255,.35)') } }
      const cl1 = css(mixc(mixc([255, 255, 255], [255, 196, 186], sm(.2, .55, tod)), [92, 104, 160], sm(.55, .95, tod))), cl2 = css(mixc(mixc([214, 228, 246], [214, 132, 150], sm(.2, .55, tod)), [62, 72, 128], sm(.55, .95, tod)))
      for (const c of clouds) {
        const x = Math.round(((c.x - t * c.v) % (AW + 120) + AW + 120) % (AW + 120) - 60), y = c.y
        let bx = x; for (const b of c.bumps) { rect(g, bx, y - b, 7, b + 4, cl1); bx += c.w / c.bumps.length | 0 }
        rect(g, x - 3, y, c.w + 8, 4, cl1); rect(g, x - 2, y + 3, c.w + 6, 2, cl2)
      }
      if (tod < .6) {   // a striped hot-air balloon drifting over the hills, bobbing a pixel
        const u = ((t + 160) % 420) / 420, bx = Math.round(lerp(500, 330, u)), by = 64 + ((t / 2 | 0) % 2)
        if (bx < 490) { for (let yy = -6; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) if ((xx / 5) ** 2 + (yy / 6) ** 2 <= 1 && !(yy > 3 && Math.abs(xx) > 2)) rect(g, bx + xx, by + yy, 1, 1, T((xx + 6) / 2 % 2 < 1 ? '#e8574a' : '#f4e2b8')); rect(g, bx - 1, by + 7, 3, 2, T('#8a5a3a')); rect(g, bx - 2, by + 5, 1, 2, T('#6a4a3a')); rect(g, bx + 2, by + 5, 1, 2, T('#6a4a3a')) }
      }
      { const u = ((t + 30) % 47) / 9; if (u < 1 && tod < .7) for (const [dx, dy] of [[0, 0], [-5, -3], [-5, 3], [-10, -5]]) { const x = Math.round(lerp(-20, 500, u)) + dx, y = 84 + dy + Math.round(Math.sin(u * 9) * 2), f = (t * 6 | 0) % 2; rect(g, x - 2, y - f, 2, 1, T('#3a3550')); rect(g, x, y, 1, 1, T('#3a3550')); rect(g, x + 1, y - f, 2, 1, T('#3a3550')) } }
      /* far: the windmill's sails, four steps a turn */
      g = G.far; g.clearRect(-OV, -OV, CW, CH); g.drawImage(C.far.canvas, -OV, -OV)
      { const s = (t * 1.6 | 0) % 2, sail = T('#efe6d6'), cx = 214, cy = 146
        if (s) { rect(g, cx - 7, cy, 15, 1, sail); rect(g, cx, cy - 7, 1, 15, sail); rect(g, cx - 7, cy - 1, 4, 1, sail); rect(g, cx + 4, cy + 1, 4, 1, sail); rect(g, cx + 1, cy - 7, 1, 4, sail); rect(g, cx - 1, cy + 4, 1, 4, sail) }
        else for (let i = -5; i <= 5; i++) { rect(g, cx + i, cy + i, 1, 1, sail); rect(g, cx + i, cy - i, 1, 1, sail); if (Math.abs(i) > 2) { rect(g, cx + i + 1, cy + i, 1, 1, sail); rect(g, cx + i - 1, cy - i, 1, 1, sail) } }
        rect(g, cx, cy, 1, 1, T('#6a5a4a')) }
      /* town: smoke, the cat, laundry, dynamic windows, the clock's hands, walkers, the bus */
      g = G.town; g.clearRect(-OV, -OV, CW, CH); g.drawImage(C.town.canvas, -OV, -OV)
      smoke(g, 122, 170, t, 1.7, 7, 1)                       // the bakery's ovens never stop
      if (night) smoke(g, 26, 145, t + 3, 2.2, 6, 1.1)         // a fireplace lit for the evening
      for (const [x, y, th, kind] of windows) {
        if (kind === 'tv' && tod > .55) { const k = ((t * 3.3 | 0) * 2654435761 >>> 0) % 5; rect(g, x, y, 4, 5, ['#7fb6ff', '#a8d2ff', '#6a98e8', '#c8e4ff', '#8ab0f0'][k]); rect(g, x, y + 4, 4, 1, '#4a6ab0') }
        else if (kind === 'late' && tod > .62) { if ((t % 70) < 52 || still) { rect(g, x, y, 4, 5, '#ffcf5a'); rect(g, x, y, 4, 1, '#fff0a6') } }
      }
      { // the clock tower shows the hour that data-tod stands for (3 pm at 0 → 11 pm at 1), the minute hand creeping on the clock
        const hr = 15 + tod * 8 + ((t / 60) % 1) / 12, cx = 433, cy = 142, a1 = (hr % 12) / 12 * Math.PI * 2, a2 = (hr % 1) * Math.PI * 2
        for (let i = 1; i <= 3; i++) rect(g, cx + Math.round(Math.sin(a1) * i), cy - Math.round(Math.cos(a1) * i), 1, 1, T('#2a2a3a'))
        for (let i = 1; i <= 5; i++) rect(g, cx + Math.round(Math.sin(a2) * i), cy - Math.round(Math.cos(a2) * i), 1, 1, T('#4a4a5a'))
      }
      { // the cat on the blue roof: sits, flicks its tail, and every 23 s stands and stretches
        const cx = 166, cy = 148, c = T(night ? '#2a2638' : '#3a3448'), st = (t % 23), stretch = !still && st > 18 && st < 21.5, flick = (t * 2 | 0) % 3 === 0
        if (stretch) { const p = st < 19 || st > 21 ? 0 : 1; rect(g, cx - 3, cy - 2 - p, 4, 2, c); rect(g, cx + 1, cy - 1, 5, 1, c); rect(g, cx + 5, cy - 3, 3, 3, c); rect(g, cx + 5, cy - 4, 1, 1, c); rect(g, cx + 7, cy - 4, 1, 1, c); rect(g, cx - 4, cy - 4 - p, 1, 2, c); rect(g, cx - 3, cy, 1, 1, c); rect(g, cx + 6, cy, 1, 1, c) }
        else { rect(g, cx, cy - 4, 4, 4, c); rect(g, cx + 1, cy - 7, 3, 3, c); rect(g, cx + 1, cy - 8, 1, 1, c); rect(g, cx + 3, cy - 8, 1, 1, c); rect(g, cx - 1, cy - 1 - (flick ? 2 : 0), 1, flick ? 3 : 1, c); rect(g, cx - 2, cy - 3 - (flick ? 1 : 0), 1, 2, c) }
        if (night) { rect(g, cx + (stretch ? 6 : 1), cy - (stretch ? 2 : 6), 1, 1, '#d8f06a'); rect(g, cx + (stretch ? 7 : 3), cy - (stretch ? 2 : 6), 1, 1, '#d8f06a') }
      }
      { // laundry across the alley, flapping in two frames
        const f = (t * 2.5 | 0) % 2; rect(g, 194, 182, 12, 1, T('#ddd6cc'))
        rect(g, 195, 183, 3, 4 + f, T('#f2f0ea')); rect(g, 199, 183, 4, 3, T('#e87a8a')); rect(g, 199 + f, 186, 3, 1, T('#e87a8a')); rect(g, 204, 183, 2, 5 - f, T('#7ab0e0'))
      }
      { // pigeons on the apartment block's antenna; one hops now and then
        const hop = ((t + 4) % 9) < .35 ? 1 : 0
        rect(g, 266, 125 - hop, 2, 2, T('#7a7a8e')); rect(g, 268, 125 - hop, 1, 1, T('#5a5a6e')); rect(g, 271, 126, 2, 1, T('#8a8aa0'))
      }
      // walkers, and the one waiting at the stop who boards the bus
      const C2 = 46, bt = (t + 12) % C2, stopX = 330
      let bx = null, door = false, moving = true
      if (bt < 8) { bx = Math.round(lerp(500, stopX, 1 - (1 - bt / 8) ** 2)); moving = bt < 7.9 }
      else if (bt < 14) { bx = stopX; door = bt > 8.6 && bt < 13.2; moving = false }
      else if (bt < 22) { bx = Math.round(stopX - 380 * ((bt - 14) / 8) ** 2); }
      for (const p of walkers) {
        if (night && !p.night && p.extra !== 'dog') continue
        const span = AW + 40, x = Math.round(((p.x + p.dir * p.v * t) % span + span) % span - 20), fr = (t * (p.v / 3.2) | 0) % 2
        person(g, x, GROUND + 6, p, fr, p.dir)
        if (p.extra === 'dog') dog(g, x + p.dir * 9, GROUND + 7, (t * 5 | 0) % 2, p.dir)
      }
      const waiting = !(bt > 10 && bt < 30)
      if (waiting) { const look = ((t / 3.1 | 0) % 2) ? 1 : -1; person(g, 342, GROUND + 4, { h: 10, hair: '#6a3a2a', shirt: '#c8579a' }, 0, look) }
      if (bt > 10.2 && bt < 13) person(g, Math.round(lerp(342, stopX + 4, (bt - 10.2) / 1.2)), GROUND + 4, { h: 10, hair: '#6a3a2a', shirt: '#c8579a' }, (t * 4 | 0) % 2, -1)
      if (bx !== null && bx < AW + 10) bus(g, bx, GROUND + 9, t, door, moving, night)
      /* front: grass tufts lean in the breeze, two frames */
      g = G.front; g.clearRect(-OV, -OV, CW, CH); g.drawImage(C.front.canvas, -OV, -OV)
      const lean = (t * 1.2 | 0) % 2
      for (let i = 0; i < 22; i++) { const x = (i * 23 + 7) % AW; rect(g, x + lean, 249, 1, 2, T('#4f9a52')); rect(g, x + 2, 250, 1, 1, T('#4f9a52')) }
    }
    const printT = +(root.dataset.printT || 43)   // 43 s: the bus has pulled in at the stop, doors open, someone waiting
    Deck.clock(root, frame, { printT })
    frame(printT, root, true)
  }

  document.querySelectorAll('.sc-pixel-town').forEach(init)
  ;(window.Pack = window.Pack || {})['pixel-town'] = { init }
})()
