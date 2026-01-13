"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search, ExternalLink, Star } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  link?: string;
  rating?: number;
  featured?: boolean;
}

interface ToolListProps {
  tools: Tool[];
  categories?: string[];
}

const ToolList = ({ tools, categories = [] }: ToolListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "featured">("name");

  // Get all unique categories if not provided
  const allCategories = useMemo(() => {
    const categoryMap = new Map<string, boolean>();
    tools.forEach(tool => categoryMap.set(tool.category, true));
    return Array.from(categoryMap.keys()).sort();
  }, [tools]);

  const availableCategories = categories.length > 0 ? categories : allCategories;

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let result = tools;

    // Filter by search query
    if (searchQuery) {
      const fuse = new Fuse(result, {
        keys: ["name", "description", "tags"],
        threshold: 0.3,
      });
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map(item => item.item);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Sort results
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [tools, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="my-8">
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3 py-1 text-sm rounded-full border",
              selectedCategory === "all"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            All ({tools.length})
          </button>
          {availableCategories.map((category) => {
            const count = tools.filter(tool => tool.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full border",
                  selectedCategory === category
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("name")}
            className={cn(
              "px-3 py-1 text-sm rounded border",
              sortBy === "name"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Sort by Name
          </button>
          <button
            onClick={() => setSortBy("rating")}
            className={cn(
              "px-3 py-1 text-sm rounded border",
              sortBy === "rating"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Sort by Rating
          </button>
          <button
            onClick={() => setSortBy("featured")}
            className={cn(
              "px-3 py-1 text-sm rounded border",
              sortBy === "featured"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Featured First
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tools found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{tool.name}</h3>
                {tool.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {tool.category}
                </span>
                {tool.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tool.rating}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tool.description}
              </p>

              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {tool.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{tool.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {tool.link && (
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit website
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Showing {filteredTools.length} of {tools.length} tools
      </div>
    </div>
  );
};

export default ToolList;