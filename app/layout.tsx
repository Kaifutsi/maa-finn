import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import YandexMetrika from "@/components/YandexMetrika";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "MaaFinn";
const SITE_URL = "https://www.maafinn.com";
const SITE_DESCRIPTION =
  "Учите финский легко: карточки, грамматика, словарь, тесты и тренажёры. MaaFinn — бесплатный онлайн-помощник для изучения финского языка.";
const OG_IMAGE = "/logo_maafinn.JPG";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "MaaFinn — Финский язык онлайн",
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  keywords: [
    "финский язык",
    "учить финский",
    "финский онлайн",
    "финский словарь",
    "грамматика финского",
    "тесты по финскому",
    "изучение финского языка",
    "финский для начинающих",
  ],

  applicationName: SITE_NAME,

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "MaaFinn — Финский язык онлайн",
    description:
      "Карточки, словарь, грамматика и тренажёры для изучения финского языка.",
    locale: "ru_RU",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "MaaFinn — Финский язык онлайн",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MaaFinn — Финский язык онлайн",
    description:
      "Карточки, словарь, грамматика и тренажёры для изучения финского языка.",
    images: [OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${OG_IMAGE}`,
  description:
    "Изучайте финский язык онлайн: карточки, грамматика, словарь, тесты и тренажёры.",
  sameAs: ["https://www.instagram.com/maa__finn"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>

      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-white text-zinc-900 antialiased",
          "selection:bg-emerald-200 selection:text-zinc-900",
        ].join(" ")}
      >
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center px-6 text-sm text-zinc-500">
              Загрузка...
            </div>
          }
        >
          <div className="min-h-screen">{children}</div>
          <YandexMetrika />
        </Suspense>
      </body>
    </html>
  );
}
