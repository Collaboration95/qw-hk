// Database layer. One query interface, two backends:
//  - "supabase": PostgREST REST calls using the runtime-injected credentials (production Page)
//  - "local":    JSON-file store with identical semantics (local testing only)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const TABLES = ['series', 'vintages', 'publications', 'claims', 'checks', 'verdicts', 'decisions', 'run_log', 'releases'];
const MODE = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY ? 'supabase' : 'local';
const LOCAL_PATH = process.env.LOCAL_DB_PATH || '/tmp/recall-press-local-db.json';

export const storageMode = MODE;
export const uid = () => randomUUID();

// ---------- local backend ----------
let local = null;
function localLoad() {
  if (local) return local;
  local = existsSync(LOCAL_PATH) ? JSON.parse(readFileSync(LOCAL_PATH, 'utf8')) : {};
  for (const t of TABLES) if (!local[t]) local[t] = [];
  return local;
}
function localSave() { writeFileSync(LOCAL_PATH, JSON.stringify(local)); }
function match(row, [op, col, val]) {
  const v = row[col];
  switch (op) {
    case 'eq': return v === val;
    case 'neq': return v !== val;
    case 'gt': return v > val;
    case 'gte': return v >= val;
    case 'lt': return v < val;
    case 'lte': return v <= val;
    case 'in': return val.includes(v);
    case 'is': return val === null ? v == null : v === val;
    default: throw new Error('bad op ' + op);
  }
}
function localSelect(table, spec = {}) {
  let rows = localLoad()[table].filter(r => (spec.filter || []).every(f => match(r, f)));
  if (spec.order) {
    const [col, dir] = spec.order;
    rows = [...rows].sort((a, b) => {
      const x = a[col], y = b[col];
      const c = x == null ? -1 : y == null ? 1 : (typeof x === 'number' ? x - y : String(x).localeCompare(String(y)));
      return dir === 'desc' ? -c : c;
    });
  }
  if (spec.limit) rows = rows.slice(0, spec.limit);
  return rows.map(r => ({ ...r }));
}

// ---------- supabase backend ----------
function serVal(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `(${v.map(x => `"${String(x).replace(/"/g, '\\"')}"`).join(',')})`;
  return String(v);
}
function qs(spec = {}) {
  const parts = ['select=*'];
  for (const [op, col, val] of spec.filter || []) parts.push(`${col}=${op}.${serVal(val)}`);
  if (spec.order) parts.push(`order=${spec.order[0]}.${spec.order[1]}`);
  if (spec.limit) parts.push(`limit=${spec.limit}`);
  return parts.join('&');
}
async function rest(method, path, body, extraHeaders = {}) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DB ${method} ${path} -> ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ---------- public interface ----------
export async function select(table, spec) {
  if (MODE === 'local') return localSelect(table, spec);
  return rest('GET', `${table}?${qs(spec)}`);
}
export async function insert(table, rows) {
  if (!rows.length) return [];
  if (MODE === 'local') {
    localLoad()[table].push(...rows.map(r => ({ ...r })));
    localSave();
    return rows;
  }
  const out = [];
  for (let i = 0; i < rows.length; i += 400) {
    out.push(...await rest('POST', table, rows.slice(i, i + 400), { Prefer: 'return=representation' }));
  }
  return out;
}
export async function update(table, filter, patch) {
  if (MODE === 'local') {
    const rows = localLoad()[table].filter(r => filter.every(f => match(r, f)));
    for (const r of rows) Object.assign(r, patch);
    localSave();
    return rows;
  }
  return rest('PATCH', `${table}?${qs({ filter })}`, patch, { Prefer: 'return=representation' });
}
export async function removeAll(table) {
  if (MODE === 'local') { localLoad()[table] = []; localSave(); return; }
  await rest('DELETE', `${table}?id=neq.__none__`);
}
export async function log(event, detail) {
  await insert('run_log', [{ id: uid(), timestamp: new Date().toISOString(), event, detail }]);
}