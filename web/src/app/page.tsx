import Link from "next/link";
import { getAvailability, getSyllabus } from "@/lib/content";
import HomeHero from "@/components/HomeHero";
import { Lock } from "lucide-react";

export default function Home() {
  const syllabus = getSyllabus("n5");
  const avail = getAvailability("n5");
  const ready = avail.filter((a) => a.hasLesson).length;

  return (
    <div className="space-y-6">
      <HomeHero lessonCount={syllabus.lessonCount} readyCount={ready} />

      <Link href="/kana" className="card p-5 flex items-center gap-4 border-l-8 !border-l-sakura hover:-translate-y-0.5 transition">
        <div className="text-4xl font-black" lang="ja">
          あア
        </div>
        <div className="flex-1">
          <div className="text-xs font-extrabold text-sakura tracking-wider">START HERE</div>
          <div className="font-black text-lg">Hiragana & Katakana</div>
          <div className="text-sm text-fg-2">Learn both alphabets with stroke order, Tamil sounds, memory stories and tests</div>
        </div>
      </Link>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/n5" className="card p-5 hover:-translate-y-0.5 transition">
          <div className="text-xs font-extrabold text-sakura tracking-wider">LEVEL</div>
          <div className="text-4xl font-black mt-1">N5</div>
          <div className="text-fg-2 mt-2 text-sm">
            25 lessons · vocabulary + grammar + JLPT tests
          </div>
          <div className="mt-3 text-xs font-bold text-muted">
            {ready}/{syllabus.lessonCount} lessons ready
          </div>
        </Link>
        <div className="card p-5 opacity-60">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-indigo tracking-wider">LEVEL</div>
            <Lock size={16} className="text-muted" />
          </div>
          <div className="text-4xl font-black mt-1">N4</div>
          <div className="text-fg-2 mt-2 text-sm">
            Unlocks after N5
          </div>
        </div>
        <div className="card p-5 opacity-60">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-gold tracking-wider">LEVEL</div>
            <Lock size={16} className="text-muted" />
          </div>
          <div className="text-4xl font-black mt-1">N3</div>
          <div className="text-fg-2 mt-2 text-sm">
            Unlocks after N4
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/kanji" className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition">
          <div className="text-3xl font-black" lang="ja">
            漢字
          </div>
          <div>
            <div className="font-extrabold">Kanji track</div>
            <div className="text-sm text-fg-2">N5 · 79 kanji · stroke order + memory stories</div>
          </div>
        </Link>
        {[
          { ja: "読解", en: "Reading track" },
          { ja: "聴解", en: "Listening track" },
        ].map((t) => (
          <div key={t.en} className="card p-5 opacity-60 flex items-center gap-4">
            <div className="text-3xl font-black" lang="ja">
              {t.ja}
            </div>
            <div>
              <div className="font-extrabold">{t.en}</div>
              <div className="text-sm text-fg-2">Coming soon</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
