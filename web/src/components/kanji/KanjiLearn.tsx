"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { Kanji, KanjiUnit } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { cx, kanjiKey } from "@/lib/utils";
import Speaker from "../Speaker";
import Explain, { LangSwitch } from "../Explain";
import StrokeOrder from "./StrokeOrder";

export default function KanjiLearn({ level, unit }: { level: string; unit: KanjiUnit }) {
  const key = kanjiKey(level, unit.unit);
  const markSeen = useProgress((s) => s.markVocabSeen);
  const markKnown = useProgress((s) => s.markVocabKnown);
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);
  const settings = useProgress((s) => s.settings);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const done = i >= unit.kanji.length;
  const k = unit.kanji[i];
  const base = `/kanji/${level}/unit/${unit.unit}`;

  useEffect(() => {
    if (k) markSeen(key, k.kanji);
  }, [k, key, markSeen]);

  useEffect(() => {
    if (done) confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  }, [done]);

  const go = (to: number) => {
    setDir(to > i ? 1 : -1);
    setI(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const answer = (known: boolean) => {
    markKnown(key, k.kanji, known);
    addXp(known ? 3 : 1);
    touchStreak();
    go(i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={base} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Unit {unit.unit}
        </Link>
        <LangSwitch />
      </div>

      <div className="flex gap-1.5">
        {unit.kanji.map((x, j) => (
          <button
            key={x.kanji}
            onClick={() => go(j)}
            lang="ja"
            className={cx(
              "flex-1 h-9 rounded-lg text-sm font-black transition",
              j === i ? "bg-sakura text-white scale-110" : j < i ? "bg-indigo-2 text-indigo" : "bg-bg-2 text-muted",
            )}
          >
            {x.kanji}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        {!done ? (
          <motion.div
            key={k.kanji}
            custom={dir}
            initial={{ opacity: 0, x: 40 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * dir }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <KanjiCard k={k} showRomaji={settings.showRomaji} />
            <div className="grid grid-cols-[auto_1fr_1fr] gap-3">
              <button className="btn btn-ghost" onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous">
                <ArrowLeft size={18} />
              </button>
              <motion.button whileTap={{ scale: 0.96 }} className="btn bg-red-2 text-red py-4" onClick={() => answer(false)}>
                <RotateCcw size={18} /> Not yet
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} className="btn bg-green-2 text-green py-4" onClick={() => answer(true)}>
                <Check size={18} /> I know it
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
            <div className="text-5xl">🖌️</div>
            <h2 className="text-2xl font-black">Unit {unit.unit} kanji learned!</h2>
            <p className="text-fg-2">Now play the practice games, then take the unit test.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`${base}/practice`} className="btn btn-primary">
                <Sparkles size={16} /> Practice games
              </Link>
              <Link href={`${base}/test`} className="btn btn-indigo">
                Unit test <ArrowRight size={16} />
              </Link>
              <button className="btn btn-ghost" onClick={() => go(0)}>
                <RotateCcw size={16} /> Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function KanjiCard({ k, showRomaji }: { k: Kanji; showRomaji: boolean }) {
  return (
    <article className="space-y-4">
      <section className="card p-5 sm:p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-sakura-2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          <StrokeOrder strokes={k.strokes} size={200} />
          <div className="flex-1 w-full space-y-3 text-center sm:text-left">
            <div>
              <div className="text-xs font-extrabold text-muted">{k.strokeCount} STROKES</div>
              <div className="text-3xl font-black text-sakura leading-tight" lang="ta">
                {k.meaning.ta}
              </div>
              <div className="text-xl font-extrabold text-fg-2">{k.meaning.en}</div>
            </div>
            <ReadingRow label="ON" hint="Chinese reading" list={k.on} showRomaji={showRomaji} />
            <ReadingRow label="KUN" hint="Japanese reading" list={k.kun} showRomaji={showRomaji} />
          </div>
        </div>
      </section>

      <section className="card p-5 border-l-8 !border-l-gold">
        <div className="flex items-center gap-2 text-xs font-extrabold text-gold mb-2">
          <Sparkles size={14} /> MEMORY STORY
        </div>
        <div className="flex items-start gap-4">
          <div className="text-6xl font-black leading-none shrink-0" lang="ja">
            {k.kanji}
          </div>
          <Explain en={k.mnemonic.en} ta={k.mnemonic.ta} className="text-lg font-bold leading-relaxed" />
        </div>
      </section>

      <section className="card p-5">
        <div className="text-xs font-extrabold text-muted mb-3">WORDS WITH {k.kanji}</div>
        <ul className="space-y-3">
          {k.examples.map((e) => (
            <li key={e.word} className="flex items-center gap-3">
              <Speaker text={e.reading} size={16} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-2xl font-black" lang="ja">
                    {e.word}
                  </span>
                  <span className="text-fg-2" lang="ja">
                    {e.reading}
                  </span>
                  {showRomaji && <span className="text-sm text-muted font-bold">{e.romaji}</span>}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-sakura" lang="ta">
                    {e.ta}
                  </span>
                  <span className="text-muted"> · {e.en}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {k.note && (
        <section className="card p-5 border-l-8 !border-l-red">
          <div className="flex items-center gap-2 text-xs font-extrabold text-red mb-1">
            <AlertTriangle size={14} /> WATCH OUT
          </div>
          <Explain en={k.note.en} ta={k.note.ta} className="leading-relaxed" />
        </section>
      )}
    </article>
  );
}

function ReadingRow({
  label,
  hint,
  list,
  showRomaji,
}: {
  label: string;
  hint: string;
  list: { kana: string; romaji: string }[];
  showRomaji: boolean;
}) {
  if (!list.length) return null;
  return (
    <div className="flex items-start gap-2 justify-center sm:justify-start">
      <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-indigo-2 text-indigo shrink-0 mt-1" title={hint}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {list.map((r) => (
          <span key={r.kana} className="px-2.5 py-1 rounded-xl bg-bg-2 text-left">
            <span className="text-lg font-bold" lang="ja">
              {/* "ひと.つ": part before the dot is the kanji's reading, the rest is okurigana */}
              {r.kana.replace(/-/g, "").split(".")[0]}
              {r.kana.includes(".") && <span className="text-muted">{r.kana.split(".")[1]}</span>}
            </span>
            {showRomaji && <span className="text-xs text-muted font-bold ml-1">{r.romaji}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
