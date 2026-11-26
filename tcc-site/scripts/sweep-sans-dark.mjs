#!/usr/bin/env node
/**
 * sweep-sans-dark.mjs
 *
 * One-off (but re-runnable) codemod that ships two brand decisions:
 *
 *   1. Dark only. Removes the light/dark boot resolver from every page and
 *      pins <html data-theme="dark">, color-scheme dark and theme-color
 *      #000000. The light-mode CSS stays in place but can never match.
 *   2. One typeface. Instrument Serif is retired; every declaration falls
 *      back to Inter (the site's sans) and the Google Fonts request no
 *      longer downloads the serif.
 *
 * Touches public HTML/CSS, the theme script and the generator sources so a
 * rebuild cannot reintroduce either.
 *
 * Usage:
 *   node scripts/sweep-sans-dark.mjs --dry-run
 *   node scripts/sweep-sans-dark.mjs --apply
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APPLY = process.argv.includes('--apply');
const DRY = !APPLY;

const BOOT_RE = /<!-- tcc-theme:boot: dark-only, applied before first paint -->
    <script>
      (function () {
        var root = document.documentElement;
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', '#000000');
      })();
    </script>`;

const COLOR_SCHEME_RE =
  /<meta\s+name=["']color-scheme["']\s+content=["'][^"']*["']\s*\/?>/gi;
const COLOR_SCHEME_NEW = '<meta name="color-scheme" content="dark" />';

const FAMILY_RE =
  /font-family:\s*(["'])Inter\1\s*,\s*(?:Georgia\s*,\s*)?serif(\s*!\s*important)?/gi;

const FONT_URL_RE = /family=Instrument\+Serif(?::[^&"']*)?&?/g;

function walk(dir, exts, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '_archive'].includes(entry.name)) continue;
      walk(full, exts, acc);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      acc.push(full);
    }
  }
  return acc;
}

const targets = [
  ...walk(path.join(ROOT, 'public'), ['.html', '.css']),
  ...walk(path.join(ROOT, 'scripts'), ['.js', '.mjs', '.cjs']),
  ...walk(path.join(ROOT, 'api'), ['.js']),
];

const stats = {
  files: 0,
  boot: 0,
  scheme: 0,
  family: 0,
  fontUrl: 0,
  leftovers: [],
};

for (const file of targets) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  if (BOOT_RE.test(src)) {
    src = src.replace(BOOT_RE, BOOT_NEW);
    stats.boot += 1;
  }

  src = src.replace(COLOR_SCHEME_RE, (m) => {
    if (m.includes('content="dark"')) return m;
    stats.scheme += 1;
    return COLOR_SCHEME_NEW;
  });

  src = src.replace(FAMILY_RE, (_m, _q, bang) => `font-family: 'Gilroy', 'Inter', system-ui, sans-serif${bang ? ' !important' : ''}`);

  // Escaped-quote variants inside JS string literals (e.g. "font-family: \'Inter\', sans-serif")
  // and any other font-family line the strict pattern missed.
  src = src
    .split('\n')
    .map((line) => {
      if (!/font-family/i.test(line) || !line.includes('Inter')) return line;
      return line
        .replace(/Instrument Serif/g, 'Inter')
        .replace(/,\s*(?:Georgia\s*,\s*)?serif/gi, ', sans-serif');
    })
    .join('\n');

  if (src.includes('')) {
    src = src.replace(FONT_URL_RE, () => {
      stats.fontUrl += 1;
      return '';
    });
  }

  if (src !== before) {
    stats.files += 1;
    if (!DRY) fs.writeFileSync(file, src);
  }

  if (src.includes('Instrument Serif')) {
    stats.leftovers.push(path.relative(ROOT, file));
  }
}

console.log(`sweep-sans-dark — ${DRY ? 'DRY RUN' : 'applied'}`);
console.log(`  files rewritten      : ${stats.files}`);
console.log(`  theme boot replaced  : ${stats.boot}`);
console.log(`  color-scheme set dark: ${stats.scheme}`);
console.log(`  font urls cleaned    : ${stats.fontUrl}`);
if (stats.leftovers.length) {
  console.log(`  remaining mentions   : ${stats.leftovers.length}`);
  for (const f of stats.leftovers.slice(0, 12)) console.log(`    · ${f}`);
}
if (DRY) console.log('  (rerun with --apply to write)');
