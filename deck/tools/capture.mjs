import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'
const require = createRequire(resolve('deck/package.json'))
const { chromium } = require('playwright-core')
const exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: exe })
const shots = [
 ['web/examples/replays/2025-11-21.html','map-2025-11-21',1600,1000],
 ['site/preview/index.html','revisionpedia-home',1440,900],
 ['site/preview/revisions/sg-gdp-manufacturing-yoy-2025-q3/index.html','revisionpedia-mfg-q3',1440,900],
 ['site/preview/revisions/sg-gdp-manufacturing-qoq-2025-q1/index.html','revisionpedia-mfg-q1',1440,900],
]
for (const [f,n,w,h] of shots){ const p = await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2}); await p.goto(pathToFileURL(resolve(f)).href); await p.waitForTimeout(800); await p.screenshot({path:`deck/shared/${n}.png`}); await p.screenshot({path:`deck/shared/${n}-full.png`,fullPage:true}); await p.close() }
await b.close()
