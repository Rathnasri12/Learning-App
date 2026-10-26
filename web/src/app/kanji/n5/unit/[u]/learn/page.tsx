import KanjiLearn from "@/components/kanji/KanjiLearn";
import { loadUnit, unitParams } from "../params";

export const generateStaticParams = unitParams;

export default async function KanjiLearnPage({ params }: { params: Promise<{ u: string }> }) {
  const { unit } = await loadUnit(params);
  return <KanjiLearn level="n5" unit={unit} />;
}
