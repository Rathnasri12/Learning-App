import { notFound } from "next/navigation";
import { availableLevels, getLessonBundle, getSyllabus } from "@/lib/content";
import GrammarSlides from "@/components/GrammarSlides";

export const dynamicParams = false;

export function generateStaticParams() {
  return availableLevels().flatMap((level) => getSyllabus(level).lessons.map((l) => ({ level, n: String(l.n) })));
}

export default async function GrammarPage({ params }: { params: Promise<{ level: string; n: string }> }) {
  const { level, n } = await params;
  const bundle = getLessonBundle(level, Number(n));
  if (!bundle || !bundle.lesson) notFound();
  return <GrammarSlides level={level} n={Number(n)} title={bundle.meta.title} grammar={bundle.lesson.grammar} />;
}
