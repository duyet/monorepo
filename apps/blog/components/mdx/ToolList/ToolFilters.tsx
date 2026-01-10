// Filter chips and dropdowns for tools
import { Circle, Square, Triangle, Filter, ChevronDown } from "lucide-react";
import type { ToolStatus, ToolCategory } from "../../blog/types";

interface ToolFiltersProps {
  // Status filter
  selectedStatus: ToolStatus | "all";
  onStatusChange: (status: ToolStatus | "all") => void;

  // Category filter
  selectedCategory: ToolCategory | "all";
  onCategoryChange: (category: ToolCategory | "all") => void;
  categories: ToolCategory[];
  showCategoryDropdown: boolean;
  onToggleCategoryDropdown: (show: boolean) => void;

  // Sort
  sortBy: "name" | "rating" | "date";
  onSortChange: (sort: "name" | "rating" | "date") => void;

  // Reset
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function ToolFilters({
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showCategoryDropdown,
  onToggleCategoryDropdown,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onReset,
}: ToolFiltersProps) {
  return (
    <>
      {/* Status filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange("all")}
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
          onClick={() => onStatusChange("active")}
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
          onClick={() => onStatusChange("testing")}
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
          onClick={() => onStatusChange("deprecated")}
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
            onClick={() => onToggleCategoryDropdown(!showCategoryDropdown)}
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
                  onCategoryChange("all");
                  onToggleCategoryDropdown(false);
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
                    onCategoryChange(cat);
                    onToggleCategoryDropdown(false);
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
              onSortChange(e.target.value as "name" | "rating" | "date")
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
            onClick={onReset}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Reset all filters"
          >
            Reset
          </button>
        )}
      </div>
    </>
  );
}
