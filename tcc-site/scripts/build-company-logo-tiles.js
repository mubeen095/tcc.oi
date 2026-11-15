/* ─────────────────────────────────────────────────────────────────────────
   scripts/build-company-logo-tiles.js

   Prepares the company logo tiles used by /prep+/companies/.

   Source artwork lives in  public/assets/img/company/<id>.png
   (512x512 RGB, opaque white plate). Output goes to
   public/assets/img/company/clean/<id>.png and is what the
   roster / company pages actually render.

   What it does, per logo:
     1. decode the PNG (8-bit, non-interlaced, pure Node + zlib)
     2. flatten the source plate onto white (sources are opaque white plates;
        this also makes transparent artwork safe)
     3. crop to the artwork bounding box, ignoring near-white plate noise
     4. re-compose onto a white square canvas so every logo has the same
        optical size and the same pixel density - a wide wordmark and a tall
        mark both sit identically inside their tile

   The output is an opaque white square. That is deliberate: the site renders
   every logo on a white tile, so the artwork's plate is invisible, brand
   colours stay exact, and no CSS filter has to guess at contrast. Do not
   invert or `cover` these files.

   The source files are never modified.

     node scripts/build-company-logo-tiles.js            # rebuild all
     node scripts/build-company-logo-tiles.js --check    # report only
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'public');
const SRC_DIR = path.join(SITE, 'assets', 'img', 'company');
const OUT_DIR = path.join(SRC_DIR, 'clean');

const CANVAS = 256;    // output canvas edge (px) - 2.5x the largest rendered tile
const FILL = 0.90;     // artwork occupies this fraction of the canvas
const NOISE = 52;      // distance from white below which a pixel is plate noise

/* ── PNG codec ─────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        color: data[9],
        interlace: data[12]
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }
  if (!ihdr) throw new Error('no IHDR');
  if (ihdr.depth !== 8) throw new Error(`unsupported bit depth ${ihdr.depth}`);
  if (ihdr.interlace) throw new Error('interlaced PNG not supported');

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.color];
  if (!channels) throw new Error(`unsupported colour type ${ihdr.color}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { width, height } = ihdr;
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          v = (v + pr) & 0xff;
          break;
        }
        default: throw new Error(`bad filter ${filter}`);
      }
      cur[x] = v;
    }
  }

  /* normalise to RGBA */
  const rgba = Buffer.alloc(width * height * 4, 0);
  for (let i = 0, n = width * height; i < n; i++) {
    const s = i * bpp, d = i * 4;
    if (channels === 1) { rgba[d] = rgba[d + 1] = rgba[d + 2] = out[s]; rgba[d + 3] = 255; }
    else if (channels === 2) { rgba[d] = rgba[d + 1] = rgba[d + 2] = out[s]; rgba[d + 3] = out[s + 1]; }
    else if (channels === 3) { rgba[d] = out[s]; rgba[d + 1] = out[s + 1]; rgba[d + 2] = out[s + 2]; rgba[d + 3] = 255; }
    else { rgba[d] = out[s]; rgba[d + 1] = out[s + 1]; rgba[d + 2] = out[s + 2]; rgba[d + 3] = out[s + 3]; }
  }
  return { width, height, data: rgba };
}

function encodePng(width, height, rgba) {
  const bpp = 4;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height);
  const cand = [Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride)];

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  for (let y = 0; y < height; y++) {
    const cur = rgba.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? rgba.subarray((y - 1) * stride, y * stride) : null;
    let best = 0, bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      const line = cand[f];
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? cur[x - bpp] : 0;
        const b = prev ? prev[x] : 0;
        const c = prev && x >= bpp ? prev[x - bpp] : 0;
        let v;
        if (f === 0) v = cur[x];
        else if (f === 1) v = cur[x] - a;
        else if (f === 2) v = cur[x] - b;
        else if (f === 3) v = cur[x] - ((a + b) >> 1);
        else v = cur[x] - paeth(a, b, c);
        v &= 0xff;
        line[x] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) { bestScore = score; best = f; }
    }
    raw[y * (stride + 1)] = best;
    cand[best].copy(raw, y * (stride + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   /* bit depth  */
  ihdr[9] = 6;   /* RGBA      */
  ihdr[10] = 0;  /* deflate   */
  ihdr[11] = 0;  /* adaptive  */
  ihdr[12] = 0;  /* no interlace */
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ── image helpers ─────────────────────────────────────────────────────── */

/* separable resample of an RGBA buffer.
   Shrinking uses an area average (no aliasing), growing uses bilinear. */
function resize(img, w, h) {
  const { width: sw, height: sh, data: src } = img;
  const out = Buffer.alloc(w * h * 4);

  /* footprint of every output sample along one axis */
  const axis = (len, olen) => {
    const ratio = len / olen;
    const spans = new Array(olen);
    for (let i = 0; i < olen; i++) {
      let a, b;
      if (ratio >= 1) {
        /* growing: bilinear tap centred between two source pixels */
        const s = (i + 0.5) * ratio - 0.5;
        const i0 = Math.max(0, Math.min(len - 1, Math.floor(s)));
        const i1 = Math.min(len - 1, i0 + 1);
        const f = s - Math.floor(s);
        spans[i] = [[i0, 1 - f], [i1, f]];
      } else {
        /* shrinking: every source pixel in the footprint, weighted by overlap */
        a = i * ratio;
        b = (i + 1) * ratio;
        const i0 = Math.max(0, Math.floor(a));
        const i1 = Math.min(len - 1, Math.ceil(b) - 1);
        const list = [];
        for (let k = i0; k <= i1; k++) {
          const span = Math.min(b, k + 1) - Math.max(a, k);
          if (span > 0) list.push([k, span]);
        }
        spans[i] = list.length ? list : [[Math.min(len - 1, Math.floor(a)), 1]];
      }
    }
    return spans;
  };

  const xs = axis(sw, w);
  const ys = axis(sh, h);

  /* horizontal pass */
  const tmp = Buffer.alloc(w * sh * 4);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < w; x++) {
      const d = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        let acc = 0, wacc = 0;
        for (const [i, wt] of xs[x]) {
          acc += src[(y * sw + i) * 4 + c] * wt;
          wacc += wt;
        }
        tmp[d + c] = wacc > 0 ? Math.round(acc / wacc) : 0;
      }
    }
  }

  /* vertical pass */
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        let acc = 0, wacc = 0;
        for (const [j, wt] of ys[y]) {
          acc += tmp[(j * w + x) * 4 + c] * wt;
          wacc += wt;
        }
        out[d + c] = wacc > 0 ? Math.round(acc / wacc) : 0;
      }
    }
  }
  return { width: w, height: h, data: out };
}

/* ── the actual tile build ─────────────────────────────────────────────── */

function buildTile(img) {
  const { width, height, data } = img;
  const n = width * height;

  /* 1. flatten onto white, then measure distance from white on the darkest
        channel. Transparent pixels become white plate, so they never count
        as ink. */
  const flat = Buffer.alloc(n * 4);
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const a = data[o + 3] / 255;
    const r = Math.round(data[o] * a + 255 * (1 - a));
    const g = Math.round(data[o + 1] * a + 255 * (1 - a));
    const b = Math.round(data[o + 2] * a + 255 * (1 - a));
    flat[o] = r; flat[o + 1] = g; flat[o + 2] = b; flat[o + 3] = 255;
    dist[i] = 255 - Math.min(r, g, b);
  }

  /* 2. bounding box of actual artwork. Anything within NOISE of white is
        plate (JPEG sparkle, soft shadows, a stray off-white edge). */
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (dist[y * width + x] > NOISE) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null; /* blank artwork */

  /* keep a hair of anti-aliasing on every edge */
  x0 = Math.max(0, x0 - 1);
  y0 = Math.max(0, y0 - 1);
  x1 = Math.min(width - 1, x1 + 1);
  y1 = Math.min(height - 1, y1 + 1);

  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;

  /* 3. crop */
  const cropped = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    flat.copy(cropped, y * cw * 4, ((y + y0) * width + x0) * 4, ((y + y0) * width + x1 + 1) * 4);
  }

  /* 4. normalise onto the square white canvas */
  const target = CANVAS * FILL;
  const scale = Math.min(target / cw, target / ch);
  const rw = Math.max(1, Math.round(cw * scale));
  const rh = Math.max(1, Math.round(ch * scale));
  const art = resize({ width: cw, height: ch, data: cropped }, rw, rh);

  const canvas = Buffer.alloc(CANVAS * CANVAS * 4, 255);
  const ox = Math.floor((CANVAS - rw) / 2);
  const oy = Math.floor((CANVAS - rh) / 2);
  for (let y = 0; y < rh; y++) {
    art.data.copy(canvas, ((y + oy) * CANVAS + ox) * 4, y * rw * 4, (y + 1) * rw * 4);
  }

  return {
    png: encodePng(CANVAS, CANVAS, canvas),
    bbox: { w: cw, h: ch }
  };
}

/* ── run ───────────────────────────────────────────────────────────────── */

function main() {
  const check = process.argv.includes('--check');
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`missing ${SRC_DIR}`);
    process.exit(1);
  }
  if (!check && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR)
    .filter((f) => f.endsWith('.png'))
    .sort();

  let done = 0;
  const report = [];
  for (const file of files) {
    const id = path.basename(file, '.png');
    const src = path.join(SRC_DIR, file);
    const out = path.join(OUT_DIR, `${id}.png`);
    let tile;
    try {
      tile = buildTile(decodePng(fs.readFileSync(src)));
    } catch (err) {
      console.error(`  ! ${id}: ${err.message}`);
      continue;
    }
    if (!tile) {
      console.error(`  ! ${id}: no visible artwork`);
      continue;
    }
    if (!check) fs.writeFileSync(out, tile.png);
    report.push({ id, w: tile.bbox.w, h: tile.bbox.h, bytes: tile.png.length });
    done++;
  }

  if (check) {
    report.forEach((r) => console.log(`${r.id.padEnd(18)} art ${String(r.w).padStart(4)}x${String(r.h).padStart(4)}`));
    console.log(`\n${done} logo(s) would be rebuilt.`);
    return;
  }

  const total = report.reduce((a, r) => a + r.bytes, 0);
  console.log(`Rebuilt ${done} logo tile(s) -> ${path.relative(ROOT, OUT_DIR)}`);
  console.log(`Total ${(total / 1024).toFixed(0)} KB (avg ${(total / done / 1024).toFixed(1)} KB)`);
}

if (require.main === module) main();

module.exports = { decodePng, encodePng, buildTile, resize };
