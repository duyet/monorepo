/* tslint:disable */
/* eslint-disable */

/**
 * Convert parameter count from float to readable format.
 * Returns empty string for zero/invalid inputs.
 */
export function convert_numeric_params(float_value: string): string;

/**
 * Format a FLOP count as a readable string.
 */
export function format_training_compute(flop: number): string;

/**
 * Map accessibility string to license type (Epoch.ai format).
 */
export function map_accessibility(accessibility: string): string;

/**
 * Normalize a raw date string into YYYY-MM-DD format.
 * Returns empty string for unparseable/TBA/TBD inputs (caller maps to null).
 */
export function normalize_date(raw: string): string;

/**
 * Normalize license/accessibility string to standard type.
 */
export function normalize_license(raw: string): string;

/**
 * Normalize parameter count strings.
 * Returns empty string for unknown/n/a (caller maps to null).
 */
export function normalize_params(raw: string): string;

/**
 * Normalize text: collapse whitespace, trim.
 */
export function normalize_text(raw: string): string;

/**
 * Normalize model type string.
 */
export function normalize_type(raw: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly convert_numeric_params: (a: number, b: number) => [number, number];
    readonly format_training_compute: (a: number) => [number, number];
    readonly map_accessibility: (a: number, b: number) => [number, number];
    readonly normalize_date: (a: number, b: number) => [number, number];
    readonly normalize_license: (a: number, b: number) => [number, number];
    readonly normalize_params: (a: number, b: number) => [number, number];
    readonly normalize_text: (a: number, b: number) => [number, number];
    readonly normalize_type: (a: number, b: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
