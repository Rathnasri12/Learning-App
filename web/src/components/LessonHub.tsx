"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookA, GraduationCap, ScrollText, Check, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { LessonBundle } from "@/lib/types";
import { useLessonProgress } from "@/lib/progress";
import { cx, pct } from "@/lib/utils";
import ProgressRing from "./ProgressRing";

export default function LessonHub({
  level,
  bundle,
  total,
}: {
  level: string;
  bundle: LessonBundle;
  total: number;
}) {
  const { meta, lesson, vocab } = bundle;
  const lp = useLessonProgress(level, meta.n);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const vocabPct = vocab.length && mounted ? lp.vocabSeen.length / vocab.length : 0;
  const grammarPct = lesson?.grammar.length && mounted ? lp.grammarDone.length / lesson.grammar.length : 0;
  const base = `/${level}/lesson/${meta.n}`;

  const steps = [
    {
      href: `${base}/vocab`,
      icon: <BookA size={26} />,
      title: "Vocabulary",
      ta: "சொற்கள்",
      sub: `${vocab.length} words · Japanese / Romaji / தமிழ் / English`,
      value: vocabPct,
      color: "var(--sakura)",
      done: vocabPct >= 1,
      enabled: vocab.length > 0,
    },
    {
      href: `${base}/grammar`,
      icon: <ScrollText size={26} />,
      title: "Grammar",
      ta: "இலக்கணம்",
      sub: `${lesson?.grammar.length ?? meta.grammar.length} patterns · explained in Tamil`,
      value: grammarPct,
      color: "var(--indigo)",
      done: grammarPct >= 1,
      enabled: !!lesson,
    },
    {
      href: `${base}/test`,
      icon: <GraduationCap size={26} />,
      title: "Lesson test",
      ta: "பாடத் தேர்வு",
      sub: lesson
        ? `${lesson.test.items.length} JLPT-style items · pass ${pct(lesson.test.passMark)}`
        : "Coming soon",
      value: mounted ? lp.bestScore : 0,
      color: "var(--gold)",
      done: mounted && lp.passed,
      enabled: !!lesson && lesson.test.items.length > 0,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href={`/${level}`} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Map
        </Link>
        <div className="text-xs font-extrabold text-muted">
          LESSON {meta.n} / {total}
        </div>
        {meta.n < total ? (
          <Link href={`/${level}/lesson/${meta.n + 1}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            Next <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="w-20" />
        )}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 relative overflow-hidden"
      >
        <div aria-hidden className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-2" />
        <div className="relative">
          <h1 className="text-4xl font-black leading-tight" lang="ja">
            {meta.title.ja}
          </h1>
          <div className="text-xl font-extrabold text-sakura mt-1" lang="ta">
            {meta.title.ta}
          </div>
          <div className="text-sm text-muted font-bold">{meta.title.en}</div>
          <p className="mt-4 text-fg-2 leading-relaxed" lang="ta">
            {lesson?.intro_ta ?? meta.theme.ta}
          </p>
          {mounted && lp.passed && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-2 text-green font-extrabold text-sm">
              <Trophy size={16} /> Passed · best {pct(lp.bestScore)}
            </div>
          )}
        </div>
      </motion.section>

      <div className="grid gap-4">
        {steps.map((s, i) => {
          const body = (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * (i + 1) }}
              whileHover={s.enabled ? { y: -2 } : undefined}
              className={cx("card p-5 flex items-center gap-4", !s.enabled && "opacity-50")}
            >
              <ProgressRing value={s.value} size={64} stroke={7} color={s.color}>
                <div style={{ color: s.color }}>{s.done ? <Check size={24} /> : s.icon}</div>
              </ProgressRing>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <div className="font-black text-lg">{s.title}</div>
                  <div className="text-sm text-fg-2" lang="ta">
                    {s.ta}
                  </div>
                </div>
                <div className="text-sm text-muted">{s.sub}</div>
              </div>
              {s.enabled && <ArrowRight className="text-muted shrink-0" />}
            </motion.div>
          );
          return s.enabled ? (
            <Link key={s.title} href={s.href}>
              {body}
            </Link>
          ) : (
            <div key={s.title}>{body}</div>
          );
        })}
      </div>

      <section className="card p-5">
        <div className="text-xs font-extrabold text-muted mb-2">GRAMMAR IN THIS LESSON</div>
        <ul className="grid sm:grid-cols-2 gap-2">
          {meta.grammar.map((g) => (
            <li key={g.id} className="flex items-start gap-2 text-sm">
              <span
                className={cx(
                  "mt-1 w-2 h-2 rounded-full shrink-0",
                  mounted && lp.grammarDone.includes(g.id) ? "bg-green" : "bg-line",
                )}
              />
              <div>
                <div className="font-bold" lang="ja">
                  {g.pattern}
                </div>
                <div className="text-muted text-xs">{g.en}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
