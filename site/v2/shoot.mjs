// node shoot.mjs <port>  -> out/*.png
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../deck/node_modules/playwright-core');
const port = process.argv[2] || '8765', base = `http://127.0.0.1:${port}`;
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
async function shot(path, w, h, file, full = true, fn) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2600);
  if (fn) await fn(p);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) console.log('HSCROLL', file, sw);
  await p.screenshot({ path: `out/${file}.png`, fullPage: full });
  await p.close();
}
await shot('/index.html', 1440, 900, 'home-1440');
await shot('/index.html', 1440, 900, 'home-1440-fold', false);
await shot('/index.html', 390, 844, 'home-390');
await shot('/index.html', 390, 844, 'home-390-fold', false);
await shot('/figure.html', 1440, 900, 'figure-1440');
await shot('/figure.html', 390, 844, 'figure-390');
await shot('/indicator.html', 1440, 900, 'indicator-1440');
await shot('/cover.html', 1440, 900, 'cover-1440', false);
await shot('/cover.html', 390, 844, 'cover-390');
await shot('/indicator.html', 390, 844, 'indicator-390');
await shot('/index.html', 1440, 900, 'checker-mid-use', false, async p => {
  await p.fill('#rp2-s', 'Services grew 4.7% in Q1 2026');
  await p.press('#rp2-s', 'Enter');
  await p.waitForTimeout(900);
  await p.evaluate(() => document.getElementById('check').scrollIntoView());
  await p.waitForTimeout(300);
});
await shot('/index.html', 390, 844, 'checker-390', false, async p => {
  await p.fill('#rp2-s', 'The economy shrank 0.3% from the previous quarter in Q1 2026');
  await p.press('#rp2-s', 'Enter');
  await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('#check .out').scrollIntoView());
});
await b.close();
