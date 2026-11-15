/* ─────────────────────────────────────────────────────────────────────────
   scripts/patch-ai-discovery.js

   Two site-wide, AI-search improvements applied to every static HTML page:

     1. Discovery <link>s in <head> so any crawler that lands on an inner
        page immediately finds the machine-readable fact files:
          /llms.txt, /llms-full.txt, /llms.json, /faq.jsonl, /ai.txt, /feed.xml
     2. A BreadcrumbList JSON-LD block where a visible breadcrumb exists but
        no BreadcrumbList schema is present yet.

   Idempotent: safe to re-run. Skips pages that already carry the links.

     node scripts/patch-ai-discovery.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://thecodingcompany.com';

const LINKS = [
  '<link rel="alternate" type="text/plain" title="TCC facts for AI assistants (llms.txt)" href="/llms.txt" />',
  '<link rel="alternate" type="text/plain" title="TCC full reference for AI assistants (llms-full.txt)" href="/llms-full.txt" />',
  '<link rel="alternate" type="application/json" title="TCC structured facts (llms.json)" href="/llms.json" />',
  '<link rel="alternate" type="application/jsonl" title="TCC Q&A bank (faq.jsonl)" href="/faq.jsonl" />',
  '<link rel="alternate" type="text/plain" title="TCC AI crawler policy (ai.txt)" href="/ai.txt" />'
];

function walk(dir, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  });
  return acc;
}

/* Map a file path to its canonical URL (directory index.html → trailing /). */
function urlFor(file) {
  let rel = path.relative(PUBLIC, file).replace(/\\/g, '/');
  if (rel === 'index.html') return SITE + '/';
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return SITE + '/' + rel;
}

/* Derive a human breadcrumb trail from the URL path. */
function trailFor(file) {
  const url = urlFor(file);
  const pathname = url.replace(SITE, '');
  const parts = pathname.split('/').filter(Boolean);
  const nice = {
    bootcamps: 'TCC CERT+',
    placement: 'Placement Partner',
    blog: 'Blog',
    'ai-courses-for': 'AI Courses by Role',
    '100-club': '100 Club',
    webinars: 'Webinars',
    gigs: 'Gigs',
    domains: 'Domains',
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    'refund-policy': 'Refund Policy'
  };
  function label(seg, i) {
    if (nice[seg]) return nice[seg];
    if (i === parts.length - 1 && seg.endsWith('.html')) {
      seg = seg.replace(/\.html$/, '');
    }
    return seg
      .split('-')
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(' ');
  }
  const items = [{ name: 'Home', url: SITE + '/' }];
  let acc = '';
  parts.forEach(function (seg, i) {
    acc += '/' + seg + (i === parts.length - 1 && !pathname.endsWith('/') ? '' : '/');
    items.push({ name: label(seg, i), url: SITE + acc.replace(/\/index\.html$/, '/') });
  });
  return items;
}

function hasBreadcrumbSchema(html) {
  return /"@type"\s*:\s*"BreadcrumbList"/.test(html);
}

function hasDiscovery(html) {
  return html.indexOf('title="TCC facts for AI assistants') !== -1;
}

const files = walk(PUBLIC);
let linksAdded = 0;
let crumbsAdded = 0;
let skipped = [];

files.forEach(function (file) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  /* ── 1. discovery links ── */
  if (!hasDiscovery(html)) {
    const headEnd = html.indexOf('</head>');
    if (headEnd === -1) { skipped.push(file + ' (no </head>)'); return; }
    const indent = '    ';
    html = html.slice(0, headEnd) +
      indent + LINKS.join('\n' + indent) + '\n' +
      html.slice(headEnd);
    linksAdded++;
  }

  /* ── 2. breadcrumb schema (only where page has >1 path segment) ── */
  const trail = trailFor(file);
  if (trail.length > 1 && !hasBreadcrumbSchema(html)) {
    const block = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map(function (t, i) {
        return { '@type': 'ListItem', position: i + 1, name: t.name, item: t.url };
      })
    };
    const script = '    <script type="application/ld+json">' +
      JSON.stringify(block) + '</script>\n';
    const headEnd = html.indexOf('</head>');
    html = html.slice(0, headEnd) + script + html.slice(headEnd);
    crumbsAdded++;
  }

  if (html !== original) fs.writeFileSync(file, html, 'utf8');
});

console.log('Pages scanned:', files.length);
console.log('Discovery link sets added:', linksAdded);
console.log('BreadcrumbList blocks added:', crumbsAdded);
if (skipped.length) {
  console.log('Skipped:');
  skipped.forEach(function (s) { console.log('  · ' + s); });
}
