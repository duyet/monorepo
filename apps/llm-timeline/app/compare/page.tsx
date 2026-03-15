"use client";

import { parseParamValue } from "@duyet/libs";
import { Download, Plus, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import type { Model } from "@/lib/data";
import { models } from "@/lib/data";
import { formatDate, getLicenseBarColor, getLicenseColor, slugify } from "@/lib/utils";

// Maximum number of models that can be compared
const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

function parseModelNamesFromParam(params: string | null): string[] {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const urlModels = parseModelNamesFromParam(searchParams.get("models"));

  // Get model objects from URL names
  const getModelsFromNames = (names: string[]): Model[] => {
    const found: Model[] = [];
    for (const name of names) {
      const model = models.find((m) => slugify(m.name) === slugify(name));
      if (model && !found.find((f) => f.name === model.name)) {
        found.push(model);
      }
    }
    return found;
  };

  const [selectedModels, setSelectedModels] = useState<Model[]>(() =>
    getModelsFromNames(urlModels)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  // Update URL when selection changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (selectedModels.length > 0) {
      params.set(
        "models",
        selectedModels.map((m) => slugify(m.name)).join(",")
      );
    }
    const newUrl = params.toString() ? `/compare?${params}` : "/compare";
    window.history.replaceState({}, "", newUrl);
  }, [selectedModels]);

  // Filter models for selector
  const availableModels = useMemo(() => {
    return models.filter((model) => {
      // Exclude already selected models
      if (selectedModels.find((m) => m.name === model.name)) return false;
      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(q) ||
          model.org.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedModels]);

  // Sort selected models by date (newest first)
  const sortedModels = useMemo(() => {
    return [...selectedModels].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [selectedModels]);

  const addModel = (model: Model) => {
    if (selectedModels.length >= MAX_COMPARE) return;
    if (selectedModels.find((m) => m.name === model.name)) return;
    setSelectedModels([...selectedModels, model]);
    setSearchQuery("");
    setShowSelector(false);
  };

  const removeModel = (modelName: string) => {
    setSelectedModels(selectedModels.filter((m) => m.name !== modelName));
  };

  // Get max param value for chart scaling
  const maxParams = Math.max(
    ...sortedModels.map((m) => parseParamValue(m.params) || 0),
    1
  );

  const hasComparison = sortedModels.length >= MIN_COMPARE;

  // Export comparison data to CSV
  const exportToCSV = () => {
    if (sortedModels.length < MIN_COMPARE) return;

    // Define CSV headers
    const headers = [
      "Model",
      "Organization",
      "Release Date",
      "Parameters",
      "License",
      "Type",
      "Description",
    ];

    // Convert models to CSV rows
    const rows = sortedModels.map((model) => [
      model.name,
      model.org,
      formatDate(model.date),
      model.params || "Unknown",
      model.license,
      model.type,
      `"${model.desc.replace(/"/g, '""')}"`, // Escape quotes in description
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `llm-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with model selector */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Model Comparison
        </h2>

        {/* Selected models */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedModels.map((model) => (
            <div
              key={model.name}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-[#fbf7f0] dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100"
            >
              <span className="font-medium">{model.name}</span>
              <button
                onClick={() => removeModel(model.name)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                aria-label={`Remove ${model.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {selectedModels.length < MAX_COMPARE && (
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400"
            >
              <Plus className="h-4 w-4" />
              <span>
                {selectedModels.length === 0
                  ? "Add models to compare"
                  : "Add another"}
              </span>
            </button>
          )}
        </div>

        {/* Model selector dropdown */}
        {showSelector && (
          <div className="mb-4 p-4 rounded-xl border border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <input
                type="text"
                placeholder="Search models by name or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md border border-neutral-200 dark:border-white/10 bg-[#fbf7f0] dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100"
              />
              <button
                onClick={() => setShowSelector(false)}
                className="px-3 py-2 rounded-md border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                Cancel
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableModels.length === 0 ? (
                <p className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                  No matching models found
                </p>
              ) : (
                availableModels.slice(0, 50).map((model) => (
                  <button
                    key={model.name}
                    onClick={() => addModel(model)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-neutral-900 dark:text-neutral-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div className="text-sm truncate text-neutral-500 dark:text-neutral-400">
                        {model.org}
                        {model.params && ` · ${model.params}`}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Comparison view */}
      {sortedModels.length > 0 ? (
        <div className="space-y-6">
          {/* Comparison table */}
          <div className="rounded-xl border border-neutral-200 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <th className="px-4 py-3 text-left font-semibold w-32">
                    Metric
                  </th>
                  {sortedModels.map((model) => (
                    <th
                      key={model.name}
                      className="px-4 py-3 text-left font-semibold"
                    >
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Organization */}
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Organization
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {model.org}
                    </td>
                  ))}
                </tr>

                {/* Release Date */}
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Release Date
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {formatDate(model.date)}
                    </td>
                  ))}
                </tr>

                {/* Parameters */}
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Parameters
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {model.params || "Unknown"}
                    </td>
                  ))}
                </tr>

                {/* License */}
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    License
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${getLicenseColor(model.license)}`}
                      >
                        {model.license}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Type */}
                <tr className="border-b border-neutral-200 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Type
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3 capitalize">
                      {model.type}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="px-4 py-3 font-medium align-top text-neutral-500 dark:text-neutral-400">
                    Description
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3 text-sm">
                      {model.desc}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Parameters bar chart */}
          {sortedModels.some((m) => m.params) && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
                Parameter Count Comparison
              </h3>
              <div className="space-y-3">
                {sortedModels.map((model) => {
                  const paramValue = parseParamValue(model.params);
                  if (!paramValue) return null;

                  const percentage = (paramValue / maxParams) * 100;

                  return (
                    <div key={model.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {model.name}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {model.params}
                        </span>
                      </div>
                      <div className="h-8 rounded-md overflow-hidden relative bg-neutral-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-md transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getLicenseBarColor(model.license),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs mt-3 text-neutral-500 dark:text-neutral-400">
                * Models with unknown parameter counts are excluded from the
                chart
              </p>
            </div>
          )}

          {/* Share link and export */}
          {hasComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Share link */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                <p className="text-sm mb-2 text-neutral-500 dark:text-neutral-400">
                  Share this comparison:
                </p>
                <code className="text-sm px-2 py-1 rounded bg-[#fbf7f0] dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100">
                  {typeof window !== "undefined"
                    ? window.location.href
                    : "/compare"}
                </code>
              </div>

              {/* Export to CSV */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                <p className="text-sm mb-2 text-neutral-500 dark:text-neutral-400">
                  Export comparison data:
                </p>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 bg-[#fbf7f0] dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-white/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12 rounded-xl border border-neutral-200 dark:border-white/10">
          <p className="text-lg mb-2 text-neutral-500 dark:text-neutral-400">
            Select 2-4 models to compare
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Click the "Add models" button above to get started
          </p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <PageLayout description="Compare LLM models side-by-side">
      <Suspense
        fallback={<div className="text-neutral-900 dark:text-neutral-100">Loading...</div>}
      >
        <CompareContent />
      </Suspense>
    </PageLayout>
  );
}
