import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Languages,
  PenTool,
  SpellCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Финский алфавит для начинающих: буквы, звуки и правила чтения",
  description:
    "Разберите финский алфавит с нуля. Буквы, звуки, особенности ä, ö, y, примеры слов и правила чтения для начинающих.",
};

type RelatedCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const relatedCards: RelatedCard[] = [
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    description: "После алфавита логично перейти к правилам чтения и звучанию слов.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-for-beginners",
    title: "Финский для начинающих",
    description: "Общий маршрут для старта: что учить после букв и звуков.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "Тренируй чтение на самых нужных словах для начинающих.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-vowel-harmony",
    title: "Гармония гласных",
    description: "Полезная тема, если хочешь глубже понять звучание и окончания слов.",
    icon: <BookOpen className="h-5 w-5" />,
  },
];

const vowelRows = [
  ["a", "auto", "машина"],
  ["e", "ele", "жест"],
  ["i", "ilta", "вечер"],
  ["o", "omena", "яблоко"],
  ["u", "uni", "сон"],
  ["y", "yksi", "один"],
  ["ä", "äiti", "мама"],
  ["ö", "työ", "работа"],
];

const importantConsonants = [
  ["k", "kala", "рыба"],
  ["t", "talo", "дом"],
  ["p", "pieni", "маленький"],
  ["j", "juna", "поезд"],
  ["v", "vesi", "вода"],
  ["h", "halu", "желание"],
];

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export default function Page() {
  return (
    <main className="pb-14">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eef4ff_0%,transparent_60%)] dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-sky-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-sky-300">
              <SpellCheck className="h-3.5 w-3.5" />
              База для чтения слов
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Финский алфавит:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                буквы, звуки и старт для чтения
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Финский алфавит — одна из первых тем, с которой стоит начать
              изучение языка. Если сразу понять, как выглядят и звучат финские
              буквы, дальше будет намного легче читать слова, учить лексику и
              разбирать произношение.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/lessons/finnish-pronunciation"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Перейти к произношению
              </Link>

              <Link
                href="/dictionary/common-words"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Тренировать слова
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Полезно изучать рядом
            </div>
            <SectionTitle className="mt-2">
              Что поможет быстрее освоить алфавит
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Алфавит сам по себе полезен, но настоящий результат приходит,
              когда ты сразу связываешь буквы со звучанием слов, базовой
              лексикой и стартовыми уроками.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                    {card.icon}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {card.title}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {card.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300">
                  Открыть страницу
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
            <SectionTitle>Сколько букв в финском алфавите</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              В основе финского алфавита лежит латиница. Для начинающего
              главное — не заучивать весь набор механически, а понять, какие
              буквы реально важны в повседневных словах и как они читаются.
            </p>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Особенно важно запомнить, что в финском языке часто встречаются
              буквы <strong>ä</strong>, <strong>ö</strong> и <strong>y</strong>.
              Именно они сначала кажутся непривычными, но быстро становятся
              понятными через практику.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Финский алфавит по порядку
              </div>
              <p className="mt-3 text-slate-700 leading-7 dark:text-slate-300">
                A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U,
                V, W, X, Y, Z, Å, Ä, Ö
              </p>
            </div>

            <SectionTitle className="mt-10">
              Какие буквы в финском языке самые важные
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              На старте полезнее сосредоточиться на тех буквах, которые
              постоянно встречаются в реальных словах:
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>гласные: a, e, i, o, u, y, ä, ö</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>частые согласные: k, t, p, m, n, l, s, r, h, j, v</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              Как читаются гласные в финском алфавите
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Гласные — ключевая часть финского языка. Они влияют и на
              произношение, и на грамматику, и на гармонию гласных. Для
              новичка особенно важно привыкнуть к их стабильному звучанию.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {vowelRows.map(([letter, word, translation]) => (
                <div
                  key={letter}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {letter}
                  </div>
                  <div className="mt-2 text-slate-700 dark:text-slate-300">
                    <strong>{word}</strong> — {translation}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Буквы <strong>ä</strong>, <strong>ö</strong> и <strong>y</strong>{" "}
              лучше не заменять привычными аналогами «на глаз», а постепенно
              привыкать к ним через реальные слова и повторение вслух.
            </p>

            <SectionTitle className="mt-10">
              Как читаются согласные в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Согласные в финском языке обычно читаются довольно прямо и
              предсказуемо. Это делает чтение проще, чем во многих других
              языках.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {importantConsonants.map(([letter, word, translation]) => (
                <div
                  key={`${letter}-${word}`}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {letter}
                  </div>
                  <div className="mt-2 text-slate-700 dark:text-slate-300">
                    <strong>{word}</strong> — {translation}
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-10">
              Особенности букв ä, ö и y
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Именно эти буквы делают финский алфавит чуть менее привычным для
              русскоязычного ученика. Но они же помогают быстрее почувствовать
              структуру языка.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Буква ä
                </div>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>äiti — мама</li>
                  <li>päivä — день</li>
                  <li>hämärä — сумерки</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Буква ö
                </div>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>työ — работа</li>
                  <li>yö — ночь</li>
                  <li>öljy — масло</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Буква y
                </div>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>yksi — один</li>
                  <li>ystävä — друг</li>
                  <li>yö — ночь</li>
                </ul>
              </div>
            </div>

            <SectionTitle className="mt-10">
              Почему важно учить алфавит вместе с произношением
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Сам по себе список букв мало что даёт, если не связывать его с
              реальным звучанием слов. Лучше всего учить финский алфавит сразу
              вместе с чтением вслух, короткими примерами и простыми словами.
            </p>

            <ol className="mt-5 space-y-3 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>увидел букву</li>
              <li>прочитал короткое слово</li>
              <li>повторил его вслух</li>
              <li>запомнил через практику</li>
            </ol>

            <SectionTitle className="mt-10">
              Частые ошибки начинающих
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>читать финские слова по правилам английского</li>
              <li>игнорировать буквы ä, ö и y</li>
              <li>не читать слова вслух</li>
              <li>учить алфавит без примеров</li>
              <li>не замечать длину гласных и согласных</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Самая полезная привычка на старте — не просто смотреть на букву,
              а сразу произносить её в составе реального слова.
            </p>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Быстрый маршрут
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/lessons/finnish-pronunciation"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финское произношение
                </Link>

                <Link
                  href="/lessons/finnish-for-beginners"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финский для начинающих
                </Link>

                <Link
                  href="/dictionary/common-words"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Частые слова на финском
                </Link>

                <Link
                  href="/grammar/finnish-vowel-harmony"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Гармония гласных
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Что делать после алфавита
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                После алфавита лучше всего переходить к произношению, базовым
                словам и простым правилам чтения. Так обучение идёт намного
                естественнее и быстрее.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/lessons/finnish-pronunciation"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Перейти к произношению <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dictionary/common-words"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Тренировать частые слова <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                FAQ
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Сложный ли финский алфавит для русскоязычных?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Обычно нет. Основная сложность связана не со всем алфавитом,
                    а с несколькими непривычными буквами и необходимостью
                    привыкнуть к их звучанию.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Какие буквы самые непривычные?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Чаще всего вопросы вызывают ä, ö и y, но при регулярной
                    практике они довольно быстро перестают казаться сложными.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Что лучше учить после алфавита?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    После алфавита лучше всего переходить к произношению,
                    базовым словам и простым правилам чтения.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
