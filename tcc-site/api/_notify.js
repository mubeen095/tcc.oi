/* ============================================================================
 * Shared Slack notifier for sales leads.
 *
 * No-op when SLACK_WEBHOOK_URL is unset, so local dev and environments
 * without Slack still work. Never throws: a Slack outage must not fail a lead.
 * ========================================================================== */
const str = (v, max = 300) => String(v == null ? '' : v).trim().slice(0, max);

async function notifySlack(payload) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return 'skipped';

  const lines = [];
  if (payload.title) lines.push(`*${str(payload.title, 120)}*`);
  for (const [k, v] of Object.entries(payload.fields || {})) {
    if (v == null || v === '') continue;
    lines.push(`• *${str(k, 40)}:* ${str(v)}`);
  }
  if (payload.url) lines.push(`• *Page:* ${str(payload.url)}`);
  if (payload.utm && Object.values(payload.utm).some(Boolean)) {
    const utm = Object.entries(payload.utm)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${str(v, 80)}`)
      .join(', ');
    lines.push(`• *UTM:* ${utm}`);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lines.join('\n') }),
      signal: ctrl.signal,
    });
    return res.ok ? 'ok' : 'failed';
  } catch (e) {
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { notifySlack };
