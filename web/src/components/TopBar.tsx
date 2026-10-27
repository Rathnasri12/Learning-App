"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookOpenText, Flame, Headphones, House, Languages, PenLine, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

// English label first so beginners can read it; the Japanese word is a small hint underneath.
const NAV = [
  { href: "/", label: "Home", ja: "ホーム", icon: House, match: (p: string) => p === "/" },
  { href: "/kana", label: "Kana", ja: "かな", icon: Languages, match: (p: string) => p.startsWith("/kana") },
  { href: "/n5", label: "Lessons", ja: "レッスン", icon: BookOpen, match: (p: string) => /^\/n[345](\/|$)/.test(p) },
  { href: "/kanji", label: "Kanji", ja: "漢字", icon: PenLine, match: (p: string) => p.startsWith("/kanji") },
  { href: "/reading", label: "Reading", ja: "読解", icon: BookOpenText, match: (p: string) => p.startsWith("/reading") },
  { href: "/listening", label: "Listening", ja: "聴解", icon: Headphones, match: (p: string) => p.startsWith("/listening") },
];

export default function TopBar() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak.count);
  const pathname = usePathname() ?? "/";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-line">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight shrink-0">
            <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-sakura text-white" lang="ja">
              日
            </span>
            <span className="hidden min-[380px]:inline md:hidden">
              Nihongo <span className="text-sakura">Tamil</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label, ja, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                aria-current={match(pathname) ? "page" : undefined}
                className={cx(
                  "flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-bg-2 transition",
                  match(pathname) && "bg-sakura-2 text-sakura",
                )}
              >
                <Icon size={16} />
                <span className="leading-none">
                  <span className="block text-sm font-extrabold">{label}</span>
                  <span className="block text-[10px] font-bold text-muted mt-0.5" lang="ja">
                    {ja}
                  </span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-2 text-sm font-extrabold" title="Day streak">
              <Flame size={16} className="text-gold" />
              <span suppressHydrationWarning>{mounted ? streak : 0}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-2 text-sm font-extrabold" title="Experience points">
              <Sparkles size={16} className="text-indigo" />
              <span suppressHydrationWarning>{mounted ? xp : 0} XP</span>
            </div>
            <Link href="/settings" aria-label="Settings" className="p-2 rounded-full hover:bg-bg-2">
              <SettingsIcon size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Phones: the same links as a bottom tab bar, always visible */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg/95 backdrop-blur border-t border-line"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-6">
          {NAV.map(({ href, label, ja, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx("flex flex-col items-center gap-0.5 py-2", active ? "text-sakura" : "text-muted")}
              >
                <Icon size={22} />
                <span className="text-[10.5px] min-[400px]:text-xs font-extrabold leading-none">{label}</span>
                <span className="text-[9px] font-bold leading-none opacity-80" lang="ja">
                  {ja}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
