/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
  },
  experimental: {
    // Inlines above-the-fold CSS and defers the rest, removing the
    // render-blocking stylesheet request Lighthouse flags on mobile.
    optimizeCss: true,
  },
  async redirects() {
    return [
      {
        source: '/partners/corporate',
        destination: '/causes/pantry-partners',
        permanent: true,
      },
      {
        source: '/reports/seed-spoon-impact-2024.pdf',
        destination: '/resources/reports',
        permanent: true,
      },
      {
        source: '/reports',
        destination: '/resources/reports',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Sitemap files must be served as text/xml so browsers and Google
      // Search Console parse them as XML rather than rendering plain text.
      // The global X-Content-Type-Options: nosniff rule below enforces strict
      // MIME handling, so the Content-Type must be set explicitly here first.
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "text/xml; charset=utf-8",
          },
        ],
      },
      {
        source: "/sitemap-:index(\\d+).xml",
        headers: [
          {
            key: "Content-Type",
            value: "text/xml; charset=utf-8",
          },
        ],
      },
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Long-lived cache for Next.js static chunks (content-hashed filenames)
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Long-lived cache for public static assets (images, fonts, documents)
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/media/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/documents/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
