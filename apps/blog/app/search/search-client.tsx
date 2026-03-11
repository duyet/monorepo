"use client";

import type { Post } from "@duyet/interfaces";
import { SearchBar, SearchResultItem } from "@/components/blog";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const DEFAULT_INITIAL_POST_COUNT = 20; // Balance between UX and initial render performance

export interface SearchClientProps {
  posts: Post[];
}

/**
 * Client component for search functionality.
 * Handles filtering and displaying search results based on URL params.
 */
export function SearchClient({ posts }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Memoize search terms to avoid recreating array on every render
  const searchTerms = useMemo(() => {
    return query.toLowerCase().split(/\s+/);
  }, [query]);

  // Memoize filtered posts for performance
  const filteredPosts = useMemo(() => {
    if (!query) {
      return posts.slice(0, DEFAULT_INITIAL_POST_COUNT);
    }

    return posts.filter((post) => {
      const searchText = [
        post.title,
        post.category,
        ...(post.tags || []),
        post.excerpt || "",
      ]
        .join(" ")
        .toLowerCase();

      // All search terms must match (AND logic)
      return searchTerms.every((term) => searchText.includes(term));
    });
  }, [posts, searchTerms]);

  // Sort by date descending (no need for spread - filteredPosts is already a new array)
  const sortedPosts = useMemo(() => {
    return filteredPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredPosts]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar placeholder="Search by title, category, or tags..." />

      <div className="flex flex-col gap-4">
        {query && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Found {sortedPosts.length}{" "}
            {sortedPosts.length === 1 ? "result" : "results"}
            {query && ` for "${query}"`}
          </p>
        )}

        {sortedPosts.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-500">
            No posts found. Try a different search term.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedPosts.map((post) => (
              <SearchResultItem key={post.slug} post={post} highlight={query} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
