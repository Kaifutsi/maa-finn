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
    <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white/60 dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-[1.1fr,1fr,1fr,1fr]">
          <div>
            <div className="text-lg font-bold">MaaFinn</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-sm">
              Платформа для изучения финского языка: уроки, грамматика, словарь,
              карточки, тесты и тренажёры для начинающих.
            </p>

            <a
              href="https://www.instagram.com/maa__finn/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/40 transition"
              aria-label="Instagram MaaFinn"
              title="Мы в Instagram"
            >
              <FaInstagram className="w-4 h-4" />
              <span>@maa__finn</span>
            </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                {section.title}
              </h3>

              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-600 hover:text-sky-700 hover:underline underline-offset-4 dark:text-slate-300 dark:hover:text-sky-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-slate-500 dark:text-slate-400">
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
