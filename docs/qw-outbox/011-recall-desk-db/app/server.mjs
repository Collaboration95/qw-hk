// Recall Press · recall desk — dynamic Page server (Node 22, built-ins only).
// Persists the editor's Apply/Skip decisions for a single run in the Page's
// Supabase (PostgREST) `decisions` table. SUPABASE_* are injected by the Page
// runtime and used server-side only; they are never sent to the browser.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_INSTANCE_ID = process.env.SUPABASE_INSTANCE_ID;

const HERE = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = join(HERE, 'public', 'index.html');

const VALID_RUN = '2026-11-21-68013a314ad1';
const VALID_CLAIMS = new Set(['members-briefing-2025q3-c2', 'members-briefing-2025q3-c1']);
const MAX_SENTENCE = 400;

function restUrl(search = '') {
  return `${SUPABASE_URL}/rest/v1/decisions${search}`;
}
function restHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...(SUPABASE_INSTANCE_ID ? { 'X-Instance-Id': SUPABASE_INSTANCE_ID } : {}),
    ...extra,
  };
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 64 * 1024) reject(new Error('payload too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleGetDecisions(url, res) {
  const runId = url.searchParams.get('run_id');
  if (!runId) return sendJson(res, 200, []);
  const qs = `?select=*&run_id=eq.${encodeURIComponent(runId)}&order=decided_at.desc`;
  let upstream;
  try {
    upstream = await fetch(restUrl(qs), { headers: restHeaders() });
  } catch (e) {
    return sendJson(res, 502, { error: 'db unreachable: ' + e.message });
  }
  if (!upstream.ok) {
    const text = await upstream.text();
    return sendJson(res, 502, { error: 'db query failed: HTTP ' + upstream.status + ' ' + text });
  }
  const rows = await upstream.json();
  // Latest decision per claim_id (rows already ordered decided_at desc).
  const latest = new Map();
  for (const row of rows) if (!latest.has(row.claim_id)) latest.set(row.claim_id, row);
  return sendJson(res, 200, [...latest.values()]);
}

async function handlePostDecisions(req, res) {
  let raw;
  try {
    raw = await readBody(req);
  } catch (e) {
    return sendJson(res, 400, { error: 'bad request body' });
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: 'invalid JSON' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return sendJson(res, 400, { error: 'body must be an object' });

  const { run_id, claim_id, decision, replacement_sentence } = body;
  if (run_id !== VALID_RUN) return sendJson(res, 400, { error: 'invalid run_id' });
  if (!VALID_CLAIMS.has(claim_id)) return sendJson(res, 400, { error: 'invalid claim_id' });
  if (decision !== 'apply' && decision !== 'skip')
    return sendJson(res, 400, { error: 'decision must be apply or skip' });
  if (replacement_sentence !== undefined && replacement_sentence !== null) {
    if (typeof replacement_sentence !== 'string')
      return sendJson(res, 400, { error: 'replacement_sentence must be a string' });
    if (replacement_sentence.length > MAX_SENTENCE)
      return sendJson(res, 400, { error: 'replacement_sentence too long' });
  }

  const isTest = req.headers['x-test'] !== undefined && req.headers['x-test'] !== '';
  const row = {
    run_id,
    claim_id,
    decision,
    replacement_sentence: replacement_sentence ?? null,
    is_test: isTest,
  };
  let upstream;
  try {
    upstream = await fetch(restUrl(''), {
      method: 'POST',
      headers: restHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(row),
    });
  } catch (e) {
    return sendJson(res, 502, { error: 'db unreachable: ' + e.message });
  }
  if (!upstream.ok) {
    const text = await upstream.text();
    return sendJson(res, 502, { error: 'db insert failed: HTTP ' + upstream.status + ' ' + text });
  }
  const inserted = await upstream.json();
  return sendJson(res, 201, Array.isArray(inserted) ? inserted[0] : inserted);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  if (path === '/api/health') {
    if (req.method === 'GET') return sendJson(res, 200, { ok: true });
    return sendJson(res, 405, { error: 'method not allowed' });
  }
  if (path === '/api/decisions') {
    if (req.method === 'GET') return handleGetDecisions(url, res);
    if (req.method === 'POST') return handlePostDecisions(req, res);
    // No delete/update endpoints.
    return sendJson(res, 405, { error: 'method not allowed' });
  }
  if (path === '/' || path === '/index.html') {
    if (req.method !== 'GET' && req.method !== 'HEAD')
      return sendJson(res, 405, { error: 'method not allowed' });
    try {
      const html = await readFile(INDEX_PATH);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('index.html unavailable');
    }
    return;
  }
  return sendJson(res, 404, { error: 'not found' });
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('SUPABASE_URL / SUPABASE_ANON_KEY not set — API calls will fail until the Page runtime injects them.');
}

server.listen(PORT, HOST, () => {
  console.log(`recall-desk listening on http://${HOST}:${PORT}`);
});
