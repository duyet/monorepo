// Type stubs for WASM modules.
// These are committed to git; the actual pkg/ directory is gitignored and built locally.

declare module "@duyet/wasm/pkg/csv-parser/csv_parser.js" {
  export function parse_csv(input: string): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/dedup/dedup.js" {
  export function merge_all_sources(input: string): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/diff/diff.js" {
  export function diff_text(old: string, new: string): string
  export function align_blocks(old: string, new: string): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/exif/exif.js" {
  export function extract_exif(data: Uint8Array): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/markdown/markdown.js" {
  export function markdown_to_html(input: string): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/normalizers/normalizers.js" {
  export function normalize_date(raw: string): string
  export function normalize_params(raw: string): string
  export function normalize_license(raw: string): string
  export function map_accessibility(accessibility: string): string
  export function normalize_type(raw: string): string
  export function normalize_text(raw: string): string
  export function convert_numeric_params(float_value: string): string
  export function format_training_compute(flop: number): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/placeholder/placeholder.js" {
  export function noop(): string
  export function initSync(module: { module: BufferSource }): void
}

declare module "@duyet/wasm/pkg/utils/utils.js" {
  export function escape_reg_exp(input: string): string
  export function slugify(input: string, max_length?: number): string
  export function initSync(module: { module: BufferSource }): void
}
