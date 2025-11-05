import baseConfig from '@duyet/tailwind-config'

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        ...baseConfig.theme?.extend?.colors,
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
