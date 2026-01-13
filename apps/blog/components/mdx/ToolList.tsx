import React, { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Tool {
  name: string;
  category: string;
  description: string;
  tags: string[];
  rating: number;
  url?: string;
}

interface ToolListProps {
  tools: Tool[];
  /**
   * Enable fuzzy search
   * @default true
   */
  enableFuzzySearch?: boolean;
  /**
   * Show categories filter
   * @default true
   */
  showCategories?: boolean;
}

/**
 * ToolList Component
 * Displays a filterable grid of tools with fuzzy search
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  enableFuzzySearch = true,
  showCategories = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredTools, setFilteredTools] = useState<Tool[]>(tools);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [tools]);

  // Fuzzy search implementation
  const fuzzyMatch = (text: string, pattern: string): boolean => {
    if (!enableFuzzySearch) {
      return text.toLowerCase().includes(pattern.toLowerCase());
    }

    const patternLower = pattern.toLowerCase();
    const textLower = text.toLowerCase();

    if (patternLower.length === 0) return true;

    // Exact match
    if (textLower.includes(patternLower)) return true;

    // Fuzzy match: pattern characters must appear in order
    let patternIndex = 0;
    for (let i = 0; i < textLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        patternIndex++;
        if (patternIndex === patternLower.length) return true;
      }
    }
    return false;
  };

  // Debounced filter function
  const filterTools = useDebouncedCallback(() => {
    let filtered = tools;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((tool) => {
        const searchText = `${tool.name} ${tool.description} ${tool.tags.join(" ")}`;
        return fuzzyMatch(searchText, searchTerm);
      });
    }

    setFilteredTools(filtered);
  }, 300);

  useEffect(() => {
    filterTools();
    return () => filterTools.cancel();
  }, [searchTerm, selectedCategory, tools, filterTools]);

  return (
    <div className="w-full mb-8">
      <h3 className="text-2xl font-bold mb-4">Tool List</h3>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tools... (fuzzy search enabled)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        {showCategories && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTools.length} of {tools.length} tools
        {searchTerm && ` for "${searchTerm}"`}
        {selectedCategory !== "all" && ` in ${selectedCategory}`}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool, index) => (
            <motion.div
              key={tool.name + index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg">{tool.name}</h4>
                <span className="text-yellow-500">{"★".repeat(Math.floor(tool.rating))}</span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {tool.category}
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

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
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No tools found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
};

// Motion component wrapper for Next.js SSR compatibility
const motion = {
  div: React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div ref={ref} {...props} />
  )),
};
