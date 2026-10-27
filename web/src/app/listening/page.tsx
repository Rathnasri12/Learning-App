import SkillLevels from "@/components/skill/SkillTrack";
import { trackLevels } from "@/lib/skill-pages";

export default function ListeningPage() {
  return <SkillLevels track="listening" levels={trackLevels("listening")} />;
}
