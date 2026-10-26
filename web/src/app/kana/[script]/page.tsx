import KanaScriptPage from "@/components/kana/KanaScriptPage";
import { loadScript, scriptParams } from "./load";

export const generateStaticParams = scriptParams;

export default async function Page({ params }: { params: Promise<{ script: string }> }) {
  return <KanaScriptPage data={await loadScript(params)} />;
}
