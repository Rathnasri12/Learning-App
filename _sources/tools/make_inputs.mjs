// Write per-lesson authoring inputs (meta + exact word list) for a level.
// Usage: node make_inputs.mjs [n5|n4|n3]   (n5 inputs live in _sources/lesson-inputs, others in _sources/lesson-inputs/<level>)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const level = process.argv[2] ?? "n5";
const c = (f) => JSON.parse(fs.readFileSync(path.join(root, "content", level, f), "utf8"));
const skel = c("vocab-skeleton.json");
const asg = c("vocab-assignment.json");
const syl = c("syllabus.json");
const inDir = path.join(root, "_sources/lesson-inputs", level === "n5" ? "" : level);
fs.mkdirSync(inDir, { recursive: true });
fs.mkdirSync(path.join(root, "content", level, "vocab"), { recursive: true });
fs.mkdirSync(path.join(root, "content", level, "lessons"), { recursive: true });
for (const l of syl.lessons) {
  const words = skel.filter((w) => asg[w.id] === l.n).map(({ tags, ...w }) => w);
  fs.writeFileSync(path.join(inDir, `lesson-${String(l.n).padStart(2, "0")}.json`), JSON.stringify({ level, meta: l, words }, null, 1));
}
console.log(level, "inputs written:", syl.lessons.length);
