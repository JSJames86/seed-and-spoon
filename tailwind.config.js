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
          // Kept in sync with --green-primary in globals.css (darkened for
          // WCAG AA text contrast — see comment there).
          primary: "#397E2A",
          700: "#15803d",
          900: "#166534",
          leaf: {
            light: "#A6D47A",
            mid: "#6FBF3C",
          },
        },
        orange: {
          // Kept in sync with --orange-primary in globals.css (darkened for
          // WCAG AA text contrast — see comment there).
          primary: "#B95213",
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
        // Top-level alias so `text-cream`/`border-cream`/opacity variants
        // (e.g. text-cream/90) resolve — `neutral.cream` above only ever
        // generated `text-neutral-cream`, so plain `text-cream` (used in
        // Header.jsx's nav hover state and the campaigns pages) silently
        // rendered as no color at all.
        cream: "#F8F6F0",
        // Legacy tokens referenced by older pages (login, admin, profile,
        // password reset, campaigns, Header) — aliased to the same brand
        // green already used by Button.jsx's primary variant / forest-mid,
        // since they were being used as undefined classes (no color at all).
        "primary-soil": "#4FAF3B",
        "gradient-green": "#2D6A4F",
        // SpoonAssist glassmorphism palette (scoped to /spoonassist)
        spoon: {
          ink: "#1B241F",
          subtext: "#5C6A62",
          mint: "#1F9D6B",
          "mint-tint": "#DDF2E7",
          warning: "#E8A13D",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        // SpoonAssist type system
        sora: ["var(--font-sora)", "sans-serif"],
        "spoon-sans": ["var(--font-spoon-inter)", "sans-serif"],
      },
      boxShadow: {
        'green-glow': '0 4px 14px rgba(79, 175, 59, 0.3)',
        'green-glow-lg': '0 6px 20px rgba(79, 175, 59, 0.4)',
        'orange-glow': '0 4px 20px rgba(232, 106, 29, 0.3)',
        'orange-glow-lg': '0 6px 30px rgba(232, 106, 29, 0.5)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 15px 40px rgba(0, 0, 0, 0.15)',
        'spoon-glass': '0 6px 24px rgba(27, 36, 31, 0.07)',
      },
      borderRadius: {
        '4xl': '30px',
        'spoon-card': '22px',
        'spoon-input': '17px',
      },
    },
  },
  plugins: [],
};
