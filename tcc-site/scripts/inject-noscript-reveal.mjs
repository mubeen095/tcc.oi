/* ─────────────────────────────────────────────────────────────────────────
   scripts/inject-noscript-reveal.mjs

   `.reveal` starts at opacity:0 and is switched on by IntersectionObserver.
   If JavaScript is disabled, blocked, or throws before the observer runs,
   every reveal block stays invisible. This adds a <noscript> override so the
   content is always readable, without touching the animation path.

   Idempotent — safe to run on every deploy.
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const MARKER = 'reveal-noscript';
const SNIPPET =
  `<noscript><style id="${MARKER}">.reveal{opacity:1!important;transform:none!important}</style></noscript>`;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let added = 0;
let skipped = 0;

for (const file of walk(PUBLIC)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('class="reveal') && !html.includes('reveal ')) {
    skipped++;
    continue;
  }
  if (html.includes(MARKER)) {
    skipped++;
    continue;
  }
  if (!html.includes('</head>')) {
    skipped++;
    continue;
  }
  const next = html.replace('</head>', `  ${SNIPPET}\n</head>`);
  fs.writeFileSync(file, next, 'utf8');
  added++;
}

console.log(`noscript reveal fallback — added: ${added} | skipped: ${skipped}`);
