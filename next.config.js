/** @type {import('next').NextConfig} */
const repo = "maa-finn";
// В CI стоит CUSTOM_DOMAIN=www.maafinn.com → без basePath/assetPrefix.
// Если деплоишь на kaifutsi.github.io/maa-finn (без кастомного домена) — убери CUSTOM_DOMAIN.
const usingCustomDomain = !!process.env.CUSTOM_DOMAIN;

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,

  basePath: usingCustomDomain ? "" : `/${repo}`,
  assetPrefix: usingCustomDomain ? "" : `/${repo}/`,

};

module.exports = nextConfig;
