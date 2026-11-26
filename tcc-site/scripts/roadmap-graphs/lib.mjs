// TCC roadmap graph engine.
// Renders a roadmap.sh-style tree diagram from TCC-authored outline data.
// All layout is computed at build time; the browser only handles interaction.

// TCC design tokens (dark shell, white type, #0057DE accent).
export const PALETTE = {
  canvas: "#070707",
  sectionFill: "rgba(255,255,255,.02)",
  sectionStroke: "rgba(255,255,255,.35)",
  topic: "#ffffff",
  topicHover: "#e8edf7",
  subtopic: "#101010",
  subtopicHover: "#171717",
  subtopicStroke: "rgba(255,255,255,.4)",
  button: "#ffffff",
  buttonHover: "#0057DE",
  buttonInk: "#0a0a0a",
  edge: "rgba(47,123,255,.85)",
  accent: "#0057DE",
  focus: "#2f7bff",
  ink: "#ffffff",
};

const SIZES = {
  title: { w: 0, h: 46 },
  topic: { w: 230, h: 46 },
  subtopic: { w: 210, h: 40 },
  button: { w: 210, h: 46 },
};

const X = {
  topicOffset: 168,
  subOffset: 398,
  sectionHalf: 560,
  spine: 0,
};

const TOPIC_STEP = 132;
const SUB_GAP = 54;
const PHASE_PAD_TOP = 96;
const PHASE_PAD_BOTTOM = 58;

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "topic";
}

export function normalizeGraph(raw, fallbackTitle = "Roadmap") {
  const title = raw.title || fallbackTitle;
  const used = new Set();
  const uniqueId = (label) => {
    let base = slugify(label);
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };

  const phases = (raw.phases || []).map((phase, pi) => {
    const ph = Array.isArray(phase) ? { title: phase[0], topics: phase[1] || [] } : phase;
    const topics = (ph.topics || []).map((topic) => {
      const t = Array.isArray(topic)
        ? { label: topic[0], subs: topic[1] || [], summary: topic[2] || "" }
        : topic;
      const label = t.label;
      const id = uniqueId(label);
      const rawSubs = Array.isArray(t.subs)
        ? t.subs
        : String(t.subs || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      const subs = rawSubs.map((sub) => {
        const s = Array.isArray(sub) ? { label: sub[0], summary: sub[1] || "" } : typeof sub === "string" ? { label: sub, summary: "" } : sub;
        return { id: uniqueId(`${label} ${s.label}`), label: s.label, summary: s.summary || "" };
      });
      return {
        id,
        label,
        summary: t.summary || "",
        subs,
        phaseIndex: pi,
        phaseTitle: ph.title,
      };
    });
    return {
      title: ph.title || `Phase ${pi + 1}`,
      outcome: ph.outcome || "",
      topics,
    };
  });

  return { slug: raw.slug || "", title, phases };
}

function bezier(x1, y1, x2, y2) {
  const mid = (x1 + x2) / 2;
  return `M${round(x1)},${round(y1)} C${round(mid)},${round(y1)} ${round(mid)},${round(y2)} ${round(x2)},${round(y2)}`;
}

const round = (n) => Math.round(n * 100) / 100;

export function layoutGraph(graph) {
  const nodes = [];
  const edges = [];
  const sections = [];
  const links = [];

  let y = 0;
  const titleNode = { kind: "title", label: graph.title, x: 0, y: 0, w: 0, h: SIZES.title.h };
  nodes.push(titleNode);
  y += 78;

  const spineStart = y - 8;

  graph.phases.forEach((phase, pi) => {
    const sectionTop = y;
    const labelNode = {
      kind: "label",
      label: phase.title,
      index: pi + 1,
      x: -X.sectionHalf + 24,
      y: sectionTop + 34,
    };
    nodes.push(labelNode);
    y = sectionTop + PHASE_PAD_TOP;

    phase.topics.forEach((topic, ti) => {
      const side = ti % 2 === 0 ? 1 : -1;
      const topicX = X.topicOffset * side;
      const topicNode = {
        kind: "topic",
        id: topic.id,
        label: topic.label,
        summary: topic.summary,
        subs: topic.subs,
        phase: phase.title,
        x: topicX,
        y,
        w: SIZES.topic.w,
        h: SIZES.topic.h,
        side,
      };
      nodes.push(topicNode);

      const innerX = topicX - (SIZES.topic.w / 2) * side;
      edges.push({ d: bezier(0, y, innerX, y), dashed: false });

      const subCount = topic.subs.length;
      const firstSubY = y - ((subCount - 1) * SUB_GAP) / 2;
      topic.subs.forEach((sub, si) => {
        const subY = firstSubY + si * SUB_GAP;
        const subX = X.subOffset * side;
        const subNode = {
          kind: "subtopic",
          id: sub.id,
          label: sub.label,
          summary: sub.summary,
          parent: topic.label,
          parentId: topic.id,
          phase: phase.title,
          x: subX,
          y: subY,
          w: SIZES.subtopic.w,
          h: SIZES.subtopic.h,
          side,
        };
        nodes.push(subNode);
        const outerX = topicX + (SIZES.topic.w / 2) * side;
        const subInnerX = subX - (SIZES.subtopic.w / 2) * side;
        edges.push({
          d: `M${round(outerX)},${round(y)} C${round(outerX + 44 * side)},${round(y)} ${round(subInnerX - 44 * side)},${round(subY)} ${round(subInnerX)},${round(subY)}`,
          dashed: true,
        });
      });

      y += TOPIC_STEP;
    });

    const sectionBottom = y - TOPIC_STEP + PHASE_PAD_BOTTOM;
    sections.push({
      x: -X.sectionHalf,
      y: sectionTop,
      w: X.sectionHalf * 2,
      h: sectionBottom - sectionTop,
      label: phase.title,
      outcome: phase.outcome || "",
      index: pi + 1,
    });
    y = sectionBottom + 34;
  });

  const spineEnd = y - 40;
  edges.unshift({ d: `M0,${round(spineStart)} L0,${round(spineEnd)}`, dashed: false });

  return {
    width: X.sectionHalf * 2 + 40,
    height: y + 20,
    viewBox: `${-X.sectionHalf - 20} -30 ${X.sectionHalf * 2 + 40} ${y + 60}`,
    sections,
    nodes,
    edges,
  };
}

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function nodeAttrs(node) {
  return `data-node-id="${esc(node.id)}" data-node-type="${node.kind}" data-title="${esc(node.label)}" tabindex="0" role="button" aria-label="${esc(node.label)}. Open topic details"`;
}

export function renderGraphSvg(graph, layout, related = []) {
  const parts = [];

  parts.push(
    `<svg class="rmg-svg" viewBox="${layout.viewBox}" role="group" aria-labelledby="rmg-svg-title rmg-svg-desc" preserveAspectRatio="xMidYMin meet">`
  );
  parts.push(`<title id="rmg-svg-title">Interactive map: ${esc(graph.title)}</title>`);
  parts.push(
    `<desc id="rmg-svg-desc">Interactive tree diagram of the ${esc(graph.title)} roadmap. Every node opens a TCC study note with practice links.</desc>`
  );

  // sections first (behind everything)
  for (const s of layout.sections) {
    parts.push(
      `<g class="rmg-section" id="rmg-phase-${s.index}" data-section-index="${s.index}">
        <rect x="${round(s.x)}" y="${round(s.y)}" width="${round(s.w)}" height="${round(s.h)}" rx="16" fill="${PALETTE.sectionFill}" stroke="${PALETTE.sectionStroke}" stroke-width="1.4"></rect>
        <text x="${round(s.x + 26)}" y="${round(s.y + 34)}" class="rmg-section-label" font-size="21">${esc(String(s.index).padStart(2, "0"))}. ${esc(s.label)}</text>
        ${s.outcome ? `<text x="${round(s.x + 26)}" y="${round(s.y + 58)}" class="rmg-section-outcome" font-size="12.5">${esc(String(s.outcome).slice(0, 112))}</text>` : ""}
      </g>`
    );
  }

  // edges
  for (const e of layout.edges) {
    parts.push(
      `<path d="${e.d}" fill="none" stroke="${PALETTE.edge}" stroke-width="2.2" stroke-linecap="round"${
        e.dashed ? ' stroke-dasharray="0.8 8"' : ""
      }></path>`
    );
  }

  // title
  parts.push(
    `<g class="rmg-title"><text x="0" y="0" text-anchor="middle" font-size="30" class="rmg-title-text">${esc(
      graph.title
    )}</text></g>`
  );

  // nodes
  for (const node of layout.nodes) {
    if (node.kind === "topic") {
      const x = node.x - node.w / 2;
      const y = node.y - node.h / 2;
      parts.push(
        `<g class="rmg-node rmg-topic" ${nodeAttrs(node)}>
          <rect x="${round(x)}" y="${round(y)}" width="${node.w}" height="${node.h}" rx="8" fill="${PALETTE.topic}" stroke="#ffffff" stroke-width="1.5"></rect>
          <text x="${round(node.x)}" y="${round(node.y + 1)}" text-anchor="middle" dominant-baseline="middle" font-size="17">${esc(
          node.label
        )}</text>
        </g>`
      );
    } else if (node.kind === "subtopic") {
      const x = node.x - node.w / 2;
      const y = node.y - node.h / 2;
      parts.push(
        `<g class="rmg-node rmg-subtopic" ${nodeAttrs(node)}>
          <rect x="${round(x)}" y="${round(y)}" width="${node.w}" height="${node.h}" rx="8" fill="${PALETTE.subtopic}" stroke="${PALETTE.subtopicStroke}" stroke-width="1.4"></rect>
          <text x="${round(node.x)}" y="${round(node.y + 1)}" text-anchor="middle" dominant-baseline="middle" font-size="14.5">${esc(
          node.label
        )}</text>
        </g>`
      );
    }
  }

  // related roadmap buttons
  if (related.length) {
    const startY = layout.height + 24;
    const perRow = 3;
    const rows = Math.ceil(related.length / perRow);
    const boxH = rows * 66 + 56;
    parts.push(
      `<g class="rmg-linksgroup">
        <rect x="${-X.sectionHalf}" y="${round(startY)}" width="${X.sectionHalf * 2}" height="${boxH}" rx="16" fill="rgba(47,123,255,.04)" stroke="rgba(47,123,255,.35)" stroke-width="1.4" stroke-dasharray="5 5"></rect>
        <text x="${-X.sectionHalf + 26}" y="${round(startY + 32)}" font-size="21" class="rmg-section-label">Keep going: related TCC roadmaps</text>
      </g>`
    );
    related.forEach((r, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const cx = (col - (perRow - 1) / 2) * 350;
      const cy = startY + 74 + row * 66;
      parts.push(
        `<a class="rmg-node rmg-button" href="/roadmaps/${esc(r.slug)}/" aria-label="${esc(r.title)} roadmap">
          <rect x="${round(cx - 160)}" y="${round(cy - 21)}" width="320" height="42" rx="8" fill="${PALETTE.button}" stroke="${PALETTE.button}" stroke-width="1.5"></rect>
          <text x="${round(cx)}" y="${round(cy + 1)}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="${PALETTE.buttonInk}">${esc(
          r.title
        )}</text>
        </a>`
      );
    });
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

export function graphDataForClient(graph) {
  const topics = [];
  for (const phase of graph.phases) {
    for (const topic of phase.topics) {
      topics.push({
        id: topic.id,
        label: topic.label,
        summary: topic.summary,
        phase: phase.title,
        subs: topic.subs.map((s) => ({ id: s.id, label: s.label, summary: s.summary })),
      });
      for (const sub of topic.subs) {
        topics.push({
          id: sub.id,
          label: sub.label,
          summary: sub.summary,
          phase: phase.title,
          parent: topic.label,
          parentId: topic.id,
        });
      }
    }
  }
  return {
    slug: graph.slug,
    title: graph.title,
    phases: graph.phases.map((phase) => ({
      title: phase.title,
      count: phase.topics.length + phase.topics.reduce((n, t) => n + t.subs.length, 0),
    })),
    topics,
  };
}

export function renderGraphSection({ graph, related, total, item, section }) {
  const layout = layoutGraph(graph);
  const svg = renderGraphSvg(graph, layout, related);
  const data = graphDataForClient(graph);
  const topicCount = graph.phases.reduce(
    (n, p) => n + p.topics.length + p.topics.reduce((m, t) => m + t.subs.length, 0),
    0
  );

  const list = graph.phases
    .map(
      (phase, pi) => `            <li class="rmg-list-phase">
              <div class="rmg-list-phase-head">
                <span class="rmg-list-num">${String(pi + 1).padStart(2, "0")}</span>
                <h3>${esc(phase.title)}</h3>
                <span class="rmg-list-count" data-phase-count="${pi + 1}">0/${phase.topics.length + phase.topics.reduce((n, t) => n + t.subs.length, 0)}</span>
              </div>
              ${phase.outcome ? `<p class="rmg-list-outcome">${esc(phase.outcome)}</p>` : ""}
              <ul class="rmg-list-topics">
${phase.topics
  .map(
    (t) => `                <li>
                  <button type="button" class="rmg-list-topic" data-node-id="${esc(t.id)}">${esc(t.label)}</button>
                  <ul class="rmg-list-subs">
${t.subs
  .map(
    (s) => `                    <li><button type="button" class="rmg-list-sub" data-node-id="${esc(s.id)}">${esc(s.label)}</button></li>`
  )
  .join("\n")}
                  </ul>
                </li>`
  )
  .join("\n")}
              </ul>
            </li>`
    )
    .join("\n");

  const chips = graph.phases
    .map(
      (phase, i) =>
        `<button type="button" class="rmg-chip" data-phase="${i + 1}">${String(i + 1).padStart(2, "0")} ${esc(phase.title)}</button>`
    )
    .join("");

  return `          <!-- INTERACTIVE ROADMAP GRAPH -->
          <section class="rmg-band" id="roadmap-map" aria-labelledby="rmg-heading">
            <div class="rmg-wrap">
              <div class="rmg-head">
                <div>
                  <p class="rmg-eyebrow">Interactive tree diagram</p>
                  <h2 class="rmg-heading" id="rmg-heading">The ${esc(item.title)} map</h2>
                  <p class="rmg-sub">Every stage is a node. Click any topic to open its TCC study note, mark it Learning, Done, or Skip, and keep your progress on this device.</p>
                </div>
                <div class="rmg-progress" aria-live="polite">
                  <div class="rmg-progress-top">
                    <span class="rmg-progress-label">Your progress</span>
                    <span class="rmg-progress-count"><strong id="rmg-done">0</strong> of ${topicCount} nodes</span>
                  </div>
                  <div class="rmg-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Roadmap progress">
                    <span id="rmg-bar-fill" style="width:0%"></span>
                  </div>
                  <div class="rmg-progress-foot">
                    <span id="rmg-progress-note">Nothing marked yet</span>
                    <button type="button" class="rmg-reset" id="rmg-reset">Reset</button>
                  </div>
                </div>
              </div>

              <div class="rmg-panel">
                <div class="rmg-toolbar">
                  <label class="rmg-find">
                    <span aria-hidden="true">&#8981;</span>
                    <span class="sr-only">Find a topic</span>
                    <input type="search" id="rmg-filter" placeholder="Find a topic in this map…" autocomplete="off" />
                    <em id="rmg-match-count"></em>
                  </label>
                  <div class="rmg-chips" role="group" aria-label="Jump to a stage">${chips}</div>
                  <div class="rmg-zoom" role="group" aria-label="Zoom">
                    <button type="button" id="rmg-zoom-out" aria-label="Zoom out">&minus;</button>
                    <button type="button" id="rmg-zoom-fit">Fit</button>
                    <button type="button" id="rmg-zoom-in" aria-label="Zoom in">+</button>
                    <button type="button" id="rmg-expand" aria-pressed="false">Expand</button>
                  </div>
                </div>

                <div class="rmg-legendbar">
                  <div class="rmg-legend" aria-label="Legend">
                    <span><i class="rmg-swatch rmg-swatch-topic"></i>Topic</span>
                    <span><i class="rmg-swatch rmg-swatch-sub"></i>Subtopic</span>
                    <span><i class="rmg-swatch rmg-swatch-done"></i>Done</span>
                    <span><i class="rmg-swatch rmg-swatch-learning"></i>Learning</span>
                    <span><i class="rmg-swatch rmg-swatch-skip"></i>Skip</span>
                  </div>
                  <span class="rmg-pan-hint" aria-hidden="true">Drag to pan · Ctrl/⌘ + scroll to zoom</span>
                </div>

                <div class="rmg-canvas" id="rmg-canvas" tabindex="0" aria-label="Scrollable roadmap diagram">
${svg}
                </div>

                <ol class="rmg-list" aria-label="Roadmap topics">
${list}
                </ol>
                ${
                  related.length
                    ? `<div class="rmg-related-mobile" aria-label="Related TCC roadmaps">${related
                        .map(
                          (r) =>
                            `<a href="/roadmaps/${esc(r.slug)}/">${esc(r.title)} <span aria-hidden="true">&rarr;</span></a>`
                        )
                        .join("")}</div>`
                    : ""
                }
              </div>

              <p class="rmg-note"><span class="rmg-note-desktop">Tip: drag to pan, use the find box, or press <kbd>Enter</kbd> on a node.</span><span class="rmg-note-mobile">Tip: tap a topic to open its study note.</span> Progress is stored in your browser only.</p>
            </div>
          </section>

          <div class="rmg-drawer" id="rmg-drawer" hidden>
            <div class="rmg-drawer-backdrop" id="rmg-backdrop"></div>
            <aside class="rmg-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="rmg-drawer-title">
              <div class="rmg-drawer-head">
                <div>
                  <p class="rmg-drawer-kicker" id="rmg-drawer-kicker">Topic</p>
                  <h2 class="rmg-drawer-title" id="rmg-drawer-title">Topic</h2>
                  <p class="rmg-drawer-phase" id="rmg-drawer-phase"></p>
                </div>
                <button type="button" class="rmg-drawer-close" id="rmg-drawer-close" aria-label="Close topic details">&times;</button>
              </div>
              <div class="rmg-drawer-body">
                <p class="rmg-drawer-summary" id="rmg-drawer-summary"></p>
                <div class="rmg-status" role="group" aria-label="Topic status">
                  <button type="button" data-status="learning" id="rmg-status-learning">Learning <kbd>L</kbd></button>
                  <button type="button" data-status="done" id="rmg-status-done">Done <kbd>D</kbd></button>
                  <button type="button" data-status="skip" id="rmg-status-skip">Skip <kbd>S</kbd></button>
                </div>
                <div class="rmg-drawer-block">
                  <h3>What to cover</h3>
                  <ul id="rmg-drawer-bullets"></ul>
                </div>
                <div class="rmg-drawer-block">
                  <h3>Practice on TCC</h3>
                  <div class="rmg-drawer-links">
                    <a href="/prep+/">Prep+ drills <span aria-hidden="true">&rarr;</span></a>
                    <a href="/domains/">Domain courses <span aria-hidden="true">&rarr;</span></a>
                    <a href="/bootcamps/">CERT+ tracks <span aria-hidden="true">&rarr;</span></a>
                  </div>
                </div>
                <div class="rmg-drawer-block">
                  <h3>Keep moving</h3>
                  <div class="rmg-drawer-links" id="rmg-drawer-related">
                    <a href="/roadmaps/">All ${total} roadmaps <span aria-hidden="true">&rarr;</span></a>
                  </div>
                </div>
                <div class="rmg-drawer-nav">
                  <button type="button" id="rmg-prev">&larr; Previous</button>
                  <button type="button" id="rmg-next">Next &rarr;</button>
                </div>
              </div>
            </aside>
          </div>

          <script type="application/json" id="rmg-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

export const GRAPH_STYLES = `
      /* ── Interactive roadmap tree ── */
      .rmg-band { padding: 46px clamp(16px, 5vw, 64px) 40px; background: #000000; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .rmg-wrap { max-width: 1180px; margin: 0 auto; }
      .rmg-head { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 28px; align-items: end; margin-bottom: 22px; }
      .rmg-eyebrow { font-family:'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif !important; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.62); margin-bottom: 12px; }
      .rmg-heading { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: clamp(30px, 3.8vw, 46px); font-weight: 400; letter-spacing: -0.01em; line-height: 1.04; margin-bottom: 12px; }
      .rmg-sub { max-width: 46em; font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.66); }
      .rmg-progress { padding: 16px; border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; background: rgba(255,255,255,0.02); }
      .rmg-progress-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
      .rmg-progress-label { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.62); }
      .rmg-progress-count { font-size: 12px; color: rgba(255,255,255,0.66); }
      .rmg-progress-count strong { color: #fff; font-size: 14px; }
      .rmg-bar { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden; }
      .rmg-bar span { display: block; height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, #0057DE, #2f7bff); transition: width 0.25s ease; }
      .rmg-progress-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; }
      .rmg-progress-foot span { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; color: rgba(255,255,255,0.62); }
      .rmg-reset { border: 1px solid rgba(255,255,255,0.32); background: none; color: rgba(255,255,255,0.82); border-radius: 999px; min-height: 44px; padding: 0 16px; font-family:inherit !important; font-size: 12px; cursor: pointer; }
      .rmg-reset:hover { color: #fff; border-color: rgba(255,255,255,0.7); }

      .rmg-panel { border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; background: #0a0a0a; overflow: hidden; }
      .rmg-toolbar { display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #0d0d0d; }
      .rmg-find { position: relative; flex: 0 1 240px; min-width: 150px; }
      .rmg-find span[aria-hidden] { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: rgba(255,255,255,0.6); pointer-events: none; }
      .rmg-find input { width: 100%; height: 44px; padding: 0 74px 0 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.24); background: #111; color: #fff; font-family:inherit !important; font-size: 13px; outline: none; }
      .rmg-find input::placeholder { color: rgba(255,255,255,0.6); }
      .rmg-find input:focus { border-color: #2f7bff; box-shadow: 0 0 0 3px rgba(47,123,255,0.2); }
      .rmg-find em { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; font-style: normal; color: rgba(255,255,255,0.62); }
      .rmg-chips { display: flex; flex-wrap: nowrap; gap: 6px; flex: 1 1 auto; min-width: 0; overflow-x: auto; scrollbar-width: none; }
      .rmg-chips::-webkit-scrollbar { display: none; }
      .rmg-chip { flex: 0 0 auto; white-space: nowrap; border: 1px solid rgba(255,255,255,0.26); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.8); border-radius: 999px; min-height: 44px; padding: 0 14px; font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; }
      .rmg-chip:hover { border-color: rgba(255,255,255,0.6); color: #fff; }
      .rmg-chip.is-active, .rmg-chip[aria-current="true"] { background: #fff; border-color: #fff; color: #0a0a0a; }
      .rmg-legendbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #0b0b0b; }
      .rmg-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-family:'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif !important; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.62); }
      .rmg-legend span { display: inline-flex; align-items: center; gap: 6px; }
      .rmg-swatch { width: 14px; height: 14px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.28); display: inline-block; flex: 0 0 auto; }
      .rmg-swatch-topic { background: #fff; }
      .rmg-swatch-sub { background: #101010; border-color: rgba(255,255,255,0.4); }
      .rmg-swatch-done { background: #0057DE; border: 2px solid #8fc0ff; }
      .rmg-swatch-learning { background: #0f2f66; border: 2px dashed #8fc0ff; }
      .rmg-swatch-skip { background: #141414; border: 2px dotted rgba(255,255,255,0.55); }
      .rmg-pan-hint { margin-left: auto; font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; color: rgba(255,255,255,0.5); }
      .rmg-zoom { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; flex: 0 0 auto; }
      .rmg-zoom button { min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.26); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.88); font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 13px; line-height: 1; cursor: pointer; }
      .rmg-zoom button:hover { border-color: rgba(255,255,255,0.6); color: #fff; }

      .rmg-canvas { overflow: auto; max-height: min(74vh, 860px); padding: 16px 12px 10px; background: #070707; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.28) transparent; overscroll-behavior: contain; cursor: grab; }
      .rmg-canvas.is-dragging { cursor: grabbing; }
      .rmg-canvas.is-expanded { max-height: none; }
      .rmg-svg { display: block; width: 100%; height: auto; font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; }
      .rmg-title-text { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 30px; fill: #fff; font-weight: 400; letter-spacing: -0.01em; }
      .rmg-section-label { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 21px; fill: rgba(255,255,255,0.88); font-weight: 400; }
      .rmg-section-outcome { fill: rgba(255,255,255,0.62); font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; }
      .rmg-node { cursor: pointer; }
      .rmg-node:focus { outline: none; }
      .rmg-node:focus rect { stroke: #2f7bff; stroke-width: 3; }
      .rmg-topic rect { transition: fill 0.15s ease; }
      .rmg-topic:hover rect { fill: #e8edf7; }
      .rmg-subtopic rect { transition: fill 0.15s ease, stroke 0.15s ease; }
      .rmg-subtopic:hover rect { fill: #171717; stroke: rgba(255,255,255,0.55); }
      .rmg-topic text { fill: #0a0a0a; }
      .rmg-subtopic text { fill: #e6e6e6; }
      .rmg-button text { fill: #0a0a0a; font-weight: 500; }
      .rmg-button:hover rect { fill: #0057DE; stroke: #0057DE; }
      .rmg-button:hover text { fill: #fff; }
      .rmg-node text { pointer-events: none; }
      .rmg-node.is-match rect { stroke: #2f7bff; stroke-width: 3.5; }
      .rmg-node.is-dim { opacity: 0.16; }
      .rmg-node[data-status="done"] rect { fill: #0057DE; stroke: #8fc0ff; stroke-width: 3; stroke-dasharray: none; }
      .rmg-node[data-status="done"] text { fill: #fff; }
      .rmg-node[data-status="learning"] rect { fill: #0f2f66; stroke: #8fc0ff; stroke-width: 2.5; stroke-dasharray: 6 4; }
      .rmg-node[data-status="learning"] text { fill: #dce9ff; }
      .rmg-node[data-status="skip"] rect { fill: #141414; stroke: rgba(255,255,255,0.4); stroke-width: 2; stroke-dasharray: 2 5; }
      .rmg-node[data-status="skip"] text { fill: rgba(255,255,255,0.62); text-decoration: line-through; }

      .rmg-list { display: none; list-style: none; padding: 4px 16px 18px; background: #0a0a0a; }
      .rmg-list-phase { padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .rmg-list-phase:last-child { border-bottom: 0; }
      .rmg-list-phase-head { display: flex; align-items: center; gap: 10px; min-height: 44px; margin-bottom: 6px; cursor: pointer; }
      .rmg-list-phase-head::after { content: '▾'; margin-left: 2px; font-size: 12px; color: rgba(255,255,255,0.6); }
      .rmg-list-phase.is-collapsed .rmg-list-phase-head::after { content: '▸'; }
      .rmg-list-phase.is-collapsed .rmg-list-topics { display: none; }
      .rmg-list-num { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; color: #2f7bff; }
      .rmg-list-phase-head h3 { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 18px; font-weight: 400; letter-spacing: -0.01em; color: #fff; }
      .rmg-list-count { margin-left: auto; font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; color: rgba(255,255,255,0.62); }
      .rmg-list-outcome { margin: 0 0 10px; font-size: 12.5px; line-height: 1.6; color: rgba(255,255,255,0.62); }
      .rmg-list-topics { list-style: none; display: grid; gap: 8px; }
      .rmg-list-topic { width: 100%; text-align: left; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid #fff; background: #fff; color: #0a0a0a; font-family:inherit !important; font-size: 14.5px; font-weight: 600; cursor: pointer; }
      .rmg-list-topic[data-status="done"], .rmg-list-sub[data-status="done"] { background: #0057DE; border: 3px solid #8fc0ff; color: #fff; }
      .rmg-list-topic[data-status="learning"], .rmg-list-sub[data-status="learning"] { background: #0f2f66; border: 2px dashed #8fc0ff; color: #dce9ff; }
      .rmg-list-topic[data-status="skip"], .rmg-list-sub[data-status="skip"] { background: #141414; border: 2px dotted rgba(255,255,255,0.55); color: rgba(255,255,255,0.62); text-decoration: line-through; }
      .rmg-list-subs { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 7px; }
      .rmg-list-sub { min-height: 44px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.24); background: #141414; color: #e6e6e6; font-family:inherit !important; font-size: 13px; cursor: pointer; }

      .rmg-note { margin-top: 12px; font-family:'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif !important; font-size: 11px; line-height: 1.6; color: rgba(255,255,255,0.62); }
      .rmg-note kbd { border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 0 4px; font-family:\'DM Mono\', ui-monospace, SFMono-Regular, Menlo, monospace !important; }
      .rmg-note-mobile { display: none; }
      .rmg-related-mobile { display: none; gap: 8px; padding: 4px 14px 18px; background: #0a0a0a; }
      .rmg-related-mobile a { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 44px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.88); text-decoration: none; font-size: 13px; }
      .rmg-related-mobile a:hover { border-color: rgba(47,123,255,0.7); color: #fff; }

      .rmg-drawer[hidden] { display: none; }
      .rmg-drawer { position: fixed; inset: 0; z-index: 120; }
      .rmg-drawer-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.62); backdrop-filter: blur(3px); }
      .rmg-drawer-panel { position: absolute; top: 0; right: 0; height: 100%; width: min(600px, 100%); display: flex; flex-direction: column; background: #000000; border-left: 1px solid rgba(255,255,255,0.12); box-shadow: -24px 0 60px rgba(0,0,0,0.55); overflow-y: auto; }
      .rmg-drawer-head { position: sticky; top: 0; z-index: 2; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 24px 24px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #000000; }
      .rmg-drawer-kicker { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #2f7bff; margin-bottom: 8px; }
      .rmg-drawer-title { font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; font-size: clamp(24px, 3.4vw, 32px); font-weight: 400; letter-spacing: -0.01em; line-height: 1.1; }
      .rmg-drawer-phase { margin-top: 8px; font-size: 12.5px; color: rgba(255,255,255,0.62); }
      .rmg-drawer-close { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); background: none; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
      .rmg-drawer-close:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.7); }
      .rmg-drawer-body { padding: 22px 24px 34px; display: grid; gap: 22px; }
      .rmg-drawer-summary { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.78); }
      .rmg-status { display: flex; flex-wrap: wrap; gap: 8px; }
      .rmg-status button { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.03); color: #fff; font-family:inherit !important; font-size: 13px; font-weight: 500; }
      .rmg-status button:hover { border-color: rgba(255,255,255,0.7); }
      .rmg-status button.is-active[data-status="learning"] { background: #0f2f66; border: 2px dashed #8fc0ff; color: #dce9ff; }
      .rmg-status button.is-active[data-status="done"] { background: #0057DE; border: 3px solid #8fc0ff; color: #fff; }
      .rmg-status button.is-active[data-status="skip"] { background: #141414; border: 2px dotted rgba(255,255,255,0.55); color: rgba(255,255,255,0.72); }
      .rmg-status kbd { border: 1px solid currentColor; border-radius: 4px; padding: 0 4px; font-family:'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace !important; font-size: 10px; opacity: 0.75; }
      .rmg-drawer-block h3 { font-size: 11px; font-family:\'Inter\', system-ui, -apple-system, \'Segoe UI\', sans-serif !important; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.62); margin-bottom: 10px; }
      .rmg-drawer-block ul { list-style: none; display: grid; gap: 8px; }
      .rmg-drawer-block li { position: relative; padding-left: 18px; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.74); }
      .rmg-drawer-block li::before { content: ""; position: absolute; left: 2px; top: 0.58em; width: 7px; height: 7px; border-radius: 2px; background: #2f7bff; }
      .rmg-drawer-links { display: grid; gap: 8px; }
      .rmg-drawer-links a { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 44px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.02); font-size: 13px; color: rgba(255,255,255,0.88); }
      .rmg-drawer-links a:hover { border-color: rgba(47,123,255,0.7); background: rgba(47,123,255,0.06); color: #fff; }
      .rmg-drawer-nav { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
      .rmg-drawer-nav button { min-height: 44px; padding: 0 16px; border: 1px solid rgba(255,255,255,0.3); background: none; color: rgba(255,255,255,0.82); border-radius: 999px; font-family:inherit !important; font-size: 13px; cursor: pointer; }
      .rmg-drawer-nav button:hover { color: #fff; border-color: rgba(255,255,255,0.7); }
      .rmg-drawer-nav button[disabled] { opacity: 0.4; cursor: not-allowed; }

      @media (max-width: 900px) {
        .rmg-head { grid-template-columns: 1fr; align-items: start; }
        .rmg-progress { max-width: 420px; }
      }
      @media (max-width: 767px) {
        .rmg-band { padding: 32px 16px 30px; }
        .rmg-canvas { display: none; }
        .rmg-list { display: block; }
        .rmg-toolbar { flex-wrap: wrap; padding: 10px 12px; }
        .rmg-find { flex: 1 1 100%; min-width: 0; }
        .rmg-chips { display: none; }
        .rmg-zoom { display: none; }
        .rmg-legendbar { padding: 10px 14px; }
        .rmg-legend { font-size: 11px; gap: 8px 14px; }
        .rmg-pan-hint { display: none; }
        .rmg-note-desktop { display: none; }
        .rmg-note-mobile { display: inline; }
        .rmg-related-mobile { display: grid; }
        .rmg-drawer-panel { width: 100%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .rmg-bar span, .rmg-topic rect, .rmg-subtopic rect { transition: none; }
      }
`;

export const GRAPH_SCRIPT = `
      (function () {
        var dataEl = document.getElementById('rmg-data');
        if (!dataEl) return;
        var payload;
        try { payload = JSON.parse(dataEl.textContent); } catch (e) { return; }
        var slug = payload.slug || 'roadmap';
        var byId = {};
        payload.topics.forEach(function (t) { byId[t.id] = t; });
        var order = payload.topics.map(function (t) { return t.id; });
        var phases = payload.phases || [];
        var phaseIds = {};
        payload.topics.forEach(function (t) {
          if (!phaseIds[t.phase]) phaseIds[t.phase] = [];
          phaseIds[t.phase].push(t.id);
        });

        var STORE = 'tcc.roadmapProgress.v1';
        function readAll() {
          try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; }
        }
        function writeAll(v) {
          try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {}
        }
        var state = readAll()[slug] || {};
        if (typeof state !== 'object' || Array.isArray(state)) state = {};

        var total = payload.topics.length;
        var doneEl = document.getElementById('rmg-done');
        var barEl = document.getElementById('rmg-bar-fill');
        var barWrap = document.querySelector('.rmg-bar');
        var noteEl = document.getElementById('rmg-progress-note');
        var resetEl = document.getElementById('rmg-reset');
        var nodes = Array.prototype.slice.call(document.querySelectorAll('.rmg-node[data-node-id]'));
        var listButtons = Array.prototype.slice.call(document.querySelectorAll('.rmg-list-topic, .rmg-list-sub'));
        Array.prototype.forEach.call(document.querySelectorAll('.rmg-list-phase-head'), function (head) {
          head.setAttribute('role', 'button');
          head.setAttribute('tabindex', '0');
          head.setAttribute('aria-expanded', 'true');
          function togglePhase() {
            var collapsed = head.parentNode.classList.toggle('is-collapsed');
            head.setAttribute('aria-expanded', String(!collapsed));
          }
          head.addEventListener('click', togglePhase);
          head.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePhase(); }
          });
        });

        function doneCount() {
          return Object.keys(state).filter(function (k) { return state[k] === 'done'; }).length;
        }
        function learningCount() {
          return Object.keys(state).filter(function (k) { return state[k] === 'learning'; }).length;
        }
        function paintProgress() {
          var done = doneCount();
          var learning = learningCount();
          var pct = total ? Math.round((done / total) * 100) : 0;
          if (doneEl) doneEl.textContent = String(done);
          if (barEl) barEl.style.width = pct + '%';
          if (barWrap) barWrap.setAttribute('aria-valuenow', String(pct));
          if (noteEl) {
            if (!done && !learning) noteEl.textContent = 'Nothing marked yet';
            else noteEl.textContent = done + ' done · ' + learning + ' learning · ' + pct + '%';
          }
          phases.forEach(function (p, pi) {
            var ids = phaseIds[p.title] || [];
            var d = ids.filter(function (id) { return state[id] === 'done'; }).length;
            var el = document.querySelector('[data-phase-count="' + (pi + 1) + '"]');
            if (el) el.textContent = d + '/' + ids.length;
          });
        }
        function paintNodes() {
          nodes.forEach(function (n) {
            var id = n.getAttribute('data-node-id');
            var status = state[id];
            if (status) n.setAttribute('data-status', status);
            else n.removeAttribute('data-status');
          });
          listButtons.forEach(function (b) {
            var id = b.getAttribute('data-node-id');
            var status = state[id];
            if (status) b.setAttribute('data-status', status);
            else b.removeAttribute('data-status');
          });
        }
        function save() {
          var all = readAll();
          if (Object.keys(state).length) all[slug] = state;
          else delete all[slug];
          writeAll(all);
          paintNodes();
          paintProgress();
          if (openId) paintStatusButtons(openId);
        }

        // ---- drawer ----
        var drawer = document.getElementById('rmg-drawer');
        var backdrop = document.getElementById('rmg-backdrop');
        var closeBtn = document.getElementById('rmg-drawer-close');
        var titleEl = document.getElementById('rmg-drawer-title');
        var kickerEl = document.getElementById('rmg-drawer-kicker');
        var phaseEl = document.getElementById('rmg-drawer-phase');
        var summaryEl = document.getElementById('rmg-drawer-summary');
        var bulletsEl = document.getElementById('rmg-drawer-bullets');
        var relatedEl = document.getElementById('rmg-drawer-related');
        var statusBtns = Array.prototype.slice.call(document.querySelectorAll('.rmg-status button'));
        var openId = null;
        var lastFocus = null;

        function bulletsFor(topic) {
          if (topic.subs && topic.subs.length) {
            return topic.subs.map(function (s) { return s.label; });
          }
          if (topic.parent) {
            var parent = byId[topic.parentId];
            var siblings = parent && parent.subs ? parent.subs.filter(function (s) { return s.id !== topic.id; }) : [];
            return [
              'Connect it back to ' + topic.parent + '.',
              'Explain it out loud in two sentences.',
              siblings.length ? 'Compare it with ' + siblings.map(function (s) { return s.label; }).join(' and ') + '.' : 'Use it in a small exercise today.'
            ];
          }
          return ['Read the core idea, then apply it in a small exercise.', 'Write down one question you still have.'];
        }
        function summaryFor(topic) {
          if (topic.summary) return topic.summary;
          if (topic.parent) {
            return topic.label + ' is a working part of ' + topic.parent + ' in the ' + payload.title + ' roadmap. Get comfortable using it in context before moving on.';
          }
          var subs = (topic.subs || []).map(function (s) { return s.label; });
          return topic.label + ' is a core part of the ' + payload.title + ' path. Work through ' + (subs.length ? subs.join(', ') : 'the fundamentals') + ', then prove it with a small build.';
        }
        function paintStatusButtons(id) {
          var status = state[id];
          statusBtns.forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-status') === status);
            b.setAttribute('aria-pressed', String(b.getAttribute('data-status') === status));
          });
        }
        function expandFor(id) {
          var topic = byId[id];
          if (!topic) return;
          var idx = -1;
          phases.forEach(function (p, i) { if (p.title === topic.phase) idx = i; });
          if (idx < 0) return;
          var li = document.querySelectorAll('.rmg-list-phase')[idx];
          if (!li) return;
          li.classList.remove('is-collapsed');
          var head = li.querySelector('.rmg-list-phase-head');
          if (head) head.setAttribute('aria-expanded', 'true');
        }
        function paintNav() {
          var i = order.indexOf(openId);
          if (prevBtn) prevBtn.disabled = i <= 0;
          if (nextBtn) nextBtn.disabled = i < 0 || i >= order.length - 1;
        }
        function openTopic(id, pushHash) {
          var topic = byId[id];
          if (!topic) return;
          openId = id;
          expandFor(id);
          lastFocus = document.activeElement;
          kickerEl.textContent = topic.parent ? 'Subtopic · ' + topic.parent : 'Topic';
          titleEl.textContent = topic.label;
          phaseEl.textContent = topic.phase || '';
          summaryEl.textContent = summaryFor(topic);
          bulletsEl.innerHTML = '';
          bulletsFor(topic).forEach(function (b) {
            var li = document.createElement('li');
            li.textContent = b;
            bulletsEl.appendChild(li);
          });
          relatedEl.innerHTML = '<a href="/roadmaps/">All roadmaps <span aria-hidden="true">&rarr;</span></a><a href="#roadmap-map">Back to the map <span aria-hidden="true">&uarr;</span></a>';
          paintStatusButtons(id);
          paintNav();
          drawer.hidden = false;
          document.body.style.overflow = 'hidden';
          if (pushHash !== false) {
            try { history.replaceState(null, '', '#topic-' + id); } catch (e) {}
          }
          closeBtn.focus();
        }
        function closeDrawer(skipHash) {
          drawer.hidden = true;
          document.body.style.overflow = '';
          openId = null;
          if (!skipHash) {
            try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
          }
          if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        function toggleStatus(status) {
          if (!openId) return;
          if (state[openId] === status) delete state[openId];
          else state[openId] = status;
          save();
        }
        function stepNode(dir) {
          if (!openId) return;
          var i = order.indexOf(openId);
          if (i === -1) return;
          var next = order[i + dir];
          if (!next) return;
          openTopic(next);
        }

        function openFromEvent(e) {
          var target = e.target.closest ? e.target.closest('[data-node-id]') : null;
          if (!target) return;
          e.preventDefault();
          openTopic(target.getAttribute('data-node-id'));
        }
        document.addEventListener('click', function (e) {
          var target = e.target.closest ? e.target.closest('.rmg-node[data-node-id], .rmg-list-topic, .rmg-list-sub') : null;
          if (target) openFromEvent(e);
        });
        document.addEventListener('keydown', function (e) {
          var node = e.target.closest ? e.target.closest('.rmg-node[data-node-id]') : null;
          if (node && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openTopic(node.getAttribute('data-node-id'));
            return;
          }
          if (drawer.hidden) return;
          var k = e.key.toLowerCase();
          if (k === 'tab') {
            var panel = document.querySelector('.rmg-drawer-panel');
            var f = panel ? panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') : [];
            f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            return;
          }
          if (k === 'escape') { e.preventDefault(); closeDrawer(); }
          else if (k === 'l') { e.preventDefault(); toggleStatus('learning'); }
          else if (k === 'd') { e.preventDefault(); toggleStatus('done'); }
          else if (k === 's') { e.preventDefault(); toggleStatus('skip'); }
          else if (k === 'arrowright') { e.preventDefault(); stepNode(1); }
          else if (k === 'arrowleft') { e.preventDefault(); stepNode(-1); }
        });
        closeBtn.addEventListener('click', function () { closeDrawer(); });
        backdrop.addEventListener('click', function () { closeDrawer(); });
        statusBtns.forEach(function (b) {
          b.addEventListener('click', function () { toggleStatus(b.getAttribute('data-status')); });
        });
        var prevBtn = document.getElementById('rmg-prev');
        var nextBtn = document.getElementById('rmg-next');
        if (prevBtn) prevBtn.addEventListener('click', function () { stepNode(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { stepNode(1); });
        if (resetEl) resetEl.addEventListener('click', function () {
          if (!Object.keys(state).length) return;
          if (!window.confirm('Reset all progress on this roadmap?')) return;
          state = {};
          save();
        });

        // ---- filter ----
        var filter = document.getElementById('rmg-filter');
        var matchCountEl = document.getElementById('rmg-match-count');
        var canvas = document.getElementById('rmg-canvas');
        function applyFilter() {
          var q = (filter ? filter.value : '').trim().toLowerCase();
          var matches = 0;
          nodes.forEach(function (n) {
            var label = (n.getAttribute('data-title') || '').toLowerCase();
            var match = !q || label.indexOf(q) !== -1;
            n.classList.toggle('is-dim', !!q && !match);
            n.classList.toggle('is-match', !!q && match);
            if (q && match) matches++;
          });
          listButtons.forEach(function (b) {
            var match = !q || (b.textContent || '').toLowerCase().indexOf(q) !== -1;
            b.style.opacity = q && !match ? '0.3' : '';
          });
          if (matchCountEl) matchCountEl.textContent = q ? matches + ' match' + (matches === 1 ? '' : 'es') : '';
          return matches;
        }
        function firstMatch() {
          var q = (filter ? filter.value : '').trim().toLowerCase();
          if (!q) return null;
          for (var i = 0; i < nodes.length; i++) {
            var label = (nodes[i].getAttribute('data-title') || '').toLowerCase();
            if (label.indexOf(q) !== -1) return nodes[i];
          }
          return null;
        }
        function revealNode(n) {
          if (!n || !canvas) return;
          var nr = n.getBoundingClientRect();
          var cr = canvas.getBoundingClientRect();
          var inside = nr.top >= cr.top && nr.bottom <= cr.bottom && nr.left >= cr.left && nr.right <= cr.right;
          if (inside) return;
          canvas.scrollTo({
            top: canvas.scrollTop + (nr.top - cr.top) - cr.height / 2 + nr.height / 2,
            left: canvas.scrollLeft + (nr.left - cr.left) - cr.width / 2 + nr.width / 2,
            behavior: 'smooth'
          });
        }
        if (filter) {
          filter.addEventListener('input', applyFilter);
          filter.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            applyFilter();
            var n = firstMatch();
            if (!n) return;
            revealNode(n);
            openTopic(n.getAttribute('data-node-id'));
          });
        }

        // ---- phase chips + scroll spy ----
        var chips = Array.prototype.slice.call(document.querySelectorAll('.rmg-chip'));
        function phaseSections() {
          return chips.map(function (c) {
            return document.getElementById('rmg-phase-' + c.getAttribute('data-phase'));
          });
        }
        function setActiveChip(index) {
          chips.forEach(function (c, i) {
            c.classList.toggle('is-active', i === index);
            if (i === index) c.setAttribute('aria-current', 'true');
            else c.removeAttribute('aria-current');
          });
        }
        function scrollToPhase(index) {
          if (!canvas) return;
          var sec = document.getElementById('rmg-phase-' + index);
          if (!sec) return;
          var cr = canvas.getBoundingClientRect();
          var sr = sec.getBoundingClientRect();
          canvas.scrollTo({
            top: canvas.scrollTop + (sr.top - cr.top) - 24,
            left: canvas.scrollLeft + (sr.left - cr.left) - 24,
            behavior: 'smooth'
          });
        }
        chips.forEach(function (c, i) {
          c.addEventListener('click', function () { scrollToPhase(i + 1); });
        });
        var spyTick = false;
        function spy() {
          spyTick = false;
          if (!canvas) return;
          var cr = canvas.getBoundingClientRect();
          var secs = phaseSections();
          var active = 0;
          secs.forEach(function (s, i) {
            if (!s) return;
            var r = s.getBoundingClientRect();
            if (r.top - cr.top <= 90) active = i;
          });
          if (canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 4) active = chips.length - 1;
          setActiveChip(active);
        }
        if (canvas) {
          canvas.addEventListener('scroll', function () {
            if (spyTick) return;
            spyTick = true;
            window.requestAnimationFrame(spy);
          }, { passive: true });
          spy();
        }

        // ---- zoom + expand ----
        var svg = document.querySelector('.rmg-svg');
        var zoom = 1;
        var MIN_SVG_W = 900;
        function svgNaturalWidth() {
          if (!canvas) return MIN_SVG_W;
          var avail = Math.max(1, canvas.clientWidth - 24);
          return Math.max(avail, MIN_SVG_W);
        }
        function fitZoom() {
          if (!canvas) return 1;
          var avail = Math.max(1, canvas.clientWidth - 24);
          return Math.max(0.55, Math.min(1, avail / Math.max(avail, MIN_SVG_W)));
        }
        function applyZoom(next, anchor) {
          if (!svg || !canvas) return;
          var cr = canvas.getBoundingClientRect();
          var ax = anchor ? anchor.x - cr.left : cr.width / 2;
          var ay = anchor ? anchor.y - cr.top : cr.height / 2;
          var ratioX = (canvas.scrollLeft + ax) / Math.max(1, canvas.scrollWidth);
          var ratioY = (canvas.scrollTop + ay) / Math.max(1, canvas.scrollHeight);
          zoom = Math.max(0.55, Math.min(2.2, typeof next === 'number' ? next : zoom));
          svg.style.width = Math.round(svgNaturalWidth() * zoom) + 'px';
          window.requestAnimationFrame(function () {
            canvas.scrollLeft = ratioX * canvas.scrollWidth - ax;
            canvas.scrollTop = ratioY * canvas.scrollHeight - ay;
          });
        }
        var zin = document.getElementById('rmg-zoom-in');
        var zout = document.getElementById('rmg-zoom-out');
        var zfit = document.getElementById('rmg-zoom-fit');
        var expandBtn = document.getElementById('rmg-expand');
        if (zin) zin.addEventListener('click', function () { applyZoom(zoom + 0.15); });
        if (zout) zout.addEventListener('click', function () { applyZoom(zoom - 0.15); });
        if (zfit) zfit.addEventListener('click', function () { applyZoom(fitZoom()); });
        if (expandBtn && canvas) {
          expandBtn.addEventListener('click', function () {
            var open = canvas.classList.toggle('is-expanded');
            expandBtn.textContent = open ? 'Collapse' : 'Expand';
            expandBtn.setAttribute('aria-pressed', String(open));
          });
        }

        // ---- pan + pinch/ctrl zoom ----
        if (canvas) {
          var dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
          canvas.addEventListener('pointerdown', function (e) {
            if (e.target.closest && e.target.closest('.rmg-node')) return;
            dragging = true; sx = e.clientX; sy = e.clientY; sl = canvas.scrollLeft; st = canvas.scrollTop;
            canvas.classList.add('is-dragging');
            if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
          });
          canvas.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            canvas.scrollLeft = sl - (e.clientX - sx);
            canvas.scrollTop = st - (e.clientY - sy);
          });
          function stopPan() { dragging = false; canvas.classList.remove('is-dragging'); }
          canvas.addEventListener('pointerup', stopPan);
          canvas.addEventListener('pointercancel', stopPan);
          canvas.addEventListener('wheel', function (e) {
            if (!(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            applyZoom(zoom + (e.deltaY < 0 ? 0.1 : -0.1), { x: e.clientX, y: e.clientY });
          }, { passive: false });
        }

        // ---- keyboard node navigation ----
        document.addEventListener('keydown', function (e) {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) === -1) return;
          if (!drawer.hidden) return;
          var cur = e.target && e.target.closest ? e.target.closest('.rmg-node[data-node-id]') : null;
          if (!cur) return;
          e.preventDefault();
          var cr = cur.getBoundingClientRect();
          var cx = cr.left + cr.width / 2;
          var cy = cr.top + cr.height / 2;
          var best = null;
          var bestScore = Infinity;
          nodes.forEach(function (n) {
            if (n === cur) return;
            var r = n.getBoundingClientRect();
            var nx = r.left + r.width / 2;
            var ny = r.top + r.height / 2;
            var dx = nx - cx;
            var dy = ny - cy;
            var ok = (e.key === 'ArrowRight' && dx > 8) || (e.key === 'ArrowLeft' && dx < -8) || (e.key === 'ArrowDown' && dy > 8) || (e.key === 'ArrowUp' && dy < -8);
            if (!ok) return;
            var primary = (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ? Math.abs(dx) : Math.abs(dy);
            var secondary = (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ? Math.abs(dy) : Math.abs(dx);
            var score = primary + secondary * 2.2;
            if (score < bestScore) { bestScore = score; best = n; }
          });
          if (best) {
            best.focus();
            revealNode(best);
          }
        });

        // ---- deep link ----
        function openHash() {
          var h = location.hash || '';
          if (h.indexOf('#topic-') === 0) {
            var id = h.slice(7);
            if (byId[id]) openTopic(id, false);
          } else if (!drawer.hidden) {
            closeDrawer(true);
          }
        }
        window.addEventListener('hashchange', openHash);
        var zoomTick = false;
        window.addEventListener('resize', function () {
          if (zoomTick) return;
          zoomTick = true;
          window.requestAnimationFrame(function () { zoomTick = false; applyZoom(zoom); });
        });

        paintNodes();
        paintProgress();
        applyZoom(1);
        openHash();
      })();
`;
