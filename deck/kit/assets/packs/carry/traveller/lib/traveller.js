/* Pack "traveller" (carry) · one object that travels across the deck: it rests at a spot on each slide, and on a
   forward change it flies (or hops, or rolls) from the previous slide's spot to the new one. window.Pack.traveller.

   Pack.traveller.object({ preset, svg, kind, color, z, trail, shadow, hover })     optional, once
     colours  from each slide's --brand (the paper / box / ball), --brand-2 (accent: tape, stripes) and --field (fold
              shading, shadow), set as --cy-tr-paper, -hi, -far, -fold, -fold-2, -crease, -accent, -trail, -shadow on
              the overlay; the paper is pushed toward --ink-auto when it would vanish on the field. color: a fixed paper.
     preset  'plane' (default: a white paper plane, kind 'fly') · 'parcel' (a taped box, kind 'hop') · 'ball' ('roll')
     svg     your own object instead: markup drawn around (0, 0), facing +x, about 170 px wide ({id} → a unique id);
             sh: [rx, ry] its shadow size (default [60, 11])
     kind    'fly': an arc with a little anticipation (pulls back, noses up), banks along the path, overshoots and
                    settles; turns round (a quick flip) when the next spot is behind it; leaves a dotted trail
             'hop': bounces there in hops, a quarter tumble each, squashes on landing, kicks up dust
             'roll': rolls along its ground line, rotating by the distance travelled, overshoots and rolls back
     z       z-index over the content (default 30); hover: idle bob amplitude px (default 5; 0 = still)
   Pack.traveller.spot(id, { x, y, rot, scale, ground, face, lift, loop })   where it rests on slide `id`
     x, y     stage px of the object's centre · rot: resting angle (deg, default −4) · scale (default 1)
     ground   y of the surface its shadow falls on (default y + 150: it floats; put it on a card's top edge to cast
              onto the card) · face: 1 / −1 resting direction (default: the direction it arrived from)
     lift     arc height px (default from the distance) · loop: true → one loop-the-loop on the way here ('fly')
   The overlay (<div class="cy-tr">) is created on the slide; nothing else is needed in the slide's HTML.

   Motion (taste.md §11, the carry exception): content cuts; on a FORWARD step from a slide with a spot the object
   travels from where it is to the new spot, done by 1.15 s (the trail is gone by 1.2 s). First arrival (fresh load,
   or from a slide without a spot): it flies in from off the left edge. Backward, jumps, reduced motion and print:
   it simply rests at its spot (print: every slide shows it at its own spot, facing the way it came). Idle: a slow
   hover bob on Deck.clock, its shadow breathing with it. */
;(() => {
  const PK = (window.Pack = window.Pack || {})
  if (PK.traveller) return
  const NS = 'http://www.w3.org/2000/svg', TAU = Math.PI * 2, END = 1.15
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
  const ease = q => q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2
  const lerp = (a, b, t) => a + (b - a) * t
  const f1 = v => (+v).toFixed(1)
  /* ---------- colour: parse, contrast, mix in OKLab ---------- */
  const cx0 = document.createElement('canvas').getContext('2d')
  const rgb = s => { if (!s) return null; s = String(s).trim(); cx0.fillStyle = '#010203'; cx0.fillStyle = s; const v = cx0.fillStyle; if (v === '#010203' && !/^#010203$/i.test(s)) return null; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)); const m = v.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null }
  const COLOR_RE = /#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch|oklab|lab|lch|color)a?\([^()]*\)/gi
  const avg = s => { const cs = (String(s || '').match(COLOR_RE) || [s]).map(rgb).filter(Boolean); return cs.length ? [0, 1, 2].map(j => cs.reduce((a, c) => a + c[j], 0) / cs.length) : null }
  const lin = c => (c /= 255) <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
  const lum = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2])
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) }
  const lab = c => { const [r, g, b] = c.map(lin), l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), q = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b); return [.2104542553 * l + .793617785 * m - .0040720468 * q, 1.9779984951 * l - 2.428592205 * m + .4505937099 * q, .0259040371 * l + .7827717662 * m - .808675766 * q] }
  const srgb = c => 255 * (c <= .0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - .055)
  const unlab = ([L, a, b]) => { const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, q = (L - .0894841775 * a - 1.291485548 * b) ** 3; return [4.0767416621 * l - 3.3077115913 * m + .2309699292 * q, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * q, -.0041960863 * l - .7034186147 * m + 1.707614701 * q].map(v => clamp(srgb(Math.max(0, v)), 0, 255)) }
  const mixc = (a, b, t) => { const A = lab(a), B = lab(b); return unlab(A.map((v, i) => v + (B[i] - v) * t)) }
  const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  /* push a colour toward the ink until it reads on the field */
  const guard = (c, field, ink, min = 2.2) => { let t = 0, o = c; while (contrast(o, field) < min && t < 1) { t += .12; o = mixc(c, ink, t) } return o }
  /* the object's colours, per slide: paper = --brand (pushed toward the ink if it would vanish on --field), its folds
     shaded toward the field, accent = --brand-2; set as CSS vars on the overlay so any object svg can use them */
  function paint(id, root) {
    const cs = getComputedStyle(document.getElementById(id)), v = k => cs.getPropertyValue(k).trim()
    const field = avg(v('--field')) || avg(v('--f0')) || [58, 63, 204], dark = lum(field) < .3
    const ink = rgb(v('--ink-auto')) || (dark ? [255, 255, 255] : [20, 22, 30])
    const paper = guard(rgb(obj.color) || rgb(v('--brand')) || [255, 255, 255], field, ink, 2.6)
    const accent = guard(rgb(v('--brand-2')) || ink, paper, mixc(paper, [0, 0, 0], .8), 1.8)
    const set = (k, c) => root.style.setProperty(k, hex(c))
    set('--cy-tr-paper', paper); set('--cy-tr-hi', mixc(paper, [255, 255, 255], .1)); set('--cy-tr-far', mixc(paper, field, .16))
    set('--cy-tr-fold', mixc(mixc(paper, field, .3), [0, 0, 0], .1)); set('--cy-tr-fold-2', mixc(mixc(paper, field, .48), [0, 0, 0], .18))
    set('--cy-tr-crease', mixc(paper, field, .6)); set('--cy-tr-accent', accent); set('--cy-tr-trail', mixc(paper, field, .08))
    set('--cy-tr-shadow', mixc(field, [0, 0, 0], dark ? .75 : .6))
  }

  const PRESETS = {
    plane: { kind: 'fly', sh: [74, 12], svg: `<path d="M86 4-62-56-30 6Z" style="fill:var(--cy-tr-far)"/>
      <path d="M86 4-30 6-52 36Z" style="fill:var(--cy-tr-fold)"/><path d="M86 4-30 6-40 19Z" style="fill:var(--cy-tr-fold-2)"/>
      <path d="M86 4-82-38-30 6Z" style="fill:var(--cy-tr-paper)"/><path d="M86 4-82-38-64-22Z" style="fill:var(--cy-tr-hi)"/>
      <path d="M86 4-30 6" style="stroke:var(--cy-tr-crease)" stroke-opacity=".5" stroke-width="1.2" fill="none"/>` },
    parcel: { kind: 'hop', sh: [56, 10], svg: `<rect x="-42" y="-34" width="84" height="68" rx="6" style="fill:var(--cy-tr-paper)"/><rect x="-42" y="-34" width="84" height="17" rx="6" style="fill:var(--cy-tr-hi)"/>
      <rect x="-42" y="12" width="84" height="22" rx="6" style="fill:var(--cy-tr-fold)" fill-opacity=".55"/>
      <rect x="-8" y="-34" width="16" height="68" style="fill:var(--cy-tr-accent)"/><rect x="15" y="4" width="20" height="15" rx="2" style="fill:var(--cy-tr-far)"/>` },
    ball: { kind: 'roll', sh: [34, 7], svg: `<circle r="30" style="fill:var(--cy-tr-paper)"/><path d="M-30 0a30 30 0 0 0 60 0" style="fill:var(--cy-tr-fold)"/><path d="M0-30v60M-30 0h60" style="stroke:var(--cy-tr-accent)" stroke-width="4"/><circle cx="-10" cy="-12" r="7" style="fill:var(--cy-tr-hi)" fill-opacity=".5"/>` },
  }
  const obj = { preset: 'plane', z: 30, trail: true, shadow: true, hover: 5 }
  const spots = {}, views = {}, order = () => [...document.querySelectorAll('section.slide')]
  let curId = null, live = null, fl = null

  /* ---------- poses ---------- */
  const kindOf = () => obj.kind ?? PRESETS[obj.preset]?.kind ?? 'fly'
  const prevSpotId = id => { const L = order(), i = L.findIndex(s => s.id === id); return i > 0 && spots[L[i - 1].id] ? L[i - 1].id : null }
  function pose(id) {
    const s = spots[id], pid = prevSpotId(id), p = pid ? spots[pid] : null
    const face = s.face ?? (p ? (Math.sign(s.x - p.x) || 1) : 1)
    return { x: s.x, y: s.y, rot: s.rot ?? (kindOf() === 'fly' ? -4 : 0), sc: s.scale ?? 1, face, ground: s.ground ?? s.y + (kindOf() === 'fly' ? 150 : 38), spin: 0 }
  }

  /* ---------- the overlay on each slide ---------- */
  function mount(id) {
    const v = views[id]
    if (v.obj) return v
    const P = PRESETS[obj.preset] ?? PRESETS.plane, svg = (obj.svg ?? P.svg).replaceAll('{id}', id)
    v.root.style.zIndex = obj.z
    paint(id, v.root)
    v.root.innerHTML = `<svg viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs><radialGradient id="cy-tr-sh-${id}"><stop offset="0" style="stop-color:var(--cy-tr-shadow)" stop-opacity=".6"/><stop offset=".6" style="stop-color:var(--cy-tr-shadow)" stop-opacity=".24"/><stop offset="1" style="stop-color:var(--cy-tr-shadow)" stop-opacity="0"/></radialGradient></defs>
      <g class="cy-tr-trail" style="fill:var(--cy-tr-trail)"></g>
      <ellipse class="cy-tr-shadow" rx="62" ry="11" fill="url(#cy-tr-sh-${id})"/>
      <g class="cy-tr-obj"><g class="cy-tr-body">${svg}</g></g></svg>`
    v.trail = v.root.querySelector('.cy-tr-trail'); v.shadow = v.root.querySelector('.cy-tr-shadow'); v.obj = v.root.querySelector('.cy-tr-obj')
    v.sh = obj.sh ?? (obj.svg ? [60, 11] : P.sh)
    if (obj.shadow === false) v.shadow.style.display = 'none'
    return v
  }
  function draw(v, q) {   /* q = { x, y, rot, sc, face, sqx, sqy, ground, spin } */
    v.obj.setAttribute('transform', `translate(${f1(q.x)} ${f1(q.y)}) scale(${(q.face * q.sc * (q.sqx ?? 1)).toFixed(4)} ${(q.sc * (q.sqy ?? 1)).toFixed(4)}) rotate(${f1(q.rot + (q.spin ?? 0))})`)
    const alt = Math.max(0, q.ground - q.y), k = 1 / (1 + alt / 300)
    v.shadow.setAttribute('cx', f1(q.sx ?? q.x)); v.shadow.setAttribute('cy', f1(q.ground))
    v.shadow.setAttribute('rx', f1(v.sh[0] * q.sc * k * (q.sqx ?? 1))); v.shadow.setAttribute('ry', f1(v.sh[1] * q.sc * k))
    v.shadow.setAttribute('opacity', (.95 * k * k).toFixed(3))
  }

  /* ---------- paths ---------- */
  function polyline(A, B, s) {
    /* a paper plane climbs a little and glides down: less lift when the new spot is lower */
    const dx = B.x - A.x, dy = B.y - A.y, dist = Math.hypot(dx, dy), L = s.lift ?? clamp(dist * .2, 40, 180) * (dy > 0 ? .5 : 1)
    const P = [[A.x, A.y], [A.x + dx * .3, A.y + dy * .3 - L * 1.15], [A.x + dx * .72, A.y + dy * .72 - L * .9], [B.x, B.y]]
    const bez = t => { const u = 1 - t; return [0, 1].map(j => u * u * u * P[0][j] + 3 * u * u * t * P[1][j] + 3 * u * t * t * P[2][j] + t * t * t * P[3][j]) }
    const pts = []
    for (let i = 0; i <= 48; i++) pts.push(bez(i / 48))
    if (s.loop) {   /* splice one loop-the-loop in at the middle: forward, up and over, back to the line */
      const m = 24, [mx, my] = pts[m], [ax, ay] = pts[m - 1], [bx, by] = pts[m + 1]
      let tx = bx - ax, ty = by - ay; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl
      const face = Math.sign(dx) || 1, nx = ty * face, ny = -tx * face, r = 66
      const cx = mx + nx * r, cy = my + ny * r, loop = []
      for (let j = 1; j < 40; j++) { const ph = j / 40 * TAU; loop.push([cx + r * (tx * Math.sin(ph) - nx * Math.cos(ph)), cy + r * (ty * Math.sin(ph) - ny * Math.cos(ph))]) }
      pts.splice(m + 1, 0, ...loop, [mx, my])
    }
    const cum = [0]
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    return { pts, cum, len: cum[cum.length - 1] }
  }
  function along(path, d) {
    const { pts, cum, len } = path
    d = clamp(d, 0, len)
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++
    const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1)
    return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]
  }

  /* ---------- one journey ---------- */
  function start(id, A, B) {
    const kind = kindOf(), s = spots[id], dir = Math.sign(B.x - A.x) || A.face
    const f = { id, A, B, t0: now(), kind, dir, face0: A.face, face1: B.face }
    if (kind === 'fly') f.path = polyline(A, B, s)
    if (kind === 'hop') { const d = Math.hypot(B.x - A.x, B.y - A.y); f.hops = Math.max(1, Math.min(4, Math.round(d / 300))) }
    const v = views[id]
    v.trail.textContent = ''
    if (obj.trail !== false && kind === 'fly') {
      const n = Math.min(160, Math.floor(f.path.len / 19)), frag = []
      for (let k = 1; k <= n; k++) { const [x, y] = along(f.path, k / (n + 1) * f.path.len); frag.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="3" opacity="0"/>`) }
      v.trail.innerHTML = frag.join(''); f.dots = [...v.trail.children]
    }
    if (obj.trail !== false && kind === 'hop') {
      const frag = []
      for (let h = 1; h <= f.hops; h++) for (let j = 0; j < 3; j++) frag.push(`<circle r="4" opacity="0" data-h="${h}" data-j="${j}"/>`)
      v.trail.innerHTML = frag.join(''); f.dots = [...v.trail.children]
    }
    fl = f
  }
  function frame(f, t) {   /* the pose at t seconds into the journey, and the trail */
    const { A, B, kind } = f, v = views[f.id], q = { ...B, sqx: 1, sqy: 1 }
    const turn = f.face0 !== f.face1 ? f.face0 * Math.cos(Math.PI * sstep(0, .26, t)) + 0 : f.face0
    if (kind === 'fly') {
      const P = f.path, a = sstep(0, .14, t) * (1 - sstep(.1, .24, t))   /* anticipation: pull back, nose up */
      const qq = clamp((t - .1) / .72), e = ease(qq), d = e * P.len
      let [x, y] = along(P, d)
      const [x2, y2] = along(P, d + 12), [x0, y0] = along(P, d - 12)
      const fc = f.face0 !== f.face1 ? (t < .13 ? f.face0 : f.face1) : f.face1
      let ang = Math.atan2(y2 - y0, (x2 - x0) * fc) * 180 / Math.PI
      if (Math.abs(x2 - x0) + Math.abs(y2 - y0) < .5) ang = A.rot
      const wIn = sstep(0, .16, qq), wOut = sstep(.82, 1, qq)
      let rot = lerp(lerp(A.rot, ang, wIn), B.rot, wOut)
      x -= f.dir * 16 * a; rot -= 9 * a
      /* settle: overshoot along the way it came in, then a damped wobble */
      const st = Math.max(0, t - .8), sp = st > 0 ? Math.exp(-st * 9) * Math.sin(st * 17) : 0
      x += f.dir * 15 * sp; y -= 4 * sp; rot += 5 * sp
      q.x = x; q.y = y; q.rot = rot; q.face = f.face0 !== f.face1 ? turn : f.face1
      if (Math.abs(q.face) < .12) q.face = .12 * Math.sign(q.face || 1)
      q.sqy = 1 - .1 * Math.sin(Math.PI * qq) * (1 - a)   /* a slight bank in mid-flight */
      q.sc = lerp(A.sc, B.sc, e); q.ground = lerp(A.ground, B.ground, e)
      const [sx] = along(P, d - 22); q.sx = sx
      if (f.dots) {
        const n = f.dots.length
        f.dots.forEach((c, k) => {
          const born = .1 + .72 * inv(k / (n + 1)), age = t - born
          c.setAttribute('opacity', age < 0 ? 0 : (.72 * Math.pow(clamp(1 - age / .36), 1.6)).toFixed(3))
          c.setAttribute('r', f1(1.4 + 2.2 * clamp(1 - age / .36)))
        })
      }
    } else if (kind === 'hop') {
      const n = f.hops, T0 = .12, T1 = .98, hop = (T1 - T0) / n
      const pre = sstep(0, .1, t) * (1 - sstep(.08, .14, t))
      const ht = clamp((t - T0) / (T1 - T0)) * n, h = Math.min(n - 1, Math.floor(ht)), u = ht - h
      const e = ease(clamp((t - T0) / (T1 - T0)))
      q.x = lerp(A.x, B.x, (h + u) / n); const base = lerp(A.y, B.y, (h + u) / n)
      const H = 60 + Math.min(120, Math.abs(B.x - A.x) / n * .22)
      q.y = t < T0 ? A.y : base - H * 4 * u * (1 - u)
      q.ground = lerp(A.ground, B.ground, (h + u) / n)
      q.spin = t < T0 || t >= T1 ? 0 : f.dir * f.face1 * 16 * Math.sin(Math.PI * u)   /* leans into each hop, lands flat */
      if (t >= T1) { q.x = B.x; q.y = B.y }
      const land = t < T0 ? pre : t < T1 && u < .12 ? 1 - u / .12 : 0
      const after = Math.max(0, t - T1), boing = after > 0 ? Math.exp(-after * 10) * Math.sin(after * 24) : 0
      q.sqy = 1 - .16 * land - .1 * boing; q.sqx = 1 + .12 * land + .07 * boing
      q.y += (1 - q.sqy) * 26
      q.rot = B.rot; q.sc = lerp(A.sc, B.sc, e); q.face = f.face1
      if (f.dots) f.dots.forEach(c => {
        const hh = +c.dataset.h, j = +c.dataset.j, tl = T0 + hh * hop, age = t - tl
        const x = lerp(A.x, B.x, hh / n) + (j - 1) * 22 * (age > 0 ? 1 + age * 3 : 1), gy = lerp(A.ground, B.ground, hh / n) - 4 - (j === 1 ? 6 : 0) - age * 30
        c.setAttribute('cx', f1(x)); c.setAttribute('cy', f1(gy)); c.setAttribute('r', f1(3 + Math.max(0, age) * 18))
        c.setAttribute('opacity', age < 0 || age > .35 ? 0 : (.45 * (1 - age / .35)).toFixed(3))
      })
    } else {   /* roll */
      const back = sstep(0, .14, t) * (1 - sstep(.12, .3, t)), e = ease(clamp((t - .12) / .78))
      const st = Math.max(0, t - .86), sp = st > 0 ? Math.exp(-st * 7) * Math.sin(st * 13) : 0
      q.x = lerp(A.x, B.x, e) - f.dir * 14 * back + f.dir * 18 * sp; q.y = lerp(A.y, B.y, e)
      q.ground = lerp(A.ground, B.ground, e); q.rot = B.rot; q.face = 1; q.sc = lerp(A.sc, B.sc, e)
      q.spin = (A.spin ?? 0) + (q.x - A.x) / (30 * q.sc) * 180 / Math.PI   /* rotates by the distance rolled */
    }
    return q
  }
  /* trail dots are evenly spaced in distance; their birth time inverts the flight's ease */
  const inv = y => { let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; ease(m) < y ? lo = m : hi = m } return (lo + hi) / 2 }

  /* ---------- navigation ---------- */
  const now = () => performance.now() / 1000
  const isStep = (el, ctx) => { if (ctx.from == null) return false; const L = order(); return L.indexOf(el) === L.indexOf(document.getElementById('s' + ctx.from)) + 1 }
  function enter(el, ctx) {
    const id = el.id, v = mount(id), B = pose(id), step = isStep(el, ctx), pid = step ? 's' + ctx.from : null
    curId = id; fl = null; v.trail.textContent = ''; v.rest = null
    let A = null
    if (ctx.play && step && spots[pid]) A = live ? { ...live } : pose(pid)
    else if (ctx.play && (ctx.from == null || step)) A = { ...B, x: -180, y: Math.min(1000, B.y + 170), rot: -14, face: 1, ground: B.ground, sc: B.sc }   /* thrown in from the lower left */
    if (A) {
      if (A.face !== B.face && spots[id].face == null) B.face = Math.sign(B.x - A.x) || B.face
      start(id, A, B); draw(v, frame(fl, 0))
    } else { v.rest = { B, t: -1e9 }; idle(v, B, now(), 1) }
  }
  function idle(v, B, t, k) {   /* the resting hover: a slow bob (fly) or a breath (hop); k fades it in after landing */
    const q = { ...B }, amp = (obj.hover ?? 5) * k, w = kindOf() === 'fly' ? 1.25 : .9, bob = Math.sin(t * w)
    if (kindOf() === 'fly') { q.y += amp * bob; q.rot += amp * .4 * Math.sin(t * w + 1.1) }
    else if (kindOf() === 'hop') { q.sqy = 1 + amp * .004 * bob; q.sqx = 1 - amp * .004 * bob; q.y += (1 - q.sqy) * 26 }
    live = { x: q.x, y: q.y, rot: q.rot, sc: q.sc, face: q.face, ground: q.ground, spin: q.spin }
    draw(v, q)
  }
  function tick(id, t, still) {
    const v = views[id]
    if (still) { if (Deck.PRINT || Deck.current()?.id === id) { mount(id); v.trail.textContent = ''; draw(v, pose(id)) } return }
    if (curId !== id || !v.obj) return
    if (fl && fl.id === id) {
      const s = Math.max(0, t - fl.t0)
      if (s >= END + .06) { const q = frame(fl, END + .06); v.trail.textContent = ''; v.rest = { B: { ...fl.B, spin: q.spin ?? 0 }, t }; fl = null }
      else { const q = frame(fl, s); live = { x: q.x, y: q.y, rot: q.rot, sc: q.sc, face: Math.sign(q.face) || 1, ground: q.ground, spin: q.spin }; draw(v, q); return }
    }
    if (!v.rest) v.rest = { B: pose(id), t: -1e9 }
    idle(v, v.rest.B, t, sstep(v.rest.t, v.rest.t + .8, t))
  }
  function spot(id, s) {
    const el = document.getElementById(id)
    if (!el) { console.warn(`traveller: no #${id}`); return }
    spots[id] = s
    let root = el.querySelector(':scope>.cy-tr')
    if (!root) { root = document.createElement('div'); root.className = 'cy-tr'; root.setAttribute('aria-hidden', 'true'); el.append(root) }
    views[id] = { root }
    Deck.on(id, {
      enter: (e, ctx) => enter(e, ctx),
      leave: () => { if (fl?.id === id) fl = null; if (views[id].trail) views[id].trail.textContent = ''; views[id].rest = null },
      final: () => { const v = mount(id); v.trail.textContent = ''; draw(v, pose(id)) },
    })
    Deck.clock(root, (t, _, still) => tick(id, t, still), { printT: 12 })
  }

  PK.traveller = {
    object(o) { Object.assign(obj, o) },
    spot,
    presets: PRESETS,
  }
})()
