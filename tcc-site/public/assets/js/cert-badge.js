/* ============================================================================
 * TCC CERT+ credential badge — shared by the catalogue (/bootcamps) and the
 * credential pages (/bootcamps/cert). Load before each page's inline script.
 *
 * Exposes:
 *   window.CERT_LEVEL_COLORS  — tier → accent colour
 *   window.certBadgeSvg(level) — the seal + ribbon mark (46×54 viewBox)
 *   window.certInitials(name)  — up to two monogram letters for a role
 * ==========================================================================*/
(function () {
  var LEVEL_COLORS = {
    Foundation: '#c9c9c9',
    Practitioner: '#4d8dff',
    Strategist: '#9b86ff',
    Executive: '#e8b84b'
  };

  /* Two letters where a role has two words ("Financial Analyst" → FA),
     otherwise the first two letters of the word ("CISO" → CI). Keeps every
     badge readable instead of a lone letter. */
  function certInitials(name) {
    var parts = String(name || '').replace(/CERT\+/g, '').replace(/[^A-Za-z ]/g, '').trim().split(/\s+/);
    var first = parts[0] || '';
    var second = parts[1] || '';
    var out = second ? (first.charAt(0) + second.charAt(0)) : first.slice(0, 2);
    return out.toUpperCase();
  }

  function certBadgeSvg(level) {
    var c = LEVEL_COLORS[level] || '#888';
    return '<svg viewBox="0 0 46 54" aria-hidden="true" focusable="false">' +
      '<path d="M12.6 31.4 10 51.2 23 45.3l13 5.9-2.6-19.8" fill="' + c + '" fill-opacity="0.16" stroke="' + c + '" stroke-opacity="0.45" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<circle cx="23" cy="19.5" r="15.5" fill="' + c + '" fill-opacity="0.07" stroke="' + c + '" stroke-opacity="0.55" stroke-width="1.5"/>' +
      '<circle cx="23" cy="19.5" r="11" fill="none" stroke="' + c + '" stroke-opacity="0.26" stroke-width="1" stroke-dasharray="1.6 3.2"/>' +
    '</svg>';
  }

  window.CERT_LEVEL_COLORS = LEVEL_COLORS;
  window.certBadgeSvg = certBadgeSvg;
  window.certInitials = certInitials;
})();
