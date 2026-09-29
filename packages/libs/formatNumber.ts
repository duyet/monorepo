/**
 * Canonical compact number formatting: `1500` → `"1.5k"`.
 *
 * ## Suffix casing: lowercase
 *
 * This module is the single decision point for `k`/`m`/`b` casing across the
 * monorepo. The lowercase forms win because every *externally reachable*
 * surface already rendered lowercase, while every uppercase surface lived
 * inside the internal `insights` dashboard:
 *
 * | Surface                              | Before  |
 * | ------------------------------------ | ------- |
 * | GitHub star counts (`OpenSourceGrid`) | `1.5k`  |
 * | Blog post token counts (`PostList`)   | `1.5k`  |
 * | goal-and-loop share card (committed)  | `2.0k`  |
 * | insights chart Y axes, AI tables      | `1.5K`  |
 *
 * Flipping to uppercase would have been the smaller diff, but it would have
 * changed published output (the blog token count and the already-committed
 * share-card SVG/PNG in `apps/blog/public/media/`). Choosing lowercase keeps
 * every public surface byte-identical and confines the visible change to the
 * internal dashboard. The trade-off: `4.0b` now shows on insights chart axes
 * instead of `4.0B`.
 *
 * ## Deliberately out of scope
 *
 * Two other compact-number helpers exist with *different* semantics and are
 * not routed through here, because folding them in would change their output:
 *
 * - `Intl.NumberFormat({ notation: "compact" })` — locale-aware compact
 *   notation, used by `apps/insights/components/overview/helpers.ts`.
 * - A `T` tier plus sign handling, used by `apps/burns/src/lib/sources.ts`.
 *   That one differs only by a leading tier row and `Math.abs`; promoting it
 *   is a follow-up, not part of this consolidation.
 *
 * ## Known wart (pinned by tests)
 *
 * The tier is chosen *before* the division is rounded, so `999_999` renders
 * `"1000.0k"` rather than `"1.0m"`. Fixing that changes output on every
 * surface and needs its own change; it is pinned here so the fix is
 * deliberate rather than accidental.
 */
const TIERS = [
  { threshold: 1e9, suffix: "b" },
  { threshold: 1e6, suffix: "m" },
  { threshold: 1e3, suffix: "k" },
] as const;

/**
 * Format a number with a lowercase K/M/B suffix once it reaches 1,000.
 *
 * Values below 1,000 (and all negatives, which never match a tier) are
 * returned via `String(value)`, so `formatNumber(0) === "0"` — a chart axis
 * origin and a zero star count both render a bare `0`, with no call-site
 * special-casing.
 *
 * @example
 * formatNumber(500) // "500"
 * formatNumber(1500) // "1.5k"
 * formatNumber(1500000) // "1.5m"
 * formatNumber(1500000000) // "1.5b"
 */
export function formatNumber(value: number): string {
  for (const { threshold, suffix } of TIERS) {
    if (value >= threshold) {
      return `${(value / threshold).toFixed(1)}${suffix}`;
    }
  }
  return value.toString();
}
