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
