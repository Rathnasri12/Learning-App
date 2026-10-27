# Reading (読解) and listening (聴解) tracks: authoring brief

You write content for a Japanese course for Tamil speakers (JLPT N5 → N3). Learners have finished, or are working through, that level's lessons. Their English is basic. Many plan to work or study in Japan, so most settings are in Japan (station, office, shop, school, apartment), with Tamil characters now and then (Priya, Raja, Kumar, Lakshmi…) next to Japanese ones (田中, 山田, 木村…).

**Model files — read these first and copy their style exactly:**
- `content/reading/n5/unit-01.json`
- `content/listening/n5/unit-01.json`

**Validate every file you write:** from the project root, `node _sources/tools/check_skill.mjs <reading|listening> <level> <unit numbers…> [exam]` must print OK for each. Fix and re-run until it does. The checker enforces the blueprints below.

## Level of the language
- Use only the vocabulary and grammar of the target level and the levels below it. Lists: `content/<level>/syllabus.json` (grammar per lesson) and `content/<level>/vocab-skeleton.json` (word list; `n4`/`n3` lists are additive to the lower ones). An occasional word outside the list is fine if the context makes it clear and it appears in `words` (reading only).
- N5: です/ます style, short sentences, spaces between words like the model (JLPT N5 papers are spaced). N4: still mostly spaced, plain style allowed in casual talk and diaries. N3: normal unspaced Japanese, natural speed, plain and polite styles, some keigo at work.
- **Furigana markup is required on every kanji:** write `{漢字|かんじ}`. Mark only the kanji part, okurigana outside: `{食|た}べます`, `{会|あ}いましょう`, `お{母|かあ}さん`. One markup can cover a compound: `{図書館|としょかん}`, `{五百円|ごひゃくえん}`. Readings must be the ones used in that context (`{一人|ひとり}`, `{八|はっ}さい`, `{今日|きょう}`). The app uses the markup to show furigana and to make the speech engine read correctly, so a wrong reading is a real bug. Kana-only words need no markup. Never put markup inside `words[].ja`.
- Use the typographic apostrophe ’ in English. Japanese quotes 「」, Japanese punctuation 、。？

## Reading track — `content/reading/<level>/unit-XX.json`
```json
{ "unit": 2, "title": { "en": "...", "ta": "..." }, "intro": { "en": "...", "ta": "..." }, "passMark": 0.7, "items": [ passage, ... ] }
```
Passage: see the model. Fields: `id` (`n5-r02-1`, `n5-r02-2`…; exam `n5-rx-1`…), `type: "reading"`, `kind`, optional `title` (Japanese), `paragraphs` (array of paragraphs, each an array of sentences `{ ja, en, ta }`), `table` (info only: `{ caption?, head: [...], rows: [[...]] }`, every row as long as `head`), `words` (4–8 key words: `{ ja, reading, en, ta }`, ja without markup, reading in kana), `questions` (`{ q, options: [4], answer: 0–3, explanation_en, explanation_ta }`).

- Each sentence has its own natural English `en` and natural Tamil `ta` (not word-for-word). A heading line, a greeting or a signature is its own "sentence" too.
- Kinds: `short` 短文 (a note, notice, email, memo, short diary), `mid` 中文 (a letter, essay, diary, blog post, story), `long` 長文 (N3 only: an opinion essay or article with a clear argument), `info` 情報検索 (a flyer, timetable, price list, schedule, rules: a short text plus a **table**; the question makes the learner combine 2 conditions, e.g. day + age → price).
- Questions follow JLPT 内容理解: about the content, the writer’s reason or feeling, what someone must do, what a word like これ/そのこと points to, and (mid/long) the main point. Questions and options are in Japanese with furigana markup. Options are the same length and type; the wrong ones are built from real details in the passage (wrong day, wrong person, said about something else, the opposite). Never make the answer guessable without reading.
- `explanation_en` / `explanation_ta`: simple English and natural Tamil; quote the Japanese sentence that gives the answer in 「」, then say why the tempting wrong option is wrong.
- Spread answer indexes: no index is the answer for more than about 35% of the questions in a file.

Blueprint (the checker enforces kind order and question counts; character counts exclude markup and spaces):

| level | unit (in this order) | exam (in this order) | length (chars) |
|---|---|---|---|
| N5 | short(1q), short(1q), mid(2q), info(1q) | short×3 (1q each), mid(2q), info(1q) | short 60–200, mid 180–420 |
| N4 | short(1q), short(1q), mid(3q), info(2q) | short×4 (1q each), mid(4q), info(2q) | short 100–300, mid 300–600 |
| N3 | short(1q), mid(3q), long(4q), info(2q) | short×4 (1q each), mid(3q), mid(3q), long(4q), info(2q) | short 120–330, mid 330–650, long 550–1000 |

Unit `title`: a short theme name in English and Tamil (see the theme list). `intro`: 2 simple sentences about what the learner will read. Exam file: `{ "title": { "en": "N4 reading exam", "ta": "N4 வாசிப்புத் தேர்வு" }, "passMark": 0.7, "items": [...] }` (no unit/intro), mixed themes, all new texts.

## Listening track — `content/listening/<level>/unit-XX.json`
```json
{ "unit": 2, "title": { "en": "...", "ta": "..." }, "intro": { "en": "...", "ta": "..." }, "passMark": 0.7, "items": [ item, ... ] }
```
**Japanese only.** Apart from the unit/exam `title` and `intro`, there is no English or Tamil anywhere in a listening file: no translations and no explanations. That is a product rule (learners reveal only the Japanese transcript afterwards). The checker rejects extra fields.

Item fields: `id` (`n4-l03-1`…; exam `n4-lx-1`…), `type: "listening"`, `kind`, `intro`, `scene`, `lines` (`[{ "s": "M"|"F"|"N", "t": "..." }]`, M = man, F = woman, N = narrator/announcer), `question`, `optionVoice`, `options`, `answer`. The app speaks: intro → lines → question → (for heard-only kinds) "1、… 2、… 3、…".

Kinds, in JLPT order:
- `task` 課題理解: `intro` = setting + question (「男の人と女の人が話しています。女の人はこのあと何をしますか。」), 4–10 dialogue lines with two speakers, `question` = the same question again. **4 options, printed on screen.** Typical asks: what to do first / next, what to buy or bring, which time/room/bus. The dialogue changes plans at least once (someone suggests A, it is rejected, B is chosen), so all 4 options are mentioned or implied.
- `point` ポイント理解: same shape; the question is about a reason (どうして), a feeling, a detail (いつ, どこ, 何が いちばん…). **4 options, printed.** The answer is said in other words than the option where possible; distractors are said in the dialogue but are not the answer.
- `gist` 概要理解 (**N3 only**): `intro` = setting only (「ラジオで女の人が話しています。」), 4–8 lines of mostly one speaker (a talk, a message, a radio piece), `question` = 「女の人は何について話していますか。」 / 「…どう思っていますか。」. **4 options, heard only.**
- `utterance` 発話表現: `intro` = situation + 「何と言いますか。」 (N3: 「…とき、何と言いますか。」), `scene` = 2–5 emoji drawing the picture, with **➡ right before the person who speaks** (`"🧑‍🏫 📄 ➡🙋"`), `lines: []`, `optionVoice` = the speaker’s voice (M/F), **3 options, heard only**, each a short thing that person might say; distractors are what the *other* person would say, or the wrong situation.
- `response` 即時応答: no intro or question, `lines` = exactly 1 line (a question, request or remark), **3 options, heard only**, natural replies; distractors echo words from the line but do not fit, or answer a different question.

Options for printed kinds can be short phrases or sentences; for times, places and prices give the plain values (「{三時半|さんじはん}」). Spread answers: no index is the answer for more than about 40% of the items of the same option count.

Blueprint per file (the checker enforces counts and the order shown):

| level | unit (8 items each) | exam |
|---|---|---|
| N5 | task 2, point 2, utterance 2, response 2 | task 7, point 6, utterance 5, response 6 (24) |
| N4 | task 2, point 2, utterance 2, response 2 | task 8, point 7, utterance 5, response 8 (28) |
| N3 | task 2, point 2, gist 1, utterance 1, response 2 | task 6, point 6, gist 3, utterance 4, response 9 (28) |

Speed and style: N5 slow, simple, polite; N4 natural polite and casual between friends; N3 natural speed with fillers (えっと, あのう, そうですねえ), casual speech, keigo at shops and offices, and announcements (N for station/store/school announcements).

## Unit themes (keep to your own units; don’t reuse another unit’s setting)

Reading
- N5: 1 Notes and notices (done) · 2 Shopping and food · 3 Family and home · 4 School and study · 5 Time and timetables · 6 Weather and seasons · 7 Hobbies and weekends · 8 Around town
- N4: 1 Messages and emails · 2 Part-time work · 3 Health and the clinic · 4 Travel · 5 Living in Japan (rules, rubbish, neighbours) · 6 Customs and culture · 7 Events and invitations · 8 Study and future plans
- N3: 1 Working life · 2 Changing society · 3 Technology and daily life · 4 Health and lifestyle · 5 Environment · 6 Education and learning · 7 Communication and culture · 8 Opinions and essays

Listening
- N5: 1 Greetings and plans (done) · 2 Shopping · 3 At school · 4 Days and times · 5 Food and restaurants · 6 Home and family · 7 Places and directions · 8 Weekends and hobbies
- N4: 1 At the office · 2 Shops and services · 3 Stations and transport · 4 Health · 5 Part-time job · 6 Friends and invitations · 7 Home and neighbours · 8 Travel
- N3: 1 The workplace · 2 University and seminars · 3 Announcements and news · 4 Services and problems · 5 Health and sport · 6 Hobbies and media · 7 Housing and community · 8 Plans and decisions

## Rules
- Write files with the Write tool, not shell heredocs. The console is cp1252: to print Japanese/Tamil, use Node, not Python.
- Only create/edit your own assigned files. Don’t touch app code, other units, or the checker.
- Check your Japanese twice: particles, verb forms, counters (〜本, 〜枚, 〜人), and that each furigana reading fits its context. Every question must have exactly one defensible answer.
