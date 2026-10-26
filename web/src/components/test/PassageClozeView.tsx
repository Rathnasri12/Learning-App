"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import type { PassageClozeItem } from "@/lib/types";
import { cx } from "@/lib/utils";
import Speaker from "../Speaker";
import type { ClozeAnswer } from "./types";

export default function PassageClozeView({
  item,
  perms,
  value,
  onChange,
  reveal,
}: {
  item: PassageClozeItem;
  perms: number[][]; // per blank display order
  value: ClozeAnswer;
  onChange: (a: ClozeAnswer) => void;
  reveal: boolean;
}) {
  const [active, setActive] = useState(0);
  const parts = item.passage.split(/(［\d+］)/);
  const blank = item.blanks[active];
  const perm = perms[active] ?? blank.options.map((_, k) => k);

  const pick = (orig: number) => {
    if (reveal) return;
    const choices = value.choices.slice();
    choices[active] = orig;
    onChange({ kind: "cloze", choices });
    const next = choices.findIndex((c) => c === null);
    if (next >= 0) setActive(next);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted font-bold" lang="ja">
        ぶんしょうを よんで、［1］から［{item.blanks.length}］に なにを いれますか。
      </div>
      <div className="card p-5 flex items-start gap-3">
        <Speaker text={item.passage.replace(/［\d+］/g, "")} size={16} className="mt-1 shrink-0" />
        <p className="text-xl leading-loose" lang="ja">
          {parts.map((p, k) => {
            const m = p.match(/［(\d+)］/);
            if (!m) return <span key={k}>{p}</span>;
            const b = Number(m[1]) - 1;
            const c = value.choices[b];
            const isCorrect = c === item.blanks[b].answer;
            return (
              <button
                key={k}
                onClick={() => setActive(b)}
                className={cx(
                  "inline-flex items-center mx-1 px-2 rounded-lg border-2 align-baseline font-bold transition",
                  active === b && !reveal ? "border-indigo bg-indigo-2" : "border-dashed border-muted",
                  reveal && (isCorrect ? "!border-green bg-green-2" : "!border-red bg-red-2"),
                )}
              >
                <span className="text-xs text-muted mr-1">{b + 1}</span>
                {c !== null ? item.blanks[b].options[c] : "＿＿"}
              </button>
            );
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {item.blanks.map((_, k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={cx(
              "w-8 h-8 rounded-full text-sm font-black grid place-items-center",
              active === k ? "bg-indigo text-white" : value.choices[k] !== null ? "bg-indigo-2 text-indigo" : "bg-line text-muted",
            )}
          >
            {k + 1}
          </button>
        ))}
        <span className="text-xs text-muted font-bold ml-2">Blank {active + 1}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {perm.map((orig, k) => {
          const selected = value.choices[active] === orig;
          const correct = orig === blank.answer;
          return (
            <motion.button
              key={orig}
              whileTap={!reveal ? { scale: 0.985 } : undefined}
              disabled={reveal}
              onClick={() => pick(orig)}
              className={cx(
                "option flex items-center gap-3",
                !reveal && selected && "selected",
                reveal && correct && "correct",
                reveal && selected && !correct && "wrong",
              )}
            >
              <span className="grid place-items-center w-7 h-7 rounded-full bg-bg-2 text-xs font-black shrink-0">{k + 1}</span>
              <span lang="ja">{blank.options[orig]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
