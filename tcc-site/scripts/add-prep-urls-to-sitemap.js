/* ─────────────────────────────────────────────────────────────────────────
   scripts/add-prep-urls-to-sitemap.js

   Registers every generated /prep+/ page in sitemap.xml. Idempotent — safe to
   run on every build.

     node scripts/add-prep-urls-to-sitemap.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');
const P = require('../data/prep.js');
const PAPERS = require('../data/prep-papers.js');

const ROOT = path.join(__dirname, '..', 'public');
const FILE = path.join(ROOT, 'sitemap.xml');
const BASE = 'https://thecodingcompany.io';
const TODAY = new Date().toISOString().slice(0, 10);

const urls = [];
urls.push({ loc: `${BASE}/prep+/`, priority: '0.9' });
urls.push({ loc: `${BASE}/prep+/aptitude/`, priority: '0.8' });
for (const t of P.PREP_TOPICS) urls.push({ loc: `${BASE}/prep+/aptitude/${t.id}/`, priority: '0.7' });
urls.push({ loc: `${BASE}/prep+/programming/`, priority: '0.8' });
for (const l of P.PREP_LANGS) urls.push({ loc: `${BASE}/prep+/programming/${l.id}/`, priority: '0.7' });
urls.push({ loc: `${BASE}/prep+/dsa/`, priority: '0.8' });
for (const s of P.PREP_DSA) urls.push({ loc: `${BASE}/prep+/dsa/${s.id}/`, priority: '0.7' });
urls.push({ loc: `${BASE}/prep+/mcq/`, priority: '0.8' });
for (const s of P.PREP_MCQ) urls.push({ loc: `${BASE}/prep+/mcq/${s.id}/`, priority: '0.7' });
urls.push({ loc: `${BASE}/prep+/companies/`, priority: '0.8' });
for (const c of P.PREP_COMPANIES) {
  urls.push({ loc: `${BASE}/prep+/companies/${c.id}/`, priority: '0.7' });
  const plan = PAPERS.COMPANY_PAPERS[c.id];
  if (plan) for (const y of plan.years) urls.push({ loc: `${BASE}/prep+/companies/${c.id}/${y}/`, priority: '0.6' });
}
/* Add all companies from the v2 roster (full 71-company set, 3 years each) */
try {
  const { COMPANIES } = require('../data/companies-full.js');
  const { YEARS } = require('../data/prep-papers-v2.js');
  COMPANIES.forEach((c) => {
    /* ensure roster and each pattern page are present */
    if (!urls.find((u) => u.loc === `${BASE}/prep+/companies/${c.id}/`)) {
      urls.push({ loc: `${BASE}/prep+/companies/${c.id}/`, priority: '0.7', lastmod: TODAY });
    }
    YEARS.forEach((y) => {
      const loc = `${BASE}/prep+/companies/${c.id}/${y}/`;
      if (!urls.find((u) => u.loc === loc)) {
        urls.push({ loc, priority: '0.6', lastmod: TODAY });
      }
    });
  });
} catch (e) { /* keep going */ }
for (const b of P.PREP_INTERVIEW) urls.push({ loc: `${BASE}/prep+/interview/${b.id}/`, priority: '0.7' });
urls.push({ loc: `${BASE}/prep+/mock-tests/`, priority: '0.8' });
for (const t of P.PREP_MOCK_TESTS) urls.push({ loc: `${BASE}/prep+/mock-tests/${t.id}/`, priority: '0.7' });

let xml = fs.readFileSync(FILE, 'utf8');
let added = 0;
let refreshed = 0;

for (const u of urls) {
  const locTag = `<loc>${u.loc}</loc>`;
  if (xml.indexOf(locTag) !== -1) {
    // refresh lastmod
    const re = new RegExp(`<loc>${u.loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*\\n(\\s*)<lastmod>[^<]*</lastmod>`);
    const next = xml.replace(re, `<loc>${u.loc}</loc>\n$1<lastmod>${TODAY}</lastmod>`);
    if (next !== xml) { xml = next; refreshed++; }
    continue;
  }
  const block =
    '  <url>\n' +
    `    <loc>${u.loc}</loc>\n` +
    `    <lastmod>${TODAY}</lastmod>\n` +
    '    <changefreq>weekly</changefreq>\n' +
    `    <priority>${u.priority}</priority>\n` +
    '  </url>\n';
  xml = xml.replace('</urlset>', block + '</urlset>');
  added++;
}

fs.writeFileSync(FILE, xml, 'utf8');
const count = (xml.match(/<url>/g) || []).length;
console.log(`sitemap.xml — Prep+ URLs: +${added} new, ${refreshed} refreshed | total URLs: ${count}`);
