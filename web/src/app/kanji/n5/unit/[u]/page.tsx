import KanjiUnitHub from "@/components/kanji/KanjiUnitHub";
import { loadUnit, unitParams } from "./params";

export const generateStaticParams = unitParams;

export default async function KanjiUnitPage({ params }: { params: Promise<{ u: string }> }) {
  const { unit, total } = await loadUnit(params);
  return <KanjiUnitHub level="n5" unit={unit} total={total} />;
}
