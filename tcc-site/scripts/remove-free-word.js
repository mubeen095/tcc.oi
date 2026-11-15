#!/usr/bin/env node
/* ============================================================================
 * Remove the word "free" from the public site copy.
 * ---------------------------------------------------------------------------
 *   node scripts/remove-free-word.js            # dry run: report what changes
 *   node scripts/remove-free-word.js --apply    # write the changes
 *
 * Covers visible copy, <title>, meta descriptions, Open Graph/Twitter cards
 * and JSON-LD in every .html file under public.
 *
 * Deliberately kept (the word is not marketing copy):
 *   freelance / freelancer          — a profession
 *   free memory / free RAM / free() — memory management terminology
 *   error-free / bug-free / code-free
 *
 * Run scripts/verify-no-free.mjs afterwards; it fails if anything is left.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');

/* Ordered: longer phrases first so a short rule cannot eat a longer one. */
const RULES = [
  /* ── Prep+ boilerplate ─────────────────────────────────────────────── */
  [/\bFree from TCC Prep\+\./g, 'From TCC Prep+.'],
  [/\bfree from TCC Prep\+\./g, 'from TCC Prep+.'],
  [/\bFree from The Coding Company Prep\+\./g, 'From The Coding Company Prep+.'],
  [/\bfree from The Coding Company Prep\+\./g, 'from The Coding Company Prep+.'],
  [/\bFree aptitude practice from The Coding Company Prep\+\./g, 'Aptitude practice from The Coding Company Prep+.'],
  [/\bfree aptitude practice from The Coding Company Prep\+\./g, 'aptitude practice from The Coding Company Prep+.'],
  [/\bFree technical MCQ practice from The Coding Company Prep\+\./g, 'Technical MCQ practice from The Coding Company Prep+.'],
  [/\bfree technical MCQ practice from The Coding Company Prep\+\./g, 'technical MCQ practice from The Coding Company Prep+.'],
  [/\bFree DSA practice from The Coding Company Prep\+\./g, 'DSA practice from The Coding Company Prep+.'],
  [/\bfree DSA practice from The Coding Company Prep\+\./g, 'DSA practice from The Coding Company Prep+.'],
  [/\bFree coding practice from The Coding Company Prep\+\./g, 'Coding practice from The Coding Company Prep+.'],
  [/\bfree coding practice from The Coding Company Prep\+\./g, 'coding practice from The Coding Company Prep+.'],
  [/\bFree interview preparation from The Coding Company Prep\+\./g, 'Interview preparation from The Coding Company Prep+.'],
  [/\bfree interview preparation from The Coding Company Prep\+\./g, 'interview preparation from The Coding Company Prep+.'],
  [/\bFree practice from The Coding Company Prep\+\./g, 'Practice from The Coding Company Prep+.'],
  [/\bfree practice from The Coding Company Prep\+\./g, 'practice from The Coding Company Prep+.'],

  /* ── "free" as a value claim ───────────────────────────────────────── */
  [/\bPrep\+ is free, unlimited practice\./g, 'Prep+ is unlimited practice.'],
  [/\bprep\+ is free, unlimited practice\./g, 'prep+ is unlimited practice.'],
  [/\bPrep\+ is free and open to everyone\./g, 'Prep+ is open to everyone.'],
  [/\bprep\+ is free and open to everyone\./g, 'prep+ is open to everyone.'],
  [/\bIs TCC Prep\+ free\?/g, 'Do I need to pay for TCC Prep+?'],
  [/\bis TCC Prep\+ free\?/g, 'is TCC Prep+ free to use?'],
  [/\bis tcc prep\+ free\?/g, 'is tcc prep+ free to use?'],
  [/\bEvery question, exercise and mock test on Prep\+ is free to use( while you prepare)?\./g, 'Every question, exercise and mock test on Prep+ is included$1.'],
  [/\bevery question, exercise and mock test on prep\+ is free to use( while you prepare)?\./g, 'every question, exercise and mock test on prep+ is included$1.'],
  [/\bfree to use, no sign-up to start\./g, 'no sign-up to start.'],
  [/\bFree to use, no sign-up to start\./g, 'No sign-up to start.'],
  [/\bfree to use, no sign-up\./g, 'no sign-up.'],
  [/\bFree to use, no sign-up\./g, 'No sign-up.'],
  [/\bfree, no sign-up\./g, 'no sign-up.'],
  [/\bFree, no sign-up\./g, 'No sign-up.'],
  [/\bfree, no sign-up\b/g, 'no sign-up'],
  [/\bFree, no sign-up\b/g, 'No sign-up'],
  [/\bstart free practice\b/gi, 'Start practice'],
  [/\bevery set is free\./gi, 'every set is open.'],
  [/\ba free practice library\b/gi, 'a practice library'],
  [/\bfree practice library\b/gi, 'practice library'],
  [/\bFree practice library\b/g, 'Practice library'],
  [/\bTCC Prep\+ · Free practice\b/g, 'TCC Prep+ · Practice'],
  [/\bTCC Prep\+ · free practice\b/g, 'TCC Prep+ · practice'],
  [/\bSit a free /g, 'Sit a '],
  [/\bsit a free /g, 'sit a '],
  [/\bOfficial free past papers\b/gi, 'Official past papers'],
  [/\bpast papers for free\./gi, 'past papers publicly.'],
  [/\bpast papers free\./gi, 'past papers publicly.'],
  [/\bFree, no registration\./gi, 'No registration.'],
  [/\bfree, no registration\./gi, 'no registration.'],
  [/\bFree Timed Mock Tests\b/g, 'Timed Mock Tests'],
  [/\bFree Timed Mock Test\b/g, 'Timed Mock Test'],
  [/\bfree timed mock tests\b/gi, 'timed mock tests'],
  [/\bfree timed mock test\b/gi, 'timed mock test'],
  [/\bfree placement practice\b/gi, 'placement practice'],
  [/\bFree placement practice\b/g, 'Placement practice'],
  [/\bfree interview and placement preparation\b/gi, 'interview and placement preparation'],
  [/\bFree interview and placement preparation\b/g, 'Interview and placement preparation'],
  [/\bfree interview & placement preparation\b/gi, 'interview & placement preparation'],
  [/\bFree interview & placement preparation\b/g, 'Interview & placement preparation'],
  [/Prep\+ — Free /g, 'Prep+ — '],

  /* ── non-Prep pages ────────────────────────────────────────────────── */
  [/\bfree tools, libraries, and frameworks\b/gi, 'tools, libraries, and frameworks'],
  [/>tools, libraries, and frameworks\b/g, '>Tools, libraries, and frameworks'],
  [/>placement practice\b/g, '>Placement practice'],
  [/content="placement practice\b/g, 'content="Placement practice'],
  [/<title>placement practice\b/g, '<title>Placement practice'],
  [/\bfree course on deploying ml systems\b/gi, 'course on deploying ml systems'],
  [/\bfree hackathon pizza\b/gi, 'hackathon pizza'],
  [/\bfree live ai career webinar\b/gi, 'live AI career webinar'],
  [/\bfree ai career webinar\b/gi, 'AI career webinar'],
  [/\bFree AI Career Webinar\b/g, 'AI Career Webinar'],
  [/\bFree AI Career Webinar\b/gi, 'AI Career Webinar'],
  [/\bFree Live AI Career Sessions\b/g, 'Live AI Career Sessions'],
  [/\bfree live webinars\b/gi, 'live webinars'],
  [/\bfree live ai career webinars\b/gi, 'live AI career webinars'],
  [/\bFree Live Webinar for IT Professionals\b/g, 'Live Webinar for IT Professionals'],
  [/\bJoin the Free AI Career Webinar\b/g, 'Join the AI Career Webinar'],
  [/\bWhat the free session covers\b/g, 'What the session covers'],
  [/\bFree live session\./g, 'Live session.'],
  [/\bJoin free, attend live\b/g, 'Join us, attend live'],
  [/\bfree interview practice on Prep\+/gi, 'interview practice on Prep+'],
  [/\bFree to start, no sign-up wall\./g, 'Open to start, no sign-up wall.'],
  [/\bopen source & free\b/gi, 'open source'],
  [/<span class="rmp-tag">free<\/span>/gi, '<span class="rmp-tag">included</span>'],

  /* ── leftovers: "free" as a plain adjective ───────────────────────── */
  [/\bfor free\b/gi, 'at no cost'],
  [/\bfree of charge\b/gi, 'at no cost'],
];

/* Contexts where "free" is a real word, not a marketing claim. */
const ALLOW = [
  /\bfreelance\w*\b/i,
  /\bfree\s*(memory|ram)\b/i,
  /\b(error|bug|code|collision|clash)-free\b/i,
  /\bfree-text\b/i,
  /\bmemory-free\b/i,
  /\bmalloc,\s*free\b/i,
  /\bfree\(\)/i,
  /data-title="free"/i,
  />free<\/text>/i,
  />free<\/button>/i,
  /free\.\s*Open topic details/i,
  /"label":"free"/i,
];

function allowed(context) {
  return ALLOW.some((re) => re.test(context));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(html|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function transform(html) {
  let out = html;
  let hits = 0;
  for (const [re, to] of RULES) {
    out = out.replace(re, (...args) => { hits += 1; return typeof to === 'string' ? to : to(...args); });
  }
  return { out, hits };
}

function remaining(html) {
  const found = [];
  for (const m of html.matchAll(/.{0,70}\bfree\b.{0,70}/gi)) {
    if (!allowed(m[0])) found.push(m[0].replace(/\s+/g, ' ').trim());
  }
  return found;
}

const apply = process.argv.includes('--apply');
const files = walk(ROOT);
let changed = 0, edits = 0;
const left = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const { out, hits } = transform(before);
  if (hits > 0) {
    changed += 1;
    edits += hits;
    if (apply) fs.writeFileSync(file, out);
  }
  const rest = remaining(out);
  if (rest.length) left.push({ file: path.relative(ROOT, file), rest });
}

console.log(`${apply ? 'Applied' : 'Would change'} ${edits} occurrences across ${changed}/${files.length} pages.`);
if (left.length) {
  console.log(`\n${left.length} page(s) still contain "free":`);
  for (const { file, rest } of left.slice(0, 40)) {
    console.log(`  ${file}`);
    for (const line of rest.slice(0, 4)) console.log(`    · ${line}`);
  }
  if (left.length > 40) console.log(`  … and ${left.length - 40} more`);
}
process.exitCode = left.length && apply ? 1 : 0;
