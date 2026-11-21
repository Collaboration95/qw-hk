/* Pack carry/floor-plan (from the liminal-spaces deck, v3). Plan: one endless architectural floor plan, walked by a "you are here" dot. Each slide owns its own canvas
   (print stacks every slide) and looks at the same world through its own window (VIEW). On a forward step the
   window glides from the last slide's view to this one while the dot walks there through a doorway (≤ 1.1 s);
   the doors on its route swing open as it reaches them. Before the Backrooms (BACK_X) the world is a building
   after hours; past it, the same seeded generator cuts randomly segmented rooms forever (the "600 million square
   miles"), traced in amber. The s4 → s5 walk has no doors: the dot noclips through the wall.
     Plan.slide(id, { you:[x,y], lightsOff, quiet:[[x,y,w,h]], extra(g, k) })   view-local coordinates
     [data-keep] elements in a slide carve the plan (walls stop at them); data-keep="0" means no padding.
     Plan.reveal(id, T)  draws slide id as the s0 reveal at time T (s); T = null → empty field, Infinity → done. */
(() => {
  const W = 1920, H = 1080, BW = 1200, BH = 960
  let BACK_X = 7200, NOCLIP = 5
  let VIEW = [[0, 0], [1500, 140], [3000, 40], [4500, 260], [6000, 120], [7600, 520], [9100, 380], [10600, 700], [12100, 480], [13600, 620], [15100, 560], [16600, 560]]
  let DUR = 1100
  const slides = {}, blocks = new Map(), fixed = []
  let route = null

  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const hash = (i, j, s = 0) => { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(s | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296 }
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
  const ease = p => 1 - Math.pow(1 - clamp(p), 3)
  const easeIO = p => (p = clamp(p)) < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
  const snap = v => Math.round(v / 20) * 20

  /* ---------- the route: one Manhattan walk through every slide's "you are here" ---------- */
  function buildRoute() {
    const P = VIEW.map((o, n) => { const s = slides['s' + n]; const y = s?.you || [960, 900]; return [o[0] + y[0], o[1] + y[1]] })
    const legs = []
    for (let n = 1; n < P.length; n++) {
      const A = P[n - 1], B = P[n], f = slides['s' + n]?.mid ?? .5, vf = slides['s' + (n - 1)]?.leave === 'v'
      const mx = snap(A[0] + (B[0] - A[0]) * f), my = snap(A[1] + (B[1] - A[1]) * f)
      const ey = slides['s' + n]?.ey, Ey = ey != null ? VIEW[n][1] + ey : null
      const pts = Ey != null ? [A, [mx, A[1]], [mx, Ey], [B[0], Ey], B] : vf ? [A, [A[0], my], [B[0], my], B] : [A, [mx, A[1]], [mx, B[1]], B], len = [0]
      for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]))
      legs[n] = { pts, len, L: len[len.length - 1], noclip: n === NOCLIP }
    }
    route = { P, legs }
  }
  const at = (leg, s) => {
    s = clamp(s, 0, leg.L)
    for (let i = 1; i < leg.pts.length; i++) if (s <= leg.len[i] || i === leg.pts.length - 1) {
      const a = leg.pts[i - 1], b = leg.pts[i], d = leg.len[i] - leg.len[i - 1], f = d ? (s - leg.len[i - 1]) / d : 0
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, b[0] - a[0], b[1] - a[1]]
    }
  }

  /* ---------- the world: blocks of rooms cut by a seeded BSP; doors where the route crosses a wall ---------- */
  function block(i, j) {
    const key = i + ',' + j
    if (blocks.has(key)) return blocks.get(key)
    const x0 = i * BW, y0 = j * BH, br = x0 >= BACK_X, R = mul(hash(i, j, br ? 7 : 3) * 4294967296)
    const walls = [], doors = [], pillars = [], lights = [], th = br ? 9 : 12
    const wall = (o, c, a, b, opt = {}) => { const w = { o, c, a, b, th: opt.th || th, gaps: [], br, part: opt.part }; walls.push(w); return w }
    const door = (w, at, dw) => {
      dw = dw || (br ? 78 : 92)
      if (w.b - w.a < dw + 60) return
      at = clamp(at, w.a + 30 + dw / 2, w.b - 30 - dw / 2)
      w.gaps.push([at - dw / 2, at + dw / 2])
      doors.push({ w, at, dw, hinge: R() < .5 ? -1 : 1, side: R() < .5 ? -1 : 1 })
    }
    const MIN = br ? 170 : 380
    const split = (x, y, w, h, d) => {
      const canV = w >= MIN * 2, canH = h >= MIN * 2
      if ((!canV && !canH) || (d >= (br ? 3 : 1) && R() < (br ? .12 : .3))) {
        if (br && w > 220 && h > 220 && R() < .32) pillars.push([snap(x + w * (.3 + R() * .4)), snap(y + h * (.3 + R() * .4))])
        if (br) for (let lx = x + 60; lx < x + w - 100; lx += 160) for (let ly = y + 70; ly < y + h - 60; ly += 200) if (R() < .5) lights.push([lx, ly])
        return
      }
      const vert = canV && (!canH || w > h * (.8 + R() * .5))
      if (vert) {
        const sx = snap(x + MIN + R() * (w - 2 * MIN))
        if (br && R() < .38) { const f = .35 + R() * .4, top = R() < .5; wall('v', sx, top ? y : y + h * (1 - f), top ? y + h * f : y + h, { part: 1 }) }
        else door(wall('v', sx, y, y + h), y + h * (.2 + R() * .6))
        split(x, y, sx - x, h, d + 1); split(sx, y, x + w - sx, h, d + 1)
      } else {
        const sy = snap(y + MIN + R() * (h - 2 * MIN))
        if (br && R() < .38) { const f = .35 + R() * .4, left = R() < .5; wall('h', sy, left ? x : x + w * (1 - f), left ? x + w * f : x + w, { part: 1 }) }
        else door(wall('h', sy, x, x + w), x + w * (.2 + R() * .6))
        split(x, y, w, sy - y, d + 1); split(x, sy, w, y + h - sy, d + 1)
      }
    }
    // block edges: top and left, each with a door (the building's corridors join up)
    door(wall('h', y0, x0, x0 + BW, { th: br ? 10 : 16 }), x0 + BW * (.25 + R() * .5), br ? 80 : 110)
    door(wall('v', x0, y0, y0 + BH, { th: br ? 10 : 16 }), y0 + BH * (.25 + R() * .5), br ? 80 : 110)
    split(x0, y0, BW, BH, 0)
    const glitches = routeDoors(walls, doors, br)
    const b = { walls, doors, pillars, lights, glitches, br, i, j, off: hash(i, j, 11) }
    blocks.set(key, b)
    return b
  }
  // the route: a door wherever the walk crosses a wall (none on the noclip leg; it glitches through instead)
  function routeDoors(walls, doors, br) {
    const glitches = []
    for (const w of walls) for (let n = 1; n < route.legs.length; n++) {
      const leg = route.legs[n]
      for (let k = 1; k < leg.pts.length; k++) {
        const a = leg.pts[k - 1], b = leg.pts[k], horiz = a[1] === b[1]
        if ((w.o === 'v') !== horiz) continue
        const fixedC = horiz ? a[1] : a[0], lo = Math.min(horiz ? a[0] : a[1], horiz ? b[0] : b[1]), hi = Math.max(horiz ? a[0] : a[1], horiz ? b[0] : b[1])
        if (!(w.c > lo && w.c < hi && fixedC > w.a && fixedC < w.b)) continue
        if (w.gaps.some(([g0, g1]) => fixedC > g0 - 10 && fixedC < g1 + 10)) continue
        const s = leg.len[k - 1] + Math.abs(w.c - (horiz ? a[0] : a[1]))
        if (leg.noclip) { glitches.push({ w, at: fixedC, n, s }); continue }
        const dw = br ? 84 : 100
        w.gaps.push([fixedC - dw / 2, fixedC + dw / 2])
        const dir = horiz ? Math.sign(b[0] - a[0]) : Math.sign(b[1] - a[1])
        doors.push({ w, at: fixedC, dw, hinge: 1, side: dir, route: { n, s } })
      }
    }
    return glitches
  }
  // fixed walls a slide adds to the world (the reveal's threshold hall); they get route doors like any other
  const fixedWalls = []
  let fixedBlock = null
  function getFixed() {
    if (fixedBlock) return fixedBlock
    const walls = [], doors = []
    for (const f of fixedWalls) {
      const w = { o: f.o, c: f.c, a: f.a, b: f.b, th: f.th || 16, gaps: [], br: false, fixed: true }
      walls.push(w)
      for (const d of f.doors || []) { w.gaps.push([d.at - d.dw / 2, d.at + d.dw / 2]); doors.push({ w, ...d }) }
    }
    const glitches = routeDoors(walls, doors, false)
    return fixedBlock = { walls, doors, pillars: [], lights: [], glitches, br: false, off: .5 }
  }
  const blocksIn = (x, y, w, h) => { const out = [getFixed()]; for (let i = Math.floor(x / BW); i <= Math.floor((x + w) / BW); i++) for (let j = Math.floor(y / BH); j <= Math.floor((y + h) / BH); j++) out.push(block(i, j)); return out }

  /* ---------- keeps: DOM content carves the plan (walls stop at it), in world coordinates ---------- */
  const keepsAll = []
  function measure() {
    keepsAll.length = 0
    for (const id in slides) {
      const S = slides[id], o = VIEW[S.n]
      for (const el of S.el.querySelectorAll('[data-keep]')) {
        let x = 0, y = 0, e = el
        while (e && e !== S.el) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent }
        const pad = el.dataset.keep === '0' ? 0 : +(el.dataset.keep || 26)
        if (el.offsetWidth) keepsAll.push([o[0] + x - pad, o[1] + y - pad, el.offsetWidth + 2 * pad, el.offsetHeight + 2 * pad])
      }
      for (const q of S.quiet || []) keepsAll.push([o[0] + q[0], o[1] + q[1], q[2], q[3], 1])
    }
  }
  // the parts of [a,b] along a wall (orientation o at c, thickness th) that are outside every keep and gap
  function pieces(w) {
    let segs = [[w.a, w.b]]
    const cut = (u0, u1) => { const out = []; for (const [a, b] of segs) { if (u1 <= a || u0 >= b) { out.push([a, b]); continue } if (u0 > a) out.push([a, u0]); if (u1 < b) out.push([u1, b]) } segs = out }
    for (const g of w.gaps) cut(g[0], g[1])
    for (const [kx, ky, kw, kh, q] of keepsAll) {
      if (q && w.fixed) continue
      if (w.o === 'h') { if (w.c + w.th / 2 > ky && w.c - w.th / 2 < ky + kh) cut(kx, kx + kw) }
      else if (w.c + w.th / 2 > kx && w.c - w.th / 2 < kx + kw) cut(ky, ky + kh)
    }
    return segs.filter(([a, b]) => b - a > 2)
  }
  const inKeep = (x, y, soft) => keepsAll.some(([kx, ky, kw, kh, q]) => !(q && soft) && x > kx && x < kx + kw && y > ky && y < ky + kh)

  /* ---------- drawing ---------- */
  const patterns = new Map()
  function hatch(g, col) {
    if (patterns.has(col)) return patterns.get(col)
    const c = document.createElement('canvas'); c.width = c.height = 10
    const x = c.getContext('2d'); x.strokeStyle = col; x.lineWidth = 1.6; x.globalAlpha = .55
    x.beginPath(); x.moveTo(-2, 12); x.lineTo(12, -2); x.moveTo(-2, 2); x.lineTo(2, -2); x.moveTo(8, 12); x.lineTo(12, 8); x.stroke()
    const p = g.createPattern(c, 'repeat'); patterns.set(col, p); return p
  }
  function grid(g, cx, cy, ln) {
    g.save(); g.strokeStyle = ln
    for (const [step, a, lw] of [[40, .055, 1], [200, .11, 1.2]]) {
      g.globalAlpha = a; g.lineWidth = lw; g.beginPath()
      for (let x = -((cx % step) + step) % step; x <= W; x += step) { g.moveTo(Math.round(x) + .5, 0); g.lineTo(Math.round(x) + .5, H) }
      for (let y = -((cy % step) + step) % step; y <= H; y += step) { g.moveTo(0, Math.round(y) + .5); g.lineTo(W, Math.round(y) + .5) }
      g.stroke()
    }
    g.restore()
  }

  // st: { cx, cy, dot:[x,y]|null, leg, s (walked length), clipR:{x,y,r}|null, alpha(block)→a, doorOpen(d)→0..1, glitch(world x,y)→0..1, t }
  function render(S, g, st) {
    const g0 = g
    const ln = S.ln, acc = S.acc
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, W, H)
    grid(g, st.cx, st.cy, ln)
    g.save()
    g.translate(-st.cx, -st.cy)
    if (st.clipR) { g.beginPath(); g.arc(st.clipR.x, st.clipR.y, Math.max(1, st.clipR.r), 0, Math.PI * 2); g.clip() }
    const pat = hatch(g, ln)
    for (const b of blocksIn(st.cx - 40, st.cy - 40, W + 80, H + 80)) {
      const A = st.alpha ? st.alpha(b) : 1
      if (A <= .001) continue
      g.globalAlpha = A
      // reflected-ceiling troffers in the Backrooms (dashed: they are overhead), one hums out of step
      if (b.br && S.br) {
        g.save(); g.strokeStyle = ln; g.lineWidth = 1.3; g.setLineDash([7, 6])
        b.lights.forEach(([x, y], k) => {
          if (inKeep(x + 30, y + 15)) return
          let a = .26
          if (st.t != null && k === 3) { const f = (st.t * 7.3) % 41; a = f < 1.2 ? (Math.sin(f * 40) > 0 ? .55 : .05) : .26 }
          g.globalAlpha = A * a; g.strokeRect(x, y, 60, 30); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60, y + 30); g.stroke()
        })
        g.restore(); g.globalAlpha = A
      }
      for (const w of b.walls) {
        for (const [a, bb] of pieces(w)) {
          let r = w.o === 'h' ? [a, w.c - w.th / 2, bb - a, w.th] : [w.c - w.th / 2, a, w.th, bb - a]
          let jit = 0
          if (st.glitch) for (const gl of b.glitches) if (gl.w === w) { const q = st.glitch(gl); if (q > 0 && Math.abs((w.o === 'h' ? (r[0] + r[2] / 2) : (r[1] + r[3] / 2)) - gl.at) < 400) jit = q }
          if (jit) { g.save(); g.globalAlpha = A * (1 - .6 * jit); g.translate((Math.random() - .5) * 8 * jit, (Math.random() - .5) * 8 * jit) }
          // s6: the same walls as a renovation drawing (dashed: to be demolished)
          if (!S.demo || w.fixed) { g.fillStyle = pat; g.fillRect(...r) }
          g.strokeStyle = ln; g.lineWidth = S.demo ? 2.2 : 1.6; g.globalAlpha = (jit ? A * (1 - .6 * jit) : A) * (w.part ? .8 : .9)
          if (S.demo) g.setLineDash([14, 9])
          g.strokeRect(r[0] + .5, r[1] + .5, r[2] - 1, r[3] - 1)
          if (S.demo) g.setLineDash([])
          g.globalAlpha = A
          if (jit) g.restore()
        }
      }
      // doors: leaf + swing arc (plan convention); route doors open as the dot reaches them
      g.strokeStyle = ln
      for (const d of b.doors) {
        const w = d.w, hx = w.o === 'h' ? d.at + d.hinge * d.dw / 2 : w.c, hy = w.o === 'h' ? w.c : d.at + d.hinge * d.dw / 2
        if (inKeep(hx, hy, w.fixed) || inKeep(w.o === 'h' ? d.at : w.c, w.o === 'h' ? w.c : d.at, w.fixed)) continue
        const open = d.id && st.reveal != null ? easeIO((st.reveal - .85) / .6) : d.route && st.doorOpen ? st.doorOpen(d) : 1
        const base = w.o === 'h' ? (d.hinge > 0 ? Math.PI : 0) : (d.hinge > 0 ? -Math.PI / 2 : Math.PI / 2)
        const swing = (w.o === 'h' ? d.side : -d.side) * (d.hinge > 0 ? -1 : 1)
        const ang = base + swing * open * Math.PI / 2
        g.globalAlpha = A * .85; g.lineWidth = 2.4
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(ang) * d.dw, hy + Math.sin(ang) * d.dw); g.stroke()
        g.globalAlpha = A * .45; g.lineWidth = 1.2
        g.beginPath(); g.arc(hx, hy, d.dw, Math.min(base, ang), Math.max(base, ang)); g.stroke()
        if (d.route) { g.globalAlpha = A * .5; g.lineWidth = 1.2; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(w.o === 'h' ? d.at - d.dw / 2 : w.c, w.o === 'h' ? w.c : d.at - d.dw / 2); g.lineTo(w.o === 'h' ? d.at + d.dw / 2 : w.c, w.o === 'h' ? w.c : d.at + d.dw / 2); g.stroke(); g.setLineDash([]) }
      }
      g.globalAlpha = A
      for (const [x, y] of b.pillars) { if (inKeep(x, y)) continue; g.fillStyle = pat; g.fillRect(x - 18, y - 18, 36, 36); g.strokeStyle = ln; g.lineWidth = 1.6; g.strokeRect(x - 17.5, y - 17.5, 35, 35) }
    }
    g.globalAlpha = 1
    // fixed drawing (the reveal's threshold, a slide's own rooms) in world coordinates
    for (const f of fixed) if (f.slide === S.id || f.all) f.draw(g, st, S)
    // footsteps: the walk so far, older steps fainter
    if (st.leg && st.s > 0) {
      g.fillStyle = acc
      const step = 26
      for (let s = step, k = 0; s <= st.s; s += step, k++) {
        const [x, y, dx, dy] = at(st.leg, s), n = Math.hypot(dx, dy) || 1, side = k % 2 ? 1 : -1
        const px = x + (-dy / n) * 7 * side, py = y + (dx / n) * 7 * side
        if (inKeep(px, py, true)) continue
        g.globalAlpha = (st.dim ?? 1) * (.22 + .6 * clamp(1 - (st.s - s) / 900))
        g.beginPath(); g.ellipse(px, py, 4.2, 4.2, 0, 0, Math.PI * 2); g.fill()
      }
      g.globalAlpha = 1
    }
    g.restore()
    if (st.extra) st.extra(g, st)
    // the dot: "you are here", on the slide's top canvas
    g = S.gt; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H)
    if (st.dot) {
      const x = st.dot[0] - st.cx, y = st.dot[1] - st.cy, pulse = st.t != null ? (st.t % 2.6) / 2.6 : .45, k = st.dotA ?? 1
      g.save(); g.globalAlpha = k * .55 * (1 - pulse); g.strokeStyle = acc; g.lineWidth = 3
      g.beginPath(); g.arc(x, y, 18 + 30 * pulse, 0, Math.PI * 2); g.stroke()
      g.globalAlpha = k; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 17, 0, Math.PI * 2); g.fill()
      g.fillStyle = acc; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill()
      g.restore()
    }
  }

  /* ---------- per-slide state ---------- */
  let anim = null // { id, t0 }
  function stateFor(S, now, still) {
    const n = S.n, o = VIEW[n], leg = route.legs[n]
    const st = { cx: o[0], cy: o[1], t: still ? null : now, dot: route.P[n], leg, s: leg ? leg.L : 0 }
    if (S.lightsOff) {
      const T = still || !S.arr ? 9 : (performance.now() - S.arr) / 1000
      st.alpha = b => { const off = .25 + b.off * .85; if (T < off) { const f = off - T; return f < .12 ? (Math.sin(T * 90 + b.off * 40) > 0 ? 1 : .2) : 1 } return .07 }
      st.dim = T < 1.3 ? 1 - .75 * clamp((T - .9) / .4) : .25
      st.dotA = T < 1.3 ? 1 - .7 * clamp((T - 1) / .3) : .3
    }
    if (S.reveal !== undefined) {
      const T = S.reveal
      if (T === null) return { cx: o[0], cy: o[1], empty: true }
      const p = ease(T / 1.5)
      st.clipR = T >= 2.4 ? null : { x: route.P[0][0], y: route.P[0][1], r: p * 2300 }
      st.reveal = T
      st.dot = T > 1.45 ? route.P[0] : null
      st.dotA = clamp((T - 1.45) / .2)
      st.leg = null
    }
    if (anim && anim.id === S.id && !still && leg) {
      const p = clamp((performance.now() - anim.t0) / DUR), e = ease(p), oo = VIEW[n - 1]
      st.cx = oo[0] + (o[0] - oo[0]) * e; st.cy = oo[1] + (o[1] - oo[1]) * e
      st.s = leg.L * easeIO(Math.min(1, p * 1.04)); st.dot = at(leg, st.s)
      st.doorOpen = d => d.route.n !== n ? 1 : clamp((st.s - (d.route.s - 150)) / 110)
      st.glitch = gl => gl.n === n ? clamp(1 - Math.abs(st.s - gl.s) / 70) : 0
      if (p >= 1) anim = null
    }
    if (S.extra) st.extra = (g, s) => S.extra(g, s, S)
    return st
  }
  function paint(S, still) {
    const st = stateFor(S, performance.now() / 1000, still)
    if (st.empty) { S.g.setTransform(1, 0, 0, 1, 0, 0); S.g.clearRect(0, 0, W, H); S.gt.clearRect(0, 0, W, H); grid(S.g, st.cx, st.cy, S.ln); return }
    render(S, S.g, st)
  }

  let measured = false
  const ensure = () => { if (!route) buildRoute(); if (!measured) { measure(); measured = true } }
  document.fonts?.ready.then(() => { measured = false; for (const id in slides) if (slides[id].painted) { ensure(); paint(slides[id], Deck.PRINT || Deck.REDUCE) } })

  window.Pack = window.Pack || {}
  window.Plan = window.Pack['floor-plan'] = {
    // views: world top-left of each slide's window, by slide number; backX: world x where the endless (Backrooms-style) rooms begin; noclip: the step that walks through walls instead of doors
    config(o) { if (o.views) VIEW = o.views; if (o.backX != null) BACK_X = o.backX; if (o.noclip != null) NOCLIP = o.noclip; if (o.dur) DUR = o.dur; route = null; blocks.clear() },
    get VIEW() { return VIEW },
    slide(id, o = {}) {
      const el = document.getElementById(id)
      if (!el) return
      let c = el.querySelector(':scope>canvas.cy-floor-plan')
      if (!c) { c = document.createElement('canvas'); c.className = 'cy-floor-plan'; el.prepend(c) }
      c.width = W; c.height = H; c.setAttribute('aria-hidden', 'true')
      const ct = document.createElement('canvas'); ct.className = 'cy-floor-plan-top'; ct.width = W; ct.height = H; ct.setAttribute('aria-hidden', 'true'); el.appendChild(ct)
      const cs = getComputedStyle(el)
      const S = slides[id] = { ...o, id, el, n: +id.slice(1), g: c.getContext('2d'), gt: ct.getContext('2d'), ln: cs.getPropertyValue('--ln').trim() || '#CFE1FF', acc: cs.getPropertyValue('--accent').trim() || '#FF5B3A', br: el.classList.contains('br') }
      Deck.clock(c, (t, _, still) => { ensure(); S.painted = true; paint(S, still) }, { printT: 12 })
      return S
    },
    fixed(slide, draw, all) { fixed.push({ slide, draw, all }) },
    wall(f) { fixedWalls.push(f); fixedBlock = null },
    reveal(id, T) { const S = slides[id]; if (!S) return; S.reveal = T; ensure(); paint(S, true) },
    point: n => (ensure(), route.P[n]),
    at, clamp, ease, easeIO,
  }
  Deck.onChange((el, ctx) => {
    const S = slides[el.id]
    if (!S) return
    S.ln = getComputedStyle(el).getPropertyValue('--ln').trim() || S.ln
    S.arr = ctx.play ? performance.now() : null
    anim = ctx.play && !ctx.jump && ctx.from === S.n - 1 && S.n > 0 ? { id: el.id, t0: performance.now() } : null
  })
})()
