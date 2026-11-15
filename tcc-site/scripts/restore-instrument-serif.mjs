#!/usr/bin/env node
/**
 * restore-instrument-serif.mjs
 *
 * Puts Instrument Serif back into every Google Fonts request so the heading
 * and wordmark overrides in tcc-theme.css have a face to render with.
 *
 * The GrowthX sweep removed `family=Instrument+Serif:ital@0;1` from 728
 * requests. This adds it back idempotently, in the built pages and in the
 * generators (so a rebuild cannot drop it).
 *
 * Usage: node scripts/restore-instrument-serif.mjs [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APPLY = process.argv.includes('--apply');

const FAMILY = 'family=Instrument+Serif:ital@0;1&';

function walk(dir, exts, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '_archive'].includes(entry.name)) continue;
      walk(full, exts, acc);
    } else if (exts.some((e) => entry.name.endsWith(e))) acc.push(full);
  }
  return acc;
}

const files = [
  ...walk(path.join(ROOT, 'public'), ['.html', '.css']),
  ...walk(path.join(ROOT, 'scripts'), ['.html', '.js', '.mjs', '.cjs']),
];

let changed = 0;
let requests = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('family=Instrument+Serif')) continue;
  if (!src.includes('family=Inter:')) continue;

  const before = src;
  src = src.replace(/family=Inter:/g, () => {
    requests += 1;
    return `${FAMILY}family=Inter:`;
  });

  if (src !== before) {
    changed += 1;
    if (APPLY) fs.writeFileSync(file, src);
  }
}

console.log(
  `restore-instrument-serif — ${APPLY ? 'applied' : 'dry run'}: ${changed} file(s), ${requests} font request(s)`,
);
