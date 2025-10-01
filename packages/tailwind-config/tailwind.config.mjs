import merge from 'deepmerge'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette.js'

import { theme as tremorTheme } from './tremor.theme.js'
import { theme as shadcnTheme } from './shadcn.theme.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Related path
    '../../apps/*/{app,components}/*.{js,ts,jsx,tsx}',
    '../../apps/*/{app,components}/**/*.{js,ts,jsx,tsx}',
    '../../apps/*/components/ui/**/*.{js,ts,jsx,tsx}',
    '../../packages/{components,libs}/*.{js,ts,jsx,tsx}',
    '../../packages/components/ui/*.{js,ts,jsx,tsx}',
    // Path to the tremor module
    '../../node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}',
    '../../packages/components/node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}',
  ],
  variants: {
    extend: {
      opacity: ['disabled'],
      typography: ['dark'],
    },
    typography: ['dark'],
  },
  theme: {
    extend: {
      ...merge.all([
        tremorTheme,
        shadcnTheme,
        {
          colors: {
            gold: '#ffd465',
            // Anthropic-inspired beige palette
            beige: {
              50: '#FAF8F3',   // Lightest cream
              100: '#F5F1E8',  // Primary background
              200: '#EDE9DC',  // Secondary background
              300: '#E8E3D6',  // Light sand
              400: '#E0DCD0',  // Borders
              500: '#D4A574',  // Accent terracotta light
              600: '#C89865',  // Accent terracotta
              700: '#8A8580',  // Text secondary
              800: '#6B6861',  // Text medium
              900: '#3E3B36',  // Text primary
              950: '#2D2A26',  // Text deep brown
            },
            // Dark mode warm browns
            brown: {
              50: '#F5F1E8',   // Warm off-white for dark mode text
              100: '#E8E3D6',
              200: '#8A8580',
              300: '#6B6861',
              400: '#524F4A',
              500: '#3E3B36',
              600: '#2D2A26',
              700: '#252320',
              800: '#1A1816',  // Deep warm brown for dark bg
              900: '#0F0E0D',
            },
          },
        },
      ]),

      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.beige.900'),
            a: {
              color: theme('colors.beige.600'),
              textDecoration: 'none',
              textDecorationThickness: 'from-font',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              overflowWrap: 'break-word',
              whiteSpace: 'break-spaces',
              wordBreak: 'break-word',
              '&:hover': {
                textDecoration: 'underline',
                color: theme('colors.beige.500'),
              },
            },
            'a[href^="https://"]': {
              '&::after': {
                content: '"↗︎"',
              },
            },
            h1: {
              fontWeight: theme('fontWeight.semibold'),
              fontSize: theme('fontSize.3xl'),
              marginTop: theme('spacing.10'),
              color: theme('colors.beige.950'),
              letterSpacing: '-0.01em',
            },
            h2: {
              color: theme('colors.beige.950'),
              letterSpacing: '-0.01em',
            },
            h3: {
              color: theme('colors.beige.900'),
            },
            pre: {
              padding: 5,
              backgroundColor: theme('colors.beige.200'),
              borderRadius: theme('borderRadius.lg'),
            },
            code: {
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              color: theme('colors.beige.950'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.brown.50'),
            a: {
              color: theme('colors.beige.500'),
              textDecoration: 'underline',
              '&:hover': {
                color: theme('colors.beige.400'),
              },
            },
            h1: {
              color: theme('colors.brown.50'),
            },
            h2: {
              color: theme('colors.brown.50'),
            },
            h3: {
              color: theme('colors.brown.100'),
            },
            pre: {
              backgroundColor: theme('colors.brown.700'),
            },
            code: {
              color: theme('colors.brown.50'),
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
  safelist: [
    {
      pattern: /hljs+/,
    },
    ...require('./tremor.theme.js').safelist,
  ],
  plugins: [
    require('tailwind-highlightjs'),
    ...require('./tremor.theme.js').plugins,
    addVariablesForColors,
  ],
  darkMode: ['class', 'html[class~="dark"]'],
}

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
// https://ui.aceternity.com/components/background-boxes
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme('colors'))
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  )

  addBase({
    ':root': newVars,
  })
}
