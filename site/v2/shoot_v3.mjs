// node site/v2/shoot_v3.mjs <port> [only]   (serve site/v2/port with python3 -m http.server <port>) -> site/v2/out/v3/*.png
// Shoots the port previews (pages wrapped the way Hashmeta renders them). Scrolls each page once so the
// scroll-triggered motion (run log, history chart) has played, then takes the shot. Reports horizontal scroll,
// tap targets under 44px and banned words in visible text.
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(here + '/../../deck/');
const { chromium } = require('playwright-core');
const port = process.argv[2] || '8768', only = process.argv[3], base = `http://127.0.0.1:${port}/preview`;
const OUT = here + '/out/v3';
console.log('checks: horizontal scroll, taps < 44px, banned words, single-word last lines');
const BANNED = /\b(series|vintages?|archived?|archives?|records?|dataset|threshold|cutoff|snapshot|observed|first to current|pp|manual live check|run now|ai-powered|run id)\b/gi;
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
async function shot(path, w, file, full = true) {
  if (only && !file.startsWith(only)) return;
  const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: w > 500 ? 1 : 2, reducedMotion: full ? 'reduce' : 'no-preference' });
  p.on('pageerror', e => console.log('PAGEERROR', file, e.message));
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (full) {
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 300) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(450); }
    await p.evaluate(() => scrollTo(0, 0));
  }
  await p.waitForTimeout(3200);
  const r = await p.evaluate((src) => {
    const re = new RegExp(src, 'gi');
    const vis = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden'; };
    const small = [...document.querySelectorAll('main a, main button, header a, footer a, summary')].filter(a => {
      const r = a.getBoundingClientRect(); return r.height && r.height < 44 && vis(a) && getComputedStyle(a).display !== 'inline'; })
      .map(a => a.textContent.trim().slice(0, 30));
    const text = document.body.innerText;
    // single-word last lines in headings and copy (mock windows excluded)
    const orphans = [];
    for (const el of document.querySelectorAll('h1, h2, p, dd, li, .b3')) {
      if (!vis(el) || el.closest('.win, .panel, .rp2-step, .key') || !el.getBoundingClientRect().height) continue;
      const words = [];
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode());) {
        const re2 = /\S+/g; let m;
        while ((m = re2.exec(n.data))) {
          const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          const b = r.getClientRects()[0]; if (b && b.width) words.push({ w: m[0], y: Math.round(b.bottom) });
        }
      }
      if (words.length < 3) continue;
      const lines = [...new Set(words.map(w => w.y))];
      if (lines.length > 1 && words.filter(w => Math.abs(w.y - lines[lines.length - 1]) < 4).length === 1)
        orphans.push(words.map(w => w.w).join(' ').slice(0, 60));
    }
    return { sw: document.documentElement.scrollWidth, small, orphans, banned: [...new Set((text.match(re) || []).map(s => s.toLowerCase()))] };
  }, BANNED.source);
  if (r.sw > w) console.log('HSCROLL', file, r.sw);
  if (r.small.length) console.log('SMALL-TAP', file, r.small.join(' | '));
  if (r.banned.length) console.log('BANNED', file, r.banned.join(', '));
  if (r.orphans.length) console.log('ORPHAN', file, r.orphans.join(' | '));
  await p.screenshot({ path: `${OUT}/${file}.png`, fullPage: full });
  await p.close();
}
await shot('/index.html', 1440, 'home-1440');
await shot('/index.html', 1440, 'home-1440-fold', false);
await shot('/index.html', 390, 'home-390');
await shot('/index.html', 390, 'home-390-fold', false);
await shot('/more-how.html', 1440, 'how-1440');
await shot('/more-how.html', 390, 'how-390');
await shot('/figure.html', 1440, 'figure-1440');
await shot('/figure.html', 390, 'figure-390');
await shot('/indicator.html', 1440, 'indicator-1440');
await shot('/indicator.html', 390, 'indicator-390');
await shot('/cover.html', 1440, 'cover-1440');
await shot('/cover.html', 390, 'cover-390');
for (const n of ['figures', 'all', 'about', 'sources']) { await shot(`/more-${n}.html`, 1440, `${n}-1440`); await shot(`/more-${n}.html`, 390, `${n}-390`); }
await b.close();
