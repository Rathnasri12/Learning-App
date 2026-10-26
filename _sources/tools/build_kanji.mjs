// Build the N5 kanji skeleton: list + readings (kanji-data, MIT), stroke paths (KanjiVG, CC BY-SA 3.0),
// and candidate example words taken from the course's own N5 vocabulary.
// Usage: node build_kanji.mjs   (from _sources/tools)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toRomaji } from "wanakana";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const kd = JSON.parse(fs.readFileSync(path.join(root, "_sources/kanji/kanji-data.json"), "utf8"));
const svgDir = path.join(root, "_sources/kanji/kanjivg");
fs.mkdirSync(svgDir, { recursive: true });

const vocab = [];
for (let n = 1; n <= 25; n++) {
  const f = path.join(root, "content/n5/vocab", `lesson-${String(n).padStart(2, "0")}.json`);
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const v of Array.isArray(data) ? data : data.vocab) vocab.push({ ...v, lesson: n });
}

const list = Object.entries(kd).filter(([, v]) => v.jlpt_new === 5);
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
    .filter((w) => w.expression.split(/;\s*/)[0].includes(k))
    .map((w) => ({ id: w.id, lesson: w.lesson, expression: w.expression.split(/;\s*/)[0], reading: w.reading.split(/;\s*/)[0] }));
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
fs.mkdirSync(path.join(root, "content/kanji/n5"), { recursive: true });
fs.writeFileSync(path.join(root, "content/kanji/n5/skeleton.json"), JSON.stringify(out, null, 1) + "\n");
console.log("kanji", out.length, "with no vocab example:", out.filter((x) => !x.vocabExamples.length).map((x) => x.kanji).join(""));
