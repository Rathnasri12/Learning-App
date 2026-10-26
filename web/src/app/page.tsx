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

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/n5" className="card p-5 hover:-translate-y-0.5 transition">
          <div className="text-xs font-extrabold text-sakura tracking-wider">LEVEL</div>
          <div className="text-4xl font-black mt-1">N5</div>
          <div className="text-fg-2 mt-2 text-sm" lang="ta">
            25 பாடங்கள் · சொற்கள் + இலக்கணம் + JLPT தேர்வு
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
          <div className="text-fg-2 mt-2 text-sm" lang="ta">
            N5 முடித்த பிறகு திறக்கும்
          </div>
        </div>
        <div className="card p-5 opacity-60">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-gold tracking-wider">LEVEL</div>
            <Lock size={16} className="text-muted" />
          </div>
          <div className="text-4xl font-black mt-1">N3</div>
          <div className="text-fg-2 mt-2 text-sm" lang="ta">
            N4 முடித்த பிறகு திறக்கும்
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { ja: "漢字", ta: "கான்ஜி", en: "Kanji track" },
          { ja: "読解", ta: "வாசிப்பு", en: "Reading track" },
          { ja: "聴解", ta: "கேட்டல்", en: "Listening track" },
        ].map((t) => (
          <div key={t.en} className="card p-5 opacity-60 flex items-center gap-4">
            <div className="text-3xl font-black" lang="ja">
              {t.ja}
            </div>
            <div>
              <div className="font-extrabold">{t.en}</div>
              <div className="text-sm text-fg-2" lang="ta">
                {t.ta} · விரைவில்
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
