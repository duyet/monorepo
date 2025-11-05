import sharedConfig from '@duyet/tailwind-config/tailwind.config.mjs'

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
        'claude-peach': '#f5dcd0',
        'claude-yellow': '#f0d9a8',
        'claude-mint': '#a8d5ba',
        'claude-lavender': '#c5c5ff',
        'claude-coral': '#ff9999',
        'claude-sky': '#b3d9ff',
      },
    },
  },
}
