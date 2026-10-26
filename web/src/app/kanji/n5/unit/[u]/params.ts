import { notFound } from "next/navigation";
import { getKanjiUnit, getKanjiUnits } from "@/lib/content";

export function unitParams() {
  return getKanjiUnits("n5")
    .filter((u) => getKanjiUnit("n5", u.n))
    .map((u) => ({ u: String(u.n) }));
}

export async function loadUnit(params: Promise<{ u: string }>) {
  const { u } = await params;
  const unit = getKanjiUnit("n5", Number(u));
  if (!unit) notFound();
  return { unit, total: getKanjiUnits("n5").length };
}
