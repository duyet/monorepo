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
            color: '#222',
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'none',
              textDecorationThickness: 'from-font',
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
            color: theme('colors.gray[300]'),
            '[class~="lead"]': { color: theme('colors.gray[400]') },
            a: { color: theme('colors.gray[100]') },
            strong: { color: theme('colors.gray[100]') },
            'ul > li::before': { backgroundColor: theme('colors.gray[700]') },
            hr: { borderColor: theme('colors.gray[800]') },
            blockquote: {
              color: theme('colors.gray[100]'),
              borderLeftColor: theme('colors.gray[800]'),
            },
            h1: { color: theme('colors.gray[100]') },
            h2: { color: theme('colors.gray[100]') },
            h3: { color: theme('colors.gray[100]') },
            h4: { color: theme('colors.gray[100]') },
            code: { color: theme('colors.gray[100]') },
            'a code': { color: theme('colors.gray[100]') },
            pre: {
              color: theme('colors.gray[200]'),
              backgroundColor: theme('colors.gray[800]'),
            },
            thead: {
              color: theme('colors.gray[100]'),
              borderBottomColor: theme('colors.gray[700]'),
            },
            'tbody tr': { borderBottomColor: theme('colors.gray[800]') },
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
