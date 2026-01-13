import * as React from "react";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface ToolItem {
  name: string;
  category: string;
  description: string;
  tags?: string[];
  url?: string;
}

interface ToolListProps {
  tools: ToolItem[];
  title?: string;
  showSearch?: boolean;
}

// Simple fuzzy search implementation
function fuzzyMatch(pattern: string, text: string): boolean {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();

  if (!pattern) return true;

  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < patternLower.length && textIdx < textLower.length) {
    if (patternLower[patternIdx] === textLower[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === patternLower.length;
}

export function ToolList({ tools, title = "Tool List", showSearch = true }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["all"]);
    tools.forEach(tool => cats.add(tool.category));
    return Array.from(cats);
  }, [tools]);

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Category filter
      if (selectedCategory !== "all" && tool.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!searchTerm) return true;

      const searchText = `${tool.name} ${tool.description} ${tool.tags?.join(" ") || ""}`;
      return fuzzyMatch(searchTerm, searchText);
    });
  }, [tools, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
      </div>

      {/* Filters */}
      {(showSearch || categories.length > 1) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col gap-3">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Category buttons */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-xs rounded-full border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {filteredTools.length} of {tools.length} tools
              {hasActiveFilters && " (filtered)"}
            </div>
          </div>
        </div>
      )}

      {/* Tool Grid */}
      <div className="p-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tools found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-base m-0">{tool.name}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {tool.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {tool.description}
                </p>

                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700"
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
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search tip */}
      {showSearch && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
          <strong>Search tip:</strong> Use keywords like category names, tags, or descriptive terms. Search is fuzzy and matches across names and descriptions.
        </div>
      )}
    </div>
  );
}