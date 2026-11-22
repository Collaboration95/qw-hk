(() => {
  const P = new URLSearchParams(location.search)
  const PRINT = P.has('print') || P.has('capture')
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches
  const hooks = {}, stepOf = {}
  let slides = [], cur = -1, seqTimers = []
  const stopSeq = () => { seqTimers.forEach(clearTimeout); seqTimers = [] }

  /* ---------- marker: a hand-drawn loop fitted to the phrase's ink ---------- */
  const NS = 'http://www.w3.org/2000/svg'
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  const smooth = p => {
    const f = n => n.toFixed(1)
    let d = `M${f(p[0][0])} ${f(p[0][1])}`
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c
      d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`
    }
    return d
  }
  const GAP = 20
  const ctx2d = document.createElement('canvas').getContext('2d')
  function inkOf(m) {
    const cs = getComputedStyle(m), t = m.textContent
    ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    ctx2d.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
    const probe = document.createElement('i')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    m.appendChild(probe); const base = probe.offsetTop; probe.remove()
    const boxes = []
    for (let i = 0; i < t.length; i++) {
      if (/\s/.test(t[i])) continue
      const x0 = ctx2d.measureText(t.slice(0, i)).width, g = ctx2d.measureText(t[i])
      boxes.push([x0 - g.actualBoundingBoxLeft, base - g.actualBoundingBoxAscent, x0 + g.actualBoundingBoxRight, base + g.actualBoundingBoxDescent])
    }
    const desc = ctx2d.measureText('gjpqy').actualBoundingBoxDescent
    return { boxes, base, desc, fs: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.1, ws: ctx2d.measureText(' ').width }
  }
  function drawMark(m, seed) {
    m.querySelector(':scope>svg')?.remove()
    m.style.margin = ''
    if (!m.offsetWidth) return
    const { boxes, base, desc, fs, lh, ws } = inkOf(m)
    if (!boxes.length) return
    const R = rng(seed * 97 + 5), sw = Math.max(5, Math.min(10, fs * .085)), pad = GAP + sw / 2 + 2
    const x0 = Math.min(...boxes.map(b => b[0])), y0 = Math.min(...boxes.map(b => b[1])), x1 = Math.max(...boxes.map(b => b[2])), y1 = Math.max(...boxes.map(b => b[3]))
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, e = .5, q = 2 / e
    const A0 = (x1 - x0) / 2 + pad, B0 = (y1 - y0) / 2 + pad, d = pad * .7071
    const tests = boxes.flatMap(b => [[b[0] - pad, b[1]], [b[0] - pad, b[3]], [b[2] + pad, b[1]], [b[2] + pad, b[3]], [b[0], b[1] - pad], [b[2], b[1] - pad], [b[0], b[3] + pad], [b[2], b[3] + pad],
      [b[0] - d, b[1] - d], [b[2] + d, b[1] - d], [b[0] - d, b[3] + d], [b[2] + d, b[3] + d]])
    const inside = (A, B, tilt) => tests.every(([x, y]) => {
      const dx = x - cx, dy = y - cy, u = dx * Math.cos(tilt) + dy * Math.sin(tilt), v = -dx * Math.sin(tilt) + dy * Math.cos(tilt)
      return Math.abs(u / A) ** q + Math.abs(v / B) ** q <= .95 ** q
    })
    let rx = A0 * 2, ry = B0 * 2, tilt = 0, best = Infinity
    for (let t = -.09; t <= .001; t += .015) for (let b = 1; b <= 2.2; b += .02) {
      let lo = 1, hi = 3
      if (!inside(A0 * hi, B0 * b, t)) continue
      for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; inside(A0 * mid, B0 * b, t) ? hi = mid : lo = mid }
      const cost = A0 * hi + 2 * B0 * b
      if (cost < best) { best = cost; rx = A0 * hi; ry = B0 * b; tilt = t }
    }
    const a0 = -2.5 + (R() - .5) * .4, N = 26, pts = []
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = a0 + t * Math.PI * 2 * 1.08, k = .97 + .06 * t + .02 * Math.sin(a * 2.3 + seed)
      const c = Math.cos(a), n = Math.sin(a), x = rx * k * Math.sign(c) * Math.abs(c) ** e, y = ry * k * Math.sign(n) * Math.abs(n) ** e
      pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt) + (R() - .5) * 2, cy + x * Math.sin(tilt) + y * Math.cos(tilt) + (R() - .5) * 2])
    }
    const L = Math.min(...pts.map(p => p[0])) - sw / 2, T = Math.min(...pts.map(p => p[1])) - sw / 2
    const Rt = Math.max(...pts.map(p => p[0])) + sw / 2, B = Math.max(...pts.map(p => p[1])) + sw / 2
    const w = m.offsetWidth
    const prev = m.previousSibling?.textContent ?? '', next = m.nextSibling?.textContent ?? ''
    if (/\S\s*$/.test(prev)) m.style.marginLeft = Math.max(0, -L + GAP - (/\s$/.test(prev) ? ws : 0)) + 'px'
    if (/^\s*\S/.test(next)) m.style.marginRight = Math.max(0, Rt - w + GAP - (/^\s/.test(next) ? ws : 0)) + 'px'
    const block = m.parentElement, top = m.getBoundingClientRect().top - block.getBoundingClientRect().top
    if (top > lh * .5) { const dd = (base - lh + desc + GAP) - T; if (dd > 0) m.style.marginTop = dd + 'px' }
    const ox = -L, oy = -T, W = Rt - L, H = B - T
    const s = document.createElementNS(NS, 'svg')
    s.setAttribute('width', W.toFixed(1)); s.setAttribute('height', H.toFixed(1)); s.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`); s.setAttribute('aria-hidden', 'true')
    s.style.left = -ox + 'px'; s.style.top = -oy + 'px'
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', smooth(pts.map(([x, y]) => [x + ox, y + oy]))); p.setAttribute('stroke-width', sw.toFixed(1)); s.appendChild(p)
    p.style.setProperty('--len', (p.getTotalLength() + 2).toFixed(0))
    m.appendChild(s)
  }
  const drawMarks = root => { const all = [...document.querySelectorAll('.mk')]; root.querySelectorAll('.mk').forEach(m => drawMark(m, all.indexOf(m) + 1)) }
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls) }
  const drawLens = root => root.querySelectorAll('path.draw,line.draw,polyline.draw,circle.draw').forEach(p => {
    try { p.style.setProperty('--len', (p.getTotalLength() + 2).toFixed(0)) } catch { /* not rendered */ }
  })

  /* ---------- count-up: <span class="count" data-to="43.4" data-dec="1">; starts at 70% (data-from) so the first frame reads ---------- */
  const fmt = (v, dec) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  const countRest = root => root.querySelectorAll('.count[data-to]').forEach(c => { c.textContent = fmt(+c.dataset.to, +(c.dataset.dec || 0)) + (c.dataset.suf || '') })
  const countPlay = root => root.querySelectorAll('.count[data-to]').forEach(c => {
    const to = +c.dataset.to, from = +(c.dataset.from ?? to * .7), dec = +(c.dataset.dec || 0), suf = c.dataset.suf || '', d = +(c.dataset.d || 900), delay = (+(c.style.getPropertyValue('--t') || 0)) * 1000, t0 = performance.now() + delay
    const tick = now => { const p = Math.min(1, Math.max(0, (now - t0) / d)), e = 1 - Math.pow(1 - p, 3); c.textContent = fmt(from + (to - from) * e, dec) + suf; if (p < 1) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })

  /* ---------- steps (intro only) ---------- */
  const ctx = () => ({ animate: !REDUCE && !PRINT, reduce: REDUCE, print: PRINT })
  function setStep(id, n) {
    const h = hooks[id]
    if (!h || !h.steps) return
    n = ((n % (h.steps + 1)) + h.steps + 1) % (h.steps + 1)
    stepOf[id] = n
    h.set?.(n, ctx())
  }
  const rest = id => {
    const h = hooks[id], el = document.getElementById(id)
    if (h?.steps) { stepOf[id] = 0; h.set?.(0, { ...ctx(), animate: false }) }
    if (el) { countRest(el); if (el.classList.contains('appendix')) closeCard(el) }
    h?.rest?.(el)
  }

  /* ---------- drift: one clock ---------- */
  const syncDrift = root => {
    if (REDUCE || PRINT || !root.getAnimations) return
    for (const a of root.getAnimations({ subtree: true })) if ((a.animationName === 'sky-drift' || a.animationName?.startsWith('amb-')) && a.startTime !== 0) a.startTime = 0
  }

  /* ---------- parallax: [data-depth] children of .parallax follow the pointer, subtly ---------- */
  const parallax = (x, y) => {
    if (REDUCE || PRINT) return
    slides[cur]?.querySelectorAll('.parallax>[data-depth]').forEach(l => { const k = +l.dataset.depth * 40; l.style.transform = `translate(${(-x * k).toFixed(1)}px,${(-y * k * .6).toFixed(1)}px)` })
  }

  /* ---------- auto ink: every slide gets --ink-auto (readable on its --field) and --on-brand (on its --brand) ----------
     Fields can be gradients: the ink is chosen against the average luminance of their colour stops, so keep --field to
     the colour behind the text and layer glows in `background`. Set --ink-auto in CSS to override. Items with their
     own backgrounds call Deck.inkOn(colour) directly. */
  const cx1 = document.createElement('canvas').getContext('2d')
  const rgbOf = s => { cx1.fillStyle = '#010203'; cx1.fillStyle = s.trim(); const v = cx1.fillStyle; if (v === '#010203') return null; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)); const m = v.match(/[\d.]+/g); return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null }
  const relLum = ([r, g, b]) => { const f = c => (c /= 255) <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) }
  const COLOR_RE = /#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch|oklab|lab|lch|color)a?\([^()]*\)/gi
  const INK_DARK = '#14161E', INK_LIGHT = '#FFFFFF'
  function inkOn(value) {
    if (!value) return null
    const cs = (String(value).match(COLOR_RE) || [String(value)]).map(rgbOf).filter(Boolean)
    if (!cs.length) return null
    const L = cs.reduce((a, c) => a + relLum(c), 0) / cs.length
    return (1.05 / (L + .05)) >= ((L + .05) / (relLum(rgbOf(INK_DARK)) + .05)) ? INK_LIGHT : INK_DARK
  }
  const autoInk = () => document.querySelectorAll('section.slide').forEach(el => {
    const cs = getComputedStyle(el), f = cs.getPropertyValue('--field').trim() || cs.getPropertyValue('--f0').trim(), b = cs.getPropertyValue('--brand').trim()
    // a slide (or pack) that sets --ink-auto / --on-brand itself in CSS keeps its own choice
    const mine = k => el.style.getPropertyValue(k) !== '' || cs.getPropertyValue(k).trim() === ''
    const i = inkOn(f), o = inkOn(b)
    if (i && mine('--ink-auto')) el.style.setProperty('--ink-auto', i)
    if (o && mine('--on-brand')) el.style.setProperty('--on-brand', o)
  })

  autoInk() // now, so slide scripts can read --ink-auto at init; again in start() after theme and lib styles settle

  /* ---------- one clock for ambient life ---------- */
  const tickers = [], changeFns = []
  let started = false
  const stillAll = () => tickers.forEach(k => k.fn(k.printT, k.el, true))
  const runClock = now => {
    const t = now / 1000, s = slides[cur]
    for (const k of tickers) if (k.always || k.slide === s) k.fn(t, k.el, false)
    requestAnimationFrame(runClock)
  }

  /* ---------- appendix ---------- */
  const CARD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=']
  function openCard(el, k) {
    el.querySelectorAll('.acard').forEach(c => c.classList.toggle('on', c.dataset.card === String(k)))
    const card = el.querySelector(`.acard[data-card="${k}"]`)
    if (!card) return
    el.classList.add('open'); drawLens(card); if (!REDUCE) replay(card, 'play'); card.classList.add('play')
    try { history.replaceState(null, '', location.search + '#' + numOf(el) + '.' + k) } catch { /* file:// */ }
  }
  function closeCard(el) {
    const was = el.classList.contains('open')
    el.classList.remove('open'); el.querySelectorAll('.acard.on').forEach(c => c.classList.remove('on', 'play'))
    if (was && el.classList.contains('active')) try { history.replaceState(null, '', location.search + '#' + numOf(el)) } catch { /* file:// */ }
  }

  /* ---------- notes ---------- */
  let notesEl = null
  const showNotes = () => { if (!notesEl) return; const a = slides[cur]?.querySelector('aside.notes'); notesEl.innerHTML = a ? a.innerHTML : '<i>No notes on this slide.</i>' }

  /* ---------- navigation ---------- */
  const numOf = el => +(el.id.match(/^s(\d+)$/)?.[1] ?? NaN)
  let pos = null
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i))
    if (i === cur) return
    const dir = i > cur ? 1 : -1, prev = slides[cur], jump = cur >= 0 && Math.abs(i - cur) !== 1
    stopSeq()
    if (prev) { prev.classList.remove('active', 'enter', 'play'); hooks[prev.id]?.leave?.(prev); rest(prev.id) }
    cur = i
    const el = slides[cur]
    el.classList.add('active')
    syncDrift(el)
    const n = numOf(el)
    if (parseInt(location.hash.slice(1), 10) !== n) try { history.replaceState(null, '', location.search + '#' + (Number.isFinite(n) ? n : cur)) } catch { /* file:// */ }
    if (!REDUCE) replay(el, 'enter')
    const play = !REDUCE && !PRINT && dir > 0
    if (play) { replay(el, 'play'); countPlay(el) } else el.classList.remove('play')
    hooks[el.id]?.enter?.(el, { ...ctx(), dir, jump, from: prev ? numOf(prev) : null, play })
    if (!REDUCE) el.querySelectorAll('.mk').forEach(m => replay(m, 'draw'))
    if (pos) pos.textContent = `${cur + 1} / ${slides.length}`
    showNotes()
    changeFns.forEach(f => f(el, { ...ctx(), dir, jump, from: prev ? numOf(prev) : null, play }))
  }
  const fromHash = () => {
    const [a, b] = location.hash.slice(1).split('.')
    const n = parseInt(a, 10)
    if (!Number.isFinite(n)) return [0, null]
    const k = slides.findIndex(s => numOf(s) === n)
    return [k >= 0 ? k : 0, b ?? null]
  }
  const forward = () => { const h = hooks[slides[cur].id]; if (h?.next?.(ctx()) !== true) go(cur + 1) }
  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const k = e.key, el = slides[cur]
    if (k === 'Enter' && e.target.closest('a,button')) return
    if (el?.classList.contains('appendix')) {
      const ci = CARD_KEYS.indexOf(k)
      if (ci >= 0 && el.querySelector(`.acard[data-card="${ci + 1}"]`)) { e.preventDefault(); openCard(el, ci + 1); return }
      if (el.classList.contains('open') && ['Escape', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) { e.preventDefault(); closeCard(el); return }
    }
    if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(k)) { e.preventDefault(); forward(); return }
    if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(k)) { e.preventDefault(); go(cur - 1); return }
    if (k === 'Home') { e.preventDefault(); go(0); return }
    if (k === 'End') { e.preventDefault(); go(slides.length - 1); return }
    if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); return }
    if (k === 'n' || k === 'N') { document.body.classList.toggle('notes'); showNotes(); return }
    if (/^[0-9]$/.test(k)) {
      const j = slides.findIndex(s => numOf(s) === (k === '0' ? 10 : +k))
      if (j < 0) return
      e.preventDefault(); go(j)
    }
  }

  function finalAll() {
    stopSeq()
    slides.forEach(el => { el.classList.remove('enter', 'play'); rest(el.id); hooks[el.id]?.final?.(el) })
    stillAll()
    document.querySelectorAll('.mk.draw').forEach(m => m.classList.remove('draw'))
  }

  window.Deck = {
    PRINT, REDUCE,
    // several Deck.on calls for one slide compose: each hook runs; next() consumes if any returns true
    on(id, hook) {
      const h = hooks[id]
      if (!h) { hooks[id] = hook; return }
      const both = { ...h, ...hook }
      for (const k of ['enter', 'leave', 'rest', 'final', 'set']) if (h[k] && hook[k]) both[k] = (...a) => { h[k](...a); hook[k](...a) }
      if (h.next && hook.next) both.next = (...a) => h.next(...a) === true || hook.next(...a) === true
      hooks[id] = both
    },
    step(id, n) { setStep(id, n) },
    seq(id, list) {
      stopSeq()
      if (REDUCE || PRINT) return
      seqTimers = list.map(([ms, fn]) => setTimeout(() => { if (slides[cur]?.id === id) fn() }, ms))
    },
    stepOf: id => stepOf[id] || 0,
    clock(el, fn, o = {}) { const k = { el, fn, slide: el.closest('section.slide'), printT: o.printT ?? 12, always: !!o.always }; tickers.push(k); if (started && (PRINT || REDUCE)) fn(k.printT, el, true); return () => { const i = tickers.indexOf(k); if (i >= 0) tickers.splice(i, 1) } },
    reink: autoInk,
    onChange(fn) { changeFns.push(fn) },
    current: () => slides[cur],
    inkOn,
    stepsOf: id => hooks[id]?.steps || 0,
    start() {
      started = true
      slides = [...document.querySelectorAll('section.slide')]
      autoInk()
      const stage = document.getElementById('stage')
      drawMarks(document); drawLens(document)
      document.fonts?.ready.then(() => drawMarks(document))
      addEventListener('beforeprint', finalAll)
      if (PRINT) {
        document.documentElement.classList.add('print'); finalAll()
        // canvas and marker finals depend on fonts: run once more after they load, then flag ready for export
        Promise.resolve(document.fonts?.ready).then(() => setTimeout(() => { drawMarks(document); finalAll(); document.documentElement.dataset.ready = '1' }, 0))
        return
      }
      const BAND = 64
      const nav = document.createElement('nav')
      nav.className = 'nav'; nav.setAttribute('aria-label', 'Slides')
      nav.innerHTML = '<button type="button" aria-label="Previous slide">←</button><span class="pos"></span><button type="button" aria-label="Next slide">→</button>'
      const [prevB, nextB] = nav.querySelectorAll('button')
      pos = nav.querySelector('.pos')
      prevB.addEventListener('click', () => go(cur - 1))
      nextB.addEventListener('click', () => forward())
      nav.addEventListener('mousedown', e => e.preventDefault())
      document.body.appendChild(nav)
      notesEl = document.createElement('div'); notesEl.id = 'notes'; document.body.appendChild(notesEl)
      const fit = () => {
        const s = Math.min(innerWidth / 1920, (innerHeight - BAND) / 1080)
        stage.style.top = (innerHeight - BAND) / 2 + 'px'
        stage.style.transform = `translate(-50%,-50%) scale(${s})`
      }
      addEventListener('resize', fit); fit()
      stage.addEventListener('click', e => {
        if (e.button !== 0) return
        const el = slides[cur]
        if (el?.classList.contains('appendix')) {
          const t = e.target.closest('[data-card]')
          if (t && !t.classList.contains('acard')) { openCard(el, t.dataset.card); return }
          if (el.classList.contains('open')) { closeCard(el); return }
        }
        if (e.target.closest('[data-click],a,button,input,select,textarea,label')) return
        if (getSelection()?.toString()) return
        forward()
      })
      slides.forEach(el => rest(el.id))
      const [first, card] = fromHash()
      go(first)
      if (card && slides[cur].classList.contains('appendix')) openCard(slides[cur], card)
      addEventListener('hashchange', () => { const [i, c] = fromHash(); go(i); if (c && slides[cur].classList.contains('appendix')) openCard(slides[cur], c) })
      addEventListener('keydown', onKey)
      addEventListener('pointermove', e => parallax(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5))
      syncDrift(document)
      if (REDUCE) stillAll(); else requestAnimationFrame(runClock)
      let idle
      addEventListener('mousemove', () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2000) })
    }
  }
})()
