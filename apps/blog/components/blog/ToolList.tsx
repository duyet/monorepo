"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  Circle,
  Square,
  Triangle,
} from "lucide-react";
import type { ToolListProps, Tool, ToolStatus, ToolCategory } from "./types";

// Simple fuzzy search implementation
const fuzzySearch = (query: string, text: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase());
};

// Status badge configuration with shape and color
const statusConfig = {
  active: {
    label: "Active",
    bgColor: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-800 dark:text-green-200",
    shape: Circle,
    shapeAriaLabel: "circle",
  },
  testing: {
    label: "Testing",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-800 dark:text-blue-200",
    shape: Square,
    shapeAriaLabel: "square",
  },
  deprecated: {
    label: "Deprecated",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    shape: Triangle,
    shapeAriaLabel: "triangle",
  },
};

// Star rating component
const StarRating = ({ rating }: { rating: number | string }) => {
  const ratingNum =
    typeof rating === "string" ? Number.parseFloat(rating) : rating;
  const filledStars = Math.floor(ratingNum);
  const hasHalfStar = ratingNum % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < filledStars;
        const isHalf = i === filledStars && hasHalfStar;
        return (
          <Star
            key={i}
            size={14}
            className={`${
              isFilled || isHalf
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            aria-hidden="true"
          />
        );
      })}
      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
        {ratingNum.toFixed(1)}
      </span>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: ToolStatus }) => {
  const config = statusConfig[status];
  const ShapeIcon = config.shape;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <ShapeIcon size={12} aria-label={config.shapeAriaLabel} />
      <span>{config.label}</span>
    </div>
  );
};

// Tool card component
const ToolCard = ({ tool }: { tool: Tool }) => {
  return (
    <article
      className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-950 transition-shadow duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {tool.name}
          </h3>
        </div>
        <StatusBadge status={tool.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
          {tool.category}
        </span>
      </div>

      <StarRating rating={tool.rating} />

      {tool.notes && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {tool.notes}
        </p>
      )}

      {tool.dateAdded && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-auto">
          Added: {new Date(tool.dateAdded).toLocaleDateString()}
        </p>
      )}
    </article>
  );
};

export function ToolList({ tools, className = "" }: ToolListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ToolStatus | "all">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "date">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return Array.from(cats).sort();
  }, [tools]);

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    let result = tools;

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (tool) =>
          fuzzySearch(searchQuery, tool.name) ||
          fuzzySearch(searchQuery, tool.category) ||
          (tool.notes && fuzzySearch(searchQuery, tool.notes))
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter((tool) => tool.status === selectedStatus);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    // Sort
    const sorted = [...result];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      });
    }

    return sorted;
  }, [tools, searchQuery, selectedStatus, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTools.length / ITEMS_PER_PAGE);
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTools, currentPage]);

  // Reset to first page when filters change
  const handleFilterChange = useCallback((callback: () => void) => {
    callback();
    setCurrentPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSortBy("name");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery || selectedStatus !== "all" || selectedCategory !== "all";

  return (
    <section className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="mb-6">
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <input
            id="tool-search"
            type="text"
            placeholder="Search tools by name, category, or notes..."
            value={searchQuery}
            onChange={(e) =>
              handleFilterChange(() => setSearchQuery(e.target.value))
            }
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Search tools"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Status filters */}
        <button
          onClick={() => handleFilterChange(() => setSelectedStatus("all"))}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
          aria-pressed={selectedStatus === "all"}
          tabIndex={0}
        >
          All
        </button>

        <button
          onClick={() => handleFilterChange(() => setSelectedStatus("active"))}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedStatus === "active"
              ? "bg-green-500 text-white"
              : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
          }`}
          aria-pressed={selectedStatus === "active"}
          tabIndex={0}
        >
          <Circle size={14} aria-hidden="true" />
          Active
        </button>

        <button
          onClick={() => handleFilterChange(() => setSelectedStatus("testing"))}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedStatus === "testing"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
          }`}
          aria-pressed={selectedStatus === "testing"}
          tabIndex={0}
        >
          <Square size={14} aria-hidden="true" />
          Testing
        </button>

        <button
          onClick={() =>
            handleFilterChange(() => setSelectedStatus("deprecated"))
          }
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedStatus === "deprecated"
              ? "bg-gray-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          aria-pressed={selectedStatus === "deprecated"}
          tabIndex={0}
        >
          <Triangle size={14} aria-hidden="true" />
          Deprecated
        </button>
      </div>

      {/* Category and Sort Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-haspopup="listbox"
            aria-expanded={showCategoryDropdown}
            aria-label={`Category filter: ${selectedCategory === "all" ? "All Categories" : selectedCategory}`}
          >
            <Filter size={16} aria-hidden="true" />
            <span>
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showCategoryDropdown && (
            <div
              role="listbox"
              tabIndex={0}
              className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10"
            >
              <button
                onClick={() => {
                  handleFilterChange(() => setSelectedCategory("all"));
                  setShowCategoryDropdown(false);
                }}
                role="option"
                aria-selected={selectedCategory === "all"}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedCategory === "all"
                    ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleFilterChange(() => setSelectedCategory(cat));
                    setShowCategoryDropdown(false);
                  }}
                  role="option"
                  aria-selected={selectedCategory === cat}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedCategory === cat
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) =>
              handleFilterChange(() =>
                setSortBy(e.target.value as "name" | "rating" | "date")
              )
            }
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer appearance-none pr-8"
            aria-label="Sort tools by"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="date">Sort by Date Added</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Reset all filters"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing{" "}
        {paginatedTools.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
        -{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTools.length)}{" "}
        of {filteredAndSortedTools.length} tool
        {filteredAndSortedTools.length !== 1 ? "s" : ""}
      </div>

      {/* Tool Grid */}
      {paginatedTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedTools.map((tool, index) => (
            <ToolCard key={`${tool.name}-${index}`} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No tools found matching{" "}
            {searchQuery ? `'${searchQuery}'` : "your filters"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label={`Load more tools (Page ${currentPage + 1} of ${totalPages})`}
          >
            Load More ({currentPage} of {totalPages})
          </button>
        </div>
      )}

      {/* Pagination Summary */}
      {totalPages > 1 && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </section>
  );
}
