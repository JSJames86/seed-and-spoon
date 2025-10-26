/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Vercel handles static export automatically, no need for output: 'export'
}

module.exports = nextConfig
