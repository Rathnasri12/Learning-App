import { notFound } from "next/navigation";
import TestRunner from "@/components/test/TestRunner";
import { kanjiKey } from "@/lib/utils";
import { getKanjiExam, getKanjiUnits } from "@/lib/content";
import { kanjiLevels } from "../unit/[u]/params";

export const dynamicParams = false;

export function generateStaticParams() {
  return kanjiLevels()
    .filter((level) => getKanjiExam(level))
    .map((level) => ({ level }));
}

export default async function KanjiExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const exam = getKanjiExam(level);
  if (!exam) notFound();
  const count = getKanjiUnits(level).reduce((a, u) => a + u.kanji.length, 0);
  const L = level.toUpperCase();
  return (
    <TestRunner
      level={level}
      n={0}
      total={0}
      title={{ ja: "漢字", en: exam.title.en, ta: exam.title.ta }}
      test={{ passMark: exam.passMark, items: exam.items }}
      nav={{
        key: kanjiKey(level, 0),
        back: { href: "/kanji", label: "Kanji" },
        kicker: `${L} KANJI EXAM · JLPT FORMAT`,
        subtitle: `All ${count} ${L} kanji · ${exam.items.length} questions`,
        passText: `Excellent! You passed the ${L} kanji exam.`,
      }}
    />
  );
}
