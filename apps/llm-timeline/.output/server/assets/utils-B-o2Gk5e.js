import "./router-CuHdCRg8.js";
function parseParamValue(params) {
  if (!params) return null;
  const cleaned = params.replace(/^[~<>≈]/, "").trim();
  const match = cleaned.match(/^([\d.]+)([KMBT])/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  let billions = value;
  if (unit === "K") billions = value / 1e6;
  else if (unit === "M") billions = value / 1e3;
  else if (unit === "T") billions = value * 1e3;
  return billions;
}
function getParamsBucket(params) {
  if (!params) return "unknown";
  const billions = parseParamValue(params);
  if (billions === null) return params;
  if (billions < 1) return "small";
  if (billions < 10) return "medium";
  if (billions < 100) return "large";
  return "xl";
}
const DEFAULT_FILTERS = {
  search: "",
  license: "all",
  type: "all",
  org: "",
  source: "all",
  domain: "all",
  params: "all"
};
function filterModels(models, filters) {
  return models.filter((model) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = model.name.toLowerCase().includes(searchLower) || model.org.toLowerCase().includes(searchLower) || model.desc.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.license !== "all" && model.license !== filters.license) {
      return false;
    }
    if (filters.type !== "all" && model.type !== filters.type) {
      return false;
    }
    if (filters.org && model.org !== filters.org) {
      return false;
    }
    if (filters.source !== "all" && model.source !== filters.source) {
      return false;
    }
    if (filters.domain !== "all" && filters.domain !== "") {
      if (!model.domain) return false;
      const modelDomains = model.domain.split(",").map((d) => d.trim());
      if (!modelDomains.includes(filters.domain)) return false;
    }
    if (filters.params !== "all" && getParamsBucket(model.params) !== filters.params) {
      return false;
    }
    return true;
  });
}
function groupByYear(models) {
  const groups = /* @__PURE__ */ new Map();
  for (const model of models) {
    const year = new Date(model.date).getFullYear();
    const existing = groups.get(year) || [];
    existing.push(model);
    groups.set(year, existing);
  }
  groups.forEach((yearModels, year) => {
    groups.set(
      year,
      yearModels.map((m) => ({ m, t: new Date(m.date).getTime() })).sort((a, b) => b.t - a.t).map(({ m }) => m)
    );
  });
  return groups;
}
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
function getLicenseColor(license) {
  switch (license) {
    case "open":
      return "bg-sage-light text-emerald-800 border-sage dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    case "closed":
      return "bg-coral-light text-red-800 border-coral dark:bg-red-950 dark:text-red-300 dark:border-red-800";
    case "partial":
      return "bg-lavender-light text-indigo-800 border-lavender dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
  }
}
function getLicenseBarColor(license) {
  switch (license) {
    case "open":
      return "#8B9F83";
    // sage green
    case "closed":
      return "#A0616A";
    // rose/coral
    case "partial":
      return "#7B8DB8";
    // lavender blue
    default:
      return "#9CA3AF";
  }
}
function getTypeColor(type) {
  switch (type) {
    case "milestone":
      return "bg-terracotta-light text-orange-800 border-terracotta dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800";
    case "model":
      return "bg-oat-light text-neutral-700 border-oat dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
  }
}
const SOURCE_COLORS = {
  curated: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  epoch: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
};
function getSourceColor(source) {
  if (source && source in SOURCE_COLORS) return SOURCE_COLORS[source];
  return "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700";
}
function groupByOrg(models) {
  const groups = /* @__PURE__ */ new Map();
  for (const model of models) {
    const existing = groups.get(model.org) || [];
    existing.push(model);
    groups.set(model.org, existing);
  }
  groups.forEach((orgModels, org) => {
    groups.set(
      org,
      orgModels.map((m) => ({ m, t: new Date(m.date).getTime() })).sort((a, b) => b.t - a.t).map(({ m }) => m)
    );
  });
  return new Map(
    Array.from(groups.entries()).sort(([, a], [, b]) => b.length - a.length)
  );
}
function getStats(models) {
  const sources = {};
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
    sources
  };
}
const DAYS_PER_MONTH = 30;
const PARAM_PROXIMITY_THRESHOLD = 0.5;
const MODEL_CARD_RELATED_MODELS_LIMIT = 4;
function getRelatedModels(currentModel, allModels, limit = 5) {
  const WEIGHTS = {
    SAME_ORG: 30,
    SAME_LICENSE: 20,
    SAME_TYPE: 10,
    PARAM_PROXIMITY_MAX: 40,
    RECENCY_BONUS_MAX: 10
  };
  const currentParams = parseParamValue(currentModel.params) ?? 0;
  const currentDate = new Date(currentModel.date).getTime();
  const scored = allModels.filter((m) => m.name !== currentModel.name).map((model) => {
    let score = 0;
    if (model.org === currentModel.org) {
      score += WEIGHTS.SAME_ORG;
    }
    if (model.license === currentModel.license) {
      score += WEIGHTS.SAME_LICENSE;
    }
    if (model.type === currentModel.type) {
      score += WEIGHTS.SAME_TYPE;
    }
    const modelParams = parseParamValue(model.params) ?? 0;
    if (currentParams > 0 && modelParams > 0) {
      const ratio = Math.min(currentParams, modelParams) / Math.max(currentParams, modelParams);
      if (ratio >= PARAM_PROXIMITY_THRESHOLD) {
        score += Math.round(WEIGHTS.PARAM_PROXIMITY_MAX * ratio);
      }
    }
    const modelDate = new Date(model.date).getTime();
    if (modelDate > currentDate) {
      const daysDiff = Math.floor(
        (modelDate - currentDate) / (1e3 * 60 * 60 * 24)
      );
      score += Math.min(
        WEIGHTS.RECENCY_BONUS_MAX,
        Math.max(0, daysDiff / DAYS_PER_MONTH)
      );
    }
    return { model, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(({ model }) => model);
  return scored;
}
export {
  DEFAULT_FILTERS as D,
  MODEL_CARD_RELATED_MODELS_LIMIT as M,
  getLicenseBarColor as a,
  getStats as b,
  filterModels as c,
  getTypeColor as d,
  getSourceColor as e,
  formatDate as f,
  getLicenseColor as g,
  getRelatedModels as h,
  groupByYear as i,
  groupByOrg as j,
  parseParamValue as p
};
