#!/usr/bin/env node
// Build a browsable gallery deck of pack items (assets/packs/*/*): one slide per reveal, story and carry demo,
// one slide per scene time of day. Captions name each item (a catalogue, not a pitch, so the lint does not apply).
//   node pack-gallery.mjs [--only kind/name,kind/name…] [--out dir] [--word "Name"] [--fuzz N] [--seed S] [--export]
//   default --out: assets/packs/gallery · --export also renders out/sheet.png and out/motion/ (no PDF)
//   --fuzz N  renders every reveal and story N more times with a random name, mark and palette from
//             assets/packs/_fuzz/fuzz.json (__WORD__, __MARK__, and --field/--brand/--brand-2 on the section),
//             to prove the item reads on any brand. Seeded (--seed, default 7) so runs compare.
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url)), packs = resolve(here, '..', 'assets', 'packs')
const args = process.argv.slice(2)
if (args.includes('--help')) { console.log('usage: node pack-gallery.mjs [--only kind/name,…] [--out dir] [--word Name] [--fuzz N] [--seed S] [--export]'); process.exit(0) }
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const out = resolve(opt('--out') ?? join(packs, 'gallery')), src = join(out, 'src'), word = opt('--word') ?? 'Lumen'
const only = opt('--only')?.split(',').map(s => s.trim()).filter(Boolean)
const FZ = JSON.parse(readFileSync(join(packs, '_fuzz', 'fuzz.json'), 'utf8')), fuzzN = +(opt('--fuzz') ?? 0)
let seed = +(opt('--seed') ?? 7)
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
const MARKS = Object.keys(FZ.marks)
// shuffled decks: every name, mark and palette is used before any repeats
const deckOf = a => { let q = []; return () => { if (!q.length) { q = [...a]; for (let i = q.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [q[i], q[j]] = [q[j], q[i]] } } return q.pop() } }
const nextWord = deckOf(FZ.words), nextMark = deckOf(MARKS), nextPal = deckOf(FZ.palettes)
const KINDS = ['reveals', 'scenes', 'stories', 'carry']
const items = []
for (const kind of KINDS) {
  if (!existsSync(join(packs, kind))) continue
  for (const name of readdirSync(join(packs, kind)).sort()) {
    const dir = join(packs, kind, name)
    if (!existsSync(join(dir, 'item.json'))) continue
    if (only && !only.includes(`${kind}/${name}`)) continue
    let meta; try { meta = JSON.parse(readFileSync(join(dir, 'item.json'), 'utf8')) } catch (e) { console.error(`skip ${kind}/${name}: item.json: ${e.message}`); continue }
    items.push({ kind, name, dir, meta })
  }
}
if (!items.length) { console.error('pack-gallery: no items found'); process.exit(1) }
if (existsSync(src)) rmSync(src, { recursive: true })
mkdirSync(out, { recursive: true })
cpSync(resolve(here, '..', 'assets', 'engine', 'src'), src, { recursive: true })
for (const f of readdirSync(join(src, 'slides'))) rmSync(join(src, 'slides', f))
mkdirSync(join(src, 'lib'), { recursive: true })
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const fill = (s, n, w = word, m = 'rising') => s.replaceAll('__N__', String(n)).replaceAll('__WORD__', w).replaceAll('__MARK__', FZ.marks[m])
const restyle = (html, pal) => html.replace(/<section\b[^>]*\bclass="[^"]*\bslide\b[^"]*"[^>]*>/, tag => {
  const v = `--field:${pal.field};--brand:${pal.brand};--brand-2:${pal.brand2};`
  return /\sstyle="/.test(tag) ? tag.replace(/\sstyle="/, ` style="${v}`) : tag.replace(/>$/, ` style="${v}">`)
})
const cap = (it, extra = '') => `<div class="pk-cap"><b>${esc(it.meta.title ?? it.name)}</b> · ${it.kind}/${it.name}${extra}<br><span>${esc(it.meta.suits ?? '')}</span></div>`
let n = 1
const index = [], slides = []
for (const it of items) {
  if (existsSync(join(it.dir, 'lib'))) for (const f of readdirSync(join(it.dir, 'lib'))) cpSync(join(it.dir, 'lib', f), join(src, 'lib', f))
  if (existsSync(join(it.dir, 'assets', it.name))) cpSync(join(it.dir, 'assets', it.name), join(src, 'assets', it.name), { recursive: true })
  const add = (html, extra) => {
    if (n > 99) { console.error('pack-gallery: more than 99 slides; use --only'); process.exit(1) }
    const nn = String(n).padStart(2, '0')
    writeFileSync(join(src, 'slides', `${nn}-${it.name}.html`), html.replace(/<\/section>/, `  ${cap(it, extra)}\n</section>`))
    if (!extra.includes('fuzz')) index.push(`<li><i>${n}</i>${esc(it.meta.title ?? it.name)}<em>${it.kind}${extra}</em></li>`); n++
  }
  if (existsSync(join(it.dir, 'slide.html'))) {
    const raw = readFileSync(join(it.dir, 'slide.html'), 'utf8')
    add(fill(raw, n), '')
    if (fuzzN && (it.kind === 'reveals' || it.kind === 'stories')) for (let k = 0; k < fuzzN; k++) {
      const w = nextWord(), m = nextMark(), pal = nextPal()
      add(restyle(fill(raw, n, w, m), pal), ` · fuzz “${w}”, ${m}, ${pal.field.length > 9 ? 'gradient' : pal.field} / ${pal.brand}`)
    }
  }
  if (existsSync(join(it.dir, 'part.html'))) {
    const part = readFileSync(join(it.dir, 'part.html'), 'utf8')
    for (const tod of it.meta.tods ?? [null]) {
      const p = tod == null ? part : part.replace(/data-tod="[^"]*"/, `data-tod="${tod}"`)
      add(`<section class="slide pk-scene" id="s${n}" aria-label="${esc(it.meta.title)}">\n  ${fill(p, n).trim()}\n  <h2 class="pk-demo">Headlines sit on top of the world.</h2>\n</section>\n`, tod == null ? '' : ` · tod ${tod}`)
    }
    // scenes keep their own field; fuzz only their brand accents
    if (fuzzN) for (let k = 0; k < Math.min(fuzzN, 2); k++) {
      const pal = nextPal(), tod = (it.meta.tods ?? [0.5])[k % (it.meta.tods?.length ?? 1)]
      const p = part.replace(/data-tod="[^"]*"/, `data-tod="${tod}"`)
      add(`<section class="slide pk-scene" id="s${n}" style="--brand:${pal.brand};--brand-2:${pal.brand2}" aria-label="${esc(it.meta.title)}">\n  ${fill(p, n).trim()}\n  <h2 class="pk-demo">Headlines sit on top of the world.</h2>\n</section>\n`, ` · fuzz brand ${pal.brand} / ${pal.brand2} · tod ${tod}`)
    }
  }
}
writeFileSync(join(src, 'slides', '00-index.html'), `<section class="slide" id="s0" aria-label="Pack gallery">
  <h1 class="pk-h">Pack gallery · ${items.length} items</h1>
  <ol class="pk-list">${index.join('')}</ol>
</section>\n`)
writeFileSync(join(src, 'theme.css'), `:root{--f0:#1d2b4f}
.pk-cap{position:absolute;left:36px;bottom:30px;z-index:60;max-width:1100px;font:600 24px/1.3 var(--font,system-ui);background:rgba(8,10,20,.78);color:#fff;padding:12px 18px;border-radius:14px}
.pk-cap span{font-weight:450;opacity:.75;font-size:22px}
.pk-demo{position:absolute;left:100px;top:88px;z-index:20;margin:0;font-size:92px;font-weight:800;letter-spacing:-.03em;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.25)}
.pk-h{color:#fff;font-size:72px;margin:0 0 28px}
.pk-list{columns:4;color:#fff;font-size:18px;line-height:1.3;margin:0;padding:0;list-style:none}
.pk-list li{break-inside:avoid}.pk-list i{display:inline-block;width:52px;font-style:normal;opacity:.6}.pk-list em{opacity:.55;margin-left:8px;font-size:15px}
`)
writeFileSync(join(src, 'deck.json'), JSON.stringify({ title: 'Pack gallery' }, null, 2) + '\n')
const b = spawnSync(process.execPath, [join(here, 'build.mjs'), out], { stdio: 'inherit' })
if (b.status) process.exit(b.status)
if (args.includes('--export')) { const e = spawnSync(process.execPath, [join(here, 'export.mjs'), out, '--no-pdf', '--motion'], { stdio: 'inherit' }); if (e.status) process.exit(e.status) }
console.log(`pack-gallery: ${n - 1} slides from ${items.length} items → ${join(out, 'index.html')}`)
