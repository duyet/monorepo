import { getAllPosts } from "@duyet/libs/getPost";

export interface SeriesNavItem {
  slug: string;
  title: string;
  year: string;
  month: string;
}

/**
 * Get the previous and next posts in a series.
 *
 * Posts within a series are sorted by date (ascending).
 * The current post is excluded from the results.
 *
 * @param currentSlug - The slug of the current post (e.g., "2022/02/rust-builder-design-pattern")
 * @param seriesName - The name of the series (e.g., "Rust Design Patterns")
 * @returns Object with prev and next navigation items
 */
export function getSeriesNavigation(
  currentSlug: string,
  seriesName: string
): { prev: SeriesNavItem | null; next: SeriesNavItem | null } {
  // Get all posts with series information
  const allPosts = getAllPosts(["slug", "title", "date", "series"]);

  // Filter posts that belong to the same series
  const seriesPosts = allPosts.filter(
    (post) => post.series === seriesName
  );

  // Sort posts by date (ascending - oldest first)
  seriesPosts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Find the index of the current post
  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === `/${currentSlug}`
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // Parse slug into year/month/slug components
  const parseSlugComponents = (slug: string): SeriesNavItem => {
    const cleanSlug = slug.replace(/^\//, "").replace(/\.md$/, "");
    const parts = cleanSlug.split("/");
    return {
      slug: parts[2], // The actual post slug
      title: seriesPosts.find((p) => p.slug === slug)?.title || "",
      year: parts[0],
      month: parts[1],
    };
  };

  // Get previous post (earlier in the series)
  const prev =
    currentIndex > 0
      ? parseSlugComponents(seriesPosts[currentIndex - 1].slug)
      : null;

  // Get next post (later in the series)
  const next =
    currentIndex < seriesPosts.length - 1
      ? parseSlugComponents(seriesPosts[currentIndex + 1].slug)
      : null;

  return { prev, next };
}
