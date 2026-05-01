import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { initSync, diff_text, align_blocks } from "../../../packages/wasm/pkg/diff/diff.js"

// Initialize WASM module
const wasmPath = join(dirname(import.meta.url.replace("file://", "")), "..", "..", "..", "packages", "wasm", "pkg", "diff", "diff_bg.wasm")
initSync({ module: readFileSync(wasmPath) })

export const name = "diff-text"
export const iterations = 500
export const wasmReady = true

// Use line-level diff with real fixtures (matches actual app usage in sheet editor)
const oldText = readFileSync(join(import.meta.dir, "..", "fixtures", "sample-diff.txt"), "utf-8")
const newText = readFileSync(join(import.meta.dir, "..", "fixtures", "sample-diff-new.txt"), "utf-8")

export const input = { old: oldText, new: newText }

interface DiffOp {
  type: number // 0=equal, 1=insert, 2=delete
  text: string
}

/**
 * TS line-level diff using LCS dynamic programming.
 * Mirrors the Rust align_blocks function — same algorithm, same output shape.
 */
export function tsFn(input: unknown): DiffOp[] {
  const { old: oldStr, new: newStr } = input as { old: string; new: string }

  const oldLines = oldStr ? oldStr.split("\n") : []
  const newLines = newStr ? newStr.split("\n") : []

  const m = oldLines.length
  const n = newLines.length

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const ops: DiffOp[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.push({ type: 0, text: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 1, text: newLines[j - 1] })
      j--
    } else if (i > 0) {
      ops.push({ type: 2, text: oldLines[i - 1] })
      i--
    }
  }

  ops.reverse()

  // Merge consecutive same-type ops
  if (ops.length === 0) return ops
  const merged: DiffOp[] = [ops[0]]
  for (let k = 1; k < ops.length; k++) {
    const last = merged[merged.length - 1]
    if (last.type === ops[k].type) {
      last.text += "\n" + ops[k].text
    } else {
      merged.push({ ...ops[k] })
    }
  }
  return merged
}

export function wasmFn(input: unknown): DiffOp[] {
  const { old: a, new: b } = input as { old: string; new: string }
  return JSON.parse(align_blocks(a, b)) as DiffOp[]
}
