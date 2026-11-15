#!/usr/bin/env node
/* Check that SVG diagram labels still fit their boxes after the font switch.
 *
 *   node scripts/audit-diagram-labels.mjs
 *   WIDTHS=1440,390 node scripts/audit-diagram-labels.mjs
 *
 * Measures each node label with getBBox() and compares it with the node's
 * rect. Also checks section headings/outcomes and the mobile list.
 */

const CDP = process.env.CDP || 'http://localhost:9250';
const BASE = process.env.BASE || 'http://localhost:3000';
const WIDTHS = (process.env.WIDTHS || '1440,390').split(',').map(Number);

const PAGES = [
  { name: 'roadmap', url: '/roadmaps/frontend/', p: 'rmg' },
  { name: 'program', url: '/domains/cse/', p: 'tpr' },
  { name: 'course', url: '/domains/cse/fullstack/', p: 'tpr' },
  { name: 'overview', url: '/domains/', p: 'tpr' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTab(url) {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return res.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.onopen = () =>
      resolve({
        send(method, params = {}) {
          const mid = ++id;
          ws.send(JSON.stringify({ id: mid, method, params }));
          return new Promise((res, rej) => pending.set(mid, { res, rej }));
        },
        close() {
          ws.close();
        },
      });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      }
    };
    ws.onerror = reject;
  });
}

const PROBE = (p) => {
  const issues = [];
  const round = (n) => Math.round(n * 10) / 10;

  const nodes = [
    ...document.querySelectorAll(`.${p}-topic, .${p}-subtopic, .${p}-button`),
  ];
  for (const g of nodes) {
    const rect = g.querySelector('rect');
    const text = g.querySelector('text');
    if (!rect || !text || !text.textContent.trim()) continue;
    // Hidden canvases (mobile uses the list view) report a zero bbox.
    if (rect.getClientRects().length === 0) continue;
    const rb = rect.getBBox();
    const tb = text.getBBox();
    if (rb.width === 0 || tb.width === 0) continue;
    // Report real overflow as a failure; sub-8px margins as tight (warning).
    const spare = rb.width - tb.width;
    if (spare < 8) {
      issues.push({
        kind: 'node',
        severity: spare < 0 ? 'overflow' : 'tight',
        label: text.textContent.trim(),
        text: round(tb.width),
        box: round(rb.width),
        spare: round(spare),
      });
    }
  }

  for (const sec of document.querySelectorAll(`.${p}-section`)) {
    const rect = sec.querySelector('rect');
    if (!rect || rect.getClientRects().length === 0) continue;
    const rb = rect.getBBox();
    if (rb.width === 0) continue;
    for (const cls of [`${p}-section-label`, `${p}-section-outcome`]) {
      const t = sec.querySelector('.' + cls);
      if (!t || !t.textContent.trim()) continue;
      const tb = t.getBBox();
      if (tb.width === 0) continue;
      const spare = rb.x + rb.width - 4 - (tb.x + tb.width);
      if (spare < 8) {
        issues.push({
          kind: cls.replace(`${p}-`, ''),
          severity: spare < 0 ? 'overflow' : 'tight',
          label: t.textContent.trim(),
          text: round(tb.x + tb.width - rb.x),
          box: round(rb.width),
          spare: round(spare),
        });
      }
    }
  }

  for (const el of document.querySelectorAll(`.${p}-list-topic, .${p}-list-sub`)) {
    if (el.scrollWidth > el.clientWidth + 1) {
      issues.push({
        kind: 'list',
        severity: 'overflow',
        label: el.textContent.trim().slice(0, 80),
        text: el.scrollWidth,
        box: el.clientWidth,
        spare: el.clientWidth - el.scrollWidth,
      });
    }
  }

  return issues;
};

const results = [];

for (const page of PAGES) {
  for (const width of WIDTHS) {
    const tab = await newTab('about:blank');
    const c = await connect(tab.webSocketDebuggerUrl);
    try {
      await c.send('Page.enable');
      await c.send('Runtime.enable');
      await c.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: width <= 480,
      });
      await c.send('Page.navigate', { url: BASE + page.url });
      await sleep(2600);
      await c.send('Runtime.evaluate', {
        expression: 'document.fonts.ready.then(() => true)',
        awaitPromise: true,
        returnByValue: true,
      });
      const { result } = await c.send('Runtime.evaluate', {
        expression: `(${PROBE})(${JSON.stringify(page.p)})`,
        returnByValue: true,
      });
      results.push({ page: page.name, width, issues: result.value || [] });
    } finally {
      c.close();
      await fetch(`${CDP}/json/close/${tab.id}`);
    }
  }
}

let failed = 0;
let tight = 0;
for (const r of results) {
  if (r.issues.length) {
    const overflows = r.issues.filter((i) => i.severity === 'overflow');
    const tights = r.issues.filter((i) => i.severity === 'tight');
    failed += overflows.length;
    tight += tights.length;
    const label = overflows.length ? `${overflows.length} overflow(s)` : `${tights.length} tight (fits)`;
    console.log(`\n${r.page}@${r.width}: ${label}`);
    for (const i of r.issues.slice(0, 12)) {
      const amount = i.spare < 0 ? `over ${-i.spare}px` : `spare ${i.spare}px`;
      console.log(
        `  ${i.kind.padEnd(16)} ${i.severity.padEnd(8)} ${amount.padStart(12)}  text ${i.text} / box ${i.box}  ${JSON.stringify(i.label)}`,
      );
    }
  } else {
    console.log(`${r.page}@${r.width}: ok`);
  }
}

console.log(
  `\n${failed === 0 ? '✓ all diagram labels fit' : `✗ ${failed} label overflow(s)`}` +
    (tight ? `  (${tight} tight label(s) still inside their boxes)` : ''),
);
process.exit(failed ? 1 : 0);
