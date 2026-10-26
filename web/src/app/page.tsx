import Link from "next/link";
import { LEVELS, availableLevels, getAvailability, getSyllabus } from "@/lib/content";
import HomeHero from "@/components/HomeHero";
import { Lock } from "lucide-react";

export default function Home() {
  const syllabus = getSyllabus("n5");
  const avail = getAvailability("n5");
  const ready = avail.filter((a) => a.hasLesson).length;
  const levels = availableLevels().map((level) => ({
    level,
    count: getSyllabus(level).lessonCount,
    ready: getAvailability(level).filter((a) => a.hasLesson).length,
  }));

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
        {LEVELS.map((lv, i) => {
          const info = levels.find((x) => x.level === lv);
          const color = ["text-sakura", "text-indigo", "text-gold"][i];
          return info ? (
            <Link key={lv} href={`/${lv}`} className="card p-5 hover:-translate-y-0.5 transition">
              <div className={`text-xs font-extrabold tracking-wider ${color}`}>LEVEL</div>
              <div className="text-4xl font-black mt-1">{lv.toUpperCase()}</div>
              <div className="text-fg-2 mt-2 text-sm">{info.count} lessons · vocabulary + grammar + JLPT tests</div>
              <div className="mt-3 text-xs font-bold text-muted">
                {info.ready}/{info.count} lessons ready
              </div>
            </Link>
          ) : (
            <div key={lv} className="card p-5 opacity-60">
              <div className="flex items-center justify-between">
                <div className={`text-xs font-extrabold tracking-wider ${color}`}>LEVEL</div>
                <Lock size={16} className="text-muted" />
              </div>
              <div className="text-4xl font-black mt-1">{lv.toUpperCase()}</div>
              <div className="text-fg-2 mt-2 text-sm">Coming soon</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/kanji" className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition">
          <div className="text-3xl font-black" lang="ja">
            漢字
          </div>
          <div>
            <div className="font-extrabold">Kanji track</div>
            <div className="text-sm text-fg-2">Stroke order, memory stories and JLPT kanji tests</div>
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
