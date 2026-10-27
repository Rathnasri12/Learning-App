"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpenText, Check, GraduationCap, Headphones, Lock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { SkillTrackName, SkillUnitMeta } from "@/lib/types";
import { LISTENING_KIND_LABEL, READING_KIND_LABEL } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { cx, pct, skillKey } from "@/lib/utils";
import ProgressRing from "../ProgressRing";

export type SkillLevelData = { level: string; units: SkillUnitMeta[]; examCount: number };

const COPY: Record<SkillTrackName, { ja: string; en: string; noun: string; blurb: string; exam: string }> = {
  reading: {
    ja: "読解",
    en: "Reading",
    noun: "passages",
    blurb: "Notices, messages, emails and essays. Read with furigana and tap any sentence for its meaning, then answer JLPT-style questions.",
    exam: "Fresh passages in real JLPT 読解 format and timing",
  },
  listening: {
    ja: "聴解",
    en: "Listening",
    noun: "questions",
    blurb: "Conversations and announcements in all the JLPT 聴解 question types. Japanese only, like the real exam; check the transcript afterwards.",
    exam: "Fresh questions in real JLPT 聴解 format",
  },
};

/** Level tabs over a reading or listening track; the chosen tab is remembered in this browser. */
export default function SkillLevels({ track, levels }: { track: SkillTrackName; levels: SkillLevelData[] }) {
  const [level, setLevel] = useState(levels[0]?.level);
  const store = `${track}-level`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(store);
      if (saved && levels.some((l) => l.level === saved)) setLevel(saved);
    } catch {}
  }, [levels, store]);
  const pick = (l: string) => {
    setLevel(l);
    try {
      localStorage.setItem(store, l);
    } catch {}
  };
  const data = levels.find((l) => l.level === level) ?? levels[0];
  if (!data) return <div className="card p-6 text-center text-fg-2 font-bold">Coming soon</div>;
  return (
    <div className="space-y-4">
      {levels.length > 1 && (
        <div className="inline-flex rounded-full bg-bg-2 p-1 font-black">
          {levels.map((l) => (
            <button
              key={l.level}
              onClick={() => pick(l.level)}
              className={cx("px-5 py-2 rounded-full transition", l.level === data.level ? "bg-indigo text-white shadow" : "text-muted")}
            >
              {l.level.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <SkillTrack key={data.level} track={track} {...data} />
    </div>
  );
}

function SkillTrack({ track, level, units, examCount }: { track: SkillTrackName } & SkillLevelData) {
  const lessons = useProgress((s) => s.lessons);
  const free = useProgress((s) => s.settings.freeNavigation);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const c = COPY[track];
  const L = level.toUpperCase();
  const labels: Record<string, { ja: string }> = track === "reading" ? READING_KIND_LABEL : LISTENING_KIND_LABEL;

  const total = units.reduce((a, u) => a + u.count, 0);
  const passedUnits = mounted ? units.filter((u) => lessons[skillKey(track, level, u.n)]?.passed).length : 0;
  const exam = mounted ? lessons[skillKey(track, level, 0)] : undefined;
  const examOpen = examCount > 0 && (free || passedUnits === units.length);
  const Icon = track === "reading" ? BookOpenText : Headphones;

  return (
    <div className="space-y-5">
      <section className="card p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing value={units.length ? passedUnits / units.length : 0} size={120} stroke={12} color="var(--indigo)">
            <div className="text-center">
              <div className="text-2xl font-black">{passedUnits}</div>
              <div className="text-xs font-bold text-muted">/ {units.length}</div>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-extrabold text-indigo tracking-wider">
              {c.en.toUpperCase()} TRACK · {L}
            </div>
            <h1 className="text-3xl font-black mt-1">
              <span lang="ja">{c.ja}</span> {L}
            </h1>
            <p className="text-fg-2 mt-1">
              {total} {c.noun} in {units.length} units. {c.blurb}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {units.map((u, i) => {
          const lp = mounted ? lessons[skillKey(track, level, u.n)] : undefined;
          const unlocked = u.n === units[0].n || free || !!lessons[skillKey(track, level, u.n - 1)]?.passed;
          const clickable = !mounted || unlocked;
          const stars = lp?.passed ? (lp.bestScore >= 0.95 ? 3 : lp.bestScore >= 0.85 ? 2 : 1) : 0;
          const body = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
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
              <div className="flex flex-wrap gap-1.5">
                {u.kinds.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full bg-bg-2 text-xs font-bold" lang="ja">
                    {labels[k]?.ja ?? k}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs font-extrabold text-muted">
                <Icon size={14} /> {u.count} {c.noun}
                {lp && lp.attempts > 0 && <span className="ml-auto">best {pct(lp.bestScore)}</span>}
              </div>
            </motion.div>
          );
          return clickable ? (
            <Link key={u.n} href={`/${track}/${level}/unit/${u.n}`}>
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
              <div className="font-black text-lg">
                {L} {c.en.toLowerCase()} exam
              </div>
              <div className="text-sm text-muted">
                {examCount === 0
                  ? "Coming soon"
                  : exam?.passed
                    ? `Passed · best ${pct(exam.bestScore)}`
                    : examOpen
                      ? c.exam
                      : "Pass all unit tests to unlock"}
              </div>
            </div>
            {!examOpen && <Lock size={18} className="text-muted" />}
          </motion.div>
        );
        return examOpen ? <Link href={`/${track}/${level}/exam`}>{body}</Link> : body;
      })()}
    </div>
  );
}
