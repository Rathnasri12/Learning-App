"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { KanaChar, KanaRule, KanaScriptName, KanaUnit } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/tts";
import { cx, kanaKey } from "@/lib/utils";
import Speaker from "../Speaker";
import Explain, { LangSwitch } from "../Explain";
import StrokeOrder from "../kanji/StrokeOrder";

type Slide = { kind: "rule"; rule: KanaRule } | { kind: "char"; char: KanaChar };

export default function KanaLearn({ script, unit }: { script: KanaScriptName; unit: KanaUnit }) {
  const key = kanaKey(script, unit.n);
  const markSeen = useProgress((s) => s.markVocabSeen);
  const markKnown = useProgress((s) => s.markVocabKnown);
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);
  const autoSpeak = useProgress((s) => s.settings.autoSpeak);
  // Rule cards come first so the learner knows how the new sounds work.
  const slides: Slide[] = [
    ...unit.rules.map((rule) => ({ kind: "rule" as const, rule })),
    ...unit.chars.map((char) => ({ kind: "char" as const, char })),
  ];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = slides[i];
  const done = i >= slides.length;
  const base = `/kana/${script}/unit/${unit.n}`;

  useEffect(() => {
    if (slide?.kind !== "char") return;
    markSeen(key, slide.char.kana);
    if (autoSpeak) {
      const t = setTimeout(() => speak(slide.char.kana), 300);
      return () => clearTimeout(t);
    }
  }, [slide, key, markSeen, autoSpeak]);

  useEffect(() => {
    if (done) confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  }, [done]);

  const go = (to: number) => {
    setDir(to > i ? 1 : -1);
    setI(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const answer = (known: boolean) => {
    if (slide.kind === "char") {
      markKnown(key, slide.char.kana, known);
      addXp(known ? 2 : 1);
      touchStreak();
    }
    go(i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={base} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Unit {unit.n}
        </Link>
        <LangSwitch />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
          <motion.div className="h-full bg-sakura" animate={{ width: `${(Math.min(i, slides.length) / slides.length) * 100}%` }} />
        </div>
        <div className="text-sm font-extrabold text-muted tabular-nums">
          {Math.min(i + 1, slides.length)}/{slides.length}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        {!done ? (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * dir }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {slide.kind === "rule" ? <RuleCard rule={slide.rule} /> : <KanaCard c={slide.char} />}
            <div className="grid grid-cols-[auto_1fr_1fr] gap-3">
              <button className="btn btn-ghost" onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous">
                <ArrowLeft size={18} />
              </button>
              {slide.kind === "rule" ? (
                <button className="btn btn-primary col-span-2 py-4" onClick={() => go(i + 1)}>
                  Got it <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <motion.button whileTap={{ scale: 0.96 }} className="btn bg-red-2 text-red py-4" onClick={() => answer(false)}>
                    <RotateCcw size={18} /> Not yet
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} className="btn bg-green-2 text-green py-4" onClick={() => answer(true)}>
                    <Check size={18} /> I know it
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
            <div className="text-5xl" lang="ja">
              {unit.chars[0]?.kana}
            </div>
            <h2 className="text-2xl font-black">Unit {unit.n} done!</h2>
            <p className="text-fg-2">Play the practice game, then take the unit test.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`${base}/practice`} className="btn btn-primary">
                <Sparkles size={16} /> Practice game
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

function KanaCard({ c }: { c: KanaChar }) {
  return (
    <article className="space-y-4">
      <section className="card p-5 sm:p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-sakura-2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          {c.strokes.length ? (
            <StrokeOrder strokes={c.strokes} size={190} />
          ) : (
            <div className="w-[190px] h-[190px] grid place-items-center rounded-2xl bg-bg-2 border-2 border-line text-8xl font-black" lang="ja">
              {c.kana}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="text-6xl font-black">{c.romaji}</div>
              <Speaker text={c.kana} size={22} className="w-12 h-12" />
            </div>
            <div className="text-3xl font-extrabold text-sakura" lang="ta">
              {c.tamil}
              {c.voiced && (
                <span className="ml-2 align-middle text-sm font-extrabold px-2 py-0.5 rounded-full bg-indigo-2 text-indigo">
                  {c.voiced} sound
                </span>
              )}
            </div>
            <div className="text-xs text-muted font-bold">Tamil letters show the closest sound.</div>
          </div>
        </div>
      </section>

      {c.mnemonic && (
        <section className="card p-5 border-l-8 !border-l-gold">
          <div className="flex items-center gap-2 text-xs font-extrabold text-gold mb-2">
            <Sparkles size={14} /> MEMORY STORY
          </div>
          <div className="flex items-start gap-4">
            <div className="text-6xl font-black leading-none shrink-0" lang="ja">
              {c.kana}
            </div>
            <Explain en={c.mnemonic.en} ta={c.mnemonic.ta} className="text-lg font-bold leading-relaxed" />
          </div>
        </section>
      )}

      {c.example && (
        <section className="card p-5 flex items-center gap-4">
          <Speaker text={c.example.word} size={18} className="shrink-0" />
          <div className="min-w-0">
            <div className="text-3xl font-black" lang="ja">
              {[...c.example.word].map((ch, k) => (
                <span key={k} className={c.kana.includes(ch) ? "text-sakura" : undefined}>
                  {ch}
                </span>
              ))}
              <span className="text-base text-muted font-bold ml-2">{c.example.romaji}</span>
            </div>
            <div className="text-sm">
              <span lang="ta" className="font-bold">
                {c.example.ta}
              </span>
              <span className="text-muted"> · {c.example.en}</span>
            </div>
          </div>
        </section>
      )}

      {c.note && (
        <section className="card p-5 border-l-8 !border-l-red">
          <div className="flex items-center gap-2 text-xs font-extrabold text-red mb-1">
            <AlertTriangle size={14} /> WATCH OUT
          </div>
          <Explain en={c.note.en} ta={c.note.ta} className="leading-relaxed" />
        </section>
      )}
    </article>
  );
}

function RuleCard({ rule }: { rule: KanaRule }) {
  return (
    <article className="card p-6 space-y-4 border-l-8 !border-l-indigo">
      <div className="flex items-center gap-2 text-xs font-extrabold text-indigo">
        <BookOpen size={14} /> HOW IT WORKS
      </div>
      <Explain en={rule.title.en} ta={rule.title.ta} className="text-2xl font-black leading-tight" />
      <Explain en={rule.body.en} ta={rule.body.ta} className="text-lg leading-relaxed" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {rule.examples.map((x) => (
          <li key={x.word} className="rounded-xl bg-bg-2 p-3 flex items-center gap-3">
            <Speaker text={x.word.split(/[→/]/).pop()!.trim()} size={14} className="shrink-0" />
            <div>
              <div className="text-xl font-black" lang="ja">
                {x.word}
              </div>
              <div className="text-sm">
                <span lang="ta">{x.ta}</span> <span className="text-muted">· {x.en}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Tappable full chart of a script, colouring what the learner already knows. */
export function KanaChart({ script, units }: { script: KanaScriptName; units: KanaUnit[] }) {
  const lessons = useProgress((s) => s.lessons);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const known = new Set(mounted ? units.flatMap((u) => lessons[kanaKey(script, u.n)]?.vocabKnown ?? []) : []);
  // Basic table: rows of 5 in あいうえお order, gaps for や/わ rows
  const VOWELS = ["a", "i", "u", "e", "o"];
  const basic = units.filter((u) => u.n <= 3).flatMap((u) => u.chars);
  const rows: (KanaChar | null)[][] = [];
  const byRow = new Map<string, KanaChar[]>();
  for (const c of basic) byRow.set(c.row, [...(byRow.get(c.row) ?? []), c]);
  for (const [row, list] of byRow) {
    if (row === "w") {
      rows.push([list[0], null, null, null, list[1]]);
      rows.push([list[2], null, null, null, null]);
    } else rows.push(VOWELS.map((v) => list.find((c) => c.romaji.endsWith(v) && c.romaji.length <= 3) ?? null));
  }
  return (
    <div className="card p-4">
      <div className="grid grid-cols-5 gap-1.5">
        {rows.flat().map((c, k) =>
          c ? (
            <motion.button
              key={c.kana}
              whileTap={{ scale: 0.9 }}
              onClick={() => speak(c.kana)}
              className={cx(
                "aspect-square rounded-xl grid place-items-center leading-none",
                known.has(c.kana) ? "bg-green-2 text-green" : "bg-bg-2 hover:bg-indigo-2",
              )}
            >
              <span>
                <span className="block text-2xl sm:text-3xl font-black" lang="ja">
                  {c.kana}
                </span>
                <span className="block text-[10px] font-extrabold text-muted mt-0.5">{c.romaji}</span>
              </span>
            </motion.button>
          ) : (
            <div key={`gap-${k}`} />
          ),
        )}
      </div>
      <p className="text-center text-xs text-muted font-bold mt-3">Tap any kana to hear it · green = you know it</p>
    </div>
  );
}
