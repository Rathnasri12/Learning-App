import type { McqItem, PassageClozeItem, SentenceOrderItem, TestItem } from "@/lib/types";

export type McqAnswer = { kind: "mcq"; choice: number | null };
export type OrderAnswer = { kind: "order"; placed: number[] };
export type ClozeAnswer = { kind: "cloze"; choices: (number | null)[] };
export type Answer = McqAnswer | OrderAnswer | ClozeAnswer;

export function isMcq(it: TestItem): it is McqItem {
  return !["sentence_order", "passage_cloze"].includes(it.type);
}
export function isOrder(it: TestItem): it is SentenceOrderItem {
  return it.type === "sentence_order";
}
export function isCloze(it: TestItem): it is PassageClozeItem {
  return it.type === "passage_cloze";
}

export function emptyAnswer(it: TestItem): Answer {
  if (isOrder(it)) return { kind: "order", placed: [] };
  if (isCloze(it)) return { kind: "cloze", choices: it.blanks.map(() => null) };
  return { kind: "mcq", choice: null };
}

export function isAnswered(it: TestItem, a: Answer | undefined): boolean {
  if (!a) return false;
  if (a.kind === "mcq") return a.choice !== null;
  if (a.kind === "order") return isOrder(it) && a.placed.length === it.chunks.length;
  return a.choices.every((c) => c !== null);
}

/** Returns [earned, possible] for one item. */
export function scoreItem(it: TestItem, a: Answer | undefined): [number, number] {
  if (isOrder(it)) {
    const ok = a?.kind === "order" && a.placed.length === it.chunks.length && a.placed.every((c, k) => c === k);
    return [ok ? 1 : 0, 1];
  }
  if (isCloze(it)) {
    let e = 0;
    it.blanks.forEach((b, k) => {
      if (a?.kind === "cloze" && a.choices[k] === b.answer) e++;
    });
    return [e, it.blanks.length];
  }
  const ok = a?.kind === "mcq" && a.choice === (it as McqItem).answer;
  return [ok ? 1 : 0, 1];
}
