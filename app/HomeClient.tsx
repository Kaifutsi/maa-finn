"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
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
  LibraryBig,
  PenTool,
} from "lucide-react";

import Header from "../components/Header";
import AIWidget from "../components/AIWidget";
import QuickLinks from "../components/QuickLinks";
import Pronunciation from "../components/Pronunciation";
import Footer from "../components/Footer";
import FlipCard from "../components/FlipCard";
import Image from "@/components/SafeImage";

import { grammarCards } from "@/data/grammar";
import { vocab } from "@/data/vocab";

/* ========= helpers ========= */

type WithId = { id: number };

type Profile = {
  level: "A0" | "A1" | "A2" | "B1" | "B2";
  goals: string[];
  minutesPerDay: number;
  daysPerWeek: 3 | 5 | 7;
};

const FEATURED_GRAMMAR_IDS = [1, 2, 3];
const FEATURED_VOCAB_IDS = [101, 102, 103];

function pickFeatured<T extends WithId>(list: T[], ids: number[], count: number): T[] {
  const picked: T[] = [];

  for (const id of ids) {
    const found = list.find((x) => x.id === id);
    if (found && !picked.includes(found)) picked.push(found);
    if (picked.length === count) break;
  }

  if (picked.length < count) {
    for (const item of list) {
      if (!picked.includes(item)) picked.push(item);
      if (picked.length === count) break;
    }
  }

  return picked.slice(0, count);
}

const rand = (n: number) => Math.floor(Math.random() * n);

const shuffle = <T,>(arr: T[]) =>
  arr
    .map((value) => [Math.random(), value] as const)
    .sort((a, b) => a[0] - b[0])
    .map((x) => x[1]);

/* ========= localStorage keys ========= */

const START_KEY = "maa_finn_start_profile";
const LESSONS_UI_KEY = "maa_finn_lessons_ui";
const LESSONS_PROGRESS_KEY = "maa_finn_lessons_progress";
const QUIZ_HISTORY_KEY = "quiz_history";
const FAV_VOCAB_KEY = "fav_vocab";
const FAV_GOAL_KEY = "fav_goal";

function nextGoal(n: number) {
  const steps = [10, 20, 50, 100, 200, 500, 1000];
  for (const s of steps) {
    if (n < s) return s;
  }
  return Math.max(n, steps[steps.length - 1]);
}

function Section({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`max-w-6xl mx-auto px-4 ${className}`}>
      {title ? <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2> : null}
      {children}
    </section>
  );
}

const seoTiles = [
  {
    href: "/lessons/finnish-for-beginners",
    title: "Финский для начинающих",
    text: "Пошаговый старт с нуля: что учить сначала, как не перегрузиться и с чего реально начать.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    text: "Правила чтения, долгие и краткие звуки, ударение и типичные ошибки новичков.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-alphabet",
    title: "Финский алфавит",
    text: "Буквы, звуки, особенности ä, ö и y, а также примеры слов для практики.",
    icon: <LibraryBig className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-cases",
    title: "Падежи финского языка",
    text: "Понятное объяснение основных падежей, таблица форм и примеры для начинающих.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    text: "Самые нужные глаголы, базовые формы, простые предложения и стартовое спряжение.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-vowel-harmony",
    title: "Гармония гласных",
    text: "Одно из самых важных правил финского языка, которое помогает понимать окончания.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    text: "Базовая лексика для старта: приветствия, глаголы, существительные и полезные выражения.",
    icon: <Languages className="h-5 w-5" />,
  },
];

export default function HomeClient() {
  const [favGoal, setFavGoal] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(FAV_GOAL_KEY)) || 20;
    } catch {
      return 20;
    }
  });

  const [editGoal, setEditGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(favGoal);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumeLessonId, setResumeLessonId] = useState<string | null>(null);
  const [lastQuiz, setLastQuiz] = useState<{ id: number; title: string } | null>(null);
  const [favCount, setFavCount] = useState(0);
  const [lessonsDoneCount, setLessonsDoneCount] = useState(0);
  const [testsDone, setTestsDone] = useState(0);

  const vocabWithPics = useMemo(
    () => (vocab as any[]).filter((v) => v.banner || v.image),
    []
  );

  const featuredGrammar = useMemo(
    () => pickFeatured(grammarCards as any[], FEATURED_GRAMMAR_IDS, 3),
    []
  );

  const featuredVocab = useMemo(
    () => pickFeatured(vocabWithPics, FEATURED_VOCAB_IDS, 3),
    [vocabWithPics]
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_GOAL_KEY) {
        const next = Number(e.newValue || 20);
        setFavGoal(next);
        setGoalDraft(next);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_GOAL_KEY, String(favGoal));
    } catch {}
  }, [favGoal]);

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
        const done = JSON.parse(doneRaw);
        setLessonsDoneCount(Object.keys(done || {}).filter((k) => !!done[k]).length);
      }

      const historyRaw = localStorage.getItem(QUIZ_HISTORY_KEY) || "[]";
      const history = JSON.parse(historyRaw);

      if (Array.isArray(history) && history.length) {
        const found = history.find((x: any) => x?.quizId && x?.title);
        if (found && typeof found.quizId === "number") {
          setLastQuiz({ id: found.quizId, title: found.title });
        }
      }

      const tests = Array.isArray(history)
        ? history.filter(
            (x: any) => x && x.quizId !== "homepage-micro" && typeof x.total === "number"
          ).length
        : 0;
      setTestsDone(tests);

      const favRaw = localStorage.getItem(FAV_VOCAB_KEY) || "[]";
      const fav = JSON.parse(favRaw);
      setFavCount(Array.isArray(fav) ? fav.length : 0);
    } catch {}
  }, []);

  useEffect(() => {
    const readAll = () => {
      try {
        const fav = JSON.parse(localStorage.getItem(FAV_VOCAB_KEY) || "[]");
        setFavCount(Array.isArray(fav) ? fav.length : 0);

        const hist = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || "[]");
        const tests = Array.isArray(hist)
          ? hist.filter(
              (x: any) => x && x.quizId !== "homepage-micro" && typeof x.total === "number"
            ).length
          : 0;
        setTestsDone(tests);
      } catch {}
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_VOCAB_KEY || e.key === QUIZ_HISTORY_KEY) readAll();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") readAll();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    readAll();

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const quizPool = useMemo(
    () => (vocab as any[]).filter((v) => v.fi && v.ru).slice(0, 500),
    []
  );

  const makeQuestion = useCallback(() => {
    if (quizPool.length < 4) return null;

    const correct = quizPool[rand(quizPool.length)];
    const others = shuffle(quizPool.filter((v) => v.id !== correct.id)).slice(0, 3);
    const options = shuffle([correct, ...others]).map((o) => ({
      id: o.id,
      label: o.ru,
    }));

    return {
      fi: correct.fi,
      correctId: correct.id,
      options,
    };
  }, [quizPool]);

  const [q, setQ] = useState<any>(() => makeQuestion());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const onChoose = (id: number) => {
    if (!q || chosen !== null) return;

    setChosen(id);
    setAnswered((x) => x + 1);

    if (id === q.correctId) {
      setScore((s) => s + 1);
    }

    try {
      const raw = localStorage.getItem(QUIZ_HISTORY_KEY) || "[]";
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [];

      arr.unshift({
        at: Date.now(),
        quizId: "homepage-micro",
        title: "Микро-квиз дня",
        correct: id === q.correctId,
      });

      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(arr.slice(0, 200)));
    } catch {}
  };

  const nextQ = () => {
    setChosen(null);
    setQ(makeQuestion());
  };

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

    const byTag = (grammarCards as any[])
      .filter((c) => (c.tags || []).includes(tag))
      .slice(0, 3);

    return byTag.length ? byTag : featuredGrammar;
  }, [profile, featuredGrammar]);

  const [openVocab, setOpenVocab] = useState<any | null>(null);

  const onOpenVocab = useCallback((e: React.MouseEvent, item: any) => {
    e.preventDefault();
    setOpenVocab(item);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-400/10" />
            <div className="absolute -top-10 right-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-400/10" />
          </div>

          <div className="max-w-6xl mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-16">
            <div className="grid items-center gap-8 md:grid-cols-[1.05fr,0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-widest text-sky-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Тренажёр, словарь и ИИ-помощник
                </div>

                <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
                  Учите финский язык{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    с нуля, по темам и на практике
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                  MaaFinn помогает учить финский без перегруза: уроки для начинающих,
                  грамматика с примерами, словарь, тесты, тренировка произношения и быстрый
                  ИИ-помощник в одном месте.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/lessons"
                    className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700"
                  >
                    Начать обучение
                  </Link>

                  <Link
                    href="/grammar"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-white/70 dark:border-slate-700 dark:hover:bg-slate-900/40"
                  >
                    <BookOpen className="h-4 w-4" />
                    Перейти к грамматике
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="text-sm font-semibold">Для начинающих</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Пошаговые материалы без перегруза
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="text-sm font-semibold">Словарь и карточки</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Закрепляйте лексику через практику
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="text-sm font-semibold">Быстрые тесты</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Проверяйте прогресс и повторяйте темы
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <AIWidget />
              </div>
            </div>
          </div>
        </section>

        <QuickLinks />

        <Section className="pt-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Начать с главного
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
                Полезные материалы для старта
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Если ты только начинаешь учить финский язык, начни с этих страниц.
                Здесь собрана база: алфавит, произношение, частые слова, глаголы,
                падежи и основные правила.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Link
                href="/lessons/finnish-for-beginners"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Финский для начинающих</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  С чего начать, что учить первым и как выстроить обучение без перегруза.
                </p>
              </Link>

              <Link
                href="/lessons/finnish-pronunciation"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Финское произношение</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Правила чтения, ударение, долгие и краткие звуки, примеры слов.
                </p>
              </Link>

              <Link
                href="/lessons/finnish-alphabet"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Финский алфавит</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Буквы, звуки, особенности ä, ö и y, базовые примеры.
                </p>
              </Link>

              <Link
                href="/grammar/finnish-cases"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Падежи финского языка</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Простое объяснение падежей, таблица форм и понятные примеры.
                </p>
              </Link>

              <Link
                href="/grammar/finnish-verbs"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Финские глаголы</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Самые нужные глаголы, базовые формы и простые предложения.
                </p>
              </Link>

              <Link
                href="/dictionary/common-words"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="font-semibold">Частые слова на финском</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Базовая лексика для начинающих: приветствия, глаголы и нужные слова.
                </p>
              </Link>
            </div>
          </div>
        </Section>

        <Section className="pt-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                SEO-разделы и быстрый старт
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
                Что изучать на MaaFinn
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Если ты только начинаешь учить финский, начни с базовых страниц:
                алфавит, произношение, частые слова, глаголы и падежи. Ниже —
                ключевые материалы, которые уже встроены в структуру сайта.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {seoTiles.map((tile) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                      {tile.icon}
                    </div>
                    <div className="font-semibold">{tile.title}</div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {tile.text}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300">
                    Открыть страницу
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {(resumeLessonId || lastQuiz || favCount > 0) && (
          <Section className="pt-4">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-xl font-bold mb-3">Продолжить</h2>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {resumeLessonId && (
                  <Link
                    href={`/lessons?lesson=${encodeURIComponent(resumeLessonId)}`}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:shadow dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <b>Вернуться к уроку</b>
                    </div>
                    <p className="mt-1 text-sm opacity-70">
                      Откроется последний урок
                    </p>
                  </Link>
                )}

                {lastQuiz && (
                  <Link
                    href={`/tests?quiz=${lastQuiz.id}`}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:shadow dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      <b>Повторить тест</b>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm opacity-70">
                      {lastQuiz.title}
                    </p>
                  </Link>
                )}

                {favCount > 0 && (
                  <Link
                    href="/dictionary"
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:shadow dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      <b>Избранные слова</b>
                    </div>
                    <p className="mt-1 text-sm opacity-70">{favCount} в избранном</p>
                  </Link>
                )}
              </div>
            </div>
          </Section>
        )}

        <Section className="pt-4 pb-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500">
                <Target className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span>Микро-квиз дня</span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" /> ~30 сек
                  </span>
                </div>

                {q ? (
                  <>
                    <h2 className="mt-1 text-xl font-bold">
                      Что значит:{" "}
                      <span className="text-sky-700 dark:text-sky-300">{q.fi}</span>?
                    </h2>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((o: any) => {
                        const isChosen = chosen === o.id;
                        const isCorrect = chosen !== null && o.id === q.correctId;
                        const isWrong = isChosen && !isCorrect;

                        return (
                          <button
                            key={o.id}
                            onClick={() => onChoose(o.id)}
                            aria-pressed={isChosen}
                            className={[
                              "rounded-xl border px-3 py-2 text-left transition",
                              "hover:bg-slate-50 dark:hover:bg-slate-800",
                              isCorrect
                                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20"
                                : "",
                              isWrong
                                ? "border-rose-500 bg-rose-50/60 dark:bg-rose-900/20"
                                : "border-slate-300 dark:border-slate-700",
                            ].join(" ")}
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
                        className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 hover:bg-white/60 dark:border-slate-700 dark:hover:bg-slate-900/40"
                      >
                        Следующий <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Недостаточно слов для квиза.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Карточки грамматики" className="py-2">
          <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
            {recommendedGrammar.map((card: any) => (
              <FlipCard
                key={card.id}
                className="h-full cursor-pointer rounded-3xl border border-slate-200 bg-white/80 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                back={
                  <div className="flex h-full flex-col">
                    <Image
                      src={card.backImage || card.image}
                      alt={card.backTitle ?? card.title}
                      width={500}
                      height={300}
                      className="h-auto w-full rounded-t-3xl object-cover"
                    />
                    <div className="flex flex-1 items-center justify-center p-4 text-center">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {card.backDescription || "Нажми ещё раз, чтобы вернуться."}
                      </p>
                    </div>
                  </div>
                }
              >
                <>
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={500}
                      height={300}
                      className="h-auto w-full rounded-t-3xl object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(card.tags || []).slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="rounded-lg border border-slate-300 bg-white/60 px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-2 text-lg font-bold">{card.title}</h3>

                    <p className="mb-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                      {card.description}
                    </p>

                    {card.examples?.length ? (
                      <ul className="mt-auto list-disc space-y-1 pl-5 text-sm">
                        {card.examples.slice(0, 3).map((ex: string, idx: number) => (
                          <li key={idx}>{ex}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-auto text-xs text-slate-500">
                        Нажми, чтобы открыть пояснения ↺
                      </div>
                    )}
                  </div>
                </>
              </FlipCard>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/grammar"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-2 hover:bg-white/60 dark:border-slate-700 dark:hover:bg-slate-900/40"
            >
              Все карточки грамматики <span aria-hidden>→</span>
            </Link>
          </div>
        </Section>

        <Section title="Карточки словаря" className="pt-6 pb-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {featuredVocab.map((w: any) => (
              <Link
                key={w.id}
                href="/dictionary"
                title={`${w.fi} — ${w.ru}`}
                onClick={(e) => onOpenVocab(e, w)}
                className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              >
                <Image
                  src={w.banner || w.image}
                  alt={w.fi}
                  width={1024}
                  height={768}
                  className="h-auto w-full object-cover"
                />
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/dictionary"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-2 hover:bg-white/60 dark:border-slate-700 dark:hover:bg-slate-900/40"
            >
              Все слова из словаря <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 shadow ring-1 ring-sky-200/50 dark:ring-0">
                <BookOpen className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Тема словаря
                </div>
                <h3 className="text-2xl font-extrabold leading-tight">Части тела</h3>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  FI: <span className="font-medium">RUUMIINOSAT: VARTALO</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Примеры: <span className="font-medium">pää</span>,{" "}
                  <span className="font-medium">käsi</span>,{" "}
                  <span className="font-medium">jalka</span> — «голова, рука, нога».
                </p>
              </div>

              <div className="md:ml-auto">
                <Link
                  href={{ pathname: "/dictionary", query: { topic: "части тела" } }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
                >
                  Открыть тему <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section className="pb-10">
          <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Languages className="h-4 w-4" />
                  <span className="font-medium">Выучено слов</span>
                </div>

                {!editGoal ? (
                  <button
                    onClick={() => {
                      setGoalDraft(favGoal);
                      setEditGoal(true);
                    }}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs hover:bg-white/60 dark:border-slate-700 dark:hover:bg-slate-900/40"
                  >
                    Изменить цель
                  </button>
                ) : null}
              </div>

              <div className="mt-3 flex items-end gap-3">
                <div className="tabular-nums text-5xl font-extrabold leading-none">
                  {favCount}
                </div>

                {!editGoal ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    цель: <b>{favGoal}</b>
                    <span className="ml-2 opacity-80">
                      осталось {Math.max(0, favGoal - favCount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex max-w-full flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={goalDraft}
                      onChange={(e) =>
                        setGoalDraft(Math.max(1, Number(e.target.value || 1)))
                      }
                      className="w-24 shrink-0 rounded-xl border border-slate-300 bg-white/80 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900/60"
                    />
                    <button
                      onClick={() => {
                        setFavGoal(goalDraft);
                        setEditGoal(false);
                      }}
                      className="shrink-0 whitespace-nowrap rounded-xl bg-sky-600 px-3 py-1.5 text-sm text-white"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditGoal(false)}
                      className="shrink-0 whitespace-nowrap rounded-xl border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-[width] duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((favCount / Math.max(1, favGoal)) * 100)
                    )}%`,
                  }}
                />
              </div>

              {favCount >= favGoal && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                  <div className="text-sm text-emerald-700 dark:text-emerald-200">
                    🎉 Цель достигнута!
                  </div>
                  <button
                    onClick={() => setFavGoal(nextGoal(favGoal))}
                    className="rounded-xl border border-emerald-300/60 px-3 py-1.5 text-sm dark:border-emerald-700"
                  >
                    Новая цель: {nextGoal(favGoal)}
                  </button>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Link
                  href="/dictionary"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 dark:border-slate-700"
                >
                  Продолжить учить <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">Выучено уроков</span>
              </div>

              <div className="mt-3 tabular-nums text-5xl font-extrabold leading-none">
                {lessonsDoneCount}
              </div>

              <div className="mt-auto pt-4">
                <Link
                  href="/lessons"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 dark:border-slate-700"
                >
                  Перейти к урокам <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <ListChecks className="h-4 w-4" />
                <span className="font-medium">Пройдено тестов</span>
              </div>

              <div className="mt-3 tabular-nums text-5xl font-extrabold leading-none">
                {testsDone}
              </div>

              <div className="mt-auto pt-4">
                <Link
                  href="/tests"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 dark:border-slate-700"
                >
                  К тестам <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Pronunciation />
      </main>

      <Footer />

      {openVocab && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpenVocab(null)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative">
                <Image
                  src={openVocab.banner || openVocab.image}
                  alt={openVocab.fi}
                  width={1024}
                  height={768}
                  className="h-auto w-full object-cover"
                />

                <button
                  aria-label="Закрыть"
                  onClick={() => setOpenVocab(null)}
                  className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 shadow transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-2xl font-extrabold">{openVocab.fi}</h3>

                {openVocab.ru && (
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {openVocab.ru}
                  </p>
                )}

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
                    onClick={() => setOpenVocab(null)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
                  >
                    Открыть словарь <ArrowRight className="h-4 w-4" />
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
