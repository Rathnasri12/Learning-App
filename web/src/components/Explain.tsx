"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { cx } from "@/lib/utils";

/** Explanation text in simple English, switchable to Tamil. One tap switches every explanation on the site. */
export default function Explain({
  en,
  ta,
  className,
  as = "p",
}: {
  en?: string;
  ta?: string;
  className?: string;
  as?: "p" | "pre";
}) {
  const explainTamil = useProgress((s) => s.settings.explainTamil);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tamil = mounted && explainTamil && !!ta;
  const text = tamil ? ta : (en ?? ta);
  if (!text) return null;
  const Tag = as;
  return (
    <motion.div key={tamil ? "ta" : "en"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Tag lang={tamil ? "ta" : "en"} className={cx(as === "pre" && "whitespace-pre-wrap font-sans", className)}>
        {text}
      </Tag>
    </motion.div>
  );
}

/** Small English / தமிழ் switch, placed in section headers. */
export function LangSwitch({ className }: { className?: string }) {
  const explainTamil = useProgress((s) => s.settings.explainTamil);
  const setSetting = useProgress((s) => s.setSetting);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tamil = mounted && explainTamil;
  return (
    <div
      role="group"
      aria-label="Explanation language"
      className={cx("inline-flex rounded-full bg-bg-2 p-0.5 text-xs font-extrabold normal-case tracking-normal", className)}
    >
      {[
        { v: false, label: "English" },
        { v: true, label: "தமிழ்" },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSetting("explainTamil", o.v);
          }}
          aria-pressed={tamil === o.v}
          lang={o.v ? "ta" : "en"}
          className={cx(
            "px-3 py-1 rounded-full transition",
            tamil === o.v ? "bg-indigo text-white shadow-sm" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
