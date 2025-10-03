"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/lessons", label: "Уроки" },
  { href: "/grammar", label: "Грамматика" },
  { href: "/dictionary", label: "Словарь" },
  { href: "/tests", label: "Тесты" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setMenuOpen(false);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // search submit -> /lessons?q=
  const submitSearch = () => {
    const q = query.trim();
    router.push(`/lessons${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setMenuOpen(false);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname?.startsWith(item.href);
    return (
      <Link
        className={[
          "px-3 py-2 rounded-xl transition",
          active ? "bg-sky-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800",
        ].join(" ")}
        href={item.href}
        onClick={() => setMenuOpen(false)}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="На главную">
          <div className="w-10 h-10 rounded-2xl bg-white shadow grid place-items-center transition group-hover:ring-2 ring-sky-300 overflow-hidden">
            {/* логотип во весь контейнер */}
            <img
              src="/logo_maafinn.JPG"
              alt="MaaFinn logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight transition group-hover:underline underline-offset-4 decoration-sky-400/60">
              maa_finn
            </h1>
            <p className="text-xs text-slate-500 -mt-1">Suomen kieli • Финский язык</p>
          </div>
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-sm ml-4">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Instagram link (desktop) */}
          <a
            href="https://www.instagram.com/maa__finn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-900/40 text-slate-600 hover:text-pink-600 transition"
            aria-label="Instagram maa_finn"
            title="Мы в Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </a>

          {/* search */}
          <div className="relative hidden sm:flex items-center">
            <Search className="w-4 h-4 absolute left-3 pointer-events-none text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              className="pl-9 pr-12 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-300 w-56"
              placeholder="Поиск… (⌘/Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              aria-label="Поиск"
            />
            <button
              className="absolute right-1 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={submitSearch}
            >
              Найти
            </button>
          </div>
        </div>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            {/* search (mobile) */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 pointer-events-none text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                className="pl-9 pr-20 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-300 w-full"
                placeholder="Поиск… (⌘/Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                aria-label="Поиск"
              />
              <button
                className="absolute right-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={submitSearch}
              >
                Найти
              </button>
            </div>

            <nav className="pt-2 grid grid-cols-2 gap-2">
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            {/* Instagram link (mobile) */}
            <a
              href="https://www.instagram.com/maa__finn/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-900/50"
              aria-label="Instagram maa_finn"
              title="Мы в Instagram"
            >
              <FaInstagram className="w-4 h-4" />
              <span>@maa__finn</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
