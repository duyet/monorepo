"use client";

// Main ToolList component - refactored into smaller subcomponents
import type { ToolListProps } from "../../blog/types";
import { useToolFiltering } from "./useToolFiltering";
import { ToolSearch } from "./ToolSearch";
import { ToolFilters } from "./ToolFilters";
import { ToolCard } from "./ToolCard";

export function ToolList({ tools, className = "" }: ToolListProps) {
  const {
    // State
    searchQuery,
    selectedStatus,
    selectedCategory,
    sortBy,
    currentPage,
    showCategoryDropdown,

    // Computed
    categories,
    filteredAndSortedTools,
    paginatedTools,
    totalPages,
    hasActiveFilters,

    // Actions
    setSearchQuery,
    setSelectedStatus,
    setSelectedCategory,
    setSortBy,
    setShowCategoryDropdown,
    handleFilterChange,
    handleLoadMore,
    handleReset,
  } = useToolFiltering({ tools, itemsPerPage: 20 });

  return (
    <section className={`w-full ${className}`}>
      {/* Search Bar */}
      <ToolSearch
        value={searchQuery}
        onChange={(value) => handleFilterChange(() => setSearchQuery(value))}
      />

      {/* Filter Chips */}
      <ToolFilters
        selectedStatus={selectedStatus}
        onStatusChange={(status) =>
          handleFilterChange(() => setSelectedStatus(status))
        }
        selectedCategory={selectedCategory}
        onCategoryChange={(category) =>
          handleFilterChange(() => setSelectedCategory(category))
        }
        categories={categories}
        showCategoryDropdown={showCategoryDropdown}
        onToggleCategoryDropdown={setShowCategoryDropdown}
        sortBy={sortBy}
        onSortChange={(sort) => handleFilterChange(() => setSortBy(sort))}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
      />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing{" "}
        {paginatedTools.length > 0 ? (currentPage - 1) * 20 + 1 : 0}-
        {Math.min(currentPage * 20, filteredAndSortedTools.length)} of{" "}
        {filteredAndSortedTools.length} tool
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
