import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

const footerSections = [
  {
    title: "Обучение",
    links: [
      { href: "/lessons", label: "Все уроки" },
      { href: "/lessons/finnish-for-beginners", label: "Финский для начинающих" },
      { href: "/lessons/finnish-pronunciation", label: "Финское произношение" },
      { href: "/lessons/finnish-alphabet", label: "Финский алфавит" },
    ],
  },
  {
    title: "Грамматика",
    links: [
      { href: "/grammar", label: "Все темы по грамматике" },
      { href: "/grammar/finnish-cases", label: "Падежи финского языка" },
      { href: "/grammar/finnish-verbs", label: "Финские глаголы" },
      { href: "/grammar/finnish-vowel-harmony", label: "Гармония гласных" },
    ],
  },
  {
    title: "Словарь и практика",
    links: [
      { href: "/dictionary", label: "Словарь" },
      { href: "/dictionary/common-words", label: "Частые слова" },
      { href: "/tests", label: "Тесты" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-10 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Верхняя строка */}
        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              MaaFinn
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Платформа для изучения финского языка: уроки, грамматика, словарь,
              карточки, тесты и тренажёры для начинающих.
            </p>
          </div>

          <a
            href="https://www.instagram.com/maa__finn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Instagram MaaFinn"
            title="Мы в Instagram"
          >
            <FaInstagram className="h-4 w-4" />
            <span>@maa__finn</span>
          </a>
        </div>

        {/* Горизонтальные блоки */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {footerSections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                {section.title}
              </h3>

              <nav className="mt-4 flex flex-col gap-3 text-sm">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-600 transition hover:text-sky-700 hover:underline underline-offset-4 dark:text-slate-300 dark:hover:text-sky-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Нижняя строка */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} MaaFinn. Все права защищены.</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="hover:underline underline-offset-4">
              Главная
            </Link>
            <a href="#" className="hover:underline underline-offset-4">
              Политика
            </a>
            <a href="#" className="hover:underline underline-offset-4">
              Контакты
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
