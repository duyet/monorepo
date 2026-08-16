/**
 * Normalizes a possibly-millisecond epoch timestamp to epoch seconds.
 * Any adapter, LLM response, or accidental `Date.now()` can hand us a
 * millisecond value; the schema and downstream consumers store/expect
 * epoch seconds throughout.
 *
 * 1e12 seconds is year ~33658, well beyond any real timestamp, while a
 * genuine millisecond timestamp for anything after 2001 exceeds it — so
 * treating anything above it as milliseconds is safe and unambiguous.
 */
export function toEpochSeconds(value: number): number {
  return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
}
