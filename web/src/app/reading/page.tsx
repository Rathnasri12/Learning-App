import SkillLevels from "@/components/skill/SkillTrack";
import { trackLevels } from "@/lib/skill-pages";

export default function ReadingPage() {
  return <SkillLevels track="reading" levels={trackLevels("reading")} />;
}
