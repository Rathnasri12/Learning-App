import { notFound } from "next/navigation";
import { getLessonBundle, getSyllabus } from "@/lib/content";
import LessonHub from "@/components/LessonHub";

export function generateStaticParams() {
  return getSyllabus("n5").lessons.map((l) => ({ n: String(l.n) }));
}

export default async function LessonPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const num = Number(n);
  const bundle = getLessonBundle("n5", num);
  if (!bundle) notFound();
  return <LessonHub level="n5" bundle={bundle} total={getSyllabus("n5").lessonCount} />;
}
