import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('/Users/mubeen/Desktop/tcc.oi/tcc-site');
const files = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'assets' || e.name === 'node_modules') continue;
      walk(p);
    } else if (e.name.endsWith('.html')) files.push(p);
  }
}
walk(ROOT);

// 1. Page count + key pages
console.log('=== PAGE COUNT ===');
console.log('Total HTML pages:', files.length);

// 2. Sample descriptions
console.log('\n=== SAMPLE META DESCRIPTIONS ===');
for (const f of files.slice(0, 15)) {
  const h = fs.readFileSync(f, 'utf8');
  const desc = h.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (desc) {
    const rel = f.replace(ROOT, '').slice(0, 50);
    console.log(`  ${rel}: ${desc[1].slice(0, 120)}`);
  }
}

// 3. Key pages specific info
console.log('\n=== KEY PAGE DETAILS ===');
const keyPages = [
  '/index.html',
  '/careers/index.html',
  '/verify/index.html',
  '/bootcamps/index.html',
  '/domains/cse/index.html',
  '/prep+/companies/tcs/2027/index.html',
];

for (const rel of keyPages) {
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) { console.log(`  MISSING: ${rel}`); continue; }
  const h = fs.readFileSync(f, 'utf8');
  const t = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = h.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const ogTitle = h.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDesc = h.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogImg = h.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  console.log(`\n  ${rel}`);
  console.log(`    Title: ${t ? t[1].trim() : '(missing)'}`);
  console.log(`    Desc: ${desc ? desc[1].trim().slice(0, 150) : '(missing)'}`);
  console.log(`    og:title: ${ogTitle ? ogTitle[1].trim() : '(missing)'}`);
  console.log(`    og:desc: ${ogDesc ? ogDesc[1].trim().slice(0, 150) : '(missing)'}`);
  console.log(`    og:image: ${ogImg ? ogImg[1] : '(missing)'}`);
}

// 4. Check for .com references in any visible page source
console.log('\n=== .com vs .io in page source ===');
let comCount = 0, ioCount = 0;
for (const f of files.slice(0, 20)) {
  const h = fs.readFileSync(f, 'utf8');
  const c = (h.match(/thecodingcompany\.com/g) || []).length;
  const i = (h.match(/thecodingcompany\.io/g) || []).length;
  comCount += c; ioCount += i;
  if (c > 0 || i > 0) {
    const rel = f.replace(ROOT, '').slice(0, 40);
    console.log(`  ${rel}: .com=${c}, .io=${i}`);
  }
}
console.log(`  Total .com in 20 sampled pages: ${comCount}`);
console.log(`  Total .io in 20 sampled pages: ${ioCount}`);

// 5. Partner references
console.log('\n=== PARTNER REFERENCES ===');
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (h.includes('OpenAI') || h.includes('Lovable') || h.includes('Claude')) {
    const rel = f.replace(ROOT, '').slice(0, 50);
    const matches = h.match(/(OpenAI|Lovable|Claude)[^a-zA-Z0-9]/g) || [];
    console.log(`  ${rel}: ${matches.length} mentions`);
  }
}

// 6. Pricing mentions
console.log('\n=== PRICING MENTIONS ===');
for (const f of files.slice(0, 30)) {
  const h = fs.readFileSync(f, 'utf8');
  const priceMatch = h.match(/₹[\d,]+/g);
  if (priceMatch) {
    const rel = f.replace(ROOT, '').slice(0, 50);
    console.log(`  ${rel}: ${priceMatch.join(', ')}`);
  }
}

// 7. FAQ / claims structure
console.log('\n=== FAQ / CLAIMS ===');
for (const f of [files[0], files.find(f=>f.includes('careers')), files.find(f=>f.includes('verify'))]) {
  if (!f) continue;
  const h = fs.readFileSync(f, 'utf8');
  const faqCount = (h.match(/<a[^>]*href="#/gi) || []).length;
  const claimKeywords = (h.match(/(verified|legitimate|genuine|authentic|proven|certified|accredited)/gi) || []);
  const rel = f.replace(ROOT, '').slice(0, 40);
  console.log(`  ${rel}: ${claimKeywords.length} claim-related keywords, ${faqCount}+ anchor links`);
}

process.exit(0);