#!/usr/bin/env node
/**
 * build-blog-articles.js
 * ---------------------------------------------------------------------------
 * Renders the TCC blog article pages from a shared shell extracted from
 * blog/index.html, so every article is pixel-consistent with the blog hub
 * (sidebar, mobile header, mega footer, bottom nav, Instrument Serif type).
 *
 * Each article gets:
 *   - a full-bleed hero image background with dark veil + faint grid
 *   - article-scoped CSS appended to the shared blog stylesheet
 *   - breadcrumb + BlogPosting + FAQPage + BreadcrumbList JSON-LD
 *   - scroll reveal (IntersectionObserver + fallback for .main-scroll)
 *
 * Idempotent: re-running rewrites the same output.
 * Run: node scripts/build-blog-articles.js   (or npm run build:blog)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { withTheme } = require('./theme-tags.cjs');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BLOG = path.join(PUBLIC, 'blog');
const SITE = 'https://thecodingcompany.io';
const IMG = '/assets/img/blog';

const hub = fs.readFileSync(path.join(BLOG, 'index.html'), 'utf8');

function slice(start, end) {
  const a = hub.indexOf(start);
  if (a === -1) throw new Error('marker not found: ' + start);
  const b = hub.indexOf(end, a);
  if (b === -1) throw new Error('end marker not found: ' + end);
  return hub.slice(a, b + end.length);
}

const STYLE_RAW = slice('<style>', '</style>');
const SIDEBAR = slice('<aside class="sidebar">', '</aside>');
const HEADER = slice('<header class="mobile-header">', '</header>');
const FOOTER = slice('<footer class="footer">', '</footer>');
const NAV = slice('<nav class="bottom-nav">', '</nav>');

/* ── Article-scoped CSS (appended after the shared blog stylesheet) ── */
const ARTICLE_CSS = `
      /* ══════════ ARTICLE ══════════ */
      .a-hero { position: relative; padding: 130px 24px 46px; overflow: hidden; background: #000000; }
      @media (min-width: 768px) { .a-hero { padding: 158px 40px 58px; } }
      .a-hero-bg { position: absolute; inset: 0; z-index: 0; background-size: cover; background-position: center 40%; opacity: 0.38; transform: scale(1.03); }
      .a-hero-veil { position: absolute; inset: 0; z-index: 1; background:
        linear-gradient(180deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.88) 58%, #000000 100%),
        radial-gradient(85% 78% at 18% 18%, rgba(0,87,222,0.30), transparent 62%); }
      .a-hero-grid { position: absolute; inset: 0; z-index: 2; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 78%); -webkit-mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 78%); }
      .a-hero-inner { position: relative; z-index: 3; max-width: 900px; margin: 0 auto; }
      .crumbs { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.42); margin-bottom: 22px; flex-wrap: wrap; }
      .crumbs a:hover { color: #fff; }
      .crumbs .sep { opacity: 0.4; }
      .crumbs .cur { color: rgba(255,255,255,0.7); }
      .a-tag { display: inline-flex; align-items: center; gap: 8px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #7fb4ff; background: rgba(0,100,255,0.1); border: 1px solid rgba(0,100,255,0.28); border-radius: 999px; padding: 8px 16px; margin-bottom: 20px; backdrop-filter: blur(8px); }
      .a-title { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-weight: 800; letter-spacing: -0.045em; line-height: 1.06; font-size: clamp(30px, 4.6vw, 54px); color: #fff; }
      .a-title .accent { font-family: 'Newsreader', Georgia, serif; font-style: italic; font-weight: 400; letter-spacing: -0.02em; }
      .a-standfirst { margin-top: 20px; color: rgba(255,255,255,0.6); font-size: clamp(16px, 1.6vw, 18.5px); line-height: 1.7; max-width: 44em; }
      .a-byline { margin-top: 26px; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; font-size: 13px; color: rgba(255,255,255,0.45); }
      .a-byline .who { color: rgba(255,255,255,0.8); font-weight: 600; }
      .a-byline .dot-sep { width: 4px; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.28); }

      .a-body { max-width: 780px; margin: 0 auto; padding: 58px 24px 0; }
      @media (min-width: 768px) { .a-body { padding: 74px 40px 0; } }
      .a-body > * + * { margin-top: 22px; }
      .a-body h2 { font-family: 'Newsreader', Georgia, serif; font-weight: 400; letter-spacing: -0.02em; line-height: 1.14; font-size: clamp(26px, 3.2vw, 38px); color: #fff; margin-top: 54px; scroll-margin-top: 80px; }
      .a-body h3 { font-size: clamp(18px, 2vw, 21px); font-weight: 700; letter-spacing: -0.02em; color: #fff; margin-top: 38px; }
      .a-body p { color: rgba(255,255,255,0.68); font-size: 17px; line-height: 1.82; }
      .a-body strong, .a-body b { color: #fff; font-weight: 600; }
      .a-body a { color: #7fb4ff; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(127,180,255,0.35); transition: text-decoration-color 0.25s; }
      .a-body a:hover { text-decoration-color: #7fb4ff; }
      .a-body ul, .a-body ol { padding-left: 4px; display: flex; flex-direction: column; gap: 12px; }
      .a-body li { color: rgba(255,255,255,0.68); font-size: 17px; line-height: 1.75; padding-left: 26px; position: relative; }
      .a-body ul li::before { content: ''; position: absolute; left: 4px; top: 12px; width: 7px; height: 7px; border-radius: 999px; background: #0064FF; box-shadow: 0 0 10px rgba(0,100,255,0.7); }
      .a-body ol { counter-reset: n; }
      .a-body ol li { padding-left: 40px; counter-increment: n; }
      .a-body ol li::before { content: counter(n); position: absolute; left: 0; top: 1px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: #7fb4ff; width: 26px; height: 26px; border-radius: 999px; background: rgba(0,100,255,0.12); border: 1px solid rgba(0,100,255,0.3); display: flex; align-items: center; justify-content: center; }
      .a-body hr { border: 0; border-top: 1px solid rgba(255,255,255,0.09); margin: 46px 0; }
      .a-lede { font-size: 20px !important; line-height: 1.75 !important; color: rgba(255,255,255,0.78) !important; }

      .a-callout { border: 1px solid rgba(0,100,255,0.28); background: linear-gradient(140deg, rgba(0,87,222,0.13), rgba(0,87,222,0.02)); border-radius: 18px; padding: 26px 28px; display: flex; flex-direction: column; gap: 10px; }
      .a-callout .co-label { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase; color: #7fb4ff; }
      .a-callout p { font-size: 16px !important; color: rgba(255,255,255,0.74) !important; line-height: 1.72 !important; }

      .a-quote { border-left: 2px solid #0064FF; padding: 6px 0 6px 24px; }
      .a-quote p { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-style: italic; font-size: clamp(20px, 2.4vw, 26px) !important; line-height: 1.45 !important; color: rgba(255,255,255,0.86) !important; }

      .a-stats { display: grid; grid-template-columns: 1fr; gap: 14px; }
      @media (min-width: 620px) { .a-stats { grid-template-columns: repeat(3, 1fr); } }
      .a-stat { border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03); border-radius: 16px; padding: 22px 20px; }
      .a-stat .num { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: clamp(28px, 3.4vw, 38px); line-height: 1; color: #fff; }
      .a-stat .lbl { margin-top: 8px; font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.5; }

      .a-phases { display: flex; flex-direction: column; gap: 14px; }
      .a-phase { display: flex; gap: 18px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03); border-radius: 16px; padding: 22px 24px; }
      .a-phase .ph-n { font-family: 'DM Mono', monospace; font-size: 12px; color: #7fb4ff; flex-shrink: 0; padding-top: 3px; letter-spacing: 0.1em; }
      .a-phase .ph-t { font-size: 16.5px; font-weight: 700; color: #fff; letter-spacing: -0.01em; margin-bottom: 6px; }
      .a-phase .ph-d { font-size: 15px !important; color: rgba(255,255,255,0.6) !important; line-height: 1.7 !important; }
      .a-phase .ph-d { margin: 0 !important; }

      .a-flag { display: grid; grid-template-columns: 1fr; gap: 14px; }
      @media (min-width: 700px) { .a-flag { grid-template-columns: repeat(2, 1fr); } }
      .a-flag .fl { border-radius: 16px; padding: 22px 24px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03); }
      .a-flag .fl .fl-h { display: block; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 8px; color: #fff; }
      .a-flag .fl.good .fl-h { color: #6ee7a8; }
      .a-flag .fl.bad .fl-h { color: #ff8a8a; }
      .a-flag .fl p { font-size: 14.5px !important; color: rgba(255,255,255,0.6) !important; line-height: 1.68 !important; margin: 0 !important; }

      .a-faq { border-top: 1px solid rgba(255,255,255,0.08); }
      .a-faq details { border-bottom: 1px solid rgba(255,255,255,0.08); }
      .a-faq summary { list-style: none; cursor: pointer; padding: 22px 44px 22px 0; position: relative; font-size: 17.5px; font-weight: 600; color: #fff; letter-spacing: -0.015em; line-height: 1.45; }
      .a-faq summary::-webkit-details-marker { display: none; }
      .a-faq summary::after { content: '+'; position: absolute; right: 6px; top: 50%; transform: translateY(-50%); font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 300; color: rgba(255,255,255,0.45); transition: transform 0.3s; }
      .a-faq details[open] summary::after { content: '−'; color: #7fb4ff; }
      .a-faq details p { padding: 0 0 24px; color: rgba(255,255,255,0.62); font-size: 16px; line-height: 1.78; margin: 0; }

      .a-cta { border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(140deg, rgba(0,87,222,0.16), rgba(0,0,0,0.4)); border-radius: 22px; padding: 40px 34px; display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
      .a-cta .ct-t { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: clamp(24px, 3vw, 34px); line-height: 1.12; letter-spacing: -0.02em; color: #fff; }
      .a-cta .ct-d { color: rgba(255,255,255,0.58); font-size: 15.5px; line-height: 1.72; }
      .a-cta .ct-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }

      .a-related { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 30px; }
      @media (min-width: 760px) { .a-related { grid-template-columns: repeat(2, 1fr); } }
      .a-rel { display: flex; flex-direction: column; gap: 10px; padding: 24px 24px 26px; }
      .a-rel .rl-tag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.42); }
      .a-rel .rl-title { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.34; color: #fff; }
      .a-rel .rl-desc { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.62; }
      .a-rel .rl-go { margin-top: auto; padding-top: 12px; color: #7fb4ff; font-weight: 600; font-size: 14px; }

      @media (prefers-reduced-motion: reduce) {
        .reveal { opacity: 1 !important; transform: none !important; }
      }`;

/* ── Shared render ── */
function render(a) {
  const url = `${SITE}/blog/${a.file}`;
  const img = `${SITE}${IMG}/${a.image}`;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': url + '#faq',
    mainEntity: a.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url + '#article',
    headline: a.titlePlain,
    description: a.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [img],
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: 'en',
    wordCount: a.wordCount,
    articleSection: a.tag,
    keywords: a.keywords.join(', '),
    author: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    isPartOf: { '@id': `${SITE}/blog/#blog` },
    about: a.about.map((x) => ({ '@type': 'Thing', name: x })),
    mentions: a.mentions.map((m) => ({ '@type': m.type || 'Thing', name: m.name, url: m.url })),
  };

  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: a.crumb, item: url },
    ],
  };

  const final = a.final || {
    title: 'Prove the work you can do.<br /><span class="serif-i">Build role-ready proof.</span>',
    desc: 'Choose a role, practise the work it needs, and show evidence an employer can understand.',
    primary: 'Explore all certifications',
    primaryHref: '/bootcamps/',
    secondary: 'How placements work',
    secondaryHref: '/placement/',
  };

  const related = a.related
    .map(
      (r) => `            <a class="card a-rel reveal" href="${r.href}">
              <div class="rl-tag">${r.tag}</div>
              <div class="rl-title">${r.title}</div>
              <p class="rl-desc">${r.desc}</p>
              <span class="rl-go">Read next →</span>
            </a>`
    )
    .join('\n');

  const faqVisible = a.faq
    .map(
      (f) => `            <details>
              <summary>${f.q}</summary>
              <p>${f.a}</p>
            </details>`
    )
    .join('\n');

  const body = a.body
    .map((b) => {
      if (b.h2) return `          <h2 id="${b.id}">${b.h2}</h2>`;
      if (b.html) return `          ${b.html}`;
      return `          <p>${b.p}</p>`;
    })
    .join('\n');

  const sidebar = SIDEBAR.replace('class="sidebar-link active"', 'class="sidebar-link"').replace(
    '<a href="/blog" class="sidebar-link"',
    '<a href="/blog" class="sidebar-link active"'
  );

  return withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${a.seoTitle}</title>
    <meta name="description" content="${a.description}" />
    <meta name="keywords" content="${a.keywords.join(', ')}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="The Coding Company (TCC)" />
    <meta name="theme-color" content="#000000" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${a.seoTitle}" />
    <meta property="og:description" content="${a.description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="The Coding Company (TCC)" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1600" />
    <meta property="og:image:height" content="900" />
    <meta property="article:published_time" content="${a.date}" />
    <meta property="article:modified_time" content="${a.date}" />
    <meta property="article:section" content="${a.tag}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${a.seoTitle}" />
    <meta name="twitter:description" content="${a.description}" />
    <meta name="twitter:image" content="${img}" />
    <link rel="alternate" type="application/rss+xml" title="TCC Blog — AI Courses, Certifications & Placement" href="/feed.xml" />
    <link rel="icon" type="image/x-icon" href="../favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/img/tcc-favicon-32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="../assets/img/tcc-favicon-96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/img/tcc-apple-touch.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap" />
    <script type="application/ld+json">
${JSON.stringify(articleLd, null, 2).replace(/\n/g, '\n    ')}
    </script>
    <script type="application/ld+json">
${JSON.stringify(faqLd, null, 2).replace(/\n/g, '\n    ')}
    </script>
    <script type="application/ld+json">
${JSON.stringify(crumbsLd, null, 2).replace(/\n/g, '\n    ')}
    </script>
${STYLE_RAW.replace('</style>', ARTICLE_CSS + '\n    </style>')}
    <link rel="alternate" type="text/plain" title="TCC facts for AI assistants (llms.txt)" href="/llms.txt" />
    <link rel="alternate" type="text/plain" title="TCC full reference for AI assistants (llms-full.txt)" href="/llms-full.txt" />
    <link rel="alternate" type="application/json" title="TCC structured facts (llms.json)" href="/llms.json" />
    <link rel="alternate" type="application/jsonl" title="TCC Q&A bank (faq.jsonl)" href="/faq.jsonl" />
    <link rel="alternate" type="text/plain" title="TCC AI crawler policy (ai.txt)" href="/ai.txt" />
  </head>
  <body>
    <div class="app-shell baseline-root">
${sidebar}

      <main class="main-scroll">
${HEADER}

        <div class="content-wrap">
          <!-- ═══════ ARTICLE HERO ═══════ -->
          <header class="a-hero">
            <div class="a-hero-bg" style="background-image:url('..${IMG}/${a.image}')" aria-hidden="true"></div>
            <div class="a-hero-veil" aria-hidden="true"></div>
            <div class="a-hero-grid" aria-hidden="true"></div>
            <div class="a-hero-inner">
              <nav class="crumbs reveal" aria-label="Breadcrumb">
                <a href="/">Home</a><span class="sep">/</span><a href="/blog/">Blog</a><span class="sep">/</span><span class="cur">${a.crumb}</span>
              </nav>
              <div class="a-tag reveal">${a.tag}</div>
              <h1 class="a-title reveal">${a.h1}</h1>
              <p class="a-standfirst reveal">${a.standfirst}</p>
              <div class="a-byline reveal">
                <span class="who">The Coding Company</span>
                <span class="dot-sep"></span>
                <span>${a.dateLabel}</span>
                <span class="dot-sep"></span>
                <span>${a.readTime} min read</span>
              </div>
            </div>
          </header>

          <!-- ═══════ ARTICLE BODY ═══════ -->
          <article class="a-body">
${body}

            <hr />
            <h2 id="faq">Frequently asked questions</h2>
            <div class="a-faq">
${faqVisible}
            </div>

            <hr />
            <div class="a-cta reveal">
              <div class="ct-t">${a.cta.title}</div>
              <p class="ct-d">${a.cta.desc}</p>
              <div class="ct-row">
                <a class="btn btn-sm" href="${a.cta.primaryHref}">${a.cta.primary}</a>
                <a class="btn btn-ghost btn-sm" href="${a.cta.secondaryHref}">${a.cta.secondary}</a>
              </div>
            </div>
          </article>

          <!-- ═══════ RELATED ═══════ -->
          <section class="section" style="padding-top:64px">
            <div class="container" style="max-width:900px">
              <div class="eyebrow reveal" style="margin-bottom:16px">Keep reading</div>
              <h2 class="section-title reveal">Related guides</h2>
              <div class="a-related">
${related}
              </div>
            </div>
          </section>

          <!-- ═══════ FINAL ═══════ -->
          <section class="final">
            <div class="container reveal">
              <h2 class="final-title">${final.title}</h2>
              <p class="final-sub">${final.desc}</p>
              <div class="final-ctas">
                <a href="${final.primaryHref}" class="btn">${final.primary}</a>
                <a href="${final.secondaryHref}" class="btn btn-ghost">${final.secondary}</a>
              </div>
            </div>
          </section>

${FOOTER}
        </div>
      </main>

${NAV}
    </div>

    <script>
      document.getElementById('year').textContent = new Date().getFullYear();

      /* Scroll reveal — IntersectionObserver, with a scroll fallback for the
         nested .main-scroll container. */
      (function () {
        var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
        if (!items.length) return;
        var done = false;

        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
        items.forEach(function (el) { io.observe(el); });

        function fallback() {
          if (done) return;
          var h = window.innerHeight || document.documentElement.clientHeight;
          for (var i = items.length - 1; i >= 0; i--) {
            var r = items[i].getBoundingClientRect();
            if (r.top < h * 0.92 && r.bottom > 0) { items[i].classList.add('in'); items.splice(i, 1); }
          }
          if (!items.length) done = true;
        }
        var scroller = document.querySelector('main.main-scroll') || window;
        scroller.addEventListener('scroll', fallback, { passive: true });
        window.addEventListener('resize', fallback);
        fallback();
        window.addEventListener('load', fallback);
      })();
    </script>
  </body>
</html>
`);
}

/* ══════════════════════ ARTICLES ══════════════════════ */

const ARTICLES = [
  /* ── 1. Layoffs in India news ── */
  {
    file: 'layoffs-in-india-news.html',
    crumb: 'Layoffs in India News',
    tag: 'Career News',
    date: '2026-11-27',
    dateLabel: '27 November 2026',
    readTime: 8,
    wordCount: 1450,
    image: 'hero-people-work.jpg',
    seoTitle: 'Layoffs in India News: How to Read and Respond | TCC',
    titlePlain: 'Layoffs in India News: How to Read and Respond',
    h1: 'Layoffs in India news, <span class="accent">read calmly</span>.',
    description:
      'Separate confirmed layoff facts from speculation, read what a report actually says, and choose a clear next step without inventing a crisis.',
    standfirst:
      'A layoff headline can make a stable job feel temporary. Before you change anything, separate what is confirmed from what is inferred — then take a few reversible steps that improve your position either way.',
    keywords: ['layoffs in India', 'India layoff news', 'tech layoffs India', 'layoff news', 'career planning after layoffs', 'job security India'],
    about: ['Layoffs', 'India jobs', 'Career planning', 'Hiring'],
    mentions: [],
    body: [
      {
        html: `<p class="a-lede">When layoffs dominate the feed, the useful question is not "is everyone at risk?" It is "what is actually confirmed here, and what can I do this week that helps whether or not my role changes?" Those are two different questions, and mixing them is how a news cycle turns into a bad career decision.</p>`,
      },
      { h2: 'First, sort the report from the rumour', id: 'sort-report' },
      {
        html: `<p>A headline is a compressed claim. Before you forward it, comment on it, or plan around it, ask four things: who is named, what action is described, who confirms it, and whether later reporting has changed the earlier version.</p>`,
      },
      {
        html: `<ul>
          <li><strong>Company statement.</strong> The clearest source for what a company says it did, provided you read the full statement rather than a quote of a quote.</li>
          <li><strong>Official filing or update, where relevant.</strong> Some organisations have formal disclosure obligations. A filing is stronger than a social post, but it still needs to be read in context.</li>
          <li><strong>Independent reporting that names its source.</strong> "People familiar with the matter" is a source type, not a confirmation. It is worth weighing, not treating as settled fact.</li>
          <li><strong>Dates and scope.</strong> A report about a past quarter, a single division or a proposed change is not the same as a current, company-wide action.</li>
        </ul>`,
      },
      {
        html: `<div class="a-callout reveal"><div class="co-label">A simple rule</div><p>Do not make a decision from a screenshot, a repost, or an unnamed internal note. Wait for a company statement, an official filing where one is relevant, or reporting that clearly says who supplied the claim.</p></div>`,
      },
      { h2: 'Read the wording carefully', id: 'wording' },
      {
        html: `<p>Layoff coverage uses several kinds of language that are often treated as interchangeable. They are not the same claim.</p>`,
      },
      {
        html: `<div class="a-flag">
          <div class="fl bad reveal"><strong class="fl-h">"Mass layoffs" in a headline</strong><p>Open the report. The body may describe a fear, a rumour, or a company denial rather than a confirmed action. The headline is not the evidence.</p></div>
          <div class="fl good reveal"><strong class="fl-h">"Roles affected" with a named source</strong><p>This is more precise. Check the scope, the team, and whether the company has confirmed it before you draw a conclusion about your own job.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">"Hiring freeze"</strong><p>This usually describes future openings, not a decision about current employees. It matters most if you are applying, not necessarily if you are already employed.</p></div>
          <div class="fl good reveal"><strong class="fl-h">"Restructuring" or "reorganisation"</strong><p>These can involve role changes, team moves or a smaller footprint. Ask what actually changes for the people involved instead of relying on the word itself.</p></div>
        </div>`,
      },
      {
        html: `<p>A denial of mass layoffs does not mean nothing changed. A hiring freeze does not mean current employees are affected. Precision is not pedantry; it is what stops you from preparing for the wrong risk.</p>`,
      },
      { h2: 'Check your own position without catastrophising', id: 'own-position' },
      {
        html: `<p>Once you know what the report actually says, look at your own work with the same discipline. You are not trying to prove that you are safe. You are trying to understand what would be easy or hard to replace if the organisation changed.</p>`,
      },
      {
        html: `<ul>
          <li><strong>Proximity.</strong> Is your role tied to a project, client or business unit named in the report?</li>
          <li><strong>Feedback.</strong> What have you been told recently about the quality and value of your work? Written feedback is more useful than memory.</li>
          <li><strong>Dependence.</strong> Who relies on your output, and could they explain what you do in one sentence?</li>
          <li><strong>Portability.</strong> Which parts of your work would still be relevant in another company or another team?</li>
        </ul>`,
      },
      {
        html: `<p>If the answers are uncomfortable, that is useful information. It points to what you can change now, while you still have time and a stable base to work from.</p>`,
      },
      { h2: 'A short plan that helps either way', id: 'short-plan' },
      {
        html: `<p>You do not need to quit, confront anyone, or rewrite your life after a headline. You need a few reversible moves that are useful whether or not anything happens to your role.</p>`,
      },
      {
        html: `<div class="a-phases">
          <div class="a-phase reveal"><div class="ph-n">01</div><div><div class="ph-t">Build an evidence file</div><p class="ph-d">Write one line for each piece of work you are proud of: what you did, what changed, and how you know. Keep it factual. This becomes the source for your resume, your profile and your interview answers.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">02</div><div><div class="ph-t">Refresh the resume around outcomes</div><p class="ph-d">Move your most relevant work to the top. Replace adjectives with things a reader can check. Do not add a number, a title or a result you cannot defend in an interview.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">03</div><div><div class="ph-t">Map adjacent roles</div><p class="ph-d">List the job titles your experience already supports, not the ones you aspire to in the abstract. Read a few real postings and note which requirements you meet and which you do not.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">04</div><div><div class="ph-t">Have two calm conversations</div><p class="ph-d">Ask a manager about team priorities and ask a peer what they are seeing in the market. Frame both as planning questions, not as accusations based on a headline.</p></div></div>
        </div>`,
      },
      { h2: 'What not to do in the first hour', id: 'first-hour' },
      {
        html: `<div class="a-flag">
          <div class="fl bad reveal"><strong class="fl-h">Do not post a panic update</strong><p>A public reaction can travel faster than the correction, and it can affect how colleagues and future employers read your judgement.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Do verify before you discuss</strong><p>Read the full report, check the original source, and separate what is confirmed from what is being speculated about.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">Do not stop doing your job</strong><p>Withdrawing from work because of an unconfirmed headline makes the situation worse for you and for the team around you.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Do make your work legible</strong><p>Summarise what you own, what you shipped and where you helped. Clarity is useful in a review, a referral conversation or an application.</p></div>
        </div>`,
      },
      { h2: 'If you are directly affected', id: 'directly-affected' },
      {
        html: `<p>If the change is real and it applies to you, move from headlines to documents. Find out the effective date, the notice or severance terms, what happens to handover, whether internal roles are possible, and what you can ask to have confirmed in writing. Do not sign anything you have not had time to read.</p>`,
      },
      {
        html: `<p>Then work in stages. Stabilise the immediate details. Document your work while it is fresh. Decide which roles actually fit your experience. Only then start applying in a focused way. A rushed application driven by fear is rarely better than a considered one sent a little later.</p>`,
      },
      { h2: 'Where AI fits, and where it does not', id: 'ai-fits' },
      {
        html: `<p>AI can help you turn scattered notes into a clear resume, draft a thoughtful outreach message, and practise answers to interview questions. It cannot tell you which roles will survive a news cycle, and it should never invent a result on your resume. Use it as a drafting aid and verify every claim before it leaves your hands.</p>`,
      },
      {
        html: `<p>If you want to build a practical habit around this, start with <a href="/blog/how-to-work-with-ai.html">how to work with AI</a>: choose the task, give context, check the output, and keep the decision yourself.</p>`,
      },
      {
        html: `<div class="a-cta reveal"><div class="ct-t">Turn uncertainty into a clear next step</div><p class="ct-d">See how TCC Placement Partner builds portfolio evidence, role positioning and interview readiness before employer conversations begin.</p><div class="ct-row"><a class="btn btn-sm" href="/placement/">Explore placement support</a><a class="btn btn-ghost btn-sm" href="/blog/how-to-read-a-job-description.html">Read the job-description guide</a></div></div>`,
      },
    ],
    faq: [
      {
        q: 'Should I leave a company because of layoff headlines?',
        a: 'A headline is a prompt to assess, not a signal to resign. Look at your own role, recent feedback, financial position and options before making any irreversible decision.',
      },
      {
        q: 'How do I know if a layoff report is confirmed?',
        a: 'Look for a company statement, an official filing where one is relevant, or reporting that clearly names its source. A repost, screenshot or unverified internal note is not confirmation.',
      },
      {
        q: 'What should I update first if layoffs worry me?',
        a: 'Start with an evidence file: one line per piece of work, with what you did, what changed and how you know. It can feed your resume, your profile and your interviews without inventing anything.',
      },
      {
        q: 'Does every layoff story have one cause?',
        a: 'No. Reports may point to restructuring, cost changes, automation or business conditions, and commentary often mixes those with opinion. Separate the stated reason from what a writer infers from it.',
      },
      {
        q: 'Should I talk to my manager about layoff news?',
        a: 'If it is done respectfully and framed around priorities, a calm conversation can help. Ask what the team is focused on and where your work fits, rather than presenting an unverified report as fact.',
      },
    ],
    final: {
      title: 'Careers change. Evidence travels.<br /><span class="serif-i">Build what you can explain.</span>',
      desc: 'Keep your skills visible and your next step clear, whatever the hiring cycle does.',
      primary: 'Browse all guides',
      primaryHref: '/blog/',
      secondary: 'How placement works',
      secondaryHref: '/placement/',
    },
    cta: {
      title: 'Turn uncertainty into a clear next step.',
      desc: 'Focus on evidence, role alignment and interview readiness you can control.',
      primary: 'Explore placement support',
      primaryHref: '/placement/',
      secondary: 'Read the job-description guide',
      secondaryHref: '/blog/how-to-read-a-job-description.html',
    },
    related: [
      { tag: 'AI at Work', title: 'How to Work With AI', desc: 'A practical workflow for real tasks: brief, context, verification and human ownership.', href: '/blog/how-to-work-with-ai.html' },
      { tag: 'Interview', title: 'How to Read a Job Description', desc: 'Decode what a posting actually asks for and map your evidence to it.', href: '/blog/how-to-read-a-job-description.html' },
    ],
  },

  /* ── 2. How to work with AI ── */
  {
    file: 'how-to-work-with-ai.html',
    crumb: 'How to Work With AI',
    tag: 'AI at Work',
    date: '2026-11-27',
    dateLabel: '27 November 2026',
    readTime: 8,
    wordCount: 1500,
    image: 'hero-ai-neural.jpg',
    seoTitle: 'How to Work With AI: A Practical Guide for Every Role | TCC',
    titlePlain: 'How to Work With AI: A Practical Guide for Every Role',
    h1: 'How to work with AI, <span class="accent">not around it</span>.',
    description:
      'A practical workflow for using AI on real work: choose the task, give context, check the output, keep the decision, and show what you contributed.',
    standfirst:
      'Working with AI is not about finding a magic prompt. It is about choosing the right task, giving enough context, verifying the result, and owning the decision that follows.',
    keywords: ['how to work with AI', 'AI at work', 'using AI at work', 'AI workflow', 'AI for professionals', 'AI collaboration', 'AI verification'],
    about: ['AI at work', 'AI literacy', 'Workplace skills', 'Career development'],
    mentions: [
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
      { name: 'AI courses by industry', url: `${SITE}/ai-courses-for/` },
    ],
    body: [
      {
        html: `<p class="a-lede">Most people use AI casually and then conclude it is either useless or magical. The difference is usually workflow. Treat an assistant like a capable but context-poor colleague: clear brief, visible reasoning, and a review step before anything goes out under your name.</p>`,
      },
      { h2: 'Start with the task, not the tool', id: 'start-task' },
      {
        html: `<p>Before you open an assistant, name the job you need done. Summarising, comparing, drafting, extracting, brainstorming, testing and explaining all require different inputs and different checks. "Use AI on this" is not a brief.</p>`,
      },
      {
        html: `<div class="a-flag">
          <div class="fl good reveal"><strong class="fl-h">Good first use — summarise a long document</strong><p>Give it the document and ask for the decision points, not a vague overview. Then check the summary against the source.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Good first use — draft a difficult message</strong><p>Give the audience, the purpose and the tone you want. Then rewrite the parts that do not sound like you.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">Poor use — invent a fact to fill a gap</strong><p>If you do not have a number, name or citation, ask the tool to mark it as missing. Do not let a plausible sentence become your evidence.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">Poor use — outsource a final judgement</strong><p>Hiring, safety, money and commitments to clients need context and accountability. The assistant can prepare the options; you still own the decision.</p></div>
        </div>`,
      },
      { h2: 'The loop that makes AI useful', id: 'the-loop' },
      {
        html: `<p>Once the task is clear, run the same loop every time. It is deliberately boring, because a repeatable process beats a clever prompt you cannot reproduce.</p>`,
      },
      {
        html: `<div class="a-phases">
          <div class="a-phase reveal"><div class="ph-n">01</div><div><div class="ph-t">Frame the job</div><p class="ph-d">Say what you need, who it is for, what good looks like, and what the tool must not do. Constraints are more useful than adjectives.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">02</div><div><div class="ph-t">Supply context</div><p class="ph-d">Paste the source material, define terms, and share decisions already made. An assistant cannot infer your workplace context from a single sentence.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">03</div><div><div class="ph-t">Ask for options and risks</div><p class="ph-d">Request more than one version and ask which assumptions each one makes. This turns the output into a draft you can challenge, not an answer you have to accept.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">04</div><div><div class="ph-t">Verify and own</div><p class="ph-d">Check facts, names, numbers, links and tone against your sources. Then make the final decision yourself. If you cannot explain the output with the tool closed, it is not ready.</p></div></div>
        </div>`,
      },
      {
        html: `<div class="a-callout reveal"><div class="co-label">The line to hold</div><p>AI can draft, compare, summarise and challenge. It cannot sign off on your work. The moment a tool output leaves your hands, it is your judgement on the page.</p></div>`,
      },
      { h2: 'Use AI without inventing evidence', id: 'no-invented-evidence' },
      {
        html: `<p>Fluent text is not the same as accurate text. This matters most in resumes, reports, proposals and interview answers, where a single invented result can undo the trust you built over a much longer period.</p>`,
      },
      {
        html: `<ul>
          <li><strong>Ask the tool to mark assumptions.</strong> Anything it could not verify should be visibly flagged, not quietly smoothed over.</li>
          <li><strong>Cross-check against source documents.</strong> If a fact is not in the material you supplied, treat it as missing until you find it elsewhere.</li>
          <li><strong>Keep your own edit trail.</strong> Note what you accepted, changed and rejected. It helps you revise later and makes your contribution clear.</li>
          <li><strong>Respect data boundaries.</strong> Do not paste personal, confidential or unpublished material into a tool your organisation has not approved for that use.</li>
        </ul>`,
      },
      { h2: 'Make it specific to your role', id: 'role-specific' },
      {
        html: `<p>A marketer, operations lead, nurse, analyst and developer do not need the same AI syllabus. Learn the workflow around the artefacts your role actually produces: briefs, handovers, dashboards, emails, test plans, documentation or customer replies.</p>`,
      },
      {
        html: `<p>That is why role-based learning beats a generic prompt collection. You practise with the documents and decisions you will face, rather than with examples that never appear in your work. Browse <a href="/ai-courses-for/">AI courses by role and industry</a> to find the track that matches your job title.</p>`,
      },
      { h2: 'Show the work in interviews', id: 'interviews' },
      {
        html: `<p>If you use AI in your job, be ready to explain how. A clear answer — what you asked, what you checked, and what you changed — is stronger than pretending you worked without tools. Check the employer's policy first, because rules differ.</p>`,
      },
      {
        html: `<ul>
          <li><strong>What was the brief?</strong> Show that you directed the tool rather than accepting whatever came back.</li>
          <li><strong>Which assumption did you reject?</strong> This is where your judgement becomes visible.</li>
          <li><strong>How did you verify it?</strong> Name the source or test you used, not just the fact that you "reviewed" it.</li>
        </ul>`,
      },
      {
        html: `<p>For the wider policy question, read <a href="/blog/ai-tools-in-interviews.html">AI tools in an interview: what is allowed and what gets you rejected</a>. The short version is that disclosure rules vary, and asking before the interview is better than guessing.</p>`,
      },
      { h2: 'A small habit that compounds', id: 'habit' },
      {
        html: `<p>Keep a working log: the task, the brief, the output, the checks you ran and the decision you made. Over time you build a private library of prompts and review rules that fit your role. The tools will change. The habit of brief, verify and own will not.</p>`,
      },
      {
        html: `<div class="a-cta reveal"><div class="ct-t">Learn AI for the job you actually do</div><p class="ct-d">Find role-based AI certifications that practise the tasks and documents your role produces.</p><div class="ct-row"><a class="btn btn-sm" href="/ai-courses-for/">Find your role track</a><a class="btn btn-ghost btn-sm" href="/blog/ai-tools-in-interviews.html">Read the interview policy guide</a></div></div>`,
      },
    ],
    faq: [
      {
        q: 'Is using AI at work cheating?',
        a: 'Only if your workplace or client has said it is not allowed. Ask first, disclose where required, and keep responsibility for the final work.',
      },
      {
        q: 'What should I never put into an AI tool?',
        a: 'Anything your organisation has not approved for that tool, especially personal data, confidential client material, credentials and unpublished financial information.',
      },
      {
        q: 'How do I trust the output?',
        a: 'Check it against source material, look for invented names or numbers, and test the reasoning on a case you already know. Do not treat fluent text as evidence.',
      },
      {
        q: 'Can AI replace my judgement?',
        a: 'No. It can prepare options and expose gaps, but accountability stays with you. The decision should reflect goals, constraints and context the tool may not have.',
      },
      {
        q: 'How do I learn AI for my role?',
        a: 'Start with the artefacts your role produces, then find a course or credential that practises those tasks. Browse the role and industry hubs on this site to match learning to your job title.',
      },
    ],
    final: {
      title: 'Use AI as a tool, not a story.<br /><span class="serif-i">Show the work behind it.</span>',
      desc: 'Learn the workflow for your role, then build proof of the decisions you can make with it.',
      primary: 'Find your AI role track',
      primaryHref: '/ai-courses-for/',
      secondary: 'Browse certifications',
      secondaryHref: '/bootcamps/',
    },
    cta: {
      title: 'Learn AI for the job you actually do.',
      desc: 'Find role-based AI certifications, then build proof of the work you can do with them.',
      primary: 'Find your role track',
      primaryHref: '/ai-courses-for/',
      secondary: 'Read the interview policy guide',
      secondaryHref: '/blog/ai-tools-in-interviews.html',
    },
    related: [
      { tag: 'Career News', title: 'Layoffs in India News', desc: 'How to verify a report, read the wording and plan a clear next step.', href: '/blog/layoffs-in-india-news.html' },
      { tag: 'AI Career', title: 'Role-Based AI Certifications vs Generic AI Courses', desc: 'Why a credential that names your job title beats a general certificate.', href: '/blog/role-based-ai-certifications-vs-generic.html' },
    ],
  },

  /* ── 3. AI Placement Programs ── */
  {
    file: 'ai-placement-programs.html',
    crumb: 'AI Placement Programs',
    tag: 'Placement',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 9,
    wordCount: 2100,
    image: 'hero-network.jpg',
    seoTitle: 'AI Placement Programs Explained: How to Get Placed After Learning AI | TCC',
    titlePlain: 'AI Placement Programs Explained: How to Get Placed After Learning AI',
    h1: 'AI placement programs, <span class="accent">explained honestly</span>.',
    description:
      'What an AI placement program actually does, the red flags that separate a real one from marketing, and how TCC Placement Partner works in four phases toward 10,000 offer letters a year.',
    standfirst:
      'Learning AI is not the hard part — proving it to an employer is. Here is what a serious AI placement program does, what it cannot promise, and how to judge one before you pay anything.',
    keywords: ['AI placement program', 'AI placement programs', 'AI internship placement', 'AI job placement', 'TCC Placement Partner', 'placement after learning AI', 'role-based AI certification'],
    about: ['AI placement', 'AI careers', 'AI internships', 'Employment'],
    mentions: [
      { name: 'TCC Placement Partner', url: `${SITE}/placement/`, type: 'Service' },
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
      { name: 'AI courses by industry', url: `${SITE}/ai-courses-for/` },
    ],
    body: [
      {
        html: `<p class="a-lede">Every week another course platform adds the word "placement" to its landing page. Very few of them change what actually happens to you after you finish the last module. So it is worth being precise about the thing you are buying when you buy AI placement support — and being equally precise about what nobody can honestly sell you.</p>`,
      },
      {
        html: `<p>An <strong>AI placement program</strong> is a structured, employer-facing service that sits <em>after</em> your learning and answers one question: how does a hiring manager come to believe you can do the job? It is not a course. It is not a certificate. It is the machinery that turns the two of them into interviews, offers, and a signed letter.</p>`,
      },
      {
        html: `<div class="a-stats reveal"><div class="a-stat"><div class="num">10,000</div><div class="lbl">Offer letters per year — TCC Placement Partner's published goal</div></div><div class="a-stat"><div class="num">262</div><div class="lbl">Roles with a dedicated AI credential ladder on TCC CERT+</div></div><div class="a-stat"><div class="num">32</div><div class="lbl">Industries covered by role-specific AI course hubs</div></div></div>`,
      },
      { h2: 'What a placement program is actually for', id: 'what-its-for' },
      {
        html: `<p>Most people assume the gap between "I learned AI" and "I got hired" is a knowledge gap. It usually is not. By the time someone has finished a serious AI course, they know enough to be useful. The gap is almost always one of three things, and each one has to be solved separately.</p>`,
      },
      {
        html: `<ul>
          <li><strong>Proof.</strong> A certificate says you sat through material. A working project with your name on it says you can build. Employers fund the second one.</li>
          <li><strong>Framing.</strong> Your existing experience is not a liability. A warehouse supervisor who can automate inventory forecasting is a stronger candidate than a generic AI graduate with no domain context — if the story is told correctly.</li>
          <li><strong>Access.</strong> The overwhelming majority of roles are never advertised in a way a cold applicant can win. Placement work is largely the unglamorous business of getting your name in front of a person who is hiring.</li>
        </ul>`,
      },
      {
        html: `<div class="a-callout reveal"><div class="co-label">The honest version</div><p>A placement program can dramatically improve your conversion rate from applications to interviews, and from interviews to offers. It cannot manufacture demand for a role that does not exist, and it cannot bypass an employer's own hiring bar. Any provider claiming otherwise is selling you hope, not a service.</p></div>`,
      },
      { h2: 'The four phases that actually move the needle', id: 'four-phases' },
      {
        html: `<p>TCC Placement Partner runs in four phases. They are deliberately ordered, because each one makes the next one cheaper to run — a candidate with a real portfolio needs far less interview rescue than one without.</p>`,
      },
      {
        html: `<div class="a-phases">
          <div class="a-phase reveal"><div class="ph-n">01</div><div><div class="ph-t">Portfolio before paperwork</div><p class="ph-d">You finish with deployed, inspectable work — a live URL and a public repository. This is the asset everything else is built on, and it is why the phase comes first. Nothing in placement outranks a project a hiring manager can open in a browser.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">02</div><div><div class="ph-t">Role-aligned positioning</div><p class="ph-d">Your resume, your project write-ups and your one-line story are rewritten around the exact job title you are targeting — not around "AI" in the abstract. This is where the role-based certification earns its keep: it gives the credential a job title to attach to.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">03</div><div><div class="ph-t">Interview and technical readiness</div><p class="ph-d">Structured practice on the questions your specific role gets asked, plus the ability to explain your own project under pressure. Most rejections at this stage come from being unable to narrate your own work clearly, not from being unable to do it.</p></div></div>
          <div class="a-phase reveal"><div class="ph-n">04</div><div><div class="ph-t">Employer connections</div><p class="ph-d">Warm introductions and referrals into companies that are already hiring for the role you trained for. This is the phase people imagine when they hear "placement" — but it only works because phases one to three made you easy to refer.</p></div></div>
        </div>`,
      },
      { h2: 'Red flags: how to tell a real program from a marketing page', id: 'red-flags' },
      {
        html: `<p>The AI education market has a placement-shaped hole in it, and a lot of providers have rushed to fill that hole with words rather than infrastructure. These are the tells.</p>`,
      },
      {
        html: `<div class="a-flag">
          <div class="fl bad reveal"><strong class="fl-h">Red flag — a guarantee with no mechanism</strong><p>"Guaranteed placement" with no description of the process behind it. A real program will tell you exactly what happens in week one, who does the referring, and what its conversion looks like.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Green flag — a published goal and a stated method</strong><p>A number you can hold them to, alongside the four-ish phases that produce it. TCC publishes 10,000 offer letters per year as a target — a goal, not a promise, and one that implies a visible pipeline.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">Red flag — placement as an afterthought</strong><p>Placement support announced only on the final slide, purchased from a third party, or defined as "resume review". If nothing in the earlier curriculum was built to be shown to an employer, nothing later can fix it.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Green flag — role-specific outcomes</strong><p>The program can name the job titles it places into and show the credentials that map to them. Generic "AI jobs" claims mean nobody has thought about your actual role.</p></div>
          <div class="fl bad reveal"><strong class="fl-h">Red flag — money-back only on impossible terms</strong><p>Guarantees that depend on attendance thresholds, undisclosed tests, or roles you would never accept. Read the conditions before the headline.</p></div>
          <div class="fl good reveal"><strong class="fl-h">Green flag — portfolio is non-negotiable</strong><p>The program refuses to start placement until you have something deployed. That friction is a good sign: it means they know what employers actually look at.</p></div>
        </div>`,
      },
      {
        html: `<div class="a-quote reveal"><p>"The certificate gets you the meeting. The deployed project gets you the offer. Confusing the two is the most expensive mistake in AI job hunting."</p></div>`,
      },
      { h2: 'Should you pay for placement support at all?', id: 'should-you-pay' },
      {
        html: `<p>Sometimes no. If you already have a strong network, a portfolio, and a clear target role, you do not need a placement program — you need three weekends and a good template. Be honest about which situation you are in.</p>`,
      },
      {
        html: `<p>Placement support earns its cost in a specific case: you are switching into an AI-heavy version of your role, you have domain experience but no visible proof of AI skill, and you are not plugged into the companies hiring for that exact title. That is a solvable problem, and it is the problem the four phases above are built to solve.</p>`,
      },
      {
        html: `<p>What it is not is a substitute for the learning. Placement multiplies a real skill; it cannot multiply zero. If you have not built anything yet, that is the phase to start with — and it is the one that is entirely in your hands.</p>`,
      },
      { h2: 'How this connects to role-based certification', id: 'connect' },
      {
        html: `<p>The reason TCC pairs placement with <a href="/bootcamps/">role-based AI certifications</a> rather than generic AI courses is structural. A credential that names your job title — <em>AI for HSE Officers</em>, <em>AI for Risk Managers</em>, <em>AI for Store Operations Leads</em> — does two jobs at once. It tells you which AI skills are worth your time, and it gives a placement team a target to position you against.</p>`,
      },
      {
        html: `<p>Across 262 roles and 32 industries, that mapping is the spine of the whole program. Start by finding <a href="/ai-courses-for/">the hub for your industry</a>, identify the tier that matches your experience, and work backwards from there.</p>`,
      },
      {
        html: `<div class="a-cta reveal"><div class="ct-t">See how TCC Placement Partner works</div><p class="ct-d">Portfolio building, role-aligned positioning, interview readiness and employer connections — with a published goal of 10,000 offer letters per year.</p><div class="ct-row"><a class="btn btn-sm" href="/placement/">Explore the placement program</a><a class="btn btn-ghost btn-sm" href="/bootcamps/">Browse 1,048 certifications</a></div></div>`,
      },
    ],
    faq: [
      {
        q: 'What is an AI placement program?',
        a: 'An AI placement program is a structured, employer-facing service that runs after your AI training and focuses on getting you hired — typically covering portfolio building, resume and role positioning, interview preparation, and warm introductions to hiring companies. It is distinct from the course itself and from the certification.',
      },
      {
        q: 'Does TCC guarantee a job placement?',
        a: 'No. TCC Placement Partner publishes a goal of 10,000 offer letters per year and describes its four-phase process, but it does not guarantee employment. Guaranteed-placement claims with no described mechanism are a red flag in this market.',
      },
      {
        q: 'What are the four phases of TCC Placement Partner?',
        a: 'Phase 1 is portfolio before paperwork — you deploy real, inspectable work with a live URL and public repository. Phase 2 is role-aligned positioning, rewriting your resume and story around a specific job title. Phase 3 is interview and technical readiness. Phase 4 is employer connections through warm introductions and referrals.',
      },
      {
        q: 'Is a placement program worth paying for?',
        a: 'It depends on your starting point. If you already have a network, a portfolio and a clear target role, you likely do not need one. It earns its cost when you are moving into an AI-heavy version of your role, have domain experience but no visible proof of AI skill, and are not connected to the companies hiring for that exact title.',
      },
      {
        q: 'How does role-based AI certification help with placement?',
        a: 'A credential tied to your job title does two things: it tells you which AI skills are actually relevant to your role, and it gives a placement team a specific job title to position you against. That is why TCC maps placements to 262 roles across 32 industries rather than treating AI as one generic skill.',
      },
    ],
    cta: {
      title: 'Placement works better with a credential behind it.',
      desc: 'Find the role-based AI certification that names your job title, then let the placement programme do the rest.',
      primary: 'Explore certifications',
      primaryHref: '/bootcamps/',
      secondary: 'AI courses by role',
      secondaryHref: '/ai-courses-for/',
    },
    related: [
      { tag: 'Internships', title: 'How to Get an AI Internship in 2026', desc: 'A step-by-step roadmap from zero experience to your first AI internship, including the portfolio that convinces and the outreach that gets replies.', href: '/blog/how-to-get-ai-internship-2026.html' },
      { tag: 'AI Career', title: 'Role-Based AI Certifications vs Generic AI Courses', desc: 'Why a credential that names your job title beats a general certificate in the hiring stack — and when a broad AI course is still the right call.', href: '/blog/role-based-ai-certifications-vs-generic.html' },
    ],
  },

  /* ── 2. AI Internship 2026 ── */
  {
    file: 'how-to-get-ai-internship-2026.html',
    crumb: 'How to Get an AI Internship in 2026',
    tag: 'Internships',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 8,
    wordCount: 1950,
    image: 'hero-people-work.jpg',
    seoTitle: 'How to Get an AI Internship in 2026: A Practical Guide for Students | TCC',
    titlePlain: 'How to Get an AI Internship in 2026: A Practical Guide for Students',
    h1: 'How to get an <span class="accent">AI internship</span> in 2026.',
    description:
      'A step-by-step roadmap from zero experience to your first AI internship: the skills that matter, the portfolio that convinces, and the outreach that actually gets replies.',
    standfirst:
      'Most students apply to hundreds of internships and hear nothing. The ones who get offers usually did three unglamorous things first. Here is the sequence, in order.',
    keywords: ['AI internship', 'how to get an AI internship', 'AI internship 2026', 'AI internship for students', 'AI portfolio', 'AI internship roadmap', 'student AI experience'],
    about: ['AI internships', 'AI careers', 'Students', 'Hiring'],
    mentions: [
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
      { name: 'TCC Placement Partner', url: `${SITE}/placement/`, type: 'Service' },
      { name: 'AI courses by industry', url: `${SITE}/ai-courses-for/` },
    ],
    body: [
      {
        html: `<p class="a-lede">If you are a student reading this in 2026, you have already noticed the pattern. The internships that look most exciting are the ones with a thousand applicants, and the ones you can realistically win are the ones nobody told you about. Closing that gap is not about luck. It is a sequence, and almost everybody does it in the wrong order.</p>`,
      },
      { h2: 'The mistake almost every student makes', id: 'the-mistake' },
      {
        html: `<p>The default student strategy is: apply first, build later. You write a resume listing courses, you send it to forty companies, and you wait. When nothing comes back, you assume you need more courses. So you take more courses, and the resume gets longer, and the results do not change.</p>`,
      },
      {
        html: `<p>The problem is sequencing. An internship application is a claim, and the reviewer's only job is to decide whether the claim is backed by evidence. Courses are not evidence. Deployed work is. Everything below is ordered so that the evidence exists before you start applying.</p>`,
      },
      {
        html: `<div class="a-stats reveal"><div class="a-stat"><div class="num">3</div><div class="lbl">Deployed projects is the threshold where applications start converting</div></div><div class="a-stat"><div class="num">1</div><div class="lbl">Narrow target role beats "anything in AI" every single time</div></div><div class="a-stat"><div class="num">10</div><div class="lbl">Warm conversations are worth more than 100 cold applications</div></div></div>`,
      },
      { h2: 'Step 1 — Pick one narrow target role', id: 'pick-a-role' },
      {
        html: `<p>"AI internship" is not a role. Hiring managers do not have a budget line for it. They have a budget line for a data analyst intern, a marketing automation intern, a QA intern who can write test generation prompts, a junior developer who can work with an AI coding assistant.</p>`,
      },
      {
        html: `<p>Pick one of those. It should be a role that exists in companies you can actually name, and ideally one that connects to something you already study. If you are a commerce student, an AI-flavoured analyst role is a shorter bridge than an ML research internship. Use <a href="/ai-courses-for/">the industry hubs</a> to see what roles exist in your field and what the AI version of each one looks like.</p>`,
      },
      {
        html: `<div class="a-callout reveal"><div class="co-label">Narrow beats broad</div><p>A student who says "I want to be an AI-assisted financial analyst" gets taken seriously faster than one who says "I want to work in AI". Specificity is not a limitation — it is the thing that makes you referable.</p></div>`,
      },
      { h2: 'Step 2 — Build three things, and deploy all three', id: 'build-three' },
      {
        html: `<p>This is the step people skip, and it is the one that decides everything. Three projects, each deployed to a live URL with a public repository. Not notebooks. Not certificates. Things a stranger can open in a browser and use.</p>`,
      },
      {
        html: `<ol>
          <li><strong>A tool that solves a real, boring problem</strong> in your target domain. If your target is financial analysis, build something that reads a company's filings and summarises the risk sections. Boring and useful beats clever and useless.</li>
          <li><strong>Something that uses an AI model in a non-obvious way</strong> — retrieval over your own documents, an agent that calls two tools, a workflow that saves someone an hour a week. The reviewer is looking for judgement, not for a novel algorithm.</li>
          <li><strong>Something that shows you can ship</strong>: a live URL, sensible README, a commit history that is not one giant dump on the last day. This is the project that gets you the interview even if the other two are imperfect.</li>
        </ol>`,
      },
      {
        html: `<p>Write each one up in 150 words: what problem, what you built, what you would do next. That write-up becomes the top of your resume and the script for your interview answers. If you want a longer runway before this step, a role-specific credential ladder such as the ones on <a href="/bootcamps/">TCC CERT+</a> is designed to end in exactly this kind of artifact rather than in a multiple-choice exam.</p>`,
      },
      { h2: 'Step 3 — Make the application easy to say yes to', id: 'easy-yes' },
      {
        html: `<p>With the work in place, the application stops being a plea and becomes a short, factual email. Structure matters more than prose here.</p>`,
      },
      {
        html: `<ul>
          <li><strong>One line on the role</strong> you are applying for, named exactly as the company named it.</li>
          <li><strong>One line on what you built</strong> that is relevant to that role, with the live link.</li>
          <li><strong>One line on why this company</strong> — something specific enough that it could not have been sent to anyone else.</li>
          <li><strong>One ask</strong>: a 15-minute conversation, or consideration for the internship. Not both, not five.</li>
        </ul>`,
      },
      {
        html: `<p>The whole thing should fit on a phone screen without scrolling. Most internship emails fail because they ask the reader to do work: to open an attachment, to infer relevance, to guess what you want.</p>`,
      },
      { h2: 'Step 4 — Go warm, not wide', id: 'warm-not-wide' },
      {
        html: `<p>Cold applications have terrible odds for students, and it is not personal — internship pipelines are often filled before they are posted. Warm paths are what actually work, and they are more available than students think.</p>`,
      },
      {
        html: `<ul>
          <li><strong>Alumni from your college</strong> who now work at companies you are targeting. One message, one specific question about their role.</li>
          <li><strong>People who wrote or built something</strong> you used in one of your three projects. Reference the thing, ask a real question about it.</li>
          <li><strong>Community events and webinars</strong> in your city. A five-minute conversation after a session routinely outperforms a hundred sent applications. TCC runs regular sessions — see <a href="/webinars">the webinars page</a>.</li>
        </ul>`,
      },
      {
        html: `<div class="a-quote reveal"><p>"Nobody hires an intern they have never heard of. Ten real conversations will outplace a hundred perfectly formatted applications."</p></div>`,
      },
      { h2: 'What to do when you keep getting rejected', id: 'rejections' },
      {
        html: `<p>Rejection at the application stage usually means the evidence was not visible. Rejection at the interview stage usually means you could not explain your own project clearly. Those are different problems and they get different fixes.</p>`,
      },
      {
        html: `<p>If applications are not converting, the fix is upstream: deploy one more project, tighten the target role, or switch from cold to warm outreach. If interviews are not converting, the fix is rehearsal — you should be able to talk for five uninterrupted minutes about the design decisions in your own build, including the ones you got wrong. This is the same gap that <a href="/blog/ai-placement-programs.html">placement programs</a> exist to close.</p>`,
      },
      {
        html: `<div class="a-cta reveal"><div class="ct-t">Build the evidence first.</div><p class="ct-d">TCC CERT+ maps 262 roles to four-tier AI certification ladders, each ending in deployed, inspectable work — the same work your internship applications will lead with.</p><div class="ct-row"><a class="btn btn-sm" href="/bootcamps/">Find your certification</a><a class="btn btn-ghost btn-sm" href="/placement/">See the placement program</a></div></div>`,
      },
    ],
    faq: [
      {
        q: 'How do I get an AI internship with no experience?',
        a: 'Build three deployed projects in one narrow target role before you apply anywhere. Each should have a live URL, a public repository and a 150-word write-up. Then apply through warm paths — alumni, people whose work you used, and community events — rather than cold applications, which have very low odds for students with no experience.',
      },
      {
        q: 'Do I need a degree to get an AI internship?',
        a: 'Not always, but you do need visible evidence of ability. Deployed projects with public repositories demonstrate more to a hiring manager than a degree title alone. A role-based AI certification can help by naming the job title you are targeting, but the portfolio is what converts.',
      },
      {
        q: 'How many projects should I have before applying for AI internships?',
        a: 'Three is the practical threshold where applications start converting: one that solves a real problem in your target domain, one that uses AI in a non-obvious way, and one that proves you can ship — live URL, sensible README, credible commit history.',
      },
      {
        q: 'Why do cold applications for AI internships fail?',
        a: 'Internship pipelines are frequently filled through referrals and internal networks before they are publicly posted, and reviewers need to infer relevance from an attachment. Warm outreach — alumni, people whose work you used, and event conversations — consistently outperforms cold applications.',
      },
      {
        q: 'How long does it take to prepare for an AI internship?',
        a: 'Most students need a focused run of several weeks to build the three projects and write them up properly. That preparation is what makes the application work; repeating courses without deploying anything does not shorten the path to an offer.',
      },
    ],
    cta: {
      title: 'Turn coursework into a portfolio.',
      desc: 'Role-based certification ladders built to end in deployed work, not another certificate nobody opens.',
      primary: 'Browse certifications',
      primaryHref: '/bootcamps/',
      secondary: 'AI courses by industry',
      secondaryHref: '/ai-courses-for/',
    },
    related: [
      { tag: 'Placement', title: 'AI Placement Programs Explained', desc: 'What an AI placement program actually does, the red flags that separate a real one from marketing, and how TCC Placement Partner works.', href: '/blog/ai-placement-programs.html' },
      { tag: 'AI Career', title: 'Role-Based AI Certifications vs Generic AI Courses', desc: 'Why a credential that names your job title beats a general certificate in the hiring stack — and when a broad AI course is still the right call.', href: '/blog/role-based-ai-certifications-vs-generic.html' },
    ],
  },

  /* ── 3. Role-based vs generic ── */
  {
    file: 'role-based-ai-certifications-vs-generic.html',
    crumb: 'Role-Based AI Certifications vs Generic AI Courses',
    tag: 'AI Career',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 7,
    wordCount: 1800,
    image: 'hero-chip.jpg',
    seoTitle: 'Role-Based AI Certifications vs Generic AI Courses | TCC',
    titlePlain: 'Role-Based AI Certifications vs Generic AI Courses',
    h1: 'Role-based AI certification vs <span class="accent">another generic AI course</span>.',
    description:
      'Why a credential that names your job title beats a generic AI certificate in the hiring stack, how role-based ladders are structured, and when a broad AI course is still the right call.',
    standfirst:
      'Both are called "learning AI". One of them gives a hiring manager a reason to believe you specifically. Here is the difference, and how to tell which one you actually need.',
    keywords: ['role-based AI certification', 'AI certification vs AI course', 'best AI certification', 'AI course for professionals', 'job-specific AI training', 'AI certification for your job'],
    about: ['AI certification', 'Vocational qualifications', 'AI careers', 'Professional development'],
    mentions: [
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
      { name: 'TCC Placement Partner', url: `${SITE}/placement/`, type: 'Service' },
      { name: 'AI courses by industry', url: `${SITE}/ai-courses-for/` },
    ],
    body: [
      {
        html: `<p class="a-lede">There are two kinds of people shopping for AI training right now, and they need opposite things. One is trying to enter AI as a field. The other is trying to become dramatically more effective inside the job they already have. Most AI course marketing addresses the first person and quietly sells to the second. That mismatch is why so many professionals finish a course and feel like nothing changed.</p>`,
      },
      { h2: 'What "generic AI course" actually optimises for', id: 'generic' },
      {
        html: `<p>A good general AI course is a survey. It takes you across prompts, model families, embeddings, agents, evaluation, and a dozen adjacent topics, and it gives you a working vocabulary. That is genuinely valuable — and it is a poor fit for a specific problem, because it is designed to be broad by construction.</p>`,
      },
      {
        html: `<p>The giveaway is the assessment. A general course certifies you by testing breadth: did you cover the syllabus. A hiring manager reading that certificate learns what you have been exposed to. They do not learn what you can do on Monday morning in the role they are hiring for.</p>`,
      },
      { h2: 'What a role-based certification optimises for', id: 'role-based' },
      {
        html: `<p>A role-based certification inverts the design. It starts from a job title — <em>Quality Engineer</em>, <em>HR Business Partner</em>, <em>Maintenance Technician</em>, <em>Risk Manager</em> — and asks what AI changes about the work that person does all day. Then it teaches only that, and assesses it by artifact.</p>`,
      },
      {
        html: `<div class="a-flag">
          <div class="fl reveal"><strong class="fl-h">Generic AI course</strong><p>Broad survey of AI concepts. Assessed by quiz or certificate of completion. Optimises for vocabulary and confidence. Best when you genuinely do not yet know where AI fits.</p></div>
          <div class="fl reveal"><strong class="fl-h">Role-based AI certification</strong><p>Scoped to one job title's actual workflows. Assessed by deployed artifact and role-specific outcomes. Optimises for demonstrable capability. Best when you know your role and want the AI version of it.</p></div>
        </div>`,
      },
      { h2: 'Why the hiring stack favours the role-based version', id: 'hiring-stack' },
      {
        html: `<p>Recruiters filter by job title before anything else. A certification that carries a job title lands in the same mental bucket as the role; a general AI certificate lands in the "interested in AI" bucket, which is not a bucket anyone has a budget for.</p>`,
      },
      {
        html: `<ul>
          <li><strong>It answers the relevance question before it is asked.</strong> "AI for HSE Officers" tells the reviewer exactly which of your daily tasks this transfers to.</li>
          <li><strong>It gives you a defensible specialism.</strong> Ten thousand candidates have "AI fundamentals". Very few have a credential scoped to their specific function.</li>
          <li><strong>It produces a portfolio that maps to a job description.</strong> The natural output of role-based training is the exact artifact the role is hired against.</li>
          <li><strong>It compounds with your existing experience.</strong> Your domain knowledge stops being irrelevant background and becomes the thing that makes you the obvious choice.</li>
        </ul>`,
      },
      {
        html: `<div class="a-callout reveal"><div class="co-label">The rule of thumb</div><p>If you cannot put the credential's name into a sentence next to a job title, it will not help you get that job. "AI for Risk Managers" fits. "Introduction to Artificial Intelligence" does not.</p></div>`,
      },
      { h2: 'How role-based ladders are structured', id: 'ladders' },
      {
        html: `<p>One role, one flat certificate, is not enough either — a graduate and a director doing the same job title need different AI training. TCC CERT+ structures every one of its 262 roles as a four-tier ladder, so the credential always matches your actual level.</p>`,
      },
      {
        html: `<ol>
          <li><strong>Foundation</strong> — for people new to the role or early in their career. You learn to use AI safely and productively inside the job's core tasks, and you finish with one deployed artifact.</li>
          <li><strong>Practitioner</strong> — for people with a couple of years in role. You build repeatable AI workflows that replace manual effort, and you can measure the time they save.</li>
          <li><strong>Strategist</strong> — for senior individual contributors and leads. You design AI adoption for a team or function, including evaluation and risk controls.</li>
          <li><strong>Executive</strong> — for managers and directors. You make AI investment and governance decisions, and you can defend them to a board.</li>
        </ol>`,
      },
      {
        html: `<p>That structure is what makes the credential comparable across roles. An Executive-tier certification in one function carries the same weight signal as an Executive-tier certification in another, which is exactly what a hiring manager needs to calibrate you quickly.</p>`,
      },
      { h2: 'When a generic course is the better choice', id: 'when-generic' },
      {
        html: `<p>Be honest about this one, because the answer is not always the specialised option. A broad AI course is the right call when you are still deciding where AI fits into your career, when you are moving between functions and want to keep your options open, or when you are early enough that fundamentals genuinely are the bottleneck.</p>`,
      },
      {
        html: `<p>The failure mode is treating a generic course as the finish line. It is a starting line. Take it, find the part that made you think <em>this changes my actual job</em>, and then go get the role-specific credential for that thing.</p>`,
      },
      {
        html: `<div class="a-quote reveal"><p>"A general AI course tells you what AI is. A role-based certification tells your employer what you are going to do with it."</p></div>`,
      },
      { h2: 'How to choose in ten minutes', id: 'how-to-choose' },
      {
        html: `<p>Three questions, in order. Can you name the job title you are targeting? If no, take a general course first. Can you name two AI workflows in that role you wish were automated? If no, browse <a href="/ai-courses-for/">the industry hub for your field</a> to see what the AI version of your role looks like. Do you know which tier you are? If not, pick Foundation and move up — the ladder exists precisely so you do not have to guess.</p>`,
      },
      {
        html: `<p>Once you have the credential, the last mile is the same for everyone: make sure the work is visible before you apply anywhere. That is what <a href="/placement/">TCC Placement Partner</a> is built around — proof first, positioning second, introductions last.</p>`,
      },
      {
        html: `<div class="a-cta reveal"><div class="ct-t">Find the certification that names your job.</div><p class="ct-d">1,048 role-based AI certifications across 262 roles and 32 industries, in four tiers from Foundation to Executive.</p><div class="ct-row"><a class="btn btn-sm" href="/bootcamps/">Browse the catalogue</a><a class="btn btn-ghost btn-sm" href="/ai-courses-for/">Browse by industry</a></div></div>`,
      },
    ],
    faq: [
      {
        q: 'What is a role-based AI certification?',
        a: 'A role-based AI certification is scoped to a specific job title rather than to AI in general. It teaches the AI workflows relevant to that role and assesses you by a deployed artifact instead of a quiz. TCC CERT+ offers four tiers per role — Foundation, Practitioner, Strategist and Executive — across 262 roles.',
      },
      {
        q: 'Is a role-based AI certification better than a general AI course?',
        a: 'It depends on your goal. A role-based certification is better when you know your job title and want the AI version of that role, because it answers the recruiter relevance question immediately and produces a portfolio that maps to a job description. A general AI course is better when you are still exploring where AI fits into your career.',
      },
      {
        q: 'What are the four tiers of a role-based AI certification?',
        a: 'Foundation is for people new to the role, Practitioner for those with a couple of years in role who want to build repeatable AI workflows, Strategist for senior individual contributors and leads designing AI adoption for a team, and Executive for managers and directors making AI investment and governance decisions.',
      },
      {
        q: 'How many roles does TCC CERT+ cover?',
        a: 'TCC CERT+ covers 262 roles across 32 industries, with four certification tiers per role — 1,048 certifications in total. Each role also has an industry hub page describing what the AI version of that role looks like.',
      },
      {
        q: 'Do employers recognise role-based AI certifications?',
        a: 'Recruiters filter by job title first, so a certification carrying a job title lands in the same category as the role being hired for, while a general AI certificate reads as generic interest. That relevance is what makes a role-based credential useful in the hiring stack, alongside the deployed artifact it produces.',
      },
    ],
    cta: {
      title: 'Stop collecting certificates nobody opens.',
      desc: 'Choose the credential that names your job title and ends in work you can show.',
      primary: 'Browse 1,048 certifications',
      primaryHref: '/bootcamps/',
      secondary: 'Browse by industry',
      secondaryHref: '/ai-courses-for/',
    },
    related: [
      { tag: 'Placement', title: 'AI Placement Programs Explained', desc: 'What an AI placement program actually does, the red flags that separate a real one from marketing, and how TCC Placement Partner works.', href: '/blog/ai-placement-programs.html' },
      { tag: 'Internships', title: 'How to Get an AI Internship in 2026', desc: 'A step-by-step roadmap from zero experience to your first AI internship, including the portfolio that convinces and the outreach that gets replies.', href: '/blog/how-to-get-ai-internship-2026.html' },
    ],
  },

  /* ── What TCS NQT actually tests ── */
  {
    file: 'tcs-nqt-what-it-tests.html',
    crumb: 'What the TCS NQT actually tests',
    tag: 'Placement',
    date: '2026-11-10',
    dateLabel: '10 November 2026',
    readTime: 10,
    wordCount: 2200,
    image: 'hero-analytics.jpg',
    seoTitle: 'What the TCS NQT Actually Tests (And What It Does Not) | TCC',
    titlePlain: 'What the TCS NQT Actually Tests, and What It Does Not',
    h1: 'What the TCS NQT actually tests. <span class="accent">And what it does not.</span>',
    description:
      'A section-by-section breakdown of what the TCS NQT measures, the four places candidates lose marks, and how to spend three weeks preparing without wasting them.',
    standfirst:
      'Most NQT advice is a list of topics. That is not the problem. The problem is that the paper is timed in a way that punishes a particular habit, and almost nobody explains which one.',
    keywords: ['TCS NQT', 'TCS NQT syllabus', 'TCS NQT pattern', 'TCS NQT preparation', 'TCS placement paper', 'NQT numerical ability', 'campus placement test'],
    about: ['TCS NQT', 'Campus placement', 'Aptitude tests', 'Employment'],
    mentions: [
      { name: 'TCC Prep+ company papers', url: `${SITE}/prep+/companies/`, type: 'Service' },
      { name: 'TCC placement diagnostic', url: `${SITE}/diagnostic/`, type: 'Service' },
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
    ],
    body: [
      { html: `<p class="a-lede">The TCS NQT is not a difficult paper. It is a fast one. Almost everyone who fails it can solve the questions given enough time — the paper's whole design is to find out what happens when the time is not enough. That single fact should reorganise how you prepare, and for most candidates it does not.</p>` },
      { html: `<p>What follows is the structure of the paper, the five skills it is actually measuring underneath the topic list, and the four habits that cost people marks they could otherwise have kept. Confirm the current pattern on TCS's own portal before your test date: section counts move between cycles, and a guide written last year is not a substitute for the notification you were sent.</p>` },
      { h2: 'The shape of the paper', id: 'shape' },
      { html: `<p>The NQT is a single timed sitting split into sections, each with its own clock. When a section's time ends it moves on, and you cannot return to it. That last sentence is the most important operational fact about the exam, and it is the one candidates discover too late.</p>` },
      { html: `<ul>
        <li><strong>Numerical ability.</strong> Percentages, ratios, averages, time–speed–distance, profit and loss, simple and compound interest, data sufficiency, and chart reading. The arithmetic is school-level. The constraints are speed and reading accuracy.</li>
        <li><strong>Verbal ability.</strong> Reading comprehension, sentence completion, error detection, para-jumbles and vocabulary in context. This section is where strong English speakers bank time for the rest of the paper.</li>
        <li><strong>Reasoning ability.</strong> Series, coding-decoding, blood relations, direction sense, syllogisms, seating arrangements and figure series. Largely pattern recognition under time pressure.</li>
        <li><strong>Advanced section.</strong> Coding and, depending on the role you applied for, additional technical or domain questions. For many profiles this section is where the offer level is effectively decided.</li>
      </ul>` },
      { html: `<div class="a-callout reveal"><div class="co-label">The structural trap</div><p>Because sections are locked, a single question you refuse to abandon can cost you an entire later section. The paper does not reward persistence. It rewards triage. Candidates who do well are not usually the ones who solve the hardest question — they are the ones who never spend four minutes on it.</p></div>` },
      { h2: 'What it is really measuring', id: 'measures' },
      { html: `<p>Strip away the topic labels and the paper is testing five things. Two of them are not on the syllabus at all.</p>` },
      { html: `<div class="a-phases">
        <div class="a-phase reveal"><div class="ph-n">01</div><div><div class="ph-t">Arithmetic fluency</div><p class="ph-d">Can you compute a percentage change without reaching for a pen? Roughly half of numerical ability is decided by whether basic operations are automatic.</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">02</div><div><div class="ph-t">Reading precision</div><p class="ph-d">A large share of wrong answers are right calculations applied to the wrong quantity. The paper tests whether you noticed "excluding tax" and "per annum".</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">03</div><div><div class="ph-t">Triage under pressure</div><p class="ph-d">Not on the syllabus, and worth more than any single topic. Knowing which question to skip is a skill you can practise deliberately.</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">04</div><div><div class="ph-t">Composure after a bad section</div><p class="ph-d">Also not on the syllabus. Candidates who carry a ruined section into the next one lose two sections, not one.</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">05</div><div><div class="ph-t">Code that runs</div><p class="ph-d">In the advanced section, a working brute-force solution beats an elegant incomplete one. The evaluator runs your code; it does not read your intent.</p></div></div>
      </div>` },
      { h2: 'The four places marks actually disappear', id: 'losses' },
      { html: `<p>These four account for most of the gap between a candidate's practice scores and their real score.</p>` },
      { html: `<div class="a-flag">
        <div class="fl bad reveal"><strong class="fl-h">Spending more than 90 seconds on one question</strong><p>The maths is that a three-minute question you eventually solve costs you four one-minute questions you never see. Set a hard ceiling per question and hold it.</p></div>
        <div class="fl good reveal"><strong class="fl-h">The fix — a written ceiling</strong><p>Before the test, decide the number. Ninety seconds for numerical, sixty for reasoning. Write it on the rough sheet. A rule you wrote down is easier to obey than one you intended.</p></div>
        <div class="fl bad reveal"><strong class="fl-h">Reading the passage in the wrong order</strong><p>In comprehension, reading the questions first tells you which paragraph matters. Candidates who read the full passage first routinely run out of time on the last two questions.</p></div>
        <div class="fl good reveal"><strong class="fl-h">The fix — question-first reading</strong><p>Skim the questions, then read. You are not being tested on enjoying the passage; you are being tested on locating a specific claim.</p></div>
        <div class="fl bad reveal"><strong class="fl-h">Untested mental arithmetic</strong><p>People who have not done a percentage change without a calculator since school lose 20–30 seconds per numerical question, which compounds into an entire section.</p></div>
        <div class="fl good reveal"><strong class="fl-h">The fix — twenty minutes a day</strong><p>Drill the eight operations that appear constantly: percentage change, ratio simplification, average with replacement, work rate, simple interest, speed conversion, and fraction-to-decimal recall.</p></div>
        <div class="fl bad reveal"><strong class="fl-h">Coding without a local test</strong><p>Submitting code you have not run, on an interface you have not used, with input parsing you have not checked, is the most avoidable failure in the advanced section.</p></div>
        <div class="fl good reveal"><strong class="fl-h">The fix — dry-run the interface</strong><p>Practise in the same editor or on the same platform at least twice before the real thing. Read input until EOF; do not assume a fixed number of lines.</p></div>
      </div>` },
      { h2: 'Three weeks, honestly', id: 'three-weeks' },
      { html: `<p>Most candidates over-prepare topics and under-prepare timing. This split corrects that.</p>` },
      { html: `<ul>
        <li><strong>Week one — mechanics.</strong> One topic a day, twenty questions each, no timer. The goal is accuracy, not speed. If you cannot get eight of ten right untimed, timing is irrelevant.</li>
        <li><strong>Week two — sections under clock.</strong> Full sections, real duration, no pauses. Log the questions you skipped and the ones that ate time. The log is more useful than the score.</li>
        <li><strong>Week three — full sittings.</strong> Two complete papers in exam order, at the same time of day as your slot, on a laptop with the same keyboard. Fatigue is part of the test and it should not be new on the day.</li>
      </ul>` },
      { html: `<div class="a-quote reveal"><p>"The NQT does not ask whether you can solve it. It asks whether you can decide, in eight seconds, that you should not."</p></div>` },
      { h2: 'What the NQT does not test', id: 'not-tested' },
      { html: `<p>It is worth being clear about this, because candidates routinely over-invest in things the paper ignores.</p>` },
      { html: `<ul>
        <li>It does not test whether you can build software. The advanced section tests whether you can solve a defined problem in code under time.</li>
        <li>It does not test your degree, your college, or your CGPA. Those filters happen elsewhere.</li>
        <li>It does not test depth in any single subject. Breadth and speed beat depth here — which is also why a good NQT score is not evidence you will be good at the job, and a bad one is not evidence you will be bad at it.</li>
      </ul>` },
      { html: `<p>That last point matters for how you interpret your own result. A test that rewards triage is measuring a real workplace skill, but it is not measuring the whole of you. Treat the score as diagnostic information about a specific constraint — time pressure — rather than a verdict.</p>` },
      { html: `<p>If you want to know where you actually stand before you sit the real thing, the fifteen-minute diagnostic on this site uses the same four-section structure and shows you the reasoning behind every answer you miss.</p>` },
    ],
    faq: [
      { q: 'How long is the TCS NQT?', a: 'The sitting runs around 90 minutes in total, split into separately timed sections. Section counts and durations have changed between cycles, so confirm the current pattern in the notification you received rather than relying on a guide.' },
      { q: 'Is there negative marking in the TCS NQT?', a: 'There is no negative marking in the sections most candidates sit, which means an unanswered question scores exactly the same as a wrong one. Under that rule, guessing is rational — but only after you have secured the questions you can actually solve.' },
      { q: 'Can I go back to a previous section?', a: 'No. Each section is locked when its timer ends. This is the single most important operational fact about the paper and the reason triage matters more than raw ability.' },
      { q: 'How many questions do I need to get right?', a: 'There is no published cut-off that applies to everyone, because the bar moves with the role, the hiring location and the candidate pool. Aim to finish every section with time left rather than to hit a specific count.' },
      { q: 'Does the NQT score expire?', a: 'TCS uses NQT scores for its own hiring windows, and the validity depends on the cycle you sat. Check the current notification for how long your score is considered.' },
    ],
    cta: {
      title: 'Find out where your time actually goes.',
      desc: 'Fifteen questions, fifteen minutes, scored instantly with the reasoning for everything you miss.',
      primary: 'Sit the diagnostic',
      primaryHref: '/diagnostic/',
      secondary: 'Practise company papers',
      secondaryHref: '/prep+/companies/',
    },
    related: [
      { tag: 'Placement', title: 'AI Placement Programs Explained', desc: 'What a placement program actually does and the red flags that separate a real one from marketing.', href: '/blog/ai-placement-programs.html' },
      { tag: 'Interview', title: 'AI Tools in an Interview: What Gets You Rejected', desc: 'The three disclosure policies you will meet, and the one behaviour that ends an interview early.', href: '/blog/ai-tools-in-interviews.html' },
    ],
  },

  /* ── AI tools in interviews ── */
  {
    file: 'ai-tools-in-interviews.html',
    crumb: 'AI tools in interviews',
    tag: 'Interview',
    date: '2026-11-11',
    dateLabel: '11 November 2026',
    readTime: 9,
    wordCount: 1900,
    image: 'hero-ai-abstract.jpg',
    seoTitle: 'AI Tools in an Interview: What Is Allowed, What Gets You Rejected | TCC',
    titlePlain: 'AI Tools in an Interview: What Is Allowed, and What Gets You Rejected',
    h1: 'AI tools in an interview. <span class="accent">What is allowed, and what ends it.</span>',
    description:
      'The three AI policies you will actually meet in interviews, the one behaviour that ends a process early, and how to disclose tool use in a way that earns marks instead of losing them.',
    standfirst:
      'Every interviewer now assumes you use AI. The question is no longer whether you do. It is whether you can be trusted with it — and that is a question you answer in about four minutes.',
    keywords: ['AI in interviews', 'using AI in interview', 'AI tools interview policy', 'disclose AI use interview', 'technical interview AI', 'AI assisted coding interview'],
    about: ['Job interviews', 'AI tools', 'Hiring', 'Employment'],
    mentions: [
      { name: 'TCC assessment rubric', url: `${SITE}/verify/rubric/`, type: 'CreativeWork' },
      { name: 'TCC placement diagnostic', url: `${SITE}/diagnostic/`, type: 'Service' },
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
    ],
    body: [
      { html: `<p class="a-lede">Two years ago, using AI in a technical interview was straightforward cheating. Today the same behaviour is either cheating, expected, or actively scored — depending entirely on the company, and usually without anyone telling you which. Guessing wrong is expensive in both directions: hide it and you look dishonest, over-announce it and you look like you cannot work without it.</p>` },
      { h2: 'The three policies you will actually meet', id: 'policies' },
      { html: `<p>Almost every interview falls into one of three regimes. The problem is that candidates assume the first one and prepare for it, while most companies have quietly moved to the second or third.</p>` },
      { html: `<div class="a-flag">
        <div class="fl bad reveal"><strong class="fl-h">Closed — no AI at all</strong><p>Common in proctored assessments and in some banks, defence-adjacent firms and regulated roles. Detection is usually behavioural rather than technical: tab switches, paste events, implausible speed. Do not test this policy. Ask before the interview, in writing.</p></div>
        <div class="fl good reveal"><strong class="fl-h">Disclosed — AI allowed, must be declared</strong><p>The most common policy among product companies. You may use tools; you must say which, and you must be able to defend every line. This is the regime most candidates are unprepared for, because they prepare either to hide it or to skip it.</p></div>
        <div class="fl bad reveal"><strong class="fl-h">Expected — AI is part of the task</strong><p>Increasingly common for AI-adjacent roles. You are given a broken function and a model, and marked on how fast you locate the lie in the output. Here, refusing to use AI is the failure mode.</p></div>
      </div>` },
      { html: `<p>You can usually find out which regime you are in before the interview with one email: "For the technical round, should I assume AI assistants are permitted, and if so do you want tool use declared?" Interviewers answer this. It is a normal question, and asking it signals that you have done this before.</p>` },
      { h2: 'What actually gets you rejected', id: 'rejection' },
      { html: `<p>It is almost never the use of a tool. It is one of four behaviours around it.</p>` },
      { html: `<ul>
        <li><strong>Undisclosed use that the interviewer detects.</strong> The interview is over not because you used a model, but because you were willing to conceal it. Trust is the thing being assessed, and it is now unrecoverable in that room.</li>
        <li><strong>Being unable to explain your own submission.</strong> If you cannot walk through a line of code you just presented, the interviewer concludes the work is not yours. One "why did you write it that way?" is enough to surface this.</li>
        <li><strong>Confident output you did not verify.</strong> A model that invents a library method produces code that looks correct and fails at runtime. Handing that in is worse than handing in nothing, because it shows you cannot tell the difference.</li>
        <li><strong>Using AI as the first move, not the second.</strong> Interviewers notice when you reach for a tool before you have read the problem. It reads as dependence, and dependence is the trait the "expected" regime is specifically screening out.</li>
      </ul>` },
      { html: `<div class="a-callout reveal"><div class="co-label">The four-minute rule</div><p>Most interviewers form a view of your AI judgement within the first four minutes of a technical task — before you have written much code. What they are watching is whether you read first, plan second, generate third, and verify fourth. Get that order wrong and the rest of the interview is spent recovering.</p></div>` },
      { h2: 'How to disclose well', id: 'disclosure' },
      { html: `<p>Disclosure is not a confession. Done properly it is evidence of exactly the judgement employers are short of. A useful shape:</p>` },
      { html: `<div class="a-quote reveal"><p>"I used the assistant to draft the parsing function and to suggest edge cases. I rewrote the error handling myself because it mishandled empty input, and I tested it against three cases before running it."</p></div>` },
      { html: `<p>That sentence does four things in twelve seconds: it names the tool, states the scope, shows a specific correction you made, and proves you tested. Compare it with "I used ChatGPT for some of it", which names nothing and proves nothing.</p>` },
      { html: `<p>The disclosure should also be honest about what you did <em>not</em> use it for. Interviewers are alert to overclaiming in both directions, and a candidate who says "I did the data model by hand because I wanted to be sure of the relationships" is telling them something useful about how they work.</p>` },
      { h2: 'Verifying an AI answer in sixty seconds', id: 'verify' },
      { html: `<p>The skill the "expected" regime is testing has a repeatable shape. It is worth rehearsing until it is automatic.</p>` },
      { html: `<ol>
        <li><strong>Does it run?</strong> Execute the smallest possible case before reading the logic. A worked example catches invented methods immediately.</li>
        <li><strong>Does it survive an edge?</strong> Empty input, one item, duplicates, a negative number. Models are trained on the happy path and fail at the boundaries.</li>
        <li><strong>Is the claim in the comment true?</strong> Generated comments often describe what the model intended rather than what the code does. Read the code, not the prose.</li>
        <li><strong>Would I defend this line under questioning?</strong> If there is a line you cannot explain, delete it and write your own. Unexplainable code is a liability you are volunteering for.</li>
      </ol>` },
      { h2: 'The interview is measuring judgement, not purity', id: 'judgement' },
      { html: `<p>There is a version of this advice that says "never use AI in an interview, it looks weak". That is now as wrong as the opposite. Companies are hiring people who will use these tools on Monday. What they cannot hire is someone whose output they cannot trust, or whose process they cannot see.</p>` },
      { html: `<p>So the thing to practise is not abstinence. It is the sequence: read, plan, generate, verify, disclose. Every part of that sequence is observable, and every part of it is a mark in your favour when you do it out loud.</p>` },
      { html: `<p>Our assessment rubric makes this explicit — undisclosed tool use where disclosure is required invalidates a result, and verified use scores higher than unassisted work of the same quality. The reasoning is the same one an interviewer uses: a credential that cannot be defended is worth nothing to the person holding it.</p>` },
    ],
    faq: [
      { q: 'Is it cheating to use AI in a technical interview?', a: 'Only if the company has said not to. Under a disclosed-use policy it is permitted and expected; under a closed-book policy it is cheating. The policy is usually discoverable by asking before the interview, and asking is itself a positive signal.' },
      { q: 'Should I tell the interviewer I used AI?', a: 'If the policy requires disclosure, yes, and precisely: name the tool, the scope, what you changed, and how you tested. If the policy is silent, disclose anyway — undisclosed use that is later detected ends the process, while disclosed use is a demonstration of judgement.' },
      { q: 'What if I cannot explain the AI-generated code?', a: 'Delete it and write your own. Unexplainable code is worse than slower code, because the interviewer is assessing whether your output can be trusted, not how fast you typed.' },
      { q: 'Do companies ban AI in interviews?', a: 'Some do, particularly in proctored assessments and regulated industries. Detection is usually behavioural rather than technical, and the penalty is typically disqualification rather than a lower score — which is why asking first is worth the email.' },
      { q: 'How do I get better at verifying AI output?', a: 'Practise the four-step check until it is automatic: run the smallest case, test an edge case, read the code rather than the comments, and delete anything you cannot defend line by line. It takes about sixty seconds once rehearsed.' },
    ],
    cta: {
      title: 'Test your judgement, not your memory.',
      desc: 'The diagnostic scores you the way a real paper does, then shows you the reasoning behind every miss.',
      primary: 'Sit the diagnostic',
      primaryHref: '/diagnostic/',
      secondary: 'Read the marking rubric',
      secondaryHref: '/verify/rubric/',
    },
    related: [
      { tag: 'Placement', title: 'What the TCS NQT Actually Tests', desc: 'Section structure, the four places marks disappear, and a three-week plan that respects the clock.', href: '/blog/tcs-nqt-what-it-tests.html' },
      { tag: 'Interview', title: 'How to Read a Job Description', desc: 'What a hiring manager is actually filtering for, and how to map your evidence to it in ten minutes.', href: '/blog/how-to-read-a-job-description.html' },
    ],
  },

  /* ── Reading a job description ── */
  {
    file: 'how-to-read-a-job-description.html',
    crumb: 'How to read a job description',
    tag: 'Interview',
    date: '2026-11-12',
    dateLabel: '12 November 2026',
    readTime: 8,
    wordCount: 1700,
    image: 'hero-people-work.jpg',
    seoTitle: 'How to Read a Job Description Like a Hiring Manager | TCC',
    titlePlain: 'How to Read a Job Description Like a Hiring Manager',
    h1: 'How to read a job description <span class="accent">like the person filtering it.</span>',
    description:
      'A job description has three tiers of requirement and most candidates treat all of them as equal. Here is how to decode one in ten minutes and map your evidence to what actually gets screened.',
    standfirst:
      'A hiring manager spends about eight seconds on your application before deciding whether to read further. If you spent forty minutes tailoring it to the wrong three lines, those eight seconds are already lost.',
    keywords: ['how to read a job description', 'job description analysis', 'resume tailoring', 'job application strategy', 'hiring manager screening', 'job requirements'],
    about: ['Job search', 'Recruitment', 'Employment'],
    mentions: [
      { name: 'TCC placement programme', url: `${SITE}/placement/`, type: 'Service' },
      { name: 'TCC CERT+ role-based AI certifications', url: `${SITE}/bootcamps/`, type: 'EducationalOccupationalCredential' },
      { name: 'TCC placement diagnostic', url: `${SITE}/diagnostic/`, type: 'Service' },
    ],
    body: [
      { html: `<p class="a-lede">Job descriptions are written by three different people and never fully reconciled: a recruiter who wants to cast wide, a hiring manager who wants to cast narrow, and a legal or HR template that adds lines nobody intends to enforce. Reading one well means knowing which lines belong to whom.</p>` },
      { h2: 'Three tiers, not one list', id: 'tiers' },
      { html: `<p>Every requirement in a posting sits in one of three tiers. Treating them equally is the single most common application error, because it produces a resume that mentions everything and emphasises nothing.</p>` },
      { html: `<div class="a-phases">
        <div class="a-phase reveal"><div class="ph-n">01</div><div><div class="ph-t">The deal-breaker</div><p class="ph-d">Usually one or two lines, often phrased plainly, often near the top or buried in a paragraph: "must be eligible to work in India", "final-year students only", "3+ years with Java". If you do not clear it, nothing else matters. Read for these first and stop early if you fail one.</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">02</div><div><div class="ph-t">The real shortlist</div><p class="ph-d">Three to five concrete capabilities the manager will actually test in interview. They are usually the ones written with specific nouns — a named tool, a named process, a named outcome — rather than adjectives like "passionate" or "dynamic".</p></div></div>
        <div class="a-phase reveal"><div class="ph-n">03</div><div><div class="ph-t">The wishlist</div><p class="ph-d">Everything after "nice to have", plus the aspirational tail of the list. Nobody expects all of it. Applying anyway when you meet half of this tier is normal; treating it as a gate is how candidates talk themselves out of roles they would get.</p></div></div>
      </div>` },
      { html: `<div class="a-callout reveal"><div class="co-label">The tell</div><p>Specific nouns are requirements. Adjectives are atmosphere. "Experience with PostgreSQL and query optimisation" is a requirement. "A self-starter with a passion for excellence" is a sentence someone wrote because the template had a gap.</p></div>` },
      { h2: 'Decode the verbs', id: 'verbs' },
      { html: `<p>The verb tells you the seniority of the work, and seniority is what the interview will test. Candidates routinely prepare at the wrong level because they read the nouns and ignored the verbs.</p>` },
      { html: `<div class="tablewrap"><table>
        <thead><tr><th>Verb</th><th>What it means in practice</th><th>What gets tested</th></tr></thead>
        <tbody>
          <tr><td><b>Assist, support, contribute</b></td><td>You are the second pair of hands</td><td>Reliability, learning speed, willingness to ask</td></tr>
          <tr><td><b>Build, implement, develop</b></td><td>You own a component end to end</td><td>Can you ship something that works without supervision</td></tr>
          <tr><td><b>Design, architect</b></td><td>You decide the shape others build inside</td><td>Trade-offs, and what you deliberately left out</td></tr>
          <tr><td><b>Own, lead, drive</b></td><td>You are accountable for the outcome, including other people</td><td>Judgement under ambiguity, and how you handle being wrong</td></tr>
        </tbody>
      </table></div>` },
      { h2: 'The eight-second scan', id: 'scan' },
      { html: `<p>Before you write a single line of your application, read the posting the way it will be read: fast, scanning for a reason to say yes.</p>` },
      { html: `<ol>
        <li><strong>Title.</strong> Does your resume's headline use the same job title? Recruiters search by title. If yours says "Aspiring Data Enthusiast" and the role is "Data Analyst", you have made yourself harder to find.</li>
        <li><strong>First three bullets.</strong> These are the manager's priority order. Your top project should mirror the first one, not the one you find most interesting.</li>
        <li><strong>Named tools.</strong> If a tool appears twice, it is load-bearing. If it appears once in a list of twelve, it is not.</li>
        <li><strong>The last paragraph.</strong> This is usually where the real constraint lives — shift timings, location, notice period, eligibility.</li>
        <li><strong>What is missing.</strong> A posting that never mentions testing, code review or customers tells you something about the team's actual maturity. Absence is information.</li>
      </ol>` },
      { h2: 'Map evidence, do not repeat keywords', id: 'mapping' },
      { html: `<p>Keyword stuffing is a 2015 tactic that now reads as noise. What works is mirroring the <em>structure</em> of the requirement with a specific, checkable piece of evidence.</p>` },
      { html: `<div class="a-flag">
        <div class="fl bad reveal"><strong class="fl-h">Weak — restating the requirement</strong><p>"Strong experience with data analysis and stakeholder communication." This tells the reader nothing they did not already read in their own posting.</p></div>
        <div class="fl good reveal"><strong class="fl-h">Strong — evidence with a number and a consequence</strong><p>"Rebuilt a 14-sheet reporting workbook into a single SQL-backed dashboard; cut the weekly reporting cycle from two days to forty minutes and two people stopped maintaining duplicates."</p></div>
      </div>` },
      { html: `<p>The second version is longer and does three jobs: it proves the capability, it quantifies the outcome, and it demonstrates the judgement of noticing the duplicates. One line like that outranks five lines of adjectives.</p>` },
      { h2: 'What to ignore, deliberately', id: 'ignore' },
      { html: `<ul>
        <li><strong>Years-of-experience inflation.</strong> "3+ years" often means "we would like someone who has done this before". Strong evidence frequently substitutes, and everyone in hiring knows it.</li>
        <li><strong>Degree requirements that are actually preferences.</strong> Compare with who the company has hired before, which is usually public on LinkedIn.</li>
        <li><strong>Long tool lists.</strong> Nobody uses twelve. The first three are the real stack.</li>
        <li><strong>The culture paragraph.</strong> Read it once, for red flags, then stop. It is marketing text and it is not scored.</li>
      </ul>` },
      { html: `<div class="a-quote reveal"><p>"Apply when you meet the deal-breakers and half the shortlist. Applying only when you meet everything is how qualified people stay unemployed."</p></div>` },
      { html: `<p>One practical habit: keep a single file of evidence — one line per project, each with a number, a consequence and the skill it proves. When a posting arrives, you are assembling from a shelf rather than writing from scratch. Tailoring then takes ten minutes instead of an evening, which is the difference between applying to six roles a week and two.</p>` },
    ],
    faq: [
      { q: 'Should I apply if I do not meet all the requirements?', a: 'Yes, if you clear the deal-breakers and about half of the concrete capabilities. Requirements lists are written aspirationally, and the cost of applying is a few minutes. The cost of self-selecting out of a role you would have got is much higher.' },
      { q: 'How many keywords should I put in my resume?', a: 'Use the job title and the three or four named tools that appear more than once in the posting, in the natural course of describing real work. Stuffing a keyword list reads as noise to a human and adds little with modern screening.' },
      { q: 'How long should I spend tailoring an application?', a: 'About ten minutes if you keep an evidence file: change the headline to the job title, reorder your top two bullets to match the manager\'s priority order, and rewrite one line to mirror the first requirement with a number. More than that has diminishing returns.' },
      { q: 'What is the most important line in a job description?', a: 'The first requirement bullet, because it usually reflects the manager\'s actual priority. The second most important is the last paragraph, which tends to contain the real constraint nobody puts in the headline.' },
    ],
    cta: {
      title: 'Know your gaps before an interviewer finds them.',
      desc: 'The diagnostic shows which sections of a real paper cost you marks, with the reasoning for each.',
      primary: 'Sit the diagnostic',
      primaryHref: '/diagnostic/',
      secondary: 'See the placement track',
      secondaryHref: '/placement/',
    },
    related: [
      { tag: 'Interview', title: 'AI Tools in an Interview', desc: 'The three policies you will meet, and the one behaviour that ends a process early.', href: '/blog/ai-tools-in-interviews.html' },
      { tag: 'Placement', title: 'What the TCS NQT Actually Tests', desc: 'Section structure, the four places marks disappear, and a three-week plan.', href: '/blog/tcs-nqt-what-it-tests.html' },
    ],
  },
];

/* ── Write ── */
let written = 0;
for (const a of ARTICLES) {
  const out = path.join(BLOG, a.file);
  fs.writeFileSync(out, render(a));
  written++;
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`  ✓ blog/${a.file}  (${kb} KB)`);
}
console.log(`\nBlog articles rendered: ${written}`);
