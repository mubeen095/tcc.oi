/* ─────────────────────────────────────────────────────────────────────────
   scripts/fix-meta.mjs

   Keeps titles and meta descriptions inside the range Google actually shows:
   ≤60 characters for titles, ≤158 for descriptions. Generated pages are
   rebuilt from templates, so this runs last in `npm run build:seo` and is
   idempotent.

   Titles: drop trailing brand segments (" | TCC Prep+") first, then clamp the
   remaining segment at a word boundary. No ellipsis — titles read as complete
   phrases.
   Descriptions: cut at the last sentence, then clause, then word boundary and
   mark the cut with an ellipsis.

     node scripts/fix-meta.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const TITLE_MAX = 60;
const DESC_MAX = 158;
const TITLE_MIN = 25;

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&nbsp;': ' ',
};

const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (m) => ENTITIES[m] ?? m);
const encode = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND_SEGMENT = /^(the coding company|tcc|tcc prep\+|tcc cert\+|tcc prep|tcc cert)$/i;
const STOP_TAIL = /\s(and|or|for|with|of|the|a|an|in|on|at|to|by|from|that|your)$/i;

function trimTail(s) {
  let out = s.replace(/[\s,;:—–\-&]+$/, '');
  while (STOP_TAIL.test(out)) {
    out = out.replace(STOP_TAIL, '').replace(/[\s,;:—–\-&]+$/, '');
  }
  return out;
}

function clampTitle(raw) {
  const title = raw.trim();
  if (title.length <= TITLE_MAX) return title;

  const segments = title.split(/\s+[|—–]\s+/).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return title;

  // Brand-only segments ("TCC Prep+", "The Coding Company") are the first to go.
  const informative = segments.filter((s) => !BRAND_SEGMENT.test(s));
  const pool = informative.length ? informative : segments;

  // Prefer the longest combination that still fits.
  for (let take = pool.length; take >= 1; take--) {
    const candidate = pool.slice(0, take).join(' | ');
    if (candidate.length <= TITLE_MAX && candidate.length >= TITLE_MIN) return candidate;
  }

  // Nothing fits cleanly: keep the most descriptive single segment.
  const longest = [...pool].sort((a, b) => b.length - a.length)[0];
  return trimTail(cutWords(longest, TITLE_MAX));
}

function clampDesc(raw) {
  const desc = raw.trim();
  if (desc.length <= DESC_MAX) return desc;

  const window = desc.slice(0, DESC_MAX + 1);

  // 1. last complete sentence
  const sentence = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (sentence > 80) return window.slice(0, sentence + 1).trim();

  // 2. last clause boundary
  for (const sep of ['; ', ', ', ' — ', ' – ']) {
    const at = window.lastIndexOf(sep);
    if (at > 90) {
      return cutWords(window.slice(0, at), DESC_MAX - 1) + '.';
    }
  }

  // 3. last word boundary
  return cutWords(desc, DESC_MAX - 1) + '…';
}

function cutWords(s, max) {
  const t = s.trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const space = slice.lastIndexOf(' ');
  return (space > max * 0.6 ? slice.slice(0, space) : slice).replace(/[\s,;:—–-]+$/, '');
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let titlesFixed = 0;
let descsFixed = 0;

for (const file of walk(PUBLIC)) {
  const html = fs.readFileSync(file, 'utf8');
  let next = html;

  const tm = next.match(/<title>([\s\S]*?)<\/title>/);
  if (tm) {
    const current = decode(tm[1]);
    const fixed = clampTitle(current);
    if (fixed !== current.trim()) {
      next = next.replace(tm[0], `<title>${encode(fixed)}</title>`);
      titlesFixed++;
    }
  }

  const dm = next.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/);
  if (dm) {
    const current = decode(dm[1]);
    const fixed = clampDesc(current);
    if (fixed !== current.trim()) {
      next = next.replace(dm[0], `<meta name="description" content="${encode(fixed)}" />`);
      descsFixed++;
    }
  }

  if (next !== html) fs.writeFileSync(file, next, 'utf8');
}

console.log(`meta — titles fixed: ${titlesFixed} | descriptions fixed: ${descsFixed}`);
