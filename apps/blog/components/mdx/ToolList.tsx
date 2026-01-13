import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, Star } from "lucide-react";
import fuzzysort from "fuzzysort";

interface Tool {
  name: string;
  category: string;
  description: string;
  rating: number;
  tags: string[];
  url?: string;
}

interface ToolListProps {
  tools: Tool[];
  title?: string;
  showFilters?: boolean;
}

export function ToolList({
  tools,
  title = "Tool List",
  showFilters = true,
}: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"rating" | "name">("rating");

  // Get unique categories and tags
  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return Array.from(cats).sort();
  }, [tools]);

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    tools.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tools]);

  // Filter and search
  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter((t) => t.tags.includes(selectedTag));
    }

    // Search with fuzzy sort
    if (searchTerm.trim()) {
      const results = fuzzysort.go(searchTerm, filtered, {
        keys: ["name", "description", "category", "tags"],
        threshold: -10000,
      });
      filtered = results.map((r) => r.obj);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortOrder === "rating") {
        return b.rating - a.rating;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedTag, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTag(null);
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== "all" || selectedTag !== null;

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* Search and Filters */}
      {showFilters && (
        <div className="space-y-3 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={14} className="text-gray-400" />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "rating" | "name")}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Tag Cloud */}
          {selectedTag && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Active tag:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex items-center gap-1 hover:bg-blue-200"
              >
                {selectedTag}
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {filteredTools.length} tool
        {filteredTools.length !== 1 ? "s" : ""} found
        {hasActiveFilters && " (filtered)"}
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{tool.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tool.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-current text-yellow-400" />
                  <span className="font-bold text-sm">{tool.rating}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {tool.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs px-2 py-0.5 rounded border ${
                      selectedTag === tag
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  Visit →
                </a>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-2xl mb-2">🔍</div>
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