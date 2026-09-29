/**
 * The ordered-dither core of an OG card, as a pure function.
 *
 * ## Why this is separated
 *
 * This logic used to live inside `ditherToSvg` in `og-card.ts`, behind a
 * `await import("sharp")`. The image resampling genuinely needs sharp, but the
 * part with the interesting behaviour does not: deciding which cells are lit,
 * collapsing them into horizontal runs, and choosing a colour per run. That part
 * was therefore **untestable** — the only way to exercise it was to run a real
 * image through libvips, which is neither fast nor hermetic, and so in practice
 * it was not exercised at all.
 *
 * Splitting it out means the run-grouping (which is what keeps the emitted SVG
 * small) and the accent-cutoff rule can be tested directly, with a synthetic
 * pixel buffer and no native dependency.
 *
 * Determinism is preserved exactly: the same buffer in produces the same SVG
 * out, which is what lets the generated cards be committed to `public/og/`.
 */

/**
 * 4×4 ordered (Bayer) matrix, normalized to 0–1 thresholds.
 *
 * Imported from `@duyet/dither-kit/dither-cell` so the OG cards and the
 * on-screen charts share one matrix — the previous copy here was a hand-typed
 * duplicate whose only guarantee was a comment saying it matched.
 */
import { BAYER as BAYER_4X4 } from "@duyet/dither-kit/dither-cell";

/** One horizontal run of lit cells: `[startX, y, length]`, in cell units. */
export type DitherRun = [number, number, number]

/** Rec. 709 luma of an RGB triple, normalized to 0..1. */
export function lumaAt(px: Uint8Array, offset: number): number {
  return (
    (0.2126 * px[offset] + 0.7152 * px[offset + 1] + 0.0722 * px[offset + 2]) /
    255
  )
}

/**
 * No luma clamp is applied, because for this input type there is nothing to
 * clamp.
 *
 * The original wrapped the luma in `Math.min(1, Math.max(0, …))` on the
 * theory that a resize could yield out-of-range values. It cannot: `pixels` is
 * a `Uint8Array`, so every component is 0–255, the Rec. 709 weights sum to
 * 1, and `lumaAt` is therefore always in [0, 1] by construction. The wrapper
 * was unreachable defensive code — and a mutation that removed it failed
 * nothing, which is the test telling you the guard guards nothing.
 *
 * If this ever accepts a non-byte buffer, the clamp has to come back with it.
 */

export type DitherOptions = {
  /** RGB triples, 3 bytes per pixel, row-major. */
  pixels: Uint8Array;
  /** Width of `pixels` in cells — the resampled buffer, not the output size. */
  pixelWidth: number;
  pixelHeight: number;
  /** Output size in CSS px. */
  outWidth: number;
  outHeight: number;
  /** CSS px per dither cell. */
  cell: number;
  /** >1 keeps more cells lit, for a lighter texture. */
  gamma?: number;
  /** Raises the Bayer threshold, thinning the dither. */
  bias?: number;
  /** `"duotone"` and `"invert"` flip dark cells to the accent colour. */
  useAccent: boolean;
  /** Luma above which a cell keeps the ink colour — light cells read as holes. */
  accentCutoff: number;
  /** Resolved colours, so this module needs no theme type. */
  ink: string;
  accent: string;
  /** Background behind the dither, emitted as the first rect. */
  ground: string;
}

/**
 * Ordered-dither an RGB pixel buffer into a standalone SVG.
 *
 * The output is a `<g>` of `<rect>` runs over a solid ground, sized
 * `outWidth` x `outHeight` in CSS px. `pixels` is expected to already be
 * resampled to the dither lattice — that resampling needs an image library and
 * is the only part of the pipeline that does.
 *
 * The two width pairs are separate on purpose: the buffer is small (the dither
 * lattice, e.g. 200x105) while the emitted SVG is the full card (1200x630), and
 * conflating them is the kind of thing that type-checks and renders wrong.
 */
export function ditherPixelsToSvg(options: DitherOptions): string {
  const {
    pixels,
    pixelWidth,
    cell,
    useAccent,
    accentCutoff,
    ink,
    accent,
    ground,
    outWidth,
    outHeight,
  } = options;

  const colorFor = (y: number, x: number): string => {
    if (!useAccent) return ink;
    const luma = lumaAt(pixels, (y * pixelWidth + x) * 3);
    return luma > accentCutoff ? ink : accent;
  };

  const rects = ditherRuns(options)
    .map(([rx, ry, rw]) => {
      const fill = colorFor(ry, rx);
      return `<rect x="${rx * cell}" y="${ry * cell}" width="${rw * cell}" height="${cell}" fill="${fill}"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outWidth}" height="${outHeight}" viewBox="0 0 ${outWidth} ${outHeight}">
<rect width="${outWidth}" height="${outHeight}" fill="${ground}"/>
<g>${rects}</g>
</svg>`;
}

/**
 * Collapse lit cells into horizontal runs.
 *
 * A full-bleed 6px dither over a 1200×630 card is ~200×105 = 21,000 cells,
 * which collapses to a few hundred runs. That collapse is the reason the output
 * is a readable file rather than a 21,000-element one, so it is worth testing on
 * its own.
 *
 * The colour of a run is sampled at its **first** cell, not its midpoint. That
 * is the shipped behaviour and it is slightly lossy: a run spanning a
 * highlight and a shadow takes the highlight's colour. Preserved deliberately —
 * the alternative changes every committed card, and the visual difference is
 * within the dither's own texture.
 */
export function ditherRuns(
  options: Pick<
    DitherOptions,
    "pixels" | "pixelWidth" | "pixelHeight" | "gamma" | "bias"
  >
): DitherRun[] {
  const { pixels, gamma = 1, bias = 0 } = options;
  const w = options.pixelWidth;
  const h = options.pixelHeight;

  const runs: DitherRun[] = [];
  for (let y = 0; y < h; y++) {
    let runStart = -1;
    // `x <= w` walks one past the last column so a run flushes at row end.
    for (let x = 0; x <= w; x++) {
      const lit =
        x < w &&
        lumaAt(pixels, (y * w + x) * 3) ** gamma >
          BAYER_4X4[y & 3][x & 3] + bias;
      if (lit && runStart === -1) runStart = x;
      if (!lit && runStart !== -1) {
        runs.push([runStart, y, x - runStart]);
        runStart = -1;
      }
    }
  }
  return runs;
}

