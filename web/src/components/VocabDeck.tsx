"use client";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, Check, RotateCcw, X, Eye, EyeOff, Shuffle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lang3, Vocab } from "@/lib/types";
import { lessonKey, useProgress } from "@/lib/progress";
import { speak } from "@/lib/tts";
import { cx, shuffle, primary, variants } from "@/lib/utils";
import Speaker from "./Speaker";
import MatchGame from "./MatchGame";

type Phase = "cards" | "summary" | "match";

export default function VocabDeck({
  level,
  n,
  title,
  vocab,
  bonus = false,
  bonusCount = 0,
}: {
  level: string;
  n: number;
  title: Lang3;
  vocab: Vocab[];
  bonus?: boolean; // this deck is the optional bonus words
  bonusCount?: number; // main deck: how many bonus words exist, to offer them at the end
}) {
  const key = lessonKey(bonus ? `${level}-bonus` : level, n);
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);
  const markSeen = useProgress((s) => s.markVocabSeen);
  const markKnown = useProgress((s) => s.markVocabKnown);
  const addXp = useProgress((s) => s.addXp);
  const touchStreak = useProgress((s) => s.touchStreak);

  const [order, setOrder] = useState<Vocab[]>(vocab);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState<Phase>("cards");
  const [known, setKnown] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);

  const card = order[idx];
  const total = order.length;

  useEffect(() => {
    if (!card || phase !== "cards") return;
    markSeen(key, card.id);
    if (settings.autoSpeak) {
      const t = setTimeout(() => speak(primary(card.expression)), 250);
      return () => clearTimeout(t);
    }
  }, [card, phase, key, markSeen, settings.autoSpeak]);

  const answer = useCallback(
    (isKnown: boolean) => {
      if (!card) return;
      markKnown(key, card.id, isKnown);
      if (isKnown) setKnown((k) => [...k, card.id]);
      else setLearning((l) => [...l, card.id]);
      addXp(isKnown ? 2 : 1);
      touchStreak();
      setFlipped(false);
      if (idx + 1 >= total) setPhase("summary");
      else setIdx((i) => i + 1);
    },
    [card, idx, total, key, markKnown, addXp, touchStreak],
  );

  const restart = (subset?: Vocab[]) => {
    setOrder(subset && subset.length ? subset : vocab);
    setIdx(0);
    setKnown([]);
    setLearning([]);
    setFlipped(false);
    setPhase("cards");
  };

  const learningWords = useMemo(() => vocab.filter((v) => learning.includes(v.id)), [vocab, learning]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/${level}/lesson/${n}`} className="btn btn-ghost !px-3 !py-2 text-sm">
          <ArrowLeft size={16} /> Lesson {n}
        </Link>
        <div className="flex items-center gap-1">
          <button
            className={cx("btn btn-ghost !px-3 !py-2 text-xs", !settings.showReading && "opacity-50")}
            onClick={() => setSetting("showReading", !settings.showReading)}
            title="Toggle kana reading"
          >
            {settings.showReading ? <Eye size={14} /> : <EyeOff size={14} />} かな
          </button>
          <button
            className={cx("btn btn-ghost !px-3 !py-2 text-xs", !settings.showRomaji && "opacity-50")}
            onClick={() => setSetting("showRomaji", !settings.showRomaji)}
            title="Toggle romaji"
          >
            {settings.showRomaji ? <Eye size={14} /> : <EyeOff size={14} />} abc
          </button>
          <button
            className="btn btn-ghost !px-3 !py-2 text-xs"
            onClick={() => restart(shuffle(order))}
            title="Shuffle"
          >
            <Shuffle size={14} />
          </button>
        </div>
      </div>

      {phase === "cards" && card && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
              <motion.div
                className="h-full bg-sakura"
                animate={{ width: `${(idx / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <div className="text-sm font-extrabold text-muted tabular-nums">
              {idx + 1}/{total}
            </div>
          </div>

          <div className="relative h-[430px] sm:h-[460px]">
            {order[idx + 1] && (
              <div className="absolute inset-x-6 top-4 bottom-0 card opacity-60 scale-[0.96]" aria-hidden />
            )}
            <AnimatePresence mode="popLayout">
              <SwipeCard
                key={card.id}
                card={card}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onSwipe={(dir) => answer(dir === "right")}
                showReading={settings.showReading}
                showRomaji={settings.showRomaji}
              />
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.96 }} className="btn bg-red-2 text-red py-4" onClick={() => answer(false)}>
              <X size={20} /> Still learning
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} className="btn bg-green-2 text-green py-4" onClick={() => answer(true)}>
              <Check size={20} /> Got it
            </motion.button>
          </div>
          <p className="text-center text-xs text-muted font-bold">
            Tap the card to flip · swipe right = got it · swipe left = still learning
          </p>
        </>
      )}

      {phase === "summary" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 text-center space-y-4">
          <div className="text-5xl">🎴</div>
          <h2 className="text-2xl font-black">
            {bonus ? "Bonus words done" : "Deck done"} · <span lang="ja">{title.ja}</span>
          </h2>
          <div className="flex justify-center gap-6">
            <div>
              <div className="text-3xl font-black text-green">{known.length}</div>
              <div className="text-xs font-bold text-muted">got it</div>
            </div>
            <div>
              <div className="text-3xl font-black text-red">{learning.length}</div>
              <div className="text-xs font-bold text-muted">still learning</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button className="btn btn-primary" onClick={() => setPhase("match")}>
              Play match game
            </button>
            {learningWords.length > 0 && (
              <button className="btn btn-ghost" onClick={() => restart(learningWords)}>
                <RotateCcw size={16} /> Review {learningWords.length} words
              </button>
            )}
            <Link href={`/${level}/lesson/${n}/grammar`} className="btn btn-indigo">
              Go to grammar
            </Link>
            {!bonus && bonusCount > 0 && (
              <Link href={`/${level}/lesson/${n}/bonus`} className="btn btn-ghost">
                + {bonusCount} bonus words
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {phase === "match" && (
        <MatchGame
          vocab={vocab}
          onDone={() => {
            addXp(10);
            setPhase("summary");
          }}
        />
      )}
    </div>
  );
}

function SwipeCard({
  card,
  flipped,
  onFlip,
  onSwipe,
  showReading,
  showRomaji,
}: {
  card: Vocab;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (dir: "left" | "right") => void;
  showReading: boolean;
  showRomaji: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const okOpacity = useTransform(x, [40, 140], [0, 1]);
  const noOpacity = useTransform(x, [-40, -140], [0, 1]);
  const ex = card.examples?.[0];

  return (
    <motion.div
      className="absolute inset-0 flip-scene cursor-pointer select-none"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("right");
        else if (info.offset.x < -120) onSwipe("left");
      }}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: x.get() >= 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
      onClick={onFlip}
    >
      <motion.div
        className="flip-card relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* FRONT */}
        <div className="flip-face absolute inset-0 card p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-bg-2 text-muted">{card.pos}</span>
            <Speaker text={primary(card.expression)} />
          </div>
          <div className="flex-1 grid place-items-center text-center">
            <div>
              <div className="text-6xl sm:text-7xl font-black" lang="ja">
                {primary(card.expression)}
              </div>
              {variants(card.expression).length > 1 && (
                <div className="text-base mt-2 text-muted font-bold" lang="ja">
                  also: {variants(card.expression).slice(1).join("・")}
                </div>
              )}
              {showReading && primary(card.reading) !== primary(card.expression) && (
                <div className="text-2xl mt-3 text-fg-2" lang="ja">
                  {primary(card.reading)}
                </div>
              )}
              {showRomaji && <div className="text-lg mt-1 text-muted font-bold">{variants(card.romaji).join(" / ")}</div>}
            </div>
          </div>
          <div className="text-center text-xs text-muted font-bold">tap to reveal</div>
          <motion.div style={{ opacity: okOpacity }} className="absolute top-6 left-6 px-3 py-1 rounded-lg border-4 border-green text-green font-black -rotate-12">
            GOT IT
          </motion.div>
          <motion.div style={{ opacity: noOpacity }} className="absolute top-6 right-6 px-3 py-1 rounded-lg border-4 border-red text-red font-black rotate-12">
            LEARNING
          </motion.div>
        </div>

        {/* BACK */}
        <div className="flip-face absolute inset-0 card p-6 flex flex-col" style={{ transform: "rotateY(180deg)" }}>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black" lang="ja">
              {variants(card.expression).join("・")}
              {primary(card.reading) !== primary(card.expression) && (
                <span className="text-base text-muted font-bold ml-2">{variants(card.reading).join("・")}</span>
              )}
            </div>
            <Speaker text={primary(card.expression)} />
          </div>
          <div className="mt-1 text-muted font-bold">{variants(card.romaji).join(" / ")}</div>
          <div className="mt-4 text-4xl font-extrabold text-sakura leading-snug" lang="ta">
            {card.ta}
          </div>
          <div className="text-xl text-fg-2 font-bold">{card.en}</div>
          {ex && (
            <div className="mt-auto pt-4 border-t border-line" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-2">
                <Speaker text={ex.ja} size={16} />
                <div className="min-w-0">
                  <div className="text-lg font-medium" lang="ja">
                    {ex.ja}
                  </div>
                  {showReading && (
                    <div className="text-sm text-muted" lang="ja">
                      {ex.reading}
                    </div>
                  )}
                  {showRomaji && <div className="text-xs text-muted">{ex.romaji}</div>}
                  <div className="text-sm mt-1 text-fg-2" lang="ta">
                    {ex.ta}
                  </div>
                  <div className="text-xs text-muted">{ex.en}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
