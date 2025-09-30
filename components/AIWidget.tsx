"use client";

import { useState } from "react";
import { MessageCircle, Search, Info } from "lucide-react";
import { chat } from "@/lib/ai";
import { remaining, incQuota, LIMIT_MSG } from "@/lib/quota";

export default function AIWidget() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [left, setLeft] = useState<number>(remaining());

  async function ask(prefix?: string) {
    const question = (prefix ? `${prefix}: ` : "") + (q || "");
    if (!question.trim()) return;

    if (left <= 0) {
      setErr(LIMIT_MSG);
      return;
    }

    setLoading(true);
    setErr(null);
    setA("");

    try {
      const sys =
        "Ты — дружелюбный преподаватель финского языка. " +
        "Отвечай КОРОТКО и ВСЕГДА НА РУССКОМ. " +
        "Обязательно приводи 1–3 кратких примера НА ФИНСКОМ (с переводом в скобках). " +
        "Если просят упражнения — дай 3–5 очень коротких пунктов. " +
        "Избегай длинных вступлений.";

      const text = await chat(
        [
          { role: "system", content: sys },
          { role: "user", content: question },
        ],
        { temperature: 0.5, max_tokens: 300 }
      );

      setA(text);
      setLeft(incQuota().limit - incQuota().used + 1); // аккуратно обновим счётчик
      setLeft(remaining());
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
        <span className="ml-auto text-xs opacity-70 flex items-center gap-1">
          <Info className="w-3 h-3" /> Осталось: {left}/5
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4" />
          <input
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Спроси по-русски: «Как образуется пассив имперфекта?»"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            aria-label="Вопрос ИИ"
          />
        </div>

        <div className="p-3 text-sm space-y-3">
          {loading && <p className="animate-pulse">Думаю…</p>}

          {err && (
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/30 p-4 shadow-sm">
              <span className="text-amber-500 text-lg">⚠️</span>
              <div className="text-sm text-slate-800 dark:text-slate-200">
                <b className="block mb-1">Лимит исчерпан</b>
                <p>{err}</p>
              </div>
            </div>
          )}

          {!loading && !err && a && (
            <p className="mt-1">
              <b>Ответ:</b> {a}
            </p>
          )}

          {!loading && !a && !err && (
            <p className="text-slate-500">Например: «Дай простые примеры про падеж Partitiivi»</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        <button
          onClick={() => ask("Сделай 5 очень коротких упражнений по теме PASSIIVI")}
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
