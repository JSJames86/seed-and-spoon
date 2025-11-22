/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/spoonassist/:path*',
        has: [
          {
            type: 'host',
            value: 'spoonassist.seedandspoon.org',
          },
        ],
      },
      {
        source: '/',
        destination: '/spoonassist',
        has: [
          {
            type: 'host',
            value: 'spoonassist.seedandspoon.org',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;