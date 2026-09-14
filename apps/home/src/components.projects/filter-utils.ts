import { type AppItem, apps } from "../data/projects";

export type FilterKey = "All" | "Live" | "OSS" | string;
export type ViewMode = "list" | "grid";

export function categoryOf(item: AppItem): "Live" | "OSS" {
  return item.host === "github.com" ? "OSS" : "Live";
}

/** Unique tags across all projects, sorted alphabetically. */
export const ALL_TAGS = [...new Set(apps.flatMap((a) => a.tags ?? []))].sort();

export const FILTER_KEYS: FilterKey[] = ["All", "Live", "OSS", ...ALL_TAGS];

export const liveCount = apps.filter((a) => a.host !== "github.com").length;

export const PROJECT_CATEGORY_ORDER = [
  "AI",
  "Data",
  "Infra",
  "Tool",
  "News",
  "TypeScript",
  "Rust",
  "FE",
  "Security",
  "Other",
] as const;

export function groupKey(item: AppItem): string {
  return item.tags?.[0] ?? "Other";
}

export function listingPath(item: AppItem): string {
  if (item.domain) return `/${item.domain.split(".")[0]}`;
  const source = item.repo ?? item.href;
  try {
    const url = new URL(source);
    if (url.hostname.includes("github")) {
      return url.pathname.replace(/\/$/, "") || `/${slugify(item.name)}`;
    }
  } catch {
    /* keep slug fallback */
  }
  return `/${slugify(item.name)}`;
}

export function listingTarget(item: AppItem): string {
  if (item.domain) return `https://${item.domain}`;
  return item.href.split("?")[0];
}

export function matchesQuery(item: AppItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.name.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.host.toLowerCase().includes(q) ||
    listingPath(item).toLowerCase().includes(q) ||
    (item.domain?.toLowerCase().includes(q) ?? false) ||
    (item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
  );
}

export function groupProjects(items: AppItem[]): Map<string, AppItem[]> {
  const map = new Map<string, AppItem[]>();
  for (const item of items) {
    const key = groupKey(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  const sorted = new Map<string, AppItem[]>();
  for (const key of PROJECT_CATEGORY_ORDER) {
    const entries = map.get(key);
    if (entries) sorted.set(key, entries);
  }
  map.forEach((entries, key) => {
    if (!sorted.has(key)) sorted.set(key, entries);
  });
  return sorted;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
