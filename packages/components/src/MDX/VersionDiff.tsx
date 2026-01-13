"use client";

import React, { useState } from "react";
import { GitBranch, GitMerge, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

interface VersionChange {
  type: "added" | "removed" | "modified" | "fixed";
  category: string;
  description: string;
  breaking?: boolean;
}

interface VersionDiffProps {
  fromVersion: string;
  toVersion: string;
  changes: VersionChange[];
  title?: string;
}

/**
 * VersionDiff - Interactive version comparison
 * Features: Filter by change type, show/hide breaking changes, expand categories
 */
export default function VersionDiff({ fromVersion, toVersion, changes, title = "Version Diff" }: VersionDiffProps) {
  const [selectedType, setSelectedType] = useState<"all" | VersionChange["type"]>("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showBreakingOnly, setShowBreakingOnly] = useState(false);

  const types = ["all", "added", "removed", "modified", "fixed"] as const;

  const filteredChanges = changes.filter((change) => {
    if (selectedType !== "all" && change.type !== selectedType) return false;
    if (showBreakingOnly && !change.breaking) return false;
    return true;
  });

  const groupedByCategory = filteredChanges.reduce((acc, change) => {
    if (!acc[change.category]) acc[change.category] = [];
    acc[change.category].push(change);
    return acc;
  }, {} as Record<string, VersionChange[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getTypeColor = (type: VersionChange["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800";
      case "removed":
        return "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 border-red-200 dark:border-red-800";
      case "modified":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800";
      case "fixed":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getTypeIcon = (type: VersionChange["type"]) => {
    const size = 14;
    switch (type) {
      case "added":
        return <Plus size={size} className="text-green-600 dark:text-green-400" />;
      case "removed":
        return <Minus size={size} className="text-red-600 dark:text-red-400" />;
      case "modified":
        return <GitMerge size={size} className="text-blue-600 dark:text-blue-400" />;
      case "fixed":
        return <GitBranch size={size} className="text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const calculateStats = () => {
    const stats = {
      added: changes.filter((c) => c.type === "added").length,
      removed: changes.filter((c) => c.type === "removed").length,
      modified: changes.filter((c) => c.type === "modified").length,
      fixed: changes.filter((c) => c.type === "fixed").length,
      breaking: changes.filter((c) => c.breaking).length,
      total: changes.length,
    };
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">v{fromVersion}</span>
              <span>→</span>
              <span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-semibold">v{toVersion}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBreakingOnly}
                onChange={(e) => setShowBreakingOnly(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                Breaking changes only
                {stats.breaking > 0 && (
                  <span className="ml-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded text-xs">
                    {stats.breaking}
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
            Total: {stats.total}
          </span>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
            Added: {stats.added}
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded">
            Removed: {stats.removed}
          </span>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            Modified: {stats.modified}
          </span>
          <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            Fixed: {stats.fixed}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(groupedByCategory).length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No changes match the selected filters
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([category, categoryChanges]) => {
            const isExpanded = expandedCategories.includes(category);

            return (
              <div key={category} className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded -mx-2"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {categoryChanges.length} changes
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 ml-4">
                    {categoryChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className={`border-l-4 pl-3 py-2 ${
                          change.breaking
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : getTypeColor(change.type).split(" border-")[1]
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(change.type)}
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-medium ${
                                  getTypeColor(change.type).split(" border")[0]
                                }`}
                              >
                                {change.type.toUpperCase()}
                              </span>
                              {change.breaking && (
                                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                                  BREAKING
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {change.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
        {filteredChanges.length} of {changes.length} changes shown
      </div>
    </div>
  );
}