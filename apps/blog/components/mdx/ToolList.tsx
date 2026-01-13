"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Search, Filter, X } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  rating: number;
  url?: string;
}

interface ToolListProps {
  tools: Tool[];
  categories?: string[];
}

// Simple fuzzy matching algorithm
function fuzzyMatch(text: string, pattern: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();

  if (pattern === "") return true;

  let patternIdx = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    if (normalizedText[i] === normalizedPattern[patternIdx]) {
      patternIdx++;
      if (patternIdx === normalizedPattern.length) return true;
    }
  }
  return false;
}

export function ToolList({ tools, categories }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minRating, setMinRating] = useState(0);

  const allCategories = categories || ["all", ...Array.from(new Set(tools.map((t) => t.category)))] as string[];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== "all" && tool.category !== selectedCategory) {
        return false;
      }

      // Rating filter
      if (tool.rating < minRating) {
        return false;
      }

      // Fuzzy search
      if (searchTerm) {
        const searchText = `${tool.name} ${tool.description} ${tool.tags.join(" ")}`;
        return fuzzyMatch(searchText, searchTerm);
      }

      return true;
    });
  }, [tools, searchTerm, selectedCategory, minRating]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMinRating(0);
  };

  return (
    <div className="my-6">
      {/* Filters */}
      <div className="space-y-3 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search tools, descriptions, tags..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-900"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Min Rating:</span>
            <input
              type="range"
              min="0"
              max="10"
              value={minRating}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMinRating(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-mono">{minRating}</span>
          </div>

          {/* Clear button */}
          {(searchTerm || selectedCategory !== "all" || minRating > 0) && (
            <button
              onClick={clearFilters}
              className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
          {searchTerm && (
            <>
              {" "}for "<span className="font-mono">{searchTerm}</span>"
            </>
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:border-blue-500 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-base">{tool.name}</h4>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < Math.round(tool.rating / 2)
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tool.description}</p>

            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                {tool.category}
              </span>
              <span className="text-gray-500">Rating: {tool.rating}/10</span>
            </div>

            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {tool.url && (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 mt-2 inline-block"
              >
                Visit →
              </a>
            )}
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tools found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-500 hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}