"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brush, Check, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { KanaScriptName, KanaUnit } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/tts";
import { cx, kanaKey, pct } from "@/lib/utils";
import ProgressRing from "../ProgressRing";
import Explain, { LangSwitch } from "../Explain";

export default function KanaUnitHub({ script, unit, total }: { script: KanaScriptName; unit: KanaUnit; total: number }) {
  const lp = useProgress((s) => s.lessons[kanaKey(script, unit.n)]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const base = `/kana/${script}/unit/${unit.n}`;
  const seen = mounted ? (lp?.vocabSeen.length ?? 0) / unit.chars.length : 0;
  const passed = mounted && !!lp?.passed;

  const steps = [
    { href: `${base}/learn`, icon: <Brush size={26} />, title: "Learn", sub: `${unit.chars.length} kana · stroke order, sound, memory story`, value: seen, color: "var(--sakura)", done: seen >= 1 },
    { href: `${base}/practice`, icon: <Sparkles size={26} />, title: "Practice game", sub: "Read, write and listen, with combos", value: 0, color: "var(--indigo)", done: false },
    { href: `${base}/test`, icon: <GraduationCap size={26} />, title: "Unit test", sub: "20 questions · pass 80%", value: mounted ? (lp?.bestScore ?? 0) : 0, color: "var(--gold)", done: passed },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href={`/kana/${script}`} className="btn btn-ghost !px-3 !py-2 text-sm capitalize">
          <ArrowLeft size={16} /> {script}
        </Link>
        <div className="text-xs font-extrabold text-muted">
          UNIT {unit.n} / {total}
        </div>
        {unit.n < total ? (
          <Link href={`/kana/${script}/unit/${unit.n + 1}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            Next <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="w-20" />
        )}
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-3 relative overflow-hidden">
        <div aria-hidden className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-sakura-2" />
        <div className="relative space-y-3">
          <div>
            <div className="text-xs font-extrabold text-sakura tracking-wider uppercase">
              {script} · unit {unit.n}
            </div>
            <h1 className="text-2xl font-black leading-tight">{unit.title.en}</h1>
            <div className="text-fg-2 font-bold" lang="ta">
              {unit.title.ta}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unit.chars.map((c, i) => (
              <motion.button
                key={c.kana}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(0.02 * i, 0.6) }}
                whileTap={{ scale: 0.9 }}
                onClick={() => speak(c.kana)}
                lang="ja"
                className={cx(
                  "min-w-11 h-11 px-1.5 grid place-items-center rounded-xl text-xl font-black",
                  mounted && lp?.vocabKnown.includes(c.kana) ? "bg-green-2 text-green" : "bg-bg-2",
                )}
              >
                {c.kana}
              </motion.button>
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
