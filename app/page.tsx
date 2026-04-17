import type { Metadata } from "next";
import { Suspense } from "react";

import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Финский язык онлайн - грамматика, словарь, тесты и тренажёры",
  description:
    "MaaFinn - онлайн-платформа для изучения финского языка. Грамматика, словарь, карточки, тесты, тренажёры и ИИ-помощник для начинающих.",
  alternates: {
    canonical: "https://www.maafinn.com",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Как начать учить финский язык на MaaFinn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Откройте разделы «Грамматика», «Словарь» или «Тесты». Для практики произношения используйте тренажёр, а быстрые вопросы задавайте ИИ-помощнику.",
      },
    },
    {
      "@type": "Question",
      name: "Сколько стоит пользоваться сервисом?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Базовый доступ бесплатный. Для ИИ-помощника доступно 5 бесплатных запросов в месяц.",
      },
    },
    {
      "@type": "Question",
      name: "Подойдёт ли MaaFinn для уровня A1-A2?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да. В сервисе есть карточки и пояснения, ориентированные на начинающих, с простыми примерами и упражнениями.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <Suspense
        fallback={
          <main className="flex min-h-[60vh] items-center justify-center px-6">
            <div className="text-sm text-zinc-500">Загрузка...</div>
          </main>
        }
      >
        <HomeClient />
      </Suspense>
    </>
  );
}
