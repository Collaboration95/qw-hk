#!/usr/bin/env node
// Render a deck: one PNG per slide, a contact sheet, a PDF, and a taste lint. Builds src/ first when present.
//   node export.mjs <deck dir> [--no-pdf] [--no-png] [--strict] [--motion] [--pdf-raster | --pdf-vector]
//   PDF: vector, unless it exceeds 5 MB (or --pdf-raster): then one JPEG page per final-state PNG (text not selectable)
//   --motion  also grab each slide 0.3 s and 1.6 s after a forward arrival → out/motion/ (check the story plays and rests)
//   node export.mjs --compare <deckA> <deckB> … [--out <dir>]   filmstrip of several decks (after exporting each)
//
// Outputs in <deck>/out/: NN.png (by slide number), sheet.png (all slides, 3 across), deck.pdf, lint.txt.
// Opens the built index.html from file:// with no server. Fails on a page error, any network request, a font that
// fails to load, a missing image, or a slide that overflows 1920 × 1080. The lint prints warnings (taste rules
// from references/taste.md); --strict makes lint warnings fail too. Domain strings that trip the lint on purpose
// (a regulatory date, "17/17") go in src/deck.json as "lintAllow": ["31 Dec 2020", "17/17"].
//
// Needs Playwright: `playwright` or `playwright-core` resolvable from the deck dir, the cwd or this skill folder,
// plus Chrome. If missing: `npm i --no-save playwright-core` in the deck's project (system Chrome is used).
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve, relative, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flags = new Set(args.filter(a => a.startsWith('--')))
const pos = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')
const fail = m => { console.error(`export: ${m}`); process.exit(1) }
if (flags.has('--help') || !pos.length) {
  console.log('usage: node export.mjs <deck dir> [--no-pdf] [--no-png] [--strict] [--motion]\n       node export.mjs --compare <deckA> <deckB> ... [--out dir]')
  process.exit(flags.has('--help') ? 0 : 1)
}

async function loadChromium(from) {
  for (const base of [from, process.cwd(), here]) {
    const req = createRequire(join(base, 'x.js'))
    for (const name of ['playwright', 'playwright-core']) {
      try { const m = await import(pathToFileURL(req.resolve(name)).href); return { chromium: m.chromium ?? m.default?.chromium, name } } catch { /* next */ }
    }
  }
  fail('Playwright not found. Run `npm i --no-save playwright-core` in the project, then retry.')
}
function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  for (const p of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) if (existsSync(p)) return p
  return undefined
}
async function launch(from) {
  const { chromium, name } = await loadChromium(from)
  const exe = chromePath()
  return chromium.launch(name === 'playwright-core' || exe ? { executablePath: exe, headless: true } : { headless: true })
}

const W = 1920, H = 1080

if (flags.has('--compare')) {
  const decks = pos.map(p => resolve(p))
  const oi = args.indexOf('--out'), outDir = resolve(oi >= 0 ? args[oi + 1] : join(dirname(decks[0]), 'compare'))
  mkdirSync(outDir, { recursive: true })
  const rows = decks.map(d => {
    const o = join(d, 'out')
    const pngs = existsSync(o) ? readdirSync(o).filter(f => /^\d\d\.png$/.test(f)).sort() : []
    if (!pngs.length) console.warn(`export: ${d} has no out/NN.png; export it first`)
    return `<section><h2>${basename(d)}</h2><div class="strip">${pngs.map(f => `<img src="${relative(outDir, join(o, f))}">`).join('')}</div></section>`
  }).join('\n')
  const html = `<!doctype html><meta charset="utf-8"><title>Compare</title><style>body{margin:0;padding:24px;background:#1a1a1f;color:#eee;font:600 22px system-ui}h2{margin:18px 0 10px}.strip{display:flex;gap:10px;overflow-x:auto}.strip img{width:384px;height:216px;flex:none;border-radius:6px}</style>${rows}`
  writeFileSync(join(outDir, 'compare.html'), html)
  const browser = await launch(decks[0])
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 400 } })
    await page.goto(pathToFileURL(join(outDir, 'compare.html')).href)
    await page.screenshot({ path: join(outDir, 'compare.png'), fullPage: true })
  } finally { await browser.close() }
  console.log(`compare → ${join(outDir, 'compare.html')} and compare.png`)
  process.exit(0)
}

const deckDir = resolve(pos[0])
if (existsSync(join(deckDir, 'src', 'slides'))) {
  const r = spawnSync(process.execPath, [join(here, 'build.mjs'), deckDir], { stdio: 'inherit' })
  if (r.status !== 0) fail('build failed')
}
const indexFile = join(deckDir, 'index.html')
if (!existsSync(indexFile)) fail(`${indexFile} not found`)
const outDir = join(deckDir, 'out')
const base = pathToFileURL(indexFile).href

const browser = await launch(deckDir)
const problems = [], lint = []
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' })
  const stray = []
  page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && u.split(/[?#]/)[0] !== base) stray.push(u.slice(0, 120)) })
  page.on('pageerror', e => problems.push(`page error: ${e.message}`))
  await page.route(url => /^https?:$/.test(url.protocol), route => route.abort())
  await page.goto(`${base}?print=1`, { waitUntil: 'load' })
  await page.evaluate(async () => { await document.fonts.ready })
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(400)

  const fonts = await page.evaluate(() => [...document.fonts].map(f => ({ family: f.family.replace(/"/g, ''), status: f.status })))
  for (const f of fonts) if (f.status === 'error') problems.push(`font "${f.family}" failed to load`)
  if (stray.length) problems.push(`not self-contained, requested: ${[...new Set(stray)].join(', ')}`)
  const count = await page.$$eval('section.slide', s => s.length)
  if (!count) fail('no <section class="slide"> found')
  const missing = await page.$$eval('img', imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => (i.getAttribute('src') ?? '').slice(0, 60)))
  if (missing.length) problems.push(`missing image(s): ${missing.join(', ')}`)

  // geometry and taste lint, measured on the final (print) state
  let allow = []
  try { allow = JSON.parse(readFileSync(join(deckDir, 'src', 'deck.json'), 'utf8')).lintAllow || [] } catch { /* none */ }
  const report = await page.$$eval('section.slide', (slides, allow) => slides.map(s => {
    const n = +(s.id.match(/^s(\d+)$/)?.[1] ?? -1), r = s.getBoundingClientRect(), out = []
    const appendix = s.classList.contains('appendix')
    const clone = s.cloneNode(true); clone.querySelectorAll('aside.notes,.acard,svg,style,script').forEach(x => x.remove())
    const words = (clone.textContent.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%₩$-]*/gu) || []).length
    const els = [...s.querySelectorAll('*')].filter(e => !e.closest('aside.notes,.acard,svg,.mono,pre,code') && [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()))
    const runs = [], tiny = [], labels = []
    for (const e of els) {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const fs = parseFloat(cs.fontSize), txt = e.textContent.trim().replace(/\s+/g, ' ')
      // count real line boxes of this element's own text (not its children), so mixed font sizes don't inflate it
      const tops = new Set()
      for (const c of e.childNodes) if (c.nodeType === 3 && c.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(c); for (const r of rg.getClientRects()) if (r.width > 1) tops.add(Math.round(r.top / 4)) }
      if (!appendix && tops.size >= 3 && fs < 70) runs.push(txt.slice(0, 50))
      if (fs < 22) tiny.push(`${Math.round(fs)}px "${txt.slice(0, 30)}"`)
      const ls = parseFloat(cs.letterSpacing) || 0
      if (cs.textTransform === 'uppercase' && ls / fs >= .05 && fs <= 40 && txt.length < 48) labels.push(txt)
    }
    let text = clone.textContent.replace(/\s+/g, ' ')
    for (const ok of allow) text = text.split(ok).join(' ')
    const banned = [
      [/\b(honest(ly)?|limitations?|caveats?|hard-?coded|assumptions?|demo data|not measured|disclaimer)\b/i, 'caveat/limits wording: say it aloud, keep it off the slide'],
      [/\b(criteri(a|on)|judging|rubric|technical depth|creativity)\b/i, 'judging-criteria label'],
      [/\b(\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}|20\d\d-\d\d-\d\d)\b/, 'a date'],
      [/\b(slide \d+|\d+ ?\/ ?\d+)\b/i, 'a slide counter or "N / M" on the slide'],
      [/\b(source|docs?\/|\.md\b|\.js\b|\.ts\b|\.py\b)/i, 'file path or source reference'],
    ]
    for (const [re, why] of banned) { const m = text.match(re); if (m) out.push(`${why}: "${m[0]}"`) }
    const phones = [...s.querySelectorAll('img')].filter(i => i.naturalWidth && i.naturalHeight / i.naturalWidth > 1.7 && !i.closest('.phone'))
    if (phones.length) out.push(`${phones.length} phone-shaped screenshot(s) not inside .phone`)
    const h1 = s.querySelector('h1,h2'), hw = h1 ? (h1.textContent.trim().match(/\S+/g) || []).length : 0
    return { n, w: Math.round(r.width), h: Math.round(r.height), sw: s.scrollWidth, sh: s.scrollHeight, words, hw, runs, tiny, labels, marks: s.querySelectorAll('.mk').length, out, appendix }
  }), allow)
  let marks = 0
  for (const g of report) {
    marks += g.marks
    if (g.w !== W || g.h !== H) problems.push(`slide ${g.n} is ${g.w}×${g.h}, expected ${W}×${H}`)
    else if (g.sw > W + 1 || g.sh > H + 1) problems.push(`slide ${g.n} content overflows its frame (${g.sw}×${g.sh})`)
    const L = m => lint.push(`slide ${g.n}: ${m}`)
    if (!g.appendix && g.words > 60) L(`${g.words} words on the slide (budget ~45, hard max 60)`)
    if (g.hw > 12) L(`headline is ${g.hw} words (keep it under ~10)`)
    for (const r of g.runs) L(`text runs to 3+ lines: "${r}…"`)
    for (const t of g.tiny) L(`text under 22 px: ${t}`)
    for (const l of g.labels) L(`label/eyebrow: "${l}" (no labels on slides)`)
    for (const o of g.out) L(o)
  }
  if (marks > 3) lint.push(`deck: ${marks} marker loops (use 1–3 in the whole deck)`)

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  if (!flags.has('--no-png')) {
    const els = await page.$$('section.slide')
    const shots = []
    for (const [i, el] of els.entries()) {
      const file = `${String(report[i].n).padStart(2, '0')}.png`
      const buf = await el.screenshot({ path: join(outDir, file) })
      shots.push([report[i].n, file, buf.toString('base64')])
    }
    // white / paper background check: share of near-white pixels on a sparse grid
    for (const [n, , b64] of shots) {
      const white = await page.evaluate(async b64 => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
        const c = document.createElement('canvas'); c.width = 192; c.height = 108; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 192, 108)
        const d = x.getImageData(0, 0, 192, 108).data; let w = 0
        for (let i = 0; i < d.length; i += 4) if (d[i] > 236 && d[i + 1] > 232 && d[i + 2] > 225) w++
        return w / (192 * 108)
      }, b64)
      if (white > .55) lint.push(`slide ${n}: ${Math.round(white * 100)}% near-white pixels (no white/paper slide backgrounds; white cards on a coloured field)`)
    }
    const sheet = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#26262c;display:grid;grid-template-columns:repeat(3,620px);gap:14px;font:600 18px system-ui;color:#ddd}figure{margin:0}img{width:620px;height:349px;display:block;border-radius:4px}figcaption{padding:4px 2px}</style>${shots.map(([n, f]) => `<figure><img src="${f}"><figcaption>${n}</figcaption></figure>`).join('')}`
    writeFileSync(join(outDir, 'sheet.html'), sheet)
    const sp = await browser.newPage({ viewport: { width: 1920, height: 400 } })
    await sp.goto(pathToFileURL(join(outDir, 'sheet.html')).href); await sp.waitForTimeout(200)
    await sp.screenshot({ path: join(outDir, 'sheet.png'), fullPage: true }); await sp.close()
    console.log(`${shots.length} PNGs + sheet.png → ${relative(process.cwd(), outDir) || outDir}/`)
  }
  if (flags.has('--motion')) {
    // arrival check: load each slide fresh by #N (a forward arrival plays), grab at 0.3 s and 1.6 s
    const mdir = join(outDir, 'motion'); mkdirSync(mdir, { recursive: true })
    const mp = await browser.newPage({ viewport: { width: W, height: H + 64 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
    for (const g of report) {
      const id = String(g.n).padStart(2, '0')
      await mp.goto(`${base}#${g.n}`, { waitUntil: 'load' }); await mp.evaluate(() => document.fonts.ready)
      // a slide with steps (the intro, a reveal in a pack gallery) plays on the first press
      if (await mp.evaluate(() => { const c = Deck.current(); return !!c && Deck.stepsOf(c.id) > 0 })) await mp.keyboard.press('ArrowRight')
      await mp.waitForTimeout(300); await mp.screenshot({ path: join(mdir, `${id}-a.png`), clip: { x: 0, y: 0, width: W, height: H } })
      await mp.waitForTimeout(1300); await mp.screenshot({ path: join(mdir, `${id}-b.png`), clip: { x: 0, y: 0, width: W, height: H } })
      await mp.goto('about:blank')
    }
    await mp.close()
    console.log(`motion frames (0.3 s / 1.6 s after arrival) → ${relative(process.cwd(), mdir) || mdir}/NN-a.png, NN-b.png`)
  }
  if (!flags.has('--no-pdf')) {
    await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' })
    const pdf = await page.pdf({ width: `${W}px`, height: `${H}px`, printBackground: true, preferCSSPageSize: true })
    let final = pdf, how = 'vector'
    // Chrome's vector PDF stores every blended, masked or filtered layer as a lossless image; decks with grain and
    // painted scenes reach 15–35 MB. Over the 5 MB submission budget (or with --pdf-raster), rebuild it from the
    // final-state PNGs as one JPEG page each (pattern from the hr-2026 v7 lane).
    const pngs = existsSync(outDir) ? readdirSync(outDir).filter(f => /^\d\d\.png$/.test(f)).sort() : []
    if ((flags.has('--pdf-raster') || pdf.length > 5 * 1048576) && pngs.length && !flags.has('--pdf-vector')) {
      const rp = await browser.newPage(); await rp.setContent('<html></html>')
      const jpgs = []
      for (const f of pngs) jpgs.push(await rp.evaluate(async src => {
        const i = new Image(); i.src = src; await i.decode()
        const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; c.getContext('2d').drawImage(i, 0, 0, 1920, 1080)
        return c.toDataURL('image/jpeg', .84)
      }, 'data:image/png;base64,' + readFileSync(join(outDir, f)).toString('base64')))
      await rp.setContent(`<!doctype html><style>@page{size:1920px 1080px;margin:0}html,body{margin:0}img{display:block;width:1920px;height:1080px;break-after:page}</style>${jpgs.map(j => `<img src="${j}">`).join('')}`)
      await rp.evaluate(() => Promise.all([...document.images].map(i => i.decode())))
      final = await rp.pdf({ width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true }); how = `raster (vector was ${(pdf.length / 1048576).toFixed(1)} MB)`
      await rp.close()
    }
    writeFileSync(join(outDir, 'deck.pdf'), final)
    console.log(`PDF → ${join(relative(process.cwd(), outDir) || outDir, 'deck.pdf')} (${(final.length / 1048576).toFixed(1)} MB, ${how})`)
  }
} finally {
  await browser.close()
}
writeFileSync(join(outDir, 'lint.txt'), lint.length ? lint.join('\n') + '\n' : 'clean\n')
if (lint.length) console.warn(`lint (${lint.length}):\n  ${lint.join('\n  ')}`)
else console.log('lint: clean')
if (problems.length) { console.error(`export: problems:\n  ${problems.join('\n  ')}`); process.exitCode = 1 }
else if (flags.has('--strict') && lint.length) process.exitCode = 2
