export interface BenchModule {
  name: string
  tsFn: (input: unknown) => unknown | Promise<unknown>
  wasmFn: (input: unknown) => unknown | Promise<unknown>
  iterations: number
  input: unknown
  wasmReady: boolean
}

export interface TimingStats {
  mean: number
  median: number
  p95: number
  p99: number
  min: number
  max: number
}

export interface BenchmarkResult {
  module: string
  ts: TimingStats
  wasm: TimingStats
  speedup: number
  status: "pass" | "warn" | "fail"
  wasmReady: boolean
  iterations: number
}

export interface BenchmarkReport {
  timestamp: string
  results: BenchmarkResult[]
}
