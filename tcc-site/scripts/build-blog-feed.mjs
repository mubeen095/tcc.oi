#!/usr/bin/env node
/**
 * build-blog-feed.mjs
 * ---------------------------------------------------------------------------
 * Rebuilds public/feed.xml from scripts/blog-meta.cjs. Keeping the feed
 * generated means a new article can never be missing from RSS.
 *
 * Idempotent. Run: node scripts/build-blog-feed.mjs
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import blogMeta from './blog-meta.cjs';
const { ARTICLES, SITE } = blogMeta;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'feed.xml');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function rfc822(date) {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

const newest = ARTICLES.map((a) => a.date).sort().reverse()[0];
const items = ARTICLES.map(
  (a) => `    <item>
      <title>${esc(a.seoTitle.replace(/ \| TCC$/, ''))}</title>
      <link>${SITE}/blog/${a.file}</link>
      <guid isPermaLink="true">${SITE}/blog/${a.file}</guid>
      <description>${esc(a.desc)}</description>
      <dc:creator>TCC Team</dc:creator>
      <pubDate>${rfc822(a.date)}</pubDate>
      <category>${esc(a.tag)}</category>
    </item>`
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TCC Blog | AI Courses, Certifications, Internships &amp; Placement</title>
    <link>${SITE}/blog/</link>
    <description>AI courses, role-based AI certifications, internships, placement programs and interview guides for students and professionals. From The Coding Company (TCC).</description>
    <language>en-in</language>
    <lastBuildDate>${rfc822(newest)}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/tcc-og.png</url>
      <title>TCC Blog</title>
      <link>${SITE}/blog/</link>
    </image>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(OUT, xml, 'utf8');
console.log(`  ✓ feed.xml: ${ARTICLES.length} items`);
