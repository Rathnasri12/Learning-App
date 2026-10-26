import { notFound } from "next/navigation";
import { LEVELS, getKanjiUnit, getKanjiUnits } from "@/lib/content";

export function kanjiLevels() {
  return LEVELS.filter((l) => getKanjiUnits(l).length > 0);
}

export function unitParams() {
  return kanjiLevels().flatMap((level) =>
    getKanjiUnits(level)
      .filter((u) => getKanjiUnit(level, u.n))
      .map((u) => ({ level, u: String(u.n) })),
  );
}

export async function loadUnit(params: Promise<{ level: string; u: string }>) {
  const { level, u } = await params;
  const unit = getKanjiUnit(level, Number(u));
  if (!unit) notFound();
  return { level, unit, total: getKanjiUnits(level).length };
}
