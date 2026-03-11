"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { models } from "@/lib/data";
import { getLicenseColor, formatDate, slugify } from "@/lib/utils";
import { parseParamValue } from "@duyet/libs";
import { X, Plus, Search } from "lucide-react";
import type { Model } from "@/lib/data";

// Maximum number of models that can be compared
const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

function parseParamsValue(params: string | null): string[] {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const urlModels = parseParamsValue(searchParams.get("models"));

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
      params.set("models", selectedModels.map((m) => slugify(m.name)).join(","));
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

  return (
    <div className="space-y-6">
      {/* Header with model selector */}
      <div>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text)" }}
        >
          Model Comparison
        </h2>

        {/* Selected models */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedModels.map((model) => (
            <div
              key={model.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
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
          <div className="mb-4 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search models by name or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md border"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={() => setShowSelector(false)}
                className="px-3 py-2 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                Cancel
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableModels.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  No matching models found
                </p>
              ) : (
                availableModels.slice(0, 50).map((model) => (
                  <button
                    key={model.name}
                    onClick={() => addModel(model)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between"
                    style={{ color: "var(--text)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div
                        className="text-sm truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
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
          <div
            className="rounded-lg border overflow-x-auto"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <th className="px-4 py-3 text-left font-semibold w-32">
                    Metric
                  </th>
                  {sortedModels.map((model) => (
                    <th key={model.name} className="px-4 py-3 text-left font-semibold">
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Organization */}
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Organization
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {model.org}
                    </td>
                  ))}
                </tr>

                {/* Release Date */}
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Release Date
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {formatDate(model.date)}
                    </td>
                  ))}
                </tr>

                {/* Parameters */}
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Parameters
                  </td>
                  {sortedModels.map((model) => (
                    <td key={model.name} className="px-4 py-3">
                      {model.params || "Unknown"}
                    </td>
                  ))}
                </tr>

                {/* License */}
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                <tr
                  style={{ borderBottomColor: "var(--border)" }}
                  className="border-b"
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                  <td
                    className="px-4 py-3 font-medium align-top"
                    style={{ color: "var(--text-muted)" }}
                  >
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
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text)" }}
              >
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
                        <span className="font-medium" style={{ color: "var(--text)" }}>
                          {model.name}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {model.params}
                        </span>
                      </div>
                      <div
                        className="h-8 rounded-md overflow-hidden relative"
                        style={{
                          backgroundColor: "var(--border)",
                          opacity: 0.3,
                        }}
                      >
                        <div
                          className="h-full rounded-md transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getLicenseColor(model.license).split(" ")[0],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p
                className="text-xs mt-3"
                style={{ color: "var(--text-muted)" }}
              >
                * Models with unknown parameter counts are excluded from the chart
              </p>
            </div>
          )}

          {/* Share link */}
          {hasComparison && (
            <div
              className="p-4 rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                Share this comparison:
              </p>
              <code
                className="text-sm px-2 py-1 rounded"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
              >
                {typeof window !== "undefined" ? window.location.href : "/compare"}
              </code>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div
          className="text-center py-12 rounded-lg border"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-lg mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Select 2-4 models to compare
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
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
      <Suspense fallback={<div style={{ color: "var(--text)" }}>Loading...</div>}>
        <CompareContent />
      </Suspense>
    </PageLayout>
  );
}

export const dynamic = "force-static";
