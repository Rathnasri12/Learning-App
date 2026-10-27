# Content schema (v1)

All content is JSON under `content/<level>/`. The web app reads these files at build time.

## `vocab-skeleton.json` (generated, do not edit by hand)
Array of `{ id, expression, reading, romaji, en, tags }` for every word on the level list.

## `vocab-assignment.json`
Object mapping every vocab `id` to a lesson number 1..N. Every id appears exactly once.

## `vocab/lesson-XX.json` (authored, one per lesson)
Array of full vocab entries for that lesson, same `id`s as the skeleton:

```json
{
  "id": "n5-v-002",
  "expression": "会う",
  "reading": "あう",
  "romaji": "au",
  "en": "to meet",
  "ta": "சந்திக்க",
  "pos": "verb-u",
  "examples": [
    { "ja": "明日、友達に会います。", "reading": "あした、ともだちに あいます。", "romaji": "ashita, tomodachi ni aimasu.", "ta": "நாளை நண்பரைச் சந்திக்கிறேன்.", "en": "I will meet a friend tomorrow." }
  ]
}
```

Field rules
- `en`: one short gloss, 1–4 words, no slashes of five alternatives. Clean up the raw dictionary meaning.
- `ta`: natural Tamil gloss a Tamil Nadu learner would say, not a dictionary transliteration. Verbs in infinitive-like form (சந்திக்க / சாப்பிட). Nouns plain. Adjectives in attributive form (பெரிய / அழகான).
- `pos`: one of `noun`, `verb-u`, `verb-ru`, `verb-irregular`, `i-adj`, `na-adj`, `adverb`, `particle`, `expression`, `counter`, `pronoun`, `conjunction`, `prefix`, `suffix`, `interjection`, `number`.
- `examples`: exactly 1 example per word, N5-level, using only grammar from this lesson or earlier lessons. `reading` is the sentence fully in kana with spaces between words. `romaji` is Hepburn with the same spacing.
- Keep `expression`, `reading`, `romaji`, `id` exactly as in the skeleton.

## `lessons/lesson-XX.json` (authored, one per lesson)

```json
{
  "lesson": 1,
  "title": { "ja": "はじめまして", "ta": "அறிமுகம்", "en": "Nice to meet you" },
  "intro_ta": "இந்தப் பாடத்தில் ... (2–3 sentences in Tamil on what the learner will be able to do)",
  "grammar": [
    {
      "id": "g01-1",
      "pattern": "N1 は N2 です",
      "name": { "en": "X is Y", "ta": "X என்பது Y" },
      "explanation_ta": "3–6 sentences in Tamil. Explain the job of the pattern, how it is formed, and what it corresponds to in Tamil. Reference Tamil grammar directly (e.g. は என்பது தமிழில் 'பற்றிச் சொன்னால்' என்ற பொருளில் தலைப்பைக் குறிக்கும்).",
      "tamil_parallel": "One line: the closest Tamil construction. e.g. நான் மாணவன் (ஆக இருக்கிறேன்) = 私は学生です",
      "formation": "N1 + は + N2 + です",
      "examples": [
        { "ja": "私は学生です。", "reading": "わたしは がくせいです。", "romaji": "watashi wa gakusei desu.", "ta": "நான் மாணவன்.", "en": "I am a student." }
      ],
      "pitfalls_ta": "1–3 sentences on common mistakes Tamil speakers make with this pattern. Optional."
    }
  ],
  "vocab_ids": ["n5-v-002", "..."],
  "test": {
    "passMark": 0.7,
    "items": [ ... ]
  }
}
```

Grammar rules
- 4–8 examples per grammar point, N5 vocabulary only, preferring words from this lesson.
- Example `reading` fully kana with word spacing; `romaji` matching.

## Test items (`test.items`)
Each lesson test has 20–30 items. Mix the types below. Items use only vocabulary and grammar from this lesson and earlier lessons. Every item has `explanation_ta` saying in Tamil why the answer is right and, where useful, why the tempting wrong option is wrong.

Common fields: `id` (e.g. `"L01-q01"`), `type`, `explanation_ta`.

1. `kanji_reading` — JLPT 漢字読み. Kanji word underlined in a sentence; choose the kana reading.
```json
{ "id":"L03-q01", "type":"kanji_reading", "sentence":"あそこは＿銀行＿です。", "target":"銀行", "options":["ぎんこう","ぎんこ","きんこう","ぎんごう"], "answer":0, "explanation_ta":"..." }
```
2. `orthography` — JLPT 表記. Kana word underlined; choose the kanji/katakana spelling.
```json
{ "id":"L03-q02", "type":"orthography", "sentence":"＿でんき＿を つけます。", "target":"でんき", "options":["電気","電機","電木","雷気"], "answer":0, "explanation_ta":"..." }
```
3. `vocab_context` — JLPT 文脈規定. Sentence with a blank; choose the word.
```json
{ "id":"L01-q03", "type":"vocab_context", "sentence":"（　　）、わたしは タミル人です。", "options":["はじめまして","さようなら","いただきます","おやすみなさい"], "answer":0, "explanation_ta":"..." }
```
4. `paraphrase` — JLPT 言い換え類義. Sentence given; choose the sentence closest in meaning.
```json
{ "id":"L04-q04", "type":"paraphrase", "sentence":"この店は 休みです。", "options":["この店は あいていません。","この店は 新しいです。","この店は 大きいです。","この店は 近いです。"], "answer":0, "explanation_ta":"..." }
```
5. `grammar_form` — JLPT 文の文法1. Sentence with a blank; choose the grammar form/particle.
```json
{ "id":"L06-q05", "type":"grammar_form", "sentence":"としょかん（　　）本を 読みます。", "options":["で","に","を","へ"], "answer":0, "explanation_ta":"..." }
```
6. `sentence_order` — JLPT 文の組み立て. Chunks shown shuffled; learner orders them. `chunks` are given in the CORRECT order; `star` is the 0-based index of the starred slot; `before`/`after` are fixed text around the blanks.
```json
{ "id":"L10-q06", "type":"sentence_order", "before":"つくえの", "chunks":["上に","ねこ","が","います"], "star":1, "after":"。", "explanation_ta":"..." }
```
7. `passage_cloze` — JLPT 文章の文法. Short passage with numbered blanks `［1］`, `［2］`…; one option set per blank.
```json
{ "id":"L12-q07", "type":"passage_cloze", "passage":"きのうは 友だちと 海へ 行きました。海は とても［1］。でも、人が ［2］ いました。", "blanks":[ {"options":["きれいでした","きれいです","きれいじゃありません","きれい"],"answer":0}, {"options":["たくさん","あまり","ぜんぜん","すこし"],"answer":0} ], "explanation_ta":"..." }
```
8. `usage` — JLPT 用法 (N4+ only; do not use in N5).

Target mix per N5 lesson test (about 25 items): 3 kanji_reading (only when the lesson has kanji words; otherwise 0 and more vocab_context), 2 orthography, 6 vocab_context, 3 paraphrase, 6 grammar_form, 3 sentence_order, 1 passage_cloze with 2–3 blanks.

Distractors must be plausible: same part of speech, same length, a form the learner has actually seen. Never put the correct answer at index 0 for more than about a quarter of the items.

## Reading and listening tracks
`content/reading/<level>/unit-XX.json` + `exam.json` and `content/listening/<level>/unit-XX.json` + `exam.json`.
Item types `reading` (passage + several 内容理解 / 情報検索 questions, furigana markup `{漢字|かんじ}`, per-sentence `en`/`ta`) and `listening` (`task` / `point` / `gist` / `utterance` / `response`, Japanese only).
Full field rules and the JLPT blueprints per level are in `_sources/SKILL_BRIEF.md`; validate with `node _sources/tools/check_skill.mjs <reading|listening> <level> [units…] [exam]`.
