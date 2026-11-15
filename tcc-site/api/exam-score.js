/* ============================================================================
 * POST /api/exam-score
 *
 * Stores a completed company-paper attempt server-side and forwards one row to
 * the Google Sheet bound to google-sheets-exam-appscript.gs.
 *
 * The candidate is identified by the lead_id issued at the signup gate (see
 * api/forms.js, form_type 'exam-lead'). The gate no longer verifies by OTP, so
 * the score is keyed on the lead row itself.
 *
 * Env: SHEETS_URL (Apps Script /exec), SHEETS_SECRET (must match the script).
 * Without SHEETS_URL the attempt is still stored in Postgres and the response
 * reports sheet: 'skipped'.
 * ========================================================================== */
const { sql, json, readJson } = require('./_db');
const { notifySlack } = require('./_notify');

const str = (v, max = 400) => String(v == null ? '' : v).trim().slice(0, max);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

async function forwardToSheet(row) {
  const url = process.env.SHEETS_URL;
  if (!url) return 'skipped';

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...row, secret: process.env.SHEETS_SECRET || '' }),
      signal: ctrl.signal,
    });
    if (!res.ok) return 'failed';
    const data = await res.json().catch(() => ({}));
    return data && data.ok ? 'ok' : 'failed';
  } catch (e) {
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { error: 'Invalid JSON' }); }

  const leadId = Number(body.lead_id);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return json(res, 400, { error: 'lead_id required' });
  }

  /* The attempt must belong to a real lead captured at the gate. */
  let lead;
  try {
    const { rows } = await sql`
      SELECT id, email, payload FROM submissions
      WHERE id = ${leadId} AND form_type = 'exam-lead'
    `;
    lead = rows[0];
  } catch (e) {
    return json(res, 500, { error: 'Could not verify the lead' });
  }
  if (!lead) return json(res, 403, { error: 'Unknown lead' });

  const attempt = Math.max(1, Math.trunc(Number(body.attempt) || 1));
  const profile = lead.payload || {};

  const score = {
    lead_id: leadId,
    attempt,
    company: str(body.company || profile.company, 80),
    paper_year: str(body.paper_year || profile.paper_year, 8),
    apt_pct: num(body.apt_pct),
    tech_pct: num(body.tech_pct),
    code_pct: num(body.code_pct),
    overall_pct: num(body.overall_pct),
    band: str(body.band, 40),
    duration_min: num(body.duration_min),
    page_url: str(body.page_url, 300),
    utm_source: str(body.utm_source, 120),
    utm_medium: str(body.utm_medium, 120),
    utm_campaign: str(body.utm_campaign, 120),
    device: str(body.device, 40),
    submitted_at: new Date().toISOString(),
  };

  /* One row per lead per attempt: a retry updates rather than duplicates. */
  let rowId;
  try {
    const { rows: existing } = await sql`
      SELECT id FROM submissions
      WHERE form_type = 'exam-score'
        AND (payload->>'lead_id')::int = ${leadId}
        AND (payload->>'attempt')::int = ${attempt}
      LIMIT 1
    `;
    if (existing[0]) {
      rowId = existing[0].id;
      await sql`UPDATE submissions SET payload = ${JSON.stringify(score)}::jsonb WHERE id = ${rowId}`;
    } else {
      const { rows } = await sql`
        INSERT INTO submissions (form_type, email, payload)
        VALUES ('exam-score', ${lead.email || null}, ${JSON.stringify(score)}::jsonb)
        RETURNING id
      `;
      rowId = rows[0].id;
    }
  } catch (e) {
    return json(res, 500, { error: 'Could not store the score' });
  }

  const sheet = await forwardToSheet({
    lead_id: leadId,
    attempt,
    name: str(profile.name, 120),
    email: str(profile.email || lead.email, 160),
    phone: str(profile.phone, 20),
    college: str(profile.college, 200),
    study_year: str(profile.study_year, 40),
    ...score,
  });

  notifySlack({
    title: `Paper submitted — ${str(profile.name, 80)} · ${str(score.company, 60)} ${str(score.paper_year, 8)}`,
    fields: {
      lead_id: leadId,
      attempt,
      name: str(profile.name, 120),
      email: str(profile.email || lead.email, 160),
      phone: str(profile.phone, 20),
      college: str(profile.college, 200),
      'study year': str(profile.study_year, 40),
      company: str(score.company, 60),
      year: str(score.paper_year, 8),
      band: str(score.band, 40),
      overall: score.overall_pct != null ? `${score.overall_pct}%` : '',
      aptitude: score.apt_pct != null ? `${score.apt_pct}%` : '',
      technical: score.tech_pct != null ? `${score.tech_pct}%` : '',
      coding: score.code_pct != null ? `${score.code_pct}%` : '',
    },
    url: str(score.page_url, 300),
    utm: {
      source: str(score.utm_source, 120),
      medium: str(score.utm_medium, 120),
      campaign: str(score.utm_campaign, 120),
    },
  }).catch(() => {});

  return json(res, 200, { ok: true, id: rowId, sheet });
};
