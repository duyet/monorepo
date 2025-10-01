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
      },
    },
  },
}
