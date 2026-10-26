import KanaUnitHub from "@/components/kana/KanaUnitHub";
import { loadUnit, unitParams } from "../../load";

export const generateStaticParams = unitParams;

export default async function Page({ params }: { params: Promise<{ script: string; u: string }> }) {
  const { data, unit } = await loadUnit(params);
  return <KanaUnitHub script={data.script} unit={unit} total={data.units.length} />;
}
