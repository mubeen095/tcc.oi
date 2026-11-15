const crypto = require('crypto');
const { sql, json, readJson } = require('../_db');

const TTL_SECONDS = 5 * 60;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 6;

/* Codes are never stored in plaintext — HMAC with a server-side secret. */
const SECRET = process.env.OTP_SECRET || 'tcc-otp-dev-only-secret';

const IS_PROD = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
const DEV_MODE = process.env.OTP_DEV_MODE === '1' || !IS_PROD;

function hashCode(challengeId, code) {
  return crypto.createHmac('sha256', SECRET).update(`${challengeId}:${code}`).digest('hex');
}

function normalisePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+91' + digits.slice(2);
  return null;
}

function validPhone(phone) {
  return /^\+91[6-9]\d{9}$/.test(phone || '');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

/* Real SMS to Indian numbers needs TRAI DLT registration, so until MSG91 or
   Twilio is configured we deliver the same code by email. The phone number is
   still collected and stored on every lead; only the delivery channel differs. */
function smsReady() {
  return Boolean(
    (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)
  );
}

async function sendEmail(email, code) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const from = process.env.OTP_FROM_EMAIL || 'TCC Prep+ <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${code} is your TCC Prep+ verification code`,
      text: `Your TCC Prep+ verification code is ${code}. It expires in 5 minutes. If you did not request this, ignore this email.`,
      html: `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#111">
  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#666;margin:0 0 10px">TCC Prep+</p>
  <p style="margin:0 0 10px">Your verification code is</p>
  <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;letter-spacing:.28em;font-weight:700;margin:0 0 16px">${code}</p>
  <p style="margin:0;color:#555">It expires in 5 minutes. If you did not request this, you can ignore this email.</p>
</div>`,
    }),
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
  return 'email';
}

async function sendSms(phone, code) {
  const to = phone.replace('+', '');

  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    const url = 'https://control.msg91.com/api/v5/otp?' + new URLSearchParams({
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: to,
      authkey: process.env.MSG91_AUTH_KEY,
    }).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: code }),
    });
    if (!res.ok) throw new Error(`MSG91 responded ${res.status}`);
    return 'msg91';
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_FROM,
        Body: `${code} is your TCC Prep+ verification code. It expires in 5 minutes.`,
      }),
    });
    if (!res.ok) throw new Error(`Twilio responded ${res.status}`);
    return 'twilio';
  }

  return null;
}

async function handleSend(req, res) {
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { error: 'Invalid JSON' }); }

  const phone = normalisePhone(body.phone);
  if (!validPhone(phone)) {
    return json(res, 400, { error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  /* Without SMS configured the code goes to email, so a valid address is
     required up front rather than failing after the challenge is created. */
  if (!smsReady() && !validEmail(email)) {
    return json(res, 400, { error: 'Enter a valid email address so we can send your code.' });
  }

  let recent = [];
  let hourly = [{ n: 0 }];
  try {
    const { rows } = await sql`
      SELECT created_at FROM otp_challenges
      WHERE phone = ${phone} AND created_at > NOW() - INTERVAL '30 seconds'
      LIMIT 1
    `;
    recent = rows;
    const { rows: countRows } = await sql`
      SELECT COUNT(*)::int AS n FROM otp_challenges
      WHERE phone = ${phone} AND created_at > NOW() - INTERVAL '1 hour'
    `;
    hourly = countRows;
  } catch (e) {
    return json(res, 500, { error: 'Verification is temporarily unavailable.' });
  }

  if (recent.length) {
    return json(res, 429, { error: 'Wait a few seconds before requesting another code.' });
  }
  if ((hourly[0] && hourly[0].n) >= MAX_PER_HOUR) {
    return json(res, 429, { error: 'Too many codes requested. Try again in an hour.' });
  }

  const challengeId = crypto.randomUUID();
  const code = String(crypto.randomInt(100000, 1000000));

  try {
    await sql`
      INSERT INTO otp_challenges (id, phone, code_hash, expires_at)
      VALUES (${challengeId}, ${phone}, ${hashCode(challengeId, code)}, NOW() + INTERVAL '5 minutes')
    `;
  } catch (e) {
    return json(res, 500, { error: 'Verification is temporarily unavailable.' });
  }

  let channel = null;
  try {
    channel = await sendSms(phone, code);
    if (!channel) channel = await sendEmail(email, code);
  } catch (e) {
    /* Provider down: drop the challenge so the code can't be brute-forced later. */
    try { await sql`DELETE FROM otp_challenges WHERE id = ${challengeId}`; } catch (_) {}
    return json(res, 502, { error: 'We could not send your code. Try again in a minute.' });
  }

  if (!channel && !DEV_MODE) {
    try { await sql`DELETE FROM otp_challenges WHERE id = ${challengeId}`; } catch (_) {}
    return json(res, 503, { error: 'Verification is not configured yet.' });
  }

  const payload = { challengeId, expiresIn: TTL_SECONDS, resendIn: RESEND_SECONDS };
  if (channel) payload.channel = channel;
  if (!channel && DEV_MODE) payload.devCode = code;
  return json(res, 201, payload);
}

async function handleVerify(req, res) {
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { error: 'Invalid JSON' }); }

  const challengeId = String(body.challenge_id || body.challengeId || '').trim();
  const code = String(body.code || '').replace(/\D/g, '');
  if (!challengeId || code.length !== 6) {
    return json(res, 400, { error: 'Enter the 6-digit code.' });
  }

  let row;
  try {
    const { rows } = await sql`
      SELECT id, phone, code_hash, attempts, verified_at, expires_at
      FROM otp_challenges
      WHERE id = ${challengeId}
    `;
    row = rows[0];
  } catch (e) {
    return json(res, 400, { error: 'That code has expired. Send a new one.' });
  }

  if (!row) return json(res, 400, { error: 'That code has expired. Send a new one.' });
  if (row.verified_at) return json(res, 200, { ok: true });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return json(res, 410, { error: 'That code has expired. Send a new one.' });
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    return json(res, 429, { error: 'Too many attempts. Send a new code.' });
  }

  const expected = Buffer.from(row.code_hash, 'hex');
  const actual = Buffer.from(hashCode(challengeId, code), 'hex');
  const match = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

  if (!match) {
    try {
      await sql`UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ${challengeId}`;
    } catch (e) { /* the 400 below is still the right answer */ }
    return json(res, 400, { error: 'That code is incorrect. Check and try again.' });
  }

  try {
    await sql`UPDATE otp_challenges SET verified_at = NOW() WHERE id = ${challengeId}`;
  } catch (e) {
    return json(res, 500, { error: 'Verification is temporarily unavailable.' });
  }

  return json(res, 200, { ok: true });
}

function guard(handler) {
  return async function (req, res) {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    return handler(req, res);
  };
}

module.exports = { send: guard(handleSend), verify: guard(handleVerify) };
