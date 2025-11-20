/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f0fdf4",
          700: "#15803d",
          900: "#166534",
        },
        'primary-soil': '#4FAF3B',
        'gradient-green': '#6FBF3C',
        'orange-primary': '#E86A1D',
        'cream': '#F8F6F0',
        'charcoal': '#1A1A1A',
        'leaf-light': '#A6D47A',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
