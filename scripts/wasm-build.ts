import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const CRATES_DIR = join(import.meta.dirname!, "..", "crates")
const OUT_DIR = join(import.meta.dirname!, "..", "packages", "wasm", "pkg")
const release = process.argv.includes("--release")

const crates = readdirSync(CRATES_DIR).filter((name) => {
  const p = join(CRATES_DIR, name)
  if (!statSync(p).isDirectory()) return false
  const cargoPath = join(p, "Cargo.toml")
  if (!statSync(cargoPath, { throwIfNoEntry: false })) return false
  // wasm-pack requires crate-type = ["cdylib", ...]. Skip binary/CLI crates
  // so a binary crate in this workspace doesn't break the WASM build.
  return readFileSync(cargoPath, "utf-8").includes("cdylib")
})

if (crates.length === 0) {
  console.log("No WASM crates found in", CRATES_DIR)
  process.exit(0)
}

console.log(`Building ${crates.length} crate(s): ${crates.join(", ")}`)

const cargoArgs = release ? ["--release"] : []

// Build all crates for WASM target
const cargoResult = spawnSync(
  "cargo",
  ["build", "--target", "wasm32-unknown-unknown", ...cargoArgs],
  { cwd: join(import.meta.dirname!, ".."), stdio: "inherit" },
)
if (cargoResult.status !== 0) {
  console.error("cargo build failed")
  process.exit(1)
}

// Run wasm-pack for each crate
for (const crate of crates) {
  const cratePath = join(CRATES_DIR, crate)
  const outPath = join(OUT_DIR, crate)

  console.log(`\nwasm-pack: ${crate} -> ${outPath}`)

  // Derive output name from crate name (replace hyphens with underscores)
  const outName = crate.replace(/-/g, "_")

  const args = [
    "wasm-pack", "build",
    "--target", "web",
    "--out-dir", outPath,
    "--out-name", outName,
    ...(release ? ["--release"] : []),
    cratePath,
  ]

  const proc = spawnSync(args[0], args.slice(1), { stdio: "inherit" })
  if (proc.status !== 0) {
    console.error(`wasm-pack failed for ${crate} (exit ${proc.status})`)
    process.exit(1)
  }
}

console.log(`\nDone. ${crates.length} WASM module(s) built.`)
