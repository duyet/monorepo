/**
 * Format number with K/M/B suffixes for readability
 * @example
 * formatNumber(500) // "500"
 * formatNumber(1500) // "1.5K"
 * formatNumber(1500000) // "1.5M"
 * formatNumber(1500000000) // "1.5B"
 */
export function formatNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
