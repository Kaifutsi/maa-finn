import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <p className="text-slate-600 dark:text-slate-300">
          © {new Date().getFullYear()} <b>maa_finn</b>. Все права защищены.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/maa__finn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/40 transition"
            aria-label="Instagram maa_finn"
            title="Мы в Instagram"
          >
            <FaInstagram className="w-4 h-4" />
            <span>@maa__finn</span>
          </a>

          <nav className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:underline">Политика</a>
            <a href="#" className="hover:underline">Контакты</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
