import { describe, expect, it } from "vitest"
import {
  BAYER,
  BORDER_ALPHA,
  CELL,
  MAX_COLS,
  MAX_ROWS,
  OFF_TIER,
  backingSize,
  bloomLayerStyle,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  paintColumn,
  resample,
  type PaintOpts,
} from "./dither-paint"
import { seedOfColor } from "./palette"

const seed = seedOfColor("blue")

/** Minimal CanvasRenderingContext2D stand-in recording every fill. */
const recorder = () => {
  const fills: { x: number; y: number; w: number; h: number; alpha: number }[] = []
  let alpha = 1
  const ctx = {
    set fillStyle(value: string) {
      alpha = Number(/,\s*([\d.]+)\)$/.exec(value)?.[1] ?? "NaN")
    },
    get fillStyle() {
      return ""
    },
    fillRect(x: number, y: number, w: number, h: number) {
      fills.push({ x, y, w, h, alpha })
    },
  } as unknown as CanvasRenderingContext2D
  return { ctx, fills }
}

const paint = (opts: PaintOpts, top = 0, floor = 8, x = 0) => {
  const { ctx, fills } = recorder()
  paintColumn(ctx, x, top, floor, seed, opts)
  return fills
}

const solid = { variant: "solid", intensity: 0, dim: 1, stacked: false } as const

describe("BAYER", () => {
  it("is a 4×4 threshold matrix spanning the open unit interval", () => {
    expect(BAYER).toHaveLength(4)
    for (const row of BAYER) {
      expect(row).toHaveLength(4)
      for (const t of row) {
        expect(t).toBeGreaterThan(0)
        expect(t).toBeLessThan(1)
      }
    }
  })

  it("uses each of the 16 midpoints exactly once", () => {
    // (v + 0.5) / 16 keeps the matrix free of a 0 or 1 threshold, so no cell is
    // unconditionally on or off at zero intensity.
    const flat = BAYER.flat()
    expect(new Set(flat).size).toBe(16)
    expect(Math.min(...flat)).toBeCloseTo(0.5 / 16, 10)
    expect(Math.max(...flat)).toBeCloseTo(15.5 / 16, 10)
  })
})

describe("paintColumn geometry", () => {
  it("fills one pixel per row from top to the floor", () => {
    const fills = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 5)
    expect(fills.map((f) => f.y)).toEqual([0, 1, 2, 3, 4, 0, 1])
  })

  it("caps the top with a border row plus a half-alpha feather below it", () => {
    const fills = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 5)
    const border = fills[5]
    expect(border).toMatchObject({ y: 0, alpha: BORDER_ALPHA })
    expect(fills[6]).toMatchObject({ y: 1, alpha: BORDER_ALPHA / 2 })
  })

  it("draws only the border pixel when the column has no depth", () => {
    // A zero-height value (top === floor) still marks the top edge so the
    // zero line is visible.
    expect(paint(solid, 10, 10)).toEqual([{ x: 0, y: 10, w: 1, h: 1, alpha: BORDER_ALPHA }])
  })

  it("draws the border at `top` even when the floor is above it", () => {
    // depth <= 0 short-circuits, so an inverted (top below floor) column
    // paints its cap at `top`, not at the floor.
    expect(paint(solid, 20, 5)).toEqual([{ x: 0, y: 20, w: 1, h: 1, alpha: BORDER_ALPHA }])
  })

  it("skips the feather row when the column is one pixel deep", () => {
    const fills = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 1)
    expect(fills).toHaveLength(2)
  })

  it("rounds fractional top/floor to whole backing pixels", () => {
    // 4.6 rounds up to 5, so the column spans rows 0–4.
    const fills = paint(solid, 0.4, 4.6)
    expect(fills.map((f) => f.y)).toEqual([0, 1, 2, 3, 4, 0, 1])
  })

  it("writes at the requested column without bounds checking", () => {
    // x is trusted: the backing store is sized by backingSize, so an
    // out-of-range x simply lands off-canvas and is dropped by the browser.
    const fills = paint(solid, 0, 2, 9999)
    expect(fills.every((f) => f.x === 9999)).toBe(true)
  })
})

describe("paintColumn density", () => {
  it("fades out toward the value line: alpha grows toward the floor", () => {
    const fills = paint(solid, 0, 8)
    const body = fills.slice(0, 8)
    for (let i = 1; i < body.length; i++) {
      expect(body[i].alpha).toBeGreaterThan(body[i - 1].alpha)
    }
  })

  it("covers every row in solid mode, including the sparsest ones", () => {
    expect(paint(solid, 0, 8)).toHaveLength(8 + 2)
  })

  it("leaves real gaps in dotted mode", () => {
    const fills = paint({ variant: "dotted", intensity: 0, dim: 1, stacked: false }, 0, 8)
    expect(fills.length).toBeLessThan(8 + 2)
  })

  it("paints the same cell twice in gradient mode — once body, once as the border cap", () => {
    // The dither engine repaints row 0 rather than skipping it, so the top of
    // the column is the border colour rather than a dither cell.
    const fills = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 5)
    expect(fills.filter((f) => f.y === 0)).toHaveLength(2)
  })

  it("keeps an off-tier tint instead of a hole for non-dotted variants", () => {
    // Gradient paints every row at either the full tier or OFF_TIER of it —
    // never nothing — so no background shows through as stark white.
    const fills = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 5)
    expect(fills.slice(0, 5)).toHaveLength(5)
    expect(new Set(fills.slice(0, 5).map((f) => f.alpha === BORDER_ALPHA))).toContain(false)
  })

  it("drops two of every four rows in hatched mode", () => {
    // `((x + y) & 3) >= 2` skips half the rows on a 4-row period; the border
    // and feather rows are still added regardless.
    const fills = paint({ variant: "hatched", intensity: 0, dim: 1, stacked: false }, 0, 8)
    expect(fills).toHaveLength(4 + 2)
    expect(fills.slice(-2).map((f) => f.y)).toEqual([0, 1])
  })

  it("raises the floor density when stacked", () => {
    // Stacked series are floored at 0.5 density so a thin band under a big one
    // is still legible.
    const plain = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: false }, 0, 8)
    const stacked = paint({ variant: "gradient", intensity: 0, dim: 1, stacked: true }, 0, 8)
    expect(stacked[0].alpha).toBeGreaterThan(plain[0].alpha)
  })

  it("lifts the whole column with intensity and clamps at full alpha", () => {
    const calm = paint(solid, 0, 4)
    const lifted = paint({ ...solid, intensity: 1 }, 0, 4)
    expect(lifted[0].alpha).toBeGreaterThan(calm[0].alpha)
    const stackedLifted = paint({ ...solid, intensity: 1, stacked: true }, 0, 8)
    expect(Math.max(...stackedLifted.map((f) => f.alpha))).toBe(1)
  })
})

describe("paintColumn dim", () => {
  it("scales every alpha, border and feather included", () => {
    const lit = paint(solid, 0, 8)
    const dim = paint({ ...solid, dim: 0.3 }, 0, 8)
    expect(dim).toHaveLength(lit.length)
    for (let i = 0; i < lit.length; i++) {
      expect(dim[i].alpha).toBeCloseTo(lit[i].alpha * 0.3, 10)
    }
  })

  it("dims the zero-depth border pixel too", () => {
    const [only] = paint({ ...solid, dim: 0.3 }, 10, 10)
    expect(only.alpha).toBeCloseTo(BORDER_ALPHA * 0.3, 10)
  })

  it("is characteristically uncapped by OFF_TIER — that only scales off cells", () => {
    expect(OFF_TIER).toBeLessThan(1)
    const dotted = paint({ variant: "dotted", intensity: 0, dim: 1, stacked: false }, 0, 8)
    // Dotted off cells are skipped rather than tinted, so nothing hits OFF_TIER.
    expect(dotted.some((f) => f.alpha === OFF_TIER)).toBe(false)
  })
})

describe("backingSize", () => {
  it("divides the plot rect by CELL", () => {
    expect(backingSize(40, 40)).toEqual({ cols: 20, rows: 20 })
    expect(CELL).toBe(2)
  })

  it("never drops below an 8×8 backing store", () => {
    // A collapsed plot still needs a drawable canvas, and a 0-size canvas
    // throws on getContext in some engines.
    expect(backingSize(0, 0)).toEqual({ cols: 8, rows: 8 })
  })

  it("caps at the maximum grid so a huge plot stays bounded", () => {
    expect(backingSize(100_000, 100_000)).toEqual({
      cols: MAX_COLS,
      rows: MAX_ROWS,
    })
  })
})

describe("resample", () => {
  it("interpolates linearly across the target column count", () => {
    expect(resample([0, 1, 2], 5)).toEqual([0, 0.5, 1, 1.5, 2])
  })

  it("keeps the endpoints of the source pinned", () => {
    const out = resample([10, 20, 30], 7)
    expect(out[0]).toBe(10)
    expect(out[6]).toBe(30)
  })

  it("upsamples and downsamples without dropping data", () => {
    expect(resample([0, 1], 5)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(resample([0, 1, 2, 3, 4], 3)).toEqual([0, 2, 4])
  })

  it("returns a single source value for a single column", () => {
    expect(resample([0, 1, 2], 1)).toEqual([0])
  })

  it("zero-fills for an empty source", () => {
    expect(resample([], 3)).toEqual([0, 0, 0])
  })
})

describe("bloomLayerStyle", () => {
  it("is null when bloom is off or inactive", () => {
    expect(bloomLayerStyle("off", true)).toBeNull()
    expect(bloomLayerStyle("high", false)).toBeNull()
  })

  it("maps a preset to its filter and additive blend", () => {
    expect(bloomLayerStyle("high", true)).toEqual({
      filter: "blur(5px) brightness(1.5) saturate(1.5)",
      opacity: 0.78,
      mixBlendMode: "plus-lighter",
      imageRendering: "auto",
    })
  })

  it("accepts a custom config and defaults the blend and saturation", () => {
    expect(
      bloomLayerStyle({ blur: 2, brightness: 1, opacity: 0.5 }, true)
    ).toEqual({
      filter: "blur(2px) brightness(1) saturate(1)",
      opacity: 0.5,
      mixBlendMode: "plus-lighter",
      imageRendering: "auto",
    })
  })
})

describe("easing", () => {
  it("pins both ends and the midpoint", () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBe(0.5)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it("clamps to the 0–1 range", () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.5)).toBe(0.5)
    expect(clamp01(2)).toBe(1)
  })
})
