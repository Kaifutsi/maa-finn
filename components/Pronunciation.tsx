"use client";

import { useState, useRef } from "react";
import { Mic, Square, Volume2, RefreshCw } from "lucide-react";
import { getEngine } from "@/lib/webllm";

type Quota = { limit: number; used: number; remaining: number; resetAt: number };

export default function Pronunciation() {
  const fallbackPool = [
    "Hei! Mitä kuuluu?",
    "Minä puhun suomea vähän.",
    "Kiitos ja anteeksi.",
    "Missä on kahvila?",
    "Tämä on hyvä idea.",
  ];
  const pickFallback = () => fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  const [target, setTarget] = useState<string>(pickFallback());

  const [loadingPhrase, setLoadingPhrase] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);

  // Для совместимости с прежним UI
  const [quota] = useState<Quota | null>(null);
  const [paywalled] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fmtReset = (ts?: number) =>
    ts
      ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(ts))
      : "в следующем месяце";

  const pct = quota ? Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100)) : 0;

  async function getPhrase() {
    setTouched(true);
    setLoadingPhrase(true);
    setScore(null);
    setTranscript("");
    setAudioURL(null);
    setErr(null);

    try {
      const engine = await getEngine();
      const res: any = await engine.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Ты — преподаватель финского. Сгенерируй ОДНУ короткую фразу уровня A1–A2 ТОЛЬКО на финском. Без перевода и комментариев. Верни строку без кавычек.",
          },
          { role: "user", content: "Дай одну краткую повседневную финскую фразу." },
        ],
        temperature: 0.8,
        max_tokens: 30,
      });

      const raw =
        res?.choices?.[0]?.message?.content ??
        res?.choices?.[0]?.text ??
        res?.output_text ??
        "Hei!";

      const phrase = String(raw).replace(/^['\"«»]+|['\"«»]+$/g, "").trim();
      setTarget(phrase || "Hei!");
    } catch (e: any) {
      console.error("[Pronunciation.getPhrase] error:", e);
      setErr(e?.message || "Ошибка локальной модели");
    } finally {
      setLoadingPhrase(false);
    }
  }

  // Простейшая «оценка» похожести
  function simpleScore(hyp: string) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-zäöå\s.]/gi, "").trim();
    const a = norm(target);
    const b = norm(hyp || "");
    if (!b) return 0;
    const max = Math.max(a.length, b.length);
    let same = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) same++;
    return Math.max(0, Math.min(100, Math.round((same / max) * 100)));
  }

  async function start() {
    setScore(null);
    setTranscript("");
    setAudioURL(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    mediaRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = function onStopHandler(this: MediaRecorder) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
    };

    rec.start();
    setRecording(true);

    // Web Speech API
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      // @ts-ignore
      const r = new SR();
      r.lang = "fi-FI";
      r.interimResults = true;
      r.onresult = (e: any) => {
        const txt = Array.from(e.results).map((res: any) => res[0].transcript).join(" ");
        setTranscript(txt);
      };
      r.start();

      const prevOnStop = (rec.onstop as ((this: MediaRecorder, ev: Event) => any) | null) ?? null;
      rec.onstop = (e: Event) => {
        try {
          r.stop();
        } catch {}
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        prevOnStop?.call(rec, e);
      };
    }
  }

  function stop() {
    mediaRef.current?.stop();
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
    if (transcript) setScore(simpleScore(transcript));
  }

  function playSample() {
    const u = new SpeechSynthesisUtterance(target || "Hei!");
    u.lang = "fi-FI";
    window.speechSynthesis.speak(u);
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-14">
      <div className="rounded-3xl p-6 md:p-10 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow grid md:grid-cols-[1.2fr,1fr] gap-6 items-center">
        <div>
          <h3 className="text-2xl font-extrabold">Произношение с ИИ</h3>
          <p className="opacity-80 mt-2">Каждый раз — новая финская фраза уровня A1–A2.</p>

          {touched && paywalled && quota && (
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-4">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                Лимит запросов исчерпан. Сброс — <span className="font-medium">{fmtReset(quota.resetAt)}</span>.
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {touched && err && !paywalled && (
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-3 text-sm text-slate-700 dark:text-slate-300">
              {err}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            {!recording ? (
              <button onClick={start} className="px-4 py-2 rounded-2xl bg-sky-600 text-white flex items-center gap-2">
                <Mic className="w-4 h-4" /> Записать
              </button>
            ) : (
              <button onClick={stop} className="px-4 py-2 rounded-2xl bg-red-600 text-white flex items-center gap-2">
                <Square className="w-4 h-4" /> Стоп
              </button>
            )}

            <button onClick={playSample} className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Послушать пример
            </button>

            <button
              onClick={getPhrase}
              disabled={loadingPhrase || recording}
              className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center gap-2 disabled:opacity-50"
              title={recording ? "Останови запись, чтобы сменить фразу" : ""}
            >
              <RefreshCw className="w-4 h-4" /> Новая фраза
            </button>
          </div>

          <p className="mt-4 text-sm">
            Hei! Sano lause: <i>{loadingPhrase ? "генерируем…" : `“${target}”`}</i>
          </p>
          {transcript && <p className="mt-2 text-sm opacity-80">Распознано: “{transcript}”</p>}
          {score !== null && <p className="mt-1 text-sm">Оценка: <b>{score}</b>/100</p>}
        </div>

        <div className="rounded-2xl bg-sky-50/60 dark:bg-slate-800/40 border border-sky-200/60 dark:border-slate-700 p-4 min-h-[160px]">
          {audioURL ? (
            <audio controls src={audioURL} className="w-full" />
          ) : (
            <div className="h-24 rounded-xl bg-white/60 dark:bg-slate-900/40 grid place-items-center text-sm">
              {recording ? "Запись идёт…" : "Нажми «Записать», чтобы проверить произношение"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
