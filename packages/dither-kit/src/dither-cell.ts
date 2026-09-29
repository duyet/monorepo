import type { AreaVariant } from "./chart-context"

/**
 * 4×4 ordered (Bayer) matrix, normalized to 0–1 thresholds — the exact matrix
 * the legacy chart dithers with.
 *
 * Lives here rather than in `dither-paint` because the cell decision below is
 * its only consumer, and `dither-paint` re-exports it: this module owns the
 * threshold, `dither-paint` owns the painting.
 */
export const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/**
 * Opacity of a dither "off" cell relative to an "on" cell. The scatter modulates
 * between these two tiers of the *same* colour instead of leaving holes, so the
 * background never shows through as stark white on a light theme.
 */
export const OFF_TIER = 0.4

/**
 * The per-cell dither decision, shared by all three canvas painters
 * (`paintColumn`, `PieCanvas`, `RadarCanvas`).
 *
 * Each painter used to open-code the same five steps: skip the hatched
 * checkerboard, threshold `density` against the Bayer matrix to decide *lit*,
 * decide whether an unlit cell is a real gap or a faint tint, and map density to
 * alpha. The three copies had drifted — most visibly in the density→alpha
 * coefficients, which differ per painter and are now named constants below
 * rather than three inline magic pairs.
 *
 * Everything here is pure and returns the alpha to paint, so the painters keep
 * owning geometry (which pixel, which colour, when to skip a whole cell) and
 * this module owns the look.
 */

/**
 * Density→alpha ramp per painter: alpha at zero density, and how much of the
 * remaining range a full-density cell adds.
 *
 * These shipped as three different inline pairs (`0.3 + d*0.7`,
 * `0.35 + d*0.65`, `0.32 + d*0.68`) and were **not** unified: they are three
 * deliberate-looking tunings that were never reconciled, and picking one is a
 * visual-design decision, not a refactor. Each painter therefore keeps its own
 * value and the difference is now visible in one place instead of buried in
 * three loops. Every pair sums to 1, so each painter still reaches full alpha
 * at density 1.
 *
 * `span` is stored literally rather than derived as `1 - floor`: `1 - 0.32` is
 * one ULP off the `0.68` the original code used, which is enough to change the
 * last digit of every radar alpha. Bit-exactness is the whole point of a
 * refactor that is not meant to change a pixel.
 */
export const ALPHA_RAMP = {
  /** `paintColumn` — cartesian area/bar/line fills. */
  cartesian: { floor: 0.3, span: 0.7 },
  /** `PieCanvas` — dense at the outer rim, so a higher floor. */
  pie: { floor: 0.35, span: 0.65 },
  /** `RadarCanvas` — sits between the other two. */
  radar: { floor: 0.32, span: 0.68 },
} as const

export type AlphaRamp = (typeof ALPHA_RAMP)[keyof typeof ALPHA_RAMP]

/** Extra alpha the hover lift adds at full intensity. */
const INTENSITY_ALPHA = 0.22
/** How much the hover lift lowers the dither threshold. */
const INTENSITY_THRESHOLD = 0.1
/** Lifts the threshold for `dotted`, thinning it into real gaps. */
const DOTTED_BIAS = 0.12

export type CellInput = {
  variant: AreaVariant
  /** Backing-canvas coordinates, for the Bayer lookup and the hatched mask. */
  x: number
  y: number
  /** 0–1, how solid this cell should read. */
  density: number
  /** 0–1 hover lift. */
  intensity: number
  /** Emphasis multiplier: 1 for the spotlighted series, `DIM` for the rest. */
  dim: number
  /** Which painter's density→alpha ramp to use. */
  ramp: AlphaRamp
  /** Raises the threshold, thinning the dither. Stacked bands and front layers. */
  bias?: number
  /**
   * Whether a layer behind already coloured this pixel.
   *
   * Only radar has overlapping layers. It keeps a real gap over a covered pixel
   * so the layer behind shows through instead of being blended into a muddy
   * tint; the other two always pass `false` and tint unlit cells.
   */
  covered?: boolean
}

/** `null` means "paint nothing here" — a real gap, not a faint tint. */
export function ditherCell(input: CellInput): number | null {
  const { variant, x, y, density, intensity, dim, ramp, bias = 0 } = input

  // Hatched is a hard checkerboard, not a dither: drop half the rows outright.
  if (variant === "hatched" && ((x + y) & 3) >= 2) return null

  const lit =
    variant === "solid" ||
    density >
      BAYER[y & 3][x & 3] -
        INTENSITY_THRESHOLD * intensity -
        (variant === "dotted" ? DOTTED_BIAS : 0) +
        bias

  // Unlit cells: a real gap for `dotted` (its open look) and over a covered
  // pixel (the layer behind shows through). Everywhere else, paint the faint
  // tier so the page never bleeds in as stark white.
  const gap = variant === "dotted" || input.covered === true
  if (!lit && gap) return null

  const k = (ramp.floor + density * ramp.span) * (1 + INTENSITY_ALPHA * intensity)
  return clamp01((lit ? k : k * OFF_TIER) * dim)
}
