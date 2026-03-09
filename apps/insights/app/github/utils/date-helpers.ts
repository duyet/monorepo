/**
 * Get the start of the week for a given date (Sunday)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
