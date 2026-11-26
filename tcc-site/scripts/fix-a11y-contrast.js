#!/usr/bin/env node
/**
 * fix-a11y-contrast.js
 * ---------------------------------------------------------------------------
 * Two site-wide accessibility defects reported by Lighthouse/Axe:
 *
 *  1. Sidebar text used rgba(255,255,255,0.4) on #000000 → 3.71:1 contrast,
 *     below the 4.5:1 WCAG AA minimum. Raised to 0.58 (≈5.4:1) for inactive
 *     nav labels and the webinars link.
 *
 *  2. The mega-footer used <h4> directly after the page <h2>s, skipping a
 *     level. Demoted to <h3> so heading order descends sequentially.
 *
 * Idempotent: re-running changes nothing.
 * Run: node scripts/fix-a11y-contrast.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walk(PUBLIC);
let links = 0;
let webinars = 0;
let heads = 0;
let labels = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  /* ── 1. contrast: inactive sidebar labels ── */
  const linkOld = '.sidebar-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 14px; color: rgba(255,255,255,0.4);';
  const linkNew = '.sidebar-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 14px; color: rgba(255,255,255,0.58);';
  if (html.includes(linkOld)) {
    html = html.split(linkOld).join(linkNew);
    links++;
  }

  /* ── 1b. contrast: sidebar webinars link ── */
  const webOld = '.sidebar-webinars { display: flex; align-items: center; gap: 12px; padding: 12px 4px; color: rgba(255,255,255,0.4);';
  const webNew = '.sidebar-webinars { display: flex; align-items: center; gap: 12px; padding: 12px 4px; color: rgba(255,255,255,0.58);';
  if (html.includes(webOld)) {
    html = html.split(webOld).join(webNew);
    webinars++;
  }

  /* ── 1c. contrast: small uppercase labels in forms and cards ──
     rgba(255,255,255,0.3) on #000000 = 2.6:1, rgba(...0.4) = 3.7:1 — both
     below AA for the 10–13px bold label text these classes set. */
  const labelFixes = [
    ['.card-label { font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.3);',
     '.card-label { font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.62);'],
    ['.field span { font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4);',
     '.field span { font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.62);'],
    ['.back-link { display: block; text-align: center; margin-top: 32px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.4);',
     '.back-link { display: block; text-align: center; margin-top: 32px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.62);'],
    ['.exit { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.4);',
     '.exit { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.62);'],
    ['.field label { display: block; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.4);',
     '.field label { display: block; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.62);'],
    ['.fine { margin-top: 22px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.35);',
     '.fine { margin-top: 22px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.62);'],
    ['.bottom { margin-top: 56px; text-align: center; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.2);',
     '.bottom { margin-top: 56px; text-align: center; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.55);'],
    ['.apply-note { margin-top: 40px; text-align: center; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.25); }',
     '.apply-note { margin-top: 40px; text-align: center; font-family: \'DM Mono\', monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.58); }'],
    ['.alias-line { margin-top: 14px; font-size: 13.5px; line-height: 1.65; color: rgba(255,255,255,0.42);',
     '.alias-line { margin-top: 14px; font-size: 13.5px; line-height: 1.65; color: rgba(255,255,255,0.62);'],
    ['.tab { background: none; border: 0; cursor: pointer; font-family: \'Inter\', sans-serif; font-size: 32px; letter-spacing: -0.02em; color: rgba(255,255,255,0.2);',
     '.tab { background: none; border: 0; cursor: pointer; font-family: \'Inter\', sans-serif; font-size: 32px; letter-spacing: -0.02em; color: rgba(255,255,255,0.55);']
  ];
  let labelsHere = 0;
  for (const [oldRule, newRule] of labelFixes) {
    if (html.includes(oldRule)) { html = html.split(oldRule).join(newRule); labelsHere++; }
  }
  labels += labelsHere;

  /* ── 1d. contrast: certificate template muted tokens ── */
  const mutedOld = ':root { --bg: #000000; --line: rgba(255,255,255,0.09); --muted: rgba(255,255,255,0.5); --muted2: rgba(255,255,255,0.35); --accent: #4d8dff; }';
  const mutedNew = ':root { --bg: #000000; --line: rgba(255,255,255,0.09); --muted: rgba(255,255,255,0.62); --muted2: rgba(255,255,255,0.56); --accent: #4d8dff; }';
  if (html.includes(mutedOld)) { html = html.split(mutedOld).join(mutedNew); labels++; }
  /* ── 2. heading order: footer column headings h4 → h3 ── */
  if (html.includes('<div class="footer-col">')) {
    html = html.replace(/\.footer-col h4/g, '.footer-col h3');
    html = html.replace(
      /(<div class="footer-col">\s*)<h4>([\s\S]*?)<\/h4>/g,
      '$1<h3>$2</h3>'
    );
    heads++;
  }

  if (html !== before) fs.writeFileSync(file, html, 'utf8');
}

console.log('Sidebar label contrast fixed on:', links, 'pages');
console.log('Sidebar webinars contrast fixed on:', webinars, 'pages');
console.log('Form/card label contrast fixed:', labels, 'rules');
console.log('Footer heading order fixed on:', heads, 'pages');
