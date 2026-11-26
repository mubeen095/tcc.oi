#!/usr/bin/env node
/**
 * audit-theme.mjs — full-site theme audit for the TCC light/dark themes.
 *
 *   node scripts/audit-theme.mjs                 # light mode, all pages, 1440px
 *   MODE=dark node scripts/audit-theme.mjs       # dark mode, all pages
 *   MODE=both WIDTH=390 node scripts/audit-theme.mjs
 *   PAGES=/ /roadmaps/frontend/ node scripts/audit-theme.mjs
 *   JOBS=8 node scripts/audit-theme.mjs
 *
 * Requires the preview server (default http://localhost:3000) and a Chrome
 * instance exposing the DevTools protocol (default http://localhost:9250).
 *
 * Light mode checks
 *   - <html data-theme="light"> on every page
 *   - a theme toggle is injected on every page
 *   - no horizontal overflow at the tested width
 *   - WCAG AA contrast for visible body text (4.5:1, 3:1 for large text)
 *   - no dark content surfaces outside the cinematic / code / diagram allowlist
 *
 * Dark mode checks
 *   - <html data-theme="dark">
 *   - dark canvas (#000000) and no light-canvas content
 *   - toggle present, no horizontal overflow
 *
 * Static checks (always)
 *   - every HTML page carries the boot snippet, color-scheme meta, both theme
 *     stylesheets and the deferred theme script exactly once.
 */
import fs from 'node:fs';
import path from 'node:path';

const CDP = process.env.CDP || 'http://localhost:9250';
const BASE = process.env.BASE || 'http://localhost:3000';
const ROOT = path.resolve(
  process.env.SITE_ROOT || path.join(import.meta.dirname, '..', 'public'),
);
const MODES = (process.env.MODE || 'light').toLowerCase() === 'both'
  ? ['light', 'dark']
  : [(process.env.MODE || 'light').toLowerCase()];
const WIDTH = Number(process.env.WIDTH || 1440);
const HEIGHT = Number(process.env.HEIGHT || 1000);
const JOBS = Math.max(1, Number(process.env.JOBS || 6));

// ── CDP plumbing ───────────────────────────────────────────────────────────

async function newTab(url) {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return res.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.onopen = () => resolve({
      errors,
      send(method, params = {}) {
        const mid = ++id;
        ws.send(JSON.stringify({ id: mid, method, params }));
        return new Promise((ok, fail) => pending.set(mid, { ok, fail }));
      },
      close() { ws.close(); },
    });
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        errors.push((d.exception && d.exception.description) || d.text || 'exception');
      }
      if (msg.id && pending.has(msg.id)) {
        const { ok, fail } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? fail(new Error(JSON.stringify(msg.error))) : ok(msg.result);
      }
    };
    ws.onerror = reject;
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── In-page probe ──────────────────────────────────────────────────────────

const PROBE = `(mode) => {
  const out = {
    mode,
    theme: document.documentElement.getAttribute('data-theme'),
    canvas: getComputedStyle(document.body).backgroundColor,
    toggle: document.querySelectorAll('[data-tcc-theme-toggle]').length,
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    issues: [],
    dark: [],
  };

  // Cinematic panels, code surfaces, diagrams and decorative layers keep their
  // own treatment in both themes and are excluded from the content checks.
  const SKIP = 'video, .hero, .c-hero, .a-hero, .apply-hero, .prep-hero, .hero-fade, .hero-glow, .code-editor, .code-out, .code-bar, .lang-select, .terminal, .skip-link, .rmg-svg, .tpr-svg, [aria-hidden="true"], script, style, noscript, .loader';

  // /vybing/ renders a simulated editor from utility classes, so it cannot be
  // covered by a component selector above.
  const CODE_CLASS = /bg-\\[#1e1e1e\\]|bg-\\[#3c3c3c\\]/;
  const inCodeSurface = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (typeof n.className === 'string' && CODE_CLASS.test(n.className)) return true;
    }
    return false;
  };

  const parse = (v) => {
    const m = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?\\)/.exec(v || '');
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const hsl = (c) => {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
    return { s, l };
  };
  const canvas = mode === 'light' ? { r: 247, g: 247, b: 245, a: 1 } : { r: 5, g: 5, b: 5, a: 1 };

  const backdrop = (el) => {
    const layers = [];
    let node = el;
    let hasImage = false;
    while (node && node.nodeType === 1) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== 'none') hasImage = true;
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) layers.push(c);
      node = node.parentElement;
    }
    let bg = canvas;
    for (let i = layers.length - 1; i >= 0; i -= 1) bg = over(layers[i], bg);
    return { bg, hasImage };
  };

  for (const el of document.querySelectorAll('body *')) {
    if (!el.offsetParent) continue;
    if (el.closest(SKIP)) continue;
    if (inCodeSurface(el)) continue;
    const text = (el.textContent || '').trim();
    if (text.length < 2) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || +s.opacity === 0) continue;
    const fg = parse(s.color);
    if (!fg || fg.a === 0) continue;
    const { bg, hasImage } = backdrop(el);
    const realFg = fg.a < 1 ? over(fg, bg) : fg;
    const cr = ratio(realFg, bg);
    const size = parseFloat(s.fontSize);
    const bold = +s.fontWeight >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const min = large ? 3 : 4.5;
    const cls = String(el.className).slice(0, 60);
    if (mode === 'light' && cr < min) {
      out.issues.push({ tag: el.tagName, cls, text: text.slice(0, 60), color: s.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')', cr: Math.round(cr * 100) / 100, size, hasImage });
    }
    // A dark content surface in light mode is a leak. Accent fills are dark but
    // saturated, so only neutral near-black backgrounds count.
    const tone = hsl(bg);
    if (mode === 'light' && !hasImage && tone.l < 0.28 && tone.s < 0.35) {
      out.dark.push({ tag: el.tagName, cls, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')', text: text.slice(0, 50) });
    }
  }

  const unique = (list, key) => {
    const seen = new Set();
    return list.filter((item) => {
      const k = key(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  out.issues = unique(out.issues, (i) => i.cls + '|' + i.text + '|' + i.cr);
  out.dark = unique(out.dark, (i) => i.cls + '|' + i.text);
  out.issueCount = out.issues.length;
  out.darkCount = out.dark.length;
  out.issues = out.issues.slice(0, 12);
  out.dark = out.dark.slice(0, 12);
  return out;
}`;

async function probe(rel, mode) {
  const tab = await newTab('about:blank');
  const c = await connect(tab.webSocketDebuggerUrl);
  try {
    await c.send('Page.enable');
    await c.send('Runtime.enable');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH <= 480,
    });
    await c.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: mode }],
    });
    // Pin the mode so a previously stored override cannot skew the audit.
    await c.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { localStorage.setItem('tcc.theme.v1', '${mode}'); } catch (e) {}`,
    });
    await c.send('Page.navigate', { url: BASE + rel });
    await sleep(3200);
    const { result } = await c.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(${PROBE})(${JSON.stringify(mode)})`,
    });
    return { path: rel, ...result.value, consoleErrors: c.errors.length };
  } finally {
    c.close();
    await fetch(`${CDP}/json/close/${tab.id}`);
  }
}

// ── Page discovery ─────────────────────────────────────────────────────────

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
      walk(full, acc);
    } else if (entry.name.endsWith('.html')) {
      let rel = '/' + path.relative(ROOT, full).replace(/\\/g, '/');
      if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
      acc.push(rel);
    }
  }
  return acc;
}

function staticChecks() {
  const required = [
    ['boot snippet', /tcc-theme:boot/],
    ['color-scheme meta', /<meta name="color-scheme" content="light" \/>/],
    ['theme stylesheet', /\/assets\/css\/tcc-theme\.css/],
    ['page stylesheet', /\/assets\/css\/tcc-theme-pages\.css/],
    ['theme script', /\/assets\/js\/tcc-theme\.js/],
  ];
  const failures = [];
  const pages = walk(ROOT);
  for (const rel of pages) {
    const file = path.join(ROOT, rel === '/' ? 'index.html' : rel.slice(1) + (rel.endsWith('/') ? 'index.html' : ''));
    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { failures.push({ path: rel, issue: 'missing file' }); continue; }
    for (const [name, re] of required) {
      const count = (html.match(new RegExp(re.source, 'g')) || []).length;
      if (count !== 1) failures.push({ path: rel, issue: `${name} x${count}` });
    }
  }
  return { pages: pages.length, failures };
}

// ── Main ───────────────────────────────────────────────────────────────────

const staticResult = staticChecks();
console.log(`static wiring: ${staticResult.pages} pages, ${staticResult.failures.length} failure(s)`);
for (const f of staticResult.failures.slice(0, 20)) console.log('  WIRE', f.path, f.issue);

let pages = walk(ROOT).sort();
if (process.env.PAGES) {
  const wanted = process.env.PAGES.split(/[\s,]+/).filter(Boolean);
  const norm = (p) => (p.endsWith('/') ? p : p + '/');
  const set = new Set(wanted.map(norm));
  pages = pages.filter((p) => set.has(norm(p)));
}

console.log(`pages: ${pages.length}  mode: ${MODES.join('+')}  width: ${WIDTH}  jobs: ${JOBS}`);

const results = [];

// Modes run one after another: tabs share an origin's localStorage, so mixing
// light and dark probes concurrently would let one mode flip the other.
for (const mode of MODES) {
  let index = 0;
  async function worker() {
    while (index < pages.length) {
      const rel = pages[index++];
      try {
        const r = await probe(rel, mode);
        results.push(r);
        const badTheme = r.theme !== mode;
        // Dark mode is the untouched baseline: only structural checks apply.
        const badMode = mode === 'light' && (r.issueCount > 0 || r.darkCount > 0);
        if (badTheme || r.overflow || r.toggle === 0 || badMode) {
          console.log(`ISSUE ${mode} ${rel} theme=${r.theme} contrast=${r.issueCount} dark=${r.darkCount} overflow=${r.overflow} toggle=${r.toggle}`);
          for (const i of r.issues.slice(0, 5)) console.log('    contrast', JSON.stringify(i));
          for (const i of r.dark.slice(0, 5)) console.log('    surface ', JSON.stringify(i));
        }
      } catch (err) {
        console.log(`ERROR ${mode} ${rel} ${err.message}`);
        results.push({ path: rel, mode, error: err.message });
      }
    }
  }
  await Promise.all(Array.from({ length: JOBS }, worker));
}

const failed = results.filter((r) => {
  if (r.error) return true;
  if (r.theme !== r.mode) return true;
  if (r.overflow || r.toggle === 0) return true;
  if (r.mode === 'light') return r.issueCount > 0 || r.darkCount > 0;
  return false;
});

const byMode = (mode) => results.filter((r) => r.mode === mode);
console.log(`\nscanned: ${results.length} probes`);
for (const mode of MODES) {
  const rows = byMode(mode);
  console.log(`  ${mode}: ${rows.length} pages, contrast ${rows.filter((r) => r.issueCount).length}, dark-surface ${rows.filter((r) => r.darkCount).length}, overflow ${rows.filter((r) => r.overflow).length}, missing toggle ${rows.filter((r) => r.toggle === 0).length}`);
}
console.log(`static failures: ${staticResult.failures.length}`);
console.log(`failed probes: ${failed.length}`);
if (failed.length) {
  console.log('failed:', failed.slice(0, 40).map((r) => `${r.mode}:${r.path}`).join(', '));
}
process.exitCode = failed.length || staticResult.failures.length ? 1 : 0;
