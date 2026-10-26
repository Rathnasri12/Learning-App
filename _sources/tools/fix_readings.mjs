// Repair known errors in the elzup word lists, everywhere they were copied:
// the skeleton, the lesson inputs and the written vocab files.
//  - entries with kanji in the reading field / missing reading / misspelled expression (FIX table)
//  - する-nouns whose reading carries する but whose expression does not (せいさんする → せいさん)
// Usage: node fix_readings.mjs <level>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toRomaji } from "wanakana";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const level = process.argv[2];
const FIX = {
  n4: {
    "n4-v-111": ["嘘", "うそ"],
    "n4-v-235": ["頂く", "いただく"],
    "n4-v-254": ["挨拶", "あいさつ"],
    "n4-v-309": ["ご覧になる", "ごらんになる"],
    "n4-v-352": ["一杯", "いっぱい"],
    "n4-v-551": ["格好", "かっこう"],
    "n4-v-552": ["構う", "かまう"],
    "n4-v-636": ["お陰", "おかげ"],
    "n4-v-656": ["嬉しい", "うれしい"],
    "n4-v-506": ["下がる", "さがる"],
  },
  n3: {},
}[level];
if (!FIX) throw new Error("usage: fix_readings.mjs n4|n3");
const MISSPELT = { 楽む: "楽しむ", 落る: "落ちる" };

function apply(w) {
  let changed = false;
  const f = FIX[w.id];
  if (f && (w.expression !== f[0] || w.reading !== f[1])) {
    [w.expression, w.reading] = f;
    changed = true;
  }
  if (MISSPELT[w.expression]) {
    w.expression = MISSPELT[w.expression];
    changed = true;
  }
  if (/する$/.test(w.reading) && !/する$/.test(w.expression)) {
    w.reading = w.reading.replace(/する$/, "");
    changed = true;
  }
  if (changed) w.romaji = toRomaji(w.reading.replace(/\s/g, ""));
  return changed;
}

const files = [path.join(root, "content", level, "vocab-skeleton.json")];
for (const d of [`_sources/lesson-inputs/${level}`, `content/${level}/vocab`]) {
  const dir = path.join(root, d);
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) files.push(path.join(dir, f));
}
let nFiles = 0;
let nWords = 0;
for (const p of files) {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : data.words;
  const c = list.filter(apply).length;
  if (c) {
    const indent = raw.startsWith("[\n  ") || raw.startsWith("{\n  ") ? 2 : 1;
    fs.writeFileSync(p, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
    nFiles++;
    nWords += c;
  }
}
console.log(level, "fixed", nWords, "entries in", nFiles, "files");
