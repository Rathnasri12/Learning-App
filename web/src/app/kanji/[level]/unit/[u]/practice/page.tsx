import KanjiPractice from "@/components/kanji/KanjiPractice";
import { loadUnit, unitParams } from "../params";

export const dynamicParams = false;
export const generateStaticParams = unitParams;

export default async function KanjiPracticePage({ params }: { params: Promise<{ level: string; u: string }> }) {
  const { level, unit } = await loadUnit(params);
  return <KanjiPractice level={level} unit={unit} />;
}
