import { format, formatDistance, formatDistanceToNowStrict } from "date-fns";

export function distanceToNow(dateTime: number | Date): string {
  return formatDistanceToNowStrict(dateTime, {
    addSuffix: true,
  });
}

export function distanceFormat(from: Date, to: Date): string {
  return formatDistance(from, to);
}

export function dateFormat(date: Date, formatString: string): string {
  return format(date, formatString);
}
