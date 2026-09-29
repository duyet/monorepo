/**
 * The four fill styles a dithered series can use.
 *
 * Lives in its own dependency-free module because the dither *threshold*
 * decision needs it and the threshold must stay importable from plain
 * TypeScript: `dither-cell.ts` is consumed by `packages/config`'s OG-card
 * renderer, whose tsconfig has no `jsx` setting, so a type-import from
 * `chart-context.tsx` made that package fail `tsc --noEmit` with
 * `TS6142: Module './chart-context' was resolved to 'chart-context.tsx', but
 * '--jsx' is not set`.
 *
 * The lesson is worth keeping: a `import type` is erased at runtime but is
 * still *resolved and checked* at compile time, so a type-only import is not
 * free of its module's build requirements. Anything a non-React consumer needs
 * has to live somewhere a non-React consumer can reach.
 *
 * Re-exported from `chart-context.tsx`, which stays the public entry point.
 */
export type AreaVariant = "gradient" | "dotted" | "hatched" | "solid"
