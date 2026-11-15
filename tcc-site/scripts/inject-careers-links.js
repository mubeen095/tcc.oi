#!/usr/bin/env node
/**
 * inject-careers-links.mjs
 * ---------------------------------------------------------------------------
 * Adds a Careers link to the Company column of every page footer that has
 * one, so /careers/ is discoverable from the whole site — including the
 * hundreds of generated pages whose footers come from several templates.
 *
 * Idempotent: pages that already link to /careers/ are left untouched.
 *
 * Run: node scripts/inject-careers-links.mjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const LINK = '<a href="/careers/">Careers</a>';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let changed = 0;
let skipped = 0;

for (const file of walk(PUBLIC)) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('href="/careers/"')) {
    skipped++;
    continue;
  }
  const at = html.indexOf('<h3>Company</h3>');
  if (at === -1) continue;

  const afterHeading = at + '<h3>Company</h3>'.length;
  /* Match the indentation of the next anchor, falling back to four spaces. */
  const nextLine = /^\s*\n([ \t]*)<a\b/.exec(html.slice(afterHeading));
  const indent = nextLine ? nextLine[1] : '    ';
  html = html.slice(0, afterHeading) + '\n' + indent + LINK + html.slice(afterHeading);

  fs.writeFileSync(file, html, 'utf8');
  changed++;
}

console.log(`  ✓ careers links: ${changed} pages updated, ${skipped} already linked`);
