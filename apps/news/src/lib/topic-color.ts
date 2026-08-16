/**
 * Deterministic per-topic text colors.
 *
 * Each tag hashes onto a fixed slot in a curated 12-hue palette. Unlike a
 * chart-mark palette (vivid fills validated for series identity on a chart
 * surface), these are TEXT colors: dark/muted shades for light mode, light/
 * bright shades for dark mode, each chosen to clear WCAG AA text contrast
 * (>= 4.5:1) against this app's `--editorial-bg` tokens (#ffffff light /
 * #0a0a0a dark). Pure and dependency-free — same tag always maps to the
 * same pair.
 */
export interface TopicColor {
  light: string;
  dark: string;
}

// 12 distinguishable hue families, one text-color pair each. Order is
// arbitrary (colors are chosen by hash, not by index meaning), but kept
// fixed so hashes stay stable across releases.
export const TOPIC_COLOR_PALETTE: readonly TopicColor[] = [
  { light: "#b91c1c", dark: "#f87171" }, // red
  { light: "#c2410c", dark: "#fb923c" }, // orange
  { light: "#92400e", dark: "#fbbf24" }, // amber
  { light: "#15803d", dark: "#4ade80" }, // green
  { light: "#0f766e", dark: "#2dd4bf" }, // teal
  { light: "#0e7490", dark: "#22d3ee" }, // cyan
  { light: "#1d4ed8", dark: "#60a5fa" }, // blue
  { light: "#4338ca", dark: "#818cf8" }, // indigo
  { light: "#6d28d9", dark: "#a78bfa" }, // violet
  { light: "#7e22ce", dark: "#c084fc" }, // purple
  { light: "#be185d", dark: "#f472b6" }, // pink
  { light: "#be123c", dark: "#fb7185" }, // rose
] as const;

/** Simple deterministic string hash (djb2-style), stable across runs. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33 + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0; // unsigned
}

/**
 * Maps a topic/tag string to a deterministic { light, dark } text-color
 * pair. Canonicalizes (trim + lowercase) before hashing so "GPT-5",
 * "gpt-5", and " gpt-5 " all land on the same color.
 */
export function topicColor(tag: string): TopicColor {
  const canonical = tag.trim().toLowerCase();
  const index = hashString(canonical) % TOPIC_COLOR_PALETTE.length;
  return TOPIC_COLOR_PALETTE[index];
}
