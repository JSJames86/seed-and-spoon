/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-soil': '#233D00',
        'gradient-start': '#226214',
        'gradient-end': '#43CC25',
        'harvest-orange': '#FF7A3D',
        'leaf-light': '#A6D47A',
        'leaf-mid': '#6FBF3C',
        'cream': '#F8F6F0',
        'charcoal': '#1A1A1A',
        // Seed & Spoon brand colors
        'brand-orange': '#EA802F',
        'brand-blue': '#0B88C2',
        'brand-green': '#77A462',
        'brand-cream': '#F9EED4',
        'brand-navy': '#02538A',
        'brand-sky': '#5CC8EE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
