#!/usr/bin/env node
/**
 * Builds public/certs-data.js — the shared TCC CERT+ catalog.
 *
 * Source of truth for the role list is the exported array in
 * data/industries.js. This script re-emits it into a
 * shared file (so the catalog page and every cert page read the same data)
 * and expands each role into 4 tier certifications:
 *   Foundation -> Practitioner -> Strategist -> Executive
 * = 262 roles x 4 = 1,048 certifications, each with its own id/slug.
 *
 * Re-run:  node scripts/build-certs.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data/industries.js');
const ALIAS_SRC = path.join(ROOT, 'data/role-aliases.js');
const OUT = path.join(ROOT, 'public/certs-data.js');

const srcText = fs.readFileSync(SRC, 'utf8');
const m = srcText.match(/module\.exports = (\[[\s\S]*\]);\s*$/);
if (!m) throw new Error('Could not find the exported role array in data/industries.js');
const industriesBlock = 'var INDUSTRIES = ' + m[1] + ';';

/* ── role aliases: every real-world job title -> closest canonical role ── */
const ROLE_ALIASES = require(ALIAS_SRC);
const canonicalRoles = new Set();
m[1].replace(/\[\s*"([^"]+)"/g, (_, r) => { canonicalRoles.add(r); return _; });
{
  const bad = Object.entries(ROLE_ALIASES.aliases).filter(([, v]) => !canonicalRoles.has(v));
  if (bad.length) {
    throw new Error(
      'data/role-aliases.js points at roles that do not exist:\n' +
      bad.map(([k, v]) => '  ' + k + ' -> ' + v).join('\n')
    );
  }
}
const aliasBlock =
  'var CERT_ROLE_ALIASES = ' + JSON.stringify(ROLE_ALIASES.aliases, null, 0) + ';\n\n' +
  'var CERT_ROLE_ADDITIONS = ' + JSON.stringify(ROLE_ALIASES.additions, null, 0) + ';';

/* ───────────────────────── curated industry meta ───────────────────────── */
const META = {
  foundation: {
    blurb: 'Universal AI literacy for every professional, whatever your role or industry.',
    companies: ['Deloitte', 'Accenture', 'Infosys', 'TCS', 'Wipro', 'Cognizant', 'Capgemini', 'EY', 'PwC', 'IBM'],
    adjacent: ['AI Operations Associate', 'Digital Transformation Analyst', 'Business Analyst', 'Project Coordinator'],
    payINR: [6, 12], payUSD: [65, 95]
  },
  software: {
    blurb: 'Engineering the AI-native stack — from copilots and agents to production systems.',
    companies: ['Google', 'Microsoft', 'Amazon', 'Atlassian', 'GitHub', 'Zoho', 'Freshworks', 'Razorpay', 'Flipkart', 'Stripe'],
    adjacent: ['Backend Engineer', 'Platform Engineer', 'DevOps Engineer', 'Solutions Engineer'],
    payINR: [12, 30], payUSD: [110, 170]
  },
  data: {
    blurb: 'Data, ML and emerging-tech specialists who turn models into shipped products.',
    companies: ['OpenAI', 'NVIDIA', 'Databricks', 'Snowflake', 'Anthropic', 'DeepMind', 'Fractal Analytics', 'Mu Sigma', 'Tredence', 'Hugging Face'],
    adjacent: ['Data Analyst', 'ML Engineer', 'AI Product Analyst', 'Research Engineer'],
    payINR: [14, 35], payUSD: [120, 185]
  },
  security: {
    blurb: 'Defending organisations against AI-era threats, deepfakes and automated attacks.',
    companies: ['Palo Alto Networks', 'CrowdStrike', 'Zscaler', 'Fortinet', 'Cisco', 'SentinelOne', 'Rapid7', 'Quick Heal'],
    adjacent: ['Security Engineer', 'SOC Analyst', 'Cloud Security Engineer', 'Penetration Tester'],
    payINR: [10, 26], payUSD: [100, 160]
  },
  healthcare: {
    blurb: 'AI-assisted diagnostics, clinical documentation and patient operations.',
    companies: ['Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'Cleveland Clinic', 'Mayo Clinic', 'Philips Healthcare', 'Siemens Healthineers', 'Practo', 'Narayana Health', 'UnitedHealth Group'],
    adjacent: ['Clinical Data Analyst', 'Health Informatics Specialist', 'Medical Coder (AI-assisted)', 'Care Coordinator'],
    payINR: [8, 24], payUSD: [95, 150]
  },
  pharma: {
    blurb: 'Accelerating discovery, trials and regulatory work with AI.',
    companies: ['Pfizer', 'Novartis', 'AstraZeneca', 'Roche', 'Sun Pharma', 'Dr. Reddy\u2019s', 'Biocon', 'Syngenta', 'Cipla', 'Zydus'],
    adjacent: ['Clinical Data Manager', 'Regulatory Affairs Associate', 'Pharmacovigilance Analyst', 'R&D Scientist'],
    payINR: [8, 22], payUSD: [90, 145]
  },
  finance: {
    blurb: 'Risk, markets, fraud and advisory work augmented by AI.',
    companies: ['J.P. Morgan', 'Morgan Stanley', 'Bank of America', 'HSBC', 'Citi', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Razorpay', 'Zerodha'],
    adjacent: ['Financial Analyst', 'Risk Analyst', 'Investment Associate', 'Fraud Analyst'],
    payINR: [10, 30], payUSD: [105, 170]
  },
  insurance: {
    blurb: 'Underwriting, claims and risk modelling rebuilt around AI.',
    companies: ['Allianz', 'AXA', 'MetLife', 'AIA', 'ICICI Lombard', 'HDFC Life', 'SBI Life', 'Lemonade', 'Policybazaar', 'Zurich'],
    adjacent: ['Actuarial Analyst', 'Underwriting Analyst', 'Claims Specialist', 'Risk Analyst'],
    payINR: [8, 22], payUSD: [85, 140]
  },
  legal: {
    blurb: 'Contract review, research and compliance at AI speed.',
    companies: ['Cyril Amarchand Mangaldas', 'Khaitan & Co', 'AZB & Partners', 'Latham & Watkins', 'Baker McKenzie', 'Clifford Chance', 'Dentons', 'Trilegal'],
    adjacent: ['Legal Associate', 'Compliance Officer', 'Contract Analyst', 'Paralegal'],
    payINR: [8, 28], payUSD: [90, 160]
  },
  government: {
    blurb: 'Public services, policy and citizen data made AI-ready.',
    companies: ['Government of India', 'NASSCOM', 'Digital India', 'United Nations', 'World Bank', 'Accenture Public Sector', 'Deloitte Gov', 'EY Public Sector'],
    adjacent: ['Policy Analyst', 'Program Officer', 'Data Officer', 'Public Administration Specialist'],
    payINR: [7, 20], payUSD: [70, 120]
  },
  defence: {
    blurb: 'Intelligence, logistics and autonomous systems for modern defence.',
    companies: ['Bharat Electronics', 'HAL', 'DRDO', 'L3Harris', 'Lockheed Martin', 'Airbus Defence', 'Rafael', 'Thales'],
    adjacent: ['Defence Analyst', 'Systems Engineer', 'Intelligence Analyst', 'Operations Planner'],
    payINR: [8, 22], payUSD: [85, 140]
  },
  education: {
    blurb: 'Teaching, assessment and learning design reimagined with AI.',
    companies: ['Pearson', 'Coursera', 'Byju\u2019s', 'Khan Academy', 'upGrad', 'Simplilearn', 'IIT Madras', 'edX', 'Chegg'],
    adjacent: ['Instructional Designer', 'EdTech Product Manager', 'Curriculum Specialist', 'Academic Researcher'],
    payINR: [6, 18], payUSD: [60, 110]
  },
  marketing: {
    blurb: 'Campaigns, content and growth engineered with AI.',
    companies: ['Google', 'Meta', 'HubSpot', 'WPP', 'Publicis', 'Dentsu', 'Ogilvy', 'Freshworks', 'Zoho'],
    adjacent: ['Performance Marketer', 'Content Strategist', 'SEO Specialist', 'Brand Analyst'],
    payINR: [7, 22], payUSD: [70, 130]
  },
  sales: {
    blurb: 'Pipeline, outreach and revenue operations powered by AI.',
    companies: ['Salesforce', 'HubSpot', 'Gong', 'Zoho', 'Freshworks', 'LinkedIn', 'Zoom', 'ServiceNow'],
    adjacent: ['Sales Development Rep', 'Account Executive', 'Customer Success Manager', 'Revenue Operations Analyst'],
    payINR: [6, 20], payUSD: [65, 140]
  },
  hr: {
    blurb: 'Hiring, people analytics and employee experience with AI.',
    companies: ['Workday', 'SAP SuccessFactors', 'LinkedIn', 'Naukri', 'Darwinbox', 'Rippling', 'Deel', 'Randstad'],
    adjacent: ['Talent Acquisition Specialist', 'HR Business Partner', 'People Analytics Analyst', 'L&D Manager'],
    payINR: [6, 18], payUSD: [60, 110]
  },
  design: {
    blurb: 'Product, brand and experience design accelerated by AI.',
    companies: ['Figma', 'Adobe', 'Canva', 'IDEO', 'Pentagram', 'Zomato', 'Swiggy', 'Zoho'],
    adjacent: ['UX Researcher', 'Product Designer', 'Visual Designer', 'Design Technologist'],
    payINR: [7, 22], payUSD: [75, 130]
  },
  media: {
    blurb: 'Reporting, production and distribution in an AI newsroom.',
    companies: ['BBC', 'Reuters', 'The New York Times', 'Cond\u00e9 Nast', 'Network18', 'Times Group', 'The Verge', 'Bloomberg'],
    adjacent: ['Multimedia Journalist', 'Content Producer', 'Video Editor', 'Audience Analyst'],
    payINR: [6, 18], payUSD: [60, 110]
  },
  gaming: {
    blurb: 'Game design, live-ops and player experience built with AI.',
    companies: ['Epic Games', 'Riot Games', 'Ubisoft', 'Electronic Arts', 'Rockstar Games', 'Krafton', 'Zynga', 'Activision Blizzard'],
    adjacent: ['Game Designer', 'Technical Artist', 'QA Tester', 'Live-Ops Analyst'],
    payINR: [7, 24], payUSD: [75, 140]
  },
  manufacturing: {
    blurb: 'Smart factories, predictive maintenance and quality with AI.',
    companies: ['Siemens', 'Bosch', 'GE', 'Tesla', 'Tata Motors', 'Mahindra', 'ABB', 'Schneider Electric'],
    adjacent: ['Production Engineer', 'Quality Engineer', 'Maintenance Engineer', 'Industrial IoT Analyst'],
    payINR: [6, 20], payUSD: [70, 120]
  },
  construction: {
    blurb: 'Design, build and operate with AI-driven planning and safety.',
    companies: ['Larsen & Toubro', 'Turner Construction', 'Jacobs', 'AECOM', 'Gensler', 'Godrej Properties', 'DLF', 'Prologis'],
    adjacent: ['Project Engineer', 'Site Manager', 'BIM Specialist', 'Quantity Surveyor'],
    payINR: [6, 18], payUSD: [70, 120]
  },
  retail: {
    blurb: 'Merchandising, pricing and customer experience with AI.',
    companies: ['Amazon', 'Walmart', 'Flipkart', 'Myntra', 'Shopify', 'Target', 'Reliance Retail', 'Nykaa'],
    adjacent: ['Category Manager', 'Merchandiser', 'Retail Analyst', 'Supply Planner'],
    payINR: [6, 18], payUSD: [60, 115]
  },
  supplychain: {
    blurb: 'Forecasting, routing and resilience powered by AI.',
    companies: ['Maersk', 'DHL', 'FedEx', 'Blue Yonder', 'Coupa', 'Delhivery', 'Flexport', 'Uber Freight'],
    adjacent: ['Supply Chain Analyst', 'Logistics Manager', 'Demand Planner', 'Procurement Specialist'],
    payINR: [7, 20], payUSD: [70, 125]
  },
  agriculture: {
    blurb: 'Precision farming, yield forecasting and agri-supply with AI.',
    companies: ['Corteva', 'Bayer', 'John Deere', 'Mahindra Agri', 'DeHaat', 'Ninjacart', 'Syngenta', 'AGCO'],
    adjacent: ['Agronomist', 'Precision Ag Specialist', 'Farm Data Analyst', 'Agri-Operations Manager'],
    payINR: [5, 15], payUSD: [60, 100]
  },
  energy: {
    blurb: 'Grids, renewables and sustainability optimised with AI.',
    companies: ['Shell', 'BP', 'NextEra Energy', 'Siemens Energy', 'Schneider Electric', 'ReNew Power', 'Tata Power', '\u00d8rsted'],
    adjacent: ['Energy Analyst', 'Grid Engineer', 'Sustainability Analyst', 'Asset Manager'],
    payINR: [7, 22], payUSD: [80, 140]
  },
  telecom: {
    blurb: 'Networks, 5G and customer operations run with AI.',
    companies: ['Reliance Jio', 'Airtel', 'Vodafone', 'Nokia', 'Ericsson', 'Qualcomm', 'Cisco', 'Huawei'],
    adjacent: ['Network Engineer', 'RF Engineer', 'Telecom Analyst', 'Solutions Architect'],
    payINR: [7, 22], payUSD: [75, 135]
  },
  transport: {
    blurb: 'Fleets, routes and mobility platforms optimised with AI.',
    companies: ['Uber', 'Lyft', 'Delta Air Lines', 'Emirates', 'Maersk', 'Ola', 'IndiGo', 'FedEx'],
    adjacent: ['Route Planner', 'Fleet Analyst', 'Operations Controller', 'Aviation Data Analyst'],
    payINR: [6, 18], payUSD: [65, 120]
  },
  hospitality: {
    blurb: 'Revenue, guest experience and operations in AI-era hospitality.',
    companies: ['Marriott', 'Hilton', 'Airbnb', 'Accor', 'Taj Hotels', 'Booking.com', 'OYO', 'IHG'],
    adjacent: ['Revenue Manager', 'Guest Experience Analyst', 'Operations Manager', 'Reservations Analyst'],
    payINR: [5, 16], payUSD: [55, 105]
  },
  mining: {
    blurb: 'Exploration, safety and extraction with AI.',
    companies: ['Rio Tinto', 'BHP', 'Vale', 'Anglo American', 'Caterpillar', 'Coal India', 'Vedanta', 'Freeport-McMoRan'],
    adjacent: ['Mine Engineer', 'Geologist', 'Operations Analyst', 'HSE Specialist'],
    payINR: [7, 22], payUSD: [85, 150]
  },
  consulting: {
    blurb: 'Strategy, operations and transformation delivered with AI.',
    companies: ['McKinsey & Company', 'BCG', 'Bain & Company', 'Deloitte', 'Accenture', 'PwC', 'EY', 'KPMG'],
    adjacent: ['Strategy Analyst', 'Management Consultant', 'Business Analyst', 'Transformation Lead'],
    payINR: [10, 30], payUSD: [100, 180]
  },
  blockchain: {
    blurb: 'Protocols, smart contracts and on-chain analytics with AI.',
    companies: ['Coinbase', 'Binance', 'ConsenSys', 'Polygon', 'Ripple', 'Chainalysis', 'Circle', 'Kraken'],
    adjacent: ['Blockchain Developer', 'Smart Contract Auditor', 'Protocol Analyst', 'Crypto Compliance Analyst'],
    payINR: [12, 35], payUSD: [110, 180]
  },
  nonprofit: {
    blurb: 'Programmes, fundraising and impact measured with AI.',
    companies: ['UNICEF', 'Red Cross', 'Gates Foundation', 'WWF', 'Save the Children', 'CRY', 'Akshaya Patra', 'Ashoka'],
    adjacent: ['Program Manager', 'Development Officer', 'Impact Analyst', 'Communications Lead'],
    payINR: [5, 15], payUSD: [55, 100]
  },
  executive: {
    blurb: 'Board-level AI strategy, investment and governance.',
    companies: ['Microsoft', 'Google', 'IBM', 'Salesforce', 'Accenture', 'SAP', 'Oracle', 'Infosys'],
    adjacent: ['VP Strategy', 'Chief of Staff', 'Head of Transformation', 'Board Advisor'],
    payINR: [25, 80], payUSD: [200, 450]
  }
};

const TIER_FACTOR = { Foundation: 0.65, Practitioner: 1, Strategist: 1.45, Executive: 2.1 };

const TIER = {
  Foundation: {
    label: 'AI Literacy',
    validates: 'fundamentals of AI, safe and ethical use, and confident everyday prompting',
    who: 'Anyone starting with AI — no technical background required.',
    outcomes: [
      'Explain what AI, LLMs and generative tools can and cannot do',
      'Write effective prompts for everyday professional tasks',
      'Use AI safely, ethically and without leaking sensitive data',
      'Spot AI hype versus genuine business value',
      'Build a personal AI toolkit for your daily role'
    ],
    modules: [
      'AI & Generative AI Foundations',
      'Prompting Fundamentals',
      'AI Safety, Privacy & Ethics',
      'Everyday AI Productivity',
      'Capstone: AI workflow for your role'
    ],
    hours: '12–16 hours',
    jobs: ['{role} (AI-fluent)', 'AI Operations Associate', 'Digital Transformation Associate']
  },
  Practitioner: {
    label: 'Applied AI',
    validates: 'applying AI to real workflows, building AI-assisted deliverables, and measuring impact',
    who: 'Working professionals who want to use AI to do their job faster and better.',
    outcomes: [
      'Redesign a core workflow around AI tools',
      'Produce higher-quality deliverables with AI assistance',
      'Evaluate and select the right AI tool for a task',
      'Quality-check and fact-check AI output reliably',
      'Measure the time and cost saved by AI adoption'
    ],
    modules: [
      'Applied Prompting & Context Engineering',
      'AI Workflow Design',
      'Tooling, Retrieval & Automation',
      'AI Quality, Accuracy & Risk Control',
      'Capstone: AI-powered project in your domain'
    ],
    hours: '30–40 hours',
    jobs: ['AI-enhanced {role}', 'AI Tooling Specialist', '{role} (Automation Lead)']
  },
  Strategist: {
    label: 'AI Strategy & Systems',
    validates: 'designing AI systems and strategy, governing risk, and leading adoption across teams',
    who: 'Senior practitioners, leads and architects who own AI outcomes for a team.',
    outcomes: [
      'Design AI solutions and agent workflows end to end',
      'Build a departmental AI adoption roadmap',
      'Set model evaluation, guardrails and governance standards',
      'Estimate cost, ROI and risk for AI initiatives',
      'Lead cross-functional AI delivery teams'
    ],
    modules: [
      'AI Systems & Solution Architecture',
      'Agents, RAG & Integration Patterns',
      'AI Governance, Compliance & Evaluation',
      'AI Economics: Cost, ROI & Build-vs-Buy',
      'Capstone: AI strategy for a real business unit'
    ],
    hours: '50–60 hours',
    jobs: ['AI {role} Lead', 'AI Solutions Consultant', 'AI Transformation Manager']
  },
  Executive: {
    label: 'AI Leadership',
    validates: 'leading organisation-wide AI transformation, investment decisions and board-level governance',
    who: 'Executives, founders and board members accountable for AI strategy.',
    outcomes: [
      'Set an organisation-wide AI vision and operating model',
      'Make confident investment, build-vs-buy and vendor calls',
      'Govern AI risk, regulation and responsible-use policy',
      'Redesign teams and roles around AI capability',
      'Report AI value and risk at board level'
    ],
    modules: [
      'The AI-Driven Organisation',
      'AI Investment & Portfolio Strategy',
      'Regulation, Risk & Responsible AI at Scale',
      'Workforce & Change Transformation',
      'Capstone: 12-month AI transformation plan'
    ],
    hours: '20–25 hours',
    jobs: ['Head of AI', 'Chief AI Officer (CAIO)', 'VP / Director of AI']
  }
};

/* ───────────────────────────── emit the file ───────────────────────────── */
const out = `/* ============================================================================
 * TCC CERT+ shared catalog — GENERATED by scripts/build-certs.js
 * Do not edit by hand: edit the role list in data/industries.js or the
 * industry meta in scripts/build-certs.js, then re-run the build.
 * ==========================================================================*/
${industriesBlock}

var CERT_TIERS = ['Foundation', 'Practitioner', 'Strategist', 'Executive'];

/* ── role aliases ─────────────────────────────────────────────────────────
   Maps 600+ real-world job titles onto the closest canonical role. The
   catalog search uses this so "farmer", "truck driver" or "plumber"
   resolve to a sensible certification instead of nothing (or nonsense).
   Source of truth: data/role-aliases.js — regenerate with build-certs.js. */
${aliasBlock}

/* Aliases normalised once for fast whole-word lookup. */
var CERT_ALIAS_INDEX = (function () {
  var byPhrase = {}, maxWords = 1;
  function norm(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\\s+/g, ' ').trim();
  }
  Object.keys(CERT_ROLE_ALIASES).forEach(function (k) {
    var key = norm(k);
    if (!key) return;
    byPhrase[key] = CERT_ROLE_ALIASES[k];
    var w = key.split(' ').length;
    if (w > maxWords) maxWords = w;
  });
  return { byPhrase: byPhrase, maxWords: maxWords, norm: norm };
})();

/* Longest whole-word alias found in a free-text query, e.g.
   "senior nurse practitioner" -> "Nurse". Returns the canonical role or null. */
function certAliasRole(query) {
  var s = ' ' + CERT_ALIAS_INDEX.norm(query) + ' ';
  if (s.trim().length < 2) return null;
  for (var n = CERT_ALIAS_INDEX.maxWords; n >= 1; n--) {
    var words = s.trim().split(' ');
    for (var i = 0; i + n <= words.length; i++) {
      var phrase = words.slice(i, i + n).join(' ');
      var hit = CERT_ALIAS_INDEX.byPhrase[phrase];
      if (hit) return hit;
    }
  }
  return null;
}

/* Extra keywords that should act as synonyms for a canonical role. */
function certRoleKeywords(role) {
  var extra = CERT_ROLE_ADDITIONS[role];
  return extra ? extra.slice() : [];
}

var INDUSTRY_META = ${JSON.stringify(META, null, 2)};

var TIER_FACTOR = ${JSON.stringify(TIER_FACTOR)};
var TIER = ${JSON.stringify(TIER, null, 2)};

function certSlugify(s) {
  return String(s).toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function certBaseName(cert) {
  return String(cert).replace(/\\s+[—-]\\s+(Foundation|Practitioner|Strategist|Executive)$/, '');
}

function certSlug(industryId, role, tier) {
  return certSlugify(role) + '-' + tier.toLowerCase();
}

/* 4 tiers per role => 262 x 4 = 1,048 certifications */
function certBuildRoster() {
  var roster = [];
  var used = {};
  INDUSTRIES.forEach(function (ind) {
    ind.roles.forEach(function (r) {
      var role = r[0], base = r[1];
      CERT_TIERS.forEach(function (tier) {
        var slug = certSlug(ind.id, role, tier);
        if (used[slug]) { slug = certSlugify(ind.id) + '-' + certSlugify(role) + '-' + tier.toLowerCase(); }
        used[slug] = true;
        roster.push({
          id: slug,
          slug: slug,
          role: role,
          tier: tier,
          level: tier,
          def: r[2],
          cert: base + ' \\u2014 ' + tier,
          base: base,
          industry: ind.name,
          industryId: ind.id,
          keywords: certRoleKeywords(role)
        });
      });
    });
  });
  return roster;
}

/* Everything a cert detail page needs, derived from one catalog entry. */
function certDetail(c) {
  var meta = INDUSTRY_META[c.industryId] || {};
  var f = TIER_FACTOR[c.level];

  function scale(range, round) {
    var a = Math.round(range[0] * TIER_FACTOR[c.level]);
    var b = Math.round(range[1] * TIER_FACTOR[c.level]);
    if (round) { a = Math.round(a / round) * round; b = Math.round(b / round) * round; }
    return [a, b];
  }
  var inr = scale(meta.payINR || [5, 15], 1);
  var usd = scale(meta.payUSD || [55, 100], 5);

  var jobs = (TIER[c.level].jobs || []).map(function (j) { return j.replace('{role}', c.role); })
    .concat(meta.adjacent || []);

  return {
    tier: c.level,
    tierLabel: TIER[c.level].label,
    validates: TIER[c.level].validates,
    who: TIER[c.level].who,
    outcomes: TIER[c.level].outcomes,
    modules: TIER[c.level].modules,
    hours: TIER[c.level].hours,
    blurb: meta.blurb || '',
    companies: (meta.companies || []).slice(0, 8),
    jobs: jobs,
    pay: { inr: inr, usd: usd }
  };
}

function certFindById(id) {
  var roster = certBuildRoster();
  for (var i = 0; i < roster.length; i++) { if (roster[i].id === id) return roster[i]; }
  return null;
}

function certSiblings(cert) {
  return certBuildRoster().filter(function (c) {
    return c.role === cert.role && c.industryId === cert.industryId;
  });
}

var CERT = {
  tiers: CERT_TIERS,
  industries: INDUSTRIES,
  meta: INDUSTRY_META,
  roster: certBuildRoster(),
  detail: certDetail,
  find: certFindById,
  siblings: certSiblings,
  slugify: certSlugify,
  baseName: certBaseName,
  aliases: CERT_ROLE_ALIASES,
  additions: CERT_ROLE_ADDITIONS,
  aliasRole: certAliasRole,
  roleKeywords: certRoleKeywords
};
`;

fs.writeFileSync(OUT, out, 'utf8');
const rosterCount = require('vm').runInNewContext(
  out + '\ncertBuildRoster().length',
  { console }
);
console.log('Wrote', path.relative(process.cwd(), OUT));
console.log('Industries:', Object.keys(META).length, '/ 32 covered');
console.log('Certifications generated:', rosterCount);
