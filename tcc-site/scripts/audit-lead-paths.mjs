#!/usr/bin/env node
/* ============================================================================
 * audit-lead-paths.mjs — every marketing page must offer a way to become a lead.
 *
 *   node scripts/audit-lead-paths.mjs
 *
 * A page counts as having a lead path when it does any of these:
 *   · contains a form that posts to /api/forms (or sets form_type)
 *   · links to a lead destination (member signup, 100 Club, contact, Prep+,
 *     bootcamps, placement, login)
 *   · navigates to one of those routes from a button handler
 *   · loads the SPA bundle, whose top bar always renders "Become a member"
 *
 * Intentionally excluded, and reported separately:
 *   · redirect stubs (meta refresh to the real page)
 *   · /admin/ and /login/ (staff and auth screens)
 *   · /worksim/** (pilot, footer-linked only)
 *   · /spa.html (the SPA shell, never linked directly)
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const LEAD_ROUTE = /\/(become-a-member|100-club-apply|contact|prep\+|100-club|bootcamps|placement|login)([/?"'#]|$)/;
const LEAD_HREF = /\bhref="[^"]*?(become-a-member|100-club-apply|\/contact|\/prep\+|\/100-club|\/bootcamps|\/placement|\/login)/i;
const LEAD_ACTION = /(become-a-member|100-club-apply|\/contact|\/prep\+|\/100-club|\/bootcamps|\/placement)/;
const SPA_BUNDLE = /<script[^>]+src="\/assets\/index-[^"]+\.js"/;

const EXCLUDE = [
  { test: (p) => /^admin\//.test(p) || p === 'admin/index.html', why: 'staff' },
  { test: (p) => /^login\//.test(p), why: 'auth' },
  { test: (p) => /^worksim\//.test(p), why: 'worksim pilot' },
  { test: (p) => p === 'spa.html', why: 'SPA shell' },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const rows = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');

  if (/http-equiv=["']?refresh/i.test(html)) {
    rows.push({ rel, status: 'redirect' });
    continue;
  }
  const excluded = EXCLUDE.find((e) => e.test(rel));
  if (excluded) {
    rows.push({ rel, status: 'excluded', why: excluded.why });
    continue;
  }

  const hasForm = /<form[\s>]/i.test(html) && /(api\/forms|form_type|prep-plus-lead|exam-gate)/i.test(html);
  const hasHref = LEAD_HREF.test(html);
  const hasAction = LEAD_ACTION.test(html) && /(onClick|onclick|location\.(href|assign)|window\.location)/.test(html);
  const hasSpa = SPA_BUNDLE.test(html);

  if (hasForm || hasHref || hasAction || hasSpa) {
    rows.push({ rel, status: 'ok', via: hasForm ? 'form' : hasHref ? 'link' : hasAction ? 'action' : 'spa' });
  } else {
    rows.push({ rel, status: 'missing' });
  }
}

const missing = rows.filter((r) => r.status === 'missing');
const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

console.log(`pages: ${rows.length}`);
console.log(`  lead path : ${counts.ok || 0}`);
console.log(`  redirect  : ${counts.redirect || 0}`);
console.log(`  excluded  : ${counts.excluded || 0}`);
console.log(`  missing   : ${counts.missing || 0}`);

if (missing.length) {
  console.error('\nPages with no lead path:');
  for (const r of missing) console.error(`  ${r.rel}`);
  process.exit(1);
}

console.log('\n✓ Every marketing page offers a lead path.');
