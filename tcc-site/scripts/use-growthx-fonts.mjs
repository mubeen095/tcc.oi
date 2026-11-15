#!/usr/bin/env node
/**
 * use-growthx-fonts.mjs
 *
 * Adopts the exact type stack growthx.club renders with:
 *
 *   body / UI   Gilroy   (400 → Medium, 500 → Medium, 600 → SemiBold,
 *                        700 → Bold, 800 → ExtraBold, 900 → Black)
 *   headings    Newsreader (serif, weight 400)
 *   mono        DM Mono
 *
 * The display serif rules are the ones the site already used a serif for, so
 * they are detected the same way the old sweep detected them: an Inter family
 * at weight 400 with either italics, a clamp() display size, or a known
 * display selector. Everything else becomes Gilroy.
 *
 * Usage: node scripts/use-growthx-fonts.mjs [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APPLY = process.argv.includes('--apply');
const THEME_CSS = path.join(ROOT, 'public/assets/css/tcc-theme.css?v=20261114a');

const MARKER = '/* tcc-fonts: Gilroy + Newsreader + DM Mono (growthx.club stack) */';

const FONT_FACE = `${MARKER}
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 300; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-Light.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 400; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-Medium.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 500; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-Medium.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 600; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-SemiBold.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 700; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-Bold.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 800; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-ExtraBold.ttf') format('truetype'); }
@font-face { font-family: 'Gilroy'; font-style: normal; font-weight: 900; font-display: swap; src: url('/assets/fonts/gilroy/Gilroy-Black.ttf') format('truetype'); }
`;

const GILROY = "font-family: 'Gilroy', 'Inter', system-ui, sans-serif";
const SERIF = "font-family: 'Newsreader', Georgia, serif";

const WHITELIST = [
  '.eco-name', '.eco-title', '.rmg-title-text', '.rmg-section-label',
  '.rmg-list-phase-head h3', '.a-stat .num', '.a-cta .ct-t', '.a-quote p',
  '.fn-title', '.serif-i', '.hero-h1', '.hero-h1 .accent', '.a-title .accent',
];

function walk(dir, exts, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '_archive'].includes(e.name)) continue;
      walk(full, exts, acc);
    } else if (exts.some((x) => e.name.endsWith(x))) acc.push(full);
  }
  return acc;
}

const INTER = /font-family:\s*'Inter'\s*,\s*(?:system-ui\s*,\s*)?sans-serif/gi;

function convertDisplayRules(css, stats) {
  return css.replace(/([^{}@]+)\{([^{}]*)\}/g, (whole, selRaw, body) => {
    const sel = selRaw.trim().replace(/\s+/g, ' ');
    if (!sel) return whole;
    if (!/font-family:\s*'Inter'\s*,\s*(?:system-ui\s*,\s*)?sans-serif/i.test(body)) return whole;
    if (!/font-weight:\s*400/.test(body)) return whole;

    const sizeMatch = /font-size:\s*clamp\((\d+(?:\.\d+)?)px/.exec(body);
    const minPx = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
    const italic = /font-style:\s*italic/.test(body);
    const whitelisted = WHITELIST.some((w) => sel === w || sel.endsWith(' ' + w) || sel.includes(w));

    if (!italic && minPx < 22 && !whitelisted) return whole;

    stats.serif += 1;
    stats.selectors.add(sel);
    const nextBody = body.replace(
      /font-family:\s*'Inter'\s*,\s*(?:system-ui\s*,\s*)?sans-serif/i,
      SERIF,
    );
    return `${selRaw}{${nextBody}}`;
  });
}

/* 1. @font-face */

let theme = fs.readFileSync(THEME_CSS, 'utf8');
if (!theme.includes(MARKER)) {
  theme = FONT_FACE + '\n' + theme;
  if (APPLY) fs.writeFileSync(THEME_CSS, theme);
  console.log('@font-face block added to tcc-theme.css');
}

/* 2. rules */

const files = [
  ...walk(path.join(ROOT, 'public'), ['.html', '.css']),
  ...walk(path.join(ROOT, 'scripts'), ['.js', '.mjs', '.cjs']),
  ...walk(path.join(ROOT, 'api'), ['.js']),
];

const stats = { serif: 0, gilroy: 0, files: 0, selectors: new Set() };

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  src = convertDisplayRules(src, stats);

  src = src.replace(INTER, () => {
    stats.gilroy += 1;
    return GILROY;
  });

  if (src !== before) {
    stats.files += 1;
    if (APPLY) fs.writeFileSync(file, src);
  }
}

console.log(`use-growthx-fonts — ${APPLY ? 'applied' : 'dry run'}`);
console.log(`  files rewritten : ${stats.files}`);
console.log(`  Newsreader rules: ${stats.serif} (${stats.selectors.size} selectors)`);
console.log(`  Gilroy rules    : ${stats.gilroy}`);
