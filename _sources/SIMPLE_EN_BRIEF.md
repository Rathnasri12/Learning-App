# Simple English pass

The learners are Tamil speakers whose English is basic. The user asked for **very simple English**, with Tamil available on a button. Rewrite the English strings in `_sources/en/lesson-XX.json` in place. Keep the file shape exactly the same (same keys, same ids).

Fields: `intro_en`, every `grammar.<id>.explanation_en / tamil_parallel_en / formation_en / pitfalls_en`, and every `items.<id>` string.

## Rules
1. Short sentences: one idea per sentence, about 12 words or fewer. Break long sentences up.
2. Everyday words only. Say "use", not "employ"; "shows", not "indicates"; "polite", not "courteous".
3. Grammar terms: avoid them where you can. If you need one, explain it in plain words the first time in each string, e.g. "は marks the topic (what you are talking about)". Prefer "the word before は" to "N1".
4. Keep every teaching point, every rule and every example. Make the words simpler, not the content shorter. Don't drop a warning or an exception.
5. Keep all Japanese text exactly as written, including ＿target＿, ［1］, ★ and `\n` line breaks in `formation_en`.
6. Keep every Tamil gloss and Tamil example that is already there, exactly as written. Tamil must stay inside parentheses or double quotes.
7. Use "you". Be friendly. No markdown inside strings. Use the typographic apostrophe ’ in contractions (don’t), never a straight '.
8. Test explanations: first say why the right answer is right, then why the main wrong ones are wrong. Keep them short.

Example. Before: "は (pronounced "wa" here) is the topic particle; it means "as for X…". です politely ends the sentence."
After: "は shows the topic, the thing you are talking about. Here it is read "wa", not "ha". It means "about X…". です ends the sentence in a polite way."

## Check
Run `node _sources/tools/check_en.mjs <your lesson numbers>` from the project root. It must print OK, with no warnings, for every lesson. Write the files with the Write tool or a Node script, not shell heredocs. The console is cp1252, so use Node rather than Python to print Japanese or Tamil. Do not touch `content/` or `web/`.
