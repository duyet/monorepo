import sharedConfig from "@duyet/tailwind-config/tailwind.config.mjs";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme?.extend,
      colors: {
        ...sharedConfig.theme?.extend?.colors,
        // Claude-inspired color palette
        "claude-peach": "#ffc9a0",
        "claude-yellow": "#f5cc70",
        "claude-mint": "#8fd4ab",
        "claude-lavender": "#b8b5ff",
        "claude-coral": "#ff8585",
        "claude-sky": "#90c8ff",
        "claude-orange": "#D97757",
        "claude-copper": "#CC785C",
        "claude-cream": "#FBF7F0",
        "claude-beige": "#F4EFE6",
        "claude-tan": "#E6D9C9",
      },
    },
  },
};
