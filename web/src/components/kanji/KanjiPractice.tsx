"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Flame, RotateCcw, Volume2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { Kanji, KanjiUnit } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/tts";
import { cx, shuffle } from "@/lib/utils";
import MatchGame from "../MatchGame";
import StrokeOrder from "./StrokeOrder";

type Q = {
  id: string;
  kind: "meaning" | "kanji" | "reading" | "listen";
  prompt: React.ReactNode;
  audio?: string;
  options: { label: React.ReactNode; key: string }[];
  answer: string;
  reveal: Kanji;
};

const QUESTIONS = 16;

function pickOthers<T>(pool: T[], not: T, n: number) {
  return shuffle(pool.filter((x) => x !== not)).slice(0, n);
}

function buildQuestions(kanji: Kanji[]): Q[] {
  const examples = kanji.flatMap((k) => k.examples.map((e) => ({ ...e, k })));
  const qs: Q[] = [];
  for (const k of kanji) {
    const others = pickOthers(kanji, k, 3);
    qs.push({
      id: `m-${k.kanji}`,
      kind: "meaning",
      prompt: (
        <div className="text-8xl font-black" lang="ja">
          {k.kanji}
        </div>
      ),
      options: shuffle([k, ...others]).map((o) => ({
        key: o.kanji,
        label: (
          <span>
            <span className="block font-extrabold" lang="ta">
              {o.meaning.ta}
            </span>
            <span className="block text-xs text-muted">{o.meaning.en}</span>
          </span>
        ),
      })),
      answer: k.kanji,
      reveal: k,
    });
    qs.push({
      id: `k-${k.kanji}`,
      kind: "kanji",
      prompt: (
        <div>
          <div className="text-3xl font-black text-sakura" lang="ta">
            {k.meaning.ta}
          </div>
          <div className="text-lg text-fg-2 font-bold">{k.meaning.en}</div>
        </div>
      ),
      options: shuffle([k, ...others]).map((o) => ({
        key: o.kanji,
        label: (
          <span className="text-4xl font-black" lang="ja">
            {o.kanji}
          </span>
        ),
      })),
      answer: k.kanji,
      reveal: k,
    });
  }
  for (const e of examples) {
    const wrong = shuffle(examples.filter((x) => x.reading !== e.reading && x.word !== e.word)).slice(0, 3);
    if (wrong.length < 3) continue;
    qs.push({
      id: `r-${e.word}`,
      kind: "reading",
      prompt: (
        <div>
          <div className="text-6xl font-black" lang="ja">
            {e.word}
          </div>
          <div className="text-sm text-muted font-bold mt-2">
            <span lang="ta">{e.ta}</span> · {e.en}
          </div>
        </div>
      ),
      options: shuffle([e, ...wrong]).map((o) => ({
        key: o.reading,
        label: (
          <span className="text-xl font-bold" lang="ja">
            {o.reading}
          </span>
        ),
      })),
      answer: e.reading,
      reveal: e.k,
    });
    qs.push({
      id: `l-${e.word}`,
      kind: "listen",
      audio: e.reading,
      prompt: <div className="text-sm font-extrabold text-muted">Listen. Which word do you hear?</div>,
      options: shuffle([e, ...wrong]).map((o) => ({
        key: o.word,
        label: (
          <span className="text-2xl font-black" lang="ja">
            {o.word}
          </span>
        ),
      })),
      answer: e.word,
      reveal: e.k,
    });
  }
  // A balanced mix: shuffle, then cap
  return shuffle(qs).slice(0, QUESTIONS);
}

const KIND_LABEL: Record<Q["kind"], string> = {
  meaning: "What does it mean?",
  kanji: "Which kanji?",
  reading: "How do you read it?",
  listen: "Listening",
};

export default function KanjiPractice({ level, unit }: { level: string; unit: KanjiUnit }) {
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState<"quiz" | "match" | "done">("quiz");
  // Built after mount: the shuffle must not run during prerender (hydration mismatch).
  const [questions, setQuestions] = useState<Q[]>([]);
  useEffect(() => setQuestions(buildQuestions(unit.kanji)), [unit.kanji, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];
  const base = `/kanji/${level}/unit/${unit.unit}`;

  useEffect(() => {
    if (q?.audio && mode === "quiz") {
      const t = setTimeout(() => speak(q.audio!), 300);
      return () => clearTimeout(t);
    }
  }, [q, mode]);

  const choose = (key: string) => {
    if (picked) return;
    setPicked(key);
    const ok = key === q.answer;
    if (ok) {
      const c = combo + 1;
      setCombo(c);
      setBest((b) => Math.max(b, c));
      setCorrect((n) => n + 1);
      addXp(c >= 5 ? 3 : 2);
      if (c > 0 && c % 5 === 0) confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else setCombo(0);
  };

  const next = () => {
    setPicked(null);
    if (i + 1 < questions.length) setI(i + 1);
    else {
      touchStreak();
      setMode("match");
    }
  };

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setCombo(0);
    setBest(0);
    setCorrect(0);
    setMode("quiz");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={base} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Unit {unit.unit}
        </Link>
        {mode === "quiz" && (
          <motion.div
            key={combo}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={cx(
              "flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-sm",
              combo >= 5 ? "bg-gold text-white" : combo > 0 ? "bg-sakura-2 text-sakura" : "bg-bg-2 text-muted",
            )}
          >
            <Flame size={16} /> {combo} combo
          </motion.div>
        )}
      </div>

      {mode === "quiz" && q && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
              <motion.div className="h-full bg-sakura" animate={{ width: `${(i / questions.length) * 100}%` }} />
            </div>
            <div className="text-sm font-extrabold text-muted tabular-nums">
              {i + 1}/{questions.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id + round}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="card p-6 text-center min-h-[200px] grid place-items-center relative">
                <div className="absolute top-3 left-4 text-xs font-extrabold text-muted">{KIND_LABEL[q.kind]}</div>
                <div className="space-y-3">
                  {q.prompt}
                  {q.audio && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speak(q.audio!)}
                      className="mx-auto w-20 h-20 rounded-full bg-indigo text-white grid place-items-center shadow-lg"
                      aria-label="Play again"
                    >
                      <Volume2 size={36} />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {q.options.map((o) => {
                  const isAns = o.key === q.answer;
                  const isPick = o.key === picked;
                  return (
                    <motion.button
                      key={o.key}
                      whileTap={{ scale: 0.96 }}
                      animate={picked && isPick && !isAns ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                      onClick={() => choose(o.key)}
                      className={cx(
                        "option min-h-[76px] grid place-items-center text-center",
                        picked && isAns && "correct",
                        picked && isPick && !isAns && "wrong",
                      )}
                    >
                      {o.label}
                    </motion.button>
                  );
                })}
              </div>

              {picked && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center gap-4">
                  <StrokeOrder strokes={q.reveal.strokes} size={84} showControls={false} />
                  <div className="flex-1 min-w-0">
                    <div className={cx("font-black", picked === q.answer ? "text-green" : "text-red")}>
                      {picked === q.answer ? (combo >= 5 ? `🔥 ${combo} in a row!` : "Correct!") : "Not quite"}
                    </div>
                    <div className="text-sm">
                      <span className="font-black" lang="ja">
                        {q.reveal.kanji}
                      </span>{" "}
                      = <span lang="ta">{q.reveal.meaning.ta}</span> · {q.reveal.meaning.en}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={next} autoFocus>
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {mode === "match" && (
        <div className="space-y-3">
          <div className="card p-4 text-center font-extrabold">
            Quiz done: {correct}/{questions.length} · best combo {best}. Now match each kanji with its Tamil meaning!
          </div>
          <MatchGame
            vocab={unit.kanji.map((k) => ({
              id: k.kanji,
              expression: k.kanji,
              reading: k.kun[0]?.kana ?? k.on[0]?.kana ?? k.kanji,
              romaji: "",
              en: k.meaning.en,
              ta: k.meaning.ta,
              pos: "kanji",
              examples: [],
            }))}
            pairs={5}
            onDone={() => {
              addXp(10);
              setMode("done");
            }}
          />
        </div>
      )}

      {mode === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
          <div className="text-5xl">
            <Zap className="inline text-gold" size={48} />
          </div>
          <h2 className="text-2xl font-black">Practice complete</h2>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-3xl font-black text-green">
                {correct}/{questions.length}
              </div>
              <div className="text-xs font-bold text-muted">correct</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gold">{best}</div>
              <div className="text-xs font-bold text-muted">best combo</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`${base}/test`} className="btn btn-primary">
              Unit test <ArrowRight size={16} />
            </Link>
            <button className="btn btn-ghost" onClick={restart}>
              <RotateCcw size={16} /> Play again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
