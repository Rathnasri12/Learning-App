"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, RotateCcw, Home } from "lucide-react";
import { useEffect, useState } from "react";
import type { TestItem } from "@/lib/types";
import { itemLabel } from "@/lib/types";
import Explain, { LangSwitch } from "../Explain";
import { cx } from "@/lib/utils";
import { rubyPlain } from "@/lib/ruby";
import ProgressRing from "../ProgressRing";
import McqView from "./McqView";
import SentenceOrderView from "./SentenceOrderView";
import PassageClozeView from "./PassageClozeView";
import ReadingView from "./ReadingView";
import ListeningView from "./ListeningView";
import type { Perms, TestNav } from "./TestRunner";
import { type Answer, emptyAnswer, isCloze, isListening, isMcq, isOrder, isReading, scoreItem } from "./types";

export default function Results({
  nav,
  items,
  answers,
  passMark,
  score,
  earned,
  possible,
  elapsed,
  perms,
  level,
  onRetry,
}: {
  nav: TestNav;
  items: TestItem[];
  answers: Record<string, Answer>;
  passMark: number;
  score: number;
  earned: number;
  possible: number;
  elapsed: number;
  perms: Perms;
  level: string;
  onRetry: () => void;
}) {
  const passed = score >= passMark;
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "wrong">("wrong");

  useEffect(() => {
    if (passed) {
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 } });
      const t = setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4, x: 0.2 } }), 400);
      return () => clearTimeout(t);
    }
  }, [passed]);

  const byType = items.reduce<Record<string, { e: number; p: number }>>((acc, it) => {
    const [e, p] = scoreItem(it, answers[it.id]);
    const t = itemLabel(it).ja;
    acc[t] = acc[t] ?? { e: 0, p: 0 };
    acc[t].e += e;
    acc[t].p += p;
    return acc;
  }, {});

  const wrong = items.filter((it) => {
    const [e, p] = scoreItem(it, answers[it.id]);
    return e < p;
  });
  const list = filter === "wrong" ? wrong : items;
  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cx("card p-6 text-center space-y-4", passed ? "!border-green" : "!border-red")}
      >
        <ProgressRing value={score} size={150} stroke={14} color={passed ? "var(--green)" : "var(--red)"}>
          <div>
            <div className="text-4xl font-black">{Math.round(score * 100)}%</div>
            <div className="text-xs font-bold text-muted">
              {earned}/{possible}
            </div>
          </div>
        </ProgressRing>
        <div>
          <h1 className={cx("text-3xl font-black", passed ? "text-green" : "text-red")}>
            {passed ? "合格！ Passed" : "もう一度 · Try again"}
          </h1>
          <p className="text-fg-2 mt-1">
            {passed
              ? nav.passText
              : `You need ${Math.round(passMark * 100)}% to pass. Read the explanations for your mistakes below and try again.`}
          </p>
          <div className="text-xs text-muted font-bold mt-2">
            Time {mm}:{ss}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn btn-ghost" onClick={onRetry}>
            <RotateCcw size={16} /> Retry (new shuffle)
          </button>
          {passed && nav.next ? (
            <Link href={nav.next.href} className="btn btn-primary">
              {nav.next.label} <ArrowRight size={16} />
            </Link>
          ) : (
            <Link href={nav.back.href} className="btn btn-indigo">
              <Home size={16} /> {nav.back.label}
            </Link>
          )}
        </div>
      </motion.section>

      <section className="card p-5">
        <div className="text-xs font-extrabold text-muted mb-3">BY QUESTION TYPE</div>
        <ul className="space-y-2">
          {Object.entries(byType).map(([t, v]) => (
            <li key={t} className="flex items-center gap-3 text-sm">
              <span className="w-36 shrink-0 font-bold">
                <span lang="ja">{t}</span>
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-line overflow-hidden">
                <motion.div
                  className={cx("h-full", v.e === v.p ? "bg-green" : v.e / v.p >= 0.6 ? "bg-gold" : "bg-red")}
                  initial={{ width: 0 }}
                  animate={{ width: `${(v.e / v.p) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="w-12 text-right font-extrabold tabular-nums">
                {v.e}/{v.p}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-extrabold text-muted">REVIEW</div>
          <div className="flex gap-1">
            <button
              className={cx("px-3 py-1 rounded-full text-xs font-extrabold", filter === "wrong" ? "bg-red-2 text-red" : "bg-bg-2 text-muted")}
              onClick={() => setFilter("wrong")}
            >
              Wrong ({wrong.length})
            </button>
            <button
              className={cx("px-3 py-1 rounded-full text-xs font-extrabold", filter === "all" ? "bg-indigo-2 text-indigo" : "bg-bg-2 text-muted")}
              onClick={() => setFilter("all")}
            >
              All ({items.length})
            </button>
          </div>
        </div>
        {list.length === 0 && (
          <div className="card p-6 text-center text-fg-2 font-bold">
            All correct! 🎉
          </div>
        )}
        {list.map((it, k) => {
          const a = answers[it.id] ?? emptyAnswer(it);
          const [e, p] = scoreItem(it, a);
          const ok = e === p;
          const isOpen = open === it.id;
          return (
            <motion.div key={it.id} layout className={cx("card overflow-hidden", ok ? "!border-green" : "!border-red")}>
              <button className="w-full text-left p-4 flex items-center gap-3" onClick={() => setOpen(isOpen ? null : it.id)}>
                <span className={cx("w-8 h-8 rounded-xl grid place-items-center font-black text-white shrink-0", ok ? "bg-green" : "bg-red")}>
                  {k + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-muted">
                    <span lang="ja">{itemLabel(it).ja}</span>
                  </div>
                  <div className="truncate" lang="ja">
                    {isMcq(it)
                      ? it.sentence
                      : isOrder(it)
                        ? `${it.before}＿★＿${it.after}`
                        : isCloze(it)
                          ? it.passage
                          : isReading(it)
                            ? rubyPlain(it.title ?? it.paragraphs[0]?.[0]?.ja ?? "")
                            : rubyPlain(it.question ?? it.intro ?? it.lines[0]?.t ?? "")}
                  </div>
                </div>
                <span className="text-xs font-extrabold text-muted">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {isMcq(it) && a.kind === "mcq" && (
                    <McqView item={it} perm={perms[it.id] as number[]} value={a} onChange={() => {}} reveal />
                  )}
                  {isOrder(it) && a.kind === "order" && (
                    <SentenceOrderView item={it} perm={perms[it.id] as number[]} value={a} onChange={() => {}} reveal />
                  )}
                  {isCloze(it) && a.kind === "cloze" && (
                    <PassageClozeView item={it} perms={perms[it.id] as number[][]} value={a} onChange={() => {}} reveal />
                  )}
                  {isReading(it) && a.kind === "cloze" && (
                    <ReadingView item={it} perms={perms[it.id] as number[][]} value={a} onChange={() => {}} reveal />
                  )}
                  {isListening(it) && a.kind === "mcq" && (
                    <ListeningView item={it} perm={perms[it.id] as number[]} value={a} onChange={() => {}} reveal level={level} />
                  )}
                  {(it.explanation_en || it.explanation_ta) && <div className="rounded-xl bg-bg-2 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-xs font-extrabold text-muted">Explanation</div>
                      <LangSwitch />
                    </div>
                    <Explain en={it.explanation_en} ta={it.explanation_ta} className="leading-relaxed" />
                  </div>}
                </div>
              )}
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
