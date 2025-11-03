import sharedConfig from '@duyet/tailwind-config/tailwind.config.mjs'

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        ivory: {
          DEFAULT: '#f5f3ef',
          medium: '#f0eee6',
          light: '#f9f8f5',
        },
        cactus: {
          DEFAULT: '#bcd1ca',
          light: '#d4e3de',
          medium: '#bcd1ca',
        },
        oat: {
          DEFAULT: '#e3dacc',
          light: '#ebe5db',
        },
        sage: {
          DEFAULT: '#b8ccc5',
          light: '#d0ddd8',
        },
        lavender: {
          DEFAULT: '#c5c8dc',
          light: '#dfe0ec',
        },
        terracotta: {
          DEFAULT: '#e07856',
          light: '#f4b8a0',
          medium: '#e89879',
        },
        coral: {
          DEFAULT: '#f39c7a',
          light: '#ffc4a8',
        },
        cream: {
          DEFAULT: '#faf8f3',
          warm: '#f7f4ee',
        },
      },
    },
  },
}
