/* ============================================================================
 * TCC ecosystem strip for domain / course pages.
 * Adds one consistent "how the ecosystem fits together" section above the
 * footer on every /domains page. Self-contained (scoped CSS, no dependencies).
 * ==========================================================================*/
(function () {
  'use strict';

  var SECTION_ID = 'tcc-domain-ecosystem';
  var STYLE_ID = 'tcc-eco-style';

  var CSS = [
    '.tcc-eco{background:#000000;border-top:1px solid rgba(255,255,255,.1);padding:72px 24px 56px;color:#fff;font-family:Inter,system-ui,-apple-system,sans-serif;width:100%}',
    '.tcc-eco *{box-sizing:border-box}',
    '.tcc-eco-in{max-width:1120px;margin:0 auto}',
    '.tcc-eco-eyebrow{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.45);margin:0 0 14px}',
    '.tcc-eco h2{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:clamp(30px,4.2vw,48px);line-height:1.06;letter-spacing:-.01em;margin:0 0 14px;color:#fff;max-width:820px}',
    '.tcc-eco-sub{font-size:15px;line-height:1.7;color:rgba(255,255,255,.55);max-width:700px;margin:0 0 34px}',
    '.tcc-eco-sub strong{color:rgba(255,255,255,.85);font-weight:500}',
    '.tcc-eco-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
    '.tcc-eco-card{display:block;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 18px 16px;background:rgba(255,255,255,.02);text-decoration:none;color:inherit;transition:border-color .2s ease,background .2s ease,transform .2s ease}',
    'a.tcc-eco-card:hover{border-color:rgba(255,255,255,.34);background:rgba(255,255,255,.05);transform:translateY(-2px)}',
    '.tcc-eco-card.is-here{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.04)}',
    '.tcc-eco-top{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.tcc-eco-num{font-family:"DM Mono",monospace;font-size:11px;color:rgba(255,255,255,.32)}',
    '.tcc-eco-tag{font-family:"DM Mono",monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:3px 7px}',
    '.tcc-eco-title{font-size:15px;font-weight:600;margin:10px 0 6px;color:#fff}',
    '.tcc-eco-desc{font-size:13px;line-height:1.6;color:rgba(255,255,255,.55);margin:0}',
    '.tcc-eco-go{display:inline-block;margin-top:12px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.7)}',
    'a.tcc-eco-card:hover .tcc-eco-go{color:#fff}',
    '.tcc-eco-more{margin:20px 0 0;font-size:12.5px;line-height:1.9;color:rgba(255,255,255,.45)}',
    '.tcc-eco-more a{color:rgba(255,255,255,.72);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.22);padding-bottom:1px}',
    '.tcc-eco-more a:hover{color:#fff;border-color:rgba(255,255,255,.55)}',
    '.tcc-eco-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:30px;padding-top:26px;border-top:1px solid rgba(255,255,255,.1)}',
    '.tcc-eco-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#000;font-size:13px;font-weight:600;padding:12px 22px;border-radius:999px;text-decoration:none;transition:background .2s ease,color .2s ease}',
    '.tcc-eco-btn:hover{background:#0057DE;color:#fff}',
    '.tcc-eco-ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.28)}',
    '.tcc-eco-ghost:hover{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.5)}',
    '.tcc-eco-note{font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.5);margin:0;flex:1 1 240px;min-width:220px}',
    '.tcc-eco-note strong{color:rgba(255,255,255,.85);font-weight:600}',
    '.tcc-eco-fine{font-size:12px;line-height:1.7;color:rgba(255,255,255,.46);margin:18px 0 0}',
    '@media (max-width:900px){.tcc-eco-grid{grid-template-columns:repeat(2,1fr)}}',
    '@media (max-width:600px){.tcc-eco{padding:48px 18px 40px}.tcc-eco-grid{grid-template-columns:1fr}.tcc-eco-note{flex-basis:100%}}'
  ].join('');

  var CARDS = [
    { n: '01', t: 'Learn', d: 'This programme — project-based, built around shipping real work you can show.', href: null, tag: 'You are here' },
    { n: '02', t: 'Certify', d: 'Add a CERT+ role certification that maps to the job you want — 1,048 certifications across 262 roles and four tiers. Separate paid product.', href: '/bootcamps' },
    { n: '03', t: 'Practise', d: 'Prep+ company patterns, DSA, aptitude and mock tests. Open to start, no sign-up wall.', href: '/prep+/' },
    { n: '04', t: 'Placements', d: 'Structured readiness, employer connections and interview prep. Support — not a job guarantee.', href: '/placement' },
    { n: '05', t: 'Earn', d: 'Paid, short-term gigs with scope and pay agreed in writing before work starts.', href: '/gigs' },
    { n: '06', t: 'Stay in the room', d: 'The 100 Club — campus community, events and people who actually ship.', href: '/100-club' }
  ];

  function cardHTML(c) {
    var tag = c.tag ? '<span class="tcc-eco-tag">' + c.tag + '</span>' : '';
    var inner =
      '<div class="tcc-eco-top"><span class="tcc-eco-num">' + c.n + '</span>' + tag + '</div>' +
      '<div class="tcc-eco-title">' + c.t + '</div>' +
      '<p class="tcc-eco-desc">' + c.d + '</p>' +
      (c.href ? '<span class="tcc-eco-go">Open &rarr;</span>' : '');
    if (c.href) {
      return '<a class="tcc-eco-card" href="' + c.href + '">' + inner + '</a>';
    }
    return '<div class="tcc-eco-card is-here">' + inner + '</div>';
  }

  function sectionHTML() {
    return '' +
      '<section id="' + SECTION_ID + '" class="tcc-eco" aria-labelledby="tcc-eco-title">' +
        '<div class="tcc-eco-in">' +
          '<p class="tcc-eco-eyebrow">The TCC ecosystem</p>' +
          '<h2 id="tcc-eco-title">A course is one part. The system is the point.</h2>' +
          '<p class="tcc-eco-sub"><strong><span id="tcc-eco-context">This programme</span></strong> <span id="tcc-eco-verb">sits</span> inside a single system built to take you from learning to earning — certification, interview practice, placement support, paid work and a community that keeps you sharp.</p>' +
          '<div class="tcc-eco-grid">' + CARDS.map(cardHTML).join('') + '</div>' +
          '<p class="tcc-eco-more">Also in the ecosystem: <a href="/blog">TCC Guides</a> &middot; <a href="/webinars">Live webinars</a> &middot; <span>TCC Fest &mdash; coming 2026</span></p>' +
          '<div class="tcc-eco-cta">' +
            '<a class="tcc-eco-btn" href="/become-a-member">Apply to start</a>' +
            '<a class="tcc-eco-btn tcc-eco-ghost" href="/contact">Talk to a human</a>' +
            '<p class="tcc-eco-note"><strong>₹0 today.</strong> Pay only after you&rsquo;re accepted. Every application is read by a human and answered within 2 working days.</p>' +
          '</div>' +
          '<p class="tcc-eco-fine">CERT+ certification is a separate paid product. Placement support is not a job guarantee. Gigs and placement terms are agreed in writing before work starts.</p>' +
        '</div>' +
      '</section>';
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function contextInfo() {
    var p = location.pathname.replace(/\/+$/, '');
    if (p === '/domains' || p === '') return { text: 'All domain programmes', verb: 'sit' };
    var raw = (document.title || '').split('|')[0].trim();
    raw = raw.replace(/\s+AI Courses$/i, '').replace(/\s+Course$/i, '').trim();
    return raw
      ? { text: 'The ' + raw + ' programme', verb: 'sits' }
      : { text: 'This programme', verb: 'sits' };
  }

  function mount() {
    if (document.getElementById(SECTION_ID)) return true;
    var footer = document.querySelector('#root footer') || document.querySelector('footer');
    if (!footer || !footer.parentNode) return false;
    injectStyle();
    var host = document.createElement('div');
    host.innerHTML = sectionHTML();
    var section = host.firstElementChild;
    footer.parentNode.insertBefore(section, footer);
    var info = contextInfo();
    var ctx = document.getElementById('tcc-eco-context');
    if (ctx) ctx.textContent = info.text;
    var verb = document.getElementById('tcc-eco-verb');
    if (verb) verb.textContent = info.verb;
    return true;
  }

  function start() {
    if (mount()) {
      observe();
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (mount() || tries >= 60) {
        clearInterval(timer);
        if (document.getElementById(SECTION_ID)) observe();
      }
    }, 200);
  }

  var scheduled = false;
  function ensure() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      mount();
    });
  }

  function observe() {
    var root = document.getElementById('root') || document.body;
    if (!root || !window.MutationObserver) return;
    var obs = new MutationObserver(function () {
      if (!document.getElementById(SECTION_ID)) ensure();
    });
    obs.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
