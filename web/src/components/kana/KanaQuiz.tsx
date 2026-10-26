"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Flame, RotateCcw, Timer, Trophy, Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { KanaChar } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/tts";
import { cx, pct, shuffle } from "@/lib/utils";
import ProgressRing from "../ProgressRing";

type Kind = "read" | "write" | "listen" | "word";
type Q = { id: string; kind: Kind; char: KanaChar; options: string[]; answer: string };

// Pairs learners mix up; used first as distractors.
const LOOKALIKES = [
  "さち", "ぬめ", "ねれわ", "るろ", "はほ", "いり", "こに", "きさ", "あお", "けは", "まも", "くへ",
  "シツ", "ソン", "クケタ", "ウワフ", "ヌス", "チテ", "コユ", "ニ二", "ラヲ", "メナ", "マア", "ノメ",
];

function distractors(c: KanaChar, pool: KanaChar[], pick: (x: KanaChar) => string, n = 3) {
  const answer = pick(c);
  const look = LOOKALIKES.find((s) => s.includes(c.kana));
  const near = pool.filter((x) => (look?.includes(x.kana) || x.row === c.row) && pick(x) !== answer);
  const rest = pool.filter((x) => pick(x) !== answer && !near.includes(x));
  const out: string[] = [];
  for (const x of [...shuffle(near), ...shuffle(rest)]) {
    const v = pick(x);
    if (!out.includes(v)) out.push(v);
    if (out.length === n) break;
  }
  return out;
}

function build(pool: KanaChar[], count: number, kinds: Kind[]): Q[] {
  const qs: Q[] = [];
  const chars = shuffle(pool);
  for (let i = 0; i < count; i++) {
    const c = chars[i % chars.length];
    let kind = kinds[i % kinds.length];
    if (kind === "word" && !c.example) kind = "read";
    // ぢ/づ share romaji with じ/ず: test them by sound-free "write" from the chart row instead
    const pickRomaji = (x: KanaChar) => x.romaji;
    const pickKana = (x: KanaChar) => x.kana;
    if (kind === "read") {
      const others = distractors(c, pool, pickRomaji);
      qs.push({ id: `${i}`, kind, char: c, options: shuffle([c.romaji, ...others]), answer: c.romaji });
    } else if (kind === "word") {
      const words = pool.filter((x) => x.example && x.example.romaji !== c.example!.romaji);
      const others = shuffle(words).slice(0, 3).map((x) => x.example!.romaji);
      qs.push({ id: `${i}`, kind, char: c, options: shuffle([c.example!.romaji, ...others]), answer: c.example!.romaji });
    } else {
      // write / listen: choose the kana; avoid two options with the same sound (じ/ぢ)
      const others = distractors(c, pool.filter((x) => x.romaji !== c.romaji || x.kana === c.kana), pickKana);
      qs.push({ id: `${i}`, kind, char: c, options: shuffle([c.kana, ...others]), answer: c.kana });
    }
  }
  return shuffle(qs);
}

const PROMPT: Record<Kind, string> = {
  read: "How do you read this?",
  write: "Which kana makes this sound?",
  listen: "Listen. Which kana do you hear?",
  word: "Read this word",
};

export default function KanaQuiz({
  pool,
  mode,
  count = 20,
  passMark = 0.8,
  progressKey,
  back,
  next,
  title,
}: {
  pool: KanaChar[];
  mode: "practice" | "test";
  count?: number;
  passMark?: number;
  progressKey?: string;
  back: { href: string; label: string };
  next?: { href: string; label: string };
  title: string;
}) {
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);
  const recordTest = useProgress((s) => s.recordTest);
  const [round, setRound] = useState(0);
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<"run" | "done">("run");
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const practice = mode === "practice";

  // Built after mount: random questions must not render during prerender.
  useEffect(() => {
    const kinds: Kind[] = practice ? ["read", "write", "listen", "read", "word"] : ["read", "write", "listen", "read", "write"];
    setQs(build(pool, count, kinds));
    setI(0);
    setAnswers({});
    setCombo(0);
    setBest(0);
    setPhase("run");
    setStart(Date.now());
  }, [pool, count, practice, round]);

  useEffect(() => {
    if (phase !== "run" || !start) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase, start]);

  const q = qs[i];
  const picked = q ? answers[q.id] : undefined;

  useEffect(() => {
    if (q?.kind === "listen") {
      const t = setTimeout(() => speak(q.char.kana), 250);
      return () => clearTimeout(t);
    }
  }, [q]);

  const score = qs.length ? qs.filter((x) => answers[x.id] === x.answer).length / qs.length : 0;

  const finish = useCallback(() => {
    setPhase("done");
    touchStreak();
    if (!practice && progressKey) {
      recordTest(progressKey, score, passMark);
      addXp(Math.round(score * 30) + (score >= passMark ? 15 : 0));
    }
    if (score >= passMark) confetti({ particleCount: 150, spread: 85, origin: { y: 0.55 } });
  }, [practice, progressKey, recordTest, score, passMark, addXp, touchStreak]);

  const choose = (opt: string) => {
    if (practice && picked) return;
    setAnswers((a) => ({ ...a, [q.id]: opt }));
    if (practice) {
      if (opt === q.answer) {
        const c = combo + 1;
        setCombo(c);
        setBest((b) => Math.max(b, c));
        addXp(c >= 5 ? 2 : 1);
        if (c % 10 === 0) confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } else setCombo(0);
      if (q.kind !== "listen") speak(q.char.kana);
    } else {
      // exam: move on straight away
      setTimeout(() => (i + 1 < qs.length ? setI(i + 1) : finish()), 180);
    }
  };

  const advance = () => (i + 1 < qs.length ? setI(i + 1) : finish());

  if (!q && phase === "run") return <div className="card p-8 text-center text-muted font-bold">Loading…</div>;

  if (phase === "done") {
    const passed = score >= passMark;
    const wrong = qs.filter((x) => answers[x.id] !== x.answer);
    return (
      <div className="space-y-4">
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cx("card p-6 text-center space-y-4", practice ? "" : passed ? "!border-green" : "!border-red")}
        >
          <ProgressRing value={score} size={140} stroke={13} color={passed ? "var(--green)" : "var(--red)"}>
            <div>
              <div className="text-4xl font-black">{Math.round(score * 100)}%</div>
              <div className="text-xs font-bold text-muted">
                {qs.length - wrong.length}/{qs.length}
              </div>
            </div>
          </ProgressRing>
          <h1 className={cx("text-3xl font-black", passed ? "text-green" : "text-red")}>
            {practice ? (passed ? "すごい！ Great!" : "Keep going!") : passed ? "合格！ Passed" : "もう一度 · Try again"}
          </h1>
          <p className="text-fg-2">
            {practice
              ? `Best combo ${best} · time ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`
              : passed
                ? "Great work! You know these kana."
                : `You need ${pct(passMark)} to pass. Practise the ones below and try again.`}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn btn-ghost" onClick={() => setRound((r) => r + 1)}>
              <RotateCcw size={16} /> {practice ? "Play again" : "Retry"}
            </button>
            {passed && next ? (
              <Link href={next.href} className="btn btn-primary">
                {next.label} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href={back.href} className="btn btn-indigo">
                {back.label}
              </Link>
            )}
          </div>
        </motion.section>
        {wrong.length > 0 && (
          <section className="card p-5">
            <div className="text-xs font-extrabold text-muted mb-3">REVIEW THESE</div>
            <div className="flex flex-wrap gap-2">
              {[...new Map(wrong.map((x) => [x.char.kana, x.char])).values()].map((c) => (
                <button
                  key={c.kana}
                  onClick={() => speak(c.kana)}
                  className="px-3 py-2 rounded-xl bg-red-2 text-center min-w-[64px]"
                >
                  <div className="text-3xl font-black" lang="ja">
                    {c.kana}
                  </div>
                  <div className="text-xs font-extrabold">{c.romaji}</div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const showChar = q.kind === "read" || q.kind === "word";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={back.href} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> {back.label}
        </Link>
        {practice ? (
          <motion.div
            key={combo}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={cx(
              "flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-sm",
              combo >= 5 ? "bg-gold text-white" : combo > 0 ? "bg-sakura-2 text-sakura" : "bg-bg-2 text-muted",
            )}
          >
            <Flame size={16} /> {combo}
          </motion.div>
        ) : (
          <div className="flex items-center gap-1 text-sm font-extrabold text-muted tabular-nums">
            <Timer size={16} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs font-extrabold text-muted shrink-0">{title}</div>
        <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
          <motion.div className="h-full bg-sakura" animate={{ width: `${(i / qs.length) * 100}%` }} />
        </div>
        <div className="text-sm font-extrabold text-muted tabular-nums">
          {i + 1}/{qs.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id + round}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          <div className="card p-6 min-h-[210px] grid place-items-center text-center relative">
            <div className="absolute top-3 left-4 text-xs font-extrabold text-muted">{PROMPT[q.kind]}</div>
            {showChar && q.kind === "read" && (
              <div className="text-9xl font-black leading-none" lang="ja">
                {q.char.kana}
              </div>
            )}
            {q.kind === "word" && (
              <div>
                <div className="text-6xl font-black" lang="ja">
                  {q.char.example!.word}
                </div>
                <div className="text-sm text-muted font-bold mt-2">
                  <span lang="ta">{q.char.example!.ta}</span> · {q.char.example!.en}
                </div>
              </div>
            )}
            {q.kind === "write" && (
              <div>
                <div className="text-6xl font-black">{q.char.romaji}</div>
                <div className="text-2xl font-bold text-sakura mt-1" lang="ta">
                  {q.char.tamil}
                  {q.char.voiced && <span className="text-sm text-muted"> ({q.char.voiced})</span>}
                </div>
              </div>
            )}
            {q.kind === "listen" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => speak(q.char.kana)}
                className="w-24 h-24 rounded-full bg-indigo text-white grid place-items-center shadow-lg"
                aria-label="Play sound again"
              >
                <Volume2 size={42} />
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) => {
              const isAns = o === q.answer;
              const isPick = o === picked;
              const reveal = practice && !!picked;
              const kanaOpt = q.kind === "write" || q.kind === "listen";
              return (
                <motion.button
                  key={o}
                  whileTap={{ scale: 0.95 }}
                  animate={reveal && isPick && !isAns ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  onClick={() => choose(o)}
                  lang={kanaOpt ? "ja" : undefined}
                  className={cx(
                    "option min-h-[80px] grid place-items-center font-black",
                    kanaOpt ? "text-5xl" : "text-2xl",
                    reveal && isAns && "correct",
                    reveal && isPick && !isAns && "wrong",
                    !practice && isPick && "selected",
                  )}
                >
                  {o}
                </motion.button>
              );
            })}
          </div>

          {practice && picked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center gap-4">
              <div className="text-5xl font-black" lang="ja">
                {q.char.kana}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cx("font-black", picked === q.answer ? "text-green" : "text-red")}>
                  {picked === q.answer ? (combo >= 5 ? `🔥 ${combo} in a row!` : "Correct!") : "Not quite"}
                </div>
                <div className="text-sm">
                  {q.char.romaji} ·{" "}
                  <span lang="ta" className="text-sakura font-bold">
                    {q.char.tamil}
                  </span>
                  {q.kind === "word" && q.char.example && <span className="text-muted"> · {q.char.example.word} = {q.char.example.romaji}</span>}
                </div>
              </div>
              <button className="btn btn-primary" onClick={advance} autoFocus>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!practice && (
        <p className="text-center text-xs text-muted font-bold">
          <Trophy size={12} className="inline" /> Pass mark {pct(passMark)} · answers are checked at the end
        </p>
      )}
    </div>
  );
}
