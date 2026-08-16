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
