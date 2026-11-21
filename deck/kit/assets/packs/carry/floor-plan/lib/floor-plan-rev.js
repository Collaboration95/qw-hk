/* Pack carry/floor-plan, optional emphasis device. Revision cloud: the deck's one emphasis device. An architect marks a change on a drawing with a scalloped red
   cloud and a numbered delta; here it rings the felt word (<span class="rev" data-rev="1">wrong</span>), 1–3 times
   in the deck. Drawn on 0.35 s after a forward arrival (theme.css), static in print. */
(() => {
  const NS = 'http://www.w3.org/2000/svg'
  const rng = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  function cloud(el, seed) {
    el.querySelector(':scope>svg')?.remove()
    const w = el.offsetWidth, h = el.offsetHeight
    if (!w) return
    const R = rng(seed * 131 + 7), padX = 30, A = w / 2 + padX, B = h * .45, cx = w / 2, cy = h * .56
    // superellipse perimeter, sampled evenly, scallops bulging outward (clockwise in screen space → sweep 1)
    const raw = []
    for (let i = 0; i <= 720; i++) { const a = -Math.PI + i / 720 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); raw.push([cx + A * Math.sign(c) * Math.abs(c) ** .55, cy + B * Math.sign(s) * Math.abs(s) ** .55]) }
    const len = [0]; for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]))
    const L = len[len.length - 1], n = Math.max(10, Math.round(L / 44)), pts = []
    for (let k = 0, j = 0; k <= n; k++) { const target = k / n * L; while (j < len.length - 1 && len[j + 1] < target) j++; pts.push(raw[j].map(v => v + (R() - .5) * 3)) }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let k = 1; k < pts.length; k++) { const r = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]) * (.56 + R() * .1); d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}` }
    const pad = 60, s = document.createElementNS(NS, 'svg')
    s.setAttribute('width', w + pad * 2); s.setAttribute('height', h + pad * 2); s.setAttribute('viewBox', `${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`); s.setAttribute('aria-hidden', 'true')
    s.style.left = -pad + 'px'; s.style.top = -pad + 'px'
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p)
    // the numbered delta that goes with every revision cloud
    const tx = cx + A * .93, ty = cy - B - 6, g = document.createElementNS(NS, 'g')
    g.innerHTML = `<path class="dl" d="M${tx} ${ty - 30}L${tx + 26} ${ty + 14}H${tx - 26}Z"/><text x="${tx}" y="${ty + 8}" text-anchor="middle">${el.dataset.rev || seed}</text>`
    s.appendChild(g)
    m(p)
    el.appendChild(s)
  }
  const m = p => { try { p.style.setProperty('--len', (p.getTotalLength() + 2).toFixed(0)) } catch { } }
  const all = () => document.querySelectorAll('.rev').forEach((el, i) => cloud(el, i + 1))
  all(); document.fonts?.ready.then(all)
  Deck.onChange(el => { if (!el.querySelector('.rev')) return; el.querySelectorAll('.rev').forEach(r => { const p = r.querySelector('svg>path'); if (p) { p.style.animation = 'none'; void p.getBBox(); p.style.animation = '' } }) })
})()
