#!/usr/bin/env node
/* ============================================================================
 * Verify the word "free" is gone from the public site.
 * ---------------------------------------------------------------------------
 *   node scripts/verify-no-free.mjs
 *
 * Scans every .html page plus the AI artifacts (ai.txt, llms*.txt/json,
 * faq.jsonl) for the word "free". Exits non-zero and lists each hit.
 *
 * Allowed, because the word is a real term rather than a marketing claim:
 *   freelance / freelancer
 *   free memory / free RAM / free()   (memory management)
 *   error-free / bug-free / code-free
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const ALLOW = [
  /\bfreelance\w*\b/i,
  /\bfree\s*(memory|ram)\b/i,
  /\b(error|bug|code|collision|clash)-free\b/i,
  /\bfree-text\b/i,
  /\bmemory-free\b/i,
  /\bmalloc,\s*free\b/i,
  /\bfree\(\)/i,
  /data-title="free"/i,
  /free\.\s*Open topic details/i,
  />free<\/text>/i,
  />free<\/button>/i,
  /"label":"free"/i,
];

const EXTS = ['.html', '.js', '.txt', '.json', '.jsonl'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

const hits = [];
let scanned = 0;

for (const file of walk(ROOT)) {
  scanned += 1;
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/.{0,80}\bfree\b.{0,80}/gi)) {
    const context = match[0].replace(/\s+/g, ' ').trim();
    if (ALLOW.some((re) => re.test(context))) continue;
    hits.push({ file: path.relative(ROOT, file), context });
  }
}

if (hits.length) {
  console.error(`✗ "free" found in ${hits.length} place(s) across ${scanned} files:\n`);
  for (const { file, context } of hits.slice(0, 80)) console.error(`  ${file}\n    · ${context}`);
  if (hits.length > 80) console.error(`  … and ${hits.length - 80} more`);
  process.exit(1);
}

console.log(`✓ No disallowed "free" in ${scanned} files.`);
