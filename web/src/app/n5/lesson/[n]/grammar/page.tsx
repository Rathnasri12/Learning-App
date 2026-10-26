import { notFound } from "next/navigation";
import { getLessonBundle, getSyllabus } from "@/lib/content";
import GrammarSlides from "@/components/GrammarSlides";

export function generateStaticParams() {
  return getSyllabus("n5").lessons.map((l) => ({ n: String(l.n) }));
}

export default async function GrammarPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const bundle = getLessonBundle("n5", Number(n));
  if (!bundle || !bundle.lesson) notFound();
  return <GrammarSlides level="n5" n={Number(n)} title={bundle.meta.title} grammar={bundle.lesson.grammar} />;
}
