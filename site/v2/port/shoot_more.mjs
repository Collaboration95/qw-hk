// node port/shoot_more.mjs <port> [only]  (serve site/v2/port with python3 -m http.server) -> port/out/more/*.png
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../../deck/node_modules/playwright-core');
const port = process.argv[2] || '8767', only = process.argv[3];
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
async function shot(url, w, file) {
  if (only && !file.startsWith(only)) return;
  const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', file, e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth,
    small: [...document.querySelectorAll('.rp2-pg a')].filter(a => { const r = a.getBoundingClientRect(); return r.height && r.height < 44 && getComputedStyle(a).display !== 'inline'; }).length }));
  if (r.sw > w) console.log('HSCROLL', file, r.sw);
  if (r.small) console.log('SMALL-TAP', file, r.small);
  await p.screenshot({ path: `out/more/${file}.png`, fullPage: true }); await p.close();
}
for (const n of ['figures', 'all', 'how', 'about', 'sources'])
  for (const w of [1440, 390]) await shot(`http://127.0.0.1:${port}/preview/more-${n}.html`, w, `${n}-${w}`);
for (const n of ['terms', 'privacy'])
  for (const w of [1440, 390]) await shot(`https://revisionpedia.geo.hashmeta.tech/${n}`, w, `live-${n}-${w}`);
await b.close();
