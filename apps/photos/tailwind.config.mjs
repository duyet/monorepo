/** @type {import('tailwindcss').Config} */
export default {
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
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
