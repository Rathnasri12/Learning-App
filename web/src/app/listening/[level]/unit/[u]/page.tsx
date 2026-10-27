import TestRunner from "@/components/test/TestRunner";
import { skillKey } from "@/lib/utils";
import { loadSkillUnit, unitParams } from "@/lib/skill-pages";

export const dynamicParams = false;
export const generateStaticParams = unitParams("listening");

export default async function ListeningUnitPage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit, total } = await loadSkillUnit("listening", params);
  const n = unit.unit;
  return (
    <TestRunner
      level={level}
      n={n}
      total={total}
      title={{ ja: "聴解", en: unit.title.en, ta: unit.title.ta }}
      test={{ passMark: unit.passMark, items: unit.items }}
      nav={{
        key: skillKey("listening", level, n),
        back: { href: "/listening", label: "Listening" },
        next: n < total ? { href: `/listening/${level}/unit/${n + 1}`, label: `Unit ${n + 1}` } : { href: "/listening", label: "Listening exam" },
        kicker: `${level.toUpperCase()} LISTENING · UNIT ${n} · JLPT FORMAT`,
        subtitle: unit.title.en,
        passText: "Great listening! You passed this unit and the next one is unlocked.",
      }}
    />
  );
}
