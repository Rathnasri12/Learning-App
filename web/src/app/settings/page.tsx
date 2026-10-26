"use client";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { cx } from "@/lib/utils";

export default function SettingsPage() {
  const settings = useProgress((s) => s.settings);
  const setSetting = useProgress((s) => s.setSetting);
  const xp = useProgress((s) => s.xp);

  const Toggle = ({ k, label, ta, desc }: { k: "freeNavigation" | "showRomaji" | "showReading" | "autoSpeak"; label: string; ta: string; desc: string }) => (
    <button
      onClick={() => setSetting(k, !settings[k])}
      className="card p-4 w-full flex items-center justify-between gap-4 text-left"
    >
      <div>
        <div className="font-black">
          {label} <span className="text-sm text-fg-2 font-bold" lang="ta">{ta}</span>
        </div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className={cx("w-12 h-7 rounded-full p-1 transition shrink-0", settings[k] ? "bg-green" : "bg-line")}>
        <span className={cx("block w-5 h-5 rounded-full bg-white transition", settings[k] && "translate-x-5")} />
      </span>
    </button>
  );

  return (
    <div className="space-y-4">
      <Link href="/" className="btn btn-ghost !px-3 !py-2 text-sm">
        <ArrowLeft size={16} /> Home
      </Link>
      <h1 className="text-3xl font-black">Settings</h1>
      <Toggle k="freeNavigation" label="Open all lessons" ta="எல்லா பாடங்களும் திறந்தவை" desc="Review mode. Off = lessons unlock only after passing the previous test." />
      <Toggle k="showReading" label="Show kana reading" ta="கனா வாசிப்பு" desc="Reading line under kanji words and sentences." />
      <Toggle k="showRomaji" label="Show romaji" ta="ரோமாஜி" desc="Latin transcription on cards and examples." />
      <Toggle k="autoSpeak" label="Auto-play audio" ta="தானாக ஒலி" desc="Speak each vocabulary card when it appears." />
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="font-black">Total XP</div>
          <div className="text-xs text-muted">Stored in this browser only (for now).</div>
        </div>
        <div className="text-2xl font-black text-indigo">{xp}</div>
      </div>
      <button
        className="btn btn-ghost text-red w-full"
        onClick={() => {
          if (confirm("Reset all progress in this browser?")) {
            localStorage.removeItem("nihongo-tamil-progress-v1");
            location.href = "/";
          }
        }}
      >
        <Trash2 size={16} /> Reset progress
      </button>
    </div>
  );
}
