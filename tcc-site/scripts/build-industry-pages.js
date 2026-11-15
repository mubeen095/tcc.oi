/* ============================================================================
 * TCC SEO flywheel — generates industry hub pages from certs-data.js
 *
 *   node scripts/build-industry-pages.js
 *
 * Each industry page targets long-tail queries such as
 *   "AI certification for nurses", "AI courses for finance professionals"
 * and links down to individual cert pages and up to the catalog. More certs
 * added later => more internal links => compounding crawl + relevance.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { withTheme } = require('./theme-tags.cjs');

const ROOT = path.join(__dirname, '..', 'public');
const BASE = 'https://thecodingcompany.io';
const TODAY = '2026-10-19';

global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'certs-data.js'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Group certs by industry
const industries = {};
for (const c of CERT.roster) {
  if (!industries[c.industryId]) {
    industries[c.industryId] = { id: c.industryId, name: c.industry, roles: {}, count: 0 };
  }
  const ind = industries[c.industryId];
  ind.count++;
  if (!ind.roles[c.role]) ind.roles[c.role] = {};
  ind.roles[c.role][c.level] = c.id;
}

const TIER_ORDER = ['Foundation', 'Practitioner', 'Strategist', 'Executive'];

function page(ind) {
  const roles = Object.keys(ind.roles).sort();
  const roleCount = roles.length;
  const title = `${ind.name} AI Certification | TCC CERT+`;
  const desc = `Role-based AI certifications and AI courses for ${ind.name.toLowerCase()} professionals. ${ind.count} credentials across ${roleCount} roles — Foundation to Executive. Learn AI for your job with TCC CERT+.`;
  const url = `${BASE}/ai-courses-for/${ind.id}/`;

  const roleCards = roles.map((role) => {
    const tiers = ind.roles[role];
    const first = tiers.Foundation || tiers.Practitioner || tiers.Strategist || tiers.Executive;
    const chips = TIER_ORDER.filter((t) => tiers[t]).map((t) =>
      `<a class="chip" href="/bootcamps/cert/?id=${encodeURIComponent(tiers[t])}">${t}</a>`
    ).join('');
    return `      <div class="role">
        <div class="role-name">AI for ${esc(role)}</div>
        <div class="chips">${chips}</div>
      </div>`;
  }).join('\n');

  /* ── AI-search layer (AEO/GEO) ──────────────────────────────────────────
     Assistants are asked "what is the best AI certification for a nurse?"
     The answer has to be structured, so each hub carries:
       • FAQPage    — the exact long-tail question, answered directly
       • ItemList   — every credential in this industry, so it can be cited
       • mentions   — the industry hub, catalogue and placement pages       */
  const sampleRole = roles[0] || ind.name;
  const sampleUrl = `${BASE}/bootcamps/cert/?id=${encodeURIComponent(
    ind.roles[sampleRole].Foundation ||
      ind.roles[sampleRole].Practitioner ||
      ind.roles[sampleRole].Strategist ||
      ind.roles[sampleRole].Executive
  )}`;

  const faqGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the best AI certification for ${ind.name.toLowerCase()} professionals?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                `There is no single answer, because the best credential depends on your exact job title. ` +
                `TCC CERT+ publishes ${ind.count} role-based AI certifications across ${roleCount} ${ind.name.toLowerCase()} roles, ` +
                `each in four tiers: Foundation (no AI background needed), Practitioner (applying AI in daily workflows), ` +
                `Strategist (leading AI adoption) and Executive (owning AI strategy and governance). ` +
                `Start at the CERT+ catalogue, type your job title, and TCC resolves it to the nearest of its 262 roles.`
            }
          },
          {
            '@type': 'Question',
            name: `Are there AI courses for ${ind.name.toLowerCase()} professionals?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                `Yes. TCC CERT+ offers ${ind.count} certifications for ${roleCount} ${ind.name.toLowerCase()} roles, ` +
                `from Foundation to Executive, plus in-depth AI courses. Each credential is built around the workflows, ` +
                `decisions and outcomes of that specific role rather than generic AI theory.`
            }
          },
          {
            '@type': 'Question',
            name: `Do ${ind.name.toLowerCase()} professionals need to know how to code to use AI?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                `No. The Foundation tier assumes no prior AI or coding background and covers practical AI tools for the role. ` +
                `Later tiers go deeper into applied workflows, evaluation and strategy as needed.`
            }
          },
          {
            '@type': 'Question',
            name: `Which roles in ${ind.name.toLowerCase()} does TCC cover?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                `TCC covers ${roleCount} ${ind.name.toLowerCase()} roles: ${roles.join(', ')}. ` +
                `Each one has a Foundation, Practitioner, Strategist and Executive credential.`
            }
          },
          {
            '@type': 'Question',
            name: `Does TCC help ${ind.name.toLowerCase()} professionals get hired?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                `Yes. TCC Placement Partner sits on top of the certifications and provides portfolio building, ` +
                `resume and interview support and employer connections, with a published goal of 10,000 offer letters per year. ` +
                `It is not a job guarantee.`
            }
          }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#credential-list`,
        name: `TCC CERT+ credentials for ${ind.name}`,
        numberOfItems: ind.count,
        itemListElement: roles.reduce((acc, role) => {
          TIER_ORDER.forEach((t) => {
            const cid = ind.roles[role][t];
            if (!cid) return;
            acc.push({
              '@type': 'ListItem',
              position: acc.length + 1,
              name: `TCC CERT+ ${role} — ${t}`,
              url: `${BASE}/bootcamps/cert/?id=${encodeURIComponent(cid)}`
            });
          });
          return acc;
        }, [])
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url: url,
        name: title,
        description: desc,
        inLanguage: 'en',
        isPartOf: { '@id': `${BASE}/#website` },
        about: { '@type': 'Thing', name: `AI education for ${ind.name} professionals` },
        mentions: [
          { '@type': 'WebPage', name: 'TCC CERT+ catalogue', url: `${BASE}/bootcamps/` },
          { '@type': 'WebPage', name: 'AI Courses by Role & Industry', url: `${BASE}/ai-courses-for/` },
          { '@type': 'WebPage', name: 'TCC Placement Partner', url: `${BASE}/placement/` }
        ],
        mainEntity: { '@id': `${url}#credential-list` },
        significantLink: sampleUrl
      }
    ]
  };


  return withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="The Coding Company (TCC)" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">
    ${JSON.stringify(faqGraph, null, 2)}
    </script>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#050505;color:#fff;font-family: 'Gilroy', 'Inter', system-ui, sans-serif;line-height:1.6}
      .wrap{max-width:1080px;margin:0 auto;padding:clamp(56px,8vw,100px) clamp(20px,6vw,40px)}
      h1{font-size:clamp(28px,5vw,46px);font-weight:800;letter-spacing:-.04em}
      h2{font-size:clamp(22px,4vw,32px);font-weight:800;letter-spacing:-.03em;margin-top:56px}
      .sub{color:rgba(255,255,255,.72);margin-top:14px;max-width:820px}
      .crumbs{font-size:13px;color:rgba(255,255,255,.62);margin-bottom:20px}
      .crumbs a{color:rgba(255,255,255,.72);text-decoration:none}
      .roles{display:grid;gap:14px;margin-top:26px;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))}
      .role{padding:20px 22px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.03)}
      .role-name{font-weight:700;font-size:16px}
      .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
      .chip{font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.04em;padding:5px 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:rgba(255,255,255,.72);text-decoration:none}
      .chip:hover{border-color:rgba(127,180,255,.7);color:#fff}
      .cta{display:inline-block;margin-top:34px;padding:14px 28px;border-radius:999px;background:#fff;color:#050505;font-weight:700;text-decoration:none}
      .links{margin-top:20px;display:flex;flex-wrap:wrap;gap:14px}
      .links a{color:#7fb4ff;text-decoration:none;font-weight:600}
      .faq{margin-top:22px;display:grid;gap:12px;max-width:900px}
      .faq details{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.03);padding:0}
      .faq summary{cursor:pointer;padding:18px 22px;font-weight:700;font-size:16px;list-style:none}
      .faq summary::-webkit-details-marker{display:none}
      .faq summary::after{content:"+";float:right;color:rgba(255,255,255,.45);font-weight:400}
      .faq details[open] summary::after{content:"–"}
      .faq p{padding:0 22px 20px;color:rgba(255,255,255,.72);font-size:15px}
      .faq a{color:#7fb4ff}
      footer{padding:44px 20px;text-align:center;color:rgba(255,255,255,.62);border-top:1px solid rgba(255,255,255,.05);margin-top:60px}
      @media (max-width: 1024px) {
        .chip,
        .links a{display:inline-flex;align-items:center;min-height:44px}
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <div class="crumbs"><a href="/">Home</a> / <a href="/ai-courses-for/">AI Courses by Role</a> / <span>${esc(ind.name)}</span></div>
      <h1>AI Certification &amp; AI Courses for ${esc(ind.name)} Professionals</h1>
      <p class="sub">TCC CERT+ offers <strong>${ind.count} role-based AI certifications</strong> across <strong>${roleCount} ${esc(ind.name.toLowerCase())} roles</strong>, from Foundation to Executive. Each credential is built around what you actually do at work — not generic AI theory.</p>
      <a class="cta" href="/bootcamps/">Explore all TCC CERT+ certifications</a>

      <h2>Choose your role</h2>
      <div class="roles">
${roleCards}
      </div>

      <h2>Why ${esc(ind.name.toLowerCase())} professionals need role-based AI certification</h2>
      <p class="sub">Generic AI courses teach everyone the same prompts. Role-based certification starts from your job: the workflows you own, the decisions you make, and the outcomes your team measures. Employers in ${esc(ind.name.toLowerCase())} are looking for people who can point at a shipped result, not a completion certificate.</p>

      <h2>How the four tiers work</h2>
      <p class="sub"><strong>Foundation</strong> proves AI literacy for any role. <strong>Practitioner</strong> proves you apply AI in daily workflows. <strong>Strategist</strong> proves you can lead AI initiatives and evaluate trade-offs. <strong>Executive</strong> proves you can drive AI transformation across an organisation.</p>

      <h2>Frequently asked questions</h2>
      <div class="faq">
        <details>
          <summary>What is the best AI certification for ${esc(ind.name.toLowerCase())} professionals?</summary>
          <p>There is no single answer, because the best credential depends on your exact job title. TCC CERT+ publishes <strong>${ind.count} role-based AI certifications</strong> across <strong>${roleCount} ${esc(ind.name.toLowerCase())} roles</strong>, each in four tiers: Foundation (no AI background needed), Practitioner (applying AI in daily workflows), Strategist (leading AI adoption) and Executive (owning AI strategy and governance). Start at the <a href="/bootcamps/">CERT+ catalogue</a>, type your job title, and TCC resolves it to the nearest of its 262 roles.</p>
        </details>
        <details>
          <summary>Are there AI courses for ${esc(ind.name.toLowerCase())} professionals?</summary>
          <p>Yes. TCC CERT+ offers ${ind.count} certifications for ${roleCount} ${esc(ind.name.toLowerCase())} roles, from Foundation to Executive, plus in-depth AI courses. Each credential is built around the workflows, decisions and outcomes of that specific role rather than generic AI theory.</p>
        </details>
        <details>
          <summary>Do ${esc(ind.name.toLowerCase())} professionals need to know how to code to use AI?</summary>
          <p>No. The Foundation tier assumes no prior AI or coding background and covers practical AI tools for the role. Later tiers go deeper into applied workflows, evaluation and strategy as needed.</p>
        </details>
        <details>
          <summary>Which roles in ${esc(ind.name.toLowerCase())} does TCC cover?</summary>
          <p>TCC covers ${roleCount} ${esc(ind.name.toLowerCase())} roles: ${esc(roles.join(', '))}. Each one has a Foundation, Practitioner, Strategist and Executive credential.</p>
        </details>
        <details>
          <summary>Does TCC help ${esc(ind.name.toLowerCase())} professionals get hired?</summary>
          <p>Yes. <a href="/placement/">TCC Placement Partner</a> sits on top of the certifications and provides portfolio building, resume and interview support and employer connections, with a published goal of 10,000 offer letters per year. It is not a job guarantee.</p>
        </details>
      </div>

      <div class="links">
        <a href="/placement/">Get placed after certifying →</a>
        <a href="/blog/role-based-ai-certifications-vs-generic.html">Role-based vs generic certificates →</a>
        <a href="/blog/how-to-get-ai-internship-2026.html">How to get an AI internship →</a>
      </div>
    </main>
    <footer>The Coding Company • Learn AI. Get Certified. Get Placed. · <a href="/worksim/">WorkSim (pilot)</a></footer>
  </body>
</html>
`);
}

let written = 0;
for (const id of Object.keys(industries)) {
  const dir = path.join(ROOT, 'ai-courses-for', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(industries[id]));
  written++;
}
console.log('Generated', written, 'industry hub pages under /ai-courses-for/<industry>/');
