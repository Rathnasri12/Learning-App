import { getAvailability, getSyllabus } from "@/lib/content";
import LessonMap from "@/components/LessonMap";

export default function N5Page() {
  const syllabus = getSyllabus("n5");
  const avail = getAvailability("n5");
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-extrabold text-sakura tracking-wider">LEVEL N5</div>
          <h1 className="text-3xl font-black">Lesson map</h1>
        </div>
        <div className="text-sm text-muted font-bold">{syllabus.lessonCount} lessons</div>
      </div>
      <LessonMap level="n5" lessons={syllabus.lessons} availability={avail} />
    </div>
  );
}
