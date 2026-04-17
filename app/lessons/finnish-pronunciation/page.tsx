import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Languages,
  PenTool,
  Volume2,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Финское произношение для начинающих: правила чтения и примеры",
  description:
    "Разберите финское произношение с нуля. Правила чтения, долгие и краткие звуки, ударение, примеры слов и частые ошибки для начинающих.",
};

type RelatedCard = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const relatedCards: RelatedCard[] = [
  {
    href: "/lessons/finnish-alphabet",
    title: "Финский алфавит",
    description: "Буквы, звуки и базовые правила, с которых удобно начинать.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-for-beginners",
    title: "Финский для начинающих",
    description: "Пойми, с чего начать и как выстроить обучение без перегруза.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "Тренируй чтение и произношение на базовой лексике.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-vowel-harmony",
    title: "Гармония гласных",
    description: "Разбери важное правило, которое тесно связано со звучанием слов.",
    icon: <PenTool className="h-5 w-5" />,
  },
];

const vowelExamples = [
  ["a", "auto", "машина"],
  ["e", "ele", "жест"],
  ["i", "ilta", "вечер"],
  ["o", "omena", "яблоко"],
  ["u", "uni", "сон"],
  ["y", "yksi", "один"],
  ["ä", "äiti", "мама"],
  ["ö", "työ", "работа"],
];

const soundPairs = [
  ["tuli", "огонь", "tuuli", "ветер"],
  ["mato", "червь", "matto", "ковёр"],
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
              <Volume2 className="h-3.5 w-3.5" />
              Правила чтения для начинающих
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Финское произношение:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                как читать слова правильно с самого начала
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Финское произношение считается одним из самых логичных в Европе.
              Для новичка это большой плюс: в большинстве случаев слова читаются
              почти так же, как пишутся. Если понять базовые правила чтения,
              дальше учить слова и грамматику становится намного легче.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/lessons/finnish-alphabet"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Начать с алфавита
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
              Материалы, которые усиливают произношение
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Произношение лучше всего изучать вместе с алфавитом, базовой
              лексикой и стартовыми уроками. Так правила сразу закрепляются
              на реальных словах и фразах.
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
            <SectionTitle>Почему финское произношение удобно для изучения</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Во многих языках написание и звучание слова могут сильно отличаться.
              В финском такого хаоса намного меньше. Именно поэтому язык удобно
              учить через чтение, слух и повторение вслух.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>большинство слов читается предсказуемо</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>у букв обычно стабильное звучание</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>ударение подчиняется простому правилу</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>короткая ежедневная практика быстро даёт результат</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              Как читаются гласные в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Гласные в финском языке очень важны, потому что именно они часто
              влияют на звучание слова и даже на его смысл. Особенно важно не
              путать краткие и долгие звуки.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {vowelExamples.map(([letter, word, translation]) => (
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
              могут казаться непривычными, но со временем к ним быстро
              привыкаешь через реальные слова и повторение вслух.
            </p>

            <SectionTitle className="mt-10">
              Краткие и долгие звуки в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              В финском языке длина звука имеет значение. Одна и та же буква
              в короткой и длинной форме может менять слово. Долгий звук
              обычно обозначается удвоенной буквой.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {soundPairs.map(([w1, t1, w2, t2]) => (
                <div
                  key={`${w1}-${w2}`}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {w1}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t1}
                      </div>
                    </div>

                    <div className="text-slate-400">vs</div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {w2}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t2}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-10">
              Как читаются согласные в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Большинство согласных в финском языке читается довольно прямо.
              Но для новичка важно помнить, что удвоенные согласные тоже имеют
              значение, и их нельзя «съедать» при чтении.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li><strong>k</strong> — обычно чёткое «к»</li>
              <li><strong>t</strong> — чёткое «т»</li>
              <li><strong>p</strong> — чёткое «п»</li>
              <li><strong>j</strong> — чаще звучит как «й»</li>
              <li><strong>v</strong> — близко к русскому «в»</li>
              <li><strong>h</strong> — слышимое «х»</li>
            </ul>

            <SectionTitle className="mt-10">
              Ударение в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Одно из самых удобных правил для новичка: в финском языке ударение
              обычно падает на первый слог. Это заметно упрощает чтение новых слов.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Примеры
              </div>
              <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>SUO</strong>-mi</li>
                <li><strong>KO</strong>-ti</li>
                <li><strong>OP</strong>-pi-a</li>
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Как тренировать финское произношение
            </SectionTitle>

            <ol className="mt-5 space-y-3 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>прочитай слово медленно по слогам</li>
              <li>обрати внимание на первый ударный слог</li>
              <li>проверь, нет ли долгих гласных или двойных согласных</li>
              <li>прочитай слово целиком несколько раз</li>
              <li>вставь его в короткую фразу</li>
            </ol>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Даже 10 минут такой практики в день дают заметный результат уже
              через несколько недель.
            </p>

            <SectionTitle className="mt-10">
              Частые ошибки начинающих
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>игнорировать разницу между одной и двумя буквами</li>
              <li>читать финские слова по правилам английского</li>
              <li>не замечать долгие гласные</li>
              <li>ставить ударение не на первый слог</li>
              <li>учить слова без чтения вслух</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Самая частая проблема — видеть слово глазами, но не проговаривать
              его. В финском языке это особенно мешает, потому что произношение
              тесно связано с написанием.
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
                Что делать после произношения
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Когда базовые правила чтения уже понятны, дальше полезно
                переходить к частотной лексике, алфавиту и стартовым урокам.
                Так произношение перестаёт быть теорией и начинает работать
                внутри реального языка.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/dictionary/common-words"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Перейти к частым словам <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/lessons/finnish-for-beginners"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Вернуться к стартовой странице <ArrowRight className="h-4 w-4" />
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
                    Сложное ли финское произношение для начинающих?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Обычно нет. На старте оно кажется непривычным, но финский
                    выигрывает за счёт логики: слова в основном читаются близко
                    к тому, как пишутся.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Куда падает ударение в финском языке?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    В большинстве случаев ударение падает на первый слог.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Почему важны двойные буквы?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Потому что они обозначают долгий звук или более длинную
                    согласную, а это может менять значение слова.
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
