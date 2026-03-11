import config from "@duyet/tailwind-config/tailwind.config.mjs";

/** @type {import('tailwindcss').Config} */
export default {
  ...config,
  safelist: [
    ...(config.safelist || []),
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
