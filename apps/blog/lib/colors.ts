/**
 * Shared color palette for blog route pages.
 *
 * Single source of truth — import from here instead of defining
 * local copies, so the palette can never drift across pages.
 */

// Year-indexed colors — cycles through a curated palette
export const YEAR_COLORS = [
  "var(--rd-accent)", // orange
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#14b8a6", // teal
  "#ef4444", // red
  "#84cc16", // lime
];

// General-purpose accent palette (tags, categories, etc.)
export const PALETTE = [
  "#6366f1",
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#ef4444",
  "#84cc16",
  "#f97316",
];

/**
 * Map a year to a color from the YEAR_COLORS palette.
 * Cycles through the palette starting from 2015.
 */
export function yearColor(year: number): string {
  const idx = (year - 2015) % YEAR_COLORS.length;
  return YEAR_COLORS[Math.abs(idx)] ?? YEAR_COLORS[0];
}
