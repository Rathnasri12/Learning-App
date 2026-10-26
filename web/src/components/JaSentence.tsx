"use client";
import { cx } from "@/lib/utils";

/**
 * Renders a Japanese sentence with JLPT conventions:
 * - ＿target＿ is shown underlined (kanji reading / orthography items)
 * - （　　） or ＿＿ blanks are shown as a highlighted slot, optionally filled with `fill`
 */
export default function JaSentence({
  text,
  fill,
  className,
  size = "text-2xl",
}: {
  text: string;
  fill?: string | null;
  className?: string;
  size?: string;
}) {
  const parts: React.ReactNode[] = [];
  const re = /＿([^＿]+)＿|（\s*）|（　+）|＿＿|\(\s*\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[1]) {
      parts.push(
        <span key={k++} className="underline decoration-sakura decoration-4 underline-offset-4 font-bold">
          {m[1]}
        </span>,
      );
    } else {
      parts.push(
        <span
          key={k++}
          className={cx(
            "inline-flex items-center justify-center min-w-[3.2em] px-2 mx-0.5 rounded-lg border-2 border-dashed align-baseline",
            fill ? "border-indigo bg-indigo-2 text-indigo font-bold" : "border-muted text-transparent",
          )}
        >
          {fill ?? "＿＿"}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return (
    <p lang="ja" className={cx(size, "leading-relaxed font-medium", className)}>
      {parts}
    </p>
  );
}
