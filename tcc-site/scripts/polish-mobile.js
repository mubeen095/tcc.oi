#!/usr/bin/env node
/**
 * polish-mobile.js
 * ---------------------------------------------------------------------------
 * Adds a small, self-contained mobile refinement layer to the TCC pages that
 * use the app shell (sidebar + .main-scroll + bottom nav):
 *
 *   · ≥44px tap targets for chips, tabs, category pills and nav items so the
 *     site is comfortable on iOS/Android, not just technically responsive
 *   · tighter, breathable spacing below 480px (the range small phones live in)
 *   · fluid display type that never overflows narrow viewports
 *   · safe-area padding so content clears the home indicator
 *   · momentum scrolling and tap-highlight cleanup for a native feel
 *
 * The block is injected immediately before the page's closing </style>, and a
 * marker comment makes the script idempotent.
 *
 * Run: node scripts/polish-mobile.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const MARK = '/* ── TCC mobile polish (generated) ── */';

const BLOCK = `
      ${MARK}
      @media (max-width: 767px) {
        html { -webkit-text-size-adjust: 100%; }
        main.main-scroll, .sidebar { -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
        * { -webkit-tap-highlight-color: transparent; }

        /* comfortable tap targets */
        .finder-chip { min-height: 44px; display: inline-flex; align-items: center; padding: 11px 18px; font-size: 12.5px; }
        .mode-btn { min-height: 44px; }
        .popular-card { min-height: 60px; justify-content: center; }
        .chip-row { gap: 8px; }
        .bottom-link { min-height: 52px; }
        /* homepage opt-out: video is a full-bleed band; the generated section
           padding must not inset it — this rule is skipped on other pages since
           they lack the #hero-section.hero selector. */
        #hero-section.hero { padding: 0 0 40px; }
        .cat-pill, .c-oth { min-height: 44px; display: inline-flex; align-items: center; }
        .btn, .btn-sm { min-height: 46px; }
        .news-input { min-height: 50px; }

        /* breathe below the fold */
        .section { padding-left: 18px; padding-right: 18px; }
        .eco-inner { padding-left: 18px; padding-right: 18px; }
        .container { padding-left: 0; padding-right: 0; }
        .footer { padding-left: 20px; padding-right: 20px; padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }

        /* fluid display type that cannot overflow */
        .hero-h1, .section-title, .final-title, .a-title, .c-title, .feature-title, .a-cta .ct-t {
          overflow-wrap: anywhere; word-break: break-word;
        }
        .hero-sub, .section-sub, .feature-desc, .post-desc, .a-standfirst { font-size: 15.5px; line-height: 1.68; }

        /* card media stays proportional on narrow screens */
        .post-media { height: 160px; }
        .feature-media { min-height: 210px; }

        /* article measure + code-free reading width */
        .a-body { padding-left: 20px; padding-right: 20px; }
        .a-body p, .a-body li { font-size: 16.5px; line-height: 1.78; }
        .a-phase { gap: 14px; }

        /* grids collapse cleanly rather than squashing */
        .a-stats, .a-flag { grid-template-columns: 1fr; }
        .eco-grid { row-gap: 10px; }
      }

      @media (max-width: 480px) {
        .section { padding-top: 52px; padding-bottom: 52px; }
        .hero, .a-hero, .c-hero { padding-left: 18px; padding-right: 18px; }
        .hero { padding-top: 92px; padding-bottom: 40px; }
        .a-hero { padding-top: 100px; padding-bottom: 40px; }
        .c-hero { padding-top: 96px; padding-bottom: 44px; }

        /* stack the hero search so the button is full-width and thumbable */
        .hero-search { flex-direction: column; align-items: stretch; padding: 8px; gap: 8px; border-radius: 18px; }
        .hero-search-input { width: 100%; padding: 12px 12px; }
        .hero-search-btn { width: 100%; padding: 14px 18px; font-size: 14.5px; border-radius: 12px; }

        /* finder bar stacks the same way */
        .finder-bar { flex-direction: column; align-items: stretch; gap: 10px; }
        .finder-count { text-align: right; }

        /* two-up stats read better than three-up on very narrow screens */
        .hero-stats { gap: 10px; }
        .hero-stat .v { font-size: 26px; }
        .hero-stat .l { font-size: 11.5px; }

        /* footer single column */
        .footer-grid { grid-template-columns: 1fr; gap: 24px; }
        .footer-brand img { height: 116px; }

        /* related/next cards full width */
        .a-related { grid-template-columns: 1fr; }
        .final-ctas { gap: 12px; }
        .final-ctas .btn, .final-ctas .btn-ghost, .a-cta .ct-row .btn { width: 100%; }
        .a-cta .ct-row { flex-direction: column; align-items: stretch; }

        .a-body h2 { font-size: clamp(23px, 7vw, 30px); }
        .a-body h3 { font-size: 18px; }
        .a-quote p { font-size: 19px !important; }
      }

      @media (max-width: 360px) {
        .hero-h1 { font-size: clamp(28px, 9.5vw, 40px); }
        .section-title { font-size: clamp(24px, 8vw, 34px); }
        .finder-chip { padding: 10px 14px; font-size: 12px; }
        .a-body { padding-left: 16px; padding-right: 16px; }
      }

      @supports (padding: max(0px)) {
        @media (max-width: 767px) {
          .bottom-nav { padding-bottom: max(env(safe-area-inset-bottom, 0px), 0px); height: auto; min-height: 52px; }
          .mobile-header { padding-top: env(safe-area-inset-top, 0px); height: auto; min-height: 52px; }
        }
      }
`;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walk(PUBLIC);
let patched = 0;
let skipped = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  /* Only pages that use the app shell need this layer. */
  if (!/class="app-shell/.test(html) && !/main-scroll/.test(html)) { skipped++; continue; }
  if (html.includes(MARK)) { skipped++; continue; }
  const at = html.indexOf('</style>');
  if (at === -1) { skipped++; continue; }
  fs.writeFileSync(file, html.slice(0, at) + BLOCK + '\n    ' + html.slice(at), 'utf8');
  patched++;
}

console.log('Mobile polish added to:', patched, 'pages');
console.log('Skipped (no shell or already patched):', skipped);
