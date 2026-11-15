#!/usr/bin/env node
/**
 * build-blog-hub.mjs
 * ---------------------------------------------------------------------------
 * Rebuilds the "All guides" grid, topic pills and Blog structured data on
 * /blog/ from scripts/blog-meta.cjs, so the hub always lists every article.
 *
 * The hub is a hand-written shell (it is also the source of the shared blog
 * chrome), so this script patches it in place between markers instead of
 * regenerating the whole document.
 *
 * Idempotent. Run: node scripts/build-blog-hub.mjs
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import blogMeta from './blog-meta.cjs';
const { ARTICLES, CATEGORIES, SITE } = blogMeta;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.join(ROOT, 'public', 'blog', 'index.html');
const IMG = '../assets/img/blog';

if (!ARTICLES.length) throw new Error('blog-meta.cjs has no articles');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function card(a) {
  return `                <a class="card post reveal" href="/blog/${a.file}">
                  <div class="post-media" style="background-image:url('${IMG}/${a.image}')" role="img" aria-label="${esc(a.imageAlt || a.title)}"></div>
                  <div class="post-body">
                    <div class="post-tag">${esc(a.tag)}</div>
                    <div class="post-title">${esc(a.title)}</div>
                    <p class="post-desc">${esc(a.desc)}</p>
                    <div class="post-foot"><span>${a.readTime} min read</span><span class="go">Read →</span></div>
                  </div>
                </a>`;
}

function pills() {
  return CATEGORIES.map(
    (c) => `                <a class="cat-pill" href="/blog/category/${c.slug}">${c.name}</a>`
  ).join('\n');
}

function blogLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE}/blog/#blog`,
    name: 'TCC Blog',
    description:
      'Guides on AI courses, role-based AI certifications, AI internships, placement and interviews for students and working professionals.',
    url: `${SITE}/blog/`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE}/#organization` },
    blogPost: ARTICLES.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.seoTitle.replace(/ \| TCC$/, ''),
      url: `${SITE}/blog/${a.file}`,
      datePublished: a.date,
      dateModified: a.date,
      author: { '@id': `${SITE}/#organization` },
      image: `${SITE}/assets/img/blog/${a.image}`,
    })),
  };
}

let html = fs.readFileSync(HUB, 'utf8');

function between(source, start, end, replacement) {
  const a = source.indexOf(start);
  if (a === -1) throw new Error(`Missing marker: ${start}`);
  const b = source.indexOf(end, a + start.length);
  if (b === -1) throw new Error(`Missing marker: ${end}`);
  return source.slice(0, a + start.length) + '\n' + replacement + '\n                ' + source.slice(b);
}

html = between(html, '<!-- BLOG_GRID_START -->', '<!-- BLOG_GRID_END -->', ARTICLES.map(card).join('\n\n'));
html = between(html, '<!-- BLOG_PILLS_START -->', '<!-- BLOG_PILLS_END -->', pills());

html = html.replace(
  /<span class="hero-chip">\d+ in-depth guides<\/span>/,
  `<span class="hero-chip">${ARTICLES.length} in-depth guides</span>`
);
html = html.replace(
  /<span class="hero-chip">\d+ topics<\/span>/,
  `<span class="hero-chip">${CATEGORIES.length} topics</span>`
);

const ldJson = JSON.stringify(blogLd(), null, 2).replace(/\n/g, '\n    ');
const ldRe = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "Blog",[\s\S]*?<\/script>/;
if (!ldRe.test(html)) throw new Error('Blog JSON-LD block not found on /blog/');
html = html.replace(ldRe, `<script type="application/ld+json">\n    ${ldJson}\n    </script>`);

fs.writeFileSync(HUB, html, 'utf8');
console.log(`  ✓ blog hub: ${ARTICLES.length} guides, ${CATEGORIES.length} topics`);
