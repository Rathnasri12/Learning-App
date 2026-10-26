"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ProgressRing from "./ProgressRing";
import { useProgress } from "@/lib/progress";

export default function HomeHero({ lessonCount, readyCount }: { lessonCount: number; readyCount: number }) {
  const lessons = useProgress((s) => s.lessons);
  const streak = useProgress((s) => s.streak.count);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const passed = mounted
    ? Object.entries(lessons).filter(([k, v]) => k.startsWith("n5-") && v.passed).length
    : 0;
  const next = Math.min(passed + 1, lessonCount);

  return (
    <section className="card p-6 sm:p-8 overflow-hidden relative">
      <motion.div
        aria-hidden
        className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-sakura-2"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <ProgressRing value={lessonCount ? passed / lessonCount : 0} size={132} stroke={14}>
          <div className="text-center">
            <div className="text-3xl font-black">{passed}</div>
            <div className="text-xs font-bold text-muted">/ {lessonCount}</div>
          </div>
        </ProgressRing>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm font-extrabold text-sakura tracking-wide">JLPT N5</div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mt-1">
            <span lang="ja">日本語</span> for Tamil speakers
          </h1>
          <p className="text-fg-2 mt-2">
            Flashcards, games and JLPT-style tests, with every word explained in Tamil. 15 minutes a day.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link href={`/n5/lesson/${next}`} className="btn btn-primary">
              {passed === 0 ? "Start lesson 1" : `Continue · Lesson ${next}`}
            </Link>
            <Link href="/n5" className="btn btn-ghost">
              Lesson map
            </Link>
          </div>
          <div className="mt-3 text-xs text-muted font-bold">
            {mounted && streak > 0 ? `🔥 ${streak}-day streak` : "Start a streak today"} · {readyCount} lessons loaded
          </div>
        </div>
      </div>
    </section>
  );
}
