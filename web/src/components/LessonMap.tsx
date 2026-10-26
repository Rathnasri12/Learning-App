"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Check, Star, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { SyllabusLesson } from "@/lib/types";
import type { LessonAvailability } from "@/lib/content";
import { isUnlocked, lessonKey, useProgress } from "@/lib/progress";
import { cx } from "@/lib/utils";

export default function LessonMap({
  level,
  lessons,
  availability,
}: {
  level: string;
  lessons: SyllabusLesson[];
  availability: LessonAvailability[];
}) {
  const progress = useProgress((s) => s.lessons);
  const free = useProgress((s) => s.settings.freeNavigation);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ol className="relative">
      <div aria-hidden className="absolute left-7 top-6 bottom-6 w-1 rounded bg-line" />
      {lessons.map((l, i) => {
        const key = lessonKey(level, l.n);
        const lp = mounted ? progress[key] : undefined;
        const unlocked = mounted ? isUnlocked(progress, level, l.n, free) : l.n === 1;
        const av = availability.find((a) => a.n === l.n);
        const hasContent = !!av?.hasLesson;
        const passed = !!lp?.passed;
        const started = !!lp && (lp.vocabSeen.length > 0 || lp.grammarDone.length > 0 || lp.attempts > 0);
        const stars = passed ? (lp!.bestScore >= 0.95 ? 3 : lp!.bestScore >= 0.85 ? 2 : 1) : 0;
        const clickable = unlocked && hasContent;
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.6) }}
            whileHover={clickable ? { x: 4 } : undefined}
            className={cx(
              "relative flex items-center gap-4 pl-1 py-2",
              !clickable && "opacity-60",
            )}
          >
            <div
              className={cx(
                "relative z-10 grid place-items-center w-12 h-12 rounded-2xl font-black text-lg shrink-0 border-4 border-bg",
                passed
                  ? "bg-green text-white"
                  : started
                    ? "bg-sakura text-white"
                    : unlocked
                      ? "bg-indigo text-white"
                      : "bg-line text-muted",
              )}
            >
              {passed ? <Check size={22} /> : !unlocked ? <Lock size={18} /> : l.n}
            </div>
            <div className={cx("card flex-1 px-4 py-3", clickable && "hover:border-indigo")}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-muted">LESSON {l.n}</div>
                  <div className="font-black text-lg leading-tight truncate" lang="ja">
                    {l.title.ja}
                  </div>
                  <div className="text-sm text-fg-2 truncate">{l.title.en}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex">
                    {[0, 1, 2].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s < stars ? "text-gold fill-gold" : "text-line"}
                      />
                    ))}
                  </div>
                  {!hasContent ? (
                    <span className="text-[10px] font-extrabold text-muted flex items-center gap-1">
                      <BookOpen size={12} /> coming
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-muted">
                      {av?.vocabCount} words · {l.grammar.length} grammar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
        return (
          <li key={l.n}>
            {clickable ? (
              <Link href={`/${level}/lesson/${l.n}`} className="block">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}
