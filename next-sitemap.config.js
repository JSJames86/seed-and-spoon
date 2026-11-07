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
  // Link-in-bio hub — a UTM-tracked redirect surface for social profiles,
  // not organic search content
  '/links',
];

const statusGatedCampaignPaths = ['/campaigns/five-loaves', '/campaigns/formula-supplement-pilot'];

// robots.txt matches by prefix, so a bare '/documents' would also block the
// public funder PDFs under /documents/*.pdf (capability statement, research
// paper). Anchor it so only the auth-gated document library page is blocked.
const robotsDisallow = nonPublicPaths.map((p) => (p === '/documents' ? '/documents$' : p));

module.exports = {
  siteUrl: 'https://seedandspoon.org',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [...nonPublicPaths, ...statusGatedCampaignPaths],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: robotsDisallow,
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
  // /blog/[slug] is a dynamic route with no generateStaticParams, so the
  // build manifest next-sitemap crawls never contains individual post
  // paths — list published posts explicitly instead.
  additionalPaths: async (config) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return [];
    const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

    const fetchRows = async (query) => {
      try {
        const res = await fetch(`${url}/rest/v1/${query}`, { headers });
        return res.ok ? await res.json() : [];
      } catch {
        return [];
      }
    };

    const [posts, campaigns] = await Promise.all([
      fetchRows('posts?select=slug,updated_at&status=eq.published'),
      fetchRows('campaigns?select=slug,updated_at&status=eq.active'),
    ]);

    const entries = [
      ...posts.map((p) => ({ path: `/blog/${p.slug}`, updated_at: p.updated_at })),
      ...campaigns.map((c) => ({ path: `/campaigns/${c.slug}`, updated_at: c.updated_at })),
    ];
    return Promise.all(
      entries.map(({ path, updated_at }) =>
        config.transform(config, path).then((entry) => ({
          ...entry,
          lastmod: updated_at || entry.lastmod,
        }))
      )
    );
  },
};
