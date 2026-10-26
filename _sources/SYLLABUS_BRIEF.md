# Syllabus design brief (N4 / N3)

You design the lesson sequence for one JLPT level of a Japanese course for Tamil speakers. The N5 course already exists: read `content/n5/syllabus.json` for the exact JSON shape, style and level of detail, and treat everything in it as already known by the learner.

## Goals
1. **Complete grammar coverage.** Every grammar point on the standard lists for this level (cross-check JLPT Sensei, Tanos, Nihongo-Pro and the Shin Kanzen Master / Try! series from memory) appears in exactly one lesson. Don't repeat N5 grammar. Typical size: N4 ≈ 120–140 points, N3 ≈ 150–180 points.
2. **A teachable order.** Easier and more frequent patterns first; patterns that build on others come after them.
   - N4: follow the classic beginner book 2 progression (e.g. ～んです, potential, volitional, conditionals ば/たら/なら/と, giving and receiving with て-forms, passive, causative, causative-passive, honorific and humble keigo near the end).
   - N3: group by function (time and sequence, cause and reason, contrast, conditions, purpose, hearsay and appearance, emphasis, formal expressions), with frequent spoken patterns before written/formal ones.
3. **Themes.** Each lesson has a real-life theme that fits its grammar and words (work, travel, health, news, culture, life in Japan, etc.).
4. **Lesson count:** N4 = 30 lessons, N3 = 40 lessons. Balance the grammar: N4 about 4–5 points per lesson, N3 about 4–5 points per lesson.

## Output 1: `content/<level>/syllabus.json`
Same shape as N5: `{ "level": "n4", "lessonCount": 30, "note": "...", "lessons": [ { "n", "slug", "title": {ja, ta, en}, "theme": {en, ta}, "grammar": [ { "id": "g01-1", "pattern": "...", "en": "..." } ], "vocabHints": [ ... ] } ] }`.
- `title.ja` is a short Japanese title using a key pattern of the lesson; `title.en` is a short English title; `ta` is natural Tamil.
- Grammar ids: `gNN-k` (lesson number, 2 digits, then index). `pattern` uses the standard notation (V-て, V-plain, N の, etc.); `en` is a short plain-English meaning.
- `vocabHints`: 3–5 topic hints that guide which words go in the lesson.

## Output 2: `content/<level>/vocab-assignment.json`
A JSON object mapping **every** id in `content/<level>/vocab-skeleton.json` to a lesson number. Rules:
- Every id exactly once. Lesson sizes balanced: N4 18–28 words per lesson, N3 45–62 words per lesson.
- Put each word where its theme fits, or where the grammar's example sentences will need it. Very common words (basic verbs, adjectives, adverbs) go early.
- Write a small Node script in your scratch area to help (e.g. keyword buckets on the English meanings, then fix by hand), but check the result by reading it.

## Checks
Run `node _sources/tools/check_syllabus.mjs <level>` from the project root; it must print OK. Write JSON with the Write tool or a Node script, never shell heredocs. The console is cp1252: print Japanese/Tamil with Node, not Python. Only create those two files.

## Report
List the grammar points per lesson (ids and patterns, compactly), anything on the standard lists you deliberately left out or merged and why, and any Tamil you are unsure of.
