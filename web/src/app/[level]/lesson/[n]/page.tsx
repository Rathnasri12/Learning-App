import { notFound } from "next/navigation";
import { availableLevels, getLessonBundle, getSyllabus } from "@/lib/content";
import LessonHub from "@/components/LessonHub";

export const dynamicParams = false;

export function generateStaticParams() {
  return availableLevels().flatMap((level) => getSyllabus(level).lessons.map((l) => ({ level, n: String(l.n) })));
}

export default async function LessonPage({ params }: { params: Promise<{ level: string; n: string }> }) {
  const { level, n } = await params;
  const num = Number(n);
  const bundle = getLessonBundle(level, num);
  if (!bundle) notFound();
  return <LessonHub level={level} bundle={bundle} total={getSyllabus(level).lessonCount} />;
}
