"use client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import type { Vocab } from "@/lib/types";
import { shuffle, cx, primary } from "@/lib/utils";
import { speak } from "@/lib/tts";

type Tile = { key: string; vocabId: string; side: "ja" | "ta"; text: string };

export default function MatchGame({ vocab, onDone, pairs = 6 }: { vocab: Vocab[]; onDone: () => void; pairs?: number }) {
  const [round, setRound] = useState(0);
  const rounds = useMemo(() => {
    const v = shuffle(vocab);
    const out: Vocab[][] = [];
    for (let i = 0; i < v.length; i += pairs) out.push(v.slice(i, i + pairs));
    return out.filter((r) => r.length >= 3).slice(0, 3);
  }, [vocab, pairs]);
  const current = rounds[round] ?? [];

  const tiles = useMemo<Tile[]>(() => {
    const t: Tile[] = [];
    for (const v of current) {
      t.push({ key: v.id + "-ja", vocabId: v.id, side: "ja", text: primary(v.expression) });
      t.push({ key: v.id + "-ta", vocabId: v.id, side: "ta", text: v.ta });
    }
    return shuffle(t);
  }, [current]);

  const [picked, setPicked] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [start] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(t);
  }, [start]);

  useEffect(() => {
    if (current.length && matched.size === current.length) {
      const t = setTimeout(() => {
        if (round + 1 < rounds.length) {
          setRound((r) => r + 1);
          setMatched(new Set());
          setPicked(null);
        } else {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
          setTimeout(onDone, 900);
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [matched, current.length, round, rounds.length, onDone]);

  const tap = (tile: Tile) => {
    if (matched.has(tile.vocabId) || wrong.length) return;
    if (tile.side === "ja") speak(tile.text);
    if (!picked) {
      setPicked(tile);
      return;
    }
    if (picked.key === tile.key) {
      setPicked(null);
      return;
    }
    if (picked.vocabId === tile.vocabId && picked.side !== tile.side) {
      setMatched((m) => new Set([...m, tile.vocabId]));
      setPicked(null);
    } else {
      setWrong([picked.key, tile.key]);
      setMistakes((m) => m + 1);
      setTimeout(() => {
        setWrong([]);
        setPicked(null);
      }, 450);
    }
  };

  if (!current.length) {
    onDone();
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-extrabold text-muted">
        <span>
          Match · round {round + 1}/{rounds.length}
        </span>
        <span className="tabular-nums">
          ⏱ {elapsed}s · ✕ {mistakes}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <AnimatePresence>
          {tiles.map((t) => {
            const done = matched.has(t.vocabId);
            const sel = picked?.key === t.key;
            const bad = wrong.includes(t.key);
            return (
              <motion.button
                key={t.key}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: done ? 0.25 : 1,
                  scale: done ? 0.92 : sel ? 1.05 : 1,
                  x: bad ? [0, -6, 6, -4, 4, 0] : 0,
                }}
                transition={{ duration: 0.25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tap(t)}
                disabled={done}
                lang={t.side}
                className={cx(
                  "card min-h-[84px] p-3 grid place-items-center text-center font-bold leading-tight",
                  t.side === "ja" ? "text-2xl" : "text-base",
                  sel && "!border-indigo bg-indigo-2",
                  bad && "!border-red bg-red-2",
                  done && "!border-green bg-green-2",
                )}
              >
                {t.text}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-muted font-bold">Match each Japanese word with its Tamil meaning</p>
    </div>
  );
}
