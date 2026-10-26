// Merge English patch files (_sources/en/lesson-XX.json) into content/n5/lessons.
// Usage: node merge_en.mjs [n ...]   (no args = all 25). Run check_en.mjs first.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");

const args = process.argv.slice(2).map(Number);
const ns = args.length ? args : Array.from({ length: 25 }, (_, i) => i + 1);
for (const n of ns) {
  const pad = String(n).padStart(2, "0");
  const lp = path.join(root, "content/n5/lessons", `lesson-${pad}.json`);
  const E = JSON.parse(fs.readFileSync(path.join(root, "_sources/en", `lesson-${pad}.json`), "utf8"));
  const L = JSON.parse(fs.readFileSync(lp, "utf8"));
  // Rebuild key order so the English field sits next to its Tamil source.
  const out = {};
  for (const [k, v] of Object.entries(L)) {
    if (k.endsWith("_en")) continue; // re-merge: replaced below
    out[k] = v;
    if (k === "intro_ta") out.intro_en = E.intro_en;
  }
  out.grammar = L.grammar.map((g) => {
    const e = E.grammar[g.id];
    const o = {};
    for (const [k, v] of Object.entries(g)) {
      if (k.endsWith("_en")) continue; // re-merge: replaced below
      o[k] = v;
      if (k === "explanation_ta") o.explanation_en = e.explanation_en;
      if (k === "tamil_parallel") o.tamil_parallel_en = e.tamil_parallel_en;
      if (k === "formation") o.formation_en = e.formation_en;
      if (k === "pitfalls_ta" && e.pitfalls_en) o.pitfalls_en = e.pitfalls_en;
    }
    return o;
  });
  out.test = {
    ...L.test,
    items: L.test.items.map((it) => {
      const o = {};
      for (const [k, v] of Object.entries(it)) {
        if (k.endsWith("_en")) continue; // re-merge: replaced below
        o[k] = v;
        if (k === "explanation_ta") o.explanation_en = E.items[it.id];
      }
      return o;
    }),
  };
  fs.writeFileSync(lp, JSON.stringify(out, null, 2) + "\n");
  console.log(`merged lesson ${n}`);
}
