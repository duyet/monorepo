import { join } from "node:path";

export const ANALYTICS_CACHE_PATH =
  process.env.ANALYTICS_CACHE_PATH ||
  join(import.meta.dirname, "..", "data", "analytics-cache.duckdb");
