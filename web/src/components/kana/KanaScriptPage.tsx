"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, GraduationCap, Lock, Star } from "lucide-react";
import type { KanaScript } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { cx, kanaKey, pct } from "@/lib/utils";
import { KanaChart } from "./KanaLearn";
import { ScriptIntro, useKanaStats } from "./KanaHome";

export default function KanaScriptPage({ data }: { data: KanaScript }) {
  const free = useProgress((s) => s.settings.freeNavigation);
  const { mounted, lessons, passedUnits, final } = useKanaStats(data);
  const finalOpen = free || passedUnits === data.units.length;

  return (
    <div className="space-y-5">
      <Link href="/kana" className="btn btn-ghost !px-3 !py-2 text-sm">
        <ArrowLeft size={16} /> Kana
      </Link>
      <section className="card p-6 space-y-3">
        <h1 className="text-3xl font-black capitalize">
          {data.script}{" "}
          <span lang="ja" className="text-sakura">
            {data.script === "hiragana" ? "ひらがな" : "カタカナ"}
          </span>
        </h1>
        <ScriptIntro data={data} />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.units.map((u, i) => {
          const lp = mounted ? lessons[kanaKey(data.script, u.n)] : undefined;
          const unlocked = u.n === 1 || free || !!lessons[kanaKey(data.script, u.n - 1)]?.passed;
          const clickable = !mounted || unlocked;
          const stars = lp?.passed ? (lp.bestScore >= 0.95 ? 3 : lp.bestScore >= 0.9 ? 2 : 1) : 0;
          const body = (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={clickable ? { y: -3 } : undefined}
              className={cx("card p-4 h-full space-y-2", !clickable && "opacity-60", lp?.passed && "!border-green")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-muted">UNIT {u.n}</div>
                  <div className="font-black leading-tight">{u.title.en}</div>
                </div>
                {lp?.passed ? (
                  <div className="flex shrink-0">
                    {[0, 1, 2].map((s) => (
                      <Star key={s} size={14} className={s < stars ? "text-gold fill-gold" : "text-line"} />
                    ))}
                  </div>
                ) : mounted && !unlocked ? (
                  <Lock size={16} className="text-muted shrink-0" />
                ) : null}
              </div>
              <div className="text-xl font-bold tracking-wide truncate" lang="ja">
                {u.chars.slice(0, 10).map((c) => c.kana).join(" ")}
                {u.chars.length > 10 && " …"}
              </div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-muted">
                <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-sakura" style={{ width: `${((lp?.vocabKnown.length ?? 0) / u.chars.length) * 100}%` }} />
                </div>
                {lp?.vocabKnown.length ?? 0}/{u.chars.length}
              </div>
            </motion.div>
          );
          return clickable ? (
            <Link key={u.n} href={`/kana/${data.script}/unit/${u.n}`}>
              {body}
            </Link>
          ) : (
            <div key={u.n}>{body}</div>
          );
        })}
      </div>

      {(() => {
        const body = (
          <motion.div
            whileHover={finalOpen ? { y: -3 } : undefined}
            className={cx("card p-5 flex items-center gap-4 border-l-8 !border-l-gold", !finalOpen && "opacity-60")}
          >
            <div className="w-14 h-14 rounded-2xl bg-gold text-white grid place-items-center shrink-0">
              {final?.passed ? <Check size={28} /> : <GraduationCap size={28} />}
            </div>
            <div className="flex-1">
              <div className="font-black text-lg capitalize">{data.script} final test</div>
              <div className="text-sm text-muted">
                {final?.passed
                  ? `Passed · best ${pct(final.bestScore)}`
                  : finalOpen
                    ? "40 questions from every unit · pass 80%"
                    : "Pass all unit tests to unlock"}
              </div>
            </div>
            {!finalOpen && <Lock size={18} className="text-muted" />}
          </motion.div>
        );
        return finalOpen ? <Link href={`/kana/${data.script}/test`}>{body}</Link> : body;
      })()}

      <section className="space-y-2">
        <div className="text-xs font-extrabold text-muted">FULL CHART</div>
        <KanaChart script={data.script} units={data.units} />
      </section>
    </div>
  );
}
