#!/usr/bin/env node
/**
 * build-theme-css.mjs
 *
 * Scans every page under public for inline <style> blocks and emits
 * assets/css/tcc-theme-pages.css: a light-theme override layer for the content
 * components of each page family.
 *
 * The hand-authored layer (tokens, shell chrome, Tailwind remaps, diagram
 * palettes, toggle) lives in assets/css/tcc-theme.css and is NOT generated.
 *
 * Rules are derived from the real page CSS so nothing is missed when a family
 * adds a new component. Diagrams (.rmg-* / .tpr-*), the ecosystem strip
 * (.tcc-eco) and cinematic panels (hero / media / code) are excluded here and
 * handled explicitly in the hand-authored layer.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public');
const OUT = path.join(ROOT, 'assets/css/tcc-theme-pages.css');

/* ------------------------------------------------------------------ */
/* Which selectors keep their dark styling                            */
/* ------------------------------------------------------------------ */

const KEEP_DARK = [
  // Cinematic hero / media panels
  /(^|[\s,>+~])\.hero(?!-after)(?:-[\w-]+)?\b/,
  /(^|[\s,>+~])\.prep-pill\b/,
  /(^|[\s,>+~])\.(c-hero|a-hero|apply-hero)\b/,
  /(^|[\s,>+~])\.(media|photo|video)-[\w-]+/,
  // Code surfaces stay dark in light mode (deliberate)
  /(^|[\s,>+~])\.(code-editor|code-out|code-bar|code-line|lang-select|terminal)\b/,
  // Diagram + ecosystem layers handled in tcc-theme.css
  /\.rmg-[\w-]+/,
  /\.tpr-[\w-]+/,
  /\.tcc-eco\b/,
];

const ACCENT_SELECTOR =
  /(btn-primary|mobile-cta|topbar-cta|top-cta|skip-link|hero-btn-primary|btn-white|hero-search-btn|is-done|data-status="done"|swatch-done|ladder-step|rmp-bar-fill|quiz-progress|a-body ul li::before)/;

const PAGE_SELECTOR =
  /(^|[\s,>+~])(html|body|\.app-shell|\.main-scroll|\.content-wrap|\.sec|\.hero-after|\.prep-cta-sec|\.rec-sec|\.credits-sec|\.pricing-sec|\.nfe-sec|\.rmp-sec|\.rm-catalog|\.rd-body|\.rd-footer-cta|\.rmg-band|\.eco-sec|\.loader|\.footer|\.bottom-nav|\.topbar|\.mobile-header|\.prep-topbar|\.prep-hero|\.rd-hero|\.rm-hero|\.a-hero|\.c-hero)\b/;

const FADE_SELECTOR = /(fade|scrim|overlay)/i;

const BARE_ELEMENT = /^(?:[a-z][a-z0-9]*|::?[a-z-]+)$/i;

/* ------------------------------------------------------------------ */
/* CSS parsing                                                        */
/* ------------------------------------------------------------------ */

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Parse a stylesheet into { context, selector, decls } entries. */
function parseRules(css) {
  const out = [];
  let i = 0;

  function readBlock(start) {
    let depth = 1;
    let j = start;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    return { body: css.slice(start, j - 1), end: j };
  }

  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    const { body, end } = readBlock(open + 1);
    i = end;

    if (!prelude) continue;
    if (/^@(?:-webkit-)?keyframes\b/i.test(prelude)) continue;

    if (/^@(media|supports|container|layer)\b/i.test(prelude)) {
      for (const inner of parseRules(body)) {
        out.push({ ...inner, context: [prelude, ...inner.context] });
      }
      continue;
    }
    if (prelude.startsWith('@')) continue;

    const decls = [];
    for (const chunk of splitDecls(body)) {
      const c = chunk.indexOf(':');
      if (c === -1) continue;
      const prop = chunk.slice(0, c).trim().toLowerCase();
      const value = chunk.slice(c + 1).trim();
      if (!prop || !value) continue;
      decls.push({ prop, value, important: /!important\s*$/i.test(value) });
    }
    if (decls.length) out.push({ context: [], selector: prelude, decls });
  }
  return out;
}

function splitDecls(body) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) {
      if (cur.trim()) parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/* ------------------------------------------------------------------ */
/* Colour transform                                                   */
/* ------------------------------------------------------------------ */

const COLOR_PROPS = new Set([
  'background',
  'background-color',
  'background-image',
  'color',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline',
  'outline-color',
  'box-shadow',
  'text-shadow',
  'fill',
  'stroke',
  'caret-color',
  'text-decoration-color',
  'column-rule-color',
  'scrollbar-color',
]);

const DARK_BG = new Set([
  '#000', '#000000', '#050505', '#060606', '#070707', '#070505', '#060707',
  '#0a0a0a', '#0b0b0b', '#0d0d0d', '#0e0e0e', '#101010', '#141414', '#171717',
  '#1a1a1a', '#0b0d12', '#05070c', '#0E0E0E', '#1A1A1C', '#1e1e1e',
]);

const SUBTLE_BG = new Set([
  '#101010', '#141414', '#171717', '#1a1a1a', '#0b0b0b', '#0d0d0d',
  '#0e0e0e', '#0E0E0E', '#1e1e1e',
]);

const FG_MAP = {
  '#7fb4ff': '#0057DE',
  '#4d8dff': '#0057DE',
  '#9cc4ff': '#0057DE',
  '#3096ff': '#0057DE',
  '#2f7bff': '#0057DE',
  '#9dc0ff': '#0057DE',
  '#8fc0ff': '#0a3f9e',
  '#dce9ff': '#0a2a5e',
  '#0f2f66': '#0a2a5e',
  '#6fe0a4': '#0b6b40',
  '#9ff0c4': '#0b6b40',
  '#8fe8b6': '#0b6b40',
  '#ff9a9a': '#b42318',
  '#f87171': '#b42318',
  '#fca5a5': '#b42318',
  '#ffd28a': '#8a5a00',
  '#f5c26b': '#8a5a00',
  '#a9a9a9': '#5f5f5f',
  '#999': '#5f5f5f',
  '#a4a9b3': '#5b6068',
  '#8f949d': '#5b6068',
  '#e6e6e6': '#3d3d3d',
  '#e8e8e8': '#3d3d3d',
};

const BG_MAP = {
  '#0f2f66': '#dbe8ff',
  '#8fc0ff': '#dbe8ff',
};

const round = (n) => Math.round(n * 1000) / 1000;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function parseRgba(token) {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(token);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

const isWhite = (t) =>
  t === '#fff' || t === '#ffffff' || t === 'white' || t === '#FFFFFF';

function kindOf(prop) {
  if (prop.startsWith('background')) return 'bg';
  if (prop === 'color' || prop === 'fill' || prop === 'caret-color' || prop === 'text-decoration-color') return 'fg';
  if (prop === 'stroke') return 'stroke';
  if (prop.startsWith('border') || prop === 'outline' || prop === 'outline-color' || prop === 'column-rule-color') return 'border';
  if (prop === 'box-shadow' || prop === 'text-shadow') return 'shadow';
  if (prop === 'scrollbar-color') return 'shadow';
  return 'other';
}

/** Transform a single colour token. Returns the replacement or null. */
function transformToken(token, kind, selector) {
  const lower = token.toLowerCase();

  if (isWhite(token)) {
    if (kind === 'bg') return null; // white surface is already correct
    if (kind === 'fg') return 'var(--tcc-ink)';
    if (kind === 'border' || kind === 'stroke') return 'rgba(0,0,0,.55)';
    if (kind === 'shadow') return 'rgba(0,0,0,.16)';
    return null;
  }

  const rgba = parseRgba(token);
  if (rgba) {
    // Black overlays were used to darken surfaces; on a light canvas they must
    // become a subtle grey wash instead of a 35%-black pill.
    if (rgba.r === 0 && rgba.g === 0 && rgba.b === 0) {
      if (kind === 'bg') return `rgba(0,0,0,${round(clamp(rgba.a * 0.3, 0.02, 0.12))})`;
      return null;
    }
    // Near-black (e.g. rgba(6,6,6,.86) sticky headers) becomes a light veil.
    if (rgba.r < 48 && rgba.g < 48 && rgba.b < 48) {
      if (kind === 'bg') return `rgba(247,247,245,${round(Math.max(rgba.a, 0.85))})`;
      if (kind === 'border' || kind === 'stroke') return `rgba(0,0,0,${round(clamp(rgba.a * 1.1 + 0.02, 0.06, 0.55))})`;
      return null;
    }
    if (rgba.r === 255 && rgba.g === 255 && rgba.b === 255) {
      if (kind === 'bg') return `rgba(0,0,0,${round(clamp(rgba.a * 0.9, 0.02, 0.22))})`;
      if (kind === 'fg') return `rgba(10,10,10,${round(clamp(rgba.a * 1.4, 0.6, 0.94))})`;
      if (kind === 'border' || kind === 'stroke') return `rgba(0,0,0,${round(clamp(rgba.a * 1.2 + 0.02, 0.06, 0.55))})`;
      if (kind === 'shadow') return `rgba(0,0,0,${round(clamp(rgba.a * 0.75, 0.04, 0.5))})`;
      return null;
    }
    // Blue-tinted text tokens
    if (rgba.b > 200 && rgba.r < 160 && rgba.g > 90) {
      if (kind === 'fg' || kind === 'stroke') return `rgba(0,87,222,${round(clamp(rgba.a * 1.15, 0.3, 1))})`;
      if (kind === 'bg') return `rgba(0,87,222,${round(clamp(rgba.a, 0.03, 0.2))})`;
      return null;
    }
    // Green / red / amber tints
    if (rgba.g > 180 && rgba.r < 140 && rgba.b < 190) {
      if (kind === 'bg') return `rgba(11,107,64,${round(clamp(rgba.a * 0.7, 0.03, 0.18))})`;
      if (kind === 'border') return `rgba(11,107,64,${round(clamp(rgba.a * 1.1, 0.2, 0.6))})`;
      return `rgba(11,107,64,${round(clamp(rgba.a * 1.1, 0.35, 1))})`;
    }
    if (rgba.r > 220 && rgba.g < 160 && rgba.b < 160) {
      if (kind === 'bg') return `rgba(180,35,24,${round(clamp(rgba.a * 0.7, 0.03, 0.16))})`;
      if (kind === 'border') return `rgba(180,35,24,${round(clamp(rgba.a * 1.1, 0.2, 0.6))})`;
      return `rgba(180,35,24,${round(clamp(rgba.a * 1.1, 0.35, 1))})`;
    }
    if (rgba.r > 220 && rgba.g > 160 && rgba.b < 160) {
      if (kind === 'fg' || kind === 'border') return `rgba(138,90,0,${round(clamp(rgba.a * 1.1, 0.35, 1))})`;
      return `rgba(138,90,0,${round(clamp(rgba.a * 0.7, 0.03, 0.16))})`;
    }
    return null;
  }

  if (!lower.startsWith('#')) return null;

  if (DARK_BG.has(lower)) {
    if (kind === 'bg') {
      if (PAGE_SELECTOR.test(selector)) return 'var(--tcc-canvas)';
      if (SUBTLE_BG.has(lower)) return 'var(--tcc-surface-2)';
      return 'var(--tcc-surface)';
    }
    if (kind === 'fg' || kind === 'stroke') return 'var(--tcc-ink)';
    if (kind === 'border') return 'rgba(0,0,0,.5)';
    if (kind === 'shadow') return 'rgba(0,0,0,.18)';
    return null;
  }

  if (BG_MAP[lower]) return kind === 'bg' ? BG_MAP[lower] : FG_MAP[lower] || null;

  // Gold used for price/cohort labels reads at ~1.6:1 on paper.
  if (kind === 'fg' || kind === 'stroke') {
    const h = lower.replace('#', '');
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (r > 200 && g > 150 && b < 150) return '#8a5a00';
    }
  }

  // Light neutral surfaces used as explicit backgrounds stay light.
  if (kind === 'bg' && ['#e6e6e6', '#e8e8e8', '#dde4ef', '#f0f0f0', '#e8edf7'].includes(lower)) return null;

  if (FG_MAP[lower]) return FG_MAP[lower];

  // Muted greys used for labels on dark: darken them enough to pass on paper.
  if (kind === 'fg' || kind === 'stroke') {
    const h = lower.replace('#', '');
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const L = luminance(lower);
      if (Math.max(r, g, b) - Math.min(r, g, b) <= 24 && L > 0.12 && L < 0.5) {
        return '#5f5f5f';
      }
    }
  }

  return null;
}

/** Relative luminance of a hex colour (0 = black, 1 = white). */
function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function transformValue(value, kind, selector) {
  if (!/#[0-9a-fA-F]{3,8}|rgba?\(/i.test(value)) return null;

  const isGradient = /gradient\(/i.test(value);
  const isFade = FADE_SELECTOR.test(selector);

  let changed = false;
  const out = value.replace(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g, (token) => {
    // Fade / scrim overlays must dissolve into the light canvas, not black.
    if (isGradient && isFade) {
      const rgba = parseRgba(token);
      if (rgba && rgba.r === 0 && rgba.g === 0 && rgba.b === 0) {
        changed = true;
        return `rgba(247,247,245,${round(rgba.a)})`;
      }
      if (/^#[0-9a-fA-F]{3,8}$/.test(token) && luminance(token) < 0.2) {
        changed = true;
        return 'var(--tcc-canvas)';
      }
    }

    // Any very dark neutral used as a background becomes a light surface.
    if (kind === 'bg' && /^#[0-9a-fA-F]{3,8}$/.test(token) && !DARK_BG.has(token.toLowerCase())) {
      const L = luminance(token);
      if (L < 0.14) {
        changed = true;
        return PAGE_SELECTOR.test(selector) ? 'var(--tcc-canvas)' : 'var(--tcc-surface)';
      }
      if (L < 0.24) {
        changed = true;
        return 'var(--tcc-surface-2)';
      }
    }

    const next = transformToken(token, kind, selector);
    if (next === null) return token;
    changed = true;
    return next;
  });

  return changed ? out : null;
}

/* ------------------------------------------------------------------ */
/* Collect rules                                                      */
/* ------------------------------------------------------------------ */

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
const rules = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  if (!blocks.length) continue;
  for (const rule of parseRules(stripComments(blocks.join('\n')))) {
    rule.file = path.relative(ROOT, file);
    rules.push(rule);
  }
}

/* Selectors that declare a saturated blue background anywhere. */
const accentSelectors = new Set();
for (const rule of rules) {
  const hasBlueBg = rule.decls.some(
    (d) =>
      d.prop.startsWith('background') &&
      /#(?:0057de|0064ff|0a63ea|3b82f6|3096ff|2563eb)\b/i.test(d.value),
  );
  if (!hasBlueBg) continue;
  for (const sel of rule.selector.split(',')) accentSelectors.add(sel.trim());
}

const isAccent = (selector) =>
  ACCENT_SELECTOR.test(selector) ||
  selector
    .split(',')
    .some((s) => accentSelectors.has(s.trim()));

const isKeptDark = (selector) => KEEP_DARK.some((re) => re.test(selector));

/* selector + context + prop -> { value: count } */
const tally = new Map();

for (const rule of rules) {
  const selector = rule.selector.trim();
  if (!selector || isKeptDark(selector) || isAccent(selector)) continue;

  // A bare element selector (a, button, input…) is too broad for structural
  // properties such as borders or shadows; only its colour is safe to remap.
  const bare = BARE_ELEMENT.test(selector);

  for (const decl of rule.decls) {
    if (!COLOR_PROPS.has(decl.prop)) continue;
    const kind = kindOf(decl.prop);
    if (bare && kind !== 'fg') continue;
    const next = transformValue(decl.value, kind, selector);
    if (next === null) continue;

    const ctx = rule.context.join(' && ');
    const key = `${ctx}\u0000${selector}\u0000${decl.prop}`;
    if (!tally.has(key)) tally.set(key, new Map());
    const bucket = tally.get(key);
    bucket.set(next, (bucket.get(next) || 0) + 1);
  }
}

/* Pick the most common value for each selector/prop/context. */
const chosen = new Map();
for (const [key, bucket] of tally) {
  let best = null;
  let bestN = -1;
  for (const [value, n] of bucket) {
    if (n > bestN) {
      best = value;
      bestN = n;
    }
  }
  chosen.set(key, best);
}

/* Group selectors that share an identical output. */
const groups = new Map();
for (const [key, value] of chosen) {
  const [ctx, selector, prop] = key.split('\u0000');
  const groupKey = `${ctx}\u0000${prop}\u0000${value}`;
  if (!groups.has(groupKey)) groups.set(groupKey, new Set());
  groups.get(groupKey).add(selector);
}

/* ------------------------------------------------------------------ */
/* Emit                                                               */
/* ------------------------------------------------------------------ */

const PREFIX = 'html[data-theme="light"]';

function prefixSelector(sel) {
  return sel
    .split(',')
    .map((s) => `${PREFIX} ${s.trim()}`)
    .join(',\n');
}

const byContext = new Map();
for (const [groupKey, selectors] of groups) {
  const [ctx, prop, value] = groupKey.split('\u0000');
  if (!byContext.has(ctx)) byContext.set(ctx, []);
  byContext.get(ctx).push({ prop, value, selectors: [...selectors].sort() });
}

const lines = [];
lines.push('/* ============================================================================');
lines.push(' * tcc-theme-pages.css  —  GENERATED, do not edit by hand.');
lines.push(' * Regenerate: node scripts/build-theme-css.mjs');
lines.push(' *');
lines.push(' * Light-mode overrides for the content components of every page family,');
lines.push(' * derived from the inline <style> blocks in the built HTML.');
lines.push(' * ==========================================================================*/');
lines.push('');

const sortedContexts = [...byContext.keys()].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)));

for (const ctx of sortedContexts) {
  const entries = byContext.get(ctx).sort((a, b) =>
    a.value === b.value ? 0 : a.value < b.value ? -1 : 1,
  );
  if (ctx) {
    lines.push(ctx.startsWith('@') ? `${ctx} {` : `${ctx} {`);
  }
  const pad = ctx ? '  ' : '';
  for (const entry of entries) {
    const selectors = entry.selectors.map((s) => prefixSelector(s)).join(',\n');
    lines.push(`${pad}${selectors} {`);
    lines.push(`${pad}  ${entry.prop}: ${entry.value};`);
    lines.push(`${pad}}`);
  }
  if (ctx) lines.push('}');
  lines.push('');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));

const bytes = fs.statSync(OUT).size;
const ruleCount = [...groups.values()].length;
console.log(`pages scanned: ${files.length}`);
console.log(`source rules:  ${rules.length}`);
console.log(`accent rules:  ${accentSelectors.size}`);
console.log(`output rules:  ${ruleCount}`);
console.log(`written:       ${path.relative(process.cwd(), OUT)} (${(bytes / 1024).toFixed(1)} KB)`);
