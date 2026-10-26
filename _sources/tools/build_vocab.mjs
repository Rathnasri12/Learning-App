import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { toRomaji } from 'wanakana';
const csv = fs.readFileSync('../n5_elzup.csv', 'utf8');
const rows = parse(csv, { columns: true, skip_empty_lines: true });
const seen = new Set();
const out = [];
let i = 0;
for (const r of rows) {
  const key = r.expression + '|' + r.reading;
  if (seen.has(key)) continue;
  seen.add(key);
  i++;
  const romaji = toRomaji(r.reading.replace(/\s/g,''), { upcaseKatakana: false }).replace(/nn$/,'n');
  out.push({
    id: 'n5-v-' + String(i).padStart(3,'0'),
    expression: r.expression,
    reading: r.reading,
    romaji,
    en: r.meaning,
    tags: r.tags.split(' ').filter(t => t.startsWith('Genki') || t.startsWith('Minna') || t.startsWith('JLPT_N'))
  });
}
fs.mkdirSync('../../content/n5', { recursive: true });
fs.writeFileSync('../../content/n5/vocab-skeleton.json', JSON.stringify(out, null, 1), 'utf8');
console.log('words', out.length);
console.log(out.slice(0,3));
