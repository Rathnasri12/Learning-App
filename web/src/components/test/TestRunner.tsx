"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Flag, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lang3, LessonTest } from "@/lib/types";
import { itemLabel } from "@/lib/types";
import { lessonKey, useProgress } from "@/lib/progress";
import Explain, { LangSwitch } from "../Explain";
import { cx, hashString, seededRandom, shuffleWith } from "@/lib/utils";
import McqView from "./McqView";
import SentenceOrderView from "./SentenceOrderView";
import PassageClozeView from "./PassageClozeView";
import ReadingView from "./ReadingView";
import ListeningView from "./ListeningView";
import Results from "./Results";
import {
  type Answer,
  emptyAnswer,
  isAnswered,
  isCloze,
  isListening,
  isMcq,
  isOrder,
  isReading,
  itemMinutes,
  makePerm,
  scoreItem,
} from "./types";

type Phase = "intro" | "run" | "results";

export type Perms = Record<string, number[] | number[][]>;

/** Where a test lives: progress key, back/next links and header labels. Defaults to a course lesson. */
export type TestNav = {
  key: string;
  back: { href: string; label: string };
  next?: { href: string; label: string };
  kicker: string;
  subtitle: string;
  passText: string;
};

export default function TestRunner({
  level,
  n,
  total,
  title,
  test,
  nav: navProp,
}: {
  level: string;
  n: number;
  total: number;
  title: Lang3;
  test: LessonTest;
  nav?: TestNav;
}) {
  const nav: TestNav = navProp ?? {
    key: lessonKey(level, n),
    back: { href: `/${level}/lesson/${n}`, label: `Lesson ${n}` },
    next: n < total ? { href: `/${level}/lesson/${n + 1}`, label: `Lesson ${n + 1}` } : undefined,
    kicker: "LESSON TEST · JLPT FORMAT",
    subtitle: `${title.en} · Lesson test`,
    passText: "Great work! You passed this lesson and the next one is unlocked.",
  };
  const key = nav.key;
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);
  const recordTest = useProgress((s) => s.recordTest);
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);

  const [phase, setPhase] = useState<Phase>("intro");
  const [attempt, setAttempt] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const items = test.items;
  const item = items[idx];
  const practice = settings.testMode === "practice";

  // Stable per-attempt shuffles of options / chunks
  const perms = useMemo<Perms>(() => {
    const rnd = seededRandom(hashString(key) + attempt * 7919 + 1);
    const out: Perms = {};
    for (const it of items) out[it.id] = makePerm(it, (ks) => shuffleWith(ks, rnd));
    return out;
  }, [items, key, attempt]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase, startedAt]);

  const start = () => {
    setAnswers({});
    setChecked({});
    setIdx(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setPhase("run");
  };

  const retry = () => {
    setAttempt((a) => a + 1);
    start();
  };

  const value = answers[item?.id] ?? (item ? emptyAnswer(item) : undefined);
  const setValue = (a: Answer) => setAnswers((s) => ({ ...s, [item.id]: a }));
  const answered = item ? isAnswered(item, answers[item.id]) : false;
  const revealed = practice && !!checked[item?.id];

  const totals = useMemo(() => {
    let e = 0,
      p = 0;
    for (const it of items) {
      const [a, b] = scoreItem(it, answers[it.id]);
      e += a;
      p += b;
    }
    return { earned: e, possible: p, score: p ? e / p : 0 };
  }, [items, answers]);

  const submit = useCallback(() => {
    recordTest(key, totals.score, test.passMark);
    addXp(Math.round(totals.score * 40) + (totals.score >= test.passMark ? 20 : 0));
    touchStreak();
    setPhase("results");
    window.scrollTo({ top: 0 });
  }, [key, totals.score, test.passMark, recordTest, addXp, touchStreak]);

  const next = () => {
    if (practice && !checked[item.id]) {
      setChecked((c) => ({ ...c, [item.id]: true }));
      return;
    }
    if (idx + 1 < items.length) setIdx(idx + 1);
    else submit();
  };

  const answeredCount = items.filter((it) => isAnswered(it, answers[it.id])).length;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  if (phase === "intro") {
    const mix = items.reduce<Record<string, number>>((acc, it) => {
      const ja = itemLabel(it).ja;
      acc[ja] = (acc[ja] ?? 0) + 1;
      return acc;
    }, {});
    const minutes = Math.ceil(items.reduce((a, it) => a + itemMinutes(it), 0));
    return (
      <div className="space-y-4">
        <Link href={nav.back.href} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> {nav.back.label}
        </Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <div>
            <div className="text-xs font-extrabold text-gold tracking-wider">{nav.kicker}</div>
            <h1 className="text-3xl font-black mt-1" lang="ja">
              {title.ja}
            </h1>
            <div className="text-fg-2">{nav.subtitle}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="items" value={String(items.length)} />
            <Stat label="pass mark" value={`${Math.round(test.passMark * 100)}%`} />
            <Stat label="est. time" value={`${minutes} min`} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-muted mb-2">QUESTION TYPES</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mix).map(([t, c]) => (
                <span key={t} className="px-3 py-1 rounded-full bg-bg-2 text-sm font-bold">
                  <span lang="ja">{t}</span>
                  <span className="text-muted"> ×{c}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-extrabold text-muted mb-2">MODE</div>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={!practice}
                onClick={() => setSetting("testMode", "exam")}
                title="Exam"
                desc="Answers checked at the end, like the real JLPT."
              />
              <ModeButton
                active={practice}
                onClick={() => setSetting("testMode", "practice")}
                title="Practice"
                desc="See the answer and explanation after each item."
              />
            </div>
          </div>
          <button className="btn btn-primary w-full py-4 text-lg" onClick={start}>
            Start test <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <Results
        nav={nav}
        items={items}
        answers={answers}
        passMark={test.passMark}
        score={totals.score}
        earned={totals.earned}
        possible={totals.possible}
        elapsed={elapsed}
        perms={perms}
        level={level}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost !px-3 !py-2 text-xs" onClick={() => setPhase("intro")}>
          <ArrowLeft size={14} /> Quit
        </button>
        <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${(answeredCount / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="flex items-center gap-1 text-xs font-extrabold text-muted tabular-nums">
          <Timer size={14} /> {mm}:{ss}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold text-muted">
          Q{idx + 1} / {items.length}
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-2 text-indigo text-xs font-extrabold">
          <span lang="ja">{itemLabel(item).ja}</span> · {itemLabel(item).en}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.18 }}
        >
          {isMcq(item) && value?.kind === "mcq" && (
            <McqView item={item} perm={perms[item.id] as number[]} value={value} onChange={setValue} reveal={revealed} />
          )}
          {isOrder(item) && value?.kind === "order" && (
            <SentenceOrderView item={item} perm={perms[item.id] as number[]} value={value} onChange={setValue} reveal={revealed} />
          )}
          {isCloze(item) && value?.kind === "cloze" && (
            <PassageClozeView item={item} perms={perms[item.id] as number[][]} value={value} onChange={setValue} reveal={revealed} />
          )}
          {isReading(item) && value?.kind === "cloze" && (
            <ReadingView item={item} perms={perms[item.id] as number[][]} value={value} onChange={setValue} reveal={revealed} />
          )}
          {isListening(item) && value?.kind === "mcq" && (
            <ListeningView item={item} perm={perms[item.id] as number[]} value={value} onChange={setValue} reveal={revealed} level={level} />
          )}

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cx(
                  "mt-4 card p-4 border-l-8",
                  scoreItem(item, answers[item.id])[0] === scoreItem(item, answers[item.id])[1] ? "!border-l-green" : "!border-l-red",
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-xs font-extrabold text-muted">
                    {scoreItem(item, answers[item.id])[0] === scoreItem(item, answers[item.id])[1] ? "Correct ✓" : "Wrong ✕"}
                    {isListening(item) ? " · transcript below" : isReading(item) ? " · explanations below" : " · Explanation"}
                  </div>
                  {(item.explanation_en || item.explanation_ta || isReading(item)) && <LangSwitch />}
                </div>
                <Explain en={item.explanation_en} ta={item.explanation_ta} className="leading-relaxed" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
          <ArrowLeft size={16} />
        </button>
        <button className="btn btn-indigo flex-1 py-4" onClick={next} disabled={!answered}>
          {practice && !checked[item.id] ? (
            <>
              <Check size={18} /> Check
            </>
          ) : idx + 1 < items.length ? (
            <>
              Next <ArrowRight size={18} />
            </>
          ) : (
            <>
              <Flag size={18} /> Submit
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 justify-center pt-2">
        {items.map((it, k) => (
          <button
            key={it.id}
            onClick={() => setIdx(k)}
            className={cx(
              "w-7 h-7 rounded-lg text-[11px] font-black",
              k === idx ? "bg-indigo text-white" : isAnswered(it, answers[it.id]) ? "bg-indigo-2 text-indigo" : "bg-line text-muted",
            )}
          >
            {k + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-bg-2 p-3">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx("text-left rounded-2xl border-2 p-3 transition", active ? "border-indigo bg-indigo-2" : "border-line")}
    >
      <div className="font-black">
        {title}
      </div>
      <div className="text-xs text-muted mt-1">{desc}</div>
    </button>
  );
}
