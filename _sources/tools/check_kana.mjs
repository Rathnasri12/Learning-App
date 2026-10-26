// Validate content/kana/<script>.json against the kana skeleton.
// Usage: node check_kana.mjs [hiragana] [katakana]   (no args = both)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const TAMIL = /[஀-௿]/;
const skel = JSON.parse(fs.readFileSync(path.join(root, "content/kana/skeleton.json"), "utf8"));
const bi = (x) => !!x?.en?.trim() && TAMIL.test(x?.ta ?? "");
const RULES = {
  hiragana: ["dakuten", "handakuten", "yoon", "sokuon", "long-vowels", "particles"],
  katakana: ["katakana-intro", "long-vowel-mark", "dakuten", "handakuten", "yoon", "sokuon", "extended"],
};
const SCRIPT_RE = { hiragana: /^[぀-ゟ]+$/, katakana: /^[゠-ヿー]+$/ };

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["hiragana", "katakana"];
let bad = 0;
for (const script of targets) {
  const p = path.join(root, "content/kana", `${script}.json`);
  const errs = [];
  if (!fs.existsSync(p)) {
    console.log(`${script}: MISSING`);
    bad++;
    continue;
  }
  let D;
  try {
    D = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`${script}: INVALID JSON ${e.message}`);
    bad++;
    continue;
  }
  if (D.script !== script) errs.push("script field");
  if (!bi(D.intro)) errs.push("intro en/ta");
  for (const u of skel[script]) {
    if (!bi(D.units?.[String(u.n)])) errs.push(`units.${u.n} en/ta`);
    for (const c of u.chars) {
      const e = D.chars?.[c.kana];
      const w = `${c.kana} (${c.romaji})`;
      if (!e) {
        errs.push(`${w}: missing`);
        continue;
      }
      if (u.n <= 3 && !bi(e.mnemonic)) errs.push(`${w}: mnemonic en/ta required`);
      if (e.note && !bi(e.note)) errs.push(`${w}: note needs en and ta`);
      // ヲ ヂ ヅ almost never appear in real katakana words, so their example is optional.
      if (!e.example && script === "katakana" && "ヲヂヅ".includes(c.kana)) continue;
      if (!e.example?.word || !e.example.en || !TAMIL.test(e.example.ta ?? "")) errs.push(`${w}: example word/en/ta`);
      else {
        if (!e.example.word.includes(c.kana)) errs.push(`${w}: example ${e.example.word} lacks the kana`);
        if (!SCRIPT_RE[script].test(e.example.word)) errs.push(`${w}: example ${e.example.word} must be only ${script}`);
      }
    }
  }
  const ids = (D.rules ?? []).map((r) => r.id);
  for (const id of RULES[script]) if (!ids.includes(id)) errs.push(`rule ${id} missing`);
  for (const r of D.rules ?? []) {
    if (!skel[script].some((u) => u.n === r.unit)) errs.push(`rule ${r.id}: bad unit`);
    if (!bi(r.title) || !bi(r.body)) errs.push(`rule ${r.id}: title/body en/ta`);
    if (!Array.isArray(r.examples) || r.examples.length < 2) errs.push(`rule ${r.id}: needs 2+ examples`);
    for (const x of r.examples ?? []) if (!x.word || !x.en || !TAMIL.test(x.ta ?? "")) errs.push(`rule ${r.id}: example fields`);
  }
  if (errs.length) {
    bad++;
    console.log(`${script}: ${errs.length} errors`);
    errs.slice(0, 30).forEach((e) => console.log("  " + e));
  } else console.log(`${script}: OK`);
}
process.exit(bad ? 1 : 0);
