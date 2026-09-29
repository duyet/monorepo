import { describe, expect, it } from "vitest"
import {
  TAU,
  TOP,
  axisAtAngle,
  distToPolygonEdge,
  pieSlices,
  pointInPolygon,
  radarAxes,
  sliceAtAngle,
} from "./polar"

const square = [0, 0, 10, 0, 10, 10, 0, 10]

describe("pieSlices", () => {
  it("starts the first slice at 12 o'clock and spans the full turn", () => {
    const slices = pieSlices(
      [
        { v: 1, n: "a" },
        { v: 1, n: "b" },
        { v: 2, n: "c" },
      ],
      "v",
      "n"
    )
    expect(slices[0].start).toBeCloseTo(TOP, 10)
    // Percentages sum to 100 ⇒ spans sum to a full turn.
    const span = slices.reduce((sum, s) => sum + (s.end - s.start), 0)
    expect(span).toBeCloseTo(TAU, 10)
    expect(slices[2].end).toBeCloseTo(TOP + TAU, 10)
  })

  it("lays slices end-to-start with mid at the centre of the span", () => {
    const slices = pieSlices(
      [
        { v: 1, n: "a" },
        { v: 3, n: "b" },
      ],
      "v",
      "n"
    )
    expect(slices[1].start).toBeCloseTo(slices[0].end, 10)
    expect(slices[0].mid).toBeCloseTo((slices[0].start + slices[0].end) / 2, 10)
    expect(slices[1].start - TOP).toBeCloseTo(TAU / 4, 10)
  })

  it("gives a single slice the whole circle", () => {
    const [only] = pieSlices([{ v: 5, n: "a" }], "v", "n")
    expect(only.end - only.start).toBeCloseTo(TAU, 10)
    // The mid lands opposite the start, so a whole-circle slice reads as
    // centred on 3 o'clock.
    expect(only.mid).toBeCloseTo(TOP + TAU / 2, 10)
  })

  it("collapses every slice to zero width when the total is zero", () => {
    // `total || 1` avoids dividing by zero, but every span is then 0 — so no
    // angle hits any slice and sliceAtAngle returns -1. Degenerate pie charts
    // are therefore unhoverable, which is the intended no-data reading.
    const slices = pieSlices(
      [
        { v: 0, n: "a" },
        { v: 0, n: "b" },
      ],
      "v",
      "n"
    )
    expect(slices.every((s) => s.end === s.start)).toBe(true)
    expect(sliceAtAngle(slices, TOP)).toBe(-1)
    expect(sliceAtAngle(slices, 0)).toBe(-1)
  })

  it("clamps negative values to zero and ignores junk", () => {
    const slices = pieSlices(
      [
        { v: -5, n: "a" },
        { v: 5, n: "b" },
      ],
      "v",
      "n"
    )
    expect(slices[0].value).toBe(0)
    expect(slices[1].end - slices[1].start).toBeCloseTo(TAU, 10)
  })

  it("falls back to the row index for a missing label", () => {
    const slices = pieSlices([{ v: 1 }, { v: 1 }], "v", "n")
    expect(slices.map((s) => s.name)).toEqual(["0", "1"])
  })
})

describe("sliceAtAngle", () => {
  const slices = pieSlices(
    [
      { v: 1, n: "a" },
      { v: 1, n: "b" },
      { v: 2, n: "c" },
    ],
    "v",
    "n"
  )

  it("finds the slice containing the pointer angle", () => {
    expect(sliceAtAngle(slices, slices[0].mid)).toBe(0)
    expect(sliceAtAngle(slices, slices[2].mid)).toBe(2)
  })

  it("resolves a boundary angle to the slice that starts there", () => {
    // [start, end) is half-open: TOP is slice 0, its end is slice 1.
    expect(sliceAtAngle(slices, TOP)).toBe(0)
    expect(sliceAtAngle(slices, slices[1].start)).toBe(1)
    expect(sliceAtAngle(slices, slices[2].start)).toBe(2)
  })

  it("wraps angles from below 12 o'clock around to the last slice", () => {
    expect(sliceAtAngle(slices, TOP - 0.5)).toBe(2)
  })

  it("wraps angles past a full turn back to the first slice", () => {
    expect(sliceAtAngle(slices, TOP + TAU + 0.1)).toBe(0)
  })

  it("returns -1 for no slices", () => {
    expect(sliceAtAngle([], 0)).toBe(-1)
  })
})

describe("radarAxes", () => {
  it("puts the first spoke at 12 o'clock and spaces the rest evenly", () => {
    const axes = radarAxes(
      [0, 1, 2, 3].map((n) => ({ n })),
      "n"
    )
    expect(axes).toHaveLength(4)
    expect(axes[0].angle).toBeCloseTo(TOP, 10)
    expect(axes[1].angle).toBeCloseTo(TOP + TAU / 4, 10)
    expect(axes[3].angle).toBeCloseTo(TOP + (3 / 4) * TAU, 10)
  })

  it("closes the ring one step short of the first spoke", () => {
    const axes = radarAxes([{ n: "a" }, { n: "b" }, { n: "c" }], "n")
    const gap = axes[0].angle + TAU - axes[2].angle
    expect(gap).toBeCloseTo(TAU / 3, 10)
  })

  it("gives a single-row chart one spoke at 12 o'clock", () => {
    const axes = radarAxes([{ n: "a" }], "n")
    expect(axes).toEqual([{ label: "a", angle: TOP }])
  })

  it("falls back to the row index for a missing label", () => {
    expect(radarAxes([{ n: "x" }, {}], "n").map((a) => a.label)).toEqual(["x", "1"])
  })

  it("returns no axes for no rows", () => {
    expect(radarAxes([], "n")).toEqual([])
  })
})

describe("axisAtAngle", () => {
  const axes = radarAxes([0, 1, 2, 3].map((n) => ({ n })), "n")

  it("picks the spoke the pointer is on", () => {
    expect(axisAtAngle(axes, TOP)).toBe(0)
    expect(axisAtAngle(axes, axes[2].angle)).toBe(2)
  })

  it("snaps an angle between spokes to the nearest one", () => {
    // Dead centre between spokes 1 and 2 — the equidistant case.
    expect(axisAtAngle(axes, TOP + TAU * 0.375)).toBe(1)
  })

  it("resolves the tie between the first two spokes to the lower index", () => {
    // `d < bestD` is strict, so an exact tie keeps the earlier spoke.
    const two = radarAxes([{ n: "a" }, { n: "b" }], "n")
    expect(axisAtAngle(two, TOP + Math.PI / 2)).toBe(0)
  })

  it("returns 0 for no axes rather than throwing", () => {
    expect(axisAtAngle([], 1)).toBe(0)
  })
})

describe("pointInPolygon", () => {
  it("separates interior from exterior", () => {
    expect(pointInPolygon(5, 5, square)).toBe(true)
    expect(pointInPolygon(-1, 5, square)).toBe(false)
    expect(pointInPolygon(11, 5, square)).toBe(false)
  })
})

describe("distToPolygonEdge", () => {
  it("is zero on the boundary and maximal at the centre", () => {
    expect(distToPolygonEdge(0, 5, square)).toBe(0)
    expect(distToPolygonEdge(5, 5, square)).toBeCloseTo(5, 10)
  })

  it("measures from the nearest edge, not the origin", () => {
    expect(distToPolygonEdge(1, 1, square)).toBeCloseTo(1, 10)
    expect(distToPolygonEdge(9, 1, square)).toBeCloseTo(1, 10)
  })
})
