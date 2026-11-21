/* Pack scene "saturday" (assets/packs/scenes/saturday): a mellow Saturday evening in a river city.
   Markup: <div class="sc-saturday" data-tod="…" aria-hidden="true"></div> as a slide's first child; this file draws it.
   data-tod 0 = late afternoon (5 pm) · .5 = sunset · 1 = blue hour. Same city and seeds on every slide; only the light
   changes, so a deck can walk the hour forward slide by slide.
   Planes, back to front (each a .parallax child): sky · clouds · far skyline · river · city bank + promenade · viaduct.
   Every actor is a pure function of t on Deck.clock (the one clock): the train mid-crossing is still mid-crossing after
   you navigate away and back. Print and reduced motion get one composed still at PRINT_T (train mid-river).
   Wind blows right to left everywhere: steam, kite tail, boat flag and clouds agree. */
(() => {
  'use strict'
  const W = 1920, H = 1080, BX = 40, BY = 30, LW = W + 2 * BX, LH = H + 2 * BY, VB = `${-BX} ${-BY} ${LW} ${LH}`
  const PRINT_T = 7.8
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const f = n => String(Math.round(n * 10) / 10)
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * k)) }
  const ramp = (s, x) => { x = clamp(x) * (s.length - 1); const i = Math.min(s.length - 2, Math.floor(x)), k = x - i; return typeof s[0] === 'number' ? s[i] + (s[i + 1] - s[i]) * k : mix(s[i], s[i + 1], k) }
  const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k) }
  const mod = (a, n) => ((a % n) + n) % n
  const wob = t => (Math.sin(t) + Math.sin(t * 2.37 + 1.3) * .6 + Math.sin(t * 5.13 + 4.1) * .3) / 1.9
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
  const R = (x, w, h, b) => `M${f(x)} ${f(b)}V${f(b - h)}H${f(x + w)}V${f(b)}Z`
  const LIMB = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'

  // ---------- the light: five keys from 5 pm to blue hour ----------
  const PAL = {
    top: ['#3B69AE', '#4A5CA6', '#45408E', '#30327C', '#252D70'],
    mid: ['#7193C8', '#8C86BF', '#A0609A', '#5E4E96', '#383F88'],
    low: ['#E3B892', '#EDA58A', '#EA7E6E', '#A86A98', '#50549B'],
    hor: ['#F6D39A', '#F8C38C', '#F8A168', '#D98B90', '#7569AD'],
    far: ['#A2A6CB', '#AC97B8', '#A06C93', '#6C5E9A', '#41488A'],
    city: ['#777AA9', '#7D6C9D', '#6C4779', '#484381', '#2F3675'],
    bank: ['#4E5186', '#52477E', '#462E61', '#302F69', '#232A60'],
    wtop: ['#E0C6B0', '#E4B29E', '#DE8B77', '#9074A1', '#474D90'],
    wbot: ['#4A72B0', '#5262A2', '#523D7E', '#2D3375', '#202766'],
    near: ['#34386A', '#363064', '#30214C', '#232653', '#1B214E'],
    rim: ['#FFE6B8', '#FFD3A2', '#FFB27E', '#E6A2B9', '#A19CDC'],
    cTop: ['#B8C6E6', '#C3B5D7', '#BA7CA4', '#6D60A1', '#454C94'],
    cLit: ['#FFF2DC', '#FFE1C2', '#FFBA94', '#CB91AF', '#7F7BBA'],
  }
  const LAMP = '#FFD38E', FIRE = '#FF8A3A'
  const sunAt = tod => ({ x: ramp([1600, 1530, 1446, 1405, 1385], tod), y: ramp([292, 466, 652, 830, 900], tod), r: ramp([29, 31, 36, 36, 36], tod), op: 1 - ss(.56, .68, tod) })
  const litLevel = tod => .015 + .58 * ss(.28, 1, tod)

  // ---------- grain: one noise tile per page ----------
  let grainURL = ''
  const grain = () => {
    if (grainURL) return grainURL
    try {
      const c = document.createElement('canvas'); c.width = c.height = 256
      const x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(7)
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() - 1) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
      x.putImageData(d, 0, 0); grainURL = c.toDataURL()
    } catch { grainURL = 'none' }
    return grainURL
  }

  // ---------- clouds (long lit streaks, after the tftf generator) ----------
  const cloudFilters = id => `<filter id="${id}cf" x="-10%" y="-80%" width="120%" height="260%"><feTurbulence type="fractalNoise" baseFrequency=".007 .03" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="26" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3.2"/></filter>`
    + `<filter id="${id}ch" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="24"/></filter>`
    + `<filter id="${id}cr" x="-10%" y="-200%" width="120%" height="500%"><feTurbulence type="fractalNoise" baseFrequency=".01 .08" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.2"/></filter>`
  function streak(id, k, { cx, cy, w, h, top, under, rim, op = 1, seed = 1, lumps = 7 }) {
    const r = rng(seed)
    const set = (x, ww, hh, n) => {
      let s = ''
      for (let j = 0; j < n; j++) {
        const t = (j + .5) / n, ex = x - ww / 2 + t * ww + (r() - .5) * ww * .06
        const eh = hh * (.3 + .7 * Math.sin(Math.PI * t) ** .8) * (.7 + r() * .4), ew = ww / n * (.8 + r() * .55)
        s += `<ellipse cx="${f(ex)}" cy="${f(cy - eh * .5)}" rx="${f(ew)}" ry="${f(eh * .5)}"/>`
      }
      return s + `<ellipse cx="${f(x)}" cy="${f(cy - hh * .1)}" rx="${f(ww * .5)}" ry="${f(hh * .12)}"/>`
    }
    const g = `${id}g${k}`
    const defs = `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(cy - h)}" x2="0" y2="${f(cy)}"><stop offset=".45" stop-color="${top}"/><stop offset="1" stop-color="${under}"/></linearGradient>`
    const body = `<g opacity="${op}"><ellipse cx="${cx}" cy="${f(cy - h * .3)}" rx="${f(w * .55)}" ry="${f(h * .9)}" fill="${under}" opacity=".26" filter="url(#${id}ch)"/>`
      + `<g fill="url(#${g})" filter="url(#${id}cf)">${set(cx, w, h, lumps)}</g>`
      + `<g fill="${top}" opacity=".42" filter="url(#${id}cf)">${set(cx + w * .04, w * .7, h * .7, Math.max(3, lumps - 2))}</g>`
      + `<ellipse cx="${f(cx + w * .02)}" cy="${f(cy - h * .06)}" rx="${f(w * .44)}" ry="${f(Math.max(3, h * .07))}" fill="${rim}" opacity=".4" filter="url(#${id}cr)"/></g>`
    return [defs, body]
  }

  // ---------- buildings ----------
  function building(x, w, h, b, kind) {
    switch (kind) {
      case 'step': return R(x, w, h * .74, b) + R(x + w * .13, w * .74, h * .9, b) + R(x + w * .3, w * .4, h, b)
      case 'spire': return R(x, w, h * .78, b) + `M${f(x + w / 2 - 3)} ${f(b - h * .78)}L${f(x + w / 2)} ${f(b - h * 1.12)}L${f(x + w / 2 + 3)} ${f(b - h * .78)}Z`
      case 'ant': return R(x, w, h, b) + R(x + w * .62, 1.6, 16 + w * .2, b - h)
      case 'gable': return R(x, w, h, b) + `M${f(x - 1)} ${f(b - h)}L${f(x + w / 2)} ${f(b - h - Math.min(26, w * .36))}L${f(x + w + 1)} ${f(b - h)}Z`
      case 'slant': return `M${f(x)} ${f(b)}V${f(b - h)}L${f(x + w)} ${f(b - h * .8)}V${f(b)}Z`
      case 'tank': { const tx = x + w * .3; return R(x, w, h, b) + R(tx, 1.2, 6, b - h) + R(tx + 8, 1.2, 6, b - h) + `M${f(tx - 1)} ${f(b - h - 6)}V${f(b - h - 14)}Q${f(tx + 5)} ${f(b - h - 18)} ${f(tx + 11)} ${f(b - h - 14)}V${f(b - h - 6)}Z` }
      case 'chim': return R(x, w, h, b) + R(x + w * .18, 4, 9, b - h) + R(x + w * .7, 3.5, 6, b - h)
      case 'saw': { let d = R(x, w, h, b); const n = Math.max(2, Math.round(w / 14)), s = w / n; for (let i = 0; i < n; i++) d += `M${f(x + i * s)} ${f(b - h)}L${f(x + (i + 1) * s)} ${f(b - h - 9)}V${f(b - h)}Z`; return d }
      default: return R(x, w, h, b)
    }
  }
  const pick = (r, a) => a[Math.floor(r() * a.length)]
  function farCity() {
    const r = rng(31), b = 742, out = []
    const env = x => 58 + 150 * Math.exp(-(((x - 1600) / 280) ** 2)) + 92 * Math.exp(-(((x - 860) / 200) ** 2)) + 30 * Math.exp(-(((x - 300) / 220) ** 2))
    for (let x = -BX - 20; x < W + BX;) {
      const w = 22 + r() * 50, cx = x + w / 2
      let h = env(cx) * (.5 + r() * .62)
      if (Math.abs(cx - 1446) < 92) h = Math.min(h, 40 + r() * 12)
      if (Math.abs(cx - 1180) < 40) h = Math.min(h, 70)
      out.push(building(x, w, h, b, pick(r, ['flat', 'flat', 'step', 'ant', 'slant', 'spire', 'flat'])))
      x += w * (.7 + r() * .34)
    }
    // landmarks: a TV tower (red light on top), a domed hall, twin deco towers
    out.push(`M1176 ${b}L1178.6 470H1181.4L1184 ${b}Z`, `M1165 478a15 6.5 0 1 0 30 0a15 6.5 0 1 0 -30 0Z`, `M1171 466a9 3.4 0 1 0 18 0a9 3.4 0 1 0 -18 0Z`, R(1179.2, 1.6, 58, 462))
    out.push(R(392, 64, 74, b), R(400, 48, 92, b), `M402 650A22 26 0 0 1 446 650Z`, R(422.5, 3, 16, 626), `M424 610L424 626`)
    out.push(building(1622, 38, 236, b, 'step'), building(1672, 34, 212, b, 'step'), R(1640.5, 2, 30, b - 236))
    return { d: out.join(''), b }
  }
  function midCity() {
    const r = rng(57), b = 766, out = [], bodies = []
    const env = x => 64 + 44 * Math.exp(-(((x - 1080) / 260) ** 2)) + 26 * Math.sin(x / 190 + 1)
    for (let x = -BX - 20; x < W + BX;) {
      const w = 34 + r() * 60, cx = x + w / 2
      let h = Math.max(30, env(cx) * (.62 + r() * .55))
      if (cx > 1680) h = Math.min(h, 30 + r() * 12)
      if (Math.abs(cx - 1446) < 70) h = Math.min(h, 56 + r() * 6)
      if (cx > 520 && cx < 600) h = Math.min(h, 70)
      const kind = pick(r, ['gable', 'gable', 'chim', 'tank', 'flat', 'slant', 'saw', 'step'])
      out.push(building(x, w, h, b, kind)); bodies.push([x, w, kind === 'step' ? h * .74 : kind === 'slant' ? h * .8 : h])
      x += w * (.82 + r() * .22)
    }
    // landmarks: clock tower (the clock reads the slide's hour), church spire, an old brick chimney
    out.push(R(551, 20, 116, b), `M549 ${b - 116}L561 ${b - 146}L573 ${b - 116}Z`)
    out.push(R(745, 30, 84, b), R(753, 14, 104, b), `M752 ${b - 104}L760 ${b - 166}L768 ${b - 104}Z`)
    out.push(`M1003 ${b}L1006 ${b - 150}H1014L1017 ${b}Z`, R(1004.5, 11, 4, b - 146))
    return { d: out.join(''), bodies, b }
  }

  // ---------- train: local coords, front buffer at x=0, rail at y=0, faces +x ----------
  const TS = 1.26, T_LEN = 370 * TS, V = 78, PERIOD = 52, PH = 9, WIND = -22
  const head = t => -60 + V * mod(t + PH, PERIOD)
  function trainSvg(C, tod) {
    const loco = mix(C.near, '#16403A', .3), coach = mix(C.near, '#4E1E30', .3), rim = C.rim, win = ss(.3, .62, tod)
    const glass = mix(coach, C.hor, .42), wl = mix(LAMP, '#FFF3D9', .2)
    let body = '', cbody = '', wheels = '', lit = '', rims = ''
    body += R(-88, 86, 3, -12) + `M-62 -15V-32H-14Q-9 -32 -9 -27V-15Z` + `M-19 -32V-41H-20.5V-44.5H-9.5V-41H-11V-32Z` + `M-44 -32Q-44 -38.5 -38.5 -38.5Q-33 -38.5 -33 -32Z`
    body += R(-55, 2.6, 3.4, -32) + R(-58, 1.4, 5.5, -32) + `M-85 -12V-44H-87V-48.5H-59V-44H-61V-12Z` + R(-6, 6.5, 7, -7) + R(0, 2.4, 3.2, -9.4) + R(-21, 12, 7, -6)
    rims += `M-61 -32.4H-14M-86.6 -48.6H-59.4M-20.4 -44.6H-9.6`
    const cabWin = `M-81 -42H-74V-35H-81Z`
    body += `M-125 -12V-31H-92V-12Z` + R(-92, 3, 2, -13); rims += `M-124.6 -31.4H-92.4`
    const coal = `M-123 -31Q-117 -36.5 -109 -34Q-101 -37.5 -94 -31Z`
    for (const x of [-54, -40, -26]) wheels += `<circle cx="${x}" cy="-6.4" r="6.4"/>`
    for (const x of [-117, -101]) wheels += `<circle cx="${x}" cy="-4.4" r="4.4"/>`
    wheels += `<circle cx="-75" cy="-4" r="4"/>`
    for (let i = 0; i < 3; i++) {
      const x1 = -130 - i * 80, x0 = x1 - 74
      cbody += `M${x0} -10V-31Q${x0} -36.5 ${x0 + 6} -36.5H${x1 - 6}Q${x1} -36.5 ${x1} -31V-10Z` + R(x0 + 3, 68, 2.5, -7.5) + R(x1, 6, 1.6, -15)
      rims += `M${x0 + 5} -36.8H${x1 - 5}`
      for (const wx of [x0 + 9, x0 + 18, x1 - 18, x1 - 9]) wheels += `<circle cx="${wx}" cy="-3.6" r="3.6"/>`
      for (let j = 0; j < 6; j++) {
        const wx = x0 + 7 + j * 10.6, on = hash(i * 7 + j + 3) < .82
        lit += `<rect x="${f(wx)}" y="-29.5" width="6.6" height="8" rx="1" fill="${on && win > 0 ? wl : glass}" opacity="${on && win > 0 ? f(.35 + .65 * win) : .55}"/>`
        if (on && win > .05 && hash(i * 13 + j) < .55) lit += `<circle cx="${f(wx + 3.3 + (hash(j + i) - .5) * 2)}" cy="-23.6" r="1.7" fill="${coach}" opacity="${f(win)}"/>`
      }
    }
    return `<g data-k="train">
      <ellipse data-k="fireglow" cx="-70" cy="1" rx="20" ry="3.2" fill="${FIRE}" opacity="0"/>
      <g fill="${loco}"><path d="${body}"/><path d="${cabWin}" fill="${mix(FIRE, loco, .25 + .5 * (1 - win))}"/></g>
      <path d="${cbody}" fill="${coach}"/>
      <path d="${coal}" fill="${mix(loco, '#000000', .25)}"/>
      ${lit}
      <path d="${rims}" stroke="${rim}" stroke-width=".9" fill="none" opacity="${f(.55 - .25 * ss(.6, 1, tod))}"/>
      <ellipse data-k="fire" cx="-71" cy="-11" rx="7" ry="2.6" fill="${FIRE}" opacity=".6"/>
      <g fill="${mix(loco, '#000000', .18)}">${wheels}</g>
      <g data-k="rod"><rect x="-55" y="-7.1" width="30" height="1.5" rx=".7" fill="${mix(loco, rim, .35)}"/></g>
      <path data-k="conrod" stroke="${mix(loco, rim, .3)}" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="-2.6" cy="-17" r="1.3" fill="${mix(LAMP, '#FFFFFF', .4)}" opacity="${f(.25 + .75 * ss(.5, .7, tod))}"/>
      <circle cx="-2.6" cy="-17" r="16" fill="url(#__ID__lamp)" opacity="${f(ss(.52, .75, tod))}"/>
    </g>`
  }

  // ---------- tiny people (feet at 0,0, facing +x, ~15 px tall) ----------
  const person = (k, c, extra = '', outside = '') => `<g data-k="${k}"><g data-p="b"><path data-p="torso" d="M0 -6.6L.5 -11.2" stroke="${c}" stroke-width="2.6" ${LIMB}/><circle data-p="head" cx=".8" cy="-13.5" r="1.85" fill="${c}"/><path data-p="limbs" stroke="${c}" stroke-width="1.45" ${LIMB}/>${extra}</g>${outside}</g>`
  const board = c => `<g data-p="board"><path d="M-5.2 -2.2L-4.1 -1.1H4.1L5.2 -2.2" stroke="${c}" stroke-width="1.15" ${LIMB}/><circle cx="-3" cy="-.4" r=".75" fill="${c}"/><circle cx="3" cy="-.4" r=".75" fill="${c}"/></g>`
  const walk = (ph, a = 1) => {
    const s = Math.sin(ph), l = 2.4 * s * a
    return `M0 -6.6L${f(l * .5 + .6)} -3.3L${f(l)} 0M0 -6.6L${f(-l * .5 + .6)} -3.3L${f(-l)} 0M.5 -10.6L${f(-1.5 * s * a)} -6.9M.5 -10.6L${f(1.5 * s * a)} -6.9`
  }
  const ik = (hx, hy, px, py, L = 4.1) => { // two-bone leg, knee forward
    const dx = px - hx, dy = py - hy, d = Math.min(Math.hypot(dx, dy), 2 * L - .01), a = d / 2, h = Math.sqrt(L * L - a * a)
    const ux = dx / (d || 1), uy = dy / (d || 1)
    return [hx + ux * a + uy * h, hy + uy * a - ux * h]
  }

  // ---------- build one instance ----------
  let count = 0
  // a CSS colour (any syntax) → #rrggbb, or null (gradients, unset)
  const cx2 = (() => { const c = document.createElement('canvas'); c.width = c.height = 1; return c.getContext('2d', { willReadFrequently: true }) })()
  const cssHex = v => { v = (v || '').trim(); if (!v) return null; cx2.fillStyle = '#010203'; cx2.fillStyle = v; if (cx2.fillStyle === '#010203' && !/^#010203$/i.test(v)) return null; cx2.clearRect(0, 0, 1, 1); cx2.fillRect(0, 0, 1, 1); const d = cx2.getImageData(0, 0, 1, 1).data; return d[3] > 200 ? toHex([d[0], d[1], d[2]]) : null } // any CSS colour syntax (oklch, lab…) → #rrggbb; gradients → null

  function build(root) {
    // one clock registration per element; a data-tod change rebuilds the drawing and re-sets the field
    if (!root._scSat) {
      root._scSat = { id: `scsat${count++}` }
      if (window.Deck) Deck.clock(root, (t, el, still) => root._scSat.frame?.(t, still), { printT: PRINT_T })
      try { new MutationObserver(() => build(root)).observe(root, { attributes: true, attributeFilter: ['data-tod'] }) } catch { /* old browser */ }
    }
    const id = root._scSat.id, tod = clamp(parseFloat(root.dataset.tod ?? '.5') || 0)
    if (root._scSat.tod === tod) return
    root._scSat.tod = tod
    const C = {}; for (const k in PAL) C[k] = ramp(PAL[k], tod)
    // brand: --brand tints the kite, the boat's flag and one dinghy; --brand-2 the kite's second panel and one cabin
    const slide = root.closest('section.slide'), scs = slide ? getComputedStyle(slide) : null
    const BR = cssHex(scs?.getPropertyValue('--brand')) || '#E24E3C', BR2 = cssHex(scs?.getPropertyValue('--brand-2')) || '#F2A541'
    // the field behind the headline zone (top-left sky), so the engine's --ink-auto reads against what is really there
    const field = mix(C.top, C.mid, .45)
    if (slide) { slide.style.setProperty('--field', field); if (window.Deck?.inkOn) slide.style.setProperty('--ink-auto', Deck.inkOn(field)) }
    const sun = sunAt(tod), lit = litLevel(tod), night = ss(.55, .9, tod)
    root.style.background = `linear-gradient(180deg,${C.top} 0%,${C.mid} 34%,${C.low} 56%,${C.hor} 68%,${C.wtop} 72%,${C.wbot} 100%)`

    // ----- sky: gradient, afterglow, sun, crescent moon, stars -----
    let sky = `<defs><linearGradient id="${id}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="790"><stop offset="0" stop-color="${C.top}"/><stop offset=".42" stop-color="${C.mid}"/><stop offset=".73" stop-color="${C.low}"/><stop offset=".93" stop-color="${C.hor}"/></linearGradient>
      <radialGradient id="${id}glow" gradientUnits="userSpaceOnUse" cx="${f(sun.x)}" cy="${f(Math.min(sun.y, 700))}" r="520" gradientTransform="translate(${f(sun.x)} ${f(Math.min(sun.y, 700))}) scale(1.9 1) translate(${f(-sun.x)} ${f(-Math.min(sun.y, 700))})"><stop offset="0" stop-color="${C.rim}" stop-opacity="${f(.55 + .2 * (1 - Math.abs(tod - .5) * 2))}"/><stop offset=".3" stop-color="${C.rim}" stop-opacity=".2"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}sun"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".7" stop-color="${mix('#FFF4DA', C.rim, .4)}"/><stop offset="1" stop-color="${C.rim}"/></radialGradient>
      <radialGradient id="${id}cityglow"><stop offset="0" stop-color="#FFB98A" stop-opacity=".32"/><stop offset=".6" stop-color="#E58DB0" stop-opacity=".1"/><stop offset="1" stop-color="#E58DB0" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}halo"><stop offset="0" stop-color="${C.rim}" stop-opacity=".7"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient>
      <mask id="${id}moon"><circle cx="1652" cy="214" r="12" fill="#fff"/><circle cx="1646.5" cy="209" r="11.2" fill="#000"/></mask></defs>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${LH}" fill="url(#${id}sky)"/>
      <rect x="${-BX}" y="${-BY}" width="${LW}" height="${LH}" fill="url(#${id}glow)" opacity="${f(1 - .55 * ss(.7, 1, tod))}"/>`
    if (night > 0) {
      const r = rng(11); let st = ''
      const n = Math.round(110 * ss(.6, 1, tod))
      for (let i = 0; i < n; i++) { const x = r() * W, y = r() * r() * 520, o = (.25 + r() * .6) * ss(.6, 1, tod) * (1 - y / 700); st += `<circle cx="${f(x)}" cy="${f(y)}" r="${[.8, 1, 1.1, 1.3, 1.7][Math.floor(r() * 5)]}" opacity="${f(o)}"/>` }
      sky += `<g fill="#FFF6E4">${st}</g>`
    }
    if (night > 0) sky += `<ellipse cx="1000" cy="760" rx="1300" ry="300" fill="url(#${id}cityglow)" opacity="${f(night)}"/>`
    if (sun.op > 0) sky += `<g opacity="${f(sun.op)}"><circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r * 4.2)}" fill="url(#${id}halo)" opacity=".55"/><circle cx="${f(sun.x)}" cy="${f(sun.y)}" r="${f(sun.r)}" fill="url(#${id}sun)"/></g>`
    const moon = ss(.74, .92, tod)
    if (moon > 0) sky += `<g opacity="${f(moon)}"><circle cx="1652" cy="214" r="46" fill="url(#${id}halo)" opacity=".25"/><circle cx="1652" cy="214" r="12" fill="#FFF3D6" mask="url(#${id}moon)"/></g>`

    // ----- clouds: a seamless tile that drifts with the wind -----
    let cd = '', cb = ''
    const specs = [
      { cx: 1500, cy: 330, w: 760, h: 46, op: .9, seed: 3, lumps: 8 },
      { cx: 560, cy: 470, w: 900, h: 34, op: .55, seed: 7, lumps: 8 },
      { cx: 1060, cy: 218, w: 540, h: 22, op: .34, seed: 9, lumps: 6 },
      { cx: 1690, cy: 548, w: 400, h: 26, op: .6, seed: 13, lumps: 6 },
      { cx: 320, cy: 604, w: 480, h: 22, op: .5, seed: 17, lumps: 6 },
    ]
    specs.forEach((s, i) => { for (const dx of [0, W]) { const [d, b] = streak(id, `${i}_${dx}`, { ...s, cx: s.cx + dx, top: C.cTop, under: C.cLit, rim: mix(C.cLit, '#FFFFFF', .3) }); cd += d; cb += b } })
    const clouds = `<defs>${cloudFilters(id)}${cd}</defs><g opacity="${f(1 - .35 * night)}">${cb}</g>`

    // ----- far skyline -----
    const fc = farCity()
    const far = `<defs><linearGradient id="${id}fg" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="${fc.b}"><stop offset="0" stop-color="${C.far}"/><stop offset="1" stop-color="${mix(C.far, C.hor, .5)}"/></linearGradient>
      <linearGradient id="${id}fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hor}" stop-opacity="0"/><stop offset="1" stop-color="${C.hor}" stop-opacity=".75"/></linearGradient></defs>
      <path d="${fc.d}" fill="url(#${id}fg)"/><rect x="${-BX}" y="640" width="${LW}" height="110" fill="url(#${id}fh)"/>`
    const farAc = `<circle data-k="tv" cx="1180" cy="404" r="1.7" fill="#FF4D3D" opacity="0"/><circle data-k="tvg" cx="1180" cy="404" r="7" fill="url(#${id}red)" opacity="0"/>
      <defs><radialGradient id="${id}red"><stop offset="0" stop-color="#FF5A48" stop-opacity=".8"/><stop offset="1" stop-color="#FF5A48" stop-opacity="0"/></radialGradient></defs>`

    // ----- the city bank: buildings, lit windows, haze, promenade -----
    const mc = midCity(), r = rng(91)
    let wl = '', ww = '', wc = '', wg = '', glint = ''
    const special = []
    mc.bodies.forEach(([x, w, h], bi) => {
      const cols = Math.floor((w - 8) / 9), rows = Math.floor((h - 22) / 11)
      for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) {
        const wx = x + 5 + c * 9 + ((w - 8) - cols * 9) / 2, wy = mc.b - h + 7 + rw * 11, th = r(), q = `M${f(wx)} ${f(wy)}h3.6v5h-3.6Z`
        if (bi % 5 === 2 && c === 1 && rw === 1 && special.length < 3 && wx > 120 && wx < 1650) { special.push([wx, wy]); continue }
        if (th < lit) (r() < .12 ? (wc += q) : r() < .3 ? (ww += q) : (wl += q))
        else if (tod < .25 && th > .985) glint += q
        else wg += q
      }
    })
    const gTint = mix(C.city, C.hor, .22)
    const promY = 772, lamps = []
    for (let k = 0, x = 70; x < W + 20; k++, x += 118 + hash(k) * 30) lamps.push({ x, thr: .58 + .15 * hash(k + 40), k })
    const lampsOn = lamps.filter(l => tod >= l.thr)
    const warming = tod > .5 ? lamps.filter(l => tod < l.thr).sort((a, b) => a.thr - b.thr)[0] : null
    const faulty = lampsOn.find(l => l.k === 7) || lampsOn[Math.floor(lampsOn.length / 2)]
    // promenade trees: plane trees (lobed crowns lit on the sun side), poplars, low shrubs; clustered, never a row
    const treeC = mix(C.bank, C.city, .25), treeLit = mix(treeC, C.rim, .2 + .1 * (1 - night))
    let trees = '', tlit = '', trunks = ''
    const tr = rng(5)
    for (let x = 14; x < W; x += tr() < .3 ? 18 + tr() * 16 : 46 + tr() * 96) {
      if (Math.abs(x - 1424) < 34 || x > 1690) continue
      const kind = tr(), rr = 7 + tr() * 7
      if (kind < .22) { // poplar
        const h = 34 + tr() * 16, cy = promY - 8 - h / 2
        trunks += R(x - .8, 1.6, 10, promY)
        trees += `<ellipse cx="${f(x)}" cy="${f(cy)}" rx="${f(4.2 + tr() * 1.6)}" ry="${f(h / 2)}"/><ellipse cx="${f(x + .8)}" cy="${f(cy + h * .18)}" rx="${f(5.2)}" ry="${f(h * .3)}"/>`
        tlit += `<ellipse cx="${f(x + 1.6)}" cy="${f(cy - h * .12)}" rx="2" ry="${f(h * .3)}"/>`
      } else if (kind < .36) { // shrub
        for (let j = 0; j < 5; j++) { const lr = 2.4 + tr() * 2.2; trees += `<circle cx="${f(x + j * 3.4 - 6)}" cy="${f(promY - lr * .8 - (j % 2) * 1.4)}" r="${f(lr)}"/>` }
      } else { // plane tree
        const th = 12 + tr() * 8, cy = promY - th - rr * .7
        trunks += R(x - 1.1, 2.2, th + 2, promY) + `M${f(x)} ${f(cy + rr * .3)}l${f(-rr * .5)} ${f(-rr * .4)}v1.4l${f(rr * .5)} ${f(rr * .4)}Z`
        for (let j = 0; j < 7; j++) {
          const a = j / 7 * Math.PI * 2 + tr(), d = rr * (.35 + tr() * .45), lr = rr * (.45 + tr() * .35)
          trees += `<circle cx="${f(x + Math.cos(a) * d * 1.25)}" cy="${f(cy + Math.sin(a) * d * .75)}" r="${f(lr)}"/>`
          if (Math.cos(a) > .1 && Math.sin(a) < .2) tlit += `<circle cx="${f(x + Math.cos(a) * d * 1.25 + lr * .25)}" cy="${f(cy + Math.sin(a) * d * .75 - lr * .3)}" r="${f(lr * .55)}"/>`
        }
      }
    }
    trees = `<path d="${trunks}"/>${trees}`
    let posts = '', glows = ''
    for (const l of lamps) {
      posts += `M${f(l.x)} ${promY}V${promY - 23}Q${f(l.x)} ${promY - 26} ${f(l.x + 3)} ${promY - 26}`
      if (lampsOn.includes(l) && l !== faulty) glows += `<circle cx="${f(l.x + 3.4)}" cy="${promY - 24.6}" r="20" fill="url(#${id}lg)"/><circle cx="${f(l.x + 3.4)}" cy="${promY - 24.6}" r="1.8" fill="#FFF0CF"/>`
    }
    // the clock tower reads the hour of the light: 5:00 at tod 0, about 7:40 at sunset, 8:50 at blue hour
    const hrs = 17 + tod * 3.83, ma = (hrs % 1) * 360, ha = (hrs % 12) / 12 * 360
    const face = mix(mix(C.hor, '#FFFFFF', .25), LAMP, night)
    const clock = `<circle cx="561" cy="${mc.b - 105}" r="4.8" fill="${face}" opacity="${f(.65 + .35 * night)}"/><path d="M561 ${mc.b - 105}l${f(2.4 * Math.sin(ha * Math.PI / 180))} ${f(-2.4 * Math.cos(ha * Math.PI / 180))}M561 ${mc.b - 105}l${f(3.7 * Math.sin(ma * Math.PI / 180))} ${f(-3.7 * Math.cos(ma * Math.PI / 180))}" stroke="${C.city}" stroke-width=".8" stroke-linecap="round"/>`
    // the embankment: stone courses, two flights of steps down to the water
    let wallJ = ''
    for (let x = -BX; x < W + BX; x += 23) wallJ += `M${x + (x % 46 ? 0 : 11)} ${promY + 6}v7M${x} ${promY + 13}v7`
    wallJ += `M${-BX} ${promY + 6.5}H${W + BX}M${-BX} ${promY + 13.5}H${W + BX}`
    let steps = ''
    for (const sx of [236, 1090]) for (let k = 0; k < 6; k++) steps += R(sx + k * 4, 30 - k * 4, 2.6, promY + 4 + k * 3)
    const city = `<defs><linearGradient id="${id}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(C.bank, C.city, .62)}"/><stop offset="1" stop-color="${mix(C.bank, C.city, .2)}"/></linearGradient>
      <linearGradient id="${id}cg" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="${mc.b}"><stop offset="0" stop-color="${C.city}"/><stop offset="1" stop-color="${mix(C.city, C.hor, .3)}"/></linearGradient>
      <linearGradient id="${id}ch2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hor}" stop-opacity="0"/><stop offset=".7" stop-color="${C.hor}" stop-opacity=".62"/><stop offset="1" stop-color="${C.hor}" stop-opacity=".85"/></linearGradient>
      <radialGradient id="${id}lg"><stop offset="0" stop-color="${LAMP}" stop-opacity=".75"/><stop offset=".35" stop-color="${LAMP}" stop-opacity=".22"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient></defs>
      <path d="${mc.d}" fill="url(#${id}cg)"/>
      <path d="${wg}" fill="${gTint}" opacity=".45"/><path d="${glint}" fill="${C.rim}"/>
      <path d="${wl}" fill="${LAMP}"/><path d="${ww}" fill="#FFB46A"/><path d="${wc}" fill="#CFE3FF" opacity=".85"/>
      ${clock}
      <rect x="${-BX}" y="690" width="${LW}" height="${promY - 690 + 1}" fill="url(#${id}ch2)"/>
      <g fill="${treeC}">${trees}</g><g fill="${treeLit}" opacity=".55">${tlit}</g>
      <path d="${posts}" stroke="${C.bank}" stroke-width="1.5" fill="none"/>
      ${glows}
      <rect x="${-BX}" y="${promY}" width="${LW}" height="20" fill="url(#${id}wall)"/>
      <path d="${wallJ}" stroke="${mix(C.bank, '#000000', .15)}" stroke-width=".7" opacity=".5"/>
      <path d="${steps}" fill="${mix(C.bank, C.city, .3)}"/>
      <rect x="${-BX}" y="${promY}" width="${LW}" height="2.4" fill="${mix(C.city, C.hor, .35)}"/>
      <rect x="${-BX}" y="${promY}" width="${LW}" height="1" fill="${C.rim}" opacity="${f(.45 - .2 * night)}"/>`

    // actors on the bank: windows with a life, the ferris wheel, birds going home, people, the kite
    const fw = { x: 1792, y: 628, R: 88 }
    let spokes = '', rimLights = '', cabins = ''
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; spokes += `M0 0L${f(Math.cos(a) * fw.R)} ${f(Math.sin(a) * fw.R)}` }
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; rimLights += `<circle cx="${f(Math.cos(a) * fw.R)}" cy="${f(Math.sin(a) * fw.R)}" r="1.25" fill="${i % 3 ? LAMP : '#FFB0C8'}"/>` }
    const fwC = mix(C.bank, C.city, .35), cabCols = ['#C9675F', '#5E9C9A', '#E3B65F', BR2]
    for (let i = 0; i < 12; i++) cabins += `<g data-k="cab${i}"><path d="M0 0V3.4" stroke="${fwC}" stroke-width=".7"/><rect x="-3.3" y="3" width="6.6" height="6.4" rx="1.8" fill="${mix(cabCols[i % 4], C.city, .5 + .2 * night)}"/><rect x="-2.1" y="4.4" width="4.2" height="2.4" rx=".6" fill="${LAMP}" opacity="${f(night * .85)}"/></g>`
    const birds = Array.from({ length: 7 }, (_, i) => `<path data-k="bird${i}" stroke="${mix(C.near, C.mid, .2)}" stroke-width="1.15" ${LIMB}/>`).join('')
    const pc = mix(C.bank, '#000000', .12)
    const kiteBody = mix(BR, C.near, .25 * night), kiteHalf = mix(BR2, C.near, .25 * night)
    let railing = `M${-BX} ${promY - 7}H${W + BX}`
    for (let x = -BX; x < W + BX; x += 26) railing += `M${x} ${promY - 7}V${promY}`
    const cityAc = `${special.map((s, i) => `<rect data-k="win${i}" x="${f(s[0])}" y="${f(s[1])}" width="3.6" height="5" fill="${i === 0 ? '#A9CCFF' : LAMP}" opacity="0"/>`).join('')}
      <g data-k="warm" opacity="0">${warming ? `<circle cx="${f(warming.x + 3.4)}" cy="${promY - 24.6}" r="20" fill="url(#${id}lg)"/><circle cx="${f(warming.x + 3.4)}" cy="${promY - 24.6}" r="1.8" fill="#FFF0CF"/>` : ''}</g>
      <g data-k="faulty" opacity="0">${faulty ? `<circle cx="${f(faulty.x + 3.4)}" cy="${promY - 24.6}" r="20" fill="url(#${id}lg)"/><circle cx="${f(faulty.x + 3.4)}" cy="${promY - 24.6}" r="1.8" fill="#FFF0CF"/>` : ''}</g>
      <path d="M${fw.x} ${fw.y}L${fw.x - 40} ${promY}M${fw.x} ${fw.y}L${fw.x + 40} ${promY}M${fw.x - 26} ${promY - 36}H${fw.x + 26}" stroke="${fwC}" stroke-width="2.2" fill="none"/>
      ${R(fw.x - 52, 16, 11, promY).replace(/^/, '<path d="').replace(/$/, `" fill="${fwC}"/>`)}
      <g data-k="wheel" transform="translate(${fw.x} ${fw.y})"><circle r="${fw.R}" fill="none" stroke="${fwC}" stroke-width="1.6"/><circle r="${fw.R * .86}" fill="none" stroke="${fwC}" stroke-width=".7"/><path d="${spokes}" stroke="${fwC}" stroke-width=".7"/><g opacity="${f(ss(.42, .7, tod))}">${rimLights}</g><circle r="3.2" fill="${fwC}"/></g>
      <g transform="translate(${fw.x} ${fw.y})">${cabins}</g>
      ${tod < .8 ? birds : ''}
      ${tod >= .8 ? [0, 1].map(i => `<path data-k="bat${i}" fill="${mix(C.near, C.city, .2)}"/>`).join('') : ''}
      <g${tod < .78 ? '' : ' display="none"'}><path data-k="kline" stroke="${mix(C.bank, C.hor, .2)}" stroke-width=".6" fill="none" opacity=".7"/>
      <g data-k="kite"><path d="M0 -10L6.2 -1L0 11L-6.2 -1Z" fill="${kiteBody}"/><path d="M0 -10L6.2 -1L0 11Z" fill="${kiteHalf}"/><path d="M0 -10V11M-6.2 -1H6.2" stroke="${mix(kiteBody, '#000000', .3)}" stroke-width=".5"/></g>
      <path data-k="ktail" stroke="${mix('#F7E6C6', C.city, .3 * night)}" stroke-width=".8" fill="none"/>
      <path data-k="kbows" stroke="${kiteBody}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      ${person('flyer', pc)}</g>
      ${person('walker', pc, `<path d="M-3.8 -8.2L4.4 -9.8" stroke="${pc}" stroke-width="1.15" stroke-linecap="round"/>`)}
      ${person('dogman', pc)}<path data-k="leash" stroke="${pc}" stroke-width=".55" fill="none"/>
      <g data-k="dog"><ellipse cx="0" cy="-3.7" rx="3.3" ry="1.65" fill="${pc}"/><circle cx="3.3" cy="-5.1" r="1.35" fill="${pc}"/><path d="M4.1 -4.6L5.4 -4.2" stroke="${pc}" stroke-width="1.1" stroke-linecap="round"/><path data-p="legs" stroke="${pc}" stroke-width=".9" ${LIMB}/><path data-p="tail" stroke="${pc}" stroke-width=".9" ${LIMB}/></g>
      ${person('sk1', pc, '', board(pc))}
      ${person('sk2', pc, '', board(pc))}
      <g data-k="bike"><circle cx="-5.2" cy="-4.4" r="4.1" fill="none" stroke="${pc}" stroke-width="1"/><circle cx="5.6" cy="-4.4" r="4.1" fill="none" stroke="${pc}" stroke-width="1"/>
        <path d="M-5.2 -4.4L.4 -4.4L-1.4 -10M.4 -4.4L4.4 -10.4L5.6 -4.4M-1.4 -10L4.2 -9.6M3.8 -11.4L5.4 -11" stroke="${pc}" stroke-width="1" ${LIMB}/>
        <path d="M-1.4 -10.6L2.6 -14.2" stroke="${pc}" stroke-width="2.5" ${LIMB}/><circle cx="3.6" cy="-16.1" r="1.8" fill="${pc}"/><path d="M2.6 -14L4.8 -11" stroke="${pc}" stroke-width="1.3" ${LIMB}/>
        <path data-p="legs" stroke="${pc}" stroke-width="1.4" ${LIMB}/>
        <circle data-p="rear" cx="-9.6" cy="-6" r="1" fill="#FF4A3A" opacity="0"/><circle cx="9.7" cy="-6.6" r=".9" fill="#FFF4D6" opacity="${f(ss(.55, .8, tod))}"/></g>
      <path d="${railing}" stroke="${C.bank}" stroke-width=".9" fill="none" opacity=".9"/>`

    // ----- the river -----
    const wTop = 768
    let ripples = ''
    const rr2 = rng(23)
    for (let i = 0; i < 70; i++) { const y = 800 + rr2() ** 1.5 * 270, w = 20 + (y - 790) * .35 * (.5 + rr2()); ripples += `M${f(rr2() * W)} ${f(y)}h${f(w)}` }
    let streaks = ''
    for (const l of lampsOn) if (l !== faulty) streaks += `<rect x="${f(l.x + 1.6)}" y="795" width="3.6" height="${f(50 + hash(l.k) * 40)}" fill="url(#${id}ls)"/>`
    const sunRefl = sun.op > 0 ? `<ellipse cx="${f(sun.x)}" cy="${f(800 + Math.max(0, 700 - sun.y) * .45 + 110)}" rx="${f(60 + 40 * (1 - tod))}" ry="190" fill="url(#${id}sr)" opacity="${f(sun.op * (.55 + .4 * ss(.1, .5, tod)))}"/>` : ''
    // the far bank mirrored in the river: squashed, rippled, fading with distance; lit windows smear into the water
    const mirror = `matrix(1 0 0 -.55 0 ${f(793 * 1.55)})`
    const water = `<defs><linearGradient id="${id}wg" gradientUnits="userSpaceOnUse" x1="0" y1="${wTop}" x2="0" y2="${H}"><stop offset="0" stop-color="${C.wtop}"/><stop offset=".3" stop-color="${mix(C.wtop, C.wbot, .5)}"/><stop offset="1" stop-color="${C.wbot}"/></linearGradient>
      <linearGradient id="${id}wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bank}" stop-opacity=".5"/><stop offset="1" stop-color="${C.bank}" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}ls" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${LAMP}" stop-opacity=".6"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}mf" gradientUnits="userSpaceOnUse" x1="0" y1="793" x2="0" y2="905"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${id}mm" maskUnits="userSpaceOnUse" x="${-BX}" y="780" width="${LW}" height="160"><rect x="${-BX}" y="780" width="${LW}" height="160" fill="url(#${id}mf)"/></mask>
      <filter id="${id}rf" x="-2%" y="-30%" width="104%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".003 .11" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.4 1.8"/></filter>
      <radialGradient id="${id}sr"><stop offset="0" stop-color="${C.rim}" stop-opacity=".75"/><stop offset="1" stop-color="${C.rim}" stop-opacity="0"/></radialGradient></defs>
      <rect x="${-BX}" y="${wTop}" width="${LW}" height="${H + BY - wTop}" fill="url(#${id}wg)"/>
      ${sunRefl}
      <g mask="url(#${id}mm)"><g filter="url(#${id}rf)"><g transform="${mirror}">
        <path d="${mc.d}" fill="${mix(C.city, C.wtop, .15)}" opacity=".78"/><path d="${wl}${ww}" fill="${LAMP}" opacity=".7"/>
        <circle cx="1792" cy="628" r="88" fill="none" stroke="${mix(C.bank, C.city, .35)}" stroke-width="2" opacity=".6"/>
        ${night > 0 ? `<circle cx="1792" cy="628" r="88" fill="none" stroke="${LAMP}" stroke-width="1.6" stroke-dasharray="2 9" opacity="${f(ss(.42, .7, tod) * .7)}"/>` : ''}</g>
        ${streaks}</g></g>
      <rect x="${-BX}" y="791" width="${LW}" height="9" fill="url(#${id}wb)"/>
      <path d="${ripples}" stroke="${mix(C.wtop, '#FFFFFF', .2)}" stroke-width="1" opacity=".14"/>`
    const boatC = mix(C.bank, C.near, .4), boatWin = night > 0 ? LAMP : mix(C.wtop, '#FFFFFF', .15)
    let fest = ''
    for (let i = 0; i < 9; i++) fest += `<circle cx="${8 + i * 6.2}" cy="${f(-12.6 + Math.sin(i / 8 * Math.PI) * -1.2)}" r=".8" fill="${i % 2 ? LAMP : '#FF9DB8'}"/>`
    let bwin = ''
    for (let i = 0; i < 8; i++) bwin += `<rect x="${13 + i * 5.4}" y="-6.3" width="3.2" height="3" rx=".5"/>`
    const waterAc = `<defs><linearGradient id="${id}wk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".5"/></linearGradient></defs>
      <g data-k="boat"><ellipse cx="33" cy="4" rx="36" ry="2.6" fill="${C.bank}" opacity=".28"/>
        <path d="M1 .8L-74 4.6M1 .4L-62 -1.2" stroke="url(#${id}wk)" stroke-width="1" fill="none"/>
        <path d="M0 -1.2L3.5 2.8H62L66 -2Z" fill="${boatC}"/>${R(10, 48, 6.4, -1.2).replace(/^/, '<path d="').replace(/$/, `" fill="${mix(boatC, C.wtop, .18)}"/>`)}
        <rect x="8" y="-9" width="52" height="1.6" fill="${boatC}"/><path d="M48 -9V-14H58V-9Z" fill="${boatC}"/>
        <g fill="${boatWin}" opacity="${f(night > 0 ? .5 + .5 * night : .5)}">${bwin}</g><g opacity="${f(ss(.5, .8, tod))}">${fest}</g>
        <path d="M2 -1.2V-15" stroke="${boatC}" stroke-width=".7"/><path data-k="flag" fill="${mix(BR, C.bank, .3)}"/></g>
      <g data-k="scull"><path d="M-14 0Q0 -1.6 14 0Q0 1 -14 0Z" fill="${boatC}"/><path data-k="rower" stroke="${boatC}" stroke-width="1.9" ${LIMB}/><circle data-k="rhead" r="1.4" fill="${boatC}"/><path data-k="oar" stroke="${boatC}" stroke-width=".7" stroke-linecap="round"/></g>
      ${[[262, BR], [1124, '#5E9C9A'], [1146, '#E3B65F']].map(([x, c], i) => `<g data-k="dinghy${i}" transform="translate(${x} 797)"><path d="M-9 -2.2L9 -2.2L7 1.4H-6.6Z" fill="${mix(c, C.bank, .45 + .25 * night)}"/><path d="M-9 -2.2H9" stroke="${mix(c, '#FFFFFF', .2)}" stroke-width=".6" opacity=".6"/><path d="M-12 -2L-26 -5" stroke="${C.bank}" stroke-width=".4" opacity=".6"/></g>`).join('')}
      ${[0, 1, 2].map(i => `<ellipse data-k="pud${i}" rx="2.4" ry=".7" fill="none" stroke="#FFFFFF" stroke-width=".6" opacity="0"/>`).join('')}`

    // ----- the viaduct, the telegraph wires, the train -----
    const deck = 1003, rail = 1002
    let arches = `M${-BX} ${deck}H${W + BX}V${H + BY}H${-BX}Z`
    for (let x = -BX - 30; x < W + BX; x += 170) arches += `M${x + 28} ${H + BY}V1062A57 40 0 0 1 ${x + 142} 1062V${H + BY}Z`
    const poles = [], wires = []
    let pp = ''
    for (let x = 160; x < W + 400; x += 360) { poles.push(x); pp += R(x - 1.4, 2.8, 80, deck) + R(x - 12, 24, 2.4, 928) }
    const wireY = (x, side) => { const i = Math.floor((x - 160) / 360), a = 160 + i * 360 + side, u = (x - a) / 360; return 927 + 36 * u * (1 - u) }
    for (const x of poles) for (const s of [-9, 9]) wires.push(`M${x + s} 927Q${x + s + 180} 945 ${x + s + 360} 927`)
    let bricks = ''
    const br = rng(3)
    for (let y = 1016; y < H + BY; y += 7) for (let x = -BX + (y % 14 ? 0 : 9); x < W + BX; x += 18) if (br() < .5) bricks += `M${x} ${y}h${f(8 + br() * 7)}v2.6h${f(-(8 + br() * 7))}Z`
    const nearRim = C.rim
    const near = `<defs><linearGradient id="${id}vg" gradientUnits="userSpaceOnUse" x1="0" y1="${deck}" x2="0" y2="${H}"><stop offset="0" stop-color="${mix(C.near, C.rim, .1)}"/><stop offset=".25" stop-color="${C.near}"/><stop offset="1" stop-color="${mix(C.near, '#000000', .12)}"/></linearGradient></defs>
      <path d="${wires.join('')}" stroke="${mix(C.near, C.mid, .15)}" stroke-width=".8" fill="none"/>
      <path d="${pp}" fill="${C.near}"/>
      <path d="${arches}" fill="url(#${id}vg)" fill-rule="evenodd"/>
      <path d="${bricks}" fill="${mix(C.near, C.rim, .3)}" opacity=".07"/>
      <rect x="${-BX}" y="${deck}" width="${LW}" height="1" fill="${nearRim}" opacity="${f(.5 - .25 * night)}"/>
      <rect x="${-BX}" y="1012" width="${LW}" height="1.4" fill="${mix(C.near, '#000000', .2)}" opacity=".6"/>
      <rect x="${-BX}" y="${rail - 1.2}" width="${LW}" height="1.2" fill="${mix(C.near, C.rim, .45)}"/>`
    const sigLamp = night > 0
    const nearAc = `<defs><radialGradient id="${id}lamp"><stop offset="0" stop-color="${LAMP}" stop-opacity=".7"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}sg"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".8"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
      <g fill="${C.near}"><path d="${R(68.6, 2.8, 76, deck)}M66 ${deck - 76}h8v-2h-8Z"/></g>
      <g data-k="arm" transform="translate(70 ${deck - 69})"><path d="M0 -1.4H16V1.4H0Z" fill="${mix('#C8403A', C.near, .35)}"/><path d="M11 -1.4h1.6v2.8H11Z" fill="${mix('#FFFFFF', C.near, .35)}"/></g>
      <circle data-k="siglamp" cx="66.6" cy="${deck - 69}" r="1.2" fill="#FF4A3A" opacity="${sigLamp ? f(.4 + .6 * night) : 0}"/>
      ${trainSvg(C, tod).replace(/__ID__/g, id)}
      <path data-k="wb0" fill="${C.near}"/><path data-k="wb1" fill="${C.near}"/>`

    // ----- assemble -----
    const lay = (depth, inner, cls = '') => `<div class="sc-saturday-l${cls}" data-depth="${depth}">${inner}</div>`
    const sv = (body, k = '') => `<svg${k ? ` data-k="${k}"` : ''} viewBox="${VB}" preserveAspectRatio="none">${body}</svg>`
    root.innerHTML = `<div class="parallax">`
      + lay(.02, sv(sky))
      + lay(.05, `<div class="sc-saturday-drift">${sv(clouds)}</div>`)
      + lay(.1, sv(far) + sv(farAc, 'ac'))
      + lay(.22, sv(water) + `<canvas class="sc-saturday-cv" data-k="glints"></canvas>` + sv(waterAc, 'ac'))
      + lay(.17, sv(city) + sv(cityAc, 'ac'))
      + lay(.4, sv(near) + sv(nearAc, 'ac') + `<canvas class="sc-saturday-cv" data-k="steam"></canvas>`)
      + `</div><div class="sc-saturday-grain"></div>`
    root.querySelector('.sc-saturday-grain').style.backgroundImage = `url(${grain()})`
    const q = k => root.querySelector(`[data-k="${k}"]`)
    const A = (el, k, v) => { if (el && el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v) } }
    const drift = root.querySelector('.sc-saturday-drift')

    // canvases (world coordinates via a transform; backing stays ≤ 1920 wide)
    const K = 1920 / LW
    const canvas = (k, y0, y1) => {
      const c = q(k); c.width = 1920; c.height = Math.round((y1 - y0) * K)
      c.style.cssText = `left:0;top:${y0 + BY}px;width:${LW}px;height:${y1 - y0}px`
      const x = c.getContext('2d'); x.setTransform(K, 0, 0, K, BX * K, -y0 * K); return { c, x, y0, y1 }
    }
    const SC = canvas('steam', 560, 1080), GC = canvas('glints', 790, 1080)
    const sprite = (col, soft = .55) => {
      const s = document.createElement('canvas'); s.width = s.height = 64
      const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      gr.addColorStop(0, col); gr.addColorStop(soft, col + 'B0'); gr.addColorStop(1, col + '00')
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s
    }
    const steamFire = sprite(mix(FIRE, '#FFFFFF', .25), .3)
    const steamLit = sprite(mix('#FFFFFF', C.rim, .3 + .2 * (1 - night))), steamShade = sprite(mix(mix(C.mid, C.wtop, .5), '#FFFFFF', .25))

    // glints: sky glints drift with the current; sun-path glints stay under the sun; lamp glints under each lit lamp
    const gr = rng(77), glints = []
    const sunG = sun.op * (.6 + .5 * ss(.05, .5, tod)), skyG = .55 - .25 * night, lampG = ss(.6, .78, tod)
    for (let i = 0; i < 150; i++) {
      const y = 796 + gr() ** 1.6 * 280, p = (y - 790) / 290
      let kind = gr() < .42 && sunG > 0 ? 1 : 0
      let x = kind ? sun.x + (gr() + gr() + gr() - 1.5) * (40 + 120 * p) : gr() * W
      glints.push({ x, y, len: 3 + p * 20 * (.4 + gr()), th: .7 + p * 1.6, fr: .7 + gr() * 2.4, ph: gr() * 6.3, kind })
    }
    for (const l of lampsOn) if (l !== faulty) for (let j = 0; j < 7; j++) glints.push({ x: l.x + 3.5 + (gr() - .5) * 6, y: 798 + j * 11 + gr() * 8, len: 2 + j * 1.4, th: .8 + j * .15, fr: 1 + gr() * 2, ph: gr() * 6.3, kind: 2 })
    const gCol = [mix(C.wtop, '#FFFFFF', .45), mix(C.rim, '#FFFFFF', .35), '#FFDFA8']
    const gAmp = [skyG * .5, sunG, lampG * .8]

    const els = {
      tv: q('tv'), tvg: q('tvg'), wheel: q('wheel'), cabs: Array.from({ length: 12 }, (_, i) => q('cab' + i)),
      birds: Array.from({ length: 7 }, (_, i) => q('bird' + i)).filter(Boolean), bats: [q('bat0'), q('bat1')].filter(Boolean), kite: q('kite'), kline: q('kline'), ktail: q('ktail'), kbows: q('kbows'),
      wins: [0, 1, 2].map(i => q('win' + i)), warm: q('warm'), faulty: q('faulty'),
      dinghies: [0, 1, 2].map(i => q('dinghy' + i)), dx0: [262, 1124, 1146], boat: q('boat'), flag: q('flag'), scull: q('scull'), rower: q('rower'), rhead: q('rhead'), oar: q('oar'), puds: [0, 1, 2].map(i => q('pud' + i)),
      train: q('train'), rod: q('rod'), conrod: q('conrod'), fire: q('fire'), fireglow: q('fireglow'), arm: q('arm'), siglamp: q('siglamp'), wb: [q('wb0'), q('wb1')],
      leash: q('leash'), dog: q('dog'), bike: q('bike'),
    }
    const fig = k => { const g = q(k); return { g, b: g.querySelector('[data-p="b"]'), limbs: g.querySelector('[data-p="limbs"]'), torso: g.querySelector('[data-p="torso"]'), board: g.querySelector('[data-p="board"]') } }
    const P = { flyer: fig('flyer'), walker: fig('walker'), dogman: fig('dogman'), sk1: fig('sk1'), sk2: fig('sk2') }
    const dogLegs = els.dog.querySelector('[data-p="legs"]'), dogTail = els.dog.querySelector('[data-p="tail"]')
    const bikeLegs = els.bike.querySelector('[data-p="legs"]'), bikeRear = els.bike.querySelector('[data-p="rear"]')
    const place = (o, x, y, dir = 1, extra = '') => A(o.g || o, 'transform', `translate(${f(x)} ${f(y)})${dir < 0 ? ' scale(-1 1)' : ''}${extra}`)

    // ----- one frame: everything is a function of t -----
    const frame = (t, still) => {
      // clouds drift with the wind (one tile = 1920 px at 2.6 px/s)
      drift.style.transform = `translate3d(${f(-mod(t * 2.6, W))}px,0,0)`
      // TV tower light, once the light starts to go
      const tvOn = tod > .3 && mod(t, 2.4) < 1
      A(els.tv, 'opacity', tvOn ? f(.4 + .6 * ss(.3, .6, tod)) : '0'); A(els.tvg, 'opacity', tvOn ? f(ss(.3, .7, tod)) : '0')

      // windows with a life: a TV flickering blue, one window that lights late, one that goes dark for a while
      if (tod > .3) {
        const tv = .45 + .4 * Math.abs(wob(Math.floor(t * 7) * 1.7))
        A(els.wins[0], 'opacity', still ? '.7' : f(tv))
        A(els.wins[1], 'opacity', mod(t + 30, 50) > 18 ? '1' : '0')
        A(els.wins[2], 'opacity', mod(t, 37) < 6 ? '0' : '1')
      }
      // the next lamp warms up (sodium pink, a stutter, then full); one lamp is faulty
      if (warming) {
        const u = mod(t + 4, 40), o = u < 10 ? 0 : u < 11.6 ? (Math.sin(u * 40) > 0 ? .5 : .1) * (u - 10) : Math.min(1, .55 + (u - 11.6) * .2)
        A(els.warm, 'opacity', still ? '0' : f(o))
      }
      if (faulty) { const u = mod(t, 17); A(els.faulty, 'opacity', !still && ((u > 3 && u < 3.12) || (u > 3.3 && u < 3.38) || (u > 3.5 && u < 4.4)) ? '.15' : '1') }

      // ferris wheel: one turn every 2 minutes; cabins hang level
      const fa = t * 3
      A(els.wheel, 'transform', `translate(${fw.x} ${fw.y}) rotate(${f(fa)})`)
      els.cabs.forEach((c, i) => { const a = (i / 12 * 360 + fa) * Math.PI / 180; A(c, 'transform', `translate(${f(Math.cos(a) * fw.R)} ${f(Math.sin(a) * fw.R)})`) })

      // birds heading home: a loose V from the right, descending into the promenade trees, smaller as they go
      const bu = mod(t + 6, 46) / 26
      els.birds.forEach((b, i) => {
        if (bu > 1) { A(b, 'opacity', '0'); return }
        const u = clamp(bu - i * .006), sc = 1 - .58 * u
        const off = [[0, 0], [-14, -7], [-14, 7], [-27, -13], [-27, 12], [-40, -18], [-38, 19]][i]
        const x = 1990 - 1040 * u + off[0] * -sc + Math.sin(t * .8 + i) * 2, y = 300 + 440 * u ** 1.7 + off[1] * sc + Math.sin(t * 1.1 + i * 2) * 1.5
        const flapOn = mod(t * .5 + i * .13, 1) < .62, w = flapOn ? Math.sin(t * 15 + i * 1.7) : .25
        const s = 4.3 * sc, tip = (-1.4 + 2.8 * w) * sc, mid = (-1.2 - 1.2 * w) * sc
        A(b, 'd', `M${f(x - s)} ${f(y + tip)}Q${f(x - s * .45)} ${f(y + mid)} ${f(x)} ${f(y)}Q${f(x + s * .45)} ${f(y + mid)} ${f(x + s)} ${f(y + tip)}`)
        A(b, 'opacity', f(Math.min(1, (1 - u) * 6) * (u < .02 ? u * 50 : 1)))
      })

      // after dark two bats flit around the lamps instead
      els.bats.forEach((b, i) => {
        const cx = i ? 1250 : 520, x = cx + 46 * Math.sin(t * 1.3 + i) + 17 * Math.sin(t * 3.7 + i * 2), y = 700 + 22 * Math.sin(t * 1.9 + i * 3) + 9 * Math.sin(t * 5.3)
        const w = Math.sin(t * 26 + i), s2 = .6 + .4 * Math.abs(w)
        A(b, 'd', `M${f(x - 4.4)} ${f(y - 1 * s2)}L${f(x - 2.6)} ${f(y - 2.6 * s2)}L${f(x - 1.6)} ${f(y - .9 * s2)}L${f(x)} ${f(y - 1.4)}L${f(x + 1.6)} ${f(y - .9 * s2)}L${f(x + 2.6)} ${f(y - 2.6 * s2)}L${f(x + 4.4)} ${f(y - 1 * s2)}L${f(x + 1.2)} ${f(y + .5)}L${f(x)} ${f(y + 1.2)}L${f(x - 1.2)} ${f(y + .5)}Z`)
      })
      // the kite: bobbing on the wind, tail streaming left, line sagging to the flyer's raised hand
      const kx = 1336 + 14 * Math.sin(t * .31) + 6 * Math.sin(t * .83 + 1), ky = 438 + 9 * Math.sin(t * .47 + .5) + 4 * Math.sin(t * 1.3)
      const tilt = -8 + 7 * Math.sin(t * .6)
      place(els.kite, kx, ky, 1, ` rotate(${f(tilt)})`)
      const hx = 1426.4, hy = promY - 13.2
      A(els.kline, 'd', `M${f(hx)} ${f(hy)}Q${f((hx + kx) / 2 + 30)} ${f((hy + ky) / 2 + 70)} ${f(kx)} ${f(ky + 1)}`)
      let tl = '', bw = ''
      const ta = tilt * Math.PI / 180, tx0 = kx - Math.sin(ta) * 11, ty0 = ky + Math.cos(ta) * 11
      for (let k = 0; k <= 12; k++) { const px = tx0 - k * 3.3, py = ty0 + k * 2 + 2.4 * Math.sin(t * 3.1 - k * .75) * (k / 12); tl += (k ? 'L' : 'M') + f(px) + ' ' + f(py); if (k % 3 === 2) bw += `M${f(px - .6)} ${f(py)}h1.2` }
      A(els.ktail, 'd', tl); A(els.kbows, 'd', bw)
      place(P.flyer, 1424, promY); A(P.flyer.limbs, 'd', `M0 -6.6L1.2 -3.3L1.8 0M0 -6.6L-.8 -3.3L-1.6 0M.5 -10.6L${f(2 + Math.sin(t * .9) * .4)} ${f(-13.4 + Math.sin(t * .5) * .5)}M.5 -10.6L-1.2 -7.2`)

      // people on the promenade
      const wx = mod(-t * 15 + 980, W + 140) - 70, wph = t * 2 * Math.PI * .85
      place(P.walker, wx, promY - .35 * Math.abs(Math.cos(wph)), -1); A(P.walker.limbs, 'd', walk(wph, .9).replace(/M\.5 -10\.6L[^M]*$/, 'M.5 -10.6L-1.6 -8.4'))
      const dx = mod(t * 11 + 260, W + 160) - 80, dph = t * 2 * Math.PI * .7
      place(P.dogman, dx, promY - .3 * Math.abs(Math.cos(dph))); A(P.dogman.limbs, 'd', walk(dph, .8).replace(/M\.5 -10\.6L[^M]*$/, 'M.5 -10.6L2.6 -8.2'))
      const dogX = dx + 11 + 2.5 * Math.sin(t * .55), dt = t * 2 * Math.PI * 2.2
      place(els.dog, dogX, promY)
      A(dogLegs, 'd', `M-2.2 -2.6L${f(-2.2 + Math.sin(dt))} 0M-1.2 -2.6L${f(-1.2 - Math.sin(dt))} 0M1.4 -2.6L${f(1.4 - Math.sin(dt))} 0M2.3 -2.6L${f(2.3 + Math.sin(dt))} 0`)
      A(dogTail, 'd', `M-3.1 -4.3L${f(-4.8 + Math.sin(t * 14) * .7)} ${f(-6.4)}`)
      A(els.leash, 'd', `M${f(dx + 2.6)} ${promY - 8.2}Q${f((dx + dogX) / 2 + 2)} ${promY - 3.5} ${f(dogX + 2.6)} ${promY - 5}`)
      // skater 1 rolls right; ollies once every 40 s
      const s1 = mod(t * 34 + 300, W + 140) - 70, ou = mod(t + 22, 40), air = ou < .55 ? Math.sin(Math.PI * ou / .55) : 0
      const crouch = (ou > 39.7 ? (ou - 39.7) / .3 : 0) + (ou > .45 && ou < .75 ? 1 - Math.abs(ou - .6) / .15 : 0)
      place(P.sk1, s1, promY - 1.1)
      A(P.sk1.b, 'transform', `translate(0 ${f(-air * 8.5 + crouch * 1.2)})`)
      A(P.sk1.board, 'transform', `translate(0 ${f(-air * 9.5 - crouch * 1.2)}) rotate(${f(ou < .55 ? -22 * Math.sin(Math.PI * clamp(ou / .3)) : 0)})`)
      A(P.sk1.limbs, 'd', `M0 -6.4L${f(1.9)} ${f(-3.8 + air * 1.6)}L2.6 -1.4M0 -6.4L-1.4 ${f(-3.9 + air * 1.6)}L-2.6 -1.4M.5 -10.6L3.6 ${f(-8.6 - air * 2)}M.5 -10.6L-3.2 ${f(-9 - air * 2)}`)
      // skater 2 kick-pushes left in threes, then rides
      const cyc = mod(t + 3, 12), pushN = cyc < 5.4 ? Math.floor(cyc / 1.8) : 3, pp = cyc < 5.4 ? (cyc % 1.8) / 1.8 : 0
      const done = pushN + (cyc < 5.4 ? ss(0, .45, pp) : 0)
      const s2 = mod(-(t * 22 + 10 * (Math.floor((t + 3) / 12) * 3 + done - (cyc / 4))) + 1500, W + 140) - 70
      place(P.sk2, s2, promY - 1.1, -1)
      let back
      if (cyc < 5.4) { back = pp < .45 ? [1 - 7 * (pp / .45), 1.1] : [-6 + 7 * ((pp - .45) / .55), 1.1 - 1.8 * Math.sin(Math.PI * (pp - .45) / .55)] }
      else back = [-2.6, -1.4]
      const kn = ik(0, -6.4, back[0], back[1])
      A(P.sk2.limbs, 'd', `M0 -6.4L1.9 -3.8L2.6 -1.4M0 -6.4L${f(kn[0])} ${f(kn[1])}L${f(back[0])} ${f(back[1])}M.5 -10.6L2.8 -7.6M.5 -10.6L-2.2 -7.8`)
      // the cyclist; rear light blinks once it is dusk
      const bx = mod(t * 58 + 1200, W + 200) - 100, cr = t * 2 * Math.PI * 1.1
      place(els.bike, bx, promY)
      const p1 = [.4 + 2.2 * Math.cos(cr), -4.4 + 2.2 * Math.sin(cr)], p2 = [.4 - 2.2 * Math.cos(cr), -4.4 - 2.2 * Math.sin(cr)]
      const k1 = ik(-1.4, -10.4, p1[0], p1[1], 4.3), k2 = ik(-1.4, -10.4, p2[0], p2[1], 4.3)
      A(bikeLegs, 'd', `M-1.4 -10.4L${f(k1[0] + .8)} ${f(k1[1])}L${f(p1[0])} ${f(p1[1])}M-1.4 -10.4L${f(k2[0] + .8)} ${f(k2[1])}L${f(p2[0])} ${f(p2[1])}`)
      A(bikeRear, 'opacity', tod > .55 && (still || mod(t, .5) < .25) ? f(ss(.55, .8, tod)) : '0')

      // moored dinghies nod against the wall, out of step
      els.dinghies.forEach((d, i) => A(d, 'transform', `translate(${els.dx0[i]} ${f(797 + .5 * Math.sin(t * 1.3 + i * 2.1))}) rotate(${f(2.4 * Math.sin(t * 1.1 + i * 1.7))})`))
      // the river: a festooned tour boat heading upstream; a sculler with the current, surging on each stroke
      const boatX = mod(t * 13 + 400, W + 300) - 150
      place(els.boat, boatX, 858)
      A(els.flag, 'd', `M2 -15L${f(-5 + Math.sin(t * 5) * .6)} ${f(-13.6 + Math.sin(t * 6) * .5)}L2 -12.2Z`)
      const sp = mod(t, 2.4) / 2.4, drive = sp < .38, sn = Math.floor(t / 2.4)
      const sx = mod(-(t * 21 + 6 * (sn + ss(0, .38, sp))) + 900, W + 120) - 60
      place(els.scull, sx, 906, -1)
      const sw = drive ? -1 + 2 * (sp / .38) : 1 - 2 * ((sp - .38) / .62), lean = -sw * 2
      A(els.rower, 'd', `M0 -.6L${f(lean)} -5.4`); A(els.rhead, 'transform', `translate(${f(lean * 1.15)} -7)`)
      A(els.oar, 'd', `M${f(lean * .6)} -3.2L${f(-sw * 9)} ${f(drive ? 1 : -1.5)}`)
      els.puds.forEach((pd, i) => {
        const k = sn - i, age = t - (k * 2.4 + .9), px = mod(-((k * 2.4 + .9) * 21 + 6 * (k + 1)) + 900, W + 120) - 60
        A(pd, 'transform', `translate(${f(px + 9)} 907)`); A(pd, 'opacity', age > 0 && age < 4.5 ? f(.45 * (1 - age / 4.5)) : '0')
        A(pd, 'rx', f(2 + age * .8))
      })

      // the train
      const hx2 = head(t), th = hx2 / (6.4 * TS)
      A(els.train, 'transform', `translate(${f(hx2)} ${rail}) scale(${TS})`)
      A(els.rod, 'transform', `translate(${f(2.8 * Math.cos(th))} ${f(2.8 * Math.sin(th))})`)
      const pin = [-26 + 2.8 * Math.cos(th), -6.4 + 2.8 * Math.sin(th)], xh = -12 + 2.8 * Math.cos(th)
      A(els.conrod, 'd', `M${f(xh)} -9.5L${f(pin[0])} ${f(pin[1])}`)
      const fl = still ? .7 : .55 + .35 * Math.abs(wob(t * 9))
      A(els.fire, 'opacity', f(fl * (.5 + .5 * night))); A(els.fireglow, 'opacity', f(fl * .35 * (.3 + .7 * night)))
      // semaphore: drops to clear (with a bounce) before the train enters, returns once it has passed
      const cs = mod(t + PH, PERIOD), clearFrom = PERIOD - 640 / V, clearTo = (70 + T_LEN + 120) / V
      const sinceClear = cs >= clearFrom ? cs - clearFrom : cs < clearTo ? cs + PERIOD - clearFrom : -1
      const sinceDanger = cs >= clearTo && cs < clearFrom ? cs - clearTo : -1
      let ang = 0
      if (sinceClear >= 0) { const p = clamp(sinceClear / .5); ang = 40 * (1 - Math.cos(p * Math.PI) * .5 - .5) + (p >= 1 ? 4 * Math.exp(-(sinceClear - .5) * 6) * Math.sin((sinceClear - .5) * 26) : 0) }
      else if (sinceDanger >= 0) { const p = clamp(sinceDanger / .6); ang = 40 * (1 - p) }
      A(els.arm, 'transform', `translate(70 ${deck - 69}) rotate(${f(ang)})`)
      if (sigLamp) A(els.siglamp, 'fill', ang > 20 ? '#7DFFB4' : '#FF4A3A')
      // two birds on the wire take off as the loco nears, circle, and settle back after the last coach
      for (let i = 0; i < 2; i++) {
        const bx0 = 1402 + i * 13, by0 = wireY(bx0, -9) - 1.2, s1t = (bx0 - 90 + 60) / V + i * .25, s3t = (bx0 + T_LEN + 60) / V + 3.5 + i * .6
        let x = bx0, y = by0, fly = false
        if (cs > s1t && cs < s3t) {
          const u = (cs - s1t) / (s3t - s1t); fly = true
          x = bx0 + 70 * Math.sin(u * Math.PI * 2) * (1 - u) - 30 * Math.sin(u * Math.PI) - i * 10 * Math.sin(u * Math.PI)
          y = by0 - 95 * Math.sin(u * Math.PI) ** .7 + 12 * Math.sin(u * Math.PI * 4) * Math.sin(u * Math.PI)
          if (u > .9) fly = Math.sin(t * 30) > -.2
        }
        if (fly) { const w = Math.sin(t * 22 + i * 2); A(els.wb[i], 'd', `M${f(x - 3.6)} ${f(y - 1 + w * 2)}Q${f(x - 1.6)} ${f(y - 1.4 - w)} ${f(x)} ${f(y)}Q${f(x + 1.6)} ${f(y - 1.4 - w)} ${f(x + 3.6)} ${f(y - 1 + w * 2)}L${f(x)} ${f(y + .8)}Z`) }
        else { const turn = Math.sin(t * .7 + i * 3) > .6 ? -1 : 1; A(els.wb[i], 'd', `M${f(x - 2.2 * turn)} ${f(y - 1.6)}Q${f(x)} ${f(y - 3.4)} ${f(x + 2.2 * turn)} ${f(y - 1.6)}L${f(x + 3.4 * turn)} ${f(y - 1.2)}L${f(x + 2 * turn)} ${f(y - .6)}Q${f(x)} ${f(y + .6)} ${f(x - 3.2 * turn)} ${f(y + .2)}Z`) }
      }

      // steam: choo-choo pairs every 1.15 s from the chimney, cylinder-cock wisps low at the front, one whistle mid-crossing
      const S = SC.x
      S.setTransform(1, 0, 0, 1, 0, 0); S.clearRect(0, 0, SC.c.width, SC.c.height); S.setTransform(K, 0, 0, K, BX * K, -SC.y0 * K)
      const puffs = [], CH = 1.1, SLOT = [[0, 1], [.27, .86], [.46, .34], [.63, .3], [.8, .3], [.95, .32]]
      for (let n = Math.floor((t - 7) / CH); n <= Math.floor(t / CH); n++) SLOT.forEach(([o, size], j) => {
        const te = n * CH + o, life = j < 2 ? 6.8 : 3.6, a = t - te
        if (a < 0 || a > life) return
        const hx = head(te), cx = hx - 15 * TS
        if (cx < -40 || cx > W + 60) return
        puffs.push([cx, rail - 44.5 * TS, a, n * 7 + j, size, life, j < 2 ? 1 : 0])
        if (j === 0 && a < 1.4) puffs.push([hx - 8 * TS, rail - 7 * TS, a, n * 3 + 7, .42, 1.4, 2])
      })
      const wt = Math.floor((t + PH) / PERIOD) * PERIOD - PH + 1110 / V
      for (let j = 0; j < 7; j++) { const te = wt + j * .1, a = t - te; if (a >= 0 && a < 2.6) puffs.push([head(te) - 57 * TS, rail - 50 * TS, a, j + 99, .5, 2.6, 3]) }
      for (const [x0, y0, a, k, size, life, kind] of puffs.sort((p, q) => q[2] - p[2])) {
        const ease = Math.min(1, a / 1.5)
        let x = x0 + (kind === 2 ? V * .5 : V) * .4 * (1 - Math.exp(-a / .4)) + WIND * a + (7 * Math.sin(a * .9 + k) + 4 * Math.sin(a * 2.1 + k * 1.7)) * ease
        let y = y0 - (kind === 3 ? 56 : 26 * size + 8) * (1 - Math.exp(-a / .35)) - (kind === 2 ? 3 : 14) * a
        if (kind === 2) { x += (hash(k) - .25) * 14 * Math.sqrt(a); y += 3 * Math.sqrt(a) }
        const r = kind === 2 ? 3 + 9 * Math.sqrt(a) : kind === 3 ? 2.5 + 8 * Math.sqrt(a) : (4.5 + 19 * Math.sqrt(a)) * Math.sqrt(size)
        const al = Math.pow(1 - a / life, 1.8) * Math.min(1, a / .08) * (kind === 2 ? .5 : kind === 3 ? .95 : kind === 1 ? .8 : .36)
        S.globalAlpha = al * .7; S.drawImage(steamShade, x - r * 1.1, y - r * .95, r * 2.2, r * 2.2)
        S.globalAlpha = al; S.drawImage(steamLit, x - r * .78 + r * .12, y - r * .92, r * 1.7, r * 1.7)
        if (night > 0 && kind === 1 && a < 1.6) { S.globalAlpha = al * night * .45 * (1 - a / 1.6); S.drawImage(steamFire, x - r * .8, y - r * .3, r * 1.6, r * 1.3) }
        if (kind === 1) for (let L = 0; L < 3; L++) {
          const an = k * 1.9 + L * 2.1, lr = r * (.5 + .15 * L), lx = x + Math.cos(an) * r * .55, ly = y + Math.sin(an) * r * .4 - r * .1
          S.globalAlpha = al * .55; S.drawImage(L === 2 ? steamShade : steamLit, lx - lr, ly - lr, lr * 2, lr * 2)
        }
      }
      S.globalAlpha = 1

      // glints on the river
      const G = GC.x
      G.setTransform(1, 0, 0, 1, 0, 0); G.clearRect(0, 0, GC.c.width, GC.c.height); G.setTransform(K, 0, 0, K, BX * K, -GC.y0 * K)
      for (const g of glints) {
        const amp = gAmp[g.kind]; if (amp <= 0) continue
        const v = Math.sin(t * g.fr + g.ph), a = (still ? .35 : Math.max(0, v) ** 5) * amp
        if (a < .02) continue
        const x = g.kind === 0 ? mod(g.x - t * 5, W) : g.x + Math.sin(t * .9 + g.ph) * 2
        G.globalAlpha = a; G.fillStyle = gCol[g.kind]; G.fillRect(x - g.len / 2, g.y, g.len, g.th)
      }
      G.globalAlpha = 1
    }
    root._scSat.frame = frame
    frame(PRINT_T, true)
  }

  document.querySelectorAll('.sc-saturday').forEach(build)
  ;(window.Pack = window.Pack || {}).saturday = { build, PRINT_T }
})()
