#!/usr/bin/env node
// Scaffold a deck from the engine: copies assets/engine/src into <dir>/src (never overwrites an existing src/).
//   node new-deck.mjs <dir> [--title "Product"] [--bare]
//   --bare  engine files only (base.css, deck.js, icons.svg, fonts, theme.css, 00-intro.html); no example slides
// Then: edit src/theme.css and src/slides/, run build.mjs <dir> --watch, export.mjs <dir>.
import { cpSync, existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const dirArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--title')
if (args.includes('--help') || !dirArg) { console.log('usage: node new-deck.mjs <dir> [--title "Product"] [--bare]'); process.exit(args.includes('--help') ? 0 : 1) }
const dir = resolve(dirArg), src = join(dir, 'src')
if (existsSync(src)) { console.error(`new-deck: ${src} already exists; not touching it`); process.exit(1) }
mkdirSync(dir, { recursive: true })
cpSync(join(here, '..', 'assets', 'engine', 'src'), src, { recursive: true })
if (args.includes('--bare')) for (const f of readdirSync(join(src, 'slides'))) if (!f.startsWith('00-')) rmSync(join(src, 'slides', f))
const ti = args.indexOf('--title')
writeFileSync(join(src, 'deck.json'), JSON.stringify({ title: ti >= 0 ? args[ti + 1] : 'Pitch' }, null, 2) + '\n')
console.log(`new-deck: ${src}\n  next: node ${join(here, 'build.mjs')} ${dirArg} --watch   ·   node ${join(here, 'export.mjs')} ${dirArg}`)
