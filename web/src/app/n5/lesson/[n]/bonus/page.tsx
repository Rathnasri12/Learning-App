import { notFound } from "next/navigation";
import { getLessonBundle, getSyllabus } from "@/lib/content";
import VocabDeck from "@/components/VocabDeck";

export function generateStaticParams() {
  return getSyllabus("n5").lessons.map((l) => ({ n: String(l.n) }));
}

export default async function BonusPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const bundle = getLessonBundle("n5", Number(n));
  if (!bundle || bundle.bonus.length === 0) notFound();
  return <VocabDeck level="n5" n={Number(n)} title={bundle.meta.title} vocab={bundle.bonus} bonus />;
}
