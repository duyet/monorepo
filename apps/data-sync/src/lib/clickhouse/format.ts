/**
 * Value formatting helpers for ClickHouse row literals.
 *
 * Every helper here is a literal transcription of the inline expression it
 * replaces, so rows written to ClickHouse are byte-for-byte unchanged by the
 * call sites adopting them. Keep them that way: these are data-path helpers,
 * not cosmetic ones.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * "2026-05-25T20:30:00Z" -> "2026-05-25 20:30:00"
 *
 * The wire format ClickHouse's default (`basic`) DateTime parser expects.
 * Truncates sub-second precision, so DateTime64(3) columns land on .000.
 */
export function clickHouseDateTime(iso: string): string {
  return iso.slice(0, 19).replace("T", " ");
}

/** Current UTC time as a ClickHouse DateTime literal. */
export function clickHouseNow(): string {
  return clickHouseDateTime(new Date().toISOString());
}

/** "2026-05-25T20:30:00Z" -> "2026-05-25" (truncates, never reinterprets) */
export function isoDate(iso: string): string {
  return iso.split("T")[0];
}

/** Date -> "2026-05-25" (UTC day boundary) */
export function isoDateOf(date: Date): string {
  return isoDate(date.toISOString());
}

/** Whole days elapsed from `start` to `end`, floored. */
export function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/** A new Date `days` before `reference`. */
export function daysBefore(reference: Date, days: number): Date {
  return new Date(reference.getTime() - days * MS_PER_DAY);
}
