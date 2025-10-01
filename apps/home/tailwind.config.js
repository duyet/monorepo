const config = require('@duyet/tailwind-config/tailwind.config.mjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...config.theme,
    extend: {
      ...config.theme?.extend,
      colors: {
        ...config.theme?.extend?.colors,
        // Claude's color palette
        claude: {
          beige: '#F4EFE6',
          cream: '#FBF7F0',
          tan: '#E6D9C9',
          brown: '#A07855',
          copper: '#CC785C',
          orange: '#D97757',
          black: '#1F1F1F',
          gray: {
            50: '#F9F9F8',
            100: '#F3F2F0',
            200: '#E8E6E2',
            300: '#D4D1CB',
            400: '#A8A399',
            500: '#7C7869',
            600: '#5C5850',
            700: '#3D3C38',
            800: '#2B2A27',
            900: '#1F1F1F',
          },
        },
      },
      fontFamily: {
        sans: [
          'var(--font-tiempos)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: ['var(--font-tiempos)', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
}
