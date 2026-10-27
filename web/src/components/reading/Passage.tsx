"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ReadingItem } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { rubyPlain, rubySpoken } from "@/lib/ruby";
import { cx } from "@/lib/utils";
import Ruby from "../Ruby";
import Speaker from "../Speaker";

/**
 * A reading passage. With `study`, tapping a sentence shows its translation (English or Tamil, following
 * the explanation-language switch) and the word list is shown underneath. In a test, only the Japanese.
 */
export default function Passage({ item, study = false }: { item: ReadingItem; study?: boolean }) {
  const furigana = useProgress((s) => s.settings.showReading);
  const setSetting = useProgress((s) => s.setSetting);
  const tamil = useProgress((s) => s.settings.explainTamil);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const all = item.paragraphs.flat();
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Speaker text={all.map((s) => rubySpoken(s.ja)).join("")} size={16} />
        <button
          type="button"
          onClick={() => setSetting("showReading", !furigana)}
          aria-pressed={furigana}
          className={cx("px-3 py-1.5 rounded-full text-xs font-extrabold", furigana ? "bg-indigo text-white" : "bg-bg-2 text-muted")}
        >
          <span lang="ja">ふりがな</span> {furigana ? "on" : "off"}
        </button>
        {study && (
          <button
            type="button"
            onClick={() => setOpen(open.size === all.length ? new Set() : new Set(all.map((_, k) => String(k))))}
            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-bg-2 text-muted"
          >
            {open.size === all.length ? "Hide" : "Show"} all translations
          </button>
        )}
      </div>

      <div className="rounded-2xl border-2 border-line bg-card p-4 sm:p-5 space-y-4" lang="ja">
        {item.title && <div className="font-black text-lg text-center"><Ruby text={item.title} show={furigana} /></div>}
        {(() => {
          let k = -1;
          return item.paragraphs.map((para, pi) => (
            <p key={pi} className="text-lg leading-[2.1]">
              {para.map((s) => {
                k++;
                const id = String(k);
                const isOpen = study && open.has(id);
                return (
                  <span key={id}>
                    <span
                      onClick={study ? () => toggle(id) : undefined}
                      className={cx(study && "cursor-pointer rounded hover:bg-indigo-2", isOpen && "bg-indigo-2")}
                    >
                      <Ruby text={s.ja} show={furigana} />
                    </span>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="block text-[15px] leading-relaxed text-fg-2 border-l-4 border-indigo pl-3 my-1"
                          lang={tamil ? "ta" : "en"}
                        >
                          {tamil ? s.ta : s.en}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                );
              })}
            </p>
          ));
        })()}
        {item.table && (
          <div className="overflow-x-auto -mx-1">
            {item.table.caption && <div className="font-black text-center mb-2"><Ruby text={item.table.caption} show={furigana} /></div>}
            <table className="w-full text-[15px] border-collapse">
              <thead>
                <tr>
                  {item.table.head.map((h, k) => (
                    <th key={k} className="border border-line bg-bg-2 px-2 py-1.5 font-black text-left whitespace-nowrap">
                      <Ruby text={h} show={furigana} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.table.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, k) => (
                      <td key={k} className="border border-line px-2 py-1.5 align-top">
                        <Ruby text={c} show={furigana} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {study && item.words.length > 0 && (
        <div className="rounded-2xl bg-bg-2 p-4">
          <div className="text-xs font-extrabold text-muted mb-2">WORDS IN THIS PASSAGE</div>
          <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {item.words.map((w) => (
              <li key={w.ja} className="flex items-baseline gap-2 text-sm">
                <span className="font-black text-base" lang="ja">
                  {w.ja}
                </span>
                {w.reading !== rubyPlain(w.ja) && (
                  <span className="text-muted" lang="ja">
                    {w.reading}
                  </span>
                )}
                <span className="text-fg-2 truncate">
                  <span lang="ta">{w.ta}</span> · {w.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
