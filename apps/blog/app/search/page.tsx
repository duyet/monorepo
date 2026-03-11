import Container from "@duyet/components/Container";
import { getAllPosts } from "@duyet/libs/getPost";
import { SearchClient } from "./search-client";
import type { Metadata } from "next";

// Static generation for search page
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Search",
  description: "Search blog posts by title and content.",
};

/**
 * Search page with client-side filtering.
 *
 * Posts are fetched at build time and filtered on the client side.
 * Search query is stored in URL params for shareability.
 */
export default function SearchPage() {
  // Fetch all posts with necessary fields for search
  const allPosts = getAllPosts(
    ["slug", "title", "date", "category", "featured", "excerpt", "tags"],
    10000
  );

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="mb-4 font-serif text-5xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-6xl md:mb-6 md:text-7xl">
            Search
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Search through {allPosts.length} blog posts by title, category, or
            tags.
          </p>
        </div>

        <SearchClient posts={allPosts} />
      </div>
    </Container>
  );
}
