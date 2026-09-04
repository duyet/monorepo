import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const CRATES_DIR = join(import.meta.dirname!, "..", "crates")
const OUT_DIR = join(import.meta.dirname!, "..", "packages", "wasm", "pkg")
const release = process.argv.includes("--release")

type WasmCrate = { dir: string; pkg: string }

function packageName(cargoToml: string, cargoPath: string): string {
  const match = cargoToml.match(/^name\s*=\s*"([^"]+)"/m)
  if (!match) {
    console.error(`No package name in ${cargoPath}`)
    process.exit(1)
  }
  return match[1]
}

const crates: WasmCrate[] = readdirSync(CRATES_DIR).flatMap((name) => {
  const p = join(CRATES_DIR, name)
  if (!statSync(p).isDirectory()) return []
  const cargoPath = join(p, "Cargo.toml")
  if (!statSync(cargoPath, { throwIfNoEntry: false })) return []
  const cargoToml = readFileSync(cargoPath, "utf-8")
  // wasm-pack needs crate-type = ["cdylib", ...]. Binary crates (duyet,
  // duyet-cli) must stay off the wasm32 cargo graph: duyet pulls rustls →
  // ring → getrandom 0.2, which compile_error!s without the js feature.
  if (!cargoToml.includes("cdylib")) return []
  return [{ dir: name, pkg: packageName(cargoToml, cargoPath) }]
})

if (crates.length === 0) {
  console.log("No WASM crates found in", CRATES_DIR)
  process.exit(0)
}

console.log(`Building ${crates.length} crate(s): ${crates.map((c) => c.pkg).join(", ")}`)

const packageArgs = crates.flatMap((c) => ["-p", c.pkg])
const cargoArgs = release ? ["--release"] : []

const cargoResult = spawnSync(
  "cargo",
  ["build", "--target", "wasm32-unknown-unknown", ...packageArgs, ...cargoArgs],
  { cwd: join(import.meta.dirname!, ".."), stdio: "inherit" },
)
if (cargoResult.status !== 0) {
  console.error("cargo build failed")
  process.exit(1)
}

for (const crate of crates) {
  const cratePath = join(CRATES_DIR, crate.dir)
  const outPath = join(OUT_DIR, crate.dir)

  console.log(`\nwasm-pack: ${crate.pkg} -> ${outPath}`)

  const outName = crate.dir.replace(/-/g, "_")

  const args = [
    "wasm-pack",
    "build",
    "--target",
    "web",
    "--out-dir",
    outPath,
    "--out-name",
    outName,
    ...(release ? ["--release"] : []),
    cratePath,
  ]

  const proc = spawnSync(args[0], args.slice(1), { stdio: "inherit" })
  if (proc.status !== 0) {
    console.error(`wasm-pack failed for ${crate.pkg} (exit ${proc.status})`)
    process.exit(1)
  }
}

console.log(`\nDone. ${crates.length} WASM module(s) built.`)
