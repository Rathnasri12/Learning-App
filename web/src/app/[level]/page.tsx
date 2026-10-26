import { availableLevels, getAvailability, getSyllabus } from "@/lib/content";
import LessonMap from "@/components/LessonMap";

export const dynamicParams = false;

export function generateStaticParams() {
  return availableLevels().map((level) => ({ level }));
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const syllabus = getSyllabus(level);
  const avail = getAvailability(level);
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-extrabold text-sakura tracking-wider">LEVEL {level.toUpperCase()}</div>
          <h1 className="text-3xl font-black">Lesson map</h1>
        </div>
        <div className="text-sm text-muted font-bold">{syllabus.lessonCount} lessons</div>
      </div>
      <LessonMap level={level} lessons={syllabus.lessons} availability={avail} />
    </div>
  );
}
