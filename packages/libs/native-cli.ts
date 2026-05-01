import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BINARY_PATH = resolve(__dirname, "../../target/release/duyet-cli")

interface CliResult<T> {
  ok: boolean
  data: T
  error?: string
}

function ensureBinary(): void {
  if (!existsSync(BINARY_PATH)) {
    throw new Error(
      `duyet-cli binary not found at ${BINARY_PATH}. Run 'bun run rust:build' first.`
    )
  }
}

export function callCli<T>(subcommand: string, input: unknown): T {
  ensureBinary()

  const result = spawnSync(BINARY_PATH, [subcommand], {
    input: JSON.stringify({ input }),
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: 30_000,
  })

  if (result.error) {
    throw new Error(`duyet-cli ${subcommand} failed: ${result.error.message}`)
  }
  if (result.status !== 0) {
    throw new Error(
      `duyet-cli ${subcommand} exited ${result.status}: ${result.stderr}`
    )
  }

  const parsed: CliResult<T> = JSON.parse(result.stdout)
  if (!parsed.ok) {
    throw new Error(`duyet-cli ${subcommand} error: ${parsed.error}`)
  }
  return parsed.data
}
