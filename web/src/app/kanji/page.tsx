import { LEVELS, getKanjiExam, getKanjiUnit, getKanjiUnits } from "@/lib/content";
import KanjiLevels from "@/components/kanji/KanjiLevels";

export default function KanjiPage() {
  const levels = LEVELS.map((level) => {
    const units = getKanjiUnits(level);
    return {
      level,
      units,
      ready: units.filter((u) => getKanjiUnit(level, u.n)).map((u) => u.n),
      hasExam: !!getKanjiExam(level),
    };
  }).filter((l) => l.units.length > 0);
  return <KanjiLevels levels={levels} />;
}
