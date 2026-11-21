// "Years over the canopy": one valley of forested karst hills (Surat Thani), painted at a different hour on every slide,
// morning on the intro into night on the appendix. Same geography, same seeds; only the light changes.
//   node src/scenes/gen.mjs   → src/scenes/sN-far.svg (sun/moon, stars, karst towers), sN-near.svg (two canopy ridges),
//                               sN-cu.svg (drifting clouds tile), sN-mist.svg (drifting mist tile), grain.svg
// Cloud shapes are ported from the tftf "Saturday evening" generator. Deterministic; no bitmaps.
// Sky gradients live in theme.css (--zN --mN --lN --hN); keep the colours below in step with them.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const W = 1920, H = 1080
const OUT = dirname(fileURLToPath(import.meta.url))
const f0 = n => String(Math.round(n))
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const uni = (r, a, b) => a + (b - a) * r()
const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>${defs}</defs>${body}</svg>\n`

const FILTERS = seed => `<filter id="cf" x="-10%" y="-80%" width="120%" height="260%"><feTurbulence type="fractalNoise" baseFrequency=".007 .03" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="26" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3.2"/></filter>`
  + '<filter id="ch" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="26"/></filter>'
  + `<filter id="cr" x="-10%" y="-200%" width="120%" height="500%"><feTurbulence type="fractalNoise" baseFrequency=".01 .08" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.2"/></filter>`
  + `<filter id="cu" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="11" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.4"/></filter>`
  + '<filter id="cb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>'
  + '<filter id="lf" x="-2%" y="-20%" width="104%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03 .05" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".6"/></filter>'
  + '<filter id="mi" x="-5%" y="-100%" width="110%" height="300%"><feTurbulence type="fractalNoise" baseFrequency=".004 .04" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="40" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="14"/></filter>'
 + '<filter id="sb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>'
  + '<filter id="gm" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>'
  + '<filter id="gl" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>'

// ---------- clouds (from tftf) ----------
function streak(id, { cx, cy, w, h, top, under, rim, op = 1, seed = 1, lumps = 7 }) {
  const r = rng(seed)
  const set = (x, ww, hh, n) => {
    let s = ''
    for (let k = 0; k < n; k++) {
      const t = (k + .5) / n, ex = x - ww / 2 + t * ww + uni(r, -ww * .03, ww * .03)
      const eh = hh * (.3 + .7 * Math.sin(Math.PI * t) ** .8) * uni(r, .7, 1.1), ew = ww / n * uni(r, .8, 1.35)
      s += `<ellipse cx="${f0(ex)}" cy="${f0(cy - eh * .5)}" rx="${f0(ew)}" ry="${f0(eh * .5)}"/>`
    }
    return s + `<ellipse cx="${f0(x)}" cy="${f0(cy - hh * .1)}" rx="${f0(ww * .5)}" ry="${f0(hh * .12)}"/>`
  }
  const defs = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f0(cy - h)}" x2="0" y2="${f0(cy)}"><stop offset=".5" stop-color="${top}"/><stop offset="1" stop-color="${under}"/></linearGradient>`
  const body = `<g opacity="${op}"><ellipse cx="${cx}" cy="${f0(cy - h * .3)}" rx="${f0(w * .55)}" ry="${f0(h * .9)}" fill="${under}" opacity=".28" filter="url(#ch)"/>`
    + `<g fill="url(#${id})" filter="url(#cf)">${set(cx, w, h, lumps)}</g>`
    + `<g fill="${top}" opacity=".45" filter="url(#cf)">${set(cx + w * .04, w * .7, h * .7, Math.max(3, lumps - 2))}</g>`
    + `<ellipse cx="${f0(cx + w * .02)}" cy="${f0(cy - h * .06)}" rx="${f0(w * .44)}" ry="${f0(Math.max(3, h * .07))}" fill="${rim}" opacity=".9" filter="url(#cr)"/></g>`
  return [defs, body]
}
function cumulus(id, { cx, base, w, h, top, under, lit, rim, op = 1, seed = 1 }) {
  const r = rng(seed), lobes = [], rows = 5
  for (let j = 0; j < rows; j++) {
    const t = j / (rows - 1), span = w * (1 - .62 * t) * uni(r, .9, 1.02)
    const n = Math.max(1, Math.round((6 - 4.4 * t) * uni(r, .9, 1.15))), rad = (h * (.24 - .04 * t)) * uni(r, .85, 1.15)
    for (let k = 0; k < n; k++) {
      const u = n === 1 ? .5 : k / (n - 1)
      const x = cx - span / 2 + u * span + uni(r, -rad * .25, rad * .25) + w * .06 * t * (r() - .3)
      const rr = rad * (n === 1 ? 1.1 : (.75 + .45 * Math.sin(Math.PI * (u * .9 + .05)))) * uni(r, .85, 1.1)
      const y = base - rr * .55 - t * (h - rad * 1.5) + uni(r, -rad * .12, rad * .12)
      lobes.push([x, Math.min(y, base - rr * .45), rr])
    }
  }
  const xs = lobes.filter(([, y]) => y > base - h * .4).map(([x]) => x), x0 = Math.min(...xs), x1 = Math.max(...xs)
  const circles = lobes.map(([x, y, rr]) => `<circle cx="${f0(x)}" cy="${f0(y)}" r="${f0(rr)}"/>`).join('')
    + `<rect x="${f0(x0)}" y="${f0(base - h * .3)}" width="${f0(x1 - x0)}" height="${f0(h * .3)}"/><ellipse cx="${f0(cx)}" cy="${f0(base - h * .42)}" rx="${f0(w * .36)}" ry="${f0(h * .36)}"/>`
  const top0 = Math.min(...lobes.map(([, y, rr]) => y - rr))
  const defs = `<clipPath id="${id}c"><rect x="${f0(cx - w)}" y="0" width="${f0(2 * w)}" height="${f0(base)}"/></clipPath><clipPath id="${id}k">${circles}</clipPath>`
    + `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f0(top0)}" x2="0" y2="${f0(base)}"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${top}"/><stop offset="1" stop-color="${under}"/></linearGradient>`
  const glows = lobes.filter(([, y]) => y > base - h * .62).map(([x, y, rr]) => `<ellipse cx="${f0(x)}" cy="${f0(y + rr * .7)}" rx="${f0(rr * 1.05)}" ry="${f0(rr * .5)}"/>`).join('')
  const body = `<g opacity="${op}"><ellipse cx="${f0(cx)}" cy="${f0(base - h * .35)}" rx="${f0(w * .62)}" ry="${f0(h * .62)}" fill="${under}" opacity=".26" filter="url(#ch)"/>`
    + `<g filter="url(#cu)"><g clip-path="url(#${id}c)"><g clip-path="url(#${id}k)"><rect x="${f0(cx - w)}" y="${f0(top0)}" width="${f0(2 * w)}" height="${f0(base - top0)}" fill="url(#${id})"/>`
    + `<g fill="${lit}" opacity=".55" filter="url(#cb)">${glows}</g><rect x="${f0(cx - w)}" y="${f0(base - h * .16)}" width="${f0(2 * w)}" height="${f0(h * .16)}" fill="${under}" opacity=".7" filter="url(#cb)"/></g></g></g>`
    + `<ellipse cx="${f0(cx)}" cy="${f0(base - 4)}" rx="${f0(w * .3)}" ry="${f0(Math.max(4, h * .025))}" fill="${rim}" opacity=".8" filter="url(#cr)"/></g>`
  return [defs, body]
}
// a seamless 1920-wide tile: every shape drawn at x − W, x, x + W
const tile = (seed, defs, body) => svg(FILTERS(seed) + defs + `<g id="c">${body}</g>`, `<use href="#c" x="${-W}"/><use href="#c"/><use href="#c" x="${W}"/>`)
const cloudTile = (seed, specs) => {
  let d = '', b = ''
  specs.forEach(([kind, s], i) => { const [dd, bb] = (kind === 'cu' ? cumulus : streak)(`k${i}`, s); d += dd; b += bb })
  return tile(seed, d, b)
}

// ---------- mist: long soft bands that lie in the valley between the karst towers and the canopy ----------
function mistTile(bands, color) {
  const r = rng(77)
  let b = ''
  for (const [y, h, op] of bands) {
    for (let x = 0; x < W; x += 320) {
      const w = uni(r, 420, 760), yy = y + uni(r, -h * .3, h * .3)
      b += `<ellipse cx="${f0(x + uni(r, 0, 200))}" cy="${f0(yy)}" rx="${f0(w / 2)}" ry="${f0(h * uni(r, .5, .9))}" opacity="${(op * uni(r, .6, 1)).toFixed(2)}"/>`
    }
  }
  return tile(5, '', `<g fill="${color}" filter="url(#mi)">${b}</g>`)
}

// ---------- land ----------
// karst towers: steep-sided limestone towers with ragged, leaning tops and a cap of trees
function karst(baseY, peaks, fill, haze, seed) {
  const r = rng(seed)
  let paths = '', crowns = ''
  for (const [cx, w, h] of peaks) {
    const pts = [], steep = uni(r, 2.4, 4.2), lean = uni(r, -.18, .18), n = 48
    const bumps = [[uni(r, 2, 4), uni(r, 0, 6.3), uni(r, .03, .07)], [uni(r, 5, 9), uni(r, 0, 6.3), uni(r, .015, .035)]]
    for (let k = 0; k <= n; k++) {
      const u = k / n * 2 - 1, uu = u - lean * (1 - u * u)
      const prof = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(uu), steep)), .42)
      const rough = bumps.reduce((a, [f, ph, amp]) => a + amp * Math.sin(u * f * 3.14 + ph), 0)
      pts.push([cx + u * w / 2, baseY - h * prof * (1 + rough) + uni(r, -2, 2)])
    }
    paths += `<path d="M${f0(cx - w / 2 - 6)} ${H}L${pts.map(p => `${f0(p[0])} ${f0(p[1])}`).join('L')}L${f0(cx + w / 2 + 6)} ${H}Z"/>`
    for (let k = 6; k < n - 5; k++) { const [x, y] = pts[k]; if (r() < .55) crowns += `<circle cx="${f0(x)}" cy="${f0(y + 3)}" r="${f0(uni(r, 3, 8))}"/>` }
  }
  const id = `kg${seed}`
  return [`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f0(baseY - 340)}" x2="0" y2="${f0(baseY + 30)}"><stop offset="0" stop-color="${fill}"/><stop offset="1" stop-color="${haze}"/></linearGradient>`,
    `<g fill="url(#${id})" filter="url(#lf)">${paths}${crowns}</g>`]
}
// a canopy ridge: a rolling hill whose skyline is a crowd of tree crowns; a darker tier behind, lit tufts on top
function canopy(y, waves, { fill, lit, shade, seed, rmin, rmax, litOp = .5 }) {
  const r = rng(seed), phase = waves.map(() => uni(r, 0, 6.28))
  const ridge = x => y + waves.reduce((s, [a, f], i) => s + a * Math.sin(x / W * f * 6.283 + phase[i]), 0)
  let d = `M-40 ${H + 20}`
  for (let x = -40; x <= W + 40; x += 24) d += `L${f0(x)} ${f0(ridge(x) + rmin * .2)}`
  d += `L${W + 40} ${H + 20}Z`
  let back = '', crowns = '', hi = '', deep = ''
  for (let x = -30; x <= W + 30;) {
    const rr = uni(r, rmin, rmax) * (r() < .12 ? 1.45 : 1), cy = ridge(x) - rr * uni(r, .05, .6)
    back += `<circle cx="${f0(x + rr * .6)}" cy="${f0(cy - rr * .25)}" r="${f0(rr * .9)}"/>`
    crowns += `<circle cx="${f0(x)}" cy="${f0(cy)}" r="${f0(rr)}"/>`
    for (let j = 0; j < 3; j++) hi += `<circle cx="${f0(x - rr * uni(r, .1, .5))}" cy="${f0(cy - rr * uni(r, .25, .6))}" r="${f0(rr * uni(r, .18, .32))}"/>`
    for (let j = 0; j < 2; j++) { const yy = cy + rr * uni(r, 1.4, 4.2); deep += `<ellipse cx="${f0(x + uni(r, -rr, rr))}" cy="${f0(yy)}" rx="${f0(rr * uni(r, .7, 1.1))}" ry="${f0(rr * uni(r, .35, .6))}"/>` }
    x += rr * uni(r, .9, 1.4)
  }
  return ['', `<g filter="url(#lf)"><g fill="${shade}">${back}</g><g fill="${fill}"><path d="${d}"/>${crowns}</g><g fill="${shade}" opacity=".32" filter="url(#sb)">${deep}</g><g fill="${lit}" opacity="${litOp}" filter="url(#sb)">${hi}</g></g>`]
}
function stars(n, seed, y0, y1, color = '#FFF6DE') {
  const r = rng(seed)
  let s = ''
  for (let k = 0; k < n; k++) s += `<circle cx="${f0(uni(r, 0, W))}" cy="${f0(uni(r, y0, y1))}" r="${[.9, 1.1, 1.3, 1.6, 2][Math.floor(r() * 5)]}" fill="${color}" opacity="${uni(r, .35, .9).toFixed(2)}"/>`
  return s
}
const orb = (x, y, rad, c, halo, op = 1) => `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="${rad * 6}" fill="${halo}" opacity=".22" filter="url(#gl)"/><circle cx="${x}" cy="${y}" r="${rad * 2.4}" fill="${halo}" opacity=".35" filter="url(#gm)"/><circle cx="${x}" cy="${y}" r="${rad}" fill="${c}"/></g>`

// ---------- the valley at nine hours ----------
// One geography: the same karst towers and ridges on every slide. drop moves the land down on busy slides.
const BACK = [[40, 170, 150], [250, 150, 120], [430, 210, 95], [700, 160, 70], [1180, 190, 80], [1330, 150, 110], [1500, 180, 140], [1700, 160, 120], [1880, 200, 160]]
const FRONT = [[110, 190, 300], [300, 130, 210], [470, 170, 150], [1420, 150, 180], [1610, 210, 330], [1790, 140, 240]]
const H_ = {
  //      sun/moon [x, y, r, core, halo, op]          karst fill, haze          mid ridge [fill, lit, shade]             near ridge [fill, lit, shade]           mist [colour, op]   clouds
  s0: { orb: [1460, 770, 30, '#FFF7E4', '#FFE3B8'], k: ['#A9C6B6', '#EBDCC2'], m: ['#8DB898', '#C3DDB4', '#6E9F80'], n: ['#5E9873', '#93C08F', '#467E5C'], mist: ['#FFF5E6', .85], drop: 0,
    cl: [['cu', { cx: 1600, base: 330, w: 520, h: 250, top: '#E9F0EA', under: '#FBE6CC', lit: '#FFF1DA', rim: '#FFF8EA', op: .75, seed: 2 }], ['st', { cx: 420, cy: 250, w: 620, h: 40, top: '#EDF1E6', under: '#FAE4CB', rim: '#FFF2DE', op: .6, seed: 7, lumps: 6 }]] },
  s1: { orb: [1700, 230, 26, '#FFF8E8', '#FFE7C0', .8], k: ['#A4C1AB', '#EED6B4'], m: ['#82AF8A', '#BCD8A6', '#669873'], n: ['#548E66', '#8CBC84', '#3F7553'], mist: ['#FFF3E0', .75], drop: 70,
    cl: [['cu', { cx: 1640, base: 300, w: 420, h: 200, top: '#EEEFE2', under: '#F9DDBC', lit: '#FFECCF', rim: '#FFF5E2', op: .7, seed: 14 }], ['st', { cx: 900, cy: 470, w: 760, h: 50, top: '#F1EDE0', under: '#F7D8B6', rim: '#FFEFD8', op: .45, seed: 11, lumps: 8 }]] },
  s2: { orb: [1640, 210, 24, '#FFF4DC', '#FFDDAE', .7], k: ['#B6B996', '#EBCDA6'], m: ['#93A372', '#C5CF92', '#76875C'], n: ['#64824F', '#9CB474', '#4E6A40'], mist: ['#FFEBD2', .65], drop: 90,
    cl: [['cu', { cx: 1660, base: 250, w: 400, h: 180, top: '#F2E6D6', under: '#F4C9A0', lit: '#FFE0BC', rim: '#FFEACC', op: .7, seed: 21 }]] },
  s3: { orb: [1700, 520, 26, '#FFEFD0', '#FFC98E', .8], k: ['#C2A08A', '#E6B593'], m: ['#9A8C62', '#D0B47E', '#7C7150'], n: ['#686B45', '#A39A62', '#52573A'], mist: ['#FFE0C0', .6], drop: 110,
    cl: [['cu', { cx: 1700, base: 210, w: 380, h: 160, top: '#EED2BC', under: '#EDAE88', lit: '#FFD0A0', rim: '#FFDCB4', op: .7, seed: 31 }]] },
  s4: { orb: [1500, 880, 34, '#FFE6C0', '#FFB27A', .95], k: ['#A47C88', '#D49A8C'], m: ['#7D6A72', '#C08A7E', '#62555F'], n: ['#534D5B', '#91707A', '#423E4D'], mist: ['#F6C2A6', .55], drop: 60,
    cl: [['cu', { cx: 1660, base: 220, w: 420, h: 170, top: '#C9A2A6', under: '#F0A889', lit: '#FFC59C', rim: '#FFD3A8', op: .7, seed: 41 }], ['st', { cx: 1150, cy: 420, w: 700, h: 40, top: '#C79CA4', under: '#EBA08A', rim: '#FFC69E', op: .5, seed: 42, lumps: 7 }]] },
  s5: { orb: null, k: ['#614C7A', '#8A6588'], m: ['#4A3F6C', '#7A5C80', '#3D355E'], n: ['#33305C', '#584A75', '#2A2850'], mist: ['#B48AA2', .35], drop: 120,
    cl: [['cu', { cx: 1660, base: 200, w: 380, h: 140, top: '#6E5A8C', under: '#B27F98', lit: '#D49A9E', rim: '#DDA4A2', op: .55, seed: 51 }]] },
  s6: { orb: null, k: ['#3F3870', '#544883'], m: ['#302D60', '#4A4278', '#28265A'], n: ['#23224E', '#38346A', '#1D1C46'], mist: ['#7D6FA6', .25], drop: 130, st: [14, 0, 300],
    cl: [['st', { cx: 1500, cy: 240, w: 560, h: 30, top: '#4B4683', under: '#7C6A9C', rim: '#9E86AE', op: .4, seed: 61, lumps: 6 }]] },
  s7: { orb: [1510, 150, 20, '#FFF8E6', '#DCD6FF', .9], k: ['#2A2960', '#34336E'], m: ['#211F52', '#322F68', '#1B1A48'], n: ['#191843', '#28265A', '#14133B'], mist: ['#5C5794', .22], drop: 0, st: [70, 0, 640], cl: [] },
  s8: { orb: null, k: ['#22224F', '#2A2A5C'], m: ['#1C1B47', '#26245A', '#17163F'], n: ['#15153C', '#1F1E4E', '#121236'], mist: ['#4B4782', .18], drop: 180, st: [60, 0, 900], cl: [] },
}

const mixc = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')
const out = {}
for (const [k, s] of Object.entries(H_)) {
  const dy = s.drop
  const sky = (s.st ? stars(s.st[0], 41, s.st[1], s.st[2]) : '') + (s.orb ? orb(...s.orb.slice(0, 5), s.orb[5] ?? 1) : '')
  const [kdB, kbB] = karst(830 + dy, BACK, mixc(s.k[0], s.k[1], .45), s.k[1], 3), [kdF, kbF] = karst(860 + dy, FRONT, s.k[0], s.k[1], 4)
  out[`${k}-far`] = svg(FILTERS(1) + kdB + kdF, sky + kbB + kbF)
  const [, mb] = canopy(880 + dy, [[18, 1.3], [9, 3.4]], { fill: s.m[0], lit: s.m[1], shade: s.m[2], seed: 11, rmin: 10, rmax: 19, litOp: .45 })
  const [, nb] = canopy(970 + dy, [[24, .9], [10, 2.6]], { fill: s.n[0], lit: s.n[1], shade: s.n[2], seed: 12, rmin: 18, rmax: 34, litOp: .5 })
  out[`${k}-near`] = svg(FILTERS(1), mb + nb)
  out[`${k}-mist`] = mistTile([[860 + dy, 26, s.mist[1]], [930 + dy, 18, s.mist[1] * .7]], s.mist[0])
  if (s.cl.length) out[`${k}-cu`] = cloudTile(3, s.cl)
}
out.grain = '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1"/></filter><rect width="260" height="260" filter="url(#n)"/></svg>\n'
for (const [k, v] of Object.entries(out)) writeFileSync(join(OUT, `${k}.svg`), v)
console.log(`scenes: ${Object.keys(out).length} files → ${OUT}`)
