import KanjiUnitHub from "@/components/kanji/KanjiUnitHub";
import { loadUnit, unitParams } from "./params";

export const dynamicParams = false;
export const generateStaticParams = unitParams;

export default async function KanjiUnitPage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit, total } = await loadUnit(params);
  return <KanjiUnitHub level={level} unit={unit} total={total} />;
}
