"use client";
import { motion } from "framer-motion";
import { Play, StepForward, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

/** Start point (first "M x,y") of a KanjiVG path, for the stroke number badge. */
function startPoint(d: string): [number, number] | null {
  const m = d.match(/^\s*[Mm]\s*([-\d.]+)[ ,]+([-\d.]+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * Animated stroke order from KanjiVG paths (109×109 viewBox).
 * "Play" draws every stroke in order; "Step" adds one stroke at a time.
 */
export default function StrokeOrder({
  strokes,
  size = 220,
  autoPlay = true,
  showControls = true,
  className,
}: {
  strokes: string[];
  size?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}) {
  // shown = number of strokes visible; run increments to restart the animation
  const [shown, setShown] = useState(autoPlay ? strokes.length : 0);
  const [run, setRun] = useState(0);
  const [stepping, setStepping] = useState(false);

  useEffect(() => {
    setShown(autoPlay ? strokes.length : 0);
    setStepping(false);
    setRun((r) => r + 1);
  }, [strokes, autoPlay]);

  const perStroke = 0.45;
  const play = () => {
    setStepping(false);
    setShown(strokes.length);
    setRun((r) => r + 1);
  };
  const step = () => {
    if (!stepping) {
      setStepping(true);
      setShown(1);
    } else setShown((s) => (s >= strokes.length ? 1 : s + 1));
    setRun((r) => r + 1);
  };

  return (
    <div className={cx("flex flex-col items-center gap-2", className)}>
      <div
        className="relative rounded-2xl bg-bg-2 border-2 border-line"
        style={{ width: size, height: size }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* practice-paper guides */}
        <svg viewBox="0 0 109 109" className="absolute inset-0 w-full h-full" aria-hidden>
          <line x1="54.5" y1="4" x2="54.5" y2="105" stroke="var(--line)" strokeDasharray="3 3" strokeWidth="0.6" />
          <line x1="4" y1="54.5" x2="105" y2="54.5" stroke="var(--line)" strokeDasharray="3 3" strokeWidth="0.6" />
        </svg>
        <svg viewBox="0 0 109 109" className="absolute inset-0 w-full h-full" role="img" aria-label="Stroke order">
          {strokes.map((d, i) => (
            <path key={`ghost-${i}`} d={d} fill="none" stroke="var(--line)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {strokes.slice(0, shown).map((d, i) => {
            const isLast = stepping && i === shown - 1;
            const delay = stepping ? 0 : i * perStroke;
            return (
              <motion.path
                key={`${run}-${i}`}
                d={d}
                fill="none"
                stroke={isLast ? "var(--sakura)" : "var(--fg)"}
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: stepping && !isLast ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: stepping && !isLast ? 0 : perStroke * 0.9, delay, ease: "easeInOut" }}
              />
            );
          })}
          {stepping &&
            strokes.slice(0, shown).map((d, i) => {
              const p = startPoint(d);
              if (!p) return null;
              return (
                <g key={`n-${run}-${i}`}>
                  <circle cx={p[0]} cy={p[1]} r={4.2} fill={i === shown - 1 ? "var(--sakura)" : "var(--indigo)"} />
                  <text x={p[0]} y={p[1] + 1.9} textAnchor="middle" fontSize="5.5" fontWeight="800" fill="white">
                    {i + 1}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
      {showControls && (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={play}>
            {shown === strokes.length && !stepping ? <RotateCcw size={14} /> : <Play size={14} />} Play
          </button>
          <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={step}>
            <StepForward size={14} /> Step {stepping ? `${shown}/${strokes.length}` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
