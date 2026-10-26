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
  explanation_ta: string;
  explanation_en?: string;
};

export type SentenceOrderItem = {
  id: string;
  type: "sentence_order";
  before: string;
  chunks: string[];
  star: number;
  after: string;
  explanation_ta: string;
  explanation_en?: string;
};

export type PassageClozeItem = {
  id: string;
  type: "passage_cloze";
  passage: string;
  blanks: { options: string[]; answer: number }[];
  explanation_ta: string;
  explanation_en?: string;
};

export type TestItem = McqItem | SentenceOrderItem | PassageClozeItem;

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
};

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
