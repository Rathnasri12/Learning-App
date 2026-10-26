// Usage: node validate.mjs <lessonNumber>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const n = Number(process.argv[2]);
const pad = String(n).padStart(2, "0");
const errs = [];
const warn = [];
const read = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    errs.push(`Cannot parse ${p}: ${e.message}`);
    return null;
  }
};
const input = read(path.join(root, "_sources/lesson-inputs", `lesson-${pad}.json`));
const vocab = read(path.join(root, "content/n5/vocab", `lesson-${pad}.json`));
const lesson = read(path.join(root, "content/n5/lessons", `lesson-${pad}.json`));
const POS = new Set([
  "noun", "verb-u", "verb-ru", "verb-irregular", "i-adj", "na-adj", "adverb", "particle", "expression",
  "counter", "pronoun", "conjunction", "prefix", "suffix", "interjection", "number",
]);
const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const hasTamil = (s) => /[஀-௿]/.test(s || "");
const checkExample = (ex, where) => {
  for (const k of ["ja", "reading", "romaji", "ta", "en"]) if (!nonEmpty(ex?.[k])) errs.push(`${where}: example missing ${k}`);
  if (ex?.ta && !hasTamil(ex.ta)) errs.push(`${where}: example.ta is not Tamil`);
};
if (input && vocab) {
  const want = new Set(input.words.map((w) => w.id));
  const got = new Set(vocab.map((w) => w.id));
  for (const id of want) if (!got.has(id)) errs.push(`vocab: missing ${id}`);
  for (const id of got) if (!want.has(id)) errs.push(`vocab: unexpected ${id}`);
  const byId = Object.fromEntries(input.words.map((w) => [w.id, w]));
  for (const w of vocab) {
    const s = byId[w.id];
    if (!s) continue;
    for (const k of ["expression", "reading", "romaji"]) if (w[k] !== s[k]) errs.push(`vocab ${w.id}: ${k} changed ("${w[k]}" vs "${s[k]}")`);
    if (!nonEmpty(w.en)) errs.push(`vocab ${w.id}: en empty`);
    if (!nonEmpty(w.ta) || !hasTamil(w.ta)) errs.push(`vocab ${w.id}: ta missing or not Tamil`);
    if (!POS.has(w.pos)) errs.push(`vocab ${w.id}: bad pos "${w.pos}"`);
    if (!Array.isArray(w.examples) || w.examples.length !== 1) errs.push(`vocab ${w.id}: need exactly 1 example`);
    else checkExample(w.examples[0], `vocab ${w.id}`);
  }
}
if (input && lesson) {
  if (lesson.lesson !== n) errs.push(`lesson.lesson should be ${n}`);
  if (!lesson.title?.ja || !lesson.title?.ta || !lesson.title?.en) errs.push("title incomplete");
  if (!nonEmpty(lesson.intro_ta) || !hasTamil(lesson.intro_ta)) errs.push("intro_ta missing/not Tamil");
  const wantG = input.meta.grammar.map((g) => g.id);
  const gotG = (lesson.grammar || []).map((g) => g.id);
  for (const id of wantG) if (!gotG.includes(id)) errs.push(`grammar: missing ${id}`);
  for (const id of gotG) if (!wantG.includes(id)) errs.push(`grammar: unexpected ${id}`);
  for (const g of lesson.grammar || []) {
    for (const k of ["pattern", "explanation_ta", "tamil_parallel", "formation"]) if (!nonEmpty(g[k])) errs.push(`grammar ${g.id}: ${k} empty`);
    if (!hasTamil(g.explanation_ta)) errs.push(`grammar ${g.id}: explanation_ta not Tamil`);
    if (!g.name?.en || !g.name?.ta) errs.push(`grammar ${g.id}: name incomplete`);
    if (!Array.isArray(g.examples) || g.examples.length < 4) errs.push(`grammar ${g.id}: need >= 4 examples`);
    (g.examples || []).forEach((ex, i) => checkExample(ex, `grammar ${g.id} ex${i}`));
  }
  const wantV = new Set(input.words.map((w) => w.id));
  const gotV = new Set(lesson.vocab_ids || []);
  for (const id of wantV) if (!gotV.has(id)) errs.push(`vocab_ids: missing ${id}`);
  for (const id of gotV) if (!wantV.has(id)) errs.push(`vocab_ids: unexpected ${id}`);
  const items = lesson.test?.items || [];
  if (typeof lesson.test?.passMark !== "number") errs.push("test.passMark missing");
  if (items.length < 20 || items.length > 30) errs.push(`test: ${items.length} items (need 20-30)`);
  const ids = new Set();
  const types = {};
  let firstPos = 0;
  let mcq = 0;
  for (const it of items) {
    if (!nonEmpty(it.id)) errs.push("item without id");
    if (ids.has(it.id)) errs.push(`duplicate item id ${it.id}`);
    ids.add(it.id);
    types[it.type] = (types[it.type] || 0) + 1;
    if (!nonEmpty(it.explanation_ta) || !hasTamil(it.explanation_ta)) errs.push(`${it.id}: explanation_ta missing/not Tamil`);
    if (["kanji_reading", "orthography", "vocab_context", "paraphrase", "grammar_form"].includes(it.type)) {
      mcq++;
      if (!nonEmpty(it.sentence)) errs.push(`${it.id}: sentence empty`);
      if (!Array.isArray(it.options) || it.options.length !== 4) errs.push(`${it.id}: need 4 options`);
      if (new Set(it.options || []).size !== (it.options || []).length) errs.push(`${it.id}: duplicate options`);
      if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer > 3) errs.push(`${it.id}: bad answer index`);
      if (it.answer === 0) firstPos++;
      if (it.type === "kanji_reading" || it.type === "orthography") {
        if (!nonEmpty(it.target)) errs.push(`${it.id}: target required`);
        else if (!it.sentence.includes(it.target)) errs.push(`${it.id}: target not in sentence`);
      }
      if (["vocab_context", "grammar_form"].includes(it.type) && !/（\s*）|（　+）|＿＿|\(\s*\)/.test(it.sentence))
        warn.push(`${it.id}: no visible blank in sentence`);
    } else if (it.type === "sentence_order") {
      if (!Array.isArray(it.chunks) || it.chunks.length < 3 || it.chunks.length > 5) errs.push(`${it.id}: chunks must be 3-5`);
      if (!Number.isInteger(it.star) || it.star < 0 || it.star >= (it.chunks || []).length) errs.push(`${it.id}: bad star`);
      if (typeof it.before !== "string" || typeof it.after !== "string") errs.push(`${it.id}: before/after must be strings`);
    } else if (it.type === "passage_cloze") {
      if (!nonEmpty(it.passage)) errs.push(`${it.id}: passage empty`);
      if (!Array.isArray(it.blanks) || it.blanks.length < 2) errs.push(`${it.id}: need >= 2 blanks`);
      (it.blanks || []).forEach((b, i) => {
        if (!Array.isArray(b.options) || b.options.length !== 4) errs.push(`${it.id} blank${i + 1}: need 4 options`);
        if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer > 3) errs.push(`${it.id} blank${i + 1}: bad answer`);
        if (!it.passage.includes(`［${i + 1}］`)) errs.push(`${it.id}: passage lacks ［${i + 1}］`);
      });
    } else errs.push(`${it.id}: unknown type ${it.type}`);
  }
  if (mcq && firstPos / mcq > 0.4) warn.push(`answer index 0 used in ${firstPos}/${mcq} MCQs (spread the answers)`);
  if (!types.sentence_order) warn.push("no sentence_order items");
  if (!types.passage_cloze) warn.push("no passage_cloze items");
  console.log("item types:", JSON.stringify(types));
}
if (!vocab) errs.push("vocab file missing");
if (!lesson) errs.push("lesson file missing");
for (const w of warn) console.log("WARN", w);
for (const e of errs) console.log("ERR ", e);
console.log(errs.length ? `FAIL lesson ${n}: ${errs.length} errors` : `OK lesson ${n}`);
process.exit(errs.length ? 1 : 0);
