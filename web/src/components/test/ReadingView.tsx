"use client";
import { motion } from "framer-motion";
import type { ReadingItem } from "@/lib/types";
import { cx } from "@/lib/utils";
import Explain from "../Explain";
import Passage from "../reading/Passage";
import type { ClozeAnswer } from "./types";

/** JLPT 読解: the passage, then each of its questions with four options. After checking, the passage gains translations. */
export default function ReadingView({
  item,
  perms,
  value,
  onChange,
  reveal,
}: {
  item: ReadingItem;
  perms: number[][]; // per question display order
  value: ClozeAnswer;
  onChange: (a: ClozeAnswer) => void;
  reveal: boolean;
}) {
  const pick = (q: number, orig: number) => {
    if (reveal) return;
    const choices = value.choices.slice();
    choices[q] = orig;
    onChange({ kind: "cloze", choices });
  };

  return (
    <div className="space-y-5">
      <div className="text-sm text-muted font-bold" lang="ja">
        つぎの ぶんしょうを よんで、しつもんに こたえて ください。こたえは １・２・３・４から いちばん いい ものを 一つ えらんで ください。
      </div>
      <Passage item={item} study={reveal} />
      {item.questions.map((q, qi) => {
        const perm = perms[qi] ?? q.options.map((_, k) => k);
        return (
          <div key={qi} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-indigo text-white text-xs font-black shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <p className="text-lg font-bold" lang="ja">
                {q.q}
              </p>
            </div>
            <div className="grid gap-2">
              {perm.map((orig, k) => {
                const selected = value.choices[qi] === orig;
                const correct = orig === q.answer;
                return (
                  <motion.button
                    key={orig}
                    whileTap={!reveal ? { scale: 0.985 } : undefined}
                    disabled={reveal}
                    onClick={() => pick(qi, orig)}
                    className={cx(
                      "option flex items-center gap-3 !text-base",
                      !reveal && selected && "selected",
                      reveal && correct && "correct",
                      reveal && selected && !correct && "wrong",
                    )}
                  >
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-bg-2 text-xs font-black shrink-0">{k + 1}</span>
                    <span lang="ja">{q.options[orig]}</span>
                  </motion.button>
                );
              })}
            </div>
            {reveal && (
              <div className="rounded-xl bg-bg-2 p-3 text-sm">
                <Explain en={q.explanation_en} ta={q.explanation_ta} className="leading-relaxed" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
