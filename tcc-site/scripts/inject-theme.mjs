#!/usr/bin/env node
/**
 * inject-theme.mjs
 *
 * Idempotently wires the TCC light/dark theme into every built page:
 *
 *   1. a no-FOUC boot snippet right after the viewport meta, which sets
 *      <html data-theme>, color-scheme and <meta name="theme-color"> before
 *      the first paint;
 *   2. <meta name="color-scheme" content="dark" />;
 *   3. the two theme stylesheets at the end of <head>;
 *   4. the deferred theme script before </body>.
 *
 * The tag markup lives in scripts/theme-tags.cjs so the page generators emit
 * exactly the same thing. Safe to re-run.
 *
 * Usage: node scripts/inject-theme.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import theme from './theme-tags.cjs';

const ROOT = path.resolve('public');
const DRY = process.argv.includes('--dry-run');

function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
      walkHtml(full, acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

const files = walkHtml(ROOT).sort();
const report = { total: files.length, changed: 0, skipped: 0, missing: [] };

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  if (html.toLowerCase().indexOf('</head>') === -1 || html.toLowerCase().indexOf('</body>') === -1) {
    report.missing.push(rel);
    continue;
  }
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) {
    report.missing.push(`${rel} (no viewport)`);
    continue;
  }

  const next = theme.withTheme(html);
  if (next === html) {
    report.skipped += 1;
    continue;
  }

  report.changed += 1;
  if (!DRY) fs.writeFileSync(file, next);
}

console.log(`${DRY ? '[dry run] ' : ''}pages: ${report.total}`);
console.log(`changed: ${report.changed}`);
console.log(`already wired: ${report.skipped}`);
if (report.missing.length) {
  console.log(`missing anchors: ${report.missing.length}`);
  for (const entry of report.missing.slice(0, 20)) console.log(`  ${entry}`);
}
