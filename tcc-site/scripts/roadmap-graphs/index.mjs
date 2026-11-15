import fs from "node:fs";
import path from "node:path";
import { normalizeGraph, slugify } from "./lib.mjs";

const DIR = import.meta.dirname;

async function loadData() {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /^data-.*\.mjs$/.test(f))
    .sort();
  const merged = {};
  for (const file of files) {
    // dynamic import keeps each batch isolated and easy to extend
    const mod = await import(`./${file}`);
    Object.assign(merged, mod.default || {});
  }
  return merged;
}

const DATA = await loadData();

export function getGraph(slug) {
  const raw = DATA[slug];
  if (!raw) return null;
  return normalizeGraph({ slug, ...raw }, raw.title || slug);
}

export function hasGraph(slug) {
  return Boolean(DATA[slug]);
}

// Deterministic fallback so every roadmap always has a diagram, even before
// its curated outline lands. Phase titles and steps come from the generator.
export function fallbackGraph(item, section, phases) {
  const title = item.title;
  return normalizeGraph(
    {
      slug: item.slug,
      title,
      phases: phases.map((phase) => ({
        title: phase.title,
        topics: phase.steps.slice(0, 3).map((step) => {
          const clean = step.replace(/\.$/, "");
          return [
            clean,
            [`${title} fundamentals`, "Hands-on practice"],
          ];
        }),
      })),
    },
    title
  );
}

export { normalizeGraph, slugify };
