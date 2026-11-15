/* ─────────────────────────────────────────────────────────────────────────
   scripts/audit-responsive.mjs

   Renders pages in headless Chrome at phone, tablet and desktop widths and
   reports the things that actually break a layout:

     · horizontal overflow (page wider than the viewport)
     · elements sticking out past the viewport edge
     · form controls under 16px (iOS zooms the page when they focus)
     · tap targets under 44px on phones
     · images without a bounded width

   Usage:
     node scripts/audit-responsive.mjs                 # template sample
     node scripts/audit-responsive.mjs --all           # every page, 390px
     node scripts/audit-responsive.mjs --widths=320,390,768
     node scripts/audit-responsive.mjs --path=/blog/ --path=/placement/
   ───────────────────────────────────────────────────────────────────────── */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const ORIGIN = process.env.AUDIT_ORIGIN || 'http://localhost:3000';
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const WIDTHS = arg('widths', '320,360,390,430,768,1024,1440')
  .split(',')
  .map(Number)
  .filter(Boolean);
const ALL = has('all');
const FORCED_HEIGHT = Number(arg('height', '0')) || 0;
const ONLY = args.filter((a) => a.startsWith('--path=')).map((a) => a.slice(7));

/* ── page discovery ─────────────────────────────────────────────────────── */

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function routeOf(file) {
  const rel = path.relative(PUBLIC, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

const SAMPLE = [
  '/',
  '/bootcamps/',
  '/prep+/companies/',
  '/prep+/companies/tcs/',
  '/prep+/companies/tcs/2026/',
  '/prep+/aptitude/',
  '/prep+/dsa/',
  '/prep+/mock-tests/',
  '/prep+/programming/',
  '/prep+/mcq/',
  '/blog/',
  '/blog/ai-placement-programs.html',
  '/blog/tcs-nqt-what-it-tests.html',
  '/blog/category/placement/',
  '/placement/',
  '/outcomes/',
  '/verify/',
  '/verify/rubric/',
  '/verify/samples/',
  '/verify/stats/',
  '/verify/team/',
  '/verify/exam/',
  '/verify/what-we-dont-claim/',
  '/partners/',
  '/diagnostic/',
  '/enrol/',
  '/enrol/paid/',
  '/contact/',
  '/become-a-member/',
  '/100-club/',
  '/100-club/app/',
  '/gigs/',
  '/gigs/apply/',
  '/gigs/hire/',
  '/worksim/',
  '/domains/',
  '/webinars/',
  '/roadmaps/',
  '/ai-courses-for/',
  '/login/',
  '/member/',
  '/admin/',
  '/404.html',
];

let pages;
if (ONLY.length) pages = ONLY;
else if (ALL) pages = walk(PUBLIC).map(routeOf).sort();
else pages = SAMPLE;

/* ── CDP plumbing ───────────────────────────────────────────────────────── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9500 + Math.floor(Math.random() * 200);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=/tmp/tcc-responsive-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let ws;
for (let i = 0; i < 200; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await res.json();
    const page = list.find((t) => t.type === 'page');
    if (page) {
      ws = new WebSocket(page.webSocketDebuggerUrl);
      break;
    }
  } catch {}
  await sleep(150);
}
if (!ws) {
  chrome.kill('SIGTERM');
  throw new Error('Could not attach to Chrome');
}
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let seq = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
  }
};
const send = (method, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
};
const evaluate = async (expression) => {
  const out = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (out.exceptionDetails) {
    throw new Error(out.exceptionDetails.text || 'evaluate failed');
  }
  return out.result && out.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setBlockedURLs', { urls: ['*.mp4', '*.webm'] });

const DIAGNOSTIC = `(function () {
  var vw = window.innerWidth;
  var doc = document.documentElement;
  var pageOverflow = doc.scrollWidth - vw;

  function visible(el) {
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) === 0 && cs.position !== 'static') return false;
    if (el.closest('.skip-link, .sr, .sr-only, .hp-field, [aria-hidden="true"]')) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function inScroller(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
      var cs = getComputedStyle(p);
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return true;
      p = p.parentElement;
    }
    return false;
  }

  /* Content deliberately clipped by a fixed-width wrapper (marquees, glows)
     is not a layout bug. A hidden overflow on body/html is different: that is
     a mask, so it must not suppress the report. */
  function clipped(el) {
    var p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      var cs = getComputedStyle(p);
      var pr = p.getBoundingClientRect();
      if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip') && pr.width <= vw + 1) return true;
      p = p.parentElement;
    }
    return false;
  }

  function decorative(el) {
    var cs = getComputedStyle(el);
    if (cs.pointerEvents !== 'none') return false;
    return cs.position === 'absolute' || cs.position === 'fixed';
  }

  var offenders = [];
  var all = document.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (!visible(el) || decorative(el) || inScroller(el) || clipped(el)) continue;
    if (el.closest('[class*="marquee"]')) continue;
    var r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 45)
      });
    }
    if (offenders.length >= 8) break;
  }

  var zoomInputs = [];
  var controls = document.querySelectorAll('input, select, textarea');
  for (var j = 0; j < controls.length; j++) {
    if (vw > 768) break;
    var c = controls[j];
    if (c.type === 'hidden' || c.type === 'checkbox' || c.type === 'radio' || c.type === 'range' || c.type === 'file' || !visible(c)) continue;
    var fs = parseFloat(getComputedStyle(c).fontSize);
    if (fs < 16) zoomInputs.push((c.name || c.id || c.type) + ':' + fs + 'px');
  }

  var smallTargets = [];
  var tappable = document.querySelectorAll('a[href], button, [role="button"], input[type="submit"]');
  var mobileViewport = vw <= 430;
  for (var k = 0; k < tappable.length; k++) {
    var t = tappable[k];
    if (!mobileViewport || !visible(t) || inScroller(t) || clipped(t)) continue;
    /* WCAG 2.5.8: a link inside a sentence is exempt from the target size. */
    if (getComputedStyle(t).display === 'inline') continue;
    var tr = t.getBoundingClientRect();
    if (tr.width < 44 || tr.height < 44) {
      smallTargets.push({
        tag: t.tagName.toLowerCase(),
        cls: String(t.className || '').slice(0, 50),
        parent: t.parentElement ? t.parentElement.tagName.toLowerCase() + '.' + String(t.parentElement.className || '').slice(0, 30) : '',
        display: getComputedStyle(t).display,
        w: Math.round(tr.width),
        h: Math.round(tr.height),
        text: (t.textContent || t.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim().slice(0, 35)
      });
    }
    if (smallTargets.length >= 8) break;
  }

  var fullBleedImages = 0;
  var imgs = document.querySelectorAll('img');
  for (var m = 0; m < imgs.length; m++) {
    var im = imgs[m];
    if (!visible(im)) continue;
    if (getComputedStyle(im).maxWidth === 'none') fullBleedImages++;
  }

  return {
    overflow: pageOverflow,
    offenders: offenders,
    zoomInputs: zoomInputs,
    smallTargets: smallTargets,
    fullBleedImages: fullBleedImages,
    bodyMasked: getComputedStyle(document.body).overflowX === 'hidden' || getComputedStyle(document.documentElement).overflowX === 'hidden',
    title: document.title.slice(0, 60)
  };
})()`;

const results = [];
let done = 0;

for (const route of pages) {
  const url = `${ORIGIN}${route}`;
  for (const width of WIDTHS) {
    const height = FORCED_HEIGHT || (width <= 430 ? 844 : width <= 768 ? 1024 : 900);
    const mobile = width <= 430 || (FORCED_HEIGHT > 0 && FORCED_HEIGHT <= 500);

    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: mobile ? 3 : 1,
      mobile,
      screenWidth: width,
      screenHeight: height,
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });

    try {
      await send('Page.navigate', { url });
      for (let i = 0; i < 60; i++) {
        await sleep(80);
        const ready = await evaluate('document.readyState');
        if (ready === 'complete') break;
      }
      await sleep(350);
      const d = await evaluate(DIAGNOSTIC);
      results.push({ route, width, ok: d.overflow <= 0 && d.offenders.length === 0, ...d });
    } catch (e) {
      results.push({ route, width, error: String(e.message || e).slice(0, 120) });
    }
    done++;
    if (done % 20 === 0) {
      process.stderr.write(`  … ${done}/${pages.length * WIDTHS.length}\n`);
    }
  }
}

ws.close();
chrome.kill('SIGTERM');

/* ── report ─────────────────────────────────────────────────────────────── */

const problems = results.filter((r) => r.error || r.overflow > 0 || r.offenders.length);
const inputZoom = results.filter((r) => r.zoomInputs && r.zoomInputs.length);
const smallTap = results.filter((r) => r.smallTargets && r.smallTargets.length);

console.log('');
console.log(`responsive audit — ${pages.length} page(s) × ${WIDTHS.length} width(s) = ${results.length} renders`);
console.log(`  overflow/offenders : ${problems.length}`);
console.log(`  inputs < 16px      : ${inputZoom.length} renders`);
console.log(`  tap targets < 44px : ${smallTap.length} renders`);

if (problems.length) {
  console.log('\n── overflow ──');
  for (const r of problems.slice(0, 60)) {
    if (r.error) {
      console.log(`\n${r.route} @ ${r.width}  ERROR ${r.error}`);
      continue;
    }
    console.log(`\n${r.route} @ ${r.width}  pageOverflow=${r.overflow}  offenders=${r.offenders.length}`);
    for (const o of r.offenders.slice(0, 4)) {
      console.log(`   ${o.tag}.${o.cls}  [${o.left}…${o.right}] w=${o.w}  "${o.text}"`);
    }
  }
}

if (inputZoom.length) {
  console.log('\n── inputs under 16px (iOS zoom) ──');
  for (const r of inputZoom.slice(0, 20)) {
    console.log(`${r.route} @ ${r.width}: ${[...new Set(r.zoomInputs)].slice(0, 6).join(', ')}`);
  }
}

if (smallTap.length) {
  console.log('\n── tap targets under 44px ──');
  for (const r of smallTap.slice(0, 20)) {
    const uniq = [...new Set(r.smallTargets.map((t) => `${t.tag}:${t.w}x${t.h}:${t.text}`))].slice(0, 4);
    console.log(`${r.route} @ ${r.width}: ${uniq.join(' | ')}`);
  }
}

const outFile = arg('out', '');
if (outFile) {
  const target = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(results, null, 2));
  console.log(`\nfull results → ${target}`);
}

console.log('');
if (problems.length) process.exitCode = 1;