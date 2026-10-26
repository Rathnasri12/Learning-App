"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, GraduationCap, Lock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { KanjiUnitMeta } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { cx, kanjiKey, pct } from "@/lib/utils";
import ProgressRing from "../ProgressRing";

export default function KanjiTrack({
  level,
  units,
  ready,
  hasExam,
}: {
  level: string;
  units: KanjiUnitMeta[];
  ready: number[];
  hasExam: boolean;
}) {
  const lessons = useProgress((s) => s.lessons);
  const free = useProgress((s) => s.settings.freeNavigation);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = units.reduce((a, u) => a + u.kanji.length, 0);
  const known = mounted ? units.reduce((a, u) => a + (lessons[kanjiKey(level, u.n)]?.vocabKnown.length ?? 0), 0) : 0;
  const passedUnits = mounted ? units.filter((u) => lessons[kanjiKey(level, u.n)]?.passed).length : 0;
  const exam = mounted ? lessons[kanjiKey(level, 0)] : undefined;
  const examOpen = hasExam && (free || passedUnits === units.length);

  return (
    <div className="space-y-5">
      <section className="card p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing value={total ? known / total : 0} size={120} stroke={12} color="var(--indigo)">
            <div className="text-center">
              <div className="text-2xl font-black">{known}</div>
              <div className="text-xs font-bold text-muted">/ {total}</div>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-extrabold text-indigo tracking-wider">KANJI TRACK · {level.toUpperCase()}</div>
            <h1 className="text-3xl font-black mt-1">
              <span lang="ja">漢字</span> {level.toUpperCase()}
            </h1>
            <p className="text-fg-2 mt-1">
              All {total} {level.toUpperCase()} kanji in {units.length} units. Watch the stroke order, learn a memory story for
              each one, play the games, then pass the JLPT-style test.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {units.map((u, i) => {
          const lp = mounted ? lessons[kanjiKey(level, u.n)] : undefined;
          const has = ready.includes(u.n);
          const unlocked = u.n === 1 || free || !!lessons[kanjiKey(level, u.n - 1)]?.passed;
          const clickable = has && (!mounted || unlocked);
          const knownN = lp?.vocabKnown.length ?? 0;
          const stars = lp?.passed ? (lp.bestScore >= 0.95 ? 3 : lp.bestScore >= 0.85 ? 2 : 1) : 0;
          const body = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={clickable ? { y: -3 } : undefined}
              className={cx("card p-5 h-full flex flex-col gap-3", !clickable && "opacity-60", lp?.passed && "!border-green")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-muted">UNIT {u.n}</div>
                  <div className="font-black text-lg leading-tight">{u.title.en}</div>
                  <div className="text-sm text-fg-2" lang="ta">
                    {u.title.ta}
                  </div>
                </div>
                <div className="shrink-0">
                  {lp?.passed ? (
                    <div className="flex">
                      {[0, 1, 2].map((s) => (
                        <Star key={s} size={16} className={s < stars ? "text-gold fill-gold" : "text-line"} />
                      ))}
                    </div>
                  ) : mounted && !unlocked ? (
                    <Lock size={18} className="text-muted" />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5" lang="ja">
                {u.kanji.map((k) => (
                  <span
                    key={k}
                    className={cx(
                      "w-9 h-9 grid place-items-center rounded-lg text-lg font-black",
                      lp?.vocabKnown.includes(k) ? "bg-green-2 text-green" : lp?.vocabSeen.includes(k) ? "bg-indigo-2 text-indigo" : "bg-bg-2",
                    )}
                  >
                    {k}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs font-extrabold text-muted">
                <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-indigo" style={{ width: `${(knownN / u.kanji.length) * 100}%` }} />
                </div>
                {has ? `${knownN}/${u.kanji.length}` : "coming"}
              </div>
            </motion.div>
          );
          return clickable ? (
            <Link key={u.n} href={`/kanji/${level}/unit/${u.n}`}>
              {body}
            </Link>
          ) : (
            <div key={u.n}>{body}</div>
          );
        })}
      </div>

      {(() => {
        const body = (
          <motion.div
            whileHover={examOpen ? { y: -3 } : undefined}
            className={cx("card p-5 flex items-center gap-4 border-l-8 !border-l-gold", !examOpen && "opacity-60")}
          >
            <div className="w-14 h-14 rounded-2xl bg-gold text-white grid place-items-center shrink-0">
              {exam?.passed ? <Check size={28} /> : <GraduationCap size={28} />}
            </div>
            <div className="flex-1">
              <div className="font-black text-lg">{level.toUpperCase()} kanji exam</div>
              <div className="text-sm text-muted">
                {!hasExam
                  ? "Coming soon"
                  : exam?.passed
                    ? `Passed · best ${pct(exam.bestScore)}`
                    : examOpen
                      ? "30 questions in real JLPT format, covering every unit"
                      : "Pass all unit tests to unlock"}
              </div>
            </div>
            {!examOpen && <Lock size={18} className="text-muted" />}
          </motion.div>
        );
        return examOpen ? <Link href={`/kanji/${level}/exam`}>{body}</Link> : body;
      })()}

      <p className="text-center text-xs text-muted">
        Stroke order data from{" "}
        <a href="https://kanjivg.tagaini.net" className="underline" target="_blank" rel="noreferrer">
          KanjiVG
        </a>{" "}
        by Ulrich Apel, CC BY-SA 3.0.
      </p>
    </div>
  );
}
