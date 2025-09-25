"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { X, ArrowRight, Info, Star, Shuffle, Filter } from "lucide-react";
import { grammarCards } from "@/data/grammar";

/* ========== types / helpers ========== */
type Card = {
  id: number;
  title: string;
  description: string;
  tags?: string[];
  image?: string;
  examples?: string[];

  backImage?: string;
  backTitle?: string;
  backDescription?: string;
  backExamples?: string[];
};

// мини-FlipCard без 3D
function FlipCard({
  className = "",
  back,
  children,
}: {
  className?: string;
  back: React.ReactNode;
  children: React.ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((v) => !v);
  const onKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={onKey}
      aria-pressed={flipped}
    >
      <div className="h-full">
        <div className={flipped ? "hidden" : "block h-full"}>{children}</div>
        <div className={flipped ? "block h-full" : "hidden"}>{back}</div>
      </div>
    </div>
  );
}

const shuffleArr = <T,>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map((x) => x[1]);

function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQ = (searchParams.get("q") ?? "").trim();
  const initialTag = (searchParams.get("tag") ?? "").trim();
  const initialSort = (searchParams.get("sort") ?? "relevance").trim();

  const [q, setQ] = useState(initialQ);
  const [tag, setTag] = useState<string>(initialTag);
  const [sort, setSort] = useState<"relevance" | "alpha" | "shuffle">(
    (initialSort as any) || "relevance"
  );
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Card | null>(null);

  // избранные правила и фильтр по ним
  const [favs, setFavs] = useState<number[]>([]);
  const [onlyFavs, setOnlyFavs] = useState(false);

  // загрузка UX-настроек
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("grammar_ui") || "{}");
      if (s.onlyFavs) setOnlyFavs(true);
      if (s.sort && ["relevance", "alpha", "shuffle"].includes(s.sort)) setSort(s.sort);
      if (s.tag) setTag(s.tag);
      const f = JSON.parse(localStorage.getItem("grammar_favs") || "[]");
      if (Array.isArray(f)) setFavs(f);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("grammar_ui", JSON.stringify({ onlyFavs, sort, tag }));
    } catch {}
  }, [onlyFavs, sort, tag]);

  useEffect(() => {
    try {
      localStorage.setItem("grammar_favs", JSON.stringify(favs));
    } catch {}
  }, [favs]);

  // URL → state on soft nav
  useEffect(() => {
    setQ((searchParams.get("q") ?? "").trim());
    setTag((searchParams.get("tag") ?? "").trim());
    setSort(((searchParams.get("sort") ?? "relevance") as any) || "relevance");
    setPage(1);
  }, [searchParams]);

  // state → URL (debounced)
  const dRef = useRef<any>(null);
  useEffect(() => {
    if (dRef.current) clearTimeout(dRef.current);
    dRef.current = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (tag) p.set("tag", tag);
      if (sort !== "relevance") p.set("sort", sort);
      router.replace(`${pathname}?${p.toString()}`);
    }, 250);
    return () => clearTimeout(dRef.current);
  }, [q, tag, sort, pathname, router]);

  const tags = useMemo(
    () =>
      Array.from(
        new Set(
          (grammarCards as Card[]).flatMap((c) => (c.tags && c.tags.length ? c.tags : []))
        )
      ).sort(),
    []
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let res = (grammarCards as Card[]).filter((c) => {
      const hitQ =
        !t ||
        c.title.toLowerCase().includes(t) ||
        c.description.toLowerCase().includes(t) ||
        (c.examples || []).some((e: string) => e.toLowerCase().includes(t));
      const hitTag = !tag || (c.tags || []).includes(tag);
      const hitFav = !onlyFavs || favs.includes(c.id);
      return hitQ && hitTag && hitFav;
    });

    if (sort === "alpha") res = [...res].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "shuffle") res = shuffleArr(res);
    return res;
  }, [q, tag, sort, onlyFavs, favs]);

  const pageSize = 9;
  const visible = filtered.slice(0, page * pageSize);
  const canLoadMore = visible.length < filtered.length;

  // авто-подгрузка по скроллу
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && canLoadMore) setPage((p) => p + 1);
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [canLoadMore]);

  const toggleFav = (id: number) =>
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const modalSrc = open?.backImage ?? open?.image;

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-12">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Грамматика</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-prose">
          Баннеры и карточки с правилами. Нажми на карточку — переворот с пояснениями и примерами.
        </p>
      </section>

      {/* Фильтры (sticky) */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40">
        <section className="max-w-6xl mx-auto px-4 py-3 grid gap-3 md:grid-cols-[1fr,auto,auto,auto]">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Поиск: пассив, имперфект, -US/YS…"
            className="flex-1 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-500"
            aria-label="Поиск по правилам"
          />

          <select
            value={tag}
            onChange={(e) => {
              setPage(1);
              setTag(e.target.value);
            }}
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60"
            aria-label="Фильтр по тегу"
          >
            <option value="">Все теги</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60"
            aria-label="Сортировка"
          >
            <option value="relevance">По релевантности</option>
            <option value="alpha">По алфавиту</option>
            <option value="shuffle">Случайно</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 ${
                onlyFavs
                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onClick={() => setOnlyFavs((v) => !v)}
              title="Только избранное"
            >
              <Star className="w-4 h-4" /> Избранное
            </button>
            <button
              className="px-3 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
              onClick={() => setSort("shuffle")}
              title="Перемешать"
            >
              <Shuffle className="w-4 h-4" /> Перемешать
            </button>
          </div>

          {/* Чипы под фильтрами */}
          <div className="md:col-span-4 mt-2 flex flex-wrap gap-2">
            {tags.slice(0, 12).map((t) => (
              <button
                key={t}
                className={`px-3 py-1.5 rounded-2xl border text-sm hover:bg-white/60 dark:hover:bg-slate-900/40 transition ${
                  tag === t
                    ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                    : "border-slate-300 dark:border-slate-700"
                }`}
                onClick={() => {
                  setPage(1);
                  setTag(tag === t ? "" : t);
                }}
              >
                {t}
              </button>
            ))}
            {(tag || q) && (
              <button
                className="px-3 py-1.5 rounded-2xl border border-rose-300 text-rose-700 dark:border-rose-900/40 dark:text-rose-200"
                onClick={() => {
                  setTag("");
                  setQ("");
                }}
                title="Сбросить фильтры"
              >
                <X className="inline w-4 h-4 mr-1" /> Сбросить
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Сетка карточек */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {visible.length === 0 && (
          <div className="col-span-full text-slate-500 dark:text-slate-400">
            Ничего не найдено. Измени запрос или тег.
          </div>
        )}

        {visible.map((card: Card) => {
          const fav = favs.includes(card.id);
          const backSrc = card.backImage ?? card.image;
          return (
            <FlipCard
              key={card.id}
              className="group h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm transition duration-200 hover:shadow-md hover:-translate-y-0.5"
              back={
                <div className="flex h-full flex-col">
                {backSrc && (
                  <Image
                    src={backSrc}
                    alt={card.backTitle ?? card.title}
                    width={900}
                    height={520}
                    className="w-full h-auto object-cover rounded-t-3xl transition group-hover:scale-[1.01]"
                  />
                )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg leading-snug line-clamp-2">
                        {card.backTitle || card.title}
                      </h4>
                      <button
                        className={`ml-auto inline-flex items-center justify-center rounded-full p-1.5 border ${
                          fav
                            ? "border-amber-400 text-amber-500"
                            : "border-slate-300 text-slate-500 dark:border-slate-700"
                        }`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          toggleFav(card.id);
                        }}
                        title={fav ? "Убрать из избранного" : "В избранное"}
                        aria-pressed={fav}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>

                    {card.backDescription && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {card.backDescription}
                      </p>
                    )}

                    {card.backExamples && card.backExamples.length > 0 && (
                      <ul className="mt-auto list-disc pl-5 space-y-1 text-sm">
                        {card.backExamples.slice(0, 4).map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    )}

                    <button
                      className="mt-3 self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setOpen(card);
                      }}
                    >
                      Подробнее <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              }
            >
              <div className="flex h-full flex-col">
                {card.image && (
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={900}
                    height={520}
                    className="w-full h-auto object-cover rounded-t-3xl transition group-hover:scale-[1.01]"
                  />
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1.5">
                    {(card.tags || []).slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="mt-2 text-xl font-bold leading-snug line-clamp-2">
                    {card.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>

                  {card.examples?.length ? (
                    <ul className="mt-auto list-disc pl-5 space-y-1 text-sm">
                      {card.examples.slice(0, 4).map((ex: string, i: number) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-auto text-xs text-slate-500">Нажми, чтобы открыть пояснения ↺</div>
                  )}
                </div>
              </div>
            </FlipCard>
          );
        })}

        {/* кнопка «ещё» + сенсор для автоподгрузки */}
        {canLoadMore && (
          <div className="col-span-full flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
            >
              Показать ещё <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        <div ref={sentinelRef} className="h-px col-span-full" />
      </section>

      {/* Study mode */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Тренажёр: узнай правило</h3>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              На основе текущей выборки: {filtered.length}
              <button
                className="ml-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40 text-xs"
                onClick={() => setSort("shuffle")}
                title="Перемешать"
              >
                <Shuffle className="w-4 h-4" /> Перемешать
              </button>
            </div>
          </div>
          <Study words={filtered as Card[]} />
        </div>
      </section>

      <Footer />

      {/* Modal details */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            {modalSrc && (
              <Image
                src={modalSrc}
                alt={open.backTitle ?? open.title}
                width={1200}
                height={700}
                className="w-full h-auto object-cover"
              />
            )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-extrabold">
                      {open.backTitle || open.title}
                    </h3>
                    {open.backDescription && (
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {open.backDescription}
                      </p>
                    )}
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-2 shadow hover:scale-105 transition"
                    onClick={() => setOpen(null)}
                    aria-label="Закрыть"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {open.backExamples?.length ? (
                  <ul className="mt-4 list-disc pl-5 space-y-1 text-sm">
                    {open.backExamples.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STUDY
========================= */
function Study({ words }: { words: Card[] }) {
  const list = words.length ? words : (grammarCards as Card[]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const item = list[i % list.length];
  if (!item) return null;

  const hint = item.examples?.[0] || item.description;

  // hotkeys: Space — показать, Enter — дальше
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        (el as any)?.isContentEditable;
      if (typing) return;
      if (e.key === " ") {
        e.preventDefault();
        setRevealed(true);
      } else if (e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, revealed]);

  const next = () => {
    setAnswered((x) => x + 1);
    if (revealed) setScore((s) => s + 1);
    setRevealed(false);
    setI((x) => x + 1);
  };

  return (
    <div className="grid md:grid-cols-[1fr,auto] gap-4 items-start">
      <div>
        <div className="text-sm text-slate-500">Тема:</div>
        <h4 className="text-2xl font-extrabold mt-1">{item.title}</h4>
        <div className="mt-2 text-slate-600 dark:text-slate-300">
          {revealed ? (
            item.backDescription || item.description
          ) : (
            <span className="opacity-70">Подсказка: {hint}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-xs text-slate-500">
          Пройдено: <span className="font-semibold">{score}</span> / {answered}
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700"
            onClick={() => setRevealed(true)}
          >
            Показать правило
          </button>
          <button
            className="px-4 py-2 rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
            onClick={next}
          >
            Дальше <ArrowRight className="inline w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">
            Space
          </kbd>
          показать •
          <kbd className="px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">
            Enter
          </kbd>
          дальше
        </div>
      </div>
    </div>
  );
}

export default function GrammarClient() {
  return <PageInner />;
}
