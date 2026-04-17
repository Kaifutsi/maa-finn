import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Languages,
  PenTool,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Финский язык для начинающих с нуля: с чего начать обучение",
  description:
    "Подробный гид по финскому языку для начинающих. Узнайте, с чего начать изучение финского, что учить в первую очередь и как быстрее выйти на базовый уровень.",
};

type StartCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const startCards: StartCard[] = [
  {
    href: "/lessons/finnish-alphabet",
    title: "Финский алфавит",
    description: "Буквы, звуки и база для чтения слов с нуля.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    description: "Как правильно читать слова, ставить ударение и слышать длину звуков.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "Базовая лексика для старта: приветствия, глаголы и полезные слова.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    description: "Самые нужные глаголы и первые простые предложения.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-cases",
    title: "Падежи финского языка",
    description: "Понятное объяснение падежей, без перегруза и с примерами.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/tests/beginner-test",
    title: "Тест для начинающих",
    description: "Проверь, что уже знаешь, и найди слабые места.",
    icon: <CheckCircle2 className="h-5 w-5" />,
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eef4ff_0%,transparent_60%)] dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-sky-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-sky-300">
              <GraduationCap className="h-3.5 w-3.5" />
              Старт в финском языке
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Финский язык для начинающих:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                с чего начать и что учить в первую очередь
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Финский язык часто кажется сложным только в начале. На практике у него
              очень логичная структура, понятные правила чтения и предсказуемая
              грамматика. Если идти по шагам, можно довольно быстро начать понимать
              базовые слова, фразы и конструкции.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/lessons/finnish-alphabet"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Начать с алфавита
              </Link>

              <Link
                href="/lessons/finnish-pronunciation"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Перейти к произношению
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              С чего начать
            </div>
            <SectionTitle className="mt-2">
              Полезные материалы для старта
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Если ты только начинаешь учить финский язык, не нужно пытаться
              охватить всё сразу. Лучше идти по базовым темам: буквы, звуки,
              частые слова, глаголы и основные грамматические конструкции.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {startCards.map((card) => (
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
            <SectionTitle>Почему финский язык не такой сложный</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Несмотря на непривычные слова и окончания, финский язык достаточно
              системный. В нём меньше исключений, чем во многих европейских языках,
              и это сильно упрощает обучение. Когда ты понимаешь общий принцип,
              язык перестаёт казаться хаотичным.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>слова читаются почти так же, как пишутся</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>произношение логичное и повторяемое</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>грамматика строится по понятным моделям</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>при регулярной практике прогресс виден уже на старте</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              С чего начать изучение финского языка
            </SectionTitle>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Алфавит
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Начни с понимания букв и звуков. Это база для чтения и правильного
                  запоминания слов.
                </p>
                <Link
                  href="/lessons/finnish-alphabet"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Перейти к алфавиту <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  2. Произношение
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  В финском языке очень важно правильно читать слова. Это помогает
                  быстрее понимать язык на слух и увереннее учить новые темы.
                </p>
                <Link
                  href="/lessons/finnish-pronunciation"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Открыть страницу про произношение <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  3. Базовые слова
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Учите самые частые слова: приветствия, вопросительные слова,
                  простые глаголы, бытовые выражения. Это даёт быстрый результат.
                </p>
                <Link
                  href="/dictionary/common-words"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Посмотреть частые слова <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  4. Глаголы
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Без глаголов нельзя строить даже самые простые предложения.
                  Начни с самых употребительных форм.
                </p>
                <Link
                  href="/grammar/finnish-verbs"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Разобрать финские глаголы <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  5. Падежи
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Падежи — одна из ключевых тем в финском языке. Но новичку не нужно
                  сразу учить всё. Достаточно понять общую систему и основные формы.
                </p>
                <Link
                  href="/grammar/finnish-cases"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Открыть страницу про падежи <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <SectionTitle className="mt-10">
              Простой план обучения для новичка
            </SectionTitle>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Первая неделя
                </div>
                <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>алфавит и основные правила чтения</li>
                  <li>10-20 базовых слов</li>
                  <li>простые фразы и приветствия</li>
                  <li>чтение коротких слов вслух</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Вторая неделя
                </div>
                <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>базовые глаголы</li>
                  <li>простые предложения</li>
                  <li>повтор слов и выражений</li>
                  <li>первые шаги в падежах</li>
                </ul>
              </div>
            </div>

            <SectionTitle className="mt-10">
              Частые ошибки начинающих
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>учить всё сразу и перегружать себя теорией</li>
              <li>запоминать слова без примеров и без чтения вслух</li>
              <li>игнорировать произношение в самом начале</li>
              <li>заниматься редко, но слишком долго</li>
              <li>не повторять базовые темы регулярно</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Намного полезнее заниматься понемногу, но регулярно. Даже 15-20 минут
              в день обычно дают больше пользы, чем редкие длинные занятия.
            </p>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Быстрый маршрут
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/lessons/finnish-alphabet"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финский алфавит
                </Link>
                <Link
                  href="/lessons/finnish-pronunciation"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финское произношение
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
                  href="/grammar/finnish-cases"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Падежи финского языка
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Проверь себя
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                После знакомства с базой пройди тест и посмотри, какие темы стоит
                повторить в первую очередь.
              </p>

              <Link
                href="/tests/beginner-test"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Пройти тест для начинающих
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                FAQ
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Сложно ли учить финский язык?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    В начале он может казаться непривычным, но язык логичный и хорошо
                    поддаётся пошаговому обучению.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    С чего лучше начать?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    С алфавита, произношения и самых частых слов.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Сколько времени нужно на базу?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    При регулярной практике первые уверенные результаты можно получить
                    уже через несколько недель.
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
