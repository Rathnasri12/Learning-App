# Nihongo Tamil — JLPT N5 → N3 for Tamil speakers

See `PLAN.md` for the product plan and `content/SCHEMA.md` for the content format.

## Layout

- `content/` — all course content as JSON (level → syllabus, vocab, lessons). Human-reviewed; the app reads it at build time.
- `web/` — Next.js app (cards, games, JLPT-format tests). Progress is stored in the browser for now.
- `_sources/` — raw word lists, generator scripts (`tools/`), authoring brief, per-lesson inputs. Not shipped.

## Run

```
cd web
npm install
npm run dev
```

Open http://localhost:3000

## Content workflow (N5)

1. `content/n5/syllabus.json` — 25 lessons, grammar ids, themes. Edit here to move grammar between lessons.
2. `content/n5/vocab-skeleton.json` — generated from the N5 word list (`_sources/tools/build_vocab.mjs`).
3. `content/n5/vocab-assignment.json` — word id → lesson number.
4. `_sources/tools/make_inputs.mjs` — produces `_sources/lesson-inputs/lesson-XX.json` for authors.
5. Authors write `content/n5/vocab/lesson-XX.json` and `content/n5/lessons/lesson-XX.json`.
6. Validate every lesson: `node _sources/tools/validate.mjs <n>`.

## Data sources

- N5 word list: Tanos / Jonathan Waller JLPT lists via `elzup/jlpt-word-list` (CC BY).
- Tamil glosses, grammar explanations and test items: authored for this project, reviewed by the project owner.
