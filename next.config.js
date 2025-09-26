/** @type {import('next').NextConfig} */
const repo = "maa-finn";

// В CI стоит CUSTOM_DOMAIN=www.maafinn.com → без basePath/assetPrefix.
// Если деплоишь на kaifutsi.github.io/maa-finn (без кастомного домена) — убери CUSTOM_DOMAIN.
const usingCustomDomain = !!process.env.CUSTOM_DOMAIN;

const nextConfig = {
  // Генерируем статический сайт (GitHub Pages / Vercel Static)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,

  // Префиксы для GitHub Pages
  basePath: usingCustomDomain ? "" : `/${repo}`,
  assetPrefix: usingCustomDomain ? "" : `/${repo}/`,

  // Заголовки для cross-origin isolation (WebLLM/WebGPU/WASM + потоки)
  // ⚠ Работает на Vercel/серверной раздаче. На GitHub Pages кастомные заголовки задать нельзя.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // включает изоляцию окна → обязателен для SharedArrayBuffer/потоков
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // требует, чтобы встраиваемые ресурсы были с CORS/CORP
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          // позволяем нашим статикам быть использованными кросс-сайтом (например, /models/*)
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },

          // полезные доп. заголовки
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },

      // Отдаём собственные файлы модели с CORP, чтобы их можно было встраивать при COEP
      {
        source: "/models/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
