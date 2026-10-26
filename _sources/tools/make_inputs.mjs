import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const skel = JSON.parse(fs.readFileSync(path.join(root, "content/n5/vocab-skeleton.json"), "utf8"));
const asg = JSON.parse(fs.readFileSync(path.join(root, "content/n5/vocab-assignment.json"), "utf8"));
const syl = JSON.parse(fs.readFileSync(path.join(root, "content/n5/syllabus.json"), "utf8"));
fs.mkdirSync(path.join(root, "_sources/lesson-inputs"), { recursive: true });
fs.mkdirSync(path.join(root, "content/n5/vocab"), { recursive: true });
fs.mkdirSync(path.join(root, "content/n5/lessons"), { recursive: true });
for (const l of syl.lessons) {
  const words = skel.filter((w) => asg[w.id] === l.n).map(({ tags, ...w }) => w);
  const out = { meta: l, words };
  fs.writeFileSync(
    path.join(root, "_sources/lesson-inputs", `lesson-${String(l.n).padStart(2, "0")}.json`),
    JSON.stringify(out, null, 1),
  );
}
console.log("inputs written");
