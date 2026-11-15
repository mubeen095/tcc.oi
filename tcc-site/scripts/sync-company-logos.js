/* ─────────────────────────────────────────────────────────────────────────
   scripts/sync-company-logos.js

   Scans public/assets/img/company/ for permissioned logo files and
   flips the matching company's logoPermissionStatus to 'approved', pointing
   logoFile at the file it found.

   This script does NOT download anything. It only activates logo assets you
   have placed in the folder yourself, and only for companies you have named in
   the approval list below.

     node scripts/sync-company-logos.js --list
     node scripts/sync-company-logos.js --approve tcs,google,amazon
     node scripts/sync-company-logos.js --scan        (report only)
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'companies-full.js');
const LOGO_DIR = path.join(ROOT, 'public', 'assets', 'img', 'company');

const EXT = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];

function findLogo(id) {
  for (const ext of EXT) {
    const rel = `assets/img/company/${id}${ext}`;
    if (fs.existsSync(path.join(ROOT, 'public', rel))) return rel;
  }
  return null;
}

function companyIds() {
  delete require.cache[require.resolve(DATA)];
  return require(DATA).COMPANIES.map((c) => c.id);
}

const args = process.argv.slice(2);
const mode = args[0];

if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

if (mode === '--list' || !mode) {
  const ids = companyIds();
  const found = ids.filter((id) => findLogo(id));
  const missing = ids.filter((id) => !findLogo(id));
  console.log(`Logo folder: ${LOGO_DIR}\n`);
  console.log(`Found ${found.length} logo file(s):`);
  if (found.length) found.forEach((id) => console.log(`  ${id.padEnd(18)} -> ${findLogo(id)}`));
  else console.log('  (none)');
  console.log(`\n${missing.length} companies still using wordmark tiles:`);
  console.log('  ' + missing.join(', '));
  console.log('\nTo activate logos you have placed AND have permission for:');
  console.log('  node scripts/sync-company-logos.js --approve tcs,google,amazon');
  process.exit(0);
}

if (mode === '--approve-all') {
  /* Approve every company that has a file sitting in the folder.
     Use this once you have confirmed permission for the whole set. */
  const list = companyIds().filter((id) => findLogo(id));
  if (!list.length) {
    console.error(`No logo files found in ${LOGO_DIR}`);
    process.exit(1);
  }
  console.log(`Approving ${list.length} logo(s) found in the folder.\n`);
  args[1] = list.join(',');
  process.argv[1] = process.argv[1]; /* no-op, keeps flow readable */
}

if (mode === '--approve' || mode === '--approve-all') {
  const list = (args[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.length) {
    console.error('Pass a comma-separated list of company ids, e.g. --approve tcs,google');
    process.exit(1);
  }

  const ids = companyIds();
  const unknown = list.filter((id) => !ids.includes(id));
  if (unknown.length) {
    console.error('Unknown company id(s):', unknown.join(', '));
    process.exit(1);
  }
  const noFile = list.filter((id) => !findLogo(id));
  if (noFile.length) {
    console.error('No logo file found for:', noFile.join(', '));
    console.error(`Place files in ${LOGO_DIR} named <id>.svg|png|webp|jpg`);
    process.exit(1);
  }

  let src = fs.readFileSync(DATA, 'utf8');
  let changed = 0;

  for (const id of list) {
    const rel = findLogo(id);
    /* Find this company's C(...) call and inject/replace the opts argument.
       The call ends with the eligibility string followed by ')'. We append a
       final opts object before the closing paren of that specific call. */
    const re = new RegExp(`(C\\('${id}',[\\s\\S]*?)('[^']*')\\)(,?\\n)`, 'm');
    const m = src.match(re);
    if (!m) {
      console.warn(`  could not patch ${id} (pattern not matched) — skipping`);
      continue;
    }
    const opts = `, { logoFile: '${rel}', logoPermissionStatus: 'approved', logoNotes: 'Permission confirmed by site owner.' }`;
    src = src.replace(re, `$1$2${opts})$3`);
    changed++;
    console.log(`  approved ${id} -> ${rel}`);
  }

  fs.writeFileSync(DATA, src);
  console.log(`\nUpdated ${changed} company entr${changed === 1 ? 'y' : 'ies'} in data/companies-full.js`);
  console.log('Now run:  node scripts/build-prep-pages.js');
  process.exit(0);
}

console.error('Unknown flag. Use --list or --approve <ids>');
process.exit(1);
