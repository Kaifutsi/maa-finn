"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

type NavChild = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  children?: NavChild[];
};

const NAV: NavItem[] = [
  {
    href: "/lessons",
    label: "Уроки",
    children: [
      { href: "/lessons/finnish-for-beginners", label: "Финский для начинающих" },
      { href: "/lessons/finnish-pronunciation", label: "Финское произношение" },
      { href: "/lessons/finnish-alphabet", label: "Финский алфавит" },
    ],
  },
  {
    href: "/grammar",
    label: "Грамматика",
    children: [
      { href: "/grammar/finnish-cases", label: "Падежи финского языка" },
      { href: "/grammar/finnish-verbs", label: "Финские глаголы" },
      { href: "/grammar/finnish-vowel-harmony", label: "Гармония гласных" },
    ],
  },
  {
    href: "/dictionary",
    label: "Словарь",
    children: [
      { href: "/dictionary/common-words", label: "Частые слова" },
    ],
  },
  {
    href: "/tests",
    label: "Тесты",
  },
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownCloseTimer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement | null)?.isContentEditable;

      if (!typing && ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === "Escape") {
        setMenuOpen(false);
        setOpenDesktopDropdown(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = () => {
    const q = query.trim();
    router.push(`/lessons${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setMenuOpen(false);
    setOpenDesktopDropdown(null);
  };

  const openDropdown = (href: string) => {
    if (dropdownCloseTimer.current) {
      window.clearTimeout(dropdownCloseTimer.current);
    }
    setOpenDesktopDropdown(href);
  };

  const closeDropdownSoon = () => {
    dropdownCloseTimer.current = window.setTimeout(() => {
      setOpenDesktopDropdown(null);
    }, 120);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActivePath(pathname, item.href);

    if (!item.children?.length) {
      return (
        <Link
          className={[
            "px-3 py-2 rounded-xl transition text-sm",
            active
              ? "bg-sky-600 text-white"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
          ].join(" ")}
          href={item.href}
          onClick={() => {
            setMenuOpen(false);
            setOpenDesktopDropdown(null);
          }}
          aria-current={active ? "page" : undefined}
        >
          {item.label}
        </Link>
      );
    }

    return (
      <div
        className="relative"
        onMouseEnter={() => openDropdown(item.href)}
        onMouseLeave={closeDropdownSoon}
      >
        <button
          type="button"
          className={[
            "inline-flex items-center gap-1 px-3 py-2 rounded-xl transition text-sm",
            active
              ? "bg-sky-600 text-white"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
          ].join(" ")}
          onClick={() =>
            setOpenDesktopDropdown((prev) => (prev === item.href ? null : item.href))
          }
          aria-expanded={openDesktopDropdown === item.href}
        >
          <span>{item.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {openDesktopDropdown === item.href && (
          <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-1">
              <Link
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-900"
                onClick={() => setOpenDesktopDropdown(null)}
              >
                Все материалы раздела
              </Link>

              {item.children.map((child) => {
                const childActive = isActivePath(pathname, child.href);

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={[
                      "rounded-xl px-3 py-2 text-sm transition",
                      childActive
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900",
                    ].join(" ")}
                    onClick={() => setOpenDesktopDropdown(null)}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link
          href="/"
          className="flex items-center gap-3 group shrink-0"
          aria-label="На главную"
          onClick={() => {
            setMenuOpen(false);
            setOpenDesktopDropdown(null);
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-white shadow grid place-items-center transition group-hover:ring-2 ring-sky-300 overflow-hidden">
            <img
              src="/logo_maafinn.JPG"
              alt="MaaFinn logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-xl font-bold tracking-tight transition group-hover:underline underline-offset-4 decoration-sky-400/60">
              MaaFinn
            </div>
            <p className="text-xs text-slate-500 -mt-1">Suomen kieli • Финский язык</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm ml-4">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://www.instagram.com/maa__finn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-900/40 text-slate-600 hover:text-pink-600 transition"
            aria-label="Instagram MaaFinn"
            title="Мы в Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </a>

          <div className="relative hidden sm:flex items-center">
            <Search className="w-4 h-4 absolute left-3 pointer-events-none text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              className="pl-9 pr-12 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-300 w-60"
              placeholder="Поиск по урокам…"
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

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 pointer-events-none text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                className="pl-9 pr-20 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-300 w-full"
                placeholder="Поиск по урокам…"
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

            <nav className="flex flex-col gap-2">
              {NAV.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <div key={item.href} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Link
                      href={item.href}
                      className={[
                        "block px-4 py-3 font-medium",
                        active
                          ? "bg-sky-600 text-white"
                          : "bg-white dark:bg-slate-950 text-slate-900 dark:text-white",
                      ].join(" ")}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>

                    {item.children?.length ? (
                      <div className="bg-slate-50 dark:bg-slate-900/70 px-2 py-2 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <a
              href="https://www.instagram.com/maa__finn/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-900/50"
              aria-label="Instagram MaaFinn"
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
