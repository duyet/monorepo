"use client";

import React, { useState } from "react";
import { Star, GitFork, ExternalLink, Search, Filter } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  tags: string[];
  featured?: boolean;
}

interface ToolListProps {
  tools: Tool[];
  title?: string;
}

/**
 * ToolList - Interactive searchable list of tools
 * Features: Full-text search, tag filtering, sorting by metrics
 */
export default function ToolList({ tools, title = "Tool List" }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"stars" | "name" | "forks">("stars");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Get all unique tags
  const allTags = Array.from(new Set(tools.flatMap((tool) => tool.tags))).sort();

  // Filter and sort tools
  const filteredTools = tools
    .filter((tool) => {
      const matchesSearch = searchTerm === "" ||
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag = selectedTag === "all" || tool.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "stars") comparison = a.stars - b.stars;
      if (sortBy === "forks") comparison = a.forks - b.forks;
      if (sortBy === "name") comparison = a.name.localeCompare(b.name);

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSortOrder = (newSortBy: "stars" | "name" | "forks") => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTools.length} tools
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tools, descriptions, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Tag filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={16} />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-1">
            {(
              [
                ["stars", "Stars"],
                ["name", "Name"],
                ["forks", "Forks"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => toggleSortOrder(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {label}
                {sortBy === value && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {filteredTools.map((tool, index) => (
          <div
            key={index}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {tool.name}
                  </a>
                  {tool.featured && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded font-medium">
                      Featured
                    </span>
                  )}
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-3 items-center text-xs">
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {tool.language}
                  </span>

                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Star size={12} className="fill-current" />
                    <span className="font-medium">{formatNumber(tool.stars)}</span>
                  </span>

                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <GitFork size={12} />
                    <span className="font-medium">{formatNumber(tool.forks)}</span>
                  </span>

                  <div className="flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {tool.tags.length > 3 && (
                      <span className="text-[10px] text-gray-500">
                        +{tool.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-right text-xs text-gray-400">
                <div>#{index + 1}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No tools match your search criteria
        </div>
      )}

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
        Click on tool names to visit their repositories
      </div>
    </div>
  );
}

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}