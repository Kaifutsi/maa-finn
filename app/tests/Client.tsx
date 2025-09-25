"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Clock,
  RotateCcw,
  X,
  Trophy,
  BarChart2,
  Shuffle,
  Pause,
  Play,
  Settings,
  Wand2,
  Sparkles,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Scissors,
} from "lucide-react";

/* ===== Типы ===== */
type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number; // индекс правильного варианта
  explanation?: string;
  image?: string; // опционально картинка к вопросу
  tts?: boolean; // озвучивать вопрос/варианты (лексика)
};

type Quiz = {
  id: number;
  title: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
  description?: string;
  cover?: string; // обложка карточки теста
  questions: Question[];
};

/* ===== Автогенератор квизов (всё в этом файле) ===== */
/* ===== Автогенератор квизов (без картинок) ===== */

// утилиты
let __qid = 1000;
const nextId = () => ++__qid;
const pickMany = <T,>(arr: T[], n: number, skipIdx?: number) => {
  const pool = arr.map((x, i) => ({ x, i })).filter(p => p.i !== skipIdx);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map(p => p.x);
};



// темы (можно смело расширять)
const BODY = [
  { fi: "pää", ru: "голова" }, { fi: "käsi", ru: "рука" }, { fi: "jalka", ru: "нога" },
  { fi: "silmä", ru: "глаз" }, { fi: "korva", ru: "ухо" }, { fi: "nenä", ru: "нос" },
  { fi: "suu", ru: "рот" }, { fi: "hammas", ru: "зуб" }, { fi: "polvi", ru: "колено" },
  { fi: "sormi", ru: "палец" }, { fi: "selkä", ru: "спина" }, { fi: "olkapää", ru: "плечо" },
];

const FOOD = [
  { fi: "omena", ru: "яблоко" }, { fi: "leipä", ru: "хлеб" }, { fi: "maito", ru: "молоко" },
  { fi: "voi", ru: "масло" }, { fi: "juusto", ru: "сыр" }, { fi: "kala", ru: "рыба" },
  { fi: "liha", ru: "мясо" }, { fi: "keitto", ru: "суп" }, { fi: "kahvi", ru: "кофе" },
  { fi: "tee", ru: "чай" }, { fi: "peruna", ru: "картофель" }, { fi: "sokeri", ru: "сахар" },
  { fi: "suola", ru: "соль" }, { fi: "kana", ru: "курица" },
];

const CITY = [
  { fi: "kauppa", ru: "магазин" }, { fi: "koulu", ru: "школа" }, { fi: "asema", ru: "станция" },
  { fi: "kirjasto", ru: "библиотека" }, { fi: "puisto", ru: "парк" }, { fi: "pankki", ru: "банк" },
  { fi: "tori", ru: "рынок" }, { fi: "katu", ru: "улица" }, { fi: "silta", ru: "мост" },
  { fi: "poliisi", ru: "полиция" }, { fi: "sairaala", ru: "больница" }, { fi: "ravintola", ru: "ресторан" },
];

const CLOTHES = [
  { fi: "paita", ru: "рубашка" }, { fi: "housut", ru: "штаны" }, { fi: "takki", ru: "куртка" },
  { fi: "hattu", ru: "шляпа" }, { fi: "sukat", ru: "носки" }, { fi: "kengät", ru: "ботинки" },
  { fi: "mekko", ru: "платье" }, { fi: "vyö", ru: "ремень" }, { fi: "huivi", ru: "шарф" },
  { fi: "hanskat", ru: "перчатки" }, { fi: "farkut", ru: "джинсы" }, { fi: "pusero", ru: "кофта" },
];

const FAMILY = [
  { fi: "äiti", ru: "мама" }, { fi: "isä", ru: "папа" }, { fi: "sisko", ru: "сестра" },
  { fi: "veli", ru: "брат" }, { fi: "isoäiti", ru: "бабушка" }, { fi: "isoisä", ru: "дедушка" },
  { fi: "setä", ru: "дядя" }, { fi: "täti", ru: "тётя" }, { fi: "serkku", ru: "двоюродный брат/сестра" },
  { fi: "lapsi", ru: "ребёнок" }, { fi: "vaimo", ru: "жена" }, { fi: "mies", ru: "муж" },
];

const ANIMALS = [
  { fi: "kissa", ru: "кошка" }, { fi: "koira", ru: "собака" }, { fi: "hevonen", ru: "лошадь" },
  { fi: "lehmä", ru: "корова" }, { fi: "kana", ru: "курица" }, { fi: "lammas", ru: "овца" },
  { fi: "sika", ru: "свинья" }, { fi: "kala", ru: "рыба" }, { fi: "lintu", ru: "птица" },
  { fi: "karhu", ru: "медведь" }, { fi: "susi", ru: "волк" }, { fi: "jänis", ru: "заяц" },
  { fi: "poro", ru: "олень" }, { fi: "kettu", ru: "лиса" }, { fi: "orava", ru: "белка" },
  { fi: "mehiläinen", ru: "пчела" }, { fi: "hiiri", ru: "мышь" }, { fi: "siili", ru: "ёж" },
];

const COLORS = [
  { fi: "punainen", ru: "красный" }, { fi: "sininen", ru: "синий" }, { fi: "vihreä", ru: "зелёный" },
  { fi: "keltainen", ru: "жёлтый" }, { fi: "musta", ru: "чёрный" }, { fi: "valkoinen", ru: "белый" },
  { fi: "harmaa", ru: "серый" }, { fi: "ruskea", ru: "коричневый" }, { fi: "oranssi", ru: "оранжевый" },
  { fi: "vaaleanpunainen", ru: "розовый" }, { fi: "turkoosi", ru: "бирюзовый" }, { fi: "violetti", ru: "фиолетовый" },
];

const HOUSE = [
  { fi: "talo", ru: "дом" }, { fi: "huone", ru: "комната" }, { fi: "keittiö", ru: "кухня" },
  { fi: "kylpyhuone", ru: "ванная" }, { fi: "olohuone", ru: "гостиная" }, { fi: "makuuhuone", ru: "спальня" },
  { fi: "ikkuna", ru: "окно" }, { fi: "ovi", ru: "дверь" }, { fi: "sänky", ru: "кровать" },
  { fi: "pöytä", ru: "стол" }, { fi: "tuoli", ru: "стул" }, { fi: "lamppu", ru: "лампа" },
  { fi: "matto", ru: "ковёр" }, { fi: "jääkaappi", ru: "холодильник" },
];

const TRANSPORT = [
  { fi: "auto", ru: "машина" }, { fi: "juna", ru: "поезд" }, { fi: "bussi", ru: "автобус" },
  { fi: "laiva", ru: "корабль" }, { fi: "lentokone", ru: "самолёт" }, { fi: "pyörä", ru: "велосипед" },
  { fi: "taksi", ru: "такси" }, { fi: "metro", ru: "метро" }, { fi: "pysäkki", ru: "остановка" },
  { fi: "asema", ru: "вокзал" }, { fi: "lippu", ru: "билет" }, { fi: "kuljettaja", ru: "водитель" },
];

const WEATHER = [
  { fi: "sää", ru: "погода" }, { fi: "aurinko", ru: "солнце" }, { fi: "pilvi", ru: "облако" },
  { fi: "tuuli", ru: "ветер" }, { fi: "sade", ru: "дождь" }, { fi: "lumi", ru: "снег" },
  { fi: "pakkanen", ru: "мороз" }, { fi: "ukkonen", ru: "гроза" }, { fi: "sumu", ru: "туман" },
  { fi: "lämpötila", ru: "температура" }, { fi: "kuuma", ru: "жарко" }, { fi: "kylmä", ru: "холодно" },
];

const NUMBERS = [
  { fi: "yksi", ru: "один" }, { fi: "kaksi", ru: "два" }, { fi: "kolme", ru: "три" },
  { fi: "neljä", ru: "четыре" }, { fi: "viisi", ru: "пять" }, { fi: "kuusi", ru: "шесть" },
  { fi: "seitsemän", ru: "семь" }, { fi: "kahdeksan", ru: "восемь" }, { fi: "yhdeksän", ru: "девять" },
  { fi: "kymmenen", ru: "десять" }, { fi: "yksitoista", ru: "одиннадцать" }, { fi: "kaksitoista", ru: "двенадцать" },
  { fi: "kolmetoista", ru: "тринадцать" }, { fi: "kaksikymmentä", ru: "двадцать" },
];

const VERBS_BASIC = [
  { fi: "olla", ru: "быть" }, { fi: "mennä", ru: "идти" }, { fi: "tulla", ru: "приходить" },
  { fi: "nähdä", ru: "видеть" }, { fi: "kuulla", ru: "слышать" }, { fi: "syödä", ru: "есть" },
  { fi: "juoda", ru: "пить" }, { fi: "asua", ru: "жить" }, { fi: "puhua", ru: "говорить" },
  { fi: "opiskella", ru: "учиться" }, { fi: "työskennellä", ru: "работать" }, { fi: "ostaa", ru: "покупать" },
  { fi: "rakastaa", ru: "любить" }, { fi: "pelata", ru: "играть" }, { fi: "ajaa", ru: "вести (машину)" },
  { fi: "kirjoittaa", ru: "писать" }, { fi: "lukea", ru: "читать" }, { fi: "nukkua", ru: "спать" },
];

// фабрики лексики (RU→FI и FI→RU), tts включен
function makeVocabRuToFi(list: {fi:string; ru:string}[], title: string): Quiz {
  const questions = list.map((w, idx) => {
    const opts = [...pickMany(list, 3, idx).map(d=>d.fi), w.fi].sort(() => Math.random() - 0.5);
    return {
      id: nextId(),
      question: `Переведи на финский: «${w.ru}»`,
      options: opts,
      correct: opts.indexOf(w.fi),
      explanation: `${w.ru} = ${w.fi}`,
      tts: true,
    };
  });
  return {
    id: nextId(),
    title: `Словарь: ${title} (RU→FI)`,
    level: "A1",
    topic: "лексика",
    description: `Перевод на финский по теме «${title.toLowerCase()}».`,
    questions,
  };
}

function makeVocabFiToRu(list: {fi:string; ru:string}[], title: string): Quiz {
  const questions = list.map((w, idx) => {
    const opts = [...pickMany(list, 3, idx).map(d=>d.ru), w.ru].sort(() => Math.random() - 0.5);
    return {
      id: nextId(),
      question: `Переведи: ${w.fi}`,
      options: opts,
      correct: opts.indexOf(w.ru),
      explanation: `${w.fi} = «${w.ru}»`,
      tts: true,
    };
  });
  return {
    id: nextId(),
    title: `Перевод: ${title} (FI→RU)`,
    level: "A1",
    topic: "лексика",
    description: `Перевод на русский по теме «${title.toLowerCase()}».`,
    questions,
  };
}

// грамматика: пассив имперфекта (A2) — без картинок
function makePassiveImperf(): Quiz {
  const rows = [
    { sent: "Eilen ____ (syödä) kalaa.", correct: "syötiin", hint: "syödä → syötiin" },
    { sent: "Kotitehtävät ____ (tehdä) eilen.", correct: "tehtiin", hint: "tehdä → tehtiin" },
    { sent: "Kahvia ____ (juoda) paljon.", correct: "juotiin", hint: "juoda → juotiin" },
    { sent: "Huone ____ (siivota) aamulla.", correct: "siivottiin", hint: "siivota → siivottiin" },
    { sent: "Elokuva ____ (katsoa) viime viikolla.", correct: "katsottiin", hint: "katsoa → katsottiin" },
    { sent: "Kirje ____ (kirjoittaa) nopeasti.", correct: "kirjoitettiin", hint: "kirjoittaa → kirjoitettiin" },
    { sent: "Juhlat ____ (järjestää) eilen.", correct: "järjestettiin", hint: "järjestää → järjestettiin" },
  ];
  const pool = rows.map(r => r.correct);
  const questions = rows.map(r => {
    const opts = [...pickMany(pool, 3).filter(x => x !== r.correct), r.correct].sort(() => Math.random() - 0.5);
    return {
      id: nextId(),
      question: `Вставь форму (пассив, имперфект): ${r.sent}`,
      options: opts,
      correct: opts.indexOf(r.correct),
      explanation: `${r.hint}. Правильно: ${r.correct}.`,
    };
  });
  return {
    id: nextId(),
    title: "Пассив — имперфект",
    level: "A2",
    topic: "грамматика",
    description: "Как образуется и когда используется пассив в прошедшем времени.",
    questions,
  };
}

// сборка: очень много квизов (две стороны на каждую тему)
const QUIZZES: Quiz[] = [
  // A2
  makePassiveImperf(),

  // A1/A2 лексика (как у тебя было)
  makeVocabRuToFi(BODY, "Части тела"),         makeVocabFiToRu(BODY, "Части тела"),
  makeVocabRuToFi(FOOD, "Еда"),                makeVocabFiToRu(FOOD, "Еда"),
  makeVocabRuToFi(CITY, "Город"),              makeVocabFiToRu(CITY, "Город"),
  makeVocabRuToFi(CLOTHES, "Одежда"),          makeVocabFiToRu(CLOTHES, "Одежда"),
  makeVocabRuToFi(FAMILY, "Семья"),            makeVocabFiToRu(FAMILY, "Семья"),
  makeVocabRuToFi(ANIMALS, "Животные"),        makeVocabFiToRu(ANIMALS, "Животные"),
  makeVocabRuToFi(COLORS, "Цвета"),            makeVocabFiToRu(COLORS, "Цвета"),
  makeVocabRuToFi(HOUSE, "Дом"),               makeVocabFiToRu(HOUSE, "Дом"),
  makeVocabRuToFi(TRANSPORT, "Транспорт"),     makeVocabFiToRu(TRANSPORT, "Транспорт"),
  makeVocabRuToFi(WEATHER, "Погода"),          makeVocabFiToRu(WEATHER, "Погода"),
  makeVocabRuToFi(NUMBERS, "Числа"),           makeVocabFiToRu(NUMBERS, "Числа"),
  makeVocabRuToFi(VERBS_BASIC, "Глаголы A1"),  makeVocabFiToRu(VERBS_BASIC, "Глаголы A1"),

  // B1 грамматика
  makeVerbRectionsB1(),
  makeLocalCasesMovementB1(),
  makeComparativesB1(),
  makePastPerfectB1(),
  makeConditionalB1(),

  // B2 грамматика
  makeAgentParticipleB2(),
  makeParticiplePresentB2(),
  makePassivePerfectB2(),
  makeReportedSpeechB2(),
];


/* ==== B1: Рекции глаголов ==== */
function makeVerbRectionsB1(): Quiz {
  const items = [
    {
      q: "Pidän ___ suklaasta.",
      correct: "todella paljon",
      opts: ["todella paljon", "todella monessa", "todella monella", "todella paljoon"],
      explain: "Рекция pitää + sta/stä по сущ., здесь слово «suklaasta». «Todella paljon» = «очень».",
    },
    {
      q: "Se riippuu ___ säästä.",
      correct: "säästä",
      opts: ["säässä", "sääseen", "säästä", "säältä"],
      explain: "riippua + sta/stä → säästä.",
    },
    {
      q: "Osallistun ___ kilpailuun.",
      correct: "kilpailuun",
      opts: ["kilpailussa", "kilpailuun", "kilpailusta", "kilpailulla"],
      explain: "osallistua + illatiivi (mihin?) → kilpailuun.",
    },
    {
      q: "Tutustuin ___ uuteen naapuriin.",
      correct: "uuteen naapuriin",
      opts: ["uudessa naapurissa", "uuteen naapuriin", "uudesta naapurista", "uudelle naapurille"],
      explain: "tutustua + illatiivi (johonkin) → naapuriin.",
    },
    {
      q: "Se vaikuttaa ___ päätökseen.",
      correct: "päätökseen",
      opts: ["päätöksessä", "päätöksestä", "päätökseen", "päätöksellä"],
      explain: "vaikuttaa + illatiivi (johonkin) → päätökseen.",
    },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return {
      id: nextId(),
      question: it.q,
      options: opts,
      correct: opts.indexOf(it.correct),
      explanation: it.explain,
    };
  });
  return {
    id: nextId(),
    title: "Рекции глаголов 1",
    level: "B1",
    topic: "грамматика",
    description: "Частотные связи глаголов с падежами и послелогами.",
    questions,
  };
}

/* ==== B1: Местные падежи — движение/место ==== */
function makeLocalCasesMovementB1(): Quiz {
  const items = [
    { q: "Menen ___ kouluun.", correct: "kouluun", opts: ["koulussa", "koulusta", "kouluun", "koululle"], explain: "Движение внутрь: illatiivi -Vn → kouluun." },
    { q: "Olen ___ koulussa.", correct: "koulussa", opts: ["koulussa", "kouluun", "koulusta", "koululla"], explain: "Нахожусь внутри: inessiivi -ssa → koulussa." },
    { q: "Tulen ___ koulusta.", correct: "koulusta", opts: ["koulusta", "koulussa", "kouluun", "koululta"], explain: "Движение изнутри: elatiivi -sta → koulusta." },
    { q: "Menemme ___ torille.", correct: "torille", opts: ["torilla", "torille", "torilta", "toriin"], explain: "Движение на поверхность/площадь: allatiivi -lle → torille." },
    { q: "Olen ___ torilla.", correct: "torilla", opts: ["torilla", "torille", "torilta", "torissa"], explain: "Нахожусь на поверхности: adessiivi -lla → torilla." },
    { q: "Lähden ___ torilta.", correct: "torilta", opts: ["torilta", "torille", "torilla", "torista"], explain: "Движение с поверхности: ablatiivi -lta → torilta." },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Местные падежи: движение и место",
    level: "B1",
    topic: "грамматика",
    description: "Illatiivi/inessiivi/elatiivi + allatiivi/adessiivi/ablatiivi.",
    questions,
  };
}

/* ==== B1: Сравнительные и превосходные степени ==== */
function makeComparativesB1(): Quiz {
  const rows = [
    { base: "hyvä", ask: "Выбери правильную сравнительную форму: hyvä → ?", correct: "parempi", wrong: ["hyvempi", "hyvampi", "hyviimpi"] },
    { base: "iso", ask: "Суперлатив: iso → ?", correct: "isoin", wrong: ["isompi", "isommainen", "isoisin"] },
    { base: "kaunis", ask: "Сравнительная: kaunis → ?", correct: "kauniimpi", wrong: ["kaunisempi", "kauneempi", "kauneimpi"] },
    { base: "pieni", ask: "Суперлатив: pieni → ?", correct: "pienin", wrong: ["pienempi", "pieniäin", "pienein"] },
    { base: "pitkä", ask: "Сравнительная: pitkä → ?", correct: "pidempi", wrong: ["pitempi", "pitkämpi", "pidämpi"] },
  ];
  const questions: Question[] = rows.map(r => {
    const opts = shuffle([r.correct, ...r.wrong]);
    return {
      id: nextId(),
      question: r.ask,
      options: opts,
      correct: opts.indexOf(r.correct),
      explanation: `Основа «${r.base}» → форма: ${r.correct}.`,
    };
  });
  return {
    id: nextId(),
    title: "Степени сравнения прилагательных",
    level: "B1",
    topic: "грамматика",
    description: "Сравнительная и превосходная формы частых прилагательных.",
    questions,
  };
}

/* ==== B1: Плюсквамперфект ==== */
function makePastPerfectB1(): Quiz {
  const items = [
    {
      q: "Kun saavuin, he ___ (syödä) jo.",
      correct: "olivat syöneet",
      opts: ["olivat syöneet", "ovat syöneet", "olivat syönyt", "olivat syömässä"],
      explain: "Pluskvamperfekт: olla (imperf.) + активн. прич. прошедш. -nut/-neet → olivat syöneet.",
    },
    {
      q: "Ennen kuin menin nukkumaan, ___ (tehdä) läksyt.",
      correct: "olin tehnyt",
      opts: ["olin tehnyt", "olen tehnyt", "olin tein", "olisin tehnyt"],
      explain: "До другого прошедшего: olin tehnyt.",
    },
    {
      q: "Hän ei ___ (nähdä) elokuvaa aiemmin.",
      correct: "ollut nähnyt",
      opts: ["ollut nähnyt", "ole nähnyt", "oli nähnyt", "olisi nähnyt"],
      explain: "Negатив плюс-квамперфект: ei ollut nähnyt → «(hän ei) ollut nähnyt».",
    },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Плюсквамперфект (oli + -nut/-neet)",
    level: "B1",
    topic: "грамматика",
    description: "Предпрошедшее время в типовых конструкциях.",
    questions,
  };
}

/* ==== B1: Konditionaali ==== */
function makeConditionalB1(): Quiz {
  const items = [
    { q: "Jos minulla olisi aikaa, ___ (lukea) enemmän.", correct: "lukisin", opts: ["luin", "lukisin", "lukisinpa", "lukisinut"], explain: "Основа + -isi- + личное окончание → lukisin." },
    { q: "Jos sinä ___ (tulla), olisimme iloisia.", correct: "tulisit", opts: ["tulisit", "tule", "tulisi", "tulit"], explain: "2 л. ед. в konditionaali: tulisit." },
    { q: "Ostaisin uuden pyörän, jos ___ rahaa.", correct: "minulla olisi", opts: ["minulla on", "minulla olisi", "minulle olisi", "olen ollut"], explain: "Условие: jos minulla olisi (essive + olla в kond.)." },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Konditionaali (-isi-)",
    level: "B1",
    topic: "грамматика",
    description: "Условные конструкции и формы на -isi-.",
    questions,
  };
}

/* ==== B2: Агентное причастие ==== */
function makeAgentParticipleB2(): Quiz {
  const items = [
    { q: "Tässä on ___ kirje.", correct: "minun kirjoittama", opts: ["minun kirjoittama", "minun kirjoitettu", "minun kirjoittamassa", "minun kirjoittanut"], explain: "Агентный парт.: GEN + V-ma → minun kirjoittama (мной написанное)." },
    { q: "Se on hänen ___ päätös.", correct: "tekemä", opts: ["tekemä", "tehty", "tekevä", "tehtävä"], explain: "Агентный парт. от tehdä → tekemä." },
    { q: "Luimme opiskelijoiden ___ artikkelin.", correct: "kirjoittaman", opts: ["kirjoittaman", "kirjoitetun", "kirjoittavan", "kirjoittamassa"], explain: "Атрибут: GEN(pl) + kirjoittama + N (в GEN sing) → kirjoittaman artikkelin (в контексте падежного согласования)."},
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Агентное причастие (GEN + V-ma)",
    level: "B2",
    topic: "грамматика",
    description: "Структуры типа «minun tekemä päätös».",
    questions,
  };
}

/* ==== B2: Причастие настоящего (-va/-vä) ==== */
function makeParticiplePresentB2(): Quiz {
  const items = [
    { q: "___ mies on opettaja.", correct: "Puhuva", opts: ["Puhuva", "Puhunut", "Puhuvaa", "Puhuttava"], explain: "Прич. наст. активное: V + -va/-vä → puhuva." },
    { q: "Näin ___ lapsen.", correct: "itkevän", opts: ["itkevä", "itkevän", "itkenyt", "itkevässä"], explain: "Атрибут в объектной позиции: генитив причастия → itkevän lapsen." },
    { q: "Hän on ___ opiskelija.", correct: "tunteva", opts: ["tunteva", "tunnettu", "tunteessa", "tuntunut"], explain: "Активное наст. причастие от tuntea → tunteva (знающий)." },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Причастие настоящего (-va/-vä)",
    level: "B2",
    topic: "грамматика",
    description: "Атрибутивные конструкции с активным причастием.",
    questions,
  };
}

/* ==== B2: Пассив перфект/плюсквамперфект ==== */
function makePassivePerfectB2(): Quiz {
  const items = [
    { q: "Raportti on ___ (kirjoittaa).", correct: "kirjoitettu", opts: ["kirjoitettu", "kirjoitettiin", "kirjoitetaan", "kirjoittama"], explain: "Перфект пассива: on + V-ttu → on kirjoitettu." },
    { q: "Talo oli ___ (rakentaa) vuonna 1950.", correct: "rakennettu", opts: ["rakennettu", "rakennettiin", "rakennetaan", "rakentama"], explain: "Плюсквамперфект пассива (олИ): oli rakennettu." },
    { q: "Virhe on ___ (korjata).", correct: "korjattu", opts: ["korjattu", "korjattiin", "korjataan", "korjaama"], explain: "on korjattu — пассив перфект завершённости." },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Пассив: перфект и плюсквамперфект",
    level: "B2",
    topic: "грамматика",
    description: "on/oli + V-ttu (-tty).",
    questions,
  };
}

/* ==== B2: Косвенная речь (että-lause) ==== */
function makeReportedSpeechB2(): Quiz {
  const items = [
    { q: "Hän sanoi, että hän ___ myöhässä.", correct: "tulee", opts: ["tulee", "tulisi", "tuli", "on tullut"], explain: "В косвенной речи после «sanoi, että» обычное настоящее остаётся: tulee myöhässä." },
    { q: "Opettaja kertoi, että koe ___ huomenna.", correct: "on", opts: ["on", "oli", "olisi", "tulee olemaan"], explain: "Факт будущего в подчинённом часто передают презенсом: että koe on huomenna." },
    { q: "Hän väitti, että oli ___ ajoissa.", correct: "tullut", opts: ["tulee", "tullut", "tulossa", "tulemassa"], explain: "Прошедшее действие в että-lause: oli + -nut → oli tullut." },
  ];
  const questions: Question[] = items.map(it => {
    const opts = shuffle(it.opts.slice());
    return { id: nextId(), question: it.q, options: opts, correct: opts.indexOf(it.correct), explanation: it.explain };
  });
  return {
    id: nextId(),
    title: "Косвенная речь (että-lause)",
    level: "B2",
    topic: "грамматика",
    description: "Последовательность времён и выбор формы в että-предаточных.",
    questions,
  };
}


/* ===== Утилиты ===== */
// стало
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}


/* ===== Конфетти (микро) ===== */
function fireConfetti() {
  const c = document.createElement("div");
  c.style.position = "fixed";
  c.style.left = "0";
  c.style.top = "0";
  c.style.width = "100%";
  c.style.height = "0";
  c.style.zIndex = "9999";
  document.body.appendChild(c);

  const pieces = 24;
  for (let i = 0; i < pieces; i++) {
    const span = document.createElement("span");
    span.textContent = ["🎉", "✨", "🎊", "🌟"][i % 4];
    span.style.position = "fixed";
    span.style.left = Math.random() * 100 + "vw";
    span.style.top = "-10px";
    span.style.fontSize = 16 + Math.random() * 12 + "px";
    span.style.transition = "transform 1.4s ease-out, opacity 1.4s";
    span.style.opacity = "1";
    c.appendChild(span);
    setTimeout(() => {
      span.style.transform = `translateY(${80 + Math.random() * 50}vh) rotate(${Math.random() * 360}deg)`;
      span.style.opacity = "0";
    }, 10);
  }
  setTimeout(() => document.body.removeChild(c), 1600);
}

/* ===== Озвучка (ru-RU/fi-FI) ===== */
function speakFi(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fi-FI";
    window.speechSynthesis.speak(u);
  } catch {}
}

/* ===== Карточка теста ===== */
function QuizCard({ quiz, onStart }: { quiz: Quiz; onStart: (q: Quiz) => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">{quiz.topic}</span>
          <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">{quiz.level}</span>
        </div>
        <h3 className="mt-2 text-xl font-bold">{quiz.title}</h3>
        {quiz.description && <p className="text-sm text-slate-600 dark:text-slate-300">{quiz.description}</p>}
        <div className="mt-auto pt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">{quiz.questions.length} вопросов</span>
          <button onClick={() => onStart(quiz)} className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:shadow inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Начать
          </button>
        </div>
      </div>
    </div>
  );
}


/* ===== История/XP ===== */
function useHistory() {
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("quiz_history") || "[]";
      setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  const push = useCallback(
    (entry: any) => {
      try {
        const next = [entry, ...history].slice(0, 50);
        setHistory(next);
        localStorage.setItem("quiz_history", JSON.stringify(next));
      } catch {}
    },
    [history]
  );
  return { history, push };
}

function useXP() {
  const [xp, setXP] = useState<number>(() => Number(localStorage.getItem("quiz_xp") || 0));
  const addXP = (v: number) => {
    const n = xp + v;
    setXP(n);
    try { localStorage.setItem("quiz_xp", String(n)); } catch {}
  };
  return { xp, addXP };
}

/* ===== Раннер теста ===== */
type RunnerSettings = {
  timeLimit: number | null; // сек/вопрос
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  adaptive: boolean;
  typingMode: boolean; // режим ввода ответа
};

const defaultSettings: RunnerSettings = {
  timeLimit: 25,
  shuffleQuestions: true,
  shuffleOptions: true,
  adaptive: true,
  typingMode: false,
};

function QuizRunner({
  quiz,
  onExit,
  initialModeWrongOnly = false,
}: {
  quiz: Quiz;
  onExit: () => void;
  initialModeWrongOnly?: boolean;
}) {
  const STORAGE_KEY = `quiz_state_${quiz.id}`;
  const { push } = useHistory();
  const { addXP } = useXP();

  // настройки
  const [settings, setSettings] = useState<RunnerSettings>(() => {
    try {
      const raw = localStorage.getItem("quiz_settings");
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  useEffect(() => {
    localStorage.setItem("quiz_settings", JSON.stringify(settings));
  }, [settings]);

  // подготовка
  const preparedBase = useMemo(() => {
    const base = settings.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions.slice();
    const mapped = base.map((q) => {
      const opts = settings.shuffleOptions ? shuffle(q.options) : q.options.slice();
      const correctIdx = opts.indexOf(q.options[q.correct]);
      return { ...q, options: opts, correct: correctIdx };
    });
    return mapped;
  }, [quiz, settings.shuffleQuestions, settings.shuffleOptions]);

  // bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(`quiz_bookmarks_${quiz.id}`) || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(`quiz_bookmarks_${quiz.id}`, JSON.stringify(bookmarks)); } catch {}
  }, [bookmarks, quiz.id]);

  // состояние
  const [prepared, setPrepared] = useState<Question[]>(preparedBase);
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [typed, setTyped] = useState(""); // для typingMode
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<{ id: number; picked: number; correct: number; typed?: string }[]>([]);
  const [left, setLeft] = useState<number>(settings.timeLimit ?? 0);
  const timerRef = useRef<any>(null);

  // восстановление
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        setPrepared(state.prepared || preparedBase);
        setStep(state.step || 0);
        setScore(state.score || 0);
        setAnswers(state.answers || []);
        setLeft(state.left ?? (settings.timeLimit ?? 0));
        setPaused(!!state.paused);
        setCombo(state.combo || 0);
      } else {
        if (initialModeWrongOnly && stateFromLastResult()?.wrongIds?.length) {
          const ids = stateFromLastResult()!.wrongIds as number[];
          const filtered = preparedBase.filter((q) => ids.includes(q.id));
          setPrepared(filtered.length ? filtered : preparedBase);
        } else {
          setPrepared(preparedBase);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id]);

  // автосохранение
  useEffect(() => {
    try {
      if (finished) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ prepared, step, score, answers, left, paused, combo })
        );
      }
    } catch {}
  }, [prepared, step, score, answers, left, paused, combo, finished]);

  const q = prepared[step];
  const last = step === prepared.length - 1;

  // адаптивность: подстройка таймера
  useEffect(() => {
    if (!settings.adaptive || settings.timeLimit == null) return;
    // если хорошая серия — таймер чуть уменьшим, если ошибки — вернём
    const base = defaultSettings.timeLimit!;
    const delta = clamp(Math.floor(combo / 3) * 3, 0, 10); // каждые 3 верных -3 сек (до -10)
    setLeft(base - delta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, combo, settings.adaptive]);

  // статический таймер
  useEffect(() => {
    if (!settings.adaptive && settings.timeLimit != null) setLeft(settings.timeLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, settings.timeLimit, settings.adaptive]);

  // тик таймера
  useEffect(() => {
    if (settings.timeLimit == null || finished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => setLeft((v) => v - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, paused, settings.timeLimit, finished]);

  useEffect(() => {
    if (settings.timeLimit == null || finished) return;
    if (left <= 0) {
      // время вышло — фиксируем ошибку
      setAnswers((a) => [...a, { id: q.id, picked: -1, correct: q.correct }]);
      setCombo(0);
      setTimeout(() => {
        setChosen(null);
        setTyped("");
        if (!last) setStep((s) => s + 1);
        else finalize();
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // хоткеи
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as any)?.isContentEditable;
      if (typing || finished) return;

      if (e.key === "Escape") onExit();
      if (!settings.typingMode && ["1", "2", "3", "4"].includes(e.key)) setChosen(Number(e.key) - 1);
      if (e.key.toLowerCase() === "p") setPaused((p) => !p);
      if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, finished, settings.typingMode]);

  const normalized = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s\-’']/gu, "")
      .trim();

  const isTypedCorrect = (typed: string, q: Question) => {
    const gold = q.options[q.correct];
    return normalized(typed) === normalized(gold);
  };

  const submit = useCallback(() => {
    if (!q) return;

    let ok = false;
    let picked = chosen ?? -1;

    if (settings.typingMode) {
      ok = isTypedCorrect(typed, q);
      picked = ok ? q.correct : -1; // виртуально маппим
    } else {
      if (chosen === null) return;
      ok = chosen === q.correct;
    }

    if (ok) {
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      addXP(10 + Math.min(combo * 2, 20)); // бонус за серию
      fireConfetti();
    } else {
      setCombo(0);
    }

    setAnswers((a) => [...a, { id: q.id, picked, correct: q.correct, typed: settings.typingMode ? typed : undefined }]);

    setTimeout(() => {
      setChosen(null);
      setTyped("");
      if (!last) setStep((s) => s + 1);
      else finalize();
    }, 180);
  }, [q, chosen, last, settings.typingMode, typed, combo, addXP]);

  const reset = useCallback(() => {
    setPrepared(preparedBase);
    setStep(0);
    setChosen(null);
    setTyped("");
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setPaused(false);
    setCombo(0);
    setLeft(settings.timeLimit ?? 0);
  }, [preparedBase, settings.timeLimit]);

  const finalize = useCallback(() => {
    setFinished(true);
    const entry = {
      quizId: quiz.id,
      title: quiz.title,
      at: new Date().toISOString(),
      score,
      total: prepared.length,
      wrongIds: prepared
        .map((qq, idx) => ({ id: qq.id, ok: answers[idx]?.picked === qq.correct }))
        .filter((x) => !x.ok)
        .map((x) => x.id),
      xpGain: score * 10,
      percent: prepared.length ? Math.round((score / prepared.length) * 100) : 0,
    };
    try {
      const raw = localStorage.getItem("quiz_history") || "[]";
      const h = JSON.parse(raw);
      const next = [entry, ...h].slice(0, 50);
      localStorage.setItem("quiz_history", JSON.stringify(next));
    } catch {}
  }, [answers, prepared, quiz.id, quiz.title, score]);

  const stateFromLastResult = () => {
    try {
      const raw = localStorage.getItem("quiz_history") || "[]";
      const h = JSON.parse(raw) as any[];
      return h.find((x) => x.quizId === quiz.id) || null;
    } catch {
      return null;
    }
  };

  if (!q && !finished) return null;

  const percent = Math.round((step / prepared.length) * 100);

  // подсказка: показать объяснение или подсветить 1 верный намёком
  const [hinted, setHinted] = useState(false);
  const makeHint = () => setHinted(true);

  // 50/50: скрыть два неверных
  const [cutSet, setCutSet] = useState<number[]>([]);
  const fifty = () => {
    if (settings.typingMode) return;
    const wrongs = q.options.map((_, i) => i).filter((i) => i !== q.correct);
    const toHide = shuffle(wrongs).slice(0, 2);
    setCutSet(toHide);
  };

  const toggleBookmark = (id: number) =>
    setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));

  /* ===== Рендер ===== */
  return (
    <div className="max-w-3xl mx-auto">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
        >
          ← К списку
        </button>

        {!finished ? (
          <div className="flex items-center gap-3 text-sm opacity-90">
            {/* прогресс */}
            <div className="w-40 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* таймер-кольцо */}
            {settings.timeLimit !== null && (
              <button
                onClick={() => setPaused((p) => !p)}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
                title="Пауза (P)"
              >
                <div className="relative w-7 h-7">
                  <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                    <circle
                      cx="18" cy="18" r="16" fill="none"
                      stroke="url(#grad)"
                      strokeWidth="4"
                      strokeDasharray={`${clamp((left / (settings.adaptive ? defaultSettings.timeLimit! : settings.timeLimit!)) * 100, 0, 100)} 100`}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-xs">{left}s</span>
                </div>
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            )}

            {/* настройки */}
            <details className="relative">
              <summary className="list-none px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer inline-flex items-center gap-1">
                <Settings className="w-4 h-4" /> Настройки
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-3 z-10">
                <div className="text-xs text-slate-500 mb-2">Таймер на вопрос</div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSettings((st) => ({ ...st, timeLimit: s }))}
                      className={`px-2 py-1 rounded-lg border text-sm ${
                        settings.timeLimit === s
                          ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                  <button
                    onClick={() => setSettings((st) => ({ ...st, timeLimit: null }))}
                    className={`px-2 py-1 rounded-lg border text-sm ${
                      settings.timeLimit === null
                        ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    Без лимита
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500 mb-1">Режимы</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings((st) => ({ ...st, adaptive: !st.adaptive }))}
                    className={`px-2 py-1 rounded-lg border text-sm inline-flex items-center gap-1 ${
                      settings.adaptive
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Wand2 className="w-4 h-4" /> Адаптивный
                  </button>
                  <button
                    onClick={() => setSettings((st) => ({ ...st, typingMode: !st.typingMode }))}
                    className={`px-2 py-1 rounded-lg border text-sm inline-flex items-center gap-1 ${
                      settings.typingMode
                        ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/20 dark:text-violet-200"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" /> Ввод ответа
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40 text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Начать заново
                </button>
              </div>
            </details>
          </div>
        ) : (
          <div className="text-sm opacity-80">Режим результата</div>
        )}
      </div>

      {/* Тело */}
      {!finished ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{quiz.title}</h3>
            <div className="text-xs opacity-70">Комбо: <b>{combo}</b></div>
          </div>

          <div className="mt-3">
            {/* Вопрос */}
            <div className="font-medium mb-3 text-lg">{q.question}</div>
            {q.tts && (
              <button
                className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
                onClick={() => speakFi(q.question)}
              >
                <Volume2 className="w-4 h-4" /> Озвучить вопрос
              </button>
            )}

            {/* Ввод или варианты */}
            {settings.typingMode ? (
              <div className="grid gap-2">
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Напиши правильный ответ…"
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-500"
                />
                {q.explanation && (
                  <div className="text-xs text-slate-500">Подсказка: {q.explanation}</div>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  const isPicked = chosen === i;
                  const showState = chosen !== null || (settings.timeLimit !== null && left <= 0);
                  const isCorrect = showState && i === q.correct;
                  const isWrong = showState && isPicked && i !== q.correct;
                  const hidden = cutSet.includes(i);

                  const stateClass =
                    hidden
                      ? "hidden"
                      : !showState
                      ? "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      : isCorrect
                      ? "border-emerald-400 ring-2 ring-emerald-400/40"
                      : isWrong
                      ? "border-rose-400 ring-2 ring-rose-400/40"
                      : "border-slate-300 dark:border-slate-700 opacity-60";

                  return (
                    <button
                      key={i}
                      onClick={() => setChosen(i)}
                      className={`text-left px-4 py-3 rounded-xl border transition ${stateClass}`}
                      aria-pressed={isPicked}
                    >
                      <span className="mr-2 opacity-60">{i + 1}.</span> {opt}
                      {q.tts && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); speakFi(opt); }}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <Volume2 className="w-3 h-3" />&nbsp;FI
                        </button>
                      )}
                      {hinted && i === q.correct && (
                        <span className="ml-2 text-emerald-600 text-xs">• намёк</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* действия */}
            <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(q.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm inline-flex items-center gap-2"
                  title="Добавить в закладки"
                >
                  {bookmarks.includes(q.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  Закладка
                </button>
                {!settings.typingMode && (
                  <>
                    <button
                      onClick={makeHint}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm inline-flex items-center gap-2"
                      title="Показать подсказку"
                    >
                      <Lightbulb className="w-4 h-4" /> Подсказка
                    </button>
                    <button
                      onClick={fifty}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm inline-flex items-center gap-2"
                      title="Скрыть 2 неверных"
                    >
                      <Scissors className="w-4 h-4" /> 50/50
                    </button>
                  </>
                )}
              </div>

              {step === prepared.length - 1 ? (
                <button
                  onClick={submit}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
                >
                  Завершить ({score + (settings.typingMode ? (isTypedCorrect(typed, q) ? 1 : 0) : (chosen === q.correct ? 1 : 0))}/{prepared.length})
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!settings.typingMode ? chosen === null : !typed.trim()}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-50 inline-flex items-center gap-2"
                >
                  Далее <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              )}
            </div>

            {/* пояснение */}
            {!settings.typingMode && chosen !== null && q.explanation && (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                💡 {q.explanation}
              </div>
            )}

            <div className="mt-3 text-xs text-slate-500">
              Хоткеи: 1–4 — выбрать • Enter — далее • P — пауза • Esc — выход
            </div>
          </div>
        </div>
      ) : (
        <ResultPanel
          quiz={quiz}
          prepared={prepared}
          answers={answers}
          score={score}
          onRetryAll={reset}
          onRetryWrong={() => {
            const wrongIds = prepared
              .map((qq, idx) => ({ id: qq.id, ok: answers[idx]?.picked === qq.correct }))
              .filter((x) => !x.ok)
              .map((x) => x.id);
            const filtered = prepared.filter((q) => wrongIds.includes(q.id));
            if (filtered.length) {
              setPrepared(filtered);
              setStep(0);
              setChosen(null);
              setTyped("");
              setScore(0);
              setAnswers([]);
              setFinished(false);
              setPaused(false);
              setCombo(0);
              setLeft(settings.timeLimit ?? 0);
            } else {
              reset();
            }
          }}
          onRetryBookmarked={() => {
            const filtered = prepared.filter((q) => bookmarks.includes(q.id));
            if (filtered.length) {
              setPrepared(filtered);
              setStep(0);
              setChosen(null);
              setTyped("");
              setScore(0);
              setAnswers([]);
              setFinished(false);
              setPaused(false);
              setCombo(0);
              setLeft(settings.timeLimit ?? 0);
            }
          }}
          onExit={onExit}
        />
      )}

      {/* Разбор ответов вживую */}
      {!finished && answers.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Ваши ответы
          </div>
          <ol className="space-y-1 list-decimal pl-5">
            {answers.map((a, i) => (
              <li key={i} className={a.picked === a.correct ? "text-emerald-600" : "text-rose-600"}>
                #{i + 1}: {a.picked === a.correct ? "верно" : "ошибка"}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ===== Результаты ===== */
function ResultPanel({
  quiz,
  prepared,
  answers,
  score,
  onRetryAll,
  onRetryWrong,
  onRetryBookmarked,
  onExit,
}: {
  quiz: Quiz;
  prepared: Question[];
  answers: { id: number; picked: number; correct: number; typed?: string }[];
  score: number;
  onRetryAll: () => void;
  onRetryWrong: () => void;
  onRetryBookmarked: () => void;
  onExit: () => void;
}) {
  const total = prepared.length;
  const percent = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Результат: {quiz.title}</h3>
        <div className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="font-semibold">{score}/{total}</span> ({percent}%)
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-600"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          onClick={onRetryWrong}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          Пройти только ошибки
        </button>
        <button
          onClick={onRetryBookmarked}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          Закладки
        </button>
        <button
          onClick={onRetryAll}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
        >
          Пройти заново
        </button>
      </div>

      {/* Подробный разбор */}
      <div className="mt-6">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Разбор вопросов
        </div>
        <ol className="space-y-3 list-decimal pl-5 text-sm">
          {prepared.map((q, i) => {
            const a = answers[i];
            const ok = a?.picked === q.correct;
            return (
              <li key={q.id} className={ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                <div className="font-medium">{q.question}</div>
                <div className="mt-1">
                  Правильный ответ: <span className="font-semibold">{q.options[q.correct]}</span>
                  {a?.picked >= 0 && !ok ? (
                    <>
                      {" "}• Ваш ответ: <span>{a?.typed ?? q.options[a.picked]}</span>
                    </>
                  ) : a?.picked === -1 ? (
                    <> • Ваш ответ: <span>—</span></>
                  ) : null}
                </div>
                {q.explanation && <div className="opacity-80 mt-1">💡 {q.explanation}</div>}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40"
        >
          <X className="w-4 h-4" /> Закрыть
        </button>
      </div>
    </div>
  );
}

/* ===== Страница ===== */
function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [level, setLevel] = useState<string>(searchParams.get("level") ?? "");
  const [topic, setTopic] = useState<string>(searchParams.get("topic") ?? "");
  const [active, setActive] = useState<Quiz | null>(null);

  // синк в URL (дебаунс)
  const debounceRef = useRef<any>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (level) p.set("level", level);
      if (topic) p.set("topic", topic);
      if (active?.id) p.set("quiz", String(active.id));
      router.replace(`${pathname}?${p.toString()}`);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [q, level, topic, active?.id, pathname, router]);

  // авто-открытие по ?quiz=
  useEffect(() => {
    const id = Number(searchParams.get("quiz"));
    if (id) {
      const found = QUIZZES.find((x) => x.id === id);
      if (found) setActive(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const levels = useMemo(() => Array.from(new Set(QUIZZES.map((x) => x.level))).sort(), []);
  const topics = useMemo(() => Array.from(new Set(QUIZZES.map((x) => x.topic))).sort(), []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return QUIZZES.filter((x) => {
      const hitQ = !t || x.title.toLowerCase().includes(t) || (x.description ?? "").toLowerCase().includes(t);
      const hitL = !level || x.level === level;
      const hitT = !topic || x.topic === topic;
      return hitQ && hitL && hitT;
    });
  }, [q, level, topic]);

  const { history } = useHistory();
  const { xp } = useXP();

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-12">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Тесты</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-prose">
              Адаптивные мини-квизы по грамматике и словарю. Выбирай уровень, тему и проходи прямо на странице.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-3 text-sm">
            <div className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4"/> Твой XP</div>
            <div className="mt-1 text-2xl font-extrabold leading-none">{xp}</div>
          </div>
        </div>

        {/* Поиск/фильтры */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr,150px,180px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: пассив, части тела…"
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-500"
            aria-label="Поиск по тестам"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60"
            aria-label="Фильтр по уровню"
          >
            <option value="">Все уровни</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60"
            aria-label="Фильтр по теме"
          >
            <option value="">Все темы</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* История результатов */}
        {history.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 text-sm">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Последние попытки
            </div>
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {history.map((h: any, i: number) => (
                <div key={i} className="min-w-[240px] rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2">
                  <div className="truncate font-medium">{h.title}</div>
                  <div className="opacity-70">{new Date(h.at).toLocaleString()}</div>
                  <div className="mt-1 font-bold">{h.score}/{h.total} • {h.percent}%</div>
                  {typeof h.xpGain === "number" && <div className="text-xs opacity-70">+{h.xpGain} XP</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Либо список карточек, либо активный тест */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {active ? (
          <QuizRunner
            quiz={active}
            onExit={() => {
              setActive(null);
              const p = new URLSearchParams();
              if (q) p.set("q", q);
              if (level) p.set("level", level);
              if (topic) p.set("topic", topic);
              router.replace(`${pathname}?${p.toString()}`);
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
            {filtered.map((qq) => (
              <QuizCard
                key={qq.id}
                quiz={qq}
                onStart={(quiz) => {
                  setActive(quiz);
                  const p = new URLSearchParams();
                  if (q) p.set("q", q);
                  if (level) p.set("level", level);
                  if (topic) p.set("topic", topic);
                  p.set("quiz", String(quiz.id));
                  router.replace(`${pathname}?${p.toString()}`);
                }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-slate-500 dark:text-slate-400">
                Ничего не найдено. Попробуй другие фильтры.
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function GrammarClient() {
  return <PageInner />;
}
