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
          medium: '#f0eee6',
        },
        cactus: {
          DEFAULT: '#bcd1ca',
          light: '#d4e3de',
          medium: '#bcd1ca',
        },
        oat: {
          DEFAULT: '#e3dacc',
        },
        sage: {
          DEFAULT: '#b8ccc5',
        },
        lavender: {
          DEFAULT: '#c5c8dc',
        },
      },
    },
  },
}
