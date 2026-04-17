import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Languages,
  PenTool,
  Table2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Падежи финского языка: объяснение с примерами для начинающих",
  description:
    "Подробное объяснение падежей финского языка для начинающих. Разберите основные падежи, примеры слов, таблицу форм и частые ошибки.",
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
    description: "Пошаговый старт: что учить сначала и как не перегрузить себя.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    description: "Свяжите падежи с реальными предложениями и базовыми глаголами.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-vowel-harmony",
    title: "Гармония гласных",
    description: "Поймите, почему окончания выглядят по-разному в разных словах.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "База слов, на которых удобно тренировать формы и окончания.",
    icon: <Languages className="h-5 w-5" />,
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
              <Table2 className="h-3.5 w-3.5" />
              Грамматика для начинающих
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Падежи финского языка:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                простое объяснение с примерами
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Падежи — одна из самых важных тем в финском языке. Именно из-за них
              финский многим кажется сложным, но на практике система падежей
              намного логичнее, чем выглядит в начале. Если разбирать её через
              короткие слова и примеры, всё становится заметно понятнее.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/lessons/finnish-for-beginners"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Вернуться к базе
              </Link>

              <Link
                href="/tests/finnish-cases-test"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Пройти тест по падежам
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Связанные темы
            </div>
            <SectionTitle className="mt-2">
              Что поможет быстрее понять падежи
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Падежи лучше всего изучать не отдельно, а вместе с базовой лексикой,
              глаголами и общей структурой финского языка. Ниже — страницы,
              которые особенно полезны рядом с этой темой.
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
            <SectionTitle>Что такое падежи в финском языке</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Падеж показывает роль слова в предложении. В русском языке это тоже
              знакомая тема: дом, дома, дому, домом. В финском язык работает по
              похожему принципу, но формы и логика здесь свои.
            </p>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Очень часто в финском языке окончание заменяет предлог. То есть
              вместо отдельных слов вроде «в», «из» или «внутрь» язык меняет
              само существительное.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Простой пример
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>
                  <strong>talo</strong> — дом
                </li>
                <li>
                  <strong>talossa</strong> — в доме
                </li>
                <li>
                  <strong>talosta</strong> — из дома
                </li>
                <li>
                  <strong>taloon</strong> — в дом
                </li>
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Сколько падежей в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Обычно говорят, что в финском языке около 15 падежей. Но новичку
              не нужно пугаться этого числа. На старте достаточно понять
              несколько самых частых форм, которые постоянно встречаются в
              базовых словах, простых диалогах и учебных текстах.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>именительный падеж</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>родительный падеж</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>частичный падеж</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>внутренне-местные падежи</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              Основные падежи финского языка
            </SectionTitle>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Именительный падеж
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Это базовая форма слова, которую ты видишь в словаре. Именно
                  с неё начинается изучение существительных.
                </p>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>talo — дом</li>
                  <li>kirja — книга</li>
                  <li>koulu — школа</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Родительный падеж
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Родительный падеж часто показывает принадлежность или связь
                  одного предмета с другим.
                </p>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>talon ovi — дверь дома</li>
                  <li>kirjan kansi — обложка книги</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Частичный падеж
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Это одна из самых важных и одновременно самых непривычных тем.
                  Он используется с веществами, с частью чего-то, при
                  незавершённом действии и в ряде других ситуаций.
                </p>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>juon vettä — я пью воду</li>
                  <li>syön ruokaa — я ем еду</li>
                  <li>luen kirjaa — я читаю книгу</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Внутренне-местные падежи
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Эти формы показывают нахождение внутри чего-то, движение
                  изнутри и движение внутрь.
                </p>
                <ul className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>talossa — в доме</li>
                  <li>talosta — из дома</li>
                  <li>taloon — в дом</li>
                </ul>
              </div>
            </div>

            <SectionTitle className="mt-10">
              Таблица падежей финского языка для начинающих
            </SectionTitle>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Падеж</th>
                    <th className="px-4 py-3 text-left font-semibold">Значение</th>
                    <th className="px-4 py-3 text-left font-semibold">Пример</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Именительный</td>
                    <td className="px-4 py-3">базовая форма</td>
                    <td className="px-4 py-3">talo</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Родительный</td>
                    <td className="px-4 py-3">принадлежность, связь</td>
                    <td className="px-4 py-3">talon</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Частичный</td>
                    <td className="px-4 py-3">часть, вещество, незавершённость</td>
                    <td className="px-4 py-3">taloa</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Inessive</td>
                    <td className="px-4 py-3">внутри чего-то</td>
                    <td className="px-4 py-3">talossa</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Elative</td>
                    <td className="px-4 py-3">изнутри чего-то</td>
                    <td className="px-4 py-3">talosta</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">Illative</td>
                    <td className="px-4 py-3">внутрь чего-то</td>
                    <td className="px-4 py-3">taloon</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SectionTitle className="mt-10">
              Какие падежи учить в первую очередь
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Если ты только начинаешь, не нужно пытаться охватить все падежи
              сразу. Для хорошего старта достаточно такого порядка:
            </p>

            <ol className="mt-5 space-y-3 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>именительный</li>
              <li>родительный</li>
              <li>частичный</li>
              <li>местные падежи: в, из, внутрь</li>
            </ol>

            <SectionTitle className="mt-10">
              Частые ошибки при изучении падежей
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>пытаться выучить все падежи за один раз</li>
              <li>учить окончания без примеров и контекста</li>
              <li>путать родительный и частичный падеж</li>
              <li>игнорировать повторение через короткие фразы</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Самая полезная стратегия для новичка — видеть падеж не как
              отдельную таблицу, а как часть живого слова в предложении.
            </p>
          </article>

          <aside className="space-y-6">
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
                  href="/grammar/finnish-verbs"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финские глаголы
                </Link>

                <Link
                  href="/grammar/finnish-vowel-harmony"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Гармония гласных
                </Link>

                <Link
                  href="/dictionary/common-words"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Частые слова на финском
                </Link>

                <Link
                  href="/tests/finnish-cases-test"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Тест по падежам
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Что делать дальше
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                После знакомства с падежами полезно перейти к глаголам и
                гармонии гласных. Эти темы помогают лучше понимать, почему
                формы слов меняются именно так.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/grammar/finnish-verbs"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Открыть страницу про глаголы <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/grammar/finnish-vowel-harmony"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Разобрать гармонию гласных <ArrowRight className="h-4 w-4" />
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
                    Сколько падежей в финском языке?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Обычно говорят о 15 падежах, но новичку не нужно учить их все сразу.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Какие падежи самые важные на старте?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Именительный, родительный, частичный и несколько местных падежей.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Почему частичный падеж считается сложным?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Потому что он используется в разных ситуациях и его легче
                    понять через примеры, чем через одно короткое правило.
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
