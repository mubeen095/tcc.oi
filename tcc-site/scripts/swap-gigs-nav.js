/* ─────────────────────────────────────────────────────────────────────────
   scripts/swap-gigs-nav.js

   Retires "Gigs" from the primary navigation and puts "Prep+" in that slot.

   Gigs is not gone — it now lives as a section on /placement (#gigs), and the
   standalone /gigs/ pages stay reachable from there. This script only rewrites
   navigation chrome; it never touches page content.

     node scripts/swap-gigs-nav.js            (apply)
     node scripts/swap-gigs-nav.js --dry-run  (report only)
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const DRY = process.argv.includes('--dry-run');

const PREP_ICON =
  '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 8h8M8 12h5" stroke-linecap="round"/>';

/* 1. Desktop sidebar item */
const SIDEBAR_RE =
  /<a href="\/gigs" class="sidebar-link( active)?"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"(?: aria-hidden="true")?><rect x="3" y="7" width="18" height="13" rx="2"\/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" stroke-linecap="round"\/><\/svg><span class="label">Gigs<\/span><\/a>/g;

/* 2. Mobile bottom-nav item */
const BOTTOM_RE =
  /<a href="\/gigs" class="bottom-link( active)?"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="7" width="18" height="13" rx="2"\/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" stroke-linecap="round"\/><\/svg><span>Gigs<\/span><\/a>/g;

/* 3. Footer link — keep the label, point it at the new home */
const FOOTER_RE = /<a href="\/gigs">Gigs<\/a>/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
let changedFiles = 0;
const totals = { sidebar: 0, bottom: 0, footer: 0 };

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  src = src.replace(SIDEBAR_RE, (_m, active) => {
    totals.sidebar++;
    return `<a href="/prep+/" class="sidebar-link${active || ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">${PREP_ICON}</svg><span class="label">Prep+</span></a>`;
  });

  src = src.replace(BOTTOM_RE, (_m, active) => {
    totals.bottom++;
    return `<a href="/prep+/" class="bottom-link${active || ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${PREP_ICON}</svg><span>Prep+</span></a>`;
  });

  src = src.replace(FOOTER_RE, () => {
    totals.footer++;
    return '<a href="/placement/#gigs">Gigs</a>';
  });

  if (src !== before) {
    changedFiles++;
    if (!DRY) fs.writeFileSync(file, src);
  }
}

console.log(`${DRY ? '[dry run] ' : ''}Files changed: ${changedFiles}`);
console.log(`  sidebar items swapped : ${totals.sidebar}`);
console.log(`  bottom-nav items swapped: ${totals.bottom}`);
console.log(`  footer links retargeted : ${totals.footer}`);
