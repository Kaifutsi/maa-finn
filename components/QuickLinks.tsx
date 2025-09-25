// components/QuickLinks.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, GraduationCap, Languages, ClipboardList, ArrowRight } from "lucide-react";

type TileProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  kbd?: string; // горячая клавиша-подсказка
};

function Tile({ icon, title, subtitle, href, kbd }: TileProps) {
  return (
    <Link
      href={href}
      className="group relative rounded-3xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition"
      aria-label={`${title}: ${subtitle}`}
    >
      {/* лёгкий градиентный блик */}
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-400/10 via-transparent to-indigo-400/10 opacity-0 group-hover:opacity-100 transition" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl grid place-items-center bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</div>
        </div>

        <ArrowRight className="ml-auto w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </div>

      {kbd && (
        <div className="absolute right-3 bottom-3 hidden sm:flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <kbd className="px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">
            {kbd.toUpperCase()}
          </kbd>
        </div>
      )}
    </Link>
  );
}

export default function QuickLinks() {
  // Горячие клавиши: G, L, D, T
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      const go = (href: string) => {
        window.location.href = href;
      };

      switch (e.key.toLowerCase()) {
        case "g":
          go("/grammar");
          break;
        case "l":
          go("/lessons");
          break;
        case "d":
          go("/dictionary");
          break;
        case "t":
          go("/tests");
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tile
          icon={<BookOpen className="w-5 h-5" />}
          title="Грамматика"
          subtitle="Падежи, времена"
          href="/grammar"
          kbd="g"
        />
        <Tile
          icon={<GraduationCap className="w-5 h-5" />}
          title="Уроки"
          subtitle="A1–B1 плейлисты"
          href="/lessons"
          kbd="l"
        />
        <Tile
          icon={<Languages className="w-5 h-5" />}
          title="Словарь"
          subtitle="Темы и карточки"
          href="/dictionary"
          kbd="d"
        />
        <Tile
          icon={<ClipboardList className="w-5 h-5" />}
          title="Тесты"
          subtitle="Проверь себя"
          href="/tests"
          kbd="t"
        />
      </div>
    </section>
  );
}
