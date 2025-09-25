"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Volume2, X, Shuffle, Filter, ArrowRight, Star, Copy, Check, ImageIcon, MessageSquareText,
} from "lucide-react";

/** Тип данных для слов */
type VocabEntry = {
  id: number;
  fi: string;
  ru: string;
  en?: string;
  pos?: "n" | "v" | "adj" | "adv" | "pron" | "num" | "prep" | "part";
  topic: string;
  image?: string;
  examples?: { fi: string; ru?: string }[];
  forms?: string[];
};
const QUIZ_HISTORY_KEY = "quiz_history";

/** ВСЕ 30 карточек */
const VOCAB: VocabEntry[] = [
  // ---------- Партия 1 (10) ----------
  {
    id: 1001,
    fi: "asua",
    ru: "жить",
    en: "to live",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vasua.png",
    examples: [
      { fi: "Minä asun Helsingissä.", ru: "Я живу в Хельсинки." },
      { fi: "Missä sinä asut?", ru: "Где ты живёшь?" },
    ],
    forms: ["asun", "asut", "asuu", "asumme", "asutte", "asuvat"],
  },
  {
    id: 1002,
    fi: "maksaa",
    ru: "платить; стоить",
    en: "to pay; to cost",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vmaksaa.png",
    examples: [
      { fi: "Kuinka paljon se maksaa?", ru: "Сколько это стоит?" },
      { fi: "Maksoin kahvista.", ru: "Я заплатил за кофе." },
    ],
    forms: ["maksan", "maksat", "maksaa", "maksamme", "maksatte", "maksavat"],
  },
  {
    id: 1003,
    fi: "etsiä",
    ru: "искать",
    en: "to search",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vetsia.png",
    examples: [
      { fi: "Etsin avaimia.", ru: "Я ищу ключи." },
      { fi: "Etsitkö töitä?", ru: "Ты ищешь работу?" },
    ],
    forms: ["etsin", "etsit", "etsii", "etsimme", "etsitte", "etsivät"],
  },
  {
    id: 1004,
    fi: "säästää",
    ru: "экономить; копить",
    en: "to save",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vsaastaa.png",
    examples: [{ fi: "Säästän rahaa lomaa varten.", ru: "Коплю деньги на отпуск." }],
    forms: ["säästän", "säästät", "säästää", "säästämme", "säästätte", "säästävät"],
  },
  {
    id: 1005,
    fi: "nauraa",
    ru: "смеяться",
    en: "to laugh",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vnauraa.png",
    examples: [{ fi: "He nauravat paljon.", ru: "Они много смеются." }],
    forms: ["nauran", "naurat", "nauraa", "nauramme", "nauratte", "nauravat"],
  },
  {
    id: 1006,
    fi: "kirjoittaa",
    ru: "писать",
    en: "to write",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vkirjoittaa.png",
    examples: [{ fi: "Kirjoitan sähköpostia.", ru: "Пишу письмо." }],
    forms: ["kirjoitan", "kirjoitat", "kirjoittaa", "kirjoitamme", "kirjoitatte", "kirjoittavat"],
  },
  {
    id: 1007,
    fi: "antaa",
    ru: "давать",
    en: "to give",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vantaa.png",
    examples: [{ fi: "Voitko antaa minulle kynän?", ru: "Можешь дать мне ручку?" }],
    forms: ["annan", "annat", "antaa", "annamme", "annatte", "antavat"],
  },
  {
    id: 1008,
    fi: "kääntää",
    ru: "переводить; поворачивать",
    en: "to translate; to turn",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vkaantaa.png",
    examples: [{ fi: "Käännän tekstin venäjäksi.", ru: "Перевожу текст на русский." }],
    forms: ["käännän", "käännät", "kääntää", "käännämme", "käännätte", "kääntävät"],
  },
  {
    id: 1009,
    fi: "lentää",
    ru: "летать",
    en: "to fly",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vlentaa.png",
    examples: [{ fi: "Lennän huomenna Tallinnaan.", ru: "Завтра лечу в Таллин." }],
    forms: ["lennän", "lennät", "lentää", "lennämme", "lennätte", "lentävät"],
  },
  {
    id: 1010,
    fi: "lukea",
    ru: "читать",
    en: "to read",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vlukea.png",
    examples: [{ fi: "Luen kirjaa.", ru: "Читаю книгу." }],
    forms: ["luen", "luet", "lukee", "luemme", "luette", "lukevat"],
  },

  // ---------- Партия 2 (10) ----------
  {
    id: 1011,
    fi: "onkia",
    ru: "удить; ловить рыбу",
    en: "to fish",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vonkia.png",
    examples: [{ fi: "Hän onkii järvellä.", ru: "Он/она рыбачит на озере." }],
    forms: ["ongin", "ongit", "onkii", "ongimme", "ongitte", "onkivat"],
  },
  {
    id: 1012,
    fi: "ottaa",
    ru: "брать",
    en: "to take",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vottaa.png",
    examples: [{ fi: "Otan kahvia.", ru: "Возьму кофе." }],
    forms: ["otan", "otat", "ottaa", "otamme", "otatte", "ottavat"],
  },
  {
    id: 1013,
    fi: "pukea",
    ru: "одевать(ся)",
    en: "to dress",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vpukea.png",
    examples: [{ fi: "Puen takin.", ru: "Я надеваю куртку." }],
    forms: ["puen", "puet", "pukee", "puemme", "puette", "pukevat"],
  },
  {
    id: 1014,
    fi: "tietää",
    ru: "знать",
    en: "to know",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vtietaa.png",
    examples: [{ fi: "Tiedän vastauksen.", ru: "Я знаю ответ." }],
    forms: ["tiedän", "tiedät", "tietää", "tiedämme", "tiedätte", "tietävät"],
  },
  {
    id: 1015,
    fi: "ymmärtää",
    ru: "понимать",
    en: "to understand",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vymmartaa.png",
    examples: [{ fi: "Ymmärrän sinua.", ru: "Я тебя понимаю." }],
    forms: ["ymmärrän", "ymmärrät", "ymmärtää", "ymmärrämme", "ymmärrätte", "ymmärtävät"],
  },
  {
    id: 1016,
    fi: "leipoa",
    ru: "печь (выпечку)",
    en: "to bake",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vleipoa.png",
    examples: [{ fi: "Leivon pullaa.", ru: "Пеку булочки." }],
    forms: ["leivon", "leivot", "leipoo", "leivomme", "leivotte", "leipovat"],
  },
  {
    id: 1017,
    fi: "pitää",
    ru: "держать; любить (нравиться)",
    en: "to hold; to like",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vpitaa.png",
    examples: [{ fi: "Pidän kahvista.", ru: "Мне нравится кофе." }],
    forms: ["pidän", "pidät", "pitää", "pidämme", "pidätte", "pitävät"],
  },
  {
    id: 1018,
    fi: "puhua",
    ru: "говорить",
    en: "to speak",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vpuhua.png",
    examples: [{ fi: "Puhun suomea.", ru: "Я говорю по-фински." }],
    forms: ["puhun", "puhut", "puhuu", "puhumme", "puhutte", "puhuvat"],
  },
  {
    id: 1019,
    fi: "opiskella",
    ru: "изучать; учиться",
    en: "to study",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vopiskella.png",
    examples: [{ fi: "Opiskelen yliopistossa.", ru: "Учусь в университете." }],
    forms: ["opiskelen", "opiskelet", "opiskelee", "opiskelemme", "opiskelette", "opiskelevat"],
  },
  {
    id: 1020,
    fi: "keskustella",
    ru: "обсуждать; беседовать",
    en: "to discuss",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vkeskustella.png",
    examples: [{ fi: "Keskustelemme suunnitelmista.", ru: "Мы обсуждаем планы." }],
    forms: ["keskustelen", "keskustelet", "keskustelee", "keskustelemme", "keskustelette", "keskustelevat"],
  },

  // ---------- Партия 3 (10) ----------
  {
    id: 1021,
    fi: "nukkua",
    ru: "спать",
    en: "to sleep",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vnukkua.png",
    examples: [{ fi: "Nukun hyvin.", ru: "Я хорошо сплю." }],
    forms: ["nukun", "nukut", "nukkuu", "nukumme", "nukutte", "nukkuvat"],
  },
  {
    id: 1022,
    fi: "herätä",
    ru: "просыпаться",
    en: "to wake up",
    pos: "v",
    topic: "глаголы тип 4",
    image: "/cards/vherata.png",
    examples: [{ fi: "Herään aikaisin.", ru: "Я просыпаюсь рано." }],
    forms: ["herään", "heräät", "herää", "heräämme", "heräätte", "heräävät"],
  },
  {
    id: 1023,
    fi: "nousta",
    ru: "вставать; подниматься",
    en: "to get up; to rise",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vnousta.png",
    examples: [{ fi: "Nousen kello seitsemän.", ru: "Встаю в семь." }],
    forms: ["nousen", "nouset", "nousee", "nousemme", "nousette", "nousevat"],
  },
  {
    id: 1024,
    fi: "syödä",
    ru: "есть",
    en: "to eat",
    pos: "v",
    topic: "глаголы тип 2",
    image: "/cards/vsyoda.png",
    examples: [{ fi: "Syön aamupalaa.", ru: "Я ем завтрак." }],
    forms: ["syön", "syöt", "syö", "syömme", "syötte", "syövät"],
  },
  {
    id: 1025,
    fi: "juoda",
    ru: "пить",
    en: "to drink",
    pos: "v",
    topic: "глаголы тип 2",
    image: "/cards/vjuoda.png",
    examples: [{ fi: "Juon vettä.", ru: "Пью воду." }],
    forms: ["juon", "juot", "juo", "juomme", "juotte", "juovat"],
  },
  {
    id: 1026,
    fi: "tilata",
    ru: "заказывать",
    en: "to order",
    pos: "v",
    topic: "глаголы тип 4",
    image: "/cards/vtilata.png",
    examples: [{ fi: "Tilaamme pizzan.", ru: "Мы закажем пиццу." }],
    forms: ["tilaan", "tilaat", "tilaa", "tilaamme", "tilaatte", "tilaavat"],
  },
  {
    id: 1027,
    fi: "istua",
    ru: "сидеть",
    en: "to sit",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vistua.png",
    examples: [{ fi: "Istun ikkunan vieressä.", ru: "Сижу у окна." }],
    forms: ["istun", "istut", "istuu", "istumme", "istutte", "istuvat"],
  },
  {
    id: 1028,
    fi: "katsoa",
    ru: "смотреть",
    en: "to watch; to look",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vkatsoa.png",
    examples: [{ fi: "Katsomme elokuvaa.", ru: "Мы смотрим фильм." }],
    forms: ["katson", "katsot", "katsoo", "katsomme", "katsotte", "katsovat"],
  },
  {
    id: 1029,
    fi: "matkustaa",
    ru: "путешествовать",
    en: "to travel",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vmatkustaa.png",
    examples: [{ fi: "Matkustan paljon.", ru: "Я много путешествую." }],
    forms: ["matkustan", "matkustat", "matkustaa", "matkustamme", "matkustatte", "matkustavat"],
  },
  {
    id: 1030,
    fi: "rakastaa",
    ru: "любить",
    en: "to love",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vrakastaa.png",
    examples: [{ fi: "Rakastan sinua.", ru: "Я люблю тебя." }],
    forms: ["rakastan", "rakastat", "rakastaa", "rakastamme", "rakastatte", "rakastavat"],
  },
  {
    id: 1031,
    fi: "hymyillä",
    ru: "улыбаться",
    en: "to smile",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vhymyilla.png",
    examples: [
      { fi: "Hymyilen sinulle.", ru: "Я улыбаюсь тебе." },
      { fi: "Lapsi hymyilee.", ru: "Ребёнок улыбается." }
    ],
    forms: ["hymyilen", "hymyilet", "hymyilee", "hymyilemme", "hymyilette", "hymyilevät"],
  },
  {
    id: 1032,
    fi: "mennä",
    ru: "идти; ехать",
    en: "to go",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vmenna.png",
    examples: [
      { fi: "Menen töihin.", ru: "Я иду на работу." },
      { fi: "Mihin sinä menet?", ru: "Куда ты идёшь?" }
    ],
    forms: ["menen", "menet", "menee", "menemme", "menette", "menevät"],
  },
  {
    id: 1033,
    fi: "kävellä",
    ru: "гулять; ходить пешком",
    en: "to walk",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vkavella.png",
    examples: [
      { fi: "Kävelen puistossa.", ru: "Я гуляю в парке." }
    ],
    forms: ["kävelen", "kävelet", "kävelee", "kävelemme", "kävelette", "kävelevät"],
  },
  {
    id: 1034,
    fi: "seisoa",
    ru: "стоять",
    en: "to stand",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vseisoa.png",
    examples: [
      { fi: "Hän seisoo jonossa.", ru: "Он стоит в очереди." }
    ],
    forms: ["seison", "seisot", "seisoo", "seisomme", "seisotte", "seisovat"],
  },
  {
    id: 1035,
    fi: "pidetä",
    ru: "удлиняться; становиться длиннее",
    en: "to get longer",
    pos: "v",
    topic: "глаголы тип 6",
    image: "/cards/vpideta.png",
    examples: [
      { fi: "Päivä pitenee keväällä.", ru: "Весной день становится длиннее." }
    ],
    forms: ["pitenen", "pitenet", "pitenee", "pitenemme", "pitenette", "pitenevät"],
  },
  {
    id: 1036,
    fi: "ajatella",
    ru: "думать",
    en: "to think",
    pos: "v",
    topic: "глаголы тип 3",
    image: "/cards/vajatella.png",
    examples: [
      { fi: "Ajattelen sinua.", ru: "Я думаю о тебе." }
    ],
    forms: ["ajattelen", "ajattelet", "ajattelee", "ajattelemme", "ajattelette", "ajattelevat"],
  },
  {
    id: 1037,
    fi: "uskoa",
    ru: "верить",
    en: "to believe",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vuskoa.png",
    examples: [
      { fi: "Uskon sinua.", ru: "Я верю тебе." }
    ],
    forms: ["uskon", "uskot", "uskoo", "uskomme", "uskotte", "uskovat"],
  },
  {
    id: 1038,
    fi: "tutkia",
    ru: "исследовать; изучать",
    en: "to examine; to research",
    pos: "v",
    topic: "глаголы тип 1",
    image: "/cards/vtutkia.png",
    examples: [
      { fi: "Tutkin aihetta tarkasti.", ru: "Я тщательно изучаю тему." }
    ],
    forms: ["tutkin", "tutkit", "tutkii", "tutkimme", "tutkitte", "tutkivat"],
  },
  /* ==== Плакаты / инфокарточки ==== */

  {
    id: 1039,
    fi: "viikonpäivät",
    ru: "дни недели",
    en: "days of the week",
    pos: "n",
    topic: "календарь",
    image: "/cards/paivat.png",
    examples: [
      { fi: "maanantai", ru: "понедельник" },
      { fi: "tiistai", ru: "вторник" },
      { fi: "keskiviikko", ru: "среда" },
      { fi: "torstai", ru: "четверг" },
      { fi: "perjantai", ru: "пятница" },
      { fi: "lauantai", ru: "суббота" },
      { fi: "sunnuntai", ru: "воскресенье" },
    ],
  },
  {
    id: 1040,
    fi: "lukusanat",
    ru: "числительные",
    en: "numbers",
    pos: "num",
    topic: "числа",
    image: "/cards/numerot.png",
    examples: [
      { fi: "nolla — 0", ru: "ноль" },
      { fi: "yksi — 1", ru: "один" },
      { fi: "kaksi — 2", ru: "два" },
      { fi: "kolme — 3", ru: "три" },
      { fi: "kymmenen — 10", ru: "десять" },
      { fi: "kaksikymmentä — 20", ru: "двадцать" },
      { fi: "sata — 100", ru: "сто" },
      { fi: "tuhat — 1000", ru: "тысяча" },
      { fi: "miljoona — 1 000 000", ru: "миллион" },
      { fi: "kaksi miljoonaa — 2 000 000", ru: "два миллиона" },
    ],
  },
  {
    id: 1041,
    fi: "maat",
    ru: "страны",
    en: "countries",
    pos: "n",
    topic: "страны",
    image: "/cards/maat.png",
    examples: [
      { fi: "Suomi — Finland", ru: "Финляндия" },
      { fi: "Ruotsi — Sweden", ru: "Швеция" },
      { fi: "Italia — Italy", ru: "Италия" },
      { fi: "Ranska — France", ru: "Франция" },
      { fi: "Venäjä — Russia", ru: "Россия" },
      { fi: "Saksa — Germany", ru: "Германия" },
      { fi: "Egypti — Egypt", ru: "Египет" },
      { fi: "Islanti — Iceland", ru: "Исландия" },
      { fi: "Thaimaa — Thailand", ru: "Таиланд" },
    ],
  },
  {
    id: 1042,
    fi: "partikkelit",
    ru: "частицы и служебные слова",
    en: "particles / connectors",
    pos: "part",
    topic: "служебные слова",
    image: "/cards/nytmyos.png",
    examples: [
      { fi: "nyt", ru: "сейчас" },
      { fi: "vaan", ru: "а; но (в отриц. противопоставлении)" },
      { fi: "toivottavasti", ru: "надеюсь; надеемся" },
      { fi: "että", ru: "что (союз)" },
      { fi: "myös", ru: "также" },
      { fi: "yleensä", ru: "обычно" },
      { fi: "joskus", ru: "иногда" },
      { fi: "siksi", ru: "поэтому" },
      { fi: "koska", ru: "потому что" },
    ],
  },
  {
    id: 1043,
    fi: "vastakohdat (1)",
    ru: "противоположности (1)",
    en: "adjective opposites (1)",
    pos: "adj",
    topic: "прилагательные",
    image: "/cards/vaikeahelppo.png",
    examples: [
      { fi: "hyvä ↔ huono", ru: "хороший ↔ плохой" },
      { fi: "vaikea ↔ helppo", ru: "сложный ↔ лёгкий" },
      { fi: "uusi ↔ vanha", ru: "новый ↔ старый" },
      { fi: "lämmin ↔ viileä", ru: "тёплый ↔ прохладный" },
    ],
  },
  {
    id: 1044,
    fi: "vastakohdat (2)",
    ru: "противоположности (2)",
    en: "adjective opposites (2)",
    pos: "adj",
    topic: "прилагательные",
    image: "/cards/pieniiso.png",
    examples: [
      { fi: "valoisa ↔ pimeä", ru: "светлый ↔ тёмный" },
      { fi: "pieni ↔ iso/suuri", ru: "маленький ↔ большой" },
      { fi: "kaunis ↔ ruma", ru: "красивый ↔ некрасивый" },
      { fi: "kuuma ↔ kylmä", ru: "горячий ↔ холодный" },
    ],
  },
  {
    id: 1045,
    fi: "vuodenajat",
    ru: "времена года",
    en: "seasons",
    pos: "n",
    topic: "календарь",
    image: "/cards/seasons1.png",
    examples: [
      { fi: "talvi", ru: "зима" },
      { fi: "kevät", ru: "весна" },
      { fi: "kesä", ru: "лето" },
      { fi: "syksy", ru: "осень" },
      { fi: "talvella / keväällä / kesällä / syksyllä", ru: "зимой / весной / летом / осенью" },
    ],
  },
  {
    id: 1046,
    fi: "kuukaudet",
    ru: "месяцы",
    en: "months",
    pos: "n",
    topic: "календарь",
    image: "/cards/seasons.png",
    examples: [
      { fi: "tammikuu, helmikuu, maaliskuu", ru: "январь, февраль, март" },
      { fi: "huhtikuu, toukokuu, kesäkuu", ru: "апрель, май, июнь" },
      { fi: "heinäkuu, elokuu, syyskuu", ru: "июль, август, сентябрь" },
      { fi: "lokakuu, marraskuu, joulukuu", ru: "октябрь, ноябрь, декабрь" },
    ],
  },
  {
    id: 1047,
    fi: "värit",
    ru: "цвета",
    en: "colors",
    pos: "adj",
    topic: "цвета",
    image: "/cards/varit.png",
    examples: [
      { fi: "valkoinen", ru: "белый" },
      { fi: "harmaa", ru: "серый" },
      { fi: "musta", ru: "чёрный" },
      { fi: "vihreä", ru: "зелёный" },
      { fi: "keltainen", ru: "жёлтый" },
      { fi: "oranssi", ru: "оранжевый" },
      { fi: "punainen", ru: "красный" },
      { fi: "liila", ru: "фиолетовый" },
      { fi: "sininen", ru: "синий" },
      { fi: "ruskea", ru: "коричневый" },
    ],
  },
  {
    id: 1048,
    fi: "luonne",
    ru: "характер: какой он/она?",
    en: "personality traits",
    pos: "adj",
    topic: "характер",
    image: "/cards/millainen.png",
    examples: [
      { fi: "iloinen / onnellinen", ru: "весёлый / счастливый" },
      { fi: "surullinen", ru: "грустный" },
      { fi: "puhelias", ru: "разговорчивый" },
      { fi: "hiljainen", ru: "тихий" },
      { fi: "ystävällinen; kohtelias", ru: "дружелюбный; вежливый" },
      { fi: "epäystävällinen; epäkohtelias", ru: "недружелюбный; невежливый" },
      { fi: "nuori", ru: "молодой" },
      { fi: "vanha", ru: "старый" },
      { fi: "vihainen", ru: "злой" },
      { fi: "ujo", ru: "застенчивый" },
    ],
  },
  {
    id: 1049,
    fi: "perhe",
    ru: "семья",
    en: "family",
    pos: "n",
    topic: "семья",
    image: "/cards/perhe.png",
    examples: [
      { fi: "isoisä", ru: "дедушка" },
      { fi: "isoäiti", ru: "бабушка" },
      { fi: "isä", ru: "отец" },
      { fi: "äiti", ru: "мать" },
      { fi: "mies / aviomies", ru: "муж" },
      { fi: "vaimo", ru: "жена" },
      { fi: "veli", ru: "брат" },
      { fi: "sisko", ru: "сестра" },
      { fi: "poika", ru: "сын" },
      { fi: "tytär", ru: "дочь" },
      { fi: "vauva", ru: "младенец" },
    ],
  },
  {
    id: 1050,
    fi: "siviilisääty",
    ru: "семейное положение",
    en: "marital status",
    pos: "n",
    topic: "семейное положение",
    image: "/cards/naimisissa.png",
    examples: [
      { fi: "naimisissa", ru: "женат/замужем" },
      { fi: "naimaton / sinkku", ru: "неженат/незамужем, холост/одинока" },
      { fi: "kihloissa", ru: "помолвлен(а)" },
      { fi: "eronnut", ru: "в разводе" },
    ],
  },
  {
    id: 1051,
    fi: "ajan adverbit ja konnektorit",
    ru: "временные наречия и связки",
    en: "time adverbs & connectors",
    pos: "adv",
    topic: "связки времени",
    image: "/cards/kunensinsitten.png",
    examples: [
      { fi: "kun", ru: "когда" },
      { fi: "ensin", ru: "сначала" },
      { fi: "sitten", ru: "потом" },
      { fi: "tavallisesti", ru: "обычно" },
      { fi: "vain", ru: "только" },
      { fi: "mutta", ru: "но" },
      { fi: "heti", ru: "сразу" },
      { fi: "vielä", ru: "ещё, пока" },
    ],
  },
  {
    id: 1052,
    fi: "vastakohdat (3)",
    ru: "противоположности (3)",
    en: "opposites (3)",
    pos: "adj",
    topic: "прилагательные",
    image: "/cards/ylosalas.png",
    examples: [
      { fi: "ylös ↔ alas", ru: "вверх ↔ вниз" },
      { fi: "auki ↔ kiinni", ru: "открыт ↔ закрыт" },
      { fi: "korkea ↔ matala", ru: "высокий ↔ низкий" },
      { fi: "leveä ↔ kapea", ru: "широкий ↔ узкий" },
      { fi: "pehmeä ↔ kova", ru: "мягкий ↔ твёрдый" },
      { fi: "kodikas / viihtyisä ↔ sotkuinen", ru: "уютный ↔ неубранный/захламлённый" },
    ],
  },
  {
    id: 1053,
    fi: "huoneet (1)",
    ru: "комнаты (1)",
    en: "rooms (1)",
    pos: "n",
    topic: "комнаты",
    image: "/cards/huoneet2.png",
    examples: [
      { fi: "kylpyhuone", ru: "ванная" },
      { fi: "vessa", ru: "туалет" },
      { fi: "makuuhuone", ru: "спальня" },
      { fi: "olohuone", ru: "гостиная" },
      { fi: "lastenhuone", ru: "детская" },
      { fi: "eteinen", ru: "прихожая" },
      { fi: "työhuone", ru: "кабинет" },
      { fi: "keittiö", ru: "кухня" },
    ],
  },
  {
    id: 1054,
    fi: "huoneet (2)",
    ru: "комнаты (2)",
    en: "rooms (2)",
    pos: "n",
    topic: "комнаты",
    image: "/cards/huoneet.png",
    examples: [
      { fi: "parveke", ru: "балкон" },
      { fi: "terassi", ru: "терраса" },
      { fi: "sauna", ru: "сауна" },
    ],
  },
  {
    id: 1055,
    fi: "huonekalut",
    ru: "мебель",
    en: "furniture",
    pos: "n",
    topic: "мебель",
    image: "/cards/huonekalut.png",
    examples: [
      { fi: "nojatuoli", ru: "кресло" },
      { fi: "yöpöytä", ru: "тумбочка" },
      { fi: "sänky", ru: "кровать" },
      { fi: "matto", ru: "ковёр" },
      { fi: "työtuoli", ru: "офисный стул" },
      { fi: "työpöytä", ru: "рабочий стол" },
      { fi: "lamppu", ru: "лампа" },
      { fi: "kaappi", ru: "шкаф" },
      { fi: "sohvapöytä", ru: "журнальный столик" },
      { fi: "sohva", ru: "диван" },
      { fi: "kirjahylly", ru: "книжная полка" },
      { fi: "verhot", ru: "шторы" },
      { fi: "kylpyamme", ru: "ванна" },
      { fi: "pesuallas", ru: "раковина" },
      { fi: "peili", ru: "зеркало" },
      { fi: "suihku", ru: "душ" },
      { fi: "pöytä", ru: "стол" },
      { fi: "tuoli", ru: "стул" },
      { fi: "ruokapöytä", ru: "обеденный стол" },
    ],
  },
  {
    id: 1056,
    fi: "kodinkoneet",
    ru: "бытовая техника",
    en: "home appliances",
    pos: "n",
    topic: "бытовая техника",
    image: "/cards/kodinkoneet.png",
    examples: [
      { fi: "kahvinkeitin", ru: "кофеварка" },
      { fi: "televisio", ru: "телевизор" },
      { fi: "pakastin", ru: "морозильник" },
      { fi: "mikroaaltouuni", ru: "микроволновка" },
      { fi: "vedenkeitin", ru: "электрочайник" },
      { fi: "leivänpaahdin", ru: "тостер" },
      { fi: "hella + uuni", ru: "плита + духовка" },
      { fi: "astianpesukone", ru: "посудомоечная машина" },
      { fi: "jääkaappi", ru: "холодильник" },
      { fi: "kaukosäädin", ru: "пульт ДУ" },
    ],
  },
  {
    id: 1057,
    fi: "talossa",
    ru: "в доме (снаружи)",
    en: "around the house",
    pos: "n",
    topic: "дом",
    image: "/cards/talossa.png",
    examples: [
      { fi: "katto", ru: "крыша" },
      { fi: "ikkuna", ru: "окно" },
      { fi: "autotalli", ru: "гараж" },
      { fi: "parkkipaikka", ru: "парковка" },
      { fi: "ovi", ru: "дверь" },
      { fi: "rappukäytävä / rappu", ru: "подъезд / лестница" },
    ],
  },
// ---------- Плакаты: дом внутри и еда/напитки ----------
  {
    id: 1058,
    fi: "talossa (sisällä)",
    ru: "в доме (внутри)",
    en: "in the house (inside)",
    pos: "n",
    topic: "дом",
    image: "/cards/talossa2.png",
    examples: [
      { fi: "ensimmäinen kerros", ru: "первый этаж" },
      { fi: "toinen kerros", ru: "второй этаж" },
      { fi: "seinä", ru: "стена" },
      { fi: "lattia", ru: "пол" },
      { fi: "hissi", ru: "лифт" },
      { fi: "imuri", ru: "пылесос" },
      { fi: "tietokone", ru: "компьютер" },
    ],
  },
  {
    id: 1059,
    fi: "asunnot",
    ru: "квартиры",
    en: "apartments",
    pos: "n",
    topic: "жильё",
    image: "/cards/asunnot.png",
    examples: [
      { fi: "yksiö", ru: "однокомнатная" },
      { fi: "kaksio", ru: "двухкомнатная" },
      { fi: "3 huonetta ja keittiö", ru: "3 комнаты и кухня" },
      { fi: "4 huonetta ja keittiö", ru: "4 комнаты и кухня" },
    ],
  },
  {
    id: 1060,
    fi: "hedelmät",
    ru: "фрукты",
    en: "fruits",
    pos: "n",
    topic: "фрукты",
    image: "/cards/hedelmat.png",
    examples: [
      { fi: "omena", ru: "яблоко" },
      { fi: "päärynä", ru: "груша" },
      { fi: "banaani", ru: "банан" },
      { fi: "appelsiini", ru: "апельсин" },
      { fi: "ananas", ru: "ананас" },
      { fi: "meloni", ru: "арбуз/дыня (по постеру — арбуз)" },
      { fi: "viinirypäle", ru: "виноград" },
      { fi: "sitruuna", ru: "лимон" },
    ],
  },
  {
    id: 1061,
    fi: "vihannekset / kasvikset",
    ru: "овощи",
    en: "vegetables",
    pos: "n",
    topic: "овощи",
    image: "/cards/vihannekset.png",
    examples: [
      { fi: "peruna", ru: "картофель" },
      { fi: "sipuli", ru: "лук" },
      { fi: "tomaatti", ru: "помидор" },
      { fi: "valkosipuli", ru: "чеснок" },
      { fi: "porkkana", ru: "морковь" },
      { fi: "kurkku", ru: "огурец" },
      { fi: "kaali", ru: "капуста" },
      { fi: "kukkakaali", ru: "цветная капуста" },
      { fi: "herne", ru: "горох" },
      { fi: "sieni", ru: "гриб" },
      { fi: "paprika", ru: "перец" },
      { fi: "salaatti", ru: "салат" },
      { fi: "oliivi", ru: "оливка" },
    ],
  },
  {
    id: 1062,
    fi: "liha, kala ja munat",
    ru: "мясо, рыба и яйца",
    en: "meat, fish & eggs",
    pos: "n",
    topic: "еда",
    image: "/cards/ruoka1.png",
    examples: [
      { fi: "liha", ru: "мясо" },
      { fi: "kana", ru: "курица" },
      { fi: "kala", ru: "рыба" },
      { fi: "makkara", ru: "колбаса" },
      { fi: "nakki", ru: "сосиска" },
      { fi: "muna", ru: "яйцо" },
      { fi: "katkarapu", ru: "креветка" },
    ],
  },
  {
    id: 1063,
    fi: "marjat",
    ru: "ягоды",
    en: "berries",
    pos: "n",
    topic: "ягоды",
    image: "/cards/marjat.png",
    examples: [
      { fi: "mansikka", ru: "клубника" },
      { fi: "mustikka", ru: "черника" },
      { fi: "puolukka", ru: "брусника" },
      { fi: "vadelma", ru: "малина" },
      { fi: "lakka", ru: "морошка" },
      { fi: "kirsikka", ru: "вишня" },
      { fi: "viinimarja", ru: "смородина" },
    ],
  },
  {
    id: 1064,
    fi: "mausteet",
    ru: "специи и приправы",
    en: "spices & condiments",
    pos: "n",
    topic: "специи",
    image: "/cards/mausteet.png",
    examples: [
      { fi: "suola", ru: "соль" },
      { fi: "pippuri", ru: "перец" },
      { fi: "sokeri", ru: "сахар" },
      { fi: "öljy", ru: "масло" },
      { fi: "ketsuppi", ru: "кетчуп" },
      { fi: "sinappi", ru: "горчица" },
      { fi: "etikka", ru: "уксус" },
    ],
  },
  {
    id: 1065,
    fi: "ruoat",
    ru: "блюда",
    en: "dishes / foods",
    pos: "n",
    topic: "блюда",
    image: "/cards/ruoka.png",
    examples: [
      { fi: "pizza", ru: "пицца" },
      { fi: "pasta", ru: "паста" },
      { fi: "riisi", ru: "рис" },
      { fi: "salaatti", ru: "салат" },
      { fi: "hampurilainen", ru: "гамбургер" },
      { fi: "kastike", ru: "соус" },
      { fi: "pihvi", ru: "стейк" },
      { fi: "keitto", ru: "суп" },
      { fi: "ranskalaiset", ru: "картофель фри" },
    ],
  },
  {
    id: 1066,
    fi: "jälkiruoat",
    ru: "десерты",
    en: "desserts",
    pos: "n",
    topic: "десерты",
    image: "/cards/jalkiruoat.png",
    examples: [
      { fi: "jäätelö", ru: "мороженое" },
      { fi: "kakku", ru: "торт" },
      { fi: "piirakka", ru: "пирог" },
      { fi: "keksi", ru: "печенье" },
      { fi: "karkki", ru: "конфета" },
      { fi: "suklaa", ru: "шоколад" },
      { fi: "pulla", ru: "булочка" },
    ],
  },
  {
    id: 1067,
    fi: "juomat",
    ru: "напитки",
    en: "drinks",
    pos: "n",
    topic: "напитки",
    image: "/cards/juomat.png",
    examples: [
      { fi: "vesi", ru: "вода" },
      { fi: "mehu", ru: "сок" },
      { fi: "maito", ru: "молоко" },
      { fi: "piimä", ru: "кефир/пахта" },
      { fi: "tee", ru: "чай" },
      { fi: "kahvi", ru: "кофе" },
      { fi: "limu", ru: "лимонад" },
      { fi: "olut", ru: "пиво" },
      { fi: "viini", ru: "вино" },
      { fi: "siideri", ru: "сидр" },
      { fi: "kaakao", ru: "какао" },
    ],
  },
  {
    id: 1068,
    fi: "aamiainen",
    ru: "завтрак (хлопья с молоком)",
    en: "breakfast (cereal)",
    pos: "n",
    topic: "еда",
    image: "/cards/aamiainen.png",
    examples: [
      { fi: "hunaja", ru: "мёд" },
      { fi: "maito", ru: "молоко" },
      { fi: "murot", ru: "хлопья" },
      { fi: "vadelma", ru: "малина" },
      { fi: "mustikka", ru: "черника (bilberry)" },
    ],
  },
  {
    id: 1069,
    fi: "aamiainen",
    ru: "завтрак (каша и фрукты)",
    en: "breakfast (porridge & fruit)",
    pos: "n",
    topic: "еда",
    image: "/cards/aamiainen2.png",
    examples: [
      { fi: "mehu", ru: "сок" },
      { fi: "appelsiini", ru: "апельсин" },
      { fi: "omena", ru: "яблоко" },
      { fi: "banaani", ru: "банан" },
      { fi: "puuro", ru: "каша" },
      { fi: "mansikka", ru: "клубника" },
    ],
  },
  {
    id: 1070,
    fi: "astiat",
    ru: "посуда",
    en: "tableware",
    pos: "n",
    topic: "посуда",
    image: "/cards/astiat.png",
    examples: [
      { fi: "paistinpannu", ru: "сковорода" },
      { fi: "kattila", ru: "кастрюля" },
      { fi: "tarjotin", ru: "поднос" },
      { fi: "kulho", ru: "миска" },
      { fi: "lautanen", ru: "тарелка" },
      { fi: "lasi", ru: "стакан" },
      { fi: "kuppi, muki", ru: "чашка, кружка" },
      { fi: "lautasliina", ru: "салфетка" },
      { fi: "haarukka", ru: "вилка" },
      { fi: "veitsi", ru: "нож" },
      { fi: "lusikka", ru: "ложка" },
    ],
  },
  {
    id: 1071,
    fi: "ruoan kuvaileminen",
    ru: "описание еды (прилагательные)",
    en: "food adjectives",
    pos: "adj",
    topic: "прилагательные",
    image: "/cards/makeahapan.png",
    examples: [
      { fi: "hyvä, herkullinen ↔ huono, paha", ru: "вкусный ↔ плохой" },
      { fi: "kylmä ↔ kuuma, lämmin", ru: "холодный ↔ горячий/тёплый" },
      { fi: "makea ↔ hapan", ru: "сладкий ↔ кислый" },
      { fi: "kypsä ↔ raaka", ru: "спелый/готовый ↔ сырой" },
      { fi: "tuore ↔ vanha", ru: "свежий ↔ старый" },
      { fi: "suolainen ↔ suolaton", ru: "солёный ↔ несолёный" },
      { fi: "rasvainen ↔ rasvaton", ru: "жирный ↔ нежирный" },
      { fi: "tulinen ↔ mieto", ru: "острый ↔ пресный" },
      { fi: "terveellinen ↔ epäterveellinen", ru: "полезный ↔ вредный" },
      { fi: "kallis ↔ halpa, edullinen", ru: "дорогой ↔ дешёвый/доступный" },
    ],
  },
  {
    id: 1072,
    fi: "juhlat & toivotukset",
    ru: "праздники и пожелания",
    en: "parties & wishes",
    pos: "n",
    topic: "праздники",
    image: "/cards/juhlat.png",
    examples: [
      { fi: "syntymäpäivä", ru: "день рождения" },
      { fi: "nimipäivä", ru: "день ангела (именины)" },
      { fi: "häät", ru: "свадьба" },
      { fi: "ristiäiset", ru: "крестины" },
      { fi: "hautajaiset", ru: "похороны" },
      { fi: "Hyvää nimipäivää!", ru: "С именинами!" },
      { fi: "Onnea!", ru: "Поздравляю! Удачи!" },
      { fi: "Lämmin osanottoni.", ru: "Мои соболезнования." },
      { fi: "Kaikkea hyvää!", ru: "Всего наилучшего!" },
    ],
  },
  {
    id: 1073,
    fi: "töissä (1)",
    ru: "на работе (места и действия)",
    en: "at work (places & actions)",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa3.png",
    examples: [
      { fi: "työpaikka", ru: "рабочее место" },
      { fi: "firma, yritys", ru: "фирма, компания" },
      { fi: "toimisto", ru: "офис" },
      { fi: "työhuone", ru: "кабинет" },
      { fi: "neuvotteluhuone", ru: "переговорная" },
      { fi: "kokous / palaveri", ru: "встреча, собрание" },
      { fi: "neuvotella", ru: "вести переговоры" },
    ],
  },
  {
    id: 1074,
    fi: "töissä (2)",
    ru: "на работе (время и оплата)",
    en: "at work (time & pay)",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa.png",
    examples: [
      { fi: "työpäivä", ru: "рабочий день" },
      { fi: "työaika", ru: "рабочее время" },
      { fi: "työvuoro", ru: "смена" },
      { fi: "ylityö", ru: "сверхурочная работа" },
      { fi: "palkka", ru: "зарплата" },
    ],
  },
  {
    id: 1075,
    fi: "töissä (3)",
    ru: "на работе (роли)",
    en: "at work (roles)",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa5.png",
    examples: [
      { fi: "työnantaja", ru: "работодатель" },
      { fi: "työntekijä", ru: "сотрудник" },
      { fi: "pomo", ru: "босс" },
      { fi: "esimies", ru: "руководитель" },
      { fi: "työkaveri, kollega", ru: "коллега" },
      { fi: "tiimi", ru: "команда" },
      { fi: "asiakas", ru: "клиент" },
    ],
  },
  {
    id: 1076,
    fi: "töissä (4)",
    ru: "на работе (устройства и связь)",
    en: "at work (devices & comms)",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa6.png",
    examples: [
      { fi: "tietokone", ru: "компьютер" },
      { fi: "kannettava tietokone, läppäri", ru: "ноутбук" },
      { fi: "hiiri", ru: "мышь" },
      { fi: "sähköposti", ru: "электронная почта" },
      { fi: "tulostin; tulostaa/printata", ru: "принтер; печатать" },
      { fi: "faksi", ru: "факс" },
      { fi: "kopiokone", ru: "ксерокс" },
      { fi: "puhelin, kännykkä", ru: "телефон, мобильный" },
    ],
  },
  {
    id: 1077,
    fi: "töissä (5)",
    ru: "на работе (проекты)",
    en: "at work (projects)",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa2.png",
    examples: [
      { fi: "sopimus", ru: "договор" },
      { fi: "projekti", ru: "проект" },
      { fi: "aikataulu", ru: "расписание/график" },
      { fi: "kiire", ru: "спешка" },
      { fi: "stressi", ru: "стресс" },
    ],
  },
  {
    id: 1078,
    fi: "kahvitauko",
    ru: "на работе: перерывы",
    en: "at work: coffee break",
    pos: "n",
    topic: "работа",
    image: "/cards/toissa1.png", // <- /public/cards/toissa_coffee_break.png
    examples: [
      { fi: "lounastauko", ru: "lunch time" },
      { fi: "kahvitauko", ru: "coffee break" },
      { fi: "ruokala", ru: "столовая, кафе (canteen)" },
      { fi: "kahviautomaatti", ru: "кофемашина" },
    ],
  },

  // AMMATIT — профессии
  {
    id: 1079,
    fi: "ammatit: terveys",
    ru: "профессии: медицина",
    en: "professions: health",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit7.png",
    examples: [
      { fi: "hammaslääkäri", ru: "стоматолог" },
      { fi: "lääkäri", ru: "врач" },
      { fi: "sairaanhoitaja", ru: "медсестра/медбрат" },
    ],
  },
  {
    id: 1080,
    fi: "ammatit: kuljettajat",
    ru: "профессии: водители",
    en: "professions: drivers",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit9.png",
    examples: [
      { fi: "linja-autonkuljettaja / bussikuski", ru: "водитель автобуса" },
      { fi: "taksikuski", ru: "таксист" },
      { fi: "rekkakuski", ru: "водитель грузовика" },
    ],
  },
  {
    id: 1081,
    fi: "ammatit: turvallisuus",
    ru: "профессии: безопасность",
    en: "professions: security",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit6.png",
    examples: [
      { fi: "poliisi", ru: "полицейский" },
      { fi: "palomies", ru: "пожарный" },
      { fi: "vartija", ru: "охранник" },
    ],
  },
  {
    id: 1082,
    fi: "ammatit: opetus",
    ru: "профессии: образование",
    en: "professions: education",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit8.png",
    examples: [
      { fi: "opettaja", ru: "учитель" },
      { fi: "lastentarhanopettaja", ru: "воспитатель" },
      { fi: "lastenhoitaja", ru: "няня" },
    ],
  },
  {
    id: 1083,
    fi: "ammatit: rakentaminen",
    ru: "профессии: строительство",
    en: "professions: construction",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit1.png",
    examples: [
      { fi: "arkkitehti", ru: "архитектор" },
      { fi: "insinööri", ru: "инженер" },
      { fi: "rakennusmies", ru: "строитель" },
    ],
  },
  {
    id: 1084,
    fi: "ammatit: asennus",
    ru: "профессии: монтаж/ремонт",
    en: "professions: trades",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit11.png",
    examples: [
      { fi: "putkiasentaja / putkimies", ru: "сантехник" },
      { fi: "sähköasentaja / sähkömies", ru: "электрик" },
      { fi: "maalari", ru: "маляр" },
    ],
  },
  {
    id: 1085,
    fi: "ammatit: palvelu",
    ru: "профессии: сервис",
    en: "professions: service",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit10.png",
    examples: [
      { fi: "myyjä", ru: "продавец" },
      { fi: "siivooja", ru: "уборщик/уборщица" },
      { fi: "postinjakaja", ru: "почтальон" },
    ],
  },
  {
    id: 1086,
    fi: "ammatit: ravintola",
    ru: "профессии: ресторан",
    en: "professions: catering",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit3.png",
    examples: [
      { fi: "kokki", ru: "повар" },
      { fi: "tarjoilija", ru: "официант/ка" },
      { fi: "keittiöapulainen", ru: "кухонный работник" },
    ],
  },
  {
    id: 1087,
    fi: "ammatit: toimisto",
    ru: "профессии: офис",
    en: "professions: office",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit4.png",
    examples: [
      { fi: "toimitusjohtaja", ru: "генеральный директор" },
      { fi: "henkilöstöpäällikkö", ru: "начальник отдела кадров" },
      { fi: "assistentti, sihteeri", ru: "ассистент, секретарь" },
    ],
  },
  {
    id: 1088,
    fi: "ammatit (media)",
    ru: "профессии: медиа",
    en: "professions: media",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit2.png",
    examples: [
      { fi: "valokuvaaja", ru: "фотограф" },
      { fi: "toimittaja", ru: "журналист" },
      { fi: "kirjailija", ru: "писатель" },
    ],
  },
  {
    id: 1089,
    fi: "ammatit (viihde & urheilu)",
    ru: "профессии: шоу-бизнес и спорт",
    en: "professions: showbiz & sport",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit.png",
    examples: [
      { fi: "laulaja", ru: "певец/певица", },
      { fi: "näyttelijä", ru: "актёр, актриса" },
      { fi: "urheilija", ru: "спортсмен/спортсменка" },
    ],
  },
  {
    id: 1090,
    fi: "ammatit (kauneus)",
    ru: "профессии: бьюти",
    en: "professions: beauty",
    pos: "n",
    topic: "профессии",
    image: "/cards/ammatit5.png",
    examples: [
      { fi: "kampaaja; parturi", ru: "парикмахер; барбер" },
      { fi: "kosmetologi", ru: "косметолог" },
    ],
  },
  {
    id: 1091,
    fi: "puhekieli: numerot",
    ru: "разговорные числительные",
    en: "colloquial numbers",
    pos: "num",
    topic: "числа",
    image: "/cards/pknumerot.png",
    examples: [
      { fi: "yks, kaks, kolme", ru: "1, 2, 3 (разг.)" },
      { fi: "viis, kuus, seitemän", ru: "5, 6, 7 (разг.)" },
      { fi: "kakskyt, kolkyt, nelkyt…", ru: "20, 30, 40…" },
    ],
  },
  {
    id: 1092,
    fi: "matkailu (1)",
    ru: "путешествия (аэропорт и багаж)",
    en: "travel (airport & luggage)",
    pos: "n",
    topic: "путешествия",
    image: "/cards/matkailu2.png",
    examples: [
      { fi: "lentoasema / lentokenttä", ru: "аэропорт" },
      { fi: "lento", ru: "рейс" },
      { fi: "lentolippu", ru: "авиабилет" },
      { fi: "matkatavara; matkalaukku", ru: "багаж; чемодан" },
      { fi: "käsimatkatavara", ru: "ручная кладь" },
    ],
  },
  {
    id: 1093,
    fi: "matkailu (2)",
    ru: "путешествия (документы и контроль)",
    en: "travel (docs & control)",
    pos: "n",
    topic: "путешествия",
    image: "/cards/matkailu3.png",
    examples: [
      { fi: "passi", ru: "паспорт" },
      { fi: "viisumi", ru: "виза" },
      { fi: "matkavakuutus", ru: "страховка" },
      { fi: "turvatarkastus", ru: "досмотр/безопасность" },
      { fi: "passintarkastus", ru: "паспортный контроль" },
      { fi: "tulli", ru: "таможня" },
    ],
  },
  {
    id: 1094,
    fi: "matkailu (3)",
    ru: "путешествия (экскурсии)",
    en: "travel (sightseeing)",
    pos: "n",
    topic: "путешествия",
    image: "/cards/matkailu1.png",
    examples: [
      { fi: "turisti", ru: "турист" },
      { fi: "nähtävyys", ru: "достопримечательность" },
      { fi: "kiertoajelu", ru: "обзорная экскурсия" },
      { fi: "retki", ru: "поездка/выезд" },
      { fi: "opas", ru: "гид" },
    ],
  },
  {
    id: 1095,
    fi: "matkailu (4)",
    ru: "путешествия (ночёвка и аренда)",
    en: "travel (stay & rent)",
    pos: "n",
    topic: "путешествия",
    image: "/cards/matkailu.png",
    examples: [
      { fi: "majoitus", ru: "проживание" },
      { fi: "yöpyä", ru: "ночевать" },
      { fi: "varata hotellihuone", ru: "забронировать номер" },
      { fi: "varaus", ru: "бронь" },
      { fi: "vuokrata auto", ru: "взять машину напрокат" },
    ],
  },
  {
    id: 1096,
    fi: "reaktiot & huudahdukset",
    ru: "реакции и междометия",
    en: "reactions & interjections",
    pos: "part",
    topic: "служебные слова",
    image: "/cards/ihantotta.png",
    examples: [
      { fi: "Ihan totta?", ru: "Серьёзно?" },
      { fi: "Eikä?!", ru: "Да ну?!" },
      { fi: "Sanopa muuta!", ru: "И не говори!" },
      { fi: "No…", ru: "Ну…" },
      { fi: "Voi ei!", ru: "Ой нет!" },
      { fi: "Niin tietysti", ru: "Конечно" },
      { fi: "Niin", ru: "Ну, да / ага" },
      { fi: "Hyvä ajatus!", ru: "Хорошая идея!" },
    ],
  },
  {
    id: 1097,
    fi: "partikkelit (2)",
    ru: "частицы и связки (2)",
    en: "particles/connectors (2)",
    pos: "part",
    topic: "служебные слова",
    image: "/cards/vastaitse.png",
    examples: [
      { fi: "vasta", ru: "только; лишь" },
      { fi: "itse", ru: "сам; самостоятельно" },
      { fi: "kuitenkin", ru: "однако" },
      { fi: "melkein", ru: "почти" },
      { fi: "varmaan", ru: "наверное" },
      { fi: "koko ajan", ru: "всё время" },
      { fi: "itse asiassa", ru: "вообще-то; на самом деле" },
    ],
  },
  {
    id: 1098,
    fi: "vaatteet (1)",
    ru: "одежда: футболка, рубашка, свитер, пальто",
    en: "clothes (tops & coat)",
    pos: "n",
    topic: "одежда",
    image: "/cards/vaatteet.png",
    examples: [
      { fi: "T-paita", ru: "футболка" },
      { fi: "paita", ru: "рубашка, кофта" },
      { fi: "villapusero", ru: "свитер" },
      { fi: "takki", ru: "куртка, пальто" },
    ],
  },
  {
    id: 1099,
    fi: "vaatteet (2)",
    ru: "одежда: брюки, джинсы, юбка, шорты, платье, костюм",
    en: "clothes (bottoms & dress/suit)",
    pos: "n",
    topic: "одежда",
    image: "/cards/vaatteet4.png",
    examples: [
      { fi: "housut", ru: "брюки" },
      { fi: "farkut", ru: "джинсы" },
      { fi: "hame", ru: "юбка" },
      { fi: "shortsit", ru: "шорты" },
      { fi: "mekko", ru: "платье" },
      { fi: "puku", ru: "костюм" },
    ],
  },
  {
    id: 1100,
    fi: "vaatteet (3)",
    ru: "одежда: купальник, плавки, носки, бельё",
    en: "clothes (swim & underwear)",
    pos: "n",
    topic: "одежда",
    image: "/cards/vaatteet2.png",
    examples: [
      { fi: "uimapuku", ru: "купальник" },
      { fi: "uimahousut", ru: "плавки" },
      { fi: "sukat", ru: "носки" },
      { fi: "alusvaatteet", ru: "нижнее бельё" },
      { fi: "aluspaita", ru: "майка" },
      { fi: "alushousut", ru: "трусы" },
      { fi: "rintaliivit", ru: "лифчик" },
    ],
  },
  {
    id: 1101,
    fi: "vaatteet (4)",
    ru: "обувь: сапоги, кроссовки/кеды, туфли",
    en: "shoes",
    pos: "n",
    topic: "одежда",
    image: "/cards/vaatteet3.png",
    examples: [
      { fi: "saappaat", ru: "сапоги" },
      { fi: "lenkkarit / lenkkitossut", ru: "кроссовки" },
      { fi: "kengät", ru: "туфли, обувь" },
    ],
  },
  {
    id: 1102,
    fi: "vaatteet (5)",
    ru: "аксессуары: шапка, шарф, перчатки, галстук, ремень",
    en: "clothes (accessories)",
    pos: "n",
    topic: "одежда",
    image: "/cards/vaatteet1.png",
    examples: [
      { fi: "pipo", ru: "шапка" },
      { fi: "huivi", ru: "шарф" },
      { fi: "käsineet", ru: "перчатки" },
      { fi: "solmio", ru: "галстук" },
      { fi: "vyö", ru: "ремень" },
    ],
  },
  {
    id: 1103,
    fi: "ruumiinosat: kasvot",
    ru: "части тела: лицо",
    en: "body parts: face",
    pos: "n",
    topic: "части тела",
    image: "/cards/ruumiinosat1.png",
    examples: [
      { fi: "otsa", ru: "лоб" },
      { fi: "silmä", ru: "глаз" },
      { fi: "nenä", ru: "нос" },
      { fi: "poski", ru: "щека" },
      { fi: "suu", ru: "рот" },
      { fi: "huuli (huulet)", ru: "губа (губы)" },
      { fi: "hammas (hampaat)", ru: "зуб (зубы)" },
      { fi: "leuka", ru: "подбородок" },
      { fi: "hiukset / tukka", ru: "волосы" },
      { fi: "korva", ru: "ухо" },
    ],
  },
  {
    id: 1104,
    fi: "ruumiinosat: vartalo",
    ru: "части тела: тело",
    en: "body parts: body",
    pos: "n",
    topic: "части тела",
    image: "/cards/ruumiinosat.png",
    examples: [
      { fi: "pää", ru: "голова" },
      { fi: "niska", ru: "шея (сзади)" },
      { fi: "olkäpää, hartiat", ru: "плечо, плечи" },
      { fi: "käsivarsi", ru: "рука (по всей длине)" },
      { fi: "kyynärpää", ru: "локоть" },
      { fi: "ranne", ru: "запястье" },
      { fi: "käsi", ru: "кисть, рука" },
      { fi: "selkä", ru: "спина" },
      { fi: "rinta / rinnat", ru: "грудь" },
      { fi: "vatsa / maha", ru: "живот" },
      { fi: "takapuoli", ru: "ягодицы" },
      { fi: "polvi", ru: "колено" },
      { fi: "nilkka", ru: "лодыжка" },
      { fi: "jalka", ru: "нога" },
      { fi: "varvas (varpaat)", ru: "палец (на ноге), пальцы" },
    ],
  },
  {
    id: 1105,
    fi: "adverbit",
    ru: "наречия: ещё, уже, наконец…",
    en: "adverbs: still, already, finally…",
    pos: "adv",
    topic: "служебные слова",
    image: "/cards/vielajo.png",
    examples: [
      { fi: "vielä", ru: "ещё; пока" },
      { fi: "jo", ru: "уже" },
      { fi: "vihdoin", ru: "наконец" },
      { fi: "sillä aikaa", ru: "между тем" },
      { fi: "onneksi", ru: "к счастью" },
      { fi: "välillä", ru: "иногда; время от времени" },
      { fi: "aika", ru: "довольно; время" },
    ],
  },
  {
    id: 1106,
    fi: "luonto (1)",
    ru: "природа: гора, лес",
    en: "nature (mountain & forest)",
    pos: "n",
    topic: "природа",
    image: "/cards/luonto.png",
    examples: [
      { fi: "vuori", ru: "гора" },
      { fi: "metsä", ru: "лес" },
    ],
  },
  {
    id: 1107,
    fi: "luonto (2)",
    ru: "природа: остров, море, берег/пляж",
    en: "nature (island, sea, shore)",
    pos: "n",
    topic: "природа",
    image: "/cards/luonto1.png",
    examples: [
      { fi: "saari", ru: "остров" },
      { fi: "meri", ru: "море" },
      { fi: "ranta", ru: "берег, пляж" },
    ],
  },
  {
    id: 1108,
    fi: "luonto (joki, mäki, kivi)",
    ru: "природа: река, холм, камень",
    en: "nature: river, hill, stone",
    pos: "n",
    topic: "природа",
    image: "/cards/luonto3.png",
    examples: [
      { fi: "joki", ru: "река" },
      { fi: "mäki", ru: "холм" },
      { fi: "kivi", ru: "камень" },
    ],
  },
  {
    id: 1109,
    fi: "eläimet (tiikeri & karhu)",
    ru: "животные: тигр и медведь",
    en: "animals: tiger & bear",
    pos: "n",
    topic: "животные",
    image: "/cards/elaimet1.png",
    examples: [
      { fi: "tiikeri", ru: "тигр" },
      { fi: "karhu", ru: "медведь" },
    ],
  },
  {
    id: 1110,
    fi: "eläimet (kirahvi, virtahepo, leijona, seepra)",
    ru: "животные: жираф, бегемот, лев, зебра",
    en: "animals: giraffe, hippo, lion, zebra",
    pos: "n",
    topic: "животные",
    image: "/cards/elaimet.png",
    examples: [
      { fi: "kirahvi", ru: "жираф" },
      { fi: "virtahepo", ru: "бегемот" },
      { fi: "leijona", ru: "лев" },
      { fi: "seeppra", ru: "зебра" },
    ],
  },
  {
    id: 1111,
    fi: "eläimet (kissa & hiiri)",
    ru: "животные: кот и мышь",
    en: "animals: cat & mouse",
    pos: "n",
    topic: "животные",
    image: "/cards/elaimet2.png",
    examples: [
      { fi: "kissa", ru: "кот" },
      { fi: "hiiri", ru: "мышь" },
    ],
  },
  {
    id: 1112,
    fi: "filosofia",
    ru: "философия",
    en: "philosophy",
    pos: "n",
    topic: "темы",
    image: "/cards/filosofia.png",
    examples: [
      { fi: "jumala", ru: "бог" },
      { fi: "hyvyys", ru: "доброта" },
      { fi: "pahuus", ru: "зло" },
      { fi: "totuus", ru: "истина" },
      { fi: "järki", ru: "разум" },
      { fi: "Onko jumala olemassa?", ru: "Существует ли бог?" },
    ],
  },
  {
    id: 1113,
    fi: "avaruus",
    ru: "космос",
    en: "space",
    pos: "n",
    topic: "космос",
    image: "/cards/avaruus.png",
    examples: [
      { fi: "maailmankaikkeus", ru: "вселенная" },
      { fi: "alkuräjähdys", ru: "большой взрыв" },
      { fi: "tähti", ru: "звезда" },
      { fi: "planeetta", ru: "планета" },
      { fi: "tähdistö", ru: "созвездие" },
      { fi: "musta aukko", ru: "чёрная дыра" },
    ],
  },
  {
    id: 1114,
    fi: "adverbit (aika, jo, vihdoin…) ",
    ru: "наречия: aika, jo, vihdoin…",
    en: "adverbs: aika, jo, vihdoin…",
    pos: "adv",
    topic: "служебные слова",
    image: "/cards/aikaonneksi.png",
    examples: [
      { fi: "aika", ru: "довольно; весьма" },
      { fi: "jo", ru: "уже" },
      { fi: "vihdoin", ru: "наконец" },
      { fi: "sillä aikaa", ru: "тем временем" },
      { fi: "onneksi", ru: "к счастью" },
      { fi: "välillä", ru: "иногда" },
    ],
  },
  {
    id: 1115,
    fi: "asiakirjat",
    ru: "документы",
    en: "documents",
    pos: "n",
    topic: "документы",
    image: "/cards/asiakirjat.png",
    examples: [
      { fi: "lomake", ru: "бланк, форма" },
      { fi: "ilmoitus", ru: "заявление/декларация" },
      { fi: "hakemus", ru: "заявка" },
      { fi: "valitus", ru: "жалоба" },
      { fi: "todistus", ru: "справка/сертификат" },
      { fi: "liite", ru: "приложение" },
      { fi: "korvaus", ru: "компенсация" },
      { fi: "vakuutus", ru: "страховка" },
      { fi: "lasku", ru: "счёт" },
    ],
  },
  {
    id: 1116,
    fi: "kortit ja luvat",
    ru: "карты и разрешения",
    en: "cards & permits",
    pos: "n",
    topic: "документы",
    image: "/cards/kortitjaluvat.png",
    examples: [
      { fi: "passi", ru: "паспорт" },
      { fi: "henkilökortti", ru: "удостоверение личности" },
      { fi: "ajokortti", ru: "водительские права" },
      { fi: "oleskelulupa", ru: "вид на жительство" },
    ],
  },
  {
    id: 1117,
    fi: "asiakaspalvelu",
    ru: "обслуживание клиентов",
    en: "customer service",
    pos: "n",
    topic: "сервис",
    image: "/cards/asiakaspalvelu.png",
    examples: [
      { fi: "toimipiste", ru: "офис, отделение" },
      { fi: "neuvonta", ru: "справка, консультация" },
      { fi: "virkailija", ru: "служащий, клерк" },
      { fi: "vuoronumero", ru: "номер в очереди" },
    ],
  },
  {
    id: 1118,
    fi: "virastot ja toimipisteet",
    ru: "учреждения и офисы",
    en: "offices & authorities",
    pos: "n",
    topic: "учреждения",
    image: "/cards/virastotjatoimipisteet.png",
    examples: [
      { fi: "maistraatti", ru: "магистрат" },
      { fi: "verotoimisto", ru: "налоговая" },
      { fi: "KELA (Kansaneläkelaitos)", ru: "соцстрах (Кела)" },
      { fi: "poliisiasema", ru: "полицейский участок" },
      { fi: "vakuutusyhtiö", ru: "страховая компания" },
      { fi: "terveyskeskus", ru: "медицинский центр" },
    ],
  },
  {
    id: 1119,
    fi: "laki ja oikeus",
    ru: "право и суд",
    en: "law & justice",
    pos: "n",
    topic: "право",
    image: "/cards/lakijaoikeus.png",
    examples: [
      { fi: "tuomari", ru: "судья" },
      { fi: "asianajaja", ru: "адвокат" },
      { fi: "syyttäjä", ru: "прокурор" },
      { fi: "kantaja", ru: "истец" },
      { fi: "syytetty", ru: "подсудимый" },
      { fi: "todistaja", ru: "свидетель" },
    ],
  },
  {
    id: 1120,
    fi: "ajanmääreet (frekvenssi)",
    ru: "наречия частоты",
    en: "frequency adverbs",
    pos: "adv",
    topic: "служебные слова",
    image: "/cards/hetiusein.png",
    examples: [
      { fi: "heti", ru: "сразу" },
      { fi: "yhtäkkiä", ru: "вдруг, внезапно" },
      { fi: "harvoin", ru: "редко" },
      { fi: "usein", ru: "часто" },
      { fi: "aina", ru: "всегда" },
      { fi: "ei koskaan", ru: "никогда" },
      { fi: "joskus", ru: "иногда" },
    ],
  },
  {
    id: 1121,
    fi: "avioliitto",
    ru: "брак, свадьба",
    en: "marriage",
    pos: "n",
    topic: "семья",
    image: "/cards/avioliitto.png",
    examples: [
      { fi: "aviomies", ru: "муж" },
      { fi: "aviovaimo", ru: "жена" },
      { fi: "aviopari", ru: "супружеская пара" },
      { fi: "hääpari", ru: "молодожёны" },
      { fi: "häät", ru: "свадьба" },
      { fi: "vihkisormus", ru: "обручальное кольцо" },
    ],
  },
  {
    id: 1122,
    fi: "avoliitto & suhteet",
    ru: "гражданский брак и отношения",
    en: "common-law & relationships",
    pos: "n",
    topic: "семья",
    image: "/cards/avoliitto.png",
    examples: [
      { fi: "avomies", ru: "сожитель (мужчина)" },
      { fi: "avovaimo", ru: "сожительница" },
      { fi: "poikaystävä", ru: "парень, бойфренд" },
      { fi: "tyttöystävä", ru: "девушка, гёрлфренд" },
      { fi: "miesystävä", ru: "мужчина-партнёр" },
      { fi: "naisystävä", ru: "женщина-партнёр" },
    ],
  },
  {
    id: 1123,
    fi: "juhlakalenteri",
    ru: "календарь праздников",
    en: "holiday calendar",
    pos: "n",
    topic: "праздники",
    image: "/cards/juhlakalenteri.png",
    examples: [
      { fi: "Uusivuosi 1.1.", ru: "Новый год 1.1" },
      { fi: "Ystävänpäivä 14.2.", ru: "День друзей 14.2" },
      { fi: "Laskiainen (helmikuussa)", ru: "Масленица (февраль)" },
      { fi: "Pääsiäinen (maalis–huhtikuussa)", ru: "Пасха (март–апрель)" },
      { fi: "Vappu 1.5.", ru: "Ваппу 1.5" },
      { fi: "Juhannus (kesäkuussa)", ru: "Мидсаммер, июнь" },
      { fi: "Itsenäisyyspäivä 6.12.", ru: "День независимости 6.12" },
      { fi: "Pikkujoulut (marras–joulukuussa)", ru: "предрождественские вечеринки" },
      { fi: "Joulu 24.12.", ru: "Рождество 24.12" },
    ],
  },
  {
    id: 1124,
    fi: "koulutus (tasot)",
    ru: "образование: уровни",
    en: "education: levels",
    pos: "n",
    topic: "образование",
    image: "/cards/koulutus.png",
    examples: [
      { fi: "esikoulu", ru: "детский сад / подготовка" },
      { fi: "peruskoulu", ru: "школа (основная)" },
      { fi: "lukio", ru: "лицей, старшая школа" },
      { fi: "ammattikoulu", ru: "профучилище" },
      { fi: "ammattikorkeakoulu", ru: "политех/унив. прикладных наук" },
      { fi: "yliopisto", ru: "университет" },
    ],
  },
  {
    id: 1125,
    fi: "koulutus: koe, arvosana, todistus",
    ru: "образование: экзамен, оценка, сертификат",
    en: "education: exam, grade, certificate",
    pos: "n",
    topic: "образование",
    image: "/cards/koulutus2.png",
    examples: [
      { fi: "koe; tentti", ru: "экзамен; тест" },
      { fi: "Vuoden aikana on kaksi koetta.", ru: "За год два экзамена." },
      { fi: "Uskon, että tentit menivät hyvin.", ru: "Думаю, экзамены прошли хорошо." },
      { fi: "arvosana", ru: "оценка" },
      { fi: "Arvosanat ovat hyvät.", ru: "Оценки хорошие." },
      { fi: "todistus", ru: "свидетельство, сертификат" },
      { fi: "Minä sain todistukseni.", ru: "Я получил(а) свой сертификат." },
    ],
  },
  {
    id: 1126,
    fi: "koulutus (pääsykoe, opinnot, tutkinto)",
    ru: "образование: вступительный, обучение, диплом",
    en: "education: entrance exam, studies, degree",
    pos: "n",
    topic: "образование",
    image: "/cards/koulutus_paasikoe_opinnot_tutkinto.png",
    examples: [
      { fi: "pääsykoe — entrance exam", ru: "вступительный экзамен" },
      { fi: "Yliopistokurssin pääsykoe on perjantaina.", ru: "Вступительный экзамен на университетский курс — в пятницу." },
      { fi: "opinnot — studies", ru: "обучение, учёба" },
      { fi: "Kaikki opinnot tehdään tietokoneella.", ru: "Всё обучение проводится на компьютере." },
      { fi: "tutkinto — degree", ru: "степень, диплом" },
      { fi: "Sinulla on ekonomin tutkinto Stanfordista.", ru: "У тебя диплом экономиста из Стэнфорда." },
    ],
  },
  {
    id: 1127,
    fi: "työnhaku",
    ru: "поиск работы",
    en: "job search",
    pos: "n",
    topic: "работа",
    image: "/cards/tyonhaku.png",
    examples: [
      { fi: "työhakemus — job application", ru: "заявление на работу" },
      { fi: "Teen työhakemusta.", ru: "Подаю заявление на работу." },
      { fi: "ansioluettelo — CV", ru: "резюме" },
      { fi: "Ansioluettelosi on tarpeeksi hyvä.", ru: "Твоё резюме достаточно хорошее." },
      { fi: "työhaastattelu — job interview", ru: "собеседование" },
      { fi: "Menen työhaastatteluun huomenna.", ru: "Завтра иду на собеседование." },
      { fi: "työkokemus — work experience", ru: "опыт работы" },
      { fi: "Mitä työkokemusta teillä on?", ru: "Какой у вас опыт работы?" },
      { fi: "työharjoittelu — internship", ru: "стажировка, производственная практика" },
      { fi: "Työharjoittelu on osa opintoja.", ru: "Практика является частью обучения." },
    ],
  },
];

/** Чип части речи */
function PosBadge({ pos }: { pos?: VocabEntry["pos"] }) {
  if (!pos) return null;
  const map: Record<string, string> = {
    n: "сущ.",
    v: "гл.",
    adj: "прил.",
    adv: "нар.",
    pron: "мест.",
    num: "числ.",
    prep: "предл.",
    part: "част.",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs border border-slate-300/70 dark:border-slate-700">
      {map[pos] ?? pos}
    </span>
  );
}

/** Маленькая утилита для речи */
const speak = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fi-FI"; // финская озвучка
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

/** утилы */
const shuffleArr = <T,>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map((x) => x[1]);

// Мини-заменитель FlipCard
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


function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // читаем topic/q из URL на первом рендере
  const initialTopic = (searchParams.get("topic") ?? "").trim();
  const initialQ = (searchParams.get("q") ?? "").trim();
  const initialSort = (searchParams.get("sort") ?? "relevance").trim();

  const [q, setQ] = useState(initialQ);
  const [topic, setTopic] = useState<string>(initialTopic);
  const [sort, setSort] = useState<"relevance" | "alpha" | "pos" | "shuffle">(
    (initialSort as any) || "relevance"
  );
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("fav_vocab");
      const parsed = raw ? JSON.parse(raw) : [];
      // На всякий случай оставляем только те id, которые есть в базе слов:
      return Array.isArray(parsed)
        ? parsed.filter((id: unknown) => VOCAB.some((v) => v.id === id))
        : [];
    } catch {
      return [];
    }
  });

  // UI-флаги — тоже сразу из localStorage
  const [onlyFavs, setOnlyFavs] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return !!JSON.parse(localStorage.getItem("dict_ui") || "{}").onlyFavs; }
    catch { return false; }
  });
  const [withImages, setWithImages] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return !!JSON.parse(localStorage.getItem("dict_ui") || "{}").withImages; }
    catch { return false; }
  });
  const [withExamples, setWithExamples] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return !!JSON.parse(localStorage.getItem("dict_ui") || "{}").withExamples; }
    catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "dict_ui",
        JSON.stringify({ onlyFavs, withImages, withExamples })
      );
    } catch {}
  }, [onlyFavs, withImages, withExamples]);

  // сохраняем избранное
  useEffect(() => {
    try {
      localStorage.setItem("fav_vocab", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // если URL-params меняются при навигации без перезагрузки — обновим стейт
  useEffect(() => {
    setTopic((searchParams.get("topic") ?? "").trim());
    setQ((searchParams.get("q") ?? "").trim());
    setSort(((searchParams.get("sort") ?? "relevance") as any) || "relevance");
    setPage(1);
  }, [searchParams]);

  // дебаунс-синк URL при изменении q/topic/sort
  const debounceRef = useRef<any>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (topic) p.set("topic", topic);
      if (sort && sort !== "relevance") p.set("sort", sort);
      router.replace(`${pathname}?${p.toString()}`);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [q, topic, sort, pathname, router]);

  // клавиши: / или s — фокус поиска; f — избранное; r — перемешать
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        (el as any)?.isContentEditable;
      if (!typing && (e.key === "/" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (!typing && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOnlyFavs((v) => !v);
      }
      if (!typing && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setSort("shuffle");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const topics = useMemo(
    () => Array.from(new Set(VOCAB.map((v) => v.topic))).sort(),
    []
  );

  const filteredBase = useMemo(() => {
    const t = q.trim().toLowerCase();
    const topicNorm = topic.trim().toLowerCase();
    let items = VOCAB.filter((v) => {
      const hitQ =
        !t ||
        v.fi.toLowerCase().includes(t) ||
        v.ru.toLowerCase().includes(t) ||
        (v.en ?? "").toLowerCase().includes(t);
      const hitTopic = !topicNorm || v.topic.toLowerCase() === topicNorm;
      return hitQ && hitTopic;
    });
    if (withImages) items = items.filter((v) => !!v.image);
    if (withExamples) items = items.filter((v) => !!v.examples?.length);

    if (onlyFavs) items = items.filter((v) => favorites.includes(v.id));

    if (sort === "alpha") items = [...items].sort((a, b) => a.fi.localeCompare(b.fi));
    if (sort === "pos")
      items = [...items].sort((a, b) => (a.pos || "z").localeCompare(b.pos || "z"));
    if (sort === "shuffle") items = shuffleArr(items);

    return items;
  }, [q, topic, sort, withImages, withExamples, onlyFavs, favorites]);

  const pageSize = 9;
  const visible = filteredBase.slice(0, page * pageSize);
  const canLoadMore = visible.length < filteredBase.length;

  const toggleFav = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // автоподгрузка по скроллу
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

  // копирование пары «fi — ru»
  const copyPair = async (w: VocabEntry) => {
    try {
      await navigator.clipboard.writeText(`${w.fi} — ${w.ru}${w.en ? ` — ${w.en}` : ""}`);
      setCopiedId(w.id);
      setTimeout(() => setCopiedId(null), 1000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_-10%,#dff0ff_0%,transparent_70%),radial-gradient(50%_30%_at_100%_0%,#eaf6ff_0%,transparent_60%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Словарь</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-prose">
          Тематические карточки со словами: поиск, фильтры, примеры, формы и озвучка.
        </p>

        {/* Панель управления */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr,auto,auto,auto]">
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Поиск: kirjoittaa / написать / write…  (нажми «/» или «S»)"
            className="flex-1 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 outline-none focus:ring-2 ring-sky-500"
            aria-label="Поиск по словарю"
          />

          <select
            value={topic}
            onChange={(e) => {
              setPage(1);
              setTopic(e.target.value);
            }}
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

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60"
            aria-label="Сортировка"
          >
            <option value="relevance">По релевантности</option>
            <option value="alpha">По алфавиту (FI)</option>
            <option value="pos">По части речи</option>
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
              title="Только избранное (F)"
            >
              <Star className="w-4 h-4" /> Избранное
            </button>
            <button
              className={`px-3 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 ${
                withImages
                  ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onClick={() => setWithImages((v) => !v)}
              title="Только с картинкой"
            >
              <ImageIcon className="w-4 h-4" /> Картинки
            </button>
            <button
              className={`px-3 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 ${
                withExamples
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onClick={() => setWithExamples((v) => !v)}
              title="Только с примерами"
            >
              <MessageSquareText className="w-4 h-4" /> Примеры
            </button>
          </div>
        </div>

        {/* Быстрые чипы тем */}
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.slice(0, 10).map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-2xl border text-sm hover:bg-white/60 dark:hover:bg-slate-900/40 ${
                topic === t
                  ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onClick={() => {
                setPage(1);
                setTopic(topic === t ? "" : t);
              }}
            >
              {t}
            </button>
          ))}
          {(topic || q) && (
            <button
              className="px-3 py-1.5 rounded-2xl border border-rose-300 text-rose-700 dark:border-rose-900/40 dark:text-rose-200"
              onClick={() => {
                setTopic("");
                setQ("");
                setPage(1);
              }}
              title="Сбросить фильтры"
            >
              <X className="inline w-4 h-4 mr-1" /> Сбросить
            </button>
          )}
        </div>
      </section>

      {/* Сетка карточек */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
        {visible.length === 0 && (
          <div className="col-span-full text-slate-500 dark:text-slate-400">
            Ничего не найдено. Попробуй изменить тему или запрос.
          </div>
        )}

        {visible.map((w) => {
          const fav = favorites.includes(w.id);
          const copied = copiedId === w.id;
          return (
            <FlipCard
              key={w.id}
              className="h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow transition"
              back={
                <div className="flex flex-col h-full overflow-hidden">
                  {w.image && (
                    <Image
                      src={w.image}
                      alt={w.fi}
                      width={600}
                      height={360}
                      className="w-full h-auto object-cover rounded-t-3xl"
                    />
                  )}

                  {/* ВАЖНО: min-h-0 + overflow-y-auto делает зону скроллируемой */}
                  <div className="p-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                      {w.examples && w.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Примеры</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {w.examples.map((ex, i) => (
                              <li key={i}>
                                <span className="font-medium">{ex.fi}</span>
                                {ex.ru ? <span className="opacity-80"> — {ex.ru}</span> : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {w.forms && w.forms.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Формы</h4>
                          <div className="flex flex-wrap gap-2">
                            {w.forms.map((f, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            >
              <>
                {w.image && (
                  <Image
                    src={w.image}
                    alt={w.fi}
                    width={600}
                    height={360}
                    className="w-full h-auto object-cover rounded-t-3xl"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PosBadge pos={w.pos} />
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                        {w.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className={`inline-flex items-center justify-center rounded-full p-1.5 border ${
                          fav
                            ? "border-amber-400 text-amber-500"
                            : "border-slate-300 text-slate-500 dark:border-slate-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(w.id);
                        }}
                        title={fav ? "Убрать из избранного" : "В избранное"}
                        aria-pressed={fav}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-full p-1.5 border border-slate-300 text-slate-500 dark:border-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(w.fi);
                        }}
                        title="Произнести по-фински"
                        aria-label="Озвучить"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        className={`inline-flex items-center justify-center rounded-full p-1.5 border ${
                          copied
                            ? "border-emerald-400 text-emerald-600"
                            : "border-slate-300 text-slate-500 dark:border-slate-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPair(w);
                        }}
                        title="Скопировать пару"
                        aria-label="Скопировать"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{w.fi}</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {w.ru}
                    {w.en ? ` • ${w.en}` : ""}
                  </p>

                  <div className="mt-auto pt-3 text-xs text-slate-500">
                    Нажми, чтобы увидеть примеры и формы
                  </div>
                </div>
              </>
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

      {/* Мини-квиз: угадай перевод (режимы) */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Мини-квиз</h3>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              На основе текущей выборки: {filteredBase.length} слов
              <button
                className="ml-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-900/40 text-xs"
                onClick={() => setSort("shuffle")}
                title="Перемешать список (R)"
              >
                <Shuffle className="w-4 h-4" /> Перемешать
              </button>
            </div>
          </div>

          <Quiz words={filteredBase} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* =========================
   QUIZ
========================= */

function Quiz({ words }: { words: VocabEntry[] }) {
  const pool = words.length ? words : VOCAB;
  const [mode, setMode] = useState<"reveal" | "choice">("choice"); // два режима
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    setIdx(0);
    setRevealed(false);
    setPicked(null);
    setScore(0);
    setAnswered(0);
  }, [words, mode]);

  const current = pool[(idx + pool.length) % pool.length];

  const options = useMemo(() => {
    const wrong = shuffleArr(pool.filter((w) => w.id !== current.id)).slice(0, 3);
    return shuffleArr([current, ...wrong]).map((w) => ({ id: w.id, label: w.ru }));
  }, [current, pool]);

  const next = () => {
    setIdx((i) => i + 1);
    setRevealed(false);
    setPicked(null);
  };

  const onPick = (id: number) => {
    if (picked !== null) return;
    setPicked(id);
    setAnswered((x) => x + 1);
    if (id === current.id) setScore((s) => s + 1);

    // Запишем попытку в глобальную историю
    try {
      const raw = localStorage.getItem(QUIZ_HISTORY_KEY) || "[]";
      const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      arr.unshift({
        at: Date.now(),
        quizId: "dictionary-mini",
        title: "Мини-квиз словаря",
        wordId: current.id,
        correct: id === current.id,
      });
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(arr.slice(0, 300)));
    } catch {}
  };

  return (
    <div className="mt-4 grid md:grid-cols-[1fr,auto] gap-4 items-start">
      <div>
        <div className="text-sm text-slate-500">Финское слово:</div>
        <div className="flex items-center gap-3 mt-1">
          <h4 className="text-3xl font-extrabold">{current.fi}</h4>
          <button
            className="inline-flex items-center justify-center rounded-full p-1.5 border border-slate-300 text-slate-500 dark:border-slate-700"
            onClick={() => speak(current.fi)}
            title="Произнести"
            aria-label="Произнести"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {mode === "reveal" ? (
          <div className="mt-2 text-slate-600 dark:text-slate-300">
            {revealed ? (
              <>
                <span className="font-medium">Ответ:</span> {current.ru}
                {current.en ? ` • ${current.en}` : ""}
              </>
            ) : (
              <span className="opacity-70">Нажми «Показать ответ»</span>
            )}
          </div>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const isChosen = picked === o.id;
              const isCorrect = picked !== null && o.id === current.id;
              const isWrong = isChosen && !isCorrect;
              return (
                <button
                  key={o.id}
                  onClick={() => onPick(o.id)}
                  className={[
                    "text-left px-3 py-2 rounded-xl border transition",
                    "hover:bg-slate-50 dark:hover:bg-slate-800",
                    isCorrect ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20" : "",
                    isWrong ? "border-rose-500 bg-rose-50/60 dark:bg-rose-900/20" : "border-slate-300 dark:border-slate-700",
                  ].join(" ")}
                  aria-pressed={isChosen}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 md:items-end">
        <div className="text-xs text-slate-500">
          Верно: <span className="font-semibold">{score}</span> / {answered}
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700"
            onClick={() => (mode === "reveal" ? setRevealed(true) : onPick(-1))}
          >
            {mode === "reveal" ? "Показать ответ" : "Пропустить"}
          </button>
          <button
            className="px-4 py-2 rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
            onClick={next}
          >
            Дальше <ArrowRight className="inline w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          Режим:
          <button
            className={`px-2 py-1 rounded-lg border text-xs ${
              mode === "choice"
                ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                : "border-slate-300 dark:border-slate-700"
            }`}
            onClick={() => setMode("choice")}
          >
            4 варианта
          </button>
          <button
            className={`px-2 py-1 rounded-lg border text-xs ${
              mode === "reveal"
                ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200"
                : "border-slate-300 dark:border-slate-700"
            }`}
            onClick={() => setMode("reveal")}
          >
            Показать ответ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DictionaryClient() {
  return <PageInner />;
}
