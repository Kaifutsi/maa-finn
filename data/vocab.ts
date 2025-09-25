// /data/vocab.ts
export type VocabEntry = {
  id: number;
  fi: string;
  ru: string;
  en?: string;
  pos?: "n" | "v" | "adj" | "adv" | "pron" | "num" | "prep" | "part";
  topic: string;
  image?: string;      // обычная мини-картинка для карточки
  banner?: string;     // БАННЕР (как на скринах)
  examples?: { fi: string; ru?: string }[];
  forms?: string[];
};

export const vocab: VocabEntry[] = [
  { id: 101, fi: "herätä",   ru: "просыпаться", topic: "глаголы", banner: "/cards/vherata.png" },
  { id: 102, fi: "nukkua",  ru: "спать",                topic: "глаголы", banner: "/cards/vnukkua.png" },
  { id: 103, fi: "juhlia",ru: "праздновать",            topic: "глаголы", banner: "/cards/vjuhlia.png" },
  { id: 104, fi: "tietää",  ru: "знать",               topic: "глаголы", banner: "/cards/vtietaa.png" },
  { id: 105, fi: "pukea",   ru: "одевать",             topic: "глаголы", banner: "/cards/vpukea.png" },
  { id: 106, fi: "ottaa",   ru: "брать",               topic: "глаголы", banner: "/cards/vottaa.png" },
  { id: 107, fi: "onkia",   ru: "удить",               topic: "глаголы", banner: "/cards/vonkia.png" },
  { id: 108, fi: "lukea",   ru: "читать",              topic: "глаголы", banner: "/cards/vlukea.png" },
  { id: 109, fi: "lentää",  ru: "летать",              topic: "глаголы", banner: "/cards/vlentaa.png" },
];
