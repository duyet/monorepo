import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";

interface Tool {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  url?: string;
}

interface ToolListProps {
  title: string;
  tools: Tool[];
  enableSearch?: boolean;
  enableFilter?: boolean;
}

/**
 * ToolList - Filterable grid with fuzzy search
 */
export const ToolList: React.FC<ToolListProps> = ({
  title,
  tools,
  enableSearch = true,
  enableFilter = true
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(tools.map(tool => tool.category))].sort();
  }, [tools]);

  // Setup fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tools, {
      keys: ["name", "description", "category", "tags"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [tools]);

  // Filter tools
  const filteredTools = useMemo(() => {
    let results = tools;

    // Apply search
    if (enableSearch && searchTerm.trim()) {
      results = fuse.search(searchTerm).map(result => result.item);
    }

    // Apply category filter
    if (enableFilter && selectedCategories.length > 0) {
      results = results.filter(tool => selectedCategories.includes(tool.category));
    }

    return results;
  }, [tools, fuse, searchTerm, selectedCategories, enableSearch, enableFilter]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      {/* Controls */}
      {(enableSearch || enableFilter) && (
        <div className="mb-4 space-y-3">
          {enableSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools (fuzzy search)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {enableFilter && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by category:</span>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
              {(selectedCategories.length > 0 || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-700 ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTools.length} of {tools.length} tools
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg">
                {tool.url ? (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-500"
                  >
                    {tool.name} →
                  </a>
                ) : (
                  tool.name
                )}
              </h4>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {tool.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {tool.description}
            </p>

            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tool.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No tools found matching your criteria.</p>
          {(searchTerm || selectedCategories.length > 0) && (
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-500 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolList;