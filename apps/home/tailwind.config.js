const config = require("@duyet/tailwind-config/tailwind.config.mjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...config.theme,
    extend: {
      ...config.theme?.extend,
      // Claude's color palette and card colors are now defined in shared config:
      // - @duyet/tailwind-config/claude.theme.js (claude-*, claude-gray-*)
      // - @duyet/tailwind-config/colors.js (ivory, oat, cream, cactus, sage, lavender, terracotta, coral)
      // All colors are automatically available via config.theme?.extend?.colors
      colors: {
        ...config.theme?.extend?.colors,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  safelist: [
    // Card color backgrounds
    "bg-ivory",
    "bg-oat-light",
    "bg-cream",
    "bg-cactus-light",
    "bg-sage-light",
    "bg-lavender-light",
    "bg-terracotta-light",
    "bg-coral-light",
    "bg-white",
    // Text colors
    "text-neutral-900",
    "text-neutral-700",
    // Border colors
    "border-neutral-200",
    "hover:border-neutral-300",
    // Pattern-based safelist for all color variants
    {
      pattern:
        /^bg-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)(-light|-medium)?$/,
    },
    {
      pattern: /^text-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)$/,
    },
  ],
};
