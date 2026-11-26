/* ============================================================================
 * TCC program + course roadmap trees.
 * Adds an interactive TCC tree diagram to every /domains/ program page
 * and every /domains/<program>/<course>/ page. Reads the page's own
 * #domains-data JSON, so every node reflects real TCC curriculum.
 * Self-contained: scoped CSS, no dependencies, safe to re-mount.
 * ==========================================================================*/
(function () {
  'use strict';

  var DATA_EL = document.getElementById('domains-data');
  if (!DATA_EL) return;
  var DATA;
  try { DATA = JSON.parse(DATA_EL.textContent); } catch (e) { return; }
  if (!Array.isArray(DATA) || !DATA.length) return;

  var SECTION_ID = 'tcc-program-roadmap';
  var STYLE_ID = 'tcc-program-roadmap-style';
  var FONT_ID = 'tcc-program-roadmap-font';
  var STORE = 'tcc.programProgress.v1';

  // TCC design tokens (dark shell, white type, #0057DE accent).
  var C = {
    canvas: '#070707',
    sectionFill: 'rgba(255,255,255,.02)',
    sectionStroke: 'rgba(255,255,255,.35)',
    topic: '#ffffff',
    topicInk: '#0a0a0a',
    subtopic: '#101010',
    subtopicInk: '#e6e6e6',
    subtopicStroke: 'rgba(255,255,255,.4)',
    button: '#ffffff',
    buttonInk: '#0a0a0a',
    edge: 'rgba(47,123,255,.85)',
    accent: '#0057DE',
    focus: '#2f7bff',
    ink: '#ffffff'
  };

  // Shared tree metrics — kept in sync with scripts/roadmap-graphs/lib.mjs so
  // program and roadmap diagrams read as one component.
  var TOPIC_W = 230;
  var SUB_W = 210;
  var TOPIC_BASE = 46;
  var SUB_BASE = 40;
  var TOPIC_LH = 20;
  var SUB_LH = 17;
  var TOPIC_FONT = 17;
  var SUB_FONT = 14.5;
  var SUB_GAP = 20;
  var ROW_GAP = 46;
  var PHASE_TOP = 84;
  var PHASE_BOTTOM = 58;
  var SECTION_HALF = 600;
  var MIN_SVG_W = 950;   // keeps topic and subtopic text >= ~11px at 100%
  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap';

  // ── utils ────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function clip(s, n) {
    s = String(s == null ? '' : s).trim();
    return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  }
  function pad2(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function round(n) { return Math.round(n * 100) / 100; }
  function slug(s) {
    return String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 54) || 'node';
  }
  function wrap(text, max, maxLines) {
    var words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var next = line ? line + ' ' + w : w;
      if (next.length <= max) { line = next; return; }
      if (line) lines.push(line);
      line = w;
    });
    if (line) lines.push(line);
    if (!lines.length) lines = [''];
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = clip(lines[maxLines - 1], max - 1);
    }
    return lines.map(function (l) { return clip(l, max + 2); });
  }
  function bezier(x1, y1, x2, y2) {
    var mid = (x1 + x2) / 2;
    return 'M' + round(x1) + ',' + round(y1) + ' C' + round(mid) + ',' + round(y1) + ' ' + round(mid) + ',' + round(y2) + ' ' + round(x2) + ',' + round(y2);
  }
  function textLines(cx, cy, lines, fs, lh) {
    var start = cy - ((lines.length - 1) * lh) / 2;
    var out = '<text x="' + round(cx) + '" y="' + round(start) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + fs + '">';
    lines.forEach(function (line, i) {
      out += '<tspan x="' + round(cx) + '" dy="' + (i === 0 ? 0 : lh) + '">' + esc(line) + '</tspan>';
    });
    return out + '</text>';
  }

  // ── data model ───────────────────────────────────────────────────────────
  var uidUsed = {};
  function uid(base) {
    var id = slug(base);
    if (uidUsed[id]) {
      var n = 2;
      while (uidUsed[id + '-' + n]) n++;
      id = id + '-' + n;
    }
    uidUsed[id] = true;
    return id;
  }
  function resetUid() { uidUsed = {}; }

  function deriveSubs(module) {
    var s = String(module || '');
    var parts = [];
    if (s.indexOf(':') !== -1) {
      var a = s.split(':');
      parts = [a[0], a.slice(1).join(':')];
    } else if (/\s&\s/.test(s)) {
      parts = s.split(/\s&\s/);
    } else if (s.indexOf(',') !== -1) {
      parts = s.split(',');
    } else if (/\swith\s/i.test(s)) {
      var b = s.split(/\swith\s/i);
      parts = [b[0], 'with ' + b.slice(1).join(' with ')];
    } else if (/\sfor\s/i.test(s)) {
      var c = s.split(/\sfor\s/i);
      parts = [c[0], 'for ' + c.slice(1).join(' for ')];
    } else if (/\sand\s/i.test(s)) {
      var d = s.split(/\sand\s/i);
      parts = [d[0], d.slice(1).join(' and ')];
    }
    if (parts.length < 2) parts = ['Core concepts', 'Hands-on practice'];
    return parts.slice(0, 2).map(function (p) { return clip(p.trim(), 34); });
  }

  function genericTopic(idBase, label, summary, subLabels, bullets) {
    var id = uid(idBase);
    return {
      id: id,
      kind: 'topic',
      label: label,
      meta: '',
      summary: summary,
      bullets: bullets || subLabels,
      subs: (subLabels || []).map(function (s, i) {
        return { id: uid(idBase + '-s' + i), kind: 'subtopic', label: s, summary: summary, bullets: [s], parent: label, parentId: id };
      })
    };
  }

  function courseTopic(domain, course) {
    var mods = course.modules || [];
    var picks = [];
    if (mods[0]) picks.push(mods[0]);
    var later = mods[Math.min(5, mods.length - 1)];
    if (later && later !== mods[0]) picks.push(later);
    if (!picks.length) picks = ['Core concepts', 'Hands-on practice'];
    var id = uid('course-' + course.id);
    return {
      id: id,
      kind: 'topic',
      label: course.title,
      meta: course.duration + ' · ' + course.level,
      summary: course.description + ' Runs ' + course.duration + ' at ' + String(course.level || '').toLowerCase() + ' level, with ' + mods.length + ' modules and a capstone project.',
      bullets: mods.slice(0, 4),
      href: '/domains/' + domain.id + '/' + course.id + '/',
      hrefLabel: 'Open ' + course.title,
      subs: picks.map(function (m, i) {
        return {
          id: uid('course-' + course.id + '-s' + i),
          kind: 'subtopic',
          label: m,
          summary: m + ' is part of ' + course.title + '. Get comfortable using it before the next module.',
          bullets: [m, 'Apply it in the course project.'],
          href: '/domains/' + domain.id + '/' + course.id + '/',
          hrefLabel: 'Open ' + course.title,
          parent: course.title,
          parentId: id
        };
      })
    };
  }

  function relatedDomains(domain) {
    var same = DATA.filter(function (d) { return d.id !== domain.id && d.category === domain.category; });
    var others = DATA.filter(function (d) { return d.id !== domain.id && d.category !== domain.category; });
    return same.concat(others).slice(0, 3).map(function (d) {
      return { title: d.name, href: '/domains/' + d.id + '/' };
    });
  }
  function relatedCourses(domain, course) {
    var list = domain.courses.filter(function (c) { return c.id !== course.id; }).slice(0, 2).map(function (c) {
      return { title: c.title, href: '/domains/' + domain.id + '/' + c.id + '/' };
    });
    list.push({ title: domain.name + ' program', href: '/domains/' + domain.id + '/' });
    return list.slice(0, 3);
  }

  function splitCourses(courses) {
    var n = courses.length;
    var f, c;
    if (n <= 3) { f = 1; c = 1; }
    else if (n === 4) { f = 1; c = 1; }
    else if (n === 5) { f = 1; c = 2; }
    else { f = 1; c = 2; }
    return {
      foundation: courses.slice(0, f),
      core: courses.slice(f, f + c),
      spec: courses.slice(f + c)
    };
  }

  function buildProgramModel(domain) {
    resetUid();
    var g = splitCourses(domain.courses || []);
    var phases = [];
    phases.push({
      title: 'Orientation',
      outcome: 'Get set up and see how the program fits together.',
      topics: [genericTopic('orientation', 'Program orientation',
        'Start with the shape of the ' + domain.name + ' program: how the courses connect, what you will build, and how to pace the work.',
        ['How the program works', 'Tools and setup'],
        ['Read the course sequence.', 'Set up your tools.', 'Book your first mentor check-in.'])]
    });
    if (g.foundation.length) {
      phases.push({ title: 'Foundations', outcome: 'Build the base every later course depends on.', topics: g.foundation.map(function (c) { return courseTopic(domain, c); }) });
    }
    if (g.core.length) {
      phases.push({ title: 'Core skills', outcome: 'Go deeper into the methods teams use day to day.', topics: g.core.map(function (c) { return courseTopic(domain, c); }) });
    }
    if (g.spec.length) {
      phases.push({ title: 'Specialisation', outcome: 'Choose the direction that matches the role you want.', topics: g.spec.map(function (c) { return courseTopic(domain, c); }) });
    }
    phases.push({
      title: 'Capstone & career',
      outcome: 'Turn the work into proof and get interview-ready.',
      topics: [
        genericTopic('capstone', 'Capstone project',
          'Combine the courses into one portfolio-grade build. Scope it small enough to finish, then document the decisions and results.',
          ['Portfolio build', 'Review rubric'],
          ['Pick a real problem.', 'Ship a working demo.', 'Write the case study.']),
        genericTopic('placement', 'Placement prep',
          'Practice the interviews and applications that turn the capstone into offers.',
          ['Mock interviews', 'Applications'],
          ['Run two mock rounds.', 'Tailor your resume.', 'Apply every week.'])
      ]
    });
    phases.forEach(function (p) {
      p.topics.forEach(function (t) {
        t.phase = p.title;
        t.subs.forEach(function (s) { s.phase = p.title; });
      });
    });
    return {
      kind: 'program',
      scope: 'program:' + domain.id,
      title: domain.name,
      eyebrow: 'Interactive program map',
      subtitle: 'A five-stage path through the ' + domain.name + ' program. Every course node links to its TCC course page.',
      phases: phases,
      related: relatedDomains(domain)
    };
  }

  function buildCourseModel(domain, course) {
    resetUid();
    var mods = course.modules || [];
    var moduleTopics = mods.map(function (m, i) {
      var id = uid('module-' + i);
      var subs = deriveSubs(m);
      return {
        id: id,
        kind: 'topic',
        label: m,
        meta: 'Module ' + (i + 1) + ' of ' + mods.length,
        summary: 'Module ' + (i + 1) + ' of ' + course.title + '. ' + m + '. Work through the concept, then apply it in the module exercise.',
        bullets: [m, 'Connect it to the course project.'],
        href: '/domains/' + domain.id + '/',
        hrefLabel: 'Open the ' + domain.name + ' program',
        subs: subs.map(function (s, j) {
          return {
            id: uid('module-' + i + '-s' + j),
            kind: 'subtopic',
            label: s,
            summary: 'Part of ' + m + '.',
            bullets: [s],
            href: '/domains/' + domain.id + '/',
            hrefLabel: 'Open the ' + domain.name + ' program',
            parent: m,
            parentId: id
          };
        })
      };
    });
    var major = course.majorProject || {};
    var capstone = {
      id: uid('capstone'),
      kind: 'topic',
      label: major.title || 'Capstone project',
      meta: 'Capstone',
      summary: major.description || 'Combine the modules into one portfolio-grade build and present it.',
      bullets: (major.tech || []).slice(0, 4),
      href: '/domains/' + domain.id + '/',
      hrefLabel: 'Open the ' + domain.name + ' program',
      subs: ['Build & document', 'Present & review'].map(function (s, i) {
        return {
          id: uid('capstone-s' + i),
          kind: 'subtopic',
          label: s,
          summary: 'Finish the course with a working build and a clear walkthrough.',
          bullets: [s],
          href: '/domains/' + domain.id + '/',
          hrefLabel: 'Open the ' + domain.name + ' program',
          parent: major.title || 'Capstone project',
          parentId: 'capstone'
        };
      })
    };
    var phases = [
      { title: 'Foundations', outcome: 'Core ideas and vocabulary.', topics: moduleTopics.slice(0, 2) },
      { title: 'Core skills', outcome: 'The methods you will use most.', topics: moduleTopics.slice(2, 4) },
      { title: 'Advanced', outcome: 'Harder patterns and real constraints.', topics: moduleTopics.slice(4, 6) },
      { title: 'Production & capstone', outcome: 'Ship it, then prove it.', topics: moduleTopics.slice(6, 8).concat([capstone]) }
    ].filter(function (p) { return p.topics.length; });
    phases.forEach(function (p) {
      p.topics.forEach(function (t) {
        t.phase = p.title;
        t.subs.forEach(function (s) { s.phase = p.title; });
      });
    });
    return {
      kind: 'course',
      scope: 'course:' + domain.id + '/' + course.id,
      title: course.title,
      eyebrow: 'Interactive course map',
      subtitle: 'The full ' + course.title + ' path, module by module. Every node opens a study note with the module detail.',
      phases: phases,
      related: relatedCourses(domain, course)
    };
  }

  function buildOverviewModel() {
    resetUid();
    var cats = [];
    DATA.forEach(function (d) {
      if (cats.indexOf(d.category) === -1) cats.push(d.category);
    });
    var order = ['Engineering', 'Management', 'Creative', 'Specialized'];
    cats.sort(function (a, b) {
      var ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    var phases = cats.map(function (cat) {
      var topics = DATA.filter(function (d) { return d.category === cat; }).map(function (d) {
        var id = uid('domain-' + d.id);
        var picks = (d.courses || []).slice(0, 2).map(function (c) { return c.title; });
        if (picks.length < 2) picks.push(d.short + ' foundations');
        return {
          id: id,
          kind: 'topic',
          label: d.name,
          meta: d.courses.length + ' courses',
          summary: d.description + ' ' + d.courses.length + ' courses in this program.',
          bullets: (d.courses || []).map(function (c) { return c.title; }).slice(0, 4),
          href: '/domains/' + d.id + '/',
          hrefLabel: 'Open the ' + d.name + ' program',
          subs: picks.map(function (t, i) {
            return {
              id: uid('domain-' + d.id + '-s' + i),
              kind: 'subtopic',
              label: t,
              summary: t + ' is one of the courses in ' + d.name + '.',
              bullets: [t],
              href: '/domains/' + d.id + '/',
              hrefLabel: 'Open the ' + d.name + ' program',
              parent: d.name,
              parentId: id
            };
          })
        };
      });
      topics.forEach(function (t) {
        t.phase = cat;
        t.subs.forEach(function (s) { s.phase = cat; });
      });
      return { title: cat, outcome: 'Programs in the ' + cat.toLowerCase() + ' track.', topics: topics };
    }).filter(function (p) { return p.topics.length; });
    return {
      kind: 'overview',
      scope: 'overview',
      title: 'All TCC programs',
      heading: 'The TCC program map',
      eyebrow: 'Interactive program map',
      subtitle: 'Every TCC program on one map. Open a program to see its course-level tree.',
      phases: phases,
      related: []
    };
  }

  // ── layout ───────────────────────────────────────────────────────────────
  function layoutModel(model) {
    var nodes = [];
    var edges = [];
    var sections = [];
    var titleLines = wrap(model.title, 32, 2);
    var titleStep = 34;
    var titleH = (titleLines.length - 1) * titleStep;
    var y = titleH + 64;
    var spineStart = y - 26;

    model.phases.forEach(function (phase, pi) {
      var sectionTop = y;
      y = sectionTop + PHASE_TOP;
      phase.topics.forEach(function (t, ti) {
        var side = ti % 2 === 0 ? 1 : -1;
        var topicX = 180 * side;
        var tLines = wrap(t.label, 26, 3);
        var tH = TOPIC_BASE + (tLines.length - 1) * TOPIC_LH;
        var subLayouts = (t.subs || []).map(function (s) {
          var lines = wrap(s.label, 28, 3);
          return { lines: lines, h: SUB_BASE + (lines.length - 1) * SUB_LH };
        });
        var subTotal = subLayouts.reduce(function (a, s) { return a + s.h; }, 0) + Math.max(0, subLayouts.length - 1) * SUB_GAP;
        var rowH = Math.max(tH, subTotal);
        var cy = y + rowH / 2;

        nodes.push({
          kind: 'topic', id: t.id, label: t.label, lines: tLines, meta: t.meta,
          summary: t.summary, bullets: t.bullets, href: t.href, hrefLabel: t.hrefLabel,
          phase: phase.title, phaseIndex: pi, x: topicX, y: cy, w: TOPIC_W, h: tH, side: side
        });
        edges.push({ d: bezier(0, cy, topicX - (TOPIC_W / 2) * side, cy) });

        var subY = cy - subTotal / 2;
        (t.subs || []).forEach(function (s, si) {
          var sl = subLayouts[si];
          var sCy = subY + sl.h / 2;
          var subX = 450 * side;
          nodes.push({
            kind: 'subtopic', id: s.id, label: s.label, lines: sl.lines, summary: s.summary,
            bullets: s.bullets, href: s.href, hrefLabel: s.hrefLabel, phase: phase.title, phaseIndex: pi,
            parent: t.label, parentId: t.id, x: subX, y: sCy, w: SUB_W, h: sl.h, side: side
          });
          var outerX = topicX + (TOPIC_W / 2) * side;
          var subInnerX = subX - (SUB_W / 2) * side;
          edges.push({ d: bezier(outerX, cy, subInnerX, sCy) });
          subY += sl.h + SUB_GAP;
        });

        y += rowH + ROW_GAP;
      });
      var sectionBottom = y - ROW_GAP + PHASE_BOTTOM;
      sections.push({
        x: -SECTION_HALF, y: sectionTop, w: SECTION_HALF * 2, h: sectionBottom - sectionTop,
        title: phase.title, outcome: phase.outcome, index: pi + 1
      });
      y = sectionBottom + 34;
    });

    var spineEnd = y - 50;
    edges.unshift({ d: 'M0,' + round(spineStart) + ' L0,' + round(spineEnd) });

    var relatedStart = y + 6;
    var rows = Math.ceil((model.related || []).length / 3);
    var relatedH = rows ? rows * 68 + 64 : 0;
    var totalH = y + relatedH + 30;

    return {
      nodes: nodes,
      edges: edges,
      sections: sections,
      titleLines: titleLines,
      titleStep: titleStep,
      relatedStart: relatedStart,
      relatedH: relatedH,
      height: totalH,
      viewBox: (-SECTION_HALF - 20) + ' -40 ' + (SECTION_HALF * 2 + 40) + ' ' + (totalH + 60)
    };
  }

  // ── render ───────────────────────────────────────────────────────────────
  function renderSVG(model, L) {
    var parts = [];
    parts.push('<svg class="tpr-svg" viewBox="' + L.viewBox + '" role="group" aria-labelledby="tpr-svg-title tpr-svg-desc" preserveAspectRatio="xMidYMin meet">');
    parts.push('<title id="tpr-svg-title">Interactive map: ' + esc(model.title) + '</title>');
    parts.push('<desc id="tpr-svg-desc">Interactive tree diagram of the ' + esc(model.title) + ' path. Every node opens a TCC study note.</desc>');

    L.sections.forEach(function (s, i) {
      parts.push('<g class="tpr-section" id="tpr-phase-' + (i + 1) + '" data-phase-index="' + (i + 1) + '">');
      parts.push('<rect x="' + round(s.x) + '" y="' + round(s.y) + '" width="' + round(s.w) + '" height="' + round(s.h) + '" rx="16" fill="' + C.sectionFill + '" stroke="' + C.sectionStroke + '" stroke-width="1.4"></rect>');
      parts.push('<text x="' + round(s.x + 26) + '" y="' + round(s.y + 38) + '" class="tpr-section-label" font-size="21">' + pad2(s.index) + '. ' + esc(s.title) + '</text>');
      if (s.outcome) parts.push('<text x="' + round(s.x + 26) + '" y="' + round(s.y + 60) + '" class="tpr-section-outcome" font-size="12.5">' + esc(clip(s.outcome, 112)) + '</text>');
      parts.push('</g>');
    });

    L.edges.forEach(function (e) {
      parts.push('<path d="' + e.d + '" fill="none" stroke="' + C.edge + '" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.8 7"></path>');
    });

    parts.push('<g class="tpr-title">');
    L.titleLines.forEach(function (line, i) {
      parts.push('<text x="0" y="' + round(i * L.titleStep) + '" text-anchor="middle" font-size="28" class="tpr-title-text">' + esc(line) + '</text>');
    });
    parts.push('</g>');

    L.nodes.forEach(function (n) {
      if (n.kind !== 'topic' && n.kind !== 'subtopic') return;
      var x = n.x - n.w / 2;
      var y = n.y - n.h / 2;
      var isTopic = n.kind === 'topic';
      parts.push('<g class="tpr-node ' + (isTopic ? 'tpr-topic' : 'tpr-subtopic') + '" data-node-id="' + esc(n.id) + '" data-node-type="' + n.kind + '" data-title="' + esc(n.label) + '" tabindex="0" role="button" aria-label="' + esc(n.label) + '. Open details">');
      parts.push('<rect x="' + round(x) + '" y="' + round(y) + '" width="' + n.w + '" height="' + round(n.h) + '" rx="8" fill="' + (isTopic ? C.topic : C.subtopic) + '" stroke="' + (isTopic ? '#ffffff' : C.subtopicStroke) + '" stroke-width="' + (isTopic ? '1.5' : '1.4') + '"></rect>');
      parts.push(textLines(n.x, n.y, n.lines, isTopic ? TOPIC_FONT : SUB_FONT, isTopic ? TOPIC_LH : SUB_LH));
      parts.push('</g>');
    });

    if (model.related && model.related.length) {
      parts.push('<g class="tpr-linksgroup">');
      parts.push('<rect x="' + (-SECTION_HALF) + '" y="' + round(L.relatedStart) + '" width="' + (SECTION_HALF * 2) + '" height="' + round(L.relatedH) + '" rx="16" fill="rgba(47,123,255,.04)" stroke="rgba(47,123,255,.35)" stroke-width="1.4" stroke-dasharray="5 5"></rect>');
      parts.push('<text x="' + (-SECTION_HALF + 26) + '" y="' + round(L.relatedStart + 34) + '" font-size="21" class="tpr-section-label">Keep going: related TCC programs</text>');
      parts.push('</g>');
      model.related.forEach(function (r, i) {
        var col = i % 3;
        var row = Math.floor(i / 3);
        var cx = (col - 1) * 350;
        var cy = L.relatedStart + 78 + row * 68;
        parts.push('<a class="tpr-node tpr-button" href="' + esc(r.href) + '" aria-label="' + esc(r.title) + '">');
        parts.push('<rect x="' + round(cx - 160) + '" y="' + round(cy - 22) + '" width="320" height="44" rx="8" fill="' + C.button + '" stroke="' + C.button + '" stroke-width="1.5"></rect>');
        parts.push('<text x="' + round(cx) + '" y="' + round(cy) + '" text-anchor="middle" dominant-baseline="middle" font-size="14.5" fill="' + C.buttonInk + '">' + esc(clip(r.title, 40)) + '</text>');
        parts.push('</a>');
      });
    }

    parts.push('</svg>');
    return parts.join('');
  }

  function countPhase(p) {
    return p.topics.reduce(function (n, t) { return n + 1 + (t.subs || []).length; }, 0);
  }

  function stepperHTML(model) {
    return model.phases.map(function (p, pi) {
      var items = p.topics.map(function (t) {
        var subs = (t.subs || []).map(function (s) {
          return '<li><button type="button" class="tpr-step-sub" data-node-id="' + esc(s.id) + '">' + esc(s.label) + '</button></li>';
        }).join('');
        return '<li><button type="button" class="tpr-step-topic" data-node-id="' + esc(t.id) + '">' + esc(t.label) + '</button><ul class="tpr-step-subs">' + subs + '</ul></li>';
      }).join('');
      return '<details class="tpr-step" ' + (pi === 0 ? 'open' : '') + '>' +
        '<summary><span class="tpr-step-num">' + pad2(pi + 1) + '</span><span class="tpr-step-title">' + esc(p.title) + '</span><span class="tpr-step-count" data-phase-count="' + (pi + 1) + '">0/' + countPhase(p) + '</span></summary>' +
        (p.outcome ? '<p class="tpr-step-outcome">' + esc(p.outcome) + '</p>' : '') +
        '<ul class="tpr-step-topics">' + items + '</ul>' +
        '</details>';
    }).join('');
  }

  function sectionHTML(model, L) {
    var total = L.nodes.filter(function (n) { return n.kind === 'topic' || n.kind === 'subtopic'; }).length;
    var chips = model.phases.map(function (p, i) {
      return '<button type="button" class="tpr-chip" data-phase="' + (i + 1) + '">' + pad2(i + 1) + ' ' + esc(p.title) + '</button>';
    }).join('');
    return '<section id="' + SECTION_ID + '" class="tpr" aria-labelledby="tpr-heading">' +
      '<div class="tpr-in">' +
        '<div class="tpr-head">' +
          '<div>' +
            '<p class="tpr-eyebrow">' + esc(model.eyebrow) + '</p>' +
            '<h2 class="tpr-heading" id="tpr-heading">' + esc(model.heading || model.title + ' roadmap') + '</h2>' +
            '<p class="tpr-sub">' + esc(model.subtitle) + '</p>' +
          '</div>' +
          '<div class="tpr-progress" aria-live="polite">' +
            '<div class="tpr-progress-top"><span class="tpr-progress-label">Your progress</span><span class="tpr-progress-count"><strong id="tpr-done">0</strong> of ' + total + ' nodes</span></div>' +
            '<div class="tpr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Roadmap progress"><span id="tpr-bar-fill" style="width:0%"></span></div>' +
            '<div class="tpr-progress-foot"><span id="tpr-progress-note">Nothing marked yet</span><button type="button" class="tpr-reset" id="tpr-reset">Reset</button></div>' +
          '</div>' +
        '</div>' +
        '<div class="tpr-panel">' +
          '<div class="tpr-toolbar">' +
            '<label class="tpr-find"><span aria-hidden="true">&#8981;</span><span class="tpr-sr">Find a topic</span><input type="search" id="tpr-filter" placeholder="Find a topic in this map…" autocomplete="off" /><em id="tpr-match-count"></em></label>' +
            '<div class="tpr-chips" role="group" aria-label="Jump to a stage">' + chips + '</div>' +
            '<div class="tpr-zoom" role="group" aria-label="Zoom"><button type="button" id="tpr-zoom-out" aria-label="Zoom out">&minus;</button><button type="button" id="tpr-zoom-fit">Fit</button><button type="button" id="tpr-zoom-in" aria-label="Zoom in">+</button><button type="button" id="tpr-expand" aria-pressed="false">Expand</button></div>' +
          '</div>' +
          '<div class="tpr-legendbar">' +
            '<div class="tpr-legend" aria-label="Legend"><span><i class="tpr-swatch tpr-swatch-topic"></i>Topic</span><span><i class="tpr-swatch tpr-swatch-sub"></i>Subtopic</span><span><i class="tpr-swatch tpr-swatch-done"></i>Done</span><span><i class="tpr-swatch tpr-swatch-learning"></i>Learning</span><span><i class="tpr-swatch tpr-swatch-skip"></i>Skip</span></div>' +
            '<span class="tpr-pan-hint" aria-hidden="true">Drag to pan · Ctrl/⌘ + scroll to zoom</span>' +
          '</div>' +
          '<div class="tpr-canvas" id="tpr-canvas" tabindex="0" aria-label="Scrollable roadmap diagram">' + renderSVG(model, L) + '</div>' +
          '<div class="tpr-stepper" aria-label="Roadmap topics">' + stepperHTML(model) + '</div>' +
          (model.related && model.related.length ? '<div class="tpr-related-mobile" aria-label="Related TCC programs">' + model.related.map(function (r) { return '<a href="' + esc(r.href) + '">' + esc(r.title) + ' <span aria-hidden="true">&rarr;</span></a>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<p class="tpr-note"><span class="tpr-note-desktop">Tip: drag to pan, use the find box, or press <kbd>Enter</kbd> on a node.</span><span class="tpr-note-mobile">Tip: tap a topic to open its study note.</span> Progress is stored in your browser only.</p>' +
      '</div>' +
    '</section>' +
    '<div class="tpr-drawer" id="tpr-drawer" hidden>' +
      '<div class="tpr-backdrop" id="tpr-backdrop"></div>' +
      '<aside class="tpr-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="tpr-drawer-title">' +
        '<div class="tpr-drawer-head">' +
          '<div><p class="tpr-drawer-kicker" id="tpr-drawer-kicker">Topic</p><h2 class="tpr-drawer-title" id="tpr-drawer-title">Topic</h2><p class="tpr-drawer-phase" id="tpr-drawer-phase"></p></div>' +
          '<button type="button" class="tpr-drawer-close" id="tpr-drawer-close" aria-label="Close details">&times;</button>' +
        '</div>' +
        '<div class="tpr-drawer-body">' +
          '<p class="tpr-drawer-summary" id="tpr-drawer-summary"></p>' +
          '<div class="tpr-status" role="group" aria-label="Topic status">' +
            '<button type="button" data-status="learning" id="tpr-status-learning">Learning <kbd>L</kbd></button>' +
            '<button type="button" data-status="done" id="tpr-status-done">Done <kbd>D</kbd></button>' +
            '<button type="button" data-status="skip" id="tpr-status-skip">Skip <kbd>S</kbd></button>' +
          '</div>' +
          '<div class="tpr-drawer-block"><h3>What to cover</h3><ul id="tpr-drawer-bullets"></ul></div>' +
          '<div class="tpr-drawer-block" id="tpr-drawer-link-block"><h3>Open on TCC</h3><div class="tpr-drawer-links" id="tpr-drawer-links"></div></div>' +
          '<div class="tpr-drawer-block"><h3>Keep moving</h3><div class="tpr-drawer-links"><a href="/domains/">All TCC programs <span aria-hidden="true">&rarr;</span></a><a href="#tcc-program-roadmap">Back to the map <span aria-hidden="true">&uarr;</span></a></div></div>' +
          '<div class="tpr-drawer-nav"><button type="button" id="tpr-prev">&larr; Previous</button><button type="button" id="tpr-next">Next &rarr;</button></div>' +
        '</div>' +
      '</aside>' +
    '</div>';
  }

  // ── styles ───────────────────────────────────────────────────────────────
  var CSS = [
    '.tpr{background:#000000;border-top:1px solid rgba(255,255,255,.08);padding:64px 24px 56px;color:#fff;font-family:Inter,system-ui,-apple-system,sans-serif!important;width:100%}',
    '.tpr *{box-sizing:border-box}',
    '.tpr-in{max-width:1180px;margin:0 auto}',
    '.tpr-head{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;align-items:end;margin-bottom:22px}',
    '.tpr-eyebrow{font-family:"DM Mono",monospace!important;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.62);margin:0 0 12px}',
    '.tpr-heading{font-family:"Instrument Serif",Georgia,serif!important;font-size:clamp(30px,3.8vw,46px);font-weight:400;letter-spacing:-.01em;line-height:1.04;margin:0 0 12px;color:#fff}',
    '.tpr-sub{max-width:46em;font-size:14px;line-height:1.65;color:rgba(255,255,255,.66);margin:0}',
    '.tpr-progress{padding:16px;border:1px solid rgba(255,255,255,.16);border-radius:16px;background:rgba(255,255,255,.02)}',
    '.tpr-progress-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px}',
    '.tpr-progress-label{font-family:"DM Mono",monospace!important;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.62)}',
    '.tpr-progress-count{font-size:12px;color:rgba(255,255,255,.66)}',
    '.tpr-progress-count strong{color:#fff;font-size:14px}',
    '.tpr-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}',
    '.tpr-bar span{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#0057DE,#2f7bff);transition:width .25s ease}',
    '.tpr-progress-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px}',
    '.tpr-progress-foot span{font-family:"DM Mono",monospace!important;font-size:11px;color:rgba(255,255,255,.62)}',
    '.tpr-reset{border:1px solid rgba(255,255,255,.32);background:none;color:rgba(255,255,255,.82);border-radius:999px;min-height:44px;padding:0 16px;font-family:inherit!important;font-size:12px;cursor:pointer}',
    '.tpr-reset:hover{color:#fff;border-color:rgba(255,255,255,.7)}',
    '.tpr-panel{border:1px solid rgba(255,255,255,.16);border-radius:16px;background:#0a0a0a;overflow:hidden}',
    '.tpr-toolbar{display:flex;flex-wrap:nowrap;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:#0d0d0d}',
    '.tpr-find{position:relative;flex:0 1 240px;min-width:150px}',
    '.tpr-find>span[aria-hidden]{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:14px;color:rgba(255,255,255,.6);pointer-events:none}',
    '.tpr-find input{width:100%;height:44px;padding:0 74px 0 34px;border-radius:999px;border:1px solid rgba(255,255,255,.24);background:#111;color:#fff;font-family:inherit!important;font-size:13px;outline:none}',
    '.tpr-find input::placeholder{color:rgba(255,255,255,.6)}',
    '.tpr-find input:focus{border-color:#2f7bff;box-shadow:0 0 0 3px rgba(47,123,255,.2)}',
    '.tpr-find em{position:absolute;right:13px;top:50%;transform:translateY(-50%);font-family:"DM Mono",monospace!important;font-size:11px;font-style:normal;color:rgba(255,255,255,.62)}',
    '.tpr-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.tpr-chips{display:flex;flex-wrap:nowrap;gap:6px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none}',
    '.tpr-chips::-webkit-scrollbar{display:none}',
    '.tpr-chip{flex:0 0 auto;white-space:nowrap;border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.03);color:rgba(255,255,255,.8);border-radius:999px;min-height:44px;padding:0 14px;font-family:"DM Mono",monospace!important;font-size:11px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}',
    '.tpr-chip:hover{border-color:rgba(255,255,255,.6);color:#fff}',
    '.tpr-chip.is-active,.tpr-chip[aria-current="true"]{background:#fff;border-color:#fff;color:#0a0a0a}',
    '.tpr-legendbar{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:#0b0b0b}',
    '.tpr-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;font-family:"DM Mono",monospace!important;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.62)}',
    '.tpr-legend span{display:inline-flex;align-items:center;gap:6px}',
    '.tpr-swatch{width:14px;height:14px;border-radius:4px;border:1px solid rgba(255,255,255,.28);display:inline-block;flex:0 0 auto}',
    '.tpr-swatch-topic{background:#fff}',
    '.tpr-swatch-sub{background:#101010;border-color:rgba(255,255,255,.4)}',
    '.tpr-swatch-done{background:#0057DE;border:2px solid #8fc0ff}',
    '.tpr-swatch-learning{background:#0f2f66;border:2px dashed #8fc0ff}',
    '.tpr-swatch-skip{background:#141414;border:2px dotted rgba(255,255,255,.55)}',
    '.tpr-pan-hint{margin-left:auto;font-family:"DM Mono",monospace!important;font-size:11px;color:rgba(255,255,255,.5)}',
    '.tpr-zoom{display:inline-flex;align-items:center;gap:4px;margin-left:auto;flex:0 0 auto}',
    '.tpr-zoom button{min-width:44px;height:44px;padding:0 10px;border-radius:10px;border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.03);color:rgba(255,255,255,.88);font-family:"DM Mono",monospace!important;font-size:13px;line-height:1;cursor:pointer}',
    '.tpr-zoom button:hover{border-color:rgba(255,255,255,.6);color:#fff}',
    '.tpr-canvas{overflow:auto;max-height:min(74vh,860px);padding:16px 12px 10px;background:#070707;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.28) transparent;overscroll-behavior:contain;cursor:grab}',
    '.tpr-canvas.is-dragging{cursor:grabbing}',
    '.tpr-canvas.is-expanded{max-height:none}',
    '.tpr-svg{display:block;width:100%;height:auto;font-family:Inter,system-ui,sans-serif!important;user-select:none}',
    '.tpr-title-text{font-family:"Instrument Serif",Georgia,serif!important;font-size:30px;fill:#fff;font-weight:400;letter-spacing:-.01em}',
    '.tpr-section-label{font-family:"Instrument Serif",Georgia,serif!important;font-size:21px;fill:rgba(255,255,255,.88);font-weight:400}',
    '.tpr-section-outcome{fill:rgba(255,255,255,.62);font-family:Inter,system-ui,sans-serif!important}',
    '.tpr-node{cursor:pointer}',
    '.tpr-node:focus{outline:none}',
    '.tpr-node:focus rect{stroke:#2f7bff;stroke-width:3}',
    '.tpr-topic rect{transition:fill .15s ease}',
    '.tpr-topic:hover rect{fill:#e8edf7}',
    '.tpr-subtopic rect{transition:fill .15s ease,stroke .15s ease}',
    '.tpr-subtopic:hover rect{fill:#171717;stroke:rgba(255,255,255,.55)}',
    '.tpr-topic text{fill:#0a0a0a}',
    '.tpr-subtopic text{fill:#e6e6e6}',
    '.tpr-button text{fill:#0a0a0a;font-weight:500}',
    '.tpr-button:hover rect{fill:#0057DE;stroke:#0057DE}',
    '.tpr-button:hover text{fill:#fff}',
    '.tpr-node text{pointer-events:none}',
    '.tpr-node.is-match rect{stroke:#2f7bff;stroke-width:3.5}',
    '.tpr-node.is-dim{opacity:.16}',
    '.tpr-node[data-status="done"] rect{fill:#0057DE;stroke:#8fc0ff;stroke-width:3;stroke-dasharray:none}',
    '.tpr-node[data-status="done"] text{fill:#fff}',
    '.tpr-node[data-status="learning"] rect{fill:#0f2f66;stroke:#8fc0ff;stroke-width:2.5;stroke-dasharray:6 4}',
    '.tpr-node[data-status="learning"] text{fill:#dce9ff}',
    '.tpr-node[data-status="skip"] rect{fill:#141414;stroke:rgba(255,255,255,.4);stroke-width:2;stroke-dasharray:2 5}',
    '.tpr-node[data-status="skip"] text{fill:rgba(255,255,255,.62);text-decoration:line-through}',
    '.tpr-stepper{display:none;padding:6px 14px 18px;background:#0a0a0a}',
    '.tpr-step{border-bottom:1px solid rgba(255,255,255,.1)}',
    '.tpr-step:last-child{border-bottom:0}',
    '.tpr-step summary{display:flex;align-items:center;gap:10px;min-height:44px;padding:10px 2px;cursor:pointer;list-style:none}',
    '.tpr-step summary::-webkit-details-marker{display:none}',
    '.tpr-step-num{font-family:"DM Mono",monospace!important;font-size:11px;color:#2f7bff}',
    '.tpr-step-title{font-family:"Instrument Serif",Georgia,serif!important;font-size:18px;font-weight:400;letter-spacing:-.01em;color:#fff}',
    '.tpr-step-count{margin-left:auto;font-family:"DM Mono",monospace!important;font-size:11px;color:rgba(255,255,255,.62)}',
    '.tpr-step-outcome{margin:0 2px 12px;font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.62)}',
    '.tpr-step-topics{list-style:none;margin:0;padding:0 0 12px;display:grid;gap:8px}',
    '.tpr-step-topic{width:100%;text-align:left;min-height:44px;padding:10px 12px;border-radius:10px;border:1px solid #fff;background:#fff;color:#0a0a0a;font-family:inherit!important;font-size:14.5px;font-weight:600;cursor:pointer}',
    '.tpr-step-topic[data-status="done"],.tpr-step-sub[data-status="done"]{background:#0057DE;border:3px solid #8fc0ff;color:#fff}',
    '.tpr-step-topic[data-status="learning"],.tpr-step-sub[data-status="learning"]{background:#0f2f66;border:2px dashed #8fc0ff;color:#dce9ff}',
    '.tpr-step-topic[data-status="skip"],.tpr-step-sub[data-status="skip"]{background:#141414;border:2px dotted rgba(255,255,255,.55);color:rgba(255,255,255,.62);text-decoration:line-through}',
    '.tpr-step-subs{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 0;padding:0}',
    '.tpr-step-sub{min-height:44px;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.24);background:#141414;color:#e6e6e6;font-family:inherit!important;font-size:13px;cursor:pointer;text-align:left}',
    '.tpr-note{margin-top:12px;font-family:"DM Mono",monospace!important;font-size:11px;line-height:1.6;color:rgba(255,255,255,.62)}',
    '.tpr-note kbd{border:1px solid rgba(255,255,255,.3);border-radius:4px;padding:0 4px;font-family:inherit!important}',
    '.tpr-note-mobile{display:none}',
    '.tpr-related-mobile{display:none;gap:8px;padding:4px 14px 18px;background:#0a0a0a}',
    '.tpr-related-mobile a{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.02);color:rgba(255,255,255,.88);text-decoration:none;font-size:13px}',
    '.tpr-related-mobile a:hover{border-color:rgba(47,123,255,.7);color:#fff}',
    '.tpr-drawer[hidden]{display:none}',
    '.tpr-drawer{position:fixed;inset:0;z-index:130}',
    '.tpr-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(3px)}',
    '.tpr-drawer-panel{position:absolute;top:0;right:0;height:100%;width:min(600px,100%);display:flex;flex-direction:column;background:#000000;border-left:1px solid rgba(255,255,255,.12);box-shadow:-24px 0 60px rgba(0,0,0,.55);overflow-y:auto}',
    '.tpr-drawer-head{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 24px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:#000000}',
    '.tpr-drawer-kicker{font-family:"DM Mono",monospace!important;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#2f7bff;margin:0 0 8px}',
    '.tpr-drawer-title{font-family:"Instrument Serif",Georgia,serif!important;font-size:clamp(24px,3.4vw,32px);font-weight:400;letter-spacing:-.01em;line-height:1.1;margin:0;color:#fff}',
    '.tpr-drawer-phase{margin:8px 0 0;font-size:12.5px;color:rgba(255,255,255,.62)}',
    '.tpr-drawer-close{flex-shrink:0;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:none;color:#fff;font-size:22px;line-height:1;cursor:pointer}',
    '.tpr-drawer-close:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.7)}',
    '.tpr-drawer-body{padding:22px 24px 34px;display:grid;gap:22px}',
    '.tpr-drawer-summary{font-size:14px;line-height:1.7;color:rgba(255,255,255,.78);margin:0}',
    '.tpr-status{display:flex;flex-wrap:wrap;gap:8px}',
    '.tpr-status button{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.03);color:#fff;font-family:inherit!important;font-size:13px;font-weight:500;cursor:pointer}',
    '.tpr-status button:hover{border-color:rgba(255,255,255,.7)}',
    '.tpr-status button.is-active[data-status="learning"]{background:#0f2f66;border:2px dashed #8fc0ff;color:#dce9ff}',
    '.tpr-status button.is-active[data-status="done"]{background:#0057DE;border:3px solid #8fc0ff;color:#fff}',
    '.tpr-status button.is-active[data-status="skip"]{background:#141414;border:2px dotted rgba(255,255,255,.55);color:rgba(255,255,255,.72)}',
    '.tpr-status kbd{border:1px solid currentColor;border-radius:4px;padding:0 4px;font-family:"DM Mono",monospace!important;font-size:10px;opacity:.75}',
    '.tpr-drawer-block h3{font-size:11px;font-family:"DM Mono",monospace!important;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.62);margin:0 0 10px}',
    '.tpr-drawer-block ul{list-style:none;display:grid;gap:8px;margin:0;padding:0}',
    '.tpr-drawer-block li{position:relative;padding-left:18px;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.74)}',
    '.tpr-drawer-block li::before{content:"";position:absolute;left:2px;top:.58em;width:7px;height:7px;border-radius:2px;background:#2f7bff}',
    '.tpr-drawer-links{display:grid;gap:8px}',
    '.tpr-drawer-links a{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.02);font-size:13px;color:rgba(255,255,255,.88);text-decoration:none}',
    '.tpr-drawer-links a:hover{border-color:rgba(47,123,255,.7);background:rgba(47,123,255,.06);color:#fff}',
    '.tpr-drawer-nav{display:flex;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:16px}',
    '.tpr-drawer-nav button{min-height:44px;padding:0 16px;border:1px solid rgba(255,255,255,.3);background:none;color:rgba(255,255,255,.82);border-radius:999px;font-family:inherit!important;font-size:13px;cursor:pointer}',
    '.tpr-drawer-nav button:hover{color:#fff;border-color:rgba(255,255,255,.7)}',
    '.tpr-drawer-nav button[disabled]{opacity:.4;cursor:not-allowed}',
    '@media(max-width:900px){.tpr-head{grid-template-columns:1fr;align-items:start}.tpr-progress{max-width:420px}}',
    '@media(max-width:767px){.tpr{padding:32px 16px 30px}.tpr-canvas{display:none}.tpr-stepper{display:block}.tpr-chips{display:none}.tpr-zoom{display:none}.tpr-toolbar{flex-wrap:wrap}.tpr-find{flex:1 1 100%;min-width:0}.tpr-legendbar{padding:10px 14px}.tpr-legend{font-size:11px;gap:8px 14px}.tpr-pan-hint{display:none}.tpr-note-desktop{display:none}.tpr-note-mobile{display:inline}.tpr-related-mobile{display:grid}.tpr-drawer-panel{width:100%}}',
    '@media(prefers-reduced-motion:reduce){.tpr-bar span,.tpr-topic rect,.tpr-subtopic rect{transition:none}}'
  ].join('');

  // ── mount + interaction ──────────────────────────────────────────────────
  var model = null;
  var layout = null;
  var byId = {};
  var order = [];
  var state = {};
  var openId = null;
  var lastFocus = null;
  var zoom = 1;
  var mountedPath = null;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeAll(v) {
    try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {}
  }
  function allNodes() {
    return order.map(function (id) { return byId[id]; });
  }
  function totalCount() { return order.length; }
  function doneCount() {
    return Object.keys(state).filter(function (k) { return state[k] === 'done'; }).length;
  }
  function learningCount() {
    return Object.keys(state).filter(function (k) { return state[k] === 'learning'; }).length;
  }
  function liveNodes() {
    return Array.prototype.slice.call(document.querySelectorAll('#' + SECTION_ID + ' .tpr-node[data-node-id]'));
  }
  function liveListButtons() {
    return Array.prototype.slice.call(document.querySelectorAll('#' + SECTION_ID + ' .tpr-step-topic, #' + SECTION_ID + ' .tpr-step-sub'));
  }

  function paintProgress() {
    var done = doneCount();
    var learning = learningCount();
    var total = totalCount();
    var pct = total ? Math.round((done / total) * 100) : 0;
    var doneEl = document.getElementById('tpr-done');
    var barEl = document.getElementById('tpr-bar-fill');
    var barWrap = document.querySelector('#' + SECTION_ID + ' .tpr-bar');
    var noteEl = document.getElementById('tpr-progress-note');
    if (doneEl) doneEl.textContent = String(done);
    if (barEl) barEl.style.width = pct + '%';
    if (barWrap) barWrap.setAttribute('aria-valuenow', String(pct));
    if (noteEl) {
      noteEl.textContent = (!done && !learning) ? 'Nothing marked yet' : done + ' done · ' + learning + ' learning · ' + pct + '%';
    }
    // per-phase counts
    model.phases.forEach(function (p, pi) {
      var ids = [];
      p.topics.forEach(function (t) { ids.push(t.id); (t.subs || []).forEach(function (s) { ids.push(s.id); }); });
      var d = ids.filter(function (id) { return state[id] === 'done'; }).length;
      var el = document.querySelector('#' + SECTION_ID + ' [data-phase-count="' + (pi + 1) + '"]');
      if (el) el.textContent = d + '/' + ids.length;
    });
  }
  function paintNodes() {
    liveNodes().forEach(function (n) {
      var id = n.getAttribute('data-node-id');
      if (state[id]) n.setAttribute('data-status', state[id]);
      else n.removeAttribute('data-status');
    });
    liveListButtons().forEach(function (b) {
      var id = b.getAttribute('data-node-id');
      if (state[id]) b.setAttribute('data-status', state[id]);
      else b.removeAttribute('data-status');
    });
  }
  function save() {
    var all = readAll();
    if (Object.keys(state).length) all[model.scope] = state;
    else delete all[model.scope];
    writeAll(all);
    paintNodes();
    paintProgress();
    if (openId) paintStatusButtons(openId);
  }

  function bulletsFor(node) {
    if (node.bullets && node.bullets.length) return node.bullets;
    if (node.subs && node.subs.length) return node.subs.map(function (s) { return s.label; });
    return ['Read the core idea, then apply it in a small exercise.', 'Write down one question you still have.'];
  }
  function summaryFor(node) {
    if (node.summary) return node.summary;
    return node.label + ' is part of the ' + model.title + ' path. Get comfortable using it in context before moving on.';
  }
  function paintStatusButtons(id) {
    var status = state[id];
    Array.prototype.forEach.call(document.querySelectorAll('.tpr-status button'), function (b) {
      var on = b.getAttribute('data-status') === status;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  function expandFor(id) {
    var node = byId[id];
    if (!node || typeof node.phaseIndex !== 'number') return;
    var steps = document.querySelectorAll('#' + SECTION_ID + ' .tpr-step');
    var step = steps[node.phaseIndex];
    if (step) step.open = true;
  }
  function paintNav() {
    var i = order.indexOf(openId);
    var prev = document.getElementById('tpr-prev');
    var next = document.getElementById('tpr-next');
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i < 0 || i >= order.length - 1;
  }
  function openTopic(id, pushHash) {
    var node = byId[id];
    if (!node) return;
    openId = id;
    expandFor(id);
    lastFocus = document.activeElement;
    var kicker = document.getElementById('tpr-drawer-kicker');
    var title = document.getElementById('tpr-drawer-title');
    var phase = document.getElementById('tpr-drawer-phase');
    var summary = document.getElementById('tpr-drawer-summary');
    var bullets = document.getElementById('tpr-drawer-bullets');
    var links = document.getElementById('tpr-drawer-links');
    var linkBlock = document.getElementById('tpr-drawer-link-block');
    if (kicker) kicker.textContent = node.kind === 'subtopic' ? 'Subtopic' + (node.parent ? ' · ' + node.parent : '') : 'Topic';
    if (title) title.textContent = node.label;
    if (phase) phase.textContent = node.phase || '';
    if (summary) summary.textContent = summaryFor(node);
    if (bullets) {
      bullets.innerHTML = '';
      bulletsFor(node).forEach(function (b) {
        var li = document.createElement('li');
        li.textContent = b;
        bullets.appendChild(li);
      });
    }
    if (links && linkBlock) {
      links.innerHTML = '';
      if (node.href) {
        var a = document.createElement('a');
        a.href = node.href;
        a.innerHTML = esc(node.hrefLabel || 'Open on TCC') + ' <span aria-hidden="true">&rarr;</span>';
        links.appendChild(a);
        linkBlock.style.display = '';
      } else {
        linkBlock.style.display = 'none';
      }
    }
    paintStatusButtons(id);
    paintNav();
    var drawer = document.getElementById('tpr-drawer');
    if (drawer) drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    if (pushHash !== false) {
      try { history.replaceState(null, '', '#node-' + id); } catch (e) {}
    }
    var close = document.getElementById('tpr-drawer-close');
    if (close) close.focus();
  }
  function closeDrawer(skipHash) {
    var drawer = document.getElementById('tpr-drawer');
    if (drawer) drawer.hidden = true;
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

  function applyFilter() {
    var input = document.getElementById('tpr-filter');
    var countEl = document.getElementById('tpr-match-count');
    var q = (input ? input.value : '').trim().toLowerCase();
    var matches = 0;
    liveNodes().forEach(function (n) {
      var node = byId[n.getAttribute('data-node-id')];
      var hay = ((node && (node.label + ' ' + node.phase + ' ' + (node.summary || ''))) || '').toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      n.classList.toggle('is-dim', !!q && !match);
      n.classList.toggle('is-match', !!q && match);
      if (q && match) matches++;
    });
    liveListButtons().forEach(function (b) {
      var node = byId[b.getAttribute('data-node-id')];
      var hay = ((node && (node.label + ' ' + node.phase)) || '').toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      b.style.opacity = q && !match ? '0.35' : '';
    });
    if (countEl) countEl.textContent = q ? matches + ' match' + (matches === 1 ? '' : 'es') : '';
  }

  function scrollToPhase(index) {
    var canvas = document.getElementById('tpr-canvas');
    var sec = document.getElementById('tpr-phase-' + index);
    if (!canvas || !sec) return;
    var cr = canvas.getBoundingClientRect();
    var sr = sec.getBoundingClientRect();
    canvas.scrollTo({ top: canvas.scrollTop + (sr.top - cr.top) - 24, left: canvas.scrollLeft + (sr.left - cr.left) - 24, behavior: 'smooth' });
  }

  function revealNode(n) {
    var canvas = document.getElementById('tpr-canvas');
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

  function setupCanvas() {
    var canvas = document.getElementById('tpr-canvas');
    if (!canvas || canvas.getAttribute('data-ux') === '1') return;
    canvas.setAttribute('data-ux', '1');
    var chips = Array.prototype.slice.call(document.querySelectorAll('#' + SECTION_ID + ' .tpr-chip'));
    var tick = false;
    function spy() {
      tick = false;
      var cr = canvas.getBoundingClientRect();
      var active = 0;
      chips.forEach(function (chip, i) {
        var sec = document.getElementById('tpr-phase-' + chip.getAttribute('data-phase'));
        if (!sec) return;
        if (sec.getBoundingClientRect().top - cr.top <= 90) active = i;
      });
      if (canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 4) active = chips.length - 1;
      chips.forEach(function (chip, i) {
        chip.classList.toggle('is-active', i === active);
        if (i === active) chip.setAttribute('aria-current', 'true');
        else chip.removeAttribute('aria-current');
      });
    }
    canvas.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      window.requestAnimationFrame(spy);
    }, { passive: true });
    spy();
  }

  function svgNaturalWidth(canvas) {
    var avail = Math.max(1, canvas.clientWidth - 24);
    return Math.max(avail, MIN_SVG_W);
  }
  function fitZoom() {
    var canvas = document.getElementById('tpr-canvas');
    if (!canvas) return 1;
    var avail = Math.max(1, canvas.clientWidth - 24);
    return Math.max(0.55, Math.min(1, avail / Math.max(avail, MIN_SVG_W)));
  }
  function applyZoom(next, anchor) {
    var svg = document.querySelector('#' + SECTION_ID + ' .tpr-svg');
    var canvas = document.getElementById('tpr-canvas');
    if (!svg || !canvas) return;
    var cr = canvas.getBoundingClientRect();
    var ax = anchor ? anchor.x - cr.left : cr.width / 2;
    var ay = anchor ? anchor.y - cr.top : cr.height / 2;
    var ratioX = (canvas.scrollLeft + ax) / Math.max(1, canvas.scrollWidth);
    var ratioY = (canvas.scrollTop + ay) / Math.max(1, canvas.scrollHeight);
    zoom = Math.max(0.55, Math.min(2.2, next));
    svg.style.width = Math.round(svgNaturalWidth(canvas) * zoom) + 'px';
    requestAnimationFrame(function () {
      canvas.scrollLeft = ratioX * canvas.scrollWidth - ax;
      canvas.scrollTop = ratioY * canvas.scrollHeight - ay;
    });
  }

  function bind() {
    // delegated clicks
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var node = t.closest('#' + SECTION_ID + ' .tpr-node[data-node-id], #' + SECTION_ID + ' .tpr-step-topic, #' + SECTION_ID + ' .tpr-step-sub');
      if (node) {
        e.preventDefault();
        openTopic(node.getAttribute('data-node-id'));
        return;
      }
      var chip = t.closest('#' + SECTION_ID + ' .tpr-chip');
      if (chip) {
        e.preventDefault();
        scrollToPhase(Number(chip.getAttribute('data-phase')));
        return;
      }
      if (t.closest('#tpr-backdrop') || t.closest('#tpr-drawer-close')) {
        e.preventDefault();
        closeDrawer();
        return;
      }
      var status = t.closest('.tpr-status button');
      if (status) {
        e.preventDefault();
        toggleStatus(status.getAttribute('data-status'));
        return;
      }
      if (t.closest('#tpr-prev')) { e.preventDefault(); stepNode(-1); return; }
      if (t.closest('#tpr-next')) { e.preventDefault(); stepNode(1); return; }
      if (t.closest('#tpr-reset')) {
        e.preventDefault();
        if (!Object.keys(state).length) return;
        if (!window.confirm('Reset all progress on this map?')) return;
        state = {};
        save();
        return;
      }
      if (t.closest('#tpr-zoom-in')) { e.preventDefault(); applyZoom(zoom + 0.15); return; }
      if (t.closest('#tpr-zoom-out')) { e.preventDefault(); applyZoom(zoom - 0.15); return; }
      if (t.closest('#tpr-zoom-fit')) { e.preventDefault(); applyZoom(fitZoom()); return; }
      if (t.closest('#tpr-expand')) {
        e.preventDefault();
        var cv = document.getElementById('tpr-canvas');
        if (!cv) return;
        var open = cv.classList.toggle('is-expanded');
        var btn = document.getElementById('tpr-expand');
        if (btn) {
          btn.textContent = open ? 'Collapse' : 'Expand';
          btn.setAttribute('aria-pressed', String(open));
        }
        return;
      }
    });

    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'tpr-filter') applyFilter();
    });

    document.addEventListener('keydown', function (e) {
      var drawer = document.getElementById('tpr-drawer');
      if (!drawer || drawer.hidden) {
        var node = e.target && e.target.closest ? e.target.closest('#' + SECTION_ID + ' .tpr-node[data-node-id]') : null;
        if (node && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openTopic(node.getAttribute('data-node-id'));
        }
        return;
      }
      var k = e.key.toLowerCase();
      if (k === 'tab') {
        var panel = document.querySelector('.tpr-drawer-panel');
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

    // enter on find opens first match
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var input = document.getElementById('tpr-filter');
      if (!input || e.target !== input) return;
      e.preventDefault();
      var q = (input.value || '').trim().toLowerCase();
      if (!q) return;
      var hit = order.filter(function (id) {
        var n = byId[id];
        return (n.label + ' ' + n.phase + ' ' + (n.summary || '')).toLowerCase().indexOf(q) !== -1;
      })[0];
      if (hit) {
        revealNode(document.querySelector('#' + SECTION_ID + ' .tpr-node[data-node-id="' + hit + '"]'));
        openTopic(hit);
      }
    });

    // keyboard arrow navigation between SVG nodes
    document.addEventListener('keydown', function (e) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) === -1) return;
      var drawer = document.getElementById('tpr-drawer');
      if (drawer && !drawer.hidden) return;
      var cur = e.target && e.target.closest ? e.target.closest('#' + SECTION_ID + ' .tpr-node[data-node-id]') : null;
      if (!cur) return;
      e.preventDefault();
      var cr = cur.getBoundingClientRect();
      var cx = cr.left + cr.width / 2;
      var cy = cr.top + cr.height / 2;
      var best = null;
      var bestScore = Infinity;
      liveNodes().forEach(function (n) {
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
      if (best) best.focus();
    });

    // pan
    var canvas = document.getElementById('tpr-canvas');
    if (canvas) {
      var dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
      canvas.addEventListener('pointerdown', function (e) {
        if (e.target.closest && e.target.closest('.tpr-node')) return;
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

    window.addEventListener('hashchange', function () {
      var h = location.hash || '';
      if (h.indexOf('#node-') === 0) {
        var id = h.slice(6);
        if (byId[id]) openTopic(id, false);
      } else {
        closeDrawer(true);
      }
    });
    var zoomTick = false;
    window.addEventListener('resize', function () {
      if (zoomTick) return;
      zoomTick = true;
      window.requestAnimationFrame(function () { zoomTick = false; applyZoom(zoom); });
    });
    window.addEventListener('popstate', function () {
      if (location.pathname !== mountedPath) scheduleRebuild();
    });
  }

  function init() {
    var data = resolveModel();
    if (!data) return false;
    model = data.model;
    layout = layoutModel(model);
    byId = {};
    order = [];
    layout.nodes.forEach(function (n) {
      if (n.kind !== 'topic' && n.kind !== 'subtopic') return;
      byId[n.id] = n;
      order.push(n.id);
    });
    var all = readAll();
    state = all[model.scope] || {};
    if (typeof state !== 'object' || Array.isArray(state)) state = {};
    zoom = 1;
    paintNodes();
    paintProgress();
    var h = location.hash || '';
    if (h.indexOf('#node-') === 0) {
      var id = h.slice(6);
      if (byId[id]) openTopic(id, false);
    }
    return true;
  }

  function resolveModel() {
    var parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts[0] !== 'domains') return null;
    if (!parts[1]) return { model: buildOverviewModel() };
    var domain = DATA.filter(function (d) { return d.id === parts[1]; })[0];
    if (!domain) return null;
    if (!parts[2]) return { model: buildProgramModel(domain) };
    var course = (domain.courses || []).filter(function (c) { return c.id === parts[2]; })[0];
    if (!course) return null;
    return { model: buildCourseModel(domain, course) };
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function injectFont() {
    if (document.getElementById(FONT_ID)) return;
    var link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    (document.head || document.documentElement).appendChild(link);
  }

  function mount() {
    if (!resolveModel()) return true;
    var existing = document.getElementById(SECTION_ID);
    if (existing && mountedPath === location.pathname) return true;
    if (existing) existing.parentNode.removeChild(existing);
    var oldDrawer = document.getElementById('tpr-drawer');
    if (oldDrawer && oldDrawer.parentNode) oldDrawer.parentNode.removeChild(oldDrawer);
    document.body.style.overflow = '';
    openId = null;

    var footer = document.querySelector('#root footer') || document.querySelector('footer');
    if (!footer || !footer.parentNode) return false;
    var anchor = document.getElementById('tcc-domain-ecosystem');
    if (!anchor || !anchor.parentNode) anchor = footer;
    injectStyle();
    injectFont();
    // build markup without touching state first
    var temp = resolveModel();
    if (!temp) return true;
    model = temp.model;
    layout = layoutModel(model);
    var host = document.createElement('div');
    host.innerHTML = sectionHTML(model, layout);
    var section = host.firstElementChild;
    var drawer = host.lastElementChild;
    anchor.parentNode.insertBefore(section, anchor);
    document.body.appendChild(drawer);
    mountedPath = location.pathname;
    init();
    setupCanvas();
    applyZoom(zoom);
    return true;
  }

  var scheduled = false;
  function scheduleRebuild() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      mount();
    });
  }

  function start() {
    if (mount()) { observe(); return; }
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (mount() || tries >= 80) {
        clearInterval(timer);
        if (document.getElementById(SECTION_ID)) observe();
      }
    }, 200);
  }

  function observe() {
    var root = document.getElementById('root') || document.body;
    if (!root || !window.MutationObserver) return;
    var obs = new MutationObserver(function () {
      if (!document.getElementById(SECTION_ID) || mountedPath !== location.pathname) scheduleRebuild();
    });
    obs.observe(root, { childList: true, subtree: true });
  }

  bind();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
