import React, { useState, useMemo } from 'react';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  website?: string;
}

export interface ToolListProps {
  tools: ToolItem[];
  title?: string;
  categories?: string[];
}

/**
 * Fuzzy search function - simple implementation
 */
const fuzzyMatch = (pattern: string, text: string): boolean => {
  const lowerPattern = pattern.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match
  if (lowerText.includes(lowerPattern)) return true;

  // Fuzzy match - check if pattern chars exist in order
  let patternIdx = 0;
  for (let i = 0; i < lowerText.length && patternIdx < lowerPattern.length; i++) {
    if (lowerText[i] === lowerPattern[patternIdx]) {
      patternIdx++;
    }
  }
  return patternIdx === lowerPattern.length;
};

/**
 * ToolList - Filterable grid with fuzzy search
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  title = 'Tool List',
  categories: propCategories,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get unique categories
  const categories = propCategories || Array.from(new Set(tools.map(t => t.category)));

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tools.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tools]);

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Search filter (fuzzy)
      const searchMatch = !searchTerm ||
        fuzzyMatch(searchTerm, tool.name) ||
        fuzzyMatch(searchTerm, tool.description) ||
        fuzzyMatch(searchTerm, tool.tags.join(' '));

      // Category filter
      const categoryMatch = selectedCategory === 'all' || tool.category === selectedCategory;

      // Tag filter
      const tagMatch = selectedTags.size === 0 ||
        tool.tags.some(tag => selectedTags.has(tag));

      return searchMatch && categoryMatch && tagMatch;
    });
  }, [tools, searchTerm, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags(new Set());
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      {/* Controls */}
      <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg">
        {/* Search */}
        <input
          type="text"
          placeholder="Search tools (fuzzy search enabled)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded text-sm ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({tools.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat} ({tools.filter(t => t.category === cat).length})
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Filter by tags:</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded text-xs ${
                    selectedTags.has(tag)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.size > 0 && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Clear tags
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clear all button */}
        {(searchTerm || selectedCategory !== 'all' || selectedTags.size > 0) && (
          <button
            onClick={clearFilters}
            className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-600 mb-3">
        Showing {filteredTools.length} of {tools.length} tools
        {searchTerm && ` | Search: "${searchTerm}"`}
        {selectedCategory !== 'all' && ` | Category: ${selectedCategory}`}
        {selectedTags.size > 0 && ` | Tags: ${Array.from(selectedTags).join(', ')}`}
      </div>

      {/* Tool grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tools match your filters. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{tool.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tool.category}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{tool.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {tool.website && (
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Search uses fuzzy matching. Type partial names or descriptions to find tools.
      </p>
    </div>
  );
};