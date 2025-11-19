/**
 * Design System Colors
 *
 * Centralized color palette used across all apps.
 * These colors can be referenced in Tailwind classes and CSS variables.
 *
 * Usage in components:
 * - Tailwind: className="bg-claude-peach text-brand-primary"
 * - CSS vars: var(--claude-peach), var(--brand-primary)
 *
 * @see https://tailwindcss.com/docs/customizing-colors
 */

/**
 * Claude-inspired color palette
 *
 * This palette is used throughout the monorepo for consistent branding.
 * Named after Claude AI's warm, approachable color scheme.
 */
export const claudeColors = {
  'claude-peach': '#f5dcd0',
  'claude-mint': '#a8d5ba',
  'claude-lavender': '#c5c5ff',
  'claude-coral': '#ff9999',
  'claude-yellow': '#f0d9a8',
  'claude-sky': '#b3d9ff',
}

/**
 * Semantic brand colors
 *
 * These reference the primary, secondary, and accent colors
 * from the active profile's theme.
 *
 * By default, they map to the Claude palette, but can be
 * overridden via CSS variables in the app root.
 */
export const brandColors = {
  'brand-primary': 'var(--brand-primary, #f5dcd0)',
  'brand-secondary': 'var(--brand-secondary, #a8d5ba)',
  'brand-accent': 'var(--brand-accent, #c5c5ff)',
}

/**
 * Blog/Content card color palette
 *
 * Shared color palette for card components across apps
 * Used in ContentCard, FeaturedCard, and LinkCard components
 */
export const cardColors = {
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
}

/**
 * Complete color palette
 *
 * Combines Claude palette with semantic brand colors,
 * card colors, and any additional custom colors.
 */
export const colors = {
  ...claudeColors,
  ...brandColors,
  ...cardColors,
  // Legacy colors for backward compatibility
  gold: '#ffd465',
}

export default colors
