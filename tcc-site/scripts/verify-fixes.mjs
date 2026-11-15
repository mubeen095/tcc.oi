const CDP = 'http://localhost:9250';
const BASE = 'http://localhost:3000';

async function newTarget(u) {
  const r = await fetch(`${CDP}/json/new?${encodeURIComponent(u)}`, { method: 'PUT' });
  return r.json();
}
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const errors = [];
    const dialogs = [];
    ws.onopen = () => resolve({
      errors,
      dialogs,
      send(m, p = {}) {
        const mid = ++id;
        ws.send(JSON.stringify({ id: mid, method: m, params: p }));
        return new Promise((res, rej) => pending.set(mid, { res, rej }));
      },
      close() { ws.close(); },
    });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.method === 'Runtime.exceptionThrown') {
        errors.push((m.params.exceptionDetails && (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text)) || 'exception');
      }
      if (m.method === 'Page.javascriptDialogOpening') {
        dialogs.push(m.params.message);
        ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true } }));
      }
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      }
    };
    ws.onerror = reject;
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const t = await newTarget('about:blank');
const c = await connect(t.webSocketDebuggerUrl);
await c.send('Page.enable');
await c.send('Runtime.enable');

async function evalx(expr, awaitPromise = false) {
  const { result, exceptionDetails } = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
  if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
  return result.value;
}
async function viewport(width, height = 1000, mobile = false) {
  await c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
}
async function nav(url, wait = 2200) {
  c.errors.length = 0;
  await c.send('Page.navigate', { url: BASE + url });
  await sleep(wait);
  await evalx('document.fonts.ready.then(() => true)', true).catch(() => {});
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  if (!cond) console.log('FAIL', name, JSON.stringify(detail));
}

const PAGES = [
  { name: 'program', url: '/domains/cse/', kind: 'program', p: 'tpr', sec: 'tcc-program-roadmap' },
  { name: 'course', url: '/domains/cse/fullstack/', kind: 'program', p: 'tpr', sec: 'tcc-program-roadmap' },
  { name: 'overview', url: '/domains/', kind: 'program', p: 'tpr', sec: 'tcc-program-roadmap' },
  { name: 'roadmap', url: '/roadmaps/frontend/', kind: 'roadmap', p: 'rmg', sec: 'roadmap-map' },
];

for (const page of PAGES) {
  for (const width of [1440, 1280, 1024, 900, 768, 390, 320]) {
    const mobile = width <= 390;
    await viewport(width, mobile ? 844 : 1000, mobile);
    await nav(page.url);
    const m = await evalx(`(() => {
      const p = ${JSON.stringify(page.p)};
      const kind = ${JSON.stringify(page.kind)};
      const sec = document.getElementById(${JSON.stringify(page.sec)});
      const canvas = document.getElementById(p + '-canvas');
      const svg = document.querySelector('.' + p + '-svg');
      const q = (sel) => sec ? sec.querySelector(sel) : null;
      const h = (sel) => { const el = q(sel); return el ? Math.round(el.getBoundingClientRect().height) : -1; };
      const fs = (sel) => { const el = q(sel); return el ? parseFloat(getComputedStyle(el).fontSize) : -1; };
      const cs = (sel, prop) => { const el = q(sel); return el ? getComputedStyle(el)[prop] : ''; };
      let scale = 0;
      if (svg && svg.viewBox && svg.viewBox.baseVal.width) scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const toolbar = q('.' + p + '-toolbar');
      const legend = q('.' + p + '-legend');
      const related = q('.' + p + '-related-mobile');
      return {
        sec: !!sec,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        toolbarH: toolbar ? Math.round(toolbar.getBoundingClientRect().height) : -1,
        toolbarRows: toolbar ? Math.round(toolbar.getBoundingClientRect().height / 44) : -1,
        chipFont: fs('.' + p + '-chip'),
        legendFont: fs('.' + p + '-legend'),
        legendDisplay: legend ? getComputedStyle(legend).display : '',
        legendText: legend ? legend.textContent.replace(/\\s+/g, ' ').trim() : '',
        resetH: h('.' + p + '-reset'),
        zoomH: h('.' + p + '-zoom button'),
        findH: h('.' + p + '-find input'),
        canvasDisplay: canvas ? getComputedStyle(canvas).display : '',
        listDisplay: sec ? getComputedStyle(q(kind === 'program' ? '.tpr-stepper' : '.rmg-list')).display : '',
        svgW: svg ? Math.round(svg.getBoundingClientRect().width) : -1,
        canvasW: canvas ? Math.round(canvas.clientWidth) : -1,
        scale: +scale.toFixed(3),
        topicEffective: +(fs('.' + p + '-topic text') * scale).toFixed(1),
        subEffective: +(fs('.' + p + '-subtopic text') * scale).toFixed(1),
        stepTopicH: h('.tpr-step-topic'),
        stepSubH: h('.tpr-step-sub'),
        stepOutcomeDisplay: q('.tpr-step-outcome') ? getComputedStyle(q('.tpr-step-outcome')).display : '',
        phaseHeadH: h(kind === 'program' ? '.tpr-step summary' : '.rmg-list-phase-head'),
        listTopicH: h('.rmg-list-topic'),
        listSubH: h('.rmg-list-sub'),
        relatedDisplay: related ? getComputedStyle(related).display : '',
        headingFont: cs('.' + p + '-heading', 'fontFamily'),
        eyebrowFont: cs('.' + p + '-eyebrow', 'fontFamily'),
        subFont: cs('.' + p + '-sub', 'fontFamily'),
        loadedFonts: [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))],
      };
    })()`);
    const tag = `${page.name}@${width}`;
    check(`${tag} section mounted`, m.sec, m);
    check(`${tag} no horizontal overflow`, m.overflow === 0, m.overflow);
    check(`${tag} fonts loaded`, ['Instrument Serif', 'Inter', 'DM Mono'].every(f => m.loadedFonts.includes(f)), m.loadedFonts);
    check(`${tag} heading font`, /Instrument Serif/.test(m.headingFont), m.headingFont);
    check(`${tag} eyebrow font`, /DM Mono/.test(m.eyebrowFont), m.eyebrowFont);
    check(`${tag} body font`, /Inter/.test(m.subFont), m.subFont);
    check(`${tag} legend font >= 11`, m.legendFont >= 11, m.legendFont);
    check(`${tag} legend includes skip`, /skip/i.test(m.legendText), m.legendText);
    check(`${tag} toolbar single row`, m.toolbarH > 0 && m.toolbarH <= 76, m.toolbarH);
    check(`${tag} reset >= 44`, m.resetH >= 44, m.resetH);
    if (width > 390) {
      check(`${tag} chip font >= 11`, m.chipFont >= 11, m.chipFont);
      check(`${tag} zoom >= 44`, m.zoomH >= 44, m.zoomH);
      check(`${tag} find >= 44`, m.findH >= 44, m.findH);
      check(`${tag} topic effective >= 11`, m.topicEffective >= 11, m.topicEffective);
      check(`${tag} subtopic effective >= 11`, m.subEffective >= 11, m.subEffective);
      check(`${tag} canvas visible`, m.canvasDisplay !== 'none', m.canvasDisplay);
      check(`${tag} list hidden`, m.listDisplay === 'none', m.listDisplay);
    } else {
      check(`${tag} canvas hidden`, m.canvasDisplay === 'none', m.canvasDisplay);
      check(`${tag} list visible`, m.listDisplay !== 'none', m.listDisplay);
      check(`${tag} legend visible`, m.legendDisplay !== 'none', m.legendDisplay);
      check(`${tag} phase head >= 44`, m.phaseHeadH >= 44, m.phaseHeadH);
      check(`${tag} related block visible`, m.relatedDisplay !== 'none', m.relatedDisplay);
      if (page.kind === 'program') {
        check(`${tag} step topic >= 44`, m.stepTopicH >= 44, m.stepTopicH);
        check(`${tag} step sub >= 44`, m.stepSubH >= 44, m.stepSubH);
        check(`${tag} outcome visible`, m.stepOutcomeDisplay !== 'none', m.stepOutcomeDisplay);
      } else {
        check(`${tag} list topic >= 44`, m.listTopicH >= 44, m.listTopicH);
        check(`${tag} list sub >= 44`, m.listSubH >= 44, m.listSubH);
      }
    }
  }
}

// ── Interaction suite (program) ─────────────────────────────────────────────
await viewport(1440, 1000, false);
await nav('/domains/cse/');

const firstId = await evalx(`document.querySelector('.tpr-node[data-node-id]').getAttribute('data-node-id')`);
const lastId = await evalx(`(() => { const n=document.querySelectorAll('.tpr-node[data-node-id]'); return n[n.length-1].getAttribute('data-node-id'); })()`);
const phase3Id = await evalx(`document.querySelectorAll('.tpr-step')[2].querySelector('[data-node-id]').getAttribute('data-node-id')`);

await evalx(`(() => { const n=document.querySelector('.tpr-node[data-node-id]'); n.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); return 'ok'; })()`);
await sleep(250);
let d = await evalx(`(() => ({ hidden: document.getElementById('tpr-drawer').hidden, hash: location.hash, closeH: Math.round(document.getElementById('tpr-drawer-close').getBoundingClientRect().height), statusH: Math.round(document.querySelector('.tpr-status button').getBoundingClientRect().height), navH: Math.round(document.getElementById('tpr-prev').getBoundingClientRect().height), prevDisabled: document.getElementById('tpr-prev').disabled, nextDisabled: document.getElementById('tpr-next').disabled }))()`);
check('program drawer opens', d.hidden === false, d);
check('program deep link hash', d.hash === '#node-' + firstId, d.hash);
check('program drawer close >= 44', d.closeH >= 44, d.closeH);
check('program status >= 44', d.statusH >= 44, d.statusH);
check('program nav >= 44', d.navH >= 44, d.navH);
check('program prev clamped at start', d.prevDisabled === true && d.nextDisabled === false, d);

await evalx(`document.querySelectorAll('.tpr-node[data-node-id]')[document.querySelectorAll('.tpr-node[data-node-id]').length-1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(250);
d = await evalx(`({ prev: document.getElementById('tpr-prev').disabled, next: document.getElementById('tpr-next').disabled })`);
check('program next clamped at end', d.next === true && d.prev === false, d);

// mark done then test reset confirm false/true
await evalx(`document.querySelector('.tpr-status button[data-status="done"]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
await evalx(`window.confirm = () => false`);
await evalx(`document.getElementById('tpr-reset').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
let done = await evalx(`document.getElementById('tpr-done').textContent`);
check('program reset cancelled keeps progress', done !== '0', done);
await evalx(`window.confirm = () => true`);
await evalx(`document.getElementById('tpr-reset').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
done = await evalx(`document.getElementById('tpr-done').textContent`);
check('program reset confirmed clears progress', done === '0', done);

// hashchange closes drawer
await evalx(`location.hash = '#tcc-program-roadmap'`);
await sleep(350);
d = await evalx(`({ hidden: document.getElementById('tpr-drawer').hidden, lock: document.body.style.overflow })`);
check('program hashchange closes drawer', d.hidden === true && d.lock === '', d);

// scroll spy bottom
await evalx(`(() => { const cv=document.getElementById('tpr-canvas'); cv.scrollTop = cv.scrollHeight; cv.dispatchEvent(new Event('scroll')); return 'ok'; })()`);
await sleep(500);
d = await evalx(`(() => { const chips=[...document.querySelectorAll('.tpr-chip')]; return { active: chips.findIndex(c=>c.classList.contains('is-active')), aria: chips.filter(c=>c.getAttribute('aria-current')==='true').length, count: chips.length }; })()`);
check('program scroll spy forces last chip', d.active === d.count - 1 && d.aria === 1, d);

// Fit
await evalx(`document.getElementById('tpr-zoom-fit').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(350);
d = await evalx(`(() => { const cv=document.getElementById('tpr-canvas'); const svg=document.querySelector('.tpr-svg'); return { svgW: Math.round(svg.getBoundingClientRect().width), target: Math.round(cv.clientWidth-24) }; })()`);
check('program fit matches canvas width', Math.abs(d.svgW - d.target) <= 2, d);

// mobile deep link expansion
await viewport(390, 844, true);
await nav('/domains/cse/#node-' + phase3Id);
d = await evalx(`(() => { const steps=[...document.querySelectorAll('.tpr-step')]; return { hidden: document.getElementById('tpr-drawer').hidden, open: steps.map(s=>s.open), title: document.getElementById('tpr-drawer-title').textContent }; })()`);
check('program mobile deep link opens drawer', d.hidden === false && d.title.length > 0, d);
check('program mobile deep link expands phase', d.open[2] === true, d.open);

// ── Interaction suite (roadmap) ─────────────────────────────────────────────
await viewport(1440, 1000, false);
await nav('/roadmaps/frontend/');

const rFirst = await evalx(`document.querySelector('.rmg-node[data-node-id]').getAttribute('data-node-id')`);
const rPhase3 = await evalx(`document.querySelectorAll('.rmg-list-phase')[2].querySelector('[data-node-id]').getAttribute('data-node-id')`);

await evalx(`document.querySelector('.rmg-node[data-node-id]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(250);
d = await evalx(`(() => ({ hidden: document.getElementById('rmg-drawer').hidden, hash: location.hash, closeH: Math.round(document.getElementById('rmg-drawer-close').getBoundingClientRect().height), statusH: Math.round(document.querySelector('.rmg-status button').getBoundingClientRect().height), navH: Math.round(document.getElementById('rmg-prev').getBoundingClientRect().height), prev: document.getElementById('rmg-prev').disabled, next: document.getElementById('rmg-next').disabled }))()`);
check('roadmap drawer opens', d.hidden === false, d);
check('roadmap deep link hash', d.hash === '#topic-' + rFirst, d.hash);
check('roadmap drawer close >= 44', d.closeH >= 44, d.closeH);
check('roadmap status >= 44', d.statusH >= 44, d.statusH);
check('roadmap nav >= 44', d.navH >= 44, d.navH);
check('roadmap prev clamped at start', d.prev === true && d.next === false, d);

await evalx(`document.querySelectorAll('.rmg-node[data-node-id]')[document.querySelectorAll('.rmg-node[data-node-id]').length-1].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(250);
d = await evalx(`({ prev: document.getElementById('rmg-prev').disabled, next: document.getElementById('rmg-next').disabled })`);
check('roadmap next clamped at end', d.next === true && d.prev === false, d);

await evalx(`document.querySelector('.rmg-status button[data-status="done"]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
await evalx(`window.confirm = () => false`);
await evalx(`document.getElementById('rmg-reset').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
done = await evalx(`document.getElementById('rmg-done').textContent`);
check('roadmap reset cancelled keeps progress', done !== '0', done);
await evalx(`window.confirm = () => true`);
await evalx(`document.getElementById('rmg-reset').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(200);
done = await evalx(`document.getElementById('rmg-done').textContent`);
check('roadmap reset confirmed clears progress', done === '0', done);

await evalx(`location.hash = '#roadmap-map'`);
await sleep(350);
d = await evalx(`({ hidden: document.getElementById('rmg-drawer').hidden, lock: document.body.style.overflow })`);
check('roadmap hashchange closes drawer', d.hidden === true && d.lock === '', d);

await evalx(`(() => { const cv=document.getElementById('rmg-canvas'); cv.scrollTop = cv.scrollHeight; cv.dispatchEvent(new Event('scroll')); return 'ok'; })()`);
await sleep(500);
d = await evalx(`(() => { const chips=[...document.querySelectorAll('.rmg-chip')]; return { active: chips.findIndex(c=>c.classList.contains('is-active')), aria: chips.filter(c=>c.getAttribute('aria-current')==='true').length, count: chips.length }; })()`);
check('roadmap scroll spy forces last chip', d.active === d.count - 1 && d.aria === 1, d);

await evalx(`document.getElementById('rmg-zoom-fit').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
await sleep(350);
d = await evalx(`(() => { const cv=document.getElementById('rmg-canvas'); const svg=document.querySelector('.rmg-svg'); return { svgW: Math.round(svg.getBoundingClientRect().width), target: Math.round(cv.clientWidth-24) }; })()`);
check('roadmap fit matches canvas width', Math.abs(d.svgW - d.target) <= 2, d);

await viewport(390, 844, true);
await nav('/roadmaps/frontend/#topic-' + rPhase3);
d = await evalx(`(() => { const lis=[...document.querySelectorAll('.rmg-list-phase')]; return { hidden: document.getElementById('rmg-drawer').hidden, collapsed: lis.map(l=>l.classList.contains('is-collapsed')), aria: lis[2].querySelector('.rmg-list-phase-head').getAttribute('aria-expanded'), title: document.getElementById('rmg-drawer-title').textContent }; })()`);
check('roadmap mobile deep link opens drawer', d.hidden === false && d.title.length > 0, d);
check('roadmap mobile deep link expands phase', d.collapsed[2] === false && d.aria === 'true', d);

// ── Light-mode diagram suite ────────────────────────────────────────────────
// The same four pages must stay legible once the light palette is active:
// light canvas, dark diagram labels, light node fills, no overflow.
const LUM = `(c) => {
  const m = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/.exec(c || '');
  if (!m) return null;
  const f = (x) => { x = +x / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(m[1]) + 0.7152 * f(m[2]) + 0.0722 * f(m[3]);
}`;
const COMPOSITE = `(fg, bg, lum) => {
  const m = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?\\)/.exec(fg || '');
  const b = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/.exec(bg || '');
  if (!m || !b) return null;
  const a = m[4] === undefined ? 1 : +m[4];
  const mix = (x, y) => Math.round(x * a + y * (1 - a));
  return lum('rgb(' + mix(+m[1], +b[1]) + ',' + mix(+m[2], +b[2]) + ',' + mix(+m[3], +b[3]) + ')');
}`;

for (const page of PAGES) {
  for (const width of [1440, 390]) {
    const mobile = width <= 390;
    await viewport(width, mobile ? 844 : 1000, mobile);
    await nav(page.url);
    await evalx(`window.tccTheme && window.tccTheme.set('light')`);
    await sleep(450);
    const m = await evalx(`(() => {
      const lum = ${LUM};
      const comp = ${COMPOSITE};
      const p = ${JSON.stringify(page.p)};
      const sec = document.getElementById(${JSON.stringify(page.sec)});
      const q = (sel) => sec ? sec.querySelector(sel) : null;
      const pick = (sel, prop) => { const el = q(sel); return el ? getComputedStyle(el)[prop] : ''; };
      const canvas = getComputedStyle(document.body).backgroundColor;
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        toggle: document.querySelectorAll('[data-tcc-theme-toggle]').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        canvas,
        canvasLum: lum(canvas),
        sectionFill: pick('.' + p + '-section rect', 'fill'),
        sectionLum: comp(pick('.' + p + '-section rect', 'fill'), canvas, lum),
        topicFill: pick('.' + p + '-topic text', 'fill'),
        topicLum: lum(pick('.' + p + '-topic text', 'fill')),
        subFill: pick('.' + p + '-subtopic text', 'fill'),
        subLum: lum(pick('.' + p + '-subtopic text', 'fill')),
        heading: pick('.' + p + '-heading', 'color'),
        headingLum: lum(pick('.' + p + '-heading', 'color')),
        edgeStroke: pick('.' + p + '-svg path', 'stroke'),
        edgeLum: lum(pick('.' + p + '-svg path', 'stroke')),
      };
    })()`);
    const tag = `light ${page.name}@${width}`;
    check(`${tag} theme active`, m.theme === 'light', m.theme);
    check(`${tag} toggle present`, m.toggle > 0, m.toggle);
    check(`${tag} no horizontal overflow`, m.overflow === 0, m.overflow);
    check(`${tag} light canvas`, m.canvasLum !== null && m.canvasLum > 0.8, m.canvas);
    check(`${tag} section fill light`, m.sectionLum !== null && m.sectionLum > 0.6, m.sectionFill);
    check(`${tag} topic label dark`, m.topicLum !== null && m.topicLum < 0.5, m.topicFill);
    check(`${tag} subtopic label dark`, m.subLum !== null && m.subLum < 0.5, m.subFill);
    check(`${tag} heading dark`, m.headingLum !== null && m.headingLum < 0.5, m.heading);
    check(`${tag} edge visible on paper`, m.edgeLum !== null && m.edgeLum < 0.8, m.edgeStroke);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) console.log(JSON.stringify(failed.slice(0, 20), null, 2));
c.close();
await fetch(`${CDP}/json/close/${t.id}`);
process.exit(failed.length ? 1 : 0);
