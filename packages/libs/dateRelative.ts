import { formatDistanceToNowStrict } from "date-fns";

export default function distanceToNow(dateTime: number | Date) {
  return formatDistanceToNowStrict(dateTime, {
    addSuffix: true,
  });
}
