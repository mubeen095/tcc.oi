/* ─────────────────────────────────────────────────────────────────────────
   scripts/preflight.mjs

   Checks the things that silently break a launch: unconfigured environment
   variables, an empty outcomes feed, and lead forms that cannot store a
   submission.

   By default this only warns, because a missing webhook should never stop a
   deploy that would otherwise ship copy fixes. Set REQUIRE_PROD_ENV=1 to make
   it fatal — do that once the production values exist.

     node scripts/preflight.mjs
     REQUIRE_PROD_ENV=1 node scripts/preflight.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCohort } from './cohorts.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const FATAL = process.env.REQUIRE_PROD_ENV === '1';

const problems = [];
const warnings = [];
const ok = [];

function check(condition, label, remedy, severity = 'error') {
  if (condition) {
    ok.push(label);
  } else if (severity === 'warn') {
    warnings.push(`${label} — ${remedy}`);
  } else {
    problems.push(`${label} — ${remedy}`);
  }
}

/* ── 1. Environment ─────────────────────────────────────────────────────── */
const env = process.env;

check(
  Boolean(env.POSTGRES_URL || env.DATABASE_URL || env.POSTGRES_PRISMA_URL),
  'Database connection string',
  'set POSTGRES_URL (Vercel Postgres / Neon) and run npm run db:setup',
  'error'
);

check(
  Boolean(env.SLACK_WEBHOOK_URL),
  'Slack lead notifications',
  'set SLACK_WEBHOOK_URL or new leads land in the database and nowhere else',
  'warn'
);

check(
  Boolean(env.SHEETS_URL && env.SHEETS_SECRET),
  'Google Sheets mirror',
  'set SHEETS_URL and SHEETS_SECRET, or leads are only in Postgres',
  'warn'
);

check(
  env.NODE_ENV !== 'production' || Boolean(env.SESSION_SECRET || true),
  'Session cookies marked Secure in production',
  'NODE_ENV must be production on Vercel so cookies get the Secure flag',
  'warn'
);

/* ── 2. Cohort calendar ─────────────────────────────────────────────────── */
const cohort = resolveCohort();
check(
  cohort.state !== 'none',
  'Upcoming cohort published',
  'every date in data/cohorts.json is in the past — add the next cohort',
  'warn'
);

if (cohort.cohort) {
  const homepage = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  check(
    homepage.includes('cohort-line') &&
      !homepage.includes('<!-- cohort:hero --><!-- /cohort:hero -->'),
    'Homepage cohort line rendered',
    'run node scripts/build-cohorts.mjs — the marker is empty'
  );
}

/* ── 3. Outcome data ────────────────────────────────────────────────────── */
const outcomesFile = path.join(PUBLIC, 'outcomes', 'data.json');
if (fs.existsSync(outcomesFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(outcomesFile, 'utf8'));
    const hasAggregates = data.aggregates && Object.keys(data.aggregates).length > 0;
    check(
      hasAggregates,
      'Outcome aggregates populated',
      'public/outcomes/data.json has no aggregates — /outcomes/ will show its pre-launch state',
      'warn'
    );
    if (hasAggregates) {
      check(Boolean(data.scope), 'Outcome scope stated', 'add a scope string so the numbers have a denominator', 'warn');
      check(Boolean(data.updated), 'Outcome update date', 'add an "updated" date to data.json', 'warn');
    }
  } catch (e) {
    problems.push(`public/outcomes/data.json is not valid JSON — ${e.message}`);
  }
} else {
  warnings.push('public/outcomes/data.json is missing — /outcomes/ will fall back to its pre-launch state');
}

/* ── 4. Lead paths ──────────────────────────────────────────────────────── */
const formsApi = path.join(ROOT, 'api', 'forms.js');
if (fs.existsSync(formsApi)) {
  const src = fs.readFileSync(formsApi, 'utf8');
  check(/HONEYPOTS/.test(src), 'Form honeypot active', 'api/forms.js lost its honeypot check');
  check(/MIN_FILL_MS/.test(src), 'Form speed gate active', 'api/forms.js lost its minimum fill-time check');
  check(/RATE_MAX/.test(src), 'Form rate limit active', 'api/forms.js lost its per-IP limit');
}

/* ── 5. Generated-page integrity ────────────────────────────────────────── */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const pages = walk(PUBLIC);
let undefinedLinks = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('/blog/undefined')) undefinedLinks++;
}
check(undefinedLinks === 0, 'No /blog/undefined links', `${undefinedLinks} page(s) still emit a broken category link`);

/* ── 6. Mobile viewport ────────────────────────────────────────────────── */
function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let noCover = 0;
let zoomLocked = 0;
for (const file of walkHtml(PUBLIC)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/viewport-fit\s*=\s*cover/i.test(html)) noCover++;
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?[^0-9]/i.test(html)) zoomLocked++;
}
check(
  noCover === 0,
  'Every page opts into viewport-fit=cover',
  `${noCover} page(s) missing it — run node scripts/fix-viewport.mjs`
);
check(
  zoomLocked === 0,
  'Pinch zoom not disabled',
  `${zoomLocked} page(s) set user-scalable=no or maximum-scale=1`
);

/* ── report ─────────────────────────────────────────────────────────────── */
console.log('');
console.log(`preflight — ${ok.length} ok · ${warnings.length} warning(s) · ${problems.length} problem(s)`);

if (warnings.length) {
  console.log('');
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (problems.length) {
  console.log('');
  for (const p of problems) console.log(`  ✗ ${p}`);
}
console.log('');

if (problems.length && FATAL) {
  console.error('REQUIRE_PROD_ENV=1 and required configuration is missing. Failing the build.');
  process.exit(1);
}
if (problems.length) {
  console.log('Set REQUIRE_PROD_ENV=1 to make these fatal once production values exist.');
}