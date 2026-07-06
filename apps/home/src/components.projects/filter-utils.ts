import { type AppItem, apps } from "../data/projects";

export type FilterKey = "All" | "Live" | "OSS" | string;

export function categoryOf(item: AppItem): "Live" | "OSS" {
  return item.host === "github.com" ? "OSS" : "Live";
}

/** Unique tags across all projects, sorted alphabetically. */
export const ALL_TAGS = [...new Set(apps.flatMap((a) => a.tags ?? []))].sort();

export const FILTER_KEYS: FilterKey[] = ["All", "Live", "OSS", ...ALL_TAGS];

export const liveCount = apps.filter((a) => a.host !== "github.com").length;
