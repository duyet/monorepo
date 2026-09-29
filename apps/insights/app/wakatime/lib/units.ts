/**
 * Unit conversions for the WakaTime dashboard.
 *
 * ## Why this module exists
 *
 * There were **three** `toHours` implementations in this directory, and they
 * did not agree:
 *
 * - `wakatime-utils.tsx` — `Math.round((s / 3600) * 10) / 10` (1 dp)
 * - `lib/hybrid-fetch.ts` — `Math.round((s / 3600) * 100) / 100` (2 dp)
 * - and two further sites in `wakatime-utils.tsx` that inlined the 1 dp form
 *   rather than calling the helper three lines away from them.
 *
 * The 1 dp / 2 dp split is user-visible **on one page**. The `/wakatime`
 * route renders the stats-derived breakdown tiles (editors, operating systems,
 * categories, machines — 1 dp) next to the hybrid activity chart's "AI Hours"
 * series (2 dp), so the same day could read `1.5` in one panel and `1.53` in
 * the next. Two panels describing the same number must not disagree.
 *
 * ## Which precision
 *
 * **One decimal place.** Six of the nine call sites already used it, it is the
 * coarser of the two, and on a chart axis a second decimal place is noise. The
 * visible consequence of this change is that the hybrid "AI Hours" series now
 * rounds like everything else — `1.53` becomes `1.5`.
 *
 * A separate helper is used for percentages, which round to 2 dp because they
 * are summed against each other and 1 dp loses real distinctions.
 */

/** Fraction of an hour in a second. */
const SECONDS_PER_HOUR = 3600;

/**
 * Seconds → hours, to one decimal place.
 *
 * @example
 * toHours(3600)   // 1
 * toHours(5400)   // 1.5
 * toHours(360)    // 0.1
 */
export function toHours(seconds: number): number {
  return Math.round((seconds / SECONDS_PER_HOUR) * 10) / 10;
}

/**
 * A 0–1 fraction → a percentage, to two decimal places.
 *
 * Separate from {@link toHours} on purpose: these values are compared and
 * summed against each other, where a single decimal place loses real
 * distinctions between small shares.
 */
export function toPercent(fraction: number): number {
  return Math.round((fraction || 0) * 100) / 100;
}
