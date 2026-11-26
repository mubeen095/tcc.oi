const crypto = require('crypto');
const { sql, json, readJson } = require('./_db');
const { notifySlack } = require('./_notify');

const ALLOWED = ['become-a-member', '100-club-apply', '100-club-contact', 'callback-lead', 'bootcamps', 'gigs', 'gigs-apply', 'gigs-hire', 'contact', 'newsletter', 'prep-plus-lead', 'exam-lead', 'diagnostic', 'placement-plan'];

const NOTIFY_FORMS = new Set(['callback-lead', 'become-a-member', '100-club-apply', 'gigs-apply', 'exam-lead', 'contact', 'diagnostic', 'placement-plan', 'prep-plus-lead']);

/* Hidden inputs a human never fills. Any value in one of these is a bot. */
const HONEYPOTS = ['_hp', 'website', 'company_url'];
/* Field names that are transport metadata, not lead data. */
const INTERNAL = ['form_type', 'sheetId', '_hp', '_t', 'website', 'company_url', 'ip'];
const RATE_WINDOW_MINUTES = 10;
const RATE_MAX = 10;
const MIN_FILL_MS = 1500;

/* Form types that may only be created after a phone challenge was verified.
   The exam gate admits on details alone — the score sheet is the record — so
   exam-lead is deliberately not listed here. */
const VERIFIED = ['prep-plus-lead'];

function normaliseIndianMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return '+91' + digits;
  if (digits.length === 12 && /^91[6-9]\d{9}$/.test(digits)) return '+' + digits;
  return null;
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { error: 'Invalid JSON' }); }

  /* Bots fill every field they can see. Answer 200 so they don't retry. */
  if (HONEYPOTS.some((k) => String(body[k] || '').trim())) {
    return json(res, 200, { ok: true });
  }

  /* A real person needs more than a second to fill a form. */
  const startedAt = Number(body._t || 0);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return json(res, 200, { ok: true });
  }

  const formType = String(body.form_type || body.source || 'contact').trim();
  if (!ALLOWED.includes(formType)) {
    return json(res, 400, { error: 'Unknown form type' });
  }

  /* Prep+ leads only count if the phone was verified through /api/otp. */
  if (VERIFIED.includes(formType)) {
    const challengeId = String(body.challenge_id || '').trim();
    const phone = String(body.verified_phone || body.phone || '').trim();
    if (!challengeId || !phone) {
      return json(res, 400, { error: 'Phone verification required' });
    }
    let verified;
    try {
      const { rows } = await sql`
        SELECT phone FROM otp_challenges
        WHERE id = ${challengeId}
          AND verified_at IS NOT NULL
          AND verified_at > NOW() - INTERVAL '30 minutes'
      `;
      verified = rows[0];
    } catch (e) {
      return json(res, 400, { error: 'Invalid verification' });
    }
    if (!verified || verified.phone !== phone) {
      return json(res, 403, { error: 'Phone not verified' });
    }
  }

  /* The exam gate needs a usable profile, not just a verified number. */
  if (formType === 'exam-lead') {
    const missing = ['name', 'email', 'phone', 'college', 'study_year'].filter(
      (k) => !String(body[k] || '').trim()
    );
    if (missing.length) {
      return json(res, 400, { error: `Missing: ${missing.join(', ')}` });
    }
  }

  if (formType === 'placement-plan') {
    const whatsapp = normaliseIndianMobile(body.whatsapp);
    if (!whatsapp) {
      return json(res, 400, { error: 'Enter a valid 10-digit Indian mobile number.' });
    }
    const missing = ['college', 'graduation_year'].filter(
      (k) => !String(body[k] || '').trim()
    );
    if (missing.length) {
      return json(res, 400, { error: `Missing: ${missing.join(', ')}` });
    }
    if (!/^(19|20)\d{2}$/.test(String(body.graduation_year).trim())) {
      return json(res, 400, { error: 'Enter a 4-digit graduation year.' });
    }
    body.whatsapp = whatsapp;
    body.college = String(body.college).trim();
    body.graduation_year = String(body.graduation_year).trim();
  }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();

  /* Hash the caller's IP so the limiter works across serverless instances
     without ever storing an address. */
  const forwarded = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '')
    .split(',')[0]
    .trim();
  const ipHash = forwarded
    ? crypto.createHash('sha256').update(`tcc|${forwarded}`).digest('hex').slice(0, 32)
    : '';

  if (ipHash) {
    try {
      const { rows } = await sql`
        SELECT COUNT(*)::int AS n FROM submissions
        WHERE payload->>'_ip' = ${ipHash}
          AND created_at > NOW() - make_interval(mins => ${RATE_WINDOW_MINUTES})
      `;
      if ((rows[0] && rows[0].n) >= RATE_MAX) {
        return json(res, 429, { error: 'Too many submissions. Try again in a few minutes.' });
      }
    } catch (e) {
      /* A limiter failure must never cost a real lead. */
    }
  }

  const payload = Object.fromEntries(
    Object.entries(body).filter(([k]) => !INTERNAL.includes(k))
  );
  if (ipHash) payload._ip = ipHash;

  try {
    const { rows } = await sql`
      INSERT INTO submissions (form_type, email, payload)
      VALUES (${formType}, ${email || null}, ${JSON.stringify(payload)}::jsonb)
      RETURNING id, form_type, created_at
    `;
    const id = rows[0].id;

    if (NOTIFY_FORMS.has(formType)) {
      notifySlack({
        title: `New lead — ${formType}`,
        fields: {
          id,
          name: name || payload.name,
          email: email || payload.email,
          phone: payload.phone || payload.verified_phone,
          college: payload.college,
          'study year': payload.study_year,
          company: payload.company || payload.target_company,
          'grad year': payload.graduation_year,
          'preferred time': payload.preferred_time,
          score: payload.score != null ? `${payload.score}/${payload.total}` : '',
          band: payload.band,
          message: payload.message,
          source: payload.source,
        },
        url: payload.page_url || payload.page,
        utm: {
          source: payload.utm_source,
          medium: payload.utm_medium,
          campaign: payload.utm_campaign,
        },
      }).catch(() => {});
    }

    return json(res, 201, { id, form_type: rows[0].form_type, ok: true });
  } catch (e) {
    return json(res, 500, { error: 'Failed to store submission' });
  }
};
