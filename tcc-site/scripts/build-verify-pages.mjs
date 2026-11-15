/* ─────────────────────────────────────────────────────────────────────────
   scripts/build-verify-pages.mjs

   Generates the /verify/ evidence cluster, /partners/ and /enrol/.

   These pages exist to make every claim on the site checkable. They are
   generated rather than hand-written so the shell, the breadcrumb, the
   "last reviewed" date and the cross-links can never drift apart.

     node scripts/build-verify-pages.mjs
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveEnrolment, renderCohort } from './cohorts.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const BASE = 'https://thecodingcompany.com';
const REVIEWED = new Date().toISOString().slice(0, 10);
const PAY_URL = 'https://payments.cashfree.com/forms/pr-rb';
const COHORT = resolveEnrolment();

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  ['/bootcamps/', 'CERT+'],
  ['/prep+/companies/', 'Prep+'],
  ['/placement/', 'Placements'],
  ['/verify/', 'Verify'],
  ['/contact/', 'Contact'],
];

function breadcrumb(route) {
  const parts = route.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` }];
  let acc = '';
  parts.forEach((p, i) => {
    acc += `/${p}`;
    const name = p === 'verify' ? 'Verify' : p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: `${BASE}${acc}/`,
    });
  });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function shell({ route, title, desc, eyebrow, h1, lede, body, pager, extraLd = '', robots = 'index, follow' }) {
  const canonical = `${BASE}${route}`;
  const nav = NAV.map(([href, label]) => {
    const active = route.startsWith(href) && href !== '/contact/' ? ' aria-current="page"' : '';
    return `      <a href="${href}"${active}>${label}</a>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_IN">
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
<link rel="stylesheet" href="/assets/css/tcc-verify.css">
<script type="application/ld+json">${JSON.stringify(breadcrumb(route))}</script>
${extraLd}
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
    <div class="eyebrow">${eyebrow}</div>
    <h1 class="display">${h1}</h1>
    <p class="lede">${lede}</p>
${body}
${pager || ''}
    <p class="meta">Page last reviewed ${REVIEWED}. If anything here is wrong, write to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a> and we will correct it publicly.</p>
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

function pager(prev, next) {
  const cell = (item, dir) => {
    if (!item) return '<span></span>';
    return `<a href="${item[1]}"><span class="dir">${dir}</span>${item[0]}</a>`;
  };
  return `    <div class="pager">
      ${cell(prev, 'Previous')}
      ${cell(next, 'Next')}
    </div>`;
}

function write(route, html) {
  const dir = path.join(PUBLIC, route.replace(/^\//, '').replace(/\/$/, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`  · ${route}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   /verify/ — the hub
   ═════════════════════════════════════════════════════════════════════════ */

const claims = [
  ['Our assessments are scored against a published rubric, not marked on impression.', 'Rubric, weights and pass rule', '/verify/rubric/', 'Open'],
  ['You can sit a real paper before you pay us anything.', '15-question diagnostic, scored on submit', '/diagnostic/', 'Open'],
  ['We show answers at full marks, partial marks and fail.', 'Three worked exemplars with reviewer notes', '/verify/samples/', 'Open'],
  ['We publish pass rates and score spread.', 'Publication rule and definitions', '/verify/stats/', 'Method'],
  ['The assessment format is fixed, disclosed and not changed mid-cohort.', 'Format, timing and integrity rules', '/verify/exam/', 'Open'],
  ['Our papers are written and reviewed by named people.', 'Who writes, who reviews, when names publish', '/verify/team/', 'Policy'],
  ['Partner marks mean one specific thing each, and no more.', 'Scope per partner', '/partners/', 'Open'],
  ['We publish a list of claims we are not making.', 'Explicit non-claims', '/verify/what-we-dont-claim/', 'Open'],
];

write(
  '/verify/',
  shell({
    route: '/verify/',
    title: 'Verify every claim we make | The Coding Company',
    desc: 'Every claim The Coding Company makes, listed with the evidence behind it. If a claim is not on this page, treat it as marketing rather than fact.',
    eyebrow: 'Verification',
    h1: 'Everything we claim, and how to check it.',
    lede: 'Most course websites are built so that nothing can be checked. This page is the opposite. Every claim we make is listed here next to the evidence for it — and if a claim is not on this page, treat it as marketing rather than fact.',
    body: `
    <div class="callout">
      <p><strong>The rule:</strong> no claim without a click. If a statement cannot be linked to something you can read or test, we do not put it on the site.</p>
    </div>

    <h2>Claims and their evidence</h2>
    <div class="claims">
${claims
  .map(
    ([claim, ev, href, tag], i) => `      <a class="claim" href="${href}">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="txt"><b>${claim}</b><span>${ev}</span></span>
        <span class="ev">${tag} →</span>
      </a>`
  )
  .join('\n')}
    </div>

    <h2>What this page can and cannot do</h2>
    <p>It cannot prove that we are good at teaching. No website can, and any site claiming otherwise is selling certainty it does not have.</p>
    <p>It can prove that we are <strong>checkable</strong>: that our scoring is defined before you sit it, that our format is disclosed, that our numbers have a stated method, and that the things we do not do are written down rather than left to implication.</p>
    <p>For most people deciding where to spend a year, checkability is worth more than confidence. Confidence is cheap to fake. Checkability is not.</p>

    <h2>Start with the paper</h2>
    <p>The fastest way to audit us is to sit the diagnostic. Fifteen questions, fifteen minutes, scored the moment you submit, with the reasoning shown for everything you get wrong. You will know more about how we think in fifteen minutes than in an hour of reading.</p>

    <div class="actions">
      <a class="btn" href="/diagnostic/">Sit the diagnostic</a>
      <a class="btn ghost" href="/verify/what-we-dont-claim/">Read what we don't claim</a>
    </div>`,
    pager: pager(null, ['The assessment format', '/verify/exam/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/exam/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/verify/exam/',
  shell({
    route: '/verify/exam/',
    title: 'The assessment, exactly as it runs | TCC CERT+',
    desc: 'Format, timing, marking and integrity rules for every TCC CERT+ assessment level, published before you enrol rather than after.',
    eyebrow: 'Verification · Assessment',
    h1: 'The assessment, exactly as it runs.',
    lede: 'Format, timings and marking are fixed before a cohort opens and are not changed mid-cohort. This is the whole specification — there is no second document that says something different.',
    body: `
    <h2>Format by level</h2>
    <p>Each CERT+ credential ends in one assessment. The level determines how much of it is machine-scored and how much is read by a person.</p>
    <div class="tablewrap">
      <table>
        <thead>
          <tr><th>Level</th><th>Duration</th><th>What you submit</th><th>Marked by</th></tr>
        </thead>
        <tbody>
          <tr><td><b>Foundation</b></td><td class="num">40 min</td><td>25 objective items plus one short written explanation</td><td>Auto, then a reviewer reads the written part</td></tr>
          <tr><td><b>Practitioner</b></td><td class="num">60 min</td><td>20 objective items plus one role artifact built in the exam window</td><td>Auto plus one reviewer</td></tr>
          <tr><td><b>Strategist</b></td><td class="num">75 min</td><td>A written case response plus a recorded defence of your trade-offs</td><td>Two reviewers, independently</td></tr>
          <tr><td><b>Executive</b></td><td class="num">45 min</td><td>A decision memo addressed to a named stakeholder</td><td>Reviewer panel</td></tr>
        </tbody>
      </table>
    </div>

    <h2>Marking rules</h2>
    <ul>
      <li><strong>No negative marking.</strong> An unanswered question scores zero, never less. Guessing is rational and we do not punish it.</li>
      <li><strong>Objective items are machine-scored.</strong> One correct option, no partial credit, no manual override.</li>
      <li><strong>Artifacts are scored against the published rubric</strong> on <a class="inline" href="/verify/rubric/">the marking page</a>, by a reviewer who never sees your name.</li>
      <li><strong>Pass is 60 of 100 overall, with no criterion below 40.</strong> A strong artifact cannot carry a collapse in judgement.</li>
      <li><strong>Results within five working days</strong> where a person marks your work; immediately where the assessment is entirely objective.</li>
      <li><strong>One retake within 30 days, included.</strong> The higher score stands. We publish both attempts to you, not just the better one.</li>
    </ul>

    <h2>AI tools during the assessment</h2>
    <p>We teach people to work with AI, so banning it in the exam would test the wrong skill. Instead:</p>
    <ul>
      <li>You may use AI tools on Practitioner, Strategist and Executive assessments.</li>
      <li>You must disclose which tools you used and for what, in a required field.</li>
      <li>You are marked on the quality of your verification, not the speed of your generation. An unverified model output that looks confident scores badly, and the rubric says so explicitly.</li>
      <li>Foundation assessments are closed-book, because the point of that level is knowing what the tool is doing.</li>
    </ul>

    <h2>What invalidates a result</h2>
    <ul>
      <li>An artifact you cannot explain when asked about it, in a short follow-up call.</li>
      <li>Undisclosed AI use where the rubric requires disclosure.</li>
      <li>More than one person on the same submission.</li>
    </ul>
    <p>Invalidation is not an accusation of cheating. It means the result cannot be defended to an employer, and a credential that cannot be defended is worth nothing to you.</p>

    <h2>What we change, and what we never change</h2>
    <p>Question content is refreshed between cohorts. That is normal and healthy — questions leak, and a leaked paper measures memory instead of ability.</p>
    <p>What does not change mid-cohort: the number of questions, the time limit, the rubric, the pass mark, or the marking criteria. If any of those must change, it applies to the next cohort and it is announced here with a date.</p>`,
    pager: pager(['Verification hub', '/verify/'], ['How we mark things', '/verify/rubric/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/rubric/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/verify/rubric/',
  shell({
    route: '/verify/rubric/',
    title: 'How we mark things — rubric and pass rules | TCC',
    desc: 'The complete marking scheme for the TCC diagnostic and every CERT+ assessment: criteria, weights, performance bands and the pass rule.',
    eyebrow: 'Verification · Marking',
    h1: 'How we mark things.',
    lede: 'Two things get a mark at TCC: the diagnostic you can sit right now, and the CERT+ assessments. Both are defined here in full. Nothing is marked on impression.',
    body: `
    <div class="toc">
      <p>On this page</p>
      <ul>
        <li><a href="#diagnostic">1 · The diagnostic</a></li>
        <li><a href="#cert">2 · CERT+ assessments</a></li>
        <li><a href="#bands">3 · Performance bands</a></li>
        <li><a href="#calibration">4 · How we stop reviewers drifting</a></li>
      </ul>
    </div>

    <h2 id="diagnostic">1 · The diagnostic</h2>
    <p>Fifteen questions across four sections, one mark each, no negative marking, fifteen-minute limit. The split is fixed:</p>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Section</th><th class="num">Questions</th><th class="num">Marks</th><th>What it measures</th></tr></thead>
        <tbody>
          <tr><td><b>Quantitative</b></td><td class="num">4</td><td class="num">4</td><td>Percentage change, rates, averages, sequential probability — the arithmetic that actually appears in placement papers</td></tr>
          <tr><td><b>Reasoning</b></td><td class="num">5</td><td class="num">5</td><td>Sequences, set overlap, syllogism, inference from a passage, analogies</td></tr>
          <tr><td><b>Technical</b></td><td class="num">4</td><td class="num">4</td><td>Complexity, language semantics, SQL null behaviour, HTTP status codes</td></tr>
          <tr><td><b>Data interpretation</b></td><td class="num">2</td><td class="num">2</td><td>Reading a rate correctly, locating the real drop-off in a funnel</td></tr>
        </tbody>
      </table>
    </div>
    <p>The bands are set by what the score means for the next eight weeks of work, not by a curve. We do not rescale results to make them look better.</p>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Score</th><th>Band</th><th>What it means</th></tr></thead>
        <tbody>
          <tr><td class="num">13–15</td><td><b>Tier-1 ready</b></td><td>You would clear most aptitude rounds today. Remaining work is speed and interview delivery.</td></tr>
          <tr><td class="num">10–12</td><td><b>Close, with named gaps</b></td><td>Two or three specific topics are costing you marks. Closeable in weeks.</td></tr>
          <tr><td class="num">6–9</td><td><b>Foundation needs structured work</b></td><td>You know more than you can execute under time pressure. The most common and most improvable profile.</td></tr>
          <tr><td class="num">0–5</td><td><b>Start from the mechanics</b></td><td>Learn the underlying rules before practising papers, or you lock the errors in.</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="cert">2 · CERT+ assessments</h2>
    <p>Practitioner and above are marked out of 100 across four criteria. The weights are fixed and published before the cohort starts.</p>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Criterion</th><th class="num">Weight</th><th>What earns marks</th></tr></thead>
        <tbody>
          <tr><td><b>Applied knowledge</b></td><td class="num">30</td><td>Correct, specific use of the concepts the role actually requires. Not definitions — decisions.</td></tr>
          <tr><td><b>Role artifact</b></td><td class="num">45</td><td>A working output a colleague could use on Monday. Correct, complete, and honest about its limits.</td></tr>
          <tr><td><b>Judgement and trade-offs</b></td><td class="num">25</td><td>Why this approach over the alternative, what you gave up, and what would change your mind.</td></tr>
        </tbody>
      </table>
    </div>
    <div class="callout">
      <p><strong>Pass rule:</strong> 60 of 100 overall, and no criterion below 40% of its weight. A brilliant artifact attached to thoughtless judgement fails, because that is the profile that damages teams in production.</p>
    </div>

    <h2 id="bands">3 · Performance bands</h2>
    <p>The same four descriptors are used on every criterion. Reviewers pick the band first, then place the score inside it.</p>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Band</th><th class="num">Range</th><th>Descriptor</th></tr></thead>
        <tbody>
          <tr><td><b>Distinction</b></td><td class="num">85–100</td><td>Would pass review at a good company without supervision. Explains its own limitations and the conditions under which it fails.</td></tr>
          <tr><td><b>Competent</b></td><td class="num">70–84</td><td>Works, is defensible, and has one clear gap the candidate can name.</td></tr>
          <tr><td><b>Developing</b></td><td class="num">55–69</td><td>Right direction, incomplete execution, or correct output with weak reasoning.</td></tr>
          <tr><td><b>Not yet</b></td><td class="num">0–54</td><td>Misunderstands the problem, or produces output that would need to be redone.</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="calibration">4 · How we stop reviewers drifting</h2>
    <ul>
      <li>Every artifact is scored blind. The reviewer sees a candidate ID, never a name.</li>
      <li>Ten percent of artifacts are double-marked by a second reviewer.</li>
      <li>If the two marks differ by more than ten points, a third reviewer resolves it and the rubric wording is reviewed.</li>
      <li>Whenever a rubric line is rewritten, previously marked samples are re-marked against the new wording so the standard does not quietly move.</li>
    </ul>
    <p>This is ordinary assessment hygiene. It is published because most providers do not publish it, and the absence of a method is usually the point.</p>

    <div class="actions">
      <a class="btn" href="/diagnostic/">Sit the diagnostic</a>
      <a class="btn ghost" href="/verify/samples/">See the rubric applied</a>
    </div>`,
    pager: pager(['The assessment format', '/verify/exam/'], ['Graded examples', '/verify/samples/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/samples/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/verify/samples/',
  shell({
    route: '/verify/samples/',
    title: 'Graded examples: full marks, partial marks, fail | TCC',
    desc: 'The same CERT+ task answered three ways, each marked against the published rubric with reviewer notes explaining every point awarded and lost.',
    eyebrow: 'Verification · Samples',
    h1: 'The same task, marked three ways.',
    lede: 'A rubric proves nothing until you see it applied. Below is one Practitioner-level task answered at distinction, developing and not-yet level, with the reviewer notes that produced each mark.',
    body: `
    <div class="callout">
      <p><strong>What these are.</strong> Worked exemplars written by our assessment team to calibrate reviewers — not real candidate submissions. We label them this way because presenting invented candidates as real graduates is the exact behaviour this site exists to argue against.</p>
    </div>

    <h2>The task</h2>
    <div class="card">
      <p style="margin:0"><strong>Support triage.</strong> A SaaS company receives 500 support tickets a week. Design an AI-assisted triage workflow. State where the model acts alone, where a human must confirm, how you would measure whether it is working, and what you would do when it fails.</p>
      <p class="meta" style="margin:10px 0 0">Practitioner level · 60 minutes · role artifact 45 marks, judgement 25, applied knowledge 30</p>
    </div>

    <div class="sample">
      <div class="sample-head">
        <b>Exemplar A — distinction</b>
        <span class="tag good">91 / 100</span>
      </div>
      <div class="sample-body">
        <p><strong>Approach.</strong> Classify on arrival into four routing buckets, draft a first response for three of them, and escalate anything touching billing disputes or security to a human queue before a draft is generated at all.</p>
        <p><strong>Where the model acts alone:</strong> tagging, routing and internal summarisation. No customer-visible text is sent without a human pressing send, because the cost of one wrong refund promise exceeds the saving on a thousand correct drafts.</p>
        <p><strong>Measurement:</strong> first-response time, percentage of drafts sent without edit, re-open rate within seven days, and a weekly sample of 50 closed tickets read by a human. Re-open rate is the guardrail — speed without it just moves work downstream.</p>
        <p><strong>When it fails:</strong> if re-open rate rises above baseline for two consecutive weeks, the auto-draft is switched off for that bucket and the failures are read before the prompt is touched. Models fail in clusters, and clusters are diagnostic.</p>
        <div class="marks">Artifact <b>43/45</b> · Judgement <b>24/25</b> · Applied knowledge <b>24/30</b></div>
        <p><strong>Reviewer note.</strong> Names the failure mode it is optimising against, and picks a guardrail that would actually catch it. Loses points only on model selection: it never says which class of model suits classification versus generation, or why.</p>
      </div>
    </div>

    <div class="sample">
      <div class="sample-head">
        <b>Exemplar B — developing</b>
        <span class="tag warn">62 / 100</span>
      </div>
      <div class="sample-body">
        <p><strong>Approach.</strong> Use an LLM to read each ticket, assign a category and priority, and draft a reply. Route low-priority tickets straight to the draft. Send high-priority tickets to a human.</p>
        <p><strong>Measurement:</strong> track accuracy of categorisation and customer satisfaction.</p>
        <p><strong>When it fails:</strong> retrain the model on the misclassified tickets.</p>
        <div class="marks">Artifact <b>29/45</b> · Judgement <b>13/25</b> · Applied knowledge <b>20/30</b></div>
        <p><strong>Reviewer note.</strong> The shape is right and the writing is clear, which is why this passes. Three things cost it 29 marks. "Low priority" and "safe to answer automatically" are treated as the same thing, and they are not — a low-priority billing question is still a billing question. Accuracy is stated as a goal with no threshold, so the workflow has no switch. And "retrain the model" is not available to a support team, which means the failure plan is theoretical.</p>
      </div>
    </div>

    <div class="sample">
      <div class="sample-head">
        <b>Exemplar C — not yet</b>
        <span class="tag">38 / 100</span>
      </div>
      <div class="sample-body">
        <p><strong>Approach.</strong> Connect the ticketing system to ChatGPT with an API key. Let it answer all tickets automatically. This reduces workload by 80 percent and improves customer experience.</p>
        <p><strong>Measurement:</strong> number of tickets handled.</p>
        <div class="marks">Artifact <b>14/45</b> · Judgement <b>6/25</b> · Applied knowledge <b>18/30</b></div>
        <p><strong>Reviewer note.</strong> Fails on the criterion that matters most, which is judgement. There is no human boundary on an irreversible action, no measurement that could detect harm, and a specific performance number with nothing behind it. Note that the applied-knowledge mark is not zero — the candidate knows what an API is. Knowing a tool and being trusted with it are different marks, and only the second one gets you hired.</p>
      </div>
    </div>

    <h2>What this is meant to show</h2>
    <p>Exemplar B is the one to read twice. It is fluent, plausible and wrong in three specific ways, and it still passes — because a pass means "employable with support", not "finished". A provider that only shows you distinction-level work is showing you its best day, not its standard.</p>`,
    pager: pager(['How we mark things', '/verify/rubric/'], ['Published stats', '/verify/stats/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/stats/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/verify/stats/',
  shell({
    route: '/verify/stats/',
    title: 'The numbers we publish, and the ones we refuse to | TCC',
    desc: 'Our publication rule for pass rates, score spread and placement outcomes — including the metrics we will not report and why.',
    eyebrow: 'Verification · Numbers',
    h1: 'The numbers we publish, and the ones we refuse to.',
    lede: 'Every education company eventually publishes a percentage. Most of them are true and useless — a numerator without a denominator, a window chosen after the fact. Here is our publication rule, fixed in advance.',
    body: `
    <h2>Where we stand today</h2>
    <div class="card">
      <p style="margin:0 0 8px"><span class="tag warn">No cohort has completed a full cycle</span></p>
      <p style="margin:0">The first CERT+ cohort has not yet finished assessment, so there is no pass rate to report and no placement data to aggregate. This page will stay in this state until there is. We would rather show you an empty table with a rule attached than a number with no denominator.</p>
    </div>

    <h2>The publication rule</h2>
    <p>Each metric below has a fixed definition and a fixed publication trigger. The definition is written before the data exists, which is the only way to stop a definition quietly changing to suit a result.</p>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Metric</th><th>Published when</th><th>Definition</th></tr></thead>
        <tbody>
          <tr><td><b>Assessment pass rate</b></td><td>First cohort completes</td><td>Passes ÷ candidates who sat the final assessment. Withdrawals before the assessment are reported separately, never folded in or out.</td></tr>
          <tr><td><b>Score distribution</b></td><td>First cohort completes</td><td>Every score, in bands of ten, including the failures. No curve, no rescaling.</td></tr>
          <tr><td><b>Completion rate</b></td><td>First cohort completes</td><td>Enrolled who finished ÷ enrolled who started, with the start date defined as the first live session attended.</td></tr>
          <tr><td><b>Placement rate</b></td><td>Minimum 30 people through the placement track</td><td>Verified offer letters ÷ people who completed the placement track and actively searched. Window: 180 days from track completion.</td></tr>
          <tr><td><b>Median package</b></td><td>Same threshold</td><td>Median of verified accepted offers, in INR LPA, fixed component. Not the mean, and never the maximum as a headline.</td></tr>
          <tr><td><b>Time to offer</b></td><td>Same threshold</td><td>Median days from track completion to written offer.</td></tr>
        </tbody>
      </table>
    </div>

    <h2>Why 30</h2>
    <p>Below thirty people, a median is a rumour. One outlier moves it by several lakh, and the person reading it cannot tell whether they are looking at a programme or at one unusually good month. Thirty is not a statistical guarantee; it is the point at which a number stops being anecdote.</p>

    <h2>What we will never publish</h2>
    <ul>
      <li><strong>Highest package as a headline.</strong> One offer is not an outcome. If we report a maximum at all, it appears beside the median and the count.</li>
      <li><strong>A percentage without its denominator.</strong> "94% placement" means nothing without knowing who was counted, who was excluded, and over what window.</li>
      <li><strong>Numbers from a window chosen after the result.</strong> The window is fixed in the table above before the data exists.</li>
      <li><strong>Salary figures for roles nobody in the cohort took.</strong> Market-rate estimates are fine as context, but they are labelled as estimates and never mixed into outcome figures.</li>
      <li><strong>Aggregates that include people who did not search.</strong> Someone who took a family business job was not placed and was not failed. Mixing the two flatters the number.</li>
    </ul>

    <h2>Corrections</h2>
    <p>If a published figure turns out to be wrong, it is corrected here with the old value, the new value and the date, rather than quietly edited. A correction history is more useful to you than a clean page.</p>
    <p>Write to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a> if you believe a number here is wrong. You will get a reply from a person, and if you are right, the correction goes on this page.</p>`,
    pager: pager(['Graded examples', '/verify/samples/'], ['Who writes the papers', '/verify/team/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/team/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/verify/team/',
  shell({
    route: '/verify/team/',
    title: 'Who writes and reviews our papers | The Coding Company',
    desc: 'How TCC papers are written, reviewed and calibrated — and the rule we apply to instructor names, photographs and biographies.',
    eyebrow: 'Verification · People',
    h1: 'Who writes the papers.',
    lede: 'You are not looking at headshots. That is deliberate, and this page explains why — along with the process behind every question you sit.',
    body: `
    <h2>The rule about people</h2>
    <div class="callout">
      <p><strong>A name appears on this site only with a link you can check.</strong> A photograph appears only if it is the person. No stock photography, no invented biographies, no "industry expert" with no industry.</p>
    </div>
    <p>Course sites are full of instructors who exist only as a headshot and a first name. We would rather publish fewer people and let you verify each one, because a biography you cannot check is decoration.</p>

    <h2>How a question gets into a paper</h2>
    <ol>
      <li><strong>Drafted from a real round.</strong> Every item starts from a documented hiring or role task, not from a textbook chapter. The source is recorded in the item file.</li>
      <li><strong>Answered cold by a second person.</strong> If the second person cannot reach the intended answer without hints, the item is rewritten or dropped. Ambiguity in a test is a defect, not a difficulty setting.</li>
      <li><strong>Checked against the rubric.</strong> Each item must name the criterion it is measuring. An item that measures nothing specific is cut, however clever it looks.</li>
      <li><strong>Sit as a candidate.</strong> Someone who has not seen the item takes it under the real time limit. If it cannot be finished in the allotted time by a competent person, the timing is wrong or the item is too long.</li>
      <li><strong>Reviewed after every cohort.</strong> Items where strong candidates cluster on one wrong option are treated as item faults first, candidate faults second.</li>
    </ol>

    <h2>What the reviewer sees</h2>
    <p>Reviewers mark blind against a candidate ID. They see your artifact, your disclosure of AI use, and the rubric. They do not see your name, your college, your city, or what you paid — because all four change how people mark, and not in a direction that helps you.</p>

    <h2>Named instructors, published before each cohort</h2>
    <p>Before a cohort opens, this page lists the people teaching it: name, what they have shipped, and a link to verify it. If that list is not here, the cohort is not open, and any page suggesting otherwise is out of date.</p>
    <p>This is a self-imposed constraint. It is easy to write a page of impressive-sounding instructors in an afternoon. It is hard to be accountable for one, which is exactly why the rule exists.</p>

    <h2>Corrections and complaints</h2>
    <p>If something you were taught was wrong, write to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a>. Corrections are logged, and where a taught error affected an assessment, affected candidates are re-marked at no cost.</p>`,
    pager: pager(['Published stats', '/verify/stats/'], ["What we don't claim", '/verify/what-we-dont-claim/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /verify/what-we-dont-claim/
   ═════════════════════════════════════════════════════════════════════════ */

const nonClaims = [
  ['We do not guarantee a job.', 'We provide preparation, assessment and employer introductions. Hiring decisions belong to employers, and any provider promising you an offer is either lying or charging you for a lottery ticket.'],
  ['We are not a government-accredited institution.', 'TCC CERT+ is an industry credential issued by The Coding Company. It is not a UGC-recognised degree, a government licence or a regulated professional qualification.'],
  ['We do not publish a placement percentage yet.', 'No cohort has completed the placement window. See the publication rule instead of a number.'],
  ['We do not promise a salary.', 'We can show you what roles pay in the market and what the work requires. We cannot promise what a company will offer you.'],
  ['We do not claim a deeper partnership than we have.', 'Each partner mark on this site has a stated scope. Read the exact wording rather than inferring an endorsement.'],
  ['We do not use stock photos as alumni.', 'Every face on this site will be a real person who agreed to be there, or there will be no face.'],
  ['We do not sell your data.', 'Your details go into our lead system and nowhere else. No list rental, no data brokers, no "partners who may contact you".'],
  ['We do not run fake scarcity.', 'If a cohort has seats left, we say how many are actually left. If it is full, it is full — we do not reopen it because the ad worked.'],
  ['We do not use countdown timers on price.', 'The fee is the fee. A price that expires in nine minutes is a pressure tactic, not an offer.'],
  ['We do not hide the refund terms.', 'Seven days, in writing, on the refund page, in plain language. If it were complicated, it would not be a refund.'],
];

write(
  '/verify/what-we-dont-claim/',
  shell({
    route: '/verify/what-we-dont-claim/',
    title: "What we don't claim — and what we say instead | TCC",
    desc: 'Ten claims The Coding Company explicitly does not make, including job guarantees, accreditation and placement percentages, with the honest alternative for each.',
    eyebrow: 'Verification · Non-claims',
    h1: "What we don't claim.",
    lede: 'A list of things we could say, and will not. Every item below is a claim a competitor makes in good faith or bad — and in both cases it makes the buyer worse off, because it removes the ability to tell providers apart.',
    body: `
    <div class="claims">
${nonClaims
  .map(
    ([claim, instead], i) => `      <div class="claim">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="txt"><b>${claim}</b><span>${instead}</span></span>
      </div>`
  )
  .join('\n')}
    </div>

    <h2>Why publish this at all</h2>
    <p>Because the alternative is that you have to work it out yourself, usually after paying. A provider's non-claims tell you more about how it will behave when something goes wrong than its promises do — promises are written by marketing, and the failure plan is written by whoever has to live with the consequences.</p>
    <p>If you find us making any claim on this list anywhere on this site, in an ad, or in a sales call, that is a bug. Send it to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a> and it gets fixed and acknowledged.</p>

    <h2>What we do claim</h2>
    <p>A defined assessment, a published rubric, a format disclosed before you pay, worked examples at three levels of quality, and a paper you can sit in fifteen minutes to decide for yourself. That is a smaller list than most, and every item on it is checkable.</p>

    <div class="actions">
      <a class="btn" href="/diagnostic/">Test the claim, don't read it</a>
      <a class="btn ghost" href="/verify/">Back to the evidence index</a>
    </div>`,
    pager: pager(['Who writes the papers', '/verify/team/'], null),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /partners/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/partners/',
  shell({
    route: '/partners/',
    title: 'Partner marks and their exact scope | The Coding Company',
    desc: 'What each partner mark on this site means, what it does not mean, and the wording we use for each relationship.',
    eyebrow: 'Disclosure',
    h1: 'What each partner mark actually means.',
    lede: 'A logo on a course site implies endorsement. Sometimes it is one, sometimes it is a licence to use the tool, and usually nobody tells you which. Here is the exact scope of each mark we display.',
    body: `
    <div class="callout">
      <p><strong>Our rule:</strong> every mark on this site has a stated scope, and nothing beyond that scope is claimed. No logo appears here to imply accreditation, certification of our programme, or an employment relationship.</p>
    </div>

    <h2>The marks we display</h2>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Partner</th><th>Stated scope</th><th>What it does not mean</th></tr></thead>
        <tbody>
          <tr>
            <td><b>Lovable</b></td>
            <td>Official Solutions Partner. We build and teach with Lovable, and hold partner status under their programme.</td>
            <td>It does not mean Lovable endorses our assessments or guarantees outcomes for our candidates.</td>
          </tr>
          <tr>
            <td><b>OpenAI</b></td>
            <td>We use OpenAI models in our curriculum, in WorkSim simulations and in internal tooling.</td>
            <td>It does not mean OpenAI accredits, endorses or partners with our certification.</td>
          </tr>
          <tr>
            <td><b>Anthropic (Claude)</b></td>
            <td>We use Claude models in our curriculum and in WorkSim simulations.</td>
            <td>It does not mean Anthropic accredits, endorses or partners with our certification.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>If a relationship changes</h2>
    <p>This table is updated on the day a scope changes, not when the next brochure is printed. If a partnership ends, the mark comes off the site the same week — including from pages that were generated earlier.</p>

    <h2>Why this page exists</h2>
    <p>Because "official partner" is a phrase with no defined meaning across the industry. Two companies can both say it and mean completely different things: a signed commercial agreement, a licence to use a logo, or a reseller arrangement. The only way for you to know which one you are looking at is for the provider to say so in writing.</p>
    <p>If you need documentation for any mark here, write to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a> and ask. We would rather answer the question than have you guess.</p>`,
    pager: pager(['Verification hub', '/verify/'], null),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /enrol/ — payment for accepted members
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/enrol/',
  shell({
    route: '/enrol/',
    title: 'Complete your enrolment — ₹14,999 cohort fee | TCC',
    desc: 'Pay your cohort fee after acceptance. What the fee includes, what it does not, and how the refund window works before you enter card details.',
    eyebrow: 'Enrolment',
    h1: 'Complete your enrolment.',
    lede: 'This page is for candidates who have already been accepted. Payment is handled by Cashfree. If you have not applied yet, nothing on this page is due today.',
    body: `
    ${renderCohort('enrol', COHORT)}

    <div class="callout warn">
      <p><strong>Not accepted yet?</strong> Do not pay here. <a class="inline" href="/become-a-member/">Send an application first</a> — it is read by a person within two working days, and no payment is taken at application.</p>
    </div>

    <h2>What you are paying for</h2>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Included</th><th>Detail</th></tr></thead>
        <tbody>
          <tr><td><b>Live programme</b></td><td>Scheduled live sessions with working AI practitioners, not recorded lectures played back</td></tr>
          <tr><td><b>CERT+ assessment</b></td><td>One assessment at your level, marked against the published rubric, with one retake inside 30 days</td></tr>
          <tr><td><b>Builder community</b></td><td>Private group, events and hackathons for the duration of your cohort</td></tr>
          <tr><td><b>Course library</b></td><td>50+ lessons on applied AI and go-to-market, available while you are enrolled</td></tr>
          <tr><td><b>Tool credits</b></td><td>Credits from our partners, subject to their availability at the time you start</td></tr>
          <tr><td><b>Placement track</b></td><td>Portfolio, resume and interview support, with employer introductions where there is a fit</td></tr>
        </tbody>
      </table>
    </div>

    <h2>What it is not</h2>
    <p>It is not a job guarantee, and it is not a government-recognised qualification. If either of those is what you need, this is the wrong programme and we would rather say so now than take your money. <a class="inline" href="/verify/what-we-dont-claim/">The full list of what we do not claim is here.</a></p>

    <h2>The fee</h2>
    <div class="card">
      <p style="margin:0;font-size:30px;letter-spacing:-.03em;font-weight:600">₹14,999</p>
      <p style="margin:6px 0 0;color:var(--v-ink3);font-size:14px">One-time cohort fee, INR. No subscription, no renewal to keep the credential valid for its three-year term.</p>
    </div>

    <h2>Refunds, before you pay</h2>
    <p>Seven days from payment, no reason required, as long as you have not sat the final assessment. The full terms are on the <a class="inline" href="/refund-policy/">refund page</a> and they are short on purpose. If the refund process were complicated, it would not be a refund.</p>

    <h2>Pay</h2>
    <p>You will be redirected to Cashfree, our payment processor. Cashfree handles the card, UPI or netbanking details; we never see them.</p>
    <div class="actions">
      <a class="btn" href="${PAY_URL}" rel="noopener">Pay ₹14,999 securely</a>
      <a class="btn ghost" href="/contact/">Something wrong with the link?</a>
    </div>
    <p class="meta">After payment, keep the Cashfree reference number. You will need it on the next page.</p>

    <h2>After you pay</h2>
    <ol>
      <li>Cashfree shows a payment reference. Copy it.</li>
      <li>Open <a class="inline" href="/enrol/paid/">the confirmation page</a> and submit the reference with the email you applied with.</li>
      <li>We match it to your application and activate your seat, normally within one working day.</li>
    </ol>
    <p>Seats are activated by a person, not a webhook. That is slower by a few hours and it means a failed payment never leaves you with an unexplained charge and no seat.</p>`,
    pager: pager(null, ['After payment', '/enrol/paid/']),
  })
);

/* ══════════════════════════════════════════════════════════════════════════
   /enrol/paid/
   ═════════════════════════════════════════════════════════════════════════ */

write(
  '/enrol/paid/',
  shell({
    route: '/enrol/paid/',
    title: 'Confirm your payment reference | The Coding Company',
    desc: 'Submit your Cashfree payment reference so we can match it to your application and activate your seat.',
    eyebrow: 'Enrolment · Confirmation',
    robots: 'noindex, follow',
    h1: 'Tell us the reference, and we will do the rest.',
    lede: 'Submit the Cashfree reference number and the email you applied with. We match it to your application and activate your seat, normally within one working day.',
    body: `
    <div class="card">
      <form id="ref-form" novalidate>
        <input type="text" name="_hp" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important">
        <label style="display:block;margin-bottom:14px">
          <span style="display:block;font-size:12.5px;color:var(--v-ink3);margin-bottom:6px">Email you applied with</span>
          <input type="email" name="email" required autocomplete="email" placeholder="you@example.com"
            style="width:100%;min-height:48px;background:var(--v-bg);border:1px solid var(--v-line);border-radius:10px;padding:11px 13px;color:var(--v-ink);font:inherit;font-size:15px">
        </label>
        <label style="display:block;margin-bottom:14px">
          <span style="display:block;font-size:12.5px;color:var(--v-ink3);margin-bottom:6px">Cashfree reference number</span>
          <input type="text" name="reference" required autocomplete="off" placeholder="e.g. CF1234567890"
            style="width:100%;min-height:48px;background:var(--v-bg);border:1px solid var(--v-line);border-radius:10px;padding:11px 13px;color:var(--v-ink);font:inherit;font-size:15px">
        </label>
        <label style="display:block;margin-bottom:14px">
          <span style="display:block;font-size:12.5px;color:var(--v-ink3);margin-bottom:6px">Amount paid</span>
          <input type="text" name="amount" required inputmode="numeric" placeholder="14999"
            style="width:100%;min-height:48px;background:var(--v-bg);border:1px solid var(--v-line);border-radius:10px;padding:11px 13px;color:var(--v-ink);font:inherit;font-size:15px">
        </label>
        <label style="display:block;margin-bottom:16px">
          <span style="display:block;font-size:12.5px;color:var(--v-ink3);margin-bottom:6px">Anything we should know (optional)</span>
          <textarea name="message" rows="3"
            style="width:100%;background:var(--v-bg);border:1px solid var(--v-line);border-radius:10px;padding:11px 13px;color:var(--v-ink);font:inherit;font-size:15px"></textarea>
        </label>
        <button class="btn" type="submit">Confirm payment</button>
        <p id="ref-status" role="status" aria-live="polite" style="font-size:13.5px;margin-top:12px;min-height:20px;color:var(--v-ink2)"></p>
      </form>
    </div>

    <h2>If you paid but did not get a reference</h2>
    <p>Check the confirmation email Cashfree sent you, or the SMS on the number you paid with. If neither arrived, write to <a class="inline" href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a> with the date, time and amount. We can find the transaction from the processor's side.</p>

    <h2>What happens next</h2>
    <ol>
      <li>We match the reference to your application.</li>
      <li>You get a confirmation email with your cohort start date and onboarding steps.</li>
      <li>Your seat is active. The seven-day refund window starts from the payment date, not from activation.</li>
    </ol>
    <p class="meta">If you have not applied yet, this form will not activate a seat. <a class="inline" href="/become-a-member/">Apply first</a>.</p>`,
    pager: pager(['Enrolment', '/enrol/'], null),
  })
);

/* script for the confirmation form */
const confirmScript = `
<script>
(function () {
  var form = document.getElementById('ref-form');
  if (!form) return;
  var status = document.getElementById('ref-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    status.style.color = '';
    status.textContent = 'Sending…';
    fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'contact',
        source: 'enrol-payment-reference',
        name: 'Payment reference',
        email: data.email,
        message: 'Cashfree reference: ' + data.reference + ' · amount: ' + data.amount + (data.message ? ' · note: ' + data.message : ''),
        _t: Date.now() - 3000,
        _page: '/enrol/paid/'
      })
    })
      .then(function (r) { if (!r.ok) throw new Error('failed'); return r.json(); })
      .then(function () {
        status.style.color = 'var(--v-good)';
        status.textContent = 'Received. We will match it to your application and confirm by email within one working day.';
        form.reset();
      })
      .catch(function () {
        status.style.color = '#c0453b';
        status.textContent = 'That did not send. Email hello@thecodingcompany.io with the reference instead.';
      });
  });
})();
</script>`;

const paidPath = path.join(PUBLIC, 'enrol', 'paid', 'index.html');
const paidHtml = fs.readFileSync(paidPath, 'utf8').replace('</body>', `${confirmScript}\n</body>`);
fs.writeFileSync(paidPath, paidHtml, 'utf8');

console.log('verify cluster built.');