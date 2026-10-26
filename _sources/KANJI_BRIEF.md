# N5 kanji track: authoring brief

You write content for the N5 kanji track of a Japanese course for Tamil speakers. Learners know hiragana and katakana. Their English is basic.

**Language rule:** teaching text is in very simple English (short sentences, everyday words), with a Tamil version of the same text. Meanings are given in both Tamil and English.

## Inputs
- `content/kanji/n5/units.json`: the 8 units and which kanji each one teaches.
- `content/kanji/n5/skeleton.json`: per kanji: stroke count, `meanings_en`, all `on` / `kun` readings (from a dictionary, so it includes rare ones), and `vocabExamples`, which are words from the course's N5 vocabulary that contain the kanji (id, lesson, expression, reading).
- `content/n5/vocab/lesson-XX.json`: the full vocabulary entries (with `ta` and `en`) behind those ids.

## Output: `content/kanji/n5/unit-XX.json`
```json
{
  "unit": 1,
  "intro": { "en": "...", "ta": "..." },
  "kanji": [
    {
      "kanji": "一",
      "meaning": { "en": "one", "ta": "ஒன்று" },
      "on": ["いち", "いつ"],
      "kun": ["ひと.つ", "ひと-"],
      "mnemonic": { "en": "...", "ta": "..." },
      "note": { "en": "...", "ta": "..." },
      "examples": [
        { "word": "一つ", "reading": "ひとつ", "en": "one (thing)", "ta": "ஒன்று (பொருள்)", "vocabId": "n5-v-123" }
      ]
    }
  ],
  "test": { "passMark": 0.7, "items": [ ... ] }
}
```

### Per kanji
- Keep the kanji in the same order as in `units.json`.
- `meaning`: 1 to 3 words, the meaning used at N5.
- `on` / `kun`: only the readings an N5 learner needs, taken from the skeleton lists in the skeleton's notation (`.` marks where okurigana starts). Most kanji need 1 or 2 of each. Use `[]` if none are needed.
- **`mnemonic`** (required, and the most important part): a short, vivid picture story that links the **shape** to the **meaning**, so the learner can see it. 1 to 3 short sentences. Describe the strokes as things, e.g. 休: "A person (亻) leans against a tree (木). They are taking a rest." Use parts the learner has already met where possible. Tamil-world images are welcome (a coconut tree, a temple, a bullock cart) when they fit the shape. The `ta` version must be natural Tamil, not word-for-word. Add a reading hook only if it is easy and true (e.g. 三 さん: "three sounds like 'sun'").
- `note` (optional; omit if nothing useful): a common confusion or a reading tip, e.g. "Don't mix up 土 (earth, long bottom line) and 士". Also cover special readings that N5 needs (一日 ついたち, 二十歳 はたち, 今日 きょう, 大人 おとな, 一人 ひとり…).
- `examples`: 3 or 4 common words that show the readings above. **Prefer words from `vocabExamples`** and copy their `ta` / `en` from the vocab file, with `vocabId` set. Add other common words only when needed to show a reading, using only N5-level kanji inside them, and without `vocabId`. Don't write romaji; it is generated.

### Unit `intro`
2 or 3 simple sentences about the unit (what kanji you will learn and one tip).

### Unit test: exactly 16 items in JLPT format
Use the existing item schema (see `content/SCHEMA.md`):
- 10 × `kanji_reading` (漢字読み): a sentence with the kanji word in ＿underscores＿ (`"sentence": "＿山＿に のぼります。"`, `"target": "山"`). The 4 options are kana readings. Distractors must be the classic traps: long vs short vowel (こうこう/こうこ), voiced vs unvoiced (はん/ばん), small っ/ゃ, an on/kun mix-up, or a reading of a similar-looking kanji.
- 6 × `orthography` (表記): the sentence has a hiragana word in ＿underscores＿ and the options are 4 kanji spellings. Distractors use similar-looking kanji or kanji with the same reading (e.g. for やすみ: 休み / 体み / 林み / 木み).
- Test kanji from this unit. Other words in the sentence can use earlier units' kanji or be written in kana; keep the sentences to N5 grammar and vocabulary.
- Every item has `id` (`KU{unit}-q{01..16}`), `type`, `sentence`, `target`, `options` (4 strings), `answer` (0–3, spread evenly: each index used 3 or 4 times), `explanation_en` (simple English: why the answer is right and why the main trap is wrong, giving the word’s meaning as "(Tamil, English)") and `explanation_ta` (the same in Tamil).

## Writing rules
- Write files with the Write tool, not shell heredocs. The console is cp1252, so print Japanese/Tamil with Node, not Python.
- Use the typographic apostrophe ’ in English.
- Validate: `node _sources/tools/check_kanji.mjs <unit numbers>` from the project root must print OK for each of your units.
- Don't edit anything outside your own `unit-XX.json` files.
