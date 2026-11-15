/* ─────────────────────────────────────────────────────────────────────────
   scripts/build-sitemap.mjs

   Rebuilds public/sitemap.xml from what is actually on disk.

   Rules
   - Every directory index.html becomes a trailing-slash URL.
   - Pages carrying <meta name="robots" content="…noindex…"> are skipped.
   - Private/app routes (admin, member, login, the 100 Club app shell) are
     skipped. They are reachable, just not for search.
   - Query-string URLs are never emitted: one URL per real document.
   - lastmod comes from the file's mtime, so it is honest rather than stamped.
   - The AI discovery artifacts are appended as their own entries.

     node scripts/build-sitemap.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE = 'https://thecodingcompany.io';
const OUT = path.join(PUBLIC, 'sitemap.xml');

const EXCLUDE_PREFIXES = ['/admin', '/member', '/login', '/100-club/app'];
const EXCLUDE_FILES = new Set(['/404.html']);

const AI_URLS = [
  '/ai.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/llms.json',
  '/faq.jsonl',
];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function urlFor(file) {
  let rel = path.relative(PUBLIC, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function hasNoindex(file) {
  const head = fs.readFileSync(file, 'utf8').slice(0, 20000);
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head);
}

function tier(url) {
  if (url === '/') return { changefreq: 'weekly', priority: '1.0' };
  if (url === '/bootcamps/' || url === '/placement/' || url === '/prep+/') {
    return { changefreq: 'daily', priority: '0.95' };
  }
  if (url === '/outcomes/' || url === '/100-club/' || url === '/roadmaps/') {
    return { changefreq: 'weekly', priority: '0.9' };
  }
  if (url.startsWith('/prep+/companies/')) return { changefreq: 'monthly', priority: '0.8' };
  if (url === '/careers/' || url.startsWith('/careers/')) {
    return { changefreq: 'weekly', priority: '0.8' };
  }
  if (url.startsWith('/blog/')) return { changefreq: 'monthly', priority: '0.7' };
  if (url.startsWith('/domains/') || url.startsWith('/roadmaps/')) {
    return { changefreq: 'monthly', priority: '0.7' };
  }
  return { changefreq: 'monthly', priority: '0.6' };
}

const pages = walk(PUBLIC)
  .map((file) => ({ file, url: urlFor(file) }))
  .filter(({ file, url }) => {
    if (EXCLUDE_FILES.has(url)) return false;
    if (EXCLUDE_PREFIXES.some((p) => url === p || url.startsWith(p + '/'))) return false;
    return !hasNoindex(file);
  })
  .sort((a, b) => (a.url === '/' ? -1 : b.url === '/' ? 1 : a.url.localeCompare(b.url)));

const seen = new Set();
const entries = [];

for (const { file, url } of pages) {
  if (seen.has(url)) continue;
  seen.add(url);
  const { changefreq, priority } = tier(url);
  const lastmod = fs.statSync(file).mtime.toISOString().slice(0, 10);
  entries.push({ loc: SITE + url, lastmod, changefreq, priority });
}

for (const url of AI_URLS) {
  const file = path.join(PUBLIC, url);
  if (!fs.existsSync(file)) continue;
  const lastmod = fs.statSync(file).mtime.toISOString().slice(0, 10);
  entries.push({ loc: SITE + url, lastmod, changefreq: 'weekly', priority: '0.6' });
}

const body = entries
  .map(
    (e) =>
      '  <url>\n' +
      `    <loc>${e.loc}</loc>\n` +
      `    <lastmod>${e.lastmod}</lastmod>\n` +
      `    <changefreq>${e.changefreq}</changefreq>\n` +
      `    <priority>${e.priority}</priority>\n` +
      '  </url>'
  )
  .join('\n');

fs.writeFileSync(
  OUT,
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`,
  'utf8'
);

console.log(`sitemap.xml — ${entries.length} URLs (${pages.length} pages scanned)`);
