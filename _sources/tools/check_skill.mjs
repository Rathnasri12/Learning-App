// Validate reading / listening unit files (content/<track>/<level>/unit-XX.json) and exam.json.
// Usage: node check_skill.mjs <reading|listening> <level> [unit ...] [exam]   (no units = every file present)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const [track, level, ...rest] = process.argv.slice(2);
if (!["reading", "listening"].includes(track) || !/^n[345]$/.test(level ?? "")) {
  console.error("usage: node check_skill.mjs <reading|listening> <n5|n4|n3> [unit ...] [exam]");
  process.exit(2);
}
const dir = path.join(root, "content", track, level);
const pad = (n) => String(n).padStart(2, "0");
let targets = rest;
if (!targets.length && fs.existsSync(dir))
  targets = fs.readdirSync(dir).map((f) => f.match(/^unit-(\d+)\.json$/)?.[1] ?? (f === "exam.json" ? "exam" : null)).filter(Boolean);

const L = level[1]; // "5" | "4" | "3"

// Blueprints: the passages / questions each unit and exam must contain, in this order.
const READING_UNIT = {
  n5: [["short", 1], ["short", 1], ["mid", 2], ["info", 1]],
  n4: [["short", 1], ["short", 1], ["mid", 3], ["info", 2]],
  n3: [["short", 1], ["mid", 3], ["long", 4], ["info", 2]],
}[level];
const READING_EXAM = {
  n5: [["short", 1], ["short", 1], ["short", 1], ["mid", 2], ["info", 1]],
  n4: [["short", 1], ["short", 1], ["short", 1], ["short", 1], ["mid", 4], ["info", 2]],
  n3: [["short", 1], ["short", 1], ["short", 1], ["short", 1], ["mid", 3], ["mid", 3], ["long", 4], ["info", 2]],
}[level];
const LISTEN_UNIT = {
  n5: { task: 2, point: 2, utterance: 2, response: 2 },
  n4: { task: 2, point: 2, utterance: 2, response: 2 },
  n3: { task: 2, point: 2, gist: 1, utterance: 1, response: 2 },
}[level];
const LISTEN_EXAM = {
  n5: { task: 7, point: 6, utterance: 5, response: 6 },
  n4: { task: 8, point: 7, utterance: 5, response: 8 },
  n3: { task: 6, point: 6, gist: 3, utterance: 4, response: 9 },
}[level];
const N_OPTIONS = { task: 4, point: 4, gist: 4, utterance: 3, response: 3 };
// Rough length limits in characters (kana + kanji, furigana markup removed).
const LEN = {
  n5: { short: [60, 200], mid: [180, 420], info: [40, 400] },
  n4: { short: [100, 300], mid: [300, 600], info: [60, 500] },
  n3: { short: [120, 330], mid: [330, 650], long: [550, 1000], info: [80, 600] },
}[level];

const TAMIL = /[஀-௿]/;
const KANJI = /[一-鿿々]/;
const KANA = /^[ぁ-ゖァ-ヺー・]+$/;
const LATIN = /[A-Za-z]/;

// Checks furigana markup: {漢字|かな}. Every kanji must sit inside markup (so TTS and furigana both work).
function checkJa(s, where, errs) {
  if (typeof s !== "string" || !s.trim()) return errs.push(`${where}: empty text`);
  if (TAMIL.test(s)) errs.push(`${where}: Tamil script inside Japanese text`);
  const stripped = s.replace(/\{([^|{}]+)\|([^|{}]+)\}/g, (m, base, ruby) => {
    if (!KANJI.test(base)) errs.push(`${where}: furigana on "${base}" which has no kanji`);
    if (!KANA.test(ruby)) errs.push(`${where}: furigana "${ruby}" for "${base}" must be kana only`);
    return "";
  });
  if (/[{}|]/.test(stripped)) errs.push(`${where}: broken furigana markup in "${s}"`);
  const bare = stripped.match(/[一-鿿々]+/g);
  if (bare) errs.push(`${where}: kanji without furigana: ${[...new Set(bare)].join(" ")}`);
}
const plain = (s) => s.replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1");

function checkBi(b, where, errs) {
  if (!b || typeof b.en !== "string" || !b.en.trim() || typeof b.ta !== "string" || !TAMIL.test(b.ta))
    errs.push(`${where}: needs { en, ta } with Tamil in ta`);
}

function spread(answers, sizes, errs, where) {
  const n = answers.length;
  if (n < 6) return;
  const counts = new Map();
  answers.forEach((a) => counts.set(a, (counts.get(a) ?? 0) + 1));
  const top = Math.max(...counts.values());
  if (top / n > 0.4) errs.push(`${where}: answer index ${[...counts].find(([, c]) => c === top)[0]} used ${top}/${n} times; spread the answers`);
}

function checkOptions(opts, answer, n, where, errs, ja) {
  if (!Array.isArray(opts) || opts.length !== n) errs.push(`${where}: needs exactly ${n} options`);
  else {
    opts.forEach((o, k) => (ja ? checkJa(o, `${where} option ${k + 1}`, errs) : null));
    if (new Set(opts.map((o) => plain(String(o)))).size !== opts.length) errs.push(`${where}: duplicate options`);
  }
  if (!Number.isInteger(answer) || answer < 0 || answer >= n) errs.push(`${where}: answer must be 0..${n - 1}`);
}

function checkReading(items, blueprint, prefix, errs) {
  if (items.length !== blueprint.length)
    errs.push(`${items.length} passages, expected ${blueprint.length} (${blueprint.map((b) => b[0]).join(", ")})`);
  const answers = [];
  items.forEach((it, i) => {
    const w = `passage ${it.id ?? i + 1}`;
    const [kind, nq] = blueprint[i] ?? [];
    if (it.id !== `${prefix}-${i + 1}`) errs.push(`${w}: id should be ${prefix}-${i + 1}`);
    if (it.type !== "reading") errs.push(`${w}: type must be "reading"`);
    if (kind && it.kind !== kind) errs.push(`${w}: kind ${it.kind}, expected ${kind}`);
    if (it.title !== undefined) checkJa(it.title, `${w} title`, errs);
    if (!Array.isArray(it.paragraphs) || !it.paragraphs.length) errs.push(`${w}: needs paragraphs`);
    let chars = 0;
    (it.paragraphs ?? []).forEach((p, pi) => {
      if (!Array.isArray(p) || !p.length) return errs.push(`${w} paragraph ${pi + 1}: empty`);
      p.forEach((s, si) => {
        const sw = `${w} p${pi + 1}s${si + 1}`;
        checkJa(s.ja, sw, errs);
        chars += plain(s.ja ?? "").replace(/\s/g, "").length;
        if (!s.en?.trim() || LATIN.test(s.en) === false) errs.push(`${sw}: needs English en`);
        if (!TAMIL.test(s.ta ?? "")) errs.push(`${sw}: needs Tamil ta`);
      });
    });
    if (it.table) {
      const t = it.table;
      if (t.caption) checkJa(t.caption, `${w} table caption`, errs);
      if (!Array.isArray(t.head) || !t.head.length) errs.push(`${w}: table needs head`);
      (t.head ?? []).forEach((h, k) => checkJa(h, `${w} table head ${k + 1}`, errs));
      (t.rows ?? []).forEach((r, ri) => {
        if (r.length !== t.head.length) errs.push(`${w}: table row ${ri + 1} has ${r.length} cells, head has ${t.head.length}`);
        r.forEach((c, k) => checkJa(c, `${w} table r${ri + 1}c${k + 1}`, errs));
        chars += r.map((c) => plain(c)).join("").length;
      });
    }
    if (kind === "info" && !it.table) errs.push(`${w}: 情報検索 (info) passages need a table`);
    if (kind !== "info" && it.table) errs.push(`${w}: only info passages have a table`);
    const lim = LEN[kind];
    if (lim && (chars < lim[0] || chars > lim[1])) errs.push(`${w}: ${chars} characters, ${kind} should be ${lim[0]}–${lim[1]}`);
    if (!Array.isArray(it.words) || it.words.length < 3) errs.push(`${w}: needs a words list (3+ key words)`);
    (it.words ?? []).forEach((x, k) => {
      if (!x.ja || !x.reading || !KANA.test(x.reading.replace(/\s/g, "")) || !x.en || !TAMIL.test(x.ta ?? ""))
        errs.push(`${w} word ${k + 1}: needs ja, kana reading, en, ta`);
      if (x.ja && /[{}|]/.test(x.ja)) errs.push(`${w} word ${k + 1}: no furigana markup in words[].ja`);
    });
    if (!Array.isArray(it.questions) || (nq && it.questions.length !== nq)) errs.push(`${w}: needs ${nq} question(s)`);
    (it.questions ?? []).forEach((q, qi) => {
      const qw = `${w} q${qi + 1}`;
      checkJa(q.q, qw, errs);
      checkOptions(q.options, q.answer, 4, qw, errs, true);
      if (!q.explanation_en?.trim() || !TAMIL.test(q.explanation_ta ?? "")) errs.push(`${qw}: needs explanation_en and explanation_ta`);
      answers.push(q.answer);
    });
    for (const k of Object.keys(it)) if (!["id", "type", "kind", "title", "paragraphs", "table", "words", "questions"].includes(k)) errs.push(`${w}: unknown field ${k}`);
  });
  spread(answers, 4, errs, "questions");
}

function checkListening(items, blueprint, prefix, errs) {
  const want = Object.values(blueprint).reduce((a, b) => a + b, 0);
  if (items.length !== want) errs.push(`${items.length} items, expected ${want}`);
  const counts = {};
  const answers = {};
  let expectKind = Object.entries(blueprint).flatMap(([k, c]) => Array(c).fill(k));
  items.forEach((it, i) => {
    const w = `item ${it.id ?? i + 1}`;
    if (it.id !== `${prefix}-${i + 1}`) errs.push(`${w}: id should be ${prefix}-${i + 1}`);
    if (it.type !== "listening") errs.push(`${w}: type must be "listening"`);
    if (!N_OPTIONS[it.kind]) return errs.push(`${w}: unknown kind ${it.kind}`);
    if (expectKind[i] && it.kind !== expectKind[i]) errs.push(`${w}: kind ${it.kind}, expected ${expectKind[i]} (order: ${Object.keys(blueprint).join(", ")})`);
    counts[it.kind] = (counts[it.kind] ?? 0) + 1;
    (answers[N_OPTIONS[it.kind]] ??= []).push(it.answer);
    if (it.kind === "gist" && level !== "n3") errs.push(`${w}: 概要理解 (gist) is N3 only`);
    if (it.intro !== undefined) checkJa(it.intro, `${w} intro`, errs);
    if (it.question !== undefined) checkJa(it.question, `${w} question`, errs);
    if (!Array.isArray(it.lines)) errs.push(`${w}: lines must be an array`);
    (it.lines ?? []).forEach((l, k) => {
      if (!["M", "F", "N"].includes(l.s)) errs.push(`${w} line ${k + 1}: s must be M, F or N`);
      checkJa(l.t, `${w} line ${k + 1}`, errs);
    });
    const nLines = it.lines?.length ?? 0;
    if (["task", "point"].includes(it.kind)) {
      if (!it.intro || !it.question) errs.push(`${w}: ${it.kind} needs intro (setup + question) and question (repeated)`);
      if (nLines < 4) errs.push(`${w}: ${it.kind} needs a dialogue of 4+ lines`);
      if (new Set(it.lines.map((l) => l.s)).size < 2) errs.push(`${w}: ${it.kind} dialogue needs two speakers`);
    }
    if (it.kind === "gist") {
      if (!it.intro || !it.question) errs.push(`${w}: gist needs intro and question`);
      if (nLines < 3) errs.push(`${w}: gist needs 3+ lines`);
    }
    if (it.kind === "utterance") {
      if (!it.intro || !it.scene) errs.push(`${w}: utterance needs intro (situation + 何と言いますか) and scene (emoji)`);
      if (it.scene && (/[A-Za-z぀-ヿ一-鿿]/.test(it.scene) || !it.scene.includes("➡"))) errs.push(`${w}: scene is emoji only, with ➡ pointing at the speaker`);
      if (nLines !== 0) errs.push(`${w}: utterance has no dialogue lines (lines: [])`);
      if (!it.optionVoice) errs.push(`${w}: utterance needs optionVoice (who speaks)`);
    }
    if (it.kind === "response") {
      if (it.intro || it.question) errs.push(`${w}: response has no intro/question`);
      if (nLines !== 1) errs.push(`${w}: response has exactly 1 line`);
    }
    checkOptions(it.options, it.answer, N_OPTIONS[it.kind], w, errs, true);
    for (const k of Object.keys(it))
      if (!["id", "type", "kind", "intro", "scene", "lines", "question", "optionVoice", "options", "answer"].includes(k))
        errs.push(`${w}: unknown field ${k} (listening is Japanese only: no translations or explanations)`);
  });
  for (const [k, c] of Object.entries(blueprint)) if ((counts[k] ?? 0) !== c) errs.push(`${k}: ${counts[k] ?? 0} items, expected ${c}`);
  for (const [n, a] of Object.entries(answers)) spread(a, Number(n), errs, `${n}-option items`);
}

let bad = 0;
for (const t of targets) {
  const exam = t === "exam";
  const file = exam ? "exam.json" : `unit-${pad(Number(t))}.json`;
  const p = path.join(dir, file);
  const errs = [];
  let data;
  try {
    data = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`${track}/${level}/${file}: ${fs.existsSync(p) ? "bad JSON: " + e.message : "missing"}`);
    bad++;
    continue;
  }
  checkBi(data.title, "title", errs);
  if (!exam) {
    if (data.unit !== Number(t)) errs.push(`unit field ${data.unit}, expected ${Number(t)}`);
    checkBi(data.intro, "intro", errs);
  }
  if (data.passMark !== 0.7) errs.push("passMark must be 0.7");
  const items = data.items ?? [];
  const code = track === "reading" ? "r" : "l";
  const prefix = exam ? `n${L}-${code}x` : `n${L}-${code}${pad(Number(t))}`;
  if (track === "reading") checkReading(items, exam ? READING_EXAM : READING_UNIT, prefix, errs);
  else checkListening(items, exam ? LISTEN_EXAM : LISTEN_UNIT, prefix, errs);
  if (errs.length) {
    bad++;
    console.log(`${track}/${level}/${file}: ${errs.length} problem(s)`);
    for (const e of errs.slice(0, 60)) console.log("  - " + e);
  } else console.log(`${track}/${level}/${file}: OK (${items.length} ${track === "reading" ? "passages" : "items"})`);
}
process.exit(bad ? 1 : 0);
