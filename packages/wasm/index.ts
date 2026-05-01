// @duyet/wasm - Rust/WASM modules compiled via wasm-pack
//
// Build first: `bun run wasm:build` at repo root
//
// Each crate under crates/ produces bindings in ./pkg/<crate-name>/
// Import directly from the generated module:
//
//   import { noop } from "@duyet/wasm/pkg/placeholder/placeholder.js"
//   import { parse_csv } from "@duyet/wasm/pkg/csv-parser/csv_parser.js"
//
// Each WASM module must be initialized before use (auto-happens on first import
// with wasm-pack's --target web output).

export {}
