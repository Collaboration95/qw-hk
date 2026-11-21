// Run after PYTHONPATH=. python tests/test_hardening_map.py OUTPUT_DIRECTORY.
// Chrome's debugging pipe stays local. No browser profile or web server is needed.
import {spawn} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const folder = resolve(process.argv[2]);
const profile = mkdtempSync(join(tmpdir(), 'map-browser-'));
const chrome = spawn(process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ['--headless', '--remote-debugging-pipe', '--disable-background-networking', '--disable-sync',
     '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, 'about:blank'],
    {stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe']});
let buffer = '', next = 0;
const pending = new Map();
chrome.stdio[4].setEncoding('utf8').on('data', data => {
    buffer += data;
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
        const msg = JSON.parse(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
        const done = pending.get(msg.id);
        if (done) {
            pending.delete(msg.id);
            msg.error ? done.reject(Error(msg.error.message)) : done.resolve(msg.result);
        }
    }
});
function send(method, params = {}, sessionId) {
    const id = ++next;
    return new Promise((resolve, reject) => {
        pending.set(id, {resolve, reject});
        chrome.stdio[3].write(JSON.stringify({id, method, params, sessionId}) + '\0');
    });
}
const findings = [];
try {
    const {targetId} = await send('Target.createTarget', {url:'about:blank'});
    const {sessionId} = await send('Target.attachToTarget', {targetId, flatten:true});
    const call = (method, params) => send(method, params, sessionId);
    async function evaluate(expression) {
        const r = await call('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
        if (r.exceptionDetails) throw Error(r.exceptionDetails.exception.description);
        return r.result.value;
    }
    for (const count of [0,1,12,40]) {
        for (const [width,height] of [[1920,1080],[390,844]]) {
            await call('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false});
            const url = pathToFileURL(join(folder,count+'.html')).href;
            await call('Page.navigate', {url});
            let loaded = false;
            for (let i=0; i<100 && !loaded; i++) {
                loaded = await evaluate('document.readyState==="complete" && location.href===' + JSON.stringify(url));
                if (!loaded) await new Promise(r => setTimeout(r, 20));
            }
            if (!loaded) throw Error('Map failed to load');
            const shot = await call('Page.captureScreenshot', {format:'png'});
            writeFileSync(join(folder,count+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
            const metrics = await evaluate(`(() => {
                const all = [...document.querySelectorAll('.doc-link')];
                const last = all.at(-1);
                if (last) { last.scrollIntoView(); last.click(); }
                const card = document.querySelector('.document:not([hidden])');
                if (card) card.querySelector('[data-action=skip]').click();
                const record = document.querySelector('.json');
                return {count: all.length, width: document.documentElement.scrollWidth,
                    selected: card?.id === last?.hash.slice(1), inView: !card ||
                    (card.getBoundingClientRect().top >= 0 && card.getBoundingClientRect().top < innerHeight),
                    exported: !card || JSON.parse(record.value).decisions[0].decision === 'skip',
                    file: !card || card.querySelector('a.download')?.href.startsWith('data:')};
            })()`);
            console.log(count, width, JSON.stringify(metrics));
            if (metrics.count!==count || metrics.width!==width || !metrics.selected ||
                !metrics.inView || !metrics.exported || !metrics.file) findings.push([count,width,metrics]);
        }
    }
} finally {
    await send('Browser.close');
    await new Promise(resolve => chrome.exitCode === null ? chrome.once('exit', resolve) : resolve());
    rmSync(profile, {recursive:true, force:true});
}
if (findings.length) process.exitCode = 1;
