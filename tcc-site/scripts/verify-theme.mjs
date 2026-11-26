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

const state = `(() => ({
  theme: document.documentElement.getAttribute('data-theme'),
  stored: (() => { try { return localStorage.getItem('tcc.theme.v1'); } catch (e) { return 'ERR'; } })(),
  meta: (document.querySelector('meta[name="theme-color"]') || {}).content || null,
  colorScheme: getComputedStyle(document.documentElement).colorScheme,
  toggles: document.querySelectorAll('[data-tcc-theme-toggle]').length,
  label: (document.querySelector('[data-tcc-theme-toggle] .tcc-theme-toggle-label') || {}).textContent || null,
  canvas: getComputedStyle(document.body).backgroundColor,
  ink: getComputedStyle(document.body).color,
}))()`;

async function evalx(c, expr) {
  const { result } = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return result.value;
}

async function open({ system = 'dark', store = null } = {}) {
  const tab = await newTab('about:blank');
  const c = await conn(tab.webSocketDebuggerUrl);
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: system }] });
  await c.send('Page.navigate', { url: BASE + '/login/' });
  await sleep(1000);
  await evalx(c, `localStorage.clear(); ${store ? `localStorage.setItem('tcc.theme.v1', ${JSON.stringify(store)});` : ''}`);
  await c.send('Page.navigate', { url: BASE + '/' });
  await sleep(2200);
  return { tab, c };
}

function assert(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
  if (!cond) process.exitCode = 1;
}

// 1. First visit, system dark.
{
  const { tab, c } = await open({ system: 'dark' });
  const s = await evalx(c, state);
  assert('first visit follows system dark', s.theme === 'dark', JSON.stringify(s));
  assert('dark meta colour', s.meta === '#000000', s.meta);
  // Native controls stay light in both themes to preserve the original dark baseline.
  assert('dark color-scheme keeps native controls light', s.colorScheme === 'light' || s.colorScheme === 'normal', s.colorScheme);
  assert('toggles injected', s.toggles >= 1, String(s.toggles));
  assert('dark canvas', s.canvas === 'rgb(0, 0, 0)' || s.canvas === 'rgb(0, 0, 0)', s.canvas);
  c.close();
  await fetch(`${CDP}/json/close/${tab.id}`);
}

// 2. Toggle -> light, persists across reload.
{
  const { tab, c } = await open({ system: 'dark' });
  await evalx(c, `document.querySelector('[data-tcc-theme-toggle]').click()`);
  await sleep(200);
  const s = await evalx(c, state);
  assert('click switches to light', s.theme === 'light', s.theme);
  assert('choice persisted', s.stored === 'light', String(s.stored));
  assert('light meta colour', s.meta === '#f7f7f5', s.meta);
  assert('light canvas', s.canvas === 'rgb(247, 247, 245)', s.canvas);
  assert('label offers dark mode', s.label === 'Dark mode', s.label);

  await c.send('Page.navigate', { url: BASE + '/roadmaps/frontend/' });
  await sleep(2200);
  const r = await evalx(c, state);
  assert('reload keeps light on another page', r.theme === 'light' && r.stored === 'light', JSON.stringify(r));

  // System changes must not override a manual choice.
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await sleep(300);
  const after = await evalx(c, state);
  assert('system change ignored after manual choice', after.theme === 'light', after.theme);
  c.close();
  await fetch(`${CDP}/json/close/${tab.id}`);
}

// 3. First visit, system light.
{
  const { tab, c } = await open({ system: 'light' });
  const s = await evalx(c, state);
  assert('first visit follows system light', s.theme === 'light', JSON.stringify(s));
  assert('light meta colour (system)', s.meta === '#f7f7f5', s.meta);
  assert('light color-scheme', s.colorScheme === 'light', s.colorScheme);
  c.close();
  await fetch(`${CDP}/json/close/${tab.id}`);
}

// 4. Cross-tab sync.
{
  const { tab: t1, c: c1 } = await open({ system: 'dark' });
  const t2 = await newTab(BASE + '/roadmaps/frontend/');
  const c2 = await conn(t2.webSocketDebuggerUrl);
  await c2.send('Page.enable');
  await c2.send('Runtime.enable');
  await sleep(2200);
  await evalx(c1, `localStorage.setItem('tcc.theme.v1','light')`);
  await sleep(400);
  const s2 = await evalx(c2, state);
  assert('other tab follows storage change', s2.theme === 'light', s2.theme);
  c1.close(); c2.close();
  await fetch(`${CDP}/json/close/${t1.id}`);
  await fetch(`${CDP}/json/close/${t2.id}`);
}

// 5. Clearing the override returns to system.
{
  const { tab, c } = await open({ system: 'light', store: 'dark' });
  const before = await evalx(c, state);
  assert('stored dark wins over system light', before.theme === 'dark', before.theme);
  await evalx(c, `window.tccTheme.clear()`);
  await sleep(200);
  const after = await evalx(c, state);
  assert('clear() returns to system light', after.theme === 'light' && after.stored === null, JSON.stringify(after));
  c.close();
  await fetch(`${CDP}/json/close/${tab.id}`);
}
