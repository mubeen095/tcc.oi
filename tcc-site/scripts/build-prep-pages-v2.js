/* ============================================================================
 * TCC PREP+ — company-paper generator v2 (multi-round, live compiler)
 * ---------------------------------------------------------------------------
 *   node scripts/build-prep-pages-v2.js
 *
 * Emits the full company roster onto the same TCC shell:
 *   /prep+/companies/                  logo wall (all companies)
 *   /prep+/companies/<id>/             pattern + year papers
 *   /prep+/companies/<id>/<year>/      multi-round paper:
 *                                        Aptitude -> Technical -> Coding
 *                                      with a live compiler and a scored result
 *                                      plus a readiness report.
 *
 * The coding round runs real code via the Piston execution API
 * (https://github.com/engineer-man/piston). If that API is unreachable at run
 * time the page falls back to offline sample-test comparison against the
 * expected output, so the round is never a dead end.
 *
 * All questions, coding problems and explanations are ORIGINAL TCC writing.
 * No third-party logo artwork is shipped — tiles are brand-safe wordmarks.
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  BASE,
  esc,
  relPrefix,
  page,
  withAssets,
  breadcrumb,
  webPage,
  ctaBand,
  write,
  PREP_CSS
} = require('./build-prep-pages.js');

const { COMPANIES } = require('../data/companies-full.js');
const { buildPaper, companyPapers, roundPlan, YEARS } = require('../data/prep-papers-v2.js');
const { CODING } = require('../data/prep-tech.js');

/* ── extra CSS for the multi-round engine ──────────────────────────────── */
const ROUND_CSS = `
      /* ═══ multi-round paper engine ═══ */
      :root { --logo-tile: 100px; }

      /* ── company roster: white logo tiles ──
         The PNGs are pre-normalised to an opaque white square canvas by
         scripts/build-company-logo-tiles.js, so object-fit:contain never crops
         and every mark has the same optical size. The white artwork fills the
         tile, which keeps brand colours exact in both themes. Never invert or
         cover these files. */
      .roster-grid { display: flex; flex-wrap: wrap; gap: 14px; margin: 34px 0 0; }
      .roster-card { display: block; width: var(--logo-tile); height: var(--logo-tile); border-radius: 22px; text-decoration: none; color: inherit; -webkit-tap-highlight-color: transparent; }
      .roster-card:focus-visible { outline: 2px solid rgba(140,185,255,0.85); outline-offset: 4px; }
      .rc-mark { position: relative; display: flex; align-items: center; justify-content: center; width: var(--logo-tile); height: var(--logo-tile); border-radius: 22px; overflow: hidden; background: linear-gradient(155deg, rgba(255,255,255,0.11), rgba(255,255,255,0.035)); border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 10px 26px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18); backdrop-filter: blur(18px) saturate(150%); -webkit-backdrop-filter: blur(18px) saturate(150%); transition: transform 0.28s cubic-bezier(0.2,0.9,0.3,1), border-color 0.28s ease, box-shadow 0.28s ease; }
      .rc-mark::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(125% 95% at 20% 0%, rgba(255,255,255,0.20), rgba(255,255,255,0) 62%); pointer-events: none; }
      .rc-mark--logo img { position: relative; z-index: 1; display: block; width: 100%; height: 100%; object-fit: contain; object-position: center; background: #fff; transition: transform 0.3s cubic-bezier(0.2,0.9,0.3,1); }
      .roster-card:hover .rc-mark { transform: translateY(-5px); border-color: rgba(255,255,255,0.34); box-shadow: 0 22px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.30); }
      .roster-card:hover .rc-mark--logo img { transform: scale(1.04); }
      .roster-card:active .rc-mark { transform: translateY(-1px); }

      /* ── sector filter: glass pills ── */
      .sect-filter { display: flex; flex-wrap: wrap; gap: 10px; margin: 26px 0 0; }
      .sect-filter button { position: relative; display: inline-flex; align-items: center; gap: 9px; overflow: hidden; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.72); background: linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035)); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 11px 8px 11px 18px; cursor: pointer; min-height: 44px; backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); box-shadow: 0 6px 18px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.16); transition: transform 0.22s cubic-bezier(0.2,0.9,0.3,1), color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease; }
      .sect-filter button::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(115deg, transparent 22%, rgba(255,255,255,0.24) 48%, transparent 74%); transform: translateX(-130%); transition: transform 0.6s cubic-bezier(0.2,0.9,0.3,1); pointer-events: none; }
      .sect-filter .sf-n { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 10.5px; letter-spacing: 0.04em; color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.14); transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease; }
      .sect-filter button:hover { color: #fff; border-color: rgba(255,255,255,0.34); transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.26); }
      .sect-filter button:hover::after { transform: translateX(130%); }
      .sect-filter button:hover .sf-n { background: rgba(255,255,255,0.18); color: #fff; }
      .sect-filter button:focus-visible { outline: 2px solid rgba(140,185,255,0.85); outline-offset: 3px; }
      .sect-filter button[aria-pressed="true"] { color: #05070c; background: linear-gradient(160deg, #ffffff, #dde4ef); border-color: rgba(255,255,255,0.85); box-shadow: 0 10px 26px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.22), inset 0 1px 0 rgba(255,255,255,0.9); }
      .sect-filter button[aria-pressed="true"] .sf-n { color: #05070c; background: rgba(5,7,12,0.10); border-color: rgba(5,7,12,0.14); }
      .sect-filter button[aria-pressed="true"]::after { display: none; }

      .round-strip { display: grid; gap: 12px; margin-top: 30px; }
      .round-chip { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; background: rgba(255,255,255,0.03); }
      .round-chip .rn-num { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); font-family: 'DM Mono', monospace; font-size: 13px; color: #fff; flex-shrink: 0; }
      .round-chip.locked { opacity: 0.55; }
      .round-chip.done .rn-num { background: #fff; color: #000; border-color: #fff; }
      .round-chip .rn-t { font-weight: 700; color: #fff; font-size: 15px; }
      .round-chip .rn-s { font-size: 13px; color: rgba(255,255,255,0.6); flex: 1 1 240px; }
      .round-chip .rn-state { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }

      .code-editor { width: 100%; min-height: 300px; background: #0b0d12; color: #e8e8e8; border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 16px; font-family: 'DM Mono', monospace; font-size: 13.5px; line-height: 1.6; resize: vertical; tab-size: 2; }
      .code-editor:focus { outline: 2px solid rgba(127,180,255,0.6); outline-offset: 1px; }
      .code-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 14px; }
      .lang-select { background: #0b0d12; color: #fff; border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 11px 14px; font-family: 'DM Mono', monospace; font-size: 12.5px; min-height: 44px; }
      .code-out { margin-top: 14px; padding: 16px 18px; border-radius: 12px; background: #0b0d12; border: 1px solid rgba(255,255,255,0.12); font-family: 'DM Mono', monospace; font-size: 12.5px; color: rgba(255,255,255,0.82); white-space: pre-wrap; word-break: break-word; min-height: 48px; }
      .code-out.ok { border-color: rgba(63,220,140,0.5); }
      .code-out.bad { border-color: rgba(255,120,120,0.5); }

      .cpu-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; background: #0a0a0a; position: sticky; top: 0; z-index: 40; }
      /* The bar is sticky, so it must be opaque or the gate heading bleeds
         through it. Light mode needs a matching solid tint. */
      html[data-theme="light"] .cpu-bar.cpu-bar { background: #f3f3f1; }
      /* .btn sets display:inline-flex, which beats the UA [hidden] rule. */
      .btn[hidden], .pt-submit[hidden] { display: none !important; }
      .cpu-clock { font-family: 'DM Mono', monospace; font-size: 22px; color: #fff; }
      .cpu-prog { font-size: 13.5px; color: rgba(255,255,255,0.62); }
      /* Land below the sticky bar when the gate or the result is scrolled to. */
      #exam-gate, .result-hero, #cpu { scroll-margin-top: 92px; }


      /* ── Post-test lead capture ── */
      .pt-lead { margin-top: 28px; padding: clamp(22px, 3vw, 32px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); }
      .pt-lead-head { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
      .pt-lead-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      .pt-lead-title { font-size: clamp(18px, 2vw, 24px); font-weight: 800; letter-spacing: -0.03em; }
      .pt-lead-sub { color: rgba(255,255,255,0.62); font-size: 13.5px; line-height: 1.6; max-width: 58ch; }
      .pt-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .pt-full { grid-column: 1 / -1; }
      .pt-field { display: flex; flex-direction: column; gap: 6px; }
      .pt-label { font-size: 11.5px; color: rgba(255,255,255,0.64); }
      .pt-input, .pt-select { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #fff; font-size: 14px; padding: 11px 12px; }
      .pt-input:focus, .pt-select:focus { outline: none; border-color: rgba(120,170,255,0.9); box-shadow: 0 0 0 3px rgba(0,100,255,0.14); }
      .pt-input[aria-invalid="true"], .pt-select[aria-invalid="true"] { border-color: #f87171; }
      .pt-phone { display: flex; align-items: stretch; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.04); }
      .pt-phone:focus-within { border-color: rgba(120,170,255,0.9); box-shadow: 0 0 0 3px rgba(0,100,255,0.14); }
      .pt-phone[data-invalid="true"] { border-color: #f87171; }
      .pt-prefix { display: flex; align-items: center; padding: 0 10px 0 12px; color: rgba(255,255,255,0.56); border-right: 1px solid rgba(255,255,255,0.1); }
      .pt-phone .pt-input { border: 0; border-radius: 0; background: transparent; box-shadow: none; padding-left: 10px; }
      .pt-err { display: none; margin: 0; font-size: 11.5px; color: #fca5a5; }
      .pt-err.on { display: block; }
      .pt-levels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .pt-level { position: relative; }
      .pt-level input { position: absolute; inset: 0; opacity: 0; }
      .pt-level span { display: flex; flex-direction: column; gap: 2px; padding: 10px 11px; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; background: rgba(255,255,255,0.03); font-size: 12.5px; color: rgba(255,255,255,0.76); }
      .pt-level small { font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.5); }
      .pt-level input:checked + span { border-color: rgba(120,170,255,0.9); background: rgba(0,100,255,0.16); color: #fff; }
      .pt-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border: 0; border-radius: 999px; padding: 13px 18px; background: #fff; color: #000; font-weight: 600; cursor: pointer; }
      .pt-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .pt-foot { margin: 10px 0 0; text-align: center; font-size: 11.5px; color: rgba(255,255,255,0.5); }
      .pt-link { background: none; border: 0; color: #fff; text-decoration: underline; cursor: pointer; }
      .pt-plan { display: grid; gap: 10px; }
      .pt-plan-item { display: grid; grid-template-columns: 22px 1fr; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.025); }
      .pt-plan-item .n { color: #9dc0ff; font-family: 'DM Mono', monospace; font-size: 10px; padding-top: 2px; }
      .pt-plan-item h4 { margin: 0 0 4px; font-size: 14px; }
      .pt-plan-item p { margin: 0; color: rgba(255,255,255,0.62); font-size: 12.5px; line-height: 1.6; }
      .pt-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      .pt-ghost { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); color: #fff; text-decoration: none; }
      @media (max-width: 720px) { .pt-form { grid-template-columns: 1fr; } .pt-levels { grid-template-columns: 1fr; } }

      /* ── signup gate + resume ── */
      .cpu-resume { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding: 14px 18px; border-radius: 12px; border: 1px solid rgba(127,180,255,0.34); background: rgba(60,120,255,0.10); color: rgba(255,255,255,0.84); font-size: 13.5px; line-height: 1.55; }
      .cpu-resume[hidden] { display: none; }
      .cpu-resume button { flex-shrink: 0; background: none; border: 1px solid rgba(255,255,255,0.22); color: #fff; border-radius: 999px; padding: 8px 14px; font-size: 12.5px; cursor: pointer; }
      .cpu-resume button:hover { border-color: rgba(255,255,255,0.45); }
      .cpu-save { margin: 18px 0 0; font-size: 13px; color: rgba(255,255,255,0.62); }
      .cpu-save.ok { color: #8fe8b6; }
      .cpu-save.bad { color: #ff9a9a; }
      .cpu-sum-sub { margin-top: 10px; color: rgba(255,255,255,0.7); }
      .cpu-band-text { margin-top: 16px; max-width: 70ch; line-height: 1.65; color: rgba(255,255,255,0.72); }
      .cpu-disclaimer { margin-top: 22px; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.5); }
      .cpu-code-label { color: rgba(255,255,255,0.6); font-size: 13px; }
      /* Light-mode accents: the dark-theme pastels do not reach AA on white. */
      html[data-theme="light"] .cpu-sum-sub,
      html[data-theme="light"] .cpu-band-text { color: rgba(10,10,10,0.72); }
      html[data-theme="light"] .cpu-disclaimer { color: rgba(10,10,10,0.58); }
      html[data-theme="light"] .cpu-code-label { color: rgba(10,10,10,0.68); }
      html[data-theme="light"] .eg-lock { color: #0057de; }
      html[data-theme="light"] .cpu-save.ok { color: #0f7a44; }
      html[data-theme="light"] .cpu-save.bad { color: #b42318; }
      html[data-theme="light"] .band-strong { background: rgba(15,122,68,0.10); border-color: rgba(15,122,68,0.45); color: #0f7a44; }
      html[data-theme="light"] .band-competitive { background: rgba(0,87,222,0.10); border-color: rgba(0,87,222,0.45); color: #0044b0; }
      html[data-theme="light"] .band-borderline { background: rgba(150,90,0,0.10); border-color: rgba(150,90,0,0.45); color: #8a5300; }
      html[data-theme="light"] .band-work { background: rgba(180,35,24,0.10); border-color: rgba(180,35,24,0.45); color: #b42318; }
      /* A white pill disappears on the light canvas; use the site's primary. */
      html[data-theme="light"] .pt-submit { background: #0057de; color: #fff; }
      html[data-theme="light"] .pt-submit:hover { background: #0a63ea; }
      .eg-lock { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #9dc0ff; }

      .result-hero { margin-top: 26px; padding: 34px 30px; border-radius: 20px; }
      .result-score { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: clamp(46px, 8vw, 74px); line-height: 1; color: #fff; }
      .result-band { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 9px 18px; border-radius: 999px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
      .band-strong { background: rgba(63,220,140,0.12); border: 1px solid rgba(63,220,140,0.5); color: #8fe8b6; }
      .band-competitive { background: rgba(127,180,255,0.12); border: 1px solid rgba(127,180,255,0.5); color: #a8c8ff; }
      .band-borderline { background: rgba(255,196,96,0.12); border: 1px solid rgba(255,196,96,0.5); color: #ffd28a; }
      .band-work { background: rgba(255,120,120,0.12); border: 1px solid rgba(255,120,120,0.5); color: #ff9a9a; }
      .improve-list { display: grid; gap: 10px; margin-top: 18px; }
      .improve-item { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: baseline; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; background: rgba(255,255,255,0.03); }
      .improve-item .ii-t { font-weight: 700; color: #fff; font-size: 14.5px; }
      .improve-item .ii-s { color: rgba(255,255,255,0.62); font-size: 13.5px; flex: 1 1 220px; }
      .improve-item a { color: #9cc4ff; font-size: 13px; }

      @media (max-width: 767px) {
        .round-chip, .improve-item { padding: 16px; }
        .cpu-bar { position: static; }
        #exam-gate, .result-hero, #cpu { scroll-margin-top: 76px; }
        .code-editor { min-height: 240px; font-size: 13px; }
        .code-bar .btn { width: 100%; }
      }
      @media (max-width: 640px) {
        :root { --logo-tile: 86px; }
        .roster-grid { gap: 12px; }
      }
`;

/* ── brand-safe mark / approved logo renderer ────────────────────────────
 * Only render a real logo image if:
 * - logoFile is set
 * - logoPermissionStatus === 'approved'
 * Never modify/distort/recolour logos here; just render as-is inside a
 * fixed-size, object-fit-contained container. If not approved, fall back to
 * the wordmark tile.
 *
 * The approved artwork in assets/img/company/ is a 512x512 white plate. The
 * build step scripts/build-company-logo-tiles.js bakes those into square,
 * background-free tiles under assets/img/company/clean/, which is what the
 * page renders - so the mark fills its tile edge to edge and needs no
 * special-casing here. */
const CLEAN_LOGO_DIR = path.join(ROOT, 'assets', 'img', 'company', 'clean');
const CLEAN_LOGOS = new Map();
try {
  for (const f of fs.readdirSync(CLEAN_LOGO_DIR)) {
    if (f.endsWith('.png')) CLEAN_LOGOS.set(path.basename(f, '.png'), `assets/img/company/clean/${f}`);
  }
} catch (err) { /* no processed tiles yet - fall back to the source artwork */ }

function logoSrc(c) {
  return (c && CLEAN_LOGOS.get(c.id)) || (c && c.logoFile) || '';
}

function mark(c, size) {
  const isApproved = c && c.logoFile && c.logoPermissionStatus === 'approved';
  const px = size === 'lg' ? 'font-size:24px' : 'font-size:22px';
  const sizeCls = size === 'lg' ? ' rc-mark-lg' : '';
  if (isApproved) {
    const alt = esc(c.name);
    return `<span class="rc-mark rc-mark--logo${sizeCls}"><img src="/${esc(logoSrc(c))}" alt="${alt}" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="rc-mark${sizeCls}" style="color:${esc(c.tint)};${px}">${esc(c.mark)}</span>`;
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  ROSTER (logo wall) — all companies, filterable by sector
 * ──────────────────────────────────────────────────────────────────────── */
function rosterIndex() {
  const url = '/prep+/companies/';
  const sectors = [...new Set(COMPANIES.map((c) => c.sector))];
  const title = `${COMPANIES.length} Companies That Hire in India — Practice Papers & Patterns | TCC Prep+`;
  const desc = `Practice papers and hiring patterns for ${COMPANIES.length} of the companies that hire most in India, across IT services, product, GCC, Indian startups, consulting and finance tech. Aptitude, technical and coding rounds, scored in your browser. From TCC Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Companies', href: url }
    ]),
    {
      '@type': 'ItemList',
      name: 'Companies that hire in India',
      numberOfItems: COMPANIES.length,
      itemListElement: COMPANIES.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        url: BASE + `/prep+/companies/${c.id}/`
      }))
    }
  ]);

  const cards = COMPANIES.map((c) => {
    return `              <a class="roster-card reveal" data-sector="${esc(c.sector)}" href="/prep+/companies/${c.id}/" title="${esc(c.name)} — Previous Year Papers" aria-label="${esc(c.name)}">
                ${mark(c)}
              </a>`;
  }).join('\n');

  const sectorCount = {};
  for (const c of COMPANIES) sectorCount[c.sector] = (sectorCount[c.sector] || 0) + 1;

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><span>Companies</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill"><span class="dot"></span> ${COMPANIES.length} companies · 3 years each</div>
              <h1 class="prep-h1">Know their pattern. <span class="accent">Then sit the paper.</span></h1>
              <p class="prep-sub">Pick a company, see how its process actually runs, then take a year-wise paper that mirrors it: an aptitude round, a technical round and — for the firms that run one — a coding round you write and run in the browser. Scored instantly, with a readiness read and the topics to improve.</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/companies/tcs/2026/">Sit the TCS 2026 paper</a>
                <a class="btn btn-ghost" href="/prep+/mock-tests/">Browse general mock tests</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Pick your target company</h2>
              <p class="section-sub reveal">Filter by the kind of employer you are targeting. Each tile carries that company&rsquo;s own logo — these are unaffiliated study pages.</p>
              <div class="sect-filter" role="group" aria-label="Filter companies by sector">
                <button type="button" data-filter="all" aria-pressed="true">All <span class="sf-n">${COMPANIES.length}</span></button>
${sectors.map((s) => `                <button type="button" data-filter="${esc(s)}" aria-pressed="false">${esc(s)} <span class="sf-n">${sectorCount[s]}</span></button>`).join('\n')}
              </div>
              <div class="roster-grid" id="roster">
${cards}
              </div>
              <p class="section-sub" id="roster-count" style="margin-top:20px"></p>

            </div>
          </section>
          <section class="section band">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Official past papers</h2>
              <p class="section-sub reveal">Private employers do not publish their hiring tests, but government recruitment bodies publish their own past papers publicly. If you are also preparing for a public-sector exam, start from the source.</p>
              <div class="ref-list">
${require('../data/prep-papers.js').REFERENCE_PAPERS.map(
  (r) => `                <div class="ref-item reveal"><div class="rb">${esc(r.body)}</div><div class="rw">${esc(r.what)}</div><div class="rn">${esc(r.note)} <a href="${esc(r.url)}" target="_blank" rel="noopener nofollow">Open official source &rarr;</a></div></div>`
).join('\n')}
              </div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  const extraScript = `    <script>
      (function () {
        var grid = document.getElementById('roster');
        var count = document.getElementById('roster-count');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.roster-card'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.sect-filter button'));
        function apply(f) {
          var n = 0;
          cards.forEach(function (c) {
            var show = f === 'all' || c.getAttribute('data-sector') === f;
            c.style.display = show ? '' : 'none';
            if (show) n++;
          });
          count.textContent = 'Showing ' + n + ' of ' + cards.length + ' companies.';
          buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
        }
        buttons.forEach(function (b) {
          b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
        });
        apply('all');
      })();
    </script>`;

  return withAssets(page({ url, title, description: desc, graph, body, extraScript, extraCss: ROUND_CSS, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  COMPANY PAGE — pattern + year papers
 * ──────────────────────────────────────────────────────────────────────── */
function companyPage(c) {
  const url = `/prep+/companies/${c.id}/`;
  const papers = companyPapers(c.id);
  const title = `${c.name} Hiring Rounds & Year-wise Practice Papers | TCC Prep+`;
  const desc = `${c.name} hiring pattern — ${c.rounds.join(', ')} — plus 2026, 2025 and 2024 practice papers with aptitude, technical and coding rounds, scored instantly. From TCC Prep+.`;

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Companies', href: '/prep+/companies/' },
      { name: c.name, href: url }
    ]),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: [
        { '@type': 'Question', name: `What rounds does ${c.name} run?`, acceptedAnswer: { '@type': 'Answer', text: `${c.name} typically runs: ${c.rounds.join(', ')}.` } },
        { '@type': 'Question', name: `What should I focus on for ${c.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${c.focus} Highest-weight topics: ${c.topics.join(', ')}.` } },
        { '@type': 'Question', name: `Does TCC Prep+ have ${c.name} practice papers?`, acceptedAnswer: { '@type': 'Answer', text: `Yes — year-wise papers for ${papers.map((p) => p.year).join(', ')}, each with the same round structure ${c.name} uses, scored in your browser with a readiness report.` } }
      ]
    }
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/companies/">Companies</a><span class="sep">/</span><span>${esc(c.name)}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">${esc(c.sector)}</div>
              ${mark(c, 'lg')}
              <h1 class="prep-h1">How ${esc(c.name)} hires</h1>
              <p class="prep-sub">${esc(c.focus)}</p>
              <div class="prep-ctas">
                <a class="btn" href="/prep+/companies/${c.id}/${papers[0].year}/">Sit the ${papers[0].year} paper</a>
                <a class="btn btn-ghost" href="/prep+/companies/">All companies</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">The process</h2>
              <ul class="rounds reveal">
${c.rounds.map((r, i) => `                <li><span class="rn">${String(i + 1).padStart(2, '0')}</span><span>${esc(r)}</span></li>`).join('\n')}
              </ul>
              <div class="fact-row">
                <div class="card fact reveal"><div class="fk">Eligibility</div><div class="fv">${esc(c.eligibility)}</div></div>
                <div class="card fact reveal"><div class="fk">Papers available</div><div class="fv">${papers.length} (${papers.map((p) => p.year).join(', ')})</div></div>
              </div>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Practice papers by year</h2>
              <p class="section-sub reveal">Each paper follows ${esc(c.name)}&rsquo;s round split and unlocks round by round — clear the aptitude round to open the technical round, then the coding round. Everything is scored as you go.</p>
              <div class="year-row">
${papers.map((p) => `                <a class="year-card reveal" href="/prep+/companies/${c.id}/${p.year}/">
                  <span class="yc-y">${p.year}</span>
                  <span class="yc-info">
                    <span class="t">${p.rounds.length} rounds &middot; ${p.mcqTotal + p.codeTotal} tasks &middot; ~${p.minutes} min</span>
                    <span class="s">${p.rounds.map((r) => esc(r.name)).join(' → ')}</span>
                  </span>
                  <span class="yc-go">Start paper</span>
                </a>`).join('\n')}
              </div>
              <div class="disclaimer">Original TCC questions written to ${esc(c.name)}&rsquo;s publicly described pattern. Not transcribed company material. Unaffiliated with ${esc(c.name)}.</div>
            </div>
          </section>
          <section class="section band">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Where the marks come from</h2>
              <h3 class="reveal" style="font-size:18px;font-weight:700;color:#fff">High-weight topics</h3>
              <div class="nav-siblings reveal">
${c.topics.map((t) => `                <span class="tag high" style="padding:9px 16px">${esc(t)}</span>`).join('\n')}
              </div>
              <div class="qa-explain" style="margin-top:30px"><strong>Tip.</strong> ${esc(c.tip)}</div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  return withAssets(page({ url, title, description: desc, graph, body, extraCss: ROUND_CSS, activeNav: 'prep' }), url);
}

/* ───────────────────────────────────────────────────────────────────────── *
 *  PAPER PAGE — multi-round, live compiler, readiness report
 * ──────────────────────────────────────────────────────────────────────── */
function paperPage(paper) {
  const c = COMPANIES.find((x) => x.id === paper.companyId);
  const url = `/prep+/companies/${c.id}/${paper.year}/`;
  const title = `${c.name} ${paper.year} Practice Paper — ${paper.rounds.length} Rounds | TCC Prep+`;
  const desc = `Sit the ${c.name} ${paper.year} pattern: ${paper.rounds.map((r) => r.name).join(' → ')}. Aptitude and technical rounds scored instantly, a live coding round you run in the browser, then a readiness report with the topics to improve. From TCC Prep+.`;

  /* Serialise rounds for the client engine. */
  const clientRounds = paper.rounds.map((r) => {
    if (r.kind === 'code') {
      return {
        kind: 'code',
        name: r.name,
        blurb: r.blurb,
        minutes: r.minutes,
        problems: r.problems.map((p) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          statement: p.statement,
          examples: p.examples,
          approach: p.approach,
          complexity: p.complexity,
          goal: p.leaderboard_goal,
          cases: p.testcases,
          starter: p.starter
        }))
      };
    }
    return {
      kind: r.kind,
      name: r.name,
      blurb: r.blurb,
      minutes: r.minutes,
      sections: r.sections.map((s) => ({
        name: s.name,
        topic: s.topic,
        questions: s.questions.map((q) => ({ q: q.q, o: q.o, a: q.a, e: q.e, t: q.topic }))
      }))
    };
  });

  const graph = webPage(url, title, desc, [
    breadcrumb(url, [
      { name: 'Home', href: '/' },
      { name: 'Prep+', href: '/prep+/' },
      { name: 'Companies', href: '/prep+/companies/' },
      { name: c.name, href: `/prep+/companies/${c.id}/` },
      { name: `${paper.year} paper`, href: url }
    ]),
    {
      '@type': 'Quiz',
      name: `${c.name} ${paper.year} practice paper`,
      about: paper.rounds.map((r) => r.name).join(', '),
      educationalLevel: 'Professional',
      numberOfQuestions: paper.mcqTotal + paper.codeTotal,
      timeRequired: `PT${paper.minutes}M`,
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: 'The Coding Company', url: BASE }
    }
  ]);

  const body = `        <div class="content-wrap">
          <nav class="prep-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/prep+/">Prep+</a><span class="sep">/</span><a href="/prep+/companies/">Companies</a><span class="sep">/</span><a href="/prep+/companies/${c.id}/">${esc(c.name)}</a><span class="sep">/</span><span>${paper.year}</span></nav>
          <section class="prep-hero">
            <div class="grid-bg" aria-hidden="true"></div>
            <div class="prep-hero-in reveal">
              <div class="prep-pill">${esc(c.name)} &middot; ${paper.year} pattern</div>
              <h1 class="prep-h1">${esc(c.name)} ${paper.year} paper</h1>
              <p class="prep-sub">${paper.rounds.length} rounds, ${paper.mcqTotal + paper.codeTotal} tasks, about ${paper.minutes} minutes. Clear each round to unlock the next — the aptitude and technical rounds are scored instantly, and the coding round runs your code for real.</p>
              <div class="prep-meta-strip">
                <div class="m"><span class="k">Rounds</span><span class="v">${paper.rounds.length}</span></div>
                <div class="m"><span class="k">Tasks</span><span class="v">${paper.mcqTotal + paper.codeTotal}</span></div>
                <div class="m"><span class="k">Time</span><span class="v">~${paper.minutes} min</span></div>
              </div>
              <div class="prep-ctas">
                <a class="btn" href="#cpu">Go to the paper</a>
                <a class="btn btn-ghost" href="/prep+/companies/${c.id}/">${esc(c.name)} rounds</a>
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:24px">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">How this paper works</h2>
              <p class="section-sub reveal">Rounds unlock in order, the way the real process works. Your score and readiness update at the end of every round.</p>
              <div class="round-strip" id="round-strip" aria-label="Round progress">
${paper.rounds.map((r, i) => `                <div class="round-chip reveal${i === 0 ? '' : ' locked'}" data-round="${i}">
                  <span class="rn-num">${i + 1}</span>
                  <span class="rn-t">${esc(r.name)}</span>
                  <span class="rn-s">${esc(r.blurb)}</span>
                  <span class="rn-state">${i === 0 ? 'Ready' : 'Locked'}</span>
                </div>`).join('\n')}
              </div>
            </div>
          </section>
          <section class="section" style="padding-top:8px">
            <div class="container" id="cpu">
              <div class="cpu-bar">
                <span class="cpu-clock" id="cpu-clock">--:--</span>
                <span class="cpu-prog" id="cpu-prog">Round 1 — ${esc(paper.rounds[0].name)}</span>
                <button class="btn btn-sm" type="button" id="cpu-next">Start round 1</button>
              </div>
              <div class="cpu-resume" id="cpu-resume" hidden></div>
              <div id="cpu-body" style="margin-top:22px"></div>
              <div class="result-hero card" id="cpu-result" hidden></div>
              <p class="mt-note">Everything runs in your browser. Your answers, score and profile are saved on this device, so you can close this tab and pick up where you left off.</p>
            </div>
          </section>
          <section class="section">
            <div class="container">
              <h2 class="section-title reveal" style="margin-bottom:10px">Other years</h2>
              <div class="nav-siblings reveal">
                <a href="/prep+/companies/${c.id}/" class="on">${esc(c.name)} rounds</a>
${companyPapers(c.id)
  .filter((p) => p.year !== paper.year)
  .map((p) => `                <a href="/prep+/companies/${c.id}/${p.year}/">${p.year} paper</a>`)
  .join('\n')}
                <a href="/prep+/companies/">All companies</a>
              </div>
              <div class="disclaimer">Original TCC questions written to ${esc(c.name)}&rsquo;s publicly described pattern. Not transcribed company material. Unaffiliated with ${esc(c.name)}. The readiness band is a study aid based on your score — it is an estimate, not a prediction of any real hiring outcome.</div>
            </div>
          </section>
${ctaBand()}
        </div>`;

  const extraScript = paperScript(clientRounds, c.name, c.id, paper.year);

  return withAssets(page({ url, title, description: desc, graph, body, extraScript, extraCss: ROUND_CSS, activeNav: 'prep' }), url);
}

/* ── the client-side multi-round engine ─────────────────────────────────── */
function paperScript(rounds, companyName, companyId, year) {
  return `    <script>
      (function () {
        var ROUNDS = ${JSON.stringify(rounds)};
        var COMPANY = ${JSON.stringify(companyName)};
        var COMPANY_ID = ${JSON.stringify(companyId)};
        var YEAR = ${JSON.stringify(String(year))};

        /* The signup gate sits after this section of this round. Section 0 of
           round 0 is Numerical Ability (8 questions); move GATE.section to -1 to
           gate at the end of the whole round instead. */
        var GATE = { round: 0, section: 0 };

        var STORE_KEY = 'tcc_exam_' + COMPANY_ID + '_' + YEAR;
        var ATTEMPT_KEY = 'tcc_exam_attempts_' + COMPANY_ID + '_' + YEAR;
        var PROFILE = null;          /* {leadId,name,email,phone,college,studyYear} */
        var ATTEMPT = 1;
        var RESTORE = null;
        var STARTED_AT = Date.now();
        var UTM = (function () {
          var q = {};
          try { new URLSearchParams(location.search).forEach(function (v, k) { q[k] = v; }); } catch (e) {}
          return q;
        })();

        var clock = document.getElementById('cpu-clock');
        var prog = document.getElementById('cpu-prog');
        var bodyEl = document.getElementById('cpu-body');
        var resultEl = document.getElementById('cpu-result');
        var nextBtn = document.getElementById('cpu-next');

        /* state */
        var current = 0;               // index of the active round
        var results = [];              // per-round result objects
        var timer = null;
        var remaining = 0;

        function fmt(s) {
          var m = Math.floor(s / 60), x = s % 60;
          return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
        }
        function esc(s) {
          return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        /* ── shared helpers ────────────────────────────────────────────── */
        function $(id) { return document.getElementById(id); }
        function escv(sv) {
          return String(sv == null ? '' : sv).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
          });
        }
        function postJson(url, body) {
          return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }).then(function (res) {
            var ct = (res.headers.get('content-type') || '').toLowerCase();
            if (ct.indexOf('application/json') === -1) {
              var no = res.status === 404 || res.status === 405 || res.status === 501;
              var err = new Error(no ? 'offline' : 'Server error (' + res.status + ')');
              err.offline = no;
              throw err;
            }
            return res.json().then(function (data) {
              if (!res.ok) { var e = new Error(data.error || 'Something went wrong.'); e.status = res.status; throw e; }
              return data;
            });
          }, function () { var err = new Error('offline'); err.offline = true; throw err; });
        }

        /* ── persistence ───────────────────────────────────────────────── */
        function storeGet(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
        function storeSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
        function storeDel(key) { try { localStorage.removeItem(key); } catch (e) {} }

        /* Each tab claims the save slot when it boots. If another tab has
           written more recently, this one stands down instead of clobbering
           the newer progress (e.g. a finished paper in the other tab). */
        var TAB_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
        var LAST_WRITE = 0;

        function saveState(extra) {
          var s = storeGet(STORE_KEY) || {};
          if (s.tab && s.tab !== TAB_ID && (s.updated || 0) > LAST_WRITE) return;
          s.v = 1;
          s.company = COMPANY_ID;
          s.year = YEAR;
          s.tab = TAB_ID;
          s.profile = PROFILE;
          s.results = results;
          s.current = current;
          s.phase = phase;
          s.attempt = ATTEMPT;
          s.remaining = remaining;
          s.startedAt = STARTED_AT;
          s.updated = Date.now();
          LAST_WRITE = s.updated;
          if (extra) Object.keys(extra).forEach(function (k) { s[k] = extra[k]; });
          storeSet(STORE_KEY, s);
        }

        /* ── clock (pausable, resumes the remaining time) ───────────────── */
        var clockPaused = false;
        var tickSave = 0;
        function startClock(minutes, resumeSeconds) {
          if (timer) clearInterval(timer);
          clockPaused = false;
          remaining = (typeof resumeSeconds === 'number' && resumeSeconds > 0) ? resumeSeconds : minutes * 60;
          clock.textContent = fmt(remaining);
          timer = setInterval(function () {
            if (clockPaused) return;
            remaining--;
            if (remaining <= 0) { remaining = 0; clock.textContent = fmt(0); autoSubmit(); return; }
            clock.textContent = fmt(remaining);
            if (++tickSave % 5 === 0) saveState();
          }, 1000);
        }
        function stopClock() { if (timer) clearInterval(timer); timer = null; }
        function pauseClock() { clockPaused = true; }
        function resumeClock() { clockPaused = false; }

        var autoSubmitFn = null;
        function autoSubmit() { if (autoSubmitFn) autoSubmitFn(); }

        /* How many questions into a round the gate sits, or -1 for no gate. */
        function gatePointFor(roundIndex) {
          if (roundIndex !== GATE.round || GATE.section < 0) return -1;
          var round = ROUNDS[roundIndex];
          if (!round || round.kind === 'code' || !round.sections) return -1;
          var total = 0, n = 0;
          round.sections.forEach(function (s) { total += s.questions.length; });
          for (var i = 0; i <= GATE.section && i < round.sections.length; i++) n += round.sections[i].questions.length;
          if (n <= 0 || n >= total) return -1;   /* gate at the end of the round instead */
          return n;
        }

        /* ── MCQ round (aptitude or technical) ─────────────────────────── */
        function renderMcq(round) {
          var flat = [];
          round.sections.forEach(function (sec) {
            sec.questions.forEach(function (q) { flat.push({ q: q.q, o: q.o, a: q.a, e: q.e, t: sec.name }); });
          });
          var restore = (RESTORE && RESTORE.current === current) ? RESTORE : null;
          var idx = (restore && typeof restore.idx === 'number') ? Math.min(Math.max(restore.idx, 0), flat.length - 1) : 0;
          var answers = (restore && restore.answers && restore.answers.length === flat.length)
            ? restore.answers
            : new Array(flat.length).fill(null);
          var gateAt = gatePointFor(current);

          function persist() { saveState({ idx: idx, answers: answers }); }

          function paint() {
            if (gateAt > 0 && !PROFILE && idx >= gateAt) { showGate({ mode: 'mid', idx: gateAt, answers: answers }); return; }
            var q = flat[idx];
            prog.textContent = 'Round ' + (current + 1) + ' — ' + round.name + ' · Q' + (idx + 1) + '/' + flat.length;
            var html = '<div class="card mt-q"><div class="qa-q"><span class="qn">' + String(idx + 1).padStart(2, '0') +
              '</span><span>' + esc(q.q) + '</span><span class="tag easy" style="white-space:nowrap">' + esc(q.t) + '</span></div><ul class="mt-opts">';
            q.o.forEach(function (opt, oi) {
              var sel = answers[idx] === oi ? ' checked' : '';
              html += '<li class="mt-opt"><label style="display:flex;gap:12px;align-items:center;width:100%;cursor:pointer">' +
                '<input type="radio" name="cpu-opt" value="' + oi + '"' + sel + ' /><span class="ok">' +
                esc(String.fromCharCode(65 + oi)) + '. ' + esc(opt) + '</span></label></li>';
            });
            html += '</ul><div class="mt-actions">' +
              '<button class="btn btn-ghost btn-sm" type="button" id="cpu-prev"' + (idx === 0 ? ' disabled' : '') + '>Previous</button>' +
              '<button class="btn btn-sm" type="button" id="cpu-qnext">' + (idx === flat.length - 1 ? 'Finish round' : 'Next') + '</button></div></div>';
            bodyEl.innerHTML = html;
            bodyEl.querySelectorAll('input[name="cpu-opt"]').forEach(function (r) {
              r.addEventListener('change', function () { answers[idx] = parseInt(r.value, 10); persist(); });
            });
            var p = document.getElementById('cpu-prev');
            if (p) p.addEventListener('click', function () { if (idx > 0) { idx--; paint(); persist(); } });
            document.getElementById('cpu-qnext').addEventListener('click', function () {
              if (idx < flat.length - 1) {
                if (gateAt > 0 && !PROFILE && idx + 1 === gateAt) { persist(); showGate({ mode: 'mid', idx: gateAt, answers: answers }); return; }
                idx++; paint(); persist();
              } else { finishMcq(round, flat, answers); }
            });
          }
          autoSubmitFn = function () { finishMcq(round, flat, answers); };
          paint();
        }

        function finishMcq(round, flat, answers) {
          stopClock();
          var byTopic = {};
          var correct = 0;
          flat.forEach(function (q, i) {
            var ok = answers[i] === q.a;
            if (ok) correct++;
            if (!byTopic[q.t]) byTopic[q.t] = { c: 0, t: 0 };
            byTopic[q.t].t++;
            if (ok) byTopic[q.t].c++;
          });
          results.push({
            kind: round.kind,
            name: round.name,
            correct: correct,
            total: flat.length,
            pct: Math.round((correct / flat.length) * 100),
            byTopic: byTopic
          });
          bodyEl.innerHTML = '';
          roundComplete();
          prog.textContent = 'Round ' + (current + 1) + ' complete — ' + correct + '/' + flat.length + ' (' + Math.round((correct / flat.length) * 100) + '%)';
          clock.textContent = 'done';
          showRoundSummary(round, correct, flat.length, byTopic);
          saveState({ idx: null, answers: null });
          unlockNextChip();
        }

        function showRoundSummary(round, correct, total, byTopic) {
          var rows = Object.keys(byTopic).map(function (k) {
            return '<tr><td>' + esc(k) + '</td><td>' + byTopic[k].c + ' / ' + byTopic[k].t + '</td></tr>';
          }).join('');
          resultEl.hidden = false;
          resultEl.innerHTML = '<div class="result-score">' + correct + ' / ' + total + '</div>' +
            '<p class="cpu-sum-sub">' + round.name + ' complete — ' + Math.round((correct / total) * 100) + '%.</p>' +
            '<table class="pd-table"><thead><tr><th>Section</th><th>Score</th></tr></thead><tbody>' + rows + '</tbody></table>';
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /* ── coding round ──────────────────────────────────────────────── */
        function renderCode(round) {
          var restore = (RESTORE && RESTORE.current === current) ? RESTORE : null;
          var pIdx = (restore && typeof restore.pIdx === 'number') ? Math.min(Math.max(restore.pIdx, 0), round.problems.length - 1) : 0;
          var solutions = (restore && restore.solutions) ? restore.solutions : {};

          function paint() {
            var p = round.problems[pIdx];
            prog.textContent = 'Round ' + (current + 1) + ' — ' + round.name + ' · Problem ' + (pIdx + 1) + '/' + round.problems.length;
            var lang = 'python';
            var html =
              '<div class="card" style="padding:26px">' +
              '<div class="pc-eyebrow" style="font-family:\\'DM Mono\\',monospace;font-size:10.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.45)">' +
                esc(p.difficulty) + ' · ' + esc(p.topic) + '</div>' +
              '<h3 style="font-size:20px;font-weight:700;color:#fff;margin-top:8px">' + esc(p.title) + '</h3>' +
              '<p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.65;margin-top:12px">' + esc(p.statement) + '</p>' +
              '<div class="qa-explain" style="margin-top:16px"><strong>Example.</strong> Input: <code>' + esc(p.examples[0].input) +
                '</code> → Output: <code>' + esc(p.examples[0].output) + '</code>. ' + esc(p.examples[0].why) + '</div>' +
              '<div class="qa-explain" style="margin-top:10px"><strong>Approach.</strong> ' + esc(p.approach) + ' <em>' + esc(p.complexity) + '</em>.</div>' +
              '<div class="code-bar">' +
                '<label for="cpu-lang" class="cpu-code-label">Language</label>' +
                '<select class="lang-select" id="cpu-lang">' +
                  '<option value="python">Python</option><option value="javascript">JavaScript</option>' +
                  '<option value="java">Java</option><option value="cpp">C++</option>' +
                '</select>' +
                '<button class="btn btn-sm" type="button" id="cpu-run">Run on test cases</button>' +
                '<button class="btn btn-ghost btn-sm" type="button" id="cpu-nextq">' +
                  (pIdx === round.problems.length - 1 ? 'Finish coding round' : 'Next problem') +
                '</button>' +
              '</div>' +
              '<label for="cpu-code" class="cpu-code-label" style="display:block;margin-top:16px">Your code</label>' +
              '<textarea class="code-editor" id="cpu-code" spellcheck="false" aria-label="Code editor">' + esc(p.starter.python) + '</textarea>' +
              '<div class="code-out" id="cpu-out">Run your code to check it against the test cases below.</div>' +
              '<h4 style="margin-top:20px;color:#fff;font-size:15px">Sample test cases</h4>' +
              '<table class="pd-table"><thead><tr><th>Input</th><th>Expected output</th></tr></thead><tbody>' +
                p.cases.map(function (tc) { return '<tr><td><code>' + esc(tc.input) + '</code></td><td><code>' + esc(tc.output) + '</code></td></tr>'; }).join('') +
              '</tbody></table>' +
              '</div>';
            bodyEl.innerHTML = html;

            var ta = document.getElementById('cpu-code');
            solutions[p.id] = solutions[p.id] || {};
            if (!solutions[p.id].code) solutions[p.id].code = { python: p.starter.python, javascript: p.starter.javascript, java: p.starter.java, cpp: p.starter.cpp };
            var sel = document.getElementById('cpu-lang');
            var savedLang = solutions[p.id].lang || lang;
            sel.value = savedLang;
            ta.value = solutions[p.id].code[savedLang];
            sel.addEventListener('change', function () {
              solutions[p.id].code[savedLang] = ta.value;
              savedLang = sel.value;
              solutions[p.id].lang = savedLang;
              ta.value = solutions[p.id].code[savedLang];
              saveState({ pIdx: pIdx, solutions: solutions });
            });
            ta.addEventListener('input', function () {
              solutions[p.id].code[savedLang] = ta.value;
              saveState({ pIdx: pIdx, solutions: solutions });
            });

            document.getElementById('cpu-run').addEventListener('click', function () {
              runCode(p, sel.value, ta.value);
            });
            document.getElementById('cpu-nextq').addEventListener('click', function () {
              solutions[p.id].attempted = true;
              nextProblem();
            });
          }

          function nextProblem() {
            if (pIdx < round.problems.length - 1) { pIdx++; paint(); saveState({ pIdx: pIdx, solutions: solutions }); }
            else { finishCode(round, solutions); }
          }

          /* Compare against the expected output the same way for both the live
             and the offline path, so the score means the same thing either way:
             an exact match, or a whitespace-insensitive match. */
          function outputMatches(got, expected) {
            got = String(got).trim();
            expected = String(expected).trim();
            if (got === expected) return true;
            return got.replace(/\s+/g, '') === expected.replace(/\s+/g, '');
          }

          /* Live execution endpoints, tried in order. The first is the public
             Piston API; if it is blocked, rate-limited or down we fall through
             to the offline grader rather than leaving the round ungraded. */
          var RUN_ENDPOINTS = [
            'https://emkc.org/api/v2/piston/execute'
          ];

          function runCode(p, lang, code) {
            var out = document.getElementById('cpu-out');
            var tc = p.cases[0];
            out.className = 'code-out';
            out.textContent = 'Running…';

            var pistonLang = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'c++' }[lang] || 'python';
            var payload = {
              language: pistonLang,
              version: '*',
              files: [{ name: guessFile(lang), content: code }],
              stdin: tc.input,
              compile_timeout: 10000,
              run_timeout: 8000
            };

            tryLive(0);

            function tryLive(i) {
              if (i >= RUN_ENDPOINTS.length) { offlineCheck(p, tc); return; }
              var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
              var to = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
              fetch(RUN_ENDPOINTS[i], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: ctrl ? ctrl.signal : undefined
              }).then(function (r) {
                if (to) clearTimeout(to);
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
              }).then(function (data) {
                var run = data && data.run;
                var stdout = (run && run.stdout) ? String(run.stdout).trim() : '';
                var stderr = (run && run.stderr) ? String(run.stderr).trim() : '';
                if (stderr && !stdout) {
                  out.className = 'code-out bad';
                  out.textContent = 'Runtime error:\\n' + stderr;
                  return;
                }
                var expected = tc.output.trim();
                var ok = outputMatches(stdout, expected);
                out.className = 'code-out ' + (ok ? 'ok' : 'bad');
                out.textContent = (ok ? '✓ Matches expected output on the first test case.\\n\\n' : '✗ Output differs from expected.\\n\\n') +
                  'Your output:\\n' + (stdout || '(empty)') + '\\n\\nExpected:\\n' + expected;
                solutions[p.id].passed = ok || solutions[p.id].passed;
              }).catch(function () {
                if (to) clearTimeout(to);
                tryLive(i + 1);
              });
            }
          }

          /* Offline grader: the learner runs their code wherever they like and
             pastes the output here. We score it with the same comparison the
             live path uses, so the round is never a dead end and the score is
             still honest. */
          function offlineCheck(p, tc) {
            var out = document.getElementById('cpu-out');
            out.className = 'code-out';
            out.innerHTML =
              'Live execution is unavailable right now, so this round is graded offline.\\n\\n' +
              'Run your code on this input:\\n' + esc(tc.input) + '\\n\\n' +
              'Paste what your program printed, and it will be scored against the expected output:\\n';
            var box = document.createElement('textarea');
            box.className = 'code-editor';
            box.style.minHeight = '90px';
            box.setAttribute('aria-label', 'Paste your program output');
            box.value = solutions[p.id] && solutions[p.id].pasted ? solutions[p.id].pasted : '';
            var check = document.createElement('button');
            check.type = 'button';
            check.className = 'btn btn-sm';
            check.style.marginTop = '12px';
            check.textContent = 'Score my output';
            out.appendChild(box);
            out.appendChild(check);
            check.addEventListener('click', function () {
              var got = box.value;
              solutions[p.id].pasted = got;
              var ok = outputMatches(got, tc.output);
              solutions[p.id].passed = ok || solutions[p.id].passed;
              out.className = 'code-out ' + (ok ? 'ok' : 'bad');
              out.textContent = (ok ? '✓ Correct — that matches the expected output.\\n\\n' : '✗ Not quite.\\n\\n') +
                'Your output:\\n' + (got.trim() || '(empty)') + '\\n\\nExpected:\\n' + tc.output.trim();
            });
          }

          function guessFile(lang) {
            return { python: 'main.py', javascript: 'main.js', java: 'Main.java', cpp: 'main.cpp' }[lang] || 'main.py';
          }

          autoSubmitFn = function () { finishCode(round, solutions); };
          paint();
        }

        function finishCode(round, solutions) {
          stopClock();
          var passed = 0;
          round.problems.forEach(function (p) { if (solutions[p.id] && solutions[p.id].passed) passed++; });
          results.push({
            kind: 'code',
            name: round.name,
            correct: passed,
            total: round.problems.length,
            pct: Math.round((passed / round.problems.length) * 100),
            byTopic: {}
          });
          bodyEl.innerHTML = '';
          roundComplete();
          prog.textContent = 'Round ' + (current + 1) + ' complete — ' + passed + '/' + round.problems.length + ' coding problems passed';
          clock.textContent = 'done';
          saveState({ pIdx: null, solutions: null });
          unlockNextChip();
        }

        /* ── progress chips ────────────────────────────────────────────── */
        function unlockNextChip() {
          var chips = document.querySelectorAll('.round-chip');
          if (chips[current]) { chips[current].classList.remove('locked'); chips[current].classList.add('done'); var st = chips[current].querySelector('.rn-state'); if (st) st.textContent = 'Done'; }
          if (chips[current + 1]) { chips[current + 1].classList.remove('locked'); var st2 = chips[current + 1].querySelector('.rn-state'); if (st2) st2.textContent = 'Ready'; }
        }

        /* ── final result + readiness report ───────────────────────────── */
        function showFinal(silent) {
          stopClock();
          nextBtn.hidden = true;
          clock.textContent = 'done';
          prog.textContent = 'Paper complete';

          var mcqCorrect = 0, mcqTotal = 0, codeCorrect = 0, codeTotal = 0;
          var byTopic = {};
          results.forEach(function (r) {
            if (r.kind === 'code') { codeCorrect += r.correct; codeTotal += r.total; }
            else {
              mcqCorrect += r.correct; mcqTotal += r.total;
              Object.keys(r.byTopic).forEach(function (k) {
                if (!byTopic[k]) byTopic[k] = { c: 0, t: 0 };
                byTopic[k].c += r.byTopic[k].c; byTopic[k].t += r.byTopic[k].t;
              });
            }
          });
          var totalCorrect = mcqCorrect + codeCorrect;
          var totalTasks = mcqTotal + codeTotal;
          var pct = totalTasks ? Math.round((totalCorrect / totalTasks) * 100) : 0;

          var band, bandCls, bandText;
          if (pct >= 75) { band = 'Strong'; bandCls = 'band-strong'; bandText = 'You are scoring at a level that typically clears the first filter at this pattern. Keep the pace and push accuracy higher.'; }
          else if (pct >= 60) { band = 'Competitive'; bandCls = 'band-competitive'; bandText = 'You are in the competitive range. Sharpening the weaker sections below should move you comfortably past the cut.'; }
          else if (pct >= 45) { band = 'Borderline'; bandCls = 'band-borderline'; bandText = 'You are close but not safe. The topics below are costing you the most marks — target those first.'; }
          else { band = 'Needs work'; bandCls = 'band-work'; bandText = 'The fundamentals need more time before the real test. Work through the weak topics below, then retake this paper.'; }

          var weak = Object.keys(byTopic).map(function (k) {
            return { name: k, c: byTopic[k].c, t: byTopic[k].t, pct: Math.round((byTopic[k].c / byTopic[k].t) * 100) };
          }).sort(function (a, b) { return a.pct - b.pct; }).slice(0, 5);

          var improve = weak.map(function (w) {
            return '<div class="improve-item"><span class="ii-t">' + esc(w.name) + '</span>' +
              '<span class="ii-s">You scored ' + w.c + '/' + w.t + ' (' + w.pct + '%). ' + (w.pct < 50 ? 'This is your biggest gap — revise it first.' : 'A little revision here will lift your total.') + '</span>' +
              '<a href="/prep+/aptitude/">Practise &rarr;</a></div>';
          }).join('');

          resultEl.hidden = false;
          resultEl.innerHTML =
            '<div class="result-score">' + totalCorrect + ' / ' + totalTasks + '</div>' +
            '<div class="result-band ' + bandCls + '">' + band + ' · ' + pct + '%</div>' +
            '<p class="cpu-band-text">' + bandText + '</p>' +
            '<table class="pd-table" style="margin-top:22px"><thead><tr><th>Round</th><th>Score</th></tr></thead><tbody>' +
              results.map(function (r) { return '<tr><td>' + esc(r.name) + '</td><td>' + r.correct + ' / ' + r.total + ' (' + r.pct + '%)</td></tr>'; }).join('') +
              '<tr><td><strong>Overall</strong></td><td><strong>' + totalCorrect + ' / ' + totalTasks + '</strong></td></tr>' +
            '</tbody></table>' +
            (improve ? '<h3 style="color:#fff;font-size:17px;margin-top:28px">Where to improve</h3><div class="improve-list">' + improve + '</div>' : '') +
            '<p class="cpu-disclaimer">This readiness band is a study aid based on your score on TCC Prep+ questions written to the ' + esc(COMPANY) + ' pattern. It is an estimate of where you are, not a prediction of any hiring decision.</p>' +
            '<div class="mt-actions"><button class="btn btn-sm" type="button" id="cpu-again">Retake paper</button>' +
            '<a class="btn btn-ghost btn-sm" href="/prep+/companies/' + COMPANY_ID + '/">Back to ' + esc(COMPANY) + '</a></div>' +
            '<p class="cpu-save" id="cpu-save">Saving your score...</p>';

          var again = document.getElementById('cpu-again');
          if (again) again.addEventListener('click', resetPaper);
          var alreadySaved = !!(RESTORE && RESTORE.submitted);
          saveState({ complete: true, idx: null, answers: null, pIdx: null, solutions: null });
          if (alreadySaved) {
            var savedEl = document.getElementById('cpu-save');
            if (savedEl) { savedEl.className = 'cpu-save ok'; savedEl.textContent = 'Score saved to your profile.'; }
          } else {
            submitScore(pct, band, function () { saveState({ submitted: true }); });
          }
          if (!silent) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /* ── round sequencing ──────────────────────────────────────────── */
        /* One handler, one meaning per state:
             idle    -> start round 0
             running -> current round's own controls advance it (nothing here)
             between -> advance to the next round, or show the final result */
        var phase = 'idle';

        function startRound(i, resumeSeconds) {
          var resumed = typeof resumeSeconds === 'number';
          current = i;
          phase = 'running';
          var round = ROUNDS[i];
          resultEl.hidden = true;
          nextBtn.hidden = true;
          prog.textContent = 'Round ' + (i + 1) + ' — ' + round.name;
          startClock(round.minutes, resumeSeconds);
          if (!resumed) RESTORE = null;
          if (round.kind === 'code') renderCode(round);
          else renderMcq(round);
          if (!resumed) saveState({ idx: 0, answers: null, pIdx: 0, solutions: null });
        }

        nextBtn.addEventListener('click', function () {
          if (phase === 'idle') { STARTED_AT = Date.now(); startRound(0); return; }
          if (phase !== 'between') return;            /* ignore mid-round clicks */
          if (current === GATE.round && !PROFILE) { showGate({ mode: 'between' }); return; }
          if (current < ROUNDS.length - 1) startRound(current + 1);
          else showFinal();
        });

        /* A round has finished: park on a "between" state so the next click
           advances cleanly, and relabel the button. */
        function roundComplete() {
          phase = 'between';
          nextBtn.hidden = false;
          nextBtn.textContent = current === ROUNDS.length - 1
            ? 'See final result'
            : (current === GATE.round && !PROFILE ? 'Save your place to continue' : 'Continue to ' + ROUNDS[current + 1].name);
        }

        nextBtn.textContent = 'Start round 1';

        /* ── signup gate ───────────────────────────────────────────────── */
        var gatePending = null;

        function gateMarkup(sectionName) {
          var years = ['1st year', '2nd year', '3rd year', '4th year', '5th year / integrated'];
          return '<section class="pt-lead" id="exam-gate" style="margin-top:0">' +
            '<div class="pt-lead-head">' +
              '<span class="eg-lock">Section complete · save your place</span>' +
              '<h3 class="pt-lead-title">Unlock the rest of the ' + esc(COMPANY) + ' paper</h3>' +
              '<p class="pt-lead-sub">You finished ' + esc(sectionName) + '. Add your details to continue — your answers and score are saved against them, so you can close this tab and pick up where you left off.</p>' +
            '</div>' +
            '<div id="eg-form-wrap">' +
              '<form class="pt-form" id="egForm" novalidate>' +
                '<div class="pt-field pt-full"><label class="pt-label" for="eg-name">Full name</label>' +
                  '<input class="pt-input" id="eg-name" type="text" autocomplete="name" placeholder="Your name" aria-describedby="eg-name-err"><p class="pt-err" id="eg-name-err"></p></div>' +
                '<div class="pt-field"><label class="pt-label" for="eg-email">Email</label>' +
                  '<input class="pt-input" id="eg-email" type="email" autocomplete="email" placeholder="you@college.edu" aria-describedby="eg-email-err"><p class="pt-err" id="eg-email-err"></p></div>' +
                '<div class="pt-field"><label class="pt-label" for="eg-phone">Phone number</label>' +
                  '<div class="pt-phone"><span class="pt-prefix">+91</span><input class="pt-input" id="eg-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="98765 43210" autocomplete="tel-national" aria-describedby="eg-phone-err"></div><p class="pt-err" id="eg-phone-err"></p></div>' +
                '<div class="pt-field pt-full"><label class="pt-label" for="eg-college">College name</label>' +
                  '<input class="pt-input" id="eg-college" type="text" autocomplete="organization" placeholder="e.g. VIT Vellore" aria-describedby="eg-college-err"><p class="pt-err" id="eg-college-err"></p></div>' +
                '<div class="pt-field"><label class="pt-label" for="eg-year">Current year of study</label>' +
                  '<select class="pt-select" id="eg-year"><option value="">Select</option>' +
                    years.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('') +
                  '</select><p class="pt-err" id="eg-year-err"></p></div>' +
                '<div class="pt-full"><button class="pt-submit" id="egSend" type="submit">Continue the paper</button>' +
                  '<p class="pt-foot">Your details are saved with your score, so we can send you the result and the next paper for your target companies.</p></div>' +
              '</form>' +
            '</div>' +
          '</section>';
        }

        function showGate(target) {
          gatePending = target || { mode: 'between' };
          pauseClock();
          nextBtn.hidden = true;
          var round = ROUNDS[GATE.round] || ROUNDS[0];
          var section = (round.sections && round.sections[GATE.section]) ? round.sections[GATE.section].name : round.name;
          prog.textContent = 'Section complete — save your place';
          bodyEl.innerHTML = gateMarkup(section);
          wireGate();
          var gateEl = document.getElementById('exam-gate');
          try { (gateEl || bodyEl).scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        }

        function wireGate() {
          var form = $('egForm');

          function setErr(id, msg) {
            var input = $(id), err = $(id + '-err'), wrap = input && input.closest ? input.closest('.pt-phone') : null;
            if (!input) return;
            if (msg) {
              input.setAttribute('aria-invalid', 'true');
              if (wrap) wrap.setAttribute('data-invalid', 'true');
              if (err) { err.textContent = msg; err.classList.add('on'); }
            } else {
              input.removeAttribute('aria-invalid');
              if (wrap) wrap.removeAttribute('data-invalid');
              if (err) { err.textContent = ''; err.classList.remove('on'); }
            }
          }

          function validate() {
            var ok = true, first = null;
            function fail(id, m) { setErr(id, m); ok = false; first = first || $(id); }
            if ($('eg-name').value.trim().length < 2) fail('eg-name', 'Enter your full name.'); else setErr('eg-name', '');
            if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test($('eg-email').value.trim())) fail('eg-email', 'Enter a valid email address.'); else setErr('eg-email', '');
            if (!/^[6-9]\\d{9}$/.test($('eg-phone').value.replace(/\\D/g, ''))) fail('eg-phone', 'Enter a valid 10-digit Indian mobile number.'); else setErr('eg-phone', '');
            if ($('eg-college').value.trim().length < 3) fail('eg-college', 'Enter your college name.'); else setErr('eg-college', '');
            if (!$('eg-year').value) fail('eg-year', 'Select your current year of study.'); else setErr('eg-year', '');
            if (first) try { first.focus(); } catch (e) {}
            return ok;
          }

          function admit(profile, leadId) {
            PROFILE = {
              leadId: leadId || null,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              college: profile.college,
              studyYear: profile.studyYear
            };
            saveState({ profile: PROFILE });
            bodyEl.innerHTML = '';
            unlockAfterGate();
          }

          form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) return;
            var btn = $('egSend');
            var profile = {
              name: $('eg-name').value.trim(),
              email: $('eg-email').value.trim().toLowerCase(),
              phone: '+91' + $('eg-phone').value.replace(/\\D/g, ''),
              college: $('eg-college').value.trim(),
              studyYear: $('eg-year').value
            };
            btn.disabled = true; btn.textContent = 'Saving your place...';
            postJson('/api/forms', {
              form_type: 'exam-lead',
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              college: profile.college,
              study_year: profile.studyYear,
              company: COMPANY_ID,
              paper_year: YEAR,
              page_url: location.pathname,
              utm_source: UTM.utm_source || '',
              utm_medium: UTM.utm_medium || '',
              utm_campaign: UTM.utm_campaign || ''
            }).then(function (res) {
              admit(profile, res && res.id);
            }).catch(function (err) {
              /* No backend (static preview) — still let them sit the paper.
                 The score will not reach the sheet without a lead id. */
              if (err.offline) { admit(profile, null); return; }
              setErr('eg-email', err.message || 'Could not save your details. Try again.');
              btn.disabled = false;
              btn.textContent = 'Continue the paper';
            });
          });
        }

        function unlockAfterGate() {
          var target = gatePending;
          gatePending = null;
          resumeClock();
          if (target && target.mode === 'mid') {
            RESTORE = { current: current, idx: target.idx, answers: target.answers };
            renderMcq(ROUNDS[current]);
            /* The gate saved the question we were on, not the one we unlock
               into — persist the resume point so a reload lands there too. */
            saveState({ idx: target.idx, answers: target.answers });
          } else if (target && target.mode === 'between') {
            if (current < ROUNDS.length - 1) startRound(current + 1);
            else showFinal();
          }
        }

        /* ── score submission ──────────────────────────────────────────── */
        function pctFor(kind) {
          for (var i = 0; i < results.length; i++) if (results[i].kind === kind) return results[i].pct;
          return null;
        }

        function submitScore(overall, band, onSaved) {
          var el = $('cpu-save');
          if (!PROFILE || !PROFILE.leadId) {
            if (el) { el.className = 'cpu-save'; el.textContent = 'Your score was not saved — we could not create your lead record.'; }
            return;
          }
          var payload = {
            lead_id: PROFILE.leadId,
            attempt: ATTEMPT,
            company: COMPANY_ID,
            paper_year: YEAR,
            apt_pct: pctFor('apt'),
            tech_pct: pctFor('tech'),
            code_pct: pctFor('code'),
            overall_pct: overall,
            band: band,
            duration_min: Math.max(1, Math.round((Date.now() - STARTED_AT) / 60000)),
            page_url: location.pathname,
            utm_source: UTM.utm_source || '',
            utm_medium: UTM.utm_medium || '',
            utm_campaign: UTM.utm_campaign || '',
            device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
          };
          if (el) { el.className = 'cpu-save'; el.textContent = 'Saving your score...'; }
          postJson('/api/exam-score', payload).then(function (res) {
            if (el) {
              el.className = 'cpu-save ok';
              el.textContent = res.sheet === 'ok'
                ? 'Score saved. Your report has been recorded.'
                : 'Score saved to your profile.';
            }
            storeSet(ATTEMPT_KEY, (storeGet(ATTEMPT_KEY) || 0) + 1);
            if (onSaved) onSaved();
          }).catch(function () {
            if (el) { el.className = 'cpu-save bad'; el.textContent = 'We could not save your score. Keep this page open and try again.'; }
          });
        }

        /* ── resume / restart ──────────────────────────────────────────── */
        function resetPaper() {
          /* A retake keeps the captured profile — the candidate has already
             signed up — but clears every answer and starts a new attempt. */
          var saved = storeGet(STORE_KEY) || {};
          storeDel(STORE_KEY);
          if (saved.profile) {
            storeSet(STORE_KEY, {
              v: 1,
              company: COMPANY_ID,
              year: YEAR,
              tab: TAB_ID,
              profile: saved.profile,
              results: [],
              current: 0,
              phase: 'idle',
              attempt: (saved.attempt || 1) + 1,
              remaining: 0,
              startedAt: Date.now(),
              updated: Date.now()
            });
          }
          location.reload();
        }

        function showResumeBanner(saved) {
          var el = $('cpu-resume');
          if (!el) return;
          var label = saved.complete
            ? 'you finished this paper'
            : (saved.phase === 'between'
              ? 'Round ' + (saved.current + 1) + ' is complete'
              : 'Round ' + (saved.current + 1) + (typeof saved.idx === 'number' ? ', question ' + (saved.idx + 1) : ''));
          var who = (PROFILE && PROFILE.name) ? ', ' + escv(PROFILE.name.split(' ')[0]) : '';
          el.innerHTML = '<span>Welcome back' + who + ' — ' + label + '.</span>' +
            '<button type="button" id="cpu-restart">' + (saved.complete ? 'Retake paper' : 'Start over') + '</button>';
          el.hidden = false;
          $('cpu-restart').addEventListener('click', function () {
            if (saved.complete || confirm('Start this paper from the beginning? Your saved answers for this paper will be cleared.')) resetPaper();
          });
        }

        function boot() {
          ATTEMPT = (storeGet(ATTEMPT_KEY) || 0) + 1;
          var saved = storeGet(STORE_KEY);
          if (!saved || saved.company !== COMPANY_ID || saved.year !== YEAR) {
            nextBtn.textContent = 'Start round 1';
            return;
          }
          if (saved.profile) PROFILE = saved.profile;
          if (saved.attempt) ATTEMPT = saved.attempt;
          results = saved.results || [];
          current = saved.current || 0;
          phase = saved.phase || 'idle';
          RESTORE = saved;
          LAST_WRITE = saved.updated || 0;
          if (saved.startedAt) STARTED_AT = saved.startedAt;
          /* A retake has a profile but no progress yet: wait on the start
             button instead of announcing "welcome back" to question 1. */
          var hasProgress = saved.complete || phase !== 'idle' || results.length > 0;
          if (hasProgress) showResumeBanner(saved);

          if (saved.complete) {
            showFinal(true);
            /* A finished paper should reopen on the result, not the hero. */
            try { resultEl.scrollIntoView({ block: 'start' }); } catch (e) {}
            return;
          }
          if (phase === 'idle') {
            nextBtn.hidden = false;
            nextBtn.textContent = 'Start round 1';
            prog.textContent = 'Round 1 — ' + ROUNDS[0].name;
            clock.textContent = fmt(ROUNDS[0].minutes * 60);
          } else if (phase === 'between') {
            nextBtn.hidden = false;
            nextBtn.textContent = current === ROUNDS.length - 1
              ? 'See final result'
              : 'Continue to ' + ROUNDS[current + 1].name;
            prog.textContent = 'Round ' + (current + 1) + ' complete';
            clock.textContent = 'paused';
          } else {
            startRound(current, typeof saved.remaining === 'number' ? saved.remaining : ROUNDS[current].minutes * 60);
            /* Resume on the paper, not on the hero above it. */
            try { document.getElementById('cpu').scrollIntoView({ block: 'start' }); } catch (e) {}
          }
        }

        boot();

      })();

    </script>`;
}

/* ── write everything ───────────────────────────────────────────────────── */
function buildAll() {
  const out = [];
  out.push(write('/prep+/companies/', rosterIndex()));
  for (const c of COMPANIES) {
    out.push(write(`/prep+/companies/${c.id}/`, companyPage(c)));
    for (const p of companyPapers(c.id)) {
      out.push(write(`/prep+/companies/${c.id}/${p.year}/`, paperPage(p)));
    }
  }
  return out;
}

module.exports = { buildAll, rosterIndex, companyPage, paperPage, ROUND_CSS };

if (require.main === module) {
  const out = buildAll();
  console.log('Generated', out.length, 'company pages (roster + patterns + papers):');
  for (const u of out.slice(0, 6)) console.log('  ', u);
  console.log('   … and', out.length - 6, 'more');
}
