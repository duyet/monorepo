const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './apps/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  safelist: [
    {
      pattern: /hljs+/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, sans-serif',
          ...fontFamily.sans,
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#222',
            a: {
              color: '#08f',
            },
          },
        },
      },
    },
    hljs: {
      theme: 'night-owl',
      custom: {
        base: {
          background: 'transparent',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-highlightjs'),
  ],
}
