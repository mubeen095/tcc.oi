/* ─────────────────────────────────────────────────────────────────────────
   scripts/add-ai-urls-to-sitemap.js

   Registers the AI-search artifacts (/ai.txt, /llms.txt, /llms-full.txt,
   /llms.json, /faq.jsonl) in sitemap.xml so crawlers and assistants can
   discover them. Idempotent.

     node scripts/add-ai-urls-to-sitemap.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const FILE = path.join(ROOT, 'sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

const AI_URLS = [
  { loc: 'https://thecodingcompany.com/llms.txt', changefreq: 'weekly', priority: '0.6' },
  { loc: 'https://thecodingcompany.com/llms-full.txt', changefreq: 'weekly', priority: '0.6' },
  { loc: 'https://thecodingcompany.com/llms.json', changefreq: 'weekly', priority: '0.6' },
  { loc: 'https://thecodingcompany.com/ai.txt', changefreq: 'weekly', priority: '0.6' },
  { loc: 'https://thecodingcompany.com/faq.jsonl', changefreq: 'weekly', priority: '0.6' }
];

let xml = fs.readFileSync(FILE, 'utf8');
let added = 0;

AI_URLS.forEach(function (u) {
  if (xml.indexOf('<loc>' + u.loc + '</loc>') !== -1) return;
  const block = '  <url>\n' +
    '    <loc>' + u.loc + '</loc>\n' +
    '    <lastmod>' + TODAY + '</lastmod>\n' +
    '    <changefreq>' + u.changefreq + '</changefreq>\n' +
    '    <priority>' + u.priority + '</priority>\n' +
    '  </url>\n';
  xml = xml.replace('</urlset>', block + '</urlset>');
  added++;
});

/* Refresh lastmod on the AI hub pages we just regenerated. */
xml = xml.replace(/<loc>(https:\/\/thecodingcompany\.com\/ai-courses-for\/[^<]*)<\/loc>\s*\n(\s*)<lastmod>[^<]*<\/lastmod>/g,
  function (m, loc, ws) { return '<loc>' + loc + '</loc>\n' + ws + '<lastmod>' + TODAY + '</lastmod>'; });

fs.writeFileSync(FILE, xml, 'utf8');

const count = (xml.match(/<url>/g) || []).length;
console.log('sitemap.xml — AI URLs added:', added, '| total URLs:', count);
