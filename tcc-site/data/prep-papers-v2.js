/* ============================================================================
 * TCC PREP+ — multi-round paper assembler
 * ---------------------------------------------------------------------------
 * Builds a company's year-wise paper as a sequence of rounds:
 *
 *   Round 1  Aptitude   — numerical / reasoning / verbal / data (MCQ, scored)
 *   Round 2  Technical  — CS fundamentals MCQ (unlocks after Round 1)
 *   Round 3  Coding     — 1+ coding problems with a live compiler
 *
 * The aptitude and technical rounds are auto-scored. The coding round is
 * graded on sample test cases. A combined result then reports the score, the
 * per-topic breakdown, a readiness band and the topics to improve.
 *
 * Deterministic: the same company/year always produces the same paper.
 * ==========================================================================*/

'use strict';

const { BANK } = require('./prep-bank.js');
const { CS, CODING } = require('./prep-tech.js');
const { COMPANIES } = require('./companies-full.js');

function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

/* Walk the bank with a seeded start + co-prime stride so different years draw
   genuinely different questions. */
function pick(list, count, salt) {
  if (!list || !list.length) return [];
  const len = list.length;
  const h = seed(salt);
  const start = h % len;
  let stride = 1 + ((h >>> 8) % Math.max(1, len - 1));
  while (gcd(stride, len) !== 1 && stride > 1) stride--;
  const out = [];
  for (let i = 0; i < count; i++) out.push(list[(start + i * stride) % len]);
  return out;
}

const SECTION_META = {
  numerical: { name: 'Numerical Ability', source: 'numerical' },
  reasoning: { name: 'Reasoning Ability', source: 'reasoning' },
  verbal: { name: 'Verbal Ability', source: 'verbal' },
  data: { name: 'Data Interpretation', source: 'data' },
  cs: { name: 'Technical (CS Fundamentals)', source: 'cs' }
};

/* Section plan: how many questions of each section a company's paper uses. */
const SECTION_COUNT = {
  numerical: 8, reasoning: 7, verbal: 5, data: 5, cs: 8
};

/* The years a company offers, newest first. */
const YEARS = [2026, 2025, 2024];

/* How many coding problems a company's coding round uses. */
const CODING_COUNT = 2;

function companyById(id) {
  return COMPANIES.find((c) => c.id === id) || null;
}

function poolFor(source) {
  if (source === 'cs') return CS;
  return BANK[source] || [];
}

/* Build one round object. */
function buildRound(kind, companyId, year) {
  if (kind === 'apt') {
    const company = companyById(companyId);
    const sources = (company && company.plan && company.plan.apt) || ['numerical', 'reasoning', 'verbal'];
    const sections = [];
    for (const src of sources) {
      const meta = SECTION_META[src];
      if (!meta) continue;
      const count = SECTION_COUNT[src] || 6;
      const questions = pick(poolFor(meta.source), count, `${companyId}:${year}:apt:${src}`);
      if (!questions.length) continue;
      sections.push({
        id: src,
        name: meta.name,
        topic: meta.name,
        questions: questions.map((q) => ({ q: q.q, o: q.options, a: q.answer, e: q.explain, topic: meta.name }))
      });
    }
    return {
      kind: 'apt',
      index: 1,
      name: 'Aptitude Round',
      blurb: 'Numerical, reasoning and verbal — the first filter in most processes.',
      minutes: Math.max(12, Math.round(sections.reduce((n, s) => n + s.questions.length, 0) * 1.1)),
      sections
    };
  }

  if (kind === 'tech') {
    const company = companyById(companyId);
    const sources = (company && company.plan && company.plan.tech) || ['cs'];
    const sections = [];
    for (const src of sources) {
      const meta = SECTION_META[src];
      if (!meta) continue;
      const count = SECTION_COUNT[src] || 8;
      const questions = pick(poolFor(meta.source), count, `${companyId}:${year}:tech:${src}`);
      sections.push({
        id: src,
        name: meta.name,
        topic: meta.name,
        questions: questions.map((q) => ({ q: q.q, o: q.options, a: q.answer, e: q.explain, topic: q.topic || meta.name }))
      });
    }
    return {
      kind: 'tech',
      index: 2,
      name: 'Technical Round',
      blurb: 'Core CS fundamentals — DBMS, OS, networking, OOP, DSA and complexity.',
      minutes: Math.max(10, Math.round(sections.reduce((n, s) => n + s.questions.length, 0) * 1.0)),
      sections
    };
  }

  if (kind === 'code') {
    const problems = pick(CODING, CODING_COUNT, `${companyId}:${year}:code`);
    return {
      kind: 'code',
      index: 3,
      name: 'Coding Round',
      blurb: 'Write real code and run it. Graded on the sample test cases shown.',
      minutes: 45,
      problems
    };
  }

  return null;
}

/* Which rounds a company runs, in order. */
function roundPlan(companyId) {
  const company = companyById(companyId);
  const plan = (company && company.plan) || {};
  const rounds = [];
  if (plan.apt) rounds.push('apt');
  if (plan.tech) rounds.push('tech');
  if (plan.code) rounds.push('code');
  return rounds;
}

/* Build the full multi-round paper for a company + year. */
function buildPaper(companyId, year) {
  const company = companyById(companyId);
  if (!company) return null;
  const rounds = roundPlan(companyId).map((k) => buildRound(k, companyId, year)).filter(Boolean);
  const mcqTotal = rounds
    .filter((r) => r.kind !== 'code')
    .reduce((n, r) => n + r.sections.reduce((m, s) => m + s.questions.length, 0), 0);
  const codeTotal = rounds.filter((r) => r.kind === 'code').reduce((n, r) => n + r.problems.length, 0);
  const minutes = rounds.reduce((n, r) => n + r.minutes, 0);
  return {
    companyId,
    companyName: company.name,
    year,
    gate: company.gate,
    tint: company.tint,
    mark: company.mark,
    rounds,
    mcqTotal,
    codeTotal,
    minutes
  };
}

function companyPapers(companyId) {
  if (!companyById(companyId)) return [];
  return YEARS.map((y) => buildPaper(companyId, y));
}

module.exports = { buildPaper, companyPapers, roundPlan, seed, YEARS, SECTION_META };
