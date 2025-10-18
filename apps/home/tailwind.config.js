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
        // Claude's color palette - flattened for utility class usage
        'claude-beige': '#F4EFE6',
        'claude-cream': '#FBF7F0',
        'claude-tan': '#E6D9C9',
        'claude-brown': '#A07855',
        'claude-copper': '#CC785C',
        'claude-orange': '#D97757',
        'claude-black': '#1F1F1F',
        'claude-gray-50': '#F9F9F8',
        'claude-gray-100': '#F3F2F0',
        'claude-gray-200': '#E8E6E2',
        'claude-gray-300': '#D4D1CB',
        'claude-gray-400': '#A8A399',
        'claude-gray-500': '#7C7869',
        'claude-gray-600': '#5C5850',
        'claude-gray-700': '#3D3C38',
        'claude-gray-800': '#2B2A27',
        'claude-gray-900': '#1F1F1F',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
}
