import KanaQuiz from "@/components/kana/KanaQuiz";
import { kanaKey } from "@/lib/utils";
import { loadUnit, unitParams } from "../../../load";

export const generateStaticParams = unitParams;

export default async function Page({ params }: { params: Promise<{ script: string; u: string }> }) {
  const { data, unit } = await loadUnit(params);
  const last = unit.n >= data.units.length;
  return (
    <KanaQuiz
      pool={unit.chars}
      mode="test"
      count={20}
      passMark={0.8}
      progressKey={kanaKey(data.script, unit.n)}
      back={{ href: `/kana/${data.script}/unit/${unit.n}`, label: `Unit ${unit.n}` }}
      next={
        last
          ? { href: `/kana/${data.script}/test`, label: "Final test" }
          : { href: `/kana/${data.script}/unit/${unit.n + 1}`, label: `Unit ${unit.n + 1}` }
      }
      title={`UNIT ${unit.n} TEST`}
    />
  );
}
