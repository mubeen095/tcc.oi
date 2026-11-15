/* One-off: upgrade homepage JSON-LD to the AI-search standard.
   - Org → @graph (Organization + EducationalOrganization + WebSite)
     with knowsAbout, audience, slogan, foundingLocation, contactPoint.
   - FAQPage extended with high-value AI-search questions (dedup by name).
   Adds head discovery <link>s for the machine-readable artifacts.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const file = path.join(ROOT, 'public/index.html');
const E = require('./ai-entities.json');
let html = fs.readFileSync(file, 'utf8');

/* ── 1. Replace the first three JSON-LD blocks (Organization / WebSite /
      EducationalOrganization) with one Organization @graph ─────────── */
const orgGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://thecodingcompany.io/#organization',
      name: E.organization.name,
      alternateName: E.organization.alternateName,
      url: E.organization.url,
      logo: {
        '@type': 'ImageObject',
        url: E.organization.logo
      },
      description: E.organization.description,
      slogan: E.organization.slogan,
      foundingLocation: { '@type': 'Place', name: 'India' },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      knowsAbout: E.organization.knowsAbout,
      audience: E.organization.audience,
      sameAs: E.organization.sameAs,
      contactPoint: E.organization.sameAs
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://thecodingcompany.io/#educational',
      name: E.organization.name,
      alternateName: E.organization.alternateName,
      url: E.organization.url,
      parentOrganization: { '@id': 'https://thecodingcompany.io/#organization' },
      description:
        'AI courses, role-based AI certifications (TCC CERT+), internships and a placement program for global learners.',
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        name: 'TCC CERT+',
        credentialCategory: 'certification',
        description:
          '1,048 role-based AI certifications across 262 job roles and 32 industries, issued in four tiers: Foundation, Practitioner, Strategist and Executive.'
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://thecodingcompany.io/#website',
      name: 'The Coding Company (TCC)',
      alternateName: 'TCC',
      url: 'https://thecodingcompany.io',
      publisher: { '@id': 'https://thecodingcompany.io/#organization' },
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://thecodingcompany.io/bootcamps/?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

function block(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj, null, 2) + '</script>';
}

/* Find the run of the first three JSON-LD blocks and swap them out. */
const blocksRe = /[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g;
const found = [];
let m;
while ((m = blocksRe.exec(html)) !== null) {
  const body = m[0].replace(/^[\s\S]*?<script[^>]*>/, '').replace(/<\/script>[\s\S]*$/, '');
  let type = '';
  try { type = JSON.parse(body)['@type']; } catch (e) { type = 'INVALID'; }
  found.push({ index: m.index, length: m[0].length, type: type, full: m[0] });
}

const targets = found.filter(function (b) {
  return b.type === 'Organization' || b.type === 'WebSite' || b.type === 'EducationalOrganization';
});
if (targets.length !== 3) {
  throw new Error('Expected 3 blocks (Organization/WebSite/EducationalOrganization), found ' + targets.length);
}

/* replace from the first target to the last target (they are contiguous) */
const start = targets[0].index;
const end = targets[targets.length - 1].index + targets[targets.length - 1].length;
const replacement = '    ' + block(orgGraph) + '\n';
html = html.slice(0, start) + replacement + html.slice(end);

/* ── 2. Extend the FAQPage with the AI-search question bank ─────────── */
const faqRe = /(<script type="application\/ld\+json">)([\s\S]*?)<\/script>/g;
let faqBlock = null;
let mm;
while ((mm = faqRe.exec(html)) !== null) {
  if (/"FAQPage"/.test(mm[2])) { faqBlock = mm; break; }
}
if (!faqBlock) throw new Error('FAQPage block not found');

const faqObj = JSON.parse(faqBlock[2]);
const existing = new Set(faqObj.mainEntity.map(function (q) { return q.name; }));
E.faq.forEach(function (item) {
  if (existing.has(item.q)) return;
  existing.add(item.q);
  faqObj.mainEntity.push({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  });
});

const newFaq = '<script type="application/ld+json">' + JSON.stringify(faqObj, null, 2) + '</script>';
html = html.slice(0, faqBlock.index) + newFaq + html.slice(faqBlock.index + faqBlock[0].length);

/* ── 3. Head discovery links for the machine-readable artifacts ─────── */
const anchor = '<link rel="alternate" type="application/rss+xml" title="TCC Blog — AI Courses, Certifications & Placement" href="/feed.xml" />';
if (html.indexOf(anchor) === -1) throw new Error('RSS link anchor not found');
const discovery = anchor + '\n' +
  '    <link rel="alternate" type="text/plain" title="TCC facts for AI assistants (llms.txt)" href="/llms.txt" />\n' +
  '    <link rel="alternate" type="application/json" title="TCC structured facts (llms.json)" href="/llms.json" />\n' +
  '    <link rel="alternate" type="application/jsonl" title="TCC Q&A bank (faq.jsonl)" href="/faq.jsonl" />';
html = html.replace(anchor, discovery);

fs.writeFileSync(file, html, 'utf8');

/* ── report ─────────────────────────────────────────────────────────── */
const after = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
console.log('JSON-LD blocks after:', after.length);
after.forEach(function (b, i) {
  try {
    const j = JSON.parse(b[1]);
    const g = j['@graph'] || [j];
    console.log('  [' + i + ']', g.map(function (x) { return x['@type']; }).join(', '));
  } catch (e) {
    console.log('  [' + i + '] INVALID:', e.message);
  }
});
console.log('FAQ questions:', faqObj.mainEntity.length);
console.log('discovery links added:', /title="TCC facts for AI assistants/.test(html));
