import { describe, expect, it } from "vitest"
import { toHours, toPercent } from "../units"

/**
 * There were three `toHours` implementations in this directory and they
 * disagreed: `wakatime-utils.tsx` rounded to 1 dp, `lib/hybrid-fetch.ts`
 * rounded to 2 dp, and two further sites inlined the 1 dp form instead of
 * calling the helper three lines away.
 *
 * The split is visible **on one page** — the `/wakatime` route renders the
 * stats-derived breakdown tiles beside the hybrid activity chart's "AI Hours"
 * series, so the same day could read `1.5` in one panel and `1.53` in the
 * next.
 */
describe("toHours", () => {
  it("rounds to one decimal place, so the two panels cannot disagree", () => {
    // 5500s is 1.5277…h. The old hybrid copy rendered 1.53; the overview tiles
    // rendered 1.5. One number, one rounding.
    expect(toHours(5500)).toBe(1.5)
    // And the regression this replaces, spelled out: the 2 dp form is gone.
    expect(toHours(5500)).not.toBe(1.53)
  })

  it("converts seconds to hours", () => {
    expect(toHours(0)).toBe(0)
    expect(toHours(3600)).toBe(1)
    expect(toHours(5400)).toBe(1.5)
    expect(toHours(360)).toBe(0.1)
    expect(toHours(7 * 3600)).toBe(7)
  })

  it("rounds half away from zero, matching the arithmetic it replaced", () => {
    // Math.round(x) rounds .5 up, so 0.05h and 0.15h both go up.
    expect(toHours(180)).toBe(0.1) //  0.05h
    expect(toHours(540)).toBe(0.2) //  0.15h
  })

  it("handles a day and a large total without precision drift", () => {
    expect(toHours(24 * 3600)).toBe(24)
    expect(toHours(365 * 24 * 3600)).toBe(8760)
  })
})

describe("toPercent", () => {
  it("rounds a 0-1 fraction to two decimal places", () => {
    expect(toPercent(0.5)).toBe(0.5)
    expect(toPercent(0.123456)).toBe(0.12)
    expect(toPercent(0.125)).toBe(0.13)
  })

  it("treats a missing or absent value as zero", () => {
    // The call sites pass `item?.percent || 0`, but a named helper that
    // documents the coercion is better than three inline `|| 0`s.
    expect(toPercent(0)).toBe(0)
    expect(toPercent(Number.NaN)).toBe(0)
  })

  it("keeps more precision than toHours, because shares are compared to each other", () => {
    // The reason this is not the same helper: 0.1 and 0.12 are meaningfully
    // different shares but identical at 1 dp.
    expect(toPercent(0.1)).not.toBe(toPercent(0.12))
  })
})
