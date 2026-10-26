"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brush, Check, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { KanjiUnit } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { cx, kanjiKey, pct } from "@/lib/utils";
import ProgressRing from "../ProgressRing";
import Explain, { LangSwitch } from "../Explain";

export default function KanjiUnitHub({ level, unit, total }: { level: string; unit: KanjiUnit; total: number }) {
  const lp = useProgress((s) => s.lessons[kanjiKey(level, unit.unit)]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const base = `/kanji/${level}/unit/${unit.unit}`;
  const n = unit.kanji.length;
  const seen = mounted ? (lp?.vocabSeen.length ?? 0) / n : 0;
  const passed = mounted && !!lp?.passed;

  const steps = [
    {
      href: `${base}/learn`,
      icon: <Brush size={26} />,
      title: "Learn",
      sub: `${n} kanji · stroke order, memory story, readings, words`,
      value: seen,
      color: "var(--sakura)",
      done: seen >= 1,
    },
    {
      href: `${base}/practice`,
      icon: <Sparkles size={26} />,
      title: "Practice games",
      sub: "Quick-fire quiz with combos, listening, then a match game",
      value: 0,
      color: "var(--indigo)",
      done: false,
    },
    {
      href: `${base}/test`,
      icon: <GraduationCap size={26} />,
      title: "Unit test",
      sub: `${unit.test.items.length} JLPT-style questions · pass ${pct(unit.test.passMark)}`,
      value: mounted ? (lp?.bestScore ?? 0) : 0,
      color: "var(--gold)",
      done: passed,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/kanji" className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Kanji
        </Link>
        <div className="text-xs font-extrabold text-muted">
          UNIT {unit.unit} / {total}
        </div>
        {unit.unit < total ? (
          <Link href={`/kanji/${level}/unit/${unit.unit + 1}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            Next <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="w-20" />
        )}
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-sakura-2" />
        <div className="relative space-y-3">
          <div>
            <div className="text-xs font-extrabold text-sakura tracking-wider">KANJI UNIT {unit.unit}</div>
            <h1 className="text-3xl font-black leading-tight">{unit.title.en}</h1>
            <div className="text-lg font-bold text-fg-2" lang="ta">
              {unit.title.ta}
            </div>
          </div>
          <div className="flex flex-wrap gap-2" lang="ja">
            {unit.kanji.map((k, i) => (
              <motion.span
                key={k.kanji}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className={cx(
                  "w-12 h-12 grid place-items-center rounded-xl text-2xl font-black",
                  mounted && lp?.vocabKnown.includes(k.kanji) ? "bg-green-2 text-green" : "bg-bg-2",
                )}
                title={`${k.meaning.en}`}
              >
                {k.kanji}
              </motion.span>
            ))}
          </div>
          <div className="flex justify-end">
            <LangSwitch />
          </div>
          <Explain en={unit.intro.en} ta={unit.intro.ta} className="text-fg-2 leading-relaxed" />
          {passed && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-2 text-green font-extrabold text-sm">
              <Trophy size={16} /> Passed · best {pct(lp!.bestScore)}
            </div>
          )}
        </div>
      </motion.section>

      <div className="grid gap-4">
        {steps.map((s, i) => (
          <Link key={s.title} href={s.href}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * (i + 1) }}
              whileHover={{ y: -2 }}
              className="card p-5 flex items-center gap-4"
            >
              <ProgressRing value={s.value} size={64} stroke={7} color={s.color}>
                <div style={{ color: s.color }}>{s.done ? <Check size={24} /> : s.icon}</div>
              </ProgressRing>
              <div className="flex-1 min-w-0">
                <div className="font-black text-lg">{s.title}</div>
                <div className="text-sm text-muted">{s.sub}</div>
              </div>
              <ArrowRight className="text-muted shrink-0" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
