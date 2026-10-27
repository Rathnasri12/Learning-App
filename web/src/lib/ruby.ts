// Furigana markup used in reading passages and listening scripts: {漢字|かんじ}.

const RUBY = /\{([^|{}]+)\|([^|{}]+)\}/g;

export type RubyPart = { base: string; ruby?: string };

export function parseRuby(text: string): RubyPart[] {
  const out: RubyPart[] = [];
  let last = 0;
  for (const m of text.matchAll(RUBY)) {
    if (m.index > last) out.push({ base: text.slice(last, m.index) });
    out.push({ base: m[1], ruby: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ base: text.slice(last) });
  return out;
}

/** The text as printed (kanji, no furigana). */
export const rubyPlain = (text: string) => text.replace(RUBY, "$1");

/** The text as it should be spoken (furigana in place of kanji), so TTS doesn't misread. */
export const rubySpoken = (text: string) => text.replace(RUBY, "$2");
