/**
 * Sizing math for the all-time token count.
 *
 * The count is the widest thing on the page and its width is not a CSS value:
 * it is a formatted number whose digit count grows with the total, so any size
 * picked from the viewport alone (`11vw`, `15vw`, …) fits the digits we have
 * today and overflows the screen the next time a digit is added. That is the
 * bug these helpers exist to remove.
 *
 * Two halves, on purpose:
 *
 * - `countEm` gives CSS enough to size the prerendered HTML, which has to be
 *   right before any script runs. It is a model of the count's own metrics,
 *   measured from the font the page loads.
 * - `fitCountPx` clamps what the counter measures against the real glyphs, so
 *   the model above only has to be close, not exact.
 */

/*
 * Measured from Inter at weight 500 with `font-variant-numeric: tabular-nums`,
 * which is what `.burns-count` sets. Tabular figures are why one advance fits
 * every digit: a count-up between two values cannot change the string's width,
 * so the fitted size never shifts while the number animates.
 */
const DIGIT_EM = 0.648;
const COMMA_EM = 0.2686;

/**
 * The count's `letter-spacing`, which the stylesheet applies to every
 * character. CSS resolves it in `em` against the count's own font-size, so it
 * scales with the count and belongs in the width model too.
 *
 * Keep in step with `letter-spacing` on `.burns-count` in `styles.css`.
 */
const TRACKING_EM = -0.045;

/** The font size the counter measures the string at before scaling it down. */
export const PROBE_PX = 100;

/** 8rem, the ceiling the count already had on desktop. */
export const MAX_COUNT_PX = 128;

/** Below this the count stops being the hero and starts being a footnote. */
export const MIN_COUNT_PX = 24;

/**
 * Width of a formatted token count in em, published to CSS as `--count-em`.
 *
 * Every character counts, because letter-spacing applies to all of them, and
 * a character that is neither a digit nor a comma is counted at digit width —
 * the widest of the two, so an unexpected character errs small (a count set
 * slightly narrow) rather than wide.
 */
export function countEm(text: string): number {
  let em = 0;
  for (const char of text) {
    em += (char === "," ? COMMA_EM : DIGIT_EM) + TRACKING_EM;
  }
  return em;
}

/**
 * The font size that makes measured text fill `availablePx`, clamped.
 *
 * `textWidthAtProbePx` is the string's rendered width at `PROBE_PX`. Tabular
 * figures scale linearly, so `availablePx / (width / PROBE_PX)` is the size
 * that fits exactly. Floored to whole pixels so rounding can never push the
 * count past the edge it was fitted to.
 */
export function fitCountPx(
  availablePx: number,
  textWidthAtProbePx: number,
  maxPx: number = MAX_COUNT_PX,
  minPx: number = MIN_COUNT_PX
): number {
  if (availablePx <= 0 || textWidthAtProbePx <= 0) return minPx;
  const emPerPx = textWidthAtProbePx / PROBE_PX;
  const fitted = Math.floor(availablePx / emPerPx);
  return Math.max(minPx, Math.min(maxPx, fitted));
}
