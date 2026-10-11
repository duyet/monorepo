/** Shared locale for Burns dates and numbers so hero metadata cannot drift. */
export const BURNS_LOCALE = "en-GB";

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD value as a local calendar day. */
export function parseDay(iso: string): Date {
  const match = DAY.exec(iso);
  if (!match) return new Date(Number.NaN);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date(Number.NaN);
  }
  return date;
}

export function formatDay(iso: string, year: boolean = false): string {
  return parseDay(iso).toLocaleDateString(BURNS_LOCALE, {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" as const } : {}),
  });
}

/** Format a YYYY-MM(-DD) value as a month label, e.g. "Aug 2026". */
export function formatMonth(iso: string): string {
  return parseDay(`${iso.slice(0, 7)}-01`).toLocaleDateString(BURNS_LOCALE, {
    month: "short",
    year: "numeric",
  });
}

/**
 * Hero-meta label for the baked snapshot: the tracked range with the
 * generation day right after it, e.g.
 * "2 Aug 2025 — 3 Oct 2026 · Updated 4 Oct 2026". Keeping "Updated" next to
 * the latest tracked day makes a daily rebuild that still ends yesterday
 * obvious. `generatedAt` is a UTC instant, so its day is read in UTC.
 * Returns null when neither piece is known.
 */
export function dataLabel(
  firstDate: string | null,
  lastDate: string | null,
  generatedAt: string,
): string | null {
  const parts: string[] = [];
  if (firstDate && lastDate) {
    parts.push(`${formatDay(firstDate, true)} — ${formatDay(lastDate, true)}`);
  }
  const generated = new Date(generatedAt);
  if (!Number.isNaN(generated.getTime())) {
    parts.push(
      `Updated ${generated.toLocaleDateString(BURNS_LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })}`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
