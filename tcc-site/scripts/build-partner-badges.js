/* ─────────────────────────────────────────────────────────────────────────
   scripts/build-partner-badges.js

   Prepares the two partner badges used by the home page partner strip.

     source  assets/growthx/partner-openai-network.src.png   (RGBA, transparent)
     source  assets/growthx/partner-lovable.src.png          (RGB on a dark plate)

     output  assets/growthx/partner-openai-network.png       (trimmed, scaled)
     output  assets/growthx/partner-lovable.png              (trimmed, transparent)

   The Lovable artwork is a dark card: white logo + white tagline on a near
   black plate, plus a decorative glow in the top-right corner. The glow is
   cropped away and the plate is lifted into a real alpha channel so the
   badge sits straight on the page like every other logo on the site.

     node scripts/build-partner-badges.js
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');
const { decodePng, encodePng, resize } = require('./build-company-logo-tiles.js');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'public', 'assets', 'growthx');

const MAX_W = 880;          /* output width cap */

/* ── helpers ───────────────────────────────────────────────────────────── */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function crop(img, x0, y0, x1, y1) {
  const w = x1 - x0, h = y1 - y0;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    img.data.copy(data, y * w * 4, ((y + y0) * img.width + x0) * 4, ((y + y0) * img.width + x1) * 4);
  }
  return { width: w, height: h, data };
}

function alphaBBox(img, min) {
  let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (img.data[(y * img.width + x) * 4 + 3] >= min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

function fitWidth(img, maxW) {
  if (img.width <= maxW) return img;
  const w = maxW;
  const h = Math.max(1, Math.round(img.height * (maxW / img.width)));
  return resize(img, w, h);
}

/* ── 1. OpenAI Partner Network badge ─────────────────────────────────────
   The badge is white artwork (the knot + the "Partner Network" wordmark)
   sitting on a blue gradient plate. The plate is always blue and always
   darker than the artwork in red, so a pixel is artwork when it is bright
   in red *and* green and no longer carries the plate's blue cast. The
   three tests are combined and the result is written as a white
   silhouette, which is how every other logo on the site is drawn. */
function openaiBadge() {
  const src = path.join(DIR, 'partner-openai-network.src.png');
  const img = decodePng(fs.readFileSync(src));
  const { width: w, height: h, data } = img;

  const rgba = Buffer.alloc(w * h * 4);
  let opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const fr = clamp01((r - 158) / 97);      /* bright in red   */
      const fg = clamp01((g - 150) / 105);     /* bright in green */
      const fb = clamp01(1 - (b - r) / 46);    /* free of the plate's blue */
      const a = Math.min(fr, Math.min(fg, fb));
      if (a <= 0.02) continue;
      opaque++;
      rgba[o] = 255; rgba[o + 1] = 255; rgba[o + 2] = 255;
      rgba[o + 3] = Math.round(a * 255);
    }
  }

  const art = { width: w, height: h, data: rgba };
  const box = alphaBBox(art, 8);
  if (!box) throw new Error('openai badge is empty');
  const out = fitWidth(crop(art, box.x0, box.y0, box.x1, box.y1), MAX_W);
  for (let i = 3; i < out.data.length; i += 4) out.data[i] = Math.round(out.data[i] / 16) * 16;
  fs.writeFileSync(path.join(DIR, 'partner-openai-network.png'), encodePng(out.width, out.height, out.data));
  console.log(`openai badge  ${img.width}x${img.height} -> ${out.width}x${out.height}  (artwork ${(opaque * 100 / (w * h)).toFixed(1)}%)`);
}

/* ── 2. Lovable badge ──────────────────────────────────────────────────── */
function lovableBadge() {
  const src = path.join(DIR, 'partner-lovable.src.png');
  const img = decodePng(fs.readFileSync(src));

  /* the source card carries a decorative glow in the top-right corner - crop
     it off before the plate is lifted, otherwise it turns into a haze */
  const CUT = 100;
  const card = crop(img, 0, CUT, img.width, img.height);

  const LO = 46;   /* below this the pixel is plate */
  const HI = 198;  /* at/above this the pixel is solid artwork */
  const n = card.width * card.height;
  const rgba = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const lum = 0.2126 * card.data[o] + 0.7152 * card.data[o + 1] + 0.0722 * card.data[o + 2];
    let a = (lum - LO) / (HI - LO);
    if (a < 0) a = 0;
    if (a > 1) a = 1;
    if (a <= 0.02) { rgba[o] = rgba[o + 1] = rgba[o + 2] = rgba[o + 3] = 0; continue; }
    /* lift the artwork back out of the dark plate */
    for (let c = 0; c < 3; c++) {
      const v = card.data[o + c] / a;
      rgba[o + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    rgba[o + 3] = Math.round(a * 255);
  }

  const art = { width: card.width, height: card.height, data: rgba };
  const box = alphaBBox(art, 40);
  if (!box) throw new Error('lovable badge is empty');
  const trimmed = crop(art, box.x0, box.y0, box.x1, box.y1);
  const out = fitWidth(trimmed, MAX_W);
  fs.writeFileSync(path.join(DIR, 'partner-lovable.png'), encodePng(out.width, out.height, out.data));
  console.log(`lovable badge ${img.width}x${img.height} -> ${out.width}x${out.height}`);
}

openaiBadge();
lovableBadge();
