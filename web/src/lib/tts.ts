"use client";

let voicesReady = false;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const ja = voices.filter((v) => v.lang.toLowerCase().startsWith("ja"));
  // Prefer natural/online voices when present
  const preferred = ja.find((v) => /nanami|keita|online|natural|google/i.test(v.name));
  return preferred ?? ja[0];
}

export function speak(text: string, opts: { rate?: number } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.replace(/[＿_（）()［］\[\]]/g, "").trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ja-JP";
  u.rate = opts.rate ?? 0.92;
  u.pitch = 1;
  const v = pickVoice();
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function warmVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || voicesReady) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicesReady = true;
  };
}

// ---- Listening scripts: several voices, played in sequence ----

export type ScriptVoice = "M" | "F" | "N";
export type Segment = { text: string; voice: ScriptVoice; pause?: number };

const MALE = /keita|ichiro|otoya|daichi|naoki|hattori|male|男/i;
const FEMALE = /nanami|haruka|ayumi|sayaka|kyoko|mizuki|aoi|shiori|mayu|nanako|female|女/i;

export function hasJapaneseVoice(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith("ja"));
}

/** Picks a voice per speaker. With one Japanese voice only, speakers are told apart by pitch. */
function castVoices() {
  const ja = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ja"));
  const male = ja.find((v) => MALE.test(v.name));
  const female = ja.find((v) => FEMALE.test(v.name) && v !== male) ?? ja.find((v) => v !== male);
  const base = pickVoice();
  return {
    M: { voice: male ?? base, pitch: male ? 1 : 0.7 },
    F: { voice: female ?? base, pitch: female && female !== base ? 1 : 1.25 },
    N: { voice: base, pitch: 1 },
  } satisfies Record<ScriptVoice, { voice?: SpeechSynthesisVoice; pitch: number }>;
}

/**
 * Plays segments one after another with short pauses. Calls onSegment(i) as each one starts and
 * onDone() at the end. Returns a stop function.
 */
export function playScript(
  segments: Segment[],
  { rate = 0.92, onSegment, onDone }: { rate?: number; onSegment?: (i: number) => void; onDone?: () => void } = {},
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone?.();
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const cast = castVoices();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Keep references: Chrome drops onend for utterances that get garbage-collected.
  const live: SpeechSynthesisUtterance[] = [];

  const play = (i: number) => {
    if (stopped) return;
    if (i >= segments.length) {
      onDone?.();
      return;
    }
    const seg = segments[i];
    const text = seg.text.replace(/[＿_（）()［］\[\]]/g, "").trim();
    if (!text) return play(i + 1);
    const u = new SpeechSynthesisUtterance(text);
    const c = cast[seg.voice];
    u.lang = "ja-JP";
    u.rate = rate;
    u.pitch = c.pitch;
    if (c.voice) u.voice = c.voice;
    const next = () => {
      if (stopped) return;
      timer = setTimeout(() => play(i + 1), seg.pause ?? 450);
    };
    u.onend = next;
    u.onerror = next;
    live.push(u);
    onSegment?.(i);
    synth.speak(u);
  };
  play(0);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    synth.cancel();
  };
}
