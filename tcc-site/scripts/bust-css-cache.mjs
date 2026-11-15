#!/usr/bin/env node
/**
 * bust-css-cache.mjs
 *
 * tcc-theme.css is served from a fixed URL, so a browser that already cached
 * it keeps the old copy. Appending a version query forces a fresh fetch on the
 * next load without renaming the file.
 *
 * Bump VERSION whenever tcc-theme.css changes.
 *
 * Usage: node scripts/bust-css-cache.mjs [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APPLY = process.argv.includes('--apply');
const VERSION = '20261114a';

const TARGET = '/assets/css/tcc-theme.css?v=20261114a';
const REPLACEMENT = `${TARGET}?v=${VERSION}`;

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
  ...walk(path.join(ROOT, 'public'), ['.html']),
  ...walk(path.join(ROOT, 'scripts'), ['.js', '.mjs', '.cjs']),
];

let changed = 0;
let refs = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(TARGET)) continue;

  const next = src.replace(
    new RegExp(`${TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\?v=)`, 'g'),
    () => {
      refs += 1;
      return REPLACEMENT;
    },
  );

  if (next !== src) {
    changed += 1;
    if (APPLY) fs.writeFileSync(file, next);
  }
}

console.log(`bust-css-cache — ${APPLY ? 'applied' : 'dry run'}: ${changed} file(s), ${refs} reference(s) → ?v=${VERSION}`);
