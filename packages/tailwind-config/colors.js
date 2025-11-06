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
 * Complete color palette
 *
 * Combines Claude palette with semantic brand colors
 * and any additional custom colors.
 */
export const colors = {
  ...claudeColors,
  ...brandColors,
  // Legacy colors for backward compatibility
  gold: '#ffd465',
}

export default colors
