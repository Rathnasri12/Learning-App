"use client";
import { motion } from "framer-motion";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ListeningItem, Voice } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { rubySpoken } from "@/lib/ruby";
import { hasJapaneseVoice, playScript, type Segment } from "@/lib/tts";
import { cx } from "@/lib/utils";
import Ruby from "../Ruby";
import type { McqAnswer } from "./types";

const RATE: Record<string, number> = { n5: 0.85, n4: 0.92, n3: 1 };
const NUM = ["１", "２", "３", "４"];

/** Options are printed for these kinds; for the others they are only heard, as in the real exam. */
export const shownOptions = (it: ListeningItem) => it.kind === "task" || it.kind === "point";

const INSTRUCTION: Record<ListeningItem["kind"], string> = {
  task: "はなしを きいて、しつもんに こたえて ください。",
  point: "しつもんを きいて、せんたくしを よんで ください。それから はなしを きいて ください。",
  gist: "はなしを きいて、いちばん いい こたえを えらんで ください。せんたくしは きくだけです。",
  utterance: "えを みながら しつもんを きいて ください。➡（やじるし）の 人は 何と いいますか。",
  response: "ぶんを きいて、いちばん いい へんじを えらんで ください。",
};

export function listeningSegments(it: ListeningItem, perm: number[]): Segment[] {
  const segs: Segment[] = [];
  if (it.intro) segs.push({ text: rubySpoken(it.intro), voice: "N", pause: 900 });
  it.lines.forEach((l, k) => segs.push({ text: rubySpoken(l.t), voice: l.s, pause: k === it.lines.length - 1 ? 900 : 350 }));
  if (it.question) segs.push({ text: rubySpoken(it.question), voice: "N", pause: 900 });
  if (!shownOptions(it)) {
    const last = it.lines[it.lines.length - 1]?.s;
    const v: Voice = it.optionVoice ?? (last === "M" ? "F" : last === "F" ? "M" : "N");
    perm.forEach((orig, k) => segs.push({ text: `${k + 1}、${rubySpoken(it.options[orig])}`, voice: v, pause: 700 }));
  }
  return segs;
}

export default function ListeningView({
  item,
  perm,
  value,
  onChange,
  reveal,
  level,
}: {
  item: ListeningItem;
  perm: number[];
  value: McqAnswer;
  onChange: (a: McqAnswer) => void;
  reveal: boolean;
  level: string;
}) {
  const furigana = useProgress((s) => s.settings.showReading);
  const segments = useMemo(() => listeningSegments(item, perm), [item, perm]);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [noVoice, setNoVoice] = useState(false);
  const stop = useRef<() => void>(() => {});
  const rate = RATE[level] ?? 0.92;

  const play = () => {
    stop.current();
    setPlaying(true);
    stop.current = playScript(segments, {
      rate,
      onDone: () => {
        setPlaying(false);
        setPlays((p) => p + 1);
      },
    });
  };
  const halt = () => {
    stop.current();
    setPlaying(false);
  };

  // Play as soon as the item opens (not in the review list), and stop when it closes.
  useEffect(() => {
    if (!reveal) play();
    const t = setTimeout(() => setNoVoice(!hasJapaneseVoice()), 1200);
    return () => {
      clearTimeout(t);
      stop.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const shown = shownOptions(item) || reveal;

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted font-bold" lang="ja">
        {INSTRUCTION[item.kind]}
      </div>

      {noVoice && (
        <div className="rounded-xl bg-gold-2 p-3 text-sm font-bold">
          No Japanese voice found on this device. On Android install “Google Text-to-speech” with Japanese; on Windows add the
          Japanese language pack (Settings → Time & language → Speech).
        </div>
      )}

      <div className="card p-5 flex flex-col items-center gap-3 text-center">
        {item.kind === "utterance" && item.scene ? (
          <div className="text-6xl leading-none tracking-widest" aria-label="Picture">
            {item.scene}
          </div>
        ) : (
          <Headphones size={40} className="text-indigo" />
        )}
        {shownOptions(item) && item.question && (
          <p className="text-lg font-bold" lang="ja">
            <Ruby text={item.question} show={furigana} />
          </p>
        )}
        <div className="flex gap-2">
          {playing ? (
            <button className="btn btn-ghost" onClick={halt}>
              <Pause size={18} /> Stop
            </button>
          ) : (
            <button className="btn btn-indigo" onClick={play}>
              {plays > 0 ? <RotateCcw size={18} /> : <Play size={18} />} {plays > 0 ? "Play again" : "Play"}
            </button>
          )}
        </div>
        <div className="text-xs text-muted font-bold">
          {playing ? "Listening…" : plays > 0 ? `Played ${plays}×  ·  in the real JLPT you hear it once` : "Tap play to listen"}
        </div>
      </div>

      <div className={cx("grid gap-2", !shown && "grid-cols-2 sm:grid-cols-4")}>
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
                !shown && "justify-center",
                !reveal && selected && "selected",
                reveal && correct && "correct",
                reveal && selected && !correct && "wrong",
              )}
            >
              <span className={cx("grid place-items-center rounded-full bg-bg-2 font-black shrink-0", shown ? "w-7 h-7 text-xs" : "w-10 h-10 text-lg")}>
                {k + 1}
              </span>
              {shown && (
                <span lang="ja">
                  <Ruby text={item.options[orig]} show={furigana} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {reveal && (
        <div className="rounded-2xl bg-bg-2 p-4 space-y-2" lang="ja">
          <div className="text-xs font-extrabold text-muted" lang="en">
            TRANSCRIPT <span lang="ja">（スクリプト）</span>
          </div>
          {item.intro && (
            <p className="text-fg-2">
              <Ruby text={item.intro} show={furigana} />
            </p>
          )}
          {item.lines.map((l, k) => (
            <p key={k} className="flex gap-2">
              <span
                className={cx(
                  "shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-black text-white",
                  l.s === "M" ? "bg-indigo" : l.s === "F" ? "bg-sakura" : "bg-muted",
                )}
              >
                {l.s === "M" ? "男" : l.s === "F" ? "女" : "＊"}
              </span>
              <span className="leading-relaxed">
                <Ruby text={l.t} show={furigana} />
              </span>
            </p>
          ))}
          {item.question && (
            <p className="text-fg-2">
              <Ruby text={item.question} show={furigana} />
            </p>
          )}
          {!shownOptions(item) && (
            <ol className="pt-1 space-y-0.5">
              {perm.map((orig, k) => (
                <li key={orig} className={cx(orig === item.answer && "font-black text-green")}>
                  {NUM[k]}　<Ruby text={item.options[orig]} show={furigana} />
                </li>
              ))}
            </ol>
          )}
          <button
            className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo pt-1"
            lang="en"
            onClick={play}
          >
            <Volume2 size={14} /> Listen again
          </button>
        </div>
      )}
    </div>
  );
}
