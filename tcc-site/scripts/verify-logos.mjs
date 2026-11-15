/* Verify company-logo rendering across the site at desktop + mobile, dark + light.

   Uses the CDP Chrome on :9250 and the dev server on :3000.

     node scripts/verify-logos.mjs
*/

const CDP = 'http://localhost:9250';
const BASE = 'http://localhost:3000';

async function newTab(url) {
  const r = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return r.json();
}

function conn(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const p = new Map();
    const errors = [];
    ws.onopen = () => res({
      errors,
      send(m, pr = {}) { const i = ++id; ws.send(JSON.stringify({ id: i, method: m, params: pr })); return new Promise((a, b) => p.set(i, { a, b })); },
      close() { ws.close(); },
    });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        errors.push((d.exception && d.exception.description) || d.text || 'exception');
      }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
      }
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

async function evalx(c, expr) {
  const { result, exceptionDetails } = await c.send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text + ' ' + (exceptionDetails.exception?.description || ''));
  return result.value;
}

const PROBE = `(async () => {
  const imgs = [...document.querySelectorAll('img')].filter((i) => /company\\/clean\\//.test(i.currentSrc || i.src));
  const out = [];
  for (const img of imgs) {
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const parent = img.parentElement ? getComputedStyle(img.parentElement) : null;
    const row = {
      file: (img.currentSrc || img.src).split('/').pop(),
      complete: img.complete,
      natural: img.naturalWidth + 'x' + img.naturalHeight,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      fit: cs.objectFit,
      filter: cs.filter,
      opacity: cs.opacity,
      bg: cs.backgroundColor,
      parentBg: parent ? parent.backgroundColor : null,
    };
    if (img.complete && img.naturalWidth) {
      const cv = document.createElement('canvas');
      cv.width = 128; cv.height = 128;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
      const d = ctx.getImageData(0, 0, 128, 128).data;
      let ink = 0, colored = 0, sr = 0, sg = 0, sb = 0;
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], B = d[i + 2];
        const dist = 255 - Math.min(R, G, B);
        const chroma = Math.max(R, G, B) - Math.min(R, G, B);
        if (dist > 40) { ink++; sr += R; sg += G; sb += B; if (chroma > 20) colored++; }
      }
      row.inkPct = +(ink / 16384 * 100).toFixed(1);
      row.coloredPct = +(colored / 16384 * 100).toFixed(1);
      row.meanInk = ink ? [Math.round(sr / ink), Math.round(sg / ink), Math.round(sb / ink)].join(',') : '-';
    }
    out.push(row);
  }
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    width: innerWidth,
    count: out.length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    logos: out,
  };
})()`;

const PAGES = [
  '/',
  '/prep+/companies/',
  '/prep+/companies/tcs/',
  '/prep+/companies/myntra/',
  '/prep+/companies/swiggy/',
  '/prep+/companies/wellsfargo/',
];

const tab = await newTab('about:blank');
const c = await conn(tab.webSocketDebuggerUrl);
await c.send('Page.enable');
await c.send('Runtime.enable');

let failures = 0;
const report = [];

for (const width of [1440, 390]) {
  for (const theme of ['dark', 'light']) {
    await c.send('Emulation.setDeviceMetricsOverride', {
      width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390,
    });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });

    for (const page of PAGES) {
      c.errors.length = 0;
      await c.send('Page.navigate', { url: BASE + page });
      await sleep(700);
      await evalx(c, `localStorage.setItem('tcc.theme.v1', '${theme}')`);
      await c.send('Page.reload');
      await sleep(900);

      /* force lazy logos to load before measuring */
      await evalx(c, `(async () => {
        const imgs = [...document.images];
        imgs.forEach((i) => { i.loading = 'eager'; });
        const H = document.documentElement.scrollHeight;
        for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        await Promise.all(imgs.map((i) => i.complete && i.naturalWidth ? null : new Promise((r) => {
          i.addEventListener('load', r, { once: true });
          i.addEventListener('error', r, { once: true });
          setTimeout(r, 3000);
        })));
        return imgs.length;
      })()`);
      await sleep(250);

      const res = await evalx(c, PROBE);
      const bad = [];
      if (res.overflow > 1) bad.push('overflow ' + res.overflow);
      if (res.count === 0 && page !== '/') bad.push('no logos');
      for (const l of res.logos) {
        if (!l.complete || l.natural === '0x0') bad.push('broken ' + l.file);
        if (l.fit !== 'contain') bad.push(l.file + ' fit=' + l.fit);
        if (l.filter !== 'none') bad.push(l.file + ' filter=' + l.filter);
        if (l.box === '0x0') bad.push(l.file + ' zero box');
        if (l.inkPct === 0) bad.push(l.file + ' blank');
      }
      if (c.errors.length) bad.push('console: ' + c.errors.slice(0, 2).join(' | '));

      const colored = res.logos.filter((l) => l.coloredPct > 2).length;
      const plain = res.logos.filter((l) => l.inkPct > 0 && l.coloredPct <= 2).map((l) => l.file);
      report.push({
        w: width, theme, page, themeAttr: res.theme, logos: res.count,
        colored, plain: plain.length, plainNames: plain,
        overflow: res.overflow,
        sample: res.logos.slice(0, 3).map((l) => `${l.file} ${l.box} ink=${l.inkPct}% col=${l.coloredPct}%`),
        bad,
      });
      if (bad.length) failures++;
    }
  }
}

await c.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
c.close();

for (const r of report) {
  console.log(`${String(r.w).padStart(4)} ${r.theme.padEnd(5)} ${r.page.padEnd(28)} theme=${r.themeAttr} logos=${String(r.logos).padStart(2)} colored=${String(r.colored).padStart(2)} mono=${String(r.plain).padStart(2)} ovf=${r.overflow} ${r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'ok'}`);
}
console.log('\n--- samples ---');
for (const r of report) console.log(`${r.w} ${r.theme} ${r.page} :: ${r.sample.join(' | ')}`);
const mono = report.find((r) => r.w === 1440 && r.theme === 'dark' && r.page === '/prep+/companies/');
if (mono) console.log('\nmonochrome-brand logos on roster:', mono.plainNames.join(', ') || '(none)');
console.log(`\n${failures ? failures + ' FAILING combo(s)' : 'ALL PASS'}`);
process.exit(failures ? 1 : 0);
