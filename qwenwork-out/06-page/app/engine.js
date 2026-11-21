// Verdict engine. Semantics follow the Recall Press rule book:
//  - a "dated" claim quotes a named historical release -> still_true
//  - latest value equals the cited baseline -> unaffected
//  - direction/threshold/level/comparison assertions are re-evaluated against
//    the latest vintage; a stale number whose assertion still holds is
//    number_only, a broken assertion is now_wrong, anything uncertain is
//    needs_human. Original sentences are never modified.
import { select, insert, log, uid } from './db.js';

export const STATUSES = ['now_wrong', 'number_only', 'still_true', 'unaffected', 'needs_human'];
const OPS = { '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '>=': (a, b) => a >= b };
const sign = v => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');

const PERCENT = /(?<![\w.])([+\u2212-]?\d+(?:\.\d+)?)\s*(?:%|per\s*cent\b|percent\b)/gi;
const PERSONS = /(?<![\w.,])([+\u2212-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s+(?:people|persons|jobs|workers)\b/gi;
const THRESHOLD = /\b(no (?:more|higher) than|at most|not (?:above|over)|no (?:less|lower) than|at least|not (?:below|under)|under|below|less than|lower than|over|above|more than|greater than|higher than|exceeded)\s+([\u2212+-]?\d+(?:\.\d+)?)\s*(?:%|per\s*cent\b|percent\b)/gi;
const numeric = t => parseFloat(t.replace(/,/g, '').replace(/\u2212/g, '-'));

function measurements(text) {
  return [...text.matchAll(PERCENT), ...text.matchAll(PERSONS)].sort((a, b) => a.index - b.index);
}
function measuredValues(sentence) {
  const stripped = sentence.replace(THRESHOLD, '');
  return measurements(stripped).map(m => numeric(m[1]));
}

export function fmtVal(v, unit) {
  const n = String(parseFloat(v));
  return unit === '%' ? `${n}%` : unit === 'persons' ? `${Number(v).toLocaleString('en-SG')} ${unit}` : `${n} ${unit}`;
}

export function evaluate(claim, newVal, peerVal, unit) {
  const old = claim.value_cited;
  const a = claim.assertion || {};
  if (claim.stance === 'dated') {
    return {
      status: 'still_true',
      reason: `The sentence quotes the ${claim.vintage_cited} release, which reported ${fmtVal(old, unit)}. That historical statement still holds.`,
    };
  }
  if (a.type === 'comparison' && peerVal != null && OPS[a.operator] && a.reference) {
    const ref = a.reference;
    if (OPS[a.operator](old, ref.value_cited)) {
      const holds = OPS[a.operator](newVal, peerVal);
      return {
        status: holds ? 'number_only' : 'now_wrong',
        reason: `The comparison ${a.operator} ${holds ? 'still holds' : 'no longer holds'}: ${claim.period} is ${fmtVal(newVal, unit)}, and ${ref.period} is ${fmtVal(peerVal, unit)}.`,
      };
    }
    return { status: 'needs_human', reason: `The cited baseline for the comparison does not satisfy ${a.operator}; read the sentence before changing it.` };
  }
  if (old === newVal) {
    return { status: 'still_true', reason: `The latest revision returns to the cited value ${fmtVal(old, unit)}.` };
  }
  if (a.type === 'threshold' && OPS[a.operator] && typeof a.threshold === 'number') {
    if (OPS[a.operator](old, a.threshold)) {
      if (OPS[a.operator](newVal, a.threshold)) {
        return { status: 'number_only', reason: `Both ${fmtVal(old, unit)} and ${fmtVal(newVal, unit)} satisfy ${a.operator} ${a.threshold}%.` };
      }
      return { status: 'now_wrong', reason: `${fmtVal(old, unit)} satisfied ${a.operator} ${a.threshold}%, but ${fmtVal(newVal, unit)} breaks that threshold.` };
    }
    return { status: 'needs_human', reason: `The cited value did not satisfy the stated threshold; read the sentence before changing it.` };
  }
  if (a.type === 'direction' && a.detail === sign(old)) {
    if (sign(old) !== sign(newVal)) {
      return { status: 'now_wrong', reason: `The cited direction was ${sign(old)} at ${fmtVal(old, unit)}; the revision is ${sign(newVal)} at ${fmtVal(newVal, unit)}.` };
    }
    if (/\bstrong growth\b/i.test(claim.sentence) && newVal < old) {
      return { status: 'needs_human', reason: `Growth remains positive at ${fmtVal(newVal, unit)}. The sentence gives no cutoff for strong growth.` };
    }
    return { status: 'number_only', reason: `The figure moves from ${fmtVal(old, unit)} to ${fmtVal(newVal, unit)} and the direction remains ${sign(newVal)}.` };
  }
  if (a.type === 'level' && a.detail !== 'needs_review') {
    const vals = measuredValues(claim.sentence);
    if (vals.length === 1 && vals[0] === old) {
      if (/\b(?:exactly|equal to)\b/i.test(claim.sentence)) {
        return { status: 'now_wrong', reason: `The claim of exactly ${fmtVal(old, unit)} is incompatible with ${fmtVal(newVal, unit)}.` };
      }
      return { status: 'number_only', reason: `The sentence reports a level. Update its figure from ${fmtVal(old, unit)} to ${fmtVal(newVal, unit)}.` };
    }
  }
  return { status: 'needs_human', reason: `Cannot establish the ${a.type || 'unknown'} assertion from these two values alone (${fmtVal(old, unit)} and ${fmtVal(newVal, unit)}). Read the sentence and its supporting evidence.` };
}

// Proposed replacement sentence (never touches the original).
export function propose(claim, series, newVal, status, peerVal) {
  if (status !== 'now_wrong' && status !== 'number_only') return null;
  const sentence = claim.sentence;
  const old = claim.value_cited;
  const unit = series.unit;
  const formatted = String(parseFloat(newVal));
  if (status === 'number_only') {
    if (claim.assertion?.type === 'comparison' && peerVal != null) {
      return `${sentence.replace(/[.!?]+$/, '')} (${formatted}${unit} versus ${String(parseFloat(peerVal))}${unit}).`;
    }
    const bounds = [...sentence.matchAll(THRESHOLD)].map(m => [m.index, m.index + m[0].length]);
    for (const m of measurements(sentence)) {
      if (bounds.some(([l, r]) => l <= m.index && m.index < r)) continue;
      const amount = numeric(m[1]);
      if (amount === old || (amount === -old && claim.assertion?.detail === 'down')) {
        const figure = amount === -old && old < 0 ? String(Math.abs(parseFloat(newVal))) : formatted;
        const shown = unit === 'persons' ? Number(figure).toLocaleString('en-SG') : figure;
        const start = m.index + m[0].indexOf(m[1]);
        return sentence.slice(0, start) + shown + sentence.slice(start + m[1].length);
      }
    }
    if (claim.assertion?.type === 'threshold') {
      return `${sentence.replace(/[.!?]+$/, '')} (${formatted}${unit}).`;
    }
  }
  if (claim.assertion?.detail === 'flat' && measuredValues(sentence).length === 0) {
    const pat = /\b(?:stalled|stagnated|stood still|(?:was|remained|stayed) (?:flat|unchanged))\b/i;
    const revised = sentence.replace(pat, `${newVal > 0 ? 'grew' : 'fell'} ${Math.abs(parseFloat(newVal))}${unit}`);
    if (revised !== sentence) return revised;
  }
  const period = claim.period.replace(/(\d{4})-(Q[1-4])/, '$2 $1');
  if (claim.series_id.startsWith('sg-gdp-')) {
    const label = series.title.split(',')[0];
    const subject = label === 'Overall' ? 'Singapore\u2019s real GDP' : `${label} output`;
    const basis = claim.series_id.endsWith('-qoq') ? 'quarter on quarter, seasonally adjusted' : 'year on year';
    if (newVal === 0) return `${subject} was flat in ${period} (${basis}).`;
    return `${subject} ${newVal > 0 ? 'grew' : 'fell'} ${Math.abs(parseFloat(newVal))}% in ${period} (${basis}).`;
  }
  const gap = unit === '%' ? '' : ' ';
  return `${series.title} was ${formatted}${gap}${unit} in ${period}.`;
}

const latestVintage = (vintages, sid, period, asOf) =>
  vintages.filter(v => v.series_id === sid && v.period === period && v.published_on <= asOf)
    .sort((a, b) => a.published_on.localeCompare(b.published_on)).at(-1) || null;

function linksOf(claim) {
  const links = [{ series_id: claim.series_id, period: claim.period, value_cited: claim.value_cited, vintage_cited: claim.vintage_cited, primary: true }];
  const ref = claim.assertion?.reference;
  if (ref) links.push({ ...ref, primary: false });
  return links;
}

// Run a check as of a date. A claim is re-evaluated only when a linked figure
// actually moved beyond the baseline already recorded for that claim; the
// baseline starts at the cited vintage and advances with each evaluated check.
export async function runCheck({ asOf, trigger = 'manual', focus = null, replay = null }) {
  const today = new Date().toISOString().slice(0, 10);
  asOf = asOf || today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw Object.assign(new Error('as_of must be YYYY-MM-DD'), { code: 400 });
  const [publications, claims, vintages, checks, verdicts, series] = await Promise.all([
    select('publications'), select('claims'), select('vintages'),
    select('checks', { order: ['as_of', 'asc'] }), select('verdicts'), select('series'),
  ]);
  const seriesById = Object.fromEntries(series.map(s => [s.id, s]));
  const pubById = Object.fromEntries(publications.map(p => [p.id, p]));
  const included = claims.filter(c => pubById[c.publication_id] && pubById[c.publication_id].published_on <= asOf);
  const prevAsOf = checks.length ? checks.at(-1).as_of : null;

  const priorByClaim = {};
  for (const v of verdicts) (priorByClaim[v.claim_id] ||= []).push(v);

  const windowStart = prevAsOf || included.reduce((m, c) => (c.vintage_cited < m ? c.vintage_cited : m), '9999');
  const linkedKeys = new Set(included.flatMap(c => linksOf(c).map(l => `${l.series_id}|${l.period}`)));
  const newVintages = vintages.filter(v => v.published_on > windowStart && v.published_on <= asOf && linkedKeys.has(`${v.series_id}|${v.period}`));

  const rows = [];
  const changes = new Map();
  for (const claim of included) {
    const prior = priorByClaim[claim.id] || [];
    const unit = seriesById[claim.series_id]?.unit || '%';
    let affected = false;
    const resolved = [];
    for (const link of linksOf(claim)) {
      const evals = prior.map(v => (link.primary ? v.vintage_evaluated : v.peer_evaluated)).filter(Boolean);
      const baseDate = [link.vintage_cited, ...evals].sort().at(-1);
      const baseVintage = vintages.find(v => v.series_id === link.series_id && v.period === link.period && v.published_on === baseDate);
      const baseValue = baseVintage ? baseVintage.value : link.value_cited;
      const latest = latestVintage(vintages, link.series_id, link.period, asOf);
      if (!latest) throw Object.assign(new Error(`No vintage for ${link.series_id} ${link.period} as of ${asOf}`), { code: 400 });
      if (latest.value !== baseValue) {
        affected = true;
        const key = `${link.series_id}|${link.period}`;
        if (!changes.has(key)) {
          changes.set(key, {
            series_id: link.series_id, period: link.period, title: seriesById[link.series_id]?.title, unit,
            old: baseValue, new: latest.value, old_published: baseDate, new_published: latest.published_on,
            old_release: baseVintage?.source_title || '', new_release: latest.source_title, url: latest.source_url,
          });
        }
      }
      resolved.push({ link, latest, baseValue, baseDate });
    }
    let status, reason, evidence = null, proposed = null, vEval = null, pEval = null;
    if (!affected) {
      status = 'unaffected';
      reason = prior.length && prior.some(v => v.vintage_evaluated)
        ? 'No new revision since the earlier check recorded this change.'
        : `No change to the linked figures for ${claim.period}.`;
    } else {
      const primary = resolved[0];
      const peer = resolved[1];
      const verdict = evaluate(claim, primary.latest.value, peer ? peer.latest.value : null, unit);
      status = verdict.status; reason = verdict.reason;
      evidence = primary.latest.source_url;
      proposed = propose(claim, seriesById[claim.series_id], primary.latest.value, status, peer ? peer.latest.value : null);
      vEval = primary.latest.published_on;
      pEval = peer ? peer.latest.published_on : null;
    }
    rows.push({
      id: uid(), check_id: null, claim_id: claim.id, status, reason,
      evidence_url: evidence, proposed_sentence: proposed,
      vintage_evaluated: vEval, peer_evaluated: pEval,
    });
  }

  // Headline figure: the focus link if given, else the largest absolute move.
  let headline = null;
  const changeList = [...changes.values()];
  if (focus) headline = changeList.find(c => c.series_id === focus.series_id && c.period === focus.period) || null;
  if (!headline && changeList.length) headline = changeList.sort((a, b) => Math.abs(b.new - b.old) - Math.abs(a.new - a.old))[0];
  if (!headline && focus) {
    // Focus figure may be unchanged this check; still show its latest state.
    const latest = latestVintage(vintages, focus.series_id, focus.period, asOf);
    if (latest) {
      const prev = vintages.filter(v => v.series_id === focus.series_id && v.period === focus.period && v.published_on < latest.published_on).sort((a, b) => a.published_on.localeCompare(b.published_on)).at(-1);
      headline = {
        series_id: focus.series_id, period: focus.period, title: seriesById[focus.series_id]?.title, unit: seriesById[focus.series_id]?.unit || '%',
        old: prev ? prev.value : latest.value, new: latest.value,
        old_published: prev ? prev.published_on : latest.published_on, new_published: latest.published_on,
        old_release: prev?.source_title || '', new_release: latest.source_title, url: latest.source_url, unchanged: true,
      };
    }
  }

  const check = {
    id: uid(), as_of: asOf, trigger, new_vintages_found: newVintages.length,
    focus_series_id: headline?.series_id || null, focus_period: headline?.period || null,
    replay_tag: replay, created_at: new Date().toISOString(),
  };
  await insert('checks', [check]);
  rows.forEach(r => { r.check_id = check.id; });
  await insert('verdicts', rows);
  const counts = Object.fromEntries(STATUSES.map(s => [s, rows.filter(r => r.status === s).length]));
  await log('check', `Check as of ${asOf} (${trigger}${replay ? `, replay ${replay}` : ''}): ${newVintages.length} new vintage(s), ${rows.length} claims evaluated \u2014 ${counts.now_wrong} now wrong, ${counts.number_only} number only, ${counts.still_true} still true, ${counts.unaffected} unaffected, ${counts.needs_human} need human.`);
  return { check, headline, verdicts: rows, counts, changes: changeList };
}

export async function addVintage({ series_id, period, value, published_on, source_title, source_url, locator, trigger = 'email' }) {
  for (const [k, v] of Object.entries({ series_id, period, published_on })) {
    if (!v) throw Object.assign(new Error(`${k} is required`), { code: 400 });
  }
  if (typeof value !== 'number' || Number.isNaN(value)) throw Object.assign(new Error('value must be a number'), { code: 400 });
  const series = await select('series', { filter: [['eq', 'id', series_id]] });
  if (!series.length) throw Object.assign(new Error(`Unknown series ${series_id}`), { code: 400 });
  const dup = await select('vintages', { filter: [['eq', 'series_id', series_id], ['eq', 'period', period], ['eq', 'published_on', published_on]] });
  if (dup.length) throw Object.assign(new Error('A vintage for this series, period and date already exists'), { code: 409 });
  const row = {
    id: uid(), series_id, period, value, published_on,
    source_title: source_title || 'Incoming release', source_url: source_url || series[0].dataset_url, locator: locator || '',
  };
  await insert('vintages', [row]);
  await log('vintage.added', `New vintage accepted: ${series_id} ${period} = ${value} (${published_on}), source: ${row.source_title}.`);
  const result = await runCheck({ asOf: published_on, trigger, focus: { series_id, period } });
  return { vintage: row, ...result };
}

export async function recordDecision({ verdict_id, action, edited_text }) {
  if (!['apply', 'skip', 'edit_first'].includes(action)) throw Object.assign(new Error('action must be apply, skip or edit_first'), { code: 400 });
  const vs = await select('verdicts', { filter: [['eq', 'id', verdict_id]] });
  if (!vs.length) throw Object.assign(new Error('Unknown verdict'), { code: 404 });
  const verdict = vs[0];
  const fixable = ['now_wrong', 'number_only'].includes(verdict.status);
  if (action !== 'skip' && !fixable) throw Object.assign(new Error('Only now_wrong or number_only verdicts can be applied or edited'), { code: 400 });
  if (action === 'edit_first' && (!edited_text || !edited_text.trim())) throw Object.assign(new Error('edited_text is required for edit_first'), { code: 400 });
  const claims = await select('claims', { filter: [['eq', 'id', verdict.claim_id]] });
  const claim = claims[0];
  const row = {
    id: uid(), verdict_id, action,
    edited_text: action === 'edit_first' ? edited_text.trim() : null,
    decided_at: new Date().toISOString(),
  };
  await insert('decisions', [row]);
  const label = { apply: 'Apply fix', skip: 'Skip', edit_first: 'Edit first, then apply' }[action];
  await log(`decision.${action}`, `${label} recorded for claim ${claim.id} (${verdict.status}): \u201c${claim.sentence}\u201d${action === 'edit_first' ? ` \u2192 edited to \u201c${row.edited_text}\u201d` : action === 'apply' && verdict.proposed_sentence ? ` \u2192 \u201c${verdict.proposed_sentence}\u201d` : ''}. Original sentence preserved.`);
  return row;
}