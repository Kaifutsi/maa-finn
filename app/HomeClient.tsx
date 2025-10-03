"use client";

import Header from "../components/Header";
import AIWidget from "../components/AIWidget";
import QuickLinks from "../components/QuickLinks";
import CardsGrid from "../components/CardsGrid";
import Pronunciation from "../components/Pronunciation";
import Footer from "../components/Footer";
import {
  BookOpen,
  X,
  ArrowRight,
  Sparkles,
  Target,
  Timer,
  Languages,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { grammarCards } from "@/data/grammar";
import Image from "@/components/SafeImage";
import FlipCard from "../components/FlipCard";
import Link from "next/link";
import { vocab } from "@/data/vocab";
import { useMemo, useState, useCallback, useEffect } from "react";

/* ========= helpers ========= */
type WithId = { id: number };

const FEATURED_GRAMMAR_IDS = [1, 2, 3];
const FEATURED_VOCAB_IDS = [101, 102, 103];

function pickFeatured<T extends WithId>(list: T[], ids: number[], count: number): T[] {
  const picked: T[] = [];
  for (const id of ids) {
    const found = (list as any[]).find((x) => x.id === id);
    if (found && !picked.includes(found)) picked.push(found);
    if (picked.length === count) break;
  }
  if (picked.length < count) {
    for (const item of list as any[]) {
      if (!picked.includes(item)) picked.push(item);
      if (picked.length === count) break;
    }
  }
  return picked.slice(0, count);
}

const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) =>
  a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

/* ========= localStorage keys ========= */
const START_KEY = "maa_finn_start_profile";
const LESSONS_UI_KEY = "maa_finn_lessons_ui";
const LESSONS_PROGRESS_KEY = "maa_finn_lessons_progress";
const QUIZ_HISTORY_KEY = "quiz_history";
const FAV_VOCAB_KEY = "fav_vocab";
const FAV_GOAL_KEY = "fav_goal";

// ближайшая цель для прогресса (лестница целей)
function nextGoal(n: number) {
  const steps = [10, 20, 50, 100, 200, 500, 1000];
  for (const s of steps) if (n < s) return s;
  return Math.max(n, steps[steps.length - 1]);
}

export default function HomeClient() {
  /* ------ Featured / recommended data ------ */
  const [favGoal, setFavGoal] = useState<number>(() => {
  try { return Number(localStorage.getItem(FAV_GOAL_KEY)) || 20; } catch { return 20; }
});
  const [editGoal, setEditGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(favGoal);

  // подхватываем изменения из других вкладок
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_GOAL_KEY) {
        setFavGoal(Number(e.newValue || 20));
        setGoalDraft(Number(e.newValue || 20));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FAV_GOAL_KEY, String(favGoal)); } catch {}
  }, [favGoal]);

  const featuredGrammar = useMemo(
    () => pickFeatured(grammarCards as any[], FEATURED_GRAMMAR_IDS, 3),
    []
  );

  const vocabWithPics = useMemo(
    () => (vocab as any[]).filter((v) => v.banner || v.image),
    []
  );
  const featuredVocab = useMemo(
    () => pickFeatured(vocabWithPics, FEATURED_VOCAB_IDS, 3),
    [vocabWithPics]
  );

  /* ------ Personalization (profile, resume, stats) ------ */
  type Profile = { level: "A0" | "A1" | "A2" | "B1" | "B2"; goals: string[]; minutesPerDay: number; daysPerWeek: 3 | 5 | 7 };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumeLessonId, setResumeLessonId] = useState<string | null>(null);
  const [lastQuiz, setLastQuiz] = useState<{ id: number; title: string } | null>(null);
  const [favCount, setFavCount] = useState(0);
  const [lessonsDoneCount, setLessonsDoneCount] = useState(0);
  const [testsDoneCount, setTestsDoneCount] = useState(0);
  const [testsDone, setTestsDone] = useState(0);
  const [answeredGlobal, setAnsweredGlobal] = useState(0);

  useEffect(() => {
    try {
      const p = localStorage.getItem(START_KEY);
      if (p) setProfile(JSON.parse(p));

      const uiRaw = localStorage.getItem(LESSONS_UI_KEY);
      if (uiRaw) {
        const ui = JSON.parse(uiRaw || "{}");
        if (ui.lastLessonId) setResumeLessonId(ui.lastLessonId);
      }

      const doneRaw = localStorage.getItem(LESSONS_PROGRESS_KEY);
      if (doneRaw) {
        const d = JSON.parse(doneRaw);
        setLessonsDoneCount(Object.keys(d || {}).filter((k) => !!d[k]).length);
      }

      const qRaw = localStorage.getItem(QUIZ_HISTORY_KEY) || "[]";
      const hist = JSON.parse(qRaw);

      // последний полноценный тест для «Продолжить»
      if (Array.isArray(hist) && hist.length) {
        const found = hist.find((x: any) => x?.quizId && x?.title);
        if (found) setLastQuiz({ id: found.quizId, title: found.title });
      }

      // считаем пройденные тесты (исключаем микро-квиз главной)
      const tests = Array.isArray(hist)
        ? hist.filter((x: any) => x && x.quizId !== "homepage-micro" && typeof x.total === "number").length
        : 0;
      setTestsDone(tests);

      const favRaw = localStorage.getItem(FAV_VOCAB_KEY) || "[]";
      const fav = JSON.parse(favRaw);
      setFavCount(Array.isArray(fav) ? fav.length : 0);
    } catch {}
  }, []);

    // Синхронизация главной при изменениях на других страницах
  useEffect(() => {
    const readAll = () => {
      try {
        const fav = JSON.parse(localStorage.getItem(FAV_VOCAB_KEY) || "[]");
        setFavCount(Array.isArray(fav) ? fav.length : 0);

        const hist = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || "[]");
        const tests = Array.isArray(hist)
          ? hist.filter((x: any) => x && x.quizId !== "homepage-micro" && typeof x.total === "number").length
          : 0;
        setTestsDone(tests);
      } catch {}
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_VOCAB_KEY || e.key === QUIZ_HISTORY_KEY) readAll();
    };
    const onShow = () => { if (document.visibilityState === "visible") readAll(); };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onShow);
    readAll();

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);


  /* ------ Daily micro-quiz ------ */
  const quizPool = useMemo(() => (vocab as any[]).filter((v) => v.fi && v.ru).slice(0, 500), []);
  const makeQuestion = useCallback(() => {
    if (quizPool.length < 4) return null;
    const correct = quizPool[rand(quizPool.length)];
    const others = shuffle(quizPool.filter((v) => v.id !== correct.id)).slice(0, 3);
    const options = shuffle([correct, ...others]).map((o) => ({ id: o.id, label: o.ru }));
    return { fi: correct.fi, correctId: correct.id, options };
  }, [quizPool]);
  const [q, setQ] = useState<any>(() => makeQuestion());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const onChoose = (id: number) => {
    if (chosen !== null) return;
    setChosen(id);
    setAnswered((x) => x + 1);
    if (id === q.correctId) setScore((s) => s + 1);
    // логируем попытку в глобальную историю
    try {
      const raw = localStorage.getItem(QUIZ_HISTORY_KEY) || "[]";
      const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      arr.unshift({ at: Date.now(), quizId: "homepage-micro", title: "Микро-квиз дня", correct: id === q.correctId });
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(arr.slice(0, 200)));
    } catch {}
  };
  const nextQ = () => {
    setChosen(null);
    setQ(makeQuestion());
  };

  /* ------ Recommended grammar by level ------ */
  const tagByLevel: Record<string, string> = {
    A0: "алфавит",
    A1: "окончания",
    A2: "имперфект",
    B1: "пассив",
    B2: "условные",
  };

  const recommendedGrammar = useMemo(() => {
    const tag = profile ? tagByLevel[profile.level] : undefined;
    if (!tag) return featuredGrammar;
    const byTag = (grammarCards as any[]).filter((c) => (c.tags || []).includes(tag)).slice(0, 3);
    return byTag.length ? byTag : featuredGrammar;
  }, [profile, featuredGrammar]);

  /* ------ Vocab modal ------ */
  const [openVocab, setOpenVocab] = useState<any | null>(null);
  const onOpenVocab = useCallback((e: React.MouseEvent, item: any) => {
    e.preventDefault();
    setOpenVocab(item);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      {/* === HERO === */}
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_30%_0%,_black_40%,transparent_100%)]">
          <div className="absolute -top-16 -left-16 size-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-400/10 animate-pulse" />
          <div className="absolute -top-10 right-10 size-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-400/10 animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-[1.1fr,1fr] gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-sky-700/80 dark:text-sky-300/80 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1">
                <Sparkles className="w-3.5 h-3.5" /> Новинка: тренажёр произношения
              </p>
            </div>

            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
              Финский <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">легко</span> 💙
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-prose">
              Карточки, баннеры, тренажёры и ИИ-помощник — всё в одном месте.
            </p>

            {/* (инпут + кнопка «Спросить ИИ») — УДАЛЕНО */}

            {/* Primary CTAs */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="px-5 py-2 rounded-2xl bg-sky-600 text-white shadow hover:shadow-md" href="/lessons">
                Начать
              </Link>
              <Link className="px-5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 inline-flex items-center gap-2" href="/grammar">
                <BookOpen className="w-4 h-4" /> Учить по темам
              </Link>
            </div>
          </div>

          {/* Правый столбец — ИИ */}
          <AIWidget />
        </div>
      </section>

      <QuickLinks />

      {/* === Continue section (resume) === */}
      {(resumeLessonId || lastQuiz || favCount > 0) && (
        <section className="max-w-6xl mx-auto px-4 pt-3">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm">
            <h3 className="text-xl font-bold mb-3">Продолжить</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {resumeLessonId && (
                <Link
                  href={`/lessons?lesson=${encodeURIComponent(resumeLessonId)}`}
                  className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow transition bg-white/70 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /><b>Вернуться к уроку</b></div>
                  <p className="text-sm opacity-70 mt-1">Откроется последний урок</p>
                </Link>
              )}
              {lastQuiz && (
                <Link
                  href={`/tests?quiz=${lastQuiz.id}`}
                  className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow transition bg-white/70 dark:bg-сlate-900/50"
                >
                  <div className="flex items-center gap-2"><ListChecks className="w-5 h-5" /><b>Повторить тест</b></div>
                  <p className="text-sm opacity-70 mt-1 line-clamp-1">{lastQuiz.title}</p>
                </Link>
              )}
              {favCount > 0 && (
                <Link
                  href="/dictionary"
                  className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow transition bg-white/70 dark:bg-сlate-900/50"
                >
                  <div className="flex items-center gap-2"><Languages className="w-5 h-5" /><b>Избранные слова</b></div>
                  <p className="text-sm opacity-70 mt-1">{favCount} в избранном</p>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* === Daily micro-quiz === */}
      <section className="max-w-6xl mx-auto px-4 pt-4 pb-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5 md:p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Микро-квиз дня <span className="inline-flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> ~30 сек</span>
              </div>
              {q ? (
                <>
                  <h3 className="mt-1 text-xl font-bold">
                    Что значит: <span className="text-sky-700 dark:text-sky-300">{q.fi}</span> ?
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o: any) => {
                      const isChosen = chosen === o.id;
                      const isCorrect = chosen !== null && o.id === q.correctId;
                      const isWrong = isChosen && !isCorrect;
                      return (
                        <button
                          key={o.id}
                          onClick={() => onChoose(o.id)}
                          className={[
                            "text-left px-3 py-2 rounded-xl border transition",
                            "hover:bg-slate-50 dark:hover:bg-slate-800",
                            isCorrect ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20" : "",
                            isWrong ? "border-rose-500 bg-rose-50/60 dark:bg-rose-900/20" : "border-slate-300 dark:border-slate-700",
                          ].join(" ")}
                          aria-pressed={isChosen}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Верно: <span className="font-semibold">{score}</span> / {answered}
                    </div>
                    <button
                      onClick={nextQ}
                      className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
                    >
                      Следующий <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Недостаточно слов для квиза.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === Recommended Grammar (by level) === */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h3 className="text-xl font-bold mb-4">Карточки грамматики</h3>
        <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
          {recommendedGrammar.map((card: any, i: number) => (
            <FlipCard
              key={card.id}
              className="cursor-pointer h-full rounded-3xl border border-slate-200 dark:border-сlate-800 bg-white/80 dark:bg-сlate-900/60 shadow-sm hover:shadow-md transition"
              back={
                <div className="flex flex-col h-full">
                  <Image
                    src={card.backImage || card.image}
                    alt={card.backTitle ?? card.title}
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover rounded-t-3xl"
                  />
                  <div className="p-4 flex-1 flex items-center justify-center text-center">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {(card.backDescription as string) || "Нажми ещё раз, чтобы вернуться."}
                    </p>
                  </div>
                </div>
              }
            >
              <>
                {card.image && (
                  <Image src={card.image} alt={card.title} width={500} height={300} className="w-full h-auto object-cover rounded-t-3xl" />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1.5">
                    {(card.tags || []).slice(0, 3).map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{card.title}</h3>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-3">{card.description}</p>
                  {card.examples?.length ? (
                    <ul className="text-sm list-disc pl-5 mt-auto space-y-1">
                      {card.examples.slice(0, 3).map((ex: string, idx: number) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-auto text-xs text-slate-500">Нажми, чтобы открыть пояснения ↺</div>
                  )}
                </div>
              </>
            </FlipCard>
          ))}
        </div>
      </section>

      {/* CTA row */}
      <div className="max-w-6xl mx-auto px-4 -mt-2 mb-8 flex flex-wrap gap-3">
        <Link
          href="/grammar"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          Все карточки грамматики <span aria-hidden>→</span>
        </Link>
      </div>

      {/* === Vocabulary banners + preview === */}
      <section className="max-w-6xl mx-auto px-4 pt-2 pb-8">
        <h3 className="text-xl font-bold mb-4">Карточки словаря</h3>
        <div className="grid gap-6 см:grid-cols-2 md:grid-cols-3">
          {featuredVocab.map((w: any) => (
            <Link
              key={w.id}
              href="/dictionary"
              className="group block rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition"
              title={`${w.fi} — ${w.ru}`}
              onClick={(e) => onOpenVocab(e, w)}
            >
              <Image src={(w.banner || w.image)!} alt={w.fi} width={1024} height={768} className="w-full h-auto object-cover" />
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/dictionary"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
          >
            Все слова из словаря <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Topic CTA */}
        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm">
          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600
                            flex items-center justify-center shadow ring-1 ring-sky-200/50 dark:ring-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Тема словаря</div>
              <h3 className="text-2xl font-extrabold leading-tight">Части тела</h3>
              <div className="text-sm text-slate-500 dark-text-slate-400">
                FI: <span className="font-medium">RUUMIINOSAT: VARTALO</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Примеры: <span className="font-medium">pää</span>, <span className="font-medium">käsi</span>, <span className="font-medium">jalka</span> — «голова, рука, нога».
              </p>
            </div>
            <div className="md:ml-auto">
              <Link
                href={{ pathname: "/dictionary", query: { topic: "части тела" } }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                Открыть тему <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === Прогресс: 3 ровные карточки === */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
          {/* 1) Слова */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Languages className="w-4 h-4" />
                <span className="font-medium">Выучено слов</span>
              </div>
              {!editGoal ? (
                <button
                  onClick={() => { setGoalDraft(favGoal); setEditGoal(true); }}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
                >
                  Изменить цель
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="text-5xl font-extrabold leading-none tabular-nums">{favCount}</div>
              {!editGoal ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  цель: <b>{favGoal}</b>
                  <span className="ml-2 opacity-80">осталось {Math.max(0, favGoal - favCount)}</span>
                </div>
              ) : (
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(Math.max(1, Number(e.target.value || 1)))}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 w-24 shrink-0"
                />
                <button
                  onClick={() => { setFavGoal(goalDraft); setEditGoal(false); }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-sm whitespace-nowrap shrink-0"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditGoal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm whitespace-nowrap shrink-0"
                >
                  Отмена
                </button>
              </div>
              )}
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.round((favCount / Math.max(1, favGoal)) * 100))}%` }}
              />
            </div>

            {favCount >= favGoal && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-900/20 px-4 py-3">
                <div className="text-sm text-emerald-700 dark:text-emerald-200">🎉 Цель достигнута!</div>
                <button onClick={() => setFavGoal(nextGoal(favGoal))} className="text-sm px-3 py-1.5 rounded-xl border border-emerald-300/60 dark:border-emerald-700">
                  Новая цель: {nextGoal(favGoal)}
                </button>
              </div>
            )}

            <div className="mt-auto pt-4">
              <Link href="/dictionary" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700">
                Продолжить учить <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2) Уроки */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <GraduationCap className="w-4 h-4" />
              <span className="font-medium">Выучено уроков</span>
            </div>
            <div className="mt-3 text-5xl font-extrabold leading-none tabular-nums">{lessonsDoneCount}</div>
            <div className="mt-auto pt-4">
              <Link href="/lessons" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700">
                Перейти к урокам <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3) Тесты */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <ListChecks className="w-4 h-4" />
              <span className="font-medium">Пройдено тестов</span>
            </div>
            <div className="mt-3 text-5xl font-extrabold leading-none tabular-nums">{testsDone}</div>
            <div className="mt-auto pt-4">
              <Link href="/tests" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700">
                К тестам <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>



      {false && <CardsGrid />}
      <Pronunciation />
      <Footer />

      {/* === Modal: vocab preview === */}
      {openVocab && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpenVocab(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="relative">
                <Image
                  src={(openVocab.banner || openVocab.image) as string}
                  alt={openVocab.fi}
                  width={1024}
                  height={768}
                  className="w-full h-auto object-cover"
                />
                <button
                  className="absolute топ-3 right-3 inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-2 shadow hover:scale-105 transition"
                  onClick={() => setOpenVocab(null)}
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-extrabold">{openVocab.fi}</h3>
                {openVocab.ru && <p className="text-slate-600 dark:text-slate-300 mt-1">{openVocab.ru}</p>}
                {openVocab.examples && Array.isArray(openVocab.examples) && (
                  <ul className="mt-3 list-disc pl-5 text-sm">
                    {openVocab.examples.slice(0, 4).map((ex: any, i: number) => (
                      <li key={i}>{typeof ex === "string" ? ex : ex.fi || ex.ru}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-5">
                  <Link
                    href="/dictionary"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 transition"
                    onClick={() => setOpenVocab(null)}
                  >
                    Открыть словарь <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
