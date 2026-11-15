/* ─────────────────────────────────────────────────────────────────────────
   scripts/fix-viewport.mjs

   Two mobile-safari fixes that every page needs and no page should have to
   remember:

   1. viewport-fit=cover — so iOS paints full-bleed and exposes the safe-area
      insets. Without it env(safe-area-inset-*) is always 0 and a notched
      iPhone in landscape puts the fixed header under the notch.

   2. A vh fallback immediately before every dvh declaration — so iPhones on
      iOS 15.3 and older (and old Android WebViews) still get a full-height
      shell instead of `height: auto`.

   Idempotent: both steps detect their own output and do nothing on a rerun.

     node scripts/fix-viewport.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/* `height: 100dvh` → `height: 100vh; height: 100dvh`. Applies to min-/max-
   height too. Only 100dvh is used on this site. */
function addVhFallbacks(css) {
  return css.replace(
    /(^|[;{])(\s*)((?:min-|max-)?height)\s*:\s*([^;{}]*100dvh[^;{}]*);/g,
    (match, delim, space, prop, value) => {
      const fallback = value.replace(/dvh/g, 'vh');
      const fallbackDecl = `${prop}: ${fallback};`;
      if (css.includes(fallbackDecl) || css.includes(`${prop}:${fallback};`)) {
        return match;
      }
      return `${delim}${space}${fallbackDecl}${space}${prop}: ${value};`;
    }
  );
}

let cover = 0;
let fallbackPages = 0;
let missing = 0;

for (const file of walk(PUBLIC)) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  const tag = html.match(/<meta\s+name=["']viewport["'][^>]*>/i);
  if (!tag) {
    missing++;
  } else if (!/viewport-fit\s*=\s*cover/i.test(tag[0])) {
    html = html.replace(
      tag[0],
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />'
    );
    cover++;
  }

  let touched = false;
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (block) => {
    if (!block.includes('dvh')) return block;
    const next = addVhFallbacks(block);
    if (next !== block) touched = true;
    return next;
  });
  if (touched) fallbackPages++;

  if (html !== original) fs.writeFileSync(file, html, 'utf8');
}

console.log(
  `viewport — cover added: ${cover} | vh fallbacks: ${fallbackPages} page(s) | missing tag: ${missing}`
);