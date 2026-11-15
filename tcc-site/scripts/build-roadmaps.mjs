import fs from "node:fs";
import path from "node:path";
import themeTags from "./theme-tags.cjs";
import { getGraph, fallbackGraph } from "./roadmap-graphs/index.mjs";
import { renderGraphSection, GRAPH_STYLES, GRAPH_SCRIPT } from "./roadmap-graphs/lib.mjs";

const { withTheme } = themeTags;

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = path.join(ROOT, "public");
const HOME = path.join(SITE, "index.html");
const OUT_DIR = path.join(SITE, "roadmaps");
const OUT = path.join(OUT_DIR, "index.html");

const SOURCE = "https://roadmap.sh/roadmaps";

const SECTION_META = {
  "NEW ROADMAPS": { key: "new", label: "New" },
  "REVAMPED ROADMAPS": { key: "revamped", label: "Revamped" },
  "ROLE BASED ROADMAPS": { key: "role", label: "Role based" },
  "SKILL BASED ROADMAPS": { key: "skill", label: "Skill based" },
  "ABSOLUTE BEGINNERS": { key: "beginner", label: "Absolute beginners" },
  "BEST PRACTICES": { key: "practices", label: "Best practices" },
};

// Roadmaps that are live on the source site but not listed in its catalog grid.
const EXTRA_ROADMAPS = [
  { slug: "graphql", title: "GraphQL", key: "skill" },
  { slug: "product-design", title: "Product Design", key: "skill" },
];

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function getDescription(slug) {
  try {
    const html = await getText(`https://roadmap.sh/${slug}`);
    const m =
      html.match(/<meta name="description" content="([^"]*)"/i) ||
      html.match(/<meta property="og:description" content="([^"]*)"/i);
    return m ? decode(m[1]) : "";
  } catch {
    return "";
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function parseCatalog(html) {
  const headingRe = /<h2[^>]*>([^<]+)<\/h2>/g;
  const heads = [...html.matchAll(headingRe)];
  const sections = [];
  const seen = new Set();
  for (let i = 0; i < heads.length; i++) {
    const name = decode(heads[i][1]).toUpperCase();
    if (!SECTION_META[name]) continue;
    const start = heads[i].index + heads[i][0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : html.length;
    const chunk = html.slice(start, end);
    const items = [];
    const anchorRe =
      /<a[^>]*class="[^"]*relative rounded-md border[^"]*"[^>]*href="\/([a-z0-9][a-z0-9-]*)\/?"[^>]*>([^<]*)<\/a>/g;
    let m;
    while ((m = anchorRe.exec(chunk))) {
      const slug = m[1];
      const title = decode(m[2]);
      if (!slug || !title || seen.has(slug)) continue;
      seen.add(slug);
      items.push({ slug, title });
    }
    if (items.length) sections.push({ name, ...SECTION_META[name], items });
  }
  return sections;
}

function extractHomeParts(html) {
  const styleStart = html.indexOf("<style>");
  const styleEnd = html.indexOf("</style>", styleStart);
  if (styleStart < 0 || styleEnd < 0) throw new Error("homepage style block not found");
  const styles = html.slice(styleStart + "<style>".length, styleEnd);

  const shellStart = html.indexOf('<div class="app-shell');
  const contentStart = html.indexOf('<div class="content-wrap">', shellStart);
  if (shellStart < 0 || contentStart < 0) throw new Error("homepage shell not found");
  const shell = html.slice(shellStart, contentStart + '<div class="content-wrap">'.length);

  return { styles, shell };
}

const SUMMARY = {
  role: (t) => `A practical route through the concepts, tools, and projects that ${t} roles use day to day.`,
  skill: (t) => `Build working knowledge of ${t}, from the fundamentals to the patterns teams use in production.`,
  beginner: (t) => `A gentle starting path for ${t}, sequenced for complete beginners.`,
  practices: (t) => `Level-up guidance for ${t}, focused on the habits and standards that hold up on real projects.`,
  new: (t) => `A current path through ${t}, covering the core ideas and the tooling shaping it right now.`,
  revamped: (t) => `A refreshed path through ${t}, covering the core ideas and the tooling shaping it right now.`,
};

function summaryFor(item, section) {
  const fn = SUMMARY[section.key] || SUMMARY.skill;
  return fn(item.title);
}

function detailHref(item) {
  return `/roadmaps/${item.slug}/`;
}

function card(item, section) {
  const href = detailHref(item);
  const search = `${item.title} ${item.desc} ${section.label} ${section.name}`.toLowerCase();
  return `            <a class="rm-card" href="${href}" data-section="${section.key}" data-search="${esc(search)}">
              <span class="rm-card-head">
                <span class="rm-card-title">${esc(item.title)}</span>
                <span class="rm-card-arrow" aria-hidden="true">&rarr;</span>
              </span>
              <span class="rm-card-desc">${esc(item.desc || `Open the ${item.title} roadmap guide.`)}</span>
              <span class="rm-card-foot">
                <span class="rm-card-tag">${esc(section.label)}</span>
                <span class="rm-card-domain">TCC guide</span>
              </span>
            </a>`;
}

function relatedItems(item, section, sections, limit = 4) {
  const out = section.items.filter((x) => x.slug !== item.slug).slice(0, limit);
  if (out.length < limit) {
    for (const s of sections) {
      if (s.key === section.key) continue;
      for (const x of s.items) {
        if (out.length >= limit) break;
        if (x.slug !== item.slug && !out.some((y) => y.slug === x.slug)) out.push(x);
      }
      if (out.length >= limit) break;
    }
  }
  return out;
}

const PHASE_TEMPLATES = {
  role: (t) => [
    ["Foundations", [`Understand what a ${t} does day to day`, "Learn the core vocabulary and mental models", "Set up the tools you will use"]],
    ["Core skills", ["Master the fundamentals with guided practice", `Read and explain real ${t} work`, "Build one small feature end to end"]],
    ["Build", ["Ship a portfolio project", "Add tests, docs, and a README", "Refactor with feedback"]],
    ["Specialize", [`Pick a specialization inside ${t}`, "Study production architectures", "Contribute to an open-source project"]],
    ["Career", ["Turn projects into a portfolio", "Practice role-specific interviews", "Apply with a targeted resume"]],
  ],
  skill: (t) => [
    ["Orientation", [`Learn what ${t} is used for`, "Install the standard toolchain", "Complete a hello-world exercise"]],
    ["Fundamentals", ["Learn the syntax and core concepts", "Practice common patterns", "Debug a broken example"]],
    ["Working knowledge", ["Structure a small project", "Add tests and error handling", "Cover performance and security basics"]],
    ["Advanced", ["Study real-world patterns", `Integrate ${t} with adjacent tools`, "Read the official source or spec"]],
    ["Mastery", ["Build a capstone project", "Write a short guide or teardown", "Teach or contribute back"]],
  ],
  beginner: (t) => [
    ["Start here", [`Understand what ${t} is`, "Set up your environment", "Learn the first 20 terms"]],
    ["First steps", ["Follow a guided tutorial", "Build a tiny project", "Review what worked"]],
    ["Practice", ["Repeat with variations", "Learn to debug simple errors", "Ask for feedback"]],
    ["Confidence", ["Build a small portfolio piece", "Document what you learned", "Explore the next topics"]],
    ["What next", ["Choose a specialization", "Join a community", "Plan your next roadmap"]],
  ],
  practices: (t) => [
    ["Assess", [`Audit your current ${t} setup`, "Identify the biggest gaps", "Define what success looks like"]],
    ["Adopt", ["Learn the standard", "Apply it to one project", "Measure the impact"]],
    ["Scale", ["Document the practice", "Train the people around you", "Automate the checks"]],
    ["Harden", ["Review edge cases", "Add monitoring and alerts", "Run a retrospective"]],
    ["Sustain", ["Create a checklist", "Schedule regular reviews", "Share the playbook"]],
  ],
};

function roadmapPhases(item, section) {
  const key = section.key === "new" || section.key === "revamped" ? "skill" : section.key;
  const fn = PHASE_TEMPLATES[key] || PHASE_TEMPLATES.skill;
  return fn(item.title).map(([title, steps]) => ({ title, steps }));
}

function buildPathHtml(item, section) {
  return roadmapPhases(item, section)
    .map(
      (phase, i) => `            <li class="rd-phase">
              <div class="rd-phase-head">
                <span class="rd-phase-num">${String(i + 1).padStart(2, "0")}</span>
                <h3>${esc(phase.title)}</h3>
              </div>
              <ul class="rd-phase-steps">
${phase.steps.map((step) => `                <li>${esc(step)}</li>`).join("\n")}
              </ul>
            </li>`
    )
    .join("\n");
}

function buildSections(sections) {
  return sections
    .map((section) => {
      const cards = section.items.map((item) => card(item, section)).join("\n");
      return `          <section class="rm-group" data-group="${section.key}" aria-labelledby="rm-group-${section.key}">
            <div class="rm-group-head">
              <h2 class="rm-group-title" id="rm-group-${section.key}">${esc(section.label)}</h2>
              <span class="rm-group-count">${section.items.length}</span>
            </div>
            <div class="rm-grid">
${cards}
            </div>
          </section>`;
    })
    .join("\n\n");
}

function buildChips(sections) {
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const chips = [
    `<button class="rm-chip is-active" type="button" data-filter="all" aria-pressed="true">All <span>${total}</span></button>`,
    ...sections.map(
      (s) =>
        `<button class="rm-chip" type="button" data-filter="${s.key}" aria-pressed="false">${esc(s.label)} <span>${s.items.length}</span></button>`
    ),
  ];
  return chips.join("\n              ");
}

function buildJsonLd(sections) {
  let position = 0;
  const items = [];
  for (const s of sections) {
    for (const it of s.items) {
      position++;
      items.push({
        "@type": "ListItem",
        position,
        name: it.title,
        url: `https://thecodingcompany.io/roadmaps/${it.slug}/`,
      });
    }
  }
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "All developer roadmaps",
      description:
        `A catalog of ${position} step-by-step TCC roadmaps across roles, skills, and best practices, each with a five-phase study plan.`,
      url: "https://thecodingcompany.io/roadmaps/",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: position,
        itemListElement: items,
      },
    },
    null,
    2
  );
}

function buildDetailJsonLd(item, section) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: `${item.title} Roadmap | The Coding Company`,
          description: item.desc,
          url: `https://thecodingcompany.io${detailHref(item)}`,
          isPartOf: {
            "@type": "CollectionPage",
            name: "All developer roadmaps",
            url: "https://thecodingcompany.io/roadmaps/",
          },
          about: { "@type": "Thing", name: item.title },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://thecodingcompany.io/" },
            { "@type": "ListItem", position: 2, name: "Roadmaps", item: "https://thecodingcompany.io/roadmaps/" },
            {
              "@type": "ListItem",
              position: 3,
              name: `${item.title} roadmap`,
              item: `https://thecodingcompany.io${detailHref(item)}`,
            },
          ],
        },
      ],
    },
    null,
    2
  );
}

function buildDetailHtml(item, section, sections, total, ctx) {
  const related = relatedItems(item, section, sections, 4);
  const relatedLinks = related
    .map(
      (r) =>
        `                  <a class="rd-side-link" href="${detailHref(r)}">${esc(r.title)} <span aria-hidden="true">&rarr;</span></a>`
    )
    .join("\n");

  const graph = getGraph(item.slug) || fallbackGraph(item, section, roadmapPhases(item, section));
  const plan = roadmapPhases(item, section);
  if (graph && Array.isArray(graph.phases)) {
    graph.phases.forEach((phase, i) => {
      if (!phase.outcome && plan[i]) phase.outcome = plan[i].steps[0] || "";
    });
  }
  const graphHtml = renderGraphSection({ graph, related, total, item, section });

  const content = `          <!-- ROADMAP GUIDE HERO -->
          <section class="rd-hero">
            <div class="rd-wrap">
              <nav class="rd-crumbs" aria-label="Breadcrumb">
                <a href="/">Home</a><span class="rd-sep" aria-hidden="true">/</span>
                <a href="/roadmaps/">Roadmaps</a><span class="rd-sep" aria-hidden="true">/</span>
                <span aria-current="page">${esc(item.title)}</span>
              </nav>
              <p class="rd-eyebrow">${esc(section.label)} roadmap</p>
              <h1 class="rd-title">${esc(item.title)} <span class="serif-i">roadmap</span></h1>
              <p class="rd-sub">${esc(item.desc)}</p>
              <div class="rd-actions">
                <a class="rd-btn" href="#roadmap-map">Start the TCC path <span aria-hidden="true">&darr;</span></a>
                <a class="rd-back-link" href="/roadmaps/"><span aria-hidden="true">&larr;</span> All ${total} roadmaps</a>
              </div>
              <p class="rd-attrib">An original TCC study plan built for learners in India. Everything on this page stays on The Coding Company; nothing here sends you to a third-party roadmap site.</p>
            </div>
          </section>

${graphHtml}

          <!-- ROADMAP GUIDE BODY -->
          <section class="rd-body">
            <div class="rd-wrap rd-layout">
              <div class="rd-main">
                <h2 class="rd-h2">How to use this roadmap</h2>
                <ol class="rd-steps">
                  <li>
                    <span class="rd-step-n">01</span>
                    <div>
                      <h3>Follow the five phases</h3>
                      <p>Work through the interactive map above in order. Each phase lists the concrete outcomes to hit before you move on, so you always know what "done" looks like.</p>
                    </div>
                  </li>
                  <li>
                    <span class="rd-step-n">02</span>
                    <div>
                      <h3>Practice the fundamentals</h3>
                      <p>Use <a href="/prep+/">TCC Prep+</a> to drill aptitude, programming, DSA, and interview questions while the concepts are fresh.</p>
                    </div>
                  </li>
                  <li>
                    <span class="rd-step-n">03</span>
                    <div>
                      <h3>Build proof of work</h3>
                      <p>Pair the roadmap with a <a href="/domains/">domain course</a> or <a href="/bootcamps/">CERT+ track</a> so you finish with projects and a credential, not just notes.</p>
                    </div>
                  </li>
                </ol>

                <h2 class="rd-h2">What to focus on</h2>
                <div class="rd-focus">
                  <article>
                    <h3>Fundamentals</h3>
                    <p>The core ideas behind ${esc(item.title)}: vocabulary, mental models, and the concepts that show up in interviews.</p>
                  </article>
                  <article>
                    <h3>Tooling</h3>
                    <p>The tools, libraries, and workflows teams actually use, so your practice matches the job.</p>
                  </article>
                  <article>
                    <h3>Projects</h3>
                    <p>Small, shippable builds that turn the roadmap into evidence you can show a recruiter.</p>
                  </article>
                </div>

                <div class="rd-official">
                  <div>
                    <h2 class="rd-h2">Want guided help?</h2>
                    <p>Pair this plan with TCC mentorship, live cohorts, and placement support. We will review your progress and help you turn the phases into a portfolio.</p>
                  </div>
                  <a class="rd-btn" href="/placement/">See placements <span aria-hidden="true">&rarr;</span></a>
                </div>
              </div>

              <aside class="rd-side" aria-label="Roadmap details">
                <div class="rd-panel">
                  <p class="rd-panel-label">Collection</p>
                  <p class="rd-panel-value">${esc(section.label)}</p>
                  <p class="rd-panel-label">Practice with TCC</p>
                  <a class="rd-side-link" href="/prep+/">Prep+ practice <span aria-hidden="true">&rarr;</span></a>
                  <a class="rd-side-link" href="/domains/">Domain courses <span aria-hidden="true">&rarr;</span></a>
                  <a class="rd-side-link" href="/bootcamps/">CERT+ certifications <span aria-hidden="true">&rarr;</span></a>
                </div>
                <div class="rd-panel">
                  <p class="rd-panel-label">Related roadmaps</p>
${relatedLinks}
                </div>
                <a class="rd-panel-cta" href="/roadmaps/">Browse all ${total} roadmaps <span aria-hidden="true">&rarr;</span></a>
              </aside>
            </div>
          </section>

          <!-- BACK TO CATALOG -->
          <section class="rd-footer-cta">
            <div class="rd-wrap">
              <h2>Keep going.</h2>
              <p>Pick another roadmap, or go back to the full catalog and choose the path that matches your next role.</p>
              <a class="rd-btn" href="/roadmaps/">Back to all roadmaps <span aria-hidden="true">&rarr;</span></a>
            </div>
          </section>

${ctx.siteFooter}`;

  return withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(item.title)} Roadmap | The Coding Company</title>
    <meta name="description" content="${esc(item.desc)}" />
    <meta name="keywords" content="${esc(item.title)} roadmap, ${esc(item.title)} learning path, ${esc(section.label)} roadmap, TCC roadmaps" />
    <meta name="author" content="The Coding Company" />
    <link rel="canonical" href="https://thecodingcompany.io${detailHref(item)}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#050505" />
    <meta property="og:title" content="${esc(item.title)} Roadmap | The Coding Company" />
    <meta property="og:description" content="${esc(item.desc)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://thecodingcompany.io${detailHref(item)}" />
    <meta property="og:image" content="/vs-ig-posts-youtube-thumbnail.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thecodingco" />
    <meta name="twitter:image" content="/vs-ig-posts-youtube-thumbnail.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/tcc-favicon-32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/tcc-favicon-96.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/tcc-apple-touch.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap" />
    <script type="application/ld+json">
${buildDetailJsonLd(item, section)}
    </script>
    <style>${ctx.styles}${ctx.catalogStyles}${ctx.detailStyles}${GRAPH_STYLES}</style>
  </head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="loader" id="loader"><p class="loader-text">Patience—you're about to be impressed.</p></div>

    ${ctx.shell}

${content}
        </div>
      </main>

      <!-- Mobile bottom nav (TCC) -->
      <nav class="bottom-nav">
        <div class="bottom-nav-inner">
          <a href="/" class="bottom-link"><span>Home</span></a>
          <a href="/bootcamps" class="bottom-link"><span>CERT+</span></a>
          <a href="/placement" class="bottom-link"><span>Placements</span></a>
          <a href="/100-club" class="bottom-link"><span>Club</span></a>
          <a href="/roadmaps/" class="bottom-link active"><span>Roadmaps</span></a>
        </div>
      </nav>

    </div>

    <script>${ctx.script}${GRAPH_SCRIPT}</script>
  </body>
</html>
`);
}

async function main() {
  console.log("fetching catalog…");
  const catalogHtml = await getText(SOURCE);
  const sections = parseCatalog(catalogHtml);
  const known = new Set(sections.flatMap((s) => s.items.map((i) => i.slug)));
  for (const extra of EXTRA_ROADMAPS) {
    if (known.has(extra.slug)) continue;
    const section = sections.find((s) => s.key === extra.key);
    if (section) section.items.push({ slug: extra.slug, title: extra.title });
  }
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  console.log(`parsed ${sections.length} sections, ${total} roadmaps`);

  const flat = sections.flatMap((s) => s.items);
  for (const s of sections) for (const item of s.items) item.desc = summaryFor(item, s);

  const home = fs.readFileSync(HOME, "utf8");
  const { styles, shell: rawShell } = extractHomeParts(home);
  let shell = rawShell.replace(/<a href="\/roadmaps\/"[^>]*>[\s\S]*?<\/a>\s*/g, "");
  shell = shell.replace(
    '<a href="/" class="sidebar-link active"><span class="label">Home</span></a>',
    '<a href="/" class="sidebar-link"><span class="label">Home</span></a>'
  );
  shell = shell.replace(
    '<a href="/domains" class="sidebar-link"><span class="label">Domains</span></a>',
    '<a href="/domains" class="sidebar-link"><span class="label">Domains</span></a>\n          <a href="/roadmaps/" class="sidebar-link active"><span class="label">Roadmaps</span></a>'
  );

  const siteFooter = `          <!-- FOOTER -->
          <footer class="rm-footer">
            <div class="rm-footer-inner">
              <div>
                <a href="/" class="brand-serif rm-footer-brand">thecodingcompany</a>
                <p class="rm-footer-note">Placement practice, certifications, and career support for students and switchers.</p>
              </div>
              <div class="rm-footer-links">
                <a href="/">Home</a>
                <a href="/domains/">Domains</a>
                <a href="/bootcamps/">CERT+</a>
                <a href="/placement/">Placements</a>
                <a href="/roadmaps/">Roadmaps</a>
                <a href="/worksim/">WorkSim (pilot)</a>
              </div>
            </div>
            <p class="rm-footer-legal">The Coding Company &middot; Hyderabad, Telangana, India &middot; <a href="mailto:hello@thecodingcompany.io">hello@thecodingcompany.io</a></p>
          </footer>`;

  const content = `          <!-- ROADMAP CATALOG HERO -->
          <section class="rm-hero" aria-labelledby="rm-hero-title">
            <div class="rm-hero-inner">
              <p class="rm-eyebrow">All roadmaps</p>
              <h1 class="rm-hero-title" id="rm-hero-title">Every path. <span class="serif-i">One place.</span></h1>
              <p class="rm-hero-sub">${total} step-by-step roadmaps across roles, skills, and best practices. Every guide is a TCC-built five-phase study plan with practice, projects, and a clear next step.</p>
              <div class="rm-hero-actions">
                <a class="rm-hero-btn" href="/#home-roadmap">Take the guided path <span aria-hidden="true">&rarr;</span></a>
                <a class="rm-hero-link" href="/prep+/">Start practising <span aria-hidden="true">&rarr;</span></a>
              </div>
              <p class="rm-attrib">Built and maintained by The Coding Company for our students and anyone switching into tech. Pick a path, work the phases, and use TCC practice to keep momentum.</p>
            </div>
          </section>

          <!-- ROADMAP CATALOG -->
          <section class="rm-catalog" aria-label="Roadmap catalog">
            <div class="rm-toolbar">
              <label class="rm-search">
                <span class="rm-search-icon" aria-hidden="true">&#8981;</span>
                <span class="sr-only">Search roadmaps</span>
                <input id="rm-search" type="search" placeholder="Search ${total} roadmaps…" autocomplete="off" />
              </label>
              <div class="rm-chips" role="group" aria-label="Filter by collection">
              ${buildChips(sections)}
              </div>
              <p class="rm-result" aria-live="polite"><span id="rm-visible">${total}</span> of ${total} roadmaps</p>
            </div>

            <div class="rm-empty" id="rm-empty" hidden>
              <p>No roadmaps match that search.</p>
              <button type="button" id="rm-clear">Clear filters</button>
            </div>

${buildSections(sections)}

            <p class="rm-source">Every card opens a TCC guide with an original five-phase study plan, related paths, and links to <a href="/prep+/">TCC practice</a>.</p>
          </section>

${siteFooter}`;

  const catalogStyles = `
      /* ── Roadmap catalog ── */
      .rm-hero { padding: 64px clamp(20px, 6vw, 80px) 34px; background: radial-gradient(ellipse at 20% 0%, rgba(48,150,255,0.14), transparent 55%), #000; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .rm-hero-inner { max-width: 1180px; margin: 0 auto; }
      .rm-eyebrow { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 12px; }
      .rm-hero-title { font-size: clamp(34px, 5.4vw, 68px); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; margin-bottom: 16px; }
      .rm-hero-title .serif-i { font-weight: 400; }
      .rm-hero-sub { max-width: 44em; color: #b7bcc5; font-size: clamp(15px, 1.5vw, 19px); line-height: 1.55; }
      .rm-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; margin-top: 26px; }
      .rm-hero-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 999px; background: #fff; color: #000; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; transition: background 0.2s ease, transform 0.2s ease; }
      .rm-hero-btn:hover { background: #e6e6e6; transform: translateY(-1px); }
      .rm-hero-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.68); border-bottom: 1px solid rgba(255,255,255,0.22); padding-bottom: 2px; transition: color 0.2s ease, border-color 0.2s ease; }
      .rm-hero-link:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
      .rm-attrib { margin-top: 22px; max-width: 52em; font-size: 11.5px; line-height: 1.6; color: rgba(255,255,255,0.38); }
      .rm-attrib a { color: rgba(255,255,255,0.6); text-decoration: underline; text-underline-offset: 2px; }
      .rm-attrib a:hover { color: #fff; }

      .rm-catalog { padding: 34px clamp(20px, 6vw, 80px) 56px; background: #000; }
      .rm-toolbar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; max-width: 1180px; margin: 0 auto 30px; padding: 12px 0; background: linear-gradient(180deg, #000 70%, rgba(0,0,0,0)); }
      .rm-search { position: relative; flex: 1 1 240px; min-width: 200px; }
      .rm-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: rgba(255,255,255,0.4); pointer-events: none; }
      .rm-search input { width: 100%; padding: 11px 14px 11px 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.04); color: #fff; font-family: inherit; font-size: 13px; outline: none; transition: border-color 0.2s ease, background 0.2s ease; }
      .rm-search input::placeholder { color: rgba(255,255,255,0.38); }
      .rm-search input:focus { border-color: rgba(48,150,255,0.8); background: rgba(255,255,255,0.06); }
      .rm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .rm-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.62); font-family: inherit; font-size: 11.5px; font-weight: 600; transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease; }
      .rm-chip span { font-family: 'DM Mono', monospace; font-size: 9.5px; color: rgba(255,255,255,0.38); }
      .rm-chip:hover { color: #fff; border-color: rgba(255,255,255,0.32); }
      .rm-chip.is-active { background: #fff; border-color: #fff; color: #000; }
      .rm-chip.is-active span { color: rgba(0,0,0,0.5); }
      .rm-result { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em; color: rgba(255,255,255,0.42); white-space: nowrap; }
      .rm-empty { max-width: 1180px; margin: 0 auto 28px; padding: 26px; border: 1px dashed rgba(255,255,255,0.18); border-radius: 16px; text-align: center; color: rgba(255,255,255,0.6); }
      .rm-empty button { margin-top: 10px; border: 0; background: none; color: #fff; text-decoration: underline; text-underline-offset: 3px; font-family: inherit; font-size: 13px; }

      .rm-group { max-width: 1180px; margin: 0 auto 38px; }
      .rm-group-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .rm-group-title { font-size: clamp(18px, 2vw, 26px); font-weight: 800; letter-spacing: -0.03em; }
      .rm-group-count { font-family: 'DM Mono', monospace; font-size: 10.5px; color: rgba(255,255,255,0.4); }
      .rm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
      .rm-card { display: flex; flex-direction: column; gap: 10px; min-height: 138px; padding: 16px 16px 14px; border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)); transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease; }
      .rm-card:hover { border-color: rgba(48,150,255,0.55); background: linear-gradient(180deg, rgba(48,150,255,0.1), rgba(48,150,255,0.03)); transform: translateY(-2px); }
      .rm-card:focus-visible { outline: 2px solid #3096ff; outline-offset: 2px; }
      .rm-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .rm-card-title { font-size: 14.5px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; color: #fff; }
      .rm-card-arrow { flex-shrink: 0; font-size: 13px; color: rgba(255,255,255,0.4); transition: color 0.2s ease, transform 0.2s ease; }
      .rm-card:hover .rm-card-arrow { color: #3096ff; transform: translate(2px, -2px); }
      .rm-card-desc { font-size: 12px; line-height: 1.5; color: #8f949d; }
      .rm-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }
      .rm-card-tag { padding: 3px 8px; border: 1px solid rgba(255,255,255,0.13); border-radius: 999px; font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.42); }
      .rm-card-domain { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.06em; color: rgba(255,255,255,0.28); }
      .rm-source { max-width: 1180px; margin: 8px auto 0; font-size: 11.5px; color: rgba(255,255,255,0.38); }
      .rm-source a { color: rgba(255,255,255,0.62); text-decoration: underline; text-underline-offset: 2px; }

      .rm-footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 34px clamp(20px, 6vw, 80px) 40px; background: #000; }
      .rm-footer-inner { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; max-width: 1180px; margin: 0 auto; }
      .rm-footer-brand { font-size: 22px; font-weight: 700; letter-spacing: -0.03em; }
      .rm-footer-note { margin-top: 8px; max-width: 28em; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.45); }
      .rm-footer-links { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; font-size: 12.5px; color: rgba(255,255,255,0.6); }
      .rm-footer-links a:hover { color: #fff; }
      .rm-footer-legal { max-width: 1180px; margin: 26px auto 0; font-size: 11px; color: rgba(255,255,255,0.35); }
      .rm-footer-legal a { color: inherit; text-decoration: underline; }

      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

      @media (max-width: 767px) {
        .rm-hero { padding: 40px 20px 28px; }
        .rm-catalog { padding: 24px 20px 44px; }
        .rm-toolbar { position: static; margin-bottom: 24px; }
        .rm-result { margin-left: 0; }
        .rm-grid { grid-template-columns: 1fr; }
        .rm-card { min-height: 0; }
      }
      @media (min-width: 768px) and (max-width: 1100px) {
        .rm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (prefers-reduced-motion: reduce) {
        .rm-card, .rm-card-arrow, .rm-chip, .rm-hero-btn { transition: none; }
      }
`;

  const detailStyles = `
      /* ── Roadmap detail guide ── */
      .rd-wrap { width: 100%; max-width: 1180px; margin: 0 auto; }
      .rd-hero { padding: 52px clamp(20px, 6vw, 80px) 36px; background: radial-gradient(ellipse at 15% 0%, rgba(48,150,255,0.15), transparent 55%), #000; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .rd-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 20px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.38); }
      .rd-crumbs a { color: rgba(255,255,255,0.64); transition: color 0.2s ease; }
      .rd-crumbs a:hover { color: #fff; }
      .rd-crumbs .rd-sep { color: rgba(255,255,255,0.24); }
      .rd-crumbs [aria-current="page"] { color: rgba(255,255,255,0.48); }
      .rd-eyebrow { font-family: 'DM Mono', monospace; font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 12px; }
      .rd-title { font-size: clamp(34px, 5.2vw, 64px); font-weight: 800; letter-spacing: -0.05em; line-height: 1.03; margin-bottom: 16px; }
      .rd-title .serif-i { font-weight: 400; }
      .rd-sub { max-width: 46em; color: #b7bcc5; font-size: clamp(15px, 1.5vw, 19px); line-height: 1.55; }
      .rd-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 26px; }
      .rd-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 999px; background: #fff; color: #000; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; transition: background 0.2s ease, transform 0.2s ease; }
      .rd-btn:hover { background: #e6e6e6; transform: translateY(-1px); }
      .rd-btn:focus-visible { outline: 2px solid #3096ff; outline-offset: 2px; }
      .rd-back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.68); border-bottom: 1px solid rgba(255,255,255,0.22); padding-bottom: 2px; transition: color 0.2s ease, border-color 0.2s ease; }
      .rd-back-link:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
      .rd-attrib { margin-top: 20px; max-width: 54em; font-size: 11.5px; line-height: 1.6; color: rgba(255,255,255,0.38); }
      .rd-attrib a { color: rgba(255,255,255,0.62); text-decoration: underline; text-underline-offset: 2px; }
      .rd-attrib a:hover { color: #fff; }

      .rd-body { padding: 42px clamp(20px, 6vw, 80px) 56px; background: #000; }
      .rd-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; align-items: start; }
      .rd-h2 { font-size: clamp(20px, 2.2vw, 28px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 16px; }
      .rd-main > .rd-h2:not(:first-child) { margin-top: 38px; }
      .rd-steps { list-style: none; display: grid; gap: 12px; }
      .rd-steps li { display: flex; gap: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.012)); }
      .rd-step-n { flex-shrink: 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #3096ff; padding-top: 2px; }
      .rd-steps h3 { font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 6px; }
      .rd-steps p { font-size: 12.5px; line-height: 1.6; color: #8f949d; }
      .rd-steps a { color: rgba(255,255,255,0.8); text-decoration: underline; text-underline-offset: 2px; }
      .rd-steps a:hover { color: #fff; }
      .rd-lede { max-width: 52em; margin: -4px 0 18px; font-size: 13px; line-height: 1.65; color: #8f949d; }
      .rd-path { list-style: none; display: grid; gap: 12px; counter-reset: none; }
      .rd-phase { padding: 18px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)); }
      .rd-phase-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
      .rd-phase-num { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #3096ff; }
      .rd-phase-head h3 { font-size: 15.5px; font-weight: 700; letter-spacing: -0.015em; }
      .rd-phase-steps { list-style: none; display: grid; gap: 6px; padding-left: 0; }
      .rd-phase-steps li { position: relative; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: #a4a9b3; }
      .rd-phase-steps li::before { content: ""; position: absolute; left: 2px; top: 0.62em; width: 6px; height: 6px; border-radius: 50%; background: rgba(48,150,255,0.65); }
      .rd-focus { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
      .rd-focus article { padding: 16px; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.012)); }
      .rd-focus h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
      .rd-focus p { font-size: 12px; line-height: 1.6; color: #8f949d; }
      .rd-official { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; margin-top: 38px; padding: 22px; border: 1px solid rgba(48,150,255,0.35); border-radius: 16px; background: rgba(48,150,255,0.07); }
      .rd-official .rd-h2 { margin-bottom: 6px; }
      .rd-official p { max-width: 40em; font-size: 12.5px; line-height: 1.6; color: #a4a9b3; }

      .rd-side { display: grid; gap: 14px; position: sticky; top: 18px; }
      .rd-panel { padding: 18px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; background: rgba(255,255,255,0.03); }
      .rd-panel-label { font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
      .rd-panel-value { font-size: 14px; font-weight: 700; margin-bottom: 18px; }
      .rd-side-link { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 0; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12.5px; color: rgba(255,255,255,0.7); transition: color 0.2s ease; }
      .rd-side-link:hover { color: #fff; }
      .rd-panel-cta { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; border-radius: 14px; background: #fff; color: #000; font-size: 13px; font-weight: 700; transition: background 0.2s ease, transform 0.2s ease; }
      .rd-panel-cta:hover { background: #e6e6e6; transform: translateY(-1px); }

      .rd-footer-cta { padding: 0 clamp(20px, 6vw, 80px) 60px; background: #000; }
      .rd-footer-cta .rd-wrap { padding: 28px; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)); }
      .rd-footer-cta h2 { font-size: clamp(22px, 2.6vw, 32px); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
      .rd-footer-cta p { max-width: 44em; margin-bottom: 18px; font-size: 13px; line-height: 1.6; color: #8f949d; }

      @media (max-width: 900px) {
        .rd-layout { grid-template-columns: 1fr; gap: 28px; }
        .rd-side { position: static; }
      }
      @media (max-width: 767px) {
        .rd-hero { padding: 36px 20px 28px; }
        .rd-body { padding: 28px 20px 40px; }
        .rd-focus { grid-template-columns: 1fr; }
        .rd-footer-cta { padding: 0 20px 44px; }
        .rd-footer-cta .rd-wrap { padding: 22px; }
      }
      @media (max-width: 420px) {
        .rd-steps li { gap: 10px; padding: 14px; }
        .rd-phase { padding: 15px; }
        .rd-official { padding: 18px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .rd-btn, .rd-back-link, .rd-side-link, .rd-panel-cta { transition: none; }
      }
`;

  const script = `
      (function () {
        // sidebar collapse / expand (matches the rest of the site)
        function setCollapsed(c) {
          document.body.classList.toggle('sidebar-collapsed', c);
          try { localStorage.setItem('tcc-sidebar', c ? 'collapsed' : 'open'); } catch (e) {}
        }
        var mark = document.querySelector('.sidebar-mark');
        var tog = document.querySelector('.sidebar-toggle');
        if (mark) mark.addEventListener('click', function () { setCollapsed(false); });
        if (tog) tog.addEventListener('click', function () { setCollapsed(true); });
        setCollapsed(false);

        var topbar = document.getElementById('topbar');
        var scroller = document.querySelector('.main-scroll');
        function onScroll() {
          if (!topbar || !scroller) return;
          topbar.classList.toggle('visible', scroller.scrollTop > 60);
        }
        if (topbar) { if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

        var loader = document.getElementById('loader');
        if (loader) {
          window.addEventListener('load', function () { setTimeout(function () { loader.classList.add('hide'); }, 400); });
          setTimeout(function () { loader.classList.add('hide'); }, 3000);
        }

        // catalog search + filters
        var search = document.getElementById('rm-search');
        var chips = Array.prototype.slice.call(document.querySelectorAll('.rm-chip'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.rm-card'));
        var groups = Array.prototype.slice.call(document.querySelectorAll('.rm-group'));
        var visible = document.getElementById('rm-visible');
        var empty = document.getElementById('rm-empty');
        var clear = document.getElementById('rm-clear');
        var activeFilter = 'all';

        function apply() {
          var q = (search ? search.value : '').trim().toLowerCase();
          var shown = 0;
          cards.forEach(function (card) {
            var matchFilter = activeFilter === 'all' || card.getAttribute('data-section') === activeFilter;
            var matchQuery = !q || (card.getAttribute('data-search') || '').indexOf(q) !== -1;
            var on = matchFilter && matchQuery;
            card.hidden = !on;
            if (on) shown++;
          });
          groups.forEach(function (group) {
            var any = Array.prototype.some.call(group.querySelectorAll('.rm-card'), function (c) { return !c.hidden; });
            group.hidden = !any;
          });
          if (visible) visible.textContent = String(shown);
          if (empty) empty.hidden = shown !== 0;
        }

        chips.forEach(function (chip) {
          chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter');
            chips.forEach(function (c) {
              var on = c === chip;
              c.classList.toggle('is-active', on);
              c.setAttribute('aria-pressed', String(on));
            });
            apply();
          });
        });

        if (search) search.addEventListener('input', apply);
        if (clear) clear.addEventListener('click', function () {
          if (search) search.value = '';
          activeFilter = 'all';
          chips.forEach(function (c) {
            var on = c.getAttribute('data-filter') === 'all';
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-pressed', String(on));
          });
          apply();
          if (search) search.focus();
        });
        apply();
      })();
`;

  const html = withTheme(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>All Developer Roadmaps | The Coding Company</title>
    <meta name="description" content="Browse ${total} step-by-step TCC roadmaps across roles, skills, and best practices. Each guide is an original five-phase study plan with practice and project milestones." />
    <meta name="keywords" content="developer roadmaps, career roadmap, placement preparation, frontend roadmap, backend roadmap, AI engineer roadmap, devops roadmap, coding career" />
    <meta name="author" content="The Coding Company" />
    <link rel="canonical" href="https://thecodingcompany.io/roadmaps/" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#050505" />
    <meta property="og:title" content="All Developer Roadmaps | The Coding Company" />
    <meta property="og:description" content="Browse ${total} step-by-step developer roadmaps across roles, skills, and best practices." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://thecodingcompany.io/roadmaps/" />
    <meta property="og:image" content="/vs-ig-posts-youtube-thumbnail.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thecodingco" />
    <meta name="twitter:image" content="/vs-ig-posts-youtube-thumbnail.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/tcc-favicon-32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/tcc-favicon-96.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/tcc-apple-touch.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap" />
    <script type="application/ld+json">
${buildJsonLd(sections)}
    </script>
    <style>${styles}${catalogStyles}</style>
  </head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="loader" id="loader"><p class="loader-text">Patience—you're about to be impressed.</p></div>

    ${shell}

${content}
        </div>
      </main>

      <!-- Mobile bottom nav (TCC) -->
      <nav class="bottom-nav">
        <div class="bottom-nav-inner">
          <a href="/" class="bottom-link"><span>Home</span></a>
          <a href="/bootcamps" class="bottom-link"><span>CERT+</span></a>
          <a href="/placement" class="bottom-link"><span>Placements</span></a>
          <a href="/100-club" class="bottom-link"><span>Club</span></a>
          <a href="/roadmaps/" class="bottom-link active"><span>Roadmaps</span></a>
        </div>
      </nav>

    </div>

    <script>${script}</script>
  </body>
</html>
`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html, "utf8");
  console.log(`wrote ${OUT} (${(html.length / 1024).toFixed(1)} KB)`);

  let detailCount = 0;
  for (const section of sections) {
    for (const item of section.items) {
      const dir = path.join(OUT_DIR, item.slug);
      fs.mkdirSync(dir, { recursive: true });
      const page = buildDetailHtml(item, section, sections, total, {
        styles,
        catalogStyles,
        detailStyles,
        shell,
        script,
        siteFooter,
      });
      fs.writeFileSync(path.join(dir, "index.html"), page, "utf8");
      detailCount++;
    }
  }
  console.log(`wrote ${detailCount} roadmap guide pages`);

  upsertSitemap([
    "https://thecodingcompany.io/roadmaps/",
    ...flat.map((item) => `https://thecodingcompany.io${detailHref(item)}`),
  ]);
}

function upsertSitemap(locs) {
  const file = path.join(SITE, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;
  for (const loc of locs) {
    if (xml.includes(`<loc>${loc}</loc>`)) continue;
    const block =
      "  <url>\n" +
      `    <loc>${loc}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      "    <changefreq>weekly</changefreq>\n" +
      "    <priority>0.8</priority>\n" +
      "  </url>\n";
    xml = xml.replace("</urlset>", block + "</urlset>");
    added++;
  }
  if (added) {
    fs.writeFileSync(file, xml, "utf8");
    console.log(`added ${added} roadmap URLs to sitemap.xml`);
  } else {
    console.log("sitemap already lists every roadmap URL");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
