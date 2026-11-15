/* Brand guard: the retired brand spelling must not appear anywhere in the project.
   The needle is assembled at runtime so this file does not contain it literally. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEEDLE = 'vy' + 'beschool';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const hits = [];
for (const file of walk(ROOT)) {
  let buf;
  try { buf = fs.readFileSync(file); } catch { continue; }
  if (buf.includes(Buffer.from(NEEDLE, 'utf8'))) hits.push(path.relative(ROOT, file));
}

if (hits.length) {
  console.error('FAIL: retired brand spelling still present in:');
  hits.forEach((h) => console.error('  ' + h));
  process.exit(1);
}
console.log('OK: no retired brand spelling references remain.');
