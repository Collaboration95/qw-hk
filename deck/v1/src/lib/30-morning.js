/* Release morning: the ambient world behind every slide, on ONE clock.
   A Singapore skyline at the horizon (HDB slabs with lit kitchens, the CBD and the three towers with the long deck on
   top), an MRT viaduct with a train crossing, low monsoon cloud drifting, rain that thins slide by slide and a sun that
   comes up at the close. One office window lights late. Colours are mixed from each slide's horizon colour. */
(() => {
  const SCENE = {   // horizon colour, rain (0…1), sun (0…1), cloud opacity
    s0: { h: '#4A3550', rain: .9, sun: 0, cloud: .55 },
    s1: { h: '#3E3A66', rain: .75, sun: 0, cloud: .5 },
    s2: { h: '#2A4C6C', rain: .55, sun: 0, cloud: .45 },
    s3: { h: '#2A6274', rain: .4, sun: .05, cloud: .4 },
    s4: { h: '#7C7489', rain: .26, sun: .2, cloud: .36 },
    s5: { h: '#C08A86', rain: .12, sun: .5, cloud: .3 },
    s6: { h: '#F2B58F', rain: 0, sun: 1, cloud: .26 },
    s9: { h: '#F3BE96', rain: 0, sun: .8, cloud: .22 },
  }
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})` }
  const DARK = '#15142A'
  const rng = (a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 })

  // the city is the same on every slide (same seed), so the eye reads one place at different hours
  const R = rng(20251121)
  const far = [], mid = [], wins = []
  // far: the CBD cluster and the three towers with the long deck
  for (let x = 980; x < 1420;) { const w = 34 + R() * 46, h = 120 + R() * 150; far.push(`M${x.toFixed(0)} 260V${(260 - h).toFixed(0)}h${w.toFixed(0)}V260Z`); x += w + 4 + R() * 10 }
  const mbs = 1520
  for (let k = 0; k < 3; k++) { const x = mbs + k * 62; far.push(`M${x} 260L${x + 6} 128h30l6 132Z`) }
  far.push(`M${mbs - 14} 128c40 -10 150 -10 214 -2l6 9h-224Z`)
  for (let x = 1760; x < 1920;) { const w = 40 + R() * 30, h = 70 + R() * 60; far.push(`M${x.toFixed(0)} 260V${(260 - h).toFixed(0)}h${w.toFixed(0)}V260Z`); x += w + 6 }
  for (let x = 0; x < 960;) { const w = 50 + R() * 40, h = 40 + R() * 70; far.push(`M${x.toFixed(0)} 260V${(260 - h).toFixed(0)}h${w.toFixed(0)}V260Z`); x += w + 10 + R() * 30 }
  // mid: HDB slabs with rows of windows; ~1 in 7 kitchens already lit before dawn
  for (let x = -20; x < 1940;) {
    const w = 70 + R() * 90, h = 60 + R() * 70, y = 260 - h
    mid.push(`M${x.toFixed(0)} 260V${y.toFixed(0)}h${w.toFixed(0)}V260Z`)
    for (let r = y + 10; r < 236; r += 11) for (let c = x + 8; c < x + w - 8; c += 12) if (R() < .11) wins.push([c, r])
    x += w + 18 + R() * 50
  }
  const late = wins.splice(Math.floor(wins.length * .62), 1)[0]   // the one office window that lights late
  const train = []
  for (let k = 0; k < 4; k++) train.push(`<rect x="${k * 132}" y="0" width="126" height="15" rx="5"/>`)
  const trainWin = Array.from({ length: 4 }, (_, k) => `<rect x="${k * 132 + 10}" y="4" width="106" height="4" rx="2"/>`).join('')

  const cloudTile = op => {
    const c = R => `<ellipse cx="${R[0]}" cy="${R[1]}" rx="${R[2]}" ry="${R[3]}"/>`
    const blobs = [[260, 150, 300, 46], [760, 90, 220, 30], [1260, 190, 360, 52], [1700, 120, 260, 36], [520, 300, 240, 26], [1520, 330, 300, 30]].map(c).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter><g fill="#fff" fill-opacity="${op}" filter="url(#b)">${blobs}</g></svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }
  const rainTile = (() => {
    const r = rng(7), l = []
    for (let i = 0; i < 26; i++) { const x = r() * 240, y = r() * 240, len = 14 + r() * 22; l.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(-len * .18).toFixed(1)} ${len.toFixed(1)}" stroke-opacity="${(.25 + r() * .5).toFixed(2)}"/>`) }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><g stroke="#E8ECFF" stroke-width="1.3" stroke-linecap="round">${l.join('')}</g></svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  })()

  document.querySelectorAll('section.slide').forEach(el => {
    const S = SCENE[el.id]; if (!S) return
    const cFar = mix(S.h, DARK, .22), cMid = mix(S.h, DARK, .46), cNear = mix(S.h, DARK, .68)
    const lit = S.sun > .6 ? 'rgba(255,236,200,.0)' : '#FFD9A0'
    const sc = document.createElement('div')
    sc.className = 'rm-scene'; sc.setAttribute('aria-hidden', 'true')
    sc.style.setProperty('--rain', S.rain); sc.style.setProperty('--sun', S.sun)
    sc.innerHTML = `
      <div class="rm-sun"></div>
      <div class="drift rm-cloud" style="opacity:1"><i style="--img:${cloudTile(S.cloud)};--t:1920px;--d:520s"></i></div>
      <div class="rm-rain" style="background-image:${rainTile}"></div><div class="rm-rain rm-rain2" style="background-image:${rainTile}"></div>
      <svg class="rm-city" viewBox="0 0 1920 260" preserveAspectRatio="none">
        <defs><linearGradient id="rm-mist-${el.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.h}" stop-opacity="0"/><stop offset="1" stop-color="${S.h}" stop-opacity=".55"/></linearGradient></defs>
        <path d="${far.join('')}" fill="${cFar}"/>
        <rect x="0" y="150" width="1920" height="110" fill="url(#rm-mist-${el.id})"/>
        <path d="${mid.join('')}" fill="${cMid}"/>
        <g fill="${lit}" class="rm-wins">${wins.map(([x, y]) => `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="6" height="6" rx="1"/>`).join('')}</g>
        <rect class="rm-late" x="${late[0].toFixed(0)}" y="${late[1].toFixed(0)}" width="6" height="6" rx="1" fill="#FFE3B0"/>
        <g class="rm-train" fill="${cNear}"><g>${train.join('')}</g><g fill="${S.sun > .6 ? cNear : '#FFE2AE'}" opacity=".85">${trainWin}</g></g>
        <rect x="0" y="232" width="1920" height="9" fill="${cNear}"/>
        <path d="${Array.from({ length: 13 }, (_, k) => `M${k * 160 + 40} 241h16v19h-16Z`).join('')}" fill="${cNear}"/>
      </svg>`
    el.prepend(sc)
    const tr = sc.querySelector('.rm-train'), lateEl = sc.querySelector('.rm-late')
    // the train: one crossing every 46 s on the deck's clock, 16 s to cross; it eases out of the station on the left
    Deck.clock(sc, (t, _, still) => {
      const ph = t % 46, p = ph / 16
      const x = p < 1 ? -560 + 2540 * (p * p * (3 - 2 * p) * .25 + p * .75) : 2400
      tr.setAttribute('transform', `translate(${x.toFixed(1)} 217)`)
      lateEl.style.opacity = still ? 1 : ((t % 64) > 22 ? 1 : 0)
    }, { printT: 9.5 })
  })
})()
