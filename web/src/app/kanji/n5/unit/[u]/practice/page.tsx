import KanjiPractice from "@/components/kanji/KanjiPractice";
import { loadUnit, unitParams } from "../params";

export const generateStaticParams = unitParams;

export default async function KanjiPracticePage({ params }: { params: Promise<{ u: string }> }) {
  const { unit } = await loadUnit(params);
  return <KanjiPractice level="n5" unit={unit} />;
}
