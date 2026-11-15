/* ============================================================================
 * tcc-theme.js — dark-only shell.
 *
 * The site ships one theme. This file now does two things only:
 *   1. pins <html data-theme="dark"> and color-scheme after load;
 *   2. keeps the window.tccTheme API so older pages never throw.
 * There is no toggle, no persistence and no system-preference listener.
 * ==========================================================================*/
(function () {
  'use strict';
  var root = document.documentElement;
  function apply() {
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#050505');
  }
  apply();
  window.tccTheme = {
    get: function () { return 'dark'; },
    set: apply,
    toggle: apply,
    clear: apply
  };
})();

/* ── First-touch UTM capture (for lead attribution) ── */
(function () {
  'use strict';
  var KEY = 'tcc.utm.v1';
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];

  function readStored() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return (o && typeof o === 'object') ? o : {};
    } catch (e) {
      return {};
    }
  }

  // First-touch: only write once per device. Later visits with UTMs update
  // the *current* attribution but the first-touch record is preserved.
  try {
    var stored = readStored();
    var qs = new URLSearchParams(window.location.search);
    var fresh = {};
    PARAMS.forEach(function (p) {
      var v = qs.get(p);
      if (v) fresh[p] = v;
    });
    if (Object.keys(fresh).length && !stored.first_touch) {
      stored.first_touch = fresh;
      stored.first_touch_at = new Date().toISOString();
      stored.first_touch_path = window.location.pathname;
      localStorage.setItem(KEY, JSON.stringify(stored));
    }
    // Always keep a "last touch" record for the current session.
    if (Object.keys(fresh).length) {
      stored.last_touch = fresh;
      stored.last_touch_at = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(stored));
    }
  } catch (e) { /* ignore */ }

  function currentUtm() {
    var s = readStored();
    return s.last_touch || s.first_touch || {};
  }

  // Inject hidden UTM fields into any form right before it is submitted.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var utm = currentUtm();
    Object.keys(utm).forEach(function (k) {
      if (!form.querySelector('input[name="' + k + '"]')) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = utm[k];
        form.appendChild(input);
      }
    });
    // Also stash the page URL.
    if (!form.querySelector('input[name="page_url"]')) {
      var u = document.createElement('input');
      u.type = 'hidden';
      u.name = 'page_url';
      u.value = window.location.href;
      form.appendChild(u);
    }
  }, true);

  window.tccUtm = currentUtm;
})();

/* ── Lead-form hardening ──────────────────────────────────────────────
   Every form on the site posts JSON to /api/forms with its own fetch call.
   Rather than touch each page, patch fetch once: stamp the page-load time
   (bot speed gate), the originating path, and any honeypot value a bot
   filled in. Purely additive — a failure here must never block a lead.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  var PAGE_LOADED_AT = Date.now();
  if (typeof window.fetch !== 'function') return;
  var nativeFetch = window.fetch;

  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) { /* analytics must never break a form */ }
  }

  window.fetch = function (input, init) {
    var isForms = false;
    var formType = '';
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('/api/forms') !== -1 && init && typeof init.body === 'string') {
        isForms = true;
        var data = JSON.parse(init.body);
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          formType = data.form_type || data.source || '';
          if (!data._t) data._t = PAGE_LOADED_AT;
          if (!data._page) data._page = window.location.pathname;
          var trap = document.querySelector('input[name="_hp"]');
          if (trap && trap.value) data._hp = trap.value;
          init.body = JSON.stringify(data);
        }
      }
    } catch (e) { /* malformed body: send it untouched */ }

    var result = nativeFetch.apply(this, arguments);

    if (isForms && result && typeof result.then === 'function') {
      result.then(function (res) {
        if (res && res.ok) track('lead_submit', { form_type: formType });
        else track('lead_reject', { form_type: formType, status: res ? res.status : 0 });
      }, function () {});
    }

    return result;
  };
})();

/* ── Payment intent ───────────────────────────────────────────────────
   The cohort fee is collected on a hosted Cashfree page, so a completed
   purchase cannot be observed from here. What can be measured is the click
   that starts the redirect — which is the number that matters for funnel
   diagnosis anyway.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="cashfree.com"]');
    if (!a) return;
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'begin_checkout', {
          currency: 'INR',
          value: 14999,
          items: [{ item_name: 'TCC cohort fee', price: 14999, quantity: 1 }]
        });
      }
    } catch (err) { /* never block the redirect */ }
  }, true);
})();
