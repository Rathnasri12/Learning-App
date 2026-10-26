# Nihongo for Tamil — Product & Build Plan

Goal: a web app that takes a Tamil speaker from zero Japanese to passing JLPT N5, N4 and N3, with Tamil as the language of explanation, and learning delivered through cards, games and exam-format quizzes rather than textbook pages.

Working name: "Nihongo Tamil" (rename later). Date: 2026-10-26.

---

## 1. Who it is for and why Tamil changes the design

Target users
- Tamil speakers in Tamil Nadu, Sri Lanka, Malaysia, Singapore and the diaspora.
- Primary motivation: jobs and study in Japan. N4 is the language gate for the Specified Skilled Worker (特定技能) visa and most language-school admissions; N3 opens better roles. The product should sell "N4 in 9 months, N3 in 18" as the promise.
- Many users learn on a phone with patchy data. Mobile-first PWA, offline-capable lesson packs.

Why teaching from Tamil is an advantage (use these everywhere in explanations)
- Word order: both are SOV. நான் சாப்பாடு சாப்பிடுகிறேன் maps one-to-one onto 私はご飯を食べます. Grammar can be taught by direct alignment instead of "reverse your English".
- Particles map onto Tamil case suffixes: を ≈ ஐ, に ≈ க்கு / இல், で ≈ ஆல் / இல், と ≈ உடன், から ≈ இருந்து, まで ≈ வரை, の ≈ உடைய / -ின். Question か ≈ the -ஆ suffix (வருகிறாயா = 来ますか).
- Short vs long vowels exist natively in Tamil (அ/ஆ, இ/ஈ, உ/ஊ, எ/ஏ, ஒ/ஓ). Tamil learners can hear and write おばさん vs おばあさん from day one. Romaji learners cannot.
- Doubled consonants (sokuon っ) are natural: Tamil has பக்கம், கட்டம். Teach っ as "the Tamil double letter".
- Politeness registers (です/ます, keigo) parallel நீ / நீங்கள் and -ங்கள் forms. Tamil speakers already think in registers.
- Verbs conjugate by suffix stacking in both languages, so て-form, past, negative etc. feel familiar.

Where Tamil script is a trap (handle explicitly)
- Tamil has one letter for k/g, t/d, p/b, c/j. Japanese needs the voiced series (が だ ば ざ) distinguished. Decision: a documented Tamil-transliteration scheme used ONLY in the first two kana weeks, with voiced consonants marked (e.g. க/க̇ or க/ஃக — pick one and never deviate), ふ = ஃபு, つ = ட்ஸு, ざ行 = ஸ with marker, ん = ன்/ம் by context. Romaji shown alongside. Both are removed automatically once the learner passes the kana mastery gate. Kana-only after that.
- Japanese え is short (எ), えい/ええ are long (ஏ). Same for お/おう. Tamil makes this easy if the scheme is consistent.

---

## 2. Scope: what "the whole syllabus" means for N5, N4, N3

JLPT no longer publishes official lists, so we build from the community-standard lists (JLPT tags in JMdict/Jisho, Jonathan Waller's lists, Tanos, Nihongo-Pro) and cross-check against past papers. Cumulative targets:

N5
- Hiragana 46 + dakuten/handakuten + yōon (きゃ…) + sokuon + long vowels. Katakana the same, plus loanword patterns (ティ, ファ, ヴ).
- Kanji: about 100.
- Vocabulary: about 800 words (numbers, time, dates, counters, family, food, places, basic verbs/adjectives, classroom and daily-life language).
- Grammar: about 80 points. Particles は が を に で へ と も から まで や の か ね よ; です/ます system; present/past/negative; い/な adjectives and their conjugation; て-form and its first uses (～てください、～ている、～てもいい、～てはいけない); ～たい; ～ましょう/～ませんか; あります/います; counters; comparatives より/いちばん; ～から/～ので basics; ～たり; ～ながら; ～前に/～後で; plain form introduction.
- Reading: short notices, signs, menus, simple messages.
- Listening: short daily exchanges, pointing at pictures, choosing the right reply.

N4
- Kanji: about 300 cumulative.
- Vocabulary: about 1,500 cumulative.
- Grammar: about 120 further points. Potential, volitional, imperative, prohibitive; conditionals と / ば / たら / なら; passive, causative, causative-passive; giving/receiving あげる・くれる・もらう and ～てあげる etc.; ～ことができる, ～たことがある, ～ことにする; ～ておく / ～てしまう / ～てみる / ～ていく / ～てくる; ～ために / ～ように; ～のに / ～ても; ～そう / ～よう / ～みたい / ～らしい (introductory); ～はず / ～かもしれない / ～と思う / ～と言う; relative clauses, nominalisation with の/こと; ～とき, ～間に, ～までに; ～すぎる, ～やすい/にくい, ～方; basic keigo (いらっしゃる、おる、お～になる、お～する).
- Reading: 2–3 paragraph passages, letters, emails, simple instructions, timetables.
- Listening: longer exchanges with distractors, announcements.

N3
- Kanji: about 650 cumulative.
- Vocabulary: about 3,750 cumulative, with heavy emphasis on 用法 (usage nuance) and compound verbs.
- Grammar: about 200 further points. ～わけだ / わけがない / わけではない / わけにはいかない; ～ことだ / ～ものだ / ～べき; ～に対して / ～について / ～によって / ～として / ～にとって / ～に関して; ～ほど / ～くらい / ～ば～ほど; ～たびに / ～うちに / ～最中 / ～ところ(だ); ～せいで / ～おかげで / ～ために (cause); ～はずがない / ～に違いない / ～に決まっている; ～っぽい / ～がち / ～気味 / ～らしい / ～みたい; ～てばかり / ～ばかりだ / ～たばかり; ～ようにする / ～ことになる; ～ざるを得ない (borderline N2, include as stretch); formal written forms, ～である; keigo depth.
- Reading: 長文 (long passages), opinion pieces, ads, instructions with conditions; 情報検索 (scan a flyer/timetable for a fact).
- Listening: 概要理解 (get the gist of a monologue) added; faster, more natural speech.

Total content volume to produce (drives the timeline)
- Kana items: ~210 (incl. combinations).
- Kanji items: ~650, each with readings, stroke order, radicals, 3–6 example words, Tamil mnemonic.
- Vocab items: ~3,750, each with Tamil gloss, English gloss, part of speech, pitch accent, 2 example sentences with Tamil translation, native audio.
- Grammar points: ~400, each with pattern, Tamil-aligned explanation, 6–10 example sentences, contrast notes ("ために vs ように"), 10+ quiz items.
- Example sentences: ~10,000 with audio.
- Reading passages: ~150 (50 per level), each with 3–6 questions.
- Listening scripts: ~400 with audio and questions.
- Lessons: ~95 (N5 25, N4 30, N3 40), each with a teach half and a JLPT-format lesson test of 20–30 items.
- Track exams: kanji, reading and listening exams per level (9 level exams plus per-set kanji exams).
- Mock exams: 3 full-length per level minimum (9 total), built to the exact JLPT blueprint below.

---

## 3. The exam is the spec: question formats the engine must reproduce

Every quiz type in the app is one of the real JLPT item types, so practice IS exam practice. Timings and counts are approximate to the current official blueprint; verify against the JLPT site before building the mock-exam module.

Sections and time
- N5: 文字・語彙 20 min, 文法・読解 40 min, 聴解 30 min (90 min total).
- N4: 文字・語彙 25 min, 文法・読解 55 min, 聴解 35 min (115 min).
- N3: 文字・語彙 30 min, 文法・読解 70 min, 聴解 40 min (140 min).

Scoring (show learners a realistic predicted score)
- 180 points total.
- N5/N4: pass at 80/180, with 言語知識・読解 ≥ 38/120 and 聴解 ≥ 19/60.
- N3: pass at 95/180, with each of the three sections ≥ 19/60.
- Real JLPT uses scaled scoring; we approximate with a linear map and label it "estimated".

Item types to implement as reusable quiz components
- 漢字読み: kanji word shown, pick the hiragana reading (4 options).
- 表記: hiragana word shown, pick the correct kanji/katakana spelling.
- 文脈規定: sentence with a blank, pick the word that fits.
- 言い換え類義: sentence shown, pick the sentence with the same meaning.
- 用法 (N4, N3): a word shown, pick the sentence that uses it correctly.
- 文の文法1: sentence with a blank, pick the grammar form.
- 文の文法2 (文の組み立て): four scrambled chunks, order them so the starred slot is correct. Implement as drag-to-order.
- 文章の文法: passage with several blanks (cloze), pick for each.
- 内容理解 短文 / 中文 / 長文: passage + comprehension questions.
- 情報検索: a notice, flyer or timetable image/table + a lookup question.
- 聴解 課題理解: listen, decide what the person should do next (picture or text options).
- 聴解 ポイント理解: listen for a specific point.
- 聴解 概要理解 (N3): gist of a monologue, options only heard, not shown.
- 聴解 発話表現: picture + situation, pick what the person would say.
- 聴解 即時応答: hear one line, pick the natural reply (options only heard).

Each quiz item carries: level, section, item type, linked content ids (kanji/vocab/grammar), difficulty, distractor rationale (so the review screen can explain in Tamil why each wrong option is wrong).

---

## 4. Course structure (how the app is organised)

Two kinds of content run side by side for every level.

A. Lessons track (per level: N5, N4, N3)
- Each level is a numbered sequence of lessons. Working numbers: N5 = 25 lessons, N4 = 30, N3 = 40 (tune so that every word and grammar point on the level list lands in exactly one lesson).
- Lessons unlock in order: lesson 1 → 2 → … → 25. A lesson is complete only when its test is passed.
- Every lesson has two halves:
  1. TEACH. Vocabulary cards for that lesson (about 30–35 words for N5, more at N4/N3) and the lesson's grammar points (2–4 per lesson) with Tamil-aligned explanations and example sentences. Cards are played through games (Word Sprint, Particle Drop, Sentence Builder) and enter the FSRS review queue.
  2. TEST. A lesson exam built from the JLPT item types, restricted to that lesson's material plus earlier lessons. Mixed set, e.g. 文脈規定, 言い換え類義, 用法 (N4+), 文の文法1, 文の組み立て, 文章の文法, plus a few 漢字読み/表記 for kanji that appear in the lesson's words. Pass mark 70%. Fail → Tamil review of every missed item → retry with a fresh item set.
- Vocabulary card fields (always all four, every word): Japanese (kanji form + kana reading), Romaji (sakura), Tamil (சகுரா · செர்ரி மலர்), English (cherry blossom). Plus audio, part of speech, pitch accent, 2 example sentences with Tamil + English. Romaji stays on vocab cards permanently; it can be hidden by a user setting but is never removed automatically.
- Grammar is part of every lesson, not a separate track. Each grammar point: pattern, formation, Tamil parallel, 6–10 examples, contrast with look-alikes, 10+ quiz items.

B. Skill tracks (each spans N5 → N4 → N3, with its own exams)
- Kanji track: ordered kanji sets (N5 100 → N4 +200 → N3 +350). Each set: kanji cards (readings, radicals, stroke order, Tamil mnemonic, example words), Kanji Forge game, writing practice. Exams per set and per level in 漢字読み / 表記 format; a level kanji exam unlocks the next level's sets.
- Reading track: passages graded N5 → N3 (短文 → 中文 → 長文 → 情報検索). Each passage: furigana toggle, tap-to-look-up, Tamil translation per sentence, 内容理解 questions. Reading exams per level in the exact JLPT 読解 format and timing.
- Listening track: scripts graded N5 → N3, with 課題理解, ポイント理解, 発話表現, 即時応答 and (N3) 概要理解. Listening Dojo for rapid drills. Listening exams per level in the exact JLPT 聴解 format with audio-only options where the real exam has them. Japanese only: no Tamil translation of scripts or questions anywhere in the listening track. After an item, the learner may reveal the Japanese transcript, nothing more.
- Tracks are independent of the lesson sequence, but the app recommends the matching kanji set / passages when a lesson introduces them.

C. Level exams
- Full Mock JLPT per level (3 papers each): all three sections, real timings, estimated score, pass/fail with section minimums, per-item-type breakdown.
- Available once the level's lessons and its kanji/reading/listening level exams are passed, and also unlocked early for anyone who wants to benchmark.

Daily loop (15–25 min)
1. FSRS review queue (vocab, grammar, kanji due today).
2. Continue the current lesson (teach half or test half).
3. One short set from a skill track (kanji / reading / listening, rotating).
4. Streak, XP, mission check-off.

Card types
- Kana card: character, stroke animation, Tamil transliteration + romaji, audio, minimal pair drill (おばさん/おばあさん, きて/きって). Used only in the kana course that precedes N5 lesson 1.
- Vocab card: as specified above (Japanese / Romaji / Tamil / English + audio + examples).
- Grammar card: pattern, Tamil-aligned explanation ("this is your -க்கு"), formation table, 6+ examples, contrast card.
- Kanji card: character, on/kun readings, radicals, stroke order (KanjiVG), Tamil mnemonic, 3–6 words, "write it" canvas.
- Sentence card: cloze with the target item hidden, audio, shadowing.
- Reading card: passage with furigana toggle, tap-a-word dictionary, Tamil translation reveal per sentence.

Game modes (each is a skin over one or more JLPT item types)
- Kana Rush: timed matching/typing of kana ↔ sound.
- Particle Drop: sentence with gaps, drag the right particle in (文の文法1).
- Sentence Builder: scrambled chunks, drag to order (文の組み立て).
- Kanji Forge: assemble kanji from radicals, then pick reading, then pick the word (漢字読み / 表記).
- Word Sprint: timed 文脈規定 with combo multiplier.
- Listening Dojo: 即時応答 rapid-fire, replies heard only.
- Story Mode: visual-novel conversations using only vocabulary/grammar taught so far, Tamil subtitle toggle, choice-based replies.

Immersion controls
- Furigana: always / unknown-kanji-only / off. Default steps down N5 → N4 → N3.
- UI language: Tamil / Tamil+Japanese / Japanese.
- Tamil glosses on cards can shrink as FSRS stability grows (user setting, default on). Romaji on vocab cards is not affected.

Progress and motivation
- XP, streaks, badges per milestone (kana done, lesson 25 passed, N5 kanji exam passed, N5 mock passed, …).
- Readiness meter per level from mock results and track exams.
- Exam-date countdown with a generated schedule across lessons and tracks (JLPT sits in July and December).

---

## 5. Architecture and stack

Frontend
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; Framer Motion for card/game animation; PWA with offline lesson packs (service worker + IndexedDB cache of the current unit's items and audio).
- Fonts: Noto Sans Tamil + Noto Sans JP. Always set lang="ja" on Japanese text and lang="ta" on Tamil text so browsers pick Japanese (not Chinese) glyph forms for shared CJK code points.
- Canvas stroke input for kana/kanji writing checks (compare against KanjiVG stroke data; order + direction tolerance).

Backend / data
- Postgres (Supabase or Neon) with Drizzle ORM. Auth via Supabase Auth (email OTP + Google). Row-level security per user.
- Audio and images on object storage + CDN (Supabase Storage or S3 + CloudFront).
- SRS: FSRS via the ts-fsrs package; one scheduler state row per (user, item).
- Server actions / route handlers for quiz grading, mock-exam scoring, progress analytics.

Content model (DB tables, simplified)
- levels, units, lessons (ordered; lesson has an item list and a boss exam).
- items: kana, kanji, vocab, grammar_point, sentence, passage, listening_script. Shared base: id, level, tags, audio_url, tamil fields, english fields, source/licence.
- quiz_items: type (the JLPT item type), stem, options, answer, explanation_ta, linked_item_ids, difficulty.
- mock_exams and mock_exam_sections referencing quiz_items with blueprint counts.
- user_item_state (FSRS fields), user_quiz_attempts, user_mock_results, user_profile (level, target exam date, UI language, furigana mode), xp_events, streaks, achievements.

Content pipeline (the real bottleneck)
1. Pull base data: JMdict + KANJIDIC2 (EDRDG licence, attribution required), KanjiVG (CC BY-SA), JLPT level tags (community lists, cross-checked), Tatoeba example sentences (CC BY), pitch accent from OJAD/Wadoku-derived data where licence allows.
2. Generate first-pass Tamil glosses, grammar explanations and mnemonics with an LLM (Claude), constrained by a style guide and the transliteration scheme. Store as draft.
3. Human review by a Tamil speaker with JLPT N2+ (non-negotiable for launch quality). Reviewer UI = simple admin table with approve/edit per field.
4. Audio: Japanese TTS (Google Cloud ja-JP Neural2 or Azure ja-JP Nanami/Keita) for sentences at scale; record a native speaker for kana, the N5 core vocab and all listening scripts. Store generated audio once, serve from CDN.
5. Quiz-item authoring: LLM drafts distractors per JLPT item type with a written "why wrong" for each; reviewer approves. Target 10+ items per grammar point, 3+ per vocab item.
6. Versioned content releases (content_version column) so fixes ship without redeploying the app.

Admin tools (build early, saves months)
- Content review dashboard (filter by level/type/review status).
- Quiz-item preview that renders exactly as the learner sees it.
- Mock-exam assembler that checks blueprint counts and difficulty spread.

---

## 6. Phased build plan

Phase 0 — Foundations (2–3 weeks)
- Finalise Tamil transliteration scheme and explanation style guide (one page, with examples).
- Design system: colour, type scale, card and game component kit, Tamil+Japanese typography checks.
- Data model, repo, CI, hosting, auth, content import scripts for JMdict/KANJIDIC2/KanjiVG.
- Licence audit and attribution page.
- Deliverable: empty app with login, one lesson rendered from real data, one card type, one game.

Phase 1 — N5 MVP (8–10 weeks)
- Kana course (hiragana + katakana) with Kana Rush, stroke practice, minimal pairs, mastery gate.
- N5 kanji (100), vocab (800), grammar (80) across ~20 units with lessons, cards, FSRS reviews, boss exams.
- Games: Particle Drop, Sentence Builder, Kanji Forge, Word Sprint.
- Listening Dojo with N5 scripts.
- Two full N5 mock exams with estimated scoring.
- Story Mode chapters 1–4.
- Progress, streaks, XP, readiness meter.
- Deliverable: closed beta with 30–50 Tamil learners; measure retention and mock-score lift.

Phase 2 — N4 (8–10 weeks)
- N4 kanji (200 more), vocab (700 more), grammar (120), ~25 units.
- Reading module (中文 passages, 情報検索 with real-looking flyers/timetables).
- Keigo introduction unit built around job-interview and workplace scenes (SSW visa relevance).
- Three N4 mock exams. Story Mode chapters 5–10.
- Furigana auto-stepdown, Tamil hint decay.
- Deliverable: public launch, N5+N4.

Phase 3 — N3 (12–14 weeks)
- N3 kanji (350 more), vocab (2,250 more), grammar (200), ~35 units.
- 長文 reading, 概要理解 listening, 用法 drills with nuance notes in Tamil.
- Three N3 mock exams. Story Mode chapters 11–16 (work, hospital, city hall, news).
- Deliverable: full N5–N3 product.

Phase 4 — Polish and growth (ongoing)
- Native-speaker audio replacement for TTS where quality matters most.
- Leagues, friends, teacher/classroom mode (coaching centres in Tamil Nadu are a real channel).
- Mobile wrappers (Capacitor) if PWA install rates are low.
- N2 only after N3 retention proves out.

Rough effort: with one full-stack developer plus one Tamil-speaking content reviewer and AI-assisted drafting, Phases 0–2 land in about 5 months and Phase 3 in another 3. Content review, not code, is the critical path at every phase.

---

## 7. Risks and how the plan handles them

- Tamil content accuracy: LLM drafts will contain awkward or wrong Tamil and wrong nuance. Mitigation: mandatory human review before publish, learner "report this card" button, content versioning for fast fixes.
- JLPT list drift: unofficial lists disagree at the edges. Mitigation: union of two lists per level, tag borderline items, re-tune after each real exam cycle with learner feedback.
- Licensing: JMdict/KANJIDIC2 and KanjiVG require attribution and share-alike on derived data. Mitigation: attribution page, keep derived dictionaries in a separately licensed data package.
- Audio cost and quality: 10k+ sentences of TTS is cheap; native recordings are not. Mitigation: TTS everywhere first, native recordings only for kana, listening sections and N5 core.
- Scope size: N3 alone is 2,250 new words. Mitigation: pipeline + admin tooling built in Phase 0, content produced in parallel with Phase 1 code.
- Mock-exam realism: learners will judge the product on this. Mitigation: build mock module strictly to the blueprint, test against a real past paper with a few N4/N3 holders.
- Mobile data constraints: Mitigation: offline unit packs, audio compressed (Opus), images small.

---

## 8. Decisions (settled 2026-10-26)

1. Platform: web first (responsive PWA). No native app for now.
2. Tamil content review: the project owner (currently preparing for N3) reviews all Tamil explanations, glosses and mnemonics. No external reviewer budgeted.
3. Timeline / launch date: none fixed. Build phase by phase; no JLPT sitting targeted yet.
4. Business model: not a concern now. Priority is complete syllabus coverage for N5, N4 and N3 — every kanji, word and grammar point on the standard lists, with nothing skipped or sampled.
5. Stack: Next.js + TypeScript + Tailwind, Postgres on Supabase with Drizzle, FSRS via ts-fsrs. Chosen by default since no existing stack was preferred.
6. Voiced-consonant convention for Tamil transliteration: still open. Decide before writing the first kana lesson.

---

## 9. Immediate next steps once decisions are in

- Initialise this folder as its own git repo (it is currently inside a stray repo rooted at the home directory).
- Scaffold Next.js + Tailwind + Drizzle + Supabase, with the content schema above.
- Write the transliteration scheme and style guide as docs/ in the repo.
- Import JMdict/KANJIDIC2/KanjiVG and tag N5 items; render the first kana lesson and Kana Rush.
