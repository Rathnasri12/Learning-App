import KanaLearn from "@/components/kana/KanaLearn";
import { loadUnit, unitParams } from "../../../load";

export const generateStaticParams = unitParams;

export default async function Page({ params }: { params: Promise<{ script: string; u: string }> }) {
  const { data, unit } = await loadUnit(params);
  return <KanaLearn script={data.script} unit={unit} />;
}
