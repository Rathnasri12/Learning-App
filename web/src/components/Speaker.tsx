"use client";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { speak } from "@/lib/tts";
import { cx } from "@/lib/utils";

export default function Speaker({
  text,
  size = 20,
  className,
  rate,
}: {
  text: string;
  size?: number;
  className?: string;
  rate?: number;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, { rate });
      }}
      aria-label="Play audio"
      className={cx(
        "inline-grid place-items-center rounded-full bg-indigo-2 text-indigo hover:brightness-95",
        className,
      )}
      style={{ width: size * 2, height: size * 2 }}
    >
      <Volume2 size={size} />
    </motion.button>
  );
}
