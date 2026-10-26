"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type LessonProgress = {
  vocabKnown: string[];
  vocabSeen: string[];
  grammarDone: string[];
  attempts: number;
  bestScore: number; // 0..1
  lastScore: number;
  passed: boolean;
};

export type Settings = {
  freeNavigation: boolean; // unlock every lesson (review mode)
  showRomaji: boolean;
  showReading: boolean;
  autoSpeak: boolean;
  testMode: "exam" | "practice";
};

type State = {
  xp: number;
  streak: { count: number; lastDate: string | null };
  lessons: Record<string, LessonProgress>;
  settings: Settings;
  addXp: (n: number) => void;
  touchStreak: () => void;
  markVocabSeen: (key: string, id: string) => void;
  markVocabKnown: (key: string, id: string, known: boolean) => void;
  markGrammarDone: (key: string, id: string) => void;
  recordTest: (key: string, score: number, passMark: number) => void;
  resetLesson: (key: string) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
};

const empty = (): LessonProgress => ({
  vocabKnown: [],
  vocabSeen: [],
  grammarDone: [],
  attempts: 0,
  bestScore: 0,
  lastScore: 0,
  passed: false,
});

const today = () => new Date().toISOString().slice(0, 10);

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: { count: 0, lastDate: null },
      lessons: {},
      settings: {
        freeNavigation: true,
        showRomaji: true,
        showReading: true,
        autoSpeak: true,
        testMode: "exam",
      },
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      touchStreak: () => {
        const { streak } = get();
        const t = today();
        if (streak.lastDate === t) return;
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yesterday = y.toISOString().slice(0, 10);
        const count = streak.lastDate === yesterday ? streak.count + 1 : 1;
        set({ streak: { count, lastDate: t } });
      },
      markVocabSeen: (key, id) =>
        set((s) => {
          const lp = s.lessons[key] ?? empty();
          if (lp.vocabSeen.includes(id)) return {};
          return { lessons: { ...s.lessons, [key]: { ...lp, vocabSeen: [...lp.vocabSeen, id] } } };
        }),
      markVocabKnown: (key, id, known) =>
        set((s) => {
          const lp = s.lessons[key] ?? empty();
          const set_ = new Set(lp.vocabKnown);
          if (known) set_.add(id);
          else set_.delete(id);
          return { lessons: { ...s.lessons, [key]: { ...lp, vocabKnown: [...set_] } } };
        }),
      markGrammarDone: (key, id) =>
        set((s) => {
          const lp = s.lessons[key] ?? empty();
          if (lp.grammarDone.includes(id)) return {};
          return { lessons: { ...s.lessons, [key]: { ...lp, grammarDone: [...lp.grammarDone, id] } } };
        }),
      recordTest: (key, score, passMark) =>
        set((s) => {
          const lp = s.lessons[key] ?? empty();
          return {
            lessons: {
              ...s.lessons,
              [key]: {
                ...lp,
                attempts: lp.attempts + 1,
                lastScore: score,
                bestScore: Math.max(lp.bestScore, score),
                passed: lp.passed || score >= passMark,
              },
            },
          };
        }),
      resetLesson: (key) => set((s) => ({ lessons: { ...s.lessons, [key]: empty() } })),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
    }),
    {
      name: "nihongo-tamil-progress-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const lessonKey = (level: string, n: number) => `${level}-${n}`;

export function useLessonProgress(level: string, n: number): LessonProgress {
  const lp = useProgress((s) => s.lessons[lessonKey(level, n)]);
  return lp ?? empty();
}

export function isUnlocked(
  lessons: Record<string, LessonProgress>,
  level: string,
  n: number,
  free: boolean,
): boolean {
  if (free || n === 1) return true;
  return !!lessons[lessonKey(level, n - 1)]?.passed;
}
