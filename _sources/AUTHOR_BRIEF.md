# N5 lesson authoring brief

You are writing lesson content for a Japanese course aimed at Tamil speakers (Tamil Nadu / Sri Lanka) preparing for JLPT N5. The learner reads Tamil natively, knows some English, and has already learned hiragana and katakana. Explanations are in Tamil. Japanese text is written normally (kanji + kana as a Japanese textbook would at N5 level).

Read first
1. `content/SCHEMA.md` — exact JSON shapes and field rules. Follow it to the letter.
2. `content/n5/syllabus.json` — all 25 lessons, their grammar ids/patterns and themes. You must respect the lesson order: an example sentence or test item in lesson N may only use grammar from lessons 1..N and vocabulary from lessons 1..N (plus the words of lesson N itself). Lesson 1 may assume greetings and は/です only.
3. `_sources/lesson-inputs/lesson-XX.json` for each of your lessons — the exact word list (ids, expression, reading, romaji, raw english) and the lesson meta with grammar ids. Every word id in that file must appear in your vocab file and in `vocab_ids`. Every grammar id must appear in your grammar array. No others.

Outputs per lesson (write both, then validate)
- `content/n5/vocab/lesson-XX.json` — array of full vocab entries.
- `content/n5/lessons/lesson-XX.json` — lesson object with grammar + test.
- Validate with: `node "C:\Users\Rathnasri\Desktop\Learning App\_sources\tools\validate.mjs" <n>` and fix until it prints `OK lesson n`. Warnings should be fixed too when reasonable.

Tamil style
- Write the way an educated Tamil Nadu teacher speaks in class: clear, friendly, standard written Tamil (not heavy literary Tamil, not Chennai slang). Use common loanwords where natural (பஸ், டிக்கெட்).
- Always draw the Tamil parallel explicitly. Japanese particles map to Tamil case endings and clitics: は = தலைப்பு (topic) — "X-ஐப் பற்றிச் சொன்னால்"; を = -ஐ; に = -க்கு / -இல் (time/place/recipient); で = -இல் (place of action) / -ஆல் (means); と = -உடன் / -ஓடு / "மற்றும்"; から = -இலிருந்து; まで = -வரை; の = -இன் / -உடைய; か = -ஆ (question suffix); も = -உம்; へ = -க்கு (direction). Use these consistently.
- Point out where Tamil and Japanese behave the same (SOV order, verb at the end, dropping the subject, politeness levels) so the learner feels the language is familiar.
- Tamil glosses for vocabulary: short and natural. Verbs as the infinitive-like form (போக, சாப்பிட, பார்க்க). Nouns plain (புத்தகம்). Adjectives attributive (பெரிய, அழகான). For honorific/polite Japanese words add a note in parentheses only when needed, e.g. お母さん = அம்மா (மரியாதையாக).
- Romaji in Hepburn: shi, chi, tsu, fu, ji; long vowels written as doubled or as in kana (ou → ou, ee → ee, aa → aa). Particle は as "wa", へ as "e", を as "o". Match the word spacing of the `reading` field.

Example sentences
- Vocabulary examples: one per word, 4–10 words long, everyday life, Japan or Tamil Nadu context. Use the word in its most typical N5 use.
- Grammar examples: 4–8 per point, show the pattern with different nouns/verbs, include at least one question and one negative where the pattern allows.
- `reading`: whole sentence in kana with a space between words (particles attached to the preceding word: わたしは がくせいです。). `romaji` with the same spacing.

Test items (JLPT format, see SCHEMA.md for shapes)
- 24–26 items per lesson. Target mix: 3 kanji_reading (0 if the lesson's words carry no kanji; then add vocab_context instead), 2 orthography, 6 vocab_context, 3 paraphrase, 6–7 grammar_form, 3 sentence_order, 1 passage_cloze with 2–3 blanks.
- Use the JLPT conventions: blank shown as （　　）; underlined target shown between ＿ marks e.g. ＿銀行＿.
- Distractors: same part of speech, plausible, things the learner has actually met. For kanji_reading use readings with a dropped/added long vowel, voiced/unvoiced swap, or a similar kanji's reading. For orthography use look-alike kanji.
- Spread the correct answer across indices 0–3 roughly evenly across the test.
- `explanation_ta`: 1–3 sentences in Tamil. Say why the answer is right and name the trap in the main wrong option.
- Item ids: `L07-q01` … in order.

Quality bar
- Natural Japanese a native teacher would approve; polite です/ます style throughout N5 unless a lesson teaches plain style.
- No grammar from later lessons. If you need a structure not yet taught, rewrite the sentence.
- JSON must be valid UTF-8, no trailing commas, no comments. Write the file in one go with the Write tool; do not build it with shell echo.
- Do not touch any file outside your assigned lessons.
