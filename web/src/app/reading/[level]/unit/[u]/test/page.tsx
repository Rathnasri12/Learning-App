import TestRunner from "@/components/test/TestRunner";
import { skillKey } from "@/lib/utils";
import { loadSkillUnit, unitParams } from "@/lib/skill-pages";

export const dynamicParams = false;
export const generateStaticParams = unitParams("reading");

export default async function ReadingTestPage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit, total } = await loadSkillUnit("reading", params);
  const n = unit.unit;
  return (
    <TestRunner
      level={level}
      n={n}
      total={total}
      title={{ ja: "読解", en: unit.title.en, ta: unit.title.ta }}
      test={{ passMark: unit.passMark, items: unit.items }}
      nav={{
        key: skillKey("reading", level, n),
        back: { href: `/reading/${level}/unit/${n}`, label: `Unit ${n}` },
        next: n < total ? { href: `/reading/${level}/unit/${n + 1}`, label: `Unit ${n + 1}` } : { href: "/reading", label: "Reading exam" },
        kicker: `${level.toUpperCase()} READING TEST · JLPT FORMAT`,
        subtitle: `Unit ${n} · ${unit.title.en}`,
        passText: "Great reading! You passed this unit and the next one is unlocked.",
      }}
    />
  );
}
