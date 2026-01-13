'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
}

interface ToolListProps {
  tools: Tool[];
  categories?: string[];
}

// Simple fuzzy search implementation
function fuzzyMatch(pattern: string, text: string): boolean {
  const p = pattern.toLowerCase();
  const t = text.toLowerCase();
  let pIdx = 0;

  for (let i = 0; i < t.length && pIdx < p.length; i++) {
    if (t[i] === p[pIdx]) pIdx++;
  }

  return pIdx === p.length;
}

export function ToolList({ tools, categories }: ToolListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const allCategories = categories || ['All', ...Array.from(new Set(tools.map(t => t.category)))];

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = search === '' ||
        fuzzyMatch(search, tool.name) ||
        fuzzyMatch(search, tool.description) ||
        tool.tags.some(tag => fuzzyMatch(search, tag));

      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tools, search, selectedCategory]);

  return (
    <div className="my-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tools (fuzzy matching)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredTools.map((tool, idx) => (
          <a
            key={idx}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-900 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                {tool.name}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {tool.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {tool.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* Filtered count */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Showing {filteredTools.length} of {tools.length} tools
        {search && (
          <span className="ml-2">
            • Filtered by "{search}"{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}