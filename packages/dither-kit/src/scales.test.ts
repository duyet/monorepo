import { describe, expect, it } from "vitest"
import {
  buildBandScale,
  buildXScale,
  buildYScale,
  computeBands,
  indexAtBand,
  nearestIndex,
} from "./scales"

describe("computeBands (default)", () => {
  it("anchors every series on the zero baseline", () => {
    const { bands } = computeBands([{ a: 3 }, { a: 5 }], ["a"], "default")
    expect(bands.a).toEqual([
      [0, 3],
      [0, 5],
    ])
  })

  it("keeps a negative value as [0, v] so it draws below the baseline", () => {
    const { bands, max, min } = computeBands(
      [{ a: 5 }, { a: -3 }],
      ["a"],
      "default"
    )
    expect(bands.a[1]).toEqual([0, -3])
    expect(max).toBe(5)
    expect(min).toBe(-3)
  })

  it("leaves max at 0 for a purely negative series so the baseline stays on top", () => {
    // Not a bug: with no positive value there is no room above zero, so the
    // domain must not invent one.
    const { max, min } = computeBands([{ a: -5 }, { a: -2 }], ["a"], "default")
    expect(max).toBe(0)
    expect(min).toBe(-5)
  })

  it("falls back to a unit span when there is no range at all", () => {
    // Empty data, all-zero data and non-numeric data all land here.
    expect(computeBands([{ a: 0 }], ["a"], "default").max).toBe(1)
    expect(computeBands([], ["a"], "default").max).toBe(1)
    expect(computeBands([{ a: "x" }, { a: null }], ["a"], "default").max).toBe(1)
  })

  it("coerces non-finite values to 0 rather than poisoning the domain", () => {
    const { bands, max, min } = computeBands(
      [{ a: Number.NaN }, { a: Number.POSITIVE_INFINITY }, { a: 4 }],
      ["a"],
      "default"
    )
    expect(bands.a).toEqual([
      [0, 0],
      [0, 0],
      [0, 4],
    ])
    expect(max).toBe(4)
    expect(min).toBe(0)
  })

  it("produces one band per row for each key", () => {
    const { bands } = computeBands([{ a: 1, b: 2 }, { a: 3, b: 4 }], ["a", "b"], "default")
    expect(bands.a).toHaveLength(2)
    expect(bands.b).toHaveLength(2)
  })
})

describe("computeBands (stacked / percent)", () => {
  it("piles series so each band starts where the previous ended", () => {
    const { bands, max } = computeBands(
      [{ a: 1, b: 2 }, { a: 3, b: 1 }],
      ["a", "b"],
      "stacked"
    )
    expect(bands.a).toEqual([
      [0, 1],
      [0, 3],
    ])
    expect(bands.b).toEqual([
      [1, 3],
      [3, 4],
    ])
    expect(max).toBe(4)
  })

  it("normalizes each row to a top of 1 in percent mode", () => {
    const { bands, max, min } = computeBands(
      [{ a: 1, b: 2 }, { a: 3, b: 1 }],
      ["a", "b"],
      "percent"
    )
    expect(bands.b.map(([, y1]) => y1)).toEqual([1, 1])
    expect(max).toBe(1)
    expect(min).toBe(0)
  })

  it("CHARACTERIZATION: a negative value inverts its band instead of dipping below zero", () => {
    // WRONG BEHAVIOUR, pinned deliberately. The doc comment above says the
    // stack "splits negatives below zero", but `.offset(undefined)` resolves to
    // d3's `stackOffsetNone`, which just accumulates: `b` becomes [4, 2] with
    // y0 > y1. Two consequences, both pinned here:
    //   1. `min` stays 0, so buildYScale never reserves room below zero and the
    //      negative segment is clipped off the bottom of the plot.
    //   2. `percent` mode inherits the same inversion ([0, 2] then [2, 1]), so
    //      its per-row totals are not normalised to 1.
    const stacked = computeBands([{ a: 4, b: -2 }], ["a", "b"], "stacked")
    expect(stacked.bands.b).toEqual([[4, 2]])
    expect(stacked.min).toBe(0)

    const percent = computeBands([{ a: 4, b: -2 }], ["a", "b"], "percent")
    expect(percent.bands.a).toEqual([[0, 2]])
    expect(percent.bands.b).toEqual([[2, 1]])
  })

  it("does dip below zero when every stacked value is negative", () => {
    // offsetNone is not diverging, but with no positive value to accumulate
    // from, the bands still run negative — so this case works by accident.
    const { min } = computeBands(
      [{ a: -4, b: 2 }, { a: -1, b: -1 }],
      ["a", "b"],
      "stacked"
    )
    expect(min).toBe(-4)
  })
})

describe("buildXScale", () => {
  it("spreads point indices evenly across the plot width", () => {
    const x = buildXScale(3, 100)
    expect(x(0)).toBe(0)
    expect(x(1)).toBe(50)
    expect(x(2)).toBe(100)
  })

  it("yields an empty domain for zero rows", () => {
    expect(buildXScale(0, 100).domain()).toEqual([])
  })
})

describe("buildBandScale", () => {
  it("leaves gaps between categories", () => {
    const b = buildBandScale(4, 100)
    expect(b.bandwidth()).toBeLessThan(b.step())
  })

  it("places the last category inside the plot, not at its edge", () => {
    // paddingOuter(0.18) — the outer band is inset, so band(i) + width < plotWidth.
    const b = buildBandScale(4, 100)
    expect(b(0)).toBeGreaterThan(0)
    expect(b(3)! + b.bandwidth()).toBeLessThan(100)
  })
})

describe("indexAtBand", () => {
  it("returns 0 for degenerate inputs", () => {
    expect(indexAtBand(50, 0, 100)).toBe(0)
    expect(indexAtBand(50, 4, 0)).toBe(0)
  })

  it("maps each quarter of the plot to its category", () => {
    expect(indexAtBand(0, 4, 100)).toBe(0)
    expect(indexAtBand(24, 4, 100)).toBe(0)
    expect(indexAtBand(25, 4, 100)).toBe(1)
    expect(indexAtBand(50, 4, 100)).toBe(2)
    expect(indexAtBand(99, 4, 100)).toBe(3)
  })

  it("clamps out-of-range pixels to the first/last category", () => {
    // Pointer events can land a pixel outside the plot rect.
    expect(indexAtBand(-40, 4, 100)).toBe(0)
    expect(indexAtBand(1000, 4, 100)).toBe(3)
  })

  it("never returns length for an in-range max pixel", () => {
    // The 0.999 clamp is what keeps the right edge on the last index.
    expect(indexAtBand(100, 4, 100)).toBeLessThan(4)
  })
})

describe("nearestIndex", () => {
  it("returns 0 when there is nothing to disambiguate", () => {
    expect(nearestIndex(50, 1, 100)).toBe(0)
    expect(nearestIndex(50, 0, 100)).toBe(0)
    expect(nearestIndex(50, 5, 0)).toBe(0)
  })

  it("rounds to the nearest sample rather than the band under the pixel", () => {
    // The difference from indexAtBand: 17% across 5 rows lands on row 1.
    expect(nearestIndex(17, 5, 100)).toBe(1)
    expect(nearestIndex(25, 5, 100)).toBe(1)
    expect(nearestIndex(50, 5, 100)).toBe(2)
  })

  it("clamps both ends of the plot", () => {
    expect(nearestIndex(-40, 5, 100)).toBe(0)
    expect(nearestIndex(1000, 5, 100)).toBe(4)
  })
})

describe("buildYScale", () => {
  it("defaults min to 0 so the floor sits at the plot bottom", () => {
    const y = buildYScale(undefined, 10, 200)
    expect(y.domain()).toEqual([0, 10])
    expect(y(0)).toBe(200)
    expect(y(10)).toBe(0)
  })

  it("pins a positive-only chart's baseline to the bottom edge", () => {
    const y = buildYScale(0, 10, 200)
    expect(y(0)).toBe(200)
  })

  it("puts the zero baseline inside the plot for diverging data", () => {
    const y = buildYScale(-5, 3, 200)
    expect(y.domain()).toEqual([-5, 3])
    expect(y(0)).toBeGreaterThan(0)
    expect(y(0)).toBeLessThan(200)
  })

  it("swallows a negative max rather than inverting the range", () => {
    // lo = min(0, min), hi = max(0, max) — a negative max collapses to hi = 0
    // and the guard then widens the degenerate domain to [0, 1].
    const y = buildYScale(0, -3, 200)
    expect(y.domain()).toEqual([0, 1])
  })

  it("clamps min above max to the zero-inclusive range", () => {
    const y = buildYScale(10, 5, 200)
    expect(y.domain()).toEqual([0, 5])
  })

  it("stays finite for a zero-height domain", () => {
    const y = buildYScale(0, 0, 200)
    expect(y.domain()).toEqual([0, 1])
    expect(Number.isFinite(y(0))).toBe(true)
    expect(y(0)).toBe(200)
  })

  it("keeps the range inverted so larger values are higher on screen", () => {
    const y = buildYScale(0, 10, 200)
    expect(y(0)).toBeGreaterThan(y(10))
  })
})
