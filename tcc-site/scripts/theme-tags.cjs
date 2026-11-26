/* ============================================================================
 * theme-tags.cjs — the single source of truth for the TCC theme <head> tags.
 *
 * Used by scripts/inject-theme.mjs (the codemod that patches built pages) and
 * by every page generator, so a rebuild can never drop the theme.
 * ==========================================================================*/
'use strict';

const BOOT_MARKER = 'tcc-theme:boot';

const boot = `<!-- ${BOOT_MARKER}: dark-only, applied before first paint -->
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
        meta.setAttribute('content', '#000000');
      })();
    </script>`;

const colorScheme = '<meta name="color-scheme" content="dark" />';

const ogImage = '<meta property="og:image" content="https://thecodingcompany.io/tcc-og.png" />';
const twitterCard = '<meta name="twitter:card" content="summary_large_image" />';

const cssMain = '/assets/css/tcc-theme.css?v=20261114a';
const cssPages = '/assets/css/tcc-theme-pages.css';

const cssLinks = `<!-- TCC theme: tokens, shell chrome, diagrams and light-mode overrides -->
    <link rel="stylesheet" href="${cssMain}" />
    <link rel="stylesheet" href="${cssPages}" />`;

const jsTheme = '/assets/js/tcc-theme.js';

const jsTag = `<!-- TCC theme: toggle, persistence and cross-tab sync -->
    <script src="${jsTheme}" defer></script>`;

/**
 * Insert the theme head tags into a complete HTML document string.
 * Idempotent: pieces already present are left untouched.
 */
function withTheme(html) {
  if (!html.includes(BOOT_MARKER)) {
    const vp = /<meta[^>]*name=["']viewport["'][^>]*>/i.exec(html);
    if (vp) {
      const at = vp.index + vp[0].length;
      html = html.slice(0, at) + '\n    ' + boot + html.slice(at);
    }
  }

  if (!/<meta[^>]*name=["']color-scheme["']/i.test(html)) {
    const vp = /<meta[^>]*name=["']viewport["'][^>]*>/i.exec(html);
    const at = vp ? vp.index + vp[0].length : 0;
    html = html.slice(0, at) + '\n    ' + colorScheme + html.slice(at);
  }

  if (!/property="og:image"/i.test(html)) {
    const vp = /<meta[^>]*name=["']viewport["'][^>]*>/i.exec(html);
    const at = vp ? vp.index + vp[0].length : 0;
    html = html.slice(0, at) + '\n    ' + ogImage + html.slice(at);
  }

  if (!/name="twitter:card"/i.test(html)) {
    const vp = /<meta[^>]*name=["']viewport["'][^>]*>/i.exec(html);
    const at = vp ? vp.index + vp[0].length : 0;
    html = html.slice(0, at) + '\n    ' + twitterCard + html.slice(at);
  }

  const needMain = !html.includes(cssMain);
  const needPages = !html.includes(cssPages);
  if (needMain || needPages) {
    const headClose = html.toLowerCase().indexOf('</head>');
    if (headClose !== -1) {
      const links = [];
      if (needMain) links.push(`<link rel="stylesheet" href="${cssMain}" />`);
      if (needPages) links.push(`<link rel="stylesheet" href="${cssPages}" />`);
      const block = `<!-- TCC theme: tokens, shell chrome, diagrams and light-mode overrides -->\n    ${links.join('\n    ')}`;
      html = html.slice(0, headClose) + block + '\n  ' + html.slice(headClose);
    }
  }

  if (!html.includes(jsTheme)) {
    const bodyClose = html.toLowerCase().lastIndexOf('</body>');
    if (bodyClose !== -1) {
      html = html.slice(0, bodyClose) + '    ' + jsTag + '\n  ' + html.slice(bodyClose);
    }
  }

  return html;
}

module.exports = {
  BOOT_MARKER,
  boot,
  colorScheme,
  cssMain,
  cssPages,
  cssLinks,
  jsTheme,
  jsTag,
  withTheme,
};
