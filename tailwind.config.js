/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f0fdf4",
          primary: "#4FAF3B",
          700: "#15803d",
          900: "#166534",
          leaf: {
            light: "#A6D47A",
            mid: "#6FBF3C",
          },
        },
        orange: {
          primary: "#E86A1D",
          500: "#FFA500",
        },
        forest: {
          dark: "#1B4332",
          mid: "#2D6A4F",
        },
        neutral: {
          cream: "#F8F6F0",
          charcoal: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'green-glow': '0 4px 14px rgba(79, 175, 59, 0.3)',
        'green-glow-lg': '0 6px 20px rgba(79, 175, 59, 0.4)',
        'orange-glow': '0 4px 20px rgba(232, 106, 29, 0.3)',
        'orange-glow-lg': '0 6px 30px rgba(232, 106, 29, 0.5)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 15px 40px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        '4xl': '30px',
      },
    },
  },
  plugins: [],
};
