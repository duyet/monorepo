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
  safelist: [
    "bg-ivory",
    "bg-oat-light",
    "bg-cream",
    "bg-cactus-light",
    "bg-sage-light",
    "bg-lavender-light",
    "bg-terracotta-light",
    "bg-coral-light",
    "bg-white",
    "text-neutral-900",
    "text-neutral-700",
    "border-neutral-200",
    "hover:border-neutral-300",
    {
      pattern:
        /^bg-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)(-light|-medium)?$/,
    },
    {
      pattern: /^text-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)$/,
    },
  ],
};
