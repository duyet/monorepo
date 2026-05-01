import { readdirSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { BenchModule, BenchmarkResult, BenchmarkReport } from "./types"
import { computeStats } from "./stats"

const MODULES_DIR = join(import.meta.dir, "modules")
const RESULTS_DIR = join(import.meta.dir, "results")
const WARMUP_ITERATIONS = 10

async function main() {
  mkdirSync(RESULTS_DIR, { recursive: true })

  const benchFiles = discoverBenches()
  if (benchFiles.length === 0) {
    console.error("No benchmark modules found in", MODULES_DIR)
    process.exit(1)
  }

  console.log(`\nWASM Benchmark Harness`)
  console.log(`Discovered ${benchFiles.length} benchmark(s)\n`)

  const results: BenchmarkResult[] = []

  for (const file of benchFiles) {
    const mod = await loadModule(file)
    console.log(`Running: ${mod.name} (${mod.iterations} iterations, wasm: ${mod.wasmReady ? "ready" : "stub"})`)
    const result = await runBench(mod)
    results.push(result)
  }

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    results,
  }

  // Save JSON results
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  const jsonPath = join(RESULTS_DIR, `${ts}.json`)
  writeFileSync(jsonPath, JSON.stringify(report, null, 2))

  // Compare against baseline
  compareWithBaseline(report)

  // Print markdown table
  printMarkdownTable(results)

  console.log(`\nResults saved to ${jsonPath}\n`)
}

function discoverBenches(): string[] {
  return readdirSync(MODULES_DIR)
    .filter((f) => f.endsWith(".bench.ts") || f.endsWith(".bench.js"))
    .map((f) => join(MODULES_DIR, f))
    .sort()
}

async function loadModule(filePath: string): Promise<BenchModule> {
  const imported = await import(filePath)
  const mod = imported.default ?? imported
  return {
    name: mod.name,
    tsFn: mod.tsFn,
    wasmFn: mod.wasmFn,
    iterations: mod.iterations ?? 1000,
    input: mod.input,
    wasmReady: mod.wasmReady ?? false,
  }
}

async function runBench(mod: BenchModule): Promise<BenchmarkResult> {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await mod.tsFn(mod.input)
    await mod.wasmFn(mod.input)
  }

  // Measure TS
  const tsSamples: number[] = []
  for (let i = 0; i < mod.iterations; i++) {
    const start = performance.now()
    await mod.tsFn(mod.input)
    tsSamples.push(performance.now() - start)
  }

  // Measure WASM
  const wasmSamples: number[] = []
  for (let i = 0; i < mod.iterations; i++) {
    const start = performance.now()
    await mod.wasmFn(mod.input)
    wasmSamples.push(performance.now() - start)
  }

  const tsStats = computeStats(tsSamples)
  const wasmStats = computeStats(wasmSamples)
  const speedup = wasmStats.mean > 0 ? tsStats.mean / wasmStats.mean : 0

  const status: BenchmarkResult["status"] =
    speedup >= 5 ? "pass" : speedup >= 2 ? "warn" : "fail"

  return {
    module: mod.name,
    ts: tsStats,
    wasm: wasmStats,
    speedup: round(speedup),
    status,
    wasmReady: mod.wasmReady,
    iterations: mod.iterations,
  }
}

function compareWithBaseline(report: BenchmarkReport) {
  const files = readdirSync(RESULTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()

  if (files.length <= 1) {
    console.log("(first run — saved as baseline)\n")
    return
  }

  const baselinePath = join(RESULTS_DIR, files[0])
  const baseline: BenchmarkReport = JSON.parse(readFileSync(baselinePath, "utf-8"))
  const baselineMap = new Map(baseline.results.map((r) => [r.module, r]))

  console.log("Comparison with baseline:")
  for (const result of report.results) {
    const base = baselineMap.get(result.module)
    if (!base) continue
    const delta = result.speedup - base.speedup
    const arrow = delta > 0 ? "+" : ""
    console.log(
      `  ${result.module}: speedup ${result.speedup}x (baseline ${base.speedup}x, ${arrow}${round(delta)}x)`
    )
  }
  console.log()
}

function printMarkdownTable(results: BenchmarkResult[]) {
  const statusIcon = (s: string) =>
    s === "pass" ? "PASS" : s === "warn" ? "WARN" : "FAIL"

  console.log(
    `| Module | TS mean (ms) | WASM mean (ms) | Speedup | Status | WASM |`
  )
  console.log(
    `| ------ | ------------ | -------------- | ------- | ------ | ---- |`
  )

  for (const r of results) {
    const wasmLabel = r.wasmReady ? "yes" : "stub"
    console.log(
      `| ${r.module} | ${r.ts.mean} | ${r.wasm.mean} | ${r.speedup}x | ${statusIcon(r.status)} | ${wasmLabel} |`
    )
  }

  // Print detailed stats
  console.log(`\nDetailed statistics:`)
  for (const r of results) {
    console.log(`\n  ${r.module} (${r.iterations} iterations):`)
    console.log(`    TS:   mean=${r.ts.mean}ms  median=${r.ts.median}ms  p95=${r.ts.p95}ms  p99=${r.ts.p99}ms  min=${r.ts.min}ms  max=${r.ts.max}ms`)
    console.log(`    WASM: mean=${r.wasm.mean}ms  median=${r.wasm.median}ms  p95=${r.wasm.p95}ms  p99=${r.wasm.p99}ms  min=${r.wasm.min}ms  max=${r.wasm.max}ms`)
    console.log(`    Speedup: ${r.speedup}x (${r.wasmReady ? "real WASM" : "stub — pending migration"})`)
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100
}

main().catch((err) => {
  console.error("Benchmark runner failed:", err)
  process.exit(1)
})
