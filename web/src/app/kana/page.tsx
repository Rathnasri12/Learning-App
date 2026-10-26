import KanaHome from "@/components/kana/KanaHome";
import { KANA_SCRIPTS, getKanaScript } from "@/lib/content";

export default function KanaPage() {
  const scripts = KANA_SCRIPTS.map((s) => getKanaScript(s)).filter((x) => x !== null);
  return <KanaHome scripts={scripts} />;
}
