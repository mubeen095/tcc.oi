/* ─────────────────────────────────────────────────────────────────────────
   scripts/inject-ga4.mjs

   Wires GA4 into every public page in cookieless mode.

   There is no consent banner on this site, so the choice is made in code:
   analytics_storage stays 'denied' permanently. GA4 still receives page
   views but writes no analytics cookie, and no advertising signals are
   allowed at all. Nothing is stored on the visitor's device for measurement,
   which is why no prompt is needed.

   Also removes the old tcc-consent.js loader from pages that still carry it.

   Idempotent: safe to run on every build.

     node scripts/inject-ga4.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const GA_ID = process.env.GA4_ID || 'G-PW4XP93899';
const MARKER = 'tcc-ga4';

const CONSENT_DEFAULT = `      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
`;

const SNIPPET = `    <!-- ${MARKER}: ${GA_ID} · cookieless -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
${CONSENT_DEFAULT}      gtag('js', new Date());
      gtag('config', '${GA_ID}', { anonymize_ip: true });
    </script>
`;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let added = 0;
let repaired = 0;
let cleaned = 0;
let skipped = 0;

for (const file of walk(PUBLIC)) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  /* Drop the retired consent loader wherever it survives. */
  const before = html;
  html = html.replace(/\s*<script[^>]+src="\/assets\/js\/tcc-consent\.js"[^>]*><\/script>/g, '');
  if (html !== before) cleaned++;

  const hasGa = html.includes(GA_ID) || html.includes('googletagmanager.com/gtag/js');

  if (!hasGa) {
    if (!html.includes('</head>')) {
      skipped++;
      continue;
    }
    html = html.replace('</head>', `${SNIPPET}</head>`);
    added++;
  } else {
    /* Older pages were stripped of the async loader by the consent build.
       Put it back so analytics actually runs. */
    if (!html.includes('googletagmanager.com/gtag/js')) {
      html = html.replace(
        /<!--\s*tcc-ga4[^>]*-->/,
        `<!-- ${MARKER}: ${GA_ID} · cookieless -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>`
      );
      if (!html.includes('googletagmanager.com/gtag/js') && html.includes('</head>')) {
        html = html.replace(
          '</head>',
          `    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n</head>`
        );
      }
      repaired++;
    }

    /* Consent Mode default must be denied, and must say so permanently. */
    html = html.replace(/wait_for_update:\s*\d+,?\s*/g, '');
    if (!html.includes("gtag('consent'")) {
      if (html.includes("gtag('js', new Date())")) {
        html = html.replace("gtag('js', new Date())", `${CONSENT_DEFAULT}      gtag('js', new Date())`);
      } else if (html.includes("gtag('config'")) {
        html = html.replace("gtag('config'", `${CONSENT_DEFAULT}      gtag('config'`);
      }
    }
  }

  if (html === original) {
    skipped++;
  } else {
    fs.writeFileSync(file, html, 'utf8');
  }
}

console.log(
  `GA4 ${GA_ID} (cookieless) — added: ${added} | loader restored: ${repaired} | consent script removed: ${cleaned} | unchanged: ${skipped}`
);