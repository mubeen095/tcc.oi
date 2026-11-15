#!/usr/bin/env node
/**
 * fix-spa-a11y.js
 * ---------------------------------------------------------------------------
 * The /webinars/ and /vybing/ pages are compiled React bundles whose markup is
 * rendered client-side from assets/index-*.js. Their low-contrast text comes
 * from Tailwind utility classes inside assets/index-*.css, which we must not
 * edit directly (it is a build artefact and is overwritten by any rebuild).
 *
 * Instead this script appends a small override stylesheet to the two HTML
 * shells, after the app stylesheet, which:
 *
 *   · lifts text-white/20–/35 (2.5:1–3.7:1) to 0.62 alpha (≈5.4:1)
 *   · lifts text-white/40–/45 and /50–/55 to AA-compliant values
 *   · lifts muted arbitrary-hex labels (#505050, #696969, #5d5d5d)
 *   · makes the skip link visible and usable when focused
 *   · points the skip link at the real #root landmark (it targeted a
 *     non-existent #main-content, which Lighthouse flagged)
 *
 * Idempotent. Run: node scripts/fix-spa-a11y.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const TARGETS = ['webinars/index.html', 'vybing/index.html'];
const MARK = 'id="tcc-a11y-overrides"';

const OVERRIDES = `    <style ${MARK}>
      /* TCC accessibility overrides — lift low-contrast utility text on the
         dark background so the page meets WCAG AA (4.5:1 body, 3:1 large).
         Loaded after the app stylesheet, so these win without touching the bundle. */
      .text-white\\/20, .text-white\\/25, .text-white\\/30, .text-white\\/35 { color: rgba(255, 255, 255, 0.62) !important; }
      .text-white\\/40, .text-white\\/45 { color: rgba(255, 255, 255, 0.72) !important; }
      .text-white\\/50, .text-white\\/55 { color: rgba(255, 255, 255, 0.8) !important; }
      [class*="text-[#505050]"], [class*="text-[#696969]"], [class*="text-[#5d5d5d]"] { color: rgba(255, 255, 255, 0.66) !important; }
      .skip-link:focus { position: fixed; top: 8px; left: 8px; z-index: 100000; background: #fff; color: #050505; padding: 10px 16px; border-radius: 8px; }
    </style>
`;

let patched = 0;

for (const rel of TARGETS) {
  const file = path.join(PUBLIC, rel);
  if (!fs.existsSync(file)) { console.log('missing:', rel); continue; }
  let html = fs.readFileSync(file, 'utf8');

  // 1. skip link must target a real landmark
  html = html.replace(
    /<a href="#main-content" class="skip-link" id="skip-link">/,
    '<a href="#root" class="skip-link" id="skip-link">'
  );

  // 2. inject the override stylesheet once, immediately before </head>
  if (!html.includes(MARK)) {
    const at = html.indexOf('</head>');
    if (at === -1) { console.log('no </head>:', rel); continue; }
    html = html.slice(0, at) + OVERRIDES + html.slice(at);
  }

  fs.writeFileSync(file, html, 'utf8');
  patched++;
}

console.log('SPA a11y overrides applied to:', patched, 'pages');
