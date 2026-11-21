/* The morning board: the carry device. A small split-flap clock hangs from the top edge of every spoken slide and
   the appendix. On a forward change it flips from the previous slide's time to this one's while the content cuts
   (≤ 1.2 s): the release morning moves on as the pitch goes, landing on 08:00 when the revision arrives (slide 3).
   On the close it widens and lands on the wordmark, the same board as the reveal. A pigeon sits on its housing.
   Print, jumps, back and reduced motion: each board shows its own row. Edit BOARD to change the hours. */
(() => {
  const BOARD = { s1: '07:30', s2: '07:45', s3: '08:00', s4: '08:05', s5: '08:20', s6: '   RECALL PRESS ', s9: '08:30' }
  const W = 16   // the close's board: blank · mark · blank · RECALL PRESS · blank, as in the reveal
  const rows = {}
  const pigeon = `<svg class="rp-pigeon" viewBox="0 0 60 40" aria-hidden="true"><g class="body"><path d="M6 27c4-9 14-13 25-12 6 0 10-3 12-7 3-4 9-4 11 0 1 2 0 4-2 5l-3 1c-1 6-4 12-10 15-8 4-20 4-28 2-3-1-6-2-5-4z"/><path d="M2 25l9-3-2 6z"/></g><g class="head"><circle cx="49" cy="7" r="5"/><path d="M53 6l5 1.5-5 1z"/></g><path class="legs" d="M27 33v5M32 33v5" stroke-width="1.6" stroke-linecap="round"/></svg>`
  Object.entries(BOARD).forEach(([id, text]) => {
    const el = document.getElementById(id); if (!el) return
    const wide = text.trim().length > 5
    const hang = document.createElement('div')
    hang.className = 'rp-hang' + (wide ? ' wide' : ''); hang.setAttribute('aria-hidden', 'true')
    hang.innerHTML = `<i class="rod"></i><i class="rod"></i><div class="rp-housing"><div class="rp-row"></div>${pigeon}</div>`
    el.appendChild(hang)
    const n = wide ? W : 5
    const row = RP.flaps(hang.querySelector('.rp-row'), n, { text })
    if (wide) row.cells[1].c.classList.add('mark')
    rows[id] = { row, text, n, hang }
    // the pigeon: bobs its head every 7 s, shuffles along the housing every 41 s; same clock on every slide
    const pg = hang.querySelector('.rp-pigeon'), head = pg.querySelector('.head')
    Deck.clock(hang, (t, _, still) => {
      const b = t % 7, bob = !still && b < .5 ? Math.sin(b / .5 * Math.PI) * 4 : 0
      head.setAttribute('transform', `translate(${(bob * .6).toFixed(2)} ${bob.toFixed(2)})`)
      const s = t % 41, shuffle = still ? 0 : s < 1.2 ? Math.sin(s / 1.2 * Math.PI / 2) * 14 : s < 22 ? 14 : s < 23.2 ? 14 - Math.sin((s - 22) / 1.2 * Math.PI / 2) * 14 : 0
      const hop = !still && ((s < 1.2) || (s > 22 && s < 23.2)) ? Math.abs(Math.sin((s % 22) * Math.PI * 2.5)) * 3 : 0
      pg.style.transform = `translate(${shuffle.toFixed(1)}px,${(-hop).toFixed(1)}px)`
    }, { printT: 3 })
  })
  const pad = (s, n) => s.padStart(n, ' ')
  Deck.onChange((el, ctx) => {
    const cur = rows[el.id]; if (!cur) return
    const prev = rows['s' + ctx.from]
    if (!ctx.play || !prev || ctx.jump) return cur.row.set(cur.text)
    // on the close the board widens: the clock's digits run on into the wordmark
    const from = cur.n === prev.n ? prev.text : cur.n > prev.n ? pad(prev.text, cur.n) : prev.text.slice(-cur.n)
    cur.row.play(from, cur.text, { stagger: cur.n > 5 ? .035 : .07, dt: .05, maxFlips: cur.n > 5 ? 9 : 6, churn: false })
  })
})()
