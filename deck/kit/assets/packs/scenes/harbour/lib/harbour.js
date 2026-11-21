/* Pack scene "harbour" (assets/packs/scenes/harbour): a working harbour from dawn to night.
   Markup: <div class="sc-harbour" data-tod="…" aria-hidden="true"></div> as a slide's first child; this file draws it.
   data-tod 0 = dawn · .25 morning · .5 bright day · .75 golden hour · 1 night (lighthouse sweeping, buoys blinking).
   Planes (back → front, .parallax children): sky + clouds · hills and the lighthouse headland · the container port ·
   the sea with boats, ferry and buoys · the wooden pier. One clock (Deck.clock); every actor is a pure function of t.
   Print / reduced motion: a composed still at PRINT_T (ferry mid-harbour, crane lifting). */
(() => {
  'use strict'
  const W = 1920, H = 1080, BX = 40, BY = 30, LW = W + 2 * BX, LH = H + 2 * BY, VB = `${-BX} ${-BY} ${LW} ${LH}`
  const PRINT_T = 15
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

  // ---------- the light: dawn · morning · day · golden hour · night ----------
  const PAL = {
    top: ['#2E3A7C', '#2F5A9F', '#1F5DA6', '#3A3C8C', '#1D2964'],
    mid: ['#A0668F', '#6C99CB', '#4A8ED0', '#C0607E', '#303E84'],
    low: ['#F5B27E', '#F2D3A4', '#9ACDE6', '#F79A58', '#5E5EA0'],
    hill: ['#6F5C8E', '#6787AE', '#4F80AD', '#7A5079', '#2F3872'],
    port: ['#56477C', '#4B6B96', '#386894', '#5B3C6A', '#262F67'],
    seaF: ['#E6AA8C', '#CFE0DC', '#8AC4DE', '#EC9670', '#4C5596'],
    seaM: ['#7A6E9E', '#5D93BE', '#2E86B8', '#8A5E86', '#2D3B7E'],
    seaN: ['#3D407C', '#2A5F96', '#176190', '#4A3466', '#1C2964'],
    near: ['#2F2B56', '#2C4067', '#1F4061', '#3A2449', '#171F4A'],
    rim: ['#FFD3A4', '#FFF1D2', '#FFFFFF', '#FFB27A', '#AEABE2'],
    cTop: ['#C9A4C0', '#E8EEF4', '#F4F8FC', '#E3A2AE', '#4A5296'],
    cLit: ['#FFD6B0', '#FFF6E6', '#FFFFFF', '#FFC394', '#7D7DBA'],
  }
  const LAMP = '#FFD38E', RED = '#FF4A3D', GREEN = '#5CF2A0'
  const sunAt = tod => ({ x: ramp([1540, 1620, 1750, 1800, 1850], tod), y: ramp([652, 330, 150, 600, 760], tod), r: ramp([34, 30, 26, 34, 34], tod), op: 1 - ss(.78, .86, tod) })

  let grainURL = ''
  const grain = () => {
    if (grainURL) return grainURL
    try {
      const c = document.createElement('canvas'); c.width = c.height = 256
      const x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(13)
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
      x.putImageData(d, 0, 0); grainURL = c.toDataURL()
    } catch { grainURL = 'none' }
    return grainURL
  }
  const cloudF = id => `<filter id="${id}cf" x="-10%" y="-80%" width="120%" height="260%"><feTurbulence type="fractalNoise" baseFrequency=".007 .03" numOctaves="3" seed="8"/><feDisplacementMap in="SourceGraphic" scale="24" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3"/></filter>`
    + `<filter id="${id}cu" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.2"/></filter>`
  function streak(id, k, { cx, cy, w, h, top, under, op, seed }) {
    const r = rng(seed); let s = ''
    for (let j = 0; j < 7; j++) { const t = (j + .5) / 7, ex = cx - w / 2 + t * w, eh = h * (.3 + .7 * Math.sin(Math.PI * t) ** .8) * (.7 + r() * .4); s += `<ellipse cx="${f(ex)}" cy="${f(cy - eh * .5)}" rx="${f(w / 7 * (.8 + r() * .5))}" ry="${f(eh * .5)}"/>` }
    return [`<linearGradient id="${id}g${k}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(cy - h)}" x2="0" y2="${f(cy)}"><stop offset=".4" stop-color="${top}"/><stop offset="1" stop-color="${under}"/></linearGradient>`, `<g opacity="${op}" fill="url(#${id}g${k})" filter="url(#${id}cf)">${s}</g>`]
  }
  function puff(id, k, { cx, base, w, h, top, under, op, seed }) { // a small fair-weather cumulus
    const r = rng(seed); let s = ''
    for (let j = 0; j < 9; j++) { const u = j / 8, rr = h * (.28 + .3 * Math.sin(Math.PI * u)) * (.8 + r() * .4); s += `<circle cx="${f(cx - w / 2 + u * w)}" cy="${f(base - rr * .8 - Math.sin(Math.PI * u) * h * .25)}" r="${f(rr)}"/>` }
    s += `<rect x="${f(cx - w / 2)}" y="${f(base - h * .3)}" width="${f(w)}" height="${f(h * .3)}" rx="${f(h * .15)}"/>`
    return [`<linearGradient id="${id}p${k}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(base - h)}" x2="0" y2="${f(base)}"><stop offset=".3" stop-color="${top}"/><stop offset="1" stop-color="${under}"/></linearGradient>`, `<g opacity="${op}" fill="url(#${id}p${k})" filter="url(#${id}cu)">${s}</g>`]
  }

  let count = 0
  function build(root) {
    if (!root._sc) {
      root._sc = { id: `schb${count++}` }
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
    const sun = sunAt(tod), night = ss(.78, .95, tod), dark = ss(.62, .9, tod)
    const HZ = 640
    root.style.background = `linear-gradient(180deg,${C.top},${C.mid} 38%,${C.low} 59%,${C.seaF} 60%,${C.seaN})`

    // ----- sky -----
    let sky = `<defs><linearGradient id="${id}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"><stop offset="0" stop-color="${C.top}"/><stop offset=".55" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.low}"/></linearGradient>
      <radialGradient id="${id}glow" gradientUnits="userSpaceOnUse" cx="${f(sun.x)}" cy="${f(Math.min(sun.y, HZ))}" r="560" gradientTransform="translate(${f(sun.x)} ${f(Math.min(sun.y, HZ))}) scale(1.7 1) translate(${f(-sun.x)} ${f(-Math.min(sun.y, HZ))})"><stop offset="0" stop-color="${C.rim}" stop-opacity=".6"/><stop offset=".3" stop-color="${C.rim}" stop-opacity=".18"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}halo"><stop offset="0" stop-color="${C.rim}" stop-opacity=".7"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient>
      <mask id="${id}mn"><circle cx="1560" cy="190" r="15" fill="#fff"/><circle cx="1567" cy="185" r="13" fill="#000"/></mask>${cloudF(id)}</defs>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${HZ + BY + 4}" fill="url(#${id}sky)"/>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${HZ + BY + 4}" fill="url(#${id}glow)" opacity="${f(sun.op * (1 - .6 * ss(.35, .5, tod) * (1 - ss(.5, .65, tod))))}"/>`
    if (night > 0) { const r = rng(21); let st = ''; for (let i = 0; i < 120; i++) { const y = r() * r() * 520; st += `<circle cx="${f(r() * W)}" cy="${f(y)}" r="${[.8, 1, 1.2, 1.6][Math.floor(r() * 4)]}" opacity="${f((.3 + r() * .6) * night * (1 - y / 640))}"/>` } sky += `<g fill="#FFF6E2">${st}</g><g opacity="${f(night)}"><circle cx="1560" cy="190" r="60" fill="url(#${id}halo)" opacity=".3"/><circle cx="1560" cy="190" r="15" fill="#FFF4DC" mask="url(#${id}mn)"/></g>` }
    if (sun.op > 0) sky += `<g opacity="${f(sun.op)}"><circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r * 4.4)}" fill="url(#${id}halo)" opacity=".5"/><circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r)}" fill="${mix('#FFF8E8', C.rim, .35)}"/></g>`
    let cd = '', cb = ''
    const day = 1 - Math.abs(tod - .5) * 2
    const specs = [['s', { cx: 1300, cy: 330, w: 700, h: 40, op: .75, seed: 3 }], ['s', { cx: 520, cy: 470, w: 860, h: 30, op: .5, seed: 5 }], ['s', { cx: 1760, cy: 520, w: 420, h: 24, op: .6, seed: 9 }],
      ['p', { cx: 1150, base: 560, w: 220, h: 70, op: .55 + .35 * day, seed: 4 }], ['p', { cx: 1620, base: 420, w: 160, h: 52, op: .45 + .35 * day, seed: 6 }], ['p', { cx: 330, base: 590, w: 180, h: 50, op: .45 + .3 * day, seed: 8 }]]
    specs.forEach(([kind, s], i) => { for (const dx of [0, W]) { const [d, b] = (kind === 's' ? streak : puff)(id, `${i}_${dx}`, { ...s, cx: s.cx + dx, top: C.cTop, under: C.cLit }); cd += d; cb += b } })
    const clouds = `<defs>${cd}</defs><g opacity="${f(1 - .45 * night)}">${cb}</g>`

    // ----- hills and the lighthouse headland -----
    const r1 = rng(7)
    let hl = `M${-BX} ${HZ + 2}`
    for (let x = -BX; x <= 760; x += 20) hl += `L${x} ${f(HZ - 26 - 22 * Math.sin(x / 140 + 1) - 14 * Math.sin(x / 53) - r1() * 3)}`
    hl += `L800 ${HZ + 2}Z`
    let head = `M1520 ${HZ + 2}`
    for (let x = 1520; x <= W + BX; x += 16) head += `L${x} ${f(HZ - 40 - 90 * ss(1520, 1700, x) - 10 * Math.sin(x / 37) - r1() * 4)}`
    head += `L${W + BX} ${HZ + 2}Z`
    const LH0 = { x: 1760, b: 512, top: 440 }
    const lhStripe = mix(BR, C.hill, .35 + .3 * dark)
    let windows = ''
    for (let x = 1660; x < 1920; x += 26) if (hash(x) < .4) windows += R(x, 10, 8, HZ - 52 - 80 * ss(1600, 1720, x))
    const hills = `<defs><linearGradient id="${id}hg" gradientUnits="userSpaceOnUse" x1="0" y1="480" x2="0" y2="${HZ}"><stop offset="0" stop-color="${C.hill}"/><stop offset="1" stop-color="${mix(C.hill, C.low, .45)}"/></linearGradient>
      <linearGradient id="${id}hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.low}" stop-opacity="0"/><stop offset="1" stop-color="${C.low}" stop-opacity=".6"/></linearGradient></defs>
      <path d="${hl}" fill="url(#${id}hg)" opacity=".85"/><path d="${head}" fill="url(#${id}hg)"/>
      <path d="${windows}" fill="${dark > .1 ? LAMP : mix(C.hill, C.rim, .3)}" opacity="${f(.25 + .6 * dark)}"/>
      <path d="M${LH0.x - 12} ${LH0.b}L${LH0.x - 8} ${LH0.top + 14}H${LH0.x + 8}L${LH0.x + 12} ${LH0.b}Z" fill="${mix('#F4F1EA', C.hill, .3 + .4 * dark)}"/>
      ${[0, 1].map(i => `<path d="M${f(LH0.x - 11.4 + i * 1.6 * 2.6)} ${f(LH0.b - 14 - i * 26)}L${f(LH0.x - 10.6 + i * 1.6 * 2.6)} ${f(LH0.b - 26 - i * 26)}H${f(LH0.x + 10.6 - i * 1.6 * 2.6)}L${f(LH0.x + 11.4 - i * 1.6 * 2.6)} ${f(LH0.b - 14 - i * 26)}Z" fill="${lhStripe}"/>`).join('')}
      <rect x="${LH0.x - 11}" y="${LH0.top + 10}" width="22" height="4" fill="${mix(C.near, C.hill, .4)}"/><rect x="${LH0.x - 7}" y="${LH0.top}" width="14" height="10" fill="${dark > 0 ? mix(LAMP, '#FFFFFF', .3) : mix(C.hill, C.rim, .4)}" opacity="${f(.6 + .4 * dark)}"/>
      <path d="M${LH0.x - 9} ${LH0.top}L${LH0.x} ${LH0.top - 9}L${LH0.x + 9} ${LH0.top}Z" fill="${mix(C.near, C.hill, .4)}"/>
      <rect x="${-BX}" y="590" width="${LW}" height="${HZ - 588}" fill="url(#${id}hh)"/>`
    const hillsAc = `<defs><linearGradient id="${id}beamL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}flash"><stop offset="0" stop-color="#FFFBEE" stop-opacity="1"/><stop offset=".25" stop-color="#FFF1CC" stop-opacity=".45"/><stop offset="1" stop-color="#FFF1CC" stop-opacity="0"/></radialGradient></defs>
      <path data-k="beam" fill="url(#${id}beamL)" opacity="0"/><circle data-k="flash" cx="${LH0.x}" cy="${LH0.top + 5}" r="60" fill="url(#${id}flash)" opacity="0"/>`

    // ----- the container port: stacks, a docked ship, two gantry cranes -----
    const qy = 664, r2 = rng(17), boxC = ['#C9563F', '#3F7FA6', '#E0A43B', '#5E9C76', '#8A5A9E', '#D9D2C2']
    let stacks = '', ship = ''
    const boxF = c => mix(c, C.port, .38 + .32 * dark)
    for (let x = 850; x < 1130; x += 23) { const n = 1 + Math.floor(r2() * 3); for (let j = 0; j < n; j++) stacks += `<rect x="${x}" y="${qy - 11 - j * 10.5}" width="22" height="10" fill="${boxF(boxC[Math.floor(r2() * 6)])}"/>` }
    for (let x = 1196; x < 1430; x += 21) { const n = 2 + Math.floor(r2() * 2.6); for (let j = 0; j < n; j++) ship += `<rect x="${x}" y="${qy - 6 - (j + 1) * 10}" width="20" height="9.4" fill="${boxF(boxC[Math.floor(r2() * 6)])}"/>` }
    const crane = x => `M${x} ${qy}L${x + 4} ${qy - 74}H${x + 8}L${x + 5} ${qy}ZM${x + 30} ${qy}L${x + 27} ${qy - 74}H${x + 31}L${x + 35} ${qy}Z` + R(x - 2, 39, 5, qy - 70)
      + R(x - 44, 190, 4.4, qy - 96) + `M${x + 6} ${qy - 96}L${x + 16} ${qy - 146}H${x + 20}L${x + 30} ${qy - 96}H${x + 25}L${x + 18} ${qy - 132}L${x + 11} ${qy - 96}Z` + R(x - 40, 22, 10, qy - 100) + R(x + 34, 9, 7, qy - 91)
    const stays = x => `M${x + 18} ${qy - 145}L${x + 146} ${qy - 98}M${x + 18} ${qy - 145}L${x - 40} ${qy - 98}`
    const port = `<path d="${R(830, 330, 7, qy + 5)}" fill="${C.port}"/>
      ${stacks}
      <path d="M1180 ${qy - 6}H1490L1474 ${qy + 10}H1192Z" fill="${mix('#2E3A5C', C.port, .45 + .3 * dark)}"/><path d="M1188 ${qy + 5}H1480L1474 ${qy + 10}H1192Z" fill="${mix('#B8443A', C.port, .4 + .3 * dark)}"/>
      ${ship}<path d="M1436 ${qy - 6}V${qy - 58}H1474V${qy - 6}Z" fill="${mix('#EDE6DA', C.port, .4 + .3 * dark)}"/><rect x="1432" y="${qy - 62}" width="46" height="5" fill="${mix('#EDE6DA', C.port, .5 + .3 * dark)}"/><rect x="1462" y="${qy - 76}" width="7" height="14" fill="${mix(BR, C.port, .35 + .3 * dark)}"/>
      ${[0, 1, 2, 3].map(i => `<rect x="1440" y="${qy - 52 + i * 11}" width="30" height="3" fill="${dark > .1 ? LAMP : mix(C.port, C.rim, .3)}" opacity="${f(.4 + .5 * dark)}"/>`).join('')}
      <path d="${stays(1160)}${stays(1300)}" stroke="${mix(BR2, C.port, .45 + .3 * dark)}" stroke-width="1.1"/>
      <path d="${crane(1160)}${crane(1300)}" fill="${mix(BR2, C.port, .38 + .3 * dark)}"/>
      ${dark > 0 ? `<g fill="${LAMP}" opacity="${f(dark)}">${[870, 950, 1030, 1110, 1176, 1316].map(x => `<circle cx="${x}" cy="${qy - 2}" r="1.8"/>`).join('')}</g>` : ''}`
    const portAc = `<g data-k="trolley"><rect x="-7" y="0" width="14" height="5" fill="${mix(C.near, C.port, .3)}"/><path data-k="cable" stroke="${mix(C.near, C.port, .3)}" stroke-width=".8"/><g data-k="spread"><rect x="-11" y="0" width="22" height="2.2" fill="${mix(C.near, C.port, .3)}"/><rect x="-10" y="2.2" width="20" height="9.4" fill="${boxF(BR)}"/></g></g>
      ${[1178, 1318].map((x, i) => `<circle data-k="cr${i}" cx="${x}" cy="${qy - 148}" r="2" fill="${RED}"/>`).join('')}`

    // ----- the sea -----
    let crests = ['', '', '']
    const r3 = rng(29)
    for (let i = 0; i < 160; i++) { const band = i % 3, y = band === 0 ? 690 + r3() * 70 : band === 1 ? 770 + r3() * 110 : 880 + r3() * 190, p = (y - HZ) / 440, w = 10 + p * 46 * (.5 + r3()); crests[band] += `M${f(r3() * (W + 200) - 100)} ${f(y)}q${f(w / 2)} ${f(-1.6 - p * 2.4)} ${f(w)} 0` }
    const sunCol = sun.op > 0 ? `<ellipse cx="${f(sun.x)}" cy="${f(HZ + 120 + Math.max(0, HZ - sun.y) * .35)}" rx="${f(70 + 40 * day)}" ry="230" fill="url(#${id}sr)" opacity="${f(sun.op * (.6 - .3 * day))}"/>` : ''
    const sea = `<defs><linearGradient id="${id}sea" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"><stop offset="0" stop-color="${C.seaF}"/><stop offset=".22" stop-color="${C.seaM}"/><stop offset="1" stop-color="${C.seaN}"/></linearGradient>
      <radialGradient id="${id}sr"><stop offset="0" stop-color="${C.rim}" stop-opacity=".8"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient></defs>
      <rect x="${-BX}" y="${HZ}" width="${LW}" height="${H + BY - HZ}" fill="url(#${id}sea)"/>${sunCol}
      <rect x="${-BX}" y="${HZ}" width="${LW}" height="3" fill="${mix(C.seaF, '#FFFFFF', .3)}" opacity=".5"/>`
    const seaAc = crests.map((c, i) => `<path data-k="cw${i}" d="${c}" stroke="${mix(C.seaF, '#FFFFFF', .35)}" stroke-width="${[.9, 1.2, 1.6][i]}" fill="none" opacity="${[.25, .22, .2][i]}"/>`).join('')
      + `<g data-k="sail0">${sail(C, BR, 30, dark)}</g><g data-k="sail1">${sail(C, '#F4EFE6', 40, dark)}</g><g data-k="sail2">${sail(C, BR2, 24, dark)}</g>`
      + ferry(C, BR, dark, id)
      + [['buoyR', RED], ['buoyG', GREEN]].map(([k, c]) => `<g data-k="${k}"><path d="M-6 0L-4 -12L0 -18L4 -12L6 0Z" fill="${mix(c, C.seaN, .3)}"/><rect x="-7" y="-1" width="14" height="3" rx="1" fill="${mix(C.near, C.seaN, .3)}"/><circle data-k="${k}L" cy="-21" r="2.2" fill="${c}" opacity="0"/><circle data-k="${k}G" cy="-21" r="14" fill="url(#${id}${k}g)" opacity="0"/><ellipse cy="3" rx="11" ry="2" fill="${C.seaN}" opacity=".5"/></g>
        <defs><radialGradient id="${id}${k}g"><stop offset="0" stop-color="${c}" stop-opacity=".7"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>`).join('')
    const gulls = [0, 1, 2, 3].map(i => `<path data-k="gull${i}" stroke="${mix(C.near, '#FFFFFF', tod > .3 && tod < .7 ? .85 : .15)}" stroke-width="1.6" ${LIMB}/>`).join('')

    // ----- the pier -----
    const py = 968
    let piles = '', planks = ''
    for (let x = -20; x < 560; x += 64) piles += R(x, 12, H + BY - py + 4, H + BY) + `<ellipse/>`
    piles = piles.replace(/<ellipse\/>/g, '')
    for (let x = -BX; x < 580; x += 11) planks += `M${x} ${py - 12}v10`
    const pier = `<defs><linearGradient id="${id}pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(C.near, C.rim, .12)}"/><stop offset="1" stop-color="${C.near}"/></linearGradient></defs>
      <path d="${piles}" fill="${mix(C.near, '#000000', .12)}"/>
      <path d="M${-BX} ${py}V${py - 14}H580L574 ${py}Z" fill="url(#${id}pg)"/><path d="${planks}" stroke="${mix(C.near, '#000000', .2)}" stroke-width=".8" opacity=".6"/>
      <rect x="${-BX}" y="${py - 14}" width="620" height="1.4" fill="${C.rim}" opacity="${f(.35 - .2 * dark)}"/>
      ${[120, 360].map(x => `<path d="M${x - 6} ${py - 14}V${py - 26}Q${x} ${py - 31} ${x + 6} ${py - 26}V${py - 14}Z" fill="${mix(C.near, '#000000', .15)}"/>`).join('')}
      <path d="M126 ${py - 22}Q200 ${py + 30} 262 ${py + 64}" stroke="${mix(C.near, C.rim, .25)}" stroke-width="1.6" fill="none"/>
      <ellipse cx="220" cy="${py - 16}" rx="16" ry="4" fill="none" stroke="${mix(C.near, C.rim, .3)}" stroke-width="2"/><ellipse cx="220" cy="${py - 17}" rx="10" ry="2.6" fill="none" stroke="${mix(C.near, C.rim, .3)}" stroke-width="2"/>
      <path d="M470 ${py - 14}V${py - 120}Q470 ${py - 128} 478 ${py - 128}H486" stroke="${mix(C.near, '#000000', .1)}" stroke-width="3" fill="none"/><path d="M482 ${py - 128}H494L492 ${py - 122}H484Z" fill="${mix(C.near, '#000000', .1)}"/>
      ${dark > 0 ? `<circle cx="488" cy="${py - 120}" r="40" fill="url(#${id}lampg)" opacity="${f(dark)}"/><circle cx="488" cy="${py - 121}" r="2.4" fill="#FFF3D2" opacity="${f(dark)}"/><rect x="482" y="${py + 4}" width="12" height="90" fill="url(#${id}lampr)" opacity="${f(dark * .8)}"/>
        <defs><radialGradient id="${id}lampg"><stop offset="0" stop-color="${LAMP}" stop-opacity=".6"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient><linearGradient id="${id}lampr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${LAMP}" stop-opacity=".5"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></linearGradient></defs>` : ''}`
    const pierAc = `<g data-k="perch"><path d="M-6 -3Q-2 -7 4 -5L8 -4L4 -2Q-1 0 -6 -3Z" fill="${mix('#F4F1EA', C.near, .3 + .4 * dark)}"/><path d="M-6 -3L-10 -2" stroke="${mix(C.near, '#000000', .2)}" stroke-width="1.4" stroke-linecap="round"/>
        <g data-k="phead"><circle cx="4" cy="-7" r="2.6" fill="${mix('#F4F1EA', C.near, .3 + .4 * dark)}"/><path d="M6 -7.2L9.4 -6.6" stroke="${mix('#F2B84B', C.near, .3)}" stroke-width="1.2" stroke-linecap="round"/></g>
        <path d="M0 -1V2M2 -1V2" stroke="${mix('#F2B84B', C.near, .4)}" stroke-width=".9"/></g>
      <g data-k="dinghy"><path d="M-22 -4H22L17 4H-17Z" fill="${mix(BR2, C.near, .5)}"/><path d="M-22 -4H22" stroke="${mix(BR2, '#FFFFFF', .3)}" stroke-width=".8" opacity=".6"/><path d="M18 -3Q50 -30 60 -82" stroke="${mix(C.near, C.rim, .25)}" stroke-width=".9" opacity=".7"/></g>
      <g data-k="fish">${fishing(C, BR, dark, id)}</g>
      <path data-k="lap" stroke="${mix(C.seaF, '#FFFFFF', .4)}" stroke-width="1.2" fill="none" opacity=".5"/>`

    // ----- assemble -----
    const lay = (depth, inner) => `<div class="sc-harbour-l" data-depth="${depth}">${inner}</div>`
    const sv = body => `<svg viewBox="${VB}" preserveAspectRatio="none">${body}</svg>`
    root.innerHTML = `<div class="parallax">` + lay(.02, sv(sky)) + lay(.05, `<div class="sc-harbour-drift">${sv(clouds)}</div>`)
      + lay(.1, sv(hills) + sv(hillsAc)) + lay(.16, sv(port) + sv(portAc))
      + lay(.3, sv(sea) + `<canvas class="sc-harbour-cv" data-k="glints"></canvas>` + sv(seaAc + gulls)) + lay(.5, sv(pier) + sv(pierAc))
      + `</div><div class="sc-harbour-grain"></div>`
    root.querySelector('.sc-harbour-grain').style.backgroundImage = `url(${grain()})`
    const q = k => root.querySelector(`[data-k="${k}"]`)
    const A = (el, k, v) => { if (el && el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v) } }
    const drift = root.querySelector('.sc-harbour-drift')
    const K = 1920 / LW, gc = q('glints'); gc.width = 1920; gc.height = Math.round((H - HZ) * K); gc.style.cssText = `left:0;top:${HZ + BY}px;width:${LW}px;height:${H - HZ}px`
    const G = gc.getContext('2d')
    const gr = rng(41), glints = []
    const colX = sun.op > 0 ? sun.x : 1560, colOn = sun.op > 0 || night > 0
    for (let i = 0; i < 190; i++) { const y = HZ + 4 + gr() ** 1.5 * (H - HZ - 4), p = (y - HZ) / (H - HZ), col = gr() < .45 && colOn; glints.push({ x: col ? colX + (gr() + gr() + gr() - 1.5) * (50 + 160 * p) : gr() * W, y, len: 3 + p * 24 * (.4 + gr()), th: .7 + p * 1.8, fr: .6 + gr() * 2.2, ph: gr() * 6.3, col }) }
    const gSun = sun.op > 0 ? mix(C.rim, '#FFFFFF', .4) : '#FFF2D8', gSky = mix(C.seaF, '#FFFFFF', .5)
    const els = { beam: q('beam'), flash: q('flash'), trolley: q('trolley'), cable: q('cable'), spread: q('spread'), cr: [q('cr0'), q('cr1')], cw: [0, 1, 2].map(i => q('cw' + i)),
      sails: [0, 1, 2].map(i => q('sail' + i)), ferry: q('ferry'), smoke: q('fsmoke'), buoys: ['buoyR', 'buoyG'].map(k => [q(k), q(k + 'L'), q(k + 'G')]), gulls: [0, 1, 2, 3].map(i => q('gull' + i)),
      perch: q('perch'), fish: q('fish'), fishLamp: q('fishLamp'), phead: q('phead'), dinghy: q('dinghy'), lap: q('lap') }

    const frame = (t, still) => {
      drift.style.transform = `translate3d(${f(-mod(t * 3, W))}px,0,0)`
      // the lighthouse: once the light drops, a beam sweeps every 12 s and flashes when it faces you
      if (dark > 0) {
        const ph = t * Math.PI * 2 / 12, s = Math.sin(ph), c = Math.cos(ph), L = 980 * Math.abs(s), dir = s < 0 ? -1 : 1
        const x0 = LH0.x, y0 = LH0.top + 5, spread = 8 + 30 * Math.abs(s)
        A(els.beam, 'd', `M${x0} ${y0 - 3}L${f(x0 - L)} ${f(y0 - spread)}V${f(y0 + spread * .7)}L${x0} ${y0 + 3}Z`)
        A(els.beam, 'transform', dir > 0 ? `translate(${2 * x0} 0) scale(-1 1)` : '')
        A(els.beam, 'opacity', f(dark * (.25 + .5 * Math.abs(s)) * (dir > 0 ? .5 : 1)))
        A(els.flash, 'opacity', f(dark * Math.max(0, c) ** 14))
      }
      // gantry crane: lift a box from the ship, trolley it ashore, set it down, go back (36 s)
      const u = mod(t + 4, 36), x1 = 1262, x2 = 1132, yTop = qy - 90, yShip = qy - 46, yQuay = qy - 22
      let tx = x1, sy = yShip
      if (u < 6) { tx = x1; sy = yShip - (yShip - yTop) * ss(0, 6, u) } else if (u < 14) { tx = x1 + (x2 - x1) * ss(6, 14, u); sy = yTop }
      else if (u < 20) { tx = x2; sy = yTop + (yQuay - yTop) * ss(14, 20, u) } else if (u < 24) { tx = x2; sy = yQuay - (yQuay - yTop) * ss(20, 24, u) }
      else if (u < 32) { tx = x2 + (x1 - x2) * ss(24, 32, u); sy = yTop } else { tx = x1; sy = yTop + (yShip - yTop) * ss(32, 36, u) }
      const sway = (u > 6 && u < 14) || (u > 24 && u < 32) ? 1.6 * Math.sin(t * 2.2) : .5 * Math.sin(t * 2.2)
      const carry = u < 20 || u > 32
      const ty = qy - 96 + 4.4
      A(els.trolley, 'transform', `translate(${f(tx)} ${ty})`); A(els.cable, 'd', `M-3 5L${f(-3 + sway)} ${f(sy - ty)}M3 5L${f(3 + sway)} ${f(sy - ty)}`)
      A(els.spread, 'transform', `translate(${f(sway)} ${f(sy - ty)})`); A(els.spread.lastElementChild, 'opacity', carry ? '1' : '0')
      els.cr.forEach((c, i) => A(c, 'opacity', still || mod(t + i * .7, 2) < 1 ? f(.3 + .7 * dark) : '.1'))
      // swell: crest bands slide and breathe, each on its own beat
      els.cw.forEach((c, i) => A(c, 'transform', `translate(${f(Math.sin(t * (.2 + i * .07) + i) * (6 + i * 6) - t * (2 + i) % 40)} ${f(Math.sin(t * (.5 + i * .13)) * (1 + i))})`))
      // sailboats bob and heel out of phase, drifting slowly on the breeze
      const sb = [[340, 724, .5, 1], [700, 708, .38, -1], [1500, 742, .6, 1]]
      els.sails.forEach((s, i) => { const [x0, y0, sc, dir] = sb[i], x = x0 + mod(t * 3 * dir + i * 400, 2400) * 0 + 18 * Math.sin(t * .05 + i); A(s, 'transform', `translate(${f(x)} ${f(y0 + 1.6 * Math.sin(t * (.9 + i * .23) + i * 2))}) rotate(${f(3 * Math.sin(t * (.8 + i * .19) + i))}) scale(${dir * sc} ${sc})`) })
      // the ferry crosses right to left every 70 s, smoke trailing from its funnel
      const fx = 2200 - mod(t * 34 + 1000, 2700)
      A(els.ferry, 'transform', `translate(${f(fx)} ${f(836 + 1.2 * Math.sin(t * .7))}) rotate(${f(.8 * Math.sin(t * .6))}) scale(-1.3 1.3)`)
      if (els.smoke) { let d = ''; for (let k = 0; k < 6; k++) { const a = mod(t * 1.2 + k / 6, 1) * 6, sx = 122 - a * 9, sy2 = -58 - a * 7 - Math.sin(a + k) * 2, r = 3 + a * 2.4; d += `M${f(sx - r)} ${f(sy2)}a${f(r)} ${f(r * .8)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r * .8)} 0 1 0 ${f(-2 * r)} 0Z` } A(els.smoke, 'd', d) }
      // buoys bob; at night they blink: red every 4 s, green every 3 s
      const bp = [[620, 912], [1290, 876]]
      els.buoys.forEach(([b, l, g], i) => {
        A(b, 'transform', `translate(${bp[i][0]} ${f(bp[i][1] + 2 * Math.sin(t * 1.4 + i * 2))}) rotate(${f(5 * Math.sin(t * 1.1 + i * 1.3))})`)
        const on = dark > .05 && (still || mod(t + i, i ? 3 : 4) < .5); A(l, 'opacity', on ? '1' : dark > .05 ? '.25' : '0'); A(g, 'opacity', on ? f(dark) : '0')
      })
      // gulls glide in wide loops over the port, flapping only now and then
      els.gulls.forEach((g, i) => {
        const cx = [1220, 1500, 980, 1660][i], cy = [430, 360, 520, 560][i], ra = [120, 90, 70, 60][i], w = [.12, -.16, .2, -.1][i], a = t * w + i * 2
        const x = cx + ra * Math.cos(a), y = cy + ra * .35 * Math.sin(a) + 6 * Math.sin(t * .7 + i), flap = mod(t * .4 + i * .27, 1) < .18 ? Math.sin(t * 16 + i) : .35, s = [7, 6, 5, 4.4][i]
        A(g, 'd', `M${f(x - s)} ${f(y - s * .2 + flap * s * .4)}Q${f(x - s * .5)} ${f(y - s * .45 - flap * s * .2)} ${f(x)} ${f(y)}Q${f(x + s * .5)} ${f(y - s * .45 - flap * s * .2)} ${f(x + s)} ${f(y - s * .2 + flap * s * .4)}`)
      })
      // the gull on the pile turns its head; the dinghy tugs at its rope; water laps at the piles
      A(els.perch, 'transform', `translate(548 ${py - 14})`); A(els.phead, 'transform', mod(t, 9) < 3 ? 'translate(3 0) scale(-1 1) translate(-3 0)' : '')
      A(els.dinghy, 'transform', `translate(${f(300 + 4 * Math.sin(t * .4))} ${f(1032 + 1.8 * Math.sin(t * 1.2))}) rotate(${f(3 * Math.sin(t * 1.1))})`)
      let lap = ''; for (let x = -20; x < 560; x += 64) { const y = py + 18 + 2 * Math.sin(t * 1.6 + x * .05); lap += `M${x - 6} ${f(y)}q${f(6 + 1.5 * Math.sin(t + x))} -2.4 12 0q6 2.2 12 0` } A(els.lap, 'd', lap)
      // the fishing boat rocks at its mooring, slower and heavier than the dinghy
      A(els.fish, 'transform', `translate(1560 ${f(990 + 2.2 * Math.sin(t * .8))}) rotate(${f(2.2 * Math.sin(t * .7 + 1))})`)
      // glints on the water
      G.setTransform(1, 0, 0, 1, 0, 0); G.clearRect(0, 0, gc.width, gc.height); G.setTransform(K, 0, 0, K, BX * K, -HZ * K)
      const amp = [.4 - .25 * dark, Math.max(sun.op * (.7 + .3 * day), night * .55)]
      for (const g of glints) {
        const a0 = amp[g.col ? 1 : 0]; if (a0 <= 0) continue
        const a = (still ? .3 : Math.max(0, Math.sin(t * g.fr + g.ph)) ** 6) * a0; if (a < .02) continue
        G.globalAlpha = a; G.fillStyle = g.col ? gSun : gSky; G.fillRect(g.col ? g.x : mod(g.x - t * 4, W), g.y, g.len, g.th)
      }
      G.globalAlpha = 1
    }
    root._sc.frame = frame
    frame(PRINT_T, true)
  }
  // a sailboat: hull at 0,0, mast up; sail colour from the brand where asked
  function sail(C, col, h, dark) {
    const hull = mix(C.near, C.seaM, .2), sc = mix(col, C.seaM, .2 + .35 * dark)
    return `<path d="M-14 0H16L12 5H-10Z" fill="${hull}"/><path d="M0 0V-${h * 2.1}" stroke="${hull}" stroke-width="1.4"/><path d="M1.6 -${h * 2}Q${h * .55} -${h} ${h * .8} -4H1.6Z" fill="${sc}"/><path d="M-1.6 -${h * 1.7}Q-${h * .3} -${h} -${h * .45} -6H-1.6Z" fill="${mix(sc, '#FFFFFF', .2)}" opacity=".9"/>
      ${dark > .1 ? `<circle cy="-${h * 2.1 + 1}" r="1.4" fill="#FFF4D8" opacity="${f(dark)}"/>` : ''}<ellipse cy="5" rx="16" ry="2" fill="${C.seaN}" opacity=".4"/>`
  }
  function fishing(C, col, dark, id) {
    const hull = mix('#2C3B5E', C.near, .35), cab = mix('#EDE6DA', C.near, .35 + .35 * dark)
    return `<path d="M-70 -14H74L64 6H-60Z" fill="${hull}"/><path d="M-68 -14H72V-10H-67Z" fill="${mix(col, hull, .3)}"/>
      <path d="M-10 -14V-40H24V-14Z" fill="${cab}"/><path d="M-12 -40H26V-44H-12Z" fill="${mix(cab, '#000000', .2)}"/><rect x="-4" y="-35" width="8" height="7" fill="${dark > .1 ? LAMP : mix(C.seaF, '#FFFFFF', .2)}" opacity=".85"/><rect x="9" y="-35" width="8" height="7" fill="${dark > .1 ? LAMP : mix(C.seaF, '#FFFFFF', .2)}" opacity=".85"/>
      <path d="M-40 -14V-96M-40 -88L40 -44M-40 -70L-66 -14" stroke="${hull}" stroke-width="2" fill="none"/><path d="M-40 -60Q-20 -40 -30 -16" stroke="${mix(C.near, C.rim, .3)}" stroke-width="1" fill="none" opacity=".7"/>
      ${[-58, -46, 40, 54].map((x, i) => `<circle cx="${x}" cy="-8" r="3.4" fill="${i % 2 ? '#F2B84B' : '#E5533D'}" opacity=".9"/>`).join('')}
      ${dark > .1 ? `<circle cx="-40" cy="-98" r="2" fill="#FFF4D8" opacity="${f(dark)}"/><circle cx="-40" cy="-98" r="18" fill="url(#${id}flash)" opacity="${f(dark * .4)}"/>` : ''}
      <ellipse cx="0" cy="8" rx="76" ry="4" fill="${C.seaN}" opacity=".5"/>`
  }
  function ferry(C, col, dark, id) {
    const hull = mix('#2E3A5C', C.seaN, .25), white = mix('#F2EEE6', C.seaM, .25 + .4 * dark), win = dark > .1 ? LAMP : mix(C.seaF, '#FFFFFF', .2)
    let w = ''; for (let i = 0; i < 12; i++) w += `<rect x="${24 + i * 9}" y="-27" width="5" height="4" rx="1"/>`
    let w2 = ''; for (let i = 0; i < 7; i++) w2 += `<rect x="${44 + i * 9}" y="-40" width="5" height="4" rx="1"/>`
    return `<g data-k="ferry"><path data-k="fsmoke" fill="${mix(C.seaF, '#FFFFFF', .3)}" opacity=".4"/>
      <path d="M0 -10L10 4H170L182 -14H168V-16H6Z" fill="${hull}"/><path d="M6 -16H168V-22H6Z" fill="${mix(col, hull, .25)}"/>
      <path d="M16 -22V-32H150V-22Z" fill="${white}"/><path d="M38 -32V-45H120V-32Z" fill="${white}"/><path d="M28 -45H128V-48H28Z" fill="${mix(white, '#000000', .15)}"/>
      <path d="M112 -48L114 -62H130L132 -48Z" fill="${mix(col, white, .2)}"/><rect x="113.4" y="-57" width="17.6" height="3" fill="${white}"/>
      <g fill="${win}" opacity="${f(dark > .1 ? .6 + .4 * dark : .7)}">${w}${w2}</g>
      <path d="M182 -14Q200 -12 230 -4M182 -10L240 2" stroke="#FFFFFF" stroke-width="1" fill="none" opacity=".35"/><path d="M10 4Q-30 8 -120 6" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity=".3"/>
      ${dark > .1 ? `<circle cx="6" cy="-18" r="1.6" fill="${RED}" opacity="${f(dark)}"/><circle cx="80" cy="-60" r="1.4" fill="#FFF6DD" opacity="${f(dark)}"/>` : ''}
      <ellipse cx="90" cy="7" rx="96" ry="3.4" fill="${C.seaN}" opacity=".45"/></g>`
  }

  document.querySelectorAll('.sc-harbour').forEach(build)
  ;(window.Pack = window.Pack || {}).harbour = { build, PRINT_T }
})()
