import { formatDistance, formatDistanceToNowStrict } from "date-fns";

export default function distanceToNow(dateTime: number | Date) {
  return formatDistanceToNowStrict(dateTime, {
    addSuffix: true,
  });
}

export function distanceFormat(from: Date, to: Date) {
  return formatDistance(from, to);
}
