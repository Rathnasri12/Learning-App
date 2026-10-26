"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { SentenceOrderItem } from "@/lib/types";
import { cx } from "@/lib/utils";
import type { OrderAnswer } from "./types";

export default function SentenceOrderView({
  item,
  perm,
  value,
  onChange,
  reveal,
}: {
  item: SentenceOrderItem;
  perm: number[]; // shuffled display order of chunk indices
  value: OrderAnswer;
  onChange: (a: OrderAnswer) => void;
  reveal: boolean;
}) {
  const placed = value.placed;
  const pool = perm.filter((c) => !placed.includes(c));
  const correct = placed.length === item.chunks.length && placed.every((c, k) => c === k);

  const place = (c: number) => {
    if (reveal) return;
    onChange({ kind: "order", placed: [...placed, c] });
  };
  const unplace = (c: number) => {
    if (reveal) return;
    onChange({ kind: "order", placed: placed.filter((x) => x !== c) });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted font-bold" lang="ja">
        ★に 入る ものは どれですか。ことばを ただしい じゅんばんに ならべてください。
      </div>
      <div
        className={cx(
          "card p-5 flex flex-wrap items-center gap-2 text-2xl",
          reveal && (correct ? "!border-green bg-green-2" : "!border-red bg-red-2"),
        )}
        lang="ja"
      >
        {item.before && <span>{item.before}</span>}
        {item.chunks.map((_, slot) => {
          const c = placed[slot];
          const filled = c !== undefined;
          return (
            <motion.button
              layout
              key={slot}
              className={cx("slot px-2", slot === item.star && "star", filled && "border-solid bg-card")}
              onClick={() => filled && unplace(c)}
              disabled={!filled || reveal}
            >
              {filled ? (
                <span className="font-bold">{item.chunks[c]}</span>
              ) : slot === item.star ? (
                <Star size={18} className="text-gold fill-gold" />
              ) : (
                <span className="text-muted text-base">＿</span>
              )}
            </motion.button>
          );
        })}
        {item.after && <span>{item.after}</span>}
      </div>

      <div className="flex flex-wrap gap-2 justify-center min-h-[52px]">
        {pool.map((c) => (
          <motion.button layout key={c} className="chip" lang="ja" onClick={() => place(c)} disabled={reveal}>
            {item.chunks[c]}
          </motion.button>
        ))}
      </div>

      {reveal && (
        <div className="card p-4 text-lg" lang="ja">
          <span className="text-xs font-extrabold text-muted mr-2">ANSWER</span>
          {item.before}
          {item.chunks.map((ch, k) => (
            <span key={k} className={cx("mx-0.5 px-1 rounded", k === item.star && "bg-gold-2 font-black")}>
              {ch}
            </span>
          ))}
          {item.after}
        </div>
      )}
    </div>
  );
}
