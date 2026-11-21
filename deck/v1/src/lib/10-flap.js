/* RP.flaps(host, n, opts) → a row of n split-flap cells that can be set or flipped from one string to another.
   Every flip runs the drum in order (a flap cannot skip characters), the old top falls, the new bottom swings down and
   the final flap bounces a hair off its stop. Used by every board in the deck so they all sound like one machine. */
(() => {
  const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+−.%:·●'
  const D = DRUM.length
  const idx = c => { const i = DRUM.indexOf(c); return i < 0 ? 0 : i }
  function makeCell(host) {
    const c = document.createElement('i'); c.className = 'rp-fl'
    c.innerHTML = '<b class="t"><s></s></b><b class="b"><s></s></b><b class="ft"><s></s></b><b class="fb"><s></s></b>'
    host.appendChild(c)
    const [t, b, ft, fb] = c.children
    return { c, h: [t, b, ft, fb], shown: [null, null, null, null] }
  }
  const put = (cl, i, ch) => { if (cl.shown[i] !== ch) { cl.shown[i] = ch; cl.h[i].firstChild.textContent = ch === ' ' ? '' : ch } }
  // one flip from a to b, progress p in 0…1; s = seconds since landing (bounce) when final
  function pose(cl, a, b, p, final, s) {
    const [, , ft, fb] = cl.h
    put(cl, 0, b)
    if (p >= 1 && (!final || s > .4)) { ft.style.visibility = fb.style.visibility = 'hidden'; put(cl, 1, b); ft.style.filter = fb.style.filter = ''; return }
    put(cl, 1, p >= 1 ? b : a)
    if (p < .5) {
      put(cl, 2, a); ft.style.visibility = 'inherit'; fb.style.visibility = 'hidden'
      ft.style.transform = `rotateX(${(-180 * p).toFixed(1)}deg)`; ft.style.filter = `brightness(${(1 - p * .9).toFixed(2)})`
    } else {
      let ang = 180 * (1 - p)
      if (final && p >= 1) ang = 7 * Math.exp(-s * 16) * Math.abs(Math.sin(s * 26))
      put(cl, 3, b); fb.style.visibility = 'inherit'; ft.style.visibility = 'hidden'
      fb.style.transform = `rotateX(${ang.toFixed(1)}deg)`; fb.style.filter = `brightness(${(1 - ang / 200).toFixed(2)})`
    }
  }
  const pad = (s, n) => [...String(s).toUpperCase().padEnd(n, ' ')].slice(0, n)
  window.RP = window.RP || {}
  window.RP.flaps = (host, n, o = {}) => {
    const cells = Array.from({ length: n }, () => makeCell(host))
    let raf = 0
    const set = str => { cancelAnimationFrame(raf); pad(str, n).forEach((ch, i) => pose(cells[i], ch, ch, 1, false, 1)) }
    // flip from → to; every flap starts a hair after its left neighbour and runs at most maxFlips through the drum
    const play = (from, to, p = {}) => {
      cancelAnimationFrame(raf)
      const A = pad(from, n), B = pad(to, n), DT = p.dt ?? .055, LAST = p.last ?? .16, stagger = p.stagger ?? .045, delay = p.delay ?? 0, max = p.maxFlips ?? 8
      const plan = B.map((b, i) => {
        const a = A[i], ia = idx(a), ib = idx(b)
        let steps = ((ib - ia) % D + D) % D
        if (a === b) steps = p.churn ? D : 0
        const k = Math.min(steps, max), start = ((ib - k) % D + D) % D
        const seq = steps === 0 ? [] : [ia, ...Array.from({ length: k }, (_, j) => DRUM[(start + j + 1) % D]).map(idx)]
        return { seq: seq.map(x => DRUM[x]), t0: delay + i * stagger + (p.jitter ? p.jitter(i) : 0), b }
      })
      plan.forEach((pl, i) => pose(cells[i], A[i], A[i], 1, false, 1))
      const t0 = performance.now() / 1000
      const end = Math.max(...plan.map(pl => pl.t0 + Math.max(0, pl.seq.length - 2) * DT + LAST + .45))
      const tick = () => {
        const t = performance.now() / 1000 - t0
        plan.forEach((pl, i) => {
          const cl = cells[i], m = pl.seq.length - 1
          if (m < 1) return pose(cl, pl.b, pl.b, 1, false, 1)
          const u = t - pl.t0
          if (u < 0) return pose(cl, pl.seq[0], pl.seq[0], 1, false, 1)
          const spin = (m - 1) * DT
          if (u < spin) { const k = Math.floor(u / DT); return pose(cl, pl.seq[k], pl.seq[k + 1], (u - k * DT) / DT, false, 0) }
          const f = (u - spin) / LAST
          pose(cl, pl.seq[m - 1], pl.seq[m], Math.min(1, f), true, Math.max(0, u - spin - LAST))
        })
        if (t < end) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return end
    }
    if (o.text != null) set(o.text)
    return { cells, set, play, n }
  }
})()
