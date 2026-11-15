const CDP = 'http://localhost:9250';
const CUR = 'http://localhost:3000';
const ORIG = 'http://localhost:3101';

async function newTab(url) {
  const r = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return r.json();
}
function conn(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const p = new Map();
    ws.onopen = () => res({
      send(m, pr = {}) { const i = ++id; ws.send(JSON.stringify({ id: i, method: m, params: pr })); return new Promise((a, b) => p.set(i, { a, b })); },
      close() { ws.close(); },
    });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && p.has(m.id)) {
        const { a, b } = p.get(m.id);
        p.delete(m.id);
        m.error ? b(new Error(JSON.stringify(m.error))) : a(m.result);
      }
    };
    ws.onerror = rej;
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FINGERPRINT = `(() => {
  const out = [];
  const skip = (el) => el.closest('.tcc-theme-toggle, .loader, script, style, noscript, template');
  const norm = (v) => String(v || '').replace(/\\s+/g, ' ').replace(/Light mode|Dark mode|Switch to (light|dark) theme/g, '').trim().slice(0, 40);
  for (const el of document.querySelectorAll('body, body *')) {
    if (skip(el)) continue;
    const s = getComputedStyle(el);
    const cls = typeof el.className === 'string' ? norm(el.className) : '';
    out.push([
      el.tagName, el.id || '', cls,
      s.color, s.backgroundColor, s.borderTopColor, s.borderTopWidth, s.borderTopStyle,
      s.fontFamily, s.fontSize, s.fontWeight, s.letterSpacing, s.textTransform,
    ].join('~'));
  }
  out.sort();
  return out;
})()`;

async function fingerprint(base, path) {
  const tab = await newTab('about:blank');
  const c = await conn(tab.webSocketDebuggerUrl);
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await c.send('Page.navigate', { url: base + path });
  await sleep(4200);
  const { result } = await c.send('Runtime.evaluate', { expression: FINGERPRINT, returnByValue: true });
  c.close();
  await fetch(`${CDP}/json/close/${tab.id}`);
  return result.value;
}

function diff(a, b) {
  const count = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
  const ma = count(a), mb = count(b);
  const onlyA = [], onlyB = [];
  for (const [k, v] of ma) { const w = mb.get(k) || 0; if (v > w) onlyA.push([k, v - w]); }
  for (const [k, v] of mb) { const w = ma.get(k) || 0; if (v > w) onlyB.push([k, v - w]); }
  return { onlyA, onlyB };
}

const pages = process.argv.slice(2).length ? process.argv.slice(2) : [
  '/', '/roadmaps/frontend/', '/domains/cse/', '/domains/architecture/arch-design/',
  '/prep+/aptitude/percentages/', '/prep+/companies/accenture/2026/', '/blog/',
  '/100-club/', '/gigs/', '/placement/', '/contact/', '/privacy-policy/', '/bootcamps/',
  '/webinars/', '/vybing/', '/member/', '/login/', '/404.html',
];

let bad = 0;
for (const p of pages) {
  const [a, b] = await Promise.all([fingerprint(CUR, p), fingerprint(ORIG, p)]);
  const d = diff(a, b);
  const total = d.onlyA.reduce((n, x) => n + x[1], 0) + d.onlyB.reduce((n, x) => n + x[1], 0);
  if (total === 0) {
    console.log(`IDENTICAL  ${p}  (${a.length} nodes)`);
  } else {
    bad += 1;
    console.log(`DIFF  ${p}  onlyCurrent=${d.onlyA.reduce((n, x) => n + x[1], 0)} onlyOriginal=${d.onlyB.reduce((n, x) => n + x[1], 0)}`);
    for (const [k, n] of d.onlyA.slice(0, 4)) console.log('  + ' + n + 'x ' + k.slice(0, 220));
    for (const [k, n] of d.onlyB.slice(0, 4)) console.log('  - ' + n + 'x ' + k.slice(0, 220));
  }
}
console.log(bad ? `\n${bad} page(s) differ` : '\nall pages identical in dark mode');
process.exitCode = bad ? 1 : 0;
