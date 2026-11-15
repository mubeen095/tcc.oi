#!/usr/bin/env node
/**
 * add-newsreader.mjs
 *
 * Adds the Newsreader variable font (the display serif growthx.club uses) to
 * every Google Fonts request in the built site and the page generators.
 *
 * Usage: node scripts/add-newsreader.mjs [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APPLY = process.argv.includes('--apply');

const FAMILY = 'family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&';

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
  ...walk(path.join(ROOT, 'scripts'), ['.js', '.mjs', '.cjs']),
];

let changed = 0;
let links = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('family=Newsreader')) continue;
  if (!src.includes('family=Inter')) continue;
  const before = src;
  src = src.replace(/family=Instrument+Serif:ital@0;1&family=Inter:/g, () => {
    links += 1;
    return `${FAMILY}family=Instrument+Serif:ital@0;1&family=Inter:`;
  });
  if (src !== before) {
    changed += 1;
    if (APPLY) fs.writeFileSync(file, src);
  }
}

console.log(`add-newsreader — ${APPLY ? 'applied' : 'dry run'}: ${changed} file(s), ${links} font request(s)`);
