/* ─────────────────────────────────────────────────────────────────────────
   scripts/fix-company-logo-css.js

   One-off (idempotent) codemod for the duplicated roster CSS that lives inline
   on every /prep+/companies/ page. The generator now emits the fixed rules;
   this patches pages that were built before the fix.

   What it changes:
     - object-fit: cover + brightness(0) invert(1)  ->  contain, no filter
     - the 1.07 hover zoom                          ->  1.04
     - the old "white silhouette" comment            ->  the white-tile comment

     node scripts/fix-company-logo-css.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'prep+', 'companies');

const OLD_COMMENT = `      /* ── company roster: frosted-glass logo tiles ──
         The logo artwork fills the whole tile (the PNGs are pre-normalised to a
         square canvas, so object-fit:cover never crops anything). They are
         rendered as a single clean white silhouette so every one of the 71
         marks reads at the same weight on the dark glass, whatever its
         original ink colour is. */`;

const NEW_COMMENT = `      /* ── company roster: white logo tiles ──
         The PNGs are pre-normalised to an opaque white square canvas by
         scripts/build-company-logo-tiles.js, so object-fit:contain never crops
         and every mark has the same optical size. The white artwork fills the
         tile, which keeps brand colours exact in both themes. Never invert or
         cover these files. */`;

const OLD_IMG = `      .rc-mark--logo img { position: relative; z-index: 1; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0) invert(1); -webkit-filter: brightness(0) invert(1); opacity: 0.94; transition: transform 0.3s cubic-bezier(0.2,0.9,0.3,1), opacity 0.3s ease; }`;

const NEW_IMG = `      .rc-mark--logo img { position: relative; z-index: 1; display: block; width: 100%; height: 100%; object-fit: contain; object-position: center; background: #fff; transition: transform 0.3s cubic-bezier(0.2,0.9,0.3,1); }`;

const OLD_HOVER = `      .roster-card:hover .rc-mark--logo img { transform: scale(1.07); opacity: 1; }`;
const NEW_HOVER = `      .roster-card:hover .rc-mark--logo img { transform: scale(1.04); }`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

let changed = 0;
let already = 0;
let unexpected = 0;

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes('object-fit: contain; object-position: center; background: #fff;')) {
    already++;
    continue;
  }
  if (!src.includes(OLD_IMG)) {
    unexpected++;
    console.warn('  ! no old logo rule:', path.relative(ROOT, file));
    continue;
  }

  let out = src
    .replace(OLD_COMMENT, NEW_COMMENT)
    .replace(OLD_IMG, NEW_IMG)
    .replace(OLD_HOVER, NEW_HOVER);

  fs.writeFileSync(file, out);
  changed++;
}

console.log(`Updated ${changed} company page(s).`);
console.log(`Already fixed: ${already}`);
if (unexpected) console.log(`Unrecognised: ${unexpected}`);
