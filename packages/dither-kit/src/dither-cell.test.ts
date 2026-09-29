import { describe, expect, it } from "vitest"
import { ALPHA_RAMP, BAYER, ditherCell, OFF_TIER, type CellInput } from "./dither-cell"
import { DIM } from "./emphasis"

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const VARIANTS = ["gradient", "dotted", "hatched", "solid"] as const
const DENSITIES = [0, 0.01, 0.13, 0.25, 0.4, 0.5, 0.6, 0.75, 0.87, 0.99, 1]
const INTENSITIES = [0, 0.05, 0.3, 0.5, 0.8, 1]
const DIMS = [DIM, 0.5, 1]
const SPARSES = [0, 0.1, 0.25, 0.5]
const LAYERS = [0, 1, 2, 4]

const cell = (o: CellInput) => ditherCell(o)

/**
 * The three painters used to open-code this decision inline, transcribed
 * **verbatim** from before the extraction. `dither-paint.ts` and
 * `dither-canvas.tsx` are what the real canvases call; the originals are kept
 * here purely as the oracle, so the extraction is pinned against the code it
 * replaced rather than against a restatement of the new code.
 */
const original = {
  cartesian(
    variant: CellInput["variant"],
    x: number,
    y: number,
    density: number,
    intensity: number,
    dim: number,
    sparse: number,
    stacked: boolean
  ) {
    const bias = (variant === "dotted" ? 0.12 : 0) + (stacked ? 0.2 : 0) - sparse
    if (variant === "hatched" && ((x + y) & 3) >= 2) return null
    const lit =
      variant === "solid" ||
      density > BAYER[y & 3][x & 3] - 0.1 * intensity - bias
    if (variant === "dotted" && !lit) return null
    const k = (0.3 + density * 0.7) * (1 + 0.22 * intensity)
    return clamp01((lit ? k : k * OFF_TIER) * dim)
  },
  pie(
    variant: CellInput["variant"],
    x: number,
    y: number,
    density: number,
    it: number,
    selDim: number
  ) {
    const bias = variant === "dotted" ? 0.12 : 0
    if (variant === "hatched" && ((x + y) & 3) >= 2) return null
    const lit =
      variant === "solid" || density > BAYER[y & 3][x & 3] - 0.1 * it - bias
    if (variant === "dotted" && !lit) return null
    const k = (0.35 + density * 0.65) * (1 + 0.22 * it)
    return Math.min(1, (lit ? k : k * OFF_TIER) * selDim)
  },
  radar(
    variant: CellInput["variant"],
    x: number,
    y: number,
    density: number,
    intensity: number,
    selDim: number,
    pi: number,
    covered: boolean
  ) {
    const bias = variant === "dotted" ? 0.12 : 0
    const sparse = pi * 0.2
    if (variant === "hatched" && ((x + y) & 3) >= 2) return null
    const lit =
      variant === "solid" ||
      density > BAYER[y & 3][x & 3] - 0.1 * intensity - bias + sparse
    if (!lit && (variant === "dotted" || covered)) return null
    const k = (0.32 + density * 0.68) * (1 + 0.22 * intensity)
    return Math.min(1, (lit ? k : k * OFF_TIER) * selDim)
  },
}

describe("ditherCell is bit-for-bit equivalent to the code it replaced", () => {
  // Exhaustive over the input space rather than a handful of examples. The
  // canvases have no test coverage of their own — this is the only thing
  // standing between the extraction and a silently wrong pixel.
  //
  // Mismatches are collected and asserted once at the end rather than calling
  // `expect` per case: 16.2M assertions each building a Vitest error object
  // blows the 5s test timeout, whereas the comparison itself runs in well
  // under a second. A failure still names the first offending inputs.
  type Mismatch = { site: string; inputs: unknown[]; expected: number | null; got: number | null }
  const check = (
    site: string,
    inputs: unknown[],
    expected: number | null,
    got: number | null
  ) => {
    if (expected !== got) mismatches.push({ site, inputs, expected, got })
  }
  const mismatches: Mismatch[] = []
  let compared = 0

  it("matches all three painters across the full input space", () => {
    for (const variant of VARIANTS)
      for (let x = 0; x < 16; x++)
        for (let y = 0; y < 16; y++)
          for (const density of DENSITIES)
            for (const intensity of INTENSITIES)
              for (const dim of DIMS) {
                // --- cartesian ---
                for (const sparse of SPARSES)
                  for (const stacked of [false, true]) {
                    // `bias` raises the threshold, so the stacked term — which
                    // the original folded into its own `bias` and then
                    // subtracted — enters negated here.
                    check(
                      "cartesian",
                      [variant, x, y, density, intensity, dim, sparse, stacked],
                      original.cartesian(
                        variant,
                        x,
                        y,
                        density,
                        intensity,
                        dim,
                        sparse,
                        stacked
                      ),
                      cell({
                        variant,
                        x,
                        y,
                        density,
                        intensity,
                        dim,
                        ramp: ALPHA_RAMP.cartesian,
                        bias: sparse - (stacked ? 0.2 : 0),
                      })
                    )
                    compared++
                  }

                // --- pie ---
                check(
                  "pie",
                  [variant, x, y, density, intensity, dim],
                  original.pie(variant, x, y, density, intensity, dim),
                  cell({ variant, x, y, density, intensity, dim, ramp: ALPHA_RAMP.pie })
                )
                compared++

                // --- radar, including the covered-pixel gap rule ---
                for (const pi of LAYERS)
                  for (const covered of [false, true]) {
                    check(
                      "radar",
                      [variant, x, y, density, intensity, dim, pi, covered],
                      original.radar(
                        variant,
                        x,
                        y,
                        density,
                        intensity,
                        dim,
                        pi,
                        covered
                      ),
                      cell({
                        variant,
                        x,
                        y,
                        density,
                        intensity,
                        dim,
                        ramp: ALPHA_RAMP.radar,
                        bias: pi * 0.2,
                        covered,
                      })
                    )
                    compared++
                  }
              }

    expect(
      mismatches.length === 0
        ? "no mismatches"
        : `${mismatches.length} mismatches, first: ${JSON.stringify(mismatches[0])}`
    ).toBe("no mismatches")
    // Guards against the sweep silently degenerating to zero iterations, which
    // would make the equivalence claim vacuous.
    expect(compared).toBeGreaterThan(1_000_000)
  }, 60_000)
})

describe("ditherCell decision rules", () => {
  const base = {
    variant: "gradient",
    x: 0,
    y: 0,
    density: 0.5,
    intensity: 0,
    dim: 1,
    ramp: ALPHA_RAMP.cartesian,
  } as const

  it("returns null for a real gap, and an alpha for a faint tint", () => {
    // The distinction the whole `OFF_TIER` mechanism exists to make: `null`
    // lets the page show through, a low alpha paints the same colour faintly.
    //
    // `x: 3` is required, not incidental: at density 0 the dotted bias of 0.12
    // still leaves cells whose Bayer threshold is below 0.12 lit, and
    // BAYER[0][0] is 0.03125. Only the high thresholds in the matrix reject.
    expect(cell({ ...base, x: 3, y: 0, density: 0, variant: "dotted" })).toBeNull()
    expect(
      cell({ ...base, x: 3, y: 0, density: 0, variant: "gradient" })
    ).toBeTypeOf("number")
  })

  it("drops half the rows in hatched mode, so it is a mask rather than a dither", () => {
    // `((x + y) & 3) >= 2` on a 4-row period: two of every four are null
    // regardless of density, intensity or dim.
    for (let y = 0; y < 4; y++) {
      const alpha = cell({ ...base, variant: "hatched", x: 0, y, density: 1 })
      if (y < 2) expect(alpha).toBeTypeOf("number")
      else expect(alpha).toBeNull()
    }
  })

  it("covers every cell in solid mode — solid ignores the threshold entirely", () => {
    for (let y = 0; y < 16; y++) {
      expect(cell({ ...base, variant: "solid", x: 0, y, density: 0 })).toBeTypeOf(
        "number"
      )
    }
  })

  it("keeps a real gap over a covered pixel for non-dotted variants too", () => {
    // Radar's only unique rule: an unlit cell on top of another layer stays
    // empty so the layer behind shows through, instead of blending to mud.
    // Find a cell the threshold rejects, then show `covered` flips it to null.
    const rejected = cell({ ...base, variant: "gradient", density: 0 })
    expect(rejected).toBeTypeOf("number")
    expect(
      cell({ ...base, variant: "gradient", density: 0, covered: true })
    ).toBeNull()
  })

  it("raises alpha with intensity", () => {
    // Measured at half density, not full: at density 1 the ramp already lands
    // on 1 and the intensity lift is absorbed by the 0–1 clamp, so asserting
    // there would compare 1 to 1.
    const calm = cell({ ...base, density: 0.5, variant: "solid" }) as number
    const lifted = cell({
      ...base,
      density: 0.5,
      variant: "solid",
      intensity: 1,
    }) as number
    expect(lifted).toBeGreaterThan(calm)
    // The lift is `1 + 0.22 * intensity`, so a full lift is exactly +22%.
    expect(lifted / calm).toBeCloseTo(1.22, 12)
  })

  it("saturates at exactly 1 for a full-density cell at any intensity", () => {
    for (const intensity of INTENSITIES) {
      expect(cell({ ...base, density: 1, variant: "solid", intensity })).toBe(1)
    }
  })

  it("scales every alpha by dim", () => {
    const lit = cell({ ...base, variant: "solid", density: 1 }) as number
    const dim = cell({ ...base, variant: "solid", density: 1, dim: DIM }) as number
    expect(dim).toBeCloseTo(lit * DIM, 12)
  })

  it("never returns an alpha outside 0–1", () => {
    // The original cartesian copy clamped; pie and radar only capped at 1.
    // Whichever was true before, an out-of-range alpha reaching `rgb()` would
    // be a silently invalid colour, so assert the invariant on all ramps.
    for (const ramp of Object.values(ALPHA_RAMP))
      for (const variant of VARIANTS)
        for (const intensity of INTENSITIES)
          for (const density of DENSITIES) {
            const alpha = cell({ ...base, variant, intensity, density, ramp })
            if (alpha !== null) {
              expect(alpha).toBeGreaterThanOrEqual(0)
              expect(alpha).toBeLessThanOrEqual(1)
            }
          }
  })
})

describe("ALPHA_RAMP", () => {
  it("keeps the three shipped tunings distinct rather than silently merging them", () => {
    // These were three different inline pairs that were never reconciled. If
    // someone unifies them this fails, which is the point: that is a visual
    // decision to make deliberately, with the three chart families in view —
    // not something to arrive at by tidying.
    const pairs = Object.values(ALPHA_RAMP).map((r) => `${r.floor}+${r.span}`)
    expect(pairs).toEqual(["0.3+0.7", "0.35+0.65", "0.32+0.68"])
    expect(new Set(pairs).size).toBe(3)
  })

  it("reaches exactly full alpha at density 1 for every painter", () => {
    for (const ramp of Object.values(ALPHA_RAMP)) {
      expect(ramp.floor + ramp.span).toBe(1)
    }
  })
})
