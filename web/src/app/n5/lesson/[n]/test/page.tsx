import { notFound } from "next/navigation";
import { getLessonBundle, getSyllabus } from "@/lib/content";
import TestRunner from "@/components/test/TestRunner";

export function generateStaticParams() {
  return getSyllabus("n5").lessons.map((l) => ({ n: String(l.n) }));
}

export default async function TestPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const bundle = getLessonBundle("n5", Number(n));
  if (!bundle || !bundle.lesson || bundle.lesson.test.items.length === 0) notFound();
  return (
    <TestRunner
      level="n5"
      n={Number(n)}
      total={getSyllabus("n5").lessonCount}
      title={bundle.meta.title}
      test={bundle.lesson.test}
    />
  );
}
