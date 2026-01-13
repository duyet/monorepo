import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";

interface Tool {
  name: string;
  description: string;
  category: string;
  url?: string;
  tags?: string[];
  icon?: string;
}

interface ToolListProps {
  tools: Tool[];
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
}

/**
 * Searchable, filterable tool directory with categories
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  title = "Tool Directory",
  showSearch = true,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Get unique categories and tags
  const categories = useMemo(() => {
    const cats = ["All", ...Array.from(new Set(tools.map((t) => t.category)))];
    return cats;
  }, [tools]);

  const tags = useMemo(() => {
    const allTags = tools.flatMap((t) => t.tags || []);
    return ["All", ...Array.from(new Set(allTags))];
  }, [tools]);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tools, {
      keys: ["name", "description", "category", "tags"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [tools]);

  // Filter and search
  const filteredTools = useMemo(() => {
    let filtered = tools;

    // Apply search
    if (searchTerm) {
      const results = fuse.search(searchTerm);
      filtered = results.map((result) => result.item);
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag !== "All") {
      filtered = filtered.filter((t) => t.tags?.includes(selectedTag));
    }

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedTag, fuse]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedTag("All");
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <h3 className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          ({filteredTools.length} of {tools.length} tools)
        </span>
      </h3>

      {/* Controls */}
      {(showSearch || showFilters) && (
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {showSearch && (
            <input
              type="text"
              placeholder="Search tools by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              {(searchTerm || selectedCategory !== "All" || selectedTag !== "All") && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tools list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTools.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No tools found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTools.map((tool, index) => (
            <div
              key={index}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {tool.icon && (
                      <span className="text-xl">{tool.icon}</span>
                    )}
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {tool.name}
                    </h4>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {tool.description}
                  </p>
                  {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline self-center"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary stats */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
        <span>
          Showing {filteredTools.length} tools
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {selectedTag !== "All" && ` tagged ${selectedTag}`}
        </span>
        {searchTerm && (
          <span>Searching: "{searchTerm}"</span>
        )}
      </div>
    </div>
  );
};

// Example usage component
export const ToolListExample: React.FC = () => {
  const exampleTools: Tool[] = [
    {
      name: "Next.js",
      description: "React framework for production with SSR, SSG, and ISR capabilities",
      category: "Framework",
      url: "https://nextjs.org",
      tags: ["react", "ssr", "typescript", "vercel"],
      icon: "⚡",
    },
    {
      name: "Astro",
      description: "All-in-one web framework for fast content-driven websites",
      category: "Framework",
      url: "https://astro.build",
      tags: ["static", "islands", "performance"],
      icon: "🚀",
    },
    {
      name: "Vite",
      description: "Next Generation Frontend Tooling with instant HMR",
      category: "Build Tool",
      url: "https://vitejs.dev",
      tags: ["dev-server", "hmr", "esbuild"],
      icon: "⚡",
    },
    {
      name: "Turborepo",
      description: "High-performance build system for JavaScript and TypeScript codebases",
      category: "Build Tool",
      url: "https://turbo.build",
      tags: ["monorepo", "cache", "workspace"],
      icon: "📦",
    },
    {
      name: "PostgreSQL",
      description: "Powerful, open-source object-relational database system",
      category: "Database",
      url: "https://postgresql.org",
      tags: ["sql", "relational", "production"],
      icon: "🗄️",
    },
    {
      name: "Redis",
      description: "In-memory data structure store, used as cache, message broker, and more",
      category: "Database",
      url: "https://redis.io",
      tags: ["cache", "in-memory", "pub-sub"],
      icon: "⚡",
    },
    {
      name: "Playwright",
      description: "End-to-end testing framework for modern web apps",
      category: "Testing",
      url: "https://playwright.dev",
      tags: ["e2e", "automation", "browser"],
      icon: "🎭",
    },
    {
      name: "Vitest",
      description: "Blazing fast unit test framework with Vite architecture",
      category: "Testing",
      url: "https://vitest.dev",
      tags: ["unit-test", "vite", "coverage"],
      icon: "🧪",
    },
  ];

  return <ToolList tools={exampleTools} title="Example Tool Directory" />;
};