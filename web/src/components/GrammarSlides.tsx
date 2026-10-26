"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lightbulb, AlertTriangle, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Example, GrammarPoint, Lang3 } from "@/lib/types";
import { lessonKey, useProgress } from "@/lib/progress";
import { cx, shuffle } from "@/lib/utils";
import Speaker from "./Speaker";
import Explain, { LangSwitch } from "./Explain";
import confetti from "canvas-confetti";

export default function GrammarSlides({
  level,
  n,
  title,
  grammar,
}: {
  level: string;
  n: number;
  title: Lang3;
  grammar: GrammarPoint[];
}) {
  const key = lessonKey(level, n);
  const markDone = useProgress((s) => s.markGrammarDone);
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);
  const settings = useProgress((s) => s.settings);
  const done = useProgress((s) => s.lessons[key]?.grammarDone ?? []);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"read" | "build">("read");
  const g = grammar[i];
  const total = grammar.length;

  useEffect(() => {
    setMode("read");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [i]);

  const finish = () => {
    markDone(key, g.id);
    addXp(5);
    touchStreak();
    if (i + 1 < total) setI(i + 1);
    else {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
      setMode("read");
      setI(total); // end screen
    }
  };

  if (i >= total) {
    return (
      <div className="space-y-4">
        <Nav level={level} n={n} />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-8 text-center space-y-4">
          <div className="text-5xl">📘</div>
          <h2 className="text-2xl font-black">
            Grammar done · <span lang="ja">{title.ja}</span>
          </h2>
          <p className="text-fg-2">
            You have gone through all {total} grammar patterns. Now take the lesson test.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/${level}/lesson/${n}/test`} className="btn btn-primary">
              Take the lesson test
            </Link>
            <button className="btn btn-ghost" onClick={() => setI(0)}>
              Review again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Nav level={level} n={n} />
      <div className="flex items-center gap-2">
        {grammar.map((gp, k) => (
          <button
            key={gp.id}
            onClick={() => setI(k)}
            className={cx(
              "h-2.5 flex-1 rounded-full transition",
              k === i ? "bg-indigo" : done.includes(gp.id) ? "bg-green" : "bg-line",
            )}
            aria-label={`Grammar ${k + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={g.id + mode}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "read" ? (
            <article className="space-y-4">
              <header className="card p-6 relative overflow-hidden">
                <div aria-hidden className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-sakura-2" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-muted">
                      GRAMMAR {i + 1} / {total}
                    </div>
                    <LangSwitch />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black mt-1 leading-tight" lang="ja">
                    {g.pattern}
                  </h1>
                  <div className="text-lg font-extrabold text-sakura mt-1">{g.name.en}</div>
                </div>
              </header>

              <section className="card p-5 border-l-8 !border-l-gold">
                <div className="flex items-center gap-2 text-xs font-extrabold text-gold mb-1">
                  <Lightbulb size={14} /> COMPARED WITH TAMIL
                </div>
                <Explain en={g.tamil_parallel_en} ta={g.tamil_parallel} className="text-lg font-bold leading-relaxed" />
              </section>

              <section className="card p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-extrabold text-muted">HOW TO MAKE IT</div>
                  <LangSwitch />
                </div>
                <Explain as="pre" en={g.formation_en} ta={g.formation} className="text-lg font-bold bg-bg-2 rounded-xl p-3" />
                <Explain en={g.explanation_en} ta={g.explanation_ta} className="mt-4 leading-relaxed text-[17px]" />
              </section>

              <section className="card p-5">
                <div className="text-xs font-extrabold text-muted mb-3">EXAMPLES</div>
                <ul className="space-y-4">
                  {g.examples.map((ex, k) => (
                    <ExampleRow key={k} ex={ex} showReading={settings.showReading} showRomaji={settings.showRomaji} />
                  ))}
                </ul>
              </section>

              {(g.pitfalls_en ?? g.pitfalls_ta) && (
                <section className="card p-5 border-l-8 !border-l-red">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-red mb-1">
                    <AlertTriangle size={14} /> WATCH OUT
                  </div>
                  <Explain en={g.pitfalls_en} ta={g.pitfalls_ta} className="leading-relaxed" />
                </section>
              )}

              <div className="flex gap-3">
                <button className="btn btn-ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
                  <ArrowLeft size={16} /> Prev
                </button>
                <button className="btn btn-indigo flex-1" onClick={() => setMode("build")}>
                  <Wand2 size={16} /> Build the sentence
                </button>
              </div>
            </article>
          ) : (
            <BuildIt examples={g.examples} onDone={finish} onSkip={finish} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Nav({ level, n }: { level: string; n: number }) {
  return (
    <div className="flex items-center justify-between">
      <Link href={`/${level}/lesson/${n}`} className="btn btn-ghost !px-3 !py-2 text-sm">
        <ArrowLeft size={16} /> Lesson {n}
      </Link>
      <Link href={`/${level}/lesson/${n}/test`} className="btn btn-ghost !px-3 !py-2 text-sm">
        Test <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function ExampleRow({ ex, showReading, showRomaji }: { ex: Example; showReading: boolean; showRomaji: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex items-start gap-3">
      <Speaker text={ex.ja} size={16} className="mt-1 shrink-0" />
      <button className="text-left flex-1" onClick={() => setOpen((o) => !o)}>
        <div className="text-xl font-medium" lang="ja">
          {ex.ja}
        </div>
        {showReading && (
          <div className="text-sm text-muted" lang="ja">
            {ex.reading}
          </div>
        )}
        {showRomaji && <div className="text-xs text-muted">{ex.romaji}</div>}
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-1 text-fg-2 font-bold" lang="ta">
                {ex.ta}
              </div>
              <div className="text-sm text-muted">{ex.en}</div>
            </motion.div>
          ) : (
            <div className="text-xs text-indigo font-bold mt-1">tap for meaning</div>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
}

/** Build-the-sentence mini game from example readings (space-separated kana chunks). */
function BuildIt({ examples, onDone, onSkip }: { examples: Example[]; onDone: () => void; onSkip: () => void }) {
  const picks = useMemo(() => shuffle(examples).slice(0, 2), [examples]);
  const [round, setRound] = useState(0);
  const ex = picks[round];
  const chunks = useMemo(() => ex.reading.replace(/[。！？]/g, "").trim().split(/\s+/), [ex]);
  const [pool, setPool] = useState<number[]>(() => shuffle(chunks.map((_, k) => k)));
  const [placed, setPlaced] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "ok" | "bad">("idle");

  useEffect(() => {
    setPool(shuffle(chunks.map((_, k) => k)));
    setPlaced([]);
    setState("idle");
  }, [chunks]);

  const check = () => {
    const ok = placed.every((c, k) => c === k) && placed.length === chunks.length;
    setState(ok ? "ok" : "bad");
    if (ok) {
      setTimeout(() => {
        if (round + 1 < picks.length) setRound(round + 1);
        else onDone();
      }, 700);
    } else {
      setTimeout(() => setState("idle"), 600);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="text-xs font-extrabold text-muted">
          BUILD THE SENTENCE · {round + 1}/{picks.length}
        </div>
        <div className="text-xl font-extrabold mt-1" lang="ta">
          {ex.ta}
        </div>
        <div className="text-sm text-muted">{ex.en}</div>
      </div>

      <div
        className={cx(
          "card p-4 min-h-[88px] flex flex-wrap gap-2 items-center transition",
          state === "ok" && "!border-green bg-green-2",
          state === "bad" && "!border-red bg-red-2",
        )}
      >
        {placed.length === 0 && <span className="text-muted text-sm font-bold">Tap the pieces in order…</span>}
        {placed.map((c) => (
          <motion.button
            layout
            key={c}
            className="chip"
            lang="ja"
            onClick={() => {
              setPlaced((p) => p.filter((x) => x !== c));
              setPool((p) => [...p, c]);
            }}
          >
            {chunks[c]}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
        {pool.map((c) => (
          <motion.button
            layout
            key={c}
            className="chip"
            lang="ja"
            onClick={() => {
              setPool((p) => p.filter((x) => x !== c));
              setPlaced((p) => [...p, c]);
            }}
          >
            {chunks[c]}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip
        </button>
        <button className="btn btn-primary flex-1" onClick={check} disabled={placed.length !== chunks.length}>
          <Check size={18} /> Check
        </button>
      </div>
      {state === "ok" && (
        <div className="text-center font-extrabold text-green" lang="ja">
          {ex.ja} ✓
        </div>
      )}
    </div>
  );
}
