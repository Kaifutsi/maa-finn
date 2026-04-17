import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Languages,
  GraduationCap,
  PenTool,
  Waves,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Гармония гласных в финском языке: простое объяснение и примеры",
  description:
    "Разберитесь, что такое гармония гласных в финском языке. Простое объяснение, примеры слов, правила ä, ö, y и как не делать ошибки.",
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
    description: "Перед гармонией важно понимать гласные буквы и их звучание.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: "/grammar/finnish-verbs",
    title: "Финские глаголы",
    description: "Гармония гласных влияет на окончания глаголов.",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    href: "/dictionary/common-words",
    title: "Частые слова",
    description: "Лучший способ понять гармонию — смотреть на реальные слова.",
    icon: <Languages className="h-5 w-5" />,
  },
  {
    href: "/lessons/finnish-for-beginners",
    title: "Финский для начинающих",
    description: "Полная база для старта и понимания структуры языка.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
];

const backVowels = ["a", "o", "u"];
const frontVowels = ["ä", "ö", "y"];
const neutralVowels = ["e", "i"];

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
              <Waves className="h-3.5 w-3.5" />
              Базовая грамматика финского
            </div>

            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight text-slate-950 dark:text-white">
              Гармония гласных:{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                как работают окончания в финском языке
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300 leading-8">
              Гармония гласных — одна из самых важных и одновременно простых
              тем в финском языке. Если понять этот принцип, становится
              намного легче разбирать слова, окончания и грамматику в целом.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dictionary/common-words"
                className="px-5 py-3 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                Смотреть примеры слов
              </Link>

              <Link
                href="/grammar/finnish-verbs"
                className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700"
              >
                Перейти к глаголам
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <SectionTitle>Связанные темы</SectionTitle>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  {card.icon}
                  <div className="font-semibold">{card.title}</div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">

            <SectionTitle>Что такое гармония гласных</SectionTitle>

            <p className="mt-4 text-slate-700 dark:text-slate-300 leading-8">
              В финском языке слова строятся так, чтобы гласные внутри слова
              сочетались друг с другом. Это правило называется гармонией
              гласных. Оно влияет на окончания слов, формы глаголов и падежи.
            </p>

            <SectionTitle className="mt-10">3 группы гласных</SectionTitle>

            <div className="mt-5 space-y-4">

              <div className="p-4 rounded-2xl border">
                <b>Задние гласные</b>: {backVowels.join(", ")}
                <p className="mt-2 text-sm">Пример: talo (дом)</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <b>Передние гласные</b>: {frontVowels.join(", ")}
                <p className="mt-2 text-sm">Пример: kylä (деревня)</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <b>Нейтральные</b>: {neutralVowels.join(", ")}
                <p className="mt-2 text-sm">Могут использоваться в любых словах</p>
              </div>

            </div>

            <SectionTitle className="mt-10">Главное правило</SectionTitle>

            <p className="mt-4 text-slate-700 dark:text-slate-300 leading-8">
              В одном слове обычно используются либо задние гласные (a, o, u),
              либо передние (ä, ö, y). Они не смешиваются.
            </p>

            <ul className="mt-5 space-y-2">
              <li>talo → talossa</li>
              <li>kylä → kylässä</li>
            </ul>

            <SectionTitle className="mt-10">Почему это важно</SectionTitle>

            <ul className="mt-5 space-y-3">
              <li className="flex gap-2"><CheckCircle2 /> влияет на окончания</li>
              <li className="flex gap-2"><CheckCircle2 /> помогает читать слова</li>
              <li className="flex gap-2"><CheckCircle2 /> упрощает грамматику</li>
            </ul>

            <SectionTitle className="mt-10">Частые ошибки</SectionTitle>

            <ul className="mt-5 space-y-2">
              <li>смешивание ä и a в одном слове</li>
              <li>игнорирование правил окончаний</li>
              <li>запоминание без примеров</li>
            </ul>

          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            <div className="p-5 rounded-3xl border">
              <b>Быстрый маршрут</b>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/lessons/finnish-alphabet">Алфавит</Link>
                <Link href="/grammar/finnish-verbs">Глаголы</Link>
                <Link href="/dictionary/common-words">Слова</Link>
              </div>
            </div>

            <div className="p-5 rounded-3xl border">
              <b>FAQ</b>

              <div className="mt-4 text-sm space-y-4">
                <div>
                  <b>Сложная ли тема?</b>
                  <p>Нет, это одно из самых простых правил финского языка.</p>
                </div>

                <div>
                  <b>Нужно ли учить сразу?</b>
                  <p>Да, это сильно упрощает дальнейшее обучение.</p>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
