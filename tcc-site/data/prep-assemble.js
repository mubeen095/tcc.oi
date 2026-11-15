/* ============================================================================
 * TCC PREP+ — paper assembler
 * ---------------------------------------------------------------------------
 * Turns the extended question bank + the company paper plans into concrete
 * year-wise papers. Deterministic: the same company/year always produces the
 * same paper, and consecutive years draw different questions.
 *
 *   node -e "console.log(require('./data/prep-assemble.js').buildPaper('tcs-nqt',2026).sections.length)"
 * ==========================================================================*/

'use strict';

const { BANK } = require('./prep-bank.js');
const { COMPANY_PAPERS, PAPER_SECTIONS, COMPANY_LOGO } = require('./prep-papers.js');

/* Deterministic hash so each (company, year, section) starts at a different
   offset in the bank and consecutive years don't repeat the same questions. */
function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* Rotate the bank by a seeded offset and walk with a seeded stride so that
   different (company, year, section) seeds spread across the whole bank
   instead of clustering on adjacent questions. */
function pick(list, count, salt) {
  if (!list || !list.length) return [];
  const len = list.length;
  const h = seed(salt);
  const start = h % len;
  // A stride co-prime with len avoids short cycles; fall back to 1 if needed.
  let stride = 1 + ((h >>> 8) % Math.max(1, len - 1));
  for (let g = gcd(stride, len); g !== 1 && stride > 1; stride--) g = gcd(stride, len);
  const out = [];
  for (let i = 0; i < count; i++) out.push(list[(start + i * stride) % len]);
  return out;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

/* Build one paper: { company, year, sections:[{id,name,minutes,questions}],
   total, minutes, gate } */
function buildPaper(companyId, year) {
  const plan = COMPANY_PAPERS[companyId];
  if (!plan) return null;

  const sections = [];
  let total = 0;

  for (const sectionId of Object.keys(plan.plan)) {
    const count = plan.plan[sectionId];
    const meta = PAPER_SECTIONS[sectionId];
    const pool = BANK[meta.source] || [];
    const questions = pick(pool, Math.min(count, pool.length), `${companyId}:${year}:${sectionId}`);
    if (!questions.length) continue;
    // 1.2 minutes per question, rounded, floor of 8 minutes — a realistic pace
    const minutes = Math.max(8, Math.round(questions.length * 1.2));
    sections.push({ id: sectionId, name: meta.name, minutes, questions });
    total += questions.length;
  }

  return {
    companyId,
    year,
    gate: plan.gate,
    sections,
    total,
    minutes: sections.reduce((m, s) => m + s.minutes, 0),
    logo: COMPANY_LOGO[companyId] || { mark: companyId.toUpperCase(), tint: '#7fb4ff' }
  };
}

/* Every paper a company offers, newest year first. */
function companyPapers(companyId) {
  const plan = COMPANY_PAPERS[companyId];
  if (!plan) return [];
  return plan.years.map((y) => buildPaper(companyId, y));
}

module.exports = { buildPaper, companyPapers, seed };
