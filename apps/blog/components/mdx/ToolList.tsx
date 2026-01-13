"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search, ExternalLink, Github, Star, Download } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
  github?: string;
  npm?: string;
  downloads?: number;
  stars?: number;
  featured?: boolean;
}

interface ToolListProps {
  tools: Tool[];
  title?: string;
  description?: string;
  showFilters?: boolean;
  showSearch?: boolean;
}

const categories = [
  "All",
  "Development",
  "Design",
  "Utilities",
  "Deployment",
  "Analytics",
];

export function ToolList({
  tools,
  title,
  description,
  showFilters = true,
  showSearch = true,
}: ToolListProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "downloads" | "stars">("name");

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    const filtered = tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return (b.downloads || 0) - (a.downloads || 0);
        case "stars":
          return (b.stars || 0) - (a.stars || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [tools, selectedCategory, searchQuery, sortBy]);

  const _fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ["name", "description", "tags"],
        threshold: 0.3,
      }),
    [tools]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-4">
        {showSearch && (
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {showFilters && (
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Sort options */}
        <div className="flex justify-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex space-x-2">
            {(["name", "downloads", "stars"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border p-6 ${
              tool.featured ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {tool.featured && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Featured
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{tool.name}</h3>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tool.category}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {tool.tags.length > 3 && (
                  <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                    +{tool.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                {tool.downloads && (
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{tool.downloads.toLocaleString()}</span>
                  </div>
                )}
                {tool.stars && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{tool.stars.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit</span>
                  </a>
                )}
                {tool.github && (
                  <a
                    href={tool.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1 bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {tool.npm && (
                  <a
                    href={tool.npm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    <span>NPM</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No tools found matching your criteria.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-600 mt-8">
        <p>
          Showing {filteredTools.length} of {tools.length} tools
        </p>
        {searchQuery && (
          <p className="mt-1">
            Search results for:{" "}
            <span className="font-medium">"{searchQuery}"</span>
          </p>
        )}
      </div>
    </div>
  );
}
