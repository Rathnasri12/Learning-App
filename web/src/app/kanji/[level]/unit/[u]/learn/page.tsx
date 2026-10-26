import KanjiLearn from "@/components/kanji/KanjiLearn";
import { loadUnit, unitParams } from "../params";

export const dynamicParams = false;
export const generateStaticParams = unitParams;

export default async function KanjiLearnPage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit } = await loadUnit(params);
  return <KanjiLearn level={level} unit={unit} />;
}
