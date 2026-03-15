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
    // Badge background colors (from getLicenseColor, getTypeColor in lib/utils.ts)
    "bg-sage-light",
    "bg-coral-light",
    "bg-lavender-light",
    "bg-terracotta-light",
    "bg-oat-light",
    // Badge text colors
    "text-emerald-800",
    "text-red-800",
    "text-indigo-800",
    "text-orange-800",
    "text-neutral-700",
    // Badge border colors
    "border-sage",
    "border-coral",
    "border-lavender",
    "border-terracotta",
    "border-oat",
    // Dark mode badge variants
    "dark:bg-emerald-950",
    "dark:text-emerald-300",
    "dark:border-emerald-800",
    "dark:bg-red-950",
    "dark:text-red-300",
    "dark:border-red-800",
    "dark:bg-indigo-950",
    "dark:text-indigo-300",
    "dark:border-indigo-800",
    "dark:bg-orange-950",
    "dark:text-orange-300",
    "dark:border-orange-800",
    "dark:bg-neutral-800",
    "dark:text-neutral-300",
    "dark:border-neutral-700",
    "dark:border-neutral-600",
  ],
};
