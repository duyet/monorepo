import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { markdownToHtml } from "../../../packages/libs/markdownToHtml"
import { initSync, markdown_to_html } from "../../../packages/wasm/pkg/markdown/markdown.js"

// Initialize WASM module
const wasmPath = join(dirname(import.meta.url.replace("file://", "")), "..", "..", "..", "packages", "wasm", "pkg", "markdown", "markdown_bg.wasm")
initSync({ module: readFileSync(wasmPath) })

const sampleMd = readFileSync(join(import.meta.dir, "..", "fixtures", "sample.md"), "utf-8")

export const name = "markdown-to-html"
export const iterations = 100
export const input = sampleMd
export const wasmReady = true

export async function tsFn(input: unknown) {
  return markdownToHtml(input as string)
}

export function wasmFn(input: unknown): string {
  return markdown_to_html(input as string)
}
