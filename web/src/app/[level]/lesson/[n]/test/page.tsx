import { notFound } from "next/navigation";
import { availableLevels, getLessonBundle, getSyllabus } from "@/lib/content";
import TestRunner from "@/components/test/TestRunner";

export const dynamicParams = false;

export function generateStaticParams() {
  return availableLevels().flatMap((level) => getSyllabus(level).lessons.map((l) => ({ level, n: String(l.n) })));
}

export default async function TestPage({ params }: { params: Promise<{ level: string; n: string }> }) {
  const { level, n } = await params;
  const bundle = getLessonBundle(level, Number(n));
  if (!bundle || !bundle.lesson || bundle.lesson.test.items.length === 0) notFound();
  return (
    <TestRunner
      level={level}
      n={Number(n)}
      total={getSyllabus(level).lessonCount}
      title={bundle.meta.title}
      test={bundle.lesson.test}
    />
  );
}
