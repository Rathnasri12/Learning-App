import "server-only";
import { notFound } from "next/navigation";
import type { SkillTrackName } from "./types";
import { getSkillExam, getSkillUnit, getSkillUnits, skillLevels } from "./content";

// Shared by the /reading and /listening route files.

export const trackLevels = (track: SkillTrackName) =>
  skillLevels(track).map((level) => ({
    level,
    units: getSkillUnits(track, level),
    examCount: getSkillExam(track, level)?.items.length ?? 0,
  }));

export const unitParams = (track: SkillTrackName) => () =>
  skillLevels(track).flatMap((level) => getSkillUnits(track, level).map((u) => ({ level, u: String(u.n) })));

export const examParams = (track: SkillTrackName) => () =>
  skillLevels(track)
    .filter((level) => getSkillExam(track, level))
    .map((level) => ({ level }));

export async function loadSkillUnit(track: SkillTrackName, params: Promise<{ level: string; u: string }>) {
  const { level, u } = await params;
  const unit = getSkillUnit(track, level, Number(u));
  if (!unit) notFound();
  return { level, unit, total: getSkillUnits(track, level).length };
}

export async function loadSkillExam(track: SkillTrackName, params: Promise<{ level: string }>) {
  const { level } = await params;
  const exam = getSkillExam(track, level);
  if (!exam) notFound();
  return { level, exam };
}
