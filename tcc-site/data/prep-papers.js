/* ============================================================================
 * TCC PREP+ — company-wise, year-wise paper model
 * ---------------------------------------------------------------------------
 * Powers /prep+/companies/<company>/ and /prep+/companies/<company>/<year>/.
 *
 * WHAT THESE PAPERS ARE
 * Each company has a bank of questions written to that company's publicly
 * documented test pattern, split into the sections that company actually runs
 * and organised into year-wise papers so you can practise the way the exam is
 * sat. The questions are ORIGINAL TCC writing. They are pattern-accurate, not
 * transcribed from any company's confidential or licensed test material.
 *
 * Company hiring tests are not public documents. Anything sold online as a
 * "previous year paper" for a private employer is reconstructed from memory or
 * copied from a paid prep site, so it cannot be reused. Government exams are
 * different: SSC, UPSC, IBPS and RRB publish their own past papers for free.
 * Those are linked under REFERENCE_PAPERS below as official further reading.
 *
 * LOGOS
 * Each company carries a `logo` entry describing a brand-safe wordmark tile
 * (initials + name + brand colour). No third-party logo image files are
 * shipped. To use a real logo you must hold the rights to it — drop a file in
 * assets/img/company/ and add `logoFile` to the entry below.
 * ==========================================================================*/

'use strict';

/* ── brand-safe wordmark tiles ───────────────────────────────────────────
   `mark`  — the short text shown in the tile
   `tint`  — the tile's accent colour (used for the wordmark, not a copy of
             any company's actual logo artwork)
   `file`  — optional path to a logo you have the right to display            */
const COMPANY_LOGO = {
  'tcs-nqt': { mark: 'TCS', tint: '#6b4fbb' },
  infosys: { mark: 'INFY', tint: '#0b7fc4' },
  wipro: { mark: 'WIPRO', tint: '#7c3aed' },
  cognizant: { mark: 'CTS', tint: '#1667c1' },
  accenture: { mark: 'ACN', tint: '#a100ff' },
  zoho: { mark: 'ZOHO', tint: '#e42527' },
  amazon: { mark: 'AMZN', tint: '#ff9900' },
  deloitte: { mark: 'D', tint: '#86bc25' },
  hcl: { mark: 'HCL', tint: '#0b5cab' },
  ibm: { mark: 'IBM', tint: '#0f62fe' }
};

/* ── sections a company paper can contain ────────────────────────────────
   Maps a section id to its label and the topic bank it draws from.         */
const PAPER_SECTIONS = {
  numerical: { name: 'Numerical Ability', source: 'numerical' },
  reasoning: { name: 'Reasoning Ability', source: 'reasoning' },
  verbal: { name: 'Verbal Ability', source: 'verbal' },
  data: { name: 'Data Interpretation', source: 'data' },
  coding: { name: 'Programming Logic', source: 'coding' }
};

/* ── the year-wise paper plan per company ────────────────────────────────
   `years`  — the papers offered, newest first
   `plan`   — how many questions each section contributes to a paper
   `gate`   — what the paper is gating (used in the copy)                   */
const COMPANY_PAPERS = {
  'tcs-nqt': {
    gate: 'the NQT National Qualifier Test',
    plan: { numerical: 10, reasoning: 8, verbal: 6, coding: 4 },
    years: [2026, 2025, 2024, 2023]
  },
  infosys: {
    gate: 'the Infosys online aptitude test',
    plan: { numerical: 9, reasoning: 8, verbal: 5 },
    years: [2026, 2025, 2024]
  },
  wipro: {
    gate: 'the Wipro NLTH / Elite assessment',
    plan: { numerical: 8, reasoning: 7, verbal: 5, coding: 4 },
    years: [2026, 2025, 2024]
  },
  cognizant: {
    gate: 'the Cognizant GenC assessment',
    plan: { numerical: 8, reasoning: 7, verbal: 5, coding: 4 },
    years: [2026, 2025, 2024]
  },
  accenture: {
    gate: 'the Accenture cognitive and technical assessment',
    plan: { numerical: 7, reasoning: 8, verbal: 6, coding: 4 },
    years: [2026, 2025, 2024]
  },
  zoho: {
    gate: 'the Zoho programming rounds',
    plan: { numerical: 5, reasoning: 5, coding: 8 },
    years: [2026, 2025, 2024]
  },
  amazon: {
    gate: 'the Amazon online assessment',
    plan: { numerical: 6, reasoning: 6, coding: 8 },
    years: [2026, 2025]
  },
  deloitte: {
    gate: 'the Deloitte aptitude assessment',
    plan: { numerical: 8, reasoning: 8, verbal: 6 },
    years: [2026, 2025, 2024]
  },
  hcl: {
    gate: 'the HCLTech online assessment',
    plan: { numerical: 8, reasoning: 7, verbal: 5, coding: 4 },
    years: [2026, 2025, 2024]
  },
  ibm: {
    gate: 'the IBM cognitive assessment',
    plan: { numerical: 7, reasoning: 8, verbal: 5, coding: 4 },
    years: [2026, 2025]
  }
};

/* ── official free reference papers ──────────────────────────────────────
   Government bodies that publish their own past papers at no cost. These are
   the genuinely-free exam papers, offered here as further reading.           */
const REFERENCE_PAPERS = [
  {
    body: 'Staff Selection Commission (SSC)',
    what: 'CGL, CHSL, MTS, GD Constable, CPO, JE, Stenographer — shift-wise papers',
    url: 'https://ssc.gov.in/for-candidates/previous-year-question-paper',
    note: 'Official Government of India source. No registration.'
  },
  {
    body: 'Union Public Service Commission (UPSC)',
    what: 'Civil Services Prelims (GS I / CSAT), Mains, NDA, CDS',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    note: 'Official UPSC source. No registration.'
  },
  {
    body: 'Institute of Banking Personnel Selection (IBPS)',
    what: 'PO, Clerk, Specialist Officer, RRB — prelims and mains',
    url: 'https://www.ibps.in/',
    note: 'Official IBPS source. Past papers are posted under each recruitment cycle.'
  },
  {
    body: 'Railway Recruitment Board (RRB)',
    what: 'NTPC, Group D, ALP, JE — CBT papers by zone',
    url: 'https://www.rrbcdg.gov.in/',
    note: 'Official Indian Railways source. Zone-wise archives.'
  }
];

module.exports = {
  COMPANY_LOGO,
  PAPER_SECTIONS,
  COMPANY_PAPERS,
  REFERENCE_PAPERS
};
