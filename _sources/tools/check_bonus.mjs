// Validate bonus vocab files (content/n5/bonus/lesson-XX.json).
// Usage: node check_bonus.mjs [n ...]   (no args = all 25, plus cross-lesson duplicate check)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const TAMIL = /[஀-௿]/;
const KANA = /^[぀-ヿー]+$/;
const split = (s) => s.split(/;\s*/).map((x) => x.trim());

const skel = JSON.parse(fs.readFileSync(path.join(root, "content/n5/vocab-skeleton.json"), "utf8"));
const n5Expr = new Set(skel.flatMap((v) => split(v.expression)));
const n5Read = new Set(skel.flatMap((v) => split(v.reading).map((r) => r.replace(/\s/g, ""))));

const args = process.argv.slice(2).map(Number);
const ns = args.length ? args : Array.from({ length: 25 }, (_, i) => i + 1);
const seen = new Map();
let bad = 0;
for (const n of ns) {
  const pad = String(n).padStart(2, "0");
  const p = path.join(root, "content/n5/bonus", `lesson-${pad}.json`);
  const errs = [];
  const warns = [];
  if (!fs.existsSync(p)) {
    console.log(`Lesson ${n}: MISSING`);
    bad++;
    continue;
  }
  let list;
  try {
    list = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`Lesson ${n}: INVALID JSON ${e.message}`);
    bad++;
    continue;
  }
  if (!Array.isArray(list) || list.length < 8 || list.length > 16) errs.push(`needs 8-16 entries, has ${list?.length}`);
  list.forEach((v, i) => {
    const w = `${v.id ?? i} ${v.expression}`;
    if (v.id !== `n5-b-${pad}-${String(i + 1).padStart(2, "0")}`) errs.push(`${w}: id should be n5-b-${pad}-${String(i + 1).padStart(2, "0")}`);
    if (!v.expression || !v.reading || !KANA.test(v.reading)) errs.push(`${w}: expression/reading (reading must be kana, no spaces)`);
    if (n5Expr.has(v.expression) && n5Read.has(v.reading)) errs.push(`${w}: is on the N5 list`);
    else if (n5Expr.has(v.expression)) warns.push(`${w}: expression matches an N5 word`);
    if (!v.en || !TAMIL.test(v.ta ?? "")) errs.push(`${w}: en/ta`);
    if (!v.pos) errs.push(`${w}: pos`);
    if (!Array.isArray(v.examples) || v.examples.length !== 1) errs.push(`${w}: needs exactly 1 example`);
    for (const e of v.examples ?? []) {
      if (!e.ja || !e.reading || !e.en || !TAMIL.test(e.ta ?? "")) errs.push(`${w}: example fields`);
      else if (/[一-鿿]/.test(e.reading)) errs.push(`${w}: example reading has kanji`);
    }
    const key = `${v.expression}|${v.reading}`;
    if (seen.has(key)) errs.push(`${w}: duplicate of lesson ${seen.get(key)}`);
    else seen.set(key, n);
  });
  if (errs.length) {
    bad++;
    console.log(`Lesson ${n}: ${errs.length} errors`);
    errs.slice(0, 25).forEach((e) => console.log("  " + e));
  } else console.log(`Lesson ${n}: OK (${list.length} words)${warns.length ? `, ${warns.length} warnings` : ""}`);
  warns.slice(0, 10).forEach((w) => console.log("  warn " + w));
}
process.exit(bad ? 1 : 0);
