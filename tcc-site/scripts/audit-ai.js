/* ─────────────────────────────────────────────────────────────────────────
   scripts/audit-ai.js — verifies the AI-search (AEO/GEO) layer site-wide.

     node scripts/audit-ai.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const SITE = 'https://thecodingcompany.com';

function walk(dir, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  });
  return acc;
}

const files = walk(PUBLIC);
const problems = [];
const stats = {
  pages: files.length,
  withJsonLd: 0,
  withBreadcrumb: 0,
  withFaq: 0,
  withMentions: 0,
  withDiscovery: 0,
  invalidJsonLd: 0,
  missingTitle: 0,
  missingDesc: 0,
  missingCanonical: 0,
  multiH1: 0,
  noH1: 0
};

files.forEach(function (f) {
  const rel = path.relative(PUBLIC, f);
  const h = fs.readFileSync(f, 'utf8');

  if (!/<title>[^<]{10,}<\/title>/.test(h)) { stats.missingTitle++; problems.push(rel + ': missing title'); }
  if (!/<meta name="description" content="[^"]{40,}"/.test(h)) { stats.missingDesc++; problems.push(rel + ': missing/short description'); }
  if (!/<link rel="canonical"/.test(h)) { stats.missingCanonical++; problems.push(rel + ': missing canonical'); }

  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s > 1) { stats.multiH1++; problems.push(rel + ': ' + h1s + ' H1s'); }
  if (h1s === 0) { stats.noH1++; problems.push(rel + ': no H1'); }

  if (h.indexOf('title="TCC facts for AI assistants') !== -1) stats.withDiscovery++;

  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length) stats.withJsonLd++;

  let hasCrumb = false, hasFaq = false, hasMentions = false;
  blocks.forEach(function (b) {
    try {
      const j = JSON.parse(b[1]);
      const g = j['@graph'] || [j];
      g.forEach(function (n) {
        const t = n['@type'];
        const types = Array.isArray(t) ? t : [t];
        if (types.indexOf('BreadcrumbList') !== -1) hasCrumb = true;
        if (types.indexOf('FAQPage') !== -1) hasFaq = true;
        if (n.mentions) hasMentions = true;
      });
    } catch (e) {
      stats.invalidJsonLd++;
      problems.push(rel + ': invalid JSON-LD — ' + e.message);
    }
  });
  if (hasCrumb) stats.withBreadcrumb++;
  if (hasFaq) stats.withFaq++;
  if (hasMentions) stats.withMentions++;
});

/* artifacts */
const artifacts = ['ai.txt', 'llms.txt', 'llms-full.txt', 'llms.json', 'faq.jsonl', 'robots.txt', 'sitemap.xml'];
const artifactStatus = artifacts.map(function (a) {
  const exists = fs.existsSync(path.join(PUBLIC, a));
  if (!exists) problems.push('MISSING ARTIFACT: ' + a);
  return a + ': ' + (exists ? 'ok' : 'MISSING');
});

/* faq.jsonl validity */
let faqLines = 0;
try {
  const lines = fs.readFileSync(path.join(PUBLIC, 'faq.jsonl'), 'utf8').trim().split('\n');
  faqLines = lines.length;
  lines.forEach(function (l, i) {
    const o = JSON.parse(l);
    if (!o.q || !o.a || !o.url) problems.push('faq.jsonl line ' + (i + 1) + ': missing field');
  });
} catch (e) {
  problems.push('faq.jsonl invalid: ' + e.message);
}

/* llms.json validity */
try {
  const j = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'llms.json'), 'utf8'));
  if (!j.entity || !j.questions || !j.industries) problems.push('llms.json: missing sections');
} catch (e) {
  problems.push('llms.json invalid: ' + e.message);
}

console.log('══ AI-search audit ══');
console.log('pages:                    ' + stats.pages);
console.log('  with JSON-LD:           ' + stats.withJsonLd);
console.log('  with BreadcrumbList:    ' + stats.withBreadcrumb);
console.log('  with FAQPage:           ' + stats.withFaq);
console.log('  with mentions:          ' + stats.withMentions);
console.log('  with discovery links:   ' + stats.withDiscovery);
console.log('');
console.log('artifacts:');
artifactStatus.forEach(function (s) { console.log('  ' + s); });
console.log('  faq.jsonl questions:    ' + faqLines);
console.log('');
console.log('problems: ' + problems.length);
problems.slice(0, 40).forEach(function (p) { console.log('  · ' + p); });
process.exit(problems.length ? 1 : 0);
