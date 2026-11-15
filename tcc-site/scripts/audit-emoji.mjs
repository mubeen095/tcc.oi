#!/usr/bin/env node
/* Audit emoji on the TCC site.
 *
 * Typographic marks (arrows, checks, crosses) are allowed. Everything that
 * renders as a picture glyph — and its variation selectors / ZWJ glue — is
 * reported.
 *
 *   node scripts/audit-emoji.mjs            # summary + top offenders
 *   node scripts/audit-emoji.mjs --all      # every occurrence with context
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SITE = path.join(ROOT, 'public');
const ALL = process.argv.includes('--all');

// Allowed typography — not pictographs. © ® ™ are text symbols, not emoji.
const ALLOWED = new Set([
  '→', '←', '↑', '↓', '✓', '✗', '✕', '⇄', '↔', '↕', '⇒', '⇐', '↳', '↪', '⟶', '⟵',
  '©', '®', '™',
]);

// Extended_Pictographic plus the glue that only exists to style emoji.
const EMOJI_RE =
  /(\p{Extended_Pictographic}|\uFE0F|\uFE0E|\u200D|\u20E3|[\u{1F1E6}-\u{1F1FF}])/gu;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(SITE).filter((f) => /\.(html|css|js)$/.test(f));
const byChar = new Map();
const byFile = new Map();

function add(map, key, n = 1) {
  map.set(key, (map.get(key) || 0) + n);
}

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let found = 0;
  for (const m of text.matchAll(EMOJI_RE)) {
    const ch = m[0];
    if (ALLOWED.has(ch)) continue;
    found++;
    add(byChar, ch);
    if (ALL) {
      const start = Math.max(0, m.index - 60);
      const end = Math.min(text.length, m.index + 60);
      console.log(
        `${path.relative(ROOT, file)}:${text.slice(0, m.index).split('\n').length}`,
        JSON.stringify(text.slice(start, end)),
      );
    }
  }
  if (found) byFile.set(path.relative(ROOT, file), found);
}

console.log('\nEmoji by codepoint:');
for (const [ch, n] of [...byChar].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${JSON.stringify(ch)} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}  ${n}`);
}

console.log(`\nFiles with emoji: ${byFile.size}`);
console.log('Top files:');
for (const [f, n] of [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${n.toString().padStart(5)}  ${f}`);
}
console.log(`\nTotal pictographic glyphs: ${[...byChar.values()].reduce((a, b) => a + b, 0)}`);
