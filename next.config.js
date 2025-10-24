/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Your repo name on GitHub (this must match exactly)
const repoName = 'seed-and-spoon';
const basePath = isProd ? `/${repoName}` : '';

module.exports = {
  output: 'export',             // enables static export
  basePath,                     // prefix routes for GitHub Pages
  assetPrefix: basePath + '/',  // ensures assets load correctly
  images: { unoptimized: true }, // allows Next/Image to work on static hosts
  trailingSlash: true,          // safer for GitHub Pages
};
