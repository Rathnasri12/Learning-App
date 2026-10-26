# N4 / N3 lesson authoring brief

You write lessons for a Japanese course for Tamil speakers (Tamil Nadu / Sri Lanka) preparing for the JLPT. The N5 course is finished; look at `content/n5/lessons/lesson-14.json` and `content/n5/vocab/lesson-14.json` as models of the exact shape and quality expected (they contain both Tamil and English explanation fields).

## Read first
1. `content/SCHEMA.md`: exact JSON shapes and field rules.
2. `content/<level>/syllabus.json`: all lessons of this level, their grammar ids/patterns and themes.
3. `_sources/lesson-inputs/<level>/lesson-XX.json` for each of your lessons: the exact word list (ids, expression, reading, romaji, raw English) and the lesson meta. Every word id must appear in your vocab file and in `vocab_ids`; every grammar id must appear in your grammar array. No others.

**What the learner knows:** all of N5 (every word and grammar point in `content/n5`), plus, for N3, all of N4 (`content/n4/syllabus.json` and the N4 word list `content/n4/vocab-skeleton.json`), plus this level's lessons 1..N. Example sentences and test items in lesson N must not use grammar from later lessons of this level. Vocabulary may come from lower levels, from this level's lessons 1..N, or be common words of this level's list when needed for a natural sentence.

## Outputs per lesson
- `content/<level>/vocab/lesson-XX.json`: array of full vocab entries (copy id/expression/reading/romaji exactly from the input; write `en`, `ta`, `pos`, one example).
- `content/<level>/lessons/lesson-XX.json`: lesson object with title, intro, grammar and test.
- Validate: `node _sources/tools/validate.mjs <n> <level>` from the project root, and fix until it prints `OK lesson n`. Fix warnings when reasonable.

## Two languages
Every piece of teaching text exists twice: **very simple English** and **Tamil**.
- `intro_en` + `intro_ta`
- per grammar point: `explanation_en` + `explanation_ta`, `tamil_parallel_en` + `tamil_parallel`, `formation_en` + `formation`, `pitfalls_en` + `pitfalls_ta`
- per test item: `explanation_en` + `explanation_ta`
- `name: { en, ta }` for each grammar point; `title: { ja, en, ta }` for the lesson (copy from the syllabus).

**Simple English:** short sentences (about 12 words or fewer), everyday words, "you". Avoid grammar jargon; if you need a term, explain it in plain words the first time. Tamil words inside English text go in parentheses or double quotes, e.g. `(வரைபடம், map)`. Use the typographic apostrophe ’.

**Tamil:** as an educated Tamil Nadu teacher speaks in class: clear, friendly, standard written Tamil. Draw the Tamil parallel explicitly (particles ↔ case endings: を = -ஐ, に = -க்கு/-இல், で = -இல்/-ஆல், から = -இலிருந்து, etc.). The word "kanji" in Tamil is கான்ஜி (never கஞ்சி).

`formation` / `formation_en`: same structure and line breaks; Japanese as-is, labels in Tamil / English.

## Vocabulary entries
- `ta`: short natural Tamil gloss (verbs as infinitive-like form: போக, சாப்பிட). `en`: short clean English (rewrite the raw list meaning).
- `pos`: one of noun, verb-u, verb-ru, verb-irregular, i-adj, na-adj, adverb, particle, expression, counter, pronoun, conjunction, prefix, suffix, interjection, number.
- One example sentence per word, 5–14 words, everyday life, Japan or Tamil Nadu context. `reading`: whole sentence in kana with spaces between words (particles attached to the preceding word). `romaji` with the same spacing; particles は "wa", へ "e", を "o".
- Polite です/ます style by default; plain style where the lesson teaches it or where natural in casual dialogue (N3).

## Grammar points
- 4–8 examples each, showing the pattern with different words; include a question or negative where the pattern allows. N3 examples may be a little longer and more natural/varied.
- Explanations cover meaning, how to form it, when to use it (spoken/written, polite/casual), and how it differs from similar patterns the learner knows.

## Test (JLPT format, 24–28 items)
Target mix:
- N4: 3 kanji_reading, 2 orthography, 4 vocab_context, 2 paraphrase, 2 usage, 6 grammar_form, 3 sentence_order, 1 passage_cloze (3 blanks).
- N3: 3 kanji_reading, 2 orthography, 4 vocab_context, 2 paraphrase, 2 usage, 6 grammar_form, 3 sentence_order, 1 passage_cloze (3–4 blanks, a longer passage).
- `usage` (用法): `sentence` is the target word alone; the 4 options are full sentences that use it, only one correctly.
- JLPT conventions: blank （　　）; underlined target ＿word＿; sentence_order with ★ (see SCHEMA.md).
- Distractors: plausible, same part of speech; for grammar items use patterns the learner knows that are close in meaning. Spread correct answers evenly over indices 0–3.
- Item ids `L07-q01` … in order. Explanations: why the answer is right, and the trap in the main wrong option, in both languages.

## Rules
- Natural Japanese that a native teacher would approve.
- JSON valid UTF-8, no comments. Write each file in one go with the Write tool; never shell heredocs. The console is cp1252: print Japanese/Tamil with Node, not Python.
- Only touch your own lesson files.
- Report: validator output per lesson, and any Tamil you are unsure of (briefly).
