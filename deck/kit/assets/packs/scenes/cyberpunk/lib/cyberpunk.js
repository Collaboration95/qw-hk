/* Pack scene "cyberpunk" (assets/packs/scenes/cyberpunk): a rain-soaked neon city seen from an elevated street.
   Markup: <div class="sc-cyberpunk" data-tod="…" aria-hidden="true"></div> as a slide's first child; this file draws it.
   data-tod 0 = dusk (magenta smog, signs still waking) · .5 = night · 1 = 3 am (teal smog, heaviest rain).
   Planes (back → front, .parallax children): sky · far megatowers + far sky lane · mid towers, holo billboard, monorail ·
   near sky lane · street (buildings at the edges, signs, stall, vending machine, puddles) · rain (two depths).
   One clock (Deck.clock); every actor is a pure function of t. Print / reduced motion: a composed still at PRINT_T. */
(() => {
  'use strict'
  const W = 1920, H = 1080, BX = 40, BY = 30, LW = W + 2 * BX, LH = H + 2 * BY, VB = `${-BX} ${-BY} ${LW} ${LH}`
  const PRINT_T = 2.2
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

  const PAL = {
    top: ['#4A1B72', '#2C1A69', '#1F2468'],
    mid: ['#A2318C', '#5C2A86', '#2C3C82'],
    low: ['#FF8A5E', '#C9418F', '#2F8296'],
    far: ['#B4589E', '#743F92', '#3E5E96'],
    midT: ['#5E2A7C', '#472571', '#2A3A72'],
    near: ['#311753', '#28154C', '#1B2650'],
    street: ['#2C1849', '#241544', '#172748'],
  }
  const PINK = '#FF4FA3', TEAL = '#3FF2E0', AMBER = '#FFB347', RED = '#FF3B5C', VIOLET = '#B57BFF'

  // ---------- a tiny single-stroke neon font (6 × 10 cell) ----------
  const GL = {
    H: 'M0 0V10M6 0V10M0 5H6', O: 'M1.6 0H4.4Q6 0 6 1.6V8.4Q6 10 4.4 10H1.6Q0 10 0 8.4V1.6Q0 0 1.6 0Z', T: 'M0 0H6M3 0V10',
    E: 'M6 0H0V10H6M0 5H4.4', L: 'M0 0V10H6', R: 'M0 10V0H4.4Q6 0 6 2.5Q6 5 4.4 5H0M3.4 5L6 10', A: 'M0 10L3 0L6 10M1.1 6.6H4.9',
    M: 'M0 10V0L3 6L6 0V10', N: 'M0 10V0L6 10V0', P: 'M0 10V0H4.4Q6 0 6 2.5Q6 5 4.4 5H0', '2': 'M0 2.4Q0 0 3 0Q6 0 6 2.6Q6 4.6 0 10H6',
    '4': 'M4.6 10V0L0 7H6', B: 'M0 5V0H4Q5.6 0 5.6 2.5Q5.6 5 4 5H0V10H4.4Q6 10 6 7.5Q6 5 4 5', S: 'M6 1.2Q5 0 3 0Q0 0 0 2.5Q0 5 3 5Q6 5 6 7.5Q6 10 3 10Q1 10 0 8.8',
    I: 'M3 0V10M1.4 0H4.6M1.4 10H4.6', U: 'M0 0V7.6Q0 10 3 10Q6 10 6 7.6V0', K: 'M0 0V10M6 0L0 6.2M2 4.6L6 10', C: 'M6 1.4Q5 0 3 0Q0 0 0 5Q0 10 3 10Q5 10 6 8.6',
  }
  const xf = (d, x0, y0, s) => { // transform absolute path data (M L H V Q Z) by translate + uniform scale
    const tk = d.match(/[MLHVQZ]|-?\d*\.?\d+/g); let out = '', cmd = '', k = 0
    for (const v of tk) {
      if (/[A-Z]/.test(v)) { cmd = v; k = 0; out += v; continue }
      const n = +v, isX = cmd === 'H' || (cmd !== 'V' && k % 2 === 0)
      out += (k ? ' ' : '') + f(isX ? x0 + n * s : y0 + n * s); k++
    }
    return out
  }

  let grainURL = ''
  const grain = () => {
    if (grainURL) return grainURL
    try {
      const c = document.createElement('canvas'); c.width = c.height = 256
      const x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(9)
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
      x.putImageData(d, 0, 0); grainURL = c.toDataURL()
    } catch { grainURL = 'none' }
    return grainURL
  }

  // ---------- towers ----------
  function towers(seed, b, env, wmin, wmax, kinds) {
    const r = rng(seed), out = []
    for (let x = -BX - 30; x < W + BX;) {
      const w = wmin + r() * (wmax - wmin), cx = x + w / 2, h = env(cx) * (.6 + r() * .55), k = kinds[Math.floor(r() * kinds.length)]
      out.push({ x, w, h, k, cx })
      x += w * (.72 + r() * .3)
    }
    return out
  }
  const towerPath = ({ x, w, h, k }, b) => {
    switch (k) {
      case 'set': return R(x, w, h * .7, b) + R(x + w * .12, w * .76, h * .88, b) + R(x + w * .32, w * .36, h, b)
      case 'spire': return R(x, w, h * .86, b) + `M${f(x + w * .3)} ${f(b - h * .86)}L${f(x + w / 2)} ${f(b - h * 1.06)}L${f(x + w * .7)} ${f(b - h * .86)}Z` + R(x + w / 2 - .8, 1.6, h * .12, b - h * 1.04)
      case 'cut': return `M${f(x)} ${f(b)}V${f(b - h * .82)}L${f(x + w * .5)} ${f(b - h)}H${f(x + w)}V${f(b)}Z`
      case 'ant': return R(x, w, h, b) + R(x + w * .25, 1.4, 26, b - h) + R(x + w * .7, 1.4, 14, b - h)
      default: return R(x, w, h, b)
    }
  }

  let count = 0
  function build(root) {
    if (!root._sc) {
      root._sc = { id: `sccp${count++}` }
      if (window.Deck) Deck.clock(root, (t, el, still) => root._sc.frame?.(t, still), { printT: PRINT_T })
      try { new MutationObserver(() => build(root)).observe(root, { attributes: true, attributeFilter: ['data-tod'] }) } catch { /* ok */ }
    }
    const id = root._sc.id, tod = clamp(parseFloat(root.dataset.tod ?? '.5') || 0)
    if (root._sc.tod === tod) return
    root._sc.tod = tod
    const C = {}; for (const k in PAL) C[k] = ramp(PAL[k], tod)
    const slide = root.closest('section.slide'), scs = slide ? getComputedStyle(slide) : null
    const BR = cssHex(scs?.getPropertyValue('--brand')) || '#FF7A45', BR2 = cssHex(scs?.getPropertyValue('--brand-2')) || TEAL
    const field = mix(C.top, C.mid, .4)
    if (slide) { slide.style.setProperty('--field', field); if (window.Deck?.inkOn) slide.style.setProperty('--ink-auto', Deck.inkOn(field)) }
    const neon = .72 + .28 * ss(0, .4, tod), rain = .45 + .55 * tod, lit = .25 + .55 * ss(0, .7, tod)
    root.style.background = `linear-gradient(180deg,${C.top},${C.mid} 40%,${C.low} 70%,${C.street})`

    // ----- sky: gradient, smog glow from below, lit cloud deck -----
    const r0 = rng(4)
    let smog = ''
    for (let i = 0; i < 9; i++) smog += `<ellipse cx="${f(r0() * W)}" cy="${f(560 + r0() * 160)}" rx="${f(260 + r0() * 380)}" ry="${f(50 + r0() * 70)}" fill="${[PINK, TEAL, VIOLET][i % 3]}" opacity="${f((.07 + r0() * .07) * neon)}"/>`
    let cloud = ''
    for (let i = 0; i < 14; i++) cloud += `<ellipse cx="${f(r0() * W)}" cy="${f(250 + r0() * 200)}" rx="${f(200 + r0() * 300)}" ry="${f(14 + r0() * 22)}"/>`
    const sky = `<defs><linearGradient id="${id}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="820"><stop offset="0" stop-color="${C.top}"/><stop offset=".45" stop-color="${C.mid}"/><stop offset=".85" stop-color="${C.low}"/></linearGradient>
      <filter id="${id}sb" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>
      <filter id="${id}cl" x="-10%" y="-100%" width="120%" height="300%"><feTurbulence type="fractalNoise" baseFrequency=".004 .03" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="40" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="9"/></filter></defs>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${LH}" fill="url(#${id}sky)"/>
      <g fill="${mix(C.mid, C.low, .5)}" opacity="${f(.35 + .15 * tod)}" filter="url(#${id}cl)">${cloud}</g>
      <g filter="url(#${id}sb)">${smog}</g>`

    // ----- far megatowers: hazy, tall on the right, thin light strips, aircraft lights -----
    const fb = 790
    const ft = towers(12, fb, x => 170 + 360 * ss(700, 1500, x) + 90 * Math.exp(-(((x - 520) / 160) ** 2)), 40, 110, ['flat', 'set', 'spire', 'cut', 'ant'])
    let fd = '', strips = '', beacons = []
    ft.forEach((tw, i) => {
      fd += towerPath(tw, fb)
      if (tw.h > 300 && i % 2) strips += R(tw.x + tw.w * .5 - .8, 1.6, tw.h * .7, fb - 30)
      for (let y = fb - tw.h + 14; y < fb - 120; y += 14) if (hash(i * 40 + y) < .5) strips += R(tw.x + 5, Math.max(4, tw.w - 10) * hash(y + i), 1.4, y)
      if (tw.h > 330 && beacons.length < 6) beacons.push([tw.x + tw.w / 2, fb - tw.h - (tw.k === 'ant' ? 26 : tw.k === 'spire' ? tw.h * .16 : 2)])
    })
    // an arcology: a stepped megastructure with a ring, far right
    fd += `M1660 ${fb}L1700 380L1760 300H1850L1890 380L1930 ${fb}Z` + R(1772, 66, 120, 300)
    const far = `<defs><linearGradient id="${id}fg" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="${fb}"><stop offset="0" stop-color="${C.far}"/><stop offset="1" stop-color="${mix(C.far, C.low, .55)}"/></linearGradient>
      <linearGradient id="${id}fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.low}" stop-opacity="0"/><stop offset="1" stop-color="${C.low}" stop-opacity=".7"/></linearGradient></defs>
      <path d="${fd}" fill="url(#${id}fg)"/>
      <ellipse cx="1805" cy="300" rx="86" ry="14" fill="none" stroke="${mix(TEAL, C.far, .45)}" stroke-width="2" opacity="${f(.5 * neon)}"/>
      <path d="${strips}" fill="${mix(TEAL, C.far, .45)}" opacity="${f(.45 * neon)}"/>
      <rect x="${-BX}" y="560" width="${LW}" height="${fb - 560 + 2}" fill="url(#${id}fh)"/>`
    const farAc = beacons.map((b, i) => `<circle data-k="bc${i}" cx="${f(b[0])}" cy="${f(b[1])}" r="2" fill="${RED}"/><circle data-k="bg${i}" cx="${f(b[0])}" cy="${f(b[1])}" r="9" fill="url(#${id}rg)"/>`).join('')
      + `<defs><radialGradient id="${id}rg"><stop offset="0" stop-color="${RED}" stop-opacity=".7"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient>
         <linearGradient id="${id}trR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="1" stop-color="${RED}" stop-opacity=".8"/></linearGradient>
         <linearGradient id="${id}trW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DFFBFF" stop-opacity="0"/><stop offset="1" stop-color="#DFFBFF" stop-opacity=".8"/></linearGradient></defs>`
      + Array.from({ length: 9 }, (_, i) => `<g data-k="fc${i}"><path d="M-26 0H0" stroke="url(#${id}${i % 2 ? 'trW' : 'trR'})" stroke-width="1.2"/><circle r="1.4" fill="${i % 2 ? '#E6FDFF' : RED}"/></g>`).join('')

    // ----- mid towers: windows, ad panels, the monorail beam -----
    const mb = 900
    const mt = towers(33, mb, x => 260 + 160 * ss(800, 1500, x) - 120 * Math.exp(-(((x - 300) / 300) ** 2)), 56, 120, ['flat', 'set', 'cut', 'flat', 'ant'])
    let md = '', wins = ['', '', '', ''], ads = ''
    const r1 = rng(71)
    let edges = ''
    mt.forEach((tw, i) => {
      md += towerPath(tw, mb)
      const top = mb - tw.h * (tw.k === 'set' ? .7 : tw.k === 'cut' ? .82 : 1) + 10, hue = Math.floor(r1() * 4), banded = r1() < .3
      // one window hue per tower; some towers lit in floor bands instead of single windows
      if (banded) { for (let y = top + 6; y < mb - 70; y += 22) if (r1() < lit) wins[hue] += R(tw.x + 6, tw.w - 12, 2.2, y) }
      else for (let y = top; y < mb - 60; y += 10) for (let x = tw.x + 6; x < tw.x + tw.w - 6; x += 8) if (r1() < lit * .32) wins[r1() < .85 ? hue : 3] += `M${f(x)} ${f(y)}h2.6v3.6h-2.6Z`
      if (r1() < .35) edges += R(tw.x + (r1() < .5 ? 0 : tw.w - 1.4), 1.4, tw.h * (tw.k === 'set' ? .7 : .95) - 8, mb - 40)
      if (i % 4 === 1 && tw.w > 80 && tw.cx > 500 && tw.cx < 1500) ads += `<rect x="${f(tw.x + 10)}" y="${f(top + 20)}" width="${f(tw.w - 20)}" height="${f(Math.min(90, tw.h * .3))}" rx="2" fill="${[PINK, TEAL, VIOLET, AMBER][i % 4]}" opacity="${f(.22 * neon)}"/>`
    })
    const midS = `<defs><linearGradient id="${id}mg" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="${mb}"><stop offset="0" stop-color="${C.midT}"/><stop offset="1" stop-color="${mix(C.midT, C.low, .4)}"/></linearGradient>
      <linearGradient id="${id}mh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.low}" stop-opacity="0"/><stop offset="1" stop-color="${C.low}" stop-opacity=".75"/></linearGradient></defs>
      <path d="${md}" fill="url(#${id}mg)"/>${ads}<path d="${edges}" fill="${PINK}" opacity="${f(.5 * neon)}"/>
      <path d="${wins[0]}" fill="${TEAL}" opacity=".75"/><path d="${wins[1]}" fill="${PINK}" opacity=".7"/><path d="${wins[2]}" fill="${AMBER}" opacity=".7"/><path d="${wins[3]}" fill="#E9E4FF" opacity=".55"/>
      <rect x="${-BX}" y="760" width="${LW}" height="${mb - 760 + 40}" fill="url(#${id}mh)"/>
      ${[160, 560, 960, 1360, 1760].map(x => R(x - 7, 14, 200, 940)).join('').replace(/^/, `<path fill="${mix(C.near, C.midT, .4)}" d="`).replace(/$/, '"/>')}
      <rect x="${-BX}" y="736" width="${LW}" height="10" fill="${mix(C.near, C.midT, .3)}"/><rect x="${-BX}" y="736" width="${LW}" height="1.2" fill="${TEAL}" opacity="${f(.5 * neon)}"/>`
    // holo billboard (glitches every ~20 s), the monorail, near-lane cars
    const hb = { x: 1590, y: 420, w: 176, h: 196 }
    const koi = `<path d="M-22 0Q-10 -11 8 -6Q18 -3 22 0Q18 3 8 6Q-10 11 -22 0Z" fill="${BR}"/><path d="M-20 0L-34 -9Q-30 0 -34 9Z" fill="${mix(BR, '#FFFFFF', .25)}"/><path d="M-2 -7L4 -14L8 -6ZM-2 7L4 14L8 6Z" fill="${mix(BR, '#FFFFFF', .35)}"/><circle cx="15" cy="-2" r="1.4" fill="#fff"/><path d="M-6 -4Q0 -1 -6 3" stroke="${mix(BR, '#000000', .25)}" stroke-width="1.2" fill="none"/>`
    let scan = ''
    for (let y = 0; y < hb.h; y += 4) scan += `M0 ${y}h${hb.w}`
    const holoInner = k => `<g data-k="${k}"><rect width="${hb.w}" height="${hb.h}" fill="url(#${id}hg)"/><circle cx="${hb.w / 2}" cy="${hb.h * .44}" r="54" fill="none" stroke="${BR2}" stroke-width="1.4" opacity=".55"/><g data-k="${k}koi" transform="translate(${hb.w / 2} ${hb.h * .44})">${koi}</g>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${24 + i * 26}" y="${hb.h - 34}" width="18" height="6" rx="2" fill="${i % 2 ? BR2 : BR}" opacity=".7"/>`).join('')}<path d="${scan}" stroke="#000" stroke-width="1.6" opacity=".18"/></g>`
    const midAc = `<defs><linearGradient id="${id}hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(BR2, C.midT, .4)}" stop-opacity=".75"/><stop offset="1" stop-color="${mix(BR, C.midT, .5)}" stop-opacity=".55"/></linearGradient>
        <filter id="${id}fr"><feColorMatrix values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter><filter id="${id}fc"><feColorMatrix values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>
        <filter id="${id}hglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <rect x="${hb.x - 10}" y="${hb.y - 10}" width="${hb.w + 20}" height="${hb.h + 20}" fill="${BR2}" opacity="${f(.22 * neon)}" filter="url(#${id}hglow)"/>
      <g data-k="holo" transform="translate(${hb.x} ${hb.y})" opacity="${f(.85 * neon + .1)}">
        <g data-k="hR" opacity="0" filter="url(#${id}fr)" style="mix-blend-mode:screen">${holoInner('hr')}</g>
        <g data-k="hC" opacity="0" filter="url(#${id}fc)" style="mix-blend-mode:screen">${holoInner('hc')}</g>
        ${holoInner('hm')}<rect data-k="hbar" y="0" width="${hb.w}" height="10" fill="#FFFFFF" opacity="0"/>
        <rect width="${hb.w}" height="${hb.h}" fill="none" stroke="${mix(BR2, '#FFFFFF', .4)}" stroke-width="1.2" opacity=".7"/></g>
      <g data-k="mono"><path d="M-300 -4V-26Q-300 -32 -294 -32H-14Q0 -32 8 -18L12 -4Z" fill="${mix('#DCE3FF', C.midT, .55)}"/>
        <rect x="-292" y="-25" width="290" height="7" rx="2" fill="${mix(TEAL, '#FFFFFF', .4)}" opacity="${f(.6 + .35 * neon)}"/>
        ${[-200, -100].map(x => `<rect x="${x}" y="-31" width="2" height="27" fill="${mix(C.near, C.midT, .3)}"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => hash(i + 5) < .6 ? `<circle cx="${-280 + i * 31}" cy="-22.5" r="2.3" fill="${mix(C.near, C.midT, .2)}"/>` : '').join('')}
        <path d="M2 -16L60 -12V-20Z" fill="${mix('#DFFBFF', C.midT, .3)}" opacity=".35"/><circle cx="6" cy="-15" r="1.6" fill="#E9FFFF"/></g>`

    // ----- near sky lane -----
    const nearCars = Array.from({ length: 4 }, (_, i) => {
      const dir = i % 2 ? -1 : 1, body = mix(C.near, C.midT, .5)
      return `<g data-k="nc${i}"><path d="M-44 0H-8" stroke="url(#${id}${dir > 0 ? 'ntR' : 'ntW'})" stroke-width="2.2"/>
        <path d="M-12 -2Q-11 -7 -4 -7H6Q11 -7 13 -2L14 2H-12Z" fill="${body}"/><rect x="-11" y="-.4" width="25" height="2.6" rx="1.2" fill="${mix(body, '#000000', .25)}"/>
        <path d="M-3 -6.4H5L8 -2.6H-4Z" fill="${mix(TEAL, body, .45)}" opacity=".8"/><circle cx="13.4" cy="-.6" r="1.4" fill="#F0FDFF"/><circle cx="-11.6" cy="-.6" r="1.3" fill="${RED}"/>
        <path d="M14 -.6L70 -6V5Z" fill="#E9FDFF" opacity=".12"/><ellipse cx="1" cy="6" rx="10" ry="1.6" fill="${TEAL}" opacity=".35"/>
        ${i === 3 ? `<circle data-k="sirenR" cx="-1" cy="-8" r="1.5" fill="${RED}"/><circle data-k="sirenB" cx="3" cy="-8" r="1.5" fill="#4F8BFF"/>` : ''}</g>`
    }).join('')
    const laneAc = `<defs><linearGradient id="${id}ntR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="1" stop-color="${RED}" stop-opacity=".85"/></linearGradient>
      <linearGradient id="${id}ntW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="1" stop-color="${RED}" stop-opacity=".8"/></linearGradient></defs>${nearCars}
      <g data-k="drone"><path d="M-7 -1H7M-5 -1V-3M5 -1V-3" stroke="${mix(C.near, C.midT, .4)}" stroke-width="1.2" stroke-linecap="round"/><path d="M-9 -3.4H-1M1 -3.4H9" stroke="${mix(C.near, '#FFFFFF', .3)}" stroke-width=".7" opacity=".6"/>
        <rect x="-3" y="0" width="6" height="5" rx="1" fill="${mix(AMBER, C.near, .45)}"/><path d="M0 -1V0" stroke="${C.near}"/><circle data-k="dl" cx="0" cy="-2" r="1.1" fill="${RED}"/></g>`

    // ----- the street: edge buildings, neon signs, vending machine, noodle stall, wet pavement -----
    const sb = 930
    let nd = ''
    nd += `M${-BX} ${sb}V600H90V570H180V600H300V${sb}Z` + R(30, 60, 30, 570) + R(120, 3, 40, 570) + R(250, 30, 14, 600)
    nd += `M1540 ${sb}V640H1600V600H1760V560H1960V${sb}Z` + R(1640, 40, 16, 600) + R(1840, 3, 46, 560)
    let fire = '' // fire escapes and AC units
    for (let y = 640; y < 900; y += 52) fire += `M40 ${y}H150M40 ${y}V${y + 4}M150 ${y}V${y + 4}M60 ${y}L120 ${y + 52}` + R(212, 22, 12, y + 30)
    for (let y = 700; y < 900; y += 60) fire += R(1572, 20, 11, y) + R(1790, 24, 12, y + 20)
    let nwin = ''
    const r2 = rng(19)
    for (let y = 620; y < 900; y += 26) for (let x = 20; x < 290; x += 34) if (r2() < .4 + .3 * tod) nwin += `<rect x="${x}" y="${y}" width="16" height="12" fill="${r2() < .5 ? mix(AMBER, C.near, .35) : mix(PINK, C.near, .45)}" opacity="${f(.5 + r2() * .4)}"/>`
    for (let y = 660; y < 900; y += 26) for (let x = 1620; x < 1900; x += 34) if (r2() < .35 + .3 * tod) nwin += `<rect x="${x}" y="${y}" width="16" height="12" fill="${r2() < .5 ? mix(TEAL, C.near, .4) : mix(AMBER, C.near, .4)}" opacity="${f(.45 + r2() * .4)}"/>`
    // signs: HOTEL (vertical, pink: the T buzzes out of step), RAMEN (teal, over the stall), 24H (amber, blinking slow)
    const sign = (txt, x, y, s, vert, gap) => [...txt].map((ch, i) => xf(GL[ch], vert ? x : x + i * (6 + gap) * s, vert ? y + i * (10 + gap) * s : y, s))
    const hotel = sign('HOTEL', 316, 640, 4.2, true, 2.6), ramen = sign('RAMEN', 1604, 836, 3.6, false, 2.6), h24 = sign('24H', 1548, 662, 2.4, false, 2), bar = sign('BAR', 186, 868, 2.2, false, 2)
    const neonD = (paths, col, k = '') => `<g${k ? ` data-k="${k}"` : ''}><path d="${paths.join('')}" stroke="${col}" stroke-width="7" ${LIMB} opacity=".55" filter="url(#${id}ng)"/><path d="${paths.join('')}" stroke="${col}" stroke-width="2.6" ${LIMB}/><path d="${paths.join('')}" stroke="${mix(col, '#FFFFFF', .7)}" stroke-width="1" ${LIMB}/></g>`
    const signs = `<rect x="304" y="628" width="50" height="${5 * 10 * 4.2 + 4 * 2.6 * 4.2 + 24}" rx="4" fill="${mix(C.near, '#000000', .25)}"/><path d="M300 650H304M300 820H304" stroke="${C.near}" stroke-width="3"/>
      <g opacity="${f(neon)}">${neonD([hotel[0], hotel[1], hotel[3], hotel[4]], PINK)}</g>
      <rect x="1592" y="824" width="${5 * 6 * 3.6 + 4 * 2.6 * 3.6 + 24}" height="60" rx="4" fill="${mix(C.near, '#000000', .25)}"/>
      <g opacity="${f(neon)}">${neonD(ramen, TEAL)}${neonD(bar, VIOLET)}</g>`
    // vending machine with a cat on top
    const vm = `<rect x="390" y="${sb - 70}" width="40" height="70" rx="3" fill="${mix(C.near, '#000000', .2)}"/><rect x="394" y="${sb - 66}" width="32" height="38" rx="2" fill="${mix(TEAL, '#FFFFFF', .55)}" opacity="${f(.55 + .4 * neon)}"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${397 + c * 7.4}" y="${sb - 62 + r * 11}" width="4.4" height="7" rx="1" fill="${[PINK, AMBER, TEAL, RED][(r + c) % 4]}" opacity=".85"/>`).join('')).join('')}
      <rect x="398" y="${sb - 22}" width="24" height="6" rx="1" fill="#000" opacity=".4"/>
      <path d="M402 ${sb - 70}Q399 ${sb - 80} 403 ${sb - 84}L404 ${sb - 89}L407 ${sb - 85}H410L412 ${sb - 89}L413 ${sb - 84}Q416 ${sb - 79} 413 ${sb - 70}Z" fill="${mix(C.near, '#000000', .3)}"/>`
    const near = `<defs><filter id="${id}ng" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
        <linearGradient id="${id}ng2" gradientUnits="userSpaceOnUse" x1="0" y1="540" x2="0" y2="${sb}"><stop offset="0" stop-color="${C.near}"/><stop offset="1" stop-color="${mix(C.near, C.low, .18)}"/></linearGradient>
        <linearGradient id="${id}st" gradientUnits="userSpaceOnUse" x1="0" y1="${sb}" x2="0" y2="${H}"><stop offset="0" stop-color="${mix(C.street, C.low, .35)}"/><stop offset=".3" stop-color="${C.street}"/><stop offset="1" stop-color="${mix(C.street, C.top, .4)}"/></linearGradient>
        <filter id="${id}rf" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".02 .16" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2 3"/></filter>
        <radialGradient id="${id}pg"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <mask id="${id}pm" maskUnits="userSpaceOnUse" x="${-BX}" y="${sb}" width="${LW}" height="200"><rect x="${-BX}" y="${sb}" width="${LW}" height="200" fill="#fff" opacity=".28"/>
          ${[[300, 1000, 230, 26], [760, 1050, 300, 22], [1240, 990, 260, 18], [1660, 1040, 280, 30], [80, 1068, 200, 14]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}pg)"/>`).join('')}</mask></defs>
      <rect x="${-BX}" y="${sb}" width="${LW}" height="${H + BY - sb}" fill="url(#${id}st)"/>
      <g mask="url(#${id}pm)"><g filter="url(#${id}rf)" transform="matrix(1 0 0 -1 0 ${2 * sb})">
        <rect x="${-BX}" y="680" width="${LW}" height="${sb - 680}" fill="${C.low}" opacity=".5"/>
        <g opacity="${f(neon)}">${neonD([hotel[3], hotel[4]], PINK)}${neonD(ramen, TEAL)}${neonD(bar, VIOLET)}</g>
        <rect x="394" y="${sb - 66}" width="32" height="38" fill="${TEAL}" opacity=".6"/></g></g>
      <path d="M300 ${sb}H1540" stroke="${mix(C.near, C.midT, .4)}" stroke-width="3"/><path d="M300 ${sb - 18}H1540${Array.from({ length: 63 }, (_, i) => `M${304 + i * 20} ${sb - 18}V${sb}`).join('')}" stroke="${mix(C.near, C.midT, .3)}" stroke-width="1.4"/>
      <path d="M300 ${sb - 18}H1540" stroke="${TEAL}" stroke-width=".8" opacity="${f(.35 * neon)}"/>
      <path d="${nd}" fill="url(#${id}ng2)"/>${nwin}<path d="${fire}" stroke="${mix(C.near, '#000000', .3)}" stroke-width="2" fill="${mix(C.near, '#000000', .2)}"/>
      ${signs}${vm}
      <path d="M300 700Q620 760 940 720M1540 680Q1200 740 940 720M300 740Q700 800 1100 760" stroke="${mix(C.near, '#000000', .2)}" stroke-width="1.2" fill="none"/>
      <rect x="${-BX}" y="${sb}" width="${LW}" height="1.4" fill="${mix(C.low, '#FFFFFF', .2)}" opacity=".35"/>
      <defs><linearGradient id="${id}cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${AMBER}" stop-opacity=".32"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></linearGradient>
        <radialGradient id="${id}pool"><stop offset="0" stop-color="${AMBER}" stop-opacity=".35"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient></defs>
      <path d="M1180 ${H + BY}V790Q1180 778 1168 778H1150" stroke="${mix(C.near, '#000000', .2)}" stroke-width="5" fill="none"/>
      <path d="M1138 776H1160L1156 784H1142Z" fill="${mix(C.near, '#000000', .25)}"/><path d="M1142 784L1040 ${H + BY}H1260L1156 784Z" fill="url(#${id}cone)"/>
      <ellipse cx="1150" cy="1060" rx="120" ry="16" fill="url(#${id}pool)"/><rect x="1143" y="783" width="12" height="2.4" rx="1" fill="#FFF1CF"/>`
    // the flickering T, the blinking 24H, the noodle stall, pedestrians, cable drips
    const stall = { x: 1610, y: 1012 }
    const nearAc = `<g data-k="T" opacity="${f(neon)}">${neonD([hotel[2]], PINK)}</g>
      <rect x="1540" y="650" width="64" height="48" rx="3" fill="${mix(C.near, '#000000', .25)}"/><g data-k="h24" opacity="${f(neon)}">${neonD(h24, AMBER)}</g>
      <g transform="translate(${stall.x} ${stall.y})"><path d="M0 0V-62M150 0V-62" stroke="${mix(C.near, '#000000', .2)}" stroke-width="3"/>
        <path d="M-10 -62H160L150 -76H0Z" fill="${mix(RED, C.near, .35)}"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-10 + i * 34} -62L${i * 30} -76H${15 + i * 30}L${7 + i * 34} -62Z" fill="#FFFFFF" opacity=".16"/>`).join('')}
        <rect x="4" y="-30" width="142" height="30" fill="${mix(C.near, '#3A1A10', .4)}"/><rect x="4" y="-30" width="142" height="3" fill="${AMBER}" opacity=".45"/>
        <rect x="18" y="-40" width="22" height="10" rx="2" fill="${mix(C.near, '#FFFFFF', .2)}"/>
        <path data-k="cook" fill="${mix(C.near, '#000000', .3)}"/><path data-k="ladle" stroke="${mix(C.near, '#000000', .3)}" stroke-width="1.6" ${LIMB}/>
        <path data-k="eater" fill="${mix(C.near, '#000000', .35)}"/>
        <path d="M118 0V-14M112 -14H124" stroke="${mix(C.near, '#000000', .3)}" stroke-width="2"/></g>
      <g data-k="lantern"><path d="M0 -14V0" stroke="${C.near}" stroke-width="1"/><ellipse cx="0" cy="8" rx="7" ry="9" fill="${mix(RED, AMBER, .3)}"/><ellipse cx="0" cy="8" rx="16" ry="18" fill="url(#${id}lg)"/><path d="M-4 -1H4M-4 17H4" stroke="${C.near}" stroke-width="1.6"/></g>
      <defs><radialGradient id="${id}lg"><stop offset="0" stop-color="${AMBER}" stop-opacity=".55"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient></defs>
      <path data-k="tail" stroke="${mix(C.near, '#000000', .3)}" stroke-width="2" ${LIMB}/>
      ${[0, 1].map(i => `<g data-k="ped${i}"><path data-p="legs" stroke="${mix(C.near, '#000000', .35)}" stroke-width="3" ${LIMB}/><path d="M-1 -30L0 -14" stroke="${mix(C.near, '#000000', .35)}" stroke-width="6" ${LIMB}/><circle cx="0" cy="-34" r="3.6" fill="${mix(C.near, '#000000', .35)}"/>
        <path d="M0 -30V-46" stroke="${mix(C.near, '#000000', .2)}" stroke-width="1.2"/>
        <path d="M-17 -44Q0 -60 17 -44Z" fill="${i ? mix(C.near, '#000000', .15) : mix(TEAL, '#FFFFFF', .5)}" opacity="${i ? 1 : .28}"/>${i ? '' : `<path d="M-17 -44Q0 -60 17 -44" stroke="${TEAL}" stroke-width="1.6" fill="none"/>`}</g>`).join('')}
      <circle data-k="drip" r="1.4" fill="${mix(TEAL, '#FFFFFF', .5)}" opacity="0"/>`

    // ----- assemble -----
    const lay = (depth, inner) => `<div class="sc-cyberpunk-l" data-depth="${depth}">${inner}</div>`
    const sv = body => `<svg viewBox="${VB}" preserveAspectRatio="none">${body}</svg>`
    root.innerHTML = `<div class="parallax">` + lay(.02, sv(sky)) + lay(.08, sv(far) + sv(farAc)) + lay(.18, sv(midS) + sv(midAc))
      + lay(.26, sv(laneAc)) + lay(.42, sv(near) + `<canvas class="sc-cyberpunk-cv" data-k="steam"></canvas>` + sv(nearAc))
      + `</div><canvas class="sc-cyberpunk-cv" data-k="rain"></canvas><div class="sc-cyberpunk-grain"></div>`
    root.querySelector('.sc-cyberpunk-grain').style.backgroundImage = `url(${grain()})`
    const q = k => root.querySelector(`[data-k="${k}"]`)
    const A = (el, k, v) => { if (el && el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v) } }
    const K = 1920 / LW
    const steamC = q('steam'); steamC.width = 1920; steamC.height = Math.round(420 * K)
    steamC.style.cssText = `left:0;top:${660 + BY}px;width:${LW}px;height:420px`
    const SX = steamC.getContext('2d')
    const rainC = q('rain'); rainC.width = 1920; rainC.height = 1080; rainC.style.cssText = 'left:0;top:0;width:1920px;height:1080px'
    const RX = rainC.getContext('2d')
    const sprite = col => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, col); gr.addColorStop(.5, col + 'A0'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s }
    const steamP = sprite(mix(PINK, '#FFFFFF', .55)), steamT = sprite(mix(TEAL, '#FFFFFF', .55)), steamW = sprite(mix(C.low, '#FFFFFF', .5))
    // rain: two depths; the near streaks pick up the colour of the closest neon
    const lights = [[330, 760, PINK], [1700, 850, TEAL], [1575, 675, AMBER], [410, 880, TEAL], [1680, 500, BR2]]
    const rr = rng(5), drops = []
    const nFar = Math.round(260 * rain), nNear = Math.round(110 * rain)
    for (let i = 0; i < nFar + nNear; i++) { const nearD = i >= nFar; drops.push({ x: rr() * (W + 200) - 100, ph: rr() * 2000, v: nearD ? 1500 + rr() * 500 : 800 + rr() * 300, len: nearD ? 34 + rr() * 30 : 12 + rr() * 8, near: nearD }) }
    const els = { beac: beacons.map((_, i) => [q('bc' + i), q('bg' + i)]), fc: Array.from({ length: 9 }, (_, i) => q('fc' + i)), nc: Array.from({ length: 4 }, (_, i) => q('nc' + i)),
      sR: q('sirenR'), sB: q('sirenB'), drone: q('drone'), dl: q('dl'), holo: q('holo'), hR: q('hR'), hC: q('hC'), hm: q('hm'), hbar: q('hbar'), kois: ['hmkoi', 'hrkoi', 'hckoi'].map(q),
      mono: q('mono'), T: q('T'), h24: q('h24'), cook: q('cook'), ladle: q('ladle'), eater: q('eater'), lantern: q('lantern'), tail: q('tail'), peds: [q('ped0'), q('ped1')], drip: q('drip') }
    const pedLegs = els.peds.map(p => p.querySelector('[data-p="legs"]'))

    const frame = (t, still) => {
      // aircraft lights on the megatowers, each on its own beat
      els.beac.forEach(([c, g], i) => { const on = still || mod(t + i * .37, 1.6 + i * .21) < .45; A(c, 'opacity', on ? '1' : '.15'); A(g, 'opacity', on ? '1' : '0') })
      // far sky lane: two directions, red tails going right, white heads coming left
      els.fc.forEach((c, i) => { const dir = i % 2 ? -1 : 1, v = 70 + hash(i) * 50, x = mod(hash(i + 9) * 2200 + dir * v * t, W + 260) - 130, y = 392 + (i % 3) * 9 + (dir > 0 ? 0 : 26)
        A(c, 'transform', `translate(${f(x)} ${f(y)})${dir < 0 ? ' scale(-1 1)' : ''}`) })
      // near lane: four cars, one of them a patrol spinner flashing red / blue
      els.nc.forEach((c, i) => { const dir = i % 2 ? -1 : 1, v = 150 + hash(i + 3) * 90, x = mod(hash(i + 17) * 2400 + dir * v * t, W + 400) - 200, y = 548 + (dir > 0 ? 0 : 34) + 3 * Math.sin(t * 1.3 + i)
        A(c, 'transform', `translate(${f(x)} ${f(y)})${dir < 0 ? ' scale(-1 1)' : ''}`) })
      const sp = Math.floor(t * 6) % 2; A(els.sR, 'opacity', sp ? '1' : '.15'); A(els.sB, 'opacity', sp ? '.15' : '1')
      // delivery drone: crosses low every 30 s with a bob and a blinking light
      const du = mod(t + 8, 30) / 14, dx = -60 + 2040 * du
      A(els.drone, 'transform', `translate(${f(dx)} ${f(640 + 30 * Math.sin(du * 3) + 2 * Math.sin(t * 9))})`); A(els.drone, 'opacity', du > 1 ? '0' : '1'); A(els.dl, 'opacity', mod(t, .8) < .2 ? '1' : '.2')
      // monorail: glides across every 26 s
      A(els.mono, 'transform', `translate(${f(mod(t * 96 + 900, W + 700) - 200)} 736)`)
      // the holo koi swims; every 20 s the billboard tears into red / cyan slices for half a second
      const kx = 46 * Math.sin(t * .45), ky = 10 * Math.sin(t * .9), kr = 12 * Math.cos(t * .45)
      els.kois.forEach(k => A(k, 'transform', `translate(${f(hb.w / 2 + kx)} ${f(hb.h * .44 + ky)}) scale(${Math.cos(t * .45) >= 0 ? 1 : -1} 1) rotate(${f(kr * .3)})`))
      const g = mod(t + 6, 20), gl = !still && g < .6, jit = gl ? (hash(Math.floor(t * 30)) - .5) * 14 : 0
      A(els.hR, 'opacity', gl ? '.7' : '0'); A(els.hC, 'opacity', gl ? '.7' : '0')
      A(els.hR, 'transform', `translate(${f(gl ? 6 + jit : 0)} 0)`); A(els.hC, 'transform', `translate(${f(gl ? -5 - jit * .6 : 0)} ${gl ? 2 : 0})`)
      A(els.hm, 'transform', `translate(${f(jit * .4)} 0)`); A(els.hm, 'opacity', gl && hash(Math.floor(t * 24)) < .3 ? '.3' : '1')
      A(els.hbar, 'opacity', gl ? '.35' : '0'); A(els.hbar, 'y', f(mod(t * 400, hb.h)))
      // neon: the T in HOTEL buzzes out of step; 24H blinks slowly, all three letters at once
      const tz = mod(t, 7.3), buzz = still ? 1 : (tz > 2 && tz < 2.5) ? (hash(Math.floor(t * 20)) < .5 ? .15 : 1) : (tz > 5.1 && tz < 5.25) ? .1 : 1
      A(els.T, 'opacity', f(neon * buzz)); A(els.h24, 'opacity', f(neon * (still || mod(t, 3) < 2.2 ? 1 : .12)))
      // noodle stall: the cook ladles, the customer bows to slurp, the lantern sways
      const la = Math.sin(t * 1.6), cx = 56
      A(els.cook, 'd', `M${cx - 7} -30V-50Q${cx - 7} -56 ${cx} -56Q${cx + 7} -56 ${cx + 7} -50V-30Z M${cx - 4.5} -58a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0Z`)
      A(els.ladle, 'd', `M${cx + 5} -48L${f(cx + 16 + 4 * la)} ${f(-40 + 3 * la)}L${f(cx + 14 + 6 * la)} ${f(-31)}`)
      const bow = Math.max(0, Math.sin(t * .9)) ** 3 * 5
      A(els.eater, 'd', `M112 -14V-34Q112 -40 ${f(118 + bow * .3)} -40Q${f(124 + bow)} -40 ${f(124 + bow * .6)} -34L126 -14Z M${f(114 + bow)} ${f(-46 + bow * .8)}a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0Z`)
      A(els.lantern, 'transform', `translate(${stall.x + 140} ${stall.y - 62}) rotate(${f(4 * Math.sin(t * 1.1))})`)
      // the cat on the vending machine flicks its tail now and then
      const tf = mod(t, 6.5) < .7 ? Math.sin(mod(t, 6.5) / .7 * Math.PI * 2) : 0
      A(els.tail, 'd', `M412 ${sb - 72}Q${f(420 + 5 * tf)} ${sb - 70} ${f(420 + 3 * tf)} ${f(sb - 60 - 3 * tf)}`)
      // pedestrians under umbrellas (one transparent with a glowing rim)
      els.peds.forEach((p, i) => {
        const dir = i ? 1 : -1, v = 34 + i * 8, x = mod((i ? 300 : 1500) + dir * v * t, W + 160) - 80, ph = t * (i ? 6.6 : 6), s = Math.sin(ph)
        A(p, 'transform', `translate(${f(x)} ${f((i ? 1046 : 1022) - Math.abs(Math.cos(ph)) * .8)})${dir < 0 ? ' scale(-1 1)' : ''}`)
        A(pedLegs[i], 'd', `M0 -15L${f(4 * s)} 0M0 -15L${f(-4 * s)} 0`)
      })
      // a drop gathers under the cable and falls every 4 s
      const dt = mod(t, 4), dpx = 940
      A(els.drip, 'transform', `translate(${dpx} ${f(720 + (dt > 2.6 ? 0.5 * 900 * (dt - 2.6) ** 2 : 0))})`); A(els.drip, 'opacity', dt > 1.6 && dt < 3.1 ? '.9' : '0')

      // steam from the street vent and the noodle pot, lit by the neon it drifts past
      SX.setTransform(1, 0, 0, 1, 0, 0); SX.clearRect(0, 0, steamC.width, steamC.height); SX.setTransform(K, 0, 0, K, BX * K, -660 * K)
      const src = [[880, 1012, 4.2, 0], [1640, 1000, 2.6, 1], [1660, 998, 2.6, 2]]
      for (const [x0, y0, life, s] of src) for (let n = Math.floor((t - life) / .22); n <= Math.floor(t / .22); n++) {
        const te = n * .22, a = t - te; if (a < 0 || a > life) continue
        const k = n * 3 + s, x = x0 + (hash(k) - .5) * 10 + 9 * Math.sin(a * 1.2 + k) - 10 * a, y = y0 - 38 * a - 6 * Math.sqrt(a) * 4
        const r = (s ? 3 : 6) + (s ? 9 : 16) * Math.sqrt(a), al = (1 - a / life) ** 1.5 * Math.min(1, a / .2) * (s ? .35 : .4) * (.7 + .3 * tod)
        SX.globalAlpha = al; SX.drawImage(x < 700 ? steamP : x > 1500 ? steamT : steamW, x - r, y - r, r * 2, r * 2)
      }
      SX.globalAlpha = 1
      // rain, two depths, slanting with the wind; splash rings on the pavement
      RX.clearRect(0, 0, 1920, 1080)
      RX.lineCap = 'round'
      for (const d of drops) {
        const y = mod(d.ph + d.v * t * (still ? 0 : 1) + (still ? d.ph : 0), 1180 + d.len) - d.len, x = d.x - y * .18
        if (x < -20 || x > 1940) continue
        let col = d.near ? '#E8DDFF' : '#D6C8FF', a = d.near ? .22 : .13
        if (x < 1300 && y < 380) a *= .45 // keep the headline zone calm
        const cone = y > 784 && Math.abs(x - 1149) < 7 + (y - 784) * .37
        if (cone) { col = '#FFE7B8'; a = d.near ? .7 : .45 }
        else if (d.near) for (const [lx, ly, lc] of lights) { const dd = Math.hypot(x - lx, y - ly); if (dd < 220) { col = lc; a = Math.min(.6, a + .4 * (1 - dd / 220)); break } }
        RX.globalAlpha = a * (.7 + .3 * rain); RX.strokeStyle = col; RX.lineWidth = d.near ? 1.6 : 1
        RX.beginPath(); RX.moveTo(x, y); RX.lineTo(x - d.len * .18, y + d.len); RX.stroke()
      }
      RX.strokeStyle = '#E8DDFF'; RX.lineWidth = 1
      const nR = Math.round(22 * rain)
      for (let i = 0; i < nR; i++) {
        const per = .9, k = Math.floor((t + i * per / nR) / per), a = mod(t + i * per / nR, per) / per, id2 = k * 31 + i
        const x = hash(id2) * 1920, y = 945 + hash(id2 + 7) * 130
        RX.globalAlpha = (1 - a) * .35; RX.beginPath(); RX.ellipse(x, y, 2 + a * 12, (2 + a * 12) * .22, 0, 0, Math.PI * 2); RX.stroke()
      }
      RX.globalAlpha = 1
    }
    root._sc.frame = frame
    frame(PRINT_T, true)
  }

  document.querySelectorAll('.sc-cyberpunk').forEach(build)
  ;(window.Pack = window.Pack || {}).cyberpunk = { build, PRINT_T }
})()
