import React, { useState, useMemo } from "react";
import { cn } from "@duyet/libs/utils";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  icon?: string;
  featured?: boolean;
}

export interface ToolListProps {
  tools: Tool[];
  className?: string;
}

const FILTER_CATEGORIES = ["All", "Development", "Design", "Productivity", "Utilities"];

export function ToolList({ tools, className }: ToolListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "category">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = tools.filter((tool) => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort tools
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [tools, searchQuery, selectedCategory, sortBy, sortDirection]);

  const featuredTools = tools.filter((tool) => tool.featured);
  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  // Simple fuzzy search implementation
  const fuzzyMatch = (query: string, text: string) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    let queryIndex = 0;
    let textIndex = 0;

    while (queryIndex < query.length && textIndex < text.length) {
      if (query[queryIndex] === text[textIndex]) {
        queryIndex++;
      }
      textIndex++;
    }

    return queryIndex === query.length;
  };

  const fuzzySearchResults = useMemo(() => {
    if (!searchQuery) return filteredTools;

    const exactMatches = filteredTools.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    const fuzzyMatches = filteredTools.filter((tool) => {
      if (exactMatches.includes(tool)) return false;
      return (
        fuzzyMatch(searchQuery, tool.name) ||
        fuzzyMatch(searchQuery, tool.description) ||
        tool.tags.some((tag) => fuzzyMatch(searchQuery, tag))
      );
    });

    return [...exactMatches, ...fuzzyMatches];
  }, [filteredTools, searchQuery]);

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tool List</h2>
        <p className="text-muted-foreground">
          Browse and search through development tools and resources
        </p>
      </div>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Featured Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} featured />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools by name, description, or tags..."
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">
                🔍
              </span>
              {searchQuery && (
                <button
                  className="absolute right-10 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              className="px-3 py-2 border rounded-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {FILTER_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="category">Sort by Category</option>
            </select>

            <button
              className="px-3 py-2 border rounded-lg hover:bg-muted"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Search Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {fuzzySearchResults.length} of {tools.length} tools
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fuzzySearchResults.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* No Results */}
        {fuzzySearchResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🔍</div>
            <p>No tools found matching your search criteria.</p>
            <p className="text-sm mt-2">Try different keywords or clear the search filter.</p>
          </div>
        )}
      </div>

      {/* Categories List */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-3 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  featured?: boolean;
}

function ToolCard({ tool, featured }: ToolCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all hover:shadow-md",
        featured && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl">
            {tool.icon || "🔧"}
          </div>
          <div>
            <h3 className="font-semibold">{tool.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-sm">⭐ {tool.rating}/5</span>
              {featured && (
                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        {tool.description}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {tool.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
            {tag}
          </span>
        ))}
        {tool.tags.length > 3 && (
          <span className="px-2 py-1 bg-muted rounded text-xs">
            +{tool.tags.length - 3} more
          </span>
        )}
      </div>

      <button
        className="w-full mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-sm font-medium"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      {showDetails && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="text-sm">
            <span className="font-medium">Category:</span> {tool.category}
          </div>
          <div className="text-sm">
            <span className="font-medium">Tags:</span> {tool.tags.join(", ")}
          </div>
          <div className="text-sm">
            <span className="font-medium">Rating:</span> {tool.rating}/5 stars
          </div>
        </div>
      )}
    </div>
  );
}