import { $ } from "bun"
import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const CRATES_DIR = join(import.meta.dir, "..", "crates")
const OUT_DIR = join(import.meta.dir, "..", "packages", "wasm", "pkg")
const release = Bun.argv.includes("--release")

const crates = readdirSync(CRATES_DIR).filter((name) => {
  const p = join(CRATES_DIR, name)
  return statSync(p).isDirectory() && statSync(join(p, "Cargo.toml"), { throwIfNoEntry: false })
})

if (crates.length === 0) {
  console.log("No WASM crates found in", CRATES_DIR)
  process.exit(0)
}

console.log(`Building ${crates.length} crate(s): ${crates.join(", ")}`)

const profile = release ? "release" : "dev"
const cargoArgs = release ? ["--release"] : []

// Build all crates for WASM target
await $`cargo build --target wasm32-unknown-unknown ${cargoArgs}`.cwd(join(import.meta.dir, ".."))

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

  const proc = Bun.spawn(args, { stdout: "inherit", stderr: "inherit" })
  const exitCode = await proc.exited
  if (exitCode !== 0) {
    console.error(`wasm-pack failed for ${crate} (exit ${exitCode})`)
    process.exit(1)
  }
}

console.log(`\nDone. ${crates.length} WASM module(s) built.`)
