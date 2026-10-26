// Heuristic: flag grammar forms that appear in a lesson before the lesson that teaches them.
// Usage: node check_order.mjs [n ...]   (no args = all lessons that exist)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");

// [introducedInLesson, label, regex over Japanese text]
const RULES = [
  [6, "を object", /を\s*[^\s]/],
  [8, "い-adj negative くないです", /くないです/],
  [8, "な-adj/noun + じゃありません is L1, but adj patterns", /(静か|きれい|にぎやか|有名|便利|親切|元気|暇)じゃ/],
  [11, "counters/duration", /(時間|週間|か月)(に|で|ぐらい)/],
  [12, "past adjective かったです", /かったです/],
  [12, "でした", /(?<!ません)でした/],
  [12, "より / ほうが / 一番", /(より|のほうが|一番)/],
  [13, "たいです", /(?<!(冷|重|平|眠))たいです|(?<!(冷|重|平|眠))たくないです/],
  [13, "欲しい", /欲しい|ほしい/],
  [14, "て-form (てください/ています/ましょうか)", /(てください|でください|ています|でいます|ましょうか)/],
  [15, "てもいい / てはいけません", /(てもいい|ではいけません|てはいけません)/],
  [16, "てから / 〜くて", /(てから|くて、)/],
  [17, "ない-form (ないでください/なければ/なくても)", /(ないでください|なければなりません|なくてもいいです)/],
  [17, "までに", /までに/],
  [18, "ことができます / dictionary form + こと", /(ことができます|ことです|(う|く|ぐ|す|つ|ぬ|ぶ|む|る)のが(好き|上手|下手))/],
  [18, "前に", /(る|の)前に/],
  [19, "た-form patterns", /(たことがあります|(?<!ふ)たり(、|します)|たほうがいい)/],
  [19, "なります", /(くなります|になります)/],
  [20, "plain style (だ/じゃない/plain past)", /(んだ。|じゃない。|だった。|なかった。|かった。(?!です))/],
  [21, "と思います / と言います / でしょう / について", /(と思います|と言います|でしょう|について)/],
  [22, "noun-modifying clause markers (時間/約束/用事 after plain verb)", /(る|た)(時間|約束|用事)/],
  [23, "時、/ と、 conditional / ながら", /((る|た|い|の)時、|ると、|ながら)/],
  [24, "くれます / てあげます / てもらいます / てくれます", /(くれます|てあげます|てもらいます|てくれます)/],
  [25, "たら / ても / つもり / 予定", /(たら、|(?<![。「\s])ても、|(?<![。「\s])でも、|つもりです|予定です)/],
];

const JA_KEYS = new Set(["ja", "sentence", "passage", "before", "after", "pattern", "formation", "expression"]);
function* jaStrings(obj, pathStr = "") {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) yield* jaStrings(obj[i], `${pathStr}[${i}]`);
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        if (JA_KEYS.has(k) || k === "options" || k === "chunks") yield [`${pathStr}.${k}`, v];
      } else if (k === "options" || k === "chunks") {
        for (let i = 0; i < v.length; i++) yield [`${pathStr}.${k}[${i}]`, v[i]];
      } else yield* jaStrings(v, `${pathStr}.${k}`);
    }
  }
}

const args = process.argv.slice(2).map(Number);
const ns = args.length ? args : Array.from({ length: 25 }, (_, i) => i + 1);
let total = 0;
for (const n of ns) {
  const pad = String(n).padStart(2, "0");
  const files = [
    ["vocab", path.join(root, "content/n5/vocab", `lesson-${pad}.json`)],
    ["lesson", path.join(root, "content/n5/lessons", `lesson-${pad}.json`)],
  ];
  const hits = [];
  for (const [kind, p] of files) {
    if (!fs.existsSync(p)) continue;
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    for (const [where, s] of jaStrings(data)) {
      // skip the grammar "pattern"/"formation" of the lesson itself (they describe the form)
      for (const [intro, label, re] of RULES) {
        if (intro <= n) continue;
        if (re.test(s)) hits.push(`${kind}${where}: [${label}, L${intro}] ${s}`);
      }
    }
  }
  if (hits.length) {
    console.log(`\n== Lesson ${n}: ${hits.length} possible early-grammar uses`);
    for (const h of hits.slice(0, 40)) console.log("  " + h);
    if (hits.length > 40) console.log(`  ... ${hits.length - 40} more`);
  } else if (fs.existsSync(files[1][1])) console.log(`== Lesson ${n}: clean`);
  total += hits.length;
}
console.log(`\nTotal flags: ${total}`);
