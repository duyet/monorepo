import { readFileSync } from "node:fs"
import { join } from "node:path"
import { markdownToHtml } from "../../../packages/libs/markdownToHtml"

const sampleMd = readFileSync(join(import.meta.dir, "..", "fixtures", "sample.md"), "utf-8")

export const name = "markdown-to-html"
export const iterations = 100
export const input = sampleMd

// TS implementation: unified/rehype/remark pipeline (async)
export async function tsFn(input: unknown) {
  return markdownToHtml(input as string)
}

// WASM: stub — delegates to TS function until markdown crate is built
// Real import will be: import { markdown_to_html } from "@duyet/wasm/pkg/markdown/markdown.js"
export async function wasmFn(input: unknown) {
  return markdownToHtml(input as string)
}

export const wasmReady = false
