// Color utilities for tags and categories
// Extracted from tag-metadata.ts and category-metadata.ts

import type { ColorVariant } from "./types";

/**
 * Get color class for Tailwind CSS based on context (light/default)
 */
export function getColorClass(
  color: ColorVariant,
  variant: "light" | "default" = "light"
): string {
  const colorMap: Record<ColorVariant, string> = {
    ivory: variant === "light" ? "bg-ivory" : "bg-ivory-medium",
    oat: variant === "light" ? "bg-oat-light" : "bg-oat",
    cream: variant === "light" ? "bg-cream" : "bg-cream-warm",
    cactus: variant === "light" ? "bg-cactus-light" : "bg-cactus",
    sage: variant === "light" ? "bg-sage-light" : "bg-sage",
    lavender: variant === "light" ? "bg-lavender-light" : "bg-lavender",
    terracotta: variant === "light" ? "bg-terracotta-light" : "bg-terracotta",
    coral: variant === "light" ? "bg-coral-light" : "bg-coral",
  };

  return colorMap[color];
}

/**
 * Get color from rotation array by index
 */
export function getRotatedColor(
  colors: ColorVariant[],
  index: number
): ColorVariant {
  return colors[index % colors.length];
}
