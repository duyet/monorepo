const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function datePart(parsed: Date): string {
  return `${parsed.getUTCDate()} ${MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}

/**
 * Format the sheet-sync stamp written into lib/data.ts.
 * A date-only value stays a date. A full ISO timestamp includes the UTC time.
 * Unparseable input is returned unchanged.
 */
export function formatSyncTime(stamp: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(stamp);
  if (dateOnly) {
    const parsed = new Date(`${stamp}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return stamp;
    return datePart(parsed);
  }

  const parsed = new Date(stamp);
  if (Number.isNaN(parsed.getTime())) return stamp;

  const time = /T(\d{2}):(\d{2})/.exec(stamp);
  if (!time) return datePart(parsed);
  return `${datePart(parsed)}, ${time[1]}:${time[2]} UTC`;
}
