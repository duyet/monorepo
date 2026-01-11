// Custom hook for tool filtering, sorting, and pagination logic
import { useState, useMemo, useCallback } from "react";
import type { Tool, ToolStatus, ToolCategory } from "../../blog/types";

type SortBy = "name" | "rating" | "date";

interface UseToolFilteringOptions {
  tools: Tool[];
  itemsPerPage?: number;
}

interface UseToolFilteringReturn {
  // State
  searchQuery: string;
  selectedStatus: ToolStatus | "all";
  selectedCategory: ToolCategory | "all";
  sortBy: SortBy;
  currentPage: number;
  showCategoryDropdown: boolean;

  // Computed
  categories: ToolCategory[];
  filteredAndSortedTools: Tool[];
  paginatedTools: Tool[];
  totalPages: number;
  hasActiveFilters: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: ToolStatus | "all") => void;
  setSelectedCategory: (category: ToolCategory | "all") => void;
  setSortBy: (sort: SortBy) => void;
  setCurrentPage: (page: number) => void;
  setShowCategoryDropdown: (show: boolean) => void;
  handleFilterChange: (callback: () => void) => void;
  handleLoadMore: () => void;
  handleReset: () => void;
}

// Simple fuzzy search implementation
const fuzzySearch = (query: string, text: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase());
};

export function useToolFiltering({
  tools,
  itemsPerPage = 20,
}: UseToolFilteringOptions): UseToolFilteringReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ToolStatus | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return Array.from(cats).sort() as ToolCategory[];
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
  const totalPages = Math.ceil(filteredAndSortedTools.length / itemsPerPage);
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTools.slice(start, start + itemsPerPage);
  }, [filteredAndSortedTools, currentPage, itemsPerPage]);

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
    searchQuery !== "" || selectedStatus !== "all" || selectedCategory !== "all";

  return {
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
    setCurrentPage,
    setShowCategoryDropdown,
    handleFilterChange,
    handleLoadMore,
    handleReset,
  };
}
