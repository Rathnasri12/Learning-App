// Kana → Hepburn romaji, matching the style of the vocab data (wanakana defaults: おう → ou, ー doubles the vowel).

const BASE: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "wi", ゑ: "we", を: "wo", ん: "n",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o", ゔ: "vu",
};

const SMALL_Y: Record<string, string> = { ゃ: "a", ゅ: "u", ょ: "o" };

function toHiragana(s: string) {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function kanaToRomaji(input: string): string {
  const s = toHiragana(input);
  let out = "";
  let double = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = s[i - 1];
    if (c === "っ") {
      double = true;
      continue;
    }
    if (c === "ー") {
      const v = out.match(/[aeiou]$/);
      if (v) out += v[0];
      continue;
    }
    let syl = BASE[c];
    if (syl === undefined) {
      out += c;
      double = false;
      continue;
    }
    const next = s[i + 1];
    if (next && SMALL_Y[next] && /i$/.test(syl) && syl !== "i") {
      // き+ゃ → kya, し+ゃ → sha, ち+ゃ → cha, じ+ゃ → ja
      syl = /^(sh|ch|j)/.test(syl) ? syl.slice(0, -1) + SMALL_Y[next] : syl.slice(0, -1) + "y" + SMALL_Y[next];
      i++;
    } else if (next && /[ぁぃぅぇぉ]/.test(next) && syl.length > 1) {
      // ファ → fa, ティ → ti
      syl = syl.slice(0, -1) + BASE[next];
      i++;
    }
    if (double) {
      out += syl.startsWith("ch") ? "t" : syl[0];
      double = false;
    }
    // ん before a vowel or y: きんようび → kin'youbi
    if (out.endsWith("n") && prev === "ん" && /^[aeiouy]/.test(syl)) out += "'";
    out += syl;
  }
  return out;
}
