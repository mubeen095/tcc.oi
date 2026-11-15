/* ─────────────────────────────────────────────────────────────────────────
   scripts/add-worksim-footer-link.js

   WorkSim is a pilot, so it gets a footer link — not primary navigation.
   Adds "WorkSim (pilot)" to every site footer that does not already link to
   /worksim/. Idempotent: run it as often as you like.

     node scripts/add-worksim-footer-link.js            (apply)
     node scripts/add-worksim-footer-link.js --dry-run  (report only)
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const DRY = process.argv.includes('--dry-run');

const LINK = '<a href="/worksim/">WorkSim (pilot)</a>';
const BARE_LINK =
  '<a href="/worksim/" style="color:inherit;text-decoration:underline">WorkSim (pilot)</a>';

const COLUMN_ORDER = ['Careers', 'Programs', 'Resources', 'Company', 'Prepare', 'Guides'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'worksim' || entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function addToFooter(footer) {
  /* roadmaps use their own footer with a flat link row */
  if (footer.includes('class="rm-footer-links"')) {
    const at = footer.indexOf('</div>', footer.indexOf('class="rm-footer-links"'));
    if (at === -1) return null;
    return footer.slice(0, at) + '\n                ' + LINK + '\n              ' + footer.slice(at);
  }

  /* contact / policy pages: <div class="cols"><div><h3>Programs</h3>…</div></div> */
  if (footer.includes('class="cols"')) {
    const columns = [];
    const re = /<div>\s*<h3>([^<]+)<\/h3>([\s\S]*?)<\/div>/g;
    let m;
    while ((m = re.exec(footer))) {
      columns.push({ end: re.lastIndex, heading: m[1] });
    }
    if (columns.length) {
      let target = null;
      for (const heading of COLUMN_ORDER) {
        target = columns.find((c) => c.heading === heading);
        if (target) break;
      }
      if (!target) target = columns[columns.length - 1];
      const at = target.end - '</div>'.length;
      return footer.slice(0, at) + LINK + footer.slice(at);
    }
  }

  /* rich footer: pick the most relevant column */
  const columns = [];
  const re = /<div class="footer-col">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(footer))) {
    columns.push({
      start: m.index,
      end: re.lastIndex,
      heading: (m[1].match(/<h3>([^<]+)<\/h3>/) || [])[1] || '',
    });
  }

  if (columns.length) {
    let target = null;
    for (const heading of COLUMN_ORDER) {
      target = columns.find((c) => c.heading === heading);
      if (target) break;
    }
    if (!target) target = columns[columns.length - 1];

    const at = target.end - '</div>'.length;
    return footer.slice(0, at) + LINK + footer.slice(at);
  }

  /* CERT+ catalogue footer: flat nav row */
  if (footer.includes('class="foot-links"')) {
    const at = footer.lastIndexOf('</nav>');
    if (at === -1) return null;
    return footer.slice(0, at) + LINK + footer.slice(at);
  }

  /* simple one-line footer */
  const close = footer.lastIndexOf('</footer>');
  return footer.slice(0, close) + ' · ' + BARE_LINK + footer.slice(close);
}

const files = walk(ROOT);
const totals = { rich: 0, columns: 0, roadmap: 0, flat: 0, bare: 0, skipped: 0 };
let changedFiles = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('href="/worksim/"')) {
    totals.skipped++;
    continue;
  }

  const match = src.match(/<footer[\s\S]*?<\/footer>/);
  if (!match) {
    totals.skipped++;
    continue;
  }

  const updated = addToFooter(match[0]);
  if (!updated) {
    totals.skipped++;
    continue;
  }

  if (match[0].includes('class="rm-footer-links"')) totals.roadmap++;
  else if (match[0].includes('class="footer-col"')) totals.rich++;
  else if (match[0].includes('class="cols"')) totals.columns++;
  else if (match[0].includes('class="foot-links"')) totals.flat++;
  else totals.bare++;

  src = src.slice(0, match.index) + updated + src.slice(match.index + match[0].length);
  changedFiles++;
  if (!DRY) fs.writeFileSync(file, src);
}

console.log(`${DRY ? '[dry run] ' : ''}Files changed: ${changedFiles}`);
console.log(`  rich footers   : ${totals.rich}`);
console.log(`  column footers : ${totals.columns}`);
console.log(`  roadmap footers: ${totals.roadmap}`);
console.log(`  flat nav rows  : ${totals.flat}`);
console.log(`  simple footers : ${totals.bare}`);
console.log(`  already linked / no footer: ${totals.skipped}`);
