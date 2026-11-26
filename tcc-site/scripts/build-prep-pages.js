/* ============================================================================
 * TCC PREP+ — static page generator
 * ---------------------------------------------------------------------------
 *   node scripts/build-prep-pages.js
 *
 * Reads data/prep.js and emits the whole /prep+/ section onto the TCC site
 * shell (the same sidebar / mobile header / bottom nav / footer that every
 * other page uses). The shell is extracted from /placement/index.html so the
 * two pages can never drift apart.
 *
 * Emitted tree
 *   /prep+/                                  hub
 *   /prep+/aptitude/                         quantitative + reasoning bank index
 *   /prep+/aptitude/<topic>/                 one topic with worked solutions
 *   /prep+/programming/                      language index
 *   /prep+/programming/<lang>/               exercises + hints
 *   /prep+/dsa/                              pattern index
 *   /prep+/dsa/<set>/                        problems with approaches
 *   /prep+/mcq/                              MCQ index
 *   /prep+/mcq/<set>/                        question set
 *   /prep+/companies/                        exam-pattern index (name tiles)
 *   /prep+/companies/<id>/                   one company's rounds + focus
 *   /prep+/interview/                        role-based interview bank index
 *   /prep+/interview/<id>/                   one bank
 *   /prep+/mock-tests/                       timed-test index
 *   /prep+/mock-tests/<id>/                  one timed test (client-side, scored)
 *
 * All content comes from data/prep.js which is original TCC writing.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { withTheme } = require('./theme-tags.cjs');
const P = require('../data/prep.js');
const PAPERS = require('../data/prep-papers.js');
const { buildPaper, companyPapers } = require('../data/prep-assemble.js');

const ROOT = path.join(__dirname, '..', 'public');
const BASE = 'https://thecodingcompany.io';
const SHELL_SRC = path.join(ROOT, 'placement', 'index.html');

/* ── shared shell extracted from the placement page ──────────────────────── */
const shell = fs.readFileSync(SHELL_SRC, 'utf8');

function slice(start, end) {
  const a = shell.indexOf(start);
  const b = shell.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`shell slice failed: ${start}`);
  return shell.slice(a, b);
}

/* The <style> block, the sidebar, the mobile header, the footer, the bottom
   nav and the reveal script — reused verbatim so prep+ is pixel-identical
   in chrome to the rest of the site. */
const SHELL_STYLE = slice('<style>', '</style>\n      <link rel="alternate"');

/* ── helpers ─────────────────────────────────────────────────────────────── */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const escTxt = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DEPTH = { '/prep+/': 1, topic: 2 };

/* Absolute-from-root paths so the same shell markup works at any depth. */
function pathDepth(url) {
  // '/prep+/aptitude/' -> 2 ; '/prep+/' -> 1
  return url.split('/').filter(Boolean).length;
}

function relPrefix(url) {
  const d = pathDepth(url); // 1 => ../  ; 2 => ../../
  return d <= 1 ? '../' : '../'.repeat(d);
}

/* ── per-page shell builder ──────────────────────────────────────────────── */
/* extraCss lets page-specific generators (e.g. the multi-round company-paper
   generator) inject their own rules. Without it any CSS defined outside
   PREP_CSS is silently dropped and the page renders unstyled. */
function page({ url, title, description, keywords, graph, body, extraScript = '', extraCss = '', activeNav = 'prep' }) {
  const p = relPrefix(url);
  const canonical = BASE + url;
  const ld = graph
    ? `<script type="application/ld+json">\n    ${JSON.stringify(graph, null, 2)}\n    </script>`
    : '';

  return withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ''}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="The Coding Company (TCC)" />
    <meta property="og:image" content="/vs-ig-posts-youtube-thumbnail.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <link rel="icon" type="image/x-icon" href="${p}favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="${p}assets/img/tcc-favicon-32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="${p}assets/img/tcc-favicon-96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="${p}assets/img/tcc-apple-touch.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap" />
    ${ld}
    ${SHELL_STYLE}${PREP_CSS}${extraCss}
    </style>
    <link rel="alternate" type="text/plain" title="TCC facts for AI assistants (llms.txt)" href="/llms.txt" />
    <link rel="alternate" type="application/json" title="TCC structured facts (llms.json)" href="/llms.json" />
  </head>
  <body>
    <a class="skip-link" href="#prep-main">Skip to content</a>
    <div class="app-shell baseline-root" id="app">
      <aside class="sidebar">
        <a href="/" class="brand-serif sidebar-brand">thecodingcompany</a>
        <nav class="sidebar-nav" aria-label="Primary">
${SIDEBAR_LINKS(activeNav)}
        </nav>
        <div class="sidebar-bottom">
          <a href="/webinars" class="sidebar-webinars"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none"/></svg>Webinars</a>
          <a href="/login" class="btn-login">Member Login</a>
        </div>
      </aside>

      <main class="main-scroll" id="prep-main">
        <header class="mobile-header">
          <a href="/" class="brand-serif mobile-brand">thecodingcompany</a>
          <div class="mobile-actions">
            <a href="/login" class="mobile-login" aria-label="Login"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" stroke-linecap="round"/></svg></a>
            <button class="mobile-cta" type="button" onclick="window.location.href='/prep+/'">Prep+</button>
          </div>
        </header>
${body}
${FOOTER}
      </main>
${BOTTOM_NAV}
    </div>

${REVEAL_SCRIPT}
${extraScript}
  </body>
</html>
`);
}

/* ── sidebar / footer / bottom nav (mirror the placement page exactly) ───── */
const NAV_ITEMS = [
  { href: '/', key: 'home', label: 'Home', icon: '<path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" stroke-linecap="round" stroke-linejoin="round"/>' },
  { href: '/bootcamps', key: 'bootcamps', label: 'CERT+', icon: '<path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5-4.6-1.3-8-4.5-8-9.5V6l8-3.5z" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4.5" stroke-linecap="round" stroke-linejoin="round"/>' },
  { href: '/placement', key: 'placement', label: 'Placement', icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" stroke-linecap="round"/>' },
  { href: '/100-club', key: 'club', label: '100 Club', icon: '<path d="M8 21h8m-4-5v5M12 4a5 5 0 0 1 5 5c0 2.1-1.3 3.9-3 4.7V16H10v-2.3c-1.7-.8-3-2.6-3-4.7a5 5 0 0 1 5-5z" stroke-linecap="round" stroke-linejoin="round"/>' },
  { href: '/domains', key: 'domains', label: 'Domains', icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
  { href: '/roadmaps/', key: 'roadmaps', label: 'Roadmaps', icon: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke-linecap="round" stroke-linejoin="round"/>' },
];

const SIDEBAR_LINKS = (active) =>
  NAV_ITEMS.map(
    (n) =>
      `          <a href="${n.href}" class="sidebar-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">${n.icon}</svg><span class="label">${n.label}</span></a>`
  ).join('\n');

const FOOTER = `          <footer class="footer">
            <div class="footer-brand">
              <img src="ASSET_PREFIXassets/img/tcc-logo.png" alt="The Coding Company" />
            </div>
            <div class="footer-grid">
              <div class="footer-col">
                <h3>Certifications</h3>
                <a href="/bootcamps#catalog">All Certifications</a><a href="/bootcamps#catalog">Foundation</a><a href="/bootcamps#catalog">Practitioner</a><a href="/bootcamps#catalog">Strategist</a><a href="/bootcamps#catalog">Executive</a><a href="/bootcamps#catalog">By Industry</a>
              </div>
              <div class="footer-col">
                <h3>Prepare</h3>
                <a href="/prep+/aptitude/">Aptitude</a><a href="/prep+/programming/">Programming</a><a href="/prep+/dsa/">DSA</a><a href="/prep+/mcq/">Technical MCQs</a><a href="/prep+/companies/">Company Papers</a><a href="/prep+/mock-tests/">Mock Tests</a>
              </div>
              <div class="footer-col">
                <h3>Careers</h3>
                <a href="/placement/">Placement Program</a><a href="/ai-courses-for/">AI Courses by Role</a><a href="/bootcamps/">CERT+ Catalog</a><a href="/webinars">Webinars</a><a href="/100-club">100 Club</a>
              <a href="/worksim/">WorkSim (pilot)</a></div>
              <div class="footer-col">
                <h3>Guides</h3>
                <a href="/blog/how-to-get-ai-internship-2026.html">Get an AI Internship</a><a href="/blog/ai-placement-programs.html">AI Placement Programs</a><a href="/blog/role-based-ai-certifications-vs-generic.html">Role-Based Certifications</a><a href="/blog/">All Guides</a>
              </div>
              <div class="footer-col">
                <h3>Company</h3>
                <a href="/login">Login</a><a href="/domains">Domains</a><a href="/placement#gigs">Gigs</a><a href="/terms-of-service">Terms of use</a><a href="/privacy-policy">Privacy Policy</a><a href="/refund-policy">Refund Policy</a>
              </div>
            </div>
            <div class="footer-bottom">
              <p>&copy; <span id="year">2026</span> The Coding Company · Prep+</p>
              <a href="/privacy-policy">Privacy · Terms</a>
            </div>
          </footer>`;

const BOTTOM_NAV = `      <nav class="bottom-nav" aria-label="Bottom">
        <div class="bottom-nav-inner">
          <a href="/" class="bottom-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Home</span></a>
          <a href="/bootcamps" class="bottom-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5-4.6-1.3-8-4.5-8-9.5V6l8-3.5z" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>CERT+</span></a>
          <a href="/placement" class="bottom-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" stroke-linecap="round"/></svg><span>Placement</span></a>
          <a href="/100-club" class="bottom-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 21h8m-4-5v5M12 4a5 5 0 0 1 5 5c0 2.1-1.3 3.9-3 4.7V16H10v-2.3c-1.7-.8-3-2.6-3-4.7a5 5 0 0 1 5-5z" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Club</span></a>
          <a href="/roadmaps/" class="bottom-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Roadmaps</span></a>
        </div>
      </nav>`;

const REVEAL_SCRIPT = `    <script>
      /* Footer year */
      var __y = document.getElementById('year');
      if (__y) __y.textContent = new Date().getFullYear();

      /* Scroll reveal — same IntersectionObserver pattern used sitewide,
         with a scroll/resize fallback for the nested .main-scroll container. */
      (function () {
        var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
        if (!items.length) return;
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el) { io.observe(el); });
        function fallback() {
          var h = window.innerHeight || document.documentElement.clientHeight;
          items.forEach(function (el) {
            if (el.classList.contains('in')) return;
            var r = el.getBoundingClientRect();
            if (r.top < h - 40) el.classList.add('in');
          });
        }
        window.addEventListener('scroll', fallback, { passive: true });
        window.addEventListener('resize', fallback);
        setTimeout(fallback, 120);
      })();
    </script>`;

/* ── prep+ specific CSS (appended inside the shared <style>) ─────────────── */
const PREP_CSS = `
      /* ═══ TCC PREP+ ═══ */
      .skip-link { position: absolute; left: -999px; top: 0; z-index: 2000; background: #fff; color: #000; padding: 10px 16px; border-radius: 0 0 10px 0; font-weight: 600; }
      .skip-link:focus { left: 0; }
      .prep-hero { position: relative; padding: 128px 24px 56px; overflow: hidden; background: radial-gradient(120% 120% at 50% 0%, rgba(0,100,255,0.14) 0%, rgba(0,0,0,0) 62%); }
      @media (min-width: 768px) { .prep-hero { padding: 150px 40px 72px; } }
      .prep-hero-in { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; }
      .prep-hero .grid-bg { position: absolute; inset: 0; z-index: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 75%); -webkit-mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 75%); }
      .prep-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 9px 20px; margin-bottom: 26px; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.7); }
      .prep-pill .dot { width: 8px; height: 8px; border-radius: 999px; background: #0064FF; animation: pulse 1.6s ease-in-out infinite; }
      .prep-h1 { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-weight: 800; letter-spacing: -0.045em; line-height: 1.04; font-size: clamp(36px, 5.6vw, 72px); color: #fff; max-width: 20em; }
      .prep-h1 .accent { font-family: 'Newsreader', Georgia, serif; font-style: italic; font-weight: 400; letter-spacing: -0.02em; }
      .prep-sub { margin-top: 22px; color: rgba(255,255,255,0.58); font-size: clamp(16px, 1.7vw, 19px); max-width: 60em; line-height: 1.65; }
      .prep-ctas { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; margin-top: 32px; }
      @media (min-width: 640px) { .prep-ctas { flex-direction: row; flex-wrap: wrap; } }
      .prep-crumbs { max-width: 1400px; margin: 0 auto; padding: 96px 24px 0; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      @media (min-width: 768px) { .prep-crumbs { padding: 110px 40px 0; } }
      .prep-crumbs a:hover { color: #fff; }
      .prep-crumbs .sep { opacity: 0.4; }

      .prep-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 40px; }
      @media (min-width: 700px) { .prep-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1100px) { .prep-grid { grid-template-columns: repeat(3, 1fr); } }
      .prep-card { display: flex; flex-direction: column; gap: 12px; padding: 28px 26px; position: relative; }
      .prep-card .pc-eyebrow { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); }
      .prep-card .pc-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }
      .prep-card .pc-desc { color: rgba(255,255,255,0.56); font-size: 14.5px; line-height: 1.65; }
      .prep-card .pc-meta { margin-top: auto; padding-top: 10px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #7fb4ff; }
      a.prep-card:hover { border-color: rgba(127,180,255,0.5); background: rgba(255,255,255,0.06); }

      .prep-list { display: grid; gap: 14px; margin-top: 36px; }
      .prep-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px 16px; padding: 22px 26px; }
      .prep-row .pr-name { font-weight: 700; font-size: 17px; color: #fff; letter-spacing: -0.01em; }
      .prep-row .pr-note { color: rgba(255,255,255,0.56); font-size: 14.5px; line-height: 1.6; flex: 1 1 320px; }
      .prep-row .pr-link { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: #7fb4ff; white-space: nowrap; }
      .prep-row:hover { border-color: rgba(127,180,255,0.45); }

      .tag { display: inline-block; font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.16); color: rgba(255,255,255,0.66); }
      .tag.high { border-color: rgba(0,100,255,0.5); color: #7fb4ff; }
      .tag.med { border-color: rgba(255,255,255,0.2); }
      .tag.easy { border-color: rgba(63,220,140,0.45); color: #6fe0a4; }
      .tag.hard { border-color: rgba(255,120,120,0.45); color: #ff9a9a; }

      .qa { display: grid; gap: 16px; margin-top: 34px; max-width: 960px; }
      .qa-item { padding: 26px 28px; }
      .qa-q { font-size: 17px; font-weight: 700; color: #fff; line-height: 1.5; letter-spacing: -0.01em; display: flex; gap: 12px; }
      .qa-q .qn { font-family: 'DM Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4); flex-shrink: 0; padding-top: 3px; }
      .qa-opts { list-style: none; display: grid; grid-template-columns: 1fr; gap: 8px; margin: 16px 0 0 30px; }
      @media (min-width: 640px) { .qa-opts { grid-template-columns: repeat(2, 1fr); } }
      .qa-opts li { color: rgba(255,255,255,0.68); font-size: 15px; padding: 8px 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; }
      .qa-opts li.correct { border-color: rgba(63,220,140,0.5); color: #9ff0c4; background: rgba(63,220,140,0.06); }
      .qa-opts li .ol { font-family: 'DM Mono', monospace; color: rgba(255,255,255,0.4); margin-right: 8px; }
      .qa-explain { margin-top: 16px; margin-left: 30px; padding: 16px 18px; border-left: 2px solid rgba(0,100,255,0.5); background: rgba(0,100,255,0.06); border-radius: 0 12px 12px 0; color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; }
      .qa-explain strong { color: #fff; }
      .qa-answer { margin-top: 16px; margin-left: 30px; color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; }
      .qa-answer .lbl { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.42); display: block; margin-bottom: 6px; }
      .qa-hint { margin-top: 12px; margin-left: 30px; color: rgba(255,255,255,0.56); font-size: 14.5px; }
      .qa-hint .lbl { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.42); display: block; margin-bottom: 6px; }
      .concept-list { margin-top: 24px; display: grid; gap: 10px; max-width: 900px; list-style: none; }
      .concept-list li { padding-left: 26px; position: relative; color: rgba(255,255,255,0.62); font-size: 15.5px; line-height: 1.6; }
      .concept-list li::before { content: ""; position: absolute; left: 4px; top: 9px; width: 6px; height: 6px; border-radius: 999px; background: #7fb4ff; }

      .tile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 34px; }
      .tile { padding: 22px 20px; text-align: center; border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; background: rgba(255,255,255,0.03); font-weight: 700; font-size: 16px; letter-spacing: -0.01em; color: #fff; transition: all 0.3s; }
      .tile:hover { border-color: rgba(127,180,255,0.5); background: rgba(255,255,255,0.06); }
      .tile .t-sector { display: block; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.42); margin-top: 6px; font-weight: 400; }

      /* ── company logo-card grid ── */
      .logo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; margin-top: 34px; }
      .logo-card { position: relative; display: flex; flex-direction: column; gap: 14px; padding: 22px; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; background: rgba(255,255,255,0.03); transition: transform 0.25s, border-color 0.25s, background 0.25s; }
      .logo-card:hover { transform: translateY(-4px); border-color: rgba(127,180,255,0.45); background: rgba(255,255,255,0.055); }
      .logo-tile { display: flex; align-items: center; justify-content: center; height: 74px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
      .logo-word { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-weight: 800; letter-spacing: 0.02em; font-size: 22px; line-height: 1; }
      .logo-tile img { max-height: 42px; max-width: 82%; object-fit: contain; }
      .logo-name { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
      .logo-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .logo-meta .lm { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px 9px; }
      .logo-card .go { margin-top: auto; font-size: 13.5px; color: rgba(255,255,255,0.72); display: inline-flex; align-items: center; gap: 6px; }
      .logo-card:hover .go { color: #fff; }

      /* ── year papers ── */
      .year-row { display: grid; gap: 12px; margin-top: 26px; }
      .year-card { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 18px 20px; border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; background: rgba(255,255,255,0.03); transition: border-color 0.2s, background 0.2s; }
      .year-card:hover { border-color: rgba(127,180,255,0.45); background: rgba(255,255,255,0.055); }
      .year-card .yc-y { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: 30px; line-height: 1; color: #fff; min-width: 92px; }
      .year-card .yc-info { flex: 1 1 240px; }
      .year-card .yc-info .t { font-size: 15px; color: #fff; font-weight: 600; }
      .year-card .yc-info .s { font-size: 13px; color: rgba(255,255,255,0.62); margin-top: 3px; }
      .year-card .yc-go { font-size: 13.5px; font-weight: 600; color: #fff; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 9px 18px; }
      .year-card:hover .yc-go { background: #fff; color: #000; }

      .pd-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 14px; }
      .pd-table th, .pd-table td { text-align: left; padding: 11px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.82); }
      .pd-table th { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      .ref-list { display: grid; gap: 12px; margin-top: 24px; }
      .ref-item { padding: 16px 18px; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; background: rgba(255,255,255,0.03); }
      .ref-item .rb { font-size: 15px; font-weight: 700; color: #fff; }
      .ref-item .rw { font-size: 13.5px; color: rgba(255,255,255,0.66); margin-top: 4px; }
      .ref-item .rn { font-size: 12.5px; color: rgba(255,255,255,0.5); margin-top: 6px; }
      .ref-item a { color: #9cc4ff; font-size: 13.5px; }
      .sec-collapse { margin-top: 18px; }

      .rounds { list-style: none; display: grid; gap: 10px; margin-top: 22px; max-width: 900px; }
      .rounds li { display: flex; gap: 14px; align-items: flex-start; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.72); font-size: 15px; }
      .rounds li .rn { font-family: 'DM Mono', monospace; font-size: 12px; color: #7fb4ff; flex-shrink: 0; }
      .fact-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 30px; }
      .fact { padding: 20px 22px; }
      .fact .fk { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
      .fact .fv { color: rgba(255,255,255,0.78); font-size: 15px; line-height: 1.6; }

      .cta-band { margin-top: 56px; padding: 40px 32px; border: 1px solid rgba(0,100,255,0.3); border-radius: 22px; background: linear-gradient(180deg, rgba(0,87,222,0.1), rgba(0,0,0,0)); text-align: center; }
      .cta-band h2 { font-family: 'Newsreader', Georgia, serif; font-weight: 400; font-size: clamp(26px, 3.6vw, 40px); letter-spacing: -0.02em; color: #fff; }
      .cta-band p { color: rgba(255,255,255,0.58); margin-top: 12px; font-size: 16px; }
      .cta-band .cta-row { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 26px; }

      /* ── mock test player ── */
      .mt-wrap { max-width: 960px; }
      .mt-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 18px 22px; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; background: rgba(255,255,255,0.04); margin-top: 30px; position: sticky; top: 0; z-index: 40; backdrop-filter: blur(12px); }
      .mt-timer { font-family: 'DM Mono', monospace; font-size: 20px; color: #7fb4ff; letter-spacing: 0.06em; }
      .mt-progress { font-size: 14px; color: rgba(255,255,255,0.6); }
      .mt-q { padding: 26px 28px; margin-top: 18px; }
      .mt-opts { list-style: none; display: grid; gap: 10px; margin-top: 18px; }
      .mt-opt { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: all 0.2s; min-height: 48px; }
      .mt-opt:hover { border-color: rgba(127,180,255,0.5); background: rgba(255,255,255,0.04); }
      .mt-opt input { accent-color: #0064FF; width: 18px; height: 18px; }
      .mt-opt .ok { color: rgba(255,255,255,0.82); }
      .mt-opt.correct { border-color: rgba(63,220,140,0.6); background: rgba(63,220,140,0.08); }
      .mt-opt.wrong { border-color: rgba(255,120,120,0.6); background: rgba(255,120,120,0.07); }
      .mt-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
      .mt-result { margin-top: 26px; padding: 30px 28px; }
      .mt-score { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: clamp(40px, 7vw, 64px); line-height: 1; color: #fff; }
      .mt-review { margin-top: 22px; display: grid; gap: 12px; }
      .mt-note { margin-top: 18px; color: rgba(255,255,255,0.5); font-size: 13.5px; }
      .mt-empty { color: rgba(255,255,255,0.6); margin-top: 24px; }

      .prep-meta-strip { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
      .prep-meta-strip .m { display: flex; flex-direction: column; gap: 3px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; background: rgba(255,255,255,0.03); min-width: 110px; }
      .prep-meta-strip .m .k { font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      .prep-meta-strip .m .v { font-weight: 600; font-size: 15px; color: #fff; }

      .nav-siblings { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 40px; }
      .nav-siblings a { font-size: 13.5px; padding: 10px 16px; border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; color: rgba(255,255,255,0.68); }
      .nav-siblings a:hover { border-color: rgba(127,180,255,0.6); color: #fff; }
      .nav-siblings a.on { border-color: rgba(127,180,255,0.6); color: #fff; background: rgba(0,100,255,0.1); }

      .disclaimer { margin-top: 34px; padding: 18px 22px; border: 1px dashed rgba(255,255,255,0.14); border-radius: 14px; color: rgba(255,255,255,0.5); font-size: 13.5px; line-height: 1.7; max-width: 900px; }

      /* Contrast-safe overrides for the shared shell's low-alpha greys. */
      .prep-hero + .section .section-sub,
      .section .section-sub { color: rgba(255,255,255,0.62); }
      .prep-sub { color: rgba(255,255,255,0.62); }
      .prep-sub, .section-sub, .pc-desc, .pr-note, .qa-answer, .qa-hint, .fact .fv { color: rgba(255,255,255,0.66); }

      /* ── Prep+ mobile refinements ── */
      @media (max-width: 767px) {
        .prep-hero { padding-left: 18px; padding-right: 18px; }
        .prep-card, .prep-row, .qa-item, .mt-q, .mt-result, .fact { padding: 22px 20px; }
        .qa-q { font-size: 16px; }
        .qa-opts, .qa-explain, .qa-answer, .qa-hint { margin-left: 0; }
        .qa-q .qn { padding-top: 2px; }
        .prep-row .pr-link { width: 100%; }
        .prep-crumbs { padding-left: 18px; padding-right: 18px; }
        .mt-bar { position: static; }
        .mt-actions .btn, .mt-actions .btn-sm { width: 100%; }
        .prep-ctas .btn { width: 100%; }
        .nav-siblings a { min-height: 44px; display: inline-flex; align-items: center; }
        .prep-grid { gap: 14px; }
      }
      @media (max-width: 480px) {
        .prep-h1 { font-size: clamp(30px, 9vw, 44px); }
        .prep-hero { padding-top: 100px; padding-bottom: 40px; }
        .mt-timer { font-size: 18px; }
        .qa-opts { grid-template-columns: 1fr; }
        .tile-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
      }
`;

/* Asset prefix substitution in the footer logo. */
function withAssets(html, url) {
  return html.replace(/ASSET_PREFIX/g, relPrefix(url));
}

/* ── brand-safe company mark ─────────────────────────────────────────────── */
/* Renders either a real logo file (when the rights-holder supplies one) or a
   typographic wordmark tile. No third-party trademark artwork ships by default. */
function logoMark(id, name) {
  const logo = PAPERS.COMPANY_LOGO[id] || { mark: name.slice(0, 5).toUpperCase(), tint: '#7fb4ff' };
  if (logo.file) {
    return `<span class="logo-tile"><img src="ASSET_PREFIX${esc(logo.file)}" alt="${esc(name)} logo" loading="lazy" width="160" height="42" /></span>`;
  }
  return `<span class="logo-tile"><span class="logo-word" style="color:${esc(logo.tint)}">${esc(logo.mark)}</span></span>`;
}

/* ── shared JSON-LD builders ─────────────────────────────────────────────── */
function breadcrumb(url, trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: BASE + t.href,
    })),
  };
}

function webPage(url, title, desc, extra = []) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url: BASE + url,
        name: title,
        description: desc,
        inLanguage: 'en',
        isPartOf: { '@id': `${BASE}/#website` },
        publisher: { '@type': 'Organization', name: 'The Coding Company', url: BASE },
      },
      ...extra,
    ],
  };
}

/* ── CTA band reused at the bottom of most pages ─────────────────────────── */
function ctaBand() {
  return `      <section class="section">
        <div class="container">
          <div class="cta-band reveal">
            <h2>Practise here. Get placed there.</h2>
            <p>Prep+ is unlimited practice. When you are ready to turn it into an offer, TCC Placement Partner handles portfolio, resume and interviews.</p>
            <div class="cta-row">
              <a class="btn" href="/placement/">See the placement program</a>
              <a class="btn btn-ghost" href="/bootcamps/">Explore CERT+ certifications</a>
            </div>
          </div>
        </div>
      </section>`;
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  INDEX / HUB PAGE
 * ──────────────────────────────────────────────────────────────────────── */
function hubPage() {
  const url = '/prep+/';
  const title = 'TCC Prep+ | Interview & Placement Preparation — Aptitude, DSA, Mock Tests';
  const desc =
    'Interview and placement preparation from The Coding Company: aptitude and reasoning banks with worked solutions, programming drills, DSA patterns, technical MCQs, company exam patterns and timed mock tests.';

  const faqs = [
    {
      q: 'What is TCC Prep+?',
      a: 'Prep+ is The Coding Company\\u2019s interview and placement preparation library. It covers aptitude and reasoning, programming exercises, data structures and algorithms, technical multiple-choice questions, company exam patterns and timed mock tests — all with worked solutions rather than answer keys alone.',
    },
    {
      q: 'Do I need to pay for TCC Prep+?',
      a: 'Every question, exercise and mock test on Prep+ is included while you prepare. Placement support and certifications are separate paid products.',
    },
    {
      q: 'Does Prep+ replace the TCC Placement Program?',
      a: 'No. Prep+ prepares you for the test and the interview; TCC Placement Partner handles the portfolio, resume, mock interviews and employer connections that turn preparation into an offer. They complement each other.',
    },
    {
      q: 'Which companies does Prep+ cover exam patterns for?',
      a: 'Prep+ documents round structure, syllabus focus, duration and eligibility for major IT services, product and consulting employers including TCS NQT, Infosys, Wipro, Cognizant, Accenture, Zoho, Amazon, Deloitte, HCLTech and IBM. Pattern pages are descriptive and use plain name tiles, not company logos.',
    },
    {
      q: 'Who writes the Prep+ questions?',
      a: 'Every question and explanation on Prep+ is original The Coding Company writing. The underlying mathematics and logic are common property, but the wording, numbers, options and explanations are ours.',
    },
  ];

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [{ name: 'Home', href: '/' }, { name: 'Prep+', href: '/prep+/' }]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'ItemList',
      name: 'TCC Prep+ preparation tracks',
      numberOfItems: P.PREP_PILLARS.length,
      itemListElement: P.PREP_PILLARS.map((pl, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: pl.name,
        url: BASE + pl.href,
      })),
    },
  ]);

  const cards = P.PREP_PILLARS.map(
    (pl, i) => `            <a class="prep-card card reveal" href="${pl.href}">
              <span class="pc-eyebrow">Track ${String(i + 1).padStart(2, '0')}</span>
              <span class="pc-title">${esc(pl.name)}</span>
              <span class="pc-desc">${esc(pl.desc)}</span>
              <span class="pc-meta">${esc(pl.tagline)}</span>
            </a>`
  ).join('\n');

  const stats = [
    { v: String(P.PREP_TOPICS.length), l: 'Aptitude & reasoning topics with worked solutions' },
    { v: String(P.PREP_LANGS.length), l: 'Programming languages with hands-on drills' },
    { v: String(P.PREP_DSA.reduce((n, s) => n + s.problems.length, 0)), l: 'DSA problems organised by pattern' },
    { v: String(P.PREP_MCQ.reduce((n, s) => n + s.questions.length, 0)), l: 'Technical MCQ concept checks' },
    { v: String(require('../data/companies-full.js').COMPANIES.length), l: 'Companies with year-wise practice papers' },
    { v: String(require('../data/companies-full.js').COMPANIES.length * require('../data/prep-papers-v2.js').YEARS.length), l: 'Timed multi-round company papers' },
    { v: String(P.PREP_MOCK_TESTS.length), l: 'General timed mock tests' },
  ];

  const body = `        <div class="content-wrap">
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill"><span class="dot"></span> TCC Prep+ · Practice</div>
              <h1 class="prep-h1">Clear the round. <span class="accent">Then the next one.</span></h1>
              <p class="prep-sub">Aptitude, coding, DSA and technical rounds &mdash; plus 213 timed company papers built on real hiring patterns.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/mock-tests/">Take a timed mock test</a>
                <a class="btn btn-ghost" href="/prep+/aptitude/">Start with aptitude</a>
              </div>
            </div>
          </section>

          <section class="section" style="padding-top:20px;padding-bottom:48px">
            <div class="container">
              <div class="stat-grid">
${stats
  .map(
    (s) =>
      `                <div class="card stat-card reveal"><div class="stat-value">${esc(s.v)}</div><div class="stat-label">${esc(s.l)}</div></div>`
  )
  .join('\n')}
              </div>
            </div>
          </section>

          <section class="section band">
            <div class="container">
              <div class="eyebrow reveal" style="margin-bottom:16px">Preparation tracks</div>
              <h2 class="section-title reveal" style="margin-bottom:10px">Six tracks. One goal: the offer.</h2>
              <p class="section-sub reveal">Work through them in order, or jump to the one that is costing you the most marks. Every track links back to the others so you can move between concept, practice and test.</p>
              <div class="prep-grid">
${cards}
              </div>
            </div>
          </section>

          <section class="section">
            <div class="container">
              <div class="eyebrow reveal" style="margin-bottom:16px">How to use Prep+</div>
              <h2 class="section-title reveal" style="margin-bottom:10px">Practise, diagnose, repeat</h2>
              <div class="steps-grid">
                <div class="card step-card reveal"><div class="step-num">01</div><div class="step-title">Sit a mock test</div><div class="step-desc">Start with a timed paper to get a baseline and see where the marks actually go.</div></div>
                <div class="card step-card reveal"><div class="step-num">02</div><div class="step-title">Read the topic</div><div class="step-desc">Open the topics behind your weakest sections and work the solutions, not just the answers.</div></div>
                <div class="card step-card reveal"><div class="step-num">03</div><div class="step-title">Drill the pattern</div><div class="step-desc">Programming and DSA pages give you the exercise and a hint — write the code before reading on.</div></div>
                <div class="card step-card reveal"><div class="step-num">04</div><div class="step-title">Target the company</div><div class="step-desc">Read that employer\\u2019s round structure and weight your revision to what it actually tests.</div></div>
              </div>
            </div>
          </section>

          <section class="section band">
            <div class="container">
              <div class="eyebrow reveal" style="margin-bottom:16px">FAQ</div>
              <h2 class="section-title reveal" style="margin-bottom:10px">Prep+ questions, answered</h2>
              <div class="faq">
${faqs
  .map(
    (f) =>
      `                <div class="card faq-item reveal"><h3>${esc(f.q)}</h3><p>${escTxt(f.a)}</p></div>`
  )
  .join('\n')}
              </div>
            </div>
          </section>

${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  APTITUDE — index + topic pages
 * ──────────────────────────────────────────────────────────────────────── */
const GROUP_LABEL = {
  quantitative: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
  data: 'Data Interpretation',
};

function aptitudeIndex() {
  const url = '/prep+/aptitude/';
  const title = 'Aptitude & Reasoning Practice with Worked Solutions | TCC Prep+';
  const desc =
    'Quantitative aptitude, logical reasoning, data interpretation and verbal ability — topic by topic, every question with a full worked solution. Practice from The Coding Company Prep+.';

  const groups = ['quantitative', 'logical', 'verbal', 'data'];
  const sections = groups
    .map((g) => {
      const topics = P.PREP_TOPICS.filter((t) => t.group === g);
      if (!topics.length) return '';
      return `            <h2 class="section-title reveal" style="margin-top:56px;font-size:clamp(24px,3vw,34px)">${esc(GROUP_LABEL[g])}</h2>
              <div class="prep-list">
${topics
  .map(
    (t) => `                <a class="prep-row card reveal" href="/prep+/aptitude/${t.id}/">
                  <span class="pr-name">${esc(t.name)}</span>
                  <span class="tag ${t.weight === 'high' ? 'high' : 'med'}">${t.weight === 'high' ? 'High weight' : 'Medium weight'}</span>
                  <span class="pr-note">${esc(t.summary)}</span>
                  <span class="pr-link">${t.questions.length} solved →</span>
                </a>`
  )
  .join('\n')}
              </div>`;
    })
    .join('\n');

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Aptitude', href: '/prep+/aptitude/' },
    ]),
    {
      '@type': 'ItemList',
      name: 'Aptitude and reasoning topics',
      numberOfItems: P.PREP_TOPICS.length,
      itemListElement: P.PREP_TOPICS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: BASE + `/prep+/aptitude/${t.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Aptitude</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Aptitude &amp; reasoning, <span class="accent">solved properly.</span></h1>
              <p class="prep-sub">The first gate in almost every campus and off-campus process. Each topic below gives you the concepts that matter and a bank of questions with full worked solutions — so you learn the method, not just the answer.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/mock-tests/aptitude-full/">Take the 30-minute aptitude paper</a>
                <a class="btn btn-ghost" href="/prep+/companies/">See company papers</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
${sections}
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function topicPage(t) {
  const url = `/prep+/aptitude/${t.id}/`;
  const title = `${t.name} Questions with Solutions | Aptitude Practice | TCC Prep+`;
  const desc = `${t.summary} ${t.questions.length} worked questions with full explanations. Aptitude practice from The Coding Company Prep+.`;

  const siblings = P.PREP_TOPICS.filter((x) => x.group === t.group && x.id !== t.id);

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Aptitude', href: '/prep+/aptitude/' },
      { name: t.name, href: url },
    ]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: t.questions.slice(0, 4).map((q) => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${q.options[q.answer]} — ${q.explain}`,
        },
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/aptitude/">Aptitude</a><span class="sep">/</span><span>${esc(t.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">${esc(GROUP_LABEL[t.group])}</div>
              <h1 class="prep-h1">${esc(t.name)}</h1>
              <p class="prep-sub">${esc(t.summary)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Questions</span><span class="v">${t.questions.length} solved</span></div>
                <div class="m"><span class="k">Weight</span><span class="v">${t.weight === 'high' ? 'High' : 'Medium'}</span></div>
                <div class="m"><span class="k">Group</span><span class="v">${esc(GROUP_LABEL[t.group])}</span></div>
              </div>
            </div>
          </section>

          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">What to know first</h2>
              <p class="section-sub reveal">Cover these concepts before attempting the questions below. Skipping this step is why candidates plateau.</p>
              <ul class="concept-list reveal">
${t.concepts.map((c) => `                <li>${esc(c)}</li>`).join('\n')}
              </ul>
            </div>
          </section>

          <section class="section band">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">${t.questions.length} questions with full solutions</h2>
              <p class="section-sub reveal">The correct option is highlighted. Read the explanation even when you get it right — the method is the point.</p>
              <div class="qa">
${t.questions
  .map(
    (q, qi) => `                <div class="card qa-item reveal">
                  <div class="qa-q"><span class="qn">${String(qi + 1).padStart(2, '0')}</span><span>${esc(q.q)}</span></div>
                  <ol class="qa-opts">
${q.options
  .map(
    (o, oi) =>
      `                    <li class="${oi === q.answer ? 'correct' : ''}"><span class="ol">${'ABCD'[oi]}.</span>${esc(o)}</li>`
  )
  .join('\n')}
                  </ol>
                  <div class="qa-explain"><strong>Solution.</strong> ${esc(q.explain)}</div>
                </div>`
  )
  .join('\n')}
              </div>
              <div class="disclaimer">Solution answers are worked values. Where a decimal result is not one of the options, the closest listed option is marked correct; the explanation gives the exact figure.</div>
            </div>
          </section>

          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">More ${esc(GROUP_LABEL[t.group].toLowerCase())}</h2>
              <div class="nav-siblings reveal">
                <a href="/prep+/aptitude/" class="on">All topics</a>
${siblings.map((s) => `                <a href="/prep+/aptitude/${s.id}/">${esc(s.name)}</a>`).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  PROGRAMMING — index + language pages
 * ──────────────────────────────────────────────────────────────────────── */
function programmingIndex() {
  const url = '/prep+/programming/';
  const title = 'Programming Practice for Interviews — Python, Java, SQL, JS, C/C++ | TCC Prep+';
  const desc =
    'Hands-on programming exercises in the languages interviews actually use: Python, Java, SQL, JavaScript and C/C++. Each exercise comes with a prompt and a hint. From TCC Prep+.';

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Programming', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'Programming languages',
      numberOfItems: P.PREP_LANGS.length,
      itemListElement: P.PREP_LANGS.map((l, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: l.name,
        url: BASE + `/prep+/programming/${l.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Programming</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Coding rounds, <span class="accent">practised by language.</span></h1>
              <p class="prep-sub">Every exercise gives you the prompt and a hint, not a copy-paste answer. Write the code, then compare your approach with the intent behind the problem.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/programming/python/">Start with Python</a>
                <a class="btn btn-ghost" href="/prep+/dsa/">Go to DSA patterns</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Choose a language</h2>
              <div class="prep-grid">
${P.PREP_LANGS.map(
  (l) => `                <a class="prep-card card reveal" href="/prep+/programming/${l.id}/">
                  <span class="pc-eyebrow">${l.exercises.length} exercises</span>
                  <span class="pc-title">${esc(l.name)}</span>
                  <span class="pc-desc">${esc(l.blurb)}</span>
                  <span class="pc-meta">Practise →</span>
                </a>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function langPage(l) {
  const url = `/prep+/programming/${l.id}/`;
  const title = `${l.name} Interview Coding Practice — Exercises & Hints | TCC Prep+`;
  const desc = `${l.blurb} ${l.exercises.length} practical ${l.name} exercises with hints. Coding practice from The Coding Company Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Programming', href: '/prep+/programming/' },
      { name: l.name, href: url },
    ]),
    {
      '@type': 'ItemList',
      name: `${l.name} interview exercises`,
      numberOfItems: l.exercises.length,
      itemListElement: l.exercises.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.title,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/programming/">Programming</a><span class="sep">/</span><span>${esc(l.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">Programming</div>
              <h1 class="prep-h1">${esc(l.name)} coding practice</h1>
              <p class="prep-sub">${esc(l.blurb)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Exercises</span><span class="v">${l.exercises.length}</span></div>
                <div class="m"><span class="k">Format</span><span class="v">Prompt + hint</span></div>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">${l.exercises.length} exercises</h2>
              <p class="section-sub reveal">Try each one before reading the hint. If you finish without using the hint, move on; if the hint is not enough, work the neighbouring DSA pattern.</p>
              <div class="qa">
${l.exercises
  .map(
    (e, i) => `                <div class="card qa-item reveal">
                  <div class="qa-q"><span class="qn">${String(i + 1).padStart(2, '0')}</span><span>${esc(e.title)}</span></div>
                  <div class="qa-answer"><span class="lbl">Task</span>${esc(e.prompt)}</div>
                  <div class="qa-hint"><span class="lbl">Hint</span>${esc(e.hint)}</div>
                </div>`
  )
  .join('\n')}
              </div>
              <div class="nav-siblings reveal">
                <a href="/prep+/programming/" class="on">All languages</a>
${P.PREP_LANGS.filter((x) => x.id !== l.id)
  .map((x) => `                <a href="/prep+/programming/${x.id}/">${esc(x.name)}</a>`)
  .join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  DSA — index + set pages
 * ──────────────────────────────────────────────────────────────────────── */
function dsaIndex() {
  const url = '/prep+/dsa/';
  const title = 'DSA Practice by Pattern — Arrays, Trees, Graphs, DP | TCC Prep+';
  const desc =
    'Data structures and algorithms practice structured by pattern: arrays and hashing, two pointers and sliding window, trees and graphs, and dynamic programming. Approaches explained, from TCC Prep+.';

  const total = P.PREP_DSA.reduce((n, s) => n + s.problems.length, 0);

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'DSA', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'DSA patterns',
      numberOfItems: P.PREP_DSA.length,
      itemListElement: P.PREP_DSA.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.name,
        url: BASE + `/prep+/dsa/${s.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>DSA</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Data structures &amp; algorithms, <span class="accent">by pattern.</span></h1>
              <p class="prep-sub">${total} problems sequenced so each pattern builds on the last. Every problem names the pattern, states the approach and gives you the complexity — the way a strong interview answer is structured.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/dsa/arrays-hashing/">Start at the foundation</a>
                <a class="btn btn-ghost" href="/prep+/mcq/">Technical MCQs</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Patterns</h2>
              <div class="prep-grid">
${P.PREP_DSA.map(
  (s) => `                <a class="prep-card card reveal" href="/prep+/dsa/${s.id}/">
                  <span class="pc-eyebrow">${s.problems.length} problems</span>
                  <span class="pc-title">${esc(s.name)}</span>
                  <span class="pc-desc">${esc(s.blurb)}</span>
                  <span class="pc-meta">Practise →</span>
                </a>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function dsaSetPage(s) {
  const url = `/prep+/dsa/${s.id}/`;
  const title = `${s.name} — DSA Problems with Approaches | TCC Prep+`;
  const desc = `${s.blurb} ${s.problems.length} problems with the pattern, approach and complexity. DSA practice from The Coding Company Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'DSA', href: '/prep+/dsa/' },
      { name: s.name, href: url },
    ]),
    {
      '@type': 'ItemList',
      name: `${s.name} problems`,
      numberOfItems: s.problems.length,
      itemListElement: s.problems.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
      })),
    },
  ]);

  const diffClass = (d) => (d === 'Easy' ? 'easy' : d === 'Hard' ? 'hard' : 'med');

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/dsa/">DSA</a><span class="sep">/</span><span>${esc(s.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">DSA Pattern</div>
              <h1 class="prep-h1">${esc(s.name)}</h1>
              <p class="prep-sub">${esc(s.blurb)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Problems</span><span class="v">${s.problems.length}</span></div>
                <div class="m"><span class="k">Focus</span><span class="v">Pattern + approach</span></div>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">${s.problems.length} problems</h2>
              <p class="section-sub reveal">Attempt each problem before reading the approach. In the interview, state the pattern and complexity out loud first — that is what earns the marks.</p>
              <div class="qa">
${s.problems
  .map(
    (p, i) => `                <div class="card qa-item reveal">
                  <div class="qa-q"><span class="qn">${String(i + 1).padStart(2, '0')}</span><span>${esc(p.title)}</span><span class="tag ${diffClass(p.difficulty)}">${esc(p.difficulty)}</span><span class="tag">${esc(p.tag)}</span></div>
                  <div class="qa-answer"><span class="lbl">Problem</span>${esc(p.prompt)}</div>
                  <div class="qa-explain"><strong>Approach.</strong> ${esc(p.approach)}</div>
                </div>`
  )
  .join('\n')}
              </div>
              <div class="nav-siblings reveal">
                <a href="/prep+/dsa/" class="on">All patterns</a>
${P.PREP_DSA.filter((x) => x.id !== s.id)
  .map((x) => `                <a href="/prep+/dsa/${x.id}/">${esc(x.name)}</a>`)
  .join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  MCQ — index + set pages
 * ──────────────────────────────────────────────────────────────────────── */
function mcqIndex() {
  const url = '/prep+/mcq/';
  const title = 'Technical MCQs — DBMS, OS, OOP, Networking & AI | TCC Prep+';
  const desc =
    'Concept checks across CS fundamentals and AI: DBMS, operating systems, OOP and design, computer networks and machine-learning fundamentals, each answer explained. From TCC Prep+.';

  const total = P.PREP_MCQ.reduce((n, s) => n + s.questions.length, 0);

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Technical MCQs', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'Technical MCQ sets',
      numberOfItems: P.PREP_MCQ.length,
      itemListElement: P.PREP_MCQ.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.name,
        url: BASE + `/prep+/mcq/${s.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Technical MCQs</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">The theory rounds <span class="accent">most people skip.</span></h1>
              <p class="prep-sub">${total} concept questions across DBMS, operating systems, OOP and design, computer networks and AI fundamentals — the subjects service-company and product-company technical rounds keep returning to.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/mcq/dbms/">Start with DBMS</a>
                <a class="btn btn-ghost" href="/prep+/mock-tests/technical-core/">Take the technical paper</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Subject sets</h2>
              <div class="prep-grid">
${P.PREP_MCQ.map(
  (s) => `                <a class="prep-card card reveal" href="/prep+/mcq/${s.id}/">
                  <span class="pc-eyebrow">${s.questions.length} questions</span>
                  <span class="pc-title">${esc(s.name)}</span>
                  <span class="pc-desc">${esc(s.blurb)}</span>
                  <span class="pc-meta">Practise →</span>
                </a>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function mcqSetPage(s) {
  const url = `/prep+/mcq/${s.id}/`;
  const title = `${s.name} MCQs with Answers & Explanations | TCC Prep+`;
  const desc = `${s.blurb} ${s.questions.length} multiple-choice questions, every answer explained. Technical MCQ practice from The Coding Company Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Technical MCQs', href: '/prep+/mcq/' },
      { name: s.name, href: url },
    ]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: s.questions.map((q) => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: `${q.options[q.answer]}. ${q.explain}` },
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/mcq/">Technical MCQs</a><span class="sep">/</span><span>${esc(s.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">Technical MCQ</div>
              <h1 class="prep-h1">${esc(s.name)}</h1>
              <p class="prep-sub">${esc(s.blurb)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Questions</span><span class="v">${s.questions.length}</span></div>
                <div class="m"><span class="k">Format</span><span class="v">MCQ + explanation</span></div>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">${s.questions.length} questions</h2>
              <p class="section-sub reveal">Answer each one before scrolling to the solution. The explanation names the mechanism, not just the choice.</p>
              <div class="qa">
${s.questions
  .map(
    (q, qi) => `                <div class="card qa-item reveal">
                  <div class="qa-q"><span class="qn">${String(qi + 1).padStart(2, '0')}</span><span>${esc(q.q)}</span></div>
                  <ol class="qa-opts">
${q.options
  .map(
    (o, oi) =>
      `                    <li class="${oi === q.answer ? 'correct' : ''}"><span class="ol">${'ABCD'[oi]}.</span>${esc(o)}</li>`
  )
  .join('\n')}
                  </ol>
                  <div class="qa-explain"><strong>Answer.</strong> ${esc(q.explain)}</div>
                </div>`
  )
  .join('\n')}
              </div>
              <div class="nav-siblings reveal">
                <a href="/prep+/mcq/" class="on">All sets</a>
${P.PREP_MCQ.filter((x) => x.id !== s.id)
  .map((x) => `                <a href="/prep+/mcq/${x.id}/">${esc(x.name)}</a>`)
  .join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  COMPANIES — index (name tiles) + pattern pages
 * ──────────────────────────────────────────────────────────────────────── */
function companiesIndex() {
  const url = '/prep+/companies/';
  const title = 'Company Paper Practice — TCS, Infosys, Amazon & More | TCC Prep+';
  const desc =
    'Pick a company, read its hiring structure, then sit a year-wise practice paper against the clock: aptitude, reasoning, verbal and coding sections, auto-scored with a full review. From TCC Prep+.';

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Company Papers', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'Company exam patterns',
      numberOfItems: P.PREP_COMPANIES.length,
      itemListElement: P.PREP_COMPANIES.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        url: BASE + `/prep+/companies/${c.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Company Papers</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Pick a company. <span class="accent">Sit its paper.</span></h1>
              <p class="prep-sub">Every employer weights its rounds differently. Choose a company to see its hiring structure, then open a year-wise paper and take it against the clock — auto-scored, with a full review of every answer.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/companies/tcs-nqt/2026/">Sit the TCS NQT 2026 paper</a>
                <a class="btn btn-ghost" href="/prep+/mock-tests/">Browse all mock tests</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Choose your company</h2>
              <p class="section-sub reveal">Each card opens the company&rsquo;s exam pattern and its year-wise practice papers. Tiles show a typographic wordmark, not company artwork — these pages are unaffiliated study guides.</p>
              <div class="logo-grid">
${P.PREP_COMPANIES.map((c) => {
  const plan = PAPERS.COMPANY_PAPERS[c.id];
  const years = plan ? plan.years : [];
  return `                <a class="logo-card reveal" href="/prep+/companies/${c.id}/">
                  ${logoMark(c.id, c.name)}
                  <span class="logo-name">${esc(c.name)}</span>
                  <span class="logo-meta"><span class="lm">${esc(c.sector)}</span><span class="lm">${years.length} ${years.length === 1 ? 'paper' : 'papers'}</span></span>
                  <span class="go">Open pattern &amp; papers &rarr;</span>
                </a>`;
}).join('\n')}
              </div>
              <div class="disclaimer">These are unaffiliated study guides. Company hiring tests are not public documents, so the papers here are original TCC questions written to each employer&rsquo;s publicly described pattern — not transcribed company material. No company logo or trademark is used. Patterns change at any time; always confirm details with the employer.</div>
            </div>
          </section>
          <section class="section band">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Official past papers</h2>
              <p class="section-sub reveal">Private employers do not publish their hiring tests, but government recruitment bodies do publish their own past papers publicly. If you are preparing for a public-sector exam alongside campus placements, start from the source.</p>
              <div class="ref-list">
${PAPERS.REFERENCE_PAPERS.map(
  (r) => `                <div class="ref-item reveal">
                  <div class="rb">${esc(r.body)}</div>
                  <div class="rw">${esc(r.what)}</div>
                  <div class="rn">${esc(r.note)} <a href="${esc(r.url)}" target="_blank" rel="noopener nofollow">Open official source &rarr;</a></div>
                </div>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function companyPage(c) {
  const url = `/prep+/companies/${c.id}/`;
  const title = `${c.name} Exam Pattern & Hiring Rounds | TCC Prep+`;
  const desc = `${c.name} hiring pattern: rounds, duration, eligibility and focus topics. ${c.focus}`.slice(0, 300);

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Company Papers', href: '/prep+/companies/' },
      { name: c.name, href: url },
    ]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is the ${c.name} exam pattern?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${c.name} typically runs these rounds: ${c.rounds.join(', ')}. ${c.duration}.`,
          },
        },
        {
          '@type': 'Question',
          name: `What topics should I focus on for ${c.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${c.focus} The highest-weight topics are ${c.topics.join(', ')}.`,
          },
        },
        {
          '@type': 'Question',
          name: `What is the eligibility for ${c.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: c.eligibility },
        },
      ],
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/companies/">Company Papers</a><span class="sep">/</span><span>${esc(c.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">${esc(c.sector)}</div>
              ${logoMark(c.id, c.name)}
              <h1 class="prep-h1">${esc(c.name)} exam pattern</h1>
              <p class="prep-sub">${esc(c.focus)}</p>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Rounds</h2>
              <ul class="rounds reveal">
${c.rounds.map((r, i) => `                <li><span class="rn">${String(i + 1).padStart(2, '0')}</span><span>${esc(r)}</span></li>`).join('\n')}
              </ul>
              <div class="fact-row">
                <div class="card fact reveal"><div class="fk">Duration</div><div class="fv">${esc(c.duration)}</div></div>
                <div class="card fact reveal"><div class="fk">Eligibility</div><div class="fv">${esc(c.eligibility)}</div></div>
              </div>
            </div>
          </section>
          <section class="section band">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Where the marks are</h2>
              <p class="section-sub reveal">${esc(c.focus)}</p>
              <h3 class="reveal" style="font-size:18px;font-weight:700;margin-top:30px;color:#fff">High-weight topics</h3>
              <div class="nav-siblings reveal">
${c.topics.map((t) => `                <span class="tag high" style="padding:9px 16px">${esc(t)}</span>`).join('\n')}
              </div>
              <div class="qa-explain" style="margin-top:34px"><strong>Tip.</strong> ${esc(c.tip)}</div>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Year-wise practice papers</h2>
              <p class="section-sub reveal">Each paper follows ${esc(c.name)}&rsquo;s section split and is scored in your browser. Papers differ year to year, so you can sit several without repeating the same questions.</p>
              <div class="year-row">
${(() => {
  const papers = companyPapers(c.id);
  if (!papers.length) {
    return `                <div class="year-card reveal"><span class="yc-info"><span class="t">Papers coming soon</span><span class="s">No timed paper is published for ${esc(c.name)} yet.</span></span><a class="yc-go" href="/prep+/mock-tests/">Try a general paper</a></div>`;
  }
  return papers
    .map(
      (p) => `                <a class="year-card reveal" href="/prep+/companies/${c.id}/${p.year}/">
                  <span class="yc-y">${p.year}</span>
                  <span class="yc-info">
                    <span class="t">${p.total} questions &middot; ${p.minutes} minutes</span>
                    <span class="s">${p.sections.map((s) => s.name + ' (' + s.questions.length + ')').join(' · ')}</span>
                  </span>
                  <span class="yc-go">Start paper</span>
                </a>`
    )
    .join('\n');
})()}
              </div>
              <div class="disclaimer">These papers are original TCC questions written to ${esc(c.name)}&rsquo;s publicly described pattern. They are not transcribed from ${esc(c.name)} test material and are not endorsed by ${esc(c.name)}.</div>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Prepare the topics</h2>
              <div class="nav-siblings reveal">
                <a href="/prep+/aptitude/">Aptitude topics</a>
${c.topics
  .filter((t) => P.PREP_TOPICS.some((x) => x.name === t))
  .map((t) => {
    const tp = P.PREP_TOPICS.find((x) => x.name === t);
    return `                <a href="/prep+/aptitude/${tp.id}/">${esc(tp.name)}</a>`;
  })
  .join('\n')}
                <a href="/prep+/mock-tests/">Mock tests</a>
              </div>
              <div class="disclaimer">This page describes publicly known hiring structures for study purposes. It is not affiliated with, endorsed by, or sponsored by ${esc(c.name)}. Patterns change — confirm details with the employer.</div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  COMPANY YEAR PAPER — timed, section-wise test player
 * ──────────────────────────────────────────────────────────────────────── */
function companyPaperPage(paper) {
  const c = P.PREP_COMPANIES.find((x) => x.id === paper.companyId);
  const url = `/prep+/companies/${paper.companyId}/${paper.year}/`;
  const title = `${c.name} ${paper.year} Practice Paper — ${paper.total} Questions, ${paper.minutes} Min | TCC Prep+`;
  const desc = `Sit a ${c.name}-pattern paper for ${paper.year}: ${paper.total} questions across ${paper.sections.map((s) => s.name).join(', ')}, timed at ${paper.minutes} minutes and auto-scored with a full answer review.`;
  const papers = companyPapers(paper.companyId);

  // Flatten sections into a single ordered question list, tagged with section.
  const data = [];
  paper.sections.forEach((s) => {
    s.questions.forEach((q) => {
      data.push({ s: s.name, q: q.q, o: q.options, a: q.answer, e: q.explain });
    });
  });

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Company Papers', href: '/prep+/companies/' },
      { name: c.name, href: `/prep+/companies/${c.id}/` },
      { name: `${paper.year} paper`, href: url },
    ]),
    {
      '@type': 'Quiz',
      name: `${c.name} ${paper.year} practice paper`,
      about: paper.sections.map((s) => s.name).join(', '),
      educationalLevel: 'Professional',
      numberOfQuestions: data.length,
      timeRequired: `PT${paper.minutes}M`,
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: 'The Coding Company', url: BASE },
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/companies/">Company Papers</a><span class="sep">/</span><a href="/prep+/companies/${c.id}/">${esc(c.name)}</a><span class="sep">/</span><span>${paper.year}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">${esc(c.name)} &middot; ${paper.year} pattern</div>
              <h1 class="prep-h1">${esc(c.name)} ${paper.year} paper</h1>
              <p class="prep-sub">${paper.total} questions across ${paper.sections.map((s) => esc(s.name)).join(', ')} — the same section split ${esc(c.name)} uses, timed at ${paper.minutes} minutes and scored in your browser.</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Time</span><span class="v">${paper.minutes} min</span></div>
                <div class="m"><span class="k">Questions</span><span class="v">${data.length}</span></div>
                <div class="m"><span class="k">Sections</span><span class="v">${paper.sections.length}</span></div>
              </div>
              <div class="prep-ctas">
                <a class="btn" href="#mt">Go to the paper</a>
                <a class="btn btn-ghost" href="/prep+/companies/${c.id}/">${esc(c.name)} exam pattern</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Paper structure</h2>
              <p class="section-sub reveal">This is the section breakdown you will sit. The timer covers the whole paper.</p>
              <table class="pd-table reveal">
                <thead><tr><th>Section</th><th>Questions</th><th>Suggested time</th></tr></thead>
                <tbody>
${paper.sections.map((s) => `                  <tr><td>${esc(s.name)}</td><td>${s.questions.length}</td><td>${s.minutes} min</td></tr>`).join('\n')}
                  <tr><td><strong>Total</strong></td><td><strong>${data.length}</strong></td><td><strong>${paper.minutes} min</strong></td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="section" style="padding-top:8px">
            <div class="container mt-wrap" id="mt" data-minutes="${paper.minutes}">
              <div class="mt-bar">
                <span class="mt-timer" id="mt-clock">${String(paper.minutes).padStart(2, '0')}:00</span>
                <span class="mt-progress" id="mt-progress">Question 1 of ${data.length}</span>
                <button class="btn btn-sm" type="button" id="mt-start">Start paper</button>
              </div>
              <div id="mt-body"></div>
              <div class="mt-result card" id="mt-result" hidden></div>
              <p class="mt-note">Scored in your browser with a per-question review. No account needed. Refreshing restarts the paper.</p>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Other years</h2>
              <div class="nav-siblings reveal">
                <a href="/prep+/companies/${c.id}/" class="on">${esc(c.name)} pattern</a>
${papers
  .filter((p) => p.year !== paper.year)
  .map((p) => `                <a href="/prep+/companies/${c.id}/${p.year}/">${p.year} paper (${p.total}q)</a>`)
  .join('\n')}
                <a href="/prep+/companies/">All companies</a>
              </div>
              <div class="disclaimer">Original TCC questions written to ${esc(c.name)}&rsquo;s publicly described pattern. Not transcribed company material. Unaffiliated with ${esc(c.name)}; no logo or trademark used.</div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  const extraScript = `    <script>
      (function () {
        var QUESTIONS = ${JSON.stringify(data)};
        var root = document.getElementById('mt');
        if (!root || !QUESTIONS.length) return;
        var MINUTES = parseInt(root.getAttribute('data-minutes'), 10) || 30;
        var clock = document.getElementById('mt-clock');
        var progress = document.getElementById('mt-progress');
        var body = document.getElementById('mt-body');
        var resultEl = document.getElementById('mt-result');
        var startBtn = document.getElementById('mt-start');

        var idx = 0;
        var answers = new Array(QUESTIONS.length).fill(null);
        var started = false;
        var remaining = MINUTES * 60;
        var timer = null;

        function fmt(s) {
          var m = Math.floor(s / 60), x = s % 60;
          return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
        }
        function esc(s) {
          return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function renderQuestion() {
          var q = QUESTIONS[idx];
          progress.textContent = 'Q' + (idx + 1) + '/' + QUESTIONS.length + ' · ' + q.s;
          var html = '<div class="card mt-q"><div class="qa-q"><span class="qn">' +
            String(idx + 1).padStart(2, '0') + '</span><span>' + esc(q.q) + '</span><span class="tag easy" style="white-space:nowrap">' + esc(q.s) + '</span></div><ul class="mt-opts">';
          q.o.forEach(function (opt, oi) {
            var sel = answers[idx] === oi ? ' checked' : '';
            html += '<li class="mt-opt"><label style="display:flex;gap:12px;align-items:center;width:100%;cursor:pointer">' +
              '<input type="radio" name="mt-opt" value="' + oi + '"' + sel + ' /><span class="ok">' +
              esc(String.fromCharCode(65 + oi)) + '. ' + esc(opt) + '</span></label></li>';
          });
          html += '</ul><div class="mt-actions">' +
            '<button class="btn btn-ghost btn-sm" type="button" id="mt-prev"' + (idx === 0 ? ' disabled' : '') + '>Previous</button>' +
            '<button class="btn btn-sm" type="button" id="mt-next">' + (idx === QUESTIONS.length - 1 ? 'Review &amp; submit' : 'Next') + '</button>' +
            '</div></div>';
          body.innerHTML = html;
          body.querySelectorAll('input[name="mt-opt"]').forEach(function (r) {
            r.addEventListener('change', function () { answers[idx] = parseInt(r.value, 10); });
          });
          var prev = document.getElementById('mt-prev');
          var next = document.getElementById('mt-next');
          if (prev) prev.addEventListener('click', function () { if (idx > 0) { idx--; renderQuestion(); } });
          next.addEventListener('click', function () {
            if (idx < QUESTIONS.length - 1) { idx++; renderQuestion(); }
            else { finish(false); }
          });
        }

        function tick() {
          remaining--;
          if (remaining <= 0) { remaining = 0; clock.textContent = fmt(0); finish(true); return; }
          clock.textContent = fmt(remaining);
        }

        function finish(expired) {
          if (timer) clearInterval(timer);
          started = false;
          body.innerHTML = '';
          startBtn.hidden = true;
          var correct = 0;
          var bySection = {};
          var review = '';
          QUESTIONS.forEach(function (q, i) {
            var ok = answers[i] === q.a;
            if (ok) correct++;
            if (!bySection[q.s]) bySection[q.s] = { c: 0, t: 0 };
            bySection[q.s].t++;
            if (ok) bySection[q.s].c++;
            var opts = q.o.map(function (opt, oi) {
              var cls = oi === q.a ? ' correct' : (answers[i] === oi ? ' wrong' : '');
              return '<li style="list-style:none"><span class="' + cls + '" style="display:block;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:10px">' +
                String.fromCharCode(65 + oi) + '. ' + esc(opt) + (oi === q.a ? '  ✓' : '') + '</span></li>';
            }).join('');
            review += '<div class="card qa-item"><div class="qa-q"><span class="qn">' +
              String(i + 1).padStart(2, '0') + '</span><span>' + esc(q.q) + '</span>' +
              (ok ? '<span class="tag easy">Correct</span>' : '<span class="tag hard">Missed</span>') +
              '</div><ul style="margin-top:12px;display:grid;gap:6px">' + opts +
              '</ul><div class="qa-explain"><strong>Why.</strong> ' + esc(q.e) + '</div></div>';
          });
          var pct = Math.round((correct / QUESTIONS.length) * 100);
          var sectionRows = Object.keys(bySection).map(function (k) {
            return '<tr><td>' + esc(k) + '</td><td>' + bySection[k].c + ' / ' + bySection[k].t + '</td></tr>';
          }).join('');
          resultEl.hidden = false;
          resultEl.innerHTML = '<div class="mt-score">' + correct + ' / ' + QUESTIONS.length + '</div>' +
            '<p style="color:rgba(255,255,255,0.66);margin-top:10px">' + pct + '% · ' + esc('${c.name}') + ' ${paper.year} pattern' +
            (expired ? ' · time expired' : '') + '. Section split below, then every answer is reviewed.</p>' +
            '<table class="pd-table"><thead><tr><th>Section</th><th>Score</th></tr></thead><tbody>' + sectionRows + '</tbody></table>' +
            '<div class="mt-review">' + review + '</div>' +
            '<div class="mt-actions"><button class="btn btn-sm" type="button" id="mt-again">Retake paper</button>' +
            '<a class="btn btn-ghost btn-sm" href="/prep+/companies/${c.id}/">Back to ${esc(c.name)}</a></div>';
          var again = document.getElementById('mt-again');
          again.addEventListener('click', function () { location.reload(); });
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        startBtn.addEventListener('click', function () {
          if (started) return;
          started = true;
          startBtn.hidden = true;
          idx = 0;
          answers = new Array(QUESTIONS.length).fill(null);
          remaining = MINUTES * 60;
          clock.textContent = fmt(remaining);
          renderQuestion();
          timer = setInterval(tick, 1000);
        });
      })();
    </script>`;

  return withAssets(
    page({ url, title, description: desc, graph, body, extraScript, activeNav: 'prep' }),
    url
  );
}
function interviewIndex() {
  const url = '/prep+/interview/';
  const title = 'Interview Questions & Answers by Role — HR, AI, Software | TCC Prep+';
  const desc =
    'Role-based interview question banks with guidance on how to structure each answer: HR and behavioural, AI and data roles, and software engineering. From TCC Prep+.';

  const total = P.PREP_INTERVIEW.reduce((n, b) => n + b.questions.length, 0);

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Interview Questions', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'Interview question banks',
      numberOfItems: P.PREP_INTERVIEW.length,
      itemListElement: P.PREP_INTERVIEW.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        url: BASE + `/prep+/interview/${b.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Interview</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Answer <span class="accent">with structure.</span></h1>
              <p class="prep-sub">${total} interview questions with guidance on how to build the answer — what to include, what to leave out and the trap that makes each one fail.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/interview/hr/">Start with HR &amp; behavioural</a>
                <a class="btn btn-ghost" href="/prep+/companies/">Company patterns</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Question banks</h2>
              <div class="prep-grid">
${P.PREP_INTERVIEW.map(
  (b) => `                <a class="prep-card card reveal" href="/prep+/interview/${b.id}/">
                  <span class="pc-eyebrow">${b.questions.length} questions</span>
                  <span class="pc-title">${esc(b.name)}</span>
                  <span class="pc-desc">${esc(b.blurb)}</span>
                  <span class="pc-meta">Practise →</span>
                </a>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function interviewBankPage(b) {
  const url = `/prep+/interview/${b.id}/`;
  const title = `${b.name} Interview Questions & Answers | TCC Prep+`;
  const desc = `${b.blurb} ${b.questions.length} questions with answer guidance. Interview preparation from The Coding Company Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Interview Questions', href: '/prep+/interview/' },
      { name: b.name, href: url },
    ]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: b.questions.map((q) => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.guidance },
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/interview/">Interview</a><span class="sep">/</span><span>${esc(b.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">Interview bank</div>
              <h1 class="prep-h1">${esc(b.name)}</h1>
              <p class="prep-sub">${esc(b.blurb)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Questions</span><span class="v">${b.questions.length}</span></div>
                <div class="m"><span class="k">Format</span><span class="v">Question + guidance</span></div>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">${b.questions.length} questions</h2>
              <p class="section-sub reveal">Say your answer out loud before reading the guidance. Reading silently is how you end up fluent in your head and stuck in the room.</p>
              <div class="qa">
${b.questions
  .map(
    (q, i) => `                <div class="card qa-item reveal">
                  <div class="qa-q"><span class="qn">${String(i + 1).padStart(2, '0')}</span><span>${esc(q.q)}</span></div>
                  <div class="qa-answer"><span class="lbl">How to answer</span>${esc(q.guidance)}</div>
                </div>`
  )
  .join('\n')}
              </div>
              <div class="nav-siblings reveal">
                <a href="/prep+/interview/" class="on">All banks</a>
${P.PREP_INTERVIEW.filter((x) => x.id !== b.id)
  .map((x) => `                <a href="/prep+/interview/${x.id}/">${esc(x.name)}</a>`)
  .join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  MOCK TESTS — index + timed test player
 * ──────────────────────────────────────────────────────────────────────── */
function mockPool(kind) {
  const mcqPool = P.PREP_MCQ.flatMap((s) => s.questions);
  const byGroup = (g) => P.PREP_TOPICS.filter((t) => t.group === g).flatMap((t) => t.questions);
  switch (kind) {
    case 'AUTO_APTITUDE':
      return [...byGroup('quantitative'), ...byGroup('data')];
    case 'AUTO_LOGICAL':
      return [...byGroup('logical'), ...byGroup('verbal')];
    case 'AUTO_MCQ':
      return mcqPool.filter((q) => !q.q.match(/\btransformer|regularisation|precision\b/i));
    case 'AUTO_AI':
      return P.PREP_MCQ.find((s) => s.id === 'ai-ml').questions;
    default:
      return mcqPool;
  }
}

function mockIndex() {
  const url = '/prep+/mock-tests/';
  const title = 'Timed Mock Tests — Aptitude, Reasoning, Technical & AI | TCC Prep+';
  const desc =
    'Timed, auto-scored mock tests: a full aptitude paper, a reasoning sprint, a technical core paper and an AI fundamentals paper. Sit one, get a score and a breakdown. From TCC Prep+.';

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Mock Tests', href: url },
    ]),
    {
      '@type': 'ItemList',
      name: 'Mock tests',
      numberOfItems: P.PREP_MOCK_TESTS.length,
      itemListElement: P.PREP_MOCK_TESTS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: BASE + `/prep+/mock-tests/${t.id}/`,
      })),
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Mock Tests</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <h1 class="prep-h1">Sit the paper. <span class="accent">See where you stand.</span></h1>
              <p class="prep-sub">Timed, auto-scored papers that mirror the sections real tests use. You get a score and a per-question review the moment you submit — no sign-up, no email gate.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/mock-tests/aptitude-full/">Take the aptitude paper</a>
                <a class="btn btn-ghost" href="/prep+/aptitude/">Revise topics first</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Available papers</h2>
              <div class="prep-grid">
${P.PREP_MOCK_TESTS.map(
  (t) => `                <a class="prep-card card reveal" href="/prep+/mock-tests/${t.id}/">
                  <span class="pc-eyebrow">${t.minutes} minutes · ${mockPool(t.questions).length} questions</span>
                  <span class="pc-title">${esc(t.name)}</span>
                  <span class="pc-desc">${esc(t.description)}</span>
                  <span class="pc-meta">Start test →</span>
                </a>`
).join('\n')}
              </div>
              <div class="disclaimer">Mock tests are original practice material written for TCC Prep+. They are not real exam papers and no third-party question text has been used.</div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, activeNav: 'prep' }), url);
}

function mockTestPage(t) {
  const url = `/prep+/mock-tests/${t.id}/`;
  const pool = mockPool(t.questions);
  const title = `${t.name} — Timed Mock Test | TCC Prep+`;
  const desc = `${t.description} ${t.minutes} minutes, auto-scored with per-question review. From The Coding Company Prep+.`;

  // Self-contained question data for the browser player.
  const data = pool.map((q) => ({
    q: q.q,
    o: q.options,
    a: q.answer,
    e: q.explain,
  }));

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Mock Tests', href: '/prep+/mock-tests/' },
      { name: t.name, href: url },
    ]),
    {
      '@type': 'Quiz',
      name: t.name,
      about: t.sections.join(', '),
      educationalLevel: 'Professional',
      numberOfQuestions: data.length,
      timeRequired: `PT${t.minutes}M`,
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: 'The Coding Company', url: BASE },
    },
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/mock-tests/">Mock Tests</a><span class="sep">/</span><span>${esc(t.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">Timed mock test</div>
              <h1 class="prep-h1">${esc(t.name)}</h1>
              <p class="prep-sub">${esc(t.description)}</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Time</span><span class="v">${t.minutes} min</span></div>
                <div class="m"><span class="k">Questions</span><span class="v">${data.length}</span></div>
                <div class="m"><span class="k">Sections</span><span class="v">${esc(t.sections.join(' · '))}</span></div>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:8px">
            <div class="container mt-wrap" id="mt" data-minutes="${t.minutes}">
              <div class="mt-bar">
                <span class="mt-timer" id="mt-clock">${String(t.minutes).padStart(2, '0')}:00</span>
                <span class="mt-progress" id="mt-progress">Question 1 of ${data.length}</span>
                <button class="btn btn-sm" type="button" id="mt-start">Start test</button>
              </div>
              <div id="mt-body"></div>
              <div class="mt-result card" id="mt-result" hidden></div>
              <p class="mt-note">Your answers are scored in your browser. Nothing is sent anywhere and no account is needed. Refreshing the page restarts the test.</p>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <div class="nav-siblings reveal">
                <a href="/prep+/mock-tests/" class="on">All papers</a>
${P.PREP_MOCK_TESTS.filter((x) => x.id !== t.id)
  .map((x) => `                <a href="/prep+/mock-tests/${x.id}/">${esc(x.name)}</a>`)
  .join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  const extraScript = `    <script>
      (function () {
        var QUESTIONS = ${JSON.stringify(data)};
        var root = document.getElementById('mt');
        if (!root || !QUESTIONS.length) return;
        var MINUTES = parseInt(root.getAttribute('data-minutes'), 10) || 15;
        var clock = document.getElementById('mt-clock');
        var progress = document.getElementById('mt-progress');
        var body = document.getElementById('mt-body');
        var resultEl = document.getElementById('mt-result');
        var startBtn = document.getElementById('mt-start');

        var idx = 0;
        var answers = new Array(QUESTIONS.length).fill(null);
        var started = false;
        var remaining = MINUTES * 60;
        var timer = null;

        function fmt(s) {
          var m = Math.floor(s / 60), x = s % 60;
          return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
        }

        function esc(s) {
          return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function renderQuestion() {
          var q = QUESTIONS[idx];
          progress.textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
          var html = '<div class="card mt-q"><div class="qa-q"><span class="qn">' +
            String(idx + 1).padStart(2, '0') + '</span><span>' + esc(q.q) + '</span></div><ul class="mt-opts">';
          q.o.forEach(function (opt, oi) {
            var sel = answers[idx] === oi ? ' checked' : '';
            html += '<li class="mt-opt"><label style="display:flex;gap:12px;align-items:center;width:100%;cursor:pointer">' +
              '<input type="radio" name="mt-opt" value="' + oi + '"' + sel + ' /><span class="ok">' +
              esc(String.fromCharCode(65 + oi)) + '. ' + esc(opt) + '</span></label></li>';
          });
          html += '</ul><div class="mt-actions">' +
            '<button class="btn btn-ghost btn-sm" type="button" id="mt-prev"' + (idx === 0 ? ' disabled' : '') + '>Previous</button>' +
            '<button class="btn btn-sm" type="button" id="mt-next">' + (idx === QUESTIONS.length - 1 ? 'Review &amp; submit' : 'Next') + '</button>' +
            '</div></div>';
          body.innerHTML = html;
          body.querySelectorAll('input[name="mt-opt"]').forEach(function (r) {
            r.addEventListener('change', function () { answers[idx] = parseInt(r.value, 10); });
          });
          var prev = document.getElementById('mt-prev');
          var next = document.getElementById('mt-next');
          if (prev) prev.addEventListener('click', function () { if (idx > 0) { idx--; renderQuestion(); } });
          next.addEventListener('click', function () {
            if (idx < QUESTIONS.length - 1) { idx++; renderQuestion(); }
            else { finish(false); }
          });
        }

        function tick() {
          remaining--;
          if (remaining <= 0) { remaining = 0; clock.textContent = fmt(0); finish(true); return; }
          clock.textContent = fmt(remaining);
        }

        function finish(expired) {
          if (timer) clearInterval(timer);
          started = false;
          body.innerHTML = '';
          startBtn.hidden = true;
          var correct = 0;
          var review = '';
          QUESTIONS.forEach(function (q, i) {
            var ok = answers[i] === q.a;
            if (ok) correct++;
            var opts = q.o.map(function (opt, oi) {
              var cls = oi === q.a ? ' correct' : (answers[i] === oi ? ' wrong' : '');
              return '<li class="qa-opts" style="list-style:none"><span class="' + cls + '" style="display:block;padding:8px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:10px">' +
                String.fromCharCode(65 + oi) + '. ' + esc(opt) + (oi === q.a ? '  ✓' : '') + '</span></li>';
            }).join('');
            review += '<div class="card qa-item"><div class="qa-q"><span class="qn">' +
              String(i + 1).padStart(2, '0') + '</span><span>' + esc(q.q) + '</span>' +
              (ok ? '<span class="tag easy">Correct</span>' : '<span class="tag hard">Missed</span>') +
              '</div><ul style="margin-top:12px;display:grid;gap:6px">' + opts +
              '</ul><div class="qa-explain"><strong>Why.</strong> ' + esc(q.e) + '</div></div>';
          });
          var pct = Math.round((correct / QUESTIONS.length) * 100);
          resultEl.hidden = false;
          resultEl.innerHTML = '<div class="mt-score">' + correct + ' / ' + QUESTIONS.length + '</div>' +
            '<p style="color:rgba(255,255,255,0.6);margin-top:10px">' + pct + '%' +
            (expired ? ' · time expired' : '') + '. Review the misses below, then revise the matching topics on Prep+.</p>' +
            '<div class="mt-review">' + review + '</div>' +
            '<div class="mt-actions"><button class="btn btn-sm" type="button" id="mt-again">Retake test</button>' +
            '<a class="btn btn-ghost btn-sm" href="/prep+/aptitude/">Revise topics</a></div>';
          var again = document.getElementById('mt-again');
          again.addEventListener('click', function () { location.reload(); });
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        startBtn.addEventListener('click', function () {
          if (started) return;
          started = true;
          startBtn.hidden = true;
          idx = 0;
          answers = new Array(QUESTIONS.length).fill(null);
          remaining = MINUTES * 60;
          clock.textContent = fmt(remaining);
          renderQuestion();
          timer = setInterval(tick, 1000);
        });
      })();
    </script>`;

  return withAssets(
    page({ url, title, description: desc, graph, body, extraScript, activeNav: 'prep' }),
    url
  );
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  WRITE EVERYTHING
 * ──────────────────────────────────────────────────────────────────────── */
function write(url, html) {
  const dir = path.join(ROOT, url.replace(/^\/|\/$/g, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return url;
}

const written = [];
function buildAll() {
  written.push(write('/prep+/', hubPage()));
  written.push(write('/prep+/aptitude/', aptitudeIndex()));
  for (const t of P.PREP_TOPICS) written.push(write(`/prep+/aptitude/${t.id}/`, topicPage(t)));
  written.push(write('/prep+/programming/', programmingIndex()));
  for (const l of P.PREP_LANGS) written.push(write(`/prep+/programming/${l.id}/`, langPage(l)));
  written.push(write('/prep+/dsa/', dsaIndex()));
  for (const s of P.PREP_DSA) written.push(write(`/prep+/dsa/${s.id}/`, dsaSetPage(s)));
  written.push(write('/prep+/mcq/', mcqIndex()));
  for (const s of P.PREP_MCQ) written.push(write(`/prep+/mcq/${s.id}/`, mcqSetPage(s)));
  /* /prep+/companies/** is owned by the v2 multi-round generator
     (scripts/build-prep-pages-v2.js) — it emits the full 71-company roster,
     each pattern page, and each year-wise multi-round paper. Delegating here
     keeps a single owner for the path so the two generators can never clobber
     each other, and the roster/pattern/paper pages always come from one place. */
  written.push(...require('./build-prep-pages-v2.js').buildAll());
  written.push(write('/prep+/interview/', interviewIndex()));
  for (const b of P.PREP_INTERVIEW) written.push(write(`/prep+/interview/${b.id}/`, interviewBankPage(b)));
  written.push(write('/prep+/mock-tests/', mockIndex()));
  for (const t of P.PREP_MOCK_TESTS) written.push(write(`/prep+/mock-tests/${t.id}/`, mockTestPage(t)));
  return written;
}

/* Expose the shared shell + helpers so the v2 company-paper generator can build
   pages on exactly the same chrome without duplicating it. */
module.exports = {
  ROOT,
  BASE,
  esc,
  escTxt,
  slug,
  relPrefix,
  page,
  withAssets,
  breadcrumb,
  webPage,
  ctaBand,
  logoMark,
  PREP_CSS,
  write,
  SHELL_STYLE
};

if (require.main === module) {
  const out = buildAll();
  console.log('Generated', out.length, 'Prep+ pages:');
  for (const u of out) console.log('  ', u);
}
