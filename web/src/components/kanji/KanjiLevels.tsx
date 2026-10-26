"use client";
import { useEffect, useState } from "react";
import type { KanjiUnitMeta } from "@/lib/types";
import { cx } from "@/lib/utils";
import KanjiTrack from "./KanjiTrack";

export type KanjiLevelData = { level: string; units: KanjiUnitMeta[]; ready: number[]; hasExam: boolean };

/** Level tabs over the kanji tracks; the chosen tab is remembered in this browser. */
export default function KanjiLevels({ levels }: { levels: KanjiLevelData[] }) {
  const [level, setLevel] = useState(levels[0]?.level);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kanji-level");
      if (saved && levels.some((l) => l.level === saved)) setLevel(saved);
    } catch {}
  }, [levels]);
  const pick = (l: string) => {
    setLevel(l);
    try {
      localStorage.setItem("kanji-level", l);
    } catch {}
  };
  const data = levels.find((l) => l.level === level) ?? levels[0];
  if (!data) return null;
  return (
    <div className="space-y-4">
      {levels.length > 1 && (
        <div className="inline-flex rounded-full bg-bg-2 p-1 font-black">
          {levels.map((l) => (
            <button
              key={l.level}
              onClick={() => pick(l.level)}
              className={cx("px-5 py-2 rounded-full transition", l.level === data.level ? "bg-indigo text-white shadow" : "text-muted")}
            >
              {l.level.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <KanjiTrack key={data.level} level={data.level} units={data.units} ready={data.ready} hasExam={data.hasExam} />
    </div>
  );
}
