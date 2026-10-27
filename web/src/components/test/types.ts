import type { ListeningItem, McqItem, PassageClozeItem, ReadingItem, SentenceOrderItem, TestItem } from "@/lib/types";

export type McqAnswer = { kind: "mcq"; choice: number | null };
export type OrderAnswer = { kind: "order"; placed: number[] };
export type ClozeAnswer = { kind: "cloze"; choices: (number | null)[] };
export type Answer = McqAnswer | OrderAnswer | ClozeAnswer;

const MCQ_TYPES: TestItem["type"][] = ["kanji_reading", "orthography", "vocab_context", "paraphrase", "grammar_form", "usage"];

export function isMcq(it: TestItem): it is McqItem {
  return MCQ_TYPES.includes(it.type);
}
export function isOrder(it: TestItem): it is SentenceOrderItem {
  return it.type === "sentence_order";
}
export function isCloze(it: TestItem): it is PassageClozeItem {
  return it.type === "passage_cloze";
}
export function isReading(it: TestItem): it is ReadingItem {
  return it.type === "reading";
}
export function isListening(it: TestItem): it is ListeningItem {
  return it.type === "listening";
}

/** Option lists of an item that has several questions or blanks, each scored separately. */
function multiParts(it: TestItem): { options: string[]; answer: number }[] | null {
  if (isCloze(it)) return it.blanks;
  if (isReading(it)) return it.questions;
  return null;
}

/** Options and answer for a single-choice item. */
function singlePart(it: TestItem): { options: string[]; answer: number } | null {
  if (isMcq(it) || isListening(it)) return it;
  return null;
}

export function emptyAnswer(it: TestItem): Answer {
  if (isOrder(it)) return { kind: "order", placed: [] };
  const parts = multiParts(it);
  if (parts) return { kind: "cloze", choices: parts.map(() => null) };
  return { kind: "mcq", choice: null };
}

export function isAnswered(it: TestItem, a: Answer | undefined): boolean {
  if (!a) return false;
  if (a.kind === "mcq") return a.choice !== null;
  if (a.kind === "order") return isOrder(it) && a.placed.length === it.chunks.length;
  return a.choices.every((c) => c !== null);
}

/** Display-order permutation(s) for an item's options or chunks. */
export function makePerm(it: TestItem, shuffle: (ks: number[]) => number[]): number[] | number[][] {
  if (isOrder(it)) {
    let p = shuffle(it.chunks.map((_, k) => k));
    if (p.every((c, k) => c === k)) p = [...p.slice(1), p[0]];
    return p;
  }
  const parts = multiParts(it);
  if (parts) return parts.map((b) => shuffle(b.options.map((_, k) => k)));
  return shuffle(singlePart(it)!.options.map((_, k) => k));
}

/** Returns [earned, possible] for one item. */
export function scoreItem(it: TestItem, a: Answer | undefined): [number, number] {
  if (isOrder(it)) {
    const ok = a?.kind === "order" && a.placed.length === it.chunks.length && a.placed.every((c, k) => c === k);
    return [ok ? 1 : 0, 1];
  }
  const parts = multiParts(it);
  if (parts) {
    let e = 0;
    parts.forEach((b, k) => {
      if (a?.kind === "cloze" && a.choices[k] === b.answer) e++;
    });
    return [e, parts.length];
  }
  const ok = a?.kind === "mcq" && a.choice === singlePart(it)!.answer;
  return [ok ? 1 : 0, 1];
}

/** Rough minutes an item takes, for the test intro screen. */
export function itemMinutes(it: TestItem): number {
  if (isReading(it)) return it.questions.length * (it.kind === "short" ? 1.5 : 2);
  if (isListening(it)) return 1.5;
  return 0.75;
}
