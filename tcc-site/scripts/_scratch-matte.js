'use strict';
const fs = require('fs');
const path = require('path');
const { decodePng } = require('./build-company-logo-tiles.js');

const ROOT = path.join(__dirname, '..');
const src = path.join(ROOT, 'public', 'assets', 'growthx', 'partner-openai-network.src.png');
const img = decodePng(fs.readFileSync(src));
const { width: w, height: h, data } = img;

/* grid of plate estimates ------------------------------------------------ */
const GX = 48, GY = 20;
const cellR = [], cellG = [], cellB = [], cellN = [];
for (let i = 0; i < GX * GY; i++) { cellR.push([]); cellG.push([]); cellB.push([]); cellN.push(0); }

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    if (b - r < 60) continue;
    const gx = Math.min(GX - 1, (x * GX / w) | 0);
    const gy = Math.min(GY - 1, (y * GY / h) | 0);
    const i = gy * GX + gx;
    cellR[i].push(r); cellG[i].push(g); cellB[i].push(b); cellN[i]++;
  }
}
const med = (a) => { if (!a.length) return null; a.sort((p, q) => p - q); return a[a.length >> 1]; };
const plateR = [], plateG = [], plateB = [];
for (let i = 0; i < GX * GY; i++) {
  plateR.push(med(cellR[i])); plateG.push(med(cellG[i])); plateB.push(med(cellB[i]));
}

/* bilinear with nearest-valid fallback */
function samplePlate(x, y) {
  const gx = Math.min(GX - 1, Math.max(0, (x * GX / w) - 0.5));
  const gy = Math.min(GY - 1, Math.max(0, (y * GY / h) - 0.5));
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(GX - 1, x0 + 1), y1 = Math.min(GY - 1, y0 + 1);
  const fx = gx - x0, fy = gy - y0;
  const corners = [[x0, y0, (1 - fx) * (1 - fy)], [x1, y0, fx * (1 - fy)], [x0, y1, (1 - fx) * fy], [x1, y1, fx * fy]];
  let sr = 0, sg = 0, sb = 0, sw = 0;
  for (const [cx, cy, wt] of corners) {
    const i = cy * GX + cx;
    if (plateR[i] === null) continue;
    sr += plateR[i] * wt; sg += plateG[i] * wt; sb += plateB[i] * wt; sw += wt;
  }
  if (sw > 0) return [sr / sw, sg / sw, sb / sw];
  /* fallback: nearest valid cell */
  let best = null, bd = 1e9;
  for (let i = 0; i < GX * GY; i++) {
    if (plateR[i] === null) continue;
    const cx = i % GX, cy = (i / GX) | 0;
    const d = (cx - gx) ** 2 + (cy - gy) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return best === null ? [0, 0, 0] : [plateR[best], plateG[best], plateB[best]];
}

/* matte */
const alpha = new Float32Array(w * h);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    /* white artwork: r high AND not blue.  plate: r low and blue. */
    const fr = Math.min(1, Math.max(0, (r - 158) / 97));
    const fb = Math.min(1, Math.max(0, 1 - (b - r) / 46));
    const fg = Math.min(1, Math.max(0, (g - 150) / 105));
    let a = Math.min(fr, Math.min(fb, fg));
    alpha[y * w + x] = a;
  }
}

/* report artwork bbox + per-column opaque counts */
let x0 = w, x1 = -1, y0 = h, y1 = -1;
const colCount = new Int32Array(w);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (alpha[y * w + x] > 0.5) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; colCount[x]++; }
}
console.log('artwork bbox', x0, y0, x1, y1, 'of', w, h);
let runs = [], inRun = false, s = 0;
for (let x = 0; x < w; x++) {
  const has = colCount[x] > 2;
  if (has && !inRun) { inRun = true; s = x; }
  if (!has && inRun) { inRun = false; runs.push([s, x]); }
}
if (inRun) runs.push([s, w]);
console.log('column runs with artwork:', runs.map(r => r.join('-')).join('  '));

/* ascii of the artwork mask */
const step = 8;
console.log('artwork mask:');
for (let y = 0; y < h; y += 12) {
  let row = '';
  for (let x = 0; x < w; x += step) {
    let m = 0;
    for (let dy = 0; dy < 12; dy += 3) for (let dx = 0; dx < step; dx += 2) {
      if (x + dx < w && y + dy < h) m = Math.max(m, alpha[(y + dy) * w + x + dx]);
    }
    row += m > 0.8 ? '#' : m > 0.45 ? '+' : m > 0.15 ? '.' : ' ';
  }
  console.log('  ' + row);
}
