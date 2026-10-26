# Kana course: authoring brief

Learners are Tamil speakers starting Japanese from zero. Teaching text is in **very simple English** with a Tamil version of the same text. Meanings are in Tamil and English.

## Input
`content/kana/skeleton.json`: `hiragana` and `katakana`, each a list of units with `chars` (kana, romaji, row, approximate Tamil sound, strokes). Units: 1 あかさ rows, 2 たなは, 3 まやらわ+ん, 4 voiced (゛) and p-sounds (゜), 5 combined sounds (きゃ…), and for katakana only 6 extended sounds for foreign words (ファ, ティ…).

## Output: `content/kana/<script>.json` (`hiragana.json` or `katakana.json`)
```json
{
  "script": "hiragana",
  "intro": { "en": "...", "ta": "..." },
  "units": { "1": { "en": "...", "ta": "..." }, "2": {...} },
  "chars": {
    "あ": {
      "mnemonic": { "en": "...", "ta": "..." },
      "note": { "en": "...", "ta": "..." },
      "example": { "word": "あめ", "en": "rain", "ta": "மழை" }
    }
  },
  "rules": [
    { "id": "dakuten", "unit": 4, "title": { "en": "...", "ta": "..." }, "body": { "en": "...", "ta": "..." },
      "examples": [ { "word": "かき → かぎ", "en": "persimmon → key", "ta": "பேரீச்சை வகைப் பழம் → சாவி" } ] }
  ]
}
```

### `intro` and `units`
- `intro`: 2 or 3 sentences on what this script is for (hiragana: grammar endings and native words; katakana: foreign words, names, emphasis).
- `units`: one entry per unit number in the skeleton, 1 or 2 sentences each.

### `chars`: an entry for EVERY kana in the skeleton for this script
- **`mnemonic`**: required only for the basic sounds (units 1–3, including ん and を). It is a short, vivid picture linking the **shape** to the **sound**: "あ looks like an apple with a stick through it: **a**pple → a." Where the shape suggests it, use a Tamil sound hook too (a Tamil word starting with the same sound), e.g. "け looks like a கேணி…". Keep it to 1 or 2 short sentences. The `ta` version is natural Tamil and may use a different picture or word if that works better in Tamil. Omit `mnemonic` for units 4–6.
- **`note`** (optional): look-alike warnings (さ/ち, ぬ/め, ね/れ/わ, る/ろ, シ/ツ, ソ/ン, ク/ケ/タ, ウ/ワ/フ), special uses (は read "wa" and へ read "e" as particles, を only as a particle, ぢ/づ are rare), or pronunciation tips (ふ is between "fu" and "hu"; ら row is a light tap, between r and l). Be brief.
- **`example`**: required for every char, except katakana ヲ, ヂ and ヅ (almost no real words use them; omit `example` and explain in `note`). One very common word that contains the sound, preferably at the start. Hiragana: a native word written in hiragana (or as usually written in hiragana by beginners). Katakana: a well-known loanword (テレビ, コーヒー, カレー). Prefer words from `content/n5/vocab/` where possible. The `word` must contain the kana, and must be written only in this script (ー allowed in katakana). Give `en` and natural Tamil `ta`.

### `rules`: short teaching cards, placed in a unit
- Hiragana: `dakuten` (unit 4), `handakuten` (unit 4), `yoon` (unit 5), `sokuon` small っ (unit 5), `long-vowels` (unit 5: ああ, いい, おう/おお, えい), `particles` は/へ/を (unit 3).
- Katakana: `katakana-intro` (unit 1: same sounds, straight lines, for foreign words), `long-vowel-mark` ー (unit 1), `dakuten` and `handakuten` (unit 4), `yoon` and `sokuon` ッ (unit 5), `extended` (unit 6).
- Each card: a `title`, a `body` of 2–4 simple sentences, and 2–4 `examples`.

## Rules
- Simple English: short sentences, everyday words, "you". Use the typographic apostrophe ’.
- Write the file with the Write tool (not shell heredocs). The console is cp1252: print Japanese/Tamil with Node, not Python.
- Validate: `node _sources/tools/check_kana.mjs <script>` from the project root must print OK.
- Only create your own `content/kana/<script>.json`.
