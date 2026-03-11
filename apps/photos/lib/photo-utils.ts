/**
 * Client-safe utility functions for filtering and sorting photos
 * These functions don't import any Node.js-only modules
 */

import type { Photo } from "./types";

export type SortOption = "newest" | "oldest" | "liked" | "viewed";

/**
 * Sort photos by specified criteria
 */
export function sortPhotos(photos: Photo[], sortBy: SortOption): Photo[] {
  const sorted = [...photos];

  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
        return dateB - dateA; // Descending
      });

    case "oldest":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
        return dateA - dateB; // Ascending
      });

    case "liked":
      return sorted.sort((a, b) => {
        const likesA = a.likes ?? 0;
        const likesB = b.likes ?? 0;
        return likesB - likesA; // Descending
      });

    case "viewed":
      return sorted.sort((a, b) => {
        const viewsA = a.stats?.views ?? 0;
        const viewsB = b.stats?.views ?? 0;
        return viewsB - viewsA; // Descending
      });

    default:
      return sorted;
  }
}

/**
 * Filter photos by search query
 * Searches across description, alt_description, and tags
 */
export function filterPhotos(photos: Photo[], query: string): Photo[] {
  if (!query.trim()) {
    return photos;
  }

  const searchTerms = query.toLowerCase().split(/\s+/);

  return photos.filter((photo) => {
    const searchText = [
      photo.description || "",
      photo.alt_description || "",
      ...(photo.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    // All search terms must match (AND logic)
    return searchTerms.every((term) => searchText.includes(term));
  });
}

/**
 * Get photos by year
 */
export function getPhotosByYear(photos: Photo[], year: string): Photo[] {
  return photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString();
    return photoYear === year;
  });
}

/**
 * Group photos by year
 */
export function groupPhotosByYear(photos: Photo[]): {
  [year: string]: Photo[];
} {
  return photos.reduce((acc: { [year: string]: Photo[] }, photo) => {
    const year = new Date(photo.created_at).getFullYear().toString();

    if (!acc[year]) {
      acc[year] = [];
    }

    acc[year].push(photo);
    return acc;
  }, {});
}
