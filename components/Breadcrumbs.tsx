"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  href: string;
  label: string;
};

const labelMap: Record<string, string> = {
  lessons: "Уроки",
  grammar: "Грамматика",
  dictionary: "Словарь",
  tests: "Тесты",

  "finnish-for-beginners": "Финский для начинающих",
  "finnish-pronunciation": "Финское произношение",
  "finnish-alphabet": "Финский алфавит",

  "finnish-cases": "Падежи финского языка",
  "finnish-verbs": "Финские глаголы",
  "finnish-vowel-harmony": "Гармония гласных",

  "common-words": "Частые слова на финском",
  "beginner-test": "Тест для начинающих",
  "basic-words-test": "Тест на базовые слова",
  "finnish-cases-test": "Тест по падежам",
};

function prettifySegment(segment: string) {
  return (
    labelMap[segment] ||
    decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return {
      href,
      label: prettifySegment(segment),
    };
  });

  return (
    <nav
      aria-label="Хлебные крошки"
      className="max-w-6xl mx-auto px-4 pt-4"
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            <span>Главная</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="inline-flex items-center gap-1">
              <ChevronRight className="h-4 w-4 shrink-0" />
              {isLast ? (
                <span className="rounded-lg px-2 py-1 text-slate-900 dark:text-white font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
