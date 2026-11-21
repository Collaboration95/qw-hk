// Seed and reset. All rows come from seed.json, which tools/build_seed.py
// generates by parsing the official series files, the claim register, the
// answer-key cases and the release calendar. Nothing is hand-typed.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { select, insert, removeAll, log } from './db.js';

const here = dirname(fileURLToPath(import.meta.url));
export const seed = JSON.parse(readFileSync(join(here, 'seed.json'), 'utf8'));

const ORDER = ['decisions', 'verdicts', 'checks', 'run_log', 'claims', 'publications', 'vintages', 'series', 'releases'];

export async function seedIfEmpty() {
  const existing = await select('series', { limit: 1 });
  if (existing.length) return false;
  await loadSeed();
  await log('seed', `Database seeded from parsed source files: ${seed.series.length} series, ${seed.vintages.length} dated vintages, ${seed.publications.length} publications, ${seed.claims.length} registered claims, ${seed.releases.length} calendar releases.`);
  return true;
}

export async function loadSeed() {
  await insert('series', seed.series);
  await insert('vintages', seed.vintages);
  await insert('publications', seed.publications);
  await insert('claims', seed.claims);
  await insert('releases', seed.releases);
}

export async function resetDemo() {
  for (const t of ORDER) await removeAll(t);
  await loadSeed();
  await log('seed', `Database re-seeded from parsed source files: ${seed.series.length} series, ${seed.vintages.length} dated vintages, ${seed.publications.length} publications, ${seed.claims.length} registered claims, ${seed.releases.length} calendar releases.`);
  await log('replay.reset', 'Demo data reset: checks, verdicts, decisions and the run log were cleared and the seed data reloaded from the parsed source files.');
}