/**
 * The Coding Company — company-paper exam attempts → Google Sheets
 *
 * Target sheet:
 *   https://docs.google.com/spreadsheets/d/1pE1PjMB1pxhztXUQKXi3J58KmRo04yjYbUAw58-xo8g/edit
 *
 * One row per attempt. Retries update the existing row instead of duplicating
 * it, keyed on Lead ID + Attempt. The tab "Exam Attempts" is created on first
 * use.
 *
 * HOW TO DEPLOY
 * 1. Open the spreadsheet above → Extensions → Apps Script.
 * 2. Delete the default Code.gs content and paste this entire file.
 * 3. Set SECRET below to a long random string (same value as SHEETS_SECRET in
 *    Vercel). Do not commit the real secret.
 * 4. Save, then Deploy → New deployment → type "Web app"
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Authorize, then copy the /exec URL.
 * 6. In Vercel → Project → Settings → Environment Variables set:
 *      SHEETS_URL    = the /exec URL
 *      SHEETS_SECRET = the same SECRET string
 * 7. Test: open  <exec-url>?action=ping&secret=<SECRET>  in a browser.
 *    You should see {"ok":true,"sheet":"Exam Attempts"}.
 */

const SHEET_ID = '1pE1PjMB1pxhztXUQKXi3J58KmRo04yjYbUAw58-xo8g';
const SHEET_NAME = 'Exam Attempts';
const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

const HEADERS = [
  'Timestamp (IST)',
  'Lead ID',
  'Name',
  'Email',
  'Phone',
  'College',
  'Year of study',
  'Company',
  'Paper year',
  'Aptitude %',
  'Technical %',
  'Coding %',
  'Overall %',
  'Band',
  'Duration (min)',
  'Attempt',
  'Page URL',
  'UTM source',
  'UTM medium',
  'UTM campaign',
  'Device'
];

function secretOk(value) {
  return String(value || '') === SECRET;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet() {
  const book = SpreadsheetApp.openById(SHEET_ID);
  let tab = book.getSheetByName(SHEET_NAME);
  if (!tab) {
    tab = book.insertSheet(SHEET_NAME);
    tab.appendRow(HEADERS);
    tab.setFrozenRows(1);
  } else if (tab.getLastRow() === 0) {
    tab.appendRow(HEADERS);
    tab.setFrozenRows(1);
  }
  return tab;
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'ping') {
    if (!secretOk(params.secret)) return json({ ok: false, error: 'bad secret' });
    sheet();
    return json({ ok: true, sheet: SHEET_NAME });
  }
  return json({ ok: true, service: 'tcc-exam-attempts' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!secretOk(body.secret)) return json({ ok: false, error: 'bad secret' });

    const leadId = String(body.lead_id || '');
    const attempt = String(body.attempt || '1');
    if (!leadId) return json({ ok: false, error: 'lead_id required' });

    const tab = sheet();
    const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    const row = [
      stamp,
      leadId,
      body.name || '',
      body.email || '',
      body.phone || '',
      body.college || '',
      body.study_year || '',
      body.company || '',
      body.paper_year || '',
      body.apt_pct == null ? '' : body.apt_pct,
      body.tech_pct == null ? '' : body.tech_pct,
      body.code_pct == null ? '' : body.code_pct,
      body.overall_pct == null ? '' : body.overall_pct,
      body.band || '',
      body.duration_min == null ? '' : body.duration_min,
      attempt,
      body.page_url || '',
      body.utm_source || '',
      body.utm_medium || '',
      body.utm_campaign || '',
      body.device || ''
    ];

    /* Idempotent: find Lead ID + Attempt and update that row. */
    const last = tab.getLastRow();
    if (last > 1) {
      const ids = tab.getRange(2, 2, last - 1, 1).getValues();
      const atts = tab.getRange(2, 16, last - 1, 1).getValues();
      for (let i = 0; i < ids.length; i += 1) {
        if (String(ids[i][0]) === leadId && String(atts[i][0]) === attempt) {
          tab.getRange(i + 2, 1, 1, HEADERS.length).setValues([row]);
          return json({ ok: true, updated: true, row: i + 2 });
        }
      }
    }

    tab.appendRow(row);
    return json({ ok: true, appended: true, row: tab.getLastRow() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
