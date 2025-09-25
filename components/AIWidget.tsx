// /components/AIWidget.tsx
"use client";

import { useState } from "react";
import { MessageCircle, Search } from "lucide-react";

type Quota = { limit: number; used: number; remaining: number; resetAt: number };

export default function AIWidget() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [paywalled, setPaywalled] = useState(false);

  const fmtReset = (ts?: number) => {
    if (!ts) return "в следующем месяце";
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
    }).format(new Date(ts));
  };

  async function ask(prefix?: string) {
    const question = (prefix ? `${prefix}: ` : "") + (q || "");
    if (!question.trim()) return;

    setLoading(true);
    setErr(null);
    setA("");
    setQuota(null);
    setPaywalled(false);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const d = await r.json();

      // Лимит исчерпан
      if (r.status === 402 && d?.paywall) {
        setPaywalled(true);
        setQuota({
          limit: Number(d.limit ?? 5),
          used: Number(d.used ?? d.limit ?? 5),
          remaining: 0,
          resetAt: Number(d.resetAt ?? 0),
        });
        return;
      }

      if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);

      if (d?.quota) setQuota(d.quota as Quota);
      setA(d.answer ?? "");
    } catch (e: any) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  // вычислим проценты для прогресс-бара
  const pct = quota ? Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100)) : 0;

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

          {/* Пэйвол — спокойная серая карточка + тот же градиент, что в «Выучено слов» */}
          {paywalled && quota && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-3" aria-live="polite">
              <div className="text-[13px] text-slate-700 dark:text-slate-300">
                Доступ к ИИ исчерпан на этот месяц. Сброс:{" "}
                <span className="font-medium">{fmtReset(quota.resetAt)}</span>.
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[12px] text-slate-500">
                <span>Использовано: {quota.used} / {quota.limit}</span>
                <button
                  onClick={() => alert("PRO скоро")}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  Узнать про PRO
                </button>
              </div>
            </div>
          )}

          {/* Обычная ошибка (без красного) */}
          {err && !paywalled && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-2 text-[13px] text-slate-700 dark:text-slate-300">
              {err}
            </div>
          )}

          {/* Ответ + индикатор остатка */}
          {!loading && !paywalled && !err && a && (
            <>
              {quota && (
                <>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[12px] text-slate-500 mt-1">
                    Осталось запросов: {quota.remaining} / {quota.limit} • Сброс {fmtReset(quota.resetAt)}
                  </div>
                </>
              )}
              <p className="mt-1"><b>Ответ:</b> {a}</p>
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
