import TestRunner from "@/components/test/TestRunner";
import { skillKey } from "@/lib/utils";
import { examParams, loadSkillExam } from "@/lib/skill-pages";

export const dynamicParams = false;
export const generateStaticParams = examParams("reading");

export default async function ReadingExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level, exam } = await loadSkillExam("reading", params);
  const L = level.toUpperCase();
  return (
    <TestRunner
      level={level}
      n={0}
      total={0}
      title={{ ja: "読解", en: exam.title.en, ta: exam.title.ta }}
      test={{ passMark: exam.passMark, items: exam.items }}
      nav={{
        key: skillKey("reading", level, 0),
        back: { href: "/reading", label: "Reading" },
        kicker: `${L} READING EXAM · JLPT FORMAT`,
        subtitle: `${exam.items.length} passages you haven’t seen before`,
        passText: `Excellent! You passed the ${L} reading exam.`,
      }}
    />
  );
}
