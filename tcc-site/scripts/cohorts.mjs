/* ─────────────────────────────────────────────────────────────────────────
   scripts/cohorts.mjs

   One source of truth for cohort dates, and the copy rendered from it.

   The site must never advertise a cohort that has already started. So the
   build picks the next cohort whose application deadline has not passed, and
   falls back to "dates being confirmed" when there is none. No hardcoded
   dates in page HTML — change data/cohorts.json and rebuild.

   Set COHORT_TODAY=YYYY-MM-DD to preview the site on another date.
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'data', 'cohorts.json');

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function todayISO() {
  if (process.env.COHORT_TODAY) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(process.env.COHORT_TODAY)) {
      throw new Error('COHORT_TODAY must be YYYY-MM-DD');
    }
    return process.env.COHORT_TODAY;
  }
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function loadCohorts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

export function formatDate(iso, style = 'short') {
  const [y, m, d] = String(iso).split('-').map(Number);
  const name = style === 'long' ? LONG[m - 1] : SHORT[m - 1];
  return `${d} ${name} ${y}`;
}

function daysBetween(fromISO, toISO) {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISO}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

/**
 * Resolve what the site should say today.
 *   state 'open'   — applications for `cohort` are still being accepted
 *   state 'closed' — the next cohort starts soon but its applications closed
 *   state 'none'   — no future cohort is on the calendar
 */
export function resolveCohort(data = loadCohorts(), today = todayISO(), opts = {}) {
  const list = [...data.cohorts].sort((a, b) => a.start.localeCompare(b.start));
  const capacity = Number(data.capacity) || 0;

  const open = list.find((c) => c.applyBy >= today && c.start >= today);
  const upcoming = list.find((c) => c.start >= today) || null;
  /* Marketing pages only advertise a cohort you can still join. The enrol
     page needs the next cohort that actually starts, because the person
     reading it has already been accepted. */
  const cohort = opts.includeClosed ? upcoming : open || upcoming;
  const state = !cohort ? 'none' : cohort.applyBy >= today ? 'open' : 'closed';
  const next = cohort ? list.find((c) => c.start > cohort.start) || null : null;

  return { cohort, state, next, capacity, today };
}

export function resolveEnrolment(data = loadCohorts(), today = todayISO()) {
  return resolveCohort(data, today, { includeClosed: true });
}

function seatsLabel(res) {
  const { cohort, capacity, today } = res;
  if (!cohort) return '';
  const fresh =
    cohort.seatsLeft != null &&
    cohort.seatsUpdated &&
    daysBetween(cohort.seatsUpdated, today) >= 0 &&
    daysBetween(cohort.seatsUpdated, today) <= 7;
  if (fresh) return `${cohort.seatsLeft} of ${capacity} seats left`;
  return `${capacity} seats`;
}

function pill(inner, { dark = false, closed = false, center = false } = {}) {
  const cls = [
    'cohort-line',
    dark ? 'on-dark' : '',
    closed ? 'is-closed' : '',
    center ? 'center' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<p class="${cls}"><span class="cl-dot" aria-hidden="true"></span><span>${inner}</span></p>`;
}

/**
 * kind: 'hero' | 'banner' | 'pricing' | 'apply' | 'bootcamps' | 'enrol'
 * dark: the surface sits on a dark media background regardless of theme.
 */
export function renderCohort(kind, res = resolveCohort(), opts = {}) {
  const { cohort: c, state, next, capacity } = res;
  const dark = opts.dark ?? (kind === 'hero' || kind === 'bootcamps');
  const center = opts.center ?? kind === 'pricing';

  if (!c) {
    if (kind === 'banner') return '<span>Next cohort dates are being announced soon</span>';
    if (kind === 'enrol') return pill('Cohort date confirmed on acceptance', {});
    return pill('Next cohort dates are being announced soon', { dark, closed: true, center });
  }

  const start = formatDate(c.start);
  const startLong = formatDate(c.start, 'long');
  const applyBy = formatDate(c.applyBy);
  const nextStart = next ? formatDate(next.start) : '';

  if (kind === 'banner') {
    if (state === 'open') {
      return `<span>${c.label} starts <strong>${start}</strong> &middot; ${seatsLabel(res)} &middot; apply by <strong>${applyBy}</strong></span>`;
    }
    return `<span>${c.label} starts <strong>${start}</strong> &middot; applications closed${nextStart ? ` &middot; next cohort ${nextStart}` : ''}</span>`;
  }

  if (kind === 'pricing') {
    if (state === 'open') {
      return pill(
        `${c.label} &middot; starts <strong>${start}</strong> &middot; ${seatsLabel(res)} &middot; applications close <strong>${applyBy}</strong>`,
        { center }
      );
    }
    return pill(
      `${c.label} starts <strong>${start}</strong> &middot; applications closed${nextStart ? ` &middot; next cohort <strong>${nextStart}</strong>` : ''}`,
      { closed: true, center }
    );
  }

  if (kind === 'apply') {
    if (state === 'open') {
      return pill(
        `Applications open for ${c.label}, starting <strong>${start}</strong> &middot; ${seatsLabel(res)} &middot; closes <strong>${applyBy}</strong>`,
        {}
      );
    }
    return pill(
      `${c.label} starts <strong>${start}</strong> &middot; applications closed${nextStart ? ` &middot; next cohort ${nextStart}` : ''}`,
      { closed: true }
    );
  }

  if (kind === 'enrol') {
    if (state === 'open') {
      return pill(
        `${c.label} starts <strong>${startLong}</strong> &middot; ${seatsLabel(res)} &middot; seats activate within one working day`,
        {}
      );
    }
    return pill(`${c.label} starts <strong>${startLong}</strong>`, {});
  }

  if (kind === 'bootcamps') {
    if (state === 'open') {
      return pill(
        `Next cohort <strong>${start}</strong> &middot; ${seatsLabel(res)}${nextStart ? ` &middot; following cohort ${nextStart}` : ''}`,
        { dark }
      );
    }
    return pill(
      `Next cohort <strong>${start}</strong> &middot; applications closed${nextStart ? ` &middot; following cohort ${nextStart}` : ''}`,
      { dark, closed: true }
    );
  }

  /* hero */
  if (state === 'open') {
    return pill(
      `Next cohort <strong>${start}</strong> &middot; ${seatsLabel(res)} &middot; applications close <strong>${applyBy}</strong>`,
      { dark }
    );
  }
  return pill(
    `${c.label} starts <strong>${start}</strong> &middot; applications closed${nextStart ? ` &middot; next cohort <strong>${nextStart}</strong>` : ''}`,
    { dark, closed: true }
  );
}