import { useState, useMemo, ChangeEvent } from "react";
import { Search, X } from "lucide-react";

export interface Tool {
  name: string;
  category: string;
  description: string;
  stars?: number;
  tags?: string[];
  url?: string;
}

interface ToolListProps {
  tools: Tool[];
  filterable?: boolean;
  searchable?: boolean;
  showCategories?: boolean;
}

interface FilterState {
  searchTerm: string;
  category: string;
  minStars: number;
}

export function ToolList({
  tools,
  filterable = true,
  searchable = true,
  showCategories = true
}: ToolListProps) {
  const [filter, setFilter] = useState<FilterState>({
    searchTerm: "",
    category: "all",
    minStars: 0,
  });

  const categories = useMemo(() => {
    return ["all", ...new Set(tools.map(t => t.category))];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = filter.searchTerm === "" ||
        tool.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        (tool.tags?.some(tag => tag.toLowerCase().includes(filter.searchTerm.toLowerCase())) ?? false);

      const matchesCategory = filter.category === "all" || tool.category === filter.category;
      const matchesStars = (tool.stars ?? 0) >= filter.minStars;

      return matchesSearch && matchesCategory && matchesStars;
    });
  }, [tools, filter]);

  const clearFilters = () => {
    setFilter({ searchTerm: "", category: "all", minStars: 0 });
  };

  const hasActiveFilters = filter.searchTerm || filter.category !== "all" || filter.minStars > 0;

  return (
    <div className="my-6">
      {/* Filters */}
      {filterable && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            {searchable && (
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={filter.searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFilter(prev => ({ ...prev, searchTerm: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filter.searchTerm && (
                  <button
                    onClick={() => setFilter(prev => ({ ...prev, searchTerm: "" }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Category filter */}
            {showCategories && (
              <select
                value={filter.category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilter(prev => ({ ...prev, category: e.target.value }))
                }
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            )}

            {/* Stars filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Min Stars:</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filter.minStars}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilter(prev => ({ ...prev, minStars: parseFloat(e.target.value) }))
                }
                className="w-24"
              />
              <span className="text-sm font-semibold">{filter.minStars}</span>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
        {hasActiveFilters && " (with filters)"}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool, index) => (
          <ToolCard key={index} tool={tool} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No tools match your filters. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-lg">{tool.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{tool.category}</div>
        </div>
        {tool.stars !== undefined && (
          <div className="text-yellow-500 font-semibold">{'★'.repeat(Math.floor(tool.stars))}{tool.stars % 1 >= 0.5 ? '½' : ''}</div>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {tool.description}
      </p>

      {tool.tags && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {tool.url && (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block"
        >
          Visit →
        </a>
      )}
    </div>
  );
}

// Fuzzy search wrapper component
export function FuzzyToolList({ tools, ...props }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Simple fuzzy matching - checks if letters appear in order
  const fuzzyMatch = (text: string, search: string) => {
    const searchLower = search.toLowerCase().replace(/\s+/g, '');
    const textLower = text.toLowerCase().replace(/\s+/g, '');

    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  };

  const filteredTools = tools.filter(tool => {
    if (!searchTerm) return true;
    const combinedText = `${tool.name} ${tool.description} ${tool.category} ${(tool.tags || []).join(' ')}`;
    return fuzzyMatch(combinedText, searchTerm);
  });

  return (
    <div className="my-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Fuzzy search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool, index) => (
          <ToolCard key={index} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No tools found for “{searchTerm}”
        </div>
      )}
    </div>
  );
}