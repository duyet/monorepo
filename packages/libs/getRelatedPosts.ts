import type { Post } from "@duyet/interfaces";
import { getAllPosts } from "./getPost";

interface RelatedPostScore {
  post: Post;
  score: number;
}

/**
 * Get related posts based on tags, category, and recency
 *
 * Scoring system:
 * - Matching tag: +2 points per tag
 * - Matching category: +3 points
 * - Recent posts (within 6 months): +1 point
 *
 * @param currentPost - The current post to find related posts for
 * @param limit - Maximum number of related posts to return (default: 5)
 * @param fields - Fields to include in returned posts
 * @returns Array of related posts, sorted by relevance score
 */
export function getRelatedPosts(
  currentPost: Post,
  limit = 5,
  fields: string[] = ["slug", "title", "date", "excerpt", "category", "tags"]
): Post[] {
  const allPosts = getAllPosts(
    ["slug", "title", "date", "excerpt", "category", "category_slug", "tags", "tags_slug"],
    0
  );

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Calculate relevance scores
  const scoredPosts: RelatedPostScore[] = allPosts
    .filter((post) => post.slug !== currentPost.slug) // Exclude current post
    .map((post) => {
      let score = 0;

      // Category match (high weight)
      if (
        post.category_slug === currentPost.category_slug ||
        post.category === currentPost.category
      ) {
        score += 3;
      }

      // Tag matches (medium weight per tag)
      const matchingTags = post.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      );
      score += matchingTags.length * 2;

      // Recency bonus
      if (post.date >= sixMonthsAgo) {
        score += 1;
      }

      return { post, score };
    })
    .filter((item) => item.score > 0); // Only include posts with at least one match

  // Sort by score (descending), then by date (descending for ties)
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.post.date.getTime() - a.post.date.getTime();
  });

  // Return top N posts with only requested fields
  return scoredPosts
    .slice(0, limit)
    .map(({ post }) => {
      const filteredPost: Partial<Post> = {};
      fields.forEach((field) => {
        if (field in post) {
          (filteredPost as Record<string, unknown>)[field] = (post as Record<string, unknown>)[field];
        }
      });
      return filteredPost as Post;
    });
}
