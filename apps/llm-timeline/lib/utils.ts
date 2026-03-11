import type { Model } from "./data";
import { getParamsBucket, parseParamValue } from "@duyet/libs";

export interface FilterState {
  search: string;
  license: "all" | "open" | "closed" | "partial";
  type: "all" | "model" | "milestone";
  org: string;
  source: string; // 'all' or source name like 'curated', 'epoch'
  domain: string; // 'all' or domain name like 'Language', 'Vision', 'Biology'
  params: string; // 'all' | 'small' | 'medium' | 'large' | 'xl' | 'unknown'
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  license: "all",
  type: "all",
  org: "",
  source: "all",
  domain: "all",
  params: "all",
};

// Re-export getParamsBucket for convenience
export { getParamsBucket };

/**
 * Filter models based on search and filter criteria
 */
export function filterModels(models: Model[], filters: FilterState): Model[] {
  return models.filter((model) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        model.name.toLowerCase().includes(searchLower) ||
        model.org.toLowerCase().includes(searchLower) ||
        model.desc.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // License filter
    if (filters.license !== "all" && model.license !== filters.license) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && model.type !== filters.type) {
      return false;
    }

    // Organization filter
    if (filters.org && model.org !== filters.org) {
      return false;
    }

    // Source filter
    if (filters.source !== "all" && model.source !== filters.source) {
      return false;
    }

    // Domain filter
    if (filters.domain !== "all" && filters.domain !== "") {
      if (!model.domain) return false;
      const modelDomains = model.domain.split(",").map((d) => d.trim());
      if (!modelDomains.includes(filters.domain)) return false;
    }

    // Params filter
    if (
      filters.params !== "all" &&
      getParamsBucket(model.params) !== filters.params
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Group models by year
 */
export function groupByYear(models: Model[]): Map<number, Model[]> {
  const groups = new Map<number, Model[]>();

  for (const model of models) {
    const year = new Date(model.date).getFullYear();
    const existing = groups.get(year) || [];
    existing.push(model);
    groups.set(year, existing);
  }

  // Sort each group by date (newest first)
  groups.forEach((yearModels, year) => {
    groups.set(
      year,
      yearModels.sort(
        (a: Model, b: Model) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  });

  return groups;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get color for license type
 */
export function getLicenseColor(license: Model["license"]): string {
  switch (license) {
    case "open":
      return "bg-sage-light text-sage-dark border-sage";
    case "closed":
      return "bg-coral-light text-coral-dark border-coral";
    case "partial":
      return "bg-lavender-light text-lavender-dark border-lavender";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

/**
 * Get color for model type
 */
export function getTypeColor(type: Model["type"]): string {
  switch (type) {
    case "milestone":
      return "bg-terracotta-light text-terracotta-dark border-terracotta";
    case "model":
      return "bg-oat-light text-neutral-700 border-oat";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

const SOURCE_COLORS: Record<string, string> = {
  curated:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  epoch:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
};

/**
 * Get color for data source
 */
export function getSourceColor(source?: string): string {
  if (source && source in SOURCE_COLORS) return SOURCE_COLORS[source];
  return "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700";
}

/**
 * Group models by organization
 * Sorted by model count descending; within each org sorted by date descending
 */
export function groupByOrg(models: Model[]): Map<string, Model[]> {
  const groups = new Map<string, Model[]>();

  for (const model of models) {
    const existing = groups.get(model.org) || [];
    existing.push(model);
    groups.set(model.org, existing);
  }

  // Sort each group by date descending
  groups.forEach((orgModels, org) => {
    groups.set(
      org,
      orgModels.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  });

  // Return map sorted by model count descending
  return new Map(
    Array.from(groups.entries()).sort(([, a], [, b]) => b.length - a.length)
  );
}

/**
 * Calculate statistics from models
 */
export function getStats(models: Model[]) {
  const sources: Record<string, number> = {};
  for (const m of models) {
    if (m.source) {
      sources[m.source] = (sources[m.source] || 0) + 1;
    }
  }

  return {
    total: models.length,
    models: models.filter((m) => m.type === "model").length,
    milestones: models.filter((m) => m.type === "milestone").length,
    organizations: new Set(models.map((m) => m.org)).size,
    years: new Set(models.map((m) => new Date(m.date).getFullYear())).size,
    open: models.filter((m) => m.license === "open").length,
    closed: models.filter((m) => m.license === "closed").length,
    sources,
  };
}

// Re-export getSlug from @duyet/libs for convenience
export { getSlug as slugify } from "@duyet/libs";

const DAYS_PER_MONTH = 30;
const PARAM_PROXIMITY_THRESHOLD = 0.5; // Within 2x range

/** Fewer related models shown in card UI (vs default limit of 5) */
export const MODEL_CARD_RELATED_MODELS_LIMIT = 4;

/**
 * Find related models based on organization, license, and parameter proximity.
 * Returns up to limit related models, excluding the current model.
 *
 * @performance O(n) where n = allModels.length. Called per model card,
 * so total is O(n²) across all cards. Consider precomputing at build time
 * if performance issues arise (currently ~200 models × ~200 comparisons).
 */
export function getRelatedModels(
  currentModel: Model,
  allModels: Model[],
  limit: number = 5
): Model[] {
  // Internal scoring weights - kept inside function to avoid leaking implementation details
  const WEIGHTS = {
    SAME_ORG: 30,
    SAME_LICENSE: 20,
    SAME_TYPE: 10,
    PARAM_PROXIMITY_MAX: 40,
    RECENCY_BONUS_MAX: 10,
  } as const;

  const currentParams = parseParamValue(currentModel.params) ?? 0;
  const currentDate = new Date(currentModel.date).getTime();

  // Score each model based on similarity
  const scored = allModels
    .filter((m) => m.name !== currentModel.name)
    .map((model) => {
      let score = 0;

      // Same organization
      if (model.org === currentModel.org) {
        score += WEIGHTS.SAME_ORG;
      }

      // Same license
      if (model.license === currentModel.license) {
        score += WEIGHTS.SAME_LICENSE;
      }

      // Same type
      if (model.type === currentModel.type) {
        score += WEIGHTS.SAME_TYPE;
      }

      // Parameter proximity: closer is better
      const modelParams = parseParamValue(model.params) ?? 0;
      if (currentParams > 0 && modelParams > 0) {
        const ratio = Math.min(currentParams, modelParams) / Math.max(currentParams, modelParams);
        if (ratio >= PARAM_PROXIMITY_THRESHOLD) {
          score += Math.round(WEIGHTS.PARAM_PROXIMITY_MAX * ratio);
        }
      }

      // Recency bonus: newer models get slight bonus
      const modelDate = new Date(model.date).getTime();
      if (modelDate > currentDate) {
        const daysDiff = Math.floor((modelDate - currentDate) / (1000 * 60 * 60 * 24));
        score += Math.min(
          WEIGHTS.RECENCY_BONUS_MAX,
          Math.max(0, daysDiff / DAYS_PER_MONTH)
        );
      }

      return { model, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ model }) => model);

  return scored;
}
