# English explanation layer: translation brief

The site's language rule has changed. Only **word meanings and sentence translations** stay in Tamil. All teaching text (lesson intros, grammar explanations, formation notes, pitfalls, test answer explanations) must now be in **English**.

You translate existing Tamil teaching text into clear, natural English for a Tamil-speaking JLPT learner. Do NOT edit anything under `content/`. Write one patch file per lesson.

## Input
`content/n5/lessons/lesson-XX.json`. The fields to translate:
- `intro_ta` (lesson intro)
- per grammar point (`grammar[]`, key by `id`): `explanation_ta`, `tamil_parallel`, `formation`, `pitfalls_ta`
- per test item (`test.items[]`, key by `id`): `explanation_ta`

## Output
`_sources/en/lesson-XX.json` (UTF-8, valid JSON, 2-space indent):
```json
{
  "lesson": 14,
  "intro_en": "...",
  "grammar": {
    "g14-1": {
      "explanation_en": "...",
      "tamil_parallel_en": "...",
      "formation_en": "...",
      "pitfalls_en": "..."
    }
  },
  "items": {
    "L14-q01": "..."
  }
}
```
Every grammar id and every item id in the lesson must be present. Every string must be non-empty.

## Rules
1. Translate faithfully, keeping all the teaching content. Don't summarise. Fix an obvious mistake in the Tamil only if you are sure, and list it in your final report.
2. Keep all Japanese text exactly as written (kana, kanji, examples, ＿target＿ markers, line breaks `\n` in formation).
3. **Tamil is allowed only as a word meaning gloss**: when an explanation gives the meaning of a Japanese word or the answer, keep the Tamil meaning in parentheses, e.g. `地図 = ちず (வரைபடம், map). ちづ and じず are misspellings; the correct kana is ず.` In test explanations, give the Tamil meaning of the correct answer / key word this way wherever the original does.
4. `tamil_parallel_en`: explain in English how the Japanese pattern compares to Tamil. Keep the Tamil example words inline (in Tamil script with a short English gloss), since the comparison is the point. E.g. `Like Tamil verbal participles that change by verb type (செய் → செய்து "having done", படி → படித்து "having read"), the Japanese て-form changes by verb group.`
5. `formation_en`: same structure and line breaks as `formation`; replace Tamil labels with English ("Group I (い-row before ます): ...").
6. Plain, friendly English at a level a beginner understands. Use "you". No markdown inside strings.
7. Validate before finishing: `node "_sources/tools/check_en.mjs" <lesson numbers>` from the project root must print OK for each of your lessons.
