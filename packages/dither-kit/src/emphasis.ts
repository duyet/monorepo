/** Which series the spotlight is on.
 *
 * Two inputs feed it in every chart family: an explicit selection (the user
 * clicked a series or a legend entry) and a transient legend hover. Selection
 * wins, so a hovered entry never overrides a committed selection. Everything
 * else dims — the DOM parts drop to `opacity-40` via `isDimmed`, the dither
 * canvas multiplies alpha by `dimOf`.
 *
 * Kept in its own dependency-free module so both context controllers, the SVG
 * parts and the canvas painters can share it without importing each other.
 */
export type EmphasisState = {
  selectedDataKey: string | null
  focusDataKey: string | null
}

/** Alpha multiplier for a non-spotlighted series on the dither canvas. */
export const DIM = 0.3

/** The spotlighted series key, or null when nothing is emphasized. */
export function emphasisOf({
  selectedDataKey,
  focusDataKey,
}: EmphasisState): string | null {
  return selectedDataKey ?? focusDataKey
}

/** Whether `key` is in the dimmed set — i.e. anything but the spotlight. */
export function isDimmed(emphasis: string | null, key: string): boolean {
  return emphasis !== null && emphasis !== key
}

/** `isDimmed` as the canvas' 0–1 alpha multiplier. */
export function dimOf(emphasis: string | null, key: string): number {
  return isDimmed(emphasis, key) ? DIM : 1
}
