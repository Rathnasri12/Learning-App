// Build a level's kanji skeleton: list + readings (kanji-data, MIT), stroke paths (KanjiVG, CC BY-SA 3.0),
// and candidate example words from the course word lists.
// Usage: node build_kanji.mjs [n5|n4|n3]   (from _sources/tools)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toRomaji } from "wanakana";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const kd = JSON.parse(fs.readFileSync(path.join(root, "_sources/kanji/kanji-data.json"), "utf8"));
const svgDir = path.join(root, "_sources/kanji/kanjivg");
fs.mkdirSync(svgDir, { recursive: true });

const level = process.argv[2] ?? "n5";
const levelNum = Number(level.slice(1));
const first = (s) => s.split(/;\s*/)[0];

// Candidate example words. N5 uses the finished lesson vocab (it has Tamil); higher levels use the
// word-list skeletons of this level first, then lower levels.
const vocab = [];
if (level === "n5") {
  for (let n = 1; n <= 25; n++) {
    const f = path.join(root, "content/n5/vocab", `lesson-${String(n).padStart(2, "0")}.json`);
    for (const v of JSON.parse(fs.readFileSync(f, "utf8"))) vocab.push({ ...v, level: "n5", lesson: n });
  }
} else {
  for (const l of [level, ...["n4", "n5"].filter((x) => Number(x.slice(1)) > levelNum)]) {
    const ap = path.join(root, "content", l, "vocab-assignment.json");
    const asg = fs.existsSync(ap) ? JSON.parse(fs.readFileSync(ap, "utf8")) : {};
    for (const v of JSON.parse(fs.readFileSync(path.join(root, "content", l, "vocab-skeleton.json"), "utf8")))
      vocab.push({ ...v, level: l, lesson: asg[v.id] ?? null });
  }
}

const list = Object.entries(kd)
  .filter(([, v]) => v.jlpt_new === levelNum)
  // easier first: school grade, then frequency (N5 keeps the dataset order; its units are hand-themed)
  .sort(([, a], [, b]) => (level === "n5" ? 0 : (a.grade ?? 9) - (b.grade ?? 9) || (a.freq ?? 9999) - (b.freq ?? 9999)));
const romaji = (s) => toRomaji(s.replace(/[.\-!]/g, ""));
const out = [];
for (const [k, v] of list) {
  const hex = k.codePointAt(0).toString(16).padStart(5, "0");
  const svgPath = path.join(svgDir, `${hex}.svg`);
  if (!fs.existsSync(svgPath)) {
    const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
    if (!res.ok) throw new Error(`KanjiVG ${k}: ${res.status}`);
    fs.writeFileSync(svgPath, await res.text());
  }
  const svg = fs.readFileSync(svgPath, "utf8");
  const strokes = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  const examples = vocab
    .filter((w) => first(w.expression).includes(k))
    .slice(0, level === "n5" ? 99 : 8)
    .map((w) => ({ id: w.id, level: w.level, lesson: w.lesson, expression: first(w.expression), reading: first(w.reading), ...(level === "n5" ? {} : { en: w.en }) }));
  out.push({
    kanji: k,
    strokeCount: v.strokes,
    strokes,
    meanings_en: v.meanings,
    on: v.readings_on.map((r) => ({ kana: r, romaji: romaji(r) })),
    kun: v.readings_kun.map((r) => ({ kana: r, romaji: romaji(r) })),
    vocabExamples: examples,
  });
  if (strokes.length !== v.strokes) console.warn(`stroke mismatch ${k}: svg ${strokes.length} vs ${v.strokes}`);
}
const dir = path.join(root, "content/kanji", level);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "skeleton.json"), JSON.stringify(out, null, 1) + "\n");
// N5 units were themed by hand. Higher levels are split evenly in difficulty order; authors give each unit its title.
if (level !== "n5") {
  const per = level === "n4" ? 12 : 14;
  const count = Math.ceil(out.length / per);
  const units = Array.from({ length: count }, (_, i) => ({
    n: i + 1,
    title: { en: `Unit ${i + 1}`, ta: `பிரிவு ${i + 1}` },
    kanji: out.slice(Math.round((i * out.length) / count), Math.round(((i + 1) * out.length) / count)).map((x) => x.kanji),
  }));
  fs.writeFileSync(path.join(dir, "units.json"), JSON.stringify({ level, units }, null, 2) + "\n");
  console.log("units", units.map((u) => u.kanji.length).join(","));
}
console.log(level, "kanji", out.length, "with no example word:", out.filter((x) => !x.vocabExamples.length).map((x) => x.kanji).join(""));
