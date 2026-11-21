/* Recall Press control room frontend. Vanilla JS, no dependencies. */
'use strict';
const $ = s => document.querySelector(s);
const screen = $('#screen');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let STATE = null;
let replaying = false;

const BADGES = {
  now_wrong: ['!', 'Now wrong'], number_only: ['~', 'Number only'], still_true: ['✓', 'Still true'],
  unaffected: ['–', 'Not affected'], needs_human: ['?', 'Needs human'], unchecked: ['?', 'Unchecked'],
};
const badge = s => { const [i, t] = BADGES[s] || BADGES.unchecked; return `<span class="badge ${esc(s)}"><i aria-hidden="true">${i}</i>${t}${s === 'still_true' ? ' ' : ''}</span>`; };
const fmtDate = iso => iso ? new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
const fmtVal = (v, unit) => unit === '%' ? `${parseFloat(v)}%` : `${parseFloat(v)} ${unit || ''}`.trim();
const periodLabel = p => p ? p.replace(/(\d{4})-Q([1-4])/, 'Q$2 $1') : '';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}
const post = (url, body) => fetchJSON(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
async function refresh() { STATE = await fetchJSON('/api/state'); }

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 4200);
}

/* Word-level diff for the Published / Replacement columns. */
function diffHTML(oldText, newText) {
  const tok = t => t.match(/\S+\s*/g) || [];
  const a = tok(oldText), b = tok(newText);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = a[i].trim() === b[j].trim() ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0, del = [], ins = [], out = '';
  const flush = () => {
    if (del.length) out += `<del>${esc(del.join(''))}</del>`;
    if (ins.length) out += `<ins>${esc(ins.join(''))}</ins>`;
    del = []; ins = [];
  };
  while (i < n && j < m) {
    if (a[i].trim() === b[j].trim()) { flush(); out += esc(a[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { del.push(a[i++]); }
    else { ins.push(b[j++]); }
  }
  while (i < n) del.push(a[i++]);
  while (j < m) ins.push(b[j++]);
  flush();
  return out;
}

/* ---------------- Map screen ---------------- */
function claimSection(v) {
  const c = v.claim, fixable = ['now_wrong', 'number_only'].includes(v.status);
  const decision = v.decision;
  const loc = esc(c.location || '');
  let inner = `<div class="claim-meta"><span class="location">${loc}</span>${badge(v.status)}</div>`;
  if (fixable) {
    const proposal = decision?.action === 'edit_first' ? decision.edited_text : v.proposed_sentence;
    inner += `<div class="diff"><div><p class="label">Published</p><p class="sentence">${diffHTML(c.sentence, proposal || c.sentence).replace(/<ins>[\s\S]*?<\/ins>/g, '') || esc(c.sentence)}</p></div>
      <div><p class="label">${decision?.action === 'edit_first' ? 'Replacement (edited)' : 'Replacement'}</p><p class="sentence proposal">${proposal ? diffHTML(c.sentence, proposal) : esc(c.sentence)}</p></div></div>`;
    inner += `<label class="edit-box" hidden>Edit replacement sentence<textarea rows="3" data-edit="${esc(v.id)}">${esc(proposal || '')}</textarea></label>`;
    inner += `<p class="reason">${esc(v.reason)}${v.evidence_url ? ` <a href="${esc(v.evidence_url)}" target="_blank" rel="noopener noreferrer">Official release ↗</a>` : ''}</p>`;
    inner += `<div class="actions" aria-label="Decision for ${esc(c.id)}">
      <button type="button" data-action="apply" data-verdict="${esc(v.id)}" ${decision?.action === 'apply' || decision?.action === 'edit_first' ? 'aria-pressed="true"' : ''}>Apply fix</button>
      <button type="button" data-action="skip" data-verdict="${esc(v.id)}" ${decision?.action === 'skip' ? 'aria-pressed="true"' : ''}>Skip</button>
      <button type="button" data-action="edit" data-verdict="${esc(v.id)}" aria-expanded="false">Edit first</button></div>
      <p class="state" role="status">${decision ? decisionLabel(decision) : ''}</p>`;
  } else {
    inner += `<p class="unchanged">${esc(c.sentence)}</p><p class="reason">${esc(v.reason)}${v.evidence_url ? ` <a href="${esc(v.evidence_url)}" target="_blank" rel="noopener noreferrer">Official release ↗</a>` : ''}</p>`;
    if (decision) inner += `<p class="state">${decisionLabel(decision)}</p>`;
  }
  return `<section class="claim${fixable ? ' editable' : ''}" data-claim="${esc(c.id)}">${inner}</section>`;
}
function decisionLabel(d) {
  if (d.action === 'skip') return 'Decision recorded · Skip';
  if (d.action === 'edit_first') return 'Decision recorded · Edited sentence applied';
  return 'Decision recorded · Apply fix';
}

function renderMap() {
  const latest = STATE.latest;
  if (!latest) {
    screen.innerHTML = `<div class="quiet"><p><i>✓</i>No checks yet. Run a check, or press <b>Replay demo</b> to watch the manufacturing revision and the GDP threshold case unfold.</p></div>${simForm()}`;
    bindSim();
    return;
  }
  const { check, headline, verdicts } = latest;
  const docs = STATE.publications.filter(p => verdicts.some(v => v.claim.publication_id === p.id));
  const needFix = verdicts.filter(v => ['now_wrong', 'number_only'].includes(v.status)).length;
  const stillTrue = verdicts.filter(v => v.status === 'still_true').length;
  const cols = docs.length <= 3 ? Math.max(docs.length, 1) : 2;
  let html = '';
  if (headline) {
    const unit = headline.unit || '%';
    html += `<section class="figures"><article class="figure"><div class="figure-title">
      <p class="kicker">${headline.unchanged ? 'Latest figure' : 'Revised figure'} <span> / </span> ${esc(periodLabel(headline.period))}</p>
      <h1>${esc(headline.title || headline.series_id)}</h1>
      ${headline.url ? `<a href="${esc(headline.url)}" target="_blank" rel="noopener noreferrer">Official release <span aria-hidden="true">↗</span></a>` : ''}</div>
      <div class="readings">
      <div class="reading old"><b>${esc(fmtVal(headline.old, unit))}</b><span class="release">${esc(headline.old_release || 'Earlier release')}</span><time>${fmtDate(headline.old_published)}</time></div>
      <span class="arrow" aria-label="revised to">→</span>
      <div class="reading new"><b>${esc(fmtVal(headline.new, unit))}</b><span class="release">${esc(headline.new_release)}</span><time>${fmtDate(headline.new_published)}</time></div>
      </div></article></section>`;
  }
  html += `<section class="publications"><div class="map-heading"><h2>Publication map</h2>
    <p>${docs.length} document${docs.length === 1 ? '' : 's'} checked · ${needFix} need a fix · ${stillTrue} still true · as of ${fmtDate(check.as_of)} (${esc(check.trigger)}${check.replay_tag ? `, replay ${esc(check.replay_tag)}` : ''})</p></div>
    <div class="branches" style="--cols:${cols}">`;
  for (const p of docs) {
    const vs = verdicts.filter(v => v.claim.publication_id === p.id);
    html += `<article class="document"><header class="doc-head"><div class="filetype"><i aria-hidden="true"></i>${esc(p.type)}</div>
      <h3>${esc(p.title)}</h3><p class="doc-sub">Registered ${fmtDate(p.published_on)} · <a href="/files/${esc(p.file_name)}" download>${esc(p.file_name)}</a></p></header>
      ${vs.map(claimSection).join('')}</article>`;
  }
  html += `</div></section>`;
  html += `<details class="export"><summary>Decision JSON</summary><textarea class="json" readonly rows="5" aria-label="Decision JSON">${esc(JSON.stringify({ check_id: check.id, as_of: check.as_of, decisions: verdicts.filter(v => v.decision).map(v => ({ claim_id: v.claim_id, status: v.status, action: v.decision.action, ...(v.decision.edited_text ? { edited_text: v.decision.edited_text } : {}) })) }, null, 2))}</textarea></details>`;
  html += simForm();
  screen.innerHTML = html;
  bindMap();
  bindSim();
}

function simForm() {
  const opts = STATE.series.map(s => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('');
  return `<details class="export"><summary>Simulate an incoming release (vintage endpoint)</summary>
    <form class="sim-form" id="sim-form">
      <label>Series<select name="series_id" required>${opts}</select></label>
      <label>Period<input type="text" name="period" placeholder="2026-Q3" required></label>
      <label>Value<input type="number" name="value" step="0.1" required></label>
      <label>Published on<input type="date" name="published_on" required></label>
      <label>Source title<input type="text" name="source_title" placeholder="Economic Survey of Singapore — 2026-Q3"></label>
      <label>Source URL<input type="url" name="source_url" placeholder="https://…"></label>
    </form>
    <button type="submit" form="sim-form" class="primary">Accept vintage &amp; recompute verdicts</button>
    <p class="reason">Posts to <code>/api/vintage</code>; every affected claim is re-evaluated and the map updates. Original sentences are never overwritten.</p></details>`;
}
function bindSim() {
  const form = $('#sim-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    try {
      const r = await post('/api/vintage', {
        series_id: f.get('series_id'), period: f.get('period').trim(), value: parseFloat(f.get('value')),
        published_on: f.get('published_on'), source_title: f.get('source_title') || undefined, source_url: f.get('source_url') || undefined,
        trigger: 'email',
      });
      await refresh(); route();
      toast(`Vintage accepted — ${r.counts.now_wrong} now wrong, ${r.counts.number_only} number only, ${r.counts.needs_human} need human.`);
    } catch (err) { toast(err.message); }
  });
}

function bindMap() {
  screen.querySelectorAll('.claim.editable').forEach(section => {
    const verdictId = section.querySelector('[data-verdict]')?.dataset.verdict;
    const editBox = section.querySelector('.edit-box');
    const editor = section.querySelector('textarea');
    const stateLine = section.querySelector('.state');
    const applyBtn = section.querySelector('[data-action="apply"]');
    const editBtn = section.querySelector('[data-action="edit"]');
    section.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      if (action === 'edit') {
        editBox.hidden = !editBox.hidden;
        editBtn.setAttribute('aria-expanded', String(!editBox.hidden));
        if (!editBox.hidden) { editor.focus(); stateLine.textContent = 'Choose Apply fix to include your wording.'; }
        return;
      }
      try {
        if (action === 'apply' && !editBox.hidden) {
          const text = editor.value.trim();
          if (!text) { toast('The edited sentence is empty.'); return; }
          await post('/api/decision', { verdict_id: verdictId, action: 'edit_first', edited_text: text });
        } else {
          await post('/api/decision', { verdict_id: verdictId, action });
        }
        await refresh(); renderMap();
        toast(action === 'skip' ? 'Decision recorded · Skip' : 'Decision recorded · fix applied (original preserved)');
      } catch (err) { toast(err.message); }
    }));
  });
}

/* ---------------- Publications screen ---------------- */
function renderPublications() {
  let html = `<div class="map-heading"><h2>Publications</h2><p>${STATE.publications.length} documents · ${STATE.claims.length} registered claims</p></div><div class="pub-grid">`;
  for (const p of STATE.publications) {
    const claims = STATE.claims.filter(c => c.publication_id === p.id);
    html += `<article class="document"><header class="doc-head"><div class="filetype"><i aria-hidden="true"></i>${esc(p.type)}</div>
      <h3>${esc(p.title)}</h3><p class="doc-sub">Registered ${fmtDate(p.published_on)} · <a href="/files/${esc(p.file_name)}" download>${esc(p.file_name)}</a></p></header>`;
    for (const c of claims) {
      const cur = STATE.claimStatus[c.id];
      const series = STATE.series.find(s => s.id === c.series_id);
      html += `<section class="pub-claim"><div class="claim-meta"><span class="location">${esc(c.location || '')}</span>${cur ? badge(cur.status) : '<span class="badge unchecked">Not yet checked</span>'}</div>
        <p class="sentence">${esc(c.sentence)}</p>
        <p class="meta-line">${esc(series?.title || c.series_id)} · ${esc(periodLabel(c.period))} · cited ${esc(fmtVal(c.value_cited, series?.unit))} from ${fmtDate(c.vintage_cited)} · stance: ${esc(c.stance)}</p>
        ${cur ? `<p class="reason">${esc(cur.reason)}</p>` : ''}
        ${cur?.decision ? `<p class="decision-tag">${decisionLabel(cur.decision)}</p>` : ''}</section>`;
    }
    html += `</article>`;
  }
  html += `</div>`;
  screen.innerHTML = html;
}

/* ---------------- Series screen ---------------- */
let seriesCache = {};
let selectedPeriod = null;
function sparkSVG(vintages, w = 180, h = 44) {
  const vals = vintages.map(v => v.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const x = i => 4 + (i * (w - 8)) / Math.max(vals.length - 1, 1);
  const y = v => h - 6 - ((v - min) / span) * (h - 12);
  let d = `M ${x(0)} ${y(vals[0])}`;
  for (let i = 1; i < vals.length; i++) d += ` H ${x(i)} V ${y(vals[i])}`;
  const moved = min !== max;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${moved ? 'var(--accent)' : 'var(--wire)'}" stroke-width="1.6"/>
    ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.1" fill="${i === vals.length - 1 ? 'var(--accent)' : 'var(--wire)'}"/>`).join('')}</svg>`;
}
function bigChartSVG(vintages) {
  const w = 920, h = 300, padL = 52, padR = 20, padT = 26, padB = 56;
  const vals = vintages.map(v => v.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12; min -= pad; max += pad;
  const x = i => padL + (i * (w - padL - padR)) / Math.max(vals.length - 1, 1);
  const y = v => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  let d = `M ${x(0)} ${y(vals[0])}`;
  for (let i = 1; i < vals.length; i++) d += ` H ${x(i)} V ${y(vals[i])}`;
  const ticks = 4;
  let grid = '';
  for (let t = 0; t <= ticks; t++) {
    const v = min + ((max - min) * t) / ticks;
    grid += `<line x1="${padL}" x2="${w - padR}" y1="${y(v)}" y2="${y(v)}" stroke="var(--hair)" stroke-width="1"/>
      <text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${parseFloat(v.toFixed(2))}</text>`;
  }
  return `<svg class="big" viewBox="0 0 ${w} ${h}" role="img" aria-label="Vintage timeline">
    ${grid}
    <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>
    ${vintages.map((v, i) => `<g><circle cx="${x(i)}" cy="${y(v.value)}" r="4.4" fill="var(--paper)" stroke="var(--accent)" stroke-width="2">
      <title>${esc(v.published_on)} · ${v.value} · ${esc(v.source_title)}</title></circle>
      <text x="${x(i)}" y="${y(v.value) - 10}" text-anchor="middle" font-size="12" font-weight="650" fill="var(--ink)">${v.value}</text>
      <text x="${x(i)}" y="${h - padB + 18}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${esc(v.published_on.slice(2))}</text>
      <text x="${x(i)}" y="${h - padB + 32}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${esc(v.source_title.startsWith('Advance') ? 'advance' : v.source_title.startsWith('Economic') ? 'survey' : '')}</text></g>`).join('')}
  </svg>`;
}
async function renderSeries() {
  const sid = localStorage.getItem('rp-series') || 'sg-gdp-manufacturing-yoy';
  const opts = STATE.series.map(s => `<option value="${esc(s.id)}" ${s.id === sid ? 'selected' : ''}>${esc(s.title)} (${esc(s.id)})</option>`).join('');
  screen.innerHTML = `<div class="series-controls"><label class="label" for="series-select" style="margin:0">Series</label>
    <select id="series-select">${opts}</select><span class="trigger" id="series-meta"></span></div>
    <div id="series-body"><p class="reason">Loading…</p></div>`;
  $('#series-select').addEventListener('change', e => { localStorage.setItem('rp-series', e.target.value); selectedPeriod = null; renderSeries(); });
  let data = seriesCache[sid];
  if (!data) { data = await fetchJSON(`/api/series/${encodeURIComponent(sid)}`); seriesCache[sid] = data; }
  const periods = Object.keys(data.periods).sort().reverse();
  if (!selectedPeriod || !data.periods[selectedPeriod]) {
    selectedPeriod = periods.find(p => { const vs = data.periods[p]; return new Set(vs.map(v => v.value)).size > 1; }) || periods[0];
  }
  $('#series-meta').textContent = `${data.series.agency} · unit ${data.series.unit} · ${periods.length} periods`;
  const cards = periods.map(p => {
    const vs = data.periods[p];
    const moved = new Set(vs.map(v => v.value)).size > 1;
    return `<button type="button" class="period-card" data-period="${esc(p)}" aria-pressed="${p === selectedPeriod}">
      <span class="p-title">${esc(periodLabel(p))}${moved ? '<span class="badge number_only" style="padding:1px 6px;font-size:11px">revised</span>' : ''}</span>
      <span class="p-vals">${vs[0].value} → ${vs.at(-1).value} · ${vs.length} releases</span>${sparkSVG(vs)}</button>`;
  }).join('');
  const vs = data.periods[selectedPeriod];
  const rows = vs.map((v, i) => `<tr><td>${fmtDate(v.published_on)}</td><td class="num ${i > 0 && v.value !== vs[i - 1].value ? 'moved' : ''}">${v.value}${data.series.unit === '%' ? '%' : ''}</td>
    <td><a href="${esc(v.source_url)}" target="_blank" rel="noopener noreferrer">${esc(v.source_title)}</a></td><td>${esc(v.locator)}</td></tr>`).join('');
  $('#series-body').innerHTML = `<div class="period-grid">${cards}</div>
    <div class="chart-panel"><h3>${esc(data.series.title)} — ${esc(periodLabel(selectedPeriod))}</h3>
    <p class="sub">How the official value for this period moved between releases. <a href="${esc(data.series.dataset_url)}" target="_blank" rel="noopener noreferrer">Dataset ↗</a></p>
    ${bigChartSVG(vs)}
    <table class="vtable"><thead><tr><th>Published</th><th>Value</th><th>Release</th><th>Locator</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  screen.querySelectorAll('.period-card').forEach(b => b.addEventListener('click', () => { selectedPeriod = b.dataset.period; renderSeries(); }));
}

/* ---------------- Audit screen ---------------- */
let auditEvent = 'all', auditQ = '';
async function renderAudit() {
  screen.innerHTML = `<div class="map-heading"><h2>Audit trail</h2><p>Append-only run log — every check and every decision</p></div>
    <div class="audit-controls"><select id="audit-event" aria-label="Filter by event"></select>
    <input type="text" id="audit-q" placeholder="Search detail…" value="${esc(auditQ)}">
    <button type="button" id="audit-refresh">Refresh</button></div><div id="audit-body"><p class="reason">Loading…</p></div>`;
  const params = new URLSearchParams();
  if (auditEvent !== 'all') params.set('event', auditEvent);
  if (auditQ) params.set('q', auditQ);
  const data = await fetchJSON('/api/log?' + params);
  const sel = $('#audit-event');
  sel.innerHTML = `<option value="all">All events</option>` + data.events.map(e => `<option value="${esc(e)}" ${e === auditEvent ? 'selected' : ''}>${esc(e)}</option>`).join('');
  sel.addEventListener('change', () => { auditEvent = sel.value; renderAudit(); });
  const q = $('#audit-q');
  let deb = null;
  q.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(() => { auditQ = q.value; renderAudit(); }, 350); });
  $('#audit-refresh').addEventListener('click', renderAudit);
  const cls = e => e.startsWith('decision') ? 'decision' : e.startsWith('replay') ? 'replay' : e.startsWith('vintage') ? 'vintage' : e === 'check' ? 'check' : '';
  $('#audit-body').innerHTML = data.rows.length ? `<table class="log-table"><thead><tr><th>Timestamp (UTC)</th><th>Event</th><th>Detail</th></tr></thead><tbody>
    ${data.rows.map(r => `<tr><td class="ts">${esc(r.timestamp.replace('T', ' ').slice(0, 19))}</td><td><span class="event-tag ${cls(r.event)}">${esc(r.event)}</span></td><td>${esc(r.detail)}</td></tr>`).join('')}</tbody></table>`
    : `<div class="quiet"><p>No log entries match.</p></div>`;
}

/* ---------------- Releases screen ---------------- */
let countdownTimer = null;
function renderReleases() {
  clearInterval(countdownTimer);
  const rels = STATE.releases;
  const hero = rels.find(r => r.time_sgt && r.release.startsWith('GDP,'));
  const byDate = {};
  for (const r of rels) (byDate[r.date] ||= []).push(r);
  const short = sid => sid.replace('sg-gdp-', '').replace('sg-', '');
  let html = '';
  if (hero) {
    html += `<section class="release-hero"><p class="kicker">Next tracked release <span> / </span> ${esc(hero.time_sgt)} Singapore time</p>
      <h2>${esc(hero.release)}</h2><div class="countdown" id="countdown">…</div>
      <p>${fmtDate(hero.date)} · 08:00 SGT · advance GDP estimates for Q3 2026 — every tracked GDP series may move.</p>
      <div class="chips">${hero.tracked_series.map(s => `<span class="chip">${esc(short(s))}</span>`).join('')}</div>
      <p>${hero.announcement_url ? `<a href="${esc(hero.announcement_url)}" target="_blank" rel="noopener noreferrer">Announcement ↗</a> · ` : ''}<a href="${esc(hero.url)}" target="_blank" rel="noopener noreferrer">SingStat release calendar ↗</a></p></section>`;
    const target = Date.parse(`${hero.date}T${hero.time_sgt}:00+08:00`);
    const tick = () => {
      const el = $('#countdown');
      if (!el) { clearInterval(countdownTimer); return; }
      let ms = target - Date.now();
      if (ms <= 0) { el.textContent = 'Release window open'; return; }
      const d = Math.floor(ms / 864e5); ms -= d * 864e5;
      const h = Math.floor(ms / 36e5); ms -= h * 36e5;
      const m = Math.floor(ms / 6e4); ms -= m * 6e4;
      const s = Math.floor(ms / 1e3);
      el.textContent = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }
  html += `<div class="map-heading"><h2>Release calendar</h2><p>${rels.length} releases · window ${fmtDate(rels[0]?.date)} – ${fmtDate(rels.at(-1)?.date)} · times in SGT</p></div>`;
  for (const date of Object.keys(byDate).sort()) {
    html += `<div class="rel-day"><h3>${fmtDate(date)}</h3>`;
    for (const r of byDate[date]) {
      const tracked = r.tracked_series.length > 0;
      const dtype = r.date_type === 'window' ? `window · until ${fmtDate(r.end_date)}` : r.date_type === 'no_later_than' ? 'no later than' : 'scheduled';
      html += `<div class="rel-item ${tracked ? 'tracked' : ''}"><div><span class="rel-name">${esc(r.release)}</span>
        ${r.time_sgt ? ` <span class="rel-meta">· ${esc(r.time_sgt)} SGT</span>` : ''}
        ${tracked ? `<div class="chips">${r.tracked_series.map(s => `<span class="chip">${esc(short(s))}</span>`).join('')}</div>` : ''}</div>
        <div><span class="dtype">${esc(dtype)}</span> · <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" class="rel-meta">calendar ↗</a></div></div>`;
    }
    html += `</div>`;
  }
  screen.innerHTML = html;
}

/* ---------------- Replay ---------------- */
function banner(html) {
  const b = $('#replay-banner');
  b.hidden = !html;
  if (html) b.innerHTML = html;
}
async function replay() {
  if (replaying) return;
  replaying = true;
  $('#btn-replay').disabled = true; $('#btn-check').disabled = true;
  location.hash = '#/map';
  try {
    banner('<b>Replay</b> · resetting demo data…');
    await post('/api/reset');
    await refresh(); renderMap();
    await sleep(1200);
    const A = STATE.cases.A, B = STATE.cases.B;
    const aClaim = STATE.claims.find(c => c.id === A.checks[0].expected[0].claim_id) || STATE.claims[0];
    const bClaim = STATE.claims.find(c => c.id === B.checks[0].expected[0].claim_id);
    const steps = [
      { tag: 'A', as_of: A.checks[0].as_of, focus: { series_id: aClaim.series_id, period: aClaim.period },
        title: `Case A · ${A.title}`, sub: 'The 21 Nov 2025 Economic Survey revises Q3 2025 manufacturing growth from 0.0% to 5.0%. Watch the map: flat claims turn “Now wrong”, the dated board sentence stays true.', dots: '●○○' },
      { tag: 'B1', as_of: B.checks[0].as_of, focus: { series_id: bClaim.series_id, period: bClaim.period },
        title: `Case B · ${B.title} — step 1`, sub: 'Q2 2026 GDP growth is revised 5.7% → 5.9%. Still under 6%, so the claim is “Number only”: the assertion holds, the figure is stale.', dots: '○●○' },
      { tag: 'B2', as_of: B.checks[1].as_of, focus: { series_id: bClaim.series_id, period: bClaim.period },
        title: `Case B · ${B.title} — step 2`, sub: 'The 14 Oct 2026 advance estimate puts Q2 2026 growth at 6.2% — the “under 6%” claim is now wrong and a sourced correction is proposed.', dots: '○○●' },
    ];
    for (const step of steps) {
      banner(`<b>${esc(step.title)}</b><span class="step-dots">${step.dots}</span><br>${esc(step.sub)}`);
      await post('/api/check', { as_of: step.as_of, trigger: 'email', focus_series_id: step.focus.series_id, focus_period: step.focus.period, replay: step.tag });
      await refresh(); renderMap();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await sleep(4200);
    }
    banner('<b>Replay complete</b> · case A then case B, step by step. Every verdict, decision and check is in the audit trail. Press Replay demo to run it again.');
    toast('Replay complete — ready to record.');
  } catch (err) {
    banner('');
    toast('Replay failed: ' + err.message);
  } finally {
    replaying = false;
    $('#btn-replay').disabled = false; $('#btn-check').disabled = false;
  }
}

/* ---------------- Router ---------------- */
const SCREENS = { map: renderMap, publications: renderPublications, series: renderSeries, audit: renderAudit, releases: renderReleases };
function route() {
  const name = (location.hash.replace('#/', '') || 'map').split('?')[0];
  const render = SCREENS[name] || renderMap;
  document.querySelectorAll('nav.tabs a').forEach(a => a.setAttribute('aria-current', a.dataset.screen === name ? 'page' : 'false'));
  if (name !== 'releases') clearInterval(countdownTimer);
  Promise.resolve(render()).catch(err => { screen.innerHTML = `<div class="quiet"><p>Something went wrong: ${esc(err.message)}</p></div>`; });
}
window.addEventListener('hashchange', route);
$('#btn-replay').addEventListener('click', replay);
$('#btn-check').addEventListener('click', async () => {
  if (replaying) return;
  try {
    $('#btn-check').disabled = true;
    const r = await post('/api/check', { trigger: 'manual' });
    await refresh();
    location.hash = '#/map'; route();
    toast(`Check as of ${r.check.as_of}: ${r.counts.now_wrong} now wrong, ${r.counts.number_only} number only, ${r.counts.still_true} still true, ${r.counts.unaffected} unaffected.`);
  } catch (err) { toast(err.message); }
  finally { $('#btn-check').disabled = false; }
});

(async () => {
  try {
    await refresh();
    const t = $('#trigger-line');
    if (STATE.latest) t.textContent = `Last check ${fmtDate(STATE.latest.check.as_of)} · ${STATE.checks.length} check(s) on record`;
    route();
  } catch (err) {
    screen.innerHTML = `<div class="quiet"><p>Could not reach the control room API: ${esc(err.message)}</p></div>`;
  }
})();