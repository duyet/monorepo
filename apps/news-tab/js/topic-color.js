/**
 * Port of apps/news/src/lib/topic-color.ts — keep the palette and djb2
 * hash identical so extension chips/highlights match news.duyet.net.
 */

export const TOPIC_COLOR_PALETTE = [
  { light: "#b91c1c", dark: "#f87171" },
  { light: "#c2410c", dark: "#fb923c" },
  { light: "#92400e", dark: "#fbbf24" },
  { light: "#15803d", dark: "#4ade80" },
  { light: "#0f766e", dark: "#2dd4bf" },
  { light: "#0e7490", dark: "#22d3ee" },
  { light: "#1d4ed8", dark: "#60a5fa" },
  { light: "#4338ca", dark: "#818cf8" },
  { light: "#6d28d9", dark: "#a78bfa" },
  { light: "#7e22ce", dark: "#c084fc" },
  { light: "#be185d", dark: "#f472b6" },
  { light: "#be123c", dark: "#fb7185" },
];

function hashString(input) {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33 + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

export function topicColor(tag) {
  const canonical = String(tag ?? "")
    .trim()
    .toLowerCase();
  const index = hashString(canonical) % TOPIC_COLOR_PALETTE.length;
  return TOPIC_COLOR_PALETTE[index];
}
