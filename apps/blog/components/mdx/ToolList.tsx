"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Search, Filter, X } from "lucide-react";
import Fuse from "fuse.js";
import { cn } from "@duyet/libs/utils";

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  rating: number;
  price?: string;
  url?: string;
}

export interface ToolListProps {
  tools: Tool[];
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showCategories?: boolean;
}

export function ToolList({ tools, className, showSearch = true, showFilters = true, showCategories = true }: ToolListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: "name" | "rating"; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });

  // Prepare data
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(tools.map(tool => tool.category)))];
  }, [tools]);

  const allTags = useMemo(() => {
    return Array.from(new Set(tools.flatMap(tool => tool.tags)));
  }, [tools]);

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tools, {
      keys: ["name", "description", "category", "tags"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [tools]);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let result = [...tools];

    // Search
    if (searchQuery) {
      result = fuse.search(searchQuery).map(r => r.item);
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Tag filter
    if (selectedTags.size > 0) {
      result = result.filter(tool =>
        Array.from(selectedTags).every(tag => tool.tags.includes(tag))
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tools, searchQuery, selectedCategory, selectedTags, sortConfig, fuse]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTags(new Set());
    setSortConfig({ key: "name", direction: "asc" });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600 bg-green-100";
    if (rating >= 3.5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Tool List</h2>

      {/* Controls */}
      {(showSearch || showFilters || showCategories) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-6">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name, description, or category..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4">
              {/* Categories */}
              {showCategories && (
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm transition-colors",
                          selectedCategory === category
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">Sort by:</span>
                <button
                  onClick={() => setSortConfig({ key: "name", direction: sortConfig.key === "name" && sortConfig.direction === "asc" ? "desc" : "asc" })}
                  className={cn(
                    "px-3 py-1 rounded text-sm border",
                    sortConfig.key === "name"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => setSortConfig({ key: "rating", direction: sortConfig.key === "rating" && sortConfig.direction === "asc" ? "desc" : "asc" })}
                  className={cn(
                    "px-3 py-1 rounded text-sm border",
                    sortConfig.key === "rating"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Rating {sortConfig.key === "rating" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </button>
                {(searchQuery || selectedCategory !== "all" || selectedTags.size > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filter by tags:</span>
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-colors border",
                    selectedTags.has(tag)
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.size > 0 && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="ml-2 text-xs text-purple-600 hover:text-purple-800"
                >
                  Clear tags
                </button>
              )}
            </div>
          )}

          {/* Active Filters Summary */}
          {(searchQuery || selectedCategory !== "all" || selectedTags.size > 0) && (
            <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
              Showing {filteredTools.length} of {tools.length} tools
              {searchQuery && ` | search: "${searchQuery}"`}
              {selectedCategory !== "all" && ` | category: ${selectedCategory}`}
              {selectedTags.size > 0 && ` | tags: ${Array.from(selectedTags).join(", ")}`}
            </div>
          )}
        </div>
      )}

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2">No tools found</div>
            <div className="text-sm text-gray-500">Try adjusting your filters or search query</div>
          </div>
        ) : (
          filteredTools.map(tool => (
            <div
              key={tool.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">{tool.name}</h3>
                <span className={cn("px-2 py-1 rounded text-xs font-bold", getRatingColor(tool.rating))}>
                  {tool.rating.toFixed(1)}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{tool.category}</span>
                {tool.price && (
                  <>
                    {" · "}
                    <span className="text-green-600 font-medium">{tool.price}</span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4 flex-1">{tool.description}</p>

              {tool.tags && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {tool.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      +{tool.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-auto"
                >
                  Visit Website
                  <span className="text-xs">↗</span>
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredTools.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {filteredTools.length} tool{filteredTools.length === 1 ? "" : "s"}
          {filteredTools.length !== tools.length && ` out of ${tools.length} total`}
        </div>
      )}
    </div>
  );
}