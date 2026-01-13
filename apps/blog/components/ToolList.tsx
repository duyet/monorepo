"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import Fuse from "fuse.js";

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  url?: string;
  icon?: string;
  rating?: number;
}

interface ToolListProps {
  tools: Tool[];
  className?: string;
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
}

export function ToolList({ tools, className, title, showFilters = true, showSearch = true }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"rating" | "name" | "category">("name");

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tools, {
      keys: ["name", "description", "category", "tags"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [tools]);

  // Get unique categories and tags
  const categories = useMemo(() => {
    return ["all", ...new Set(tools.map(t => t.category))];
  }, [tools]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tools.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tools]);

  // Filter and search tools
  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Search
    if (searchTerm.trim()) {
      const results = fuse.search(searchTerm.trim());
      filtered = results.map(r => r.item);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t =>
        selectedTags.every(tag => t.tags.includes(tag))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortOrder === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      } else if (sortOrder === "category") {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedTags, sortOrder, fuse]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTags([]);
    setSearchTerm("");
  };

  const totalTools = filteredTools.length;

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 mb-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Tags:</span>
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Sort Options */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Sort by:</span>
            {(["name", "rating", "category"] as const).map(order => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  sortOrder === order
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {order === "rating" ? "Rating" : order === "category" ? "Category" : "Name"}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== "all" || selectedTags.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-3">
        Found {totalTools} tool{totalTools !== 1 ? "s" : ""}
        {totalTools !== tools.length && ` (of ${tools.length})`}
      </div>

      {/* Tools Grid */}
      {totalTools === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tools match your search criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{tool.name}</h4>
                  {tool.rating !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">{tool.rating}/5</span>
                    </div>
                  )}
                </div>
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Visit →
                  </a>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {tool.category}
                </span>
                {tool.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {tool.icon && (
                <div className="text-xs text-gray-400">
                  Icon: {tool.icon}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State Suggestions */}
      {totalTools === 0 && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Suggestions:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Clear search filters</li>
            <li>Try different search terms</li>
            <li>Remove some tag filters</li>
          </ul>
        </div>
      )}
    </div>
  );
}