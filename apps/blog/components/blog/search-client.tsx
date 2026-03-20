import type { CategoryCount, Post, TagCount } from "@duyet/interfaces";
import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import type { SearchParams } from "@/src/routes/search";
import { SearchBar, SearchFilters, SearchResultItem } from "@/components/blog";

const DEFAULT_INITIAL_POST_COUNT = 20;

export interface SearchClientProps {
  posts: Post[];
  categories: CategoryCount;
  tags: TagCount;
}

/**
 * Client component for search functionality.
 * Handles filtering and displaying search results based on URL params.
 */
export function SearchClient({ posts, categories, tags }: SearchClientProps) {
  const search = useSearch({ from: "/search" });
  const query = search.q || "";
  const categoryFilter = search.category || "";

  // Memoize tagsFilter parsing to avoid splitting on every render
  const tagsFilter = useMemo(() => {
    return (search.tags || "").split(",").filter(Boolean);
  }, [search.tags]);

  const fromDate = search.from || "";
  const toDate = search.to || "";

  // Memoize search terms to avoid recreating array on every render
  const searchTerms = useMemo(() => {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
  }, [query]);

  // Parse date filters (parse once, normalize if valid)
  const fromDateObj = useMemo(() => {
    if (!fromDate) return null;
    const date = new Date(fromDate);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, [fromDate]);

  const toDateObj = useMemo(() => {
    if (!toDate) return null;
    const date = new Date(toDate);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
  }, [toDate]);

  // Check if any filters are active
  const hasFilters =
    query || categoryFilter || tagsFilter.length > 0 || fromDate || toDate;

  // Memoize filtered posts for performance
  const filteredPosts = useMemo(() => {
    if (
      !query &&
      !categoryFilter &&
      tagsFilter.length === 0 &&
      !fromDate &&
      !toDate
    ) {
      return posts.slice(0, DEFAULT_INITIAL_POST_COUNT);
    }

    return posts.filter((post) => {
      if (query) {
        const searchText = [
          post.title,
          post.category,
          ...(post.tags || []),
          post.excerpt || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchTerms.every((term) => searchText.includes(term))) {
          return false;
        }
      }

      if (categoryFilter && post.category !== categoryFilter) {
        return false;
      }

      if (
        tagsFilter.length > 0 &&
        !tagsFilter.every((tag) => post.tags.includes(tag))
      ) {
        return false;
      }

      if (fromDateObj && post.date < fromDateObj) {
        return false;
      }

      if (toDateObj && post.date > toDateObj) {
        return false;
      }

      return true;
    });
  }, [
    posts,
    searchTerms,
    query,
    categoryFilter,
    tagsFilter,
    fromDateObj,
    toDateObj,
    fromDate,
    toDate,
  ]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [filteredPosts]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:w-64 lg:flex-shrink-0">
        <SearchFilters categories={categories} tags={tags} />
      </aside>

      {/* Results Area */}
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar placeholder="Search by title, category, or tags..." />

        <div className="flex flex-col gap-4">
          {hasFilters && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Found {sortedPosts.length}{" "}
              {sortedPosts.length === 1 ? "result" : "results"}
              {query && ` for "${query}"`}
            </p>
          )}

          {sortedPosts.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 dark:text-neutral-500">
              {hasFilters
                ? "No posts found matching your filters. Try adjusting your search criteria."
                : "Start typing to search posts, or use the filters to browse."}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedPosts.map((post) => (
                <SearchResultItem
                  key={post.slug}
                  post={post}
                  highlight={query}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
