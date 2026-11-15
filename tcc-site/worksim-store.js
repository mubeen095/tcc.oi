/* ==========================================================================
   WorkSim store — server-side only.
   Reads the generated catalogue from data/worksim/ and keeps it in memory.
   Never exposed as static files; only through /api/worksim/*.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data', 'worksim');

let cache = null;

function load() {
  if (cache) return cache;

  let catalog = { version: 1, shifts: [] };
  let packs = {};

  try {
    catalog = JSON.parse(fs.readFileSync(path.join(DATA, 'catalog.json'), 'utf8'));
  } catch {
    /* catalogue not built yet — serve an empty list */
  }

  try {
    packs = JSON.parse(fs.readFileSync(path.join(DATA, 'packs.json'), 'utf8'));
  } catch {
    /* packs not built yet */
  }

  cache = { catalog, packs };
  return cache;
}

module.exports = {
  manifest() {
    return load().catalog;
  },
  pack(id) {
    const packs = load().packs;
    return Object.prototype.hasOwnProperty.call(packs, id) ? packs[id] : null;
  },
  count() {
    return Object.keys(load().packs).length;
  }
};
