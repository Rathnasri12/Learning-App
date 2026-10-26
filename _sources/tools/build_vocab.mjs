// Build content/<level>/vocab-skeleton.json from the elzup JLPT word list for that level.
// Words already taught at a lower level are skipped. Usage: node build_vocab.mjs [n5|n4|n3]   (default n5)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { toRomaji } from "wanakana";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const level = process.argv[2] ?? "n5";
const LOWER = { n5: [], n4: ["n5"], n3: ["n5", "n4"] }[level];
if (!LOWER) throw new Error(`unknown level ${level}`);

const taught = new Set();
for (const l of LOWER) {
  const p = path.join(root, "content", l, "vocab-skeleton.json");
  for (const w of JSON.parse(fs.readFileSync(p, "utf8"))) taught.add(w.expression + "|" + w.reading);
}

const csv = fs.readFileSync(path.join(root, "_sources", `${level}_elzup.csv`), "utf8");
const rows = parse(csv, { columns: true, skip_empty_lines: true });
const seen = new Set();
const out = [];
let skipped = 0;
for (const r of rows) {
  const key = r.expression + "|" + r.reading;
  if (seen.has(key)) continue;
  seen.add(key);
  if (taught.has(key)) {
    skipped++;
    continue;
  }
  const romaji = toRomaji(r.reading.replace(/\s/g, ""), { upcaseKatakana: false }).replace(/nn$/, "n");
  out.push({
    id: `${level}-v-${String(out.length + 1).padStart(level === "n3" ? 4 : 3, "0")}`,
    expression: r.expression,
    reading: r.reading,
    romaji,
    en: r.meaning,
    tags: r.tags.split(" ").filter((t) => t.startsWith("JLPT_N")),
  });
}
fs.mkdirSync(path.join(root, "content", level), { recursive: true });
fs.writeFileSync(path.join(root, "content", level, "vocab-skeleton.json"), JSON.stringify(out, null, 1), "utf8");
console.log(level, "words", out.length, "skipped (taught at lower level)", skipped);
