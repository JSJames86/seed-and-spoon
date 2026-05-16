/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://seedandspoon.org',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/profile/*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/reset-password/*',
    '/api/*',
    '/campaigns/create',
    '/thank-you',
  ],
  transform: async (config, path) => {
    // Give the homepage maximum priority
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0 };
    }
    // Higher priority for key conversion pages
    if (['/donate', '/volunteer', '/get-help', '/causes'].includes(path)) {
      return { loc: path, changefreq: 'weekly', priority: 0.9 };
    }
    return { loc: path, changefreq: config.changefreq, priority: config.priority };
  },
};
