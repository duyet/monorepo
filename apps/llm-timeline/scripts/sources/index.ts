/**
 * Source registry — all available DataSourceAdapters
 */

import type { DataSourceAdapter } from "../../lib/types";
import { curated } from "./curated";
import { epoch } from "./epoch";

export const ALL_SOURCES: DataSourceAdapter[] = [curated, epoch];

export function getEnabledSources(disabled: Set<string>): DataSourceAdapter[] {
  return ALL_SOURCES.filter((s) => !disabled.has(s.name));
}
