import type { CloudflareSummary } from "./types";

export function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function getTrafficData(cloudflare: CloudflareSummary) {
  return (
    cloudflare.data.viewer.zones[0]?.httpRequests1dGroups?.map((item) => ({
      date: shortDate(item.date.date),
      pageViews: item.sum.pageViews,
      requests: item.sum.requests,
      visitors: item.uniq.uniques,
    })) ?? []
  );
}

export function shortDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

const SNAPSHOT_MONTHS = [
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
] as const;

/** UTC clock time of a baked analytics payload. Null when the stamp is missing. */
export function formatSnapshotTime(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const day = parsed.getUTCDate();
  const month = SNAPSHOT_MONTHS[parsed.getUTCMonth()];
  const year = parsed.getUTCFullYear();
  const hours = String(parsed.getUTCHours()).padStart(2, "0");
  const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

export function compactName(name: string) {
  return name
    .replace(/^claude-/, "")
    .replace(/^gpt-/, "gpt ")
    .replace(/-/g, " ")
    .slice(0, 24);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value > 10 ? 0 : 1,
  }).format(value || 0);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value || 0);
}
