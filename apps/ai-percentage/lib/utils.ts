import type { DateRangeDays } from "./types";

export const DATE_RANGES = [
  { label: "30 days", value: "30d", days: 30 as const },
  { label: "90 days", value: "90d", days: 90 as const },
  { label: "6 months", value: "6m", days: 180 as const },
  { label: "1 year", value: "1y", days: 365 as const },
  { label: "All time", value: "all", days: "all" as const },
];

export function getDateCondition(days: DateRangeDays): string {
  if (days === "all") {
    return "";
  }
  return `WHERE date > today() - INTERVAL ${days} DAY`;
}

export { formatNumber } from "@duyet/libs";
