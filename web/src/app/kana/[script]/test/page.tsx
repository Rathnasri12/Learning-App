import KanaQuiz from "@/components/kana/KanaQuiz";
import { kanaKey } from "@/lib/utils";
import { label, loadScript, scriptParams } from "../load";

export const generateStaticParams = scriptParams;

export default async function Page({ params }: { params: Promise<{ script: string }> }) {
  const data = await loadScript(params);
  const other = data.script === "hiragana" ? "katakana" : null;
  return (
    <KanaQuiz
      pool={data.units.flatMap((u) => u.chars)}
      mode="test"
      count={40}
      passMark={0.8}
      progressKey={kanaKey(data.script, 0)}
      back={{ href: `/kana/${data.script}`, label: label(data.script) }}
      next={other ? { href: `/kana/${other}`, label: "Start katakana" } : { href: "/n5", label: "Start lesson 1" }}
      title="FINAL TEST"
    />
  );
}
