"use client";

import { useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { chat } from "@/lib/ai";

export default function AIWidget() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask(prefix?: string) {
    const question = (prefix ? `${prefix}: ` : "") + (q || "");
    if (!question.trim()) return;

    setLoading(true);
    setErr(null);
    setA("");

    try {
      const sys =
        "Ты — дружелюбный преподаватель финского языка. Отвечай КОРОТКО и ТОЛЬКО на финском, можно короткое русское пояснение при необходимости.";

      const text = await chat(
        [
          { role: "system", content: sys },
          { role: "user", content: question },
        ],
        { temperature: 0.5, max_tokens: 256 }
      );

      setA(text);
    } catch (e: any) {
      setErr(e?.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-5 h-5" />
        <b>ИИ-помощник</b>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4" />
          <input
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Kysymys: Когда использовать пассив в имперфекте?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            aria-label="Вопрос ИИ"
          />
        </div>

        <div className="p-3 text-sm space-y-3">
          {loading && <p className="animate-pulse">Думаю…</p>}

          {err && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-2 text-[13px] text-slate-700 dark:text-slate-300">
              {err}
            </div>
          )}

          {!loading && !err && a && (
            <p className="mt-1">
              <b>Ответ:</b> {a}
            </p>
          )}

          {!loading && !a && !err && (
            <p className="text-slate-500">Попробуй «Как образуется пассив имперфекта?»</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <button
          onClick={() => ask("Сделай 5 коротких упражнений по теме PASSIIVI")}
          className="px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          Упражнения
        </button>
        <button
          onClick={() => ask("Объясни правило проще для уровня A1")}
          className="px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          Объясни проще
        </button>
      </div>
    </div>
  );
}
