import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <>
      {/* FAQ JSON-LD для расширенных сниппетов в выдаче */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Как начать учить финский язык на MaaFinn?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Откройте разделы «Грамматика», «Словарь» или «Тесты». Для практики произношения используйте тренажёр, а быстрые вопросы задавайте ИИ-помощнику."
                }
              },
              {
                "@type": "Question",
                "name": "Сколько стоит пользоваться сервисом?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Базовый доступ бесплатный. Для ИИ-помощника доступно 5 бесплатных запросов в месяц."
                }
              },
              {
                "@type": "Question",
                "name": "Подойдёт ли MaaFinn для уровня A1–A2?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Да. В сервисе есть карточки и пояснения, ориентированные на начинающих, с простыми примерами и упражнениями."
                }
              }
            ]
          }),
        }}
      />
      <Suspense fallback={<div className="p-6">Загрузка…</div>}>
        <HomeClient />
      </Suspense>
    </>
  );
}
