import ReadingUnitHub from "@/components/skill/ReadingUnitHub";
import type { ReadingItem, SkillUnit } from "@/lib/types";
import { loadSkillUnit, unitParams } from "@/lib/skill-pages";

export const dynamicParams = false;
export const generateStaticParams = unitParams("reading");

export default async function ReadingUnitPage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit, total } = await loadSkillUnit("reading", params);
  return <ReadingUnitHub level={level} unit={unit as SkillUnit<ReadingItem>} total={total} />;
}
