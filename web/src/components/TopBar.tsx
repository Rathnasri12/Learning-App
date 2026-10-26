"use client";
import Link from "next/link";
import { Flame, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";

export default function TopBar() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak.count);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-line">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
          <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-sakura text-white" lang="ja">
            日
          </span>
          <span>
            Nihongo <span className="text-sakura">Tamil</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold-2 text-sm font-extrabold">
            <Flame size={16} className="text-gold" />
            <span suppressHydrationWarning>{mounted ? streak : 0}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-2 text-sm font-extrabold">
            <Sparkles size={16} className="text-indigo" />
            <span suppressHydrationWarning>{mounted ? xp : 0} XP</span>
          </div>
          <Link href="/settings" aria-label="Settings" className="p-2 rounded-full hover:bg-bg-2">
            <SettingsIcon size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
