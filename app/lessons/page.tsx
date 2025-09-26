"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "@/components/SafeImage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Search,
  Shuffle,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

/* ================== Типы ================== */
type Lesson = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
  cover?: string;
  summary?: string;               // описание на карточке
  contentHtml?: string;           // вводная
  widgets?: WidgetSpec[];         // интерактив
  playlist: string;
};

type Playlist = {
  id: string;
  title: string;
  level: Lesson["level"];
  description?: string;
};

/* ====== Виджеты (игры без ведущего) ====== */
type WidgetSpec =
  | { kind: "flashcards"; title?: string; items: { front: string; back?: string }[] }
  | { kind: "order"; title?: string; sequence: string[] }
  | { kind: "randomPrompt"; title?: string; prompts: string[] }
  | { kind: "timer"; title?: string; durations?: number[] }
  | { kind: "vowelSuffix"; title?: string; words: string[]; suffix: "ssa" | "lla" }
  | { kind: "priceReader"; title?: string; min?: number; max?: number }
  | { kind: "dialog"; title?: string; steps: DialogStep[] }
  | { kind: "budget"; title?: string; items: { name: string; price: number }[]; budget: number }
  | { kind: "matchPairs"; title?: string; pairs: { a: string; b: string }[] }
  | { kind: "typeAnswer"; title?: string; items: { prompt: string; answers: string[] }[] }
  | { kind: "oddOne"; title?: string; groups: { options: string[]; correctIndex: number; hint?: string }[] }
  | { kind: "gridSelect"; title?: string; rule: string; items: { text: string; good: boolean }[]; target?: number; timed?: number }
  | { kind: "memory"; title?: string; pairs: { id: string; front: string; back: string }[] }
  | { kind: "imageStrip"; title?: string; items: { src: string; alt?: string; caption?: string }[] }; // <— НОВОЕ

type DialogStep = {
  text: string;                            // реплика
  options: { text: string; next: number | "end"; correct?: boolean }[];
};

/* ================== Плейлисты ================== */
  const PLAYLISTS: Playlist[] = [
    { id: "a1-visuals",  title: "A1 Визуальный старт", level: "A1", description: "Картинки + слова: дни, время, числа, цены" },
    { id: "a1-grammar0", title: "A1 Грамматика: база", level: "A1", description: "Гармония гласных и базовые модели" },
    { id: "a1-dialogs",  title: "A1 Диалоги",         level: "A1", description: "Приветствия, страны и языки" },
    { id: "a1-world",    title: "A1 Мир и карта",     level: "A1", description: "Континенты и стороны света" },
  ];

/* ================== Готовые уроки ================== */
const LESSONS: Lesson[] = [
  {
    id: "a1-weekdays",
    title: "Дни недели",
    level: "A1",
    topic: "лексика",
    cover: "/cards/paivat.png",
    summary: "Maanantai–sunnuntai. Матчинг, мемори (РУС↔ФИН), «лишнее», выбор по правилу и печать ответов.",
    contentHtml: `
      <h4>Вводная</h4>
      <p>Повтори названия и запусти игры. Под конец попробуй набрать все дни с клавиатуры без ошибок.</p>
    `,
    widgets: [
      { kind: "flashcards", title: "Флеш-карточки", items: [
        { front: "Maanantai",  back: "понедельник" },
        { front: "Tiistai",    back: "вторник" },
        { front: "Keskiviikko",back: "среда" },
        { front: "Torstai",    back: "четверг" },
        { front: "Perjantai",  back: "пятница" },
        { front: "Lauantai",   back: "суббота" },
        { front: "Sunnuntai",  back: "воскресенье" },
      ]},
      { kind: "order", title: "Собери неделю по порядку", sequence: ["Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai","Sunnuntai"] },
      { kind: "matchPairs", title: "День → фраза с -na", pairs: [
        { a:"Maanantai", b:"Maanantaina minä opiskelen." },
        { a:"Tiistai", b:"Tiistaina käyn salilla." },
        { a:"Keskiviikko", b:"Keskiviikkona teen ruokaa." },
        { a:"Torstai", b:"Torstaina luen suomea." },
        { a:"Perjantai", b:"Perjantaina katson elokuvan." },
        { a:"Lauantai", b:"Lauantaina siivoan." },
        { a:"Sunnuntai", b:"Sunnuntaina lepään." },
      ]},
      { kind: "memory", title: "Мемори: РУС ↔ ФИН", pairs: [
        { id:"mo", front:"понедельник",  back:"Maanantai" },
        { id:"tu", front:"вторник",      back:"Tiistai" },
        { id:"we", front:"среда",        back:"Keskiviikko" },
        { id:"th", front:"четверг",      back:"Torstai" },
        { id:"fr", front:"пятница",      back:"Perjantai" },
        { id:"sa", front:"суббота",      back:"Lauantai" },
        { id:"su", front:"воскресенье",  back:"Sunnuntai" },
      ]},
      { kind: "gridSelect", title: "Выбор по правилу", rule: "Выбери только выходные", items: [
        { text:"Maanantai", good:false }, { text:"Tiistai", good:false }, { text:"Keskiviikko", good:false },
        { text:"Torstai", good:false },  { text:"Perjantai", good:false },
        { text:"Lauantai", good:true },  { text:"Sunnuntai", good:true },
      ], timed: 30 },
      { kind: "oddOne", title: "Найди лишнее", groups: [
        { options:["Maanantai","Tiistai","Kesäkuu","Torstai"], correctIndex:2, hint:"Один — месяц" },
        { options:["Maanantai","Tiistai","Itä","Keskiviikko"], correctIndex:2, hint:"Один — сторона света" },
      ]},
      { kind: "typeAnswer", title: "Напечатай по-фински", items: [
        { prompt:"понедельник →", answers:["maanantai"] },
        { prompt:"вторник →",     answers:["tiistai"] },
        { prompt:"среда →",       answers:["keskiviikko"] },
        { prompt:"четверг →",     answers:["torstai"] },
        { prompt:"пятница →",     answers:["perjantai"] },
        { prompt:"суббота →",     answers:["lauantai"] },
        { prompt:"воскресенье →", answers:["sunnuntai"] },
      ]},
    ],
    playlist: "a1-visuals",
  },
  {
    id: "a1-time",
    title: "Вчера / сегодня / завтра",
    level: "A1",
    topic: "время",
    cover: "/cards/paivat2.png",
    summary: "Пять слов времени + диалог. Добавлены мемори, матчинг, «лишнее», выбор будущего и печать.",
    contentHtml: `
      <h4>Лента времени</h4>
      <p><b>toissapäivänä</b> — <b>eilen</b> — <b>tänään</b> — <b>huomenna</b> — <b>ylihuomenna</b>.</p>
    `,
    widgets: [
      { kind:"flashcards", title:"Карточки времени", items:[
        { front: "Toissapäivänä", back: "позавчера" },
        { front: "Eilen",          back: "вчера" },
        { front: "Tänään",         back: "сегодня" },
        { front: "Huomenna",       back: "завтра" },
        { front: "Ylihuomenna",    back: "послезавтра" },
      ]},
      { kind:"order", title:"Поставь по времени", sequence:["Toissapäivänä","Eilen","Tänään","Huomenna","Ylihuomenna"] },
      { kind:"matchPairs", title:"RU → FI", pairs:[
        { a:"позавчера", b:"toissapäivänä" },
        { a:"вчера", b:"eilen" },
        { a:"сегодня", b:"tänään" },
        { a:"завтра", b:"huomenna" },
        { a:"послезавтра", b:"ylihuomenna" },
      ]},
      { kind:"memory", title:"Мемори: слово ↔ пример", pairs:[
        { id:"1", front:"eilen", back:"Eilen minä nukuin pitkään." },
        { id:"2", front:"tänään", back:"Tänään minulla on tunti." },
        { id:"3", front:"huomenna", back:"Huomenna menen kirjastoon." },
        { id:"4", front:"ylihuomenna", back:"Ylihuomenna ostan lipun." },
        { id:"5", front:"toissapäivänä", back:"Toissapäivänä kävin kaupassa." },
      ]},
      { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери будущее (tulevaisuus)", items:[
        { text:"toissapäivänä", good:false }, { text:"eilen", good:false }, { text:"tänään", good:false },
        { text:"huomenna", good:true }, { text:"ylihuomenna", good:true },
      ], timed: 25 },
      { kind:"oddOne", title:"Найди лишнее", groups:[
        { options:["toissapäivänä","eilen","tänään","huomenna"], correctIndex:3, hint:"Три — прошлое" },
        { options:["tänään","nyt","huomenna","ylihuomenna"], correctIndex:0, hint:"Три — будущее/направлено вперёд" },
      ]},
      { kind:"typeAnswer", title:"Напечатай по-фински", items:[
        { prompt:"вчера →", answers:["eilen"] },
        { prompt:"сегодня →", answers:["tänään"] },
        { prompt:"завтра →", answers:["huomenna"] },
        { prompt:"послезавтра →", answers:["ylihuomenna"] },
        { prompt:"позавчера →", answers:["toissapäivänä"] },
      ]},
      { kind:"dialog", title:"Мини-диалог (выбор ответа)", steps:[
        { text:"A: Milloin sinulla on suomen tunti?", options:[
          { text:"Tänään.", next:1, correct:true }, { text:"Kaksi.", next:1 }
        ]},
        { text:"A: Entä huomenna?", options:[
          { text:"Huomenna minulla ei ole tuntia.", next:2, correct:true },
          { text:"Toissapäivänä.", next:2 },
        ]},
        { text:"Hyvä! Valmis.", options:[{ text:"Aloita alusta", next:0 }]},
      ]},
    ],
    playlist: "a1-visuals",
  },
  {
    id: "a1-numbers",
    title: "Числа и цены",
    level: "A1",
    topic: "числа",
    cover: "/cards/numerot.png",
    summary: "Генератор цен + бюджет. Добавлены: цифра↔слово, чет/нечет, мемори и печать сложных чисел.",
    contentHtml: `
      <h4>Вводная</h4>
      <p>0–9: nolla… yhdeksän; десятки: kymmenen… yhdeksänkymmentä; 100: sata; 1000: tuhat.</p>
    `,
    widgets: [
      { kind:"matchPairs", title:"Цифра → слово", pairs:[
        { a:"0", b:"nolla" }, { a:"1", b:"yksi" }, { a:"2", b:"kaksi" }, { a:"3", b:"kolme" },
        { a:"4", b:"neljä" }, { a:"5", b:"viisi" }, { a:"6", b:"kuusi" }, { a:"7", b:"seitsemän" },
        { a:"8", b:"kahdeksan" }, { a:"9", b:"yhdeksän" }, { a:"10", b:"kymmenen" },
      ]},
      { kind:"memory", title:"Мемори: число ↔ слово", pairs:[
        { id:"n1", front:"12", back:"kaksitoista" },
        { id:"n2", front:"20", back:"kaksikymmentä" },
        { id:"n3", front:"45", back:"neljäkymmentäviisi" },
        { id:"n4", front:"100", back:"sata" },
        { id:"n5", front:"1000", back:"tuhat" },
      ]},
      { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери чётные числа", items:[
        { text:"2", good:true }, { text:"3", good:false }, { text:"4", good:true }, { text:"5", good:false },
        { text:"8", good:true }, { text:"9", good:false }, { text:"10", good:true }, { text:"11", good:false },
        { text:"12", good:true },
      ], timed: 20 },
      { kind:"oddOne", title:"Найди лишнее", groups:[
        { options:["yksi","kaksi","vihreä","kolme"], correctIndex:2, hint:"Один — не число" },
      ]},
      { kind:"typeAnswer", title:"Напечатай словом", items:[
        { prompt:"15 →", answers:["viisitoista"] },
        { prompt:"22 →", answers:["kaksikymmentäkaksi"] },
        { prompt:"37 →", answers:["kolmekymmentäseitsemän"] },
        { prompt:"105 →", answers:["sata viisi","sataviisi"] },
      ]},
      { kind:"priceReader", title:"Случайная цена (самопроверка)", min:0.2, max:300 },
      { kind:"budget", title:"Покупка по бюджету", budget:20, items:[
        { name:"kahvi", price:3.5 },{ name:"tee", price:2.2 },{ name:"pulla", price:2.9 },{ name:"leipä", price:4.5 },
        { name:"juusto", price:6.9 },{ name:"maito", price:1.6 },{ name:"omena", price:0.7 },{ name:"suklaa", price:2.4 },
      ]},
    ],
    playlist: "a1-visuals",
  },
  {
    id: "a1-greetings-dialog",
    title: "Диалоги: приветствия и знакомство",
    level: "A1",
    topic: "разговорная речь",
    cover: "/cards/minaolen.png",
    summary: "Карточки фраз, диалог, плюс: матчинг, мемори, «лишнее», фильтр на вежливые реплики.",
    contentHtml: `<h4>Вводная</h4><p>Собери быстрый набор реплик для знакомства — и сразу в мини-диалог.</p>`,
    widgets: [
      { kind:"flashcards", title:"Фразы", items:[
        { front:"Moi! / Hei!" },{ front:"Mitä kuuluu?" },{ front:"Ihan hyvää, kiitos." },
        { front:"Kuka sinä olet?" },{ front:"Minä olen …" },{ front:"Missä sinä asut?" },{ front:"Asun …ssa." },
        { front:"Kiitos!" },{ front:"Ole hyvä!" },{ front:"Näkemiin!" },
      ]},
      { kind:"matchPairs", title:"Вопрос → естественный ответ", pairs:[
        { a:"Mitä kuuluu?", b:"Ihan hyvää, kiitos." },
        { a:"Kuka sinä olet?", b:"Minä olen …" },
        { a:"Missä sinä asut?", b:"Asun Turussa." },
        { a:"Kiitos!", b:"Ole hyvä!" },
      ]},
      { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери только приветствия (tervehdykset)", items:[
        { text:"Hei!", good:true }, { text:"Moi!", good:true }, { text:"Näkemiin!", good:false },
        { text:"Hyvää yötä!", good:true }, { text:"Ole hyvä!", good:false }, { text:"Kiitos!", good:false },
      ]},
      { kind:"oddOne", title:"Найди лишнее", groups:[
        { options:["Näkemiin!","Moi!","Hei!","Kello"], correctIndex:3, hint:"Один — не реплика" },
      ]},
      { kind:"memory", title:"Мемори: реплика ↔ ответ", pairs:[
        { id:"1", front:"Moi!", back:"Hei!" },
        { id:"2", front:"Kiitos!", back:"Ole hyvä!" },
        { id:"3", front:"Mitä kuuluu?", back:"Ihan hyvää, kiitos." },
      ]},
      { kind:"dialog", title:"Сцена в kahvila", steps:[
        { text:"A: Hei! Minä olen Kati. Kuka sinä olet?", options:[
          { text:"Moi! Minä olen …", next:1, correct:true }, { text:"Hyvää yötä.", next:1 }
        ]},
        { text:"A: Mitä kuuluu?", options:[
          { text:"Ihan hyvää, kiitos.", next:2, correct:true }, { text:"Olen 25.", next:2 }
        ]},
        { text:"A: Missä sinä asut?", options:[
          { text:"Asun Turussa.", next:"end", correct:true }, { text:"Hyvästi!", next:"end" }
        ]},
      ]},
      { kind:"randomPrompt", title:"Самопрезентация", prompts:[
        "Hei! Minä olen ___.","Olen __ vuotta vanha.","Asun __ssa.","Puhun __ ja __.",
      ]},
    ],
    playlist: "a1-dialogs",
  },
  {
    id: "a1-nationality-language",
    title: "Страна, национальность, язык",
    level: "A1",
    topic: "лексика/модели",
    cover: "/cards/mistaoletkotoisin.png",
    summary: "Карточки + новые игры: страны↔фразы, языки в партитиве, фильтр «только языки», мемори с демонимами.",
    contentHtml: `
      <h4>Модели</h4>
      <ul>
        <li><b>Olen kotoisin + sta/stä</b> — Olen kotoisin Suomesta.</li>
        <li><b>Olen + –lainen</b> — Olen suomalainen.</li>
        <li><b>Puhun + partitiivi</b> — Puhun suomea ja ruotsia.</li>
      </ul>
    `,
    widgets: [
      { kind:"flashcards", title:"Карточки (страна → фраза)", items:[
        { front:"Suomi →", back:"Olen kotoisin Suomesta. Olen suomalainen." },
        { front:"Italia →", back:"Olen kotoisin Italiasta. Olen italialainen." },
        { front:"Viro →", back:"Olen kotoisin Virosta. Olen virolainen." },
        { front:"Puola →", back:"Olen kotoisin Puolasta. Olen puolalainen." },
        { front:"Korea →", back:"Olen kotoisin Koreasta. Olen korealainen." },
      ]},
      { kind:"matchPairs", title:"Страна → kotoisin-фраза", pairs:[
        { a:"Suomi", b:"Olen kotoisin Suomesta." },
        { a:"Italia", b:"Olen kotoisin Italiasta." },
        { a:"Viro", b:"Olen kotoisin Virosta." },
        { a:"Puola", b:"Olen kotoisin Puolasta." },
      ]},
      { kind:"typeAnswer", title:"Партитив языка (в ответ пиши только одно слово)", items:[
        { prompt:"suomi →", answers:["suomea"] },
        { prompt:"venäjä →", answers:["venäjää"] },
        { prompt:"englanti →", answers:["englantia"] },
        { prompt:"ruotsi →", answers:["ruotsia"] },
      ]},
      { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери только языки", items:[
        { text:"suomi", good:true }, { text:"englanti", good:true }, { text:"ruotsi", good:true },
        { text:"Italia", good:false }, { text:"Viro", good:false }, { text:"Puola", good:false },
      ]},
      { kind:"memory", title:"Мемори: страна ↔ национальность", pairs:[
        { id:"1", front:"Suomi", back:"suomalainen" },
        { id:"2", front:"Viro", back:"virolainen" },
        { id:"3", front:"Italia", back:"italialainen" },
        { id:"4", front:"Puola", back:"puolalainen" },
      ]},
      { kind:"randomPrompt", title:"3 предложения о себе", prompts:[
        "Olen kotoisin __sta.","Olen __lainen.","Puhun __a ja __a.",
      ]},
    ],
    playlist: "a1-dialogs",
  },
  {
    id: "a1-world-map",
    title: "Карта мира и стороны света",
    level: "A1",
    topic: "география",
    cover: "/cards/maalima.png",
    summary: "Континенты + компас. Матчинг и мемори только ФИН↔РУС, без латинских N/S/E/W.",
    contentHtml: `
      <h4>Слова</h4>
      <p>Eurooppa, Aasia, Afrikka, Pohjois-Amerikka, Etelä-Amerikka, Australia, Etelämanner. Компас: pohjoinen, etelä, itä, länsi.</p>
    `,
    widgets: [
      { kind:"flashcards", title:"Континенты", items:[
        { front:"Eurooppa" },{ front:"Aasia" },{ front:"Afrikka" },{ front:"Pohjois-Amerikka" },
        { front:"Etelä-Amerikka" },{ front:"Australia" },{ front:"Etelämanner" },
      ]},
      { kind:"matchPairs", title:"Сторона света → перевод (РУС)", pairs:[
        { a:"pohjoinen", b:"север" },
        { a:"etelä",     b:"юг" },
        { a:"itä",       b:"восток" },
        { a:"länsi",     b:"запад" },
      ]},
      { kind:"memory", title:"Мемори: ФИН ↔ РУС", pairs:[
        { id:"1", front:"pohjoinen", back:"север" },
        { id:"2", front:"etelä",     back:"юг" },
        { id:"3", front:"itä",       back:"восток" },
        { id:"4", front:"länsi",     back:"запад" },
      ]},
      { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери южные континенты", items:[
        { text:"Afrikka", good:true }, { text:"Etelä-Amerikka", good:true }, { text:"Etelämanner", good:true },
        { text:"Eurooppa", good:false }, { text:"Aasia", good:false }, { text:"Pohjois-Amerikka", good:false },
      ], timed: 30 },
      { kind:"oddOne", title:"Найди лишнее", groups:[
        { options:["Eurooppa","Aasia","Afrikka","Tampere"], correctIndex:3, hint:"Один — город" },
      ]},
      { kind:"randomPrompt", title:"Говори вслух", prompts:[
        "Suomi on Euroopassa.","Etelä-Amerikka on etelässä.","Australia on etelässä ja idässä.","Afrikka on etelässä.",
      ]},
    ],
    playlist: "a1-world",
  },
{
  id: "a1-price-money",
  title: "Цена и деньги",
  level: "A1",
  topic: "покупки",
  cover: "/cards/hinta.png",
  summary: "Чтение цен, бюджет + новые игры: цена цифрами ↔ словами, фильтр по бюджету, «лишнее», мемори.",
  contentHtml: `
    <h4>Лексика</h4>
    <p>euro, sentti, seteli, kolikko. — Kysymys: Mitä tämä maksaa? — Vastaus: Se maksaa __ €.</p>
  `,
  widgets: [
    { kind:"matchPairs", title:"Цена цифрами → словами", pairs:[
      { a:"2,50 €", b:"kaksi euroa viisikymmentä senttiä" },
      { a:"7,00 €", b:"seitsemän euroa" },
      { a:"10,99 €", b:"kymmenen euroa yhdeksänkymmentäyhdeksän senttiä" },
      { a:"0,80 €", b:"kahdeksankymmentä senttiä" },
    ]},
    { kind:"typeAnswer", title:"Напечатай словами", items:[
      { prompt:"3,20 € →", answers:["kolme euroa kaksikymmentä senttiä"] },
      { prompt:"14,00 € →", answers:["neljätoista euroa"] },
      { prompt:"0,50 € →", answers:["viisikymmentä senttiä"] },
    ]},
    { kind:"gridSelect", title:"Выбор по правилу", rule:"Что можно купить за ≤ 10 €", items:[
      { text:"kahvi 3,00 €", good:true }, { text:"sämpylä 2,40 €", good:true }, { text:"juusto 5,20 €", good:true },
      { text:"kirja 18,00 €", good:false }, { text:"viini 12,00 €", good:false }, { text:"takki 60,00 €", good:false },
    ]},
    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["euro","seteli","kolikko","sohva"], correctIndex:3, hint:"Один — не про деньги" },
    ]},
    { kind:"memory", title:"Мемори: товар ↔ цена", pairs:[
      { id:"1", front:"kahvi", back:"3,00 €" }, { id:"2", front:"suklaa", back:"2,80 €" },
      { id:"3", front:"maito", back:"1,50 €" }, { id:"4", front:"juusto", back:"5,20 €" },
    ]},
    { kind:"priceReader", title:"Случайные ценники", min:0.2, max:500 },
    { kind:"budget", title:"Собери покупку на 15€", budget:15, items:[
      { name:"banaani", price:1.2 },{ name:"appelsiini", price:1.1 },{ name:"kahvi", price:3.0 },
      { name:"sämpylä", price:2.4 },{ name:"juusto", price:5.2 },{ name:"maito", price:1.5 },{ name:"suklaa", price:2.8 },
    ]},
  ],
  playlist: "a1-visuals",
},
{
  id: "a1-question-words-pro",
  title: "Kysymyssanat (вопросительные слова)",
  level: "A1",
  topic: "вопросы",
  cover: "/cards/kysymyssanat.png",
  summary: "Три хита: матчинг, печать ответа, «лишнее». Всё по-фински.",
  contentHtml: `<p>Тренируем <b>kuka/kuinka/milloin/mikä/mitä/miksi/missä/mistä/mihin/millainen</b> на максималках.</p>`,
  widgets: [
    {
      kind: "matchPairs",
      title: "Сопоставь слово → вопрос",
      pairs: [
        { a: "Kuka",       b: "Kuka sinä olet?" },
        { a: "Kuinka",     b: "Kuinka vanha sinä olet?" },
        { a: "Milloin",    b: "Milloin kurssi on?" },
        { a: "Mikä",       b: "Mikä päivä tänään on?" },
        { a: "Mitä",       b: "Mitä kieltä sinä puhut?" },
        { a: "Miksi",      b: "Miksi et osta jäätelöä?" },
        { a: "Missä",      b: "Missä te asutte?" },
        { a: "Mistä",      b: "Mistä sinä olet kotoisin?" },
        { a: "Mihin",      b: "Mihin tämä bussi menee?" },
        { a: "Millainen",  b: "Millainen sanakirja on?" },
      ],
    },
    {
      kind: "typeAnswer",
      title: "Вставь правильное слово",
      items: [
        { prompt: "___ sinä olet?",               answers: ["kuka"] },
        { prompt: "___ vanha sinä olet?",         answers: ["kuinka"] },
        { prompt: "___ kurssi on?",               answers: ["milloin"] },
        { prompt: "___ päivä tänään on?",         answers: ["mikä"] },
        { prompt: "___ kieltä sinä puhut?",       answers: ["mitä"] },
        { prompt: "___ et osta jäätelöä?",        answers: ["miksi"] },
        { prompt: "___ te asutte?",               answers: ["missä"] },
        { prompt: "___ sinä olet kotoisin?",      answers: ["mistä"] },
        { prompt: "___ tämä bussi menee?",        answers: ["mihin"] },
        { prompt: "___ sanakirja on?",            answers: ["millainen"] },
      ],
    },
    {
      kind: "gridSelect",
      title: "Выбери вопросы о месте",
      rule: "Только Missä / Mistä / Mihin",
      items: [
        { text: "Missä te asutte?",   good: true },
        { text: "Mistä sinä olet?",   good: true },
        { text: "Mihin tämä bussi menee?", good: true },
        { text: "Kuka sinä olet?",    good: false },
        { text: "Milloin kurssi on?", good: false },
        { text: "Miksi et osta jäätelöä?", good: false },
      ],
      timed: 45
    },
  ],
  playlist: "a1-dialogs",
},

{
  id: "a1-koko-pro",
  title: "KO-KÖ (делаем вопрос)",
  level: "A1",
  topic: "синтаксис",
  cover: "/cards/kokokys.png",
  summary: "Матчинг утверждение→вопрос, печать ko/kö-формы, «лишнее».",
  contentHtml: `<p>Ключ: переносим <b>-ko/-kö</b> на первый глагол/olla, задаём вопрос. Для отрицания — <b>etkö</b> и т.п.</p>`,
  widgets: [
    {
      kind: "matchPairs",
      title: "Сопоставь",
      pairs: [
        { a: "Sinä olet suomalainen.",     b: "Oletko (sinä) suomalainen?" },
        { a: "Te etsitte puhelinta.",      b: "Etsittekö (te) puhelinta?" },
        { a: "Hän tanssii diskossa.",      b: "Tanssiiko hän diskossa?" },
        { a: "Sinä et puhu kiinaa.",       b: "Etkö (sinä) puhu kiinaa?" },
      ],
    },
    {
      kind: "typeAnswer",
      title: "Напиши форму с -ko/-kö",
      items: [
        { prompt: "hän tanssii → ?", answers: ["tanssiiko"] },
        { prompt: "te etsitte → ?",  answers: ["etsittekö"] },
        { prompt: "sinä olet → ?",   answers: ["oletko"] },
        { prompt: "sinä et puhu → ?",answers: ["etkö"] },
      ],
    },
    {
      kind: "oddOne",
      title: "Найди лишнее (ошибка в вопросе)",
      groups: [
        { options: ["Oletko sinä väsynyt?", "Sinä oletko väsynyt?", "Oletko väsynyt?"], correctIndex: 1, hint:"-ko/-kö должно стоять на глаголе" },
        { options: ["Puhuuko hän suomea?", "Hän puhuuko suomea?", "Puhuuko hän?"],
          correctIndex: 1 },
      ],
    },
  ],
  playlist: "a1-dialogs",
},
{
  id: "a1-kpt-pro",
  title: "K-P-T-vaihtelu",
  level: "A1",
  topic: "морфология",
  cover: "/cards/kptvaihtelu1.png",
  summary: "Матчинг правил, печать правильной формы с суффиксом.",
  contentHtml: `<p>Сильная→слабая: <b>kk→k, pp→p, tt→t, k→∅, p→v, t→d, nk→ng, mp→mm, nt→nn, lt→ll, rt→rr</b>.</p>`,
  widgets: [
    {
      kind: "matchPairs",
      title: "Правило сильная → слабая",
      pairs: [
        { a: "kk", b: "k" }, { a: "pp", b: "p" }, { a: "tt", b: "t" },
        { a: "k",  b: "∅" }, { a: "p",  b: "v" }, { a: "t",  b: "d" },
        { a: "nk", b: "ng" }, { a: "mp", b: "mm" }, { a: "nt", b: "nn" },
        { a: "lt", b: "ll" }, { a: "rt", b: "rr" },
      ],
    },
    {
      kind: "typeAnswer",
      title: "Сделай форму с чередованием (ответ в нижнем регистре)",
      items: [
        { prompt: "Afrikka + -ssa →",     answers: ["afrikassa"] },
        { prompt: "Eurooppa + -ssa →",    answers: ["euroopassa"] },
        { prompt: "konsertti + -n →",     answers: ["konsertin"] },
        { prompt: "Turku + -ssa →",       answers: ["turussa"] },
        { prompt: "kylpy + -ssä →",       answers: ["kylvyssä"] },
        { prompt: "katu + -lla →",        answers: ["kadulla"] },
      ],
    },
    {
      kind: "memory",
      title: "Мемори: правило → пример",
      pairs: [
        { id:"1", front:"kk→k", back:"Afrikka → Afrikassa" },
        { id:"2", front:"pp→p", back:"Eurooppa → Euroopassa" },
        { id:"3", front:"tt→t", back:"konsertti → konsertin" },
        { id:"4", front:"k→∅",  back:"Turku → Turussa" },
        { id:"5", front:"p→v",  back:"kylpy → kylvyssä" },
        { id:"6", front:"t→d",  back:"katu → kadulla" },
      ],
    },
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-genitive-pro",
  title: "GENETIIVI",
  level: "A1",
  topic: "падежи",
  cover: "/cards/genetiivi2.png",
  summary: "Матчинг основ → генитив, печать форм, лишнее.",
  contentHtml: `<p>Генитив обычно заканчивается на <b>-n</b>: <i>Hugo → Hugon</i>, <i>pitkä kurssi → pitkän kurssin</i>, <i>Helsinki → Helsingin</i>.</p>`,
  widgets: [
    {
      kind: "matchPairs",
      title: "Сопоставь: кто/что → чей/чего",
      pairs: [
        { a:"Hugo", b:"Hugon" },
        { a:"Martin", b:"Martinin" },
        { a:"kiva opettaja", b:"kivan opettajan" },
        { a:"Helsinki", b:"Helsingin" },
        { a:"pitkä kurssi", b:"pitkän kurssin" },
      ],
    },
    {
      kind: "typeAnswer",
      title: "Введи генитив",
      items: [
        { prompt: "Hugo →", answers:["hugon"] },
        { prompt: "kiva opettaja →", answers:["kivan opettajan"] },
        { prompt: "Helsinki →", answers:["helsingin"] },
        { prompt: "pitkä kurssi →", answers:["pitkän kurssin"] },
      ],
    },
    {
      kind: "oddOne",
      title: "Найди лишнее (не генитив)",
      groups: [
        { options:["Hugon tyttöystävä", "Martinin kotimaa", "Helsinki sää"], correctIndex: 2, hint:"Нужен -n" },
        { options:["kivan opettajan nimi","pitkän kurssin opettaja","pitkä kurssi"], correctIndex: 2 },
      ],
    },
  ],
  playlist: "a1-grammar0",
},
/* === ДОБАВИТЬ В КОНЕЦ const LESSONS: Lesson[] = [ ... ] === */

{
  id: "a1-appearance",
  title: "Hän on / Hänellä on (внешность)",
  level: "A1",
  topic: "лексика",
  cover: "/cards/hanella on.png",
  summary: "Он/она «есть» и «у него/неё есть»: прилагательные + волосы/глаза.",
  contentHtml: `
    <p><b>Hän on</b> + прилагательное (kaunis, pitkä...). <b>Hänellä on</b> + сущ. (pitkä tukka, siniset silmät...).</p>
  `,
  widgets: [
    { kind: "flashcards", title: "Фразы", items: [
      { front: "Hän on kaunis." }, { front: "Hän on komea." }, { front: "Hän on söpö." },
      { front: "Hän on pitkä." }, { front: "Hän on lyhyt." }, { front: "Hän on hoikka." },
      { front: "Hän on tukeva." }, { front: "Hän on kalju." },
      { front: "Hänellä on pitkä tukka." }, { front: "Hänellä on lyhyt tukka." },
      { front: "Hänellä on vaaleat hiukset." }, { front: "Hänellä on tummat hiukset." },
      { front: "Hänellä on suorat hiukset." }, { front: "Hänellä on kiharat hiukset." },
      { front: "Hänellä on siniset silmät." }, { front: "Hänellä on vihreät silmät." }, { front: "Hänellä on ruskeat silmät." },
      { front: "Hänellä on silmälasit." }, { front: "Hänellä on parta." }, { front: "Hänellä on viikset." },
    ]},
    { kind:"matchPairs", title:"Подбери «быть» или «у него есть»", pairs:[
      { a:"___ kaunis.", b:"Hän on kaunis." },
      { a:"___ lyhyt tukka.", b:"Hänellä on lyhyt tukka." },
      { a:"___ siniset silmät.", b:"Hänellä on siniset silmät." },
      { a:"___ pitkä.", b:"Hän on pitkä." },
    ]},
    { kind:"gridSelect", title:"Выбор по правилу", rule:"Выбери только предложения с «Hänellä on …»", items:[
      { text:"Hän on komea.", good:false },
      { text:"Hänellä on parta.", good:true },
      { text:"Hänellä on kiharat hiukset.", good:true },
      { text:"Hän on lyhyt.", good:false },
    ], timed: 35 },
    { kind:"typeAnswer", title:"Поставь правильное слово", items:[
      { prompt:"___ komea.", answers:["hän on"] },
      { prompt:"___ suorat hiukset.", answers:["hänellä on"] },
      { prompt:"___ vihreät silmät.", answers:["hänellä on"] },
      { prompt:"___ kalju.", answers:["hän on"] },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-family",
  title: "PERHE — семья",
  level: "A1",
  topic: "лексика",
  cover: "/cards/perhe.png",
  summary: "Родственники + пары RU↔FI и мини-презентация.",
  contentHtml: `<p>isä, äiti, poika, tytär, veli, sisko, isoisä, isoäiti, mies, vaimo, vauva.</p>`,
  widgets: [
    { kind:"flashcards", title:"Слова", items:[
      { front:"isä (отец)" },{ front:"äiti (мать)" },{ front:"poika (сын)" },{ front:"tytär (дочь)" },
      { front:"veli (брат)" },{ front:"sisko (сестра)" },{ front:"isoisä (дедушка)" },{ front:"isoäiti (бабушка)" },
      { front:"mies / aviomies (муж)" },{ front:"vaimo (жена)" },{ front:"vauva (младенец)" },
    ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"отец", b:"isä" },{ a:"мать", b:"äiti" },{ a:"сын", b:"poika" },{ a:"дочь", b:"tytär" },
      { a:"брат", b:"veli" },{ a:"сестра", b:"sisko" },{ a:"дедушка", b:"isoisä" },{ a:"бабушка", b:"isoäiti" },
    ]},
    { kind:"memory", title:"Мемори: RU ↔ FI", pairs:[
      { id:"1", front:"isä", back:"отец" },{ id:"2", front:"äiti", back:"мать" },
      { id:"3", front:"veli", back:"брат" },{ id:"4", front:"sisko", back:"сестра" },
    ]},
    { kind:"randomPrompt", title:"Расскажи про семью", prompts:[
      "Minulla on __ (veli/sisko).","Äitini on __.","Isoisä asuu __ssa.",
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-status",
  title: "Minä olen… (семейное положение)",
  level: "A1",
  topic: "лексика",
  cover: "/cards/naimisissa.png",
  summary: "naimisissa, naimaton/sinkku, kihloissa, eronnut.",
  widgets: [
    { kind:"flashcards", title:"Статусы", items:[
      { front:"Minä olen naimisissa." },{ front:"Minä olen naimaton." },{ front:"Minä olen sinkku." },
      { front:"Minä olen kihloissa." },{ front:"Minä olen eronnut." },
    ]},
    { kind:"typeAnswer", title:"Напиши по-образцу", items:[
      { prompt:"I’m married → Minä olen …", answers:["naimisissa"] },
      { prompt:"I’m single → Minä olen …", answers:["sinkku","naimaton"] },
      { prompt:"I’m engaged → Minä olen …", answers:["kihloissa"] },
      { prompt:"I’m divorced → Minä olen …", answers:["eronnut"] },
    ]},
    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["naimisissa","eronnut","kihloissa","kello"], correctIndex:3, hint:"Один — не статус" },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-partitive-forms",
  title: "PARTITIIVI: формы (-A/-Ä, -TA/-TÄ, -TTA/-TTÄ)",
  level: "A1",
  topic: "падежи",
  cover: "/cards/partitiivi.png",
  summary: "Отработка базовых окончаний + особые -e- слова.",
  contentHtml: `<p>После гласной: -a/-ä. После двух гласных/согласных: -ta/-tä. Слова на -e: -tta/-ttä. Без KPT-вариации.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Основа → партитив", pairs:[
      { a:"talo", b:"taloa" },{ a:"bussi", b:"bussia" },{ a:"kylmä", b:"kylmää" },{ a:"valoisa", b:"valoisaa" },
      { a:"maa", b:"maata" },{ a:"museo", b:"museota" },{ a:"puhelin", b:"puhelinta" },{ a:"kaunis", b:"kaunista" },
      { a:"kirje", b:"kirjettä" },{ a:"vene", b:"venettä" },{ a:"osoite", b:"osoitetta" },{ a:"huone", b:"huonetta" },
    ]},
    { kind:"typeAnswer", title:"Особые слова (ia/ea/ea → -a/ä)", items:[
      { prompt:"Italia →", answers:["italiaa"] },
      { prompt:"vaikea →", answers:["vaikeaa"] },
      { prompt:"pimeä →",  answers:["pimeää"] },
    ]},
    { kind:"oddOne", title:"Найди лишнее (не партитив)", groups:[
      { options:["taloa","museota","kirje","venettä"], correctIndex:2 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-partitive-usage",
  title: "PARTITIIVI: когда употреблять",
  level: "A1",
  topic: "падежи",
  cover: "/cards/partitiivikaytto.png",
  summary: "Числа, глаголы (rakastaa, etsiä, puhua…), отрицание «ei ole».",
  contentHtml: `
    <ul>
      <li><b>Numerot</b>: 4 jäätelö<b>ä</b>, 3 hyvää tietokone<b>tta</b>.</li>
      <li><b>Глаголы</b>: puhua + P, rakastaa + P, etsiä + P, soittaa + P (musiikkia)…</li>
      <li><b>Ei ole</b>: Minulla ei ole auto<b>a</b>.</li>
    </ul>
  `,
  widgets: [
    { kind:"gridSelect", title:"Выбор по правилу", rule:"Глаголы, требующие партитив", items:[
      { text:"rakastaa musiikkia", good:true },
      { text:"puhua suomea", good:true },
      { text:"etsiä avainta", good:true },
      { text:"ymmärtää suomea", good:true },
      { text:"asua Turussa", good:false },
      { text:"olla opettaja", good:false },
    ], timed: 45 },
    { kind:"typeAnswer", title:"Вставь партитив", items:[
      { prompt:"Puhun __ (ruotsi).", answers:["ruotsia"] },
      { prompt:"Julia rakastaa __ (kissa).", answers:["kissaa"] },
      { prompt:"Etsin __ (puhelin).", answers:["puhelinta"] },
      { prompt:"Minulla ei ole __ (auto).", answers:["autoa"] },
    ]},
    { kind:"matchPairs", title:"Число → форма", pairs:[
      { a:"4 jäätelö…", b:"jäätelöä" }, { a:"3 hyvä tietokone…", b:"tietokonetta" },
      { a:"pari tyttö…", b:"tyttöä" }, { a:"paljon sokeri…", b:"sokeria" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-pronouns-partitive",
  title: "Persoonapronominit: PARTITIIVI",
  level: "A1",
  topic: "местоимения",
  cover: "/cards/persoonapronominitp.png",
  summary: "minua, sinua, häntä, meitä, teitä, heitä + примеры.",
  widgets: [
    { kind:"matchPairs", title:"Кто? → Кого? (Part.)", pairs:[
      { a:"minä", b:"minua" },{ a:"sinä", b:"sinua" },{ a:"hän", b:"häntä" },
      { a:"me", b:"meitä" },{ a:"te", b:"teitä" },{ a:"he", b:"heitä" },
    ]},
    { kind:"memory", title:"Мемори: форма ↔ пример", pairs:[
      { id:"1", front:"minua", back:"Julia rakastaa minua." },
      { id:"2", front:"sinua", back:"Julia rakastaa sinua." },
      { id:"3", front:"häntä", back:"Julia rakastaa häntä." },
    ]},
    { kind:"typeAnswer", title:"Вставь местоимение (part.)", items:[
      { prompt:"Julia rakastaa __ (мы).", answers:["meitä"] },
      { prompt:"Julia rakastaa __ (вы).", answers:["teitä"] },
      { prompt:"Julia rakastaa __ (они).", answers:["heitä"] },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-minulla-on",
  title: "MINULLA ON … / У меня есть …",
  level: "A1",
  topic: "модели",
  cover: "/cards/minullaon.png",
  summary: "Положительные и отрицательные (с партитивом) + вопросы Kenellä…?",
  widgets: [
    { kind:"matchPairs", title:"Утвердительные", pairs:[
      { a:"Minulla on koira.", b:"У меня есть собака." },
      { a:"Sinulla on kissa.", b:"У тебя есть кошка." },
      { a:"Hänellä on sauna.", b:"У него/неё есть сауна." },
      { a:"Meillä on televisio.", b:"У нас есть телевизор." },
      { a:"Teillä on pöytä.", b:"У вас есть стол." },
      { a:"Heillä on tytär.", b:"У них есть дочь." },
    ]},
    { kind:"typeAnswer", title:"Отрицание + партитив", items:[
      { prompt:"Minulla __ __ (koira).", answers:["ei ole koiraa"] },
      { prompt:"Sinulla __ __ (kissa).", answers:["ei ole kissaa"] },
      { prompt:"Hänellä __ __ (sauna).", answers:["ei ole saunaa"] },
      { prompt:"Meillä __ __ (televisio).", answers:["ei ole televisiota"] },
    ]},
    { kind:"gridSelect", title:"Вопросы о владельце", rule:"Выбери корректные вопросы/ответы", items:[
      { text:"Kenellä on auto?", good:true },
      { text:"Petrillä on auto.", good:true },
      { text:"Kuka on auto?", good:false },
      { text:"Kenellä auto?", good:false },
    ]},
    { kind:"dialog", title:"Мини-диалог", steps:[
      { text:"A: Onko sinulla auto?", options:[
        { text:"Joo, minulla on vanha auto.", next:1, correct:true },
        { text:"Kyllä, olen auto.", next:1 },
      ]},
      { text:"A: Entä hänellä?", options:[
        { text:"Hänellä ei ole autoa.", next:"end", correct:true },
        { text:"Hän ei auto.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-feelings-no-partitive",
  title: "Minulla on nälkä / ei partitiivia",
  level: "A1",
  topic: "модели",
  cover: "/cards/partitiivi2.png",
  summary: "Minulla on nälkä/jano/kiire/kuuma/kylmä; в отрицании — без партитива.",
  contentHtml: `<p>Особый шаблон: <b>Minulla on nälkä</b> → отрицание: <b>Minulla ei ole nälkä</b> (не *nälkää).</p>`,
  widgets: [
    { kind:"flashcards", title:"Фразы", items:[
      { front:"Minulla on nälkä." },{ front:"Minulla on jano." },{ front:"Minulla on kiire." },
      { front:"Minulla on kuuma." },{ front:"Minulla on kylmä." },
      { front:"Minulla ei ole nälkä." },{ front:"Minulla ei ole jano." },
    ]},
    { kind:"typeAnswer", title:"Сделай отрицание", items:[
      { prompt:"Minulla on nälkä →", answers:["minulla ei ole nälkä"] },
      { prompt:"Minulla on jano →",  answers:["minulla ei ole jano"] },
      { prompt:"Minulla on kuuma →", answers:["minulla ei ole kuuma"] },
      { prompt:"Minulla on kylmä →", answers:["minulla ei ole kylmä"] },
    ]},
    { kind:"gridSelect", title:"Выбери правильные отрицания", rule:"Без партитива", items:[
      { text:"Minulla ei ole jano.", good:true },
      { text:"Minulla ei ole janoa.", good:false },
      { text:"Minulla ei ole kuuma.", good:true },
      { text:"Minulla ei ole kuumaa.", good:false },
    ], timed: 30 },
  ],
  playlist: "a1-grammar0",
},
// === NEW: posters-based lessons (append before the closing "]" of LESSONS) ===
{
  id: "a1-verbtype1",
  title: "VERBITYYPIT: Tyyppi 1 (-A/-Ä)",
  level: "A1",
  topic: "глаголы",
  cover: "/cards/vt1.png",
  summary: "AUTTAA, NUKKUA. Основа, личные формы и KPT.",
  contentHtml: `<p>Тип 1: удалить конечное <b>-a/-ä</b> → добавить личные окончания. KPT по схеме kk→k, pp→p, tt→t…</p>`,
  widgets: [
    { kind:"flashcards", title:"AUTTAA — формы", items:[
      { front:"minä autan" },{ front:"sinä autat" },{ front:"hän auttaa" },
      { front:"me autamme" },{ front:"te autatte" },{ front:"he auttavat" },
    ]},
    { kind:"typeAnswer", title:"Введи форму", items:[
      { prompt:"nukkua (minä) →", answers:["nukun"] },
      { prompt:"nukkua (hän) →", answers:["nukkuu"] },
      { prompt:"auttaa (te) →",   answers:["autatte"] },
      { prompt:"auttaa (he) →",   answers:["auttavat"] },
    ]},
    { kind:"memory", title:"KPT правило ↔ пример", pairs:[
      { id:"1", front:"kk→k", back:"nukkua → nukun" },
      { id:"2", front:"tt→t", back:"auttaa → autan" },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-verbtype2",
  title: "VERBITYYPIT: Tyyppi 2 (DA/DÄ)",
  level: "A1",
  topic: "глаголы",
  cover: "/cards/vt2.png",
  summary: "JUODA + исключения TEHDÄ / NÄHDÄ.",
  contentHtml: `<p>Тип 2: убрать <b>-da/-dä</b> → добавить окончания. TEHDÄ/NÄHDÄ имеют стемы <b>tee-/näe-</b>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Сопоставь форму", pairs:[
      { a:"minä juon", b:"juoda (minä)" },{ a:"sinä juot", b:"juoda (sinä)" },
      { a:"hän juo", b:"juoda (hän)" },{ a:"me juomme", b:"juoda (me)" },
    ]},
    { kind:"typeAnswer", title:"TEHDÄ / NÄHDÄ", items:[
      { prompt:"tehdä (te) →", answers:["teette"] },
      { prompt:"nähdä (he) →", answers:["näkevät"] },
      { prompt:"tehdä (hän) →", answers:["tekee"] },
      { prompt:"nähdä (minä) →", answers:["näen"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-verbtype3",
  title: "VERBITYYPIT: Tyyppi 3 (LA/LÄ, s+TA/TÄ, NA/NÄ, RA/RÄ)",
  level: "A1",
  topic: "глаголы",
  cover: "/cards/vt3.png",
  summary: "TULLA / MENNÄ / NOUSTA. Стем на -E-.",
  contentHtml: `<p>Убери суффикс (<i>la/lä, s+ta/tä, na/nä, ra/rä</i>) → добавь <b>-e-</b> и окончания.</p>`,
  widgets: [
    { kind:"flashcards", title:"Стемы", items:[
      { front:"tule-" },{ front:"mene-" },{ front:"nouse-" },
    ]},
    { kind:"typeAnswer", title:"Введи форму", items:[
      { prompt:"tulla (minä) →", answers:["tulen"] },
      { prompt:"mennä (te) →",  answers:["menette"] },
      { prompt:"nousta (he) →", answers:["nousevat"] },
      { prompt:"mennä (hän) →", answers:["menee"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-verbtype4",
  title: "VERBITYYPIT: Tyyppi 4 (V + TA/TÄ)",
  level: "A1",
  topic: "глаголы",
  cover: "/cards/vt4.png",
  summary: "HALUTA — добавить «-a-».",
  contentHtml: `<p>Убрать <b>-ta/-tä</b>, добавить <b>-a-</b> + окончания: <i>haluan, haluat, haluaa…</i></p>`,
  widgets: [
    { kind:"matchPairs", title:"Лица → формы", pairs:[
      { a:"minä", b:"haluan" },{ a:"sinä", b:"haluat" },{ a:"hän", b:"haluaa" },
      { a:"me", b:"haluamme" },{ a:"te", b:"haluatte" },{ a:"he", b:"haluavat" },
    ]},
    { kind:"typeAnswer", title:"Напечатай", items:[
      { prompt:"haluta (minä) →", answers:["haluan"] },
      { prompt:"haluta (te) →", answers:["haluatte"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-verbtype5",
  title: "VERBITYYPIT: Tyyppi 5 (I + TA/TÄ → -itse-)",
  level: "A1",
  topic: "глаголы",
  cover: "/cards/vt5.png",
  summary: "HÄIRITÄ — вставка -itse-.",
  contentHtml: `<p>Убери <b>-tä</b> и вставь <b>-itse-</b>: <i>häiritsen, häiritset, häiritsee…</i></p>`,
  widgets: [
    { kind:"flashcards", title:"Формы", items:[
      { front:"minä häiritsen" },{ front:"sinä häiritset" },{ front:"hän häiritsee" },
      { front:"me häiritsemme" },{ front:"te häiritsette" },{ front:"he häiritsevät" },
    ]},
    { kind:"typeAnswer", title:"Введи форму", items:[
      { prompt:"häiritä (te) →", answers:["häiritsette"] },
      { prompt:"häiritä (hän) →", answers:["häiritsee"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-gen-kanssa",
  title: "GENETIIVI + kanssa",
  level: "A1",
  topic: "падежи/модели",
  cover: "/cards/genetiivikanssa.png",
  summary: "«с кем?» — генитив + kanssa.",
  contentHtml: `<p>Шаблон: <b>Genetiivi + kanssa</b> — <i>Hän on Hannan kanssa</i>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"Педро живёт с Ханной", b:"Pedro asuu Hannan kanssa" },
      { a:"Ольга на курсе с Педро и Алексом", b:"Olga on Pedron ja Alexin kanssa kurssilla" },
      { a:"Он говорит с учителем", b:"Hän puhuu opettajan kanssa" },
    ]},
    { kind:"typeAnswer", title:"Вставь kanssa", items:[
      { prompt:"Minä olen ___ (Hugo) kurssilla.", answers:["Hugon kanssa"] },
      { prompt:"He ovat ___ (opettaja).", answers:["opettajan kanssa"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-mihin-aikaan",
  title: "Mihin aikaan? — LTА/LTÄ",
  level: "A1",
  topic: "время",
  cover: "/cards/mihinaikaan.png",
  summary: "Час + -lta/-ltä: Yhdeltä, kahdelta…",
  contentHtml: `<p>Ответ на «во сколько?»: <b>kello + число</b> → <b><i>–lta/–ltä</i></b>: <i>kello viideltä</i>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Час → форма", pairs:[
      { a:"kello yksi", b:"yhdeLTÄ" },{ a:"kello kaksi", b:"kahdeLTA" },
      { a:"kello kolme", b:"kolmeLTA" },{ a:"kello neljä", b:"neljäLTÄ" },
      { a:"kello viisi", b:"viideLTÄ" },{ a:"kello kuusi", b:"kuudeLTA" },
    ]},
    { kind:"typeAnswer", title:"Напиши словами", items:[
      { prompt:"в 10 →", answers:["kymmeneltä"] },
      { prompt:"в 8 →", answers:["kahdeksalta"] },
    ]},
  ],
  playlist: "a1-visuals",
},
{
  id: "a1-what-time",
  title: "Mitä kello on?",
  level: "A1",
  topic: "время",
  cover: "/cards/mitakelloon.png",
  summary: "Пол, четверти, «yli/vailla».",
  widgets: [
    { kind:"matchPairs", title:"Фраза → время", pairs:[
      { a:"Kello on neljä", b:"4:00" },
      { a:"Kello on puoli viisi", b:"4:30" },
      { a:"Kello on varttia yli neljä", b:"4:15" },
      { a:"Kello on varttia vaille viisi", b:"4:45" },
    ]},
    { kind:"typeAnswer", title:"Скажи временем по-фински", items:[
      { prompt:"4:00 →", answers:["kello on neljä","kello on 4"] },
      { prompt:"4:30 →", answers:["kello on puoli viisi"] },
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["yli","vailla","kello","sininen"], correctIndex:3, hint:"одно — не про время" },
    ]},
  ],
  playlist: "a1-visuals",
},
{
  id: "a1-mihin-missa-mista",
  title: "MIHIN / MISSÄ / MISTÄ",
  level: "A1",
  topic: "падежи",
  cover: "/cards/mihinmissamista.png",
  summary: "Куда? Где? Откуда? Базовые ответы.",
  contentHtml: `<p><b>Mihin</b> (куда): kotiin, ulos, sisään. <b>Missä</b> (где): kotona, ulkona, sisällä. <b>Mistä</b> (откуда): kotoa, ulkoa, sisältä.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Сопоставь", pairs:[
      { a:"mihin →", b:"kotiin / ulos / sisään" },
      { a:"missä →", b:"kotona / ulkona / sisällä" },
      { a:"mistä →", b:"kotoa / ulkoa / sisältä" },
    ]},
    { kind:"gridSelect", title:"Выбор по правилу", rule:"Только «куда?» (MIHIN)", items:[
      { text:"kotiin", good:true },{ text:"ulkoa", good:false },{ text:"kotona", good:false },
      { text:"sisään", good:true },{ text:"sisältä", good:false },{ text:"ulos", good:true },
    ], timed: 25 },
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-paikallissijat",
  title: "Paikallissijat — местные падежи",
  level: "A1",
  topic: "падежи",
  cover: "/cards/paikallissijat.png",
  summary: "В дом/в доме/из дома; на террасу/на террасе/с террасы.",
  contentHtml: `<p><b>Illatiivi</b> (внутрь): talo<b>on</b>. <b>Inessiivi</b> (внутри): talo<b>ssa</b>. <b>Elatiivi</b> (изнутри): talo<b>sta</b>.<br/>
  <b>Allatiivi</b> (на): terassi<b>lle</b>. <b>Adessiivi</b> (на поверхности): terassi<b>lla</b>. <b>Ablatiivi</b> (с поверхности): terassi<b>lta</b>.</p>`,
  widgets: [
    { kind:"vowelSuffix", title:"Гармония для -ssa/-ssä", words:["Afrikka","Eurooppa","katu","meri","kirje","Suomi"], suffix:"ssa" },
    { kind:"vowelSuffix", title:"Гармония для -lla/-llä", words:["Turku","kirja","kylpy","Helsinki","kylä"], suffix:"lla" },
    { kind:"typeAnswer", title:"Сделай форму", items:[
      { prompt:"talo + -ssa →", answers:["talossa"] },
      { prompt:"talo + -sta →", answers:["talosta"] },
      { prompt:"terassi + -lle →", answers:["terassille"] },
      { prompt:"terassi + -lta →", answers:["terassilta"] },
    ]},
  ],
  playlist: "a1-grammar0",
},
/* === APPEND: новые уроки по постерам === */

{
  id: "a1-illatiivi-big",
  title: "ILLATIIVI — куда? (Vn / hVn / –SEEN)",
  level: "A1",
  topic: "падежи",
  cover: "/cards/illatiivi.png",
  summary: "Три модели образования направительного: kouluun, maahan, Porvooseen.",
  contentHtml: `<p>Правила: <b>Vn</b> (koulu → kouluun), <b>hVn</b> у «коротких» (maa → maahan, puu → puuhun, yö → yöhön), <b>–SEEN</b> у «длинных» (Porvoo → Porvooseen, harmaa → harmaaseen).</p><p><i>HUOM!</i> keittiö → keittiöön.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Основа → illatiivi", pairs:[
      { a:"koulu", b:"kouluun" }, { a:"kauppa", b:"kauppaan" }, { a:"maa", b:"maahan" },
      { a:"puu", b:"puuhun" }, { a:"yö", b:"yöhön" }, { a:"Porvoo", b:"Porvooseen" },
      { a:"harmaa", b:"harmaaseen" }, { a:"vapaa", b:"vapaaseen" }, { a:"keittiö", b:"keittiöön" },
    ]},
    { kind:"typeAnswer", title:"Введи illatiiv", items:[
      { prompt:"koti →", answers:["kotiin"] },
      { prompt:"kaupunki →", answers:["kaupunkiin"] },
      { prompt:"maa →", answers:["maahan"] },
      { prompt:"Porvoo →", answers:["porvooseen"] },
      { prompt:"keittiö →", answers:["keittiöön"] },
    ]},
    { kind:"gridSelect", title:"Выбери только illatiiv", rule:"Только формы 'куда?'", timed: 35, items:[
      { text:"kouluun", good:true }, { text:"koulussa", good:false }, { text:"kaupasta", good:false },
      { text:"puuhun", good:true }, { text:"yöhön", good:true }, { text:"harmaaseen", good:true },
      { text:"keittiössä", good:false }, { text:"terassille", good:false },
    ]},
    { kind:"oddOne", title:"Лишнее (не illatiivi)", groups:[
      { options:["kouluun","maahan","Porvooseen","koulussa"], correctIndex:3 },
      { options:["yöhön","puuhun","keittiöön","keittiöllä"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-iness-adess",
  title: "HUONEESSA ON… / EI OLE + P",
  level: "A1",
  topic: "модели",
  cover: "/cards/huoneessaon.png",
  summary: "Есть/нет в комнате: –ssa/-llä + on; отрицание с партитивом.",
  contentHtml: `<p><b>Huoneessa on …</b> / <b>Lattialla on …</b> — «есть». Отрицание: <b>Huoneessa ei ole pöytää</b>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Соедини пример и перевод", pairs:[
      { a:"Keittiössä on iso pöytä.", b:"В кухне стоит большой стол." },
      { a:"Huoneessa on sohva ja hylly.", b:"В комнате есть диван и полка." },
      { a:"Lattialla on matto.", b:"На полу лежит ковёр." },
    ]},
    { kind:"typeAnswer", title:"Сделай отрицание (без партитива ошибок!)", items:[
      { prompt:"Keittiössä on pöytä →", answers:["keittiössä ei ole pöytää"] },
      { prompt:"Lattialla on matto →",  answers:["lattialla ei ole mattoa"] },
      { prompt:"Huoneessa on tuoli →",  answers:["huoneessa ei ole tuolia"] },
    ]},
    { kind:"gridSelect", title:"Выбери корректные предложения «есть/нет»", rule:"ON / EI OLE + –ssa/-llä", timed: 40, items:[
      { text:"Keittiössä on lamppu.", good:true },
      { text:"Pöytä on keittiö.", good:false },
      { text:"Lattialla ei ole mattoa.", good:true },
      { text:"Huoneessa ei on tuolia.", good:false },
      { text:"Parvekkeella on tuolit.", good:true },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-plural-t",
  title: "Множественное число (-T)",
  level: "A1",
  topic: "морфология",
  cover: "/cards/yksikkomonikko.png",
  summary: "kirja → kirjat, kaupunki → kaupungit (NK→NG).",
  widgets: [
    { kind:"flashcards", title:"Единственное → множественное", items:[
      { front:"kirja → kirjat" }, { front:"kaupunki → kaupungit" }, { front:"opiskelija → opiskelijat" },
      { front:"hyvä ystävä → hyvät ystävät" },
    ]},
    { kind:"matchPairs", title:"Основа → мн. число", pairs:[
      { a:"kirja", b:"kirjat" }, { a:"kaupunki", b:"kaupungit" },
      { a:"opiskelija", b:"opiskelijat" }, { a:"hyvä ystävä", b:"hyvät ystävät" },
    ]},
    { kind:"typeAnswer", title:"Напечатай форму на -t", items:[
      { prompt:"kaupunki →", answers:["kaupungit"] },
      { prompt:"kirja →", answers:["kirjat"] },
      { prompt:"hyvä ystävä →", answers:["hyvät ystävät"] },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-transport-milla",
  title: "Millä sinä matkustat? — на чём едешь",
  level: "A1",
  topic: "лексика",
  cover: "/cards/lentokoneella.png",
  summary: "Авто/бусси/такси/juna/metro/vene/laiva… + Adessiivi -lla/-llä.",
  contentHtml: `<p>Ответ: <b>Men(en) / Matkustan + <i>-lla/-llä</i></b>: <i>autolla, bussilla, junalla…</i> Пешком: <b>kävellen</b>.</p>`,
  widgets: [
    {
      kind: "imageStrip",
      title: "Визуалки",
      items: [
        { src: "/cards/lentokoneella.png", alt: "lentokoneella", caption: "lentokoneella" },
        { src: "/cards/millasinamatkustat.png", alt: "Millä sinä matkustat?", caption: "Millä sinä matkustat?" },
      ],
    },
    { kind:"matchPairs", title:"Транспорт → фраза", pairs:[
      { a:"auto", b:"Menen autolla." }, { a:"bussi", b:"Menen bussilla." }, { a:"juna", b:"Menen junalla." },
      { a:"metro", b:"Menen metrolla." }, { a:"taksi", b:"Menen taksilla." }, { a:"vene", b:"Menen veneellä." },
      { a:"laiva", b:"Menen laivalla." },
    ]},
    { kind:"gridSelect", title:"Выбери только формы с -lla/-llä", rule:"adessiivi транспорта", timed: 30, items:[
      { text:"autolla", good:true }, { text:"juna", good:false }, { text:"junalla", good:true },
      { text:"taksi", good:false }, { text:"taksilla", good:true }, { text:"kävellen", good:false },
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["bussilla","junalla","metrolla","kävellen"], correctIndex:3, hint:"одно — без -lla/-llä" },
    ]},
    { kind:"typeAnswer", title:"Построй по образцу", items:[
      { prompt:"Мы едем на поезде → Me ___ ___", answers:["matkustamme junalla","menemme junalla"] },
      { prompt:"Она поедет на такси → Hän ___ ___", answers:["menee taksilla","matkustaa taksilla"] },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-hotellissa-pro",
  title: "HOTELLISSA — рецепция",
  level: "A1",
  topic: "диалог",
  cover: "/cards/hotellissa.png",
  summary: "Бронирование, заселение, «kuuluu aamiainen», «luovuttaa huone».",
  widgets: [
    { kind:"flashcards", title:"Фразы", items:[
      { front:"Haluaisin varata huoneen nimellä …" },
      { front:"Meillä on varaus nimellä …" },
      { front:"He viipyvät 5 päivää." },
      { front:"Huoneen hintaan kuuluu aamiainen." },
      { front:"Huone täytyy luovuttaa kello 12." },
    ]},
    { kind:"dialog", title:"Мини-диалог на рецепции", steps:[
      { text:"A: Tervetuloa! Onko teillä varaus?", options:[
        { text:"Kyllä, meillä on varaus nimellä Korhonen.", next:1, correct:true },
        { text:"Minä olen kahvila.", next:1 },
      ]},
      { text:"A: Kuinka monta yötä viivytte?", options:[
        { text:"Viisi yötä.", next:2, correct:true },
        { text:"Kello on viisi.", next:2 },
      ]},
      { text:"A: Aamiainen kuuluu hintaan. Huone täytyy luovuttaa kello 12.", options:[
        { text:"Kiitos! Hyvää yötä!", next:"end", correct:true },
        { text:"Olen 25.", next:"end" },
      ]},
    ]},
    { kind:"typeAnswer", title:"Переведи по-ключу", items:[
      { prompt:"У нас есть бронь на имя … → Meillä __ __ __ __", answers:["on varaus nimellä"] },
      { prompt:"Завтрак входит в цену → Aamiainen __ __", answers:["kuuluu hintaan"] },
    ]},
  ],
  playlist: "a1-dialogs",
},

{
  id: "a1-sanatyypit-e",
  title: "SANATYYPPI –E (vene, huone…)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/ste.png",
  summary: "Стем на –e– : veneen, veneeseen, veneessä, veneestä, veneelle/llä/ltä; мн. veneet.",
  contentHtml: `<p>Слова на <b>-e</b>: стем <b>venee-</b>. Примеры: <i>veneen, veneeseen, veneessä, veneestä, veneelle, veneellä, veneeltä</i>. Мн.ч.: <i>veneet</i>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Падеж → форма (vene)", pairs:[
      { a:"GEN", b:"veneen" }, { a:"ILL", b:"veneeseen" }, { a:"INE", b:"veneessä" },
      { a:"ELA", b:"veneestä" }, { a:"ALL", b:"veneelle" }, { a:"ADE", b:"veneellä" }, { a:"ABL", b:"veneeltä" },
      { a:"MON", b:"veneet" },
    ]},
    { kind:"typeAnswer", title:"Сделай форму (ответ в нижнем регистре)", items:[
      { prompt:"huone + -ssa →", answers:["huoneessa"] },
      { prompt:"kirje + -ttä →", answers:["kirjettä"] },
      { prompt:"vene + -lle →", answers:["veneelle"] },
    ]},
    { kind:"memory", title:"Кейс ↔ пример", pairs:[
      { id:"1", front:"INE", back:"huoneessa" },
      { id:"2", front:"ILL", back:"veneeseen" },
      { id:"3", front:"ADE", back:"veneellä" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-sanatyypit-nen",
  title: "SANATYYPPI –NEN (valkoinen)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/stnen.png",
  summary: "Стем -se-: valkoisen, valkoiseen, valkoisessa…",
  contentHtml: `<p><b>-nen</b> → стем <b>-se-</b>: <i>valkoinen → valkoisen, valkoiseen, valkoisessa, valkoiselta…</i></p>`,
  widgets: [
    { kind:"matchPairs", title:"Падеж → форма (valkoinen)", pairs:[
      { a:"GEN", b:"valkoisen" }, { a:"ILL", b:"valkoiseen" }, { a:"INE", b:"valkoisessa" },
      { a:"ELA", b:"valkoisesta" }, { a:"ALL", b:"valkoiselle" }, { a:"ADE", b:"valkoisella" }, { a:"ABL", b:"valkoiselta" },
      { a:"MON", b:"valkoiset" },
    ]},
    { kind:"typeAnswer", title:"Вставь правильную форму", items:[
      { prompt:"punainen + -ssa →", answers:["punaisessa"] },
      { prompt:"iloinen + -n →", answers:["iloisen"] },
      { prompt:"ihminen + -sta →", answers:["ihmisestä"] },
    ]},
    { kind:"oddOne", title:"Лишнее (не –NEN-тип)", groups:[
      { options:["valkoiseen","pankissa","iloisen","punaisessa"], correctIndex:1 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-sanatyypit-i-hotelli",
  title: "SANATYYPPI –I (hotelli, pankki)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/st i.png",
  summary: "«I остаётся»: hotelliin, hotellissa, hotellista; pankkiin, pankissa…",
  widgets: [
    { kind:"matchPairs", title:"Сопоставь", pairs:[
      { a:"hotelli + -in", b:"hotelliin" }, { a:"hotelli + -ssa", b:"hotellissa" }, { a:"hotelli + -sta", b:"hotellista" },
      { a:"pankki + -in", b:"pankkiin" }, { a:"pankki + -ssa", b:"pankissa" }, { a:"pankki + -sta", b:"pankista" },
      { a:"MON (hotelli)", b:"hotellit" },
    ]},
    { kind:"typeAnswer", title:"Напечатай форму", items:[
      { prompt:"pankki + -lle →", answers:["pankille"] },
      { prompt:"hotelli + -lla →", answers:["hotellilla"] },
      { prompt:"pankki + -lta →", answers:["pankilta"] },
    ]},
    { kind:"memory", title:"Место ↔ форма", pairs:[
      { id:"1", front:"в банке", back:"pankissa" },
      { id:"2", front:"к отелю (на)", back:"hotellille" },
      { id:"3", front:"из банка", back:"pankista" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-sanatyypit-i-suuri",
  title: "SANATYYPPI –I→E (suuri → suure-)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/stie.png",
  summary: "i→e в стеме: suuren, suureen, suuressa; мн. suuret.",
  widgets: [
    { kind:"matchPairs", title:"Падеж → форма (suuri)", pairs:[
      { a:"GEN", b:"suuren" }, { a:"ILL", b:"suureen" }, { a:"INE", b:"suuressa" },
      { a:"ELA", b:"suuresta" }, { a:"ALL", b:"suurelle" }, { a:"ADE", b:"suurella" }, { a:"ABL", b:"suurelta" },
      { a:"MON", b:"suuret" },
    ]},
    { kind:"typeAnswer", title:"Сделай форму", items:[
      { prompt:"nuori + -n →", answers:["nuoren"] },
      { prompt:"pieni + -ssa →", answers:["pienessä"] },
      { prompt:"meri + -sta →", answers:["merestä"] },
    ]},
    { kind:"oddOne", title:"Лишнее (ошибка в типе)", groups:[
      { options:["suureen","pienessä","kielessä","hotellissa"], correctIndex:3, hint:"одно — не i→e" },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-sanatyyppi-i-e-lehti-nimi",
  title: "SANATYYPPI I→E (lehti / nimi)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/sti.png",
  summary: "Стем на -e-: nime-, lehde- + KPT.",
  contentHtml: `<p><b>-i → -e-</b>: <i>nimi → nime-</i>, <i>lehti → lehde-</i>. Дальше обычные падежные суффиксы. Помни KPT: kk→k, pp→p, tt→t…</p>`,
  widgets: [
    { kind:"matchPairs", title:"Падеж → форма (lehti)", pairs:[
      { a:"GEN", b:"lehden" },{ a:"ILL", b:"lehteen" },{ a:"INE", b:"lehdessä" },
      { a:"ELA", b:"lehdestä" },{ a:"ALL", b:"lehdelle" },{ a:"ADE", b:"lehdellä" },{ a:"ABL", b:"lehdeltä" },
      { a:"MON", b:"lehdet" },
    ]},
    { kind:"typeAnswer", title:"Сделай форму (nimi)", items:[
      { prompt:"nimi + -n →", answers:["nimen"] },
      { prompt:"nimi + -ssä →", answers:["nimessä"] },
      { prompt:"nimi + -stä →", answers:["nimestä"] },
      { prompt:"nimi + -lle →", answers:["nimelle"] },
    ]},
    { kind:"memory", title:"Правило ↔ пример", pairs:[
      { id:"1", front:"i→e", back:"nimi → nimen" },
      { id:"2", front:"t→d", back:"lehti → lehden" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-sanatyyppi-si",
  title: "SANATYYPPI –SI (uusi, vesi, kuukausi)",
  level: "A1",
  topic: "склонение",
  cover: "/cards/stsi.png",
  summary: "uusi → uude-, vesi → vede-, kuukausi → kuukaude-.",
  contentHtml: `<p>В -SI словах чаще всего стем на <b>-de-</b>: <i>uusi → uude-</i>, <i>vesi → vede-</i>, <i>kuukausi → kuukaude-</i>.</p>`,
  widgets: [
    { kind:"matchPairs", title:"Основа → GEN", pairs:[
      { a:"uusi", b:"uuden" },{ a:"vesi", b:"veden" },{ a:"kuukausi", b:"kuukauden" },
      { a:"käsi", b:"käden" },{ a:"viisi", b:"viiden" },
    ]},
    { kind:"typeAnswer", title:"Введи нужную форму", items:[
      { prompt:"uusi + -ssa →", answers:["uudessa"] },
      { prompt:"vesi + -sta →", answers:["vedestä"] },
      { prompt:"kuukausi + -in →", answers:["kuukauteen"] },
      { prompt:"käsi + -llä →", answers:["kädellä"] },
    ]},
    { kind:"oddOne", title:"Лишнее (не –SI)", groups:[
      { options:["uuden","vedessä","kuukauden","suuren"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-demonstratives",
  title: "DEMONSTRATIIVIT: tämä / tuo / se",
  level: "A1",
  topic: "местоимения",
  cover: "/cards/demostratiivipronominittama.png", // можешь поставить коллаж или любую из трёх картинок
  summary: "Формы tämä/tuo/se в местных падежах.",
  contentHtml: `<p><b>Tämä</b> (вот это рядом), <b>tuo</b> (вон то), <b>se</b> (оно/он/она вне фокуса). Тренируем формы: <i>tässä–tästä–tähän</i>, <i>tuossa–tuosta–tuohon</i>, <i>siinä–siitä–siihen</i>.</p>`,
  widgets: [
    { kind: "imageStrip", items:[
       { src: "/cards/demostratiivipronominittama.png", alt: "tämä — рядом",  caption: "tämä" },
       { src: "/cards/demostratiivipronominittuo.png",  alt: "tuo — вон там", caption: "tuo" },
       { src: "/cards/demostratiivipronominitse.png",   alt: "se — вне фокуса", caption: "se" },
      ],
    },
    { kind:"matchPairs", title:"TÄMÄ: падеж → форма", pairs:[
      { a:"INE", b:"tässä" },{ a:"ELA", b:"tästä" },{ a:"ILL", b:"tähän" },
    ]},
    { kind:"matchPairs", title:"TUO: падеж → форма", pairs:[
      { a:"INE", b:"tuossa" },{ a:"ELA", b:"tuosta" },{ a:"ILL", b:"tuohon" },
    ]},
    { kind:"typeAnswer", title:"SE: напечатай форму", items:[
      { prompt:"(INE) ___ on kahvila.", answers:["siinä"] },
      { prompt:"(ELA) Hän tulee ___ .", answers:["siitä"] },
      { prompt:"(ILL) Mene ___ !", answers:["siihen"] },
    ]},
    { kind:"gridSelect", title:"Выбери формы «где?»", rule:"только INE", items:[
      { text:"tässä", good:true },{ text:"tähän", good:false },{ text:"tuossa", good:true },
      { text:"siinä", good:true },{ text:"siihen", good:false },{ text:"tuosta", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-mika-cases",
  title: "KYSYMYS: MIKÄ — формы",
  level: "A1",
  topic: "вопросы",
  cover: "/cards/kysymyssanamika.png",
  summary: "mikä/mitä + minkä, mihin, missä, mistä, mille, millä, miltä, mon. mitkä.",
  widgets: [
    { kind:"matchPairs", title:"Падеж → форма", pairs:[
      { a:"GEN", b:"minkä" },{ a:"ILL", b:"mihin" },{ a:"INE", b:"missä" },
      { a:"ELA", b:"mistä" },{ a:"ALL", b:"mille" },{ a:"ADE", b:"millä" },{ a:"ABL", b:"miltä" },
      { a:"MON", b:"mitkä" },
    ]},
    { kind:"typeAnswer", title:"Вставь правильное слово", items:[
      { prompt:"___ päivä tänään on?", answers:["mikä"] },
      { prompt:"___ hän menee?", answers:["mihin"] },
      { prompt:"___ sinä asut?", answers:["missä"] },
      { prompt:"___ värinen auto?", answers:["minkä"] },
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["mistä","mihin","mikä","siinä"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-dialogs",
},

{
  id: "a1-ainesanat-1",
  title: "Ainesanat PARTITIIVISSA — что это?",
  level: "A1",
  topic: "падежи",
  cover: "/cards/ainesanatpartitiivissa.png",
  summary: "Масс-существительные: еда/материалы/абстрактные.",
  contentHtml: `<p><b>Ainesana</b> — масс-существительное: салат, riisi, tee, vesi; ilma, metalli; rakkaus, ystävyys… Часто идут в <b>partitiivi</b>.</p>`,
  widgets: [
    { kind:"gridSelect", title:"Выбери масс-слова", rule:"только ainesanat", items:[
      { text:"vesi", good:true },{ text:"salaatti", good:true },{ text:"riisi", good:true },
      { text:"kirja", good:false },{ text:"talo", good:false },{ text:"pöytä", good:false },
    ], timed: 30 },
    { kind:"matchPairs", title:"RU → FI (масса)", pairs:[
      { a:"вода", b:"vesi" },{ a:"рис", b:"riisi" },{ a:"металл", b:"metalli" },{ a:"любовь", b:"rakkaus" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-ainesanat-2",
  title: "Ainesanat PARTITIIVISSA — употребление",
  level: "A1",
  topic: "падежи",
  cover: "/cards/ainesanatpartitiivissa1.png",
  summary: "В конце предложения, с прилагательным, примеры с kahvi/ spaghetti / rakkaus.",
  widgets: [
    { kind:"matchPairs", title:"Фраза → перевод", pairs:[
      { a:"Tämä on kahvia.", b:"Это кофе." },
      { a:"Kupissa on kahvia.", b:"В чашке есть кофе." },
      { a:"Kahvi on kuumaa.", b:"Кофе горячий." },
      { a:"Spagetti on hyvää.", b:"Спагетти вкусные." },
    ]},
    { kind:"typeAnswer", title:"Вставь партитив", items:[
      { prompt:"Kupissa on __ (kahvi).", answers:["kahvia"] },
      { prompt:"Rakkaus on __ (kaunis).", answers:["kaunista"] },
      { prompt:"Spagetti on __ (hyvä).", answers:["hyvää"] },
    ]},
    { kind:"oddOne", title:"Лишнее (не про ainesanat)", groups:[
      { options:["Tämä on kahvia.","Juon kahvia.","Kirja on hyvä.","Kupissa on kahvia."], correctIndex:2 },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-partitiivin-monikko",
  title: "PARTITIIVIN MONIKKO",
  level: "A1",
  topic: "падежи",
  cover: "/cards/partitiivinmonikko.png",
  summary: "ja/jä, ia/iä, ita/itä: три пути к партитивному мн. ч. + МНОГО игр.",
  contentHtml: `
    <p><b>ja/jä</b> — часто после o/ö/u/y и «-A»-основ: <i>juustoja, tyttöjä</i>.</p>
    <p><b>ia/iä</b> — основы на a/ä/i и -nen: <i>leipiä, pieniä, herkullisia</i>.</p>
    <p><b>ita/itä</b> — <i>e</i>-слова и долгие гласные/дифтонги/ка-ла-на-ра: <i>herneitä, jäitä, mansikoita</i>.</p>
  `,
  widgets: [
    /* 0) шпаргалка-постеры */
    {
      kind: "imageStrip",
      title: "Шпаргалка",
      items: [
        { src: "/cards/partitiivinmonikko.png",  alt: "ja/jä",  caption: "ja / jä" },
        { src: "/cards/partitiivinmonikko2.png", alt: "ia/iä",  caption: "ia / iä" },
        { src: "/cards/partitiivim.png",        alt: "ita/itä",caption: "ita / itä" },
      ],
    },

    /* 1) базовый матчинг ед.→мн. (повтор) */
    { kind:"matchPairs", title:"Ед. число → партитив мн.ч.", pairs:[
      { a:"juusto", b:"juustoja" }, { a:"tyttö", b:"tyttöjä" }, { a:"kurkku", b:"kurkkuja" }, { a:"hylly", b:"hyllyjä" },
      { a:"tomaatti", b:"tomaatteja" }, { a:"keksi", b:"keksejä" }, { a:"pizza", b:"pizzoja" }, { a:"kala", b:"kaloja" },
      { a:"leipä", b:"leipiä" }, { a:"pieni", b:"pieniä" }, { a:"herne", b:"herneitä" }, { a:"tuore", b:"tuoreita" },
      { a:"jää", b:"jäitä" }, { a:"suklaa", b:"suklaita" }, { a:"mansikka", b:"mansikoita" },
      { a:"sämpylä", b:"sämpylöitä" }, { a:"peruna", b:"perunoita" }, { a:"makkara", b:"makkaroita" },
      { a:"herkullinen", b:"herkullisia" }, { a:"hampurilainen", b:"hampurilaisia" },
    ]},

    /* 2) верно/неверно написано (орфография) */
    { kind:"gridSelect", title:"Верное написание?", rule:"Кликаем ТОЛЬКО правильные формы", timed: 35, items:[
      { text:"juustoja", good:true }, { text:"tyttöjä", good:true }, { text:"kurkkujä", good:false },
      { text:"hyllyjä", good:true }, { text:"tomaattejä", good:false }, { text:"keksejä", good:true },
      { text:"pizzaja", good:false }, { text:"kaloja", good:true }, { text:"leipiä", good:true },
      { text:"herneita", good:false }, { text:"jäitä", good:true }, { text:"suklaita", good:true },
      { text:"mansikoita", good:true }, { text:"perunoita", good:true }, { text:"makkaroitta", good:false },
    ]},

    /* 3–5) три фильтра по правилам */
    { kind:"gridSelect", title:"Фильтр: только –ja/–jä", rule:"juustoja, tyttöjä…", timed: 30, items:[
      { text:"juustoja", good:true }, { text:"tyttöjä", good:true }, { text:"kurkkuja", good:true }, { text:"hyllyjä", good:true },
      { text:"leipiä", good:false }, { text:"herneitä", good:false }, { text:"mansikoita", good:false }, { text:"pizzoja", good:true },
    ]},

    { kind:"gridSelect", title:"Фильтр: только –ia/–iä", rule:"leipiä, pieniä, –nen → –isia", timed: 30, items:[
      { text:"leipiä", good:true }, { text:"pieniä", good:true }, { text:"herkullisia", good:true }, { text:"hampurilaisia", good:true },
      { text:"juustoja", good:false }, { text:"herneitä", good:false }, { text:"mansikoita", good:false }, { text:"kaloja", good:false },
    ]},

    { kind:"gridSelect", title:"Фильтр: только –ita/–itä", rule:"herneitä, jäitä, mansikoita…", timed: 30, items:[
      { text:"herneitä", good:true }, { text:"tuoreita", good:true }, { text:"jäitä", good:true }, { text:"suklaita", good:true },
      { text:"mansikoita", good:true }, { text:"sämpylöitä", good:true }, { text:"perunoita", good:true }, { text:"makkaroita", good:true },
      { text:"pieniä", good:false }, { text:"juustoja", good:false },
    ]},

    /* 6) правило → пример (мемори) */
    { kind:"memory", title:"Мемори: правило ↔ пример", pairs:[
      { id:"r1", front:"ja/jä", back:"juustoja" },
      { id:"r2", front:"ia/iä", back:"leipiä" },
      { id:"r3", front:"ita/itä (E-слово)", back:"herneitä" },
      { id:"r4", front:"ita/itä (долгая гласная)", back:"jäitä" },
      { id:"r5", front:"ita/itä (KA/LA/NA/RA)", back:"mansikoita" },
    ]},

    /* 7) сопоставь слово → правило (метаякоря) */
    { kind:"matchPairs", title:"Слово → правило", pairs:[
      { a:"juusto", b:"ja/jä" }, { a:"tyttö", b:"ja/jä" }, { a:"leipä", b:"ia/iä" }, { a:"pieni", b:"ia/iä" },
      { a:"herkullinen", b:"ia/iä" }, { a:"herne", b:"ita/itä" }, { a:"jää", b:"ita/itä" },
      { a:"mansikka", b:"ita/itä" }, { a:"peruna", b:"ita/itä" },
    ]},

    /* 8) печать формы — чистая морфология */
    { kind:"typeAnswer", title:"Напечатай правильную форму (морфология)", items:[
      { prompt:"juusto →", answers:["juustoja"] },
      { prompt:"tyttö →", answers:["tyttöjä"] },
      { prompt:"kala →", answers:["kaloja"] },
      { prompt:"leipä →", answers:["leipiä"] },
      { prompt:"pieni →", answers:["pieniä"] },
      { prompt:"herne →", answers:["herneitä"] },
      { prompt:"tuore →", answers:["tuoreita"] },
      { prompt:"jää →", answers:["jäitä"] },
      { prompt:"suklaa →", answers:["suklaita"] },
      { prompt:"mansikka →", answers:["mansikoita"] },
      { prompt:"peruna →", answers:["perunoita"] },
      { prompt:"sämpylä →", answers:["sämpylöitä"] },
      { prompt:"makkara →", answers:["makkaroita"] },
      { prompt:"herkullinen →", answers:["herkullisia"] },
      { prompt:"hampurilainen →", answers:["hampurilaisia"] },
    ]},

    /* 9) печать в контексте — чтобы зашёл смысл */
    { kind:"typeAnswer", title:"Вставь мн.ч. партитив в фразы", items:[
      { prompt:"Ostan __ (mansikka).", answers:["mansikoita"] },
      { prompt:"Rakastan __ (keksi).", answers:["keksejä"] },
      { prompt:"Tarvitsen __ (juusto).", answers:["juustoja"] },
      { prompt:"Kaupassa on paljon __ (peruna).", answers:["perunoita"] },
      { prompt:"Pidän __ (pieni, pl.) kursseista.", answers:["pieniä"] },
      { prompt:"Leivon kakkuun __ (suklaa).", answers:["suklaita"] },
    ]},

    /* 10) лишнее — быстрая диагностика */
    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["juustoja","tyttöjä","kurkkuja","leipiä"], correctIndex:3, hint:"три — на –ja/–jä" },
      { options:["leipiä","pieniä","herkullisia","makkaroita"], correctIndex:3, hint:"три — на –ia/–iä" },
      { options:["jäitä","mansikoita","herneitä","keksejä"], correctIndex:3, hint:"три — на –ita/–itä" },
    ]},

    /* 11) магазин — выбирай правильные реплики с объектом в P.pl */
    { kind:"dialog", title:"Kaupassa (выбор правильной формы)", steps:[
      { text:"A: Mitä ostat?", options:[
        { text:"Ostan mansikoita ja keksejä.", next:1, correct:true },
        { text:"Ostan mansikat ja keksit.", next:1 },
      ]},
      { text:"A: Tarvitsetko vielä jotain?", options:[
        { text:"Joo, tarvitsen juustoja.", next:2, correct:true },
        { text:"Joo, tarvitsen juustot.", next:2 },
      ]},
      { text:"A: Selvä! Haluatko pizzoja?", options:[
        { text:"En, mutta haluan perunoita.", next:"end", correct:true },
        { text:"En, mutta haluan perunat.", next:"end" },
      ]},
    ]},

    /* 12) быстрый «выбор по картинке»: только прилагательные в P.pl */
    { kind:"gridSelect", title:"Прилагательные в P.mon.", rule:"Выбери только прилагательные в партитиве мн.ч.", timed: 25, items:[
      { text:"pieniä", good:true }, { text:"herkullisia", good:true }, { text:"pitkiä", good:true },
      { text:"pieni", good:false }, { text:"herneitä", good:false }, { text:"kaloja", good:false },
    ]},

    /* 13) ещё один матчинг «основа → форма» с tricky словами */
    { kind:"matchPairs", title:"Тренировка 2 (больше слов)", pairs:[
      { a:"omena", b:"omenoita" }, { a:"museo", b:"museoita" }, { a:"huone", b:"huoneita" },
      { a:"yö", b:"öitä" }, { a:"maa", b:"maita" }, { a:"puu", b:"puita" },
      { a:"kauppa", b:"kauppoja" },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-jarjestysluvut",
  title: "JÄRJESTYSLUVUT — порядковые",
  level: "A1",
  topic: "числа",
  cover: "/cards/jarjestysluvut.png",
  summary: "1-й…10-й, 11–19 (—toista), 20-й/30-й и составные: kahdeskymmenesensimmäinen.",
  contentHtml: `
    <p><b>1–10</b>: ensimmäinen, toinen, kolmas, neljäs, viides, kuudes, seitsemäs, kahdeksas, yhdeksäs, kymmenes.</p>
    <p><b>11–19</b> = <i>—toista</i>: yhdestoista, kahdestoista, …, yhdeksästoista.</p>
    <p><b>20-й, 30-й</b>: kahdeskymmenes, kolmaskymmenes. <b>21-й</b> = kahdeskymmenes + ensimmäinen → <i>kahdeskymmenesensimmäinen</i>.</p>
  `,
  widgets: [
    /* постер */
    { kind:"imageStrip", title:"Шпаргалка", items:[
      { src:"/cards/jarjestysluvut.png", alt:"järjestysluvut", caption:"порядковые числительные" },
    ]},

    /* флеш-карточки 1–10 */
    { kind:"flashcards", title:"1-й … 10-й", items:[
      { front:"ensimmäinen" },{ front:"toinen" },{ front:"kolmas" },{ front:"neljäs" },{ front:"viides" },
      { front:"kuudes" },{ front:"seitsemäs" },{ front:"kahdeksas" },{ front:"yhdeksäs" },{ front:"kymmenes" },
    ]},

    /* порядок 1–10 */
    { kind:"order", title:"Расставь по порядку (1–10)", sequence:[
      "ensimmäinen","toinen","kolmas","neljäs","viides","kuudes","seitsemäs","kahdeksas","yhdeksäs","kymmenes"
    ]},

    /* цифра → слово (включая «сложные» формы) */
    { kind:"matchPairs", title:"Цифра → порядковый", pairs:[
      { a:"1-й",  b:"ensimmäinen" },
      { a:"2-й",  b:"toinen" },
      { a:"3-й",  b:"kolmas" },
      { a:"4-й",  b:"neljäs" },
      { a:"5-й",  b:"viides" },
      { a:"10-й", b:"kymmenes" },
      { a:"11-й", b:"yhdestoista" },
      { a:"12-й", b:"kahdestoista" },
      { a:"14-й", b:"neljästoista" },
      { a:"19-й", b:"yhdeksästoista" },
      { a:"20-й", b:"kahdeskymmenes" },
      { a:"21-й", b:"kahdeskymmenesensimmäinen" },
      { a:"22-й", b:"kahdeskymmenestoinen" },
      { a:"30-й", b:"kolmaskymmenes" },
      { a:"31-й", b:"kolmaskymmenesensimmäinen" },
    ]},

    /* фильтры */
    { kind:"gridSelect", title:"Выбери только 11–19", rule:"только слова на –toista", timed: 35, items:[
      { text:"yhdestoista", good:true },{ text:"kahdestoista", good:true },
      { text:"kolmastoista", good:true },{ text:"yhdeksästoista", good:true },
      { text:"kymmenes", good:false },{ text:"kahdeskymmenes", good:false },{ text:"kolmas", good:false },
    ]},
    { kind:"gridSelect", title:"Выбери только «десятки» (20-й, 30-й…)", rule:"–kymmenes", timed: 25, items:[
      { text:"kahdeskymmenes", good:true },{ text:"kolmaskymmenes", good:true },
      { text:"neljäs", good:false },{ text:"yhdestoista", good:false },{ text:"kahdeskymmenesensimmäinen", good:false },
    ]},
    { kind:"gridSelect", title:"Только порядковые (не количественные)", rule:"ensimmäinen/kolmas… — но не yksi/kolme", timed: 30, items:[
      { text:"ensimmäinen", good:true },{ text:"toinen", good:true },{ text:"kolmas", good:true },
      { text:"yksi", good:false },{ text:"kaksi", good:false },{ text:"kolme", good:false },
    ]},

    /* печать ответов */
    { kind:"typeAnswer", title:"Напечатай по-фински (без точки)", items:[
      { prompt:"3-й →",  answers:["kolmas"] },
      { prompt:"7-й →",  answers:["seitsemäs"] },
      { prompt:"11-й →", answers:["yhdestoista"] },
      { prompt:"14-й →", answers:["neljästoista"] },
      { prompt:"20-й →", answers:["kahdeskymmenes"] },
      { prompt:"21-й →", answers:["kahdeskymmenesensimmäinen"] },
      { prompt:"30-й →", answers:["kolmaskymmenes"] },
    ]},

    /* мемори: цифра ↔ слово */
    { kind:"memory", title:"Мемори: 1st/5th/11th/20th/21st", pairs:[
      { id:"m1", front:"1st",  back:"ensimmäinen" },
      { id:"m5", front:"5th",  back:"viides" },
      { id:"m11", front:"11th", back:"yhdestoista" },
      { id:"m20", front:"20th", back:"kahdeskymmenes" },
      { id:"m21", front:"21st", back:"kahdeskymmenesensimmäinen" },
    ]},

    /* лишнее */
    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["ensimmäinen","kolmas","kahdeksas","kahdeksan"], correctIndex:3, hint:"одно — количественное" },
      { options:["yhdestoista","kahdestoista","kolmaskymmenes","kaksikymmentä"], correctIndex:3, hint:"одно — количество (20)" },
    ]},

    /* мини-диалог */
    { kind:"dialog", title:"Monesko …?", steps:[
      { text:"A: Monesko kerros?", options:[
        { text:"Kolmas kerros.", next:1, correct:true },
        { text:"Kolme kerros.", next:1 },
      ]},
      { text:"A: Monesko päivä tänään on?", options:[
        { text:"Se on kahdeskymmenesensimmäinen.", next:2, correct:true },
        { text:"Se on kaksikymmentä yksi.", next:2 },
      ]},
      { text:"A: Onko tämä sinun toinen kurssi?", options:[
        { text:"Kyllä, tämä on toinen.", next:"end", correct:true },
        { text:"Kyllä, tämä on kaksi.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-visuals",
},
{
  id: "a1-mista-post",
  title: "MISTÄ? — откуда/с какого места",
  level: "A1",
  topic: "падежи/направления",
  cover: "/cards/mista.png",
  summary: "edestä, takaa, vierestä… oikealta/vasemmalta puolelta, välistä, keskeltä, ympäriltä, äärestä, päältä, alta.",
  contentHtml: `<p>Вопрос <b>MISTÄ?</b> (откуда, из-откуда, с какого места). Частые формы-ответы: <i>edestä, takaa, vierestä, oikealta/vasemmalta puolelta, välistä, keskeltä, ympäriltä, äärestä, päältä, alta</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/mista.png", alt:"MISTÄ" }]},

    { kind:"flashcards", title:"Формы MISTÄ", items:[
      { front:"edestä (из-перед)" },{ front:"takaa (из-за/сзади)" },{ front:"vierestä (от/рядом с)" },
      { front:"oikealta puolelta (с правой стороны)" },{ front:"vasemmalta puolelta (с левой стороны)" },
      { front:"välistä (из-между)" },{ front:"keskeltä (из середины)" },{ front:"ympäriltä (вокруг, от окружения)" },
      { front:"äärestä (от края/из-за)" },{ front:"päältä (сверху)" },{ front:"alta (из-под)" },
    ]},

    { kind:"matchPairs", title:"RU → FI (MISTÄ)", pairs:[
      { a:"спереди / из-перед", b:"edestä" },
      { a:"из-за / сзади", b:"takaa" },
      { a:"от / рядом с", b:"vierestä" },
      { a:"с правой стороны", b:"oikealta puolelta" },
      { a:"с левой стороны", b:"vasemmalta puolelta" },
      { a:"из-между", b:"välistä" },
      { a:"из середины", b:"keskeltä" },
      { a:"вокруг (от)", b:"ympäriltä" },
      { a:"от края", b:"äärestä" },
      { a:"сверху", b:"päältä" },
      { a:"из-под", b:"alta" },
    ]},

    { kind:"gridSelect", title:"Выбор по правилу", rule:"Только MISTÄ (из/с-откуда?)", timed: 40, items:[
      { text:"edestä", good:true },{ text:"takaa", good:true },{ text:"vierestä", good:true },
      { text:"oikealta puolelta", good:true },{ text:"vasemmalta puolelta", good:true },{ text:"välistä", good:true },
      { text:"keskeltä", good:true },{ text:"ympäriltä", good:true },{ text:"äärestä", good:true },
      { text:"päältä", good:true },{ text:"alta", good:true },
      { text:"edessä", good:false },{ text:"eteen", good:false },{ text:"päälle", good:false },
    ]},

    { kind:"typeAnswer", title:"Вставь форму (только слово)", items:[
      { prompt:"Joku juoksi auton ___ .", answers:["edestä"] },
      { prompt:"Löysin tämän kaapin ___ .", answers:["takaa"] },
      { prompt:"Hän juoksi autojen ___ .", answers:["välistä"] },
      { prompt:"Otin kirjan pöydän ___ .", answers:["päältä"] },
      { prompt:"Hänet on kai raahattu pois pöydän ___ .", answers:["alta"] },
    ]},

    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["edestä","takaa","päältä","eteen"], correctIndex:3, hint:"одно — MIHIN" },
      { options:["keskeltä","oikealta puolelta","vasemmalta puolelta","keskelle"], correctIndex:3 },
    ]},

    { kind:"memory", title:"Мемори: форма ↔ пример", pairs:[
      { id:"1", front:"edestä", back:"Joku juoksi auton edestä." },
      { id:"2", front:"takaa", back:"Löysin tämän kaapin takaa." },
      { id:"3", front:"päältä", back:"Otin kirjan pöydän päältä." },
      { id:"4", front:"alta", back:"Hänet on kai raahattu pois pöydän alta." },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-mihin-post",
  title: "MIHIN? — куда/на какое место",
  level: "A1",
  topic: "падежи/направления",
  cover: "/cards/mihin.png",
  summary: "eteen, taakse, viereen, oikealle/vasemmalle puolelle, väliin, keskelle, ympärille, ääreen, päälle, alle.",
  contentHtml: `<p>Вопрос <b>MIHIN?</b> (куда/на что). Формы-ответы: <i>eteen, taakse, viereen, oikealle/vasemmalle puolelle, väliin, keskelle, ympärille, ääreen, päälle, alle</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/mihin.png", alt:"MIHIN" }]},

    { kind:"matchPairs", title:"RU → FI (MIHIN)", pairs:[
      { a:"вперёд / к переду", b:"eteen" },
      { a:"назад / за", b:"taakse" },
      { a:"к / рядом с", b:"viereen" },
      { a:"к правой стороне", b:"oikealle puolelle" },
      { a:"к левой стороне", b:"vasemmalle puolelle" },
      { a:"между (в)", b:"väliin" },
      { a:"в середину", b:"keskelle" },
      { a:"вокруг (об)", b:"ympärille" },
      { a:"к краю", b:"ääreen" },
      { a:"на / поверх", b:"päälle" },
      { a:"под", b:"alle" },
    ]},

    { kind:"typeAnswer", title:"Допиши правильно (только слово)", items:[
      { prompt:"Ajamme auton talon ___ .", answers:["taakse"] },
      { prompt:"Laskeduimme talon ___ .", answers:["viereen"] },
      { prompt:"Kolme meistä juoksi talon ___ .", answers:["oikealle puolelle"] },
      { prompt:"Puu kaatui talon ___ .", answers:["päälle"] },
      { prompt:"Pöydän ___ !", answers:["alle"] },
    ]},

    { kind:"gridSelect", title:"Выбор по правилу", rule:"Только MIHIN (куда?)", timed: 40, items:[
      { text:"eteen", good:true },{ text:"taakse", good:true },{ text:"viereen", good:true },
      { text:"oikealle puolelle", good:true },{ text:"vasemmalle puolelle", good:true },{ text:"väliin", good:true },
      { text:"keskelle", good:true },{ text:"ympärille", good:true },{ text:"ääreen", good:true },
      { text:"päälle", good:true },{ text:"alle", good:true },
      { text:"edessä", good:false },{ text:"edestä", good:false },{ text:"päällä", good:false },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["eteen","taakse","keskelle","keskeltä"], correctIndex:3, hint:"одно — MISTÄ" },
      { options:["päälle","alle","viereen","vieressä"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-missa-post",
  title: "MISSÄ? — где/на каком месте",
  level: "A1",
  topic: "падежи/место",
  cover: "/cards/missa.png",
  summary: "edessä, takana, vieressä, oikealla/vasemmalla puolella, välissä, keskellä, ympärillä, ääressä, päällä, alla.",
  contentHtml: `<p>Вопрос <b>MISSÄ?</b> (где). Формы-ответы: <i>edessä, takana, vieressä, oikealla/vasemmalla puolella, välissä, keskellä, ympärillä, ääressä, päällä, alla</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/missa.png", alt:"MISSÄ" }]},

    { kind:"matchPairs", title:"FI → RU (MISSÄ)", pairs:[
      { a:"edessä", b:"перед" },{ a:"takana", b:"позади/за" },{ a:"vieressä", b:"рядом/возле" },
      { a:"oikealla puolella", b:"справа" },{ a:"vasemmalla puolella", b:"слева" },
      { a:"välissä", b:"между" },{ a:"keskellä", b:"посередине" },{ a:"ympärillä", b:"вокруг" },
      { a:"ääressä", b:"у/за" },{ a:"päällä", b:"на/сверху" },{ a:"alla", b:"под" },
    ]},

    { kind:"typeAnswer", title:"Вставь форму (только слово)", items:[
      { prompt:"Mikko istuu ikkunan ___ .", answers:["edessä"] },
      { prompt:"Vieraat polttavat tupakkaa oven ___ .", answers:["takana"] },
      { prompt:"Pieni pöytä on sohvan ___ .", answers:["vieressä"] },
      { prompt:"Julia istuu Alexin ___ .", answers:["oikealla puolella"] },
      { prompt:"Lampunlaatikko on kaapin ___ .", answers:["päällä"] },
      { prompt:"Julian lasi on pöydän ___ .", answers:["alla"] },
    ]},

    { kind:"gridSelect", title:"Выбор по правилу", rule:"Только MISSÄ (где?)", timed: 40, items:[
      { text:"edessä", good:true },{ text:"takana", good:true },{ text:"vieressä", good:true },
      { text:"oikealla puolella", good:true },{ text:"vasemmalla puolella", good:true },{ text:"välissä", good:true },
      { text:"keskellä", good:true },{ text:"ympärillä", good:true },{ text:"ääressä", good:true },
      { text:"päällä", good:true },{ text:"alla", good:true },
      { text:"eteen", good:false },{ text:"edestä", good:false },{ text:"päälle", good:false },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["päällä","alla","ympärillä","ympärille"], correctIndex:3, hint:"одно — MIHIN" },
      { options:["edessä","takana","keskeltä","vieressä"], correctIndex:2 },
    ]},

    { kind:"memory", title:"Мемори: место ↔ пример", pairs:[
      { id:"1", front:"päällä", back:"Laatikko on kaapin päällä." },
      { id:"2", front:"alla", back:"Lasi on pöydän alla." },
      { id:"3", front:"välissä", back:"Alex istuu Julian ja Hannan välissä." },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-opinion-sta",
  title: "Mielipide: –STA/–STÄ (мнение)",
  level: "A1",
  topic: "модели",
  cover: "/cards/mielipide.png",
  summary: "Minusta / Sinusta / Mikosta… + «on hyvä/kiva/…»",
  contentHtml: `<p>Мнение выражаем <b>–sta/stä</b>: <i>Minusta suklaajäätelö on hyvää</i>, <i>Onko partitiivi sinusta vaikea?</i>, <i>Mikosta Helsinki on kiva kesäkaupunki</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/mielipide.png", alt:"mielipide", caption:"Minusta / Sinusta / …"} ]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Minusta suklaajäätelö on hyvää." },
      { front:"Onko partitiivi sinusta vaikea?" },
      { front:"Mikosta Helsinki on kiva kesäkaupunki." },
      { front:"Minusta kurssi on mielenkiintoinen." },
      { front:"Sinusta tämä ravintola on kallis." },
    ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"По-моему шоколадное мороженое вкусное", b:"Minusta suklaajäätelö on hyvää." },
      { a:"Тебе кажется, что партитив сложный?", b:"Onko partitiivi sinusta vaikea?" },
      { a:"Микко считает, что Хельсинки — классный летний город", b:"Mikosta Helsinki on kiva kesäkaupunki." },
    ]},
    { kind:"typeAnswer", title:"Вставь –sta/–stä (одно слово)", items:[
      { prompt:"__ suklaajäätelö on hyvää. (я думаю…)", answers:["minusta"] },
      { prompt:"Onko partitiivi __ vaikea?", answers:["sinusta"] },
      { prompt:"__ Helsinki on kiva kesäkaupunki.", answers:["mikosta"] },
      { prompt:"__ kurssi on mielenkiintoinen. (мы думаем…)", answers:["meistä"] },
      { prompt:"__ kahvi on hyvää. (они считают…)", answers:["heistä"] },
    ]},
    { kind:"gridSelect", title:"Выбери «мнение»", rule:"Предложения с Minusta/Sinusta/Mikosta… + on", timed: 35, items:[
      { text:"Minusta suomalainen ruoka on hyvää.", good:true },
      { text:"Pidän kahvista.", good:false },
      { text:"Onko partitiivi sinusta helppo?", good:true },
      { text:"Asun Turussa.", good:false },
      { text:"Mikosta tämä elokuva on huono.", good:true },
    ]},
    { kind:"dialog", title:"Спроси мнение", steps:[
      { text:"A: Mitä mieltä sinä olet partitiivista?", options:[
        { text:"Minusta se on vaikea.", next:1, correct:true },
        { text:"Olen partitiivi.", next:1 },
      ]},
      { text:"A: Entä jäätelöstä?", options:[
        { text:"Minusta suklaajäätelö on hyvää.", next:"end", correct:true },
        { text:"Minulla on jäätelö.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-pitaa-sta",
  title: "PITÄÄ + –STA/–STÄ (нравится)",
  level: "A1",
  topic: "модели",
  cover: "/cards/pitaasta.png",
  summary: "Pidän kahvista / Pidän sinusta + диалог «Pidätkö…?»",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pitaa.png", alt:"pitää + sta/stä", caption:"Pidätkö…?"} ]},
    { kind:"flashcards", title:"Образцы", items:[
      { front:"Minä pidän sinusta." }, { front:"Hän pitää kirjasta." },
      { front:"Me pidämme vihreästä teestä." }, { front:"He pitävät kaupungista." },
      { front:"Pidätkö kahvista?" },
    ]},
    { kind:"matchPairs", title:"Слово → форма –STA/–STÄ", pairs:[
      { a:"kahvi", b:"kahvista" }, { a:"kirja", b:"kirjasta" },
      { a:"kaupunki", b:"kaupungista" }, { a:"vihreä tee", b:"vihreästä teestä" },
      { a:"sinä", b:"sinusta" },
    ]},
    { kind:"typeAnswer", title:"Собери фразу", items:[
      { prompt:"(я) __ __ (kahvi).", answers:["pidän kahvista"] },
      { prompt:"(она) __ __ (kirja).", answers:["pitää kirjasta"] },
      { prompt:"(мы) __ __ (kaupunki).", answers:["pidämme kaupungista"] },
      { prompt:"(они) __ __ (vihreä tee).", answers:["pitävät vihreästä teestä"] },
      { prompt:"Pidätkö __ ? (я)", answers:["minusta"] },
    ]},
    { kind:"gridSelect", title:"Выбери корректные реплики", rule:"Только «pitää + –sta/–stä»", timed: 40, items:[
      { text:"Pidän kahvista.", good:true },
      { text:"Pidän kahvi.", good:false },
      { text:"Pidän kahvissa.", good:false },
      { text:"He pitävät kaupungista.", good:true },
      { text:"Hän pitää minusta.", good:true },
    ]},
    { kind:"dialog", title:"Мини-диалог «нравится?»", steps:[
      { text:"A: Pidätkö teestä vai kahvista?", options:[
        { text:"Pidän kahvista.", next:1, correct:true },
        { text:"Pidän kahvi.", next:1 },
      ]},
      { text:"A: Entä tästä kirjasta?", options:[
        { text:"En pidä siitä.", next:"end", correct:true },
        { text:"En pidä se.", next:"end" },
      ]},
    ]},
    { kind:"memory", title:"Местоимение → –sta/–stä", pairs:[
      { id:"1", front:"minä", back:"minusta" },
      { id:"2", front:"sinä", back:"sinusta" },
      { id:"3", front:"hän", back:"hänestä" },
      { id:"4", front:"me", back:"meistä" },
      { id:"5", front:"te", back:"teistä" },
      { id:"6", front:"he", back:"heistä" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-ravintolassa-tilaus",
  title: "RAVINTOLASSA — бронирование и заказ",
  level: "A1",
  topic: "диалог",
  cover: "/cards/ravintolassa1.png",
  summary: "«Haluaisin varata pöydän…», «Mitä saa olla?», «Ottaisin…». Плюс меню по бюджету.",
  widgets: [
    { kind:"imageStrip", items:[
      { src:"/cards/ravintolassa1.png", alt:"ravintolassa 1", caption:"Pöytä yhdelle? Mitä saa olla?" },
    ]},
    { kind:"flashcards", title:"Фразы", items:[
      { front:"Haluaisin varata pöydän kahdelle." }, { front:"Haluaisin varata pöydän kolmelle." },
      { front:"Mitä saa olla?" }, { front:"Ottaisin keittoa." }, { front:"Ottaisin pihvin." },
      { front:"Caesar-salaatti minulle." },
    ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"Я бы хотел заказать столик на двоих", b:"Haluaisin varata pöydän kahdelle." },
      { a:"Что бы вы хотели?", b:"Mitä saa olla?" },
      { a:"Я бы взял суп", b:"Ottaisin keittoa." },
      { a:"Мне салат «Цезарь»", b:"Caesar-salaatti minulle." },
    ]},
    { kind:"typeAnswer", title:"Скажи по-фински", items:[
      { prompt:"Столик на троих →", answers:["haluaisin varata pöydän kolmelle"] },
      { prompt:"Я бы взял стейк →", answers:["ottaisin pihvin"] },
      { prompt:"Что бы вы хотели? →", answers:["mitä saa olla"] },
    ]},
    { kind:"gridSelect", title:"Вежливые формы", rule:"Выбирай фразы с «Haluaisin / Ottaisin / minulle»", timed: 35, items:[
      { text:"Haluan keiton.", good:false },
      { text:"Haluaisin keittoa.", good:true },
      { text:"Ottaisin pihvin.", good:true },
      { text:"Anna minulle salaatin.", good:false },
      { text:"Caesar-salaatti minulle.", good:true },
    ]},
    { kind:"budget", title:"Меню по бюджету (25 €)", budget:25, items:[
      { name:"keitto", price:8.5 }, { name:"pihvi", price:16.9 }, { name:"salaatti", price:9.9 },
      { name:"limonadi", price:3.5 }, { name:"kahvi", price:2.8 }, { name:"jäätelö", price:4.2 },
    ]},
    { kind:"dialog", title:"Сцена в ресторане", steps:[
      { text:"A: Pöytä yhdelle vai kahdelle?", options:[
        { text:"Kahdelle, kiitos. Haluaisin varata pöydän.", next:1, correct:true },
        { text:"Minä olen pöytä.", next:1 },
      ]},
      { text:"A: Mitä saa olla?", options:[
        { text:"Ottaisin keittoa ja salaatin.", next:"end", correct:true },
        { text:"Haluan keitto.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-dialogs",
},

{
  id: "a1-ravintolassa-maksu",
  title: "RAVINTOLASSA — оплата и «входит ли…»",
  level: "A1",
  topic: "диалог",
  cover: "/cards/ravintolassa.png",
  summary: "Maksatteko yhdessä/erikseen? Käteisellä vai kortilla? Kuuluuko kahvi hintaan?",
  widgets: [
    { kind:"imageStrip", items:[
      { src:"/cards/ravintolassa2.png", alt:"ravintolassa 2", caption:"maksu / sisältyy" },
    ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"Вы будете платить вместе или отдельно?", b:"Maksatteko yhdessä vai erikseen?" },
      { a:"Я заплачу наличными", b:"Maksan käteisellä." },
      { a:"Входит ли кофе в стоимость обеда?", b:"Kuuluuko kahvi lounaan hintaan?" },
      { a:"Да, в обед входит горячее, десерт и кофе", b:"Kyllä. Lounaaseen sisältyy lämmin ruoka, jälkiruoka ja kahvi." },
    ]},
    { kind:"gridSelect", title:"Выбери фразы про оплату", rule:"maksu / käteisellä / kortilla / erikseen", timed: 35, items:[
      { text:"Maksan käteisellä.", good:true },
      { text:"Maksan kortilla.", good:true },
      { text:"Ottaisin pihvin.", good:false },
      { text:"Maksatteko erikseen?", good:true },
      { text:"Haluaisin varata pöydän.", good:false },
    ]},
    { kind:"dialog", title:"Оплата у кассы", steps:[
      { text:"A: Maksatteko yhdessä vai erikseen?", options:[
        { text:"Erikseen, olkaa hyvä.", next:1, correct:true },
        { text:"Minulla on vihreä tee.", next:1 },
      ]},
      { text:"A: Käteisellä vai kortilla?", options:[
        { text:"Kortilla, kiitos.", next:"end", correct:true },
        { text:"Keittoa, kiitos.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-dialogs",
},

{
  id: "a1-objekti-gen",
  title: "OBJEKTI: GENETIIVI (готовое действие)",
  level: "A1",
  topic: "синтаксис",
  cover: "/cards/objekti2.png",
  summary: "Avaamme ikkunan; Mies ostaa uuden auton; Liisa haluaa konserttilipun; minut/sinut/hänet…",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/objekti_gen.png", alt:"objekti genetiivi"} ]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Avaamme ikkunan." }, { front:"Mies ostaa uuden auton." }, { front:"Liisa haluaa konserttilipun." },
      { front:"Tunnetko heidät?" }, { front:"Ajan sinut autolla lentoasemalle." },
    ]},
    { kind:"matchPairs", title:"Кто? → Кого? (объект-местоим.)", pairs:[
      { a:"minä", b:"minut" }, { a:"sinä", b:"sinut" }, { a:"hän", b:"hänet" },
      { a:"me", b:"meidät" }, { a:"te", b:"teidät" }, { a:"he", b:"heidät" },
    ]},
    { kind:"typeAnswer", title:"Поставь объект в GEN/аккузатив", items:[
      { prompt:"Avaamme __ (ikkuna).", answers:["ikkunan"] },
      { prompt:"Mies ostaa __ (uusi auto).", answers:["uuden auton"] },
      { prompt:"Liisa haluaa __ (konserttilippu).", answers:["konserttilipun"] },
      { prompt:"Tunnetko __ (he)?", answers:["heidät"] },
    ]},
    { kind:"gridSelect", title:"Выбери «завершённые действия»", rule:"Предложения с объектом в –n/местоим.-t", timed: 40, items:[
      { text:"Avaamme ikkunan.", good:true },
      { text:"Emme avaa ikkunaa.", good:false },
      { text:"Mies ostaa uuden auton.", good:true },
      { text:"Katson televisiota.", good:false },
    ]},
    { kind:"oddOne", title:"Лишнее (ошибка в объекте)", groups:[
      { options:["Ostan lehden","Luen kirjan","Haluan lipun","Rakastan elämää"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-objekti-part",
  title: "OBJEKTI: PARTITIIVI (отрицание/масс-слово/процесс)",
  level: "A1",
  topic: "синтаксис",
  cover: "/cards/objekti.png",
  summary: "Negatiiv, ainesanat, verbi+P: juoda teetä, katsoa televisiota, rakastaa elämää…",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/objekti_part.png", alt:"objekti partitiivi"} ]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Emme avaa ikkunaa." }, { front:"Jenni ei syö lihaa." },
      { front:"Juotko teetä?" }, { front:"Katson televisiota." }, { front:"Rakastan elämää." },
    ]},
    { kind:"typeAnswer", title:"Вставь партитив объекта", items:[
      { prompt:"En katso __ (televisio).", answers:["televisiota"] },
      { prompt:"Juotko __ (tee)?", answers:["teetä"] },
      { prompt:"Jenni ei syö __ (liha).", answers:["lihaa"] },
      { prompt:"Rakastan __ (elämä).", answers:["elämää"] },
    ]},
    { kind:"gridSelect", title:"Выбери предложения с P-объектом", rule:"Отрицание, масса, процесс", timed: 40, items:[
      { text:"En osta uutta autoa.", good:true },
      { text:"Ostan uuden auton.", good:false },
      { text:"Katson televisiota.", good:true },
      { text:"Avaamme ikkunan.", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-objekti-pl",
  title: "OBJEKTI: множественное –T",
  level: "A1",
  topic: "синтаксис",
  cover: "/cards/objekti4.png",
  summary: "Avaamme ikkunat; Mies ostaa uudet kengät; Me haluamme konserttiliput.",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/objekti_mon.png", alt:"objekti monikko"} ]},
    { kind:"flashcards", title:"Образцы", items:[
      { front:"Avaamme ikkunat." }, { front:"Mies ostaa uudet kengät." }, { front:"Me haluamme konserttiliput." },
    ]},
    { kind:"typeAnswer", title:"Поставь объект во мн.числе", items:[
      { prompt:"Avaamme __ (ikkuna, pl.)", answers:["ikkunat"] },
      { prompt:"Mies ostaa __ (uusi kengät).", answers:["uudet kengät"] },
      { prompt:"Me haluamme __ (konserttilippu, pl.)", answers:["konserttiliput"] },
    ]},
    { kind:"matchPairs", title:"Ед. → мн. объект", pairs:[
      { a:"ikkuna", b:"ikkunat" },
      { a:"uusi kenkä", b:"uudet kengät" },
      { a:"konserttilippu", b:"konserttiliput" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-kenelle-all",
  title: "КОМУ? KENELLE? — ALLATIIVI (–LLE)",
  level: "A1",
  topic: "падежи/модели",
  cover: "/cards/kenelle.png",
  summary: "Глаголы с «кому»: antaa, lainata, soittaa, sanoa, puhua, kertoa… + формы на –lle.",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/kenelle.png", alt:"kenelle"} ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"Папа дарит Эмме подарок", b:"Isä antaa Emmalle lahjan." },
      { a:"Я позвоню дедушке завтра", b:"Soitan isoisälle huomenna." },
      { a:"Он не разговаривает со мной", b:"Hän ei puhu minulle." },
      { a:"Алекс пишет команде письмо", b:"Alex kirjoittaa tiimille sähköpostin." },
    ]},
    { kind:"gridSelect", title:"Глаголы с –lle", rule:"Выбери пары с antaa/soittaa/puhua/kertoa/kirjoittaa…", timed: 35, items:[
      { text:"Kerron sinulle matkasta.", good:true },
      { text:"Suosittelen teille tätä ravintolaa.", good:true },
      { text:"Ostan Emmalle sandaalit.", good:true },
      { text:"Rakastan kaupunkia.", good:false },
      { text:"Pidän sinusta.", good:false },
    ]},
    { kind:"typeAnswer", title:"Сделай –LLE", items:[
      { prompt:"äiti → (кому?)", answers:["äidille"] },
      { prompt:"opettaja → (кому?)", answers:["opettajalle"] },
      { prompt:"Emma →", answers:["emmalle"] },
      { prompt:"tiimi →", answers:["tiimille"] },
      { prompt:"minä → (мне)", answers:["minulle"] },
    ]},
    { kind:"memory", title:"Глагол → пример с –lle", pairs:[
      { id:"1", front:"antaa", back:"Isä antaa Emmalle lahjan." },
      { id:"2", front:"soittaa", back:"Soitan isoisälle huomenna." },
      { id:"3", front:"kertoa", back:"Hanna kertoo heille matkasta." },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-kenelta-abl",
  title: "ОТ КОГО? KENELTÄ? — ABLATIIVI (–LTA/–LTÄ)",
  level: "A1",
  topic: "падежи/модели",
  cover: "/cards/kenelta.png",
  summary: "saada/ottaa/lainata/kysyä/pyytää/ostaa + –lta/–ltä",
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/kenelta.png", alt:"keneltä"} ]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"Эмма получает подарок от папы", b:"Emma saa isältä lahjan." },
      { a:"Полиция забирает права у водителя", b:"Poliisi ottaa kuskilta ajokortin pois." },
      { a:"Алекс занимает деньги у Яри", b:"Alex lainaa rahaa Jarilta." },
      { a:"Спроси у учителя", b:"Kysy opettajalta." },
      { a:"Я куплю клубнику у фермера", b:"Ostan mansikoita maanviljelijältä." },
    ]},
    { kind:"typeAnswer", title:"Сделай –LTA/–LTÄ", items:[
      { prompt:"isä → (от кого?)", answers:["isältä"] },
      { prompt:"opettaja →", answers:["opettajalta"] },
      { prompt:"äiti →", answers:["äidiltä"] },
      { prompt:"Jari →", answers:["jarilta"] },
      { prompt:"maanviljelijä →", answers:["maanviljelijältä"] },
    ]},
    { kind:"gridSelect", title:"Выбери глаголы с –lta/–ltä", rule:"saada/ottaa/lainata/kysyä/pyytää/ostaa", timed: 35, items:[
      { text:"Pyydän äidiltä rahaa.", good:true },
      { text:"Kysyn opettajalta.", good:true },
      { text:"Lainaan rahaa Jarilta.", good:true },
      { text:"Puhun sinulle.", good:false },
      { text:"Annan Emmalle lahjan.", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-persoonat-yks",
  title: "PERSOONAPRONOMINIT — ед. число",
  level: "A1",
  topic: "местоимения",
  cover: "/cards/persoonapronominit1.png",
  summary: "minä / sinä / hän — основные формы (N, P, G, объект, illatiivi, inessiivi, elatiivi, allatiivi, adessiivi, ablatiivi).",
  contentHtml: `<p>Формы единственного числа: <b>minä</b>, <b>sinä</b>, <b>hän</b> и их падежи: <i>minua, minun, minut, minuun, minussa…</i></p>`,
  widgets: [
    { kind:"imageStrip", title:"Постеры", items:[
      { src:"/cards/persoonapronominit4.png", alt:"minä" },
      { src:"/cards/persoonapronominit1.png", alt:"sinä" },
      { src:"/cards/persoonapronominit6.png", alt:"hän" },
    ]},
    { kind:"matchPairs", title:"Nominatiivi → генитив", pairs:[
      { a:"minä", b:"minun" }, { a:"sinä", b:"sinun" }, { a:"hän", b:"hänen" },
    ]},
    { kind:"matchPairs", title:"Кто? → Кого? (объект)", pairs:[
      { a:"minä", b:"minut" }, { a:"sinä", b:"sinut" }, { a:"hän", b:"hänet" },
    ]},
    { kind:"typeAnswer", title:"Вставь правильную форму (одно слово)", items:[
      { prompt:"Pidätkö __ ? (я)", answers:["minusta"] },
      { prompt:"Hän odottaa __ . (тебя)", answers:["sinua"] },
      { prompt:"He saivat __ . (его/её)", answers:["hänet"] },
      { prompt:"Uskon __ . (в него/неё)", answers:["häneen"] },
      { prompt:"__ on stressiä. (у неё)", answers:["hänellä"] },
    ]},
    { kind:"gridSelect", title:"Выбери корректные реплики", rule:"Формы единственного числа", timed: 35, items:[
      { text:"Minä tunnen sinut.", good:true },
      { text:"Sinä rakastat minua.", good:true },
      { text:"Olen ylpeä hänestä.", good:true },
      { text:"Minä on ystävä.", good:false },
      { text:"Pidän sinästä.", good:false },
    ]},
    { kind:"memory", title:"Пары (местоимение ↔ –ssa/–stä/–lle)", pairs:[
      { id:"m1", front:"minä", back:"minussa" },
      { id:"m2", front:"sinä", back:"sinusta" },
      { id:"m3", front:"hän", back:"hänelle" },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-persoonat-mon",
  title: "PERSOONAPRONOMINIT — мн. число",
  level: "A1",
  topic: "местоимения",
  cover: "/cards/persoonapronominit3.png",
  summary: "me / te / he — падежные формы и типичные фразы.",
  contentHtml: `<p><b>me</b>, <b>te</b>, <b>he</b> + формы: <i>meitä, meidän, meidät, meihin, meissä…</i></p>`,
  widgets: [
    { kind:"imageStrip", items:[
      { src:"/cards/persoonapronominit3.png", alt:"me" },
      { src:"/cards/persoonapronominit5.png", alt:"te" },
      { src:"/cards/persoonapronominit.png",  alt:"he" },
    ]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Me olemme yhdessä." },
      { front:"Te tiedätte." },
      { front:"He eivät ole kaduilla." },
      { front:"Kuka liittyi meihin?" },
      { front:"Teissä on paljon samaa." },
    ]},
    { kind:"typeAnswer", title:"Поставь форму", items:[
      { prompt:"Olen yksi __ . (из нас)", answers:["meistä"] },
      { prompt:"Kerron __ kaiken. (вам)", answers:["teille"] },
      { prompt:"Voitko kysyä __ ? (у них)", answers:["heiltä"] },
      { prompt:"Liittyikö hän __ ? (к нам)", answers:["meihin"] },
    ]},
    { kind:"matchPairs", title:"Кто? → –ssa / –sta", pairs:[
      { a:"me", b:"meissä" }, { a:"te", b:"teissä" }, { a:"he", b:"heissä" },
      { a:"me", b:"meistä" }, { a:"te", b:"teistä" }, { a:"he", b:"heistä" },
    ]},
  ],
  playlist: "a1-visuals",
},

{
  id: "a1-sanatyyppi-in",
  title: "SANATYYPIT: –IN",
  level: "A1",
  topic: "склонение",
  cover: "/cards/stin1.png",
  summary: "puhelin → puhelime- + падежи; ещё: avain, kirjain, laskin, pakastin, tulostin.",
  contentHtml: `<p>У слов на <b>–in</b> в основе появляется <b>–e–</b>: <i>puhelin → puhelime-</i>. Пример склонения: <i>puhelimen, puhelimessa, puhelimeen…</i></p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/stin1.png", alt:"-in puhelin" }]},
    { kind:"matchPairs", title:"Падежи puhelin → …", pairs:[
      { a:"GEN", b:"puhelimen" }, { a:"PART", b:"puhelinta" }, { a:"ILL", b:"puhelimeen" },
      { a:"INESS", b:"puhelimessa" }, { a:"ELAT", b:"puhelimesta" },
      { a:"ALL", b:"puhelimelle" }, { a:"ADESS", b:"puhelimella" }, { a:"ABL", b:"puhelimelta" },
      { a:"MON.N", b:"puhelimet" },
    ]},
    { kind:"typeAnswer", title:"Сделай форму (одно слово)", items:[
      { prompt:"(GEN) __ (puhelin)", answers:["puhelimen"] },
      { prompt:"(ILL) __ (puhelin)", answers:["puhelimeen"] },
      { prompt:"(ADESS) __ (puhelin)", answers:["puhelimella"] },
      { prompt:"(PL.N) __ (puhelin)", answers:["puhelimet"] },
    ]},
    { kind:"gridSelect", title:"Выбери слова типа –IN", rule:"avain/kirjain/laskin/pakastin/tulostin", timed: 30, items:[
      { text:"avain", good:true }, { text:"kirjain", good:true }, { text:"laskin", good:true },
      { text:"pakastin", good:true }, { text:"tulostin", good:true },
      { text:"kirje", good:false }, { text:"puhelu", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-kuluttua-jalkeen-ennen",
  title: "KULUTTUA / JÄLKEEN / ENNEN",
  level: "A1",
  topic: "модели времени",
  cover: "/cards/genetiivikuluttua.png",
  summary: "GEN + kuluttua / GEN + jälkeen / ennen + PART.",
  contentHtml: `<p><b>kolmen päivän kuluttua</b> (=через три дня), <b>monen vuoden jälkeen</b> (=после многих лет), <b>ennen töitä</b> (=перед работой).</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/genetiivikuluttua.png", alt:"kuluttua/jälkeen/ennen" }]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"через три дня", b:"kolmen päivän kuluttua" },
      { a:"после стольких лет", b:"näin monen vuoden jälkeen" },
      { a:"перед работой", b:"ennen töitä" },
    ]},
    { kind:"typeAnswer", title:"Вставь нужное (одно слово/форму)", items:[
      { prompt:"Lähden __ (через три дня).", answers:["kolmen päivän kuluttua"] },
      { prompt:"Mukava nähdä __ (после стольких лет).", answers:["näin monen vuoden jälkeen"] },
      { prompt:"Juot kahvia __ ? (перед работой)", answers:["ennen töitä"] },
    ]},
    { kind:"gridSelect", title:"Выбирай по правилу", rule:"GEN+kuluttua / GEN+jälkeen / ennen+PART", timed: 35, items:[
      { text:"kolmen päivän kuluttua", good:true },
      { text:"kolme päivä kuluttua", good:false },
      { text:"vuosien jälkeen", good:true },
      { text:"ennen töitä", good:true },
      { text:"ennen työ", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-keskustella-sta",
  title: "PUHUA / KERTOA / JUTELLA + –STA/–STÄ",
  level: "A1",
  topic: "модели",
  cover: "/cards/mistakeksustelevat.png",
  summary: "говорить/рассказывать/разговаривать/писать/обсуждать + –sta/–stä.",
  contentHtml: `<p>После <b>puhua, kertoa, jutella, kirjoittaa, keskustella</b> — форма <b>–sta/–stä</b>: <i>Hän puhuu sinusta</i>, <i>Kerron kuningattaresta</i>, <i>He keskustelevat politiikasta</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/mistakeksustelevat.png", alt:"mistä he keskustelevat" }]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Hän puhuu sinusta." },
      { front:"Kerrot kuningattaresta." },
      { front:"Juttelemme lapsuudesta." },
      { front:"Kirjoitan tähdistä." },
      { front:"He keskustelevat politiikasta." },
    ]},
    { kind:"typeAnswer", title:"Собери форму –STA/–STÄ", items:[
      { prompt:"(я) Puhun __ (sinä).", answers:["sinusta"] },
      { prompt:"(ты) Kerrot __ (kuningatar).", answers:["kuningattaresta"] },
      { prompt:"(мы) Keskustelemme __ (politiikka).", answers:["politiikasta"] },
      { prompt:"(я) Kirjoitan __ (tähti, pl.).", answers:["tähdistä"] },
    ]},
    { kind:"gridSelect", title:"Выбери только –sta/–stä", rule:"После puhua/kertoa/jutella/kirjoittaa/keskustella", timed: 35, items:[
      { text:"Puhun sinusta.", good:true },
      { text:"Kerron kuningattaresta.", good:true },
      { text:"Juttelemme lapsuudesta.", good:true },
      { text:"Pidän jäätelöstä.", good:false },
      { text:"Rakastan sinua.", good:false },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-menen-ille",
  title: "MIHIN SINÄ MENET? — на –LLE",
  level: "A1",
  topic: "направления",
  cover: "/cards/mihinsinamenet.png",
  summary: "menen lounaalle / aamiaiselle / kahville / kävelylle / lenkille / tupakalle / tauolle / Hannalle.",
  contentHtml: `<p>С глаголом <b>mennä</b> часто используется <b>–lle</b>: <i>lounaalle, kahville, kävelylle, tauolle, Hannalle</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/mihinsinamenet.png", alt:"Mihin sinä menet?" }]},
    { kind:"flashcards", title:"Menen…", items:[
      { front:"lounaalle" }, { front:"aamiaiselle" }, { front:"kahville" }, { front:"kävelylle" },
      { front:"lenkille" }, { front:"tupakalle" }, { front:"tauolle" }, { front:"Hannalle" },
    ]},
    { kind:"matchPairs", title:"RU → FI (MIHIN)", pairs:[
      { a:"на обед", b:"lounaalle" }, { a:"на завтрак", b:"aamiaiselle" },
      { a:"выпить кофе", b:"kahville" }, { a:"на прогулку", b:"kävelylle" },
      { a:"на пробежку", b:"lenkille" }, { a:"покурить", b:"tupakalle" },
      { a:"на перерыв", b:"tauolle" }, { a:"к Ханне", b:"Hannalle" },
    ]},
    { kind:"typeAnswer", title:"Скажи по-фински (одно слово)", items:[
      { prompt:"Я иду выпить кофе →", answers:["kahville"] },
      { prompt:"Мы идём на прогулку →", answers:["kävelylle"] },
      { prompt:"Ты идёшь к Ханне →", answers:["hannalle"] },
    ]},
    { kind:"gridSelect", title:"Выбор по правилу", rule:"Только формы на –LLE", timed: 30, items:[
      { text:"kahville", good:true }, { text:"kävelylle", good:true }, { text:"Hannalle", good:true },
      { text:"kahvilassa", good:false }, { text:"kävelyllä", good:false }, { text:"Hannalta", good:false },
    ]},
  ],
  playlist: "a1-visuals",
},
{
  id: "a1-sanatyypit-as",
  title: "SANATYYPIT — –AS/–ÄS",
  level: "A1",
  topic: "типы слов / склонение",
  cover: "/cards/st as.png",
  summary: "N: lounas → стем LOUNAA– → GEN lounaan, ILL lounaaseen, INE lounaassa, ELA lounaasta, ALL lounaalle, ADE lounaalla, ABL lounaalta; PL: lounaat. Частые слова: asiakas, eräs, patsas, pensas, potilas, sairas, vieras…",
  contentHtml: `
    <p>Слова на <b>–as/–äs</b> получают основу <b>–aa/–ää–</b>:
    <i>lounas → lounaa–</i>. Дальше добавляются обычные окончания падежей:
    <i>lounaan, lounaaseen, lounaassa, lounaasta, lounaalle, lounaalla, lounaalta</i>. Мн.ч.: <i>lounaat</i>.</p>
    <p><i>Примеры лексики</i>: asiakas, eräs, patsas, pensas, potilas, sairas, vieras…</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/st as.png", alt:"sanatyypit –as/–äs", caption:"LOUNAS → LOUNAA–" }]},

    { kind:"flashcards", title:"LOUNAS по падежам", items:[
      { front:"lounas (N)" }, { front:"lounasta (P)" }, { front:"lounaan (GEN)" },
      { front:"lounaaseen (ILL)" }, { front:"lounassa (INE)" }, { front:"lounaasta (ELA)" },
      { front:"lounaalle (ALL)" }, { front:"lounaalla (ADE)" }, { front:"lounaalta (ABL)" },
      { front:"lounaat (PL.N)" },
    ]},

    { kind:"typeAnswer", title:"Вставь форму LOUNAS", items:[
      { prompt:"(GEN) __", answers:["lounaan"] },
      { prompt:"(ILL) __", answers:["lounaaseen"] },
      { prompt:"(INE) __", answers:["lounassa"] },
      { prompt:"(ADE) __", answers:["lounaalla"] },
      { prompt:"(ABL) __", answers:["lounaalta"] },
      { prompt:"(PL.N) __", answers:["lounaat"] },
    ]},

    { kind:"matchPairs", title:"Слово → перевод (–as)", pairs:[
      { a:"asiakas", b:"клиент" },
      { a:"pensas", b:"куст" },
      { a:"patsas", b:"статуя" },
      { a:"potilas", b:"пациент" },
      { a:"sairas", b:"больной" },
      { a:"vieras", b:"гость" },
      { a:"eräs", b:"некоторый, некий" },
    ]},

    { kind:"gridSelect", title:"Выбери только формы LOUNAS", rule:"Формы с основой lounaa–", timed: 35, items:[
      { text:"lounaan", good:true },{ text:"lounaalla", good:true },{ text:"lounaalta", good:true },
      { text:"lounaaseen", good:true },{ text:"lounaat", good:true },
      { text:"kauniissa", good:false },{ text:"puhelimessa", good:false },{ text:"keskeltä", good:false },
    ]},

    { kind:"memory", title:"LOUNAS: форма ↔ падеж", pairs:[
      { id:"1", front:"lounaan", back:"GEN" },
      { id:"2", front:"lounaaseen", back:"ILL" },
      { id:"3", front:"lounassa", back:"INE" },
      { id:"4", front:"lounaalla", back:"ADE" },
      { id:"5", front:"lounaat", back:"PL.N" },
    ]},

    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["lounaan","lounassa","lounaalta","kauniissa"], correctIndex:3, hint:"другая основа (–is)" },
      { options:["lounaalla","lounaat","lounaseen","lounaaseen"], correctIndex:2, hint:"одна — с ошибкой" },
    ]},
  ],
  playlist: "a1-grammar0",
},

{
  id: "a1-sanatyypit-is",
  title: "SANATYYPIT — –IS",
  level: "A1",
  topic: "типы слов / склонение",
  cover: "/cards/stis.png",
  summary: "N: kaunis → стем KAUNII– → GEN kauniin, ILL kauniiseen, INE kauniissa, ELA kauniista, ALL kauniille, ADE kauniilla, ABL kauniilta; PL.N: kauniit. Частые: kaunis, kallis, valmis…",
  contentHtml: `
    <p>При типе <b>–is</b> основа становится <b>–ii–</b>:
    <i>kaunis → kaunii–</i>. Формы: <i>kauniin, kauniiseen, kauniissa, kauniista, kauniille, kauniilla, kauniilta</i>.
    Мн.ч. именит.: <i>kauniit</i>.</p>
    <p><i>Слова</i>: kaunis «красивый», kallis «дорогой», valmis «готовый»…</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/stis.png", alt:"sanatyypit –is", caption:"KAUNIS → KAUNII–" }]},

    { kind:"flashcards", title:"KAUNIS по падежам", items:[
      { front:"kaunis (N)" }, { front:"kaunista (P)" }, { front:"kauniin (GEN)" },
      { front:"kauniiseen (ILL)" }, { front:"kauniissa (INE)" }, { front:"kauniista (ELA)" },
      { front:"kauniille (ALL)" }, { front:"kauniilla (ADE)" }, { front:"kauniilta (ABL)" },
      { front:"kauniit (PL.N)" },
    ]},

    { kind:"typeAnswer", title:"Вставь форму KAUNIS", items:[
      { prompt:"(GEN) __", answers:["kauniin"] },
      { prompt:"(ILL) __", answers:["kauniiseen"] },
      { prompt:"(INE) __", answers:["kauniissa"] },
      { prompt:"(ALL) __", answers:["kauniille"] },
      { prompt:"(ABL) __", answers:["kauniilta"] },
      { prompt:"(PL.N) __", answers:["kauniit"] },
    ]},

    { kind:"matchPairs", title:"RU → FI (–is прилагательные)", pairs:[
      { a:"красивый", b:"kaunis" },
      { a:"дорогой", b:"kallis" },
      { a:"готовый", b:"valmis" },
    ]},

    { kind:"gridSelect", title:"Выбери только формы KAUNIS", rule:"Формы с основой kaunii–", timed: 35, items:[
      { text:"kauniin", good:true },{ text:"kauniille", good:true },{ text:"kauniissa", good:true },
      { text:"kauniista", good:true },{ text:"kauniit", good:true },
      { text:"lounaalla", good:false },{ text:"puhelimeen", good:false },{ text:"yhdeksäs", good:false },
    ]},

    { kind:"memory", title:"KAUNIS: форма ↔ падеж", pairs:[
      { id:"1", front:"kauniin", back:"GEN" },
      { id:"2", front:"kauniiseen", back:"ILL" },
      { id:"3", front:"kauniilla", back:"ADE" },
      { id:"4", front:"kauniilta", back:"ABL" },
      { id:"5", front:"kauniit", back:"PL.N" },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["kauniissa","kauniista","kauniille","lounaalla"], correctIndex:3, hint:"не –is-тип" },
      { options:["kauniin","kauniiseen","kauniiset","kauniilta"], correctIndex:2, hint:"одна — с ошибкой" },
    ]},
  ],
  playlist: "a1-grammar0",
},
{
  id: "a1-pk-pron-nom",
  title: "PUHEKIELI: местоимения — NOMINATIIVI",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkmina.png",
  summary: "Kirjakieli: minä/sinä/hän/me/te/he → Puhekieli: mä(ä)/sä(ä)/se/me/te/ne.",
  contentHtml: `<p>В разговорном финском <b>minä → mä/ mää</b>, <b>sinä → sä/ sää</b>, <b>hän → se</b>, <b>he → ne</b>. <i>Se/Ne</i> — нормальная разговорная замена для он/она/они.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkmina.png", alt:"puhekieli nominatiivi"} ]},
    { kind:"flashcards", title:"Kirjakieli → Puhekieli", items:[
      { front:"minä → ?", back:"mä / mää" },
      { front:"sinä → ?", back:"sä / sää" },
      { front:"hän → ?", back:"se" },
      { front:"he → ?", back:"ne" },
      { front:"me → ?", back:"me (без изменений)" },
      { front:"te → ?", back:"te (без изменений)" },
    ]},
    { kind:"matchPairs", title:"Соедини пары", pairs:[
      { a:"minä", b:"mä" }, { a:"sinä", b:"sä" }, { a:"hän", b:"se" },
      { a:"he", b:"ne" }, { a:"me", b:"me" }, { a:"te", b:"te" },
    ]},
    { kind:"gridSelect", title:"Выбери PUHEKIELI", rule:"только разговорные формы", timed: 35, items:[
      { text:"mä", good:true },{ text:"sä", good:true },{ text:"se", good:true },
      { text:"ne", good:true },{ text:"minä", good:false },{ text:"hän", good:false },
    ]},
    { kind:"typeAnswer", title:"Скажи по-разговорному", items:[
      { prompt:"Minä olen väsynyt →", answers:["mä oon väsynyt","mää oon väsynyt"] },
      { prompt:"He tulevat pian →", answers:["ne tulee pian"] },
      { prompt:"Sinä puhut hyvin →", answers:["sä puhut hyvin","sää puhut hyvin"] },
    ]},
    { kind:"dialog", title:"Мини-диалог (выбери разговорную реплику)", steps:[
      { text:"A: Kuka se on?", options:[
        { text:"Se on mun opettaja.", next:1, correct:true },
        { text:"Hän on minun opettaja.", next:1 },
      ]},
      { text:"A: Lähdettekö nyt?", options:[
        { text:"Me mennään nyt.", next:"end", correct:true },
        { text:"Me menemme nyt.", next:"end" },
      ]},
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["mä","sä","se","minä"], correctIndex:3, hint:"одна — kirjakieli" },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-pron-gen",
  title: "PUHEKIELI: GENETIIVI (чей?)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminun.png",
  summary: "minun/sinun/hänen/meidän/teidän/heidän → mun/sun/sen/meiän~meijän/teiän~teijän/niitten.",
  contentHtml: `<p>В puhekieli: <b>minun → mun</b>, <b>sinun → sun</b>, <b>hänen → sen</b>, <b>heidän → niitten</b>; у мн.ч. часто <i>meiän/teidän</i> → <i>meiän/meijän, teiän/teijän</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminun.png", alt:"puhekieli genetiivi"} ]},
    { kind:"matchPairs", title:"Kirjakieli → Puhekieli", pairs:[
      { a:"minun", b:"mun" }, { a:"sinun", b:"sun" }, { a:"hänen", b:"sen" },
      { a:"meidän", b:"meiän" }, { a:"teidän", b:"teiän" }, { a:"heidän", b:"niitten" },
    ]},
    { kind:"gridSelect", title:"Отметь все разговорные", rule:"mun/sun/sen/meiän/teiän/niitten", timed: 30, items:[
      { text:"mun", good:true },{ text:"sinun", good:false },{ text:"sen", good:true },
      { text:"meidän", good:false },{ text:"meiän", good:true },{ text:"niitten", good:true },
    ]},
    { kind:"typeAnswer", title:"Переделай в puhekieli (одно слово меняется)", items:[
      { prompt:"Tämä on minun kahvi →", answers:["tämä on mun kahvi"] },
      { prompt:"Missä on heidän auto? →", answers:["missä on niitten auto"] },
      { prompt:"Teidän opettaja on kiva →", answers:["teiän opettaja on kiva","teijän opettaja on kiva"] },
    ]},
    { kind:"memory", title:"GEN: книжн. ↔ разг.", pairs:[
      { id:"g1", front:"minun", back:"mun" },
      { id:"g2", front:"heidän", back:"niitten" },
      { id:"g3", front:"meidän", back:"meiän / meijän" },
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["mun","sun","sen","hänen"], correctIndex:3 },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-pron-adess",
  title: "PUHEKIELI: –LLA (MINULLA → MULLA)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminulla.png",
  summary: "minulla/sinulla/hänellä/meillä/teillä/heillä → mulla/sulla/sillä/meillä/teillä/niillä.",
  contentHtml: `<p><b>–lla</b>: только третье л. меняется на <b>sillä</b>, а мн.ч. <b>heillä → niillä</b>. <i>Meillä/Teillä</i> — без изменений.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminulla.png", alt:"adessiivi puhekieli"} ]},
    { kind:"matchPairs", title:"Соедини", pairs:[
      { a:"minulla", b:"mulla" },{ a:"sinulla", b:"sulla" },{ a:"hänellä", b:"sillä" },
      { a:"meillä", b:"meillä" },{ a:"teillä", b:"teillä" },{ a:"heillä", b:"niillä" },
    ]},
    { kind:"typeAnswer", title:"Замени на puhekieli", items:[
      { prompt:"Minulla on idea →", answers:["mulla on idea"] },
      { prompt:"Hänellä on kiire →", answers:["sillä on kiire"] },
      { prompt:"Heillä on koira →", answers:["niillä on koira"] },
    ]},
    { kind:"gridSelect", title:"Где –LLA и puhekieli?", rule:"предложения c mulla/sulla/sillä/niillä", timed: 30, items:[
      { text:"Mulla on nälkä.", good:true },
      { text:"Minulla on nälkä.", good:false },
      { text:"Sillä ei ole aikaa.", good:true },
      { text:"Heillä on talo.", good:false },
      { text:"Niillä on talo.", good:true },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-pron-part",
  title: "PUHEKIELI: PARTITIIVI (MINUA → MUA)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminua.png",
  summary: "minua/sinua/häntä/meitä/teitä/heitä → mua/sua/sitä/meitä/teitä/niitä.",
  contentHtml: `<p>Разговорные партитивы: <b>minua → mua</b>, <b>sinua → sua</b>, <b>häntä → sitä</b>, <b>heitä → niitä</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminua.png", alt:"partitiivi puhekieli"} ]},
    { kind:"matchPairs", title:"Книжн. → Разг.", pairs:[
      { a:"minua", b:"mua" },{ a:"sinua", b:"sua" },{ a:"häntä", b:"sitä" },
      { a:"heitä", b:"niitä" },{ a:"meitä", b:"meitä" },{ a:"teitä", b:"teitä" },
    ]},
    { kind:"typeAnswer", title:"Сделай разговорно", items:[
      { prompt:"Hän rakastaa minua →", answers:["se rakastaa mua"] },
      { prompt:"Opettaja näkee heitä →", answers:["opettaja näkee niitä"] },
      { prompt:"Pidätkö sinua? (ошибка) →", answers:["pidätkö sua"] },
    ]},
    { kind:"gridSelect", title:"Выбери правильные разговорные реплики", rule:"только с mua/sua/sitä/niitä", timed: 35, items:[
      { text:"Rakastan sua.", good:true },
      { text:"Rakastan sinua.", good:false },
      { text:"Näen sitä.", good:true },
      { text:"Tapaan heitä.", good:false },
      { text:"Tapaan niitä.", good:true },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-pron-all",
  title: "PUHEKIELI: –LLE (MINULLE → MULLE)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminulle.png",
  summary: "minulle/sinulle/hänelle/meille/teille/heille → mulle/sulle/sille/meille/teille/niille.",
  contentHtml: `<p><b>–lle</b> в разговоре: <b>minulle → mulle</b>, <b>sinulle → sulle</b>, <b>hänelle → sille</b>, <b>heille → niille</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminulle.png", alt:"allatiivi puhekieli"} ]},
    { kind:"matchPairs", title:"Книжн. → Разг.", pairs:[
      { a:"minulle", b:"mulle" },{ a:"sinulle", b:"sulle" },{ a:"hänelle", b:"sille" },
      { a:"heille", b:"niille" },{ a:"meille", b:"meille" },{ a:"teille", b:"teille" },
    ]},
    { kind:"typeAnswer", title:"Замени на –lle в puhekieli", items:[
      { prompt:"Anna se minulle →", answers:["anna se mulle"] },
      { prompt:"Soitan hänelle huomenna →", answers:["soitan sille huomenna"] },
      { prompt:"Kerro heille →", answers:["kerro niille"] },
    ]},
    { kind:"gridSelect", title:"Только puhekieli –lle", rule:"mulle/sulle/sille/niille", timed: 30, items:[
      { text:"Soita mulle!", good:true },{ text:"Soita minulle!", good:false },
      { text:"Anna sille rahaa.", good:true },{ text:"Anna hänelle rahaa.", good:false },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-pron-abl",
  title: "PUHEKIELI: –LTA (MINULTA → MULTA)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminulta.png",
  summary: "minulta/sinulta/häneltä/meiltä/teiltä/heiltä → multa/sulta/siltä/meiltä/teiltä/niiltä.",
  contentHtml: `<p>Аblatiivi в разговоре: <b>minulta → multa</b>, <b>sinulta → sulta</b>, <b>häneltä → siltä</b>, <b>heiltä → niiltä</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminulta.png", alt:"ablatiivi puhekieli"} ]},
    { kind:"matchPairs", title:"Книжн. → Разг.", pairs:[
      { a:"minulta", b:"multa" },{ a:"sinulta", b:"sulta" },{ a:"häneltä", b:"siltä" },
      { a:"heiltä", b:"niiltä" },{ a:"meiltä", b:"meiltä" },{ a:"teiltä", b:"teiltä" },
    ]},
    { kind:"typeAnswer", title:"Скажи по-разговорному", items:[
      { prompt:"Kysy opettajalta →", answers:["kysy opettajalta"] },
      { prompt:"Lainaan sen minulta → (исправь)", answers:["lainaan siltä","lainaan sulta","lainaan siltä rahaa"] },
      { prompt:"Otan rahat heiltä →", answers:["otan rahat niiltä"] },
    ]},
    { kind:"gridSelect", title:"Правильные разговорные –lta", rule:"multa/sulta/siltä/niiltä", timed: 30, items:[
      { text:"Kysy multa!", good:true },{ text:"Kysy minulta!", good:false },
      { text:"Otin sen siltä.", good:true },{ text:"Otin sen häneltä.", good:false },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-demons",
  title: "PUHEKIELI: tämä/tuo → tää/toi",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pktama.png",
  summary: "tämä/tuo/nämä/nuo → tää/toi/nää/noi. Очень частая замена в речи.",
  contentHtml: `<p><b>tämä → tää</b>, <b>tuo → toi</b>, <b>nämä → nää</b>, <b>nuo → noi</b>. Пример: <i>Tää kirja on hyvä</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pktama.png", alt:"demonstratiivit puhekieli"} ]},
    { kind:"matchPairs", title:"Соедини", pairs:[
      { a:"tämä", b:"tää" },{ a:"tuo", b:"toi" },{ a:"nämä", b:"nää" },{ a:"nuo", b:"noi" },
    ]},
    { kind:"order", title:"Расставь от «книжного» к «разговорному»", sequence:["tämä","tää","tuo","toi","nämä","nää","nuo","noi"] },
    { kind:"typeAnswer", title:"Переведи в puhekieli", items:[
      { prompt:"Tämä ravintola on kallis →", answers:["tää ravintola on kallis"] },
      { prompt:"Nuo kengät ovat uudet →", answers:["noi kengät on uudet"] },
      { prompt:"Tuoko se? →", answers:["toiko se","toi seko?","toi se?"] },
    ]},
    { kind:"gridSelect", title:"Выбери только puhekieli", rule:"tää/toi/nää/noi", timed: 25, items:[
      { text:"toi", good:true },{ text:"tämä", good:false },{ text:"nää", good:true },
      { text:"nuo", good:false },{ text:"tää", good:true },
    ]},
    { kind:"memory", title:"Мемори: книжн. ↔ разг.", pairs:[
      { id:"d1", front:"tämä", back:"tää" },
      { id:"d2", front:"tuo", back:"toi" },
      { id:"d3", front:"nämä", back:"nää" },
      { id:"d4", front:"nuo", back:"noi" },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-conj",
  title: "PUHEKIELI: союзы/связки",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkmutta.png",
  summary: "mutta/että/sitten/kun~kuin/niin kuin/vaikka → mut/et/sit/ku/niinku/vaik.",
  contentHtml: `<p>В разговоре союзы сокращаются: <b>mutta → mut</b>, <b>että → et</b>, <b>sitten → sit</b>, <b>kun/kuin → ku</b>, <b>niin kuin → niinku</b>, <b>vaikka → vaik</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkmutta.png", alt:"konjunktiot puhekieli"} ]},
    { kind:"matchPairs", title:"Соедини книжн. → разг.", pairs:[
      { a:"mutta", b:"mut" },{ a:"että", b:"et" },{ a:"sitten", b:"sit" },
      { a:"kun", b:"ku" },{ a:"niin kuin", b:"niinku" },{ a:"vaikka", b:"vaik" },
    ]},
    { kind:"typeAnswer", title:"Собери фразу (разговорно)", items:[
      { prompt:"(но) __ tää on kallis.", answers:["mut"] },
      { prompt:"Mä luulen, __ se tulee.", answers:["et"] },
      { prompt:"Odota __ vähän.", answers:["sit"] },
      { prompt:"Tehdään __ eilen puhuttiin.", answers:["niinku"] },
    ]},
    { kind:"gridSelect", title:"Выбери только puhekieli-связки", rule:"mut/et/sit/ku/niinku/vaik", timed: 30, items:[
      { text:"mut", good:true },{ text:"että", good:false },{ text:"ku", good:true },
      { text:"niinku", good:true },{ text:"sitten", good:false },
    ]},
    { kind:"dialog", title:"Переделай ответ на разговорный", steps:[
      { text:"A: Lähdetäänkö nyt?", options:[
        { text:"Joo, mut mä haen takin.", next:1, correct:true },
        { text:"Kyllä, mutta minä haen takin.", next:1 },
      ]},
      { text:"A: Kuinka teet sen?", options:[
        { text:"Niinku sovittiin eilen.", next:"end", correct:true },
        { text:"Niin kuin sovimme eilen.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-verbit-haluta",
  title: "PUHEKIELI: глаголы (модель HALUTA)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminahaluan.png",
  summary: "1pl → пассив: me halutaan; 3pl = 3sg: ne haluaa; часто пропадает d/удлиняется гласная: haluan → haluun.",
  contentHtml: `<p>В puhekieli: <b>me-форма</b> заменяется на <b>пассив</b>: <i>me halutaan</i>. <b>3pl</b> = как <b>3sg</b>: <i>ne haluaa</i>. Часто <i>d</i> выпадает: <i>haluan → haluun</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminahaluan.png", alt:"verbit puhekieli"} ]},
    { kind:"flashcards", title:"Примеры", items:[
      { front:"Mä haluun kahvia." },
      { front:"Sä haluut teetä." },
      { front:"Se haluaa nukkua." },
      { front:"Me halutaan pizzaa." },
      { front:"Ne haluaa lähteä." },
    ]},
    { kind:"typeAnswer", title:"Kirjakieli → Puhekieli", items:[
      { prompt:"Minä haluan kahvia →", answers:["mä haluun kahvia","mää haluan kahvia","mä haluan kahvia"] },
      { prompt:"Me haluamme lähteä →", answers:["me halutaan lähteä"] },
      { prompt:"He haluavat jäätelöä →", answers:["ne haluaa jäätelöö","ne haluaa jäätelöä"] },
    ]},
    { kind:"gridSelect", title:"Выбери корректные разговорные формы", rule:"haluun/haluut/haluaa/halutaan/haluaa", timed: 35, items:[
      { text:"mä haluun", good:true },{ text:"sä haluut", good:true },{ text:"me haluamme", good:false },
      { text:"ne haluaa", good:true },{ text:"me halutaan", good:true },
    ]},
    { kind:"oddOne", title:"Лишнее (не puhekieli)", groups:[
      { options:["mä haluun","sä haluut","he haluavat","me halutaan"], correctIndex:2 },
    ]},
    { kind:"dialog", title:"Выбери разговорный ответ", steps:[
      { text:"A: Mitä syödään?", options:[
        { text:"Me halutaan pizzaa.", next:1, correct:true },
        { text:"Me haluamme pizzaa.", next:1 },
      ]},
      { text:"A: Entä lapset?", options:[
        { text:"Ne haluaa ranskalaisia.", next:"end", correct:true },
        { text:"He haluavat ranskalaisia.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-verbit-olla",
  title: "PUHEKIELI: глагол OLLA (короткие формы)",
  level: "A1",
  topic: "puhekieli",
  cover: "/cards/pkminaolen.png",
  summary: "Kirjakieli: olen/olet/on/olemme/olette/ovat → Puhekieli: oon/oot/on/ollaan/ootte/on.",
  contentHtml: `<p>Самые частые сокращения: <b>olen → oon</b>, <b>olet → oot</b>, <b>olemme → ollaan</b>, <b>olette → ootte</b>, <b>ovat → on</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[ {src:"/cards/pkminaolen.png", alt:"olla puhekieli"} ]},
    { kind:"matchPairs", title:"Kirjakieli → Puhekieli", pairs:[
      { a:"olen", b:"oon" },{ a:"olet", b:"oot" },{ a:"on", b:"on" },
      { a:"olemme", b:"ollaan" },{ a:"olette", b:"ootte" },{ a:"ovat", b:"on" },
    ]},
    { kind:"typeAnswer", title:"Переделай в puhekieli", items:[
      { prompt:"Minä olen kotona →", answers:["mä oon kotona","mää oon kotona"] },
      { prompt:"Te olette valmiit →", answers:["te ootte valmiit"] },
      { prompt:"He ovat myöhässä →", answers:["ne on myöhässä"] },
    ]},
    { kind:"gridSelect", title:"Выбери только короткие формы ‘olla’", rule:"oon/oot/on/ollaan/ootte/on", timed: 30, items:[
      { text:"oon", good:true },{ text:"olet", good:false },{ text:"ollaan", good:true },
      { text:"ovat", good:false },{ text:"ootte", good:true },
    ]},
    { kind:"memory", title:"OLLA: книжн. ↔ разг.", pairs:[
      { id:"o1", front:"olen", back:"oon" },
      { id:"o2", front:"olette", back:"ootte" },
      { id:"o3", front:"ovat", back:"on" },
    ]},
  ],
  playlist: "a1-puhekieli",
},
{
  id: "a1-pk-tulla",
  title: "PUHEKIELI: TULLA — «приходить»",
  level: "A1",
  topic: "puhekieli/глаголы",
  cover: "/cards/pktulen.png",
  summary: "kirjakieli → puhekieli: minä tulen → mää/mä tuun; me tullaan; ne tulee.",
  contentHtml: `
    <p>Для коротких глаголов в разговорной речи:<br>
    • <b>1л ед.</b> minä → <i>mää/mä</i>, <b>2л ед.</b> sinä → <i>sää/sä</i>;<br>
    • <b>мы</b> = форма <i>passiivi</i> → <i>me tullaan</i>;<br>
    • <b>они</b> <i>ne</i> + 3 л. ед. → <i>ne tulee</i>.</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/pktulen.png", alt:"puhekieli tulla" }]},

    { kind:"flashcards", title:"Kirjakieli → Puhekieli", items:[
      { front:"minä tulen →", back:"mää/mä tuun" },
      { front:"sinä tulet →", back:"sää/sä tuut" },
      { front:"hän tulee →", back:"se tulee" },
      { front:"me tulemme →", back:"me tullaan" },
      { front:"te tulette →", back:"te tuutte" },
      { front:"he tulevat →", back:"ne tulee" },
    ]},

    { kind:"matchPairs", title:"Соедини формы", pairs:[
      { a:"minä tulen", b:"mää tuun" },
      { a:"sinä tulet", b:"sää tuut" },
      { a:"me tulemme", b:"me tullaan" },
      { a:"he tulevat", b:"ne tulee" },
      { a:"te tulette", b:"te tuutte" },
    ]},

    { kind:"typeAnswer", title:"Введи PUHEKIELI (без точки)", items:[
      { prompt:"minä tulen →", answers:["mää tuun","mä tuun"] },
      { prompt:"sinä tulet →", answers:["sää tuut","sä tuut"] },
      { prompt:"me tulemme →", answers:["me tullaan"] },
      { prompt:"he tulevat →", answers:["ne tulee"] },
    ]},

    { kind:"gridSelect", title:"Выбери только puhekieli", rule:"mää/sää/se/me… + tuun/tuut/tullaan/tuutte/tulee", timed: 35, items:[
      { text:"mää tuun", good:true },
      { text:"sinä tulet", good:false },
      { text:"me tullaan", good:true },
      { text:"he tulevat", good:false },
      { text:"ne tulee", good:true },
    ]},

    { kind:"oddOne", title:"Найди лишнее (ошибка)", groups:[
      { options:["mää tuun","sää tuut","se tuun","me tullaan"], correctIndex:2, hint:"у se → tulee" },
    ]},

    { kind:"memory", title:"Мемори: лицо ↔ форма", pairs:[
      { id:"1", front:"minä", back:"mää/mä tuun" },
      { id:"2", front:"me", back:"me tullaan" },
      { id:"3", front:"he", back:"ne tulee" },
    ]},

    { kind:"dialog", title:"Мини-диалог", steps:[
      { text:"A: Tuutko huomenna kurssille?", options:[
        { text:"Joo, mää tuun.", next:"end", correct:true },
        { text:"Kyllä, minä tulen.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-menna",
  title: "PUHEKIELI: MENNÄ — «идти»",
  level: "A1",
  topic: "puhekieli/глаголы",
  cover: "/cards/pkmenen.png",
  summary: "minä menen → mää/mä meen; me mennään; ne menee.",
  contentHtml: `<p>Та же логика: <i>mää meen, sää meet, se menee, me mennään, te meette, ne menee.</i></p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/pkmenen.png", alt:"puhekieli mennä" }]},

    { kind:"matchPairs", title:"Kirjakieli → Puhekieli", pairs:[
      { a:"minä menen", b:"mää meen" },
      { a:"sinä menet", b:"sää meet" },
      { a:"me menemme", b:"me mennään" },
      { a:"te menette", b:"te meette" },
      { a:"he menevät", b:"ne menee" },
    ]},

    { kind:"typeAnswer", title:"Введи PUHEKIELI", items:[
      { prompt:"sinä menet →", answers:["sää meet","sä meet"] },
      { prompt:"me menemme →", answers:["me mennään"] },
      { prompt:"he menevät →", answers:["ne menee"] },
    ]},

    { kind:"gridSelect", title:"Выбери puhekieli", rule:"meen/meet/mennään/meette/menee", timed: 30, items:[
      { text:"minä menen", good:false },
      { text:"mää meen", good:true },
      { text:"me mennään", good:true },
      { text:"he menevät", good:false },
      { text:"ne menee", good:true },
    ]},

    { kind:"dialog", title:"Куда идём?", steps:[
      { text:"A: Mennäänks kahville?", options:[
        { text:"Joo, mennään!", next:"end", correct:true },
        { text:"Kyllä, me menemme.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-panna",
  title: "PUHEKIELI: PANNA — «ставить/класть»",
  level: "A1",
  topic: "puhekieli/глаголы",
  cover: "/cards/pkpanen.png",
  summary: "minä panen → mää/mä paan; me pannaan; ne panee.",
  contentHtml: `<p><i>mää paan, sää paat, se panee, me pannaan, te paatte, ne panee.</i></p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/pkpanen.png", alt:"puhekieli panna" }]},

    { kind:"flashcards", title:"Формы", items:[
      { front:"minä panen →", back:"mää/mä paan" },
      { front:"sinä panet →", back:"sää/sä paat" },
      { front:"hän panee →", back:"se panee" },
      { front:"me panemme →", back:"me pannaan" },
      { front:"te panette →", back:"te paatte" },
      { front:"he panevat →", back:"ne panee" },
    ]},

    { kind:"typeAnswer", title:"Скажи по-фински (puhekieli)", items:[
      { prompt:"(я) кладу", answers:["mää paan","mä paan"] },
      { prompt:"(мы) кладём", answers:["me pannaan"] },
      { prompt:"(они) кладут", answers:["ne panee"] },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["mää paan","sää paat","se paan","te paatte"], correctIndex:2, hint:"у se → panee" },
    ]},
  ],
  playlist: "a1-puhekieli",
},

{
  id: "a1-pk-ks",
  title: "PUHEKIELI: KS-KYSYMYS — разговорные вопросы",
  level: "A1",
  topic: "puhekieli/вопросы",
  cover: "/cards/pkasutkosina.png",
  summary: "–ko/–kö → –ks: Asutko sinä? → Asuks sä?; Mennemmekö? → Mennääks?",
  contentHtml: `
    <p>В разговорном языке вопросительная частица <b>-ko/-kö</b> превращается в <b>-ks</b> и «прилипает» к форме глагола:
    <i>asutko → asuks</i>, <i>puhutko → puhuks</i>, <i>tanssiiko → tanssiiks</i>,
    <i>menemmekö → mennääks</i>, <i>oletteko → ootteks</i>. Часто вместе с местоимениями <i>sä / se / me</i> и т.п.</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/pkasutkosina.png", alt:"ks-kysymys puhekieli" }]},

    { kind:"matchPairs", title:"Kirjakieli → Puhekieli (вопрос)", pairs:[
      { a:"Asutko sinä?", b:"Asuks sä?" },
      { a:"Puhutko sinä?", b:"Puhuks sä?" },
      { a:"Tanssiiko hän?", b:"Tanssiiks se?" },
      { a:"Menemmekö me?", b:"Mennääks me?" },
      { a:"Oletteko te?", b:"Ootteks te?" },
    ]},

    { kind:"gridSelect", title:"Выбери только KS-вопросы", rule:"оканчиваются на –ks + sä/se/me/te", timed: 35, items:[
      { text:"Asuks sä?", good:true },
      { text:"Puhuks sä?", good:true },
      { text:"Tanssiiks se?", good:true },
      { text:"Menettekö te?", good:false },
      { text:"Ootteks te?", good:true },
      { text:"Asutko sinä?", good:false },
    ]},

    { kind:"typeAnswer", title:"Преобразуй в PUHEKIELI (без точки)", items:[
      { prompt:"Asutko sinä? →", answers:["asuks sä","asuks sää"] },
      { prompt:"Puhutko sinä? →", answers:["puhuks sä","puhuks sää"] },
      { prompt:"Tanssiiko hän? →", answers:["tanssiiks se"] },
      { prompt:"Menemmekö me? →", answers:["mennääks me"] },
      { prompt:"Oletteko te? →", answers:["ootteks te"] },
    ]},

    { kind:"oddOne", title:"Лишнее (не ks-вопрос)", groups:[
      { options:["Asuks sä?","Puhuks sä?","Asutko sä?","Tanssiiks se?"], correctIndex:2 },
    ]},

    { kind:"dialog", title:"Мини-диалоги с –ks", steps:[
      { text:"A: Asuks sä täällä lähellä?", options:[
        { text:"Joo, asun.", next:1, correct:true },
        { text:"Kyllä, minä asunko.", next:1 },
      ]},
      { text:"A: Mennääks huomenna leffaan?", options:[
        { text:"Mennään!", next:"end", correct:true },
        { text:"Me menemme.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-puhekieli",
},
/* --- A1: Реакции/фразы --- */
{
  id: "a1-reaktiot",
  title: "REAKTIOT — разговорные реакции",
  level: "A1",
  topic: "фразы",
  cover: "/cards/ihantotta.png",
  summary: "Ihan totta?, Eikä?!, Sanopa muuta!, No..., Voi ei!, Niin (tietysti), Hyvä ajatus!",
  contentHtml: `<p>Короткие реакции помогают звучать естественно: <b>Ihan totta?</b> (серьёзно?), <b>Eikä?!</b> (не может быть!), <b>Sanopa muuta!</b> (и не говори), <b>No…</b> (ну…), <b>Voi ei!</b> (о нет), <b>Niin / Niin tietysti</b> (да, конечно), <b>Hyvä ajatus!</b> (хорошая идея).</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/ihantotta.png", alt:"reaktiot" }]},

    { kind:"flashcards", title:"Флешки: реакция → смысл", items:[
      { front:"Ihan totta? — Серьёзно?" },
      { front:"Eikä?! — Не может быть!" },
      { front:"Sanopa muuta! — И не говори!" },
      { front:"No… — Ну… / Что ж…" },
      { front:"Voi ei! — О, нет!" },
      { front:"Niin tietysti — Да, конечно" },
      { front:"Niin — Так / ага" },
      { front:"Hyvä ajatus! — Хорошая идея!" },
    ]},

    { kind:"matchPairs", title:"Подбери перевод (RU → FI)", pairs:[
      { a:"Серьёзно?", b:"Ihan totta?" },
      { a:"Не может быть!", b:"Eikä?!" },
      { a:"И не говори!", b:"Sanopa muuta!" },
      { a:"Ну… / Что ж…", b:"No..." },
      { a:"О, нет!", b:"Voi ei!" },
      { a:"Да, конечно", b:"Niin tietysti" },
      { a:"Так / ага", b:"Niin" },
      { a:"Хорошая идея!", b:"Hyvä ajatus!" },
    ]},

    { kind:"gridSelect", title:"Выбери только реакции", rule:"Короткие реплики: Ihan totta?/Eikä?!/Voi ei!/Niin/…", timed: 35, items:[
      { text:"Ihan totta?", good:true },{ text:"Eikä?!", good:true },{ text:"Sanopa muuta!", good:true },
      { text:"Voi ei!", good:true },{ text:"Niin tietysti", good:true },{ text:"Hyvä ajatus!", good:true },
      { text:"Asun Turussa.", good:false },{ text:"Pidän kahvista.", good:false },
    ]},

    { kind:"typeAnswer", title:"Напечатай реакцию (с вопросит./восклиц.)", items:[
      { prompt:"«Серьёзно?» →", answers:["ihan totta?"] },
      { prompt:"«Не может быть!» →", answers:["eikä?!","eikä?"] },
      { prompt:"«И не говори!» →", answers:["sanopa muuta!","sanopa muuta"] },
      { prompt:"«О нет!» →", answers:["voi ei!","voi ei"] },
    ]},

    { kind:"memory", title:"Мемори: RU ↔ FI", pairs:[
      { id:"r1", front:"Серьёзно?", back:"Ihan totta?" },
      { id:"r2", front:"О, нет!", back:"Voi ei!" },
      { id:"r3", front:"Хорошая идея!", back:"Hyvä ajatus!" },
      { id:"r4", front:"Да, конечно", back:"Niin tietysti" },
    ]},

    { kind:"dialog", title:"Мини-диалоги: выбери естественную реакцию", steps:[
      { text:"A: Sain työpaikan! (Я получил работу!)", options:[
        { text:"Mahtavaa! Hyvä ajatus!", next:1 },
        { text:"Vau! Ihan totta?", next:1, correct:true },
      ]},
      { text:"A: Matka peruuntui. (Поездку отменили.)", options:[
        { text:"Voi ei!", next:2, correct:true },
        { text:"Niin tietysti.", next:2 },
      ]},
      { text:"A: Lähdetäänkö kahville? (Пойдём на кофе?)", options:[
        { text:"Hyvä ajatus!", next:"end", correct:true },
        { text:"Sanopa muuta!", next:"end" },
      ]},
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["Ihan totta?","Eikä?!","Pidän kahvista.","Voi ei!"], correctIndex:2, hint:"одно — обычное повествование" },
    ]},
  ],
  playlist: "a1-expressions",
},

/* --- A1: Частицы/наречия из постера --- */
{
  id: "a1-partikkelit1",
  title: "ЧАСТИЦЫ: vasta, itse, kuitenkin, melkein, varmaan…",
  level: "A1",
  topic: "частицы",
  cover: "/cards/vastaitse.png",
  summary: "Усилители смысла: vasta (только), itse (сам), kuitenkin (однако), melkein (почти), varmaan (наверное), koko ajan (всё время), itse asiassa (на самом деле).",
  contentHtml: `<p>Частицы делают речь точнее: <b>vasta</b> (только), <b>itse</b> (сам), <b>kuitenkin</b> (однако), <b>melkein</b> (почти), <b>varmaan</b> (наверное), <b>koko ajan</b> (всё время), <b>itse asiassa</b> (на самом деле).</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/vastaitse.png", alt:"partikkelit" }]},

    { kind:"flashcards", title:"Примеры", items:[
      { front:"Uusi elämäsi on vasta alussa." },
      { front:"Haluan tehdä sen itse." },
      { front:"Lähdin kuitenkin kouluun Helsinkiin." },
      { front:"On melkein aamu." },
      { front:"Et varmaan muista minua." },
      { front:"Hän oli oikeassa koko ajan." },
      { front:"Minä itse asiassa muutan pian." },
    ]},

    { kind:"matchPairs", title:"Перевод частицы", pairs:[
      { a:"только", b:"vasta" },{ a:"сам", b:"itse" },{ a:"однако", b:"kuitenkin" },
      { a:"почти", b:"melkein" },{ a:"наверное", b:"varmaan" },
      { a:"всё время", b:"koko ajan" },{ a:"на самом деле", b:"itse asiassa" },
    ]},

    { kind:"typeAnswer", title:"Вставь подходящее слово", items:[
      { prompt:"____ lähden. (наверное)", answers:["varmaan"] },
      { prompt:"Heräsin ____ viideltä. (почти)", answers:["melkein"] },
      { prompt:"Teen tämän ____. (сам)", answers:["itse"] },
      { prompt:"Olin oikeassa ____ ____. (всё время)", answers:["koko ajan"] },
      { prompt:"Se on ____ alussa. (только)", answers:["vasta"] },
      { prompt:"____ ____, en voikaan tulla. (на самом деле)", answers:["itse asiassa"] },
    ]},

    { kind:"gridSelect", title:"Выбери только частицы", rule:"Слова: vasta/itse/kuitenkin/melkein/varmaan/koko ajan/itse asiassa", timed: 40, items:[
      { text:"vasta", good:true },{ text:"itse", good:true },{ text:"kuitenkin", good:true },
      { text:"melkein", good:true },{ text:"varmaan", good:true },{ text:"koko ajan", good:true },
      { text:"itse asiassa", good:true },{ text:"koulu", good:false },{ text:"oikeassa", good:false },
    ]},

    { kind:"dialog", title:"Подбери уместную частицу", steps:[
      { text:"A: Muutitko jo? B: (нет, только начинаю…)", options:[
        { text:"Olen vasta alussa.", next:1, correct:true },
        { text:"Olen koko ajan.", next:1 },
      ]},
      { text:"A: Näitkö Pekan eilen? B: (наверное…)", options:[
        { text:"Varmaan.", next:"end", correct:true },
        { text:"Melkein.", next:"end" },
      ]},
    ]},

    { kind:"memory", title:"Мемори: RU ↔ FI", pairs:[
      { id:"p1", front:"однако", back:"kuitenkin" },
      { id:"p2", front:"на самом деле", back:"itse asiassa" },
      { id:"p3", front:"всё время", back:"koko ajan" },
      { id:"p4", front:"почти", back:"melkein" },
    ]},
  ],
  playlist: "a1-expressions",
},

/* --- A1: Milloin? (время по часам) --- */
{
  id: "a1-milloin-kello",
  title: "MILLOIN: MONELTA? — время по часам (–LTA/–LTÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinlta.png",
  summary: "neljältä (16), kahdeksalta (8), puoli kahdeltatoista (11:30), viisitoista yli kolmelta (15:15).",
  contentHtml: `<p>На вопрос <b>Monelta?</b> отвечаем формой на –lta/–ltä: <i>neljältä</i> (в 16:00), <i>kahdeksalta</i> (в 8:00), <i>puoli kahdeltatoista</i> (в половине двенадцатого = 11:30), <i>viisitoista yli kolmelta</i> (15:15).</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinlta.png", alt:"monelta" }]},

    { kind:"matchPairs", title:"klo → форма –LTA/–LTÄ", pairs:[
      { a:"klo 16:00", b:"neljältä" },
      { a:"klo 8:00", b:"kahdeksalta" },
      { a:"klo 11:30", b:"puoli kahdeltatoista" },
      { a:"klo 15:15", b:"viisitoista yli kolmelta" },
    ]},

    { kind:"typeAnswer", title:"Вставь форму (одно слово/словосоч.)", items:[
      { prompt:"Koulu alkaa ___ (klo 8).", answers:["kahdeksalta"] },
      { prompt:"Tapaaminen on ___ (klo 16).", answers:["neljältä"] },
      { prompt:"Lounas on ___ (klo 11.30).", answers:["puoli kahdeltatoista"] },
      { prompt:"Juna lähtee ___ (klo 15.15).", answers:["viisitoista yli kolmelta"] },
    ]},

    { kind:"gridSelect", title:"Фильтр: только формы времени", rule:"Выбирай слова на –lta/–ltä", timed: 30, items:[
      { text:"neljältä", good:true },{ text:"kahdeksalta", good:true },{ text:"puoli kahdeltatoista", good:true },
      { text:"viisitoista yli kolmelta", good:true },
      { text:"neljällä", good:false },{ text:"kello", good:false },{ text:"päivällä", good:false },
    ]},

    { kind:"dialog", title:"Minä tuun… Monelta?", steps:[
      { text:"A: Monelta elokuva alkaa?", options:[
        { text:"Se alkaa kahdeksalta.", next:1, correct:true },
        { text:"Se alkaa kahdeksalla.", next:1 },
      ]},
      { text:"A: Entä lounas?", options:[
        { text:"Puoli kahdeltatoista.", next:"end", correct:true },
        { text:"Puoli kahdeltatoistaan.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Vuorokaudenaika --- */
{
  id: "a1-milloin-vuorokausi",
  title: "MILLOIN: время суток (–LLA/–LLÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinvuorokaudenaika.png",
  summary: "aamulla, illalla, päivällä, yöllä + tänä aamuna / tänä iltana / tänä yönä.",
  contentHtml: `<p>Время суток: <i>aamulla</i> (утром), <i>päivällä</i> (днём), <i>illalla</i> (вечером), <i>yöllä</i> (ночью). Особые формы: <i>tänä aamuna / iltana / yönä</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinvuorokaudenaika.png", alt:"vuorokaudenaika" }]},

    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"утром", b:"aamulla" },{ a:"днём", b:"päivällä" },
      { a:"вечером", b:"illalla" },{ a:"ночью", b:"yöllä" },
      { a:"этим утром", b:"tänä aamuna" },
    ]},

    { kind:"typeAnswer", title:"Заполни –LLA/–LLÄ", items:[
      { prompt:"Me tapaamme ___ (вечером).", answers:["illalla"] },
      { prompt:"Opiskelen ___ (ночью).", answers:["yöllä"] },
      { prompt:"___ (этим утром) join kahvia.", answers:["tänä aamuna"] },
    ]},

    { kind:"gridSelect", title:"Выбери формы времени суток", rule:"С окончаниями –lla/–llä + специальные tänä aamuna/iltana/yönä", timed: 35, items:[
      { text:"aamulla", good:true },{ text:"päivällä", good:true },{ text:"illalla", good:true },{ text:"yöllä", good:true },
      { text:"tänä aamuna", good:true },{ text:"yö", good:false },{ text:"aamu", good:false },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Päivä (дни/праздники) --- */
{
  id: "a1-milloin-paiva",
  title: "MILLOIN: дни недели/праздники (–NA/–NÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinna.png",
  summary: "maanantaina, tiistaina, viikonloppuna, viime lauantaina, tänä sunnuntaina, jouluna…",
  contentHtml: `<p>В какой день? <b>–na/–nä</b>: <i>maanantaina</i>, <i>tiistaina</i>, <i>viikonloppuna</i>, <i>viime lauantaina</i>, <i>tänä sunnuntaina</i>, <i>jouluna</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinna.png", alt:"paivana" }]},

    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"в понедельник", b:"maanantaina" },
      { a:"во вторник", b:"tiistaina" },
      { a:"в выходные", b:"viikonloppuna" },
      { a:"в прошлую субботу", b:"viime lauantaina" },
      { a:"в это воскресенье", b:"tänä sunnuntaina" },
      { a:"на Рождество", b:"jouluna" },
    ]},

    { kind:"typeAnswer", title:"Только форма дня (одно слово)", items:[
      { prompt:"(во вторник) →", answers:["tiistaina"] },
      { prompt:"(в выходные) →", answers:["viikonloppuna"] },
      { prompt:"(в прошлую субботу) →", answers:["viime lauantaina"] },
    ]},

    { kind:"gridSelect", title:"Выбери только –NA/–NÄ", rule:"Формы дней/праздников", timed: 30, items:[
      { text:"maanantaina", good:true },{ text:"viime lauantaina", good:true },{ text:"jouluna", good:true },
      { text:"aamulla", good:false },{ text:"viime vuonna", good:false },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Päiväys (даты) --- */
{
  id: "a1-milloin-paivays",
  title: "MILLOIN: даты (päivämäärä)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinpaivays.png",
  summary: "25. joulukuuta; 1. tammikuuta; 14. helmikuuta.",
  contentHtml: `<p>Дата: <i>25. joulukuuta</i>, <i>1. tammikuuta</i>, <i>14. helmikuuta</i>. Ставим число с точкой + месяц в партитиве.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinpaivays.png", alt:"paivays" }]},

    { kind:"matchPairs", title:"Дата → по-фински", pairs:[
      { a:"25 декабря", b:"25. joulukuuta" },
      { a:"1 января", b:"1. tammikuuta" },
      { a:"14 февраля", b:"14. helmikuuta" },
    ]},

    { kind:"typeAnswer", title:"Напечатай дату по-фински", items:[
      { prompt:"(25 декабря) →", answers:["25. joulukuuta"] },
      { prompt:"(1 января) →", answers:["1. tammikuuta"] },
      { prompt:"(14 февраля) →", answers:["14. helmikuuta"] },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["25. joulukuuta","1. tammikuuta","aamulla","14. helmikuuta"], correctIndex:2, hint:"одно — не дата" },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Viikko --- */
{
  id: "a1-milloin-viikko",
  title: "MILLOIN: неделя (–LLA/–LLÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinllaen.png",
  summary: "viime viikolla, tällä viikolla, ensi viikolla, seuraavalla viikolla.",
  contentHtml: `<p>На какой неделе? <i>viime viikolla</i>, <i>tällä viikolla</i>, <i>ensi viikolla</i>, <i>seuraavalla viikolla</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinllaen.png", alt:"viikko" }]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"на прошлой неделе", b:"viime viikolla" },
      { a:"на этой неделе", b:"tällä viikolla" },
      { a:"на следующей неделе", b:"ensi viikolla" },
      { a:"на следующей-следующей неделе", b:"seuraavalla viikolla" },
    ]},
    { kind:"typeAnswer", title:"Скажи по-фински (одно/два слова)", items:[
      { prompt:"(на этой неделе) →", answers:["tällä viikolla"] },
      { prompt:"(на следующей неделе) →", answers:["ensi viikolla"] },
    ]},
    { kind:"gridSelect", title:"Только «недельные» формы", rule:"С окончанием –lla/–llä + viikolla", timed: 30, items:[
      { text:"viime viikolla", good:true },{ text:"tällä viikolla", good:true },
      { text:"ensi viikolla", good:true },{ text:"seuraavalla viikolla", good:true },
      { text:"maanantaina", good:false },{ text:"aamulla", good:false },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Kuukausi --- */
{
  id: "a1-milloin-kuukausi",
  title: "MILLOIN: месяц (–SSA/–SSÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinssa.png",
  summary: "tammikuussa, helmikuussa, viime kuussa, tässä kuussa, ensi kuussa.",
  contentHtml: `<p>В каком месяце? <b>–ssa/–ssä</b>: <i>tammikuussa</i>, <i>helmikuussa</i>, <i>viime kuussa</i>, <i>tässä kuussa</i>, <i>ensi kuussa</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinssa.png", alt:"kuukausi" }]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"в январе", b:"tammikuussa" },
      { a:"в феврале", b:"helmikuussa" },
      { a:"в прошлом месяце", b:"viime kuussa" },
      { a:"в этом месяце", b:"tässä kuussa" },
      { a:"в следующем месяце", b:"ensi kuussa" },
    ]},
    { kind:"typeAnswer", title:"Только форма месяца", items:[
      { prompt:"(в январе) →", answers:["tammikuussa"] },
      { prompt:"(в прошлом месяце) →", answers:["viime kuussa"] },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Vuodenaika --- */
{
  id: "a1-milloin-vuodenaika",
  title: "MILLOIN: время года (–LLA/–LLÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloinlla.png",
  summary: "keväällä, kesällä, syksyllä, talvella + tänä kesänä / viime syksynä / ensi keväänä.",
  contentHtml: `<p>Время года: <i>keväällä</i>, <i>kesällä</i>, <i>syksyllä</i>, <i>talvella</i>. Особые: <i>tänä kesänä</i>, <i>viime syksynä</i>, <i>ensi keväänä</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinlla.png", alt:"vuodenaika" }]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"весной", b:"keväällä" },{ a:"летом", b:"kesällä" },
      { a:"осенью", b:"syksyllä" },{ a:"зимой", b:"talvella" },
      { a:"этим летом", b:"tänä kesänä" },{ a:"в прошлую осень", b:"viime syksynä" },
    ]},
    { kind:"gridSelect", title:"Только времена года", rule:"keväällä/kesällä/syksyllä/talvella + tänä kesänä/ensi keväänä/…", timed: 35, items:[
      { text:"keväällä", good:true },{ text:"kesällä", good:true },{ text:"syksyllä", good:true },{ text:"talvella", good:true },
      { text:"tänä kesänä", good:true },{ text:"maanantaina", good:false },{ text:"kello", good:false },
    ]},
  ],
  playlist: "a1-time",
},

/* --- A1: Vuosi --- */
{
  id: "a1-milloin-vuosi",
  title: "MILLOIN: год (–NA/–NÄ)",
  level: "A1",
  topic: "время",
  cover: "/cards/milloin.png",
  summary: "vuonna 1917, viime vuonna, tänä vuonna, ensi vuonna.",
  contentHtml: `<p>В каком году? <i>vuonna 1917</i>, <i>viime vuonna</i>, <i>tänä vuonna</i>, <i>ensi vuonna</i>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloin.png", alt:"vuonna" }]},
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"в 1917 году", b:"vuonna 1917" },
      { a:"в прошлом году", b:"viime vuonna" },
      { a:"в этом году", b:"tänä vuonna" },
      { a:"в следующем году", b:"ensi vuonna" },
    ]},
    { kind:"typeAnswer", title:"Дополни правильно (одно/два слова)", items:[
      { prompt:"(в этом году) →", answers:["tänä vuonna"] },
      { prompt:"(в следующем году) →", answers:["ensi vuonna"] },
    ]},
    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["tänä vuonna","ensi vuonna","viime viikolla","vuonna 1917"], correctIndex:2, hint:"одно — про неделю" },
    ]},
  ],
  playlist: "a1-time",
},
{
  id: "a1-milloin-joka",
  title: "MILLOIN: JOKA — «каждый …»",
  level: "A1",
  topic: "время/частотность",
  cover: "/cards/milloinjoka.png",
  summary: "joka aamu, joka päivä, joka maanantai, joka kuukausi, joka vuosi.",
  contentHtml: `<p><b>JOKA + ед.число</b> = «каждый»: <i>joka aamu</i> (каждое утро), <i>joka päivä</i> (каждый день), <i>joka maanantai</i> (каждый понедельник), <i>joka kuukausi</i> (каждый месяц), <i>joka vuosi</i> (каждый год).</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/milloinjoka.png", alt:"joka" }]},

    { kind:"flashcards", title:"Примеры", items:[
      { front:"Käyn lenkillä joka aamu." },
      { front:"Juon kahvia joka päivä." },
      { front:"Meillä on tunti joka maanantai." },
      { front:"Saan palkan joka kuukausi." },
      { front:"Käymme lääkärissä joka vuosi." },
    ]},

    { kind:"matchPairs", title:"RU → FI (каждый…)", pairs:[
      { a:"каждое утро", b:"joka aamu" },
      { a:"каждый день", b:"joka päivä" },
      { a:"каждый понедельник", b:"joka maanantai" },
      { a:"каждый месяц", b:"joka kuukausi" },
      { a:"каждый год", b:"joka vuosi" },
    ]},

    { kind:"gridSelect", title:"Выбери только формы JOKA", rule:"Фразы, начинающиеся с «joka …»", timed: 35, items:[
      { text:"joka aamu", good:true },{ text:"joka päivä", good:true },{ text:"joka maanantai", good:true },
      { text:"joka kuukausi", good:true },{ text:"joka vuosi", good:true },
      { text:"maanantaina", good:false },{ text:"aamulla", good:false },{ text:"tällä viikolla", good:false },
    ]},

    { kind:"typeAnswer", title:"Вставь «joka …»", items:[
      { prompt:"Käyn salilla ___ (каждый день).", answers:["joka päivä"] },
      { prompt:"Herään ___ (каждое утро).", answers:["joka aamu"] },
      { prompt:"Kurssi on ___ (каждый понедельник).", answers:["joka maanantai"] },
      { prompt:"Saan palkan ___ (каждый месяц).", answers:["joka kuukausi"] },
      { prompt:"Käyn tarkastuksessa ___ (каждый год).", answers:["joka vuosi"] },
    ]},

    { kind:"memory", title:"Мемори: RU ↔ FI", pairs:[
      { id:"m1", front:"каждый день", back:"joka päivä" },
      { id:"m2", front:"каждый месяц", back:"joka kuukausi" },
      { id:"m3", front:"каждый год", back:"joka vuosi" },
      { id:"m4", front:"каждое утро", back:"joka aamu" },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["joka aamu","joka maanantai","joka kuukausi","maanantaina"], correctIndex:3, hint:"без JOKA" },
    ]},

    { kind:"dialog", title:"Kuinka usein? — выбери естественный ответ", steps:[
      { text:"A: Kuinka usein juot kahvia?", options:[
        { text:"Joka päivä.", next:1, correct:true },
        { text:"Tänä aamuna.", next:1 },
      ]},
      { text:"A: Milloin teillä on kurssi?", options:[
        { text:"Joka maanantai.", next:2, correct:true },
        { text:"Viime maanantaina.", next:2 },
      ]},
      { text:"A: Kuinka usein käyt lääkärissä?", options:[
        { text:"Joka vuosi.", next:"end", correct:true },
        { text:"Aamulla.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-time",
},
{
  id: "a1-imperfekti-yo-uo-ie",
  title: "IMPERFEKTI: YÖ→ÖI / UO→OI / IE→EI",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfektiyooi.png",
  summary: "syön→söin, juot→joit, viemme→veimme. Три «скользящих» дифтонга + i.",
  contentHtml: `
    <p><b>Правило</b>: если в основе <i>yö/uo/ie</i>, в имперфекте они дают <i>öi/oi/ei</i> + личное окончание.</p>
    <p><b>Примеры</b>: syön → söin, juot → joit, viemme → veimme, lyön → löin, tuon → toin.</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[
      { src:"/cards/imperfektiyooi.png", alt:"imperfekti yö/uo/ie → öi/oi/ei" }
    ]},

    { kind:"flashcards", title:"Образцы (презенс → имперфект)", items:[
      { front:"syön → ?", back:"söin" },
      { front:"juot → ?", back:"joit" },
      { front:"viemme → ?", back:"veimme" },
      { front:"lyön → ?", back:"löin" },
      { front:"tuon → ?", back:"toin" },
    ]},

    { kind:"matchPairs", title:"Соедини (презенс → имперфект)", pairs:[
      { a:"syön", b:"söin" },
      { a:"juot", b:"joit" },
      { a:"viemme", b:"veimme" },
      { a:"lyön", b:"löin" },
      { a:"tuon", b:"toin" },
    ]},

    { kind:"typeAnswer", title:"Впиши форму имперфекта (без местоим.)", items:[
      { prompt:"syön →", answers:["söin"] },
      { prompt:"juot →", answers:["joit"] },
      { prompt:"viemme →", answers:["veimme"] },
      { prompt:"lyön →", answers:["löin"] },
      { prompt:"tuon →", answers:["toin"] },
    ]},

    { kind:"gridSelect", title:"Поймай правило (только ÖI/OI/EI)", rule:"Выбирай глаголы, где презенс имеет yö/uo/ie → в имперфекте öi/oi/ei", timed: 35, items:[
      { text:"syön → söin", good:true },
      { text:"juot → joit", good:true },
      { text:"vien → vein", good:true },
      { text:"otan → otin", good:false },
      { text:"sanon → sanoin", good:false },
      { text:"herään → heräsin", good:false },
    ]},

    { kind:"oddOne", title:"Где ошибка?", groups:[
      { options:["söin","joit","veimme","toin","*syöin"], correctIndex:4, hint:"лишняя «y»" },
      { options:["löin","soin","tein","join","voin"], correctIndex:1, hint:"soin ≠ от syödä" },
    ]},
  ],
  playlist: "a1-imperfekti"
},

{
  id: "a1-imperfekti-vv-i",
  title: "IMPERFEKTI: VV→V + i",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfektivv.png",
  summary: "Двойная согласная в основе → одна + i: saan→sain, myyt→myit.",
  contentHtml: `<p><b>VV→V</b> + <i>i</i>: saan → sain, myyt → myit, jään → jäin.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/imperfektivv.png", alt:"VV → V + i" }]},

    { kind:"matchPairs", title:"Подбери пары", pairs:[
      { a:"saan", b:"sain" },
      { a:"myyt", b:"myit" },
      { a:"jään", b:"jäin" },
      { a:"tuut", b:"tuit" }, // шутливый ложный след
    ]},

    { kind:"gridSelect", title:"Выбери только VV→V+i", rule:"формы, где VV стало V", timed: 30, items:[
      { text:"saan → sain", good:true },
      { text:"myyt → myit", good:true },
      { text:"jään → jäin", good:true },
      { text:"sanon → sanoin", good:false },
      { text:"otan → otin", good:false },
    ]},

    { kind:"typeAnswer", title:"Напечатай форму", items:[
      { prompt:"(ты продаёшь) myyt → (ты продал)", answers:["myit"] },
      { prompt:"(я получаю) saan → (я получил)", answers:["sain"] },
    ]},

    { kind:"oddOne", title:"Лишнее (по правилу VV→V+i)", groups:[
      { options:["sain","jäin","myit","sanoin"], correctIndex:3, hint:"здесь VV не было" },
    ]},
  ],
  playlist: "a1-imperfekti"
},

{
  id: "a1-imperfekti-a-o",
  title: "IMPERFEKTI: A → O (две слога, оба с A)",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfekti1.png",
  summary: "Если в глаголе 2 слога и в обоих «a»: ajan/maksat/antaa → ajoin/maksoit/antoi.",
  contentHtml: `<p><b>A→O</b> перед <i>i</i>, когда 2 слога и обе с «a».</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/imperfekti1.png", alt:"A→O правило" }]},

    { kind:"flashcards", title:"Мини-набор", items:[
      { front:"ajan → ?", back:"ajoin" },
      { front:"maksat → ?", back:"maksoit" },
      { front:"antaa → ?", back:"antoi" },
    ]},

    { kind:"typeAnswer", title:"Впиши по правилу A→O", items:[
      { prompt:"ajan →", answers:["ajoin"] },
      { prompt:"maksat →", answers:["maksoit"] },
      { prompt:"antaa →", answers:["antoi"] },
    ]},

    { kind:"gridSelect", title:"Что сюда НЕ подходит?", rule:"Найди форму, где НЕ применяется A→O", timed: 25, items:[
      { text:"ajoin", good:false },
      { text:"antoi", good:false },
      { text:"maksoit", good:false },
      { text:"otin", good:true },
    ]},
  ],
  playlist: "a1-imperfekti"
},

{
  id: "a1-imperfekti-drop",
  title: "IMPERFEKTI: A/Ä/E/I уходят",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfektiaeipois.png",
  summary: "Если основа на a/ä/e/i → буква уходит перед i: otan→otin, pidät→pidit…",
  contentHtml: `<p><b>a, ä, e, i</b> в конце основы чаще <i>пропадают</i> перед имперфектным <b>i</b>.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/imperfektiaeipois.png", alt:"буква уходит" }]},

    { kind:"matchPairs", title:"Презенс → имперфект", pairs:[
      { a:"otan", b:"otin" },
      { a:"pidät", b:"pidit" },
      { a:"luemme", b:"luimme" },
      { a:"uitte", b:"uitte" },
      { a:"menen", b:"menin" },
    ]},

    { kind:"typeAnswer", title:"Вставь форму (одно слово)", items:[
      { prompt:"(он) puhuu → (он говорил)", answers:["puhui"] },
      { prompt:"(мы) tulemme → (мы пришли)", answers:["tulimme"] },
      { prompt:"(я) otan →", answers:["otin"] },
      { prompt:"(ты) pidät →", answers:["pidit"] },
    ]},

    { kind:"gridSelect", title:"Выбери «буква ушла»", rule:"основа оканчивалась на a/ä/e/i", timed: 35, items:[
      { text:"otan → otin", good:true },
      { text:"pidät → pidit", good:true },
      { text:"menen → menin", good:true },
      { text:"sanon → sanoin", good:false },
      { text:"saan → sain", good:false },
    ]},
  ],
  playlist: "a1-imperfekti"
},

{
  id: "a1-imperfekti-keep",
  title: "IMPERFEKTI: O/Ö/U/Y остаются",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfekti.png",
  summary: "Если основа на o/ö/u/y — гласная «остаётся»: sanon→sanoin, säilöt→säilöit…",
  contentHtml: `<p><b>o, ö, u, y</b> в конце основы сохраняются: sanon → sanoin, puhumme → puhuimme.</p>`,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/imperfekti.png", alt:"o/ö/u/y pysyvät" }]},

    { kind:"matchPairs", title:"Сопоставь", pairs:[
      { a:"sanon", b:"sanoin" },
      { a:"säilöt", b:"säilöit" },
      { a:"puhumme", b:"puhuimme" },
      { a:"pysytte", b:"pysyitte" },
    ]},

    { kind:"typeAnswer", title:"Напечатай ответ", items:[
      { prompt:"puhumme →", answers:["puhuimme"] },
      { prompt:"pysytte →", answers:["pysyitte"] },
    ]},

    { kind:"gridSelect", title:"Оставь только правильные пары", rule:"o/ö/u/y сохранены", timed: 30, items:[
      { text:"sanon → sanoin", good:true },
      { text:"säilöt → säilöit", good:true },
      { text:"luen → luin", good:false },
      { text:"otan → otin", good:false },
    ]},

    { kind:"oddOne", title:"Лишняя форма", groups:[
      { options:["sanoin","puhuimme","säilöit","sain"], correctIndex:3, hint:"здесь правило другое" },
    ]},
  ],
  playlist: "a1-imperfekti"
},

{
  id: "a1-imperfekti-si",
  title: "IMPERFEKTI: +SI (тип 4 и «особые» тип 1)",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfekti2.png",
  summary: "herään→heräsin, pelaat→pelasit, haluaa→halusi; tiedän→tiesin, löydät→löysit, lentää→lensi.",
  contentHtml: `
    <p><b>Тип 4</b> (–ata/–ätä/–ota/–ötä…) и ряд <b>особых тип-1</b> образуют имперфект на <b>–si</b>.</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/imperfekti2.png", alt:"+SI-inperfekti" }]},

    { kind:"flashcards", title:"Примеры +SI", items:[
      { front:"herään → ?", back:"heräsin" },
      { front:"pelaat → ?", back:"pelasit" },
      { front:"haluaa → ?", back:"halusi" },
      { front:"tiedän → ?", back:"tiesin" },
      { front:"löydät → ?", back:"löysit" },
      { front:"lentää → ?", back:"lensi" },
    ]},

    { kind:"matchPairs", title:"Соедини (презенс → имперфект)", pairs:[
      { a:"herään", b:"heräsin" },
      { a:"pelaat", b:"pelasit" },
      { a:"haluaa", b:"halusi" },
      { a:"tiedän", b:"tiesin" },
      { a:"löydät", b:"löysit" },
      { a:"lentää", b:"lensi" },
    ]},

    { kind:"typeAnswer", title:"Впиши форму на –si", items:[
      { prompt:"herään →", answers:["heräsin"] },
      { prompt:"pelaat →", answers:["pelasit"] },
      { prompt:"tiedän →", answers:["tiesin"] },
    ]},

    { kind:"gridSelect", title:"Выбери ВСЕ формы на –si", rule:"Имперфект оканчивается на –si", timed: 35, items:[
      { text:"heräsin", good:true },
      { text:"pelasit", good:true },
      { text:"halusi", good:true },
      { text:"sanoin", good:false },
      { text:"otin", good:false },
    ]},

    { kind:"oddOne", title:"Где НЕ –si?", groups:[
      { options:["tiesin","löysit","lensi","söin"], correctIndex:3, hint:"это другое правило" },
    ]},
  ],
  playlist: "a1-imperfekti"
},

/* СВОДНАЯ ПРАКТИКА */
{
  id: "a1-imperfekti-mixi",
  title: "IMPERFEKTI: большая тренировка",
  level: "A2",
  topic: "время прошедшее",
  cover: "/cards/imperfektiyooi.png",
  summary: "Все правила в одном месте: выбери правило, напечатай форму, собери фразы, мини-диалоги.",
  contentHtml: `<p>Смешанная практика имперфекта: от прожигания правил до мини-сценок.</p>`,
  widgets: [
    { kind:"imageStrip", title:"Шпаргалки-правила", items:[
      { src:"/cards/imperfektiyooi.png", alt:"yö/uo/ie" },
      { src:"/cards/imperfektivv.png", alt:"vv→v" },
      { src:"/cards/imperfekti1.png", alt:"a→o" },
      { src:"/cards/imperfektiaeipois.png", alt:"a/ä/e/i уходят" },
      { src:"/cards/imperfekti.png", alt:"o/ö/u/y остаются" },
      { src:"/cards/imperfekti2.png", alt:"+si" },
    ]},

    /* 1) Быстрый тест на правило */
    { kind:"gridSelect", title:"Какое правило?", rule:"Выбирай ПРАВИЛО, которым образовано слово", timed: 60, items:[
      { text:"söin — yö→öi", good:true },
      { text:"sanoin — o/ö/u/y остаются", good:true },
      { text:"maksoit — a→o", good:true },
      { text:"heräsin — +si", good:true },
      { text:"otin — a/ä/e/i уходят", good:true },
      { text:"sain — vv→v+i", good:true },
    ]},

    /* 2) Вставь форму в контекст */
    { kind:"typeAnswer", title:"Контекст (прошедшее)", items:[
      { prompt:"Eilen minä __ (syödä) jäätelöä.", answers:["söin"] },
      { prompt:"Viime vuonna me __ (muuttaa) Helsinkiin.", answers:["muutimme"] },
      { prompt:"Hän __ (antaa) minulle kirjan.", answers:["antoi"] },
      { prompt:"Eilen sinä __ (löytää) avaimet.", answers:["löysit"] },
      { prompt:"Aamulla Alex __ (tuoda) kahvia.", answers:["toi"] },
    ]},

    /* 3) Мемори: презенс ↔ имперфект */
    { kind:"memory", title:"Мемори: презенс ↔ имперфект", pairs:[
      { id:"m1", front:"minä syön", back:"söin" },
      { id:"m2", front:"sinä pelaat", back:"pelasit" },
      { id:"m3", front:"me puhumme", back:"puhuimme" },
      { id:"m4", front:"hän antaa", back:"antoi" },
      { id:"m5", front:"minä saan", back:"sain" },
    ]},

    /* 4) Порядок истории */
    { kind:"order", title:"Расставь события вчерашнего дня", sequence:[
      "Heräsin klo 7.",
      "Join kahvia.",
      "Menin töihin.",
      "Söin lounasta.",
      "Palasin kotiin."
    ]},

    /* 5) Мини-диалоги на время */
    { kind:"dialog", title:"Eilen illalla… (мини-диалог)", steps:[
      { text:"A: Mitä teit eilen?", options:[
        { text:"Kävin elokuvissa.", next:1, correct:true },
        { text:"Käyn elokuvissa.", next:1 },
      ]},
      { text:"A: Milloin tulit kotiin?", options:[
        { text:"Tulin kymmeneltä.", next:"end", correct:true },
        { text:"Tulen kymmeneltä.", next:"end" },
      ]},
    ]},

    /* 6) Лишнее — отстрел ошибок */
    { kind:"oddOne", title:"Сними неправильную форму", groups:[
      { options:["joit","veimme","antoin","otin"], correctIndex:2, hint:"имперфект от antaa" },
      { options:["sanoin","pelasin","sain","puhummin"], correctIndex:3, hint:"двойная m здесь лишняя" },
    ]},
  ],
  playlist: "a1-imperfekti"
},
{
  id: "a1-sanatyyppi-es",
  title: "SANATYYPPI –ES",
  level: "A1",
  topic: "склонение/типы слов",
  cover: "/cards/st_es.png",
  summary: "vihannes → vartalo: vihannekse- → vihanneksen, -kseen, -ksessa…; ещё: eines, ilves, juures, neljännes, veljes.",
  contentHtml: `
    <p><b>-ES</b> даёт основу <b>-EKSE-</b>: <i>vihannes → vihannekse-</i>.</p>
    <p>Примеры: <i>eines</i> (полуфабрикат), <i>ilves</i> (рысь), <i>juures</i> (корнеплод), <i>neljännes</i> (четверть), <i>veljes</i> (брат).</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/st_es.png", alt:"-ES taivutus" }]},

    /* флеши по vihannes */
    { kind:"flashcards", title:"Vihannes — формы", items:[
      { front:"(NOM) vihannes" }, { front:"(P) vihannesta" }, { front:"(GEN) vihanneksen" },
      { front:"(ILL) vihannekseen" }, { front:"(INE) vihanneksessa" }, { front:"(ELA) vihanneksesta" },
      { front:"(ALL) vihannekselle" }, { front:"(ADE) vihanneksella" }, { front:"(ABL) vihannekselta" },
      { front:"(PL NOM) vihannekset" },
    ]},

    /* пара RU→FI */
    { kind:"matchPairs", title:"RU → FI", pairs:[
      { a:"полуфабрикат", b:"eines" },
      { a:"рысь", b:"ilves" },
      { a:"корнеплод", b:"juures" },
      { a:"четверть", b:"neljännes" },
      { a:"брат", b:"veljes" },
    ]},

    /* найди основу */
    { kind:"gridSelect", title:"Где правильная ОСНОВА –EKSE–?", rule:"Выбирай только слова с основой –ekse–", timed: 35, items:[
      { text:"vihannekse-", good:true },{ text:"juurekse-", good:true },
      { text:"ilvekse-", good:true },{ text:"einekse-", good:true },
      { text:"käännökse-", good:false },{ text:"kerrokse-", good:false },{ text:"vastaukse-", good:false },
    ]},

    /* напечатай форму */
    { kind:"typeAnswer", title:"Сделай форму от vihannes", items:[
      { prompt:"(GEN) →", answers:["vihanneksen"] },
      { prompt:"(ILL) →", answers:["vihannekseen"] },
      { prompt:"(INE) →", answers:["vihanneksessa"] },
      { prompt:"(PL NOM) →", answers:["vihannekset"] },
    ]},

    /* мемори: NOM ↔ GEN/ILL */
    { kind:"memory", title:"Мемори: NOM ↔ форма", pairs:[
      { id:"1", front:"juures", back:"juureksen" },
      { id:"2", front:"ilves", back:"ilveksen" },
      { id:"3", front:"eines", back:"einekseen" },
      { id:"4", front:"neljännes", back:"neljännekseen" },
    ]},

    /* лишнее */
    { kind:"oddOne", title:"Найди лишнее", groups:[
      { options:["juureksen","ilveksen","vihanneksen","keskuksen"], correctIndex:3, hint:"одно — тип –US" },
      { options:["vihannekseen","vihanneksessa","vihannekset","vihannesella"], correctIndex:3, hint:"ошибка в суффиксе" },
    ]},
  ],
  playlist: "a1-tyypit",
},

{
  id: "a1-sanatyyppi-os",
  title: "SANATYYPPI –OS/ÖS",
  level: "A1",
  topic: "склонение/типы слов",
  cover: "/cards/st_os.png",
  summary: "kerros → vartalo: kerrokse- → kerroksen, -kseen, -ksessa…; частотные: annos, kierros, ostos, rikos, veistos, käännös, näytös.",
  contentHtml: `
    <p><b>-OS/ÖS</b> → основа <b>-OKSE-/-ÖKSE-</b>: <i>kerros → kerrokse-</i>.</p>
    <p>Часто встречаются: <i>annos</i> (порция), <i>kierros</i> (раунд), <i>ostos</i> (покупка), <i>rikos</i> (преступление), <i>veistos</i> (скульптура), <i>käännös</i> (перевод), <i>näytös</i> (акт/шоу).</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/st_os.png", alt:"-OS/ÖS taivutus" }]},

    { kind:"flashcards", title:"Kerros — формы", items:[
      { front:"(NOM) kerros" }, { front:"(P) kerrosta" }, { front:"(GEN) kerroksen" },
      { front:"(ILL) kerrokseen" }, { front:"(INE) kerroksessa" }, { front:"(ELA) kerroksesta" },
      { front:"(ALL) kerrokselle" }, { front:"(ADE) kerroksella" }, { front:"(ABL) kerrokselta" },
      { front:"(PL NOM) kerrokset" },
    ]},

    /* пары NOM → GEN */
    { kind:"matchPairs", title:"NOM → GEN", pairs:[
      { a:"annos", b:"annoksen" },
      { a:"kierros", b:"kierroksen" },
      { a:"ostos", b:"ostoksen" },
      { a:"rikos", b:"rikoksen" },
      { a:"näytös", b:"näytöksen" },
    ]},

    /* построитель предложений */
    { kind:"typeAnswer", title:"Вставь правильную форму", items:[
      { prompt:"Asun __ (kerros, INE).", answers:["kerroksessa"] },
      { prompt:"Ostin kaksi __ (annos, P).", answers:["annosta"] },
      { prompt:"Tämä on toisen __ (kierros, GEN).", answers:["kierroksen"] },
      { prompt:"Luetko tämän __? (käännös, GEN)", answers:["käännöksen"] },
    ]},

    /* фильтр по типу */
    { kind:"gridSelect", title:"Только –OS/ÖS", rule:"Выбирай слова, которые дают -okse-/-ökse-", timed: 35, items:[
      { text:"kerrokse-", good:true },{ text:"annoksen", good:true },
      { text:"kierrokseen", good:true },{ text:"käännöksen", good:true },
      { text:"vihanneksen", good:false },{ text:"vastauksen", good:false },
    ]},

    { kind:"oddOne", title:"Лишнее", groups:[
      { options:["ostoksen","rikoksen","kerroksen","kysymyksen"], correctIndex:3, hint:"одно — –YS" },
    ]},

    { kind:"memory", title:"Мемори: слово ↔ перевод", pairs:[
      { id:"1", front:"veistos", back:"скульптура" },
      { id:"2", front:"rikos", back:"преступление" },
      { id:"3", front:"ostos", back:"покупка" },
      { id:"4", front:"käännös", back:"перевод" },
    ]},
  ],
  playlist: "a1-tyypit",
},

{
  id: "a1-sanatyyppi-us",
  title: "SANATYYPPI –US/YS",
  level: "A1",
  topic: "склонение/типы слов",
  cover: "/cards/st_us.png",
  summary: "vastaus / keskus / kysymys → основа: -UKSE-/-YKSE- (vastaukse-, keskukse-, kysymykse-).",
  contentHtml: `
    <p><b>-US/YS</b> → основа <b>-UKSE-/-YKSE-</b>: <i>vastaus → vastaukse-</i>, <i>keskus → keskukse-</i>, <i>kysymys → kysymykse-</i>.</p>
    <p>Частые слова: <i>ajatus</i> мысль, <i>keskus</i> центр, <i>kokemus</i> опыт, <i>rakennus</i> здание, <i>rukous</i> молитва, <i>vesiputous</i> водопад, <i>esitys</i> презентация/шоу, <i>kysymys</i> вопрос, <i>yllätys</i> сюрприз, <i>yritys</i> компания/попытка…</p>
  `,
  widgets: [
    { kind:"imageStrip", items:[{ src:"/cards/st_us.png", alt:"-US/YS taivutus" }]},

    /* мини-постер по vastaus */
    { kind:"flashcards", title:"Vastaus — формы", items:[
      { front:"(NOM) vastaus" }, { front:"(P) vastausta" }, { front:"(GEN) vastauksen" },
      { front:"(ILL) vastaukseen" }, { front:"(INE) vastauksessa" }, { front:"(ELA) vastauksesta" },
      { front:"(ALL) vastaukselle" }, { front:"(ADE) vastauksella" }, { front:"(ABL) vastaukselta" },
      { front:"(PL NOM) vastaukset" },
    ]},

    /* NOM → GEN (смешанные) */
    { kind:"matchPairs", title:"NOM → GEN (–US/–YS)", pairs:[
      { a:"keskus", b:"keskuksen" },
      { a:"rakennus", b:"rakennuksen" },
      { a:"ajatus", b:"ajatuksen" },
      { a:"kysymys", b:"kysymyksen" },
      { a:"esitys", b:"esityksen" },
      { a:"yritys", b:"yrityksen" },
    ]},

    /* выбор только нужного типа */
    { kind:"gridSelect", title:"Фильтр: только –US/YS", rule:"Формы с –ukse–/–ykse–", timed: 40, items:[
      { text:"keskukseen", good:true },{ text:"rakennuksessa", good:true },
      { text:"kysymyksestä", good:true },{ text:"esitykselle", good:true },
      { text:"kerrokseen", good:false },{ text:"juureksen", good:false },
    ]},

    /* сделай форму */
    { kind:"typeAnswer", title:"Напечатай форму", items:[
      { prompt:"(GEN) yritys →", answers:["yrityksen"] },
      { prompt:"(ILL) ajatus →", answers:["ajatukseen"] },
      { prompt:"(INE) keskus →", answers:["keskuksessa"] },
      { prompt:"(PL NOM) kysymys →", answers:["kysymykset"] },
    ]},

    /* мемори: слово ↔ перевод */
    { kind:"memory", title:"Мемори: слово ↔ перевод", pairs:[
      { id:"1", front:"kokemus", back:"опыт, практика" },
      { id:"2", front:"rakennus", back:"здание" },
      { id:"3", front:"vesiputous", back:"водопад" },
      { id:"4", front:"yllätys", back:"сюрприз" },
    ]},

    /* лишнее/ошибка */
    { kind:"oddOne", title:"Где ошибка формы?", groups:[
      { options:["vastaukseen","keskukseen","kysymykseen","kerrokseen"], correctIndex:3, hint:"одно — не –US/YS" },
      { options:["yrityksen","esityksen","rakennukssen","ajatuksen"], correctIndex:2, hint:"двойная s лишняя" },
    ]},

    /* мини-диалог */
    { kind:"dialog", title:"Kysymys & vastaus", steps:[
      { text:"A: Minulla on yksi kysymys.", options:[
        { text:"Kysy, mikä kysymys?", next:1, correct:true },
        { text:"Minulla on rakennus.", next:1 },
      ]},
      { text:"A: Tarvitsen vastauksen tänään.", options:[
        { text:"Saat vastauksen sähköpostilla.", next:"end", correct:true },
        { text:"Keskus on talossa.", next:"end" },
      ]},
    ]},
  ],
  playlist: "a1-tyypit",
}


];

/* ================== Прогресс ================== */
function useProgress() {
  const KEY = "maa_finn_lessons_progress";
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {}
  }, [done]);

  function toggle(id: string) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  function resetPlaylist(plId: string) {
    const ids = LESSONS.filter((l) => l.playlist === plId).map((l) => l.id);
    setDone((d) => {
      const nd = { ...d };
      ids.forEach((id) => delete nd[id]);
      return nd;
    });
  }

  return { done, toggle, resetPlaylist };
}

/* ================== Утилиты ================== */
const shuffleArr = <T,>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map((x) => x[1]);

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ================== Компоненты-виджеты ================== */
// A) MatchPairs — сопоставь левое и правое
function MatchPairs({ title, pairs }: Extract<WidgetSpec, { kind: "matchPairs" }>) {
  const left = useMemo(() => shuffleArr(pairs.map(p => p.a)), [pairs]);
  const right = useMemo(() => shuffleArr(pairs.map(p => p.b)), [pairs]);
  const map = useMemo(() => Object.fromEntries(pairs.map(p => [p.a, p.b])), [pairs]);
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, true>>({});
  const [status, setStatus] = useState<null | "ok" | "bad">(null);

  const allCount = pairs.length;
  const solved = Object.keys(done).length;

  function chooseLeft(a: string) { if (!done[a]) { setPickedLeft(a); setStatus(null); } }
  function chooseRight(b: string) {
    if (!pickedLeft) return;
    if (map[pickedLeft] === b) {
      setDone(d => ({ ...d, [pickedLeft]: true }));
      setPickedLeft(null);
      setStatus("ok");
    } else {
      setStatus("bad");
    }
  }
  function reset(){ setPickedLeft(null); setDone({}); setStatus(null); }

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            {left.map(a => (
              <button key={a} onClick={() => chooseLeft(a)}
                className={`w-full text-left px-3 py-2 rounded-xl border ${done[a] ? "opacity-40 pointer-events-none" : pickedLeft===a ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {right.map(b => (
              <button key={b} onClick={() => chooseRight(b)}
                className="w-full text-left px-3 py-2 rounded-xl border">{b}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          {status==="ok" && <span className="text-emerald-600">Верно!</span>}
          {status==="bad" && <span className="text-rose-600">Не та пара.</span>}
          <span className="ml-auto opacity-70">{solved}/{allCount}</span>
        </div>
      </div>
    </div>
  );
}

// B) TypeAnswer — введи правильную форму/слово
function TypeAnswer({ title, items }: Extract<WidgetSpec, { kind: "typeAnswer" }>) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [res, setRes] = useState<null | boolean>(null);
  const cur = items[i];
  const norm = (s:string)=>s.trim().toLowerCase().replace(/\s+/g," ");

  function check(){
    const ok = cur.answers.map(norm).includes(norm(val));
    setRes(ok);
  }
  function next(){ setI((x)=> (x+1)%items.length); setVal(""); setRes(null); }

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="font-semibold mb-2">{cur.prompt}</div>
        <input value={val} onChange={e=>setVal(e.target.value)} className="w-full px-3 py-2 rounded-xl border" placeholder="Пиши здесь…" />
        <div className="mt-3 flex gap-2">
          <button onClick={check} className="px-3 py-1.5 rounded-xl border">Проверить</button>
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Дальше</button>
          {res!==null && (
            <span className={`text-sm ${res ? "text-emerald-600":"text-rose-600"}`}>
              {res ? "Отлично!" : `Нужно: ${cur.answers[0]}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// C) OddOne — найди лишнее
function OddOne({ title, groups }: Extract<WidgetSpec, { kind: "oddOne" }>) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const g = groups[i];
  function reset(){ setPicked(null); }
  function next(){ setI((x)=> (x+1)%groups.length); reset(); }

  const correct = picked!==null && picked===g.correctIndex;

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="grid sm:grid-cols-2 gap-2">
          {g.options.map((op,idx)=>(
            <button key={idx} onClick={()=>setPicked(idx)}
              className={`px-3 py-2 rounded-xl border text-left ${picked===idx ? "bg-sky-50 dark:bg-sky-900/20":""}`}>
              {op}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Дальше</button>
          {picked!==null && (
            <span className={correct? "text-emerald-600":"text-rose-600"}>
              {correct ? "Верно!" : "Лишнее выбрано неверно."}{!correct && g.hint ? ` Подсказка: ${g.hint}` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// D) GridSelect — кликай только то, что подходит под правило
function GridSelect({ title, rule, items, target, timed }: Extract<WidgetSpec, { kind:"gridSelect" }>) {
  const all = useMemo(()=>shuffleArr(items), [items]);
  const need = target ?? all.filter(x=>x.good).length;
  const [picked, setPicked] = useState<Record<number,boolean>>({});
  const [seconds, setSeconds] = useState(timed ?? 0);
  const [done, setDone] = useState<null | boolean>(null);

  useEffect(()=>{
    if(!timed || seconds<=0 || done!==null) return;
    const t = setInterval(()=> setSeconds(s=>Math.max(0,s-1)), 1000);
    return ()=>clearInterval(t);
  }, [seconds, timed, done]);

  function pick(i:number){
    if(done!==null) return;
    setPicked(p => {
      const np = { ...p, [i]: !p[i] };
      const chosen = Object.values(np).filter(Boolean).length;
      if (chosen === need) {
        const ok = all.every((it,idx)=> (!!np[idx]) === !!it.good);
        setDone(ok);
      }
      return np;
    });
  }
  function reset(){
    setPicked({}); setDone(null); if(timed) setSeconds(timed);
  }

  useEffect(()=>{ if(timed) setSeconds(timed); }, [timed]);

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <div className="text-sm opacity-80 mb-2">Правило: <b>{rule}</b>{timed ? ` • Время: ${seconds}c`:""}</div>
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {all.map((it,idx)=>(
            <button key={idx} onClick={()=>pick(idx)}
              className={`px-3 py-2 rounded-xl border text-left ${picked[idx] ? "bg-sky-50 dark:bg-sky-900/20":""}`}>
              {it.text}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          {done!==null && (
            <span className={done? "text-emerald-600":"text-rose-600"}>
              {done ? "Идеально!" : "Есть лишние/нехватающие клики."}
            </span>
          )}
          <span className="ml-auto opacity-70">Выбери: {need}</span>
        </div>
      </div>
    </div>
  );
}

// E) Memory — «найди пару» (концентрация)
function Memory({ title, pairs }: Extract<WidgetSpec, { kind:"memory" }>) {
  type Card = { key:string; id:string; text:string };
  const deck: Card[] = useMemo(()=> shuffleArr(pairs.flatMap(p => [
    { key:p.id+"-a", id:p.id, text:p.front },
    { key:p.id+"-b", id:p.id, text:p.back },
  ])), [pairs]);

  const [open, setOpen] = useState<string[]>([]);
  const [solved, setSolved] = useState<Record<string, true>>({});

  function click(c: Card){
    if(open.includes(c.key) || Object.values(solved).length*2===deck.length) return;
    const next = [...open, c.key].slice(-2);
    setOpen(next);
    if(next.length===2){
      const [a,b] = next.map(k=> deck.find(x=>x.key===k)!);
      if(a.id===b.id && a.key!==b.key){
        setTimeout(()=>{
          setSolved(s => ({ ...s, [a.key]:true, [b.key]:true }));
          setOpen([]);
        }, 250);
      } else {
        setTimeout(()=> setOpen([]), 600);
      }
    }
  }
  function reset(){ setOpen([]); setSolved({}); }

  const won = Object.keys(solved).length === deck.length;

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {deck.map(c=>{
            const isOpen = open.includes(c.key) || solved[c.key];
            return (
              <button key={c.key} onClick={()=>click(c)}
                className={`px-3 py-6 rounded-xl border text-center ${isOpen ? "bg-white/90 dark:bg-slate-900/70":"bg-slate-50 dark:bg-slate-800/60"}`}>
                {isOpen ? c.text : "?"}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          {won && <span className="text-emerald-600">Супер! Все пары найдены.</span>}
        </div>
      </div>
    </div>
  );
}


// 1) Флеш-карточки
function Flashcards({ title, items }: Extract<WidgetSpec, { kind: "flashcards" }>) {
  const [i, setI] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const hasBack = !!items[i]?.back;

  const next = () => { setI((v) => (v + 1) % items.length); setShowBack(false); };
  const prev = () => { setI((v) => (v - 1 + items.length) % items.length); setShowBack(false); };
  const shuffle = () => {
    for (let j = items.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [items[j], items[k]] = [items[k], items[j]]; // ок, мы лишь перемешиваем локальный порядок
    }
    setI(0);
    setShowBack(false);
  };


  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <button
          onClick={() => hasBack && setShowBack((v) => !v)}
          className="w-full min-h-[100px] rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-6 text-xl font-bold bg-white/70 dark:bg-slate-900/60"
          aria-label={hasBack ? (showBack ? "Скрыть перевод" : "Показать перевод") : "Карточка"}
        >
          {hasBack && showBack ? (items[i].back as string) : items[i].front}
        </button>
        <div className="mt-3 flex gap-2">
          <button onClick={prev} className="px-3 py-1.5 rounded-xl border">Назад</button>
          {hasBack && (
            <button onClick={() => setShowBack((v) => !v)} className="px-3 py-1.5 rounded-xl border">
              {showBack ? "Скрыть перевод" : "Показать перевод"}
            </button>
          )}
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Вперёд</button>
          <button onClick={shuffle} className="ml-auto px-3 py-1.5 rounded-xl border">Перемешать</button>
        </div>
      </div>
    </div>
  );
}


// 2) Упорядочивание
function OrderGame({ title, sequence }: Extract<WidgetSpec, { kind: "order" }>) {
  const [pool, setPool] = useState(() => shuffleArr(sequence));
  const [answer, setAnswer] = useState<string[]>([]);
  const done = answer.length === sequence.length;
  const correct = done && answer.every((x, i) => x === sequence[i]);

  const pick = (w: string) => {
    setAnswer((a) => [...a, w]);
    setPool((p) => p.filter((x) => x !== w));
  };
  const reset = () => { setPool(shuffleArr(sequence)); setAnswer([]); };

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50 space-y-3">
        <div className="flex flex-wrap gap-2">
          {pool.map((w) => (
            <button key={w} onClick={() => pick(w)} className="px-3 py-1.5 rounded-xl border">{w}</button>
          ))}
        </div>
        <div className="min-h-[48px] rounded-xl border border-dashed px-3 py-2 flex flex-wrap gap-2 items-center">
          {answer.map((w, idx) => (
            <span key={idx} className="px-3 py-1.5 rounded-xl border bg-white/80 dark:bg-slate-900/60">{w}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reset} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          {done && (
            <span className={`inline-flex items-center gap-1 text-sm ${correct ? "text-emerald-600" : "text-rose-600"}`}>
              <Check className="w-4 h-4" /> {correct ? "Верно!" : "Есть ошибка — попробуй ещё."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// 3) Рандом-промпты
function RandomPrompt({ title, prompts }: Extract<WidgetSpec, { kind: "randomPrompt" }>) {
  const [i, setI] = useState(randInt(0, prompts.length - 1));
  const next = () => setI(randInt(0, prompts.length - 1));
  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="text-lg font-semibold">{prompts[i]}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Другое</button>
        </div>
      </div>
    </div>
  );
}

// 4) Таймер
function TimerWidget({ title, durations = [60] }: Extract<WidgetSpec, { kind: "timer" }>) {
  const [seconds, setSeconds] = useState(durations[0]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="text-3xl font-extrabold tabular-nums">{String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setRunning((v) => !v)} className="px-3 py-1.5 rounded-xl border">{running ? "Пауза" : "Старт"}</button>
          <button onClick={() => setRunning(false)} className="px-3 py-1.5 rounded-xl border">Стоп</button>
          <button onClick={() => setSeconds(durations[0])} className="px-3 py-1.5 rounded-xl border">Сброс</button>
          {durations.map((d) => (
            <button key={d} onClick={() => { setSeconds(d); setRunning(false); }} className="px-3 py-1.5 rounded-xl border">{d}s</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5) Квиз по гармонии гласных
function hasFront(word: string) { return /[äöy]/i.test(word); }
function hasBack(word: string) { return /[aou]/i.test(word); }
function correctSuffix(word: string, kind: "ssa" | "lla") {
  const base = kind === "ssa" ? ["ssa", "ssä"] : ["lla", "llä"];
  if (hasFront(word)) return base[1];
  if (hasBack(word)) return base[0];
  return base[1]; // только e/i → фронт
}
function VowelSuffixQuiz({ title, words, suffix }: Extract<WidgetSpec, { kind: "vowelSuffix" }>) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const word = words[i];
  const correct = correctSuffix(word, suffix);

  const next = () => { setI((v) => (v + 1) % words.length); setAnswer(null); };

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="text-lg font-semibold mb-2">{word}__</div>
        <div className="flex gap-2">
          {(suffix === "ssa" ? ["ssa", "ssä"] : ["lla", "llä"]).map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswer(opt)}
              className={`px-3 py-1.5 rounded-xl border ${answer === opt ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {answer && (
          <div className="mt-2 text-sm">
            {answer === correct ? (
              <span className="text-emerald-600 inline-flex items-center gap-1"><Check className="w-4 h-4" /> Правильно: {word}{correct}</span>
            ) : (
              <span className="text-rose-600">Нужно: <b>{word}{correct}</b></span>
            )}
          </div>
        )}
        <div className="mt-3">
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Дальше</button>
        </div>
      </div>
    </div>
  );
}

// 6) Генератор цен
function priceToWords(n: number) {
  // без строгой проверки правописания — выводим шаблон для самопроверки
  const euros = Math.floor(n);
  const cents = Math.round((n - euros) * 100);
  return `${euros} euroa ${cents.toString().padStart(2, "0")} senttiä`;
}
function PriceReader({ title, min = 0.2, max = 300 }: Extract<WidgetSpec, { kind: "priceReader" }>) {
  const [value, setValue] = useState(() => Number((Math.random() * (max - min) + min).toFixed(2)));
  const [show, setShow] = useState(false);
  const next = () => { setValue(Number((Math.random() * (max - min) + min).toFixed(2))); setShow(false); };

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="text-2xl font-extrabold">{value.toFixed(2)} €</div>
        <div className="mt-2 text-sm opacity-70">Прочитай вслух, затем открой ответ.</div>
        {show && <div className="mt-2 text-lg">Ответ: <b>{priceToWords(value)}</b></div>}
        <div className="mt-3 flex gap-2">
          <button onClick={() => setShow((v) => !v)} className="px-3 py-1.5 rounded-xl border">{show ? "Скрыть" : "Показать ответ"}</button>
          <button onClick={next} className="px-3 py-1.5 rounded-xl border">Новая цена</button>
        </div>
      </div>
    </div>
  );
}

// 7) Мини-диалог с выбором
function DialogWidget({ title, steps }: Extract<WidgetSpec, { kind: "dialog" }>) {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const choose = (o: DialogStep["options"][number]) => {
    if (o.next === "end") { setIdx(0); return; }
    setIdx(o.next);
  };
  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50 space-y-3">
        <div className="text-lg font-semibold">{step.text}</div>
        <div className="flex flex-col gap-2">
          {step.options.map((o, i) => (
            <button
              key={i}
              onClick={() => choose(o)}
              className={`px-3 py-2 rounded-xl border text-left ${o.correct ? "hover:border-emerald-400" : ""}`}
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 8) Покупка по бюджету
function BudgetWidget({ title, items, budget }: Extract<WidgetSpec, { kind: "budget" }>) {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const total = items.reduce((s, it) => s + (picked[it.name] ? it.price : 0), 0);
  const left = budget - total;

  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50">
        <div className="mb-2 text-sm opacity-80">Бюджет: <b>{budget.toFixed(2)} €</b></div>
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((it) => (
            <label key={it.name} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border cursor-pointer ${picked[it.name] ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}>
              <span className="font-medium">{it.name}</span>
              <span className="opacity-70">{it.price.toFixed(2)} €</span>
              <input
                type="checkbox"
                checked={!!picked[it.name]}
                onChange={() => setPicked((p) => ({ ...p, [it.name]: !p[it.name] }))}
                className="accent-sky-600"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm">
          Итого: <b>{total.toFixed(2)} €</b> • Осталось: <b className={left < 0 ? "text-rose-600" : ""}>{left.toFixed(2)} €</b>
          {left < 0 && <span className="ml-2 text-rose-600">Слишком дорого — убери что-то.</span>}
        </div>
      </div>
    </div>
  );
}

/* ================== Карточка урока ================== */
function LessonCard({
  lesson, checked, onToggle, onOpen,
}: { lesson: Lesson; checked: boolean; onToggle: () => void; onOpen: () => void; }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition flex flex-col">
      {lesson.cover && (
        <Image src={lesson.cover} alt={lesson.title} width={900} height={520} className="w-full h-auto object-cover rounded-t-3xl" />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">{lesson.topic}</span>
          <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">{lesson.level}</span>
        </div>
        <h3 className="mt-2 text-lg font-bold">{lesson.title}</h3>
        {lesson.summary && <p className="text-sm text-slate-600 dark:text-slate-300">{lesson.summary}</p>}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={checked} onChange={onToggle} className="accent-emerald-600" /> Завершено
          </label>
          <button onClick={onOpen} className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition">Открыть</button>
        </div>
      </div>
    </div>
  );
}

/* ================== Просмотр урока ================== */
function LessonViewer({
  lesson, onClose, onPrev, onNext, onToggleDone, isDone,
}: {
  lesson: Lesson; onClose: () => void; onPrev: () => void; onNext: () => void; onToggleDone: () => void; isDone: boolean;
}) {
  // хоткеи внутри Viewer
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as any)?.isContentEditable;
      if (typing) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      if (e.key === " ") { e.preventDefault(); onToggleDone(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext, onToggleDone]);

    // локальная «главная» картинка
  const [heroSrc, setHeroSrc] = useState<string | null>(lesson.cover ?? null);
  useEffect(() => {
    setHeroSrc(lesson.cover ?? null);
  }, [lesson.id, lesson.cover]);


  // рендер виджетов
  const renderWidget = (w: WidgetSpec, i: number) => {
    switch (w.kind) {
      case "flashcards":   return <Flashcards key={i} {...w} />;
      case "order":        return <OrderGame key={i} {...w} />;
      case "randomPrompt": return <RandomPrompt key={i} {...w} />;
      case "timer":        return <TimerWidget key={i} {...w} />;
      case "vowelSuffix":  return <VowelSuffixQuiz key={i} {...w} />;
      case "priceReader":  return <PriceReader key={i} {...w} />;
      case "dialog":       return <DialogWidget key={i} {...w} />;
      case "budget":       return <BudgetWidget key={i} {...w} />;
      case "matchPairs":   return <MatchPairs key={i} {...w} />;
      case "typeAnswer":   return <TypeAnswer key={i} {...w} />;
      case "oddOne":       return <OddOne key={i} {...w} />;
      case "gridSelect":   return <GridSelect key={i} {...w} />;
      case "memory":       return <Memory key={i} {...w} />;

      // ➜ добавить это:
      case "imageStrip":
  return <ImageStrip key={i} {...w} onPick={setHeroSrc} activeSrc={heroSrc ?? undefined} />;


      default:             return null;
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">← К списку</button>
          <span className="text-sm opacity-70">{lesson.level} • {lesson.topic}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <kbd className="px-1.5 py-0.5 rounded-md border">Esc</kbd> закрыть
          <span className="opacity-40">•</span>
          <kbd className="px-1.5 py-0.5 rounded-md border">←/→</kbd> навигация
          <span className="opacity-40">•</span>
          <kbd className="px-1.5 py-0.5 rounded-md border">Space</kbd> готово
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-4 md:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight">{lesson.title}</h2>
        {lesson.summary && <p className="mt-2 text-slate-600 dark:text-slate-300">{lesson.summary}</p>}

        {/* Обложка */}
        <div className="mt-4">
          {(heroSrc || lesson.cover) && (
            <Image
              src={heroSrc || (lesson.cover as string)}
              alt={lesson.title}
              width={1200}
              height={675}
              className="w-full h-auto object-cover rounded-2xl"
            />
          )}
        </div>

        {/* Вводная */}
        {lesson.contentHtml && (
          <div
            className="mt-6 text-slate-800 dark:text-slate-100 space-y-4 leading-relaxed [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
          />
        )}

        {/* Игры */}
        {lesson.widgets?.length ? (() => {
          const visuals = lesson.widgets.filter(w => w.kind === "imageStrip");
          const games   = lesson.widgets.filter(w => w.kind !== "imageStrip");
          return (
            <div className="mt-6">
              {/* сначала показываем три картинки (или сколько есть) */}
              {visuals.map((w, i) => renderWidget(w, i))}

              {/* затем — заголовок и остальные интерактивы */}
              {games.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-2 mt-4">Игры</h3>
                  {games.map((w, i) => renderWidget(w, visuals.length + i))}
                </>
              )}
            </div>
          );
        })() : null}


        <div className="mt-6 flex items-center justify-between">
          <button onClick={onPrev} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40">
            <ChevronLeft className="w-4 h-4" /> Предыдущий
          </button>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={isDone} onChange={onToggleDone} className="accent-emerald-600" />
            Отметить как завершён
          </label>
          <button onClick={onNext} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700">
            Следующий <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageStrip({
  title,
  items,
  onPick,
  activeSrc,
}: Extract<WidgetSpec, { kind: "imageStrip" }> & {
  onPick?: (src: string) => void;
  activeSrc?: string;
}) {
  return (
    <div className="mt-4">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((it, i) => {
          const isActive = activeSrc === it.src;
          return (
            <figure
              key={i}
              className={`rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 ${
                isActive ? "ring-2 ring-sky-500" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onPick?.(it.src)}
                className="block w-full focus:outline-none"
                title="Сделать главной"
                aria-label="Сделать главной"
              >
                <Image
                  src={it.src}
                  alt={it.alt || it.caption || `image ${i + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover cursor-pointer"
                />
              </button>
              {it.caption && (
                <figcaption className="px-2 py-1 text-center text-sm opacity-80">
                  {it.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}


/* ================== Страница ================== */
function PageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // URL state
  const initialQ = (params.get("q") ?? "").trim();
  const initialLevel = (params.get("level") ?? "").trim();
  const initialPlaylist = (params.get("playlist") ?? "").trim();
  const initialSort = (params.get("sort") ?? "relevance").trim() as "relevance" | "alpha" | "shuffle";
  const initialLessonId = (params.get("lesson") ?? "").trim();

  // UI state
  const [q, setQ] = useState(initialQ);
  const [level, setLevel] = useState<string>(initialLevel);
  const [playlist, setPlaylist] = useState<string>(initialPlaylist);
  const [sort, setSort] = useState<"relevance" | "alpha" | "shuffle">(initialSort);
  const [onlyUndone, setOnlyUndone] = useState(false);
  const [active, setActive] = useState<Lesson | null>(null);

  const { done, toggle, resetPlaylist } = useProgress();

  // автосохранение UI
  useEffect(() => {
    try {
      const ui = JSON.parse(localStorage.getItem("maa_finn_lessons_ui") || "{}");
      if (ui.q) setQ(ui.q);
      if (ui.level) setLevel(ui.level);
      if (ui.playlist) setPlaylist(ui.playlist);
      if (ui.sort) setSort(ui.sort);
      if (ui.onlyUndone) setOnlyUndone(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("maa_finn_lessons_ui", JSON.stringify({ q, level, playlist, sort, onlyUndone, lastLessonId: active?.id }));
  }, [q, level, playlist, sort, onlyUndone, active?.id]);

  // URL ← state (debounce)
  const dRef = useRef<any>(null);
  useEffect(() => {
    if (dRef.current) clearTimeout(dRef.current);
    dRef.current = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (level) p.set("level", level);
      if (playlist) p.set("playlist", playlist);
      if (sort !== "relevance") p.set("sort", sort);
      if (active?.id) p.set("lesson", active.id);
      router.replace(`${pathname}?${p.toString()}`);
    }, 250);
    return () => clearTimeout(dRef.current);
  }, [q, level, playlist, sort, active?.id, pathname, router]);

  // open by ?lesson
  useEffect(() => {
    const lid = (params.get("lesson") ?? "").trim();
    if (lid) {
      const found = LESSONS.find((l) => l.id === lid);
      if (found) setActive(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const levels = useMemo(() => Array.from(new Set(LESSONS.map((l) => l.level))).sort(), []);

  // фильтрация
  const filteredBase = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = LESSONS.filter((l) => {
      const hitQ = !t || l.title.toLowerCase().includes(t) || (l.summary ?? "").toLowerCase().includes(t) || l.topic.toLowerCase().includes(t);
      const hitL = !level || l.level === level;
      const hitP = !playlist || l.playlist === playlist;
      return hitQ && hitL && hitP;
    });
    if (onlyUndone) list = list.filter((l) => !done[l.id]);
    if (sort === "alpha") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "shuffle") list = shuffleArr(list);
    return list;
  }, [q, level, playlist, onlyUndone, sort, done]);

  // сгруппировано по плейлистам
  const grouped = useMemo(() => {
    const byPl = new Map<string, Lesson[]>();
    for (const l of filteredBase) {
      if (!byPl.has(l.playlist)) byPl.set(l.playlist, []);
      byPl.get(l.playlist)!.push(l);
    }
    return byPl;
  }, [filteredBase]);

  // «продолжить»
  const nextInPlaylist = useCallback((plId: string) => {
    const list = filteredBase.filter((l) => l.playlist === plId);
    const next = list.find((l) => !done[l.id]) || list[0];
    return next || null;
  }, [filteredBase, done]);

  // хоткеи общей страницы
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as any)?.isContentEditable;
      if (!typing && (e.key === "/" || e.key.toLowerCase() === "s")) { e.preventDefault(); searchRef.current?.focus(); }
      if (!typing && e.key.toLowerCase() === "r") { e.preventDefault(); setSort("shuffle"); }
      if (!typing && e.key.toLowerCase() === "f") { e.preventDefault(); setOnlyUndone((v) => !v); }
      if (!typing && e.key === "Enter" && !active) { const first = filteredBase[0]; if (first) setActive(first); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredBase, active]);

  // навигация в Viewer
  const flatOrder = filteredBase;
  const goPrev = () => {
    if (!active) return;
    const idx = flatOrder.findIndex((l) => l.id === active.id);
    const prev = flatOrder[(idx - 1 + flatOrder.length) % flatOrder.length];
    if (prev) setActive(prev);
  };
  const goNext = () => {
    if (!active) return;
    const idx = flatOrder.findIndex((l) => l.id === active.id);
    const next = flatOrder[(idx + 1) % flatOrder.length];
    if (next) setActive(next);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
        <div className="lessons-filters flex flex-wrap items-stretch gap-2">
          {/* Поиск */}
          <label className="relative flex-1 min-w-0 basis-full sm:basis-[420px]">
            <input
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-500"
              placeholder="Поиск: дни недели, числа, страны…  (нажми «/»)"
              aria-label="Поиск по урокам"
            />
            {/* Иконка лупы */}
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" /* ... */ />
          </label>

          {/* Фильтр по уровню */}
          <select
            className="flex-1 min-w-0 basis-[48%] sm:basis-auto w-full sm:w-auto rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 h-10 px-4"
            aria-label="Фильтр по уровню"
          >
            {/* options */}
          </select>

          {/* Фильтр по плейлисту */}
          <select
            className="flex-1 min-w-0 basis-[48%] sm:basis-auto w-full sm:w-auto rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 h-10 px-4"
            aria-label="Фильтр по плейлисту"
          >
            {/* options */}
          </select>
  </div>
</section>


      {/* Плейлисты + прогресс */}
      <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {Array.from(grouped.entries()).map(([plId, list]) => {
          const meta = PLAYLISTS.find((p) => p.id === plId);
          if (!list.length) return null;
          const total = list.length;
          const doneCount = list.filter((l) => !!done[l.id]).length;
          const next = nextInPlaylist(plId);

          return (
            <div key={plId}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{meta?.title || plId} <span className="text-slate-500 text-sm">• {meta?.level}</span></h3>
                  {meta?.description && (<p className="text-sm text-slate-600 dark:text-slate-300">{meta.description}</p>)}
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${Math.round((doneCount / total) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-sm flex items-center gap-3">
                  <span className="opacity-70">{doneCount}/{total}</span>
                  {next && (
                    <button onClick={() => setActive(next)} className="px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700" title="Продолжить плейлист">
                      Продолжить <ArrowRight className="inline w-4 h-4 ml-1" />
                    </button>
                  )}
                  <button onClick={() => resetPlaylist(plId)} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700" title="Сбросить прогресс плейлиста">
                    Сбросить
                  </button>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
                {list.map((l) => (
                  <LessonCard
                    key={l.id}
                    lesson={l}
                    checked={!!done[l.id]}
                    onToggle={() => toggle(l.id)}
                    onOpen={() => setActive(l)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {grouped.size === 0 && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-6 text-slate-600 dark:text-slate-300">
            Ничего не найдено. Попробуй сменить уровень, плейлист или запрос.
          </div>
        )}
      </section>

      {/* Просмотр урока (модалка) */}
      {active && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="absolute inset-0 overflow-y-auto">
            <section className="max-w-6xl mx-auto px-4 py-8">
              <div className="w-full max-w-3xl mx-auto rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
                  <button onClick={() => setActive(null)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40">
                    <X className="w-4 h-4" /> Закрыть
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => active && toggle(active.id)}
                      className={`px-3 py-1.5 rounded-xl border text-sm inline-flex items-center gap-2 ${
                        active && done[active.id]
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <ListChecks className="w-4 h-4" />
                      {active && done[active.id] ? "Завершено" : "Отметить"}
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                      <button onClick={() => {
                        const idx = filteredBase.findIndex((l) => l.id === active?.id);
                        const prev = filteredBase[(idx - 1 + filteredBase.length) % filteredBase.length];
                        if (prev) setActive(prev);
                      }} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40" title="Предыдущий (←)">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                        const idx = filteredBase.findIndex((l) => l.id === active?.id);
                        const next = filteredBase[(idx + 1) % filteredBase.length];
                        if (next) setActive(next);
                      }} className="px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700" title="Следующий (→)">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <LessonViewer
                    lesson={active}
                    onClose={() => setActive(null)}
                    onPrev={() => {
                      const idx = filteredBase.findIndex((l) => l.id === active?.id);
                      const prev = filteredBase[(idx - 1 + filteredBase.length) % filteredBase.length];
                      if (prev) setActive(prev);
                    }}
                    onNext={() => {
                      const idx = filteredBase.findIndex((l) => l.id === active?.id);
                      const next = filteredBase[(idx + 1) % filteredBase.length];
                      if (next) setActive(next);
                    }}
                    onToggleDone={() => active && toggle(active.id)}
                    isDone={!!(active && done[active.id])}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Загрузка…</div>}>
      <PageInner />
    </Suspense>
  );
}
