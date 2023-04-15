const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './apps/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
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
    fontFamily: {
      sans: ['var(--font-sans)', ...fontFamily.sans],
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'none',
              textDecorationThickness: 'from-font',
              textOverflow: 'ellipsis',
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
              textDecoration: 'underline'
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
