import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  Bi,
  Kanji,
  KanjiExam,
  KanjiExample,
  KanjiReading,
  KanjiUnit,
  KanjiUnitMeta,
  KanaChar,
  KanaRule,
  KanaScript,
  KanaScriptName,
  Lesson,
  LessonBundle,
  LessonTest,
  Syllabus,
  Vocab,
} from "./types";
import { kanaToRomaji } from "./romaji";

const CONTENT_ROOT = path.resolve(process.cwd(), "..", "content");

function readJson<T>(rel: string): T | null {
  const p = path.join(CONTENT_ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch (e) {
    console.error("Bad JSON in", p, e);
    return null;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

export function getSyllabus(level = "n5"): Syllabus {
  const s = readJson<Syllabus>(`${level}/syllabus.json`);
  if (!s) throw new Error(`Missing syllabus for ${level}`);
  return s;
}

export function getLesson(level: string, n: number): Lesson | null {
  return readJson<Lesson>(`${level}/lessons/lesson-${pad(n)}.json`);
}

export function getLessonVocab(level: string, n: number): Vocab[] {
  return readJson<Vocab[]>(`${level}/vocab/lesson-${pad(n)}.json`) ?? [];
}

/** Optional bonus words (common beginner words not on the N5 list). Romaji is generated. */
export function getLessonBonus(level: string, n: number): Vocab[] {
  const raw = readJson<Omit<Vocab, "romaji">[]>(`${level}/bonus/lesson-${pad(n)}.json`) ?? [];
  return raw.map((v) => ({
    ...v,
    romaji: kanaToRomaji(v.reading),
    examples: v.examples.map((e) => ({ ...e, romaji: e.romaji ?? kanaToRomaji(e.reading) })),
  }));
}

export function getLessonBundle(level: string, n: number): LessonBundle | null {
  const syllabus = getSyllabus(level);
  const meta = syllabus.lessons.find((l) => l.n === n);
  if (!meta) return null;
  const lesson = getLesson(level, n);
  const vocab = getLessonVocab(level, n);
  return { meta, lesson, vocab, bonus: getLessonBonus(level, n) };
}

export type LessonAvailability = { n: number; hasLesson: boolean; vocabCount: number; itemCount: number };

export function getAvailability(level = "n5"): LessonAvailability[] {
  const s = getSyllabus(level);
  return s.lessons.map((l) => {
    const lesson = getLesson(level, l.n);
    const vocab = getLessonVocab(level, l.n);
    return {
      n: l.n,
      hasLesson: !!lesson,
      vocabCount: vocab.length,
      itemCount: lesson?.test?.items?.length ?? 0,
    };
  });
}

// ---- Kanji track ----

type KanjiSkeleton = { kanji: string; strokeCount: number; strokes: string[] };
type RawKanji = Omit<Kanji, "on" | "kun" | "examples" | "strokeCount" | "strokes"> & {
  on: string[];
  kun: string[];
  examples: Omit<KanjiExample, "romaji">[];
};
type RawUnit = { unit: number; title?: Bi; intro: Bi; kanji: RawKanji[]; test: LessonTest };

export function getKanjiUnits(level = "n5"): KanjiUnitMeta[] {
  const units = readJson<{ units: KanjiUnitMeta[] }>(`kanji/${level}/units.json`)?.units ?? [];
  // N4/N3 unit titles are written by the content authors inside each unit file.
  return units.map((u) => ({ ...u, title: readJson<RawUnit>(`kanji/${level}/unit-${pad(u.n)}.json`)?.title ?? u.title }));
}

export function getKanjiUnit(level: string, n: number): KanjiUnit | null {
  const meta = getKanjiUnits(level).find((u) => u.n === n);
  const raw = readJson<RawUnit>(`kanji/${level}/unit-${pad(n)}.json`);
  if (!meta || !raw) return null;
  const skel = new Map((readJson<KanjiSkeleton[]>(`kanji/${level}/skeleton.json`) ?? []).map((k) => [k.kanji, k]));
  const reading = (r: string): KanjiReading => ({ kana: r, romaji: kanaToRomaji(r.replace(/[.\-]/g, "")) });
  return {
    unit: n,
    title: raw.title ?? meta.title,
    intro: raw.intro,
    test: raw.test,
    kanji: raw.kanji.map((k) => ({
      ...k,
      on: k.on.map(reading),
      kun: k.kun.map(reading),
      examples: k.examples.map((e) => ({ ...e, romaji: kanaToRomaji(e.reading) })),
      strokeCount: skel.get(k.kanji)?.strokeCount ?? 0,
      strokes: skel.get(k.kanji)?.strokes ?? [],
    })),
  };
}

export function getKanjiExam(level = "n5"): KanjiExam | null {
  return readJson<KanjiExam>(`kanji/${level}/exam.json`);
}

// ---- Kana course ----

type KanaSkeleton = Record<KanaScriptName, { n: number; title: Bi; chars: Omit<KanaChar, "mnemonic" | "note" | "example">[] }[]>;
type KanaAuthored = {
  intro: Bi;
  units: Record<string, Bi>;
  chars: Record<string, { mnemonic?: Bi; note?: Bi; example?: { word: string; en: string; ta: string } }>;
  rules: KanaRule[];
};

export const KANA_SCRIPTS: KanaScriptName[] = ["hiragana", "katakana"];

export function getKanaScript(script: KanaScriptName): KanaScript | null {
  const skel = readJson<KanaSkeleton>("kana/skeleton.json")?.[script];
  const a = readJson<KanaAuthored>(`kana/${script}.json`);
  if (!skel || !a) return null;
  return {
    script,
    intro: a.intro,
    units: skel.map((u) => ({
      n: u.n,
      title: u.title,
      intro: a.units[String(u.n)] ?? { en: "", ta: "" },
      rules: a.rules.filter((r) => r.unit === u.n),
      chars: u.chars.map((c) => {
        const x = a.chars[c.kana] ?? {};
        return {
          ...c,
          mnemonic: x.mnemonic,
          note: x.note,
          example: x.example && { ...x.example, romaji: kanaToRomaji(x.example.word) },
        };
      }),
    })),
  };
}

// ---- Levels ----

export const LEVELS = ["n5", "n4", "n3"] as const;

/** Levels whose syllabus exists (a level appears in the app once its syllabus is written). */
export function availableLevels(): string[] {
  return LEVELS.filter((l) => fs.existsSync(path.join(CONTENT_ROOT, l, "syllabus.json")));
}
