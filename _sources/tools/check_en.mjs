// Validate English patch files in _sources/en against the lesson JSON.
// Usage: node check_en.mjs [n ...]   (no args = all 25)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const TAMIL = /[஀-௿]/;
// Tamil outside parentheses or quotes is a sign of untranslated text.
const bareTamil = (s) => TAMIL.test(s.replace(/\([^)]*\)|（[^）]*）|"[^"]*"|“[^”]*”|'[^']*'/g, ""));

const args = process.argv.slice(2).map(Number);
const ns = args.length ? args : Array.from({ length: 25 }, (_, i) => i + 1);
let bad = 0;
for (const n of ns) {
  const pad = String(n).padStart(2, "0");
  const errs = [];
  const warns = [];
  const lp = path.join(root, "content/n5/lessons", `lesson-${pad}.json`);
  const ep = path.join(root, "_sources/en", `lesson-${pad}.json`);
  if (!fs.existsSync(ep)) {
    console.log(`Lesson ${n}: MISSING ${ep}`);
    bad++;
    continue;
  }
  const L = JSON.parse(fs.readFileSync(lp, "utf8"));
  let E;
  try {
    E = JSON.parse(fs.readFileSync(ep, "utf8"));
  } catch (e) {
    console.log(`Lesson ${n}: INVALID JSON ${e.message}`);
    bad++;
    continue;
  }
  const str = (v, where, tamilCheck = true) => {
    if (typeof v !== "string" || !v.trim()) errs.push(`${where}: empty/missing`);
    else if (tamilCheck && bareTamil(v)) warns.push(`${where}: Tamil outside parentheses`);
  };
  str(E.intro_en, "intro_en");
  for (const g of L.grammar) {
    const e = E.grammar?.[g.id];
    if (!e) {
      errs.push(`grammar ${g.id}: missing`);
      continue;
    }
    str(e.explanation_en, `${g.id}.explanation_en`);
    str(e.tamil_parallel_en, `${g.id}.tamil_parallel_en`, false);
    str(e.formation_en, `${g.id}.formation_en`);
    if (g.pitfalls_ta) str(e.pitfalls_en, `${g.id}.pitfalls_en`);
  }
  for (const it of L.test.items) str(E.items?.[it.id], `item ${it.id}`);
  if (errs.length) {
    bad++;
    console.log(`Lesson ${n}: ${errs.length} errors`);
    errs.slice(0, 20).forEach((e) => console.log("  " + e));
  } else console.log(`Lesson ${n}: OK${warns.length ? ` (${warns.length} warnings)` : ""}`);
  warns.slice(0, 10).forEach((w) => console.log("  warn " + w));
}
process.exit(bad ? 1 : 0);
