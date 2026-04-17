import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Languages,
  GraduationCap,
  BookOpen,
  PenTool,
  CheckCircle2,
  MessageCircleMore,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Самые употребительные слова на финском языке для начинающих",
  description:
    "Подборка самых частых слов на финском языке для начинающих. Базовая лексика, полезные слова, примеры и простые фразы для старта.",
};

const greetings = [
  ["Hei", "привет"],
  ["Moi", "привет"],
  ["Kiitos", "спасибо"],
  ["Ole hyvä", "пожалуйста"],
  ["Anteeksi", "извините / простите"],
  ["Kyllä", "да"],
  ["Ei", "нет"],
  ["Näkemiin", "до свидания"],
];

const commonVerbs = [
  ["olla", "быть"],
  ["mennä", "идти / ехать"],
  ["tulla", "приходить / приезжать"],
  ["syödä", "есть"],
  ["juoda", "пить"],
  ["haluta", "хотеть"],
  ["puhua", "говорить"],
  ["tehdä", "делать"],
];

const commonNouns = [
  ["koti", "дом"],
  ["koulu", "школа"],
  ["työ", "работа"],
  ["päivä", "день"],
  ["aika", "время"],
  ["ruoka", "еда"],
  ["vesi", "вода"],
  ["perhe", "семья"],
];

const questionWords = [
  ["mikä", "что"],
  ["kuka", "кто"],
  ["missä", "где"],
  ["milloin", "когда"],
  ["miksi", "почему"],
  ["miten", "как"],
];

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
    description: "Пойми, с чего начать и в каком порядке изучать темы.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    description: "Учить слова проще, когда ты понимаешь, как они читаются.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    description: "Свяжи базовые слова с простыми предложениями и фразами.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/tests/basic-words-test",
    title: "Тест на базовые слова",
    description: "Проверь, какие слова уже запомнил и что стоит повторить.",
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

function WordCard({
  title,
  items,
}: {
  title: string;
  items: string[][];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>

      <div className="mt-4 grid gap-2">
        {items.map(([fi, ru]) => (
          <div
            key={fi}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <span className="font-semibold text-slate-900 dark:text-white">{fi}</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{ru}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="pb-14">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eef4ff_0%,transparent_60%)] dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-sky-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-sky-300">
              <Languages className="h-3.5 w-3.5" />
              Базовая лексика
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Самые употребительные слова на финском языке:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                база для начинающих
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Если ты только начинаешь учить финский язык, лучше всего стартовать
              с самых частых слов. Именно базовая лексика помогает быстрее понимать
              простые фразы, читать короткие тексты и собирать первые предложения.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/lessons/finnish-for-beginners"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Начать с базы
              </Link>

              <Link
                href="/tests/basic-words-test"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Пройти тест по словам
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Что изучать рядом
            </div>
            <SectionTitle className="mt-2">
              Темы, которые усиливают лексику
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Слова лучше запоминаются не по отдельности, а вместе с произношением,
              простыми фразами, глаголами и короткими упражнениями. Ниже —
              страницы, которые хорошо работают вместе с этой подборкой.
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
            <SectionTitle>Почему стоит начинать с частых слов</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Одна из главных ошибок новичков — пытаться учить редкие слова
              или сразу уходить в сложную теорию. Намного эффективнее сначала
              выучить самые нужные слова, которые постоянно встречаются в
              повседневной речи, диалогах и учебных материалах.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>частые слова быстрее запоминаются</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>они чаще встречаются в текстах и диалогах</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>с ними проще строить первые фразы</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>они дают ощущение быстрого прогресса</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              Базовые приветствия на финском языке
            </SectionTitle>
            <div className="mt-5">
              <WordCard title="Приветствия и вежливые слова" items={greetings} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <MessageCircleMore className="h-5 w-5" />
                Простые фразы с приветствиями
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Hei! Mitä kuuluu? — Привет! Как дела?</li>
                <li>Kiitos paljon. — Большое спасибо.</li>
                <li>Anteeksi, missä asema on? — Извините, где станция?</li>
                <li>Näkemiin! — До свидания!</li>
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Самые нужные финские глаголы
            </SectionTitle>
            <div className="mt-5">
              <WordCard title="Базовые глаголы" items={commonVerbs} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Примеры с глаголами
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Minä olen täällä. — Я здесь.</li>
                <li>Minä menen kouluun. — Я иду в школу.</li>
                <li>Hän tulee kotiin. — Он или она приходит домой.</li>
                <li>Me syömme ruokaa. — Мы едим еду.</li>
                <li>Minä juon vettä. — Я пью воду.</li>
              </ul>

              <Link
                href="/grammar/finnish-verbs"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
              >
                Подробнее про финские глаголы <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <SectionTitle className="mt-10">
              Частые существительные на финском языке
            </SectionTitle>
            <div className="mt-5">
              <WordCard title="Повседневные существительные" items={commonNouns} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Примеры с существительными
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Tämä on minun koti. — Это мой дом.</li>
                <li>Koulu on iso. — Школа большая.</li>
                <li>Perhe on tärkeä. — Семья важна.</li>
                <li>Vesi on kylmä. — Вода холодная.</li>
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Вопросительные слова в финском языке
            </SectionTitle>
            <div className="mt-5">
              <WordCard title="Вопросительные слова" items={questionWords} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Примеры с вопросительными словами
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Mikä tämä on? — Что это?</li>
                <li>Kuka hän on? — Кто это?</li>
                <li>Missä sinä asut? — Где ты живёшь?</li>
                <li>Milloin tunti alkaa? — Когда начинается занятие?</li>
                <li>Miten menee? — Как дела?</li>
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Как быстрее запоминать финские слова
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>учи слова по темам, а не по одному</li>
              <li>сразу используй новое слово в короткой фразе</li>
              <li>повторяй лексику каждый день по 10-15 минут</li>
              <li>читай слова вслух, чтобы связать написание и звучание</li>
              <li>чаще возвращайся к базовой лексике, а не к редким словам</li>
            </ul>

            <SectionTitle className="mt-10">
              Частые ошибки при изучении слов
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>пытаться учить слишком много слов за раз</li>
              <li>запоминать перевод без примеров</li>
              <li>игнорировать произношение</li>
              <li>учить редкие слова раньше базовых</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Намного полезнее хорошо знать 50-100 самых частых слов, чем
              поверхностно помнить сотни редких.
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
                  href="/lessons/finnish-pronunciation"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Финское произношение
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

                <Link
                  href="/tests/basic-words-test"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Тест на базовые слова
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Что учить после слов
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Когда базовая лексика уже знакома, полезно перейти к произношению,
                глаголам и первым грамматическим темам. Так слова начинают
                работать внутри реальных фраз и предложений.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/grammar/finnish-verbs"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Разобрать финские глаголы <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/lessons/finnish-pronunciation"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Перейти к произношению <ArrowRight className="h-4 w-4" />
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
                    Сколько слов нужно знать для старта?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Даже 50-100 самых употребительных слов уже помогают понимать
                    простые фразы и строить базовые предложения.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Какие слова учить в первую очередь?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Приветствия, вопросительные слова, базовые глаголы,
                    простые существительные и повседневные выражения.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Что лучше: слова или грамматика?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    На старте полезнее сначала выучить базовые слова и
                    произношение, а затем постепенно добавлять грамматику.
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
