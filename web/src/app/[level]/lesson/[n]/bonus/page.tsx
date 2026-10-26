import { notFound } from "next/navigation";
import { availableLevels, getLessonBundle, getSyllabus } from "@/lib/content";
import VocabDeck from "@/components/VocabDeck";

export const dynamicParams = false;

export function generateStaticParams() {
  return availableLevels().flatMap((level) => getSyllabus(level).lessons.map((l) => ({ level, n: String(l.n) })));
}

export default async function BonusPage({ params }: { params: Promise<{ level: string; n: string }> }) {
  const { level, n } = await params;
  const bundle = getLessonBundle(level, Number(n));
  if (!bundle || bundle.bonus.length === 0) notFound();
  return <VocabDeck level={level} n={Number(n)} title={bundle.meta.title} vocab={bundle.bonus} bonus />;
}
