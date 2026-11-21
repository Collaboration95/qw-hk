// End-to-end test: spawns the server with the local JSON backend, replays
// case A and case B, asserts every answer-key verdict, records one decision
// of each kind, and verifies the audit trail. Run: node tools/test_replay.mjs
import { spawn } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const APP = join(here, '..', 'app');
const PORT = 8193;
const BASE = `http://127.0.0.1:${PORT}`;
const DB = join(process.env.TMPDIR || '/tmp', `recall-press-test-${Date.now()}.json`);
const seed = JSON.parse(readFileSync(join(APP, 'seed.json'), 'utf8'));

let failures = 0, checks = 0;
function assert(ok, label, extra = '') {
  checks++;
  if (ok) console.log(`  PASS  ${label}`);
  else { failures++; console.error(`  FAIL  ${label} ${extra}`); }
}
const get = async p => (await fetch(BASE + p)).json();
const post = async (p, b) => {
  const r = await fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}) });
  const j = await r.json();
  if (!r.ok) throw new Error(`${p} -> ${r.status}: ${j.error}`);
  return j;
};

const child = spawn(process.execPath, ['server.js'], {
  cwd: APP, env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', LOCAL_DB_PATH: DB },
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stderr.on('data', d => process.stderr.write('[server] ' + d));
let serverLog = '';
child.stdout.on('data', d => { serverLog += d; });

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try { const h = await get('/api/health'); if (h.ok && h.storage === 'local') return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('server did not become ready. log: ' + serverLog);
}

// Map answer-key claims onto registered claims by series/period/stance/value.
function keyMatches(keyClaim, registered) {
  return registered.filter(c => c.series_id === keyClaim.series_id && c.period === keyClaim.period &&
    c.stance === keyClaim.stance && c.value_cited === keyClaim.value_cited &&
    c.assertion?.type === keyClaim.assertion?.type);
}

try {
  await waitReady();
  console.log('== seed ==');
  let state = await get('/api/state');
  assert(state.series.length === seed.series.length, `series seeded (${state.series.length})`);
  assert(state.claims.length === seed.claims.length, `claims seeded (${state.claims.length})`);
  const vcount = (await get('/api/series/sg-gdp-manufacturing-yoy')).periods;
  assert(Object.keys(vcount).length === 7, 'manufacturing periods parsed (7 quarters)');

  console.log('== replay reset ==');
  await post('/api/reset');
  state = await get('/api/state');
  assert(state.latest === null, 'reset clears checks');

  console.log('== case A: manufacturing flat -> 5.0% (as of 2025-11-21) ==');
  const A = seed.cases.A;
  const aCheck = await post('/api/check', { as_of: A.checks[0].as_of, trigger: 'email', focus_series_id: 'sg-gdp-manufacturing-yoy', focus_period: '2025-Q3', replay: 'A' });
  const aVerdicts = aCheck.verdicts;
  for (const exp of A.checks[0].expected) {
    const kc = A.claims.find(c => c.claim_id === exp.claim_id);
    const matches = keyMatches(kc, state.claims);
    assert(matches.length > 0, `answer-key ${exp.claim_id} maps to ${matches.length} registered claim(s)`);
    for (const m of matches) {
      const v = aVerdicts.find(x => x.claim_id === m.id);
      assert(v && v.status === exp.status, `${exp.claim_id} -> ${m.id}: expected ${exp.status}, got ${v?.status}`, v?.reason || '');
    }
  }
  assert(aCheck.headline && aCheck.headline.old === 0 && aCheck.headline.new === 5, 'headline shows 0.0 -> 5.0');
  assert(aCheck.headline.old_published === '2025-10-14' && aCheck.headline.new_published === '2025-11-21', 'headline dates 14 Oct / 21 Nov');
  const newsletter = aVerdicts.find(v => v.claim_id === 'members-newsletter-2025q3-c1');
  assert(newsletter?.status === 'number_only', 'newsletter comparison (5.0 < 5.1) is number_only', newsletter?.status);

  console.log('== decisions: one of each kind on case A verdicts ==');
  const wrongV = aVerdicts.find(v => v.claim_id === 'members-briefing-2025q3-c2');
  const skipV = aVerdicts.find(v => v.claim_id === 'sales-outlook-2025q3-c1');
  const editV = aVerdicts.find(v => v.claim_id === 'members-newsletter-2025q3-c1');
  const d1 = await post('/api/decision', { verdict_id: wrongV.id, action: 'apply' });
  const d2 = await post('/api/decision', { verdict_id: skipV.id, action: 'skip' });
  const edited = 'Year-on-year manufacturing growth in Q3 2025 was revised up to 5.0%, close to Q2\u2019s 5.1%.';
  const d3 = await post('/api/decision', { verdict_id: editV.id, action: 'edit_first', edited_text: edited });
  assert(d1.action === 'apply' && d2.action === 'skip' && d3.action === 'edit_first', 'three decision kinds recorded');
  state = await get('/api/state');
  assert(state.claimStatus['members-briefing-2025q3-c2'].decision?.action === 'apply', 'apply visible in state');
  assert(state.claimStatus['members-newsletter-2025q3-c1'].decision?.edited_text === edited, 'edited text persisted');
  const orig = state.claims.find(c => c.id === 'members-briefing-2025q3-c2');
  assert(orig.sentence === seed.claims.find(c => c.id === orig.id).sentence, 'original sentence never overwritten');

  console.log('== case B step 1: 5.7 -> 5.9 (as of 2026-08-11) ==');
  const B = seed.cases.B;
  const b1 = await post('/api/check', { as_of: B.checks[0].as_of, trigger: 'email', focus_series_id: 'sg-gdp-overall-yoy', focus_period: '2026-Q2', replay: 'B1' });
  for (const exp of B.checks[0].expected) {
    const kc = B.claims.find(c => c.claim_id === exp.claim_id);
    for (const m of keyMatches(kc, state.claims)) {
      const v = b1.verdicts.find(x => x.claim_id === m.id);
      assert(v && v.status === exp.status, `${exp.claim_id} -> ${m.id}: expected ${exp.status}, got ${v?.status}`, v?.reason || '');
    }
  }
  assert(b1.headline.old === 5.7 && b1.headline.new === 5.9, 'headline shows 5.7 -> 5.9');

  console.log('== case B step 2: 5.9 -> 6.2 (as of 2026-10-14) ==');
  const b2 = await post('/api/check', { as_of: B.checks[1].as_of, trigger: 'email', focus_series_id: 'sg-gdp-overall-yoy', focus_period: '2026-Q2', replay: 'B2' });
  for (const exp of B.checks[1].expected) {
    const kc = B.claims.find(c => c.claim_id === exp.claim_id);
    for (const m of keyMatches(kc, state.claims)) {
      const v = b2.verdicts.find(x => x.claim_id === m.id);
      assert(v && v.status === exp.status, `${exp.claim_id} -> ${m.id}: expected ${exp.status}, got ${v?.status}`, v?.reason || '');
    }
  }
  assert(b2.headline.old === 5.9 && b2.headline.new === 6.2, 'headline shows 5.9 -> 6.2');
  const b1v = b2.verdicts.find(v => v.claim_id === 'midyear-briefing-2026q2-c1');
  assert(b1v.proposed_sentence && b1v.proposed_sentence.includes('6.2'), 'correction proposed for the broken threshold', b1v.proposed_sentence);
  const octIncluded = b2.verdicts.some(v => v.claim_id.startsWith('october-briefing'));
  assert(!octIncluded, 'October briefing (registered 2026-10-19) excluded from the 2026-10-14 check');

  console.log('== audit trail ==');
  const log = await get('/api/log');
  const events = log.rows.map(r => r.event);
  for (const e of ['check', 'decision.apply', 'decision.skip', 'decision.edit_first', 'replay.reset', 'seed']) {
    assert(events.includes(e), `run_log contains ${e}`);
  }
  assert(log.rows.filter(r => r.event === 'check').length === 3, 'three check rows logged');
  const filtered = await get('/api/log?event=decision.apply');
  assert(filtered.rows.length === 1 && filtered.rows[0].detail.includes('members-briefing-2025q3-c2'), 'audit filter by event works');

  console.log('== vintage endpoint ==');
  const vr = await post('/api/vintage', { series_id: 'sg-gdp-overall-yoy', period: '2026-Q3', value: 5.6, published_on: '2026-11-24', source_title: 'Economic Survey of Singapore — 2026-Q3 (simulated)', trigger: 'email' });
  const oct = vr.verdicts.find(v => v.claim_id === 'october-briefing-2026q3-c1');
  assert(oct && oct.status === 'number_only', 'new vintage re-evaluates October GDP claim (5.4 -> 5.6, direction holds)', oct?.status);
  const log2 = await get('/api/log');
  assert(log2.rows.some(r => r.event === 'vintage.added'), 'vintage.added logged');

  console.log('== invalid input guards ==');
  let rejected = false;
  try { await post('/api/decision', { verdict_id: b1v.id, action: 'edit_first', edited_text: '  ' }); } catch { rejected = true; }
  assert(rejected, 'edit_first without text rejected');
  rejected = false;
  try { await post('/api/vintage', { series_id: 'nope', period: '2026-Q3', value: 1, published_on: '2026-11-25' }); } catch { rejected = true; }
  assert(rejected, 'unknown series rejected');

  console.log(`\n${checks - failures}/${checks} assertions passed.`);
} catch (err) {
  failures++;
  console.error('TEST ERROR:', err);
} finally {
  child.kill();
  try { rmSync(DB); } catch {}
}
process.exit(failures ? 1 : 0);