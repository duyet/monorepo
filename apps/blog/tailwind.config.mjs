import sharedConfig from "@duyet/tailwind-config/tailwind.config.mjs";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      // Card colors (ivory, oat, cream, cactus, sage, lavender, terracotta, coral)
      // are now defined in @duyet/tailwind-config/colors.js and automatically
      // available via sharedConfig
    },
  },
};
