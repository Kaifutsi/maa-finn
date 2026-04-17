import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Languages,
  BookOpen,
  PenTool,
  Timer,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Тест по финскому языку для начинающих: проверь свой уровень",
  description:
    "Пройдите тест по финскому языку для начинающих. Проверьте базовые слова, глаголы, чтение, произношение и стартовую грамматику.",
};

type RelatedCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const relatedCards: RelatedCard[] = [
  {
    href: "/lessons/finnish-for-beginners",
    title: "Финский для начинающих",
    description: "Маршрут для старта: что учить сначала и как выстроить базу.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "Базовая лексика, которая чаще всего встречается в тестах для новичков.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    description: "Простые формы и примеры, которые помогают быстрее пройти стартовый тест.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    description: "Полезно для чтения слов, понимания звуков и базовых упражнений.",
    icon: <PenTool className="h-5 w-5" />,
  },
];

const coveredTopics = [
  "базовые слова и приветствия",
  "простые глаголы",
  "понимание коротких фраз",
  "алфавит и чтение слов",
  "элементарная грамматика",
];

const afterTestSteps = [
  {
    title: "Если было сложно с базовыми словами",
    text: "Вернись к частотной лексике и повтори самые нужные слова для начинающих.",
    href: "/dictionary/common-words",
    label: "Повторить слова",
  },
  {
    title: "Если было сложно с формами и предложениями",
    text: "Посмотри страницу про финские глаголы и разберись с простыми примерами.",
    href: "/grammar/finnish-verbs",
    label: "Разобрать глаголы",
  },
  {
    title: "Если были трудности с чтением",
    text: "Пройди алфавит и произношение, чтобы слова перестали казаться хаотичными.",
    href: "/lessons/finnish-pronunciation",
    label: "Открыть произношение",
  },
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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eef4ff_0%,transparent_60%)] dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-sky-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-sky-300">
              <ClipboardList className="h-3.5 w-3.5" />
              Проверка базового уровня
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Тест по финскому языку для начинающих:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                проверь свою базу
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Этот тест поможет понять, насколько уверенно ты ориентируешься в
              базовом финском языке. Он подойдёт тем, кто уже знаком с
              алфавитом, простыми словами, базовыми глаголами и стартовыми
              правилами чтения.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/tests"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Открыть все тесты
              </Link>

              <Link
                href="/lessons/finnish-for-beginners"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Вернуться к базе
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Подготовка к тесту
            </div>
            <SectionTitle className="mt-2">
              Что полезно повторить перед прохождением
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Если хочешь пройти тест увереннее, повтори базовую лексику,
              глаголы, алфавит и простые правила чтения. Эти темы чаще всего
              становятся основой стартовых заданий.
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

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
            <SectionTitle>Для кого подходит этот тест</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Этот тест подходит тем, кто уже начал знакомство с финским языком
              и хочет понять, насколько уверенно держится база. Он не рассчитан
              на продвинутый уровень и не требует сложной грамматики.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>если ты уже учил алфавит и чтение слов</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>если знаешь базовые слова и простые глаголы</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>если хочешь понять, где именно у тебя пробелы</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">Что проверяет тест для начинающих</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              На базовом уровне важно не количество сложных правил, а понимание
              самых частых слов, форм и конструкций. Поэтому тест для
              начинающих обычно строится вокруг стартовых тем.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Основные темы теста
              </div>

              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-slate-700 dark:text-slate-300">
                {coveredTopics.map((topic) => (
                  <li key={topic}>• {topic}</li>
                ))}
              </ul>
            </div>

            <SectionTitle className="mt-10">Почему такие тесты полезны</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Многие новички учат материал подряд, но не всегда понимают, что
              уже усвоено, а что только кажется знакомым. Тест помогает увидеть
              реальную картину и не распыляться.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>показывает сильные и слабые места</li>
              <li>помогает выбрать, что повторять дальше</li>
              <li>даёт ощущение прогресса</li>
              <li>закрепляет знания через практику</li>
            </ul>

            <SectionTitle className="mt-10">Как лучше проходить тест</SectionTitle>

            <ol className="mt-5 space-y-3 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>не спеши и читай задания до конца</li>
              <li>не угадывай механически — лучше подумай над логикой</li>
              <li>обращай внимание на знакомые слова и формы</li>
              <li>после результата обязательно посмотри, где были ошибки</li>
            </ol>

            <SectionTitle className="mt-10">Что делать после прохождения теста</SectionTitle>

            <div className="mt-5 space-y-4">
              {afterTestSteps.map((step) => (
                <div
                  key={step.href}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </div>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {step.text}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                  >
                    {step.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-10">
              Почему не стоит бояться ошибок
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Ошибки в стартовом тесте — это нормально. Они не означают, что у
              тебя «плохо с языком». Наоборот, именно ошибки показывают, какие
              темы дадут самый быстрый рост, если их сейчас повторить.
            </p>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Лучше пройти короткий тест и увидеть слабое место, чем долго
              учить всё подряд без понимания, что уже действительно усвоено.
            </p>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Timer className="h-4 w-4" />
                Формат
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <b>Уровень:</b> начинающий
                </div>
                <div>
                  <b>Темы:</b> слова, глаголы, чтение, база
                </div>
                <div>
                  <b>Подходит для:</b> A0–A1
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Быстрый маршрут
              </div>

              <div className="mt-3 flex flex-col gap-3">
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
                  href="/grammar/finnish-verbs"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финские глаголы
                </Link>

                <Link
                  href="/lessons/finnish-pronunciation"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финское произношение
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
                    Сложный ли этот тест?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Нет, он рассчитан именно на начинающих и проверяет базовые
                    знания, а не продвинутую грамматику.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Нужно ли сначала пройти все уроки?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Нет. Тест можно использовать и как проверку после первых
                    уроков, и как способ понять, с чего лучше начать.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Что делать, если много ошибок?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Это нормально. Лучше посмотреть, на каких темах были ошибки,
                    и повторить именно их, а не всё подряд.
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
