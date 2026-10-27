import TestRunner from "@/components/test/TestRunner";
import { skillKey } from "@/lib/utils";
import { examParams, loadSkillExam } from "@/lib/skill-pages";

export const dynamicParams = false;
export const generateStaticParams = examParams("listening");

export default async function ListeningExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level, exam } = await loadSkillExam("listening", params);
  const L = level.toUpperCase();
  return (
    <TestRunner
      level={level}
      n={0}
      total={0}
      title={{ ja: "聴解", en: exam.title.en, ta: exam.title.ta }}
      test={{ passMark: exam.passMark, items: exam.items }}
      nav={{
        key: skillKey("listening", level, 0),
        back: { href: "/listening", label: "Listening" },
        kicker: `${L} LISTENING EXAM · JLPT FORMAT`,
        subtitle: `${exam.items.length} questions you haven’t heard before`,
        passText: `Excellent! You passed the ${L} listening exam.`,
      }}
    />
  );
}
