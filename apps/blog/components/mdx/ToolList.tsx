"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Search, Filter, X } from "lucide-react";

interface ToolItem {
  name: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
  openSource?: boolean;
}

interface ToolListProps {
  tools: ToolItem[];
  title?: string;
  showCategories?: boolean;
}

export function ToolList({ tools, title = "Tool List", showCategories = true }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(tools.map(tool => tool.category)))];
  }, [tools]);

  const allTags = useMemo(() => {
    return Array.from(new Set(tools.flatMap(tool => tool.tags))).sort();
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Search filter
      const searchMatch = searchTerm === "" ||
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const categoryMatch = selectedCategory === "all" || tool.category === selectedCategory;

      // Tag filter
      const tagMatch = selectedTags.length === 0 ||
        selectedTags.every(tag => tool.tags.includes(tag));

      return searchMatch && categoryMatch && tagMatch;
    });
  }, [tools, searchTerm, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTags([]);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools, descriptions, or tags..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          {showCategories && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                      : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTools.length} of {tools.length} tools
            {searchTerm && ` · searching for "${searchTerm}"`}
            {selectedCategory !== "all" && ` · category: ${selectedCategory}`}
            {selectedTags.length > 0 && ` · tags: ${selectedTags.join(", ")}`}
          </div>
        )}
      </div>

      {/* Tool Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No tools found matching your filters</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-base">{tool.name}</h4>
                {tool.openSource !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tool.openSource
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {tool.openSource ? "OSS" : "Prop"}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {tool.description}
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {tool.category}
                </span>
                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visit →
                  </a>
                )}
              </div>

              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tool.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}