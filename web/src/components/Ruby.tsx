"use client";
import { parseRuby } from "@/lib/ruby";

/** Japanese text with optional furigana over marked words ({漢字|かんじ}). */
export default function Ruby({ text, show }: { text: string; show: boolean }) {
  return (
    <>
      {parseRuby(text).map((p, k) =>
        p.ruby && show ? (
          <ruby key={k}>
            {p.base}
            <rt className="text-[0.5em] font-bold text-muted">{p.ruby}</rt>
          </ruby>
        ) : (
          <span key={k}>{p.base}</span>
        ),
      )}
    </>
  );
}
