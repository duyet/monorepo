import { jsx, jsxs } from "react/jsx-runtime";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { X, Plus, Search, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { P as PageLayout } from "./page-layout-AG6sMC_3.js";
import { m as models, g as getSlug } from "./router-8qeuaoTQ.js";
import { p as parseParamValue, f as formatDate, g as getLicenseColor, a as getLicenseBarColor } from "./utils-DRorGYoO.js";
import "next-themes";
import "fs";
const MAX_COMPARE = 4;
const MIN_COMPARE = 2;
function parseModelNamesFromParam(params) {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}
function ComparePage() {
  const search = useSearch({
    from: "/compare"
  });
  const navigate = useNavigate({
    from: "/compare"
  });
  const urlModels = parseModelNamesFromParam(search.models);
  const getModelsFromNames = (names) => {
    const found = [];
    for (const name of names) {
      const model = models.find((m) => getSlug(m.name) === getSlug(name));
      if (model && !found.find((f) => f.name === model.name)) {
        found.push(model);
      }
    }
    return found;
  };
  const [selectedModels, setSelectedModels] = useState(() => getModelsFromNames(urlModels));
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  const updateUrl = (next) => {
    navigate({
      search: {
        models: next.length > 0 ? next.map((m) => getSlug(m.name)).join(",") : ""
      },
      replace: true
    });
  };
  const availableModels = useMemo(() => {
    return models.filter((model) => {
      if (selectedModels.find((m) => m.name === model.name)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return model.name.toLowerCase().includes(q) || model.org.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, selectedModels]);
  const sortedModels = useMemo(() => {
    return [...selectedModels].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedModels]);
  const addModel = (model) => {
    if (selectedModels.length >= MAX_COMPARE) return;
    if (selectedModels.find((m) => m.name === model.name)) return;
    const next = [...selectedModels, model];
    setSelectedModels(next);
    updateUrl(next);
    setSearchQuery("");
    setShowSelector(false);
  };
  const removeModel = (modelName) => {
    const next = selectedModels.filter((m) => m.name !== modelName);
    setSelectedModels(next);
    updateUrl(next);
  };
  const maxParams = Math.max(...sortedModels.map((m) => parseParamValue(m.params) || 0), 1);
  const hasComparison = sortedModels.length >= MIN_COMPARE;
  const exportToCSV = () => {
    if (sortedModels.length < MIN_COMPARE) return;
    const headers = ["Model", "Organization", "Release Date", "Parameters", "License", "Type", "Description"];
    const rows = sortedModels.map((model) => [model.name, model.org, formatDate(model.date), model.params || "Unknown", model.license, model.type, `"${model.desc.replace(/"/g, '""')}"`]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `llm-comparison-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  return /* @__PURE__ */ jsx(PageLayout, { description: "Compare LLM models side-by-side", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100", children: "Model Comparison" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        sortedModels.map((model) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: model.name }),
          /* @__PURE__ */ jsx("button", { onClick: () => removeModel(model.name), className: "p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700", "aria-label": `Remove ${model.name}`, children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }, model.name)),
        selectedModels.length < MAX_COMPARE && /* @__PURE__ */ jsxs("button", { onClick: () => setShowSelector(!showSelector), className: "flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { children: selectedModels.length === 0 ? "Add models to compare" : "Add another" })
        ] })
      ] }),
      showSelector && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-neutral-500 dark:text-neutral-400" }),
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search models by name or organization...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "flex-1 px-3 py-2 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowSelector(false), className: "px-3 py-2 rounded-md border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100", children: "Cancel" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto space-y-1", children: availableModels.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center py-4 text-neutral-500 dark:text-neutral-400", children: "No matching models found" }) : availableModels.slice(0, 50).map((model) => /* @__PURE__ */ jsxs("button", { onClick: () => addModel(model), className: "w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-neutral-900 dark:text-neutral-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium truncate", children: model.name }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm truncate text-neutral-500 dark:text-neutral-400", children: [
              model.org,
              model.params && ` · ${model.params}`
            ] })
          ] }),
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 flex-shrink-0 ml-2" })
        ] }, model.name)) })
      ] })
    ] }),
    sortedModels.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-neutral-200 dark:border-white/10 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold w-32", children: "Metric" }),
          sortedModels.map((model) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold", children: model.name }, model.name))
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Organization" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: model.org }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Release Date" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: formatDate(model.date) }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Parameters" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: model.params || "Unknown" }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "License" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-md text-xs font-medium border ${getLicenseColor(model.license)}`, children: model.license }) }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-neutral-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400", children: "Type" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3 capitalize", children: model.type }, model.name))
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium align-top text-neutral-500 dark:text-neutral-400", children: "Description" }),
            sortedModels.map((model) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: model.desc }, model.name))
          ] })
        ] })
      ] }) }),
      sortedModels.some((m) => m.params) && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100", children: "Parameter Count Comparison" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sortedModels.map((model) => {
          const paramValue = parseParamValue(model.params);
          if (!paramValue) return null;
          const percentage = paramValue / maxParams * 100;
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-neutral-900 dark:text-neutral-100", children: model.name }),
              /* @__PURE__ */ jsx("span", { className: "text-neutral-500 dark:text-neutral-400", children: model.params })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-8 rounded-md overflow-hidden relative bg-neutral-200 dark:bg-white/10", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-md transition-all duration-500", style: {
              width: `${percentage}%`,
              backgroundColor: getLicenseBarColor(model.license)
            } }) })
          ] }, model.name);
        }) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs mt-3 text-neutral-500 dark:text-neutral-400", children: "* Models with unknown parameter counts are excluded from the chart" })
      ] }),
      hasComparison && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border border-neutral-200 dark:border-white/10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-2 text-neutral-500 dark:text-neutral-400", children: "Share this comparison:" }),
          /* @__PURE__ */ jsx("code", { className: "text-sm px-2 py-1 rounded bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-neutral-100", children: typeof window !== "undefined" ? window.location.href : "/compare" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border border-neutral-200 dark:border-white/10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-2 text-neutral-500 dark:text-neutral-400", children: "Export comparison data:" }),
          /* @__PURE__ */ jsxs("button", { onClick: exportToCSV, className: "flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs dark:border-white/10 dark:bg-white/5 text-neutral-900 dark:text-neutral-100 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Download CSV" })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12 rounded-xl border border-neutral-200 dark:border-white/10", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg mb-2 text-neutral-500 dark:text-neutral-400", children: "Select 2-4 models to compare" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: 'Click the "Add models" button above to get started' })
    ] })
  ] }) });
}
export {
  ComparePage as component
};
