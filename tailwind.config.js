const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Path to the tremor module
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  variants: {
    extend: {
      opacity: ['disabled'],
      typography: ['dark'],
    },
    typography: ['dark'],
  },
  safelist: [
    {
      pattern: /hljs+/,
    },
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.black.100'),
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'none',
              textDecorationThickness: 'from-font',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            h1: {
              fontWeight: theme('fontWeight.semibold'),
              fontSize: theme('fontSize.3xl'),
              marginTop: theme('spacing.10'),
            },
          },
        },
        dark: {
          css: {
            a: {
              color: theme('colors.white'),
              textDecoration: 'underline',
            },
          },
        },
      }),
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
  darkMode: ['class', 'html[class~="dark"]'],
}
