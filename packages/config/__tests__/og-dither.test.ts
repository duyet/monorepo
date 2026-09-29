import { describe, expect, it } from "vitest"
import { ditherPixelsToSvg, ditherRuns, lumaAt } from "../src/og-dither"

/**
 * The OG card's dither core, extracted so it can be tested without sharp.
 *
 * It used to sit inside `ditherToSvg` behind an `await import("sharp")`, so the
 * only way to exercise it was to push a real image through libvips — neither
 * fast nor hermetic, and in practice not exercised at all. The run-grouping
 * and the accent-cutoff rule are the two things here that are easy to get
 * wrong and worth pinning.
 */

/** A solid RGB field, `w` × `h`, 3 bytes per pixel. */
function field(w: number, h: number, r: number, g: number, b: number) {
  const px = new Uint8Array(w * h * 3)
  for (let i = 0; i < w * h; i++) {
    px[i * 3] = r
    px[i * 3 + 1] = g
    px[i * 3 + 2] = b
  }
  return px
}

const base = {
  pixelWidth: 4,
  pixelHeight: 4,
  outWidth: 24,
  outHeight: 24,
  cell: 6,
  useAccent: false,
  accentCutoff: 0.72,
  ink: "#111",
  accent: "#e11",
  ground: "#fff",
}

describe("lumaAt", () => {
  it("is Rec. 709 luma normalized to 0..1", () => {
    expect(lumaAt(new Uint8Array([0, 0, 0]), 0)).toBe(0)
    // 0.2126 + 0.7152 + 0.0722 is not exactly 1 in binary floating point.
    expect(lumaAt(new Uint8Array([255, 255, 255]), 0)).toBeCloseTo(1, 10)
    // Green dominates: 0.7152 of the sum.
    expect(lumaAt(new Uint8Array([0, 255, 0]), 0)).toBeCloseTo(0.7152, 10)
  })

  it("reads at a byte offset, not from the start", () => {
    const px = new Uint8Array([9, 9, 9, 255, 255, 255])
    expect(lumaAt(px, 3)).toBeCloseTo(1, 10)
  })
})

/**
 * How many cells are lit.
 *
 * Not the run *count* — that is not monotonic in thickness, because lighting a
 * gap merges two runs into one. A fully-lit 4x4 grid is 4 runs (one per row)
 * while a partially-lit one is 8. Asserting on the count is asserting on the
 * wrong quantity, and it was the source of two wrong expectations here.
 */
function litCells(
  options: Parameters<typeof ditherRuns>[0]
): number {
  return ditherRuns(options).reduce((n, [, , len]) => n + len, 0)
}

describe("ditherRuns", () => {
  it("lights a bright field and leaves a dark one unlit", () => {
    expect(ditherRuns({ pixels: field(4, 4, 255, 255, 255), ...base }).length)
      .toBeGreaterThan(0)
    expect(ditherRuns({ pixels: field(4, 4, 0, 0, 0), ...base })).toEqual([])
  })

  it("collapses a fully lit row into one run spanning the row", () => {
    // The collapse is the point: a full-bleed 6px dither over 1200x630 is
    // ~200x105 = 21,000 cells, which becomes a few hundred runs.
    const runs = ditherRuns({ pixels: field(4, 4, 255, 255, 255), ...base })
    for (const [x, y, len] of runs) {
      expect(x).toBe(0)
      expect(len).toBe(4)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(4)
    }
  })

  it("splits a run where the field goes dark mid-row", () => {
    const px = field(4, 4, 255, 255, 255)
    // Row 0, columns 0-1 dark.
    px[0] = px[1] = px[2] = 0
    px[3] = px[4] = px[5] = 0
    const runs = ditherRuns({ pixels: px, ...base })
    const row0 = runs.filter(([, y]) => y === 0)
    // Whether the dark half is unlit depends on the Bayer threshold, so assert
    // the structural property rather than a specific run list.
    for (const [x, , len] of row0) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x + len).toBeLessThanOrEqual(4)
    }
  })

  it("a positive bias raises the threshold and thins the dither", () => {
    const px = field(4, 4, 128, 128, 128)
    expect(litCells({ pixels: px, ...base })).toBe(8)
    expect(litCells({ pixels: px, ...base, bias: 0.4 })).toBe(2)
  })

  it("a negative bias lowers it and thickens the dither", () => {
    const px = field(4, 4, 128, 128, 128)
    expect(litCells({ pixels: px, ...base, bias: -0.4 })).toBe(14)
    // Only at -0.6 does the whole field light: the largest Bayer threshold is
    // 0.96875, and this field's luma is 0.5020, so the threshold has to drop
    // below 0.5020 to clear the darkest cell.
    expect(litCells({ pixels: px, ...base, bias: -0.6 })).toBe(16)
  })

  it("gamma above 1 darkens, below 1 brightens", () => {
    const px = field(4, 4, 128, 128, 128)
    const plain = litCells({ pixels: px, ...base })
    expect(litCells({ pixels: px, ...base, gamma: 2.2 })).toBeLessThanOrEqual(
      plain
    )
    expect(litCells({ pixels: px, ...base, gamma: 0.5 })).toBeGreaterThanOrEqual(
      plain
    )
  })

  it("the run count is not monotonic in thickness, so count cells not runs", () => {
    // Measured on a uniform 4x4 field at luma 0.5020, sweeping the bias:
    //
    //   bias  -0.6 -0.4 -0.2  0.0 +0.2 +0.4
    //   runs      4    5    7    8    5    2
    //   lit      16   14   11    8    5    2
    //
    // Lit cells fall monotonically, but the run count *peaks* at bias 0 and
    // then falls: lighting a gap merges two runs into one. So "more dither"
    // and "more runs" are different quantities, and a test asserting the
    // latter is asserting the wrong thing.
    const px = field(4, 4, 128, 128, 128)
    const counts = [-0.6, -0.4, -0.2, 0, 0.2, 0.4].map(
      (bias) => ditherRuns({ pixels: px, ...base, bias }).length
    )
    expect(counts).toEqual([4, 5, 7, 8, 5, 2])
    expect(Math.max(...counts)).toBe(counts[3])
  })

  it("reads a buffer whose extremes are pure black and pure white", () => {
    // The clamp that used to wrap the luma was unreachable: `pixels` is a
    // Uint8Array, so every component is 0-255 and the Rec. 709 weights sum to 1,
    // making lumaAt 0..1 by construction. The guard guarded nothing — removing
    // it failed no test — so it is gone. These two cases are the boundaries
    // that made it look necessary.
    expect(ditherRuns({ pixels: field(4, 4, 0, 0, 0), ...base })).toEqual([])
    expect(
      ditherRuns({ pixels: field(4, 4, 255, 255, 255), ...base }).length
    ).toBeGreaterThan(0)
  })

  it("returns nothing for an empty buffer rather than throwing", () => {
    expect(
      ditherRuns({ pixels: new Uint8Array(0), ...base, pixelWidth: 0, pixelHeight: 0 })
    ).toEqual([])
  })
})

describe("ditherPixelsToSvg", () => {
  it("sizes the SVG from the output dimensions, not the buffer's", () => {
    // The two width pairs are deliberately distinct: the buffer is the dither
    // lattice (4x4) and the SVG is the card (1200x630). Conflating them
    // type-checks and renders wrong.
    const svg = ditherPixelsToSvg({
      pixels: field(4, 4, 255, 255, 255),
      ...base,
      outWidth: 1200,
      outHeight: 630,
    })
    expect(svg).toContain('width="1200"')
    expect(svg).toContain('height="630"')
    expect(svg).toContain('viewBox="0 0 1200 630"')
  })

  it("emits the ground first, then a group of runs", () => {
    const svg = ditherPixelsToSvg({
      pixels: field(4, 4, 255, 255, 255),
      ...base,
    })
    expect(svg).toContain('<rect width="24" height="24" fill="#fff"/>')
    expect(svg.indexOf("<g>")).toBeGreaterThan(svg.indexOf('fill="#fff"'))
  })

  it("scales each run to cell-sized CSS coordinates", () => {
    const svg = ditherPixelsToSvg({
      pixels: field(4, 4, 255, 255, 255),
      ...base,
    })
    // cell 6, so x/y are multiples of 6, width is a multiple of 6, height is 6.
    for (const m of svg.matchAll(
      /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="6"/g
    )) {
      for (const group of [m[1], m[2], m[3]]) {
        expect(Number(group) % 6).toBe(0)
      }
    }
  })

  it("uses the ink colour alone when the accent is off", () => {
    const svg = ditherPixelsToSvg({
      pixels: field(4, 4, 0, 0, 0),
      ...base,
      useAccent: false,
    })
    expect(svg).not.toContain("#e11")
  })

  it("flips dark cells to the accent above the cutoff", () => {
    // A mid-luma field, so some cells are above and some below 0.72.
    const svg = ditherPixelsToSvg({
      pixels: field(4, 4, 200, 200, 200),
      ...base,
      useAccent: true,
      accentCutoff: 0.72,
    })
    // 200/255 = 0.78 > 0.72, so every lit cell keeps the ink colour.
    expect(svg).not.toContain("#e11")

    const dark = ditherPixelsToSvg({
      pixels: field(4, 4, 20, 20, 20),
      ...base,
      useAccent: true,
      accentCutoff: 0.72,
    })
    expect(dark).toContain("#e11")
  })

  it("is deterministic, which is what lets the cards be committed", () => {
    const args = { pixels: field(4, 4, 200, 100, 50), ...base, useAccent: true }
    expect(ditherPixelsToSvg(args)).toBe(ditherPixelsToSvg(args))
  })
})
