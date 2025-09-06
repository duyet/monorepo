/**
 * @deprecated Use useFormattedCurrency hook instead
 * Format currency with smart rounding and $ symbol
 * Examples: $1.6, $0.05, $12.5, $156
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0'
  if (amount < 0.01) return '<$0.01'
  if (amount < 1) return `$${amount.toFixed(2)}`
  if (amount < 10) return `$${amount.toFixed(1)}`
  return `$${Math.round(amount)}`
}