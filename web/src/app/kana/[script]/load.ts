import { notFound } from "next/navigation";
import { KANA_SCRIPTS, getKanaScript } from "@/lib/content";
import type { KanaScriptName } from "@/lib/types";

export function scriptParams() {
  return KANA_SCRIPTS.filter((s) => getKanaScript(s)).map((script) => ({ script }));
}

export function unitParams() {
  return KANA_SCRIPTS.flatMap((s) => (getKanaScript(s)?.units ?? []).map((u) => ({ script: s, u: String(u.n) })));
}

export async function loadScript(params: Promise<{ script: string }>) {
  const { script } = await params;
  const data = KANA_SCRIPTS.includes(script as KanaScriptName) ? getKanaScript(script as KanaScriptName) : null;
  if (!data) notFound();
  return data;
}

export async function loadUnit(params: Promise<{ script: string; u: string }>) {
  const { u } = await params;
  const data = await loadScript(params);
  const unit = data.units.find((x) => x.n === Number(u));
  if (!unit) notFound();
  return { data, unit };
}

export const label = (script: string) => (script === "hiragana" ? "Hiragana ひらがな" : "Katakana カタカナ");
