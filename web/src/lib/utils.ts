export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Deterministic PRNG so option shuffles are stable within one attempt.
export function seededRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function shuffleWith<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffle<T>(arr: T[]): T[] {
  return shuffleWith(arr, Math.random);
}

/** Source lists join alternate spellings with ';' (足; 脚). First is primary. */
export function variants(s: string): string[] {
  return s.split(/;\s*/).map((x) => x.trim()).filter(Boolean);
}
export function primary(s: string): string {
  return variants(s)[0] ?? s;
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Progress key for a kanji unit (unit 0 = the level's final kanji exam). Same shape as lessonKey. */
export const kanjiKey = (level: string, unit: number) => `kanji-${level}-${unit}`;

/** Progress key for a kana unit (unit 0 = the final test for that script). */
export const kanaKey = (script: string, unit: number) => `kana-${script}-${unit}`;
