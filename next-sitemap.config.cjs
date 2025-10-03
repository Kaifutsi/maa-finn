/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.maafinn.com",
  generateRobotsTxt: true,   // создаст robots.txt
  exclude: ["/api/*"],       // API не индексируем
  changefreq: "weekly",
  priority: 0.7,
  outDir: "out",             // положит sitemap/robots в папку экспорта
  sitemapSize: 5000
};
