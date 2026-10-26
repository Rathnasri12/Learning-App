import { notFound } from "next/navigation";
import TestRunner from "@/components/test/TestRunner";
import { kanjiKey } from "@/lib/utils";
import { getKanjiExam } from "@/lib/content";

export default function KanjiExamPage() {
  const exam = getKanjiExam("n5");
  if (!exam) notFound();
  return (
    <TestRunner
      level="n5"
      n={0}
      total={0}
      title={{ ja: "漢字", en: exam.title.en, ta: exam.title.ta }}
      test={{ passMark: exam.passMark, items: exam.items }}
      nav={{
        key: kanjiKey("n5", 0),
        back: { href: "/kanji", label: "Kanji" },
        kicker: "N5 KANJI EXAM · JLPT FORMAT",
        subtitle: "All 79 N5 kanji · 30 questions",
        passText: "Excellent! You passed the N5 kanji exam.",
      }}
    />
  );
}
