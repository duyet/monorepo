/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Anthropic-inspired color palette
        ivory: {
          DEFAULT: "#f5f3ef",
          medium: "#f0eee6",
          light: "#f9f8f5",
        },
        cactus: {
          DEFAULT: "#bcd1ca",
          light: "#d4e3de",
          medium: "#bcd1ca",
        },
        oat: {
          DEFAULT: "#e3dacc",
          light: "#ebe5db",
        },
        sage: {
          DEFAULT: "#b8ccc5",
          light: "#d0ddd8",
        },
        lavender: {
          DEFAULT: "#c5c8dc",
          light: "#dfe0ec",
        },
        terracotta: {
          DEFAULT: "#e07856",
          light: "#f4b8a0",
          medium: "#e89879",
        },
        coral: {
          DEFAULT: "#f39c7a",
          light: "#ffc4a8",
        },
        cream: {
          DEFAULT: "#faf8f3",
          warm: "#f7f4ee",
        },
      },
    },
  },
  plugins: [],
};
