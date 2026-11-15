#!/usr/bin/env node
/* Remove pictographic emoji from the TCC site.
 *
 *   node scripts/remove-emoji.mjs           # dry run
 *   node scripts/remove-emoji.mjs --apply   # write
 *
 * Typography (→ ← ↑ ↓ ✓ ✗ ✕ ⇄) is left alone.
 *
 * What is removed:
 *   1. the unused `emoji` key in every <script id="domains-data"> JSON block
 *   2. dead `icon:"🛠️"`-style fields in the React bundle
 *   3. the ⚠️ prefix on the "BRUTALLY HONEST" badge
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SITE = path.join(ROOT, 'public');
const APPLY = process.argv.includes('--apply');

let changedFiles = 0;
let removed = 0;

function write(file, before, after) {
  if (before === after) return;
  changedFiles++;
  if (APPLY) fs.writeFileSync(file, after);
  else console.log('would change', path.relative(ROOT, file));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function stripEmojiKeys(value) {
  if (Array.isArray(value)) {
    for (const item of value) stripEmojiKeys(item);
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key === 'emoji') {
        delete value[key];
        removed++;
      } else {
        stripEmojiKeys(value[key]);
      }
    }
  }
}

/* 1. domains-data JSON blocks -------------------------------------------- */

const DATA_RE =
  /(<script id="domains-data" type="application\/json">)([\s\S]*?)(<\/script>)/g;

for (const file of walk(SITE).filter((f) => f.endsWith('.html'))) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(DATA_RE, (match, open, json, close) => {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      console.warn('could not parse domains-data in', path.relative(ROOT, file));
      return match;
    }
    stripEmojiKeys(data);
    return open + JSON.stringify(data) + close;
  });
  write(file, before, after);
}

/* 2 + 3. React bundle ----------------------------------------------------- */

const bundle = path.join(SITE, 'assets', 'index-9c8563fc.js');
{
  const before = fs.readFileSync(bundle, 'utf8');
  let after = before;

  // Dead emoji `icon` fields on the home feature cards.
  after = after.replace(
    /,icon:"(?:\p{Extended_Pictographic}|\uFE0F|\u200D)+"/gu,
    () => {
      removed++;
      return '';
    },
  );

  // Warning glyph on the "BRUTALLY HONEST" badge.
  after = after.replace(
    /(?:\p{Extended_Pictographic}|\uFE0F)+\s+(BRUTALLY HONEST\. NOT FOR NPCS\.)/u,
    (m, label) => {
      removed++;
      return label;
    },
  );

  write(bundle, before, after);
}

console.log(
  `\n${APPLY ? 'applied' : 'dry run'}: ${changedFiles} file(s), ${removed} emoji removed`,
);
