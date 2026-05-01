export const name = "string-utils"
export const iterations = 10000
export const wasmReady = false

// Realistic string operations: escapeRegExp, slugify, truncate, camelCase
const strings = Array.from({ length: 50 }, (_, i) => ({
  raw: `  Hello World! Test #${i} -- foo_bar-baz  `,
  regex: `price: $${(i * 17.99).toFixed(2)} (was $${(i * 24.99).toFixed(2)}) + tax`,
  path: `/api/v2/users/${i}/posts/${i * 3}/comments?sort=desc&limit=10`,
}))

export const input = strings

export function tsFn(input: unknown): unknown[] {
  const items = input as Array<{ raw: string; regex: string; path: string }>
  return items.map((item) => ({
    slug: slugify(item.raw),
    escaped: escapeRegExp(item.regex),
    camel: toCamelCase(item.raw),
    truncated: truncate(item.path, 30),
    wordCount: item.raw.trim().split(/\s+/).length,
    reversed: item.raw.split("").reverse().join(""),
    base64: btoa(item.raw.slice(0, 20)),
  }))
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

function truncate(str: string, len: number): string {
  return str.length <= len ? str : str.slice(0, len) + "..."
}

// WASM: stub
export function wasmFn(input: unknown): unknown[] {
  return tsFn(input)
}
