#!/usr/bin/env node
/**
 * build-careers.mjs
 * ---------------------------------------------------------------------------
 * Generates /careers/ plus one page per function:
 *
 *   /careers/inside-sales/
 *   /careers/marketing/
 *   /careers/revenue-operations/
 *   /careers/human-resources/
 *   /careers/accounts-finance/
 *
 * Every function carries the same five-level ladder — Intern, Associate,
 * Executive, Senior, Manager — so the site can honestly say there is a path
 * from intern to manager in each of the five functions.
 *
 * Each page ships canonical + OG/Twitter + BreadcrumbList, and every role
 * carries a JobPosting block. Applications go to careers@ by mail, prefilled
 * with the role title, which keeps the page working before the forms database
 * is provisioned.
 *
 * Idempotent. Run: node scripts/build-careers.mjs
 * ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const SITE = 'https://thecodingcompany.com';
const EMAIL = 'careers@thecodingcompany.io';
const DATE_POSTED = '2026-11-14';
const VALID_THROUGH = '2027-05-31T23:59:59+05:30';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  ['/bootcamps/', 'CERT+'],
  ['/prep+/companies/', 'Prep+'],
  ['/placement/', 'Placements'],
  ['/verify/', 'Verify'],
  ['/careers/', 'Careers'],
  ['/contact/', 'Contact'],
];

const LEVELS = [
  { name: 'Intern', type: 'INTERN', experience: '0–6 months', scope: 'Learn the system' },
  { name: 'Associate', type: 'FULL_TIME', experience: '0–2 years', scope: 'Run the work' },
  { name: 'Executive', type: 'FULL_TIME', experience: '2–4 years', scope: 'Own a number' },
  { name: 'Senior', type: 'FULL_TIME', experience: '4–7 years', scope: 'Design the system' },
  { name: 'Manager', type: 'FULL_TIME', experience: '7+ years', scope: 'Own the function' },
];

/* ── Shared language for every role ─────────────────────────────────────── */

const COMMON_REQUIREMENTS = [
  'Clear written English. You will be judged on how precisely you explain your own work.',
  'Comfort with AI tools in the workflow — using them, checking them, and saying when you did.',
  'Evidence over adjectives: a project, a campaign, a spreadsheet, or a process you can walk us through.',
  'Willingness to work remote-first with a small team, and to ask for context instead of guessing.',
];

const FUNCTIONS = [
  {
    slug: 'inside-sales',
    short: 'Inside Sales',
    name: 'Inside Sales',
    title: 'Inside Sales',
    kicker: 'Function 01',
    h1: 'Inside Sales, <span class="accent">from intern to manager</span>.',
    lede:
      'You will talk to people who are deciding whether to spend a year changing their career. That conversation has to be honest, specific, and useful even when the answer is no. We hire across five levels because the only way to get good at that conversation is to have it, review it, and have it again.',
    intro:
      'Inside Sales at TCC is not a script farm. It is a small, measurable team that owns the first real conversation a candidate has with us — and is expected to tell people when a programme is wrong for them.',
    whatYouDo:
      'You will work inbound and outbound conversations for CERT+, Placement Partner and cohort enrolments, keep the CRM honest, and feed what you hear back into the product and marketing teams.',
    ladderFocus: [
      'Shadow calls, research accounts, keep lists clean, and learn the product well enough to answer a real question.',
      'Run your own outbound sequences, qualify inbound enquiries, book meetings, and keep every record accurate.',
      'Own a monthly conversation target, run discovery calls end to end, and hand clean context to the next step.',
      'Handle complex or senior conversations, coach associates, tighten scripts, and improve forecast accuracy.',
      'Own the team number, hire and coach the team, set territory and coverage, and own process quality.',
    ],
    roles: [
      {
        level: 'Intern',
        summary:
          'A six-month internship for someone who wants to learn consultative selling properly. You will research accounts, listen to recorded calls, and build the product knowledge that makes a first conversation credible.',
        responsibilities: [
          'Research target accounts and maintain clean prospect lists in the CRM.',
          'Listen to and annotate recorded conversations against the call rubric.',
          'Shadow discovery calls and take notes that the account owner can actually use.',
          'Support follow-up by preparing accurate, non-pushy email drafts for review.',
        ],
        requirements: [
          'Final-year student or recent graduate, any discipline.',
          'Comfortable speaking to new people and asking direct questions.',
          'Able to write a short, clear email without filler.',
          'Available for six months, remote-first, with a reliable connection.',
        ],
      },
      {
        level: 'Associate',
        summary:
          'The first full-time rung. You will run outbound sequences and qualify inbound interest, with a target you can see and a review cadence that helps you hit it.',
        responsibilities: [
          'Run outbound email and call sequences for a defined segment.',
          'Qualify inbound enquiries against stated fit criteria rather than enthusiasm.',
          'Book discovery calls with complete context on the record.',
          'Keep CRM stages and notes accurate enough for someone else to take over.',
        ],
        requirements: [
          '0–2 years in sales, support, admissions, or a customer-facing role.',
          'Evidence of hitting a target, quota, or measurable service level.',
          'Comfort with a CRM and a structured pipeline.',
          'Able to explain a product accurately without overselling it.',
        ],
      },
      {
        level: 'Executive',
        summary:
          'You own a monthly conversation target and the quality of the discovery call itself: diagnosis first, recommendation second, and no pressure to close a bad fit.',
        responsibilities: [
          'Own discovery calls from first question to next-step decision.',
          'Maintain a monthly target for qualified conversations, not dials.',
          'Document objections and route product feedback to the right owner.',
          'Hand over complete, honest context to enrolment and placement teams.',
        ],
        requirements: [
          '2–4 years of consultative sales or admissions experience.',
          'A track record of consistent target attainment over at least four quarters.',
          'Strong discovery instincts: you ask one more question before pitching.',
          'Comfort discussing price, outcomes and eligibility without evasion.',
        ],
      },
      {
        level: 'Senior',
        summary:
          'You take the conversations that need judgement — senior professionals, employer-sponsored candidates, and edge cases — and you make the rest of the team better at them.',
        responsibilities: [
          'Handle complex and high-consideration conversations end to end.',
          'Coach associates and executives through recorded-call reviews.',
          'Improve scripts, qualification criteria and handover quality using evidence.',
          'Improve forecast accuracy by keeping stage definitions honest.',
        ],
        requirements: [
          '4–7 years in sales or admissions, including senior or enterprise conversations.',
          'Experience coaching others with a repeatable review method.',
          'Comfortable owning a forecast and being measured on its accuracy.',
          'Able to challenge a weak process without waiting for permission.',
        ],
      },
      {
        level: 'Manager',
        summary:
          'You own the function: the number, the hiring plan, the coaching system, and the standard for what an honest sales conversation sounds like at TCC.',
        responsibilities: [
          'Own the team target and the plan that produces it.',
          'Hire, onboard and coach across all five levels.',
          'Set coverage, segmentation and handover standards with marketing and RevOps.',
          'Protect the quality bar: no false urgency, no promises the programme cannot keep.',
        ],
        requirements: [
          '7+ years in sales, with at least 2 years managing a team.',
          'Experience building a repeatable hiring and coaching system.',
          'Fluency with pipeline data and the discipline to trust it.',
          'Judgement to turn down revenue that would damage the outcome.',
        ],
      },
    ],
  },
  {
    slug: 'marketing',
    short: 'Marketing',
    name: 'Marketing',
    kicker: 'Function 02',
    h1: 'Marketing, <span class="accent">from intern to manager</span>.',
    lede:
      'Most education marketing is a promise with a stock photo attached. Ours has to be specific enough to be checked. You will write, ship and measure work that explains what the programme does, who it is for, and what it will not do.',
    intro:
      'Marketing at TCC owns the public argument: the site, the guides, the campaigns, the proof, and the emails. The job is to make a serious decision easier, not to make a weak offer sound urgent.',
    whatYouDo:
      'You will work across content, lifecycle email, paid and organic social, landing pages and partner co-marketing. Every piece has a named audience and a measurable job.',
    ladderFocus: [
      'Research, draft, schedule, and learn the editorial standard by editing other people’s work.',
      'Own one channel end to end, write briefs, and report what happened without decorating it.',
      'Own a campaign calendar, ship landing pages, and connect spend to qualified conversations.',
      'Own positioning and messaging for a programme, run multi-channel programmes, and manage agencies.',
      'Own the marketing plan, the team, the budget, and the contribution to pipeline.',
    ],
    roles: [
      {
        level: 'Intern',
        summary:
          'A six-month internship in a small marketing team. You will research, draft, publish and review — and you will learn why most draft copy gets cut in half.',
        responsibilities: [
          'Research audiences, competitors and search demand for assigned topics.',
          'Draft short-form content, email copy and landing-page sections for review.',
          'Schedule social posts and maintain the content calendar.',
          'Compile weekly performance notes from analytics and channel dashboards.',
        ],
        requirements: [
          'Final-year student or recent graduate in any discipline.',
          'Able to write a clear 150-word summary of something you researched.',
          'Curious about distribution: search, social, email, partnerships.',
          'Available for six months, remote-first, with a reliable connection.',
        ],
      },
      {
        level: 'Associate',
        summary:
          'You own a channel and the quality of what ships on it. Expect to write, publish, measure, and rewrite — with feedback that is specific rather than polite.',
        responsibilities: [
          'Own one channel: lifecycle email, organic social, or content distribution.',
          'Write briefs that a designer or editor can execute without a meeting.',
          'Update landing-page copy and track conversion changes.',
          'Report channel performance honestly, including what did not work.',
        ],
        requirements: [
          '0–2 years in content, marketing, communications or a related role.',
          'A portfolio with at least two pieces you wrote and shipped.',
          'Comfort with analytics basics: source, conversion, retention.',
          'Editing discipline: you cut adjectives before adding them.',
        ],
      },
      {
        level: 'Executive',
        summary:
          'You own a campaign calendar and the link between spend and qualified conversations. Your work is judged on whether the right people moved, not on impressions.',
        responsibilities: [
          'Own the campaign calendar for one programme or audience.',
          'Brief and ship landing pages, emails and paid creative.',
          'Connect campaign data to qualified conversations with RevOps.',
          'Run experiments with a stated hypothesis and a stopping rule.',
        ],
        requirements: [
          '2–4 years of campaign or content marketing experience.',
          'Evidence of a campaign you owned end to end, with numbers.',
          'Able to write for a working professional without talking down to them.',
          'Comfort with paid media budgets and basic attribution.',
        ],
      },
      {
        level: 'Senior',
        summary:
          'You own positioning for a programme and the messaging system around it. You decide what we say, what we stop saying, and how the proof is presented.',
        responsibilities: [
          'Own positioning, messaging and the proof hierarchy for a programme.',
          'Design multi-channel programmes across content, email, social and partners.',
          'Manage agencies and freelancers against a clear scope and standard.',
          'Raise lead quality by tightening audience and message, not just volume.',
        ],
        requirements: [
          '4–7 years in marketing, with ownership of a programme or category.',
          'Strong writing sample and a clear point of view on what good looks like.',
          'Experience managing external partners and a budget.',
          'Able to disagree with a brief and explain why with evidence.',
        ],
      },
      {
        level: 'Manager',
        summary:
          'You own the marketing plan, the team and the contribution to pipeline. You are accountable for both the standard of the work and the honesty of the claims in it.',
        responsibilities: [
          'Own the annual marketing plan, budget and pipeline contribution.',
          'Hire, coach and set the editorial standard across the team.',
          'Set the claims policy with the verification team and enforce it.',
          'Choose the channels we invest in and the ones we stop.',
        ],
        requirements: [
          '7+ years in marketing, with at least 2 years managing a team.',
          'Experience owning a budget and reporting on pipeline contribution.',
          'A portfolio that shows judgement, not just output.',
          'Comfort saying no to a campaign that would compromise the claims policy.',
        ],
      },
    ],
  },
  {
    slug: 'revenue-operations',
    short: 'RevOps',
    name: 'Revenue Operations',
    kicker: 'Function 03',
    h1: 'Revenue Operations, <span class="accent">from intern to manager</span>.',
    lede:
      'RevOps is the function that decides whether the numbers are real. You will own the CRM, the definitions, the routing, the reporting and the forecast — and you will be expected to say when a metric is measuring the wrong thing.',
    intro:
      'TCC runs on a small revenue team, so RevOps is not a reporting desk at the end of the process. It sits inside the process: defining stages, fixing data, and making the handover from marketing to sales to enrolment visible.',
    whatYouDo:
      'You will work on CRM administration, funnel definitions, lead routing, dashboards, attribution, forecasting and the documentation that keeps all of it usable by someone who did not build it.',
    ladderFocus: [
      'Clean data, build simple reports, and document what you changed.',
      'Maintain routing, dashboards and CRM hygiene for the revenue team.',
      'Own funnel reporting, attribution rules and the definitions behind both.',
      'Design the GTM system: data model, integrations, forecasting and enablement.',
      'Own the RevOps function, the stack, the budget and the planning calendar.',
    ],
    roles: [
      {
        level: 'Intern',
        summary:
          'A six-month internship for someone who likes systems and evidence. You will start with data hygiene and simple reporting, and learn why a clean definition is worth more than a clever dashboard.',
        responsibilities: [
          'Audit CRM records for missing or contradictory fields.',
          'Build simple reports and verify them against source data.',
          'Document processes and definitions as you learn them.',
          'Support the team with list building, deduplication and QA.',
        ],
        requirements: [
          'Final-year student or recent graduate in any quantitative discipline.',
          'Comfort with spreadsheets, including lookups and pivot tables.',
          'Patience for detail and a habit of checking your own output.',
          'Available for six months, remote-first, with a reliable connection.',
        ],
      },
      {
        level: 'Associate',
        summary:
          'You keep the revenue engine accurate: routing, dashboards, CRM hygiene and the first version of the weekly report that the team actually uses.',
        responsibilities: [
          'Maintain lead routing rules and fix misrouted records.',
          'Build and refresh dashboards for marketing, sales and enrolment.',
          'Run weekly CRM hygiene checks and document exceptions.',
          'Respond to data requests with the definition you used, not just the number.',
        ],
        requirements: [
          '0–2 years in operations, analytics, CRM administration or similar.',
          'Working knowledge of a CRM such as HubSpot or Salesforce.',
          'Able to explain a metric and its limitations in plain English.',
          'Comfort with SQL or spreadsheet automation is a plus, not a gate.',
        ],
      },
      {
        level: 'Executive',
        summary:
          'You own funnel reporting and the definitions behind it. When two teams disagree about a number, you are the person who resolves it with a documented rule.',
        responsibilities: [
          'Own funnel reporting from first touch to enrolment.',
          'Define and document stages, attribution windows and conversion rules.',
          'Administer the CRM and the tools that feed it.',
          'Build the monthly business review with marketing and sales leads.',
        ],
        requirements: [
          '2–4 years in RevOps, sales operations, analytics or growth.',
          'Experience owning a CRM data model and a reporting suite.',
          'Able to run a definitions meeting and land a decision.',
          'Comfort with SQL, BI tools and basic automation.',
        ],
      },
      {
        level: 'Senior',
        summary:
          'You design the go-to-market system: the data model, integrations, forecasting method and the enablement that makes the system survive contact with a busy team.',
        responsibilities: [
          'Design the GTM data model and integrations across marketing, sales and enrolment.',
          'Own forecasting method, pipeline coverage rules and scenario models.',
          'Lead tool selection, migration and vendor management.',
          'Build enablement material so the system is used, not worked around.',
        ],
        requirements: [
          '4–7 years in RevOps or a related systems role.',
          'Experience designing a CRM architecture and integrating adjacent tools.',
          'Able to influence senior stakeholders without formal authority.',
          'Evidence of a system you designed that someone else still runs.',
        ],
      },
      {
        level: 'Manager',
        summary:
          'You own the RevOps function: the stack, the budget, the planning calendar and the standard for how TCC measures revenue.',
        responsibilities: [
          'Own the RevOps roadmap and the systems budget.',
          'Set the company-wide metric definitions and enforce them.',
          'Run the annual and quarterly planning calendar with finance and leadership.',
          'Hire and develop the team, and decide what we build versus buy.',
        ],
        requirements: [
          '7+ years in RevOps or operations, with at least 2 years managing.',
          'Experience owning a stack and a budget through a growth phase.',
          'Strong judgement on when precision matters and when it does not.',
          'Able to present a defensible number to a sceptical room.',
        ],
      },
    ],
  },
  {
    slug: 'human-resources',
    short: 'HR',
    name: 'Human Resources',
    kicker: 'Function 04',
    h1: 'Human Resources, <span class="accent">from intern to manager</span>.',
    lede:
      'A small company cannot hide behind an HR portal. You will run hiring, onboarding, reviews and the uncomfortable conversations that keep a team healthy — with documentation that is fair, clear and usable.',
    intro:
      'HR at TCC covers the full employee lifecycle, not just recruiting. The function exists to make expectations explicit, decisions consistent, and the experience of joining and growing here legible.',
    whatYouDo:
      'You will own sourcing and coordination, onboarding, policy, performance cycles, manager support, compliance and the records that make all of it auditable.',
    ladderFocus: [
      'Source, schedule, organise records, and learn the hiring standard.',
      'Own coordination, onboarding and first-round screening for assigned roles.',
      'Own full-cycle hiring for a function and the employee lifecycle after it.',
      'Design talent and performance processes, and coach managers through them.',
      'Own the people function, the hiring plan, retention and the compliance calendar.',
    ],
    roles: [
      {
        level: 'Intern',
        summary:
          'A six-month internship in a small people team. You will learn how hiring actually works by doing the coordination, the records and the candidate communication.',
        responsibilities: [
          'Source candidates and maintain a clean applicant tracker.',
          'Schedule interviews and communicate with candidates promptly.',
          'Organise onboarding documents and employee records.',
          'Support research on policy, benefits and hiring benchmarks.',
        ],
        requirements: [
          'Final-year student or recent graduate in HR, psychology, commerce or a related field.',
          'Strong written communication and follow-through.',
          'Discretion with confidential information.',
          'Available for six months, remote-first, with a reliable connection.',
        ],
      },
      {
        level: 'Associate',
        summary:
          'You own the coordination layer and your first screens. Candidates should experience the process as fast, clear and respectful, even when the answer is no.',
        responsibilities: [
          'Own interview scheduling and candidate communication end to end.',
          'Run structured first-round screens against a written scorecard.',
          'Run onboarding for new joiners, including documentation and first-week plan.',
          'Maintain employee records and the compliance tracker.',
        ],
        requirements: [
          '0–2 years in HR, recruiting, operations or a people-facing role.',
          'Experience with an applicant tracker or HRIS.',
          'Able to give a candidate a clear answer without hedging.',
          'Working knowledge of Indian employment basics.',
        ],
      },
      {
        level: 'Executive',
        summary:
          'You own full-cycle hiring for assigned functions and the employee lifecycle after the offer: onboarding, check-ins, documentation and the first performance cycle.',
        responsibilities: [
          'Own full-cycle hiring: brief, source, screen, close and hand over.',
          'Run onboarding and the 30/60/90 check-in cadence.',
          'Maintain policy documents and answer employee questions accurately.',
          'Support performance cycles with templates, data and follow-up.',
        ],
        requirements: [
          '2–4 years of HR or talent experience, including full-cycle hiring.',
          'Experience running structured interviews and scorecards.',
          'Comfort with policy interpretation and careful documentation.',
          'Able to handle a sensitive conversation without avoiding it.',
        ],
      },
      {
        level: 'Senior',
        summary:
          'You design the talent and performance systems, and coach managers to use them. Your work shows up in better decisions and fewer surprises, not in more process.',
        responsibilities: [
          'Design hiring, onboarding and performance processes for a growing team.',
          'Coach managers through feedback, performance and retention cases.',
          'Own compliance review and the documentation standard.',
          'Use hiring and retention data to diagnose problems early.',
        ],
        requirements: [
          '4–7 years in HR, with ownership of a people process or programme.',
          'Experience coaching managers through difficult cases.',
          'A practical grasp of Indian labour and contract requirements.',
          'Able to simplify a process without losing the control it provides.',
        ],
      },
      {
        level: 'Manager',
        summary:
          'You own the people function: the hiring plan, the manager standard, retention, compliance and the experience of working at TCC.',
        responsibilities: [
          'Own the annual hiring plan and the people budget.',
          'Set the manager standard and build the coaching system around it.',
          'Own the compliance calendar and the employee handbook.',
          'Report on retention, engagement and hiring health to leadership.',
        ],
        requirements: [
          '7+ years in HR, with at least 2 years managing a function or team.',
          'Experience building people systems through a growth phase.',
          'Sound judgement on risk, fairness and documentation.',
          'Able to hold a boundary with a senior stakeholder.',
        ],
      },
    ],
  },
  {
    slug: 'accounts-finance',
    short: 'Accounts',
    name: 'Accounts & Finance',
    kicker: 'Function 05',
    h1: 'Accounts &amp; Finance, <span class="accent">from intern to manager</span>.',
    lede:
      'Money has to be recorded correctly, reported plainly, and collected on time. You will work across bookkeeping, receivables, payroll inputs, statutory filings and the management accounts that tell us whether the model is working.',
    intro:
      'Accounts at TCC is a small function with a wide surface: student payments, refunds, vendor bills, payroll inputs, GST and TDS coordination with our CA, and the monthly numbers leadership uses to make decisions.',
    whatYouDo:
      'You will own day-to-day accounting, reconciliations, collections and reporting, with external professionals brought in for statutory sign-off rather than day-to-day execution.',
    ladderFocus: [
      'Record transactions, file documents, and learn the chart of accounts.',
      'Own AP/AR, reconciliations and vendor and student queries.',
      'Own month-end, MIS and the filing calendar with our CA.',
      'Own budgeting, unit economics, audit readiness and financial controls.',
      'Own the finance function, cash flow, compliance and board reporting.',
    ],
    roles: [
      {
        level: 'Intern',
        summary:
          'A six-month internship for someone who wants real ledger exposure. You will record, verify and file — and learn why an unreconciled account is a future problem.',
        responsibilities: [
          'Enter invoices, receipts and payment records accurately.',
          'Support bank and payment-gateway reconciliations.',
          'Organise vendor and student payment documentation.',
          'Assist with monthly reports and statutory document collection.',
        ],
        requirements: [
          'Final-year student or recent graduate in commerce, accounting or finance.',
          'Comfort with spreadsheets and careful data entry.',
          'Basic understanding of double-entry bookkeeping.',
          'Available for six months, remote-first, with a reliable connection.',
        ],
      },
      {
        level: 'Associate',
        summary:
          'You own the daily accounting rhythm: payables, receivables, reconciliations and the queries that come with them.',
        responsibilities: [
          'Process vendor invoices and student receipts in the accounting system.',
          'Run bank, gateway and ledger reconciliations on schedule.',
          'Follow up on receivables and resolve payment queries.',
          'Prepare payroll inputs and maintain supporting records.',
        ],
        requirements: [
          '0–2 years in accounts, bookkeeping or finance operations.',
          'Working knowledge of Tally, Zoho Books or a comparable system.',
          'Accuracy under deadline and a habit of tying out to source.',
          'Familiarity with GST basics and invoice requirements.',
        ],
      },
      {
        level: 'Executive',
        summary:
          'You own month-end and the management information that comes out of it, plus the filing calendar we run with our CA.',
        responsibilities: [
          'Own month-end close, schedules and the monthly MIS pack.',
          'Coordinate GST, TDS and other filings with the CA.',
          'Own collections, refunds and the receivables ageing report.',
          'Maintain the fixed-asset, prepayment and accrual schedules.',
        ],
        requirements: [
          '2–4 years in accounting or finance operations.',
          'Experience closing books and preparing management reports.',
          'Working knowledge of Indian statutory filings and deadlines.',
          'Able to explain a variance without hiding it in a footnote.',
        ],
      },
      {
        level: 'Senior',
        summary:
          'You own budgeting, unit economics, audit readiness and the controls that keep the numbers defensible as volume grows.',
        responsibilities: [
          'Build and maintain the annual budget and rolling forecast.',
          'Own unit economics and cohort-level contribution analysis.',
          'Lead audit readiness and maintain the control documentation.',
          'Improve processes across collections, payouts and reconciliations.',
        ],
        requirements: [
          '4–7 years in finance, with ownership of budgeting or audit.',
          'Strong modelling skills and a clear writing style for variance notes.',
          'Experience with audits, controls and statutory coordination.',
          'Able to challenge a spending decision with a defensible number.',
        ],
      },
      {
        level: 'Manager',
        summary:
          'You own the finance function: cash flow, compliance, reporting and the financial plan that the rest of the company is held to.',
        responsibilities: [
          'Own cash flow, the compliance calendar and the finance team.',
          'Own the management accounts and board reporting pack.',
          'Set pricing, refund and credit policy with leadership.',
          'Manage the CA relationship, audit and statutory risk.',
        ],
        requirements: [
          '7+ years in finance, with at least 2 years managing a function.',
          'Experience owning compliance and reporting through growth.',
          'Able to present a plain, decision-ready financial picture.',
          'Judgement to balance speed with controls that actually work.',
        ],
      },
    ],
  },
];

/* ── Shell ──────────────────────────────────────────────────────────────── */

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE}${item}`,
    })),
  };
}

function jobPosting(fn, role, level) {
  const description = `<p>${esc(role.summary)}</p><p><strong>What you will do</strong></p><ul>${role.responsibilities
    .map((r) => `<li>${esc(r)}</li>`)
    .join('')}</ul><p><strong>What we need</strong></p><ul>${role.requirements
    .map((r) => `<li>${esc(r)}</li>`)
    .join('')}</ul>`;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: `${fn.name} ${level.name}`,
    description,
    datePosted: DATE_POSTED,
    validThrough: VALID_THROUGH,
    employmentType: level.type,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'The Coding Company',
      sameAs: SITE,
      logo: `${SITE}/assets/img/tcc-logo-mark.png`,
    },
    jobLocation: {
      '@type': 'Placement',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        addressCountry: 'IN',
      },
    },
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: { '@type': 'Country', name: 'India' },
    industry: 'Education',
    occupationalCategory: fn.name,
    directApply: true,
    url: `${SITE}/careers/${fn.slug}/#${level.name.toLowerCase()}`,
  };
}

function shell({ route, title, desc, h1, kicker, lede, facts = '', crumb = '', body, pager = '', extraLd = [] }) {
  const canonical = `${SITE}${route}`;
  const nav = NAV.map(([href, label]) => {
    const active = href !== '/contact/' && route.startsWith(href) ? ' aria-current="page"' : '';
    return `      <a href="${href}"${active}>${label}</a>`;
  }).join('\n');

  const ld = [breadcrumbLd([['Home', '/'], ['Careers', '/careers/'], ...(route === '/careers/' ? [] : [[h1.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'), route]])])]
    .concat(extraLd)
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join('\n');

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="The Coding Company (TCC)">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="${SITE}/tcc-og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/tcc-og.png">
<meta name="theme-color" content="#060606">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/tcc-favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap">
<!-- tcc-theme:boot: dark-only, applied before first paint -->
    <script>
      (function () {
        var root = document.documentElement;
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', '#050505');
      })();
    </script>
<link rel="stylesheet" href="/assets/css/tcc-theme.css?v=20261114a">
<link rel="stylesheet" href="/assets/css/tcc-careers.css">
${ld}
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>

<header class="site">
  <div class="wrap bar">
    <a class="brand" href="/"><img src="/assets/img/tcc-logo-mark.png" width="66" height="44" alt="The Coding Company"></a>
    <nav class="top" aria-label="Primary">
${nav}
    </nav>
  </div>
</header>

<main id="main" tabindex="-1">
  <div class="wrap">
    <section class="c-hero">
      <div class="c-hero-inner">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span class="sep">/</span><a href="/careers/">Careers</a>${route === '/careers/' ? '' : `<span class="sep">/</span><span class="cur">${crumb}</span>`}
        </nav>
        <div class="eyebrow">${kicker}</div>
        <h1 class="display">${h1}</h1>
        <p class="lede">${lede}</p>
        ${facts ? `<div class="hero-facts">${facts}</div>` : ''}
      </div>
    </section>
${body}
${pager}
  </div>
</main>

<footer class="site">
  <div class="wrap">
    <div class="cols">
      <div>
        <h3>Programmes</h3>
        <a href="/bootcamps/">CERT+</a>
        <a href="/prep+/companies/">Prep+</a>
        <a href="/placement/">Placements</a>
        <a href="/100-club/">100 Club</a>
      </div>
      <div>
        <h3>Evidence</h3>
        <a href="/diagnostic/">Diagnostic</a>
        <a href="/verify/">Verify</a>
        <a href="/verify/rubric/">Marking rubric</a>
        <a href="/verify/stats/">Published stats</a>
        <a href="/verify/what-we-dont-claim/">What we don't claim</a>
      </div>
      <div>
        <h3>Company</h3>
        <a href="/careers/">Careers</a>
        <a href="/partners/">Partners</a>
        <a href="/contact/">Contact</a>
        <a href="/privacy-policy/">Privacy</a>
        <a href="/refund-policy/">Refunds</a>
      </div>
    </div>
    <div class="legal">
      The Coding Company · Hyderabad, Telangana, India<br>
      TCC CERT+ is an industry credential issued by The Coding Company. It is not a government licence or a regulated professional qualification.
    </div>
  </div>
</footer>
</body>
</html>`;
}

function write(route, html) {
  const dir = path.join(PUBLIC, route.replace(/^\//, '').replace(/\/$/, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`  · ${route}`);
}

function mailto(role) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(`Application — ${role}`)}`;
}

function levelFor(role) {
  return LEVELS.find((l) => l.name === role.level);
}

/* ── /careers/ hub ──────────────────────────────────────────────────────── */

const functionCards = FUNCTIONS.map(
  (fn) => `        <a class="fn" href="/careers/${fn.slug}/">
          <div class="fn-kicker">${fn.kicker} · ${fn.roles.length} levels</div>
          <div class="fn-title">${fn.name}</div>
          <p class="fn-desc">${fn.intro}</p>
          <div class="fn-levels">${LEVELS.map((l) => `<span class="chip">${l.name}</span>`).join('')}</div>
          <span class="fn-go">See the ladder →</span>
        </a>`
).join('\n');

const hubLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Open roles at The Coding Company',
  numberOfItems: FUNCTIONS.length * LEVELS.length,
  itemListElement: FUNCTIONS.flatMap((fn) =>
    fn.roles.map((r) => ({
      '@type': 'ListItem',
      name: `${fn.name} ${r.level}`,
      url: `${SITE}/careers/${fn.slug}/#${r.level.toLowerCase()}`,
    }))
  ),
};

write(
  '/careers/',
  shell({
    route: '/careers/',
    title: 'Careers | Inside Sales, Marketing, RevOps, HR & Accounts',
    desc: 'Open roles across Inside Sales, Marketing, Revenue Operations, HR and Accounts & Finance. Every function hires from intern to manager.',
    kicker: 'Careers',
    h1: 'Build the company that <span class="accent">proves AI skills</span>.',
    lede:
      'We are a small team in Hyderabad building role-based AI certification and placement for people who need a fair shot at a better job. We hire across five functions, and every one has a path from intern to manager.',
    facts: `<span class="fact">${FUNCTIONS.length} functions</span><span class="fact">${FUNCTIONS.length * LEVELS.length} open levels</span><span class="fact">Remote-first, India</span><span class="fact">Hyderabad HQ</span>`,
    extraLd: [hubLd],
    body: `
    <h2>Five functions. Five levels. One hiring bar.</h2>
    <p>We do not run a separate "senior only" track. Each function below is published with the same ladder — Intern, Associate, Executive, Senior, Manager — because the work is learnable and the standard should be visible at every rung.</p>
    <p>If you are applying below the level a role is written for, say so. We would rather read an honest application than a stretched one.</p>

    <div class="fn-grid">
${functionCards}
    </div>

    <h2 id="open-roles">All open roles</h2>
    <p>${FUNCTIONS.length * LEVELS.length} levels across five functions. Every link goes to the role's responsibilities, requirements and application address.</p>
    <div class="role-index">
${FUNCTIONS.map(
  (fn) => `      <div class="ri-col">
        <h3>${fn.name}</h3>
        <ul>${fn.roles
          .map(
            (r) =>
              `<li><a href="/careers/${fn.slug}/#${r.level.toLowerCase()}">${fn.name} ${r.level} <span aria-hidden="true">→</span></a></li>`
          )
          .join('')}</ul>
      </div>`
).join('\n')}
    </div>

    <h2 id="how-we-hire">How we hire</h2>
    <div class="steps">
      <div class="step"><b>Application</b><p>A CV and one piece of evidence relevant to the role. A campaign, a dashboard, a process note, a call recording — something you can talk about. No cover letter template.</p></div>
      <div class="step"><b>Work sample</b><p>A short, scoped exercise that mirrors the job. We tell you the time box in advance and we do not ask for unpaid production work.</p></div>
      <div class="step"><b>Conversation</b><p>Two interviews: one on craft, one on judgement and working style. You will meet the person you would report to, not a panel of strangers.</p></div>
      <div class="step"><b>Decision</b><p>We aim to reply to every complete application within 10 working days. If we are slower, we will tell you why and give you a date.</p></div>
    </div>

    <h2>What we look for</h2>
    <ul>
      <li><strong>Evidence.</strong> A claim about your ability should come with something a stranger can inspect.</li>
      <li><strong>Clarity.</strong> You can explain your work in plain English, including the parts that went wrong.</li>
      <li><strong>Ownership.</strong> You notice a broken handover and fix it, rather than routing it to a meeting.</li>
      <li><strong>Judgement with AI.</strong> You use AI tools, verify their output, and disclose what you used.</li>
    </ul>

    <h2>Pay, location and practicalities</h2>
    <p>Roles are remote-first in India, with an office in Hyderabad for people who want one. We share the compensation band before the first interview, and the final offer depends on the level and the evidence you bring. Internships carry a stipend and a defined six-month scope.</p>
    <p>We do not ask for unpaid production work, and we do not keep a role open to collect CVs. If a role closes, the page is updated before the next build.</p>

    <div class="callout">
      <p><strong>How to apply:</strong> email <a class="inline" href="${mailto('Open application')}">${EMAIL}</a> with the role title in the subject, your CV, and one link or attachment that shows the work. Tell us the level you are applying for and the level you think you are not ready for yet. If email is not practical, use the <a class="inline" href="/contact/">contact page</a> and put the role in the message.</p>
    </div>

    <div class="actions">
      <a class="btn" href="/careers/inside-sales/">Browse Inside Sales</a>
      <a class="btn ghost" href="/verify/">See how we verify claims</a>
    </div>`,
    pager: `<div class="pager"><a href="/verify/"><span class="dir">Previous</span>How we verify claims</a><a href="/careers/inside-sales/"><span class="dir">Next</span>Inside Sales</a></div>`,
  })
);

/* ── Function pages ─────────────────────────────────────────────────────── */

const ORDER = FUNCTIONS.map((f) => f.slug);

FUNCTIONS.forEach((fn, index) => {
  const route = `/careers/${fn.slug}/`;
  const prev = FUNCTIONS[index - 1];
  const next = FUNCTIONS[index + 1];

  const roleCards = fn.roles
    .map((role) => {
      const level = levelFor(role);
      const requirements = [...role.requirements, ...COMMON_REQUIREMENTS.slice(2, 4)];
      return `    <article class="role" id="${role.level.toLowerCase()}">
      <div class="role-head">
        <h3>${fn.name} ${role.level}</h3>
        <div class="role-tags"><span class="tag">${level.experience}</span><span class="tag ${role.level === 'Intern' ? 'good' : ''}">${role.level === 'Intern' ? 'Internship' : 'Full-time'}</span><span class="tag">Remote, India</span></div>
      </div>
      <p class="role-summary">${role.summary}</p>
      <div class="role-cols">
        <div><h4>What you will do</h4><ul>${role.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div><h4>What we need</h4><ul>${requirements.map((r) => `<li>${r}</li>`).join('')}</ul></div>
      </div>
      <div class="role-foot">
        <span class="role-meta">Level scope: ${level.scope} · Compensation band shared before the first interview</span>
        <a class="btn small" href="${mailto(`${fn.name} ${role.level}`)}">Apply for this role</a>
      </div>
    </article>`;
    })
    .join('\n');

  const ladder = fn.roles
    .map((r, i) => {
      const level = levelFor(r);
      return `        <tr><td><b>${level.name}</b></td><td>${level.experience}</td><td>${fn.ladderFocus[i]}</td></tr>`;
    })
    .join('\n');

  const ld = fn.roles.map((r) => jobPosting(fn, r, levelFor(r)));

  write(
    route,
    shell({
      route,
      title: `${fn.name} jobs — Intern to Manager | TCC Careers`,
      desc: `Open ${fn.name} roles at The Coding Company, from intern to manager. Responsibilities, requirements and how to apply for each level.`,
      kicker: `Careers · ${fn.kicker}`,
      crumb: fn.name,
      h1: fn.h1,
      lede: fn.lede,
      facts: `<span class="fact">${fn.roles.length} levels</span><span class="fact">Remote-first, India</span><span class="fact">Hyderabad HQ</span><span class="fact">Applications open</span>`,
      extraLd: ld,
      body: `
    <h2>About the function</h2>
    <p>${fn.intro}</p>
    <p>${fn.whatYouDo}</p>

    <h2>The ladder</h2>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Level</th><th>Experience</th><th>What changes at this level</th></tr></thead>
        <tbody>
${ladder}
        </tbody>
      </table>
    </div>

    <h2>Open roles</h2>
    <p>All roles are remote-first in India. The Hyderabad office is available if you prefer to work from it. Compensation bands are shared before the first interview.</p>
${roleCards}

    <h2>How to apply</h2>
    <p>Email <a class="inline" href="${mailto(`${fn.name} open application`)}">${EMAIL}</a> with <strong>${fn.name} — the level</strong> in the subject line. Attach your CV and one link or file that shows the work. A short note on why this function, in your own words, is more useful than a cover letter template. If email is not practical, use the <a class="inline" href="/contact/">contact page</a> and include the role title.</p>
    <p>If you are between two levels, apply for the lower one and tell us what evidence you think supports the higher one. We will tell you honestly which conversation we are having.</p>

    <div class="actions">
      <a class="btn" href="${mailto(`${fn.name} application`)}">Email your application</a>
      <a class="btn ghost" href="/careers/#how-we-hire">Read the hiring process</a>
    </div>`,
      pager: `<div class="pager"><a href="${prev ? `/careers/${prev.slug}/` : '/careers/'}"><span class="dir">Previous</span>${prev ? prev.name : 'All careers'}</a><a href="${next ? `/careers/${next.slug}/` : '/careers/'}"><span class="dir">Next</span>${next ? next.name : 'All careers'}</a></div>`,
    })
  );
});

console.log(`\nCareers rendered: ${FUNCTIONS.length + 1} pages, ${FUNCTIONS.length * LEVELS.length} role levels.`);
