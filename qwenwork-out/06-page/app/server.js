// Recall Press control room - Node 22+, zero dependencies.
// Production: Supabase REST via runtime-injected env. Local testing: JSON store.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { select, insert, log, storageMode } from './db.js';
import { runCheck, addVintage, recordDecision, STATUSES } from './engine.js';
import { seed, seedIfEmpty, resetDemo } from './seed.js';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, 'public');
const PORT = Number(process.env.PORT || 8081);
const HOST = process.env.HOST || '0.0.0.0';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const fail = (res, err) => json(res, err.code && Number.isInteger(err.code) ? err.code : 500, { error: err.message || String(err) });

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 1e6) throw Object.assign(new Error('Body too large'), { code: 413 }); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('Invalid JSON body'), { code: 400 }); }
}

function headlineFor(check, vintages, seriesById) {
  if (!check.focus_series_id) return null;
  const s = seriesById[check.focus_series_id];
  const vs = vintages.filter(v => v.series_id === check.focus_series_id && v.period === check.focus_period && v.published_on <= check.as_of)
    .sort((a, b) => a.published_on.localeCompare(b.published_on));
  const latest = vs.at(-1);
  if (!latest) return null;
  const prev = vs.at(-2);
  return {
    series_id: check.focus_series_id, period: check.focus_period, title: s?.title, unit: s?.unit || '%',
    old: prev ? prev.value : latest.value, new: latest.value,
    old_published: prev ? prev.published_on : latest.published_on, new_published: latest.published_on,
    old_release: prev?.source_title || '', new_release: latest.source_title, url: latest.source_url,
    unchanged: !prev || prev.value === latest.value,
  };
}

async function state() {
  const [series, publications, claims, vintages, checks, verdicts, decisions, releases] = await Promise.all([
    select('series'), select('publications'), select('claims'), select('vintages'),
    select('checks', { order: ['created_at', 'asc'] }), select('verdicts'), select('decisions', { order: ['decided_at', 'asc'] }), select('releases', { order: ['date', 'asc'] }),
  ]);
  const seriesById = Object.fromEntries(series.map(s => [s.id, s]));
  const claimById = Object.fromEntries(claims.map(c => [c.id, c]));
  const pubById = Object.fromEntries(publications.map(p => [p.id, p]));
  const checkById = Object.fromEntries(checks.map(c => [c.id, c]));
  const decisionByVerdict = {};
  for (const d of decisions) decisionByVerdict[d.verdict_id] = d; // latest wins (ordered asc)
  const enrich = v => ({ ...v, claim: claimById[v.claim_id], publication: pubById[claimById[v.claim_id]?.publication_id], decision: decisionByVerdict[v.id] || null });
  const latestCheck = checks.at(-1) || null;
  const latestVerdicts = latestCheck ? verdicts.filter(v => v.check_id === latestCheck.id).map(enrich) : [];
  // Current status per claim = its most recent verdict (by check order).
  const checkOrder = Object.fromEntries(checks.map((c, i) => [c.id, i]));
  const current = {};
  for (const v of verdicts) {
    const prev = current[v.claim_id];
    if (!prev || checkOrder[v.check_id] >= checkOrder[prev.check_id]) current[v.claim_id] = v;
  }
  const claimStatus = Object.fromEntries(Object.entries(current).map(([id, v]) => [id, enrich(v)]));
  return {
    storage: storageMode, series, publications, claims, releases, checks,
    latest: latestCheck ? { check: latestCheck, headline: headlineFor(latestCheck, vintages, seriesById), verdicts: latestVerdicts } : null,
    claimStatus, statuses: STATUSES,
    cases: Object.fromEntries(Object.entries(seed.cases).map(([k, c]) => [k, { case_id: c.case_id, title: c.title, checks: c.checks.map(x => ({ as_of: x.as_of, expected: x.expected })) }])),
  };
}

async function api(req, res, url) {
  const p = url.pathname;
  if (req.method === 'GET' && p === '/api/state') return json(res, 200, await state());
  if (req.method === 'GET' && p === '/api/health') return json(res, 200, { ok: true, storage: storageMode });
  if (req.method === 'GET' && p.startsWith('/api/series/')) {
    const id = decodeURIComponent(p.slice('/api/series/'.length));
    const s = await select('series', { filter: [['eq', 'id', id]] });
    if (!s.length) return json(res, 404, { error: 'Unknown series' });
    const vs = await select('vintages', { filter: [['eq', 'series_id', id]], order: ['published_on', 'asc'] });
    const periods = {};
    for (const v of vs) (periods[v.period] ||= []).push(v);
    return json(res, 200, { series: s[0], periods });
  }
  if (req.method === 'GET' && p === '/api/log') {
    const filter = [];
    const event = url.searchParams.get('event');
    const q = url.searchParams.get('q');
    if (event && event !== 'all') filter.push(['eq', 'event', event]);
    let rows = await select('run_log', { filter, order: ['timestamp', 'desc'] });
    if (q) rows = rows.filter(r => (r.detail || '').toLowerCase().includes(q.toLowerCase()) || r.event.includes(q.toLowerCase()));
    return json(res, 200, { rows, events: [...new Set((await select('run_log')).map(r => r.event))].sort() });
  }
  if (req.method === 'POST' && p === '/api/check') {
    const b = await body(req);
    const trigger = ['manual', 'email', 'schedule'].includes(b.trigger) ? b.trigger : 'manual';
    const focus = b.focus_series_id ? { series_id: b.focus_series_id, period: b.focus_period } : null;
    return json(res, 200, await runCheck({ asOf: b.as_of, trigger, focus, replay: b.replay || null }));
  }
  if (req.method === 'POST' && p === '/api/vintage') {
    const b = await body(req);
    return json(res, 200, await addVintage(b));
  }
  if (req.method === 'POST' && p === '/api/decision') {
    const b = await body(req);
    return json(res, 200, await recordDecision(b));
  }
  if (req.method === 'POST' && p === '/api/reset') {
    await resetDemo();
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'Not found' });
}

async function staticFile(res, path) {
  const rel = normalize(path).replace(/^(\.\.[/\\])+/, '');
  const file = join(PUBLIC, rel === '/' || rel === '.' ? 'index.html' : rel);
  if (!file.startsWith(PUBLIC)) return json(res, 403, { error: 'Forbidden' });
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    // SPA fallback for screen routes
    try {
      const data = await readFile(join(PUBLIC, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch { json(res, 404, { error: 'Not found' }); }
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed' });
    return await staticFile(res, url.pathname);
  } catch (err) {
    if (err.code && Number.isInteger(err.code)) console.warn(`${req.method} ${req.url} -> ${err.code}: ${err.message}`);
    else console.error(err);
    return fail(res, err);
  }
});

await seedIfEmpty();
server.listen(PORT, HOST, () => console.log(`Recall Press control room on http://${HOST}:${PORT} (storage: ${storageMode})`));