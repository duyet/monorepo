/* tslint:disable */
/* eslint-disable */

/**
 * Block-level LCS alignment of two texts (split by newlines).
 *
 * Each block is a line. Returns a JSON array of
 * `{ type: number, old_text: string, new_text: string }` where:
 * - type 0 = equal
 * - type 1 = insert
 * - type 2 = delete
 */
export function align_blocks(old: string, _new: string): string;

/**
 * Character-level diff between two strings.
 *
 * Returns a JSON array of `{ type: number, text: string }` where:
 * - type 0 = equal
 * - type 1 = insert
 * - type 2 = delete
 */
export function diff_text(old: string, _new: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly align_blocks: (a: number, b: number, c: number, d: number) => [number, number];
    readonly diff_text: (a: number, b: number, c: number, d: number) => [number, number];
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
