/* ==========================================================================
   WorkSim — shift runner
   No framework, no build step. One state machine, one score.
   A shift is a JSON graph: each moment lists options; an option carries points
   (0–10) and an optional `next` index. Absent `next` = continue sequentially.
   `next: null` = shift ends here.
   ========================================================================== */

const STORE_KEY = 'worksim_results_v1';
const MAX_PER_MOMENT = 10;

const app = document.getElementById('app');

const state = {
  pack: null,
  shift: null,
  i: 0,
  timeline: []
};

/* ---------- helpers ---------- */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const letter = (i) => String.fromCharCode(65 + i);

/* ---------- catalogue ---------- */

const API_MANIFEST = '/api/worksim/manifest';

let manifestPromise = null;

function fetchJson(url) {
  return fetch(url, { cache: 'no-cache' }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

function getManifest() {
  if (!manifestPromise) {
    manifestPromise = fetchJson(API_MANIFEST).catch(() =>
      fetchJson('packs/manifest.json').catch(() => {
        throw new Error('Could not load the shift catalogue.');
      })
    );
  }
  return manifestPromise;
}

/* ---------- results store ---------- */

function readResults() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveResult(result) {
  const all = readResults();
  all.unshift(result);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    /* storage full or blocked — the result still renders from memory */
  }
}

function getResult(id) {
  return readResults().find((r) => r.id === id) || null;
}

/* ---------- router ---------- */

function parseHash() {
  return location.hash.replace(/^#/, '').split('/').filter(Boolean);
}

async function route() {
  const parts = parseHash();

  if (parts[0] === 'play' && parts[1]) return startShift(parts[1]);
  if (parts[0] === 'result' && parts[1]) return renderResult(parts[1]);

  return renderHome();
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);

/* ---------- home ---------- */

const TIER_ORDER = ['Foundation', 'Practitioner', 'Strategist', 'Executive'];

const filters = { q: '', industry: '', tier: '' };

let catalogShifts = [];

async function renderHome() {
  app.className = 'app';
  app.innerHTML = '<div class="loading">Loading shifts</div>';

  let manifest;
  try {
    manifest = await getManifest();
  } catch (err) {
    app.innerHTML = `<div class="error">${esc(err.message)}</div>`;
    return;
  }

  const shifts = Array.isArray(manifest.shifts) ? manifest.shifts : [];
  const featured =
    shifts.find((s) => s.featured) ||
    shifts.find((s) => s.id === manifest.featured) ||
    shifts.find((s) => s.available) ||
    null;

  catalogShifts = shifts.filter((s) => s !== featured);

  const industries = [...new Set(catalogShifts.map((s) => s.industry).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const tiers = TIER_ORDER.filter((t) => catalogShifts.some((s) => s.tier === t));

  if (filters.industry && !industries.includes(filters.industry)) filters.industry = '';
  if (filters.tier && !tiers.includes(filters.tier)) filters.tier = '';

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Work simulation · Pilot</p>
      <h1 class="display">Practise the job<br>before you get it.</h1>
      <p class="lede">Work one realistic shift. Every choice changes what happens next. You are scored on judgement, not memorisation.</p>
    </section>

    <div class="hero-rule"></div>

    ${featured ? featuredHTML(featured) : ''}

    <section class="catalog-section">
      <div class="catalog-head">
        <h2 class="section-title">All roles</h2>
        <p class="count-note" id="count" aria-live="polite"></p>
      </div>

      <div class="filters">
        <input class="search" id="f-q" type="search" value="${esc(filters.q)}"
               placeholder="Search role, title or skill" autocomplete="off" aria-label="Search shifts" />

        <select class="filter-select" id="f-industry" aria-label="Filter by industry">
          <option value="">All industries</option>
          ${industries.map((i) => `<option value="${esc(i)}"${i === filters.industry ? ' selected' : ''}>${esc(i)}</option>`).join('')}
        </select>

        <select class="filter-select" id="f-tier" aria-label="Filter by level">
          <option value="">All levels</option>
          ${tiers.map((t) => `<option value="${esc(t)}"${t === filters.tier ? ' selected' : ''}>${esc(t)}</option>`).join('')}
        </select>

        <button class="btn ghost filter-reset" id="f-reset" type="button">Reset</button>
      </div>

      <div class="grid catalog" id="catalog"></div>
    </section>
  `;

  wireFilters();
  renderCatalog();
}

function featuredHTML(shift) {
  return `
    <section class="featured">
      <div class="featured-main">
        <p class="eyebrow">Featured shift</p>
        <p class="card-role">${esc(shift.role)} · ${esc(shift.industry || shift.level)}</p>
        <h2 class="featured-title">${esc(shift.title)}</h2>
        <p class="featured-desc">${esc(shift.blurb)}</p>
        <div class="card-meta">
          ${(shift.skills || []).slice(0, 3).map((s) => `<span>${esc(s)}</span>`).join('')}
        </div>
      </div>

      <div class="featured-side">
        <div class="featured-stats">
          <div class="stat"><span class="stat-num">10</span><span class="stat-label">decisions</span></div>
          <div class="stat"><span class="stat-num">${esc(shift.minutes)}</span><span class="stat-label">minutes</span></div>
          <div class="stat"><span class="stat-num">100</span><span class="stat-label">points</span></div>
        </div>
        <a class="btn accent" href="#/play/${esc(shift.id)}">Start the shift</a>
      </div>
    </section>
  `;
}

function wireFilters() {
  const q = document.getElementById('f-q');
  const industry = document.getElementById('f-industry');
  const tier = document.getElementById('f-tier');
  const reset = document.getElementById('f-reset');

  q.addEventListener('input', () => { filters.q = q.value; renderCatalog(); });
  industry.addEventListener('change', () => { filters.industry = industry.value; renderCatalog(); });
  tier.addEventListener('change', () => { filters.tier = tier.value; renderCatalog(); });

  reset.addEventListener('click', () => {
    filters.q = '';
    filters.industry = '';
    filters.tier = '';
    q.value = '';
    industry.value = '';
    tier.value = '';
    renderCatalog();
  });
}

function renderCatalog() {
  const el = document.getElementById('catalog');
  if (!el) return;

  const needle = filters.q.trim().toLowerCase();

  const list = catalogShifts.filter((s) => {
    if (filters.industry && s.industry !== filters.industry) return false;
    if (filters.tier && s.tier !== filters.tier) return false;
    if (!needle) return true;
    const hay = [s.role, s.title, s.industry, s.level, ...(s.skills || [])]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.includes(needle);
  });

  el.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="empty">No shifts match those filters.</div>`;

  const count = document.getElementById('count');
  if (count) {
    count.textContent = list.length === catalogShifts.length
      ? `${list.length} shift${list.length === 1 ? '' : 's'}`
      : `${list.length} of ${catalogShifts.length} shifts`;
  }
}

function cardHTML(shift) {
  const tag = shift.available
    ? `<a class="card live" href="#/play/${esc(shift.id)}">`
    : `<div class="card soon">`;

  const close = shift.available ? '</a>' : '</div>';

  return `
    ${tag}
      <div class="card-top">
        <span class="pill ${shift.available ? 'accent' : ''}">${esc(shift.tier || shift.level)}</span>
        <span class="pill">${esc(shift.minutes)} min</span>
      </div>
      <p class="card-role">${esc(shift.industry || shift.level)}</p>
      <h3 class="card-title">${esc(shift.role)}</h3>
      <p class="card-shift">${esc(shift.title)}</p>
      <p class="card-desc">${esc(shift.blurb)}</p>
      <div class="card-meta">
        ${(shift.skills || []).slice(0, 3).map((s) => `<span>${esc(s)}</span>`).join('')}
      </div>
    ${close}
  `;
}

/* ---------- shift runner ---------- */

async function startShift(id) {
  app.className = 'app narrow';
  app.innerHTML = '<div class="loading">Loading shift</div>';

  try {
    const manifest = await getManifest();
    const shift = manifest.shifts.find((s) => s.id === id);

    if (!shift) throw new Error('That shift does not exist.');
    if (!shift.available) throw new Error('That shift is not published yet.');

    const url = shift.api
      ? `/api/worksim/pack/${encodeURIComponent(shift.id)}`
      : shift.pack;

    if (!url) throw new Error('This shift has no pack.');

    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Could not load this shift.');

    state.pack = await res.json();
    state.shift = shift;
    state.i = 0;
    state.timeline = [];

    renderMoment();
  } catch (err) {
    app.innerHTML = `<div class="error">${esc(err.message)}</div>`;
  }
}

function renderMoment() {
  const pack = state.pack;
  const moment = pack.moments[state.i];

  if (!moment) return finish();

  const total = pack.length || 10;
  const step = state.timeline.length + 1;

  app.innerHTML = `
    <div class="runner-head">
      <h1 class="runner-title">${esc(pack.title)}</h1>
      <div class="runner-count">Moment ${step} / ${total}</div>
    </div>

    <div class="progress">
      <div class="progress-fill" style="width:${((step - 1) / total) * 100}%"></div>
    </div>

    <p class="moment-skill">${esc(moment.skill)}</p>
    <p class="moment-text">${esc(moment.text)}</p>

    <div class="options" id="options">
      ${moment.options.map((opt, idx) => `
        <button class="option" type="button" data-idx="${idx}">
          <span class="option-key">${letter(idx)}</span>
          <span>${esc(opt.text)}</span>
        </button>
      `).join('')}
    </div>

    <div id="feedback"></div>
    <div class="runner-actions" id="actions"></div>
  `;

  document.getElementById('options').addEventListener('click', onChoose);
}

function onChoose(ev) {
  const btn = ev.target.closest('.option');
  if (!btn || btn.disabled) return;

  const moment = state.pack.moments[state.i];
  const choice = moment.options[Number(btn.dataset.idx)];

  document.querySelectorAll('.option').forEach((b) => { b.disabled = true; });
  btn.classList.add('picked');

  state.timeline.push({
    index: state.i,
    skill: moment.skill,
    text: moment.text,
    choice: choice.text,
    points: choice.points,
    feedback: choice.feedback || ''
  });

  const tone = choice.points >= 8 ? 'good' : choice.points >= 4 ? 'mid' : 'bad';
  document.getElementById('feedback').innerHTML = `
    <div class="feedback ${tone}">
      <p class="feedback-label">${choice.points} / ${MAX_PER_MOMENT} points</p>
      <p class="feedback-text">${esc(choice.feedback)}</p>
    </div>
  `;

  const total = state.pack.length || 10;
  const isLast = state.timeline.length >= total || choice.next === null;

  const actions = document.getElementById('actions');
  actions.innerHTML = `<button class="btn primary" type="button" id="next">
    ${isLast ? 'See result' : 'Continue'}
  </button>`;

  document.getElementById('next').addEventListener('click', () => {
    if (isLast) return finish();
    state.i = choice.next === undefined ? state.i + 1 : choice.next;
    renderMoment();
  });
}

function finish() {
  const timeline = state.timeline;
  const score = timeline.reduce((sum, t) => sum + t.points, 0);

  const id = 'ws_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const result = {
    id,
    packId: state.shift.id,
    title: state.pack.title,
    role: state.shift.role,
    level: state.shift.level,
    total: state.pack.length || 10,
    score,
    at: new Date().toISOString(),
    timeline
  };

  saveResult(result);
  location.hash = `#/result/${id}`;
}

/* ---------- result ---------- */

function bandFor(score) {
  if (score >= 85) return { label: 'Excellent judgement', cls: 'band-high' };
  if (score >= 65) return { label: 'Solid, with gaps', cls: 'band-mid' };
  return { label: 'Not yet ready', cls: 'band-low' };
}

function renderResult(id) {
  app.className = 'app narrow';

  const result = getResult(id);
  if (!result) {
    app.innerHTML = `
      <div class="empty">
        <p>That result is not on this device.</p>
        <p style="margin-top:16px"><a class="btn" href="#/">Back to shifts</a></p>
      </div>`;
    return;
  }

  const score = result.score;
  const band = bandFor(score);

  const bySkill = new Map();
  for (const t of result.timeline) {
    const row = bySkill.get(t.skill) || { earned: 0, max: 0, count: 0 };
    row.earned += t.points;
    row.max += MAX_PER_MOMENT;
    row.count += 1;
    bySkill.set(t.skill, row);
  }

  const weakest = [...result.timeline].sort((a, b) => a.points - b.points)[0];

  const R = 70;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);

  app.innerHTML = `
    <div class="result-head">
      <div class="ring">
        <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
          <circle class="ring-track" cx="84" cy="84" r="${R}" fill="none" stroke-width="6" />
          <circle class="ring-fill" cx="84" cy="84" r="${R}" fill="none" stroke-width="6"
                  stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" />
        </svg>
        <div class="ring-inner">
          <span class="ring-score">${score}</span>
          <span class="ring-of">out of 100</span>
        </div>
      </div>

      <div class="result-copy">
        <p class="result-band ${band.cls}">${band.label}</p>
        <h1 class="result-title">${esc(result.title)}</h1>
        <p class="result-sub">
          ${esc(result.role)} · ${esc(result.level)}.
          ${weakest ? `Your weakest moment was ${esc(weakest.skill.toLowerCase())} — ${weakest.points}/10.` : ''}
        </p>
      </div>
    </div>

    <h2 class="section-title">By skill</h2>
    <div class="skills">
      ${[...bySkill.entries()].map(([skill, row]) => {
        const pct = Math.round((row.earned / row.max) * 100);
        const cls = pct < 50 ? 'low' : pct < 75 ? 'mid' : '';
        return `
          <div class="skill-row">
            <div class="skill-top">
              <span class="skill-name">${esc(skill)}</span>
              <span class="skill-val">${row.earned} / ${row.max}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-fill ${cls}" style="width:${pct}%"></div>
            </div>
          </div>`;
      }).join('')}
    </div>

    <h2 class="section-title" style="margin-top:48px">Your decisions</h2>
    <div class="timeline">
      ${result.timeline.map((t, i) => {
        const cls = t.points >= 8 ? 'pts-hi' : t.points >= 4 ? 'pts-mid' : 'pts-lo';
        return `
          <div class="tl-item">
            <div class="tl-num">${String(i + 1).padStart(2, '0')}</div>
            <div>
              <p class="tl-skill">${esc(t.skill)}</p>
              <p class="tl-choice">${esc(t.choice)}</p>
              <p class="tl-note">${esc(t.feedback)}</p>
            </div>
            <div class="tl-pts ${cls}">${t.points}/10</div>
          </div>`;
      }).join('')}
    </div>

    <div class="result-actions">
      <a class="btn primary" href="#/play/${esc(result.packId)}">Run it again</a>
      <a class="btn" href="#/">All shifts</a>
    </div>

    <p class="eyebrow" style="margin-top:32px">
      Simulated assessment · not an employment decision
    </p>
  `;
}
