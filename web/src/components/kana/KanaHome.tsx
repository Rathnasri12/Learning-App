"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { KanaScript } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { kanaKey } from "@/lib/utils";
import ProgressRing from "../ProgressRing";
import Explain, { LangSwitch } from "../Explain";

export function useKanaStats(data: KanaScript) {
  const lessons = useProgress((s) => s.lessons);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const total = data.units.reduce((a, u) => a + u.chars.length, 0);
  const known = mounted ? data.units.reduce((a, u) => a + (lessons[kanaKey(data.script, u.n)]?.vocabKnown.length ?? 0), 0) : 0;
  const passedUnits = mounted ? data.units.filter((u) => lessons[kanaKey(data.script, u.n)]?.passed).length : 0;
  const final = mounted ? lessons[kanaKey(data.script, 0)] : undefined;
  return { mounted, lessons, total, known, passedUnits, final };
}

export default function KanaHome({ scripts }: { scripts: KanaScript[] }) {
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <div className="text-xs font-extrabold text-sakura tracking-wider">START HERE</div>
        <h1 className="text-3xl font-black mt-1">
          <span lang="ja">かな</span> Hiragana & Katakana
        </h1>
        <p className="text-fg-2 mt-2">
          Japanese uses two sound alphabets. Learn hiragana first, then katakana. After that you can start lesson 1. Each character comes with
          its stroke order, a Tamil sound and a memory story.
        </p>
      </section>
      {scripts.map((d, i) => (
        <ScriptCard key={d.script} data={d} delay={i * 0.1} />
      ))}
    </div>
  );
}

function ScriptCard({ data, delay }: { data: KanaScript; delay: number }) {
  const { total, known, passedUnits, final } = useKanaStats(data);
  const sample = data.units[0].chars.slice(0, 5).map((c) => c.kana).join(" ");
  return (
    <Link href={`/kana/${data.script}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -3 }}
        className="card p-5 flex items-center gap-5"
      >
        <ProgressRing value={total ? known / total : 0} size={84} stroke={9} color={data.script === "hiragana" ? "var(--sakura)" : "var(--indigo)"}>
          <div className="text-center">
            <div className="text-lg font-black">{known}</div>
            <div className="text-[10px] font-bold text-muted">/ {total}</div>
          </div>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="font-black text-xl capitalize">{data.script}</div>
          <div className="text-2xl font-bold tracking-widest" lang="ja">
            {sample}
          </div>
          <div className="text-xs text-muted font-bold mt-1">
            {data.units.length} units · {passedUnits}/{data.units.length} tests passed
            {final?.passed && (
              <span className="text-green">
                {" "}
                · <Check size={12} className="inline" /> final test passed
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="text-muted shrink-0" />
      </motion.div>
    </Link>
  );
}

export function ScriptIntro({ data }: { data: KanaScript }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <LangSwitch />
      </div>
      <Explain en={data.intro.en} ta={data.intro.ta} className="text-fg-2 leading-relaxed" />
    </div>
  );
}
