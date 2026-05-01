import type { TimingStats } from "./types"

/**
 * Compute timing statistics from an array of duration samples (ms).
 * Input is sorted in-place. Returns mean, median, p95, p99, min, max.
 */
export function computeStats(samples: number[]): TimingStats {
  const sorted = samples.slice().sort((a, b) => a - b)
  const n = sorted.length

  const mean = sorted.reduce((s, v) => s + v, 0) / n
  const median = percentile(sorted, 50)
  const p95 = percentile(sorted, 95)
  const p99 = percentile(sorted, 99)

  return {
    mean: round(mean),
    median: round(median),
    p95: round(p95),
    p99: round(p99),
    min: round(sorted[0]),
    max: round(sorted[n - 1]),
  }
}

function percentile(sorted: number[], pct: number): number {
  const idx = (pct / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000
}
