// node port/shoot.mjs <port>  (serve site/v2/port with python3 -m http.server) -> port/out/*.png
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../../deck/node_modules/playwright-core');
const port = process.argv[2] || '8766', base = `http://127.0.0.1:${port}/preview`;
const only = process.argv[3];
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
async function shot(path, w, h, file, full = true) {
  if (only && !file.startsWith(only)) return;
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', file, e.message));
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2600);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) console.log('HSCROLL', file, sw);
  await p.screenshot({ path: `out/${file}.png`, fullPage: full });
  await p.close();
}
await shot('/index.html', 1440, 900, 'home-1440');
await shot('/index.html', 390, 844, 'home-390');
await shot('/figure.html', 1440, 900, 'figure-1440');
await shot('/figure.html', 390, 844, 'figure-390');
await shot('/indicator.html', 1440, 900, 'indicator-1440');
await shot('/indicator.html', 390, 844, 'indicator-390');
await shot('/indicator-jobs.html', 1440, 900, 'indicator-jobs-1440');
await shot('/cover.html', 1440, 900, 'cover-1440');
await shot('/cover.html', 390, 844, 'cover-390');
await shot('/terms.html', 1440, 900, 'terms-1440', false);
await b.close();
