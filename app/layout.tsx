// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import YandexMetrika from "@/components/YandexMetrika";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Базовый URL сайта — важно для корректных каноникалов/OG
  metadataBase: new URL("https://www.maafinn.com"),

  title: "MaaFinn — Финский язык онлайн 🇫🇮",
  description:
    "Учите финский легко: карточки, грамматика, словарь, тесты и тренажёры. MaaFinn — бесплатный онлайн-помощник для изучения финского языка.",
  keywords: [
    "финский язык",
    "учить финский",
    "финский онлайн",
    "финский словарь",
    "грамматика финского",
    "тесты по финскому",
    "изучение финского языка",
  ],
  alternates: {
    canonical: "https://www.maafinn.com",
  },
  openGraph: {
    type: "website",
    url: "https://www.maafinn.com",
    siteName: "MaaFinn",
    title: "MaaFinn — Финский язык онлайн 🇫🇮",
    description:
      "Карточки, словарь, грамматика и тренажёры для изучения финского языка.",
    images: [
      {
        url: "/logo_maafinn.JPG", // положи 1200x630 в public/og-cover.png
        width: 1200,
        height: 630,
        alt: "MaaFinn — Финский язык онлайн",
      },
    ],
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaaFinn — Финский язык онлайн",
    description:
      "Карточки, словарь, грамматика и тренажёры для изучения финского языка.",
    images: ["/logo_maafinn.JPG"],
  },
  // Можно позже добавить verification для сервисов вебмастеров
  // verification: { google: "..." },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        {/* Организация/образовательный сайт */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "MaaFinn",
              "url": "https://www.maafinn.com",
              "logo": "https://www.maafinn.com/logo.png",
              "description":
                "Изучайте финский язык онлайн: карточки, грамматика, словарь, тесты и тренажёры.",
              "sameAs": [
                "https://www.instagram.com/maa__finn"
              ]
            }),
          }}
        />
        {/* Схема сайта с action для поиска (улучшает Sitelinks Search Box) */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://www.maafinn.com",
              "name": "MaaFinn",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.maafinn.com/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={<div className="p-6">Загрузка…</div>}>
          {children}
          <YandexMetrika />
        </Suspense>
      </body>
    </html>
  );
}
