/* ==========================================================================
   WorkSim Studio — pack factory
   Author a shift, validate the graph, preview it, export the JSON.
   No framework, no build step. Drafts live in localStorage.
   ========================================================================== */

const STORE = 'worksim_studio_draft_v1';
const PATH_LIMIT = 200000;

/* ---------- tiny helpers ---------- */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const letter = (i) => String.fromCharCode(65 + i);

const slug = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let k = 0; k < parts.length - 1; k += 1) cur = cur[parts[k]];
  cur[parts[parts.length - 1]] = value;
}

/* ---------- model ---------- */

function blankOption() {
  return { text: '', points: '', next: undefined, feedback: '' };
}

function blankMoment() {
  return { skill: '', text: '', options: [blankOption(), blankOption(), blankOption()] };
}

function blankModel() {
  return {
    id: '',
    role: '',
    roleId: '',
    level: '',
    title: '',
    blurb: '',
    minutes: 12,
    skills: [],
    length: 10,
    pointsPerMoment: 10,
    moments: [blankMoment()]
  };
}

function normalize(m) {
  const out = { ...blankModel(), ...m };
  if (!Array.isArray(out.moments) || out.moments.length === 0) out.moments = [blankMoment()];
  if (!Array.isArray(out.skills)) out.skills = [];
  out.moments = out.moments.map((mo) => ({
    skill: mo.skill || '',
    text: mo.text || '',
    options: Array.isArray(mo.options) && mo.options.length
      ? mo.options.map((o) => ({
        text: o.text || '',
        points: o.points ?? '',
        next: Object.prototype.hasOwnProperty.call(o, 'next') ? o.next : undefined,
        feedback: o.feedback || ''
      }))
      : [blankOption()]
  }));
  return out;
}

const state = { model: blankModel(), preview: null };

/* ---------- analysis ---------- */

function analyze(model) {
  const issues = [];
  const M = model.moments || [];
  const length = Number(model.length) || 0;
  const add = (sev, text) => issues.push({ sev, text });

  if (!String(model.title || '').trim()) add('warn', 'Shift title is empty.');
  if (!String(model.role || '').trim()) add('warn', 'Role is empty.');
  if (!String(model.level || '').trim()) add('warn', 'Level is empty.');
  if (!String(model.id || '').trim()) add('warn', 'Shift id is empty — export will derive one.');

  if (!M.length) {
    add('error', 'Add at least one moment.');
    return { paths: 0, min: 0, max: 0, issues, errors: 1, warns: 0, truncated: false };
  }

  if (length < 1) add('error', 'Declared length must be at least 1.');

  M.forEach((mo, i) => {
    if (!String(mo.text || '').trim()) add('warn', `Moment ${i + 1}: situation text is empty.`);
    if (!String(mo.skill || '').trim()) add('warn', `Moment ${i + 1}: no skill label.`);
    if (!mo.options.length) add('error', `Moment ${i + 1}: no options.`);

    mo.options.forEach((o, j) => {
      const tag = `Moment ${i + 1}, option ${letter(j)}`;
      if (!String(o.text || '').trim()) add('warn', `${tag}: option text is empty.`);

      const p = Number(o.points);
      if (o.points === '' || o.points === null || o.points === undefined || !Number.isFinite(p) || p < 0 || p > 10) {
        add('error', `${tag}: points must be a number from 0 to 10.`);
      }

      if (typeof o.next === 'number') {
        if (o.next < 0 || o.next >= M.length) add('error', `${tag}: jumps to moment ${o.next + 1}, which does not exist.`);
        else if (o.next === i) add('warn', `${tag}: loops back to its own moment.`);
      }

      if (!String(o.feedback || '').trim()) add('warn', `${tag}: no feedback written.`);
    });
  });

  const reachable = new Set([0]);
  let paths = 0;
  let min = Infinity;
  let max = -Infinity;
  const lens = new Map();
  let truncated = false;

  function record(n, score) {
    paths += 1;
    lens.set(n, (lens.get(n) || 0) + 1);
    if (score < min) min = score;
    if (score > max) max = score;
  }

  function walk(i, steps, score) {
    if (paths > PATH_LIMIT) { truncated = true; return; }
    if (steps >= length) { record(steps, score); return; }

    const mo = M[i];
    if (!mo) {
      record(steps, score);
      add('error', `A path runs past the last moment after ${steps} decision${steps === 1 ? '' : 's'}.`);
      return;
    }

    reachable.add(i);

    for (const o of mo.options) {
      const p = Number(o.points);
      const pts = Number.isFinite(p) ? p : 0;
      const next = o.next === undefined ? i + 1 : o.next;

      if (next === null) record(steps + 1, score + pts);
      else walk(next, steps + 1, score + pts);
    }
  }

  if (length >= 1) walk(0, 0, 0);

  if (paths === 0) add('error', 'No complete paths through the shift.');

  if (paths > 0) {
    const bad = [...lens.keys()].filter((n) => n !== length);
    if (bad.length) {
      const desc = bad.map((n) => `${n} moment${n === 1 ? '' : 's'}`).join(', ');
      add('error', `Not every path is ${length} moments long — some end after ${desc}.`);
    }
    if (max < length * 10) add('warn', `Best possible score is ${max}, not ${length * 10}. Every moment needs a 10-point option.`);
    if (max > length * 10) add('error', `Best possible score is ${max}, above the ${length * 10} maximum.`);
  }

  const unreachable = M.map((_, i) => i).filter((i) => !reachable.has(i));
  if (unreachable.length) {
    add('error', `Unreachable moment${unreachable.length > 1 ? 's' : ''}: ${unreachable.map((i) => i + 1).join(', ')}.`);
  }

  const errors = issues.filter((x) => x.sev === 'error').length;
  const warns = issues.filter((x) => x.sev === 'warn').length;
  if (errors === 0 && warns === 0) add('ok', 'Graph is clean. Ready to export.');

  return {
    paths,
    min: paths ? min : 0,
    max: paths ? max : 0,
    issues,
    errors,
    warns,
    truncated
  };
}

/* ---------- rendering: editor ---------- */

function field(label, path, value, opts = {}) {
  const { type = 'text', placeholder = '', full = false } = opts;
  return `<label class="field ${full ? 'full' : ''}">
    <span>${esc(label)}</span>
    <input class="inp" type="${type}" data-path="${path}" value="${esc(value)}" placeholder="${esc(placeholder)}" />
  </label>`;
}

function area(label, path, value, placeholder = '') {
  return `<label class="field full">
    <span>${esc(label)}</span>
    <textarea class="ta" data-path="${path}" rows="2" placeholder="${esc(placeholder)}">${esc(value)}</textarea>
  </label>`;
}

function optionHTML(o, i, j) {
  const moments = state.model.moments;
  const select = `<select class="sel" data-kind="next" data-path="moments.${i}.options.${j}.next">
    <option value="" ${o.next === undefined ? 'selected' : ''}>Next moment (auto)</option>
    <option value="end" ${o.next === null ? 'selected' : ''}>End shift</option>
    ${moments.map((mm, k) => `<option value="${k}" ${o.next === k ? 'selected' : ''}>Moment ${k + 1}${mm.skill ? ' — ' + esc(mm.skill) : ''}</option>`).join('')}
  </select>`;

  return `<div class="o-card">
    <div class="o-head">
      <span class="o-key">Option ${letter(j)}</span>
      <button class="btn small ghost" type="button" data-act="del-option" data-i="${i}" data-j="${j}"
        ${moments[i].options.length <= 1 ? 'disabled' : ''}>Remove</button>
    </div>
    <textarea class="ta" data-path="moments.${i}.options.${j}.text" rows="2"
      placeholder="What does the candidate do?">${esc(o.text)}</textarea>
    <div class="o-meta">
      <label class="mini">Points
        <input class="inp" type="number" min="0" max="10" data-path="moments.${i}.options.${j}.points" value="${esc(o.points)}" />
      </label>
      <label class="mini">Then
        ${select}
      </label>
    </div>
    <textarea class="ta" data-path="moments.${i}.options.${j}.feedback" rows="2"
      placeholder="Why this is right or wrong.">${esc(o.feedback)}</textarea>
  </div>`;
}

function momentHTML(mo, i, count) {
  return `<div class="m-card">
    <div class="m-head">
      <span class="m-num">${String(i + 1).padStart(2, '0')}</span>
      <input class="inp m-skill" data-path="moments.${i}.skill" value="${esc(mo.skill)}" placeholder="Skill label (e.g. Discovery)" />
      <div class="m-actions">
        <button class="btn small icon" type="button" data-act="up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
        <button class="btn small icon" type="button" data-act="down" data-i="${i}" ${i === count - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
        <button class="btn small icon" type="button" data-act="del-moment" data-i="${i}" ${count === 1 ? 'disabled' : ''}>Remove</button>
      </div>
    </div>
    <textarea class="ta" data-path="moments.${i}.text" rows="3"
      placeholder="What happens in this moment?">${esc(mo.text)}</textarea>
    <div class="options-list">
      ${mo.options.map((o, j) => optionHTML(o, i, j)).join('')}
    </div>
    <button class="btn small ghost" type="button" data-act="add-option" data-i="${i}">Add option</button>
  </div>`;
}

function renderEditor() {
  const m = state.model;
  document.getElementById('editor').innerHTML = `
    <div class="panel">
      <h2 class="section-title">Shift details</h2>
      <div class="field-grid">
        ${field('Title', 'title', m.title, { placeholder: 'First call of the day', full: true })}
        ${field('Role', 'role', m.role, { placeholder: 'Sales Development Representative' })}
        ${field('Level', 'level', m.level, { placeholder: 'Beginner' })}
        ${field('Shift id', 'id', m.id, { placeholder: 'sdr-beginner' })}
        ${field('Role id (folder)', 'roleId', m.roleId, { placeholder: 'sdr' })}
        ${field('Minutes', 'minutes', m.minutes, { type: 'number' })}
        ${field('Length (moments)', 'length', m.length, { type: 'number' })}
        ${field('Skills (comma separated)', 'skills', m.skills.join(', '), { placeholder: 'Discovery, Objection handling, Closing', full: true })}
        ${area('Blurb', 'blurb', m.blurb, 'One line that makes a candidate want to play it.')}
      </div>
    </div>

    <div class="moments-head">
      <h2 class="section-title">Moments <span class="count">${m.moments.length}</span></h2>
      <button class="btn small" type="button" data-act="add-moment">Add moment</button>
    </div>

    ${m.moments.map((mo, i) => momentHTML(mo, i, m.moments.length)).join('')}
  `;
}

/* ---------- rendering: validation ---------- */

const stat = (label, value) => `<div class="stat">
  <span class="stat-v">${esc(value)}</span>
  <span class="stat-l">${esc(label)}</span>
</div>`;

function updateStatus() {
  const a = analyze(state.model);
  const badge = a.errors
    ? `<span class="badge bad">${a.errors} problem${a.errors > 1 ? 's' : ''}</span>`
    : a.warns
      ? `<span class="badge warn">${a.warns} warning${a.warns > 1 ? 's' : ''}</span>`
      : '<span class="badge good">Ready</span>';

  const length = Number(state.model.length) || 0;

  document.getElementById('status').innerHTML = `
    <div class="status-head">
      <h2 class="section-title" style="margin:0;padding:0;border:0">Validation</h2>
      ${badge}
    </div>
    <div class="stats">
      ${stat('Moments', state.model.moments.length)}
      ${stat('Paths', a.truncated ? '200k+' : a.paths.toLocaleString('en-IN'))}
      ${stat('Best', a.max)}
      ${stat('Worst', a.min)}
      ${stat('Length', length)}
      ${stat('Target', length * 10)}
    </div>
    <ul class="issues">
      ${a.issues.map((x) => `<li class="issue ${x.sev}"><span class="dot"></span><span>${esc(x.text)}</span></li>`).join('')}
    </ul>
  `;
}

/* ---------- rendering: preview ---------- */

function previewLength() {
  return Number(state.model.length) || state.model.moments.length || 1;
}

function previewNext() {
  const p = state.preview;
  const mo = state.model.moments[p.i];
  const o = mo && mo.options[p.picked];
  if (!o) return { next: null };
  return { next: o.next === undefined ? p.i + 1 : o.next };
}

function isPreviewLast() {
  const p = state.preview;
  if (!p) return true;
  const { next } = previewNext();
  return next === null || p.timeline.length >= previewLength();
}

function renderPreview() {
  const el = document.getElementById('preview');
  const p = state.preview;
  const head = '<h2 class="section-title">Preview</h2>';

  if (!p) {
    el.innerHTML = `${head}
      <p class="hint">Play the shift the way a candidate would.</p>
      <button class="btn block" type="button" data-act="preview">Start preview</button>`;
    return;
  }

  if (p.done) {
    const score = p.timeline.reduce((s, t) => s + t.points, 0);
    const max = previewLength() * 10;
    const band = score >= max * 0.85
      ? ['Excellent judgement', 'band-high']
      : score >= max * 0.65
        ? ['Solid, with gaps', 'band-mid']
        : ['Not yet ready', 'band-low'];

    el.innerHTML = `${head}
      <div class="preview-stage">
        <p class="result-band ${band[1]}">${band[0]}</p>
        <div class="preview-score">${score}</div>
        <p class="preview-of">out of ${max} · ${p.timeline.length} decisions</p>
        <div class="runner-actions" style="justify-content:flex-start;margin-top:18px">
          <button class="btn small" type="button" data-act="prest">Replay</button>
          <button class="btn small ghost" type="button" data-act="pclose">Close</button>
        </div>
      </div>`;
    return;
  }

  const mo = state.model.moments[p.i];
  if (!mo) { p.done = true; renderPreview(); return; }

  const picked = p.picked;
  const step = picked === null ? p.timeline.length + 1 : p.timeline.length;

  const options = mo.options.map((o, j) => {
    const cls = picked === j ? 'option picked' : 'option';
    return `<button class="${cls}" type="button" data-act="pchoose" data-j="${j}"
      ${picked !== null ? 'disabled' : ''}>
      <span class="option-key">${letter(j)}</span>
      <span>${esc(o.text || '(empty option)')}</span>
    </button>`;
  }).join('');

  let feedback = '';
  if (picked !== null) {
    const o = mo.options[picked];
    const pts = Number(o.points) || 0;
    const tone = pts >= 8 ? 'good' : pts >= 4 ? 'mid' : 'bad';
    feedback = `<div class="feedback ${tone}">
      <p class="feedback-label">${pts} / 10 points</p>
      <p class="feedback-text">${esc(o.feedback || '')}</p>
    </div>
    <div class="runner-actions" style="justify-content:flex-start">
      <button class="btn small primary" type="button" data-act="pnext">${isPreviewLast() ? 'See score' : 'Continue'}</button>
    </div>`;
  }

  el.innerHTML = `${head}
    <div class="preview-stage">
      <div class="runner-head" style="margin-bottom:6px">
        <p class="moment-skill" style="margin:0">${esc(mo.skill || 'Moment')}</p>
        <span class="runner-count">${Math.min(step, previewLength())} / ${previewLength()}</span>
      </div>
      <p class="moment-text">${esc(mo.text || '(empty moment)')}</p>
      <div class="options">${options}</div>
      ${feedback}
    </div>`;
}

/* ---------- preview actions ---------- */

function startPreview() {
  state.preview = { i: 0, timeline: [], picked: null, done: false };
  renderPreview();
}

function previewChoose(j) {
  const p = state.preview;
  if (!p || p.picked !== null) return;
  const mo = state.model.moments[p.i];
  const o = mo && mo.options[j];
  if (!o) return;
  p.picked = j;
  p.timeline.push({ skill: mo.skill, points: Number(o.points) || 0 });
  renderPreview();
}

function previewAdvance() {
  const p = state.preview;
  if (!p || p.picked === null) return;
  const { next } = previewNext();

  if (next === null || p.timeline.length >= previewLength()) {
    p.done = true;
    renderPreview();
    return;
  }

  p.i = next;
  p.picked = null;
  renderPreview();
}

/* ---------- structural edits ---------- */

function addMoment() {
  state.model.moments.push(blankMoment());
  rerender();
}

function removeMoment(i) {
  const M = state.model.moments;
  if (M.length <= 1) return;
  M.splice(i, 1);
  M.forEach((mo) => mo.options.forEach((o) => {
    if (o.next === i) o.next = undefined;
    else if (typeof o.next === 'number' && o.next > i) o.next -= 1;
  }));
  rerender();
}

function moveMoment(i, dir) {
  const M = state.model.moments;
  const j = i + dir;
  if (j < 0 || j >= M.length) return;
  [M[i], M[j]] = [M[j], M[i]];
  M.forEach((mo) => mo.options.forEach((o) => {
    if (o.next === i) o.next = j;
    else if (o.next === j) o.next = i;
  }));
  rerender();
}

function addOption(i) {
  state.model.moments[i].options.push(blankOption());
  rerender();
}

function removeOption(i, j) {
  const opts = state.model.moments[i].options;
  if (opts.length <= 1) return;
  opts.splice(j, 1);
  rerender();
}

/* ---------- export / import ---------- */

function buildPack() {
  const m = state.model;
  return {
    id: String(m.id || '').trim() || slug(`${m.role}-${m.level}`),
    role: String(m.role || '').trim(),
    level: String(m.level || '').trim(),
    title: String(m.title || '').trim(),
    length: Number(m.length) || m.moments.length,
    pointsPerMoment: Number(m.pointsPerMoment) || 10,
    moments: m.moments.map((mo) => ({
      skill: String(mo.skill || '').trim(),
      text: String(mo.text || '').trim(),
      options: mo.options.map((o) => {
        const out = {
          text: String(o.text || '').trim(),
          points: Number(o.points)
        };
        if (o.next === null) out.next = null;
        else if (typeof o.next === 'number') out.next = o.next;
        out.feedback = String(o.feedback || '').trim();
        return out;
      })
    }))
  };
}

function manifestEntry() {
  const m = state.model;
  const roleFolder = slug(m.roleId || m.role || 'role');
  const levelFolder = slug(m.level || 'level');
  return {
    id: String(m.id || '').trim() || slug(`${m.role}-${m.level}`),
    role: String(m.role || '').trim(),
    roleId: String(m.roleId || '').trim() || roleFolder,
    level: String(m.level || '').trim(),
    title: String(m.title || '').trim(),
    blurb: String(m.blurb || '').trim(),
    pack: `packs/${roleFolder}/${levelFolder}.json`,
    minutes: Number(m.minutes) || 12,
    skills: m.skills,
    available: true
  };
}

function exportPack() {
  const a = analyze(state.model);
  if (a.errors && !confirm(`This shift has ${a.errors} validation problem${a.errors > 1 ? 's' : ''}. Export anyway?`)) return;

  const pack = buildPack();
  const blob = new Blob([JSON.stringify(pack, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${pack.id || 'shift'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  toast(`Exported ${link.download} → save to ${manifestEntry().pack}`);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

async function copyManifest() {
  const entry = manifestEntry();
  const ok = await copyText(JSON.stringify(entry, null, 2));
  toast(ok ? `Manifest entry copied · pack path ${entry.pack}` : 'Could not copy — select it manually.');
}

function toast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2800);
}

function loadPack(pack, meta = {}) {
  state.model = normalize({
    id: pack.id || meta.id || '',
    role: pack.role || meta.role || '',
    roleId: meta.roleId || '',
    level: pack.level || meta.level || '',
    title: pack.title || meta.title || '',
    blurb: meta.blurb || '',
    minutes: meta.minutes ?? 12,
    skills: Array.isArray(meta.skills) ? meta.skills : [],
    length: pack.length ?? (pack.moments || []).length,
    pointsPerMoment: pack.pointsPerMoment ?? 10,
    moments: pack.moments || []
  });
  rerender();
  saveDraftNow();
}

async function onFile(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    const pack = JSON.parse(await file.text());
    loadPack(pack);
    toast(`Loaded ${file.name}`);
  } catch (err) {
    alert(`Could not read that JSON: ${err.message}`);
  }
}

/* ---------- draft ---------- */

let draftTimer = null;

function saveDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraftNow, 350);
}

function saveDraftNow() {
  clearTimeout(draftTimer);
  try { localStorage.setItem(STORE, JSON.stringify(state.model)); } catch { /* ignore */ }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.moments)) return false;
    state.model = normalize(parsed);
    return true;
  } catch {
    return false;
  }
}

/* ---------- library ---------- */

const API_MANIFEST = '/api/worksim/manifest';

function fetchJson(url) {
  return fetch(url, { cache: 'no-cache' }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

async function loadLibrary() {
  const sel = document.getElementById('library');

  let man = null;
  try {
    man = await fetchJson(API_MANIFEST);
  } catch {
    try {
      man = await fetchJson('../packs/manifest.json');
    } catch {
      sel.innerHTML = '<option value="">Library unavailable</option>';
      return;
    }
  }

  sel._shifts = Array.isArray(man.shifts) ? man.shifts : [];
  sel.innerHTML = '<option value="">Load from library…</option>' + sel._shifts
    .map((s, k) => `<option value="${k}">${esc(s.role)} — ${esc(s.industry || s.level)}${s.available ? '' : ' (soon)'}</option>`)
    .join('');
}

/* ---------- wiring ---------- */

function rerender() {
  state.preview = null;
  renderEditor();
  updateStatus();
  renderPreview();
}

document.addEventListener('input', (event) => {
  const el = event.target.closest('[data-path]');
  if (!el) return;
  if (el.dataset.kind === 'next') return;

  const path = el.dataset.path;
  let value = el.value;
  if (path === 'skills') value = value.split(',').map((s) => s.trim()).filter(Boolean);

  setByPath(state.model, path, value);
  updateStatus();
  saveDraft();
});

document.addEventListener('change', (event) => {
  const el = event.target.closest('select[data-kind="next"]');
  if (!el) return;

  const raw = el.value;
  const next = raw === '' ? undefined : raw === 'end' ? null : Number(raw);
  setByPath(state.model, el.dataset.path, next);
  updateStatus();
  saveDraft();
});

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-act]');
  if (!btn || btn.disabled) return;

  const act = btn.dataset.act;
  const i = Number(btn.dataset.i);
  const j = Number(btn.dataset.j);

  if (act === 'add-moment') return addMoment();
  if (act === 'del-moment') return removeMoment(i);
  if (act === 'up') return moveMoment(i, -1);
  if (act === 'down') return moveMoment(i, 1);
  if (act === 'add-option') return addOption(i);
  if (act === 'del-option') return removeOption(i, j);

  if (act === 'preview') return startPreview();
  if (act === 'pchoose') return previewChoose(j);
  if (act === 'pnext') return previewAdvance();
  if (act === 'prest') return startPreview();
  if (act === 'pclose') { state.preview = null; return renderPreview(); }
});

document.getElementById('btn-new').addEventListener('click', () => {
  if (!confirm('Start a new shift? The current draft will be replaced.')) return;
  state.model = blankModel();
  rerender();
  saveDraftNow();
});

document.getElementById('btn-export').addEventListener('click', exportPack);
document.getElementById('btn-manifest').addEventListener('click', copyManifest);
document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
document.getElementById('file-import').addEventListener('change', onFile);

document.getElementById('library').addEventListener('change', async (event) => {
  const sel = event.target;
  const shift = sel._shifts && sel._shifts[Number(sel.value)];
  sel.value = '';
  if (!shift) return;
  try {
    const url = shift.api
      ? `/api/worksim/pack/${encodeURIComponent(shift.id)}`
      : `../${shift.pack}`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('pack unavailable');
    loadPack(await res.json(), shift);
    toast(`Loaded ${shift.role} — ${shift.level}`);
  } catch (err) {
    alert(`Could not load that pack: ${err.message}`);
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    exportPack();
  }
});

/* ---------- boot ---------- */

if (!loadDraft()) state.model = blankModel();
rerender();
loadLibrary();
