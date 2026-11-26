#!/usr/bin/env node
/**
 * build-blog-categories.js
 * ---------------------------------------------------------------------------
 * Renders the TCC blog category pages from the same shared shell used by the
 * blog hub and articles, so every blog surface is visually identical.
 *
 * Each category page gets:
 *   - hero image background + dark veil + faint grid
 *   - canonical + BreadcrumbList + CollectionPage JSON-LD
 *   - the posts that belong to that category
 *   - cross-links to the other categories
 *
 * Idempotent. Run: node scripts/build-blog-categories.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { withTheme } = require('./theme-tags.cjs');
const { ARTICLES, CATEGORIES: BLOG_CATEGORIES } = require('./blog-meta.cjs');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BLOG = path.join(PUBLIC, 'blog');
const CATDIR = path.join(BLOG, 'category');
const SITE = 'https://thecodingcompany.io';
const IMG = '/assets/img/blog';
/* Category pages sit at /blog/category/, one level deeper than /blog/. */
const REL_IMG = '../../assets/img/blog';

const hub = fs.readFileSync(path.join(BLOG, 'index.html'), 'utf8');
function slice(start, end) {
  const a = hub.indexOf(start);
  const b = hub.indexOf(end, a);
  return hub.slice(a, b + end.length);
}
const STYLE = slice('<style>', '</style>')
  /* The hub stylesheet carries two blog-only rules whose backgrounds are not
     used on category pages. Drop them so their hub-relative URLs never 404. */
  .replace(/^\s*\.hero-bg \{[^\n]*\n/m, '')
  .replace(/^\s*\.news-visual \{[^\n]*\n/m, '');
const SIDEBAR = slice('<aside class="sidebar">', '</aside>');
const HEADER = slice('<header class="mobile-header">', '</header>');
const NAV = slice('<nav class="bottom-nav">', '</nav>');
/* Category pages live one directory deeper than the blog hub, so every
   relative asset path inherited from the hub needs an extra "../". */
const FOOTER = slice('<footer class="footer">', '</footer>').replace(/\.\.\//g, '../../');

const CAT_CSS = `
      /* ══════════ CATEGORY ══════════ */
      .c-hero { position: relative; padding: 128px 24px 52px; overflow: hidden; background: #000000; }
      @media (min-width: 768px) { .c-hero { padding: 154px 40px 64px; } }
      .c-hero-bg { position: absolute; inset: 0; z-index: 0; background-size: cover; background-position: center 40%; opacity: 0.34; transform: scale(1.03); }
      .c-hero-veil { position: absolute; inset: 0; z-index: 1; background:
        linear-gradient(180deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.88) 58%, #000000 100%),
        radial-gradient(85% 78% at 18% 18%, rgba(0,87,222,0.30), transparent 62%); }
      .c-hero-grid { position: absolute; inset: 0; z-index: 2; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 78%); -webkit-mask-image: radial-gradient(80% 70% at 50% 0%, #000 0%, transparent 78%); }
      .c-hero-inner { position: relative; z-index: 3; max-width: 1400px; margin: 0 auto; }
      .crumbs { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.42); margin-bottom: 22px; flex-wrap: wrap; }
      .crumbs a:hover { color: #fff; }
      .crumbs .sep { opacity: 0.4; }
      .crumbs .cur { color: rgba(255,255,255,0.7); }
      .c-title { font-family: 'Newsreader', Georgia, serif; font-weight: 400; letter-spacing: -0.02em; line-height: 1.06; font-size: clamp(34px, 5.4vw, 66px); color: #fff; }
      .c-title .accent { font-style: italic; }
      .c-sub { margin-top: 18px; color: rgba(255,255,255,0.58); font-size: clamp(16px, 1.7vw, 19px); line-height: 1.68; max-width: 46em; }
      .c-count { margin-top: 24px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.42); }

      .c-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 34px; }
      @media (min-width: 720px) { .c-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1180px) { .c-grid { grid-template-columns: repeat(3, 1fr); } }

      .c-others { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
      .c-oth { padding: 12px 22px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.6); transition: all 0.25s; }
      .c-oth:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.22); color: #fff; transform: translateY(-2px); }
      .c-empty { margin-top: 34px; padding: 46px 34px; text-align: center; }
      .c-empty .t { font-family: 'Gilroy', 'Inter', system-ui, sans-serif; font-size: clamp(22px, 3vw, 30px); color: #fff; }
      .c-empty .d { margin-top: 10px; color: rgba(255,255,255,0.5); font-size: 15px; }`;

/* Article metadata is shared with the hub, the feed and structured data. */
const POSTS = ARTICLES.map((a) => ({ ...a, meta: `${a.readTime} min read` }));
const CATEGORIES = BLOG_CATEGORIES;

const POST_GRID_CSS = `
      .post-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 34px; }
      @media (min-width: 720px) { .post-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1180px) { .post-grid { grid-template-columns: repeat(3, 1fr); } }
      .post { display: flex; flex-direction: column; overflow: hidden; }
      .post-media { height: 178px; background-size: cover; background-position: center; position: relative; }
      .post-media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%); transition: opacity 0.5s; }
      .post:hover .post-media::after { opacity: 0.7; }
      .post-body { padding: 24px 24px 26px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
      .post-tag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.42); }
      .post-title { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.32; color: #fff; }
      .post-desc { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.65; }
      .post-foot { margin-top: auto; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: rgba(255,255,255,0.42); }
      .post-foot .go { color: #7fb4ff; font-weight: 600; }`;

function postCard(p) {
  const href = p.href || `/blog/${p.file}`;
  return `              <a class="card post reveal" href="${href}">
                <div class="post-media" style="background-image:url('${REL_IMG}/${p.image}')" role="img" aria-label="${p.imageAlt || p.title.replace(/&amp;/g, '&')}"></div>
                <div class="post-body">
                  <div class="post-tag">${p.tag}</div>
                  <div class="post-title">${p.title}</div>
                  <p class="post-desc">${p.desc}</p>
                  <div class="post-foot"><span>${p.meta}</span><span class="go">Read →</span></div>
                </div>
              </a>`;
}

function render(c) {
  const url = `${SITE}/blog/category/${c.slug}`;
  const img = `${SITE}${IMG}/${c.image}`;

  const items = c.from.map((f) => POSTS.find((p) => p.file === f)).filter(Boolean);
  const cards = items.map(postCard);
  if (c.extra) cards.push(postCard(c.extra));

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url + '#collection',
    name: `${c.crumb} — TCC Blog`,
    description: c.sub,
    url,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/blog/#blog` },
    publisher: { '@id': `${SITE}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title.replace(/&amp;/g, '&'),
        url: `${SITE}/blog/${p.file}`,
      })),
    },
  };

  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: c.crumb, item: url },
    ],
  };

  const others = CATEGORIES.filter((o) => o.slug !== c.slug)
    .map((o) => `                <a class="c-oth" href="/blog/category/${o.slug}">${o.name}</a>`)
    .join('\n');

  const sidebar = SIDEBAR.replace('<a href="/blog" class="sidebar-link"', '<a href="/blog" class="sidebar-link active"');

  return withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${c.name} — TCC Blog</title>
    <meta name="description" content="${c.sub.replace(/"/g, '&quot;')}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="The Coding Company (TCC)" />
    <meta name="theme-color" content="#000000" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${c.name} — TCC Blog" />
    <meta property="og:description" content="${c.sub.replace(/"/g, '&quot;')}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="The Coding Company (TCC)" />
    <meta property="og:image" content="${img}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="alternate" type="application/rss+xml" title="TCC Blog — AI Courses, Certifications &amp; Placement" href="/feed.xml" />
    <link rel="icon" type="image/x-icon" href="../../favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/img/tcc-favicon-32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="../../assets/img/tcc-favicon-96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/img/tcc-apple-touch.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2).replace(/\n/g, '\n    ')}
    </script>
    <script type="application/ld+json">
${JSON.stringify(crumbsLd, null, 2).replace(/\n/g, '\n    ')}
    </script>
${STYLE.replace('</style>', POST_GRID_CSS + CAT_CSS + '\n    </style>')}
    <link rel="alternate" type="text/plain" title="TCC facts for AI assistants (llms.txt)" href="/llms.txt" />
    <link rel="alternate" type="text/plain" title="TCC full reference for AI assistants (llms-full.txt)" href="/llms-full.txt" />
    <link rel="alternate" type="application/json" title="TCC structured facts (llms.json)" href="/llms.json" />
    <link rel="alternate" type="application/jsonl" title="TCC Q&amp;A bank (faq.jsonl)" href="/faq.jsonl" />
    <link rel="alternate" type="text/plain" title="TCC AI crawler policy (ai.txt)" href="/ai.txt" />
  </head>
  <body>
    <div class="app-shell baseline-root">
${sidebar}

      <main class="main-scroll">
${HEADER}

        <div class="content-wrap">
          <!-- ═══════ CATEGORY HERO ═══════ -->
          <header class="c-hero">
            <div class="c-hero-bg" style="background-image:url('${REL_IMG}/${c.image}')" aria-hidden="true"></div>
            <div class="c-hero-veil" aria-hidden="true"></div>
            <div class="c-hero-grid" aria-hidden="true"></div>
            <div class="c-hero-inner">
              <nav class="crumbs reveal" aria-label="Breadcrumb">
                <a href="/">Home</a><span class="sep">/</span><a href="/blog/">Blog</a><span class="sep">/</span><span class="cur">${c.crumb}</span>
              </nav>
              <h1 class="c-title reveal">${c.title}</h1>
              <p class="c-sub reveal">${c.sub}</p>
              <div class="c-count reveal">${items.length} guide${items.length === 1 ? '' : 's'} in this topic</div>
            </div>
          </header>

          <!-- ═══════ POSTS ═══════ -->
          <section class="section" style="padding-top:26px">
            <div class="container">
              <div class="post-grid">
${cards.join('\n')}
              </div>

              <div class="eyebrow reveal" style="margin-top:56px;margin-bottom:14px">Browse other topics</div>
              <div class="c-others reveal">
                <a class="c-oth" href="/blog/">All guides</a>
${others}
              </div>
            </div>
          </section>

          <!-- ═══════ FINAL ═══════ -->
          <section class="final">
            <div class="container reveal">
              <h2 class="final-title">Everyone says they know AI.<br /><span class="serif-i">Prove it — and get hired.</span></h2>
              <p class="final-sub">Pick your role, earn the credential, and let the placement programme help you land the offer.</p>
              <div class="final-ctas">
                <a href="/bootcamps/" class="btn">Explore all certifications</a>
                <a href="/placement/" class="btn btn-ghost">How placements work</a>
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

fs.mkdirSync(CATDIR, { recursive: true });
let n = 0;
for (const c of CATEGORIES) {
  const out = path.join(CATDIR, c.slug);
  fs.writeFileSync(out, render(c));
  n++;
  console.log(`  ✓ blog/category/${c.slug}  (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
console.log(`\nBlog categories rendered: ${n}`);
