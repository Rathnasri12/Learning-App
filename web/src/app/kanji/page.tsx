import { getKanjiExam, getKanjiUnit, getKanjiUnits } from "@/lib/content";
import KanjiTrack from "@/components/kanji/KanjiTrack";

export default function KanjiPage() {
  const units = getKanjiUnits("n5");
  const ready = units.filter((u) => getKanjiUnit("n5", u.n)).map((u) => u.n);
  return <KanjiTrack level="n5" units={units} ready={ready} hasExam={!!getKanjiExam("n5")} />;
}
