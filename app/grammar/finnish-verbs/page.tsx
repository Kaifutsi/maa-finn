import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Languages,
  PenTool,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Финские глаголы для начинающих: основы, формы и примеры",
  description:
    "Разберите финские глаголы с нуля. Базовые формы, самые нужные глаголы, простые примеры, спряжение и советы для начинающих.",
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
    description: "Общий маршрут для старта и понимание, в каком порядке учить темы.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова на финском",
    description: "Базовая лексика, на которой удобно тренировать глаголы и фразы.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-cases",
    title: "Падежи финского языка",
    description: "Глаголы особенно хорошо раскрываются вместе с падежами и примерами.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-pronunciation",
    title: "Финское произношение",
    description: "Чтобы глаголы лучше запоминались, важно сразу читать их правильно.",
    icon: <PenTool className="h-5 w-5" />,
  },
];

const topVerbs = [
  ["olla", "быть"],
  ["mennä", "идти / ехать"],
  ["tulla", "приходить / приезжать"],
  ["asua", "жить / проживать"],
  ["haluta", "хотеть"],
  ["puhua", "говорить"],
  ["nähdä", "видеть"],
  ["tehdä", "делать"],
  ["syödä", "есть"],
  ["juoda", "пить"],
];

const ollaRows = [
  ["minä olen", "я есть / я нахожусь"],
  ["sinä olet", "ты есть"],
  ["hän on", "он / она есть"],
  ["me olemme", "мы есть"],
  ["te olette", "вы есть"],
  ["he ovat", "они есть"],
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

function VerbCard({
  verb,
  translation,
}: {
  verb: string;
  translation: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="text-lg font-bold text-slate-900 dark:text-white">{verb}</div>
      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{translation}</div>
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
              <Workflow className="h-3.5 w-3.5" />
              Базовые глаголы и формы
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl dark:text-white">
              Финские глаголы:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                основы, формы и простые примеры для начинающих
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
              Финские глаголы — одна из ключевых тем для тех, кто начинает учить
              язык. Именно глаголы помогают переходить от отдельных слов к
              полноценным фразам и простым предложениям. Даже если словарный
              запас пока небольшой, знание базовых глаголов уже позволяет
              сказать очень многое.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dictionary/common-words"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-sky-700 transition"
              >
                Сначала частые слова
              </Link>

              <Link
                href="/tests/beginner-test"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
              >
                Проверить базовый уровень
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
              Темы, которые усиливают глаголы
            </SectionTitle>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Глаголы особенно хорошо запоминаются, когда ты изучаешь их не
              отдельно, а вместе с базовой лексикой, простыми предложениями,
              произношением и стартовой грамматикой.
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
            <SectionTitle>Почему финские глаголы важно учить в самом начале</SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Новички часто концентрируются только на словах-существительных и
              переводах. Но без глаголов язык не начинает работать. Именно они
              помогают сказать, кто что делает, куда кто идёт, что человек
              хочет, видит, знает или чувствует.
            </p>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>глаголы связывают слова в предложения</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>они дают возможность говорить о действиях и планах</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>с ними язык быстрее начинает ощущаться живым</span>
              </li>
            </ul>

            <SectionTitle className="mt-10">
              Что такое начальная форма глагола
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Как и во многих языках, у финского глагола есть словарная форма.
              Именно в таком виде глагол обычно даётся в списках слов и словарях.
              Для новичка важно сначала привыкнуть к этим базовым формам, а уже
              потом переходить к изменениям по лицам и числам.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topVerbs.map(([verb, translation]) => (
                <VerbCard key={verb} verb={verb} translation={translation} />
              ))}
            </div>

            <SectionTitle className="mt-10">
              Какие финские глаголы учить в первую очередь
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Самый практичный подход — начинать с самых употребительных
              глаголов, которые постоянно встречаются в учебных текстах,
              диалогах и бытовой речи. Эти глаголы дают хорошую основу для
              повседневных фраз и простых предложений.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Глаголы, с которых удобно начать
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-slate-700 dark:text-slate-300">
                {topVerbs.map(([verb, translation]) => (
                  <li key={`top-${verb}`}>
                    <strong>{verb}</strong> — {translation}
                  </li>
                ))}
              </ul>
            </div>

            <SectionTitle className="mt-10">
              Примеры простых предложений с финскими глаголами
            </SectionTitle>

            <ul className="mt-5 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Minä olen täällä. - Я здесь.</li>
              <li>Minä menen kouluun. - Я иду в школу.</li>
              <li>Hän tulee kotiin. - Он или она приходит домой.</li>
              <li>Me asumme Suomessa. - Мы живём в Финляндии.</li>
              <li>Minä haluan kahvia. - Я хочу кофе.</li>
              <li>Sinä puhut suomea. - Ты говоришь по-фински.</li>
              <li>Minä näen talon. - Я вижу дом.</li>
              <li>Me teemme ruokaa. - Мы готовим еду.</li>
              <li>Minä syön omenan. - Я ем яблоко.</li>
              <li>Minä juon vettä. - Я пью воду.</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Даже эти короткие примеры уже показывают, как глаголы работают
              в живом языке и как быстро с их помощью можно переходить к
              практике.
            </p>

            <SectionTitle className="mt-10">
              Как меняются глаголы в финском языке
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Финские глаголы меняются в зависимости от лица и числа. То есть
              форма будет отличаться в зависимости от того, говорим ли мы «я»,
              «ты», «он», «мы» и так далее. Для начала достаточно понять сам
              принцип: словарная форма — это только основа, а в предложении
              глагол обычно будет уже немного изменён.
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Форма</th>
                    <th className="px-4 py-3 text-left font-semibold">Перевод</th>
                  </tr>
                </thead>
                <tbody>
                  {ollaRows.map(([form, translation]) => (
                    <tr
                      key={form}
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-4 py-3">{form}</td>
                      <td className="px-4 py-3">{translation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Глагол <strong>olla</strong> — один из самых важных в финском
              языке, и его полезно выучить одним из первых.
            </p>

            <SectionTitle className="mt-10">
              Нужно ли сразу учить все типы финских глаголов
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Нет. Для начинающего это только перегружает голову. На старте
              важнее знать самые частые глаголы, видеть их в предложениях,
              понимать базовые формы настоящего времени и постепенно привыкать
              к изменениям окончаний.
            </p>

            <SectionTitle className="mt-10">
              Финские глаголы в настоящем времени
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              Настоящее время — лучший старт для новичка. Именно с него обычно
              и начинают, потому что оно чаще всего используется в простых
              учебных примерах и помогает быстро выйти на базовый уровень
              общения.
            </p>

            <ul className="mt-5 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Minä asun Helsingissä. - Я живу в Хельсинки.</li>
              <li>Sinä puhut hyvin. - Ты говоришь хорошо.</li>
              <li>Hän syö nyt. - Он или она сейчас ест.</li>
              <li>Me juomme kahvia. - Мы пьём кофе.</li>
            </ul>

            <SectionTitle className="mt-10">
              Отрицательная форма глаголов
            </SectionTitle>

            <p className="mt-4 text-slate-700 leading-8 dark:text-slate-300">
              В финском языке отрицание строится по своей логике. Это может
              казаться непривычным, но на практике система довольно регулярная.
            </p>

            <ul className="mt-5 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Minä en puhu. - Я не говорю.</li>
              <li>Hän ei tule. - Он или она не приходит.</li>
              <li>Me emme tiedä. - Мы не знаем.</li>
            </ul>

            <SectionTitle className="mt-10">
              Как быстрее запоминать финские глаголы
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>учи глагол сразу с короткой фразой</li>
              <li>не запоминай только перевод в отрыве от примера</li>
              <li>повторяй самые частые глаголы каждый день</li>
              <li>читай предложения вслух</li>
              <li>связывай глаголы с повседневными ситуациями</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Например, вместо сухого «syödä - есть» полезнее сразу помнить
              фразу <strong>Minä syön ruokaa</strong>. Так глагол начинает
              восприниматься как часть живого языка, а не как отдельный
              элемент из списка.
            </p>

            <SectionTitle className="mt-10">
              Частые ошибки начинающих
            </SectionTitle>

            <ul className="mt-5 space-y-3 text-slate-700 dark:text-slate-300">
              <li>учить слишком много глаголов сразу</li>
              <li>не повторять формы в предложениях</li>
              <li>игнорировать отрицательные конструкции</li>
              <li>пытаться сразу разобраться во всех типах спряжения</li>
              <li>учить глаголы только через перевод, без контекста</li>
            </ul>

            <p className="mt-5 text-slate-700 leading-8 dark:text-slate-300">
              Намного полезнее хорошо освоить 10-20 базовых глаголов, чем
              поверхностно знать десятки редких.
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
                  href="/dictionary/common-words"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Частые слова на финском
                </Link>

                <Link
                  href="/grammar/finnish-cases"
                  className="rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50"
                >
                  Падежи финского языка
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
                Что изучать вместе с глаголами
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Глаголы особенно хорошо работают в связке с частотной лексикой,
                произношением и базовой грамматикой. Поэтому после этой страницы
                полезно двигаться по связанным материалам.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/dictionary/common-words"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Перейти к частым словам <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/grammar/finnish-cases"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
                >
                  Разобрать падежи <ArrowRight className="h-4 w-4" />
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
                    Какие финские глаголы учить в первую очередь?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Лучше всего начать с самых частых глаголов: olla, mennä,
                    tulla, asua, haluta, puhua, tehdä, syödä и juoda.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Сложные ли финские глаголы для начинающих?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    На старте они могут казаться непривычными из-за форм и
                    окончаний, но если учить их через короткие примеры, тема
                    становится заметно проще.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Нужно ли сразу учить все формы?
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Нет. Для начала достаточно словарной формы, нескольких
                    базовых глаголов и простых форм настоящего времени.
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
