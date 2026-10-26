// Build the kana skeleton: hiragana + katakana tables in teaching order, romaji, an approximate
// Tamil-script sound, and stroke paths from KanjiVG (CC BY-SA 3.0) for single characters.
// Usage: node build_kana.mjs   (from _sources/tools)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const svgDir = path.join(root, "_sources/kana/kanjivg");
fs.mkdirSync(svgDir, { recursive: true });

// [hiragana, romaji] rows in teaching order
const ROWS = {
  vowels: [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]],
  k: [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]],
  s: [["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]],
  t: [["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]],
  n: [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]],
  h: [["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]],
  m: [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]],
  y: [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"]],
  r: [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]],
  w: [["わ", "wa"], ["を", "wo"], ["ん", "n"]],
  g: [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"]],
  z: [["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]],
  d: [["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"]],
  b: [["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"]],
  p: [["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]],
};
const YOON_BASE = [["き", "k"], ["し", "sh"], ["ち", "ch"], ["に", "n"], ["ひ", "h"], ["み", "m"], ["り", "r"], ["ぎ", "g"], ["じ", "j"], ["び", "b"], ["ぴ", "p"]];
const YOON = YOON_BASE.flatMap(([c, r]) =>
  [["ゃ", "a"], ["ゅ", "u"], ["ょ", "o"]].map(([s, v]) => [c + s, r === "sh" || r === "ch" || r === "j" ? r + v : r + "y" + v]),
);
// Katakana-only extended sounds (for foreign words)
const EXTENDED = [["ファ", "fa"], ["フィ", "fi"], ["フェ", "fe"], ["フォ", "fo"], ["ティ", "ti"], ["ディ", "di"], ["トゥ", "tu"], ["ウィ", "wi"], ["ウェ", "we"], ["ウォ", "wo"], ["シェ", "she"], ["チェ", "che"], ["ジェ", "je"], ["ヴ", "vu"]];

const UNITS = [
  { n: 1, rows: ["vowels", "k", "s"], title: { en: "あ, か and さ rows", ta: "あ, か, さ வரிசைகள்" } },
  { n: 2, rows: ["t", "n", "h"], title: { en: "た, な and は rows", ta: "た, な, は வரிசைகள்" } },
  { n: 3, rows: ["m", "y", "r", "w"], title: { en: "ま, や, ら, わ rows and ん", ta: "ま, や, ら, わ வரிசைகளும் ん-உம்" } },
  { n: 4, rows: ["g", "z", "d", "b", "p"], title: { en: "Two dots and circle (゛ ゜)", ta: "இரட்டைப் புள்ளி, வட்டம் (゛ ゜)" } },
  { n: 5, rows: ["yoon"], title: { en: "Combined sounds (きゃ, しゅ…)", ta: "இணை ஒலிகள் (きゃ, しゅ…)" } },
];

// Approximate Tamil-script sound. Japanese has voiced sounds Tamil script does not separate,
// so voiced consonants carry a (g)/(z)/(d)/(b) marker in the UI via `voiced`.
const CONS = { "": "", k: "க", g: "க", s: "ஸ", sh: "ஷ", z: "ஜ", j: "ஜ", t: "த", ch: "ச", ts: "த்ஸ", d: "த", n: "ந", h: "ஹ", f: "ஃப", b: "ப", p: "ப", m: "ம", y: "ய", r: "ர", w: "வ", v: "வ" };
const VOW = { a: ["அ", ""], i: ["இ", "ி"], u: ["உ", "ு"], e: ["எ", "ெ"], o: ["ஒ", "ொ"] };
function tamil(romaji) {
  if (romaji === "n") return "ன்";
  if (romaji === "wo") return "வொ (ஒ)";
  const m = romaji.match(/^(ch|sh|ts|[kgszjtdnhfbpmyrwv]?)(y?)([aiueo])$/);
  if (!m) return "";
  const [, c, y, v] = m;
  if (!c) return VOW[v][0];
  const base = CONS[c];
  return y ? `${base}்ய${VOW[v][1]}` : base + VOW[v][1];
}
const VOICED = { g: "g", z: "z", j: "j", d: "d", b: "b" };
const voicedOf = (romaji) => VOICED[romaji.match(/^(ch|sh|ts|[a-z]?)/)[1]] ?? null;

const toKata = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

async function strokes(ch) {
  if (ch.length !== 1) return [];
  const hex = ch.codePointAt(0).toString(16).padStart(5, "0");
  const p = path.join(svgDir, `${hex}.svg`);
  if (!fs.existsSync(p)) {
    const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
    if (!res.ok) {
      console.warn(`no KanjiVG for ${ch} (${res.status})`);
      return [];
    }
    fs.writeFileSync(p, await res.text());
  }
  return [...fs.readFileSync(p, "utf8").matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
}

async function entry(kana, romaji, row) {
  return { kana, romaji, row, tamil: tamil(romaji), voiced: voicedOf(romaji), strokes: await strokes(kana) };
}

const out = { hiragana: [], katakana: [] };
for (const script of ["hiragana", "katakana"]) {
  const conv = script === "katakana" ? toKata : (s) => s;
  const units = [];
  for (const u of UNITS) {
    const chars = [];
    for (const row of u.rows) {
      const list = row === "yoon" ? YOON : ROWS[row];
      for (const [k, r] of list) chars.push(await entry(conv(k), r, row));
    }
    units.push({ n: u.n, title: script === "katakana" ? { en: u.title.en.replace(/[ぁ-ゖ]+/g, toKata), ta: u.title.ta.replace(/[ぁ-ゖ]+/g, toKata) } : u.title, chars });
  }
  if (script === "katakana") {
    const chars = [];
    for (const [k, r] of EXTENDED) chars.push(await entry(k, r, "ext"));
    units.push({ n: 6, title: { en: "Sounds for foreign words (ファ, ティ…)", ta: "வெளிநாட்டுச் சொற்களுக்கான ஒலிகள் (ファ, ティ…)" }, chars });
  }
  out[script] = units;
}
fs.mkdirSync(path.join(root, "content/kana"), { recursive: true });
fs.writeFileSync(path.join(root, "content/kana/skeleton.json"), JSON.stringify(out, null, 1) + "\n");
for (const s of ["hiragana", "katakana"])
  console.log(s, out[s].map((u) => `${u.n}:${u.chars.length}`).join(" "), "no strokes:", out[s].flatMap((u) => u.chars).filter((c) => c.kana.length === 1 && !c.strokes.length).map((c) => c.kana).join(""));
console.log(out.hiragana[0].chars.slice(0, 8).map((c) => `${c.kana}=${c.tamil}`).join(" "), out.hiragana[4].chars.slice(0, 6).map((c) => `${c.kana}=${c.tamil}`).join(" "));
