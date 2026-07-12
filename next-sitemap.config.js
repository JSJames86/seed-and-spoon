/** @type {import('next-sitemap').IConfig} */

// Auth-gated, invite-token-gated, or otherwise internal routes. Kept out of
// the generated sitemap.xml and disallowed in robots.txt — this is the
// single source of truth for both.
const nonPublicPaths = [
  // Account auth flows
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
  // Staff/board admin panels (auth-gated)
  '/admin',
  '/admin/*',
  '/messages',
  '/documents',
  '/volunteer/admin',
  '/governance/*',
  // Token-based forms scoped to a specific invited person/pilot cohort,
  // not organic search content
  '/invite',
  '/enrollment',
  '/volunteer/onboard',
  '/volunteer/onboard/*',
  '/survey',
];

module.exports = {
  siteUrl: 'https://seedandspoon.org',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: nonPublicPaths,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: nonPublicPaths,
      },
    ],
  },
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
