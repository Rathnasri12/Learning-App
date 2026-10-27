export type Lang3 = { ja: string; ta: string; en: string };

export type Example = {
  ja: string;
  reading: string;
  romaji: string;
  ta: string;
  en: string;
};

export type Vocab = {
  id: string;
  expression: string;
  reading: string;
  romaji: string;
  en: string;
  ta: string;
  pos: string;
  examples: Example[];
};

export type GrammarPoint = {
  id: string;
  pattern: string;
  name: { en: string; ta: string };
  explanation_ta: string;
  tamil_parallel: string;
  formation: string;
  examples: Example[];
  pitfalls_ta?: string;
  explanation_en?: string;
  tamil_parallel_en?: string;
  formation_en?: string;
  pitfalls_en?: string;
};

export type McqType =
  | "kanji_reading"
  | "orthography"
  | "vocab_context"
  | "paraphrase"
  | "grammar_form"
  | "usage";

export type McqItem = {
  id: string;
  type: McqType;
  sentence: string;
  target?: string;
  options: string[];
  answer: number;
  explanation_ta?: string;
  explanation_en?: string;
};

export type SentenceOrderItem = {
  id: string;
  type: "sentence_order";
  before: string;
  chunks: string[];
  star: number;
  after: string;
  explanation_ta?: string;
  explanation_en?: string;
};

export type PassageClozeItem = {
  id: string;
  type: "passage_cloze";
  passage: string;
  blanks: { options: string[]; answer: number }[];
  explanation_ta?: string;
  explanation_en?: string;
};

/** One sentence of a reading passage. `ja` may carry furigana as {漢字|かんじ}. */
export type ReadingSentence = { ja: string; en: string; ta: string };

export type ReadingQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation_en: string;
  explanation_ta: string;
};

export type ReadingKind = "short" | "mid" | "long" | "info";

/** JLPT 読解: a passage (prose, or a notice with a table for 情報検索) and its questions. */
export type ReadingItem = {
  id: string;
  type: "reading";
  kind: ReadingKind;
  title?: string;
  paragraphs: ReadingSentence[][];
  table?: { caption?: string; head: string[]; rows: string[][] };
  words: { ja: string; reading: string; en: string; ta: string }[];
  questions: ReadingQuestion[];
  explanation_ta?: string;
  explanation_en?: string;
};

export type ListeningKind = "task" | "point" | "gist" | "utterance" | "response";
export type Voice = "M" | "F" | "N";

/**
 * JLPT 聴解. `intro` is the narrator's setup (and question, for task/point/gist), `lines` the dialogue,
 * `question` is repeated after the dialogue. Options are shown on screen for task/point only; for
 * gist/utterance/response they are heard, as in the real exam. Japanese only, no translations.
 */
export type ListeningItem = {
  id: string;
  type: "listening";
  kind: ListeningKind;
  intro?: string;
  scene?: string; // utterance: emoji picture of the situation, with an arrow at the speaker
  lines: { s: Voice; t: string }[];
  question?: string;
  optionVoice?: Voice;
  options: string[];
  answer: number;
  explanation_ta?: string;
  explanation_en?: string;
};

export type TestItem = McqItem | SentenceOrderItem | PassageClozeItem | ReadingItem | ListeningItem;

export type LessonTest = { passMark: number; items: TestItem[] };

export type Lesson = {
  lesson: number;
  title: Lang3;
  intro_ta: string;
  intro_en?: string;
  grammar: GrammarPoint[];
  vocab_ids: string[];
  test: LessonTest;
};

export type SyllabusLesson = {
  n: number;
  slug: string;
  title: Lang3;
  theme: { en: string; ta: string };
  grammar: { id: string; pattern: string; en: string }[];
  vocabHints: string[];
};

export type Syllabus = {
  level: string;
  lessonCount: number;
  note: string;
  lessons: SyllabusLesson[];
};

export type LessonBundle = {
  meta: SyllabusLesson;
  lesson: Lesson | null;
  vocab: Vocab[];
  bonus: Vocab[]; // optional extra words beyond the N5 list
};

export const ITEM_TYPE_LABEL: Record<TestItem["type"], { ja: string; en: string }> = {
  kanji_reading: { ja: "漢字読み", en: "Kanji reading" },
  orthography: { ja: "表記", en: "Orthography" },
  vocab_context: { ja: "文脈規定", en: "Word in context" },
  paraphrase: { ja: "言い換え類義", en: "Paraphrase" },
  grammar_form: { ja: "文の文法１", en: "Grammar form" },
  usage: { ja: "用法", en: "Usage" },
  sentence_order: { ja: "文の組み立て", en: "Sentence order" },
  passage_cloze: { ja: "文章の文法", en: "Passage grammar" },
  reading: { ja: "読解", en: "Reading" },
  listening: { ja: "聴解", en: "Listening" },
};

export const READING_KIND_LABEL: Record<ReadingKind, { ja: string; en: string }> = {
  short: { ja: "内容理解（短文）", en: "Short passage" },
  mid: { ja: "内容理解（中文）", en: "Mid-length passage" },
  long: { ja: "内容理解（長文）", en: "Long passage" },
  info: { ja: "情報検索", en: "Information search" },
};

export const LISTENING_KIND_LABEL: Record<ListeningKind, { ja: string; en: string }> = {
  task: { ja: "課題理解", en: "Task" },
  point: { ja: "ポイント理解", en: "Key point" },
  gist: { ja: "概要理解", en: "Gist" },
  utterance: { ja: "発話表現", en: "What do you say?" },
  response: { ja: "即時応答", en: "Quick response" },
};

/** Label for a test item; reading and listening items are labelled by their JLPT sub-type. */
export function itemLabel(it: TestItem): { ja: string; en: string } {
  if (it.type === "reading") return READING_KIND_LABEL[it.kind];
  if (it.type === "listening") return LISTENING_KIND_LABEL[it.kind];
  return ITEM_TYPE_LABEL[it.type];
}

export type SkillTrackName = "reading" | "listening";

export type SkillUnit<T> = { unit: number; title: Bi; intro: Bi; passMark: number; items: T[] };
export type SkillExam<T> = { title: Bi; passMark: number; items: T[] };
export type SkillUnitMeta = { n: number; title: Bi; count: number; kinds: string[] };

export type Bi = { en: string; ta: string };

export type KanjiReading = { kana: string; romaji: string };

export type KanjiExample = {
  word: string;
  reading: string;
  romaji: string;
  en: string;
  ta: string;
  vocabId?: string;
};

export type Kanji = {
  kanji: string;
  meaning: Bi;
  on: KanjiReading[];
  kun: KanjiReading[];
  mnemonic: Bi;
  note?: Bi;
  examples: KanjiExample[];
  strokeCount: number;
  strokes: string[]; // SVG path data in stroke order (KanjiVG, 109×109 viewBox)
};

export type KanjiUnitMeta = { n: number; title: Bi; kanji: string[] };

export type KanjiUnit = {
  unit: number;
  title: Bi;
  intro: Bi;
  kanji: Kanji[];
  test: LessonTest;
};

export type KanjiExam = { title: Bi; passMark: number; items: TestItem[] };

export type KanaScriptName = "hiragana" | "katakana";

export type KanaChar = {
  kana: string;
  romaji: string;
  row: string;
  tamil: string; // approximate Tamil-script sound
  voiced: string | null; // g/z/j/d/b when Tamil script can't show the voicing
  strokes: string[];
  mnemonic?: Bi;
  note?: Bi;
  example?: { word: string; romaji: string; en: string; ta: string };
};

export type KanaRule = {
  id: string;
  unit: number;
  title: Bi;
  body: Bi;
  examples: { word: string; en: string; ta: string }[];
};

export type KanaUnit = { n: number; title: Bi; intro: Bi; chars: KanaChar[]; rules: KanaRule[] };

export type KanaScript = { script: KanaScriptName; intro: Bi; units: KanaUnit[] };
