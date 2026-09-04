import { spawnSync } from "node:child_process"
import { dirname, join, relative, sep } from "node:path"

const ROOT = join(import.meta.dirname!, "..")
const CRATES_DIR = join(ROOT, "crates")
const OUT_DIR = join(ROOT, "packages", "wasm", "pkg")
const release = process.argv.includes("--release")

type WasmCrate = { dir: string; pkg: string }

type CargoTarget = { crate_types: string[] }
type CargoPackage = {
  name: string
  manifest_path: string
  targets: CargoTarget[]
}
type CargoMetadata = { packages: CargoPackage[] }

function listWasmCrates(): WasmCrate[] {
  // cargo metadata is the crate graph, not a TOML substring scan. Binary
  // crates (duyet, duyet-cli) stay off the wasm32 cargo graph: duyet pulls
  // rustls → ring → getrandom 0.2, which compile_error!s without the js
  // feature.
  const result = spawnSync(
    "cargo",
    ["metadata", "--no-deps", "--format-version", "1"],
    { cwd: ROOT, encoding: "utf-8" },
  )
  if (result.status !== 0) {
    console.error(result.stderr || "cargo metadata failed")
    process.exit(1)
  }
  const metadata = JSON.parse(result.stdout) as CargoMetadata
  return metadata.packages.flatMap((pkg) => {
    const hasCdylib = pkg.targets.some((target) =>
      target.crate_types.includes("cdylib"),
    )
    if (!hasCdylib) return []
    const rel = relative(CRATES_DIR, dirname(pkg.manifest_path))
    if (!rel || rel.startsWith("..") || rel.includes(sep)) return []
    return [{ dir: rel, pkg: pkg.name }]
  })
}

const crates: WasmCrate[] = listWasmCrates()

if (crates.length === 0) {
  console.log("No WASM crates found in", CRATES_DIR)
  process.exit(0)
}

console.log(
  `Building ${crates.length} crate(s): ${crates.map((c) => c.pkg).join(", ")}`,
)

const packageArgs = crates.flatMap((c) => ["-p", c.pkg])
const cargoArgs = release ? ["--release"] : []

const cargoResult = spawnSync(
  "cargo",
  ["build", "--target", "wasm32-unknown-unknown", ...packageArgs, ...cargoArgs],
  { cwd: ROOT, stdio: "inherit" },
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
