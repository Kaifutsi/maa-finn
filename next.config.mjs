/** @type {import('next').NextConfig} */
const repo = "maa-finn";

// Кастомный домен — без basePath/assetPrefix
const usingCustomDomain = !!process.env.CUSTOM_DOMAIN;
// Заголовки включаем только если ENABLE_HEADERS=1
const enableHeaders = process.env.ENABLE_HEADERS === "1";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,

  basePath: usingCustomDomain ? "" : `/${repo}`,
  assetPrefix: usingCustomDomain ? "" : `/${repo}/`,
};

if (enableHeaders) {
  nextConfig.headers = async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ],
    },
    {
      source: "/models/:path*",
      headers: [
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
      ],
    },
  ];
}

export default nextConfig;
