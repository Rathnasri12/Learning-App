"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, GraduationCap, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReadingItem, SkillUnit } from "@/lib/types";
import { READING_KIND_LABEL } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { rubyPlain } from "@/lib/ruby";
import { cx, pct, skillKey } from "@/lib/utils";
import Explain, { LangSwitch } from "../Explain";
import Passage from "../reading/Passage";

/** Study page of a reading unit: read each passage with furigana, translations and a word list, then take the test. */
export default function ReadingUnitHub({ level, unit, total }: { level: string; unit: SkillUnit<ReadingItem>; total: number }) {
  const key = skillKey("reading", level, unit.unit);
  const lp = useProgress((s) => s.lessons[key]);
  const markSeen = useProgress((s) => s.markVocabSeen);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  const seen = mounted ? (lp?.vocabSeen ?? []) : [];
  const passed = mounted && !!lp?.passed;
  const qCount = unit.items.reduce((a, p) => a + p.questions.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/reading" className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Reading
        </Link>
        <div className="text-xs font-extrabold text-muted">
          {level.toUpperCase()} · UNIT {unit.unit} / {total}
        </div>
        {unit.unit < total ? (
          <Link href={`/reading/${level}/unit/${unit.unit + 1}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            Next <ArrowRight size={16} />
          </Link>
        ) : (
          <span className="w-20" />
        )}
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 relative overflow-hidden">
        <div aria-hidden className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-2" />
        <div className="relative space-y-3">
          <div>
            <div className="text-xs font-extrabold text-indigo tracking-wider">
              <span lang="ja">読解</span> UNIT {unit.unit}
            </div>
            <h1 className="text-3xl font-black leading-tight">{unit.title.en}</h1>
            <div className="text-lg font-bold text-fg-2" lang="ta">
              {unit.title.ta}
            </div>
          </div>
          <div className="flex justify-end">
            <LangSwitch />
          </div>
          <Explain en={unit.intro.en} ta={unit.intro.ta} className="text-fg-2 leading-relaxed" />
          <p className="text-sm text-muted">
            Tap a sentence to see what it means. The translation follows the English / தமிழ் switch.
          </p>
          {passed && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-2 text-green font-extrabold text-sm">
              <Trophy size={16} /> Passed · best {pct(lp!.bestScore)}
            </div>
          )}
        </div>
      </motion.section>

      <div className="space-y-3">
        {unit.items.map((p, i) => {
          const isOpen = open === p.id;
          const read = seen.includes(p.id);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={cx("card overflow-hidden", read && "!border-green")}
            >
              <button
                className="w-full text-left p-4 flex items-center gap-3"
                onClick={() => {
                  setOpen(isOpen ? null : p.id);
                  if (!isOpen) markSeen(key, p.id);
                }}
              >
                <span
                  className={cx(
                    "w-9 h-9 rounded-xl grid place-items-center font-black shrink-0",
                    read ? "bg-green text-white" : "bg-indigo-2 text-indigo",
                  )}
                >
                  {read ? <Check size={18} /> : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-muted" lang="ja">
                    {READING_KIND_LABEL[p.kind].ja} <span lang="en">· {READING_KIND_LABEL[p.kind].en}</span>
                  </div>
                  <div className="font-bold truncate" lang="ja">
                    {rubyPlain(p.title ?? p.paragraphs[0]?.[0]?.ja ?? "")}
                  </div>
                </div>
                <ChevronDown className={cx("text-muted shrink-0 transition", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4">
                      <Passage item={p} study />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <Link href={`/reading/${level}/unit/${unit.unit}/test`}>
        <motion.div whileHover={{ y: -2 }} className="card p-5 flex items-center gap-4 border-l-8 !border-l-gold">
          <div className="w-14 h-14 rounded-2xl bg-gold text-white grid place-items-center shrink-0">
            {passed ? <Check size={28} /> : <GraduationCap size={28} />}
          </div>
          <div className="flex-1">
            <div className="font-black text-lg">Unit test</div>
            <div className="text-sm text-muted">
              {unit.items.length} passages · {qCount} questions · no translations · pass {pct(unit.passMark)}
            </div>
          </div>
          <ArrowRight className="text-muted shrink-0" />
        </motion.div>
      </Link>
    </div>
  );
}
