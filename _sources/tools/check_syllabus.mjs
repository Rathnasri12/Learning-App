// Validate content/<level>/syllabus.json and vocab-assignment.json.
// Usage: node check_syllabus.mjs <level>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const level = process.argv[2];
const SIZE = { n4: { lessons: 30, min: 18, max: 28 }, n3: { lessons: 40, min: 45, max: 62 } }[level];
if (!SIZE) throw new Error("usage: check_syllabus.mjs n4|n3");
const TAMIL = /[஀-௿]/;
const errs = [];
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "content", level, f), "utf8"));
const syl = read("syllabus.json");
const skel = read("vocab-skeleton.json");
const asg = read("vocab-assignment.json");

if (syl.level !== level) errs.push("level field");
if (syl.lessonCount !== SIZE.lessons || syl.lessons?.length !== SIZE.lessons) errs.push(`need ${SIZE.lessons} lessons`);
const gids = new Set();
const patterns = new Map();
let gTotal = 0;
for (const [i, l] of (syl.lessons ?? []).entries()) {
  const w = `lesson ${l.n}`;
  if (l.n !== i + 1) errs.push(`${w}: n out of order`);
  if (!l.slug) errs.push(`${w}: slug`);
  if (!l.title?.ja || !l.title?.en || !TAMIL.test(l.title?.ta ?? "")) errs.push(`${w}: title ja/en/ta`);
  if (!l.theme?.en || !TAMIL.test(l.theme?.ta ?? "")) errs.push(`${w}: theme en/ta`);
  if (!Array.isArray(l.grammar) || l.grammar.length < 2 || l.grammar.length > 8) errs.push(`${w}: 2-8 grammar points`);
  (l.grammar ?? []).forEach((g, k) => {
    gTotal++;
    const want = `g${String(l.n).padStart(2, "0")}-${k + 1}`;
    if (g.id !== want) errs.push(`${w}: grammar id ${g.id} should be ${want}`);
    if (gids.has(g.id)) errs.push(`${w}: duplicate grammar id ${g.id}`);
    gids.add(g.id);
    if (!g.pattern || !g.en) errs.push(`${w}: ${g.id} pattern/en`);
    const p = (g.pattern ?? "").replace(/\s/g, "");
    if (patterns.has(p)) errs.push(`${w}: pattern "${g.pattern}" repeats ${patterns.get(p)}`);
    patterns.set(p, g.id);
  });
  if (!Array.isArray(l.vocabHints) || l.vocabHints.length < 2) errs.push(`${w}: vocabHints`);
}
const counts = {};
for (const w of skel) {
  const n = asg[w.id];
  if (!Number.isInteger(n) || n < 1 || n > SIZE.lessons) errs.push(`assignment: ${w.id} ${w.expression} -> ${n}`);
  else counts[n] = (counts[n] ?? 0) + 1;
}
for (const id of Object.keys(asg)) if (!skel.some((w) => w.id === id)) errs.push(`assignment: unknown id ${id}`);
for (let n = 1; n <= SIZE.lessons; n++) {
  const c = counts[n] ?? 0;
  if (c < SIZE.min || c > SIZE.max) errs.push(`lesson ${n}: ${c} words (want ${SIZE.min}-${SIZE.max})`);
}
console.log(`${level}: ${syl.lessons?.length} lessons, ${gTotal} grammar points, ${skel.length} words`);
errs.slice(0, 40).forEach((e) => console.log("  " + e));
console.log(errs.length ? `FAIL (${errs.length} errors)` : "OK");
process.exit(errs.length ? 1 : 0);
