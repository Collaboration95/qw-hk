#!/usr/bin/env node
// Install a pack item (assets/packs/<kind>/<name>) into a deck.
//   node use-pack.mjs <kind>/<name> <deck dir> [--as N] [--into N] [--word "Product"] [--force]
//   --as N    write the item's slide.html as src/slides/NN-<name>.html (a reveal is --as 0; replaces 00-*.html with --force)
//   --into N  insert the item's part.html (a scene layer) as the first child of slide N's <section>
//   --word W  replace __WORD__ (the product name) in what is written
//   --demo    also copy the item's demo/NN-*.html slides (carry devices ship multi-slide demos), numbered as named
//   --mark M  replace __MARK__ with the product's mark: a file.svg (its inner markup; strokes in a 24 × 24 viewBox read
//             best) or a generic mark name from assets/packs/_fuzz/fuzz.json (default "rising")
// Always copies lib/* → src/lib/ and assets/<name>/ → src/assets/<name>/ (existing files kept unless --force).
// Tokens: __N__ → the slide number, __WORD__ → the product name. Then edit the copy: it is yours now.
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const pos = args.filter((a, i) => !a.startsWith('--') && !['--as', '--into', '--word', '--mark'].includes(args[i - 1]))
if (args.includes('--help') || pos.length < 2) { console.log('usage: node use-pack.mjs <kind>/<name> <deck dir> [--as N] [--into N] [--word W] [--mark M] [--force]'); process.exit(pos.length < 2 && !args.includes('--help') ? 1 : 0) }
const force = args.includes('--force')
const item = resolve(here, '..', 'assets', 'packs', pos[0]), name = basename(item)
const src = join(resolve(pos[1]), 'src')
const fail = m => { console.error(`use-pack: ${m}`); process.exit(1) }
if (!existsSync(join(item, 'item.json'))) fail(`no pack item at ${item}`)
if (!existsSync(src)) fail(`${src} missing: scaffold the deck first (new-deck.mjs)`)
const word = opt('--word'), markArg = opt('--mark') ?? 'rising'
const fuzz = JSON.parse(readFileSync(resolve(here, '..', 'assets', 'packs', '_fuzz', 'fuzz.json'), 'utf8'))
let mark = fuzz.marks[markArg]
if (!mark) {
  if (!existsSync(markArg)) fail(`--mark ${markArg}: not a file and not one of ${Object.keys(fuzz.marks).join(', ')}`)
  mark = readFileSync(markArg, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim()
}
const fill = (s, n) => { s = s.replaceAll('__N__', String(n)).replaceAll('__MARK__', mark); return word ? s.replaceAll('__WORD__', word) : s }
const done = []
if (existsSync(join(item, 'lib'))) {
  mkdirSync(join(src, 'lib'), { recursive: true })
  for (const f of readdirSync(join(item, 'lib'))) {
    const to = join(src, 'lib', f)
    if (existsSync(to) && !force) { done.push(`kept src/lib/${f}`); continue }
    cpSync(join(item, 'lib', f), to); done.push(`src/lib/${f}`)
  }
}
if (existsSync(join(item, 'assets', name))) { cpSync(join(item, 'assets', name), join(src, 'assets', name), { recursive: true, force }); done.push(`src/assets/${name}/`) }
const as = opt('--as')
if (as !== undefined) {
  if (!existsSync(join(item, 'slide.html'))) fail(`${pos[0]} has no slide.html (use --into for a scene part)`)
  const n = +as, nn = String(n).padStart(2, '0'), dir = join(src, 'slides')
  const clash = readdirSync(dir).filter(f => f.startsWith(nn + '-'))
  if (clash.length && !force) fail(`slide ${nn} exists (${clash.join(', ')}); pass --force to replace it`)
  clash.forEach(f => rmSync(join(dir, f)))
  writeFileSync(join(dir, `${nn}-${name}.html`), fill(readFileSync(join(item, 'slide.html'), 'utf8'), n)); done.push(`src/slides/${nn}-${name}.html`)
}
if (args.includes('--demo') && existsSync(join(item, 'demo'))) {
  for (const f of readdirSync(join(item, 'demo')).filter(f => /^\d\d-.+\.html$/.test(f))) {
    const n = +f.slice(0, 2), to = join(src, 'slides', f)
    if (readdirSync(join(src, 'slides')).some(x => x.startsWith(f.slice(0, 3))) && !force) { done.push(`kept slide ${f.slice(0, 2)} (exists)`); continue }
    writeFileSync(to, fill(readFileSync(join(item, 'demo', f), 'utf8'), n)); done.push(`src/slides/${f}`)
  }
}
const into = opt('--into')
if (into !== undefined) {
  if (!existsSync(join(item, 'part.html'))) fail(`${pos[0]} has no part.html`)
  const n = +into, nn = String(n).padStart(2, '0'), dir = join(src, 'slides')
  const f = readdirSync(dir).find(x => x.startsWith(nn + '-'))
  if (!f) fail(`no slide ${nn} in ${dir}`)
  const html = readFileSync(join(dir, f), 'utf8'), part = fill(readFileSync(join(item, 'part.html'), 'utf8'), n).trim()
  const m = html.match(/<section\b[^>]*\bclass="[^"]*\bslide\b[^"]*"[^>]*>/)
  if (!m) fail(`${f}: no <section class="slide">`)
  writeFileSync(join(dir, f), html.replace(m[0], `${m[0]}\n  ${part.replace(/\n/g, '\n  ')}`)); done.push(`${part.split('\n')[0].slice(0, 60)}… → slides/${f}`)
}
if (!word && (as !== undefined || into !== undefined)) console.log('use-pack: no --word given; search the slide for __WORD__')
console.log(`use-pack: ${pos[0]}\n  ${done.join('\n  ')}`)
