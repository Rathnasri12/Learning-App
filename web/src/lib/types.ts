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
};

export type SentenceOrderItem = {
  id: string;
  type: "sentence_order";
  before: string;
  chunks: string[];
  star: number;
  after: string;
  explanation_ta: string;
};

export type PassageClozeItem = {
  id: string;
  type: "passage_cloze";
  passage: string;
  blanks: { options: string[]; answer: number }[];
  explanation_ta: string;
};

export type TestItem = McqItem | SentenceOrderItem | PassageClozeItem;

export type LessonTest = { passMark: number; items: TestItem[] };

export type Lesson = {
  lesson: number;
  title: Lang3;
  intro_ta: string;
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
