import KanaQuiz from "@/components/kana/KanaQuiz";
import { loadUnit, unitParams } from "../../../load";

export const generateStaticParams = unitParams;

export default async function Page({ params }: { params: Promise<{ script: string; u: string }> }) {
  const { data, unit } = await loadUnit(params);
  const base = `/kana/${data.script}/unit/${unit.n}`;
  return (
    <KanaQuiz
      pool={unit.chars}
      mode="practice"
      count={20}
      back={{ href: base, label: `Unit ${unit.n}` }}
      next={{ href: `${base}/test`, label: "Unit test" }}
      title="PRACTICE"
    />
  );
}
