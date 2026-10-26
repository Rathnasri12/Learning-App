"use client";
import { motion } from "framer-motion";
import type { McqItem } from "@/lib/types";
import { cx } from "@/lib/utils";
import JaSentence from "../JaSentence";
import Speaker from "../Speaker";
import type { McqAnswer } from "./types";

export default function McqView({
  item,
  perm,
  value,
  onChange,
  reveal,
}: {
  item: McqItem;
  perm: number[]; // display order → original index
  value: McqAnswer;
  onChange: (a: McqAnswer) => void;
  reveal: boolean;
}) {
  const fillTypes = ["vocab_context", "grammar_form"];
  const fill = fillTypes.includes(item.type) && value.choice !== null ? item.options[value.choice] : null;
  const instruction: Record<string, string> = {
    kanji_reading: "＿＿の ことばは ひらがなで どう かきますか。",
    orthography: "＿＿の ことばは どう かきますか。",
    vocab_context: "（　　）に なにを いれますか。",
    paraphrase: "＿＿の ぶんと だいたい おなじ いみの ぶんが あります。",
    grammar_form: "（　　）に なにを いれますか。",
    usage: "つぎの ことばの つかいかたで いちばん いい ものを えらびなさい。",
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted font-bold" lang="ja">
        {instruction[item.type]}
      </div>
      <div className="card p-5 flex items-start gap-3">
        <Speaker text={item.sentence} size={16} className="mt-1 shrink-0" />
        <JaSentence text={item.sentence} fill={fill} />
      </div>
      <div className="grid gap-2">
        {perm.map((orig, k) => {
          const selected = value.choice === orig;
          const correct = orig === item.answer;
          return (
            <motion.button
              key={orig}
              whileTap={!reveal ? { scale: 0.985 } : undefined}
              disabled={reveal}
              onClick={() => onChange({ kind: "mcq", choice: orig })}
              className={cx(
                "option flex items-center gap-3",
                !reveal && selected && "selected",
                reveal && correct && "correct",
                reveal && selected && !correct && "wrong",
              )}
            >
              <span className="grid place-items-center w-7 h-7 rounded-full bg-bg-2 text-xs font-black shrink-0">
                {k + 1}
              </span>
              <span lang="ja">{item.options[orig]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
