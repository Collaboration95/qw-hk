#!/usr/bin/env node
// Build a deck into ONE self-contained index.html that opens by double-click (file://, no server, no requests).
//   node build.mjs <deck dir>            → <deck>/src/** → <deck>/index.html
//   node build.mjs <deck dir> --watch    → rebuild on every change under src/
//
// Sources (<deck>/src/):
//   base.css             engine tokens + components (from the skill's assets/engine)
//   theme.css            optional: this deck's tokens (fields --f0…--f9, accent, fonts), loaded after base.css
//   deck.js              engine runtime
//   icons.svg            icon sprite, injected at the top of <body>
//   deck.json            optional: { "title": "…", "lintAllow": ["31 Dec 2020"] }
//   lib/*.js, lib/*.json optional: deck-wide code and data, inlined after deck.js (json → window.DATA[name])
//   lib/*.css            optional: deck-wide styles from packs (scenes, reveals), inlined after theme.css
//                        lib files load in name order: prefix (00-data.json, 10-field.js) when one needs another
//   slides/NN-*.html     one file per slide: one <section class="slide" id="sN"> (N = file number), plus optional
//                        <style> (every selector scoped to #sN) and <script> (wrapped in its own function scope and
//                        emitted as its own <script> tag, so one broken slide or lib cannot blank the deck)
// Every <img src>, CSS url() and <img data-inline src="x.svg"> is resolved relative to the file that references it
// and inlined, so the output makes no requests at all. Ported from the tftf finals deck build.
import { readFileSync, writeFileSync, readdirSync, existsSync, watch } from 'node:fs'
import { extname, join, resolve, relative, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
if (args.includes('--help') || !args.find(a => !a.startsWith('--'))) {
  console.log('usage: node build.mjs <deck dir> [--watch]\n  builds <deck>/src → <deck>/index.html (self-contained)')
  process.exit(args.includes('--help') ? 0 : 1)
}
const deckDir = resolve(args.find(a => !a.startsWith('--')))
const src = join(deckDir, 'src')
const out = join(deckDir, 'index.html')
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm' }

export function build() {
  const errors = [], warnings = []
  const dataUri = (ref, fromDir, where) => {
    if (/^(data:|#|https?:)/.test(ref)) { if (/^https?:/.test(ref)) errors.push(`${where}: external reference ${ref} (download it into src/assets/)`); return ref }
    const file = resolve(fromDir, ref)
    if (!existsSync(file)) { errors.push(`${where}: missing asset ${ref} (${relative(deckDir, file)})`); return ref }
    const type = MIME[extname(file).toLowerCase()]
    if (!type) { errors.push(`${where}: unknown asset type ${ref}`); return ref }
    return `data:${type};base64,${readFileSync(file).toString('base64')}`
  }
  // url("…") / url('…') / url(…): quoted values may hold quotes of the other kind and parens (data-URI SVGs)
  const inlineCss = (css, fromDir, where) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]+))\s*\)/g, (m, a, b, c) => {
    const ref = (a ?? b ?? c).trim()
    if (ref.startsWith('data:')) return m
    return `url("${dataUri(ref, fromDir, where)}")`
  })
  const inlineHtml = (html, fromDir, where) => html
    .replace(/<img\b([^>]*?)\bdata-inline\b([^>]*?)>/g, (_, a, b) => {
      const attrs = a + b, ref = attrs.match(/\bsrc="([^"]+)"/)?.[1]
      const file = ref && resolve(fromDir, ref)
      if (!file || !existsSync(file)) { errors.push(`${where}: missing inline svg ${ref}`); return '' }
      const cls = attrs.match(/\bclass="([^"]*)"/)?.[1]
      const keep = [...attrs.matchAll(/\s((?:data-(?!inline\b)[\w-]+|style|id)="[^"]*")/g)].map(m => ' ' + m[1]).join('')
      let svg = readFileSync(file, 'utf8').replace(/<\?xml[^>]*>\s*/, '').trim()
      svg = svg.replace(/\s(role|aria-label)="[^"]*"/g, '').replace(/^<svg\b/, `<svg aria-hidden="true"${cls ? ` class="${cls}"` : ''}${keep}`)
      return svg
    })
    .replace(/(<(?:img|video|source)\b[^>]*?\bsrc=")([^"]+)"/g, (_, pre, ref) => `${pre}${dataUri(ref, fromDir, where)}"`)
    .replace(/style="([^"]*url\([^"]*)"/g, (_, s) => `style="${inlineCss(s.replace(/&quot;/g, '"'), fromDir, where).replace(/"/g, "'")}"`)

  const checkScope = (css, id, where) => {
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
    let depth = 0, buf = '', inKeyframes = 0
    for (const ch of clean) {
      if (ch === '{') {
        const sel = buf.trim(); buf = ''
        if (sel.startsWith('@')) { if (/^@(-webkit-)?keyframes/.test(sel)) inKeyframes = depth + 1 }
        else if (!(inKeyframes && depth >= inKeyframes)) {
          // split on top-level commas only (not inside :is()/:where()/:not())
          const parts = []; let depth = 0, cur = ''
          for (const ch of sel) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch }
          parts.push(cur)
          for (const s of parts) if (!s.includes(`#${id}`)) warnings.push(`${where}: selector "${s.trim()}" is not scoped to #${id}`)
        }
        depth++
      } else if (ch === '}') { depth--; if (inKeyframes && depth < inKeyframes) inKeyframes = 0; buf = '' }
      else if (ch === ';' && depth > 0) buf = ''
      else buf += ch
    }
  }

  const files = existsSync(join(src, 'slides')) ? readdirSync(join(src, 'slides')).filter(f => /^\d\d-.+\.html$/.test(f)).sort() : []
  if (!files.length) errors.push('no slides in src/slides/ (files named NN-name.html)')
  const styles = [], sections = [], scripts = [], seen = new Set()
  for (const f of files) {
    const where = `slides/${f}`, dir = join(src, 'slides')
    let html = readFileSync(join(dir, f), 'utf8')
    const id = `s${parseInt(f, 10)}`
    if (seen.has(id)) errors.push(`${where}: duplicate slide number`)
    seen.add(id)
    html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => { checkScope(css, id, where); styles.push(`/* ${f} */\n${inlineCss(css.trim(), dir, where)}`); return '' })
    html = html.replace(/<script>([\s\S]*?)<\/script>/g, (_, js) => { scripts.push(`/* ${f} */\n;try { (() => {\n${js.trim()}\n})() } catch (e) { setTimeout(() => { throw e }) }`); return '' })
    html = html.replace(/<!--[\s\S]*?-->/g, '').trim()
    const secs = html.match(/<section\b[^>]*\bclass="[^"]*\bslide\b[^"]*"[^>]*>/g) ?? []
    if (secs.length !== 1) errors.push(`${where}: needs exactly one <section class="slide">, found ${secs.length}`)
    else if (!new RegExp(`\\bid="${id}"`).test(secs[0])) errors.push(`${where}: the section's id must be "${id}" (from the file number)`)
    sections.push(inlineHtml(html, dir, where))
  }

  const read = f => existsSync(join(src, f)) ? readFileSync(join(src, f), 'utf8') : ''
  const base = inlineCss(read('base.css'), src, 'base.css')
  const theme = inlineCss(read('theme.css'), src, 'theme.css')
  const icons = read('icons.svg').replace(/<!--[\s\S]*?-->\s*/, '').trim()
  const deck = read('deck.js')
  // src/lib/*.js and *.json: deck-wide code and data (a shared canvas, point data), inlined after deck.js and
  // before the slide scripts. A .json file becomes window.DATA[<name>].
  const libDir = join(src, 'lib'), lib = [], libCss = []
  if (existsSync(libDir)) for (const f of readdirSync(libDir).sort()) {
    const body = readFileSync(join(libDir, f), 'utf8')
    if (f.endsWith('.css')) libCss.push(`/* lib/${f} */\n${inlineCss(body, libDir, 'lib/' + f).trim()}`)
    else if (f.endsWith('.js')) lib.push(`/* lib/${f} */\n;${body.trim()}\n;`)
    else if (f.endsWith('.json')) lib.push(`/* lib/${f} */\n;(window.DATA = window.DATA || {})[${JSON.stringify(f.replace(/\.json$/, ''))}] = ${body.trim()}`)
  }
  if (!base || !deck) errors.push('src/base.css and src/deck.js are required (run new-deck.mjs)')
  let title = basename(deckDir)
  try { title = JSON.parse(read('deck.json') || '{}').title || title } catch { warnings.push('deck.json is not valid JSON') }
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  const html = `<!doctype html>
<!-- Built by pitch-deck/scripts/build.mjs from src/. Do not edit this file; edit the sources and rebuild. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
${base.trim()}

${theme.trim()}

${libCss.join('\n\n')}

${styles.join('\n\n')}
</style>
</head>
<body>
${icons}
<div id="stage">

${sections.join('\n\n')}

</div>
<script>
${deck.trim()}
</script>
${[...lib, ...scripts].map(js => `<script>\n${js}\n</script>`).join('\n')}
<script>Deck.start()</script>
</body>
</html>
`
  for (const m of html.matchAll(/(?:\bsrc=|\bhref=|url\()["']?(https?:[^"')\s]+)/g)) errors.push(`output references ${m[1]}`)
  return { html, errors, warnings, slides: files.length }
}

function run() {
  const { html, errors, warnings, slides } = build()
  for (const w of warnings) console.warn(`build: warning: ${w}`)
  if (errors.length) { console.error(`build: failed:\n  ${errors.join('\n  ')}`); return false }
  writeFileSync(out, html)
  console.log(`build: ${slides} slides → ${relative(process.cwd(), out) || out} (${(html.length / 1024).toFixed(0)} KB, self-contained)`)
  return true
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ok = run()
  if (args.includes('--watch')) {
    let t
    watch(src, { recursive: true }, () => { clearTimeout(t); t = setTimeout(run, 80) })
    console.log(`build: watching ${relative(process.cwd(), src)}/`)
  } else if (!ok) process.exitCode = 1
}
