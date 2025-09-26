// /components/AIWidget.tsx
"use client";

import { useState } from "react";
import { MessageCircle, Search, Sparkles } from "lucide-react";
import { getEngine } from "@/lib/webllm";

type Quota = { limit: number; used: number; remaining: number; resetAt: number };

export default function AIWidget() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Эти поля остаются для совместимости с твоим UI,
  // но при WebLLM серверной квоты нет — они всегда пустые/false.
  const [quota] = useState<Quota | null>(null);
  const [paywalled] = useState(false);

  // Флаг «в разработке» теперь можно отключить — локальная модель всегда доступна
  const [maintenance, setMaintenance] = useState(false);

  const fmtReset = (ts?: number) => {
    if (!ts) return "в следующем месяце";
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(ts));
  };

  async function ask(prefix?: string) {
    if (maintenance) return;

    const question = (prefix ? `${prefix}: ` : "") + (q || "");
    if (!question.trim()) return;

    setLoading(true);
    setErr(null);
    setA("");

    try {
      const engine = await getEngine();

      const sys = [
        "Ты — дружелюбный преподаватель финского языка (Suomen kieli).",
        "Отвечай кратко и чётко, фокусируясь ТОЛЬКО на финском.",
        "Приводи примеры на финском; при необходимости можно кратко пояснить по-русски."
      ].join(" ");

      // WebLLM имеет OpenAI-подобный интерфейс
      const res = await engine.chat.completions.create({
        messages: [
          { role: "system", content: sys },
          { role: "user", content: question },
        ],
        temperature: 0.5,
        max_tokens: 256,
      });

      // WebLLM: основной текст может быть в choices[0].message.content,
      // а в некоторых билдах ещё дублируется в res.output_text.
      const txt =
        res?.choices?.[0]?.message?.content ??
        (res as any)?.output_text ??
        "";

      setA(txt);
    } catch (e: any) {
      setErr(e?.message || "Ошибка локальной модели");
      // если уж совсем сломалось — покажем заглушку
      setMaintenance(true);
    } finally {
      setLoading(false);
    }
  }

  const pct = quota ? Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100)) : 0;

  // --------- Рендер заглушки «В разработке» (на случай критичных ошибок) ---------
  if (maintenance) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5" />
          <b>ИИ-помощник</b>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-4 md:p-5 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900/40 dark:to-slate-900/20">
            <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-sky-700/80 dark:text-sky-300/80 bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              В разработке
            </span>

            <h3 className="mt-3 text-xl font-extrabold">
              Скоро здесь будет умный помощник по финскому 💙
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Перезагрузи страницу — попробуем подгрузить офлайн-модель заново.
            </p>
          </div>

          <div className="p-4 md:p-5 bg-white/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 text-slate-500">
              <Search className="w-4 h-4" />
              <input className="w-full bg-transparent outline-none text-sm" placeholder="Kysymys: Как образуется пассив имперфекта?" disabled />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------- Основной рендер ---------
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-5 h-5" />
        <b>ИИ-помощник</b>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* input */}
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

          {/* Ошибка */}
          {err && !paywalled && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-2 text-[13px] text-slate-700 dark:text-slate-300">
              {err}
            </div>
          )}

          {/* Ответ */}
          {!loading && !paywalled && !err && a && (
            <>
              {quota && (
                <>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[12px] text-slate-500 mt-1">
                    Осталось запросов: {quota.remaining} / {quota.limit} • Сброс {fmtReset(quota.resetAt)}
                  </div>
                </>
              )}
              <p className="mt-1">
                <b>Ответ:</b> {a}
              </p>
            </>
          )}

          {!loading && !a && !err && !paywalled && (
            <p className="text-slate-500">Попробуй «Как образуется пассив имперфекта?»</p>
          )}
        </div>
      </div>

      {/* Быстрые кнопки */}
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
