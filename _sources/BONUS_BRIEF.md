# Bonus words: authoring brief

Each N5 lesson teaches words from the 718-word JLPT N5 list. Textbooks like Minna no Nihongo Book 1 teach about 1,000 words, because they add common beginner words that the N5 list leaves out (jobs, nationalities, places, everyday phrases). You add those as an **optional "bonus words" deck** per lesson.

Do not copy any textbook's list. Choose words yourself: common, useful, beginner-level words that fit the lesson's theme and that a learner at this point in the course would naturally want.

## Inputs
- `content/n5/syllabus.json`: lesson titles, themes and grammar order.
- `content/n5/vocab/lesson-XX.json`: the lesson's main words (the entry format to copy).
- `content/n5/vocab-skeleton.json`: the full N5 list. **Bonus words must not be on it** (check expression and reading).

## Output: `content/n5/bonus/lesson-XX.json`
A JSON array of **12 to 16** entries in the same shape as the main vocab, without `romaji` (a script adds it):
```json
[
  {
    "id": "n5-b-01-01",
    "expression": "会社員",
    "reading": "かいしゃいん",
    "en": "company employee",
    "ta": "நிறுவன ஊழியர்",
    "pos": "noun",
    "examples": [
      { "ja": "私は 会社員です。", "reading": "わたしは かいしゃいんです。", "ta": "நான் ஒரு நிறுவன ஊழியர்.", "en": "I am a company employee." }
    ]
  }
]
```
Rules:
- `id`: `n5-b-{lesson 2 digits}-{01..}`.
- `expression`: normal written form (kanji where Japanese normally uses it, else kana). `reading`: hiragana/katakana only, no spaces.
- `pos`: noun, verb, i-adjective, na-adjective, adverb, expression, counter, etc., as in the main vocab.
- `ta`: natural Tamil meaning; `en`: short English meaning.
- Exactly one example sentence. The example's `reading` is the full kana reading with the same spacing as `ja`. Use only grammar taught up to and including this lesson (see the syllabus grammar order) and words from the N5 list or this lesson's bonus list. Keep it short and natural.
- Avoid rare, slangy, or N3+ words. Prefer words learners need for the lesson's situations (e.g. lesson 1: jobs and nationalities; lesson 3: places in a town; lesson 17: illnesses and body parts not on the list).
- No duplicates within your lessons. Don't repeat a word another lesson's main vocab already teaches.

## Check
Run `node _sources/tools/check_bonus.mjs <lesson numbers>` from the project root. It must print OK for every lesson. Write files with the Write tool (not shell heredocs). The console is cp1252: print Japanese/Tamil with Node, not Python. Only create your own `content/n5/bonus/lesson-XX.json` files.
