/** @type {import('next').NextConfig} */
const repo = 'maa-finn';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : ''
  }
};

module.exports = nextConfig;
