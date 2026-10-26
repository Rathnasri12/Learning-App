// Validate kanji unit files (content/kanji/n5/unit-XX.json) and the exam file.
// Usage: node check_kanji.mjs [unit ...] [exam]   (no args = all units + exam)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const dir = path.join(root, "content/kanji/n5");
const units = JSON.parse(fs.readFileSync(path.join(dir, "units.json"), "utf8")).units;
const skel = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(dir, "skeleton.json"), "utf8")).map((k) => [k.kanji, k]));
const vocabIds = new Set();
for (let n = 1; n <= 25; n++) {
  const d = JSON.parse(fs.readFileSync(path.join(root, "content/n5/vocab", `lesson-${String(n).padStart(2, "0")}.json`), "utf8"));
  for (const v of Array.isArray(d) ? d : d.vocab) vocabIds.add(v.id);
}
const TAMIL = /[஀-௿]/;
const norm = (r) => r.replace(/[.\-]/g, "");

function checkItems(items, errs, prefix, expectCount) {
  if (expectCount && items.length !== expectCount) errs.push(`test: ${items.length} items, expected ${expectCount}`);
  const idx = [0, 0, 0, 0];
  const ids = new Set();
  for (const it of items) {
    const w = `item ${it.id}`;
    if (!it.id?.startsWith(prefix)) errs.push(`${w}: id should start with ${prefix}`);
    if (ids.has(it.id)) errs.push(`${w}: duplicate id`);
    ids.add(it.id);
    if (!["kanji_reading", "orthography"].includes(it.type)) errs.push(`${w}: type ${it.type}`);
    if (typeof it.sentence !== "string" || !/＿[^＿]+＿/.test(it.sentence)) errs.push(`${w}: sentence needs ＿target＿`);
    else {
      const t = it.sentence.match(/＿([^＿]+)＿/)[1];
      if (it.target !== t) errs.push(`${w}: target "${it.target}" != underlined "${t}"`);
    }
    if (!Array.isArray(it.options) || it.options.length !== 4) errs.push(`${w}: needs 4 options`);
    else if (new Set(it.options).size !== 4) errs.push(`${w}: duplicate options`);
    if (!(it.answer >= 0 && it.answer <= 3)) errs.push(`${w}: answer index`);
    else idx[it.answer]++;
    if (!it.explanation_en?.trim()) errs.push(`${w}: explanation_en missing`);
    if (!TAMIL.test(it.explanation_ta ?? "")) errs.push(`${w}: explanation_ta missing/not Tamil`);
  }
  if (items.length >= 8 && Math.max(...idx) - Math.min(...idx) > Math.ceil(items.length / 8)) errs.push(`answer spread uneven ${idx.join("/")}`);
}

const args = process.argv.slice(2);
const targets = args.length ? args : [...units.map((u) => String(u.n)), "exam"];
let bad = 0;
for (const t of targets) {
  const errs = [];
  if (t === "exam") {
    const p = path.join(dir, "exam.json");
    if (!fs.existsSync(p)) {
      console.log("exam: MISSING");
      bad++;
      continue;
    }
    const E = JSON.parse(fs.readFileSync(p, "utf8"));
    checkItems(E.items ?? [], errs, "KX-q", 30);
    if (!(E.passMark > 0)) errs.push("passMark missing");
    if (errs.length) {
      bad++;
      console.log(`exam: ${errs.length} errors`);
      errs.slice(0, 30).forEach((e) => console.log("  " + e));
    } else console.log("exam: OK");
    continue;
  }
  const n = Number(t);
  const u = units.find((x) => x.n === n);
  const p = path.join(dir, `unit-${String(n).padStart(2, "0")}.json`);
  if (!fs.existsSync(p)) {
    console.log(`Unit ${n}: MISSING`);
    bad++;
    continue;
  }
  let U;
  try {
    U = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`Unit ${n}: INVALID JSON ${e.message}`);
    bad++;
    continue;
  }
  if (U.unit !== n) errs.push("unit number");
  if (!U.intro?.en || !TAMIL.test(U.intro?.ta ?? "")) errs.push("intro en/ta");
  const got = (U.kanji ?? []).map((k) => k.kanji).join("");
  if (got !== u.kanji.join("")) errs.push(`kanji order/set "${got}" != "${u.kanji.join("")}"`);
  for (const k of U.kanji ?? []) {
    const w = `kanji ${k.kanji}`;
    const s = skel[k.kanji];
    if (!k.meaning?.en || !TAMIL.test(k.meaning?.ta ?? "")) errs.push(`${w}: meaning en/ta`);
    if (!k.mnemonic?.en || !TAMIL.test(k.mnemonic?.ta ?? "")) errs.push(`${w}: mnemonic en/ta`);
    if (k.note && (!k.note.en || !TAMIL.test(k.note.ta ?? ""))) errs.push(`${w}: note needs en and ta`);
    for (const [kind, list] of [["on", k.on], ["kun", k.kun]]) {
      if (!Array.isArray(list)) errs.push(`${w}: ${kind} must be an array`);
      else
        for (const r of list)
          if (s && !s[kind].some((x) => norm(x.kana) === norm(r))) errs.push(`${w}: ${kind} reading ${r} not in dictionary list`);
    }
    if (!k.on?.length && !k.kun?.length) errs.push(`${w}: no readings`);
    if (!Array.isArray(k.examples) || k.examples.length < 3 || k.examples.length > 4) errs.push(`${w}: needs 3-4 examples`);
    for (const e of k.examples ?? []) {
      if (!e.word?.includes(k.kanji)) errs.push(`${w}: example ${e.word} lacks the kanji`);
      if (!e.reading || /[^぀-ヿー]/.test(e.reading)) errs.push(`${w}: example ${e.word} reading must be kana`);
      if (!e.en || !TAMIL.test(e.ta ?? "")) errs.push(`${w}: example ${e.word} en/ta`);
      if (e.vocabId && !vocabIds.has(e.vocabId)) errs.push(`${w}: unknown vocabId ${e.vocabId}`);
    }
  }
  checkItems(U.test?.items ?? [], errs, `KU${n}-q`, 16);
  const types = (U.test?.items ?? []).reduce((a, it) => ((a[it.type] = (a[it.type] ?? 0) + 1), a), {});
  if (types.kanji_reading !== 10 || types.orthography !== 6) errs.push(`item mix ${JSON.stringify(types)} (want 10 reading + 6 orthography)`);
  if (errs.length) {
    bad++;
    console.log(`Unit ${n}: ${errs.length} errors`);
    errs.slice(0, 30).forEach((e) => console.log("  " + e));
  } else console.log(`Unit ${n}: OK`);
}
process.exit(bad ? 1 : 0);
