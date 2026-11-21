/* Pack scene "alpine" (assets/packs/scenes/alpine): a ski slope in the Alps, from a bright afternoon to a starry night.
   Markup: <div class="sc-alpine" data-tod="…" aria-hidden="true"></div> as a slide's first child; this file draws it.
   data-tod 0 = bright afternoon · .5 alpenglow (the peaks turn pink) · 1 night (stars, moonlit snow, lit chalet).
   Planes (back → front, .parallax children): sky · far range · main peaks · forest ridge and the far snowfield (skier) ·
   chairlift · chalet and foreground snow · snowfall at two depths (canvas). One clock (Deck.clock); every actor is a
   pure function of t. Print / reduced motion: a composed still at PRINT_T (skier mid-run, chairs spread). */
(() => {
  'use strict'
  const W = 1920, H = 1080, BX = 40, BY = 30, LW = W + 2 * BX, LH = H + 2 * BY, VB = `${-BX} ${-BY} ${LW} ${LH}`
  const PRINT_T = 17
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const f = n => String(Math.round(n * 10) / 10)
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * k)) }
  const ramp = (s, x) => { x = clamp(x) * (s.length - 1); const i = Math.min(s.length - 2, Math.floor(x)), k = x - i; return typeof s[0] === 'number' ? s[i] + (s[i + 1] - s[i]) * k : mix(s[i], s[i + 1], k) }
  const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k) }
  const mod = (a, n) => ((a % n) + n) % n
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
  const R = (x, w, h, b) => `M${f(x)} ${f(b)}V${f(b - h)}H${f(x + w)}V${f(b)}Z`
  const LIMB = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'
  const cx2 = (() => { const c = document.createElement('canvas'); c.width = c.height = 1; return c.getContext('2d', { willReadFrequently: true }) })()
  const cssHex = v => { v = (v || '').trim(); if (!v) return null; cx2.fillStyle = '#010203'; cx2.fillStyle = v; if (cx2.fillStyle === '#010203' && !/^#010203$/i.test(v)) return null; cx2.clearRect(0, 0, 1, 1); cx2.fillRect(0, 0, 1, 1); const d = cx2.getImageData(0, 0, 1, 1).data; return d[3] > 200 ? toHex([d[0], d[1], d[2]]) : null } // any CSS colour syntax (oklch, lab…) → #rrggbb; gradients → null

  // ---------- the light: afternoon · late afternoon · alpenglow · dusk · night ----------
  const PAL = {
    top: ['#2456A8', '#2E4C9C', '#3B3A8C', '#28307A', '#1A255E'],
    mid: ['#5B8ED6', '#7685C6', '#8E5E9E', '#47488F', '#2A397C'],
    low: ['#BCD6F2', '#E4C4CC', '#F4A6A2', '#806CA8', '#3E4F90'],
    lit: ['#F6F8FF', '#FFE9E2', '#FFB2A2', '#BBA9D8', '#93A2D4'],
    shade: ['#9CB3E0', '#A9A6D6', '#8E76B8', '#5F5E9E', '#40508E'],
    rock: ['#56638E', '#5B5886', '#5A4676', '#3B3B6F', '#293262'],
    forest: ['#2C4868', '#314263', '#33355E', '#252C56', '#1B2349'],
    snow: ['#E3EBFA', '#EBDDE6', '#E6BDC6', '#9C9ACA', '#7180BA'],
    snowS: ['#AFC2E8', '#B9B3DA', '#B08FB8', '#706FAA', '#4C5C9A'],
    haze: ['#CFE0F6', '#EBD0D6', '#F2B4B2', '#8F7CB4', '#4A5A9A'],
  }
  const LAMP = '#FFCF85'

  let grainURL = ''
  const grain = () => {
    if (grainURL) return grainURL
    try {
      const c = document.createElement('canvas'); c.width = c.height = 256
      const x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(17)
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
      x.putImageData(d, 0, 0); grainURL = c.toDataURL()
    } catch { grainURL = 'none' }
    return grainURL
  }

  // a peak: fractal ridges from an apex to two feet; the right face takes the light (the sun is low on the right);
  // rock shows where the faces are too steep to hold snow
  function frac(r, a, b, depth, rough) {
    if (!depth) return [a]
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), d = (r() - .5) * L * rough
    const m = [mx + d * .35, my + d]
    return [...frac(r, a, m, depth - 1, rough), ...frac(r, m, b, depth - 1, rough)]
  }
  function peak(r, ax, ay, wl, wr, base) {
    const sh = [ax - wl * (.35 + r() * .2), ay + (base - ay) * (.22 + r() * .12)] // a shoulder on the shaded side
    const L = [...frac(r, [ax, ay], sh, 3, .42), ...frac(r, sh, [ax - wl, base], 4, .3), [ax - wl, base]]
    const Rr = [...frac(r, [ax, ay], [ax + wr * .45, ay + (base - ay) * .4], 3, .4), ...frac(r, [ax + wr * .45, ay + (base - ay) * .4], [ax + wr, base], 4, .28), [ax + wr, base]]
    const crease = [...frac(r, [ax, ay], [ax + wr * .1, ay + (base - ay) * .5], 3, .5), ...frac(r, [ax + wr * .1, ay + (base - ay) * .5], [ax + wr * .22, base], 3, .45), [ax + wr * .22, base]]
    const P = a => a.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')
    const all = `M${P(L.slice().reverse())}L${P(Rr.slice(1))}Z`
    const litFace = `M${P(crease)}L${P(Rr.slice().reverse())}Z`
    let rocks = ''
    for (let k = 0; k < 7; k++) { // rock patches hanging below the shaded ridge
      const i = 2 + Math.floor(r() * (L.length - 6)), [x, y] = L[i], w = 10 + r() * 26, h = 30 + r() * 70
      rocks += `M${f(x)} ${f(y + 2)}Q${f(x + w * .9)} ${f(y + h * .3)} ${f(x + w * .4)} ${f(y + h)}Q${f(x + w * .1)} ${f(y + h * .5)} ${f(x - w * .2)} ${f(y + h * .6)}Q${f(x - w * .3)} ${f(y + h * .2)} ${f(x)} ${f(y + 2)}Z`
    }
    for (let k = 0; k < 4; k++) { const i = 2 + Math.floor(r() * (Rr.length - 6)), [x, y] = Rr[i], w = 8 + r() * 14, h = 20 + r() * 40; rocks += `M${f(x)} ${f(y + 2)}L${f(x - w)} ${f(y + h)}L${f(x - w * .3)} ${f(y + h * .7)}Z` }
    return { all, litFace, rocks }
  }
  // a snowy pine: stacked tiers, snow on each tier's top edge
  const pine = (x, b, h, dark, snow) => {
    let d = '', s = ''
    const n = 4
    for (let i = 0; i < n; i++) { const t0 = i / n, w = h * (.42 - t0 * .3), y = b - h * .12 - t0 * h * .78; d += `M${f(x - w)} ${f(y)}L${f(x)} ${f(y - h * .34)}L${f(x + w)} ${f(y)}Z`; s += `M${f(x - w * .7)} ${f(y - h * .06)}Q${f(x)} ${f(y - h * .3)} ${f(x + w * .55)} ${f(y - h * .08)}L${f(x + w * .2)} ${f(y - h * .14)}Z` }
    return [d + R(x - h * .03, h * .06, h * .14, b), s]
  }

  let count = 0
  function build(root) {
    if (!root._sc) {
      root._sc = { id: `scal${count++}` }
      if (window.Deck) Deck.clock(root, (t, el, still) => root._sc.frame?.(t, still), { printT: PRINT_T })
      try { new MutationObserver(() => build(root)).observe(root, { attributes: true, attributeFilter: ['data-tod'] }) } catch { /* ok */ }
    }
    const id = root._sc.id, tod = clamp(parseFloat(root.dataset.tod ?? '.5') || 0)
    if (root._sc.tod === tod) return
    root._sc.tod = tod
    const C = {}; for (const k in PAL) C[k] = ramp(PAL[k], tod)
    const slide = root.closest('section.slide'), scs = slide ? getComputedStyle(slide) : null
    const BR = cssHex(scs?.getPropertyValue('--brand')) || '#E5533D', BR2 = cssHex(scs?.getPropertyValue('--brand-2')) || '#F2B84B'
    const field = mix(C.top, C.mid, .4)
    if (slide) { slide.style.setProperty('--field', field); if (window.Deck?.inkOn) slide.style.setProperty('--ink-auto', Deck.inkOn(field)) }
    const night = ss(.72, .95, tod), dusk = ss(.4, .8, tod), glow = 1 - Math.abs(tod - .5) / .28
    root.style.background = `linear-gradient(180deg,${C.top},${C.mid} 40%,${C.low} 62%,${C.snow})`

    // ----- sky -----
    let sky = `<defs><linearGradient id="${id}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="700"><stop offset="0" stop-color="${C.top}"/><stop offset=".55" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.low}"/></linearGradient>
      <radialGradient id="${id}halo"><stop offset="0" stop-color="#E9ECFF" stop-opacity=".6"/><stop offset="1" stop-color="#E9ECFF" stop-opacity="0"/></radialGradient>
      <mask id="${id}mn"><circle cx="1690" cy="150" r="20" fill="#fff"/><circle cx="1680" cy="143" r="18" fill="#000"/></mask></defs>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${LH}" fill="url(#${id}sky)"/>`
    const starsN = Math.round(160 * ss(.5, 1, tod)), twinkle = []
    if (starsN) { const r = rng(23); let st = ''; for (let i = 0; i < starsN; i++) { const x = r() * W, y = r() * r() * 600, o = (.25 + r() * .65) * ss(.5, 1, tod) * (1 - y / 700); st += `<circle cx="${f(x)}" cy="${f(y)}" r="${[.8, 1, 1.2, 1.5, 1.9][Math.floor(r() * 5)]}" opacity="${f(o)}"/>`; if (i % 23 === 5 && x > 1100) twinkle.push([x, y]) } sky += `<g fill="#FFF8EA">${st}</g>` }
    if (night > 0) sky += `<g opacity="${f(night)}"><circle cx="1690" cy="150" r="80" fill="url(#${id}halo)"/><circle cx="1690" cy="150" r="20" fill="#FFF6E2" mask="url(#${id}mn)"/></g>`
    const skyAc = twinkle.map((p, i) => `<circle data-k="tw${i}" cx="${f(p[0])}" cy="${f(p[1])}" r="1.8" fill="#FFFFFF" opacity="0"/>`).join('')
      + `<path data-k="sat" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0"/>`

    // ----- the far range, then the main peaks -----
    const r1 = rng(5)
    const farSpec = [[180, 500, 260, 240], [520, 470, 230, 260], [860, 430, 260, 300], [1180, 380, 260, 300], [1560, 330, 300, 320], [1880, 380, 260, 280]]
    const mainSpec = [[380, 540, 320, 300], [780, 490, 300, 360], [1240, 330, 440, 420], [1580, 290, 360, 340], [1870, 390, 320, 320]]
    let farD = '', farLit = '', mainD = '', mainLit = '', rocks = ''
    for (const [ax, ay, wl, wr] of farSpec) { const p = peak(r1, ax, ay, wl, wr, 700); farD += p.all; farLit += p.litFace }
    for (const [ax, ay, wl, wr] of mainSpec) { const p = peak(r1, ax, ay, wl, wr, 760); mainD += p.all; mainLit += p.litFace; rocks += p.rocks }
    const litC = C.lit, shadeC = C.shade
    const peaks = `<defs><linearGradient id="${id}fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.haze}" stop-opacity="0"/><stop offset="1" stop-color="${C.haze}" stop-opacity=".85"/></linearGradient>
        <linearGradient id="${id}lg" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="760"><stop offset="0" stop-color="${litC}"/><stop offset="1" stop-color="${mix(litC, C.haze, .5)}"/></linearGradient>
        <linearGradient id="${id}sg" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="760"><stop offset="0" stop-color="${shadeC}"/><stop offset="1" stop-color="${mix(shadeC, C.haze, .45)}"/></linearGradient></defs>
      <g opacity=".75"><path d="${farD}" fill="${mix(shadeC, C.haze, .45)}"/><path d="${farLit}" fill="${mix(litC, C.haze, .45)}"/></g>
      <rect x="${-BX}" y="520" width="${LW}" height="200" fill="url(#${id}fh)" opacity=".7"/>
      <path d="${mainD}" fill="url(#${id}sg)"/><path d="${mainLit}" fill="url(#${id}lg)"/>
      <path d="${rocks}" fill="${C.rock}" opacity=".5"/>
      ${glow > 0 ? `<path d="${mainLit}" fill="#FF7E8A" opacity="${f(.18 * glow)}" style="mix-blend-mode:screen"/>` : ''}
      <rect x="${-BX}" y="600" width="${LW}" height="170" fill="url(#${id}fh)"/>`

    // ----- forest ridge and the far snowfield where the skier runs -----
    const r2 = rng(9)
    let ridge = `M${-BX} ${H}`
    const ry = x => 760 - 120 * Math.exp(-(((x - 1250) / 380) ** 2)) - 30 * Math.sin(x / 210) - 40 * ss(1500, 1960, x)
    for (let x = -BX; x <= W + BX; x += 20) ridge += `L${x} ${f(ry(x))}`
    ridge += `L${W + BX} ${H}Z`
    let trees = '', tsnow = ''
    for (let x = -BX; x < W + BX; x += (Math.sin(x / 90) > .3 ? 6 : 16) + r2() * 10) {
      if (x > 820 && x < 1330) continue // the open snowfield
      const h = (14 + r2() * 26) * (Math.sin(x / 90) > .3 ? 1.1 : .8), b = ry(x) + 6 + r2() * 36
      const [d, s] = pine(x, b, h); trees += d; tsnow += s
    }
    const SK = { x0: 1250, y0: 650, x1: 900, y1: 840 } // the skier's run, top to bottom of the snowfield
    const ridgeS = `<defs><linearGradient id="${id}rg" gradientUnits="userSpaceOnUse" x1="0" y1="620" x2="0" y2="900"><stop offset="0" stop-color="${C.snow}"/><stop offset="1" stop-color="${C.snowS}"/></linearGradient></defs>
      <path d="${ridge}" fill="url(#${id}rg)"/>
      <path d="M840 ${f(ry(840) + 20)}Q1080 700 1320 ${f(ry(1320) + 10)}" stroke="${C.snowS}" stroke-width="30" fill="none" opacity=".25"/>
      ${[[300, 860, 520, 26], [1500, 820, 420, 22], [1000, 900, 600, 30], [1760, 900, 300, 20]].map(([x, y, rx, ry2]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry2}" fill="${C.snowS}" opacity=".35" filter="url(#${id}soft)"/>`).join('')}
      <filter id="${id}soft" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
      <g fill="${C.forest}">${trees.replace(/(M[^Z]*Z)/g, '$1')}</g>`.replace(`<g fill="${C.forest}">${trees}</g>`, `<path d="${trees}" fill="${C.forest}"/><path d="${tsnow}" fill="${mix(C.snow, C.forest, .15)}" opacity=".85"/>`)
    const ridgeAc = `<path data-k="trace" stroke="${mix(C.snowS, C.forest, .25)}" stroke-width="1.2" fill="none" opacity=".7"/><path data-k="groom" stroke="${mix(C.snow, '#FFFFFF', .3)}" stroke-width="5" fill="none" opacity="0" stroke-dasharray="2 2"/>
      <g data-k="skier"><path d="M-4 0L4 0" stroke="${mix(C.forest, '#000000', .2)}" stroke-width=".9" stroke-linecap="round"/><path d="M0 -1.5L.6 -5.4" stroke="${BR}" stroke-width="2.2" ${LIMB}/><circle cx=".8" cy="-6.8" r="1.2" fill="${mix(C.forest, '#000000', .2)}"/><path data-k="poles" stroke="${mix(C.forest, '#000000', .2)}" stroke-width=".5"/></g>
      <g data-k="cat" opacity="0"><rect x="-8" y="-6" width="16" height="6" rx="1.4" fill="${mix(BR2, C.forest, .4)}"/><rect x="-3" y="-10" width="8" height="5" rx="1" fill="${mix(BR2, C.forest, .45)}"/><path d="M8 -4L60 -10V4Z" fill="${LAMP}" opacity=".25"/><circle cx="8" cy="-3.5" r="1.3" fill="#FFF6DC"/><circle cx="1" cy="-10.6" r="1" fill="#FFAA33" data-k="catb"/></g>`

    const winOn = ss(.3, .6, tod), winC = winOn > 0 ? LAMP : mix(C.low, '#FFFFFF', .3)
    // ----- the chairlift: towers up the right-hand slope, chairs on a loop, one empty chair swinging -----
    const T = [[1150, 1000], [1380, 900], [1600, 800], [1810, 700], [2010, 610]] // tower feet
    const TH = 96
    const tops = T.map(([x, y], i) => [x, y - TH + i * 6])
    let towers = ''
    T.forEach(([x, y], i) => { const [tx, ty] = tops[i]; towers += `M${x - 3} ${y}L${x - 1.6} ${ty}H${x + 1.6}L${x + 3} ${y}Z` + R(x - 16, 32, 3, ty + 2) })
    const cableY = (x, off) => { // sagging cable between tower tops; off = -1 up line (left), +1 down line (right)
      for (let i = 0; i < tops.length - 1; i++) { const [ax, ay] = tops[i], [bx, by] = tops[i + 1]; if (x >= ax && x <= bx) { const u = (x - ax) / (bx - ax); return ay + (by - ay) * u + 14 * u * (1 - u) + off * 1.5 } }
      const [ax, ay] = tops[0], [bx, by] = tops[1]; return ay + (by - ay) * (x - ax) / (bx - ax)
    }
    let cables = ''
    for (const off of [-1, 1]) { let d = ''; for (let x = tops[0][0]; x <= tops[tops.length - 1][0]; x += 12) d += (d ? 'L' : 'M') + f(x + off * 12) + ' ' + f(cableY(x, off) + 2); cables += d }
    const N = 16, chairs = Array.from({ length: N }, (_, i) => {
      const riders = i === 5 ? 0 : hash(i + 2) < .25 ? 0 : hash(i + 9) < .5 ? 1 : 2
      const coat = [BR, BR2, '#5E9C9A', '#8A5A9E', '#E3B65F'][i % 5]
      let rd = ''
      for (let k = 0; k < riders; k++) { const x = -3.5 + k * 6.5; rd += `<path d="M${x} 13.4L${x + 1.4} 8.6" stroke="${mix(coat, C.forest, .25)}" stroke-width="3.4" ${LIMB}/><circle cx="${x + 1.7}" cy="6.4" r="1.8" fill="${mix(C.forest, '#000000', .2)}"/><path d="M${x} 13.6L${x + 3.4} 14.4L${x + 3.2} 18" stroke="${mix(C.forest, '#000000', .25)}" stroke-width="1.6" ${LIMB}/><path d="M${x + 1} 18.6L${x + 6.4} 17.4" stroke="${mix(C.forest, '#000000', .3)}" stroke-width=".8"/>` }
      return `<g data-k="ch${i}"><path d="M0 0V12M-6 14H7M-6 14V8M-6 8L-6.6 13" stroke="${mix(C.forest, C.rock, .4)}" stroke-width="1.1" ${LIMB}/>${rd}</g>`
    }).join('')
    const lift = `<path d="${towers}" fill="${mix(C.forest, C.rock, .45)}"/><path d="${cables}" stroke="${mix(C.forest, C.rock, .5)}" stroke-width=".9" fill="none"/>
      ${night > 0 ? tops.map(([x, y]) => `<circle cx="${x}" cy="${y - 2}" r="1.6" fill="${LAMP}" opacity="${f(night)}"/>`).join('') : ''}
      <path d="M${T[0][0] - 60} ${T[0][1] + 6}V${T[0][1] - 40}L${T[0][0] - 28} ${T[0][1] - 56}L${T[0][0] + 6} ${T[0][1] - 40}V${T[0][1] + 6}Z" fill="${mix('#6B4A3A', C.forest, .4 + .3 * dusk)}"/><path d="M${T[0][0] - 64} ${T[0][1] - 38}L${T[0][0] - 28} ${T[0][1] - 58}L${T[0][0] + 10} ${T[0][1] - 38}L${T[0][0] + 4} ${T[0][1] - 37}L${T[0][0] - 28} ${T[0][1] - 52}L${T[0][0] - 58} ${T[0][1] - 37}Z" fill="${mix(C.snow, '#FFFFFF', .2)}"/>
      <rect x="${T[0][0] - 46}" y="${T[0][1] - 26}" width="12" height="10" fill="${winC}" opacity="${f(.55 + .4 * winOn)}"/>
      <path d="M${T[4][0] - 70} ${T[4][1] - 90}V${T[4][1] - 40}" stroke="${mix(C.forest, C.rock, .4)}" stroke-width="1.2"/><path data-k="flag" fill="${BR}"/>`

    // ----- the chalet, foreground snow, pines -----
    const gy = x => 990 + 26 * Math.sin(x / 260 + 1) - 20 * ss(1000, 1960, x) * 0
    let ground = `M${-BX} ${H + BY}`
    for (let x = -BX; x <= W + BX; x += 20) ground += `L${x} ${f(gy(x))}`
    ground += `L${W + BX} ${H + BY}Z`
    const ch = { x: 150, b: 1000 }
    const wood = mix('#6B4A3A', C.forest, .35 + .3 * dusk), roofS = mix(C.snow, '#FFFFFF', .2)
    let logs = ''
    for (let y = ch.b - 6; y > ch.b - 80; y -= 7) logs += `M${ch.x + 2} ${y}H${ch.x + 196}`
    let fpines = '', fsnow = ''
    for (const [x, h] of [[30, 150], [78, 120], [392, 110], [440, 160], [1880, 180], [1830, 130], [1930, 120], [1040, 70], [1000, 90]]) { const [d, s] = pine(x, gy(x) + 8, h); fpines += d; fsnow += s }
    let steps = ''
    for (let k = 0; k < 9; k++) steps += `<ellipse cx="${f(260 + k * 22 + (k % 2) * 3)}" cy="${f(1012 + k * 6 + (k % 2) * 4)}" rx="3.4" ry="1.4"/>`
    const chalet = `<defs><linearGradient id="${id}gg" gradientUnits="userSpaceOnUse" x1="0" y1="960" x2="0" y2="${H}"><stop offset="0" stop-color="${C.snow}"/><stop offset="1" stop-color="${mix(C.snowS, C.snow, .3)}"/></linearGradient>
        <radialGradient id="${id}wg"><stop offset="0" stop-color="${LAMP}" stop-opacity=".55"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient></defs>
      <path d="${ground}" fill="url(#${id}gg)"/>
      <path d="M${-BX} ${f(gy(0) + 6)}Q500 ${f(gy(500) - 8)} 980 ${f(gy(980) + 10)}" stroke="${C.snowS}" stroke-width="18" fill="none" opacity=".25"/>
      <g fill="${C.snowS}" opacity=".6">${steps}</g>
      <path d="${R(ch.x, 198, 80, ch.b)}" fill="${wood}"/><path d="${logs}" stroke="${mix(wood, '#000000', .25)}" stroke-width="1" opacity=".55"/>
      <path d="M${ch.x - 22} ${ch.b - 74}L${ch.x + 99} ${ch.b - 140}L${ch.x + 220} ${ch.b - 74}Z" fill="${mix(wood, '#000000', .25)}"/>
      <path d="M${ch.x - 26} ${ch.b - 72}L${ch.x + 99} ${ch.b - 144}L${ch.x + 224} ${ch.b - 72}L${ch.x + 214} ${ch.b - 70}Q${ch.x + 150} ${ch.b - 98} ${ch.x + 99} ${ch.b - 126}Q${ch.x + 40} ${ch.b - 96} ${ch.x - 16} ${ch.b - 70}Z" fill="${roofS}"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${ch.x - 14 + i * 40} ${f(ch.b - 72 + (i > 2.5 ? (i - 2.5) : (2.5 - i)) * -0)}v${f(5 + hash(i) * 7)}" stroke="${mix(roofS, '#FFFFFF', .4)}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`).join('')}
      <path d="${R(ch.x + 150, 14, 30, ch.b - 108)}" fill="${mix(wood, '#2A2A3A', .35)}"/><path d="M${ch.x + 148} ${ch.b - 138}H${ch.x + 166}V${ch.b - 142}H${ch.x + 148}Z" fill="${roofS}"/>
      ${[[ch.x + 22, ch.b - 58], [ch.x + 150, ch.b - 58], [ch.x + 88, ch.b - 116]].map(([x, y], i) => `${winOn > 0 ? `<circle cx="${x + 13}" cy="${y + 11}" r="${i === 2 ? 26 : 38}" fill="url(#${id}wg)" opacity="${f(winOn)}"/>` : ''}<rect x="${x}" y="${y}" width="${i === 2 ? 22 : 28}" height="${i === 2 ? 18 : 24}" fill="${winC}" opacity="${f(.55 + .4 * winOn)}"/><path d="M${x + (i === 2 ? 11 : 14)} ${y}v${i === 2 ? 18 : 24}M${x} ${y + (i === 2 ? 9 : 12)}h${i === 2 ? 22 : 28}" stroke="${wood}" stroke-width="2"/>`).join('')}
      <path d="${R(ch.x + 92, 26, 42, ch.b)}" fill="${mix(wood, '#000000', .35)}"/>
      <path d="M${ch.x + 66} ${ch.b}L${ch.x + 72} ${ch.b - 58}M${ch.x + 74} ${ch.b}L${ch.x + 79} ${ch.b - 56}" stroke="${BR}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${ch.x + 210} ${ch.b}l8 -26l3 1l-6 25Z" fill="${mix(BR2, wood, .3)}"/>
      <path d="${fpines}" fill="${mix(C.forest, '#000000', .1)}"/><path d="${fsnow}" fill="${mix(C.snow, '#FFFFFF', .2)}" opacity=".95"/>`
    const chaletAc = `<rect data-k="fire" x="${ch.x + 22}" y="${ch.b - 58}" width="28" height="24" fill="#FF9A4A" opacity="0"/>`

    // ----- assemble -----
    const lay = (depth, inner) => `<div class="sc-alpine-l" data-depth="${depth}">${inner}</div>`
    const sv = body => `<svg viewBox="${VB}" preserveAspectRatio="none">${body}</svg>`
    root.innerHTML = `<div class="parallax">` + lay(.02, sv(sky) + sv(skyAc)) + lay(.07, sv(peaks)) + lay(.16, sv(ridgeS) + sv(ridgeAc))
      + lay(.28, sv(lift) + sv(chairs.replace(/^/, ''))) + lay(.45, sv(chalet) + sv(chaletAc) + `<canvas class="sc-alpine-cv" data-k="smoke"></canvas>`)
      + `</div><canvas class="sc-alpine-cv" data-k="snow"></canvas><div class="sc-alpine-grain"></div>`
    root.querySelector('.sc-alpine-grain').style.backgroundImage = `url(${grain()})`
    const q = k => root.querySelector(`[data-k="${k}"]`)
    const A = (el, k, v) => { if (el && el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v) } }
    const K = 1920 / LW
    const smC = q('smoke'); smC.width = 1920; smC.height = Math.round(420 * K); smC.style.cssText = `left:0;top:${560 + BY}px;width:${LW}px;height:420px`
    const SX = smC.getContext('2d')
    const snC = q('snow'); snC.width = 1920; snC.height = 1080; snC.style.cssText = 'left:0;top:0;width:1920px;height:1080px'
    const NX = snC.getContext('2d')
    const sprite = (col, soft) => { const s = document.createElement('canvas'); s.width = s.height = 48; const g = s.getContext('2d'), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, col); gr.addColorStop(soft, col + 'A0'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return s }
    const smokeS = sprite(mix(C.snowS, '#FFFFFF', .35), .45), flake = sprite('#FFFFFF', .35)
    const fr = rng(31), flakes = []
    for (let i = 0; i < 300; i++) { const near = i >= 220; flakes.push({ x: fr() * (W + 200) - 100, ph: fr() * 1200, v: near ? 46 + fr() * 30 : 18 + fr() * 14, r: near ? 2.2 + fr() * 1.8 : .9 + fr() * .9, sw: near ? 14 + fr() * 18 : 6 + fr() * 8, sf: .3 + fr() * .7, near }) }
    const els = { tw: twinkle.map((_, i) => q('tw' + i)), sat: q('sat'), trace: q('trace'), groom: q('groom'), skier: q('skier'), poles: q('poles'), cat: q('cat'), catb: q('catb'),
      chairs: Array.from({ length: N }, (_, i) => q('ch' + i)), flag: q('flag'), fire: q('fire') }
    // the lift loop: up the left line from the bottom tower to the top, back down the right line
    const x0 = tops[0][0], x1 = tops[tops.length - 1][0], span = x1 - x0
    const groomer = tod > .82
    const SKP = 34 // seconds per run (skier) or per climb (groomer)
    const skierAt = s => { const z = Math.sin(s * Math.PI * 2 * 4.5); return [SK.x0 + (SK.x1 - SK.x0) * s + 56 * z * (.4 + .6 * s), SK.y0 + (SK.y1 - SK.y0) * s, z] }

    const frame = (t, still) => {
      // a few stars twinkle; a satellite crosses the night sky every 50 s
      els.tw.forEach((e, i) => A(e, 'opacity', f(ss(.55, 1, tod) * (still ? .5 : .25 + .7 * Math.max(0, Math.sin(t * (1.1 + i * .37) + i * 2)) ** 4))))
      if (night > 0) { const u = mod(t + 20, 50) / 16; A(els.sat, 'opacity', u < 1 ? f(night * .8 * Math.sin(Math.PI * u)) : '0'); const sx = 1100 + 820 * u, sy = 40 + 140 * u; A(els.sat, 'd', `M${f(sx)} ${f(sy)}l.1 .02`) }
      // the skier zigzags down the far snowfield, leaving a trace that fades before the next run; at night a groomer climbs instead
      const s = mod(t + 4, SKP + 6) / SKP
      if (!groomer) {
        const run = Math.min(s, 1), [x, y, z] = skierAt(run), sc = .9 + .5 * run
        A(els.skier, 'transform', `translate(${f(x)} ${f(y)}) scale(${f(sc * (z > 0 ? 1 : -1))} ${f(sc)}) rotate(${f(-12 * Math.cos(run * Math.PI * 9))})`); A(els.skier, 'opacity', s > 1 ? '0' : '1')
        A(els.poles, 'd', `M-1 -4L-4 -1M2 -4L5 -1`)
        let d = ''; const n = Math.max(2, Math.round(run * 160))
        for (let k = 0; k <= n; k++) { const [px, py] = skierAt(run * k / n); d += (k ? 'L' : 'M') + f(px) + ' ' + f(py) }
        A(els.trace, 'd', d); A(els.trace, 'opacity', f(.7 * (s > 1 ? 1 - (s - 1) * (SKP / 6) : 1)))
      } else {
        const climb = Math.min(s, 1), [x, y] = skierAt(1 - climb * .9), [x2, y2] = skierAt(Math.max(0, 1 - climb * .9 - .02))
        A(els.cat, 'opacity', s > 1 ? '0' : '1'); A(els.cat, 'transform', `translate(${f(x)} ${f(y)}) rotate(${f(Math.atan2(y2 - y, x2 - x) * 180 / Math.PI * .3)}) scale(${x2 > x ? 1 : -1} 1)`)
        A(els.catb, 'opacity', mod(t, .8) < .4 ? '1' : '.2')
        A(els.groom, 'opacity', '.35'); let d = ''; for (let k = 0; k <= 40; k++) { const [px, py] = skierAt(1 - climb * .9 * k / 40); d += (k ? 'L' : 'M') + f(px) + ' ' + f(py) } A(els.groom, 'd', d)
        A(els.skier, 'opacity', '0')
      }
      // chairs: one loop every 96 s; each hangs plumb and sways after passing a tower; chair 5 rides up empty, swinging
      els.chairs.forEach((c, i) => {
        const u = mod(t / 96 + i / N, 1), up = u < .5, p = up ? u * 2 : (1 - u) * 2, x = x0 + span * p + (up ? -12 : 12), y = cableY(x0 + span * p, up ? -1 : 1) + 2
        const seg = (span * p) / (span / (tops.length - 1)), since = (seg % 1), sw = (i === 5 ? 9 : 2.4) * Math.sin(t * (i === 5 ? 1.7 : 2.2) + i) * (i === 5 ? 1 : Math.exp(-since * 3))
        A(c, 'transform', `translate(${f(x)} ${f(y)}) rotate(${f(sw)}) scale(${up ? 1 : -1} 1)`)
      })
      A(els.flag, 'd', `M${T[4][0] - 70} ${T[4][1] - 90}Q${f(T[4][0] - 82)} ${f(T[4][1] - 88 + Math.sin(t * 4) * 1.5)} ${f(T[4][0] - 94 + Math.sin(t * 3) * 1.4)} ${f(T[4][1] - 84 + Math.sin(t * 5))}L${T[4][0] - 70} ${T[4][1] - 78}Z`)
      // the fire flickers behind the chalet's ground-floor window once the lamps are on
      A(els.fire, 'opacity', tod > .3 ? f((still ? .3 : .18 + .2 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1))) * ss(.3, .6, tod)) : '0')
      // chimney smoke: rises, leans with the breeze, spreads and thins
      SX.setTransform(1, 0, 0, 1, 0, 0); SX.clearRect(0, 0, smC.width, smC.height); SX.setTransform(K, 0, 0, K, BX * K, -560 * K)
      for (let n = Math.floor((t - 8) / .35); n <= Math.floor(t / .35); n++) {
        const te = n * .35, a = t - te; if (a < 0 || a > 8) continue
        const x = ch.x + 157 + 9 * a + 2.4 * a * a + 6 * Math.sin(a * .9 + n), y = ch.b - 142 - 22 * a + 1.2 * a * a, r = 4 + 7 * Math.sqrt(a) + a * 1.4
        SX.globalAlpha = (1 - a / 8) ** 1.4 * Math.min(1, a / .3) * .5; SX.drawImage(smokeS, x - r, y - r, r * 2, r * 2)
      }
      SX.globalAlpha = 1
      // snowfall at two depths, swaying; thinner over the headline zone; a branch sheds its snow every 23 s
      NX.clearRect(0, 0, 1920, 1080)
      for (const fl of flakes) {
        const y = mod(fl.ph + fl.v * t, 1140) - 30, x = mod(fl.x + Math.sin(t * fl.sf + fl.ph) * fl.sw - t * (fl.near ? 9 : 4), W + 200) - 100
        let a = fl.near ? .8 : .55
        if (x < 1300 && y < 360) a *= .4
        NX.globalAlpha = a; NX.drawImage(flake, x - fl.r * 1.6, y - fl.r * 1.6, fl.r * 3.2, fl.r * 3.2)
      }
      const bu = mod(t + 3, 23)
      if (bu < 2.2) for (let k = 0; k < 14; k++) { const a = bu - k * .03; if (a < 0) continue; const x = 1830 + 30 * hash(k) + 10 * a, y = 905 + 8 * hash(k + 3) + 60 * a * a, r = 2 + 3 * hash(k + 7) + a * 3; NX.globalAlpha = (1 - bu / 2.2) * .8; NX.drawImage(flake, x - r, y - r, r * 2, r * 2) }
      NX.globalAlpha = 1
    }
    root._sc.frame = frame
    frame(PRINT_T, true)
  }

  document.querySelectorAll('.sc-alpine').forEach(build)
  ;(window.Pack = window.Pack || {}).alpine = { build, PRINT_T }
})()
