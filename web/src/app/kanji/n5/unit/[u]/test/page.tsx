import TestRunner from "@/components/test/TestRunner";
import { kanjiKey } from "@/lib/utils";
import { loadUnit, unitParams } from "../params";

export const generateStaticParams = unitParams;

export default async function KanjiTestPage({ params }: { params: Promise<{ u: string }> }) {
  const { unit, total } = await loadUnit(params);
  const n = unit.unit;
  return (
    <TestRunner
      level="n5"
      n={n}
      total={total}
      title={{ ja: unit.kanji.map((k) => k.kanji).join(""), en: unit.title.en, ta: unit.title.ta }}
      test={unit.test}
      nav={{
        key: kanjiKey("n5", n),
        back: { href: `/kanji/n5/unit/${n}`, label: `Unit ${n}` },
        next: n < total ? { href: `/kanji/n5/unit/${n + 1}`, label: `Unit ${n + 1}` } : { href: "/kanji", label: "Kanji exam" },
        kicker: "KANJI TEST · JLPT FORMAT",
        subtitle: `Unit ${n} · ${unit.title.en}`,
        passText: "Great work! You passed this unit and the next one is unlocked.",
      }}
    />
  );
}
