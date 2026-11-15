#!/usr/bin/env node
/**
 * Inject the TCC program/course roadmap renderer into every /domains page.
 *
 * Idempotent: running it twice changes nothing. Adds a single deferred script
 * tag right after domain-ecosystem.js (or before </body> when that script is
 * absent). The renderer reads each page's own #domains-data JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, '..', 'public');
const DOMAINS = path.join(SITE, 'domains');
const TAG = '<script defer src="/assets/js/tcc-program-roadmap.js"></script>';
const ANCHOR = '<script defer src="/assets/js/domain-ecosystem.js"></script>';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

const files = walk(DOMAINS).sort();
let changed = 0;
let skipped = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('tcc-program-roadmap.js')) {
    skipped++;
    continue;
  }
  if (!html.includes('id="domains-data"')) {
    skipped++;
    continue;
  }
  if (html.includes(ANCHOR)) {
    html = html.replace(ANCHOR, ANCHOR + '\n      ' + TAG);
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', '    ' + TAG + '\n  </body>');
  } else {
    skipped++;
    continue;
  }
  fs.writeFileSync(file, html);
  changed++;
}

console.log(`program-roadmap injection: ${changed} updated, ${skipped} skipped, ${files.length} pages scanned`);
