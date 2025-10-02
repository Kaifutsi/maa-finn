/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.maafinn.com",
  generateRobotsTxt: true,      // сгенерит robots.txt
  exclude: ["/api/*"],
  changefreq: "weekly",
  priority: 0.7,
};
