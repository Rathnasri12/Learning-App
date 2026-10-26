import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Lesson, LessonBundle, Syllabus, Vocab } from "./types";

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

export function getLessonBundle(level: string, n: number): LessonBundle | null {
  const syllabus = getSyllabus(level);
  const meta = syllabus.lessons.find((l) => l.n === n);
  if (!meta) return null;
  const lesson = getLesson(level, n);
  const vocab = getLessonVocab(level, n);
  return { meta, lesson, vocab };
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
