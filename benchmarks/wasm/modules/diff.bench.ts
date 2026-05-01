import { readFileSync } from "node:fs"
import { join } from "node:path"

export const name = "diff-text"
export const iterations = 500
export const wasmReady = false

const oldText = readFileSync(join(import.meta.dir, "..", "fixtures", "sample-diff.txt"), "utf-8")
const newText = readFileSync(join(import.meta.dir, "..", "fixtures", "sample-diff-new.txt"), "utf-8")

export const input = { old: oldText, new: newText }

interface DiffOp {
  type: number // 0=equal, 1=insert, 2=delete
  text: string
}

/**
 * TS character-level diff using LCS dynamic programming.
 * Returns array of { type, text } ops (0=equal, 1=insert, 2=delete).
 */
export function tsFn(input: unknown): DiffOp[] {
  const { old: a, new: b } = input as { old: string; new: string }

  // Simplified LCS-based diff
  const n = a.length
  const m = b.length

  // For large inputs, use a simple greedy approach
  const ops: DiffOp[] = []
  let i = 0
  let j = 0

  // Build edit script using dynamic programming table (limited to reasonable sizes)
  if (n * m < 10_000_000) {
    const dp = buildLCSTable(a, b)
    backtrackDiff(ops, a, b, dp, n, m)
  } else {
    // Fallback: simple line-by-line comparison
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        ops.push({ type: 0, text: a[i] })
        i++
        j++
      } else {
        // Look ahead
        const nextMatchA = b.indexOf(a[i], j)
        const nextMatchB = a.indexOf(b[j], i)
        if (nextMatchA >= 0 && (nextMatchB < 0 || nextMatchA - j <= nextMatchB - i)) {
          for (let k = j; k < nextMatchA; k++) ops.push({ type: 1, text: b[k] })
          j = nextMatchA
        } else if (nextMatchB >= 0) {
          for (let k = i; k < nextMatchB; k++) ops.push({ type: 2, text: a[k] })
          i = nextMatchB
        } else {
          ops.push({ type: 2, text: a[i] })
          ops.push({ type: 1, text: b[j] })
          i++
          j++
        }
      }
    }
    while (i < n) ops.push({ type: 2, text: a[i++] })
    while (j < m) ops.push({ type: 1, text: b[j++] })
  }

  // Merge consecutive same-type ops
  return mergeOps(ops)
}

function buildLCSTable(a: string, b: string): number[][] {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp
}

function backtrackDiff(ops: DiffOp[], a: string, b: string, dp: number[][], i: number, j: number): void {
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 0, text: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 1, text: b[j - 1] })
      j--
    } else if (i > 0) {
      ops.push({ type: 2, text: a[i - 1] })
      i--
    }
  }
  ops.reverse()
}

function mergeOps(ops: DiffOp[]): DiffOp[] {
  if (ops.length === 0) return ops
  const merged: DiffOp[] = [ops[0]]
  for (let i = 1; i < ops.length; i++) {
    const last = merged[merged.length - 1]
    if (last.type === ops[i].type) {
      last.text += ops[i].text
    } else {
      merged.push({ ...ops[i] })
    }
  }
  return merged
}

// WASM: stub
export function wasmFn(input: unknown): DiffOp[] {
  return tsFn(input)
}
